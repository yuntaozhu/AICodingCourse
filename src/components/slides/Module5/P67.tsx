import Slide from "@/components/Slide";

export default function P67() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#020205" notes="传统的开发模式是：人写代码，机器跑测试。AI Native 模式下，AI 写代码，如果还是人去测试，那你就成了 AI 的‘保姆’。这种‘人肉 QA’模式不可持续。我们需要的是将评估逻辑前置，让 AI 产出的每一行代码都经过确定性的验证。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            “人肉 QA”的陷阱
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
              <h3 className="text-2xl mb-4 text-red-400 font-bold">传统模式：人肉瓶颈</h3>
              <ul className="space-y-4 text-lg opacity-70">
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✕</span>
                  <span>人工 Code Review：耗时且主观</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✕</span>
                  <span>随机抽样测试：覆盖率无法保证</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✕</span>
                  <span>依赖经验判断：知识难以沉淀</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-purple/10 p-6 rounded-3xl border border-gemini-purple/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden group">
              <h3 className="text-2xl mb-4 text-gemini-cyan font-bold">AI Native：确定性验证</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center gap-3">
                  <span className="text-gemini-cyan">✓</span>
                  <span>自动化语义验证：机器理解意图</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gemini-cyan">✓</span>
                  <span>100% 覆盖率监控：无死角扫描</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gemini-cyan">✓</span>
                  <span>确定性架构约束：规则即法律</span>
                </li>
              </ul>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">MANUAL BOTTLENECK ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Manual Bottleneck */}
      <Slide backgroundColor="#050505" notes="展示人工审核在 AI 时代面临的挑战。">
        <div className="flex flex-col justify-center h-full text-center max-w-5xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2 tracking-widest">MANUAL BOTTLENECK</div>
          <h3 className="text-3xl mb-10 font-bold text-white">人工审核：AI 时代的效能杀手</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-red-400">速度失配</h4>
              <p className="text-sm opacity-60 leading-relaxed">
                AI 可以在秒级生成成千上万行代码，而人类专家每天只能深度 Review 几百行。这种吞吐量的巨大差异会导致严重的研发阻塞。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-red-400">疲劳与疏漏</h4>
              <p className="text-sm opacity-60 leading-relaxed">
                面对海量的 AI 生成代码，人类审核者极易产生视觉疲劳，导致低级错误或安全漏洞在眼皮底下溜走。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Guardrails */}
      <Slide backgroundColor="#050505" notes="如何通过自动化手段建立质量防线。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2 tracking-widest">AUTOMATED GUARDRAILS</div>
          <h3 className="text-3xl mb-10 font-bold text-white text-center">自动化护栏：构建确定性的质量体系</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-gemini-cyan transition-colors">
              <div className="text-2xl mb-3">🛡️</div>
              <h4 className="text-base font-bold mb-2 text-gemini-cyan">静态规则引擎</h4>
              <p className="text-[10px] opacity-50">强制执行 Lint、安全扫描和架构约束，不符合规范的代码无法进入下一步。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-gemini-purple transition-colors">
              <div className="text-2xl mb-3">🧪</div>
              <h4 className="text-base font-bold mb-2 text-gemini-purple">动态验证沙箱</h4>
              <p className="text-[10px] opacity-50">自动运行单元测试、集成测试，并在隔离环境中验证业务逻辑的正确性。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center hover:border-gemini-cyan transition-colors">
              <div className="text-2xl mb-3">📊</div>
              <h4 className="text-base font-bold mb-2 text-gemini-cyan">语义一致性检查</h4>
              <p className="text-[10px] opacity-50">利用 LLM 对比代码实现与需求文档的语义差异，确保“所写即所得”。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
