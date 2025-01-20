const { runScraperTests } = require('./test_scraper_routes');
const { runPayerTests } = require('./test_payer_routes');
const { formatTestResults, sendEmailReport, generateRandomDates, generateRandomGuests } = require('./utils');

(async () => {
  try {
    // Generate test parameters once
    const dates = generateRandomDates();
    const numNights = Math.ceil((new Date(dates.endDate) - new Date(dates.startDate)) / (1000 * 60 * 60 * 24));
    const guests = generateRandomGuests();
    const testParams = {
      dates,
      guests,
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
    };

    console.log('Running scraper tests...');
    const scraperResults = await runScraperTests(testParams);

    // Only run payer tests for successful scraper tests
    const successfulScrapers = scraperResults
      .filter(result => result.status === 'SUCCESS' && result.data?.available === true)
      .map(result => result.routeName.replace('_scraper', '_payer'));

    console.log('Running payer tests for successful scraper routes...');
    const payerResults = await runPayerTests(testParams, successfulScrapers);

    // Combine and format results
    const htmlReport = `
      <h1>Automation Test Report</h1>
      <h2>Test Parameters</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Start Date</th>
          <td>${dates.startDate}</td>
        </tr>
        <tr>
          <th>End Date</th>
          <td>${dates.endDate}</td>
        </tr>
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
