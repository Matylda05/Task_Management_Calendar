require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const dbFile = process.env.DB_FILE || './task.db';

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Błąd połączenia z bazą:', err.message);
    } else {
        console.log(`Połączono z bazą SQLite: ${dbFile}`);
    }
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    db.run(`
        CREATE TABLE IF NOT EXISTS task (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Title VARCHAR(100) NOT NULL,
            Date DATE NOT NULL,
            Checked BOOLEAN DEFAULT 0
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS task_details (
            TaskID INTEGER PRIMARY KEY,
            Color VARCHAR(9) DEFAULT '#f9f9f9',
            Note TEXT,
            FOREIGN KEY (TaskID) REFERENCES task(ID) ON DELETE CASCADE
        );
    `);

});

module.exports = db; // eksport połączenia do użycia w server.js