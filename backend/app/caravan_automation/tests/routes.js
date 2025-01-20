require('dotenv').config({ path: './backend/.env.local' });

module.exports = {
    scrapers: [
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
      'touristParkTent'
    ],
    baseUrl: `${process.env.REACT_APP_API_BASE_URL}`
  };
  