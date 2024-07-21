import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/payment.css';
import { adjustDate, convertDateFormat } from './../utils/helpers.js';
import { initiatePayment } from '../api/northernMichiganApi.js';
import PaymentForm from './../components/pay/PaymentForm.js';

function PaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedAccommodations, totalPrice, numTravelers, startDate, endDate, placeDetails } = state || {};

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
    console.log(paymentInfo);
    let night1and2StartDate = convertDateFormat(startDate);
    let night1and2EndDate = convertDateFormat(adjustDate(startDate, 2));
    let night3and4StartDate = convertDateFormat(adjustDate(startDate, 2));
    let night3and4EndDate = convertDateFormat(adjustDate(startDate, 4));
    let night5and6StartDate = convertDateFormat(adjustDate(startDate, 4));
    let night5and6EndDate = convertDateFormat(endDate);
    let night1and2Place = selectedAccommodations['night1and2'];
    let night3and4Place = selectedAccommodations['night3and4'];
    let night5and6Place = selectedAccommodations['night5and6'];
    let night1and2stayName = placeDetails['night1and2'][night1and2Place]['name'];
    let night3and4stayName = placeDetails['night3and4'][night3and4Place]['name'];
    let night5and6stayName = placeDetails['night5and6'][night5and6Place]['name'];

    setIsLoading(true);

    try {
      const responses = await Promise.allSettled([
        initiatePayment(night1and2Place, numTravelers, night1and2StartDate, night1and2EndDate, night1and2stayName, paymentInfo),
        initiatePayment(night3and4Place, numTravelers, night3and4StartDate, night3and4EndDate, night3and4stayName, paymentInfo),
        initiatePayment(night5and6Place, numTravelers, night5and6StartDate, night5and6EndDate, night5and6stayName, paymentInfo)
      ]);

      const paymentStatus = {
        night1and2: {
          status: responses[0].status === 'fulfilled' && responses[0].value.success ? 'success' : 'error',
          name: night1and2stayName
        },
        night3and4: {
          status: responses[1].status === 'fulfilled' && responses[1].value.success ? 'success' : 'error',
          name: night3and4stayName
        },
        night5and6: {
          status: responses[2].status === 'fulfilled' && responses[2].value.success ? 'success' : 'error',
          name: night5and6stayName
        }
      };

      navigate('/payments-confirmation', { state: { paymentStatus } });

    } catch (error) {
      console.error('Error in fetching details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='payment-page center'>
      {isLoading ? (
        <div className="loader">Loading...</div>
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
