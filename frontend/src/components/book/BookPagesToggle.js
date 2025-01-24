import React, { useState, useRef, useEffect } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import './../../styles/bookpages.css';

const ToggleItem = ({ title, content, isActive, setActive, availability, price, message, isSelected, onSelect, details }) => {
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [isActive]);

    const currentHeight = isActive ? `${contentHeight + 5000}px` : '0px';

    return (
        <div className={`toggle-item ${isActive ? 'expanded' : ''}`}>
            <div className={`toggle-container ${isActive ? 'hidden' : ''}`}>
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
                                    <img src={url} alt={`Image ${index + 1}`} className="toggle-img" />
                                </div>
                            ))}
                        </Slider>
                    )}
                </div>
                <div className="toggle-header">
                    <h1>{title}</h1>
                    <p><i>{details.cityAndState}</i></p>
                    <p>{details.offerings}</p>
                    <p><strong>Distance to town:</strong> {details.distanceToTown}</p>
                </div>
                <div
                    className={`availability-status ${availability ? 'available' : 'not-available'} ${isSelected ? 'selected' : ''}`} 
                    onClick={() => availability && onSelect()}
                >
                    {message}
                </div>
            </div>
            <div
                ref={contentRef}
                className={`toggle-content ${isActive ? 'active' : ''}`}
            >
                <h2>{title}</h2>
                <p>{content}</p>
    
                {/* Display only specific details when expanded */}
                <div className="additional-details">
                    {details.amenities?.length > 0 && (
                        <>
                            <p><strong>Amenities:</strong></p>
                            <ul>
                                {details.amenities.map((amenity, i) => (
                                    <li key={i}>{amenity}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {details.checkInTime && <p><strong>Check-in:</strong> {details.checkInTime}</p>}
                    {details.checkOutTime && <p><strong>Check-out:</strong> {details.checkOutTime}</p>}
                    {details.guidelines && <p><strong>Guidelines:</strong> {details.guidelines}</p>}
                    {details.cancellationPolicy && <p><strong>Cancellation Policy:</strong> {details.cancellationPolicy}</p>}
                </div>
            </div>
            <span className={`toggle-icon ${isActive ? 'active' : ''}`} onClick={setActive}>
                <KeyboardArrowDownIcon />
            </span>
        </div>
    );
};

const ToggleList = ({ data, onSelectionChange }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedStatusKey, setSelectedStatusKey] = useState(null);

    const handleSetActive = index => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
    };

    const handleSelectStatus = key => {
        setSelectedStatusKey(prevKey => prevKey === key ? null : key);
        onSelectionChange(key);
    };

    return (
        <>  <div className='toggle-labels'>
                <div className='select-stay-label'>Select One Campground:</div>
            </div>
            <div className="toggle-list">
                {Object.entries(data).map(([key, details], index) => (
                <ToggleItem 
                    key={key}
                    title={details.title}
                    content={details.content}
                    isActive={index === activeIndex}
                    setActive={() => handleSetActive(index)}
                    availability={details.available}
                    price={details.price}
                    message={details.message}
                    isSelected={key === selectedStatusKey}
                    onSelect={() => handleSelectStatus(key)}
                    details={details}
                />
                ))}
            </div>
        </>
    );
};

export default ToggleList;
