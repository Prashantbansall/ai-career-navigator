import { useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../context/AuthContext";
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
  SlidersHorizontal,
  ArrowUpDown,
  CalendarDays,
  Target,
  TrendingUp,
  FolderOpen,
  ChevronRight,
} from "lucide-react";

const roles = [
  "All",
  "SDE",
  "AI/ML",
  "Data Science",
  "DevOps",
  "Frontend",
  "Backend",
];

const readinessRanges = [
  { label: "All scores", value: "all", min: 0, max: 100 },
  { label: "Job ready", value: "ready", min: 71, max: 100 },
  { label: "Almost ready", value: "almost", min: 41, max: 70 },
  { label: "Needs focus", value: "focus", min: 0, max: 40 },
];

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Highest readiness", value: "readiness-high" },
  { label: "Lowest readiness", value: "readiness-low" },
];

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [readinessFilter, setReadinessFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { isAuthenticated } = useAuth();

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
        staggerChildren: 0.08,
      },
    },
  };

  const selectedReadinessRange = useMemo(
    () => readinessRanges.find((range) => range.value === readinessFilter),
    [readinessFilter],
  );

  const fetchHistory = async ({
    pageToLoad = 1,
    append = false,
    search = searchTerm,
    role = roleFilter,
    readiness = readinessFilter,
    sort = sortBy,
  } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const activeRange = readinessRanges.find(
        (range) => range.value === readiness,
      );

      const data = await getAnalysisHistoryAPI({
        search,
        role,
        readinessRange: readiness,
        minReadiness:
          activeRange && activeRange.value !== "all"
            ? activeRange.min
            : undefined,
        maxReadiness:
          activeRange && activeRange.value !== "all"
            ? activeRange.max
            : undefined,
        sort,
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
    if (!isAuthenticated) {
      setLoading(false);
      setHistory([]);
      setTotal(0);
      setPages(1);
      setHasMore(false);
      return;
    }

    fetchHistory({
      pageToLoad: 1,
      append: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    await fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role: roleFilter,
      readiness: readinessFilter,
      sort: sortBy,
    });

    toast.success("History workspace updated");
  };

  const handleRoleChange = (role) => {
    setRoleFilter(role);

    fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role,
      readiness: readinessFilter,
      sort: sortBy,
    });
  };

  const handleReadinessChange = (readiness) => {
    setReadinessFilter(readiness);

    fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role: roleFilter,
      readiness,
      sort: sortBy,
    });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);

    fetchHistory({
      pageToLoad: 1,
      append: false,
      search: searchTerm,
      role: roleFilter,
      readiness: readinessFilter,
      sort,
    });
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    await fetchHistory({
      pageToLoad: page + 1,
      append: true,
      search: searchTerm,
      role: roleFilter,
      readiness: readinessFilter,
      sort: sortBy,
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

      toast.success("Analysis opened in dashboard");
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

      toast.success("Analysis deleted from history");
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

  const getScoreLabel = (score) => {
    if (score <= 40) return "Needs Focus";
    if (score <= 70) return "Almost Ready";
    return "Job Ready";
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setRoleFilter("All");
    setReadinessFilter("all");
    setSortBy("newest");

    await fetchHistory({
      pageToLoad: 1,
      append: false,
      search: "",
      role: "All",
      readiness: "all",
      sort: "newest",
    });

    toast.success("Filters cleared");
  };

  const filtersActive =
    searchTerm.trim() !== "" ||
    roleFilter !== "All" ||
    readinessFilter !== "all" ||
    sortBy !== "newest";

  const averageReadiness = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + Number(item.jobReadiness || 0), 0) /
          history.length,
      )
    : 0;

  const bestReadiness = history.length
    ? Math.max(...history.map((item) => Number(item.jobReadiness || 0)))
    : 0;

  const latestAnalysisDate = history[0]?.createdAt
    ? formatDate(history[0].createdAt)
    : "No saved analysis";

  return (
    <GradientBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-10 pb-20">
        {/* HEADER */}
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8 mb-8 shadow-2xl shadow-indigo-950/20"
        >
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200 mb-5">
                <Database size={16} aria-hidden="true" />
                Saved-analysis workspace
              </p>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Analysis History
              </h2>

              <p className="text-sm md:text-lg text-gray-400 mt-4 leading-relaxed">
                Search saved resumes, compare readiness scores, reopen previous
                dashboards, and clean up old analyses from one premium
                workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:w-72">
              <div className="rounded-2xl border border-white/10 bg-[#0f1224]/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Saved
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{total}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0f1224]/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                  Avg readiness
                </p>
                <p className="mt-1 text-2xl font-bold text-green-300">
                  {averageReadiness}%
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchHistory({
                    pageToLoad: 1,
                    append: false,
                    search: searchTerm,
                    role: roleFilter,
                    readiness: readinessFilter,
                    sort: sortBy,
                  })
                }
                disabled={loading}
                aria-label="Refresh analysis history"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-gray-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCcw
                  size={16}
                  aria-hidden="true"
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </motion.section>

        {/* SEARCH + FILTER */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-300">
                  <SlidersHorizontal size={18} aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-indigo-300">
                    Search, Filter & Sort
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Narrow your saved analyses by resume, role, readiness range,
                  or timeline.
                </p>
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear history filters"
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  <X size={16} aria-hidden="true" />
                  Clear Filters
                </button>
              )}
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4"
              aria-label="Search and filter analysis history"
            >
              <div className="lg:col-span-5">
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
                    placeholder="Search resume, role, provider..."
                    aria-label="Search analysis history"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-gray-200 placeholder:text-gray-500 transition focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="history-role-filter"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <Target size={15} aria-hidden="true" />
                  Target Role
                </label>

                <select
                  id="history-role-filter"
                  name="historyRoleFilter"
                  value={roleFilter}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  aria-label="Filter analysis history by target role"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-200 transition focus:border-indigo-400 focus:outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-[#0f172a]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="history-readiness-filter"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <BarChart3 size={15} aria-hidden="true" />
                  Readiness
                </label>

                <select
                  id="history-readiness-filter"
                  name="historyReadinessFilter"
                  value={readinessFilter}
                  onChange={(e) => handleReadinessChange(e.target.value)}
                  aria-label="Filter analysis history by readiness score range"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-200 transition focus:border-indigo-400 focus:outline-none"
                >
                  {readinessRanges.map((range) => (
                    <option
                      key={range.value}
                      value={range.value}
                      className="bg-[#0f172a]"
                    >
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="history-sort"
                  className="flex items-center gap-2 text-sm text-gray-300 mb-2"
                >
                  <ArrowUpDown size={15} aria-hidden="true" />
                  Sort By
                </label>

                <select
                  id="history-sort"
                  name="historySort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  aria-label="Sort analysis history"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-200 transition focus:border-indigo-400 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0f172a]"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-1 flex lg:items-end">
                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Apply history search and filters"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search size={16} aria-hidden="true" />
                  <span className="lg:hidden">Apply Filters</span>
                </button>
              </div>
            </form>

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

                {readinessFilter !== "all" && selectedReadinessRange && (
                  <AnimatedBadge variant="warning">
                    Score: {selectedReadinessRange.min}-
                    {selectedReadinessRange.max}%
                  </AnimatedBadge>
                )}

                {sortBy !== "newest" && (
                  <AnimatedBadge>
                    Sort:{" "}
                    {sortOptions.find((item) => item.value === sortBy)?.label}
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
        </motion.section>

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

        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <EmptyState
              icon={ShieldCheck}
              title="Sign in to view your analysis history"
              description="Your saved resume analyses are private to your account. Sign in to view your saved roadmaps, readiness scores, and previous results."
              action={
                <GlowButton
                  to="/signin"
                  variant="solid"
                  aria-label="Sign in to view history"
                >
                  Sign In
                </GlowButton>
              }
            />
          </motion.div>
        )}

        {/* LOADING SKELETON */}
        {isAuthenticated && loading && <SkeletonCard count={4} />}

        {/* EMPTY DATABASE OR NO RESULT STATE */}
        {isAuthenticated && !loading && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <EmptyState
              icon={filtersActive ? Search : FolderOpen}
              title={
                filtersActive
                  ? "No Matching Results"
                  : "No Analysis History Yet"
              }
              description={
                filtersActive
                  ? "No saved analysis matches your current search, role, readiness range, or sort view. Try a wider score range or clear filters."
                  : "Your account has no saved analyses yet. Upload a resume and generate a roadmap to build your personal saved-analysis workspace."
              }
              action={
                filtersActive ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Clear history filters"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:bg-white/10"
                  >
                    <X size={16} aria-hidden="true" />
                    Clear Filters
                  </button>
                ) : (
                  <GlowButton
                    to="/upload"
                    variant="solid"
                    aria-label="Upload resume to create first analysis"
                  >
                    Upload Resume
                  </GlowButton>
                )
              }
            />
          </motion.div>
        )}

        {/* HISTORY GRID */}
        {isAuthenticated && !loading && history.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
                    <CalendarDays size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Latest
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-200">
                      {latestAnalysisDate}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/10 text-green-200">
                    <TrendingUp size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Best Score
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-300">
                      {bestReadiness}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-purple-200">
                    <Target size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                      Current View
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {history.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {history.map((item) => {
                const score = Number(item.jobReadiness || 0);

                return (
                  <motion.article
                    key={item._id}
                    variants={fadeUp}
                    transition={{ duration: 0.45 }}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 md:p-6 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-indigo-500/10"
                  >
                    <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-indigo-500/10 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />
                    <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-green-500/10 opacity-0 blur-3xl transition duration-300 group-hover:opacity-100" />

                    <div className="relative flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-indigo-300 mb-3">
                            <FileText size={18} aria-hidden="true" />
                            <p className="text-sm truncate">
                              {item.resumeName || "Untitled Resume"}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <AnimatedBadge>{item.targetRole}</AnimatedBadge>
                            <AnimatedBadge
                              variant={
                                item.roadmapSource === "ai"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {item.roadmapSource === "ai"
                                ? `${item.aiProviderUsed || "AI"} Powered`
                                : "Fallback"}
                            </AnimatedBadge>
                          </div>

                          <h3 className="mt-4 text-xl md:text-2xl font-bold text-gray-100">
                            {item.roleTitle || "Target role analysis"}
                          </h3>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-white/10 bg-[#0b1022]/80 px-5 py-4 text-center">
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
                            Ready
                          </p>
                          <p className="mt-2 text-3xl font-black text-green-300">
                            {score}%
                          </p>
                          <AnimatedBadge
                            variant={getScoreVariant(score)}
                            className="mt-4"
                          >
                            {getScoreLabel(score)}
                          </AnimatedBadge>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-green-400"
                          style={{
                            width: `${Math.min(Math.max(score, 0), 100)}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-indigo-300 mb-1">
                            <Clock size={16} aria-hidden="true" />
                            <p className="text-sm">Created</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-200">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-2 text-indigo-300 mb-1">
                            <Brain size={16} aria-hidden="true" />
                            <p className="text-sm">Engine</p>
                          </div>
                          <p className="text-sm font-semibold capitalize text-gray-200">
                            {item.aiProviderUsed || "Fallback"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
                            {item.roadmapSource === "ai" ? (
                              <Sparkles size={18} aria-hidden="true" />
                            ) : (
                              <ShieldCheck size={18} aria-hidden="true" />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-100">
                              {item.roadmapSource === "ai"
                                ? "AI-generated career roadmap"
                                : "Rule-based career roadmap"}
                            </h4>

                            <p className="text-sm text-gray-400 mt-1">
                              Open this saved analysis to review skill gaps,
                              roadmap weeks, recommendations, and PDF export.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 pt-1">
                        <Link
                          to={`/analysis/${item._id}`}
                          aria-label={`View details for ${
                            item.resumeName || item.targetRole
                          } analysis`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-200 transition hover:border-indigo-400/40 hover:bg-white/10"
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
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {openingId === item._id ? (
                            <Loader2
                              size={16}
                              aria-hidden="true"
                              className="animate-spin"
                            />
                          ) : (
                            <ChevronRight size={16} aria-hidden="true" />
                          )}
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
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item._id ? (
                            <Loader2
                              size={16}
                              aria-hidden="true"
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} aria-hidden="true" />
                          )}
                          <span className="sm:hidden lg:inline">
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  aria-label="Load more analysis history results"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
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
        title="Delete this saved analysis?"
        message="This will permanently remove this resume analysis from your history. Your other saved analyses will not be affected."
        confirmText="Delete Analysis"
        cancelText="Keep Analysis"
        loading={Boolean(deletingId)}
        onConfirm={confirmDeleteAnalysis}
        onCancel={cancelDeleteAnalysis}
      />
    </GradientBackground>
  );
}
