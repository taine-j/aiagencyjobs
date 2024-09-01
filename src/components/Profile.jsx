import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/current_user')
      .then(response => {
        setUser(response.data);
      });
  }, []);

  if (!user) {
    return <div>Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName}</h1>
      <img src={user.photos[0].value} alt="Profile" />
    </div>
  );
};

export default Profile;