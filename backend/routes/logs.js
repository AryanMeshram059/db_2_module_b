const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");

// 👑 ADMIN ONLY: VIEW LOGS
router.get("/logs", auth, allowRoles("Admin"), (req, res) => {

  db.query(`
    SELECT 
      al.LogID,
      al.ActionType,
      al.TableName,
      al.RecordID,
      al.PerformedBy,
      al.ActionTime,
      m.Name
    FROM audit_log al
    JOIN member m ON al.PerformedBy = m.MemberID
    ORDER BY al.LogID DESC
  `,
  (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });

});

module.exports = router;