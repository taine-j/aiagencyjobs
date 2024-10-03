import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import Logout from './Logout';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define fetchPendingApplicationsCount outside of the component
export const fetchPendingApplicationsCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/pending-applications-count`, { withCredentials: true });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching pending applications count:', error);
    return 0;
  }
};

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {

  const [pendingApplications, setPendingApplications] = useState(0);

  const updatePendingApplicationsCount = useCallback(async () => {
    if (!isAuthenticated) return;
    const count = await fetchPendingApplicationsCount();
    setPendingApplications(count);
  }, [isAuthenticated]);

  useEffect(() => {
    updatePendingApplicationsCount();
  }, [updatePendingApplicationsCount]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_BASE_URL}/logout`;
  };

  return (
    <nav className='bg-blue-900 border-b border-blue-800'>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-20 items-center justify-between'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <NavLink className='flex items-center' to='/'>
                <img className='hidden sm:block h-10 w-auto' src={logo} alt='A.I Agency Jobs' />
                <span className='text-white text-2xl font-bold ml-2'>
                  A.I Agency Jobs
                </span>
              </NavLink>
            </div>
          </div>
          
          <div className='hidden sm:block'>
            <div className='flex items-center space-x-4'>
              <NavLink to='/' className={linkClass}>Home</NavLink>
              <NavLink to='/jobs' className={linkClass}>Jobs</NavLink>
              {isAuthenticated && <NavLink to='/add-job' className={linkClass}>Add Job</NavLink>}
              {!isAuthenticated && <NavLink to='/login' onClick={handleLogin} className={linkClass}>Sign In / Sign Up</NavLink>}
              {isAuthenticated && <NavLink to='/profile' className={linkClass}>Profile</NavLink>}
              {isAuthenticated && (
                <NavLink to='/inbox' className={linkClass}>
                  Inbox
                  {pendingApplications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {pendingApplications}
                    </span>
                  )}
                </NavLink>
              )}
              {isAuthenticated && <Logout onLogout={handleLogout} buttonClassName={linkClass({isActive: false})} />}
            </div>
          </div>
          
          <div className='sm:hidden'>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <NavLink to='/' className='mobile-link'>Home</NavLink>
          <NavLink to='/jobs' className='mobile-link'>Jobs</NavLink>
          {isAuthenticated && <NavLink to='/add-job' className='mobile-link'>Add Job</NavLink>}
          {!isAuthenticated && <NavLink to='/login' onClick={handleLogin} className='mobile-link'>Sign In / Sign Up</NavLink>}
          {isAuthenticated && <NavLink to='/profile' className='mobile-link'>Profile</NavLink>}
          {isAuthenticated && (
            <NavLink to='/inbox' className='mobile-link relative flex items-center'>
              Inbox
              {pendingApplications > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingApplications}
                </span>
              )}
            </NavLink>
          )}
          {isAuthenticated && <Logout onLogout={handleLogout} buttonClassName='mobile-link' />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;