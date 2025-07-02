import React, { useEffect, useState, useCallback } from 'react';
import MatchCard from '../components/MatchCard';
import { FaExclamationTriangle } from 'react-icons/fa'; // For error display
import './LiveEventPage.css';

const LiveEventPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for storing fetch errors
  const [refreshing, setRefreshing] = useState(false);

  // Wrap fetch logic in useCallback to prevent re-creation on every render
  const fetchLiveMatches = useCallback(async () => {
    if (!loading) { // Only set refreshing if it's not the initial load
        setRefreshing(true);
    }
    setError(null); // Clear previous errors on a new fetch attempt

    try {
      const response = await fetch('https://betwise-sport-betting-app.onrender.com/api/live-events/rapid-api-events');
      // const response = await fetch('https://v3.football.api-sports.io/fixtures/events?fixture=215662');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Validate the API response structure, expecting an object with a 'response' array.
      if (data && Array.isArray(data.response)) {
        setMatches(data.response);
        if (data.results === 0) {
          console.log("API returned 0 live matches.");
        }
      } else {
        // Handle cases where the API response is not in the expected format
        console.error("API response is not in the expected format:", data);
        throw new Error("Received an unexpected data format from the server.");
      }
    } catch (err) {
      console.error('Error fetching live matches:', err);
      setError(err.message || 'An unknown error occurred. Please try again.');
      setMatches([]); // Ensure we don't show stale data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]); // Dependency on `loading` to differentiate initial load

  useEffect(() => {
    fetchLiveMatches();
    // The rule of hooks suggests adding fetchLiveMatches to the dependency array.
    // Since we used useCallback, this is safe and correct.
  }, [fetchLiveMatches]);

  // A dedicated loading component for a cleaner look
  const LoadingIndicator = () => (
    <div className="loading-container">
      <svg className="animate-spin h-10 w-10 text-lime-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg text-gray-300 ml-4">Loading live matches...</p>
    </div>
  );

  // A dedicated error component
  const ErrorDisplay = () => (
    <div className="error-container">
      <FaExclamationTriangle size={40} className="text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-red-400">Failed to Load Matches</h3>
      <p className="text-gray-400 my-2">{error}</p>
      <button onClick={fetchLiveMatches} disabled={refreshing}>
        {refreshing ? 'Retrying...' : '🔄 Try Again'}
      </button>
    </div>
  );

  return (
    <div className="live-event-page">
      <div className="header-container">
        <h2>⚽ Live Football Matches</h2>
        {!loading && !error && (
          <button onClick={fetchLiveMatches} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        )}
      </div>

      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <ErrorDisplay />
      ) : matches.length === 0 ? (
        <p className="text-gray-500 text-center text-xl mt-8">No live matches available right now.</p>
      ) : (
        <div className="match-grid">
          {matches.map((match) => (
            <MatchCard key={match.fixture.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveEventPage;
