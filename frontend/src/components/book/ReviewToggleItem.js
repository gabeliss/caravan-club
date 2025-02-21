import React, { useState, useRef } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './../../styles/bookpages.css';
import './../../styles/reviewtrip.css';

const ReviewToggleItem = ({ title, content, availability, price, message, details, nightRange }) => {
    const [isActive, setIsActive] = useState(false);
    const contentRef = useRef(null);

    const toggleExpand = () => {
        setIsActive(prevState => !prevState);
    };

    const formattedPrice = `$${(price || 0).toFixed(2)} Total for Stay`;
    console.log('details', details);
    const basePrice = `$${(details.basePrice || 0).toFixed(2)}`;
    const taxesAndFees = `$${Math.max(0, ((details.taxes || 0) * (details.numNights || 0) || 0) + (details.fees || 0)).toFixed(2)}`;

    return (
        <div className={`toggle-item ${isActive ? 'expanded' : ''}`}>
            <div className="toggle-container">
                <div className="toggle-images">
                    {details.imageUrls?.length > 0 && (
                        <Slider
                            className="image-carousel"
                            dots={true}
                            infinite={false}
                            speed={500}
                            slidesToShow={1}
                            slidesToScroll={1}
                            adaptiveHeight={false}
                        >
                            {details.imageUrls.map((url, index) => (
                                <div key={index} className="carousel-slide">
                                    <img src={url} alt={`${index + 1}`} className="toggle-img" />
                                </div>
                            ))}
                        </Slider>
                    )}
                </div>
                <div className="night-range-chip">
                    {nightRange}
                </div>
                <div className="toggle-header">
                    <h1>{title}</h1>
                    <p><i>{details.cityAndState}</i></p>
                </div>
                <div className="price-chip">
                    <div className="price-text">{formattedPrice}</div>
                    <span 
                        className={`toggle-icon-review ${isActive ? 'active' : ''}`} 
                        onClick={toggleExpand}
                    >
                        <KeyboardArrowDownIcon />
                    </span>
                </div>
            </div>
            <div ref={contentRef} className={`toggle-content ${isActive ? 'active' : ''}`}>
                <div className="additional-details">
                    <p><strong>Base Price Per Night:</strong> {basePrice}</p>
                    <p><strong>Taxes / Fees:</strong> {taxesAndFees}</p>
                    <p><strong>Total for Stay:</strong> {formattedPrice}</p>
                    {details.checkInTime && <p><strong>Check-in:</strong> {details.checkInTime}</p>}
                    {details.checkOutTime && <p><strong>Check-out:</strong> {details.checkOutTime}</p>}
                    {details.guidelines && <p><strong>Guidelines:</strong> {details.guidelines}</p>}
                    {details.cancellationPolicy && <p><strong>Cancellation Policy:</strong> {details.cancellationPolicy}</p>}
                </div>
            </div>
        </div>
    );
};

export default ReviewToggleItem;
