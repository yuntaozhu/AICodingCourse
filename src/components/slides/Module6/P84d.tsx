import Slide from "@/components/Slide";

export default function P84d() {
  return (
    <Slide backgroundColor="#020205" notes="在某大型 SaaS 项目中，我们建立了一个由 3 个 Agent 组成的研发团队。当一个新的 Issue 被创建时，Architect Agent 首先分析需求并生成 SDD。接着，Coder Agent 根据 SDD 自动生成代码并编写测试。最后，Reviewer Agent 验证代码是否满足 DoD 规范。整个过程无需任何人工干预，从 Issue 到 PR 仅需 10 分钟。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">案例：多 Agent 协同的 Issue-to-PR 闭环</h2>
        <div className="flex gap-12">
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">项目背景：SaaS 平台功能迭代</h3>
              <ul className="text-sm space-y-3 opacity-70">
                <li>• <strong className="text-white">输入：</strong> 一个包含业务逻辑变更的 GitHub Issue。</li>
                <li>• <strong className="text-white">输出：</strong> 一个包含完整代码、测试和 DoD 报告的 PR。</li>
                <li>• <strong className="text-white">耗时：</strong> 10 分钟 (传统研发需 2-4 小时)。</li>
              </ul>
            </div>
            <div className="p-6 bg-gemini-purple/20 rounded-2xl border border-gemini-purple/40">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">协作工作流</h3>
              <div className="flex justify-between items-center text-center text-[10px]">
                <div className="flex-1 p-2 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-xl mb-1">📐</div>
                  <div>SDD 生成</div>
                </div>
                <div className="text-gemini-cyan">→</div>
                <div className="flex-1 p-2 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-xl mb-1">💻</div>
                  <div>代码实现</div>
                </div>
                <div className="text-gemini-cyan">→</div>
                <div className="flex-1 p-2 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-xl mb-1">🛡️</div>
                  <div>DoD 验证</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-8xl font-bold text-gemini-cyan mb-4">10X+</div>
            <div className="text-xl opacity-50 uppercase tracking-widest">Velocity Boost</div>
            <p className="mt-8 text-sm opacity-60 italic text-center">“Agent 协作让研发流水线从‘串行’变为‘并行’。”</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
