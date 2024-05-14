import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../styles/bookpages.css';
import ToggleList from '../../components/book/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json'
import TripDetailsForm from '../../components/book/TripDetailsForm';
import { adjustDate, convertDateFormat } from './../../utils/helpers.js'
import { fetchAccommodationDetails } from '../../api/northernMichiganApi.js';

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
      night5and6: null,
    });
    
    const navigate = useNavigate();

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
            let night1and2StartDate = convertDateFormat(startDate)
            let night1and2EndDate = convertDateFormat(adjustDate(startDate, 2))
            let night3and4StartDate = convertDateFormat(startDate, 2)
            let night3and4EndDate = convertDateFormat(adjustDate(startDate, 4))
            let night5and6StartDate = convertDateFormat(adjustDate(startDate, 4))
            let night5and6EndDate = convertDateFormat(endDate)

            setIsLoading(true);

            try {
                const responses = await Promise.all([
                    fetchAccommodationDetails('timberRidge', numTravelers, night1and2StartDate, night1and2EndDate),
                    fetchAccommodationDetails('anchorInn', numTravelers, night1and2StartDate, night1and2EndDate),
                    fetchAccommodationDetails('traverseCityKoa', numTravelers, night1and2StartDate, night1and2EndDate),
                    fetchAccommodationDetails('straightsKoa', numTravelers, night3and4StartDate, night3and4EndDate),
                    fetchAccommodationDetails('cabinsOfMackinaw', numTravelers, night3and4StartDate, night3and4EndDate),
                    fetchAccommodationDetails('uncleDucky', numTravelers, night5and6StartDate, night5and6EndDate),
                ]);

                const [timberRidgeDetails, anchorInnDetails, traverseCityKoaDetails, straightsKoaDetails, cabinsOfMackinawDetails, uncleDuckyDetails] = responses;
                updateAccommodationsState('timberRidge', timberRidgeDetails, 'night1and2');
                updateAccommodationsState('anchorInn', anchorInnDetails, 'night1and2')
                updateAccommodationsState('traverseCityKoa', traverseCityKoaDetails, 'night1and2')
                updateAccommodationsState('stIgnace', straightsKoaDetails, 'night3and4')
                updateAccommodationsState('cabinsOfMackinaw', cabinsOfMackinawDetails, 'night3and4')
                updateAccommodationsState('uncleDucky', uncleDuckyDetails, 'night5and6');

            } catch (error) {
                console.error('Error in fetching details:', error);

            } finally {
                setIsLoading(false);
            }
        }
      };


      function updateAccommodationsState(place, details, nightXandY) {
        console.log('updateAccomodationsState: place, details, nightXandY', place, details, nightXandY)
        const updatedPlaceDetails = { ...placeDetails };
        updatedPlaceDetails[nightXandY][place] = {
            ...updatedPlaceDetails[nightXandY][place],
            ...details
        };
        
        setPlaceDetails(updatedPlaceDetails);
    }


    const handleSelectStatus = (nightKey, index) => {
        setSelectedAccommodations(prev => {
            const newState = { ...prev, [nightKey]: prev[nightKey] === index ? null : index };
            console.log(`Updated state for ${nightKey}:`, newState[nightKey]);
            return newState;
        });
    };
  
    const handlePageSubmit = (event) => {
        event.preventDefault();
        if (validatePage()) {
        console.log('Navigating with state:', { tripTitle, numTravelers, startDate, endDate, selectedAccommodations });
        navigate('/reviewtrip', { state: { tripTitle, numTravelers, startDate, endDate, selectedAccommodations } });
        }
    };


  return (
    <div className='book-page'>
        {isLoading ? (
            <div className="loader">Loading...</div>
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
                                data={placeDetails['night5and6']}
                                onSelectionChange={(index) => handleSelectStatus('night5and6', index)}
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
