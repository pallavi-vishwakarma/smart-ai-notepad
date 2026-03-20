/**
 * AI Service - Google Gemini (FREE)
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const checkAI = () => {
  if (!genAI) throw new Error("GEMINI_API_KEY not set in .env");
};

const askGemini = async (prompt) => {
  checkAI();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ─── Explain Mode ─────────────────────────────────────────────────
const explainText = async (text) => {
  return await askGemini(`
Tu ek helpful teacher hai jo Hinglish (Hindi + English mix) mein explain karta hai.
Yeh content explain kar simple words mein:

"${text}"

Provide:
## 💡 Simple Explanation
(2-3 lines mein explain karo)

## 🔑 Key Concepts
- Point 1
- Point 2
- Point 3

## 🌍 Real World Example
(ek example do)

## 📝 Hindi Summary
(Hindi mein ek line summary)
`);
};

// ─── Diagram Mode ──────────────────────────────────────────────────
const generateDiagram = async (text, diagramType = "flowchart") => {
  const prompts = {
    flowchart: `Generate a Mermaid.js flowchart for this content.
Return ONLY valid Mermaid code inside \`\`\`mermaid blocks.
Use: flowchart TD
Content: "${text}"`,

    mindmap: `Generate a Mermaid.js mindmap for this content.
Return ONLY valid Mermaid code inside \`\`\`mermaid blocks.
Use: mindmap keyword.
Content: "${text}"`,

    sequence: `Generate a Mermaid.js sequence diagram for this content.
Return ONLY valid Mermaid code inside \`\`\`mermaid blocks.
Use: sequenceDiagram keyword.
Content: "${text}"`,

    ascii: `Generate a clean ASCII diagram for this content.
Use ASCII characters: +, -, |, -->, boxes and arrows.
Content: "${text}"`,
  };

  const diagram = await askGemini(prompts[diagramType] || prompts.flowchart);
  return { diagram, type: diagramType };
};

// ─── Solve Mode ────────────────────────────────────────────────────
const solveText = async (text) => {
  return await askGemini(`
Tu ek expert problem solver hai. Is problem ko analyze karke solve karo:

"${text}"

Provide:
## 🔍 Problem Detection
- Main problem kya hai?
- Root cause kya hai?

## 🛠️ Step-by-Step Solution
1. Pehla step
2. Doosra step
3. Teesra step

## ✅ Verification
- Solution kaise verify karein?

## 💡 Prevention Tips
- Future mein kaise bachein?
`);
};

// ─── Improve Mode ──────────────────────────────────────────────────
const improveText = async (text) => {
  return await askGemini(`
Tu ek professional editor hai. Is text ko improve karo:

"${text}"

Provide:
## ✨ Improved Version
(improved text yahan likho)

## 📝 Changes Made
- Grammar fixes
- Clarity improvements
- Structure changes

## 📊 Quality Score
- Original: X/10
- Improved: X/10
`);
};

// ─── Summarize ─────────────────────────────────────────────────────
const summarizeText = async (text) => {
  return await askGemini(`
Is text ka concise summary do in 3-5 bullet points:

"${text}"
`);
};

// ─── Bullet Points ─────────────────────────────────────────────────
const toBulletPoints = async (text) => {
  return await askGemini(`
Is text ko clear bullet points mein convert karo.
Nested bullets use karo jahan zaroorat ho:

"${text}"
`);
};

// ─── Extract Problems ───────────────────────────────────────────────
const extractProblems = async (text) => {
  return await askGemini(`
Is text se saare problems aur issues extract karo.
Har problem ke saath severity batao (High/Medium/Low):

"${text}"
`);
};

// ─── Suggest Solutions ──────────────────────────────────────────────
const suggestSolutions = async (text) => {
  return await askGemini(`
 Is context ke liye 3-5 practical solutions suggest karo.
 Har solution ke pros aur cons batao:

"${text}"
`);
};

// ─── Auto Detect ────────────────────────────────────────────────────
const detectAndSuggest = async (text) => {
  if (!genAI) return { 
    type: "general", 
    suggestion: "Add GEMINI_API_KEY to enable AI", 
    action: "improve" 
  };
  
  try {
    const response = await askGemini(`
Analyze this text and respond ONLY with valid JSON, nothing else:
{"type":"problem|concept|process|list|code|general","suggestion":"one sentence about best AI action","action":"explain|diagram|solve|improve|summarize"}

Text: "${text.substring(0, 300)}"
`);
    const clean = response.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { type: "general", suggestion: "Try AI panel", action: "improve" };
  }
};

module.exports = {
  explainText, generateDiagram, solveText, improveText,
  summarizeText, toBulletPoints, extractProblems,
  suggestSolutions, detectAndSuggest
};