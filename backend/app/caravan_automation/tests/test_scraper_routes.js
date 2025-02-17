const axios = require('axios');
const routesConfig = require('./routes');

const testScraperRoute = async (routeName, baseUrl, testParams) => {
  const startTime = process.hrtime();
  const { dates, guests } = testParams;
  
  try {
    // Log the full request details
    const requestUrl = `${baseUrl}/api/scrape/${routeName}`;
    const requestParams = { 
      num_adults: guests.numAdults, 
      num_kids: guests.numKids, 
      start_date: dates.startDate, 
      end_date: dates.endDate 
    };

    const response = await axios.get(requestUrl, { 
      params: requestParams,
      timeout: 180000 // 180 seconds in milliseconds
    });
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds + nanoseconds / 1e9;

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

const runScraperTests = async (testParams, routeName) => {
  return testScraperRoute(routeName, routesConfig.baseUrl, testParams);
};

module.exports = { runScraperTests };
