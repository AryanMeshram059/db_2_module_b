const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const logAction = require("../utils/logger");


// 📩 CREATE REQUEST (Student only)
router.post("/request", auth, allowRoles("Student"), (req, res) => {
  const { attendanceId, reason } = req.body;

  logAction(
    "CREATE_REQUEST_ATTEMPT",
    `user=${req.user.id} attendanceId=${attendanceId}`
  );

  db.query(
    `INSERT INTO attendance_request 
     (AttendanceID, StudentID, Reason)
     VALUES (?, ?, ?)`,
    [attendanceId, req.user.id, reason],
    (err, result) => {
      if (err) {
        logAction(
          "CREATE_REQUEST_ERROR",
          `user=${req.user.id} attendanceId=${attendanceId}`
        );
        return res.status(500).send(err);
      }

      logAction(
        "CREATE_REQUEST_SUCCESS",
        `user=${req.user.id} requestId=${result.insertId}`
      );

      res.send("Request submitted ✅");
    }
  );
});


// 📊 VIEW REQUESTS
router.get("/request", auth, (req, res) => {

  logAction(
    "VIEW_REQUESTS",
    `user=${req.user.id} role=${req.user.role}`
  );

  if (req.user.role === "Student") {

    db.query(`
      SELECT 
        ar.*,
        m.Name AS StudentName,
        c.CourseName
      FROM attendance_request ar
      JOIN member m ON ar.StudentID = m.MemberID
      JOIN attendance a ON ar.AttendanceID = a.AttendanceID
      JOIN course c ON a.CourseID = c.CourseID
      WHERE ar.StudentID = ?
    `,
    [req.user.id],
    (err, result) => {
      if (err) {
        logAction("VIEW_REQUESTS_ERROR", `user=${req.user.id}`);
        return res.status(500).send(err);
      }

      logAction(
        "VIEW_REQUESTS_SUCCESS",
        `user=${req.user.id} records=${result.length}`
      );

      res.json(result);
    });

  } else {

    db.query(`
      SELECT 
        ar.*,
        m.Name AS StudentName,
        c.CourseName
      FROM attendance_request ar
      JOIN member m ON ar.StudentID = m.MemberID
      JOIN attendance a ON ar.AttendanceID = a.AttendanceID
      JOIN course c ON a.CourseID = c.CourseID
      ORDER BY ar.RequestDate DESC
    `,
    (err, result) => {
      if (err) {
        logAction("VIEW_REQUESTS_ERROR", `user=${req.user.id}`);
        return res.status(500).send(err);
      }

      logAction(
        "VIEW_REQUESTS_SUCCESS",
        `user=${req.user.id} role=${req.user.role} records=${result.length}`
      );

      res.json(result);
    });

  }
});


// 👑 ADMIN: APPROVE / REJECT
router.put("/request/:id", auth, allowRoles("Admin"), (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  logAction(
    "UPDATE_REQUEST_ATTEMPT",
    `admin=${req.user.id} requestId=${requestId} status=${status}`
  );

  db.query(
    `UPDATE attendance_request
     SET Status = ?, ProcessedBy = ?
     WHERE RequestID = ?`,
    [status, req.user.id, requestId],
    (err) => {
      if (err) {
        logAction(
          "UPDATE_REQUEST_ERROR",
          `admin=${req.user.id} requestId=${requestId}`
        );
        return res.status(500).send(err);
      }

      logAction(
        "UPDATE_REQUEST_SUCCESS",
        `admin=${req.user.id} requestId=${requestId} status=${status}`
      );

      res.send("Request updated ✅");
    }
  );
});

module.exports = router;