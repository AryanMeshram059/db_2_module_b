const db = require("../db");

function logAction(actionType, tableName, recordId, userId) {
  db.query(
    `INSERT INTO audit_log 
     (ActionType, TableName, RecordID, PerformedBy)
     VALUES (?, ?, ?, ?)`,
    [actionType, tableName, recordId, userId],
    (err) => {
      if (err) {
        console.error("Logging failed:", err);
      }
    }
  );
}

module.exports = logAction;