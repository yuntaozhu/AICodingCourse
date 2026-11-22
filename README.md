# AICodingCourse — AI Coding → Harness → Agent 系统交互式课程与实战课件

面向非技术 / PM、独立开发者、工程团队与高校学生的 AI Coding 到 Agent 系统实战交互课程课件系统（基于 React + TypeScript + Vite + Reveal.js + Express）。默认打开 **课程课件系统工作台（课程目录 / 模块学习 / 双链路知识库中心）**，支持一键与 **Reveal.js 14 模块 · 20 沙盘幻灯片模式** 双向切换。

---

## 一、课程工作台核心流程与面向人群

1. **双模式并存**：
   - **课程系统工作台（默认入口 `/`）**：按 `AI Coding 基础 → Coding Harness → Agent 运行时与 Capstone` 3 个展示轨道组织 14 个模块；支持自由组合 `双课时完整 / 短讲精要 / 工作坊实操 / 自主学习` 四套授课方案（同一套教学单元动态选排、自动计算时长）、完成单元 DoD 自检、在线测验（按 `moduleId` 映射）、双层先修图谱与可核验技能门禁检查、保存练习产物与复盘笔记，并支持一键导出 Markdown 与清除本地数据。
   - **教师视图 vs 学员视图**：默认「学员视图」隐藏讲师备课话术、踩坑预警与参考答案（失败剖析提供“先思考再查看”防剧透）；切换「教师视图」即可查看全部备课要点、可接受解法与时间裁剪建议。
   - **双链路知识库中心（物理与逻辑隔离）**：
     - **链路 A · 研发工程知识库**（`src/data/teamKnowledgeBase.ts` + `docs/knowledge-base/templates-and-checklists.md` / `failures-and-decisions.md` + 78 册 `AI-pdf-books` 备课书库）：服务开发者与 Coding Agent（M1–M10），支持个人工程知识草稿追加。
     - **链路 B · 应用运行时领域知识库工坊**（`src/data/runtimeKnowledgeBase.ts` + `docs/knowledge-base/runtime-domain-kb.md`）：专用于运行中 Agent 应用（M11–M13-Eng），涵盖数据接入与 PII 分级、ACL 检索前过滤、混合/Wiki 检索、Citation Grounding 溯源、Tombstone 淘汰与检索/轨迹双层 Eval，在检索源与导出产物上与链路 A 彻底隔离。
   - **Reveal.js 演示模式**：可通过顶部「幻灯片模式 (Reveal)」或沙盘/章节直达按钮随时切入全屏演示与 20 个互动沙盘，亦可在 Reveal 顶部栏点击「课程系统」返回当前模块工作台；访问 `#/` 锚点时自动进入 Reveal 模式。

本课程提供 14 个核心模块（`m1`–`m13-eng`）与 20 个互动实验沙盘，并建立「模块先修 (`prerequisiteModuleIds`) + 能力先修 (`prerequisiteSkillIds`)」双层 DAG 拓扑校验机制（严禁仅凭点击完成模块自动授予需要真实证据的后端鉴权或项目迭代技能）：

| 学习者路径 | 建议学习序列（DAG 闭合） | 重点起始沙盘（Labs） | 结课 Capstone 与带走产物 |
| :--- | :--- | :--- | :--- |
| **非技术 / PM（无代码治理路径）** | M1 ➔ M9 ➔ M3 ➔ M10 ➔ M11 ➔ M13-Gov | Lab 01（Plan→Agent）、Lab 07（全栈图谱）、Lab 20（预制轨迹评审台） | **M13-Gov（无代码版）**：Data/Prompt PRD、HITL 审批矩阵与预制轨迹模拟治理评审报告 |
| **独立开发者（全栈到 Agent 上线）** | M1 ➔ M2 ➔ M9 ➔ M3 ➔ M4 ➔ M5 ➔ M7 ➔ M8 ➔ M10 ➔ M11 ➔ M12 ➔ M13-Eng | Lab 01/02/03、Lab 06（长程 Harness）、Lab 18/19（运行时 KB 与循环） | **M13-Eng（工程版）**：`.cursor/rules`、最小特权 MCP、可运行 Agent + 运行时 KB + 双层 Eval |
| **工程团队（跳过入门，直奔协同与治理）** | M2 ➔ M4 ➔ M5 ➔ M6 ➔ M8 ➔ M7 ➔ M11 ➔ M12 ➔ M13-Eng（显式基线豁免 M1/M9/M3 与 5 项基础工程技能） | Lab 17（上下文切片）、Lab 02（`.mdc`）、Lab 04（Bugbot）、Lab 06（Worktree 协同）、Lab 18/19 | **M13-Eng（工程版）**：团队工程规范库、多 Coding Agent Worktree 协同与生产级运行时 RAG |
| **高校学生 / 课程项目（CS Student）** | M1 ➔ M2 ➔ M9 ➔ M3 ➔ M4 ➔ M5 ➔ M8 ➔ M11 ➔ M12 ➔ M13-Eng | Lab 01/17（上下文切片）、Lab 11（架构模拟）、Lab 18/19（ACL + Eval） | **M13-Eng（工程版）**：完整前后端测试闭环、独立项目工程仓库与端到端 Agent 评测证明 |

---

## 二、14 个课程模块与三轨结构概览（核对自 `src/data/courseCurriculum.ts` 与 `src/App.tsx`）

### 轨道一：基础入门与全栈心智模型（`foundation`）
1. **M1 (`M1 Cursor范式`)**：Cursor AI Coding 研发范式革命与意图架构师模型（完整 10 单元样板模块）
2. **M2 (`M2 @上下文`)**：全量代码库上下文理解、噪音过滤与跨模块重构（含 Lab 17 上下文切片与 Token 预算沙盘）
3. **M9 (`M9 全栈图谱`)**：Web 三层架构、工具选型、报错解码与架构决策演练（含 Lab 07/11）
4. **M3 (`M3 全栈实战`)**：Cursor 独立产品实战、支付/数据库安全与 Vibe Debugging
5. **M10 (`M10 审美与效能`)**：高信噪比 UI 视觉参考输入与组件源码协作规范（含 Lab 08）

### 轨道二：AI Coding 与长程软件 Harness（`coding-harness`）
6. **M4 (`M4 Rules·MCP`)**：`.cursor/rules (.mdc)`、`AGENTS.md` 与 MCP 最小特权架构（含 Lab 02/03/14/16）
7. **M5 (`M5 DoD自愈`)**：DoD 完成定义、防 Reward Hacking 测试策略与终端自愈闭环
8. **M6 (`M6 异步Bugbot`)**：Background Agents、CLI 与 Bugbot 安全代码审查（含 Lab 04/10/12/13）
9. **M7 (`M7 ROI演进`)**：独立开发者 ROI、70% 困境突围与规则资产复利（含 Lab 09/15）
10. **M8 (`M8 长程Harness`)**：长程软件任务的 Harness 与多 Coding Agent 协同（专注 Worktree 隔离、跨会话状态交接与长程验证闭环，Lab 06；Lab 05 `book-kb` 独立归入知识库中心工程链路）

### 轨道三：Agent 产品、运行时知识库与双轨 Capstone（`agent-runtime`）
11. **M11 (`M11 Agent蓝图`)**：Agent 产品蓝图、Workflow vs Agent 决策与治理架构（完整样板）
12. **M12 (`M12 运行时KB`)**：运行时 Agent 工作流与领域知识库工程实现（含 Lab 18 ACL Pre-filter 与 Lab 19 工具循环熔断沙盘）
13. **M13-Gov (`M13-Gov 治理`)**：Agent 系统产品与治理 Capstone（无代码版，含 Lab 20 预制轨迹评审台，明确标注为模拟治理评审而非生产实测验证）
14. **M13-Eng (`M13-Eng 工程`)**：生产级 Agent、Harness 与运行时 KB 工程 Capstone（真实运行、Retrieval Recall@K + Agent 轨迹 Dual Eval 门禁）

> 注：所有模块与课后测验记录、单元 DoD、已核验技能证据、练习产物草稿与自定义知识库草稿均存储在浏览器 `localStorage`（`aicoding_course_workspace_v1`、`cursor_course_quiz_v1` 等），未实现云端账号、班级管理与在线 WYSIWYG 课程编辑器。
> 团队工程知识库与运行时领域知识库工坊源文件同步维护在 [`docs/knowledge-base/README.md`](./docs/knowledge-base/README.md)，并在工作台「知识库中心」按两条独立链路分别检索与导出。

---

## 三、本地运行、构建、检查与测试

### 前置环境
- Node.js `>= 20`（当前已验证环境：Node `v22.x`）与 `npm`

### 常用命令

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（Express + Vite 中间件，默认端口 3000）
npm run dev

# 3. 运行静态检查、TypeScript 校验与自动化测试
npm run lint
npx tsc --noEmit
npm test

# 4. 生产构建与启动
npm run build
NODE_ENV=production npm start
```

### 环境变量与可选 AI 能力说明
- 复制 `.env.example` 为 `.env`（或通过平台 Secrets 注入）：
  - `PORT=3000`（开发/生产服务端端口）
  - `GEMINI_API_KEY=`（**可选**。仅用于服务端代理路由 `POST /api/review`、`/api/kb/synthesize` 与 `/api/craft-rules`）
- **降级与模拟边界**：未配置 `GEMINI_API_KEY` 时，页面仍可完整运行所有幻灯片、课后测验、本地静态 Bugbot 规则检查、离线模板生成及 MCP 模拟演练；沙盘内的模拟结果**不等同于**真实外部数据库/GitHub/Slack 服务调用。
- **安全红线**：切勿将任何 API Key 放入前端 `VITE_*` 变量或提交进仓库；真实项目接入 MCP 时请始终使用 `${env:VAR_NAME}` 引用并配置只读凭证。

---

## 四、贡献与扩展课程内容指南

1. **新增或修改幻灯片**：在 `src/components/slides/ModuleX/` 下新增组件并在该模块 `index.ts` 注册；交互型沙盘组件须在根节点处理 Reveal.js 键盘与滚轮隔离（使用 `stopRevealKey` / `stopRevealWheel`），并适配 `1280×720` 视口。
2. **新增沙盘快捷入口**：在 `src/App.tsx` 的 `labs` 数组中注册 `id`、`label` 与动态索引 `allSlides.indexOf(...)`。
3. **新增实验练习标准**：参考 `src/data/mcpLabGuide.ts` 与 `McpToolboxSandbox`，为练习明确「适用对象、可观察学习目标、操作步骤、产出物、DoD 验收清单、验证命令、常见排查与模拟边界」。
4. **外部资料、链接与许可证规范**：
   - 严禁直接大段复制外部项目文章、图片或闭源数据；
   - 引用外部书籍、论文、工具或网站资源时，应记录标题、原始来源 URL、作者/组织及核验状态；无法核实的许可证或产品能力须标注“待核验”，不得猜测伪造。
5. **提交前门禁**：确保 `npm run lint`、`npx tsc --noEmit`、`npm test` 与 `npm run build` 全部通过。

---

## 五、已知限制与待核验事项

- 当前课程进度与测验记录仅存储在浏览器 `localStorage` 中，切换浏览器或清缓存后不会跨设备同步。
- `src/data/aiBooksKnowledgeBase.ts` 与 `src/data/uiReferenceSites.ts` 中的部分外部链接与许可证元信息仍待逐条补充 `license` 与 `lastVerifiedAt` 核验字段。
- `tsconfig.json` 当前设置 `"strict": false`，后续可按模块逐步收紧类型检查。
