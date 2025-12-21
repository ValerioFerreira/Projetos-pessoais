const API_UNITS = "http://localhost:3001/health-units/status";
const API_REPORT = "http://localhost:3001/reports/restrictions";

/* =============================
   CARREGAR UNIDADES
============================= */
async function loadReportUnits() {
  const container = document.getElementById("report-units");
  if (!container) return;

  container.innerHTML = "";

  const res = await fetch(API_UNITS);
  const units = await res.json();

  units.forEach(unit => {
    const label = document.createElement("label");
    label.className = "checkbox-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = unit.id;

    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + unit.name));

    container.appendChild(label);
  });
}

/* =============================
   SUBMIT
============================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("report-form");
  if (!form) return;

  loadReportUnits();

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const unitIds = Array.from(
      document.querySelectorAll("#report-units input:checked")
    ).map(cb => Number(cb.value));

    const start = document.getElementById("report-start").value;
    const end = document.getElementById("report-end").value;

    if (unitIds.length === 0) {
      alert("Selecione ao menos uma unidade.");
      return;
    }

    const res = await fetch(API_REPORT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        health_unit_ids: unitIds,
        start_date: start,
        end_date: end
      })
    });

    if (!res.ok) {
      alert("Erro ao gerar relatório.");
      return;
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_restricoes.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  });
});
