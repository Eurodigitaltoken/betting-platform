import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EventCard from './EventCard';

const SportEvents = ({ sportKey }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for demonstration
  const mockEvents = {
    football: [
      {
        id: 'f1',
        league: 'Premier League',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        time: '19:45',
        isLive: true,
        score: { home: 1, away: 0 }
      },
      {
        id: 'f2',
        league: 'La Liga',
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        time: '20:00',
        isLive: false
      },
      {
        id: 'f3',
        league: 'Serie A',
        homeTeam: 'Juventus',
        awayTeam: 'Inter',
        time: '18:30',
        isLive: false
      }
    ],
    basketball: [
      {
        id: 'b1',
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
        time: '21:00',
        isLive: true,
        score: { home: 78, away: 82 }
      },
      {
        id: 'b2',
        league: 'Euroleague',
        homeTeam: 'CSKA Moscow',
        awayTeam: 'Barcelona',
        time: '19:00',
        isLive: false
      }
    ],
    tennis: [
      {
        id: 't1',
        league: 'ATP Masters',
        homeTeam: 'Djokovic',
        awayTeam: 'Nadal',
        time: '15:30',
        isLive: true,
        score: { home: 1, away: 1 }
      },
      {
        id: 't2',
        league: 'WTA',
        homeTeam: 'Williams',
        awayTeam: 'Osaka',
        time: '17:00',
        isLive: false
      }
    ],
    nfl: [
      {
        id: 'n1',
        league: 'NFL',
        homeTeam: 'Chiefs',
        awayTeam: 'Buccaneers',
        time: '22:15',
        isLive: false
      },
      {
        id: 'n2',
        league: 'NFL',
        homeTeam: 'Packers',
        awayTeam: 'Bears',
        time: '20:30',
        isLive: false
      }
    ],
    hockey: [
      {
        id: 'h1',
        league: 'NHL',
        homeTeam: 'Maple Leafs',
        awayTeam: 'Canadiens',
        time: '19:00',
        isLive: true,
        score: { home: 2, away: 3 }
      },
      {
        id: 'h2',
        league: 'NHL',
        homeTeam: 'Bruins',
        awayTeam: 'Rangers',
        time: '20:45',
        isLive: false
      }
    ]
  };

  useEffect(() => {
    // Simulate API call to fetch events
    setLoading(true);
    
    // In a real implementation, this would be an API call to the backend
    setTimeout(() => {
      if (mockEvents[sportKey]) {
        setEvents(mockEvents[sportKey]);
        setLoading(false);
      } else {
        setError('Sport not found');
        setLoading(false);
      }
    }, 1000);
  }, [sportKey]);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{t('common.error')}: {error}</div>;
  }

  return (
    <div className="sport-events">
      <h2>{t(`sports.${sportKey}`)}</h2>
      <div className="events-list">
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="no-events">No events available</div>
        )}
      </div>
    </div>
  );
};

export default SportEvents;
