import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import EmptyState from "../components/ui/EmptyState";
import { getCommunityStatsAPI } from "../services/api";

import {
  AlertTriangle,
  Award,
  BarChart3,
  Brain,
  Gauge,
  GraduationCap,
  LineChart,
  ListChecks,
  PieChart,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const emptyCommunityStats = {
  totalAnalyses: 0,
  averageReadinessScore: 0,
  mostPopularTargetRole: null,
  mostCommonMissingSkill: null,
  topRoadmapSkill: null,
  popularTargetRoles: [],
  commonMissingSkills: [],
  popularRoadmapSkills: [],
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function getLargestCount(items = []) {
  return Math.max(...items.map((item) => item.count || 0), 1);
}

function getReadinessLabel(score = 0) {
  if (score >= 75) return { label: "Job ready", variant: "success" };
  if (score >= 55) return { label: "Almost ready", variant: "warning" };
  return { label: "Needs focus", variant: "danger" };
}

function formatCount(value = 0, suffix = "") {
  return `${value || 0}${suffix}`;
}

function CommunityMetricCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  variant = "default",
}) {
  return (
    <Card className="group relative h-full overflow-hidden bg-slate-900/70 hover:bg-slate-900/70">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl transition duration-300 group-hover:bg-indigo-400/20" />
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-indigo-200 shadow-lg shadow-indigo-500/10">
            <Icon size={23} aria-hidden="true" />
          </div>

          <AnimatedBadge variant={variant} className="text-xs">
            {badge}
          </AnimatedBadge>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h2 className="mt-2 break-words text-3xl font-black tracking-tight text-white">
            {value}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function InsightProgressBar({ label, value, helper, variant = "default" }) {
  const width = Math.min(Math.max(Number(value) || 0, 0), 100);
  const barStyles = {
    default: "from-indigo-500 to-cyan-400",
    success: "from-emerald-500 to-green-300",
    danger: "from-red-500 to-orange-300",
    warning: "from-yellow-400 to-orange-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{helper}</p>
        </div>
        <span className="text-sm font-bold text-slate-100">{width}%</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barStyles[variant]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function RankingList({ title, subtitle, icon: Icon, items, type, emptyText }) {
  const maxCount = getLargestCount(items);

  return (
    <Card className="h-full bg-slate-900/70 hover:bg-slate-900/70">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-200">
            <Icon size={21} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
        </div>

        <AnimatedBadge className="text-xs">Top {items.length}</AnimatedBadge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const label = item.role || item.skill || "Unknown";
            const subText = item.roleTitle || `${item.count} learners`;
            const percentage = Math.round(((item.count || 0) / maxCount) * 100);

            return (
              <motion.div
                key={`${label}-${index}`}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/5 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-indigo-400/0 blur-2xl transition group-hover:bg-indigo-400/20" />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-sm font-bold text-indigo-200">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-100">
                        {label}
                      </p>
                      <p className="truncate text-sm text-slate-400">
                        {subText}
                      </p>
                    </div>
                  </div>

                  <AnimatedBadge
                    variant={
                      type === "missing"
                        ? "danger"
                        : type === "roadmap"
                          ? "success"
                          : "default"
                    }
                    className="text-xs"
                  >
                    {item.count || 0}
                  </AnimatedBadge>
                </div>

                <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      type === "missing"
                        ? "from-red-500 to-orange-300"
                        : type === "roadmap"
                          ? "from-emerald-500 to-green-300"
                          : "from-indigo-500 to-cyan-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function LoadingAnalyticsState() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <Card className="bg-slate-900/70">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <div className="h-5 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 h-9 w-3/4 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/10" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-400" />
            <p className="mt-5 text-center text-sm text-slate-400">
              Loading community insights...
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="bg-slate-900/70">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-6 h-4 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-3 h-8 w-20 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-white/10" />
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CommunityDashboard() {
  const [communityStats, setCommunityStats] = useState(emptyCommunityStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCommunityStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCommunityStatsAPI();

      setCommunityStats({
        ...emptyCommunityStats,
        ...data,
      });
    } catch (err) {
      console.error("Failed to fetch community stats:", err.message);
      setError("Unable to load community insights right now.");
      setCommunityStats(emptyCommunityStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const hasCommunityData = communityStats.totalAnalyses > 0;
  const readinessStatus = getReadinessLabel(
    communityStats.averageReadinessScore,
  );

  const metricCards = useMemo(
    () => [
      {
        title: "Total Analyses",
        value: formatCount(communityStats.totalAnalyses),
        description: "Saved resume scans powering the community benchmark.",
        icon: Users,
        badge: "Community",
        variant: "default",
      },
      {
        title: "Average Readiness",
        value: `${communityStats.averageReadinessScore || 0}%`,
        description: "Current average job readiness across all saved reports.",
        icon: Gauge,
        badge: readinessStatus.label,
        variant: readinessStatus.variant,
      },
      {
        title: "Popular Role",
        value: communityStats.mostPopularTargetRole?.role || "No data yet",
        description:
          communityStats.mostPopularTargetRole?.roleTitle ||
          "Most selected career goal.",
        icon: Target,
        badge: communityStats.mostPopularTargetRole
          ? `${communityStats.mostPopularTargetRole.count} learners`
          : "Waiting",
        variant: "default",
      },
      {
        title: "Skill Gap",
        value: communityStats.mostCommonMissingSkill?.skill || "No data yet",
        description: "Most repeated missing skill from resume analysis.",
        icon: Brain,
        badge: communityStats.mostCommonMissingSkill
          ? `${communityStats.mostCommonMissingSkill.count} times`
          : "Waiting",
        variant: communityStats.mostCommonMissingSkill ? "danger" : "default",
      },
    ],
    [communityStats, readinessStatus.label, readinessStatus.variant],
  );

  const totalRoleSelections = useMemo(
    () =>
      (communityStats.popularTargetRoles || []).reduce(
        (sum, item) => sum + (item.count || 0),
        0,
      ),
    [communityStats.popularTargetRoles],
  );

  const topRoleShare = useMemo(() => {
    const topRoleCount = communityStats.mostPopularTargetRole?.count || 0;
    if (!totalRoleSelections) return 0;
    return Math.round((topRoleCount / totalRoleSelections) * 100);
  }, [communityStats.mostPopularTargetRole, totalRoleSelections]);

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:pt-10">
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200"
          >
            <Sparkles size={16} aria-hidden="true" />
            Community analytics dashboard
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl"
              >
                Discover role trends, skill gaps, and roadmap demand
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base"
              >
                See what learners are preparing for, which skills are missing
                most often, and which roadmap topics appear across saved resume
                analyses.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <ShieldCheck size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Privacy-friendly insights
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Analytics are based on saved analysis trends, not public
                    resume details.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {loading && <LoadingAnalyticsState />}

        {!loading && error && (
          <Card className="mb-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/5">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-300">
                  <AlertTriangle size={24} aria-hidden="true" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-200">
                    Community insights unavailable
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {error}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Try again in a moment. Your dashboard and saved analyses are
                    not affected.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchCommunityStats}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/10"
              >
                <RefreshCcw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && (
          <>
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
            >
              {metricCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                >
                  <CommunityMetricCard {...card} />
                </motion.div>
              ))}
            </motion.section>

            {!hasCommunityData && (
              <div className="mb-8">
                <EmptyState
                  icon={Users}
                  title="No community data yet"
                  description="Community insights will appear here once users start uploading resumes and generating career roadmaps. The page is ready to show role trends, skill gaps, and roadmap demand."
                  compact
                  className="bg-white/5"
                />
              </div>
            )}

            {hasCommunityData && (
              <motion.section
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
              >
                <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                  <Card className="h-full bg-slate-900/70 hover:bg-slate-900/70">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-emerald-300">
                          <TrendingUp size={20} aria-hidden="true" />
                          <h3 className="text-lg font-bold text-white">
                            Community Trend Summary
                          </h3>
                        </div>
                        <p className="text-sm leading-6 text-slate-400">
                          A quick analytics view of what the community is
                          learning and where most users need support.
                        </p>
                      </div>
                      <AnimatedBadge
                        variant="success"
                        className="hidden text-xs sm:inline-flex"
                      >
                        Live benchmark
                      </AnimatedBadge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-indigo-300">
                          <Award size={18} aria-hidden="true" />
                          <p className="text-sm font-semibold">Top role</p>
                        </div>
                        <p className="text-2xl font-black text-white">
                          {communityStats.mostPopularTargetRole?.role ||
                            "No data"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {communityStats.mostPopularTargetRole?.roleTitle ||
                            "Most selected target role will appear here."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-red-300">
                          <Zap size={18} aria-hidden="true" />
                          <p className="text-sm font-semibold">Top gap</p>
                        </div>
                        <p className="text-2xl font-black text-white">
                          {communityStats.mostCommonMissingSkill?.skill ||
                            "No data"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Most repeated skill gap from resume scans.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-emerald-300">
                          <ListChecks size={18} aria-hidden="true" />
                          <p className="text-sm font-semibold">Top roadmap</p>
                        </div>
                        <p className="text-2xl font-black text-white">
                          {communityStats.topRoadmapSkill?.skill || "No data"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Most suggested skill across generated roadmaps.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Card className="h-full bg-slate-900/70 hover:bg-slate-900/70">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                        <PieChart size={21} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Readiness Distribution
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Snapshot from community averages.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <InsightProgressBar
                        label="Average readiness"
                        value={communityStats.averageReadinessScore || 0}
                        helper="How close learners are to their target roles."
                        variant={readinessStatus.variant}
                      />
                      <InsightProgressBar
                        label="Top role concentration"
                        value={topRoleShare}
                        helper="Share of learners targeting the most popular role."
                        variant="default"
                      />
                    </div>
                  </Card>
                </motion.div>
              </motion.section>
            )}

            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                <RankingList
                  title="Popular Roles"
                  subtitle="Roles learners are preparing for most often."
                  icon={GraduationCap}
                  items={communityStats.popularTargetRoles || []}
                  type="role"
                  emptyText="Target role trends will appear after analyses are saved."
                />
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <RankingList
                  title="Common Skill Gaps"
                  subtitle="Skills that appear most often as missing."
                  icon={BarChart3}
                  items={communityStats.commonMissingSkills || []}
                  type="missing"
                  emptyText="Common missing skills will appear after resume analyses are generated."
                />
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                <RankingList
                  title="Roadmap Skill Trends"
                  subtitle="Skills frequently recommended in AI roadmaps."
                  icon={Route}
                  items={communityStats.popularRoadmapSkills || []}
                  type="roadmap"
                  emptyText="Popular roadmap skills will appear after AI roadmaps are generated."
                />
              </motion.div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="bg-slate-900/70 hover:bg-slate-900/70">
                <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-200">
                    <LineChart size={26} aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Use these insights to improve your own roadmap
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Compare your missing skills with common community gaps,
                      then use your dashboard roadmap to focus on the
                      highest-impact topics first.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <AnimatedBadge variant="default">Role trends</AnimatedBadge>
                    <AnimatedBadge variant="danger">Skill gaps</AnimatedBadge>
                    <AnimatedBadge variant="success">
                      Roadmap demand
                    </AnimatedBadge>
                  </div>
                </div>
              </Card>
            </motion.section>
          </>
        )}
      </main>
    </GradientBackground>
  );
}
