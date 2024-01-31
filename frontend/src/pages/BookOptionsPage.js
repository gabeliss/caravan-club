import React from 'react';
import { Link } from 'react-router-dom';
import './../styles/bookoptions.css';

function BookOptionsPage() {

  return (
    <div className='book-options-page'>
      <h1>Let's Start.</h1>
      <form className='booking-form'>
        {/* Name Input */}
        <div className='form-group name-field'>
          <div className='names'>
            <label htmlFor='firstName'>First Name (required)</label>
            <input type='text' id='firstName' required />
          </div>
          <div className='names'>
            <label htmlFor='lastName'>Last Name (required)</label>
            <input type='text' id='lastName' required />
          </div>
        </div>

        {/* Email Input */}
        <div className='form-group'>
          <label htmlFor='email'>Email (required)</label>
          <input type='email' id='email' required />
          <div className='checkbox'>
            <input type='checkbox' id='subscribe' />
            <label htmlFor='subscribe'>Sign up for news and updates</label>
          </div>
        </div>

        {/* Trip Type Select */}
        <div className='form-group'>
          <label htmlFor='tripType'>Trip Type (required)</label>
          <select id='tripType' required>
            <option value=''>Select an option</option>
            <option value='arizona'>Arizona</option>
            <option value='northernmichigan'>Northern Michigan</option>
            <option value='smokymountain'>Smoky Mountain</option>
            <option value='southerncalifornia'>Southern California</option>
          </select>
        </div>

        {/* Number of Travelers Select */}
        <div className='form-group'>
          <label htmlFor='numTravelers'>Number of Travelers (required)</label>
          <select id='numTravelers' required>
            <option value=''>Select an option</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </select>
        </div>

        {/* Date Pickers */}
        <div className='form-group'>
          <label htmlFor='startDate'>Start Date (required)</label>
          <input type='date' id='startDate' required />
          <label htmlFor='endDate'>End Date (required)</label>
          <input type='date' id='endDate' required />
        </div>

        {/* Submit Button */}
        <div className='form-group'>
          <button type='submit' className='submit-button'>Submit</button>
        </div>
      </form>
    </div>
  );
}

export default BookOptionsPage;
