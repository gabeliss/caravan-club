import React from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import '../../styles/components/pay/payment-trip-details.css';

const PaymentTripDetails = () => {
  return (
    <div className='payment-trip-details'>
      <h2>Trip Details:</h2>
      <div className='payment-dates-and-travelers'>
        <div className='payment-dates'>
          <CalendarMonthIcon />
          <h3>Dates</h3>
        </div>
        <div className='payment-travelers'>
          <PersonIcon />
          <h3>Travelers</h3>
        </div>
      </div> 
      <div className='payment-prices'>
        <div className='payment-stay'>
          <h3>Stay</h3>
        </div>
        <div className='payment-taxes-and-fees'>
          <h3>Taxes & Fees</h3>
        </div>
      </div>
      <div className='payment-total'>
        <h3>Total</h3>
      </div>
    </div>
  );
};

export default PaymentTripDetails;