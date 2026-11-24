import { ArrowRight, CreditCard, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/authContextCore";

export type WebsitePageRoute = "home" | "teens" | "teams";

interface WebsiteNavbarProps {
  currentPage: WebsitePageRoute;
  hasPaidAccess: boolean;
  onNavigatePage: (page: WebsitePageRoute) => void;
  onEnterWorkspace: (moduleId?: string) => void;
  onEnterProjects?: () => void;
  onOpenBilling: () => void;
  onOpenCohortPanel: () => void;
  onOpenInstructorCockpit: () => void;
  onOpenAdminConsole: () => void;
}

export default function WebsiteNavbar({
  currentPage,
  hasPaidAccess,
  onNavigatePage,
  onEnterWorkspace,
  onEnterProjects,
  onOpenBilling,
  onOpenCohortPanel,
  onOpenInstructorCockpit,
  onOpenAdminConsole,
}: WebsiteNavbarProps) {
  const { session, loading: authLoading, signOutUser } = useAuth();

  const handleAnchor = (anchorId: string) => {
    if (currentPage !== "home") {
      onNavigatePage("home");
      window.setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }
    document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070e]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Zone: Brand Wordmark (single element, no subtitle or badge) */}
          <button
            type="button"
            onClick={() => onNavigatePage("home")}
            className="text-base font-bold text-white tracking-tight whitespace-nowrap shrink-0 cursor-pointer hover:text-gemini-cyan transition-colors"
          >
            Coding Everything 项目学院
          </button>

          {/* Center Zone: Single-line navigation links (<=5 items) */}
          <nav
            aria-label="主导航"
            className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300"
          >
            <button
              type="button"
              onClick={() => handleAnchor("experience")}
              className="whitespace-nowrap shrink-0 hover:text-gemini-cyan transition-colors cursor-pointer"
            >
              免费体验
            </button>
            <button
              type="button"
              onClick={() => handleAnchor("curriculum")}
              className="whitespace-nowrap shrink-0 hover:text-gemini-cyan transition-colors cursor-pointer"
            >
              课程体系
            </button>
            <button
              type="button"
              onClick={() => handleAnchor("pricing")}
              className="whitespace-nowrap shrink-0 hover:text-gemini-cyan transition-colors cursor-pointer"
            >
              学习方案
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teens")}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === "teens"
                  ? "text-gemini-cyan font-semibold"
                  : "hover:text-gemini-cyan"
              }`}
            >
              青少年营
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage("teams")}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                currentPage === "teams"
                  ? "text-gemini-cyan font-semibold"
                  : "hover:text-gemini-cyan"
              }`}
            >
              团队内训
            </button>
          </nav>

          {/* Right Zone: Secondary Auth Trigger + Single Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {session ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenBilling}
                  className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  title={`已登录：${session.user.email}`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-gemini-cyan" />
                  <span className="max-w-[96px] truncate hidden sm:inline">
                    {session.user.displayName || session.user.email}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  aria-label="退出登录"
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => window.dispatchEvent(new CustomEvent("app:open-login"))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>登录</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEnterWorkspace("m1")}
              className="px-3.5 py-1.5 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{hasPaidAccess ? "进入工作台" : "免费体验 M1"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Compact mobile sub-nav bar */}
        <div className="md:hidden border-t border-white/5 px-4 py-2 flex items-center gap-5 overflow-x-auto text-xs text-slate-400">
          <button
            type="button"
            onClick={() => handleAnchor("experience")}
            className="whitespace-nowrap shrink-0 hover:text-gemini-cyan cursor-pointer"
          >
            免费体验
          </button>
          <button
            type="button"
            onClick={() => handleAnchor("curriculum")}
            className="whitespace-nowrap shrink-0 hover:text-gemini-cyan cursor-pointer"
          >
            课程体系
          </button>
          <button
            type="button"
            onClick={() => handleAnchor("pricing")}
            className="whitespace-nowrap shrink-0 hover:text-gemini-cyan cursor-pointer"
          >
            学习方案
          </button>
          <button
            type="button"
            onClick={() => onNavigatePage("teens")}
            className={`whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === "teens" ? "text-gemini-cyan font-semibold" : "hover:text-gemini-cyan"
            }`}
          >
            青少年营
          </button>
          <button
            type="button"
            onClick={() => onNavigatePage("teams")}
            className={`whitespace-nowrap shrink-0 cursor-pointer ${
              currentPage === "teams" ? "text-gemini-cyan font-semibold" : "hover:text-gemini-cyan"
            }`}
          >
            团队内训
          </button>
        </div>
      </header>

      {/* Signed-in role utility strip placed cleanly beneath the public header */}
      {session && (
        <div className="border-b border-white/10 bg-[#080d18] text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-slate-400 text-[11px] flex flex-wrap items-center gap-2">
              <span className="text-slate-200">{session.user.email}</span>
              <span>·</span>
              <span className={hasPaidAccess ? "text-emerald-300" : "text-gemini-cyan"}>
                {hasPaidAccess ? "全课权限已开通" : "M1 免费体验权益"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
              {onEnterProjects && (
                <button
                  type="button"
                  onClick={onEnterProjects}
                  className="text-gemini-cyan hover:text-cyan-200 cursor-pointer"
                >
                  项目学院工作台
                </button>
              )}
              <button
                type="button"
                onClick={onOpenBilling}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                权益与订单
              </button>
              {session.cohortEnrolled && (
                <button
                  type="button"
                  onClick={onOpenCohortPanel}
                  className="text-emerald-300 hover:text-emerald-200 cursor-pointer"
                >
                  我的小班任务
                </button>
              )}
              {(session.isInstructorOrTa || session.isAdmin) && (
                <button
                  type="button"
                  onClick={onOpenInstructorCockpit}
                  className="text-purple-300 hover:text-purple-200 cursor-pointer"
                >
                  教师批改台
                </button>
              )}
              {session.isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdminConsole}
                  className="text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  教务后台
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
