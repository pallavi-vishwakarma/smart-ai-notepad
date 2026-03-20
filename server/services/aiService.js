import OpenAI from "openai";
import process from "process";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MODEL = "gpt-4o-mini";

const checkOpenAI = () => {
  if (!openai) throw new Error("OpenAI API key not configured. Add OPENAI_API_KEY to server/.env");
};

const explainText = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You are a helpful tutor who explains concepts in simple English and Hindi (Hinglish). Use bullet points, examples, and analogies. Format with markdown." },
      { role: "user", content: `Explain in simple Hinglish:\n\n"${text}"\n\nProvide:\n1. Simple explanation\n2. Key concepts\n3. Real-world example\n4. Quick Hindi summary` }
    ],
    max_tokens: 800, temperature: 0.7,
  });
  return response.choices[0].message.content;
};

const generateDiagram = async (text, diagramType = "flowchart") => {
  checkOpenAI();
  const prompts = {
    flowchart: "Generate a Mermaid.js flowchart. Return ONLY valid Mermaid syntax in ```mermaid blocks. Use flowchart TD.",
    mindmap:   "Generate a Mermaid.js mindmap. Return ONLY valid Mermaid syntax in ```mermaid blocks.",
    sequence:  "Generate a Mermaid.js sequence diagram. Return ONLY valid Mermaid syntax in ```mermaid blocks.",
    ascii:     "Generate a clean ASCII diagram. Use +, -, |, arrows, boxes.",
  };
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: prompts[diagramType] || prompts.flowchart },
      { role: "user",   content: text }
    ],
    max_tokens: 1000, temperature: 0.3,
  });
  return { diagram: response.choices[0].message.content, type: diagramType };
};

const solveText = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You are an expert problem solver. Analyze problems and give step-by-step solutions with markdown formatting." },
      { role: "user",   content: `Solve this:\n\n"${text}"\n\nProvide:\n## Problem Detection\n## Step-by-Step Solution\n## Verification\n## Prevention Tips` }
    ],
    max_tokens: 1000, temperature: 0.4,
  });
  return response.choices[0].message.content;
};

const improveText = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You are a professional editor. Improve text for clarity, grammar, and structure." },
      { role: "user",   content: `Improve this text:\n\n"${text}"\n\nProvide:\n## Improved Version\n## Changes Made\n## Quality Score` }
    ],
    max_tokens: 1000, temperature: 0.5,
  });
  return response.choices[0].message.content;
};

const summarizeText = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You are an expert summarizer. Create concise bullet-point summaries." },
      { role: "user",   content: `Summarize in 3-5 bullet points:\n\n"${text}"` }
    ],
    max_tokens: 400, temperature: 0.3,
  });
  return response.choices[0].message.content;
};

const toBulletPoints = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "Convert text into clear bullet points. Use nested bullets where appropriate." },
      { role: "user",   content: `Convert to bullet points:\n\n"${text}"` }
    ],
    max_tokens: 600, temperature: 0.3,
  });
  return response.choices[0].message.content;
};

const extractProblems = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "Extract all problems and issues from text. List each with severity (High/Medium/Low)." },
      { role: "user",   content: `Extract problems from:\n\n"${text}"` }
    ],
    max_tokens: 600, temperature: 0.3,
  });
  return response.choices[0].message.content;
};

const suggestSolutions = async (text) => {
  checkOpenAI();
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "Suggest practical, actionable solutions. Provide 3-5 options with pros and cons." },
      { role: "user",   content: `Suggest solutions for:\n\n"${text}"` }
    ],
    max_tokens: 800, temperature: 0.6,
  });
  return response.choices[0].message.content;
};

const detectAndSuggest = async (text) => {
  if (!openai) return { type: "general", suggestion: "Add OpenAI key to enable AI", action: "improve" };
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: `Respond ONLY with JSON: {"type":"problem|concept|process|list|code|general","suggestion":"one sentence","action":"explain|diagram|solve|improve|summarize"}` },
      { role: "user",   content: text.substring(0, 500) }
    ],
    max_tokens: 100, temperature: 0.2,
  });
  try { return JSON.parse(response.choices[0].message.content); }
  catch { return { type: "general", suggestion: "Try the AI panel", action: "improve" }; }
};

export { explainText, generateDiagram, solveText, improveText, summarizeText, toBulletPoints, extractProblems, suggestSolutions, detectAndSuggest };
