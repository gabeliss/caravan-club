import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import accommodationsData from './../northernmichigandata.json'
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const { state } = useLocation();
    const { numTravelers, startDate, endDate, selectedAccommodations } = state || {};
  
    const getAccommodationTitle = (nightKey, index) => {
        if (index === null) return 'Not Selected';
        
        const nightData = accommodationsData[nightKey];
        return nightData && nightData[index] ? nightData[index].title : 'Not Selected';
    };
  
    return (
      <div className='review-trip-page'>
          <h3>Number of travelers: {numTravelers}</h3>
          <h3>Start Date: {startDate}</h3>
          <h3>End Date: {endDate}</h3>
          <h3>Night 1 and 2 Stay: {getAccommodationTitle('night1and2', selectedAccommodations.night1and2)}</h3>
          <h3>Night 3 and 4 Stay: {getAccommodationTitle('night3and4', selectedAccommodations.night3and4)}</h3>
          <h3>Night 5 Stay: {getAccommodationTitle('night5', selectedAccommodations.night5)}</h3>
      </div>
    );
  }

export default ReviewTripPage;