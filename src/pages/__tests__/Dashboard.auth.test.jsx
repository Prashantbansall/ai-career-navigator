import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithAuth,
  renderWithoutAuth,
  screen,
  waitFor,
} from "../../test/test-utils";
import Dashboard from "../Dashboard";
import { getAnalysisHistoryAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn(),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
  exportAnalysisPdfAPI: vi.fn(),
  getCommunityStatsAPI: vi.fn().mockResolvedValue({
    totalAnalyses: 0,
    averageReadinessScore: 0,
    mostPopularTargetRole: null,
    mostCommonMissingSkill: null,
    topRoadmapSkill: null,
    popularTargetRoles: [],
    commonMissingSkills: [],
    popularRoadmapSkills: [],
  }),
}));

vi.mock("../../utils/exportPdf", () => ({
  exportRoadmapPDF: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCurrentAnalysis = {
  _id: "analysis-current-1",
  resumeName: "PrashantResume.pdf",
  targetRole: "SDE",
  roleTitle: "Software Development Engineer",
  extractedSkills: ["Java", "React"],
  requiredSkills: ["Java", "React", "Node.js"],
  matchedSkills: ["Java", "React"],
  missingSkills: ["Node.js"],
  roadmap: [],
  jobReadiness: 67,
  readinessReason: "You match 2 out of 3 required skills for SDE.",
  roadmapSource: "ai",
  aiProviderUsed: "gemini",
  aiModelUsed: "gemini-2.5-flash",
  promptVersion: "career-roadmap-v1",
  aiEnabled: true,
  aiSummary: "Good foundation. Improve backend skills.",
  aiRecommendations: ["Learn Node.js", "Build APIs"],
  aiRoadmap: [
    {
      week: "Week 1",
      skill: "Node.js",
      learn: "Node runtime and modules",
      howToLearn: "Build small APIs",
      resource: "freeCodeCamp Node.js Course",
      project: "Notes API",
      difficulty: "Intermediate",
      timeEstimate: "6-8 hours",
    },
  ],
};

describe("Dashboard auth-aware behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    getAnalysisHistoryAPI.mockResolvedValue({
      analyses: [],
      total: 0,
      count: 0,
    });
  });

  it("shows sign-in dashboard message when user is not authenticated", async () => {
    renderWithoutAuth(<Dashboard />, { route: "/dashboard" });

    expect(
      screen.getByText(/Sign in to view your personal dashboard/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your dashboard will show your resume analysis/i),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).not.toHaveBeenCalled();
  });

  it("shows auth-aware empty dashboard state when logged-in user has no current analysis", async () => {
    renderWithAuth(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByText(/No Resume Analysis Found/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Please upload and analyze your resume first/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Upload a resume for analysis/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    });
  });

  it("shows recent analyses empty state when logged-in user has current analysis but no history", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockCurrentAnalysis));

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [],
      total: 0,
      count: 0,
    });

    renderWithAuth(<Dashboard />, { route: "/dashboard" });

    expect(await screen.findByText(/Recent Analyses/i)).toBeInTheDocument();

    expect(
      screen.getByText(/No previous analyses found yet/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your latest resume analyses will appear here/i),
    ).toBeInTheDocument();
  });

  it("renders recent analyses returned from authenticated backend API", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockCurrentAnalysis));

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [
        {
          _id: "analysis-1",
          resumeName: "FrontendResume.pdf",
          targetRole: "Frontend Developer",
          jobReadiness: 82,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
        {
          _id: "analysis-2",
          resumeName: "MLResume.pdf",
          targetRole: "AI/ML Engineer",
          jobReadiness: 74,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-09T10:00:00.000Z",
        },
      ],
      total: 2,
      count: 2,
    });

    renderWithAuth(<Dashboard />, { route: "/dashboard" });

    expect(await screen.findByText(/Recent Analyses/i)).toBeInTheDocument();

    expect(screen.getByText(/FrontendResume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();

    expect(screen.getByText(/MLResume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/AI\/ML Engineer/i)).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
  });
});
