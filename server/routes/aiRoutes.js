const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  explain, diagram, solve, improve,
  summarize, bullets, extractProblems, suggestSolutions, detect
} = require("../controllers/aiController");

router.use(protect);

router.post("/explain", explain);
router.post("/diagram", diagram);
router.post("/solve", solve);
router.post("/improve", improve);
router.post("/summarize", summarize);
router.post("/bullets", bullets);
router.post("/extract-problems", extractProblems);
router.post("/suggest-solutions", suggestSolutions);
router.post("/detect", detect);

module.exports = router;
