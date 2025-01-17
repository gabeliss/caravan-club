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
  const testData = {
    startDate: "06/08/25",
    endDate: "06/10/25",
    numAdults: 2,
    numKids: 1,
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
  return { results, totalDuration };
};

const formatTestResults = (results, totalDuration) => {
  let html = `
    <h2>Payment Route Test Results</h2>
    <p>Total Duration: ${totalDuration}ms</p>
    <p>Test Date: ${new Date().toLocaleString()}</p>
    <table border="1" style="border-collapse: collapse; width: 100%;">
      <tr style="background-color: #f2f2f2;">
        <th>Route</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Base Price</th>
        <th>Tax</th>
        <th>Total</th>
        <th>Payment Status</th>
        <th>Error</th>
      </tr>
  `;

  results.forEach(result => {
    const data = result.data || {};
    html += `
      <tr>
        <td>${result.routeName}</td>
        <td style="color: ${result.status === 'SUCCESS' ? 'green' : 'red'}">${result.status}</td>
        <td>${result.duration}</td>
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
    const { results, totalDuration } = await runTests(true); // true for parallel execution
    const htmlReport = formatTestResults(results, totalDuration);
    await sendEmailReport(htmlReport);
    console.log('Daily tests completed and report sent');
    return { results, totalDuration };
  } catch (error) {
    console.error('Error in daily test run:', error);
    throw error;
  }
};

// For manual testing
const runManualTest = async (parallel = false) => {
  try {
    console.log('Running manual test...');
    const { results, totalDuration } = await runTests(parallel);
    console.log('\nTest Results:');
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
    return { results, totalDuration };
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