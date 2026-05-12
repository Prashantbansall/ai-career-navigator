import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, renderWithProviders } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import AnalysisDetail from "../AnalysisDetail";
import {
  deleteAnalysisAPI,
  exportAnalysisPdfAPI,
  getAnalysisByIdAPI,
} from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
  exportAnalysisPdfAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAuthUser = () => {
  localStorage.setItem("authToken", "test-token");

  localStorage.setItem(
    "authUser",
    JSON.stringify({
      id: "665f123456789abcdef12345",
      name: "Test User",
      email: "test@example.com",
    }),
  );
};

const mockAnalysis = {
  _id: "analysis-1",
  resumeName: "PrashantResume.pdf",
  targetRole: "SDE",
  roleTitle: "Software Development Engineer",
  extractedSkills: ["Java", "React", "SQL"],
  requiredSkills: ["Java", "React", "Node.js", "System Design"],
  matchedSkills: ["Java", "React"],
  missingSkills: ["Node.js", "System Design"],
  jobReadiness: 67,
  readinessReason: "You match 2 out of 4 required skills for SDE.",
  roadmapSource: "ai",
  aiProviderUsed: "gemini",
  aiModelUsed: "gemini-2.5-flash",
  promptVersion: "career-roadmap-v1",
  aiSummary: "Good foundation. Improve backend skills.",
  aiRecommendations: ["Learn Node.js", "Build APIs", "Practice system design"],
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
  createdAt: "2026-05-10T10:00:00.000Z",
};

describe("Analysis Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuthUser();
    getAnalysisByIdAPI.mockResolvedValue(mockAnalysis);
    exportAnalysisPdfAPI.mockResolvedValue(true);
    deleteAnalysisAPI.mockResolvedValue(true);
  });

  it("renders a polished saved analysis report", async () => {
    renderWithProviders(<AnalysisDetail />, { route: "/analysis/analysis-1" });

    expect(
      await screen.findByRole("heading", { name: /Analysis Detail/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/PrashantResume.pdf/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Resume Analysis Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest Readiness Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Skill Match/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Career Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Week-by-Week Roadmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Node runtime and modules/i)).toBeInTheDocument();
  });

  it("exports the analysis PDF from the detail page", async () => {
    const user = userEvent.setup();

    renderWithProviders(<AnalysisDetail />, { route: "/analysis/analysis-1" });

    await screen.findByText(/PrashantResume.pdf/i);

    await user.click(
      screen.getByRole("button", { name: /Export this analysis as PDF/i }),
    );

    await waitFor(() => {
      expect(exportAnalysisPdfAPI).toHaveBeenCalledWith("analysis-1");
    });
  });

  it("renders the error state when analysis loading fails", async () => {
    getAnalysisByIdAPI.mockRejectedValueOnce(new Error("Analysis not found"));

    renderWithProviders(<AnalysisDetail />, { route: "/analysis/missing" });

    expect(
      await screen.findByRole("heading", { name: /Analysis Not Found/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Analysis not found")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to History/i }),
    ).toBeInTheDocument();
  });
});
