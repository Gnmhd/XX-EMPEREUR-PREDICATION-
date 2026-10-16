import 'dotenv/config';

const FOOTBALL_KEY = process.env.FOOTBALL_KEY;
const ODDS_API_KEY = process.env.ODDS_API;
const FOOTBALL_BASE_URL = 'https://footballdata.io/api/v1';
// ⚠️ Remplace cette URL par celle de ton fournisseur de cotes (ex: The Odds API)
const ODDS_BASE_URL = 'https://api.the-odds-api.com/v4';

async function requestFootball(endpoint) {
  const response = await fetch(`${FOOTBALL_BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${FOOTBALL_KEY}`, Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Erreur Football API (${response.status})`);
  return response.json();
}

export async function searchTeam(name) {
  const data = await requestFootball(`/teams?search=${encodeURIComponent(name)}`);
  return data?.data?.[0] ?? null;
}

export async function findUpcomingMatch(homeTeamId, awayTeamId) {
  const data = await requestFootball(`/fixtures/upcoming?team1=${homeTeamId}&team2=${awayTeamId}`);
  return data?.data?.[0] ?? null;
}

export async function getMatchProbabilities(matchId) {
  const data = await requestFootball(`/matches/${matchId}/probabilities`);
  return data?.data ?? null;
}

// Nouvelle fonction pour récupérer les cotes
export async function getOdds(homeTeamName, awayTeamName) {
  try {
    // Exemple avec The Odds API (à adapter selon ton fournisseur)
    const sport = 'soccer_france_ligue_one'; // À adapter selon la ligue
    const url = `${ODDS_BASE_URL}/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Cherche le match correspondant (simplifié)
    const match = data.find(m => 
      m.home_team.includes(homeTeamName) && m.away_team.includes(awayTeamName)
    );
    
    if (!match || !match.bookmakers?.[0]?.markets?.[0]?.outcomes) return null;
    
    const outcomes = match.bookmakers[0].markets[0].outcomes;
    return {
      home: outcomes.find(o => o.name === match.home_team)?.price ?? 'N/A',
      draw: outcomes.find(o => o.name === 'Draw')?.price ?? 'N/A',
      away: outcomes.find(o => o.name === match.away_team)?.price ?? 'N/A'
    };
  } catch (error) {
    console.warn('Impossible de récupérer les cotes:', error.message);
    return null;
  }
}
