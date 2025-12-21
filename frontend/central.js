const sidebar = document.getElementById("sidebar");

/* ===== VIEWS ===== */
const links = document.querySelectorAll(".menu a");
const views = {
  dashboard: document.getElementById("view-dashboard"),
  close: document.getElementById("view-close"),
  reopen: document.getElementById("view-reopen"),
  report: document.getElementById("view-report")
};

links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    Object.values(views).forEach(v => v.classList.add("hidden"));
    views[link.dataset.view].classList.remove("hidden");

    if (link.dataset.view === "dashboard") {
      window.loadDashboard?.();
    }

    if (link.dataset.view === "reopen") {
      window.loadReopenList?.();
    }
  });
});
