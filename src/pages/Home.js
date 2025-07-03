import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar'; // Ensure Navbar is imported
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FaFutbol, FaExclamationTriangle } from 'react-icons/fa';
import MatchCard from '../components/MatchCard'; // Import MatchCard
import './Home.css'; // Optional: Create a Home.css for specific styles

const API_GET_ALL_EVENTS = process.env.REACT_APP_API_GET_ALL_EVENTS; // Ensure this is set correctly

// Helper function to format date and time concisely
const formatConciseDateTime = (dateStr, timeStr) => {
  if (!dateStr) return timeStr || 'N/A';
  try {
    const date = new Date(dateStr);
    const M = date.toLocaleString('en-US', { month: 'short' });
    const D = date.getDate();
    let formattedTime = timeStr || '';
    if (timeStr && timeStr.includes('GMT')) { // Basic check if GMT is present
      formattedTime = timeStr.split(' ')[0]; // Take only HH:MM part
    }
    return `${M} ${D}${formattedTime ? `, ${formattedTime}` : ''}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return timeStr || 'N/A';
  }
};
const SmallEventCard = ({ event }) => {
  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-lime-500/40 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
          ${event.eventStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
            event.eventStatus === 'upcoming' ? 'bg-lime-500 text-black' :
              'bg-gray-600 text-gray-200'}`}>
          {event.eventStatus?.toUpperCase() || 'N/A'}
          </span>
        <span className="text-xs text-gray-400">{formatConciseDateTime(event.eventDate, event.eventTime)}</span>
      </div>
      <h4 className="text-sm font-semibold text-lime-400 truncate" title={`${event.homeTeam} vs ${event.awayTeam}`}>
        {event.homeTeam || 'N/A'} <span className="text-gray-400">vs</span> {event.awayTeam || 'N/A'}
      </h4>
      <p className="text-xs text-gray-300 truncate mt-1" title={event.eventDescription}>{event.eventDescription || 'No description'}</p>
      
      {event.availableOdds && event.availableOdds['1x2'] && (
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs grid grid-cols-3 gap-1 text-center">
          <div title="Home Win">
            <span className="text-gray-400">1: </span>
            <span className="font-bold text-lime-300">{event.availableOdds['1x2']?.homeTeamWinPoint || 'N/A'}</span>
          </div>
          <div title="Draw">
            <span className="text-gray-400">X: </span>
            <span className="font-bold text-lime-300">{event.availableOdds['1x2'].drawPoint}</span>
          </div>
          <div title="Away Win">
            <span className="text-gray-400">2: </span>
            <span className="font-bold text-lime-300">{event.availableOdds['1x2'].awayTeamWinPoint}</span>
          </div>
        </div>
      )}
       <Link
          to={`/event/${event._id}`}
          className="mt-3 block w-full text-center bg-lime-500 hover:bg-lime-600 text-black text-xs font-bold py-1.5 px-2 rounded focus:outline-none focus:shadow-outline transition-colors"
        >
          Bet Now
        </Link>
    </div>
      );
    };

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_GET_ALL_EVENTS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen text-gray-100">
        <div className="container mx-auto px-4 py-8">

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-lime-500 mb-6 text-center">Live Events</h2>
            {/* Replace LiveEventPage's content with a more integrated display */}
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <svg className="animate-spin h-8 w-8 text-lime-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-gray-300">Loading live matches...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative text-center" role="alert">
                <FaExclamationTriangle className="inline mr-2" />
                <span>{error}</span>
              </div>
            ) : events.filter(event => event.eventStatus === 'live').length === 0 ? (
              <p className="text-gray-500 text-center">No live matches right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {events
                  .filter(event => event.eventStatus === 'live')
                  .map(match => (
                    <MatchCard key={match._id} match={match} /> // Assuming 'match' structure is similar to 'event'
                  ))}
              </div>
            )}
          </section>


        <header className="text-center my-12">
          <h1 className="text-5xl font-bold text-lime-400 tracking-tight">Welcome to BetWise</h1>
          <p className="text-xl text-gray-300 mt-3">Your ultimate betting companion for today's action.</p>
        </header>

        <main>
          <h2 className="text-3xl font-semibold text-lime-500 mb-6 text-center">Featured Events</h2>
            {loading && (
                 <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <svg className="animate-spin h-10 w-10 text-lime-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg text-gray-300">Loading events...</p>
                </div>
            )}
            {error && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-800 p-6 rounded-lg shadow-xl">
                    <FaExclamationTriangle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load Events</h3>
                    <p className="text-md text-gray-400 text-center mb-4">{error}</p>
                    <button onClick={fetchEvents} className="px-6 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition-colors">
                        Try Again
                    </button>
                </div>
            )}
            {!loading && !error && events.length === 0 && (
                <div className="text-center text-gray-500 min-h-[300px] flex flex-col justify-center items-center">
                    <FaFutbol size={50} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-xl">No events available right now. Please check back soon!</p>
                </div>
            )}
            {!loading && !error && events.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {events.map(event => (
                  <SmallEventCard key={event._id} event={event} />
                ))}
              </div>
            )}
        </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
