import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CalendarDays,
  ChevronRight,
  FileStack,
  FileText,
  FolderKanban,
  History,
  Layers3,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import EmptyState from "../components/ui/EmptyState";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useAuth } from "../context/AuthContext";
import { getAnalysisByIdAPI, getAnalysisHistoryAPI } from "../services/api";

const profileTemplates = [
  {
    key: "SDE",
    name: "SDE Resume",
    role: "SDE",
    description:
      "Backend, DSA, system design, APIs, and full-stack engineering readiness.",
    accent: "indigo",
  },
  {
    key: "AI/ML",
    name: "AI/ML Resume",
    role: "AI/ML",
    description:
      "Python, ML fundamentals, model projects, data workflows, and AI portfolio focus.",
    accent: "emerald",
  },
  {
    key: "Frontend",
    name: "Frontend Resume",
    role: "Frontend",
    description:
      "React, UI polish, responsive design, accessibility, and product-ready projects.",
    accent: "cyan",
  },
  {
    key: "DevOps",
    name: "DevOps Resume",
    role: "DevOps",
    description:
      "Linux, Docker, CI/CD, cloud basics, monitoring, and deployment skills.",
    accent: "violet",
  },
  {
    key: "Data Science",
    name: "Data Science Resume",
    role: "Data Science",
    description:
      "Analytics, SQL, Python, statistics, dashboards, and data storytelling projects.",
    accent: "amber",
  },
  {
    key: "Backend",
    name: "Backend Resume",
    role: "Backend",
    description:
      "Node.js, databases, APIs, authentication, testing, and scalable backend design.",
    accent: "rose",
  },
];

const accentStyles = {
  indigo: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
  violet: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
};

const formatDate = (date) => {
  if (!date) return "No analysis yet";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getScoreVariant = (score) => {
  if (score <= 40) return "danger";
  if (score <= 70) return "warning";
  return "success";
};

const getScoreLabel = (score) => {
  if (score <= 40) return "Needs Focus";
  if (score <= 70) return "Almost Ready";
  return "Job Ready";
};

const normalizeRole = (role = "") => role.trim().toLowerCase();

function buildProfiles(analyses = []) {
  const templateMap = new Map(
    profileTemplates.map((template) => [
      normalizeRole(template.role),
      template,
    ]),
  );

  const grouped = new Map();

  analyses.forEach((analysis) => {
    const role = analysis.targetRole || analysis.roleTitle || "General";
    const roleKey = normalizeRole(role);
    const template = templateMap.get(roleKey) || {
      key: role,
      name: `${role} Resume`,
      role,
      description:
        "Custom role preparation profile created from your saved analyses.",
      accent: "indigo",
    };

    if (!grouped.has(roleKey)) {
      grouped.set(roleKey, {
        ...template,
        analyses: [],
      });
    }

    grouped.get(roleKey).analyses.push(analysis);
  });

  profileTemplates.forEach((template) => {
    const roleKey = normalizeRole(template.role);
    if (!grouped.has(roleKey)) {
      grouped.set(roleKey, {
        ...template,
        analyses: [],
      });
    }
  });

  return Array.from(grouped.values()).map((profile) => {
    const sortedAnalyses = [...profile.analyses].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    const scores = sortedAnalyses.map((item) => Number(item.jobReadiness || 0));
    const averageReadiness = scores.length
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : 0;
    const bestReadiness = scores.length ? Math.max(...scores) : 0;
    const latestAnalysis = sortedAnalyses[0] || null;

    return {
      ...profile,
      analyses: sortedAnalyses,
      totalAnalyses: sortedAnalyses.length,
      averageReadiness,
      bestReadiness,
      latestAnalysis,
      latestDate: latestAnalysis?.createdAt,
    };
  });
}

function ProfileMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={16} aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function LoadingProfiles() {
  return (
    <LoadingState
      variant="inline"
      title="Loading resume profiles..."
      description="Grouping your saved analyses into role-based resume workspaces."
    />
  );
}

export default function ResumeProfiles() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [selectedProfileKey, setSelectedProfileKey] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(isAuthenticated);
  const [openingId, setOpeningId] = useState("");
  const [error, setError] = useState("");

  const firstName = user?.name?.split(" ")?.[0] || "Learner";

  const fetchProfiles = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setAnalyses([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getAnalysisHistoryAPI({
        page: 1,
        limit: 100,
        sort: "newest",
      });

      setAnalyses(data?.analyses || []);
    } catch (err) {
      const message = err.message || "Unable to load resume profiles.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchProfiles, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const profiles = useMemo(() => buildProfiles(analyses), [analyses]);

  const visibleProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesSelected =
        selectedProfileKey === "All" || profile.key === selectedProfileKey;

      const matchesSearch =
        !normalizedSearch ||
        profile.name.toLowerCase().includes(normalizedSearch) ||
        profile.role.toLowerCase().includes(normalizedSearch) ||
        profile.description.toLowerCase().includes(normalizedSearch) ||
        profile.analyses.some((analysis) =>
          [analysis.resumeName, analysis.roleTitle, analysis.targetRole]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch)),
        );

      return matchesSelected && matchesSearch;
    });
  }, [profiles, searchTerm, selectedProfileKey]);

  const activeProfiles = profiles.filter(
    (profile) => profile.totalAnalyses > 0,
  );
  const totalAnalyses = analyses.length;
  const averageReadiness = totalAnalyses
    ? Math.round(
        analyses.reduce(
          (sum, analysis) => sum + Number(analysis.jobReadiness || 0),
          0,
        ) / totalAnalyses,
      )
    : 0;
  const bestProfile = activeProfiles.length
    ? [...activeProfiles].sort((a, b) => b.bestReadiness - a.bestReadiness)[0]
    : null;

  const openLatestAnalysis = async (analysisId) => {
    if (!analysisId) return;

    try {
      setOpeningId(analysisId);
      setError("");

      const analysis = await getAnalysisByIdAPI(analysisId);
      localStorage.setItem("analysis", JSON.stringify(analysis));

      navigate("/dashboard", {
        state: {
          analysis,
        },
      });

      toast.success("Resume profile opened in dashboard");
    } catch (err) {
      const message = err.message || "Failed to open resume profile.";
      setError(message);
      toast.error(message);
    } finally {
      setOpeningId("");
    }
  };

  if (!isAuthenticated) {
    return (
      <GradientBackground>
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-4xl px-4 py-10 md:py-16"
        >
          <EmptyState
            icon={FileStack}
            title="Sign in to manage resume profiles"
            description="Resume profiles organize your saved analyses by role, so you can prepare separate resumes for SDE, AI/ML, Frontend, DevOps, and more."
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

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:pt-10"
      >
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-indigo-950/20 md:p-8"
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200">
                <Layers3 size={16} aria-hidden="true" />
                Multiple resume profiles
              </p>

              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {firstName}'s Role-Based Resume Workspace
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-lg">
                Organize saved analyses into role-focused profiles like SDE
                Resume, AI/ML Resume, Frontend Resume, and DevOps Resume so you
                can prepare for multiple career paths without mixing progress.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <GlowButton to="/upload" variant="solid">
                  <UploadCloud size={18} aria-hidden="true" />
                  Analyze Another Resume
                </GlowButton>
                <GlowButton to="/history" variant="subtle">
                  <History size={18} aria-hidden="true" />
                  View Full History
                </GlowButton>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active profiles
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {activeProfiles.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Saved analyses
                </p>
                <p className="mt-2 text-3xl font-black text-white">
                  {totalAnalyses}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Avg readiness
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-300">
                  {averageReadiness}%
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="hover:bg-white/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <FolderKanban size={18} aria-hidden="true" />
                  <h2 className="text-lg font-bold text-white">
                    Profile Filters
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Search or switch between role profiles to see grouped
                  analyses.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchProfiles}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw
                  size={16}
                  aria-hidden="true"
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search profile, role, resume..."
                  aria-label="Search resume profiles"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-slate-200 placeholder:text-slate-500 transition focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedProfileKey("All")}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedProfileKey === "All"
                      ? "border-indigo-400/40 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  All Profiles
                </button>

                {profiles.map((profile) => (
                  <button
                    type="button"
                    key={profile.key}
                    onClick={() => setSelectedProfileKey(profile.key)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      selectedProfileKey === profile.key
                        ? "border-indigo-400/40 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {profile.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="hover:bg-white/5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
                <ShieldCheck size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Best prepared profile
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {bestProfile
                    ? `${bestProfile.name} is currently strongest with ${bestProfile.bestReadiness}% best readiness.`
                    : "Create your first analysis to identify your strongest resume profile."}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {error && (
          <ErrorState
            className="mb-8"
            title="Resume profiles unavailable"
            description="We could not load your grouped resume profile workspace right now."
            details={error}
            onAction={fetchProfiles}
            actionLabel="Retry"
          />
        )}

        {loading ? (
          <LoadingProfiles />
        ) : totalAnalyses === 0 ? (
          <EmptyState
            icon={FileStack}
            title="No resume profiles yet"
            description="Upload and analyze your first resume. After that, this workspace will automatically group analyses into role-based profiles like SDE Resume, AI/ML Resume, and Frontend Resume."
            action={
              <GlowButton to="/upload" variant="solid">
                <Plus size={18} aria-hidden="true" />
                Create First Resume Profile
              </GlowButton>
            }
          />
        ) : visibleProfiles.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching resume profiles"
            description="Try clearing the search text or choose All Profiles to see every role-based profile."
            compact
          />
        ) : (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 lg:grid-cols-2"
          >
            {visibleProfiles.map((profile) => {
              const latest = profile.latestAnalysis;
              const accentClass =
                accentStyles[profile.accent] || accentStyles.indigo;
              const hasAnalyses = profile.totalAnalyses > 0;

              return (
                <motion.article
                  key={profile.key}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                  className={`group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 md:p-6 ${
                    hasAnalyses
                      ? "border-white/10 bg-white/[0.035] hover:border-indigo-400/40 hover:shadow-indigo-500/10"
                      : "border-dashed border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/10 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-emerald-500/10 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${accentClass}`}
                        >
                          <Briefcase size={24} aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-2xl font-black text-white">
                              {profile.name}
                            </h3>
                            <AnimatedBadge>{profile.role}</AnimatedBadge>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-400">
                            {profile.description}
                          </p>
                        </div>
                      </div>

                      <AnimatedBadge
                        variant={
                          hasAnalyses
                            ? getScoreVariant(profile.averageReadiness)
                            : "default"
                        }
                      >
                        {hasAnalyses
                          ? getScoreLabel(profile.averageReadiness)
                          : "Template"}
                      </AnimatedBadge>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <ProfileMetric
                        icon={FileText}
                        label="Analyses"
                        value={profile.totalAnalyses}
                      />
                      <ProfileMetric
                        icon={BarChart3}
                        label="Average"
                        value={`${profile.averageReadiness}%`}
                      />
                      <ProfileMetric
                        icon={TrendingUp}
                        label="Best"
                        value={`${profile.bestReadiness}%`}
                      />
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            <CalendarDays size={15} aria-hidden="true" />
                            Latest saved analysis
                          </p>
                          <h4 className="mt-2 text-lg font-bold text-white">
                            {latest?.resumeName || "No resume analyzed yet"}
                          </h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {latest
                              ? `${latest.roleTitle || profile.role} • ${formatDate(latest.createdAt)}`
                              : "Analyze a resume for this role to activate the profile."}
                          </p>
                        </div>

                        {latest && (
                          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-center">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                              Ready
                            </p>
                            <p className="text-2xl font-black text-emerald-300">
                              {Number(latest.jobReadiness || 0)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {profile.analyses.length > 0 && (
                      <div className="mt-5 space-y-3">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                          <Brain size={16} aria-hidden="true" />
                          Grouped analyses in this profile
                        </p>

                        {profile.analyses.slice(0, 3).map((analysis) => (
                          <Link
                            key={analysis._id}
                            to={`/analysis/${analysis._id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300 transition hover:border-indigo-400/30 hover:bg-white/10"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-slate-100">
                                {analysis.resumeName || "Untitled Resume"}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {formatDate(analysis.createdAt)} •{" "}
                                {Number(analysis.jobReadiness || 0)}% ready
                              </span>
                            </span>
                            <ChevronRight
                              size={16}
                              aria-hidden="true"
                              className="shrink-0 text-slate-500"
                            />
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {latest ? (
                        <button
                          type="button"
                          onClick={() => openLatestAnalysis(latest._id)}
                          disabled={openingId === latest._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {openingId === latest._id ? (
                            <Loader2
                              size={16}
                              aria-hidden="true"
                              className="animate-spin"
                            />
                          ) : (
                            <ArrowRight size={16} aria-hidden="true" />
                          )}
                          {openingId === latest._id
                            ? "Opening..."
                            : "Open Latest"}
                        </button>
                      ) : (
                        <GlowButton
                          to="/upload"
                          variant="subtle"
                          className="w-full"
                        >
                          <Target size={16} aria-hidden="true" />
                          Analyze for {profile.role}
                        </GlowButton>
                      )}

                      <Link
                        to="/history"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/40 hover:bg-white/10"
                      >
                        <Sparkles size={16} aria-hidden="true" />
                        View History
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.section>
        )}
      </main>
    </GradientBackground>
  );
}
