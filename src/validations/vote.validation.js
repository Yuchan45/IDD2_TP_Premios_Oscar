const { body, query } = require("express-validator");

const castVoteValidation = [
  body("idCeremonia").isMongoId(),
  body("nominacionId").isMongoId()
];

const voteQueryValidation = [
  query("idCeremonia").isMongoId(),
  query("idCategoria").optional().isMongoId()
];

module.exports = {
  castVoteValidation,
  voteQueryValidation
};
