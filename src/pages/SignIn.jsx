import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import { loginUserAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const trustHighlights = [
  "Private saved analyses",
  "Personalized readiness dashboard",
  "Roadmaps tied to your target role",
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Secure workspace",
    description:
      "Sign in to keep your resume analyses and roadmap progress connected to your account.",
    accent: "text-emerald-300",
  },
  {
    icon: BarChart3,
    title: "Progress history",
    description:
      "Return to your latest readiness score, missing skills, and completed roadmap weeks anytime.",
    accent: "text-indigo-300",
  },
  {
    icon: Target,
    title: "Role-focused planning",
    description:
      "Continue preparing for SDE, AI/ML, DevOps, Data Science, and other career paths.",
    accent: "text-cyan-300",
  },
];

const inputBaseClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setFormData({
      email: "",
      password: "",
    });
    setFormMessage({ type: "", text: "" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formMessage.text) {
      setFormMessage({ type: "", text: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      const message = "Please enter your email and password to continue.";
      setFormMessage({ type: "error", text: message });
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setFormMessage({ type: "", text: "" });

      const data = await loginUserAPI(formData);

      login({
        user: data.user,
        token: data.token,
      });

      setFormData({
        email: "",
        password: "",
      });
      setFormMessage({
        type: "success",
        text: "Signed in successfully. Opening your workspace...",
      });

      toast.success("Signed in successfully");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.message ||
        "Unable to sign in. Please check your details and try again.";
      setFormMessage({ type: "error", text: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center lg:text-left"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200">
            <Sparkles size={16} aria-hidden="true" />
            Welcome back to your SaaS career workspace
          </div>

          <h1 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl lg:mx-0">
            Sign in and continue building your role-ready roadmap
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base lg:mx-0">
            Access your saved analyses, latest readiness score, missing skills,
            resume profiles, and week-by-week roadmap progress from one
            personalized dashboard.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            {trustHighlights.map((highlight) => (
              <span
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
              >
                <CheckCircle2
                  size={15}
                  className="text-emerald-300"
                  aria-hidden="true"
                />
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-none">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-lg shadow-black/10 backdrop-blur-md transition duration-200 hover:border-indigo-400/40 hover:shadow-indigo-500/10"
                >
                  <Icon
                    className={`mb-4 transition group-hover:scale-110 ${card.accent}`}
                    size={24}
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-transparent to-emerald-500/20 blur-2xl" />

          <Card className="relative mx-auto max-w-md border-indigo-400/20 bg-slate-950/80 shadow-2xl shadow-indigo-950/30">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/10">
                <LockKeyhole size={28} aria-hidden="true" />
              </div>

              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sign in to open your dashboard and continue from your latest
                saved career analysis.
              </p>
            </div>

            {formMessage.text ? (
              <div
                role="status"
                className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  formMessage.type === "error"
                    ? "border-red-400/20 bg-red-500/10 text-red-200"
                    : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {formMessage.type === "error" ? (
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{formMessage.text}</span>
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="signin-email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="signin-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputBaseClass}
                    aria-invalid={
                      formMessage.type === "error" && !formData.email
                    }
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="signin-password"
                    className="block text-sm font-medium text-slate-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    aria-invalid={
                      formMessage.type === "error" && !formData.password
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="group flex cursor-pointer items-center gap-3 text-slate-400 transition hover:text-slate-200">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-white/20 bg-white/5 text-transparent transition peer-checked:border-indigo-400 peer-checked:bg-indigo-500 peer-checked:text-white group-hover:border-indigo-300">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                  Remember this device
                </label>
              </div>

              <GlowButton
                type="submit"
                variant="solid"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Signing in..." : "Sign in to dashboard"}
                <ArrowRight size={18} aria-hidden="true" />
              </GlowButton>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
              New here? Create an account to save every analysis, resume
              profile, and roadmap checkpoint.{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                Create your account
              </Link>
            </div>
          </Card>
        </motion.section>
      </main>
    </GradientBackground>
  );
}
