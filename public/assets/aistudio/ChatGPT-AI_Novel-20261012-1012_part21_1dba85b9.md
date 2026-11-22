## Response:
10/5/2026, 7:31:30 PM · gpt-5-6

你现在不用自己改代码。**下一步让 Cursor 先做一个“Writer Quality v0 设计稿”，仍然只读，不改代码。**

我们按这个顺序走：

1. **先冻结现有架构**：Stage 2A/2B、DB、State、Writer Pack 数据结构都不碰。
2. **让 Cursor 根据刚才的只读结果设计新的 Writer Prompt Contract。**
3. 我们审查这份设计，确认不会把 Writer 变成新的模板机器。
4. 再让 Cursor 实现。
5. 用**完全相同的小说输入**做 A/B：
   - A = 现在的 Writer
   - B = 新 Writer
6. 比较对白、人物感、情绪、场景真实感、AI腔、节奏、重复等。
7. 通过后，再做 10 章长篇测试。

### 现在就做第 2 步

把下面这段**原样复制给 Cursor**：

**chat_message: Writer Quality v0：设计 Prompt Contract，只读不改代码**

现在进入 Writer Quality v0 的设计阶段。

本轮仍然严格只读：

- 不修改任何文件
- 不修改数据库
- 不修改 migration
- 不修改 Stage 2A
- 不修改 Stage 2B
- 不修改 Writer Pack 数据结构
- 不修改 Provider / Router
- 不修改模型参数
- 不修改生产 Writer
- 不 commit
- 不 push

上一轮已经完成了当前 Writer 的只读审查。现在请基于实际代码和审查结果，设计一份“Writer Quality v0 Prompt Contract”。

目标不是让 AI 写得更华丽，而是让正文从“执行剧情任务的 AI”变成“把剧情转化成真实小说场景的 Writer”。

请只输出设计方案，不实现。

一、先明确 v0 的边界

Writer Quality v0 只允许改变：

1. Writer System Prompt
2. Scene Writing Instructions
3. Character Voice instructions / writer-facing character information
4. prose generation instructions
5. 必要的 length repair prompt/context
6. 必要的测试和 A/B 调试工具

禁止增加：

- Arc
- Scene 数据表
- Timeline
- 新的 State 架构
- 新的 Memory 架构
- Vector DB
- Web Research
- Crawler
- Copyright 系统
- 新 Provider
- 新 Router
- 新 Writer Pack 数据结构

二、设计 Writer System Prompt Contract

设计一份新的 System Prompt 结构。

必须明确区分：

A. Story facts / plot constraints
B. Character constraints
C. Scene writing
D. Prose style
E. Dialogue
F. POV
G. Emotional expression
H. Pacing
I. Continuity
J. Output format

核心原则：

“大纲规定发生什么，Writer 决定读者如何经历它。”

必须避免让 Writer 把 Chapter Outline 逐条翻译成剧情摘要。

必须明确：

- 不要把大纲中的每个目标直接写出来
- 不要为了推进剧情让人物机械行动
- 人物应该根据自己的信息、欲望、关系和性格做决定
- 场景必须有具体空间感
- 允许停顿、观察、犹豫、误解、闲聊和非关键动作
- 情绪优先通过动作、语言、反应和选择表现
- 不要频繁替读者解释人物情绪
- 不要求每个场景都制造高潮
- 不要求每个场景都用金句结束
- 不要求每段都推进主线
- 不要重复相同意象
- 不要堆砌比喻和形容词
- 不要用总结句代替场景

但不要简单建立一个固定禁用词黑名单。

三、设计 Scene Writing Instructions

当前 scene_sketch 只有：

{order}. {purpose}

不要增加 Scene 数据表。

请设计如何仅通过 Prompt 把现有 scene purpose 转化成更好的写作约束。

至少考虑：

- Scene purpose
- POV
- immediate want
- hidden tension
- emotional movement
- conflict
- information revealed naturally
- relationship movement
- sensory grounding
- ending change

但必须注意：

这些不是要求每个场景机械填写十个字段。

它们应该作为 Writer 的思考维度，而不是输出模板。

特别说明：
Writer 不应该把这些字段名称直接写进小说。

四、设计 Character Voice Contract

当前 Writer 只有：

- name
- role
- summary
- personality
- goals

数据库中已有 speech_markers，但目前只用于 outline generation。

请设计一个“不增加 Character 数据结构”的方案，使 Writer 能利用已有角色信息表现不同人物的：

- 说话长度
- 词汇习惯
- 句式
- 语气
- 是否直接表达
- 回避方式
- 紧张时的语言变化
- 熟人/陌生人之间的差异
- 行为习惯
- 关系差异

重点：

不要让角色 Voice 变成“人物标签说明书”。

不要让 Writer 每次都先介绍“这个角色说话很冷淡”。

应该让 Voice 直接影响对白和行为。

五、设计 POV Contract

当前 chapter.pov 存在，但 Writer 当前没有读取。

请设计 v0 如何让 Writer 正确使用现有 POV。

要求：

- 不改变数据库
- 不增加新的 POV 架构
- 如果当前 POV 字段存在，Writer 应该真正收到它
- 明确第一人称/第三人称等情况下的信息边界
- 禁止人物知道自己当前不可能知道的信息
- 禁止作者视角突然跳入其他人物内心

六、设计 Anti-AI Prose Contract

请针对我们实际发现的僵硬问题设计规则。

重点：

1. 减少总结式叙述
2. 减少直接解释情绪
3. 减少作者替人物总结意义
4. 减少机械因果句
5. 减少重复意象
6. 减少连续的“动作→结果→解释”
7. 避免每个场景都像剧情报告
8. 避免每段都承担任务
9. 避免人物成为剧情工具
10. 避免所有角色使用同一种语言

但不要创建简单的关键词禁用列表。

七、设计 Dialogue Contract

明确要求：

- 对话应该像人在交流，而不是作者交换信息
- 人物可以回避问题
- 人物可以误解
- 人物可以说废话
- 人物不需要把自己知道的一切告诉别人
- 潜台词可以存在
- 对话长度要有变化
- 不同人物必须有区别
- 动作可以打断对话
- 对话不应该每句话都服务剧情

同时避免“所有对话都故意含蓄”这种新模板。

八、设计 Emotional Movement Contract

要求 Writer 不要直接写：

“他很害怕。”
“他很震惊。”
“他意识到事情很严重。”

除非这种直接表达符合 POV 和人物声音。

优先通过：

- 身体反应
- 动作
- 停顿
- 语气
- 选择
- 回避
- 注意力变化
- 错误判断

表现情绪。

但不要禁止直接情绪描写。

九、设计 Pacing Contract

明确：

不是所有内容都必须高速推进。

允许：

- 普通生活细节
- 短暂停顿
- 观察
- 无效动作
- 自然过渡
- 简短闲聊

同时避免：

- 无意义水字数
- 大量重复环境描写
- 为了“自然”而故意拖慢所有场景

十、设计 Scene Ending Contract

不要要求每个 Scene：

- 制造悬念
- 金句
- 反转
- 强钩子
- 总结主题

场景应该根据实际内容自然结束。

十一、设计 Length Repair Contract

基于上一轮发现的问题：

当前 repair 只有上一稿正文，缺少原始 Writer Context。

请设计一个最小修改方案，让 length repair 在不改变 Writer Pack 数据结构的情况下保留必要的：

- chapter outline
- scene sketch
- character
- world
- state
- continuity
- original length policy

避免偏短时靠重复内容凑长度。

明确 repair 的目标应该是：

“增加有效叙事内容”

而不是：

“单纯让字数更接近目标”。

十二、最重要：不要把 Prompt 变成 Prompt 模板机器

请专门设计“防模板化”原则。

新 Prompt 不应该要求每个场景机械完成：

Purpose
Want
Conflict
Emotion
Information
Relationship
Sensory
Ending

这些只是 Writer 的内部考虑维度。

最终小说不能出现：

“先描写环境，然后人物产生冲突，然后表达情绪，最后留下钩子。”

十三、设计 A/B 测试方案

请设计一个最小 A/B 测试。

A：
当前生产 Writer。

B：
未来 Writer Quality v0 Prompt。

严格保持：

- 相同 Story Outline
- 相同 Volume Outline
- 相同 Chapter Outline
- 相同 Scene Sketch
- 相同 Character
- 相同 World
- 相同 State
- 相同 Continuity
- 相同模型
- 相同 temperature
- 相同 max_tokens
- 相同 reasoning_effort

只改变 Writer Prompt / Writing Instructions。

请设计评价维度：

1. 自然度
2. AI 腔
3. 对话自然度
4. 人物声音
5. 情绪真实性
6. 场景真实感
7. POV 稳定性
8. 信息自然度
9. 节奏
10. 重复程度
11. 剧情忠实度
12. 长度控制

十四、最终输出

请给出：

1. Writer Quality v0 Prompt Contract
2. Scene Writing Contract
3. Character Voice Contract
4. POV Contract
5. Dialogue Contract
6. Emotional Contract
7. Anti-AI Contract
8. Length Repair Contract
9. A/B Test Plan
10. 预计需要修改的具体文件
11. 哪些文件明确不应该修改

再次强调：

本轮只设计。
不要改代码。
不要 commit。
不要 push。

### Cursor 返回之后

**先不要让它实现。**

你把 Cursor 的设计结果完整发给我，我会帮你检查它有没有出现一个很危险的问题：

> **为了消除 AI 腔，结果又制造出一套新的“AI文学模板”。**

确认设计没问题以后，我们再让 Cursor 实现，最后拿**同一章做 A/B 实测**。

这一步比继续堆功能重要得多。

## Prompt:
10/5/2026, 7:33:51 PM

设计只基于现有调用链。我先核对篇幅修复怎样沿用已确认的发送清单，避免方案去改 Writer Pack 的结构。

Writer Quality v0 只改模型看见的写作说明，以及篇幅修复时重新附上的已有上下文。大纲仍规定发生什么；Writer 决定读者如何经历它。下面是合同，不是实现。

1. Writer Quality v0 Prompt Contract
v0 只改六处：系统提示、场景写法说明、给 Writer 看的已有人物信息、正文生成说明、篇幅修复的提示和上下文、以及对照测试。不新增数据表、状态、记忆、Provider、Router，也不改模型参数和 Writer Pack 的块种类与顺序。

新的系统提示按十段写进 agents/writer.py 的一条 system message。段与段是职责，不是小说里要出现的小标题。

A. 故事事实。 已确认的总大纲、卷大纲、章大纲和场景目的是事实边界。目的说明这一场要完成的变化，不是要写进正文的句子。不要把大纲目标逐条翻译成叙述，也不要让人物只为勾掉目标而行动。

B. 人物约束。 人物按自己已经知道的事、欲望、关系和性格做选择。可以犹豫、拒绝、误判。没有被提供的说话习惯不要编成标签。

C. 场景。 场景要有具体地点和当时的身体位置。允许停顿、观察、闲聊和非关键动作。不要求每场都有高潮。

D. 文体。 用具体的人和事写，少用抽象总结。不堆比喻和形容词，不重复同一个意象来充当文风。

E. 对话。 对话是两个人在相处，不是作者在交换剧情信息。详见对话合同。

F. 视角。 使用这一章已有的 chapter.pov。空值时保持一个稳定的有限第三人称，不在人物之间跳内心。

G. 情绪。 优先用动作、停顿、语气、注意力和选择。直接写出情绪名称只在符合视角和这个人的说法时使用。

H. 节奏。 允许普通生活和短暂停顿。不为了显得自然而拖慢每一场，也不为了推进而删掉过程。

I. 连续性。 承接上游摘要里的事实和结束状态，不把摘要句子改写成正文。不索取其他章全文，不另起主线。

J. 输出。 仍只输出 body_md 和可选的 writer_notes。不写项目、章节、修订、大纲标识，也不写本提示里的维度名称。

篇幅句子继续由现有 length_requirement 接在系统提示末尾，并保留现有的 length_policy 块。四项全空时仍然不发送篇幅。

2. Scene Writing Contract
scene_sketch 保持现在的 {order}. {purpose}，不增加字段，也不在每个场景下面补十行模板。

系统提示只解释怎么读已有的 purpose：它是这一场结束时叙事位置的变化，不是台词，也不是段落提纲。Writer 在内部可以考虑这些维度，但正文里不出现它们的名字：

这一场的 purpose 实际改变了什么
当前视角人物此刻想要的具体东西
没有说出口的张力
情绪从哪移到哪，而不必命名
谁和谁不一致
信息如何在动作和对话里露出
关系有没有轻微移动
读者站在什么空间里
结束时哪一件事已经和开场不同
不要求每一场都填满这些维度。一场可以只有空间、对话和一个很小的变化。禁止把场景写成「先环境，再冲突，再情绪，再钩子」。

3. Character Voice Contract
不新增人物字段。只把数据库里已经存在、而正文包目前没用上的 speech_markers 写进现有 character 块的正文。块的 kind、id、顺序都不变。仍然带上现有的名字、身份、摘要、性格、目标。

这些材料是写作约束，不是人物介绍。系统提示要求：

不要在正文里宣布「他说话很冷淡」或复述说话特点。
说话特点要变成句长、用词、是否答非所问、紧张时说得更短还是更多。
对熟人和陌生人的差别来自关系和已知信息，不另写说明。
行为习惯来自性格和目标，表现为选择和动作，不表现为作者旁白。
speech_markers 为空时，不发明口癖。这时只靠欲望、关系和性格区分人物，并避免所有人共用同一种解释性书面语。
外貌、恐惧、档案继续留在大纲规划里，v0 不把整份档案倒进正文包，以免把人物写成说明书。
4. POV Contract
不改数据库。draft 读取现有 chapter.pov，写进系统提示，不新增 pack 块。

已有值	Writer 收到的边界
first
只写叙述者能感知、说出和误判的内容。其他人的内心只能表现为外部迹象。
third_limited
停留在这一章主要跟随的人。不跳进另一个人的想法。
third_omniscient
可以转移注意力，但每次转移要落在可观察的场景里，不连续替所有人做心理总结。
second
保持第二人称，不突然改成全知作者。
multi
可以分段落换跟随对象。每一段仍只进入当前跟随者的所知范围。
空
使用稳定的有限第三人称，不在人物内心之间跳跃。不另造默认视角体系。
任何人都不知道自己此刻不可能知道的信息。大纲里的未来事实只能在人物已经看见、听见或被明确告知之后进入正文。

5. Dialogue Contract
对话合同放在系统提示里，不单独生成对话清单。

人物可以回避、误解、说短句、说闲话，也可以不把知道的事情说完。潜台词可以存在。不同的人句长和直接程度不同。动作和停顿可以插进对话。

同时避免新的单一模板：不是每一句都要含蓄，也不是每一句都要推进主线。该说清楚的人，按他的说话习惯说清楚。

6. Emotional Contract
不要把「他很害怕」「他很震惊」「他意识到事情很严重」当作默认写法。优先用身体、动作、停顿、语气、选择、回避、注意力和错误判断。

不禁止直接写情绪。当视角允许、而且这个人本来就会这样想或这样说时，可以直接写。禁止的是用作者总结代替刚刚发生的场景。

7. Anti-AI Contract
针对现有链路里的僵硬来源，写行为规则，不写禁用词表。

连续性摘要只提供事实和结束状态，不把摘要句抄进正文。
少用作者替人物解释因果和意义。
少用「动作，然后结果，然后解释」的固定三段。
场景不是剧情报告。有些段落可以只是停留。
人物不是来完成大纲条目的工具。
没有记录说话习惯时，也不能让所有角色共用同一种解说腔。
同一个意象不靠重复来维持风格。
系统提示里的「不要」只约束写法，不列出小说里禁止出现的词。

8. Length Repair Contract
现有 authorize_length_repair 会为修复单独准备并确认一次发送，只要求它延续同一章、同一个已确认的 writer 模型和 provider。因此可以在不改 Pack 结构、不再请用户确认的前提下，把第一次生成已经用过的那些块再送给修复。

修复的 user 消息变为：第一次的 writer 上下文，加上上一稿正文。上下文仍用现有块和现有 _render。上一稿仍放在现有的 length_repair_draft 块里。系统提示改为：在保留情节、人物、事实和连续性的同时，用新的有效场景内容进入允许范围；不要重复句子、不要复制段落、不要用环境描写循环凑字数；偏长时也不要只砍结尾。

代码上的接受条件暂时仍是非空白字数是否更接近最少和最多。v0 不增加评判模型。目标变化体现在提示和上下文，不体现在新的通过算法。轮数仍是最多 2 轮。目标字数单独存在时，仍然不启动修复。

9. A/B Test Plan
同一次输入跑两次。A 使用现在的生产提示：当前系统三句、当前人物块、当前只含上一稿的修复。B 使用 v0 提示。

两边必须相同：已确认的总大纲、卷大纲、章大纲、场景目的、人物、世界、状态、连续性摘要、grok-4.7、temperature 0.7、max_tokens 4096、reasoning_effort low。只换写作说明和人物块里是否包含已有的 speech_markers，以及修复是否带回原上下文。

用同一章、同一基线修订。不调用 FakeProvider 做质量判断。每边各一次真实生成。若触发修复，记录轮数，但比较的是最终保存稿。

人工按 1 到 5 分比较，不看提示来源：

自然度
AI 腔
对话是否像交流
人物声音是否可区分
情绪是否来自行为和选择
场景是否有具体空间
视角是否稳定
信息是否自然露出
节奏是否有快有慢
意象和句式是否重复
是否仍遵守已确认大纲，没有另起主线
非空白字数是否仍符合已有最少和最多
B 只有在 11 和 12 不差于 A，且 2、3、4、6、10 明显更好时，才替换生产提示。

10. 预计需要修改的具体文件
agents/writer.py：系统提示、修复提示、把 chapter.pov 写入系统提示、修复 user 消息附上原有块。
memory/pack.py 的 _character_text：在现有 character 块正文中加入已有的 speech_markers。不新增 kind，不改变顺序。
pipeline/chapter_flow.py 的 _repair_length：把 draft 已经构建的块传给 repair。不改轮数、继承规则和保存逻辑。
新的提示合同测试，以及一个只换提示、不换输入和模型参数的 A/B 对照入口。默认仍走 A，直到对照被接受。
11. 明确不应该修改的文件
storage/migrations/**
canon/state_store.py、pipeline/state_extract.py、host/state_routes.py
canon/impact.py、canon/outline_flow.py、canon/outline_doc.py
prose/revisions.py、prose/length.py 的继承和判定规则
providers/**，包括 Router、Manifest、Grok adapter 和模型参数
pipeline/schemas/prose_draft.json
pipeline/outline_gen.py
Writer Pack 的块种类、顺序和 Stage 2B 选择逻辑
本轮没有改文件，没有 commit，也没有 push。

## Response:
10/5/2026, 7:33:57 PM · gpt-5-6

这份设计**可以进入实现阶段**。而且整体方向是对的：没有偷偷扩大架构，没有增加 Scene/Arc/Timeline，也没有把“自然写作”硬编码成十步模板。

不过在真正让 Cursor 改代码之前，我建议锁定 **4 个小修正**。

### 先锁定这 4 点

**1. 不要真的把“十段”做成十个固定标题。**

你们的设计已经说了“段与段是职责，不是小说里出现的小标题”，很好。实现时最好让它成为一段自然的 system instruction，而不是：

```text
A. 故事事实
B. 人物约束
C. 场景
...
```

否则 Prompt 自己就开始模板化。

**2. POV 必须以代码实际枚举为准。**

现在只是设计里列出了 `first / third_limited / ...`。实现前让 Cursor 确认 `chapter.pov` 实际允许哪些值，不能自行创造枚举。

**3. Length Repair 的 manifest 必须重新核对。**

这是最重要的工程细节。

因为 Repair 现在要重新发送原来的 Writer Context，**请求内容已经和原来的 repair 请求不同**。如果 Send Manifest 是按 provider/model/item hash 绑定的，就必须确保 manifest 覆盖新的完整 repair 请求内容。

不能为了方便绕过 manifest。

**4. A/B 测试暂时不要做成永久生产功能。**

先做最小实验入口即可。A/B 成功以后，再决定哪些代码正式留下。

---

## 现在可以让 Cursor 实现

这次可以直接让 Cursor 改代码，但我建议明确要求：

> **先检查实际代码，再实现；如果发现合同和实际代码冲突，停下来报告，不自行扩大范围。**

把下面这段给 Cursor：

**chat_message: Writer Quality v0：按已批准 Contract 实现**

现在正式实现刚刚批准的 Writer Quality v0 Prompt Contract。

范围严格冻结：

允许修改：
- agents/writer.py
- memory/pack.py 中 Writer-facing character 文本的最小修改
- pipeline/chapter_flow.py 中 length repair 上下文传递的最小修改
- Writer Quality v0 对应测试
- 必要的 A/B 对照测试/调试入口

禁止修改：
- storage/migrations/**
- canon/state_store.py
- pipeline/state_extract.py
- host/state_routes.py
- canon/impact.py
- canon/outline_flow.py
- canon/outline_doc.py
- prose/revisions.py
- prose/length.py 的继承和判定规则
- providers/**
- ModelRouter
- Manifest 机制
- Grok adapter
- 模型参数
- pipeline/schemas/prose_draft.json
- outline generation
- Writer Pack 的 block kind
- Writer Pack 的 block 顺序
- Stage 2A
- Stage 2B
- DB schema

不要新增数据库表、字段、migration、Scene entity、Arc、Timeline、Vector DB、Research、Crawler、第二个 Router 或第二套 Writer。

---
第一步：实现前只读核对
---

先读取实际代码确认：

1. chapter.pov 的真实字段值/枚举。
2. agents/writer.py 当前 draft / repair / _render。
3. memory/pack.py 的 _character_text。
4. pipeline/chapter_flow.py 的 _repair_length。
5. 当前 length repair 的 Send Manifest / authorize_length_repair 流程。
6. 当前 Writer manifest 对 system/user item hashes 的计算方式。

特别检查：

Length Repair 现在如果重新附加 Writer Context，是否会改变 Send Manifest 的 item hash。

如果会：

必须按照现有 Manifest 机制，为新的完整 repair request 正确准备/确认发送清单。

绝对不要通过绕过 manifest、扩大 grant 或修改 Router 来解决。

如果发现当前架构无法在既有 Manifest 机制内安全实现，请先停下来报告，不自行改架构。

---
第二步：实现 Writer Quality v0
---

一、Writer System Prompt

重写 writer system instruction。

核心原则：

“大纲规定发生什么，Writer 决定读者如何经历它。”

必须覆盖以下职责：

- Story facts
- Character constraints
- Scene writing
- Prose style
- Dialogue
- POV
- Emotion
- Pacing
- Continuity
- Output format

但不要把这些变成小说里的小标题，也不要让 system prompt 本身成为十步写作模板。

明确要求：

1. 已确认大纲是事实边界，不是逐条翻译成正文的提纲。
2. 人物按照自己知道的事情、欲望、关系和性格行动。
3. 人物可以犹豫、拒绝、误判。
4. 场景应该感觉像正在发生的真实空间。
5. 允许停顿、观察、闲聊、普通动作。
6. 不要求每个场景高潮。
7. 不要求每段推进主线。
8. 不要求每个场景制造钩子。
9. 情绪优先通过动作、停顿、语气、注意力和选择表现。
10. 不用作者总结代替场景。
11. 对话是人物之间的交流，而不是作者交换剧情信息。
12. 人物可以回避、误解、说闲话、不说完自己知道的事情。
13. 不同人物应该有不同语言节奏和直接程度。
14. 不堆砌比喻、形容词和重复意象。
15. 不重复连续性摘要。
16. 不让人物机械完成 Chapter Outline 的任务。
17. 不让人物知道自己不可能知道的信息。
18. 场景自然结束，不强制金句、反转或钩子。

不要建立简单的禁用词表。

不要禁止所有直接情绪描写。

不要要求所有对话都含蓄。

不要要求每个场景机械完成 purpose/want/conflict/emotion/information/relationship/sensory/ending。

---
三、POV
---

让 draft 使用实际存在的 chapter.pov。

先以代码真实枚举为准，不自行创造字段或枚举。

将 POV 作为 system instruction 的写作边界，而不是新的 Writer Pack block。

至少保证：

- first：只能进入第一人称叙述者可获得的信息。
- third limited：稳定跟随指定人物。
- third omniscient：允许合理转移，但不要无意义跳跃。
- second：保持第二人称。
- multi：按现有代码语义执行。
- 空值：保持稳定的有限第三人称，不随意跳入多人内心。

如果实际枚举名称和上述描述不同，以代码实际定义为准。

---
四、Character Voice
---

修改 memory/pack.py 的 _character_text。

不改变：

- block kind
- block id
- block 顺序
- Writer Pack 数据结构

在已有 character block 中加入数据库已有的 speech_markers。

不要把整个角色档案塞给 Writer。

Writer 应收到现有：

- name
- role
- summary
- personality
- goals

以及已有 speech_markers。

system instruction 明确：

speech_markers 是行为/语言约束，不是人物介绍。

不要在正文里解释“这个人物说话很冷淡”。

让它影响：

- 句长
- 词汇
- 直接程度
- 回避方式
- 紧张时语言变化
- 熟人/陌生人差异

speech_markers 为空时：

- 不编造口癖
- 不创造不存在的标签
- 仍利用人物欲望、关系、性格区分人物
- 避免所有角色使用同一种解释性书面语

---
五、Scene Writing
---

不要修改 scene_sketch 数据结构。

继续使用：

{order}. {purpose}

在 system instruction 中解释：

purpose 表示这一场结束时叙事状态发生的变化，不是必须直接写进正文的句子。

Writer 可以内部考虑：

- 当前 POV 人物想要什么
- 没说出口的张力
- 情绪变化
- 人物之间的不一致
- 信息如何自然出现
- 关系变化
- 空间/感官
- 开始与结束之间发生了什么变化

但这些只是写作考虑维度。

不要要求每场都填满这些维度。

不要让正文出现这些字段名。

---
六、Length Repair
---

这是本次实现中最重要的工程修改之一。

保持：

- length inheritance
- minimum/maximum 判定
- target 不单独触发 repair
- 最多 2 轮
- 现有保存逻辑
- 现有 length 判定算法

不要修改 prose/length.py。

修改 repair，使它能够拿到第一次 Writer 使用的原有上下文。

Repair user message 应包含：

1. 原 Writer Context
2. length_repair_draft / 上一稿正文

不要改变 Writer Pack 的结构。

偏短时：

要求增加有效的新叙事内容，而不是重复已有内容、循环环境描写、换句话说同一事实或无意义垫字。

偏长时：

不要简单砍掉结尾；保留关键剧情、人物、事实和连续性。

非常重要：

Repair 使用的 system/user 内容改变以后，必须正确遵守现有 Send Manifest 机制。

如果 manifest hash 因上下文变化而改变：

- 使用现有机制生成/确认正确的 manifest
- 不绕过发送确认
- 不扩大权限
- 不修改 Router

---
七、不要修改模型参数
---

保持：

provider = grok
model = grok-4.7
temperature = 0.7
max_tokens = 4096
reasoning_effort = low
timeout = 180
top_p 不新增

---
八、测试
---

新增测试覆盖：

1. Writer system prompt 包含 Writer Quality v0 的核心写作规则。
2. chapter.pov 正确进入 Writer system prompt。
3. speech_markers 正确进入现有 character block。
4. speech_markers 为空时不伪造内容。
5. scene_sketch block kind/order 不变。
6. Writer Pack block kind/order 不变。
7. Stage2B state 选择逻辑没有改变。
8. Length Repair 能收到原 Writer Context。
9. Length Repair 仍然最多 2 轮。
10. target 单独存在仍然不触发 repair。
11. minimum/maximum 判定逻辑没有改变。
12. Send Manifest 对新的 repair context 仍然正确工作。
13. 没有绕过 SEND_NOT_CONFIRMED。
14. 没有 FakeProvider。
15. 输出 schema 不变。

运行：

pytest -q
npx tsc -b
node --experimental-strip-types --test *.test.ts

---
九、A/B
---

本轮先不要把 B 自动替换成生产 Writer。

先建立最小 A/B 测试能力。

A：
当前生产 Writer。

B：
Writer Quality v0。

两者保持完全相同：

- Story Outline
- Volume Outline
- Chapter Outline
- Scene Sketch
- Character
- World
- State
- Continuity
- model
- temperature
- max_tokens
- reasoning_effort

只改变：

- Writer Prompt
- Writer-facing speech_markers
- POV instruction
- Length Repair context/prompt

如果实现 A/B 需要额外代码，保持最小范围，不建立新的架构。

---
十、验收标准
---

完成后不要直接说“质量更好了”。

先报告：

A. 修改了哪些文件
B. 每个文件为什么修改
C. 没修改哪些架构文件
D. 所有测试结果
E. Manifest 是否仍然正确
F. Writer Pack kind/order 是否完全保持
G. Stage 2A/2B 是否完全未修改
H. 当前 git diff
I. 当前 git status

暂时不要 commit。
暂时不要 push。

最后只给出实现结果和测试结果，等待下一步 A/B 实测指令。

## Prompt:
10/5/2026, 7:40:42 PM

先按现有代码核对 POV 枚举、Writer 组装和 length repair 的发送清单，确认修复上下文能走现行 manifest，再实现 v0。

发送清单的 hash 是每个块正文的 SHA-256。修复若附上原上下文，hash 会变；现有 authorize_length_repair 会按这些新块重新准备并确认清单，不必改 Router。生产路径仍默认走原来的 Writer，v0 只作为对照。

Writer Quality v0 已按对照方式实现。生产生成仍走原来的 Writer A。quality="b" 才使用新提示、说话习惯、视角边界，以及带回原上下文的篇幅修复。没有 commit，也没有 push。

A. 修改了哪些文件
agents/writer.py
memory/pack.py
pipeline/chapter_flow.py
tests/test_writer_quality_v0.py（新增）
B. 每个文件为什么修改
agents/writer.py 保留原来的系统提示和修复提示作为 A。B 使用新的系统提示，并把 chapter.pov 的真实枚举写成视角边界，不新增 Pack 块。枚举来自现有约束：first、third_limited、third_omniscient、second、multi，空值使用稳定的有限第三人称。assemble_variant 只组装 A/B 消息，不调用模型。B 的修复提示要求增加有效叙事，而不是重复凑字数；user 消息包含原 Writer 上下文和上一稿。

memory/pack.py 只改 _character_text。include_voice=True 时，在现有 character 块末尾加上已有的 speech_markers，写成「说话习惯：…」。空列表不写任何占位。默认 include_voice=False，生产包文本不变。kind、id、顺序都没有改。

pipeline/chapter_flow.py 给 generate 和 _repair_length 增加默认 "a" 的 quality。只有 B 会把同一次 build_writer_pack 的块传给 repair。轮数、继承、最少/最多判定和保存逻辑未改。

修复上下文会改变发送清单的 item hash，因为 hash 是每个块正文的 SHA-256。实现没有改 Router。B 的 repair 仍调用现有 authorize_length_repair：按这次完整的块列表 prepare 新清单，再作为同一章已确认 writer 发送的延续来 confirm。第一次正文生成没有确认时，仍然在调用模型前返回 SEND_NOT_CONFIRMED。

C. 没修改哪些架构文件
没有改 migration、Stage 2A、Stage 2B、canon/state_store.py、pipeline/state_extract.py、host/state_routes.py、canon/impact.py、canon/outline_flow.py、canon/outline_doc.py、prose/revisions.py、prose/length.py、providers/**、Grok adapter、模型参数、pipeline/schemas/prose_draft.json、大纲生成，以及 Writer Pack 的 kind 和顺序。

模型调用仍是 temperature 0.7、max_tokens 4096、reasoning_effort low、timeout 180 秒，没有 top_p。测试库种子模型名仍是 grok-4；本机设置里的 grok-4.7 没有被代码写死或改掉。

D. 所有测试结果
pytest -q：149 通过，0 失败。其中 Writer Quality v0 新增 8 个。
npx tsc -b：通过。
node --experimental-strip-types --test *.test.ts：17 通过，0 失败。
覆盖了 v0 规则、六种 POV、说话习惯的出现与留空、Pack kind/顺序不变、Stage 2B 块未被改写、修复能看到原上下文、最多 2 轮、单独目标不修复、最少/最多判定未改、修复清单 hash 与确认、未确认不调用模型、不使用 FakeProvider、输出 schema 仍是 ProseDraft。

E. Manifest 是否仍然正确
是。B 的修复清单以 instruction 开头，中间保留 chapter_outline、scene_sketch、character 等原块，最后是 length_repair_draft。每项 sha256 等于该块正文的 SHA-256，决策为 confirmed。这是现有延续确认，不是绕过清单。

F. Writer Pack kind/order 是否完全保持
是。A 与 B 的 kind 序列和 block id 相同。除 B 的人物块多出已有说话习惯外，其余块正文相同。scene_sketch 仍是 {order}. {purpose}，位置仍在章大纲之后。

G. Stage 2A/2B 是否完全未修改
是。没有改这两层的文件，也没有改状态选择逻辑。

H. 当前 git diff

agents/writer.py         | 122 ++++++++++++++++++++++++++++++++++++++++++-----
memory/pack.py           |  12 +++--
pipeline/chapter_flow.py |  11 ++++-
3 files changed, 128 insertions(+), 17 deletions(-)
另有未跟踪的 tests/test_writer_quality_v0.py。

I. 当前 git status

 M agents/writer.py
 M memory/pack.py
 M pipeline/chapter_flow.py
?? ai_novel_studio.egg-info/
?? tests/test_writer_quality_v0.py
ai_novel_studio.egg-info/ 不是这次改动。没有 commit，没有 push。生产 Writer 仍是 A，等待下一步 A/B 实测。

## Response:
10/5/2026, 7:40:47 PM · gpt-5-6

这份实现结果**可以进入 A/B 实测，但我建议现在先不要 commit，也不要继续改架构**。

我按你给出的实现报告核对，结论如下：

### 1. POV：通过

B 没有自己发明新的 POV 枚举，而是使用现有：

- `first`
- `third_limited`
- `third_omniscient`
- `second`
- `multi`
- 空值 → 稳定的有限第三人称

而且 POV 只是进入 **Writer 的叙事约束**，没有新增 Writer Pack block。

这一点符合 v0 的目标：**改变 Writer 如何写，而不是改变数据架构。**

### 2. Writer Pack：通过

`memory/pack.py` 只扩展 `_character_text`：

> 「说话习惯：…」

并且：

- `include_voice=False` 默认保持生产 A 不变
- B 才启用
- 空 `speech_markers` 不产生垃圾占位
- `kind` 不变
- `id` 不变
- block 顺序不变
- Stage 2B state block 没有被重新设计

这非常重要，因为我们现在测试的是 **Writer Quality Layer**，不是重新设计 Writer Pack。

### 3. Length Repair + Manifest：这是最关键的一点，目前看是正确的

你特别说明：

> hash 是每个块正文的 SHA-256

因此 B 修复时把原 Writer 上下文带回来，必然会导致 manifest item hash 变化。

正确做法不是：

> “既然第一次 Writer 已经确认过，就直接继续调用。”

而是：

> **根据新的完整 blocks → 重新 authorize_length_repair → prepare/confirm 新 manifest → 再调用模型。**

你现在的实现正是这个逻辑，而且**没有修改 Router**。

这意味着：

**上下文发生变化 → hash 发生变化 → 新 manifest → 新确认 → 正常调用**

这是我们之前特别担心的安全边界，目前通过。

### 4. 最大好消息：没有污染 Stage 2B

这次没有碰：

- `state_store`
- `state_extract`
- `impact`
- migrations
- outline flow
- prose revision
- provider
- router
- Stage 2A / 2B

这非常符合我们之前确定的原则：

> **Stage 2B 已经完成并冻结。现在不要继续往状态架构里塞功能。**

### 5. 生产路径仍然是 A：正确

这一点也应该保留。

现在实际上形成了：

**A = 当前生产 Writer**

**B = Writer Quality v0 实验 Writer**

而不是：

**A → 改掉生产 → 再发现质量下降 → 再回滚**

这让我们可以真正做 controlled A/B test。

---

## 但是我注意到一个需要特别检查的地方

`agents/writer.py` 这次增加了 **122 行修改**。

这本身不一定有问题，但对于一个本来只应该改变 Prompt/Voice/POV/Repair Context 的 v0 来说，已经属于比较明显的改动量。

所以我现在**不建议直接相信“149 tests passed”就判定完成**。

下一步应该做真正的：

### A/B 实测

而且必须遵守我们之前定下来的条件：

| 项目 | A | B |
|---|---|---|
| Story Outline | 相同 | 相同 |
| Volume Outline | 相同 | 相同 |
| Chapter Outline | 相同 | 相同 |
| Scene Sketch | 相同 | 相同 |
| Character | 相同 | 相同 |
| World | 相同 | 相同 |
| Stage 2B State | 相同 | 相同 |
| Continuity | 相同 | 相同 |
| Model | Grok 4.7 | Grok 4.7 |
| temperature | 0.7 | 0.7 |
| max_tokens | 4096 | 4096 |
| reasoning | low | low |
| 唯一变量 | Writer A | Writer B |

**最好使用同一个临时项目、同一个章节、同一套已经确认的数据。**

然后各生成一次。

注意：这里我们要的是**两个真实 Grok 调用**，不能 FakeProvider。

---

## 我建议这次不要先测试 10 章

先做一个非常小的质量实验。

**A 一次 + B 一次。**

然后直接把两个结果拿出来比较：

1. AI 感
2. 人物自然程度
3. 对话
4. 人物说话区别
5. 情绪表达
6. 场景空间感
7. POV 是否稳定
8. 信息表达是否自然
9. 节奏
10. 重复意象
11. 大纲忠实度
12. 是否出现“总结剧情”的句子

尤其看这几个问题：

> “人物是在生活，还是在执行大纲？”

> “人物说话是不是为了传递剧情信息？”

> “情绪是不是直接告诉读者，而不是让读者从行为中感受到？”

> “每一段是不是都像 AI 在完成一个任务？”

> “场景有没有真正停下来，让人物经历事情？”

---

### 还有一个非常重要的判断标准

**B 不需要让每一句都比 A 漂亮。**

我们真正要找的是：

> **B 是否明显减少“AI 在写小说”的感觉，同时没有牺牲剧情准确性、连续性和长度控制。**

如果 B 只是：

- 句子更华丽
- 修辞更多
- 描写更多

但仍然是那种“AI小说味”，那就不能算成功。

反过来，如果 B：

- 更自然
- 对话更像人在说
- 人物有自己的说话方式
- 情绪不再直接总结
- 场景更有生活感
- 重复意象明显减少

哪怕文字没有明显“更华丽”，这反而是成功。

---

## 所以现在的结论

**代码层面：PASS，可以进入 A/B。**

**产品层面：尚未 PASS，因为 Writer Quality v0 的目标是改善最终小说，而不是通过单元测试。**

现在不要：

- ❌ commit
- ❌ push
- ❌ 改 Stage 2B
- ❌ 加新数据库
- ❌ 加新的 Memory
- ❌ 加新的 Writer Pack 类型
- ❌ 加 Web Research
- ❌ 加 Vector DB
- ❌ 再做一轮架构设计

现在只做一件事：

> **用完全相同的小说输入，让 Grok 4.7 分别跑 A 和 B，然后比较实际小说文本。**

如果你把 Cursor 接下来做出来的 **A/B 实测结果**贴给我，我可以直接帮你逐段对比，判断 **B 到底是真的改善了“僵硬感”，还是只是换了一套更复杂的 AI 文风。**

## Prompt:
10/5/2026, 7:41:58 PM

我要怎么做

## Response:
10/5/2026, 7:42:01 PM · gpt-5-6

现在你**不要改代码**。下一步就是做一次严格的 **A/B 实测**：让同一个章节分别用 Writer A 和 Writer B 生成，然后比较成品。

### 第一步：让 Cursor 做 A/B 实验

把下面这段完整复制给 Cursor Agent：

**document: Writer Quality v0 A/B 实测指令**

现在进入 Writer Quality v0 的 A/B 实测阶段。

不要修改任何代码，不要修改数据库，不要修改 Stage 2A/2B，不要 commit，不要 push。

目标：使用完全相同的小说输入，分别调用真实 Grok 4.7，让 Writer A 和 Writer B 各生成一次同一章节，用于比较最终小说质量。

实验要求：

1. 创建一个临时测试项目，不要使用现有正式小说项目。
2. 使用同一套：
   - Story Outline
   - Volume Outline
   - Chapter Outline
   - Scene Sketch
   - Character
   - World
   - Stage 2B confirmed fresh state
   - Chapter Summary / Continuity
   - user requirements
   - prohibitions
3. A 和 B 必须使用完全相同的：
   - provider
   - model
   - temperature
   - max_tokens
   - reasoning_effort
4. provider 必须是真实 Grok，不允许 FakeProvider。
5. A 使用 quality="a"。
6. B 使用 quality="b"。
7. 两次生成必须尽可能保持输入完全一致。
8. 不要因为 A 或 B 失败而自动修改代码。
9. 不要进行长度 repair，除非第一次生成自然地触发了现有 repair 条件；如果触发，两边都必须遵循各自现有的 repair 逻辑。
10. 记录两次真实模型调用的：
    - project_id
    - chapter_id
    - provider
    - model
    - quality
    - temperature
    - max_tokens
    - reasoning_effort
    - Writer Pack block kind/id 顺序
    - 最终 prose revision id
    - 最终正文长度
    - 是否发生 length repair
    - manifest 是否 confirmed
11. 如果 B 的 manifest hash 与 A 不同，这是正常的，不要修改 Router。
12. 确认没有使用 FakeProvider。
13. 确认 A/B 没有改变 Stage 2A/2B 数据结构或状态。

实验完成后，不要只给我“PASS”。

请把 A 和 B 的完整生成正文都保存到临时文件中，并在最终报告中分别输出。

然后做一个客观对照表：

| 指标 | A | B |
|---|---:|---:|
| 自然度 | 1-5 | 1-5 |
| AI感 | 1-5 | 1-5 |
| 对话自然度 | 1-5 | 1-5 |
| 人物声音 | 1-5 | 1-5 |
| 情绪表现 | 1-5 | 1-5 |
| 场景空间感 | 1-5 | 1-5 |
| POV稳定性 | 1-5 | 1-5 |
| 信息自然度 | 1-5 | 1-5 |
| 节奏 | 1-5 | 1-5 |
| 重复意象 | 1-5 | 1-5 |
| 大纲忠实度 | 1-5 | 1-5 |

注意：
“AI感”这个指标分数越高表示 AI 感越强；“重复意象”分数越高表示重复越严重。

除此之外，请自动指出：

A：
- 最明显的 3 个 AI 写作问题
- 最自然的 3 个地方

B：
- 最明显的 3 个 AI 写作问题
- 最自然的 3 个地方

最后给出：
1. B 是否比 A 有明显改善；
2. B 是否出现新的退化；
3. 是否建议让 B 进入生产 Writer；
4. 如果不建议，指出具体问题，但不要直接修改代码。

重要：
这次是质量实验，不是架构开发。
实验结束后停止。

### 第二步：Cursor 跑完后

它应该给你类似：

> A 正文：……
>
> B 正文：……
>
> A/B 参数一致
>
> Grok 调用 2 次
>
> A 长度：……
>
> B 长度：……

**把 Cursor 的完整结果直接发给我。**

---

### 第三步：我来做真正的人工质量评估

这一轮不要太相信 Cursor 自己打的分。

我会直接比较 A/B 的正文，重点看你之前说的核心问题：

**现在的小说为什么“太僵硬”。**

尤其检查：

- 人物是不是在“执行大纲”
- 对话是不是为了传递信息
- 情绪是不是被直接说出来
- 有没有大量“他意识到……”“这意味着……”“他决定……”
- 有没有每段都在总结剧情
- 有没有重复“黑暗、光、心跳、目光、空气”等 AI 高频意象
- 人物有没有自己的语言习惯
- 场景有没有真正发生，而不是快速从事件 A 跳到事件 B
- 转场是不是像提纲
- POV 有没有偷偷跳出去
- AI 有没有替读者解释本来应该自己感受到的东西

---

### 第四步：如果 B 明显更好

如果 A/B 实测证明 B 确实改善了你现在的“僵硬感”，再做：

**B → production Writer**

然后再进行第二轮：

**10章连续小说测试。**

这时候才测试：

> 第一章的人物 → 第五章 → 第十章

人物声音、关系、时间、伏笔、世界设定有没有逐渐崩掉。

---

### 如果 B 没有明显改善

也不要继续堆功能。

我们就拿 A/B 的具体文本找出**真正的问题来源**，然后只修改 Writer Quality v0 的 Prompt/写作规则，再进行第二轮 A/B。

也就是说，现在进入的是一个很清晰的循环：

**A/B → 看实际小说 → 找问题 → 最小修改 → A/B**

而不是：

**发现小说僵硬 → 再造一个架构 → 加数据库 → 加 Memory → 加 Research……**

这正是现在最应该避免的。

**所以你现在唯一要做的，就是把上面的指令给 Cursor 跑。**

## Prompt:
10/5/2026, 7:51:24 PM

这次只做质量对照，不改代码。我先确认临时项目怎么接上真实 Grok，以及现有接口怎样写入同一套大纲和已确认状态。

密钥可用，而且不会动正式小说库。我在临时目录里建同一章的输入，再用真实 Grok 各跑一次 A 和 B。

临时项目 01a10be1-7d6d-7145-a95c-402e1832dc75 的第二章「问船」已用真实 Grok 各生成一次。A 与 B 的正文分别在 /tmp/writer-ab/a.md 和 /tmp/writer-ab/b.md。没有改代码，没有 commit，没有 push，也没有动正式小说库。

两次都是 grok / grok-4.7，https://api.x.ai/v1/chat/completions，temperature 0.7，max_tokens 4096，reasoning_effort low，没有 top_p。各调用 1 次，repair_rounds 都是 0。清单均已 confirmed。A 的 manifest 是 01a10be1-7eba-7206-9dcf-2d3c8dd8efa2，B 的是 01a10be1-baa5-7146-9b87-ae9554d5eef4。系统提示哈希不同，这是预期结果。未确认之前没有发出模型请求。最后适配器不是 FakeProvider。

章节是 01a10be1-7e43-7cb3-bf3d-48185a6fad36，视角 third_limited。Pack 的 kind 和 id 顺序两边一致：prohibitions、user_requirements、story_outline、volume_outline、chapter_outline、scene_sketch、character_state、world_state、chapter_summary、林夏、周衡、world_entry。实际发送的 user 消息与生成前的计划一致，B 没有吃进 A 刚写完的正文。A 的修订是 01a10be1-ba8d-7865-bc29-88139dafa906，542 字。B 的修订是 01a10be1-f983-7355-8c1b-0ea7500cfd2d，449 字。

A 的正文
雨还在下，比刚才更细，细得几乎听不见，只在闸灯下显出一层薄雾。栈桥湿得发亮，木头缝里渗着水。林夏没有往值班室走，也没有把灯再拧一下。她站在灯圈边缘，手还搭在铁闸的栏杆上，栏杆冰得发黏。

周衡从栈桥那头挪近了半步，鞋底在湿木上轻轻一滑，又稳住。他没有提高声音。灯照着他半边脸，雨水从帽檐上滴下来，他伸手抹了一下，像是怕水珠落到问句上。

「船呢。」他停了停，把刚才那句又说了一遍，尾音放得很轻，「要是还在闸外，你跟我说一声就行。」

林夏的手指在栏杆上收紧，又松开。她低头去看自己的袖口，雨水已经把布浸透了，她却慢吞吞地拧，拧出几滴水，落在闸板上。江面仍是黑的，灯只照到近处的铁皮和一圈碎波，再远就什么也没有。她抬眼看了看那圈光，没有看周衡。

她把拧过的袖口按平，又去扶闸门上那根湿绳子。绳子沉，她拉了一下，没有拉到底，只让它在手里停住。嘴张开，又闭上。雨声填进这半句没说出来的空隙里。

闸门自己响了一下。

不是她拉的。铁与铁轻轻碰了一声，短，闷，像有什么从里面撞了一下又退回去。湿铁皮跟着颤了颤，灯在上面晃开一道细影，随即稳住。江面上还是没有船。

周衡的目光从她脸上移到闸门，又移回来。他没有再往前走。林夏的手仍握着那根绳子，绳子没有再动。两人都站在灯下的栈桥上，雨落在他们肩上，谁也没有把那句话接完。

B 的正文
灯还在铁闸上晃。林夏没把视线从江面上收回来。雨细，落在栈桥上几乎没声，只把木头浸得更滑。值班室的窗开着，里面那点热气散到外面，立刻凉了。

周衡站在灯下，没往前凑。他看了看林夏的手，又看了看那片黑着的水。

「林夏。」他叫的时候把声音放轻了，「刚才那句，我不是催你。船要是还在闸外，你跟我说一声就行。我自己等。」

林夏把灯座上的水抹掉。手指在铁皮上停了一停。闸门是湿的，手一碰就凉。他没有回头。

「你问过了。」

「是。」周衡应得很慢，像怕这句话本身也算逼问，「所以我再问一遍。还在不在。」

林夏把抹布在栏杆上搭好，又把它拿下来，叠了叠。雨从袖口往里渗。他听得见周衡的鞋底在木板上挪了半步，又停住。栈桥窄，再挪就要碰到他。

他张了张嘴。

闸门自己响了一下。不是人推的那种。铁和木头碰在一起，短，闷，像有什么从里面轻轻撞了一撞，随即又静了。江面仍看不见船。灯晃得更厉害了一点，照出闸板上的水纹，什么都没有。

林夏的手还停在半空。周衡也没动。两个人都盯着那扇门，谁都没有把刚才的话接完。

雨还在下。灯还亮着。栈桥上只有他们两个。

对照
分数只针对这一章。AI 感越高越像模型腔；重复意象越高，重复越重。

指标	A	B
自然度         4                  3
AI感             4                  3
对话自然度  3                  4
人物声音      2                 4
情绪表现      4                  3
场景空间感  4                  4
POV稳定性  4                  2
信息自然度   4                  4
节奏              3                 4
重复意象       4                  3
大纲忠实度   5                   5
A 最明显的三处模型腔：每个动作都在演示「她不肯回答」；「雨声填进这半句没说出来的空隙里」是作者替沉默作总结；雨、灯、湿铁、绳子反复承担同一含义。比较自然的三处是周衡在湿木上滑了半步又站住、闸门那一声明确不是她拉动的，以及她看光圈而不看周衡。

B 最明显的三处问题：林夏先是「她」，后文变成「他没有回头」「他听得见」「他张了张嘴」，视角和人称一起漂了；结尾「雨还在下。灯还亮着。栈桥上只有他们两个。」是总结句；「像怕这句话本身也算逼问」「不是人推的那种」仍在替动作解释。比较自然的三处是「你问过了」对上「所以我再问一遍。还在不在。」、栈桥窄到再挪就要碰到人，以及抹灯座、放下抹布又叠起来的犹豫。

B 在对话节奏和两个人的说话差别上有明显改善，大纲事实也守住了。它同时出现了人称错乱，这是 A 没有的退化，而且直接伤到这次要看的 POV。因此不建议现在把 B 换成生产 Writer。要先处理第三人称有限下人物人称稳定，并收掉段末的三句收束；这次不改代码。

## Response:
10/5/2026, 7:51:27 PM · gpt-5-6

对，这一轮结果已经足够明确了。**先不要改代码，也不要把 B 上生产。**

### A/B 实测结论

| 项目 | A | B | 判断 |
|---|---:|---:|---|
| 自然度 | 4 | 3 | B 下降 |
| AI感 | 4 | 3 | **B 改善** |
| 对话 | 3 | 4 | **B 明显改善** |
| 人物声音 | 2 | 4 | **B 明显改善** |
| 情绪 | 4 | 3 | B 略改善 |
| 场景 | 4 | 4 | 持平 |
| POV | 4 | 2 | **B 严重退化** |
| 信息 | 4 | 4 | 持平 |
| 节奏 | 3 | 4 | **B 改善** |
| 重复 | 4 | 3 | **B 改善** |
| 大纲 | 5 | 5 | 持平 |

所以 B **不是失败**。

实际上它已经证明了一件非常重要的事情：

> **Writer Quality v0 的方向是对的。**

B 在最需要改善的几个地方确实产生了变化：

- 对话不像单纯的信息传递
- 林夏和周衡的说话方式开始出现差异
- 对话节奏更自然
- 重复意象减少
- AI 味下降
- 大纲遵循没有下降

但同时暴露出了一个**比 AI 腔更严重的 bug：POV/person consistency**。

---

# 现在最应该做的事情

不要马上让 Cursor 修。

我们先把问题定义清楚。

## P0：第三人称有限视角必须绝对稳定

B 出现：

> 林夏没把视线……

然后：

> **他没有回头。**

然后：

> **他听得见周衡的鞋底……**

然后：

> **他张了张嘴。**

这不是普通的文风问题。

这是**硬性叙事错误**。

因为当前章节明确是：

> `third_limited`

而且人物是林夏。

因此 B 的 Writer Quality 改进不能以牺牲 POV 稳定性为代价。

我们可以把它定义成：

**POV correctness > prose style improvement**

也就是说：

> 宁可 B 少一点“自然感”，也不能出现人物人称漂移。

---

# 第二个问题：不要让 Prompt 变成“禁止 AI 味清单”

这一点你现在暂时不用改，但之后非常重要。

比如：

> 不要总结
> 不要解释
> 不要重复意象
> 不要使用某种句式
> 不要……

如果不断往 system prompt 里面加，很容易出现另一个问题：

**AI 开始刻意执行“像人类写作”的规则。**

最后可能变成：

> 为了不总结，所以刻意不总结。
> 为了有潜台词，所以每句话都有潜台词。
> 为了人物声音，所以每个人都被强行设计成不同说话方式。

那会重新变僵硬。

所以我们现在已经看到一个很重要的原则：

> **Writer Quality 不应该继续无限增加规则。**

---

# 第三个问题：B 的结尾

你指出的这个非常准确：

> “雨还在下。灯还亮着。栈桥上只有他们两个。”

这属于典型的：

**场景已经表达完 → AI 再帮读者总结一次。**

而且和前面的：

> 闸门自己响了一下……

实际上已经完成了同一个功能。

所以 B 虽然整体 AI 感降低了，但仍然残留：

**“写完一个场景以后，我要给它一个漂亮的收束。”**

这个习惯需要压下去。

但同样：

**不要现在就加大量禁用句式。**

我们先记录这个问题。

---

# 现在我们已经获得了第一轮真正有价值的数据

可以把目前的结论写成：

### Writer Quality v0 Round 1

**成功改善：**

- Dialogue
- Character voice
- Pacing
- Repetition
- AI feel

**没有改善：**

- Spatial scene
- Information
- Outline fidelity

**出现退化：**

- POV stability
- Overall naturalness

**主要新问题：**

1. third-person limited 人称漂移
2. 段尾解释/总结
3. 部分动作仍被作者解释

---

# 下一步应该是什么？

我建议**只修 P0，不碰其他东西**。

也就是下一轮 v0.1 的目标不要写成：

> “让小说更加自然。”

而应该非常具体：

> **在保持 B 的对话、人物声音、节奏和重复控制优势的同时，消除 third_limited 的人物人称漂移。**

然后顺便验证：

> 段尾总结是否可以自然减少。

但第二项暂时不要作为硬性规则。

---

## 你现在可以直接把这段给 Cursor

这次仍然**不要让它修改代码**，只让它设计修复方案：

**document: Writer Quality v0.1 POV 修复只读设计**

基于刚刚完成的真实 Grok A/B 实测，不要修改代码，不要 commit，不要 push。

现在只做 Writer Quality v0.1 的只读修复设计。

实测结论：

B 相比 A：
- AI 感下降
- 对话自然度提高
- 人物声音明显改善
- 节奏改善
- 重复意象减少
- 大纲忠实度保持
- 但 third_limited 出现严重的人称/视角漂移
- B 出现了林夏「她」之后突然使用「他」的情况
- B 还存在少量段末总结句，但这不是本轮 P0

本轮目标只有一个：

在保留 B 已经取得的对话、人物声音、节奏和重复控制优势的前提下，确保 third_limited 下 POV 和人物人称绝对稳定。

请先只读检查：

1. 当前 B 的 system prompt 中 POV instruction 的具体内容。
2. chapter.pov 是如何传给 Writer 的。
3. Writer 是否知道当前 POV character。
4. Writer Pack 中是否已有足够的信息确定 POV character。
5. character block 是否包含角色姓名、性别/人称等可用信息。
6. 当前 prompt 为什么可能允许 third_limited 从「她」漂移到「他」。
7. 是否存在把“third_limited”理解成抽象视角，而没有明确“本章 POV character”的问题。
8. 检查是否可能出现多角色场景中人称漂移。
9. 检查是否可能出现“看到/听到/知道”超出 POV character 感知范围的问题。

设计要求：

A. 不增加数据库。
B. 不增加 Writer Pack block。
C. 不修改 Stage 2A/2B。
D. 不修改 Router/provider/model 参数。
E. 不修改 outline schema。
F. 不改变现有 A。
G. B 仍然只是 quality="b"。
H. 优先通过 Writer system prompt/context 修复。
I. 不要建立庞大的禁止规则列表。
J. 不要加入固定文学模板。
K. 不要要求每个段落都遵循固定结构。

特别检查：

如果当前 character block 没有明确性别/代词信息，不要擅自发明新的数据库字段。

请给出：
1. 根因判断；
2. 最小修复方案；
3. 修改哪些文件；
4. 修改哪些具体 prompt/context；
5. 如何测试 third_limited；
6. 如何证明没有破坏 B 当前已经改善的 dialogue/voice/pacing；
7. 是否需要 A/B Round 2；
8. 是否需要新的自动化测试。

不要修改任何文件。
不要运行真实 Grok。
不要 commit。
不要 push。

只输出只读设计报告。

---

这一步很重要。

**不要让 Cursor 看到“POV 有问题”以后直接加十几条规则。**先让它解释为什么会漂移。

如果它的设计仍然是“再往 system prompt 里塞一大段规则”，你把结果给我，我会帮你压缩到最小。

因为现在我们已经从“架构正确性测试”真正进入了**小说质量工程**阶段。接下来最重要的是：**少改、实测、比较，而不是继续堆功能。**

## Prompt:
10/5/2026, 7:56:57 PM

只做 v0.1 的修复设计。我先核对 B 现在怎样写视角，以及人物块里有没有足够信息把人称钉住。

第三人称有限现在只被写成一种抽象视角，没有钉死跟随的人和代词。v0.1 只补这一处，不动数据库，也不改已经生效的对话和人物声音规则。

1. 根因判断
B 的视角句在 agents/writer.py 的 pov_boundary 里，原文是：

这一章是第三人称有限。稳定跟随这一章的主要人物，不进入其他人物的内心。

draft 只把 chapter["pov"] 传进 _system_text。quality="b" 时，这句被接在整段 INSTRUCTIONS_V0 后面。A 不读 pov。

Writer 不知道本章跟随谁。chapter.pov_character_id 只出现在 storage/migrations/project/002_stage1.sql，应用代码不读、不写，界面也没有入口。实测那一章的值是空的。

人物块也没有人称信息。_character_text 只有姓名、role、摘要、性格、目标，B 再加已有的说话习惯。没有性别，也没有代词。实测块的开头是「林夏 / protagonist」，模型只能自己猜。

因此 third_limited 被理解成文风，而不是「跟随林夏，并且林夏的代词不能换」。多角色场景里，上一个说话的人是周衡时，后文的「他」就会落到周衡，或被当成中文默认的第三人称，再套回林夏。同一段里先「她」后「他」，就是这样来的。

「不进入其他人物的内心」也没有拦住感知越界。B 仍写了周衡「像怕这句话本身也算逼问」。提示前面还要求所有人物按自己知道的事行动，视角句又短、又在末尾，约束比不过前文。

2. 最小修复方案
不新增字段，不猜性别，不把「她」或「他」写进数据库。

B 在组装系统提示时，用已经在手的人物块确定跟随者：

若 pov_character_id 恰好已有值，并且对得上某个人物块的 id，就用那个人的姓名。
否则，在 third_limited、first、second 和空视角下，如果人物块里正好有一个 protagonist，就用这个人。实测里这就是林夏。
零个或多个主角时，不挑名字，只要求全文跟随同一个人、同一个代词。
third_limited 的句子改成这种边界，而不是新模板：

这一章是第三人称有限，跟随林夏。林夏从头到尾只用一个代词；第一次写成她或他之后，不得改成另一个。其他人物只用林夏能看见的动作和听得见的对话来表现，不写他们没说出口的理由。

没有唯一主角时，去掉人名，保留代词锁定和感知边界。

其他枚举只加同一条代词规则，不改写法：第一人称的叙述者用「我」；第二人称的「你」始终是同一个人；多视角换人时先写出名字，段内不换代词；全知可以转移注意力，但同一个人不换代词。

这句仍只附在 B 的系统提示末尾，不新增 Pack 块。B 的修复系统提示也附上同一句，避免以后修复把人称改回去。INSTRUCTIONS_V0 里关于对话、声音、节奏、重复和大纲的句子保持原样。

3. 修改哪些文件
agents/writer.py：由现有人物块解析跟随者，改 pov_boundary 的调用，并让 B 的修复提示带上同一句。
tests/test_writer_quality_v0.py：补人称锁定的断言。
不改 memory/pack.py、数据库、Pack 种类和顺序、Stage 2A/2B、Router、模型和 A 的提示。

4. 修改哪些 prompt / context
只改 B 的视角句，以及 B 修复时附带的同一句。人物块正文不变，所以对话和说话习惯的输入不变。A 的系统提示仍然不以这句开头，也仍然不读 pov。

5. 如何测试 third_limited
不调用 Grok。用和实测相同的两个人物块：林夏是唯一主角，周衡是配角，没有性别字段。

断言 B 的系统提示同时包含「跟随林夏」和「不得改成另一个」代词，并且不出现被指定的「她」或「他」。两个主角或没有主角时，不出现被猜中的人名。A 的系统提示与现在的 INSTRUCTIONS 一致。人物块仍不含性别，Pack 的 kind 和 id 顺序不变。

6. 如何证明没有破坏已有改善
INSTRUCTIONS_V0 中这些句子保持不动，并用测试锁定：对话是人物之间的交流、不同的句长和直接程度、说话习惯是约束、不要编造口癖、允许停顿观察闲聊、不堆砌比喻和重复意象。人物块仍只在 B 里追加已有的 speech_markers。

7. 是否需要 A/B Round 2
需要。用同一临时章、同一 Pack、同一 grok-4.7 和同一参数，只比较现在的 B 和补上视角句之后的 B。通过标准是林夏不再她/他互换，周衡的内心理由不再被直接写出，而对话来回、句长差别和场景里的停顿仍在。通过之前，B 不进入生产。

8. 是否需要新的自动化测试
需要，而且只做上面这些不调用模型的断言。Round 2 的正文判断仍由同章对照完成，不把真实 Grok 写进自动测试。

## Response:
10/5/2026, 7:57:01 PM · gpt-5-6

这个 v0.1 设计我认为**方向正确，而且已经足够小，可以实施**。尤其是它没有为了修一个 POV bug 又扩展数据库或 Writer Pack。

不过在让 Cursor 实施前，我建议改动两个细节。

### 1. 最大的问题：不能让模型“自己猜代词”

设计里说：

> “第一次写成她或他之后，不得改成另一个。”

这能防止**她 → 他**，但不能解决**第一次到底该用什么**。

当前人物块没有性别/代词字段，所以如果没有 `pov_character_id`，而只是通过唯一 `protagonist` 找到林夏，模型仍然可能第一次写：

> 他……

然后后面稳定地使用“他”。

这在技术上不再是“漂移”，但人物人称仍可能错。

因此我建议 v0.1 的目标稍微调整：

> **v0.1 只保证“代词一致性”和“POV人物锁定”，不试图从姓名推断正确中文代词。**

这样我们不会偷偷把“林夏通常应该用她”这种语言学推断塞进架构。

---

### 2. `pov_character_id` 最好不要“由人物块解析”

这里 Cursor 的说法：

> “用已经在手的人物块确定跟随者”

可以，但优先级应该明确：

**第一优先级：真实 `pov_character_id`**

**第二优先级：唯一 protagonist**

**第三优先级：不指定人物，只锁定一个 POV**

不要反过来。

因为以后如果 UI 真正开始支持 POV Character，那么数据库里的：

`chapter.pov_character_id`

才应该是权威来源。

现在只是因为 Stage 1 没有把它接进应用，所以暂时使用唯一 protagonist 作为 fallback。

---

### 3. “多视角”这条现在不要设计得太复杂

Cursor 提到：

> 多视角换人时先写出名字，段内不换代词

我建议 **v0.1 不要把它变成复杂规则**。

因为我们现在真正测试的是：

> `third_limited`

而不是一次解决所有 POV 系统。

否则很容易出现：

**修 third_limited → 顺便设计 multi → 顺便设计 first → 顺便设计 second → Prompt 又膨胀。**

v0.1 就解决当前实际出现的 bug。

---

## 所以我给这个设计的最终判断

**可以实施，但把范围锁死：**

> `third_limited` + 唯一 POV 人物 + 代词一致性 + 感知边界。

不做：

- ❌ 性别字段
- ❌ 新 POV 数据库
- ❌ 新 Pack block
- ❌ 自动判断“林夏一定是她”
- ❌ 重写整个 INSTRUCTIONS_V0
- ❌ 修改 dialogue / speech markers
- ❌ 修改 pacing
- ❌ 修改 anti-AI 规则
- ❌ 修改 A
- ❌ 修改 Router
- ❌ 修改 Stage 2A/2B

---

### 可以直接让 Cursor 实施

**document: Writer Quality v0.1 最小实施指令**

按刚才的只读设计实施 Writer Quality v0.1，但严格限制范围。

目标只有一个：

修复 Writer B 在 third_limited 下的 POV 人物锁定和人称漂移问题。

实施前先确认当前代码，不要修改其他架构。

规则：

1. POV 人物解析优先级必须是：
   a. 如果 chapter.pov_character_id 有值，并且能对应当前 Writer Pack 中已有的人物，则使用该人物；
   b. 否则，如果当前人物中恰好只有一个 role/protagonist，则使用该人物；
   c. 如果两者都不成立，不猜人物姓名，只要求保持单一、稳定的 POV 人物和代词。

2. 不新增任何数据库字段。
3. 不新增任何 Writer Pack block。
4. 不修改 memory/pack.py。
5. 不修改 Stage 2A。
6. 不修改 Stage 2B。
7. 不修改 Router/provider/model 参数。
8. 不修改 A。
9. 不修改 INSTRUCTIONS_V0 中已有的 dialogue、speech markers、pacing、repetition、outline fidelity 等规则。
10. 不从人物姓名猜测中文性别或代词。
11. 不把“林夏一定是她”之类的信息写入数据库或人物资料。
12. third_limited 必须明确：
    - 当前章节跟随哪个人物（如果有可靠人物身份）
    - 该 POV 人物的人称必须保持一致
    - 其他人物只能通过 POV 人物可观察/可听见的信息表现
    - 不直接写其他人物未表达出来的内心理由
13. B 的 length repair system prompt/context 必须保留同样的 POV boundary，避免 repair 把人称改回去。
14. 不要加入庞大的禁止词或固定文学模板。

特别注意：

“保持代词一致”不等于“自动判断正确代词”。

如果没有可靠的人称信息，v0.1 只要求第一次选择后保持一致，不允许从姓名猜测性别。

测试：

修改 tests/test_writer_quality_v0.py，增加不调用模型的测试：

- third_limited + 唯一 protagonist → prompt 指定该人物；
- chapter.pov_character_id 有效时优先使用它；
- pov_character_id 无效 + 唯一 protagonist → fallback；
- 多个 protagonist → 不猜人物；
- 没有 protagonist → 不猜人物；
- prompt 包含 POV 人物锁定、代词一致、感知边界；
- 不出现自动猜测的性别信息；
- A 的 prompt 保持原样；
- B 的 INSTRUCTIONS_V0 原有 dialogue / voice / pacing / repetition 规则仍存在；
- B character block 的 speech_markers 行为不变；
- Pack kind/id/order 不变；
- Stage 2A/2B 文件没有修改。

完成后运行：

pytest -q
npx tsc -b
node --experimental-strip-types --test *.test.ts

不要运行真实 Grok。

不要 commit。
不要 push。

最后只报告：
1. 实际修改文件；
2. diff 摘要；
3. 测试结果；
4. 是否修改了 A；
5. 是否修改 Stage 2A/2B；
6. 是否修改 Pack kind/order；
7. 是否存在超出本次范围的修改。

完成后停止。

然后把 Cursor 的实施结果发给我。

**如果代码检查通过，下一步才是 B → B v0.1 的真实 Grok Round 2。**这一轮我们不再比较 A/B，因为 A 已经证明了基线；重点是确认：

> **B 的优势还在 + POV bug 消失。**

只有这个成立，才考虑让 B 进入生产。

## Prompt:
10/5/2026, 8:02:01 PM

只改 B 的视角锁定：先按 pov_character_id，再按唯一主角，否则不猜姓名。我先核对当前组装方式，避免动到 A 和人物块。

Writer Quality v0.1 已加上第三人称有限的人物锁定。B 在有可靠身份时点名跟随者，并要求代词一经选用就不得更换；没有可靠身份时不猜姓名，也不猜性别。没有运行真实 Grok，没有 commit，没有 push。

1. 实际修改文件
agents/writer.py
tests/test_writer_quality_v0.py
2. diff 摘要
resolve_pov_character 的顺序是：chapter.pov_character_id 能对上当前人物块就用那个人；否则恰好一个 protagonist 就用那个人；否则不返回姓名。third_limited 的系统句改为跟随该人物、代词只说「第一次写成她或他之后，不得改成另一个」，其他人物只通过可看见的动作和可听见的对话表现。B 的篇幅修复系统提示附上同一句。INSTRUCTIONS_V0 的对话、声音、节奏、重复和大纲规则没有改。

3. 测试结果
pytest -q：152 通过，0 失败
npx tsc -b：通过
node --experimental-strip-types --test *.test.ts：17 通过，0 失败
4. 是否修改了 A
没有。A 仍使用原来的 INSTRUCTIONS，不读 pov。

5. 是否修改 Stage 2A/2B
没有。

6. 是否修改 Pack kind/order
没有。没有新增块，也没有改 memory/pack.py。

7. 是否存在超出本次范围的修改
这次没有。工作区里仍留着更早未提交的 v0 文件：memory/pack.py、pipeline/chapter_flow.py，以及未跟踪的 tests/test_writer_quality_v0.py 和 ai_novel_studio.egg-info/。v0.1 没有再改它们。

## Response:
10/5/2026, 8:02:04 PM · gpt-5-6

很好，这一轮**代码层面可以通过**。现在不要再改任何代码，直接进入 **B v0.1 的真实 Grok Round 2**。

但这次实验有一个关键变化：**不要重新生成一个完全不同的章节输入。**要尽量复用上一轮 A/B 的同一临时章节、同一套 Pack 和状态，只把 Writer B 从 v0 切换成 v0.1。

### 现在让 Cursor 做 Round 2

把下面这段给 Cursor：

**document: Writer Quality v0.1 Round 2 实测指令**

现在进行 Writer Quality v0.1 的真实 Grok Round 2。

这是质量对照实验，不修改任何代码。

实验目标：

比较上一轮已经生成的 Writer B v0，与现在修复 POV 锁定后的 Writer B v0.1。

不要重新设计 Prompt。
不要修改代码。
不要 commit。
不要 push。

实验输入必须尽可能与上一轮 B 完全一致：

- 使用上一轮临时项目：
  01a10be1-7d6d-7145-a95c-402e1832dc75
- 使用同一章节：
  01a10be1-7e43-7cb3-bf3d-48185a6fad36
- 使用同一 Story Outline
- 使用同一 Volume Outline
- 使用同一 Chapter Outline
- 使用同一 Scene Sketch
- 使用同一 Character
- 使用同一 World
- 使用同一 Stage 2B confirmed fresh state
- 使用同一 Chapter Summary / Continuity
- 使用相同 user requirements / prohibitions
- POV 仍为 third_limited
- 使用真实 grok / grok-4.7
- temperature 0.7
- max_tokens 4096
- reasoning_effort low
- 不设置 top_p
- 不允许 FakeProvider

上一轮 B v0 的正文已经存在：

/tmp/writer-ab/b.md

现在只生成一次新的 B v0.1。

请确保新的模型输入没有包含上一轮 B 刚生成的正文。
不能把 /tmp/writer-ab/b.md 作为 Writer context。
它只能用于实验结束后的比较。

实验过程中记录：

- provider
- model
- quality
- chapter_id
- POV
- manifest id
- manifest confirmed 状态
- Writer Pack kind/id 顺序
- 实际发送的主要 block
- prose revision id
- 正文长度
- repair_rounds
- 是否调用 FakeProvider
- 实际模型调用次数

将新的正文保存为：

/tmp/writer-ab/b-v01.md

然后将它与上一轮：

/tmp/writer-ab/b.md

进行只读比较。

重点检查：

P0：
1. 林夏的人称是否从头到尾一致；
2. 是否仍然出现「她 → 他」或「他 → 她」；
3. third_limited 是否始终跟随同一个人物；
4. 是否出现周衡等其他人物的未表达内心理由；
5. 是否出现超出林夏感知范围的信息。

P1：
6. 上一轮 B 已经改善的对话自然度是否保留；
7. 林夏和周衡的说话差异是否保留；
8. 节奏是否保留；
9. 重复意象是否仍然比上一轮 A 少；
10. 是否出现新的模板化表达；
11. 是否出现更多段末总结句；
12. 大纲事实是否仍然完整。

请输出：

### B v0 vs B v0.1

| 指标 | B v0 | B v0.1 |
|---|---:|---:|
| POV稳定性 | 1-5 | 1-5 |
| 人称一致性 | 1-5 | 1-5 |
| 对话自然度 | 1-5 | 1-5 |
| 人物声音 | 1-5 | 1-5 |
| 情绪表现 | 1-5 | 1-5 |
| 节奏 | 1-5 | 1-5 |
| 重复意象 | 1-5 | 1-5 |
| AI感 | 1-5 | 1-5 |
| 大纲忠实度 | 1-5 | 1-5 |

其中 AI感、重复意象仍然是：
分数越高 = 越严重。

另外明确报告：

- B v0 的 POV 错误次数；
- B v0.1 的 POV 错误次数；
- B v0.1 是否出现任何新的人称错误；
- B v0.1 是否出现其他人物内心越界；
- B v0.1 是否保留上一轮 B 的对话优势；
- B v0.1 是否出现明显退化。

不要让模型自动给“文学质量总分”作为唯一结论。
重点报告具体文本证据和问题。

最后给出结论：

A. POV 修复成功，可以继续；
B. POV 修复成功，但出现其他明显退化；
C. POV 修复没有成功。

如果是 A 或 B，都不要修改代码。
如果是 C，也不要修改代码，只报告具体失败原因。

实验结束后停止。

### 这次我们主要看一个东西

上一轮 B 最大的问题是：

> **“她 → 他”**

如果这一次变成：

> **0 次人称漂移**

而且对话、人物声音、节奏没有明显下降，那么 v0.1 就达到了它的目标。

尤其不要因为 B v0.1 某一句“不够漂亮”，就继续改 Prompt。

我们现在需要的是：

**一个明确的 P0 修复，而不是无限润色。**

把 Cursor Round 2 的结果贴给我，我会根据 **B v0 → B v0.1** 判断是否可以进入下一步。

## Prompt:
10/5/2026, 8:05:19 PM

只生成一次当前的 B v0.1，并先核对输入里没有上一轮那篇正文。临时项目和对照稿都只读使用。

B v0.1 已用同一章再生成一次，正文在 /tmp/writer-ab/b-v01.md。发送给模型的 user 消息与生成前的计划一致，不含上一轮 /tmp/writer-ab/b.md 里的句子。没有改代码，没有 commit，没有 push。

这次调用是真实 grok / grok-4.7，quality=b，third_limited，temperature 0.7，max_tokens 4096，reasoning_effort low，没有 top_p。章节 01a10be1-7e43-7cb3-bf3d-48185a6fad36。清单 01a10bf2-9a3b-7b74-875c-68b35320a333 已 confirmed。修订 01a10bf3-0356-77b2-b0f0-d7f13ab2a6c2，602 字。repair_rounds 为 0，模型调用 1 次，不是 FakeProvider。Pack 顺序与上一轮相同。系统提示含「跟随林夏」。

B v0.1 正文
灯还在铁闸上晃。林夏没回头，伸手把灯罩扶正。雨细，打在木头上几乎没有声音。栈桥窄，她的鞋底沾着水，往回挪了半步，肩抵着值班室没关严的窗。

周衡还站在那头。灯只照到他半张脸，衣领湿了一圈。他看了看江面，又看她，像是把刚才那句咽回去，重新找了个更轻的说法。

「林夏，」他停了停，声音放低，「我不是来吵夜班的。船要是还在闸外，你跟我说一声就行。我自己去等。」

她的手还按在灯罩上。铁是凉的。江面黑着，灯照出去没多远，水纹一闪就没了。她看见闸门上的水往下淌，滴进闸缝里。

周衡又往前走了一步。桥板滑，他踩稳了才开口，仍是那副客气。「你要是不方便说全，说个方向也成。我不再问第二遍。」

她没接。手指从灯罩上松开，去摸口袋里的钥匙，摸到了，又放回去。值班室里有人把椅子碰了一下，她没进去。风从窗缝里出来，带着潮气。

「周衡。」她只叫了这两个字。后面的话停在嘴里。她低头看自己的鞋尖，鞋尖对着闸，不是对着他。

闸门自己响了一声。不是她碰的。铁和铁挤了一下，湿木头跟着颤，声音短，很快被雨盖住。灯晃得更厉害，在闸面上划过去，又回到原处。江面仍是空的。

两人都没动。周衡的手抬了一下，又放下，像要去扶那扇门，到底没有离开他站的那块板。

「……你听见了。」他说。句子比刚才更完整，尾音却轻。「要是不方便，我可以等灯稳了再问。」

林夏看着那道缝。水还在滴。她张了张嘴，只吐出半个字，又咽回去，手重新按上灯罩，把那一点晃按住。

谁都没有把那句话说完。

对照
指标	B v0	B v0.1
POV稳定性
2
5
人称一致性
2
5
对话自然度
4
4
人物声音
4
4
情绪表现
3
4
节奏
4
4
重复意象
3
3
AI感
3
3
大纲忠实度
5
5
AI 感和重复意象仍是分数越高越严重。

B v0 有 3 处明确的人称错误，都把已经用「她」写过的林夏改成了「他」：「他没有回头」「他听得见周衡的鞋底」「他张了张嘴」。另外「再挪就要碰到他」也含混。B v0.1 的人称错误是 0。林夏全程是「她」或直呼姓名，周衡全程是「他」。没有新的她/他互换。

其他人物的内心没有被写成事实。最接近的一句是「像是把刚才那句咽回去，重新找了个更轻的说法」，这是对周衡改口的外形推断，不是上一轮那种「像怕这句话本身也算逼问」。林夏看见水往下滴、听见椅子碰了一下、自己没进值班室，都在她的感知里。船的下落仍然没被说破，人仍在闸口，闸门自己响，周衡把问题又问了一遍。

对话优势还在。周衡的句子长而客气：「你跟我说一声就行。我自己去等。」林夏只说「周衡。」两个字，后面停住。节奏仍是问、停、闸门打断，而不是连着解释。段末总结比上一轮少：上一轮最后连用三句收束，这一轮只剩「谁都没有把那句话说完。」重复意象没有比上一轮 A 更密，也没有新的固定段落公式。

结论是 A：POV 修复成功，可以继续。 没有明显退化。剩下的那句段末总结和「像是」推断还在，但不是这次人称修复的失败。不要据此改代码。

## Response:
10/5/2026, 8:05:23 PM · gpt-5-6

这一轮可以正式判定 **Writer Quality v0.1 实验成功**。

最重要的不是“B v0.1 写得更漂亮”，而是它证明了一个很好的结果：

- **POV 稳定性：2 → 5**
- **人称一致性：2 → 5**
- 对话：4 → 4，**没有退化**
- 人物声音：4 → 4，**没有退化**
- 情绪：3 → 4
- 节奏：4 → 4
- 重复：3 → 3
- AI 感：3 → 3
- 大纲忠实度：5 → 5

也就是说，这次修复基本实现了：

> **修掉 P0 bug，同时没有破坏 v0 已经取得的质量改善。**

### 现在先不要继续改 Prompt

你指出的：

> “谁都没有把那句话说完。”

以及：

> “像是把刚才那句咽回去……”

确实仍然值得以后优化，但它们属于**下一层文学质量问题**，不是 v0.1 的失败。

如果现在继续追着这些句子修改，很容易进入：

**一句问题 → 加规则 → 新问题 → 再加规则 → Prompt 越来越长**

这正是我们现在要避免的。

---

## 下一步我建议：先把 v0.1 固化

现在可以让 Cursor 做一次**只读最终检查**，确认：

1. v0 + v0.1 的所有测试通过；
2. 工作区 diff 只有预期文件；
3. 没有 Stage 2A/2B 改动；
4. 没有 Provider/Router 改动；
5. 没有数据库迁移；
6. A 仍然完全不变；
7. B 默认行为仍然是明确 opt-in；
8. `ai_novel_studio.egg-info/` 不进入 commit。

如果检查通过，**再 commit v0/v0.1 这一组 Writer Quality 改动**。

然后才进入真正重要的下一阶段：

### 10 章长篇质量测试

因为现在我们只证明了：

> **一个章节里，B 比 A 更自然，而且 POV bug 已修好。**

还没有证明：

> **B 能连续写 10 章而不逐渐变僵、OOC、重复、忘记人物关系或破坏伏笔。**

这才是现在最值得测试的东西。

所以路线已经非常清楚：

**Stage 2B → 已冻结 ✅**

**Writer Quality v0 → A/B 验证 ✅**

**Writer Quality v0.1 → POV 修复验证 ✅**

**↓**

**固化代码**

**↓**

**10章真实长篇 E2E**

**↓**

根据实际小说质量决定下一次最小改动。

这次不要再往架构上扩了。现在终于到了真正检验 **“这个 AI 能不能写小说”** 的阶段。

## Prompt:
10/5/2026, 8:06:20 PM

我现在要怎么做

## Response:
10/5/2026, 8:06:23 PM · gpt-5-6

现在按这个顺序做，**先不要继续改功能**。

### ① 先让 Cursor 做最终代码检查

把下面直接发给 Cursor：

**document: Writer Quality v0.1 最终检查**

现在做 Writer Quality v0/v0.1 的最终只读检查。

不要修改任何代码。
不要 commit。
不要 push。
不要运行真实 Grok。

检查当前工作区：

1. v0/v0.1 的修改是否只涉及：
   - agents/writer.py
   - memory/pack.py
   - pipeline/chapter_flow.py
   - tests/test_writer_quality_v0.py

2. 确认以下文件没有被本轮修改：
   - Stage 2A
   - Stage 2B
   - migrations
   - canon/state_store.py
   - pipeline/state_extract.py
   - Router
   - providers
   - outline generation
   - prose schema
   - Writer Pack kind/order

3. 确认 A：
   - 仍然使用原来的 Writer system prompt；
   - 不读取 POV；
   - 不使用 speech_markers；
   - production 默认 quality="a"。

4. 确认 B：
   - 只有 quality="b" 才启用；
   - 使用 Writer Quality v0；
   - 使用 speech_markers；
   - 使用 POV boundary；
   - v0.1 的 POV 人物解析优先级为：
     pov_character_id → 唯一 protagonist → 不猜；
   - length repair 使用同样的 POV boundary；
   - 没有改变 Router/Manifest 逻辑。

5. 确认 Writer Pack：
   - kind 不变；
   - id 不变；
   - 顺序不变；
   - Stage2B state block 不变。

6. 运行：
   pytest -q
   npx tsc -b
   node --experimental-strip-types --test *.test.ts

7. 查看 git diff 和 git status。

特别确认：
ai_novel_studio.egg-info/ 不属于本次修改，不要纳入 commit。

最终只报告：
- 测试结果
- 实际修改文件
- 是否有超出范围的 diff
- 是否可以安全 commit

不要修改任何文件。

### ② 如果 Cursor 回复“可以安全 commit”

再让它 commit，但**只提交这 4 个文件**：

```text
agents/writer.py
memory/pack.py
pipeline/chapter_flow.py
tests/test_writer_quality_v0.py
```

不要提交：

```text
ai_novel_studio.egg-info/
```

commit 信息可以用：

```text
Add Writer Quality v0
```

然后 push 到你现在的开发分支。

---

### ③ Commit 后，不要马上继续开发

下一步直接做真正的 **10 章小说测试**。

我们要准备一套完整测试小说：

**用户创意 → Story Outline → Volume Outline → 10 个 Chapter Outline → Writer B v0.1 → 连续生成 10 章**

重点不是测试程序“能不能跑”。

而是测试最终小说：

- 人物会不会 OOC
- 人物说话方式能不能保持
- 人物关系有没有变化错误
- 时间线有没有冲突
- 世界设定有没有前后矛盾
- 伏笔能不能保持
- 前几章发生的事情会不会被忘记
- 情节是不是越来越像流水账
- AI 腔会不会逐章加重
- 重复词/重复意象会不会越来越多
- 场景是否越来越模板化
- POV 是否持续稳定
- 章节之间的转场是否自然
- 每章是不是都在“总结剧情”
- 长度控制是否真的有效

### ④ 这次不要自己手动打分 10 章

让 Cursor 负责**运行和收集数据**，但不要让它自己决定“小说质量很好”。

你把生成出来的 10 章正文给我，我来帮你做质量审查。

---

**所以你现在实际上只需要做一件事：**

> **把第①步的最终检查指令发给 Cursor。**

把它的检查结果发给我，我再告诉你是否可以 commit。