## Response:
10/5/2026, 6:50:36 PM · gpt-5-6

可以，而且我建议你**不要把上次整个对话原封不动全部复制过去**。

你现在最适合的做法是：把**上次已经确定的架构、当前状态、已经冻结的部分，以及这次新增的“多小说”需求**整理成一份上下文，直接交给 Cursor。这样 Cursor 不需要重新理解几十轮对话，也能避免它误改已经验收的 Stage 2A/2B。

### 最推荐的方式

你可以把我下面这段**完整复制给 Cursor**。它已经把上次对话中最重要的内容和你这次的新需求合并了：

**document: AI Novel Studio 当前项目上下文与 Multi-Project 需求**

# AI Novel Studio 当前项目上下文

这是一个已经进行到较后阶段的本地优先 AI 长篇小说创作软件。

请把下面内容视为当前项目的冻结背景，不要重新设计已经验收的底层架构。

---

## 一、产品最终目标

AI Novel Studio 的目标不是简单的“AI 自动写小说”，而是一个可以长期协作创作长篇小说的 AI 小说工作台。

最终希望实现：

用户想法
→ AI Story Architecture
→ 可编辑/确认的大纲
→ Volume Outline
→ Chapter Outline
→ Scene Plan
→ Prose
→ Continuity / State
→ 后续章节
→ Revision / Impact Tracking

未来还需要：

- 独立 AI Chat
- 用户自然语言直接和 AI 协作
- AI 根据简单想法生成高质量大纲
- AI 提供多个方案供用户选择
- 用户参与修改大纲和正文
- Research Agent
- 在线小说/资料研究
- 学习抽象的写作特征和类型知识，而不是复制受版权保护的文本
- Critic / Editor
- 长篇小说质量控制

最终体验应该类似：

> 用户和 AI 共同写小说

而不是：

> 点击一个按钮 → AI 写一段文字

---

# 二、已经完成并冻结的部分

## Stage 1

已经完成并接受：

- Provider abstraction
- ModelRouter
- Send Manifest
- Provider error classification
- Revision conflict
- Dirty draft persistence
- Local continuity
- Chapter generation
- Cloud memory optional
- 不允许 FakeProvider 作为真实验收 fallback

Stage 1 已冻结。

---

# 三、Stage 2A 已完成并冻结

Stage 2A 增加：

- Story Outline
- Story Outline Revision
- Volume Outline
- Chapter Outline
- Chapter Outline Revision
- Prose Revision 关联 Outline Revision
- Chapter Summary
- Chapter Impact
- Writer Pack
- Outline confirmation
- Revision chain
- 10 chapter dependency / impact validation

核心关系：

Project
→ Story Outline
→ Story Outline Revision
→ Volume Outline Revision
→ Volume
→ Chapter Outline Revision
→ Chapter
→ Prose Revision
→ Chapter Summary

Writer 生成必须经过：

confirmed story outline
+
confirmed volume outline
+
confirmed chapter outline
+
valid continuity

Outline 结构以 structured_json 为 authority。

Confirmed revision immutable。

Stage 2A 已冻结。

---

# 四、Stage 2B 已完成最终验收并冻结

Stage 2B 增加：

- character_state
- world_state
- world_referent
- chapter_time
- relationship
- plot_thread
- state_impact
- state_conflict
- freshness
- explicit carry-forward
- explicit extraction
- confirmed fresh state
- Writer Pack state blocks

核心原则：

### 1. State 是 chapter-sourced situation state

不是简单的全局人物资料。

### 2. State 必须有 source

每个 revision 都记录：

- source_chapter_id
- source_prose_revision_id
- revision id
- author
- parent_revision_id

### 3. State 必须 fresh

如果来源正文改变：

- 原 state stale
- confirmed pointer 不自动移动
- 不自动重新抽取
- 不自动修改后续正文
- 后续章节产生 state_impact
- Writer Pack 排除 stale state

### 4. Extraction 必须显式触发

没有 Send Manifest：

SEND_NOT_CONFIRMED

并且：

- 不能调用模型
- 不能写 revision
- 不能 Fake fallback

### 5. Confirm 必须显式进行

AI extractor 提案默认 unconfirmed。

用户确认后才进入 confirmed state。

### 6. Writer Pack 只允许：

confirmed
+
fresh
+
same project
+
same branch

的 state。

Stage 2B 最终验收已经 PASS。

当前冻结 commit：

`21c40890a99366bc059de83c98ddc4fadf153e83`

commit message：

`Accept Stage 2B Phase 5 Writer Pack integration`

Phase 6 最终验收：

**STAGE 2B FINAL ACCEPTANCE PASSED**

因此：

## 不要重新设计 Stage 2B。

---

# 五、当前 Writer Quality 问题

虽然架构已经正确，但实际生成的小说质量目前仍然偏“AI”。

目前真实小说测试发现：

- 文字略僵硬
- 对话不像真人
- 人物容易成为剧情执行工具
- 心理活动解释过多
- AI 喜欢直接总结人物情绪
- 场景生活感不足
- 场景转换太快
- 信息密度较高
- 情绪变化比较机械
- 人物缺少独特说话方式
- 相同意象反复出现
- 容易出现“这不是孤例”“这就是他的方向”之类总结句
- 更像“剧情梗概扩写”，还不像真正成熟小说

因此下一阶段原计划是：

# Writer Quality v0

只修改：

- Writer Prompt
- Scene Writing Instructions
- Character Voice Instructions
- Prose generation instructions
- 必要的前端/debug/test

不修改：

- DB
- migration
- Stage 2A
- Stage 2B
- State
- Impact
- Revision
- Provider
- Router
- Writer Pack 数据结构

需要进行同输入 A/B 测试：

相同：

- Story Outline
- Volume Outline
- Chapter Outline
- Scene Sketch
- Character
- World
- State
- Model
- 参数

只改变 Writer Prompt / writing instructions。

重点比较：

- Dialogue
- AI-ness
- Character voice
- Emotion
- Scene reality
- Information exposition
- Pacing
- Repetition
- Stiffness

---

# 六、最近已经完成的前端修复

最近发现两个产品可用性问题：

## 1. 正文复制粘贴

原先 MarkdownEditor 拦截了右键菜单，导致系统复制/粘贴菜单无法正常出现。

已经修改：

`client/src/components/MarkdownEditor.tsx`

恢复浏览器原生右键菜单。

Cmd/Ctrl+C/V 继续交给浏览器和 TipTap。

没有重写 clipboard。

---

## 2. 正文篇幅设置

现在章节页直接显示：

- 目标
- 最少
- 最多
- 当前正文 N 字

留空：

→ 继承上一级

有本章设置：

→ 本章设置

全部为空：

→ 未设

使用现有：

`PATCH /chapters/{id}`

现有 Writer `inherit_length` 不变。

项目首页使用同一组件作为“全书默认”。

---

# 七、当前前端测试状态

最近一次：

- proseEditor.test.ts
- outlineGenerate.test.ts

共：

8 passed

TypeScript：

`tsc -b` PASS

全量 pytest：

`136 passed`

最近前端改动没有修改：

- backend
- DB
- migration
- Stage 2A
- Stage 2B
- Writer
- Provider
- Router

---

# 八、非常重要：现在新增的产品需求

当前发现一个新的核心产品缺点：

## 软件现在实际上只能围绕“一本小说”工作。

但最终产品必须支持：

# Multi-Project / Multi-Novel

用户希望同时管理：

小说 A
小说 B
小说 C
……

例如：

《旧城异能》
《星海纪元》
《悬疑实验》

每一本小说都必须是完全独立的 Project。

---

# 九、Multi-Project 的核心要求

每一本小说应该拥有独立的：

- Story Outline
- Story Outline Revision
- Volume
- Volume Outline
- Chapter
- Chapter Outline
- Prose
- Prose Revision
- Character
- World
- Character State
- World State
- Chapter Time
- Relationship
- Plot Thread
- Continuity
- Chapter Impact
- State Impact
- Revision History

最重要的要求：

# 绝对不能串书。

例如：

小说 A 的：

Character State

绝不能出现在小说 B。

小说 A 的：

Writer Pack

绝不能读取小说 B 的 World / Character / State。

小说 A 的：

AI Chat

不能读取小说 B 的上下文。

小说 A 的：

Chapter Impact

不能影响小说 B。

小说 A 的：

Revision

不能进入小说 B。

---

# 十、希望最终的 UI

进入软件以后应该首先看到：

## 我的小说

例如：

《旧城异能》
都市 · 异能
第 2 章
继续创作

《星海纪元》
科幻
大纲阶段
继续创作

《悬疑实验》
悬疑
第 8 章
继续创作

可以：

- 新建小说
- 打开小说
- 切换小说
- 重命名
- 归档
- 删除
- 查看最近编辑

进入某一本以后：

AI Novel Studio / 我的小说 / 《旧城异能》

之后才进入当前小说的：

Outline
Volume
Chapter
Writing
Character
World
State
等功能。

---

# 十一、Multi-Project 和 Multi-Task 要区分

第一阶段只需要：

# Multi-Project V1

允许用户同时拥有多本小说，并可以快速切换。

暂时不要求：

“小说 A 正在生成第 3 章时，用户切换到小说 B 并让 B 同时生成。”

这是未来：

# Multi-Task / Job Queue V2

以后才考虑：

- Generation Job
- Job Queue
- Background generation
- Progress
- Retry
- Multiple projects generating simultaneously
- API concurrency control

现在不要因为 Multi-Project 而直接引入复杂 Job Queue。

---

# 十二、当前最重要的审查任务

现在不要修改代码。

请对当前仓库进行一次只读 Multi-Project 架构审查。

重点检查：

1. 当前 Project 是否已经天然可以作为“一本小说”的顶层容器？
2. 当前数据库是否已经支持同时存在多个 Project？
3. 当前前端是否已经存在 Project 列表 / 新建 / 打开 / 切换机制？
4. active project 在哪里保存？
5. 哪些 API 使用 project_id？
6. Story Outline 是否严格 project-scoped？
7. Volume 是否严格 project-scoped？
8. Chapter 是否严格 project-scoped？
9. Prose 是否严格 project-scoped？
10. Character / World 是否严格 project-scoped？
11. Stage 2B State 是否严格 project + branch scoped？
12. Chapter Impact 是否严格 project-scoped？
13. State Impact 是否严格 project-scoped？
14. Continuity 是否严格 project-scoped？
15. Writer Pack 是否严格 project + branch scoped？
16. 是否存在任何全局 singleton 数据？
17. 是否存在硬编码 project？
18. 是否存在 project_id 遗漏？
19. 是否存在可能导致 A 小说数据进入 B 小说的查询？
20. 是否需要数据库 migration？
21. 是否可以仅通过已有 Project 数据模型 + 前端 Project Switcher 实现第一版？
22. 如果不能，最小修改是什么？
23. Multi-Task V2 将来需要什么 Job 架构？

---

# 十三、输出格式

请只读分析，不修改任何代码。

不要：

- 修改代码
- 创建 migration
- 提交 Git
- 调用真实 Grok
- 修改 Stage 2A
- 修改 Stage 2B
- 修改 Writer Prompt

请最终输出：

## A. 当前已经支持 Multi-Project 的能力

## B. 当前缺失的能力

## C. Project 隔离风险

## D. Multi-Project V1 最小实现方案

## E. 是否需要 DB migration

## F. 需要修改哪些文件

## G. 哪些文件绝对不能修改

## H. Multi-Task V2 与当前架构的关系

## I. 推荐实施顺序

特别注意：

不要因为发现某些地方不完善，就自行扩大需求。

当前目标只是：

> 从“只能工作在一本小说”升级为“可以管理多本完全独立的小说”。

不要把 AI Chat、Research、Writer Quality、Job Queue 等功能一起实现。

**这段可以直接复制给 Cursor。**

而且我建议你**不要把上次完整聊天记录再复制一遍**。上面这份已经把真正影响下一步开发决策的信息压缩进去了。

另外有一个关键点：**不要让 Cursor 直接开始写 Multi-Project。**先让它做只读审查。因为你现在的底层 `Project` 很可能已经支持多本小说，真正缺的可能只是前端的“小说管理/切换层”。如果确实如此，这会是一个非常小、风险很低的改动。

## Prompt:
10/5/2026, 6:55:49 PM

这是一次只读审查。我先核对 Project 数据模型、前端入口和各层查询是否都按项目隔离。

数据层已经能同时容纳多本独立小说。现在缺的是书架入口，以及归档、删除和“上次打开哪一本”的记住方式。不需要改表。

A. 当前已经支持 Multi-Project 的能力
Project 已经是一本小说的顶层容器。新建时会得到独立的 project 行、main 分支和第一卷。每本小说是一个独立的 SQLite 文件：

{数据目录}/projects/{project_id}/project.sqlite

Studio.engine_for(project_id) 只打开这一本的文件。人物、世界、大纲、章节、正文、影响、状态都写在这个文件里，查询不会连到另一本小说的库。

settings.sqlite 是机器级配置，不是小说正文库。里面有模型供应商、端点、agent 配置、发送授权，以及 chapter_index（chapter_id → project_id）。章节 URL 不带 project_id 时，先查这张表，再打开对应小说的库。

已有接口：

POST /projects、GET /projects、GET/PATCH /projects/{id}
GET /projects/{id}/tree、/library、/chapters、/characters、/world-entries、/outline
章节读写、生成、连续性、影响、Stage 2B 状态都先解析到该章所属的 project_id，再进该库
前端已有一份项目数组。侧栏底部和命令面板可以切换；项目首页有「再开一部」，会走现有的新建流程。切换时会清空当前章节稿、确认框和生成状态，再加载目标小说的 tree。

隔离已经落在现有查询上：

对象	范围
Story Outline
story_outline.project_id，且 (project_id, branch_id) 唯一。读写都带 project_id
Volume
volume.project_id
Chapter
chapter.project_id，读取条件是 id 且 project_id
Prose
prose_revision.project_id，经章节索引进入正确的库
Character / World
两表都有 project_id，列表按它过滤
Stage 2B State
主体表有 project_id + branch_id。read_confirmed_state 同时过滤二者，并要求来源章节同项目、同分支
Chapter Impact
行上有 project_id，写入发生在该项目的事务里
State Impact
行上有 project_id + branch_id，后续章节按同一分支查找
Continuity
摘要写在该项目库内，chapter_summary.project_id
Writer Pack
build_writer_pack(conn, project_id, chapter_id) 先 get_chapter(conn, project_id, chapter_id)。Stage 2B 块再按 chapter.branch_id 取 confirmed + fresh 状态
Send Manifest
确认条件是 id 且 project_id。用 A 的 project_id 确认 B 的清单会得到找不到
仓库里没有写死的 project id。

B. 当前缺失的能力
启动后不会进入「我的小说」。refreshProjects() 取 GET /projects 的第一项。目录名按 UUID7 排序，所以冷启动总是打开最早创建的那一本，不看最近编辑，也不记上次打开。

切换入口藏在当前小说侧栏底部和命令面板里。没有书架页，没有「AI Novel Studio / 我的小说 / 书名」这条路径。

已有能力没有对应界面：

重命名：PATCH /projects/{id} 可以改 title，界面上书名不可编辑
归档：project.status 已允许 active / archived，没有任何接口把它写成 archived，列表也不区分
删除：没有删除项目的接口，也不会清理 chapter_index 和项目目录
最近编辑：project.updated_at 和章节 updated_at 已在库里，书架没有使用
类型标签：没有「都市 · 异能」这种字段。第一版不必加，卡片用现有的书名、语言、状态和最近章节即可
进行中的生成没有代次保护。runGenerate 返回后会直接 setPayload、setDraft、setTree。若生成过程中切到另一本，响应仍会把编辑器和树画回发起那一本。写入本身仍进发起章节所在的库，不会把 A 的正文写进 B 的文件。

C. Project 隔离风险
跨小说读取：现有查询做不到。一次事务只连接一个 project.sqlite。把 B 的 project_id 和 A 的 chapter_id 交给检索预览时，get_chapter 在 B 的库里找不到该章，返回找不到。

chapter_index 是唯一跨文件索引。它只决定打开哪个库。索引若指错库，后续仍用该库的 project_id 查章节，对不上就 404，不会把另一本的行读出来。

界面上的串书风险是上面的在途生成响应。这是单页状态问题，不是数据库串书。

同一本小说内部、多分支时，有几处只按项目、不按分支：人物和世界列表、章节连续性摘要、Writer Pack 里的人物/世界/章节摘要，以及 Chapter Impact 的章节顺序。Stage 2B 状态块是按分支过滤的。新建小说只有 main 一个分支，这不会把小说 A 带进小说 B。Multi-Project V1 不必改这些查询。

模型配置、API key、agent 温度是全书架共用的。cloud_memory_opt_in 是每本小说自己的。

D. Multi-Project V1 最小实现方案
沿用现有 Project 模型和接口，不新增小说内容表，不引入 Job Queue。

增加书架页「我的小说」。数据用现有 GET /projects，每张卡片再读该书的 tree 或 chapters，显示书名、语言、最近章节和「继续创作」。
用 localStorage 记住上次打开的 project_id。冷启动回到这本书；没有记录时停在书架，而不是自动进入最老的一本。
进入一本之后，顶栏改为「我的小说 / 书名」，点击「我的小说」回到书架。大纲、卷、章节、正文、人物、世界、状态仍使用现在这套按 project_id 加载的页面。
书架上的重命名直接调用已有的 PATCH /projects/{id}。
生成、保存、大纲请求在发出时记下当时的 project_id。响应回来时若当前书已经换过，只丢掉这次界面更新，不取消已经写进正确库的结果。
归档：把已有 status 写成 archived，列表默认只显示 active。不改表。
删除：关掉该书的连接，删掉 projects/{id} 目录，并删掉该书在 chapter_index 里的行。不改表。
类型标签不进入这一版。

E. 是否需要 DB migration
不需要。多项目、分支、大纲、正文、人物、世界、影响和 Stage 2B 状态都已经按项目落在独立库里。归档用现有 status。最近编辑用现有时间戳。

F. 需要修改哪些文件
前端：

client/src/App.tsx：书架与工作台切换、记住上次打开的书、忽略过期生成响应
client/src/components/shell/StudioShell.tsx：面包屑
client/src/components/shell/SideNav.tsx：从侧栏底部列表改为回到书架
新增书架组件，例如 client/src/components/home/NovelShelf.tsx
client/src/lib/api.ts：仅当要补 updated_at 类型，或封装归档/删除
对应前端测试
只有归档和删除才动后端，而且只动这几处：

canon/projects.py
host/studio.py
host/routes.py
tests/test_create_project.py 或一条新的双项目隔离测试
如果书架不想对每本书再请求一次章节，可以让 GET /projects 附带最近章节标题和序号。这是现有表上的读查询，仍然不改表。

G. 哪些文件绝对不能修改
storage/migrations/**
Stage 2A：canon/outline_doc.py、canon/outline_flow.py、canon/impact.py、host/outline_routes.py、pipeline/outline_gen.py
Stage 2B：canon/state_store.py、pipeline/state_extract.py、host/state_routes.py、memory/pack.py
agents/writer.py、pipeline/chapter_flow.py、prose/revisions.py、prose/length.py
providers/**（Router、Manifest、Grok adapter）
Writer Prompt、场景写作说明、人物声音说明
这些层已经按打开的项目库工作。V1 不去改它们的数据结构或查询。

H. Multi-Task V2 与当前架构的关系
现在的 job / pipeline_run 在每本小说自己的库里，只给章节摘要用。Studio.start_job_loop 按项目目录逐个 drain_project，不是生成队列。正文和大纲生成仍是一次同步 HTTP 请求。

V2 以后才需要：生成任务记录、进度、重试、切走后继续跑、多本同时生成时的并发上限。任务记录可以继续放在各小说自己的库里，不必把小说合成一个库。V1 不要加这些。

I. 推荐实施顺序
书架、上次打开的书、面包屑、用现有接口打开和切换。
在途生成响应的代次保护，避免切书后界面被画回去。
书架重命名，走现有 PATCH。
归档和删除，只写现有 status 并删除目录与 chapter_index。
测试：两本小说的 tree、人物、大纲、Writer Pack 互不可见；书架打开的是被点中的那一本；刷新后仍是上次那一本。
到此停止。不接 AI Chat、Research、Writer Quality，也不接 Job Queue。

## Response:
10/5/2026, 6:55:52 PM · gpt-5-6

这份审查结果很好，而且它把一个关键事实确认清楚了：

> **你的软件底层其实已经支持多本小说。现在缺的主要是“小说管理层”，而不是重做数据库架构。**

所以这次我建议**可以正式进入 Multi-Project V1 实现**，而且 Cursor 给出的范围基本合理。

### 我建议做，但稍微调整一个地方

Cursor 的实施顺序：

1. 书架
2. 上次打开
3. 面包屑
4. 生成响应代次保护
5. 重命名
6. 归档/删除
7. 测试

我赞成。

但我建议把 **删除** 稍微谨慎一点。

因为删除：

> SQLite 文件 + chapter_index

属于真正的数据破坏操作。

第一版完全可以先做：

**新建 → 打开 → 切换 → 重命名 → 归档 → 恢复**

暂时不要做永久删除。

等以后明确需要删除，再加：

> 删除 → 二次确认 → 明确警告 → 删除

这样不会因为 UI 测试或者误操作把一本小说整个删掉。

---

## 现在的产品结构就会变得很清楚

以后用户打开软件：

```text
AI Novel Studio

我的小说

┌──────────────────────┐
│ 《旧城异能》          │
│ 第 2 章 · 正文       │
│ 最近编辑：今天       │
│                      │
│      继续创作        │
└──────────────────────┘

┌──────────────────────┐
│ 《星海纪元》          │
│ 大纲阶段              │
│ 最近编辑：昨天       │
│                      │
│      继续创作        │
└──────────────────────┘

┌──────────────────────┐
│ 《悬疑实验》          │
│ 第 8 章 · 正文       │
│ 最近编辑：9月30日     │
│                      │
│      继续创作        │
└──────────────────────┘

       ＋ 新建小说
```

进入之后：

```text
AI Novel Studio / 我的小说 / 《旧城异能》

Story
Volumes
Chapters
Characters
World
State
Writing
...
```

然后点击：

**我的小说**

就回到书架。

这才是真正意义上的“小说工作台”。

---

# 最值得修的是“在途生成”

Cursor 找到的这个问题我认为非常重要：

> A 小说正在生成 → 用户切换到 B → A 的生成响应回来 → UI 可能把 A 的正文重新画回来。

虽然**数据库不会串书**，但用户体验上会非常危险。

例如：

> 我现在正在写《星海纪元》，突然屏幕跳回《旧城异能》。

用户很容易以为软件把小说搞乱了。

所以：

```text
generation started
project = A
```

返回时：

```text
current project == A
    ↓
更新 UI

current project != A
    ↓
忽略 UI 更新
```

但**不能取消已经发出的请求**。

这样正好符合现在的架构。

---

# 关于“多本小说同时生成”

这次先不要做。

这是非常正确的。

现在：

```text
小说 A
   ↓
Grok
   ↓
同步等待
```

以后才做：

```text
Job Queue

A 第3章 → generating
B 第8章 → waiting
C 大纲   → completed
```

否则现在又会进入：

> Job → Queue → Progress → Retry → Concurrency → Cancellation → Provider timeout

这会把我们刚刚从 Stage 2B 解放出来的节奏重新拖回底层架构。

---

# 所以现在可以给 Cursor 一个“执行版”指令

你不用再把整个长上下文重新贴一次，因为**刚才那份审查结果已经非常完整**。

直接告诉 Cursor：

**document: Multi-Project V1 实施指令**

基于刚才完成的只读 Multi-Project 架构审查，现在开始实现 Multi-Project V1。

严格遵守以下范围。

## 目标

把当前 AI Novel Studio 从“默认围绕一本小说工作”升级为：

> 可以管理多本完全独立的小说，并方便切换。

现有 Project / project.sqlite 架构已经证明可以支持多个 Project，因此不要重新设计数据层。

---

# 一、必须实现

## 1. 我的小说 / Novel Shelf

启动软件后，不再默认打开 UUID7 最早创建的项目。

增加一个“我的小说”入口/页面。

显示现有 active projects。

每个小说卡片至少显示：

- 书名
- 语言
- 最近章节或当前进度
- 最近编辑时间
- 继续创作

提供：

- 新建小说
- 打开小说
- 切换小说

使用现有 GET /projects 和现有 Project API。

不要为了书架增加新的小说数据表。

---

## 2. 上次打开的小说

使用 localStorage 保存：

active_project_id

启动时：

### 如果存在有效的上次 project_id

打开这本小说。

### 如果没有有效记录

进入“我的小说”，不要自动打开最早创建的小说。

如果 localStorage 中的 project_id 已不存在或已经 archived：

进入书架。

---

## 3. 面包屑

工作台顶部显示：

AI Novel Studio / 我的小说 / 《当前小说》

点击：

“我的小说”

返回书架。

当前小说名称应该来自当前 project，而不是硬编码。

---

## 4. 切换小说

切换项目时：

- 更新 active project
- 清空当前章节编辑状态
- 清空确认框
- 清空生成状态
- 加载目标 project tree
- 加载目标 project 的当前页面数据

确保切换后不会残留上一部小说的编辑器状态。

---

# 二、必须修复：在途生成响应

这是本次审查发现的真实 UI 风险。

当前：

A 小说发起生成
→ 用户切换到 B
→ A 的生成响应回来
→ 可能 setPayload / setDraft / setTree
→ UI 被 A 的响应画回去

修复为：

每个生成请求发起时记录：

generation_project_id

必要时同时记录：

generation_chapter_id

响应返回时：

如果当前 active project/chapter 仍然匹配：

→ 更新 UI

如果已经切换到其他 project/chapter：

→ 忽略这次 UI 状态更新

但是：

### 不取消已经发出的模型请求。

后端仍然写入原本正确的 project/chapter 数据库。

这是 UI race protection，不是 Job Queue。

---

# 三、重命名

使用现有：

PATCH /projects/{id}

在书架上允许重命名。

保存成功后：

- 更新卡片
- 当前打开的小说如果正好是该项目，也更新顶部标题

不要增加数据库字段。

---

# 四、归档

Project 已经有：

status = active / archived

第一版实现：

- active 项目显示在默认书架
- archived 项目不显示在默认书架
- 如果当前项目被归档，应返回书架
- 可以提供“已归档”视图
- 可以恢复为 active

不增加 migration。

---

# 五、暂时不要实现永久删除

这次 V1 暂时不要实现真正删除项目目录。

原因：

删除 project.sqlite + chapter_index 属于不可逆数据操作。

先保留：

- 新建
- 打开
- 切换
- 重命名
- 归档
- 恢复

以后如果需要永久删除，再单独设计确认流程。

---

# 六、严格的小说隔离

必须保持：

Project A

不能读取：

Project B

的：

- Story Outline
- Volume
- Chapter
- Prose
- Character
- World
- Continuity
- Chapter Impact
- State
- State Impact
- Writer Pack
- Revision
- 未来 AI Conversation

不要修改现有底层隔离架构，因为审查已经确认 project.sqlite 本身提供了良好的隔离。

---

# 七、不要修改这些部分

本次 V1 禁止修改：

- storage/migrations/**
- Stage 2A
- Stage 2B
- canon/state_store.py
- pipeline/state_extract.py
- host/state_routes.py
- memory/pack.py
- agents/writer.py
- pipeline/chapter_flow.py
- prose/revisions.py
- prose/length.py
- providers/**
- ModelRouter
- Send Manifest
- Grok adapter
- Writer Prompt
- Scene Writing Instructions
- Character Voice Instructions

也不要引入：

- AI Chat
- Research Agent
- Writer Quality v0
- Job Queue
- Background generation
- Multi-model concurrency
- Vector DB
- 新的小说内容表

---

# 八、建议修改范围

优先修改：

- client/src/App.tsx
- client/src/components/shell/StudioShell.tsx
- client/src/components/shell/SideNav.tsx
- 新增 NovelShelf.tsx
- 必要的 client API / types
- 前端测试

如果归档需要后端：

只修改现有 Project 相关：

- canon/projects.py
- host/studio.py
- host/routes.py
- 对应测试

不要为了这个功能修改其他业务层。

---

# 九、测试必须覆盖

至少增加：

### Multi-project isolation

创建两个项目：

A
B

分别创建不同：

- character
- world
- outline
- chapter

确认：

打开 A：

不能看到 B 的内容。

打开 B：

不能看到 A 的内容。

---

### Project switching

A → B → A

确认：

- tree 正确
- chapter 正确
- draft 正确
- title 正确

---

### Last opened project

打开 B。

刷新/重新启动。

确认仍然进入 B。

localStorage 中 project_id 无效：

确认进入书架。

---

### Rename

A：

旧名字 → 新名字

确认：

- 书架更新
- 当前工作台标题更新
- 刷新后仍然正确

---

### Archive

A：

active → archived

确认：

- 默认书架隐藏
- 当前正在 A 时归档会返回书架
- archived 视图可以看到 A
- 恢复后重新出现在 active 书架

---

### Generation race

启动 A 的生成。

在响应回来之前切换到 B。

A 响应回来后：

- B 的 UI 不得被 A 的响应覆盖
- A 的数据库结果仍然写入 A
- B 的 tree/draft 不发生变化

不要为了测试这个而调用真实 Grok；如果现有测试架构支持 FakeProvider/mock，则使用测试替身。

---

# 十、完成后必须报告

请报告：

1. 修改了哪些文件
2. 为什么修改
3. 是否需要 migration
4. 是否修改 Stage 2A / Stage 2B
5. 是否修改 Writer / Provider / Router
6. 是否增加了永久删除
7. 测试结果
8. TypeScript 结果
9. 全量 pytest 结果
10. 是否存在未解决的 Multi-Project 隔离风险

如果发现必须扩大范围才能完成，请先停止，不要自行扩大实现范围。

最后：

不要提交 Git，先把修改留在工作区供我检查。

我建议就按这个版本做。**尤其把“永久删除”从第一版拿掉**，这样 Multi-Project V1 会非常干净。

完成后你把 Cursor 的结果贴给我，我们检查一次；如果通过，再提交这个独立 commit。然后就可以真正进入我们之前计划的 **Writer Quality v0**。

## Prompt:
10/5/2026, 7:13:17 PM

按审查结论做 Multi-Project V1：书架、记住上次打开的小说、面包屑、切换、在途生成保护和归档。先核对现有 Project 接口和前端入口，再只改允许范围内的文件。

隔离已经在各自的 project.sqlite 里。接下来只加书架、记住上次打开的小说、归档，以及生成响应的界面保护。

Multi-Project V1 已留在工作区，没有提交 Git。启动后会进入上次打开的小说；没有有效记录时进入「我的小说」，不再自动打开最早创建的那一本。

1. 修改了哪些文件
client/src/lib/projectSession.ts（新增）
client/src/components/home/NovelShelf.tsx（新增）
client/src/App.tsx
client/src/components/shell/StudioShell.tsx
client/src/components/shell/SideNav.tsx
client/src/components/home/ProjectHome.tsx
client/src/lib/api.ts
canon/projects.py
host/routes.py
client/projectSession.test.ts（新增）
tests/test_multi_project.py（新增）
2. 为什么修改
书架用现有 GET /projects 和 GET /projects/{id}/chapters。每张卡片显示书名、语言、最近章节、最近编辑时间，以及继续创作、新建、打开、重命名、归档和恢复。localStorage 的键是 active_project_id。有效且未归档时打开那一本；没有记录、记录失效或已经归档时进入书架。

工作台顶栏是 AI Novel Studio / 我的小说 / 《当前书名》。书名来自当前 project。点击「我的小说」回到书架。

切换时写入新的 active project，清空章节稿、确认框和生成状态，再加载目标 tree。生成请求记下当时的 project 和 chapter。响应回来时，只有当前仍是同一本、同一章才更新界面。已经发出的请求不取消，写入仍进原来的库。重命名走现有 PATCH /projects/{id}，书架和已打开的标题一起更新。归档和恢复只改现有 status。

3. 是否需要 migration
不需要。

4. 是否修改 Stage 2A / Stage 2B
没有。

5. 是否修改 Writer / Provider / Router
没有。

6. 是否增加了永久删除
没有。没有删除项目目录，也没有清理 chapter_index。

7. 测试结果
前端 node --experimental-strip-types --test *.test.ts：17 通过，0 失败。覆盖上次打开的小说、无效或已归档 id 进入书架、切换时清空编辑状态、迟到的生成响应不覆盖当前小说、重命名、归档后默认书架隐藏、归档当前小说回到书架、已归档视图和恢复。

tests/test_multi_project.py：5 通过。两本小说的人物、世界、大纲、章节和 Writer 预览互不可见；改名只影响被改的那一本；归档与恢复写在现有 status 上；FakeProvider 生成只写入发起的那一本，另一本的章节和 tree 不变。

8. TypeScript 结果
tsc -b 通过，退出码 0。

9. 全量 pytest 结果
141 通过，0 失败。原先 136 条之外，新增 5 条多项目测试。

10. 是否存在未解决的 Multi-Project 隔离风险
跨小说内容没有新的隔离缺口。每本小说仍是独立的 project.sqlite，这次没有改 Writer Pack、State 或 Impact 的查询。测试确认 A 的人物、世界、大纲、章节和检索预览不会出现在 B。模型配置仍是这台机器共用的，里面没有小说正文。同一本小说里的多分支过滤和这次改动无关，当前新建的小说仍然只有 main。

## Response:
10/5/2026, 7:13:20 PM · gpt-5-6

这个结果可以接受，而且我认为 **Multi-Project V1 已经达到可以验收的程度**。

这次实现非常干净，尤其是没有碰 Stage 2A/2B 和 Writer 层，这一点很重要。

### 验收结果

| 功能 | 结果 |
|---|---|
| 多本小说同时存在 | ✅ |
| 独立 `project.sqlite` | ✅ |
| 我的小说书架 | ✅ |
| 新建小说 | ✅ |
| 打开/切换小说 | ✅ |
| 记住上次打开 | ✅ |
| 无有效记录进入书架 | ✅ |
| 面包屑 | ✅ |
| 重命名 | ✅ |
| 归档 | ✅ |
| 恢复 | ✅ |
| 永久删除 | ❌ 有意暂不实现 |
| 切书清理编辑状态 | ✅ |
| 生成请求防止串 UI | ✅ |
| A/B 小说数据隔离 | ✅ |
| Writer Pack 隔离 | ✅ |
| Stage 2A | 未修改 ✅ |
| Stage 2B | 未修改 ✅ |
| Writer/Provider/Router | 未修改 ✅ |
| TypeScript | PASS |
| 前端测试 | **17 PASS** |
| 全量 pytest | **141 PASS** |

尤其是这个测试非常关键：

> **FakeProvider 生成只写入发起的那一本，另一本的章节和 tree 不变。**

它实际上验证了我们最担心的 Multi-Project 数据边界。

---

## 我建议现在做一件事：提交这个版本

因为现在工作区形成了一个非常清晰的功能单元：

> **Multi-Project V1**

建议 Cursor **只提交这次改动，不要顺便修别的东西**。

Commit message 可以：

```text
Add multi-project novel shelf
```

或者：

```text
Add Multi-Project V1 novel shelf
```

提交前再确认：

```text
git status
```

确保没有混入：

- Writer Quality
- Stage 2B
- 其他实验
- `ai_novel_studio.egg-info/`

---

# 然后我们的路线会变得非常清楚

现在底层已经有：

```text
Multi-Project
      ↓
Story Architecture
      ↓
Volume
      ↓
Chapter
      ↓
Chapter Outline
      ↓
Scene Sketch
      ↓
Writer Pack
      ↓
Character / World / State
      ↓
Prose
      ↓
Continuity
      ↓
Revision / Impact
```

而且现在**真正可以同时拥有多本小说**了。

下一步我不建议再继续往 Project 管理上加东西。

---

# 下一阶段：Writer Quality v0

这是目前最值得解决的问题。

因为我们已经看到真实生成结果：

> **架构已经越来越像一个真正的小说系统，但写出来的正文还明显有 AI 味。**

所以接下来应该停止“底层架构加功能”，开始解决：

**“到底能不能写出好小说？”**

而且这次不要大改。

只做：

### Writer Prompt

↓

### Scene Writing Instructions

↓

### Character Voice

↓

### Prose Generation

然后进行严格 A/B：

**A：当前 Writer**

vs

**B：改进后的 Writer**

完全相同：

- Grok 4.7
- Story Outline
- Volume Outline
- Chapter Outline
- Scene Sketch
- Character
- World
- State
- 字数要求
- Writer Pack

**唯一变量就是 Writer 指令。**

这样我们才能真正知道：

> 是模型本身的问题，还是我们的 Writer Prompt 把 Grok 写僵了。

---

### 还有一个好消息

这次 Multi-Project V1 完成以后，Writer Quality 测试就可以更真实了。

我们甚至可以：

**小说 A：Writer v0**

**小说 B：Writer v1**

使用完全相同的创作素材，然后直接比较两本小说的生成效果。

这样非常适合做质量 A/B 测试。

所以我建议：

**现在先提交 Multi-Project V1 → 然后正式进入 Writer Quality v0。**

暂时不要再添加新的数据库架构。

## Prompt:
10/5/2026, 7:14:05 PM

我需要怎么做

## Response:
10/5/2026, 7:14:08 PM · gpt-5-6

你现在主要做 **3 步** 就可以了，不需要自己改代码。

### 第一步：让 Cursor 提交 Multi-Project V1

把下面这段直接复制给 Cursor：

**chat_message: 提交 Multi-Project V1**

Multi-Project V1 的实现和测试结果已经通过验收。

现在只做 Git 提交，不要修改任何代码，不要继续开发新功能。

请先运行：

git status

确认本次工作区只有 Multi-Project V1 相关改动，没有混入其他实验性修改或 ai_novel_studio.egg-info/。

然后查看本次 diff，确认包含：

- Novel Shelf
- active_project_id / 上次打开小说
- 面包屑
- Project 切换
- 在途生成响应保护
- Project 重命名
- Project 归档/恢复
- Multi-Project 测试

确认无误后提交：

git add client/src/lib/projectSession.ts client/src/components/home/NovelShelf.tsx client/src/App.tsx client/src/components/shell/StudioShell.tsx client/src/components/shell/SideNav.tsx client/src/components/home/ProjectHome.tsx client/src/lib/api.ts canon/projects.py host/routes.py client/projectSession.test.ts tests/test_multi_project.py

git commit -m "Add Multi-Project V1 novel shelf"

然后运行：

git status
git log -1 --oneline

最后告诉我：

1. commit hash
2. commit message
3. git status 是否干净
4. 是否有任何文件没有提交

不要 push，不要修改其他文件。

---

### 第二步：把 Cursor 的结果发给我

它完成后，把 Cursor 的回复直接复制给我。

我帮你确认：

- commit 是否干净
- 有没有误提交其他东西
- 是否真的只包含 Multi-Project V1
- 有没有遗漏

**确认没问题以后再 push。**

---

### 第三步：然后进入 Writer Quality v0

这一步才是接下来真正重要的。

我们暂时不要再修改：

- Stage 2A
- Stage 2B
- 数据库
- State
- Impact
- Writer Pack
- Provider
- Router

而是开始解决你之前发现的核心问题：

> **“目前生成的小说太僵硬了。”**

我们会先让 Cursor **只读找出当前 Writer Prompt 的实际内容**。

也就是说，下一步不是让它修改，而是先让它把现在到底给 Grok 发送了什么指令完整找出来。

你下一步可以直接告诉我：

> **“现在开始 Writer Quality v0。”**

我会给你一段专门给 Cursor 的**只读分析指令**，让它把当前 Writer Prompt、Scene Instructions、Character/World 注入方式、Length Policy 等全部找出来，然后我们再针对性修改。

**所以你现在先做第一步：让 Cursor 提交 Multi-Project V1。**

## Prompt:
10/5/2026, 7:19:39 PM

先核对工作区状态和这次 diff，确认只有 Multi-Project V1 的改动后再按你给的文件列表提交。

ProjectHome.tsx 里混进了上一轮篇幅设置的一行。我先核对它和当前已提交的组件是否对得上，避免把无关改动带进这次提交。

提交已完成，没有 push。

commit hash： 4cc61d454e01fa979a6129b6fb57c089509f83bf
commit message： Add Multi-Project V1 novel shelf
git status 不干净。 分支 cursor/outline-generate-toast-afb4 比远端超前 1 个提交。
这些文件没有进入这次提交：
client/src/components/MarkdownEditor.tsx
client/src/components/editor/ChapterEditor.tsx
client/src/components/editor/LengthDisclosure.tsx
client/proseEditor.test.ts
ai_novel_studio.egg-info/
client/src/components/home/ProjectHome.tsx 里仍有一行未暂存的 variant="project"
工作区里除了 Multi-Project V1，还有上一轮正文篇幅和复制粘贴的改动，以及 ai_novel_studio.egg-info/。这次只提交了你列出的 11 个文件。ProjectHome.tsx 的归档按钮已经进提交；variant="project" 留在工作区，因为它属于上一轮篇幅设置，而当前已提交的 LengthDisclosure 还没有这个参数。

## Response:
10/5/2026, 7:19:49 PM · gpt-5-6

很好，这个结果说明 **Git 操作是干净的**，而且 Cursor 做对了一件很重要的事：发现 `ProjectHome.tsx` 里混入了上一轮篇幅设置的改动后，没有把它错误提交进去。

### 现在的状态

你的 Multi-Project V1 已经形成独立 commit：

```text
4cc61d454e01fa979a6129b6fb57c089509f83bf
Add Multi-Project V1 novel shelf
```

并且：

- ✅ Multi-Project V1 已提交
- ✅ 没有 push
- ✅ 没有把上一轮复制粘贴/篇幅修改混进去
- ✅ 没有把 `ai_novel_studio.egg-info/` 提进去
- ⚠️ 工作区还有上一轮的前端改动
- ⚠️ `ProjectHome.tsx` 的 `variant="project"` 仍未提交

这个状态**不要急着清理**。

---

## 现在先不要 Push

我建议现在先把这两个功能的状态分清楚：

### 已提交

**Multi-Project V1**

```text
4cc61d4
```

### 尚未提交

上一轮：

**正文复制/粘贴 + 本章篇幅设置**

包括：

```text
MarkdownEditor.tsx
ChapterEditor.tsx
LengthDisclosure.tsx
ProjectHome.tsx
proseEditor.test.ts
```

以及：

```text
ai_novel_studio.egg-info/
```

这其实是一个很好的状态。

因为现在 Git 历史非常清楚：

```text
旧版本
  ↓
正文复制/篇幅修改（工作区）
  ↓
Multi-Project V1
  ↓
4cc61d4  ← 已提交
  ↓
Writer Quality v0
```

---

# 现在你应该做什么？

我建议先**把上一轮“复制粘贴 + 篇幅设置”单独提交**。

但在提交之前，我们要确认 `ProjectHome.tsx` 那一行确实属于上一轮功能。

你不用自己判断。

把下面这段给 Cursor：

**chat_message: 确认并提交上一轮前端改动**

现在不要开发新功能。

请处理当前工作区中尚未提交的上一轮功能：

“正文复制/粘贴恢复 + 本章篇幅设置”。

当前 Multi-Project V1 已经独立提交：

4cc61d454e01fa979a6129b6fb57c089509f83bf
Add Multi-Project V1 novel shelf

不要修改这个 commit。

请先只读检查当前未提交 diff：

git status
git diff -- client/src/components/MarkdownEditor.tsx
git diff -- client/src/components/editor/ChapterEditor.tsx
git diff -- client/src/components/editor/LengthDisclosure.tsx
git diff -- client/src/components/home/ProjectHome.tsx
git diff -- client/proseEditor.test.ts

确认这些未提交改动是否全部属于：

1. 正文系统右键复制/粘贴恢复
2. 本章目标/最少/最多篇幅设置
3. ProjectHome 中全书默认篇幅设置

特别确认：

client/src/components/home/ProjectHome.tsx 中未提交的：

variant="project"

是否属于上一轮篇幅设置，而不是 Multi-Project V1。

如果确认属于上一轮功能：

- 保留它
- 不要回退
- 不要修改功能
- 将以下上一轮相关文件一起提交：

client/src/components/MarkdownEditor.tsx
client/src/components/editor/ChapterEditor.tsx
client/src/components/editor/LengthDisclosure.tsx
client/src/components/home/ProjectHome.tsx
client/proseEditor.test.ts

不要提交：

ai_novel_studio.egg-info/

也不要提交任何其他无关文件。

提交前运行：

node --experimental-strip-types --test *.test.ts
npx tsc -b
pytest -q

如果全部通过，再提交：

git add client/src/components/MarkdownEditor.tsx client/src/components/editor/ChapterEditor.tsx client/src/components/editor/LengthDisclosure.tsx client/src/components/home/ProjectHome.tsx client/proseEditor.test.ts

git commit -m "Improve prose editing and length controls"

提交后运行：

git status
git log -2 --oneline

不要 push。

最后告诉我：

1. 未提交 diff 是否全部属于上一轮功能
2. 测试结果
3. 新 commit hash
4. git status 状态
5. 是否仍然存在未提交文件

不要修改 Multi-Project V1 commit。
不要开始 Writer Quality。

---

## 为什么现在要这样做？

因为我们现在最好把 Git 历史整理成：

```text
4cc61d4  Add Multi-Project V1 novel shelf
    ↓
XXXXXXX  Improve prose editing and length controls
```

两个 commit 各自只有一个明确目的。

以后如果 Writer Quality v0 出现问题，你可以非常容易地回退，而不会把：

- 多小说
- 复制粘贴
- 篇幅控制
- Writer Prompt

全部搅在一起。

---

### `ai_novel_studio.egg-info/` 怎么办？

**现在先不用管它。**

不要提交，也不要为了它做额外改动。

等整个开发阶段稳定下来，再决定把它加入 `.gitignore`。

---

所以你现在只需要：

**让 Cursor 执行上面这一步 → 把 Cursor 返回结果发给我。**

确认第二个 commit 也干净以后，我们就可以真正开始 **Writer Quality v0**。

## Prompt:
10/5/2026, 7:22:35 PM

先只读核对未提交 diff，确认它们都属于上一轮正文编辑和篇幅设置，再跑测试并单独提交。

未提交改动都属上一轮：恢复系统右键复制粘贴，以及本章和全书默认篇幅。variant="project" 是全书默认篇幅的标记，不是 Multi-Project。开始跑测试。

未提交 diff 全部属于上一轮功能，已经单独提交。Multi-Project V1 的 commit 4cc61d454e01fa979a6129b6fb57c089509f83bf 没有改动。

未提交 diff 是否全部属于上一轮功能
是。MarkdownEditor 去掉了右键 preventDefault，正文恢复系统复制/粘贴。ChapterEditor 不再打开自定义右键菜单，并始终显示「正文篇幅」。LengthDisclosure 展示目标、最少、最多和当前字数，并区分本章设置与继承。ProjectHome.tsx 里未提交的 variant="project" 属于全书默认篇幅，用来把项目值标成「全书默认」，不是 Multi-Project V1。proseEditor.test.ts 覆盖的也是这三项。

测试结果

node --experimental-strip-types --test *.test.ts：17 通过
npx tsc -b：通过
pytest -q：141 通过
新 commit hash
18e0227cb1fe418c5caaf1242dd59459ae4d2229
message：Improve prose editing and length controls

git status
分支 cursor/outline-generate-toast-afb4 比远端超前 2 个提交。最近两条是：
18e0227 Improve prose editing and length controls
4cc61d4 Add Multi-Project V1 novel shelf

是否仍然存在未提交文件
有。只剩未跟踪的 ai_novel_studio.egg-info/，没有提交。没有 push。

## Response:
10/5/2026, 7:22:38 PM · gpt-5-6

很好，这次提交状态是**干净且符合预期的**。

目前两个独立功能已经正确拆成两个 commit：

1. `4cc61d4` — **Add Multi-Project V1 novel shelf**
2. `18e0227` — **Improve prose editing and length controls**

并且：
- 前端测试：**17 passed**
- TypeScript：**通过**
- 后端 pytest：**141 passed**
- 两个 commit 都没有 push
- `ai_novel_studio.egg-info/` 只是未跟踪文件，没有混入 commit
- Multi-Project V1 没有被第二次提交污染

### 现在不要继续修改代码

我建议下一步先把这两个 commit 一次性 push 到远端，然后再开始 **Writer Quality v0**。

Push 之前可以让 Cursor 做最后一次只读核对：

**chat_message: Push 前最终核对**

现在先不要修改任何代码。

请只读执行以下检查：

1. `git status --short`
2. `git log --oneline -3`
3. `git diff origin/cursor/outline-generate-toast-afb4..HEAD --stat`
4. 确认 HEAD 包含且仅包含最近两个功能提交：
   - `4cc61d4 Add Multi-Project V1 novel shelf`
   - `18e0227 Improve prose editing and length controls`
5. 确认这两个 commit 都已经通过：
   - frontend tests
   - `npx tsc -b`
   - `pytest -q`
6. 确认 `ai_novel_studio.egg-info/` 没有被提交。
7. 不修改文件，不创建新 commit，不 push。

最后只告诉我：
- 当前 HEAD
- 相对远端 ahead 几个 commit
- 两个 commit 是否都在
- 是否可以安全 push

如果它确认无误，我们再执行 push。

**Push 完以后，就正式把注意力转回最初的核心目标：让 AI 真正写出自然、像小说而不是“AI生成的小说”的正文。** 下一阶段我建议直接进入我们之前确定的 **Writer Quality v0**，不再继续扩展 Stage 2B 架构。

## Prompt:
10/5/2026, 7:24:46 PM

只做只读核对，不改文件、不提交、不 push。

当前 HEAD： 18e0227cb1fe418c5caaf1242dd59459ae4d2229（Improve prose editing and length controls）
相对远端： origin/cursor/outline-generate-toast-afb4 超前 2 个 commit，没有落后。
两个 commit 都在： 4cc61d4 Add Multi-Project V1 novel shelf，然后是 18e0227 Improve prose editing and length controls。相对远端的 diff 只有这两个提交里的 15 个文件。
可以安全 push。 这两个提交里没有 ai_novel_studio.egg-info/。它仍只是未跟踪目录，push 不会带上它。当前 HEAD 在提交前已通过前端测试 17 项、npx tsc -b 和 pytest 141 项。没有改文件，没有新 commit，没有 push。

## Response:
10/5/2026, 7:24:50 PM · gpt-5-6

确认，**现在可以安全 push**。

当前状态完全符合我们的预期：

- `HEAD`: `18e0227`
- 相对远端：**ahead 2**
- 两个目标 commit 均完整存在
- 相对远端只有这两个 commit 的 **15 个文件**
- `ai_novel_studio.egg-info/` 未被提交
- 测试：**17 passed**
- TypeScript：**通过**
- pytest：**141 passed**
- 没有额外修改
- 没有新 commit
- 尚未 push

### 下一步

现在只需要执行：

```bash
git push origin HEAD
```

或者直接让 Cursor 执行也可以。

**Push 完后先不要开始写 Writer Quality 代码。** 我建议下一步先做一次**只读审查**，把当前真正用于生成正文的：

- Writer System Prompt
- Writer User Prompt
- Scene Writing Instructions
- Character Voice Instructions
- Writer Pack → Prompt 的组装方式
- Length Policy
- Grok 模型参数
- 当前章节生成流程

完整找出来。

这样我们可以在**不猜测、不动 Stage 2A/2B 架构**的情况下，针对你已经发现的“正文太僵硬”问题做 Writer Quality v0。

## Prompt:
10/5/2026, 7:26:25 PM

按上次核对的结果，把当前分支的这两个提交推到远端，不加入未跟踪文件。

已推送到 origin/cursor/outline-generate-toast-afb4。

范围：9047aa0..18e0227
HEAD：18e0227cb1fe418c5caaf1242dd59459ae4d2229
包含的两个提交：4cc61d4 Add Multi-Project V1 novel shelf、18e0227 Improve prose editing and length controls
本地分支已与远端一致
ai_novel_studio.egg-info/ 仍是未跟踪目录，没有推送

## Response:
10/5/2026, 7:26:27 PM · gpt-5-6

很好，当前这一步已经完成。

现在远端已经包含：

- `4cc61d4` — Multi-Project V1
- `18e0227` — 正文复制/粘贴 + 篇幅设置
- 远端与本地 `HEAD` 已一致
- `ai_novel_studio.egg-info/` 仍未跟踪，没有进入 Git

**到这里先冻结这些功能，不再修改。**

下一步正式进入我们之前确定的 **Writer Quality v0**。

但第一步仍然只做**只读核对**：先把当前实际的正文生成链路和 Prompt 找出来。重点不是改代码，而是回答一个核心问题：

> **现在的 Grok 到底收到了什么指令，为什么会写出“很像 AI 写的小说”的正文？**

我们需要让 Cursor 找出实际使用的 System Prompt、User Prompt、Scene Writing Instructions、Character Voice、Length Policy、Writer Pack 组装以及模型参数。

我建议现在直接给 Cursor 这个只读任务：

**chat_message: Writer Quality v0：只读审查当前正文生成链路**

现在开始 Writer Quality v0，但本轮严格只读。

不要修改任何文件。
不要提交。
不要 push。
不要新增功能。
不要修改 Stage 2A / Stage 2B。
不要修改 DB、migration、state、impact、revision、provider、router、Writer Pack 数据结构。

目标只有一个：

完整找出当前“正文生成”实际使用的 Prompt 和生成链路，为下一步改善小说质量做基线。

请从代码实际调用关系出发，不要根据记忆或推测。

重点审查：

1. 正文生成入口
- 当前章节点击生成正文后，从前端到后端经过哪些函数。
- 最终调用哪个 writer/prose generation 函数。
- 标出关键文件和函数名。

2. Writer System Prompt
找到当前实际发送给 Grok 的 system message。
完整读取并原样摘录当前 Prompt。
如果 Prompt 是多个字符串拼接，请还原最终结构，并说明各部分来源。

3. Writer User Prompt
找到当前实际发送给 Grok 的 user message。
完整读取。
说明 Writer Pack 中哪些内容最终进入 user prompt，以及进入顺序。

4. Scene Writing Instructions
检查当前是否存在：
- scene writing instructions
- scene sketch writing rules
- POV instructions
- dialogue instructions
- pacing instructions
- emotional movement instructions
- sensory/detail instructions

如果存在，请指出具体文件、函数和实际文本。
如果不存在，明确写“当前没有独立的 Scene Writing Instructions”。

5. Character Voice
检查当前是否存在真正的 character voice 指令。
重点判断：
- 是否只有 personality/traits
- 是否包含说话方式
- 是否包含句式习惯
- 是否包含行为习惯
- 是否包含角色之间不同的语言风格

不要提出修改，只报告当前实际情况。

6. Length Policy
找出：
- target length
- minimum length
- maximum length
- strict mode
- length repair
- repair prompt

说明它们在正文生成流程中的具体位置。
特别确认“长度控制”是否可能导致机械重复或无意义填充。

7. Model / Generation Parameters
找出当前真实 Grok 调用使用的：
- provider
- model
- temperature（如果有）
- top_p（如果有）
- max_tokens / max_output_tokens（如果有）
- reasoning_effort（如果有）
- 其他影响写作风格的参数

不要修改参数。

8. Writer Pack
只读分析当前 Writer Pack 最终进入正文生成时的结构。
重点列出：
- prohibitions
- user_requirements
- story_outline
- volume_outline
- chapter_outline
- scene_sketch
- Stage 2B state
- chapter_summary
- character
- world_entry
- length_policy

确认实际顺序。
不要修改 Writer Pack。

9. 当前正文生成的完整数据流
用简洁流程表示：

用户点击生成
→ ...
→ Writer Pack
→ Prompt assembly
→ Grok
→ prose validation
→ length repair（如果触发）
→ prose revision

10. 基于当前代码，找出最可能导致“正文僵硬”的 Prompt 层原因

这里只做诊断，不改代码。

重点检查是否存在类似：
- 过度要求“完整解释”
- 过度要求推进剧情
- 过度要求每个场景都有明确结果
- 过度强调信息覆盖
- 对话缺少自然语言要求
- 情绪被要求直接表达
- 场景缺少停顿和生活细节
- 人物声音没有独立约束
- 每段都被要求服务剧情
- 结尾被要求强行形成“钩子”
- 叙述过度总结
- 重复使用固定意象
- Prompt 本身具有模板化语言

如果发现这些，只指出具体证据和文件位置。

11. 最后输出一个“Writer Quality v0 Baseline”
包括：

A. 当前 Writer 的实际 Prompt 结构
B. 当前输入上下文
C. 当前模型参数
D. 当前长度控制
E. 当前 Character Voice 能力
F. 当前 Scene Writing 能力
G. 当前最值得优先修改的 3–5 个问题

再次强调：

本轮只读。
不要修改任何文件。
不要 commit。
不要 push。
不要开始 Writer Quality v0 实现。

最终给我完整审查结果，并列出涉及的文件路径和函数名。

## Prompt:
10/5/2026, 7:29:50 PM

本轮只读。我从生成按钮的实际调用往下追，把发给模型的 prompt、参数和篇幅修复都从代码里原样核对。

当前正文生成没有独立的写作指令。系统提示只有三句情节约束，场景只以「目的」进入模型，人物说话方式、视角和篇幅修复都没有按小说质量来约束。

1. 正文生成入口
真实生成按钮在 ChapterEditor，点击「生成」调用 onGenerate(false)。

ChapterEditor.tsx
Ln 119–120

<Button disabled={busy} onClick={() => onGenerate(false)}>
  生成
调用链：

App.runGenerate(false) 先按需保存正文，再 api.generate。
api.generate 发送 POST /chapters/{id}/generate，allow_fake: false。
host/routes.py 的 post_generate 调用 pipeline/chapter_flow.py 的 generate。
generate 经 project_id_for_chapter、require_generation_lineage、_require_upstream 之后，调用 agents/writer.py 的 draft。
draft 调用 ModelRouter.complete(agent_name="writer")。
云端第一次没有已确认 manifest 时，complete 在打开连接前抛出 SEND_NOT_CONFIRMED。
App.confirmAndSend 调用 POST /model-calls/confirm，再用同一个 manifest_id 第二次 runGenerate(false, manifestId)。
第二次才进入 GrokAdapter.complete，地址是 {base_url}/chat/completions。
最终写正文的函数是 agents.writer.draft。篇幅不合时，chapter_flow._repair_length 再调用 agents.writer.repair，最多两轮。保存函数是 prose.revisions.save_writer_prose。

2. Writer System Prompt
系统消息只有一条，来自 agents/writer.py 的 INSTRUCTIONS。没有任何篇幅字段时，原文就是：

你是小说正文作者。主要情节以已确认的章节大纲为准，并承接上游连续性摘要。不要索取其他章节的全文，也不要另起一条主线。只输出正文内容：body_md 和 writer_notes。不要填写项目、章节、修订或大纲标识，那些由服务器写入。

目标、最少、最多、严格里只要有一项不是空，draft 会把它改成 INSTRUCTIONS + 换行 + length_requirement(policy)。篇幅句子来自 prose/length.py 的 length_requirement，顺序固定：

计数不含空白。
有目标时：目标是 {target}。这是希望接近的篇幅，不是截断线，也不单独触发检查。
最少和最多都有：允许范围是最少 {minimum}、最多 {maximum}。
只有最少：允许范围只有最少 {minimum}。
只有最多：允许范围只有最多 {maximum}。
永远加上：不要截断正文。
三项里有缺的：没有给出的篇幅不要自行补默认数字。
严格有值时：length_strict={strict}。
同一段篇幅文字还会作为 user 消息里的 length_policy 块再出现一次。chapter.goal、视角、metadata 都不进入系统消息。

3. Writer User Prompt

user 消息由 writer._render 生成。每个块是：

[{kind} id={id}]
{text}
块与块之间空一行。这些块就是 memory.pack.build_writer_pack 的返回值，不含系统指令。系统指令只出现在 system message 里；它会另外放进发送清单，但不会再写进 user 消息。

进入 user 消息的内容，按代码顺序：

prohibitions：总大纲禁令加本章大纲禁令，有才出现。
user_requirements：总大纲要求，有才出现。
story_outline：_story_slice 的固定开头是「已确认总大纲中与这一章有关的部分」，然后是要求、当前卷的标题和目标、当前章的标题和目标。
volume_outline：已确认卷大纲的 markdown 原文。
chapter_outline：已确认章大纲的 markdown 原文。
scene_sketch：有场景才出现，每行是 {order}. {purpose}。
Stage 2B，仅 confirmed、fresh、同项目、同分支；没有状态时整段省略。内部顺序是 chapter_time（最多 2）、plot_thread（setup/active，最多 8）、character_state（最多 8）、world_state（最多 6）、relationship（最多 8）。每条正文是状态 markdown，再加「来源章节」和「来源正文」。
chapter_summary：更早章节。最近 3 章用完整 summary_md，再早的只用一行事件。其他章全文不进入。
character：本书已接受人物，每人一块。
world_entry：本书已接受世界材料，每条一块。
length_policy：与系统消息里追加的篇幅句子相同；四项全空则没有这块。
4. Scene Writing Instructions
当前没有独立的 Scene Writing Instructions。

仓库里不存在场景写作规则、对话规则、节奏规则、情绪推进规则或感官细节规则。唯一的场景材料是 memory.pack._outline_blocks 里的 scene_sketch，文本只有「序号. 目的」。

视角存在于章节字段 chapter.pov，界面在 AssistantRail 里可改，但 draft 和 build_writer_pack 都不读取它。

5. Character Voice
当前没有进入正文生成的 character voice 指令。

Writer Pack 的人物文本由 memory.pack._character_text 拼出，只有：

名字
role
summary
personality
goals
说话方式、句式习惯、行为习惯、角色之间不同的语言风格，都没有写进这条正文 prompt。数据库里有 speech_markers，人物面板也有「说话特点」，但只有 pipeline/outline_gen.py 的 _character_text 会把它写成「说话特点：…」。那是大纲规划用的，不是 Writer。外貌、恐惧、能力、认知限制、档案同样只进大纲规划，不进正文 pack。

6. Length Policy
继承函数是 prose.length.inherit_length(project, volume, chapter)。后面的一层覆盖前面的一层，所以本章优先于卷，卷优先于项目。draft 和 build_writer_pack 都用这个结果。

项	位置
目标
只写进 prompt。needs_length_repair 明确规定单独的目标不启动修复。
最少 / 最多
写进 prompt。生成后用非空白字数检查。越界才修复。
length_strict
prompt 里原样写成 length_strict=0 或 1。1 只把事后检查标成 block，0 标成 warn。两种都不阻止保存。
修复
chapter_flow._repair_length。allow_fake 为真时跳过。真实生成最多 MAX_LENGTH_REPAIR_ROUNDS = 2。
修复 prompt
agents.writer.repair。偏短用 REPAIR_UNDER，偏长用 REPAIR_OVER，再附上同一段篇幅句子。
偏短原文：

上一稿短于允许的最少字数。请重写为一篇落在允许范围内的正文。不要重复句子，不要用无意义的垫字或复制段落凑字数。保留已有情节、人物、事实和连续性。只输出 JSON，正文放在 body_md。

偏长原文：

上一稿超过允许的最多字数。请重写为一篇收进允许范围的正文。不要只砍掉结尾。保留已有情节、人物、事实和连续性。只输出 JSON，正文放在 body_md。

修复的 user 消息只有上一稿正文，不再附带大纲、人物、世界或 Stage 2B。代码只比较非空白字数是否更接近范围，不检查重复或填充。四项全空时不发送篇幅句子，也不修复。

因此：修复文案禁止垫字和重复，但成功条件只有字数。偏短时模型要写长，上下文又只剩上一稿，这个结构可以让它用复述来补长度。代码没有再拦住这种结果。

7. Model / Generation Parameters
本机 settings.sqlite 里，writer 绑定的端点是已启用的 Grok，只读到这些非密钥字段：

provider：grok
model：grok-4.7
base URL：https://api.x.ai/v1
temperature：0.7，来自 agent_model_config，draft 没有覆盖
max_tokens：4096，来自 writer 的 max_output_tokens
reasoning_effort：low，写死在 draft 和 repair
timeout：180 秒
top_p：没有。GrokAdapter.complete 的请求体里没有这个字段
另外固定发送 response_format.json_schema，名称 ProseDraft，必填 body_md，可选 writer_notes
metadata 不发给 Grok
仓库种子里的默认模型名是 grok-4。当前这次选择用的是设置库里的 grok-4.7，因为 writer 的 model_endpoint_id 指向这个已启用端点。

8. Writer Pack
实际顺序就是第 3 节那 11 步。空的禁令、要求、场景和 Stage 2B 会整段省掉，其余顺序不变。length_policy 永远在最后。

9. 当前正文生成的完整数据流
用户点击「生成」
→ runGenerate 保存未落盘正文
→ POST /chapters/{id}/generate
→ 无确认清单时返回 SEND_NOT_CONFIRMED，不调用模型
→ 用户确认
→ 第二次 generate
→ 确认总大纲、卷大纲、章大纲，并补齐上游连续性摘要
→ build_writer_pack
→ draft 组装 system 与 user
→ ModelRouter.complete
→ GrokAdapter.complete
→ JSON schema 校验 body_md
→ 若最少或最多越界，repair 最多两轮
→ save_writer_prose 写入 prose_revision
→ 安排本章摘要任务

10. 正文僵硬的 Prompt 层原因
这些是代码里的具体证据，不是改写方案。

系统提示把正文定义为「按已确认章节大纲写情节，并承接连续性摘要」。文件是 agents/writer.py 的 INSTRUCTIONS。没有对话、停顿、感官、潜台词或禁止总结句的要求。
场景只有目的。memory/pack.py 的 scene_sketch 是 {order}. {purpose}。每个场景在 prompt 里都是一个要完成的结果，没有过程或生活段落。
连续性摘要直接要求下一章接着结尾状态写。canon/local_continuity.py 的摘要包含「人物、剧情与世界局面都以这个结尾为准」和「下一章从该结束状态往后写，不要恢复已经改变的旧事件」。最近三章的这段全文进入 user 消息。
人物声音没有独立约束。Writer 只用性格和目标。speech_markers 只出现在大纲规划的 pipeline/outline_gen.py。
视角没有进入生成。chapter.pov 停在界面和章节表。
篇幅修复可能把扩写变成复述。REPAIR_UNDER 要求重写到范围内，同时禁止垫字；但 _repair_length 只接受更接近字数的稿，而且这次调用看不到大纲和人物。
Prompt 本身是模板。总大纲块以「已确认总大纲中与这一章有关的部分」开头，状态块以「来源章节」「来源正文」结尾。代码里没有「钩子」「这不是孤例」或固定意象的指令；这类句子不是 prompt 写进去的。
11. Writer Quality v0 Baseline
A. 实际 Prompt 结构
system：三句作者指令，有篇幅时再加 length_requirement。

user：Writer Pack 各块，格式 [{kind} id={id}]\n{text}。
输出约束：ProseDraft JSON，body_md 必填。

B. 当前输入上下文
已确认大纲禁令、要求、总纲切片、卷大纲、章大纲、场景目的；同分支的新鲜已确认状态；更早章节摘要；人物的名字、身份、摘要、性格、目标；世界条目的名字、类型、摘要、正文；可选篇幅政策。不含其他章全文，不含本章旧正文，不含章节 goal，不含视角。

C. 当前模型参数
Grok grok-4.7，https://api.x.ai/v1/chat/completions，temperature 0.7，max_tokens 4096，reasoning_effort low，timeout 180 秒。没有 top_p。

D. 当前长度控制
chapter 覆盖 volume，volume 覆盖 project。目标只是希望值。最少和最多才触发最多两轮重写。严格只影响事后警告等级。全空则不提篇幅。

E. 当前 Character Voice 能力
正文生成没有。只有性格和目标。说话特点存在于人物资料和大纲规划，不进入 Writer。

F. 当前 Scene Writing 能力
没有独立场景写作指令。模型只看到场景目的列表。

G. 当前最值得优先修改的问题

系统提示只有情节服从和摘要承接，没有小说正文的写法。
场景以「目的」进入模型，每个场景都被当成要完成的结果。
连续性摘要用总结句要求下一章从结尾状态接着写。
人物说话方式、句式和行为差异没有进入正文 prompt；视角也没有。
偏短修复只按字数接受新稿，而且不再看到大纲和人物。
涉及的文件和函数：client/src/components/editor/ChapterEditor.tsx，client/src/App.tsx 的 runGenerate、confirmAndSend，client/src/lib/api.ts 的 generate，host/routes.py 的 post_generate，pipeline/chapter_flow.py 的 generate、_repair_length，agents/writer.py 的 draft、repair、_render，memory/pack.py 的 build_writer_pack、_outline_blocks、_stage2b_blocks、_character_text，prose/length.py 的 inherit_length、length_requirement、needs_length_repair，canon/local_continuity.py 的 derive_local_continuity，providers/router.py 的 ModelRouter.complete、_select，providers/adapters/grok.py 的 GrokAdapter.complete，pipeline/schemas/prose_draft.json，prose/revisions.py 的 save_writer_prose。大纲侧的 pipeline/outline_gen.py _character_text 含说话特点，但不在这条正文链上。

## Response:
10/5/2026, 7:29:56 PM · gpt-5-6

这份只读核对已经足够，而且它非常明确地解释了为什么现在的正文会“僵硬”。

**我建议现在不要再做架构修改。** 当前问题几乎全部集中在 Writer 的“写法指令”和输入信息选择上，正好符合我们之前定义的 Writer Quality v0 范围。

### 最关键的发现

目前 Writer 实际上是在执行：

> **“按照大纲完成剧情任务 + 根据摘要承接前文 + 把人物资料和世界资料塞进正文。”**

而不是：

> **“像一个小说作者一样，把这些剧情要求转化成一个真实发生的场景。”**

这两者差别非常大。

尤其是这几个问题：

| 问题 | 当前情况 | 对正文的影响 |
|---|---|---|
| System Prompt | 只有剧情服从/连续性 | 模型不知道“应该怎么写小说” |
| Scene | 只有 `purpose` | 场景变成任务清单 |
| Character Voice | 没进入 Writer | 所有人容易说成同一种 AI 腔 |
| POV | 没进入 Writer | 缺少稳定的叙事视角 |
| 情绪 | 没有过程约束 | 容易直接告诉读者“他很震惊/很害怕” |
| 对话 | 没有独立要求 | 容易变成信息交换 |
| 感官/动作 | 没有要求 | 容易用概括句代替体验 |
| 连续性 | 强调“接着结尾” | 容易形成“上一章总结 → 下一章事件” |
| 长度修复 | 只看字数 | 有潜在复述/机械扩写风险 |

而且有一个非常重要的结论：

**我们不需要先增加数据库、Scene 表、Arc、Timeline、向量库或者新的 State 架构。**

现在已经有：

`Chapter Outline → Scene Sketch → Character → World → State → Summary`

缺的是把这些东西**转换成文学表达的能力**。

---

## 我建议 Writer Quality v0 只改 4 个地方

### 1. 重写 Writer System Prompt

这是优先级最高的。

现在的：

> “主要情节以已确认的章节大纲为准……”

本身没有错，但它实际上把 Writer 定义成了一个**剧情执行器**。

我们需要把它变成：

**剧情约束不可违背，但大纲不是小说正文。**

也就是说明确告诉模型：

- 大纲规定“发生什么”
- Writer 决定“怎么让读者经历它”
- 不要逐条解释大纲
- 不要把场景目的写成场景总结
- 不要为了推进剧情而让人物机械行动
- 情绪通过动作、语言、反应、停顿表现
- 对话应该有潜台词
- 不同人物必须有不同说话方式
- 不要每个场景都用总结句收尾
- 不要为了“文学感”堆砌比喻
- 不要反复使用相同意象
- 给人物留出犹豫、误解、闲话、观察和无效动作的空间

但这里要非常注意：

**不能把 Prompt 写成另外一个“AI写作模板”。**

否则我们只是把：

> “AI模板 A”

换成：

> “更高级的 AI模板 B”。

---

### 2. 把 Scene Sketch 从“目的”提升成“写作上下文”

这一点我认为非常重要。

现在：

```text
1. 调查旧城区的异常
2. 林天发现新的魔物
3. 林天决定追查
```

模型自然会：

> 调查 → 发现 → 决定。

所以场景会非常机械。

但我们现在**不需要增加数据库 Scene 表**。

可以直接让现有的 `scene_sketch` 在 Prompt 中被解释为：

```text
Scene 1
Purpose: 调查旧城区的异常

Writing intention:
- POV
- immediate want
- hidden tension
- emotional movement
- relationship pressure
- information revealed naturally
- sensory anchors
- ending change
```

这些可以首先作为**Writer Prompt 层面的写作解释框架**，而不是马上改数据库。

这非常符合 v0。

---

### 3. Character Voice 必须进入 Writer

这是目前一个非常明显的缺口。

你现在已经有 `speech_markers`：

```text
人物
role
summary
personality
goals
speech_markers
```

但 Writer 看不到 `speech_markers`。

所以这其实是一个非常低成本、高收益的修复：

**不要重新设计 Character 数据结构。**

只需要研究现有字段，然后让 Writer Pack / Prompt 在不改变数据结构的情况下，把适合正文生成的人物声音信息带进去。

例如不是：

> 林天：谨慎、善良、责任心强。

而是让 Writer 能知道类似：

> 林天说话简短，不喜欢解释自己的决定；紧张时会先说半句再停下来；面对陌生人不会马上表达亲近；和熟悉的人说话时语气明显放松。

这才会真正影响对白。

---

### 4. 长度修复暂时不要重做，但必须解决一个问题

你这次审查发现了一个很重要的问题：

> `_repair_length` 第二次调用时只有上一稿正文。

这意味着：

**模型正在没有原始写作上下文的情况下“重写小说”。**

例如正文原来是：

> 林天在天台发现了三只魔物，并且与某角色产生了关系变化……

然后偏短。

Repair 模型只收到上一稿：

> “请把它写长一点。”

它当然很容易：

- 重复动作
- 换一种说法再讲一次
- 增加环境描写
- 增加心理解释
- 加一些无关对话

所以未来需要改。

但我不建议现在马上做复杂的 Length Architecture。

Writer Quality v0 可以先采用一个非常简单的原则：

> **长度修复应该保留原始 Writer Context，而不是只给上一稿。**

同时要求：

> 扩写必须增加新的有效叙事内容，而不是改写已有信息。

这属于 Writer Quality，而不是 Stage 2B。

---

# 接下来最重要的一步

现在**还不要直接让 Cursor 修改 Prompt**。

因为我们已经知道“当前有什么”，但下一步应该先设计一版**Writer Quality v0 Prompt Contract**。

我建议我们先把它设计成几个明确的原则：

### Writer Quality v0

**A. Plot fidelity**

大纲是事实约束，但不是 prose 模板。

**B. Scene reality**

每个场景必须感觉像一个正在发生的空间，而不是完成任务。

**C. Character agency**

人物根据自己的欲望、信息和性格行动，而不是因为“大纲要求”。

**D. Dialogue**

人物说话必须有目的、语气、潜台词和区别。

**E. Emotional movement**

不要直接宣布情绪，让情绪通过行为、语言、身体反应和选择体现。

**F. POV**

严格使用章节指定 POV。

**G. Sensory grounding**

每个重要场景至少建立少量具体、有效的环境/感官锚点，但禁止为了“文学感”堆砌形容词。

**H. Pacing**

允许停顿、无效动作、观察、短暂闲聊和自然过渡；不是每一句都必须推进主线。

**I. Information**

禁止把作者知道的信息全部塞进人物脑子里。

**J. Ending**

场景可以自然结束，不要求每场都制造“钩子”或金句。

**K. Anti-AI**

减少：

- 总结式情绪
- “这不是……而是……”
- “他终于明白……”
- “这一刻他意识到……”
- 重复意象
- 四字/排比式结论
- 作者替人物总结意义
- 每段都明确解释因果

但这里也不能简单做一个“禁用词黑名单”，否则又会产生新的模板感。

---

## 最重要的是：做 A/B，而不是凭感觉改

我建议下一步让 Cursor 做：

**Writer Quality v0 — Prompt Design + A/B Harness**

而不是直接全面替换生产 Writer。

我们拿你现在已经生成的**同一个章节输入**：

- 同一个 Story Outline
- 同一个 Volume Outline
- 同一个 Chapter Outline
- 同一个 Scene Sketch
- 同一个 Character
- 同一个 World
- 同一个 State
- 同一个 Summary
- 同一个 Grok 4.7
- 同样参数

只改变：

> **Writer Prompt / Writing Instructions**

然后生成 A、B 两个版本。

这样我们才能真正判断：

> **到底是 Prompt 导致的僵硬，还是模型/上下文本身的问题。**

而从刚才的只读结果来看，我认为 **Prompt 层确实存在非常大的改善空间。**

**所以现在不要继续加架构了。下一步就是 Writer Quality v0 的 Prompt Contract。**

## Prompt:
10/5/2026, 7:31:27 PM

我要怎么做