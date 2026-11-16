import Slide from "@/components/Slide";

export default function P30() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="实战练习：构建一个 AI 驱动的测试生成工具。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text text-center">
            实战：AI 驱动的测试生成工具
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed opacity-80">
                构建一个能够自动分析代码、生成全方位测试用例并确保 100% 逻辑覆盖的工具。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动生成单元测试</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动生成集成测试</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动生成 PBT 测试</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="font-mono text-xs text-gemini-purple/80 leading-relaxed">
                  <code>{`# Test Generation
# Target: Auth Module
# Tool: AI Coding
# Result: 100% Coverage
# Edge Cases: Handled
# Status: All Tests Passed ✅`}</code>
                </pre>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">EDGE CASE DISCOVERY ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Edge Case Discovery */}
      <Slide backgroundColor="#050505" notes="AI 擅长发现人类容易忽略的边界条件。">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">EDGE CASE DISCOVERY</div>
          <h3 className="text-3xl mb-6 font-bold text-white">边界探索：挖掘隐藏风险</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">异常输入模拟</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 自动生成各种极端输入（如超长字符串、非法字符、空值、并发冲突等），测试系统的健壮性和错误处理机制。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">逻辑路径覆盖</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                通过静态分析代码分支，AI 确保生成的测试用例能够覆盖到每一个 if/else、switch 和异常捕获块，消除测试盲区。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Regression Test Suite */}
      <Slide backgroundColor="#050505" notes="AI 能够自动维护和更新回归测试集。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">REGRESSION TEST SUITE</div>
          <h3 className="text-3xl mb-8 font-bold text-white">回归测试：守护代码质量</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">变更感知测试更新</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                每当代码发生变更，AI 自动识别受影响的测试用例并进行更新，或者生成新的测试用例来验证新功能的正确性。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">测试用例精简</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 定期分析测试套件，识别并移除冗余或无效的测试用例，保持测试套件的高效和可维护性。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
