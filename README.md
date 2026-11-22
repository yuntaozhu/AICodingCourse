# AICodingCourse（造物台）— 官网 + 账号制 LMS + AI Coding → Harness → Agent 实战课程系统

面向业务专家 / PM、独立开发者、高校学生（含竞赛/科创）与企业研发团队的 AI Coding 到 Agent 系统实战教学与训练营平台（基于 React 19 + TypeScript + Vite 8 + Reveal.js 6 + Express 4 + Drizzle ORM + Cloud SQL PostgreSQL + Firebase Auth）。

系统现包含 **三大协作入口** 与完整的 **账号权益 / 班级带教 / 服务端评测闭环**：
- **官方主页（`/`）**：课程价值主张、双轨学习路径与结业终点对比、商业产品对比（自主通行证 vs 深度指导小班）、讲师背景、公开目录预览与训练营/企业咨询表单（写入 Cloud SQL `lead_inquiries`）。
- **课程学习工作台（`/app`）**：账号登录、权益解锁与兑换、三轨 14 模块工作台、单元 DoD 打卡与云端进度同步、服务端判分测验、双层先修图谱与可核验技能门禁、双链路知识库中心、学员小班任务提交（Cohort Panel）、讲师带班工作台（Instructor Cockpit）与管理员后台（Admin Console）。
- **Reveal.js 14 模块 · 20 沙盘全屏演示模式（`#/`）**：支持从工作台任意单元或测验错题直达对应幻灯片与交互沙盘，并在演示模式顶部一键返回工作台。

---

## 一、账号权益、商业模式与平台安全边界

1. **三维度正交解耦设计**：
   - **角色与权限（`user_roles`）**：`learner` / `ta` / `instructor` / `admin` 独立建模；讲师与助教仅能访问其被分配班级（`cohort_instructors`）的数据。
   - **商品与权益（`products` / `prices` / `orders` / `entitlements`）**：支持「自助学习通行证（`self-paced-pass`）」与「深度指导训练营（`cohort-mentored-camp`）」SKU；权益与具体开班解耦。
   - **班级期次（`cohorts` / `cohort_enrollments` / `cohort_milestones` / `submissions`）**：独立承载小班里程碑节奏、作业提交、静态 Bugbot 检查快照与人工多维度 Rubric 点评。
2. **服务端访问控制与权威性保护**：
   - **免费试学与权益门禁**：未登录或未付费账号仅开放 `M1` 公开试学；`M2–M13-Eng` 全量内容与对应测验由服务端严格校验有效权益（无权限返回 `403 ENTITLEMENT_REQUIRED`）。
   - **教师材料物理隔离**：`teacherMaterials`（授课话术、参考答案、时间裁剪建议、隐藏踩坑提示）仅在服务端确认用户为 `instructor`（且关联对应班级/授权）或 `admin` 时下发；普通学员、游客与匿名响应均由服务端剥离。
   - **测验与技能服务端判分**：测验公开接口不返回 `correctIndex` 与 `explanation`，提交后在服务端判分并落库 `quiz_attempts`；关键技能（如 `skill_auth_boundary`、`skill_ai_iteration_project`）仅通过服务端诊断规则验证后授予 `skill_grants`。
   - **旧版迁移标记**：从早期浏览器 `localStorage` 迁入云端的历史数据标记为 `untrustedLegacy`（仅迁移进度与笔记草稿，不直接采信本地已通过技能或自造分数）。
   - **双链路知识库（物理与逻辑隔离）**：
     - **链路 A · 研发工程知识库**（`src/data/teamKnowledgeBase.ts` + `docs/knowledge-base/templates-and-checklists.md` / `failures-and-decisions.md` + 78 册 `AI-pdf-books` 备课书库）：服务开发者与 Coding Agent（M1–M10），支持云端自定义条目同步。
     - **链路 B · 应用运行时领域知识库工坊**（`src/data/runtimeKnowledgeBase.ts` + `docs/knowledge-base/runtime-domain-kb.md`）：专用于运行中 Agent 应用（M11–M13-Eng），涵盖 Data/Prompt PRD、ACL 检索前过滤、Citation Grounding 溯源、Tombstone 淘汰与检索/轨迹双层 Eval。

---

## 二、14 个课程模块、4 类路径与双终点结构

本课程提供 14 个核心模块（`m1`–`m13-eng`）、149 个小步闯关单元、152 节交互式幻灯片、20 个互动实验沙盘与 49 道随堂诊断测验，并建立「模块先修 (`prerequisiteModuleIds`) + 能力先修 (`prerequisiteSkillIds`)」双层 DAG 拓扑校验机制：

| 学习者路径 | 建议学习序列（DAG 闭合） | 重点起始沙盘（Labs） | 结课 Capstone 与带走产物 |
| :--- | :--- | :--- | :--- |
| **非技术 / PM（无代码治理路径）** | M1 ➔ M9 ➔ M3 ➔ M10 ➔ M11 ➔ M13-Gov | Lab 01（Plan→Agent）、Lab 07（全栈图谱）、Lab 20（预制轨迹评审台） | **M13-Gov（无代码版）**：Data/Prompt PRD、HITL 审批矩阵与预制轨迹模拟治理评审报告 |
| **独立开发者（全栈到 Agent 上线）** | M1 ➔ M2 ➔ M9 ➔ M3 ➔ M4 ➔ M5 ➔ M7 ➔ M8 ➔ M10 ➔ M11 ➔ M12 ➔ M13-Eng | Lab 01/02/03、Lab 06（长程 Harness）、Lab 18/19（运行时 KB 与循环） | **M13-Eng（工程版）**：`.cursor/rules`、最小特权 MCP、可运行 Agent + 运行时 KB + 双层 Eval |
| **工程团队（跳过入门，直奔协同与治理）** | M2 ➔ M4 ➔ M5 ➔ M6 ➔ M8 ➔ M7 ➔ M11 ➔ M12 ➔ M13-Eng（显式基线豁免 M1/M9/M3 与 5 项基础工程技能） | Lab 17（上下文切片）、Lab 02（`.mdc`）、Lab 04（Bugbot）、Lab 06（Worktree 协同）、Lab 18/19 | **M13-Eng（工程版）**：团队工程规范库、多 Coding Agent Worktree 协同与生产级运行时 RAG |
| **高校学生 / 课程项目（CS Student）** | M1 ➔ M2 ➔ M9 ➔ M3 ➔ M4 ➔ M5 ➔ M8 ➔ M11 ➔ M12 ➔ M13-Eng | Lab 01/17（上下文切片）、Lab 11（架构模拟）、Lab 18/19（ACL + Eval） | **M13-Eng（工程版）**：完整前后端测试闭环、独立项目工程仓库与端到端 Agent 评测证明 |

### 三轨目录速览（核对自 `src/data/courseCurriculum.ts`）
- **轨道一 · 基础入门与全栈心智模型（`foundation`）**：`M1`（Cursor 范式）· `M2`（@上下文 + Lab 17）· `M9`（全栈图谱 + Lab 07/11）· `M3`（全栈实战）· `M10`（审美与效能 + Lab 08）
- **轨道二 · AI Coding 与长程软件 Harness（`coding-harness`）**：`M4`（Rules·MCP + Lab 02/03/14/16）· `M5`（DoD 自愈 + Lab 12/13）· `M6`（异步 Bugbot + Lab 04/10/12/13）· `M7`（ROI 演进 + Lab 09/15）· `M8`（长程 Harness 与 Worktree 协同 + Lab 06）
- **轨道三 · Agent 产品、运行时知识库与双轨 Capstone（`agent-runtime`）**：`M11`（Agent 蓝图）· `M12`（运行时 KB + Lab 18/19）· `M13-Gov`（无代码治理 Capstone + Lab 20，附模拟评审声明）· `M13-Eng`（生产级工程 Capstone）

---

## 三、数据架构、接口与首任管理员初始化

1. **Cloud SQL PostgreSQL（`src/db/schema.ts` 共 20 张表，运行区域 `europe-west1`）**：
   - 身份与商业域：`users`, `user_roles`, `products`, `prices`, `orders`, `payment_events`, `redeem_codes`, `entitlements`, `lead_inquiries`
   - 学习与证据域：`unit_progress`, `custom_kb_entries`, `quiz_attempts`, `skill_grants`, `ai_usage_logs`
   - 班级与带教域：`cohorts`, `cohort_instructors`, `cohort_enrollments`, `cohort_milestones`, `submissions`, `submission_reviews`
2. **Firebase Auth + 首任管理员认领流程**：
   - 前端通过 Google 登录获取 Firebase ID Token，请求同源 `/api/*` 时由 `firebase-admin` 在服务端校验身份。
   - 若系统尚无管理员，可通过环境变量 `ADMIN_EMAIL` 自动初始化，或在登录后于工作台顶部点击「认领首个管理员」调用 `POST /api/auth/claim-admin` 完成首任管理员绑定。
   - 管理员可在 `AdminConsole` 中签发兑换码（`POST /api/admin/redeem-codes`）、人工开通权益、分配班级讲师、报名学员与创建班级期次；未配置 `PAYMENT_WEBHOOK_SECRET` 时支付回调路由返回 `503`，推荐使用兑换码或管理员后台开通。

---

## 四、本地运行、构建、测试与 Vercel 部署

### 前置环境
- Node.js `>= 20`（当前已验证环境：Node `v22.23.2`，原生 ESM 兼容 `node server.ts`）与 `npm`

### 常用命令

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（Express + Vite 中间件，默认端口 3000）
npm run dev

# 3. 运行静态检查、TypeScript 校验与自动化测试（24 项用例）
npm run lint
npx tsc --noEmit
npm test

# 4. 生产构建与本地生产启动（无需 tsx，直接运行 node server.ts）
npm run build
NODE_ENV=production npm start
```

### 环境变量与部署说明
- 参考 `.env.example` 配置（切勿把任何密钥写入 `VITE_*` 前端变量或提交至仓库）：
  - **AI Studio Cloud SQL（默认优先）**：`SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`（通过 Unix Socket 连接）
  - **Vercel Neon Postgres（对象参数兼容，自动启用远程 TLS）**：`PGHOST` / `POSTGRES_HOST`、`PGHOST_UNPOOLED`（建表推送使用）、`PGUSER`、`PGPASSWORD`、`PGDATABASE`
  - **Vercel Blob 作业附件存储（可选）**：`AICODING_STORE_ID`、`AICODING_READ_WRITE_TOKEN`（启用后学员端小班面板自动开放 `≤3MB` 附件直传 `/api/submissions/upload`）
  - **Firebase Override（可选）**：`FIREBASE_PROJECT_ID`（默认读取随 serverless 函数打包的 `firebase-applet-config.json`）
  - **可选服务端增强**：`GEMINI_API_KEY`（用于需登录且受日配额限制的 `POST /api/review`、`/api/kb/synthesize`、`/api/craft-rules`）、`ADMIN_EMAIL`、`PAYMENT_WEBHOOK_SECRET`、`PORT=3000`
- **Vercel Serverless + Neon 部署步骤**：
  1. 在 Vercel Storage 中绑定 Neon Postgres 与 Blob（如自定义前缀 `AICODING`），并配置 `ADMIN_EMAIL` / `GEMINI_API_KEY` / `PAYMENT_WEBHOOK_SECRET`。
  2. 本地拉取 Vercel 环境变量并将 `src/db/schema.ts` 的 20 张表同步至 Neon：
     ```bash
     npx vercel env pull .env.local
     npm run db:push:vercel
     ```
  3. 在 **Firebase Console → Authentication → Settings → Authorized domains** 中添加 Vercel 生产域名（如 `your-app.vercel.app`），否则 Google 登录弹窗会被拦截。
  4. 访问部署域名 `/api/health` 确认服务与 `blobUploadEnabled` 状态正常，首次访问 `/api/catalog` 或 `/app` 将自动幂等初始化商品与默认期次 `COHORT-2026-Q4`。

---

## 五、贡献规范与诚实边界

1. **新增或修改幻灯片**：在 `src/components/slides/ModuleX/` 下新增组件并在该模块 `index.ts` 注册；交互型沙盘组件须在根节点使用 `stopRevealKey` / `stopRevealWheel` 隔离 Reveal 快捷键与滚轮。
2. **外部资料、链接与许可证规范**：严禁直接复制未确认许可证的外部项目源码或文章；`src/data/aiBooksKnowledgeBase.ts` 与 `src/data/uiReferenceSites.ts` 中部分外部条目的 `license` / `lastVerifiedAt` 元信息仍待逐条补全。
3. **沙盘与治理边界**：`M13-Gov` / Lab 20 明确声明：「本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。」
4. **提交前门禁**：确保 `npm run lint`、`npx tsc --noEmit`、`npm test`（24/24 通过）与 `npm run build` 全部通过。

