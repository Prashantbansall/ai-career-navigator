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
  BarChart3,
  Brain,
  Gauge,
  GraduationCap,
  RefreshCcw,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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
      staggerChildren: 0.1,
    },
  },
};

function RankingList({ title, icon: Icon, items, type, emptyText }) {
  return (
    <Card>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={20} aria-hidden="true" className="text-indigo-300" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <AnimatedBadge>Top {items.length}</AnimatedBadge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const label = item.role || item.skill || "Unknown";
            const subText = item.roleTitle || `${item.count} learners`;

            return (
              <motion.div
                key={`${label}-${index}`}
                variants={fadeUp}
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-4">
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
                    className="shrink-0"
                  >
                    {item.count || 0}
                  </AnimatedBadge>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
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

  const statCards = useMemo(
    () => [
      {
        title: "Total Analyses",
        value: communityStats.totalAnalyses || 0,
        description: "Resume analyses completed by learners",
        icon: Users,
        accent: "text-indigo-300",
        badge: "Community",
      },
      {
        title: "Average Readiness",
        value: `${communityStats.averageReadinessScore || 0}%`,
        description: "Average job readiness score",
        icon: Gauge,
        accent: "text-green-300",
        badge: "Score",
      },
      {
        title: "Popular Role",
        value: communityStats.mostPopularTargetRole?.role || "No data yet",
        description:
          communityStats.mostPopularTargetRole?.roleTitle ||
          "Most selected target role",
        icon: Target,
        accent: "text-cyan-300",
        badge: communityStats.mostPopularTargetRole
          ? `${communityStats.mostPopularTargetRole.count} learners`
          : "Waiting",
      },
      {
        title: "Common Skill Gap",
        value: communityStats.mostCommonMissingSkill?.skill || "No data yet",
        description: "Most repeated missing skill",
        icon: Brain,
        accent: "text-red-300",
        badge: communityStats.mostCommonMissingSkill
          ? `${communityStats.mostCommonMissingSkill.count} times`
          : "Waiting",
      },
      {
        title: "Top Roadmap Skill",
        value: communityStats.topRoadmapSkill?.skill || "No data yet",
        description: "Most recommended roadmap skill",
        icon: Route,
        accent: "text-purple-300",
        badge: communityStats.topRoadmapSkill
          ? `${communityStats.topRoadmapSkill.count} roadmaps`
          : "Waiting",
      },
    ],
    [communityStats],
  );

  const hasCommunityData = communityStats.totalAnalyses > 0;

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:pt-10">
        {/* Header */}
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
            Community learning insights
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            See what other learners are preparing for
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base"
          >
            Explore common target roles, repeated skill gaps, average readiness,
            and popular roadmap skills generated from saved resume analyses.
          </motion.p>
        </motion.section>

        {/* Loading State */}
        {loading && (
          <Card className="mb-8">
            <div
              className="flex flex-col items-center justify-center py-14 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-400"></div>
              <p className="text-sm text-slate-400">
                Loading community insights...
              </p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="mb-8 border-red-500/20 bg-red-500/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-300">
                  <AlertTriangle size={22} aria-hidden="true" />
                </div>

                <div>
                  <h2 className="font-semibold text-red-200">
                    Community insights unavailable
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchCommunityStats}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <RefreshCcw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Main Stats */}
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
            >
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.div
                    key={card.title}
                    variants={fadeUp}
                    transition={{ duration: 0.45 }}
                  >
                    <Card className="h-full">
                      <div className="flex h-full flex-col justify-between gap-5">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 ${card.accent}`}
                          >
                            <Icon size={22} aria-hidden="true" />
                          </div>

                          <AnimatedBadge className="text-xs">
                            {card.badge}
                          </AnimatedBadge>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">{card.title}</p>
                          <h2 className="mt-2 break-words text-2xl font-bold text-white">
                            {card.value}
                          </h2>
                          <p className="mt-2 text-sm text-slate-400">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.section>

            {/* Empty State */}
            {!hasCommunityData && (
              <div className="mb-8">
                <EmptyState
                  icon={Users}
                  title="No community data yet"
                  description="Community insights will appear here once users start uploading resumes and generating career roadmaps."
                  compact
                  className="bg-white/5"
                />
              </div>
            )}

            {/* Insight Banner */}
            {hasCommunityData && (
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="mb-8"
              >
                <Card>
                  <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-green-300">
                        <TrendingUp size={20} aria-hidden="true" />
                        <h3 className="text-lg font-semibold">
                          Community Trend Summary
                        </h3>
                      </div>

                      <p className="text-sm leading-7 text-slate-400 md:text-base">
                        Most learners are currently targeting{" "}
                        <span className="font-semibold text-indigo-300">
                          {communityStats.mostPopularTargetRole?.role ||
                            "different roles"}
                        </span>
                        , while{" "}
                        <span className="font-semibold text-red-300">
                          {communityStats.mostCommonMissingSkill?.skill ||
                            "multiple skills"}
                        </span>{" "}
                        appears as a common skill gap. The average readiness
                        score is{" "}
                        <span className="font-semibold text-green-300">
                          {communityStats.averageReadinessScore || 0}%
                        </span>
                        .
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                      <p className="text-sm text-slate-400">SaaS Insight</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        Learners need stronger backend, AI, and system design
                        skills.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.section>
            )}

            {/* Ranking Lists */}
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                <RankingList
                  title="Most Selected Roles"
                  icon={GraduationCap}
                  items={communityStats.popularTargetRoles || []}
                  type="role"
                  emptyText="Target role trends will appear after analyses are saved."
                />
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <RankingList
                  title="Common Missing Skills"
                  icon={BarChart3}
                  items={communityStats.commonMissingSkills || []}
                  type="missing"
                  emptyText="Common missing skills will appear after resume analyses are generated."
                />
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                <RankingList
                  title="Popular Roadmap Skills"
                  icon={Route}
                  items={communityStats.popularRoadmapSkills || []}
                  type="roadmap"
                  emptyText="Popular roadmap skills will appear after AI roadmaps are generated."
                />
              </motion.div>
            </motion.section>
          </>
        )}
      </main>
    </GradientBackground>
  );
}
