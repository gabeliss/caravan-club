import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Gallery from './../components/general/Gallery';
import LandingQuestions from '../components/general/LandingQuestions';

function HomePage() {
  const [destination, setDestination] = useState('');
  const [nights, setNights] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);

  return (
    <div className='landing-page'>
      {/* Welcome */}
      <div className='landing-welcome'>
        <div className='landing-welcome-content'>
          <h2>
            Welcome to Caravan Club, the ultimate road trip companion for adventurers seeking
            hassle-free outdoor experiences
          </h2>
          <div className="trip-planner">
            <div className="trip-planner-column">
              <div>
                <label>I want to go:</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                  <option value="">Select destination</option>
                  <option value="arizona">Arizona</option>
                  <option value="northernmichigan">Northern Michigan</option>
                  <option value="smokymountains">Smoky Mountains</option>
                  <option value="southerncalifornia">Southern California</option>
                  <option value="washington">Washington</option>
                </select>
              </div>
              <div>
                <label>Nights:</label>
                <select value={nights} onChange={(e) => setNights(e.target.value)}>
                  <option value="">Select nights</option>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="trip-planner-column">
              <div className="date-group">
                <div>
                  <label>Start Date:</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={!nights}
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="trip-planner-column">
              <div className="people-group">
                <div>
                  <label>Adults:</label>
                  <input 
                    type="number" 
                    value={adults} 
                    onChange={(e) => setAdults(parseInt(e.target.value))}
                    min="0"
                    placeholder="Adults"
                  />
                </div>
                <div>
                  <label>Kids:</label>
                  <input 
                    type="number" 
                    value={kids} 
                    onChange={(e) => setKids(parseInt(e.target.value))}
                    min="0"
                    placeholder="Kids"
                  />
                </div>
              </div>
            </div>
            <button className="check-availability">Check Availability</button>
          </div>
        </div>
      </div>

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

      <div className='landing-separator'></div>

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