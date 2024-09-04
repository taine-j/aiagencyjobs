import { NavLink } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const Navbar = ( { isAuthenticated } ) => {
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
    <nav className='bg-blue-700 border-b border-blue-500'>
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
                <NavLink to='/logout' onClick={handleLogout} className={linkClass}>
                  Logout
                </NavLink>
                )}
                {isAuthenticated && (
                <NavLink to='/profile' className={linkClass}>
                  Profile 
                </NavLink>
                )}
                {isAuthenticated && (
                <NavLink to='/inbox' className={linkClass}>
                  Inbox
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
