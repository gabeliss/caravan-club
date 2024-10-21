import React from 'react';
import './../../styles/itineraries.css';

function NorthernMichigan() {

  return (
    <div className='page'>
      <div className="header-section">
        <div className="text-area">
          <h1 className="title">Northern Michigan</h1>
          <h1 className="subtitle">Great Lakes Getaway</h1>
          <div className="text-content">
            <p>
              Discover the diverse landscapes of Northern Michigan, from the lively town of 
              Traverse City to the historic charm of Mackinac Island and the breathtaking 
              beauty of Pictured Rocks National Lakeshore. A CaraVan Club road trip lets you 
              experience it all.
            </p>
          </div>
        </div>
        <div className="image-area">
          <img 
            src="/images/trippage/northernmichigan/kayaking.png" 
            alt="Northern Michigan Landscape"
            className="main-image"
          />
        </div>
      </div>

      <div className="trip-info">
        <h3>A Typical Trip to Northern Michigan</h3>
        <div className="info-item">
          <img src="/images/icons/calendar.png" alt="Calendar" />
          <span className="info-label">Best Time to Visit</span>
          <span className="info-value">May-October</span>
        </div>
        <div className="info-item">
          <img src="/images/icons/clock.png" alt="Clock" />
          <span className="info-label">Suggested Travel Time</span>
          <span className="info-value">6 Nights</span>
        </div>
        <div className="info-item">
          <img src="/images/icons/trail.png" alt="Trail" />
          <span className="info-label">Local Activities</span>
          <span className="info-value">Hiking, Kayaking, Exploring Towns</span>
        </div>
        <div className="info-item">
          <img src="/images/icons/cabin.png" alt="Cabin" />
          <span className="info-label">Typical Accommodations</span>
          <span className="info-value">Tent , Glamping, Boutique Lodging</span>
        </div>
      </div>
      <div className="maps-container">
        <h3>Top Places to Visit in Northern Michigan</h3>
        <div className="maps">
          <div className="map">
            <img src="/images/trippage/northernmichigan/map1.png" alt="Northern Michigan Map" />
          </div>
          <div className="map">
            <img src="/images/trippage/northernmichigan/map2.png" alt="Northern Michigan Map" />
          </div>
        </div>
      </div>
      <div className="places-container">
        <div className="place">
            <div className="place-image">
                <img src="/images/trippage/northernmichigan/lakemichigan.png" alt="Lake Michigan" />
                <h4>Lake Michigan</h4>
            </div>
        </div>
        <div className="place">
            <div className="place-image">
                <img src="/images/trippage/northernmichigan/fishtown.png" alt="Fish Town" />
                <h4>Fish Town</h4>
            </div>
        </div>
        <div className="place">
            <div className="place-image">
                <img src="/images/trippage/northernmichigan/empirebluffs.png" alt="Empire Bluffs" />
                <h4>Empire Bluffs</h4>
            </div>
        </div>
        <div className="place">
            <div className="place-image">
                <img src="/images/trippage/northernmichigan/traversecity.png" alt="Traverse City" />
                <h4>Traverse City</h4>
            </div>
        </div>
        <div className="place">
            <div className="place-image">
                <img src="/images/trippage/northernmichigan/picturedrocks.png" alt="Pictured Rocks" />
                <h4>Pictured Rocks</h4>
            </div>
        </div>
      </div>
    </div>
  );
}

export default NorthernMichigan;
