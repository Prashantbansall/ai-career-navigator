import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import { describe, it, expect, vi } from "vitest";
import History from "../History";

vi.mock("../../services/api", () => ({
  getAnalysisHistoryAPI: vi.fn().mockResolvedValue({
    analyses: [],
  }),
  getAnalysisByIdAPI: vi.fn(),
  deleteAnalysisAPI: vi.fn(),
}));

describe("History Page", () => {
  it("renders empty history state", async () => {
    renderWithProviders(<History />, { route: "/history" });

    await waitFor(() => {
      expect(screen.getByText(/No Analysis History Yet/i)).toBeInTheDocument();
    });
  });
});
