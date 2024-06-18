import React from 'react';

const PaymentForm = ({ paymentInfo, handleInputChange, handleSubmit, handleBack, totalPrice }) => {
  return (
    <form onSubmit={handleSubmit} className='form-container'>
      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='first_name'>First Name</label>
          <input 
            type="text" 
            id="first_name" 
            name="first_name" 
            className="form-input"
            value={paymentInfo.first_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className='form-group'>
          <label htmlFor='last_name'>Last Name</label>
          <input 
            type="text" 
            id="last_name" 
            name="last_name" 
            className="form-input"
            value={paymentInfo.last_name} 
            onChange={handleInputChange} 
            required 
          />
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='email'>Email</label>
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
        <label htmlFor='phone_number'>Phone Number</label>
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
        <label htmlFor='street_address'>Street Address</label>
        <input 
          type="text" 
          id="street_address" 
          name="street_address" 
          className="form-input"
          value={paymentInfo.street_address} 
          onChange={handleInputChange} 
          required 
        />
      </div>
      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='city'>City</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            className="form-input"
            value={paymentInfo.city} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        <div className='form-group'>
          <label htmlFor='state'>State</label>
          <select 
            id="state" 
            name="state" 
            className="form-input"
            value={paymentInfo.state} 
            onChange={handleInputChange} 
            required
          >
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
      <div className='form-row'>
        <div className='form-group'>
            <label htmlFor='zip_code'>Zip Code</label>
            <input 
            type="text" 
            id="zip_code" 
            name="zip_code" 
            className="form-input"
            value={paymentInfo.zip_code} 
            onChange={handleInputChange} 
            required 
            />
        </div>
        <div className='form-group'>
            <label htmlFor='country'>Country</label>
            <select 
            id="country" 
            name="country" 
            className="form-input"
            value={paymentInfo.country} 
            onChange={handleInputChange} 
            required
            >
            <option value="USA">USA</option>
            </select>
        </div>
      </div>
      <div className='form-row'>
        <div className='form-group'>
          <label htmlFor='card_number'>Card Number</label>
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
          <label htmlFor='expiry_date'>Expiry Date</label>
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
          <label htmlFor='cvc'>CVC</label>
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
      </div>
      <div className='form-group center'>
        <h2>Total Price: ${totalPrice}</h2>
        <div className='buttons'>
          <button className="button" onClick={handleBack}>Back</button>
          <button className="button" type="submit">Submit Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
