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
    const response = await axios.post(`${baseUrl}/api/pay/${routeName}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
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

const runPayerTests = async (testParams, routeName) => {
  return testPayerRoute(routeName, routesConfig.baseUrl, testParams);
};

module.exports = { runPayerTests };
