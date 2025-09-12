const { Router } = require("express");

const router = Router();

router.use("/health", require("./health.route"));
router.use("/", require("./root.route"));

module.exports = router;
