const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const logAction=require("../utils/logger");


// 📩 CREATE REQUEST (Student only)
router.post("/request", auth, allowRoles("Student"), (req, res) => {
  const { attendanceId, reason } = req.body;

  db.query(
    `INSERT INTO attendance_request 
     (AttendanceID, StudentID, Reason)
     VALUES (?, ?, ?)`,
    [attendanceId, req.user.id, reason],
    (err, result) => {
      if (err) return res.status(500).send(err);

      // 🔥 LOG HERE
      logAction("INSERT", "attendance_request", result.insertId, req.user.id);

      res.send("Request submitted ✅");
    }
  );
});

// 📊 VIEW REQUESTS
router.get("/request", auth, (req, res) => {

  // 👤 Student → only own requests
  if (req.user.role === "Student") {

    db.query(`
      SELECT ar.*, c.CourseName
      FROM attendance_request ar
      JOIN attendance a ON ar.AttendanceID = a.AttendanceID
      JOIN course c ON a.CourseID = c.CourseID
      WHERE ar.StudentID = ?
    `,
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });

  } else {
    // 👑 Admin → all requests

    db.query(`
      SELECT ar.*, m.Name, c.CourseName
      FROM attendance_request ar
      JOIN member m ON ar.StudentID = m.MemberID
      JOIN attendance a ON ar.AttendanceID = a.AttendanceID
      JOIN course c ON a.CourseID = c.CourseID
    `,
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });

  }
});


// 👑 ADMIN: APPROVE / REJECT
router.put("/request/:id", auth, allowRoles("Admin"), (req, res) => {
  const { status } = req.body;
  const requestId = req.params.id;

  db.query(
    `UPDATE attendance_request
     SET Status = ?, ProcessedBy = ?
     WHERE RequestID = ?`,
    [status, req.user.id, requestId],
    (err) => {
      if (err) return res.status(500).send(err);

      // 🔥 LOG HERE
      logAction("UPDATE", "attendance_request", requestId, req.user.id);

      res.send("Request updated ✅");
    }
  );
});

module.exports = router;