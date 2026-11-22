import Slide from "@/components/Slide";
import AgentHarnessSandbox from "@/components/sandboxes/AgentHarnessSandbox";

export default function AgentHarnessSlide() {
  return (
    <section>
      {/* Main Interactive Slide: Lab 06 */}
      <Slide
        backgroundColor="#040711"
        notes="基于 arXiv:2603.05344 (OPENDEV: Building Effective AI Coding Agents for the Terminal) 构建的互动推演台：亲手体验 5 阶上下文压缩 ACC、Schema Gating 安全隔离、Lazy MCP 以及对课程与本平台的双轨改造方案。"
      >
        <div className="flex flex-col justify-center h-full">
          <AgentHarnessSandbox />
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: OpenDev 4-Layer Architecture -> 5 Harness Categories Mapping */}
      <Slide
        backgroundColor="#050814"
        notes="将 OPENDEV 论文的四层架构映射到系统统一的五类长程 Coding Harness 框架（指令、范围与权限、工具与环境、状态与交接、验证与反馈）。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            ARXIV:2603.05344 · 从论文四层架构映射到系统五类 HARNESS
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            为什么长程 AI Coding 可靠性 80% 取决于 <span className="text-gemini-purple">Harness 与 Context</span>？
          </h2>

          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan">01. Scaffolding · 指令与范围</div>
              <div className="font-bold text-white text-sm">角色与工具边界预编译</div>
              <p className="text-slate-300 leading-relaxed">
                启动前完成 System Prompt 编排、工具 Schema 裁剪与子智能体注册；多模型按工作负载分工而非单一模型通吃。
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-gemini-cyan">
                对应 Harness：指令 / 范围与权限
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-purple">02. Harness · 工具与环境</div>
              <div className="font-bold text-white text-sm">Think/Act 分离 + Worktree 隔离</div>
              <p className="text-slate-300 leading-relaxed">
                只读规划阶段从 Schema 中物理移除写工具；并发 Coding Agent 强制落入独立 Worktree 与 <code className="text-white">init.sh</code> 环境。
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-gemini-purple">
                对应 Harness：工具与环境 / 范围
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-emerald-400">03. Context · 状态与交接</div>
              <div className="font-bold text-white text-sm">ACC 压缩 + 30 轮防遗忘</div>
              <p className="text-slate-300 leading-relaxed">
                用 70/80/85/90/99% 五阶策略压缩占 70–80% 预算的工具输出；结合 <code className="text-white">feature_list.json</code> 完成跨会话交接。
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-emerald-400">
                对应 Harness：状态与交接
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-amber-400">04. Persistence · 验证与反馈</div>
              <div className="font-bold text-white text-sm">Artifact Index + 影子回滚</div>
              <p className="text-slate-300 leading-relaxed">
                追踪所有读写改删索引、Shadow Git 快照与真实 CLI 退出码门禁，确保异常时一键回滚并按停机阈值中止。
              </p>
              <div className="pt-2 border-t border-white/10 text-[11px] font-mono text-amber-400">
                对应 Harness：验证与反馈
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-[#0b0f19] border border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span>
              论文核心实践启示：<strong className="text-white">工具输出才是上下文膨胀主因</strong>（非聊天记录），用惰性加载 + ACC + 结构化状态账本可让 30 轮长程编码免于“越写越蠢”。
            </span>
            <span className="font-mono text-gemini-cyan shrink-0">arXiv:2603.05344 · 向上返回交互沙盘</span>
          </div>
        </div>
      </Slide>
    </section>
  );
}
