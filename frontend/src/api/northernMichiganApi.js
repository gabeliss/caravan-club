import axios from 'axios';

const API_ENDPOINT = 'http://127.0.0.1:5000/api/scrape';

export const fetchAccommodationDetails = async (accommodationType, numTravelers, startDate, endDate) => {
    const url = `${API_ENDPOINT}/${accommodationType}`;
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
