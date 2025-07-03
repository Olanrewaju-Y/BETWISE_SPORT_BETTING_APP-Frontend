import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar'; // Ensure Navbar is imported
import { FaFutbol, FaRegCalendarAlt, FaRegClock, FaExclamationTriangle } from 'react-icons/fa'; // Example icons
import { Link } from 'react-router-dom'; // Import Link for navigation
import Footer from '../components/Footer';

// API Endpoint
const API_GET_ALL_EVENTS = process.env.REACT_APP_API_GET_ALL_EVENTS;

// Helper function to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Component for displaying individual event cards
const EventCard = ({ event }) => {
  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 hover:shadow-lime-500/40 transition-all duration-300 ease-in-out">
      {event.eventImage && event.eventImage !== "url/to/image.jpg" ? ( // Check if image is a placeholder
        <img src={event.eventImage} alt={event.eventDescription} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
          <FaFutbol size={60} className="text-gray-500" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-lime-400 mb-2 truncate" title={event.eventDescription}>{event.eventDescription || 'Event'}</h3>
        <p className="text-2xl font-bold text-lime-300 mb-3 truncate" title={`${event.homeTeam} vs ${event.awayTeam}`}>
          {event.homeTeam || 'N/A'} <span className="text-gray-400 mx-1">vs</span> {event.awayTeam || 'N/A'}
        </p>

        {event.eventStatus === 'live' && (
          <p className="text-lg font-semibold text-red-400 mb-3">
            Score: {event.homeTeamScore} - {event.awayTeamScore}
          </p>
        )}

        <div className="flex items-center text-gray-400 mb-2">
          <FaRegCalendarAlt className="mr-2 text-lime-500" />
          <span>{formatDate(event.eventDate)}</span>
        </div>
        <div className="flex items-center text-gray-400 mb-4">
          <FaRegClock className="mr-2 text-lime-500" />
          <span>{event.eventTime}</span>
        </div>

        <span
          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-4
            ${event.eventStatus === 'upcoming' ? 'bg-lime-500 text-black' :
              event.eventStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
              'bg-gray-600 text-gray-200'
            }`}
        >
          {event.eventStatus?.charAt(0).toUpperCase() + event.eventStatus?.slice(1) || 'N/A'}
        </span>

        {/* Basic Odds Display - can be expanded */}
        {event.availableOdds && event.availableOdds['1x2'] && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-1">1X2 Odds:</h4>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Home: <span className="font-bold text-lime-300">{event.availableOdds['1x2'].homeTeamWinPoint}</span></span>
              <span>Draw: <span className="font-bold text-lime-300">{event.availableOdds['1x2'].drawPoint}</span></span>
              <span>Away: <span className="font-bold text-lime-300">{event.availableOdds['1x2'].awayTeamWinPoint}</span></span>
            </div>
          </div>
        )}
        {/* Add more odds display as needed */}

        <Link 
          to={`/event/${event._id}`} 
          className="mt-4 block w-full text-center bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
        >
          View Details / Bet Now
        </Link>
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]); // State to store event data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await fetch(API_GET_ALL_EVENTS);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the API returns an array of events directly.
        // If it's nested, e.g., data.events, adjust accordingly.
        setEvents(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch events. Please try again later.');
        console.error("Fetch Events Error:", err);
      } finally {
        setLoading(false);
      }
    },
   []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <>
        <Navbar /> {/* Added Navbar */}
      
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-gray-100">
          <svg className="animate-spin h-10 w-10 text-lime-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-300">Loading events, please wait...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
       <Navbar /> {/* Added Navbar */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center text-gray-100">
          <FaExclamationTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops! Something went wrong.</h2>
          <p className="text-md text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="px-6 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
     <Navbar /> {/* Added Navbar */}
      <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-lime-400">Available Events</h1>
          <p className="text-lg text-gray-300 mt-2">Check out the latest upcoming and live events.</p>
        </header>

        {events.length === 0 ? (
          <div className="text-center text-gray-400">
            <FaFutbol size={50} className="mx-auto mb-4 text-gray-500" />
            <p className="text-xl">No events available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(eventItem => (
              <EventCard key={eventItem._id} event={eventItem} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};




export default Events;
