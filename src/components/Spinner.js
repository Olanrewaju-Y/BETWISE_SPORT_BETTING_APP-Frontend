import React from 'react';
import './Spinner.css'; // We'll create this CSS file next

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container"></div>
    </div>
  );
};

export default Spinner;

// You can make this more sophisticated later, e.g. using an SVG or a library like react-spinners.
// For now, this provides a basic visual loading indicator.