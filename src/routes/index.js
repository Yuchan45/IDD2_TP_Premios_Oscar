const { Router } = require("express");

const router = Router();

router.use("/users", require("./users.routes"));
router.use("/movies", require("./movies.routes"));
router.use("/categories", require("./categories.routes"));
router.use("/professionals", require("./professionals.routes"));
router.use("/ceremonies", require("./ceremonies.routes"));
router.use("/nominations", require("./nominations.routes"));
router.use("/performances", require("./performances.routes"));

module.exports = router;
