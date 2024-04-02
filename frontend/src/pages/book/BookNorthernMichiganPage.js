import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../styles/bookpages.css';
import ToggleList from '../../components/book/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json'
import TripDetailsForm from '../../components/book/TripDetailsForm';
import { adjustDate, convertDateFormat } from './../../utils/helpers.js'

function BookNorthernMichiganPage() {

    const tripTitle = 'Northern Michigan'
    
    const [isLoading, setIsLoading] = useState(false);
    const [detailsSubmitted, setDetailsSubmitted] = useState(false)
    const [numTravelers, setNumTravelers] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [placeDetails, setPlaceDetails] = useState(accommodationsData);
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

    const handleDetailsSubmit = async (event) => {
        event.preventDefault();
        if (validateDetails()) {
            setDetailsSubmitted(true)
            let uncleDuckyStartDate = convertDateFormat(adjustDate(startDate, 4))
            let uncleDuckyEndDate = convertDateFormat(endDate)
            let timberRidgeStartDate = convertDateFormat(startDate)
            let timberRidgeEndDate = convertDateFormat(adjustDate(startDate, 2))

            setIsLoading(true);

            try {
                await Promise.all([
                    handleGetUncleDucky(numTravelers, uncleDuckyStartDate, uncleDuckyEndDate),
                    handleGetTimberRidge(numTravelers, timberRidgeStartDate, timberRidgeEndDate)
                ]);
            } catch (error) {
                console.error('Error in fetching details:', error);
            } finally {
                setIsLoading(false);
            }
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

    const handleGetUncleDucky = async (numTravelers, startDate, endDate) => {
        console.log(`Requesting Uncle Ducky with numTravelers: ${numTravelers}, startDate: ${startDate}, endDate: ${endDate}`);
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/scrape/uncleducky', {
                params: { numTravelers, startDate, endDate }
            });
            console.log('Uncle Ducky response:', response);
            const available = response.data['available']
            const price = response.data['price']
            const message = response.data['message']
            
            // Update accommodations data with the new price and availability
            const updatedPlaceDetails = { ...placeDetails };
            updatedPlaceDetails['night5'][0].available = available;
            updatedPlaceDetails['night5'][0].price = price;
            updatedPlaceDetails['night5'][0].message = message;
            
            // Update your state or whatever you use to keep track of accommodations data
            setPlaceDetails(updatedPlaceDetails);
        } catch (error) {
            console.error('Error fetching Uncle Ducky price:', error);
            // Detailed Axios error logging
            if (error.response) {
                // Server responded with a status code outside the 2xx range
                console.log('Error Response:', error.response);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('Error Request:', error.request);
            } else {
                // Something happened in setting up the request
                console.log('Error Message:', error.message);
            }
        }
    };

    const handleGetTimberRidge = async (numTravelers, startDate, endDate) => {
        console.log(`Requesting Timber Ridge with numTravelers: ${numTravelers}, startDate: ${startDate}, endDate: ${endDate}`);
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/scrape/timberRidge', {
                params: { numTravelers, startDate, endDate }
            });
            console.log('Timber Ridge response:', response);
            const available = response.data['available']
            const price = response.data['price']
            const message = response.data['message']
            
            // Update accommodations data with the new price and availability
            const updatedPlaceDetails = { ...placeDetails };
            updatedPlaceDetails['night1and2'][1].available = available;
            updatedPlaceDetails['night1and2'][1].price = price;
            updatedPlaceDetails['night1and2'][1].message = message;
            
            // Update your state or whatever you use to keep track of accommodations data
            setPlaceDetails(updatedPlaceDetails);
        } catch (error) {
            console.error('Error fetching Timber Ridge price:', error);
            // Detailed Axios error logging
            if (error.response) {
                // Server responded with a status code outside the 2xx range
                console.log('Error Response:', error.response);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('Error Request:', error.request);
            } else {
                // Something happened in setting up the request
                console.log('Error Message:', error.message);
            }
        }
    };


  return (
    <div className='book-page'>
        {isLoading ? (
            <div className="loader">Loading...</div> // Replace this with your loading spinner or animation
        ) : (
            <>
                <div className='intro'>
                    <h1>Northern Michigan</h1>
                    <h2>5-Day Road Trip</h2>
                </div>
                <h1>Let's Get Started</h1>
                <TripDetailsForm
                    numTravelers={numTravelers}
                    setNumTravelers={setNumTravelers}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    handleDetailsSubmit={handleDetailsSubmit}
                    detailsSubmitted={detailsSubmitted}
                />
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
                                data={placeDetails['night1and2']}
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
                                data={placeDetails['night3and4']}
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
                                data={placeDetails['night5']}
                                onSelectionChange={(index) => handleSelectStatus('night5', index)}
                                detailsSubmitted={detailsSubmitted}
                            />
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <button type='submit' className='submit-button' onClick={handlePageSubmit}>Submit</button>
                </div>
            </>
        )}
    </div>
  );
}

export default BookNorthernMichiganPage;
