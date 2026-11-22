# 应用运行时领域知识库工坊规范（Runtime Domain KB Workshop）

> **核心原则**：本目录同时沉淀「研发工程知识库」（供开发者与 Coding Agent 写代码使用）与「应用运行时领域知识库工坊」（供线上运行的 AI 应用与 Agent 检索使用）。两条链路消费者不同、权限边界不同，严禁混为一谈，更不能把前端教学沙盒的模拟召回等价为生产级运行时知识库。

---

## 1. 运行时知识库六步工程链路

1. **数据接入与结构化（Ingestion & Modeling）**
   - 区分**文档分块型 RAG**（PDF、会议纪要、客服工单，需保留标题层级上下文与 `chunkIndex`）与**结构化 Wiki/概念树**（数学建模公式库、哲学概念谱系、医疗适应症目录，按主题页维护，避免盲目按字数切碎公式与论证）。
   - 每条入库文档必须携带标准化元数据：`docId`、`tenantId`、`visibility`、`roleScope`、`version`、`effectiveAt`、`status`（`active` | `deprecated`）。

2. **权限与元数据检索前过滤（ACL & Metadata Pre-Filtering）**
   - **硬性红线**：权限过滤必须在向量/BM25 检索引擎查询阶段完成（Pre-filter），严禁“先召回全库前 10 条，再靠 Prompt 嘱咐大模型不要泄露给无权限用户”。
   - 典型隔离字段：`tenantId === session.tenantId && allowedRoles.includes(session.role) && status === "active"`。

3. **混合检索与重排（Hybrid Retrieval & Reranking）**
   - 结合 **BM25/精确词法匹配**（捕获型号、法条编号、药名、公式记号、会议 ID）与 **语义向量检索**，通过 Reciprocal Rank Fusion（RRF）或交叉编码器 Rerank 融合；对于结构化 Wiki，优先走目录路由 + 局部段落读取。

4. **引用溯源契约（Citation Grounding）**
   - 生成结果必须输出结构化证据锚点：`{ claim, docId, version, section, excerpt }`。
   - 若检索证据不足或得分低于阈值，必须显式拒答或触发人工升级，严禁模型脱离证据自由编造。

5. **增量更新与失效淘汰（Freshness & Tombstone Invalidation）**
   - 当旧版指南、已撤销会议纪要或过时政策更新时，必须对旧版本写入 Tombstone 标记（`status: "deprecated"`, `supersededBy: newDocId`），并在默认查询过滤器中排除失效版本。

6. **检索与生成双层评测（Dual-Layer KB Eval）**
   - **检索层指标**：`Recall@K`、`MRR`、`ACL 越权零漏出率（0% Unauthorized Leakage）`、`过期版本零召回率`。
   - **生成层指标**：`Faithfulness（忠实度）`、`Citation Precision（引用锚点准确率）`、`拒答准确率`。

---

## 2. 最小可运行检索前 ACL 过滤与版本淘汰契约样例（Starter Reference）

```ts
export interface RuntimeChunkRecord {
  chunkId: string;
  docId: string;
  tenantId: string;
  allowedRoles: ("public" | "staff" | "admin")[];
  version: string;
  status: "active" | "deprecated";
  section: string;
  text: string;
}

export function retrieveAuthorizedChunks(
  index: RuntimeChunkRecord[],
  session: { tenantId: string; role: "public" | "staff" | "admin" },
  queryTerms: string[],
  topK = 3
) {
  // 1. 检索前硬过滤：租户 + 角色 + 有效版本（绝不在生成后补救）
  const authorized = index.filter(
    (c) =>
      c.tenantId === session.tenantId &&
      c.allowedRoles.includes(session.role) &&
      c.status === "active"
  );

  // 2. 词法/混合打分并附带不可篡改引用锚点
  return authorized
    .map((c) => {
      const lower = c.text.toLowerCase();
      const score = queryTerms.filter((t) => lower.includes(t.toLowerCase())).length;
      return { ...c, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => ({
      docId: c.docId,
      version: c.version,
      section: c.section,
      excerpt: c.text,
    }));
}
```

## 3. 长程 Coding Harness 工程模板锚点（M8 配套）

- `init.sh`：确保本地开发与测试环境每次启动前锁定依赖版本、必需环境变量与端口健康状态。
- `feature_list.json`：结构化追踪长程多步骤任务的验收状态（`passes: true | false`），禁止擅自删除失败条目。
- `git worktree`：为并发 Coding Agent 分配独立目录与分支所有权，避免写冲突。
