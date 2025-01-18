const axios = require('axios');

const ROUTES = [
  'uncleDuckysTent',
  'leelanauPinesTent',
  'teePeeCampgroundTent',
  'indianRiverTent',
  'touristParkTent',
  'fortSuperiorTent',
  'timberRidgeTent'
];

const testPaymentRoute = async (routeName, paymentData) => {
  const startTime = new Date();
  try {
    console.log(`Testing ${routeName}...`);
    const response = await axios.post(
      `https://3z1i6f4h50.execute-api.us-east-2.amazonaws.com/dev/pay/${routeName}`,
      paymentData
    );
    const duration = new Date() - startTime;
    return {
      routeName,
      status: 'SUCCESS',
      duration: `${duration}ms`,
      data: response.data,
      error: null
    };
  } catch (error) {
    const duration = new Date() - startTime;
    return {
      routeName,
      status: 'FAILED',
      duration: `${duration}ms`,
      data: null,
      error: error.response?.data?.error || error.message
    };
  }
};

const runTests = async (parallel = false) => {
  // Helper function to generate random dates
  const generateRandomDates = () => {
    const startMin = new Date('2025-05-25');
    const startMax = new Date('2025-08-28');
    const randomStart = new Date(startMin.getTime() + Math.random() * (startMax.getTime() - startMin.getTime()));
    
    const stayDuration = Math.random() < 0.5 ? 1 : 2; // Randomly choose 1 or 2 days
    const randomEnd = new Date(randomStart);
    randomEnd.setDate(randomStart.getDate() + stayDuration);

    return {
      startDate: randomStart.toLocaleDateString('en-US'),
      endDate: randomEnd.toLocaleDateString('en-US')
    };
  };

  // Helper function to generate random guest numbers
  const generateRandomGuests = () => {
    const maxTotal = 6;
    const numAdults = Math.floor(Math.random() * 6) + 1; // 1-6 adults
    const maxKids = Math.min(5, maxTotal - numAdults); // Ensure total doesn't exceed 6
    const numKids = maxKids > 0 ? Math.floor(Math.random() * (maxKids + 1)) : 0; // 0-5 kids, or 0 if no room
    return { numAdults, numKids };
  };

  const dates = generateRandomDates();
  const guests = generateRandomGuests();
  const testData = {
    startDate: dates.startDate,
    endDate: dates.endDate,
    numAdults: guests.numAdults,
    numKids: guests.numKids,
    executePayment: false,
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

  const startTime = new Date();
  let results;

  if (parallel) {
    console.log('Running tests in parallel...');
    results = await Promise.all(
      ROUTES.map(route => testPaymentRoute(route, testData))
    );
  } else {
    console.log('Running tests sequentially...');
    results = [];
    for (const route of ROUTES) {
      results.push(await testPaymentRoute(route, testData));
    }
  }

  const totalDuration = new Date() - startTime;
  return { results, totalDuration, testData };
};

const formatTestResults = (results, totalDuration, testData) => {
  // Helper function to convert route name to readable place name
  const formatPlaceName = (routeName) => {
    return routeName
      // Remove 'Tent' from the end
      .replace(/Tent$/, '')
      // Split by capital letters and add spaces
      .replace(/([A-Z])/g, ' $1')
      // Handle special cases for first word capitalization
      .replace(/^([a-z])/, (match) => match.toUpperCase())
      // Fix specific cases
      .replace(/Tee Pee/, 'TeePee')
      .trim();
  };

  let html = `
    <h2>Payment Route Test Results</h2>
    <p>Total Duration: ${(totalDuration / 1000).toFixed(2)} seconds</p>
    <p>Test Date: ${new Date().toLocaleString()}</p>
    <h3>Test Parameters:</h3>
    <ul>
      <li>Start Date: ${testData.startDate}</li>
      <li>End Date: ${testData.endDate}</li>
      <li>Number of Adults: ${testData.numAdults}</li>
      <li>Number of Children: ${testData.numKids}</li>
      <li>Execute Payment: ${testData.executePayment ? 'Yes' : 'No'}</li>
    </ul>
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <tr style="background-color: #f2f2f2;">
        <th>Place</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Base Price</th>
        <th>Taxes and Fees</th>
        <th>Total</th>
        <th>Payment Status</th>
        <th>Error</th>
      </tr>
  `;

  results.forEach(result => {
    const data = result.data || {};
    const durationInSeconds = parseFloat(result.duration) / 1000;
    html += `
      <tr>
        <td>${formatPlaceName(result.routeName)}</td>
        <td style="color: ${result.status === 'SUCCESS' ? 'green' : 'red'}">${result.status}</td>
        <td>${durationInSeconds.toFixed(2)}s</td>
        <td>${data.base_price || 'N/A'}</td>
        <td>${data.tax || 'N/A'}</td>
        <td>${data.total || 'N/A'}</td>
        <td>${data.payment_successful ? 'Success' : 'Not Processed'}</td>
        <td style="color: red">${result.error || ''}</td>
      </tr>
    `;
  });

  html += '</table>';
  return html;
};

const sendEmailReport = async (htmlContent) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `Payment Routes Test Report - ${new Date().toLocaleDateString()}`,
    html: htmlContent
  };

  try {
    await sgMail.send(msg);
    console.log('Email report sent successfully');
  } catch (error) {
    console.error('Error sending email report:', error);
  }
};

// Function to run as a scheduled task
const runDailyTests = async () => {
  try {
    console.log('Starting daily payment route tests...');
    const { results, totalDuration, testData } = await runTests(true); // true for parallel execution
    const htmlReport = formatTestResults(results, totalDuration, testData);
    await sendEmailReport(htmlReport);
    console.log('Daily tests completed and report sent');
    return { results, totalDuration, testData };
  } catch (error) {
    console.error('Error in daily test run:', error);
    throw error;
  }
};

// For manual testing
const runManualTest = async (parallel = false) => {
  try {
    console.log('Running manual test...');
    const { results, totalDuration, testData } = await runTests(parallel);
    console.log('\nTest Results:');
    console.log('\nTest Parameters:');
    console.log(`Start Date: ${testData.startDate}`);
    console.log(`End Date: ${testData.endDate}`);
    console.log(`Number of Adults: ${testData.numAdults}`);
    console.log(`Number of Children: ${testData.numKids}`);
    console.log(`Execute Payment: ${testData.executePayment ? 'Yes' : 'No'}\n`);
    results.forEach(result => {
      console.log(`\n${result.routeName}:`);
      console.log(`Status: ${result.status}`);
      console.log(`Duration: ${result.duration}`);
      if (result.data) {
        console.log(`Base Price: ${result.data.base_price}`);
        console.log(`Taxes and Fees: ${result.data.tax}`);
        console.log(`Total: ${result.data.total}`);
        console.log(`Payment Status: ${result.data.payment_successful ? 'Success' : 'Not Processed'}`);
      }
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    });
    console.log(`\nTotal Duration: ${totalDuration}ms`);
    return { results, totalDuration, testData };
  } catch (error) {
    console.error('Error in manual test:', error);
    throw error;
  }
};

// Export functions for different use cases
module.exports = {
  runManualTest,
  runDailyTests,
  formatTestResults,
  sendEmailReport
}; 