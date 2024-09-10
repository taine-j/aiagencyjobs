import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { FaArrowLeft, FaCalendar, FaUser, FaFileAlt, FaLink, FaEnvelope, FaPhone } from 'react-icons/fa';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const response = await axios.get(`/api/applications/${id}`);
        setApplication(response.data);
      } catch (error) {
        console.error('Error fetching application details:', error);
        setError('Failed to fetch application details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

  const handleViewCV = async () => {
    if (application.cvPath) {
      try {
        const response = await axios.get(`/api/applications/${id}/cv-url`, {
          withCredentials: true
        });
        const { url } = response.data;
        console.log('Received CV URL:', url);
        if (url) {
          window.open(url, '_blank');
        } else {
          setError('Failed to fetch CV URL. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching CV URL:', error);
        setError('Failed to fetch CV URL. Please try again.');
      }
    } else {
      console.error('No CV path available');
      setError('No CV available for this application.');
    }
  };

  useEffect(() => {
    console.log('Application state updated:', application);
  }, [application]);

  if (loading) return <Spinner loading={loading} />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!application) return <div className="text-center">Application not found</div>;

  return (
    <>
      <Link to="/inbox" className="flex items-center text-blue-500 hover:underline mb-4">
        <FaArrowLeft className="mr-2" /> Back to Inbox
      </Link>
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{application.jobTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <main>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold mb-6 text-indigo-600">Application Details</h2>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Job: {application.job?.title}</h3>
                <p className="text-gray-600 flex items-center">
                  <FaUser className="mr-2" /> Applicant: {application.applicant?.displayName}
                </p>
                <p className="text-gray-600 flex items-center mt-2">
                  <FaCalendar className="mr-2" /> Applied on: {new Date(application.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-600 flex items-center mt-2">
                  <FaEnvelope className="mr-2" /> Email: {application.email}
                </p>
                {application.phone && (
                  <p className="text-gray-600 flex items-center mt-2">
                    <FaPhone className="mr-2" /> Phone: {application.phone}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Message</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">{application.message}</p>
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Skills</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">{application.skills}</p>
              </div>
              {application.cvPath && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 flex items-center">
                    <FaFileAlt className="mr-2" /> CV
                  </h4>
                  <button
                    onClick={handleViewCV}
                    className="text-indigo-500 hover:text-indigo-600 flex items-center"
                  >
                    <FaLink className="mr-2" /> View CV
                  </button>
                </div>
              )}
            </div>
          </main>

          <aside>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6">Additional Information</h3>
              <div className="space-y-4">
                <p className="text-gray-600 font-semibold">Status: <span className="text-indigo-600">{application.status}</span></p>
                
                {application.projectLinks && (
                  <div>
                    <h4 className="text-lg font-semibold mb-2 flex items-center">
                      <FaLink className="mr-2" /> Project Links
                    </h4>
                    <p className="text-blue-500 break-words">{application.projectLinks}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default ApplicationDetailsPage;