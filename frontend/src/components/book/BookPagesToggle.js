import React, { useState, useRef, useEffect } from 'react';
import './../../styles/bookpages.css';

const ToggleItem = ({ title, content, isActive, setActive, availability, isSelected, onSelect, detailsSubmitted }) => {
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, []);

    const currentHeight = isActive ? contentHeight : 0;
    const toggleHeaderWidth = {
        width: detailsSubmitted ? '75%' : '100%',
    };

    return (
        <div className="toggle-item">
            <div className='toggle-container'>
                <div className="toggle-header" onClick={setActive} style={toggleHeaderWidth}>
                    {title}
                    <span className={`toggle-icon ${isActive ? 'active' : ''}`}>▼</span>
                </div>
                {detailsSubmitted && (
                    <div 
                        className={`availability-status ${availability ? 'available' : 'not-available'} ${isSelected ? 'availability-selected' : ''}`} 
                        onClick={() => availability && onSelect(title)}
                    >
                        {availability ? 'Available: $217 per night' : 'Not Available for Selected Dates'}
                    </div>
                )}
            </div>
            <div
                ref={contentRef}
                className="toggle-content"
                style={{ maxHeight: `${currentHeight}px` }}
            >
                <p>{content}</p>
            </div>
        </div>
    );
};

const ToggleList = ({ data, onSelectionChange, detailsSubmitted }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedStatusIndex, setSelectedStatusIndex] = useState(null);

    const handleSetActive = index => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
    };

    const handleSelectStatus = index => {
        setSelectedStatusIndex(prevIndex => prevIndex === index ? null : index);
        onSelectionChange(index);
    };

    return (
        <div className="toggle-list">
            {data.map((item, index) => (
                <ToggleItem 
                    key={index} 
                    title={item.title} 
                    content={item.content} 
                    isActive={index === activeIndex}
                    setActive={() => handleSetActive(index)} 
                    availability={item.available}
                    isSelected={index === selectedStatusIndex}
                    onSelect={() => handleSelectStatus(index)}
                    detailsSubmitted={detailsSubmitted}
                />
            ))}
        </div>
    );
};

export default ToggleList;