import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import GlowButton from "../components/ui/GlowButton";
import ConfirmModal from "../components/ui/ConfirmModal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import {
  deleteAnalysisAPI,
  exportAnalysisPdfAPI,
  getAnalysisByIdAPI,
} from "../services/api";
import { getReadinessStyle } from "../utils/readiness";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  WandSparkles,
  XCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
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

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getSkillCoverage = (matchedSkills, requiredSkills) => {
  if (!requiredSkills.length) return 0;
  return Math.round((matchedSkills.length / requiredSkills.length) * 100);
};

function DetailStatCard({ icon: Icon, label, value, helper, tone = "indigo" }) {
  const toneStyles = {
    indigo:
      "from-indigo-500/20 to-cyan-500/10 text-indigo-300 border-indigo-400/20",
    green:
      "from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-400/20",
    yellow:
      "from-yellow-500/20 to-orange-500/10 text-yellow-300 border-yellow-400/20",
    red: "from-red-500/20 to-rose-500/10 text-red-300 border-red-400/20",
  };

  return (
    <Card className="relative overflow-hidden p-5 hover:bg-white/[0.06]">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${toneStyles[tone]} blur-2xl`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-black text-white md:text-3xl">
            {value}
          </p>
          {helper && (
            <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>
          )}
        </div>

        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-gradient-to-br ${toneStyles[tone]}`}
        >
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

function SkillPanel({
  title,
  icon: Icon,
  skills,
  variant = "default",
  emptyText,
}) {
  const tone = {
    default: "text-indigo-300",
    success: "text-emerald-300",
    danger: "text-red-300",
  }[variant];

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={20} className={tone} aria-hidden="true" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <AnimatedBadge variant={variant === "default" ? "default" : variant}>
          {skills.length}
        </AnimatedBadge>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, index) => (
            <AnimatedBadge key={`${skill}-${index}`} variant={variant}>
              {skill}
            </AnimatedBadge>
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            {emptyText}
          </p>
        )}
      </div>
    </Card>
  );
}

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [error, setError] = useState("");
  const [exportingPDF, setExportingPDF] = useState(false);

  const extractedSkills = safeArray(analysis?.extractedSkills);
  const requiredSkills = safeArray(analysis?.requiredSkills);
  const matchedSkills = safeArray(analysis?.matchedSkills);
  const missingSkills = safeArray(analysis?.missingSkills);
  const roadmap = safeArray(analysis?.roadmap);
  const aiRoadmap = safeArray(analysis?.aiRoadmap).length
    ? safeArray(analysis?.aiRoadmap)
    : roadmap;
  const aiRecommendations = safeArray(analysis?.aiRecommendations);
  const readinessStyle = getReadinessStyle(analysis?.jobReadiness || 0);

  const skillCoverage = useMemo(
    () => getSkillCoverage(matchedSkills, requiredSkills),
    [matchedSkills, requiredSkills],
  );

  const topMissingSkills = missingSkills.slice(0, 4);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAnalysisByIdAPI(id);
        setAnalysis(data);
      } catch (err) {
        const message =
          err.message ||
          "This analysis either does not exist or does not belong to your account.";

        setError(message);

        if (
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("invalid")
        ) {
          toast.error("Analysis not found");
        } else {
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, isAuthenticated]);

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
    } catch (exportError) {
      console.error("Failed to export roadmap PDF:", exportError.message);
      toast.error(
        exportError.message || "Unable to export PDF. Please try again.",
      );
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"
      >
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("/history")}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to History
              </motion.button>

              <motion.p
                variants={fadeUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200"
              >
                <Database size={16} aria-hidden="true" />
                Saved analysis report
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-3xl font-black tracking-tight text-white md:text-5xl"
              >
                Analysis Detail
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base"
              >
                Review your saved resume analysis, readiness score, skill gaps,
                roadmap, recommendations, and export-ready career report in one
                polished workspace.
              </motion.p>
            </div>

            {analysis && (
              <motion.div
                variants={fadeUp}
                className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px] lg:grid-cols-1 xl:grid-cols-2"
              >
                <GlowButton
                  onClick={openInDashboard}
                  variant="solid"
                  className="w-full"
                >
                  <LayoutDashboard size={16} aria-hidden="true" />
                  Open Dashboard
                </GlowButton>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                  aria-label="Export this analysis as PDF"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                  type="button"
                  onClick={requestDeleteAnalysis}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition hover:-translate-y-0.5 hover:bg-red-500/20 sm:col-span-2 lg:col-span-1 xl:col-span-2"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Delete Analysis
                </button>
              </motion.div>
            )}
          </div>
        </motion.section>

        {loading && (
          <LoadingState
            variant="inline"
            title="Loading saved analysis..."
            description="Preparing your readiness score, skill gaps, roadmap, and export actions."
          />
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <ErrorState
              className="mx-auto max-w-3xl"
              title="Analysis Not Found"
              description="This saved report may have been deleted, the link may be invalid, or it may not belong to your account."
              details={error}
              actionLabel="Back to History"
              actionTo="/history"
              secondaryAction={
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10 hover:text-white"
                >
                  Upload Resume
                </button>
              }
            />
          </motion.div>
        )}

        {!loading && analysis && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.section
              variants={fadeUp}
              className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
            >
              <Card className="relative overflow-hidden">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="relative">
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-300">
                        <FileText size={16} aria-hidden="true" />
                        Resume Analysis Summary
                      </p>
                      <h2 className="break-words text-2xl font-black text-white md:text-3xl">
                        {analysis.resumeName || "Untitled Resume"}
                      </h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={15} aria-hidden="true" />
                        Saved on {formatDate(analysis.createdAt)}
                      </p>
                    </div>

                    <AnimatedBadge
                      variant={
                        analysis.roadmapSource === "ai" ? "success" : "warning"
                      }
                    >
                      {analysis.roadmapSource === "ai"
                        ? "AI Powered"
                        : "Fallback Mode"}
                    </AnimatedBadge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Target Role
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {analysis.targetRole || "Not selected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {analysis.roleTitle || "Career target"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Skill Match
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {matchedSkills.length}/
                        {requiredSkills.length || matchedSkills.length}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {skillCoverage}% coverage
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Roadmap
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        {aiRoadmap.length} weeks
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Action plan generated
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden">
                <div
                  className={`absolute inset-x-8 -top-20 h-40 rounded-full ${readinessStyle.bg} opacity-20 blur-3xl`}
                />
                <div className="relative text-center">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/10">
                    <TrendingUp
                      size={26}
                      className={readinessStyle.text}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">
                    Latest Readiness Score
                  </p>
                  <p
                    className={`mt-2 text-6xl font-black ${readinessStyle.text}`}
                  >
                    {analysis.jobReadiness || 0}%
                  </p>
                  <AnimatedBadge
                    variant={readinessStyle.badgeVariant}
                    className="mt-4"
                  >
                    {readinessStyle.label}
                  </AnimatedBadge>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.jobReadiness || 0}%` }}
                      transition={{ duration: 0.9, delay: 0.2 }}
                      className={`${readinessStyle.bg} h-full rounded-full`}
                    />
                  </div>

                  {analysis.readinessReason && (
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      {analysis.readinessReason}
                    </p>
                  )}
                </div>
              </Card>
            </motion.section>

            <motion.section
              variants={fadeUp}
              className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
            >
              <DetailStatCard
                icon={ShieldCheck}
                label="Matched Skills"
                value={matchedSkills.length}
                helper="Skills already aligned with the role"
                tone="green"
              />
              <DetailStatCard
                icon={Target}
                label="Missing Skills"
                value={missingSkills.length}
                helper={
                  topMissingSkills.length
                    ? topMissingSkills.join(", ")
                    : "No major gaps found"
                }
                tone={missingSkills.length ? "red" : "green"}
              />
              <DetailStatCard
                icon={ListChecks}
                label="Roadmap Weeks"
                value={aiRoadmap.length}
                helper="Week-by-week learning plan"
                tone="indigo"
              />
              <DetailStatCard
                icon={Brain}
                label="Roadmap Source"
                value={
                  analysis.aiProviderUsed ||
                  (analysis.roadmapSource === "ai" ? "AI" : "Fallback")
                }
                helper={
                  analysis.aiModelUsed ||
                  analysis.promptVersion ||
                  "Career roadmap engine"
                }
                tone="yellow"
              />
            </motion.section>

            <motion.section
              variants={fadeUp}
              className="mb-8 grid gap-6 lg:grid-cols-3"
            >
              <SkillPanel
                title="Extracted Skills"
                icon={FileText}
                skills={extractedSkills}
                emptyText="No skills were detected from this resume."
              />
              <SkillPanel
                title="Matched Skills"
                icon={CheckCircle2}
                skills={matchedSkills}
                variant="success"
                emptyText="No matched skills found yet."
              />
              <SkillPanel
                title="Missing Skills"
                icon={XCircle}
                skills={missingSkills}
                variant="danger"
                emptyText="Great! No major skill gaps found."
              />
            </motion.section>

            {(analysis.aiSummary ||
              aiRecommendations.length > 0 ||
              analysis.aiError) && (
              <motion.section variants={fadeUp} className="mb-8">
                <Card>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-300">
                        <WandSparkles size={18} aria-hidden="true" />
                        AI Career Summary
                      </p>
                      <h3 className="text-2xl font-black text-white">
                        Recommended next moves
                      </h3>
                    </div>
                    <AnimatedBadge
                      variant={analysis.aiError ? "warning" : "success"}
                    >
                      {analysis.aiError ? "Needs Review" : "Personalized"}
                    </AnimatedBadge>
                  </div>

                  {analysis.aiSummary && (
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300 md:text-base">
                      {analysis.aiSummary}
                    </p>
                  )}

                  {analysis.aiError && (
                    <p className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                      {analysis.aiError}
                    </p>
                  )}

                  {aiRecommendations.length > 0 && (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {aiRecommendations.map((recommendation, index) => (
                        <motion.div
                          key={`${recommendation}-${index}`}
                          variants={fadeUp}
                          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/10"
                        >
                          <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-indigo-500/20 blur-2xl transition group-hover:bg-indigo-400/30" />
                          <div className="relative">
                            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-500/20 text-sm font-black text-indigo-200">
                              {index + 1}
                            </span>
                            <p className="mt-4 text-sm leading-6 text-slate-300">
                              {recommendation}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.section>
            )}

            <motion.section variants={fadeUp}>
              <Card>
                <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      <Route size={18} aria-hidden="true" />
                      Week-by-Week Roadmap
                    </p>
                    <h3 className="text-2xl font-black text-white">
                      Your saved learning plan
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Follow these weeks in order, then open the dashboard to
                      track task completion.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openInDashboard}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-500/20"
                  >
                    Track Progress
                    <ExternalLink size={15} aria-hidden="true" />
                  </button>
                </div>

                {aiRoadmap.length > 0 ? (
                  <div className="relative">
                    <div className="absolute bottom-4 left-4 top-4 hidden w-px bg-gradient-to-b from-indigo-400/50 via-emerald-400/30 to-transparent sm:block" />

                    <div className="space-y-5">
                      {aiRoadmap.map((item, index) => (
                        <motion.article
                          key={`${item.week}-${item.skill}-${index}`}
                          initial={{ opacity: 0, x: -18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          className="group relative sm:pl-12"
                        >
                          <div className="absolute left-0 top-5 hidden h-9 w-9 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-sm font-black text-indigo-200 shadow-lg shadow-indigo-500/10 sm:grid">
                            {index + 1}
                          </div>

                          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-2xl hover:shadow-indigo-500/10 md:p-6">
                            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20" />
                            <div className="relative">
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                                    {item.week || `Week ${index + 1}`}
                                  </p>
                                  <h4 className="mt-2 text-xl font-black text-white">
                                    {item.skill || "Career skill focus"}
                                  </h4>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {item.difficulty && (
                                    <AnimatedBadge>
                                      <Gauge size={13} aria-hidden="true" />
                                      {item.difficulty}
                                    </AnimatedBadge>
                                  )}

                                  {item.timeEstimate && (
                                    <AnimatedBadge variant="success">
                                      <Clock size={13} aria-hidden="true" />
                                      {item.timeEstimate}
                                    </AnimatedBadge>
                                  )}
                                </div>
                              </div>

                              <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-200">
                                    <Lightbulb size={15} aria-hidden="true" />
                                    Learn
                                  </p>
                                  <p className="text-sm leading-6 text-slate-400">
                                    {item.learn ||
                                      "Focus on the main concept for this week."}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                                    <Sparkles size={15} aria-hidden="true" />
                                    How to Learn
                                  </p>
                                  <p className="text-sm leading-6 text-slate-400">
                                    {item.howToLearn ||
                                      "Practice through docs, videos, and implementation."}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-200">
                                    <ExternalLink
                                      size={15}
                                      aria-hidden="true"
                                    />
                                    Free Resource
                                  </p>
                                  <p className="text-sm leading-6 text-slate-400">
                                    {item.resource ||
                                      "Use a free beginner-friendly resource."}
                                  </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-200">
                                    <ChevronRight
                                      size={15}
                                      aria-hidden="true"
                                    />
                                    Mini Project
                                  </p>
                                  <p className="text-sm leading-6 text-slate-400">
                                    {item.project ||
                                      "Build a small project to prove this skill."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                      <CheckCircle2 size={28} aria-hidden="true" />
                    </div>
                    <h4 className="text-xl font-bold text-white">
                      No major roadmap gaps found
                    </h4>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      Your profile already matches the target role well. Keep
                      building advanced projects, improving interview readiness,
                      and applying for internships.
                    </p>
                  </div>
                )}
              </Card>
            </motion.section>
          </motion.div>
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
