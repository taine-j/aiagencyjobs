import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';

const MainLayout = ({ isAuthenticated }) => {
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <Outlet />
      <ToastContainer />
    </>
  );
};

export default MainLayout;
