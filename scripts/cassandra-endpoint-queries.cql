-- Query templates for the historical endpoints.
-- The Node.js Cassandra driver should run these as prepared statements.
-- Positional placeholders (?) are shown for driver usage.

USE premios_oscar;

-- GET /api/history/winners?ceremonyId=:ceremonyId
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
  category_id,
  category_name,
  nominee_type,
  nominee_name,
  movie_id,
  professional_id,
  es_ganador
FROM nominations_by_ceremony
WHERE ceremony_id = ?;

-- GET /api/history/votes?ceremonyId=:ceremonyId&categoryId=:categoryId
-- Devuelve el detalle de votos por nominación, ya ordenado de mayor a menor por la
-- clustering key (votos DESC).
SELECT
  ceremony_id,
  category_id,
  votos,
  nomination_id,
  anio,
  category_name,
  nominee_type,
  nominee_name,
  movie_id,
  professional_id,
  es_ganador
FROM vote_results_by_ceremony
WHERE ceremony_id = ?
  AND category_id = ?;

-- GET /api/history/movies/top-awarded
SELECT
  movie_id,
  titulo,
  award_count
FROM movies_by_award_count
WHERE bucket = 'global'
LIMIT ?;

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
  award_count
FROM professionals_by_award_count
WHERE bucket = 'global'
LIMIT ?;
