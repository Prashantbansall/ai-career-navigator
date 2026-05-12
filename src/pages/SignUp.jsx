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
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import { registerUserAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const onboardingHighlights = [
  "Create role-specific resume profiles",
  "Save every analysis to your account",
  "Track readiness and roadmap progress",
];

const workspaceCards = [
  {
    icon: FileText,
    title: "Resume intelligence",
    description:
      "Upload a resume and turn it into a structured career-readiness report.",
    accent: "text-indigo-300",
  },
  {
    icon: Target,
    title: "Role-first planning",
    description:
      "Prepare for SDE, AI/ML, DevOps, Data Science, and other target roles.",
    accent: "text-emerald-300",
  },
  {
    icon: BarChart3,
    title: "Progress dashboard",
    description:
      "Track readiness score, missing skills, completed weeks, and saved analyses.",
    accent: "text-cyan-300",
  },
];

const inputBaseClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

const getPasswordChecklist = (password) => [
  {
    label: "At least 6 characters",
    complete: password.length >= 6,
  },
  {
    label: "Includes a letter",
    complete: /[a-zA-Z]/.test(password),
  },
  {
    label: "Includes a number",
    complete: /\d/.test(password),
  },
];

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecklist = useMemo(
    () => getPasswordChecklist(formData.password),
    [formData.password],
  );

  const completedPasswordRules = passwordChecklist.filter(
    (item) => item.complete,
  ).length;

  const passwordStrengthLabel =
    completedPasswordRules === 3
      ? "Strong password"
      : completedPasswordRules === 2
        ? "Almost there"
        : "Add more security";

  useEffect(() => {
    setFormData({
      name: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      const message =
        "Please complete your name, email, and password to create your workspace.";
      setFormMessage({ type: "error", text: message });
      toast.error(message);
      return;
    }

    if (formData.password.length < 6) {
      const message = "Password must be at least 6 characters.";
      setFormMessage({ type: "error", text: message });
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setFormMessage({ type: "", text: "" });

      const data = await registerUserAPI({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      login({
        user: data.user,
        token: data.token,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
      });
      setFormMessage({
        type: "success",
        text: "Account created successfully. Opening your dashboard...",
      });

      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.message || "Unable to create account. Please try again.";
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200">
            <Sparkles size={16} aria-hidden="true" />
            Start your personalized SaaS career workspace
          </div>

          <h1 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl lg:mx-0">
            Create your account and save every career roadmap
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base lg:mx-0">
            Build an account-based workspace where your resume analyses,
            readiness scores, target roles, and week-by-week roadmap progress
            stay organized as you prepare for multiple careers.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            {onboardingHighlights.map((highlight) => (
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
            {workspaceCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-lg shadow-black/10 backdrop-blur-md transition duration-200 hover:border-emerald-400/40 hover:shadow-emerald-500/10"
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
          <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-transparent to-indigo-500/20 blur-2xl" />

          <Card className="relative mx-auto max-w-md border-emerald-400/20 bg-slate-950/80 shadow-2xl shadow-emerald-950/30">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10">
                <UserRound size={28} aria-hidden="true" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Create your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Join Ai Career Navigator to save analyses, revisit role-specific
                plans, and continue progress from your dashboard.
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
                  htmlFor="signup-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    placeholder="Prashant Bansal"
                    className={inputBaseClass}
                    aria-invalid={
                      formMessage.type === "error" && !formData.name
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
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
                    id="signup-email"
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
                <label
                  htmlFor="signup-password"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
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

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Password guidance
                    </span>
                    <span className="text-xs font-semibold text-emerald-300">
                      {passwordStrengthLabel}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {passwordChecklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-xs text-slate-400"
                      >
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full border ${
                            item.complete
                              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                              : "border-white/10 bg-white/5 text-slate-500"
                          }`}
                        >
                          <Check size={12} aria-hidden="true" />
                        </span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <GlowButton
                type="submit"
                variant="solid"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating workspace..." : "Create my workspace"}
                <ArrowRight size={18} aria-hidden="true" />
              </GlowButton>
            </form>

            <div className="mt-6 rounded-2xl border border-indigo-400/10 bg-indigo-500/5 p-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-indigo-300"
                  aria-hidden="true"
                />
                <p>
                  Your account keeps future resume reports, readiness scores,
                  and roadmap progress connected to your profile.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                Sign in
              </Link>
            </p>
          </Card>
        </motion.section>
      </main>
    </GradientBackground>
  );
}
