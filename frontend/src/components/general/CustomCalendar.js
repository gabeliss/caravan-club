import React, { useState, useEffect } from 'react';
import './../../styles/components/home/customcalendar.css';

// Utility functions
const daysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const startDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const createDate = (year, month, day) => {
  return new Date(year, month, day);
};

const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const isSameDay = (date1, date2) => {
  return date1 && date2 &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const CustomCalendar = ({ startDate, endDate, onDateSelect, nights }) => {
  const today = new Date();
  const parsedStartDate = startDate ? new Date(startDate.replace(/-/g, '/')) : today;
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(parsedStartDate.getFullYear(), parsedStartDate.getMonth(), 1);
  });
  const [selectedStartDate, setSelectedStartDate] = useState(startDate ? new Date(startDate) : null);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate ? new Date(endDate) : null);
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    if (selectedStartDate && nights) {
      const end = new Date(selectedStartDate);
      end.setDate(end.getDate() + parseInt(nights));
      setSelectedEndDate(end);
    }
  }, [selectedStartDate, nights]);

  const handleDateClick = (day) => {
    const clickedDate = createDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateInPast(clickedDate)) {
      setSelectedStartDate(clickedDate);
      onDateSelect(clickedDate.toISOString().split('T')[0]);
    }
  };

  const handleDateHover = (day) => {
    const hoverDate = createDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateInPast(hoverDate)) {
      setHoverDate(hoverDate);
    }
  };

  const isDateInRange = (day) => {
    const date = createDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date < selectedEndDate;
    }
    if (selectedStartDate && hoverDate && nights) {
      const tempEndDate = new Date(selectedStartDate);
      tempEndDate.setDate(tempEndDate.getDate() + parseInt(nights));
      return date >= selectedStartDate && date < tempEndDate;
    }
    return false;
  };

  const renderCalendar = () => {
    const days = daysInMonth(currentMonth);
    const startingDay = startDay(currentMonth);
    const blanks = Array(startingDay).fill(null);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);

    return [...blanks, ...daysArray].map((day, index) => {
      if (!day) return <div key={index} className="calendar-day empty-day"></div>;
      
      const date = createDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPastDate = isDateInPast(date);
      const isSelected = isSameDay(new Date(date.getTime() - 86400000), selectedStartDate);
      const isEndDate = isSameDay(new Date(date.getTime() - 86400000), selectedEndDate);

      return (
        <div
          key={index}
          className={`calendar-day ${isPastDate ? 'past-date' : 'valid-day'} ${
            isDateInRange(day) ? 'in-range' : ''
          } ${isSelected ? 'start-date' : ''} ${
            isEndDate ? 'end-date' : ''
          }`}
          onClick={() => !isPastDate && handleDateClick(day)}
          onMouseEnter={() => !isPastDate && handleDateHover(day)}
          onMouseLeave={() => setHoverDate(null)}
        >
          {day}
        </div>
      );
    });
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + offset);
      return newMonth;
    });
  };

  return (
    <div className="custom-calendar">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>
      <div className="calendar-days">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="calendar-grid">{renderCalendar()}</div>
    </div>
  );
};

export default CustomCalendar;