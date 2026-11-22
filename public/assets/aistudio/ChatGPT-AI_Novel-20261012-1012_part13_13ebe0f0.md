## Prompt:
10/5/2026, 1:39:57 PM

Stage 2A stays frozen. I’ll read the current outline, continuity, and writer-pack contracts so the Stage 2B proposal extends them instead of replacing them.

Stage 2B extends the frozen Stage 2A chain. It does not replace outlines, local continuity, chapter impact, or the send gate. Character cards and world entries stay the author’s definitions. Stage 2B adds chapter-sourced situation, clock, relationship history, and plot threads on top of them.

Existing anchors that stay frozen:

Confirmed story, volume, and chapter outlines are the only outline authority.
reading_order is story order. global_index is creation order.
Local continuity is derived on every prose save, without a model, and is the continuity injected into later chapters.
chapter_impact still means outline and prose impact. It never rewrites prose.
Other chapters’ full prose never enters the writer pack.
The model does not assign project_id, chapter_id, or revision ids.
A project with no Stage 2B rows behaves exactly as Stage 2A.
1. Authority
Layer	Object	Authority
Definition
character, world_entry
Authoritative identity and standing description. Stage 2B does not update these rows.
Plan
Confirmed outline revisions
Authoritative for what the chapter is supposed to do.
Prose
prose_revision
Authoritative text. Immutable.
Continuity
chapter_summary
Derived, local, injectable only when it matches the current prose revision.
Situation
Stage 2B state revisions
Derived from a prose revision, then authoritative for later packs only after the user confirms that revision.
Conflict
state_conflict
A finding. It does not change prose or state.
A model extraction is a proposal. It becomes current only when the user confirms it. Carry-forward of unchanged fields is local and still requires that same confirmation before it is injected.

2. Shared revision rules
Every Stage 2B fact is a revision row.

The server assigns every id.
Content columns are insert-only. Confirm moves a pointer.
Each revision stores parent_revision_id, source_chapter_id, source_prose_revision_id, and author (user, local, or extractor).
author=extractor is allowed only behind a confirmed send manifest for that chapter. There is no FakeProvider fallback and no send grant that skips the manifest.
A revision is fresh only when source_prose_revision_id is still that chapter’s current prose revision, and no earlier chapter in reading_order has a newer current prose revision than the one this state was built from.
Stale revisions remain readable. They are not injected.
The current pointer for a subject, as of chapter N, is the latest confirmed fresh revision whose source chapter has reading_order less than N, or N itself when N’s own state is confirmed.
Supersede by inserting a child revision. Do not delete the parent.
state_impact is a sibling of chapter_impact. It does not change chapter.impact_status or the Stage 2A source-type check.

state_impact fields: id, project_id, chapter_id, state_kind, state_revision_id, impact_status (needs_review, needs_sync), source_chapter_id, source_prose_revision_id, reason, resolved_at, resolved_by (accept, reextract).

Accept closes the impact row. It does not recompute state and does not rewrite prose.

3. Character state
Purpose: the situation of one character after a specific prose revision. The character card remains who they are.

Table character_state. One row per character. Pointers only.

Fields: id, project_id, branch_id, character_id, current_revision_id, confirmed_revision_id.

Table character_state_revision. Immutable body.

Fields:

id, created_at, state_id, parent_revision_id
source_chapter_id, source_prose_revision_id
author
location_text
location_world_entry_id nullable
current_goal
knowledge_json — facts this character now knows
condition_text — injury, illness, custody, disguise, or other physical or social status; empty when unchanged
delta_json — the fields this revision changed
markdown — server-rendered from the structured fields
Ownership: one state row per character. Revisions are owned by the chapter whose prose caused them.

Authoritative once confirmed. Until then, the proposal is stored and is not packed.

Invalidation: a new current prose revision on the source chapter marks that revision stale and opens state_impact on every later chapter. Earlier characters’ states stay fresh.

Location may name a world_entry of type geography. An unresolved place stays text and is not inserted into world_entry.

Card goals_json and knowledge_limits_json stay definitional. State current_goal and knowledge_json are situational. The pack shows both, with the card labeled as definition and the state labeled as situation.

4. World state
Purpose: persistent changes to places, organizations, and objects the bible already describes, plus unresolved referents the prose introduced.

world_entry stays the bible. Stage 2B does not add a second location or organization table.

Table world_state. One row per world_entry.

Fields: id, project_id, branch_id, world_entry_id, current_revision_id, confirmed_revision_id.

Table world_state_revision. Immutable.

Fields:

id, created_at, state_id, parent_revision_id
source_chapter_id, source_prose_revision_id, author
condition_text — political, social, physical, or operational condition now in force
holder_character_id nullable — who currently controls an object or office
delta_json
markdown
Organizations are world_entry rows whose entry_type is faction or polity. Important objects are world_entry rows whose entry_type is custom or other. A new persistent thing is proposed as an unresolved referent, not created as a bible row.

Table world_referent. Mutable only in its link fields.

Fields: id, project_id, name, referent_kind (location, organization, object, condition), world_entry_id nullable, introduced_chapter_id, introduced_prose_revision_id.

Linking a referent to a world_entry is a user action. It does not rewrite past revisions. Later packs use the link. Unresolved referents are packed as unresolved.

Invalidation matches character state: stale when the source prose is no longer current, and later chapters are marked needs_sync.

5. Timeline
Purpose: when a chapter sits in story time. Local continuity still answers what happened.

Table chapter_time. One row per chapter.

Fields: id, chapter_id, current_revision_id, confirmed_revision_id.

Table chapter_time_revision. Immutable.

Fields:

id, created_at, chapter_time_id, parent_revision_id
source_chapter_id, source_prose_revision_id, author
relative_label — text such as “the night after the previous chapter”
absolute_start, absolute_end — optional text, not a required calendar type
duration_text nullable
flashback — 0 or 1, explicit
follows_chapter_id nullable — the story-time predecessor, defaulting to the previous reading_order when flashback is 0
Event ordering inside a chapter stays in chapter_summary.key_events. Stage 2B does not copy that list into a second event table.

Consistency, checked at confirm time:

If flashback is 0, follows_chapter_id must have an earlier reading_order, or be empty for the first chapter.
If two chapters both have absolute bounds and the later reading_order is not a flashback, its start cannot be before the earlier chapter’s end.
A missing absolute time is valid. The clock stays relative.
Failure code: TIMELINE_IMPOSSIBLE. The revision is not confirmed. Prose is unchanged.
Invalidation: a new prose revision on that chapter marks its time revision stale. Later chapters that follows_chapter_id this chapter, or that follow it in reading_order with flashback 0, get state_impact needs_sync. Their time rows are not deleted.

6. Relationship history
Purpose: how one relation stands after a chapter, with the earlier stands kept.

Table relationship. Identity of the pair.

Fields: id, project_id, branch_id, subject_character_id, object_kind (character or world_entry), object_id, current_revision_id, confirmed_revision_id.

Unique on (project_id, subject_character_id, object_kind, object_id).

Table relationship_revision. Immutable history.

Fields:

id, created_at, relationship_id, parent_revision_id
source_chapter_id, source_prose_revision_id, author
stance — short label such as trust, hostility, secrecy, alliance
summary
markdown
The source chapter and source prose revision are the historical cite. Packs inject the confirmed fresh revision as of the chapter being written, not the whole history. History is available from a read API.

A broken relation is a conflict, not a deleted row. Code RELATIONSHIP_BROKEN when a new proposal names a subject or object that does not exist, or when two confirmed revisions for the same pair and the same source prose disagree. Confirm is refused until the user picks one child revision.

Invalidation matches character state.

7. Plot threads
Purpose: setup, active pressure, payoff, or abandonment, cited to chapters.

Table plot_thread.

Fields: id, project_id, branch_id, title, current_revision_id, confirmed_revision_id.

Table plot_thread_revision. Immutable.

Fields:

id, created_at, thread_id, parent_revision_id
source_chapter_id, source_prose_revision_id, author
status — setup, active, payoff, abandoned
setup_chapter_id
payoff_chapter_id nullable
summary
setup_chapter_id is the chapter that planted it. source_chapter_id is the chapter that last changed the status. payoff_chapter_id is the intended or actual payoff chapter. Both chapter ids must exist. payoff_chapter_id must have reading_order greater than or equal to setup_chapter_id.

Status after a prose edit: revisions whose source_prose_revision_id is no longer current become stale. The thread pointer falls back to the latest confirmed fresh ancestor. Later status changes stay in the table and are marked stale rather than erased.

THREAD_UNRESOLVED is a warning when the user asks for a project report and a confirmed thread is still setup or active after the last chapter. It does not block chapter generation.

8. Arc and scene
Scene stays inside the confirmed chapter outline, as the existing scenes list of order and purpose. Stage 2B does not add a scene table, scene revision, or scene membership.

Arc is not a Stage 2B entity. A plot thread already records setup and payoff across chapters. An arc graph, beat list, and scene membership are Stage 2C.

character.arc_json stays unused by this stage.

9. Revision, dependency, and invalidation
Change	Local recompute	Becomes stale	Must be regenerated
Save or regenerate prose of chapter N
Local continuity of N, immediately, without a model
State, time, relationship, and thread revisions sourced from N; later revisions that were built on N’s previous prose
Nothing automatic. Prose of later chapters stays. A new extraction is a separate user action.

User edits chapter N outline only
Nothing in Stage 2B
Stage 2A outline impact only
No state and no prose

User confirms a new state revision for N
Carry-forward draft for fields that revision did not change
Older confirmed revision of that subject, by pointer move
No

User accepts state_impact
Nothing
The impact row closes
No
Carry-forward is local. For a new prose revision that does not mention a subject, the server may insert an author=local child that copies the prior confirmed fields and sets the new source_prose_revision_id. It is not confirmed and is not packed until the user confirms it.

Extraction, when requested, reads only that chapter’s current prose, the confirmed fresh state as of the previous chapter, and the confirmed outlines. It returns proposals. The server writes ids and source revisions. The user confirms.

Editing chapter N never rewrites later prose, never deletes history, and never moves a confirmed pointer except by an explicit confirm.

10. Writer pack
Stage 2B blocks are inserted after the confirmed outline blocks and scene sketch, and before the windowed chapter_summary blocks. Definitions of characters and world entries stay where Stage 2A puts them.

Order inside the new span:

Timeline bound for this chapter and the previous chapter’s confirmed bound.
Open plot threads whose status is setup or active, whose setup is before this chapter, and which are not stale.
Confirmed fresh character states for characters named by the confirmed chapter outline, plus characters whose state changed in the previous three chapters.
Confirmed fresh world states for world entries named by that outline or changed in the previous three chapters.
Confirmed fresh relationship revisions touching those characters.
Caps, in addition to the Stage 2A rule that the last three prior chapters contribute a full local summary and earlier chapters contribute one event line:

Timeline: at most two bounds.
Threads: at most 8, one line each.
Character states: at most 8.
World states: at most 6.
Relationships: at most 8.
Each block records kind, the revision id, source_chapter_id, and source_prose_revision_id. Kinds: chapter_time, plot_thread, character_state, world_state, relationship_state.

Missing Stage 2B rows omit those kinds. Generation still requires the Stage 2A confirmed outline lineage and does not require state.

The pack still excludes every other chapter’s full prose. It also excludes stale revisions, unconfirmed proposals, and the full history of a subject.

11. Conflict detection
Conflicts are rows in state_conflict. Insert-only except resolved_at and resolved_by.

Fields: id, project_id, code, state_kind, state_revision_id, other_revision_id, chapter_id, summary, resolved_at, resolved_by (accept, new_revision).

Code	When it is raised	Effect
STATE_CONTRADICTION
A proposal puts a character in a location or condition that a confirmed fresh state of a later source chapter already contradicts, or two proposals from the same prose disagree
Confirm of the proposal is refused
TIMELINE_IMPOSSIBLE
Absolute or flashback rule fails
Confirm of that time revision is refused
RELATIONSHIP_BROKEN
Dangling endpoint, or two confirmed bodies for the same pair and same source prose
Confirm is refused
THREAD_UNRESOLVED
Project report only
No generation block
Accepting a conflict records the user’s choice and does not change prose. Creating a new revision is the way to replace a body.

12. APIs
All ids in responses are server ids. Bodies sent by a client do not include revision identity; the server writes source_chapter_id and source_prose_revision_id from the chapter’s current prose.

GET /chapters/{chapter_id}/state — confirmed fresh state as of that chapter: character states, world states, time, relationships, open threads. Empty arrays when the project has no Stage 2B data.
POST /chapters/{chapter_id}/state/carry — local carry-forward proposals. No model call.
POST /chapters/{chapter_id}/state/extract — send-gated extractor. allow_fake false by default. Unconfirmed cloud returns SEND_NOT_CONFIRMED and writes nothing.
POST /character-states/{character_id}/revisions/{revision_id}/confirm
POST /world-states/{world_entry_id}/revisions/{revision_id}/confirm
POST /chapters/{chapter_id}/time/revisions/{revision_id}/confirm
POST /relationships/{relationship_id}/revisions/{revision_id}/confirm
POST /plot-threads/{thread_id}/revisions/{revision_id}/confirm
GET revision lists for each subject, newest first, including stale rows.
GET /chapters/{chapter_id}/state-impact
POST /chapters/{chapter_id}/state-impact/accept
GET /projects/{project_id}/state-conflicts
POST /world-referents/{referent_id}/link — user sets world_entry_id.
Confirm of a stale source returns STATE_SOURCE_STALE. The source prose revision must still be the chapter’s current prose revision.

13. Backward compatibility
A project with no Stage 2B rows generates, splits, and continues exactly as Stage 2A.
Existing prose_revision and chapter_summary rows stay valid. Their new columns, if any, are unused pointers and stay null.
Stage 2A chapter_impact source types and impact_status values stay as they are.
Old projects do not gain required state before generation. OUTLINE_NOT_CONFIRMED is unchanged.
Local continuity still runs with cloud memory off.
Send manifests still cite every packed block. State blocks use the same gate.
14. Stage boundaries
Stage 2B includes:

Character state, world state, chapter time, relationship history, and plot threads, as revisions sourced from prose.
Local carry-forward, user confirm, and optional send-gated extraction.
state_impact, state_conflict, and the pack rules above.
Confirm-time validation for timeline, relationship endpoints, and stale source.
Stage 2C is the later home for:

Arc as its own object, with beats and membership.
A scene table, if chapter-outline scene sketches become too small.
Automatic extraction on every save.
Cross-chapter merge of conflicting states into one inferred truth.
Story-wide simulation, calendars with recurrence, and maps.
Not in this product line:

Rewriting prose or later chapters from state.
Writing Stage 2B facts back into character or world_entry.
Vector search, web crawl, research, copyright, cost, or a second router.
FakeProvider as a fallback when extraction was requested for real.
The model inventing revision ids.
15. Acceptance criteria
A Stage 2A project with confirmed outlines and no state rows still generates. The writer pack has the Stage 2A kinds and no Stage 2B kinds. Prose and summaries are unchanged.
Carry-forward on chapter 2 copies chapter 1’s confirmed character state into an unconfirmed author=local revision. The pack for chapter 3 does not include it until confirm. No model call occurs. send_manifest is unchanged.
After confirm, chapter 3’s pack includes that character state, the world state, the time bound, the relationship, and open threads, and still excludes chapter 1 and chapter 2 full prose.
Each packed block id is the revision id, and the stored row’s source_prose_revision_id equals the cited chapter’s current prose revision.
Saving new prose on chapter 1 recomputes chapter 1’s local summary, marks state sourced from the old prose stale, opens state_impact on later chapters, and leaves later prose revision ids unchanged.
Accepting state_impact closes the row and does not change prose or confirmed state pointers.
A time revision that puts a later non-flashback chapter before an earlier chapter’s absolute end returns TIMELINE_IMPOSSIBLE and does not confirm.
Confirming a state revision whose source_prose_revision_id is not the chapter’s current prose returns STATE_SOURCE_STALE and makes no model call.
Two conflicting proposals from the same prose return STATE_CONTRADICTION and neither becomes confirmed until the user confirms one new child.
A thread left active after the last chapter appears in the project conflict report as THREAD_UNRESOLVED and does not block generation.
An unconfirmed cloud extract returns SEND_NOT_CONFIRMED, writes no revision, and does not call FakeProvider.
A ten-chapter chain uses reading_order. Changing chapter 4’s prose invalidates state from chapter 4 onward and does not special-case chapters 1 and 2.
Migration on an existing Stage 2A database adds the new tables, leaves old prose and summary ids unchanged, and a second apply adds nothing.

## Response:
10/5/2026, 1:40:00 PM · gpt-5-6

我看完了。这份 **Stage 2B Architecture & Contract Proposal 整体质量很高**，而且最重要的是，它没有破坏 Stage 2A 的核心原则。

但我**不建议现在直接让 Agent 开始写代码**。在冻结 Stage 2B Contract 之前，我建议先修正几个设计点。

## 我的结论

目前：

**Stage 2B Proposal：约 85–90% 可以接受。**

需要先处理 **4 个必须澄清/修改的地方**，然后才能正式 Freeze。

### 1. 最大的问题：`state_impact` 的范围定义不够严谨

Proposal 写：

> new current prose revision on the source chapter marks that revision stale and opens state_impact on every later chapter.

这个方向对，但需要明确：

**不是所有 Stage 2B 状态都必须在每一个后续 Chapter 都创建 impact row。**

例如：

```text
Chapter 1
林夏位置 = 港务楼

Chapter 2
林夏位置 = 港口

Chapter 3
林夏位置 = 港口
```

Chapter 1 重写以后，应该知道：

> Chapter 2+ 的状态可能需要重新验证。

但不能因此产生大量完全无意义的状态记录。

建议 Contract 明确：

> `state_impact` 是“需要重新确认/同步的依赖关系”，而不是“每个后续章节都必然需要重新提取”。

这样后面性能会好很多。

---

### 2. `character_state` 的“一行一个角色”要区分 Identity 和 Branch

这里：

> Table character_state. One row per character.

这个表最好明确唯一性：

```text
(project_id, branch_id, character_id)
```

否则未来你支持：

```text
main branch
alternative branch
revision branch
```

会出现不同分支互相污染。

虽然现在可能只有一个 branch，但 **Stage 2A 已经存在 branch_id**，所以 Stage 2B 应该从第一天就保持一致。

---

### 3. `world_state` 有一个潜在问题

Proposal：

> One row per world_entry.

同样应该明确：

```text
(project_id, branch_id, world_entry_id)
```

而且：

> unresolved referent → user links to world_entry

这个设计我赞成。

尤其是：

**不要让 AI 自动把“港口”“旧码头”“东区码头”猜成某个已有 World Entry。**

现在的：

```text
world_referent
    ↓

user manually links
    ↓
world_entry
```

是非常安全的。

这个原则建议直接 Freeze。

---

### 4. `character_state` / `world_state` 的“carry-forward”需要更严格

这是我认为最需要提前规定的一点。

Proposal 写：

> Carry-forward of unchanged fields is local.

这是对的。

但是：

> 新 prose 没有提到某角色 ≠ 角色状态没有变化。

例如：

```text
Chapter 1:
林夏 location = 港务楼

Chapter 2:
全文没有提到林夏的位置

Chapter 3:
林夏突然出现在机场
```

如果系统自动认为 Chapter 2：

```text
location = 港务楼
```

那么 Chapter 3 的冲突判断可能会产生假阳性。

因此我建议：

### Carry-forward 只能表示：

> “没有新的证据改变这个字段。”

而不是：

> “这个字段被证明仍然成立。”

所以状态最好区分：

```text
known_current_value
+
evidence/source
+
confidence / provenance
```

不过我**不建议现在增加复杂的 confidence 系统**。

Stage 2B 可以简单规定：

> carry-forward 是 derived proposal，必须用户 Confirm 后才能进入 Writer Pack；它不能被解释成新的 prose evidence。

这样已经够安全。

---

# 另外一个我非常赞成的设计

这一条：

> **The model extraction is a proposal. It becomes current only when the user confirms it.**

我建议把它作为 Stage 2B 最核心的原则之一。

整个状态系统应该是：

```text
Prose
  ↓
Extractor
  ↓
State Proposal
  ↓

User Confirm
  ↓
Confirmed State Revision
  ↓
Writer Pack
```

而不是：

```text
Prose
 ↓
AI 自动总结
 ↓
直接覆盖 Character State
```

后者会非常危险。

---

# Timeline 设计也基本正确

特别是：

> `absolute_start / absolute_end` 使用 optional text，而不是强制 calendar type

我赞成。

因为小说里可能出现：

- 第二天晚上
- 三个月前
- 暴风雨后的第三日
- 深夜
- 十年前
- 黄昏
- 第二次会议结束后

强行建立真实日期系统反而会让模型和用户都被数据结构限制。

Stage 2B 先做：

**相对时间 + 可选绝对时间文本**

是合理的。

---

# Plot Thread 也可以进入 2B

这个设计：

```text
setup
active
payoff
abandoned
```

已经足够支持第一版长篇小说伏笔管理。

尤其：

```text
setup_chapter_id
payoff_chapter_id
source_chapter_id
```

这三个概念要保持区别。

- `setup_chapter_id`：最初埋下
- `source_chapter_id`：最近一次改变状态
- `payoff_chapter_id`：预计/实际回收

这个设计很好。

---

# 我建议冻结后的 Stage 2B 范围

最终应该是：

```text
Stage 2B
├── Character State
├── World State
├── World Referent
├── Chapter Time
├── Relationship History
├── Plot Thread
├── State Impact
├── State Conflict
├── Carry Forward
├── User Confirmation
├── Optional AI Extraction
└── State-aware Writer Pack
```

而：

```text
Stage 2C
├── Arc
├── Scene Entity
├── Story-wide simulation
├── Calendar
├── Map
├── Automatic extraction
├── Advanced conflict resolution
└── Cross-state inference
```

这样边界非常清楚。

---

# 还有一个重要决定：不要做“自动提取每章状态”

Proposal 已经把它放到 2C，我认为这是**正确的**。

Stage 2B 应该：

> **写完 → 本地 Continuity 自动产生**

但是：

> **Character/World/Relationship/Thread State → 用户主动 Extract → Review → Confirm**

否则一章小说可能触发几十个 AI 状态判断，成本、延迟和错误都会迅速增加。

---

# 现在应该怎么做？

**不要修改代码。**

先让 Cursor Agent 根据我的这几个意见，把 Proposal 修订成 **Stage 2B Contract v1**。

你可以直接把下面发给 Agent：

```text
Stage 2B proposal review is complete.

Do NOT implement anything yet.
Do NOT modify code.
Do NOT modify database schema.
Do NOT create migrations.
Do NOT commit or push.

Revise the Stage 2B proposal into a formal Stage 2B Contract v1.

Keep the existing proposal as the foundation, but make these clarifications mandatory:

1. State Impact semantics

Clarify that state_impact represents a dependency requiring review/synchronization, not an instruction to automatically re-extract every later chapter.

Do not create unnecessary state revisions merely because an earlier chapter changed.

Later chapters' prose must never be automatically rewritten.

2. Branch isolation

For character_state, world_state, relationship, plot_thread and all subject identity rows, explicitly define branch isolation.

Where applicable, uniqueness must include:
(project_id, branch_id, subject_id)

No state from one branch may be injected into another branch.

3. Character State identity

Define character_state as one state identity per:
(project_id, branch_id, character_id)

character_state_revision remains immutable.

4. World State identity

Define world_state as one state identity per:
(project_id, branch_id, world_entry_id)

Do not create a second canonical world/location/organization table.

world_referent remains the unresolved-reference mechanism.

5. Carry-forward semantics

Explicitly define carry-forward as:

"no new evidence has changed this field"

and NOT:

"the prose proves this field is still true."

Carry-forward remains a derived local proposal.
It must be confirmed before entering Writer Pack.

Do not introduce a large confidence/probability system in Stage 2B.

6. State provenance

Every confirmed state must remain traceable to:
- source_chapter_id
- source_prose_revision_id
- state revision id

A carry-forward revision must also clearly indicate that it is author=local.

7. Extraction boundary

Stage 2B must NOT automatically extract Character/World/Relationship/Thread state on every prose save.

Prose save automatically produces local continuity only.

State extraction is an explicit user-triggered, send-gated operation.

8. Writer Pack

Only confirmed, fresh Stage 2B state may enter the Writer Pack.

Unconfirmed proposals, stale revisions, and unresolved referents that are not linked must not silently become authoritative state.

9. Preserve all Stage 2A frozen contracts:

- confirmed story/volume/chapter outlines remain authoritative
- reading_order remains story order
- global_index remains creation order
- chapter_summary remains local continuity
- chapter_impact remains unchanged
- other chapters' full prose never enters Writer Pack
- server owns all ids
- Send Manifest remains mandatory for cloud extraction
- no FakeProvider fallback
- OUTLINE_NOT_CONFIRMED remains unchanged
- Stage 2A projects with no Stage 2B data behave exactly as before

10. Do not add:
- vector search
- web research
- copyright system
- cost system
- second router
- Arc entity
- Scene table
- automatic extraction
- story-wide simulation

After revising the proposal, produce:

A. Final Stage 2B Contract v1
B. Explicit frozen invariants inherited from Stage 2A
C. Final database entities and relationships
D. Revision semantics
E. Invalidation semantics
F. Writer Pack contract
G. API contract
H. Conflict contract
I. Backward compatibility contract
J. Stage 2B acceptance criteria

Do not write implementation code.

Do not modify any files.

Do not commit or push.
```

## 然后你把第二版发给我

我会帮你做**最后一次 Contract Review**。

如果第二版没有结构性问题，我们就可以正式宣布：

> **Stage 2B Contract FROZEN**

然后才让 Agent 开始实现。

这样做虽然比直接开工慢一点，但你刚刚经历的 Stage 2A 已经证明了：**先冻结 Contract，再写代码，最终验收会顺很多。**

## Prompt:
10/5/2026, 1:42:58 PM

A. Final Stage 2B Contract v1
Stage 2B adds confirmed, chapter-sourced situation on top of the frozen Stage 2A engine. The author bible stays in character and world_entry. The plan stays in confirmed outlines. The text stays in immutable prose_revision. Local continuity stays in chapter_summary. Stage 2B records how people, places, relations, clocks, and plot threads stand after a specific prose revision, on one branch.

A Stage 2B fact is authoritative for the Writer Pack only when all of these are true:

It is a confirmed revision.
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
Subject identity rows are branch-scoped. Uniqueness includes (project_id, branch_id, subject). A row on one branch is invisible to every other branch. Packs, carry-forward, extraction, and conflict checks read only the chapter’s branch.

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
Pointers only. object_kind is character or world_entry
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
impact id
Dependency mark on a later chapter
state_conflict
conflict id
A finding. It changes neither prose nor state
world_entry remains the only canonical record of locations, organizations, and objects. Organizations are entries whose entry_type is faction or polity. Objects are entries whose entry_type is custom or other. Places are entries whose entry_type is geography.

character_state_revision fields: location_text, optional location_world_entry_id, current_goal, knowledge_json, condition_text, delta_json, server-rendered markdown, plus provenance fields in section D.

world_state_revision fields: condition_text, optional holder_character_id, delta_json, markdown, plus provenance.

chapter_time_revision fields: relative_label, optional absolute_start, optional absolute_end, optional duration_text, flashback as 0 or 1, optional follows_chapter_id, plus provenance. In-chapter event order stays in chapter_summary.key_events.

relationship_revision fields: stance, summary, markdown, plus provenance.

plot_thread_revision fields: status, setup_chapter_id, optional payoff_chapter_id, summary, plus provenance. payoff_chapter_id has reading_order greater than or equal to setup_chapter_id on the same branch.

world_referent fields: name, referent_kind (location, organization, object, condition), introduced_chapter_id, introduced_prose_revision_id, optional world_entry_id. Linking sets that optional id. It does not insert a world_entry and does not rewrite old revisions.

No Stage 2B table stores a confidence score, a probability, or a vector.

D. Revision semantics
Revision bodies are insert-only. Confirm moves confirmed_revision_id. A new fact supersedes an old one by inserting a child with parent_revision_id. Parents stay readable.

Every revision stores:

source_chapter_id
source_prose_revision_id
its own revision id
author: user, local, or extractor
author=local means carry-forward. The delta_json for each copied field is the marker no_new_evidence. That marker means this prose has not supplied a change to the field. It does not mean the prose proves the field is still true.

author=extractor is a proposal from an explicit extract call. author=user is a proposal or correction written by the user. Both stay unconfirmed until confirm.

A revision is fresh only when:

source_prose_revision_id is still the source chapter’s current prose revision, and
every earlier chapter on that branch, in reading_order, still has the current prose revision that was already current when this revision was built.
The as-of revision for a subject at chapter N is the latest confirmed fresh revision on that branch whose source chapter has reading_order less than N, or equal to N when N’s own revision is confirmed. If none exists, the subject is absent from the pack.

Carry-forward is POST /chapters/{chapter_id}/state/carry. It reads only that branch. It inserts unconfirmed author=local children for subjects that already have a confirmed fresh as-of revision and for which this chapter’s prose is not being treated as new evidence. It does not run on prose save. It does not enter the Writer Pack before confirm.

E. Invalidation semantics
state_impact means a later chapter’s dependency needs review or synchronization. It is not an instruction to re-extract that chapter, and it does not create a state revision.

When the current prose revision of chapter N changes:

Chapter N’s local continuity is recomputed locally, with no model call.
Every Stage 2B revision on that branch whose freshness rule fails becomes stale.
Each later chapter on that branch receives a state_impact row with needs_sync, citing N and N’s new prose revision.
No later prose revision is rewritten.
No extractor call is started.
No carry-forward revision is inserted.
Confirmed pointers are not moved to a newly invented body. Packing simply skips revisions that are no longer fresh and uses the latest confirmed revision that is still fresh. If none is fresh, that subject is omitted.
An outline-only edit uses Stage 2A chapter_impact only. It does not stale Stage 2B revisions whose source prose is still current.

state_impact.impact_status is needs_review or needs_sync. resolved_by is accept or reextract. Accept closes the row and does not recompute state. reextract is recorded only after the user separately completes an explicit extract and confirms a new revision. The impact row never launches that call.

Stale revisions remain in history. They are not deleted and they are not packed.

F. Writer Pack contract
Only confirmed fresh Stage 2B revisions from the chapter’s own branch are packed.

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
POST /chapters/{chapter_id}/state/carry writes unconfirmed author=local proposals. No model call.
POST /chapters/{chapter_id}/state/extract is the only extraction entry. It is user-triggered and send-gated. allow_fake defaults to false. SEND_NOT_CONFIRMED writes no revision and opens no provider connection.
Confirm endpoints, one per subject: character state, world state, chapter time, relationship, plot thread. Each confirms one revision id.
GET revision lists return history, including stale rows, for that branch only.
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
An endpoint is missing on this branch, or two confirmed bodies exist for the same pair and the same source prose
Refused
THREAD_UNRESOLVED
A project report finds a confirmed thread still setup or active after the last chapter
Not raised at generation time
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
Prose save on a chapter with confirmed state recomputes that chapter’s local continuity, marks dependent revisions stale, and opens state_impact on later chapters. It inserts no state revision, starts no extract, and leaves later prose revision ids unchanged.
Accepting state_impact closes that row and does not create a revision, move a confirmed pointer, or change prose.
Carry-forward inserts only unconfirmed author=local revisions whose copied fields are marked no_new_evidence. Those revisions are absent from the Writer Pack until confirm. No model call and no Send Manifest occur.
After confirm, a later chapter on the same branch packs that revision. The block id is the revision id, and the block’s source_chapter_id and source_prose_revision_id match the row.
A confirmed revision on another branch is not packed and is not returned by this branch’s GET /chapters/{id}/state.
Uniqueness holds for (project_id, branch_id, character_id), (project_id, branch_id, world_entry_id), and (project_id, branch_id, subject_character_id, object_kind, object_id).
An unlinked world_referent is not packed as world_state and does not create a world_entry.
Explicit extract with no confirmed manifest returns SEND_NOT_CONFIRMED, writes no revision, and does not use FakeProvider.
Confirm of a revision whose source prose is no longer current returns STATE_SOURCE_STALE with no model call.
An impossible non-flashback time returns TIMELINE_IMPOSSIBLE and does not confirm. A missing absolute time still confirms.
Two conflicting proposals from one prose revision return STATE_CONTRADICTION. Neither is confirmed until the user confirms one new child.
A thread left active after the last chapter is reported as THREAD_UNRESOLVED and does not block generation.
A ten-chapter chain uses reading_order. Changing chapter 4’s prose stales state from chapter 4 onward, opens state_impact on later chapters, creates no later state revisions, and does not special-case chapters 1 and 2.
The Writer Pack for that chain still excludes every other chapter’s full prose, and the Stage 2A last-three full summaries plus earlier one-line events remain in force.