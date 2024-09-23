import React from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './../styles/booknow.css';
import TripPlanner from './../components/general/TripPlanner';


function BookPage() {
    return (
        <div className='book-now-page'>
            <div className="book-intro">
                <h1>Book Now</h1>
                <h3>
                    Say goodbye to the hassle of planning. With just a few clicks, choose your desired journey, sit back, and let 
                    us handle the rest. We curate the perfect itinerary, arrange accommodations, and provide detailed guides, ensuring 
                    your road trip experience is nothing short of extraordinary. Book your road trip today and get ready for an 
                    unforgettable expedition filled with freedom, discovery, and endless memories!
                </h3>
            </div>
            <div className="book-now-planner">
                <TripPlanner />
            </div>
            <div className="diagram-section">
                <h1>How it works</h1>
                <div className='all-diagrams'>
                    <div className='one-diagram'>
                        <h2>Provide</h2>
                        <img src="/images/icons/handshake.png" alt="Provide" />
                        <p>Provide us with specific information about your ideal road trip</p>
                    </div>
                    <div className='one-diagram'>
                        <h2>Browse</h2>
                        <img src="/images/icons/browse.png" alt="Browse" />
                        <p>Browse our instantly curated list of available options tailored to your preferences</p>
                    </div>
                    <div className='one-diagram'>
                        <h2>Select</h2>
                        <img src="/images/icons/select.png" alt="Select" />
                        <p>Select from our vetted list of accommodations & book your entire trip with one click</p>
                    </div>
                    <div className='one-diagram'>
                        <h2>Explore</h2>
                        <img src="/images/icons/hiking.png" alt="Explore" />
                        <p>Set off on your road trip with less time spent on planning & more time dedicated on the good stuff</p>
                    </div>
                </div>
            </div>
            <div className="book-now-footer">
                <div className="footer-section">
                    <img src="/images/bookpages/book2.jpg" alt="Book Now 1" />
                </div>
                <div className="footer-section">
                    <div className="footer-text">
                        <h2>Discover Your Perfect Journey</h2>
                        <p>Embark on a tailored adventure that suits your style. Our curated road trips offer a blend of scenic routes, hidden gems, and unforgettable experiences.</p>
                    </div>
                </div>
                <div className="footer-section">
                    <img src="/images/bookpages/book3.jpg" alt="Book Now 2" />
                </div>
                <div className="footer-section">
                    <div className="footer-text">
                        <h2>Seamless Planning, Endless Memories</h2>
                        <p>Let us handle the details while you focus on the journey. From accommodations to itineraries, we've got you covered for a stress-free road trip adventure.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookPage;