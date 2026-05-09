import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import GlowButton from "../components/ui/GlowButton";
import ConfirmModal from "../components/ui/ConfirmModal";
import SkeletonCard from "../components/ui/SkeletonCard";
import { getAnalysisByIdAPI, deleteAnalysisAPI } from "../services/api";
import { getReadinessStyle } from "../utils/readiness";
import { motion } from "framer-motion";
import { exportAnalysisPdfAPI } from "../services/api";
import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  Route,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
  AlertTriangle,
  WandSparkles,
  Database,
  Download,
} from "lucide-react";

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [error, setError] = useState("");
  const [exportingPDF, setExportingPDF] = useState(false);

  const extractedSkills = analysis?.extractedSkills || [];
  const requiredSkills = analysis?.requiredSkills || [];
  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const roadmap = analysis?.roadmap || [];
  const aiRoadmap = analysis?.aiRoadmap || roadmap;
  const aiRecommendations = analysis?.aiRecommendations || [];
  const readinessStyle = getReadinessStyle(analysis?.jobReadiness || 0);

  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAnalysisByIdAPI(id);
        setAnalysis(data);
      } catch (err) {
        const message = err.message || "Failed to load analysis.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openInDashboard = () => {
    if (!analysis) return;

    localStorage.setItem("analysis", JSON.stringify(analysis));

    navigate("/dashboard", {
      state: {
        analysis,
      },
    });

    toast.success("Analysis opened in dashboard");
  };

  const requestDeleteAnalysis = () => {
    setDeleteTargetId(id);
  };

  const confirmDeleteAnalysis = async () => {
    if (!deleteTargetId) return;

    try {
      setDeletingId(deleteTargetId);

      await deleteAnalysisAPI(deleteTargetId);

      toast.success("Analysis deleted successfully");
      setDeleteTargetId(null);
      navigate("/history");
    } catch (err) {
      const message = err.message || "Failed to delete analysis.";
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  };

  const cancelDeleteAnalysis = () => {
    if (deletingId) return;
    setDeleteTargetId(null);
  };

  const handleExportPDF = async () => {
    const analysisId = analysis?._id || analysis?.analysisId;

    if (!analysisId) {
      toast.error("Analysis ID is missing. Unable to export PDF.");
      return;
    }

    if (exportingPDF) return;

    try {
      setExportingPDF(true);

      await exportAnalysisPdfAPI(analysisId);

      toast.success("Roadmap PDF exported successfully");
    } catch (error) {
      console.error("Failed to export roadmap PDF:", error.message);
      toast.error(error.message || "Unable to export PDF. Please try again.");
    } finally {
      setExportingPDF(false);
    }
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
            <motion.button
              variants={fadeUp}
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 mb-3"
            >
              <ArrowLeft size={16} />
              Back to History
            </motion.button>

            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-sm text-indigo-300 mb-2"
            >
              <Database size={16} />
              Saved analysis detail
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="text-2xl md:text-4xl font-bold"
            >
              Analysis Detail
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              Review the complete saved resume analysis, roadmap, AI metadata,
              and readiness insights.
            </motion.p>
          </motion.div>

          {analysis && (
            <div className="flex flex-col sm:flex-row gap-3">
              <GlowButton onClick={openInDashboard} variant="solid">
                Open in Dashboard
              </GlowButton>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                aria-label="Export this analysis as PDF"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm transition"
              >
                {exportingPDF ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-indigo-300/30 border-t-indigo-300 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} aria-hidden="true" />
                    Export PDF
                  </>
                )}
              </button>

              <button
                onClick={requestDeleteAnalysis}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm transition"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && <SkeletonCard count={4} />}

        {/* ERROR */}
        {!loading && error && (
          <Card>
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 mb-5">
                <AlertTriangle size={30} />
              </div>

              <h3 className="text-xl font-semibold text-red-300">
                Failed to Load Analysis
              </h3>

              <p className="text-sm md:text-base text-gray-400 mt-2">{error}</p>

              <div className="mt-6">
                <GlowButton to="/history" variant="primary">
                  Back to History
                </GlowButton>
              </div>
            </div>
          </Card>
        )}

        {/* CONTENT */}
        {!loading && analysis && (
          <>
            {/* TOP STATS */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <motion.div variants={fadeUp}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-300 mb-2">
                        <FileText size={18} />
                        <h3 className="text-lg font-semibold text-indigo-400">
                          Resume
                        </h3>
                      </div>

                      <p className="text-xl font-bold break-words">
                        {analysis.resumeName || "Untitled Resume"}
                      </p>

                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(analysis.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-300 mb-2">
                        <Target size={18} />
                        <h3 className="text-lg font-semibold text-indigo-400">
                          Target Role
                        </h3>
                      </div>

                      <p className="text-2xl font-bold">
                        {analysis.targetRole}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        {analysis.roleTitle || "Target role analysis"}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card>
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

                  <p className="text-3xl font-bold mt-2">
                    {analysis.jobReadiness || 0}%
                  </p>

                  <div className="mt-4 w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.jobReadiness || 0}%` }}
                      transition={{ duration: 0.9, delay: 0.2 }}
                      className={`${readinessStyle.bg} h-3 rounded-full`}
                    ></motion.div>
                  </div>

                  {analysis.readinessReason && (
                    <p className="text-sm text-gray-400 mt-3">
                      {analysis.readinessReason}
                    </p>
                  )}
                </Card>
              </motion.div>
            </motion.div>

            {/* AI METADATA */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Card className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain
                        size={20}
                        className={
                          analysis.roadmapSource === "ai"
                            ? "text-green-300"
                            : "text-yellow-300"
                        }
                      />

                      <h3 className="text-lg font-semibold text-indigo-400">
                        Roadmap Source
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400">
                      {analysis.roadmapSource === "ai"
                        ? `This roadmap was generated using ${
                            analysis.aiProviderUsed || "AI"
                          }.`
                        : "This roadmap is using the rule-based fallback engine."}
                    </p>

                    {analysis.roadmapSource === "ai" && (
                      <p className="text-xs text-gray-500 mt-2">
                        Provider: {analysis.aiProviderUsed || "AI"} • Model:{" "}
                        {analysis.aiModelUsed || "Unknown"} • Prompt:{" "}
                        {analysis.promptVersion || "Unknown"}
                      </p>
                    )}

                    {analysis.aiError && (
                      <p className="text-sm text-yellow-300 mt-2">
                        {analysis.aiError}
                      </p>
                    )}
                  </div>

                  <AnimatedBadge
                    variant={
                      analysis.roadmapSource === "ai" ? "success" : "warning"
                    }
                  >
                    {analysis.roadmapSource === "ai"
                      ? `${analysis.aiProviderUsed || "AI"} Powered`
                      : "Fallback Mode"}
                  </AnimatedBadge>
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
              <motion.div variants={fadeUp}>
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

              <motion.div variants={fadeUp}>
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

              <motion.div variants={fadeUp}>
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
            {analysis.aiEnabled && (
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
                    {analysis.aiSummary}
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
          </>
        )}
      </main>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete this analysis?"
        message="This will permanently remove this saved resume analysis from your history."
        confirmText="Delete Analysis"
        cancelText="Keep It"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteAnalysis}
        onCancel={cancelDeleteAnalysis}
      />
    </GradientBackground>
  );
}
