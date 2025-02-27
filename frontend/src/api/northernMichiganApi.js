import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const SCRAPE_ENDPOINT = `${BASE_URL}/api/scrape`;
const PAYMENT_ENDPOINT = `${BASE_URL}/api/pay`;

const apiRouteMappingScrape = {
    'timberRidge': 'timberRidgeTent',
    'leelanauPines': 'leelanauPinesTent',
    'indianRiver': 'indianRiverTent',
    'teePeeCampground': 'teePeeCampgroundTent',
    'uncleDucky': 'uncleDuckysTent',
    'touristPark': 'touristParkTent',
    'fortSuperior': 'fortSuperiorTent',
    'whiteWaterPark': 'whiteWaterParkTent',
};

export const fetchAccommodationDetails = async (selected_accommodation, start_date, end_date, num_adults, num_kids) => {
    const apiEndpoint = apiRouteMappingScrape[selected_accommodation];
    if (!apiEndpoint) {
        console.error(`API route not defined for accommodation: ${selected_accommodation}`);
        return;
    }

    const url = `${SCRAPE_ENDPOINT}/${apiEndpoint}`;
    try {
        const response = await axios.get(url, {
            params: { start_date, end_date, num_adults, num_kids }
        });

        return response.data;
    } catch (error) {
        console.log('fetchAccomodationDetails error', error)
        throw error;
    }
};


export const initiatePayment = async (selected_accommodation, start_date, end_date, num_adults, num_kids, payment_info) => {
    const apiEndpoint = apiRouteMappingScrape[selected_accommodation];
    if (!apiEndpoint) {
        console.error(`API route not defined for accommodation: ${selected_accommodation}`);
        return;
    }
    console.log("initiatePaymentParams:", selected_accommodation, start_date, end_date, num_adults, num_kids, payment_info)
    const url = `${PAYMENT_ENDPOINT}/${apiEndpoint}`;
    try {
        const response = await axios.post(url, {
            params: { start_date, end_date, num_adults, num_kids, payment_info }
        });
        console.log('initiatePayment response.data', selected_accommodation, response.data)
        return response.data;
    } catch (error) {
        console.log('initiatePayment error', error)
        throw error;
    }
};


export const createTrip = async (tripPayload) => {
    const url = `${BASE_URL}/api/trip`;
    try {
        const response = await axios.post(url, tripPayload);
        return response.data;
    } catch (error) {
        console.error('createTrip API error:', error);
        throw error;
    }
};

export const generateConfirmationNumber = () => {
    return axios.get(`${BASE_URL}/api/generate-confirmation`);
};

