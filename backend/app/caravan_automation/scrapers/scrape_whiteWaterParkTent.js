const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

async function scrapeWhiteWaterParkTent(startDate, endDate, numAdults, numKids) {
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
        try {
            await page.waitForFunction(
                () => {
                    const rates = document.querySelectorAll('.rate');
                    return Array.from(rates).some(rate => {
                        const rateName = rate.querySelector('.rate-name')?.textContent;
                        return rateName && rateName !== 'Loading...';
                    });
                },
                { timeout: 12000 }
            );
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
            const rateName = await rate.$eval('.rate-name', el => el.textContent);
            console.log("Rate name:", rateName);
            if (rateName.includes('Tent Sites -  Electric Only')) {
                const priceText = await rate.$eval('strong', el => 
                    el.textContent.trim().replace('$', '').replace(' USD', '')
                );
                const price = parseFloat(priceText);
                await browser.close();
                return {
                    available: true,
                    price: price,
                    message: `$${price.toFixed(2)} per night`
                };
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