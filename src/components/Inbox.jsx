import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from './Spinner';
import ApplicationList from './ApplicationList';
import { fetchPendingApplicationsCount } from './Navbar';


const Inbox = () => {
  const [applications, setApplications] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-applications`, { withCredentials: true });
      console.log('Server response:', response.data);

      if (response.data && typeof response.data === 'object') {
        setApplications({
          sent: Array.isArray(response.data.sent) ? response.data.sent : [],
          received: Array.isArray(response.data.received) ? response.data.received : []
        });
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch your applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (applicationId, newStatus) => {
    setApplications(prevState => ({
      ...prevState,
      received: prevState.received.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      )
    }));
    fetchPendingApplicationsCount()
  };

  const handleApplicationAction = (applicationId, action) => {
    setApplications(prevState => ({
      ...prevState,
      sent: prevState.sent.filter(app => app._id !== applicationId),
      received: prevState.received.filter(app => app._id !== applicationId)
    }));
  };

  if (loading) return <Spinner loading={loading} />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <section className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-blue-600 pb-16">Your Job Applications</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">Applications Sent</h3>
                {applications.sent && applications.sent.length > 0 ? (
                  <ApplicationList 
                    applications={applications.sent} 
                    type="sent" 
                    onApplicationAction={handleApplicationAction}
                  />
                ) : (
                  <p className="text-gray-600">You haven't submitted any job applications yet.</p>
                )}
              </div>
              
              <div className="md:border-l md:border-gray-200 md:pl-8">
                <h3 className="text-2xl font-semibold mb-4 text-blue-600">Applications Received</h3>
                {applications.received && applications.received.length > 0 ? (
                  <ApplicationList 
                    applications={applications.received} 
                    type="received" 
                    onStatusUpdate={handleStatusUpdate}
                    onApplicationAction={handleApplicationAction}
                  />
                ) : (
                  <p className="text-gray-600">You haven't received any job applications yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Inbox;