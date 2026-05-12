import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/test-utils";
import History from "../History";
import { getAnalysisHistoryAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn(),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
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

describe("History Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    getAnalysisHistoryAPI.mockResolvedValue({
      analyses: [],
      total: 0,
      count: 0,
      page: 1,
      pages: 1,
      hasMore: false,
    });
  });

  it("shows sign-in prompt when user is not authenticated", async () => {
    renderWithProviders(<History />, { route: "/history" });

    expect(
      await screen.findByText(/Sign in to view your analysis history/i),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).not.toHaveBeenCalled();
  });

  it("renders empty history state for authenticated user with no analyses", async () => {
    mockAuthUser();

    renderWithProviders(<History />, { route: "/history" });

    await waitFor(() => {
      expect(screen.getByText(/No Analysis History Yet/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Your account has no saved analyses yet/i),
    ).toBeInTheDocument();

    expect(getAnalysisHistoryAPI).toHaveBeenCalledTimes(1);
  });

  it("allows authenticated user to view history page data", async () => {
    mockAuthUser();

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [
        {
          _id: "665f123456789abcdef12345",
          resumeName: "PrashantResume.pdf",
          targetRole: "SDE",
          roleTitle: "Software Development Engineer",
          jobReadiness: 67,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      ],
      total: 1,
      count: 1,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithProviders(<History />, { route: "/history" });

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();
    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/67%/i).length).toBeGreaterThan(0);
  });

  it("applies search, target role, readiness, and sort filters", async () => {
    const user = userEvent.setup();

    mockAuthUser();

    getAnalysisHistoryAPI.mockResolvedValue({
      analyses: [
        {
          _id: "analysis-1",
          resumeName: "PrashantResume.pdf",
          targetRole: "SDE",
          roleTitle: "Software Development Engineer",
          jobReadiness: 82,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      ],
      total: 1,
      count: 1,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithProviders(<History />, { route: "/history" });

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Search analysis history/i),
      "Prashant",
    );
    await user.selectOptions(
      screen.getByLabelText(/Filter analysis history by target role/i),
      "SDE",
    );
    await user.selectOptions(
      screen.getByLabelText(
        /Filter analysis history by readiness score range/i,
      ),
      "ready",
    );
    await user.selectOptions(
      screen.getByLabelText(/Sort analysis history/i),
      "readiness-high",
    );
    await user.click(
      screen.getByRole("button", { name: /Apply history search and filters/i }),
    );

    await waitFor(() => {
      expect(getAnalysisHistoryAPI).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "Prashant",
          role: "SDE",
          readinessRange: "ready",
          minReadiness: 71,
          maxReadiness: 100,
          sort: "readiness-high",
        }),
      );
    });

    expect(
      screen.getByRole("button", { name: /Clear history filters/i }),
    ).toBeInTheDocument();
  });

  it("opens delete confirmation before removing a saved analysis", async () => {
    const user = userEvent.setup();

    mockAuthUser();

    getAnalysisHistoryAPI.mockResolvedValueOnce({
      analyses: [
        {
          _id: "analysis-1",
          resumeName: "DeleteMe.pdf",
          targetRole: "DevOps",
          roleTitle: "DevOps Engineer",
          jobReadiness: 35,
          roadmapSource: "ai",
          aiProviderUsed: "gemini",
          createdAt: "2026-05-10T10:00:00.000Z",
        },
      ],
      total: 1,
      count: 1,
      page: 1,
      pages: 1,
      hasMore: false,
    });

    renderWithProviders(<History />, { route: "/history" });

    expect(await screen.findByText(/DeleteMe.pdf/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Delete DeleteMe.pdf/i }),
    );

    expect(screen.getByText(/Delete this saved analysis/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /This will permanently remove this resume analysis from your history/i,
      ),
    ).toBeInTheDocument();
  });
});
