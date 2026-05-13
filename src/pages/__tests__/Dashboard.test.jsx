import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Dashboard from "../Dashboard";
import { exportAnalysisPdfAPI } from "../../services/api";
import { exportRoadmapPDF } from "../../utils/exportPdf";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn().mockResolvedValue({
    analyses: [],
  }),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
  exportAnalysisPdfAPI: vi.fn().mockResolvedValue(true),
  getCommunityStatsAPI: vi.fn().mockResolvedValue({
    totalAnalyses: 12,
    averageReadinessScore: 68,
    mostPopularTargetRole: {
      role: "SDE",
      roleTitle: "Software Development Engineer",
      count: 5,
    },
    mostCommonMissingSkill: {
      skill: "System Design",
      count: 4,
    },
    topRoadmapSkill: {
      skill: "Node.js",
      count: 3,
    },
    popularTargetRoles: [],
    commonMissingSkills: [],
    popularRoadmapSkills: [],
  }),
}));

vi.mock("../../utils/exportPdf", () => ({
  exportRoadmapPDF: vi.fn().mockResolvedValue(true),
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
  _id: "665f123456789abcdef12345",
  resumeName: "PrashantResume.pdf",
  targetRole: "SDE",
  roleTitle: "Software Development Engineer",
  extractedSkills: ["Java", "React", "SQL"],
  requiredSkills: ["Java", "React", "Node.js"],
  matchedSkills: ["Java", "React"],
  missingSkills: ["Node.js"],
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

describe("Dashboard Page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    mockAuthUser();

    exportAnalysisPdfAPI.mockResolvedValue(true);
    exportRoadmapPDF.mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders empty dashboard state when no analysis exists", async () => {
    localStorage.removeItem("analysis");

    renderWithProviders(<Dashboard />, { route: "/dashboard" });

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

    expect(screen.queryByText(/Recent Analyses/i)).not.toBeInTheDocument();

    expect(
      screen.queryByText(/No previous analyses found yet/i),
    ).not.toBeInTheDocument();
  });

  it("renders dashboard data from localStorage", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByRole("heading", { name: /Test's Career Dashboard/i }),
    ).toBeInTheDocument();

    expect((await screen.findAllByText("SDE")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);

    expect(
      screen.getByRole("heading", { name: /Dashboard Progress Snapshot/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Roadmap completion/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining skill gaps/i)).toBeInTheDocument();

    expect(screen.getAllByText(/Node.js/i).length).toBeGreaterThan(0);

    expect(await screen.findByText(/Recent Analyses/i)).toBeInTheDocument();
  });

  it("shows clear analysis button when analysis exists", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByRole("button", {
        name: /Clear current resume analysis/i,
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText(/Recent Analyses/i)).toBeInTheDocument();
  });

  it("shows Export PDF button when analysis exists", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByRole("button", { name: /Export roadmap as PDF/i }),
    ).toBeInTheDocument();
  });

  it("uses backend PDF export when analysis has an id", async () => {
    const user = userEvent.setup();

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    const exportButton = await screen.findByRole("button", {
      name: /Export roadmap as PDF/i,
    });

    await user.click(exportButton);

    await waitFor(() => {
      expect(exportAnalysisPdfAPI).toHaveBeenCalledTimes(1);
      expect(exportAnalysisPdfAPI).toHaveBeenCalledWith(mockAnalysis._id);
    });

    expect(exportRoadmapPDF).not.toHaveBeenCalled();
  });

  it("falls back to frontend PDF export when analysis has no id", async () => {
    const user = userEvent.setup();

    const localOnlyAnalysis = {
      ...mockAnalysis,
      _id: undefined,
      analysisId: undefined,
    };

    localStorage.setItem("analysis", JSON.stringify(localOnlyAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    const exportButton = await screen.findByRole("button", {
      name: /Export roadmap as PDF/i,
    });

    await user.click(exportButton);

    await waitFor(() => {
      expect(exportRoadmapPDF).toHaveBeenCalledTimes(1);

      expect(exportRoadmapPDF).toHaveBeenCalledWith(
        "roadmap-export",
        expect.stringMatching(
          /^ai-career-navigator-prashantresume-sde-\d{4}-\d{2}-\d{2}-\d{4}\.pdf$/,
        ),
      );
    });

    expect(exportAnalysisPdfAPI).not.toHaveBeenCalled();
  });

  it("shows Generating PDF while export is running", async () => {
    const user = userEvent.setup();

    let resolveExport;

    exportAnalysisPdfAPI.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExport = resolve;
        }),
    );

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    const exportButton = await screen.findByRole("button", {
      name: /Export roadmap as PDF/i,
    });

    await user.click(exportButton);

    expect(
      await screen.findByRole("button", { name: /Generating PDF/i }),
    ).toBeInTheDocument();

    resolveExport(true);

    await waitFor(() => {
      expect(exportAnalysisPdfAPI).toHaveBeenCalledTimes(1);
    });
  });

  it("renders community insights when analysis exists", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(await screen.findByText(/Community Insights/i)).toBeInTheDocument();

    expect(screen.getByText(/Popular Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Common Gap/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Readiness/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Roadmap Skill/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Analyses/i)).toBeInTheDocument();

    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/System Design/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Node.js/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/68%/i).length).toBeGreaterThan(0);
  });

  it("lets users mark roadmap tasks as complete", async () => {
    const user = userEvent.setup();

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByRole("heading", { name: /Roadmap Progress/i }),
    ).toBeInTheDocument();

    const learnTaskButton = await screen.findByRole("button", {
      name: /Mark complete Learn for Week 1/i,
    });

    await user.click(learnTaskButton);

    expect(
      await screen.findByRole("button", {
        name: /Mark incomplete Learn for Week 1/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/1\/4 tasks done/i)).toBeInTheDocument();
  });

  it("updates dashboard progress widgets when a roadmap week is completed", async () => {
    const user = userEvent.setup();

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));
    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByRole("heading", {
        name: /Dashboard Progress Snapshot/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/0% roadmap complete/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/0\/1/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Mark Week Complete/i }),
    );

    expect(await screen.findByText(/4\/4 tasks done/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/100% roadmap complete/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/1\/1/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Week/i }),
    ).toBeInTheDocument();
  });

  it("shows sign-in prompt when user is not authenticated", async () => {
    localStorage.clear();

    renderWithProviders(<Dashboard />, { route: "/dashboard" });

    expect(
      await screen.findByText(/Sign in to view your personal dashboard/i),
    ).toBeInTheDocument();
  });
});
