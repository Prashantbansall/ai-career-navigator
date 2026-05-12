import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import GradientBackground from "../components/layout/GradientBackground";
import GlowButton from "../components/ui/GlowButton";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  Brain,
  Route,
  Target,
  FileText,
  BarChart3,
  Sparkles,
  Users,
  ShieldCheck,
  Database,
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const features = [
  {
    title: "Resume Intelligence",
    description:
      "Extract key technical skills, projects, education, and experience from your resume in seconds.",
    icon: FileText,
    color: "text-indigo-300",
  },
  {
    title: "Role-Based Gap Analysis",
    description:
      "Compare your current profile with SDE, AI/ML, DevOps, or Data Science expectations.",
    icon: Target,
    color: "text-emerald-300",
  },
  {
    title: "Week-by-Week Roadmap",
    description:
      "Get a practical learning plan with topics, free resources, and mini-project suggestions.",
    icon: Route,
    color: "text-cyan-300",
  },
  {
    title: "Job Readiness Score",
    description:
      "Understand how close you are to your target role with a clear readiness percentage.",
    icon: BarChart3,
    color: "text-purple-300",
  },
  {
    title: "Progress History",
    description:
      "Save previous analyses, revisit your roadmap, and track how your profile improves.",
    icon: Database,
    color: "text-sky-300",
  },
  {
    title: "Community Direction",
    description:
      "See learning paths and role trends to make your preparation feel less confusing.",
    icon: Users,
    color: "text-green-300",
  },
];

const steps = [
  {
    title: "Upload Your Resume",
    description:
      "Start with a PDF resume so the platform can understand your current skills and projects.",
    icon: Upload,
  },
  {
    title: "Choose a Target Role",
    description:
      "Select the career path you want: SDE, AI/ML, DevOps, Data Science, or another tech role.",
    icon: Target,
  },
  {
    title: "Get Your Career Plan",
    description:
      "Receive skill gaps, readiness score, weekly roadmap, resources, and project ideas.",
    icon: Brain,
  },
];

const roles = [
  {
    name: "SDE",
    description: "DSA, JavaScript, backend APIs, system design, and production projects.",
    skills: ["DSA", "React", "Node.js", "System Design"],
  },
  {
    name: "AI/ML",
    description: "Python, ML fundamentals, model building, data handling, and AI projects.",
    skills: ["Python", "ML", "NLP", "Projects"],
  },
  {
    name: "DevOps",
    description: "Linux, Docker, CI/CD, cloud basics, deployment, and monitoring workflows.",
    skills: ["Linux", "Docker", "CI/CD", "Cloud"],
  },
  {
    name: "Data Science",
    description: "Statistics, Python, SQL, visualization, analytics, and portfolio case studies.",
    skills: ["SQL", "Pandas", "Stats", "Dashboards"],
  },
];

const impactStats = [
  {
    value: "3-step",
    label: "resume to roadmap flow",
    icon: Layers,
  },
  {
    value: "Role-first",
    label: "skill gap analysis",
    icon: Target,
  },
  {
    value: "Weekly",
    label: "learning plan structure",
    icon: BarChart3,
  },
  {
    value: "Exportable",
    label: "roadmap PDF report",
    icon: FileText,
  },
];

const trustItems = [
  "Built for students and early-career developers",
  "Combines resume parsing, AI guidance, and full-stack dashboards",
  "Turns vague career goals into clear weekly execution steps",
];

export default function Home() {
  return (
    <GradientBackground>
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 md:pt-20 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-lg shadow-indigo-500/10"
            >
              <Sparkles size={16} aria-hidden="true" />
              AI-powered career planning from your resume
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.65 }}
              className="mx-auto max-w-5xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:mx-0 xl:text-7xl"
            >
              Turn your resume into a clear, role-based{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                career roadmap
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.75 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg lg:mx-0"
            >
              Ai Career Navigator analyzes your resume, compares it with your
              target role, finds missing skills, calculates job readiness, and
              gives you a week-by-week learning plan with resources and mini
              projects.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.85 }}
              className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <GlowButton to="/upload" variant="solid">
                Analyze My Resume <ArrowRight size={18} aria-hidden="true" />
              </GlowButton>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 shadow-lg shadow-black/10 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                View Demo Dashboard <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.95 }}
              className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              <AnimatedBadge variant="success">
                <ShieldCheck size={13} aria-hidden="true" />
                PDF Resume
              </AnimatedBadge>
              <AnimatedBadge>
                <Brain size={13} aria-hidden="true" />
                AI Roadmap
              </AnimatedBadge>
              <AnimatedBadge variant="success">
                <BarChart3 size={13} aria-hidden="true" />
                Readiness Score
              </AnimatedBadge>
            </motion.div>
          </motion.div>

          {/* HERO PRODUCT MOCKUP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-emerald-500/20 blur-2xl"></div>

            <Card className="relative overflow-hidden p-0">
              <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Career Snapshot</p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      SDE Readiness Report
                    </h2>
                  </div>
                  <AnimatedBadge variant="success">
                    <Zap size={13} aria-hidden="true" />
                    Live Preview
                  </AnimatedBadge>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-center">
                    <p className="text-sm font-medium text-emerald-200">
                      Job Readiness
                    </p>
                    <p className="mt-2 text-5xl font-black text-emerald-300">
                      78%
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Strong foundation, improve backend depth
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-200">
                        Roadmap Progress
                      </span>
                      <span className="text-cyan-300">Week 3 / 8</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "62%" }}
                        transition={{ duration: 1.1, delay: 0.35 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400"
                      ></motion.div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-slate-400">Matched</p>
                        <p className="mt-1 font-bold text-emerald-300">
                          React, DSA, SQL
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                        <p className="text-slate-400">Improve</p>
                        <p className="mt-1 font-bold text-rose-300">
                          Node, APIs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-4 flex items-center gap-2 text-emerald-300">
                    <Route size={18} aria-hidden="true" />
                    <p className="font-semibold">Next roadmap actions</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Week 1: Strengthen Node.js fundamentals",
                      "Week 2: Build Express REST APIs with MongoDB",
                      "Week 3: Add auth, testing, and deployment polish",
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + index * 0.15 }}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-slate-300"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-200">
                          {index + 1}
                        </span>
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* IMPACT STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {impactStats.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div key={item.label} variants={fadeUp}>
                <Card className="h-full">
                  <Icon className="mb-4 text-indigo-300" size={24} />
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Core SaaS Features
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Everything needed to move from confused to job-ready
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            The page now communicates the product clearly: upload resume, choose
            a target role, discover gaps, and follow a personalized roadmap.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full">
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${feature.color}`}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-10 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              From resume to roadmap in 3 simple steps
            </h2>
          </div>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-400 md:mx-0">
            Designed as a clear SaaS onboarding flow so users instantly know
            what to do next after landing on the home page.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div key={step.title} variants={fadeUp}>
                <Card className="relative h-full overflow-hidden">
                  <p className="absolute right-5 top-4 text-6xl font-black text-white/[0.04]">
                    0{index + 1}
                  </p>
                  <div className="relative">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-200">
                      <Icon size={26} aria-hidden="true" />
                    </div>
                    <p className="text-sm font-semibold text-indigo-300">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ROLE EXAMPLES */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Role examples
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Pick the career path you want to target
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Each role can have different required skills, so the roadmap is
            generated around the user&apos;s selected career goal.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {roles.map((role) => (
            <motion.div key={role.name} variants={fadeUp}>
              <Card className="h-full">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                    <Target size={24} aria-hidden="true" />
                  </div>
                  <AnimatedBadge>{role.name}</AnimatedBadge>
                </div>
                <p className="text-sm leading-7 text-slate-400">
                  {role.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {role.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs font-semibold text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TRUST / IMPACT */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Card className="overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
              <div className="p-6 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  Trust & impact
                </p>
                <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                  A product-style project that clearly solves a real student
                  problem
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">
                  Ai Career Navigator helps users understand where they stand,
                  what they are missing, and what exact learning path they should
                  follow next.
                </p>

                <div className="mt-7 space-y-3">
                  {trustItems.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-300"
                        size={18}
                        aria-hidden="true"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <GlowButton to="/upload" variant="solid">
                    Start Free Analysis <ArrowRight size={18} />
                  </GlowButton>
                  <Link
                    to="/community"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 transition duration-200 hover:-translate-y-1 hover:bg-white/10"
                  >
                    Explore Community <Users size={18} />
                  </Link>
                </div>
              </div>

              <div className="border-t border-white/10 bg-gradient-to-br from-indigo-500/15 via-slate-950/40 to-emerald-500/15 p-6 md:p-10 lg:border-l lg:border-t-0">
                <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <Route size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Output Example</p>
                      <p className="font-bold text-white">8-week SDE plan</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Fix backend fundamentals",
                      "Build production APIs",
                      "Add testing and authentication",
                      "Deploy and export roadmap PDF",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300"></span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </GradientBackground>
  );
}
