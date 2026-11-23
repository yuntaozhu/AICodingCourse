import { useState } from "react";
import { LogIn, Mail, ShieldCheck, X } from "lucide-react";
import { useAuth } from "@/context/authContextCore";

interface EmailLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmailLoginModal({ open, onClose }: EmailLoginModalProps) {
  const { signInWithEmail, signInWithGoogle, authError, clearAuthError } = useAuth();
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubmitting(true);
    clearAuthError();
    try {
      await signInWithEmail(emailInput.trim());
      setEmailInput("");
      onClose();
    } catch {
      // error handled in auth context
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
              SECURE ACCOUNT LOGIN · 国内直连
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              使用电子邮箱直接登录
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              提示：中国国内网络无需配置 Google 即可直接使用邮箱免密/安全令牌登录系统。
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
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? "正在登录..." : "邮箱一键登录 / 注册"}</span>
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
      </div>
    </div>
  );
}
