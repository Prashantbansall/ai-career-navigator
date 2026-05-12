import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fireEvent,
  renderWithAuth,
  renderWithoutAuth,
  screen,
  waitFor,
} from "../../test/test-utils";
import Profile from "../Profile";
import { getUserProfileSummaryAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getUserProfileSummaryAPI: vi.fn(),
}));

const mockProfileSummary = {
  totalAnalyses: 4,
  averageReadinessScore: 72,
  highestReadinessScore: 88,
  mostRecentTargetRole: "SDE",
  mostRecentRoleTitle: "Software Development Engineer",
  latestAnalysis: {
    _id: "analysis-1",
    resumeName: "PrashantResume.pdf",
    targetRole: "SDE",
    roleTitle: "Software Development Engineer",
    jobReadiness: 88,
    createdAt: "2026-05-10T10:00:00.000Z",
  },
  roleBreakdown: [
    { role: "SDE", count: 3 },
    { role: "AI/ML", count: 1 },
  ],
};

describe("Profile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows sign-in prompt when user is not authenticated", () => {
    renderWithoutAuth(<Profile />, { route: "/profile" });

    expect(
      screen.getByText(/Sign in to view your profile/i),
    ).toBeInTheDocument();

    expect(getUserProfileSummaryAPI).not.toHaveBeenCalled();
  });

  it("renders saved user profile stats for authenticated user", async () => {
    getUserProfileSummaryAPI.mockResolvedValueOnce(mockProfileSummary);

    renderWithAuth(<Profile />, { route: "/profile" });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Profile/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/prashant@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Total analyses/i)).toBeInTheDocument();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/72%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/88%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/PrashantResume.pdf/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getUserProfileSummaryAPI).toHaveBeenCalledTimes(1);
    });
  });

  it("renders retry state when profile summary fails", async () => {
    getUserProfileSummaryAPI
      .mockRejectedValueOnce(new Error("Backend down"))
      .mockResolvedValueOnce(mockProfileSummary);

    renderWithAuth(<Profile />, { route: "/profile" });

    expect(
      await screen.findByText(/Profile summary unavailable/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Retry/i }));

    await waitFor(() => {
      expect(getUserProfileSummaryAPI).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();
  });

  it("renders profile shortcut actions for account-based navigation", async () => {
    getUserProfileSummaryAPI.mockResolvedValueOnce(mockProfileSummary);

    renderWithAuth(<Profile />, { route: "/profile" });

    expect(
      await screen.findByRole("heading", {
        name: /Prashant's Career Profile/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: /Analyze New Resume/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /View Saved Analyses/i }).length,
    ).toBeGreaterThan(0);

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Role focus/i }),
    ).toBeInTheDocument();
  });
});
