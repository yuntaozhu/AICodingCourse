## Prompt:
10/6/2026, 1:24:34 AM

workspace $ sed -n '1,260p' experiments/writer_output_v1.py
"""Isolated Writer Output v1. Production generate() does not import this module."""

from __future__ import annotations

import json
import shutil
import time
from pathlib import Path

from agents.writer import _render, assemble_variant, draft
from canon.chapters import get_chapter
from canon.projects import get_project, list_volumes
from host.app import create_app
from prose.length import char_count, inherit_length, length_check
from prose.revisions import save_writer_prose
from providers.adapters._http import default_http_transport, post_json
from providers.errors import ProviderError
from providers.manifest import manifest_items
from providers.protocol import CompletionRequest, CompletionResult, PackBlock
from providers.registry import ModelRegistry
from providers.router import ModelRouter
from storage.db import fetch_one
from storage.paths import default_data_dir

PROJECT_ID = "01a10c0c-bc9f-7be4-a9f2-83433099684d"
CHAPTER_ID = "01a10c0c-bd5e-7b9c-9285-13e2c2c121e8"
MANIFEST_ID = "01a10c18-a23a-7e3b-9086-6a606563120a"
SOURCE_DATA = Path("/tmp/writer-b-10ch/data")
DEST_DATA = Path("/tmp/writer-output-v1/data")
CALL_LOG = Path("/tmp/writer-output-v1/call.json")

class ExperimentStop(RuntimeError):
    """Stop before HTTP, or refuse a second model call. Does not confirm a manifest."""

def make_http_guard(inner):
    state = {"n": 0}

    def transport(**kwargs):
        body = kwargs["json_body"]
        actual = {
            "model": body.get("model"),
            "temperature": body.get("temperature"),
            "max_tokens": body.get("max_tokens"),
            "reasoning_effort": body.get("reasoning_effort"),
            "timeout": kwargs.get("timeout"),
            "url": kwargs.get("url"),
            "response_format": "response_format" in body,
        }
        expected = {
            "model": "grok-4.7",
            "temperature": 0.7,
            "max_tokens": 4096,
            "reasoning_effort": "low",
            "timeout": 180,
            "url": "https://api.x.ai/v1/chat/completions",
            "response_format": False,
        }
        if actual != expected:
            raise ExperimentStop(f"请求与 Writer Output v1 不一致：{actual}")
        if state["n"] >= 1:
            raise ExperimentStop("同一次实验出现了第二次 Grok HTTP")
        state["n"] += 1
        return inner(**kwargs)

    transport.state = state
    return transport

class PlainTextGrokAdapter:
    """Same Grok request as GrokAdapter, without response_format. Content becomes body_md."""

    provider_key = "grok"
    default_base_url = "https://api.x.ai/v1"

    def __init__(self, *, api_key: str, model_key: str, base_url: str | None = None, transport=None):
        self.api_key = api_key
        self.model_key = model_key
        self.base_url = (base_url or self.default_base_url).rstrip("/")
        self.transport = transport
        self.last_response: dict | None = None

    def health(self) -> bool:
        return True

    def complete(self, request: CompletionRequest) -> CompletionResult:
        if self.transport is None:
            raise ExperimentStop("实验传输层没有装上")
        url = f"{self.base_url}/chat/completions"
        body = {
            "model": self.model_key,
            "temperature": request.temperature,
            "max_tokens": request.max_output_tokens,
            "messages": request.messages,
        }
        if request.reasoning_effort:
            body["reasoning_effort"] = request.reasoning_effort
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = post_json(self.transport, url=url, headers=headers, json_body=body, timeout=request.timeout)
        choice = payload["choices"][0]
        content = choice["message"]["content"]
        usage = payload.get("usage") if isinstance(payload.get("usage"), dict) else {}
        text = content if isinstance(content, str) else ""
        self.last_response = {
            "finish_reason": choice.get("finish_reason"),
            "usage": dict(usage),
            "content": content if isinstance(content, str) else None,
            "content_chars": len(content) if isinstance(content, str) else None,
        }
        return CompletionResult(
            json_payload={"body_md": text},
            input_tokens=int(usage.get("prompt_tokens") or 0),
            output_tokens=int(usage.get("completion_tokens") or 0),
            model_key=self.model_key,
            provider_key=self.provider_key,
        )

class OutputV1Registry(ModelRegistry):
    def adapter_class(self, provider_key: str):
        if provider_key == "grok":
            return PlainTextGrokAdapter
        return super().adapter_class(provider_key)

def materials_mismatch(blocks: list[PackBlock], messages: list[dict], assembled: dict) -> str | None:
    if not blocks or blocks[0].kind != "instruction" or blocks[0].id != "writer-instruction":
        return "发给 Router 的材料没有 Writer instruction"
    pack = blocks[1:]
    assembled_blocks = assembled["blocks"]
    if len(messages) != 2:
        return "messages 不是 system 加 user"
    if messages[0].get("role") != "system" or messages[0].get("content") != blocks[0].text:
        return "system 与 instruction 不一致"
    if messages[1].get("role") != "user" or messages[1].get("content") != _render(pack):
        return "user 与 Writer Pack 渲染不一致"
    if messages[0]["content"] != assembled["system"] or messages[1]["content"] != assembled["user"]:
        return "messages 与 assemble_variant(quality=b) 不一致"
    if [(item.kind, item.id, item.text) for item in pack] != [
        (item.kind, item.id, item.text) for item in assembled_blocks
    ]:
        return "Pack 与 assemble_variant(quality=b) 不一致"
    return None

def manifest_mismatch(stored_items: list[dict], blocks: list[PackBlock], *, provider_key: str, model_key: str) -> str | None:
    if provider_key != "grok" or model_key != "grok-4.7":
        return f"provider/model 不是 grok / grok-4.7：{provider_key} / {model_key}"
    current = [item["sha256"] for item in manifest_items(blocks)]
    previous = [item["sha256"] for item in stored_items]
    if current != previous:
        return "block sha256 与已确认 Writer manifest 不一致"
    return None

def blank_content(content) -> bool:
    return not isinstance(content, str) or content.strip() == ""

def decide_disposition(*, finish_reason: str | None, content, schema_ok: bool, error_code: str | None) -> str:
    if error_code == "TIMEOUT":
        return "no-save-timeout"
    if blank_content(content):
        return "no-save-empty"
    if not schema_ok:
        return "no-save-error"
    if finish_reason == "length":
        return "no-save-truncated"
    if finish_reason == "stop":
        return "save"
    return "no-save-error"

class OutputV1Router(ModelRouter):
    def complete(self, **kwargs):
        if kwargs.get("allow_fake"):
            raise ExperimentStop("allow_fake 必须为 False")
        if kwargs.get("manifest_id") != MANIFEST_ID:
            raise ExperimentStop("必须使用指定的已确认 Writer manifest")
        if kwargs.get("agent_name") != "writer":
            raise ExperimentStop("实验只允许 writer")
        if kwargs.get("reasoning_effort") != "low" or kwargs.get("timeout") != 180:
            raise ExperimentStop("reasoning_effort 或 timeout 与 Writer B 不一致")
        if kwargs.get("temperature_override") is not None or kwargs.get("max_output_tokens") is not None:
            raise ExperimentStop("实验不覆盖 temperature 或 max_tokens")
        blocks = kwargs["blocks"]
        messages = kwargs["messages"]
        selected = self._select(kwargs["agent_name"], blocks, allow_fake=False)
        if selected.provider_key != "grok" or selected.model_key != "grok-4.7":
            raise ExperimentStop(f"选中的模型不是 grok-4.7：{selected.provider_key} {selected.model_key}")
        if float(selected.temperature) != 0.7 or int(selected.max_output_tokens) != 4096:
            raise ExperimentStop("writer 配置的 temperature 或 max_output_tokens 已不是 0.7 / 4096")
        with self.studio.transaction(kwargs["project_id"]) as conn:
            row = fetch_one(
                conn,
                "SELECT decision, provider_key, model_key, items_json FROM send_manifest WHERE id = :id AND project_id = :project_id",
                {"id": MANIFEST_ID, "project_id": kwargs["project_id"]},
            )
            if row is None or row["decision"] != "confirmed":
                raise ExperimentStop("指定 manifest 不存在或未确认")
            chapter = get_chapter(conn, kwargs["project_id"], kwargs["chapter_id"])
            assembled = assemble_variant(conn, kwargs["project_id"], chapter, quality="b")
            problem = materials_mismatch(blocks, messages, assembled)
            if problem:
                raise ExperimentStop(problem)
            problem = manifest_mismatch(
                json.loads(row["items_json"]),
                blocks,
                provider_key=row["provider_key"],
                model_key=row["model_key"],
            )
            if problem:
                raise ExperimentStop(problem)
        return super().complete(**kwargs)

def _isolated(dest: Path) -> None:
    live = default_data_dir().resolve()
    dest = dest.resolve()
    source = SOURCE_DATA.resolve()
    if dest == live or dest.is_relative_to(live) or live.is_relative_to(dest):
        raise ExperimentStop("实验不能打开正式数据目录")
    if dest == source or source.is_relative_to(dest):
        raise ExperimentStop("实验不能直接使用原始 10 章数据目录")

def _copy_data() -> None:
    _isolated(DEST_DATA)
    if not SOURCE_DATA.is_dir():
        raise ExperimentStop("找不到第2章临时数据目录")
    if DEST_DATA.exists():
        shutil.rmtree(DEST_DATA)
    DEST_DATA.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SOURCE_DATA, DEST_DATA)

def _error_payload(exc: BaseException | None) -> dict | None:
    if exc is None:
        return None
    code = getattr(exc, "code", None)
    text = getattr(exc, "message", None) or str(exc)
    return {"type": type(exc).__name__, "code": code, "text": text}

def run_experiment() -> dict:
    """One Writer B call with plain text output. Does not touch the formal novel or the 10-chapter progress."""
    _copy_data()
    app = create_app(
        DEST_DATA,
        summary_debounce_seconds=0,
        summary_allow_fake_in_tests=False,
        start_job_loop=False,
    )
    studio = app.state.studio
    if studio.cloud_memory_enabled(PROJECT_ID):
        raise ExperimentStop("副本开启了云记忆，实验停止")
    guard = make_http_guard(default_http_transport)
    registry = OutputV1Registry(transports={"grok": guard})
    router = OutputV1Router(studio, registry)
workspace $

## Response:
10/6/2026, 1:24:42 AM · gpt-5-6

很好，这个输出已经足够让我们确认一件**非常关键的事情**：

之前成功的 `Writer Output v1` 实验和现在的 Continuation V1 **不是同一种输出方式**。旧实验明确使用的是：

> **Grok 普通文本输出，不使用 `response_format`，直接把模型返回的文本作为 `body_md`。**

而我们现在的 Continuation V1 使用的是现有 `GrokAdapter + ProseDraft JSON schema`。

所以现在**先不要改生产代码**。我们下一步只需要把这个旧实验的后半段看完，确认它当时具体用了什么 prompt，以及最终输出长度是多少。

请你现在只运行这一条：

```bash
sed -n '260,520p' experiments/writer_output_v1.py
```

把输出完整发给我。

## Prompt:
10/6/2026, 1:25:37 AM

workspace $ sed -n '260,520p' experiments/writer_output_v1.py
    router = OutputV1Router(studio, registry)
    with studio.transaction(PROJECT_ID) as conn:
        chapter = get_chapter(conn, PROJECT_ID, CHAPTER_ID)
    started = time.perf_counter()
    result = None
    caught: BaseException | None = None
    try:
        result = draft(
            router,
            studio,
            project_id=PROJECT_ID,
            chapter=chapter,
            allow_fake=False,
            manifest_id=MANIFEST_ID,
            quality="b",
        )
    except ExperimentStop as exc:
        if guard.state["n"] == 0:
            raise
        caught = exc
    except ProviderError as exc:
        caught = exc
    duration = round(time.perf_counter() - started, 2)
    last = registry.last_adapter.last_response if registry.last_adapter is not None else None
    content = None if last is None else last.get("content")
    finish_reason = None if last is None else last.get("finish_reason")
    usage = {} if last is None else last.get("usage") or {}
    schema_ok = result is not None and isinstance(getattr(result, "json_payload", None), dict)
    if schema_ok and result.json_payload.get("body_md") != content:
        schema_ok = False
    error_code = getattr(caught, "code", None) if caught else None
    disposition = decide_disposition(
        finish_reason=finish_reason,
        content=content,
        schema_ok=schema_ok,
        error_code=error_code,
    )
    local_length = None
    if not blank_content(content):
        try:
            with studio.transaction(PROJECT_ID) as conn:
                project = get_project(conn, PROJECT_ID)
                current = get_chapter(conn, PROJECT_ID, CHAPTER_ID)
                volume = next(item for item in list_volumes(conn, PROJECT_ID) if item["id"] == current["volume_id"])
                policy = inherit_length(project, volume, current)
                local_length = length_check(content, policy)["char_count"]
                if disposition == "save":
                    _revision, pointed = save_writer_prose(
                        conn,
                        project_id=PROJECT_ID,
                        chapter=current,
                        body_md=content,
                        parent_id=current.get("current_revision_id"),
                    )
                    if not pointed:
                        raise ExperimentStop("保存时正文修订已变化")
        except Exception as exc:
            disposition = "no-save-error"
            caught = exc
    report = {
        "finish_reason": finish_reason,
        "usage": usage,
        "content_chars": None if last is None else last.get("content_chars"),
        "content": content,
        "local_length": local_length,
        "schema_validation": "pass" if schema_ok else _error_payload(caught),
        "disposition": disposition,
        "error": None if disposition == "save" else _error_payload(caught),
        "duration": duration,
        "provider": "grok",
        "model": "grok-4.7",
        "temperature": 0.7,
        "max_tokens": 4096,
        "reasoning_effort": "low",
        "manifest_id": MANIFEST_ID,
        "http_calls": guard.state["n"],
        "saved_chars": char_count(content) if disposition == "save" and isinstance(content, str) else None,
    }
    CALL_LOG.parent.mkdir(parents=True, exist_ok=True)
    CALL_LOG.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report
workspace $

## Response:
10/6/2026, 1:25:47 AM · gpt-5-6

很好，现在旧实验的完整逻辑我们已经看到了。

这里有一个非常重要的结论：

### 旧实验到底证明了什么？

旧的 `writer_output_v1.py` 是：

- **Writer B**
- Grok 4.7
- `temperature=0.7`
- `max_tokens=4096`
- `reasoning_effort=low`
- **只调用 1 次**
- **不使用 JSON `response_format`**
- 模型直接输出普通正文
- 然后把正文放进 `body_md`

而现在 Continuation V1 是：

- 第一次调用要求 JSON `ProseDraft`
- 第二次调用也要求 JSON `ProseDraft`
- 两次结果再拼接
- 最终要求 4000–6000 字

这就解释了为什么现在真实 Grok 会出现：

> 两次都是 `finish_reason=stop`，但是每次只返回几百字符。

**问题已经不像是 finish_reason 判断错误了。更值得怀疑的是：我们给 Grok 的“续写任务”prompt + JSON 输出约束，让模型实际上只完成了一个很短的 JSON 正文。**

但是我们还不能仅凭这一点就修改生产代码。

下一步我们要直接查看**旧实验实际生成出来的正文长度，以及它当时发给 Grok 的 Writer Pack / prompt**。

请你现在只运行这一条：

```bash
cat /tmp/writer-output-v1/call.json
```

把输出发给我。

**不用担心里面有 API Key——这个文件按代码看只记录模型输出、usage、参数和 manifest_id，不应该包含你的 Grok 密钥。**

## Prompt:
10/6/2026, 1:28:00 AM

workspace $ cat /tmp/writer-output-v1/call.json
{
  "finish_reason": "length",
  "usage": {
    "prompt_tokens": 5800,
    "completion_tokens": 4096,
    "total_tokens": 11376,
    "prompt_tokens_details": {
      "text_tokens": 5800,
      "audio_tokens": 0,
      "image_tokens": 0,
      "cached_tokens": 1152
    },
    "completion_tokens_details": {
      "reasoning_tokens": 1480,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "num_sources_used": 0,
    "cost_in_usd_ticks": 433280000
  },
  "content_chars": 5318,
  "content": "body_md:\n周予安没有在路口转弯。\n\n陈默走了两步才发现。他停在斑马线这边，书包带从肩上滑下去，又被他一把捞回来。“哎。你家不是那边吗？”\n\n“我有事。”\n\n“什么事。”他已经跟过来了，步子比她快，话也快，“你刚才说周六还没定。我妈让我今天就把练习册买了，旧书店五点半关门。你要是去南边，我可以绕一下，可是你得说你去哪儿。”\n\n周予安把口袋里那张薄纸按了按。纸是她自己折的，上面只有一行字，写得很难看：无编号，铜钥匙，标签周予安。她没把纸拿出来。\n\n“旧南站。”\n\n“站？”陈默侧过脸看她，“客运早停了吧。你去那儿干嘛。捡东西？”\n\n“还一下。”\n\n“还什么。”\n\n她没接。红灯还没跳。对面便利店的门开了又关，有人提着两瓶水出来，塑料袋碰着腿。陈默看了她一会儿，像是在等一个更好的答案。没有。\n\n“你今天不对。”他说，语气仍像在说煎饼收摊，“早上点名你也慢半拍。现在又不回家。你要是生病就直说，我送你到路口。你要是去见谁，也直说，我又不是来查岗的。”\n\n“没见谁。”\n\n“那就是有事瞒我。”\n\n周予安看了他一眼。“你话真多。”\n\n“我话一直多。”他哼了一声，倒是没生气，“行。你去你的。练习册我自己买。周六要是又不回我，我就当你默许了，到时候直接去敲你家门。”\n\n“别敲。”\n\n“那你回消息。”\n\n绿灯亮了。她过马路，他跟到站牌底下才停。公交车进站，门开，热气和人一起涌出来。陈默抬手挡了一下，没上车，也没再跟着。\n\n“周予安。”\n\n她回头。\n\n“你要是把什么重要的东西落在那儿了，就去拿。别在路上自己吓自己。”他说完，又补一句，快得几乎叠在上一句上，“还有，明天化学小测，第三题你昨天抄错了。我不是说你笨。我是说你要是再走神，就真会错。”\n\n她点了下头。车门关上，他把自己送进下一班的队伍里，还在掏手机。周予安站了两秒，才往旧南站那边走。\n\n路她认得。认得不等于去过很多次。学校到这儿要过两条马路，再沿着一排关了大半的店铺走。理发店还开着，里面收音机放着旧歌，声音很小。修鞋摊的人坐在门口削苹果，抬头看了她一眼，又低下去。没有人拦她。\n\n失物招领处的门半掩着。门上的牌子还是那块，字被手摸得发浅：南站失物招领。她推门进去的时候，铃没有响。柜台上压着一本翻开的本子，顾成远坐在后面，正在把一支笔帽拧紧。\n\n他看见她，没有立刻说话。先看了看她空着的手，又看了看她的书包。\n\n“你又来了。”\n\n“嗯。”\n\n“钥匙还在你那儿？”\n\n周予安从侧袋里把那把铜钥匙摸出来，放在柜台边上，没有推过去。标签朝上，名字还是她的。纸边有一点卷。她昨天确认过，今天又确认了一遍：她不记得自己有过这把钥匙。\n\n顾成远没有伸手去拿。他把笔放平，句子说得很完整。“你昨天问我，这上面的名字是谁写的。我没有答上来。今天你想问什么？”\n\n“登记。”她说，“你们收东西，会写下来吧。”\n\n“会。”\n\n“我想看。”\n\n顾成远看了她一会儿。办公室不大，下午的光从侧面的窗进来，照到档案柜的下半截。柜门有的关着，有的只扣了一道。里面没有人说话。储物间的门关着，门缝里露出一角纸箱。\n\n“公开的领取记录可以看。”他说，“旧的不在这本上。你要找的如果是旧的，我需要先知道你看见了什么。”\n\n“一把钥匙。”周予安说，“没有编号。标签上是我的名字。我没见过。”\n\n“日期呢？”\n\n“没有。”\n\n“你记得自己什么时候来过这里吗？”\n\n她摇头。摇完又觉得这个动作太满，改成一句：“不记得。”\n\n顾成远点了点头，像是把这句话收下了，并没有把它变成解释。他起身，从柜台内侧抽出一本蓝色封面的登记簿，放到她面前。簿子不旧，边角还硬。\n\n“这是今年的。你先看。如果没有，再说。”\n\n周予安翻开。字迹换过好几个人。伞，书包，学生卡，一副眼镜，一只儿童水杯。有的后面写了领取人和日期，有的还空着。她一页一页看，没有把自己的名字读出声。看到三月，看到一月，都没有。钥匙也不在里面。\n\n“没有。”\n\n“我知道。”顾成远说。\n\n她抬眼。“那你为什么让我看这个。”\n\n“因为你要查，就从还能公开的地方开始。”他重新坐下，并不急，“旧登记簿不在柜台上。也不是谁来都能翻。”\n\n门又被推开了。这次有风，把门口的塑料夹吹得轻轻碰了一下。进来的人比周予安高半头，穿着一件洗得发白的深色外套，头发别在耳后，手里提着一只牛皮纸袋。她看见柜台前的人，脚步顿了一下，没有露出惊讶，只把纸袋放到桌角。\n\n“顾老师，车站那边送来的。”她说，对顾成远用的是客气的称呼，转过来看周予安时就没那么绕了，“你还在。”\n\n周予安认得这张脸。昨天她来的时候，这人在储物间门口站过一会儿，没有进来说话。顾成远当时也没介绍。\n\n“林知夏。”顾成远说，“临时来帮忙的。周予安，昨天那把钥匙的失主——至少标签上是这么写的。”\n\n林知夏看了眼铜钥匙，又看了眼那本今年的登记簿。“你在找记录。”\n\n“嗯。”\n\n“今年的没有。”林知夏说。不是问。她把纸袋口折好，动作很快，像是手头的事不能拖，“旧的在里面。你不能自己进去。”\n\n周予安没有动。“我可以在这儿看。”\n\n林知夏看着她。两个人之间隔着柜台的一角。顾成远没有插话，只是把今年的登记簿收回去，在封面上按了按，像是确认它还在原处。\n\n“一页。”林知夏说，“你说钥匙。我去找跟钥匙有关的那一页。别的不拿出来。”\n\n“为什么。”\n\n“因为不是你的。”她回答得直接，没有加长解释。说完又补了一句，语速比前面稍快，“你要是想证明标签写错了，看那一页就够了。看不够也别翻。”\n\n周予安想说自己不是来证明写错的。话到嘴边，变成一个更具体的问题：“那一页上有日期吗？”\n\n林知夏没有立刻答。她转身进了侧边那间小房间。门没有关严，能看见里面一排更旧的柜子，标签用绳子系着，有的已经褪色。她没有开灯，借着门口的光抽了一本。本子很厚，封面的蓝已经发灰，书脊用胶带缠过两次。\n\n她出来的时候，本子抱在胸前，手指压着其中一处。放到柜台上之前，她先看了顾成远一眼。顾成远没有点头，也没有摇头。林知夏还是把本子放下了，只翻开压着的那一页。\n\n纸黄，字是钢笔，有的地方墨水洇开了。周予安低头看。\n\n左上角写着日期。她先看日期，没有看物品。\n\n年份比她以为的要早。她记得自己上小学是从海临西边那所学校开始的，记得搬进现在这套房子的前一个暑假，记得那年暑假她把一只红色文具盒弄丢了，哭过，后来又在抽屉里找到。那些事她能排得出来。这一行数字停在那之前。不是早几个月。是早到她还没把“上学”和“这条路”放在一起的时候。\n\n物品栏写着：铜钥匙一枚。无编号。附件：纸标签。\n\n备注栏很短。领取人那一格空着。另一格写了两个字，像是经手，字迹跟日期不是同一支笔。再下面有一行被后来的人用直尺画过，画得不重，还能看见底下的字。周予安只认出一个“南”字，后面的被折痕吃掉了。\n\n她的手指停在日期旁边，没有碰到字。\n\n“这是我上小学以前。”她说。\n\n房间里安静了一会儿。窗外有车过去，不是车站的车，是普通的车，轮胎压过井盖，响了一声。\n\n顾成远开口时仍不急。“你确定你记得的顺序没有错。”\n\n“文具盒是一年级暑假之后。”周予安说，“这页比那更早。我那时候不住这边。”\n\n“标签上的名字呢？”\n\n“是我的。”\n\n她说完才觉得这句话太光，像是替这页纸做了决定。林知夏的手还按在本子右侧，按得很稳，把下一页的边角压住了。\n\n周予安看向那只手。“后面还有。”\n\n“有。”\n\n“跟这把钥匙有关？”\n\n“你现在看到的，就是跟它有关的。”林知夏说，“再往后不是给你看的。”\n\n“为什么。”\n\n“你又问为什么。”林知夏的声音没有抬高，只是更快了一点，“因为那一页不是这把钥匙。因为有的记录写了别人的东西。因为你翻开以后，不一定能合上。”\n\n周予安听不懂最后一句。她没有追问那句。她问的仍是眼前的：“日期会不会抄错。”\n\n“有可能。”顾成远说，“旧本子转抄过。人也换过。我不能向你保证每一个数字都没错。”\n\n“那名字呢。”\n\n“名字我昨天就看见了。”他说，“我没有告诉你它是谁写的。我现在仍然不知道。”\n\n林知夏把本子往自己这边挪了半寸。不是抢走，是不让周予安的手指再往右。周予安的手本来已经抬起来了。她想看下一页的页眉，只想看页眉上有没有同样的年份。这个念头很小，小到她自己都觉得不该被称为调查。可手已经动了。\n\n林知夏按住了那一页。\n\n两只手差一点碰上。没有碰上。林知夏的掌心压在纸上，指甲剪得很短，指节因为用力而发白。她看着周予安，没有说“不许”。她说的是：“到这儿。”\n\n周予安的手停在空中，又放下。柜台边缘有一道旧裂，她的指尖碰到那道裂，停住。\n\n“我又没撕。”她说。声音很轻，算不上讽刺，更像是给自己找一个还能站着的句子。\n\n“我知道你没撕。”林知夏说，“你想看。看和撕不是一回事。可有的页看了也收不回来。”\n\n顾成远这时才把铜钥匙往登记簿旁边推了推，让它不要压到纸。他没有看林知夏，也没有看周予安的脸，只看着那行日期。\n\n“你可以抄日期和物品。”他说，“不要拍照。不要把整页带走。抄完，这本要收回去。”\n\n周予安从书包里摸出笔。笔帽咬了两次才打开。她把那张薄纸摊平，在自己昨天写的那行下面又写了一行：日期，然后是那四个数字。写到年份时她停了一下。数字没有变。她又写：铜钥匙，无编号，纸标签。备注里那个“南”字她也写了，后面空着，没有自己补。\n\n林知夏一直按着右侧。等她写完，才把那一页合上。合上的声音很轻。本子被抱回去，侧门在她身后掩上，没有锁，只是掩上。\n\n周予安把纸折好，放回口袋。钥匙她拿起来，又放下。放在柜台上的时候，金属碰了一下本已收回的位置，发出很短的一声。\n\n“我能把钥匙留在这儿吗？”\n\n“可以。”顾成远说，“留在这儿，不代表我们就能告诉你它从哪儿来。你要是自己拿着，也不要反复拿出来看。看多了，人会把没有的细节看成有的。”\n\n她听懂了前半句。后半句她没有接。钥匙还是收回了侧袋。不是因为不信他。是因为放在这儿以后，她连那行日期都要靠别人肯不肯再翻开。\n\n林知夏从侧门出来，手里已经没有那本旧登记簿。她在柜台内侧站定，看着周予安把书包拉链拉上。\n\n“你还要问什么。”\n\n周予安想了想。“你昨天就在。”\n\n“在。”\n\n“你认识这把钥匙吗？”\n\n林知夏没有把问题推回去。她说：“认识这个地方。钥匙我见过类似的。不是同一把。你不要把这两句话合成一句。”\n\n“我没有合成。”\n\n“你刚才的眼睛在合成。”林知夏说。对她，这句话说得很直。随即她又转向还没完全关上的门口，外面有人探进半个身子，是个提着塑料袋的中年女人，口音很本地，问儿童手套有没有人送来。林知夏的声音立刻换了，客气，句子也完整一些：“您先进来。手套如果是今天丢的，我先帮您看今年的簿子。孩子的名字和大约时间，您说一下。”\n\n女人进来，在门口垫子上蹭了蹭鞋。周予安让开。她没有再问。林知夏已经低下头去翻那本蓝色登记簿，笔帽咬在齿间，问话一句接一句，都是手套的颜色、左手还是右手、有没有名字绣在里面。那些话跟钥匙无关。周予安站在旁边，忽然觉得自己不该再占着柜台。\n\n顾成远把一张领取单推到女人面前，又对周予安说：“从侧门出去，绕到站前那条路。正门现在堆了纸箱。”\n\n“我知道正门。”\n\n话出口她才停住。\n\n她不知道自己为什么说知道。昨天她是从这条街的另一头进来的，看过门牌，没有绕到站前。站前是什么样子，她应说不上来。可“正门”这两个字在嘴里很熟，熟得不像是刚才听来的。\n\n顾成远看着她。“你知道哪一扇。”\n\n周予安没有回答。她点了下头，像是承认，又像是把这个问题暂时搁下。林知夏翻簿子的手顿了一下，没有抬头。女人还在说手套是深蓝的，不是黑的，孩子不认黑色。\n\n周予安从侧门出去。\n\n外面是一条窄道，墙皮掉了一块，露出底下的灰。窄道尽头不是街，是旧南站留下的那截空地。客运停了以后，站房还在，窗大多封着，有一扇没有封严，玻璃后面是暗的。站前的雨棚骨架还留着，下面没有车，只有两张歪了的铁椅，和一只被人放在椅上的空瓶。\n\n她站在窄道口，没有往前走。\n\n风从站台那边过来，不潮，只是把一张广告纸刮到她鞋边。她没有捡。她看着那排封起来的窗，一扇，两扇，第三扇的铁皮边缘卷着。这个顺序她没有数，可脚已经知道如果再走十步，就会到一根柱子后面。柱子上以前有没有牌，她说不出来。她只是觉得自己不该对一根还没看见的柱子这么有数。\n\n没有画面。没有谁牵着她的手。没有人叫她的名字。熟悉感就停在身体里，停在“再走就会到”这一步，不到记忆里去。\n\n周予安把手插进兜里，摸到那张纸。纸上的日期比她排得出来的童年更早。站房在她眼前，普通，旧，没有发出任何声音。她没有走近。走近好像会把那一点“知道”用掉，用掉以后她仍不知道它从哪儿来。\n\n身后有脚步。林知夏出来了，停在她侧后方，没有超过她。\n\n“手套找到了。”林知夏说，像是随口，“在今年的簿子上。女人记错了日子，说是昨天，其实是上周五。”\n\n周予安“嗯”了一声。\n\n“你刚才说你知道正门。”\n\n“我说了。”\n\n“你看见过？”\n\n周予安看着那排窗。“没有。我不",
  "local_length": 5065,
  "schema_validation": "pass",
  "disposition": "no-save-truncated",
  "error": null,
  "duration": 149.26,
  "provider": "grok",
  "model": "grok-4.7",
  "temperature": 0.7,
  "max_tokens": 4096,
  "reasoning_effort": "low",
  "manifest_id": "01a10c18-a23a-7e3b-9086-6a606563120a",
  "http_calls": 1,
  "saved_chars": null
}workspace $

## Response:
10/6/2026, 1:28:07 AM · gpt-5-6

这份结果非常关键。现在我们基本可以确定**问题不在 Grok 本身，也不在 `finish_reason` 判断**。

旧实验实际上证明：

- 同样是 Grok 4.7
- 同样 `temperature=0.7`
- 同样 `max_tokens=4096`
- 同样 `reasoning_effort=low`
- 同样 Writer B
- **一次调用就生成了 5065 个有效字符**
- 甚至因为 `finish_reason="length"`，它其实还没写完

而现在 Continuation V1：

- 第一次只有约 **784**
- 第二次只有约 **492**
- 两次合计约 **1276**
- 两次都是 `finish_reason="stop"`

所以核心差异高度集中在：

> **Continuation V1 的 prompt / 请求格式。**

尤其是这一点：

```text
CONTINUATION_OPENING
这一次只写章节前半。
按不含空白的字数写到大约 2000–3000 后，停在一个自然的暂时停点。
...
```

我们现在**不能继续猜**。

下一步我要让我们直接比较：

**旧实验的 Writer B prompt**
vs.
**现在 Continuation opening prompt**

这样才能知道到底是哪一句把 Grok 的输出行为改变了。

请你现在只执行这一条命令：

```bash
grep -n -A 35 -B 10 "CONTINUATION_OPENING\|CONTINUATION_FOLLOW\|def _system_text\|def draft" agents/writer.py
```

把输出发给我。

我们先把**证据链补完整**，再决定是否修改代码。

## Prompt:
10/6/2026, 1:29:36 AM

}workspace $ grep -n -A 35 -B 10 "CONTINUATION_OPENING\|CONTINUATION_FOLLOW\|def _system_text\|def draft" agents/writer.py
44-    "保留已有情节、人物、事实和连续性。大纲仍是事实边界，不要另起主线。"
45-    "只输出 JSON，正文放在 body_md。"
46-)
47-REPAIR_OVER_V0 = (
48-    "上一稿超过允许的最多字数。请重写为一篇收进允许范围的正文。"
49-    "不要只砍掉结尾。保留关键剧情、人物、事实和连续性。"
50-    "只输出 JSON，正文放在 body_md。"
51-)
52-
53-
54:def draft(
55-    router,
56-    studio,
57-    *,
58-    project_id: str,
59-    chapter: dict,
60-    allow_fake: bool,
61-    manifest_id: str | None,
62-    quality: str = "a",
63-):
64-    variant = _variant(quality)
65-    with studio.transaction(project_id) as conn:
66-        blocks, _excluded = build_writer_pack(
67-            conn, project_id, chapter["id"], include_voice=variant == "b"
68-        )
69-        policy = _policy(conn, project_id, chapter)
70-    instructions = _system_text(policy, quality=variant, chapter=chapter, blocks=blocks)
71-    instruction = PackBlock(
72-        kind="instruction",
73-        id="writer-instruction",
74-        text=instructions,
75-        reason="system",
76-        chapter_id=chapter["id"],
77-    )
78-    messages = [
79-        {"role": "system", "content": instructions},
80-        {"role": "user", "content": _render(blocks)},
81-    ]
82-    return router.complete(
83-        agent_name="writer",
84-        schema=SCHEMA,
85-        messages=messages,
86-        blocks=[instruction, *blocks],
87-        project_id=project_id,
88-        chapter_id=chapter["id"],
89-        allow_fake=allow_fake,
--
102-        reasoning_effort="low",
103-    )
104-
105-
106-_NO_LENGTH_POLICY = {
107-    "chapter_target_length": None,
108-    "minimum_length": None,
109-    "maximum_length": None,
110-    "length_strict": None,
111-}
112:CONTINUATION_OPENING = (
113-    "这一次只写章节前半。"
114-    "按不含空白的字数写到大约 2000–3000 后，停在一个自然的暂时停点。"
115-    "不要为了数字硬截断。"
116-    "不要写完本章。"
117-    "不要总结。"
118-    "不要提前揭示后续章节。"
119-    "不要输出 writer_notes。"
120-    "不要加 body_md 包装。"
121-    "只输出正文。"
122-)
123:CONTINUATION_FOLLOW = (
124-    "下面给出的是当前已写正文。从它的最后一句之后接着写，只输出续写。"
125-    "不要重复已有正文，不要重新介绍人物，不要重新介绍环境，不要总结前文，不要重新开始。"
126-    "不要改变已经发生的事实，不要改变人称视角，不要提前解释尚未揭示的内容。"
127-    "写完本章剩余部分，并在自然结尾结束。"
128-    "拼接后的整章按不含空白的字数落在 4000–6000。"
129-    "不要输出 writer_notes。"
130-    "不要加 body_md 包装。"
131-    "只输出续写正文。"
132-)
133-
134-
135-def build_continuation(conn, project_id: str, chapter: dict, *, phase: str, prior_body: str | None = None) -> dict:
136-    """Assemble one continuation call. The first half stays in memory until the caller saves a finished chapter."""
137-    pack, _excluded = build_writer_pack(conn, project_id, chapter["id"], include_voice=True)
138-    kept = [block for block in pack if block.kind != "length_policy"]
139-    system = _system_text(_NO_LENGTH_POLICY, quality="b", chapter=chapter, blocks=kept)
140-    if phase == "opening":
141:        system = f"{system}\n{CONTINUATION_OPENING}"
142-        context = kept
143-    else:
144:        system = f"{system}\n{CONTINUATION_FOLLOW}"
145-        context = [
146-            *kept,
147-            PackBlock(
148-                kind="prose",
149-                id=f"{chapter['id']}-written",
150-                text=prior_body or "",
151-                reason="current_draft",
152-                chapter_id=chapter["id"],
153-            ),
154-        ]
155-    instruction = PackBlock(
156-        kind="instruction",
157-        id="writer-instruction",
158-        text=system,
159-        reason="system",
160-        chapter_id=chapter["id"],
161-    )
162-    return {
163-        "blocks": [instruction, *context],
164-        "messages": [
165-            {"role": "system", "content": system},
166-            {"role": "user", "content": _render(context)},
167-        ],
168-    }
169-
170-
171-REPAIR_UNDER = (
172-    "上一稿短于允许的最少字数。请重写为一篇落在允许范围内的正文。"
173-    "不要重复句子，不要用无意义的垫字或复制段落凑字数。"
174-    "保留已有情节、人物、事实和连续性。只输出 JSON，正文放在 body_md。"
175-)
176-REPAIR_OVER = (
177-    "上一稿超过允许的最多字数。请重写为一篇收进允许范围的正文。"
178-    "不要只砍掉结尾。保留已有情节、人物、事实和连续性。只输出 JSON，正文放在 body_md。"
179-)
--
277-        "user": _render(blocks),
278-        "kinds": [block.kind for block in blocks],
279-        "blocks": blocks,
280-    }
281-
282-
283-def _variant(quality: str) -> str:
284-    return "b" if quality == "b" else "a"
285-
286-
287:def _system_text(policy: dict, *, quality: str, chapter: dict | None = None, blocks: list[PackBlock] | None = None) -> str:
288-    chapter = chapter or {}
289-    base = INSTRUCTIONS_V0 if quality == "b" else INSTRUCTIONS
290-    if quality == "b":
291-        base = f"{base}\n{pov_boundary(chapter.get('pov'), _follower(blocks or [], chapter))}"
292-    requirement = length_requirement(policy)
293-    if requirement is None:
294-        return base
295-    return f"{base}\n{requirement}"
296-
297-
298-def resolve_pov_character(blocks: list[PackBlock], chapter: dict | None) -> str | None:
299-    """Name the follower only from an existing character block. Never guess a pronoun."""
300-    characters = [block for block in blocks if block.kind == "character"]
301-    wanted = (chapter or {}).get("pov_character_id")
302-    if wanted:
303-        for block in characters:
304-            if block.id == wanted:
305-                return _character_name(block.text)
306-        # An id that is not in this pack is not a reliable identity.
307-    protagonists = [block for block in characters if _character_role(block.text) == "protagonist"]
308-    if len(protagonists) == 1:
309-        return _character_name(protagonists[0].text)
310-    return None
311-
312-
313-def _follower(blocks: list[PackBlock], chapter: dict | None) -> str | None:
314-    if (chapter or {}).get("pov") != "third_limited":
315-        return None
316-    return resolve_pov_character(blocks, chapter)
317-
318-
319-def pov_boundary(pov: str | None, follower: str | None = None) -> str:
320-    if pov == "first":
321-        return "这一章是第一人称。正文只能使用叙述者自己能够感知、说出和误判的信息。其他人的内心只能表现为看得见或听得见的迹象。"
322-    if pov == "third_limited":
workspace $

## Response:
10/6/2026, 1:29:41 AM · gpt-5-6

很好，这个结果已经把关键差异进一步缩小了。

我们现在知道：

- 旧实验调用的是 `draft(... quality="b")`
- 所以它使用的正是现有的 **Writer B 基础指令**
- 旧实验的 `length_policy` 仍然存在，并告诉模型目标篇幅
- Continuation V1 则明确把 `length_policy` 删除，并另外告诉模型“只写前半，2000–3000 后停”。

所以现在最值得检查的是：

> **Writer B 原始系统指令到底是什么，以及原来的 length requirement 是怎么写的。**

这可以直接解释为什么旧实验能持续生成，而 Continuation prompt 会让模型很早停下来。

请只运行这一条：

```bash
sed -n '1,55p;287,330p' agents/writer.py
```

把输出发给我。

## Prompt:
10/6/2026, 1:30:35 AM

workspace $ sed -n '1,55p;287,330p' agents/writer.py
"""Assemble a writer call. Persistence lives in the prose service."""

from __future__ import annotations

import json
from pathlib import Path

from canon.chapters import get_chapter
from canon.projects import get_project, list_volumes
from memory.pack import build_writer_pack
from prose.length import inherit_length, length_requirement
from providers.protocol import PackBlock

SCHEMA = json.loads((Path(__file__).resolve().parents[1] / "pipeline" / "schemas" / "prose_draft.json").read_text(encoding="utf-8"))

INSTRUCTIONS = (
    "你是小说正文作者。主要情节以已确认的章节大纲为准，并承接上游连续性摘要。"
    "不要索取其他章节的全文，也不要另起一条主线。"
    "只输出正文内容：body_md 和 writer_notes。不要填写项目、章节、修订或大纲标识，那些由服务器写入。"
)

# Production stays on INSTRUCTIONS. This variant is opt-in until an A/B reading accepts it.
INSTRUCTIONS_V0 = (
    "大纲规定发生什么，Writer 决定读者如何经历它。"
    "已确认大纲是事实边界，不是逐条翻译成正文的提纲。不要把大纲里的目标逐条翻译成正文，也不要让人物机械地完成章节大纲。"
    "人物按照自己已经知道的事、欲望、关系和性格行动，可以犹豫、拒绝、误判。不让人物知道自己此刻不可能知道的信息。"
    "场景应该像一个正在发生的具体空间。允许停顿、观察、闲聊和普通动作。不要求每个场景都形成高潮，不要求每段都推进主线，不要求每个场景都留下钩子。"
    "场景目的只表示这一场结束时叙事状态的变化，不是必须写进正文的句子。"
    "写作时可以考虑视角人物此刻想要什么、没说出口的张力、情绪怎样移动、人物之间哪里不一致、信息如何自然出现、关系有没有变化、读者身在怎样的空间，以及开始和结束之间有什么不同。"
    "这些只是内部考虑，不要在正文里写出这些维度的名称，也不要求每一场都填满。"
    "不要把场景写成先环境、再冲突、再情绪、再钩子的固定顺序。场景按实际内容自然结束，不强制金句、反转或钩子。"
    "情绪优先通过动作、停顿、语气、注意力和选择来表现。不用作者的总结代替场景。直接写出情绪可以，只要符合视角和这个人的说法。"
    "对话是人物之间的交流，而不是作者交换剧情信息。人物可以回避、误解、说闲话，也可以不说完自己知道的事。不同的人物应有不同的句长和直接程度。不要求所有对话都含蓄，动作和停顿可以插进对话。"
    "人物材料里的说话习惯是语言上的约束，不是介绍。不要在正文里解释这个人物说话很冷淡，也不要复述这些习惯。用它们影响句长、用词、直接程度、回避方式、紧张时的说法，以及对熟人和陌生人的差别。"
    "没有给出说话习惯时，不要编造口癖或标签。仍用欲望、关系和性格把人物分开，并避免所有人共用同一种解释性书面语。"
    "少用抽象总结和连续的动作、结果、解释。不堆砌比喻、形容词和重复意象。不把连续性摘要改写进正文。"
    "承接上游摘要中的事实和结束状态。不要索取其他章节的全文，也不要另起一条主线。"
    "只输出正文内容：body_md 和 writer_notes。不要填写项目、章节、修订或大纲标识，那些由服务器写入。"
)

REPAIR_UNDER_V0 = (
    "上一稿短于允许的最少字数。请重写为一篇落在允许范围内的正文。"
    "增加的是有效的新叙事内容，而不是重复已有句子、把同一事实换一种说法、循环描写环境，或用无意义的垫字凑字数。"
    "保留已有情节、人物、事实和连续性。大纲仍是事实边界，不要另起主线。"
    "只输出 JSON，正文放在 body_md。"
)
REPAIR_OVER_V0 = (
    "上一稿超过允许的最多字数。请重写为一篇收进允许范围的正文。"
    "不要只砍掉结尾。保留关键剧情、人物、事实和连续性。"
    "只输出 JSON，正文放在 body_md。"
)

def draft(
    router,
def _system_text(policy: dict, *, quality: str, chapter: dict | None = None, blocks: list[PackBlock]| None = None) -> str:
    chapter = chapter or {}
    base = INSTRUCTIONS_V0 if quality == "b" else INSTRUCTIONS
    if quality == "b":
        base = f"{base}\n{pov_boundary(chapter.get('pov'), _follower(blocks or [], chapter))}"
    requirement = length_requirement(policy)
    if requirement is None:
        return base
    return f"{base}\n{requirement}"

def resolve_pov_character(blocks: list[PackBlock], chapter: dict | None) -> str | None:
    """Name the follower only from an existing character block. Never guess a pronoun."""
    characters = [block for block in blocks if block.kind == "character"]
    wanted = (chapter or {}).get("pov_character_id")
    if wanted:
        for block in characters:
            if block.id == wanted:
                return _character_name(block.text)
        # An id that is not in this pack is not a reliable identity.
    protagonists = [block for block in characters if _character_role(block.text) == "protagonist"]
    if len(protagonists) == 1:
        return _character_name(protagonists[0].text)
    return None

def _follower(blocks: list[PackBlock], chapter: dict | None) -> str | None:
    if (chapter or {}).get("pov") != "third_limited":
        return None
    return resolve_pov_character(blocks, chapter)

def pov_boundary(pov: str | None, follower: str | None = None) -> str:
    if pov == "first":
        return "这一章是第一人称。正文只能使用叙述者自己能够感知、说出和误判的信息。其他人的内心只能表现为看得见或听得见的迹象。"
    if pov == "third_limited":
        return _third_limited(follower)
    if pov == "third_omniscient":
        return "这一章是第三人称全知。可以转移注意力，但转移要落在正在发生的场景里，不要无意义地跳进每个人的心理总结。"
    if pov == "second":
        return "这一章保持第二人称，不要改成全知作者。"
    if pov == "multi":
        return "这一章可以分段更换跟随的人物。每一段只使用当前跟随者能够知道的信息。"
    return "这一章没有单独指定视角。使用稳定的有限第三人称，不要随意进入多个人物的内心。"
workspace $

## Response:
10/6/2026, 1:30:39 AM · gpt-5-6

很好。现在证据链已经很清楚了。

我们发现一个比“JSON 格式”更重要的问题：

### 旧实验的 Writer B 是这样工作的

它实际上告诉 Grok：

> **“你是小说正文作者……大纲是事实边界……自然地把这一章写出来。”**

然后还有 `length_requirement(policy)`，也就是**明确告诉模型整章目标长度**。

所以旧实验会一直写到接近 4096 output tokens，最终甚至因为 token 上限被截断：

```text
finish_reason = length
content_chars = 5318
local_length = 5065
```

### 而 Continuation V1 做了一个非常大的语义改变

我们把原来的篇幅要求删掉：

```python
_NO_LENGTH_POLICY
```

然后告诉模型：

> “这一次只写章节前半。”

以及：

> “写到大约 2000–3000 后，停在一个自然的暂时停点。”

这实际上是在**主动要求模型停止**。

所以现在 Grok：

```text
CALL 1 → stop → 784 chars
CALL 2 → stop → 492 chars
```

其实完全符合它收到的任务：**写一小段，然后自然停下。**

---

## 这意味着我们现在不应该继续修 `finish_reason`

之前我们怀疑：

> `finish_reason` 捕获是不是错了？

现在已经基本排除了。

也不应该马上修改 Router、Grok Adapter 或 schema。

真正需要解决的是：

> **Continuation V1 的“两段式写作”设计，如何在不破坏原 Writer B 写作能力的情况下，让第一段足够长、第二段真正继续写。**

而且这里有一个非常重要的设计问题：

### 我们最初设计的“2000–3000 字后主动停”可能本身就是错误方向。

因为 Grok 的输出上限是 **4096 tokens**，旧实验一次可以自然产生约 **5000 中文非空白字符**。

也就是说，我们其实已经有证据证明：

**让模型正常写一章，比让模型主动在中间刹车，更符合这个模型的行为。**

---

### 下一步

现在我不想让你再跑很多实验。

我们只需要确认一件最后的事情：

**现在 Continuation V1 实际发给 Grok 的完整 `system` 和 `user` prompt 到底长什么样。**

这能让我们直接看到是不是某一条指令导致模型只写了几百字。

请只运行这一条：

```bash
grep -n -A 120 "def _continuation_call" pipeline/chapter_flow.py
```

把输出给我。

然后我会把：

**旧 Writer B → 当前 Continuation V1 → 成功的真实续写实验**

三者放在一起比较，再决定**最小修改方案**。

## Prompt:
10/6/2026, 1:31:46 AM

workspace $ grep -n -A 120 "def _continuation_call" pipeline/chapter_flow.py
261:def _continuation_call(
262-    studio,
263-    router,
264-    *,
265-    project_id: str,
266-    chapter: dict,
267-    phase: str,
268-    prior_body: str | None,
269-    manifest_id: str | None,
270-    allow_fake: bool,
271-    parent_manifest_id: str | None = None,
272-) -> dict:
273-    with studio.transaction(project_id) as conn:
274-        prepared = build_continuation(conn, project_id, chapter, phase=phase, prior_body=prior_body)
275-    if phase == "follow":
276-        manifest_id = _authorize_continuation(
277-            studio,
278-            router,
279-            project_id=project_id,
280-            chapter_id=chapter["id"],
281-            parent_manifest_id=parent_manifest_id,
282-            blocks=prepared["blocks"],
283-        )
284-        if manifest_id is None:
285-            return {
286-                "status": "failed",
287-                "error": ProviderError("SEND_NOT_CONFIRMED", "续写的第二次发送还没有已确认的第一次清单"),
288-            }
289-    previous_response = _current_last_response(router.registry)
290-    try:
291-        result = router.complete(
292-            agent_name="writer",
293-            schema=SCHEMA,
294-            messages=prepared["messages"],
295-            blocks=prepared["blocks"],
296-            project_id=project_id,
297-            chapter_id=chapter["id"],
298-            allow_fake=allow_fake,
299-            manifest_id=manifest_id,
300-            timeout=180,
301-            reasoning_effort="low",
302-            max_output_tokens=4096,
303-            temperature_override=0.7,
304-        )
305-    except ProviderError as exc:
306-        if exc.code == "SEND_NOT_CONFIRMED":
307-            raise
308-        finish_reason = _finish_reason_of_this_call(router.registry, previous_response)
309-        if exc.code == "TIMEOUT":
310-            return {"status": "failed", "error": exc}
311-        if finish_reason is None:
312-            return {"status": "failed", "error": ProviderError("ARTIFACT_SCHEMA_INVALID", "无法确认这次续写的结束原因")}
313-        if finish_reason != "stop":
314-            return {"status": "failed", "error": ProviderError("ARTIFACT_SCHEMA_INVALID", "续写没有自然结束")}
315-        return {"status": "failed", "error": exc}
316-    finish_reason = _finish_reason_of_this_call(router.registry, previous_response)
317-    if finish_reason is None:
318-        return {"status": "failed", "error": ProviderError("ARTIFACT_SCHEMA_INVALID", "无法确认这次续写的结束原因")}
319-    if finish_reason != "stop":
320-        return {"status": "failed", "error": ProviderError("ARTIFACT_SCHEMA_INVALID", "续写没有自然结束")}
321-    body_md = result.json_payload.get("body_md")
322-    if not isinstance(body_md, str) or body_md.strip() == "":
323-        return {"status": "failed", "error": ProviderError("ARTIFACT_SCHEMA_INVALID", "续写没有返回正文")}
324-    return {
325-        "status": "stop",
326-        "body_md": body_md,
327-        "manifest_id": result.manifest_id,
328-        "provider_key": result.provider_key,
329-        "model_key": result.model_key,
330-    }
331-
332-
333-def _current_last_response(registry):
334-    adapter = getattr(registry, "last_adapter", None)
335-    if adapter is None:
336-        return None
337-    return getattr(adapter, "last_response", None)
338-
339-
340-def _finish_reason_of_this_call(registry, previous_response) -> str | None:
341-    adapter = getattr(registry, "last_adapter", None)
342-    if adapter is None:
343-        return None
344-    response = getattr(adapter, "last_response", None)
345-    if not isinstance(response, dict) or response is previous_response:
346-        return None
347-    reason = response.get("finish_reason")
348-    if not isinstance(reason, str) or reason == "":
349-        return None
350-    return reason
351-
352-
353-def _authorize_continuation(studio, router, *, project_id: str, chapter_id: str, parent_manifest_id: str | None, blocks: list) -> str | None:
354-    if not parent_manifest_id:
355-        return None
356-    with studio.transaction(project_id) as conn:
357-        parent = fetch_one(
358-            conn,
359-            "SELECT * FROM send_manifest WHERE id = :id AND project_id = :project_id",
360-            {"id": parent_manifest_id, "project_id": project_id},
361-        )
362-    if parent is None or parent["decision"] != "confirmed":
363-        return None
364-    if parent["agent_name"] != "writer" or parent["chapter_id"] != chapter_id:
365-        return None
366-    if parent["provider_key"] in {"fake", "unselected"}:
367-        return None
368-    prepared = router.prepare(
369-        agent_name="writer",
370-        blocks=blocks,
371-        project_id=project_id,
372-        chapter_id=chapter_id,
373-        allow_fake=False,
374-    )
375-    if prepared["provider_key"] != parent["provider_key"] or prepared["model_key"] != parent["model_key"]:
376-        return None
377-    confirmed = router.confirm(project_id, prepared["id"])
378-    return confirmed["id"]
379-
380-
381-def _length_band(studio, project_id: str, chapter_id: str, body_md: str) -> str:
workspace $

## Response:
10/6/2026, 1:31:53 AM · gpt-5-6

很好。现在我们已经把整个调用链看清楚了。

而且我需要纠正前面一个判断：**现在不能简单地说“2000–3000 的指令导致 Grok 提前停”**。因为第一轮实际只生成了 784 字，远低于它被要求的 2000–3000。

更关键的是这一点：

```python
schema=SCHEMA
max_output_tokens=4096
temperature_override=0.7
```

也就是说，Continuation V1 的每一轮仍然要求 **`ProseDraft` JSON**。

而旧的成功实验明确是：

```text
普通文本
↓
直接作为 body_md
```

所以我们现在有两个变量同时发生了变化：

1. **主动要求“只写前半”**
2. **强制 JSON schema 输出**

目前我们还不能确定到底是哪一个导致 784 字。

---

## 最合理的下一步：做一个“单变量实验”

不要改生产代码。

我们已经有旧实验作为基准，现在只需要做一个非常小的实验：

> **保留现在 Continuation opening 的 prompt，但是去掉 JSON `response_format`，看看 Grok 是否马上恢复到长篇输出。**

如果它恢复到几千字，那么问题就非常明确：

**JSON structured output 是主要原因。**

如果还是只有几百字，那么问题就在 continuation prompt。

这个实验比继续猜要可靠得多。

而且这个实验**不应该碰正式小说数据，也不应该碰生产代码**。

---

### 但是我们先不让你写实验脚本

因为你的项目已经有 `experiments/writer_output_v1.py`，我们可以直接在现有实验框架上做最小复制。

下一步我想先确认 `assemble_variant()` 以及 `build_writer_pack()` 给旧实验和 continuation 提供的材料是不是完全一样。

请只运行：

```bash id="4j1b8q"
grep -n -A 90 "def assemble_variant" agents/writer.py
```

把输出给我。

然后我们就能决定这个单变量实验到底需要复制多少代码，**不会乱改生产代码**。

## Prompt:
10/6/2026, 1:32:49 AM

workspace $ grep -n -A 90 "def assemble_variant" agents/writer.py
267:def assemble_variant(conn, project_id: str, chapter: dict, *, quality: str = "a") -> dict:
268-    """Build A or B messages from the same chapter. This does not call a model."""
269-    variant = _variant(quality)
270-    blocks, _excluded = build_writer_pack(
271-        conn, project_id, chapter["id"], include_voice=variant == "b"
272-    )
273-    policy = _policy(conn, project_id, chapter)
274-    return {
275-        "quality": variant,
276-        "system": _system_text(policy, quality=variant, chapter=chapter, blocks=blocks),
277-        "user": _render(blocks),
278-        "kinds": [block.kind for block in blocks],
279-        "blocks": blocks,
280-    }
281-
282-
283-def _variant(quality: str) -> str:
284-    return "b" if quality == "b" else "a"
285-
286-
287-def _system_text(policy: dict, *, quality: str, chapter: dict | None = None, blocks: list[PackBlock] | None = None) -> str:
288-    chapter = chapter or {}
289-    base = INSTRUCTIONS_V0 if quality == "b" else INSTRUCTIONS
290-    if quality == "b":
291-        base = f"{base}\n{pov_boundary(chapter.get('pov'), _follower(blocks or [], chapter))}"
292-    requirement = length_requirement(policy)
293-    if requirement is None:
294-        return base
295-    return f"{base}\n{requirement}"
296-
297-
298-def resolve_pov_character(blocks: list[PackBlock], chapter: dict | None) -> str | None:
299-    """Name the follower only from an existing character block. Never guess a pronoun."""
300-    characters = [block for block in blocks if block.kind == "character"]
301-    wanted = (chapter or {}).get("pov_character_id")
302-    if wanted:
303-        for block in characters:
304-            if block.id == wanted:
305-                return _character_name(block.text)
306-        # An id that is not in this pack is not a reliable identity.
307-    protagonists = [block for block in characters if _character_role(block.text) == "protagonist"]
308-    if len(protagonists) == 1:
309-        return _character_name(protagonists[0].text)
310-    return None
311-
312-
313-def _follower(blocks: list[PackBlock], chapter: dict | None) -> str | None:
314-    if (chapter or {}).get("pov") != "third_limited":
315-        return None
316-    return resolve_pov_character(blocks, chapter)
317-
318-
319-def pov_boundary(pov: str | None, follower: str | None = None) -> str:
320-    if pov == "first":
321-        return "这一章是第一人称。正文只能使用叙述者自己能够感知、说出和误判的信息。其他人的内心只能表现为看得见或听得见的迹象。"
322-    if pov == "third_limited":
323-        return _third_limited(follower)
324-    if pov == "third_omniscient":
325-        return "这一章是第三人称全知。可以转移注意力，但转移要落在正在发生的场景里，不要无意义地跳进每个人的心理总结。"
326-    if pov == "second":
327-        return "这一章保持第二人称，不要改成全知作者。"
328-    if pov == "multi":
329-        return "这一章可以分段更换跟随的人物。每一段只使用当前跟随者能够知道的信息。"
330-    return "这一章没有单独指定视角。使用稳定的有限第三人称，不要随意进入多个人物的内心。"
331-
332-
333-def _third_limited(follower: str | None) -> str:
334-    if follower:
335-        return (
336-            f"这一章是第三人称有限，跟随{follower}。"
337-            f"{follower}从头到尾只用一个代词；第一次写成她或他之后，不得改成另一个。"
338-            f"其他人物只用{follower}能看见的动作和听得见的对话来表现，不写他们没说出口的理由。"
339-        )
340-    return (
341-        "这一章是第三人称有限。全文跟随同一个人，不要猜测人物姓名。"
342-        "这个人的代词保持一致：第一次选择之后不得更换。"
343-        "其他人物只用这个人能看见的动作和听得见的对话来表现，不写他们没说出口的理由。"
344-    )
345-
346-
347-_ROLES = {"protagonist", "supporting", "antagonist", "minor"}
348-
349-
350-def _character_name(text: str) -> str | None:
351-    for line in text.splitlines():
352-        name = line.strip()
353-        if name:
354-            return name
355-    return None
356-
357-
workspace $