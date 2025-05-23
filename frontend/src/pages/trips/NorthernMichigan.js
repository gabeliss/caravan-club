import React, { useEffect } from 'react';
import './../../styles/itineraries.css';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AOS from 'aos';
import 'aos/dist/aos.css';

function NorthernMichigan() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className='page'>
      <div className="header-section" data-aos="fade-up">
        <div className="text-area">
          <h1 className="title">Great Lakes Getaway</h1>
          <h1 className="subtitle">Northern Michigan</h1>
        </div>
      </div>

      <div className="trip-info-container" data-aos="fade-up">
        <div className="trip-info">
          <h3>A Typical Trip</h3>
          <div className="info-item">
            <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/calendar.png" alt="Calendar" />
            <span className="info-label">Best Time to Visit</span>
            <span className="info-value">May-October</span>
          </div>
          <div className="info-item">
            <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/clock.png" alt="Clock" />
            <span className="info-label">Suggested Travel Time</span>
            <span className="info-value">6 Nights</span>
          </div>
          <div className="info-item">
            <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/trail.png" alt="Trail" />
            <span className="info-label">Local Activities</span>
            <span className="info-value">Hiking, Kayaking, Exploring Towns</span>
          </div>
          <div className="info-item">
            <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/cabin.png" alt="Cabin" />
            <span className="info-label">Typical Accommodations</span>
            <span className="info-value">Tent</span>
          </div>
        </div>
        <div className="trip-info-image" data-aos="fade-up">
          <img 
            src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/kayaking.png" 
            alt="Northern Michigan Landscape"
            className="main-image"
          />
        </div>
      </div>

      <div className="text-content" data-aos="fade-up">
        <h1>Want The Full Itinerary?</h1>
        <Link to="/">
          <button className='book-now-button'>Book a Trip</button>
        </Link>
      </div>

      <div className="best-stuff">
        <div className="best-restaurant" data-aos="fade-up">
          <div className="best-restaurant-text">
            <h1>Favorite Restaurant</h1>
            <p>
              <strong>Farm Club</strong> seamlessly blends farming, dining, and community. Nestled just outside Traverse City, it offers a unique 
              experience where visitors can enjoy fresh, seasonal meals sourced directly from its own farm, sip on house-brewed 
              beer and cider, and shop a thoughtfully curated market. Founded on the belief that <strong>good food and good company </strong>
              go hand in hand, Farm Club is a space for connection—between people, the land, and the flavors of the region.
            </p>
          </div>
          <div className="best-restaurant-images">
            <div className="image-row" data-aos="fade-up">
              <div className="single-image-column image-column">
              <span className="caption-large">Farm Club</span>
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant1.jpg" alt="Farm Club 1" className="cover-image" />
                <span className="caption align-left">Outdoor lawn seating for bar and market snacks</span>
              </div>
              <div className="double-image-column image-column">
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant2.jpg" alt="Farm Club 2" className="contain-image" />
                <span className="caption"></span>
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant3.jpg" alt="Farm Club 3" className="contain-image" />
                <span className="caption">Farm to Table Ingredients</span>
              </div>
            </div>
            <div className="image-row" data-aos="fade-up">
              <div className="double-image-column image-column negative-padding">
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant4.jpg" alt="Farm Club 4" className="cover-image img-4" />
                <span className="caption align-right">No Reservations Required</span>
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant5.jpg" alt="Farm Club 5" className="cover-image" />
                <span className="caption align-left">Enjoy a drink from the backyard while<br></br> you wait for your table!</span>
              </div>
              <div className="single-image-column image-column">
                <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant6.jpg" alt="Farm Club 6" className="cover-image" />
              </div>
            </div>
          </div>
        </div>
        <div className="best-hike" data-aos="fade-up">
          <div className="best-hike-text">
            <h1>Favorite Hike</h1>
            <p>
              <strong>Empire Bluff Trail</strong> offers a perfect blend of nature, adventure, and stunning views. 
              This <strong>1.5-mile hike</strong> winds through a beech-maple forest before revealing a 
              breathtaking overlook of Lake Michigan, rolling dunes, and South Manitou Island. A must-do in Northern 
              Michigan, it's especially magical at sunrise or sunset.
            </p>
          </div>
          <div className="best-hike-details">
            <div className="best-hike-image" data-aos="fade-up">
              <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/hike/hike1.jpg" alt="Empire Bluff Trail" className="cover-image" />
            </div>
            <div className="best-hike-details-text" data-aos="fade-up">
              <h1>Empire Bluffs</h1>
              <p>
                Stunning views, ease of trail, and well-maintained paths. Challenges include some steep areas and potential 
                crowding. Starting early and staying on marked paths are recommended.
              </p>
              <div className="best-hike-details-facts">
                <div className="best-hike-details-facts-row">
                  <div className="best-hike-details-facts-column">
                    <h1>Distance</h1>
                    <p>1.5 miles</p>
                  </div>
                  <div className="best-hike-details-facts-column">
                    <h1>Estimated Time</h1>
                    <p>36 minutes</p>
                  </div>
                </div>
                <div className="best-hike-details-facts-row">
                  <div className="best-hike-details-facts-column">
                    <h1>Level</h1>
                    <p>Beginner</p>
                  </div>
                  <div className="best-hike-details-facts-column">
                    <h1>Season</h1>
                    <p>May-November</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="best-activity" data-aos="fade-up">
          <div className="best-activity-text">
            <h1>Favorite Activity</h1>
            <h2>Cruise Along Grand Traverse Bay</h2>
            <p>
              Experience the beauty of Northern Michigan on a <strong>Nauti-Cat Cruise</strong> around <strong>Grand Traverse Bay</strong>. 
              Enjoy stunning views, music, and drinks while relaxing aboard. Whether it's a sunny day or a sunset ride, 
              it's the perfect mix of adventure and relaxation, making it a must-do!
            </p>
          </div>
          <div className="best-activity-images" data-aos="fade-up">
            <div className="best-activity-image">
              <img src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/activity/activity1.jpg" alt="Activity 1" className="cover-image" />
            </div>
          </div>
        </div>
      </div>

      <div className="sliding-footer">
        <div className="sliding-text">
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
          &nbsp;&nbsp;&nbsp;&nbsp;
          Let's Caravan
        </div>
      </div>
    </div>
  );
}

export default NorthernMichigan;
