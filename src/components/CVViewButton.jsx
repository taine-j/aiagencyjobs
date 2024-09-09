import React from 'react';

function CVViewButton({ signedUrl }) {
  const handleViewCV = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      console.error('No signed URL available');
    }
  };

  return (
    <button onClick={handleViewCV}>
      View CV
    </button>
  );
}

export default CVViewButton;