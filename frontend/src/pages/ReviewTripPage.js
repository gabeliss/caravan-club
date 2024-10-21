import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateTotalForStay, formatDates } from './../utils/helpers';
import accommodationsData from './../northernmichigandata.json';
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const { state } = useLocation();  // Use the state passed from BookNorthernMichiganPage.js

    // Destructure the state to get trip details directly
    const { tripTitle, num_adults, num_kids, start_date, end_date, selectedAccommodations, segments } = state;

    const [placeDetails, setPlaceDetails] = useState(accommodationsData);  // No need for local storage here

    const navigate = useNavigate();

    const [totals, setTotals] = useState({});

    // Helper function to calculate number of nights
    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    useEffect(() => {
        if (selectedAccommodations) {
            const newTotals = {};

            Object.entries(selectedAccommodations).forEach(([city, accommodationKey]) => {
                const segment = segments[city];
                if (segment) {
                    const numNights = calculateNights(segment.start, segment.end);  // Calculate number of nights
                    newTotals[city] = calculateTotalForStay(city, accommodationKey, placeDetails, numNights);
                }
            });

            setTotals(newTotals);
        }
    }, [selectedAccommodations, placeDetails, segments]);

    const calculateTotalPriceWithFees = () => {
        return Object.values(totals).reduce((sum, total) => sum + total.payment, 0).toFixed(2);
    };

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    const handleConfirm = () => {
        const totalPrice = calculateTotalPriceWithFees();
        navigate('/payments', {
            state: {
                selectedAccommodations,
                totalPrice,
                num_adults,
                num_kids,
                start_date,
                end_date,
                placeDetails
            }
        });
    };

    return (
        <div className='review-trip-page'>
            <h1 className='header-title'>Review Your Road Trip</h1>
            <h3 className='header-info'><strong>Trip: </strong>{tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
            <h3 className='header-info'><strong>Adults: </strong>{num_adults}</h3>
            <h3 className='header-info'><strong>Kids: </strong>{num_kids}</h3>
            <h3 className='header-info'><strong>Dates: </strong>{start_date && end_date ? formatDates(start_date, end_date) : 'Dates not available'}</h3>
            
            {Object.entries(segments).map(([city, dateRange]) => (
                <div className='nightstay' key={city}>
                    <h2>{placeDetails[city]?.tent[selectedAccommodations[city]]?.title || 'Not Selected'}</h2>
                    <h2>Total for Stay: ${totals[city]?.total?.toFixed(2) || '0.00'}</h2>
                    {totals[city]?.disclaimer && 
                    <>
                        <h2>Payment Due: ${totals[city]?.payment?.toFixed(2)}</h2>
                        <h2 className='stay-disclaimer'>{totals[city]?.disclaimer}</h2>
                    </>
                    }
                </div>
            ))}

            <h4 className='disclaimer'>* Note: Total for Stay includes the rate for the number of nights, plus any added taxes / fees estimated for each website. These totals do not include any fees by Caravan Club.</h4>
            <div className='reviewtrip-buttons'>
                <button className='reviewtrip-button' onClick={handleBack}>Back</button>
                <button className='reviewtrip-button' onClick={handleConfirm}>Confirm</button>
            </div>
        </div>
    );
}

export default ReviewTripPage;
