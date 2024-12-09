import React, { useEffect } from 'react';
import { useNavigate,useLocation, Link } from 'react-router-dom';
import './../styles/payment-confirmation.css';

function PaymentConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { paymentStatus } = state || {};

  const formatCamelCase = (text) => {
    return text
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const renderPaymentStatus = (segmentName, details) => {
    const readableSegment = formatCamelCase(segmentName);
    const readableAccommodation = formatCamelCase(details.accommodationKey);
    
    if (details.status === 'success') {
      return <div className="banner green">Payment for {readableSegment} - {readableAccommodation} succeeded!</div>;
    } else if (details.status === 'error') {
      return <div className="banner red">Payment for {readableSegment} - {readableAccommodation} failed!</div>;
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (!state) {
      console.log('No location state found. Navigating to home.');
    navigate('/');
      return;
    }
  }, [state, navigate]);

  return (
    <div className='payment-confirmation-page center'>
      <h1 className='center'>Payment Confirmation</h1>
      {paymentStatus && Object.entries(paymentStatus).map(([segmentName, details]) => 
        renderPaymentStatus(segmentName, details)
      )}
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
