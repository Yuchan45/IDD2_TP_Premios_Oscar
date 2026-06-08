const historyRepository = require("../repositories/history.repository");

function sortWinners(rows) {
  return rows.sort((left, right) => {
    if (right.anio !== left.anio) {
      return right.anio - left.anio;
    }

    if (left.categoryName !== right.categoryName) {
      return left.categoryName.localeCompare(right.categoryName);
    }

    return left.winnerName.localeCompare(right.winnerName);
  });
}

function applyInclusiveRankingLimit(rows, limit, valueKey) {
  if (rows.length <= limit) {
    return rows;
  }

  const threshold = rows[limit - 1]?.[valueKey];
  return rows.filter((row, index) => index < limit || row[valueKey] === threshold);
}

function toWinnerPayload(row) {
  return {
    ceremonyId: row.ceremony_id,
    anio: row.anio,
    fecha: row.fecha,
    lugar: row.lugar,
    categoryId: row.category_id,
    categoryName: row.category_name,
    winnerType: row.winner_type,
    winnerName: row.winner_name,
    movieId: row.movie_id,
    professionalId: row.professional_id
  };
}

function findWinners(filters) {
  return historyRepository
    .findWinners(filters)
    .then((rows) => sortWinners(rows.map(toWinnerPayload)));
}

function findAwards(filters) {
  return historyRepository
    .findAwards(filters)
    .then((rows) => sortWinners(rows.map(toWinnerPayload)));
}

function topNominated(limit) {
  return historyRepository.findTopNominated().then((rows) =>
    applyInclusiveRankingLimit(rows, limit, "nomination_count").map((row) => ({
      professionalId: row.professional_id,
      nombreCompleto: row.nombre_completo,
      nominationCount: row.nomination_count
    }))
  );
}

function topAwarded(limit) {
  return historyRepository.findTopAwarded().then((rows) =>
    applyInclusiveRankingLimit(rows, limit, "award_count").map((row) => ({
      professionalId: row.professional_id,
      nombreCompleto: row.nombre_completo,
      awardCount: row.award_count,
      winningVotesTotal: row.winning_votes_total
    }))
  );
}

function topVotedCeremonies(limit) {
  return historyRepository.findTopVotedCeremonies().then((rows) =>
    applyInclusiveRankingLimit(rows, limit, "total_votes").map((row) => ({
      ceremonyId: row.ceremony_id,
      anio: row.anio,
      fecha: row.fecha,
      lugar: row.lugar,
      totalVotes: row.total_votes
    }))
  );
}

function topParticipantCategories(limit) {
  return historyRepository.findTopParticipantCategories().then((rows) =>
    applyInclusiveRankingLimit(rows, limit, "participant_count").map((row) => ({
      ceremonyId: row.ceremony_id,
      categoryId: row.category_id,
      anio: row.anio,
      fecha: row.fecha,
      lugar: row.lugar,
      categoryName: row.category_name,
      participantCount: row.participant_count
    }))
  );
}

module.exports = {
  findWinners,
  findAwards,
  topNominated,
  topAwarded,
  topVotedCeremonies,
  topParticipantCategories
};
