import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Upload from "../Upload";

vi.mock("../../services/api", () => ({
  getRolesAPI: vi.fn().mockResolvedValue([
    { value: "SDE", label: "Software Development Engineer" },
    { value: "AI/ML", label: "AI/ML Engineer" },
  ]),
  analyzeResumeAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Upload Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload page heading and upload area", async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /Upload Your Resume and Get AI Career Insights/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Start Your Analysis/i,
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("option", {
          name: /SDE - Software Development Engineer/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Drop your resume PDF here, or click to browse/i),
    ).toBeInTheDocument();
  });

  it("does not show analyze button before file upload", async () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("option", {
          name: /SDE - Software Development Engineer/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Analyze Resume/i }),
    ).not.toBeInTheDocument();
  });

  it("shows fallback roles when backend roles API fails", async () => {
    const { getRolesAPI } = await import("../../services/api");

    getRolesAPI.mockRejectedValueOnce(new Error("Backend down"));

    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Using default roles for now/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("option", {
        name: /SDE - Software Development Engineer/i,
      }),
    ).toBeInTheDocument();
  });
});
