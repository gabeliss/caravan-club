import React from 'react';
import './../../styles/itineraries.css';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function NorthernMichigan() {
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
    arrows: false  // This removes the arrows
  };

  return (
    <div className='page'>
      <div className="header-section">
        <div className="text-area">
          <h1 className="title">Northern Michigan</h1>
          <h1 className="subtitle">Great Lakes Getaway</h1>
        </div>
      </div>

      <div className="trip-info-container">
        <div className="trip-info">
          <h3>A Typical Trip to Northern Michigan</h3>
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
        <div className="trip-info-image">
          <img 
            src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/kayaking.png" 
            alt="Northern Michigan Landscape"
            className="main-image"
          />
        </div>
      </div>

      <div className="text-content">
        <h1>The Best of Northern Michigan</h1>
        <p>
          Explore the beatury of Northern Michigan on a customizable road trip with options for up to 6
          nights, featuring all camping accomodations. This trip is perfect for those who want to immerse
          themselves in the natural beatury and quaint towns of Michigan's most iconic destinations:
          Traverse City, Mackinac City/Island, and Pictured Rocks National Lakeshore.
        </p>
      </div>

      <div className="best-stuff">
        <div className="best-object">
          <div className="best-title">Favorite Restaurant</div>
          <div className="best-images">
            <Slider {...sliderSettings}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={`restaurant${num}`}>
                  <img 
                    src={`https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/restaurant/restaurant${num}.jpg`}
                    alt={`Restaurant ${num}`}
                    className="best-image"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="best-answer">Farm Club</div>
        </div>
        <div className="best-object">
          <div className="best-title">Best Hike</div>
          <div className="best-images">
            <Slider {...sliderSettings}>
              {[1, 2, 3, 4].map((num) => (
                <div key={`hike${num}`}>
                  <img 
                    src={`https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/hike/hike${num}.jpg`}
                    alt={`Hike ${num}`}
                    className="best-image"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="best-answer">Empire Bluff Trail</div>
        </div>
        <div className="best-object">
          <div className="best-title">Best Activity</div>
          <div className="best-images">
            <Slider {...sliderSettings}>
              {[1, 2, 3].map((num) => (
                <div key={`activity${num}`}>
                  <img 
                    src={`https://caravan-bucket.s3.us-east-2.amazonaws.com/images/trippage/northernmichigan/activity/activity${num}.jpg`}
                    alt={`Activity ${num}`}
                    className="best-image"
                  />
                </div>
              ))}
            </Slider>
          </div>
          <div className="best-answer">Sailing on Traverse Bay</div>
        </div>
      </div>

      <div className="outro-text">
        Want more recommendations? Book your trip with Caravan Trip Plan to receive a personalized 
        itinerary packed with restaurants, activities, hikes, and more!
      </div>
      <Link to="/">
        <button className='book-now-button'>Book Now</button>
      </Link>

    </div>
  );
}

export default NorthernMichigan;
