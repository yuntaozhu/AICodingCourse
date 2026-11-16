import Slide from "@/components/Slide";

export default function P36() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 闭环是 Agent 的核心能力。Agent 可以自动完成任务并验证。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text text-center">
            Agent 闭环：从任务到验证
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed opacity-80">
                Agent 不仅仅是代码生成器，它是一个能够自主执行、验证并修复错误的闭环系统。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动执行任务</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动验证任务结果</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动修复任务中的问题</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="font-mono text-xs text-gemini-purple/80 leading-relaxed">
                  <code>{`# Agent Loop
# Task: Create API
# Action: 
# 1. Generate code
# 2. Run tests
# 3. Fix errors
# 4. Verify API
# Status: Fully Verified ✅`}</code>
                </pre>
              </div>
              <div className="absolute -bottom-3 -right-3 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">SELF-CORRECTION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Self-Correction Loop */}
      <Slide backgroundColor="#050505" notes="AI 在执行过程中能够根据错误信息自动调整策略。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">SELF-CORRECTION</div>
          <h3 className="text-3xl mb-6 font-bold text-white">自我修复：在错误中进化</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">编译与运行时错误处理</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                当代码编译失败 or 运行报错时，Agent 自动捕获错误堆栈，分析原因并重新生成代码，直到通过所有静态检查。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">逻辑偏差修正</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                如果测试结果与预期不符，Agent 会重新审视需求说明 and 设计稿，识别逻辑理解上的偏差并进行针对性修复。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Verification Strategies */}
      <Slide backgroundColor="#050505" notes="Agent 使用多种手段确保任务交付的质量。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">VERIFICATION STRATEGIES</div>
          <h3 className="text-3xl mb-10 font-bold text-white">多维验证：确保交付质量</h3>
          <div className="grid grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-purple">
              <h4 className="text-sm font-bold mb-1">自动化测试验证</h4>
              <p className="text-[10px] opacity-60 leading-tight">通过运行单元测试、集成测试 and 端到端测试，确保功能逻辑的正确性。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-cyan">
              <h4 className="text-sm font-bold mb-1">视觉回归测试</h4>
              <p className="text-[10px] opacity-60 leading-tight">针对 UI 变更，Agent 自动进行像素级对比，确保视觉呈现符合设计稿要求。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-purple">
              <h4 className="text-sm font-bold mb-1">性能与安全基准</h4>
              <p className="text-[10px] opacity-60 leading-tight">自动执行性能压测 and 安全扫描，确保交付的代码满足非功能性需求标准。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
