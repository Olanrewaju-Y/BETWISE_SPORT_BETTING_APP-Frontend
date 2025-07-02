import React from 'react';
import { Link } from 'react-router-dom';
import './MatchCard.css';

// A helper to determine the status text and color
const getStatusInfo = (status) => {
    const shortStatus = status?.short;
    const elapsed = status?.elapsed;

    if (['1H', 'HT', '2H'].includes(shortStatus)) {
        return { text: elapsed ? `${elapsed}'` : shortStatus, color: 'bg-red-500 text-white animate-pulse' };
    }
    if (['FT', 'AET', 'PEN'].includes(shortStatus)) {
        return { text: shortStatus, color: 'bg-gray-600 text-gray-200' };
    }
    if (['NS'].includes(shortStatus)) {
        // Not Started, format the time
        return { text: new Date(status.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'bg-lime-500 text-black' };
    }
    // Default for other statuses like PST, SUSP, etc.
    return { text: shortStatus || 'N/A', color: 'bg-yellow-500 text-black' };
};


const MatchCard = ({ match }) => {
    // Safely destructure the nested data from the match object
    const { fixture, teams, goals } = match || {};
    const { status, venue } = fixture || {};
    const { home, away } = teams || {};
    
    // Fallback for invalid match data
    if (!fixture || !teams || !goals) {
        return (
            <div className="match-card-new error">
                <p>Match data unavailable</p>
            </div>
        );
    }

    const statusInfo = getStatusInfo(status);

    return (
        <Link to={`/event/${fixture.id}`} className="match-card-new">
            <div className="card-header">
                <span className="league-info">{fixture.league?.name || 'League'}</span>
                <span className={`status-badge ${statusInfo.color}`}>
                    {statusInfo.text}
                </span>
            </div>
            <div className="card-body">
                <div className="team-info">
                    <img src={home?.logo} alt={`${home?.name} logo`} className="team-logo" />
                    <span className="team-name">{home?.name || 'Home'}</span>
                </div>
                <div className="score-info">
                    <span className="score">
                        {goals?.home ?? '-'}
                    </span>
                    <span className="score-separator">-</span>
                    <span className="score">
                        {goals?.away ?? '-'}
                    </span>
                </div>
                <div className="team-info">
                    <img src={away?.logo} alt={`${away?.name} logo`} className="team-logo" />
                    <span className="team-name">{away?.name || 'Away'}</span>
                </div>
            </div>
            <div className="card-footer">
                <span className="venue-info">{venue?.name || 'Venue not available'}</span>
            </div>
        </Link>
    );
};

export default MatchCard;
