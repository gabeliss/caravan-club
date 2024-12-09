import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateTotalForStay, formatDates } from './../utils/helpers';
import accommodationsData from './../northernmichigandata.json';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const location = useLocation(); // Always call hooks at the top
    const navigate = useNavigate();

    const [placeDetails, setPlaceDetails] = useState(accommodationsData);
    const [totals, setTotals] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);

    // Redirect if location.state is null or undefined
    useEffect(() => {
        if (!location.state) {
            navigate('/');
        }
    }, [location.state, navigate]);

    // Destructure the state, use empty defaults to avoid conditional destructuring
    const {
        tripTitle = '',
        num_adults = 0,
        num_kids = 0,
        start_date = '',
        end_date = '',
        selectedAccommodations = {},
        segments = {}
    } = location.state || {};

    // Helper to calculate the number of nights
    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Helper to format dates into a readable format
    const formatToReadableDate = (dateStr) => {
        const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', options);
    };

    // Helper to calculate night ranges
    const calculateNightRanges = (segments) => {
        const nightRanges = {};
        let currentNight = 1;

        Object.entries(segments).forEach(([city, dateRange]) => {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            const nights = (endDate - startDate) / (1000 * 60 * 60 * 24);
            const range = nights === 1
                ? `Night ${currentNight}`
                : `Nights ${currentNight} & ${currentNight + nights - 1}`;
            currentNight += nights;
            nightRanges[city] = {
                range,
                start: formatToReadableDate(dateRange.start),
                end: formatToReadableDate(dateRange.end),
            };
        });

        return nightRanges;
    };

    // Calculate totals when dependencies change
    useEffect(() => {
        if (selectedAccommodations && placeDetails && segments) {
            const newTotals = {};

            Object.entries(selectedAccommodations).forEach(([city, accommodationKey]) => {
                const segment = segments[city];
                if (segment) {
                    const numNights = calculateNights(segment.start, segment.end);
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
        console.log('Navigating to payment page with state:', location.state);
        navigate('/payments', {
            state: {
                selectedAccommodations,
                totalPrice,
                segments,
                num_adults,
                num_kids,
                start_date,
                end_date,
                placeDetails,
                tripTitle
            }
        });
    };

    const handlePrevSlide = () => {
        setCurrentSlide(current => 
            current === 0 ? Object.keys(segments).length - 1 : current - 1
        );
    };

    const handleNextSlide = () => {
        setCurrentSlide(current => 
            current === Object.keys(segments).length - 1 ? 0 : current + 1
        );
    };

    // Render logic
    if (!location.state) {
        return null; // Only conditionally return after hooks are defined
    }

    return (
        <div className="review-trip-page">
            <h1 className="header-title">Review Your Road Trip</h1>
            <h3 className="header-info">
                <strong>Trip: </strong>
                {tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h3>
            <h3 className="header-info"><strong>Adults: </strong>{num_adults}</h3>
            <h3 className="header-info"><strong>Kids: </strong>{num_kids}</h3>
            <h3 className="header-info"><strong>Dates: </strong>{start_date && end_date ? formatDates(start_date, end_date) : 'Dates not available'}</h3>

            <div className="nightstays-container">
                {window.innerWidth <= 767 ? (
                    // Mobile view - show carousel with arrows
                    <>
                        <ArrowCircleLeftIcon 
                            className="carousel-arrow left" 
                            onClick={handlePrevSlide}
                            fontSize="large"
                        />
                        {Object.entries(segments).map(([city, dateRange], index) => {
                            const nightRanges = calculateNightRanges(segments);
                            const accommodation = placeDetails[city]?.tent[selectedAccommodations[city]];
                            const firstImageUrl = accommodation?.imageUrls?.[0];

                            return (
                                <div 
                                    className={`nightstay ${index === currentSlide ? 'active' : 'hidden'}`}
                                    key={city}
                                >
                                    <h2>{nightRanges[city].range}</h2>
                                    {firstImageUrl && (
                                        <img
                                            src={firstImageUrl}
                                            alt={accommodation.title}
                                            className="accommodation-image"
                                        />
                                    )}
                                    <h2>{accommodation?.title || 'Not Selected'}</h2>
                                    <h2>Total for Stay: ${totals[city]?.total?.toFixed(2) || '0.00'}</h2>
                                    {totals[city]?.disclaimer && (
                                        <>
                                            <h2>Payment Due: ${totals[city]?.payment?.toFixed(2)}</h2>
                                            <h2 className="stay-disclaimer">{totals[city]?.disclaimer}</h2>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                        <ArrowCircleRightIcon 
                            className="carousel-arrow right" 
                            onClick={handleNextSlide}
                            fontSize="large"
                        />
                    </>
                ) : (
                    // Desktop view - show all cards without arrows
                    Object.entries(segments).map(([city, dateRange]) => {
                        const nightRanges = calculateNightRanges(segments);
                        const accommodation = placeDetails[city]?.tent[selectedAccommodations[city]];
                        const firstImageUrl = accommodation?.imageUrls?.[0];

                        return (
                            <div className="nightstay" key={city}>
                                <h2>{nightRanges[city].range}</h2>
                                {firstImageUrl && (
                                    <img
                                        src={firstImageUrl}
                                        alt={accommodation.title}
                                        className="accommodation-image"
                                    />
                                )}
                                <h2>{accommodation?.title || 'Not Selected'}</h2>
                                <h2>Total for Stay: ${totals[city]?.total?.toFixed(2) || '0.00'}</h2>
                                {totals[city]?.disclaimer && (
                                    <>
                                        <h2>Payment Due: ${totals[city]?.payment?.toFixed(2)}</h2>
                                        <h2 className="stay-disclaimer">{totals[city]?.disclaimer}</h2>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <h4 className="disclaimer">
                * Note: Total for Stay includes the rate for the number of nights, plus any added taxes / fees estimated for each website. These totals do not include any fees by Caravan Club.
            </h4>
            <div className="reviewtrip-buttons">
                <button className="reviewtrip-button" onClick={handleBack}>Back</button>
                <button className="reviewtrip-button" onClick={handleConfirm}>Confirm</button>
            </div>
        </div>
    );
}

export default ReviewTripPage;
