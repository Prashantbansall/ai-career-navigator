import Navbar from "../components/layout/Navbar";
import ResumeUpload from "../components/resume/ResumeUpload";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import AnimatedBadge from "../components/ui/AnimatedBadge";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Brain,
  Target,
  BarChart3,
  Route,
  ShieldCheck,
  FileText,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  Database,
  Zap,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function Upload() {
  const benefits = [
    {
      title: "Extract Your Skills",
      description: "Automatically detect technical skills from your resume.",
      icon: FileText,
      color: "text-indigo-400",
    },
    {
      title: "Find Skill Gaps",
      description: "Compare your skills with your selected target role.",
      icon: Target,
      color: "text-red-400",
    },
    {
      title: "Job Readiness Score",
      description: "Get a clear percentage score for your selected role.",
      icon: BarChart3,
      color: "text-green-400",
    },
    {
      title: "AI Career Roadmap",
      description: "Receive a week-by-week learning plan with projects.",
      icon: Route,
      color: "text-indigo-400",
    },
  ];

  const processSteps = [
    {
      title: "Upload",
      description: "Add your resume PDF.",
      icon: UploadCloud,
    },
    {
      title: "Analyze",
      description: "AI extracts skills and gaps.",
      icon: Brain,
    },
    {
      title: "Roadmap",
      description: "Get weekly learning plan.",
      icon: Route,
    },
  ];

  const trustItems = [
    {
      label: "PDF Only",
      variant: "success",
      icon: FileText,
    },
    {
      label: "Max 5 MB",
      variant: "default",
      icon: Clock,
    },
    {
      label: "Auto Cleanup",
      variant: "success",
      icon: ShieldCheck,
    },
    {
      label: "MongoDB History",
      variant: "default",
      icon: Database,
    },
  ];

  const previewSkills = ["React", "SQL", "DSA"];
  const previewGaps = ["Node.js", "System Design"];

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

      <main className="max-w-7xl mx-auto px-4 pt-10 md:pt-14 pb-20">
        {/* TOP HEADER */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-10 md:mb-14"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300"
          >
            <Sparkles size={16} />
            Resume to roadmap in seconds
          </motion.p>

          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.65 }}
            className="text-3xl md:text-5xl font-bold"
          >
            Upload Your Resume and Get{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-green-300 bg-clip-text text-transparent">
              AI Career Insights
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.75 }}
            className="text-sm md:text-lg text-gray-400 mt-4 max-w-2xl mx-auto"
          >
            Select your target role, upload your resume, and get AI-powered
            insights including skills, gaps, readiness score, recommendations,
            and a personalized roadmap.
          </motion.p>
        </motion.div>

        {/* PROCESS STRIP */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Icon size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Step {index + 1}</p>
                      <h3 className="font-semibold text-gray-100">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {step.description}
                      </p>
                    </div>

                    {index < processSteps.length - 1 && (
                      <ArrowRight
                        size={18}
                        className="hidden lg:block ml-auto text-gray-600"
                      />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* MAIN TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            {/* BENEFITS */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Brain size={24} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-100">
                    What You’ll Get
                  </h3>

                  <p className="text-sm md:text-base text-gray-400 mt-2">
                    AI Career Navigator scans your resume and compares it with
                    role-specific requirements to generate practical career
                    guidance.
                  </p>
                </div>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <motion.div
                      key={benefit.title}
                      variants={fadeUp}
                      transition={{ duration: 0.45 }}
                      className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-indigo-500/30 transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3 ${benefit.color}`}
                      >
                        <Icon size={20} />
                      </div>

                      <h4 className={`font-semibold ${benefit.color}`}>
                        {benefit.title}
                      </h4>

                      <p className="text-sm text-gray-400 mt-1">
                        {benefit.description}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </Card>

            {/* PRIVACY */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300">
                  <ShieldCheck size={24} />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-400">
                    Privacy Friendly Workflow
                  </h3>

                  <p className="text-sm md:text-base text-gray-400 mt-2">
                    Your resume is processed for analysis, uploaded files are
                    cleaned from the backend after processing, and your analysis
                    result is saved for history.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {trustItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <AnimatedBadge key={item.label} variant={item.variant}>
                          <Icon size={13} />
                          {item.label}
                        </AnimatedBadge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* PREVIEW */}
            <Card>
              <div className="flex items-center gap-2 text-indigo-300 mb-4">
                <Zap size={20} />
                <h3 className="text-lg font-semibold text-indigo-400">
                  Example Output Preview
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-green-300 mb-3">
                    <CheckCircle2 size={18} />
                    <p className="font-semibold">Matched Skills</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {previewSkills.map((skill) => (
                      <AnimatedBadge key={skill} variant="success">
                        {skill}
                      </AnimatedBadge>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center gap-2 text-red-300 mb-3">
                    <Target size={18} />
                    <p className="font-semibold">Skill Gaps</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {previewGaps.map((skill) => (
                      <AnimatedBadge key={skill} variant="danger">
                        {skill}
                      </AnimatedBadge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* RIGHT SIDE: UPLOAD CARD */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Card className="lg:sticky lg:top-24 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-green-500/20 blur-3xl"></div>

              <div className="relative">
                <div className="text-center mb-6">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-4">
                    <UploadCloud size={28} />
                  </div>

                  <h3 className="text-xl font-semibold">Start Your Analysis</h3>

                  <p className="text-sm text-gray-400 mt-2">
                    Choose a target role and upload your resume PDF.
                  </p>
                </div>

                <ResumeUpload />

                <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300 shrink-0">
                      <Lock size={18} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-100">
                        Secure Local Development
                      </h4>

                      <p className="text-sm text-gray-400 mt-1">
                        Your current setup uses local MongoDB for development.
                        For deployment, switch to MongoDB Atlas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* BOTTOM NOTE */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mt-8"
        >
          <Card>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Layers size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    Full-Stack + AI Powered Analysis
                  </h3>

                  <p className="text-sm md:text-base text-gray-400 mt-1">
                    Each analysis can be saved, reopened from history, and used
                    to track your progress toward your target role.
                  </p>
                </div>
              </div>

              <AnimatedBadge variant="success">
                <CheckCircle2 size={13} />
                Real Product Flow
              </AnimatedBadge>
            </div>
          </Card>
        </motion.div>
      </main>
    </GradientBackground>
  );
}
