const { getCassandraClient } = require("../config/db/cassandra");

const HISTORY_TABLES = [
  "winners_by_ceremony",
  "winners_by_category",
  "nominations_by_ceremony",
  "professionals_by_nomination_count",
  "professionals_by_award_count",
  "ceremonies_by_vote_count",
  "categories_by_participant_count"
];

function rowToObject(row) {
  return row.toJSON ? row.toJSON() : row;
}

async function execute(query, params = [], options = { prepare: true }) {
  const client = getCassandraClient();
  return client.execute(query, params, options);
}

async function executeMany(query, items) {
  if (!items.length) {
    return;
  }

  const client = getCassandraClient();
  await client.batch(
    items.map((params) => ({ query, params })),
    { prepare: true }
  );
}

async function clearHistory() {
  for (const tableName of HISTORY_TABLES) {
    await execute(`TRUNCATE ${tableName}`, [], { prepare: false });
  }
}

async function insertWinnersByCeremony(items) {
  await executeMany(
    `INSERT INTO winners_by_ceremony (
      ceremony_id, category_id, anio, fecha, lugar, category_name,
      winner_type, winner_name, movie_id, professional_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    items.map((item) => [
      item.ceremonyId,
      item.categoryId,
      item.anio,
      item.fecha,
      item.lugar,
      item.categoryName,
      item.winnerType,
      item.winnerName,
      item.movieId,
      item.professionalId
    ])
  );
}

async function insertWinnersByCategory(items) {
  await executeMany(
    `INSERT INTO winners_by_category (
      category_id, anio, ceremony_id, fecha, lugar, category_name,
      winner_type, winner_name, movie_id, professional_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    items.map((item) => [
      item.categoryId,
      item.anio,
      item.ceremonyId,
      item.fecha,
      item.lugar,
      item.categoryName,
      item.winnerType,
      item.winnerName,
      item.movieId,
      item.professionalId
    ])
  );
}

async function insertNominationsByCeremony(items) {
  await executeMany(
    `INSERT INTO nominations_by_ceremony (
      ceremony_id, nomination_id, anio, fecha, lugar, category_id, category_name,
      nominee_type, nominee_name, movie_id, professional_id, es_ganador, votos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    items.map((item) => [
      item.ceremonyId,
      item.nominationId,
      item.anio,
      item.fecha,
      item.lugar,
      item.categoryId,
      item.categoryName,
      item.nomineeType,
      item.nomineeName,
      item.movieId,
      item.professionalId,
      item.esGanador,
      item.votos
    ])
  );
}

async function insertProfessionalsByNominationCount(items) {
  await executeMany(
    `INSERT INTO professionals_by_nomination_count (
      bucket, nomination_count, professional_id, nombre_completo
    ) VALUES (?, ?, ?, ?)`,
    items.map((item) => [
      "global",
      item.nominationCount,
      item.professionalId,
      item.nombreCompleto
    ])
  );
}

async function insertProfessionalsByAwardCount(items) {
  await executeMany(
    `INSERT INTO professionals_by_award_count (
      bucket, award_count, professional_id, nombre_completo, winning_votes_total
    ) VALUES (?, ?, ?, ?, ?)`,
    items.map((item) => [
      "global",
      item.awardCount,
      item.professionalId,
      item.nombreCompleto,
      item.winningVotesTotal
    ])
  );
}

async function insertCeremoniesByVoteCount(items) {
  await executeMany(
    `INSERT INTO ceremonies_by_vote_count (
      bucket, total_votes, ceremony_id, anio, fecha, lugar
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    items.map((item) => [
      "global",
      item.totalVotes,
      item.ceremonyId,
      item.anio,
      item.fecha,
      item.lugar
    ])
  );
}

async function insertCategoriesByParticipantCount(items) {
  await executeMany(
    `INSERT INTO categories_by_participant_count (
      bucket, participant_count, ceremony_id, category_id, anio, fecha, lugar, category_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    items.map((item) => [
      "global",
      item.participantCount,
      item.ceremonyId,
      item.categoryId,
      item.anio,
      item.fecha,
      item.lugar,
      item.categoryName
    ])
  );
}

async function findWinners({ ceremonyId, categoryId }) {
  if (!ceremonyId && !categoryId) {
    const result = await execute(
      `SELECT * FROM winners_by_ceremony`,
      [],
      { prepare: false }
    );
    return result.rows.map(rowToObject);
  }

  if (ceremonyId && categoryId) {
    const result = await execute(
      `SELECT * FROM winners_by_ceremony WHERE ceremony_id = ? AND category_id = ?`,
      [ceremonyId, categoryId]
    );
    return result.rows.map(rowToObject);
  }

  if (ceremonyId) {
    const result = await execute(
      `SELECT * FROM winners_by_ceremony WHERE ceremony_id = ?`,
      [ceremonyId]
    );
    return result.rows.map(rowToObject);
  }

  const result = await execute(
    `SELECT * FROM winners_by_category WHERE category_id = ?`,
    [categoryId]
  );
  return result.rows.map(rowToObject);
}

async function findAwards(filters) {
  return findWinners(filters);
}

async function findTopNominated() {
  const result = await execute(
    `SELECT professional_id, nombre_completo, nomination_count
     FROM professionals_by_nomination_count
     WHERE bucket = 'global'`
  );
  return result.rows.map(rowToObject);
}

async function findTopAwarded() {
  const result = await execute(
    `SELECT professional_id, nombre_completo, award_count, winning_votes_total
     FROM professionals_by_award_count
     WHERE bucket = 'global'`
  );
  return result.rows.map(rowToObject);
}

async function findTopVotedCeremonies() {
  const result = await execute(
    `SELECT ceremony_id, anio, fecha, lugar, total_votes
     FROM ceremonies_by_vote_count
     WHERE bucket = 'global'`
  );
  return result.rows.map(rowToObject);
}

async function findTopParticipantCategories() {
  const result = await execute(
    `SELECT ceremony_id, category_id, anio, fecha, lugar, category_name, participant_count
     FROM categories_by_participant_count
     WHERE bucket = 'global'`
  );
  return result.rows.map(rowToObject);
}

module.exports = {
  clearHistory,
  insertWinnersByCeremony,
  insertWinnersByCategory,
  insertNominationsByCeremony,
  insertProfessionalsByNominationCount,
  insertProfessionalsByAwardCount,
  insertCeremoniesByVoteCount,
  insertCategoriesByParticipantCount,
  findWinners,
  findAwards,
  findTopNominated,
  findTopAwarded,
  findTopVotedCeremonies,
  findTopParticipantCategories
};
