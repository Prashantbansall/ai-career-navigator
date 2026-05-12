import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { analyzeResumeAPI, getRolesAPI } from "../../services/api";
import GlowButton from "../ui/GlowButton";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileCheck2,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";

const DEFAULT_ROLES = [
  { value: "SDE", label: "Software Development Engineer" },
  { value: "AI/ML", label: "AI/ML Engineer" },
  { value: "Data Science", label: "Data Scientist" },
  { value: "DevOps", label: "DevOps Engineer" },
  { value: "Frontend", label: "Frontend Developer" },
  { value: "Backend", label: "Backend Developer" },
];

const ROLE_HINTS = {
  SDE: "DSA, backend, system design",
  "AI/ML": "Python, ML, model building",
  "Data Science": "SQL, analytics, statistics",
  DevOps: "CI/CD, cloud, containers",
  Frontend: "React, UI, performance",
  Backend: "APIs, databases, auth",
};

const formatFileSize = (size) => {
  if (!size) return "0 KB";

  const sizeInKb = size / 1024;

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(2)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(2)} MB`;
};

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("SDE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeAnalyzeStep, setActiveAnalyzeStep] = useState(0);

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesFallback, setRolesFallback] = useState(false);

  const navigate = useNavigate();

  const analyzeSteps = useMemo(
    () => [
      "Reading resume content",
      "Matching skills with target role",
      "Generating roadmap and readiness score",
    ],
    [],
  );

  const selectedRoleLabel =
    roles.find((role) => role.value === targetRole)?.label ||
    DEFAULT_ROLES.find((role) => role.value === targetRole)?.label ||
    targetRole;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesFallback(false);

        const data = await getRolesAPI();

        setRoles(data.length > 0 ? data : DEFAULT_ROLES);
      } catch (error) {
        console.error("Failed to load roles:", error.message);

        setRolesFallback(true);
        setRoles(DEFAULT_ROLES);

        toast.error("Backend roles API unavailable. Using default roles.");
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (!file) {
      setUploadProgress(0);
      return undefined;
    }

    setUploadProgress(18);

    const progressTimers = [
      setTimeout(() => setUploadProgress(45), 120),
      setTimeout(() => setUploadProgress(72), 260),
      setTimeout(() => setUploadProgress(100), 420),
    ];

    return () => {
      progressTimers.forEach((timer) => clearTimeout(timer));
    };
  }, [file]);

  useEffect(() => {
    if (!loading) {
      setActiveAnalyzeStep(0);
      return undefined;
    }

    const interval = setInterval(() => {
      setActiveAnalyzeStep((currentStep) =>
        currentStep >= analyzeSteps.length - 1 ? currentStep : currentStep + 1,
      );
    }, 900);

    return () => clearInterval(interval);
  }, [analyzeSteps.length, loading]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setSuccessMessage("");

    if (rejectedFiles.length > 0) {
      setError("Only PDF resume files up to 5 MB are supported.");
      toast.error("Only PDF resume files up to 5 MB are supported.");
      return;
    }

    const selectedFile = acceptedFiles[0];

    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccessMessage(
        "Resume added successfully. Select your role and start analysis.",
      );
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = () => {
    setFile(null);
    setError("");
    setSuccessMessage("");
  };

  const handleAnalyzeResume = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Please sign in before analyzing your resume.");
      setSuccessMessage("");
      toast.error("Please sign in before analyzing your resume");
      navigate("/signin");
      return;
    }

    if (!file) {
      setError("Please upload your resume PDF first.");
      setSuccessMessage("");
      toast.error("Please upload your resume first.");
      return;
    }

    if (!targetRole) {
      setError("Please select the role you want to prepare for.");
      setSuccessMessage("");
      toast.error("Please select a target role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage(
        "Analyzing your resume. Your dashboard will open automatically.",
      );

      const data = await analyzeResumeAPI(file, targetRole);

      localStorage.setItem("analysis", JSON.stringify(data));

      toast.success("Resume analyzed successfully");

      navigate("/dashboard", {
        state: {
          analysis: data,
        },
      });
    } catch (err) {
      const message =
        err.message || "Resume analysis failed. Please try again.";

      setError(message);
      setSuccessMessage("");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Target Role */}
      <section
        aria-labelledby="target-role-title"
        className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:p-5"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300">
              <Target size={18} />
              <h4
                id="target-role-title"
                className="font-semibold text-gray-100"
              >
                Choose your target role
              </h4>
            </div>

            <p id="target-role-help" className="mt-1 text-xs text-gray-500">
              {rolesLoading
                ? "Loading roles from backend..."
                : "Pick the career path you want this resume to be compared against."}
            </p>
          </div>

          <span className="hidden rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200 sm:inline-flex">
            Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(roles.length > 0 ? roles : DEFAULT_ROLES)
            .slice(0, 4)
            .map((role) => {
              const isSelected = targetRole === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setTargetRole(role.value)}
                  disabled={rolesLoading || loading}
                  className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/10"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-100">
                        {role.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">{role.label}</p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 size={18} className="text-green-300" />
                    )}
                  </div>

                  <p className="mt-3 text-xs text-indigo-200/80">
                    {ROLE_HINTS[role.value] || "Skills, gaps, roadmap"}
                  </p>
                </button>
              );
            })}
        </div>

        <div className="relative">
          <label htmlFor="target-role" className="sr-only">
            Select Target Role
          </label>

          <select
            id="target-role"
            name="targetRole"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            disabled={rolesLoading || loading}
            aria-describedby="target-role-help"
            className="w-full appearance-none rounded-2xl border border-white/10 bg-[#0f172a]/80 px-4 py-3 pr-10 text-sm text-gray-200 outline-none transition focus:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rolesLoading && (
              <option value="SDE" className="bg-[#0f172a]">
                Loading roles...
              </option>
            )}

            {!rolesLoading &&
              (roles.length > 0 ? roles : DEFAULT_ROLES).map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                  className="bg-[#0f172a]"
                >
                  {role.value} - {role.label}
                </option>
              ))}
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>

        {rolesFallback && (
          <div
            role="status"
            className="mt-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-300"
          >
            Could not connect to the backend roles API. Using default roles for
            now.
          </div>
        )}
      </section>

      {/* Upload Box */}
      <section
        aria-labelledby="resume-upload-title"
        className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:p-5"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/10 text-green-300">
              <CloudUpload size={22} />
            </div>

            <div>
              <h4
                id="resume-upload-title"
                className="font-semibold text-gray-100"
              >
                Upload your resume
              </h4>
              <p className="text-xs text-gray-500">PDF only • Max 5 MB</p>
            </div>
          </div>

          {file && (
            <span className="hidden items-center gap-1 rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300 sm:inline-flex">
              <FileCheck2 size={13} />
              Ready
            </span>
          )}
        </div>

        <div
          {...getRootProps({
            role: "button",
            tabIndex: 0,
            "aria-label":
              "Upload resume PDF. Drag and drop a PDF file here or click to browse.",
            "aria-describedby": "resume-upload-help",
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
              }
            },
            onClick: open,
          })}
          className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition md:p-8 ${
            isDragActive
              ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_35px_rgba(99,102,241,0.22)]"
              : file
                ? "border-green-400/50 bg-green-500/10"
                : "border-gray-600 bg-[#0f172a]/40 hover:border-indigo-400 hover:bg-indigo-500/5"
          } ${loading ? "pointer-events-none opacity-70" : "cursor-pointer"}`}
        >
          <input
            {...getInputProps({
              "aria-label": "Choose resume PDF file",
            })}
          />

          <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-green-300 transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-indigo-300">
            {file ? <FileText size={30} /> : <CloudUpload size={30} />}
          </div>

          <p className="text-sm font-medium text-gray-200 md:text-base">
            {isDragActive
              ? "Drop your resume here..."
              : file
                ? "Resume selected successfully"
                : "Drop your resume PDF here, or click to browse"}
          </p>

          <p id="resume-upload-help" className="mt-2 text-xs text-gray-500">
            {file
              ? "You can replace it by clicking this upload area again."
              : "Use a clean, text-based resume PDF for best AI results."}
          </p>
        </div>

        {/* File Preview */}
        {file && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f172a]/50 p-4 shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                  <FileText size={21} />
                </div>

                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-gray-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • Uploaded
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                aria-label={`Remove selected file ${file.name}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                <X size={15} />
                Remove
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex w-full items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm text-red-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Action needed</p>
            <p className="mt-1 text-red-200/90">{error}</p>
          </div>
        </div>
      )}

      {/* Success / Guidance */}
      {successMessage && !error && (
        <div
          role="status"
          aria-live="polite"
          className="flex w-full items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-left text-sm text-green-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Good to go</p>
            <p className="mt-1 text-green-200/90">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl border border-indigo-400/20 bg-indigo-500/10 p-4">
          <div className="flex items-center gap-3 text-indigo-200">
            <Loader2 size={20} className="animate-spin" />
            <p className="font-semibold">Analyzing your resume...</p>
          </div>

          <div className="mt-4 space-y-3">
            {analyzeSteps.map((step, index) => {
              const isDone = index < activeAnalyzeStep;
              const isActive = index === activeAnalyzeStep;

              return (
                <div key={step} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                      isDone
                        ? "border-green-400/30 bg-green-500/20 text-green-300"
                        : isActive
                          ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200"
                          : "border-white/10 bg-white/5 text-gray-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={15} /> : index + 1}
                  </span>

                  <span
                    className={isActive ? "text-gray-100" : "text-gray-400"}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analyze Button + Next Step */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
            <Sparkles size={18} />
          </div>

          <div>
            <h4 className="font-semibold text-gray-100">
              Next step after analysis
            </h4>
            <p className="mt-1 text-sm text-gray-400">
              Your dashboard will show extracted skills, missing skills,
              readiness score, AI recommendations, and a week-by-week roadmap
              for {selectedRoleLabel}.
            </p>
          </div>
        </div>

        <GlowButton
          onClick={handleAnalyzeResume}
          disabled={loading || rolesLoading}
          className="w-full"
          variant="solid"
          aria-label={
            file ? "Analyze selected resume" : "Upload resume to continue"
          }
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Zap size={18} />
              {file ? "Analyze Resume" : "Upload Resume to Continue"}
              <ArrowRight size={18} />
            </>
          )}
        </GlowButton>

        {!file && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
            <RotateCcw size={13} />
            First select a role and upload your resume PDF.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={13} />
            Auth required
          </span>
          <span>•</span>
          <span>Usually takes a few seconds locally</span>
        </div>
      </div>
    </div>
  );
}
