import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SCRAPE_ENDPOINT = `${BASE_URL}/api/scrape`;
const PAYMENT_ENDPOINT = `${BASE_URL}/api/pay`;

const apiRouteMappingScrape = {
    'timberRidge': 'timberRidgeTent',
    'leelanauPines': 'leelanauPinesTent',
    'indianRiver': 'indianRiverTent',
    'uncleDucky': 'uncleDuckysTent',
    'touristPark': 'touristParkTent',
    'fortSuperior': 'fortSuperiorTent',
};

export const fetchAccommodationDetails = async (accommodationKey, start_date, end_date, num_adults, num_kids) => {
    const apiEndpoint = apiRouteMappingScrape[accommodationKey];
    if (!apiEndpoint) {
        console.error(`API route not defined for accommodation: ${accommodationKey}`);
        return;
    }
    console.log('Scrape endpoint:', `${SCRAPE_ENDPOINT}/${apiEndpoint}`);
    const url = `${SCRAPE_ENDPOINT}/${apiEndpoint}`;
    try {
        const response = await axios.get(url, {
            params: { start_date, end_date, num_adults, num_kids }
        });
        console.log('fetchAccomodationDetails response.data', accommodationKey, response.data)
        return response.data;
    } catch (error) {
        console.log('fetchAccomodationDetails error', error)
        throw error;
    }
};


export const initiatePayment = async (accommodationType, start_date, end_date, num_adults, num_kids, payment_info) => {
    console.log("initiatePaymentParams:", accommodationType, start_date, end_date, num_adults, num_kids, payment_info)
    const url = `${PAYMENT_ENDPOINT}/${accommodationType}`;
    try {
        const response = await axios.get(url, {
            params: { start_date, end_date, num_adults, num_kids, payment_info }
        });
        console.log('initiatePayment response.data', accommodationType, response.data)
        return response.data;
    } catch (error) {
        console.log('initiatePayment error', error)
        throw error;
    }
};
