// SolveMode
import AIResult from "./AIResult";
export function SolveMode({ result }) {
  return <AIResult result={result} mode="solve" />;
}

// ImproveMode
export function ImproveMode({ result }) {
  return <AIResult result={result} mode="improve" />;
}
