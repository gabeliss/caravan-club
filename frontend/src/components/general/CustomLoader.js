import React from 'react';
import './../../styles/customloader.css';

// const CustomLoader = () => {
//   return (
//     <div className="custom-loader">
//       <div className="spinner">
//         <div className="dot1"></div>
//         <div className="dot2"></div>
//       </div>
//       <p>Loading your adventure...</p>
//     </div>
//   );
// };

// export default CustomLoader;

// import React from 'react';
// import './../../styles/customloader.css';

const CustomLoader = () => {
  const videoUrl = "https://caravan-bucket.s3.us-east-2.amazonaws.com/caravan-loading.mp4"

  return (
    <div className="custom-loader">
      <video 
        src={videoUrl} 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="loader-video"
      />
    </div>
  );
};

export default CustomLoader;
