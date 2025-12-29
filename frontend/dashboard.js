const API_URL = "https://disponibilidade-das-unidades-de-saude.onrender.com/health-units/status";

/* =============================
   REGIÕES POR ID
============================= */
const REGIONS = {
  "ÁREA NORTE": [1, 2, 6, 3, 4, 18, 16, 17],
  "ÁREA SUL": [11, 12, 10, 13, 20, 14, 15],
  "ÁREA OESTE": [7, 8, 9, 5, 19]
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
   LOAD
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
   RENDER
============================= */
function renderDashboard(units) {
  const container = document.getElementById("dashboard");
  if (!container) return;

  container.innerHTML = "";

  const table = document.createElement("table");
  table.className = "dashboard";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headerRow.appendChild(document.createElement("th")); // Região

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

  const tbody = document.createElement("tbody");

  const unitMap = new Map(units.map(u => [u.id, u]));

  Object.entries(REGIONS).forEach(([regionName, unitIds]) => {
    let firstRow = true;

    unitIds.forEach(unitId => {
      const unit = unitMap.get(unitId);
      if (!unit) return;

      const tr = document.createElement("tr");

      if (firstRow) {
        const regionTd = document.createElement("td");
        regionTd.className = "region-cell";

        // 👉 destaque apenas da ÁREA SUL
        if (regionName === "ÁREA SUL") {
          regionTd.classList.add("region-sul");
        }

        regionTd.rowSpan = unitIds.length;
        regionTd.textContent = regionName;
        tr.appendChild(regionTd);

        firstRow = false;
      }

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

document.addEventListener("DOMContentLoaded", loadDashboard);
