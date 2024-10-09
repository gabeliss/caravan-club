import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from '../../components/book/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json'
import { convertDateFormat } from './../../utils/helpers.js'
import { fetchAccommodationDetails } from '../../api/northernMichiganApi.js';
import tripMapping from '../../tripmapping.json'

function BookNorthernMichiganPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [placeDetails, setPlaceDetails] = useState(accommodationsData);
  const [selectedAccommodations, setSelectedAccommodations] = useState({
    traverseCity: null,
    mackinacCity: null,
    picturedRocks: null,
  });

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }

    const { tripTitle, start_date, end_date, num_adults, num_kids, nights } = location.state;

    const fetchAccommodationData = async () => {
        try {
          const tripStructure = tripMapping[tripTitle][`${nights}nights`];
          console.log('tripStructure', tripStructure)
          if (!tripStructure) {
            console.error('Invalid trip structure for the given destination and nights.');
            return;
          }

        // Calculate date ranges for each segment of the trip
          const segmentDates = calculateSegmentDates(start_date, nights, tripStructure);
          // Make multiple API calls for each accommodation in each city
          const apiCalls = [];
          const updatedPlaceDetails = { ...placeDetails };
  
          // Loop through each city and their accommodations
          Object.entries(segmentDates).forEach(([location, dates]) => {
            Object.keys(accommodationsData[location].tent).forEach(accommodation => {
              apiCalls.push(
                fetchAccommodationDetails(accommodation, convertDateFormat(dates.start), convertDateFormat(dates.end), num_adults, num_kids)
                  .then(data => {
                    updatedPlaceDetails[location].tent[accommodation] = {
                      ...updatedPlaceDetails[location].tent[accommodation],
                      ...data
                    };
                  })
                  .catch(error => {
                    console.error(`Error fetching details for ${accommodation}:`, error);
                  })
              );
            });
          });
  
          // Wait for all API calls to complete
          await Promise.all(apiCalls);
          setPlaceDetails(updatedPlaceDetails);
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setIsLoading(false);
        }
      };
  
      fetchAccommodationData();
    }, [location.state, navigate]);


    const calculateSegmentDates = (startDate, nights, tripStructure) => {
        const segments = {};
        let currentStartDate = new Date(startDate);
    
        Object.entries(tripStructure).forEach(([night, location]) => {
          const segmentStart = new Date(currentStartDate);
          const segmentEnd = new Date(segmentStart);
          segmentEnd.setDate(segmentEnd.getDate() + (night.startsWith("night1") ? 2 : 1)); // Adjust based on number of nights at the location
          
          segments[location] = {
            start: segmentStart.toISOString().split('T')[0],
            end: segmentEnd.toISOString().split('T')[0]
          };
    
          // Update the start date for the next location
          currentStartDate = new Date(segmentEnd);
        });
    
        return segments;
    };


  const handleSelectStatus = (location, accommodationKey) => {
    setSelectedAccommodations(prev => ({
      ...prev,
      [location]: prev[location] === accommodationKey ? null : accommodationKey
    }));
  };

  const handlePageSubmit = (event) => {
    event.preventDefault();
    if (validatePage()) {
      const tripDetails = { ...location.state, selectedAccommodations };
      navigate('/reviewtrip', { state: tripDetails });
    }
  };

  const validatePage = () => {
    if (Object.values(selectedAccommodations).some(value => value === null)) {
      alert("Please select at least one accommodation for each location.");
      return false;
    }
    return true;
  };

  if (isLoading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className='book-page'>
      <div className='intro'>
        <h1>Northern Michigan</h1>
        <h2>5-Day Road Trip</h2>
      </div>
      <div className='nights'>
        <div className='night'>
          <div className='info'>
            <h2>Traverse City</h2>
            <p>Traverse City is a picturesque lakeside town known for its scenic views, charming downtown, and renowned wineries on the Old Mission and Leelanau Peninsulas. Outdoor enthusiasts enjoy hiking at Sleeping Bear Dunes, kayaking, and exploring the area's beautiful beaches. Browse through each accommodation and select based on your preferences.</p>
            <ToggleList
              data={placeDetails.traverseCity.tent}
              onSelectionChange={(index) => handleSelectStatus('traverseCity', index)}
            />
          </div>
        </div>
        <div className='night'>
          <div className='info'>
            <h2>Mackinac City</h2>
            <p>Continue your adventure in Mackinac City, offering a blend of history and natural beauty.</p>
            <ToggleList
              data={placeDetails.mackinacCity.tent}
              onSelectionChange={(index) => handleSelectStatus('mackinacCity', index)}
            />
          </div>
        </div>
        <div className='night'>
          <div className='info'>
            <h2>Pictured Rocks</h2>
            <p>Conclude your trip at the stunning Pictured Rocks, where you can immerse yourself in nature's beauty.</p>
            <ToggleList
              data={placeDetails.picturedRocks.tent}
              onSelectionChange={(index) => handleSelectStatus('picturedRocks', index)}
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