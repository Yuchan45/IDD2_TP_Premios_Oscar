const ceremonyRepository = require("../repositories/ceremony.repository");
const voteRepository = require("../repositories/vote.repository");
const historyRepository = require("../repositories/history.repository");
const { logger } = require("../config/logger");

function isoDate(value) {
  return new Date(value).toISOString();
}

function nomineeName(nomination) {
  return nomination.pelicula?.titulo || nomination.profesional?.nombreCompleto || "-";
}

function nomineeType(nomination) {
  return nomination.pelicula ? "pelicula" : "profesional";
}

async function rebuildHistoricalProjections() {
  const closedCeremonies = await ceremonyRepository.findAll({ estado: "cerrada" });

  const winnersByCeremony = [];
  const winnersByCategory = [];
  const nominationsByCeremony = [];
  const ceremoniesByVoteCount = [];
  const categoriesByParticipantCount = [];

  const professionalNominationStats = new Map();
  const professionalAwardStats = new Map();

  for (const ceremony of closedCeremonies) {
    const counts = await voteRepository.countsByCeremony({ ceremonyId: ceremony._id.toString() });
    const votesByNominationId = new Map(
      counts.map((count) => [count.nominacionId.toString(), count.votos])
    );
    const totalVotes = counts.reduce((acc, count) => acc + count.votos, 0);
    const participantsByCategory = new Map();

    ceremoniesByVoteCount.push({
      ceremonyId: ceremony._id.toString(),
      anio: ceremony.anio,
      fecha: isoDate(ceremony.fecha),
      lugar: ceremony.lugar,
      totalVotes
    });

    for (const nomination of ceremony.nominaciones) {
      const categoryId = nomination.categoria.id.toString();
      const nominationId = nomination._id.toString();
      const votes = votesByNominationId.get(nominationId) || 0;
      const participantEntry = participantsByCategory.get(categoryId) || {
        ceremonyId: ceremony._id.toString(),
        categoryId,
        anio: ceremony.anio,
        fecha: isoDate(ceremony.fecha),
        lugar: ceremony.lugar,
        categoryName: nomination.categoria.nombre,
        participantCount: 0
      };

      participantEntry.participantCount += 1;
      participantsByCategory.set(categoryId, participantEntry);

      nominationsByCeremony.push({
        ceremonyId: ceremony._id.toString(),
        nominationId,
        anio: ceremony.anio,
        fecha: isoDate(ceremony.fecha),
        lugar: ceremony.lugar,
        categoryId,
        categoryName: nomination.categoria.nombre,
        nomineeType: nomineeType(nomination),
        nomineeName: nomineeName(nomination),
        movieId: nomination.pelicula?.id?.toString() || null,
        professionalId: nomination.profesional?.id?.toString() || null,
        esGanador: nomination.esGanador,
        votos: votes
      });

      if (nomination.profesional?.id) {
        const professionalId = nomination.profesional.id.toString();
        const nominationStats = professionalNominationStats.get(professionalId) || {
          professionalId,
          nombreCompleto: nomination.profesional.nombreCompleto,
          nominationCount: 0
        };
        nominationStats.nominationCount += 1;
        professionalNominationStats.set(professionalId, nominationStats);
      }

      if (!nomination.esGanador) {
        continue;
      }

      const winnerEntry = {
        ceremonyId: ceremony._id.toString(),
        categoryId,
        anio: ceremony.anio,
        fecha: isoDate(ceremony.fecha),
        lugar: ceremony.lugar,
        categoryName: nomination.categoria.nombre,
        winnerType: nomineeType(nomination),
        winnerName: nomineeName(nomination),
        movieId: nomination.pelicula?.id?.toString() || null,
        professionalId: nomination.profesional?.id?.toString() || null
      };

      winnersByCeremony.push(winnerEntry);
      winnersByCategory.push(winnerEntry);

      if (nomination.profesional?.id) {
        const professionalId = nomination.profesional.id.toString();
        const awardStats = professionalAwardStats.get(professionalId) || {
          professionalId,
          nombreCompleto: nomination.profesional.nombreCompleto,
          awardCount: 0,
          winningVotesTotal: 0
        };
        awardStats.awardCount += 1;
        awardStats.winningVotesTotal += votes;
        professionalAwardStats.set(professionalId, awardStats);
      }
    }

    categoriesByParticipantCount.push(...participantsByCategory.values());
  }

  await historyRepository.clearHistory();
  await historyRepository.insertWinnersByCeremony(winnersByCeremony);
  await historyRepository.insertWinnersByCategory(winnersByCategory);
  await historyRepository.insertNominationsByCeremony(nominationsByCeremony);
  await historyRepository.insertProfessionalsByNominationCount(
    [...professionalNominationStats.values()]
  );
  await historyRepository.insertProfessionalsByAwardCount(
    [...professionalAwardStats.values()]
  );
  await historyRepository.insertCeremoniesByVoteCount(ceremoniesByVoteCount);
  await historyRepository.insertCategoriesByParticipantCount(categoriesByParticipantCount);

  const summary = {
    closedCeremonies: closedCeremonies.length,
    winners: winnersByCeremony.length,
    nominations: nominationsByCeremony.length,
    topNominatedProfessionals: professionalNominationStats.size,
    topAwardedProfessionals: professionalAwardStats.size
  };

  logger.info(summary, "Cassandra history projections rebuilt");
  return summary;
}

module.exports = {
  rebuildHistoricalProjections
};
