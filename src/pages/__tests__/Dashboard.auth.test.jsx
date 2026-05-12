import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  renderWithAuth,
  renderWithoutAuth,
  screen,
  waitFor,
} from "../../test/test-utils";
import Dashboard from "../Dashboard";
import { getAnalysisHistoryAPI, getAnalysisByIdAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn(),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
  exportAnalysisPdfAPI: vi.fn(),
  getCommunityStatsAPI: vi.fn().mockResolvedValue({
    totalAnalyses: 16,
    averageReadinessScore: 63,
    mostPopularTargetRole: {
      role: "SDE",
      roleTitle: "Software Development Engineer",
      count: 8,
    },
    mostCommonMissingSkill: {
      skill: "System Design",
      count: 12,
    },
    topRoadmapSkill: {
      skill: "System Design",
      count: 20,
    },
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
  extractedSkills: ["Java", "React", "MongoDB"],
  requiredSkills: ["Java", "React", "Node.js", "MongoDB"],
  matchedSkills: ["Java", "React", "MongoDB"],
  missingSkills: ["Node.js"],
  roadmap: [],
  jobReadiness: 73,
  readinessReason: "You match 3 out of 4 required skills for SDE.",
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

const mockLatestAnalysisSummary = {
  _id: "analysis-latest-1",
  resumeName: "LatestResume.pdf",
  targetRole: "Full Stack Developer",
  roleTitle: "MERN Stack Developer",
  jobReadiness: 81,
  roadmapSource: "ai",
  aiProviderUsed: "gemini",
  createdAt: "2026-05-10T10:00:00.000Z",
};

const mockOlderAnalysisSummary = {
  _id: "analysis-old-1",
  resumeName: "OldResume.pdf",
  targetRole: "Frontend Developer",
  roleTitle: "React Developer",
  jobReadiness: 74,
  roadmapSource: "ai",
  aiProviderUsed: "gemini",
  createdAt: "2026-05-09T10:00:00.000Z",
};

const mockAuthUser = {
  _id: "665f123456789abcdef12345",
  name: "Prashant Bansal",
  email: "prashant@example.com",
};

const userAnalysisStorageKey = `analysis:${mockAuthUser._id}`;
const userAnalysisClearedKey = `analysisCleared:${mockAuthUser._id}`;

describe("Dashboard personalized auth-aware behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    window.scrollTo = vi.fn();

    getAnalysisHistoryAPI.mockResolvedValue({
      analyses: [],
      total: 0,
      count: 0,
    });

    getAnalysisByIdAPI.mockResolvedValue(mockCurrentAnalysis);
  });

  it("shows sign-in dashboard message when user is not authenticated", () => {
    renderWithoutAuth(<Dashboard />, { route: "/dashboard" });

    expect(
      screen.getByText(/Sign in to view your personal dashboard/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your dashboard will show your resume analysis/i),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).not.toHaveBeenCalled();
    expect(getAnalysisByIdAPI).not.toHaveBeenCalled();
  });

  it("shows personalized empty dashboard state when logged-in user has no saved analysis", async () => {
    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/Start your first analysis/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /your account does not have a selected or saved resume analysis yet/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Start your first analysis/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    });

    expect(getAnalysisByIdAPI).not.toHaveBeenCalled();
  });

  it("loads current user's latest backend analysis when no selected local analysis exists", async () => {
    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [mockLatestAnalysisSummary, mockOlderAnalysisSummary],
      total: 2,
      count: 2,
    });

    getAnalysisByIdAPI.mockResolvedValueOnce({
      ...mockCurrentAnalysis,
      _id: "analysis-latest-1",
      resumeName: "LatestResume.pdf",
      targetRole: "Full Stack Developer",
      roleTitle: "MERN Stack Developer",
      jobReadiness: 81,
    });

    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(
      (await screen.findAllByText(/Full Stack Developer/i)).length,
    ).toBeGreaterThan(0);

    expect(screen.getAllByText(/MERN Stack Developer/i).length).toBeGreaterThan(
      0,
    );

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
      expect(getAnalysisByIdAPI).toHaveBeenCalledWith("analysis-latest-1");
    });

    const storedAnalysis = JSON.parse(localStorage.getItem("analysis"));

    expect(storedAnalysis._id).toBe("analysis-latest-1");
    expect(storedAnalysis.targetRole).toBe("Full Stack Developer");
  });

  it("keeps selected local analysis and still shows current user's recent analyses", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockCurrentAnalysis));

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [mockLatestAnalysisSummary, mockOlderAnalysisSummary],
      total: 2,
      count: 2,
    });

    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);

    expect(await screen.findByText(/Recent Analyses/i)).toBeInTheDocument();
    expect(screen.getByText(/LatestResume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/OldResume.pdf/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Continue from latest analysis/i }),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    expect(getAnalysisByIdAPI).not.toHaveBeenCalled();
  });

  it("uses Continue from latest analysis button to open the latest analysis", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockCurrentAnalysis));

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [mockLatestAnalysisSummary],
      total: 1,
      count: 1,
    });

    getAnalysisByIdAPI.mockResolvedValueOnce({
      ...mockCurrentAnalysis,
      _id: "analysis-latest-1",
      resumeName: "LatestResume.pdf",
      targetRole: "Full Stack Developer",
      roleTitle: "MERN Stack Developer",
      jobReadiness: 81,
    });

    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    const user = userEvent.setup();

    const continueButton = await screen.findByRole("button", {
      name: /Continue from latest analysis/i,
    });

    await user.click(continueButton);

    await waitFor(() => {
      expect(getAnalysisByIdAPI).toHaveBeenCalledWith("analysis-latest-1");
    });

    expect(
      (await screen.findAllByText(/Full Stack Developer/i)).length,
    ).toBeGreaterThan(0);

    const storedAnalysis = JSON.parse(localStorage.getItem("analysis"));

    expect(storedAnalysis._id).toBe("analysis-latest-1");
  });

  it("clears selected dashboard analysis with one click and stores cleared flag", async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      userAnalysisStorageKey,
      JSON.stringify(mockCurrentAnalysis),
    );
    localStorage.setItem("analysis", JSON.stringify(mockCurrentAnalysis));

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [mockLatestAnalysisSummary],
      total: 1,
      count: 1,
    });

    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);

    const clearButton = screen.getByRole("button", {
      name: /Clear current resume analysis/i,
    });

    await user.click(clearButton);

    expect(
      await screen.findByText(/Start your first analysis/i),
    ).toBeInTheDocument();

    expect(localStorage.getItem(userAnalysisClearedKey)).toBe("true");
    expect(localStorage.getItem(userAnalysisStorageKey)).toBeNull();
    expect(localStorage.getItem("analysis")).toBeNull();
  });

  it("does not auto-load latest backend analysis when dashboard selection was cleared", async () => {
    localStorage.setItem(userAnalysisClearedKey, "true");

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [mockLatestAnalysisSummary],
      total: 1,
      count: 1,
    });

    renderWithAuth(<Dashboard />, {
      route: "/dashboard",
      user: mockAuthUser,
    });

    expect(
      await screen.findByText(/Start your first analysis/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /your account does not have a selected or saved resume analysis yet/i,
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/LatestResume.pdf/i)).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /Continue from latest analysis/i,
      }),
    ).not.toBeInTheDocument();

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    expect(getAnalysisByIdAPI).not.toHaveBeenCalled();

    expect(localStorage.getItem("analysis")).toBeNull();
    expect(localStorage.getItem(userAnalysisStorageKey)).toBeNull();
    expect(localStorage.getItem(userAnalysisClearedKey)).toBe("true");
  });
});
