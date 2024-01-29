import React from 'react';
import { Link } from 'react-router-dom';
import './../../styles/itineraries.css';

function SouthernCalifornia() {

  return (
    <div className='page'>
        <h1 className="title">San Diego & Palm Springs</h1>
        <h2 className="descriptor">5-Day Road Trip</h2>
        <div className='day'>
            <h3 className="day-title">Day 1: La Jolla</h3>
            <p><strong>Morning:</strong> Begin the day by flying into San Diego or LAX</p>
            <p><strong>Afternoon:</strong></p>
            <p><strong>Night:</strong> </p>
            <p><strong>Accommodations:</strong> </p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 2: La Jolla</h3>
            <p><strong>Morning:</strong> Annie’s Canyon Trail</p>
            <p><strong>Afternoon:</strong>  </p>
            <p><strong>Night:</strong>  </p>
            <p><strong>Accommodations:</strong></p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 3: San Diego</h3>
            <p><strong>Morning:</strong> </p>
            <p><strong>Afternoon:</strong>  </p>
            <p><strong>Night:</strong>  </p>
            <p><strong>Accommodations:</strong></p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 4: Palm Springs</h3>
            <p><strong>Morning:</strong> </p>
            <p><strong>Afternoon:</strong></p>
            <p><strong>Night:</strong></p>
            <p><strong>Accommodations:</strong></p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 5: Joshua Tree National Park</h3>
            <p><strong>Morning:</strong> </p>
            <p><strong>Afternoon:</strong></p>
            <p><strong>Night:</strong></p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 6: Palm Springs</h3>
            <p><strong>Morning:</strong> </p>
            <p><strong>Afternoon:</strong></p>
            <p><strong>Night:</strong></p>
        </div>
        <div className='other-trips'>
            <Link to="/trips/smokymountain" className="trip-link">
                <div className="trip">
                    <span className="trip-title">Smoky Mountain</span>
                    <span className="arrow left-arrow">←</span>
                </div>
            </Link>
        </div>
    </div>
  );
}

export default SouthernCalifornia;