import { Link } from 'react-router-dom';

const ApplicationList = ({ applications = [], type }) => (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application._id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">{application.job?.title || 'Untitled Job'}</h3>
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
            {type === 'received' && (
              <Link
                to={`/application/${application._id}`}
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
              >
                View Application
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  export default ApplicationList;