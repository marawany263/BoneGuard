import { dailyExercises, exerciseCategories } from "../data/exercise-data.js";
import { getTodayExercises, setExerciseComplete } from "./storage.js";

export function renderExercises(state, onUpdate) {
  const completed = new Set(getTodayExercises(state));
  const list = document.getElementById("exercise-list");
  list.innerHTML = dailyExercises.map(item => `
    <label class="exercise-item ${completed.has(item.id) ? "is-complete" : ""}">
      <span class="exercise-checkbox"><input type="checkbox" data-exercise-id="${item.id}" ${completed.has(item.id) ? "checked" : ""}><span><i class="fa-solid fa-check"></i></span></span>
      <span class="exercise-item-icon"><i class="fa-solid ${item.icon}"></i></span>
      <span class="exercise-item-copy"><strong>${item.name}</strong><small>${item.category} <span>·</span> ${item.equipment}</small></span>
      <span class="exercise-duration">${item.duration} <small>min</small></span>
    </label>`).join("");
  const count = `${completed.size}/${dailyExercises.length} DONE`;
  document.getElementById("schedule-count").textContent = count;
  document.getElementById("weekly-completion").textContent = completed.size;
  document.getElementById("exercise-categories").innerHTML = exerciseCategories.map(category => `
    <article class="category-card"><span class="category-icon ${category.tone}"><i class="fa-solid ${category.icon}"></i></span><div><strong>${category.name}</strong><p>${category.detail}</p></div><i class="fa-solid fa-arrow-up-right-from-square category-arrow"></i></article>`).join("");
  list.onchange = event => {
    const checkbox = event.target.closest("[data-exercise-id]");
    if (!checkbox) return;
    if (!setExerciseComplete(state, checkbox.dataset.exerciseId, checkbox.checked)) {
      checkbox.checked = !checkbox.checked;
      onUpdate("Could not save exercise completion");
      return;
    }
    onUpdate(checkbox.checked ? "Exercise marked complete" : "Exercise marked incomplete");
  };
}
