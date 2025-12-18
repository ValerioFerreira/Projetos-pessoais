const API_REOPEN_LIST = "http://localhost:3001/restrictions/active";

/* =============================
   UTIL – FORMATAR DATA/HORA
============================= */
function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR") + " " +
         d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/* =============================
   CARREGAR RESTRIÇÕES ATIVAS
============================= */
async function loadReopenList() {
  const container = document.getElementById("reopen-container");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch(API_REOPEN_LIST);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>Nenhuma restrição ativa.</p>";
      return;
    }

    const table = document.createElement("table");
    table.className = "dashboard-table";

    /* ===== HEADER ===== */
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Unidade</th>
        <th>Especialidade</th>
        <th>Plantão fechado desde</th>
        <th></th>
      </tr>
    `;
    table.appendChild(thead);

    /* ===== BODY ===== */
    const tbody = document.createElement("tbody");

    data.forEach(item => {
      const unitName = item.health_unit?.name || "—";
      const specialtyName = item.specialty?.name || "—";
      const startTime = item.start_time
        ? formatDateTime(item.start_time)
        : "—";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${unitName}</td>
        <td>${specialtyName}</td>
        <td>${startTime}</td>
        <td>
          <button class="reopen-btn">Reabrir</button>
        </td>
      `;

      tr.querySelector("button").addEventListener("click", async () => {
        await reopenRestriction(item.id);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);

  } catch (err) {
    console.error("Erro ao carregar restrições:", err);
    container.innerHTML = "<p>Erro ao carregar restrições.</p>";
  }
}

/* =============================
   REABRIR PLANTÃO
============================= */
async function reopenRestriction(id) {
  try {
    const res = await fetch(
      `http://localhost:3001/restrictions/${id}/reopen`,
      { method: "POST" }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Erro ao reabrir plantão");
    }

    alert("Plantão reaberto com sucesso.");

    await loadReopenList();

    if (typeof window.loadDashboard === "function") {
      await window.loadDashboard();
    }

  } catch (err) {
    alert(err.message);
  }
}

/* =============================
   EXPOSIÇÃO GLOBAL
============================= */
window.loadReopenList = loadReopenList;
