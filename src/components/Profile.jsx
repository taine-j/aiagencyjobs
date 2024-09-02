import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [useCompanyName, setUseCompanyName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserData = () => {
    axios.get('/api/current_user')
      .then(response => {
        const userData = response.data;
        setUser(userData);
        setCompanyName(userData.companyName || '');
        setLocation(userData.location || '');
        setCompanyDescription(userData.companyDescription || '');
        setTechStack(userData.techStack || '');
        setProfilePicture(userData.profilePicture || '');
        setUseCompanyName(userData.useCompanyName || false);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProfile = {
      companyName,
      location,
      companyDescription,
      techStack,
      profilePicture,
      useCompanyName
    };

    axios.post('/api/update_profile', updatedProfile)
      .then(response => {
        console.log('Profile updated successfully:', response.data);
        setUser(response.data);
        setIsEditing(false);
        toast.success('Profile Updated Successfully!');
      })
      .catch(err => {
        console.error('Error updating profile:', err);
        setError('Failed to update profile');
      });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in.</div>;
  }

  return (
    <section className='bg-indigo-50'>
      <div className='container m-auto max-w-2xl py-24'>
        <div className='bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0'>
          <h2 className='text-3xl text-center font-semibold mb-6'>Profile</h2>
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              {/* Profile Picture */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="profilePicture">
                  Profile Picture
                </label>
                <input
                  className="border rounded w-full py-2 px-3"
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="companyName">
                  Company Name
                </label>
                <input
                  className="border rounded w-full py-2 px-3"
                  id="companyName"
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  className="border rounded w-full py-2 px-3"
                  id="location"
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Company Description */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="companyDescription">
                  Company Description
                </label>
                <textarea
                  className="border rounded w-full py-2 px-3"
                  id="companyDescription"
                  placeholder="Company Description"
                  rows="4"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="techStack">
                  Tech Stack
                </label>
                <input
                  className="border rounded w-full py-2 px-3"
                  id="techStack"
                  type="text"
                  placeholder="Tech Stack"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
              </div>

              {/* Use Company Name Checkbox */}
              <div className="mb-4 flex items-center">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="useCompanyName"
                  checked={useCompanyName}
                  onChange={() => setUseCompanyName(!useCompanyName)}
                />
                <label className="text-gray-700 font-bold" htmlFor="useCompanyName">
                  Use Company Name as Display Name
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6 text-center">
                {profilePicture ? (
                  <img className="rounded-full w-32 h-32 mb-4 mx-auto" src={profilePicture} alt="Profile" />
                ) : user.photos && user.photos.length > 0 ? (
                  <img className="rounded-full w-32 h-32 mb-4 mx-auto" src={user.photos[0].value} alt="Profile" />
                ) : (
                  <p className="text-gray-500 mb-4">No profile picture available</p>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{useCompanyName ? companyName : user.displayName}</h3>
              </div>
              <div className="mb-4">
                <p><strong>Company:</strong> {companyName}</p>
              </div>
              <div className="mb-4">
                <p><strong>Location:</strong> {location}</p>
              </div>
              <div className="mb-4">
                <p><strong>Company Description:</strong></p>
                <p>{companyDescription}</p>
              </div>
              <div className="mb-4">
                <p><strong>Tech Stack:</strong> {techStack}</p>
              </div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;