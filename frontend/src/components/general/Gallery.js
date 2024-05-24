import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Masonry from 'react-masonry-css';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/images');
        setImages(response.data);
      } catch (error) {
        setError('Error fetching images');
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 3,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className='landing-gallery'
      columnClassName='landing-gallery-column'
    >
      {images.map((image, index) => (
        <div key={index} className='landing-gallery-item'>
          <img src={`data:image/jpeg;base64,${image}`} alt={`Image ${index}`} />
        </div>
      ))}
    </Masonry>
  );
};

export default Gallery;