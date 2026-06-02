const userRepository = require("../repositories/user.repository");
const HttpError = require("../utils/httpError");

function findAll() {
  return userRepository.findAll();
}

async function findById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }
  return user;
}

function create(data) {
  return userRepository.create(data);
}

async function update(id, data) {
  await findById(id);
  return userRepository.update(id, data);
}

async function remove(id) {
  await findById(id);
  return userRepository.remove(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
