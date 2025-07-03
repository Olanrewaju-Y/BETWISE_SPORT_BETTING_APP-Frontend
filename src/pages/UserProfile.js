import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Navbar from '../components/Navbar'; // Import Navbar
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary, e.g., if UserProfile.js is in src/components
import { FaUserCircle, FaEdit, FaWallet } from 'react-icons/fa'; // Import icons
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <p>Loading user profile or please log in to view your profile.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto bg-gray-800 shadow-xl shadow-lime-900/50 rounded-2xl overflow-hidden">
          
          {/* Profile Header with background */}
          <div className="bg-gray-900 p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Placeholder for profile image */}
              <FaUserCircle className="w-full h-full text-gray-600" />
              {/* Edit icon overlay */}
              <button className="absolute bottom-0 right-0 bg-lime-500 p-2 rounded-full hover:bg-lime-600 transition-colors" title="Change profile picture">
                <FaEdit className="text-black" />
              </button>
            </div>
            <h1 className="text-3xl font-bold text-lime-400">{currentUser.nickName || 'N/A'}</h1>
            <p className="text-md text-gray-400">{currentUser.email || 'N/A'}</p>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-lime-300 mb-6 border-b-2 border-gray-700 pb-2">Account Details</h2>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Country:</span>
                <span className="text-gray-100 font-semibold">{currentUser.country || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Gender:</span>
                <span className="text-gray-100 font-semibold capitalize">{currentUser.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Joined:</span>
                <span className="text-gray-100 font-semibold">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              {currentUser.interests && currentUser.interests.length > 0 && (
                  <div className="flex justify-between items-start">
                      <span className="text-gray-400 font-medium shrink-0 mr-4">Interests:</span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {currentUser.interests.map(interest => (
                          <span key={interest} className="bg-gray-700 text-lime-300 text-xs font-medium px-2.5 py-1 rounded-full">{interest}</span>
                        ))}
                      </div>
                  </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4">
              <Link to="/wallet" className="flex-1 text-center bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                <FaWallet className="mr-2" /> My Wallet
              </Link>
              <button className="flex-1 text-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                <FaEdit className="mr-2" /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
 
