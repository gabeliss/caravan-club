import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from './../components/general/Gallery';
import LandingQuestions from '../components/general/LandingQuestions';

function HomePage() {

  return (
    <div className='landing-page'>
      {/* Welcome */}
      <div className='landing-welcome'>
        <div className='landing-welcome-content'>
          <h2>
            Welcome to Caravan Club, the ultimate road trip companion for adventurers seeking
            hassle-free outdoor experiences
          </h2>
          <Link to="/explore">
            <button>Explore</button>
          </Link>
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