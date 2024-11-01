import React, { useState, useRef, useEffect } from 'react';
import './../../styles/bookpages.css';

const ToggleItem = ({ title, content, isActive, setActive, availability, price, message, isSelected, onSelect, details }) => {
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, []);

    const currentHeight = isActive ? contentHeight : 0;

    return (
        <div className="toggle-item">
            <div className='toggle-container'>
                <div className="toggle-header" onClick={setActive} style={{ width: '100%' }}>
                    {title}
                    <span className={`toggle-icon ${isActive ? 'active' : ''}`}>▼</span>
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
                className="toggle-content"
                style={{ maxHeight: `${currentHeight}px` }}
            >
                <p>{content}</p>
                
                {/* Display images if they exist */}
                {details.imageUrls?.length > 0 && (
                    <div className="image-gallery">
                        {details.imageUrls.map((url, index) => (
                            <img src={url} alt={`Image ${index + 1}`} key={index} className="toggle-img" />
                        ))}
                    </div>
                )}

                {/* Display additional details if they exist */}
                <div className="additional-details">
                    {details.distanceToTown && <p><strong>Distance to town:</strong> {details.distanceToTown}</p>}
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
        <>
            <div className='select-stay'>Select One Option</div>
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
