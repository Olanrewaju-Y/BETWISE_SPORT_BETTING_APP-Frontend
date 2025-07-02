import React from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary, e.g., if UserProfile.js is in src/components
import './UserProfile.css';

const UserProfile = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentUser) { // Added Navbar to loading/unauthenticated state
    return (
      <>
        <Navbar /> {/* Added Navbar */}
        <div className="user-profile-page min-h-screen flex items-center justify-center bg-black text-white">
          <p>Loading user profile or please log in to view your profile.</p>
        </div>
      </>
    );
  }

  // Assuming currentUser has fields like nickName, email.
  // Add more fields as available in your currentUser object from AuthContext.
  return (
    <div className="user-profile-page">
      <Navbar /> {/* Added Navbar */}
      <div className="user-profile-page min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-gray-800 shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold text-lime-400 mb-6 text-center">User Profile</h1>
          <div className="profile-details space-y-4">
            <div className="profile-detail-item flex justify-between items-center">
              <span className="detail-label text-gray-300 font-medium">Nickname:</span>
              <span className="detail-value text-lime-300 font-semibold">{currentUser.nickName || 'N/A'}</span>
            </div>
            <div className="profile-detail-item flex justify-between items-center">
              <span className="detail-label text-gray-300 font-medium">Email:</span>
              <span className="detail-value text-lime-300 font-semibold">{currentUser.email || 'N/A'}</span>
            </div>
            <div className="profile-detail-item flex justify-between items-center">
              <span className="detail-label text-gray-300 font-medium">Country:</span>
              <span className="detail-value text-lime-300 font-semibold">{currentUser.country || 'N/A'}</span>
            </div>
            <div className="profile-detail-item flex justify-between items-center">
              <span className="detail-label text-gray-300 font-medium">Gender:</span>
              <span className="detail-value text-lime-300 font-semibold capitalize">{currentUser.gender || 'N/A'}</span>
            </div>
            <div className="profile-detail-item flex justify-between items-center">
              <span className="detail-label text-gray-300 font-medium">Joined:</span>
              <span className="detail-value text-lime-300 font-semibold">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            {currentUser.interests && currentUser.interests.length > 0 && (
                <div className="profile-detail-item flex justify-between items-center">
                    <span className="detail-label text-gray-300 font-medium">Interests:</span>
                    <span className="detail-value text-lime-300 font-semibold">{currentUser.interests.join(', ')}</span>
                </div>
            )}
        </div>
        {/* You can add options to edit profile, view betting history, etc. here */}
      </div>
    </div>
    </div>
  );
};

export default UserProfile;
 
