import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../../styles/routecustomization.css';

function RouteCustomizationModal({ show, onClose, onConfirm, initialSegments }) {
  const [segments, setSegments] = useState([]);
  const [originalStartDate, setOriginalStartDate] = useState(null);
  const [originalEndDate, setOriginalEndDate] = useState(null);

  useEffect(() => {
    if (initialSegments && Object.keys(initialSegments).length > 0) {
      // Find the earliest start date and latest end date
      const startDates = Object.values(initialSegments).map(dates => dates.start);
      const endDates = Object.values(initialSegments).map(dates => dates.end);
      const earliestDate = startDates.reduce((a, b) => a < b ? a : b);
      const latestDate = endDates.reduce((a, b) => a > b ? a : b);
      
      setOriginalStartDate(earliestDate);
      setOriginalEndDate(latestDate);

      const formattedSegments = Object.entries(initialSegments).map(([city, dates]) => ({
        id: city,
        name: city,
        dates: dates
      }));
      setSegments(formattedSegments);
    }
  }, [initialSegments]);

  const calculateNights = (dates) => {
    const start = new Date(dates.start + 'T00:00:00Z');
    const end = new Date(dates.end + 'T00:00:00Z');
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getTripDateRange = () => {
    if (!originalStartDate || !originalEndDate) return '';
    return `${formatDate(originalStartDate)} - ${formatDate(originalEndDate)}`;
  };

  const getNightLabel = (segment, index) => {
    let startNight = 1;
    for (let i = 0; i < index; i++) {
      startNight += calculateNights(segments[i].dates);
    }
    
    const nights = calculateNights(segment.dates);
    
    if (nights === 1) {
      return `Night ${startNight}`;
    } else {
      return `Nights ${startNight} and ${startNight + 1}`;
    }
  };

  const formatCityName = (name) => {
    const words = name.replace(/([A-Z])/g, ' $1').trim().split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(segments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSegments(items);
  };

  const handleConfirm = () => {
    const reorderedSegments = {};
    // Start with the original trip start date
    let currentDate = new Date(originalStartDate + 'T00:00:00Z');

    segments.forEach((segment) => {
      const nights = calculateNights(segment.dates);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + nights);

      reorderedSegments[segment.id] = {
        start: currentDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };

      // Set up start date for next segment
      currentDate = new Date(endDate);
    });

    onConfirm(reorderedSegments);
  };

  if (!show) return null;

  return (
    <div className="route-modal-overlay">
      <div className="route-modal">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Caravan Trip Plan Suggested Route:</h2>
        
        <div className="route-content">
          <div className="map-container">
            <img 
              src="https://caravan-bucket.s3.us-east-2.amazonaws.com/images/michigan-map.png" 
              alt="Michigan route map" 
              className="route-map"
            />
          </div>

          <div className="route-details">
            <div className="date-range">
              {getTripDateRange()}
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="destinations">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="destinations-list"
                  >
                    {segments.map((segment, index) => (
                      <Draggable key={segment.id} draggableId={segment.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="destination-item"
                          >
                            <span className="night-label">
                              {getNightLabel(segment, index)}:
                            </span>
                            <span className="city-name">
                              {formatCityName(segment.name)}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <p className="route-note">If preferred, feel free to reorganize the suggestion to best suit your needs</p>
        
        <button 
          className="check-availability-button" 
          onClick={handleConfirm}
        >
          Check Availability
        </button>
      </div>
    </div>
  );
}

export default RouteCustomizationModal;
