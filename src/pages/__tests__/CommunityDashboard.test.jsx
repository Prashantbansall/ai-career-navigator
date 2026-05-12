import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  renderWithProviders,
  screen,
  waitFor,
  fireEvent,
} from "../../test/test-utils";
import CommunityDashboard from "../CommunityDashboard";
import { getCommunityStatsAPI } from "../../services/api";

vi.mock("../../services/api", () => ({
  getCommunityStatsAPI: vi.fn(),
}));

const mockCommunityStats = {
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
  popularTargetRoles: [
    {
      role: "SDE",
      roleTitle: "Software Development Engineer",
      count: 5,
    },
  ],
  commonMissingSkills: [
    {
      skill: "System Design",
      count: 4,
    },
  ],
  popularRoadmapSkills: [
    {
      skill: "Node.js",
      count: 3,
    },
  ],
};

describe("Community Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state first", () => {
    getCommunityStatsAPI.mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<CommunityDashboard />, { route: "/community" });

    expect(screen.getByText(/Loading community insights/i)).toBeInTheDocument();
  });

  it("renders community stats from backend API", async () => {
    getCommunityStatsAPI.mockResolvedValueOnce(mockCommunityStats);

    renderWithProviders(<CommunityDashboard />, { route: "/community" });

    expect(
      await screen.findByText(
        /Discover role trends, skill gaps, and roadmap demand/i,
      ),
    ).toBeInTheDocument();

    expect(screen.getByText(/Total Analyses/i)).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    expect(screen.getAllByText(/Average Readiness/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/68%/i).length).toBeGreaterThan(0);

    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/System Design/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Node.js/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Community Trend Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Readiness Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Roadmap Skill Trends/i)).toBeInTheDocument();
  });

  it("renders empty state when there is no community data", async () => {
    getCommunityStatsAPI.mockResolvedValueOnce({
      totalAnalyses: 0,
      averageReadinessScore: 0,
      mostPopularTargetRole: null,
      mostCommonMissingSkill: null,
      topRoadmapSkill: null,
      popularTargetRoles: [],
      commonMissingSkills: [],
      popularRoadmapSkills: [],
    });

    renderWithProviders(<CommunityDashboard />, { route: "/community" });

    expect(
      await screen.findByText(/No community data yet/i),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/No data yet/i).length).toBeGreaterThan(0);
  });

  it("renders error state and retries when backend fails", async () => {
    getCommunityStatsAPI
      .mockRejectedValueOnce(new Error("Backend down"))
      .mockResolvedValueOnce(mockCommunityStats);

    renderWithProviders(<CommunityDashboard />, { route: "/community" });

    expect(
      await screen.findByText(/Community insights unavailable/i),
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /Retry/i });

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(getCommunityStatsAPI).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/68%/i).length).toBeGreaterThan(0);
    });
  });

  it("renders analytics ranking sections with trend guidance", async () => {
    getCommunityStatsAPI.mockResolvedValueOnce(mockCommunityStats);

    renderWithProviders(<CommunityDashboard />, { route: "/community" });

    expect(await screen.findByText(/Popular Roles/i)).toBeInTheDocument();
    expect(screen.getByText(/Common Skill Gaps/i)).toBeInTheDocument();
    expect(screen.getByText(/Roadmap Skill Trends/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Use these insights to improve your own roadmap/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Role trends/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Skill gaps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Roadmap demand/i).length).toBeGreaterThan(0);
  });
});
