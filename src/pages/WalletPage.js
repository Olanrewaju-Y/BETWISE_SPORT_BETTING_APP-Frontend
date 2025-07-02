/* WalletPage.js */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import { FaWallet, FaPlusCircle, FaMinusCircle, FaSpinner, FaArrowUp, FaArrowDown, FaListAlt, FaExclamationTriangle } from 'react-icons/fa';

const WalletPage = () => {
    const { currentUser, isAuthenticated, isLoadingAuth, refreshUser, accessToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [action, setAction] = useState(null); // 'deposit' or 'withdraw'
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    // State for transaction history
    const [transactions, setTransactions] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(5); // Number of transactions per page

    const fetchWalletHistory = useCallback(async (page) => {
        if (!isAuthenticated || !accessToken) return;

        setIsHistoryLoading(true);
        setHistoryError('');
        const skip = (page - 1) * limit;

        try {
            const response = await fetch(`https://betwise-sport-betting-app.onrender.com/api/payment/wallet-and-payment-history?limit=${limit}&skip=${skip}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch transaction history.');
            }
            setTransactions(data.transactions || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || 1);
        } catch (err) {
            setHistoryError(err.message);
        } finally {
            setIsHistoryLoading(false);
        }
    }, [isAuthenticated, accessToken, limit]);

    useEffect(() => {
        if (!isLoadingAuth && !isAuthenticated) {
            navigate('/login', { state: { from: location, message: "Please log in to access your wallet." } });
        } else if (!isLoadingAuth && isAuthenticated) {
            fetchWalletHistory(currentPage);
        }
    }, [isLoadingAuth, isAuthenticated, navigate, location, currentPage, fetchWalletHistory]);

    // Simulate API call for deposit/withdrawal
    const handleTransaction = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount.' });
            return;
        }
        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, you would make an API call here
        // For now, we'll just show a success message and refresh user data
        setMessage({ type: 'success', text: `${action === 'deposit' ? 'Deposit' : 'Withdrawal'} of ₦${parseFloat(amount).toLocaleString()} successful (simulated).` });
        if (refreshUser) {
            await refreshUser(); // Refresh user data to reflect new balance (simulated)
        }
        setAction(null);
        setAmount('');
        setIsProcessing(false);
        fetchWalletHistory(1); // Refresh history after a transaction
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    if (isLoadingAuth) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-black text-white">
                    <FaSpinner className="animate-spin h-8 w-8 text-lime-400" />
                    <p className="ml-3">Loading wallet...</p>
                </div>
            </>
        );
    }

    if (!isAuthenticated) return null; // Should be redirected by useEffect

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const TransactionIcon = ({ type }) => {
        switch (type) {
            case 'deposit':
                return <FaArrowUp className="text-green-400" />;
            case 'withdrawal':
                return <FaArrowDown className="text-red-400" />;
            case 'bet_placement':
                return <FaListAlt className="text-yellow-400" />;
            default:
                return <FaWallet className="text-gray-400" />;
        }
    };

    const formatTransactionDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center mb-6">
                        <FaWallet className="text-lime-400 text-4xl mr-3" />
                        <h1 className="text-3xl font-bold text-lime-400">My Wallet</h1>
                    </div>

                    <div className="bg-gray-700 p-6 rounded-lg mb-6 text-center">
                        <p className="text-gray-400 text-sm">Current Balance</p>
                        <p className="text-4xl font-bold text-lime-300 mt-1">
                            ₦{currentUser?.walletBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                    </div>

                    {message.text && (
                        <div className={`mb-4 p-3 rounded-md text-sm text-center ${message.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button onClick={() => { setAction('deposit'); setAmount(''); setMessage({type: '', text: ''}); }} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <FaPlusCircle className="mr-2" /> Deposit
                        </button>
                        <button onClick={() => { setAction('withdraw'); setAmount(''); setMessage({type: '', text: ''}); }} className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            <FaMinusCircle className="mr-2" /> Withdraw
                        </button>
                    </div>

                    {action && (
                        <form onSubmit={handleTransaction} className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-lime-300 mb-3 capitalize">{action} Funds</h3>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount (₦)" className="w-full bg-gray-600 border border-gray-500 text-gray-100 placeholder-gray-400 rounded py-2 px-3 mb-3 focus:outline-none focus:ring-2 focus:ring-lime-500" step="0.01" min="0" />
                            <button type="submit" disabled={isProcessing} className="w-full bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                                {isProcessing ? <FaSpinner className="animate-spin inline mr-2" /> : `Confirm ${action}`}
                            </button>
                        </form>
                    )}                   
                    </div>

                    {/* Transaction History Section */}
                    <div className="bg-gray-800 shadow-xl rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-lime-400 mb-4">Transaction History</h2>
                        {isHistoryLoading ? (
                            <div className="flex justify-center items-center p-6">
                                <FaSpinner className="animate-spin h-6 w-6 text-lime-400" />
                                <p className="ml-3">Loading history...</p>
                            </div>
                        ) : historyError ? (
                            <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">
                                <FaExclamationTriangle className="inline mr-2" /> {historyError}
                            </div>
                        ) : transactions.length === 0 ? (
                            <p className="text-center text-gray-400">No transactions yet.</p>
                        ) : (
                            <>
                                <ul className="space-y-4">
                                    {transactions.map(tx => (
                                        <li key={tx._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                                            <div className="flex items-center">
                                                <div className="mr-3">
                                                    <TransactionIcon type={tx.type} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold capitalize text-gray-200">{tx.description || tx.type.replace('_', ' ')}</p>
                                                    <p className="text-xs text-gray-400">{formatTransactionDate(tx.transactionDate)}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold text-lg ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center mt-6">
                                        <button 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
                                        <button 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default WalletPage;
