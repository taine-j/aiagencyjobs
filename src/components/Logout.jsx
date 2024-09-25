import React, { useState } from 'react';

const Logout = ({ onLogout, buttonClassName }) => {
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    setShowModal(true);
  };

  const confirmLogout = () => {
    onLogout();
    setShowModal(false);
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <button onClick={handleLogout} className={buttonClassName}>
        Logout
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-filter backdrop-blur-sm"></div>
          <div className="bg-white p-5 rounded-lg shadow-xl relative z-10">
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Logout</h2>
            <p className="mb-4 text-center">Are you sure you want to log out?</p>
            <div className="flex justify-center">
              <button
                onClick={cancelLogout}
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;