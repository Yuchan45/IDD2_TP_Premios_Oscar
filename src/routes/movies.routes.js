const { Router } = require("express");
const movieController = require("../controllers/movie.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
  movieIdValidation,
  createMovieValidation,
  updateMovieValidation
} = require("../validations/movie.validation");

const router = Router();

router.get("/", movieController.list);
router.get("/:id", movieIdValidation, validateRequest, movieController.get);
router.post("/", createMovieValidation, validateRequest, movieController.create);
router.put("/:id", updateMovieValidation, validateRequest, movieController.update);
router.delete("/:id", movieIdValidation, validateRequest, movieController.remove);

module.exports = router;
