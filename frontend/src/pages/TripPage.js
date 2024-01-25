import React from 'react';
import './../styles/trip.css';

function TripPage() {

  return (
    <div className='trip-page'>
        <div className='trip-header'>   
            <h1>Our Trips</h1>
        </div>
        <div className='trips-all'>
          <div className='trip-left'>
            <div className="pic-left northern-michigan"></div>
            <div className="info-left-container">
              <div className="info-left">
                  <h2>Northern Michigan</h2>
                  <p>Embark on a 5-day road trip through Northern Michigan to discover iconic landmarks and immerse yourself in the breathtaking outdoor scenery.</p>
              </div>

              <button className="read-more-left">Read More</button>
            </div>
          </div>
      
          <div className='trip-right'>
            <div className="pic-right arizona"></div>
            <div className="info-right-container">
              <div className="info-right">
                  <h2>Arizona</h2>
                  <p>Set out on a 7-day road trip across Arizona, exploring the city, Sedona, and the Grand Canyon to witness the breathtaking variety this journey has to offer.</p>
              </div>

              <button className="read-more-right">Read More</button>
            </div>
          </div>

          <div className='trip-left'>
            <div className="pic-left smoky-mountain"></div>
            <div className="info-left-container">
              <div className="info-left">
                  <h2>Smoky Mountain National Park</h2>
                  <p>Begin a delightful 3-day road trip around Great Smoky Mountains National Park for the ultimate long weekend getaway in nature, offering breathtaking views and a serene and relaxing experience.</p>
              </div>

              <button className="read-more-left">Read More</button>
            </div>
          </div>

          <div className='trip-right'>
            <div className="pic-right southern-california"></div>
            <div className="info-right-container">
              <div className="info-right">
                  <h2>Southern California</h2>
                  <p>Explore Southern California on a 5-day road trip through the vibrant cities of San Diego and Palm Springs, as well as the natural beauty of Joshua Tree National Park.</p>
              </div>

              <button className="read-more-right">Read More</button>
            </div>
          </div>

        </div>

    </div>
  );
}

export default TripPage;