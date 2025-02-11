const axios = require('axios');
const routesConfig = require('./routes');

const testScraperRoute = async (routeName, baseUrl, testParams) => {
  const startTime = new Date();
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

    const response = await axios.get(requestUrl, { params: requestParams });
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

const runScraperTests = async (testParams, routeName) => {
  console.log(`Starting scraper test for ${routeName} with base URL: ${routesConfig.baseUrl}`);
  return testScraperRoute(routeName, routesConfig.baseUrl, testParams);
};

module.exports = { runScraperTests };
