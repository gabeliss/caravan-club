import React, { useState } from 'react';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import './../../styles/components/home/howItWorks.css';

function HowItWorks() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      text: (
        <div>
          <strong>Start with Your Essentials:</strong>
          <br />
          <br />
          <ul>
            <li>Location Choice</li>
            <li>Number of travelers</li>
            <li>Trip dates</li>
          </ul>
          <br />
          <p>
            Using your information, our system creates a road trip with the best stops, maximizing your experience by providing the best spots along your route.
          </p>
          <br />
          <p>
            <strong>Note:</strong> The specific locations and activities in your customized trip will vary depending on the information you provide.
          </p>
        </div>
      ),
      image: "https://caravan-bucket.s3.us-east-2.amazonaws.com/images/bookpages/book3.jpg"
    },
    {
      text: (
        <div>
          <strong>Curate Your Trip</strong>
          <br />
          <br />
          <ul>
            <li>Browse a list of camping sites with live pricing, availability, amenities, and cancellation policies. No need to hunt for these details on multiple sites.</li>
            <li>Choose the camping spots you like best</li>
            <li>Review your entire road trip</li>
          </ul>
          <br />
          <p>
            Customize your trip based on your favorite picks, with peace of mind that these spots are high-quality, approved by our team, and will fit your route.
          </p>
        </div>
      ),
      image: "https://caravan-bucket.s3.us-east-2.amazonaws.com/images/directions_page/directions3.png"
    },
    {
      text: (
        <div>
          <strong>Finalize and Book</strong>
          <br />
          <br />
          <ul>
            <li>View your entire trip in one location</li>
            <li>Enter your payment details just once, and your booking will be automatically processed across all selected campgrounds</li>
          </ul>
          <br />
          <p>
            Receive immediate confirmation directly from the campgrounds, so there's no hassle if changes need to be made.
          </p>
        </div>
      ),
      image: "https://caravan-bucket.s3.us-east-2.amazonaws.com/images/directions_page/directions4.png"
    },
    {
      text: (
        <div>
          <strong>Get Your Custom Itinerary</strong>
          <br />
          <br />
          <ul>
            <li>Once booking has been confirmed, you'll receive your customized itinerary</li>
            <li>You'll get all the details, dates, locations, and CaraVan Trip Plan specific recommendations based on your selections, ensuring a smooth and organized trip.</li>
          </ul>
          <br />
          <p>
            Each itinerary is crafted to match your choices, ensuring you're fully prepared for every part of your journey.
          </p>
        </div>
      ),
      image: "https://caravan-bucket.s3.us-east-2.amazonaws.com/images/directions_page/directions5.png"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="how-it-works-page">
      <section className="title-section">
        <div className="title-section-box">
          <h2 className="title-section-text">How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️</h2>
          <h2 className="title-section-text">How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️ How It Works 〰️</h2>
        </div>
      </section>
      <div className="gallery-container">
        <button className="arrow-btn left" onClick={prevSlide}>
          <ArrowCircleLeftIcon />
        </button>
        <div className="gallery-content">
          <div
            className="slides-wrapper"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div className="slide-content" key={index}>
                <div className="slide-content-text">{slide.text}</div>
                <div className="slide-content-image">
                  <img src={slide.image} alt={`Slide ${index + 1}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="arrow-btn right" onClick={nextSlide}>
          <ArrowCircleRightIcon />
        </button>
      </div>
      <div className="slide-content-image-small-screen">
        <img src={slides[0].image} alt="Image 0" />
      </div>
    </div>
  );
}

export default HowItWorks;
