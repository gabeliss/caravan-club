const axios = require('axios');
const routesConfig = require('./routes');

const testPayerRoute = async (routeName, baseUrl, testParams) => {
  const startTime = new Date();
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
    const duration = new Date() - startTime;

    console.log(`Response for ${routeName}:`, response.data);

    return {
      routeName,
      status: 'SUCCESS',
      duration: `${duration}ms`,
      data: response.data,
      error: null
    };
  } catch (error) {
    const duration = new Date() - startTime;

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
      duration: `${duration}ms`,
      data: null,
      error: error.response?.data?.error || error.message
    };
  }
};

const runPayerTests = async (testParams, routeName) => {
  return testPayerRoute(routeName, routesConfig.baseUrl, testParams);
};

module.exports = { runPayerTests };
