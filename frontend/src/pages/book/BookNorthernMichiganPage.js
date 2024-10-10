import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from '../../components/book/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json';
import { convertDateFormat } from './../../utils/helpers.js';
import { fetchAccommodationDetails } from '../../api/northernMichiganApi.js';

function BookNorthernMichiganPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [placeDetails, setPlaceDetails] = useState(accommodationsData);
  const [selectedAccommodations, setSelectedAccommodations] = useState({});
  const [fetchError, setFetchError] = useState(null);

  // Ref to track if API calls have been made
  const apiCalled = useRef(false);

  // Default descriptions for the locations
  const locationDescriptions = {
    traverseCity: {
      title: "Traverse City",
      description:
        "Traverse City is a picturesque lakeside town known for its scenic views, charming downtown, and renowned wineries on the Old Mission and Leelanau Peninsulas. Outdoor enthusiasts enjoy hiking at Sleeping Bear Dunes, kayaking, and exploring the area's beautiful beaches. Browse through each accommodation and select based on your preferences.",
    },
    mackinacCity: {
      title: "Mackinac City",
      description:
        "Continue your adventure in Mackinac City, offering a blend of history and natural beauty. Enjoy exploring Fort Michilimackinac, walking along the Mackinac Bridge, and taking a ferry to Mackinac Island. Choose from the available accommodations to enjoy your stay.",
    },
    picturedRocks: {
      title: "Pictured Rocks",
      description:
        "Conclude your trip at the stunning Pictured Rocks, where you can immerse yourself in nature's beauty. Enjoy kayaking, hiking, and taking in the colorful sandstone cliffs along Lake Superior. Browse and select accommodations based on availability and your preferences.",
    },
  };

  const formatToReadableDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }

    const { num_adults, num_kids, segments } = location.state;

    // Early exit if the API calls have already been made
    if (apiCalled.current) {
      console.log("API calls have already been made. Skipping repeated fetch.");
      return;
    }

    console.log('Received segments:', segments);

    const fetchAccommodationData = async () => {
      try {
        const apiCalls = [];
        const updatedPlaceDetails = { ...placeDetails };

        for (const [locationKey, dateRange] of Object.entries(segments)) {
          const startDateFormatted = convertDateFormat(dateRange.start);
          const endDateFormatted = convertDateFormat(dateRange.end);

          Object.keys(accommodationsData[locationKey].tent).forEach(accommodation => {
            console.log(`Fetching details for ${accommodation} from ${startDateFormatted} to ${endDateFormatted}`);
            apiCalls.push(
              fetchAccommodationDetails(accommodation, startDateFormatted, endDateFormatted, num_adults, num_kids)
                .then(data => {
                  updatedPlaceDetails[locationKey].tent[accommodation] = {
                    ...updatedPlaceDetails[locationKey].tent[accommodation],
                    ...data
                  };
                })
                .catch(error => {
                  console.error(`Error fetching details for ${accommodation}:`, error);
                  setFetchError(error);
                })
            );
          });
        }

        await Promise.all(apiCalls);
        setPlaceDetails(updatedPlaceDetails);
      } catch (error) {
        console.error('Unexpected error:', error);
        setFetchError(error);
      } finally {
        setIsLoading(false);
        apiCalled.current = true;  // Mark the API calls as completed
      }
    };

    // Fetch the data only if not already called
    if (!apiCalled.current) {
      fetchAccommodationData();
    }

  }, [location.state, navigate]);  // Removed `placeDetails` from dependency list to prevent re-renders

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
        <h1>{location.state.tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h1>
        <h2>Custom Road Trip</h2>
      </div>
      <div className='nights'>
        {Object.entries(location.state.segments).map(([city, dateRange], index) => (
          <div className='night' key={index}>
            <div className='info'>
              <h2>{locationDescriptions[city]?.title || city.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} -  
              ({formatToReadableDate(dateRange.start)} - {formatToReadableDate(dateRange.end)})</h2>
              <p>{locationDescriptions[city]?.description || "No description available for this location."}</p>
              <ToggleList
                data={placeDetails[city].tent}
                onSelectionChange={(index) => handleSelectStatus(city, index)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className='form-group'>
        <button type='submit' className='submit-button' onClick={handlePageSubmit}>Submit</button>
      </div>
      {fetchError && <div className="error-message">Failed to fetch accommodation details. Please try again later.</div>}
    </div>
  );
}

export default BookNorthernMichiganPage;
