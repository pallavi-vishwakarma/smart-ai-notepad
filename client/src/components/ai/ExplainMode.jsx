// ExplainMode - renders explanation results
import AIResult from "./AIResult";
export default function ExplainMode({ result }) {
  return <AIResult result={result} mode="explain" />;
}
