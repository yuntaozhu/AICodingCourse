import { useState } from "react";
import Slide from "@/components/Slide";
import { reviewCode } from "@/lib/gemini";
import Markdown from "react-markdown";

export default function P85d() {
  const [code, setCode] = useState(`// Example code with some issues
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  const result = db.execute(query);
  
  for (let i = 0; i < result.length; i++) {
    const user = result[i];
    const posts = db.execute("SELECT * FROM posts WHERE userId = " + user.id);
    user.posts = posts;
  }
  
  return result;
}`);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReview = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await reviewCode(code);
      setFeedback(result || "No feedback generated.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during the review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slide backgroundColor="#020205" notes="这是一个实时演示。我们可以将 AI Coding 集成到 CI/CD 中，让它在代码提交时自动进行深度分析。它不仅能发现 SQL 注入等安全风险，还能识别出 N+1 查询等性能瓶颈，并提出架构上的优化建议。这正是 AI 驱动的研发效能的核心体现。">
      <div className="flex flex-col h-full">
        <h2 className="text-4xl mb-6 font-bold text-gemini-cyan italic">Live Demo: AI Coding AI Code Reviewer</h2>
        
        <div className="grid grid-cols-2 gap-8 flex-1 min-h-0">
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="bg-white/10 p-3 flex justify-between items-center">
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Input Code</span>
                <button 
                  onClick={handleReview}
                  disabled={loading}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                    loading ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-gemini-purple text-white hover:scale-105'
                  }`}
                >
                  {loading ? 'Reviewing...' : 'Review Code'}
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 bg-transparent font-mono text-xs text-gemini-cyan/80 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="bg-white/10 p-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-widest">AI Feedback</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-gemini-purple">
                    <div className="w-12 h-12 border-4 border-gemini-purple/20 border-t-gemini-purple rounded-full animate-spin"></div>
                    <div className="text-sm font-mono animate-pulse tracking-widest">AI Coding Analyzing...</div>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-red-400 text-xs font-mono">
                    {error}
                  </div>
                ) : feedback ? (
                  <div className="markdown-body text-xs text-white/80 leading-relaxed">
                    <Markdown>{feedback}</Markdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/20 italic text-sm">
                    Click "Review Code" to start the AI analysis.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <div className="flex-1 p-3 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-gemini-purple/20 rounded-lg flex items-center justify-center text-sm">🏗️</div>
            <div className="text-[10px] opacity-60">Architecture: DDD, Modularity, Decoupling</div>
          </div>
          <div className="flex-1 p-3 bg-red-500/10 rounded-xl border border-red-500/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-sm">🛡️</div>
            <div className="text-[10px] opacity-60">Security: SQLi, XSS, CSRF, Data Leaks</div>
          </div>
          <div className="flex-1 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-sm">⚡</div>
            <div className="text-[10px] opacity-60">Performance: O(n) queries, Memory, Re-renders</div>
          </div>
          <div className="flex-1 p-3 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-gemini-cyan/20 rounded-lg flex items-center justify-center text-sm">✨</div>
            <div className="text-[10px] opacity-60">Best Practices: Naming, Readability, Maintenance</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
