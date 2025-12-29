const API_STATUS = "https://disponibilidade-das-unidades-de-saude.onrender.com/health-units/status";
const API_RESTRICT = "https://disponibilidade-das-unidades-de-saude.onrender.com/restrictions";
const OPERATOR_ID = 1;

let unitsCache = [];
let selectedSpecialties = new Set();

/* =============================
   CARREGAR UNIDADES
============================= */
async function loadUnits() {
  const select = document.getElementById("healthUnit");
  if (!select) return;

  select.innerHTML = `<option value="">Selecione a unidade</option>`;
  selectedSpecialties.clear();

  const res = await fetch(API_STATUS);
  unitsCache = await res.json();

  unitsCache.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.name;
    select.appendChild(opt);
  });

  renderSpecialties(null);
}

/* =============================
   RENDERIZAR ESPECIALIDADES
============================= */
function renderSpecialties(unitId) {
  const container = document.getElementById("specialties");
  container.innerHTML = "";
  selectedSpecialties.clear();

  if (!unitId) {
    container.innerHTML = `<span class="hint">Selecione uma unidade</span>`;
    return;
  }

  const unit = unitsCache.find(u => u.id === Number(unitId));
  if (!unit || !unit.specialties.length) {
    container.innerHTML = `<span class="hint">Nenhuma especialidade disponível</span>`;
    return;
  }

  unit.specialties.forEach(spec => {
    const card = document.createElement("div");
    card.className = "specialty-card";
    card.textContent = spec.name;

    card.addEventListener("click", () => {
      if (selectedSpecialties.has(spec.id)) {
        selectedSpecialties.delete(spec.id);
        card.classList.remove("selected");
      } else {
        selectedSpecialties.add(spec.id);
        card.classList.add("selected");
      }
    });

    container.appendChild(card);
  });
}

/* =============================
   EVENTOS
============================= */
document.addEventListener("change", e => {
  if (e.target.id === "healthUnit") {
    renderSpecialties(e.target.value);
  }
});

/* =============================
   SUBMIT
============================= */
document.addEventListener("submit", async e => {
  if (e.target.id !== "restriction-form") return;
  e.preventDefault();

  const healthUnitId = Number(document.getElementById("healthUnit").value);
  const doctorName = document.getElementById("doctorName").value.trim();
  const doctorCrm = document.getElementById("doctorCrm").value.trim();
  const reason = document.getElementById("reason").value.trim();

  if (!healthUnitId || selectedSpecialties.size === 0) {
    alert("Selecione a unidade e ao menos uma especialidade.");
    return;
  }

  await fetch(API_RESTRICT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      health_unit_id: healthUnitId,
      specialty_ids: Array.from(selectedSpecialties),
      doctor_name: doctorName,
      doctor_crm: doctorCrm,
      reason,
      operator_id: OPERATOR_ID
    })
  });

  alert("Restrição registrada com sucesso.");

  document.getElementById("restriction-form").reset();
  renderSpecialties(null);
});

/* =============================
   EXPOSIÇÃO PARA CENTRAL
============================= */
window.loadUnitsForOperation = loadUnits;
