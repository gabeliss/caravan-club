import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/payment.css';
import { convertDateFormat } from './../utils/helpers.js';
import { initiatePayment, createTrip } from '../api/northernMichiganApi.js';
import PaymentForm from './../components/pay/PaymentForm.js';
import PaymentTripDetails from './../components/pay/PaymentTripDetails.js';
import CustomLoader from '../components/general/CustomLoader';

function PaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        cardholder_name: '',
        card_number: '',
        card_type: '',
        expiry_date: '',
        cvc: ''
    });

    // Redirect to home page if location.state is null or undefined
    useEffect(() => {
        if (!location.state) {
            navigate('/');
        }
    }, [location.state, navigate]);

    // Destructure state with default values
    const {
        selectedAccommodations = {},
        totalPrice = 0,
        start_date = '',
        end_date = '',
        nights = 0,
        num_adults = 0,
        num_kids = 0,
        segments = {},
        placeDetails = {},
        tripTitle = ''
    } = location.state || {};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo({ ...paymentInfo, [name]: value });
    };

    const handleBack = (e) => {
        e.preventDefault();
        navigate(-1); // Go back to the previous page
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!segments || !selectedAccommodations || !placeDetails) {
            console.error('Missing required state data');
            return;
        }
    
        const segmentPayments = Object.entries(segments).map(([segmentName, dates]) => {
            const start_date = convertDateFormat(dates.start);
            const end_date = convertDateFormat(dates.end);
            const selected_accommodation = selectedAccommodations[segmentName];
    
            return {
                segmentName,
                selected_accommodation,
                start_date,
                end_date,
            };
        });
    
        console.log('segmentPayments', segmentPayments);
        setIsLoading(true);
    
        try {
            // Call `initiatePayment` for all segments
            const paymentResponses = await Promise.allSettled(
                segmentPayments.map(({ selected_accommodation, start_date, end_date }) =>
                    initiatePayment(
                        selected_accommodation,
                        start_date,
                        end_date,
                        num_adults,
                        num_kids,
                        paymentInfo
                    )
                )
            );
            console.log('paymentResponses', paymentResponses);
    
            // Map payment responses to segment data
            const processedSegments = segmentPayments.map(({ segmentName, start_date, end_date }, index) => {
                const paymentResponse = paymentResponses[index];
                if (paymentResponse.status === 'fulfilled') {
                    console.log('Payment successful for segment:', segmentName);
                } else {
                    console.error(`Payment failed for segment: ${segmentName}`, paymentResponse.reason);
                }
                const { base_price, tax, total, payment_successful } = paymentResponse.value;
    
                return {
                    name: segmentName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    selected_accommodation: selectedAccommodations[segmentName].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    start_date,
                    end_date,
                    nights: (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24),
                    base_price,
                    tax,
                    total,
                    payment_successful,
                };
            });
            console.log('processedSegments', processedSegments);
    
            // Construct trip payload
            const tripPayload = {
                user: paymentInfo,
                trip: {
                    destination: tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                    start_date,
                    end_date,
                    nights,
                    num_adults,
                    num_kids,
                    caravan_fee: 0, // Adjust as needed
                    grand_total: totalPrice,
                    trip_fully_processed: processedSegments.every((seg) => seg.payment_successful),
                    segments: processedSegments,
                },
            };
            console.log('tripPayload', tripPayload);
    
            // Call `createTrip` API
            const createTripResponse = await createTrip(tripPayload);
            console.log('Trip created successfully:', createTripResponse);
    
            navigate('/payments-confirmation', { state: { tripId: createTripResponse.trip_id } });
    
        } catch (error) {
            console.error('Error in payment or trip creation:', error);
        } finally {
            setIsLoading(false);
        }
    };
    

    // Render logic
    if (!location.state) {
        return null; // Only conditionally return after hooks are defined
    }

    return (
        <div className={`payment-page ${!isLoading ? 'with-padding' : ''}`}>
            {isLoading ? (
                <CustomLoader />
            ) : (
                <div className='payment-page-container'>
                    <div className='payment-header'>
                        <div className='place-icon-and-name'>
                            <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/locationPin.png" alt="location pin" />
                            <h3>{tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                        </div>
                        <h1>Complete Booking</h1>
                    </div>
                    <PaymentTripDetails 
                        startDate={start_date}
                        endDate={end_date}
                        numAdults={num_adults}
                        numKids={num_kids}
                        totalPrice={totalPrice}
                        segments={segments}
                        selectedAccommodations={selectedAccommodations}
                        placeDetails={placeDetails}
                    />
                    <PaymentForm
                        paymentInfo={paymentInfo}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        handleBack={handleBack}
                        totalPrice={totalPrice}
                    />
                </div>
            )}
        </div>
    );
}

export default PaymentPage;
