const express = require("express");
const db = require("./db/database");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const { parse } = require('json2csv');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/list", (req, res) => {
  db.all(
    "SELECT user, COUNT(flag) AS score FROM collections GROUP BY user ORDER BY score DESC",
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
  if (req.session.isAdmin) {
    res.sendFile(__dirname + "/public/admin.html");
  } else {
    res.sendFile(__dirname + "/public/admin_login.html");
  }
});

app.post("/admin", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.sendFile(__dirname + "/public/admin.html");
  } else {
    res.status(403).send("密碼錯誤");
  }
});

app.post("/updateFlags", (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("未登入");
  }

  const { flags } = req.body;
  const newFlags = flags.split("\n").map(flag => flag.trim()).filter(flag => flag);

  db.serialize(() => {
    // Get all existing flags
    db.all("SELECT flag FROM flags", (err, rows) => {
      if (err) {
        return res.status(500).send("獲取現有旗子時發生錯誤");
      }
  
      const existingFlags = rows.map(row => row.flag);
  
      // Find flags to delete
      const flagsToDelete = existingFlags.filter(flag => !newFlags.includes(flag));
  
      // Find flags to add
      const flagsToAdd = newFlags.filter(flag => !existingFlags.includes(flag));
  
      // Delete flags
      const deleteTasks = flagsToDelete.map(flag => {
        return new Promise((resolve, reject) => {
          db.run("DELETE FROM flags WHERE flag = ?", [flag], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });
  
      // Add new flags
      const addTasks = flagsToAdd.map(flag => {
        return new Promise((resolve, reject) => {
          db.run("INSERT INTO flags(flag) VALUES(?)", [flag], function(err) {
            if (err) {
              reject(err);
            } else {
              console.log(`${this.lastID} ${flag}`);
              resolve();
            }
          });
        });
      });
  
      // Run all tasks and send response
      Promise.all([...deleteTasks, ...addTasks])
        .then(() => {
          res.send("旗子更新成功！");
        })
        .catch(err => {
          console.error(err.message);
          res.status(500).send("更新旗子時發生錯誤");
        });
    });
  });
  
});

app.get("/admin/flags", (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("未登入");
  }

  db.all("SELECT * FROM flags", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving flags");
    }
    res.json(rows);
  });
});

app.get("/admin/logs", (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("未登入");
  }

  db.all("SELECT * FROM collections", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving logs");
    }
    res.json(rows);
  });
});

app.get("/admin/download/sqlite", (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("未登入");
  }
  res.download("./flaggame.db", "flaggame.db");
});

app.get("/admin/download/csv", (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).send("未登入");
  }

  db.all("SELECT * FROM collections", (err, rows) => {
    if (err) {
      return res.status(500).send("Error retrieving logs");
    }

    const fields = ["flag", "user", "collectedAt"];
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
  db.get("SELECT flag FROM flags WHERE flag = ?", [flag], (err, row) => {
    if (err) {
      return res.status(500).send("搜尋時出現錯誤");
    }
    if (!row) {
      return res.send("這個旗子不存在"); // No flag found, return "Flag doesn't exist"
    }

    // Flag exists, now check if this user has already reported this flag
    db.get("SELECT * FROM collections WHERE flag = ? AND user = ?", [flag, username], (err, rowExists) => {
      if (err) {
        return res.status(500).send("Error checking flag collection");
      }
      if (rowExists) {
        return res.send("這個旗子你已經蒐集過囉"); // Flag already collected by this user
      }

      // Flag exists and not yet reported by this user, insert new collection
      db.run("INSERT INTO collections (flag, user) VALUES (?, ?)", [flag, username], err => {
        if (err) {
          return res.status(500).send("Error inserting collection");
        }
        res.send(`${username} 成功蒐集 ${flag}`);
      });
    });
  });
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.send("Logged out successfully");
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
