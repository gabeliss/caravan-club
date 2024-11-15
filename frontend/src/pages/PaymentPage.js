import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/payment.css';
import { convertDateFormat } from './../utils/helpers.js';
import { initiatePayment } from '../api/northernMichiganApi.js';
import PaymentForm from './../components/pay/PaymentForm.js';
import CustomLoader from '../components/general/CustomLoader';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const state = location.state;
  
  const { 
    selectedAccommodations, 
    totalPrice, 
    num_adults, 
    num_kids, 
    segments,
    placeDetails 
  } = state || {};


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
      const accommodationKey = selectedAccommodations[segmentName];

      return {
        accommodationKey,
        start_date,
        end_date
      };
    });

    console.log('segmentPayments', segmentPayments);
    setIsLoading(true);

    try {
      const responses = await Promise.allSettled(
        segmentPayments.map(({ accommodationKey, start_date, end_date }) =>
          initiatePayment(
            accommodationKey,
            start_date,
            end_date,
            num_adults,
            num_kids,
            paymentInfo
          )
        )
      );

      
      const paymentStatus = Object.keys(segments).reduce((acc, segmentName, index) => {
        const status = responses[index].status === 'fulfilled' ? 'success' : 'error';
        acc[segmentName] = {
          status: status,
          accommodationKey: segmentPayments[index].accommodationKey
        };
        return acc;
      }, {});
      console.log('Final payment status object:', paymentStatus);

      navigate('/payments-confirmation', { state: { paymentStatus } });

    } catch (error) {
      console.error('Error in payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='payment-page center'>
      {isLoading ? (
        <CustomLoader />
      ) : (
        <>
          <h1 className='center'>Pay Now</h1>
          <PaymentForm
            paymentInfo={paymentInfo}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleBack={handleBack}
            totalPrice={totalPrice}
          />
        </>
      )}
    </div>
  );
}

export default PaymentPage;
