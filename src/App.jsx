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
import LogoutPage from './pages/LogoutPage';
import ProfilePage from './pages/ProfilePage';
import JobApplicationPage from './pages/JobApplicationPage';
import InboxPage from './pages/InboxPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';
import axios from 'axios';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/current_user', {
          credentials: 'include', // Ensure cookies are sent with the request
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
  
    checkAuth();
  }, []);

  // Add New Job
  const addJob = async (newJob) => {
    try {
      const res = await fetch('/api/jobs', {
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
      // You might want to update your local state or trigger a re-fetch of jobs here
      return savedJob;
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  // Delete Job
  const deleteJob = async (id) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }
      // If successful, you might want to update your local state or trigger a re-fetch
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error; // Re-throw the error so it can be handled by the component
    }
  };

  // Update Job
  const updateJob = async (job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
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
      <Route path='/' element={<MainLayout isAuthenticated={isAuthenticated}/>}>
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
          element={<JobPage deleteJob={deleteJob} />}
          loader={jobLoader}
        />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/terms-of-service' element={<TermsOfServicePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/logout' element={<LogoutPage />} />
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
