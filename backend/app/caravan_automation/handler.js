const { scrapeTeePeeCampgroundTent } = require('./scrapers/scrape_teePeeCampgroundTent');
const { scrapeWhiteWaterParkTent } = require('./scrapers/scrape_whiteWaterParkTent');
const { payUncleDuckysTent } = require('./payers/pay_uncleDuckysTent');
const { payLeelanauPinesTent } = require('./payers/pay_leelanauPinesTent');
const { payTeePeeCampgroundTent } = require('./payers/pay_teePeeCampgroundTent');
const { payIndianRiverTent } = require('./payers/pay_indianRiverTent');
const { payTouristParkTent } = require('./payers/pay_touristParkTent');
const { payFortSuperiorTent } = require('./payers/pay_fortSuperiorTent');
const { payTimberRidgeTent } = require('./payers/pay_timberRidgeTent');
const { payWhiteWaterParkTent } = require('./payers/pay_whiteWaterParkTent');

const createPaymentHandler = (operation, operationName) => async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { startDate, endDate, numAdults, numKids, paymentInfo, executePayment = false } = body;

    const result = await operation(
      startDate, 
      endDate, 
      numAdults, 
      numKids, 
      paymentInfo,
      executePayment
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error in ${operationName}: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

const createScrapeHandler = (operation, operationName) => async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { startDate, endDate, numAdults, numKids } = body;

    const result = await operation(
      startDate, 
      endDate, 
      numAdults, 
      numKids
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error in ${operationName}: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Export scrape handler
exports.scrapeTeePeeCampgroundTent = createScrapeHandler(
  scrapeTeePeeCampgroundTent,
  'scrapeTeePee'
);

exports.scrapeWhiteWaterParkTent = createScrapeHandler(
  scrapeWhiteWaterParkTent,
  'scrapeWhiteWaterPark'
);

// Export payment handlers
exports.payUncleDuckysTent = createPaymentHandler(
  payUncleDuckysTent,
  'payUncleDuckys'
);

exports.payLeelanauPinesTent = createPaymentHandler(
  payLeelanauPinesTent,
  'payLeelanauPines'
);

exports.payTeePeeCampgroundTent = createPaymentHandler(
  payTeePeeCampgroundTent,
  'payTeePee'
);

exports.payIndianRiverTent = createPaymentHandler(
  payIndianRiverTent,
  'payIndianRiver'
);

exports.payTouristParkTent = createPaymentHandler(
  payTouristParkTent,
  'payTouristPark'
);

exports.payFortSuperiorTent = createPaymentHandler(
  payFortSuperiorTent,
  'payFortSuperior'
);

exports.payTimberRidgeTent = createPaymentHandler(
  payTimberRidgeTent,
  'payTimberRidge'
);

exports.payWhiteWaterParkTent = createPaymentHandler(
  payWhiteWaterParkTent,
  'payWhiteWaterPark'
);