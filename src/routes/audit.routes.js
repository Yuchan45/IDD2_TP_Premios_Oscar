const { Router } = require("express");
const auditController = require("../controllers/audit.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", auditController.list);
router.get("/user/:id", auditController.byUser);

module.exports = router;
