import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import Navbar from '../components/Navbar'; // Ensure Navbar is imported
import { FaFutbol, FaRegCalendarAlt, FaRegClock, FaExclamationTriangle, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Added FaTimesCircle
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useBetSlip } from '../context/BetSlipContext'; // Import useBetSlip


const API_BASE_URL = 'https://betwise-sport-betting-app.onrender.com/api/user/all-events';
const API_PLACE_ODD_URL = 'https://betwise-sport-betting-app.onrender.com/api/user/place-odd/';
 
// Helper function to format date strings
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Helper to get display names for odds
const getOddDisplayName = (category, oddKey) => {
    const names = {
        '1x2': { homeTeamWinPoint: 'Home Win', drawPoint: 'Draw', awayTeamWinPoint: 'Away Win' },
        doubleChance: { '12': 'Home or Away (12)', '1x': 'Home or Draw (1X)', x2: 'Draw or Away (X2)' },
        overUnder: { over2_5: 'Over 2.5 Goals', under2_5: 'Under 2.5 Goals' }, // Add more as needed e.g. over0_5, under0_5 etc.
        ggNg: { gg: 'Both Teams to Score (GG)', ng: 'No Goal (NG)' },
    };
    return names[category]?.[oddKey] || oddKey.replace(/_/g, ' ').toUpperCase();
};

const EventDetailPage = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOdds, setSelectedOdds] = useState({}); // E.g. { '1x2': { key: 'homeTeamWinPoint', value: 1.5, label: 'Home Win' } }
    const { isAuthenticated, accessToken } = useAuth();
    const { addToSlip: addToGuestSlip, slipItems: contextSlipItems, refreshOnlineSlip } = useBetSlip();
    const navigate = useNavigate(); // Initialize useNavigate
    const [slipMessage, setSlipMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    const fetchEventDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        let headers = {};
        if (isAuthenticated && accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${eventId}`, { headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEvent(data);

            // Initialize selectedOdds from user's existing selections for this event
            if (isAuthenticated) {
                // Fetch all placed odds for the user
                const API_GET_PLACED_ODDS_URL = 'https://betwise-sport-betting-app.onrender.com/api/user/all-placed-odds';
                const placedOddsRes = await fetch(API_GET_PLACED_ODDS_URL, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                const allPlacedOdds = await placedOddsRes.json();
                if (!placedOddsRes.ok) throw new Error(allPlacedOdds.message || 'Failed to fetch placed odds.');

    const extractOddDetails = (selectedOdd) => {
        if (!selectedOdd || typeof selectedOdd !== 'object') return { market: 'N/A', oddName: 'N/A', oddValue: 'N/A' };
        const marketKey = Object.keys(selectedOdd).find(k => k !== '_id');
        if (!marketKey) return { market: 'N/A', oddName: 'N/A', oddValue: 'N/A' };
        
        const oddObject = selectedOdd[marketKey];
        if (typeof oddObject !== 'object') return { market: marketKey, oddName: 'N/A', oddValue: 'N/A' };
        const oddKey = Object.keys(oddObject)[0];
        if (!oddKey) return { market: marketKey, oddName: 'N/A', oddValue: 'N/A' };
        return { market: marketKey, oddName: getOddDisplayName(marketKey, oddKey), oddValue: oddObject[oddKey] };
    };

                const currentEventSelections = {};
                if (Array.isArray(allPlacedOdds)) {
                    allPlacedOdds.forEach(placedOdd => {
                        if (placedOdd.eventId?._id === eventId) { // Check if it belongs to the current event
                            const { market, oddName, oddValue } = extractOddDetails(placedOdd.selectedOdd);
                            if (market && oddName && oddValue) {
                                currentEventSelections[market] = {
                                    key: Object.keys(placedOdd.selectedOdd[market])[0], // Get the actual odd key (e.g., 'homeTeamWinPoint')
                                    value: oddValue,
                                    label: oddName,
                                    oddId: placedOdd._id // The ID of the placed odd document
                                };
                            }
                        }
                    });
                }
                setSelectedOdds(currentEventSelections);
                } else {
                // For guest users, derive from contextSlipItems
                const currentEventGuestSelections = {};
                const eventInSlip = contextSlipItems.find(item => item.eventId === eventId);
                if (eventInSlip && eventInSlip.selections) {
                    eventInSlip.selections.forEach(selection => {
                        currentEventGuestSelections[selection.category] = {
                            key: selection.oddKey,
                            value: selection.oddValue,
                            label: selection.label
                        };
                    });
                }
                setSelectedOdds(currentEventGuestSelections);
            }
            localStorage.setItem('selectedEventId', eventId); // Store eventId in localStorage
        } catch (err) {
            setError(err.message || 'Failed to fetch event details.');
            console.error("Fetch Event Detail Error:", err);
        } finally {
            setLoading(false);
        }
    }, [eventId, isAuthenticated, accessToken, contextSlipItems]);

     useEffect(() => {
        fetchEventDetails();
    }, [fetchEventDetails]);

    const handleOddSelect = (category, oddKey, oddValue) => {
        setSelectedOdds(prev => {
            const newSelectedOdds = { ...prev };
            const isCurrentlySelected = newSelectedOdds[category]?.key === oddKey;

            if (isCurrentlySelected) {
                delete newSelectedOdds[category];
            } else {
                newSelectedOdds[category] = { key: oddKey, value: oddValue, label: getOddDisplayName(category, oddKey) };
            }
            return newSelectedOdds;
        });
    };
    
    const handleAddToBetSlip = async () => {
        if (!event || Object.keys(selectedOdds).length === 0) {
            setSlipMessage("Please select at least one odd to add to the slip.");
            setTimeout(() => setSlipMessage(''), 3000);
            return;
        }

        if (isAuthenticated) {
            setIsSubmitting(true);
            setSlipMessage('');

            const payloadForEvent = {};
            Object.entries(selectedOdds).forEach(([category, selection]) => {
                payloadForEvent[category] = {
                    [selection.key]: selection.value
                };
            });

            const payload = {
                selectedOdd: payloadForEvent
            };

            try {
                const response = await fetch(`${API_PLACE_ODD_URL}${event._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to save selections.');
                }

                setSlipMessage("Selections saved successfully!");
                if (refreshOnlineSlip) {
                    await refreshOnlineSlip();
                }
                setTimeout(() => navigate('/betslip'), 1000);

            } catch (err) {
                setSlipMessage(err.message || "An error occurred while saving.");
            } finally {
                setIsSubmitting(false);
                setTimeout(() => setSlipMessage(''), 3000);
            }
        } else {
            // Guest user logic
            const selectionsArray = Object.values(selectedOdds);
            addToGuestSlip(event, selectionsArray); // Pass the array of selections
            setSlipMessage("Selections added to your bet slip!");
            setTimeout(() => navigate('/betslip'), 1000);
        }
    };

    if (loading) {
        return (
            <>
            <Navbar /> {/* Added Navbar */}
                <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-gray-100">
                    <FaSpinner className="animate-spin h-10 w-10 text-lime-400 mb-4" />
                    <p className="text-lg text-gray-300">Loading event details...</p>
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
                    <h2 className="text-2xl font-semibold text-red-400 mb-2">Error Loading Event</h2>
                    <p className="text-md text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={fetchEventDetails}
                        className="px-6 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition-colors mr-2"
                    >
                        Try Again
                    </button>
                    <Link to="/event" className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                        Back to Events
                    </Link>
                </div>
            </>
        );
    }

    if (!event) {
        return (
            <>
            <Navbar /> {/* Added Navbar */}
                <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-gray-100">
                    <FaFutbol size={50} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-xl">Event not found.</p>
                    <Link to="/event" className="mt-4 px-6 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition-colors">
                        Back to Events
                    </Link>
                </div>
            </>
        );
    }

    const renderOddsCategory = (categoryKey, oddsObject) => {
        if (!oddsObject || Object.keys(oddsObject).length === 0) return null;

        // Assuming oddsObject might have its own _id, we filter for actual odd keys.
        const validOddKeys = Object.keys(oddsObject).filter(key => key !== '_id' && typeof oddsObject[key] === 'number');

        return (
            <div key={categoryKey} className="mb-6 p-4 bg-gray-800 rounded-lg shadow">
                <h4 className="text-xl font-semibold text-lime-400 mb-3 capitalize">{categoryKey.replace(/([A-Z])/g, ' $1')} Odds</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {validOddKeys.map(oddKey => {
                        const oddValue = oddsObject[oddKey];
                        const isSelected = selectedOdds[categoryKey]?.key === oddKey;
                        return (
                            <button
                                key={oddKey}
                                onClick={() => handleOddSelect(categoryKey, oddKey, oddValue)}
                                className={`p-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                            border-2 
                                            ${isSelected 
                                                ? 'bg-lime-500 text-black border-lime-300 scale-105 shadow-lg' 
                                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600 hover:border-lime-500'
                                            }`}
                                title={`${getOddDisplayName(categoryKey, oddKey)}: ${oddValue}`}
                            >
                                <span className="block truncate">{getOddDisplayName(categoryKey, oddKey)}</span>
                                <span className="block font-bold text-lg">{oddValue}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <Navbar /> {/* Added Navbar */}
            <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 p-6 bg-gray-800 shadow-xl rounded-lg">
                        <div className="flex flex-col md:flex-row items-center">
                            {event.eventImage && event.eventImage !== "url/to/image.jpg" ? (
                                <img src={event.eventImage} alt={event.eventDescription} className="w-full md:w-1/3 h-auto max-h-60 object-contain rounded-md mr-0 md:mr-6 mb-4 md:mb-0" />
                            ) : (
                                <div className="w-full md:w-1/3 h-48 bg-gray-700 flex items-center justify-center rounded-md mr-0 md:mr-6 mb-4 md:mb-0">
                                    <FaFutbol size={60} className="text-gray-500" />
                                </div>
                            )}
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl lg:text-4xl font-bold text-lime-400 mb-2">{event.eventDescription || 'Event Details'}</h1>
                                <h2 className="text-2xl font-semibold text-lime-300 mb-3">
                                    {event.homeTeam || 'N/A'} <span className="text-gray-400 mx-1">vs</span> {event.awayTeam || 'N/A'}
                                </h2>
                                {event.eventStatus === 'live' && (
                                    <p className="text-xl font-bold text-red-400 mb-3 animate-pulse">
                                        Live Score: {event.homeTeamScore} - {event.awayTeamScore}
                                    </p>
                                )}
                                <div className="flex items-center text-gray-400 mb-1 justify-center md:justify-start">
                                    <FaRegCalendarAlt className="mr-2 text-lime-500" />
                                    <span>{formatDate(event.eventDate)}</span>
                                </div>
                                <div className="flex items-center text-gray-400 mb-3 justify-center md:justify-start">
                                    <FaRegClock className="mr-2 text-lime-500" />
                                    <span>{event.eventTime}</span>
                                </div>
                                <span
                                    className={`inline-block px-4 py-1.5 text-md font-semibold rounded-full
                                        ${event.eventStatus === 'upcoming' ? 'bg-lime-500 text-black' :
                                        event.eventStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
                                        'bg-gray-600 text-gray-200'
                                        }`}
                                >
                                    {event.eventStatus?.charAt(0).toUpperCase() + event.eventStatus?.slice(1) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <main>
                        <h3 className="text-2xl font-semibold text-lime-500 mb-6 text-center">Available Odds</h3>
                        {event.availableOdds ? (
                            Object.keys(event.availableOdds)
                                .filter(key => key !== '_id' && typeof event.availableOdds[key] === 'object') // Ensure we only process odd categories
                                .map(categoryKey => renderOddsCategory(categoryKey, event.availableOdds[categoryKey]))
                        ) : (
                            <p className="text-center text-gray-400">No odds available for this event.</p>
                        )}

                        {Object.keys(selectedOdds).length > 0 && (
                            <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow">
                                <h4 className="text-xl font-semibold text-lime-400 mb-4">Your Selections</h4>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {Object.entries(selectedOdds).map(([category, selection]) => (
                                        <div key={category} className="flex items-center bg-lime-900/50 border border-lime-700 text-lime-100 text-sm font-medium pl-4 pr-2 py-1.5 rounded-full">
                                            <span className="mr-2">{selection.label}: <span className="font-bold">{selection.value}</span></span>
                                            <button 
                                                onClick={() => handleOddSelect(category, selection.key, selection.value)}
                                                className="text-lime-400 hover:text-white focus:outline-none transition-colors"
                                                title={`Remove ${selection.label}`}
                                            >
                                                <FaTimesCircle size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {slipMessage && (
                                    <div className="mt-4 p-3 rounded-md text-sm text-center bg-lime-700 text-lime-100 flex items-center justify-center">
                                        <FaCheckCircle className="mr-2" />
                                        {slipMessage}
                                    </div>
                                )}
                                <button 
                                    className="mt-6 w-full bg-lime-600 hover:bg-lime-700 text-black font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors text-lg disabled:opacity-50"
                                    onClick={handleAddToBetSlip}
                                   disabled={isSubmitting || Object.keys(selectedOdds).length === 0}
                                >
                                 {isSubmitting ? (
                                        <><FaSpinner className="animate-spin inline mr-2" /> Adding...</>
                                    ) : 'Add to Bet Slip'}
                                </button>
 
                            </div>
                        )}
                    </main>
                     <div className="mt-8 text-center">
                        <Link to="/event" className="text-lime-400 hover:text-lime-300 underline">
                            &larr; Back to All Events
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventDetailPage;
