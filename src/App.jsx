import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import NotFoundPage from './pages/NotFoundPage';
import JobPage, { jobLoader } from './pages/JobPage';
import AddJobPage from './pages/AddJobPage';
import EditJobPage from './pages/EditJobPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import JobApplicationPage from './pages/JobApplicationPage';
import InboxPage from './pages/InboxPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
const API_BASE_URL = import.meta.env.VITE_API_URL;



const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/current_user`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const userData = await res.json();
          console.log('User authenticated:', userData.id);
          setIsAuthenticated(true);
      
        } else {
          console.log('Authentication failed:', res.status, res.statusText);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Add New Job
  const addJob = async (newJob) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJob),
        credentials: 'include', // This ensures cookies are sent with the request
      });
      if (!res.ok) {
        throw new Error('Failed to add job');
      }
      const savedJob = await res.json();
 
      return savedJob;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  // Delete Job
  const deleteJob = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

    } catch (error) {
      console.error('Error deleting job:', error);
      throw error; // Re-throw the error so it can be handled by the component
    }
  };

  // Update Job
  const updateJob = async (job) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${job.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job),
    });
    return;
  };


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<MainLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>}>
        <Route index element={<HomePage />} />
        <Route path='/jobs' element={<JobsPage />} />
        <Route path='/add-job' element={<AddJobPage addJobSubmit={addJob} />} />
        <Route
          path='/edit-job/:id'
          element={<EditJobPage updateJobSubmit={updateJob} />}
          loader={jobLoader}
        />
        <Route
          path='/jobs/:id'
          element={<JobPage deleteJob={deleteJob} isAuthenticated={isAuthenticated}/>}
          loader={jobLoader}
        />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/terms-of-service' element={<TermsOfServicePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/profile' element={<ProfilePage />} /> 
        <Route path='/inbox' element={<InboxPage />} />
        <Route path='*' element={<NotFoundPage />} />
        <Route
          path='/apply/:id'
          element={<JobApplicationPage />}
        />
        <Route
          path='/application/:id'
          element={<ApplicationDetailsPage />}
        />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
