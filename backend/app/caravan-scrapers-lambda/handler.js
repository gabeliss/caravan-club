const { scrapeTeePeeCampgroundTent } = require('./scrapers/scrape_teePeeCampgroundTent');
const { payUncleDuckysTent } = require('./scrapers/pay_uncleDuckysTent');

exports.scrapeTeePee = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { startDate, endDate, numAdults, numKids } = body;

    const result = await scrapeTeePeeCampgroundTent(startDate, endDate, numAdults, numKids);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error in scrapeTeePee: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

exports.payUncleDuckys = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { startDate, endDate, numAdults, numKids, paymentInfo } = body;

    const result = await payUncleDuckysTent(startDate, endDate, numAdults, numKids, paymentInfo);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error in payUncleDuckys: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
