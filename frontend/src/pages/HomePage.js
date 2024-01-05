import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [price, setPrice] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const handleBookClick = () => {
    // Logic to handle the 'Book' button click and open the modal
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    // Logic to handle closing the modal
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGetPrice = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/price');
      setPrice(response.data);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle form submission, e.g., send data to the server
    console.log('Form submitted with data:', formData);
    // Close the modal after form submission
    setModalOpen(false);
  };

  return (
    <div className='App'>
      <div className='trip-card'>
        <h2>Trip 1</h2>
        <ul>
          <li>Pictured Rock Kayaking Tour</li>
        </ul>
        <div>
          {price !== null ? (
            <p>Price: ${price}</p>
          ) : (
            <button onClick={handleGetPrice}>Get Price</button>
          )}
        </div>
        <button onClick={handleBookClick}>Book</button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <span className='close' onClick={handleCloseModal}>
              &times;
            </span>
            <h2>Booking Information</h2>
            <form className='form-container' onSubmit={handleFormSubmit}>
              <label>
                <span>Name:</span>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
              <span>Email:</span>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
              <span>Phone Number:</span>
                <input
                  type='tel'
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <button type='submit'>Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage