import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
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

    exportAnalysisPdfAPI.mockResolvedValue(true);
    exportRoadmapPDF.mockResolvedValue(true);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders empty dashboard state when no analysis exists", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText(/No Resume Analysis Found/i)).toBeInTheDocument();

    expect(screen.getByText(/Upload Resume/i)).toBeInTheDocument();

    expect(screen.queryByText(/Recent Analyses/i)).not.toBeInTheDocument();

    expect(
      screen.queryByText(/No previous analyses found yet/i),
    ).not.toBeInTheDocument();
  });

  it("renders dashboard data from localStorage", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Your Career Dashboard/i)).toBeInTheDocument();

    expect(screen.getAllByText("SDE").length).toBeGreaterThan(0);

    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText(/Node.js/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(/Recent Analyses/i)).toBeInTheDocument();
    });
  });

  it("shows clear analysis button when analysis exists", async () => {
    localStorage.setItem(
      "analysis",
      JSON.stringify({
        targetRole: "SDE",
        roleTitle: "Software Development Engineer",
        extractedSkills: [],
        requiredSkills: [],
        matchedSkills: [],
        missingSkills: [],
        jobReadiness: 80,
        roadmapSource: "fallback",
      }),
    );

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("button", { name: /Clear current resume analysis/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Recent Analyses/i)).toBeInTheDocument();
    });
  });

  it("shows Export PDF button when analysis exists", async () => {
    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(
      await screen.findByRole("button", { name: /Export roadmap as PDF/i }),
    ).toBeInTheDocument();
  });

  it("uses backend PDF export when analysis has an id", async () => {
    const user = userEvent.setup();

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

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

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    const exportButton = await screen.findByRole("button", {
      name: /Export roadmap as PDF/i,
    });

    await user.click(exportButton);

    await waitFor(() => {
      expect(exportRoadmapPDF).toHaveBeenCalledTimes(1);
      expect(exportRoadmapPDF).toHaveBeenCalledWith(
        "roadmap-export",
        "career-roadmap.pdf",
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

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    const exportButton = await screen.findByRole("button", {
      name: /Export roadmap as PDF/i,
    });

    await user.click(exportButton);

    expect(await screen.findByText(/Generating PDF/i)).toBeInTheDocument();

    resolveExport(true);

    await waitFor(() => {
      expect(exportAnalysisPdfAPI).toHaveBeenCalledTimes(1);
    });
  });
});
