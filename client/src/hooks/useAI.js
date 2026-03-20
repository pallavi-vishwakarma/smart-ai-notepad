/**
 * useAI - Hook for AI panel state and actions
 */
import { useState, useCallback } from "react";
import { aiApi } from "../api/aiApi";
import toast from "react-hot-toast";

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("explain"); // explain | diagram | solve | improve
  const [error, setError] = useState(null);

  const run = useCallback(async (text, selectedMode, options = {}) => {
    if (!text?.trim()) {
      toast.error("Please select or enter some text first");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      switch (selectedMode || mode) {
        case "explain":
          data = await aiApi.explain(text);
          break;
        case "diagram":
          data = await aiApi.diagram(text, options.diagramType || "flowchart");
          break;
        case "solve":
          data = await aiApi.solve(text);
          break;
        case "improve":
          data = await aiApi.improve(text);
          break;
        case "summarize":
          data = await aiApi.summarize(text);
          break;
        case "bullets":
          data = await aiApi.bullets(text);
          break;
        case "extract-problems":
          data = await aiApi.extractProblems(text);
          break;
        case "suggest-solutions":
          data = await aiApi.suggestSolutions(text);
          break;
        default:
          data = await aiApi.explain(text);
      }
      setResult(data.result);
      return data.result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, mode, setMode, error, run, clear };
};
