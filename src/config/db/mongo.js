const mongoose = require("mongoose");
const env = require("../env");

async function connectMongo() {
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

async function disconnectMongo() {
  await mongoose.disconnect();
}

module.exports = {
  connectMongo,
  disconnectMongo
};
