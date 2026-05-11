import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithAuth,
  renderWithoutAuth,
  screen,
  waitFor,
} from "../../test/test-utils";
import History from "../History";
import { getAnalysisHistoryAPI, deleteAnalysisAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("History auth-aware behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    getAnalysisHistoryAPI.mockResolvedValue({
      analyses: [],
      total: 0,
      count: 0,
    });

    deleteAnalysisAPI.mockResolvedValue({
      message: "Analysis deleted successfully",
    });
  });

  it("shows sign-in message when user is not authenticated", () => {
    renderWithoutAuth(<History />, { route: "/history" });

    expect(
      screen.getByText(/sign in to view your analysis history/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /your saved resume analyses are private to your account/i,
      ),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).not.toHaveBeenCalled();
  });

  it("shows better empty message when logged-in user has no saved analyses", async () => {
    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [],
      total: 0,
      count: 0,
    });

    renderWithAuth(<History />, { route: "/history" });

    expect(
      await screen.findByText(/No Analysis History Yet/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/your account has no saved analyses yet/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /Upload resume to create first analysis/i,
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
    });
  });

  it("renders only analyses returned from authenticated backend API", async () => {
    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [
        {
          _id: "analysis-1",
          resumeName: "PrashantResume.pdf",
          targetRole: "SDE",
          jobReadiness: 78,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
        {
          _id: "analysis-2",
          resumeName: "FrontendResume.pdf",
          targetRole: "Frontend Developer",
          jobReadiness: 84,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-09T10:00:00.000Z",
        },
      ],
      total: 2,
      count: 2,
    });

    renderWithAuth(<History />, { route: "/history" });

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/FrontendResume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();

    expect(screen.getAllByText(/78%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/84%/i).length).toBeGreaterThan(0);

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
  });

  it("does not render stale localStorage history when backend returns empty history", async () => {
    localStorage.setItem(
      "analysisHistory",
      JSON.stringify([
        {
          _id: "old-local-analysis",
          resumeName: "OldLocalResume.pdf",
          targetRole: "Old Local Role",
          jobReadiness: 99,
        },
      ]),
    );

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [],
      total: 0,
      count: 0,
    });

    renderWithAuth(<History />, { route: "/history" });

    expect(
      await screen.findByText(/No Analysis History Yet/i),
    ).toBeInTheDocument();

    expect(screen.queryByText(/OldLocalResume.pdf/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Old Local Role/i)).not.toBeInTheDocument();

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
  });
});
