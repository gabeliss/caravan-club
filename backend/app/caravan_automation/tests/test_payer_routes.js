const axios = require('axios');
const routesConfig = require('./routes');

const testPayerRoute = async (routeName, baseUrl, testParams) => {
  const startTime = process.hrtime(); // Use high-resolution time
  const { dates, guests, paymentInfo } = testParams;
  
  const payload = {
    params: {
      start_date: dates.startDate,
      end_date: dates.endDate,
      num_adults: guests.numAdults,
      num_kids: guests.numKids,
      execute_payment: false,
      payment_info: paymentInfo
    }
  };
  
  try {
    // Log the full request details
    const requestUrl = `${baseUrl}/api/pay/${routeName}`;

    const response = await axios.post(requestUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9; // Convert to seconds

    console.log(`Response for ${routeName}:`, response.data);

    return {
      routeName,
      status: 'SUCCESS',
      duration: duration.toFixed(2),
      data: response.data,
      error: null
    };
  } catch (error) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;

    // Enhanced error logging
    console.error(`Error details for ${routeName}:`, {
      message: error.message,
      response: error.response?.data,
      baseUrl: baseUrl,
      stack: error.stack
    });

    return {
      routeName,
      status: 'FAILED',
      duration: duration.toFixed(2),
      data: null,
      error: error.response?.data?.error || error.message
    };
  }
};

const runPayerTests = async (testParams, routeName) => {
  return testPayerRoute(routeName, routesConfig.baseUrl, testParams);
};

module.exports = { runPayerTests };
