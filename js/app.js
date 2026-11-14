import { renderDashboard, renderMissionIdentity } from "./dashboard.js";
import { renderMonitoring, bindReadingForm } from "./monitoring.js";
import { renderExercises } from "./exercise.js";
import { renderNutrition, bindFoodForm } from "./nutrition.js";
import { renderAlerts } from "./alerts.js";
import { renderCharts } from "./charts.js";
import { loadState, getTodayKey } from "./storage.js";

const state = loadState();
const viewTitles = {
  overview: "Overview",
  monitoring: "Bone monitoring",
  exercise: "Exercise",
  nutrition: "Nutrition",
  alerts: "Alert center",
  gravity: "Gravity lab"
};
function showToast(message) {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${escapeHtml(message)}</span>`;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function updateData(message) {
  refresh();
  showToast(message);
}

function refresh() {
  renderDashboard(state);
  renderMonitoring(state);
  renderExercises(state, updateData);
  renderNutrition(state, updateData);
  renderAlerts(state, updateData);
  renderCharts(state);
}

function navigate(view) {
  if (!Object.prototype.hasOwnProperty.call(viewTitles, view)) return;
  document.querySelectorAll(".view-section").forEach(section => {
    section.classList.toggle("active", section.id === `view-${view}`);
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    const isActive = link.dataset.view === view;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.getElementById("breadcrumb-current").textContent = viewTitles[view];
  document.body.classList.remove("sidebar-open");
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  renderCharts(state);
  if (view === "alerts") renderAlerts(state, updateData);
}

function bindNavigation() {
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-view], [data-nav]");
    if (target) {
      event.preventDefault();
      navigate(target.dataset.view || target.dataset.nav);
      return;
    }
    if (event.target.closest("#alert-shortcut")) navigate("alerts");
    if (event.target.closest("#menu-toggle")) document.body.classList.toggle("sidebar-open");
    if (event.target.closest("#mobile-scrim")) document.body.classList.remove("sidebar-open");
  });
  window.addEventListener("hashchange", () => navigate(location.hash.slice(1) || "overview"));
}

function bindGravitySimulation() {
  const radius = document.getElementById("radius-slider");
  const rpm = document.getElementById("rpm-slider");
  const update = () => {
    const radiusMeters = Number(radius.value);
    const rotationsPerMinute = Number(rpm.value);
    const angularVelocity = rotationsPerMinute * 2 * Math.PI / 60;
    const accelerationG = angularVelocity ** 2 * radiusMeters / 9.80665;
    document.getElementById("radius-label").textContent = `${radiusMeters} m`;
    document.getElementById("rpm-label").textContent = `${rotationsPerMinute.toFixed(2)} rpm`;
    document.getElementById("gravity-value").textContent = accelerationG.toFixed(2);
  };
  radius.addEventListener("input", update);
  rpm.addEventListener("input", update);
  update();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

renderMissionIdentity();
document.getElementById("reading-date").max = getTodayKey();
bindNavigation();
bindReadingForm(document.getElementById("reading-form"), state, updateData);
bindFoodForm(document.getElementById("food-form"), state, updateData);
bindGravitySimulation();
refresh();
navigate(location.hash.slice(1) || "overview");
window.addEventListener("storage", event => {
  if (event.key === "boneguard-demo-state-v1") {
    Object.assign(state, loadState());
    refresh();
  }
});
