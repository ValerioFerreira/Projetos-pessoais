const API_URL = "http://localhost:3001/health-units/status";

let lastData = null;

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
    const response = await fetch(API_URL);
    const data = await response.json();
    lastData = data;
    renderDashboard(data);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

/* =============================
   RENDERIZAÇÃO
============================= */
function renderDashboard(units) {
  const container = document.getElementById("dashboard");

  // 🔒 Defesa absoluta
  if (!container || !Array.isArray(units)) {
    return;
  }

  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "dashboard-table";

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
    const regionRow = document.createElement("tr");
    regionRow.className = "region-row";

    const regionCell = document.createElement("td");
    regionCell.colSpan = SPECIALTIES_ORDER.length + 1;
    regionCell.textContent = regionName;

    regionRow.appendChild(regionCell);
    tbody.appendChild(regionRow);

    unitNames.forEach(unitName => {
      const unit = unitMap.get(unitName);
      if (!unit) return;

      const tr = document.createElement("tr");

      const unitTd = document.createElement("td");
      unitTd.textContent = unit.name;
      tr.appendChild(unitTd);

      SPECIALTIES_ORDER.forEach(specName => {
        const td = document.createElement("td");
        const spec = unit.specialties.find(s => s.name === specName);

        if (!spec) {
          td.textContent = "N/D";
          td.className = "nd";
        } else if (spec.status === "restricted") {
          td.textContent = "RESTRITO";
          td.className = "restricted";
        } else {
          td.textContent = "DISPONÍVEL";
          td.className = "available";
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
   REEXIBIÇÃO
============================= */
function refreshDashboardView() {
  if (lastData) {
    renderDashboard(lastData);
  }
}

/* =============================
   INIT
============================= */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});

window.loadDashboard = loadDashboard;

document.addEventListener("DOMContentLoaded", loadDashboard);

// Atualização automática simples (polling)
setInterval(() => {
  loadDashboard();
}, 10000); // 10 segundos


