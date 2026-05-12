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
  ArrowRight,
  UploadCloud,
  ClipboardCheck,
  Rocket,
  BookOpen,
  Layers3,
  CheckSquare,
  Square,
  ListChecks,
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
  const [roadmapProgress, setRoadmapProgress] = useState({});

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

  const roadmapProgressKey = analysis
    ? `roadmapProgress:${user?._id || "guest"}:${
        getAnalysisId(analysis) ||
        `${analysis?.resumeName || "resume"}-${analysis?.targetRole || "role"}`
      }`
    : "roadmapProgress:no-analysis";

  const roadmapTaskFields = [
    { key: "learn", label: "Learn" },
    { key: "howToLearn", label: "How to Learn" },
    { key: "resource", label: "Free Resource" },
    { key: "project", label: "Mini Project" },
  ];

  const getRoadmapStepKey = (item, index) =>
    `${index}-${item?.week || "week"}-${item?.skill || "skill"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const getAvailableTasks = (item) =>
    roadmapTaskFields.filter(({ key }) => Boolean(item?.[key]));

  const getStepProgress = (item, index) => {
    const stepKey = getRoadmapStepKey(item, index);
    const tasks = getAvailableTasks(item);
    const completedTasks = tasks.filter(
      ({ key }) => roadmapProgress?.[stepKey]?.[key],
    ).length;

    return {
      stepKey,
      tasks,
      completedTasks,
      totalTasks: tasks.length,
      isStarted: completedTasks > 0,
      isCompleted: tasks.length > 0 && completedTasks === tasks.length,
    };
  };

  const roadmapProgressSummary = aiRoadmap.reduce(
    (summary, item, index) => {
      const step = getStepProgress(item, index);

      summary.completedTasks += step.completedTasks;
      summary.totalTasks += step.totalTasks;

      if (step.isCompleted) {
        summary.completedWeeks += 1;
      } else if (step.isStarted) {
        summary.inProgressWeeks += 1;
      }

      return summary;
    },
    { completedTasks: 0, totalTasks: 0, completedWeeks: 0, inProgressWeeks: 0 },
  );

  const roadmapProgressPercent = roadmapProgressSummary.totalTasks
    ? Math.round(
        (roadmapProgressSummary.completedTasks /
          roadmapProgressSummary.totalTasks) *
          100,
      )
    : 0;

  const remainingRoadmapWeeks = Math.max(
    aiRoadmap.length - roadmapProgressSummary.completedWeeks,
    0,
  );

  const latestSavedActivity = recentHistory[0] || null;

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

  useEffect(() => {
    if (!analysis) {
      setRoadmapProgress({});
      return;
    }

    try {
      const savedProgress = localStorage.getItem(roadmapProgressKey);
      setRoadmapProgress(savedProgress ? JSON.parse(savedProgress) : {});
    } catch (error) {
      console.error("Failed to load roadmap progress:", error.message);
      localStorage.removeItem(roadmapProgressKey);
      setRoadmapProgress({});
    }
  }, [analysis, roadmapProgressKey]);

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

  const saveRoadmapProgress = (nextProgress) => {
    setRoadmapProgress(nextProgress);

    if (analysis) {
      localStorage.setItem(roadmapProgressKey, JSON.stringify(nextProgress));
    }
  };

  const toggleRoadmapTask = (stepKey, taskKey) => {
    const nextProgress = {
      ...roadmapProgress,
      [stepKey]: {
        ...(roadmapProgress[stepKey] || {}),
        [taskKey]: !roadmapProgress?.[stepKey]?.[taskKey],
      },
    };

    saveRoadmapProgress(nextProgress);
  };

  const toggleRoadmapWeek = (item, index) => {
    const { stepKey, tasks, isCompleted } = getStepProgress(item, index);
    const nextStepProgress = tasks.reduce((acc, { key }) => {
      acc[key] = !isCompleted;
      return acc;
    }, {});

    saveRoadmapProgress({
      ...roadmapProgress,
      [stepKey]: nextStepProgress,
    });

    toast.success(
      isCompleted
        ? "Roadmap week marked in progress"
        : "Roadmap week completed",
    );
  };

  const dashboardProgressWidgets = [
    {
      label: "Roadmap completion",
      value: `${roadmapProgressPercent}%`,
      helper: `${roadmapProgressSummary.completedTasks}/${roadmapProgressSummary.totalTasks || 0} roadmap tasks completed`,
      icon: ListChecks,
      accent: "from-indigo-500/20 to-violet-500/10",
    },
    {
      label: "Completed weeks",
      value: `${roadmapProgressSummary.completedWeeks}/${aiRoadmap.length || 0}`,
      helper: `${remainingRoadmapWeeks} weeks still open`,
      icon: CheckCircle2,
      accent: "from-emerald-500/20 to-green-500/10",
    },
    {
      label: "Remaining skill gaps",
      value: missingSkills.length,
      helper: missingSkills.length
        ? `${missingSkills.slice(0, 2).join(", ")}${missingSkills.length > 2 ? " + more" : ""}`
        : "No major gaps left",
      icon: AlertTriangle,
      accent: "from-amber-500/20 to-orange-500/10",
    },
    {
      label: "Latest readiness score",
      value: `${jobReadiness}%`,
      helper: readinessStyle.label,
      icon: Gauge,
      accent: "from-cyan-500/20 to-indigo-500/10",
    },
    {
      label: "Recent activity",
      value: recentHistory.length,
      helper: latestSavedActivity
        ? `Last saved ${formatDate(latestSavedActivity.createdAt)}`
        : "No saved activity yet",
      icon: History,
      accent: "from-slate-500/20 to-white/5",
    },
  ];

  const dashboardActions = [
    {
      label: "Analyze New Resume",
      to: "/upload",
      icon: UploadCloud,
      description: "Upload another resume and compare progress.",
    },
    {
      label: "View History",
      to: "/history",
      icon: History,
      description: "Open all saved analyses from your account.",
    },
    {
      label: "Explore Community",
      to: "/community",
      icon: TrendingUp,
      description: "Compare your roadmap with learner trends.",
    },
  ];

  const renderSkillCard = ({
    title,
    icon: Icon,
    iconClass,
    skills,
    variant,
    emptyText,
    helper,
  }) => (
    <Card className="h-full">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Icon size={20} aria-hidden="true" className={iconClass} />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-400">{helper}</p>
        </div>

        <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-gray-200">
          {skills.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, i) => (
            <AnimatedBadge key={`${skill}-${i}`} variant={variant}>
              {skill}
            </AnimatedBadge>
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 md:pt-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl md:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.45 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-200"
              >
                <Sparkles size={16} aria-hidden="true" />
                Main SaaS workspace
              </motion.p>

              <motion.h2
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold tracking-tight text-white md:text-5xl"
              >
                {isAuthenticated
                  ? `${userFirstName}'s Career Dashboard`
                  : "Your Career Dashboard"}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base"
              >
                {isAuthenticated
                  ? `Welcome back, ${userDisplayName}. Review your selected analysis, readiness score, skill gaps, roadmap, and recent activity in one place.`
                  : "Track resume skills, readiness score, gaps, AI recommendations, and your week-by-week roadmap."}
              </motion.p>
            </motion.div>

            {isAuthenticated && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="grid gap-2 sm:grid-cols-3 lg:min-w-[430px] lg:grid-cols-1"
              >
                {latestAnalysisSummary && (
                  <button
                    type="button"
                    onClick={continueFromLatestAnalysis}
                    disabled={openingId === latestAnalysisSummary._id}
                    aria-label="Continue from latest analysis"
                    className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/25 bg-gradient-to-r from-emerald-500/90 via-emerald-400/85 to-teal-400/85 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200/50 hover:shadow-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    <History size={16} aria-hidden="true" />
                    {openingId === latestAnalysisSummary._id
                      ? "Opening latest..."
                      : "Continue Latest"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  aria-label={
                    exportingPDF ? "Generating PDF" : "Export roadmap as PDF"
                  }
                  className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-indigo-300/20 bg-white/[0.07] px-4 text-sm font-semibold text-indigo-100 shadow-lg shadow-indigo-500/10 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300/45 hover:bg-indigo-500/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <Download size={16} aria-hidden="true" />
                  {exportingPDF ? "Generating PDF..." : "Export PDF"}
                </button>

                <button
                  type="button"
                  onClick={clearAnalysis}
                  aria-label="Clear current resume analysis"
                  className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 text-sm font-semibold text-red-200 shadow-lg shadow-red-500/5 transition duration-200 hover:-translate-y-0.5 hover:border-red-300/40 hover:bg-red-500/15"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Clear Selection
                </button>
              </motion.div>
            )}
          </div>
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
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
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
                  Upload Resume
                </GlowButton>
              }
            />

            <Card className="h-full">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-200">
                  <ClipboardCheck size={24} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    What appears here?
                  </h3>
                  <p className="text-sm text-gray-400">
                    Your dashboard becomes active after analysis.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Readiness score with clear reasoning",
                  "Matched and missing skills",
                  "Week-by-week learning roadmap",
                  "Saved account history",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
                  >
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-green-300"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {isAuthenticated && analysis && (
          <>
            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                <Card className="h-full overflow-hidden">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <AnimatedBadge
                          variant={
                            roadmapSource === "ai" ? "success" : "warning"
                          }
                        >
                          {roadmapSource === "ai"
                            ? `${aiProviderUsed || "AI"} Powered`
                            : "Fallback Mode"}
                        </AnimatedBadge>

                        <AnimatedBadge>
                          <Target size={13} aria-hidden="true" />
                          {targetRole}
                        </AnimatedBadge>
                      </div>

                      <h3 className="text-2xl font-bold text-white md:text-3xl">
                        Current Analysis Summary
                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
                        You are preparing for{" "}
                        <span className="font-semibold text-indigo-200">
                          {roleTitle || targetRole}
                        </span>
                        . Focus first on the highlighted skill gaps, then follow
                        the roadmap below week by week.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-center shadow-inner shadow-black/20 md:min-w-44">
                      <p className="text-sm font-medium text-gray-400">
                        Readiness
                      </p>
                      <p
                        className={`mt-2 text-5xl font-black ${readinessStyle.text}`}
                      >
                        {jobReadiness}%
                      </p>
                      <AnimatedBadge
                        variant={readinessStyle.badgeVariant}
                        className="mt-4"
                      >
                        {readinessStyle.label}
                      </AnimatedBadge>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div
                      className="h-3 w-full overflow-hidden rounded-full bg-slate-800"
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
                      />
                    </div>

                    {readinessReason && (
                      <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-300">
                        {readinessReason}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className="h-full">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-green-400/20 bg-green-500/15 text-green-200">
                      <Rocket size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Next Best Actions
                      </h3>
                      <p className="text-sm text-gray-400">
                        Move from analysis to progress.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dashboardActions.map(
                      ({ label, to, icon: Icon, description }) => (
                        <Link
                          key={label}
                          to={to}
                          className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10"
                        >
                          <span className="flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-500/15 text-indigo-200">
                              <Icon size={18} aria-hidden="true" />
                            </span>
                            <span>
                              <span className="block font-semibold text-white">
                                {label}
                              </span>
                              <span className="mt-0.5 block text-xs text-gray-400">
                                {description}
                              </span>
                            </span>
                          </span>
                          <ArrowRight
                            size={17}
                            aria-hidden="true"
                            className="shrink-0 text-gray-500 transition group-hover:translate-x-1 group-hover:text-indigo-200"
                          />
                        </Link>
                      ),
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.section>

            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mb-8"
              aria-labelledby="dashboard-progress-widgets"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
                    Progress Widgets
                  </p>
                  <h3
                    id="dashboard-progress-widgets"
                    className="mt-1 text-2xl font-bold text-white"
                  >
                    Dashboard Progress Snapshot
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Track readiness, roadmap progress, skill gaps, and recent
                    saved activity in one place.
                  </p>
                </div>

                <AnimatedBadge variant="success">
                  <TrendingUp size={13} aria-hidden="true" />
                  {roadmapProgressPercent}% roadmap complete
                </AnimatedBadge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {dashboardProgressWidgets.map(
                  ({ label, value, helper, icon: Icon, accent }, index) => (
                    <motion.div
                      key={label}
                      variants={fadeUp}
                      transition={{ duration: 0.45 + index * 0.05 }}
                    >
                      <Card className="group relative h-full overflow-hidden p-5 md:p-5">
                        <div
                          aria-hidden="true"
                          className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-70 transition duration-200 group-hover:opacity-100`}
                        />
                        <div className="relative z-10">
                          <div className="mb-5 flex items-center justify-between gap-4">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-950/35 text-indigo-200 shadow-inner shadow-white/5">
                              <Icon size={21} aria-hidden="true" />
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                              Live
                            </span>
                          </div>

                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                            {label}
                          </p>
                          <p className="mt-2 text-3xl font-black text-white">
                            {value}
                          </p>
                          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-gray-400">
                            {helper}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ),
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-8"
            >
              <Card>
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-indigo-300">
                      <TrendingUp size={20} aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-white">
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
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10"
                  >
                    View Community
                    <ArrowRight size={16} aria-hidden="true" />
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
                    {[
                      {
                        label: "Popular Role",
                        value:
                          communityStats.mostPopularTargetRole?.role ||
                          "No data",
                        helper:
                          communityStats.mostPopularTargetRole?.roleTitle ||
                          "Most selected target role",
                      },
                      {
                        label: "Common Gap",
                        value:
                          communityStats.mostCommonMissingSkill?.skill ||
                          "No data",
                        helper: communityStats.mostCommonMissingSkill
                          ? `${communityStats.mostCommonMissingSkill.count} learners missing this`
                          : "Most common missing skill",
                      },
                      {
                        label: "Avg Readiness",
                        value: `${communityStats.averageReadinessScore || 0}%`,
                        helper: "Average score across analyses",
                      },
                      {
                        label: "Top Roadmap Skill",
                        value:
                          communityStats.topRoadmapSkill?.skill || "No data",
                        helper: communityStats.topRoadmapSkill
                          ? `${communityStats.topRoadmapSkill.count} roadmap mentions`
                          : "Most recommended skill",
                      },
                      {
                        label: "Total Analyses",
                        value: communityStats.totalAnalyses || 0,
                        helper: "Saved resume analyses",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:bg-white/10"
                      >
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {item.label}
                        </p>
                        <h4 className="mt-2 text-lg font-bold text-white">
                          {item.value}
                        </h4>
                        <p className="mt-1 text-sm text-gray-400">
                          {item.helper}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-8"
            >
              <Card>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-indigo-300">
                      <Brain
                        size={20}
                        aria-hidden="true"
                        className={
                          roadmapSource === "ai"
                            ? "text-green-300"
                            : "text-yellow-300"
                        }
                      />
                      <h3 className="text-lg font-semibold text-white">
                        Roadmap Source
                      </h3>
                    </div>
                    <p className="max-w-3xl text-sm text-gray-400">
                      {roadmapSource === "ai"
                        ? `This roadmap was generated using ${aiProviderUsed || "AI"}.`
                        : "This roadmap is using the rule-based fallback engine."}
                    </p>
                    {roadmapSource === "ai" && (
                      <p className="mt-2 text-xs text-gray-500">
                        Provider: {aiProviderUsed || "AI"} • Model:{" "}
                        {aiModelUsed || "Unknown"} • Prompt:{" "}
                        {promptVersion || "Unknown"}
                      </p>
                    )}
                    {aiError && (
                      <p
                        role="alert"
                        aria-live="assertive"
                        className="mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-300"
                      >
                        {aiError}
                      </p>
                    )}
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
              </Card>
            </motion.section>

            <motion.section
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              <motion.div variants={fadeUp} transition={{ duration: 0.45 }}>
                {renderSkillCard({
                  title: "Extracted Skills",
                  icon: FileText,
                  iconClass: "text-indigo-300",
                  skills: extractedSkills,
                  helper: "Skills found in the uploaded resume.",
                  emptyText:
                    "No skills detected. Try uploading a more detailed resume.",
                })}
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                {renderSkillCard({
                  title: "Matched Skills",
                  icon: CheckCircle2,
                  iconClass: "text-green-300",
                  skills: matchedSkills,
                  variant: "success",
                  helper: "Strengths already matching the target role.",
                  emptyText: "No matched skills found yet.",
                })}
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
                {renderSkillCard({
                  title: "Missing Skills",
                  icon: XCircle,
                  iconClass: "text-red-300",
                  skills: missingSkills,
                  variant: "danger",
                  helper: "Skills to prioritize in your learning plan.",
                  emptyText: "Great! No major skill gaps found.",
                })}
              </motion.div>
            </motion.section>

            {aiEnabled && (
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65 }}
              >
                <Card className="mt-8 md:mt-10">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <WandSparkles
                          size={20}
                          aria-hidden="true"
                          className="text-indigo-300"
                        />
                        <h3 className="text-lg font-semibold text-white">
                          AI Career Summary
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-400 md:text-base">
                        {aiSummary}
                      </p>
                    </div>
                  </div>

                  {aiRecommendations.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      {aiRecommendations.map((recommendation, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-gray-300 transition duration-200 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-16 before:w-16 before:rounded-br-full before:bg-indigo-400/0 before:blur-xl before:transition before:duration-200 after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:h-16 after:w-16 after:rounded-tl-full after:bg-emerald-400/0 after:blur-xl after:transition after:duration-200 hover:-translate-y-1 hover:border-indigo-400/45 hover:shadow-[0_18px_55px_rgba(99,102,241,0.18)] hover:before:bg-indigo-400/25 hover:after:bg-emerald-400/20 md:text-base"
                        >
                          <span className="mb-3 grid h-8 w-8 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-500/15 text-sm font-bold text-indigo-200">
                            {index + 1}
                          </span>
                          {recommendation}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
            >
              <Card className="mt-8 md:mt-10">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Route
                        size={20}
                        aria-hidden="true"
                        className="text-green-300"
                      />
                      <h3 className="text-lg font-semibold text-white">
                        Week-by-Week Roadmap
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Follow these weekly blocks to convert skill gaps into
                      project-ready strengths.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AnimatedBadge variant="success">
                      <BookOpen size={13} aria-hidden="true" />
                      {aiRoadmap.length} learning steps
                    </AnimatedBadge>

                    <AnimatedBadge>
                      <ListChecks size={13} aria-hidden="true" />
                      {roadmapProgressPercent}% complete
                    </AnimatedBadge>
                  </div>
                </div>

                {aiRoadmap.length > 0 ? (
                  <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          Roadmap Progress
                        </h4>
                        <p className="text-sm text-gray-400">
                          Mark each weekly task as you complete it. Progress is
                          saved locally for this analysis.
                        </p>
                      </div>

                      <span className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                        {roadmapProgressSummary.completedTasks}/
                        {roadmapProgressSummary.totalTasks} tasks done
                      </span>
                    </div>

                    <div
                      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                      aria-label="Roadmap completion progress"
                      aria-valuenow={roadmapProgressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${roadmapProgressPercent}%` }}
                        transition={{ duration: 0.45 }}
                        className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400"
                      />
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-gray-300 sm:grid-cols-3">
                      <span>
                        {roadmapProgressSummary.completedWeeks} completed weeks
                      </span>
                      <span>
                        {roadmapProgressSummary.inProgressWeeks} in progress
                      </span>
                      <span>
                        {Math.max(
                          aiRoadmap.length -
                            roadmapProgressSummary.completedWeeks -
                            roadmapProgressSummary.inProgressWeeks,
                          0,
                        )}{" "}
                        not started
                      </span>
                    </div>
                  </div>
                ) : null}

                {aiRoadmap.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {aiRoadmap.map((item, i) => {
                      const {
                        stepKey,
                        tasks,
                        completedTasks,
                        totalTasks,
                        isStarted,
                        isCompleted,
                      } = getStepProgress(item, i);

                      const statusLabel = isCompleted
                        ? "Completed"
                        : isStarted
                          ? "In Progress"
                          : "Not Started";

                      const statusVariant = isCompleted
                        ? "success"
                        : isStarted
                          ? "warning"
                          : "default";

                      return (
                        <motion.div
                          key={`${item.week}-${item.skill}-${i}`}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/25 p-4 transition duration-200 before:pointer-events-none before:absolute before:left-0 before:top-0 before:h-24 before:w-24 before:rounded-br-full before:bg-indigo-400/0 before:blur-2xl before:transition before:duration-200 after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:h-24 after:w-24 after:rounded-tl-full after:bg-emerald-400/0 after:blur-2xl after:transition after:duration-200 hover:-translate-y-1 hover:border-indigo-400/45 hover:shadow-[0_22px_70px_rgba(99,102,241,0.20)] hover:before:bg-indigo-400/25 hover:after:bg-emerald-400/20 md:p-5"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                aria-hidden="true"
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-indigo-500/40 bg-indigo-500/20 font-bold text-indigo-200"
                              >
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  {item.week}
                                </p>
                                <h4 className="mt-1 text-lg font-semibold text-indigo-200">
                                  {item.skill}
                                </h4>
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-end gap-2">
                              <AnimatedBadge
                                variant={statusVariant}
                                className="text-xs"
                              >
                                {statusLabel}
                              </AnimatedBadge>
                              {item.difficulty && (
                                <AnimatedBadge className="text-xs">
                                  <Gauge size={13} aria-hidden="true" />
                                  {item.difficulty}
                                </AnimatedBadge>
                              )}
                              {item.timeEstimate && (
                                <AnimatedBadge
                                  variant="success"
                                  className="text-xs"
                                >
                                  <Clock size={13} aria-hidden="true" />
                                  {item.timeEstimate}
                                </AnimatedBadge>
                              )}
                            </div>
                          </div>

                          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {completedTasks}/{totalTasks} tasks completed
                              </p>
                              <p className="text-xs text-gray-500">
                                {isCompleted
                                  ? "Great work. This week is finished."
                                  : isStarted
                                    ? "Keep going and finish the remaining tasks."
                                    : "Start with the learning task, then build the mini project."}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleRoadmapWeek(item, i)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-300/20 bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:-translate-y-0.5 hover:border-indigo-300/45 hover:bg-indigo-500/20"
                            >
                              {isCompleted ? (
                                <RotateCcw size={15} aria-hidden="true" />
                              ) : (
                                <CheckSquare size={15} aria-hidden="true" />
                              )}
                              {isCompleted
                                ? "Reset Week"
                                : "Mark Week Complete"}
                            </button>
                          </div>

                          <div className="space-y-3">
                            {tasks.map(({ key, label }) => {
                              const isTaskComplete = Boolean(
                                roadmapProgress?.[stepKey]?.[key],
                              );

                              return (
                                <div
                                  key={key}
                                  className={`rounded-2xl border p-3 transition ${
                                    isTaskComplete
                                      ? "border-emerald-400/30 bg-emerald-500/10"
                                      : "border-white/10 bg-white/5"
                                  }`}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                      {label}
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleRoadmapTask(stepKey, key)
                                      }
                                      aria-label={`${
                                        isTaskComplete
                                          ? "Mark incomplete"
                                          : "Mark complete"
                                      } ${label} for ${item.week}`}
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:-translate-y-0.5 ${
                                        isTaskComplete
                                          ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
                                          : "border-white/10 bg-white/5 text-gray-300 hover:border-indigo-300/30 hover:text-indigo-100"
                                      }`}
                                    >
                                      {isTaskComplete ? (
                                        <CheckSquare
                                          size={13}
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <Square size={13} aria-hidden="true" />
                                      )}
                                      {isTaskComplete ? "Done" : "Mark done"}
                                    </button>
                                  </div>

                                  <p className="mt-1 text-sm leading-relaxed text-gray-300">
                                    {item[key]}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Layers3}
                    title="No roadmap steps needed right now"
                    description="Your profile already matches the target role well. Keep building advanced projects and applying for internships."
                    compact
                    className="bg-white/5"
                  />
                )}
              </Card>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="mt-8 md:mt-10">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-indigo-300">
                      <History size={20} aria-hidden="true" />
                      <h3 className="text-lg font-semibold text-white">
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
                    className="mb-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-300"
                  >
                    {historyError}
                  </div>
                )}

                {historyLoading && (
                  <div
                    className="rounded-3xl border border-white/10 bg-white/5 py-10 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-400"></div>
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
                    className="grid grid-cols-1 gap-4 md:grid-cols-3"
                  >
                    {recentHistory.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={fadeUp}
                        transition={{ duration: 0.45 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-indigo-500/30 hover:bg-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-gray-400">
                              {item.resumeName || "Untitled Resume"}
                            </p>
                            <h4 className="mt-1 font-semibold text-gray-100">
                              {item.targetRole}
                            </h4>
                          </div>

                          <AnimatedBadge
                            variant={getScoreVariant(item.jobReadiness)}
                          >
                            {item.jobReadiness}%
                          </AnimatedBadge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
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

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
                          <Link
                            to={`/analysis/${item._id}`}
                            aria-label={`View details for ${
                              item.resumeName || item.targetRole
                            } analysis`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500 bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
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
            </motion.section>
          </>
        )}
      </main>

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
