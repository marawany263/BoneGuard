export const astronaut = {
  name: "Alex Morgan",
  missionId: "BG-2026-01",
  durationDays: 120,
  environment: "Microgravity",
  role: "Commander"
};

const visits = [
  { date: "2026-08-20", whole: 1.052, hip: 1.041, leg: 1.068, calcium: 9.5, vitaminD: 32.4 },
  { date: "2026-09-10", whole: 1.049, hip: 1.039, leg: 1.066, calcium: 9.4, vitaminD: 31.7 },
  { date: "2026-09-30", whole: 1.047, hip: 1.037, leg: 1.063, calcium: 9.3, vitaminD: 30.8 },
  { date: "2026-10-20", whole: 1.044, hip: 1.034, leg: 1.060, calcium: 9.4, vitaminD: 31.2 },
  { date: "2026-11-12", whole: 1.041, hip: 1.032, leg: 1.057, calcium: 9.2, vitaminD: 29.8 }
];

export const initialReadings = visits.flatMap((visit, index) => [
  { id: `r-${index}-whole`, date: visit.date, site: "Whole body", density: visit.whole, calcium: visit.calcium, vitaminD: visit.vitaminD, source: index === 0 ? "Simulated baseline" : "Simulated estimate + lab" },
  { id: `r-${index}-hip`, date: visit.date, site: "Hip", density: visit.hip, calcium: visit.calcium, vitaminD: visit.vitaminD, source: "Simulated estimate + lab" },
  { id: `r-${index}-leg`, date: visit.date, site: "Leg", density: visit.leg, calcium: visit.calcium, vitaminD: visit.vitaminD, source: "Simulated estimate + lab" }
]);
