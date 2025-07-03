import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import Navbar from '../components/Navbar'; // Ensure Navbar is imported
import { useBetSlip } from '../context/BetSlipContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaShoppingCart, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaListAlt } from 'react-icons/fa'; // Added FaListAlt

const API_CREATE_BET_SLIP_URL = process.env.REACT_APP_API_CREATE_BET_SLIP_URL;
const API_GET_ALL_PLACED_ODDS_URL = process.env.REACT_APP_API_GET_ALL_PLACED_ODDS_URL;
const API_DELETE_ALL_PLACED_ODDS_URL = process.env.REACT_APP_API_DELETE_ALL_PLACED_ODDS_URL;
const API_DELETE_ONE_PLACED_ODD_URL = process.env.REACT_APP_API_DELETE_ONE_PLACED_ODD_URL;
const API_GET_USER_BET_SLIPS_URL = process.env.REACT_APP_API_GET_USER_BET_SLIPS_URL;
const LOCAL_BOOKED_BETS_KEY = process.env.REACT_APP_LOCAL_BOOKED_BETS_KEY; 


const BetSlipPage = () => {
    const { slipItems: guestSlipItems, removeFromSlip: removeFromGuestSlip, clearSlip: clearGuestSlip, setSlipItems } = useBetSlip();
    const { isAuthenticated, accessToken, currentUser, refreshUser, isLoadingAuth } = useAuth();
    const navigate = useNavigate(); // Initialize navigate
    const location = useLocation(); // For redirecting back after login

    const [stake, setStake] = useState('');
    const [isPlacingBet, setIsPlacingBet] = useState(false);
    const [betMessage, setBetMessage] = useState({ type: '', text: '' });
    const [isClearingOnlineSlip, setIsClearingOnlineSlip] = useState(false); // New state for clearing online slip

    // State for the user's selections fetched from the server
    const [onlineSlip, setOnlineSlip] = useState([]);
    const [loadingOnlineSlip, setLoadingOnlineSlip] = useState(true);
    const [onlineSlipError, setOnlineSlipError] = useState('');

    // State for fetched bet slips
    const [placedBets, setPlacedBets] = useState([]);
    const [loadingBets, setLoadingBets] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // New state for filter

    const [offlineBookedBets, setOfflineBookedBets] = useState([]); // New state for offline booked bets

    // Load offline booked bets from local storage on component mount
    useEffect(() => {
        const savedOfflineBets = localStorage.getItem(LOCAL_BOOKED_BETS_KEY);
        if (savedOfflineBets) {
            setOfflineBookedBets(JSON.parse(savedOfflineBets));
        }
    }, []);

    // Save offline booked bets to local storage whenever they change
    useEffect(() => {
        localStorage.setItem(LOCAL_BOOKED_BETS_KEY, JSON.stringify(offlineBookedBets));
    }, [offlineBookedBets]);

    // This is the single source of truth for what is displayed in the bet slip UI.
    const slipItems = isAuthenticated ? onlineSlip : guestSlipItems

    const totalOdds = useMemo(() => {
        if (!slipItems || slipItems.length === 0) {
            return 1;
        }
         // The data structure is different for online vs guest slips
        if (isAuthenticated) {
            // Correct logic for onlineSlip: multiply all odds from all selections
            return onlineSlip.reduce((totalProduct, eventSelections) => {
                if (!eventSelections.selectedOdd) return totalProduct;

                const eventProduct = Object.values(eventSelections.selectedOdd).reduce((marketProduct, marketObject) => {
                    if (typeof marketObject !== 'object' || marketObject === null) return marketProduct;
                    const oddValue = Object.values(marketObject)[0];
                    const numericOddValue = parseFloat(oddValue);
                    return marketProduct * (isNaN(numericOddValue) ? 1 : numericOddValue);
                }, 1);

                return totalProduct * eventProduct;
            }, 1);
        } else {
            // Original logic for guestSlipItems
            const eventOddsProducts = guestSlipItems.map(item => {
                if (!item.selections || item.selections.length === 0) {
                    return 1;
                }
                return item.selections.reduce((eventAcc, selection) => {
                    const oddV = parseFloat(selection.oddValue);
                    return eventAcc * (isNaN(oddV) ? 1 : oddV);
                }, 1);
            });
            return eventOddsProducts.reduce((acc, product) => acc * product, 1);
        }
    }, [slipItems, isAuthenticated, onlineSlip, guestSlipItems]);

    const potentialWinnings = useMemo(() => {
        const stakeAmount = parseFloat(stake);
        if (stakeAmount > 0 && totalOdds > 0) {
            return totalOdds * stakeAmount;
        }
        return 0;
    }, [stake, totalOdds]);

    const handleStakeChange = (e) => {
        const value = e.target.value;
        // Regex to allow numbers and at most one decimal point
        if (/^\d*\.?\d*$/.test(value)) { // Allows numbers and one decimal point
            setStake(value);
            setBetMessage({ type: '', text: '' }); // Clear previous messages
        }
    };

    const handleClearOnlineSlip = async () => {
        if (!isAuthenticated || !accessToken) {
            setBetMessage({ type: 'error', text: 'You must be logged in to clear your online slip.' });
            return;
        }
        
        setIsClearingOnlineSlip(true);
        setBetMessage({ type: '', text: '' });

        try {
            const response = await fetch(API_DELETE_ALL_PLACED_ODDS_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', // Added Content-Type header
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            if (!response.ok) throw new Error('Failed to clear online slip.');
            setBetMessage({ type: 'success', text: 'Your bet slip has been cleared.' });
            fetchOnlineSlip(); // Re-fetch to confirm it's empty
        } catch (error) {
            console.error('Error clearing online slip:', error);
            setBetMessage({ type: 'error', text: error.message || 'Failed to clear online slip.' });
        } finally {
            setIsClearingOnlineSlip(false);
        }
    };

    const handleRemoveOnlineOdd = async (oddId) => {
        if (!isAuthenticated || !accessToken) {
            setBetMessage({ type: 'error', text: 'You must be logged in to remove a selection.' });
            return;
        }
        try {
            
            const response = await fetch(`${API_DELETE_ONE_PLACED_ODD_URL}/${oddId}`, { // Use the specific delete URL with oddId in path
              method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
             });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove selection.');
            }
            setBetMessage({ type: 'success', text: 'Selection removed successfully!' });
            fetchOnlineSlip(); // Re-fetch the online slip to update UI
        } catch (error) {
            console.error('Error removing online odd:', error);
            setBetMessage({ type: 'error', text: error.message || 'Failed to remove selection.' });
        }
    };


    // Fetches the user's current selections (unconfirmed odds) from the server.
    const fetchOnlineSlip = useCallback(async () => {
        if (!isAuthenticated || !accessToken) {
            setOnlineSlip([]);
            setLoadingOnlineSlip(false);
            return;
        }
        setLoadingOnlineSlip(true);
        setOnlineSlipError('');
        try {
            const res = await fetch(API_GET_ALL_PLACED_ODDS_URL, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to load your selections.');
            }
            setOnlineSlip(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching online slip:', err);
            setOnlineSlipError(err.message);
        } finally {
            setLoadingOnlineSlip(false);
        }
    }, [isAuthenticated, accessToken]);

    // Define fetchPlacedBets once, wrapped in useCallback
    const fetchPlacedBets = useCallback(async () => {
            if (!isAuthenticated || !accessToken) {
                 setPlacedBets([]);
                setFetchError(isAuthenticated === false ? 'Login to view your bet slips.' : ''); // Show login prompt only if explicitly not authenticated
                 return;
            }

            setLoadingBets(true);
            setFetchError(''); // Clear previous fetch errors

            try {
                const res = await fetch(API_GET_USER_BET_SLIPS_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    }, // Use the token variable from useAuth
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || `Error ${res.status}`);
                }
             setPlacedBets(data || []); // API returns the array directly
            } catch (err) {
             console.error('Error fetching user bet slips:', err);
                setFetchError(err.message || 'Failed to fetch your bet slips.');
            } finally {
                setLoadingBets(false);
            }
    }, [isAuthenticated, accessToken]); // Dependencies for useCallback

    // Combined useEffect for fetching data based on auth state
    useEffect(() => {
        if (isAuthenticated) {
            fetchOnlineSlip(); // Fetch the current slip
            if (guestSlipItems.length > 0) {
                clearGuestSlip();
            }
        } else {
            setOnlineSlip([]);
            setLoadingOnlineSlip(false);
        }
        fetchPlacedBets(); // This already checks for isAuthenticated internally
    }, [isAuthenticated, fetchPlacedBets, fetchOnlineSlip, guestSlipItems, clearGuestSlip]);

    // Guard clause moved after all hook calls
    if (isLoadingAuth) {
      return (
        <>
          <Navbar /> 
          <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <FaSpinner className="animate-spin h-8 w-8 text-lime-400" /> <p className="ml-3">Loading authentication...</p>
          </div>
        </>
      );
    }
   
    // Function to generate a simple unique ID for offline bookings
    const generateBookingId = () => {
        return `OFFLINE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    };

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

    const handlePlaceBet = async () => {
        // Clear stake and reset potential winnings if slip is empty (edge case, button should be disabled)
        const stakeAmount = parseFloat(stake);
        if (slipItems.length === 0 || isNaN(stakeAmount) || stakeAmount <= 0) {
            setStake('');
            setBetMessage({ type: 'error', text: 'Please add selections and enter a valid stake.' });
            return;
        }

       // Handle offline booking for unauthenticated users
       if (!isAuthenticated) {
            const newOfflineBet = {
                bookingId: generateBookingId(), // This uses guestSlipItems via the `slipItems` variable
                slipItems: [...slipItems], // Create a copy of the slip items
                stakeAmount: stakeAmount,
                totalOdds: totalOdds,
                potentialWinnings: potentialWinnings,
                createdAt: new Date().toISOString(),
                status: 'Booked Offline'
            };

            setOfflineBookedBets(prev => [...prev, newOfflineBet]);
            setBetMessage({ type: 'success', text: `Bet booked successfully! Your Booking ID is: ${newOfflineBet.bookingId}` });
            
            // Clear the slip and stake after booking
            clearGuestSlip();
            setStake('');
            
            // Optionally navigate to the booked bets page
            setTimeout(() => navigate('/booked-bets'), 2000);
            return;
       }

       // The rest of the function is for authenticated users
       if (!currentUser) {
            setBetMessage({ type: 'error', text: 'User data not available. Please try again.' });
            return;
}



        if (currentUser.walletBalance < stakeAmount) {
            setBetMessage({ type: 'error', text: `Insufficient funds. Your balance is ₦${currentUser.walletBalance.toLocaleString()}.` });
            return;
        }

        setIsPlacingBet(true);
        setBetMessage({ type: '', text: '' });

        // CRITICAL FIX: Use the fetched onlineSlip to get the correct odd IDs
        const oddIdsToSubmit = onlineSlip.map(odd => odd._id).filter(Boolean);

        if (oddIdsToSubmit.length === 0) {
            setIsPlacingBet(false);
            setBetMessage({ type: 'error', text: 'Your bet slip is empty. Please add selections to place a bet.' });
            fetchOnlineSlip(); // Refresh slip from server in case of state mismatch
            return;
        }

        const payload = {
            oddIds: oddIdsToSubmit,
            betAmount: stakeAmount,
        };

        try {
            const response = await fetch(API_CREATE_BET_SLIP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // Use accessToken
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `API error! status: ${response.status}`);
            }

            setBetMessage({ type: 'success', text: responseData.message || 'Bet placed successfully!' });
             await fetchOnlineSlip(); // Re-fetch the online slip, which should now be empty
            setStake(''); 
            if (refreshUser) { 
                await refreshUser(); // Refresh user data to get updated wallet balance
            }
            // After successfully placing a bet, re-fetch the placed bets list
            await fetchPlacedBets(); // Re-call the fetch function

            
            // Navigate to booked bets page after a short delay to show success message
            setTimeout(() => {
                navigate('/booked-bets'); // Navigate to the new booked bets page
            }, 1500); // Delay to allow user to see success message

        } catch (err) {
            console.error("Place Bet API Error:", err);
            setBetMessage({ type: 'error', text: err.message || 'Failed to place bet. Please try again.' });
        } finally {
            setIsPlacingBet(false);
        }
    };



    return (
        <>
            <Navbar /> {/* Added Navbar */}
            <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-lime-400 mb-8 text-center">Your Bet Slip</h1>

                    {betMessage.text && (
                        <div className={`mb-4 p-3 rounded-md text-sm text-center flex items-center justify-center ${
                            betMessage.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                        }`}>
                            {betMessage.type === 'success' ? <FaCheckCircle className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
                            {betMessage.text}
                        </div>
                    )}

                  {isAuthenticated && loadingOnlineSlip && (
                        <div className="flex justify-center items-center p-6">
                            <FaSpinner className="animate-spin h-8 w-8 text-lime-400" />
                            <p className="ml-3 text-gray-300">Loading your selections...</p>
                        </div>
                    )}

                    {isAuthenticated && onlineSlipError && (
                        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative text-center" role="alert">
                            <FaExclamationTriangle className="inline mr-2" /> {onlineSlipError}
                        </div>
                    )}

                    {!loadingOnlineSlip && slipItems.length === 0 ? (
                       <div className="bg-gray-800 shadow-lg rounded-lg p-8 text-center">
                            <FaShoppingCart size={48} className="text-gray-500 mx-auto mb-4" />
                            <p className="text-xl text-gray-400 mb-4">Your bet slip is empty.</p>
                            <Link 
                                to="/event" 
                                className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded transition-colors"
                            >
                                Browse Events
                            </Link>
                        </div>
                  ) : !loadingOnlineSlip && slipItems.length > 0 && (
                        
                        <div className="bg-gray-800 shadow-xl rounded-lg p-6">
                            <div className="space-y-4 mb-6">
                                {isAuthenticated ? onlineSlip.map((eventSelections) => {
                                    const selections = Object.entries(eventSelections.selectedOdd || {}).filter(([key]) => key !== '_id');
                                    return (
                                        <div key={eventSelections._id} className="p-4 bg-gray-700 rounded-md shadow relative">
                                            <p className="font-semibold text-lime-300 text-sm mb-2">{`${eventSelections?.homeTeam || 'N/A'} vs ${eventSelections?.awayTeam || 'N/A'}`}</p>
                                            
                                            {selections.map(([market, oddDetails], index) => {
                                                const oddKey = Object.keys(oddDetails)[0];
                                                const oddValue = oddDetails[oddKey];
                                                const oddName = getOddDisplayName(market, oddKey);
                                                
                                                return (
                                                    <div key={market} className={`flex justify-between items-center pt-2 mt-2 ${index > 0 ? 'border-t border-gray-600' : ''}`}>
                                                        <div>
                                                            <p className="text-xs text-gray-400">{market}: <span className="text-gray-200">{oddName}</span></p>
                                                            <p className="text-lg font-bold text-lime-400">@{parseFloat(oddValue).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <button 
                                                onClick={() => handleRemoveOnlineOdd(eventSelections._id)}
                                                className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                                                title="Remove all selections for this event"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    )
                                }) : guestSlipItems.map((eventItem) => (
                                        <div key={eventItem.eventId} className="p-4 bg-gray-700 rounded-md shadow">
                                            <p className="font-semibold text-lime-300 text-sm mb-2">{`${eventItem.homeTeam} vs ${eventItem.awayTeam}`}</p>
                                            {eventItem.selections.map(selection => (
                                                <div key={selection.oddKey} className="flex justify-between items-center border-t border-gray-600 pt-2 mt-2">
                                                    <div>
                                                        <p className="text-xs text-gray-400">{selection.category}: <span className="text-gray-200">{selection.label}</span></p>
                                                        <p className="text-lg font-bold text-lime-400">@{parseFloat(selection.oddValue).toFixed(2)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromGuestSlip(eventItem.eventId, selection.oddKey)}
                                                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                        title="Remove selection"
                                                    >
                                                        <FaTimesCircle size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ))
                                }
                            </div>

                            <div className="border-t border-gray-700 pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 font-medium">Total Odds:</span>
                                    <span className="text-lime-400 font-bold text-xl">{totalOdds.toFixed(2)}x</span>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <label htmlFor="stake" className="text-gray-300 font-medium mb-1 sm:mb-0">Stake (₦):</label>
                                    <input 
                                        type="text" 
                                        id="stake"
                                        value={stake}
                                        onChange={handleStakeChange} // Keeps current controlled input logic
                                        placeholder="0.00"
                                        className="w-full sm:w-auto bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-right"
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 font-medium">Potential Winnings:</span>
                                    <span className="text-lime-400 font-bold text-2xl">₦{potentialWinnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <button
                                         onClick={handlePlaceBet} // This now handles both online and offline
                                       disabled={isPlacingBet || slipItems.length === 0 || !stake || parseFloat(stake) <= 0}
                                        className="w-full sm:flex-1 bg-lime-600 hover:bg-lime-700 text-black font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isPlacingBet 
                                            ? <><FaSpinner className="animate-spin mr-2" /> Processing...</>
                                            : isAuthenticated ? 'Place Bet' : 'Book Bet'
                                        }
                                    </button>
                                    <button
                                         onClick={isAuthenticated ? handleClearOnlineSlip : clearGuestSlip}
                                         disabled={isClearingOnlineSlip}
                                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors flex items-center justify-center disabled:opacity-50"
                                        title="Clear all selections"
                                    >
                                        {isClearingOnlineSlip ? <FaSpinner className="animate-spin inline mr-1 sm:mr-0" /> : <FaTrash className="inline mr-1 sm:mr-0" />}
                                        <span className="sm:hidden ml-2">{isClearingOnlineSlip ? 'Clearing' : 'Clear Slip'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BetSlipPage;
