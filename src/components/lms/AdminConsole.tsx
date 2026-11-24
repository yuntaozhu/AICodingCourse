import { useEffect, useState } from "react";
import {
  Ban,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  KeyRound,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { COURSE_MODULES } from "@/data/courseCurriculum";
import {
  adminAssignInstructorApi,
  adminCancelOrderApi,
  adminConfirmOrderApi,
  adminCreateCohortApi,
  adminCreateMilestoneApi,
  adminCreateRedeemCodeApi,
  adminEnrollLearnerApi,
  adminGrantEntitlementApi,
  adminRevokeEntitlementApi,
  adminUpdateInquiryStatusApi,
  adminUpdateRole,
  fetchAdminOverview,
  type AdminOverviewResponse,
} from "@/lib/apiClient";

export default function AdminConsole() {
  const { session, refreshSession } = useAuth();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Forms
  const [roleEmail, setRoleEmail] = useState("");
  const [roleName, setRoleName] = useState<"learner" | "ta" | "instructor" | "admin">(
    "instructor"
  );
  const [grantEmail, setGrantEmail] = useState("");
  const [grantProductId, setGrantProductId] = useState<number>(0);
  const [grantCohortId, setGrantCohortId] = useState<string>("");
  const [grantDays, setGrantDays] = useState<number>(365);

  const [codePriceId, setCodePriceId] = useState<number>(0);
  const [codeCohortId, setCodeCohortId] = useState<string>("");
  const [codeMaxUses, setCodeMaxUses] = useState<number>(5);

  const [cohortCode, setCohortCode] = useState("");
  const [cohortTitle, setCohortTitle] = useState("");
  const [cohortStart, setCohortStart] = useState("2026-12-01");
  const [cohortEnd, setCohortEnd] = useState("2027-01-15");

  const [assignCohortId, setAssignCohortId] = useState<number>(0);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState<"instructor" | "ta">("instructor");

  const [enrollCohortId, setEnrollCohortId] = useState<number>(0);
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollPath, setEnrollPath] = useState<
    "non-tech" | "indie-dev" | "eng-team" | "cs-student"
  >("indie-dev");

  const [msCohortId, setMsCohortId] = useState<number>(0);
  const [msTitle, setMsTitle] = useState("");
  const [msModuleId, setMsModuleId] = useState("m3");
  const [msDueDate, setMsDueDate] = useState("2026-12-15");

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOverview();
      setData(res);
      if (res.products[0] && grantProductId === 0) setGrantProductId(res.products[0].id);
      if (res.prices[0] && codePriceId === 0) setCodePriceId(res.prices[0].id);
      if (res.cohorts[0]) {
        if (assignCohortId === 0) setAssignCohortId(res.cohorts[0].id);
        if (enrollCohortId === 0) setEnrollCohortId(res.cohorts[0].id);
        if (msCohortId === 0) setMsCohortId(res.cohorts[0].id);
      }
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : "加载教务后台失败。",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.isAdmin) {
      void loadOverview();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.isAdmin]);

  if (!session?.isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-xs text-slate-300">
        当前账号不具备管理员（admin）权限。
      </div>
    );
  }

  const runAction = async (fn: () => Promise<unknown>, okText: string) => {
    setStatusMsg(null);
    try {
      await fn();
      setStatusMsg({ ok: true, text: okText });
      await loadOverview();
      await refreshSession();
    } catch (err) {
      setStatusMsg({
        ok: false,
        text: err instanceof Error ? err.message : "操作失败。",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-xs">
      <div className="p-5 rounded-2xl border border-amber-400/40 bg-[#0b0f19] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-amber-300">
            ADMINISTRATION · ROLES · ENTITLEMENTS · COHORTS
          </div>
          <h1 className="text-xl font-bold text-white">教务运营与账号权限后台</h1>
          <p className="text-slate-400">
            管理用户角色、人工开通/退款回收课程权益、生成兑换码、开班指派带班老师及处理官网咨询线索。
          </p>
        </div>
        {data && (
          <div className="flex flex-wrap gap-3 font-mono text-[11px] tabular-nums text-slate-300">
            <span>用户 {data.users.length}</span>
            <span>·</span>
            <span>订单 {data.orders.length}</span>
            <span>·</span>
            <span>权益 {data.entitlements.length}</span>
            <span>·</span>
            <span>班期 {data.cohorts.length}</span>
            <span>·</span>
            <span>咨询线索 {data.inquiries.length}</span>
          </div>
        )}
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl border ${
            statusMsg.ok
              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-400/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {loading && !data ? (
        <div className="p-8 text-center text-slate-400">正在加载教务数据...</div>
      ) : (
        data && (
          <div className="space-y-6">
            {/* Row 1: Role grant + Entitlement grant + Redeem code generator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Role Assignment */}
              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-gemini-cyan" />
                  <span>用户角色授权 / 回收</span>
                </div>
                <input
                  type="email"
                  value={roleEmail}
                  onChange={(e) => setRoleEmail(e.target.value)}
                  placeholder="已登录用户的邮箱"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <select
                  value={roleName}
                  onChange={(e) =>
                    setRoleName(e.target.value as "learner" | "ta" | "instructor" | "admin")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  <option value="instructor">instructor（带班讲师）</option>
                  <option value="ta">ta（助教）</option>
                  <option value="admin">admin（教务管理员）</option>
                  <option value="learner">learner（普通学员）</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void runAction(
                        () => adminUpdateRole({ email: roleEmail, role: roleName, action: "add" }),
                        `已为用户授予 ${roleName} 角色。`
                      )
                    }
                    className="py-2 rounded-lg bg-gemini-cyan text-slate-950 font-semibold cursor-pointer"
                  >
                    授予角色
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void runAction(
                        () =>
                          adminUpdateRole({ email: roleEmail, role: roleName, action: "remove" }),
                        `已移除 ${roleName} 角色。`
                      )
                    }
                    className="py-2 rounded-lg border border-white/15 bg-white/5 text-slate-200 cursor-pointer"
                  >
                    移除角色
                  </button>
                </div>
              </div>

              {/* Manual Entitlement Grant */}
              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>人工开通课程权益</span>
                </div>
                <input
                  type="email"
                  value={grantEmail}
                  onChange={(e) => setGrantEmail(e.target.value)}
                  placeholder="学员邮箱"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <select
                  value={grantProductId}
                  onChange={(e) => setGrantProductId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {data.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={grantCohortId}
                    onChange={(e) => setGrantCohortId(e.target.value)}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                  >
                    <option value="">不绑定班级</option>
                    {data.cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={1095}
                    value={grantDays}
                    onChange={(e) => setGrantDays(Number(e.target.value))}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                    title="有效天数"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(
                      () =>
                        adminGrantEntitlementApi({
                          email: grantEmail,
                          productId: grantProductId,
                          durationDays: grantDays,
                          cohortId: grantCohortId ? Number(grantCohortId) : undefined,
                        }),
                      "已成功开通账号权益。"
                    )
                  }
                  className="w-full py-2 rounded-lg bg-emerald-400 text-slate-950 font-semibold cursor-pointer"
                >
                  确认开通权益
                </button>
              </div>

              {/* Generate Redeem Code */}
              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-gemini-purple" />
                  <span>批量生成兑换码</span>
                </div>
                <select
                  value={codePriceId}
                  onChange={(e) => setCodePriceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {data.prices.map((pr) => {
                    const prod = data.products.find((p) => p.id === pr.productId);
                    return (
                      <option key={pr.id} value={pr.id}>
                        {prod?.title} · {pr.label} ({pr.durationDays}d)
                      </option>
                    );
                  })}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={codeCohortId}
                    onChange={(e) => setCodeCohortId(e.target.value)}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                  >
                    <option value="">纯自助权益</option>
                    {data.cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        附带入班：{c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={codeMaxUses}
                    onChange={(e) => setCodeMaxUses(Number(e.target.value))}
                    className="px-2.5 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                    title="最大可用次数"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const selectedPrice = data.prices.find((p) => p.id === codePriceId);
                    if (!selectedPrice) return;
                    void runAction(
                      async () => {
                        const res = await adminCreateRedeemCodeApi({
                          productId: selectedPrice.productId,
                          priceId: selectedPrice.id,
                          cohortId: codeCohortId ? Number(codeCohortId) : undefined,
                          maxUses: codeMaxUses,
                        });
                        setStatusMsg({
                          ok: true,
                          text: `新兑换码已生成：${res.redeemCode.code}（可用 ${res.redeemCode.maxUses} 次）`,
                        });
                      },
                      "新兑换码已生成。"
                    );
                  }}
                  className="w-full py-2 rounded-lg bg-gemini-purple text-white font-semibold cursor-pointer"
                >
                  生成兑换码
                </button>
              </div>
            </div>

            {/* Row 2: Cohort Management (Create, Assign Instructor, Enroll Learner) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-2.5">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-gemini-cyan" />
                  <span>开设新小班期次 (Cohort)</span>
                </div>
                <input
                  type="text"
                  value={cohortCode}
                  onChange={(e) => setCohortCode(e.target.value)}
                  placeholder="期次编号，如 COHORT-2026-12"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <input
                  type="text"
                  value={cohortTitle}
                  onChange={(e) => setCohortTitle(e.target.value)}
                  placeholder="期次名称"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={cohortStart}
                    onChange={(e) => setCohortStart(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                  />
                  <input
                    type="date"
                    value={cohortEnd}
                    onChange={(e) => setCohortEnd(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(
                      () =>
                        adminCreateCohortApi({
                          code: cohortCode,
                          title: cohortTitle,
                          startDate: cohortStart,
                          endDate: cohortEnd,
                          maxSeats: 25,
                        }),
                      "新班期已创建。"
                    )
                  }
                  className="w-full py-2 rounded-lg bg-white text-slate-950 font-semibold cursor-pointer"
                >
                  创建班期
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-2.5">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gemini-purple" />
                  <span>指派班级带班老师 / 助教</span>
                </div>
                <select
                  value={assignCohortId}
                  onChange={(e) => setAssignCohortId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {data.cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.title}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  placeholder="老师 / 助教账号邮箱"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as "instructor" | "ta")}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  <option value="instructor">主讲/指导老师 (instructor)</option>
                  <option value="ta">助教 (ta)</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(
                      () =>
                        adminAssignInstructorApi(assignCohortId, {
                          email: assignEmail,
                          staffRole: assignRole,
                        }),
                      "已指派带班老师（教师批改台仅对其负责班级可见）。"
                    )
                  }
                  className="w-full py-2 rounded-lg bg-gemini-purple text-white font-semibold cursor-pointer"
                >
                  确认指派
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-2.5">
                <div className="font-semibold text-white">学员手动分班</div>
                <select
                  value={enrollCohortId}
                  onChange={(e) => setEnrollCohortId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {data.cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.title}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  value={enrollEmail}
                  onChange={(e) => setEnrollEmail(e.target.value)}
                  placeholder="学员账号邮箱"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <select
                  value={enrollPath}
                  onChange={(e) =>
                    setEnrollPath(
                      e.target.value as "non-tech" | "indie-dev" | "eng-team" | "cs-student"
                    )
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  <option value="indie-dev">独立开发者 (M13-Eng)</option>
                  <option value="non-tech">产品经理/非技术 (M13-Gov)</option>
                  <option value="eng-team">研发团队 (M13-Eng)</option>
                  <option value="cs-student">高校计算机学生 (M13-Eng)</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    void runAction(
                      () =>
                        adminEnrollLearnerApi(enrollCohortId, {
                          email: enrollEmail,
                          targetPathId: enrollPath,
                        }),
                      "已完成学员分班。"
                    )
                  }
                  className="w-full py-2 rounded-lg bg-gemini-cyan text-slate-950 font-semibold cursor-pointer"
                >
                  加入班级
                </button>
              </div>
            </div>

            {/* Row 2.5: Cohort Milestones & Pending Order Fulfillment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-2.5">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <CalendarPlus className="w-4 h-4 text-emerald-400" />
                  <span>新增班级里程碑任务</span>
                </div>
                <select
                  value={msCohortId}
                  onChange={(e) => setMsCohortId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {data.cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}（{c.milestones.length} 个里程碑 / {c.enrollments.length} 人）
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  placeholder="里程碑名称，如 Checkpoint 1 · M3 鉴权实战"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={msModuleId}
                    onChange={(e) => setMsModuleId(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                  >
                    {COURSE_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={msDueDate}
                    onChange={(e) => setMsDueDate(e.target.value)}
                    className="px-2 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white"
                  />
                </div>
                <button
                  type="button"
                  disabled={!msCohortId || msTitle.trim().length < 3}
                  onClick={() =>
                    void runAction(
                      async () => {
                        await adminCreateMilestoneApi(msCohortId, {
                          title: msTitle.trim(),
                          moduleId: msModuleId,
                          dueDate: msDueDate,
                        });
                        setMsTitle("");
                      },
                      "已为该班期新增里程碑节点。"
                    )
                  }
                  className="w-full py-2 rounded-lg bg-emerald-400 text-slate-950 font-semibold cursor-pointer disabled:opacity-50"
                >
                  添加里程碑
                </button>
              </div>

              <div className="lg:col-span-8 p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-white inline-flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>订单核销与收款流水 ({data.orders.length})</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    待核销 {data.orders.filter((o) => o.status === "pending").length} 笔
                  </span>
                </div>
                {data.orders.length === 0 ? (
                  <div className="text-slate-500 py-4">暂无订单记录。</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {data.orders.map((ord) => {
                      const buyer = data.users.find((u) => u.id === ord.userId);
                      const prod = data.products.find((p) => p.id === ord.productId);
                      return (
                        <div
                          key={ord.id}
                          className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white font-semibold">
                                {ord.orderNo}
                              </span>
                              <span
                                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                  ord.status === "paid"
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : ord.status === "pending"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-white/10 text-slate-400"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {buyer?.email || `User #${ord.userId}`} ·{" "}
                              {prod?.title || `Product #${ord.productId}`} ·{" "}
                              <span className="font-mono text-slate-200">
                                ¥{(ord.amountCents / 100).toFixed(0)} ({ord.provider})
                              </span>
                            </div>
                          </div>
                          {ord.status === "pending" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  void runAction(
                                    () => adminConfirmOrderApi(ord.id),
                                    `订单 ${ord.orderNo} 已核销收款并自动开通对应课程/班级权益。`
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-emerald-400 text-slate-950 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" /> 核销开通
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void runAction(
                                    () => adminCancelOrderApi(ord.id),
                                    `订单 ${ord.orderNo} 已取消。`
                                  )
                                }
                                className="px-2 py-1 rounded border border-white/15 bg-white/5 text-slate-300 text-[11px] cursor-pointer"
                              >
                                取消
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Redeem codes + Entitlements (with Revoke/Refund) + Inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="font-semibold text-white">
                  已开通权益与退款/回收控制 ({data.entitlements.length})
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {data.entitlements.map((ent) => {
                    const user = data.users.find((u) => u.id === ent.userId);
                    return (
                      <div
                        key={ent.id}
                        className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-white font-medium">
                            {user?.email || `User #${ent.userId}`}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {ent.scopeType} · {ent.scopeRef} · 状态：{ent.status}
                          </div>
                        </div>
                        {ent.status === "active" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                void runAction(
                                  () => adminRevokeEntitlementApi(ent.id, "refunded"),
                                  "已标记退款并回收权益。"
                                )
                              }
                              className="px-2 py-1 rounded bg-rose-500/20 text-rose-200 font-mono text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3 h-3" /> 退款回收
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="font-semibold text-white mb-2">
                    可用兑换码列表 ({data.redeemCodes.length})
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {data.redeemCodes.map((rc) => (
                      <div
                        key={rc.id}
                        className="px-2.5 py-1.5 rounded-lg bg-black/35 border border-white/10 flex items-center justify-between font-mono text-[11px]"
                      >
                        <span className="text-gemini-cyan">{rc.code}</span>
                        <span className="text-slate-400">
                          已用 {rc.usedCount}/{rc.maxUses}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
                <div className="font-semibold text-white inline-flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-gemini-cyan" />
                  <span>官网咨询与团队内训线索 ({data.inquiries.length})</span>
                </div>
                {data.inquiries.length === 0 ? (
                  <div className="text-slate-500 py-4">暂无来自官网的咨询记录。</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {data.inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-3 rounded-xl border border-white/10 bg-black/40 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-white">
                            {inq.name} · {inq.contact}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="text-gemini-cyan">{inq.inquiryType}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                inq.status === "closed"
                                  ? "bg-white/10 text-slate-400"
                                  : inq.status === "contacted"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                        </div>
                        {inq.organization && (
                          <div className="text-[11px] text-slate-400">
                            机构：{inq.organization}
                          </div>
                        )}
                        <div className="text-slate-300 leading-relaxed">{inq.message}</div>
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
                          {inq.status !== "contacted" && (
                            <button
                              type="button"
                              onClick={() =>
                                void runAction(
                                  () => adminUpdateInquiryStatusApi(inq.id, "contacted"),
                                  "已标记该咨询线索为「已联系」。"
                                )
                              }
                              className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 cursor-pointer"
                            >
                              标记已联系
                            </button>
                          )}
                          {inq.status !== "closed" && (
                            <button
                              type="button"
                              onClick={() =>
                                void runAction(
                                  () => adminUpdateInquiryStatusApi(inq.id, "closed"),
                                  "已标记该咨询线索为「已闭环」。"
                                )
                              }
                              className="px-2 py-0.5 rounded bg-white/10 text-slate-300 cursor-pointer"
                            >
                              归档闭环
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
