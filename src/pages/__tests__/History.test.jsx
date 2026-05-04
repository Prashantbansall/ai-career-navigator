import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
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
    render(
      <BrowserRouter>
        <History />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No Analysis History Yet/i)).toBeInTheDocument();
    });
  });
});
