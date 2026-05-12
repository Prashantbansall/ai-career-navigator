import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import GlowButton from "../components/ui/GlowButton";
import GradientBackground from "../components/layout/GradientBackground";
import { getReadinessStyle } from "../utils/readiness";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";
import RoadmapReport from "../components/dashboard/RoadmapReport";
import { exportRoadmapPDF } from "../utils/exportPdf";
import { useAuth } from "../context/AuthContext";

import {
  getAnalysisHistoryAPI,
  getAnalysisByIdAPI,
  deleteAnalysisAPI,
  exportAnalysisPdfAPI,
  getCommunityStatsAPI,
} from "../services/api";

import {
  Target,
  AlertTriangle,
  Brain,
  Sparkles,
  Route,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Gauge,
  History,
  Eye,
  Trash2,
  WandSparkles,
  TrendingUp,
  Download,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const dashboardStorageKey = user?._id ? `analysis:${user._id}` : "analysis";

  const dashboardClearedKey = user?._id
    ? `analysisCleared:${user._id}`
    : "analysisCleared";

  const getStoredSelectedAnalysis = () => {
    try {
      const savedAnalysis =
        localStorage.getItem(dashboardStorageKey) ||
        localStorage.getItem("analysis");

      return savedAnalysis ? JSON.parse(savedAnalysis) : null;
    } catch (error) {
      console.error("Failed to parse saved analysis:", error.message);
      localStorage.removeItem(dashboardStorageKey);
      localStorage.removeItem("analysis");
      return null;
    }
  };

  const [analysis, setAnalysis] = useState(
    () => location.state?.analysis || null,
  );

  const [recentHistory, setRecentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openingId, setOpeningId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [communityStats, setCommunityStats] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState("");

  const userDisplayName =
    user?.name || user?.fullName || user?.email || "your account";

  const userFirstName =
    user?.name?.split(" ")?.[0] || user?.fullName?.split(" ")?.[0] || "there";

  const getAnalysisId = (item) => item?._id || item?.analysisId || "";

  const latestAnalysisSummary = recentHistory[0] || null;

  const extractedSkills = analysis?.extractedSkills || [];
  const requiredSkills = analysis?.requiredSkills || [];
  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const roadmap = analysis?.roadmap || [];
  const targetRole = analysis?.targetRole || "Not selected";
  const roleTitle = analysis?.roleTitle || "";
  const jobReadiness = analysis?.jobReadiness || 0;
  const readinessReason = analysis?.readinessReason || "";
  const aiSummary = analysis?.aiSummary || "";
  const aiRecommendations = analysis?.aiRecommendations || [];
  const aiRoadmap = analysis?.aiRoadmap || roadmap;
  const aiEnabled = analysis?.aiEnabled || false;
  const aiError = analysis?.aiError || "";
  const roadmapSource = analysis?.roadmapSource || "fallback";
  const aiProviderUsed = analysis?.aiProviderUsed || "";
  const aiModelUsed = analysis?.aiModelUsed || "";
  const promptVersion = analysis?.promptVersion || "";

  const readinessStyle = getReadinessStyle(jobReadiness);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem("analysis");
      setAnalysis(null);
      setRecentHistory([]);
      setHistoryLoading(false);
      return;
    }

    const fetchAccountDashboardData = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const selectedFromNavigation = location.state?.analysis || null;
        const wasDashboardCleared =
          localStorage.getItem(dashboardClearedKey) === "true";

        if (selectedFromNavigation) {
          localStorage.removeItem(dashboardClearedKey);
        }

        const selectedFromStorage = wasDashboardCleared
          ? null
          : getStoredSelectedAnalysis();

        const selectedAnalysis = selectedFromNavigation || selectedFromStorage;

        if (selectedAnalysis) {
          setAnalysis(selectedAnalysis);
          localStorage.setItem(
            dashboardStorageKey,
            JSON.stringify(selectedAnalysis),
          );
          localStorage.setItem("analysis", JSON.stringify(selectedAnalysis));
        } else {
          setAnalysis(null);
        }

        const data = await getAnalysisHistoryAPI({
          page: 1,
          limit: 3,
        });

        const latestAnalyses = data.analyses || [];
        setRecentHistory(latestAnalyses.slice(0, 3));

        if (
          !selectedAnalysis &&
          !wasDashboardCleared &&
          latestAnalyses[0]?._id
        ) {
          const latestFullAnalysis = await getAnalysisByIdAPI(
            latestAnalyses[0]._id,
          );

          setAnalysis(latestFullAnalysis);
          localStorage.setItem(
            dashboardStorageKey,
            JSON.stringify(latestFullAnalysis),
          );
          localStorage.setItem("analysis", JSON.stringify(latestFullAnalysis));
        }
      } catch (error) {
        console.error("Failed to load account dashboard:", error.message);
        setHistoryError("Unable to load your latest dashboard data right now.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchAccountDashboardData();
  }, [isAuthenticated, location.state]);

  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        setCommunityLoading(true);
        setCommunityError("");

        const data = await getCommunityStatsAPI();

        setCommunityStats(data);
      } catch (error) {
        console.error("Failed to load community insights:", error.message);
        setCommunityError("Unable to load community insights right now.");
      } finally {
        setCommunityLoading(false);
      }
    };

    fetchCommunityStats();
  }, []);

  const createPdfFileName = () => {
    const createSafeFilePart = (value = "") => {
      return String(value)
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
    };

    const now = new Date();

    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(":", "");

    const resumeName = createSafeFilePart(
      analysis?.resumeName || "resume-report",
    );

    const targetRole = createSafeFilePart(
      analysis?.targetRole || "career-roadmap",
    );

    return `ai-career-navigator-${resumeName}-${targetRole}-${date}-${time}.pdf`;
  };

  const handleExportPDF = async () => {
    if (exportingPDF) return;

    try {
      setExportingPDF(true);

      const analysisId = analysis?._id || analysis?.analysisId;

      if (analysisId) {
        try {
          await exportAnalysisPdfAPI(analysisId);
          toast.success("Roadmap PDF exported successfully");
          return;
        } catch (backendError) {
          console.warn(
            "Backend PDF export failed. Falling back to frontend export:",
            backendError.message,
          );
        }
      }

      await exportRoadmapPDF("roadmap-export", createPdfFileName());
      toast.success("Roadmap PDF exported successfully");
    } catch (error) {
      console.error("Failed to export roadmap PDF:", error.message);
      toast.error(error.message || "Unable to export PDF. Please try again.");
    } finally {
      setExportingPDF(false);
    }
  };

  const clearAnalysis = () => {
    localStorage.setItem(dashboardClearedKey, "true");
    localStorage.removeItem(dashboardStorageKey);
    localStorage.removeItem("analysis");

    setAnalysis(null);

    navigate("/dashboard", {
      replace: true,
      state: {},
    });

    toast.success("Dashboard selection cleared");
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
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

  const openHistoryAnalysis = async (id) => {
    try {
      setOpeningId(id);
      setHistoryError("");

      const selectedAnalysis = await getAnalysisByIdAPI(id);

      localStorage.removeItem(dashboardClearedKey);
      localStorage.setItem(
        dashboardStorageKey,
        JSON.stringify(selectedAnalysis),
      );
      localStorage.setItem("analysis", JSON.stringify(selectedAnalysis));
      setAnalysis(selectedAnalysis);

      navigate("/dashboard", {
        replace: true,
        state: {
          analysis: selectedAnalysis,
        },
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to open analysis:", error.message);
      setHistoryError("Unable to open this analysis.");
    } finally {
      setOpeningId("");
    }
  };

  const continueFromLatestAnalysis = async () => {
    if (!latestAnalysisSummary?._id) return;

    await openHistoryAnalysis(latestAnalysisSummary._id);
  };

  const requestDeleteHistoryAnalysis = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteHistoryAnalysis = async () => {
    if (!deleteTargetId) return;

    try {
      setDeletingId(deleteTargetId);
      setHistoryError("");

      await deleteAnalysisAPI(deleteTargetId);

      setRecentHistory((prev) =>
        prev.filter((item) => item._id !== deleteTargetId),
      );

      if (
        analysis?._id === deleteTargetId ||
        analysis?.analysisId === deleteTargetId
      ) {
        localStorage.setItem(dashboardClearedKey, "true");
        localStorage.removeItem(dashboardStorageKey);
        localStorage.removeItem("analysis");
        setAnalysis(null);

        navigate("/dashboard", {
          replace: true,
          state: {},
        });
      }

      toast.success("Analysis deleted successfully");
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Failed to delete analysis:", error.message);
      setHistoryError("Unable to delete this analysis.");
      toast.error("Unable to delete this analysis.");
    } finally {
      setDeletingId("");
    }
  };

  const cancelDeleteHistoryAnalysis = () => {
    if (deletingId) return;
    setDeleteTargetId(null);
  };

  return (
    <GradientBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 mt-6 md:mt-8 pb-20">
        {/* HEADER */}
        <div className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 text-sm text-indigo-300 mb-2"
            >
              <Sparkles size={16} aria-hidden="true" />
              AI-powered career insights
            </motion.p>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-bold"
            >
              {isAuthenticated
                ? `${userFirstName}'s Career Dashboard`
                : "Your Career Dashboard"}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              {isAuthenticated
                ? `Welcome back, ${userDisplayName}. This dashboard shows your saved resume analysis, readiness score, skill gaps, and latest roadmap.`
                : "Track your skills, readiness score, gaps, AI recommendations, and personalized roadmap."}
            </motion.p>
          </motion.div>

          {isAuthenticated && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-1 flex shrink-0 flex-nowrap items-center justify-start gap-2 lg:justify-end"
            >
              {latestAnalysisSummary && (
                <button
                  type="button"
                  onClick={continueFromLatestAnalysis}
                  disabled={openingId === latestAnalysisSummary._id}
                  aria-label="Continue from latest analysis"
                  className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-gradient-to-r from-emerald-500/90 via-emerald-400/85 to-teal-400/85 px-3.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/50 hover:shadow-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-white/15 text-white shadow-inner shadow-white/10 transition group-hover:bg-white/20">
                    <History size={14} aria-hidden="true" />
                  </span>

                  <span className="whitespace-nowrap">
                    {openingId === latestAnalysisSummary._id
                      ? "Opening latest..."
                      : "Continue latest"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                aria-label={
                  exportingPDF ? "Generating PDF" : "Export roadmap as PDF"
                }
                className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-indigo-300/20 bg-white/[0.07] px-3.5 text-xs font-semibold text-indigo-100 shadow-lg shadow-indigo-500/10 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300/45 hover:bg-indigo-500/15 hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-indigo-300/20 bg-indigo-400/15 text-indigo-200 transition group-hover:bg-indigo-400/25">
                  <Download size={14} aria-hidden="true" />
                </span>

                <span className="whitespace-nowrap">
                  {exportingPDF ? "Generating..." : "Export PDF"}
                </span>
              </button>

              <button
                type="button"
                onClick={clearAnalysis}
                aria-label="Clear current resume analysis"
                className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/[0.08] px-3.5 text-xs font-semibold text-red-200 shadow-lg shadow-red-500/5 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-red-300/40 hover:bg-red-500/15 hover:shadow-red-500/15"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-red-300/20 bg-red-400/10 text-red-200 transition group-hover:bg-red-400/20">
                  <RotateCcw size={14} aria-hidden="true" />
                </span>

                <span className="whitespace-nowrap">Clear</span>
              </button>
            </motion.div>
          )}
        </div>

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <EmptyState
              icon={ShieldCheck}
              title="Sign in to view your personal dashboard"
              description="Your dashboard will show your resume analysis, saved roadmaps, readiness score, and recent history after you sign in."
              action={
                <GlowButton
                  to="/signin"
                  variant="solid"
                  aria-label="Sign in to view dashboard"
                >
                  Sign In
                </GlowButton>
              }
            />
          </motion.div>
        )}

        {isAuthenticated && !analysis && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <EmptyState
              icon={FileText}
              title="Start your first analysis"
              description={`Hi ${userFirstName}, your account does not have a selected or saved resume analysis yet. Upload your resume to generate your first personalized roadmap.`}
              action={
                <GlowButton
                  to="/upload"
                  variant="solid"
                  aria-label="Start your first analysis"
                >
                  Start Analysis
                </GlowButton>
              }
            />
          </motion.div>
        )}

        {isAuthenticated && analysis && (
          <>
            {/* TOP STATS */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-300 mb-2">
                        <Target size={18} aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-indigo-400">
                          Target Role
                        </h3>
                      </div>

                      <p className="text-2xl font-bold">{targetRole}</p>
                      <p className="text-sm text-gray-400 mt-1">{roleTitle}</p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Target size={24} aria-hidden="true" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          size={18}
                          aria-hidden="true"
                          className={readinessStyle.text}
                        />
                        <h3
                          className={`text-lg font-semibold ${readinessStyle.text}`}
                        >
                          Job Readiness
                        </h3>
                      </div>

                      <AnimatedBadge variant={readinessStyle.badgeVariant}>
                        {readinessStyle.label}
                      </AnimatedBadge>
                    </div>

                    <p className="text-3xl font-bold mt-2">{jobReadiness}%</p>

                    <div
                      className="mt-4 w-full bg-gray-700 rounded-full h-3 overflow-hidden"
                      role="progressbar"
                      aria-label="Job readiness score"
                      aria-valuenow={jobReadiness}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${jobReadiness}%` }}
                        transition={{ duration: 0.9, delay: 0.2 }}
                        className={`${readinessStyle.bg} h-3 rounded-full`}
                      ></motion.div>
                    </div>

                    {readinessReason && (
                      <p className="text-sm text-gray-400 mt-3">
                        {readinessReason}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-red-300 mb-2">
                        <AlertTriangle size={18} aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-red-400">
                          Skill Gaps
                        </h3>
                      </div>

                      <p className="text-3xl font-bold">
                        {missingSkills.length}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Out of {requiredSkills.length} required skills
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300">
                      <AlertTriangle size={24} aria-hidden="true" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* COMMUNITY INSIGHTS */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="mb-8">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-indigo-300">
                      <TrendingUp size={20} aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-indigo-400">
                        Community Insights
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400">
                      See how your roadmap compares with learning trends from
                      other resume analyses.
                    </p>
                  </div>

                  <Link
                    to="/community"
                    className="inline-flex w-fit items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10"
                  >
                    View Community
                  </Link>
                </div>

                {communityLoading && (
                  <div
                    className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-400"></div>
                    <p className="text-sm text-gray-400">
                      Loading community insights...
                    </p>
                  </div>
                )}

                {!communityLoading && communityError && (
                  <div
                    role="alert"
                    className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-sm text-yellow-300"
                  >
                    {communityError}
                  </div>
                )}

                {!communityLoading && !communityError && communityStats && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Popular Role
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {communityStats.mostPopularTargetRole?.role ||
                          "No data"}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {communityStats.mostPopularTargetRole?.roleTitle ||
                          "Most selected target role"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-red-400/40 hover:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Common Gap
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {communityStats.mostCommonMissingSkill?.skill ||
                          "No data"}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {communityStats.mostCommonMissingSkill
                          ? `${communityStats.mostCommonMissingSkill.count} learners missing this`
                          : "Most common missing skill"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-green-400/40 hover:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Avg Readiness
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {communityStats.averageReadinessScore || 0}%
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Average score across analyses
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Top Roadmap Skill
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {communityStats.topRoadmapSkill?.skill || "No data"}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        {communityStats.topRoadmapSkill
                          ? `${communityStats.topRoadmapSkill.count} roadmap mentions`
                          : "Most recommended skill"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-purple-400/40 hover:bg-white/10">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Total Analyses
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-white">
                        {communityStats.totalAnalyses || 0}
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">
                        Saved resume analyses
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* ROADMAP SOURCE */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="mb-8">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Brain
                        size={20}
                        aria-hidden="true"
                        className={
                          roadmapSource === "ai"
                            ? "text-green-300"
                            : "text-yellow-300"
                        }
                      />

                      <h3 className="text-lg font-semibold text-indigo-400 truncate">
                        Roadmap Source
                      </h3>
                    </div>

                    <AnimatedBadge
                      variant={roadmapSource === "ai" ? "success" : "warning"}
                      className="shrink-0"
                    >
                      {roadmapSource === "ai"
                        ? `${aiProviderUsed || "AI"} Powered`
                        : "Fallback Mode"}
                    </AnimatedBadge>
                  </div>

                  <p className="text-sm text-gray-400 mt-2">
                    {roadmapSource === "ai"
                      ? `This roadmap was generated using ${
                          aiProviderUsed || "AI"
                        }.`
                      : "This roadmap is using the rule-based fallback engine."}
                  </p>

                  {roadmapSource === "ai" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Provider: {aiProviderUsed || "AI"} • Model:{" "}
                      {aiModelUsed || "Unknown"} • Prompt:{" "}
                      {promptVersion || "Unknown"}
                    </p>
                  )}

                  {aiError && (
                    <p
                      role="alert"
                      aria-live="assertive"
                      className="text-sm text-yellow-300 mt-2"
                    >
                      {aiError}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* SKILLS */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText
                      size={20}
                      aria-hidden="true"
                      className="text-indigo-300"
                    />
                    <h3 className="text-lg font-semibold text-indigo-400">
                      Extracted Skills
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.length > 0 ? (
                      extractedSkills.map((skill, i) => (
                        <AnimatedBadge key={i}>{skill}</AnimatedBadge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No skills detected.
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2
                      size={20}
                      aria-hidden="true"
                      className="text-green-300"
                    />
                    <h3 className="text-lg font-semibold text-green-400">
                      Matched Skills
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {matchedSkills.length > 0 ? (
                      matchedSkills.map((skill, i) => (
                        <AnimatedBadge key={i} variant="success">
                          {skill}
                        </AnimatedBadge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No matched skills found.
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle
                      size={20}
                      aria-hidden="true"
                      className="text-red-300"
                    />
                    <h3 className="text-lg font-semibold text-red-400">
                      Missing Skills
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {missingSkills.length > 0 ? (
                      missingSkills.map((skill, i) => (
                        <AnimatedBadge key={i} variant="danger">
                          {skill}
                        </AnimatedBadge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        Great! No major skill gaps found.
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* AI SUMMARY */}
            {aiEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65 }}
              >
                <Card className="mt-8 md:mt-10">
                  <div className="flex items-center gap-2 mb-3">
                    <WandSparkles
                      size={20}
                      aria-hidden="true"
                      className="text-indigo-300"
                    />
                    <h3 className="text-lg font-semibold text-indigo-400">
                      AI Career Summary
                    </h3>
                  </div>

                  <p className="text-sm md:text-base text-gray-400">
                    {aiSummary}
                  </p>

                  {aiRecommendations.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aiRecommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="premium-inner-card rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400 transition hover:bg-white/10 md:text-base"
                        >
                          <span className="text-indigo-300 font-semibold">
                            {index + 1}.
                          </span>{" "}
                          {recommendation}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* ROADMAP TIMELINE */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
            >
              <Card className="mt-8 md:mt-10">
                <div className="flex items-center gap-2 mb-6">
                  <Route
                    size={20}
                    aria-hidden="true"
                    className="text-green-300"
                  />
                  <h3 className="text-lg font-semibold text-green-400">
                    Week-by-Week Roadmap
                  </h3>
                </div>

                {aiRoadmap.length > 0 ? (
                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute left-4 top-2 bottom-2 w-px bg-white/10"
                    ></div>

                    <div className="space-y-6">
                      {aiRoadmap.map((item, i) => (
                        <motion.div
                          key={`${item.week}-${item.skill}-${i}`}
                          initial={{ opacity: 0, x: -22 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="relative pl-12"
                        >
                          <div
                            aria-hidden="true"
                            className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/20 text-indigo-300 shadow-sm"
                          >
                            {i + 1}
                          </div>

                          <div className="premium-roadmap-card rounded-2xl p-4 backdrop-blur-md transition duration-200 md:p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <h4 className="premium-roadmap-title font-semibold text-indigo-400">
                                {item.week}: {item.skill}
                              </h4>

                              <div className="flex flex-wrap gap-2">
                                {item.difficulty && (
                                  <AnimatedBadge className="text-xs">
                                    <Gauge size={13} aria-hidden="true" />
                                    Difficulty: {item.difficulty}
                                  </AnimatedBadge>
                                )}

                                {item.timeEstimate && (
                                  <AnimatedBadge
                                    variant="success"
                                    className="text-xs"
                                  >
                                    <Clock size={13} aria-hidden="true" />
                                    Time: {item.timeEstimate}
                                  </AnimatedBadge>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 space-y-3">
                              <p className="premium-roadmap-text text-sm leading-relaxed text-gray-400 md:text-base">
                                <span className="premium-roadmap-label font-semibold text-gray-300">
                                  Learn:
                                </span>{" "}
                                {item.learn}
                              </p>

                              {item.howToLearn && (
                                <p className="premium-roadmap-text text-sm leading-relaxed text-gray-400 md:text-base">
                                  <span className="premium-roadmap-label font-semibold text-gray-300">
                                    How to Learn:
                                  </span>{" "}
                                  {item.howToLearn}
                                </p>
                              )}

                              <p className="premium-roadmap-text text-sm leading-relaxed text-gray-400 md:text-base">
                                <span className="premium-roadmap-label font-semibold text-gray-300">
                                  Free Resource:
                                </span>{" "}
                                {item.resource}
                              </p>

                              <p className="premium-roadmap-text text-sm leading-relaxed text-gray-400 md:text-base">
                                <span className="premium-roadmap-label font-semibold text-gray-300">
                                  Mini Project:
                                </span>{" "}
                                {item.project}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ">
                    <p className="text-sm text-gray-400 md:text-base">
                      Your profile already matches the target role well. Keep
                      building advanced projects and applying for internships.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* RECENT HISTORY */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="mt-8 md:mt-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-300 mb-2">
                      <History size={20} aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-indigo-400">
                        Recent Analyses
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400">
                      These are the latest analyses saved to your account.
                    </p>
                  </div>

                  <GlowButton
                    to="/history"
                    variant="primary"
                    aria-label="View all analysis history"
                  >
                    View All History
                  </GlowButton>
                </div>

                {historyError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-300 text-sm"
                  >
                    {historyError}
                  </div>
                )}

                {historyLoading && (
                  <div
                    className="text-center py-8"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin"></div>
                    <p className="text-sm text-gray-400">
                      Loading recent analyses...
                    </p>
                  </div>
                )}

                {!historyLoading && recentHistory.length === 0 && (
                  <EmptyState
                    icon={Clock}
                    title="No saved analyses for your account yet."
                    description="Your latest account-based resume analyses will appear here after you upload and analyze a resume."
                    compact
                    className="bg-white/5"
                  />
                )}

                {!historyLoading && recentHistory.length > 0 && (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {recentHistory.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={fadeUp}
                        transition={{ duration: 0.45 }}
                        className="premium-inner-card rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-indigo-500/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-400 truncate">
                              {item.resumeName || "Untitled Resume"}
                            </p>

                            <h4 className="font-semibold text-gray-100 mt-1">
                              {item.targetRole}
                            </h4>
                          </div>

                          <AnimatedBadge
                            variant={getScoreVariant(item.jobReadiness)}
                          >
                            {item.jobReadiness}%
                          </AnimatedBadge>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <AnimatedBadge
                            variant={
                              item.roadmapSource === "ai"
                                ? "success"
                                : "warning"
                            }
                            className="text-xs"
                          >
                            {item.roadmapSource === "ai"
                              ? `${item.aiProviderUsed || "AI"}`
                              : "Fallback"}
                          </AnimatedBadge>

                          <AnimatedBadge className="text-xs">
                            <Clock size={13} aria-hidden="true" />
                            {formatDate(item.createdAt)}
                          </AnimatedBadge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Link
                            to={`/analysis/${item._id}`}
                            aria-label={`View details for ${
                              item.resumeName || item.targetRole
                            } analysis`}
                            className="carbon-button-soft inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                          >
                            Detail
                          </Link>

                          <button
                            type="button"
                            onClick={() => openHistoryAnalysis(item._id)}
                            disabled={openingId === item._id}
                            aria-label={`Open ${
                              item.resumeName || item.targetRole
                            } analysis`}
                            className="carbon-button flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500 bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Eye size={15} aria-hidden="true" />
                            {openingId === item._id ? "Opening..." : "Open"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              requestDeleteHistoryAnalysis(item._id)
                            }
                            disabled={deletingId === item._id}
                            aria-label={`Delete ${
                              item.resumeName || item.targetRole
                            } analysis`}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            {deletingId === item._id ? "..." : "Delete"}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </main>

      {/* Hidden PDF Export Section */}
      {isAuthenticated && analysis && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "794px",
            backgroundColor: "#ffffff",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <div id="roadmap-export">
            <RoadmapReport analysis={analysis} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete this analysis?"
        message="This will permanently remove this saved analysis from your history."
        confirmText="Delete Analysis"
        cancelText="Keep It"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteHistoryAnalysis}
        onCancel={cancelDeleteHistoryAnalysis}
      />
    </GradientBackground>
  );
}
