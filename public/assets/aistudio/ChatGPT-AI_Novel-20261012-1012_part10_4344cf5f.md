## Prompt:
10/5/2026, 5:50:04 AM

这次只做只读审计。我会按现有代码、数据和测试核对已知问题，并查找长期写作规模下会暴露的缺口。

Stage 1 的核心骨架可以留下。当前真实项目上，第一章还没有可注入的摘要，因为自动云端记忆仍是关闭的。下面是只读审计，没有改代码、数据或密钥。

1. 当前 Stage 1 架构总结
一部小说对应一个 SQLite 文件。设置库只保存 provider、endpoint、agent 绑定和 secret_ref。正文在 prose_revision，当前正文由 chapter.current_revision_id 指出。派生记忆在 chapter_summary。所有云端调用都经过 ModelRouter：云端请求必须命中已确认且内容哈希一致的 send_manifest，否则在打开连接前返回 SEND_NOT_CONFIRMED。FakeProvider 只在明确的 allow_fake=true 时使用。

已有两层代理：writer 和 memory_updater。人物、世界设定是用户维护的静态卡片，默认 locked=1。卷、分支、epoch、reading_order、plan_json、narrative_time_*、state_delta_id 已经有列，但多数还没有行为。

本地项目「现代都市」目前是：2 章、17 条修订、3 条摘要、1 个人物、1 条世界设定、1 卷。迁移已经到 003_cloud_memory。cloud_memory_opt_in=0，send_grant 为 0。记忆任务里有 9 次 SEND_NOT_CONFIRMED 失败、3 次成功。第一章没有可注入摘要；第二章 stale_context=1。全书篇幅字段都是空的。

2. 已经正确的部分
其他章节的全文不会进入写作包。外章 prose 块会被拒绝。
摘要只在 stale=0、superseded=0 且 source_revision_id 等于该章当前修订时注入。
保存正文会把该章旧摘要标成 stale，并把后面章节的 stale_context 设为 1。摘要任务不会改写正文。
用户保存使用 If-Match。写作结果在事务里再次核对起始修订；修订已经变了就回滚，不把当前指针拨过去。
自动云端记忆默认关闭。打开后，每次记忆发送单独确认一份内容清单，并写审计。这个开关不会替正文生成确认放行，也不会改用 FakeProvider。
篇幅按项目、卷、章继承。最少和最多会进入真实请求；超出范围最多再修 2 次，保存更接近的一稿并给出警告。只有目标、没有上下限时不修理。模拟生成不修理，输出仍是固定文本。
密钥以引用形式存在。迁移脚本和审计字段里没有密钥列。Grok 不是 OpenAI 兼容适配器的别名。
测试覆盖创建项目、人物、世界、章节、模拟链路、摘要注入、编辑后的 stale、云端记忆授权、篇幅修理、未确认不连网，以及密钥列检查。上一轮完整结果是 41 项通过。
3. 当前已知问题的验证结果
第一章摘要能否被第二章检索。 代码和测试可以。可注入摘要会出现在第二章的 chapter_summary 块里，第一章全文不出现。本地这本书现在不行：第一章的两条摘要都不可注入，自动记忆又是关闭的，所以第二章目前拿不到第一章的有效摘要。这是权限关闭后的当前数据状态，不是检索条件写错。

编辑第一章。 旧摘要会 stale，旧行还在。后续章节会把 stale_context 设为 1，本地第二章已经是 1。授权后的重建会按当时正文写新摘要，写入新的 source_revision_id，并把新行设为 stale=0。没有授权时，后台不入队；手动真实重建返回 SEND_NOT_CONFIRMED，连接不打开。本地那 9 次失败与此一致。新摘要不会在源修订已经再次变化时落库。

stale_context 一旦置 1 就不会再清。它不阻止注入一份新的、修订匹配的摘要。它表示的是「后面那一章的正文可能还是按旧上下文写的」。用户后来重写第二章，这个标记仍然保持 1。

自动记忆与 SEND_NOT_CONFIRMED。 门还在，没有用 send_grant 绕开。项目级开关、每次一份清单、清单含种类、id、哈希、原因和原文，这些都有。Writer 的逐次确认还在。未授权时不会落到 FakeProvider。

残留边界：开关只记录「开/关」，不记录当时的 provider 和 model。之后若把记忆模型改到另一个云端 endpoint，后续章节正文会在不再次确认的情况下发往新目标。开关打开期间，任何章节的当前正文都可以成为记忆请求的内容。这是自动更新的范围，不是一张永久的任意发送授权。

篇幅。 计数是「非空白字符数」：一个汉字计 1，标点计 1，空格、换行和全角空格不计。这不是 token，也不是英文 word count。Token 估算另在清单里，汉字按 2、其余非空白按 1，而且 Grok 请求没有发送 max_output_tokens。本地这本书的 target、min、max、strict 全是空，所以真实 Grok 生成还没有走过修理。length_strict=1 只把检查标成 block 并显示「不足且严格」；正文仍然保存。修理没有费用上限，也不能中途取消。

4. 新发现的问题
所有传输失败都变成 MODEL_UNAVAILABLE /「模型连接失败」。401、403 额度、429、超时和断网在这里汇合。前端又把任何 MODEL_UNAVAILABLE 显示成「没有可用模型……或使用模拟生成」。之前额度用尽时，界面就是这个句子。
模型调用发生在修订核对之前。用户在生成期间保存后，第一次调用和最多两次修理仍会打到云端，然后整次事务回滚。生成接口上的 REVISION_CONFLICT 被前端当成普通失败，不会进入「冲突」状态。
编辑器有约 800ms 自动保存。更快返回的模拟生成会用 setDraft 换掉尚未落库的本地稿。手写内容只在自动保存先成功时稳赢。
修订链在库里，状态却永远是 draft。没有修订列表，也没有恢复入口。「另存为新修订」只是把编辑器里的稿接到最新指针上。
检索和 stale 传播用的是冻结的 global_index。有正文后不能再改这个序号。reading_order 可以改，但写作包不看它。以后往中间插章，上下文顺序不会跟着阅读顺序走。
每次写作都装入全部人物和全部世界条目，再加此前每一章的可注入摘要。章数上去之后，上下文和 send_manifest.items_json 按章数累加复制。一千章时这是平方级膨胀。
人物卡进模型时只有名字、角色、摘要、性格和目标。能力、知识边界、外形、dossier 不进包。没有按章变化的人物状态、关系、世界状态、时间线或伏笔。
新章节固定进第一卷。卷的 goal 和 summary 不进写作包。没有 Arc 和 Scene 表。
删除章节会删修订和摘要，但不会把后面章节标成 stale，也不会清理 artifact、job、manifest。界面目前没有删除按钮。人物删除不会清理 pov_character_id。
摘要任务的 max_attempts 没有被使用。生成不是 job，不能取消；客户端断开后服务端仍可能把结果写回。
迁移用 executescript，失败时没有备份，也没有包住整份脚本的事务。SQLite 的 CHECK 枚举以后加状态要重建表。
设置界面把 writer 和 memory_updater 绑到同一个 endpoint。表结构允许分开，planner、critic、research 还没有行。
5. P0 — 必须现在修复
P0-1 云端错误被说成「没有可用模型」
问题：providers/adapters/_http.py 把 4xx/5xx/429 收成 TransportError。providers/router.py 再收成 MODEL_UNAVAILABLE。client/src/lib/api.ts 的 ERROR_COPY 覆盖服务端原文。
为什么现在必须修：Stage 1 已经在真实 Grok 上发生过。用户无法区分没密钥、没额度、限流和断网，还被引导去用模拟生成。
影响：错误操作、重复尝试，以及把权限或账单问题误认为模型不存在。
推荐方案：按 HTTP 状态映射为 AUTH_ERROR、QUOTA_EXCEEDED、RATE_LIMITED、NETWORK_ERROR、TIMEOUT、INVALID_REQUEST、PROVIDER_ERROR。保留现有的「没配置模型」和「没密钥」为 MODEL_UNAVAILABLE。完成请求不要自动重试，避免重复扣费。前端按代码显示对应句子，不再把所有失败都说成没有模型。
涉及：providers/adapters/_http.py、providers/errors.py、providers/router.py、host/routes.py、client/src/lib/api.ts。
测试：401、403、429、超时、连接失败、缺密钥、未配置模型各自一个代码；断言没有打开第二次完成请求；allow_fake 仍是唯一进入 FakeProvider 的路径。
P0-2 生成期间的修订竞争
问题：pipeline/chapter_flow.py 先调用模型和修理，再在保存时发现修订变了。修理循环中途不重新读取 current_revision_id。前端 runGenerate 成功后直接 setDraft，冲突码不走保存冲突界面。
为什么现在必须修：手写正文必须优先于 AI。现在这个优先只存在于「自动保存已经提交」之后，而且已经花掉的云端调用收不回来。
影响：生成期间继续打云端；快速模拟生成覆盖未保存手稿；冲突被显示成生成失败。
推荐方案：每次修理前和落库前重读当前修订。变了就停止后续云端调用，回滚未提交的写作修订，返回 REVISION_CONFLICT。前端在生成前先把未保存稿保存下去；生成返回冲突时进入现有冲突条，不用 AI 稿覆盖编辑器。不要为此增加自动重试。
涉及：pipeline/chapter_flow.py、prose/revisions.py、client/src/App.tsx。
测试：生成开始后、修理开始前插入一次用户保存，断言修理传输次数为 0，当前正文仍是用户稿。未保存草稿在模拟生成返回时仍留在编辑器冲突状态。用户未改稿时，生成仍成为新的当前修订。
这两项做完就可以冻结。其余不要放进这一次实施。

6. P1 — 现在需要预留
记忆授权绑定 endpoint。 在 opt-in 时记下 provider_key 和 model_key。不一致就拒绝自动发送并要求重新授权。现在不做成每段正文单独确认，否则就取消了自动更新。
stale_context 的清除点。 保留「前面改过，本章正文可能过时」。在用户明确保存或接受该章新正文时清 0。不要在摘要重建时清掉。
阅读顺序。 检索和影响传播改用 reading_order。global_index 继续当不可变创建序号。要在章节变多之前改，否则旧书的上下文顺序会固化。
检索预算。 build_writer_pack 继续是唯一组装口。下一步只加上限和跳过原因，例如最近若干章摘要，而不是每章全量人物和世界。PackBlock.reason 已经能记下为什么装入。现在不做向量检索。
修订历史。 增加只读列表和「恢复」。恢复应新建一条 user 修订并指向旧正文，而不是改写历史行。行已经在 prose_revision。
状态表，先不要写数据。 以后用 character_state、relationship、world_state、timeline_event、foreshadow，都带 source_chapter_id、source_revision_id、story_time、status。不要把「当前状态」写进 character.summary 或世界条目的 body_md。现有 state_delta_id、knowledge_limits_json、narrative_time_* 留空即可。
层级。 Chapter 已有 volume_id。以后加可空的 arc_id、scene 表。现在不要做多卷界面。新章仍进第一卷，这是已知限制。
影响分析。 现在只有「本章摘要 stale + 后面 stale_context」。以后按章节范围标记，不要整书重写。
Job。 pipeline_run 已有 cancelled。记忆 job 以后补 cancelled，并在取消后禁止再调用适配器。生成若仍放在请求里，P0 的修订中止就是现阶段的取消。
用量。 适配器已经读到 input/output tokens，但没有落库。以后加 usage_event，字段用 provider、model、operation、tokens、时间。现在不算钱。
迁移。 以后的脚本放进显式事务，并在改项目库前复制 sqlite 文件。现在不要重写已应用的 001–003。
删除。 删章时标记后续 stale_context，并停掉该章未完成的记忆任务。孤儿 manifest 可以留作审计。
7. P2 — 明确推迟
这些用新表或新代理就能加，不会推翻现有路由、清单和修订链。

关系史、时间线事件、伏笔状态机、冲突检测、Arc/Scene 编辑器。
Research、来源权利和 Style Profile。没有抓取器，也不保存仿写用的原文。
全文搜索、项目导出包、预算、Hugging Face 专用适配器。OpenAI 兼容和 Ollama 已经能覆盖本地接口。
自动重试、指数退避、生成进度条、费用显示。
为了字数做本地灌水或截断。
把 length_strict 改成拒绝落库。当前约定是保存最接近的一稿并警告；界面应把「严格」说成「标成未通过」，那是文案，不必变成第二套保存规则。
8. 数据库修改建议
必须新增：无。P0 不需要新表。
建议新增：先不添加。冻结说明里写清未来的 usage_event 和各类 state 表。opt-in 若要绑定模型，再加两个可空文本列即可，那是 P1。
不需要现在新增：relationship、timeline、foreshadow、scene、arc、source registry、FTS。
9. API 修改建议
必须：错误响应使用可区分的 error.code。生成在修订变化时返回现有的 REVISION_CONFLICT，并保证后面的修理不再发出。
预留：修订列表、恢复、取消记忆 job、检索跳过原因。路径可以等 P1。
延后：冲突检测、研究、导出、预算、搜索。
10. Frontend 修改建议
必须：按错误码显示额度、认证、限流、网络和未配置。生成前先保存脏稿。冲突时走现有冲突条，不用生成结果覆盖编辑器。
预留：左侧时间线、剧情、伏笔继续保持禁用。右侧继续显示记忆是否授权、摘要是否可注入、篇幅警告。
延后：模型分角色选择、费用、进度百分比、修订时间轴、影响范围面板。
11. Model / Provider 修改建议
Provider、endpoint、secret_ref、agent 配置已经分开。Grok、OpenAI、Anthropic、Gemini、Ollama、OpenAI 兼容都有适配器，fake 不在自动选择里。P0 只改错误分类，不改 Grok URL，不改密钥存储。不要把 max_output_tokens 当成中文字数。记忆模型和写作模型以后可以绑不同 endpoint，表已经允许，设置界面现在还做不到。

12. Memory / Canon 修改建议
边界现在是：人物和世界条目只有用户 API 在写，代理写不了这些表。派生记忆是摘要，带 source chapter、source revision、generated_at、confidence、stale、superseded、memory_version。它一经写入就是可注入内容，没有用户接受步骤。错误摘要会一直影响后文，直到正文再改或重新生成。

不要让模型写人物、世界或硬设定。不要把摘要当硬设定。P0 不改这个生命周期。P1 再给摘要一个可见的「可注入 / 已过期」，并让 stale_context 能在本章被用户重新保存后清掉。

删章、插章和重排还不构成完整生命周期。源章删除后，后文不会自动知道上下文缺了一章。

13. Testing 修改建议
现有 41 项都是本地集成或路由测试，使用临时目录和脚本传输，不调用真实 Grok。真实供应商测试不应该进默认套件。

P0 要补：错误码分类、修订变化后修理次数为 0、脏编辑器不被生成结果覆盖。已有测试继续负责摘要注入、stale、未授权、长度修理、模拟不连 Grok、真实路径不落到 fake。

还缺、但属于 P1 的测试：删除、恢复、取消、迁移失败、并发两个客户端、reading_order。

14. Security / Privacy 修改建议
清单能说明发送了哪一类文本，并且保存了原文副本，所以审计是够的，库也会变大。密钥不进 SQLite、Git 和审计。前端只提交 secret，响应当 stored 和 secret_ref。未确认的云端请求不会创建传输。

P0 不要放宽这道门。P1 把记忆授权钉在当时的 provider 和 model 上。外部网页和上传文件现在不存在；以后必须当不可信数据，不能给工具、文件或密钥权限。Stage 1 模型没有工具调用，输出只按 JSON schema 取正文或摘要。

15. Performance / Scale 风险
两千字的短篇阶段没有问题。一百万字、一千章时，风险集中在三处：每章装入全部圣经和全部旧摘要；每份 manifest 再存一份全文；章节列表和章节详情把最近 8 份清单全文交给前端。人物 50、世界条目几百时，单次请求就会先撞上上下文，而这个失败今天仍会显示成「没有可用模型」。

修订表本身不是第一风险。本地这本书 17 条修订、21 份清单，体积还小。不要为这个规模换数据库。先在检索口加预算。

Studio 的一把锁包住所有项目的事务，模型调用期间会放开。单用户可以接受。

16. 是否存在架构推翻风险
没有。

不需要换掉 SQLite、ModelRouter、发送清单、修订链或项目单文件。Stage 2 应在旁边加表，并收紧 build_writer_pack。会在以后变得疼、但仍然是局部修改的地方：用 global_index 当故事顺序，以及 CHECK 枚举要加新状态时必须迁移。

17. 最终 Stage 1 Final Implementation Specification
下一次只做 P0-1 和 P0-2。

传输层保留状态码和是否超时，不把响应头或正文里的密钥写入异常。
路由器映射为上面的错误码。缺 endpoint、缺密钥仍是 MODEL_UNAVAILABLE。未确认仍是 SEND_NOT_CONFIRMED。完成调用失败不自动重试。
前端按代码显示中文，额度、认证、限流、网络各自一句。模拟生成仍是单独按钮。
生成在每次修理前和保存前读取 current_revision_id。与开始时的父修订不同，就不再调用模型，事务回滚，返回 REVISION_CONFLICT。
前端生成前先保存非空脏稿。冲突时保留编辑器文本并显示重新加载和另存。成功且修订未变时，才用新正文替换编辑器。
不改 FakeProvider 的固定输出。不把真实生成的失败改成模拟。不改 Grok 地址和密钥。不打开自动记忆的默认值。不新增人物状态、时间线、伏笔或研究。
验收：现有 41 项仍通过；新增错误分类和修订竞争测试通过；不对真实 Grok 发请求。

18. Stage 1 Freeze 判断
A. 可以开始最后一次 P0 实施。范围就是错误分类和生成期间的修订竞争。已知的摘要检索、stale、云端记忆授权和篇幅修理已经在代码和测试里，不要重做。

B. 这两项完成后可以冻结 Stage 1。本地这本书在用户明确打开「授权自动更新」之前，第一章摘要仍不会进入第二章；那是当前权限状态，不是冻结阻塞项。打开授权会把现有正文发给当前记忆模型。

C. 进入 Stage 2 不需要重新设计核心架构。Stage 2 需要新的状态表和一个有预算的检索层。在那之前，不要把当前状态写进静态人物卡或世界条目。

## Response:
10/5/2026, 5:50:10 AM · gpt-5-6

我认真把这份审计从头到尾检查了一遍。**整体质量很高，而且它已经成功找到了几个我们之前没完全意识到的问题。**

我的结论是：

> **这份审计可以作为 Stage 1 最终实施依据，但我建议在真正让 Agent 修改代码之前，再补充/调整 3 个地方。**
>
> 不是推翻它的 P0/P1/P2，而是把几个边界定义得更严谨。

---

# 一、整体判断：这次审计基本达标

Agent 的结论：

> **“没有架构推翻风险。”**

这一点非常重要。

它确认目前这些核心东西不用推翻：

- SQLite
- ModelRouter
- Provider abstraction
- Send Manifest
- Revision chain
- Project 单文件数据库
- Local-first 架构

这意味着我们之前的总体设计方向是对的。

而且它找出了几个真正有价值的问题：

### 1. 错误分类

这个必须修。

之前真实 Grok 遇到额度问题时，UI 显示：

> “没有可用模型”

这是明显错误。

以后至少应该区分：

```text
AUTH_ERROR
QUOTA_EXCEEDED
RATE_LIMITED
NETWORK_ERROR
TIMEOUT
MODEL_UNAVAILABLE
INVALID_REQUEST
CONTEXT_TOO_LARGE
PROVIDER_ERROR
SEND_NOT_CONFIRMED
REVISION_CONFLICT
```

这个我同意 **P0**。

---

# 二、P0-2 也非常重要

它发现：

> 用户在 AI 生成期间修改正文，AI 生成完成以后可能已经产生了新的 revision。

这个问题必须解决。

正确逻辑应该是：

```text
用户当前 Revision = R10

        ↓
开始 AI Generation
        ↓
AI 使用 R10
        ↓
用户此时修改正文
        ↓
变成 R11
        ↓
AI 第一次生成完成
        ↓
检查 current_revision_id
        ↓
发现 R10 ≠ R11
        ↓
停止后续 Repair
        ↓
不允许 AI 覆盖 R11
        ↓
REVISION_CONFLICT
```

这个设计非常正确。

---

# 三、但是这里有一个细节，我建议你让 Agent 再确认

审计里写：

> “生成前先保存非空脏稿。”

这个很好，但我们要避免一个问题：

如果用户正在编辑：

```text
当前数据库 = R10
编辑器未保存 = Draft A
```

点击生成：

```text
先自动保存 → R11
然后 AI 从 R11 开始生成
```

这是正确的。

但是如果自动保存失败：

```text
Draft A
↓
自动保存失败
↓
仍然调用 AI
```

就不应该继续。

所以我建议增加一个非常小的要求：

> **只有生成前的脏稿成功持久化，并且确认 current_revision_id 已更新后，才能启动真实 AI 生成。自动保存失败必须阻止生成，而不是继续使用旧 revision。**

这属于 **P0-2 的补充，不需要新增 P0-3。**

---

# 四、我认为审计里最值得注意的是这个：stale_context

Agent 自己已经发现：

> `stale_context` 一旦置 1 就不会再清。

这个其实比它自己给出的 P1 更值得我们认真考虑。

比如：

```text
Chapter 1 修改
↓
Chapter 2 stale_context = 1
```

这是正确的。

但是后来：

```text
用户重新完整修改 Chapter 2
↓
Chapter 2 自己已经基于新内容保存
```

如果仍然：

```text
stale_context = 1
```

那么 UI 如果告诉用户：

> “当前章节上下文过期”

实际上就可能是不准确的。

---

### 我建议这样定义

不要简单把 `stale_context` 理解为：

> “这个章节曾经受到过上游修改。”

而应该理解为：

> **“当前章节正文仍然依赖已经失效的上游状态，因此当前章节需要重新检查/处理。”**

于是：

```text
Chapter 1 修改
      ↓
Chapter 2 stale = 1
      ↓
用户重新生成/确认 Chapter 2
      ↓
Chapter 2 stale = 0
      ↓
Chapter 3+ 继续根据 Chapter 2 的变化传播
```

这样这个字段才有真正的生命周期。

所以我会把它列成：

> **P1，但 Stage 2 前必须定义清楚。**

现在不用扩大 Stage 1 的修改范围。

---

# 五、还有一个我认为应该补到 P1 的东西：授权不仅绑定 Model，还应该绑定“发送范围”

Agent 发现：

> `cloud_memory_opt_in` 只记录开/关。

它建议绑定：

```text
provider
model
```

这个非常正确。

但我认为还应该再往前一步：

### Authorization Scope

例如用户允许：

```text
☑ 自动更新章节摘要
☑ 自动更新人物状态
☐ 自动更新世界状态
☐ 自动进行 Web Research
```

未来可以是：

```text
Cloud Permission
├── Writing Generation
├── Chapter Summary
├── Character State
├── World State
├── Timeline
├── Research
└── Style Analysis
```

**现在不用实现这些 UI。**

但是 P1 的架构最好不要设计成：

```text
cloud_memory_opt_in = true
```

然后以后所有新的 AI Agent 都默认拥有云端权限。

应该设计成：

```text
Permission
    ↓
Operation Type
    ↓
Provider
    ↓
Model
    ↓
Content Scope
```

这样以后我们增加：

> Character State Agent

不会突然继承：

> “用户以前允许自动生成 Chapter Summary”

然后自动把人物数据也上传。

这个属于**架构预留 P1**，不应该变成现在的 P0。

---

# 六、还有一个很重要的地方：Context 爆炸

Agent 找到：

> 每次写作都装入全部人物和全部世界条目 + 此前每一章可注入摘要。

而且它明确判断：

> **1000 章会产生平方级膨胀。**

这个发现非常重要。

但我同意它的判断：

### 不要现在做 Vector DB。

不要现在：

> SQLite → PostgreSQL → pgvector → Elasticsearch → 向量数据库……

完全没必要。

我们 Stage 2 真正需要的是：

```text
build_writer_pack()
        ↓
Context Budget
        ↓
Priority
        ↓
Retrieval
        ↓
必要内容
```

先解决：

> **“不要把不需要的东西送进去。”**

而不是：

> “换一个更大的数据库。”

这点我赞成 Agent 的判断。

---

# 七、还有一个非常好的发现：global_index

这个我建议记下来，**Stage 2 前一定修**。

目前：

```text
global_index = 创建顺序
reading_order = 实际阅读顺序
```

而 Writer 使用：

> global_index

这意味着以后如果用户：

```text
Chapter 1
Chapter 2
Chapter 3
Chapter 4
```

然后插入：

```text
Chapter 2.5
```

或者把章节重新排序：

```text
1
2
4
3
```

Memory Retrieval 仍可能按照旧的创建顺序。

所以：

### P1

以后真正的故事顺序应该使用：

```text
reading_order
```

而：

```text
global_index
```

只作为不可变 ID / 创建序号。

这一点现在不一定要动，但 **Stage 2 WebNovel Engine 开始前应该完成。**

---

# 八、我还想增加一个小的 P1：Context Manifest 版本

现在已经有：

> 内容 hash

这是很好的一步。

但未来 Context 会越来越复杂：

```text
Character State
World State
Timeline
Foreshadowing
Chapter Summary
Scene Summary
```

所以以后最好能够知道：

> “这一次 AI 生成到底使用了哪个 Context Pack？”

例如：

```text
context_pack_id
context_pack_version
```

然后：

```text
Generation
    ↓
Context Pack v183
    ↓
Model
    ↓
Output
```

这样以后如果 AI 写错了，可以追溯：

> “它当时看到的世界观版本是什么？”

这对长期小说非常重要。

**现在不用实现，P1 预留即可。**

---

# 九、P0 数量我不建议增加

这点非常重要。

虽然我们又发现了一些东西，但我**不建议把它们全部变成 P0**。

目前保持：

### P0

**P0-1**
错误分类

**P0-2**
生成期间 Revision Conflict / 防止 AI 覆盖用户最新内容

就够了。

否则我们又会陷入：

> “既然发现这个也重要，那也 P0；那个也重要，也 P0……”

最后 Stage 1 永远冻结不了。

---

# 十、我建议最终形成这样的分层

### 🔴 P0：现在必须做

1. Provider Error Classification
2. Generation Revision Conflict
3. 生成前脏稿必须成功保存，否则禁止启动生成

---

### 🟠 P1：Stage 2 前后逐步加入

1. Cloud Permission → Provider/Model/Operation/Content Scope
2. `stale_context` 生命周期
3. `reading_order` 替代 `global_index` 作为故事顺序
4. Context Budget
5. Context Retrieval
6. Context Pack version/provenance
7. Revision History / Restore
8. Character State
9. Relationship State
10. World State
11. Timeline
12. Foreshadowing
13. Change Impact Analysis
14. Async Job
15. Usage Event
16. Migration Backup
17. Delete lifecycle

---

### 🟢 P2：以后再做

例如：

- Research Agent
- Source Registry
- Style Profile
- Arc / Scene UI
- Vector Search
- Project Export
- Budget UI
- Advanced Search
- Collaboration
- 云同步
- Windows `.exe`
- 自动更新
- 更复杂的多 Agent orchestration

---

# 十一、所以现在我建议不要再让 Agent 重新审计

**这份结果已经足够了。**

我们现在应该正式进入：

> **Stage 1 Final Implementation**

而且只实施：

```text
P0-1 Error Classification
+
P0-2 Revision Conflict
+
生成前 Dirty Draft 必须成功保存
```

然后：

```text
31/41? → 全部测试
       ↓
P0 新增测试
       ↓
真实 Grok 测试
       ↓
Memory 测试
       ↓
Revision Conflict 测试
       ↓
Length 测试
       ↓
Fake/Real separation
       ↓
Stage 1 Freeze
```

特别注意：**不要让 Agent 现在顺手把 P1 也实现。**

否则我们刚刚辛苦做完的“冻结 Stage 1”又会变成第二轮大型开发。

---

## 你现在可以直接给当前 Agent 这段

```text
审计结果我已经看完了。

整体架构无需推翻。

现在正式进入 Stage 1 Final Implementation，但只允许实施 P0。

P0 范围确定为：

1. Provider Error Classification
2. Generation Revision Conflict
3. 生成前 dirty draft 必须成功持久化，否则禁止开始 AI generation

具体要求：

一、错误分类

不要再把所有 HTTP 4xx/5xx/429 和网络异常统一映射成 MODEL_UNAVAILABLE。

至少区分：

AUTH_ERROR
QUOTA_EXCEEDED
RATE_LIMITED
NETWORK_ERROR
TIMEOUT
MODEL_UNAVAILABLE
INVALID_REQUEST
CONTEXT_TOO_LARGE
PROVIDER_ERROR
CONTENT_FILTER

SEND_NOT_CONFIRMED 和 REVISION_CONFLICT 保持现有独立错误。

不要自动重试完成型模型请求。

前端根据 error.code 显示正确中文提示。

不要修改 FakeProvider 的选择规则。

不要让真实生成失败后静默 fallback 到 FakeProvider。

二、Revision Conflict

AI generation 开始前记录 start_revision_id。

开始真实模型调用前，必须确保当前编辑器中的 dirty draft 已经成功保存。

如果 dirty draft 保存失败：
- 不调用模型
- 保留编辑器内容
- 返回明确错误

每次 repair 前重新读取 current_revision_id。

最终保存前再次检查 current_revision_id。

只要发现当前 revision 已经不同：
- 停止后续模型调用
- 不继续 repair
- 不覆盖用户内容
- 返回 REVISION_CONFLICT
- 保留用户当前编辑器内容
- 前端进入现有冲突处理 UI

不要自动重试。

不要自动覆盖用户最新 revision。

三、测试

保留现有全部测试。

新增：

1. 401 → AUTH_ERROR
2. 403 quota → QUOTA_EXCEEDED
3. 429 → RATE_LIMITED
4. timeout → TIMEOUT
5. network failure → NETWORK_ERROR
6. invalid request → INVALID_REQUEST
7. context too large → CONTEXT_TOO_LARGE
8. 未配置模型 → MODEL_UNAVAILABLE

并测试：

9. dirty draft 保存成功后才开始生成
10. dirty draft 保存失败时绝不调用模型
11. generation 期间 revision 改变时停止后续 repair
12. revision conflict 不覆盖用户内容
13. revision conflict 不静默 fallback 到 FakeProvider
14. 正常 generation 在 revision 未变化时仍然成功
15. 正常 repair 在 revision 未变化时仍然按照最多 2 次执行

真实 Grok 不进入默认测试套件。

四、严格禁止

不要实现 P1。

不要实现：
- Character State
- Relationship State
- World State
- Timeline
- Foreshadowing
- Research
- Style Profile
- Arc
- Scene
- Vector Search
- Context Budget
- Usage Event
- Revision History UI
- Export
- Budget UI

这些全部保留到后续阶段。

不要修改：
- Grok endpoint
- API key / secret storage
- FakeProvider
- Cloud memory 默认关闭状态
- Send Manifest 的安全门
- SQLite 架构
- ModelRouter 核心结构

完成后先运行完整测试。

然后报告：
1. 修改了哪些文件
2. 每项 P0 怎么实现
3. 测试数量
4. 全部测试结果
5. 是否还有失败
6. 是否可以进行真实 Grok 最终验证

不要 commit / push，等我确认。
```

这一步完成以后，我们就可以非常认真地说：

> **Stage 1 真正进入收尾。**

然后我会陪你做最后的验收，而不是再继续无休止地加需求。

## Prompt:
10/5/2026, 5:59:07 AM

P0 只做三件事：把供应商错误分开、在修订变化时停住生成，以及在未保存稿落库之前不调用模型。我先对照现有调用链再改。

错误会按供应商返回分开，生成则在修订变了或未保存稿没落库时停住。接下来改调用链和测试。

P0 已实现，完整测试通过。代码还没有 commit，也没有 push。

1. 修改的文件
providers/errors.py
providers/adapters/_http.py
providers/router.py
host/routes.py
pipeline/chapter_flow.py
client/src/lib/api.ts
client/src/lib/generatePreflight.ts
client/src/App.tsx
tests/test_provider_errors.py
tests/test_revision_conflict.py
client/preflight.test.ts
FakeProvider、Grok 地址、密钥存储、发送清单门、SQLite 结构和云端记忆默认关闭都没有改。

2. 三项 P0
错误分类。 HTTP 层按状态和响应里的错误码分类，路由器原样把这个代码返回，不再收成 MODEL_UNAVAILABLE。401 是 AUTH_ERROR，403 且内容为额度或花费上限是 QUOTA_EXCEEDED，429 是 RATE_LIMITED，超时是 TIMEOUT，连接失败是 NETWORK_ERROR，400 的普通请求错误是 INVALID_REQUEST，上下文超限是 CONTEXT_TOO_LARGE，内容策略是 CONTENT_FILTER，5xx 是 PROVIDER_ERROR。没配置模型或没密钥仍是 MODEL_UNAVAILABLE。SEND_NOT_CONFIRMED 和 REVISION_CONFLICT 保持独立。完成请求只调用一次适配器。前端按 error.code 显示对应中文，并写明生成不会改用模拟。

修订冲突。 生成开始时记下 start_revision_id。请求可以带 base_revision_id；与当前修订不一致时，在任何模型调用之前返回 REVISION_CONFLICT。第一次模型返回后、每次篇幅修理前、以及落库前都会再读当前修订。只要已经不同，就停止后续修理，不写入 AI 稿，并返回 REVISION_CONFLICT。前端进入现有的冲突条，编辑器里的文字留着。

未保存稿。 编辑器内容和已保存正文不同时，先保存。保存成功才带上新的修订号调用生成。保存失败、冲突或空正文时不调用生成，编辑器内容保留，并显示明确错误。生成开始时也会作废尚未触发的自动保存，避免同一稿再写一版。

3–5. 测试
pytest 67 passed，1 条原有的 Starlette 弃用警告，没有失败。原先是 41 项，这次新增 26 项。客户端预检查另有 3 项通过，tsc -b 通过。

覆盖了 401、403 额度、429、超时、断网、无效请求、上下文超限、内容策略、5xx、未配置模型，以及保存成功后才生成、修订号不对时零次模型调用、修理中途修订变化后停止、冲突后保留用户正文、冲突不进入 FakeProvider、修订不变时生成成功、修订不变时修理仍最多 2 轮。真实 Grok 不在这套测试里。

6. 真实 Grok 验证
可以进行。本机 host 已用这份代码重新启动，健康检查返回 {"status":"ok"}。项目的自动云端记忆仍是关闭。我没有发真实 Grok 请求。

手动验证时用「生成」，并在确认清单后再发送。若密钥、额度或网络有问题，界面应显示对应原因，而不是「没有可用模型」。模拟生成仍然单独走本地。不要点「授权自动更新」，否则会把现有正文发给当前记忆模型。

## Response:
10/5/2026, 5:59:12 AM · gpt-5-6

这份 Agent 回报整体上**符合我们之前确定的 P0 范围，而且没有越界实现 P1**。从结果看，Stage 1 的核心安全性和并发保护已经达到可以进入最终验证的状态。

### 我建议你现在不要让它继续改代码

尤其是这几个点已经做对了：

- **67 个 pytest 全通过**
- 客户端 `preflight.test.ts` 通过
- `tsc -b` 通过
- 真实 Grok 没被塞进默认测试
- FakeProvider 与真实模型彻底分开
- 未保存稿保存失败 → **0 次模型调用**
- 修订冲突 → **停止后续生成/修理，不覆盖用户内容**
- 不再把真实模型错误统一伪装成“没有可用模型”
- `SEND_NOT_CONFIRMED` 和 `REVISION_CONFLICT` 仍然独立
- 云端自动记忆仍默认关闭
- 没有偷偷开始 Research / Style Profile / Vector Search / Character State 等 Stage 2 内容

这基本就是我们要的 **Stage 1 Freeze Candidate**。

### 现在做最后一次真实 Grok 验证

你可以直接在 Cursor 里打开当前项目，然后：

**AI Novel Studio → 现代都市项目 → 第一章/第二章 → 生成**

流程按照正常操作：

1. 输入/确认你的正文或生成要求。
2. 点击 **「生成」**。
3. 如果出现发送清单，检查内容。
4. 点击 **「确认并发送」**。
5. 等待 Grok 生成。
6. 检查生成结果是否真正写入章节。
7. 再测试一次**篇幅修理**，确认正常生成后最多进行 2 次修理。
8. 检查生成失败时不会自动变成 FakeProvider。

### 特别注意

Agent 最后说的：

> 不要点「授权自动更新」

这个建议是对的。

因为目前 **Cloud Memory 是另外一条权限链**。我们现在测试的是：

**用户主动请求 → Writer → Send Manifest → Grok → 返回正文 → 保存**

而不是：

**用户正文 → 自动 Memory Updater → 云端模型**

所以现在不要把两个系统混在一起测试。

---

### 如果真实 Grok 也通过

那么我建议你马上让 Agent **只做一件事：最终审计，不改代码**。

可以给它这段：

```text
P0 已实现，67 个 pytest、客户端测试和 tsc 均通过。

现在不要修改任何代码，不要新增功能，不要 commit，不要 push。

请进行一次 Stage 1 Final Freeze Audit，只检查，不修改。

确认：

1. P0 三项是否全部实现：
   - Provider Error Classification
   - Generation Revision Conflict
   - Dirty Draft 持久化后才能调用模型

2. FakeProvider 与真实 Provider 是否完全分离。

3. 真实 Grok 失败时是否绝不会静默 fallback 到 FakeProvider。

4. SEND_NOT_CONFIRMED、REVISION_CONFLICT、MODEL_UNAVAILABLE 以及新的 Provider error codes 是否保持语义独立。

5. Cloud Memory 默认关闭是否保持。

6. Send Manifest 安全门是否保持。

7. API Key / secret 是否没有进入 SQLite、Git、日志或错误响应。

8. 是否意外实现了任何 P1/P2 功能。

9. 是否存在会影响 Stage 2 的已知架构问题。

10. 当前代码是否可以正式标记为 Stage 1 Freeze。

只读审计，不修改文件。

最后只报告：
- PASS 项
- 风险项
- 必须修复项
- Stage 1 是否可以 Freeze

不要 commit / push。
```

**如果这个最终审计也是 PASS，我们就可以正式把 Stage 1 冻结。**

然后下一步不要直接开始写 Stage 2 全部功能，而是先做我们之前定好的 **Stage 2 设计/接口冻结**，尤其是 `Context Budget + Retrieval + Volume/Arc/Scene + 动态状态` 这几个核心基础，否则后面很容易再次大改架构。

## Prompt:
10/5/2026, 6:04:18 AM

不行，第一章和第二章的内容完全对不上更别说修改第一章后第二章会自动更新了

## Response:
10/5/2026, 6:04:21 AM · gpt-5-6

对，这个问题很关键。**那现在绝对不能 Freeze Stage 1。**

而且这里其实不是一个小 Bug，而是我们之前验收标准和现在实际行为之间存在明显缺口：

> **第一章 → 第二章的故事连续性链条没有真正建立。**

目前系统虽然有 `chapter_summary`、`stale_context`、revision conflict 等机制，但它们主要是在做“记录和保护”，**并没有真正保证下一章依据上一章的最新内容进行生成，更没有实现第一章修改后第二章自动重新同步。**

### 现在要先区分两个需求

#### ① 正常写第二章

应该是：

```text
第一章正文
   ↓
第一章最新 Revision
   ↓
第一章 Summary / Memory
   ↓
Context Retrieval
   ↓
第二章生成
```

第二章不能只根据：

```text
用户要求 + 人物卡 + 世界观
```

来自己编。

而应该明确知道：

- 第一章发生了什么
- 人物目前在哪里
- 人物之间发生了什么
- 第一章结束时人物状态是什么
- 已经揭露了哪些信息
- 哪些剧情已经发生
- 第二章应该从什么地方接上

---

#### ② 修改第一章之后

这里又有两种不同程度：

**最低要求：**

```text
修改第一章
 ↓
第一章 Revision 改变
 ↓
第一章旧 Summary 失效
 ↓
重新生成第一章 Summary
 ↓
第二章被标记为需要重新检查
 ↓
第二章下一次生成/重写时使用新的第一章信息
```

**更符合你现在想要的效果：**

```text
修改第一章
 ↓
系统分析影响范围
 ↓
发现第二章依赖第一章
 ↓
第二章标记「需要更新」
 ↓
重新生成第二章
 ↓
第二章新的内容继续影响第三章
 ↓
……
```

但这里我建议**不要直接让系统偷偷覆盖第二章**。

因为假如你已经认真写了第二章，第一章稍微改一句话，系统直接把第二章整个重写掉，会非常危险。

正确设计应该是：

> **自动检测 + 自动标记 + 提供重新生成/同步，而不是未经确认自动覆盖用户正文。**

---

## 所以现在应该让 Agent 修这个

我建议你**暂时不要让它做整个 Stage 2**，先把这个问题作为 Stage 1 的必要修复。

直接把下面这段发给当前 Agent：

```text
现在不能 Freeze Stage 1。

我实际验证后发现一个严重问题：

第一章和第二章的内容完全对不上。

更重要的是，修改第一章之后，第二章没有真正根据第一章的新内容进行更新。

这说明目前的 chapter summary / stale_context / retrieval 机制虽然存在，但没有形成真正可用的“章节连续性链”。

现在暂停 Freeze，先解决这个问题。

一、首先不要直接重写第二章

不要因为第一章修改就未经用户确认自动覆盖第二章正文。

正确行为应该是：

第一章发生有效正文修改
→ 第一章 current_revision_id 改变
→ 第一章旧 summary 失效
→ 第二章被标记为依赖上游变化 / needs_update
→ 系统能够重新生成第一章最新 summary
→ 第二章下一次生成、续写或重写时必须使用第一章最新有效 summary
→ 如果第二章被重新生成并保存，再继续影响第三章。

二、正常生成第二章时必须真正读取第一章最新有效上下文

不能只把 character/world 卡片放进 writer pack。

第二章生成至少应该能够获得：

1. 第一章最新正文对应的有效 summary
2. 第一章发生的关键事件
3. 第一章结束时的重要人物状态
4. 第一章产生的重要剧情信息
5. 必要的世界状态变化
6. 第一章与第二章之间的剧情衔接信息

如果当前系统暂时只有 chapter_summary，没有完整 state tables，那么第一阶段可以先使用“章节摘要 + 章节结束状态”的方式实现。

不要现在引入 Character State / Relationship State / World State 等完整 P1 架构。

三、解决目前“第一章 summary 无法注入第二章”的问题

当前审计已经发现：

chapter 1 没有可注入 summary；
chapter 2 stale_context=1；
auto memory off 时 summary rebuild 会被 SEND_NOT_CONFIRMED 拦截。

这里不能只告诉用户“打开自动记忆”。

用户正常写小说时，章节之间的基本连续性不应该依赖 cloud memory opt-in。

需要区分：

A. 本地章节连续性 Memory
B. Cloud Memory Updater

A 是小说核心功能，应该默认工作。

B 是可选的云端 AI 自动记忆功能。

不能让第二章因为 Cloud Memory 默认关闭就失去第一章上下文。

四、不要把第一章完整正文无限塞进第二章

仍然保持当前架构：

Canonical chapter prose
→ Derived chapter summary
→ Retrieval
→ Writer Pack

不要把所有前章全文直接注入模型。

五、修改第一章之后的影响传播

当第一章 current_revision_id 改变：

至少：

- 第一章旧 summary 标记 stale
- 第二章标记需要重新检查
- 第三章及之后如果依赖第二章的派生上下文，也应该形成正确的影响链

但不要直接删除后续章节正文。

六、增加明确的 UI 状态

用户应该能够看到：

第二章：

“上游章节已修改，需要重新同步”

或者：

“本章使用的第一章上下文已过期”

并提供明确操作：

“重新同步上下文”

“重新生成本章”

而不是偷偷覆盖正文。

七、必须增加自动化测试

至少增加：

1. 创建第一章正文 A
2. 创建第一章有效 summary
3. 创建第二章
4. 验证第二章 writer pack 确实包含第一章 summary

5. 修改第一章为正文 B
6. 验证第一章旧 summary 失效

7. 验证第二章被标记为需要更新

8. 重新生成第一章 summary
9. 验证第二章下一次生成使用的是 B 对应的 summary，而不是 A

10. 修改第一章后，第二章原正文不能被系统自动覆盖

11. 第二章重新同步/重新生成后，才能产生新的第二章 revision

12. 第二章更新后，第三章的相关上下文也正确失效

13. Cloud Memory 默认关闭时，上述本地章节连续性仍然正常工作

14. Cloud Memory 开启时，也不能绕过现有 Send Manifest 安全门

15. 第一章没有 summary 时，系统必须明确处理，而不能静默生成一个完全脱离第一章的第二章。

八、非常重要

不要实现：

- Character State
- Relationship State
- World State
- Timeline
- Foreshadowing
- Research Agent
- Style Profile
- Vector Search
- Context Budget
- Arc
- Scene

这些仍然留到后续阶段。

这次只修复：

“Chapter-to-Chapter Continuity”

九、完成后

不要 commit。

不要 push。

运行完整测试，并实际创建：

第一章：
一个角色进入某个地点，并发现一个具体事件。

第二章：
必须明确承接第一章。

然后修改第一章中的关键事件。

重新生成/同步第二章。

证明第二章使用了第一章的新版本，而不是旧版本。

最后报告：

1. 为什么之前第一章和第二章对不上
2. 哪些代码导致了这个问题
3. 修改了哪些文件
4. 现在章节上下文如何传递
5. 修改第一章后第二章如何被标记
6. Cloud Memory 关闭时是否仍然正常
7. 新增多少测试
8. 全部测试结果
9. 是否还有已知问题

不要进行其他 P1/P2 实现。
```

### 还有一个非常重要的判断

你说的：

> “更别说修改第一章后第二章会自动更新了”

**这句话其实暴露了我们之前 Stage 1 验收标准的问题。**

我们原先的设计更接近：

> 修改第一章 → 让第二章知道“以前的上下文过期了”。

但你真正需要的是：

> **修改第一章 → 系统知道第二章受影响 → 第二章进入待同步状态 → 使用第一章新版本重新生成上下文 → 用户确认后生成新的第二章。**

这才是一个真正的**长篇小说引擎**，而不是“几个带 AI 生成按钮的章节编辑器”。

所以这次不要急着往 Research Agent、Style Profile、角色状态那些高级功能走。

**先把“第一章 → 第二章 → 第三章”的因果链彻底打通。**

这一步打通以后，再往上加人物状态、时间线、伏笔、世界状态，整个架构才会真正开始像一个长篇小说系统。

## Prompt:
10/5/2026, 6:19:11 AM

第二章对不上，是因为章节连续性被绑在默认关闭的云端记忆上。我会改成默认的本地连续性链：上游一改就标需要同步，但不会自动改写后面的正文。

第二章对不上，是因为第一章的有效摘要从来没有进入第二章的写作包。云端记忆默认关闭时，摘要重建停在 SEND_NOT_CONFIRMED，检索又只接受未过期且修订号一致的摘要，所以第二章实际只看到人物卡和世界卡。修改第一章只会把旧摘要标过期，并给第二章打上 stale_context，不会改写第二章正文，也不会准备一份新的本地上下文。

现在章节连续性默认在本机完成。云端记忆仍然是可选功能，而且继续走原来的发送清单。

代码原因
host/studio.py 的 schedule_summary：未授权时直接返回，不生成摘要。
canon/summaries.py 的 injectable_summary：过期或修订号不一致的摘要不会被注入。
memory/pack.py：写作包只放入可注入摘要，没有摘要时就只剩卡片。
agents/memory_updater.py：云端重建必须先有记忆授权和对应清单。
现在怎么传递
保存正文后，本机会立刻写一份连续性摘要，包含摘要、关键事件、章节结束状态，以及给下一章的衔接说明。它不调用模型，也不把前章全文放进写作包。后一章生成、预览或同步时，读的是这份与当前修订号一致的摘要。前面的章节如果有正文却做不出摘要，生成会停在 UPSTREAM_CONTEXT_MISSING，不会静默写成一篇脱离前文的新章。

修改第一章后：旧摘要变为过期，新摘要绑定新的 current_revision_id，第二章和更后面的章节变成 stale_context = 1。第二章正文保持原修订。点「重新同步上下文」只把状态改成 2，表示上游摘要已就绪，正文仍是旧版。只有点「重新生成本章」并成功保存后，第二章才出现新修订，同时第三章被标成需要更新。

云端记忆关闭时，这条链仍然工作，测试里的模型传输次数是 0。云端记忆打开时，云端重建仍要单独的已确认清单，正文生成也仍要逐次确认，没有 send_grant。

修改的文件
canon/local_continuity.py、prose/revisions.py、pipeline/chapter_flow.py、pipeline/jobs.py、host/routes.py、client/src/App.tsx、client/src/lib/api.ts、client/src/components/editor/ChapterEditor.tsx、client/src/components/shell/AssistantRail.tsx、client/src/components/home/ProjectHome.tsx，以及 tests/test_chapter_continuity.py、tests/test_cloud_memory.py、tests/test_stage1_flow.py。

测试
完整 pytest：71 passed，1 条原有 Starlette 警告，没有失败。这次新增 4 个测试，覆盖你列出的 15 项：正文 A 的摘要进入第二章写作包，改成正文 B 后旧摘要失效、第二章被标记且原文不被覆盖，下一次生成用的是「没有署名的信」而不是「会发光的齿」，同步不产生新修订，重新生成后才有新修订并让第三章失效，云端记忆关闭时不连模型，开启时仍要清单，没有摘要时不会生成脱离前文的第二章。

你的《现代都市》里，第二章修订号在同步前后都是 01a108f1-4a1e-72b8-b748-e5d75db8c546，正文没有被改写。第一章现在有一份对应当前修订的本地摘要。界面从「需要重新同步」变成「上游上下文已同步。本章正文仍是同步前的版本。」

还存在的限制
本地摘要是从开头、事件和结尾截出来的，不是独立的人物或世界状态表。第二章的现有正文仍然是按旧上下文写的；要换成承接新第一章的正文，需要你明确点「重新生成本章」。那一步仍会先确认再发给 Grok。没有 commit，也没有 push。

## Response:
10/5/2026, 6:19:17 AM · gpt-5-6

这次修改方向是**正确的，而且比之前的设计明显合理**。不过我现在仍然建议：**不要 Freeze，先做一次真实的端到端连续性验证。**

最重要的变化是它终于把两个概念分开了：

```text
本地章节连续性
        ↓
默认开启
        ↓
不需要调用 AI
        ↓
第一章 Revision
        ↓
本地 Continuity Summary
        ↓
第二章 Writer Pack
```

和：

```text
Cloud Memory
        ↓
可选
        ↓
需要 Send Manifest
        ↓
需要用户授权
        ↓
调用 Grok
```

这才是正确的架构。

### 现在这几个结果尤其重要

**1. 第二章终于不能“凭空写”了**

如果第一章有正文但没有可用摘要，现在会：

> `UPSTREAM_CONTEXT_MISSING`

而不是继续生成一章看起来合理、实际上与第一章完全无关的内容。

这是非常重要的安全机制。

**2. 修改第一章不会偷偷毁掉第二章**

现在是：

```text
修改第一章
 ↓
第一章新 Revision
 ↓
旧 Summary 失效
 ↓
生成新的本地 Summary
 ↓
第二章 stale_context = 1
 ↓
第二章正文保持不变
```

这比“自动重写第二章”好得多。

**3. 「同步上下文」和「重新生成本章」分开了**

这个设计我很赞成：

```text
重新同步上下文
    ↓
只更新第二章所依赖的上游信息
    ↓
不改变第二章正文
```

然后：

```text
重新生成本章
    ↓
使用新的第一章上下文
    ↓
生成新的第二章 Revision
```

这能避免用户写了几万字以后，系统因为前面改了一个细节，把后面全部自动覆盖。

---

## 但现在还有一个需要重点验证的问题

Agent 说：

> 本地摘要是从开头、事件和结尾截出来的

这意味着目前的“连续性”实际上还是：

**文本摘要机制**

而不是：

**真正的小说状态机。**

例如第一章：

> 陈默进入上海。
> 他认识了林雨。
> 林雨告诉他父亲失踪了。
> 陈默决定调查。
> 临走前林雨把一把红色钥匙交给他。

第二章应该知道：

- 陈默现在在哪里
- 林雨是谁
- 林雨的父亲失踪
- 陈默决定调查
- 红色钥匙已经交给陈默
- 第一章结束时陈默正在准备调查

现在的本地摘要**有可能**提取出这些，但我们不能只相信 Agent 的解释。

---

# 现在做真正的验收

我建议你不要再让 Agent 改代码。

先让它用当前代码做一个**固定剧情实验**。

直接把下面这段发给它：

```text
现在先不要修改任何代码，也不要 commit / push。

我要进行 Stage 1 Chapter Continuity 的真实端到端验收。

请使用当前项目创建一个最小测试故事，不要使用《现代都市》现有正文。

测试要求：

第一章明确写入以下事实：

1. 主角“陈默”进入“青岚镇”。
2. 陈默遇到“林雨”。
3. 林雨告诉陈默，她的父亲“三年前失踪”。
4. 林雨把“一把红色钥匙”交给陈默。
5. 第一章结尾陈默决定调查这件事。

然后：

A. 保存第一章。
B. 检查本地 continuity summary。
C. 创建第二章。
D. 在真正调用模型之前，检查第二章 writer pack。

必须证明第二章 writer pack 中实际包含能够支持以下事实的上游上下文：

- 青岚镇
- 林雨
- 林雨父亲失踪
- 红色钥匙
- 陈默决定调查

如果缺少其中任何关键事实，不要继续生成，报告失败原因。

然后进行第二阶段：

把第一章修改成：

1. 陈默进入“北川镇”，而不是青岚镇。
2. 林雨把“黑色钥匙”交给陈默，而不是红色钥匙。
3. 其他关键剧情保持一致。

保存第一章新 revision。

检查：

1. 第一章旧 summary 是否失效。
2. 新 summary 是否绑定新的 current_revision_id。
3. 第二章是否变成 stale_context。
4. 第二章原正文是否完全没有被覆盖。
5. 第二章同步前后的 revision id 是否一致。

然后执行“重新同步上下文”。

检查：

1. 第二章正文是否仍然没有变化。
2. 第二章是否已经获得第一章的新 summary。
3. 第二章 writer pack 是否现在包含：
   - 北川镇
   - 黑色钥匙
   - 林雨
   - 林雨父亲失踪
   - 陈默调查决定

最后，不要直接重新生成第二章。

只报告以上所有检查结果。

如果全部通过，说明：
Chapter 1 → Local Continuity Summary → Chapter 2 Writer Pack
这条链已经真实打通。

如果任何一项失败，指出具体失败点。

不要修改代码。
不要 commit。
不要 push。
不要调用真实 Grok。
```

### 为什么我要这样测？

因为现在 Agent 的报告里有一句话值得特别注意：

> “测试里的模型传输次数是 0”

这是**好事，但还不够**。

我们现在要验证的是：

> **第二章的 AI 真正拿到了什么。**

不是：

> 系统数据库里有没有一条 summary。

两者完全不是一回事。

最终我们真正需要的链条是：

```text
                 ┌──────────────────┐
                 │ Chapter 1        │
                 │ Revision A       │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ Local Summary A  │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ Writer Pack      │
                 │ for Chapter 2   │
                 └────────┬─────────┘
                          ↓
                    Chapter 2
```

修改第一章：

```text
Chapter 1 Revision B
        ↓
Summary A → STALE
        ↓
Summary B
        ↓
Chapter 2 → STALE
        ↓
Sync Context
        ↓
Chapter 2 Writer Pack
        ↓
看到 Summary B
```

然后**只有用户明确要求重新生成第二章**时：

```text
Summary B
    ↓
Grok
    ↓
Chapter 2 Revision B
```

这套机制如果这次端到端测试通过，我才会认为：

> **Stage 1 的“章节连续性基础设施”真正成立了。**

至于人物状态、关系变化、世界状态、时间线、伏笔等，我们之后再逐步从这个基础上升级，不需要现在全部塞进来。

## Prompt:
10/5/2026, 6:21:55 AM

不仅仅是第一章和第二章的问题，后面所有章节都要。而且ai需要有一个大纲系统，使用者可以输出让ai给出多少字的大纲，然后可以修改大纲。然后再让大纲变成小说

## Response:
10/5/2026, 6:21:58 AM · gpt-5-6

对。这样一来，**我们现在不能再把目标定义成“修好第一章→第二章”**。你真正要做的是一个完整的**长篇小说创作引擎**：

> **用户想法 → AI 大纲 → 用户修改/确认大纲 → AI 按大纲写小说 → 全书持续保持剧情连续性。**

而且这个“大纲”应该成为小说生成的**上游事实来源之一**，不能只是一个给用户看的文本框。

### 我建议把整个生成链改成

```text
用户创意 / 世界观 / 人物
          ↓
      AI 故事架构
          ↓
       【小说大纲】
          ↓
   用户查看 / 修改 / 确认
          ↓
     ┌────┴────┐
     ↓         ↓
   卷大纲     主线/支线
     ↓
   章节大纲
     ↓
   场景计划
     ↓
     写作
     ↓
   第1章
     ↓
   状态/摘要更新
     ↓
   第2章
     ↓
   状态/摘要更新
     ↓
   第3章
     ↓
    ...
     ↓
   第N章
```

这里最关键的是：

**不是“写完第一章，再让 AI 猜第二章”。**

而应该是：

> **先知道整本小说准备怎么发展，再逐章把大纲落实成正文。**

---

# 一、你说的“大纲”实际上应该分成几层

我不建议只做一个几千字的 `outline` 文本。

至少应该有：

### ① 总体故事大纲

例如用户要求：

> “给我一个 10,000 字的现代都市悬疑小说大纲。”

AI 可以生成：

```text
第一部分：意外事件
1. 主角回到青岚镇
2. 遇见林雨
3. 得知父亲失踪
4. 获得红色钥匙
5. 调查旧宅

第二部分：真相浮现
6. 发现旧报纸
7. ...
```

用户可以直接修改。

---

### ② 卷/篇大纲

如果小说很长：

```text
全书
├── 第一卷：失踪者
│   ├── 第1章
│   ├── 第2章
│   └── ...
├── 第二卷：旧案
│   ├── 第31章
│   ├── 第32章
│   └── ...
└── 第三卷：真相
```

---

### ③ 章节大纲

比如：

```text
第12章：地下室

本章目标：
陈默找到父亲留下的地下室。

主要事件：
1. 陈默根据红色钥匙找到旧宅
2. 发现地下室入口
3. 遇到林雨
4. 两人发生争执
5. 地下室出现异常声音

本章结尾：
陈默打开地下室铁门。

必须保留：
- 红色钥匙已经在陈默手中
- 林雨知道地下室存在
- 父亲仍然处于失踪状态

不能发生：
- 父亲已经死亡
- 陈默知道最终真相
```

这个东西非常重要。

**AI 写第12章的时候，不应该自己决定第12章要发生什么。**

它应该：

> **执行第12章大纲。**

---

# 二、用户必须能够修改大纲

这一点我非常赞成，而且应该是核心功能。

界面可以设计成：

```text
┌───────────────────────────────────────────────┐
│ AI Novel Studio                               │
├─────────────┬───────────────────┬─────────────┤
│ 项目        │ 大纲编辑器         │ AI 助手      │
│             │                   │              │
│ 📖 小说     │ 第一卷：失踪者     │ 可以帮你     │
│ 📋 大纲     │                   │ 修改大纲     │
│ 👤 人物     │ 第1章……           │              │
│ 🌍 世界     │ 第2章……           │              │
│ 🕒 时间线   │ 第3章……           │              │
│             │                   │              │
│             │ [编辑大纲]         │ [生成大纲]   │
└─────────────┴───────────────────┴─────────────┘
```

用户可以：

- AI 生成
- 手动修改
- 删除
- 增加剧情
- 调整顺序
- 改章节
- 改章节字数
- 添加必须发生的事件
- 添加禁止发生的事件
- 重新让 AI 优化某一部分

然后：

**“确认大纲”**

才能进入小说生成阶段。

---

# 三、“多少字的大纲”也应该真正控制

例如用户输入：

> 生成 5000 字大纲

系统不应该简单地要求模型 `max_tokens=5000`。

应该理解成：

> **目标大纲长度 ≈ 5000 字**

然后允许：

```text
目标长度：5000 字
最少：4500
最多：5500
```

而且这个设置应该和**小说正文长度**分开。

例如：

```text
大纲
目标：5,000 字

正文
每章目标：3,000 字
全书预计：100 章
```

---

# 四、真正重要的是“大纲 → 小说”

这是整个系统的核心。

不能：

```text
5000字大纲
   ↓
直接让 AI 写 100 万字小说
```

上下文很快就会失控。

应该：

```text
总大纲
 ↓
卷大纲
 ↓
章节大纲
 ↓
当前章节
 ↓
场景计划
 ↓
正文
```

例如：

```text
总大纲
 ↓
第一卷大纲
 ↓
第12章大纲
 ↓
第12章 Scene 1
 ↓
Scene 2
 ↓
Scene 3
 ↓
第12章正文
```

---

# 五、而且“大纲”本身也必须参与连续性

这是你刚才提出的问题最关键的地方。

不能只有：

```text
Chapter 1
 ↓
Summary
 ↓
Chapter 2
```

而应该是：

```text
                 ┌──────────────┐
                 │   总体大纲    │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │    卷大纲     │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   章节大纲    │
                 └──────┬───────┘
                        ↓
Chapter 1 → State → Chapter 2 → State → Chapter 3
```

所以第50章写作时，AI 至少应该知道：

**上游规划：**

- 全书大纲
- 当前卷大纲
- 当前章节大纲

**已经发生的故事：**

- 前面章节的摘要
- 人物当前状态
- 关系
- 世界状态
- 时间线
- 已经揭露的信息
- 尚未揭露的秘密
- 伏笔

**当前写作目标：**

- 本章应该发生什么
- 本章不能发生什么
- 本章结尾应该达到什么状态

---

# 六、修改大纲以后怎么办？

这也是必须提前设计好的。

例如原来的大纲：

```text
第20章：
陈默发现红色钥匙属于父亲。
```

用户修改：

```text
第20章：
陈默发现红色钥匙属于林雨。
```

那么系统不能只修改一行文字。

应该进行：

```text
大纲 Revision B
       ↓
检测影响范围
       ↓
第20章受影响
       ↓
第21～30章可能受影响
       ↓
标记这些章节
       ↓
用户决定是否重新生成
```

也就是说：

> **大纲本身也需要 Revision / Dependency / Impact Analysis。**

---

# 七、所以我建议你现在先别让 Agent 继续修 Stage 1

我们已经发现了一个更大的问题：

**现在的架构已经开始需要 Stage 2 的真正核心了。**

我建议现在让 Agent **停止编码，先重新设计 Stage 2**。

尤其需要设计这几个核心对象：

```text
Project
 ├── Story Outline
 ├── Volume
 │    └── Chapter Outline
 │          └── Scene Plan
 │
 ├── Characters
 ├── World
 ├── Timeline
 ├── Relationships
 ├── Foreshadowing
 │
 └── Prose
      ├── Chapter 1
      ├── Chapter 2
      └── ...
```

以及最重要的：

```text
Outline Revision
Chapter Outline Revision
Prose Revision
Derived Memory
Dependency / Impact
```

---

## 你现在可以直接把这段给 Agent

```text
暂停当前 Stage 1 Freeze。

我重新明确产品核心需求：

AI Novel Studio 不是简单的 AI 章节生成器，而是一个长篇小说创作引擎。

核心工作流必须是：

用户创意
→ AI 故事架构
→ AI 生成可编辑的大纲
→ 用户修改/确认大纲
→ 大纲拆分为卷/章节计划
→ 根据章节大纲生成正文
→ 每章完成后更新连续性状态
→ 后续章节继续读取最新有效状态
→ 支持全书持续到任意章节。

因此现在不要继续局部修 Chapter 1 → Chapter 2。

请先进行 Stage 2 Architecture Design，只设计，不编码。

重点设计：

1. Story Outline
- 用户可以要求 AI 生成指定目标字数的大纲
- 大纲有 target/min/max length
- 用户可以手动修改
- 用户可以要求 AI 修改某一部分
- 大纲必须有 revision
- 用户确认大纲后才能进入正文生成

2. Outline Hierarchy

Project
→ Story Outline
→ Volume
→ Arc
→ Chapter Outline
→ Scene Plan
→ Prose Chapter

需要说明哪些层级应该真正进入数据库。

3. Outline → Prose

明确：

总大纲
→ 当前卷大纲
→ 当前章节大纲
→ Scene Plan
→ Writer Pack
→ 正文

AI 写正文时不能脱离当前章节大纲自由决定主要剧情。

4. Chapter Continuity

不能只解决 Chapter 1 → Chapter 2。

必须支持：

Chapter 1 → 2 → 3 → ... → N

每章完成后产生可检索的本地连续性信息。

后续章节必须使用当前有效上游上下文。

Cloud Memory 不能成为基本章节连续性的前提。

5. Outline Dependency

如果用户修改：

- 总大纲
- 卷大纲
- 章节大纲

系统应该能够确定哪些后续章节可能受影响。

不能未经用户确认自动覆盖已经写好的正文。

6. Revision

至少考虑：

Story Outline Revision
Chapter Outline Revision
Prose Revision
Derived Memory Revision

明确它们之间的关系。

7. Impact

例如：

修改第10章大纲
→ 第10章正文需要检查
→ 第11～N章根据依赖关系标记可能受影响

修改总大纲
→ 根据具体变化计算影响范围

8. Context Assembly

设计统一 Writer Pack：

- 当前总大纲相关部分
- 当前卷/Arc相关部分
- 当前章节大纲
- 当前 Scene Plan
- 前序章节有效连续性摘要
- 当前人物状态
- 当前关系状态
- 当前世界状态
- 时间线
- 伏笔
- 用户明确要求
- 禁止事项

不要把整本小说全文塞给模型。

9. 大纲长度

区分：

Outline target length
Chapter target length
Scene target length

不要把“字数”简单等同于 max_output_tokens。

10. UI

设计：

左侧：
项目 / 大纲 / 卷 / 章节 / 人物 / 世界 / 时间线

中间：
大纲编辑器 / 正文编辑器

右侧：
AI 助手

支持：

生成大纲
修改大纲
确认大纲
拆分章节
生成章节大纲
生成 Scene Plan
根据大纲写正文
重新生成章节
检查连续性
检查大纲影响

11. Stage 2 不要一次实现全部功能

请给出：

Stage 2A
Stage 2B
Stage 2C

分别应该实现什么。

尤其说明哪些数据库表必须现在建立，哪些可以后置。

12. 重要限制

暂时不要实现：
Research Agent
Style Profile
Vector Search
完整商业版权系统
自动网页抓取
高级模型路由
复杂成本系统

先把：

“大纲 → 章节计划 → 连续性 → 正文”

这条主链设计正确。

最后输出：

A. 推荐数据库结构
B. API 结构
C. Writer Pack 结构
D. Outline Revision 设计
E. Dependency / Impact 设计
F. Chapter Continuity 设计
G. UI 结构
H. Stage 2A/B/C 实施顺序
I. Stage 1 当前代码哪些保留
J. 哪些地方需要重构

只设计，不修改代码。
不要 commit。
不要 push。
```

我认为这一步比继续修当前“第一章→第二章”的问题重要得多。

**你的最终产品核心应该是“大纲驱动的长篇小说生成”，而不是“连续生成很多章节”。** 一旦把这个核心确定下来，后面的角色状态、关系、时间线、伏笔、世界状态都应该作为“大纲 → 正文”这条主链的辅助状态逐步加入。

## Prompt:
10/5/2026, 6:23:03 AM

帮我检查一下

## Response:
10/5/2026, 6:23:07 AM · gpt-5-6

可以。把你要我检查的内容发给我即可——如果你指的是 **Cursor Agent 刚刚完成的 Stage 2 Architecture Design 报告**，直接把 Agent 的完整结果粘贴过来，我会重点检查：

1. **大纲系统是否真正成为小说生成的上游**
   - 总纲 → 卷/Arc → 章节大纲 → Scene → 正文
   - 用户能否修改、确认大纲
   - AI 是否会严格依据确认后的大纲写作

2. **长篇连续性**
   - 是否真正支持第 1 章 → 第 2 章 → … → 第 N 章
   - 修改前面章节/大纲后，后续章节如何标记和同步
   - 是否存在“后面章节脱离前文自己乱写”的漏洞

3. **Revision / Dependency**
   - 大纲 Revision
   - 章节大纲 Revision
   - 正文 Revision
   - 上下文/摘要 Revision
   - 修改上游后影响范围是否正确

4. **数据库设计**
   - 哪些表必须现在建立
   - 哪些设计会导致以后推翻重做
   - 是否存在重复数据或错误的状态归属

5. **Writer Pack**
   - AI 写第 N 章时究竟会看到什么
   - 是否能同时看到“大纲要求”和“已经发生的剧情”
   - 是否会把过多全文塞进上下文导致后期爆炸

6. **AI 大纲字数**
   - 用户要求 1,000 / 5,000 / 20,000 字时是否真的能控制
   - 是否把“中文字符数”和 token 混为一谈

7. **Cloud Memory**
   - 本地连续性是否完全独立
   - 云端记忆关闭时小说核心功能是否仍然正常
   - 是否可能因为 SEND_NOT_CONFIRMED 导致小说无法继续

8. **以后扩展**
   - 人物状态
   - 人物关系
   - 世界状态
   - 时间线
   - 伏笔
   - Research Agent
   - Style Profile

我会特别帮你找**“现在看起来能用，但做到几十章/几百章后一定出问题”的设计**。

把 Agent 的检查结果完整发来，我直接逐项帮你审。

## Prompt:
10/5/2026, 6:25:15 AM

Stage 1 的冻结先停在这里。下面只设计「大纲 → 章节计划 → 连续性 → 正文」这条主链，不改代码。

现有基础可以留下来：一部小说一个 SQLite、ModelRouter 与发送清单、本机连续性摘要、正文修订链、人物卡和世界卡（定义，不是随章状态）。缺的是一份可修订、可确认、并能约束正文的大纲，以及大纲变化对后续章节的影响，而不是再把第二章做成特例。

A. 推荐数据库结构
层级里，真正要进库的是会单独修订、单独确认、或会被后文引用的东西。

2A 就要建的表

story_outline：每个项目、每个分支一份当前大纲。字段包括当前修订号、确认状态（drafting / confirmed）、以及大纲自己的 target_length、minimum_length、maximum_length。这里的长度是大纲文档的字数，不是正文字数。

story_outline_revision：不可变修订。parent_revision_id、正文（Markdown）、结构化目录（卷、弧、章的标题、目标和顺序）、字数、作者（user / planner）、状态（draft / confirmed / superseded）。确认只追加一条修订，不改历史行。

chapter_outline_revision：某一章的大纲修订。指向 chapter_id、parent_revision_id、当时所依据的 story_outline_revision_id，以及本章目标、主要情节、必须发生的事件、禁止事项、场景提纲（2A 用 JSON 列表）、本章正文字数目标。状态同样是 draft / confirmed。

在现有表上追加列，不新建状态机：

chapter.current_outline_revision_id
chapter.impact_status：none / outline_changed / upstream_changed / both
prose_revision.chapter_outline_revision_id：这篇正文是按哪一版章节大纲写的
chapter_summary.story_outline_revision_id 与 chapter_summary.chapter_outline_revision_id：这份连续性摘要对应哪一版计划
volume 已存在，2A 只给它加 current_outline_revision_id，卷大纲正文放在 volume_outline_revision。这样总大纲拆卷时有落点，而不把卷内容永远嵌在总大纲字符串里。

2B 再建

arc：属于某一卷，有顺序、目标、起止章节。chapter.arc_id 可空。

scene_plan：属于某一版章节大纲，有顺序、目的、目标字数、进入状态、离开状态。2A 的场景提纲 JSON 在这里拆成行，不把场景升级成另一套正文。

2C 再建

character_state、relationship_state、world_state、timeline_event、foreshadow。每行都带 source_chapter_id、source_prose_revision_id、source_outline_revision_id、故事内时间、状态。它们是派生或用户确认过的状态，不覆盖人物卡和世界条目的定义。

不要进库的东西

写作包本身不落成「当前上下文表」。它是一次生成当时的块列表，继续写进现有 send_manifest。研究来源、文风档案、向量索引、预算账本这次都不建。

B. API 结构
大纲与正文分开。

POST /projects/{id}/outline/generate：按目标字数生成总大纲。请求带 target_length、minimum_length、maximum_length。未确认前可以反复生成，每次产生新修订。
PUT /projects/{id}/outline：用户手改，产生新的用户修订。
POST /projects/{id}/outline/revise：改某一部分。请求带 base_revision_id 和片段范围，结果仍是一条子修订，不直接改已确认稿。
POST /projects/{id}/outline/confirm：把指定修订标为 confirmed。这是进入 AI 正文的门。
POST /projects/{id}/outline/split：把已确认总大纲拆成卷大纲和章节大纲。已有正文的章节只得到新的大纲修订和影响标记，不改 current_revision_id。
POST /chapters/{id}/outline/generate 与 PUT /chapters/{id}/outline：章节大纲的生成和手改。
POST /chapters/{id}/outline/confirm
POST /chapters/{id}/scenes/plan：2B。生成场景计划。
现有 POST /chapters/{id}/generate：增加前提。总大纲已确认，且本章大纲已确认，写作包里必须有本章大纲。否则返回新的 OUTLINE_NOT_CONFIRMED，不调用模型。
现有连续性接口保留：本机摘要、sync-context、上游缺失时的 UPSTREAM_CONTEXT_MISSING。
GET /chapters/{id}/impact：这一章为什么被标记，上游是哪一版大纲或哪一章正文。
POST /chapters/{id}/impact/accept：用户确认正文保持不动，只清影响标记。这不是重新生成。
云端调用继续走 ModelRouter 和发送清单。大纲生成是云端规划调用，和正文生成一样要确认后才发送；本机连续性摘要不走这道门。

C. Writer Pack 结构
沿用现在的 PackBlock：kind、id、text、reason、chapter_id。一次正文生成按这个顺序组装，并在清单里记下每一块的理由。

用户要求与禁止事项：来自总大纲和本章大纲里明确写出的约束。
总大纲的相关切片：前提、主线、当前卷在全书中的位置。不是整份大纲的无界粘贴。
当前卷大纲。
当前弧大纲。2A 没有弧表时，这一块为空。
当前章节大纲。这一块缺失时，不允许开始正文生成。
当前场景计划。2A 用章节大纲里的场景列表；2B 改为 scene_plan 行。
前序章节的有效连续性摘要。条件与现在相同：未过期、未被替代、source_revision_id 等于该章当前正文修订。
人物、关系、世界、时间线、伏笔。2A 只放用户维护的人物卡和世界卡，并在 reason 里标明这是定义而不是「第 N 章结束时的状态」。2C 才把状态行填进来。
篇幅策略。继续用现在的「非空白字数」，与 max_output_tokens 分开。
全书全文不进入包。前序连续性用确定性窗口：近几章用完整连续性摘要，更早的章节只用一行事件，并写明理由，例如「第 4 章早于当前窗口，只保留事件行」。这不是向量检索。

正文指令要写明：主要情节以当前章节大纲和场景计划为准，连续性摘要只提供已经发生的事实，不能另起一条主线。

D. Outline Revision 设计
四条修订链彼此引用，互不覆盖。

链	改什么	不改什么
总大纲修订
全书计划
已写正文
卷 / 章节大纲修订
该卷或该章的计划
已写正文
正文修订
该章正文
已确认大纲
连续性修订
从当前正文归纳的摘要和结束状态
正文和大纲
章节大纲修订必须记下它依据的总大纲修订号。正文修订必须记下它依据的章节大纲修订号。连续性摘要必须记下正文修订号和大纲修订号。

用户确认总大纲，只是把那一条大纲修订标成 confirmed。拆章会生成各章的大纲草稿，每章仍要单独确认后，AI 才能写该章正文。用户手改大纲是一条新的用户修订；AI 改某一段也是一条新修订，父修订指向改之前的那一版。旧修订保留。

E. Dependency / Impact 设计
默认依赖是阅读顺序，而不是冻结的 global_index：第 N 章依赖已确认的本章大纲，以及第 1 章到第 N-1 章里仍然有效的连续性摘要。

影响只做标记。

改第 10 章大纲并保存：第 10 章若已有正文，impact_status 加上 outline_changed。第 11 章到最后一章加上 upstream_changed。正文修订号不动。
改总大纲：用新旧结构化目录做差。只涉及后部卷的变化，从该卷第一章开始标记；前提、结局或已写章节范围内的事件变化，从第一处被碰到的章节往后标记。没有结构差异的章节不标记。
改第 10 章正文：只走现在的连续性规则。第 10 章旧摘要失效并写出新的本地摘要；第 11 章及以后标为上游已变。不改它们的正文。
用户对标记的处理只有两种明确动作：保持现有正文并接受影响，或重新生成这一章。重新生成仍要确认云端发送，并读取最新大纲和最新上游摘要。

F. Chapter Continuity 设计
连续性是第 1 章到第 N 章的链，不是两章特例。

每一章正文保存后，本机写出该修订的连续性记录：摘要、关键事件、结束状态、给下一章的衔接。云端记忆可以在用户授权后用发送清单另写一版更细的摘要，但不能作为第 N 章读到前文的前提。

第 N 章的写作包只接收仍然有效的上游记录。某一章有正文却没有有效连续性记录时，生成停在 UPSTREAM_CONTEXT_MISSING。第 N 章被用户明确重新生成并保存之后，才产生第 N 章的新正文修订和新的连续性记录，并让第 N+1 章进入影响标记。

G. UI 结构
左侧增加「大纲」，顺序是：项目、大纲、卷、章节、人物、世界。时间线、伏笔在 2C 之前保持不可用。

中间按选择切换。大纲页是总大纲编辑器，显示目标字数、当前字数和确认状态。章节页在正文编辑器之上显示本章大纲；大纲未确认时，正文仍可手写，「生成」不可用并说明原因。

右侧助手的主动作是：生成大纲、修改大纲中的这一部分、确认大纲、拆成卷和章、生成本章大纲、生成场景计划、按大纲写正文、重新生成本章、检查连续性、查看大纲影响。后两个在 2A 先做成本章影响说明。云端按钮继续先出示清单。影响标记用现在这种明示条：「大纲已变，正文尚未按新大纲检查」，并给出「保持正文」和「重新生成本章」。

H. Stage 2A / 2B / 2C
2A，主链。 总大纲的生成、手改、确认和修订；按已确认大纲拆出卷大纲与章节大纲；AI 写正文必须带上已确认的本章大纲和上游有效连续性；大纲或上游变化只标记影响，不改已写正文；写作包按 C 组装；大纲字数用字数规则测量，与正文篇幅、与 max_output_tokens 分开。表用 A 里的 2A 部分。

2B，计划再拆细。 弧、场景计划和场景字数；AI 按片段修改大纲；影响范围按目录差异计算，而不是一律从改动点打到结尾。补 arc、scene_plan 和 chapter.arc_id。

2C，状态进入写作包。 人物状态、关系、世界状态、时间线、伏笔进入对应的块，并带上来源章节和修订。人物卡与世界条目继续只表示定义。研究、文风、向量检索、抓取、版权和成本系统仍不在这三步里。

I. Stage 1 保留
保留项目单文件、迁移、ModelRouter、适配器分离、发送清单、假生成与真生成的分界、错误码、生成前脏稿必须先保存、修订冲突时停止后续修理、正文字数修理、本机连续性摘要、云端记忆默认关闭，以及人物卡和世界卡的用户编辑。

已经写好的正文修订和连续性摘要继续有效。新列用可空或默认 none，不要求重写旧书。

J. 需要重构的点
POST /chapters/{id}/generate 在调用模型前增加大纲确认检查，并把章节大纲放进写作包。没有大纲时不能再只靠章节目标和卡片写主要情节。

build_writer_pack 改为按 C 的块顺序组装，前序摘要改用 reading_order。global_index 只保留为创建序号。

chapter.goal 和 plan_json 不再充当大纲本身。它们可以显示章节大纲的摘要，但权威文本在 chapter_outline_revision。

stale_context 的 0、1、2 并入 impact_status，避免正文过期和大纲过期各说各话。现有「重新同步上下文 / 重新生成本章」对应「接受影响 / 重新生成」。

新建章节不要再写死第一卷。拆大纲时指定卷；没有拆过的旧项目仍用现有的第一卷。

大纲生成会比较长，应走现有 pipeline_run / job，并允许取消后不再发起下一次云端调用。这是复用现在的任务表，不是新的队列系统。