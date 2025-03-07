import React from 'react';
import '../../styles/components/pay/payment-form.css';

const PaymentForm = ({ 
  paymentInfo, 
  handleInputChange, 
  handleSubmit, 
  handleBack, 
  totalPrice, 
  tripData, // NEW PROP
}) => {

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4); // Add slash after MM
    }
    if (value.length > 5) {
      value = value.slice(0, 5); // Limit to MM/YY
    }
    handleInputChange({ target: { name: 'expiry_date', value } });
  };

  return (
    <form onSubmit={handleSubmit} className='payment-form'>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
          <label htmlFor='first_name'>First Name</label>
          <input 
            type="text" 
            id="first_name" 
            name="first_name" 
            className="payment-form-input"
            value={paymentInfo.first_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className='payment-form-group'>
          <label htmlFor='last_name'>Last Name</label>
          <input 
            type="text" 
            id="last_name" 
            name="last_name" 
            className="payment-form-input"
            value={paymentInfo.last_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      <div className='payment-form-group'>
        <label htmlFor='email'>Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          className="payment-form-input"
          value={paymentInfo.email} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      <div className='payment-form-group'>
        <label htmlFor='phone_number'>Phone Number</label>
        <input 
          type="tel" 
          id="phone_number" 
          name="phone_number" 
          className="payment-form-input"
          value={paymentInfo.phone_number} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      <div className='payment-form-group'>
        <label htmlFor='street_address'>Street Address</label>
        <input 
          type="text" 
          id="street_address" 
          name="street_address" 
          className="payment-form-input"
          value={paymentInfo.street_address} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
          <label htmlFor='city'>City</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            className="payment-form-input"
            value={paymentInfo.city} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className='payment-form-group'>
          <label htmlFor='state'>State</label>
          <select 
            id="state" 
            name="state" 
            className="payment-form-input"
            value={paymentInfo.state} 
            onChange={handleInputChange} 
            required
          >
            <option value="" disabled>Select Option</option>
            {[
              'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 
              'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 
              'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
            ].map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
            <label htmlFor='zip_code'>Zip Code</label>
            <input 
            type="text" 
            id="zip_code" 
            name="zip_code" 
            className="payment-form-input"
            value={paymentInfo.zip_code} 
            onChange={handleInputChange} 
            required 
            />
        </div>
        <div className='payment-form-group'>
            <label htmlFor='country'>Country</label>
            <select 
            id="country" 
            name="country" 
            className="payment-form-input"
            value={paymentInfo.country} 
            onChange={handleInputChange} 
            required
            >
            <option value="" disabled>Select Option</option>
            <option value="USA">USA</option>
            </select>
        </div>
      </div>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
          <label htmlFor='cardholder_name'>Cardholder Name</label>
          <input 
            type="text" 
            id="cardholder_name" 
            name="cardholder_name" 
            className="payment-form-input"
            value={paymentInfo.cardholder_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className='payment-form-group'>
          <label htmlFor='card_number'>Card Number</label>
          <input 
            type="text" 
            id="card_number" 
            name="card_number" 
            className="payment-form-input"
            value={paymentInfo.card_number} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
            <label htmlFor='card_type'>Card Type</label>
            <select 
            id="card_type" 
            name="card_type" 
            className="payment-form-input"
            value={paymentInfo.card_type} 
            onChange={handleInputChange} 
            required
            >
            <option value="" disabled>Select Option</option>
            <option value="Discover Card">Discover Card</option>
            <option value="MasterCard">MasterCard</option>
            <option value="Visa">Visa</option>
            </select>
        </div>
      </div>
      <div className='payment-form-row'>
        <div className='payment-form-group'>
          <label htmlFor='expiry_date'>Expiry Date</label>
          <input 
            type="text" 
            id="expiry_date" 
            name="expiry_date" 
            className="payment-form-input"
            placeholder="MM/YY"
            value={paymentInfo.expiry_date} 
            onChange={handleExpiryDateChange} 
            required 
          />
        </div>
        <div className='payment-form-group'>
          <label htmlFor='cvc'>CVC</label>
          <input 
            type="text" 
            id="cvc" 
            name="cvc" 
            className="payment-form-input"
            value={paymentInfo.cvc} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      <div className='payment-form-details'>
        <div className='payment-form-group'>
          <div className='terms-checkbox'>
            <input
              type="checkbox"
              id="terms_agreement"
              name="terms_agreement"
              required
            />
            <label htmlFor="terms_agreement">
              I agree that any booking changes must be made by directly contacting the campsite. Changes to reservations cannot be made through the website.
            </label>
          </div>
        </div>
        <div className='payment-buttons'>
          <button className="payment-button" type="button" onClick={handleBack}>Back</button>
          <button className="payment-button" type="submit">Book Now</button>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
