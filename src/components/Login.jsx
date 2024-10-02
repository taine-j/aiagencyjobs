import React from 'react'

const Login = () => {

  const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleLogin = () => {
      console.log('Initiating Google login...');
      console.log('API_BASE_URL:', API_BASE_URL);
      window.location.href = `${API_BASE_URL}/auth/google`;
    };
  
    return (
      <button onClick={handleLogin}>
        Login with Google
      </button>
    );
  };

export default Login