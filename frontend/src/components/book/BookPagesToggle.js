import React, { useState, useRef, useEffect } from 'react';
import './../../styles/bookpages.css';

const ToggleItem = ({ title, content, isActive, setActive, availability, price, message, isSelected, onSelect, detailsSubmitted }) => {
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
                        className={`availability-status ${availability ? 'available' : 'not-available'} ${isSelected ? 'selected' : ''}`} 
                        onClick={() => availability && onSelect()}
                    >
                        {message}
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
    const [selectedStatusKey, setSelectedStatusKey] = useState(null);

    const handleSetActive = index => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
    };

    const handleSelectStatus = key => {
        setSelectedStatusKey(prevKey => prevKey === key ? null : key);
        onSelectionChange(key);
    };

    return (
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
                    detailsSubmitted={detailsSubmitted}
                />
            ))}
        </div>
    );
};

export default ToggleList;