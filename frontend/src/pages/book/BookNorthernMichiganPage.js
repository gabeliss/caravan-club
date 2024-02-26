import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from './../../components/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json'

function BookNorthernMichiganPage() {

    const tripTitle = 'Northern Michigan'
    
    const [detailsSubmitted, setDetailsSubmitted] = useState(false)
    const [numTravelers, setNumTravelers] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAccommodations, setSelectedAccommodations] = useState({
      night1and2: null,
      night3and4: null,
      night5: null,
    });
    
    const navigate = useNavigate(); // For navigation

    const validateDetails = () => {
        if (!numTravelers || !startDate || !endDate) {
            alert("Please fill all required fields");
            return false;
        }
        else {
            return true
        }
    }
  
    const validatePage = () => {
      // Check if all required fields are filled and at least one accommodation per night is selected
      if (!numTravelers || !startDate || !endDate) {
        alert("Please fill all required fields");
        return false;
      }
      else if (Object.values(selectedAccommodations).some(value => value === null)) {
        alert("Please select at least one accommodation for each night.");
        return false;
      }
      return true;
    };

    const handleDetailsSubmit = (event) => {
        event.preventDefault();
        if (validateDetails()) {
            setDetailsSubmitted(true)
        }
      };
  
    const handlePageSubmit = (event) => {
      event.preventDefault();
      if (validatePage()) {
        console.log('Navigating with state:', { tripTitle, numTravelers, startDate, endDate, selectedAccommodations }); // Debugging log
        // Proceed with the navigation and pass the state to the ReviewTrip page
        navigate('/reviewtrip', { state: { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } });
      }
    };

    const handleSelectStatus = (nightKey, index) => {
        setSelectedAccommodations(prev => {
            const newState = { ...prev, [nightKey]: prev[nightKey] === index ? null : index };
            console.log(`Updated state for ${nightKey}:`, newState[nightKey]); // Debugging log
            return newState;
        });
    };

    const handleStartDateChange = (e) => {
        // Update the start date based on user selection
        const start = e.target.value;
        setStartDate(start);
    
        // Calculate the end date to be 5 days after the start date
        const startDate = new Date(start);
        const endDate = new Date(startDate.setDate(startDate.getDate() + 5));
    
        // Format the end date to YYYY-MM-DD to match the input format
        const formattedEndDate = endDate.toISOString().split('T')[0];
        setEndDate(formattedEndDate);
    };

  return (
    <div className='book-page'>
        <div className='intro'>
            <h1>Northern Michigan</h1>
            <h2>5-Day Road Trip</h2>
        </div>
        <h1>Let's Get Started</h1>
        <div className='details center'>
            <h1 className='center'>Tell us about your trip:</h1>
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
                <input type='date' id='startDate' value={startDate} onChange={handleStartDateChange} required />
                <label htmlFor='endDate'>End Date</label>
                <input type='date' id='endDate' value={endDate} readOnly required /> {/* Make this readOnly */}
            </div>
            <div className='form-group center'>
                <button type='submit' className='submit-button' onClick={handleDetailsSubmit}>Submit</button>
            </div>
            {!detailsSubmitted && (
                <h3>Submit trip details to view availability and pricing for each night.</h3>
            )}
        </div>
        <div className='nights'>
            <div className='night'>
                <div className='pic'>
                    <img src="/images/bookpages/northernmichigan1.png" alt="Northern Michigan" />
                </div>
                <div className='info'>
                    <h2>Night 1 & 2: Traverse City</h2>
                    <p>Night 1 and 2 begin in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    {detailsSubmitted && (
                        <div className='select-stay-container'>
                            <h4 className='blank'></h4>
                            <h3 className='select-stay'>Select Stay:</h3>
                        </div>
                    )}
                    <ToggleList
                        data={accommodationsData['night1and2']}
                        onSelectionChange={(index) => handleSelectStatus('night1and2', index)}
                        detailsSubmitted={detailsSubmitted}
                    />
                </div>
            </div>
            <div className='night'>
                <div className='pic reverse-pic'>
                    <img src="/images/bookpages/northernmichigan2.jpg" alt="Northern Michigan" />
                </div>
                <div className='info reverse-info'>
                    <h2>Night 3 & 4: Mackinac Island or City</h2>
                    <p>Night 3 begins in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    {detailsSubmitted && (
                        <div className='select-stay-container'>
                            <h4 className='blank'></h4>
                            <h3 className='select-stay'>Select Stay:</h3>
                        </div>
                    )}
                    <ToggleList
                        data={accommodationsData['night3and4']}
                        onSelectionChange={(index) => handleSelectStatus('night3and4', index)}
                        detailsSubmitted={detailsSubmitted}
                    />
                </div>
            </div>
            <div className='night'>
                <div className='pic'>
                    <img src="/images/bookpages/northernmichigan3.jpg" alt="Northern Michigan" />
                </div>
                <div className='info'>
                    <h2>Night 5: Pictured Rocks</h2>
                    <p>Night 5 begin in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    {detailsSubmitted && (
                        <div className='select-stay-container'>
                            <h4 className='blank'></h4>
                            <h3 className='select-stay'>Select Stay:</h3>
                        </div>
                    )}
                    <ToggleList
                        data={accommodationsData['night5']}
                        onSelectionChange={(index) => handleSelectStatus('night5', index)}
                        detailsSubmitted={detailsSubmitted}
                    />
                </div>
            </div>
        </div>
        <div className='form-group'>
            <button type='submit' className='submit-button' onClick={handlePageSubmit}>Submit</button>
        </div>
    </div>
  );
}

export default BookNorthernMichiganPage;