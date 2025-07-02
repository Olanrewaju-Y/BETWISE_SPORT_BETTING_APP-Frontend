import React from 'react';
import { Link } from 'react-router-dom'; // For a link back to login


const ForgotPassword = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Replace with your actual API endpoint for password reset
    const API_ENDPOINT = 'https://betwise-sport-betting-app.onrender.com/api/auth/forget-password';

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
      setEmail(''); // Clear the input field on success
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
      console.error('Forgot Password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <h2 className="text-2xl font-display text-center mb-6">Forgot Password</h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {error && <p className="text-red-500 text-xs italic text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-xs italic text-center mb-4">{successMessage}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Password Reset Link'}
            </button>
          </div>
          <div className="text-center">
            <Link to="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;
