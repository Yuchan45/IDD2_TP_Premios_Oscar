const { body, query } = require("express-validator");

const castVoteValidation = [
  body("userId").isString().trim().notEmpty(),
  body("ceremonyId").isMongoId(),
  body("nominacionId").isMongoId()
];

const voteQueryValidation = [
  query("ceremonyId").isMongoId(),
  query("categoryId").optional().isMongoId(),
  query("userId").optional().isString().trim().notEmpty()
];

module.exports = {
  castVoteValidation,
  voteQueryValidation
};
