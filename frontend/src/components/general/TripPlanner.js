import React, { useState, useEffect, useRef } from 'react';
import tripMapping from '../../tripmapping.json';
import CustomCalendar from './CustomCalendar';
import '../../styles/tripplanner.css';

function TripPlanner() {
  const [destination, setDestination] = useState('');
  const [nights, setNights] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [maxNights, setMaxNights] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const startDateInputRef = useRef(null);

  useEffect(() => {
    if (destination && tripMapping[destination]) {
      setMaxNights(tripMapping[destination].maxNights || 0);
      setNights('');
      setStartDate('');
      setEndDate('');
    } else {
      setMaxNights(0);
      setNights('');
      setStartDate('');
      setEndDate('');
    }
  }, [destination]);

  useEffect(() => {
    setStartDate('');
    setEndDate('');
  }, [nights]);

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

  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    
    if (newStartDate && nights) {
      const endDate = new Date(newStartDate);
      endDate.setDate(endDate.getDate() + parseInt(nights));
      setEndDate(endDate.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleStartDateClick = () => {
    if (nights) {
      setShowCalendar(true);
    }
  };

  return (
    <div className="trip-planner">
      <div className="trip-planner-row">
        <div className="trip-planner-column">
          <label>I want to go:</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)}>
            <option value="">Select destination</option>
            {Object.keys(tripMapping).map(key => (
              <option key={key} value={key}>{capitalizeFirstLetter(key.replace(/([A-Z])/g, ' $1').trim())}</option>
            ))}
          </select>
        </div>

        <div className="trip-planner-column">
          <label>Nights:</label>
          <select 
            value={nights} 
            onChange={(e) => setNights(e.target.value)}
            disabled={!destination}
          >
            <option value="">Select nights</option>
            {[...Array(maxNights)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
        </div>

        <div className="trip-planner-column">
          <label>During:</label>
          <div className="date-input-wrapper">
            <input 
              type="date" 
              value={startDate} 
              onClick={handleStartDateClick}
              readOnly
              disabled={!nights}
              className={nights ? "date-input-active" : "date-input-disabled"}
              ref={startDateInputRef}
            />
            {showCalendar && nights && (
              <div className="calendar-wrapper" ref={calendarRef}>
                <CustomCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onDateSelect={(date) => {
                    handleStartDateChange(date);
                    setShowCalendar(false);
                  }}
                  nights={nights}
                />
              </div>
            )}
          </div>
          <input 
            type="date" 
            value={endDate} 
            disabled
          />
        </div>

        <div className="trip-planner-column">
          <label>With:</label>
          <select 
            value={adults} 
            onChange={(e) => setAdults(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
            ))}
          </select>
          <select 
            value={kids} 
            onChange={(e) => setKids(parseInt(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} Kid{num !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      <button className="check-availability">Check Availability</button>
    </div>
  );
}

export default TripPlanner;