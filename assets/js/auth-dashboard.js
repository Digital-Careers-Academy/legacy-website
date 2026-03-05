// Requires: auth.js loaded before this file

function isDashboardRoute() {
  const path = window.location.pathname || "";
  return path.includes("/dashboard/");
}

function requireDashboardAuth() {
  const user = getCurrentUser();
  if (!user) {
    sessionStorage.setItem("hl_redirect_after_login", window.location.href);
    window.location.href = "/legacy-website/login.html";
    return false;
  }
  return true;
}

function syncDashboardGreeting() {
  const el = document.querySelector("#welcomeName");
  if (!el) return;

  const user = getCurrentUser();
  if (!user) {
    el.textContent = "Welcome";
    return;
  }
  el.textContent = `Welcome ${firstNameFromName(user.name)}`;
}

function bindLogout() {
  // Add a logout button anywhere in dashboard with id="logoutBtn"
  const btn = document.querySelector("#logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    logoutUser();
    window.location.href = "/legacy-website/login.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (isDashboardRoute()) {
    if (!requireDashboardAuth()) return;
    syncDashboardGreeting();
    bindLogout();
  }
});