import api from "./axiosInstance";

export const aiApi = {
  explain: (text) => api.post("/ai/explain", { text }).then((r) => r.data),
  diagram: (text, diagramType) => api.post("/ai/diagram", { text, diagramType }).then((r) => r.data),
  solve: (text) => api.post("/ai/solve", { text }).then((r) => r.data),
  improve: (text) => api.post("/ai/improve", { text }).then((r) => r.data),
  summarize: (text) => api.post("/ai/summarize", { text }).then((r) => r.data),
  bullets: (text) => api.post("/ai/bullets", { text }).then((r) => r.data),
  extractProblems: (text) => api.post("/ai/extract-problems", { text }).then((r) => r.data),
  suggestSolutions: (text) => api.post("/ai/suggest-solutions", { text }).then((r) => r.data),
  detect: (text) => api.post("/ai/detect", { text }).then((r) => r.data),
};
