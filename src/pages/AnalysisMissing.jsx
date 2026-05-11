import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileQuestion, History, UploadCloud } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import GradientBackground from "../components/layout/GradientBackground";
import Card from "../components/ui/Card";
import GlowButton from "../components/ui/GlowButton";

export default function AnalysisMissing() {
  return (
    <GradientBackground>
      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
              <FileQuestion size={36} aria-hidden="true" />
            </div>

            <h1 className="text-3xl font-bold text-white md:text-4xl">
              No Analysis Selected
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              This page needs a valid analysis ID to show resume insights. Open
              a saved analysis from your history, or upload a resume to generate
              a new roadmap.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GlowButton to="/history" variant="solid">
                <History size={18} aria-hidden="true" />
                View History
              </GlowButton>

              <Link
                to="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white/10 hover:text-white"
              >
                <UploadCloud size={18} aria-hidden="true" />
                Upload Resume
              </Link>
            </div>
          </Card>
        </motion.div>
      </main>
    </GradientBackground>
  );
}
