import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  KeyRound,
  LogIn,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import {
  createOrder,
  fetchBillingHistory,
  fetchCatalog,
  redeemCode,
  type CatalogResponse,
} from "@/lib/apiClient";

interface BillingModalProps {
  open: boolean;
  onClose: () => void;
  onEntitled?: () => void;
}

function formatCents(cents: number): string {
  return `¥${(cents / 100).toLocaleString("zh-CN", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })}`;
}

export default function BillingModal({ open, onClose, onEntitled }: BillingModalProps) {
  const { session, refreshSession, claimInitialAdmin } = useAuth();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [history, setHistory] = useState<{
    orders: Array<{
      id: number;
      orderNo: string;
      amountCents: number;
      provider: string;
      status: string;
      createdAt: string;
    }>;
    entitlements: Array<{
      id: number;
      scopeType: string;
      scopeRef: string;
      status: string;
      validFrom: string;
      validUntil: string | null;
    }>;
  } | null>(null);

  const [selectedPriceId, setSelectedPriceId] = useState<number | null>(null);
  const [provider, setProvider] = useState<"wechat" | "alipay" | "stripe">("wechat");
  const [redeemInput, setRedeemInput] = useState("");
  const [bootstrapTokenInput, setBootstrapTokenInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const loadData = async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const cat = await fetchCatalog();
      setCatalog(cat);
      const firstPrice = cat.products[0]?.prices[0]?.id;
      if (firstPrice && selectedPriceId === null) {
        setSelectedPriceId(firstPrice);
      }
    } catch (err) {
      setCatalogError(
        err instanceof Error ? err.message : "加载课程商品目录失败，请稍后重试。"
      );
    } finally {
      setCatalogLoading(false);
    }

    if (session) {
      try {
        const hist = await fetchBillingHistory();
        setHistory(hist);
      } catch {
        // ignore history error separately so catalog stays usable
      }
    }
  };

  useEffect(() => {
    if (!open) return;
    setFeedback(null);
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session?.user?.id]);

  if (!open) return null;

  const openEmailLogin = () => {
    onClose();
    window.dispatchEvent(new CustomEvent("app:open-login"));
  };

  const handleCreateOrder = async () => {
    if (!session) {
      openEmailLogin();
      return;
    }
    if (!selectedPriceId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const cohortId = catalog?.activeCohorts[0]?.id;
      const res = await createOrder({
        priceId: selectedPriceId,
        provider,
        cohortId,
      });
      setFeedback({
        ok: true,
        text: `已创建待核销订单 ${res.order.orderNo}（${formatCents(
          res.order.amountCents
        )}）。教务可在后台核销该订单为您开通权益，也可在上方直接兑换激活码即时开通。`,
      });
      await loadData();
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : "创建订单失败。",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      openEmailLogin();
      return;
    }
    if (!redeemInput.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await redeemCode(redeemInput.trim());
      setRedeemInput("");
      await refreshSession();
      await loadData();
      setFeedback({
        ok: true,
        text: `兑换成功！已开通「${res.product.title}」，所有付费模块与云端服务已解锁。`,
      });
      onEntitled?.();
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : "兑换失败，请核对兑换码。",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleClaimAdmin = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await claimInitialAdmin(
        session?.adminBootstrapRequiresToken ? bootstrapTokenInput.trim() : undefined
      );
      setBootstrapTokenInput("");
      setFeedback({
        ok: true,
        text: "已认领系统初始管理员身份！现在可打开「教务后台」生成兑换码、开班或分班。",
      });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : "认领失败。",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="账号权益与订阅管理"
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0b0f19] p-6 space-y-5 text-xs custom-scrollbar shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <div className="text-[11px] font-mono text-gemini-cyan">
              ACCOUNT · ENTITLEMENTS · COHORT ACCESS
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              学习账号、订阅订单与权益兑换
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭弹窗"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account Status Strip */}
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
          {session ? (
            <>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">
                  {session.user.displayName || session.user.email}
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    ({session.user.email})
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300">
                  角色：{session.roles.join(" / ")} · 登录方式：
                  {session.authMethod === "firebase" ? "Firebase Auth" : "邮箱验证码 OTP"} · 权益档位：{" "}
                  <span
                    className={
                      session.hasPaidAccess ? "text-emerald-300 font-semibold" : "text-amber-300"
                    }
                  >
                    {session.accessTier === "staff"
                      ? "教务 / 带班导师（全量教学视图）"
                      : session.accessTier === "enterprise_training"
                      ? "企业内训专班（Cohort 隔离）"
                      : session.accessTier === "cohort_mentored"
                      ? "小班指导班（含导师审阅与三锁授证）"
                      : session.accessTier === "self_paced"
                      ? "全课自学版（个人工作台与自测）"
                      : "免费试学 M1"}
                  </span>
                  {session.unlockedModuleIds && (
                    <span className="ml-2 text-slate-400">
                      · 已解锁 {session.unlockedModuleIds.length}/14 模块
                    </span>
                  )}
                </div>
              </div>
              {session.canClaimInitialAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  {session.adminBootstrapRequiresToken && (
                    <input
                      type="password"
                      value={bootstrapTokenInput}
                      onChange={(e) => setBootstrapTokenInput(e.target.value)}
                      placeholder="输入 ADMIN_BOOTSTRAP_TOKEN"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-amber-400/40 font-mono text-xs text-white placeholder:text-slate-500"
                    />
                  )}
                  <button
                    type="button"
                    disabled={
                      busy ||
                      (Boolean(session.adminBootstrapRequiresToken) &&
                        !bootstrapTokenInput.trim())
                    }
                    onClick={() => void handleClaimAdmin()}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>认领首个管理员权限</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-300">
                请先登录账号，以保存云端学习进度、兑换激活码或下单登记。（支持国内邮箱 6 位验证码直连登录，无需境外账号）
              </span>
              <button
                type="button"
                onClick={openEmailLogin}
                className="px-4 py-2 rounded-lg bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>立即登录账号</span>
              </button>
            </div>
          )}
        </div>

        {/* Instant Redeem Code Box */}
        <form
          onSubmit={handleRedeem}
          className="p-4 rounded-xl border border-gemini-cyan/30 bg-gemini-cyan/[0.05] space-y-2.5"
        >
          <div className="font-semibold text-white inline-flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-gemini-cyan" />
            <span>我有课程兑换码 / 班级激活码</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={redeemInput}
              onChange={(e) => setRedeemInput(e.target.value)}
              placeholder="输入兑换码（例：AICC-XXXXXXXX）"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={busy || !redeemInput.trim()}
              className="px-4 py-2 rounded-lg bg-gemini-cyan text-slate-950 font-semibold cursor-pointer disabled:opacity-50"
            >
              立即兑换激活
            </button>
          </div>
        </form>

        {/* Product & Price Picker */}
        <div className="space-y-3">
          <div className="font-semibold text-white inline-flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-gemini-purple" />
            <span>选择课程方案并创建订单</span>
          </div>

          {catalogLoading && !catalog ? (
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-slate-400">
              正在加载课程套餐与价格方案...
            </div>
          ) : catalogError && !catalog ? (
            <div className="p-4 rounded-xl border border-rose-400/35 bg-rose-500/10 flex flex-wrap items-center justify-between gap-3 text-rose-200">
              <span>{catalogError}</span>
              <button
                type="button"
                onClick={() => void loadData()}
                className="px-3 py-1.5 rounded-lg border border-rose-300/40 bg-rose-500/20 text-white font-semibold cursor-pointer"
              >
                重新加载
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(catalog?.products ?? []).map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5"
              >
                <div>
                  <div className="text-sm font-bold text-white">{prod.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{prod.description}</div>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {prod.prices.map((pr) => {
                    const active = selectedPriceId === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setSelectedPriceId(pr.id)}
                        className={`px-3 py-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                          active
                            ? "border-gemini-cyan bg-gemini-cyan/15 text-white"
                            : "border-white/10 bg-black/30 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        <span>
                          {pr.label} ({pr.durationDays} 天)
                        </span>
                        <span className="font-mono font-bold tabular-nums">
                          {formatCents(pr.amountCents)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">支付渠道：</span>
              {(["wechat", "alipay", "stripe"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setProvider(ch)}
                  className={`px-2.5 py-1 rounded border font-mono cursor-pointer ${
                    provider === ch
                      ? "border-gemini-purple bg-gemini-purple/20 text-white"
                      : "border-white/10 text-slate-400"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy || !selectedPriceId}
              onClick={() => void handleCreateOrder()}
              className="px-4 py-2 rounded-lg bg-gemini-purple text-white font-semibold cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{session ? "生成支付订单" : "登录后下单"}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl border leading-relaxed ${
              feedback.ok
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/40 bg-rose-500/10 text-rose-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Billing & Entitlements History */}
        {session && history && (history.entitlements.length > 0 || history.orders.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="space-y-2">
              <div className="font-semibold text-white">我的课程权益记录</div>
              {history.entitlements.length === 0 ? (
                <div className="text-slate-500">暂无记录</div>
              ) : (
                <div className="space-y-1.5">
                  {history.entitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-2.5 rounded-lg border border-white/10 bg-black/35 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono text-white">
                          {ent.scopeType} · {ent.scopeRef}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          有效期至 {ent.validUntil ? ent.validUntil.slice(0, 10) : "长期"}
                        </div>
                      </div>
                      <span
                        className={`font-mono inline-flex items-center gap-1 ${
                          ent.status === "active"
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {ent.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-white">最近订单流水</div>
              {history.orders.length === 0 ? (
                <div className="text-slate-500">暂无订单</div>
              ) : (
                <div className="space-y-1.5">
                  {history.orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-lg border border-white/10 bg-black/35 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono text-slate-200">{ord.orderNo}</div>
                        <div className="text-[10px] text-slate-400">
                          {ord.provider} · {formatCents(ord.amountCents)}
                        </div>
                      </div>
                      <span
                        className={`font-mono ${
                          ord.status === "paid"
                            ? "text-emerald-300"
                            : ord.status === "pending"
                            ? "text-amber-300"
                            : "text-slate-400"
                        }`}
                      >
                        {ord.status === "paid"
                          ? "已开通"
                          : ord.status === "pending"
                          ? "待核销"
                          : ord.status === "refunded"
                          ? "已退款"
                          : ord.status === "cancelled"
                          ? "已取消"
                          : ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
