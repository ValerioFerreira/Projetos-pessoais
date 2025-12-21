const API_URL = "http://localhost:3001/health-units/status";

/* =============================
   DEFINIÇÃO DAS REGIÕES
============================= */
const REGIONS = {
  "ÁREA NORTE": [
    "UPA Olinda",
    "UPA Igarassu",
    "UPA Nova Descoberta",
    "UPA Rio Doce",
    "UPA Paulista",
    "HOSP. TRICENTENÁRIO",
    "Policlínica Amaury Coutinho",
    "Policlínica Torres Galvão"
  ],
  "ÁREA SUL": [
    "UPA Imbiribeira",
    "UPA Ibura",
    "UPA Engenho Velho",
    "UPA Barra de Jangada",
    "UPA SOTAVE",
    "UPA Cabo",
    "UPA Ipojuca"
  ],
  "ÁREA OESTE": [
    "UPA Caxangá",
    "UPA Torrões",
    "UPA Curado",
    "UPA São Lourenço da Mata",
    "HOSP. PETRONILA CAMPOS"
  ]
};

const SPECIALTIES_ORDER = [
  "Trauma",
  "Clínico",
  "Pediatria",
  "Odontologia",
  "Oftalmologia",
  "Obstetrícia"
];

/* =============================
   CARREGAMENTO
============================= */
async function loadDashboard() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
  }
}

/* =============================
   RENDERIZAÇÃO
============================= */
function renderDashboard(units) {
  const container = document.getElementById("dashboard");
  if (!container) return;

  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "dashboard";

  /* ===== HEADER ===== */
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const thUnit = document.createElement("th");
  thUnit.textContent = "Unidade";
  headerRow.appendChild(thUnit);

  SPECIALTIES_ORDER.forEach(name => {
    const th = document.createElement("th");
    th.textContent = name;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  /* ===== BODY ===== */
  const tbody = document.createElement("tbody");

  const unitMap = new Map(units.map(u => [u.name, u]));

  Object.entries(REGIONS).forEach(([regionName, unitNames]) => {
    // Linha da região
    const regionRow = document.createElement("tr");
    regionRow.className = "region-row";

    const regionCell = document.createElement("td");
    regionCell.colSpan = SPECIALTIES_ORDER.length + 1;
    regionCell.textContent = regionName;

    regionRow.appendChild(regionCell);
    tbody.appendChild(regionRow);

    // Unidades
    unitNames.forEach(unitName => {
      const unit = unitMap.get(unitName);
      if (!unit) return;

      const tr = document.createElement("tr");

      const unitTd = document.createElement("td");
      unitTd.className = "unit";
      unitTd.textContent = unit.name;
      tr.appendChild(unitTd);

      SPECIALTIES_ORDER.forEach(specName => {
        const td = document.createElement("td");
        td.className = "status-cell";

        const spec = unit.specialties.find(s => s.name === specName);

        if (!spec) {
          td.innerHTML = `<span class="status-nd">-</span>`;
        } else if (spec.status === "restricted") {
          td.innerHTML = `<span class="status-badge status-restricted">RESTRITO</span>`;
        } else {
          td.innerHTML = `<span class="status-badge status-open">ABERTO</span>`;
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

/* =============================
   INIT
============================= */
document.addEventListener("DOMContentLoaded", loadDashboard);
