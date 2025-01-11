const puppeteer = require('puppeteer');

async function payUncleDuckysTent(startDate, endDate, numAdults, numKids, paymentInfo) {
  const responseData = {
    base_price: 0,
    tax: 0,
    total: 0,
    payment_successful: false,
  };
  // Check if total number of people exceeds 5
  if (parseInt(numAdults) + parseInt(numKids) > 5) {
    console.log("Too many guests.");
    return responseData;
  }

  // Check if start date is valid
  const startDateObj = new Date(startDate);
  if (startDateObj < new Date("2025-05-23")) {
    console.log("Booking is not available before May 23, 2025.");
    return responseData;
  }

  const startDateFormatted = startDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const endDateFormatted = new Date(endDate).toISOString().split('T')[0]; // YYYY-MM-DD

  const url = `https://paddlersvillage.checkfront.com/reserve/?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_id=14`;

  try {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // const unavailable = await page.$x("//p[contains(@class, 'cf-info')]//b[contains(text(), 'Nothing available for the dates selected.')]");
    // if (unavailable.length > 0) {
    //   await browser.close();
    //   return { success: false, message: "No availability for the selected dates." };
    // }
    const unavailableElement = await page.$("p.cf-info b");
    if (unavailableElement) {
    const unavailableText = await page.evaluate(el => el.innerText, unavailableElement);
    if (unavailableText.includes("Nothing available for the dates selected.")) {
        console.log("No availability for the selected dates.");
        await browser.close();
        return responseData;
    }
    }

    const firstOption = await page.$('.cf-item-data');
    if (!firstOption) {
      console.log("No available tent options.");
      await browser.close();
      return responseData;
    }

    const priceElement = await firstOption.$(".cf-price strong");
    if (priceElement) {
        const bookButton = await firstOption.$('.cf-btn-book');  // Get the book button element
        if (bookButton) {
          await bookButton.click();  // Click the button if it exists
        } else {
          console.log("Book button not found");
          await browser.close();
          return responseData;
        }

      await page.waitForSelector('.modal-content', { timeout: 10000 });
      await page.waitForSelector('#sub_btn', { visible: true });
      await page.click('#sub_btn');

      await page.waitForSelector('#cf-form', { timeout: 10000 });
      await page.type('#customer_name', `${paymentInfo.first_name} ${paymentInfo.last_name}`);
      await page.type('#customer_email', paymentInfo.email);

      await page.waitForSelector('#customer_phone', { visible: true, timeout: 10000 });

      await page.click('#customer_phone');

      const fullPhoneNumber = `+1${paymentInfo.phone_number}`;  // US-based number
      await page.type('#customer_phone', fullPhoneNumber, { delay: 100 });  // Simulates slow typing

      await page.click('.selected-flag');  // Open the country selector
      await page.click('.country[data-country-code="us"]');  // Select the United States (if required)

      const phoneValue = await page.$eval('#customer_phone', el => el.value);
      console.log('Phone value after input:', phoneValue);

      await page.click('.btn-checkbox'); // Terms and conditions checkbox
      await page.click('#continue');

    //   await page.waitForSelector("#card-name", { timeout: 10000 });
    //   await page.type("#card-name", paymentInfo.cardholder_name);

      const cardNumberIframeElement = await page.waitForSelector('#card-number iframe', { timeout: 10000 });
      const cardNumberFrame = await cardNumberIframeElement.contentFrame();

      if (!cardNumberFrame) {
        throw new Error("Unable to switch to card number iframe.");
      }

      console.log("Switched to iframe. Waiting for card number input...");

    // Ensure the input is present and interactable
      await cardNumberFrame.waitForSelector('input[name="cardnumber"]', { visible: true, timeout: 10000 });
      await cardNumberFrame.type('input[name="cardnumber"]', paymentInfo.card_number);
      console.log("Card number entered successfully.");

      const expiryIframeElement = await page.waitForSelector('#card-expiry iframe', { timeout: 10000 });
      const expiryFrame = await expiryIframeElement.contentFrame();
      await expiryFrame.type('input[name="exp-date"]', paymentInfo.expiry_date);

      const cvcIframeElement = await page.waitForSelector('#card-cvc iframe', { timeout: 10000 });
      const cvcFrame = await cvcIframeElement.contentFrame();
      await cvcFrame.type('input[name="cvc"]', paymentInfo.cvc);

      // Extract pricing information
      const invoiceTable = await page.waitForSelector('.item_table', { timeout: 10000 });
      const basePriceText = await page.$$eval('tr.sum-row', rows => {
        const row = rows.find(el => el.innerText.includes('Sub-Total'));
        return row ? row.querySelector('td').innerText : null;
      });
      
      if (!basePriceText) {
        console.log("Subtotal row not found.");
        await browser.close();
        return responseData;
      }
      responseData.base_price = parseFloat(basePriceText.replace('$', ''));

      const taxRows = await invoiceTable.$$('tr.tax');
      responseData.tax = (await Promise.all(taxRows.map(async row => parseFloat(await row.$eval('td:last-child', el => el.innerText.replace('$', '')))))).reduce((sum, tax) => sum + tax, 0);

      responseData.total = parseFloat(await invoiceTable.$eval('.item_total_price', el => el.innerText.replace('$', '')));

      // Uncomment the pay button to make the payment
      // await page.click("#process");

      responseData.payment_successful = true;
      await browser.close();
      return responseData;

    } else {
      console.log("No price element found.");
      await browser.close();
      return responseData;
    }

  } catch (error) {
    console.error(`Error during payment: ${error.message}`);
    await browser.close();
    return responseData;
  }
}

if (require.main === module) {
    (async () => {
        const paymentInfo = {
            first_name: "Lebron",
            last_name: "James",
            email: "lebronjames@gmail.com",
            phone_number: "3134321234",
            street_address: "1234 Rocky Rd",
            city: "San Francisco",
            state: "CA",
            zip_code: "45445",
            country: "USA",
            cardholder_name: "Lebron James",
            card_number: "2342943844322224",
            card_type: "Visa",
            expiry_date: "01/30",
            cvc: "1234"
        }
        const result = await payUncleDuckysTent("06/08/25", "06/10/25", 2, 1, paymentInfo);
        console.log("Scrape result:", result);
    })();
}

module.exports = { payUncleDuckysTent };
