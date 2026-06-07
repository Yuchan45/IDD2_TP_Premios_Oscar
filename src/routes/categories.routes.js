const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const validateRequest = require("../middlewares/validateRequest");
const { cache, invalidateCache } = require("../middlewares/cache");
const {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
} = require("../validations/category.validation");

const router = Router();

router.get("/", cache("categories", 120), categoryController.list);
router.get("/:id", categoryIdValidation, validateRequest, cache("categories", 120), categoryController.get);
router.post("/", createCategoryValidation, validateRequest, invalidateCache("categories"), categoryController.create);
router.put("/:id", updateCategoryValidation, validateRequest, invalidateCache("categories"), categoryController.update);
router.delete("/:id", categoryIdValidation, validateRequest, invalidateCache("categories"), categoryController.remove);

module.exports = router;
