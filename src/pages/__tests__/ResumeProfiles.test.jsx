import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { renderWithAuth, renderWithoutAuth } from "../../test/test-utils";
import ResumeProfiles from "../ResumeProfiles";
import { getAnalysisHistoryAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn(),
  getAnalysisByIdAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAnalyses = [
  {
    _id: "analysis-1",
    resumeName: "Prashant-SDE-Resume.pdf",
    targetRole: "SDE",
    roleTitle: "Software Development Engineer",
    jobReadiness: 82,
    createdAt: "2026-05-11T10:00:00.000Z",
  },
  {
    _id: "analysis-2",
    resumeName: "AI-ML-Resume.pdf",
    targetRole: "AI/ML",
    roleTitle: "AI/ML Engineer",
    jobReadiness: 64,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  {
    _id: "analysis-3",
    resumeName: "Frontend-Resume.pdf",
    targetRole: "Frontend",
    roleTitle: "Frontend Developer",
    jobReadiness: 71,
    createdAt: "2026-05-09T10:00:00.000Z",
  },
];

describe("Resume Profiles Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows sign-in prompt when user is not authenticated", () => {
    renderWithoutAuth(<ResumeProfiles />, { route: "/resume-profiles" });

    expect(
      screen.getByText(/Sign in to manage resume profiles/i),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).not.toHaveBeenCalled();
  });

  it("groups saved analyses into role-based resume profiles", async () => {
    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: mockAnalyses,
      total: 3,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithAuth(<ResumeProfiles />, { route: "/resume-profiles" });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Role-Based Resume Workspace/i,
      }),
    ).toBeInTheDocument();

    expect((await screen.findAllByText(/SDE Resume/i)).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/AI\/ML Resume/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Frontend Resume/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Prashant-SDE-Resume.pdf/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI-ML-Resume.pdf/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Frontend-Resume.pdf/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/82%/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    });
  });

  it("shows empty profile guidance when there are no analyses", async () => {
    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [],
      total: 0,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithAuth(<ResumeProfiles />, { route: "/resume-profiles" });

    expect(
      await screen.findByText(/No resume profiles yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Create First Resume Profile/i),
    ).toBeInTheDocument();
  });

  it("filters resume profiles by role tab and search text", async () => {
    const user = userEvent.setup();

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: mockAnalyses,
      total: 3,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithAuth(<ResumeProfiles />, { route: "/resume-profiles" });

    expect(
      (await screen.findAllByText(/Prashant-SDE-Resume.pdf/i)).length,
    ).toBeGreaterThan(0);

    await user.click(
      screen.getAllByRole("button", { name: /AI\/ML Resume/i })[0],
    );

    expect(screen.getAllByText(/AI-ML-Resume.pdf/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Frontend-Resume.pdf/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /All Profiles/i }));
    await user.type(
      screen.getByLabelText(/Search resume profiles/i),
      "Frontend",
    );

    expect(
      (await screen.findAllByText(/Frontend-Resume.pdf/i)).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/AI-ML-Resume.pdf/i)).not.toBeInTheDocument();
  });
});
