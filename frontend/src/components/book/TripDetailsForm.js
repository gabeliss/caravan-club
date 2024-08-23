import React from 'react';
import './../../styles/tripdetailsform.css'

function TripDetailsForm({ numTravelers, setNumTravelers, startDate, setStartDate, endDate, setEndDate, handleDetailsSubmit, detailsSubmitted }) {

    const handleStartDateChange = (e) => {
        const start = e.target.value;
        setStartDate(start);
    
        const startDate = new Date(start);
        const endDate = new Date(startDate.setDate(startDate.getDate() + 6));
    
        const formattedEndDate = endDate.toISOString().split('T')[0];
        setEndDate(formattedEndDate);
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className='details center'>
            <h1 className='center'>Tell us about your trip:</h1>
            <div className='form-horizontal'>
                <div className='form-group'>
                    <label htmlFor='numTravelers'>Number of Travelers (required)</label>
                    <select id='numTravelers' value={numTravelers} onChange={(e) => setNumTravelers(e.target.value)} required>
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
                <div className='form-group'>
                    <label htmlFor='startDate'>Start Date (required)</label>
                    <input type='date' id='startDate' value={startDate} onChange={handleStartDateChange} min={today} required />
                </div>
                <div className='form-group'>
                    <label htmlFor='endDate'>End Date</label>
                    <input type='date' id='endDate' value={endDate} readOnly required />
                </div>
                <div className='form-group'>
                    <button type='submit' className='submit-button' onClick={handleDetailsSubmit}>Submit</button>
                </div>
            </div>
            {!detailsSubmitted && (
                <h3>Submit trip details to view availability and pricing for each night.</h3>
            )}
        </div>
    );
}

export default TripDetailsForm;
