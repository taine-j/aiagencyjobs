import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from './Spinner';

const Inbox = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/job-applications', { withCredentials: true });
        setApplications(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.response?.data?.error || 'Failed to fetch your applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <Spinner loading={loading} />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Your Job Applications</h2>
      {applications.length === 0 ? (
        <p>You haven't submitted any job applications yet.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application._id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{application.job?.title || 'Untitled Job'}</h3>
              <p className="text-gray-600 mb-2">Status: {application.status}</p>
              <p className="text-gray-500 mb-4">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
              {application.job && (
                <Link
                  to={`/jobs/${application.job._id}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View Job Details
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;