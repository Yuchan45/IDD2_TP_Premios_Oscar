const { query } = require("express-validator");

const historyLookupValidation = [
  query("ceremonyId").optional().isMongoId(),
  query("categoryId").optional().isMongoId()
];

const historyLimitValidation = [
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt()
];

module.exports = {
  historyLimitValidation,
  historyLookupValidation
};
