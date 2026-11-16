import Slide from "@/components/Slide";

export default function P8() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="DoD (Definition of Done) 是 SDD 的延伸。它定义了完成的标准。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            DoD: 验证 AI 的输出
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-xl font-bold mb-2">什么是 DoD?</h3>
                <p className="text-base opacity-70 leading-relaxed">
                  Definition of Done (DoD) 是 SDD 的延伸。它定义了任务“完成”的客观标准，而非主观感受。
                </p>
              </div>
              <div className="p-5 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/30">
                <h3 className="text-xl font-bold mb-2">自动化验证环</h3>
                <p className="text-base opacity-70 leading-relaxed">
                  AI 生成代码后，系统自动触发测试、Lint、安全扫描和性能评估，闭环验证 DoD。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-64 h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-full flex items-center justify-center animate-spin-slow">
                <div className="absolute inset-0 flex items-center justify-center rotate-0">
                  <div className="w-3 h-3 bg-gemini-cyan rounded-full -translate-y-24"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-120">
                  <div className="w-3 h-3 bg-gemini-purple rounded-full -translate-y-24"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rotate-240">
                  <div className="w-3 h-3 bg-white rounded-full -translate-y-24"></div>
                </div>
                <span className="text-xl font-mono text-gemini-cyan animate-none">DoD LOOP</span>
              </div>
              <div className="absolute bottom-0 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">VERIFICATION DETAILS ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Static Verification */}
      <Slide backgroundColor="#050505" notes="静态验证是第一道防线。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">第一层：静态验证 (Static Verification)</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                <span>Lint & Style Check</span>
                <span className="text-green-400 font-bold">PASS</span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                <span>Type Safety (TS/Go/Rust)</span>
                <span className="text-green-400 font-bold">PASS</span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center text-sm">
                <span>Security Static Scan (SAST)</span>
                <span className="text-green-400 font-bold">PASS</span>
              </div>
            </div>
            <div className="p-5 bg-black/40 rounded-xl border border-white/10 italic text-xs opacity-60 flex items-center">
              "AI 代理会自动修复 Lint 错误和类型不匹配，直到通过所有静态检查。这确保了交付给人类的代码至少在语法和基础规范上是完美的。"
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Dynamic Verification */}
      <Slide backgroundColor="#050505" notes="动态验证确保业务逻辑正确。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-purple">第二层：动态验证 (Dynamic Verification)</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-gemini-purple/10 rounded-xl border border-gemini-purple/20">
              <h4 className="font-bold mb-2 text-sm">Unit Tests</h4>
              <p className="text-xs opacity-60 leading-relaxed">AI 自动生成测试用例，覆盖 100% 的 Spec 逻辑路径。</p>
            </div>
            <div className="p-5 bg-gemini-purple/10 rounded-xl border border-gemini-purple/20">
              <h4 className="font-bold mb-2 text-sm">Integration Tests</h4>
              <p className="text-xs opacity-60 leading-relaxed">验证新生成的模块与现有系统的交互是否符合预期。</p>
            </div>
            <div className="p-5 bg-gemini-purple/10 rounded-xl border border-gemini-purple/20">
              <h4 className="font-bold mb-2 text-sm">Perf Benchmarks</h4>
              <p className="text-xs opacity-60 leading-relaxed">自动运行基准测试，确保代码变更不会导致性能退化。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: DoD Prompt Engineering */}
      <Slide backgroundColor="#050505" notes="DoD 提示词定义了验收的标准。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">PROMPT ENGINEERING</div>
          <h3 className="text-3xl mb-8 font-bold text-white">DoD 开发提示词模板</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-black/60 p-5 rounded-xl border border-gemini-cyan/30 font-mono text-[9px] text-white/60">
              <div className="text-gemini-cyan mb-2"># DoD Prompt Example</div>
              <div>Act as a QA Engineer.</div>
              <div>Define DoD for the "Payment Module".</div>
              <div className="mt-2">## Acceptance Criteria:</div>
              <div>- 100% Unit Test Coverage.</div>
              <div>- No ESLint warnings.</div>
              <div>- Response time &lt; 200ms.</div>
              <div>- Passed Security Scan (Snyk).</div>
              <div className="mt-2">## Verification Script:</div>
              <div>- Run `npm test` and `npm run lint`.</div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">可量化 (Quantifiable)</h4>
                <p className="text-[10px] opacity-60">"覆盖率必须达到 80%" 而不是 "写一些测试"。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">可执行 (Executable)</h4>
                <p className="text-[10px] opacity-60">提供明确的验证脚本或命令。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-gemini-cyan mb-2">多维度 (Multi-dimensional)</h4>
                <p className="text-[10px] opacity-60">涵盖功能、性能、安全和代码质量。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: AI-Driven DoD Validation */}
      <Slide backgroundColor="#050505" notes="AI 如何自动闭环验证 DoD。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">AUTOMATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">AI Coding 如何使用 DoD</h3>
          <div className="p-8 bg-gemini-cyan/5 rounded-3xl border border-gemini-cyan/20">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">📝</div>
                <div className="text-[10px] font-bold">Define DoD</div>
              </div>
              <div className="h-px flex-1 bg-white/10 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">🤖</div>
                <div className="text-[10px] font-bold">AI Execution</div>
              </div>
              <div className="h-px flex-1 bg-white/10 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gemini-cyan/20 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">✅</div>
                <div className="text-[10px] font-bold text-gemini-cyan">Auto Verify</div>
              </div>
              <div className="h-px flex-1 bg-white/10 mx-4"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">🚢</div>
                <div className="text-[10px] font-bold">Deploy</div>
              </div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/10">
              <p className="text-xs leading-relaxed opacity-70">
                <span className="text-gemini-cyan font-bold">AI 代理的职责：</span> 如果 DoD 验证失败（如测试未通过），AI 代理会<span className="text-white font-bold">自动分析失败原因</span>，修改代码，并重新运行验证，直到 100% 达成 DoD。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
