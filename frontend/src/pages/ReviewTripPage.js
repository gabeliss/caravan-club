import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import accommodationsData from './../northernmichigandata.json'
import './../styles/reviewtrip.css';

function ReviewTripPage() {
    const { state } = useLocation();
    const { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } = state || {};

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };
  
    const getAccommodationTitle = (nightKey, index) => {
        if (index === null) return 'Not Selected';
        
        const nightData = accommodationsData[nightKey];
        return nightData && nightData[index] ? nightData[index].title : 'Not Selected';
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
  
    return (
      <div className='review-trip-page'>
        <h1 className='header-title'>Review Your Road Trip</h1>
        <h3 className='header-info'><strong>Trip: </strong>{tripTitle}</h3>
        <h3 className='header-info'><strong>Travelers: </strong>{numTravelers}</h3>
        <h3 className='header-info'><strong>Dates: </strong>{formatDates(startDate, endDate)}</h3>
        <div className='nightstay'>
          <h2>Night 1 and 2: {getAccommodationTitle('night1and2', selectedAccommodations.night1and2)}</h2>
          <h2>Total for Stay: $100</h2>
        </div>
        <div className='nightstay'>
          <h2>Night 3 and 4: {getAccommodationTitle('night3and4', selectedAccommodations.night3and4)}</h2>
          <h2>Total for Stay: $100</h2>
        </div>
        <div className='nightstay'>
          <h2>Night 5: {getAccommodationTitle('night5', selectedAccommodations.night5)}</h2>
          <h2>Total for Stay: $100</h2>
        </div>
        <div className='buttons'>
          <button onClick={handleBack} className='button'>Back</button>
          {/* <Link to="/payments" className='button'>
            <button>Confirm</button>
          </Link> */}
          <button className='button'>
            <Link to="/payments" className='btn-link'>Confirm</Link>
          </button>
        </div>
      </div>
    );
  }

export default ReviewTripPage;