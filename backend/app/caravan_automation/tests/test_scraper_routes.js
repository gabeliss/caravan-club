const axios = require('axios');
const routesConfig = require('./routes');

const testScraperRoute = async (routeName, baseUrl, testParams) => {
  const startTime = new Date();
  const { dates, guests } = testParams;
  try {
    console.log(`Testing scraper: ${routeName}...`);
    const response = await axios.get(`${baseUrl}/api/scrape/${routeName}`, {
      params: { 
        num_adults: guests.numAdults, 
        num_kids: guests.numKids, 
        start_date: dates.startDate, 
        end_date: dates.endDate 
      }
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

const runScraperTests = async (testParams) => {
  const results = await Promise.all(
    routesConfig.scrapers.map(route =>
      testScraperRoute(route, routesConfig.baseUrl, testParams)
    )
  );
  return results;
};

module.exports = { runScraperTests };
