const { Router } = require("express");
const movieController = require("../controllers/movie.controller");
const validateRequest = require("../middlewares/validateRequest");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const {
  movieIdValidation,
  createMovieValidation,
  updateMovieValidation
} = require("../validations/movie.validation");

const router = Router();

router.get("/", movieController.list);
router.get("/:id", movieIdValidation, validateRequest, movieController.get);
router.post("/", authenticate, authorize("ADMIN"), createMovieValidation, validateRequest, movieController.create);
router.put("/:id", authenticate, authorize("ADMIN"), updateMovieValidation, validateRequest, movieController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), movieIdValidation, validateRequest, movieController.remove);

module.exports = router;
