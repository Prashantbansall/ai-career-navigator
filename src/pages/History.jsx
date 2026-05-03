import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import AnimatedBadge from "../components/ui/AnimatedBadge";
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
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAnalysisHistoryAPI();

      setHistory(data.analyses || []);
    } catch (err) {
      setError(err.message || "Failed to load analysis history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
    } catch (err) {
      setError(err.message || "Failed to open analysis.");
    } finally {
      setOpeningId("");
    }
  };

  const deleteAnalysis = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this analysis?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteAnalysisAPI(id);

      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete analysis.");
    } finally {
      setDeletingId("");
    }
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

  const roles = ["All", ...new Set(history.map((item) => item.targetRole))];

  const filteredHistory = history.filter((item) => {
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !query ||
      item.resumeName?.toLowerCase().includes(query) ||
      item.targetRole?.toLowerCase().includes(query) ||
      item.roleTitle?.toLowerCase().includes(query) ||
      item.aiProviderUsed?.toLowerCase().includes(query) ||
      item.roadmapSource?.toLowerCase().includes(query);

    const matchesRole = roleFilter === "All" || item.targetRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
  };

  const filtersActive = searchTerm.trim() !== "" || roleFilter !== "All";

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
              <Database size={16} />
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition w-fit disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
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
              <Search size={18} />
              <h3 className="text-lg font-semibold text-indigo-400">
                Search & Filter
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Search */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Search size={15} />
                  Search History
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by resume name, role, AI provider, or source..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="w-full md:w-64">
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Filter size={15} />
                  Filter by Role
                </label>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-400 transition"
                >
                  {roles.map((role) => (
                    <option key={role} value={role} className="bg-[#0f172a]">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {filtersActive && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm transition"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

            {/* Result count */}
            {!loading && history.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <AnimatedBadge>
                  <ListChecks size={13} />
                  Showing {filteredHistory.length} of {history.length}
                </AnimatedBadge>

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
              <div className="flex items-start gap-3 text-red-300">
                <AlertTriangle size={20} className="mt-1" />
                <div>
                  <h3 className="font-semibold">Something went wrong</h3>
                  <p className="text-sm text-red-200/80 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* LOADING */}
        {loading && (
          <Card>
            <div className="text-center py-12">
              <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin"></div>

              <h3 className="text-xl font-semibold text-indigo-400">
                Loading History...
              </h3>

              <p className="text-sm md:text-base text-gray-400 mt-2">
                Fetching saved analyses from MongoDB.
              </p>
            </div>
          </Card>
        )}

        {/* EMPTY DATABASE STATE */}
        {!loading && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card>
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-5">
                  <FileText size={30} />
                </div>

                <h3 className="text-xl font-semibold text-indigo-400">
                  No Analysis History Yet
                </h3>

                <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl mx-auto">
                  Analyze your resume first. Your saved results will appear here
                  automatically.
                </p>

                <div className="mt-6">
                  <GlowButton to="/upload" variant="solid">
                    Analyze Resume
                  </GlowButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* NO MATCHING RESULTS */}
        {!loading && history.length > 0 && filteredHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card>
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-300 mb-5">
                  <Search size={30} />
                </div>

                <h3 className="text-xl font-semibold text-yellow-300">
                  No Matching Results
                </h3>

                <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl mx-auto">
                  Try changing your search keyword or role filter.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* HISTORY GRID */}
        {!loading && filteredHistory.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {filteredHistory.map((item) => (
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
                          <FileText size={18} />
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
                        <Clock size={13} />
                        {formatDate(item.createdAt)}
                      </AnimatedBadge>
                    </div>

                    {/* MINI STATS */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-green-300 mb-1">
                          <BarChart3 size={16} />
                          <p className="text-sm">Readiness</p>
                        </div>
                        <p className="text-2xl font-bold">
                          {item.jobReadiness}%
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-indigo-300 mb-1">
                          <Brain size={16} />
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
                            <Sparkles size={18} />
                          ) : (
                            <ShieldCheck size={18} />
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
                      <button
                        onClick={() => openAnalysis(item._id)}
                        disabled={openingId === item._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-white transition flex-1"
                      >
                        <Eye size={16} />
                        {openingId === item._id
                          ? "Opening..."
                          : "Open Dashboard"}
                      </button>

                      <button
                        onClick={() => deleteAnalysis(item._id)}
                        disabled={deletingId === item._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition"
                      >
                        <Trash2 size={16} />
                        {deletingId === item._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </GradientBackground>
  );
}
