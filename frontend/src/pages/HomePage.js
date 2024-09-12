import React, { useState, useEffect, useRef } from 'react';
import Gallery from './../components/general/Gallery';
import LandingQuestions from '../components/general/LandingQuestions';
import tripMapping from '../tripmapping.json';
import TripPlanner from '../components/general/TripPlanner';

function HomePage() {
  const [destination, setDestination] = useState('');
  const [nights, setNights] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  const [maxNights, setMaxNights] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

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
    <div className='landing-page'>
      {/* Welcome */}
      <div className='landing-welcome'>
        <div className='landing-welcome-content'>
          <h2>
            Welcome to Caravan Club, the ultimate road trip companion for adventurers seeking
            hassle-free outdoor experiences
          </h2>
          <TripPlanner />
        </div>
      </div>

      {/* Trip Logos */}
      <div className='trip-logos'>
        <h2>OUR TRIPS</h2>
        <div className='logo-container'>
          <div className='logo-item'>
            <img src='/images/triplogos/washington.png' alt='Washington' />
            <p>WASHINGTON</p>
          </div>
          <div className='logo-item'>
            <img src='/images/triplogos/northernmichigan.png' alt='Northern Michigan' />
            <p>NORTHERN MICHIGAN</p>
          </div>
          <div className='logo-item'>
            <img src='/images/triplogos/arizona.png' alt='Arizona' />
            <p>ARIZONA</p>
          </div>
          <div className='logo-item'>
            <img src='/images/triplogos/southerncalifornia.png' alt='Southern California' />
            <p>SOUTHERN CALIFORNIA</p>
          </div>
          <div className='logo-item'>
            <img src='/images/triplogos/smokynationalpark.png' alt='Smoky National Park' />
            <p>SMOKY NATIONAL PARK</p>
          </div>
        </div>
      </div>

      <div className='landing-separator'></div>

      {/* Intro */}
      <div className='landing-intro'>
          <h1>Caravan Club</h1>
          <p>
            Caravan Club is your premier destination for effortless road trip adventures. 
            We understand that planning a road trip can be overwhelming, from mapping out 
            routes to securing the perfect campsites. That's why we've designed Caravan Club, 
            a revolutionary travel guide that simplifies your journey like never before.
          </p>
      </div>

      <div className='landing-separator-reverse'></div>

      {/* Info */}
      <div className='landing-info'>
        <h1>Why Caravan Club?</h1>
        <div className='landing-info-questions'>
          <LandingQuestions />
        </div>
      </div>

      {/* Gallery */}
      <div className='landing-gallery-container'>
        <Gallery />
      </div>

    </div>
  );
}

export default HomePage;