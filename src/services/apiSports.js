import 'dotenv/config';

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://footballdata.io/api/v1';

async function request(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status}) sur ${endpoint}`);
  }

  return response.json();
}

export async function searchTeam(name) {
  const data = await request(`/teams?search=${encodeURIComponent(name)}`);
  return data?.data?.[0] ?? null;
}

export async function findUpcomingMatch(homeTeamId, awayTeamId) {
  const data = await request(
    `/fixtures/upcoming?team1=${homeTeamId}&team2=${awayTeamId}`
  );
  return data?.data?.[0] ?? null;
}

export async function getMatchProbabilities(matchId) {
  const data = await request(`/matches/${matchId}/probabilities`);
  return data?.data ?? null;
}
