import {
  searchTeam,
  findUpcomingMatch,
  getMatchProbabilities
} from './apiSports.js';

export async function getPrediction(homeTeamName, awayTeamName) {
  // 1. Recherche des équipes
  const [homeTeam, awayTeam] = await Promise.all([
    searchTeam(homeTeamName),
    searchTeam(awayTeamName)
  ]);

  if (!homeTeam) throw new Error(`Équipe introuvable : ${homeTeamName}`);
  if (!awayTeam) throw new Error(`Équipe introuvable : ${awayTeamName}`);

  // 2. Match à venir entre ces deux équipes
  const match = await findUpcomingMatch(homeTeam.id, awayTeam.id);
  if (!match) {
    throw new Error('Aucun match à venir trouvé entre ces deux équipes.');
  }

  // 3. Récupération des probabilités
  const probs = await getMatchProbabilities(match.id);
  if (!probs) {
    throw new Error("L'API n'a pas retourné de probabilités pour ce match.");
  }

  // 4. Normalisation en pourcentages
  return {
    homeWinProb: Math.round((probs.home_win ?? 0) * 100),
    drawProb: Math.round((probs.draw ?? 0) * 100),
    awayWinProb: Math.round((probs.away_win ?? 0) * 100)
  };
}
