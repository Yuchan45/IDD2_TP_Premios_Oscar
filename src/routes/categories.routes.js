const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
} = require("../validations/category.validation");

const router = Router();

router.get("/", categoryController.list);
router.get("/:id", categoryIdValidation, validateRequest, categoryController.get);
router.post("/", createCategoryValidation, validateRequest, categoryController.create);
router.put("/:id", updateCategoryValidation, validateRequest, categoryController.update);
router.delete("/:id", categoryIdValidation, validateRequest, categoryController.remove);

module.exports = router;
