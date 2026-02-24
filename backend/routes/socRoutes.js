const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const Alert = require("../models/Alert");
const ActivityLog = require("../models/ActivityLog");

// Get all alerts (SOC only)
router.get("/alerts", verifyToken, requireRole("admin"), async (req, res) => {
  const alerts = await Alert.findAll({ order: [["createdAt", "DESC"]] });
  res.json(alerts);
});

// Get activity logs
router.get("/logs", verifyToken, requireRole("admin"), async (req, res) => {
  const logs = await ActivityLog.findAll({ order: [["createdAt", "DESC"]] });
  res.json(logs);
});

module.exports = router;