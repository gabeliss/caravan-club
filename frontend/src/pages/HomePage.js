import React from 'react';
import TripPlanner from '../components/general/TripPlanner';
import HowItWorks from '../components/home/HowItWorks';
import MakesDifferent from '../components/home/MakesDifferent';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

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
        <h2>Our Trips</h2>
        <div className='logo-container'>
          <div className='logo-item' onClick={() => handleLogoClick('northernmichigan')}>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/northernmichigan.png' alt='Northern Michigan' />
            <button className="learn-more-btn">Learn More</button>
          </div>
          <div className='logo-item disabled'>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/washington.png' alt='Washington' />
            <button className="learn-more-btn coming-soon">Coming Soon</button>
          </div>
          <div className='logo-item disabled'>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/arizona.png' alt='Arizona' />
            <button className="learn-more-btn coming-soon">Coming Soon</button>
          </div>
          <div className='logo-item disabled'>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/southerncalifornia.png' alt='Southern California' />
            <button className="learn-more-btn coming-soon">Coming Soon</button>
          </div>
          <div className='logo-item disabled'>
            <img src='https://caravan-bucket.s3.us-east-2.amazonaws.com/images/triplogos/smokynationalpark.png' alt='Smoky National Park' />
            <button className="learn-more-btn coming-soon">Coming Soon</button>
          </div>
        </div>
      </div>

      <HowItWorks />
      <MakesDifferent />
    </div>
  );
}

export default HomePage;
