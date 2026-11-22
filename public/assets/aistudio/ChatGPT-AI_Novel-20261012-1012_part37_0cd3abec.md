## Prompt:
10/6/2026, 6:10:15 AM

这次只做只读审计，不改代码。我先核对现有 Proposal 的确认、修订和冲突处理，再判断 Apply 能不能安全复用。

现有 confirm_bible_proposal() 可以做 Apply 的状态机，但不能直接拿来确认 entry 或 link 的 update。那条路径会把提案 payload 整份写成新修订，只改 attributes.current_state 就会丢掉 motivation 等未出现的字段。

1. 当前实现能力
bible_proposal 已有 pending、accepted、rejected。create_bible_proposal() 只插入 pending，并记下当时的 confirmed_revision_id 作为 base_revision_id。create 的 target_id 和 base_revision_id 都是 null。它不移动任何指针。

confirm_bible_proposal() 只处理仍为 pending 的提案：

update 和 retire 先比较 proposal.base_revision_id 与目标当前的 confirmed_revision_id。create 则检查同 kind、同 title 的条目，或同一对端点的 link 是否已经存在，以及两端是否仍有确认修订。
不一致时返回 outcome: conflict，提案保持 pending，写 bible_proposal_conflict。Canon 不动。
一致时追加一条新修订，把提案标为 accepted，写 bible_proposal_accept。
再次 confirm 一条已经 accepted 或 rejected 的提案会返回 409，不会写第二条修订。
修订语义是追加，不改旧行：

entry 或 link 的 create、update：parent_revision_id 指向当时的确认修订；current_revision_id 和 confirmed_revision_id 一起指向新修订。
retire：再追加一条修订。entry 会在 attributes 里写上 retired: true，并保留原 title、body、attributes、sort_key。link 保留原来的 stance 和 summary。然后 current_revision_id 指向这条停用修订，confirmed_revision_id 变为 null。read_confirmed_bible() 因此不再返回它，历史仍在。
revert 只移动两个指针，不删除修订，并写 bible_revert。
Proposal V1 存进数据库的 update payload 已经被收成完整文档，不是稀疏补丁。entry update 固定有 title、body_md、attributes、sort_key。模型没写的 body 会变成 ""，没写的 sort_key 会变成 0。attributes 里只保留模型实际给出的键。link update 固定有 stance 和 summary，没写的一侧变成 null。

真实 Grok 提案就是这个形状：title 为「周予安」，body 为 ""，attributes 只有 current_state: 寻找姐姐，sort_key 为 0。确认前 Canon 仍是 current_state: 在盐港查案 和 motivation: 查清旧案。

没有提案确认的 HTTP route。确认目前只存在于 canon/bible.py，测试直接调用。

2. 风险
A. confirm_bible_proposal() 的冲突检查、重复确认保护和 create、retire 分支可以直接沿用。它的 entry update 和 link update 分支不能直接作为 Apply。

B / C. 现有 update 是整份替换，不是字段级 patch。_apply_proposal() 把 payload.attributes 原样交给 update_bible_entry()，新修订的 attributes_json 就是这份对象。上面那条 Grok 提案一旦 confirm，新 Canon 只会剩下 current_state: 寻找姐姐，motivation 会消失。personality、role、goal 以及其他没出现在 payload 里的键也一样。retired 会被属性清洗丢掉，不能靠 attributes 把条目标成停用。

同一类默认值还有两处。body 被收成 "" 时，非空正文会被清空。sort_key 被收成 0 时，原来的非零排序会被改成 0。link 没写的 stance 或 summary 会变成 null，另一侧原值也会被清掉。title 是必填标量，会按 payload 里的标题替换。

直接用户编辑用的 update_bible_entry() 和 update_bible_link() 也是整份写入。这个语义应该留给用户编辑，不要改成 patch。

F. Canon 在提案创建后变了，现有实现既不自动合并，也不重新生成提案。它保持 pending 并记 conflict。这是 Apply 应继续使用的处理。两个提案基于同一确认修订时，先确认的生效，后确认的冲突，不会把两份修改叠在一起。

G. 重复 confirm 不会重复写入。已处理提案返回 409。冲突后的提案仍是 pending，可以再确认；只有确认修订回到原来的 base_revision_id 时才会成功，否则再记一条 conflict，Canon 仍不变。

H. update 和 create 成功后，两个指针都指向新修订。retire 成功后，current 指向停用修订，confirmed 为 null。conflict 和 reject 不改变指针。若当时 current_revision_id 指着一份未确认草稿，update 仍以确认修订为 parent，并把两个指针都移到新修订。草稿行还在历史里，但不再是 current，也不会被合并进新 Canon。

新修订的 author 固定写成 user。提案行上的 author 仍是 assistant。表结构允许修订作者为 assistant，但插入语句没有使用它。

3. 推荐的最小 Apply V1 架构
继续用 confirm_bible_proposal() 做唯一确认入口。create、retire、冲突、拒绝和重复确认保持现在的行为。只改它内部对 update 的组装：先读 base_revision_id 对应的确认修订，拼出一份完整文档，再交给现有的 update_bible_entry() 或 update_bible_link()。这两个函数仍然整份写新修订，parent 仍是该确认修订。

字段级规则：

attributes：以确认修订为底，只覆盖 payload 里出现的键。没出现的 motivation、personality、role 等保留。不允许通过 patch 写入 retired。
title：使用 payload 中的标题。
body_md：payload 非空时替换；payload 是 "" 而确认正文非空时，保留确认正文。V1 因此不能把正文清空。
sort_key：payload 非 0 时替换；payload 是 0 而确认值非 0 时，保留确认值。V1 因此不能把排序改回 0。
link 的 stance、summary：payload 为 null 时保留确认值，非 null 时替换。V1 因此不能把这两项清空。
用户确认时必须检查 proposal.base_revision_id == entry.confirmed_revision_id，link 同样比较 link 的确认修订。不要和 current_revision_id 比较。不一致就拒绝并保持 pending，不自动合并，不自动生成新提案。用户可以拒绝旧提案，再让 Assistant 基于新 Canon 另提一份。

create 成功时新建行，两个指针指向第一版修订，并把新 id 写回提案的 target_id。retire 成功时沿用现在的停用修订：entry 保留原文并标记 retired，link 保留 stance 和 summary，confirmed 置空。

审计继续用现有四类动作：bible_proposal_create、bible_proposal_conflict、bible_proposal_accept、bible_proposal_reject。accept 的 detail 已有 proposal、target、op 和 accepted_revision_id。可以在同一份 JSON 里加上 previous_confirmed_revision_id 和实际覆盖的 attribute 键，不必改表。

4. 需要修改的文件
canon/bible.py：只改 _apply_proposal() 的 entry update 和 link update 组装。update_bible_entry()、update_bible_link() 的整份写入语义不变。
新增 tests/test_bible_proposal_apply.py。
agents/assistant.py 继续只创建 pending 提案，不调用 confirm。

5. 不应该修改的 frozen modules
agents/writer.py、pipeline/chapter_flow.py、pipeline/outline_gen.py、pipeline/state_extract.py
memory/pack.py
canon/characters.py、canon/world.py、canon/state_store.py、canon/outline_flow.py、canon/impact.py、canon/summaries.py
prose/revisions.py
providers/
storage/migrations/
Continuation V1
frontend
HTTP routes
canon/bible.py 是 Story Bible V1 的冻结文件，但是这次唯一需要动的实现位置。不要另写一套确认函数，否则直接调用现有 confirm 仍会覆盖 attributes。

6. 测试计划
新增测试，并保留现有 Story Bible、Assistant、Continuation 全量通过：

只改 current_state 时，motivation、personality、role 仍在新确认修订里，current_state 变为新值。
新修订的 parent 是提案的 base_revision_id。旧修订内容不变。
确认后 current_revision_id 与 confirmed_revision_id 都是新修订。
base_revision_id 与当前 confirmed_revision_id 不一致时，结果为 conflict，提案仍 pending，两个指针和正文都不变。
用 current_revision_id 不能通过确认。
同一提案第二次 confirm 返回 409，不增加修订。
create 产生新条目，两个指针指向新修订，旧 Canon 其他行不变。重复 kind 和 title 保持 conflict。
retire 后 confirmed 为 null，current 指向停用修订，历史仍可查，read_confirmed_bible() 不再返回它。
link update 只改 summary 时，原 stance 还在。link create 和 link retire 遵循现有指针规则。
reject 不改变 Canon。
空 body、sort_key 0 不会清掉已有正文和非零排序。

Assistant 创建提案的路径仍然不调用 confirm。
不改大纲、正文、Stage 2B state。
7. 是否需要 migration
不需要 migration，也不需要新表。bible_proposal、修订表和 audit_log.detail_json 已经够用。

## Response:
10/6/2026, 6:10:22 AM · gpt-5-6

这个只读审计结果我认为 **PASS，而且设计边界非常清楚**。现在已经可以进入 **AI Assistant Proposal Apply V1 实现**。

不过有一个地方我建议在实现前明确：**`body_md=""` 和 `sort_key=0` 的处理是当前 Proposal schema 设计造成的“缺省值歧义”**。V1 可以按审计建议做兼容保留，但长期最好让 proposal 明确区分“未修改”和“主动设置为空/0”。这不需要现在扩展范围。

### 当前结论

Apply V1 最小方案可以定为：

```text
pending proposal
      ↓
confirm_bible_proposal()
      ↓
检查 base_revision_id
      ↓
读取 base confirmed revision
      ↓
Patch/Merge proposal payload
      ↓
生成完整新 revision
      ↓
current_revision_id ─┐
                     ├→ new revision
confirmed_revision_id┘
      ↓
proposal = accepted
```

而不是重新设计一套 Apply 系统。

### 最重要的安全规则

**1. 永远基于 `confirmed_revision_id`。**

不能拿 `current_revision_id` 当 Canon 基准。

**2. update 必须 merge，而不是整体覆盖。**

例如：

```text
原：
current_state = 在盐港查案
motivation   = 查清旧案
personality  = 冷静
role         = 主角

Proposal：
current_state = 寻找姐姐

Apply 后：
current_state = 寻找姐姐
motivation   = 查清旧案
personality  = 冷静
role         = 主角
```

这正是这次 Apply V1 最关键的修复。

**3. 冲突不自动合并。**

```text
base_revision_id != confirmed_revision_id
                    ↓
                 conflict
                    ↓
             proposal 保持 pending
                    ↓
                  Canon 不动
```

这个决定很好。后面再做自动 merge。

**4. Assistant 仍然没有 Apply 权限。**

Assistant：

```text

Assistant → create pending proposal
```

用户：

```text

User → confirm
```

只有第二步才能改变 Canon。

---

## 文件边界也合理

这次实现应该严格控制在：

```text
canon/bible.py
tests/test_bible_proposal_apply.py
```

其中 `canon/bible.py` 虽然属于 Story Bible V1 冻结文件，但这里属于**对已冻结 API 的必要安全修复/扩展**，而不是重新设计 Story Bible。

尤其不要：

- ❌ 新建另一套 `apply_proposal()`
- ❌ 改 Assistant
- ❌ 改 Provider
- ❌ 改 migration
- ❌ 改 Writer
- ❌ 改 Continuation
- ❌ 改 HTTP
- ❌ 改 frontend

---

# 现在可以给 Cursor 实现了

你可以直接把下面这段发给 Cursor Agent：

```text
AI Assistant Proposal Apply V1 的只读架构审计 PASS。

现在开始实现 Apply V1。

基线必须保持：

Story Bible V1:
590434efea52f46cc084b3d4edaecabf5455da3e

Assistant Read-Only V1:
ad26aa0636f777189f89886d669d737ea0b946fd

Assistant Proposal V1:
7668755e7866efbb6cab2e8e7241ee63fcc90b96

目标：

实现“用户确认 pending Story Bible proposal → 安全生成新的 Canon revision”。

核心原则：

1. 继续使用现有 confirm_bible_proposal() 作为唯一确认入口。
2. 不创建第二套 confirm/apply API。
3. create、retire、reject、conflict、重复 confirm 的既有行为保持不变。
4. Assistant 仍然只能创建 pending proposal，不能调用 confirm/reject。
5. 不修改 HTTP/frontend。
6. 不需要 migration。
7. 不修改 frozen 的 Writer、Continuation、Provider、memory、state、outline 等模块。

允许修改的生产文件只有：

canon/bible.py

新增测试：

tests/test_bible_proposal_apply.py

核心修复：

现有 update proposal 是完整文档形状，但 attributes 是模型实际提供的稀疏字段。

因此 confirm entry update 时：

1. 使用 proposal.base_revision_id 找到对应的 confirmed revision。
2. 读取该 revision 的完整：
   title
   body_md
   attributes
   sort_key
3. proposal.payload.attributes 只覆盖其中实际存在的 key。
4. 没有出现在 payload.attributes 中的旧 attribute 必须保留。
5. 不允许 proposal payload 通过这种 patch 机制设置 retired。
6. title 使用 payload 中的 title。
7. body_md：
   - payload 非空时使用 payload.body_md
   - payload 为 "" 时，如果 base body 非空，则保留 base body
8. sort_key：
   - payload 非 0 时使用 payload.sort_key
   - payload 为 0 时，如果 base sort_key 非 0，则保留 base sort_key

link update：

1. 以 proposal.base_revision_id 对应的 confirmed revision 为基础。
2. payload.stance 非 null 才覆盖。
3. payload.stance 为 null 时保留原 stance。
4. payload.summary 非 null 才覆盖。
5. payload.summary 为 null 时保留原 summary。

并发规则：

update / retire：
proposal.base_revision_id 必须等于目标当前 confirmed_revision_id。

如果不相等：

- outcome = conflict
- proposal 保持 pending
- Canon 不变
- 不创建新 revision
- 不移动 current_revision_id
- 不移动 confirmed_revision_id
- 写现有 bible_proposal_conflict audit

绝对不要使用 current_revision_id 作为并发基准。

成功 update：

- parent_revision_id = proposal.base_revision_id
- 创建新的完整 revision
- current_revision_id = new revision
- confirmed_revision_id = new revision
- proposal.status = accepted
- accepted_revision_id = new revision
- 写现有 bible_proposal_accept audit

create / retire / reject / duplicate-confirm：
尽可能完全保持现有行为，不做无关重构。

Retire：
继续使用现有语义：

entry：
- 基于确认 revision
- 保留原 title/body/attributes/sort_key
- attributes 中标记 retired=true
- current_revision_id 指向停用 revision
- confirmed_revision_id = null

link：
- 保留原 stance/summary
- current_revision_id 指向停用 revision
- confirmed_revision_id = null

测试必须覆盖：

1. update current_state 时保留 motivation
2. 保留 personality
3. 保留 role
4. 未修改 attributes 全部保留
5. 新 revision parent = base_revision_id
6. 旧 revision 内容不变
7. 成功后 current_revision_id = confirmed_revision_id = new revision
8. stale base → conflict
9. stale proposal 保持 pending
10. stale proposal 不改变 Canon
11. current_revision_id 不能作为 base 绕过检查
12. duplicate confirm 不产生第二 revision
13. create 成功
14. create duplicate conflict
15. retire 成功
16. retired entry 不出现在 read_confirmed_bible()
17. link update 只改 summary 时保留 stance
18. link create
19. link retire
20. reject 不改变 Canon
21. body_md="" 不清空原有非空正文
22. sort_key=0 不覆盖原有非零 sort_key
23. Assistant proposal 路径仍不调用 confirm
24. proposal apply 不修改 outline
25. proposal apply 不修改 prose
26. proposal apply 不修改 Stage2B state
27. audit_log 正确记录

特别测试真实结构：

base：
attributes = {
  current_state: "在盐港查案",
  motivation: "查清旧案",
  personality: "冷静",
  role: "主角"
}

proposal：
attributes = {
  current_state: "寻找姐姐"
}

confirm 后必须是：

attributes = {
  current_state: "寻找姐姐",
  motivation: "查清旧案",
  personality: "冷静",
  role: "主角"
}

不要改变用户直接编辑 API：
update_bible_entry() 和 update_bible_link() 仍然保持完整文档写入语义。

不要修改 schema。
不要修改 Assistant。
不要新增 migration。
不要修改 HTTP/frontend。

完成后执行：

1. 新增 Apply V1 测试
2. Story Bible 全部测试
3. Assistant 全部测试
4. Continuation 全部测试
5. full pytest
6. git diff --check
7. git status

不要 commit。
不要 push。

最终报告：

- PASS / FAIL
- 修改文件
- 新增测试数量
- Apply V1 测试结果
- Story Bible 测试结果
- Assistant 测试结果
- Continuation 测试结果
- full pytest
- frozen modules 是否保持不变
- 是否需要 migration
- git diff --check
- git status
```

**这一步完成后也先不要提交。**
等 Cursor 返回实现结果，我们再做一次代码级验收；如果通过，才冻结 **Proposal Apply V1**。

## Prompt:
10/6/2026, 6:18:25 AM

Apply 只改确认时的 update 组装：attributes 按字段合并，update_bible_entry() 和 update_bible_link() 仍按完整文档写入。我先对照现有确认路径再改。

三次重复读取可以收成一次。我改成先取出 base revision，再按字段合并。

PASS

确认一条 entry update 时，attributes 会合并进 base_revision_id 对应的确认修订，未出现的字段会保留。update_bible_entry() 和 update_bible_link() 仍然整份写入。

修改文件： canon/bible.py、tests/test_bible_proposal_apply.py（新增）
新增测试数量： 15
Apply V1 测试： 15 passed
Story Bible 测试： 27 passed

Assistant 测试： 28 passed
Continuation 测试： 22 passed
full pytest： 246 passed
frozen modules： Writer、Continuation、Provider、memory、state、outline、Assistant、schema、HTTP、frontend 都没有改。生产代码只动了 canon/bible.py 里的 update 确认组装。
migration： 不需要
git diff --check： 通过
git status： canon/bible.py 已修改，tests/test_bible_proposal_apply.py 未跟踪。ai_novel_studio.egg-info/ 和 experiments/ 仍是原有未跟踪目录。没有 commit，没有 push。
以「在盐港查案 / 查清旧案 / 冷静 / 主角」为底，只提交 current_state: 寻找姐姐 后，确认结果是「寻找姐姐 / 查清旧案 / 冷静 / 主角」。body_md 为 "" 时保留非空正文，sort_key 为 0 时保留非零排序。link 只改 summary 时保留 stance。过期 base 和把 current_revision_id 当作 base 都会 conflict，提案保持 pending，Canon 不变。

## Response:
10/6/2026, 6:18:29 AM · gpt-5-6

这次可以判定 **PASS**。而且从结果看，Apply V1 正好解决了我们上一轮审计发现的核心风险。

### AI Assistant Proposal Apply V1：当前验收

| 项目 | 结果 |
|---|---|
| Entry attributes 字段级合并 | ✅ |
| 未修改字段保留 | ✅ |
| `body_md=""` 不误清空 | ✅ |
| `sort_key=0` 不误覆盖 | ✅ |
| Link 部分修改保留其他字段 | ✅ |
| 基于 `base_revision_id` | ✅ |
| `current_revision_id` 不能冒充 base | ✅ |
| stale proposal → conflict | ✅ |
| conflict 后 Canon 不变 | ✅ |
| proposal 保持 pending | ✅ |
| parent revision 正确 | ✅ |
| 新 revision 正确生成 | ✅ |
| 原有直接编辑 API 未改变 | ✅ |
| Assistant 不直接 confirm | ✅ |
| 无 migration | ✅ |
| 15 个新增测试 | ✅ |
| Apply V1 测试 | **15 passed** |
| Story Bible | **27 passed** |
| Assistant | **28 passed** |
| Continuation | **22 passed** |
| 全量 pytest | **246 passed** |
| `git diff --check` | ✅ |
| 无 push | ✅ |
| 无 commit | ✅ |

最关键的实际验证：

```text
原 Canon
current_state = 在盐港查案
motivation   = 查清旧案
personality  = 冷静
role         = 主角

Proposal
current_state = 寻找姐姐

Apply 后
current_state = 寻找姐姐
motivation   = 查清旧案
personality  = 冷静
role         = 主角
```

这说明我们之前担心的 **“Assistant 一个字段修改导致整个 attributes 被覆盖”** 已经解决。

---

## 现在的 Assistant 权限链已经完整了

目前已经形成：

```text
                 ┌─────────────────┐
                 │   User Question │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ AI Assistant    │
                 │ Read / Analyze  │
                 └────────┬────────┘
                          ↓
                  ┌───────────────┐
                  │    Proposal   │
                  └───────┬───────┘
                          ↓
                       pending
                          ↓
                 ┌─────────────────┐
                 │   User Confirm  │
                 └────────┬────────┘
                          ↓
                base_revision check
                          ↓
                    Patch / Merge
                          ↓
                  New Canon Revision
                          ↓
             current = confirmed = new
```

而冲突则是：

```text
base_revision ≠ confirmed_revision
              ↓
           conflict
              ↓
       pending remains
              ↓
         Canon unchanged
```

这套边界是正确的。

---

# 现在不要继续开发

**下一步应该冻结 Apply V1。**

目前工作区：

```text
canon/bible.py
tests/test_bible_proposal_apply.py
```

正好是我们允许的两个文件。

你可以让 Cursor 执行一次**冻结提交**，要求与之前一样：

```text
AI Assistant Proposal Apply V1 验收通过。

现在只做冻结提交，不修改代码，不新增功能，不 push。

本次 commit 只允许包含：

canon/bible.py
tests/test_bible_proposal_apply.py

不要提交：

ai_novel_studio.egg-info/
experiments/

提交前再次执行：

1. git diff --check
2. pytest -q
3. git status --short
4. git diff --stat

确认 full pytest = 246 passed。

确认没有修改：
- Writer
- Continuation
- Provider
- memory
- state
- outline
- Assistant
- Assistant schema
- HTTP routes
- frontend
- migration

然后创建唯一 commit：

Freeze AI Assistant Proposal Apply V1

不要 push。

完成后告诉我：

1. commit hash
2. commit 包含的文件
3. pytest 结果
4. git status
5. git diff --check
```

### 目前阶段进度

我们现在已经完成：

```text
Story Bible V1
       ↓

Assistant Read-Only V1
       ↓

Assistant Proposal V1
       ↓

Assistant Proposal Apply V1
```

也就是说，**AI Assistant 已经具备从“理解用户请求”到“提出修改”再到“用户确认后安全修改 Story Bible”的完整闭环。**

但还**不要把它扩展到大纲、正文、人物系统、State 等其他对象**。先把这个阶段冻结，之后再进入下一个架构阶段。

## Prompt:
10/6/2026, 6:25:06 AM

冻结提交只包含这两个 Apply V1 文件。我先核对差异并跑全量测试，确认范围后再提交。

冻结提交已完成，没有 push。

commit hash： 07c43008dab80b8fc11e999a0d20562958d7d7c2

commit 包含的文件：

canon/bible.py
tests/test_bible_proposal_apply.py
pytest 结果： 246 passed

git status： 分支 cursor/outline-generate-toast-afb4 比远端超前 6 个提交。工作区只剩下未跟踪的 ai_novel_studio.egg-info/ 和 experiments/，没有进入这次提交。

git diff --check： 通过。暂存内容的检查也通过。

Writer、Continuation、Provider、memory、state、outline、Assistant、Assistant schema、HTTP routes、frontend 和 migration 都没有出现在这次提交里。

## Response:
10/6/2026, 6:25:12 AM · gpt-5-6

很好，**AI Assistant Proposal Apply V1 正式冻结**。✅

当前冻结链已经非常清晰：

```text
Story Bible V1
590434ef...
      ↓

Assistant Read-Only V1
ad26aa0...
      ↓

Assistant Proposal V1
7668755e...
      ↓

Assistant Proposal Apply V1
07c43008dab80b8fc11e999a0d20562958d7d7c2
```

### Apply V1：FROZEN

最终验收：

- ✅ commit 仅包含 `canon/bible.py`
- ✅ `tests/test_bible_proposal_apply.py`
- ✅ `246 passed`
- ✅ `git diff --check` 通过
- ✅ 暂存内容检查通过
- ✅ 没有 push
- ✅ `ai_novel_studio.egg-info/`、`experiments/` 未提交
- ✅ Writer / Continuation / Provider 未动
- ✅ Assistant / schema 未动
- ✅ memory / state / outline 未动
- ✅ HTTP / frontend 未动
- ✅ migration 未动

而且现在最重要的是，**Apply 已经不是简单覆盖，而是基于确认版本进行安全字段合并，并通过 revision 机制产生新的 Canon。**

---

## AI Assistant 目前已经完成一个完整的 Canon 闭环

```text
                 AI Assistant
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
       Query / Analysis       Modification
          │                       │
       Read-only              Proposal
                                  │
                               pending
                                  │
                           User confirms
                                  │
                         base revision check
                                  │
                         Patch / Merge
                                  │
                           New Revision
                                  │
                       Updated Story Bible
```

同时具备：

```text
stale proposal
      ↓
   conflict
      ↓
 Canon unchanged
```

这已经是一个相当重要的架构里程碑。

---

# 下一阶段

按照我们之前确定的路线，**下一步不应该马上做更多 Assistant 写入功能**。

接下来应该进入：

### Million-Word Architecture V1

也就是把小说从：

```text
Story
 └── Chapters
```

升级为：

```text
Story
 ├── Overall Story Architecture
 │
 ├── Volume 1
 │    ├── Arc 1
 │    │    ├── Chapter 1
 │    │    │    ├── Scene 1
 │    │    │    ├── Scene 2
 │    │    │    └── Scene 3
 │    │    └── Chapter 2
 │    └── Arc 2
 │
 ├── Volume 2
 │    └── ...
 │
 └── Volume N
```

这一步非常重要，因为它是之后：

- 百万字小说
- Scene Planning
- Continuity Engine
- Writer 2.0
- Revision Impact
- AI Assistant 修改大纲

的基础。

**但我们仍然不要直接让 Cursor 改代码。**

下一步最好先做一次 **Million-Word Architecture V1 只读架构审计**，确认现有 `story_outline`、chapter、revision 等结构到底能复用多少，以及 Volume → Arc → Chapter → Scene 应该如何最小化落地。

如果你准备继续，我建议下一条就让 Cursor 做这个只读审计，**不改代码、不 commit、不 push**。

## Prompt:
10/6/2026, 6:25:57 AM

我要怎么做

## Response:
10/6/2026, 6:26:00 AM · gpt-5-6

你现在**不要改代码**。我们已经把 Assistant 的 Proposal 闭环冻结好了，下一步先让 Cursor 对“百万字架构”做一次只读审计。

你直接把下面整段复制给 **Cursor Agent**：

```text
AI Assistant Proposal Apply V1 已正式冻结。

当前冻结基线：

Story Bible V1
590434efea52f46cc084b3d4edaecabf5455da3e

AI Assistant Read-Only V1
ad26aa0636f777189f89886d669d737ea0b946fd

AI Assistant Proposal V1
7668755e7866efbb6cab2e8e7241ee63fcc90b96

AI Assistant Proposal Apply V1
07c43008dab80b8fc11e999a0d20562958d7d7c2

现在开始下一阶段：

Million-Word Architecture V1 只读架构审计。

重要：
本阶段只做 READ-ONLY AUDIT。
不要修改任何代码。
不要创建 migration。
不要创建测试。
不要 commit。
不要 push。

目标：

评估现有 AI Novel Studio 是否能够以最小改动支持：

Overall Story
→ Volume
→ Arc
→ Chapter
→ Scene

并且能够支撑百万字规模的长篇小说，而不是把百万字正文全部塞进模型 Context。

请重点审计现有：

1. canon/outline_flow.py
2. canon/chapters.py
3. canon/summaries.py
4. memory/pack.py
5. prose/revisions.py
6. canon/state_store.py
7. canon/impact.py
8. agents/assistant_context.py
9. agents/assistant.py
10. pipeline/chapter_flow.py
11. pipeline/outline_gen.py
12. storage/migrations/project/
13. 现有 outline/story/chapter revision 数据结构
14. 现有测试

重点回答：

A. 当前 Story Outline 的实际数据结构是什么？

B. 当前是否已经支持：
   - story
   - volume
   - arc
   - chapter
   - scene

C. 如果不支持，缺少什么？

D. Chapter 当前和 Outline 是什么关系？

E. Chapter 是否有稳定 ID、排序、父级结构？

F. Revision 机制能否复用于 Volume / Arc / Scene？

G. 当前是否存在“无限递归/树状结构”的基础？
   如果没有，最小实现应该是什么？

H. Scene 是否应该作为独立 Canon 对象？
   还是作为 Chapter 下的结构化 plan？

I. 百万字小说应该如何避免把全文放进 Model Context？

请重点分析未来 Context 层级：

Project-level
→ Story-level
→ Volume-level
→ Arc-level
→ Chapter-level
→ Scene-level
→ Current prose window

分别应该进入什么 Context。

J. 现有 memory/pack.py 哪些机制可以复用？

K. 现有 summary 机制能否承担跨章节压缩记忆？

L. Continuity State 应该绑定在哪个层级？

M. Story Bible 与 Outline 的边界应该是什么？

N. AI Assistant 将来如何读取：
   - 当前卷
   - 当前 Arc
   - 当前 Chapter
   - 当前 Scene
   - 前文摘要
   - Continuity State

O. AI Assistant 将来修改 Outline 时，是否应该复用目前已经验证的：

query
→ proposal
→ pending
→ user confirm
→ apply
→ revision

模式？

P. 如果未来要支持：

“把第三卷第二 Arc 的节奏放慢一点”

应该修改什么对象？

Q. 如果用户说：

“把第 37 章拆成 5 个 Scene”

应该生成什么类型的 Proposal？

R. 如果用户说：

“重新安排整个第三卷的剧情”

应该如何避免一次性把整个小说加载进 Context？

S. 当前数据库是否需要新的 migration？

T. 当前数据库是否需要新的表？

U. 最小可行的数据模型是什么？

请特别比较以下两个设计：

方案 A：

Story
 └── Chapter
      └── Scene

方案 B：

Story
 └── Volume
      └── Arc
           └── Chapter
                └── Scene

判断哪一个更适合作为长期百万字小说架构。

同时分析：

是否应该让 Volume / Arc / Chapter / Scene 全部成为同一种“Outline Node”，
还是使用不同的实体表。

不要因为“百万字”就过度设计。

优先：
- 复用现有结构
- append-only revision
- 稳定 ID
- 明确 parent
- 明确 sort/order
- 小 Context
- 可局部读取
- 可局部修改
- 可 revision / revert
- 不加载整个小说

最终只输出：

1. 当前架构能力
2. 当前缺口
3. 方案 A vs B
4. 推荐的数据模型
5. Context 分层方案
6. Assistant 未来如何操作 Outline
7. Continuity 如何接入
8. 最小需要修改的文件
9. 是否需要 migration
10. 是否需要新表
11. 测试计划
12. 明确列出所有不应该修改的 frozen modules

再次强调：

只读审计。
不要改代码。
不要创建 migration。
不要创建测试。
不要 commit。
不要 push。
```

### 你现在的操作顺序

就是这三个步骤：

**① 把上面内容复制给 Cursor Agent**

**② 等它完成审计**

**③ 把 Cursor 返回的完整结果复制给我**

先不要让它实现。

我会先帮你判断它提出的 **Volume → Arc → Chapter → Scene** 架构是否合理，然后我们再决定具体怎么做。

目前你这边的 Git 状态不用处理，**也不要 push**。现在已经有 6 个本地提交超前远端，这是我们之前有意保持的状态。

## Prompt:
10/6/2026, 6:30:02 AM

如果我让AI Assistant去做它做不到的事情，它会做吗？还是会告诉我它无法完成

## Response:
10/6/2026, 6:30:08 AM · gpt-5-6

按照我们现在给 AI Assistant 设计的权限模型，**它不应该“硬做”自己没有能力或权限完成的事情**。

更准确地说，它应该区分三种情况：

### 1. 能直接完成 → 直接完成

例如：

> “周予安现在是什么状态？”

Assistant 可以读取已确认的 Story Bible，然后回答。

```text
用户
 ↓

Assistant 读取 Canon
 ↓
回答
```

---

### 2. 有能力提出修改，但需要你确认 → 提出 Proposal

例如：

> “把周予安的当前状态改成正在寻找姐姐。”

它不会直接修改，而是：

```text

Assistant
 ↓
生成 Proposal
 ↓
pending
 ↓
等待你确认
```

然后你确认，它才 Apply。

这正是我们刚刚完成的 **Proposal V1 + Apply V1**。

---

### 3. 当前系统根本不支持 → 应该明确告诉你

例如现在如果你说：

> “帮我把第三卷所有章节重新规划一遍，然后直接修改大纲。”

如果我们还没有实现 **Outline Proposal / Apply**，Assistant 不应该偷偷修改，也不应该假装已经修改。

理想回答应该类似：

> “我可以分析第三卷并提出完整的重构方案，但当前我只能修改已支持的 Story Bible Proposal，暂时不能直接应用大纲修改。下面是我建议的调整方案……”

也就是说：

**不能做 ≠ 什么都不做。**

它应该尽可能完成自己能够完成的部分，并明确指出剩余部分。

---

## 更重要的是：它不能假装自己做到了

这是我们这个项目非常重要的一条原则。

比如用户说：

> “删除第 20 章。”

如果系统目前没有 Chapter Delete / Proposal Apply 能力，它不能回答：

> “好的，第 20 章已经删除。”

而应该：

```text
能力检查
    ↓
当前系统没有 Chapter Delete 权限
    ↓
不能执行
    ↓
告诉用户原因
    ↓
如果可以 → 给出方案 / Proposal
```

---

# 未来我建议把 Assistant 做成这样的“能力路由”

```text
                    用户请求
                       ↓
                Intent / Capability
                    判断
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      READ           PROPOSE        UNSUPPORTED
        ↓              ↓              ↓
     直接回答       生成提案       明确告诉用户
                       ↓
                   pending
                       ↓
                  用户确认
                       ↓
                     Apply
```

而且还应该增加一个非常重要的状态：

### `PARTIAL`

例如：

> “帮我重新规划第三卷，并修改相关人物关系。”

未来可能出现：

```text
第三卷结构分析       ✅
Arc 重排 Proposal     ✅
人物关系 Proposal     ✅
直接修改正文           ❌
```

Assistant 就应该告诉你：

> “我可以完成前三项，但当前不能直接修改正文。”

而不是因为其中一项做不到，就全部拒绝。

---

## 这对我们现在正在做的 Million-Word Architecture 很重要

因为未来 Assistant 的能力会越来越多：

```text
                    AI Assistant
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     Story Bible       Outline         Prose
        │                │                │
      Query           Query            Query
      Proposal        Proposal         Proposal
      Apply           Apply            Apply
        │                │                │
        └────────────────┼────────────────┘
                         ↓
                  Continuity Engine
```

每个模块都有自己的**能力边界和权限**。

所以最终 Assistant 不应该是：

> “用户让我做什么，我就想办法做什么。”

而应该是：

> **“我判断你的目标是什么，然后检查我目前拥有的工具、数据和权限；能做的就做，需要确认的就提案，做不到的明确告诉你，并尽可能完成剩余部分。”**

这会比一个“什么都敢答应”的 AI **可靠得多**。

## Prompt:
10/6/2026, 6:31:11 AM

这次只做只读审计，不改代码。我先核对大纲、章节、摘要和上下文是怎么分层存储的。

现有结构已经是 Story → Volume → Chapter，Scene 只是章节大纲里的节拍。它能按章写正文，不会把其他章全文送进模型；缺的是 Arc，以及 Assistant 仍会读取整份总大纲和全部章节摘要。

1. 当前架构能力
总大纲是一份追加写入的文档，不是无限层级的树。story_outline 上有 current_revision_id 和 confirmed_revision_id。每一版 story_outline_revision 的 structured_json 包含：

故事级 requirements、prohibitions
volumes[]：稳定 id、order、title、goal
每卷里的 chapters[]：稳定 id、order、title、goal、required_events、prohibitions
每章里的 scenes[]：只有 order 和 purpose，没有独立 id
split_story() 把这份文档拆成实体。volume 有稳定 id、order_index、branch_id，以及卷大纲的 current/confirmed 修订。chapter 有稳定 id、volume_id、order_index、global_index、reading_order。有正文之后 global_index 不再改。章节大纲修订挂着 story_outline_revision_id 和 volume_outline_revision_id，同样追加写入，并用 current/confirmed 两个指针。

写作包已经避免把其他章全文放进上下文。最近 3 章用完整摘要，更早的章只用事件行，其他章的 prose_revision 被排除。总大纲进入写作包时会被切到当前卷、当前章。卷大纲和章大纲用已确认修订。Scene 只作为 scene_sketch 附在章大纲上。Story Bible 最多 24 条已确认事实。Stage 2B 状态按分支读取，并以当前章为时点。

人物卡上的 arc_json 是人物命运，不是故事结构里的 Arc。数据库里没有故事 Arc 表，chapter.plan_json 也没有被代码使用。

2. 当前缺口
没有故事级 Arc。Scene 不是 Canon 对象，不能单独修订、确认或恢复。

总大纲修订仍把所有卷、章、场景嵌在同一份 JSON 里。generate_story() 和 revise_story() 把整份大纲交给模型。Assistant 读取的是整份已确认总大纲 Markdown，并且把每一章的完整摘要都放进上下文。写作包虽然切了总大纲，但仍放入当前卷的整份卷大纲，以及全部人物卡和世界条目。

大纲修改现在是直接 save 再 confirm，会移动 current 指针。它没有 Bible 那种「pending、不移动指针、按 base_revision_id 冲突检查」的提案。

没有卷摘要或 Arc 摘要。跨章压缩只有章摘要。章数变多以后，Assistant 这条「每章全文摘要」会先撑满上下文。

3. 方案 A vs B
方案 A 是 Story → Chapter → Scene。它丢掉已经在用的 Volume。卷今天承担拆章、篇幅继承、确认链路和写作包边界，不该拆掉。

方案 B 是 Story → Volume → Arc → Chapter → Scene。它和现有库表一致，也是百万字的自然阅读边界：写某一章时只取当前卷，而不是整部小说。Arc 是现在缺的节奏单位，用来表达「第三卷第二段放慢」。Scene 继续做章内计划，不承担正文。

长期架构用方案 B。不把四层收成同一种 Outline Node。Volume 和 Chapter 的职责不同：只有 Chapter 有正文、摘要、状态来源和 impact。Scene 没有正文。统一节点表会逼着每次读取都去遍历父链，也会改动已经冻结的大纲链路。固定这四层就够，不需要无限递归。

4. 推荐的数据模型
继续用现有表，不新建通用树。

Story：只保留要求、禁止，以及各卷的 id、顺序、标题、目标。服务端拼接整份文档，模型只看当前范围。
Volume：继续用 volume 和 volume_outline_revision。
Arc：先写在卷大纲的 structured_json 里，形如 arcs[]，每项有稳定 id、order、title、goal，以及所属 chapter_id 列表。不建 arc 表，也不给 chapter 加外键。
Chapter：继续用 chapter 和 chapter_outline_revision。id 保持稳定。
Scene：继续放在章大纲的 scenes[]。后续可以在 JSON 里加稳定 id，仍然不建表。
「把第 37 章拆成 5 个 Scene」不产生 5 个新章，也不产生 Scene 行。它是一条章节大纲提案，payload 是 5 个 {order, purpose}。确认后追加一版 chapter_outline_revision，parent_revision_id 等于当时的 confirmed 修订，章 id 不变，正文不动。

「把第三卷第二 Arc 的节奏放慢」修改的是第三卷大纲里的那个 Arc，以及它点到的章节目标。不改 Story Bible，不改已有正文。确认后追加一版卷大纲修订，并为这些章打开现有的 chapter_impact，表示大纲变了、正文不自动改写。

「重新安排第三卷」只读：故事级要求和禁止、第三卷已确认大纲、前后卷的标题和目标各一行、这一卷各章的事件行、相关 Bible 事实。模型返回一份卷大纲提案。其他卷的章节和全部正文都不进入上下文。

5. Context 分层方案
层级	进入上下文的内容
Project
书名、语言、篇幅策略
Story
要求、禁止、各卷标题和目标。不含各章场景
Volume
只有当前卷的已确认大纲。邻卷只留标题和目标
Arc
当前 Arc 的目标和它包含的章标题。其他 Arc 不展开场景
Chapter
当前章的已确认大纲：目标、必须发生、禁止、场景
Scene
当前要讨论的场景用途。没有场景正文
当前正文窗口
调用方给出的本章片段。其他章永不放入 body_md
前文
近 3 章用完整摘要，更早的章只用事件行
Bible
已确认事实，维持上限
Continuity
以当前章为时点的已确认 Stage 2B 状态
写作包里的 _story_slice()、近章摘要和排除其他章正文可以复用。Assistant 现在把整份总大纲和全部完整摘要放进去，这是百万字时要先收窄的地方。

6. Assistant 未来如何操作 Outline
沿用已经验证的路径：query 只读；明确修改才产生 proposal；proposal 保持 pending；用户确认后才 apply；apply 追加 revision。Assistant 仍然不能自己 confirm。

并发基准用对应大纲的 confirmed_revision_id，不用 current_revision_id。不一致就 conflict，指针和正文都不动。

提案目标：

改某一章的场景、目标或事件：chapter_outline
改某一卷的节奏或 Arc：volume_outline
只改故事级要求或卷目录：story_outline 的一个切片，而不是整份重写
现有 bible_proposal.target_kind 只有 entry 和 link，不能直接拿来存大纲提案。第一刀也不必为了这个加表：未挂上 current/confirmed 指针的大纲修订可以先充当待确认版本，parent 必须是当时的 confirmed 修订。真正需要独立提案表时再迁移。

7. Continuity 如何接入
状态继续绑在分支上，读取时点是当前章。read_confirmed_state() 已经这样做。不把 State 复制到 Volume 或 Arc。

人物当前状态、关系、时间、情节线都从已确认修订里来，来源章记在修订上。卷或 Arc 的节奏调整只打开 chapter_impact，不改写 State，也不改 Story Bible。

边界是：Bible 保存跨章仍然成立的事实；Outline 保存计划中哪一卷、哪一段、哪一章、哪一场发生什么。计划可以改，事实要等正文确认后才进入 Bible 或 State。

8. 最小需要修改的文件
以后做第一刀时，生产代码主要是：

canon/outline_doc.py：卷 JSON 可选 arcs，场景继续嵌在章内
canon/outline_flow.py：按卷或按章确认，服务端拼接，不把整部大纲发给模型
agents/assistant_context.py：总大纲改切片，旧章摘要改事件行
agents/assistant.py：只增加大纲 pending proposal
memory/pack.py：当前卷过大时只送当前 Arc 和章节标题，不送整卷场景
新增大纲提案测试
pipeline/outline_gen.py 只有在故事生成也要改成切片时才动。

9. 是否需要 migration
第一刀不需要。Arc 放在卷大纲 JSON，Scene 放在章大纲 JSON，修订表和指针都已经存在。

以后只有在 Chapter 必须用外键指向 Arc，或大纲修订作者要正式写成 assistant 时，才需要 migration。现有章节大纲作者只允许 user 和 planner。

10. 是否需要新表
不需要。不建 outline_node，不建 scene，也不在第一刀建 arc。

Volume、Chapter、大纲修订、章摘要、正文修订、Bible 和 State 都继续用现表。

11. 测试计划
写作和 Assistant 上下文不含其他章正文，也不含其他卷的章节场景。
近章是完整摘要，更早的章是事件行。
把一章拆成 5 个 Scene 只生成章节大纲 pending proposal，章 id 不变。
确认后新修订的 parent 是原来的 confirmed 修订，正文、State、Bible 不变。
用 current_revision_id 或过期 base 确认，结果是 conflict。
放慢第三卷某个 Arc 时，模型上下文只有该卷大纲和该卷事件行。
直接 update 章或卷的现有保存接口行为不变。
Story Bible、Assistant、Continuation 的现有测试保持通过。
12. 不应该修改的 frozen modules
agents/writer.py
pipeline/chapter_flow.py
pipeline/state_extract.py
canon/bible.py
canon/characters.py
canon/world.py
canon/state_store.py
canon/impact.py
canon/summaries.py 的现有章摘要语义
prose/revisions.py
providers/
storage/migrations/
Continuation V1
Story Bible V1 和 Proposal Apply V1 的确认语义
frontend
HTTP routes

## Response:
10/6/2026, 6:31:15 AM · gpt-5-6

这个审计结果我建议判定为 **PASS / READY FOR IMPLEMENTATION**。而且它把我们下一阶段的核心架构问题基本理清了。

## 最重要的结论

我们正式采用：

```text
Story
  ↓
Volume
  ↓
Arc
  ↓
Chapter
  ↓
Scene
```

但**不是做成一个无限递归的通用 Outline Node**。

这是我认为目前最合理的方案。

### 各层职责

| 层级 | 作用 |
|---|---|
| Story | 整体要求、禁止、卷目录 |
| Volume | 一卷的主要目标和结构 |
| Arc | 一卷内部的剧情段落/节奏单元 |
| Chapter | 实际章节，拥有正文、摘要、State 等 |
| Scene | Chapter 内的写作计划，不单独成为 Canon |

尤其是：

> **Scene 暂时不要建表。**

这是很重要的克制。现在把 Scene 做成章大纲里的结构化对象已经足够。

---

# 还有一个非常重要的发现

审计指出：

> Assistant 目前会读取整份总大纲 + 全部章节摘要。

这其实是**百万字架构目前最大的 Context 瓶颈之一**。

所以我建议我们**第一刀不要先做 Arc**。

应该先解决：

### Context Slicing V1

把：

```text
整个 Story
+ 所有 Volume
+ 所有 Chapter
+ 所有摘要
```

变成：

```text
Project
 ↓
Story slice
 ↓
Current Volume
 ↓
Current Arc
 ↓
Current Chapter
 ↓
Current Scene
 ↓
Current prose window
```

再辅以：

```text
近 3 章 → 完整摘要
更早章节 → 事件行
其他章节正文 → 永不进入 Context
```

这样以后小说写到：

```text
100 万字
200 万字
500 万字
1000 万字
```

Context 的增长不会跟正文总字数线性增长。

---

# 我建议下一阶段分成两刀

### 第一刀：Outline Context Slicing V1

目标：

**先不让 Assistant 直接修改大纲。**

只解决：

- 总大纲切片
- Volume 切片
- Chapter 切片
- 旧章节摘要压缩
- 当前 Chapter / Scene 上下文
- Assistant Context 不再塞整个 Outline
- Writer Pack 进一步限制范围

验证：

```text
当前章
 ↓
当前 Arc
 ↓
当前 Volume
 ↓
邻卷摘要信息
 ↓
近 3 章摘要
 ↓
更早章节事件行
```

这一步完成后，我们再做 Arc。

---

### 第二刀：Outline Proposal V1

然后才实现：

```text
用户：
“把第37章拆成5个 Scene”
        ↓

Assistant
        ↓
Outline Proposal
        ↓
pending
        ↓
用户确认
        ↓
Chapter Outline Revision
```

以及：

```text
用户：
“把第三卷第二 Arc 的节奏放慢”
        ↓
Volume Outline Proposal
        ↓
pending
        ↓
用户确认
        ↓
新的 Volume Outline Revision
        ↓
相关 Chapter Impact
```

这样顺序更安全。

---

# 有一个地方我建议稍微调整审计报告

报告里说：

> “未挂上 current/confirmed 指针的大纲修订可以先充当待确认版本。”

**这个我不建议直接采用。**

因为我们已经建立了一套非常清楚的 Proposal 思维：

```text
Proposal
  ↓
pending
  ↓
confirm
  ↓
Revision
  ↓
confirmed
```

如果大纲以后也采用：

```text
创建一个 revision
↓
revision 没有 current/confirmed
↓
把它当 pending proposal
```

很容易把：

**Revision 状态**

和

**Proposal 状态**

混在一起。

更好的长期设计是：

```text
Outline Proposal
       ↓
pending
       ↓

user confirm
       ↓
create new revision
       ↓
move current + confirmed
```

这和 Story Bible 的模型是一致的。

不过**现在不要因此马上增加 migration**。

---

# 所以现在怎么做？

你现在可以继续让 Cursor 做下一步，但我建议**先只实现 Context Slicing V1**。

直接把下面这段发给 Cursor：

```text
Million-Word Architecture V1 只读审计 PASS。

采用长期架构：

Story
→ Volume
→ Arc
→ Chapter
→ Scene

但本阶段不做通用 Outline Node，不建 Arc 表，不建 Scene 表，不做无限递归。

现在开始第一刀：

Outline Context Slicing V1。

重要：
本阶段只解决 Context 分层和切片。
暂时不要实现 Outline Proposal / Apply。
不要让 Assistant 修改 Outline。
不要修改 Story Bible Proposal / Apply。

基线：

Story Bible V1
590434efea52f46cc084b3d4edaecabf5455da3e

Assistant Read-Only V1
ad26aa0636f777189f89886d669d737ea0b946fd

Assistant Proposal V1
7668755e7866efbb6cab2e8e7241ee63fcc90b96

Assistant Proposal Apply V1
07c43008dab80b8fc11e999a0d20562958d7d7c2

本阶段目标：

把 Assistant 和 Writer 的上下文从“整份总大纲 + 全部章节摘要”收窄为按层级切片。

目标 Context：

Project
→ Story slice
→ Current Volume
→ Current Arc（如果 Arc 尚未实现，则使用当前 Volume 内相关章节范围的临时切片，不新增数据库实体）
→ Current Chapter
→ Current Scene
→ Current prose window
→ Recent chapter summaries
→ Older event rows
→ Story Bible confirmed facts
→ Current Continuity State

要求：

1. Assistant Context：
   不再把整份 confirmed story outline Markdown 放进去。

2. 当前章节：
   只提供当前章 confirmed outline。

3. 当前卷：
   只提供当前卷必要的 confirmed outline。
   如果当前卷过大，不要把整卷所有 scenes 都送入 Context。

4. 其他卷：
   只保留 title + goal 等极小信息。
   不提供其他卷完整章节结构。

5. 最近 3 章：
   保留完整 summary。

6. 更早章节：
   只保留事件行 / injectable summary。
   不进入其他章节完整 prose。

7. 其他章节：
   绝对不能把 prose_revision body_md 放入 Assistant Context。

8. 当前正文：
   只允许 caller 提供 bounded current_chapter_excerpt。
   不允许 Assistant Context 自己读取整章正文。

9. Story Bible：
   保持当前 confirmed-only、最多 24 条的现有语义。

10. Continuity：
   继续使用当前章时点的 confirmed Stage2B state。
   不复制 State 到 Volume / Arc。

11. Writer Pack：
   保持现有的其他章节正文排除机制。
   只在必要处收窄 story slice。
   不修改 Writer prompt。

12. 不新增 Arc 表。
13. 不新增 Scene 表。
14. 不新增 migration。
15. 不修改 Outline 的保存/确认语义。
16. 不实现 Outline Proposal。
17. 不修改 Assistant 的 proposal 权限。
18. 不修改 Story Bible。

优先复用：

_story_slice()
现有 summary/injectable_summary
现有 chapter / volume outline revision
现有 memory/pack.py
现有 assistant_context.py

需要先确认实际文件结构后再实现。

允许修改的生产文件优先限制为：

agents/assistant_context.py
memory/pack.py

如果确实需要修改 canon/outline_flow.py 或其他生产文件，先说明原因，不要扩大范围。

测试：

必须验证：

1. Assistant Context 不包含整份 story outline。
2. 当前章 outline 正确进入。
3. 当前卷必要结构进入。
4. 其他卷只进入最小信息。
5. 最近 3 章使用完整 summary。
6. 更早章节只使用 event/injectable summary。
7. 其他章节完整 prose 永不进入。
8. current_chapter_excerpt 仍受 bounded limit。
9. Bible 仍然 confirmed-only。
10. Continuity 仍然 current-chapter scoped。
11. 空项目行为不变。
12. Writer Pack 原有测试保持通过。
13. Assistant Context 原有测试保持通过。
14. Story Bible 测试保持通过。
15. Continuation 测试保持通过。
16. full pytest 全部通过。

本阶段不要实现：
- Arc Canon
- Outline Proposal
- Outline Apply
- Outline HTTP API
- Outline frontend
- Scene database
- 通用树
- migration

最终：
只做代码实现和测试，不 commit，不 push。

完成后报告：
- 修改文件
- 修改原因
- Context slicing 前后差异
- 新增测试数量
- Assistant 测试
- Story Bible 测试
- Continuation 测试
- full pytest
- 是否修改 frozen modules
- git diff --check
- git status
```

### 现在你只需要做这一件事

**把上面的 Prompt 给 Cursor。**

它完成后，把结果原样发给我。

我们会先验收 **Context Slicing V1**，通过以后再做 **Arc + Outline Proposal V1**。

这样整个百万字架构会一步一步建立，而不是一次把数据库、Assistant、大纲、Scene 全部改掉，风险会小很多。

## Prompt:
10/6/2026, 6:39:31 AM

第一刀只收窄上下文，不改大纲的保存和确认。我先看 Assistant 和 Writer 现在把整份大纲、摘要和正文放进了哪些块。

写作包里的总大纲已经是切片，但卷大纲和 Assistant 仍会带上整份结构和全部摘要。我只收窄这两处，不改大纲的保存和确认。

Outline Context Slicing V1 已实现。Assistant 和 Writer 不再接收整份总大纲或整卷场景，其他章正文仍然不会进入上下文。没有 commit，也没有 push。

修改文件
agents/assistant_context.py
memory/pack.py
tests/test_outline_context_slice.py（新增）
没有改大纲的保存和确认，没有改 Assistant 的 proposal 权限，也没有改 Story Bible。

修改原因

Assistant 原先把已确认总大纲的整份 Markdown，以及每一章的完整摘要，都放进上下文。Writer 的总大纲虽然已有切片，但卷大纲块仍是整卷 Markdown，里面包含每一章的场景。这两处都会随篇幅变大。

切片前后
总大纲：只保留要求、当前卷的标题和目标、当前章在总纲中的位置。其他卷只有标题和目标，没有章节结构。
当前卷：章节只列标题和目标，不列场景。卷内超过 8 章时，只有当前章前后各 2 章保留目标，其余章节只留标题。这是 Arc 尚未建表时的临时范围。
当前章：仍使用已确认的章节大纲，其中包含当前章的场景。
摘要：当前章和之前最近 3 章用完整摘要；更早的章只用事件行。
正文：其他章的 body_md 不进入上下文。当前章只有调用方给出的片段，最长 800 字。
Story Bible 仍是已确认事实、最多 24 条。Continuity 仍是当前章时点的 Stage 2B 状态。
测试
新增测试：5

Assistant 测试：通过（含原有 Assistant 测试和新切片测试）
Story Bible 测试：27 passed
Continuation 测试：22 passed
full pytest：251 passed
frozen modules：Writer、Continuation、Provider、Story Bible、migration、HTTP、frontend 都没有改。改动只在允许的 assistant_context.py 和 memory/pack.py。
git diff --check：通过
git status：上述两个文件已修改，tests/test_outline_context_slice.py 未跟踪。ai_novel_studio.egg-info/ 和 experiments/ 仍是原有未跟踪目录。没有 commit，没有 push。

## Response:
10/6/2026, 6:39:35 AM · gpt-5-6

这一步可以判定为 **PASS，可以冻结，但现在先不要 commit**。

从你贴出的 Cursor 验收结果看，**Outline Context Slicing V1 的边界基本完全符合我们之前定的第一刀**：

### 验收结果

| 项目 | 结果 |
|---|---|
| Assistant 不再吃整份总大纲 | ✅ |
| Writer 不再吃整卷完整场景 | ✅ |
| 当前卷保留必要章节结构 | ✅ |
| 当前章保留完整已确认大纲/Scene | ✅ |
| 其他卷只保留标题 + Goal | ✅ |
| 最近 3 章完整摘要 | ✅ |
| 更早章节降级为事件行 | ✅ |
| 其他章节正文完全不进入 | ✅ |
| 当前正文仅调用方提供的窗口 | ✅ 最长 800 字 |
| Story Bible ≤24、仅 confirmed | ✅ |
| Continuity 仍为当前章 Stage2B | ✅ |
| 没碰 Outline 保存/确认 | ✅ |
| 没碰 Proposal 权限 | ✅ |
| 没碰 Story Bible Apply | ✅ |
| 没碰 Writer/Continuation/Provider | ✅ |
| 没有 migration | ✅ |
| `git diff --check` | ✅ |
| 全部测试 | ✅ 251 passed |
| commit / push | ✅ 都没有 |

尤其重要的是这句：

> **当前卷超过 8 章时，只有当前章前后各 2 章保留目标，其余章节只留标题。**

这符合我们暂时没有 Arc 表时的“有限相关范围”策略，不需要为了 Context Slicing V1 提前引入 Arc 数据模型。

### 我唯一建议你现在再做一个很小的检查

虽然 Cursor 报告已经很好，但在正式冻结之前，让它做一次**只读代码审查**，重点确认：

> `memory/pack.py` 的这次修改没有意外改变 Writer Pack 中 Story Bible、Stage2B state、character/world、recent summary 等其他既有语义，只是把 outline/context 的范围收窄。

因为我们之前已经冻结了 Writer/Story Bible/Continuation 的行为。这里不是要重新测试功能，而是确认 **“切片 ≠ 改变原有信息来源语义”**。

你可以直接把下面这段复制给 Cursor：

```text
对刚完成的 Outline Context Slicing V1 做最后一次只读代码审查。

不要修改任何文件，不要 commit，不要 push。

重点检查：
1. memory/pack.py 的修改是否只是在收窄 outline/context 范围。
2. Story Bible 的 confirmed-only、最多 24 条、reason=confirmed_bible 语义完全没有变化。
3. Stage2B Continuity state 的来源、reason=confirmed_state、当前章范围完全没有变化。
4. character/world blocks 的既有语义没有变化。
5. recent summary / older event row 的来源和既有排序语义没有被意外改变。
6. Writer Pack 原有“其他章节正文不进入”的规则没有被放宽。
7. Assistant Context 的 current_chapter_excerpt 仍然只是调用方提供的 bounded window，最长 800 字。
8. 没有任何 Outline 保存、确认、revision pointer、proposal/apply 行为变化。
9. 没有修改 Story Bible、Continuation、Provider、migration、HTTP、frontend。
10. 不要因为发现问题而顺手修复，只报告问题。

请最终只报告：
- PASS / FAIL
- 是否发现语义回归
- 如果 PASS，列出这次修改仍然保持不变的关键既有语义
- git diff --check
- git status
```

如果这次也 **PASS**，那么我建议就正式把：

**Outline Context Slicing V1 → FROZEN**

然后再 commit。

**不要现在进入 Arc，也不要现在做 Outline Proposal。**
这一步冻结以后，我们再进入下一刀，会更安全：**Arc 结构设计 + Outline Proposal 的数据边界**。

## Prompt:
10/6/2026, 6:41:55 AM

这次只审查切片改动，不改文件。我对照原有 Bible、连续性、摘要和正文排除规则看差异。

PASS

没有发现语义回归。memory/pack.py 的改动只落在大纲文本：卷大纲不再带上每一章的场景；总大纲切片会补上其他卷的标题和目标，但不带那些卷的章节。正文排除、Bible、Continuity、人物和世界条目都没有被放宽。

这次修改仍然保持不变的关键既有语义：

Story Bible 仍只读已确认事实，上限 24 条，reason 仍是 confirmed_bible。_bible_blocks() 没有改。
Stage 2B 仍由 read_confirmed_state() 按当前章时点读取，reason 仍是 confirmed_state。_stage2b_blocks() 和 _continuity() 没有改。
人物卡和世界条目的块内容、reason 没有改。
Writer Pack 的前文摘要仍来自 injectable_summary()。排序仍是 reading_order、global_index。最近 3 章用完整 summary_md，更早的章用原来的 _event_line()。
其他章节的正文仍不进入 Writer Pack。有正文的前序章继续记入 excluded，块里没有 prose 类型。
current_chapter_excerpt 仍只使用调用方传入的文本，EXCERPT_LIMIT 仍是 800。上下文构建不会自己读取整章正文。
大纲的保存、确认、revision 指针，以及 proposal / apply，都没有改。
Story Bible、Continuation、Provider、migration、HTTP、frontend 都不在这次差异里。
git diff --check：通过。

git status：agents/assistant_context.py 和 memory/pack.py 已修改，tests/test_outline_context_slice.py 未跟踪。ai_novel_studio.egg-info/ 和 experiments/ 仍是原有未跟踪目录。没有 commit，没有 push。

## Response:
10/6/2026, 6:42:00 AM · gpt-5-6

很好，这次可以正式判定：

# ✅ Outline Context Slicing V1 — FROZEN

两轮审查都通过，而且第二轮明确确认了**没有语义回归**。现在这个阶段已经达到可以冻结的标准。

### 当前冻结范围

这次只改变了 **上下文取多少**，没有改变任何 Canon / Revision / Proposal 的行为：

- **总大纲** → Story requirements + 当前卷信息 + 当前章位置
- **当前卷** → 必要章节范围，不再把整卷所有 Scene 塞进去
- **当前章** → 保留完整已确认 Chapter Outline + Scene
- **最近 3 章** → 完整 summary
- **更早章节** → event rows
- **其他章节正文** → 完全排除
- **当前正文** → 仅调用方提供，≤800 字
- **Story Bible** → confirmed-only，≤24
- **Continuity** → 当前章 Stage2B confirmed state
- **人物 / 世界** → 原有语义不变

最重要的是，**大纲仍然只是大纲**：

> Context Slicing 没有偷偷变成 Outline Editing。

保存、确认、revision pointer、proposal/apply 全部没有动。

---

## 现在可以 commit

既然你已经完成了代码级验收，我建议现在冻结提交。

**不要把其他未跟踪目录带进去：**

- `ai_novel_studio.egg-info/` ❌
- `experiments/` ❌

只提交这三个：

```text
agents/assistant_context.py
memory/pack.py
tests/test_outline_context_slice.py
```

可以让 Cursor 执行：

```text
现在正式冻结 Outline Context Slicing V1。

只提交以下三个文件：
- agents/assistant_context.py
- memory/pack.py
- tests/test_outline_context_slice.py

不要提交：
- ai_novel_studio.egg-info/
- experiments/
- 任何其他文件

提交前执行：
1. git diff --check
2. 检查 staged files 必须只有上述三个
3. 不要 push

commit message：
Freeze Outline Context Slicing V1

提交完成后报告：
- commit hash
- staged/committed files
- git status
- 是否 push（必须是 no）
```

### 提交后

我们就可以把这个阶段正式标记为：

**Outline Context Slicing V1 — FROZEN**

然后再进入下一阶段：

**Arc 结构设计 → Outline Proposal / Apply**

而不是现在同时改这两个东西。这样每一刀都能保持可回退、可验收。

## Prompt:
10/6/2026, 6:45:52 AM

冻结提交只包含这三个切片文件。我先核对差异和暂存范围，确认没有其他文件后再提交。

冻结提交已完成，没有 push。

commit hash： 794b3becbdd10773ef6258b911f396a26386
committed files：
agents/assistant_context.py
memory/pack.py
tests/test_outline_context_slice.py
git status： 分支 cursor/outline-generate-toast-afb4 比远端超前 7 个提交。工作区只剩下未跟踪的 ai_novel_studio.egg-info/ 和 experiments/。
是否 push： no

## Response:
10/6/2026, 6:46:00 AM · gpt-5-6

很好，**Outline Context Slicing V1 正式冻结完成。** ✅

关键状态：

- Commit：`794b3becbdd10773ef6258b911f396a26386`
- Commit 内容只有 3 个文件：
  - `agents/assistant_context.py`
  - `memory/pack.py`
  - `tests/test_outline_context_slice.py`
- 未提交 `ai_novel_studio.egg-info/`
- 未提交 `experiments/`
- **没有 push**
- 分支比远端领先 7 个 commit
- 工作区除两个原有 untracked 目录外干净

所以现在可以把这一阶段记为：

> **Outline Context Slicing V1 — FROZEN / PASS**

而且这个冻结点非常干净：它建立在之前已经冻结的 **Story Bible V1 → Assistant Read-Only V1 → Proposal V1 → Proposal Apply V1** 之上，没有污染那些冻结模块。

### 下一步

现在**不要马上让 Cursor 写代码**。

下一阶段我们应该先做：

**Arc 结构设计审查（Read-Only Audit）**

重点回答三个问题：

1. `Story → Volume → Arc → Chapter → Scene` 到底应该怎样落在现有 `story_outline` JSON 中；
2. Arc 是否真的需要数据库实体，还是 V1 继续放在 Volume Outline JSON；
3. Assistant 以后如何提出：
   - 创建 Arc
   - 修改 Arc
   - 调整 Arc 下章节
   - 拆分/重排 Scene

   同时保持我们已经冻结的：

**Proposal → Confirm → Apply → Revision → Conflict**

机制。

这一轮仍然应该是**只读审查，不改代码、不 commit**。这样我们不会在还没确定数据边界之前就动 Outline。

## Prompt:
10/6/2026, 6:48:42 AM

我要做什么

## Response:
10/6/2026, 6:48:44 AM · gpt-5-6

你现在**什么代码都不用改**。刚刚的 `Outline Context Slicing V1` 已经冻结。

接下来你要做的是让 Cursor **只做一次 Arc 结构的只读审查**，目的是先把架构设计确定下来，再写代码。

### 直接把下面这段复制给 Cursor

```text
现在进入下一阶段：Arc Structure Read-Only Audit。

这一轮只做代码和架构审查：
- 不修改任何文件
- 不创建新文件
- 不修改数据库
- 不修改 migration
- 不修改 Outline 保存/确认逻辑
- 不修改 Assistant Proposal / Apply
- 不修改 Story Bible
- 不修改 Writer / Continuation / Provider
- 不 commit
- 不 push

当前冻结基线：

Outline Context Slicing V1:
794b3becbdd10773ef6258b911f396a26386

Story Bible V1:
590434efea52f46cc084b3d4edaecabf5455da3e

Assistant Read-Only V1:
ad26aa0636f777189f89886d669d737ea0b946fd

Assistant Proposal V1:
7668755e7866efbb6cab2e8e7241ee63fcc90b96

Assistant Proposal Apply V1:
07c43008dab80b8fc11e999a0d20562958d7d7c2

目标：
审查如何把现有 Story → Volume → Chapter → Scene
扩展为：

Story → Volume → Arc → Chapter → Scene

重点回答：

1. 现有 story_outline / volume outline / chapter outline 的实际数据结构是什么？
2. Arc 最适合放在哪里？
   - 是否应该直接作为 Volume Outline JSON 中的 arcs[]
   - 是否真的需要新的数据库表
   - V1 是否可以完全不增加 migration
3. Arc 是否需要独立 ID？
4. Chapter 是否需要保存 arc_id？
5. Scene 是否需要独立数据库实体，还是继续作为 chapter outline JSON 中的对象？
6. 如果用户说：
   “把第三卷拆成三个 Arc”
   现有架构应该如何表示？
7. 如果用户说：
   “调整第三卷第二个 Arc 的节奏”
   应该修改什么 revision？
8. 如果用户说：
   “把第三卷第二个 Arc 的第 37 章拆成 5 个 Scene”
   应该修改什么 revision？
   是否需要新增数据库记录？
9. Arc 修改以后，如何确定哪些 Chapter 受到影响？
10. Assistant Proposal 将来应该针对：
    - story_outline
    - volume_outline
    - chapter_outline
    中的哪一种 revision 提出 proposal？
11. Proposal 的 base_revision_id 应该如何绑定？
12. 如何保证：
    Proposal → Confirm → Apply → Revision → Conflict
    与现有 Story Bible 的语义一致？
13. 如何避免 Assistant 修改 Arc 时意外修改 prose？
14. 如何避免为了 Arc 引入“万能 Outline Node”或过度设计？
15. Million-word 小说下，Assistant / Writer 应该如何只读取：
    Story → 当前 Volume → 当前 Arc → 当前 Chapter → 当前 Scene
    而不是整本大纲？

特别检查：
- 是否存在现有代码已经隐含支持 Arc，只是尚未显式命名。
- 是否存在会因为加入 Arc 而需要修改的现有 revision / confirmation 语义。
- 是否存在必须修改的地方。
- 哪些模块应该明确保持冻结。

请最终只输出：

A. 当前实际架构
B. 推荐的 Arc V1 数据结构
C. 是否需要 migration
D. 是否需要 Arc table
E. Chapter 是否需要 arc_id
F. Scene 如何处理
G. Assistant Proposal 将来如何处理
H. Million-word Context 如何切片
I. 必须修改的文件
J. 明确禁止修改的冻结文件
K. 风险点
L. 最终结论：PASS / NOT READY

再次强调：
这一轮只审查，不写代码。
```

### 你做完以后

把 Cursor 的**完整审查结果**复制给我。

我会帮你判断它有没有越界、Arc 设计是否合理，以及是否可以进入下一步。

**现在不要让 Cursor 写 Arc 代码。** 先把架构定死，再动代码。