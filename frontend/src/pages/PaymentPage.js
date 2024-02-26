import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../styles/payment.css';

function PaymentPage() {

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

  return (
    <div className='payment-page'>
        <h1>Pay Now</h1>
        <h2>Credit Card Information</h2>
        <button onClick={handleBack} className='back'>Back</button>
    </div>
  );
}

export default PaymentPage;