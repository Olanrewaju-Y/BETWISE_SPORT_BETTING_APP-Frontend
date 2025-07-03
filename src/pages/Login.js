import React, { useEffect } from 'react';
import { FaWallet } from 'react-icons/fa'; // Import wallet icon
import Navbar from '../components/Navbar'; // Import Navbar
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate, Link, useLocation } from 'react-router-dom'; // To redirect after login and for navigation links

// Define API endpoint as a constant
const API_LOGIN_ENDPOINT = process.env.REACT_APP_API_LOGIN_ENDPOINT;





const Login = () => {
  const [email, setEmail] = React.useState(''); 
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get location state
  const { login, logout, isAuthenticated, currentUser, isLoadingAuth } = useAuth(); // Use AuthContext

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      // If already authenticated and not loading auth state, redirect from login page
      navigate(from, { replace: true }); // Redirect to original page or home
    }
  }, [isAuthenticated, isLoadingAuth, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(API_LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Assuming the API returns a token or user data upon successful login
      // You might want to store the token (e.g., in localStorage) and update global auth state
      // Call the login function from AuthContext with the correct user data and tokens
      login(data.user, data.accessToken, data.refreshToken, from);

    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Network error: Could not connect to the server. Please check your internet connection or try again later.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    logout(); // Call logout from AuthContext
    alert('Logged out successfully!');
    // Navigation to /login is handled by AuthContext's logout or by Navbar's conditional rendering
  };

  // Use isAuthenticated from AuthContext
  if (isAuthenticated) {
    return (
      <>
        <Navbar />
      
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 shadow-xl rounded px-8 pt-6 pb-8 mb-4 text-center w-full max-w-md">
            <h2 className="text-2xl font-display mb-6 text-lime-400">
              Welcome, {currentUser?.nickName || 'User'}!
            </h2>
            <p className="text-gray-300 mb-4">You are logged in.</p>
            {currentUser?.walletBalance !== undefined && (
              <div className="flex items-center justify-center text-lime-300 mb-4 text-lg">
                <FaWallet className="mr-2" /> Wallet: ₦{currentUser.walletBalance.toLocaleString()}
              </div>
            )}
            <button
              onClick={handleLogoutClick}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* No Navbar here, as it's a full-page login form. If you want a Navbar, uncomment below */}
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleLogin} className="bg-gray-800 shadow-xl shadow-lime-900/50 rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <h2 className="text-2xl font-display text-center mb-6 text-lime-400">Login</h2>
          {error && <p className="text-red-400 text-xs italic text-center mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="appearance-none bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-lime-400 w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <div className="text-center mt-6">
            <Link to="/register" className="inline-block align-baseline font-bold text-sm text-lime-400 hover:text-lime-300">
              Don't have an account? Register
            </Link>
          </div>
          <div className="text-center mt-2">
            <Link to="/forgot-password" className="inline-block align-baseline font-bold text-sm text-lime-400 hover:text-lime-300">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
