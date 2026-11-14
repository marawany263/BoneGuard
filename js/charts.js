import { weeklyPlan } from "../data/exercise-data.js";
import { getTodayKey } from "./storage.js";

const chartInstances = new Map();
const colors = { cyan: "#40d9e8", blue: "#6b8cff", violet: "#9b8cff", grid: "rgba(151,177,205,.10)", text: "#8394aa" };

function destroyChart(id) {
  if (chartInstances.has(id)) {
    chartInstances.get(id).destroy();
    chartInstances.delete(id);
  }
}

function baseOptions(yTitle, beginAtZero) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111e31",
        borderColor: "rgba(108,150,193,.2)",
        borderWidth: 1,
        titleColor: "#f4f8fc",
        bodyColor: "#b7c5d5",
        padding: 11,
        displayColors: true
      }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.text, font: { family: "DM Sans", size: 10 } } },
      y: { beginAtZero, grid: { color: colors.grid }, border: { display: false }, ticks: { color: colors.text, font: { family: "DM Sans", size: 10 } }, title: { display: Boolean(yTitle), text: yTitle, color: colors.text, font: { family: "DM Sans", size: 10 } } }
    }
  };
}

function createLineChart(canvasId, labels, datasets, yTitle, beginAtZero) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;
  destroyChart(canvasId);
  const chart = new Chart(canvas, {
    type: "line",
    data: { labels, datasets: datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.color || (index ? colors.blue : colors.cyan),
      backgroundColor: dataset.fillColor || "rgba(64,217,232,.08)",
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: dataset.color || (index ? colors.blue : colors.cyan),
      pointBorderColor: "#101a2a",
      pointBorderWidth: 2,
      tension: .35,
      fill: dataset.fill || false
    })) },
    options: baseOptions(yTitle, beginAtZero)
  });
  chartInstances.set(canvasId, chart);
}

export function renderCharts(state) {
  const readings = [...state.readings].sort((a, b) => a.date.localeCompare(b.date));
  const dates = [...new Set(readings.map(item => item.date))].sort();
  const labels = dates.map(date => new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  const siteSeries = ["Whole body", "Hip", "Leg"].map((site, index) => ({
    label: `${site} estimate · g/cm²`,
    data: dates.map(date => {
      const record = readings.find(item => item.date === date && item.site === site);
      return record ? Number(record.density) : null;
    }),
    color: [colors.cyan, colors.blue, colors.violet][index]
  }));
  createLineChart("density-chart", labels, [{ ...siteSeries[0], fill: true }], "g/cm²", false);
  createLineChart("monitor-density-chart", labels, siteSeries, "g/cm²", false);
  const labReadings = dates.map(date => readings.find(item => item.date === date));
  createLineChart("lab-chart", labels, [
    { label: "Calcium · mg/dL", data: labReadings.map(item => item ? Number(item.calcium) : null), color: colors.cyan },
    { label: "Vitamin D · ng/mL", data: labReadings.map(item => item ? Number(item.vitaminD) : null), color: colors.violet }
  ], "Simulated lab values", false);

  const weekly = weeklyPlan.map((entry, index) => {
    if (index !== weeklyPlan.length - 1) return entry;
    const todayDone = state.completedExercises[getTodayKey()] || [];
    return { ...entry, completed: todayDone.length };
  });
  const bars = {
    labels: weekly.map(item => item.day),
    datasets: [
      { label: "Planned", data: weekly.map(item => item.planned), backgroundColor: "rgba(122,145,174,.18)", borderRadius: 4, barPercentage: .55, categoryPercentage: .65 },
      { label: "Completed", data: weekly.map(item => item.completed), backgroundColor: colors.cyan, borderRadius: 4, barPercentage: .55, categoryPercentage: .65 }
    ]
  };
  ["exercise-chart", "weekly-exercise-chart"].forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) return;
    destroyChart(id);
    chartInstances.set(id, new Chart(canvas, {
      type: "bar",
      data: bars,
      options: {
        ...baseOptions("", true),
        plugins: {
          ...baseOptions("", true).plugins,
          legend: { display: false },
          tooltip: { ...baseOptions("").plugins.tooltip, callbacks: { label: context => ` ${context.dataset.label}: ${context.parsed.y}` } }
        },
        scales: {
          x: { ...baseOptions("").scales.x, stacked: false },
          y: { ...baseOptions("").scales.y, max: 3, ticks: { ...baseOptions("").scales.y.ticks, stepSize: 1 } }
        }
      }
    }));
  });
}
