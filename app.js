const express = require("express");
const db = require("./db/database");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const { parse } = require('json2csv');

dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin_login.html");
});

app.post("/admin", (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).send("Invalid password");
  }

  res.sendFile(__dirname + "/public/admin.html");
});

app.post("/updateFlags", (req, res) => {
  const { password, flags } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(403).send("Invalid password");
  }

  const newFlags = flags.split("\n").map(flag => flag.trim()).filter(flag => flag);

  db.serialize(() => {
    db.run("DELETE FROM flags", err => {
      if (err) {
        return res.status(500).send("Error deleting old flags");
      }

      newFlags.forEach(flag => {
        db.run("INSERT INTO flags(flag) VALUES(?)", [flag], function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log(`${this.lastID} ${flag}`);
        });
      });

      res.send("Flags updated successfully");
    });
  });
});

app.get("/admin/flags", (req, res) => {
  db.all("SELECT * FROM flags", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving flags");
    }
    res.json(rows);
  });
});

app.get("/admin/logs", (req, res) => {
  db.all("SELECT * FROM collections", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving logs");
    }
    res.json(rows);
  });
});

app.get("/admin/download/sqlite", (req, res) => {
  res.download("./flaggame.db", "flaggame.db");
});

app.get("/admin/download/csv", (req, res) => {
  db.all("SELECT * FROM collections", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving logs");
    }

    const fields = ["flag_id", "user", "collectedAt"];
    const opts = { fields };

    try {
      const csv = parse(rows, opts);
      fs.writeFileSync("./collections.csv", csv);
      res.download("./collections.csv", "collections.csv");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating CSV");
    }
  });
});

// Collect flag via form submission
app.post("/sendFlag", (req, res) => {
  const { flag, username } = req.body;
  console.log(flag, username);

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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
