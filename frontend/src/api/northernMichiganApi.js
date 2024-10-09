import axios from 'axios';

const SCRAPE_ENDPOINT = 'http://127.0.0.1:5000/api/scrape';
const PAYMENT_ENDPOINT = 'http://127.0.0.1:5000/api/pay';

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
