import React from 'react';
import { Link } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from './../../components/BookPagesToggle';

function BookNorthernMichiganPage() {

    const toggleData = [
        {
            title: 'Traverse City State Park',
            content: 'Immerse yourself in nature by camping at Traverse City State Park, situated right on Traverse City Bay. Enjoy the serenity of the outdoors while being just 10 minutes away from downtown.',
            available: true,
        },
        {
            title: 'Timber Ridge Recreation',
            content: 'Discover the ideal glamping destination at Timber Ridge Recreation, where you can stay in a yurt, cottage, cabin, or tent. Located just 18 minutes from downtown, these accommodations provide a unique experience and can comfortably host up to 10 people.',
            available: false,
        },
        {
            title: 'Island View Cottages',
            content: 'The Anchor Inn offers a boutique lodging experience just a 9-minute drive from Traverse City, featuring charming cabins with a private beach that can accommodate up to six people.',
            available: false,
        },
        {
            title: 'Anchor Inn',
            content: 'Immerse yourself in nature by camping at Traverse City State Park, situated right on Traverse City Bay. Enjoy the serenity of the outdoors while being just 10 minutes away from downtown.',
            available: true,
        },
        {
            title: 'The Grey Hare Inn',
            content: 'Experience the ambiance of the Tuscan countryside at Grey Hare Inn, a picturesque vineyard bed and breakfast located just 17 minutes outside of downtown.',
            available: true,
        },
        // ... other items
    ];

  return (
    <div className='book-page'>
        <div className='intro'>
            <h1>Northern Michigan</h1>
            <h2>5-Day Road Trip</h2>
        </div>
        <div className='nights'>
            <div className='night'>
                <img src="/images/bookpages/northernmichigan1.png" alt="Northern Michigan" />
                <div className='info'>
                    <h2>Night 1 & 2: Traverse City</h2>
                    <p>Night 1 and 2 begin in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    <div className='select-stay-container'>
                        <h4 className='blank'></h4>
                        <h3 className='select-stay'>Select Stay:</h3>
                    </div>
                    <ToggleList data={toggleData} />
                </div>
            </div>
        </div>
    </div>
  );
}

export default BookNorthernMichiganPage;