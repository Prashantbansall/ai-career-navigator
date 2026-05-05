import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Dashboard from "../Dashboard";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn().mockResolvedValue({
    analyses: [],
  }),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
  });

  it("renders dashboard data from localStorage", async () => {
    const mockAnalysis = {
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

    localStorage.setItem("analysis", JSON.stringify(mockAnalysis));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Your Career Dashboard/i)).toBeInTheDocument();

    expect(screen.getByText("SDE")).toBeInTheDocument();

    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);
    
    expect(screen.getAllByText(/Node.js/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText(/Recent Analyses/i)).toBeInTheDocument();
    });
  });

  it("shows clear analysis button when analysis exists", () => {
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
      screen.getByRole("button", { name: /Clear Analysis/i }),
    ).toBeInTheDocument();
  });
});
