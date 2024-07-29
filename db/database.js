const sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database(
    "./flaggame.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    err => {
        if (err) {
            console.error(err.message);
        }
        console.log("Connected to the flag game database.");
    }
);

const flags = [
    "SCAICT{eazy}",
    "SCAICT{M3}",
    "SCAICT{RIP_Chao_Printer}",
    "SCAICT{chao_chaos}",
    "SCAICT{he_need_a_boyfriend}",
    "SCAICT{i_am_gay}",
    "SCAICT{owo}",
];

db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS flags (id INTEGER PRIMARY KEY AUTOINCREMENT, flag TEXT UNIQUE, createdAt TEXT DEFAULT CURRENT_TIMESTAMP)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS collections (flag TEXT, user TEXT, collectedAt TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(flag) REFERENCES flags(flag))"
    );

    flags.forEach(flag => {
        db.get("SELECT * FROM flags WHERE flag = ?", [flag], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (!row) {
                db.run("INSERT INTO flags(flag) VALUES(?)", [flag], function(err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`${this.lastID} ${flag}`);
                });
            }
        });
    });
});

module.exports = db;
