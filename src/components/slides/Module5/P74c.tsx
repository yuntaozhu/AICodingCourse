import Slide from "@/components/Slide";

export default function P74c() {
  return (
    <Slide backgroundColor="#020205" notes="DoD 的提示词设计是质量闭环的关键。它不是简单的‘帮我检查代码’，而是‘根据我的 DoD 规范，验证该 PR 是否满足所有质量红线’。AI 能够自动运行测试、扫描漏洞、分析性能，并生成详细的 DoD 报告。不满足 DoD 的 PR 将被自动打回并附带修复建议。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">DoD 验证提示词与自动化闭环</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">DoD 验证提示词 (Prompt)</h3>
              <pre className="text-[10px] font-mono text-gemini-cyan/80 bg-black/40 p-4 rounded-xl border border-white/10 whitespace-pre-wrap">
{`# Role: Quality Assurance Agent
# Task: Verify DoD for PR #[ID]
# DoD Standards:
1. Unit Test Coverage > 90%
2. No High/Critical Security Vulnerabilities
3. Performance: Response Time < 200ms
4. Code Style: ESLint/Prettier Compliant
5. Documentation: JSDoc for all public APIs
# Execution: Run automated checks and report status.`}
              </pre>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">自动化质量闭环</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center text-xl">🛠️</div>
                  <div className="text-xs"><strong>AI Agent:</strong> 自动执行测试与扫描。</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-xl">📊</div>
                  <div className="text-xs"><strong>AI Judge:</strong> 对比 DoD 规范与执行结果。</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center text-xl">🔄</div>
                  <div className="text-xs"><strong>Loop:</strong> 自动打回并提供修复建议。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
