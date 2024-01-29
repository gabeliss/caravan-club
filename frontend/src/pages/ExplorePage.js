import React from 'react';
import { Link } from 'react-router-dom';
import './../styles/explore.css';

function ExplorePage() {

  return (
    <div className='explore-page'>
      <div className='explore-item'>
        <Link to="/trips/southerncalifornia">
          <img src="/images/explorepage/sandiego.jpg" alt="San Diego and Palm Springs" />
        </Link>
        <h1>San Diego & Palm Springs</h1>
      </div>
      <div className='explore-item'>
        <Link to="/trips/smokymountain">
          <img src="/images/explorepage/smokymountain.jpg" alt="Smoky Mountain" />
        </Link>
        <h1>Great Smoky Mountain National Park</h1>
      </div>
      <div className='explore-item'>
        <Link to="/trips/arizona">
          <img src="/images/explorepage/sedona.jpg" alt="Sedona" />
        </Link>
        <h1>Sedona, Grand Canyon, Scottsdale</h1>
      </div>
      <div className='explore-item'>
        <Link to="/trips/northernmichigan">
          <img src="/images/explorepage/northernmich.jpg" alt="Northern Michigan" />
        </Link>
        <h1>Northern Michigan & U.P.</h1>
      </div>
    </div>
  );
}

export default ExplorePage;