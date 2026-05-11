import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { registerUserAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const benefits = [
  "Save resume analyses to your account",
  "Track career roadmap progress",
  "Prepare personalized dashboards",
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

  useEffect(() => {
    setFormData({
      name: "",
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

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUserAPI(formData);

      login({
        user: data.user,
        token: data.token,
      });

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      toast.success("Account created successfully");
      navigate("/");

    } catch (error) {
      toast.error(error.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:grid-cols-[0.9fr_1fr]">
        {/* Form Card */}
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.55 }}
          className="order-2 lg:order-1"
        >
          <Card className="mx-auto max-w-md hover:border-emerald-400/40 hover:shadow-emerald-500/10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 transition hover:scale-105">
                <UserRound size={26} aria-hidden="true" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Account UI is ready. Backend registration will be connected
                next.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
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
                    autoComplete="new-name"
                    placeholder="Prashant Bansal"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
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
                    autoComplete="new-email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
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
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <GlowButton type="submit" variant="solid" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </GlowButton>
              </div>
            </form>

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

        {/* Right Content */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="order-1 lg:order-2"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200">
            <Sparkles size={16} aria-hidden="true" />
            Build your personalized career profile
          </div>

          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl">
            Save your analyses and track your roadmap progress
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            In the next steps, each uploaded resume and generated roadmap will
            be linked to your account so your dashboard becomes personalized.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <motion.div
                key={benefit}
                whileHover={{ x: 8 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200 transition hover:border-emerald-400/40 hover:bg-white/10"
              >
                <CheckCircle2
                  size={20}
                  aria-hidden="true"
                  className="text-emerald-300"
                />
                <span className="font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-lg transition hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-indigo-500/10"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300">
                <Brain size={24} aria-hidden="true" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Coming next: personalized dashboard
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  After backend authentication, your analysis history will be
                  separated by user, and the dashboard will show only your saved
                  roadmaps.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </GradientBackground>
  );
}
