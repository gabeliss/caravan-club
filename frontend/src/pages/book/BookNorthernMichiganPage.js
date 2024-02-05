import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../../styles/bookpages.css';
import ToggleList from './../../components/BookPagesToggle';

function BookNorthernMichiganPage() {

    const [numTravelers, setNumTravelers] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAccommodations, setSelectedAccommodations] = useState({
      night1and2: null,
      night3and4: null,
      night5: null,
    });
    
    const navigate = useNavigate(); // For navigation
  
    const validateForm = () => {
      // Check if all required fields are filled and at least one accommodation per night is selected
      if (!numTravelers || !startDate || !endDate) {
        alert("Please fill all required fields");
        return false;
      }
      else if (Object.values(selectedAccommodations).some(value => value === null)) {
        alert("Please select at least one accommodation for each night.");
        return false;
      }
      return true;
    };
  
    const handleSubmit = (event) => {
      event.preventDefault();
      if (validateForm()) {
        console.log('Navigating with state:', { numTravelers, startDate, endDate, selectedAccommodations }); // Debugging log
        // Proceed with the navigation and pass the state to the ReviewTrip page
        navigate('/reviewtrip', { state: { numTravelers, startDate, endDate, selectedAccommodations } });
      }
    };

    const handleSelectStatus = (nightKey, index) => {
        setSelectedAccommodations(prev => {
            const newState = { ...prev, [nightKey]: prev[nightKey] === index ? null : index };
            console.log(`Updated state for ${nightKey}:`, newState[nightKey]); // Debugging log
            return newState;
        });
    };

    const night1and2 = [
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

    const night3and4 = [
        {
            title: 'Mackinaw Mill Creek Camping & Cabins',
            content: 'Uncover the enchantment of Mackinaw Mill Creek Camping and Glamping, strategically positioned just a brief 5-minute drive from the ferry port to Mackinaw Island. This accommodation offers the choice between tents or cabins and is conveniently situated right next to the water. It serves as the perfect base camp for your island exploration adventures.',
            available: true,
        },
        {
            title: 'Tee Pee Campground',
            content: 'Tee Pee Campground offers an excellent accommodation option conveniently located next to the ferry port for easy access to the island. With a complimentary shuttle service and a picturesque waterfront setting, this campsite caters exclusively to tent and RV camping, embracing a "no-frills" experience focused on nature, a renovated bathroom, and your personal site. It provides a great and budget-friendly retreat for nature enthusiasts.',
            available: false,
        },
        {
            title: 'Roberts Landing Campground',
            content: 'Roberts Landing Campground is a scenic retreat for tents and RVs, situated directly on the shores of Lake Huron. Offering convenient access to Mackinaw Island ports, just a 10-minute drive away, this campground typically features lakefront sites, providing an excellent opportunity to be close to nature.',
            available: false,
        },
        {
            title: 'Straits State Park',
            content: 'Straits State Park has fantastic views of the Mackinac Bridge and the boat traffic going under the bridge on the Straits of Mackinac from the trails, campground or the viewing platform. The park has a picnic area, playground and waterfront area along Lake Huron.',
            available: true,
        },
        {
            title: 'Cabins of Mackinaw',
            content: "Nestled in Downtown Mackinaw City, Cabins of Mackinac offer a two-story retreat with two bedrooms, a jacuzzi bath, kitchenette, and living area. Located across from Mackinac Island Ferry Docks, guests enjoy a scenic view of Lake Huron. Amenities include indoor/outdoor pools, a whirlpool spa, and unlimited access to the adjacent Pirate's Adventure waterpark. Perfect for a relaxing Mackinaw getaway with convenient access to both tranquility and adventure.",
            available: false,
        },
        {
            title: 'St Ignace / Mackinac Island KOA',
            content: "Mackinaw City KOA is an ideal retreat for those seeking a cozy stay in a tent or cabin, conveniently located just 6 minutes from the Mackinac Island port. While it's not directly situated on the beach, the campground offers a short and pleasant walk to the shore. Embrace the scenic surroundings as you enjoy the close proximity to the water, providing a serene and picturesque setting. Whether you prefer the charm of a tent or the comfort of a cabin, Mackinaw City KOA ensures a delightful stay with its strategic location and easy access to both natural beauty and the gateway to Mackinac Island.",
            available: true,
        },
        {
            title: 'The Inn at Stonecliffe',
            content: "The Inn at Stone Cliff is your premier destination for luxury accommodations just outside the charming town of Mackinac Island. Offering a quaint and sophisticated stay, the Inn boasts a delightful patio, a refreshing pool, a wellness center, and breathtaking views of the lake. Immerse yourself in comfort and style as you unwind in this idyllic setting, providing a perfect blend of relaxation and indulgence. Whether you're seeking tranquility or a touch of elegance, The Inn at Stone Cliff promises a memorable experience with its upscale amenities and picturesque surroundings.",
            available: true,
        },
        {
            title: "Haan's 1830 Inn",
            content: "Embrace the enchanting allure of Haan's 1830 Inn, situated just a few blocks east from downtown, providing our guests with a convenient and tranquil escape. Revel in the serenity that comes with being away from the bustling crowds while still relishing the proximity to Mackinac Island's key attractions. The bed and breakfast warmly welcomes guests each morning with a delicious breakfast, fostering a communal atmosphere where travelers can share stories and experiences. This stay is reasonably priced, ensuring that your visit to Mackinac Island is not only delightful but also affordable. Experience the perfect blend of charm, comfort, and affordability at this historic inn.",
            available: false,
        },
        {
            title: 'Metiview Inn',
            content: 'Discover the historic charm of Metivier Inn, ideally situated on Market Street in Mackinac Island, Michigan. Originally built in 1877 as a private residence by Louis Metivier, the inn retains its original French and English influences, preserving a rich heritage. With a convenient downtown location, Metivier Inn offers spacious, relaxing porches, beautiful Victorian gardens, and peaceful sitting areas where guests can unwind. Enjoy a delightful breakfast served daily, completing the experience at this picturesque inn.',
            available: true,
        },
        // ... other items
    ];

    const night5 = [
        {
            title: "Uncle Ducky's - Paddlers Village",
            content: "Uncle Ducky's - Paddlers Village offers a charming accommodation near Pictured Rocks, allowing guests to choose between yurts, tents, and cabins. With a delightful beer garden and lakefront access, it provides a serene and versatile retreat for a memorable stay.",
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
        <h1>Let's Get Started</h1>
        <div className='details'>
            <h1>Tell us about your trip:</h1>
            <div className='form-group'>
                <label htmlFor='numTravelers'>Number of Travelers (required)</label>
                <select id='numTravelers' value={numTravelers} onChange={(e) => setNumTravelers(e.target.value)} required>
                    <option value=''>Select an option</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                    <option value='9'>9</option>
                    <option value='10'>10</option>
                </select>
            </div>
            <div className='form-group'>
                <label htmlFor='startDate'>Start Date (required)</label>
                <input type='date' id='startDate' value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <label htmlFor='endDate'>End Date (required)</label>
                <input type='date' id='endDate' value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div className='form-group'>
                <button type='submit' className='submit-button'>Submit</button>
            </div>
        </div>
        <div className='nights'>
            <div className='night'>
                <div className='pic'>
                    <img src="/images/bookpages/northernmichigan1.png" alt="Northern Michigan" />
                </div>
                <div className='info'>
                    <h2>Night 1 & 2: Traverse City</h2>
                    <p>Night 1 and 2 begin in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    <div className='select-stay-container'>
                        <h4 className='blank'></h4>
                        <h3 className='select-stay'>Select Stay:</h3>
                    </div>
                    <ToggleList
                        data={night1and2}
                        onSelectionChange={(index) => handleSelectStatus('night1and2', index)}
                    />
                </div>
            </div>
            <div className='night'>
                <div className='pic reverse-pic'>
                    <img src="/images/bookpages/northernmichigan2.jpg" alt="Northern Michigan" />
                </div>
                <div className='info reverse-info'>
                    <h2>Night 3 & 4: Mackinac Island or City</h2>
                    <p>Night 3 begins in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    <div className='select-stay-container'>
                        <h4 className='blank'></h4>
                        <h3 className='select-stay'>Select Stay:</h3>
                    </div>
                    <ToggleList
                        data={night3and4}
                        onSelectionChange={(index) => handleSelectStatus('night3and4', index)}
                    />
                </div>
            </div>
            <div className='night'>
                <div className='pic'>
                    <img src="/images/bookpages/northernmichigan3.jpg" alt="Northern Michigan" />
                </div>
                <div className='info'>
                    <h2>Night 5: Pictured Rocks</h2>
                    <p>Night 5 begin in Traverse City, where you can choose from a variety of glamping, camping, and boutique stays. Select the one that best suits your preferences, and we'll handle the rest. In the event that your chosen accommodation is unavailable, we will provide you with the next best option.</p>
                    <div className='select-stay-container'>
                        <h4 className='blank'></h4>
                        <h3 className='select-stay'>Select Stay:</h3>
                    </div>
                    <ToggleList
                        data={night5}
                        onSelectionChange={(index) => handleSelectStatus('night5', index)}
                    />
                </div>
            </div>
        </div>
        <div className='form-group'>
            <button type='submit' className='submit-button' onClick={handleSubmit}>Submit</button>
        </div>
    </div>
  );
}

export default BookNorthernMichiganPage;