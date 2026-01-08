const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('monthYear');
const month_nameEl = document.getElementById('month_name');
const task_date = document.getElementById('task_date');

const today = new Date();

let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); 
let currentDay = today.getDate();
const today_date =`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;


async function get_task(Date) { //async pozwala utworzyć await
    if (!Date) return;

    const res = await fetch(`/tasks?Date=${Date}`);
    const out = document.getElementById("taskList");

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }
    const Tasks = await res.json();
    if (Tasks.length === 0){
        out.textContent = `Brak zadań w dniu ${Date}!`;
        return;
    }
    out.textContent = JSON.stringify(Tasks, null, 2);

    out.innerHTML = "";
    Tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task.Title;
        li.style.backgroundColor = task.Color || "#ffff";
        out.appendChild(li);
    });
}

async function add_task() {
    const Title = document.getElementById("Title_add").value;
    const Date = document.getElementById("Date_add").value;
    const Checked = document.getElementById("Checked_add").checked ? 1 : 0;
    const Color = document.getElementById("Color_add").value;
    const Note = document.getElementById("Note_add").value;

    if (!Title || !Date) {
        alert("Wpisz tytuł i date!");
        return;
    }

    const res = await fetch("/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ Title, Date, Checked, Color, Note})
    });

    if (!res.ok) {
        alert("Błąd: " + (await res.text()));
        return;
    }
    alert("Zadanie dodane!");
    document.getElementById("Title_add").value = "";
    document.getElementById("Date_add").value = "";
    document.getElementById("Checked_add").checked = false;
    document.getElementById("Color_add").value = "";
    document.getElementById("Note_add").value = "";
}

async function delete_task() {
    const id = document.getElementById("id_delete").value;
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
    document.getElementById("id_delete").value = "";
}

async function edit_task() {
    const id = document.getElementById("id_edit").value;
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
    document.getElementById("id_edit").value = "";
    document.getElementById("Title_edit").value = "";
    document.getElementById("Date_edit").value = "";
    document.getElementById("Color_edit").value = "";
    document.getElementById("Note_edit").value = "";
}

async function checked_task() {
    const id = document.getElementById("id_checked").value;
    const Checked = document.getElementById("Checked_checked").checked ? 1 : 0;
    if (!id) {
        alert("Podaj id!");
        return;
    }
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
    document.getElementById("id_checked").value = "";
    document.getElementById("Checked_checked").checked = false;
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
    cell.classList.add('selected');
    task_date.textContent = cell.dataset.date;


    get_task(cell.dataset.date);
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
get_task(today_date);
generateCalendar(currentMonth, currentYear);
