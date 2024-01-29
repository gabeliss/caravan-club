import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './../styles/book.css';

const tripData = [
    {
        image: 'images/trippage/smokymountain.png',
        title: 'Smoky Mountain National Park',
        link: '#book-now-link-1',
    },
    {
        image: 'images/trippage/southerncalifornia.png',
        title: 'Southern California',
        link: '#book-now-link-2',
    },
    {
        image: 'images/trippage/arizona.png',
        title: 'Arizona',
        link: '#book-now-link-3',
    },
    {
        image: 'images/trippage/northernmichigan.png',
        title: 'Northern Michigan',
        link: '#book-now-link-4',
    }
];

function BookPage() {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
            {
            breakpoint: 600,
            settings: {
                slidesToShow: 1, // You can set the number of slides to show on screen > 600px
                slidesToScroll: 1,
                // You can add more settings for different breakpoints
            },
            },
            {
            breakpoint: 1000,
            settings: {
                slidesToShow: 2, // You can set the number of slides to show on screen > 600px
                slidesToScroll: 2,
                // You can add more settings for different breakpoints
            },
            },
        ],
        };



    return (
        <div className='book-page'>
            <div className="book-intro">
                <h1>Book Now</h1>
                <h3>
                    Say goodbye to the hassle of planning. With just a few clicks, choose your desired journey, sit back, and let 
                    us handle the rest. We curate the perfect itinerary, arrange accommodations, and provide detailed guides, ensuring 
                    your road trip experience is nothing short of extraordinary. Book your road trip today and get ready for an 
                    unforgettable expedition filled with freedom, discovery, and endless memories!
                </h3>
                <div class="book-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" class="shape-fill"></path>
                    </svg>
                </div>
            </div>
            <div className="diagram-section">
                <h1>How it Works</h1>
                <div className='all-diagrams'>
                    <div className='one-diagram'>
                        <img src="/images/icons/browse.png" alt="Browse" />
                        <h2>Browse</h2>
                        <p>Explore our diverse range of road trip options</p>
                    </div>
                    <div className='one-diagram'>
                        <img src="/images/icons/select.png" alt="Browse" />
                        <h2>Select</h2>
                        <p>Choose the road trip that resonates with your preferences</p>
                    </div>
                    <div className='one-diagram'>
                        <img src="/images/icons/handshake.png" alt="Browse" />
                        <h2>Customize</h2>
                        <p>Share your preferred dates, accommodation preferences, and the number of travelers. We'll ensure your journey is 
                            personalized to meet your specific needs</p>
                    </div>
                    <div className='one-diagram'>
                        <img src="/images/icons/hiking.png" alt="Browse" />
                        <h2>Explore</h2>
                        <p>Set off on your road trip with less time spent on planning and more time dedicated to adventure</p>
                    </div>
                </div>
                <div class="wave-divider">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
                    </svg>
                </div>
            </div>
            <div className="book-trips">
                <Slider {...settings}>
                    {tripData.map((trip) => (
                        <div key={trip.title} className="trip">
                            <div className="trip-img-container">
                                <img src={trip.image} alt={trip.title} />
                            </div>
                            <div className="trip-info-container">
                            <h2>{trip.title}</h2>
                            <p><a href={trip.link} className="book-link">Book Now</a></p>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
            <div className="book-session">
                <h1>Book a Collaboration Session</h1>
                <p>It all starts with an idea. Whether you're drawn to our carefully curated road trip or have another destination in 
                    mind, we're here to assist you! Schedule a session with our road trip expert to kickstart your planning journey. 
                    The initial session is complimentary!</p>
            </div>
            <div className="book-image">
                <h1>Let us be your virtual caravan</h1>
            </div>
        </div>
    );
}

export default BookPage;