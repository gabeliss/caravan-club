import axios from 'axios';

const SCRAPE_ENDPOINT = 'http://127.0.0.1:5000/api/scrape';
const PAYMENT_ENDPOINT = 'http://127.0.0.1:5000/api/pay';

export const fetchAccommodationDetails = async (accommodationType, numTravelers, startDate, endDate) => {
    const url = `${SCRAPE_ENDPOINT}/${accommodationType}`;
    try {
        const response = await axios.get(url, {
            params: { numTravelers, startDate, endDate }
        });
        console.log('fetchAccomodationDetails response.data', accommodationType, response.data)
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const initiatePayment = async (accommodationType, numTravelers, startDate, endDate, stayName, payment_info) => {
    console.log("initiatePaymentParams:", accommodationType, numTravelers, startDate, endDate, stayName, payment_info)
    console.log("stayName", stayName)
    const url = `${PAYMENT_ENDPOINT}/${accommodationType}`;
    try {
        const response = await axios.get(url, {
            params: { numTravelers, startDate, endDate, stayName, payment_info }
        });
        console.log('initiatePayment response.data', accommodationType, response.data)
        return response.data;
    } catch (error) {
        throw error;
    }
};
