
"use strict";

// ELEMENTOS PRINCIPALES
const landing = document.getElementById("landing");
const app = document.getElementById("app");
const pageContent = document.getElementById("pageContent");
const sideNav = document.getElementById("sideNav");
const roleSelect = document.getElementById("roleSelect");

let currentRole = "patient";
let currentPage = "dashboard";
let toastTimer;

// DATOS DE DEMOSTRACIÓN
const appointments = [
  { id: 1, patient: "María Rodríguez", doctor: "Dra. Ana López", specialty: "Medicina general", date: "2026-11-06", time: "09:00", status: "Confirmada" },
  { id: 2, patient: "Carlos Méndez", doctor: "Dr. Luis Vargas", specialty: "Cardiología", date: "2026-11-07", time: "10:30", status: "Pendiente" },
  { id: 3, patient: "Sofía Ramírez", doctor: "Dra. Ana López", specialty: "Medicina general", date: "2026-11-09", time: "14:00", status: "Confirmada" }
];

const patients = [
  { name: "María Rodríguez", id: "PAC-001", email: "maria@email.com", phone: "8888-1111" },
  { name: "Carlos Méndez", id: "PAC-002", email: "carlos@email.com", phone: "8888-2222" },
  { name: "Sofía Ramírez", id: "PAC-003", email: "sofia@email.com", phone: "8888-3333" },
  { name: "Daniel Jiménez", id: "PAC-004", email: "daniel@email.com", phone: "8888-4444" }
];

const prescriptions = [
  { id: "REC-001", patient: "María Rodríguez", doctor: "Dra. Ana López", date: "2026-11-02", status: "Disponible" },
  { id: "REC-002", patient: "Carlos Méndez", doctor: "Dr. Luis Vargas", date: "2026-11-03", status: "Pendiente" },
  { id: "REC-003", patient: "Sofía Ramírez", doctor: "Dra. Ana López", date: "2026-10-28", status: "Dispensada" }
];

const profiles = {
  patient: {
    name: "María Rodríguez",
    role: "Paciente",
    initial: "M",
    menu: [
      ["dashboard", "⌂", "Panel principal"],
      ["appointments", "▦", "Mis citas"],
      ["newAppointment", "+", "Solicitar cita"],
      ["prescriptions", "▤", "Mis recetas"]
    ]
  },
  doctor: {
    name: "Dra. Ana López",
    role: "Médico especialista",
    initial: "A",
    menu: [
      ["dashboard", "⌂", "Panel principal"],
      ["appointments", "▦", "Agenda médica"],
      ["patients", "♙", "Mis pacientes"],
      ["prescriptions", "▤", "Recetas"]
    ]
  },
  reception: {
    name: "Laura Fernández",
    role: "Recepcionista",
    initial: "L",
    menu: [
      ["dashboard", "⌂", "Panel principal"],
      ["appointments", "▦", "Gestión de citas"],
      ["newAppointment", "+", "Registrar cita"],
      ["patients", "♙", "Pacientes"]
    ]
  },
  pharmacy: {
    name: "Andrés Castro",
    role: "Farmacéutico",
    initial: "A",
    menu: [
      ["dashboard", "⌂", "Panel principal"],
      ["prescriptions", "▤", "Recetas médicas"],
      ["patients", "♙", "Pacientes"]
    ]
  },
  admin: {
    name: "Administrador",
    role: "Administrador",
    initial: "AD",
    menu: [
      ["dashboard", "⌂", "Panel principal"],
      ["appointments", "▦", "Citas"],
      ["patients", "♙", "Pacientes"],
      ["prescriptions", "▤", "Recetas"],
      ["overview", "⚙", "Información del sistema"]
    ]
  }
};

// FUNCIONES GENERALES
function openDemo() {
  landing.classList.add("hidden");
  app.classList.remove("hidden");
  window.scrollTo(0, 0);
  setRole(currentRole);
}

function returnHome() {
  app.classList.add("hidden");
  landing.classList.remove("hidden");
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function formatDate(date) {
  if (!date) return "Sin fecha";
  return new Date(date + "T12:00:00").toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function setRole(role) {
  currentRole = role;
  const profile = profiles[role];

  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileRole").textContent = profile.role;
  document.getElementById("profileAvatar").textContent = profile.initial;
  document.getElementById("headerAvatar").textContent = profile.initial;
  roleSelect.value = role;

  sideNav.innerHTML = profile.menu.map(item => `
    <button class="nav-item ${currentPage === item[0] ? "active" : ""}"
      data-page="${item[0]}">
      <span class="nav-icon">${item[1]}</span>${item[2]}
    </button>
  `).join("");

  if (!profile.menu.some(item => item[0] === currentPage)) {
    currentPage = "dashboard";
  }

  renderPage();
  updateNavigation();
}

function updateNavigation() {
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === currentPage);
  });
}

function navigate(page) {
  const profile = profiles[currentRole];
  const allowed = profile.menu.some(item => item[0] === page);

  if (!allowed) {
    showToast("Esta sección no está disponible para este perfil.");
    return;
  }

  currentPage = page;
  renderPage();
  updateNavigation();
  document.getElementById("sidebar").classList.remove("open");
}

function pageHeader(title, description) {
  return `
    <div class="page-title">
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
  `;
}

function renderPage() {
  const pages = {
    dashboard: renderDashboard,
    appointments: renderAppointments,
    newAppointment: renderNewAppointment,
    patients: renderPatients,
    prescriptions: renderPrescriptions,
    overview: renderOverview
  };

  const page = pages[currentPage] || renderDashboard;
  pageContent.innerHTML = page();

  document.getElementById("pageHeading").textContent =
    getPageTitle(currentPage);

  document.getElementById("breadcrumb").textContent =
    getPageTitle(currentPage).toUpperCase();

  updateNavigation();
}

function getPageTitle(page) {
  const titles = {
    dashboard: "Panel principal",
    appointments: "Gestión de citas",
    newAppointment: "Nueva cita",
    patients: "Pacientes",
    prescriptions: "Recetas médicas",
    overview: "Información del sistema"
  };
  return titles[page] || "Panel principal";
}

// PANEL PRINCIPAL
function renderDashboard() {
  const role = currentRole;
  const isPatient = role === "patient";
  const isPharmacy = role === "pharmacy";

  const roleMessage = {
    patient: "Aquí puedes consultar tus citas y recetas médicas.",
    doctor: "Consulta tu agenda y mantén organizada la atención de tus pacientes.",
    reception: "Administra los registros y las citas de atención.",
    pharmacy: "Consulta las recetas y su estado de dispensación.",
    admin: "Consulta el resumen general de la plataforma."
  };

  const stats = isPatient
    ? [["▦", "Mis citas", appointments.length], ["▤", "Mis recetas", prescriptions.length], ["✓", "Citas confirmadas", appointments.filter(a => a.status === "Confirmada").length]]
    : isPharmacy
    ? [["▤", "Recetas registradas", prescriptions.length], ["◷", "Pendientes", prescriptions.filter(p => p.status === "Pendiente").length], ["✓", "Dispensadas", prescriptions.filter(p => p.status === "Dispensada").length]]
    : [["▦", "Citas registradas", appointments.length], ["♙", "Pacientes", patients.length], ["▤", "Recetas", prescriptions.length]];

  const rows = isPharmacy
    ? prescriptions.map(p => ({
        title: p.patient,
        detail: `${p.id} · ${p.doctor}`,
        date: p.date,
        status: p.status
      }))
    : appointments.map(a => ({
        title: isPatient ? a.doctor : a.patient,
        detail: `${a.specialty} · ${a.time}`,
        date: a.date,
        status: a.status
      }));

  return `
    <div class="welcome-row">
      <div>
        <h2>¡Hola, ${profiles[role].name.split(" ")[0]}!</h2>
        <p>${roleMessage[role]}</p>
      </div>
      <button class="btn btn-primary" data-action="new-appointment">+ Nueva cita</button>
    </div>

    <div class="stats-grid">
      ${stats.map(s => `
        <article class="stat-card">
          <div class="stat-top"><span>${s[1]}</span><span class="stat-icon">${s[0]}</span></div>
          <strong>${s[2]}</strong>
          <small>Datos de demostración</small>
        </article>
      `).join("")}
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-heading">
          <h3>${isPharmacy ? "Recetas recientes" : "Actividad reciente"}</h3>
          <span>${rows.length} registros</span>
        </div>
        ${rows.slice(0, 4).map(row => `
          <div class="appointment-row">
            <div class="date-box">
              <strong>${new Date(row.date + "T12:00:00").getDate()}</strong>
              <small>${new Date(row.date + "T12:00:00").toLocaleDateString("es-CR",{month:"short"}).toUpperCase()}</small>
            </div>
            <div class="appointment-info">
              <strong>${row.title}</strong>
              <small>${row.detail} · ${formatDate(row.date)}</small>
            </div>
            <span class="pill ${row.status === "Pendiente" ? "pending" : ""}">${row.status}</span>
          </div>
        `).join("")}
      </section>

      <section class="panel">
        <div class="panel-heading"><h3>Accesos rápidos</h3></div>
        <div class="quick-actions">
          <button class="quick-action" data-action="new-appointment"><span>＋</span>Solicitar cita</button>
          <button class="quick-action" data-action="appointments"><span>▦</span>Ver agenda</button>
          <button class="quick-action" data-action="patients"><span>♙</span>Pacientes</button>
          <button class="quick-action" data-action="prescriptions"><span>▤</span>Recetas</button>
        </div>
      </section>
    </div>
  `;
}

// CITAS
function renderAppointments() {
  const visibleAppointments = currentRole === "patient"
    ? appointments.filter(a => a.patient === "María Rodríguez")
    : appointments;

  return `
    ${pageHeader("Gestión de citas", "Consulta y organiza las citas médicas registradas.")}
    <div class="toolbar">
      <input class="search-input" id="appointmentSearch" placeholder="Buscar paciente o especialidad...">
      <button class="btn btn-primary" data-action="new-appointment">+ Registrar cita</button>
    </div>
    <div class="data-table-wrap">
      <table class="data-table" id="appointmentTable">
        <thead><tr><th>Paciente</th><th>Especialidad</th><th>Profesional</th><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>
          ${visibleAppointments.map(a => `
            <tr>
              <td><strong>${a.patient}</strong></td>
              <td>${a.specialty}</td>
              <td>${a.doctor}</td>
              <td>${formatDate(a.date)} · ${a.time}</td>
              <td><span class="pill ${a.status === "Pendiente" ? "pending" : ""}">${a.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p class="switcher-hint">Las citas de esta demostración utilizan información ficticia.</p>
  `;
}

// REGISTRO DE CITAS
function renderNewAppointment() {
  const today = new Date().toISOString().slice(0, 10);

  return `
    ${pageHeader("Solicitar una cita", "Completa los datos para registrar una cita de demostración.")}
    <section class="panel form-panel">
      <div class="panel-heading"><h3>Información de la cita</h3><span>Formulario de ejemplo</span></div>
      <form id="appointmentForm">
        <div class="form-grid">
          <div class="form-field">
            <label for="patientName">Nombre del paciente</label>
            <input class="form-control" id="patientName" required
              value="${currentRole === "patient" ? "María Rodríguez" : ""}"
              placeholder="Nombre completo">
          </div>
          <div class="form-field">
            <label for="specialty">Especialidad</label>
            <select class="form-control" id="specialty" required>
              <option value="">Seleccionar</option>
              <option>Medicina general</option>
              <option>Cardiología</option>
              <option>Pediatría</option>
              <option>Dermatología</option>
              <option>Odontología</option>
            </select>
          </div>
          <div class="form-field">
            <label for="doctorName">Profesional</label>
            <select class="form-control" id="doctorName" required>
              <option value="">Seleccionar</option>
              <option>Dra. Ana López</option>
              <option>Dr. Luis Vargas</option>
              <option>Dra. Elena Mora</option>
            </select>
          </div>
          <div class="form-field">
            <label for="appointmentDate">Fecha</label>
            <input class="form-control" type="date" id="appointmentDate" min="${today}" required>
          </div>
          <div class="form-field">
            <label for="appointmentTime">Hora</label>
            <select class="form-control" id="appointmentTime" required>
              <option value="">Seleccionar</option>
              <option>08:00</option><option>09:00</option>
              <option>10:00</option><option>11:00</option>
              <option>13:00</option><option>14:00</option>
              <option>15:00</option>
            </select>
          </div>
          <div class="form-field">
            <label for="modality">Modalidad</label>
            <select class="form-control" id="modality" required>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-light" data-action="appointments">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar cita</button>
        </div>
      </form>
    </section>
  `;
}

// PACIENTES
function renderPatients() {
  const visiblePatients = currentRole === "patient"
    ? patients.filter(p => p.name === "María Rodríguez")
    : patients;

  return `
    ${pageHeader("Directorio de pacientes", "Consulta los registros disponibles en la demostración.")}
    <div class="toolbar">
      <input class="search-input" id="patientSearch" placeholder="Buscar por nombre o código...">
      <span class="switcher-hint">${visiblePatients.length} registros disponibles</span>
    </div>
    <div class="data-table-wrap">
      <table class="data-table" id="patientTable">
        <thead><tr><th>Paciente</th><th>Código</th><th>Correo</th><th>Teléfono</th></tr></thead>
        <tbody>
          ${visiblePatients.map(p => `
            <tr><td><strong>${p.name}</strong></td><td>${p.id}</td><td>${p.email}</td><td>${p.phone}</td></tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// RECETAS
function renderPrescriptions() {
  const visiblePrescriptions = currentRole === "patient"
    ? prescriptions.filter(p => p.patient === "María Rodríguez")
    : prescriptions;

  return `
    ${pageHeader("Recetas médicas", "Consulta el estado de las recetas registradas.")}
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Código</th><th>Paciente</th><th>Profesional</th><th>Fecha</th><th>Estado</th></tr></thead>
        <tbody>
          ${visiblePrescriptions.map(p => `
            <tr>
              <td><strong>${p.id}</strong></td>
              <td>${p.patient}</td>
              <td>${p.doctor}</td>
              <td>${formatDate(p.date)}</td>
              <td><span class="pill ${p.status === "Pendiente" ? "pending" : ""} ${p.status === "Dispensada" ? "cancelled" : ""}">${p.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p class="switcher-hint">La vigencia y dispensación de recetas se representan con datos ficticios.</p>
  `;
}

// INFORMACIÓN GENERAL
function renderOverview() {
  return `
    ${pageHeader("Información del sistema", "Resumen de los módulos contemplados en MediConnect.")}
    <div class="about-grid">
      <article class="info-card"><span class="info-icon blue">▦</span><h3>Gestión de citas</h3><p>Registro, consulta y organización de citas según la disponibilidad del profesional.</p></article>
      <article class="info-card"><span class="info-icon teal">♙</span><h3>Gestión de pacientes</h3><p>Organización de los datos y registros de los pacientes autorizados.</p></article>
      <article class="info-card"><span class="info-icon purple">▤</span><h3>Gestión de recetas</h3><p>Consulta del estado de las recetas y control de su dispensación.</p></article>
      <article class="info-card"><span class="info-icon blue">⚕</span><h3>Atención médica</h3><p>Herramientas para que los profesionales organicen su agenda y consultas.</p></article>
      <article class="info-card"><span class="info-icon teal">⌂</span><h3>Telemedicina</h3><p>Área propuesta para facilitar la atención médica a distancia.</p></article>
      <article class="info-card"><span class="info-icon purple">⚙</span><h3>Administración</h3><p>Gestión general de usuarios, profesionales y organización del sistema.</p></article>
    </div>
    <section class="panel" style="margin-top:18px">
      <h3>Consideraciones del prototipo</h3>
      <p class="switcher-hint">Esta versión es una demostración académica. No almacena datos en un servidor, no utiliza expedientes reales y no realiza consultas médicas ni videollamadas reales.</p>
    </section>
  `;
}

// EVENTOS
document.getElementById("enterDemo").addEventListener("click", openDemo);
document.getElementById("heroDemo").addEventListener("click", openDemo);
document.getElementById("rolesDemo").addEventListener("click", openDemo);
document.getElementById("exitDemo").addEventListener("click", returnHome);
document.getElementById("backHome").addEventListener("click", event => {
  event.preventDefault();
  returnHome();
});

roleSelect.addEventListener("change", event => {
  currentPage = "dashboard";
  setRole(event.target.value);
  showToast("Perfil cambiado correctamente.");
});

document.getElementById("mobileMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

sideNav.addEventListener("click", event => {
  const button = event.target.closest("[data-page]");
  if (button) navigate(button.dataset.page);
});

pageContent.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "new-appointment") navigate("newAppointment");
  else navigate(action);
});

// FORMULARIO Y BÚSQUEDAS
pageContent.addEventListener("submit", event => {
  if (event.target.id !== "appointmentForm") return;

  event.preventDefault();

  const patient = document.getElementById("patientName").value.trim();
  const specialty = document.getElementById("specialty").value;
  const doctor = document.getElementById("doctorName").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;
  const modality = document.getElementById("modality").value;

  if (!patient || !specialty || !doctor || !date || !time) {
    showToast("Completa todos los campos.");
    return;
  }

  const collision = appointments.some(a =>
    a.doctor === doctor && a.date === date && a.time === time
  );

  if (collision) {
    showToast("Ese profesional ya tiene una cita en ese horario.");
    return;
  }

  appointments.push({
    id: Date.now(),
    patient,
    doctor,
    specialty: `${specialty} (${modality})`,
    date,
    time,
    status: "Pendiente"
  });

  currentPage = "appointments";
  renderPage();
  updateNavigation();
  showToast("La cita se registró correctamente.");
});

pageContent.addEventListener("input", event => {
  const input = event.target;
  const query = input.value.toLowerCase().trim();

  if (input.id === "appointmentSearch") {
    document.querySelectorAll("#appointmentTable tbody tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  }

  if (input.id === "patientSearch") {
    document.querySelectorAll("#patientTable tbody tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  }
});

// INICIO
setRole("patient");
