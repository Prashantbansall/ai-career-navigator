import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Home from "../Home";

describe("Home Page", () => {
  it("renders main hero content", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Personalized Career Roadmap/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/Analyze Resume/i)).toBeInTheDocument();
    expect(screen.getByText(/View Dashboard/i)).toBeInTheDocument();
  });
});
