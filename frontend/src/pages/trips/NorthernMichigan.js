import React from 'react';
import { Link } from 'react-router-dom';
import './../../styles/itineraries.css';

function NorthernMichigan() {

  return (
    <div className='page'>
        <h1 className="title">Northern Michigan & U.P.</h1>
        <h2 className="descriptor">5-Day Road Trip</h2>
        <div className='day'>
            <h3 className="day-title">Day 1: Traverse City</h3>
            <p><strong>Morning:</strong> Arrive early in the morning and start your day with a delightful brunch at  Omelette Shoppe, renowned for its exceptional meals. Take a leisurely stroll around town, exploring shops and soaking in the atmosphere. Don’t miss the Sara Hardy Farmers Market (open Wednesday and Saturday), offering fresh fruits and treats from local vendors.</p>
            <p><strong>Afternoon:</strong> For an afternoon filled with adventure, opt for the windjammer sailboat ride with Nauti-Cat Cruises that provides stunning views of the town and lake. Indulge in drinks and music while aboard. Afterward, return to your accommodations to relax and prepare for dinner.</p>
            <p><strong>Night:</strong> Make a reservation or walk-in to  Farm Club for dinner, a vegetable and flower farm-to-table restaurant right outside of Traverse City. Hang out in their charming backyard, adorned with gardens, and enjoy drinks and appitizers while waiting for your table. Even bring card games to pass the time. Once your table is ready, savor a delightful, freshly prepared meal. After your meal head to Milk & Honey for the best hand-made ice cream in town. </p>
            <p><strong>Accommodations:</strong> Island View Cottages</p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 2: Petoskey & Mackinac City</h3>
            <p><strong>Morning:</strong> Begin your day by packing up and heading on a 1.2-hour drive to Petoskey.</p>
            <p><strong>Afternoon:</strong> Grab a sandwich from Parkside Deli and enjoy your lunch in the park. Take a stroll around the town, grabbing a coffee from Roast & Toast as you walk along the waterfront. Discover the charm of downtown Petoskey before visiting Lavender Hill Farm, where you can explore the lavender fields, homemade goods, and the barn. After a fulfilling day, drive for 1-hour to Straits State Park Campground.</p>
            <p><strong>Night:</strong> Arrive at the campground and set up your campsite. Prepare dinner while watching the sunset next to Mackinaw Bridge.</p>
            <p><strong>Accommodations:</strong> Mackinaw Mill Creek Camping (Cottages & Tents) or Straits State Campground</p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 3: Mackinac Island</h3>
            <p><strong>Morning:</strong> Wake up and prepare lunches for the day, then make your way to the dock to catch the ferry to Mackinac Island. Relax and enjoy the ferry ride to the island. Upon arrival, grab breakfast at Watercolor Cafe, a charming spot that combines an art studio with a restaurant overlooking the water.</p>
            <p><strong>Afternoon:</strong> Visit Mackinac Wheels for bike rentals at $15 per hour. Ride the scenic 8.2-mile loop around the island, stopping at spring trail to see Arch Rock. Cycle to Mission Point Lawn or British Landing for a picnic lunch. Conclude your ride with some Mackinac Island fudge before strolling through town for shopping.</p>
            <p><strong>Night:</strong> Return to the dock and board the ferry for a scenic trip back to your accommodations. Unwind, prepare dinner, and take some well-deserved time to relax after a fulfilling day.</p>
            <p><strong>Accommodations:</strong>Mackinaw Mill Creek Camping (Cottages & Tents) or Straits State Campground orTee Pee Campground or Mackinac House</p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 4: Pictured Rocks National Park & Munising</h3>
            <p><strong>Morning:</strong> Get up bright and early to take down camp. Make your way to Java Joe’s Cafe, where menus are printed on newspapers and the floors get a fresh coat of paint annually. Enjoy breakfast and savor a latte from their extensive selection of 45 flavors. If you’re lucky, you might even have the chance to meet the Mr.Java Joe himself. This charming spot is guaranteed to bring a smile to your face.</p>
            <p><strong>Afternoon:</strong> Start your scenic two-hour drive to Munising, taking in the waterfront views en route. Upon arrival, depending on time, take a stroll around the town and explore the shops. Then, make your way to Uncle Ducky’s Paddling Michigan for your 3 p.m. kayaking tour.</p>
            <p><strong>Night:</strong> Following the stunning kayaking excursion, proceed to Paddlers Village for check-in and get comfortable in your accommodations. Then, unwind at Duck Pound Eatery & Beer Garden, conveniently connected to the property, where you can enjoy drinks and dinner to relax after your day. You can even create a cozy fire to roast marshmallows right by your stay, adding a campy touch to your evening.</p>
            <p><strong>Accommodations:</strong> Paddlers Village Campground (Yurts, Tents, Cabins)</p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 5: Pictured Rocks National Park & Munising</h3>
            <p><strong>Morning:</strong> Begin your morning by venturing into Munising and making a stop at Falling Rock Cafe and Book Store. Indulge in some coffee and breakfast to kickstart your day. Afterward, swing by the market to gather some snacks for your upcoming hike. Then drive over to the Beaver Creek trailhead, starting the hike to Beaver Creek Campground. This campground, is on a bluff nestled beside Lake Superior and Beaver Creek, which offers stunning views and great access to clear blue water. While reservations are necessary for an overnight backcountry stay, it's an ideal day hike for swimming, beautiful views, and beach relaxation, often very quiet away from the crowds. The hike to the campground is approximately 2.2-miles. I’ve used this site as both a backcountry campground and a day use site, both experiences were a great way to relax by the water.</p>
            <p><strong>Afternoon:</strong> Once you finish enjoying the beach and swimming in the clear blue superior waters, hike back to the trailhead. If you’re feeling up to it, consider heading to Miners Castle for a brief 0.4-mile out-and-back hike to the overlook (takes an average of 14 minutes to complete), a key highlight of Pictured Rocks.</p>
            <p><strong>Night:</strong> Return to Uncle Ducky's to freshen up and prepare for dinner. Depending on your craving, there are two excellent options for dining: For quicker meal with fantastic hotdogs and hamburgers, head over to DogPatch, a Munsing staple since 1966.  It's a great spot to satisfy your hunger. If you're in the mood for a more upscale dining experience, make a reservation at Tracey’s. This restaurant, located at Roam Inn, offers a delightful outdoor patio ambiance and serves delicious food. Either choice is guaranteed to meet your needs and provide satisfaction after a day filled with activities. As your adventures come to an end, savor your final night at Paddler’s Village. Take some time to reminisce and reflect on all the wonderful moments and experiences you've had over the last five days.</p>
        </div>
        <div className='other-trips'>
            <Link to="/trips/arizona" className="trip-link">
                <div className="trip">
                    <span className="trip-title">Arizona</span>
                    <span className="arrow left-arrow">←</span>
                </div>
            </Link>

            <Link to="/trips/smokymountain" className="trip-link">
                <div className="trip">
                    <span className="trip-title">Smoky Mountain</span>
                    <span className="arrow right-arrow">→</span>
                </div>
            </Link>
        </div>
    </div>
  );
}

export default NorthernMichigan;