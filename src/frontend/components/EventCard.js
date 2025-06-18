import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const EventCard = ({ event }) => {
  const { t } = useTranslation();
  
  // Mock data for demonstration
  const [odds, setOdds] = useState({
    home: 2.1,
    draw: 3.2,
    away: 3.5
  });

  // Simulate odds update
  useEffect(() => {
    const interval = setInterval(() => {
      // Random small fluctuation in odds
      setOdds({
        home: parseFloat((odds.home + (Math.random() * 0.1 - 0.05)).toFixed(2)),
        draw: parseFloat((odds.draw + (Math.random() * 0.1 - 0.05)).toFixed(2)),
        away: parseFloat((odds.away + (Math.random() * 0.1 - 0.05)).toFixed(2))
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [odds]);

  const handleBetClick = (type, odd) => {
    console.log(`Bet placed on ${type} with odds ${odd}`);
    // This would open the betting slip in a real implementation
  };

  return (
    <div className="event-card">
      <div className="event-header">
        <span className="event-league">{event.league}</span>
        <span className="event-time">{event.time}</span>
      </div>
      <div className="event-teams">
        <div className="home-team">{event.homeTeam}</div>
        <div className="vs">vs</div>
        <div className="away-team">{event.awayTeam}</div>
      </div>
      <div className="event-odds">
        <button 
          className="odd-button home" 
          onClick={() => handleBetClick('home', odds.home)}
        >
          <span className="odd-label">{t('betting.homeWin')}</span>
          <span className="odd-value">{odds.home}</span>
        </button>
        <button 
          className="odd-button draw" 
          onClick={() => handleBetClick('draw', odds.draw)}
        >
          <span className="odd-label">{t('betting.draw')}</span>
          <span className="odd-value">{odds.draw}</span>
        </button>
        <button 
          className="odd-button away" 
          onClick={() => handleBetClick('away', odds.away)}
        >
          <span className="odd-label">{t('betting.awayWin')}</span>
          <span className="odd-value">{odds.away}</span>
        </button>
      </div>
      {event.isLive && (
        <div className="live-indicator">
          <span className="live-badge">LIVE</span>
          <span className="live-score">{event.score?.home} - {event.score?.away}</span>
        </div>
      )}
    </div>
  );
};

export default EventCard;
