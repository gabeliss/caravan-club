import React from 'react';
import { Link } from 'react-router-dom';
import './../../styles/itineraries.css';

function SmokyMountain() {

  return (
    <div className='page'>
        <h1 className="title">Great Smoky Mountain National Park</h1>
        <h2 className="descriptor">Weekend Trip 3 Nights</h2>
        <div className='day'>
            <h3 className="day-title">Day 1: Cosby</h3>
            <p><strong>Night:</strong> Upon landing, Upon landing, drive from the airport to Roamstead, your haven nestled near Great Smoky Mountains National Park. After checking in, take some well-deserved rest, recharging for an exciting weekend ahead.</p>
            <p><strong>Accommodations:</strong> During our trip, we opted for a yurt stay at Roamstead, an ideal blend of camping and boutique lodging, perfect for families, friends, or solo travelers seeking a wilderness escape and just a short drive away from the park. The lodge offers a cozy bar, fire pits, kid-friendly movies and activities, each stay catering to everyone's preferences. Plus, the convenience of Wi-Fi allowed us to do some work on Friday morning. Roamstead truly exceeded expectations, making it an unforgettable spot for our stay!</p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 2: Gatlinburg & Smoky Mountains</h3>
            <p><strong>Morning:</strong> Wakeup and get your hiking boots ready for the day! Enjoy some freshly brewed coffee and granola in the lodge. Then depart from Roamstead and enjoy a scenic 20-minute drive to Gatlinburg. While preparing for the morning at the lodge, join the waitlist at Crocketts. We were excited for their delicious breakfast menu, but found the wait extremely long—especially during the fall season. Make sure to check the waitlist prior to leaving for the day to ensure your spot. </p>
            <p><strong>Afternoon:</strong> After brunch, make your way into the park and swing by the visitor center to secure a parking pass for your hike. Drive up the road to Chimney Tops Trail , a moderate 3.6-mile trail offering stunning mountain views. This hike was definitely not flat, but the stairs made it an easier climb up. Then return to Roamstead, grab a bottle of wine or some moonshine to enjoy later. </p>
            <p><strong>Night:</strong> After freshening up at the campgrounds, unwind in the yurt. Then, head down to the lodge for some refreshing cocktails and place your pizza order! Once your pizza is ready head back to your campsite, start a fire, and sip on drinks for the night. </p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 3: Cosby</h3>
            <p><strong>Morning:</strong> Take a leisurely morning and savor a cup of coffee in the lodge before preparing for your day. Once ready, venture to Doc’s 321 Cafe & Marketplace, a unique dining spot offering an eclectic aesthetic and healthy food options that is a must-try experience. Conveniently located near Roamstead, it's a gem worth experiencing.</p>
            <p><strong>Afternoon:</strong> Make your way to Buzzard Roost via the Stone Mountain Trail. A steep 2.6-mile hike, but rewarding with breathtaking mountain views at the end. Once you hike back down, enjoy the river right next to the parking spots. We had a snack on the rocks and took in the changing leaves. It’s the perfect way to conclude the hike. </p>
            <p><strong>Night:</strong> As you make your way back to Roamstead, consider a visit to Carver’s Orchard & Applehouse. Stroll through their property, even picking up some pie, fresh apples, or sweet treats from their candy store. Head to The Woodsheed in Newport for dinner, known for some of the most authentic and mouthwatering BBQ.  We recieved this reccomendation from a local in the area, and I can attest it's a must-try. If you have room, grab some smores from the lodge and roast them over the fire before bed. </p>
        </div>
        <div className='day'>
            <h3 className="day-title">Day 4: Blue Ridge</h3>
            <p><strong>Morning:</strong> It’s time to check out and depart. If your journey allows, consider rerouting through Blue Ridge for picturesque views during your drive. We opted for this route as we flew in and out of Atlanta, although it's worth noting that the drive is a bit winding and may take longer. In Blue Ridge, we took a stroll around the town and discovered the option of a scenic train ride around the mountains. While it wasn't a necessity for our trip, I was curious about the town and it provided a decent spot for lunch. However, it wouldn’t be a destination I'd personally revisit.</p>
        </div>
        <div className='other-trips'>
            <Link to="/trips/northernmichigan" className="trip-link">
                <div className="trip">
                    <span className="trip-title">Northern Michigan</span>
                    <span className="arrow left-arrow">←</span>
                </div>
            </Link>

            <Link to="/trips/southerncalifornia" className="trip-link">
                <div className="trip">
                    <span className="trip-title">Southern California</span>
                    <span className="arrow right-arrow">→</span>
                </div>
            </Link>
        </div>
    </div>
  );
}

export default SmokyMountain;