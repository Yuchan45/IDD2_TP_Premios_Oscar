const { Router } = require("express");
const { body, param } = require("express-validator");
const movieController = require("../controllers/movie.controller");
const validateRequest = require("../middlewares/validateRequest");

const router = Router();

router.get("/", movieController.list);
router.get("/:id", param("id").isMongoId(), validateRequest, movieController.get);
router.post(
  "/",
  [
    body("title").isString().notEmpty(),
    body("releaseYear").isInt({ min: 1888 }),
    body("genre").isString().notEmpty(),
    body("description").optional().isString(),
    body("professionalRoles").optional().isArray()
  ],
  validateRequest,
  movieController.create
);
router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("title").optional().isString().notEmpty(),
    body("releaseYear").optional().isInt({ min: 1888 }),
    body("genre").optional().isString().notEmpty(),
    body("description").optional().isString(),
    body("professionalRoles").optional().isArray()
  ],
  validateRequest,
  movieController.update
);
router.delete("/:id", param("id").isMongoId(), validateRequest, movieController.remove);

module.exports = router;
