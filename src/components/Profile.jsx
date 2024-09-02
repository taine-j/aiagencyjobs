import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/current_user')
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName || 'User'}</h1>
      {user.photos && user.photos.length > 0 ? (
        <img src={user.photos[0].value} alt="Profile" />
      ) : (
        <p>No profile picture available</p>
      )}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default Profile;