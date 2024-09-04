import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from './Spinner';
import UserJobListings from './UserJobListings';

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
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
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
        toast.error('Failed to update profile');
      })
      .finally(() => {
        setIsUpdating(false);
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
    <section className='bg-gray-100 min-h-screen py-12 relative'>
      {isUpdating && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <Spinner size="large" />
            <span className="ml-3 text-lg font-semibold">Updating Profile...</span>
          </div>
        </div>
      )}
      <div className='container mx-auto max-w-4xl'>
        <div className='bg-white shadow-lg rounded-lg overflow-hidden'>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex flex-col md:flex-row md:space-x-8">
                <div className="md:w-1/3 bg-indigo-100 p-6 rounded-lg flex flex-col items-center justify-center">
                  {profilePicture ? (
                    <img className="rounded-full w-48 h-48 object-cover shadow-md mb-4" src={profilePicture} alt="Profile" />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-indigo-200 flex items-center justify-center mb-4">
                      <span className="text-4xl text-indigo-500">{(useCompanyName ? companyName : user.displayName).charAt(0)}</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <label
                    htmlFor="profile-picture-input"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full cursor-pointer focus:outline-none focus:shadow-outline transition duration-300 ease-in-out text-sm"
                  >
                    Change Picture
                  </label>
                </div>
                <div className="md:w-2/3 mt-6 md:mt-0">
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                      Company Name
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                      Location
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyDescription">
                      Company Description
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="companyDescription"
                      rows="4"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="techStack">
                      Tech Stack
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="techStack"
                      type="text"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      type="submit"
                    >
                      Save Changes
                    </button>
                    <button
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-indigo-100 p-6 flex flex-col items-center justify-center">
                {profilePicture ? (
                  <img className="rounded-full w-48 h-48 object-cover shadow-md" src={profilePicture} alt="Profile" />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-indigo-200 flex items-center justify-center">
                    <span className="text-4xl text-indigo-500">{(useCompanyName ? companyName : user.displayName).charAt(0)}</span>
                  </div>
                )}
                <h3 className="text-2xl font-semibold mt-4 text-center">{useCompanyName ? companyName : user.displayName}</h3>
                <p className="text-indigo-600 mt-2">{companyName}</p>
              </div>
              <div className="md:w-2/3 p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-indigo-600 mb-2">Location</h4>
                  <p className="text-gray-700">{location || 'Not specified'}</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-indigo-600 mb-2">Company Description</h4>
                  <p className="text-gray-700">{companyDescription || 'No description available'}</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-indigo-600 mb-2">Tech Stack</h4>
                  <p className="text-gray-700">{techStack || 'Not specified'}</p>
                </div>
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8">
          <UserJobListings />
        </div>
    </section>
  );
};

export default Profile;