const express = require('express');
const path = require('path');
const db = require('./db');
//zaladowanie bibliotek i bazy danych

const app = express(); //zmienna reprezentująca serwer
const PORT = process.env.PORT || 4000;

app.use(express.json()); //Każde przychodzące żądanie z Content-Type: application/json zostanie automatycznie przekształcone w obiekt js
app.use(express.static(path.join(__dirname, "public")));


app.get('/tasks', (req, res) => {
    const sql = 'SELECT * FROM task'; 
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }else if (!rows || rows.length === 0) {
            response.status(404).json({ error: "No tasks found" });
            return;
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

