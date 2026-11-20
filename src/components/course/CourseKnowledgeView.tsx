import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  Check,
  CheckCircle2,
  Copy,
  FlaskConical,
  Plus,
} from "lucide-react";
import type { CustomKnowledgeDraft } from "@/data/courseWorkspaceStore";
import {
  KB_GOVERNANCE_RULES,
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  TEAM_KNOWLEDGE_BASE,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
  type KnowledgeValidationStatus,
} from "@/data/teamKnowledgeBase";

interface CourseKnowledgeViewProps {
  initialModuleFilter?: string;
  customEntries: CustomKnowledgeDraft[];
  onAddCustomEntry: (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => void;
  onDeleteCustomEntry: (id: string) => void;
  onJumpToModule: (moduleId: string) => void;
}

export default function CourseKnowledgeView({
  initialModuleFilter = "ALL",
  customEntries,
  onAddCustomEntry,
  onDeleteCustomEntry,
  onJumpToModule,
}: CourseKnowledgeViewProps) {
  const [moduleFilter, setModuleFilter] = useState<string>(initialModuleFilter || "ALL");
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<KnowledgeValidationStatus | "ALL">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newModuleCode, setNewModuleCode] = useState<KnowledgeModuleCode>("M1");
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>("template");
  const [newScope, setNewScope] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCaution, setNewCaution] = useState("");

  const filteredBuiltIn = useMemo(() => {
    return TEAM_KNOWLEDGE_BASE.filter((item) => {
      if (moduleFilter !== "ALL" && !item.modules.includes(moduleFilter as KnowledgeModuleCode)) {
        return false;
      }
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && item.validationStatus !== statusFilter) return false;
      return true;
    });
  }, [moduleFilter, categoryFilter, statusFilter]);

  const filteredCustom = useMemo(() => {
    return customEntries.filter((item) => {
      if (moduleFilter !== "ALL" && item.moduleCode !== moduleFilter) return false;
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      return true;
    });
  }, [customEntries, moduleFilter, categoryFilter]);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddCustomEntry({
      title: newTitle.trim(),
      moduleCode: newModuleCode,
      category: newCategory,
      scope: newScope.trim() || "当前个人/项目试行",
      content: newContent.trim(),
      cautionNote: newCaution.trim(),
    });
    setNewTitle("");
    setNewScope("");
    setNewContent("");
    setNewCaution("");
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Governance Summary */}
      <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-purple-200">
            <BookMarked className="w-4 h-4 text-gemini-purple" />
            <span>真实工程知识库中心 · 对应仓库 {KB_GOVERNANCE_RULES.repoRootPath}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            可复用规则、模板、失败案例与决策记录
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {KB_GOVERNANCE_RULES.personalVsTeamBoundary} 用后闭环：{KB_GOVERNANCE_RULES.postUseActions.join(" / ")}。
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="px-4 py-2.5 rounded-xl bg-gemini-purple text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "收起新增表单" : "新增我的知识沉淀"}</span>
        </button>
      </div>

      {/* Add Learner KB Draft Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 rounded-2xl bg-[#0d1322] border border-gemini-cyan/40 space-y-3"
        >
          <div className="text-sm font-semibold text-white">
            新建知识库沉淀条目（保存在浏览器本地，随学习成果导出为 Markdown）
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="条目标题（例：订单路由禁改价格舍入规则）"
              required
              className="sm:col-span-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />
            <select
              value={newModuleCode}
              onChange={(e) => setNewModuleCode(e.target.value as KnowledgeModuleCode)}
              aria-label="所属模块"
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-gemini-cyan"
            >
              {(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"] as const).map(
                (m) => (
                  <option key={m} value={m} className="bg-[#090d16]">
                    所属模块 {m}
                  </option>
                )
              )}
            </select>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}
              aria-label="知识分类"
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-gemini-cyan"
            >
              {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
                <option key={cat} value={cat} className="bg-[#090d16]">
                  {KNOWLEDGE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={newScope}
            onChange={(e) => setNewScope(e.target.value)}
            placeholder="适用范围（例：仅适用于 src/server/billing/** 支付模块，不建议个人 Demo 强套）"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            required
            placeholder="粘贴可直接复用的模板、规则正文、失败根因或核对清单（严禁包含真实密钥或生产账号信息）"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
          />
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              value={newCaution}
              onChange={(e) => setNewCaution(e.target.value)}
              placeholder="使用注意事项或避坑提示（可选）"
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer whitespace-nowrap"
            >
              保存到我的知识库
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-wrap items-center gap-3">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          aria-label="按模块过滤知识库"
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-slate-200 cursor-pointer"
        >
          <option value="ALL" className="bg-[#090d16]">
            全部模块 (M1–M10)
          </option>
          {(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"] as const).map((m) => (
            <option key={m} value={m} className="bg-[#090d16]">
              {m}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as KnowledgeCategory | "ALL")}
          aria-label="按类别过滤知识库"
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 cursor-pointer"
        >
          <option value="ALL" className="bg-[#090d16]">
            全部 9 类工程知识
          </option>
          {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
            <option key={cat} value={cat} className="bg-[#090d16]">
              {KNOWLEDGE_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "ALL", label: "全部核验态" },
              { id: "verified", label: "已验证" },
              { id: "hypothesis", label: "待验证假设" },
              { id: "deprecated", label: "已废弃实践" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStatusFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap ${
                statusFilter === s.id
                  ? "bg-white text-slate-950 font-semibold"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums">
          仓库内置 {filteredBuiltIn.length} 条 · 自建草稿 {filteredCustom.length} 条
        </span>
      </div>

      {/* Learner Custom Entries */}
      {filteredCustom.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gemini-cyan">我的本地知识沉淀草稿</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCustom.map((item) => (
              <article
                key={item.id}
                className="p-4 rounded-2xl bg-[#0d1424] border border-gemini-cyan/35 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-gemini-cyan">
                      {item.moduleCode} · {KNOWLEDGE_CATEGORY_LABELS[item.category]} · 本地保存 ·{" "}
                      {item.updatedAt}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5">{item.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomEntry(item.id)}
                    className="text-[11px] font-mono text-rose-300 hover:underline cursor-pointer shrink-0"
                  >
                    删除
                  </button>
                </div>
                <div className="text-xs text-slate-300">适用范围：{item.scope}</div>
                {item.cautionNote && (
                  <div className="text-xs text-amber-300">注意事项：{item.cautionNote}</div>
                )}
                <pre className="p-3 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </pre>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onJumpToModule(item.moduleCode.toLowerCase())}
                    className="text-xs font-mono text-gemini-cyan hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>回到 {item.moduleCode} 学习</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyText(item.id, item.content)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                        <span>复制模板</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Built-in Team KB Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBuiltIn.map((entry) => {
          const statusTone =
            entry.validationStatus === "deprecated"
              ? "text-rose-300"
              : entry.validationStatus === "hypothesis"
              ? "text-amber-300"
              : "text-emerald-300";

          return (
            <article
              key={entry.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                entry.validationStatus === "deprecated"
                  ? "bg-rose-500/[0.04] border-rose-400/25"
                  : "bg-[#0b0f19] border-white/12"
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                  <span className="text-purple-200">
                    {entry.modules.join("/")} · {KNOWLEDGE_CATEGORY_LABELS[entry.category]} ·{" "}
                    {entry.version}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${statusTone}`}>
                    {entry.validationStatus === "verified" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : entry.validationStatus === "hypothesis" ? (
                      <FlaskConical className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{KNOWLEDGE_STATUS_LABELS[entry.validationStatus]}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{entry.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{entry.summary}</p>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-300 font-medium">适用范围：</span>
                    {entry.scope}
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium">来源与维护：</span>
                    {entry.source} · {entry.owner} · 更新 {entry.updatedAt}
                  </div>
                  <div
                    className={
                      entry.validationStatus === "deprecated"
                        ? "text-rose-300"
                        : "text-amber-300/90"
                    }
                  >
                    <span className="font-medium">注意与警示：</span>
                    {entry.antiPatternOrWarning}
                  </div>
                </div>

                <pre className="p-2.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {entry.copyableSnippet}
                </pre>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.modules.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => onJumpToModule(mod.toLowerCase())}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-[11px] text-white transition-colors cursor-pointer"
                    >
                      打开 {mod}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyText(entry.id, entry.copyableSnippet)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
                >
                  {copiedId === entry.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                      <span>复制内容</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
