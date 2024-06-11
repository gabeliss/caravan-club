import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../styles/payment.css';
import { adjustDate, convertDateFormat } from './../utils/helpers.js'
import { initiatePayment } from '../api/northernMichiganApi.js';
import accommodationsData from './../northernmichigandata.json'

function PaymentPage() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const { selectedAccommodations, totalPrice, numTravelers, startDate, endDate } = state || {};
    
    const [paymentInfo, setpaymentInfo] = useState({
      name: '',
      email: '',
      phone_number: '',
      card_number: '',
      expiry_date: '',
      cvc: ''
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setpaymentInfo({ ...paymentInfo, [name]: value });
    };

    const handleBack = (e) => {
      e.preventDefault();
      navigate(-1); // Go back to the previous page
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Handle form submission, e.g., send data to server
      console.log(paymentInfo);
      let night1and2StartDate = convertDateFormat(startDate)
      let night1and2EndDate = convertDateFormat(adjustDate(startDate, 2))
      let night3and4StartDate = convertDateFormat(startDate, 2)
      let night3and4EndDate = convertDateFormat(adjustDate(startDate, 4))
      let night5and6StartDate = convertDateFormat(adjustDate(startDate, 4))
      let night5and6EndDate = convertDateFormat(endDate)
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

          responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              console.log(`Payment for night ${index * 2 + 1} and ${index * 2 + 2} succeeded:`, result.value);
            } else {
              console.error(`Payment for night ${index * 2 + 1} and ${index * 2 + 2} failed:`, result.reason);
            }
          });

          responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              console.log(`Payment for night ${index * 2 + 1} and ${index * 2 + 2} succeeded:`, result.value);
            } else {
              console.error(`Payment for night ${index * 2 + 1} and ${index * 2 + 2} failed:`, result.reason);
            }
          });
          

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
              <form onSubmit={handleSubmit} className='form-container'>
                <div className='form-group'>
                  <label htmlFor='name'>Name (required)</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-input"
                    value={paymentInfo.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='email'>Email (required)</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-input"
                    value={paymentInfo.email} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='phoneNumber'>Phone Number (required)</label>
                  <input 
                    type="tel" 
                    id="phone_number" 
                    name="phone_number" 
                    className="form-input"
                    value={paymentInfo.phone_number} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='cardNumber'>Card Number (required)</label>
                  <input 
                    type="text" 
                    id="card_number" 
                    name="card_number" 
                    className="form-input"
                    value={paymentInfo.card_number} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='expiryDate'>Expiry Date (required)</label>
                  <input 
                    type="text" 
                    id="expiry_date" 
                    name="expiry_date" 
                    className="form-input"
                    value={paymentInfo.expiry_date} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <label htmlFor='cvc'>CVC (required)</label>
                  <input 
                    type="text" 
                    id="cvc" 
                    name="cvc" 
                    className="form-input"
                    value={paymentInfo.cvc} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className='form-group center'>
                  <h2>Total Price: ${totalPrice}</h2>
                  <div className='buttons'>
                    <button className="button" onClick={handleBack}>Back</button>
                    <button className="button" type="submit">Submit Payment</button>
                  </div>
                </div>
              </form>
            </>
        )}
      </div>
    );
  }

  export default PaymentPage;