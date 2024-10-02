import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const jobLoader = async ({ params }) => {
  const res = await fetch(`${API_BASE_URL}/jobs/${params.id}`, {
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`Failed to fetch job: ${errorData.error || res.statusText}`);
  }
  const data = await res.json();
  return data;
};

const JobPage = ({ deleteJob, isAuthenticated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const fromProfile = location.state?.from === 'profile';
  const fromInbox = location.state?.from === 'inbox';

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchJobAndUserData = async () => {
      try {
        const jobData = await jobLoader({ params: { id } });
        const userRes = await fetch(`${API_BASE_URL}/current_user`, { credentials: 'include' });
        const userData = await userRes.json();
        
        console.log('user data',userData)

        setJob(jobData);
        
        const isOwnerValue = userData && 
          jobData && 
          jobData.postedBy && 
          userData.id === jobData.postedBy._id;
        
        setIsOwner(isOwnerValue);
        
        // Update this line to handle potentially undefined appliedJobs
        const hasAppliedValue = userData.appliedJobs ? userData.appliedJobs.includes(id) : false;
        console.log('has applied value', hasAppliedValue);
        setHasApplied(hasAppliedValue);

        // Add these console logs for debugging
        console.log('Current job ID:', id);
        console.log('User applied jobs:', userData.appliedJobs);
        console.log('Has applied value:', hasAppliedValue);
      } catch (error) {
        console.error('Error fetching job or user data:', error);
        setError(error.message || 'Failed to load job. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobAndUserData();
  }, [id]);

  const onDeleteClick = async () => {
    const confirm = window.confirm(
      'Are you sure you want to delete this listing?'
    );

    if (!confirm) return;

    try {
      await deleteJob(id);
      toast.success('Job deleted successfully');
      navigate('/jobs');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  if (loading) return <Spinner loading={loading} />;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!job) return <div className="text-center">Job not found</div>;
 
  return (
    <>
      <section>
        <div className='container m-auto py-6 px-6'>
          <Link
            to={fromProfile ? '/profile' : fromInbox ? '/inbox' : '/jobs'}
            className='text-blue-500 hover:text-blue-600 flex items-center'
          >
            <FaArrowLeft className='mr-2' /> 
            {fromProfile ? 'Back to Profile' : fromInbox ? 'Back to Inbox' : 'Back to Job Listings'}
          </Link>
        </div>
      </section>

      <section className='bg-blue-50'>
        <div className='container m-auto py-10 px-6'>
          <div className='grid grid-cols-1 md:grid-cols-70/30 w-full gap-6'>
            <main>
              <div className='bg-white p-6 rounded-lg shadow-md text-center md:text-left'>
                <div className='text-gray-500 mb-4'>{job.type}</div>
                <h1 className='text-3xl font-bold mb-4'>{job.title}</h1>
                <div className='text-gray-500 mb-4 flex align-middle justify-center md:justify-start'>
                  <FaMapMarker className='text-orange-700 mr-1' />
                  <p className='text-orange-700'>{job.location}</p>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
                <h3 className='text-blue-900 text-lg font-bold mb-6'>
                  Job Description
                </h3>

                <p className='mb-4'>{job.description}</p>

                <h3 className='text-blue-900 text-lg font-bold mb-2'>
                  Price
                </h3>

                <p className='mb-4'>{job.price}</p>
              </div>
            </main>

            <aside>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h3 className='text-xl font-bold mb-6'>Company Details</h3>
                <h2 className='text-2xl mb-4'>{job.company.name}</h2>
                <p className='mb-4'>{job.company.description}</p>
                <a
                  href={`mailto:${job.company.contactEmail}`}
                  className='text-blue-500 hover:text-blue-600 block mb-4'
                >
                  {job.company.contactEmail}
                </a>
                {job.company.contactPhone && (
                  <p className='mb-4'>{job.company.contactPhone}</p>
                )}
              </div>

                {isOwner && (
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/edit-job/${job._id}`}
                    className="inline-block bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={onDeleteClick}
                    className="inline-block bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                  >
                    Delete Job
                  </button>
                </div>
              )}

              {!isOwner && isAuthenticated && (
                <div className="mt-4">
                  <Link
                    to={`/apply/${job._id}`}
                    className={`inline-block bg-green-500 text-white py-2 px-4 rounded-lg ${
                      hasApplied ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                    }`}
                    onClick={(e) => {
                      if (hasApplied) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {hasApplied ? 'Already Applied' : 'Apply for Job'}
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default JobPage;
