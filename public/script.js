const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const month_nameEl = document.getElementById('month_name');
const task_date = document.getElementById('task_date');
const out = document.getElementById("taskList");

const today = new Date();

let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); 
let currentDay = today.getDate();
const today_date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
let selectedDate = today_date;


async function get_task(Date_task) { //async pozwala utworzyć await
    if (!Date_task) return;

    const res = await fetch(`/tasks?Date=${Date_task}`);

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }
    const Tasks = await res.json();
    out.innerHTML = "";

    if (Tasks.length === 0){
        out.textContent = `Brak zadań w dniu ${Date_task}!`;
        return;
    }

    Tasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.add("task-item");
        li.dataset.id = task.ID;
        li.dataset.title = task.Title;
        li.dataset.date = task.Date;
        li.dataset.color = task.Color;
        li.dataset.note = task.Note ?? "";
        li.style.backgroundColor = task.Color || "#f9f9f9";

        li.innerHTML = `
            <div class="tasklistmain">
                <input type="checkbox" class="task-check" ${task.Checked === 1 ? "checked" : ""}>
                <span>${task.Title}</span>
                <button class="menu-btn">⋮</button>
            <div>
            <hr class="linia">

            <div class="task-menu" style="display:none">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
                <span class="note" id="note">${task.Note === null ? "Notatka:<br> brak" : `Notatka:<br> ${task.Note}`}</span>
            </div>
        `;
        out.appendChild(li);
    });
}

out.addEventListener("click", (e) => {
    if (e.target.classList.contains("menu-btn")) {
        const taskItem = e.target.closest(".task-item");
        const menu = taskItem.querySelector(".task-menu");
        menu.style.display = menu.style.display === "none" ? "block" : "none";
    }
});

out.addEventListener("change", (e) => {
    if (!e.target.classList.contains("task-check")) return;

    const li = e.target.closest(".task-item");
    const id = Number(li.dataset.id);
    const Checked = e.target.checked ? 1 : 0;
    checked_task(id, Checked);

    li.classList.toggle("done", Checked === 1);
});

out.addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit")) return;

    const li = e.target.closest(".task-item");

    const task = {
        ID: li.dataset.id,
        Title: li.dataset.title,
        Date: li.dataset.date,
        Color: li.dataset.color,
        Note: li.dataset.note
    };

    okno_edytuj(task);
});

out.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete")) return;
    const li = e.target.closest(".task-item");
    okno_delete(li.dataset.id);
});

function okno_edytuj(task) {
    const old = document.querySelector(".okno_edytuj_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_edytuj_overlay";

    overlay.innerHTML = `
        <div class="okno_edytuj">
            <section>
                <h2>Edytuj Zadanie</h2>

                <span>Title: </span>
                <input id="Title_edit" value="${task.Title}">
                <span>Date: </span>
                <input type="date" id="Date_edit" value="${task.Date}">
                <span>Color: </span>
                <input type="color" id="Color_edit" value="${task.Color === null ? "#f9f9f9" : task.Color}">
                <span>Note: </span>
                <input id="Note_edit" value="${task.Note}">

                <div class="buttons">
                    <button onclick="edit_task(${task.ID}); zamknij_okno_edytuj()">Save</button>
                    <button onclick="zamknij_okno_edytuj()">Cancel</button>
                </div>
            </section>
        </div>
    `;

    document.body.appendChild(overlay);
}

function okno_delete(id) {
    const old = document.querySelector(".okno_delete_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_delete_overlay";

    overlay.innerHTML = `
        <div class="okno_delete">
            <section>
                <h2>Are you sure you want to delete this task?</h2>

                
                <img src="images/important.png" alt="!">
                <span>You can’t restore this task from the Recycle Bim!!!</span>

                <div class="buttons">
                    <button onclick="delete_task(${id}); zamknij_okno_delete()">Delete</button>
                    <button onclick="zamknij_okno_delete()">Cancel</button>
                </div>
            </section>
        </div>
    `;

    document.body.appendChild(overlay);
}

function okno_add() {
    const old = document.querySelector(".okno_add_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_add_overlay";

    overlay.innerHTML = `
        <div class="okno_add">
            <section>
                <h2>ADD TASK</h2>

                <span>Title: </span>
                <input id="Title_add" value="">
                <span>Date: </span>
                <input type="date" id="Date_add" value="${today_date}">
                <span>Color: </span>
                <input type="color" id="Color_add" value="${"#f9f9f9"}">
                <span>Note: </span>
                <input id="Note_add" value="">

                <div class="buttons">
                    <button onclick="add_task(); zamknij_okno_add()">ADD</button>
                    <button onclick="zamknij_okno_add()">Cancel</button>
                </div>
            </section>
        </div>
    `;

    document.body.appendChild(overlay);
}

function zamknij_okno_edytuj() {
    const overlay = document.querySelector(".okno_edytuj_overlay");
    if (overlay) overlay.remove();
}

function zamknij_okno_delete() {
    const overlay = document.querySelector(".okno_delete_overlay");
    if (overlay) overlay.remove();
}

function zamknij_okno_add() {
    const overlay = document.querySelector(".okno_add_overlay");
    if (overlay) overlay.remove();
}

async function delete_task(id) {
    if (!id) {
        alert("Podaj id!");
        return;
    }

    const res = await fetch(`/tasks/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    });

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }

    alert("Zadanie usunięte!");
    get_task(selectedDate);
}

async function edit_task(id) {
    const Title = document.getElementById("Title_edit").value;
    const Date = document.getElementById("Date_edit").value;
    const Color = document.getElementById("Color_edit").value;
    const Note = document.getElementById("Note_edit").value;
    if (!id) {
        alert("Podaj id!");
        return;
    }
    const body = {};
    if (Title) body.Title = Title;
    if (Date) body.Date = Date;
    if (Color) body.Color = Color;
    if (Note) body.Note = Note;

    const res = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }

    alert("Zadanie edytowane!");
    get_task(selectedDate);
}

async function add_task() {
    const Title = document.getElementById("Title_add").value;
    const Date = document.getElementById("Date_add").value;
    const Color = document.getElementById("Color_add").value;
    const Note = document.getElementById("Note_add").value;
    if (!Title || !Date) {
        alert("Wpisz tytuł i date!");
        return;
    }

    const res = await fetch(`/tasks`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ Title, Date, Color, Note})
    });

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }

    alert("Zadanie Dodane!");
    get_task(selectedDate);
}

async function checked_task(id, Checked) {

    const res = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ Checked })
    });
    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }

    alert("Zadanie wykonane!");
}

function getMonthName(Index) {
    const date = new Date(2026, Index, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
}

function generateCalendar(month, year) {
    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearEl.textContent = `${month + 1}.${year}`;
    month_nameEl.textContent = getMonthName(month);
    
    let html = "<tr>";
    days.forEach(day => html += `<th>${day}</th>`);
    html += "</tr><tr>";

    let dayOfWeek = firstDay === 0 ? 6 : firstDay-1; 
    for (let i = 0; i < dayOfWeek; i++) html += "<td></td>";

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        html += `<td data-date="${dateStr}">${day}</td>`;
        dayOfWeek++;
        if (dayOfWeek % 7 === 0 && day !== daysInMonth) html += "</tr><tr>";
    }
    html += "</tr>";

    calendarEl.innerHTML = html;
}

calendarEl.addEventListener('click', (e) => {
    const cell = e.target.closest('td[data-date]');
    if (!cell) return;

    document.querySelectorAll('#calendar td.selected')
    .forEach(td => td.classList.remove('selected'));

    cell.classList.add('selected');
    task_date.textContent = cell.dataset.date;
    selectedDate = cell.dataset.date;


    get_task(selectedDate);
});


function PrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
};
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
};

get_task(selectedDate);
generateCalendar(currentMonth, currentYear);