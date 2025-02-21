const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function scrapeWhiteWaterParkTent(startDate, endDate, numAdults, numKids) {
    try {
        // Format the dates for the URL (YYYY-MM-DD)
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const startDateFormatted = startDateObj.toISOString().split('T')[0];
        const endDateFormatted = endDateObj.toISOString().split('T')[0];

        // Check if dates are within allowed range
        const seasonStartDate = new Date('2025-04-01');
        const seasonEndDate = new Date('2025-05-16');

        if (startDateObj < seasonStartDate || endDateObj > seasonEndDate) {
            return {
                available: false,
                price: null,
                message: "No availability"
            };
        }

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
        const result = await Promise.race([
            page.waitForSelector('.alert-danger', { timeout: 10000 }).then(() => ({ type: 'alert' })),
            page.waitForFunction(
                () => {
                    const rateElement = document.querySelector('.rate');
                    return rateElement && !rateElement.textContent.includes('Loading...');
                },
                { timeout: 10000 }
            ).then(() => ({ type: 'rate' }))
        ]);

        console.log(`Promise.race resolved with: ${result.type}`);

        if (result.type === 'alert') {
            console.log("Checking for no availability alerts");
            const alertElements = await page.$$('.alert-danger');
            console.log("Alert elements found:", alertElements.length);
            for (const alert of alertElements) {
                console.log("Alert element found, alert:", alert);
                const alertText = await alert.evaluate(el => el.textContent);
                console.log("Alert element found, alert text:", alertText);
                if (alertText.toLowerCase().includes('no availability')) {
                    console.log("No availability found");
                    await browser.close();
                    return {
                        available: false,
                        price: null,
                        message: "No tent sites found"
                    };
                }
            }
        } else {
            console.log("Rate elements might be available");
            // Handle rate elements if needed
        }

        // First check if we need to click the Tent Sites button
        const tentSitesButton = await page.$('button.site-type');
        if (tentSitesButton) {
            const buttonText = await tentSitesButton.evaluate(el => el.textContent);
            if (buttonText.includes('Tent Sites')) {
                console.log("Found Tent Sites button, clicking it");
                await tentSitesButton.evaluate(el => el.click());
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for content to update
            }
        }

        // Modified wait for rates to load
        try {
            await page.waitForFunction(
                () => {
                    const rates = document.querySelectorAll('.rate');
                    const buttons = document.querySelectorAll('.btn.btn-selected-green');
                    // Make sure we have rates and buttons AND the content isn't "Loading..."
                    return rates.length > 0 && 
                           buttons.length > 0 && 
                           !document.querySelector('.rate')?.textContent?.includes('Loading...');
                },
                { timeout: 5000 }
            );
            console.log("Rates finished loading");
        } catch (error) {
            // Print all .rate elements
            const rates = await page.$$('.rate');
            console.log("Rate elements found:", rates.length);
            for (const rate of rates) {
                const rateContent = await rate.evaluate(el => ({
                    text: el.textContent,
                    html: el.innerHTML
                }));
                console.log("Rate content:", rateContent);
            }

            // Print all buttons
            const buttons = await page.$$('button');
            console.log("All buttons found:");
            for (const button of buttons) {
                const buttonInfo = await button.evaluate(el => ({
                    text: el.textContent,
                    class: el.className,
                    type: el.type || 'none',
                    isVisible: el.offsetParent !== null
                }));
                console.log("Button info:", buttonInfo);
            }

            throw new Error(`Timeout waiting for rates to load: ${error.message}`);
        }

        // Add a small delay to ensure content is fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Look for tent site rates
        console.log("Searching for tent sites");
        const rateElements = await page.$$('.rate');
        console.log("Found rate elements:", rateElements.length);
        for (const rate of rateElements) {
            const rateName = await rate.$eval('.rate-name', el => el.textContent);
            console.log("Rate name:", rateName);
            if (rateName.includes('Tent Sites -  Electric Only')) {
                const priceText = await rate.$eval('strong', el => 
                    el.textContent.trim().replace('$', '').replace(' USD', '')
                );
                console.log("Price text:", priceText);
                const price = parseFloat(priceText);
                await browser.close();
                responseData = {
                    available: true,
                    price: price,
                    message: `$${price.toFixed(2)} per night`
                };
                console.log("Response data:", responseData);
                return responseData;
            }
        }

        await browser.close();
        return {
            available: false,
            price: null,
            message: "No tent sites found"
        };

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return {
            available: false,
            price: null,
            message: `Error occurred: ${error.message}`
        };
    }
}

module.exports = { scrapeWhiteWaterParkTent };