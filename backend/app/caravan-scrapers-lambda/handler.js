const { scrapeTeePeeCampgroundTent } = require('./scrapers/scrape_teePeeCampgroundTent');

exports.scrapeHandler = async (event) => {
  try {
    const body = JSON.parse(event.body); // Ensure event body is parsed
    const { startDate, endDate, numAdults, numKids } = body;

    console.log(`Received request for startDate: ${startDate}, endDate: ${endDate}, numAdults: ${numAdults}, numKids: ${numKids}`);

    const result = await scrapeTeePeeCampgroundTent(startDate, endDate, numAdults, numKids);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(`Error in handler: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
