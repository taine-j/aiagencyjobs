import React from 'react'

const Logout = () => {
    const handleLogout = () => {
      window.location.href = '/api/logout';
    };
  
    return (
      <button onClick={handleLogout}>
        Logout
      </button>
    );
  };

export default Logout