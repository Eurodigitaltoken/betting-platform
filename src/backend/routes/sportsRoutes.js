const express = require('express');
const router = express.Router();

// Mock sports events data
const sportsEvents = [
  {
    id: 1,
    sport: 'Football',
    league: 'Premier League',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    odds: {
      home: 2.5,
      draw: 3.2,
      away: 2.8
    },
    status: 'upcoming'
  },
  {
    id: 2,
    sport: 'Football',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    odds: {
      home: 2.1,
      draw: 3.5,
      away: 3.2
    },
    status: 'upcoming'
  },
  {
    id: 3,
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    odds: {
      home: 1.9,
      away: 1.8
    },
    status: 'upcoming'
  },
  {
    id: 4,
    sport: 'Tennis',
    league: 'ATP',
    homeTeam: 'Novak Djokovic',
    awayTeam: 'Rafael Nadal',
    startTime: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
    odds: {
      home: 1.7,
      away: 2.1
    },
    status: 'upcoming'
  }
];

// Get all sports events
router.get('/events', (req, res) => {
  try {
    const { sport, status } = req.query;
    
    let filteredEvents = sportsEvents;
    
    if (sport) {
      filteredEvents = filteredEvents.filter(event => 
        event.sport.toLowerCase() === sport.toLowerCase()
      );
    }
    
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }
    
    res.json({
      success: true,
      events: filteredEvents
    });
  } catch (error) {
    console.error('Error fetching sports events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event by ID
router.get('/events/:id', (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = sportsEvents.find(event => event.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available sports
router.get('/sports', (req, res) => {
  try {
    const sports = [...new Set(sportsEvents.map(event => event.sport))];
    
    res.json({
      success: true,
      sports
    });
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

