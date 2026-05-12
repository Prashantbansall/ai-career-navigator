import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "../../test/test-utils";
import Home from "../Home";

describe("Home Page", () => {
  it("renders the SaaS landing hero content", () => {
    renderWithProviders(<Home />, { route: "/" });

    expect(screen.getByText(/career roadmap/i)).toBeInTheDocument();

    expect(screen.getByText(/Analyze My Resume/i)).toBeInTheDocument();

    expect(screen.getByText(/View Demo Dashboard/i)).toBeInTheDocument();
  });

  it("renders the main landing page sections", () => {
    renderWithProviders(<Home />, { route: "/" });

    expect(screen.getByText(/Core SaaS Features/i)).toBeInTheDocument();
    expect(screen.getByText(/How it works/i)).toBeInTheDocument();
    expect(screen.getByText(/Role examples/i)).toBeInTheDocument();
    expect(screen.getByText(/Trust & impact/i)).toBeInTheDocument();
  });

  it("shows supported role examples for Phase 7 landing UI", () => {
    renderWithProviders(<Home />, { route: "/" });

    expect(screen.getAllByText(/SDE/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI\/ML/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DevOps/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Data Science/i).length).toBeGreaterThan(0);
  });
});
