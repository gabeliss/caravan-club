const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function payFortSuperiorTent(startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false) {
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
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
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
    if (liElements.length === 0) {
      // Get all li elements
      const allLis = await frame.$$eval('li', lis => lis.map(li => ({
        text: li.innerText,
        class: li.className
      })));
      console.log('All li elements:', allLis);

      // Get all buttons
      const allButtons = await frame.$$eval('button', buttons => buttons.map(btn => ({
        text: btn.innerText,
        class: btn.className,
        id: btn.id
      })));
      console.log('All buttons:', allButtons);

      throw new Error('No room listings found on page');
    }
    
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
        await continueButton.evaluate(b => b.click());
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
        
        if (executePayment) {
          console.log('Executing payment...');
          await checkoutButton.evaluate(b => b.click());
          // Wait for navigation to complete after payment
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
          console.log('Payment submitted successfully');
        } else {
          console.log('Test mode: Payment execution skipped');
        }
        
        responseData.payment_successful = true;
        console.log("ResponseData", responseData);
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

module.exports = { payFortSuperiorTent };