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


async function get_task(Date_task) {
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
        li.classList.add("task_item");
        li.dataset.id = task.ID;
        li.dataset.title = task.Title;
        li.dataset.date = task.Date;
        li.dataset.color = task.Color;
        li.dataset.note = task.Note ?? "";
        li.style.backgroundColor = task.Color || "#f9f9f9";

        li.innerHTML = `
            <div class="tasklistmain">
                <div class="task_header">
                    <input type="checkbox" class="task-check" ${task.Checked === 1 ? "checked" : ""}>
                    <span class="title_tasklistmain">${task.Title}</span>
                    <button class="menu_btn">
                        <img src="images/dots.png" alt="⋮">
                    </button>
                </div>
            <div>
            <hr class="linia">

            <div class="task_menu" style="display:none">
                <textarea readonly class="note_ramka" id="note"rows="4">${task.Note === "" ? "NOTE: brak " : `NOTE: ${task.Note}`}</textarea>
                <div class="task_menu_button">
                    <button class="button edit">EDIT</button>
                    <button class="button delete">DELETE</button>
                <div>
            </div>
        `;
        out.appendChild(li);
    });
}


out.addEventListener("click", (e) => {
    const menuBtn = e.target.closest(".menu_btn");
    if (!menuBtn) return;

    const taskItem = menuBtn.closest(".task_item");
    const menu = taskItem.querySelector(".task_menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
});


out.addEventListener("change", (e) => {
    if (!e.target.classList.contains("task-check")) return;

    const li = e.target.closest(".task_item");
    const id = Number(li.dataset.id);
    const Checked = e.target.checked ? 1 : 0;
    checked_task(id, Checked);

    li.classList.toggle("done", Checked === 1);
});

out.addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit")) return;

    const li = e.target.closest(".task_item");

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
    const li = e.target.closest(".task_item");
    okno_delete(li.dataset.id);
});

function okno_edytuj(task) {
    const old = document.querySelector(".okno_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_overlay";

    overlay.innerHTML = `
        <div class="okno_edytuj">
            <h2>EDIT TASK</h2>
            <div class="okno_edytuj_inside">
                <span>Title: </span>
                <input id="Title_edit" value="${task.Title}">
                <span>Date: </span>
                <input type="date" id="Date_edit" value="${task.Date}">
                <span>Color: </span>
                <div class="color_picker" id="Color_edit">
                    <input type="hidden" id="Color_value_edit" value="${task.Color ?? '#f9f9f9'}">
                    <div class="color_dot" data-color="#F5D76E"></div>
                    <div class="color_dot" data-color="#F39C12"></div>
                    <div class="color_dot" data-color="#C0392B"></div>
                    <div class="color_dot" data-color="#E84393"></div>
                    <div class="color_dot" data-color="#BB8FCE"></div>
                    <div class="color_dot" data-color="#5DADE2"></div>
                    <div class="color_dot" data-color="#58D68D"></div>
                    <div class="color_dot none" data-color="#f9f9f9"></div>
                </div>
                <span>Note: </span>
                <textarea id="Note_edit" rows="4">${task.Note}</textarea>
            </div>
            <div class="buttons">
                    <button class="button_cancel" onclick="zamknij_okno_edytuj()">CANCEL</button>
                    <button class="button" onclick="edit_task(${task.ID}); zamknij_okno_edytuj()">SAVE</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const dots = overlay.querySelectorAll('.color_dot');
    const colorValue = overlay.querySelector('#Color_value_edit');

    dots.forEach(dot => {
        const color = dot.dataset.color;

        if (color) {
            dot.style.backgroundColor = color;
        }

        if (color === colorValue.value) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            colorValue.value = color;
        });
    });
}


function okno_delete(id) {
    const old = document.querySelector(".okno_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_overlay";

    overlay.innerHTML = `
        <div class="okno_delete">
            <section>
                <h2>Are you sure you want to delete this task?</h2>

                
                <img src="images/important.png" alt="!">
                <span>You can’t restore this task from the Recycle Bim!!!</span>

                <div class="buttons">
                    <button class="button" onclick="delete_task(${id}); zamknij_okno_delete()">DELETE</button>
                    <button class="button_cancel" onclick="zamknij_okno_delete()">CANCEL</button>
                </div>
            </section>
        </div>
    `;

    document.body.appendChild(overlay);
}

function okno_add() {
    const old = document.querySelector(".okno_overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "okno_overlay";

    overlay.innerHTML = `
        <div class="okno_add">
            <h2>ADD TASK</h2>
            <div class="okno_add_inside">
                <span>Title: </span>
                <input id="Title_add" value="">
                <span>Date: </span>
                <input type="date" id="Date_add" value="${today_date}">
                <span>Color: </span>
                <div class="color_picker" id="Color_edit">
                    <input type="hidden" id="Color_value_add" value="${'#f9f9f9'}">
                    <div class="color_dot" data-color="#F5D76E"></div>
                    <div class="color_dot" data-color="#F39C12"></div>
                    <div class="color_dot" data-color="#C0392B"></div>
                    <div class="color_dot" data-color="#E84393"></div>
                    <div class="color_dot" data-color="#BB8FCE"></div>
                    <div class="color_dot" data-color="#5DADE2"></div>
                    <div class="color_dot" data-color="#58D68D"></div>
                    <div class="color_dot none" data-color="#f9f9f9"></div>
                </div>
                <span>Note: </span>
                <textarea id="Note_add" value=""></textarea>
            </div>
            <div class="buttons">
                <button class="button_cancel" onclick="zamknij_okno_add()">CANCEL</button>
                <button class="button" onclick="add_task(); zamknij_okno_add()">ADD</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const dots = overlay.querySelectorAll('.color_dot');
    const colorValue = overlay.querySelector('#Color_value_add');

    dots.forEach(dot => {
        const color = dot.dataset.color;

        if (color) {
            dot.style.backgroundColor = color;
        }

        if (color === colorValue.value) {
            dot.classList.add('active');
        }

        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            colorValue.value = color;
        });
    });
}

function zamknij_okno_edytuj() {
    const overlay = document.querySelector(".okno_overlay");
    if (overlay) overlay.remove();
}

function zamknij_okno_delete() {
    const overlay = document.querySelector(".okno_overlay");
    if (overlay) overlay.remove();
}

function zamknij_okno_add() {
    const overlay = document.querySelector(".okno_overlay");
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

    get_task(selectedDate);
}

async function edit_task(id) {
    const Title = document.getElementById("Title_edit").value;
    const Date = document.getElementById("Date_edit").value;
    const Color = document.getElementById('Color_value_edit').value
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

    get_task(selectedDate);
}

async function add_task() {
    const Title = document.getElementById("Title_add").value;
    const Date = document.getElementById("Date_add").value;
    const Color = document.getElementById("Color_value_add").value;
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

}

function getMonthName(Index) {
    const date = new Date(2026, Index, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
}

function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearEl.textContent = `${month + 1}.${year}`;
    month_nameEl.textContent = getMonthName(month);
    
    let html = "<tr>";

    let dayOfWeek = firstDay === 0 ? 6 : firstDay-1; 
    for (let i = 0; i < dayOfWeek; i++) {
        html += `<td class="empty"><span class="day-number pozostale"></span></td>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        
        let classes = "";
        const weekdayIndex = (dayOfWeek) % 7; 
        if (weekdayIndex === 6) { 
            classes += " sunday";
        }
        if (dateStr === today_date) {
            classes += " today";
        }

        html += `
            <td data-date="${dateStr}" class="${classes}">
                <span class="day-number">${day}</span>
            </td>
            `;
        dayOfWeek++;
        if (dayOfWeek % 7 === 0 && day !== daysInMonth) html += "</tr><tr>";
    }
    const remaining = (7 - (dayOfWeek % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
        html += `<td class="empty"><span class="day-number pozostale"></span></td>`;
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


function okno_zmien() {
    if (document.querySelector(".okno_zmien_overlay")) {
        return;
    }
    const overlay = document.createElement("div");
    overlay.className = "okno_zmien_overlay";

    overlay.innerHTML = `
        <div class="okno_zmien">
            <section>
                <label for="Change_year">Change year</label>
                <input type="number" id="Change_year" name="Change_year" min="1900" max="2030" value="2026">
                <label for="Change_month">Change month</label>
                <select id="Change_month" name="Change_month">
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                </select>
                <div class="zmien_buttons">
                <button class="button" id="saveBtn">SAVE</button>
                <button class="button_cancel" onclick="zamknij_okno_zmien()">CLOSE</button>
                </div>
            </section>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById("saveBtn").addEventListener("click", () => {
        const year = document.getElementById("Change_year").value;
        const month = document.getElementById("Change_month").value;
        generateCalendar(parseInt(month), parseInt(year));
        zamknij_okno_zmien(); 
    });
}

function zamknij_okno_zmien() {
    const overlay = document.querySelector(".okno_zmien_overlay");
    if (overlay) overlay.remove();
}


get_task(selectedDate);
generateCalendar(currentMonth, currentYear);