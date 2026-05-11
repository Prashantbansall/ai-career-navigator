import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loginUserAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Secure Access",
    description: "JWT-based login will be added in the next backend step.",
    accent: "text-green-300",
  },
  {
    icon: LockKeyhole,
    title: "Private History",
    description: "Your analyses will be connected to your account.",
    accent: "text-indigo-300",
  },
  {
    icon: ArrowRight,
    title: "Progress Tracking",
    description: "Personalized roadmap progress will come later.",
    accent: "text-cyan-300",
  },
];

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      email: "",
      password: "",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUserAPI(formData);

      login({
        user: data.user,
        token: data.token,
      });

      setFormData({
        email: "",
        password: "",
      });

      toast.success("Signed in successfully");
      navigate("/");

    } catch (error) {
      toast.error(error.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_0.9fr]">
        {/* Left Content */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-200">
            <Sparkles size={16} aria-hidden="true" />
            Personalized career workspace
          </div>

          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl">
            Sign in to continue your career roadmap
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Access your saved resume analyses, roadmap history, readiness score,
            and personalized dashboard once authentication is connected.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur-md transition duration-200 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-indigo-500/10"
                >
                  <Icon
                    className={`mb-3 transition group-hover:scale-110 ${card.accent}`}
                    size={22}
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {card.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Form Card */}
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <Card className="mx-auto max-w-md hover:border-indigo-400/40 hover:shadow-indigo-500/10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 transition hover:scale-105">
                <LockKeyhole size={26} aria-hidden="true" />
              </div>

              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-400">
                Sign in UI is ready. Backend auth will be connected next.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
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
                    autoComplete="new-email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signin-password"
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
                    id="signin-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="group flex cursor-pointer items-center gap-3 text-slate-400 transition hover:text-slate-200">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-white/20 bg-white/5 text-transparent transition peer-checked:border-indigo-400 peer-checked:bg-indigo-500 peer-checked:text-white group-hover:border-indigo-300">
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-medium text-indigo-300 transition hover:text-indigo-200"
                >
                  Forgot password?
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <GlowButton type="submit" variant="solid" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </GlowButton>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-300 transition hover:text-indigo-200"
              >
                Create one
              </Link>
            </p>
          </Card>
        </motion.section>
      </main>
    </GradientBackground>
  );
}
