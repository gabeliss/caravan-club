const puppeteer = require('puppeteer');

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
            const rateName = await rate.$eval('.rate-name', el => el.textContent);
            console.log("Checking rate:", rateName);
            if (rateName.includes('Tent Sites -  Electric Only')) {
                console.log("Found tent site rate");
                const priceText = await rate.$eval('strong', el => 
                    el.textContent.trim().replace('$', '').replace(' USD', '')
                );
                const price = parseFloat(priceText);
                console.log(`Found price: $${price}`);
                await browser.close();
                return {
                    available: true,
                    price: price,
                    message: `$${price.toFixed(2)} per night`
                };
            }
        }

        console.log("No tent sites found");
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

// Add test execution when run directly
if (require.main === module) {
    (async () => {
        const result = await scrapeWhiteWaterParkTent("04/08/25", "04/10/25", 3, 1);
        console.log("Scrape result:", result);
    })();
}

module.exports = { scrapeWhiteWaterParkTent };