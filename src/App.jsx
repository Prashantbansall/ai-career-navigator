import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import GradientBackground from "./components/layout/GradientBackground";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LoadingState from "./components/ui/LoadingState";
import { AuthProvider } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Upload = lazy(() => import("./pages/Upload"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const ResumeProfiles = lazy(() => import("./pages/ResumeProfiles"));
const AnalysisDetail = lazy(() => import("./pages/AnalysisDetail"));
const CommunityDashboard = lazy(() => import("./pages/CommunityDashboard"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const AnalysisMissing = lazy(() => import("./pages/AnalysisMissing"));

function PageLoader() {
  return (
    <GradientBackground>
      <LoadingState
        variant="page"
        title="Loading page..."
        description="Preparing your AI Career Navigator workspace."
      />
    </GradientBackground>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-2xl focus:bg-indigo-500 focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:shadow-2xl focus:shadow-indigo-500/30"
        >
          Skip to main content
        </a>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#0f172a",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#0f172a",
              },
            },
          }}
        />

        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resume-profiles" element={<ResumeProfiles />} />
              <Route path="/community" element={<CommunityDashboard />} />
              <Route path="/analysis" element={<AnalysisMissing />} />
              <Route path="/analysis/:id" element={<AnalysisDetail />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
