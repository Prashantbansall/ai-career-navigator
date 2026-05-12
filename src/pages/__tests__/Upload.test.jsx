import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
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
    renderWithProviders(<Upload />, { route: "/upload" });

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
    renderWithProviders(<Upload />, { route: "/upload" });

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

    renderWithProviders(<Upload />, { route: "/upload" });

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

  it("shows selected file preview and next-step guidance after resume upload", async () => {
    const user = userEvent.setup();

    renderWithProviders(<Upload />, { route: "/upload" });

    await waitFor(() => {
      expect(
        screen.getByRole("option", {
          name: /SDE - Software Development Engineer/i,
        }),
      ).toBeInTheDocument();
    });

    const resume = new File(["resume content"], "PrashantResume.pdf", {
      type: "application/pdf",
    });

    await user.upload(screen.getByLabelText(/Choose resume PDF file/i), resume);

    expect(await screen.findByText(/PrashantResume.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Resume added successfully/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Analyze selected resume/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Next step after analysis/i)).toBeInTheDocument();
  });

  it("runs analysis with uploaded file and selected target role", async () => {
    const user = userEvent.setup();
    const { analyzeResumeAPI } = await import("../../services/api");

    localStorage.setItem("authToken", "test-token");
    localStorage.setItem(
      "authUser",
      JSON.stringify({
        id: "665f123456789abcdef12345",
        name: "Test User",
        email: "test@example.com",
      }),
    );

    analyzeResumeAPI.mockResolvedValueOnce({
      targetRole: "AI/ML",
      roleTitle: "AI/ML Engineer",
      jobReadiness: 74,
      extractedSkills: ["Python"],
      missingSkills: ["MLOps"],
      aiRoadmap: [],
    });

    renderWithProviders(<Upload />, { route: "/upload" });

    await waitFor(() => {
      expect(screen.getByLabelText(/Select Target Role/i)).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getByLabelText(/Select Target Role/i),
      "AI/ML",
    );

    const resume = new File(["resume content"], "AIMLResume.pdf", {
      type: "application/pdf",
    });

    await user.upload(screen.getByLabelText(/Choose resume PDF file/i), resume);
    await user.click(
      screen.getByRole("button", { name: /Analyze selected resume/i }),
    );

    await waitFor(() => {
      expect(analyzeResumeAPI).toHaveBeenCalledWith(resume, "AI/ML");
    });

    expect(JSON.parse(localStorage.getItem("analysis"))).toMatchObject({
      targetRole: "AI/ML",
      jobReadiness: 74,
    });
  });
});
