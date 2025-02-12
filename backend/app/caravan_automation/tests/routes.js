require('dotenv').config({ path: './backend/.env.local' });

module.exports = {
    scrapers: [
      'whiteWaterParkTent',
      'timberRidgeTent',
      'leelanauPinesTent',
      'indianRiverTent', 
      'teePeeCampgroundTent',
      'uncleDuckysTent',
      'fortSuperiorTent',
      'touristParkTent'
    ],
    payers: [
      'timberRidgeTent',
      'leelanauPinesTent',
      'indianRiverTent',
      'teePeeCampgroundTent', 
      'uncleDuckysTent',
      'fortSuperiorTent',
      'touristParkTent',
      'whiteWaterParkTent'
    ],
    baseUrl: `${process.env.REACT_APP_API_BASE_URL}`
  };
  