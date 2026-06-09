-- Query templates for the historical endpoints.
-- The Node.js Cassandra driver should run these as prepared statements.
-- Positional placeholders (?) are shown for driver usage.

USE premios_oscar;

-- GET /api/history/winners?ceremonyId=:ceremonyId
SELECT
  ceremony_id,
  category_id,
  anio,
  fecha,
  lugar,
  category_name,
  winner_type,
  winner_name,
  movie_id,
  professional_id
FROM winners_by_ceremony
WHERE ceremony_id = ?;

-- GET /api/history/winners?ceremonyId=:ceremonyId&categoryId=:categoryId
SELECT
  ceremony_id,
  category_id,
  anio,
  category_name,
  winner_type,
  winner_name,
  movie_id,
  professional_id
FROM winners_by_ceremony
WHERE ceremony_id = ?
  AND category_id = ?;

-- GET /api/history/winners?categoryId=:categoryId
SELECT
  category_id,
  anio,
  ceremony_id,
  fecha,
  lugar,
  category_name,
  winner_type,
  winner_name,
  movie_id,
  professional_id
FROM winners_by_category
WHERE category_id = ?;

-- GET /api/history/nominations?ceremonyId=:ceremonyId
SELECT
  ceremony_id,
  nomination_id,
  anio,
  fecha,
  lugar,
  category_id,
  category_name,
  nominee_type,
  nominee_name,
  movie_id,
  professional_id,
  es_ganador,
  votos
FROM nominations_by_ceremony
WHERE ceremony_id = ?;

-- GET /api/history/professionals/top-nominated
SELECT
  professional_id,
  nombre_completo,
  nomination_count
FROM professionals_by_nomination_count
WHERE bucket = 'global'
LIMIT ?;

-- GET /api/history/professionals/top-awarded
SELECT
  professional_id,
  nombre_completo,
  award_count,
  winning_votes_total
FROM professionals_by_award_count
WHERE bucket = 'global'
LIMIT ?;

-- GET /api/history/ceremonies/top-voted
SELECT
  ceremony_id,
  anio,
  fecha,
  lugar,
  total_votes
FROM ceremonies_by_vote_count
WHERE bucket = 'global'
LIMIT ?;

-- GET /api/history/categories/top-participants
SELECT
  ceremony_id,
  category_id,
  anio,
  fecha,
  lugar,
  category_name,
  participant_count
FROM categories_by_participant_count
WHERE bucket = 'global'
LIMIT ?;
