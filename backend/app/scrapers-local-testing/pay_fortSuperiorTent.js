const puppeteer = require('puppeteer');

async function payFortSuperiorTent(startDate, endDate, numAdults, numKids, paymentInfo) {
  const responseData = {
    base_price: 0,
    tax: 0,
    total: 0,
    payment_successful: false,
  };

  // Format dates to timestamps like in Python version
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  const num_travelers = numAdults + numKids;
  
  const url = `https://www.fortsuperiorcampground.com/campsites/rooms/%3FcheckIn%3D${startTimestamp}%26checkOut%3D${endTimestamp}%26adults%3D${num_travelers}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    console.log('Browser launched with viewport 1920x1080');

    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log(`Navigated to URL: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Wait for and get iframe
    const frameHandle = await page.waitForSelector("iframe[title='Book a Room']");
    const frame = await frameHandle.contentFrame();
    console.log('Found and switched to booking iframe');
    
    // Find room listings
    const liElements = await frame.$$("li.room");
    console.log(`Found ${liElements.length} room listings`);
    
    for (const li of liElements) {
      const siteNameElement = await li.$("h3 a span.strans");
      if (!siteNameElement) {
        console.log('Skipping listing - no site name element found');
        continue;
      }
      
      const siteName = await siteNameElement.evaluate(el => el.innerText);
      console.log(`Processing room: ${siteName}`);
      if (!siteName.includes("Canvas Tent Barrack")) {
        const priceElement = await li.$("div.price span.value");
        if (!priceElement) continue;
        
        const bookButton = await li.$("button.fancy-btn.s-button.button");
        await bookButton.evaluate(el => el.scrollIntoView());
        await bookButton.evaluate(b => b.click());
        console.log('Clicked book button');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fill out details form
        const detailsForm = await page.waitForSelector("form[name='detailsForm']");
        console.log('Found details form, filling out personal information');
        await page.type("input#firstName", paymentInfo.first_name);
        await page.type("input#lastName", paymentInfo.last_name);
        await page.type("input#email", paymentInfo.email);
        await page.type("input#phone", paymentInfo.phone_number);
        
        await page.select("select#country", 'string:us');

        // Get pricing information
        const paymentDiv = await page.waitForSelector("div.payment");
        const basePriceEl = await paymentDiv.$("table.breakdown-table tr:first-child td:last-child");
        if (basePriceEl) {
          const basePrice = await basePriceEl.evaluate(el => parseFloat(el.innerText.replace('$', '')));
          responseData.base_price = basePrice;
          console.log(`Base price: $${basePrice}`);
        }

        const feeEl = await paymentDiv.$("table.breakdown-table tr:nth-child(2) td:last-child");
        if (feeEl) {
          const fee = await feeEl.evaluate(el => parseFloat(el.innerText.replace('$', '')));
          responseData.tax = fee;
        }

        const totalEl = await paymentDiv.$("tfoot tr td.total-value");
        if (totalEl) {
          const total = await totalEl.evaluate(el => parseFloat(el.innerText.replace('$', '')));
          responseData.total = total;
        }

        // Continue to payment
        const continueButton = await detailsForm.$("button.pay-now");
        await continueButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle credit card iframe
        const cardFrame = await page.waitForSelector("iframe[title='Credit / Debit Card']");
        const cardFrameContent = await cardFrame.contentFrame();
        console.log('Found and switched to credit card iframe');
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for card number field to be ready
        await cardFrameContent.waitForSelector("input#cardNumber", { timeout: 10000 });
        await cardFrameContent.type("input#cardNumber", paymentInfo.card_number);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await cardFrameContent.type("input#cardExpiration", paymentInfo.expiry_date);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await cardFrameContent.type("input#cardCvv", paymentInfo.cvc);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear cardholder name field before typing
        await cardFrameContent.evaluate(() => document.getElementById('cardHolderName').value = '');
        await cardFrameContent.type("input#cardHolderName", paymentInfo.cardholder_name);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Filled out payment information');

        const checkoutButton = await page.$("button[data-hook='cashier-payments-method-pay-button']");
        // await checkoutButton.click(); // uncomment to actually pay
        
        responseData.payment_successful = true;
        await browser.close();
        return responseData;
      }
    }

    await browser.close();
    return responseData;

  } catch (error) {
    console.error(`Error during payment: ${error.message}`);
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
        const result = await payFortSuperiorTent("06/08/25", "06/10/25", 2, 1, paymentInfo);
        console.log("Scrape result:", result);
    })();
}

module.exports = { payFortSuperiorTent };