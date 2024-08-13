import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { calculateTotalForStay, formatDates } from './../utils/helpers'
import accommodationsData from './../northernmichigandata.json'
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const { state } = useLocation();
    //const { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } = state || {};
    const [tripDetails, setTripDetails] = useState(() => {
      const savedDetails = localStorage.getItem('tripDetails');
      return savedDetails ? JSON.parse(savedDetails) : state || {};
    });

    const [placeDetails, setPlaceDetails] = useState(() => {
      const savedPlaceDetails = localStorage.getItem('placeDetails');
      return savedPlaceDetails ? JSON.parse(savedPlaceDetails) : accommodationsData;
    });

    const { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } = tripDetails;
    const navigate = useNavigate();

    const [totals, setTotals] = useState({
      night1and2: { total: 0, payment: 0, disclaimer: '' },
      night3and4: { total: 0, payment: 0, disclaimer: '' },
      night5and6: { total: 0, payment: 0, disclaimer: '' }
    });
    

    useEffect(() => {
      if (selectedAccommodations) {
          console.log('Selected Accommodations:', selectedAccommodations);

          const night1and2Totals = calculateTotalForStay('night1and2', selectedAccommodations.night1and2, placeDetails);
          const night3and4Totals = calculateTotalForStay('night3and4', selectedAccommodations.night3and4, placeDetails);
          const night5and6Totals = calculateTotalForStay('night5and6', selectedAccommodations.night5and6, placeDetails);

          console.log('Calculated Totals:', { night1and2Totals, night3and4Totals, night5and6Totals });

          setTotals({
              night1and2: night1and2Totals,
              night3and4: night3and4Totals,
              night5and6: night5and6Totals
          });
      }
  }, [selectedAccommodations, placeDetails]);

    const calculateTotalPriceWithFees = () => {
      return (
          totals.night1and2.payment + 
          totals.night3and4.payment + 
          totals.night5and6.payment
      ).toFixed(2);
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
                numTravelers,
                startDate,
                endDate,
                placeDetails
            }
        });
    };

    return (
        <div className='review-trip-page'>
            <h1 className='header-title'>Review Your Road Trip</h1>
            <h3 className='header-info'><strong>Trip: </strong>{tripTitle}</h3>
            <h3 className='header-info'><strong>Travelers: </strong>{numTravelers}</h3>
            <h3 className='header-info'><strong>Dates: </strong>{formatDates(startDate, endDate)}</h3>
            <div className='nightstay'>
                <h2>Night 1 and 2: {accommodationsData.night1and2[selectedAccommodations.night1and2]?.title || 'Not Selected'}</h2>
                <h2>Total for Stay: ${totals.night1and2.total.toFixed(2)}</h2>
                {totals.night1and2.disclaimer && 
                <>
                  <h2>Payment Due: ${totals.night1and2.payment.toFixed(2)}</h2>
                  <h2 className='stay-disclaimer'>{totals.night1and2.disclaimer}</h2>
                </>
                }
            </div>
            <div className='nightstay'>
                <h2>Night 3 and 4: {accommodationsData.night3and4[selectedAccommodations.night3and4]?.title || 'Not Selected'}</h2>
                <h2>Total for Stay: ${totals.night3and4.total.toFixed(2)}</h2>
                {totals.night3and4.disclaimer && 
                <>
                  <h2>Payment Due: ${totals.night3and4.payment.toFixed(2)}</h2>
                  <h2 className='stay-disclaimer'>{totals.night3and4.disclaimer}</h2>
                </>
                }
            </div>
            <div className='nightstay'>
                <h2>Night 5 and 6: {accommodationsData.night5and6[selectedAccommodations.night5and6]?.title || 'Not Selected'}</h2>
                <h2>Total for Stay: ${totals.night5and6.total.toFixed(2)}</h2>
                {totals.night5and6.disclaimer && 
                <>
                  <h2>Payment Due: ${totals.night5and6.payment.toFixed(2)}</h2>
                  <h2 className='stay-disclaimer'>{totals.night5and6.disclaimer}</h2>
                </>
                }
            </div>
            <h4 className='disclaimer'>* Note: Total for Stay includes the rate for 2 nights, plus any added taxes / fees estimated for each website. These totals do not include any fees by Caravan Club.</h4>
            <div className='reviewtrip-buttons'>
                <button className='reviewtrip-button' onClick={handleBack}>Back</button>
                <button className='reviewtrip-button' onClick={handleConfirm}>Confirm</button>
            </div>
        </div>
    );
}

export default ReviewTripPage;
