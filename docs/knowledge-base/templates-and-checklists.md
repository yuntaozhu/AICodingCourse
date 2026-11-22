# 团队工程知识库：入门规则、模板、检查清单与团队约定

> 对应前端「团队知识库」侧栏中的 `starter-rule`、`template`、`checklist`、`example`、`team-convention` 条目。复制前请先核对每条的 **适用范围（scope）** 与 **维护人（owner）**。

---

## 1. [template] M1 Plan → Agent 结构化需求蓝图（v1.2）
- **Owner**：需求工程与产品研发协作组 | **Scope**：跨模块新功能与高风险改造前 | **Status**：`verified` (2026-11-19)
- **模板骨架**：
```markdown
## Context（只给最小必要输入）
- 目标文件 / 入口：@src/...
- 禁止修改边界：鉴权逻辑、数据库迁移脚本、已锁定接口签名

## Intent（可观察行为而非空泛描述）
- 输入与触发条件：...
- 预期输出 / 状态变化：...
- 非功能约束（性能/安全/回退）：...

## DoD Verification（AI 停下前必须真实执行）
1. npx tsc --noEmit（退出码 0）
2. npm run lint（无新增 warning/error）
3. 针对边界条件的单元测试或 curl 验证截图/日志
```

---

## 2. [starter-rule] M2 仓库上下文降噪基线 `.cursorignore`（v1.1）
- **Owner**：工程效能组 | **Scope**：所有 TypeScript / Node / Python 混合仓库 | **Status**：`verified` (2026-11-19)
- **可复用片段**：
```gitignore
# 构建产物与依赖缓存
node_modules/
dist/
build/
.next/
coverage/

# 严禁进入索引的敏感与大体积目录
.env
.env.*
!.env.example
*.log
*.sqlite
artifacts/snapshots/
```

---

## 3. [example] M3 服务端 Webhook 验签与客户端隔离示例（v1.3）
- **Owner**：后端与支付安全负责人 | **Scope**：所有支付回调、订阅状态变更路由 | **Status**：`verified` (2026-11-19)
- **核心边界**：前端成功页仅作展示轮询，严禁作为会员状态或权限开通的信任依据。
```typescript
// POST /api/webhooks/billing
export async function handleBillingWebhook(rawBody: Buffer, signature: string) {
  if (!signature) throw new Error("Missing webhook signature");
  // 1. 先验签，再解析业务载荷（密钥仅通过 process.env 读取）
  const event = verifyProviderSignature(rawBody, signature, process.env.WEBHOOK_SECRET!);
  // 2. 幂等锁检查，防止重放双倍入账
  const alreadyProcessed = await db.hasEvent(event.id);
  if (alreadyProcessed) return { ok: true, idempotent: true };
  // 3. 事务更新订阅态并记录审计日志
  await db.markSubscriptionActive(event.accountId, event.id);
  return { ok: true };
}
```

---

## 4. [checklist] M4 Rules 与 MCP 最小特权审计清单（v1.2）
- **Owner**：平台架构与安全组 | **Scope**：`.cursor/rules/*.mdc`、`AGENTS.md`、`.cursor/mcp.json` | **Status**：`verified` (2026-11-19)
- [ ] 全局规范放入 `AGENTS.md`（<= 120 行），目录规范使用 `.mdc` + 精确 `globs`（不使用无条件 `alwaysApply: true`）。
- [ ] `.cursor/mcp.json` 中启用工具总数精简（建议当前任务 <= 4 个 Server），避免工具选择率下降。
- [ ] 全部 Token/连接串采用 `${env:VAR_NAME}` 占位符，零明文 `ghp_` / `sk-` / 数据库密码。
- [ ] 默认采用只读（Read-only）或本地测试库凭证，任何 `write/delete` 工具绑定人工审批确认。

---

## 5. [checklist] M5 防作弊 DoD 与有界自愈核查清单（v1.1）
- **Owner**：QA 与 CI 工程组 | **Scope**：Agent 自动修复循环与 PR 门禁 | **Status**：`verified` (2026-11-19)
- [ ] 自愈重试上限明确设定（建议 `<= 3` 轮），超时或连续同错立即触发人类接管。
- [ ] 核对 `git diff` 中不存在 `.skip`、`expect(true).toBe(true)` 或放宽断言来“凑绿灯”。
- [ ] 检查是否遗留调试 `console.log`、未引用导入或废弃分支（Stray Code）。
- [ ] 类型检查、静态 Lint 与核心业务测试全部基于真实模块执行（禁止 mock 掉被测核心函数本身）。

---

## 6. [team-convention] M6 Issue-to-PR 异步派发与独立审查约定（v1.2）
- **Owner**：研发团队 TL | **Scope**：多人仓库 PR 协作与 CI Bugbot | **Status**：`verified` (2026-11-19)
- **团队规则**：
  1. **上下文隔离审查**：代码生成会话不得兼任唯一评审者；所有跨模块变更必须由全新对话或 CI Bugbot 基于完整 Diff 审查。
  2. **高危标签人工必签**：涉及鉴权、计费、SQL/Schema、CI 配置与环境变量的 PR，AI 仅能输出问题清单，合并按钮由人类 Reviewer 点击。
  3. **三层密钥防线**：本地 pre-commit hook 拦截 + CI 历史扫描 + 发现泄漏立即轮换（而不只是删提交）。

---

## 7. [template] M7 团队 AI Coding ROI 基线周报模板（v1.0）
- **Owner**：工程效能度量小组 | **Scope**：双周工程复盘 | **Status**：`verified` (2026-11-19)
- **度量字段**（严禁仅填生成代码行数）：
  - 平均验证耗时（MTTV）：本地修改到通过 CI 的中位分钟数
  - 首次审查通过率（First-Pass Approval Rate）：未因安全/边界问题打回的 PR 占比
  - AI 返工率（Rework Rate）：合入 7 天内因同类缺陷回修的变更占比
  - 本周沉淀资产：新增/修订 `.mdc`、核查清单或 `failures-and-decisions.md` 条目数

---

## 8. [team-convention] M8 长程 Coding Harness 与 Git Worktree 并发隔离约定（v1.2）
- **Owner**：Harness 工程与全栈架构组 | **Scope**：跨多轮会话长程任务、多 Coding Agent 并行（含原型迁移参考场景） | **Status**：`verified` (2026-11-20)
- **五要素装配与并发隔离**：
  1. **状态锚点外部化**：用 `init.sh` 锁定可重复启动命令，用 `feature_list.json` 固化 `scopeAllowlist` / `verifyCommand` / `passes` 防删账本，阶段切换保留结构化 ACC 交接卡；
  2. **Contract-First + Worktree 隔离**：先锁定 `types.ts` / API 契约，再用 `git worktree add ../wt-feature-a` 隔离并发 Agent 目录所有权，禁止两个 Agent 同时改共享路由或公共类型文件；
  3. **退出前真实验证**：合入前必须重新执行 `npm install`、`npm run lint`、`npx tsc --noEmit` 与 `npm run build`。

---

## 9. [template] M9 全栈白盒报错 5 步解码与 ADR 模板（v1.2）
- **Owner**：全栈教学与支持组 | **Scope**：前后端联调报错排查与架构选型 | **Status**：`verified` (2026-11-19)
- **报错定位 5 步**：1) 读完整报错首行与状态码 → 2) 判定层归属（浏览器 Frontend / 服务端 Backend / 数据库 Database） → 3) 核对最近一次改动与环境变量 → 4) 用最小复现验证（`curl`/单测）→ 5) 保留日志并固定规则防止复发。

---

## 10. [template] M10 去 AI 模板味 UI 组件规格模板（v1.1）
- **Owner**：前端体验与设计系统组 | **Scope**：React + Tailwind UI 生成与视觉走查 | **Status**：`verified` (2026-11-19)
- **硬性约束清单**：
  - 主色/强调色比例可控，禁止无语义紫色渐变卡片堆砌与装饰性闪烁圆点；
  - 全部非标签正文元信息采用纯文本分隔符（`·` / `/`），不使用静默假徽章；
  - 明确给出空态（Empty）、加载态（Loading）、错误态（Error）与键盘无障碍对比度要求。
