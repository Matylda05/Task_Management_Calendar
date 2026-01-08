const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./task.db', (err) => {
    if (err) {
        console.error('Błąd połączenia z bazą:', err.message);
    } else {
        console.log('Połączono z bazą SQLite.');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS task (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title VARCHAR(100) NOT NULL,
        Date DATE NOT NULL,
        Checked BOOLEAN DEFAULT 0,
        Color VARCHAR(9) DEFAULT '#f9f9f9',
        Note TEXT
        );
    `);
});

module.exports = db; // eksport połączenia do użycia w server.js