import React from 'react'

const Logout = () => {
    const handleLogout = () => {
      window.location.href = 'http://localhost:5000/logout';
    };
  
    return (
      <button onClick={handleLogout}>
        Logout
      </button>
    );
  };

export default Logout