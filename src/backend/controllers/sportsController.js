const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const axios = require('axios');
const redis = require('../config/redis');
const { ODDS_API_KEY, BASE_URL, SPORT_KEYS } = require('../config/odds-api');

// Cache TTL in seconds
const CACHE_TTL = 300; // 5 minutes

// Get all supported sports
router.get('/sports', async (req, res) => {
  try {
    // Check cache first
    const cachedSports = await redis.get('sports');
    if (cachedSports) {
      return res.json(JSON.parse(cachedSports));
    }

    // If not in cache, get from database or API
    const sports = [
      { id: 'football', name: 'Football' },
      { id: 'basketball', name: 'Basketball' },
      { id: 'tennis', name: 'Tennis' },
      { id: 'nfl', name: 'NFL' },
      { id: 'hockey', name: 'Hockey' }
    ];

    // Store in cache
    await redis.setex('sports', CACHE_TTL, JSON.stringify(sports));

    res.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
});

// Get events by sport
router.get('/sports/:sportId/events', async (req, res) => {
  try {
    const { sportId } = req.params;
    
    // Validate sport
    if (!SPORT_KEYS[sportId]) {
      return res.status(400).json({ error: 'Invalid sport ID' });
    }

    // Check cache first
    const cacheKey = `events:${sportId}`;
    const cachedEvents = await redis.get(cacheKey);
    if (cachedEvents) {
      return res.json(JSON.parse(cachedEvents));
    }

    // If not in cache, fetch from The Odds API
    const response = await axios.get(`${BASE_URL}/sports/${SPORT_KEYS[sportId]}/odds`, {
      params: {
        apiKey: ODDS_API_KEY,
        regions: 'eu',
        markets: 'h2h',
        oddsFormat: 'decimal'
      }
    });

    // Transform API response to our format
    const events = response.data.map(event => ({
      id: event.id,
      league: event.sport_title,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      time: new Date(event.commence_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(event.commence_time).toLocaleDateString('en-US'),
      isLive: new Date(event.commence_time) <= new Date(),
      odds: {
        homeWin: event.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === event.home_team)?.price || 2.0,
        draw: event.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === 'Draw')?.price || 3.0,
        awayWin: event.bookmakers[0]?.markets[0]?.outcomes.find(o => o.name === event.away_team)?.price || 3.5
      }
    }));

    // Store in cache
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(events));

    // Store in database for historical data
    for (const event of events) {
      await query(
        'INSERT INTO events (id, sport_id, league, home_team, away_team, commence_time, odds_data) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET odds_data = $7',
        [event.id, sportId, event.league, event.homeTeam, event.awayTeam, new Date(event.date + ' ' + event.time), JSON.stringify(event.odds)]
      );
    }

    res.json(events);
  } catch (error) {
    console.error(`Error fetching events for sport ${req.params.sportId}:`, error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event details
router.get('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check cache first
    const cacheKey = `event:${eventId}`;
    const cachedEvent = await redis.get(cacheKey);
    if (cachedEvent) {
      return res.json(JSON.parse(cachedEvent));
    }

    // If not in cache, get from database
    const result = await query('SELECT * FROM events WHERE id = $1', [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];
    
    // Transform database record to our format
    const formattedEvent = {
      id: event.id,
      league: event.league,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      time: new Date(event.commence_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(event.commence_time).toLocaleDateString('en-US'),
      isLive: new Date(event.commence_time) <= new Date(),
      odds: event.odds_data
    };

    // If event is live, fetch additional data
    if (formattedEvent.isLive) {
      // In a real implementation, this would fetch live scores and stats
      formattedEvent.score = { home: 1, away: 0 };
      formattedEvent.stats = {
        possession: { home: 55, away: 45 },
        shots: { home: 12, away: 8 },
        shotsOnTarget: { home: 5, away: 3 },
        corners: { home: 6, away: 4 },
        fouls: { home: 10, away: 12 }
      };
    }

    // Store in cache
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(formattedEvent));

    res.json(formattedEvent);
  } catch (error) {
    console.error(`Error fetching event details for ${req.params.eventId}:`, error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Get live events
router.get('/events/live', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'events:live';
    const cachedEvents = await redis.get(cacheKey);
    if (cachedEvents) {
      return res.json(JSON.parse(cachedEvents));
    }

    // If not in cache, get from database
    const result = await query(
      'SELECT * FROM events WHERE commence_time <= NOW() AND commence_time >= NOW() - INTERVAL \'2 hours\''
    );
    
    // Transform database records to our format
    const liveEvents = result.rows.map(event => ({
      id: event.id,
      sport: event.sport_id,
      league: event.league,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      time: new Date(event.commence_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
      // In a real implementation, this would fetch live scores
      score: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) }
    }));

    // Store in cache
    await redis.setex(cacheKey, 60, JSON.stringify(liveEvents)); // shorter TTL for live events

    res.json(liveEvents);
  } catch (error) {
    console.error('Error fetching live events:', error);
    res.status(500).json({ error: 'Failed to fetch live events' });
  }
});

module.exports = router;
