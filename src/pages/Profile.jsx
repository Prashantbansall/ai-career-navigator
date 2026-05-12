import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Clock3,
  FileStack,
  FileText,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  UserRound,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import EmptyState from "../components/ui/EmptyState";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import { useAuth } from "../context/AuthContext";
import { getUserProfileSummaryAPI } from "../services/api";

const defaultSummary = {
  totalAnalyses: 0,
  averageReadinessScore: 0,
  highestReadinessScore: 0,
  mostRecentTargetRole: "Not available",
  mostRecentRoleTitle: "Create an analysis to personalize this profile",
  latestAnalysis: null,
  roleBreakdown: [],
};

const formatDate = (date) => {
  if (!date) return "Not available yet";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getReadinessLabel = (score) => {
  if (score <= 40) return "Needs Focus";
  if (score <= 70) return "Almost Ready";
  return "Job Ready";
};

const getReadinessVariant = (score) => {
  if (score <= 40) return "danger";
  if (score <= 70) return "warning";
  return "success";
};

function StatCard({ icon: Icon, label, value, helper, accent = "indigo" }) {
  const accentClasses = {
    indigo: "border-indigo-400/20 bg-indigo-500/10 text-indigo-200",
    green: "border-green-400/20 bg-green-500/10 text-green-200",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/10 text-violet-200",
  };

  return (
    <Card className="group relative overflow-hidden hover:bg-white/5">
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-white/5 blur-2xl transition group-hover:bg-indigo-500/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-white md:text-4xl">
            {value}
          </p>
          {helper && <p className="mt-2 text-sm text-slate-400">{helper}</p>}
        </div>

        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${accentClasses[accent]}`}
          aria-hidden="true"
        >
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}

function LoadingProfile() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")?.[0] || "Learner";
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const accountCreatedAt = user?.createdAt || user?.created_at;

  const joinedDate = formatDate(accountCreatedAt);

  const averageReadiness = Number(summary.averageReadinessScore || 0);
  const highestReadiness = Number(summary.highestReadinessScore || 0);

  const topRole = useMemo(() => {
    if (!summary.roleBreakdown?.length) return null;
    return summary.roleBreakdown[0];
  }, [summary.roleBreakdown]);

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setSummary(defaultSummary);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getUserProfileSummaryAPI();
      setSummary({ ...defaultSummary, ...data });
    } catch (err) {
      setError(err.message || "Unable to load profile summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchProfile, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <GradientBackground>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10 md:py-16">
          <EmptyState
            icon={UserRound}
            title="Sign in to view your profile"
            description="Your saved profile shows account details, analysis stats, average readiness, and recent target-role activity after you log in."
            action={
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <GlowButton to="/signin" variant="solid">
                  Sign In
                </GlowButton>
                <GlowButton to="/signup" variant="subtle">
                  Create Account
                </GlowButton>
              </div>
            }
          />
        </main>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:pt-10">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-indigo-950/20 md:p-8"
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200">
                <ShieldCheck size={16} aria-hidden="true" />
                Saved user profile
              </p>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {firstName}'s Career Profile
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-lg">
                Track your account-level progress, latest role focus, readiness
                trend, and saved analysis activity from one personalized SaaS
                workspace.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <GlowButton to="/upload" variant="solid">
                  <UploadCloud size={18} aria-hidden="true" />
                  Analyze New Resume
                </GlowButton>
                <GlowButton to="/history" variant="subtle">
                  <FileText size={18} aria-hidden="true" />
                  View Saved Analyses
                </GlowButton>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-emerald-400 text-2xl font-black text-white shadow-lg shadow-indigo-500/20">
                  {userInitial}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">
                    {user?.name || "Career Navigator User"}
                  </h2>
                  <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-slate-400">
                    <Mail size={15} aria-hidden="true" />
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays size={16} aria-hidden="true" />
                    Joined
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {joinedDate}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                    <Target size={16} aria-hidden="true" />
                    Recent role
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-100">
                    {summary.mostRecentTargetRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <LoadingProfile />
        ) : error ? (
          <Card className="border-red-400/20 bg-red-500/10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-red-400/20 bg-red-500/15 text-red-200">
                  <AlertTriangle size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-100">
                    Profile summary unavailable
                  </h2>
                  <p className="mt-1 text-sm text-red-200/80">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchProfile}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <RefreshCcw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </Card>
        ) : (
          <>
            <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={FileText}
                label="Total analyses"
                value={summary.totalAnalyses}
                helper="Saved to your account"
                accent="indigo"
              />
              <StatCard
                icon={BarChart3}
                label="Average readiness"
                value={`${averageReadiness}%`}
                helper={getReadinessLabel(averageReadiness)}
                accent="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Best score"
                value={`${highestReadiness}%`}
                helper="Highest saved readiness"
                accent="cyan"
              />
              <StatCard
                icon={Target}
                label="Recent role"
                value={summary.mostRecentTargetRole || "N/A"}
                helper={summary.mostRecentRoleTitle}
                accent="violet"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="relative overflow-hidden">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-500/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-300">
                        <Sparkles size={17} aria-hidden="true" />
                        Readiness snapshot
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-white">
                        Account progress summary
                      </h2>
                    </div>

                    <AnimatedBadge
                      variant={getReadinessVariant(averageReadiness)}
                      className="shrink-0"
                    >
                      {getReadinessLabel(averageReadiness)}
                    </AnimatedBadge>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Average readiness
                    </p>
                    <p className="mt-3 text-6xl font-black text-green-300">
                      {averageReadiness}%
                    </p>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-400 transition-all duration-500"
                        style={{ width: `${Math.min(averageReadiness, 100)}%` }}
                      />
                    </div>
                    <p className="mt-4 text-sm text-slate-400">
                      Based on {summary.totalAnalyses} saved analysis
                      {summary.totalAnalyses === 1 ? "" : "es"}.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300">
                      <Clock3 size={17} aria-hidden="true" />
                      Latest activity
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      Most recent analysis
                    </h2>
                  </div>

                  {summary.latestAnalysis?._id && (
                    <Link
                      to="/history"
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
                    >
                      Open History
                    </Link>
                  )}
                </div>

                {summary.latestAnalysis ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {summary.latestAnalysis.resumeName ||
                            "Uploaded Resume"}
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Targeting{" "}
                          {summary.latestAnalysis.roleTitle ||
                            summary.latestAnalysis.targetRole}
                        </p>
                      </div>

                      <AnimatedBadge
                        variant={getReadinessVariant(
                          Number(summary.latestAnalysis.jobReadiness || 0),
                        )}
                      >
                        {summary.latestAnalysis.jobReadiness || 0}%
                      </AnimatedBadge>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Target role
                        </p>
                        <p className="mt-2 font-semibold text-slate-100">
                          {summary.latestAnalysis.targetRole || "Not specified"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          Saved on
                        </p>
                        <p className="mt-2 font-semibold text-slate-100">
                          {formatDate(summary.latestAnalysis.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                    <FileText
                      size={36}
                      className="mx-auto text-slate-500"
                      aria-hidden="true"
                    />
                    <h3 className="mt-4 text-xl font-bold text-white">
                      No saved analysis yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                      Upload a resume and choose a target role to start filling
                      your profile with personalized career data.
                    </p>
                    <div className="mt-6">
                      <GlowButton to="/upload" variant="solid">
                        Start First Analysis
                      </GlowButton>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Target
                    size={22}
                    className="text-indigo-300"
                    aria-hidden="true"
                  />
                  Role focus
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Your most frequent saved target roles help the app feel tuned
                  to your career direction.
                </p>

                {summary.roleBreakdown?.length ? (
                  <div className="mt-6 space-y-3">
                    {summary.roleBreakdown.slice(0, 4).map((role) => (
                      <div
                        key={role.role}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">
                              {role.role}
                            </p>
                            <p className="text-sm text-slate-500">
                              {role.count} saved analysis
                              {role.count === 1 ? "" : "es"}
                            </p>
                          </div>
                          {topRole?.role === role.role && (
                            <AnimatedBadge variant="default">
                              Top Role
                            </AnimatedBadge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                    Role insights will appear after your first saved analysis.
                  </p>
                )}
              </Card>

              <Card>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <ShieldCheck
                    size={22}
                    className="text-green-300"
                    aria-hidden="true"
                  />
                  Profile next steps
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Keep your account workspace useful by refreshing your resume
                  as your skills improve.
                </p>

                <div className="mt-6 grid gap-3">
                  <Link
                    to="/upload"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <p className="font-semibold text-white">
                      Upload updated resume
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Compare your next readiness score with your current
                      average.
                    </p>
                  </Link>

                  <Link
                    to="/resume-profiles"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <p className="flex items-center gap-2 font-semibold text-white">
                      <FileStack size={17} aria-hidden="true" />
                      Manage resume profiles
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Organize analyses into SDE, AI/ML, Frontend, DevOps, and
                      other role-based resume groups.
                    </p>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <p className="font-semibold text-white">Open dashboard</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Continue learning from the latest selected roadmap.
                    </p>
                  </Link>

                  <Link
                    to="/community"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10"
                  >
                    <p className="font-semibold text-white">
                      Compare with community
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      See what other learners are preparing for across roles.
                    </p>
                  </Link>
                </div>
              </Card>
            </section>
          </>
        )}
      </main>
    </GradientBackground>
  );
}
