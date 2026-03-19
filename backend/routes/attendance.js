const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET attendance
router.get("/attendance/:courseId", auth, (req, res) => {
  const courseId = req.params.courseId;

  if (req.user.role === "Student") {

    db.query(`
      SELECT a.*, l.SessionDate, l.StartTime, l.EndTime
      FROM attendance a
      JOIN lecturelog l ON a.SessionID = l.SessionID
      WHERE a.StudentID = ? AND a.CourseID = ?
    `,
    [req.user.id, courseId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });

  } else {

    db.query(`
      SELECT a.*, l.SessionDate, l.StartTime, l.EndTime, m.Name
      FROM attendance a
      JOIN lecturelog l ON a.SessionID = l.SessionID
      JOIN member m ON a.StudentID = m.MemberID
      WHERE a.CourseID = ?
    `,
    [courseId],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json(result);
    });

  }
});
router.get("/courses", auth, (req, res) => {

  db.query(`
    SELECT c.CourseID, c.CourseName
    FROM enrollment e
    JOIN course c ON e.CourseID = c.CourseID
    WHERE e.StudentID = ?
  `,
  [req.user.id],
  (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });

});

module.exports = router;