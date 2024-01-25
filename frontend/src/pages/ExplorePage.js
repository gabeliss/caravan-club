import React from 'react';
import './../styles/explore.css';

function ExplorePage() {

  return (
    <div className='explore-page'>
      <div className='explore-item'>
        <img src="/images/explorepage/sandiego.jpg" alt="San Diego and Palm Springs" />
        <h1>San Diego & Palm Springs</h1>
      </div>
      <div className='explore-item'>
        <img src="/images/explorepage/smokymountain.jpg" alt="Smoky Mountain" />
        <h1>Great Smoky Mountain National Park</h1>
      </div>
      <div className='explore-item'>
        <img src="/images/explorepage/sedona.jpg" alt="Sedona" />
        <h1>Sedona, Grand Canyon, Scottsdale</h1>
      </div>
      <div className='explore-item'>
        <img src="/images/explorepage/northernmich.jpg" alt="Northern Michigan" />
        <h1>Northern Michigan & U.P.</h1>
      </div>
    </div>
  );
}

export default ExplorePage;