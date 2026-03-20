/**
 * AI Controller - Routes AI requests to service layer
 */

const aiService = require("../services/aiService");
const logger = require("../utils/logger");

// ─── Helper to validate text input ───────────────────────────────────────
const validateText = (text, res) => {
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Text is required" });
    return false;
  }
  if (text.trim().length < 5) {
    res.status(400).json({ error: "Text is too short (minimum 5 characters)" });
    return false;
  }
  if (text.length > 10000) {
    res.status(400).json({ error: "Text is too long (maximum 10000 characters)" });
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
    logger.info(`AI explain used by ${req.user._id}`);
    res.json({ result, mode: "explain" });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/diagram
const diagram = async (req, res, next) => {
  try {
    const { text, diagramType } = req.body;
    if (!validateText(text, res)) return;

    const result = await aiService.generateDiagram(text, diagramType || "flowchart");
    logger.info(`AI diagram (${diagramType}) used by ${req.user._id}`);
    res.json({ result, mode: "diagram" });
  } catch (error) {
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
  }
};

module.exports = { explain, diagram, solve, improve, summarize, bullets, extractProblems, suggestSolutions, detect };
