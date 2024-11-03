import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import tripMapping from '../../tripmapping.json';
import CustomCalendar from './CustomCalendar';
import PopupModal from './PopupModal';
import '../../styles/tripplanner.css';

function TripPlanner() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [destination, setDestination] = useState('northernMichigan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('start');
  const [error, setError] = useState('');
  const [showMaxNightsModal, setShowMaxNightsModal] = useState(false);
  const [showDateLimitModal, setShowDateLimitModal] = useState(false);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  // Capitalize the first letter of destination names
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Format destination name for display
  const formatDestinationName = (key) => {
    return key.replace(/([A-Z])/g, ' $1').split(' ').map(capitalizeFirstLetter).join(' ');
  };

  // Start date change handler
  const handleStartDateChange = (newStartDate) => {
    const selectedDate = new Date(newStartDate);
    const maxDate = new Date('2025-11-30');
    
    if (selectedDate > maxDate) {
      setShowDateLimitModal(true);
      return;
    }
    
    setStartDate(newStartDate);
    const startDateObj = new Date(newStartDate);
    let newEndDate = new Date(startDateObj);
    newEndDate.setDate(startDateObj.getDate() + 1);

    setEndDate(newEndDate.toISOString().split('T')[0]);
  };

  // End date change handler with max nights validation
  const handleEndDateChange = (newEndDate) => {
    const selectedDate = new Date(newEndDate);
    const maxDate = new Date('2025-11-30');
    
    if (selectedDate > maxDate) {
      setShowDateLimitModal(true);
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(newEndDate);

    // Get maxNights from the selected destination
    const maxNights = tripMapping[destination]?.maxNights || 6;

    // Ensure the end date is not more than maxNights past the start date
    if (endDateObj > startDateObj && (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) <= maxNights) {
      setEndDate(newEndDate);
    } else {
      setShowMaxNightsModal(true);
    }
  };

  const getTripSegments = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
    const destinationConfig = tripMapping[destination];
    if (!destinationConfig) {
      console.error(`Destination config not found for ${destination}`);
      return null;  // Return null if destinationConfig is undefined
    }
  
    const itineraryKey = numberOfNights === 1 ? `1night` : `${numberOfNights}nights`;
    const itinerary = destinationConfig[itineraryKey];
  
    if (!itinerary) {
      console.error(`Itinerary not found for ${destination} with ${numberOfNights} nights`);
      return null;  // Return null if the itinerary does not exist
    }
  
    const segments = {};
    let segmentStart = new Date(start);
  
    Object.entries(itinerary).forEach(([night, city], index) => {
      const segmentEnd = new Date(segmentStart);
      if (index === Object.entries(itinerary).length - 1) {
        // For the last segment, set end to trip end date
        segmentEnd.setDate(end.getDate());
      } else {
        // For intermediate segments, add one day to get the correct segment end date
        segmentEnd.setDate(segmentStart.getDate() + 1);
      }
  
      if (segments[city]) {
        segments[city].end = segmentEnd.toISOString().split('T')[0];  // Update only the end date
      } else {
        segments[city] = {
          start: segmentStart.toISOString().split('T')[0],  // Use standard format
          end: segmentEnd.toISOString().split('T')[0],      // Use standard format
        };
      }
  
      // Set next segment's start date to the end date of the current segment
      segmentStart = new Date(segmentEnd);
    });
  
    console.log('Calculated segments:', segments);  // Debug log to inspect segments
    return segments;
  };

  // Handle the availability check
  const handleCheckAvailability = () => {
    if (!destination || !startDate || !endDate || !adults) {
      setError('Please fill out all required fields before checking availability.');
      return;
    }
    setError('');

    const tripSegments = getTripSegments();

    const tripDetails = {
      tripTitle: destination,
      start_date: startDate,
      end_date: endDate,
      num_adults: adults,
      num_kids: kids,
      nights: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
      segments: tripSegments,
    };

    console.log('Trip details:', tripDetails);

    navigate(`/book/${destination.toLowerCase()}`, { state: tripDetails });
  };

  return (
    <div className="trip-planner">
      <div className="trip-planner-row">
        <div className="trip-planner-column destination-column">
          <label>I want to go:</label>
          <select
            className="destination-select"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {Object.keys(tripMapping).map((key) => (
              <option key={key} value={key}>
                {capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1').trim())}
              </option>
            ))}
          </select>
        </div>

        <div className="trip-planner-column date-column">
          <label>During:</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              value={startDate}
              onClick={() => {
                setShowCalendar(true);
                setCalendarMode('start');
              }}
              className="date-input-active"
              readOnly
            />
            <input
              type="date"
              value={endDate}
              onClick={() => {
                setShowCalendar(true);
                setCalendarMode('end');
              }}
              className="date-input-active"
              readOnly
            />
          </div>
          {showCalendar && (
            <div className="calendar-wrapper" ref={calendarRef}>
              <CustomCalendar
                startDate={startDate}
                endDate={endDate}
                onDateSelect={(date) => {
                  if (calendarMode === 'start') {
                    handleStartDateChange(date);
                  } else {
                    handleEndDateChange(date);
                  }
                  setShowCalendar(false);
                }}
              />
            </div>
          )}
        </div>

        <div className="trip-planner-column adults-column">
          <label className="trip-planner-column-with">With:</label>
          <select value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} className="adults-select">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
            ))}
          </select>
          <select value={kids} onChange={(e) => setKids(parseInt(e.target.value))} className="adults-select">
            {[0, 1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Kid{num !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className="trip-planner-column button-column">
          <button className="check-availability" onClick={handleCheckAvailability}>
            Check Availability
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <PopupModal
        show={showMaxNightsModal}
        message={`This trip has a maximum duration of ${tripMapping[destination]?.maxNights || 6} nights. Please select a shorter date range.`}
        onClose={() => setShowMaxNightsModal(false)}
      />
      <PopupModal
        show={showDateLimitModal}
        message="We're sorry, but bookings are only available through November 2025 at this time."
        onClose={() => setShowDateLimitModal(false)}
      />
    </div>
  );
}

export default TripPlanner;
