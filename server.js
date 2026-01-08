const express = require('express');
const path = require('path');
const db = require('./db');
//zaladowanie bibliotek i bazy danych

const app = express(); //zmienna reprezentująca serwer
const PORT = process.env.PORT || 4000;

app.use(express.json()); //Każde przychodzące żądanie z Content-Type: application/json zostanie automatycznie przekształcone w obiekt js
app.use(express.static(path.join(__dirname, "public")));

app.get('/tasks', (req, res) => {
    const { Date} = req.query;
    const sql = 'SELECT * FROM task WHERE Date = ?'; 
    db.all(sql, [Date], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post("/tasks", (req, res) => {
    const { Title, Date, Color, Note} = req.body;

    if (!Title || !Date) {
        return res.status(400).json({ error: "Required: title and date" });
    }

    const sql = "INSERT INTO task (Title, Date, Color, Note) VALUES (?, ?, ?, ?)";
    db.run(sql, [Title, Date, Color, Note], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.json({
            message: "Task added",
            id: this.lastID
        });
    });
});


//"/tasks/:id" odnosi się do jednego konkretnego zadania bo id musi być w url
app.put("/tasks/:id", (req, res) => {
    const {id} = req.params;
    const { Title, Date, Checked, Color, Note} = req.body;

    const fields = [];
    const values = [];

    if (Title !== undefined) { //sprawdza czy to pole wogule przyszło w zapytaniu
        fields.push("Title = ?");
        values.push(Title);
    }
    if (Date !== undefined) {
        fields.push("Date = ?");
        values.push(Date);
    }
    if (Checked !== undefined) {
        fields.push("Checked = ?");
        values.push(Checked);
    }
    if (Color !== undefined) {
        fields.push("Color = ?");
        values.push(Color);
    }
    if (Note !== undefined) {
        fields.push("Note = ?");
        values.push(Note);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: "No data to update" });
    }
    const sql = `UPDATE task SET ${fields.join(", ")} WHERE ID = ?`; // tu trzeba użyć `bo inaczej lista się nie wypisze

    values.push(id);

    db.run(sql, values, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0){ //sprawdza ile wierszy w bazie danych zostało zmienionych, jest to po to jakby się wywołało zadanie które nie istnieje wtedy zwróci błąd
            return res.status(404).json({ error: "Task not found"});
        }

        res.json({message: "Task update"});
    });
});

app.delete("/tasks/:id", (req, res) => {
    const {id} = req.params;
    const sql = 'DELETE FROM task WHERE ID = ?';

    db.run(sql, [id], function (err){
        if (err){
            return res.status(500).json({message: err.message});
        }
        if (this.changes === 0){
            return res.status(404).json({message: "Task not found"});
        }
        res.json({message: "Task deleted"});
    })
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

