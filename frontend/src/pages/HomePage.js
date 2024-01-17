import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Import Plus and Minus icons
import Gallery from './../components/Gallery';

function HomePage() {
  // State to toggle question answers
  const [showAnswers, setShowAnswers] = useState([false, false, false, false, false]);

  // Function to toggle question answers
  const toggleAnswer = (index) => {
    const newShowAnswers = [...showAnswers];
    newShowAnswers[index] = !newShowAnswers[index];
    setShowAnswers(newShowAnswers);
  };

  return (
    <div className='landing-page'>
      {/* Welcome */}
      <div className='landing-welcome'>
        <div className='landing-welcome-content'>
          <h2>
            Welcome to Caravan Club, the ultimate road trip companion for adventurers seeking
            hassle-free outdoor experiences
          </h2>
          <button>Explore</button>
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
          {/* question 1 */}
          <div className='landing-questions' onClick={() => toggleAnswer(0)}>
            <div className='landing-question'>
              <p>Why choose Caravan Club curated road trips?</p>
              <div className='landing-toggle'>
                {showAnswers[0] ? <FaMinus /> : <FaPlus />}
              </div>
            </div>
            {showAnswers[0] && (
              <div className='landing-answer'>
                <p>
                  Our curated road trips are meticulously designed by seasoned travel experts who've 
                  vetted each route to ensure you experience the absolute best of every destination.
                </p>
              </div>
            )}
          </div>
          {/* question 2 */}
          <div className='landing-questions' onClick={() => toggleAnswer(1)}>
            <div className='landing-question'>
              <p>How does Caravan Club personalize experiences for travelers?</p>
              <div className='landing-toggle'>
                {showAnswers[1] ? <FaMinus /> : <FaPlus />}
              </div>
            </div>
            {showAnswers[1] && (
              <div className='landing-answer'>
                <p>
                  We tailor experiences based on your preferences, whether it's remote wilderness 
                  camping or glamorous glamping with added comforts and amenities. We make sure to 
                  accommodate based on length, ages, and experiences.
                </p>
              </div>
            )}
          </div>
          {/* question 3 */}
          <div className='landing-questions' onClick={() => toggleAnswer(2)}>
            <div className='landing-question'>
              <p>Are these road trips suitable for all types of travelers?</p>
              <div className='landing-toggle'>
                {showAnswers[2] ? <FaMinus /> : <FaPlus />}
              </div>
            </div>
            {showAnswers[2] && (
              <div className='landing-answer'>
                <p>
                  Absolutely, our curated road trips are designed to cater to various preferences and 
                  travel styles, ensuring there's something memorable for everyone, whether you're new 
                  to camping or a backcountry expert.
                </p>
              </div>
            )}
          </div>
          {/* question 4 */}
          <div className='landing-questions' onClick={() => toggleAnswer(3)}>
            <div className='landing-question'>
              <p>How do you ensure a seamless experience throughout the road trip?</p>
              <div className='landing-toggle'>
                {showAnswers[3] ? <FaMinus /> : <FaPlus />}
              </div>
            </div>
            {showAnswers[3] && (
              <div className='landing-answer'>
                <p>
                  We provide detailed guidance, comprehensive maps, insider tips, and support 
                  throughout your journey, ensuring a smooth and enjoyable travel experience.
                </p>
              </div>
            )}
          </div>
          {/* question 5 */}
          <div className='landing-questions' onClick={() => toggleAnswer(4)}>
            <div className='landing-question'>
              <p>How do I get started with one of your curated road trips?</p>
              <div className='landing-toggle'>
                {showAnswers[4] ? <FaMinus /> : <FaPlus />}
              </div>
            </div>
            {showAnswers[4] && (
              <div className='landing-answer'>
                <p>
                  Simply browse through our list of road trips and choose one that captures your 
                  interest. Once you've selected, pick your travel dates, and we'll start tailoring 
                  the trip to your preferences. Our team is here to assist you in curating the ideal 
                  road trip that suits your adventure aspirations.
                </p>
              </div>
            )}
          </div>
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