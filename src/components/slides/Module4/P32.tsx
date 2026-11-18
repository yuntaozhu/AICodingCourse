import Slide from "@/components/Slide";
import McpToolboxSandbox from "@/components/sandboxes/McpToolboxSandbox";

export default function P32() {
  return (
    <section>
      {/* Main Slide: Cursor MCP Integration */}
      <Slide notes="通过 .cursor/mcp.json 接入 MCP Server，Cursor Agent 不再只是改本地文本，而是能直连 Figma 设计稿、数据库表结构、GitHub Issue 与 Playwright 浏览器。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            Cursor MCP 生态：连接设计稿、数据库与浏览器
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-slate-200">
                <strong className="text-white">Model Context Protocol (MCP)</strong> 是 Cursor Agent 的“眼睛和手”。配置好 <code className="text-gemini-cyan">.cursor/mcp.json</code> 后，Agent 可实时调取外部真实环境数据，彻底消除盲猜。
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-gemini-cyan mb-1">Figma MCP</div>
                  <div className="text-slate-300">读取图层 Token 与组件树，高保真还原前端。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-gemini-purple mb-1">Postgres / DB MCP</div>
                  <div className="text-slate-300">查询真实表结构与索引，不猜错一个字段名。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-emerald-400 mb-1">Playwright Browser MCP</div>
                  <div className="text-slate-300">自动打开浏览器点击测试、截屏查溢出与 Console。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-amber-400 mb-1">GitHub MCP</div>
                  <div className="text-slate-300">同步 Issue 需求上下文并直接发起标准化 PR。</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35 flex flex-col justify-between">
              <div className="text-[11px] font-mono text-gemini-purple mb-2">
                .cursor/mcp.json · 浏览器端到端自检轨迹
              </div>
              <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{`Task: "上线登录页并在手机端自检无遮挡"
1. [Figma MCP]       读取按钮色值与间距 Token
2. [Cursor Agent]    生成 LoginCard.tsx 与表单校验
3. [Playwright MCP]  打开 localhost:3000 (375x812)
   -> 捕获按钮溢出 -> 自动修复为 flex-col -> 复测 PASS`}</pre>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-cyan">
                ↓ 向下打开 MCP 沙盘配置与轨迹模拟
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Browser Visual Self-Check + Least Privilege */}
      <Slide backgroundColor="#050505" notes="使用 MCP 时务必遵守最小特权原则：默认只读查询，写库/建 PR 操作需人工点击确认。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">MCP SECURITY &amp; VISUAL VERIFICATION</div>
          <h3 className="text-3xl mb-6 font-bold text-white">浏览器视觉自检与 MCP 最小特权边界</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-gemini-cyan">Playwright MCP：替代人工点点点</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                以前改完前端要反复切换浏览器按 F12；现在 Agent 在本地直接驱动无头浏览器执行核心用户流程，读取 Console 报错与页面快照，自动修正布局问题。
              </p>
              <div className="text-xs font-mono text-slate-400">
                推荐触发词：“启动服务后用 Playwright MCP 验证表单提交与移动端布局”
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-amber-400">最小特权（Least Privilege）</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                严禁给生产库配可写超级权限 Token！在 Cursor 中把数据库 MCP 限定为只读用户，把高风险写入设为 <strong className="text-white">人工审批确认</strong>，防范误删表或 Prompt 注入风险。
              </p>
              <div className="text-xs font-mono text-amber-300">
                秘诀：环境变量引用 ${`{env:DB_READONLY_URL}`}，不把明文写进仓库
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Interactive Sub Slide 2: McpToolboxSandbox */}
      <Slide backgroundColor="#040711" notes="动手演练：勾选需要的 MCP 服务并切换安全策略，生成可直接放入项目根目录的 .cursor/mcp.json。">
        <div className="flex flex-col justify-center h-full">
          <McpToolboxSandbox />
        </div>
      </Slide>

      {/* Sub Slide 3: Custom MCP Server + Multi-Model Task Routing */}
      <Slide
        backgroundColor="#050814"
        notes="吸纳 ai-coding-with-cursor 第 10 章与 linear_app_mcp_server：不仅会用现成 MCP，更要懂得按工程任务分流不同推理能力的模型，并用 MCP Inspector 调试自研工具服务。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            CUSTOM MCP SERVER &amp; TASK-BASED MODEL ROUTING
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            进阶实战：搭建私有项目 MCP Server × 按任务复杂度动态选模型
          </h3>
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-3">
              <div className="font-mono text-gemini-cyan">01 · 自研项目专属 MCP（以 Linear / 工单为例）</div>
              <p className="text-slate-300 leading-relaxed">
                将团队私有工单系统、内部定价表或风控 API 封装为轻量 Node/TS MCP Server，在 <code className="text-white">.cursor/mcp.json</code> 中挂载本地编译入口，用 <strong className="text-white">MCP Inspector</strong> 校验入参 Schema 后再交给 Agent 调用。
              </p>
              <pre className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap">{`src/tools/linear-issues.ts   # Zod 参数校验 + 最小权限
npx @modelcontextprotocol/inspector dist/index.js`}</pre>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35 space-y-3">
              <div className="font-mono text-gemini-purple">02 · 按任务类型分流模型（不浪费推理预算）</div>
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">行内极速补全 / 文档生成：</strong>轻量高吞吐模型 + <code className="text-gemini-cyan">documentation_of_steps</code> 清单，秒级出结果。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">疑难架构 / Bug 根因排查：</strong>切换深度思考模型，搭配“分步反推边界条件”提示词深挖竞态与并发死锁。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">高保真 UI 原型速成：</strong>配合设计图与 Prompt 链接工具生成初版组件，再交回 Cursor 注入状态与测试。
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: Starter 4-MCP Orchestration & PRD-as-Issue Discipline */}
      <Slide
        backgroundColor="#040711"
        notes="吸纳 jpke/cursor-vibe-coding-template 的默认四件套 MCP（Context7 / Memory / TaskMaster AI / GitHub）：防止 PRD 双写分叉、强制两步拉取新版库文档，并设置 Memory 写入前的人类确认闸门。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            STARTER 4-MCP WORKFLOW · CONTEXT7 × MEMORY × TASKMASTER × GITHUB
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            生产级开箱四联 MCP 闭环：PRD 唯一真相 × 零过时文档
          </h3>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-3">
              <div className="font-mono text-gemini-cyan">
                01 · PRD 即 GitHub Issue（杜绝本地文档漂移）
              </div>
              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">TaskMaster AI + GitHub MCP：</strong>需求一旦审定，立即通过 <code className="text-gemini-cyan">gh issue create</code> 沉淀为 GitHub Issue 作为单一真相源，随后<strong className="text-amber-300">删除本地</strong> <code className="text-white">.taskmaster/docs/</code> 草稿防止双向分叉。
                </p>
                <p>
                  <strong className="text-white">分层模型路由：</strong><code className="text-white">.taskmaster/config.json</code> 按 <code className="text-emerald-300">main / research / fallback</code> 三角色配置模型，并且必须收到用户明确指令才触发 <code className="text-white">parse-prd</code> 与 <code className="text-white">expand</code>。
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35 space-y-3">
              <div className="font-mono text-gemini-purple">
                02 · Context7 两步查文档 × Memory 确认闸门
              </div>
              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-white">Context7 MCP 强制两步法：</strong>先调用 <code className="text-gemini-cyan">resolve-library-id</code> 锁定目标库与版本，再调用 <code className="text-gemini-cyan">get-library-docs</code> 注入聚焦 <code className="text-white">topic</code>，杜绝过时 SDK 幻觉。
                </p>
                <p>
                  <strong className="text-white">Memory MCP 人类确认铁律：</strong>允许自由检索 <code className="text-white">memory.json</code> 知识图谱，但凡涉及<strong className="text-amber-300">新增 / 更新 / 删除实体节点</strong>，必须暂停并向用户明确展示实体清单等待确认后才写入。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
