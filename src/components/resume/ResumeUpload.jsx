import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { analyzeResumeAPI } from "../../services/api";
import { TARGET_ROLES } from "../../utils/roles";
import GlowButton from "../ui/GlowButton";
import toast from "react-hot-toast";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("SDE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError("Only PDF files are supported.");
      return;
    }

    const selectedFile = acceptedFiles[0];

    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  const handleAnalyzeResume = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

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
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Target Role */}
      <div className="w-full mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Target Role
        </label>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-indigo-400"
        >
          {TARGET_ROLES.map((role) => (
            <option key={role} className="bg-[#0f172a]" value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Box */}
      <div
        {...getRootProps()}
        className={`w-full p-6 md:p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
        ${
          isDragActive
            ? "border-indigo-400 bg-[#1e293b]"
            : "border-gray-600 hover:border-indigo-400"
        }`}
      >
        <input {...getInputProps()} />

        <p className="text-sm md:text-base text-gray-400">
          {isDragActive
            ? "Drop your resume here..."
            : "Drop your resume PDF here, or click to browse"}
        </p>

        <p className="text-xs text-gray-500 mt-2">Max file size: 5 MB</p>
      </div>

      {/* File Preview */}
      {file && (
        <div className="mt-6 w-full bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center gap-3 shadow-md">
          <div className="text-left">
            <p className="text-sm font-medium break-all">{file.name}</p>
            <p className="text-xs text-gray-400">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>

          <button
            onClick={removeFile}
            className="text-red-400 hover:text-red-500 text-sm self-start md:self-auto"
            disabled={loading}
          >
            Remove
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 w-full bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      {file && (
        <GlowButton
          onClick={handleAnalyzeResume}
          disabled={loading}
          className="mt-6"
          variant="solid"
        >
          {loading ? "Scanning Resume..." : "Analyze Resume"}
        </GlowButton>
      )}
    </div>
  );
}
