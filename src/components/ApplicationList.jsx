import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ApplicationList = ({ applications = [], type, onStatusUpdate, onApplicationAction }) => {

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const response = await axios.post(`/api/applications/${applicationId}/status`, 
        { status: newStatus },
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        toast.success(`Application ${newStatus.toLowerCase()} successfully`);
        if (onStatusUpdate) {
          onStatusUpdate(applicationId, newStatus);
        }
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    console.log(`Attempting to ${action} application ${applicationId}`); // Debug log
    try {
      let endpoint;
      if (action === 'withdraw') {
        endpoint = 'withdraw';
      } else if (action === 'delete') {
        endpoint = 'delete';
      } else {
        throw new Error(`Invalid action: ${action}`);
      }

      console.log(`Sending request to: /api/applications/${applicationId}/${endpoint}`); // Debug log
      const response = await axios.post(`/api/applications/${applicationId}/${endpoint}`, 
        {},
        { withCredentials: true }
      );
      
      console.log('Response:', response); // Debug log

      if (response.status === 200) {
        toast.success(`Application ${action === 'withdraw' ? 'withdrawn' : 'deleted'} successfully`);
        if (onApplicationAction) {
          onApplicationAction(applicationId, action);
        }
      }
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      toast.error(`Failed to ${action} application: ${error.response?.data?.error || error.message}`);
    }
  };
  
  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application._id} className="bg-white p-6 rounded-lg shadow-md">
          <Link to={`/application/${application._id}`} className="block mb-2">
            <h3 className="text-xl font-semibold text-indigo-600 hover:text-indigo-800 transition duration-300 ease-in-out">
              {application.job?.title || 'Untitled Job'}
            </h3>
          </Link>
          <p className="text-gray-600 mb-2">Status: <span className="font-semibold">{application.status}</span></p>
          <p className="text-gray-500 mb-2">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
          {type === 'received' && (
            <p className="text-gray-600 mb-2">Applicant: <span className="font-semibold">{application.applicant?.displayName || 'Unknown'}</span></p>
          )}
          <div className="flex space-x-2 mt-4">
            {application.job && (
              <Link
                to={`/jobs/${application.job._id}`}
                state={{ from: 'inbox' }}
                className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              >
                View Job Details
              </Link>
            )}

            {type === 'received' && application.status === 'Pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'Accepted')}
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate(application._id, 'Rejected')}
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                >
                  Reject
                </button>
              </>
            )}

            {type === 'sent' && (
              <button
                onClick={() => handleApplicationAction(application._id, 'withdraw')}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              >
                Withdraw Application
              </button>
            )}

            {type === 'received' && application.status === 'Rejected' && (
              <button
                onClick={() => handleApplicationAction(application._id, 'delete')}
                className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              >
                Delete Application
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ApplicationList;