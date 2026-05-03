import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import GlowButton from "../components/ui/GlowButton";
import GradientBackground from "../components/layout/GradientBackground";
import { getReadinessStyle } from "../utils/readiness";
import SkeletonCard from "../components/ui/SkeletonCard";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ui/ConfirmModal";

import {
  getAnalysisHistoryAPI,
  getAnalysisByIdAPI,
  deleteAnalysisAPI,
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
  RefreshCcw,
  Clock,
  Gauge,
  History,
  Eye,
  Trash2,
  Database,
  ShieldCheck,
  BarChart3,
  WandSparkles,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialAnalysis = () => {
    try {
      const savedAnalysis = localStorage.getItem("analysis");

      return (
        location.state?.analysis ||
        (savedAnalysis ? JSON.parse(savedAnalysis) : null)
      );
    } catch (error) {
      console.error("Failed to parse saved analysis:", error.message);
      localStorage.removeItem("analysis");
      return null;
    }
  };

  const [analysis, setAnalysis] = useState(getInitialAnalysis);
  const [recentHistory, setRecentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openingId, setOpeningId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [historyError, setHistoryError] = useState("");

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

  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
    const fetchRecentHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const data = await getAnalysisHistoryAPI();

        setRecentHistory((data.analyses || []).slice(0, 3));
      } catch (error) {
        console.error("Failed to load recent history:", error.message);
        setHistoryError("Unable to load recent history right now.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchRecentHistory();
  }, []);

  const clearAnalysis = () => {
    localStorage.removeItem("analysis");
    setAnalysis(null);

    navigate("/dashboard", {
      replace: true,
      state: null,
    });
  };

  const formatDate = (date) => {
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
        localStorage.removeItem("analysis");
        setAnalysis(null);

        navigate("/dashboard", {
          replace: true,
          state: null,
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

      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-10 pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 text-sm text-indigo-300 mb-2"
            >
              <Sparkles size={16} />
              AI-powered career insights
            </motion.p>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-bold"
            >
              Your Career Dashboard
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              Track your skills, readiness score, gaps, AI recommendations, and
              personalized roadmap.
            </motion.p>
          </motion.div>

          {analysis && (
            <motion.button
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              onClick={clearAnalysis}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm transition w-fit"
            >
              <RefreshCcw size={16} />
              Clear Analysis
            </motion.button>
          )}
        </div>

        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Card>
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-5">
                  <FileText size={30} />
                </div>

                <h3 className="text-xl font-semibold text-indigo-400">
                  No Resume Analysis Found
                </h3>

                <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl mx-auto">
                  Please upload and analyze your resume first to view your
                  career insights, skill gaps, readiness score, and AI roadmap.
                </p>

                <div className="mt-6">
                  <GlowButton to="/upload" variant="solid">
                    Upload Resume
                  </GlowButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {analysis && (
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
                        <Target size={18} />
                        <h3 className="text-lg font-semibold text-indigo-400">
                          Target Role
                        </h3>
                      </div>

                      <p className="text-2xl font-bold">{targetRole}</p>
                      <p className="text-sm text-gray-400 mt-1">{roleTitle}</p>
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Target size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card>
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className={readinessStyle.text} />
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

                    <div className="mt-4 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
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
                        <AlertTriangle size={18} />
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
                      <AlertTriangle size={24} />
                    </div>
                  </div>
                </Card>
              </motion.div>
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
                    <p className="text-sm text-yellow-300 mt-2">{aiError}</p>
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
                    <FileText size={20} className="text-indigo-300" />
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
                    <CheckCircle2 size={20} className="text-green-300" />
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
                    <XCircle size={20} className="text-red-300" />
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
                    <WandSparkles size={20} className="text-indigo-300" />
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
                          className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm md:text-base text-gray-400 hover:bg-white/10 transition"
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
                  <Route size={20} className="text-green-300" />
                  <h3 className="text-lg font-semibold text-green-400">
                    Week-by-Week Roadmap
                  </h3>
                </div>

                {aiRoadmap.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10"></div>

                    <div className="space-y-6">
                      {aiRoadmap.map((item, i) => (
                        <motion.div
                          key={`${item.week}-${item.skill}-${i}`}
                          initial={{ opacity: 0, x: -22 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="relative pl-12"
                        >
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                            {i + 1}
                          </div>

                          <div className="p-4 md:p-5 bg-[#0f172a]/80 backdrop-blur-md rounded-xl border border-white/10 hover:border-indigo-500/30 transition">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                              <h4 className="font-semibold text-indigo-400">
                                {item.week}: {item.skill}
                              </h4>

                              <div className="flex flex-wrap gap-2">
                                {item.difficulty && (
                                  <AnimatedBadge className="text-xs">
                                    <Gauge size={13} />
                                    Difficulty: {item.difficulty}
                                  </AnimatedBadge>
                                )}

                                {item.timeEstimate && (
                                  <AnimatedBadge
                                    variant="success"
                                    className="text-xs"
                                  >
                                    <Clock size={13} />
                                    Time: {item.timeEstimate}
                                  </AnimatedBadge>
                                )}
                              </div>
                            </div>

                            <p className="text-sm md:text-base text-gray-400 mt-3">
                              <span className="text-gray-300">Learn:</span>{" "}
                              {item.learn}
                            </p>

                            {item.howToLearn && (
                              <p className="text-sm md:text-base text-gray-400 mt-2">
                                <span className="text-gray-300">
                                  How to Learn:
                                </span>{" "}
                                {item.howToLearn}
                              </p>
                            )}

                            <p className="text-sm md:text-base text-gray-400 mt-2">
                              <span className="text-gray-300">
                                Free Resource:
                              </span>{" "}
                              {item.resource}
                            </p>

                            <p className="text-sm md:text-base text-gray-400 mt-2">
                              <span className="text-gray-300">
                                Mini Project:
                              </span>{" "}
                              {item.project}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <p className="text-sm md:text-base text-gray-400">
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
                      <History size={20} />
                      <h3 className="text-lg font-semibold text-indigo-400">
                        Recent Analyses
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400">
                      Quickly access your latest saved resume analysis results.
                    </p>
                  </div>

                  <GlowButton to="/history" variant="primary">
                    View All History
                  </GlowButton>
                </div>

                {historyError && (
                  <div className="mb-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-300 text-sm">
                    {historyError}
                  </div>
                )}

                {historyLoading && (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin"></div>
                    <p className="text-sm text-gray-400">
                      Loading recent analyses...
                    </p>
                  </div>
                )}

                {!historyLoading && recentHistory.length === 0 && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-5 text-center">
                    <p className="text-sm text-gray-400">
                      No previous analyses found yet.
                    </p>
                  </div>
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
                        className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-indigo-500/30 transition"
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
                            <Clock size={13} />
                            {formatDate(item.createdAt)}
                          </AnimatedBadge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => openHistoryAnalysis(item._id)}
                            disabled={openingId === item._id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm text-white transition"
                          >
                            <Eye size={15} />
                            {openingId === item._id ? "Opening..." : "Open"}
                          </button>

                          <button
                            onClick={() =>
                              requestDeleteHistoryAnalysis(item._id)
                            }
                            disabled={deletingId === item._id}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm transition"
                          >
                            <Trash2 size={15} />
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
