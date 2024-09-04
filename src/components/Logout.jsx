import React from 'react'

const Logout = () => {
    const handleLogout = () => {
      if (window.confirm('Are you sure you want to log out?')) {
        window.location.href = '/api/logout';
      }
    };
  
    return (
      <button onClick={handleLogout}>
        Logout
      </button>
    );
  };

export default Logout