import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/payment.css';
import { adjustDate, convertDateFormat } from './../utils/helpers.js';
import { initiatePayment } from '../api/northernMichiganApi.js';
import accommodationsData from './../northernmichigandata.json';
import PaymentForm from './../components/pay/PaymentForm.js';

function PaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { selectedAccommodations, totalPrice, numTravelers, startDate, endDate } = state || {};

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
    expiry_date: '',
    cvc: ''
  });

  const [paymentStatus, setPaymentStatus] = useState({
    night1and2: null,
    night3and4: null,
    night5and6: null
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
    let night1and2stayName = accommodationsData['night1and2'][selectedAccommodations['night1and2']]['name'];
    let night3and4stayName = accommodationsData['night3and4'][selectedAccommodations['night3and4']]['name'];
    let night5and6stayName = accommodationsData['night5and6'][selectedAccommodations['night5and6']]['name'];

    setIsLoading(true);

    try {
      const responses = await Promise.allSettled([
        initiatePayment(night1and2Place, numTravelers, night1and2StartDate, night1and2EndDate, night1and2stayName, paymentInfo),
        initiatePayment(night3and4Place, numTravelers, night3and4StartDate, night3and4EndDate, night3and4stayName, paymentInfo),
        initiatePayment(night5and6Place, numTravelers, night5and6StartDate, night5and6EndDate, night5and6stayName, paymentInfo)
      ]);

      setPaymentStatus({
        night1and2: responses[0].status === 'fulfilled' ? 'success' : 'error',
        night3and4: responses[1].status === 'fulfilled' ? 'success' : 'error',
        night5and6: responses[2].status === 'fulfilled' ? 'success' : 'error'
      });

    } catch (error) {
      console.error('Error in fetching details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentStatus = (night, status) => {
    if (status === 'success') {
      return <div className="banner green">Payment for {night} succeeded!</div>;
    } else if (status === 'error') {
      return <div className="banner red">Payment for {night} failed!</div>;
    } else {
      return null;
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
          {renderPaymentStatus('night 1 and 2', paymentStatus.night1and2)}
          {renderPaymentStatus('night 3 and 4', paymentStatus.night3and4)}
          {renderPaymentStatus('night 5 and 6', paymentStatus.night5and6)}
        </>
      )}
    </div>
  );
}

export default PaymentPage;
