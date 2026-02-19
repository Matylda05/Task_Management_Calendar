require('dotenv').config();

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
    const sql = `
        SELECT t.ID, t.Title, t.Date, t.Checked, d.Color, d.Note
        FROM task t
        LEFT JOIN task_details d ON t.ID = d.TaskID
        WHERE t.Date = ?
        `;
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

    const sqlTask = "INSERT INTO task (Title, Date) VALUES (?, ?)";
    db.run(sqlTask, [Title, Date], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const taskId = this.lastID;

        const sqlDetails = "INSERT INTO task_details (TaskID, Color, Note) VALUES (?, ?, ?)";

        db.run(sqlDetails, [taskId, Color, Note], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Task added",
                id: taskId
            });
        });
    });
});


//"/tasks/:id" odnosi się do jednego konkretnego zadania bo id musi być w url
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { Title, Date, Checked, Color, Note } = req.body;

    const taskFields = [];
    const taskValues = [];

    const detailsFields = [];
    const detailsValues = [];

    if (Title !== undefined) {
        taskFields.push("Title = ?");
        taskValues.push(Title);
    }
    if (Date !== undefined) {
        taskFields.push("Date = ?");
        taskValues.push(Date);
    }
    if (Checked !== undefined) {
        taskFields.push("Checked = ?");
        taskValues.push(Checked);
    }
    if (Color !== undefined) {
        detailsFields.push("Color = ?");
        detailsValues.push(Color);
    }
    if (Note !== undefined) {
        detailsFields.push("Note = ?");
        detailsValues.push(Note);
    }

    if (taskFields.length === 0 && detailsFields.length === 0) {
        return res.status(400).json({ error: "No data to update" });
    }

    const finishResponse = () => {
        res.json({ message: "Task updated" });
    };

    const updateTask = (callback) => {
        if (taskFields.length === 0) return callback();

        const sql = `UPDATE task SET ${taskFields.join(", ")} WHERE ID = ?`;
        taskValues.push(id);

        db.run(sql, taskValues, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0)
                return res.status(404).json({ error: "Task not found" });

            callback();
        });
    };

    const updateDetails = () => {
        if (detailsFields.length === 0) return finishResponse();

        const sql = `UPDATE task_details SET ${detailsFields.join(", ")} WHERE TaskID = ?`;
        detailsValues.push(id);

        db.run(sql, detailsValues, function (err) {
            if (err) return res.status(500).json({ error: err.message });

            finishResponse();
        });
    };

    updateTask(updateDetails);
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

