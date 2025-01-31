import React, { useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import '../../styles/components/pay/payment-trip-details.css';

const PaymentTripDetails = ({ startDate, endDate, numAdults, numKids, totalPrice, segments, selectedAccommodations, placeDetails }) => {
  const [stayOpen, setStayOpen] = useState(false);
  const [taxesOpen, setTaxesOpen] = useState(false);

  // Format dates to display as "Jun 4 - Jun 10"
  const formatDate = (dateString) => {
    // Create date with UTC time to avoid timezone issues
    const date = new Date(dateString + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const formattedDateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const segmentDetails = segments
    ? Object.entries(segments).map(([segmentName, dates]) => {
        const start_date = new Date(dates.start);
        const end_date = new Date(dates.end);
        const numNights = (end_date - start_date) / (1000 * 60 * 60 * 24);

        const selected_accommodation = selectedAccommodations?.[segmentName];
        const accommodationData = placeDetails?.[segmentName]?.tent?.[selected_accommodation];
        const pricePerNight = accommodationData?.price || 0;
        const fixedFee = accommodationData?.fixedFee || 0;
        const segmentPrice = pricePerNight * numNights;
        const formattedDateRange = `${formatDate(dates.start)} - ${formatDate(dates.end)}`;
        
        const taxRate = accommodationData?.taxRate || 0;
        const segmentTax = (segmentPrice * taxRate) + fixedFee;

        return {
          dateRange: formattedDateRange,
          price: segmentPrice,
          tax: segmentTax
        };
      })
    : [];
      
  const travelerText = `${numAdults} ${numAdults === 1 ? 'Adult' : 'Adults'}${numKids > 0 ? `, ${numKids} ${numKids === 1 ? 'Kid' : 'Kids'}` : ''}`;

  const totalTax = segmentDetails.reduce((sum, segment) => sum + segment.tax, 0);
  const subtotal = segmentDetails.reduce((sum, segment) => sum + segment.price, 0);
  const caravanFee = ((subtotal + totalTax) * 0.03).toFixed(2);
  const finalTotal = (subtotal + totalTax + parseFloat(caravanFee)).toFixed(2);

  return (
    <div className='payment-trip-details'>
      <h2>Trip Details:</h2>
      <div className='payment-dates-and-travelers'>
        <div className='payment-dates'>
          <CalendarMonthIcon />
          <h3>{formattedDateRange}</h3>
        </div>
        <div className='payment-travelers'>
          <PersonIcon />
          <h3>{travelerText}</h3>
        </div>
      </div> 
      <div className='payment-prices'>
        <div className='payment-stay'>
          <div className='payment-section-header' onClick={() => setStayOpen(!stayOpen)}>
            <h3>Stay</h3>
            <div className='price-and-icon'>
              <KeyboardArrowDownIcon className={`arrow-icon ${stayOpen ? 'rotated' : ''}`} />
            </div>
          </div>
          {stayOpen && (
            <div className='payment-details'>
              {segmentDetails.map((segment, index) => (
                <p key={index}>{segment.dateRange} - ${segment.price.toFixed(2)}</p>
              ))}
            </div>
          )}
        </div>
        <div className='payment-taxes-and-fees'>
          <div className='payment-section-header' onClick={() => setTaxesOpen(!taxesOpen)}>
            <h3>Taxes & Fees</h3>
            <div className='price-and-icon'>
              <KeyboardArrowDownIcon className={`arrow-icon ${taxesOpen ? 'rotated' : ''}`} />
            </div>
          </div>
          {taxesOpen && (
            <div className='payment-details'>
              <p>Campground Taxes and Fees - ${totalTax.toFixed(2)}</p>
              <p>CaraVan Booking Fee - ${caravanFee}</p>
            </div>
          )}
        </div>
      </div>
      <div className='payment-total'>
        <h3>Total</h3>
        <p>${finalTotal}</p>
      </div>
    </div>
  );
};

export default PaymentTripDetails;