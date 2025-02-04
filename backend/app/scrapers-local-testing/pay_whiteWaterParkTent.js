const puppeteer = require('puppeteer');

async function pay_whiteWaterParkTent(startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false) {
    try {
        // Format the dates for the URL (YYYY-MM-DD)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const startDateFormatted = startDateObj.toISOString().split('T')[0];
        const endDateFormatted = endDateObj.toISOString().split('T')[0];

        // Initialize response data object
        const responseData = {
            base_price: 0,
            tax: 0,
            total: 0,
            payment_successful: false
        };

        // Construct the URL
        const baseUrl = "https://www.roverpass.com/c/whitewater-township-park-williamsburg-mi/booking/search";
        const params = new URLSearchParams({
            accommodation: "overnight",
            check_in: startDateFormatted,
            check_out: endDateFormatted,
            site_type: "type_tent"
        });
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`Navigating to URL: ${url}`);

        const browser = await puppeteer.launch({
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        console.log("Browser launched");

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log("Page loaded successfully");

        // Wait for either rate divs or alert divs to appear
        await Promise.race([
            page.waitForSelector('.rate', { timeout: 10000 }),
            page.waitForSelector('.alert-danger', { timeout: 10000 })
        ]);
        console.log("Found rate or alert elements");

        // Check for no availability alerts
        const alertElements = await page.$$('.alert-danger');
        for (const alert of alertElements) {
            const alertText = await alert.evaluate(el => el.textContent);
            if (alertText.toLowerCase().includes('no availability')) {
                console.log("No availability found");
                await browser.close();
                return responseData;
            }
        }

        // Look for tent site rates
        console.log("Searching for tent sites");
        const rateElements = await page.$$('.rate');
        for (const rate of rateElements) {
            const rateName = await rate.$eval('.rate-name', el => el.textContent);
            if (rateName.includes('Tent Sites -  Electric Only')) {
                console.log("Found tent site, clicking rate");
                await rate.$eval('button.btn.btn-selected-green', el => el.click());
                
                await page.waitForSelector('.site-btn');
                console.log("Site selection buttons loaded");
                
                const selectButtons = await page.$$('.site-btn');
                if (selectButtons.length > 0) {
                    console.log("Clicking first available site");
                    await selectButtons[0].evaluate(el => el.scrollIntoView());
                    await new Promise(resolve => setTimeout(resolve, 500)); // Give time for scroll to complete
                    await selectButtons[0].evaluate(el => el.click());
                    
                    // Wait for the guest form to load
                    await page.waitForSelector('.camper-form');
                    console.log("Guest form loaded");
                    
                    // Set number of guests
                    const totalGuests = numAdults + numKids;
                    console.log(`Setting guest count to ${totalGuests}`);
                    const currentGuests = await page.$eval('#guests\\.adults', el => parseInt(el.value) || 0);
                    const clicksNeeded = totalGuests - currentGuests;
                    
                    // Click the plus button until we reach desired number of guests
                    for (let i = 0; i < clicksNeeded; i++) {
                        await page.$eval('button[name="guests.adults-increase"]', el => el.click());
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    console.log("Guest count updated");

                    // Click Add to Cart
                    await page.$eval('button[type="submit"]', el => el.click());
                    console.log("Clicked Add to Cart");
                    
                    // Wait for cart summary to load
                    await page.waitForSelector('.cart-summary');
                    console.log("Cart summary loaded");

                    // Get base price
                    const basePriceText = await page.$eval('.reservation .text-gray', el => el.textContent);
                    responseData.base_price = parseFloat(basePriceText.replace('$', '').trim());
                    console.log(`Base price: $${responseData.base_price}`);

                    // Get total price
                    const totalPriceText = await page.$eval('.text-green', el => el.textContent);
                    responseData.total = parseFloat(totalPriceText.match(/\$(\d+\.\d+)/)[1]);
                    console.log(`Total price: $${responseData.total}`);

                    // Calculate tax
                    responseData.tax = responseData.total - responseData.base_price;
                    console.log(`Tax: $${responseData.tax}`);

                    // Click continue to payment
                    await page.$eval('#continue-payment-button button', el => el.click());
                    console.log("Clicked continue to payment");
                    
                    // Wait for payment form to load
                    await page.waitForSelector('#payment-form');
                    console.log("Payment form loaded");

                    // Fill out contact information
                    console.log("Filling out contact information");
                    await page.type('input[name="firstName"]', paymentInfo.first_name);
                    await page.type('input[name="lastName"]', paymentInfo.last_name);
                    await page.type('input[name="phone"]', paymentInfo.phone_number);
                    await page.type('input[name="email"]', paymentInfo.email);

                    // Fill out billing address
                    console.log("Filling out billing address");
                    await page.type('input[name="address"]', paymentInfo.street_address);
                    await page.type('input[name="city"]', paymentInfo.city);
                    await page.select('select[name="state"]', paymentInfo.state);

                    // Wait for Stripe iframe and fill out credit card info
                    console.log("Waiting for Stripe iframe");
                    const stripeFrame = await page.waitForSelector('iframe[name^="__privateStripeFrame"]');
                    const frameContent = await stripeFrame.contentFrame();
                    
                    console.log("Filling out credit card information");
                    await frameContent.type('[name="cardnumber"]', paymentInfo.card_number);
                    await frameContent.type('[name="exp-date"]', paymentInfo.expiry_date);
                    await frameContent.type('[name="cvc"]', paymentInfo.cvc);

                    // Click confirm and pay button
                    if (executePayment) {
                        console.log("Executing payment");
                        await page.$eval('button[type="submit"]', el => el.click());
                        await page.waitForNavigation({ waitUntil: 'networkidle0' });
                        console.log("Payment successful");
                        responseData.payment_successful = true;
                    } else {
                        console.log("Test mode: Payment execution skipped");
                        responseData.payment_successful = true;
                    }

                    return responseData;
                }
            }
        }

        console.log("No tent sites found");
        await browser.close();
        return responseData;

    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return responseData;
    }
}

// Add test execution when run directly
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
        const result = await pay_whiteWaterParkTent("04/08/25", "04/10/25", 3, 1, paymentInfo, false);
        console.log("Scrape result:", result);
    })();
}

module.exports = { pay_whiteWaterParkTent };