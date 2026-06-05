const { Router } = require("express");

const router = Router();

router.use("/users", require("./users.routes"));
router.use("/movies", require("./movies.routes"));
router.use("/categories", require("./categories.routes"));
router.use("/professionals", require("./professionals.routes"));
router.use("/ceremonies", require("./ceremonies.routes"));

module.exports = router;
