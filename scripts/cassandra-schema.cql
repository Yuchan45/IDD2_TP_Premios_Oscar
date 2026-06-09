-- Cassandra schema for historical Oscar Awards queries.
-- This keyspace is optimized for read-only historical endpoints.
-- Operational data remains in MongoDB and should be denormalized here when
-- a ceremony is closed.

CREATE KEYSPACE IF NOT EXISTS premios_oscar
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE premios_oscar;

-- GET /api/history/winners?ceremonyId=
-- GET /api/history/winners?ceremonyId=&categoryId=
CREATE TABLE IF NOT EXISTS winners_by_ceremony (
  ceremony_id TEXT,
  category_id TEXT,
  anio INT,
  fecha TEXT,
  lugar TEXT,
  category_name TEXT,
  winner_type TEXT,
  winner_name TEXT,
  movie_id TEXT,
  professional_id TEXT,
  PRIMARY KEY (ceremony_id, category_id)
);

-- GET /api/history/winners?categoryId=
CREATE TABLE IF NOT EXISTS winners_by_category (
  category_id TEXT,
  anio INT,
  ceremony_id TEXT,
  fecha TEXT,
  lugar TEXT,
  category_name TEXT,
  winner_type TEXT,
  winner_name TEXT,
  movie_id TEXT,
  professional_id TEXT,
  PRIMARY KEY (category_id, anio, ceremony_id)
) WITH CLUSTERING ORDER BY (anio DESC, ceremony_id ASC);

-- GET /api/history/nominations?ceremonyId=
CREATE TABLE IF NOT EXISTS nominations_by_ceremony (
  ceremony_id TEXT,
  nomination_id TEXT,
  anio INT,
  fecha TEXT,
  lugar TEXT,
  category_id TEXT,
  category_name TEXT,
  nominee_type TEXT,
  nominee_name TEXT,
  movie_id TEXT,
  professional_id TEXT,
  es_ganador BOOLEAN,
  votos INT,
  PRIMARY KEY (ceremony_id, nomination_id)
);

-- GET /api/history/professionals/top-nominated
CREATE TABLE IF NOT EXISTS professionals_by_nomination_count (
  bucket TEXT,
  nomination_count INT,
  professional_id TEXT,
  nombre_completo TEXT,
  PRIMARY KEY (bucket, nomination_count, professional_id)
) WITH CLUSTERING ORDER BY (nomination_count DESC, professional_id ASC);

-- GET /api/history/professionals/top-awarded
CREATE TABLE IF NOT EXISTS professionals_by_award_count (
  bucket TEXT,
  award_count INT,
  professional_id TEXT,
  nombre_completo TEXT,
  winning_votes_total INT,
  PRIMARY KEY (bucket, award_count, professional_id)
) WITH CLUSTERING ORDER BY (award_count DESC, professional_id ASC);

-- GET /api/history/ceremonies/top-voted
CREATE TABLE IF NOT EXISTS ceremonies_by_vote_count (
  bucket TEXT,
  total_votes INT,
  ceremony_id TEXT,
  anio INT,
  fecha TEXT,
  lugar TEXT,
  PRIMARY KEY (bucket, total_votes, ceremony_id)
) WITH CLUSTERING ORDER BY (total_votes DESC, ceremony_id ASC);

-- GET /api/history/categories/top-participants
CREATE TABLE IF NOT EXISTS categories_by_participant_count (
  bucket TEXT,
  participant_count INT,
  ceremony_id TEXT,
  category_id TEXT,
  anio INT,
  fecha TEXT,
  lugar TEXT,
  category_name TEXT,
  PRIMARY KEY (bucket, participant_count, ceremony_id, category_id)
) WITH CLUSTERING ORDER BY (participant_count DESC, ceremony_id ASC, category_id ASC);
