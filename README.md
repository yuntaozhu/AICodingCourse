# AICodingCourse — Cursor AI Coding 确定性研发交互式课程

面向独立开发者、产品经理与工程团队的 AI Coding 实战交互课件（基于 React + TypeScript + Vite + Reveal.js + Express）。课程聚焦 **“意图架构 → 上下文工程 → 规格/规则约束 → 端到端验证（DoD）→ 异步审查交付”** 的确定性研发闭环，而非“让 AI 盲写代替思考”。

---

## 一、课程面向谁 & 学习路径入口

本课程提供 10 个核心模块与 16 个互动实验沙盘（对应右上角「沙盘 (16)」或左侧目录栏跳转）：

| 学习者起点 | 建议起始路线 | 重点沙盘（Labs） | 学完可带走的产物 |
| :--- | :--- | :--- | :--- |
| **初次接触 AI Coding / PM** | M1 ➔ M3 ➔ M9 ➔ M10 | Lab 01（Plan→Agent）、Lab 07（Vibe 全栈图谱）、Lab 08（UI 审美参考库） | 可验证的需求拆解提示词、全栈技术选型清单 |
| **有编程基础，想升级工程工作流** | M2 ➔ M4 ➔ M5 ➔ M6 | Lab 02（`.mdc` 规则沙盘）、Lab 04（Bugbot 评审）、Lab 14（规则生成器） | `.cursor/rules/*.mdc`、`AGENTS.md` 与 DoD 自检清单 |
| **想实践 MCP、Skills 与多 Agent** | M4 ➔ M6 ➔ M8 | Lab 03（`.cursor/mcp.json` 沙盘）、Lab 16（MCP Registry 浏览器）、Lab 06（Agent Harness） | 最小特权 `.cursor/mcp.json` 配置与 JSON-RPC 排查思路 |
| **想完成独立产品从 0 到 1 交付** | M3 ➔ M5 ➔ M7 ➔ M9 | Lab 09（Sonar 7 Habits 自测）、Lab 11（架构决策模拟器）、Lab 15（效能热力图） | 端到端测试、密钥防线与复盘沉淀规范 |

---

## 二、10 个课程模块与结构概览（核对自 `src/App.tsx`）

1. **M1 (`M1 Cursor范式`)**：Cursor AI Coding 研发范式革命与意图架构师模型
2. **M2 (`M2 @上下文`)**：全量代码库上下文理解、噪音过滤与跨模块重构
3. **M3 (`M3 全栈实战`)**：Cursor 独立产品实战、支付/数据库安全与 Vibe Debugging
4. **M4 (`M4 Rules·MCP`)**：`.cursor/rules (.mdc)`、`AGENTS.md` 与 MCP 最小特权架构（含 Lab 03 示范练习与 DoD 验收清单）
5. **M5 (`M5 DoD自愈`)**：DoD 完成定义、防 Reward Hacking 测试策略与终端自愈闭环
6. **M6 (`M6 异步Bugbot`)**：Background Agents、CLI 与 Bugbot 安全代码审查
7. **M7 (`M7 ROI演进`)**：独立开发者 ROI、70% 困境突围与规则资产复利
8. **M8 (`M8 沙盘案例`)**：Cursor 工具箱、AI Studio 原型工程化迁移与 Agent Harness
9. **M9 (`M9 全栈图谱`)**：Web 三层架构、工具选型、报错解码与架构决策演练
10. **M10 (`M10 审美与效能`)**：高信噪比 UI 视觉参考输入与组件源码协作规范

> 注：每个模块末尾均包含 `QuizSlide` 课后巩固测验（作答记录仅保存在浏览器 `localStorage`，非云端账号同步）。

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
