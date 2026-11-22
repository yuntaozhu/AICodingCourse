user requirements
prohibitions
story idea

不要只放在 send manifest 而不进入实际模型 messages。

Send Manifest 负责用户确认/审计。

Model prompt 必须真正包含 Planner 所需的信息。

---
严格禁止
---

不要：

- 修改 Stage 2A 核心契约
- 删除 revision immutability
- 绕过 Send Manifest
- 使用 FakeProvider
- 自动覆盖正文
- 自动重写受影响章节
- 实现 Stage 2B
- 实现 Stage 2C
- 添加 Arc
- 添加 Character State
- 添加 Relationship State
- 添加 World State
- 添加 Timeline
- 添加 Foreshadow
- 添加 Research
- 添加 Vector Search
- 添加 Web Crawler
- commit
- push

---
修复后必须运行
---

1. 全部 pytest
2. Stage 2A tests
3. TypeScript
4. migration compatibility
5. fresh database
6. existing Stage 1 project
7. Real Grok outline generation
8. Real Grok Chapter 1 generation
9. Real Grok Chapter 2 generation
10. Chapter 1 continuity → Chapter 2
11. 3-volume split
12. stale chapter outline confirmation
13. 10-chapter continuity

最终只报告：

A. 修改文件
B. 修复的问题
C. 自动化测试
D. Real Grok Outline
E. Real Grok Chapter 1
F. Real Grok Chapter 2
G. Continuity
H. Split
I. Source validation
J. 是否仍存在 blocker

不要 commit。
不要 push。
```

### 最后一个关键点

这次**不要因为 Agent 说“79 passed”就接受**。

现在真正的验收标准应该是：

> **Fake/Mock 测试通过 + Real Grok 至少完整跑通 Outline → Chapter 1 → Chapter 2 → Local Continuity。**

只有这个链条真正跑通，Stage 2A 才算完成。

尤其是：

**真实 Grok Chapter 1 成功落库 → 本地连续性成功生成 → Chapter 2 Writer Pack 实际拿到 Chapter 1 连续性 → Chapter 2 成功生成。**

这一条是当前最重要的“黄金路径”。

## Prompt:
10/5/2026, 7:17:04 AM

我发现我可以选择grok 4.7 extra high fast

## Response:
10/5/2026, 7:17:08 AM · gpt-5-6

对，这个信息很重要。

如果你现在在 Cursor 里确实可以选择 **Grok 4.7 Extra High Fast**，那么对于我们这个项目，我会**优先选择它，而不是之前的 Grok 4.7 High**。

### 为什么

你现在遇到的真实问题之一是：

> Grok 4.7 High 生成 5000 字总大纲约 60 秒超时。

而 Stage 2A 的任务不是简单聊天，而是：

- 长篇结构规划
- 5000 字左右的大纲
- 人物、世界观、剧情约束整合
- 结构化 JSON
- 长上下文理解
- 多章节连续性
- 后续还要处理复杂的 Writer Pack

所以更高 reasoning effort 对这个项目是有价值的。

可以简单理解：

| 模型 | 适合程度 |
|---|---|
| Grok 4.7 High | ⭐⭐⭐⭐ |
| **Grok 4.7 Extra High Fast** | **⭐⭐⭐⭐⭐ 推荐** |

这里的 **Fast** 不代表“降低智能”，而是这个模型/配置的服务档位名称；如果 Cursor 当前允许你直接选择 `Extra High Fast`，它很适合拿来做我们现在的真实 E2E 验收。

### 但是有一个重要区别

**不要把“换成 Extra High”当成 Stage 2A 的修复。**

之前发现的：

> Grok 返回错误 `chapter_id`

这仍然是**架构问题**。

正确方案依然是：

```text
Grok
 ↓
生成正文内容
 ↓
服务器赋予 chapter_id
 ↓
Prose Revision
```

而不是：

```text
Grok Extra High
 ↓
希望它这次猜对 chapter_id
```

同样，5000 字大纲超时也不能简单理解为：

> “换 Extra High 就好了。”

我们应该先修复 Agent 刚才发现的 **Planner 输入不完整、artifact identity、Split 孤儿 Chapter** 等问题，然后用 **Grok 4.7 Extra High Fast** 再跑真正的验收。

### 我建议现在这样做

如果 Cursor Agent 可以指定模型：

**Stage 2A Repair → 使用 Grok 4.7 Extra High Fast → 修复 → Real E2E。**

而且这次特别值得比较：

```text
5000 字 Story Outline
Grok 4.7 High
vs
Grok 4.7 Extra High Fast
```

我们可以观察：

- 是否仍然 60 秒超时
- structured output 是否稳定
- 是否遵守大纲结构
- 正文 artifact 是否稳定
- Chapter 1 → Chapter 2 连续性质量
- Writer Pack 是否真正被利用

**如果 Extra High Fast 能稳定完成长篇规划，它可以成为这个项目的默认高级规划/写作模型。**

另外，你之前的 Cursor 模型选择里已经有不同 reasoning 档位；现在既然 Extra High Fast 对你开放了，**我会优先把它用于这次 Stage 2A 的真实测试，而不是继续用 High。**

## Prompt:
10/5/2026, 7:18:13 AM

好的

## Response:
10/5/2026, 7:18:21 AM · gpt-5-6

好的。👍

你现在就按这个顺序：

1. **Cursor Agent 模型切换到 `Grok 4.7 Extra High Fast`**
2. **不要直接重新做 Stage 2A 验收**
3. 把我上一条给你的 **Stage 2A Repair Prompt** 发给 Agent，让它先修复：
   - P0-1：模型不再负责 `chapter_id` 等身份字段
   - P0-2：真实 Grok 大纲生成超时
   - P0-3：Split 创建正式 Chapter
   - P0-4：Chapter Outline 确认时检查 Story/Volume Outline 是否过期
   - P1：旧项目没有大纲时提供恢复路径
   - P1：Planner 真正把人物、世界观、用户要求等内容传给模型
4. 明确告诉 Agent：**不要进入 Stage 2B/2C，不要改已经冻结的 Stage 2A Contract，不要 commit/push。**
5. Agent 修完后，先让它跑：
   - `pytest`
   - 前端 `tsc`
   - migration/fresh DB
   - **Real Grok E2E**
6. 最重要的是重新验证这条真实链路：

**用户想法 → Grok 生成 Story Outline → Confirm → Volume Outline → Chapter Outline → Confirm → Chapter 1 正文 → Chapter 1 Continuity → Chapter 2 正文 → 正确读取 Chapter 1 Continuity**

如果 Agent 接下来给你一份执行结果，**直接把完整结果贴给我**。我可以帮你判断这次到底是 **Stage 2A 可以验收了，还是还有 P0 问题**。

## Prompt:
10/5/2026, 12:41:00 PM

真实 Grok 的失败点已经明确：模型不该填写章节身份，5000 字大纲不能在 60 秒里一次写完，拆出来的后续章节也没有进入章节索引。我按这三处阻塞来修，不改已冻结的表结构。

I'll finish the remaining Stage 2A blockers: split chapter registration, stale outline confirmation, and planner messages that actually reach the model.

Identity is already stripped from prose, but split chapters still never enter the index and chapter-outline confirmation still accepts a stale source. I'll close those gaps and put the planner context into the actual model messages.

A. 修改文件
这次修复动到的文件：

pipeline/schemas/prose_draft.json、pipeline/schemas/outline_expansion.json
pipeline/outline_gen.py、pipeline/chapter_flow.py
providers/router.py、providers/protocol.py、providers/adapters/grok.py
agents/writer.py
canon/outline_flow.py、canon/outline_doc.py
host/routes.py、host/outline_routes.py
client/src/lib/api.ts、client/src/components/outline/OutlinePanel.tsx、client/src/components/outline/ChapterPlan.tsx
tests/test_stage2a_repair.py、tests/test_router_selects_grok.py
没有改数据库表，没有 commit，没有 push。

B. 修复的问题
模型不再负责 project_id、chapter_id、revision_id 和大纲来源标识。这些字段在校验前被丢掉，服务器按当前章节写入。错的 chapter_id 不会被改写成“模型猜对了”。
总大纲先要短骨架，再按章分批补写。最终 Markdown 不含空白的字数仍须落在用户给出的最少和最多之间，否则 OUTLINE_LENGTH_UNMET，不保存。规划请求带 reasoning_effort=low，端点仍是 https://api.x.ai/v1/chat/completions。
模型消息里包含故事想法、要求、禁止、人物、世界、项目上下文和目标/最少/最多字数。
Split 创建的章节会写入 chapter_index，并带上 volume_id、reading_order、global_index。
确认章节大纲时，总大纲和卷大纲来源必须仍是当前确认稿，否则 OUTLINE_SOURCE_STALE。
没有总大纲的旧项目仍返回 OUTLINE_NOT_CONFIRMED，并说明下一步是打开「大纲」。
C. 自动化测试
全部 pytest：87 passed。
Stage 2A 与修复测试：通过。覆盖无身份正文、错误 chapter_id 被忽略、规划消息含人物/世界/想法/字数、4000–6000 字数合同、未达标不保存、三卷各至少两章且全部可查询、过期章节大纲不能再确认、旧项目下一步。
tsc -b：通过。
迁移再应用：三个现有项目的 newly 列表都是 []，版本为 1–4。
新库：pytest 的临时库覆盖了新建项目和迁移往返。
十章连续性测试：通过。
D. Real Grok Outline
项目 01a1095b-90a6-7479-a64b-b0608a060b65（雾港修复四）。目标 5000、最少 4000、最多 6000。真实 Grok 用时 381.3 秒，保存的大纲是 5032 字，3 卷 6 章，作者 planner。没有使用 FakeProvider。

E. Real Grok Chapter 1
《旧案回声》生成成功，25.6 秒，约 1595 字。修订 01a10961-c777-71a9-ba00-1035f1f48d39。返回体只有正文，章节标识由服务器写入。

F. Real Grok Chapter 2
《档案禁区》生成成功，26.8 秒，约 1723 字。修订 01a10962-3007-7138-b0c1-69c3d829dfa4。

这两章所在项目没有单独的章节字数范围，所以没有触发篇幅修正。

G. Continuity
第二章的发送清单含有第一章的本地摘要，来源修订就是第一章正文 01a10961-c777-71a9-ba00-1035f1f48d39。摘要从“雾还贴在港务楼的玻璃上。林夏把失踪者的潮汐表……”接上。清单里没有第一章全文。同时有禁止、要求、总大纲、卷大纲、章节大纲、人物林夏、世界雾港。云端记忆仍是关闭。

H. Split
拆分后 6 章全部 GET /chapters/{id} 为 200，章节大纲也可读。三卷各 2 章。reading_order 与 global_index 都是 1–6。

I. Source validation
总大纲改成第二版并重新拆分、确认卷大纲后，再确认旧的章节大纲：409 OUTLINE_SOURCE_STALE。

旧项目《现代都市》生成正文仍是 OUTLINE_NOT_CONFIRMED，提示打开「大纲」。第二章修订仍是 01a108f1-4a1e-72b8-b748-e5d75db8c546。

J. 是否仍存在 blocker
这四项验收阻塞已经解开：身份字段、5000 字大纲、拆分孤儿章、过期大纲确认。十章连续性由自动化测试覆盖。没有新的 P0 blocker。

## Response:
10/5/2026, 12:41:02 PM · gpt-5-6

这次结果已经和上一次完全不同了。**按照你之前冻结的 Stage 2A 验收标准，我认为现在可以进入“正式验收”，而不是继续让 Agent 修改架构。**

关键证据基本都齐了：

| 验收点 | 结果 | 判断 |
|---|---|---|
| 模型不再负责 `chapter_id` 等身份 | Real Grok 成功 | ✅ |
| 5000 字 Story Outline | 381.3s，5032 字，真实 Grok | ⚠️ 通过功能验收，但耗时值得记录 |
| Outline 长度合同 4000–6000 | 自动化通过 | ✅ |
| Split 后章节正式进入索引 | 6/6 可 GET，reading_order 1–6 | ✅ |
| 三卷各 2 章 | 通过 | ✅ |
| Stale Outline 阻止确认 | 409 `OUTLINE_SOURCE_STALE` | ✅ |
| Planner 真正收到人物/世界/想法/要求 | 测试通过 | ✅ |
| Chapter 1 Real Grok | 25.6s，约1595字 | ✅ |
| Chapter 2 Real Grok | 26.8s，约1723字 | ✅ |
| Chapter 2 获取 Chapter 1 Continuity | 正确 source revision | ✅ |
| 没有把 Chapter 1 全文塞给 Chapter 2 | 已验证 | ✅ |
| Cloud Memory 关闭仍能连续 | Local Continuity 生效 | ✅ |
| 旧项目安全阻止生成 | `OUTLINE_NOT_CONFIRMED` | ✅ |
| 87 pytest | 全部通过 | ✅ |
| `tsc -b` | 通过 | ✅ |
| Migration 重复应用 | 无新增迁移 | ✅ |
| 十章连续性 | 自动化通过 | ✅ |

### 唯一需要你注意的地方：381 秒

这个**现在不应该再判定为 P0 blocker**。

因为最重要的是：

> 真实 Grok → 真正生成 → 5032 字 → 满足 4000–6000 → 正确保存 → 没有 FakeProvider。

也就是说，上一次的：

> **60 秒超时 → 根本没有 Outline**

已经被解决成：

> **381 秒 → 成功生成完整 Outline**

不过我建议把它记录成 **性能问题 / P1 优化项**，而不是继续改 Stage 2A 架构。

尤其你现在用的是 **Grok 4.7 Extra High Fast**，如果 Planner 还用了 `reasoning_effort=low`，381 秒仍然偏长。以后可以专门优化 Planner：

**骨架 → 分卷 → 分章 → 合并**

或者进一步做并行/流式生成。

但这些属于后续优化，不应该为了追求更低延迟再次破坏已经通过的 Stage 2A Contract。

---

## 现在我建议你做最后一次“正式验收”

不要再让 Agent 修改代码。

直接让 Agent 执行一份**只验收、不修改、不提交**的最终验收。

你可以直接把下面这段发给 Cursor Agent：

```text
Stage 2A Final Acceptance Only.

Do NOT modify code.
Do NOT refactor.
Do NOT change database schema.
Do NOT create migrations.
Do NOT commit.
Do NOT push.
Do NOT start Stage 2B or Stage 2C.

This is a final acceptance run only.

Use the real Grok 4.7 Extra High Fast provider for all real E2E model calls.
Do not use FakeProvider for any real E2E acceptance item.

Please verify the following Stage 2A acceptance chain:

1. Create a fresh temporary project.
2. Generate Story Outline with real Grok.
   - target = 5000
   - min = 4000
   - max = 6000
   - verify saved outline length is within [4000, 6000]
   - verify author/provider is real planner/Grok, not FakeProvider.
3. Confirm Story Outline.
4. Split into volumes and chapters.
5. Verify every split-created chapter:
   - exists in chapter index
   - GET /chapters/{id} returns 200
   - correct volume_id
   - correct reading_order
   - correct global_index
   - chapter outline is queryable
6. Confirm all required Volume Outlines.
7. Confirm Chapter Outlines.
8. Generate Chapter 1 with real Grok.
   - verify prose revision is created
   - verify server assigns chapter identity
   - verify model cannot corrupt chapter identity
9. Verify Chapter 1 local continuity is created.
10. Generate Chapter 2 with real Grok.
    - verify Writer Pack contains Chapter 1 local continuity
    - verify source_revision_id points to Chapter 1's actual prose revision
    - verify Chapter 1 full prose is NOT injected into Chapter 2 context
11. Modify Chapter 1 outline.
    - Chapter 1 must become own_outline / needs_review
    - later chapters must become upstream_outline / needs_sync
    - existing prose must remain unchanged
12. Regenerate Chapter 1.
    - new prose revision must be created
    - later chapters must remain impacted
13. Modify Story Outline and create a stale Chapter Outline.
    - attempting to confirm the stale Chapter Outline must fail with OUTLINE_SOURCE_STALE
    - no model call
14. Test an old project without a confirmed Story Outline.
    - generation must fail with OUTLINE_NOT_CONFIRMED
    - response must tell the user to open the Outline flow
15. Run the full automated test suite.
16. Run TypeScript compilation.
17. Verify migrations are idempotent.
18. Run the existing 10-chapter continuity acceptance test.

Acceptance rules:

- No P0 blocker.
- No schema changes.
- No FakeProvider in real E2E.
- No silent prose overwrite.
- No orphan split chapters.
- No stale outline confirmation.
- No missing local continuity.
- No full-novel context injection.

At the end, report ONLY:
A. PASS/FAIL for each acceptance item
B. Any remaining P0/P1/P2 issues
C. Real Grok timings
D. Final verdict: STAGE 2A ACCEPTED or STAGE 2A NOT ACCEPTED

Do not make any changes even if an issue is found.
```

### 如果这次全部 PASS

那么我建议我们就正式把：

> **Stage 2A = ACCEPTED / FROZEN**

然后**不要再继续往 Stage 2A 里面塞功能**。

下一阶段才进入你之前规划的 **Stage 2B/2C**，例如：

- 更完整的角色状态
- 时间线
- Foreshadowing / 埋线
- Arc
- Scene
- 更精细的长期 Continuity
- Research
- Source Registry / 商用版权安全
- Style Profile
- 更强的 Writer Pack
- 长篇小说级状态管理

这样整个项目不会再次陷入“Stage 2A 越做越大、永远验收不了”的问题。

## Prompt:
10/5/2026, 1:04:24 PM

Acceptance is read-only. I’ll confirm the live Grok endpoint, then run the Stage 2A chain on a new temporary project without changing code or data models.

A. PASS/FAIL
Item	Result
1. Fresh temporary project
PASS. 01a10a60-58a5-7029-918f-47b9b6cdc207
2. Real Grok story outline, 5000 / 4000 / 6000
FAIL. HTTP 422 OUTLINE_INCONSISTENT: 章「十年回声」的事件在渲染后对不上. No story outline revision was saved, so length could not be checked.
3. Confirm story outline
FAIL. Not reached.
4. Split volumes and chapters
FAIL. Not reached.
5. Every split chapter is indexed and readable
FAIL. Not reached.
6. Confirm volume outlines
FAIL. Not reached.
7. Confirm chapter outlines
FAIL. Not reached.
8. Real Grok Chapter 1, server-owned identity
FAIL. Not reached.
9. Chapter 1 local continuity
FAIL. Not reached.
10. Real Grok Chapter 2 continuity pack
FAIL. Not reached.
11. Chapter 1 outline edit leaves prose unchanged and marks impact
FAIL. Not reached.
12. Regenerate Chapter 1 without clearing later impact
FAIL. Not reached.
13. Stale chapter outline confirm returns OUTLINE_SOURCE_STALE with no model call
FAIL. Not reached.
14. Old project without a story outline
PASS. OUTLINE_NOT_CONFIRMED. Message tells the user to open 「大纲」. Next step create_story_outline. Chapter 2 revision stayed 01a108f1-4a1e-72b8-b748-e5d75db8c546. Model calls: 0.
15. Full automated suite
PASS. 87 passed.
16. TypeScript compilation
PASS. tsc -b exit 0.
17. Migrations idempotent
PASS. Nine existing projects are on versions 1–4. Two reapply passes added nothing.
18. 10-chapter continuity test
PASS. test_ten_chapter_continuity_is_not_a_two_chapter_special_case is in the suite that passed with 87 passed and 0 failed.
The outline calls used provider grok, model grok-4.7. No FakeProvider manifest was created. The enabled endpoint is grok-4.7; the application sends reasoning_effort=low on planner and writer calls.

B. Remaining issues
P0. A finished real Grok story outline can be discarded before save. This run produced the structured outline, then save rejected it because one chapter’s events did not round-trip through Markdown. Nothing was stored, so confirm, split, prose, continuity, impact, and stale-source checks could not run.

P1. None observed on the steps that did run.

P2. This run could not select a separate “Extra High Fast” model. The only enabled real endpoint is grok-4.7, and planner calls are fixed at low reasoning effort.

C. Real Grok timings
Story outline: 366.0 seconds, then 422. No revision saved.
Chapter 1: not called.
Chapter 2: not called.
Chapter 1 regenerate: not called.
D. Final verdict
STAGE 2A NOT ACCEPTED

## Response:
10/5/2026, 1:05:09 PM · gpt-5-6

这次验收结果很明确：**Stage 2A 仍然不能通过，而且这次暴露的是一个真正的 P0 数据一致性问题。**

但好消息是，前面那四个大问题已经不是当前 blocker 了。现在只剩下一个核心问题：

> **Real Grok 已经成功生成结构化 Story Outline，但服务器在“结构化数据 → Markdown → 再解析”这一环节发现事件不一致，于是把本来已经生成成功的 Outline 整体丢弃。**

这不是 Grok 本身生成失败，而是 **Outline artifact pipeline 的一致性错误**。

### 我对这次结果的判断

目前链路是：

```text
Grok
 ↓
结构化 Story Outline
 ↓
服务器渲染 Markdown
 ↓
Markdown 再解析
 ↓
结构化 JSON 不一致
 ↓
OUTLINE_INCONSISTENT
 ↓
不保存
```

而你之前冻结的 Contract 明确规定：

> **structured_json 是 authority；Markdown 是由服务器渲染出来的表示。**

因此这里最应该修的是**服务器内部的数据流**，而不是让 Grok 更努力地生成，也不是简单放宽 `OUTLINE_INCONSISTENT`。

---

# 下一步不要重新验收

直接让 Agent 修这个 P0。

尤其不要让它做这种“修复”：

- ❌ 忽略事件 mismatch
- ❌ 允许不一致数据保存
- ❌ 删除 `OUTLINE_INCONSISTENT`
- ❌ 把 Markdown 当成最终 authority
- ❌ 让模型自己重新修 Markdown
- ❌ 降低 5000 字要求
- ❌ 改数据库结构
- ❌ 进入 Stage 2B

正确方向应该是：

> **AI 产生结构化 Outline → Server 验证结构 → Server 根据结构生成 Markdown → 保存同一份结构 + Markdown。**

而不是：

> AI → Markdown → Parser → 再和 AI JSON 比较。

---

## 直接把这个 Repair Prompt 发给 Agent

```text
Stage 2A P0 Repair Only — OUTLINE_INCONSISTENT Round-Trip Failure

The latest read-only acceptance exposed one remaining P0 blocker.

DO NOT start another acceptance run yet.
DO NOT modify the frozen Stage 2A database schema.
DO NOT start Stage 2B or Stage 2C.
DO NOT commit.
DO NOT push.

Problem observed in real Grok E2E:

Real Grok successfully produced a structured Story Outline for:

project = 01a10a60-58a5-7029-918f-47b9b6cdc207
target = 5000
min = 4000
max = 6000
provider = grok
model = grok-4.7
reasoning_effort = low

The planner call completed after 366 seconds.

However, saving failed with:

HTTP 422 OUTLINE_INCONSISTENT:
章「十年回声」的事件在渲染后对不上

No Story Outline Revision was saved.

This means the current structured-outline -> Markdown -> parser validation pipeline is incorrectly rejecting a valid AI-generated structured artifact.

Frozen Stage 2A contract:

- structured_json is authoritative.
- Markdown is a server-rendered representation.
- For AI-generated outline artifacts, the server owns rendering.
- User Markdown edits may be parsed back into structured_json.
- Confirmed revisions are immutable.
- OUTLINE_INCONSISTENT must remain available for genuine user Markdown/structure mismatch.
- Do not weaken validation globally.

Required repair:

1. Trace the exact real Grok Story Outline save path from model response to:
   - structured_json
   - Markdown rendering
   - Markdown parsing
   - consistency validation
   - revision persistence.

2. Identify why the event list for chapter 「十年回声」 changes during render/parse.

3. Fix the AI-generated outline path so that:
   - the validated structured_json remains authoritative;
   - the server renders Markdown from that exact structured_json;
   - the server does NOT unnecessarily parse its own freshly rendered Markdown and reject the authoritative structure;
   - if a canonical round-trip validation is retained, it must compare against the canonical server-rendered representation and must not introduce semantic loss;
   - genuine user-edited Markdown inconsistencies must still produce OUTLINE_INCONSISTENT.

4. Pay particular attention to:
   - event IDs / event ordering;
   - generated IDs;
   - Markdown heading parsing;
   - event bullet formatting;
   - escaping;
   - Chinese punctuation;
   - duplicate-looking event titles;
   - whitespace normalization;
   - list serialization/deserialization;
   - any `{#id}` handling;
   - whether render() mutates or regenerates IDs;
   - whether parse(render(structured_json)) changes semantic fields.

5. Add a regression test using the actual failure shape:
   - a chapter named 「十年回声」
   - multiple events
   - Chinese text
   - the same structure that previously triggered the mismatch if it can be recovered from logs/artifacts.

   The test must prove:

   structured_json
       -> server render
       -> stored Markdown

   does not change the authoritative structured data.

6. Add a separate test proving that a genuinely user-modified Markdown outline that changes/removes an event still produces:
   OUTLINE_INCONSISTENT

7. Verify that a valid AI-generated Story Outline is actually persisted:
   - story_outline_revision created
   - structured_json present
   - Markdown present
   - target/min/max retained
   - actual length within the requested range
   - author remains planner
   - no FakeProvider fallback.

8. Do NOT solve the problem by:
   - ignoring event mismatches;
   - deleting OUTLINE_INCONSISTENT;
   - accepting arbitrary inconsistent JSON;
   - lowering the requested outline length;
   - truncating the outline;
   - asking Grok to retry until it happens to pass;
   - changing the database schema.

9. Keep all previously fixed Stage 2A behavior intact:
   - server-owned chapter identity;
   - real Grok planner context;
   - split-created chapters are registered;
   - stale chapter outline confirmation returns OUTLINE_SOURCE_STALE;
   - local continuity;
   - impact marking;
   - OUTLINE_NOT_CONFIRMED old-project recovery path.

10. Run:
   - full pytest
   - Stage 2A repair tests
   - TypeScript compilation
   - migration idempotency
   - 10-chapter continuity test.

11. Do NOT run the final Real Grok acceptance yet unless needed specifically to reproduce/debug this bug.

At the end report:

A. Root cause
B. Exact files/functions changed
C. Why the fix preserves the frozen Stage 2A contract
D. Tests added
E. Full pytest result
F. TypeScript result
G. Migration result
H. Whether any P0/P1 blockers remain

Do not commit or push.
```

### 有一个地方我特别建议 Agent 检查

这次错误：

> `章「十年回声」的事件在渲染后对不上`

非常像 **ID/顺序/Markdown round-trip** 问题，而不是字数问题。

例如：

```text
structured_json
events:
  - id: event-1
    title: ...
  - id: event-2
    title: ...
```

渲染成 Markdown 后，如果 parser：

```text
event-1
event-2
```

没有正确保留 ID，或者重新生成 ID，再比较：

```text
event-1 != generated-id
```

就会产生这种错误。

所以我会让 Agent **优先追踪 `render → parse → compare` 的具体字段差异**，不要凭经验直接改逻辑。

---

## 现在 Stage 2A 的状态

可以把它看成：

```text
                 Stage 2A
                    │
       ┌────────────┴────────────┐
       │                         │
  已解决的 P0                当前唯一 P0
       │                         │
身份归属                  Outline round-trip
5000字生成               structured → MD → parse
Split章节                「十年回声」事件不一致
Stale验证
Planner上下文
Continuity
Impact
       │                         │
       └────────────┬────────────┘
                    ↓
             修复后再正式验收
```

**这一次不要急着重新验收。**
先让 Agent 把这个 P0 修干净，然后把它的修复报告贴给我。我们再决定是否进行最后一次 Real Grok E2E。

另外，**366 秒本身暂时不用继续追**。功能链现在首先必须做到“真实生成 → 稳定保存”；等 Stage 2A 通过以后，再单独做 Planner 性能优化更合理。

## Prompt:
10/5/2026, 1:20:22 PM

The save path is rejecting a structured outline the server itself just rendered. I’ll trace that round-trip for chapter 「十年回声」 and fix only the loss that happens between render and parse.

The parser drops the last event. parse_story strips the final newline, and the bullet pattern only accepts a bullet that ends with a newline, so each pass loses one more event and the round-trip fails.

A. Root cause
parse_story called strip() on the server-rendered Markdown, which removed the final newline. The event reader only accepted a bullet that ended with a newline, so the last event in the document was dropped. A second parse of the re-rendered result dropped one more event. same_story then failed with 章「十年回声」的事件在渲染后对不上, and save_planner_story raised OUTLINE_INCONSISTENT before inserting a revision. The model payload was never stored. This hits a chapter whose event list is the last bullet list in the file, which is the shape of that Grok outline.

B. Exact files/functions changed
canon/outline_doc.py
parse_story: after strip(), the terminating newline is restored.
_read_top_list: the last bullet is kept even when it sits at the end of the text.
_reject_unparsed_chapter_lines: a chapter line that is not a goal, label, bullet, or scene is a real mismatch.
_parse_chapters: runs that check on each chapter body.
tests/test_stage2a_repair.py
test_trailing_chapter_events_round_trip_and_are_persisted
test_user_markdown_that_unmarks_an_event_is_inconsistent
C. Why the fix preserves the frozen Stage 2A contract
structured_json is still what gets stored for a planner outline, and Markdown is still render_story of that structure. The parser no longer loses the last event, so parse(render(structured)) matches the authoritative structure instead of rejecting it. Confirmed revisions are still immutable. User Markdown is still parsed back. A bullet whose marker was removed, leaving the event text behind, still returns OUTLINE_INCONSISTENT. Deleting a whole event bullet still saves a new revision. No schema change, no length change, no FakeProvider path.

D. Tests added
Chapter 「十年回声」, three Chinese events, the event list last in the document. Server render and a stripped copy both keep those events. save_planner_story writes a planner revision with structured_json, Markdown, target 5000, minimum 4000, maximum 6000, and actual_length 4678. Confirm succeeds. No model call.

User Markdown that removes the - marker from one event returns 422 OUTLINE_INCONSISTENT and saves nothing. Removing that whole bullet saves a revision whose event list no longer contains it.
E. Full pytest result
89 passed.

F. TypeScript result
tsc -b exit 0.

G. Migration result
Existing projects stay on versions 1–4. Two reapply passes added nothing.

H. Whether any P0/P1 blockers remain
No P0 or P1 remains for this round-trip failure. The 10-chapter continuity test is in the 89 passed suite. Real Grok acceptance was not run again.

## Response:
10/5/2026, 1:20:25 PM · gpt-5-6

这次修复我认为是**正确方向，而且已经可以进入最后一次 Real Grok 验收**。

关键区别在于：这次不是“让测试通过”，而是找到了一个非常具体、可复现的真实数据损失：

> `render(structured_json)` → `parse()` 时，最后一个 event 被丢弃。

而且修复没有破坏你冻结的 Contract。

### 当前状态

- **P0：已修复** ✅
- **P1：没有发现** ✅
- `89 passed` ✅
- TypeScript ✅
- Migration 幂等性 ✅
- 10 章连续性测试 ✅
- 用户手工 Markdown 真正不一致仍能触发 `OUTLINE_INCONSISTENT` ✅
- **Real Grok 最终验收：尚未重新执行** ⏳

所以现在**不要再让 Agent 修改代码**。

直接进行最后一次 Real Grok Acceptance。

我尤其建议这次验收不要只验证“Outline 能保存”，而是必须完整跑到：

```text
Real Grok
  ↓
Story Outline
  ↓
保存
  ↓
Confirm
  ↓
Split
  ↓
Volume Outline
  ↓
Chapter Outline
  ↓
Confirm
  ↓
Chapter 1
  ↓
Local Continuity
  ↓
Chapter 2
  ↓
读取 Chapter 1 Continuity
  ↓
Impact
```

如果这一整条链成功，那么 **Stage 2A 就可以正式 ACCEPTED/FROZEN**。

你可以直接对 Agent 说：

```text
The P0 round-trip bug is now fixed and 89 tests pass.

Now run the FINAL Stage 2A acceptance only.

READ-ONLY ACCEPTANCE:
- Do not modify code.
- Do not modify database schema.
- Do not create migrations.
- Do not commit.
- Do not push.
- Do not start Stage 2B/2C.
- Do not use FakeProvider for real E2E.

Use the live Grok endpoint.

Run the complete Stage 2A acceptance chain on a fresh temporary project:

1. Generate Story Outline with real Grok:
   target=5000
   min=4000
   max=6000

2. Verify:
   - generation succeeds
   - revision is persisted
   - actual length is 4000–6000
   - structured_json is persisted
   - Markdown is persisted
   - no OUTLINE_INCONSISTENT

3. Confirm Story Outline.

4. Split into volumes and chapters.

5. Verify every split-created chapter:
   - registered in chapter index
   - GET returns 200
   - correct volume_id
   - correct reading_order
   - correct global_index
   - chapter outline is accessible

6. Confirm required Volume Outlines.

7. Confirm required Chapter Outlines.

8. Generate Chapter 1 using real Grok.
   Verify:
   - prose revision exists
   - server owns chapter identity
   - model cannot overwrite chapter identity

9. Verify Chapter 1 local continuity.

10. Generate Chapter 2 using real Grok.
    Verify:
    - Writer Pack contains Chapter 1 local continuity
    - source_revision_id is Chapter 1's actual prose revision
    - Chapter 1 full prose is not included
    - story/volume/chapter outlines are present
    - characters/world context is present

11. Modify Chapter 1 outline.
    Verify:
    - Chapter 1 = own_outline / needs_review
    - later chapters = upstream_outline / needs_sync
    - existing prose is unchanged

12. Regenerate Chapter 1.
    Verify:
    - new prose revision exists
    - later chapters remain impacted

13. Create a stale Chapter Outline by changing Story Outline.
    Attempt confirmation.
    Must return:
    OUTLINE_SOURCE_STALE
    and must make zero model calls.

14. Test an old project without a confirmed Story Outline.
    Must return:
    OUTLINE_NOT_CONFIRMED
    and tell the user to open the Outline flow.
    Must make zero model calls.

15. Run:
    - full pytest
    - TypeScript compilation
    - migration idempotency
    - 10-chapter continuity test

At the end report:

A. PASS/FAIL for every item
B. Real Grok timings
C. Any P0/P1/P2 issues
D. Whether any prose was overwritten unexpectedly
E. Whether any orphan chapters were created
F. Whether any stale outline was confirmed
G. Final verdict:

STAGE 2A ACCEPTED

or

STAGE 2A NOT ACCEPTED

Do not make any changes during this acceptance run.
```

**这次如果完整链路通过，我建议我们就停止继续修 Stage 2A。**

特别是不要因为 Story Outline 花了几分钟就重新改核心架构。**功能正确性先封板，性能优化另开一个阶段。**

## Prompt:
10/5/2026, 1:32:39 PM

The acceptance run stays read-only. I’ll confirm the live host is serving the fixed code, then run the full Stage 2A chain on a new temporary project with real Grok.

A. PASS/FAIL
Item	Result
1. Real Grok story outline, 5000 / 4000 / 6000
PASS. HTTP 200. No OUTLINE_INCONSISTENT.
2. Revision persisted with length, structured JSON, and Markdown
PASS. actual_length 5035. structured_json 6487 bytes, 3 volumes and 6 chapters. Markdown 5347 bytes. Author planner. Provider grok, model grok-4.7. Fake manifests: 0.
3. Confirm story outline
PASS. 200.
4. Split
PASS. 200.
5. Every split chapter
PASS. 6 chapters, all indexed, all GET 200, outlines readable. reading_order and global_index are 1–6. Three volumes, two chapters each, volume_id matches the chapter row.
6. Confirm volume outlines
PASS. All 3 returned 200.
7. Confirm chapter outlines
PASS. All 6 returned 200.
8. Real Grok Chapter 1
PASS. Prose 01a10a88-bf4b-70be-b01d-80fcf4a45ded on chapter 01a10a88-3a66-74a7-8ea8-183afaba2bf7. Stored chapter_id is that chapter.
9. Chapter 1 local continuity
PASS. Summary present. source_revision_id is that prose revision.
10. Real Grok Chapter 2 pack
PASS. Pack has chapter_summary, story_outline, volume_outline, chapter_outline, character, world_entry. Summary opens with Chapter 1. No prose item and no Chapter 1 full text.
11. Chapter 1 outline edit
PASS. Chapter 1 is own_outline / needs_review. Later chapters are upstream_outline / needs_sync. Prose ids unchanged.
12. Regenerate Chapter 1
PASS. New prose 01a10a89-97cf-7df0-a25d-5c217d13fe3f. Later chapters still have open impacts, including upstream_outline. Their prose ids stayed the same.
13. Stale chapter outline confirm
PASS. 409 OUTLINE_SOURCE_STALE. Model calls: 0. New manifests: 0.
14. Old project without a story outline
PASS. 409 OUTLINE_NOT_CONFIRMED. Message tells the user to open 「大纲」. Next step create_story_outline. Model calls: 0. Chapter 2 revision stayed 01a108f1-4a1e-72b8-b748-e5d75db8c546.
15. pytest, TypeScript, migrations, 10-chapter continuity
PASS. 89 passed. tsc -b exit 0. Nine projects stayed on versions 1–4; two reapply passes added nothing. The 10-chapter continuity test is in that passing suite.
Project: 01a10a82-d3af-7db9-af12-04b2d8789e84.

B. Real Grok timings
Story outline: 353.8 seconds.
Chapter 1: 33.8 seconds.
Chapter 2: 28.9 seconds.
Chapter 1 regenerate: 26.4 seconds.
C. P0/P1/P2 issues
None.

D. Unexpected prose overwrite
No. Outline edit left every prose id in place. Regenerating Chapter 1 added a new revision only on Chapter 1. Chapter 2 stayed 01a10a89-3062-7dbd-ac85-714a9bd8c1c1. The old project’s Chapter 2 revision did not change.

E. Orphan chapters
No. All six split chapters are in the chapter index and return 200.

F. Stale outline confirmed
No. The stale confirm was rejected with OUTLINE_SOURCE_STALE.

G. Final verdict
STAGE 2A ACCEPTED

## Response:
10/5/2026, 1:32:42 PM · gpt-5-6

🎉 **正式验收通过。**

现在可以非常明确地把：

# **Stage 2A — ACCEPTED / FROZEN**

写进项目状态了。

这次不是“测试看起来通过”，而是最关键的 **Real Grok 全链路验收通过**。

### 最重要的验证结果

```text
用户想法
  ↓
Real Grok Story Outline
  ↓
5035 / 4000–6000
  ↓
保存 structured_json + Markdown
  ↓
Confirm
  ↓
Split
  ↓
3 Volumes / 6 Chapters
  ↓
Chapter Outline 全部 Confirm
  ↓
Real Grok Chapter 1
  ↓
Local Continuity
  ↓
Real Grok Chapter 2
  ↓
正确读取 Chapter 1 Continuity
  ↓
修改 Chapter 1 Outline
  ↓
Impact 正确传播
  ↓
重新生成 Chapter 1
  ↓
产生新 Revision，不覆盖旧 Revision
  ↓
Stale Outline
  ↓
OUTLINE_SOURCE_STALE
```

而且还有几个非常关键的工程性质被验证了：

- **服务器掌握章节身份**，模型不能污染 `chapter_id`。✅
- **Split 没有孤儿 Chapter**。✅
- **Outline revision 真正持久化**。✅
- **结构化 JSON / Markdown round-trip 正常**。✅
- **Chapter 2 没有携带 Chapter 1 全文**。✅
- **Chapter 2 使用 Chapter 1 的正确 continuity revision**。✅
- **修改 Chapter 1 不会偷偷覆盖 Chapter 2 prose**。✅
- **重新生成只创建新的 Chapter 1 revision**。✅
- **后续章节的 impact 不会被错误清除**。✅
- **过期 Outline 无法确认**。✅
- **旧项目不会绕过 Outline gate**。✅
- **失败情况下没有 FakeProvider 偷渡**。✅
- **89 个自动化测试全部通过**。✅

## 唯一值得记录的事情：353.8 秒

Story Outline：

**353.8 秒 ≈ 5 分 54 秒**

这个现在**不是 Stage 2A 的 blocker**。

功能层面已经证明：

> Grok 能生成 → 能通过 Contract → 能保存 → 能 Confirm → 能 Split → 能驱动后续写作。

所以现在不要为了这个数字再回头修改 Stage 2A。

它应该作为之后的 **Planner Performance Optimization** 单独处理。

---

# 我建议现在正式封板

项目状态可以定义为：

```text
Stage 1   ✅ ACCEPTED / FROZEN
Stage 2A  ✅ ACCEPTED / FROZEN

Stage 2B  ⏳ NOT STARTED
Stage 2C  ⏳ NOT STARTED
```

并且以后如果 Agent 说：

> “顺便把 Stage 2A 的某个架构再重构一下……”

你应该拒绝，除非发现真正的 **P0/P1 bug**。

因为现在最重要的成果是：**我们终于有了一条经过真实 Grok 验证的长篇小说核心生产链。**

### Stage 2A 已经解决了一个非常重要的问题

最开始你的系统实际上是：

> **AI 写一章 → AI 再写下一章**

现在已经变成：

> **故事架构 → 可编辑/确认的 Outline → Volume → Chapter Plan → Prose → Local Continuity → 下一章**

这才真正开始接近你最初想要的 **AI Novel Studio 长篇小说引擎**。

---

下一步如果继续，我建议**不要直接让 Agent 自由发挥**。

先做 **Stage 2B Contract Freeze / Architecture Design**，像 Stage 2A 一样先把数据库、Revision、依赖关系、API、验收标准全部冻结，再让 Agent 实现。

尤其下一阶段如果要加入：

**角色状态 + 时间线 + 埋线/Foreshadowing + Arc + Scene + 更强长期记忆**

这些东西一旦直接开始写代码，很容易再次出现 Stage 2A 初期那种“功能能跑，但底层关系没定义清楚”的问题。

**所以现在这一个节点，可以算是这个项目目前为止真正意义上的第一个里程碑。**

## Prompt:
10/5/2026, 1:33:40 PM

我需要怎么做？

## Response:
10/5/2026, 1:33:42 PM · gpt-5-6

如果你问的是**“Stage 2A 已经通过后，我现在具体应该怎么操作”**，我建议你现在**先不要继续改代码**，按下面顺序做。

## 第一步：把 Stage 2A 封板

先让 Cursor Agent **提交并推送当前已经验收通过的代码**。

你可以直接给 Agent：

```text
Stage 2A has passed the final read-only acceptance.

Now create the official Stage 2A checkpoint.

Before committing:
1. Review git diff and git status.
2. Confirm there are no unintended files, secrets, temporary test artifacts, or debug code.
3. Do not make functional changes.
4. Do not modify the database schema.
5. Do not add Stage 2B/2C features.

Then:
- commit all approved Stage 2A changes
- use commit message:
  "Accept Stage 2A novel outline and continuity engine"
- push the current branch to origin
- report the commit hash and pushed branch

Do not squash or rewrite previous commits.
```

### 为什么现在才提交？

因为刚才的验收是：

> **read-only acceptance**

也就是说 Agent 已经证明代码正确，但之前一直要求它不要 commit/push。

现在通过了，就应该留下一个**明确的、可回退的 Stage 2A 基准点**。

---

# 第二步：不要马上让 Agent 开发 Stage 2B

这是我最建议你的地方。

先让 Agent 给项目做一次**Stage 2B 架构设计**。

你不要说：

> “开始做角色状态、时间线、伏笔……”

这样很容易又开始边设计边写代码。

应该要求：

> **只设计，不写代码。**

你可以直接发送：

```text
Stage 2A is now officially accepted and frozen.

Do NOT modify code.
Do NOT modify database schema.
Do NOT create migrations.
Do NOT commit or push.

We are preparing Stage 2B.

Create a Stage 2B Architecture & Contract Proposal only.

The goal of Stage 2B is to extend the novel engine from the current Stage 2A outline + local continuity system into a stronger long-form state system.

Analyze and propose contracts for:

1. Character State
   - current state
   - location
   - goals
   - relationships
   - knowledge
   - injuries/status if applicable
   - state changes caused by chapters

2. World State
   - locations
   - organizations
   - important objects
   - political/social conditions
   - persistent changes

3. Timeline
   - story time
   - chapter time
   - event ordering
   - relative/absolute time
   - consistency validation

4. Relationship History
   - relationship changes
   - source chapter/revision
   - historical states

5. Foreshadowing / Plot Threads
   - setup
   - active
   - payoff
   - abandoned
   - source chapter
   - target/payoff chapter
   - status after revisions

6. Arc / Scene architecture
   - determine whether these belong in Stage 2B
   - avoid unnecessary schema complexity

7. Revision and dependency semantics
   - how editing an old chapter propagates state invalidation
   - what becomes stale
   - what can be recomputed locally
   - what must be regenerated

8. Writer Pack
   - how Character State, World State, Timeline and Foreshadowing are retrieved
   - context budget
   - ordering
   - source traceability

9. Conflict detection
   - contradictory character state
   - impossible timeline
   - broken relationship state
   - unresolved plot thread

10. Backward compatibility
   - existing Stage 2A projects
   - old prose revisions
   - old continuity summaries
   - projects without Stage 2B state

For every proposed table/entity/API, specify:

- purpose
- fields
- ownership
- revision semantics
- immutable vs mutable data
- source revision
- dependency
- invalidation behavior
- whether it is authoritative or derived

Also explicitly identify:
- what MUST be included in Stage 2B
- what should be deferred to Stage 2C
- what should NOT be implemented at all

Most importantly:

Do not write implementation code.
Do not modify files.
Do not create migrations.

Output only the proposed Stage 2B Contract and Acceptance Criteria.
```

---

# 第三步：把 Agent 的设计报告给我

这一步非常重要。

**不要让 Cursor Agent 自己决定 Stage 2B 最终架构。**

让它先产出方案，然后你把完整结果复制给我。

我会帮你检查：

- 数据库关系有没有循环依赖
- Revision 是否正确
- Chapter 修改后状态怎么失效
- 时间线和 reading order 是否冲突
- Character State 是不是错误地做成“当前值覆盖历史”
- Foreshadowing 是否能追溯到原始章节
- Writer Pack 会不会重新变成“把整个小说塞给模型”
- Stage 2A 是否会被破坏
- 哪些东西应该放 2B、哪些应该推迟到 2C
- 是否会出现新的“Fake 测试通过、Real Grok 失败”问题

然后我们再**冻结 Stage 2B Contract**。

---

## 你现在的正确路线

简单说就是：

```text
现在
 ↓
Stage 2A 已通过
 ↓
① Commit + Push
 ↓
② Stage 2A Freeze
 ↓
③ 只做 Stage 2B Architecture Proposal
 ↓
④ 把 Proposal 发给我
 ↓
⑤ 我们审查/修改
 ↓
⑥ Stage 2B Contract Freeze
 ↓
⑦ Cursor Agent 开始实现
 ↓
⑧ 自动化测试
 ↓
⑨ Real Grok E2E
 ↓
⑩ Stage 2B Acceptance
```

**现在你只需要做两件事：**

**① 让 Agent 把 Stage 2A 提交并推送。**

**② 然后让它做 Stage 2B Architecture Proposal，不要写代码。**

完成第②步后，把 Agent 的完整报告发给我，我们再继续。