import React, { useState, useEffect, useRef } from 'react';
import tripMapping from '../tripmapping.json';
import TripPlanner from '../components/general/TripPlanner';
import HowItWorks from '../components/home/HowItWorks';
import MakesDifferent from '../components/home/MakesDifferent';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [destination, setDestination] = useState('');
  const [nights, setNights] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxNights, setMaxNights] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogoClick = (tripPath) => {
    navigate(`/trips/${tripPath}`);
  };

  return (
    <div className='landing-page'>
      {/* Welcome */}
      <div className='landing-welcome'>
        <div className='landing-welcome-content'>
          <h2>
            Welcome to CaraVan Trip Plan, the ultimate road trip companion for adventurers seeking
            hassle-free outdoor experiences
          </h2>
          <TripPlanner />
        </div>
      </div>

      {/* Intro */}
      <div className='landing-intro'>
          <h1>CaraVan Trip Plan</h1>
          <p>
            Caravan Club is your premier destination for effortless road trip adventures. 
            We understand that planning a road trip can be overwhelming, from mapping out 
            routes to securing the perfect campsites. That's why we've designed Caravan Club, 
            a revolutionary travel guide that simplifies your journey like never before.
          </p>
      </div>

      <div className='landing-separator-reverse'></div>

      {/* Trip Logos */}
      <div className='trip-logos'>
        <h2>OUR TRIPS</h2>
        <div className='logo-container'>
          <div className='logo-item' onClick={() => handleLogoClick('washington')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/washington.png' alt='Washington' />
          </div>
          <div className='logo-item' onClick={() => handleLogoClick('northernmichigan')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/northernmichigan.png' alt='Northern Michigan' />
          </div>
          <div className='logo-item' onClick={() => handleLogoClick('arizona')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/arizona.png' alt='Arizona' />
          </div>
          <div className='logo-item' onClick={() => handleLogoClick('southerncalifornia')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/southerncalifornia.png' alt='Southern California' />
          </div>
          <div className='logo-item' onClick={() => handleLogoClick('smokymountain')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/smokynationalpark.png' alt='Smoky National Park' />
          </div>
        </div>
      </div>

      <HowItWorks />
      <MakesDifferent />
    </div>
  );
}

export default HomePage;
