import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from '../../components/book/BookPagesToggle';
import accommodationsData from './../../northernmichigandata.json';
import { convertDateFormat } from './../../utils/helpers.js';
import { fetchAccommodationDetails } from '../../api/northernMichiganApi.js';
import CustomLoader from '../../components/general/CustomLoader';
import PopupModal from '../../components/general/PopupModal';

function BookNorthernMichiganPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [placeDetails, setPlaceDetails] = useState(accommodationsData);
  const [fetchError, setFetchError] = useState(null);

  const [selectedAccommodations, setSelectedAccommodations] = useState(() => {
    const initialState = {};
    if (location.state && location.state.segments) {
      Object.keys(location.state.segments).forEach(city => {
        initialState[city] = null;
      });
    }
    return initialState;
  });

  const apiCalled = useRef(false);

  const locationDescriptions = {
    traverseCity: {
      title: "Traverse City",
      description:
        "Traverse City, a scenic lakeside town, offers charming downtown vibes, renowned wineries on Old Mission and Leelanau Peninsulas, and outdoor adventures like hiking Sleeping Bear Dunes or kayaking.",
    },
    mackinacCity: {
      title: "Mackinac City / Island",
      description:
        "Mackinac Island, a car-free haven, offers charming streets, historic sites like Fort Mackinac, and scenic views from Arch Rock. Enjoy biking, carriage rides, and famous fudge. Nearby Mackinaw City features waterfront views, quaint shops, and easy access to the Mackinac Bridge.",
    },
    picturedRocks: {
      title: "Pictured Rocks",
      description:
        "Pictured Rocks, a stunning lakeside destination, features towering sandstone cliffs, vibrant rock formations, and cascading waterfalls along Lake Superior. Enjoy outdoor adventures like hiking scenic trails, kayaking through sea caves, or taking a boat tour for breathtaking views. Nearby Munising offers charming local shops, cozy cafes, and a perfect base for exploring this natural wonder.",
    },
  };

  const formatToReadableDate = (dateStr) => {
    console.log('dateStr', dateStr);
    const options = { month: 'short', day: 'numeric', timeZone: 'UTC' }; // Use UTC timezone to avoid date offset issues
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', options);
  };

  const calculateNightRanges = (segments) => {
    const nightRanges = [];
    let currentNight = 1;

    Object.entries(segments).forEach(([city, dateRange]) => {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const nights = (endDate - startDate) / (1000 * 60 * 60 * 24); // Calculate nights between start and end dates
      const range = nights === 1 
        ? `Night ${currentNight}` 
        : `Night ${currentNight} & ${currentNight + 1}`;
      currentNight += nights;
      nightRanges.push({
        city,
        range,
        start: formatToReadableDate(dateRange.start),
        end: formatToReadableDate(dateRange.end),
      });
    });

    return nightRanges;
  };

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (!location.state) {
      console.log('No location state found. Navigating to home.');
      navigate('/');
      return;
    }

    const { num_adults, num_kids, segments } = location.state;

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
        apiCalled.current = true;
      }
    };

    if (!apiCalled.current) {
      fetchAccommodationData();
    }

    console.log('Location state found:', location.state);
  }, [location.state, navigate]);

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
      console.log('Trip details:', tripDetails);
      console.log('Navigating to review trip page with state:', tripDetails);
      navigate('/reviewtrip', { state: tripDetails });
    }
  };

  const validatePage = () => {
    console.log('Selected accommodations:', selectedAccommodations);
    if (Object.values(selectedAccommodations).some(value => value === null)) {
      setModalMessage("Please select at least one accommodation for each location.");
      setShowModal(true);
      return false;
    }
    console.log('Page is valid.');
    return true;
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (isLoading) {
    return <CustomLoader />;
  }

  if (!location.state) {
    console.log('No location state found. Navigating to home.');
    navigate('/');
    return;
  }

  const nightRanges = calculateNightRanges(location.state.segments);

  return (
    <div className='book-page'>
      <div className='intro'>
        <div className='intro-image'>
          <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/bookNorthernMichiganPage/welcome.png" alt="Northern Michigan" />
        </div>
        <div className='intro-text'>
          <h1>
            {location.state.tripTitle.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            <span><span className="dash"> - </span>{location.state.nights} Night Road Trip</span>
          </h1>
          <h3>We've simplified road trip planning, letting you focus on the fun instead of the details. Each accommodation is handpicked and vetted by the CaraVan Trip Plan team, saving you hours of searching for availability and the perfect place to stay. </h3>
        </div>
      </div>
      <div className='nights'>
        {nightRanges.map(({ city, range, start, end }, index) => (
          <div className='night' key={index}>
            <div className='info'>
              <div className='info-header'>
                <h2>{range}: {locationDescriptions[city]?.title || city.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ({start} - {end})</h2>
                <p>{locationDescriptions[city]?.description || "No description available for this location."}</p>
              </div>
              <ToggleList
                data={placeDetails[city].tent}
                onSelectionChange={(index) => handleSelectStatus(city, index)}
              />
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="submit-button" onClick={(event) => {
        handlePageSubmit(event);
        }}
      >Review Your Road Trip</button>
      {fetchError && <div className="error-message">Failed to fetch accommodation details. Please try again later.</div>}
      <PopupModal 
        show={showModal} 
        message={modalMessage} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}

export default BookNorthernMichiganPage;
