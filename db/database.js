/** @format */

const sqlite3 = require("sqlite3").verbose();

// Open a database handle
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
    "SCAICT{God damn}",
    "SCAICT{會長不是人}",
    "SCAICT{副會長也不是人}",
    "SCAICT{nggyu000!!!}",
    "SCAICT{everyDay_zeroDay}",
    "SCAICT{yzx_justin_1218 is idiot}",
    "SCAICT{niggnx}",
    "SCAICT{Osga is gay}",
    "SCAICT{uwu}",
    "SCAICT{Y0u_G0T_Pwn_By_dkri3c1_uwu}",
    "SCAICT{Enjoy_th3_Gam3}",
    "SCAICT{Instagram:dkri3c1}",
    "SCAICT{yzx_justin_1218_is_a_Socia1_Mast3r}",
    "SCAICT{as6214327}",
    "SCAICT{Enj0y_Y0ur_liFe_In_SCAICT}",
    "SCAICT{HCVS&&TCIVS>_<}",
    "SCAICT{R0s31ia_1s_tH3_b3sT_Band}",
    "SCAICT{Fur_immer_1s_A_gR3at_a1bUm_fR0m_R0s31ia}",
    "SCAICT{HTML}",
    "SCAICT{<script>alert(1)</script>}",
    "SCAICT{404_not_found}",
    "SCAICT{i_am_a_teapot}",
    "SCAICT{neverGonnaGiveUUp}",
    "SCAICT{sodu}",
    "SCAICT{我昨天才做完這個網站}",
    "SCAICT{TCIACS}",
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
        "CREATE TABLE IF NOT EXISTS collections (flag_id INTEGER, user TEXT, collectedAt TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(flag_id) REFERENCES flags(id))"
    );
    // insert some flags to the first column
    
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
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                });
            }
        });
    });
});

module.exports = db;
