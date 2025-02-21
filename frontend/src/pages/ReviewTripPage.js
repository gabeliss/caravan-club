import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateTotalForStay, formatDates } from './../utils/helpers';
import accommodationsData from './../northernmichigandata.json';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import './../styles/reviewtrip.css';
import ToggleList from '../components/book/BookPagesToggle';
import ReviewToggleItem from '../components/book/ReviewToggleItem';

function ReviewTripPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize placeDetails state
    const [placeDetails, setPlaceDetails] = useState(accommodationsData);

    const [totals, setTotals] = useState({});
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 914);

    // Listen for screen resize to update `isSmallScreen`
    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 914);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Check if the component has mounted
        const checkStateAndNavigate = () => {
            console.log('location.state', location.state);
            const savedState = localStorage.getItem('tripState');
            console.log('savedState', savedState);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                console.log('parsedState', parsedState);
                if (!location.state) {
                    console.log('navigating to home');
                    navigate('/', { state: parsedState });
                }
            } else if (!location.state) {
                console.log('navigating to home');
                navigate('/');
            }
        };

        // Run the check after the component has mounted
        checkStateAndNavigate();
    }, [navigate, location.state]);

    useEffect(() => {
        if (location.state) {
            // Save state to local storage whenever it changes
            console.log('saving state to local storage');
            localStorage.setItem('tripState', JSON.stringify(location.state));
        }
    }, [location.state]);

    const {
        tripTitle = '',
        num_adults = 0,
        num_kids = 0,
        start_date = '',
        end_date = '',
        nights = 0,
        selectedAccommodations = {},
        segments = {}
    } = location.state || {};

    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatToReadableDate = (dateStr) => {
        const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', options);
    };

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

    useEffect(() => {
        const savedTotals = localStorage.getItem('newTotals');
        if (savedTotals) {
            setTotals(JSON.parse(savedTotals));
            console.log('Loaded totals from localStorage:', JSON.parse(savedTotals));
        }

        const savedPlaceDetails = localStorage.getItem('updatedPlaceDetails');
        if (savedPlaceDetails) {
            setPlaceDetails(JSON.parse(savedPlaceDetails)); // Load updated data from localStorage
            console.log('Loaded updated place details from localStorage:', JSON.parse(savedPlaceDetails));
        }
    }, []);

    useEffect(() => {
        if (selectedAccommodations && placeDetails && segments) {
            const newTotals = {};

            Object.entries(selectedAccommodations).forEach(([city, selected_accommodation]) => {
                const segment = segments[city];
                if (segment) {
                    const numNights = calculateNights(segment.start, segment.end);
                    console.log("calculateTotalForStay params", city, selected_accommodation, placeDetails, numNights);
                    newTotals[city] = calculateTotalForStay(city, selected_accommodation, placeDetails, numNights);
                }
            });

            setTotals(newTotals);
            localStorage.setItem('newTotals', JSON.stringify(newTotals));
            console.log('Calculated and saved newTotals:', newTotals);
        } else {
            console.log('Missing data for recalculation:', { selectedAccommodations, placeDetails, segments });
        }
    }, [selectedAccommodations, placeDetails, segments]);

    const calculateTotalPriceWithFees = () => {
        return Object.values(totals).reduce((sum, total) => sum + total.payment, 0).toFixed(2);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleConfirm = () => {
        const totalPrice = calculateTotalPriceWithFees();
        navigate('/payments', {
            state: {
                selectedAccommodations,
                totalPrice,
                segments,
                num_adults,
                num_kids,
                start_date,
                end_date,
                nights,
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

    // Map city keys to display names
    const cityDisplayNames = {
        traverseCity: 'Traverse City',
        mackinacCity: 'Mackinac City',
        picturedRocks: 'Pictured Rocks'
    };

    // Function to calculate total price including taxes and fees
    const calculateTotalPrice = (basePrice, taxes, fees, numNights) => {
        const totalBasePrice = basePrice * numNights;
        const totalTaxes = taxes * numNights;
        return totalBasePrice + totalTaxes + fees;
    };

    return (
        <div className="review-trip-page">
            <h1 className="header-title">Review Your Road Trip</h1>
            <h3 className="header-info">
                <strong>Trip: </strong>
                {tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h3>
            <h3 className="header-info"><strong>Adults: </strong>{num_adults} • <strong>Kids: </strong>{num_kids}</h3>
            <h3 className="header-info"><strong>Dates: </strong>{start_date && end_date ? formatDates(start_date, end_date) : 'Dates not available'}</h3>

            <div className="nightstays-container">
                {Object.entries(selectedAccommodations).map(([city, selected_accommodation]) => {
                    const accommodationDetails = placeDetails[city]?.tent[selected_accommodation];
                    if (!accommodationDetails) return null;

                    const segment = segments[city];
                    const numNights = calculateNights(segment.start, segment.end);

                    const nightRange = `${calculateNightRanges(segments)[city].range}: ${cityDisplayNames[city]}`;

                    // Calculate base price, taxes, and fees
                    const basePrice = accommodationDetails.price || 0;
                    const taxes = (accommodationDetails.price || 0) * (accommodationDetails.taxRate || 0);
                    const fees = accommodationDetails.fixedFee || 0;
                    const totalPrice = calculateTotalPrice(basePrice, taxes, fees, numNights);

                    return (
                        <ReviewToggleItem
                            key={city}
                            title={accommodationDetails.title}
                            content={accommodationDetails.content}
                            availability={accommodationDetails.available}
                            price={totalPrice}
                            message={accommodationDetails.message}
                            details={{
                                ...accommodationDetails,
                                basePrice,
                                taxes,
                                fees,
                                numNights
                            }}
                            nightRange={nightRange}
                        />
                    );
                })}
            </div>
            <div className="reviewtrip-buttons">
                <button className="reviewtrip-button" onClick={handleBack}>Back</button>
                <button className="reviewtrip-button" onClick={handleConfirm}>Calculate Total</button>
            </div>
        </div>
    );
}

export default ReviewTripPage;
