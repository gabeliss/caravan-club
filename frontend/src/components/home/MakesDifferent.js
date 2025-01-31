import React from 'react';
import './../../styles/components/home/makesDifferent.css';

function MakesDifferent() {

    const sections = [
        {
            image: 'https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/makesDifferent/tent.png',
            title: 'Real-Time Info',
            description: "We pull live pricing, availability, and details for each campground, so you don't have to jump between multiple sites to piece together your trip. Our all-in-one platform gives you everything you need in one place, saving you time and simplifying the planning process"
        },
        {
            image: 'https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/makesDifferent/tree.png',
            title: 'No More Guesswork',
            description: "Choosing the perfect stop for your road trip can be challenging. That's why our experts carefully vet each site for quality and experience, ensuring that every option is a top choice"
        },
        {
            image: 'https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/makesDifferent/navigate.png',
            title: 'Smart Itinerary Adjustments',
            description: "Whether it's a short weekend trip or a longer journey, our system will automatically arrange stops to match your selected number of nights and travelers, ensuring you get the most out of the time you have"
        },
        {
            image: 'https://caravan-bucket.s3.us-east-2.amazonaws.com/images/icons/makesDifferent/hiker.png',
            title: 'Effortless Trip Adjustments:',
            description: "Plans change? No problem. With direct campground confirmations, you can modify your trip as needed—hassle-free. We provide you with each campground's cancellation policy before you book, so you can make informed decisions."
        }
    ]

  return (
    <div className='makes-different-section'>
        <div className='makes-different-section-title'>
            <h2>What Makes CaraVan Trip Plan Different?</h2>
        </div>
        <div className='makes-different-section-content'>
            {sections.map((section, index) => (
                <div key={index} className='makes-different-item'>
                    <div className='makes-different-item-image'>
                        <img src={section.image} alt={section.title} />
                    </div>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                </div>
            ))}
        </div>
    </div>
  );
}

export default MakesDifferent;
