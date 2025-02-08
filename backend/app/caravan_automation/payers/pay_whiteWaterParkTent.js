const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function payWhiteWaterParkTent(startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false) {
    // Initialize response data object
    const responseData = {
        base_price: 0,
        tax: 0,
        total: 0,
        payment_successful: false
    };
    
    try {
        // Format the dates for the URL (YYYY-MM-DD)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const startDateFormatted = startDateObj.toISOString().split('T')[0];
        const endDateFormatted = endDateObj.toISOString().split('T')[0];

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
            args: [...chromium.args, '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            defaultViewport: chromium.defaultViewport,
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

        // Add a wait for the loading state to complete
        await page.waitForFunction(
            () => {
                const rates = document.querySelectorAll('.rate');
                return Array.from(rates).some(rate => {
                    const rateName = rate.querySelector('.rate-name')?.textContent;
                    return rateName && rateName !== 'Loading...';
                });
            },
            { timeout: 30000 }
        );
        console.log("Rates finished loading");

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
        const rateElements = await page.$$('.rate', { timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("Found rate elements:", rateElements.length);
        for (const rate of rateElements) {
            let rateName;
            try {
                rateName = await rate.$eval('.rate-name', el => el.textContent);
                console.log("Rate name:", rateName);
            } catch (error) {
                console.log("Could not get rate name, printing element:", rate);
            }
            if (!rateName.includes('Tent Sites -  Electric Only')) {
                console.log("Rate name does not match Tent Sites -  Electric Only", rateName);
                continue;
            }
            
            console.log("Found tent site, clicking rate");
            await rate.$eval('button.btn.btn-selected-green', el => el.click());
            
            await page.waitForSelector('.site-btn');
            console.log("Site selection buttons loaded");
            
            // Wait for the sites list container and then get buttons within it
            await page.waitForSelector('.sites-list.row');
            const sitesList = await page.$('.sites-list.row');
            
            // Add retry mechanism for getting select buttons
            let selectButtons = [];
            let attempts = 0;
            const maxAttempts = 7;
            
            while (selectButtons.length < 3 && attempts < maxAttempts) {
                selectButtons = await sitesList.$$('button.site-btn.btn-outline-dark');
                console.log(`Attempt ${attempts + 1}: Found ${selectButtons.length} buttons`);
                
                if (selectButtons.length < 3) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    attempts++;
                }
            }
            
            console.log("Final button count:", selectButtons.length);
            
            if (selectButtons.length <= 2) {
                // Get all buttons on the page
                const allButtons = await page.$$('button');
                console.log("All buttons found on page:");
                for (const button of allButtons) {
                    const buttonText = await button.evaluate(el => {
                        return {
                            text: el.textContent.trim(),
                            class: el.className,
                            type: el.type || 'none',
                            isVisible: el.offsetParent !== null
                        }
                    });
                    console.log(buttonText);
                }
                throw new Error("No select buttons found for tent sites");
            }

            console.log("Select buttons found");
            // Verify the text content of the first button
            const buttonText = await selectButtons[0].evaluate(el => el.textContent);
            console.log("First button text:", buttonText);
            
            if (buttonText !== 'Select') {
                throw new Error(`Unexpected button text: ${buttonText}`);
            }

            console.log("Clicking first available site");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await selectButtons[0].evaluate(el => el.scrollIntoView());
            await new Promise(resolve => setTimeout(resolve, 1000));
            await selectButtons[0].evaluate(el => el.click());
            
            try {
                // Wait for the guest form to load with 5s timeout
                await page.waitForSelector('.camper-form', { timeout: 5000 });
                console.log("Guest form loaded");
            } catch (error) {
                console.log("Could not find camper form after 5 seconds");
                console.log("Available select buttons:");
                for (const btn of selectButtons) {
                    const btnText = await btn.evaluate(el => el.textContent);
                    console.log(`Button text: ${btnText}`);
                }
            }
            
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
            const continueButton = await page.$('#continue-payment-button button');
            await continueButton.evaluate(el => el.scrollIntoView());
            await new Promise(resolve => setTimeout(resolve, 2000));
            await continueButton.evaluate(el => el.click());
            console.log("Clicked continue to payment");
            
            // Wait for payment form to load with multiple possible selectors
            console.log("Waiting for payment form...");
            try {
                await Promise.race([
                    page.waitForSelector('#payment-form', { timeout: 10000 }),
                    page.waitForSelector('form[data-testid="payment-form"]', { timeout: 10000 }),
                    page.waitForSelector('form.payment-form', { timeout: 10000 }),
                    page.waitForSelector('input[name="firstName"]', { timeout: 10000 })
                ]);
                console.log("Payment form detected");
            } catch (error) {
                console.log("Initial payment form detection failed. Logging page state...");
                
                // Log all buttons and forms on the page
                const pageState = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
                        text: button.textContent.trim(),
                        id: button.id,
                        classes: button.className,
                        isVisible: button.offsetParent !== null
                    }));
                    
                    const forms = Array.from(document.querySelectorAll('form')).map(form => ({
                        id: form.id,
                        classes: form.className,
                        action: form.action
                    }));
                    
                    const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
                        name: input.name,
                        type: input.type,
                        id: input.id,
                        isVisible: input.offsetParent !== null
                    }));

                    return { buttons, forms, inputs };
                });
                
                console.log("Current page buttons:", JSON.stringify(pageState.buttons, null, 2));
                console.log("Current page forms:", JSON.stringify(pageState.forms, null, 2));
                console.log("Current page inputs:", JSON.stringify(pageState.inputs, null, 2));
                
                console.log("Waiting additional time...");
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.reload({ waitUntil: 'networkidle0' });
                console.log("Page reloaded, waiting for payment form again...");
                
                try {
                    await Promise.race([
                        page.waitForSelector('#payment-form', { timeout: 10000 }),
                        page.waitForSelector('input[name="firstName"]', { timeout: 10000 })
                    ]);
                } catch (retryError) {
                    throw new Error(`Payment form not found after retry. Original error: ${error.message}. Retry error: ${retryError.message}`);
                }
            }
            console.log("Payment form loaded successfully");

            // Add a small delay before filling out the form
            await new Promise(resolve => setTimeout(resolve, 2000));

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
            // Find and scroll to payment button
            const paymentButton = await page.$('button[type="submit"]');
            await paymentButton.evaluate(el => el.scrollIntoView());
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (executePayment) {
                console.log("Executing payment");
                await paymentButton.evaluate(el => el.click());
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                console.log("Payment successful");
                responseData.payment_successful = true;
            } else {
                console.log("Test mode: Payment execution skipped");
                responseData.payment_successful = true;
            }

            return responseData;
        }

        console.log("No tent sites found");
        await browser.close();
        return responseData;

    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        return responseData;
    }
}

module.exports = { payWhiteWaterParkTent };