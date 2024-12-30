import React, { useState, useEffect } from "react";
import { adminLogin, getTripDetails, getAllTrips, searchTripsByEmail, deleteTripById } from "../api/adminApi"; // Import API functions
import { jwtDecode } from "jwt-decode"; // Correct import
import "../styles/Admin.css";

function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState("");

    const [tripId, setTripId] = useState("");
    const [tripData, setTripData] = useState(null);
    const [allTrips, setAllTrips] = useState(null);
    const [deleteTripId, setDeleteTripId] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Validate token on load
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                // Token expired
                logout();
            } else {
                setIsLoggedIn(true); // Token is valid
            }
        } catch (err) {
            // Invalid token
            logout();
        }
    }, []);

    // Logout and clear local storage
    const logout = () => {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    // Handle login API call
    const handleLogin = async () => {
        try {
            const response = await adminLogin(password); // Call login API
            console.log("login response", response);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("token", response.data.token);
            console.log("set token", localStorage.getItem("token"));
            setIsLoggedIn(true);
            setError("");
        } catch (err) {
            setError("Invalid password");
        }
    };

    // Fetch trip details
    const fetchTripDetails = async () => {
        try {
            const response = await getTripDetails(tripId);
            console.log("trip details response", response);
            setTripData(response.data);
            setAllTrips(null);
            setError("");
        } catch (err) {
            handleError(err);
        }
    };

    // Fetch all trips
    const fetchAllTrips = async () => {
        try {
            const response = await getAllTrips();
            console.log("all trips response", response);
            setAllTrips(response.data.trips);
            setTripData(null);
            setError("");
        } catch (err) {
            handleError(err);
        }
    };


    const searchTrips = async () => {
        try {
            const response = await searchTripsByEmail(email);
            console.log("search trips response", response);
            setAllTrips(response.data.trips);
            setTripData(null);
            setError("");
        } catch (err) {
            handleError(err);
        }
    };


    const handleDeleteTrip = async () => {
        try {
            await deleteTripById(deleteTripId);
            setError(""); // Clear any previous errors
            setSuccessMessage(`Trip with ID ${deleteTripId} deleted successfully.`);
            setDeleteTripId(""); // Reset input
            fetchAllTrips();
        } catch (err) {
            setSuccessMessage(""); // Clear any previous success message
            if (err.response?.status === 404) {
                setError("Trip not found.");
            } else if (err.response?.status === 401) {
                logout(); // Handle token expiration
            } else {
                setError("Something went wrong.");
            }
        }
    };

    // Handle API errors
    const handleError = (err) => {
        if (err.response?.status === 401) {
            logout(); // Token expired or invalid
        } else {
            setError(err.response?.data?.error || "Something went wrong");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-container">
                <h1 className="admin-h1">Admin Login</h1>
                <input
                    className="admin-input"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="admin-button" onClick={handleLogin}>
                    Login
                </button>
                {error && <p className="admin-error">{error}</p>}
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <button className="admin-logout" onClick={logout}>
                    Logout
                </button>
                <h1 className="admin-h1">Admin Panel</h1>
                <div className="admin-actions">
                    <div className="admin-action">
                        <button className="admin-button" onClick={fetchAllTrips}>
                            View All Trips
                        </button>
                    </div>
                    <div className="admin-action">
                        <label className="admin-label">
                            Get Trip ID:
                            <input
                                className="admin-input"
                                type="text"
                                value={tripId}
                                onChange={(e) => setTripId(e.target.value)}
                            />
                        </label>
                        <button className="admin-button" onClick={fetchTripDetails}>
                            Get Trip Details
                        </button>
                    </div>
                    <div className="admin-action">
                        <label className="admin-label">
                            Email:
                            <input
                                className="admin-input"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        <button className="admin-button" onClick={searchTrips}>
                            Search Trips by Email
                        </button>
                    </div>
                    <div className="admin-action">
                        <label className="admin-label">
                            Delete Trip ID:
                            <input
                                className="admin-input"
                                type="text"
                                value={deleteTripId}
                            onChange={(e) => setDeleteTripId(e.target.value)}
                            />
                        </label>
                        <button className="admin-button" onClick={handleDeleteTrip}>
                            Delete Trip
                        </button>
                    </div>
                </div>
                {error && <p className="admin-error">{error}</p>}
                {successMessage && <p className="admin-success">{successMessage}</p>}
                {allTrips && (
                    <div className="admin-trip-details">
                        <h2 className="admin-h2">All Trips</h2>
                        {allTrips.length === 0 ? (
                            <p>No trips to display</p>
                        ) : (
                            <div className="segments-table-container">
                                <table className="admin-table segments-table">
                                    <thead>
                                        <tr>
                                            <th>Trip ID</th>
                                            <th>Customer</th>
                                            <th>Destination</th>
                                            <th>Dates</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date Booked</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allTrips.map((trip) => (
                                            <tr key={trip.trip_id}>
                                                <td>{trip.trip_id}</td>
                                                <td>{`${trip.user.first_name} ${trip.user.last_name}`}</td>
                                                <td>{trip.destination}</td>
                                                <td>{`${trip.start_date} to ${trip.end_date}`}</td>
                                                <td>${trip.grand_total}</td>
                                                <td>
                                                    {trip.trip_fully_processed
                                                        ? "Processed"
                                                        : "Pending"}
                                                </td>
                                                <td>{trip.date_booked}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {tripData && (
                    <div>
                        <h2 className="admin-h2">Trip Details</h2>
                        <div className="admin-trip-details">
                            <h3>User Information</h3>
                            <p><strong>First Name:</strong> {tripData.user.first_name}</p>
                            <p><strong>Last Name:</strong> {tripData.user.last_name}</p>
                            <p><strong>Email:</strong> {tripData.user.email}</p>
                            <p><strong>Phone Number:</strong> {tripData.user.phone_number}</p>
                            <p><strong>Address:</strong> {`${tripData.user.street_address}, ${tripData.user.city}, ${tripData.user.state} ${tripData.user.zip_code}, ${tripData.user.country}`}</p>
                            <p><strong>Cardholder Name:</strong> {tripData.user.cardholder_name}</p>
                            <p><strong>Card Number:</strong> {tripData.user.card_number}</p>
                            <p><strong>Card Type:</strong> {tripData.user.card_type}</p>
                            <p><strong>Expiry Date:</strong> {tripData.user.expiry_date}</p>
                            <p><strong>CVC:</strong> {tripData.user.cvc}</p>

                            <h3>Trip Information</h3>
                            <p><strong>Destination:</strong> {tripData.trip.destination}</p>
                            <p><strong>Start Date:</strong> {tripData.trip.start_date}</p>
                            <p><strong>End Date:</strong> {tripData.trip.end_date}</p>
                            <p><strong>Nights:</strong> {tripData.trip.nights}</p>
                            <p><strong>Number of Adults:</strong> {tripData.trip.num_adults}</p>
                            <p><strong>Number of Kids:</strong> {tripData.trip.num_kids}</p>
                            <p><strong>Caravan Fee:</strong> ${tripData.trip.caravan_fee}</p>
                            <p><strong>Grand Total:</strong> ${tripData.trip.grand_total}</p>
                            <p><strong>Trip Fully Processed:</strong> {tripData.trip.trip_fully_processed ? "Yes" : "No"}</p>
                            <p><strong>Date Booked:</strong> {tripData.trip.date_booked}</p>

                            <h3>Trip Segments</h3>
                            <div className="segments-table-container">
                                <table className="admin-table segments-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Accommodation</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Nights</th>
                                            <th>Base Price</th>
                                            <th>Tax</th>
                                            <th>Total</th>
                                            <th>Payment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tripData.trip.segments.map((segment, index) => (
                                            <tr key={index}>
                                                <td>{segment.name}</td>
                                                <td>{segment.selected_accommodation}</td>
                                                <td>{segment.start_date}</td>
                                                <td>{segment.end_date}</td>
                                                <td>{segment.nights}</td>
                                                <td>${segment.base_price}</td>
                                                <td>${segment.tax}</td>
                                                <td>${segment.total}</td>
                                                <td>{segment.payment_successful ? "Successful" : "Failed"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;
