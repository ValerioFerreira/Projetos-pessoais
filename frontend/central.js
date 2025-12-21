const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("toggleMenu");

toggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});

/* ===== VIEWS ===== */
const links = document.querySelectorAll("nav a");
const views = {
  dashboard: document.getElementById("view-dashboard"),
  close: document.getElementById("view-close"),
  reopen: document.getElementById("view-reopen"),
  report: document.getElementById("view-report")
  
};

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    // estado ativo do menu
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // esconder todas as views
    Object.values(views).forEach(v => v.classList.add("hidden"));

    // mostrar a view selecionada
    const viewName = link.dataset.view;
    views[viewName].classList.remove("hidden");

    // ===== HOOKS POR VIEW =====
    if (viewName === "dashboard") {
      window.loadDashboard?.();
    }

    if (viewName === "close") {
      // 🔴 ISSO É O QUE ESTAVA FALTANDO
      window.loadUnits?.();
    }

    if (viewName === "reopen") {
      window.loadReopenList?.();
    }
  });
});
