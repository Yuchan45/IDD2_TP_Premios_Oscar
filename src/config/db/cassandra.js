const { Client } = require("cassandra-driver");
const env = require("../env");
const { logger } = require("../logger");

let cassandraClient;

const schemaStatements = [
  `CREATE KEYSPACE IF NOT EXISTS ${env.cassandra.keyspace}
   WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 }`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.winners_by_ceremony (
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
  )`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.winners_by_category (
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
  ) WITH CLUSTERING ORDER BY (anio DESC, ceremony_id ASC)`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.nominations_by_ceremony (
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
  )`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.professionals_by_nomination_count (
    bucket TEXT,
    nomination_count INT,
    professional_id TEXT,
    nombre_completo TEXT,
    PRIMARY KEY (bucket, nomination_count, professional_id)
  ) WITH CLUSTERING ORDER BY (nomination_count DESC, professional_id ASC)`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.professionals_by_award_count (
    bucket TEXT,
    award_count INT,
    professional_id TEXT,
    nombre_completo TEXT,
    winning_votes_total INT,
    PRIMARY KEY (bucket, award_count, professional_id)
  ) WITH CLUSTERING ORDER BY (award_count DESC, professional_id ASC)`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.ceremonies_by_vote_count (
    bucket TEXT,
    total_votes INT,
    ceremony_id TEXT,
    anio INT,
    fecha TEXT,
    lugar TEXT,
    PRIMARY KEY (bucket, total_votes, ceremony_id)
  ) WITH CLUSTERING ORDER BY (total_votes DESC, ceremony_id ASC)`,
  `CREATE TABLE IF NOT EXISTS ${env.cassandra.keyspace}.categories_by_participant_count (
    bucket TEXT,
    participant_count INT,
    ceremony_id TEXT,
    category_id TEXT,
    anio INT,
    fecha TEXT,
    lugar TEXT,
    category_name TEXT,
    PRIMARY KEY (bucket, participant_count, ceremony_id, category_id)
  ) WITH CLUSTERING ORDER BY (participant_count DESC, ceremony_id ASC, category_id ASC)`
];

function createClient(options = {}) {
  return new Client({
    contactPoints: [env.cassandra.host],
    localDataCenter: env.cassandra.localDataCenter,
    protocolOptions: { port: env.cassandra.port },
    ...options
  });
}

async function ensureSchema() {
  const adminClient = createClient();
  await adminClient.connect();

  try {
    for (const statement of schemaStatements) {
      await adminClient.execute(statement);
    }
  } finally {
    await adminClient.shutdown();
  }
}

async function connectCassandra() {
  logger.info(
    {
      host: env.cassandra.host,
      port: env.cassandra.port,
      keyspace: env.cassandra.keyspace
    },
    "Connecting to Cassandra"
  );

  await ensureSchema();

  cassandraClient = createClient({ keyspace: env.cassandra.keyspace });
  await cassandraClient.connect();

  logger.info("Cassandra connected");
  return cassandraClient;
}

async function disconnectCassandra() {
  if (!cassandraClient) {
    return;
  }

  logger.info("Disconnecting Cassandra");
  await cassandraClient.shutdown();
  cassandraClient = null;
  logger.info("Cassandra disconnected");
}

function getCassandraClient() {
  if (!cassandraClient) {
    throw new Error("Cassandra client not initialized.");
  }

  return cassandraClient;
}

module.exports = {
  connectCassandra,
  disconnectCassandra,
  getCassandraClient
};
