import Slide from "@/components/Slide";

export default function P39() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 治理是 Agent 的核心能力。Agent 可以自动管理研发合规。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text text-center">
            Agent 治理：研发合规的自动化
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="flex flex-col justify-center gap-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-cyan">Automated Compliance</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  Agent 实时审计研发全生命周期，确保每一行代码、每一次部署都符合行业标准（如 SOC2, ISO27001） and 公司内部安全规范。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-purple">Automated Governance</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  精细化管理计算资源、API 配额 and 人员权限。Agent 能够识别闲置资源并自动清理，实现成本 and 安全的双重治理。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-72 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="text-4xl animate-pulse">🛡️</div>
                    <div className="text-xl font-mono text-gemini-cyan">Governance Orchestrator</div>
                    <div className="text-xs opacity-40">"Enforcing policies and optimizing resources..."</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">POLICY AS CODE ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Policy as Code */}
      <Slide backgroundColor="#050505" notes="展示如何通过代码定义策略并由 Agent 自动执行。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">POLICY AS CODE</div>
          <h3 className="text-3xl mb-6 font-bold text-white">策略即代码：自动化的合规防线</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">静态策略检查</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                Agent 在 PR 阶段自动运行 OPA (Open Policy Agent) 等规则，拦截不符合规范的配置变更（如 S3 桶公开访问）。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">动态行为审计</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                监控生产环境中的异常行为，如未经授权的敏感数据访问，Agent 能够立即阻断并触发告警流程。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Resource Optimization */}
      <Slide backgroundColor="#050505" notes="Agent 如何管理云资源 and 成本。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">RESOURCE OPTIMIZATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">资源治理：FinOps 的智能化实践</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">闲置资源清理</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                Agent 自动识别并删除未使用的测试环境、孤立的磁盘卷 and 过期的快照，显著降低云账单金额。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">弹性配额管理</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                根据研发活动的周期性规律，Agent 自动调整开发环境的实例规格 and 数量，在保证效率的同时最大化资源利用率。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
