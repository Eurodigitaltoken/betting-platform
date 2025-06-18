require('dotenv').config();

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';

// Sport keys mapping
const SPORT_KEYS = {
  football: 'soccer',
  basketball: 'basketball_nba',
  tennis: 'tennis',
  nfl: 'americanfootball_nfl',
  hockey: 'icehockey_nhl'
};

module.exports = {
  ODDS_API_KEY,
  BASE_URL,
  SPORT_KEYS
};
