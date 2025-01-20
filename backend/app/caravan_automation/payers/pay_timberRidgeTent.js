const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function payTimberRidgeTent(startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false) {
  console.log('Starting Timber Ridge Tent booking process...');
  const responseData = {
    base_price: 0,
    tax: 0,
    total: 0,
    payment_successful: false,
  };

  // Format dates
  const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
  const endDateFormatted = new Date(endDate).toISOString().split('T')[0];
  console.log(`Formatted dates: ${startDateFormatted} to ${endDateFormatted}`);
  
  const url = `https://bookingsus.newbook.cloud/timberridgeresort/index.php?available_from=${startDateFormatted}&available_to=${endDateFormatted}&adults=${numAdults}&kids=${numKids}&equipment_type=3&equipment_length=20`;
  console.log(`Navigating to URL: ${url}`);
  
  try {
    const browser = await puppeteer.launch({
        args: [...chromium.args, '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
    });
    
    console.log("Browser launched");

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    });

    console.log('Waiting for page load...');
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Waiting for category list...');
    await page.waitForSelector('#category-list');
    const firstOption = await page.$('.newbook_online_category_box');

    if (!firstOption) {
        console.log('No booking options found');
        await browser.close();
        throw new Error('No booking options available for the selected dates');
    }

    console.log('Found first booking option');
    await page.waitForSelector('.newbook_online_from_price_text', { timeout: 30000 });
    
    // Get all price elements
    const allPriceElements = await page.$$('.newbook_online_from_price_text');
    console.log(`Found ${allPriceElements.length} price elements on page`);
    
    if (allPriceElements.length === 0) {
        console.log('No price elements found');
        await browser.close();
        throw new Error('No price information available');
    }

    // Use the first price element found
    const priceElement = allPriceElements[0];
    const price = await priceElement.evaluate(el => el.innerText);
    console.log(`Initial price found: ${price}`);
    
    // Find all book buttons and use the first one since it corresponds to the first price
    const bookButtons = await page.$$('button.button.newbook_responsive_button.full_width_uppercase');
    console.log(`Found ${bookButtons.length} book buttons`);
    
    if (bookButtons.length === 0) {
        console.log('No book buttons found');
        await browser.close();
        throw new Error('No booking buttons available');
    }

    const bookButton = bookButtons[0];
    console.log('Clicking first book button...');
    await bookButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Confirming site selection...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#newbook_content', { visible: true, timeout: 5000 });
    try {
        // Wait for any button with text "Confirm site selection"
        await page.waitForFunction(
            () => [...document.querySelectorAll('button')].find(button => 
                button.textContent.trim().includes('Confirm site selection')
            ),
            { timeout: 10000 }
        );
        
        // Click the button
        await page.evaluate(() => {
            const button = [...document.querySelectorAll('button')].find(button => 
                button.textContent.trim().includes('Confirm site selection')
            );
            if (button) button.click();
        });
    } catch (error) {
        console.log('Error in confirm site selection: ', error);
        console.log('Could not find Confirm site selection button, printing all buttons:');
        const buttons = await page.$$eval('button', buttons => buttons.map(btn => ({
            id: btn.id,
            text: btn.textContent,
            class: btn.className
        })));
        console.log(JSON.stringify(buttons, null, 2));
        throw error;
    }

    console.log('Filling payment information...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#firstname', { visible: true, timeout: 5000 });
    await page.type('#firstname', paymentInfo.first_name);
    await page.type('#lastname', paymentInfo.last_name);
    await page.type('#contact_details_email', paymentInfo.email);
    await page.type('#google_address_lookup', paymentInfo.street_address);
    await page.type('#city', paymentInfo.city);
    await page.type('#postcode', paymentInfo.zip_code);

    console.log('Filling card details...');
    await page.waitForSelector('#card_number', { visible: true, timeout: 5000 });
    await page.type('#card_number', paymentInfo.card_number);
    await page.type('#card_expiry', paymentInfo.expiry_date);
    await page.type('#card_cvv', paymentInfo.cvc);
    await page.type('#card_name', paymentInfo.cardholder_name);

    console.log('Clicking agree checkbox...');
    const agreeCheckbox = await page.$$('.newbook_checkout_checkbox');
    await agreeCheckbox[2].click({ position: { x: 10, y: 10 } });

    console.log('Getting final price...');
    await page.waitForSelector('#place_booking_full', { visible: true, timeout: 5000 });
    const totalPrice = await page.$eval('#place_booking_full span', el => {
        const priceMatch = el.innerText.match(/\$(\d+\.\d+)/);
        return priceMatch ? parseFloat(priceMatch[1]) : 0;
    });
    console.log(`Total price found: $${totalPrice}`);

    responseData.total = totalPrice;
    responseData.base_price = totalPrice - 3;
    responseData.tax = 3;
    
    if (executePayment) {
        console.log('Executing payment...');
        await page.click('#place_booking_full');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('Payment submitted successfully');
    } else {
        console.log('Test mode: Payment execution skipped');
    }

    responseData.payment_successful = true;
    console.log("Booking process completed. Response data: ", responseData);
    await browser.close();
    return responseData;

  } catch (error) {
    console.error(`Error during payment process: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return responseData;
  }
}

module.exports = { payTimberRidgeTent };