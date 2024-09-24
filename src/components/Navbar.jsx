import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';

// Define fetchPendingApplicationsCount outside of the component
export const fetchPendingApplicationsCount = async () => {
  try {
    const response = await axios.get('/api/pending-applications-count', { withCredentials: true });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching pending applications count:', error);
    return 0;
  }
};

const Navbar = ({ isAuthenticated }) => {
  const [pendingApplications, setPendingApplications] = useState(0);

  const updatePendingApplicationsCount = useCallback(async () => {
    if (!isAuthenticated) return;
    const count = await fetchPendingApplicationsCount();
    setPendingApplications(count);
  }, [isAuthenticated]);

  useEffect(() => {
    updatePendingApplicationsCount();
  }, [updatePendingApplicationsCount]);

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

      const handleLogin = (e) => {
        e.preventDefault();
        window.location.href = '/api/auth/google';
      };

      const handleLogout = (e) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to log out?')) {
          window.location.href = '/api/logout';
        }
      };

  return (
    <nav className='bg-blue-900 border-b border-blue-800'> {/* Updated colors here */}
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          <div className='flex flex-1 items-center justify-center md:items-stretch md:justify-start'>
            <NavLink className='flex flex-shrink-0 items-center mr-4' to='/'>
              <img className='h-10 w-auto' src={logo} alt='A.I Agency Jobs' />
              <span className='hidden md:block text-white text-2xl font-bold ml-2'>
                A.I Agency Jobs
              </span>
            </NavLink>
            <div className='md:ml-auto'>
              <div className='flex space-x-2'>
                <NavLink to='/' className={linkClass}>
                  Home
                </NavLink>
                <NavLink to='/jobs' className={linkClass}>
                  Jobs
                </NavLink>
                {isAuthenticated && (
                <NavLink to='/add-job' className={linkClass}>
                  Add Job
                </NavLink>
                )}
                {!isAuthenticated && (
                <NavLink to='/login' onClick={handleLogin} className={linkClass}>
                  Sign In / Sign Up
                </NavLink>
                )}
                {isAuthenticated && (
                <NavLink to='/profile' className={linkClass}>
                  Profile 
                </NavLink>
                )}
                {isAuthenticated && (
                <NavLink to='/inbox' className={`${linkClass} relative flex items-center`}>
                  Inbox
                  {pendingApplications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {pendingApplications}
                    </span>
                  )}
                </NavLink>
                )}
                {isAuthenticated && (
                <NavLink to='/logout' onClick={handleLogout} className={linkClass}>
                  Logout
                </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
