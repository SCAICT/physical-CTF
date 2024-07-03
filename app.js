/** @format */

const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./db/database");
const bodyParser = require('body-parser');

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/list", (req, res) => {
  db.all(
      "SELECT user, COUNT(flag_id) AS score FROM collections GROUP BY user ORDER BY score DESC",
      [],
      (err, rows) => {
          if (err) {
              res.status(500).send("搜尋時出現錯誤");
              return;
          }
          res.json(rows);
      }
  );
});

app.get("/flag", (req, res) => {
    res.sendFile(__dirname + "/public/flag.html");
});

// Collect flag via form submission
app.post("/sendFlag", (req, res) => {
  const { flag, username } = req.body;
  console.log(flag,username);
  res.cookie("username", username, { maxAge: 86400000, httpOnly: true }); // 24-hour cookie

  // Check if the flag exists
  db.get("SELECT id FROM flags WHERE flag = ?", [flag], (err, row) => {
      if (err) {
          return res.status(500).send("搜尋時出現錯誤");
      }
      if (!row) {
          return res.send("這個旗子不存在"); // No flag found, return "Flag doesn't exist"
      }

      // Flag exists, now check if this user has already reported this flag
      db.get("SELECT * FROM collections WHERE flag_id = ? AND user = ?", [row.id, username], (err, rowExists) => {
          if (err) {
              return res.status(500).send("Error checking flag collection");
          }
          if (rowExists) {
              return res.send("這個旗子你已經蒐集過囉"); // Flag already collected by this user
          }

          // Flag exists and not yet reported by this user, insert new collection
          db.run("INSERT INTO collections (flag_id, user) VALUES (?, ?)", [row.id, username], err => {
              if (err) {
                  return res.status(500).send("Error inserting collection");
              }
              res.send(`${username} 成功蒐集 ${flag}`);
          });
      });
  });
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
