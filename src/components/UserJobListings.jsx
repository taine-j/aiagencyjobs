import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from './Spinner';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const UserJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user_jobs`, { withCredentials: true });
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user jobs:', err);
        setError('Failed to fetch your job listings');
        setLoading(false);
      }
    };

    fetchUserJobs();
  }, []);

  if (loading) return <Spinner loading={loading} />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center pb-5">Your Job Listings</h2>
      {jobs.length === 0 ? (
        <p>You haven't created any job listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-2">{job.company.name}</p>
              <p className="text-gray-500 mb-4">{job.location}</p>
              <Link
                to={`/jobs/${job._id}`}
                state={{ from: 'profile' }}
                className="text-blue-500 hover:text-blue-700"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserJobListings;