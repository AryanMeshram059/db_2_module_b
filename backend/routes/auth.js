const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM member WHERE Email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.length === 0) {
        return res.status(401).send("User not found");
      }

      const user = result[0];

      // TEMP (since your DB has fake hashes)
      if (password !== user.PasswordHash) {
        return res.status(401).send("Invalid password");
      }

      const token = jwt.sign(
        {
          id: user.MemberID,
          role: user.Role
        },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

module.exports = router;