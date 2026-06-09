const { body, param, query } = require("express-validator");

const castVoteValidation = [
  body("idCeremonia").isMongoId(),
  body("nominacionId").isMongoId()
];

const changeVoteValidation = [
  body("idCeremonia").isMongoId(),
  body("nominacionId").isMongoId()
];

const voteQueryValidation = [
  query("idCeremonia").isMongoId(),
  query("idCategoria").optional().isMongoId()
];

const myVotesQueryValidation = [
  query("idCeremonia").optional().isMongoId(),
  query("idCategoria").optional().isMongoId()
];

const myVoteStatusValidation = [
  query("idCeremonia").isMongoId()
];

const nominationVoteStatusValidation = [
  param("nominacionId").isMongoId()
];

module.exports = {
  castVoteValidation,
  changeVoteValidation,
  myVoteStatusValidation,
  myVotesQueryValidation,
  nominationVoteStatusValidation,
  voteQueryValidation
};
