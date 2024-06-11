import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import accommodationsData from './../northernmichigandata.json'
import './../styles/reviewtrip.css';
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const { state } = useLocation();
    const { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } = state || {};

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };
  
    const getAccommodationDetails = (nightKey, accommodationKey, detail) => {
      if (accommodationKey == null) return 'Not Selected';
  
      const nightData = accommodationsData[nightKey];
      const accommodation = nightData[accommodationKey];
      if (detail == 'title') {
        return accommodation ? accommodation.title : 'Not Selected';
      }
      else {
        return accommodation ? accommodation.price : 'Not Selected';
      }
    };


    const calculateTotalPrice = () => {
      const night1and2Price = parseFloat(getAccommodationDetails('night1and2', selectedAccommodations.night1and2, 'price'));
      const night3and4Price = parseFloat(getAccommodationDetails('night3and4', selectedAccommodations.night3and4, 'price'));
      const night5and6Price = parseFloat(getAccommodationDetails('night5and6', selectedAccommodations.night5and6, 'price'));
      
      return (night1and2Price + night3and4Price + night5and6Price).toFixed(2);
    };
  


    const formatDates = (startDate, endDate) => {

      const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00');
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
    
        const getOrdinalSuffix = (day) => {
          if (day > 3 && day < 21) return 'th';
          switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
          }
        };
    
        return `${monthName} ${day}${getOrdinalSuffix(day)}`;
      };
    
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
    
      return `${formattedStart} - ${formattedEnd}`;
    };

    const handleConfirm = () => {
      const totalPrice = calculateTotalPrice();
      navigate('/payments', {
          state: {
              selectedAccommodations,
              totalPrice,
              numTravelers,
              startDate,
              endDate
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
          <h2>Night 1 and 2: {getAccommodationDetails('night1and2', selectedAccommodations.night1and2, 'title')}</h2>
          <h2>Total for Stay: ${getAccommodationDetails('night1and2', selectedAccommodations.night1and2, 'price')}</h2>
        </div>
        <div className='nightstay'>
          <h2>Night 3 and 4: {getAccommodationDetails('night3and4', selectedAccommodations.night3and4, 'title')}</h2>
          <h2>Total for Stay: ${getAccommodationDetails('night3and4', selectedAccommodations.night3and4, 'price')}</h2>
        </div>
        <div className='nightstay'>
          <h2>Night 5 and 6: {getAccommodationDetails('night5and6', selectedAccommodations.night5and6, 'title')}</h2>
          <h2>Total for Stay: ${getAccommodationDetails('night5and6', selectedAccommodations.night5and6, 'price')}</h2>
        </div>
        <div className='buttons'>
          <button className='button' onClick={handleBack}>Back</button>
          <button className='button' onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
    );
  }

export default ReviewTripPage;