import Slide from "@/components/Slide";

export default function P20() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让代码审查变得自动化。AI 可以提供高质量审查。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            代码审查：AI 的建议
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-80">
                全量代码库理解让代码审查从“纠错”变为“赋能”。AI 能够作为 24/7 的资深 Reviewer，提供深度的逻辑分析。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">识别代码风格和规范问题</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">分析代码逻辑和边界情况</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform text-sm">▶</span>
                  <span className="font-bold text-sm">提供代码优化和重构建议</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-purple to-transparent opacity-50"></div>
              <pre className="text-xs font-mono text-gemini-purple/80">
                <code className="language-markdown">{`# Code Review
# File: main.ts
# Issue: Potential Null Pointer
# Risk Level: Medium
# Context: 'user' object might be null 
#          if the database query fails.
# Recommendation: Add null check or 
#                 use optional chaining.`}</code>
              </pre>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">CONTEXT-AWARE REVIEW ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Context-Aware Review */}
      <Slide backgroundColor="#050505" notes="AI 不仅仅看改动的几行代码，而是看整个系统的上下文。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">CONTEXT-AWARE REVIEW</div>
          <h3 className="text-3xl mb-8 font-bold text-white">深度上下文审查</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">跨文件逻辑验证</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 能够识别一个文件中的改动如何影响其他模块的逻辑。例如，修改接口定义时，自动检查所有调用方是否已适配。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">业务意图对齐</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                结合 PR 描述和全量代码，AI 能够判断代码实现是否符合预期的业务目标，而不仅仅是语法正确。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Fix Suggestions */}
      <Slide backgroundColor="#050505" notes="AI 提供的不仅仅是意见，还有直接可用的代码。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">AUTOMATED FIXES</div>
          <h3 className="text-3xl mb-10 font-bold text-white">一键修复建议</h3>
          <div className="max-w-4xl mx-auto space-y-4 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-5">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-gemini-cyan text-sm">直接代码替换</h4>
                <p className="text-[10px] opacity-50">AI 在 Review 评论中直接提供修复后的代码片段，开发者可一键采纳。</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-5">
              <div className="text-2xl">🛠️</div>
              <div>
                <h4 className="font-bold text-gemini-purple text-sm">自动化重构 PR</h4>
                <p className="text-[10px] opacity-50">对于大规模的规范调整，AI 可以自动发起一个新的 PR 来统一修复所有问题。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
