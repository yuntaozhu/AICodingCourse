import Slide from "@/components/Slide";

export default function P14() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让技术债分析变得自动化。AI 可以识别代码异味。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            技术债分析：AI 的诊断
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-90">
                全量代码库理解让技术债分析从“盲人摸象”变为“全景扫描”。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-gemini-purple text-2xl">🔍</div>
                  <div>
                    <div className="font-bold text-lg">识别代码异味</div>
                    <div className="text-xs opacity-60">自动发现冗余逻辑、过长函数和循环依赖。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-gemini-purple text-2xl">⚖️</div>
                  <div>
                    <div className="font-bold text-lg">耦合度分析</div>
                    <div className="text-xs opacity-60">量化模块间的依赖强度，识别架构腐化。</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-gemini-purple/30 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gemini-purple opacity-40">DEBT_AUDIT.MD</div>
              <pre className="text-xs leading-relaxed"><code className="language-markdown">{`# Technical Debt Audit
# Module: Auth
# Issue: High coupling with Database
# Debt Level: High
# Recommendation: Extract Interface
# Priority: P0 (Blocker)`}</code></pre>
              <div className="absolute bottom-3 right-3 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">DEBT VISUALIZATION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Debt Visualization */}
      <Slide backgroundColor="#050505" notes="可视化技术债能帮助团队达成共识。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">DEBT VISUALIZATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">技术债全景图</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
              <h4 className="text-red-400 font-bold mb-2 text-sm">红色区域 (Critical)</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">核心业务逻辑中的高耦合、低测试覆盖率区域。建议立即重构。</p>
            </div>
            <div className="p-5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
              <h4 className="text-yellow-400 font-bold mb-2 text-sm">黄色区域 (Warning)</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">存在代码重复或轻微违背设计模式的区域。建议在迭代中优化。</p>
            </div>
            <div className="p-5 bg-green-500/10 rounded-2xl border border-green-500/20">
              <h4 className="text-green-400 font-bold mb-2 text-sm">绿色区域 (Healthy)</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">符合架构规范、测试完备的区域。作为后续开发的模板。</p>
            </div>
          </div>
          <div className="mt-10 h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
            <div className="w-1/4 bg-red-500"></div>
            <div className="w-1/3 bg-yellow-500"></div>
            <div className="w-5/12 bg-green-500"></div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Remediation */}
      <Slide backgroundColor="#050505" notes="AI 不仅发现问题，还提供修复方案。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">AUTOMATED REMEDIATION</div>
          <h3 className="text-3xl mb-10 font-bold text-white">自动化债务偿还</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-10 text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gemini-purple flex items-center justify-center text-white text-xs">1</div>
                <h4 className="font-bold text-sm">生成重构计划</h4>
              </div>
              <p className="text-xs opacity-60 leading-relaxed">AI 提出分步骤的重构建议，确保每一步都是可验证、不破坏现有功能的。</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gemini-purple flex items-center justify-center text-white text-xs">2</div>
                <h4 className="font-bold text-sm">自动执行修复</h4>
              </div>
              <p className="text-xs opacity-60 leading-relaxed">开发者确认后，AI 自动执行代码修改、测试运行和文档更新。技术债不再是沉重的负担。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
