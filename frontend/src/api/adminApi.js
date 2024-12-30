import axios from "axios";

// Base URL from environment variables
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Logs in the admin user.
 * @param {string} password - Admin password
 * @returns {Promise} - Resolves with the token or rejects with an error
 */
export const adminLogin = (password) => {
    return axios.post(`${BASE_URL}/api/caravan-admin/login`, { password });
};

/**
 * Fetch details for a specific trip by ID.
 * @param {string} tripId - The ID of the trip
 * @returns {Promise} - Resolves with trip details or rejects with an error
 */
export const getTripDetails = (tripId) => {
    const token = localStorage.getItem("token");
    return axios.get(`${BASE_URL}/api/trip/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * Fetch all trips.
 * @returns {Promise} - Resolves with all trips or rejects with an error
 */
export const getAllTrips = () => {
    console.log("Getting all trips");
    console.log("token", localStorage.getItem("token"));
    const token = localStorage.getItem("token");
    return axios.get(`${BASE_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};


export const searchTripsByEmail = async (email) => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/api/trips/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email },
    });
    return response;
};


export const deleteTripById = async (tripId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${BASE_URL}/api/trip/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response;
};
