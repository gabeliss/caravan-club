const { runScraperTests } = require('./test_scraper_routes');
const { runPayerTests } = require('./test_payer_routes');
const { formatTestResults, sendEmailReport, generateRandomDates, generateRandomGuests } = require('./utils');
const routesConfig = require('./routes');

(async () => {
  try {
    // Generate test parameters once
    const whiteWaterDates = generateRandomDates('whiteWaterParkTent_scraper');
    const standardDates = generateRandomDates(); // This will use May-August dates
    const guests = generateRandomGuests();
    
    // Calculate number of nights (using standardDates, since both date ranges use same duration)
    const startDate = new Date(standardDates.startDate);
    const endDate = new Date(standardDates.endDate);
    const numNights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const testParams = (routeName) => ({
      dates: routeName.startsWith('whiteWaterParkTent') ? whiteWaterDates : standardDates,
      guests: guests,
      paymentInfo: {
        first_name: "Test",
        last_name: "User",
        email: "gabeliss17@gmail.com",
        phone_number: "3134321234",
        street_address: "1234 Test St",
        city: "San Francisco",
        state: "CA",
        zip_code: "45445",
        country: "USA",
        cardholder_name: "Test User",
        card_number: "4242424242424242",
        card_type: "Visa",
        expiry_date: "01/30",
        cvc: "123"
      }
    });

    console.log('Running scraper tests...');
    const scraperResults = await Promise.all(
      routesConfig.scrapers.map(async route => {
        const params = testParams(route);
        try {
          return await runScraperTests(params, route);
        } catch (error) {
          console.error(`Error in scraper test for ${route}:`, error);
          return {
            routeName: route,
            status: 'FAILED',
            error: error.message,
            data: null
          };
        }
      })
    );

    // Only run payer tests for successful scraper tests
    const successfulScrapers = scraperResults
      .filter(result => result.status === 'SUCCESS' && result.data?.available === true)
      .map(result => result.routeName.replace('_scraper', '_payer'));

    console.log('Running payer tests for successful scraper routes...');
    const payerResults = await Promise.all(
      successfulScrapers.map(route => {
        const params = testParams(route);
        return runPayerTests(params, route);
      })
    );

    // Combine and format results
    const htmlReport = `
      <h1>Automation Test Report</h1>
      <h2>Test Parameters</h2>
      <h3>Standard Dates (May-August)</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Start Date</th>
          <td>${standardDates.startDate}</td>
        </tr>
        <tr>
          <th>End Date</th>
          <td>${standardDates.endDate}</td>
        </tr>
      </table>
      <h3>WhiteWater Dates (April)</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Start Date</th>
          <td>${whiteWaterDates.startDate}</td>
        </tr>
        <tr>
          <th>End Date</th>
          <td>${whiteWaterDates.endDate}</td>
        </tr>
      </table>
      <h3>Guest Information</h3>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Adults</th>
          <td>${guests.numAdults}</td>
        </tr>
        <tr>
          <th>Children</th>
          <td>${guests.numKids}</td>
        </tr>
        <tr>
          <th>Execute Payments</th>
          <td>False</td>
        </tr>
      </table>
      <h2>Scraper Results</h2>
      ${formatTestResults(scraperResults, 'scraper', numNights)}
      <h2>Payer Results</h2>
      ${formatTestResults(payerResults, 'payer', numNights)}
    `;

    await sendEmailReport(htmlReport);
    console.log('Test report sent successfully.');
  } catch (error) {
    console.error('Error during tests:', error);
  }
})();
