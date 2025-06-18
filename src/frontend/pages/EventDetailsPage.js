import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EventCard from '../components/EventCard';
import BettingSlip from '../components/BettingSlip';

const EventDetailsPage = ({ eventId }) => {
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);

  // Mock data for demonstration
  const mockEvent = {
    id: 'f1',
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    time: '19:45',
    date: '2025-05-23',
    isLive: true,
    score: { home: 1, away: 0 },
    stats: {
      possession: { home: 55, away: 45 },
      shots: { home: 12, away: 8 },
      shotsOnTarget: { home: 5, away: 3 },
      corners: { home: 6, away: 4 },
      fouls: { home: 10, away: 12 }
    },
    odds: {
      homeWin: 2.1,
      draw: 3.2,
      awayWin: 3.5,
      additionalMarkets: [
        {
          name: 'Total Goals',
          options: [
            { name: 'Over 2.5', odds: 1.85 },
            { name: 'Under 2.5', odds: 1.95 }
          ]
        },
        {
          name: 'Both Teams to Score',
          options: [
            { name: 'Yes', odds: 1.75 },
            { name: 'No', odds: 2.05 }
          ]
        }
      ]
    }
  };

  const mockRelatedEvents = [
    {
      id: 'f2',
      league: 'Premier League',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      time: '16:00',
      date: '2025-05-24',
      isLive: false
    },
    {
      id: 'f3',
      league: 'Premier League',
      homeTeam: 'Tottenham',
      awayTeam: 'Manchester City',
      time: '15:00',
      date: '2025-05-24',
      isLive: false
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch event details
    setLoading(true);
    
    // In a real implementation, this would be an API call to the backend
    setTimeout(() => {
      setEvent(mockEvent);
      setRelatedEvents(mockRelatedEvents);
      setLoading(false);
    }, 1000);
  }, [eventId]);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{t('common.error')}: {error}</div>;
  }

  if (!event) {
    return <div className="not-found">Event not found</div>;
  }

  return (
    <div className="event-details-page">
      <div className="event-header">
        <div className="event-league">{event.league}</div>
        <div className="event-datetime">
          <span className="event-date">{event.date}</span>
          <span className="event-time">{event.time}</span>
        </div>
      </div>
      
      <div className="event-teams">
        <div className="home-team">
          <div className="team-logo">
            {/* Team logo would be here */}
          </div>
          <div className="team-name">{event.homeTeam}</div>
        </div>
        
        <div className="match-status">
          {event.isLive ? (
            <div className="live-score">
              <div className="score-badge">LIVE</div>
              <div className="score">
                <span className="home-score">{event.score.home}</span>
                <span className="score-separator">:</span>
                <span className="away-score">{event.score.away}</span>
              </div>
              <div className="match-time">45'</div>
            </div>
          ) : (
            <div className="match-time-only">
              <div className="vs">VS</div>
              <div className="time">{event.time}</div>
            </div>
          )}
        </div>
        
        <div className="away-team">
          <div className="team-logo">
            {/* Team logo would be here */}
          </div>
          <div className="team-name">{event.awayTeam}</div>
        </div>
      </div>
      
      {event.isLive && (
        <div className="match-stats">
          <h3>{t('common.statistics')}</h3>
          <div className="stat-row">
            <div className="stat-label">Possession</div>
            <div className="stat-bars">
              <div className="home-bar" style={{ width: `${event.stats.possession.home}%` }}></div>
              <div className="away-bar" style={{ width: `${event.stats.possession.away}%` }}></div>
            </div>
            <div className="stat-values">
              <span className="home-value">{event.stats.possession.home}%</span>
              <span className="away-value">{event.stats.possession.away}%</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-label">Shots</div>
            <div className="stat-values">
              <span className="home-value">{event.stats.shots.home}</span>
              <span className="away-value">{event.stats.shots.away}</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-label">Shots on Target</div>
            <div className="stat-values">
              <span className="home-value">{event.stats.shotsOnTarget.home}</span>
              <span className="away-value">{event.stats.shotsOnTarget.away}</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-label">Corners</div>
            <div className="stat-values">
              <span className="home-value">{event.stats.corners.home}</span>
              <span className="away-value">{event.stats.corners.away}</span>
            </div>
          </div>
          <div className="stat-row">
            <div className="stat-label">Fouls</div>
            <div className="stat-values">
              <span className="home-value">{event.stats.fouls.home}</span>
              <span className="away-value">{event.stats.fouls.away}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="betting-markets">
        <h3>{t('betting.odds')}</h3>
        <div className="main-markets">
          <div className="market-row">
            <button className="market-button" onClick={() => console.log('Bet on home win')}>
              <div className="market-label">{t('betting.homeWin')}</div>
              <div className="market-odds">{event.odds.homeWin}</div>
            </button>
            <button className="market-button" onClick={() => console.log('Bet on draw')}>
              <div className="market-label">{t('betting.draw')}</div>
              <div className="market-odds">{event.odds.draw}</div>
            </button>
            <button className="market-button" onClick={() => console.log('Bet on away win')}>
              <div className="market-label">{t('betting.awayWin')}</div>
              <div className="market-odds">{event.odds.awayWin}</div>
            </button>
          </div>
        </div>
        
        <div className="additional-markets">
          <h4>Additional Markets</h4>
          {event.odds.additionalMarkets.map((market, index) => (
            <div key={index} className="market-container">
              <div className="market-name">{market.name}</div>
              <div className="market-options">
                {market.options.map((option, optIndex) => (
                  <button 
                    key={optIndex} 
                    className="option-button"
                    onClick={() => console.log(`Bet on ${market.name} - ${option.name}`)}
                  >
                    <div className="option-name">{option.name}</div>
                    <div className="option-odds">{option.odds}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="related-events">
        <h3>Related Events</h3>
        <div className="events-list">
          {relatedEvents.map(relEvent => (
            <EventCard key={relEvent.id} event={relEvent} />
          ))}
        </div>
      </div>
      
      <BettingSlip />
    </div>
  );
};

export default EventDetailsPage;
