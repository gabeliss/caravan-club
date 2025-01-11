const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

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
    console.log("Response data: ", responseData);
    return responseData;
  }

  // Check if start date is valid
  const startDateObj = new Date(startDate);
  if (startDateObj < new Date("2025-05-23")) {
    console.log("Booking is not available before May 23, 2025.");
    console.log("Response data: ", responseData);
    return responseData;
  }

  const startDateFormatted = startDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const endDateFormatted = new Date(endDate).toISOString().split('T')[0]; // YYYY-MM-DD

  const url = `https://paddlersvillage.checkfront.com/reserve/?start_date=${startDateFormatted}&end_date=${endDateFormatted}&category_id=14`;

  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const unavailableElement = await page.$("p.cf-info b");
    if (unavailableElement) {
    const unavailableText = await page.evaluate(el => el.innerText, unavailableElement);
    if (unavailableText.includes("Nothing available for the dates selected.")) {
        console.log("No availability for the selected dates.");
        await browser.close();
        console.log("Response data: ", responseData);
        return responseData;
    }
    }

    const firstOption = await page.$('.cf-item-data');
    if (!firstOption) {
      console.log("No available tent options.");
      await browser.close();
      console.log("Response data: ", responseData);
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
          console.log("Response data: ", responseData);
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
        console.log("Unable to switch to card number iframe.");
        await browser.close();
        console.log("Response data: ", responseData);
        return responseData;
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
        console.log("Response data: ", responseData);
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
      console.log("Response data: ", responseData);
      return responseData;

    } else {
      console.log("No price element found.");
      await browser.close();
      console.log("Response data: ", responseData);
      return responseData;
    }

  } catch (error) {
    console.error(`Error during payment: ${error.message}`);
    await browser.close();
    console.log("Response data: ", responseData);
    return responseData;
  }
}

module.exports = { payUncleDuckysTent };
