import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import toast from "react-hot-toast";
import SkeletonCard from "../components/ui/SkeletonCard";
import ConfirmModal from "../components/ui/ConfirmModal";
import EmptyState from "../components/ui/EmptyState";

import {
  getAnalysisHistoryAPI,
  getAnalysisByIdAPI,
  deleteAnalysisAPI,
} from "../services/api";

import { motion } from "framer-motion";

import {
  Clock,
  FileText,
  Trash2,
  Eye,
  RefreshCcw,
  Database,
  AlertTriangle,
  Brain,
  BarChart3,
  Search,
  Filter,
  X,
  ListChecks,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openingId, setOpeningId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const navigate = useNavigate();

  const limit = 6;

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

  const fetchHistory = async ({
    pageToLoad = 1,
    append = false,
    search = searchTerm,
    role = roleFilter,
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getAnalysisHistoryAPI({
        search,
        role,
        page: pageToLoad,
        limit,
      });

      const newAnalyses = data.analyses || [];

      setHistory((prev) => (append ? [...prev, ...newAnalyses] : newAnalyses));
      setPage(data.page || pageToLoad);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setHasMore(Boolean(data.hasMore));
    } catch (err) {
      const message = err.message || "Failed to load analysis history.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHistory({
      pageToLoad: 1,
      append: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    await fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role: roleFilter,
    });

    if (searchTerm.trim()) {
      toast.success("Search applied");
    }
  };

  const handleRoleChange = (role) => {
    setRoleFilter(role);

    fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role,
    });
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    await fetchHistory({
      pageToLoad: page + 1,
      append: true,
      search: searchTerm,
      role: roleFilter,
    });
  };

  const openAnalysis = async (id) => {
    try {
      setOpeningId(id);
      setError("");

      const analysis = await getAnalysisByIdAPI(id);

      localStorage.setItem("analysis", JSON.stringify(analysis));

      navigate("/dashboard", {
        state: {
          analysis,
        },
      });

      toast.success("Analysis opened successfully");
    } catch (err) {
      const message = err.message || "Failed to open analysis.";
      setError(message);
      toast.error(message);
    } finally {
      setOpeningId("");
    }
  };

  const requestDeleteAnalysis = (id) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteAnalysis = async () => {
    if (!deleteTargetId) return;

    try {
      setDeletingId(deleteTargetId);
      setError("");

      await deleteAnalysisAPI(deleteTargetId);

      setHistory((prev) => prev.filter((item) => item._id !== deleteTargetId));
      setTotal((prev) => Math.max(prev - 1, 0));

      toast.success("Analysis deleted successfully");
      setDeleteTargetId(null);
    } catch (err) {
      const message = err.message || "Failed to delete analysis.";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId("");
    }
  };

  const cancelDeleteAnalysis = () => {
    if (deletingId) return;
    setDeleteTargetId(null);
  };

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

  const getScoreVariant = (score) => {
    if (score <= 40) return "danger";
    if (score <= 70) return "warning";
    return "success";
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setRoleFilter("All");

    await fetchHistory({
      pageToLoad: 1,
      append: false,
      search: "",
      role: "All",
    });

    toast.success("Filters cleared");
  };

  const filtersActive = searchTerm.trim() !== "" || roleFilter !== "All";

  const roles = [
    "All",
    "SDE",
    "AI/ML",
    "Data Science",
    "DevOps",
    "Frontend",
    "Backend",
  ];

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
              <Database size={16} aria-hidden="true" />
              Saved resume analysis history
            </motion.p>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-bold"
            >
              Analysis History
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="text-sm md:text-base text-gray-400 mt-2"
            >
              View, reopen, search, filter, or delete your previous resume
              analysis results.
            </motion.p>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            onClick={() =>
              fetchHistory({
                pageToLoad: 1,
                append: false,
                search: searchTerm,
                role: roleFilter,
              })
            }
            disabled={loading}
            aria-label="Refresh analysis history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCcw
              size={16}
              aria-hidden="true"
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </motion.button>
        </div>

        {/* SEARCH + FILTER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <div className="flex items-center gap-2 text-indigo-300 mb-5">
              <Search size={18} aria-hidden="true" />
              <h3 className="text-lg font-semibold text-indigo-400">
                Search & Filter
              </h3>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row md:items-end gap-4"
              aria-label="Search and filter analysis history"
            >
              {/* Search */}
              <div className="flex-1">
                <label
                  htmlFor="history-search"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <Search size={15} aria-hidden="true" />
                  Search History
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    id="history-search"
                    name="historySearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by resume name, role, AI provider, or source..."
                    aria-label="Search analysis history"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="w-full md:w-64">
                <label
                  htmlFor="history-role-filter"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <Filter size={15} aria-hidden="true" />
                  Filter by Role
                </label>

                <select
                  id="history-role-filter"
                  name="historyRoleFilter"
                  value={roleFilter}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  aria-label="Filter analysis history by target role"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-400 transition"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-[#0f172a]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                aria-label="Search analysis history"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm text-white transition"
              >
                <Search size={16} aria-hidden="true" />
                Search
              </button>

              {/* Clear Filters */}
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear history search and role filters"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm transition"
                >
                  <X size={16} aria-hidden="true" />
                  Clear
                </button>
              )}
            </form>

            {/* Result count */}
            {!loading && (
              <div
                className="flex flex-wrap items-center gap-2 mt-5"
                aria-live="polite"
              >
                <AnimatedBadge>
                  <ListChecks size={13} aria-hidden="true" />
                  Showing {history.length} of {total}
                </AnimatedBadge>

                {pages > 1 && (
                  <AnimatedBadge>
                    Page {page} of {pages}
                  </AnimatedBadge>
                )}

                {roleFilter !== "All" && (
                  <AnimatedBadge variant="success">
                    Role: {roleFilter}
                  </AnimatedBadge>
                )}

                {searchTerm.trim() && (
                  <AnimatedBadge variant="warning">
                    Search: {searchTerm}
                  </AnimatedBadge>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="mb-8 border-red-500/30">
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 text-red-300"
              >
                <AlertTriangle size={20} aria-hidden="true" className="mt-1" />
                <div>
                  <h3 className="font-semibold">Something went wrong</h3>
                  <p className="text-sm text-red-200/80 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* LOADING SKELETON */}
        {loading && <SkeletonCard count={4} />}

        {/* EMPTY DATABASE OR NO RESULT STATE */}
        {!loading && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <EmptyState
              icon={filtersActive ? Search : FileText}
              title={filtersActive ? "No Matching Results" : "No Analysis History Yet"}
              description={
                filtersActive
                  ? "Try changing your search keyword or role filter."
                  : "Analyze your resume first. Your saved results will appear here automatically."
              }
              action={
                filtersActive ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Clear history search and role filters"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition"
                  >
                    <X size={16} aria-hidden="true" />
                    Clear Filters
                  </button>
                ) : (
                  <GlowButton
                    to="/upload"
                    variant="solid"
                    aria-label="Analyze a resume"
                  >
                    Analyze Resume
                  </GlowButton>
                )
              }
            />
          </motion.div>
        )}

        {/* HISTORY GRID */}
        {!loading && history.length > 0 && (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {history.map((item) => (
                <motion.div
                  key={item._id}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                >
                  <Card>
                    <div className="flex flex-col gap-5">
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-indigo-300 mb-2">
                            <FileText size={18} aria-hidden="true" />
                            <p className="text-sm truncate">
                              {item.resumeName || "Untitled Resume"}
                            </p>
                          </div>

                          <h3 className="text-xl font-semibold text-gray-100">
                            {item.targetRole}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1">
                            {item.roleTitle || "Target role analysis"}
                          </p>
                        </div>

                        <AnimatedBadge
                          variant={getScoreVariant(item.jobReadiness)}
                        >
                          {item.jobReadiness}% Ready
                        </AnimatedBadge>
                      </div>

                      {/* META */}
                      <div className="flex flex-wrap gap-2">
                        <AnimatedBadge
                          variant={
                            item.roadmapSource === "ai" ? "success" : "warning"
                          }
                        >
                          {item.roadmapSource === "ai"
                            ? `${item.aiProviderUsed || "AI"} Powered`
                            : "Fallback"}
                        </AnimatedBadge>

                        <AnimatedBadge>
                          <Clock size={13} aria-hidden="true" />
                          {formatDate(item.createdAt)}
                        </AnimatedBadge>
                      </div>

                      {/* MINI STATS */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="flex items-center gap-2 text-green-300 mb-1">
                            <BarChart3 size={16} aria-hidden="true" />
                            <p className="text-sm">Readiness</p>
                          </div>
                          <p className="text-2xl font-bold">
                            {item.jobReadiness}%
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="flex items-center gap-2 text-indigo-300 mb-1">
                            <Brain size={16} aria-hidden="true" />
                            <p className="text-sm">AI Provider</p>
                          </div>
                          <p className="text-lg font-semibold capitalize">
                            {item.aiProviderUsed || "Fallback"}
                          </p>
                        </div>
                      </div>

                      {/* STATUS STRIP */}
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                            {item.roadmapSource === "ai" ? (
                              <Sparkles size={18} aria-hidden="true" />
                            ) : (
                              <ShieldCheck size={18} aria-hidden="true" />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-100">
                              {item.roadmapSource === "ai"
                                ? "AI-generated roadmap"
                                : "Fallback roadmap"}
                            </h4>

                            <p className="text-sm text-gray-400 mt-1">
                              {item.roadmapSource === "ai"
                                ? `Generated using ${
                                    item.aiProviderUsed || "AI"
                                  } provider.`
                                : "Generated using the rule-based recommendation engine."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/analysis/${item._id}`}
                          aria-label={`View details for ${
                            item.resumeName || item.targetRole
                          } analysis`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-200 transition flex-1"
                        >
                          <Eye size={16} aria-hidden="true" />
                          View Detail
                        </Link>

                        <button
                          type="button"
                          onClick={() => openAnalysis(item._id)}
                          disabled={openingId === item._id}
                          aria-label={`Open dashboard for ${
                            item.resumeName || item.targetRole
                          } analysis`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-white transition flex-1"
                        >
                          <Eye size={16} aria-hidden="true" />
                          {openingId === item._id
                            ? "Opening..."
                            : "Open Dashboard"}
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDeleteAnalysis(item._id)}
                          disabled={deletingId === item._id}
                          aria-label={`Delete ${
                            item.resumeName || item.targetRole
                          } analysis`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          {deletingId === item._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-label="Load more analysis history results"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2
                        size={16}
                        aria-hidden="true"
                        className="animate-spin"
                      />
                      Loading More...
                    </>
                  ) : (
                    <>
                      <ListChecks size={16} aria-hidden="true" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
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
