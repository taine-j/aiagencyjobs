import React from 'react'

const Login = () => {

  const API_BASE_URL = import.meta.env.VITE_API_URL;

    const handleLogin = () => {
      window.location.href = `${API_BASE_URL}/auth/google`;
    };
  
    return (
      <button onClick={handleLogin}>
        Login with Google
      </button>
    );
  };

export default Login