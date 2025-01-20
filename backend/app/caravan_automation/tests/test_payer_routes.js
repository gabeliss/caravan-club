const axios = require('axios');
const routesConfig = require('./routes');

const testPayerRoute = async (routeName, baseUrl, testParams) => {
  const startTime = new Date();
  const { dates, guests, paymentInfo } = testParams;
  const payload = {
    startDate: dates.startDate,
    endDate: dates.endDate,
    numAdults: guests.numAdults,
    numKids: guests.numKids,
    executePayment: false,
    paymentInfo
  };
  
  try {
    const response = await axios.post(`${baseUrl}/api/pay/${routeName}`, payload, {
      headers: { 'Content-Type': 'application/json' } // Ensures Flask recognizes JSON payload
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

const runPayerTests = async (testParams, allowedRoutes) => {
  const results = await Promise.all(
    routesConfig.payers
      .filter(route => allowedRoutes.includes(route))
      .map(route => testPayerRoute(route, routesConfig.baseUrl, testParams))
  );
  return results;
};

module.exports = { runPayerTests };
