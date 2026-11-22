Assistant V1 当前：

- 可以读取 Continuity Slice
- 可以读取 Continuity Report
- 不能修改 Continuity
- 不能提出 State Proposal

设计：

未来 Handoff V1 是否应该允许 Assistant：

“我从第20章提取出了这些状态，请确认”

但不要在本阶段实现 Assistant State Proposal。

十七、是否需要自动触发

比较：

方案 A：
保存正文后自动提取

方案 B：
用户点击“提取连续性”

方案 C：
用户确认正文后自动提取

方案 D：
完全手动

分析哪一个最符合当前 local-first / explicit-confirmation 架构。

特别注意：

不要让普通草稿保存自动产生 Canon State。

十八、是否需要修改 chapter_flow.py

只审计。

回答：

未来 Handoff V1 是否需要让 chapter_flow：

save prose
↓
trigger extraction

还是应该保持 chapter_flow 与 state extraction 解耦。

优先考虑：

职责清晰
失败隔离
可测试
不污染现有 Continuation V1

十九、是否需要修改 Writer

原则：

Writer 不应该知道如何写 State。

Writer 只负责 prose。

如果未来需要修改 Writer，只允许增加必要的 context，不让 Writer 直接确认 State。

二十、是否需要修改 Pack

当前 Pack 已经能读取 confirmed state。

判断：

Handoff V1 是否可以完全复用现有 Pack。

如果可以，明确说明。

如果不可以，指出最小缺口。

二十一、百万字规模

假设：

1000 chapters

每章产生：

5 character states
3 world states
1 time
5 relationships
3 plot threads

评估：

当前 append-only state revision 是否还能工作。

重点检查：

read_confirmed_state() 是否每次扫描整个 branch。

如果有性能问题：

只报告。

不要现在优化。

二十二、最小实现范围

如果最终认为值得实现：

列出最小文件范围。

例如：

允许修改：
A
B
C

必须冻结：
D
E
F

如果需要第三个以上生产文件：

明确解释为什么。

不要修改。

二十三、最终输出

A. 当前 State Extraction 真实能力
B. 当前 State Confirmation 真实能力
C. Prose → State 当前断点
D. 五种 State 的完整生命周期
E. 推荐 Handoff V1 流程
F. 是否需要 State Proposal
G. 是否需要自动触发
H. stale / concurrency 处理
I. Story Bible 边界
J. Outline 边界
K. Summary 边界
L. Assistant 边界
M. Pack 是否需要修改
N. chapter_flow 是否需要修改
O. Writer 是否需要修改
P. 最小实现文件范围
Q. 测试计划
R. 当前是否建议进入实现阶段

最终必须明确给出：

DESIGN PASS / DESIGN FAIL / DEFER

再次强调：

只做架构审计。
不要改代码。
不要新增文件。
不要新增 migration。
不要 commit。
不要 push。
```

### Cursor 返回后你先别让它实现

把它的**完整审计结果原样发给我**。

我会重点检查三个东西：

1. **它有没有误判现有 `state_extract` / `state_store` 的能力；**
2. **是否真的可以复用现有状态 Revision，而不需要马上建 `state_proposal` 新表；**
3. **实现范围能不能控制在最小几个文件，而不会破坏我们已经冻结的 Continuity V1。**

如果这一轮 **DESIGN PASS**，我们再进入实现。

## Prompt:
10/6/2026, 7:17:09 PM

DESIGN PASS。 不进入新的实现。第 N 章正文要变成第 N+1 章能读到的已确认连续性，现有的显式提取和确认已经够用，不需要新表，也不要在保存正文时自动确认。

A. 当前 State Extraction 真实能力
extract_chapter_state() 只读这一章的 current 正文。模型上下文只有指令和这篇正文，不读大纲、Bible、其他章或已有状态。

它能提出未确认修订的种类是：character_state、world_state、chapter_time、relationship、plot_thread，以及没有修订的 world_referent。名字对不上已有人物、世界条目或情节线的项会被丢掉。未知地点、组织、物件进 world_referents，不写成已有世界条目。

插入时 author 为 extractor。current_revision_id 会移到这条草稿，confirmed_revision_id 不动。每条修订记下 source_chapter_id、source_prose_revision_id，并在 basis_json 里记下更早各章当时的正文指针

## Response:
10/6/2026, 7:17:15 PM · gpt-5-6

很好。这个 **DESIGN PASS 可以接受**，而且结论非常清楚：**现在不要继续设计新数据结构，直接把现有的“提取 → 用户确认 → 下一章读取”串起来即可。**

你现在先把 Cursor 的**剩余 B～R 部分也完整发给我**。目前你只贴到了 A，我还需要确认几个关键点：

- `confirmed_revision_id` 的确认流程到底怎么工作
- N 章重新生成后旧 State 如何 stale
- N+1 是否已经能直接读取 confirmed State
- 是否需要修改 `chapter_flow.py`
- 是否需要修改 `memory/pack.py`
- 最小实现文件到底有哪些
- 测试计划是否完整
- 最终 Cursor 为什么判断“不需要新表”

### 目前 A 部分我已经确认

这个设计非常符合我们之前冻结的架构：

```text
Chapter N current prose
        ↓
extract_chapter_state()
        ↓
State draft / current_revision
        ↓
用户 Review
        ↓
confirmed_revision_id
        ↓
Continuity Slice
        ↓
Chapter N+1 Writer
```

而且有几个非常重要的边界已经明确：

**① Extractor 不读取 Bible / Outline / 其他章节**

这很好。它的职责就是：

> 从“已经写出来的正文”中提取可能发生的事实。

而不是让 Extractor 自己推测世界设定。

**② Extractor 不直接产生 Canon**

这是最重要的一点：

```text
current_revision_id ← extractor
confirmed_revision_id ← 不动
```

所以 AI 提取出来的东西只是候选状态，不是事实。

**③ 有 source_prose_revision_id**

这对后面处理重新生成非常关键：

```text
Prose R20
   ↓
State S20
   ↓
用户确认

如果正文变成 R21：

R20 ≠ R21
   ↓
S20 可以被判定 stale
   ↓
重新 Extract
   ↓
S21
```

这样不会出现“旧正文产生的状态覆盖新正文状态”的问题。

**④ 不需要 State Proposal 新表**

如果 B～R 的审计也支持这一点，那么这是我们应该坚持的方案。

因为目前已经有：

```text
state revision
parent_revision_id
current_revision_id
confirmed_revision_id
source_prose_revision_id
stale/freshness
```

再造一个 `state_proposal` 很可能只是重复一套生命周期。

---

### 现在不要让 Cursor 做任何实现

你把 Cursor **从 B 开始一直到最终结论 R 的完整结果**发给我。

我会先给你一个最终判断：

> **是否可以进入 Continuity Handoff V1 Implementation**

如果可以，我再给你一份**严格限制修改范围的 Cursor 实现 Prompt**，并明确：

```text
允许修改：
xxx
xxx
xxx

禁止修改：
Story Bible
Outline

Assistant
Arc
Scene
Million-Word
Continuation V1
...
```

然后我们再让 Cursor 实现，**测试通过后再做代码级验收，最后才考虑 commit。**

## Prompt:
10/6/2026, 7:17:56 PM

DESIGN PASS。 不进入新的实现。第 N 章正文要变成第 N+1 章能读到的已确认连续性，现有的显式提取和确认已经够用，不需要新表，也不要在保存正文时自动确认。

A. 当前 State Extraction 真实能力
extract_chapter_state() 只读这一章的 current 正文。模型上下文只有指令和这篇正文，不读大纲、Bible、其他章或已有状态。

它能提出未确认修订的种类是：character_state、world_state、chapter_time、relationship、plot_thread，以及没有修订的 world_referent。名字对不上已有人物、世界条目或情节线的项会被丢掉。未知地点、组织、物件进 world_referents，不写成已有世界条目。

插入时 author 为 extractor。current_revision_id 会移到这条草稿，confirmed_revision_id 不动。每条修订记下 source_chapter_id、source_prose_revision_id，并在 basis_json 里记下更早各章当时的正文指针。

调用入口是用户显式的提取接口，而且必须先确认发送清单。没有清单不会打开模型。

B. 当前 State Confirmation 真实能力
confirm_state_revision() 只移动这一个主体的 confirmed_revision_id。确认前检查 revision_is_fresh()：来源章的 current 正文必须仍是这条修订记录的那一版，更早章节的正文指针也必须和 basis_json 一致，且 stale 不是 1。不新鲜就返回 STATE_SOURCE_STALE，确认指针不变。

确认一种状态不会改另一种。不解决 state_impact，不改 Bible、大纲或正文。

插入时 parent_revision_id 是当时的 current。确认不再改 parent，也不重算 basis。新鲜度在每次确认和每次 read_confirmed_state() 时现算。

C. Prose → State 当前断点
save_writer_prose() 之后只有：新正文修订、本地摘要、后续章的 chapter_impact、旧状态变 stale、后续章的 state_impact。

断点在提取。没有人调用 extract_chapter_state()，就不会有草稿，更不会有新的已确认状态。下一章只能看到仍然新鲜的旧确认状态；来源正文已经变了的旧状态会被排除。

D. 五种 State 的完整生命周期
五种都能提取、保存为未确认修订、单独确认。确认且仍然新鲜时，Pack 和 read_continuity_slice() 都能把它们交给下一章，但切片有上限，名字不在当前章大纲、来源也不在前三章的主体可能不出现。

每种都有来源正文和 basis。新提取不会改已有确认指针，所以不会用草稿盖掉旧事实。它会把该主体的 current 指到草稿。下一章不读 current，因此第 N+1 章的事实不会被草稿污染。

E. 推荐 Handoff V1 流程
用方案 B：用户明确点击提取，不在普通保存时自动跑。

第 N 章 current 正文，经用户触发提取，得到未确认修订。用户逐条查看后确认。确认指针指向新修订。第 N+1 章只读这些已确认且新鲜的状态，不读第 N 章全文。

不自动确认，不改 Bible，不改大纲，不改正文，不改 Writer。

正文没有确认指针。V1 继续把 chapter.current_revision_id 当作提取来源。风险是：用户保存一版草稿后，提取会基于草稿，本地摘要也会跟着这版 current。只要不确认状态，草稿就不会变成下一章的连续性事实。不要为了 Handoff 新增正文确认指针。

F. 是否需要 State Proposal
不需要 state_proposal。未确认修订就是草稿，确认指针就是生效点。拒绝就是不确认。旧修订还在。这和「提案表」不是同一条链，Bible 和大纲提案也不该拿来改状态。

G. 是否需要自动触发
不要方案 A 或 C。普通保存或所谓「确认正文」都会把草稿送去提取，和现在的显式确认冲突。方案 D 太散，用户不知道该调用哪一步。方案 B 和现有提取接口一致：保存只写正文和摘要，提取是另一次用户动作。

H. stale / concurrency 处理
第 20 章先提取再改正文：旧修订还在，来源正文不再匹配，invalidate_after_prose_change() 会把它们标 stale。新提取再插入一条修订。用户确认新的那条之后，确认指针才移动。旧修订不能再确认。

提取基于 R20，之后正文变成 R21，再回来确认 R20 的状态：revision_is_fresh() 会拒绝。R20 的状态不能盖住 R21。这个检查已经够用。

I. Story Bible 边界
提取指令禁止把未知地点写成已有世界条目，也没有 Bible 写入。正文里第一次出现城市 X，可以成为人物位置草稿，不能自动变成 Bible 地理。这个边界现在成立。

J. Outline 边界
提取不读、也不写大纲。正文偏离大纲时，不会自动改 Scene、章目标或 Arc。现有信号只有后续章的 state_impact 和 chapter_impact，表示需要核对，不是去改计划。这个边界现在成立。

K. Summary 边界
本地摘要在保存正文时写入，来源是这条正文。连续性确认不改摘要。摘要也不写状态指针。两者不会互相覆盖。

L. Assistant 边界

Assistant 只读已确认切片和报告，不能提取、确认或提出状态提案。以后可以展示「第 20 章有这些未确认草稿，请确认」，但那会读取 current 草稿，不能放进现在的事实上下文。本阶段不做。

M. Pack 是否需要修改
不需要。Pack 已经读已确认且新鲜的状态。Handoff 只要把确认指针移到新修订，下一章就会读到。不要改 Pack。

N. chapter_flow 是否需要修改
不需要。保存正文和提取应继续分开。接进 chapter_flow.py 会让失败的提取卷进正文保存，也会碰已经冻结的 Continuation。提取失败不应回滚正文，正文保存也不应自动产生 Canon 状态。

O. Writer 是否需要修改
不需要。Writer 只写正文。它不负责提取或确认状态。

P. 最小实现文件范围
没有必须新增或修改的生产文件。现有 pipeline/state_extract.py、canon/state_store.py 和 host/state_routes.py 已经构成这条链路。不要改 continuity.py、continuity_report.py、memory/pack.py、chapter_flow.py、agents/writer.py、agents/assistant.py、agents/assistant_context.py。

Q. 测试计划
现在不写新测试。现有阶段测试已经覆盖：提取不确认、来源正文变了不能确认、确认一种状态不动另一种、下一章 Pack 只用已确认状态且排除上一章全文。

R. 当前是否建议进入实现阶段
不建议。Handoff V1 不是缺机制，而是不要把已有的显式提取和确认改成保存正文时的自动步骤。自动确认或自动提取都会把草稿变成下一章事实，这正是这次要避免的。

## Response:
10/6/2026, 7:18:01 PM · gpt-5-6

这份审计结果我认为可以接受，而且结论比上一轮更加明确：

> **Continuity Handoff V1 的机制实际上已经存在，不需要开发新的 Handoff 系统。现在真正缺的是把“用户操作流程”用起来。**

所以这一步**不要写代码、不要新增 migration、不要修改现有生产文件，也不要 commit。**

### 现在系统实际应该这样使用

```text
第 N 章正文
   │
   ▼
保存正文
   │
   ├── Prose Revision
   ├── Local Summary
   ├── chapter_impact
   └── 旧 Continuity → stale
          │
          ▼
     【用户主动点击“提取连续性”】
          │
          ▼
   extract_chapter_state()
          │
          ▼
   未确认 State Draft
   ├── Character
   ├── World
   ├── Time
   ├── Relationship
   └── Plot Thread
          │
          ▼
      用户逐条审核
          │
       ┌──┴──┐
       │     │
      拒绝   确认
       │     │
       ▼     ▼
    不生效  confirmed_revision_id
                 │
                 ▼
       第 N+1 章 Context
                 │
                 ▼
        Continuity Slice
                 │
                 ▼
             Writer
```

这正好符合我们一直坚持的原则：

**AI 可以提议事实，但不能自己把事实变成 Canon。**

---

## 现在最重要的问题

你这次 Cursor 审计其实发现了一个很关键的事实：

**我们之前把“Continuity Handoff V1”当成一个需要开发的功能，但从代码层面看，它已经基本完成了。**

真正缺的是：

> **用户有没有方便、明确地执行“提取 → 审核 → 确认”。**

而这和“新增后端机制”是两回事。

### 因此我不建议现在改后端

特别是不要做这些：

- ❌ `save_writer_prose()` 自动提取
- ❌ 保存正文自动确认 State
- ❌ 给 prose 增加 `confirmed_revision_id`
- ❌ 新建 `state_proposal`
- ❌ 修改 `chapter_flow.py`
- ❌ 修改 Writer
- ❌ 修改 Pack
- ❌ 修改 Continuity Slice
- ❌ 修改 Assistant

Cursor 给出的 **P～R** 结论是合理的。

---

# 那我们下一步做什么？

我建议现在进入一个非常小的阶段：

## **Continuity Handoff UX / 操作链路审计**

不是开发后端。

我们需要确认：

> **现在用户在 AI Novel Studio 的界面里，到底能不能完成这条链？**

也就是：

```text
写完第20章
 ↓
保存
 ↓
找到“提取连续性”
 ↓
看到 AI 提取的 State
 ↓
逐条审核
 ↓
确认
 ↓
打开第21章
 ↓
第21章真的能看到第20章确认过的状态
```

如果**这些按钮/API/页面已经存在**，那么我们可能连代码都不用写。

如果缺少 UI，只需要做一个非常小的 UI 层，不碰核心 Continuity 架构。

---

## 你现在让 Cursor 做这个审计

仍然是**只审计，不改代码**。

直接复制：

```text
现在进行 Continuity Handoff UX / 操作链路审计。

只做代码审计。
禁止：
- 修改代码
- 新增文件
- 新增 migration
- 修改数据库结构
- commit
- push

目标：

确认用户目前是否能够在 AI Novel Studio 中完整执行：

第 N 章正文
→ 保存
→ 用户主动触发 State Extraction
→ 查看未确认 State
→ 用户确认 State
→ 第 N+1 章读取 confirmed + fresh Continuity

后端机制已经通过 Continuity Handoff V1 DESIGN PASS。
本轮不要重新设计后端，也不要自动化。

重点检查：

1. host/state_routes.py
确认现有 API：
- 是否存在 State Extraction endpoint
- 是否存在 State list/read endpoint
- 是否存在 State confirmation endpoint
- request/response schema
- project/chapter 参数
- revision 参数
- manifest/Send Manifest 要求

2. 前端

搜索：
- state
- continuity
- extract
- confirm
- revision
- chapter impact
- state impact

确认目前 UI 是否已经存在：
- “提取连续性”
- “查看提取结果”
- “确认 State”
- “查看 stale”
- “查看未确认 revision”

如果没有 UI，只报告缺口。

3. 完整用户路径

从当前已有 UI 出发，判断用户能否：

A. 写第 N 章
B. 保存
C. 主动提取 State
D. 看到提取结果
E. 确认
F. 打开第 N+1 章
G. Writer Context 读取 confirmed State

逐步列出：

“已有”
“缺失”
“需要用户手动操作”
“当前无法完成”

4. Send Manifest

确认 State Extraction 是否已经要求用户明确确认发送清单。

确认普通保存正文是否不会自动调用模型。

5. Draft / Confirmed UI

重点确认 UI 有没有把：

current_revision_id

和：

confirmed_revision_id

区分开。

必须避免让用户误以为：

current = confirmed。

6. Stale UI

如果正文修改后旧 State stale：

用户能否看到？

如果目前不能显示，只报告，不实现。

7. N+1 验证

检查有没有现成方式验证：

Chapter N confirmed State
→ Chapter N+1 continuity slice
→ Writer Pack

如果后端已经支持，只报告。

8. API 与 UI 的最小缺口

最终明确：

A. 后端已经完整，UI 缺失
B. UI 已经完整
C. API 有但 UI 没接
D. API 本身还有缺口

不要修改任何东西。

9. 如果需要 UI

只列出未来最小实现范围。

优先：
- 一个 State Review 面板
- 一个 Extract 按钮
- Confirm / Reject
- stale 状态显示

不要设计复杂的新系统。

10. 最终输出

A. 当前用户实际能完成什么
B. 当前用户无法完成什么
C. API 是否完整
D. UI 是否完整
E. Send Manifest 是否完整
F. State Review 是否完整
G. N → N+1 Handoff 是否可以实际验证
H. 最小 UI 实现范围
I. 是否需要任何后端修改

再次强调：

只审计。
不改代码。
不新增文件。
不新增 migration。
不 commit。
不 push。
```

### 然后把结果发给我

这一轮之后我们就能做一个非常明确的判断：

**如果后端 + UI 都已经够用 → Continuity Handoff V1 直接冻结，不再动。**

**如果只有 UI 缺口 → 只补 UI，不碰已经通过审计的核心后端。**

我目前非常倾向第二种，因为这次审计已经证明**核心连续性机制本身并不是当前瓶颈**。

## Prompt:
10/6/2026, 7:22:15 PM

只审计用户能不能走完「提取 → 查看 → 确认 → 下一章读取」。我先对后端路由和前端入口。

用户现在写完一章并保存后，不能在界面里把连续性交给下一章。提取、查看草稿和确认的 API 已经存在，前端没有接上。结论是 C：API 有，UI 没接。另外有一个小缺口：没有「拒绝」接口，未确认草稿也不会出现在「只读已确认状态」的接口里。

A. 当前用户实际能完成什么
在现有界面里，用户可以写第 N 章、保存正文、生成整章、确认发送清单后再生成，以及查看检索包。保存正文不会调用模型。本机会写本地摘要，后面的章能读到摘要，读不到第 N 章全文。

检索面板能看到 Writer Pack 里已经确认的状态块。这只能验证「确认之后下一章读得到」，不能代替提取和确认。

B. 当前用户无法完成什么
界面上没有「提取连续性」「查看提取结果」「确认 State」「查看 stale」「查看未确认 revision」。

因此这条链路在 UI 里走不通：

步骤	状态
写第 N 章并保存
已有
主动提取 State
缺失。需要用户调用 API，界面做不到
看到未确认提取结果
缺失
确认 State
缺失
打开第 N+1 章
已有
Writer 读取已确认 State
后端已有。没有确认过的状态时，Pack 里就是空的
没有确认按钮时，用户无法把提取草稿变成下一章能读的事实。

C. API 是否完整
host/state_routes.py 已有这些接口：

POST /chapters/{chapter_id}/state/extract，请求体是 { manifest_id, allow_fake }。返回 proposals，每项有 state_kind、subject_id、revision_id、source_prose_revision_id、confirmed_revision_id。
GET /chapters/{chapter_id}/state 只返回已确认且新鲜的状态，不返回草稿。
五种状态各自有确认和历史：POST .../confirm，请求体 { revision_id }；GET .../revisions 返回该主体的全部修订，含未确认和 stale。
另有 POST .../state/carry，那是结转，不是提取。
没有「拒绝」接口。不确认就不会移动 confirmed_revision_id。提取会把该主体的 current_revision_id 指到草稿，确认指针不动。

client/src/lib/api.ts 没有封装这些地址。

D. UI 是否完整
不完整。大纲和章计划能区分「当前」和「已确认」，那是大纲修订，不是连续性状态。章计划里的 impact 来自 /chapters/{id}/impact，是 chapter_impact，不是 state_impact。侧栏「连续性」只说明本地摘要和检索包。

界面没有把状态的 current_revision_id 和 confirmed_revision_id 分开显示。用户在界面上看不到 stale。

E. Send Manifest 是否完整
提取已经要求确认发送清单。未带匹配的 manifest_id 时，提取返回 SEND_NOT_CONFIRMED，连接不会打开。这和生成正文、生成大纲的清单是同一套确认接口。

普通保存正文是 PUT /chapters/{id}/prose，不调用模型，也不调用提取。

F. State Review 是否完整
不完整。提取响应当下能列出草稿，但界面没用它。之后要再看，只能按主体调用历史接口。GET /state 故意不包含草稿，不能当作审核列表。没有拒绝动作，也没有 stale 标记的界面。

G. N → N+1 Handoff 是否可以实际验证
后端可以。测试已经证明：确认后的状态会进入 Writer Pack 和连续性切片，第 N 章全文在排除列表里。

界面上，用户确认状态之后，可以打开第 N+1 章的「查看检索」，看有没有 character_state 等块，以及上一章正文是否被排除。在没有确认按钮时，用户自己做不到这一步。

H. 最小 UI 实现范围
以后只需要一块 State Review，不要新系统：

一个「提取连续性」按钮：先走现有发送清单确认，再调用 POST .../state/extract。
用这次返回的 proposals 显示未确认结果，并标明这是草稿，不是已确认。
每条一个「确认」按钮，调用对应的 POST .../confirm，带上 revision_id。
不确认就保持确认指针不动。可以先不做单独的拒绝接口。
历史里若 stale 为 1，或来源正文已不是当前正文，显示为过期，不能确认。
不要把 GET /state 的结果当成待审核列表。

I. 是否需要任何后端修改
做这块最小界面不需要改后端，也不需要 migration。现有提取、历史、确认和检索预览足够。拒绝、按章汇总草稿、以及在界面上把 state_impact 和 chapter_impact 分开，都可以以后再加。

## Response:
10/6/2026, 7:23:06 PM · gpt-5-6

这份结果非常清楚，**可以进入下一步，但只做 UI，不动后端。**

现在的真实状态是：

```text
后端 Continuity Handoff     ✅ 已有
State Extraction            ✅ 已有
State Confirmation          ✅ 已有
Fresh/Stale 检查            ✅ 已有
N → N+1 Context             ✅ 已有
Send Manifest               ✅ 已有

前端 State Review           ❌ 缺失
```

所以我们终于找到了真正的最小缺口。

## 下一步：只实现 State Review UI

这次不要再做设计审计了，可以让 Cursor 实现。

核心用户体验只需要：

```text
第20章
  ↓
保存正文
  ↓
【提取连续性】
  ↓
Send Manifest
  ↓
AI 提取
  ↓
┌──────────────────────┐
│ 连续性提取结果        │
│                      │
│ 人物：XXX             │
│ 状态：……              │
│ [确认]                │
│                      │
│ 世界：XXX             │
│ 状态：……              │
│ [确认]                │
└──────────────────────┘
  ↓
确认
  ↓
第21章
  ↓
Writer Pack / Continuity
  ↓
读取第20章已确认状态
```

而且**暂时不要做拒绝接口**。用户不点确认，就已经等价于“不生效”。

---

## 给 Cursor 的实现 Prompt

直接复制下面这段：

```text id="58142"
现在进入 Continuity Handoff UI V1 实现。

本阶段只补前端 UI。
后端已经通过设计审计，禁止修改后端 Continuity 机制。

目标：

让用户能够在界面完整走完：

第 N 章正文
→ 提取连续性
→ 查看未确认 State
→ 确认 State
→ 第 N+1 章读取已确认 State

禁止：
- 修改数据库
- 新增 migration
- 新增 state_proposal
- 修改 state_store.py
- 修改 state_extract.py
- 修改 continuity.py
- 修改 continuity_report.py
- 修改 memory/pack.py
- 修改 chapter_flow.py
- 修改 agents/writer.py
- 修改 Assistant
- 修改 Story Bible
- 修改 Outline
- commit
- push

后端现有接口已经足够。

一、允许使用的现有 API

1. 提取：

POST /chapters/{chapter_id}/state/extract

body：

{
  "manifest_id": "...",
  "allow_fake": ...
}

必须沿用现有 Send Manifest 机制。

2. 已确认状态：

GET /chapters/{chapter_id}/state

注意：
这个接口只返回 confirmed + fresh State。

绝对不要把它当成待审核列表。

3. State 历史：

GET /chapters/{chapter_id}/state/revisions

如果实际 API 需要 subject_id，请按照现有后端路由的真实参数调用。

历史结果包含：
- revision_id
- state_kind
- subject_id
- source_prose_revision_id
- stale
- confirmed 等信息

4. 确认：

POST 对应 state revision 的 confirm endpoint

body：

{
  "revision_id": "..."
}

按照 host/state_routes.py 的真实接口实现，不猜 API。

二、先检查现有前端结构

重点查看：

client/src/
client/src/lib/api.ts
现有章节编辑页面
现有 Continuity 相关组件
现有 Send Manifest / generation UI

先理解现有 UI 风格。

不要重新设计整个页面。

三、API 封装

在：

client/src/lib/api.ts

增加最小必要的 State API 封装：

- extract chapter state
- get state revisions
- confirm state revision

严格对应后端已有 API。

不要修改后端。

四、State Review UI

在现有章节编辑/连续性相关区域增加一个：

“提取连续性”

入口。

不要新建复杂系统。

用户点击：

【提取连续性】

之后：

1. 调用现有 extraction API
2. 使用现有 Send Manifest 流程
3. 如果 SEND_NOT_CONFIRMED：
   - 显示现有的发送清单确认 UI
   - 不绕过确认
4. extraction 成功：
   - 显示 proposals

五、Proposal 展示

每一个提取结果明确标记：

“未确认草稿”

至少显示：

- state_kind
- subject
- 提取结果 / state 内容
- revision_id
- source_prose_revision_id
- 当前 confirmed_revision_id（如果后端返回）
- 是否 stale

必须让用户明显知道：

“这是 AI 提取出的候选状态，不是已经生效的 Canon。”

六、确认按钮

每个 proposal 单独提供：

【确认】

点击后：

POST 对应 confirm endpoint。

成功后：

- 更新 UI
- 将该 revision 标记为 confirmed
- 不影响其他 state
- 不自动确认其他 proposal

不要批量自动确认。

七、Stale

如果 revision 已 stale：

显示：

“已过期，不能确认”

并禁用确认按钮。

不要尝试重新确认。

如果 source_prose_revision_id 与当前正文不匹配：

也必须避免让用户确认。

后端本身会再次校验，所以前端只是 UX 层保护。

八、拒绝

本阶段：

不要新增 reject API。

用户不点击确认即可。

不要把“关闭窗口”解释成拒绝。

不要修改后端。

九、确认后的状态

确认成功后：

重新请求：

GET /chapters/{chapter_id}/state

让 UI 能看到：

已确认且新鲜的 State。

可以区分：

【未确认草稿】
【已确认】
【已过期】

十、Current / Confirmed

UI 必须明确区分：

current_revision_id

和：

confirmed_revision_id

不能出现：

“Current = 已确认”

这样的错误表达。

如果当前 revision 是 extractor draft，而 confirmed_revision_id 仍指向旧 revision：

应该显示类似：

“有新的未确认版本”

而不是把新版本显示为 Canon。

十一、N → N+1 验证

不要增加新的后端接口。

利用已有：

GET /chapters/{id}/state

以及现有 Writer Pack / 检索预览。

如果现有 UI 已有“查看检索”：

在确认后让用户可以继续使用现有入口验证下一章。

不要为了这个功能新增 Context API。

十二、加载 / 错误处理

至少处理：

- extraction loading
- extraction success
- SEND_NOT_CONFIRMED
- extraction failure
- confirmation loading
- confirmation success
- STATE_SOURCE_STALE
- confirmation conflict
- network error

不要吞掉后端错误。

十三、刷新行为

页面刷新后：

未确认 proposal 如果仍可通过 revision history 获取，可以继续显示。

不要假设 extraction response 永远存在内存里。

如果当前后端没有按章直接列出所有草稿的接口：

不要修改后端。

可以使用已有 revision/history API 按现有结构读取。

如果这样无法可靠实现 State Review：

停止并报告最小后端缺口，不要自行新增 API。

十四、视觉要求

保持现有 AI Novel Studio 风格。

不要：
- 新建复杂 dashboard
- 修改整体布局
- 修改 Story Bible
- 修改 Outline UI
- 修改 Assistant UI
- 大范围重构 CSS

只增加最小 State Review 区域。

十五、测试

至少增加/更新前端测试：

1. extraction button 调用正确 API
2. extraction 返回 proposal 后正确显示
3. proposal 明确显示为 unconfirmed
4. confirm 调用正确 endpoint + revision_id
5. confirm 一个 State 不会确认其他 State
6. stale State 禁用确认
7. SEND_NOT_CONFIRMED 正确进入现有 manifest flow
8. confirmation success 后刷新 confirmed state
9. confirmed State 显示为 confirmed
10. current draft 不显示成 confirmed
11. 后端错误能够显示
12. 不新增任何后端接口
13. 不修改数据库

十六、严格文件范围

优先只允许修改：

client/src/lib/api.ts
以及现有最相关的章节/连续性 UI component。

如果需要新增一个纯前端 State Review component，可以新增一个前端组件文件。

如果发现必须修改任何 Python/backend 文件：

立即停止，不修改，并报告原因。

十七、完成后输出

请报告：

A. 修改了哪些文件
B. 为什么修改
C. 使用了哪些已有 API
D. 是否修改任何 backend
E. 是否新增 migration
F. 测试结果
G. 用户现在是否可以完整走完：

提取
→ 查看
→ 确认
→ 下一章读取

H. 是否存在未解决缺口

不要 commit。
不要 push。
```

### 这次验收标准

Cursor 做完以后，你**先不要让它 commit**。

把它的修改文件列表、测试结果和实现说明发给我。

我会检查的核心只有一个：

> **一个真实的第 N 章，用户能否不碰 API、不打开终端，只通过 UI 完成“提取 → 查看 → 确认”，然后让第 N+1 章实际读取这些状态。**

如果这个闭环通过，我们就可以把 **Continuity Handoff V1 正式冻结**，然后再进入下一阶段。

## Prompt:
10/6/2026, 7:23:57 PM

这个设计，用户的体验感怎么样？

## Response:
10/6/2026, 7:24:01 PM · gpt-5-6

如果按现在这个设计实现，我会评价为：**后端逻辑很稳，但用户体验目前只能算“合格”，还没有达到你这个 AI Novel Studio 应有的高级感。**

尤其是你的目标不是一个开发者工具，而是一个**真正让人写长篇小说的创作工作台**。用户不应该感觉自己在操作“数据库里的 State Revision”。

### 我给目前方案的体验评分

| 环节 | 体验 | 评价 |
|---|---:|---|
| 写正文 | ⭐⭐⭐⭐⭐ | 正常创作，不打扰 |
| 保存正文 | ⭐⭐⭐⭐⭐ | 简单、自然 |
| 提取连续性 | ⭐⭐⭐⭐ | 一个按钮即可，但还可以更自然 |
| 查看 AI 提取结果 | ⭐⭐⭐ | 目前偏“工程化” |
| 确认状态 | ⭐⭐⭐ | 逐条确认可靠，但略繁琐 |
| 处理 stale | ⭐⭐ | 对普通作者来说比较难理解 |
| 下一章读取 | ⭐⭐⭐⭐⭐ | 后端逻辑非常好 |
| 整体连续写作感 | ⭐⭐⭐ | **还有明显提升空间** |

---

# 我最担心的一点

现在的设计容易让用户产生这种感觉：

> “我写完一章小说，为什么还要管理 Character State、World State、Revision、Stale？”

这其实是**系统内部概念泄漏给用户**。

对于你最终的产品，我更希望用户看到的是：

> **“整理这一章发生的事情”**

而不是：

> “State Extraction”

---

# 我建议把用户体验改成“两层”

## 第一层：普通作者完全不用懂 Continuity

写完第 20 章之后，在编辑器底部或者章节完成区域出现一个非常自然的提示：

> ### 第20章已完成
> AI 可以帮你整理这一章对后续剧情有影响的变化。
>
> **[整理本章变化]**

旁边可以非常轻地写：

> 用于保持后续章节的人物、关系、世界和剧情连续性

这样用户马上就懂了。

---

## 第二层：点击之后才进入 Review

点击以后，不要直接扔出来：

```text
character_state
revision_id
source_prose_revision_id
confirmed_revision_id
```

而应该显示成小说作者能理解的东西。

例如：

### 本章发生了这些变化

**人物**

**林晓**
> 林晓现在已经知道王教授参与了这次实验，并决定暂时隐瞒这件事。

`✓ 确认`　`忽略`

---

**人物**

**王教授**
> 王教授目前在上海，并且已经开始怀疑林晓知道实验真相。

`✓ 确认`　`忽略`

---

### 关系

**林晓 ↔ 王教授**

> 两人的关系从合作转为互相怀疑。

`✓ 确认`　`忽略`

---

### 时间

> 故事时间推进到 2027 年 3 月 14 日晚上。

`✓ 确认`　`忽略`

---

### 剧情线

**“实验真相”**

> 这条剧情线进入“主角已经接近真相”的阶段。

`✓ 确认`　`忽略`

---

用户根本不需要知道：

> `character_state`

是什么。

---

# “确认”也可以做得更高级

我甚至不建议让用户每次都必须一个一个点击。

可以提供：

### AI整理完成

> 共发现 **7 项可能影响后续剧情的变化**

然后：

**[全部确认]**

以及每一项：

**✓ 确认**
**忽略**

但这里有一个重要原则：

> **“全部确认”必须仍然是用户主动点击。**

不能 AI 自动确认。

这样既保留了我们现在非常可靠的 Canon 安全机制，又不会让用户觉得麻烦。

---

# Stale 不应该直接告诉用户“STATE_SOURCE_STALE”

这是开发者错误信息。

用户应该看到：

> ⚠️ 这条信息来自旧版本正文
> 你后来修改了本章内容，因此这条变化已经不能确认。

然后：

**[重新整理本章变化]**

就够了。

底层仍然使用：

```text
source_prose_revision_id
revision_is_fresh()
stale
```

但是这些东西全部藏在 UI 后面。

---

# 我尤其喜欢一个设计：章节完成状态

你的章节可以有一个非常轻量的状态指示：

```text
第20章

正文       ✓
摘要       ✓
连续性     ✓  已整理
```

或者：

```text
第20章

正文       ✓ 已保存
连续性     ● 有 7 项待确认
```

这样用户一眼就知道：

> “这一章写完了吗？它有没有被系统纳入后续连续性？”

这会比单独放一个“State Review”按钮高级很多。

---

# 最终我建议的用户流程

真正成熟的版本应该是：

```text
写第20章
    ↓
保存
    ↓
┌─────────────────────────┐
│ 第20章已保存             │
│                         │
│ 建议整理本章变化         │
│ 发现可能影响后续剧情的7项 │
│                         │
│       [整理本章变化]     │
└─────────────────────────┘
              ↓
         AI整理
              ↓
┌─────────────────────────┐
│ 本章变化                 │
│                         │
│ 人物  2项                │
│ 关系  1项                │
│ 世界  1项                │
│ 时间  1项                │
│ 剧情线 2项               │
│                         │
│ [全部确认]               │
└─────────────────────────┘
              ↓
        用户确认
              ↓
      ✓ 本章连续性已更新
              ↓
          第21章
              ↓
      Writer 自动读取
```

这时候用户的心理感受就不是：

> “我要管理数据库状态。”

而是：

> **“AI帮我把这一章记住了，所以它不会把我的角色和剧情写乱。”**

这才是我认为 **AI Novel Studio** 应该追求的体验。

---

## 但有一个原则我不会改

即使 UI 做得非常简单，底层仍然必须保持：

**AI 提取 ≠ Canon**

必须永远是：

> AI 提取 → 用户确认 → 下一章读取

而不能为了“体验更丝滑”变成：

> AI 提取 → 自动进入 Canon。

这是长篇小说系统最容易埋雷的地方。

所以我的建议是：

**当前 Cursor 的 UI 实现 Prompt 可以执行，但它更适合作为 V1 的“功能闭环 UI”，不是最终 UX。**

如果你希望这个项目最终做到你之前说的那种**真正专业、长期写百万字小说的 AI 创作软件**，我会在功能跑通之后，再做一次专门的 **Continuity UX V2**，把“State / Revision / Stale”这些内部概念尽可能藏起来，让作者感觉自己只是在**确认 AI 对本章剧情的理解**。

## Prompt:
10/6/2026, 7:25:03 PM

好的

## Response:
10/6/2026, 7:25:30 PM · gpt-5-6

好的。那就按这个路线走：

**现在：**先完成 Continuity Handoff V1 的最小 UI 闭环，不改后端。
**之后：**再做 Continuity UX V2，把内部的 State / Revision / Stale 等工程概念隐藏起来，让它更像真正的小说创作工具。

你现在可以把我上一条的 **Cursor 实现 Prompt** 直接交给 Cursor。

Cursor 完成后，**先不要 commit / push**，把它的修改说明、文件列表和测试结果发给我。我帮你做代码级验收。

## Prompt:
10/6/2026, 7:26:05 PM

帮我想想还有什么我没想到的、需要改进的

## Response:
10/6/2026, 7:26:08 PM · gpt-5-6

有，而且现在其实正是**最适合做一次“产品级总检查”**的时候。

你现在的 AI Novel Studio 已经不是“能不能写小说”的阶段了，而是在逐渐变成一个真正的**长篇小说操作系统**。这时候最容易漏掉的，反而不是某个按钮，而是一些跨模块的问题。

我按重要程度给你排一下。

---

# 一、我认为目前最重要的 8 个改进

## 1. 「事实」和「AI推测」一定要彻底分开

这是我最建议你增加的一个概念。

现在 Continuity 提取出来的是：

> AI 从正文中认为发生了什么。

但实际上里面可能存在：

### 明确事实

> 林晓走进上海火车站。

### 推断

> 林晓可能已经开始怀疑王教授。

### 不确定

> 王教授似乎知道实验的秘密。

这三个东西的可靠程度完全不同。

所以以后 State 最好有：

```text
Confirmed Fact
Inference
Uncertain
```

但**只有 Confirmed Fact 才进入正式 Continuity Canon**。

这样可以大幅降低 AI“脑补剧情”污染长篇小说的问题。

---

# 2. 增加「为什么 AI 认为这是事实」

这是百万字小说非常重要的东西。

例如 AI 提取：

> 王教授已经知道实验真相。

用户点击以后最好能看到：

> **依据**
>
> 第20章中，王教授看到了实验报告，并做出了相关反应。

甚至可以提供：

**[查看原文]**

直接跳到正文对应位置。

这样用户不是盲目相信 AI。

这是非常适合 AI Novel Studio 的设计：

```text
AI判断
 ↓
依据
 ↓
用户确认
```

而不是：

```text
AI说是这样
 ↓
用户点确认
```

---

# 3. Continuity 不应该只有“人物/世界/时间”

以后最好增加一个非常重要的东西：

## **Knowledge / Information State**

例如：

```text
人物 A 知道：
- 王教授参与实验
- 实验室在上海
- 项目已经失败

人物 B 不知道：
- 王教授参与实验

人物 C 错误地认为：
- 实验已经成功
```

这个对于悬疑、推理、政治、权谋、科幻尤其重要。

你之前的架构其实已经有 `knowledge_json`，这是很好的基础。

但我建议未来把它正式提升成：

> **Character Knowledge Graph**

否则很容易出现：

> 作者让角色不知道某件事，AI却因为“整个 Story Bible 都知道”而让角色直接说出来。

这是长篇 AI 小说最大的逻辑灾难之一。

---

# 4. 「时间」最好升级成真正的 Timeline

现在有：

```text
chapter_time
```

这还不够。

未来最好有：

```text
Story Timeline

2027-03-10
事件 A

2027-03-11
事件 B

2027-03-14
事件 C

2027-03-15
事件 D
```

而且应该支持：

- 绝对时间
- 相对时间
- 时间范围
- 未知时间
- 时间顺序

例如：

> “三天后”

系统不应该直接把它当成一个字符串。

应该理解成：

```text
current_time + 3 days
```

否则写到几百章以后非常容易出现时间矛盾。

---

# 5. Foreshadowing 应该有生命周期

你现在已经有：

```text
foreshow
```

但我认为以后还需要：

```text
Seeded
↓
Developing
↓
Paid Off
↓
Abandoned
```

例如：

> 第12章：发现神秘戒指

它可以成为：

**伏笔 #27**

然后：

```text
首次埋下：Chapter 12
再次强化：Chapter 37
再次提示：Chapter 82
回收：Chapter 146
```

这对百万字小说非常重要。

否则 AI 很容易：

> 埋了 100 个伏笔，然后忘掉 70 个。

---

# 6. Plot Thread 最好也有状态机

不要只是：

> 主线 A

而应该：

```text
Seeded
Active
Escalating
Paused
Resolved
Failed
Abandoned
```

比如：

```text
“寻找父亲”

Chapter 1     Seeded
Chapter 20    Active
Chapter 70    Escalating
Chapter 120   Resolved
```

这样 Writer 才真正知道：

> 这条剧情线现在应该推进，还是暂时不要碰。

---

# 7. 角色不能只有“属性”，还应该有“状态变化”

现在 Character State 很重要。

但我建议未来分成：

### Stable Profile

例如：

```text
姓名
年龄
背景
性格
能力
关系
```

和：

### Dynamic State

例如：

```text
当前位置
当前目标
身体状态
心理状态
已知信息
当前关系
持有物
当前任务
```

否则角色很容易出现：

> 第1章设定 18 岁
> 第200章 AI突然还是按照“高中生”逻辑写。

---

# 8. 需要一个「Canon 冲突中心」

未来非常值得做。

例如：

```text
⚠️ 发现 3 个潜在矛盾

人物：
林晓

Chapter 32：
“林晓从未见过王教授。”

Chapter 87：
“林晓曾经在实验室见过王教授。”

[查看冲突]
```

然后：

```text
确认 Chapter 32 正确
确认 Chapter 87 正确
两者其实语义不同
忽略
```

**不要让 AI 自动修改任何东西。**

它只是告诉作者：

> “这里可能有问题。”

这会是 AI Novel Studio 很核心的高级能力。

---

# 二、我还发现一个非常重要的产品问题

## 「AI到底在什么时候可以主动做事情？」

现在你已经明确：

> AI不能偷偷修改 Canon。

很好。

但未来需要定义一个统一权限模型：

### Read

AI 可以直接：

> 读取。

### Suggest

AI 可以：

> 提议。

### Confirm

用户确认以后：

> 生效。

### Apply

某些修改：

> AI 提议 → 用户确认 → 系统应用。

### Auto

只有极少数完全无风险的事情：

> AI 可以自动完成。

例如：

```text
生成摘要
整理格式
计算字数
```

但：

```text
改变人物设定
改变世界规则
改变剧情
确认 Continuity
```

绝不能 Auto。

这最好成为整个 AI Novel Studio 的**统一权限哲学**。

---

# 三、我建议增加一个「Change Log」

这个非常值得。

例如：

```text
Chapter 20
Continuity

14:32
AI 提取 7 项状态

14:35
用户确认 5 项

14:36
用户拒绝 2 项

14:40
Chapter 20 prose regenerated

14:41
原有 5 项 continuity 标记 stale
```

这样你以后完全知道：

> “为什么系统现在认为这个角色在上海？”

可以一路追溯。

---

# 四、Revision 最终一定要做到“可回滚”

现在已经是 append-only，这是非常好的基础。

但最终 UI 应该允许：

> **恢复到这个版本**

例如：

```text
Chapter 20

Revision 7   当前
Revision 6
Revision 5
Revision 4
```

点击：

**查看差异**

然后：

```text
[恢复这个版本]
```

但是恢复应该生成**新的 revision**，而不是删除历史。

这和 Git 很像。

---

# 五、我建议增加「Impact Center」

你现在已经有：

```text
chapter_impact
state_impact
```

这是非常好的底层机制。

但用户现在不应该看到两个技术名词。

以后可以变成：

> ### 本次修改可能影响 12 个地方

例如：

```text
第20章修改
 ↓

⚠️ 第21章
⚠️ 第24章
⚠️ 人物：王教授
⚠️ 剧情线：实验真相
⚠️ 伏笔：神秘戒指
```

然后：

**[查看影响]**

这是非常强的长篇创作体验。

---

# 六、AI Assistant 最终应该成为“总控制台”

你现在 Assistant V1 已经很好。

但最终我建议它成为整个系统的自然语言入口。

例如用户问：

> “王教授现在知道实验真相了吗？”

Assistant：

> 根据目前已确认的连续性，王教授知道……

---

用户：

> “帮我检查一下林晓和王教授最近20章有没有关系变化。”

Assistant：

> 找到 3 次关系变化……

---

用户：

> “我想让王教授其实从来不知道实验真相。”

Assistant：

> 我发现这会影响第20、37、52章的已确认连续性。
>
> 我可以生成一个修改方案。

然后：

**[生成方案]**

而不是 Assistant 直接改。

这会非常强。

---

# 七、百万字小说还缺一个非常重要的东西

## “作者意图”

这是我认为很多 AI 小说软件都会忽略的。

比如作者明确告诉系统：

> 我希望这部小说整体越来越压抑，但不要变成纯悲剧。

这不是：

- Bible
- Character
- Plot
- Outline

它属于更高层：

### Author Intent / Creative Direction

例如：

```text
整体基调：
压抑 → 希望

节奏：
前期慢
中期加速
后期爆发

主题：
自由 vs 控制

禁止：
不要无意义死亡
不要强行反转
不要靠巧合解决核心冲突
```

Writer 每章都可以获得相关的**小型 Context**。

这会让百万字作品保持“作者的声音”。

---

# 八、还应该有一个「Style Bible」

和 Story Bible 分开。

Story Bible：

> **故事是什么**

Style Bible：

> **这部小说应该怎么写**

例如：

```text
叙事视角：第三人称有限
语言：克制
对白：自然
环境描写：中等
心理描写：高
禁止：
- 网络小说式解释
- 重复情绪
- 过度比喻
- AI腔
```

随着用户修改正文，系统甚至可以逐渐建立：

> **作者写作风格模型**

这是 Writer 2.0 很重要的一部分。

---

# 九、还有一个我认为非常值得加入的机制：Quality Gate

每一章生成以后，不应该只有：

> “生成成功。”

最好自动检查：

```text
Chapter 20 Quality

✓ 达到长度
✓ 所有 Required Events 完成
✓ 没违反 Prohibitions
✓ 时间连续
✓ 人物位置合理
✓ 人物知识没有越界
✓ Plot Thread 有推进
✓ Foreshadow 没被错误回收
⚠ 有 2 个潜在问题
```

然后作者决定：

**[接受]**

或者：

**[查看问题]**

这比单纯让 Writer 自己“写得好”可靠得多。

---

# 十、最后一个很重要：不要让系统越来越复杂

这是我反而最想提醒你的。

你的架构现在已经开始出现：

```text
Story
Volume
Arc
Chapter
Scene

Bible
Continuity
Summary
Impact
Proposal
Revision

Assistant
Timeline
Plot Thread
Foreshadow
Knowledge
...
```

如果全部直接暴露给用户，最后会变成一个**非常复杂的数据库管理软件**。

所以以后一定坚持：

> **底层可以复杂，用户界面必须简单。**

作者真正应该看到的核心东西其实只有：

```text
📖 故事
   ├── 大纲
   ├── 正文
   ├── 人物
   ├── 世界
   ├── 时间线
   ├── 剧情线
   └── 伏笔

🤖 AI 助手

⚠️ 需要注意
```

剩下的：

```text
revision_id
source_prose_revision_id
basis_json
current_revision_id
confirmed_revision_id
state_impact
chapter_impact
```

全部应该隐藏在系统内部。

---

# 如果让我现在重新排优先级

我不会马上把所有东西都做。

我会排成：

### 🔴 P0 —— 长篇小说可靠性

1. **Continuity Handoff UI**
2. **Character Knowledge**
3. **Timeline**
4. **Canon / AI inference 分离**
5. **Revision + 回滚**
6. **Impact Center**
7. **Continuity Contradiction Detection**

### 🟠 P1 —— 真正提高写作质量

8. **Foreshadow Lifecycle**
9. **Plot Thread Lifecycle**
10. **Character Dynamic State**
11. **Chapter Quality Gate**
12. **Author Intent**
13. **Style Bible**

### 🟡 P2 —— 大规模优化

14. **Million-word context optimization**
15. **Relevant Character/World retrieval**
16. **Long-tail summary compression**
17. **Timeline / Plot / Knowledge indexing**
18. **Scene Writer 2.0**

### 🟢 P3 —— 产品体验

19. **Continuity UX V2**
20. **Impact Center UI**
21. **Assistant 全局控制台**
22. **Revision visual diff**
23. **项目仪表盘**

---

## 如果只能让我选三个现在最值得提前考虑的

我会选：

**① Character Knowledge**

因为“谁知道什么”是长篇小说最容易崩的地方。

**② Canon / Inference 分离**

因为 AI 的推测绝不能悄悄变成故事事实。

**③ Impact Center**

因为你已经有 `chapter_impact` / `state_impact`，把它们最终变成用户可理解的“这次修改会影响什么”，会让整个系统一下子从**工程工具**变成真正的**长篇小说创作工具**。

而 **Scene Writer、百万字性能优化、复杂检索**，我反而暂时不会抢着做。你现在最需要先把“**AI 写了什么 → 作者确认了什么 → 后续章节相信什么**”这条因果链做得绝对可靠。

## Prompt:
10/6/2026, 7:28:55 PM

按你的想法做

## Response:
10/6/2026, 7:28:59 PM · gpt-5-6

那就按我刚才的优先级正式推进。我建议把整个项目接下来的路线调整为下面这样，**现在不同时做一堆功能，而是一个阶段一个阶段验收、冻结。**

## 接下来的路线

### 🔴 第一阶段：Continuity Handoff UI V1
**现在就做。**

目标只有一个：

> 用户不用 API、不碰终端，就能完成「提取 → 查看 → 确认 → 下一章读取」。

范围：

- “整理本章变化”入口
- State Review
- 未确认 / 已确认 / 已过期的清晰区分
- 单项确认
- Send Manifest
- 下一章检索验证

**后端不动。**

完成后验收，通过就冻结。

---

### 🔴 第二阶段：Character Knowledge V1

这是我认为下一个最重要的能力。

建立：

> **“谁知道什么”**

例如：

```text
林晓
知道：
- 王教授参与实验
- 实验室位置

不知道：
- 实验真正目的

王教授
知道：
- 实验已经失败

不知道：
- 林晓已经发现真相
```

关键原则：

```text
正文发生
 ↓
AI 提取知识变化
 ↓
用户确认
 ↓
进入 Continuity
 ↓
Writer 根据角色视角读取
```

绝不能因为 Story Bible 里写了某件事情，就让所有角色自动知道。

这一阶段会优先利用你现在已经存在的 `knowledge_json`，**先审计、再决定最小改动，不直接建新系统。**

---

### 🔴 第三阶段：Canon / Inference 分离

这是 AI 长篇小说非常重要的防污染机制。

AI 以后提出：

> “王教授似乎已经开始怀疑林晓。”

不能直接当事实。

分成：

```text
Confirmed Fact
AI Inference
Uncertain
```

只有：

**Confirmed Fact**

才能进入真正的 Continuity。

这样以后 AI 即使判断错了，也不会污染整个百万字小说。

---

### 🔴 第四阶段：Timeline V1

建立真正的小说时间系统。

不仅仅是：

> Chapter 20 = March 14

而是理解：

- 绝对时间
- 相对时间
- 时间跨度
- 事件先后
- 同时发生
- 时间范围
- 未知时间

最终能够发现：

> “这里说三天后，但根据前面确认的时间实际上应该是两天后。”

---

### 🔴 第五阶段：Impact Center V1

把现在底层已经存在的：

```text
chapter_impact
state_impact
```

变成用户真正能理解的东西。

例如：

> **你修改了第20章，可能影响：**

```text
⚠ 第21章人物状态
⚠ 第24章剧情线
⚠ 王教授的人物知识
⚠ “实验真相”剧情线
```

这样用户修改小说时，会真正拥有“全局感”。

---

## 然后才进入第二层

### 🟠 第六阶段：Continuity Contradiction Detection

寻找：

- 时间冲突
- 人物位置冲突
- 人物知识冲突
- 关系冲突
- 世界状态冲突
- Plot Thread 冲突

但原则是：

> **发现问题，不自动修改。**

---

### 🟠 第七阶段：Foreshadow Lifecycle

把伏笔变成：

```text
Seeded
↓
Developing
↓
Reinforced
↓
Paid Off
```

系统能够告诉作者：

> “这个伏笔已经埋了 86 章，还没有回收。”

---

### 🟠 第八阶段：Plot Thread Lifecycle

例如：

```text
Seeded
Active
Escalating
Paused
Resolved
Abandoned
```

Writer 能知道当前哪些剧情线应该推进。

---

### 🟠 第九阶段：Character Dynamic State

把：

**角色档案**

和：

**角色当前状态**

彻底分开。

例如：

```text
Character Profile
姓名 / 年龄 / 背景 / 性格

Dynamic State
当前位置
当前目标
身体状态
心理状态
持有物
关系
已知信息
```

---

### 🟠 第十阶段：Chapter Quality Gate

每章生成之后自动检查：

```text
✓ 长度
✓ Required Events
✓ Prohibitions
✓ 时间
✓ 人物位置
✓ 人物知识
✓ Plot Thread
✓ Foreshadow
✓ Continuity
```

发现问题：

> **⚠ 发现 2 个潜在问题**

而不是直接替作者修改。

---

# 最后才做大型能力

### 🟡 Scene Writer 2.0

这时候才真正值得做 Scene Writer。

因为届时它已经可以获得：

```text
当前 Scene
+
上一 Scene
+
下一 Scene
+
Character State
+
Character Knowledge
+
Timeline
+
Plot Thread
+
Foreshadow
+
Continuity
+
Style Bible
```

那时候 Scene Writer 才会比现在强很多。

---

### 🟡 Million-Word Optimization

最后再处理：

- 长尾 Summary 压缩
- Character/World relevant retrieval
- Timeline indexing
- Plot Thread indexing
- Knowledge indexing
- Outline revision storage
- 大规模 state 查询

**不要现在为了“百万字”提前把数据库复杂化。**

---

# 🟢 最后做 UX V2

等底层能力稳定之后，再把这些工程概念隐藏：

```text
State
Revision
Stale
Impact
Proposal
Manifest
```

作者最终看到的应该只是：

> **AI发现了本章7个重要变化。**

而不是：

> `character_state revision_id=R173 source_prose_revision_id=R81`

---

# 我们现在的状态

可以把项目路线理解成：

```text
                AI Novel Studio
                       │
          ┌────────────┴────────────┐
          │                         │
       创作能力                   可靠性
          │                         │
       Writer                   Continuity
          │                         │
      Scene Writer             Knowledge
          │                         │
      长篇生成                 Timeline
                                    │
                              Contradiction
                                    │
                                Impact
```

而现在最关键的不是继续把 Writer 做得更“聪明”。

而是先让系统做到：

> **AI 写得越多，记忆越可靠；作者修改以后，系统知道哪些东西已经失效；AI 永远分得清“它猜的”和“作者确认过的”。**

这才是你这个项目和普通 AI 写作工具真正拉开差距的地方。

### 所以现在的具体动作

**第一步就执行刚才的 Continuity Handoff UI V1 Cursor Prompt。**

Cursor 做完后：

**不要 commit / push。**

把它的**修改文件、代码说明、测试结果**给我，我先做代码级验收。

通过后，我们冻结：

> **Continuity Handoff V1**

然后进入 **Character Knowledge V1 设计审计**。

这样一步一步推进，不会把现在已经稳定的系统重新搅乱。

## Prompt:
10/6/2026, 7:29:52 PM

后端接口已经够用。我先看现有章节页和发送清单是怎么接的，再只在前端补上提取、查看和确认。

提取结果里的人物和世界要用名字对应到现有条目，确认接口才能对上。我按真实路由做前端审核区，不改后端。

连续性交接的界面已经补上。用户可以在章节页提取未确认状态、逐条确认，然后到下一章用现有的「查看检索」核对。没有改后端，也没有 commit 或 push。

A. 修改了哪些文件
client/src/lib/api.ts
client/src/components/editor/ChapterEditor.tsx
client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.tsx
client/stateReview.test.ts
B. 为什么修改
章节页增加了「提取连续性」。提取沿用现有发送清单：若返回 SEND_NOT_CONFIRMED，先确认清单再重试，不绕过确认。结果标明「未确认草稿」。每条单独确认，成功后重新请求 GET /chapters/{chapter_id}/state。stale 或来源正文已不是当前正文时，显示「已过期，不能确认」并禁用按钮。已确认修订和未确认草稿分开显示；若确认指针仍是旧修订，文案是「有新的未确认版本」。

人物和世界的确认地址用资料库里的名字对应到人物 id 或世界条目 id，因为提取结果里的 subject_id 是状态行 id，而现有确认路由要的是人物或世界条目 id。关系和情节线直接使用 subject_id。章节时间使用来源章节 id。

C. 使用了哪些已有 API
POST /chapters/{chapter_id}/state/extract
POST /model-calls/confirm
GET /chapters/{chapter_id}/state
GET /chapters/{chapter_id}/state/character/{character_id}/revisions，以及 world、time、relationship、thread 的对应历史接口
POST 上述路径的 /confirm，请求体为 { revision_id }
下一章验证仍用现有「查看检索」，没有新的 Context API
D. 是否修改任何 backend
没有。

E. 是否新增 migration
没有。

F. 测试结果
node --experimental-strip-types --test client/stateReview.test.ts：7 passed。前端 tsc -b 通过。

G. 用户现在是否可以完整走完
可以，在同一次打开的章节页里：提取、查看未确认草稿、逐条确认。确认后的状态会出现在「已确认」里。打开下一章后，用已有的「查看检索」看 Writer Pack 是否带上这些状态，并且不含上一章全文。

H. 是否存在未解决缺口
有。后端没有按章列出全部未确认草稿的接口。刷新页面后，从未确认过的主体无法再被发现；已经有确认修订的主体，可以从历史里找回最新的未确认修订。不确认就不会生效，本阶段没有拒绝接口。这些都不需要为了当前界面去改后端。

## Response:
10/6/2026, 7:30:10 PM · gpt-5-6

这个结果整体是 **PASS，可以进入代码级验收**。而且 Cursor 没有擅自扩大范围，这一点很好。

不过我现在不会直接说“完成并冻结”，因为有一个问题值得在冻结前确认：

> **刷新页面后，未确认 State 草稿可能消失。**

这不是后端连续性机制的问题，而是当前 UI 的**可用性缺口**。

### 当前实现评价

| 项目 | 状态 |
|---|---|
| 提取 | ✅ |
| Send Manifest | ✅ |
| 查看 AI 提取结果 | ✅ |
| 单项确认 | ✅ |
| stale 防护 | ✅ |
| current / confirmed 区分 | ✅ |
| N → N+1 读取 | ✅ |
| 后端未被修改 | ✅ |
| migration | ✅ 无新增 |
| 测试 | ✅ 7 passed + tsc |
| 刷新后找回未确认草稿 | ⚠️ 有缺口 |
| Reject | ⏸️ 暂不需要 |

## 我建议现在不要马上改这个刷新问题

原因是我们已经明确：

> **本阶段不为了 UI 缺口去增加后端 API。**

而且如果用户刚刚提取完、正在审核，通常不会主动刷新页面。

所以这个问题可以记录为：

> **Continuity UX V2 / Draft Persistence**

而不是现在扩大 Handoff V1。

---

# 现在做真正的代码级验收

你让 Cursor **不要继续修改**，只把这几个文件的实际 diff 给我们检查：

```text
client/src/lib/api.ts
client/src/components/editor/ChapterEditor.tsx
client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.tsx
client/stateReview.test.ts
```

尤其要检查一个非常关键的问题：

### 人物 / 世界 ID 映射

Cursor 自己特别提到了：

> 提取结果里的 `subject_id` 是状态行 ID，而确认接口要人物/世界条目 ID。

这是本次实现里**最值得审查的地方**。

因为如果映射逻辑稍微有问题，就会出现：

> AI 正确提取了“王教授”，但确认按钮实际上把状态写到了错误的人物。

所以我建议你下一步让 Cursor **只做 diff / code review，不修改代码**。

直接发：

```text id="72416"
现在停止修改代码。

对刚刚完成的 Continuity Handoff UI V1 做一次代码级自审计。

禁止：
- 修改代码
- commit
- push

重点检查以下文件：

client/src/lib/api.ts
client/src/components/editor/ChapterEditor.tsx
client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.ts
client/stateReview.test.ts

重点审计：

1. API 路由是否与 host/state_routes.py 完全一致。

2. State confirmation 的 subject_id 映射：
   - character
   - world
   - chapter_time
   - relationship
   - plot_thread

特别确认：
extract 返回的 subject_id
与 confirm endpoint 所需要的 subject_id / character_id / world_id
是否正确转换。

3. 确认一个 State 是否可能错误影响另一个 State。

4. stale 检查是否只是 UI 防护，真正的后端 freshness check 是否仍然负责最终拒绝。

5. current_revision_id 与 confirmed_revision_id 是否被正确区分。

6. SEND_NOT_CONFIRMED 是否真的重新进入现有 Send Manifest 流程，而不是绕过确认。

7. 提取失败、确认失败、网络失败时，UI 是否错误显示为成功。

8. GET /state 是否被错误地当成未确认草稿列表。

9. 刷新页面后未确认草稿消失的问题是否存在。

10. 下一章是否仍然只读取 confirmed + fresh state，而不会读取 draft state。

11. 是否意外修改了后端逻辑。

12. 是否存在 race condition：
    用户连续点击确认
    或同一 revision 重复确认。

13. 前端 TypeScript 类型是否与实际 API response 一致。

14. 测试是否覆盖了最危险的 subject_id 映射问题。

最终只输出：

A. PASS / FAIL
B. 发现的问题
C. 是否需要修改
D. 如果需要修改，只列最小修改文件和原因

不要修改任何代码。
不要 commit。
不要 push。
```

把这次自审计结果给我。

如果这里 **PASS**，我会建议我们正式把：

> **Continuity Handoff V1**

冻结下来。

然后下一阶段就不再继续折腾 Continuity Handoff，而是进入我认为真正值得做的：

# **Character Knowledge V1 设计审计**

因为从长篇小说可靠性的角度，接下来最重要的问题已经从：

> “系统记不记得发生了什么？”

变成：

> **“系统知道谁知道什么了吗？”**

这会直接决定悬疑、推理、权谋、误会、秘密等复杂剧情以后能不能稳定写到几十万甚至百万字。

## Prompt:
10/6/2026, 7:31:29 PM

我希望最终产品在不影响主要功能的情况下优化用户的体验感

## Response:
10/6/2026, 7:31:33 PM · gpt-5-6

完全赞同。对于 **AI Novel Studio**，我建议把“用户体验”作为贯穿整个开发过程的原则，而不是最后再做一轮 UI 美化。

核心目标应该是：

> **底层可以非常复杂，但作者看到的产品必须非常简单。**

### 我建议以后所有阶段都遵守这 6 条原则

1. **不为了 UI 改坏核心逻辑**
   - 数据库、状态、确认机制、Send Manifest、连续性校验优先保证正确性。
   - UI 优化只能包裹和解释这些机制，不能绕过安全边界。

2. **尽可能隐藏工程术语**

   用户不应该频繁看到：
   - `revision_id`
   - `state`
   - `stale`
   - `subject_id`
   - `current_revision`
   - `confirmed_revision`

   作者更应该看到：
   - **本章发生的变化**
   - **待确认**
   - **已确认**
   - **这条信息来自旧版本正文**
   - **AI 建议**
   - **可能影响后续章节**

3. **让 AI 主动整理，但不擅自决定**

   最理想的感觉是：

   > 写完一章 → AI 帮你整理变化 → 作者快速确认 → 下一章自然继承。

   而不是：

   > 写完一章 → 进入数据库 → 找 State → 找 Revision → 找 Subject → Confirm。

4. **重要操作必须有明确反馈**

   比如“提取连续性”：

   **点击前**
   > 整理本章变化

   **处理中**
   > 正在整理本章发生的变化……

   **完成**
   > 已发现 7 项变化，其中 5 项待确认

   **确认后**
   > ✓ 已加入后续章节记忆

   这种反馈会比单纯的 HTTP 成功提示自然很多。

5. **减少作者需要做的点击**

   尤其是未来：

   - 正文
   - 连续性
   - Story Bible
   - 人物
   - 时间线
   - 情节线
   - 伏笔

   不应该变成六套独立管理系统。

   最终应该逐渐收敛成：

   **写作 → AI 整理 → 作者确认 → 自动进入正确的故事系统。**

6. **复杂功能采用“渐进式展示”**

   默认只显示作者真正需要知道的信息。

   例如：

   > **本章有 6 项故事变化**
   >
   > 陈默的位置发生变化
   > 林雨知道了一个新秘密
   > 两人关系发生变化
   > 主线任务进入下一阶段
   >
   > `查看详情`

   作者点开以后，才看到来源、revision、时间、证据等技术细节。

---

## 我尤其希望我们保留一个原则

**“专业”不等于“复杂”。**

AI Novel Studio 后端最终可能会有：

**Story Bible → Canon → Knowledge → Timeline → Plot Thread → Character State → Continuity → Impact → Quality Gate → Writer**

这一整套非常复杂的系统。

但作者打开软件时，最好感觉不到这些东西。

他应该感觉自己只是在：

> **写小说。**

AI 在后台负责帮他记住世界、人物、时间、秘密和剧情，并在真正有问题的时候提醒他。

---

所以接下来我建议把这个正式加入我们的开发标准：

> **UX 不作为独立的最后阶段，而是每个功能冻结前必须通过的验收项。**

以后每个 V1，我都会同时检查：

**功能正确性 + 数据安全性 + AI 边界 + 作者操作成本 + 信息表达 + 错误反馈 + 是否暴露不必要的工程概念。**

这样最终做出来的不会只是一个“功能很多的小说数据库”，而会更接近真正的 **AI Novel Studio**。

## Prompt:
10/6/2026, 7:42:21 PM

只做代码审计，不改文件。我对照后端路由核对确认地址、草稿展示和失败处理。

FAIL。 人物、世界、时间、关系和情节线的确认地址没有把提取结果里的 subject_id 误当成路由参数。但点击「提取连续性」后，界面会自己调用发送清单确认并立刻重试，用户看不到清单，也不能取消。这一步需要改，现在不要改代码。

B. 发现的问题
发送清单被自动确认。extractWithManifest() 在收到 SEND_NOT_CONFIRMED 之后，直接调用 POST /model-calls/confirm，再带上 manifest_id 重新提取。第一次请求不会打开模型连接，所以没有完全跳过接口。用户却看不到现有的「确认前不会打开连接」面板，也不能拒绝这次发送。这和章节生成里先展示清单、再由用户点确认的流程不一致。

其余核对结果如下。

确认地址与 host/state_routes.py 一致。人物用资料库里同名人物的 id，不用状态行 id。世界条目同样按名字对应 world_entry_id。章节时间用来源章节 id。关系和情节线才使用提取结果里的 subject_id，因为这两个路由要的就是关系 id 和情节线 id。名字不唯一时不发起确认。

一次确认只向一个地址提交一个 revision_id。后端也只移动这一个主体的 confirmed_revision_id。连续点两张卡片，有可能在按钮禁用生效前各发一次请求，但每次仍只确认自己的修订，不会把 A 的修订确认到 B 上。同一条修订再确认一次，只是把指针再次指向同一修订。

stale === 1，或来源正文不是当前 payload.prose.id 时，按钮禁用。真正拒绝仍是确认接口里的 revision_is_fresh()，失败时界面保留错误，不会把卡片改成已确认。

已确认和未确认是分开的。GET /chapters/{chapter_id}/state 只用来画「已确认」。草稿来自提取返回的 proposals，或历史里最新且不等于 confirmed_revision_id 的修订。文案是「未确认草稿」或「有新的未确认版本」，没有把 current 写成已确认。

提取或确认抛错时只设置错误文字，不把结果标成成功。STATE_SOURCE_STALE 有对应文案。

下一章仍只读已确认且新鲜的状态。这次改动没有碰到 Pack、切片或 Writer。也没有改任何 Python 文件。

刷新后，从未确认过的主体会从面板消失。GET /state 不返回它们，历史接口又必须先知道人物或世界条目 id。已经有确认修订的主体，可以从历史里找回最新草稿。这是现有 API 的缺口，不是这次路由写错。

另外，历史里找不到指定修订时，revisionOf() 会退回最新一条的正文来展示，确认仍提交原来的 revision_id。用户可能看着另一条内容点确认。测试覆盖了人物名字不能误用 subject_id，以及情节线使用 subject_id。世界条目和时间的路由没有单独测试，代码与人物、来源章节的规则一致。

C. 是否需要修改
需要。只改前端，不改后端。

D. 最小修改文件和原因
client/src/components/continuity/stateReview.ts：收到 SEND_NOT_CONFIRMED 时只把清单交还界面，不要在这一步替用户调用确认。
client/src/components/continuity/StateReview.tsx：展示现有发送清单，等用户点确认后再带 manifest_id 重试提取。历史里找不到该修订时，不要改用另一条修订的正文。
client/stateReview.test.ts：锁住「未确认发送时不会自动确认清单」。
刷新后首次草稿消失，不能靠再改前端补上，除非新增按章列出草稿的接口。这次不要加。

## Response:
10/6/2026, 7:42:31 PM · gpt-5-6

这个审计结果非常明确：**FAIL，而且确实应该修。**

最关键的问题不是视觉，而是**权限/确认体验被破坏了**：

> 用户点击「提取连续性」≠ 用户同意向模型发送这次内容。

现在代码把 `SEND_NOT_CONFIRMED → 自动 confirm → retry` 串起来了，这与我们之前确定的 **Send Manifest 是所有模型调用的明确用户授权点** 相冲突。

### 我同意 Cursor 给出的最小修改范围

只改：

```text
client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.tsx
client/stateReview.test.ts
```

**不改后端、不加 migration、不碰 Pack / Continuity / Writer。**

目标应该严格变成：

```text
点击「提取连续性」
        ↓
需要发送清单？
        ↓
展示现有 Send Manifest
        ↓
用户明确点击「确认发送」
        ↓
POST /model-calls/confirm
        ↓
重新执行 extract
        ↓
展示「未确认草稿」
        ↓
用户逐条确认 State
```

而不是：

```text
点击提取
 ↓
发现没确认
 ↓
AI 自动替用户确认
 ↓
直接发送
```

### 还有一个我认为必须一起修掉的小问题

Cursor 提到：

> 历史里找不到指定 revision 时，`revisionOf()` 会退回最新一条正文展示。

**这个必须禁止。**

因为这会产生非常危险的 UI 错觉：

> 用户看到的是 Revision B，
> 但点击确认实际上确认的是 Revision A。

即使后端最终确认的是正确的 `revision_id`，这个 UI 仍然是不可信的。

正确行为应该是：

> 找不到目标 revision → 显示「无法加载此版本」→ 禁止确认。

**绝对不能 fallback 到另一条 revision。**

---

## 我建议你现在给 Cursor 这个修改指令

```text
现在只修复刚才代码审计发现的两个前端问题。

禁止：
- 修改任何 Python/backend 文件
- 新增 migration
- 修改 API contract
- 修改 Pack / continuity slicing / Writer
- commit
- push
- 顺便做其他 UX 改动

只允许修改：

client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.tsx
client/stateReview.test.ts

问题 1：SEND_MANIFEST 不得自动确认

当前 extractWithManifest() 在收到 SEND_NOT_CONFIRMED 后，会自动：

POST /model-calls/confirm
然后重新 POST /state/extract。

这是错误的。

正确行为：

1. 第一次调用 extract。
2. 如果返回 SEND_NOT_CONFIRMED：
   - 不调用 POST /model-calls/confirm
   - 不重新执行 extract
   - 将后端返回的发送清单/manifest 信息交给 UI。
3. UI 展示现有的 Send Manifest 确认界面。
4. 用户明确点击「确认发送」后：
   - 才调用 POST /model-calls/confirm
   - 成功后才重新调用 POST /chapters/{chapter_id}/state/extract
5. 用户取消时：
   - 不确认 manifest
   - 不调用 extract
   - 不产生任何模型调用。
6. 必须沿用章节生成已经使用的现有 Send Manifest UI/交互，不要重新设计一套新的确认机制。

目标：
「提取连续性」只是提出一次模型调用请求。
真正的发送授权必须由用户明确完成。

问题 2：revisionOf() 不允许错误 fallback

当前如果指定 revision_id 在历史中找不到，revisionOf() 会退回最新 revision 的正文。

这是不安全的。

修改为：

- 指定 revision_id 找不到：
  - 不使用其他 revision 的正文
  - 显示「无法加载此版本」或等价错误状态
  - 禁止确认按钮
  - 不提交 confirm 请求。
- revision_id 找到：
  - 只展示这个 revision 的内容
  - confirm 必须提交同一个 revision_id。

绝对不要让用户看到 Revision B 的内容，却确认 Revision A。

测试必须新增/修改：

1. SEND_NOT_CONFIRMED 时：
   - 不调用 /model-calls/confirm
   - 不自动 retry extract
   - UI 可以拿到 manifest 并等待用户确认。

2. 用户明确确认 manifest 后：
   - 调用 /model-calls/confirm
   - 再调用 extract
   - 最终显示 proposals。

3. 用户取消 manifest：
   - 不调用 confirm
   - 不调用第二次 extract。

4. revision_id 找不到：
   - 不 fallback 到最新 revision
   - 确认按钮 disabled
   - 不调用 state confirm endpoint。

5. 正常 revision：
   - 展示对应 revision
   - confirm 使用完全相同的 revision_id。

完成后：
- 运行 stateReview.test.ts
- 运行前端 tsc -b
- 不 commit
- 不 push

最后只报告：
A. 修改文件
B. 修改原因
C. 测试结果
D. 是否还有已知缺口

不要继续修改其他问题。
```

### 这次修完以后

再把 Cursor 的结果给我。

我会再做一次**只读代码审计**。如果这次 PASS，我们就可以正式：

> **冻结 Continuity Handoff UI V1**

然后进入 **Character Knowledge V1 Design Audit**。

而你刚才提出的“最终产品要优化体验感”，我也会从这一阶段开始正式纳入每次验收——尤其是 **Send Manifest、AI 建议、确认、错误、过期状态**这些作者最容易产生困惑的地方。

## Prompt:
10/6/2026, 7:48:42 PM

只修这两处：发送清单必须等用户点确认，找不到指定修订时不再改用别的正文。先看现有发送确认是怎么接上的。

发送清单会停在现有的确认面板上，等用户点「确认并发送」才继续。找不到指定修订时，不再改用别的正文，确认按钮也会关掉。

我先核对这三个前端文件的当前实现，再跑测试和类型检查。

测试还在调用已删除的 extractWithManifest，而且版本缺失时确认按钮仍会被藏起来。我只改这三个允许的文件，把发送确认和版本查找收紧。

A. 修改文件
client/src/components/continuity/stateReview.ts
client/src/components/continuity/StateReview.tsx
client/stateReview.test.ts
B. 修改原因
「提取连续性」在收到 SEND_NOT_CONFIRMED 后不再自动调用 /model-calls/confirm，也不再自动重试 extract。界面沿用章节生成的发送清单文案和「确认并发送」；只有用户点击后才确认 manifest，成功后再 extract。取消只清掉待确认清单，不发请求。

指定的 revision_id 在历史中找不到时，不再退回最新 revision。界面显示「无法加载此版本」，确认按钮为 disabled，并且不会提交 state confirm。找到时只展示该 revision，confirm 提交同一个 revision_id。

C. 测试结果
node --experimental-strip-types --test client/stateReview.test.ts：11 通过，0 失败。
client 目录 npx tsc -b --pretty false --noEmit：通过。
未 commit，未 push。
D. 是否还有已知缺口
有。刷新后，从未确认过的提取结果无法重新列出：GET /chapters/{id}/state 只返回已确认且仍然有效的状态，没有按章节列出草稿的接口。这次没有改后端，也没有补拒绝接口。