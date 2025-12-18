const API_STATUS = "http://localhost:3001/health-units/status";
const API_RESTRICT = "http://localhost:3001/restrictions";

// ajuste se quiser fixar operador
const OPERATOR_ID = 1;

let unitsCache = [];

/* =============================
   CARREGAR UNIDADES
============================= */
async function loadUnits() {
  const select = document.getElementById("healthUnit");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione a unidade</option>`;
  unitsCache = [];

  try {
    const res = await fetch(API_STATUS);
    const data = await res.json();
    unitsCache = data;

    data.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = u.name;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Erro ao carregar unidades:", err);
  }
}

/* =============================
   ESPECIALIDADES
============================= */
function renderSpecialties(unitId) {
  const container = document.getElementById("specialties");
  container.innerHTML = "";

  const unit = unitsCache.find(u => u.id === Number(unitId));
  if (!unit) {
    container.innerHTML = `<span class="hint">Selecione uma unidade</span>`;
    return;
  }

  if (!unit.specialties || unit.specialties.length === 0) {
    container.innerHTML = `<span class="hint">Nenhuma especialidade vinculada</span>`;
    return;
  }

  unit.specialties.forEach(s => {
    const label = document.createElement("label");
    label.className = "checkbox-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = s.id;

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + s.name));
    container.appendChild(label);
  });
}

/* =============================
   EVENTOS
============================= */
document.addEventListener("change", e => {
  if (e.target?.id === "healthUnit") {
    renderSpecialties(e.target.value);
  }
});

/* =============================
   SUBMIT
============================= */
document.addEventListener("submit", async e => {
  if (e.target?.id !== "restriction-form") return;

  e.preventDefault();

  const healthUnitId = Number(document.getElementById("healthUnit").value);
  const doctorName = document.getElementById("doctorName").value.trim();
  const doctorCrm = document.getElementById("doctorCrm").value.trim();
  const reason = document.getElementById("reason").value.trim();

  const specialtyIds = Array.from(
    document.querySelectorAll("#specialties input[type=checkbox]:checked")
  ).map(cb => Number(cb.value));

  if (!healthUnitId || specialtyIds.length === 0) {
    alert("Selecione a unidade e ao menos uma especialidade.");
    return;
  }

  try {
    const res = await fetch(API_RESTRICT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        health_unit_id: healthUnitId,
        specialty_ids: specialtyIds,
        doctor_name: doctorName,
        doctor_crm: doctorCrm,
        reason,
        operator_id: OPERATOR_ID
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    alert("Restrição registrada com sucesso.");

    e.target.reset();
    document.getElementById("specialties").innerHTML =
      `<span class="hint">Selecione uma unidade</span>`;

    // Atualiza dashboard imediatamente
    window.loadDashboard?.();

  } catch (err) {
    alert(err.message);
  }
});

/* =============================
   EXPOR PARA A CENTRAL
============================= */
window.loadUnits = loadUnits;
