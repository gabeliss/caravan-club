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
            headless: true,
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

        // Check for no availability alerts
        const alertElements = await page.$$('.alert-danger');
        for (const alert of alertElements) {
            const alertText = await alert.evaluate(el => el.textContent);
            if (alertText.toLowerCase().includes('no availability')) {
                await browser.close();
                return {
                    available: false,
                    price: null,
                    message: "No availability for selected dates"
                };
            }
        }

        // Look for tent site rates
        const rateElements = await page.$$('.rate');
        for (const rate of rateElements) {
            const rateName = await rate.$eval('.rate-name', el => el.textContent);
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

// Add test execution when run directly
if (require.main === module) {
    (async () => {
        const result = await scrape_whiteWaterParkTent("04/08/25", "04/10/25", 3, 1);
        console.log("Scrape result:", result);
    })();
}

module.exports = { scrapeWhiteWaterParkTent };