console.log("central carregado");

const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("toggleMenu");

/* ===== COLLAPSE SIDEBAR ===== */
toggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

/* ===== LINKS DO MENU ===== */
const links = document.querySelectorAll("nav a[data-view]");

/* ===== VIEWS ===== */
const views = {
  dashboard: document.getElementById("view-dashboard"),
  close: document.getElementById("view-close"),
  reopen: document.getElementById("view-reopen"),
  report: document.getElementById("view-report")
};

/* ===== NAVEGAÇÃO ===== */
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const viewName = link.dataset.view;
    console.log("clicou em", viewName);

    // ativa link
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // esconde todas as views
    Object.values(views).forEach(v => v.classList.add("hidden"));

    // mostra a view correta
    if (views[viewName]) {
      views[viewName].classList.remove("hidden");
    }

    // hooks de atualização
    if (viewName === "dashboard" && typeof window.loadDashboard === "function") {
      window.loadDashboard();
    }

    if (viewName === "reopen" && typeof window.loadReopenList === "function") {
      window.loadReopenList();
    }

    if (viewName === "report" && typeof window.loadReportForm === "function") {
      window.loadReportForm();
    }

    if (viewName === "close" && typeof window.loadUnitsForOperation === "function") {
      window.loadUnitsForOperation();
    }
  });
});