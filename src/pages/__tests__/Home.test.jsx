import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "../../test/test-utils";
import Home from "../Home";

describe("Home Page", () => {
  it("renders main hero content", () => {
    renderWithProviders(<Home />, { route: "/" });

    expect(
      screen.getByText(/Personalized Career Roadmap/i),
    ).toBeInTheDocument();

    expect(screen.getAllByText(/Analyze Resume/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/View Dashboard/i)).toBeInTheDocument();
  });
});
