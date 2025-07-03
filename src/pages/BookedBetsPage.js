import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Import Navbar
import { FaSpinner, FaExclamationTriangle, FaListAlt } from 'react-icons/fa';

const API_GET_USER_BET_SLIPS_URL = process.env.REACT_APP_API_GET_USER_BET_SLIPS_URL;
const LOCAL_BOOKED_BETS_KEY = process.env.REACT_APP_LOCAL_BOOKED_BETS_KEY; // Key for offline bets

const BookedBetsPage = () => {
    const { isAuthenticated, accessToken, isLoadingAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [bookedSlips, setBookedSlips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // New state for filter
    const [offlineBookedBets, setOfflineBookedBets] = useState([]);

    // Helper to get display names for odds, useful for rendering fetched bet slips
    const getOddDisplayName = (category, oddKey) => {
        const names = {
            '1x2': { homeTeamWinPoint: 'Home Win', drawPoint: 'Draw', awayTeamWinPoint: 'Away Win' },
            doubleChance: { '12': 'Home or Away (12)', '1x': 'Home or Draw (1X)', x2: 'Draw or Away (X2)' },
            overUnder: { over2_5: 'Over 2.5 Goals', under2_5: 'Under 2.5 Goals' },
            ggNg: { gg: 'Both Teams to Score (GG)', ng: 'No Goal (NG)' },
        };
        return names[category]?.[oddKey] || oddKey.replace(/_/g, ' ').toUpperCase();
    };

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

    const fetchBookedSlips = useCallback(async () => {
        if (!isAuthenticated || !accessToken) {
            setBookedSlips([]);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(API_GET_USER_BET_SLIPS_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    navigate('/login', { state: { from: location, message: "Session expired. Please log in again." } });
                    return;
                }
                throw new Error(data.message || `Error ${response.status}`);
            }
            setBookedSlips(data || []); // API returns the array directly
        } catch (err) {
            console.error('Error fetching booked bet slips:', err);
            setError(err.message || 'Failed to fetch booked bet slips.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, accessToken, navigate, location]);

    useEffect(() => {
        if (!isLoadingAuth) { // Only fetch if auth state is resolved
            if (isAuthenticated) {
                fetchBookedSlips();
            } else { // If not authenticated, load offline bets from localStorage
                const savedOfflineBets = localStorage.getItem(LOCAL_BOOKED_BETS_KEY);
                if (savedOfflineBets) {
                    setOfflineBookedBets(JSON.parse(savedOfflineBets));
                }
            }
        }
    }, [isLoadingAuth, isAuthenticated, fetchBookedSlips, navigate, location]);

    if (isLoadingAuth || loading) {
        return (
            <>
                <Navbar /> {/* Added Navbar */}
                <div className="min-h-screen flex items-center justify-center bg-black text-white">
                    <FaSpinner className="animate-spin h-8 w-8 text-lime-400" />
                    <p className="ml-3">{isLoadingAuth ? "Verifying authentication..." : "Loading booked bets..."}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar /> {/* Added Navbar */}
            <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-lime-400 mb-8 text-center">Your Bet Slips</h1>

                    {/* Filter Buttons for Placed Bets */}
                    {isAuthenticated && bookedSlips.length > 0 && (
                        <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-lime-600 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'pending' ? 'bg-lime-600 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilterStatus('won')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'won' ? 'bg-lime-600 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Won
                            </button>
                            <button
                                onClick={() => setFilterStatus('lost')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'lost' ? 'bg-lime-600 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Lost
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative text-center mb-6" role="alert">
                            <FaExclamationTriangle className="inline mr-2" />
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {/* Offline Booked Bets for Unauthenticated Users */}
                    {!isAuthenticated && !loading && offlineBookedBets.length > 0 && (
                        <ul className="space-y-6">
                            {[...offlineBookedBets].reverse().map((bet) => (
                                <li key={bet.bookingId} className="p-6 bg-gray-800 rounded-lg shadow-xl border-l-4 border-yellow-500">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg font-semibold text-yellow-300 truncate" title={bet.bookingId}>Booking ID: {bet.bookingId}</h2>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-black">
                                            OFFLINE
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1">Booked: {new Date(bet.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-gray-300">Stake: <span className="font-bold text-lime-200">₦{bet.stakeAmount?.toLocaleString()}</span></p>
                                    <p className="text-sm text-gray-300">Total Odds: <span className="font-bold text-lime-200">{bet.totalOdds?.toFixed(2)}x</span></p>
                                    <p className="text-sm text-gray-300">Potential Winnings: <span className="font-bold text-lime-200">₦{bet.potentialWinnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Message for unauthenticated users with no offline bets */}
                    {!isAuthenticated && !loading && offlineBookedBets.length === 0 && (
                        <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                            <p className="text-xl text-gray-400">You have no offline booked bets.</p>
                            <p className="text-gray-400 mt-2">Please <Link to="/login" state={{ from: location }} className="text-lime-500 hover:underline">login</Link> to view your account's bet history.</p>
                        </div>
                    )}

                    {/* Message for authenticated users with no server-side bets */}
                    {isAuthenticated && !loading && !error && bookedSlips.length === 0 && (
                        <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                            <FaListAlt size={48} className="text-gray-500 mx-auto mb-4" />
                            <p className="text-xl text-gray-400">You have no bet slips yet.</p>
                            <Link to="/event" className="mt-4 inline-block bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded transition-colors">
                                Browse Events
                            </Link>
                        </div>
                    )}

                    {/* Display server-side bets for authenticated users */}
                    {isAuthenticated && (
                        (() => {
                            const filteredSlips = bookedSlips.filter(slip => filterStatus === 'all' || slip.betSlipStatus === filterStatus);
                            if (filteredSlips.length === 0) {
                                return (
                                    <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                                        <p className="text-xl text-gray-400">No bet slips match the filter: "{filterStatus}"</p>
                                    </div>
                                );
                            }
                            return (
                                <ul className="space-y-6"> 
                                    {[...filteredSlips].reverse().map((slip) => (
                                        <li key={slip._id} className="p-6 bg-gray-800 rounded-lg shadow-xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <h2 className="text-lg font-semibold text-lime-300">Bet Slip ID: {slip._id}</h2>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    slip.betSlipStatus === 'won' ? 'bg-green-500 text-white' :
                                                    slip.betSlipStatus === 'lost' ? 'bg-red-500 text-white' :
                                                    slip.betSlipStatus === 'pending' ? 'bg-yellow-500 text-black' :
                                                    'bg-gray-600 text-gray-200'
                                                }`}>
                                                    {slip.betSlipStatus?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-1">Placed: {new Date(slip.createdAt).toLocaleString()}</p>
                                            <p className="text-sm text-gray-300">Stake: <span className="font-bold text-lime-200">₦{slip.betAmount?.toLocaleString()}</span></p>
                                            <p className="text-sm text-gray-300">Total Odds: <span className="font-bold text-lime-200">{slip.totalOddsValue?.toFixed(2)}x</span></p>
                                            <p className="text-sm text-gray-300">Potential Payout: <span className="font-bold text-lime-200">₦{slip.potentialPayout?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <h4 className="text-md font-semibold text-gray-200 mb-2">Selections ({slip.numberOfSelections}):</h4>
                                                {slip.oddIds?.map((selection) => {
                                                    const { oddName, oddValue } = extractOddDetails(selection.selectedOdd);
                                                    return (
                                                        <div key={selection._id} className="text-xs text-gray-400 mb-1 ml-2 border-l-2 border-lime-700 pl-2">
                                                            {selection.homeTeam} vs {selection.awayTeam}: {oddName} @{parseFloat(oddValue).toFixed(2)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            );
                        })()
                    )}
                </div>
            </div>
        </>
    );
};

export default BookedBetsPage;