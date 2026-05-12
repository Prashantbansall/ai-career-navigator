import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import SignUp from "../SignUp";

vi.mock("../../services/api", () => ({
  registerUserAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Sign Up Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders a polished SaaS sign-up experience", () => {
    renderWithProviders(<SignUp />, { route: "/signup" });

    expect(
      screen.getByRole("heading", {
        name: /Create your account and save every career roadmap/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Create your workspace/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Create role-specific resume profiles/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Resume intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Role-first planning/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress dashboard/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Create my workspace/i }),
    ).toBeInTheDocument();
  });

  it("shows beginner-friendly validation when fields are empty", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SignUp />, { route: "/signup" });

    await user.click(
      screen.getByRole("button", { name: /Create my workspace/i }),
    );

    expect(
      await screen.findByText(
        /Please complete your name, email, and password/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows password guidance and toggles password visibility", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SignUp />, { route: "/signup" });

    const passwordInput = screen.getByLabelText(/^Password$/i);

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByText(/Password guidance/i)).toBeInTheDocument();
    expect(screen.getByText(/At least 6 characters/i)).toBeInTheDocument();

    await user.type(passwordInput, "pass12");

    expect(screen.getByText(/Strong password/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Show password/i }));

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("creates an account and redirects to dashboard", async () => {
    const user = userEvent.setup();
    const { registerUserAPI } = await import("../../services/api");

    registerUserAPI.mockResolvedValueOnce({
      user: {
        _id: "665f123456789abcdef12345",
        name: "Prashant Bansal",
        email: "prashant@example.com",
      },
      token: "test-token",
    });

    renderWithProviders(<SignUp />, { route: "/signup" });

    await user.type(screen.getByLabelText(/Full name/i), "Prashant Bansal");
    await user.type(
      screen.getByLabelText(/Email address/i),
      "prashant@example.com",
    );
    await user.type(screen.getByLabelText(/^Password$/i), "password123");
    await user.click(
      screen.getByRole("button", { name: /Create my workspace/i }),
    );

    await waitFor(() => {
      expect(registerUserAPI).toHaveBeenCalledWith({
        name: "Prashant Bansal",
        email: "prashant@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders an inline error message when sign up fails", async () => {
    const user = userEvent.setup();
    const { registerUserAPI } = await import("../../services/api");

    registerUserAPI.mockRejectedValueOnce(new Error("Email already exists"));

    renderWithProviders(<SignUp />, { route: "/signup" });

    await user.type(screen.getByLabelText(/Full name/i), "Prashant Bansal");
    await user.type(
      screen.getByLabelText(/Email address/i),
      "prashant@example.com",
    );
    await user.type(screen.getByLabelText(/^Password$/i), "password123");
    await user.click(
      screen.getByRole("button", { name: /Create my workspace/i }),
    );

    expect(
      await screen.findByText(/Email already exists/i),
    ).toBeInTheDocument();
  });
});
