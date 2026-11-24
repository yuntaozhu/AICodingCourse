import { useEffect, useState } from "react";
import { ArrowLeft, KeyRound, LogIn, Mail, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/context/authContextCore";

interface EmailLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmailLoginModal({ open, onClose }: EmailLoginModalProps) {
  const { requestEmailOtp, verifyEmailOtp, signInWithGoogle, authError, clearAuthError } =
    useAuth();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [deliveryHint, setDeliveryHint] = useState<string | null>(null);
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (!open) return null;

  const resetToEmailStep = () => {
    setStep("email");
    setCodeInput("");
    setDeliveryHint(null);
    setDevPreviewCode(null);
    clearAuthError();
  };

  const handleClose = () => {
    clearAuthError();
    onClose();
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const targetEmail = emailInput.trim();
    if (!targetEmail) return;
    setSubmitting(true);
    clearAuthError();
    try {
      const res = await requestEmailOtp(targetEmail);
      setStep("verify");
      setCooldown(res.cooldownSeconds || 60);
      if (res.devPreviewCode) {
        setDevPreviewCode(res.devPreviewCode);
        setDeliveryHint("当前为本地开发环境，已生成开发预览验证码（仅非生产环境显示）：");
      } else {
        setDevPreviewCode(null);
        setDeliveryHint(`6 位登录验证码已发送至 ${targetEmail}（10 分钟内有效，请查收收件箱或垃圾箱）。`);
      }
    } catch {
      // error displayed via authError
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailInput.trim();
    const cleanCode = codeInput.replace(/\D/g, "").slice(0, 6);
    if (!targetEmail || cleanCode.length !== 6) return;
    setSubmitting(true);
    clearAuthError();
    try {
      await verifyEmailOtp(targetEmail, cleanCode);
      setEmailInput("");
      setCodeInput("");
      setStep("email");
      setDevPreviewCode(null);
      setDeliveryHint(null);
      onClose();
    } catch {
      // error displayed via authError
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="账号登录"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0f19] p-6 space-y-5 text-xs shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <div className="text-[11px] font-mono text-gemini-cyan">
              SECURE EMAIL OTP · 国内直连
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {step === "email" ? "邮箱验证码安全登录" : "输入 6 位登录验证码"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="关闭弹窗"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">电子邮箱地址 *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="例如：your-name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white placeholder:text-slate-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">
                系统将向该邮箱发送 6 位一次性安全验证码，验证通过后自动签发会话令牌并同步权益与学习进度。
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-200 leading-relaxed">
                {authError}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                disabled={submitting || !emailInput.trim()}
                className="w-full py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-gemini-cyan/20"
              >
                <Mail className="w-4 h-4" />
                <span>{submitting ? "正在发送验证码..." : "发送 6 位登录验证码"}</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px]">或海外/标准通道</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  void signInWithGoogle();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 text-slate-200 font-medium inline-flex items-center justify-center gap-1.5 hover:bg-white/10 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-gemini-purple" />
                <span>Google 账号登录 (支持弹窗)</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="font-mono truncate">{emailInput.trim()}</span>
              <button
                type="button"
                onClick={resetToEmailStep}
                className="inline-flex items-center gap-1 text-gemini-cyan hover:underline shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                更换邮箱
              </button>
            </div>

            {deliveryHint && (
              <div className="p-3 rounded-xl border border-gemini-cyan/30 bg-gemini-cyan/10 text-slate-200 leading-relaxed space-y-1.5">
                <div>{deliveryHint}</div>
                {devPreviewCode && (
                  <div className="font-mono text-base font-bold tracking-[0.25em] text-gemini-cyan bg-black/50 px-3 py-1.5 rounded-lg inline-block">
                    {devPreviewCode}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-medium">6 位数字验证码 *</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="输入 6 位数字验证码"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white placeholder:text-slate-500 font-mono tracking-[0.2em]"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-200 leading-relaxed">
                {authError}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="submit"
                disabled={submitting || codeInput.replace(/\D/g, "").length !== 6}
                className="w-full py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-gemini-cyan/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? "正在核验..." : "验证并登录"}</span>
              </button>

              <button
                type="button"
                disabled={submitting || cooldown > 0}
                onClick={() => void handleSendOtp()}
                className="w-full py-2 rounded-xl border border-white/15 bg-white/5 text-slate-200 font-medium inline-flex items-center justify-center gap-1.5 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {cooldown > 0 ? `重新发送验证码 (${cooldown}s)` : "重新发送验证码"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
