import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSpinner, FaExclamationTriangle, FaGlobe, FaFacebook, FaTwitter, FaInstagram, FaFutbol } from 'react-icons/fa';
import './SportsPage.css';

const API_SPORTS_ENDPOINT = 'https://betwise-sport-betting-app.onrender.com/api/live-events/sports-db-events';

const TeamCard = ({ team }) => {
    // A helper to create social links
    const renderSocialLink = (url, Icon, label) => {
        if (!url) return null;
        // Ensure URL has a protocol
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        return (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" title={label} className="text-gray-400 hover:text-lime-400 transition-colors">
                <Icon size={20} />
            </a>
        );
    };

    return (
        <div className="team-card bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 hover:shadow-lime-500/40 transition-all duration-300 ease-in-out flex flex-col">
            {team.strTeamBadge ? (
                <img src={team.strTeamBadge} alt={`${team.strTeam} logo`} className="w-full h-40 object-contain bg-gray-700 p-4" />
            ) : (
                <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
                    <FaFutbol size={52} className="text-gray-500" />
                </div>
            )}
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-lime-400 mb-2">{team.strTeam}</h3>
                <p className="text-sm text-gray-400 mb-1"><strong>League:</strong> {team.strLeague}</p>
                <p className="text-sm text-gray-400 mb-1"><strong>Stadium:</strong> {team.strStadium}</p>
                <p className="text-sm text-gray-400 mb-3"><strong>Formed:</strong> {team.intFormedYear}</p>
                
                <p className="text-gray-300 text-sm leading-relaxed flex-grow description-truncate">
                    {team.strDescriptionEN || 'No description available.'}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-center items-center space-x-4">
                    {renderSocialLink(team.strWebsite, FaGlobe, 'Website')}
                    {renderSocialLink(team.strFacebook, FaFacebook, 'Facebook')}
                    {renderSocialLink(team.strTwitter, FaTwitter, 'Twitter')}
                    {renderSocialLink(team.strInstagram, FaInstagram, 'Instagram')}
                </div>
            </div>
        </div>
    );
};


const SportsPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_SPORTS_ENDPOINT);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // The API returns an object with a 'teams' array
            if (data && Array.isArray(data.teams)) {
                setTeams(data.teams);
            } else {
                console.error("API response is not in the expected format:", data);
                throw new Error("Received an unexpected data format from the server.");
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
            setError(err.message || 'An unknown error occurred. Please try again.');
            setTeams([]); // Clear stale data on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const LoadingIndicator = () => (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <FaSpinner className="animate-spin h-10 w-10 text-lime-400" />
            <p className="text-lg text-gray-300 mt-4">Loading sports teams...</p>
        </div>
    );

    const ErrorDisplay = () => (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-800 p-6 rounded-lg shadow-xl">
            <FaExclamationTriangle size={48} className="text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load Teams</h3>
            <p className="text-md text-gray-400 text-center mb-4">{error}</p>
            <button onClick={fetchTeams} className="px-6 py-2 bg-lime-500 text-black rounded hover:bg-lime-600 transition-colors">
                🔄 Try Again
            </button>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="sports-page-container bg-black min-h-screen text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-lime-400">Explore Sports Teams</h1>
                        <p className="text-lg text-gray-300 mt-2">Discover details about your favorite teams from TheSportsDB.</p>
                    </header>

                    <main>
                        {loading ? <LoadingIndicator /> : error ? <ErrorDisplay /> : teams.length === 0 ? (
                            <p className="text-gray-500 text-center text-xl mt-8">No teams found.</p>
                        ) : (
                            <div className="team-grid">
                                {teams.map((team) => (
                                    <TeamCard key={team.idTeam} team={team} />
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

export default SportsPage;