import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './../styles/payment-confirmation.css';

function PaymentConfirmationPage() {
  const { state } = useLocation();
  const { paymentStatus } = state || {};

  const renderPaymentStatus = (night, status, name) => {
    if (status === 'success') {
      return <div className="banner green">Payment for {night} ({name}) succeeded!</div>;
    } else if (status === 'error') {
      return <div className="banner red">Payment for {night} ({name}) failed!</div>;
    } else {
      return null;
    }
  };

  return (
    <div className='payment-confirmation-page center'>
      <h1 className='center'>Payment Confirmation</h1>
      {renderPaymentStatus('Nights 1 and 2', paymentStatus.night1and2.status, paymentStatus.night1and2.name)}
      {renderPaymentStatus('Nights 3 and 4', paymentStatus.night3and4.status, paymentStatus.night3and4.name)}
      {renderPaymentStatus('Nights 5 and 6', paymentStatus.night5and6.status, paymentStatus.night5and6.name)}
      <h4 className='final-message'>
        Please check your email for payment confirmations. If any payments failed, please reach out to Caravan Club at
        caravanclub@gmail.com and we will do our best to accomodate you. We hope you have an amazing trip. Thank you for 
        booking through Caravan Club!
      </h4>
      <Link to="/">
        <button className='home-button'>Back to Home</button>
      </Link>
    </div>
  );
}

export default PaymentConfirmationPage;
