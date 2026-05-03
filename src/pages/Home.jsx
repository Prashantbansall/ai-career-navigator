import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import GradientBackground from "../components/layout/GradientBackground";
import GlowButton from "../components/ui/GlowButton";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import { motion } from "framer-motion";
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
  Code2,
  Layers,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Resume Analysis",
      description:
        "Extract skills and understand your current technical profile instantly.",
      icon: FileText,
      color: "text-indigo-400",
    },
    {
      title: "Skill Gap Detection",
      description:
        "Compare your current skills with your dream role requirements.",
      icon: Target,
      color: "text-green-400",
    },
    {
      title: "AI Roadmap",
      description:
        "Generate a week-by-week learning roadmap with free resources.",
      icon: Route,
      color: "text-indigo-400",
    },
  ];

  const stats = [
    {
      label: "Resume Parsing",
      icon: FileText,
      color: "text-indigo-300",
    },
    {
      label: "Skill Gap Analysis",
      icon: Target,
      color: "text-green-300",
    },
    {
      label: "AI Roadmap",
      icon: Brain,
      color: "text-purple-300",
    },
    {
      label: "Readiness Score",
      icon: BarChart3,
      color: "text-cyan-300",
    },
  ];

  const steps = [
    {
      title: "Upload Resume",
      description: "Upload your PDF resume securely.",
      icon: Upload,
    },
    {
      title: "Select Target Role",
      description: "Choose SDE, AI/ML, Data Science, DevOps, or more.",
      icon: Target,
    },
    {
      title: "Get AI Roadmap",
      description: "Receive skills, gaps, score, and weekly roadmap.",
      icon: Brain,
    },
  ];

  const roles = [
    "SDE",
    "AI/ML",
    "Data Science",
    "DevOps",
    "Frontend",
    "Backend",
  ];

  const highlights = [
    {
      title: "Full-Stack Project",
      description: "React frontend, Node backend, MongoDB history, and APIs.",
      icon: Code2,
      color: "text-indigo-300",
    },
    {
      title: "AI Integration",
      description: "Gemini-powered roadmap with OpenAI fallback support.",
      icon: Sparkles,
      color: "text-green-300",
    },
    {
      title: "Product-Level UX",
      description: "Dashboard, history, animations, badges, and polish.",
      icon: Layers,
      color: "text-cyan-300",
    },
  ];

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

  return (
    <GradientBackground>
      <Navbar />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 pt-16 md:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT HERO CONTENT */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300"
            >
              <Sparkles size={16} />
              AI-powered resume analysis for students and developers
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.65 }}
              className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto lg:mx-0"
            >
              Turn Your Resume Into a{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-green-300 bg-clip-text text-transparent">
                Personalized Career Roadmap
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.75 }}
              className="mt-6 text-sm md:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0"
            >
              Upload your resume, select your target role, identify your skill
              gaps, and get an AI-generated week-by-week roadmap to become
              job-ready.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.85 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <GlowButton to="/upload" variant="solid">
                Analyze Resume
                <ArrowRight size={18} />
              </GlowButton>

              <GlowButton to="/dashboard" variant="primary">
                View Dashboard
              </GlowButton>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.95 }}
              className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2"
            >
              <AnimatedBadge variant="success">
                <ShieldCheck size={13} />
                PDF Resume
              </AnimatedBadge>

              <AnimatedBadge>
                <Brain size={13} />
                Gemini + OpenAI
              </AnimatedBadge>

              <AnimatedBadge variant="success">
                <Database size={13} />
                MongoDB History
              </AnimatedBadge>
            </motion.div>
          </motion.div>

          {/* RIGHT HERO PREVIEW CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-green-500/20 blur-3xl"></div>

              <div className="relative">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Job Readiness</p>
                    <h3 className="text-3xl font-bold text-green-400">78%</h3>
                  </div>

                  <AnimatedBadge variant="success">
                    <Zap size={13} />
                    AI Powered
                  </AnimatedBadge>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1.1, delay: 0.4 }}
                    className="h-3 rounded-full bg-green-500"
                  ></motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-indigo-300 mb-2">
                      <CheckCircle2 size={18} />
                      <p className="font-semibold">Matched Skills</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatedBadge variant="success">React</AnimatedBadge>
                      <AnimatedBadge variant="success">SQL</AnimatedBadge>
                      <AnimatedBadge variant="success">DSA</AnimatedBadge>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-red-300 mb-2">
                      <Target size={18} />
                      <p className="font-semibold">Skill Gaps</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatedBadge variant="danger">Node.js</AnimatedBadge>
                      <AnimatedBadge variant="danger">
                        System Design
                      </AnimatedBadge>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <Route size={18} />
                    <p className="font-semibold">Roadmap Preview</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Week 1: Node.js",
                      "Week 2: Express.js",
                      "Week 3: System Design",
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.15 }}
                        className="flex items-center gap-3 text-sm text-gray-400"
                      >
                        <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
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

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                variants={fadeUp}
                transition={{ duration: 0.45 }}
              >
                <Card className="text-center">
                  <div
                    className={`mx-auto mb-3 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${item.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <p className="text-sm md:text-base font-semibold text-gray-200">
                    {item.label}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-indigo-300 mb-2">Core Features</p>
          <h2 className="text-2xl md:text-3xl font-bold">
            Everything You Need to Plan Your Career
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2 max-w-2xl mx-auto">
            Built with full-stack engineering, resume parsing, role-based skill
            matching, and AI-powered recommendations.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <div
                    className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${feature.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className={`text-lg font-semibold ${feature.color}`}>
                    {feature.title}
                  </h3>

                  <p className="text-sm md:text-base text-gray-400 mt-2">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-green-300 mb-2">How It Works</p>
          <h2 className="text-2xl md:text-3xl font-bold">
            From Resume to Roadmap in 3 Steps
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Icon size={22} />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Step {index + 1}</p>
                      <h3 className="text-lg font-semibold text-gray-100">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-gray-400 mt-4">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* WHY IT STANDS OUT */}
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-cyan-300 mb-2">Project Strength</p>
          <h2 className="text-2xl md:text-3xl font-bold">
            Built Like a Real Product
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2 max-w-2xl mx-auto">
            This is not just a static resume scanner. It combines full-stack
            development, AI recommendations, database history, and premium UX.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <div
                    className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${item.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className={`text-lg font-semibold ${item.color}`}>
                    {item.title}
                  </h3>

                  <p className="text-sm md:text-base text-gray-400 mt-2">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* TARGET ROLES */}
      <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-indigo-300 mb-2">
                  <Users size={18} />
                  <p className="text-sm">Supported Career Paths</p>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold">
                  Choose Your Target Role
                </h2>

                <p className="text-sm md:text-base text-gray-400 mt-2 max-w-xl">
                  The platform compares your resume against role-specific skill
                  requirements and generates a roadmap tailored to your goal.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:max-w-md">
                {roles.map((role) => (
                  <AnimatedBadge key={role}>{role}</AnimatedBadge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </GradientBackground>
  );
}
