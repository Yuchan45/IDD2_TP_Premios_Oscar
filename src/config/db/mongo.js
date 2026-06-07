const mongoose = require("mongoose");
const env = require("../env");
const { logger } = require("../logger");
const { seedCategories } = require("./seeds/category.seed");
const { seedProfessionals } = require("./seeds/professional.seed");
const { seedMovies } = require("./seeds/movie.seed");
const { seedCeremonies } = require("./seeds/ceremony.seed");

async function connectMongo() {
  logger.info({ mongoUri: env.mongoUri }, "Connecting to MongoDB");
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
  const categorySeedResult = await seedCategories();
  logger.info(categorySeedResult, "MongoDB categories seed completed");
  const professionalSeedResult = await seedProfessionals();
  logger.info(professionalSeedResult, "MongoDB professionals seed completed");
  const movieSeedResult = await seedMovies();
  logger.info(movieSeedResult, "MongoDB movies seed completed");
  const ceremonySeedResult = await seedCeremonies();
  logger.info(ceremonySeedResult, "MongoDB ceremonies seed completed");
  return mongoose.connection;
}

async function disconnectMongo() {
  logger.info("Disconnecting MongoDB");
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}

module.exports = {
  connectMongo,
  disconnectMongo
};
