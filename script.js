const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

let lineChart, barChart, pieChart;

/* ================= AUTH ================= */
if (!window.location.href.includes("index.html")) {
  if (!localStorage.getItem("user")) {
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/* ================= THEME ================= */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* ================= GOAL ================= */
const goalInput = document.getElementById("goalInput");

if (goalInput) {
  goalInput.value = localStorage.getItem("goal") || "";

  goalInput.addEventListener("change", () => {
    localStorage.setItem("goal", goalInput.value);
    updateDashboard();
  });
}

/* ================= PLANNER ================= */
function createPlanner() {
  const planner = document.getElementById("planner");
  if (!planner) return;

  planner.innerHTML = "";

  days.forEach(day => {
    let data = JSON.parse(localStorage.getItem(day)) || [];

    let div = document.createElement("div");
    div.className = "day";

    div.innerHTML = `
      <h3>${day}</h3>
      <input placeholder="Add task..." 
        onkeypress="handleKey(event,'${day}')">
      <div id="tasks-${day}"></div>
    `;

    planner.appendChild(div);

    loadTasks(day);
  });

  updateDashboard();
  drawCharts();
}

/* ================= ADD TASK ================= */
function handleKey(e, day) {
  if (e.key === "Enter") {
    let value = e.target.value.trim();
    if (!value) return;

    let data = JSON.parse(localStorage.getItem(day)) || [];
    data.push({ text: value, done: false });

    localStorage.setItem(day, JSON.stringify(data));
    e.target.value = "";

    createPlanner();
  }
}

/* ================= LOAD TASKS ================= */
function loadTasks(day) {
  let data = JSON.parse(localStorage.getItem(day)) || [];
  const container = document.getElementById(`tasks-${day}`);

  data.forEach((task, index) => {
    let div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginTop = "5px";

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    checkbox.onchange = () => {
      data[index].done = checkbox.checked;
      localStorage.setItem(day, JSON.stringify(data));
      updateDashboard();
      drawCharts();
    };

    let span = document.createElement("span");
    span.innerText = task.text;
    span.style.marginLeft = "8px";

    div.appendChild(checkbox);
    div.appendChild(span);

    container.appendChild(div);
  });
}

/* ================= DASHBOARD ================= */
function updateDashboard() {
  let total = 0;
  let done = 0;

  days.forEach(day => {
    let data = JSON.parse(localStorage.getItem(day)) || [];
    total += data.length;
    done += data.filter(t => t.done).length;
  });

  let percent = total ? Math.round((done / total) * 100) : 0;

  let goal = localStorage.getItem("goal") || 0;

  if (goal > 0) {
    let goalPercent = Math.min(Math.round((done / goal) * 100), 100);
    document.getElementById("weeklyPercent").innerText = goalPercent + "% (Goal)";
  } else {
    document.getElementById("weeklyPercent").innerText = percent + "%";
  }

  document.getElementById("tasksDone").innerText = done;
}

/* ================= CHARTS ================= */
function drawCharts() {
  let total = 0;
  let done = 0;
  let dailyCounts = [];
  let dailyDone = [];

  days.forEach(day => {
    let data = JSON.parse(localStorage.getItem(day)) || [];

    let count = data.length;
    let doneCount = data.filter(t => t.done).length;

    dailyCounts.push(count);
    dailyDone.push(doneCount);

    total += count;
    done += doneCount;
  });

  /* ===== LINE CHART (Done Tasks) ===== */
  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: days,
      datasets: [{
        label: "Completed Tasks",
        data: dailyDone,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76,175,80,0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });

  /* ===== BAR CHART (Total Tasks) ===== */
  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Tasks",
        data: dailyCounts,
        backgroundColor: "#2196f3"
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });

  /* ===== PIE CHART ===== */
  if (pieChart) pieChart.destroy();

  let pending = total - done;
  let percent = total ? Math.round((done / total) * 100) : 0;

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: {
      labels: [
        `Done (${percent}%)`,
        `Pending (${100 - percent}%)`
      ],
      datasets: [{
        data: [done, pending],
        backgroundColor: ["#4caf50", "#f44336"]
      }]
    },
    options: {
      cutout: "60%",
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ================= INIT ================= */
createPlanner();