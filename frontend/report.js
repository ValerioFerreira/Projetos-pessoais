const API_UNITS = "http://localhost:3001/health-units/status";
const API_REPORT = "http://localhost:3001/reports/restrictions";

let selectedUnitIds = [];

/* =============================
   CARREGAR UNIDADES
============================= */
async function loadReportUnits() {
  const container = document.getElementById("report-units");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch(API_UNITS);
    const units = await res.json();

    units.forEach(unit => {
      const card = document.createElement("div");
      card.className = "unit-card";
      card.dataset.id = unit.id;

      card.innerHTML = `
        <h3>${unit.name}</h3>
        <small>Clique para selecionar</small>
      `;

      card.addEventListener("click", () => {
        toggleUnitSelection(card, unit.id);
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar unidades:", err);
  }
}

/* =============================
   SELEÇÃO
============================= */
function toggleUnitSelection(card, unitId) {
  const index = selectedUnitIds.indexOf(unitId);

  if (index >= 0) {
    selectedUnitIds.splice(index, 1);
    card.classList.remove("selected");
  } else {
    selectedUnitIds.push(unitId);
    card.classList.add("selected");
  }
}

/* =============================
   SUBMIT DO RELATÓRIO
============================= */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("report-form");
  if (!form) return;

  loadReportUnits();

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const start = document.getElementById("report-start").value;
    const end = document.getElementById("report-end").value;

    if (selectedUnitIds.length === 0) {
      alert("Selecione ao menos uma unidade de saúde.");
      return;
    }

    try {
      const res = await fetch(API_REPORT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          health_unit_ids: selectedUnitIds,
          start_date: start,
          end_date: end
        })
      });

      if (!res.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-restricoes.pdf";
      a.click();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert(err.message);
    }
  });
});
