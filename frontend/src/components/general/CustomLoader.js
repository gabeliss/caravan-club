import React from 'react';
import './../../styles/customloader.css';

const CustomLoader = () => {
  return (
    <div className="custom-loader">
      <div className="spinner">
        <div className="dot1"></div>
        <div className="dot2"></div>
      </div>
      <p>Loading your adventure...</p>
    </div>
  );
};

export default CustomLoader;