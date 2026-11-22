## Response:
10/5/2026, 1:43:05 PM · gpt-5-6

> **审核契约逻辑**
>
> 我正在检查契约中的一致性。主要疑点是“同一来源正文对应两个已确认关系主体”似乎与单一 `confirmed_revision_id` 指针冲突；还需明确旧修订的状态变化，以及章节自身状态影响的定义。
>
> 思考了 4s

我认真按 **Stage 2A 冻结契约 + Stage 2B 实现可执行性**重新审了一遍。

## 结论

**Stage 2B Contract v1 基本可以冻结，但我建议先修 4 个非常小的契约歧义，再进入数据库/代码实现。**

整体已经从上一版的“架构方案”提升到了真正可以交给 Cursor Agent 实现的 **Contract v1**。核心边界已经非常清楚，我不建议再扩大功能范围。

### 已经可以冻结的部分

以下我认为都已经正确：

- ✅ Stage 2A 完全作为不可破坏的基础层
- ✅ Outline 仍然是唯一计划权威
- ✅ prose_revision 仍然是正文唯一权威
- ✅ chapter_summary 仍然是自动、本地、无模型的连续性
- ✅ Stage 2B 状态必须来自具体 prose revision
- ✅ confirmed + fresh + same branch 才能进入 Writer Pack
- ✅ prose 保存不会自动抽取状态
- ✅ carry-forward 不自动发生
- ✅ extract 必须用户主动触发
- ✅ extract 必须 Send Manifest
- ✅ 不允许 FakeProvider
- ✅ branch isolation 已经明确
- ✅ carry-forward 的 `no_new_evidence` 语义已经正确
- ✅ provenance 完整
- ✅ stale revision 永不删除
- ✅ state impact 不会自动触发 extraction
- ✅ 不允许 Stage 2B 自动改写正文
- ✅ 不引入 Scene table / Arc / Vector / Web / Copyright / Cost 等 2C 功能
- ✅ Writer Pack 不包含其他章节完整正文
- ✅ Stage 2A 项目没有 Stage 2B 数据时，行为保持不变

这已经是一个很干净的 **State Layer v1**。

---

# 但有 4 个地方最好在冻结前修掉

## 1. `RELATIONSHIP_BROKEN` 的“两个 confirmed bodies”定义有冲突

你现在写：

> two confirmed bodies exist for the same pair and the same source prose

但前面又规定：

> Confirm moves confirmed_revision_id.

也就是说一个 `relationship` 只有一个：

```text
confirmed_revision_id
```

因此正常情况下，**同一个 relationship 不可能同时存在两个“confirmed_revision_id”**。

历史 revision 可以存在多个，但只有一个是当前 confirmed。

### 建议改成

把：

> two confirmed bodies exist for the same pair and the same source prose

改成：

> two conflicting candidate revisions exist for the same pair and the same source prose, and the conflict cannot be resolved to a single revision.

或者更简单：

> Two conflicting relationship proposals from the same source prose revision exist and have not been resolved.

这样和 `STATE_CONTRADICTION` 的逻辑也更一致。

---

# 2. `state_impact` 需要明确唯一性，否则重复操作可能制造大量重复 impact

现在规定：

> Each later chapter ... receives a state_impact row

但没有明确：

**同一个后续章节 + 同一个源章节 + 同一个源 prose revision，能不能有多条 impact？**

例如：

```text
Chapter 4 changed
→ Chapter 5 impact

Chapter 4 changed again
→ Chapter 5 impact

Chapter 4 changed again
→ Chapter 5 impact
```

如果每次都 INSERT，就会出现：

```text
Chapter 5
  impact A
  impact B
  impact C
```

这对 UI 和 API 都不太好。

### 我建议明确：

一个未解决的 impact 唯一对应：

```text
(project_id,
 branch_id,
 chapter_id,
 source_chapter_id,
 source_prose_revision_id)
```

或者更严格一点：

> For a given dependent chapter and source prose revision, there is at most one unresolved state_impact row.

旧 impact 可以保留历史，但不能重复创建同一个未解决依赖。

这样符合你整个 Stage 2A / 2B 的：

> history preserved, unresolved dependency singular

原则。

---

# 3. `carry-forward` 的 API 还缺一个“到底复制哪些字段”的定义

这是目前最值得补的一处。

你写：

> POST /chapters/{chapter_id}/state/carry
> It inserts unconfirmed author=local children for subjects...

但是服务器需要知道：

例如 Character A：

```text
location = School
goal = Find X
condition = Injured
knowledge = knows Y
```

用户点击 Carry Forward 时，到底是：

### A. 全部复制？

还是：

### B. 用户选择字段？

还是：

### C. 系统只复制“没有新证据”的字段？

你的 Contract 已经定义了：

> delta_json for each copied field is the marker no_new_evidence.

所以我建议明确采用：

**C + 显式字段集合。**

例如请求逻辑概念上是：

```text
carry character_state
character_id = X
fields = [location, current_goal, condition]
```

服务器：

- 找到上一份 confirmed fresh revision
- 只复制指定字段
- 每个复制字段写 `no_new_evidence`
- 创建 `author=local`
- 不确认
- 不进 Writer Pack

这样以后 UI 可以做到：

> Carry forward:
> ☑ Location
> ☑ Goal
> ☐ Condition
> ☑ Knowledge

而不是把整个角色状态盲目复制。

### 契约可以补一句

> Carry-forward operates on an explicit field set. The client identifies the subject and fields to carry forward; the server resolves the source revision and creates the local child revision.

这句话就够了，不需要设计复杂 API。

---

# 4. “Chapter N changes → state from N onward stale”最好把 N 自己的 impact 语义说死

你现在 E 部分写：

> Each later chapter on that branch receives a state_impact row with needs_sync.

但 J 又写：

> Changing chapter 4’s prose stales state from chapter 4 onward.

这两个其实不完全矛盾：

- Chapter 4 自己的 state revision → **stale**
- Chapter 5–10 → **state_impact needs_sync**

但最好直接写清楚。

### 推荐定义

当 Chapter N 当前 prose 改变：

```text
Chapter N:
    Stage 2B revisions sourced from N → stale
    no later-chapter impact required

Chapter N+1 ...:
    state_impact = needs_sync
```

这样非常干净。

同时：

```text
Chapter N 的 state
```

如果用户重新 extract Chapter N，则可以产生新的 proposal。

---

# 我建议最终增加一个非常短的“K. Normative Clarifications”

不要重新写整份 Contract，只在末尾增加：

### K. Normative Clarifications

1. **Relationship conflict**

> A relationship cannot have two simultaneously confirmed current revisions. `RELATIONSHIP_BROKEN` applies to conflicting unresolved relationship proposals from the same source prose revision, or to a dangling endpoint on the active branch.

2. **State impact uniqueness**

> For a dependent chapter and a given source prose revision, there is at most one unresolved `state_impact`. Historical resolved impacts remain readable.

3. **Carry-forward field selection**

> Carry-forward operates on an explicit subject and field set. The server resolves the source confirmed fresh revision and creates `author=local` child revisions with `no_new_evidence` markers for the copied fields.

4. **Source-chapter invalidation**

> When chapter N prose changes, Stage 2B revisions sourced from chapter N become stale. Later chapters N+1 onward receive `needs_sync` state impacts. No state impact is required for chapter N itself solely because its own source became stale.

---

# 最终判断

如果加入这 4 条，我会给它：

## **STAGE 2B CONTRACT v1 — ACCEPTED / FROZEN**

而且我建议这次**真的冻结，不要再继续设计功能**。

下一阶段应该直接进入：

> **Stage 2B Implementation**

实施顺序最好严格按照：

```text
1. Migration
        ↓
2. Models / repositories
        ↓
3. Revision + freshness engine
        ↓
4. Carry-forward
        ↓
5. State impact
        ↓
6. Confirm + conflict validation
        ↓
7. Explicit extraction
        ↓
8. Writer Pack integration
        ↓
9. API
        ↓
10. Frontend
        ↓
11. Tests
        ↓
12. Real Grok E2E acceptance
```

尤其要保持你 Stage 2A 已经验证过的原则：

**先把数据库/规则/测试做正确，再接真实 Grok。**

另外，Stage 2B 的 `extract` **不要因为“既然已经有状态系统了”就顺手做成自动抽取**。这是这一阶段最容易发生的架构越界之一。你现在的 Contract 对这一点已经定义得非常漂亮，应该保持。

## Prompt:
10/5/2026, 1:44:38 PM

我需要做什么

## Response:
10/5/2026, 1:44:41 PM · gpt-5-6

你现在**不用自己改代码**。你现在要做的是让 Cursor Agent 按这个 Contract 进入 Stage 2B 实现。

### 第一步：先把 Contract v1 做最后 4 个小修正

把我上一条提到的 **K. Normative Clarifications** 加到你的 Stage 2B Contract 后面。

如果你不想手动改文档，可以直接把下面这段复制给 Cursor Agent：

```text
Before implementation, update the Stage 2B Contract v1 with the following four normative clarifications only.

1. Relationship conflict
A relationship cannot have two simultaneously confirmed current revisions. RELATIONSHIP_BROKEN applies to conflicting unresolved relationship proposals from the same source prose revision, or to a dangling endpoint on the active branch.

2. State impact uniqueness
For a dependent chapter and a given source prose revision, there is at most one unresolved state_impact. Historical resolved impacts remain readable.

3. Carry-forward field selection
Carry-forward operates on an explicit subject and field set. The server resolves the source confirmed fresh revision and creates author=local child revisions with no_new_evidence markers for the copied fields.

4. Source-chapter invalidation
When chapter N prose changes, Stage 2B revisions sourced from chapter N become stale. Later chapters N+1 onward receive needs_sync state impacts. No state impact is required for chapter N itself solely because its own source became stale.

Do not change any other Stage 2B scope or behavior.
Do not implement code yet.
Do not create or modify the database migration yet.
Do not commit or push.
After updating the contract, output the final Stage 2B Contract v1 and a concise list of frozen invariants.
```

---

### 第二步：让 Cursor 只做 Contract 验收

Cursor 返回以后，你把**完整结果复制给我**。

我会帮你检查：

- 有没有偷偷扩大 Stage 2B 范围
- 有没有破坏 Stage 2A
- branch isolation 是否完整
- revision/freshness 是否自洽
- carry-forward 是否安全
- state impact 是否会产生重复
- Writer Pack 是否可能把 stale/unconfirmed 状态送给模型
- extraction 是否仍然严格 Send Manifest
- 有没有提前混入 Stage 2C

**这一步不要让 Cursor 写代码。**

---

### 第三步：我确认后，再让 Cursor 开始实现

到时候我会给你一条专门的 **Stage 2B Implementation Prompt**。

实现时建议让 Agent 按这个顺序：

```text
Contract
  ↓
Migration
  ↓
DB / Repository
  ↓
Freshness / Revision Engine
  ↓
State Impact
  ↓
Carry-forward
  ↓
Conflict Validation
  ↓
Confirm
  ↓
Explicit Extraction
  ↓
Writer Pack
  ↓
API
  ↓
Frontend
  ↓
Tests
  ↓
Real Grok E2E
```

**现在不要直接让它“实现全部 Stage 2B”。**

先完成第一步，把 Cursor 的 Contract 更新结果给我。

## Prompt:
10/5/2026, 1:48:49 PM

A. Final Stage 2B Contract v1
Stage 2B adds confirmed, chapter-sourced situation on top of the frozen Stage 2A engine. The author bible stays in character and world_entry. The plan stays in confirmed outlines. The text stays in immutable prose_revision. Local continuity stays in chapter_summary. Stage 2B records how people, places, relations, clocks, and plot threads stand after a specific prose revision, on one branch.

A Stage 2B fact is authoritative for the Writer Pack only when all of these are true:

It is the single confirmed current revision of its subject.
It is fresh relative to the current prose chain on that branch.
Its subject belongs to the same project_id and branch_id as the chapter being written.
Anything else is history, a proposal, or a review dependency. It is not injected as current truth.

Prose save writes local continuity and refreshes dependency marks. It does not extract state, does not carry state forward, and does not rewrite any chapter.

B. Explicit frozen invariants inherited from Stage 2A
These stay in force and are not redefined by Stage 2B:

Confirmed story, volume, and chapter outline revisions are the only outline authority.
reading_order is story order. global_index is creation order.
chapter_summary is local continuity, derived on prose save without a model, and injectable only when it matches the current prose revision.
chapter_impact keeps its Stage 2A source types and statuses. Stage 2B does not extend that check and does not reuse chapter.impact_status for state.
No other chapter’s full prose enters the Writer Pack.
The server assigns every id. The model does not supply project_id, chapter_id, or revision ids.
Cloud extraction requires a confirmed Send Manifest for that call. There is no FakeProvider fallback and no grant that skips the manifest.
OUTLINE_NOT_CONFIRMED is unchanged and still gates prose generation.
A project with no Stage 2B rows generates, splits, continues, and packs exactly as Stage 2A.
Impact acceptance and state acceptance never rewrite prose.
Scene sketches remain the scenes list inside the confirmed chapter outline. There is no scene table.
There is no arc entity, vector search, web research, copyright system, cost system, second router, automatic state extraction, or story-wide simulation.
C. Final database entities and relationships
Subject identity rows are branch-scoped. A row on one branch is invisible to every other branch. Packs, carry-forward, extraction, and conflict checks read only the chapter’s branch.

Entity	One identity per	Body
character_state
(project_id, branch_id, character_id)
Pointers only: current_revision_id, confirmed_revision_id
character_state_revision
revision id
Immutable situation after one prose revision
world_state
(project_id, branch_id, world_entry_id)
Pointers only
world_state_revision
revision id
Immutable condition of that bible entry
world_referent
(project_id, branch_id, id)
Unresolved name introduced by prose. Optional user link to an existing world_entry. Not a place, organization, or object table
chapter_time
(project_id, branch_id, chapter_id)
Pointers only
chapter_time_revision
revision id
Immutable clock bound for that chapter
relationship
(project_id, branch_id, subject_character_id, object_kind, object_id)
Pointers only. object_kind is character or world_entry. Exactly one confirmed_revision_id
relationship_revision
revision id
Immutable stance after one prose revision
plot_thread
(project_id, branch_id, id)
Pointers only. The thread id is the subject
plot_thread_revision
revision id
Immutable status: setup, active, payoff, abandoned
state_impact
one unresolved row per (chapter_id, source_prose_revision_id)
Dependency mark on a later chapter
state_conflict
conflict id
A finding. It changes neither prose nor state
world_entry remains the only canonical record of locations, organizations, and objects. Organizations are entries whose entry_type is faction or polity. Objects are entries whose entry_type is custom or other. Places are entries whose entry_type is geography.

character_state_revision fields: location_text, optional location_world_entry_id, current_goal, knowledge_json, condition_text, delta_json, server-rendered markdown, plus provenance fields in section D.

world_state_revision fields: condition_text, optional holder_character_id, delta_json, markdown, plus provenance.

chapter_time_revision fields: relative_label, optional absolute_start, optional absolute_end, optional duration_text, flashback as 0 or 1, optional follows_chapter_id, plus provenance. In-chapter event order stays in chapter_summary.key_events.

relationship_revision fields: stance, summary, markdown, plus provenance. The relationship row’s confirmed_revision_id is the only confirmed current revision. A second revision may exist as history or as an unconfirmed proposal. It is not a second confirmed current.

plot_thread_revision fields: status, setup_chapter_id, optional payoff_chapter_id, summary, plus provenance. payoff_chapter_id has reading_order greater than or equal to setup_chapter_id on the same branch.

world_referent fields: name, referent_kind (location, organization, object, condition), introduced_chapter_id, introduced_prose_revision_id, optional world_entry_id. Linking sets that optional id. It does not insert a world_entry and does not rewrite old revisions.

For a dependent chapter and one source prose revision, at most one state_impact row has a null resolved_at. Resolved impacts stay readable.

No Stage 2B table stores a confidence score, a probability, or a vector.

D. Revision semantics
Revision bodies are insert-only. Confirm moves confirmed_revision_id. A new fact supersedes an old one by inserting a child with parent_revision_id. Parents stay readable. Each subject has at most one confirmed current revision, held by that single pointer.

Every revision stores:

source_chapter_id
source_prose_revision_id
its own revision id
author: user, local, or extractor
author=local means carry-forward. Each copied field in delta_json is the marker no_new_evidence. That marker means this prose has not supplied a change to the field. It does not mean the prose proves the field is still true.

author=extractor is a proposal from an explicit extract call. author=user is a proposal or correction written by the user. Both stay unconfirmed until confirm.

A revision is fresh only when:

source_prose_revision_id is still the source chapter’s current prose revision, and
every earlier chapter on that branch, in reading_order, still has the current prose revision that was already current when this revision was built.
The as-of revision for a subject at chapter N is the latest confirmed fresh revision on that branch whose source chapter has reading_order less than N, or equal to N when N’s own revision is confirmed. If none exists, the subject is absent from the pack.

Carry-forward is POST /chapters/{chapter_id}/state/carry. The request names an explicit subject and an explicit field set. The server resolves that subject’s confirmed fresh revision on this branch and inserts one unconfirmed author=local child. The child copies only the named fields and marks each of them no_new_evidence. Fields outside that set are not copied. Carry-forward does not run on prose save. It does not enter the Writer Pack before confirm. It makes no model call.

E. Invalidation semantics
state_impact means a later chapter’s dependency needs review or synchronization. It is not an instruction to re-extract that chapter, and the invalidation itself does not create a state revision.

When the current prose revision of chapter N changes:

Chapter N’s local continuity is recomputed locally, with no model call.
Stage 2B revisions whose source_chapter_id is N become stale.
Each later chapter, N+1 onward on this branch in reading_order, gets needs_sync for N’s new prose revision.
For that dependent chapter and that source prose revision, there is at most one unresolved state_impact. If one is already unresolved, the server does not insert another. Resolved impacts for older source prose revisions remain readable.
Chapter N does not receive a state_impact solely because revisions sourced from N became stale.
No later prose revision is rewritten.
No extractor call is started.
No carry-forward revision is inserted.
Confirmed pointers are not moved to a newly invented body. Packing skips revisions that are not fresh and uses the latest confirmed revision that is still fresh. If none is fresh, that subject is omitted.
An outline-only edit uses Stage 2A chapter_impact only. It does not stale Stage 2B revisions whose source prose is still current.

state_impact.impact_status is needs_review or needs_sync. resolved_by is accept or reextract. Accept closes the row and does not recompute state. reextract is recorded only after the user separately completes an explicit extract and confirms a new revision. The impact row never launches that call.

Stale revisions remain in history. They are not deleted and they are not packed.

F. Writer Pack contract
Only confirmed fresh Stage 2B revisions from the chapter’s own branch are packed. Each subject contributes at most its one confirmed current revision, and only when that revision is fresh.

Excluded from authoritative blocks:

unconfirmed proposals, including carry-forward
stale revisions
revisions from another branch
unresolved world_referent rows whose world_entry_id is null
full history of a subject
any other chapter’s full prose
Unlinked referents are not shown as world state and are not turned into world_entry rows.

Stage 2B blocks sit after the confirmed outline blocks and scene sketch, and before the Stage 2A windowed chapter_summary blocks. Character cards and world-entry definitions stay in their Stage 2A positions, labeled as definitions. State blocks are labeled as situation.

Order and caps:

At most two chapter_time bounds: this chapter, if confirmed and fresh, and the previous chapter’s confirmed fresh bound.
At most eight plot_thread lines: confirmed fresh threads in setup or active whose setup chapter is before this chapter.
At most eight character_state blocks: characters named by the confirmed chapter outline, plus characters whose confirmed state changed in the previous three chapters.
At most six world_state blocks: the same selection rule, using world entries.
At most eight relationship_state blocks touching those characters.
Each block’s id is the state revision id. The block also carries source_chapter_id and source_prose_revision_id. Kinds are chapter_time, plot_thread, character_state, world_state, and relationship_state.

If a kind has no confirmed fresh row, that kind is omitted. Generation still depends only on the Stage 2A outline gate.

G. API contract
Client bodies do not carry revision identity. The server sets source_chapter_id and source_prose_revision_id from the chapter’s current prose on that chapter’s branch.

GET /chapters/{chapter_id}/state returns confirmed fresh state as of that chapter on its branch. Arrays are empty when no such rows exist.
POST /chapters/{chapter_id}/state/carry takes an explicit subject and field set. The server resolves the confirmed fresh source revision and writes one unconfirmed author=local child with no_new_evidence on the copied fields. No model call.
POST /chapters/{chapter_id}/state/extract is the only extraction entry. It is user-triggered and send-gated. allow_fake defaults to false. SEND_NOT_CONFIRMED writes no revision and opens no provider connection.
Confirm endpoints, one per subject: character state, world state, chapter time, relationship, plot thread. Each confirms one revision id and leaves exactly one confirmed current pointer.
GET revision lists return history, including stale rows and resolved impacts, for that branch only.
GET /chapters/{chapter_id}/state-impact and POST /chapters/{chapter_id}/state-impact/accept.
GET /projects/{project_id}/state-conflicts, filtered to the project’s active branch.
POST /world-referents/{referent_id}/link sets world_entry_id on that branch. It does not create a bible entry.
Confirm of a revision whose prose source is no longer current returns STATE_SOURCE_STALE and makes no model call.

H. Conflict contract
state_conflict is insert-only except resolved_at and resolved_by (accept or new_revision). A conflict does not change prose, pointers, or other branches.

Code	Raised when	Confirm
STATE_CONTRADICTION
Two proposals from the same prose revision disagree, or a proposal contradicts a confirmed fresh revision on the same branch
Refused until the user confirms one new child revision
TIMELINE_IMPOSSIBLE
flashback is 0 and the follow target is not an earlier chapter on this branch, or absolute bounds put a later non-flashback chapter before an earlier chapter’s end
Refused
RELATIONSHIP_BROKEN
Two or more unresolved relationship proposals from the same source prose revision conflict, or an endpoint does not exist on the active branch
Refused
THREAD_UNRESOLVED
A project report finds a confirmed thread still setup or active after the last chapter
Not raised at generation time
A relationship has one confirmed current revision, the row’s confirmed_revision_id. The contract does not represent two simultaneously confirmed current revisions, and RELATIONSHIP_BROKEN is not used for that case.

Missing absolute time is valid. The clock stays relative. THREAD_UNRESOLVED does not block generation.

I. Backward compatibility contract
Stage 2A projects with no Stage 2B rows keep their prose ids, summary ids, outline ids, and pack kinds.
New tables are empty. New nullable links on old rows stay null.
OUTLINE_NOT_CONFIRMED, split registration, stale outline confirmation, and local continuity stay as accepted in Stage 2A.
chapter_impact source types remain own_outline, upstream_prose, upstream_outline, and story_outline.
Cloud memory stays optional and is not required for continuity or for Stage 2B.
A second apply of the Stage 2B migration, when it later exists, must add nothing to a database that already has it. This contract does not create that migration.
J. Stage 2B acceptance criteria
A Stage 2A project with confirmed outlines and no Stage 2B rows generates. The pack has Stage 2A kinds only. Prose and summary ids are unchanged. OUTLINE_NOT_CONFIRMED is unchanged when outlines are missing.
Prose save on chapter N recomputes N’s local continuity and marks Stage 2B revisions sourced from N stale. Chapters N+1 onward gain at most one unresolved needs_sync impact for N’s new prose revision. Chapter N gains no state_impact solely for that reason. The save inserts no state revision, starts no extract, and leaves later prose revision ids unchanged. A second save against the same new prose revision does not insert a second unresolved impact. Resolved impacts remain readable.
Accepting state_impact closes that row and does not create a revision, move a confirmed pointer, or change prose.
Carry-forward with an explicit subject and field set inserts one unconfirmed author=local child. The server copies those fields from the resolved confirmed fresh revision and marks each copied field no_new_evidence. Fields not in the set are absent from the child. The child stays out of the Writer Pack until confirm. No model call and no Send Manifest occur.
After confirm, a later chapter on the same branch packs that revision. The block id is the revision id, and the block’s source_chapter_id and source_prose_revision_id match the row. The subject still has exactly one confirmed_revision_id.
A confirmed revision on another branch is not packed and is not returned by this branch’s GET /chapters/{id}/state.
Uniqueness holds for (project_id, branch_id, character_id), (project_id, branch_id, world_entry_id), and (project_id, branch_id, subject_character_id, object_kind, object_id).
An unlinked world_referent is not packed as world_state and does not create a world_entry.
Explicit extract with no confirmed manifest returns SEND_NOT_CONFIRMED, writes no revision, and does not use FakeProvider.
Confirm of a revision whose source prose is no longer current returns STATE_SOURCE_STALE with no model call.
An impossible non-flashback time returns TIMELINE_IMPOSSIBLE and does not confirm. A missing absolute time still confirms.
Two unresolved relationship proposals from the same source prose revision return RELATIONSHIP_BROKEN. Neither becomes the confirmed current revision. A relationship whose endpoint is missing on the active branch also returns RELATIONSHIP_BROKEN.
A thread left active after the last chapter is reported as THREAD_UNRESOLVED and does not block generation.
A ten-chapter chain uses reading_order. Changing chapter 4’s prose stales revisions sourced from chapter 4, opens one unresolved needs_sync impact on each later chapter for that new prose revision, creates no state impact on chapter 4 for that reason, creates no later state revisions, and does not special-case chapters 1 and 2.
The Writer Pack for that chain still excludes every other chapter’s full prose, and the Stage 2A last-three full summaries plus earlier one-line events remain in force.
Frozen invariants
Stage 2A outlines, reading_order, global_index, chapter_summary, chapter_impact, the prose ban in the Writer Pack, server-owned ids, Send Manifest, no FakeProvider fallback, and OUTLINE_NOT_CONFIRMED stay as accepted.
A project with no Stage 2B data behaves exactly as Stage 2A.
character_state is one identity per (project_id, branch_id, character_id). world_state is one identity per (project_id, branch_id, world_entry_id). Relationship identity includes the same branch pair. No branch’s state is injected into another branch.
world_entry is the only canonical world, location, and organization record. world_referent is only an unresolved reference.
Revision bodies are immutable. Each subject has one confirmed current pointer.
Carry-forward is an explicit subject and field set, author=local, marked no_new_evidence, and it means no new evidence changed those fields.
Prose save writes local continuity only. It does not extract and does not carry forward.
When chapter N’s prose changes, revisions sourced from N become stale. needs_sync impacts go to chapters N+1 onward, one unresolved impact per dependent chapter and source prose revision. Chapter N gets no state impact solely for that.
state_impact is a review dependency. It does not re-extract and does not rewrite later prose.
RELATIONSHIP_BROKEN covers conflicting unresolved proposals from the same source prose, or a dangling endpoint on the active branch.
The Writer Pack takes only confirmed fresh state from the same branch.
There is no arc, scene table, confidence system, automatic extraction, or story-wide simulation.

## Response:
10/5/2026, 1:48:55 PM · gpt-5-6

这版已经可以了。**我建议现在正式冻结 Stage 2B Contract v1，不再继续修改架构。**

你现在下一步不是自己写代码，而是把这份 Contract 交给 Cursor Agent，先做一次**实现前检查**。

把下面这段直接发给 Cursor Agent：

```text
Stage 2B Contract v1 is now frozen.

Do NOT modify the contract.
Do NOT implement code yet.
Do NOT create or modify migrations.
Do NOT commit or push.

Your task is implementation-readiness review only.

Review the current repository against the frozen Stage 2B Contract v1 and report:

1. Current Stage 2A implementation points that Stage 2B must preserve.
2. Existing database tables/models that Stage 2B will extend or reference.
3. Exact files/modules/routes/services likely to be affected.
4. Any repository-level contradiction with the frozen Stage 2B Contract.
5. Any missing prerequisite that must be resolved before implementation.
6. A proposed implementation order matching the contract.
7. A proposed test plan covering every Stage 2B acceptance criterion.
8. Confirm explicitly that no Stage 2C functionality is required.

Important:
- Do not change behavior.
- Do not change schema.
- Do not write code.
- Do not create migration files.
- Do not call Grok or any other external model.
- Do not use FakeProvider.
- Do not commit or push.

At the end, give one verdict:

READY_FOR_STAGE_2B_IMPLEMENTATION

or

BLOCKED_BEFORE_STAGE_2B_IMPLEMENTATION

If BLOCKED, list only concrete blockers and why they must be resolved first.
```

### 然后你做什么？

Cursor 返回结果后，**不要让它马上开始写代码**。

把它的完整结果发给我。

我会给你做最后一次：

**Stage 2B Implementation Readiness Review**

如果我确认 `READY`，下一步我再给你一条完整的 **Stage 2B Implementation Prompt**，让 Cursor 开始正式编码。

目前流程就是：

```text
Stage 2A
   ↓
Stage 2B Contract v1 ✅ 冻结
   ↓
Implementation Readiness Review ← 你现在在这里
   ↓
我审核 Cursor 的报告
   ↓
Stage 2B Implementation
   ↓
Tests
   ↓
Real Grok E2E
   ↓
Stage 2B Acceptance
   ↓
Commit / Push
```

**所以现在只需要把上面的 Prompt 发给 Cursor。**

## Prompt:
10/5/2026, 1:51:21 PM

The contract stays frozen. I’ll compare the current Stage 2A code and schema with that contract and report only whether implementation can start.

1. Stage 2A points Stage 2B must preserve
Confirmed story, volume, and chapter outlines are the only plan authority. Prose generation still stops with OUTLINE_NOT_CONFIRMED when that lineage is missing. This lives in canon/outline_flow.py (require_generation_lineage) and pipeline/chapter_flow.py.
reading_order is story order. global_index is creation order. Split registration, volume assignment, and the writer-pack window use that split. Pack window: last three prior chapters get a full local summary; earlier chapters get one event line (memory/pack.py).
Every prose save writes local continuity in canon/local_continuity.py with no model call, then stores it on chapter_summary tied to source_revision_id.
chapter_impact stays the outline/prose impact table. Source types stay own_outline, upstream_prose, upstream_outline, and story_outline. Accept and regenerate do not rewrite other chapters’ prose (canon/impact.py, prose/revisions.py).
Other chapters’ full prose never enters the pack. The server assigns ids and strips identity fields before artifact validation (providers/router.py).
Cloud calls need a confirmed Send Manifest. allow_fake is the only FakeProvider path. Real calls do not fall back.
A project with no Stage 2B rows must keep today’s generate, split, continuity, and pack behavior.
2. Existing tables Stage 2B will extend or reference
Reference, without changing their Stage 2A meaning:

project.active_branch_id, story_branch
character (definition only; goals_json, knowledge_limits_json, and arc_json stay on the card)
world_entry (the only canonical place, organization, and object record; entry_type already includes geography, faction, polity, custom, and other)
chapter, volume, prose_revision
chapter_summary (local continuity and in-chapter event order)
story_outline_revision, volume_outline_revision, chapter_outline_revision (scene sketches stay inside the chapter outline)
chapter_impact (read and leave unchanged)
send_manifest
New Stage 2B tables, when implementation is allowed, will point at these ids. They do not replace them. chapter_summary.state_delta_id and chapter.narrative_time_start_sort / narrative_time_end_sort are unused leftovers. Stage 2B does not adopt them as state or timeline.

3. Files and modules likely to be affected
Preserved and called from new code:

canon/outline_flow.py, canon/local_continuity.py, canon/impact.py, canon/chapters.py, canon/characters.py, canon/world.py
memory/pack.py (insert the new block span only)
pipeline/chapter_flow.py and prose/revisions.py (after a prose save: mark revisions sourced from that chapter stale and open later state_impact; do not extract or carry forward)
providers/router.py, providers/seed.py, providers/protocol.py (a send-gated extractor agent, same manifest rules)
host/routes.py (new error codes only) and a new state route module beside host/outline_routes.py
New modules, not present now: state revision services, carry-forward, conflict checks, and tests/test_stage2b.py. The migration file is future work and is out of this review.

4. Repository contradictions with the contract
No behavior contradicts the contract. Three existing shapes must not be reused as Stage 2B authority:

chapter.narrative_time_* is not the chapter clock. The clock is a future chapter_time_revision.
chapter_summary.confidence and state_delta_id belong to the summary row. Stage 2B has no confidence or probability field, and it does not hang state off state_delta_id.
canon/local_continuity.py and canon/summaries.py select “later” chapters by global_index. The writer pack and the Stage 2B impact rule use reading_order. Stage 2B follows reading_order for its own impacts and leaves those Stage 2A scans unchanged.
character.arc_json exists and stays unused. There is no scene table and no arc table.

5. Missing prerequisites
None. Branch ids already exist on project, character, world entry, and chapter. One active branch is enough to implement branch isolation by writing a second branch in tests. An extractor agent can be seeded the same way the planner was, during implementation. Outline lineage, local continuity, send manifests, and immutable prose revisions are already in place.

6. Proposed implementation order
Add the branch-scoped identity tables and immutable revision tables, with one confirmed pointer per subject. Do not alter chapter_impact.
On prose save, recompute local continuity, mark revisions whose source_chapter_id is that chapter stale, and insert at most one unresolved needs_sync impact for each later chapter and that new prose revision. Do not impact the source chapter for that reason. Do not insert state rows and do not call a model.
Add explicit carry-forward: the request names a subject and a field set; the server copies those fields from the confirmed fresh revision as author=local and no_new_evidence.
Add confirm, STATE_SOURCE_STALE, and the read APIs, including resolved impact history.
Insert only confirmed fresh same-branch blocks into the writer pack, in the contract order and caps.
Add timeline, relationship, and thread confirm checks, including a single confirmed relationship pointer and RELATIONSHIP_BROKEN for conflicting unresolved proposals or a dangling endpoint.
Add the explicit, send-gated extract path. SEND_NOT_CONFIRMED writes nothing and does not use FakeProvider.
Add referent link as a user action that does not create a world_entry.
7. Proposed test plan
One Stage 2B test module, mapped to the frozen acceptance criteria:

No Stage 2B rows: generation and pack match Stage 2A; missing outlines still return OUTLINE_NOT_CONFIRMED.
Prose save on chapter N stales only revisions sourced from N, writes one unresolved needs_sync on each later chapter, writes none on N, inserts no state revision, and does not change later prose ids. A second save for the same new prose does not add a second unresolved impact. Resolved impacts remain readable.
Accepting state_impact closes the row and does not move pointers or prose.
Carry-forward with a named subject and field set writes one unconfirmed author=local child, copies only those fields, marks them no_new_evidence, and stays out of the pack. No manifest is created.
After confirm, a later chapter packs that revision id with the stored source_chapter_id and source_prose_revision_id. The subject still has one confirmed_revision_id.
A confirmed revision on another branch is absent from this branch’s state GET and from the pack.
Uniqueness is enforced for character state, world state, and relationship identity, including branch_id.
An unlinked referent is not packed as world state and does not create a world_entry.
Extract without a confirmed manifest returns SEND_NOT_CONFIRMED, writes nothing, and does not construct FakeProvider.
Confirm of a revision whose source prose is no longer current returns STATE_SOURCE_STALE with no model call.
A non-flashback time that runs backward returns TIMELINE_IMPOSSIBLE and does not confirm. A missing absolute time still confirms.
Two unresolved relationship proposals from the same source prose return RELATIONSHIP_BROKEN. A missing endpoint on the active branch does too. Neither becomes a second confirmed current.
An active thread after the last chapter is THREAD_UNRESOLVED on the project report and does not block generation.
A ten-chapter reading_order chain: changing chapter 4 stales revisions sourced from chapter 4, impacts only later chapters, creates no state revision, and does not special-case chapters 1 and 2.
That pack still excludes other chapters’ full prose and still uses the Stage 2A summary window.
8. Stage 2C
No Stage 2C work is required. Scene purpose stays inside the confirmed chapter outline. Arc, a scene table, automatic extraction, and story-wide simulation are outside this implementation.

READY_FOR_STAGE_2B_IMPLEMENTATION

## Response:
10/5/2026, 1:51:25 PM · gpt-5-6

很好。**这份 Readiness Review 可以通过，我同意 `READY_FOR_STAGE_2B_IMPLEMENTATION`。**

现在不要再做架构讨论了，直接进入 **Stage 2B Implementation**。

不过有一个执行原则：**不要让 Cursor 一次性“写完全部 + 自己验收”**。Stage 2B 比 Stage 2A 更复杂，应该分阶段实现，每阶段测试后再进入下一阶段。

## 现在发给 Cursor 的第一条实现指令

直接复制下面这段：

```text
Stage 2B Contract v1 is frozen and the implementation-readiness review is ACCEPTED.

Begin Stage 2B implementation.

IMPORTANT:
- The frozen Stage 2B Contract v1 is authoritative.
- Do not redesign or reinterpret the contract.
- Preserve every Stage 2A invariant.
- Do not implement any Stage 2C functionality.
- Do not add automatic state extraction.
- Do not add vector search, web research, copyright, cost tracking, Arc, Scene tables, story-wide simulation, or a second router.
- Do not change the meaning of existing Stage 2A tables.
- Do not use chapter.narrative_time_* or chapter_summary.state_delta_id as Stage 2B authority.
- Do not modify chapter_impact semantics.
- Do not rewrite later prose automatically.
- Do not allow FakeProvider fallback.
- Never allow the model to assign IDs.

IMPLEMENTATION STRATEGY:

Implement Stage 2B in controlled phases.

Phase 1 — Database and core revision layer

Implement only:

1. Stage 2B migration.
2. Branch-scoped identity tables:
   - character_state
   - world_state
   - world_referent
   - chapter_time
   - relationship
   - plot_thread
3. Immutable revision tables:
   - character_state_revision
   - world_state_revision
   - chapter_time_revision
   - relationship_revision
   - plot_thread_revision
4. state_impact
5. state_conflict
6. Required indexes, uniqueness constraints, foreign keys, and nullable compatibility links.
7. Repository/model layer required to read/write these entities.

Required invariants:
- Branch isolation.
- One identity row per subject per branch.
- One confirmed current pointer per subject.
- Revision bodies are immutable.
- Parent revisions remain readable.
- Every revision stores source_chapter_id and source_prose_revision_id.
- Server assigns all IDs.
- No Stage 2A existing IDs are changed.
- Migration must be idempotent.
- Existing Stage 2A databases must remain valid.

DO NOT implement extraction, carry-forward, Writer Pack integration, or frontend in this phase.

After Phase 1:
- Run the full existing Stage 2A test suite.
- Run migration idempotence tests.
- Add focused Stage 2B schema/repository tests.
- Run TypeScript checks if affected.
- Do not call Grok.
- Do not commit or push yet.

Then report:
1. Files changed.
2. Migration details.
3. New tables and constraints.
4. Tests executed and exact results.
5. Any deviations from the frozen contract.
6. Whether Phase 1 is complete.

STOP after Phase 1. Do not continue automatically to Phase 2.
```

### 为什么先做 Phase 1

因为这一阶段是在建立 Stage 2B 的**地基**：

```text
Stage 2A
   │
   ├── prose_revision
   ├── chapter
   ├── character
   └── world_entry
          │
          ▼
   ┌───────────────────┐
   │ Stage 2B Identity │
   └───────────────────┘
          │
          ▼
   ┌───────────────────┐
   │ Immutable State   │
   │ Revisions         │
   └───────────────────┘
          │
          ▼
   freshness / impact
          │
          ▼
   carry / confirm / extract
          │
          ▼
      Writer Pack
```

如果数据库层一开始就有问题，后面的 **freshness、impact、carry-forward、Writer Pack** 都会一起出问题。

所以这次我们采用：

**一阶段一验收，而不是一次性让 Agent 狂写。**

---

### 你现在只需要做一件事

把上面的 Prompt 发给 Cursor。

**Cursor 返回 Phase 1 的结果后，把完整结果原样发给我。**

我会先验收 Phase 1，确认数据库和 revision foundation 没问题之后，再给你 **Phase 2 的精确 Prompt**。

## Prompt:
10/5/2026, 1:57:20 PM

Phase 1 is the database and revision layer only. I’ll follow the existing migration and repository patterns and leave extraction, carry-forward, and the writer pack untouched.

The migration will add only new tables. Existing Stage 2A rows stay as they are, and prose save will not start writing state.

Phase 1 is complete. Extraction, carry-forward, Writer Pack integration, and the frontend are not implemented. Nothing was committed or pushed.

1. Files changed
storage/migrations/project/005_stage2b_state.sql
canon/state_store.py
tests/test_stage2b_schema.py
No Stage 2A file was edited. ai_novel_studio.egg-info/ was already untracked and was not added.

2. Migration details
005_stage2b_state is version 5. It only creates new tables and indexes. It does not alter chapter, chapter_summary, chapter_impact, prose_revision, character, or world_entry. A second apply returns an empty newly-applied list. Existing project databases stay valid because the new tables start empty.

3. New tables and constraints
Identity rows are branch-scoped, with one confirmed pointer each:

character_state: unique (project_id, branch_id, character_id)
world_state: unique (project_id, branch_id, world_entry_id)
chapter_time: unique (project_id, branch_id, chapter_id)
relationship: unique (project_id, branch_id, subject_character_id, object_kind, object_id), one confirmed_revision_id
plot_thread: (project_id, branch_id, id)
world_referent: unresolved reference only, optional world_entry_id
Immutable revision tables store source_chapter_id, source_prose_revision_id, author (user, local, extractor), a parent revision, server-rendered markdown, and stale. The server assigns every id.

state_impact allows one unresolved row per (chapter_id, source_prose_revision_id). Resolved rows stay. state_conflict stores the four contract codes.

world_entry remains the only canonical place, organization, and object table.

4. Tests executed and exact results
Full pytest: 96 passed
Stage 2A suites, included in that run: passed
tests/test_stage2b_schema.py: 7 passed, covering idempotent migration, unchanged chapter_impact columns, branch isolation, immutable parent revisions, one confirmed pointer, source-chapter stale marking, unique unresolved impacts, referent linking, relationship conflicts, and impossible timeline confirmation
tests/test_migration_roundtrip.py: passed
TypeScript: tsc -b exit 0. No client files were changed.
Grok was not called.
5. Deviations from the frozen contract
None in the data model. Two phase boundaries are intentional:

Prose save still writes only local continuity. It does not mark state stale or open state_impact. The repository functions for those writes exist and are tested, and they are not hooked up yet.
Absolute timeline order is compared only when both bounds are YYYY-MM-DD text. Other absolute text is left unordered, because the contract stores absolute time as text and does not add a calendar.
6. Whether Phase 1 is complete
Yes. Phase 1 is complete. Phase 2 has not been started.