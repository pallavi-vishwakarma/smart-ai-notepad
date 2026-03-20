/**
 * AI Controller - Routes AI requests to Gemini service
 */

const aiService = require("../services/aiService");
const logger = require("../utils/logger");

// Helper to validate text
const validateText = (text, res) => {
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Text is required" });
    return false;
  }
  if (text.trim().length < 3) {
    res.status(400).json({ error: "Text too short" });
    return false;
  }
  if (text.length > 10000) {
    res.status(400).json({ error: "Text too long (max 10000 chars)" });
    return false;
  }
  return true;
};

// POST /api/ai/explain
const explain = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.explainText(text);
    res.json({ result, mode: "explain" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/diagram
const diagram = async (req, res, next) => {
  try {
    const { text, diagramType } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.generateDiagram(text, diagramType || "flowchart");
    res.json({ result, mode: "diagram" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/solve
const solve = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.solveText(text);
    res.json({ result, mode: "solve" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/improve
const improve = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.improveText(text);
    res.json({ result, mode: "improve" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/summarize
const summarize = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.summarizeText(text);
    res.json({ result, mode: "summarize" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/bullets
const bullets = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.toBulletPoints(text);
    res.json({ result, mode: "bullets" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/extract-problems
const extractProblems = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.extractProblems(text);
    res.json({ result, mode: "extract-problems" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/suggest-solutions
const suggestSolutions = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.suggestSolutions(text);
    res.json({ result, mode: "suggest-solutions" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/ai/detect
const detect = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!validateText(text, res)) return;
    const result = await aiService.detectAndSuggest(text);
    res.json({ result, mode: "detect" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  explain, diagram, solve, improve,
  summarize, bullets, extractProblems,
  suggestSolutions, detect
};