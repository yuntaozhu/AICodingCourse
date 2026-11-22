## Response:
10/5/2026, 5:19:08 AM · gpt-5-6

这个诊断非常清楚。现在我建议**不要直接进入 Stage 2**，先把 Stage 1 的 3 个问题修掉。因为其中第 1、2 项实际上是同一个根本问题：

> **真实 Grok 已经能写正文，但后台的“记忆更新”没有经过发送确认机制，所以每次都被 `SEND_NOT_CONFIRMED` 拦截。**

这会直接破坏长篇小说最重要的连续性。

### 我建议这样修

#### ① 修复章节摘要/记忆自动更新

现在是：

```text
第一章生成
↓
保存正文
↓
等待5秒
↓
后台生成摘要
↓
没有 manifest_id
↓
SEND_NOT_CONFIRMED ❌
↓
摘要 stale
↓
第二章无法读取
```

应该改成：

```text
第一章生成
↓
保存正文
↓
创建新的 memory-update manifest
↓
使用与正文相同的云端发送授权机制
↓
Grok 更新摘要/派生记忆
↓
摘要标记为当前
↓
第二章检索摘要
```

但这里有一个重要设计问题：

**我们不能简单地绕过 `SEND_NOT_CONFIRMED`。**

因为记忆更新同样会把你的小说内容发送给 Grok。

所以应该让用户明确选择：

> **允许本项目的派生记忆自动发送给已配置的云端模型**

或者每次都确认。

对于真正写长篇小说来说，我更推荐：

**项目级“允许自动更新云端记忆”开关。**

用户打开以后：

```text
正文 → Grok
摘要 → Grok
人物状态 → Grok
时间线 → Grok
```

都按照项目授权执行。

---

### ② 修复修改章节后的记忆更新

这一项其实会随着①一起解决。

现在：

```text
修改第一章
↓
旧摘要 stale = 1
↓
重新生成摘要失败
```

修好后：

```text
修改第一章
↓
旧摘要 stale = 1
↓
自动重新生成摘要
↓
新的 source_revision_id
↓
stale = 0
↓
第二章读取新摘要
```

而且这个机制非常重要：

**不能让旧记忆继续冒充新记忆。**

这一点目前的设计其实是对的，只是后面的重新生成没有成功。

---

# ③ 长度控制需要真正修，而不是只显示提示

这是三个问题里最值得认真设计的一个。

现在的代码实际上只是：

```text
用户设置：
目标 5000
最少 4000
最多 6000

↓
告诉 Grok：
“请写约5000字”

↓
Grok 返回 2700字

↓
length_check：
“警告：长度不足”
```

这不是真正的长度控制。

---

## 我建议改成真正的 Length Controller

例如：

```text
目标：5000
最小：4000
最大：6000
```

Grok 第一次生成：

```text
4380字
```

✅ 合格 → 保存。

如果只有：

```text
2700字
```

系统自动进行：

```text
Length Repair
↓
告诉 Grok：
当前约2700字
目标5000字
请在不重复已有内容的情况下扩写
```

如果变成：

```text
4720字
```

✅ 合格。

如果仍然不足：

```text
最多再修复1～2次
```

超过最大长度则做压缩。

这正好和我们之前规划的 Stage 2 **长度修复机制**一致，但我认为至少应该把基础版放进 Stage 1，否则“章节长度设置”实际上是假的。

---

# 还有一个非常重要的设计

现在 `minimum / maximum / target` 都是空的。

我建议 UI 默认不要强制用户填写。

例如：

### 长度设置

```text
章节长度

○ 不限制

● 自定义

目标长度：5000 字
最少：4000 字
最多：6000 字

☑ 严格控制
```

如果选择“不限制”：

> Grok 自己决定长度。

如果选择“自定义”：

> 系统真正执行长度检查 + 自动修复。

这样比较合理。

---

# 所以现在给 Cursor Agent 的任务

我建议**一次只修这三个问题，不要开始 Stage 2**。

把下面这段完整交给 Agent：

```text
Stage 1 diagnosis is complete.

The following acceptance failures must now be fixed:

A. Chapter 2 cannot retrieve fresh Chapter 1 derived memory.
B. Editing Chapter 1 marks memory stale but the real memory rebuild is blocked by SEND_NOT_CONFIRMED.
C. Chapter length settings are stored/displayed but do not actually control generation.

Keep these existing behaviors unchanged:
D. Fake Generate never calls Grok.
E. Real Generate never silently falls back to FakeProvider.

Please implement a focused Stage 1 fix only. Do NOT start Stage 2 architecture yet.

REQUIREMENT 1 - Cloud memory authorization

The real memory_updater currently calls ModelRouter with allow_fake=false and no manifest_id, causing SEND_NOT_CONFIRMED.

Do NOT bypass the cloud-send security gate.

Add a proper project-level/user-visible authorization mechanism for automatic cloud-derived-memory updates.

The user must explicitly opt in before background memory updates can send chapter content to the configured cloud model.

After opt-in:
- memory_updater may create/use an appropriate confirmed authorization for the specific provider/model/content manifest.
- The authorization must remain auditable.
- It must not expose or store API keys.
- It must not silently authorize arbitrary future cloud sends.
- Existing writer confirmation behavior must remain intact.
- If the user has not opted in, memory update must remain blocked rather than silently using FakeProvider.

The UI must clearly show whether automatic cloud memory updates are authorized.

REQUIREMENT 2 - Derived memory correctness

After a chapter prose revision is saved:
- mark the old derived memory stale;
- schedule a real memory rebuild only when cloud-memory authorization exists;
- rebuild the summary against the current prose revision;
- store the new source_revision_id;
- mark the new summary fresh;
- make it retrievable by later chapter writer packs.

When Chapter 1 changes, Chapter 2's stale_context behavior must remain correct.

A fresh summary must never be used if its source_revision_id does not match the chapter's current prose revision.

REQUIREMENT 3 - Real chapter length control

Implement actual length enforcement for configured chapter length.

Keep project → volume → chapter inheritance.

When no length is configured:
- preserve current behavior.

When target/minimum/maximum are configured:
- include the length policy in the model request;
- after generation, measure the generated prose;
- if within range, accept it;
- if below minimum or materially above maximum, perform a bounded length-repair pass;
- maximum repair rounds: 2;
- do not blindly duplicate or pad text;
- preserve existing plot, characters, facts, and continuity during repair;
- if the result still misses the target after the allowed repair rounds, save the best result and report a clear warning;
- never create an infinite retry loop.

Do not make FakeProvider pretend to be length-controlled. Fake Generate must remain clearly separate and deterministic for testing.

IMPORTANT:
- Do not modify FakeProvider behavior except where required to preserve the separation.
- Do not silently fall back to FakeProvider.
- Do not expose API keys.
- Do not change provider credentials.
- Do not change the Grok endpoint.
- Do not add unrestricted web scraping.
- Do not start Stage 2.
- Do not add unnecessary dependencies.

TEST REQUIREMENTS

Add/update tests for:
1. Chapter 2 receives a fresh Chapter 1 summary.
2. Editing Chapter 1 makes the old summary stale.
3. Authorized memory rebuild creates a fresh summary tied to the new revision.
4. Unauthorized background memory update remains blocked.
5. Length within range is accepted.
6. Short output triggers bounded repair.
7. Long output triggers bounded repair.
8. Repair cannot exceed 2 rounds.
9. Fake Generate never calls Grok.
10. Real Generate never falls back to FakeProvider.

Before changing code, inspect the existing implementation and reuse existing architecture wherever possible.

After implementation:
- run the complete test suite;
- report files changed;
- report test results;
- do not perform a real Grok request unless explicitly asked.
```

### 我特别建议保留这条原则

> **不要为了让第二章能读取第一章，就简单把 SEND_NOT_CONFIRMED 删除。**

否则我们刚刚建立起来的云端隐私/发送确认机制就被破坏了。

正确的方向应该是：

**用户授权“自动云端记忆更新” → 系统仍然记录每次发送的 manifest → 只有授权范围内的内容自动发送。**

这样以后你把这个平台真正用于商业小说时，架构会干净很多。

等 Agent 修改完成、测试通过后，我们再看一次代码和测试结果，再决定 Stage 1 是否正式封版。

## Prompt:
10/5/2026, 5:24:01 AM

我同意你的想法，现在我们再想想还有什么咱们遗漏的，没想到的，直接一次性思考完，后面就不用这么麻烦了

## Response:
10/5/2026, 5:24:05 AM · gpt-5-6

对。我也认为**现在应该停下来做一次“总设计审计”**，而不是修一个 bug 再发现一个 bug。

我们目前已经把“能跑起来”验证了，但你真正想做的不是一个简单的 AI 写作 Demo，而是一个**可以长期写几十万甚至上百万字、能保持世界观和人物连续性、以后还能商业化使用的 AI Novel Studio**。

所以我建议：**现在先不让 Agent 改代码。我们把整个系统从头到尾重新审一遍，把容易遗漏的问题一次列出来，然后形成一份“Stage 1 完整验收规范 + Stage 2 设计规范”。**

---

# 一、先确定我们最终到底要做什么

我建议把整个产品定义成：

> **Local-first、可接多模型、具有长期记忆和世界状态管理、支持研究与资料管理、能够进行长篇小说规划/写作/检查/修改/导出的 AI 小说工作站。**

最终不是：

> “输入一个题材 → AI 给我写一章”

而是：

```text
项目
│
├── 小说设定
│   ├── 类型
│   ├── 主题
│   ├── 世界观
│   ├── 规则
│   ├── 地理
│   ├── 历史
│   └── 时代
│
├── 人物
│   ├── 主角
│   ├── 配角
│   ├── 阵营
│   ├── 关系
│   ├── 性格
│   ├── 能力
│   ├── 目标
│   └── 人物状态变化
│
├── 剧情
│   ├── 主线
│   ├── 支线
│   ├── 伏笔
│   ├── 回收
│   ├── 冲突
│   └── 时间线
│
├── 卷
│   ├── Arc
│   │   ├── Chapter
│   │   │   ├── Scene
│   │   │   └── Scene
│   │   └── ...
│   └── ...
│
├── 长期记忆
│
├── 研究资料
│
├── Style Profile
│
└── 写作 / 检查 / 修改 / 导出
```

这个方向我们应该现在就固定下来。

---

# 二、目前发现的 3 个问题只是表面问题

我们刚刚发现：

### 1. 记忆更新失败

根本原因：

```text
正文生成
↓
摘要生成
↓
需要云端模型
↓
SEND_NOT_CONFIRMED
↓
失败
```

### 2. 修改后记忆失效

其实是：

```text
正文 revision 改变
↓
旧 memory 正确地变 stale
↓
新 memory 没生成
```

所以**底层的 revision 思路反而是对的**。

### 3. 长度控制是假控制

现在：

```text
目标 5000
↓
告诉模型“写5000”
↓
模型写2700
↓
系统：警告
```

这显然不够。

---

# 三、我认为现在还遗漏了这些东西

下面这些是我认为**现在就应该设计进去**，否则以后会返工的。

---

## A. Canon / 正典系统

这是整个小说系统最重要的基础之一。

我们必须区分：

### Hard Canon

用户明确规定：

> 主角叫林远。

系统绝对不能自己改成“林渊”。

### Soft Canon

AI 推断：

> 林远可能喜欢喝咖啡。

以后可以被修改。

### Derived Memory

从正文推导：

> 第一章林远发现了一张红色地图。

可以重新生成。

所以：

```text
Hard Canon
    ↓
不能被 AI 随意修改

Soft Canon
    ↓
可以建议修改

Derived Memory
    ↓
可以重新计算
```

这一层现在就应该确定。

---

# 四、人物不能只有“人物简介”

这个非常容易遗漏。

例如：

第一章：

> 林远不会游泳。

第30章：

> 林远跳进湖里游泳。

这不是普通的“记忆问题”。

这是：

> **Character State contradiction**

人物应该有：

```text
人物
├── 基础设定
├── 性格
├── 能力
├── 关系
├── 当前状态
├── 已知信息
├── 未知信息
├── 经历
└── 状态历史
```

尤其：

### Character Knowledge

林远知道什么？

### Reader Knowledge

读者知道什么？

### Author Knowledge

作者知道什么？

这三个必须区分。

否则悬疑小说会直接被 AI 剧透。

---

# 五、世界观也必须有“状态”

例如：

第一章：

> 王国首都叫阿斯塔。

第100章：

> 首都叫阿斯特拉。

系统应该能检测。

世界观应该包括：

```text
地点
人物
组织
国家
物品
能力
规则
历史事件
社会制度
货币
时间体系
```

而且这些都应该可以产生：

> 当前状态 + 历史状态。

---

# 六、关系系统必须是动态的

不能只有：

```text
林远 → 苏雨：朋友
```

应该：

```text
第1章
林远 → 苏雨
关系：陌生人

第12章
关系：朋友

第35章
关系：敌对

第80章
关系：暂时合作
```

也就是说：

> **Relationship State History**

必须存在。

---

# 七、时间线必须独立存在

这是长篇小说非常容易崩的地方。

例如：

```text
3月1日
主角进入城市

3月3日
发生袭击

3月4日
主角住院

3月5日
主角参加宴会
```

然后 AI 突然写：

> “一个星期之后……”

但实际上只有一天。

所以必须有：

```text
Timeline
├── absolute date
├── relative date
├── event
├── participants
├── location
└── source chapter
```

---

# 八、伏笔系统

这个一定要提前做。

例如：

```text
Foreshadowing #17

出现：
Chapter 3

内容：
旧地图上有一个奇怪符号

状态：
OPEN

计划回收：
Chapter 42

实际回收：
Chapter 39
```

状态：

```text
OPEN
PLANNED
PARTIALLY_RESOLVED
RESOLVED
ABANDONED
```

否则长篇小说写到几十章以后，AI 根本不知道自己埋过什么。

---

# 九、剧情不能只有“章节摘要”

最终应该有：

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

每一级都有自己的目标。

例如：

### Volume 1

目标：

> 主角进入魔法学院。

### Arc 2

目标：

> 主角发现学院隐藏实验。

### Chapter 17

目标：

> 主角进入地下档案室。

### Scene 3

目标：

> 找到实验记录。

这样 AI 才不会每章自由发挥。

---

# 十、Scene 是非常重要的

这是我认为**现在就应该提前确定，但不一定现在全部实现**的东西。

真正写作的时候不要：

```text
“请写第17章。”
```

直接让 AI 写5000字。

应该：

```text
Chapter 17
 ↓
Scene 1
Scene 2
Scene 3
Scene 4
 ↓
每个 Scene 分别规划
 ↓
写作
 ↓
合并
 ↓
检查
```

这样长篇质量会稳定很多。

---

# 十一、Context Budget

这个非常重要。

绝对不能以后做成：

> 每写一章，把前面所有章节全文塞给 Grok。

否则：

- Token 爆炸
- 成本爆炸
- 上下文越来越慢
- 模型注意力下降

应该：

```text
当前 Scene
+
相关人物
+
相关世界观
+
相关剧情
+
最近章节
+
相关伏笔
+
时间线
+
必要的历史记忆
```

动态检索。

这就是：

> **Retrieval-based Context**

---

# 十二、Memory 必须有优先级

不是所有记忆都一样重要。

例如：

```text
Priority 100
主角姓名

Priority 100
世界核心规则

Priority 90
主要人物关系

Priority 70
近期事件

Priority 30
普通环境描述
```

Context 超限时：

**优先保留高价值信息。**

这个现在设计好，以后非常省事。

---

# 十三、Memory 必须可以追溯

以后如果 AI 写错了：

> “为什么它认为苏雨已经死了？”

系统应该能告诉你：

```text
Memory:
苏雨已死亡

Source:
Chapter 84
Revision 3

Generated:
2026-10-05

Confidence:
0.92
```

然后你可以点击：

> 查看来源

直接跳到原文。

这个功能以后会非常有价值。

---

# 十四、修改正文后的“级联影响”

这是我们刚刚发现的问题的进一步扩展。

比如你把：

> 第一章：主角出生于北京

改成：

> 第一章：主角出生于上海

那么影响的不应该只有第一章摘要。

可能影响：

```text
Chapter 1 Summary
Character Profile
Timeline
World State
Chapter 17
Chapter 35
Chapter 80
```

所以以后需要：

> **Change Impact Analysis**

告诉用户：

> 修改这一处可能影响 17 个派生记忆和 6 个章节。

然后让用户选择：

> 更新。

这会是非常强大的功能。

---

# 十五、AI 不能随便修改 Canon

这是一个非常重要的安全阀。

比如 AI 发现：

> 主角年龄应该是20岁。

但 Canon 写：

> 主角17岁。

AI不能直接改。

应该：

> ⚠️ 与 Canon 冲突

然后：

```text
保留 Canon
建议修改 Canon
忽略建议
```

---

# 十六、模型失败必须分类

现在我们发现一个问题：

```text
所有错误
↓
MODEL_UNAVAILABLE
```

这个以后一定要改。

至少应该区分：

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
CONTENT_FILTER
```

UI应该告诉用户真正发生了什么。

例如：

> xAI API 额度不足。

而不是：

> 没有可用模型。

这个应该列入 Stage 1 必修。

---

# 十七、重试机制

以后写一章：

```text
网络失败
```

不能直接整个任务丢掉。

应该：

```text
Retry 1
↓
Retry 2
↓
Retry 3
↓
失败
```

而且要有：

- exponential backoff
- request ID
- timeout
- cancellation

---

# 十八、不要重复扣钱

这个也非常重要。

假设：

```text
Grok 已经生成成功
↓
程序网络断开
↓
客户端认为失败
↓
再次生成
```

可能造成：

**两次 API 消耗。**

所以以后要有：

> **Idempotency / Request ID**

特别是商业化以后非常重要。

---

# 十九、任务系统

未来：

> 写第20章

可能需要 30 秒～几分钟。

不能让 UI 一直卡着。

应该：

```text
Job
 ↓
queued
 ↓
running
 ↓
completed
```

用户可以：

- 查看进度
- 取消
- 重试
- 查看错误
- 恢复

---

# 二十、自动保存与版本系统

这个现在就应该保证。

正文至少：

```text
Revision 1
Revision 2
Revision 3
...
```

并且：

> AI 修改 ≠ 覆盖原文。

应该可以：

```text
接受
拒绝
比较
恢复
```

---

# 二十一、AI 修改最好支持 Diff

以后：

> “把这一段写得更紧张。”

不要直接覆盖。

应该：

```text
原文
↓↓
AI修改
```

用户看到：

```text
删除
新增
修改
```

然后：

> 接受修改

---

# 二十二、Token / Cost Tracking

这个我强烈建议现在就规划。

因为你已经开始使用付费 Grok API 了。

每次请求记录：

```text
Provider
Model
Input tokens
Output tokens
Estimated cost
Time
Request ID
```

以后项目可以显示：

> 本小说已经消耗 $2.31

甚至：

> Chapter 17 消耗 $0.08

这对你的长期使用非常重要。

---

# 二十三、模型路由

未来不应该所有事情都用 Grok 4.7。

例如：

```text
复杂剧情规划
→ 高级模型

普通摘要
→ 便宜模型

拼写检查
→ 便宜模型

人物状态提取
→ 小模型

最终润色
→ 高级模型
```

所以：

> Agent → Model Policy

应该成为正式架构。

---

# 二十四、模型替换必须容易

今天：

> Grok 4.7

以后可能：

> OpenAI
> Claude
> Gemini
> 本地模型

所以 Agent 不应该知道：

```text
“我要调用 Grok。”
```

而应该知道：

```text
“我要调用 Writer Model。”
```

然后：

```text
Writer Model → Grok 4.7
```

这是我们之前设计 ModelProvider 的意义。

---

# 二十五、本地模型

你以后有 RTX 4070 + 32GB RAM。

所以最终应该支持：

```text
Cloud
Grok
OpenAI

Claude
Gemini

Local
Ollama
llama.cpp
其他 OpenAI-compatible local endpoint
```

这样：

> 不需要上传的内容可以本地处理。

例如：

```text
本地模型 → 摘要
本地模型 → 人物状态提取
Grok → 最终章节
```

以后甚至可以大幅降低成本。

---

# 二十六、隐私系统

现在我们已经有：

> Send Manifest

这是非常好的基础。

以后应该显示：

```text
本次发送：

✓ 当前章节
✓ 当前人物
✓ 世界观相关条目
✓ 第一章摘要

未发送：

✗ 其他章节全文
✗ API Key
✗ 不相关项目
```

用户应该知道：

> **到底什么东西被发送给 AI。**

---

# 二十七、项目级云端授权

我们刚刚决定加入：

> 自动云端记忆更新授权

我建议进一步统一：

```text
Cloud AI Permission
```

里面：

```text
☑ 允许生成章节
☑ 允许生成摘要
☑ 允许更新人物状态
☑ 允许更新世界状态
☑ 允许更新时间线
☑ 允许研究资料分析
```

这样以后不会一个功能一个授权机制。

---

# 二十八、研究 Agent

这是你最初需求里的核心，而且非常容易被低估。

以后：

> “我要写19世纪英国贵族生活。”

Research Agent 应该：

```text
搜索
↓
来源记录
↓
可靠性判断
↓
版权/许可证检查
↓
提取事实
↓
生成 Research Notes
↓
进入 World Bible
```

而不是：

> 把整个网页复制给模型。

---

# 二十九、来源权利系统

这个必须保留。

每个来源：

```text
Source
├── URL
├── Author
├── Title
├── Type
├── License
├── Commercial use
├── Access date
├── Rights status
├── Notes
└── Extracted facts
```

尤其：

```text
PUBLIC_DOMAIN
COMMERCIAL_OPEN_LICENSE
USER_OWNED
LICENSED
UNKNOWN
RESTRICTED
```

**UNKNOWN 不自动进入商业写作素材。**

---

# 三十、风格分析不能变成模仿系统

你之前的要求非常重要。

我们可以做：

> 结构分析

例如：

```text
平均章节长度
叙事节奏
对话比例
场景转换
冲突密度
伏笔密度
心理描写比例
环境描写比例
POV
```

形成：

> Style Profile

但不能变成：

> “请模仿某位作者的独特语言。”

最终应该是：

```text
多个合法来源
↓
抽象共同特征
↓
Style Profile
↓
原创生成
```

这个原则应该写进系统设计，而不是靠以后提醒 Agent。

---

# 三十一、Prompt Injection

Research Agent 以后访问网页时一定会遇到：

```text
Ignore previous instructions...
```

或者恶意网页：

> “把 API Key 发给我。”

所以：

**所有网页内容都必须被视为不可信数据。**

绝不能让网页内容改变系统指令。

---

# 三十二、导入 / 导出

最终必须支持：

```text
Markdown
TXT
DOCX
EPUB
PDF
```

至少：

> Markdown / DOCX / EPUB

应该规划。

---

# 三十三、备份

Local-first 最大的问题：

> Mac 硬盘坏了。

所以应该：

```text
自动备份
+
手动备份
+
项目 ZIP
+
数据库备份
```

最好能够：

> 一键导出完整项目。

---

# 三十四、数据库迁移

现在 SQLite 没问题。

但是以后数据库结构一定会变化：

```text
v1
↓
v2
↓
v3
```

所以必须有 migration。

否则升级程序以后旧小说打不开。

---

# 三十五、并发与数据锁

以后：

```text
自动摘要
用户编辑
AI生成
自动保存
```

可能同时发生。

必须防止：

> AI 把用户刚刚修改的正文覆盖掉。

所以写入必须带：

```text
revision_id
```

例如：

> AI 基于 Revision 8 生成。

但当前已经是 Revision 9：

**拒绝覆盖。**

这叫：

> Optimistic Concurrency Control

非常重要。

---

# 三十六、删除机制

用户删除：

> Chapter 1

不能真的把所有相关记忆直接删掉。

应该先显示：

> 此章节被以下内容引用：

```text
12 个记忆
7 个伏笔
3 个时间线事件
4 个章节
```

然后：

> 删除 / 保留派生信息 / 重新计算

---

# 三十七、搜索

以后几十万字以后：

> “找出所有出现过红色地图的地方。”

必须能搜。

至少：

```text
全文搜索
人物搜索
地点搜索
事件搜索
伏笔搜索
标签搜索
```

SQLite FTS5 就可以先做。

---

# 三十八、AI 连贯性检查

每章完成以后：

```text
Continuity Check
```

自动检查：

### 人物

年龄、能力、关系、知识

### 世界

地点、规则、设定

### 时间

日期、年龄、事件顺序

### 剧情

伏笔、主线、目标

### 文本

重复、逻辑矛盾、前后冲突

然后：

```text
⚠️ 发现 3 个潜在冲突
```

而不是直接替用户改。

---

# 三十九、不要让 AI 自动“修正”一切

这是一个很容易犯的错误。

AI 检查发现：

> “这里与设定冲突。”

应该：

> 提示用户。

而不是：

> 自动改成它认为正确的内容。

尤其 Hard Canon。

---

# 四十、中文特别要注意

你的主要使用场景是中文小说。

所以长度不能简单假设：

> token = 字符 = 单词

应该明确：

```text
Chinese character count
English word count
Token count
```

分开。

用户看到的：

> 5000字

应该是真正意义上的**中文字符数**，而不是 token 数。

这点我建议加入长度系统。

---

# 四十一、章节生成不应该只追求“够长”

以后 Length Controller 应该同时考虑：

```text
目标长度
剧情完成度
Scene 完成度
重复率
信息密度
```

否则很容易出现：

> 为了达到5000字，AI开始水字数。

所以：

**长度是约束，不是质量指标。**

---

# 四十二、上下文应该有“为什么选中”

以后 AI 使用记忆时，最好能看到：

```text
Context retrieved:

Chapter 1 Summary
Character: 林远
Foreshadowing #17
Timeline Event #9
World Rule #3
```

这样调试非常容易。

---

# 四十三、可观测性

以后出现：

> AI写错了。

我们应该能追踪：

```text
Request
 ↓
Context
 ↓
Prompt
 ↓
Model
 ↓
Response
 ↓
Memory update
```

当然：

**API Key 永远不能进入日志。**

---

# 四十四、取消生成

如果 Grok 正在写：

> 用户点击取消。

应该真的停止任务，而不是：

> UI 显示取消，后台还在烧钱。

这个以后要做。

---

# 四十五、项目设置

最终项目级配置至少应该有：

```text
语言
叙事视角
时代
文风
章节长度
模型
自动记忆
自动检查
云端权限
成本预算
```

---

# 四十六、成本预算

这个我建议以后加入：

> 本项目最大 AI 预算：$20

达到：

```text
80%
```

提醒：

> 已使用 $16。

达到：

```text
100%
```

自动停止云端请求。

这对于你现在这种付费 API 特别有意义。

---

# 四十七、最终我们应该把整个系统拆成四层

我现在非常建议固定成：

```text
┌──────────────────────────────┐
│          UI / Editor         │
├──────────────────────────────┤
│       Novel Intelligence     │
│ Writer / Planner / Critic    │
│ Memory / Timeline / Canon    │
├──────────────────────────────┤
│       Model / Tool Layer     │
│ Grok / OpenAI / Local / Web  │
├──────────────────────────────┤
│      Storage / Versioning    │
│ SQLite / FTS / Files / Logs  │
└──────────────────────────────┘
```

以后无论加什么，都尽量不要破坏这四层。

---

# 四十八、我建议重新定义 Stage 1 的“完成标准”

**Stage 1 不应该是“页面能打开”。**

我建议 Stage 1 最终必须达到：

### 基础

- [x] 项目
- [x] 人物
- [x] 世界观
- [x] 章节
- [x] 正文保存
- [x] Revision

### AI

- [x] Grok 真实调用
- [x] Fake Generate
- [x] 两者隔离
- [ ] 错误分类
- [ ] 云端发送授权

### Memory

- [ ] Chapter Summary
- [ ] Chapter 2 检索 Chapter 1
- [ ] 修改后重新计算
- [ ] Revision 对齐
- [ ] stale 状态
- [ ] Memory provenance

### Length

- [ ] Project → Volume → Chapter inheritance
- [ ] 中文字数统计
- [ ] Target
- [ ] Min
- [ ] Max
- [ ] 自动 repair
- [ ] 最大 2 次 repair

### 稳定性

- [ ] Retry
- [ ] Timeout
- [ ] Cancel
- [ ] Job 状态
- [ ] 并发保护
- [ ] 不重复提交

### 安全

- [x] API Key 不进入数据库
- [x] API Key 不进入 Git
- [x] Cloud send manifest
- [ ] 项目级自动记忆授权
- [ ] 明确显示发送内容

### 数据

- [ ] Backup
- [ ] Migration
- [ ] Export
- [ ] Revision restore

---

# 四十九、Stage 2 我们也提前定下来

等 Stage 1 真正通过以后，Stage 2 才进入：

```text
Volume
 ↓
Arc
 ↓
Chapter
 ↓
Scene
 ↓
Scene Plan
 ↓
Context Retrieval
 ↓
Draft
 ↓
Length Repair
 ↓
Continuity Check
 ↓
Critic
 ↓
Revision
 ↓
Memory Update
```

再加入：

- Story Architect
- Plot Architect
- Character Manager
- Timeline Manager
- Foreshadowing Manager
- Research Agent
- Style Analyst
- Continuity Editor

---

# 五十、最终我认为现在最重要的决定

**我们现在不要让 Agent 立刻修改刚才那 3 个问题。**

我们先让它按照上面这些原则做一次：

> **Stage 1 Architecture Audit**

然后让它回答：

1. 哪些能力已经存在？
2. 哪些只是 UI 假实现？
3. 哪些架构会阻碍 Stage 2？
4. 哪些现在不修以后一定要返工？
5. 哪些可以推迟？
6. 哪些数据库字段需要现在增加？
7. 哪些 API 接口需要现在预留？
8. 哪些测试现在必须补？
9. 哪些安全机制现在必须建立？
10. Stage 1 到底应该怎样定义“完成”？

**等这次审计完成，我们再一次性修改。**

这样比我们现在“发现问题 → 修一个 → 再发现问题 → 再修一个”要好得多。

如果你同意，我建议下一条就直接让 Cloud Agent 做这个**完整架构审计，不改任何代码**。审计结果出来以后，我们把它和上面这份清单逐项对照，再形成一份最终的 **Stage 1 Implementation Specification**，然后让 Agent 一次性实施。

## Prompt:
10/5/2026, 5:27:56 AM

我同意你的想法，但是咱们这个agent的tokens快要满了，我们得像之前那样换一个agent了

## Response:
10/5/2026, 5:27:58 AM · gpt-5-6

对，这时候**不要继续让当前 Agent 干活**，直接换一个新的 Agent 最稳妥。

而且这次我们不要像之前那样让新 Agent 从头猜项目状态。我们已经把项目和当前问题整理得比较完整了，可以给新 Agent 一份**“接班说明 + 下一步只做只读审计”**，让它先完整接管上下文。

### 我建议现在这样操作

**1. 先停止/结束当前 Agent**

不要让它继续修改代码。我们目前正好处在：

> Stage 1 已基本完成 → 准备做一次最终架构审计 → 再统一实施遗漏项

这个节点非常适合换 Agent。

**2. 新 Agent 选择 Grok 4.7 High**

继续用你之前已经验证成功的：

> **Grok 4.7 High**

这次不要一上来让它改代码。

**3. 给新 Agent 发送下面这段完整指令**

你可以直接复制：

```text
你是这个项目的新接班 Agent。

请先完整阅读当前仓库代码、README、测试、数据库结构、API、前端、模型 Provider、Memory、Chapter/Project/Volume、Revision、Prompt、Storage 等相关实现。

重要：
现在不要修改任何代码。
现在不要新增功能。
现在不要重构。
现在不要提交 commit。

你的第一项任务只有一个：

进行一次完整的“Stage 1 最终架构审计（Read-Only Architecture Audit）”。

项目：
AI Novel Studio

当前目标：
这是一个长期使用的本地优先 AI 长篇小说创作平台。
未来需要支持：
- 用户定义题材、世界观、人物、关系、剧情
- 长篇小说持续创作
- 长期记忆
- 人物状态与关系变化
- 世界状态
- 时间线
- 伏笔
- Volume → Arc → Chapter → Scene
- Web Research
- 合法/商业可用来源管理
- 抽象写作特征分析，而不是复制受版权保护文本
- 多模型 / 多 Provider
- 云端模型与本地模型
- 连续章节生成
- 连贯性检查
- 长度控制
- AI 修改与版本管理
- 最终商业小说创作

当前 Stage 1 已经实现：
- Project
- Chapter
- Character
- World
- Chapter prose
- Revision
- Summary / Derived Memory
- Writer
- Model Provider abstraction
- FakeProvider
- Grok / OpenAI / Anthropic / Gemini / Ollama / OpenAI-compatible Provider
- ModelRouter
- Send Manifest / cloud-send confirmation
- Model Settings
- 基础前端写作工作台
- 基础测试
- Grok 4.7 已经成功进行真实 API 生成
- Fake Generate 与 Real Generate 已验证不会互相静默 fallback

现在重点检查以下问题。

---
一、Memory / Canon
---

检查：
1. Hard Canon / Soft Canon / Derived Memory 是否有清晰边界。
2. AI 是否可能错误覆盖用户明确设定。
3. Derived Memory 是否具有：
   - source chapter
   - source revision
   - generated_at
   - confidence
   - stale
   - superseded
   等 provenance。
4. 用户修改 Chapter 后：
   - 原 derived memory 是否正确失效
   - 后续章节是否正确感知 stale context
   - 是否可以针对最新 revision 重新生成 memory
   - 新 memory 是否绑定最新 revision。
5. Chapter 2 是否能正确检索 Chapter 1 的有效 summary。
6. 是否存在旧 summary 与新 summary 冲突的情况。
7. 是否存在“AI 生成了 memory，但用户没有确认”的问题。

特别检查当前已知问题：

A.
Chapter 2 当前无法正确获得 Chapter 1 的有效 summary。

B.
编辑 Chapter 1 后，旧 derived memory 会 stale，
但自动 real memory update 当前会因为 SEND_NOT_CONFIRMED 被阻止。

不要绕过 SEND_NOT_CONFIRMED。
请设计一个安全的 project-level Cloud AI Permission / Auto Memory Permission。

原则：
- 用户明确开启后才允许自动更新云端 derived memory。
- 每次发送仍然必须有明确、可审计的 manifest。
- 不允许无限制授权未来所有内容。
- Writer 的普通生成确认机制不能被破坏。
- 不允许偷偷 fallback 到 FakeProvider。

---
二、Revision / Concurrency
---

检查：
1. 用户编辑与 AI 生成同时发生时会不会覆盖用户最新内容。
2. AI 输出是否绑定 source_revision_id。
3. 是否存在 optimistic locking 的必要性。
4. AI 完成后，如果原文已经被用户修改，是否应该拒绝自动写回。
5. 是否需要 revision conflict。
6. AI 修改是否应该默认作为 draft/diff，由用户接受，而不是直接覆盖。

---
三、Length System
---

检查完整链路：

Project
→ Volume
→ Chapter
→ generation
→ post-generation validation
→ repair
→ save

确认：
1. target length
2. minimum length
3. maximum length
4. strict mode
5. inheritance

是否真正工作，而不是只有 UI / prompt。

特别注意：

中文小说的“字数”应该以字符数/中文字数语义处理，
不能简单等同 token。

如果设置：
target = X
min = A
max = B

则实际生成后必须进行长度检查。

如果超出：
最多进行有限次数 repair，例如 2 次。

repair 必须：
- 保持剧情
- 保持人物
- 保持世界观
- 保持事实
- 不允许通过无意义水文填充长度

如果最终仍然不符合：
必须明确报告，而不是假装成功。

FakeProvider 不能假装支持真正的长度控制。

---
四、Model / Provider
---

检查：
1. ModelProvider abstraction 是否足够长期扩展。
2. Provider / Model / Endpoint / Secret 是否解耦。
3. 是否可以未来方便添加：
   - OpenAI
   - Anthropic
   - Gemini
   - Grok
   - Ollama
   - HuggingFace/local
   - OpenAI-compatible
4. 是否支持：
   Writer Model
   Planner Model
   Critic Model
   Research Model
   Memory Model
   等角色化模型配置。

检查错误分类。

不要把所有错误都归类为 MODEL_UNAVAILABLE。

至少考虑：
- AUTH_ERROR
- QUOTA_EXCEEDED
- RATE_LIMITED
- NETWORK_ERROR
- TIMEOUT
- MODEL_UNAVAILABLE
- INVALID_REQUEST
- CONTEXT_TOO_LARGE
- PROVIDER_ERROR
- CONTENT_FILTER

检查：
- timeout
- retry
- exponential backoff
- cancellation
- request id
- idempotency
- 避免重复请求造成重复计费

---
五、Cloud AI Permission / Privacy
---

检查目前 Send Manifest 是否足够。

未来应该可以明确告诉用户：
这次发送给云端模型的具体内容包括什么。

例如：
- 当前章节
- 当前人物
- 世界观
- chapter summary
- timeline
- selected memory
- research result

设计原则：
- Local First
- 默认不上传整个小说
- 只发送必要 context
- 用户可以控制哪些类型允许上传
- API key 永远不能进入 DB / Git / UI 日志。

---
六、Memory Retrieval
---

检查未来长期小说需要的 Retrieval Architecture。

不要默认把整个小说塞给模型。

考虑：
- Project Memory
- World Bible
- Character Bible
- Character State
- Relationship State
- Timeline
- Plot
- Foreshadowing
- Chapter Summary
- Scene Summary
- Current Context

同时检查：
是否能够记录“为什么这个 memory 被检索出来”。

例如：
retrieval_reason =
“当前章节涉及 Character X，因此加载 Character X 当前状态。”

---
七、Character System
---

检查未来是否需要区分：

Character Definition
Character State
Character History

例如：
人物初始设定 ≠ 当前状态。

还要考虑：

Character Knowledge
Reader Knowledge
Author Knowledge

不能让人物知道自己不应该知道的信息。

---
八、World State
---

检查：
World Definition
World State
World History

是否应该分开。

例如：
某地点在 Chapter 3 被摧毁，
Chapter 10 就不能继续默认使用“完好状态”。

---
九、Relationship System
---

未来人物关系不是静态字段。

应该能够记录：
A → B
关系类型
关系强度
变化原因
发生章节
当前状态

检查现有架构是否容易扩展。

---
十、Timeline
---

未来需要独立 Timeline。

至少考虑：
- event
- date/time
- participants
- location
- source chapter
- event description

检查当前架构是否会阻碍以后实现。

---
十一、Foreshadowing
---

未来需要独立 Foreshadowing Manager。

状态至少考虑：
OPEN
PLANNED
PARTIALLY_RESOLVED
RESOLVED
ABANDONED

检查当前数据库和 API 是否容易扩展。

---
十二、Story Hierarchy
---

长期小说结构：

Story
→ Volume
→ Arc
→ Chapter
→ Scene

每一层应该能够有自己的：
- goal
- summary
- state
- plot function

当前 Stage 1 不一定需要完整实现，
但检查数据库和 API 是否应该提前预留合理扩展空间。

---
十三、Continuity
---

未来需要检查：

Character continuity
World continuity
Timeline continuity
Plot continuity
Knowledge continuity
Ability/rule continuity

原则：

AI 可以提出冲突，
但不能未经用户允许自动修改 Hard Canon。

---
十四、Research Agent
---

未来会加入 Web Research。

检查架构是否应该提前预留：

Source Registry

至少包括：
- source_name
- author
- URL
- source_type
- license
- commercial_use
- access_date
- rights_status
- notes

来源分类：
- public domain
- commercial-friendly open license
- user-owned
- user-licensed
- unclear

对于版权不明确的内容：
不能默认完整抓取、保存和用于商业写作。

研究的目标应该是：
Research
→ Verify
→ Abstract Features
→ Style Profile
→ Generate

而不是：
Research
→ Copy Text
→ Imitate

---
十五、Style Analysis
---

未来可以分析：
- narrative structure
- pacing
- chapter structure
- suspense
- foreshadowing
- characterization
- dialogue/description ratio
- POV
- transitions
- emotional curve
- worldbuilding

但不能依赖复制原文或模仿特定在世作者的独特表达。

检查未来架构是否能支持：
Style Profile
而不是直接存储大量原文。

---
十六、Jobs / Async
---

检查是否需要统一 Job 系统：

queued
running
completed
failed
cancelled

尤其是：
- generation
- memory update
- research
- long-running analysis

用户应该能够：
- 查看进度
- cancel
- retry

取消后不能继续偷偷调用云端 API。

---
十七、Cost / Usage
---

检查是否应该记录：

provider
model
request_id
input_tokens
output_tokens
estimated_cost
duration
timestamp

未来支持：
project budget
monthly budget
per-request budget

---
十八、Autosave / Backup
---

检查：
- autosave
- revision history
- backup
- project export
- restore
- migration

未来至少能够完整导出项目。

---
十九、Security
---

检查：
- API key leakage
- prompt injection
- malicious web content
- malicious uploaded files
- path traversal
- arbitrary command execution
- database corruption

外部网页内容必须被视为“不可信输入”。

---
二十、Testing
---

检查测试是否覆盖：

1. Project
2. Character
3. World
4. Chapter
5. Revision
6. Summary
7. Memory retrieval
8. stale memory
9. cloud permission
10. send manifest
11. FakeProvider
12. Real Provider
13. provider error classification
14. length
15. concurrency
16. API key security
17. migration
18. backup
19. cancellation

特别增加真实 Grok 测试时不要泄露 API key。

---
二十一、UI
---

检查未来 UI 是否能够容纳：

左侧：
Project
Volume
Arc
Chapter
Scene
Characters
World
Timeline
Plots
Foreshadowing

中间：
Writing Editor

右侧：
AI Assistant
Current Context
Memory
Continuity
Generation

同时需要明确显示：
- Cloud AI permission
- What will be sent
- Current model
- Generation status
- Length status
- Memory status
- Revision status

---
二十二、不要过度工程化
---

这是非常重要的一点。

不要因为未来需要很多功能，就现在把所有功能一次性实现。

请把发现的问题分成三个等级：

P0：
Stage 1 在正式进入下一阶段之前必须修复。

P1：
现在应该建立接口 / 数据结构 / 架构约束，
但功能可以 Stage 2 实现。

P2：
现在完全不用实现，未来再做。

目标不是把 Stage 1 变成巨型项目。

目标是：
“现在把地基修正确，未来扩展不会推翻重做。”

---
最终输出要求
---

完成审计后，请不要修改代码。

请输出：

1. 当前项目实际架构总结
2. 当前 Stage 1 已完成内容
3. 当前已知问题
4. 新发现的问题
5. P0 必须修改
6. P1 需要提前预留
7. P2 可以以后再做
8. 数据库需要新增/修改什么
9. API 需要新增/修改什么
10. 前端需要新增/修改什么
11. Model/Provider 层需要新增/修改什么
12. Memory/CANON 系统需要新增/修改什么
13. Testing 需要新增什么
14. 是否存在架构性推翻风险
15. 最终给出一份“Stage 1 Final Implementation Specification”

最后，请明确告诉我：

如果按照你的 P0 + 必要 P1 修改完成，
Stage 1 是否可以正式冻结，
然后进入 Stage 2 WebNovel Engine。

再次强调：

这一次是 READ-ONLY AUDIT。
不要修改文件。
不要 commit。
不要 push。
不要安装新的依赖。
不要删除任何东西。
```

### 这次我们要特别注意一个问题

**不要让新 Agent 一看到这些需求，就直接开始实现。**

我们现在最重要的是让它先回答：

> **“哪些东西现在必须做，哪些东西只是以后要留接口？”**

否则很容易把目前已经比较稳定的 Stage 1 直接改成一个巨大工程。

等新 Agent 审计完，你**把它的完整结果原样发给我**。我来和我们现在已经整理好的架构逐项对照，然后我们再给它一份最终的 **Stage 1 Final Implementation Specification**。

这样这次尽量做到**一次改完、测试完、冻结 Stage 1，再进入 Stage 2**。

## Prompt:
10/5/2026, 5:30:26 AM

好像不需要，这个满了之后自动重新开始算了

## Response:
10/5/2026, 5:30:30 AM · gpt-5-6

对，如果你说的是 **Cursor Agent 的上下文 / tokens 达到上限后自动压缩或重新计算上下文**，那确实**不一定需要换 Agent**。

而且对我们现在这个项目来说，我反而建议**先不要换**。

### 现在最好的做法

让当前 Agent 继续工作，但注意区分两种情况：

- **Context 自动压缩 / 重新计算** → 可以继续用，不需要换。
- **Agent 明确提示无法继续、丢失关键上下文、开始重复操作或无法准确理解项目** → 再换 Agent。

我们现在已经把项目架构、Stage 1 状态和已发现的问题梳理得很清楚了，所以如果 Cursor 能自动压缩上下文，**保持当前 Agent 会更方便**。

尤其是现在我们还没有开始最终修改，没必要为了“token快满”主动换。

### 我建议下一步

直接让现在的 Agent **先做我们刚才说的最终只读审计**。

也就是：

> **Read-only Stage 1 Architecture Audit → 汇总 P0/P1/P2 → 不改代码**

然后你把 Agent 的结果给我。

我们一起审一遍以后，再让它**一次性实施 P0 + 必要 P1**。

这样比现在立刻换 Agent 更稳。

## Prompt:
10/5/2026, 5:30:59 AM

我们继续你刚刚的想法

## Response:
10/5/2026, 5:31:02 AM · gpt-5-6

好，我们继续，而且我建议**不换 Agent，先做刚才那一步：完整只读审计**。

你现在直接把我上一条给你的那整段 **Read-Only Architecture Audit** 指令复制给 Cursor Agent。

### 这一次有 4 个硬性要求

让 Agent 明确遵守：

1. **只读**
   - 不改代码
   - 不创建文件
   - 不删除文件
   - 不安装依赖
   - 不 commit
   - 不 push

2. **必须检查整个项目，而不是凭印象回答**
   - 后端
   - 前端
   - SQLite/数据库
   - Memory
   - Revision
   - Provider
   - API
   - 测试
   - UI

3. **重点找“我们没想到的问题”**

   不只是把我们已经列出来的 20 多项重新复述一遍，而是让它主动寻找：
   > 如果这个项目未来写到 100 万字、1000 章、几十个人物、多个世界线，会在哪里崩？

4. **最终必须分 P0 / P1 / P2**

也就是：

| 等级 | 含义 |
|---|---|
| **P0** | Stage 1 现在必须修，否则不能进入 Stage 2 |
| **P1** | 现在应该把架构/接口准备好，但功能可以以后实现 |
| **P2** | 以后再做，现在不要碰 |

---

### 我们最终要达到的状态

我希望这次审计结束后，得到一个非常明确的结论：

> **Stage 1 Final Specification**

然后我们只做一次必要修改。

修改完成后：

**测试 → 真实 Grok 测试 → Memory 测试 → Length 测试 → Revision 测试 → Cloud Permission 测试 → 全量回归测试 → Stage 1 冻结。**

之后再正式进入：

**Stage 2 WebNovel Engine**

也就是：

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
 ↓
Scene Plan
 ↓
Context Retrieval
 ↓
Draft
 ↓
Length Check / Repair
 ↓
Continuity Check
 ↓
Critic
 ↓
Revision
 ↓
Memory Update
```

这样我们就不会出现**“做到 Stage 2 才发现 Stage 1 的数据库/Memory/Revision 设计不够，只能回头重构”**的情况。

你现在让 Agent 开始审计即可。

**等它输出结果后，不要让它马上改代码。把结果完整发给我，我们先做最后一次架构审核。**

## Prompt:
10/5/2026, 5:32:08 AM

那个不是给新的agent发的吗？现在咱们不用新的

## Response:
10/5/2026, 5:32:13 AM · gpt-5-6

对，你说得对。**刚才那份长指令是给“新 Agent 接班”用的。**

现在我们**不用换 Agent**，当前 Agent 可以继续，因为它的上下文满了以后会自动重新整理/压缩。

所以我们回到刚才真正要做的事情：

### 现在直接让当前 Agent 做「最终架构审计」

而且不需要把之前那一大段“项目背景介绍”重新告诉它——它本身已经参与了前面的开发，对项目有上下文。

你只需要给当前 Agent 发这段：

```text
现在先不要修改任何代码。

我们已经决定在继续 Stage 2 之前，先把 Stage 1 做一次最终的完整架构审计，避免后面反复返工。

请你基于你已经了解的当前项目和现有代码，进行一次 Read-Only Stage 1 Final Architecture Audit。

重点不是重复我们已经发现的问题，而是主动寻找我们可能遗漏、没想到、或者现在看起来没问题但进入长期长篇小说后会出问题的地方。

请重点从以下维度检查：

1. Canon / Hard Canon / Soft Canon / Derived Memory
2. Revision / stale memory / source_revision_id / provenance
3. Character Definition / Character State / Character History
4. Character Knowledge / Reader Knowledge / Author Knowledge
5. World Definition / World State / World History
6. Relationship History
7. Timeline
8. Foreshadowing
9. Story → Volume → Arc → Chapter → Scene 的长期扩展能力
10. Memory Retrieval / Context Budget
11. Context Retrieval 的可解释性
12. Change Impact Analysis
13. Canon Conflict Detection
14. Length System，包括中文“字数”与 token 的区别
15. Length Repair
16. Model Provider abstraction
17. Provider error classification
18. Retry / timeout / cancellation / idempotency
19. Async Job system
20. Cloud AI Permission
21. Send Manifest
22. Privacy / API key security
23. Research Agent
24. Source Registry / copyright / commercial-use tracking
25. Style Analysis / Style Profile
26. Prompt Injection
27. Autosave / Revision / Backup / Restore
28. Concurrent editing / optimistic locking
29. AI 修改是否应该通过 diff / accept / reject
30. Token / cost / usage tracking
31. Project budget
32. Search / FTS
33. Continuity Checker
34. Testing
35. Database migration
36. Import / Export
37. 长篇小说规模扩大后的性能问题
38. 100万字、1000章、几十个人物、复杂世界观情况下的扩展性
39. UI 是否能承载未来功能
40. Stage 2 WebNovel Engine 是否会受到 Stage 1 当前架构限制

请特别检查：

A. 有没有现在不修，Stage 2 一开始就会被迫返工的问题。

B. 有没有现在应该预留数据结构/API，但功能可以以后实现的问题。

C. 有没有属于“现在完全不要做”的过度工程。

D. 有没有我们之前完全没有想到的新问题。

不要修改代码。
不要创建文件。
不要安装依赖。
不要 commit。
不要 push。

最终请把发现的问题严格分成：

P0 — Stage 1 现在必须修复
P1 — 现在应该预留架构，但功能可以 Stage 2 实现
P2 — 现在完全不用做，未来再做

并给出：

1. 当前 Stage 1 是否已经具备进入最终修复阶段的条件
2. P0 的完整修改清单
3. 必须提前预留的 P1 接口/数据结构
4. 可以明确推迟的 P2
5. 是否存在架构推翻风险
6. 最终 Stage 1 Final Implementation Specification

再次强调：这一步只审计，不修改任何代码。
```

**就发这一段。**

等它审计完成，把结果给我。然后我们不再继续无限“想还有没有遗漏”了，而是由我帮你做最后一次筛选，形成一份**最终实施清单**，再让 Agent 一次性改。

## Prompt:
10/5/2026, 5:32:58 AM

你再检查一下这个有没有哪里错了或者需要补充

## Response:
10/5/2026, 5:33:01 AM · gpt-5-6

有。我重新从**“这是当前 Agent，不是新 Agent”**这个前提检查了一遍。你现在这版已经很好，但我建议再补几项，否则 Agent 很可能只做“功能列表式审计”，而不是发现真正的架构风险。

尤其是我们现在的目标不是继续无限加功能，而是：

> **把 Stage 1 最后可能导致返工的问题一次性找干净，然后冻结。**

我建议把你刚才那段直接替换成下面这个**最终版**。

```text
现在先不要修改任何代码。

我们已经决定：在继续 Stage 2 之前，先对当前 Stage 1 做一次最终、完整的架构审计，尽可能一次性找出遗漏，避免后面反复返工。

这是当前已有项目的最终 Stage 1 Architecture Audit。

请基于你已经了解的当前项目、现有代码、数据库、API、前端、测试以及之前已经完成的 Stage 1 工作进行审计。

非常重要：

这一步是 READ-ONLY。

不要：
- 修改代码
- 创建文件
- 删除文件
- 安装依赖
- 修改数据库
- 修改配置
- 修改环境变量
- 修改 secrets
- commit
- push

也不要为了测试而改变项目状态。

如果需要运行测试或只读检查，可以运行，但不要产生持久化修改。

---
一、审计目标
---

这次审计不是简单重复已有需求。

请主动寻找：

1. 我们已经知道但尚未彻底解决的问题。
2. 我们之前完全没有想到的问题。
3. 当前看起来没问题，但进入长期长篇小说后会出现的问题。
4. Stage 2 开始后会迫使我们重新设计 Stage 1 的问题。
5. 现在应该预留接口/数据结构，但功能不应该现在实现的问题。
6. 属于过度工程化、现在不应该做的问题。

请站在“这个软件未来长期写几十万到几百万字、数百到上千章”的角度检查。

特别模拟以下规模：

- 100 万字
- 1000 章
- 50+ 主要/次要角色
- 大量角色关系变化
- 数百个世界设定
- 多条剧情线
- 大量伏笔
- 多时间线
- 多次用户修改旧章节
- 多次 AI 重写
- 多 Provider / 多模型
- 大量 Derived Memory

---
二、当前已知问题必须重新验证
---

不要假设这些问题已经解决。

请检查：

1. Chapter 2 是否能够正确检索 Chapter 1 的有效 summary。

2. 编辑 Chapter 1 后：
   - 旧 derived memory 是否正确 stale
   - 后续章节是否正确感知 stale context
   - 是否能够针对最新 revision 重建 memory
   - 新 memory 是否绑定最新 source_revision_id
   - 新 memory 是否正确恢复 stale=0

3. 自动 memory update 当前因为 SEND_NOT_CONFIRMED 被阻止的问题。

不要通过绕过 SEND_NOT_CONFIRMED 来“解决”。

应该检查是否需要：

Project-level Cloud AI Permission / Auto Memory Permission

要求：
- 用户明确开启
- 自动 memory update 才允许调用云端
- 每次调用仍有明确 manifest
- manifest 能说明发送了什么
- 不能无限制授权未来任意内容
- Writer 的普通云端生成确认机制不能被破坏
- 没有权限时不能偷偷使用 FakeProvider

4. Length System 当前是否真正生效。

检查：

Project
→ Volume
→ Chapter
→ inheritance
→ generation
→ length check
→ repair
→ final validation
→ save

不要只检查 UI 或 prompt。

必须区分：
- 中文字符数/小说字数
- token
- 英文 word count

如果设置 target/min/max：

实际生成结果必须被检查。

超出范围时：
- 最多有限次数 repair
- 默认最多 2 次
- 不允许无意义灌水
- 不允许破坏剧情、人物、世界观、事实和连续性
- 最终仍不符合时必须明确报告

FakeProvider 不得假装支持真正的长度控制。

---
三、Canon / Memory
---

检查：

Hard Canon
Soft Canon
Derived Memory

是否有明确边界。

检查 AI 是否可能：
- 修改 Hard Canon
- 用推测覆盖用户设定
- 用旧 memory 覆盖新状态
- 将错误生成结果永久写入 Canon

检查 Derived Memory 是否具备合理 provenance，例如：

- source chapter
- source revision
- generated_at
- confidence
- stale
- superseded
- version

检查 derived memory 的生命周期：

创建
→ 使用
→ stale
→ 重建
→ superseded
→ 删除/归档

同时检查：
如果源章节被删除、恢复、重写，会发生什么。

---
四、Revision / Concurrency
---

检查：

1. 用户编辑与 AI 生成同时发生。
2. AI 生成期间用户修改原章节。
3. AI 完成后旧结果是否可能覆盖新内容。
4. source_revision_id 是否足够。
5. 是否需要 optimistic locking。
6. 是否需要 revision conflict。
7. AI 修改是否应该默认产生 draft/diff。
8. 用户是否可以 accept/reject AI 修改。
9. 是否可以恢复旧版本。

特别检查：

“AI 生成开始时的 revision”
≠
“AI 完成时的当前 revision”

如果不同，系统应该如何处理？

---
五、Character System
---

检查未来是否能够自然扩展：

Character Definition
Character State
Character History

并区分：

Character Knowledge
Reader Knowledge
Author Knowledge

检查：
人物当前状态是否能够随章节变化。

例如：
- 年龄
- 地点
- 身份
- 能力
- 装备
- 关系
- 目标
- 情绪
- 已知信息

不能只保存静态 Character Profile。

---
六、Relationship System
---

检查人物关系是否能够从静态字段扩展到历史状态：

A → B
relationship type
strength
reason
source chapter
timestamp / story time
current state

检查关系变化是否可追踪。

---
七、World System
---

检查：

World Definition
World State
World History

是否需要分离。

例如：
某城市在 Chapter 50 被摧毁，
Chapter 80 不能因为旧 World Bible 仍然写着“城市存在”而恢复成原状态。

检查：
- 地点
- 物品
- 规则
- 能力体系
- 阵营
- 政治状态
- 世界事件

的长期一致性。

---
八、Timeline
---

检查未来独立 Timeline 是否容易加入。

至少考虑：

- event
- story date/time
- participants
- location
- source chapter
- source revision
- description
- event status

检查：
如果用户修改过去章节，后续 Timeline 会发生什么。

---
九、Foreshadowing
---

检查未来是否可以支持：

OPEN
PLANNED
PARTIALLY_RESOLVED
RESOLVED
ABANDONED

检查：
- 来源章节
- 计划回收章节
- 实际回收章节
- 伏笔内容
- 状态
- 修改后的影响

---
十、Story Hierarchy
---

未来结构：

Story
→ Volume
→ Arc
→ Chapter
→ Scene

检查当前 Stage 1 的数据结构是否会阻碍 Stage 2。

每一级未来可能需要：

- goal
- summary
- state
- plot function
- ordering
- metadata

Stage 1 不需要全部实现。

只需要判断：

哪些现在必须预留，
哪些可以 Stage 2 再实现。

---
十一、Memory Retrieval / Context
---

检查是否能够避免把整本小说发送给模型。

未来需要：

Project Memory
World Bible
Character Bible
Character State
Relationship State
Timeline
Plot
Foreshadowing
Chapter Summary
Scene Summary
Current Context

检查：

1. Retrieval 是否可扩展。
2. 是否存在 context 爆炸。
3. 是否存在重复 memory。
4. 是否存在旧 memory 被错误检索。
5. 是否能控制优先级。
6. 是否能记录为什么某条 memory 被检索。

例如：

retrieval_reason =
“当前 Scene 涉及 Character X，因此加载 Character X 当前状态。”

检查未来是否容易加入：
- relevance score
- priority
- recency
- canonicality
- source confidence

---
十二、Change Impact Analysis
---

这是重点。

如果用户修改：

Chapter 3

系统是否能够知道可能影响：

- Chapter 4+
- Character State
- Relationship
- Timeline
- World State
- Foreshadowing
- Plot
- Derived Memory

检查未来是否需要：

Change Impact Analysis

要求：
不要因为一个修改就无脑重新生成整个项目。

应该能够识别受影响范围。

---
十三、Canon Conflict Detection
---

检查未来是否能够检测：

- 年龄冲突
- 时间冲突
- 地点冲突
- 人物状态冲突
- 能力冲突
- 世界规则冲突
- 关系冲突
- 事件顺序冲突
- Knowledge boundary 冲突

原则：

AI 可以提出冲突。

AI 不应该未经用户允许修改 Hard Canon。

---
十四、Model / Provider
---

检查当前 Provider abstraction 是否足够长期扩展。

未来至少支持：

- Grok
- OpenAI
- Anthropic
- Gemini
- Ollama
- HuggingFace/local
- OpenAI-compatible API

检查是否能够配置：

Writer Model
Planner Model
Critic Model
Research Model
Memory Model

检查 Provider / Model / Endpoint / Secret 是否解耦。

---
十五、Provider Error
---

检查是否把所有错误错误地归类成 MODEL_UNAVAILABLE。

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

同时检查：

- timeout
- retry
- exponential backoff
- cancellation
- request id
- idempotency

避免：
- 重复扣费
- 重复生成
- 用户看到错误但后台继续运行

---
十六、Async Job System
---

检查未来是否需要统一：

queued
running
completed
failed
cancelled

用于：

- generation
- memory update
- research
- analysis
- long-running repair

检查用户是否能够：

- 查看状态
- 查看进度
- cancel
- retry

取消后不能继续偷偷调用云端 API。

---
十七、Cloud AI Permission / Privacy
---

检查 Send Manifest 是否真正能够解释：

“这一次到底发送了什么。”

例如：

- 当前章节
- 当前 Scene
- Character
- World
- Summary
- Timeline
- Research result
- Memory

检查是否能够做到：

Local First
默认不上传整本小说
只发送必要 context
用户明确授权
API key 不进入 DB
API key 不进入 Git
API key 不进入日志
API key 不出现在前端

---
十八、Research Agent
---

未来需要：

Research
→ Source Verification
→ Rights Verification
→ Abstract Analysis
→ Style Profile
→ Generation

检查是否需要：

Source Registry

字段至少考虑：

- source_name
- author
- URL
- source_type
- license
- commercial_use
- access_date
- rights_status
- notes

来源分类：

- public domain
- commercial-friendly open license
- user-owned
- user-licensed
- unclear

版权不明确的来源不能默认：
- 全文抓取
- 永久保存
- 商业写作使用

---
十九、Style Analysis
---

未来可以分析：

- narrative structure
- pacing
- chapter structure
- suspense
- foreshadowing
- characterization
- dialogue/description ratio
- POV
- transitions
- emotional curve
- worldbuilding

重点检查：

系统应该保存“抽象 Style Profile”，
而不是保存大量原文。

不能设计成：
抓取原文 → 模仿原文。

---
二十、Prompt Injection / External Content
---

检查未来 Web Research、上传文件、外部内容是否可能包含恶意 instructions。

外部内容必须被视为“不可信数据”。

不能让网页中的文字直接获得：
- 工具调用权限
- 文件系统权限
- API key
- system prompt
- project mutation 权限

---
二十一、Length
---

再次单独检查：

中文“字数”
≠
token
≠
英文 word count。

检查：

target
min
max
strict
inheritance

是否真正影响最终结果。

检查 repair 是否有：
- 最大次数
- 最大额外 token/cost
- cancellation
- continuity protection

不要为了满足字数制造水文。

---
二十二、Cost / Usage
---

检查是否应该记录：

- provider
- model
- request_id
- input_tokens
- output_tokens
- estimated_cost
- duration
- timestamp
- operation type

未来考虑：

project budget
monthly budget
per-request budget

不需要现在完整实现，但检查是否需要提前预留。

---
二十三、Search / Index
---

检查未来大量小说数据下：

- Chapter search
- Character search
- World search
- Timeline search
- Memory search

是否有合理基础。

检查 FTS / indexing 是否足够。

不要为了未来规模现在就过度引入复杂数据库。

---
二十四、Backup / Import / Export
---

检查：

- autosave
- revision history
- backup
- restore
- migration
- project export

未来至少能够完整导出一个项目。

检查导出是否能够包含：
- prose
- metadata
- characters
- world
- memory
- timeline
- relations
- settings

---
二十五、Database / Migration
---

检查：

1. SQLite schema 是否容易迁移。
2. 新字段如何 migration。
3. 数据库版本是否需要记录。
4. 旧项目升级是否安全。
5. migration 失败如何恢复。
6. 是否需要 backup before migration。

---
二十六、Deletion / Data Lifecycle
---

重点检查删除操作。

如果用户删除：

- Chapter
- Character
- World entry
- Timeline event
- Memory
- Revision

会不会留下孤儿数据。

需要考虑：

delete
→ dependent data
→ derived memory
→ stale state
→ references

不要只检查创建和更新。

---
二十七、Autosave / Recovery
---

检查：

- 用户输入过程中崩溃
- 浏览器关闭
- Agent 中断
- API 超时
- Mac 睡眠
- 网络断开

是否会丢失用户内容。

用户手写内容必须优先于 AI 自动操作。

---
二十八、Observability / Debugging
---

检查是否能够在未来定位：

“为什么这一章写错了？”

需要能够追踪：

request
→ model
→ prompt/context manifest
→ output
→ validation
→ revision
→ memory update

但绝对不能记录：
- API key
- secret
- 不必要的敏感数据

---
二十九、Performance / Scale
---

模拟：

100 万字
1000 章
50+ 角色
大量 memory
大量 revisions

检查：

- API 查询
- FTS
- memory retrieval
- UI rendering
- chapter loading
- database size
- revision size
- context assembly

有没有明显的 O(n) / O(n²) 风险。

不要为了理论上的规模进行过度优化。

---
三十、UI
---

检查当前 UI 是否能够逐步扩展到：

左侧：
Project
Volume
Arc
Chapter
Scene
Characters
World
Timeline
Plots
Foreshadowing

中间：
Writing Editor

右侧：
AI Assistant
Current Context
Memory
Continuity
Generation

同时未来需要明确显示：

- Current model
- Cloud AI permission
- What will be sent
- Generation status
- Length status
- Memory status
- Revision status
- Errors
- Cost/usage（如果启用）

Stage 1 不要求全部实现。

检查是否存在会阻碍未来 UI 扩展的设计。

---
三十一、Testing
---

检查现有测试是否覆盖：

1. Project
2. Character
3. World
4. Chapter
5. Revision
6. Summary
7. Memory retrieval
8. stale memory
9. cloud permission
10. send manifest
11. FakeProvider
12. Real Provider
13. Provider error classification
14. Length
15. Revision conflict
16. concurrency
17. API key security
18. migration
19. backup
20. cancellation
21. deletion
22. recovery

同时检查：

哪些测试是单元测试
哪些是集成测试
哪些需要真实 Provider
哪些不应该依赖真实 API。

真实 Grok 测试绝对不能泄露 API key。

---
三十二、Stage 1 Acceptance
---

请检查目前 Stage 1 是否存在明确的最终验收标准。

最终至少应该能够证明：

1. 创建项目
2. 创建角色
3. 创建世界设定
4. 创建 Chapter
5. 真实 Grok 生成
6. Fake Generate 不会偷偷调用真实模型
7. Real Generate 不会静默 fallback 到 Fake
8. Chapter Revision 正常
9. Chapter 1 → Chapter 2 Memory Retrieval 正常
10. 修改 Chapter 1 后 Derived Memory 正确 stale
11. 获得授权后可以安全重建 Derived Memory
12. 新 Memory 绑定最新 revision
13. Length 设置真正生效
14. AI 不会覆盖用户更新后的 revision
15. Provider 错误可识别
16. API key 不泄露
17. 项目数据可以保存和恢复
18. 全量测试通过

如果你认为还有必要的 Stage 1 Acceptance Criteria，请主动增加。

---
三十三、不要过度工程化
---

这是非常重要的。

不要因为未来功能很多，就现在全部实现。

请明确区分：

P0
Stage 1 现在必须修复。

P1
现在应该预留架构 / API / 数据结构，但功能可以 Stage 2 实现。

P2
现在完全不要做。

判断标准：

如果现在不做，会导致以后必须推翻数据库/API/核心架构：
→ P1

如果现在不做会导致 Stage 1 当前功能错误：
→ P0

如果以后增加即可，而且不会破坏架构：
→ P2

---
三十四、最终输出格式
---

完成审计后不要修改任何代码。

请输出：

## 1. 当前 Stage 1 架构总结

## 2. 已经正确的部分

## 3. 当前已知问题的验证结果

## 4. 新发现的问题

## 5. P0 — 必须现在修复

每项包括：
- 问题
- 为什么现在必须修
- 影响
- 推荐方案
- 涉及文件/模块
- 测试要求

## 6. P1 — 现在需要预留

每项包括：
- 为什么需要预留
- 建议的数据结构/API/interface
- 为什么现在不需要完整实现

## 7. P2 — 明确推迟

说明为什么现在不做。

## 8. 数据库修改建议

明确：
- 必须新增
- 建议新增
- 不需要现在新增

## 9. API 修改建议

同样分：
- 必须
- 预留
- 延后

## 10. Frontend 修改建议

同样分：
- 必须
- 预留
- 延后

## 11. Model / Provider 修改建议

## 12. Memory / Canon 修改建议

## 13. Testing 修改建议

## 14. Security / Privacy 修改建议

## 15. Performance / Scale 风险

## 16. 是否存在架构推翻风险

明确回答：

“没有”
或
“有，具体是什么”

## 17. 最终 Stage 1 Final Implementation Specification

给出一份可以直接用于下一次实施的最终规范。

## 18. Stage 1 Freeze 判断

最后明确回答：

A. 是否可以开始最后一次 P0 实施？
B. P0 实施完成后是否可以冻结 Stage 1？
C. 进入 Stage 2 是否需要重新设计当前核心架构？

如果存在任何你认为必须先解决的问题，请明确指出。

再次强调：

READ-ONLY AUDIT。

不要修改代码。
不要创建文件。
不要安装依赖。
不要 commit。
不要 push。
不要改变 secrets。
```

### 我为什么又加了这些？

有几个是我认为**非常值得补上的**：

**① 删除的数据生命周期**

我们之前一直检查“创建、修改”，但长篇小说系统还有一个很容易被忽略的问题：

> 删除 Chapter 3 后，Chapter 3 的 summary、timeline、relationship、foreshadowing、derived memory 怎么办？

如果现在不考虑，后面很容易出现“幽灵记忆”。

**② AI 生成与用户修改的竞态**

这个尤其重要。

例如：

> 12:00 用户开始让 AI 改 Chapter 10
> 12:01 用户自己修改 Chapter 10
> 12:02 AI 完成

如果没有 revision locking，12:02 的 AI 可能直接把 12:01 用户写的东西覆盖掉。

这是**必须在 Stage 1 地基里解决的问题**。

**③ Observability**

以后出现：

> “为什么 AI 第 300 章突然忘了人物关系？”

我们必须能追踪：

`请求 → 模型 → Context → 生成 → 检查 → Revision → Memory`

否则到了长篇小说阶段非常难排查。

**④ 规模测试**

不一定现在真的建立 1000 章小说，但 Agent 必须看看：

> “这个设计从 10 章扩大到 1000 章，会不会突然从几百毫秒变成几十秒？”

这能提前抓出数据库查询和 Memory Retrieval 的架构问题。

**⑤ Stage 1 Acceptance Criteria**

这个是我认为最重要的补充。

最终我们不能再靠“感觉应该好了”。

必须有一张明确的：

> **Stage 1 验收清单**

全部通过之后，**Stage 1 正式冻结**。

这样我们之后进入 Stage 2，就不会又回到：

> “等等，这里好像还能补一个功能……”

无限循环。

所以，**上面这一版我认为已经可以作为最终审计指令了**。现在不用再继续往里面塞功能；再加下去就开始过度设计了。