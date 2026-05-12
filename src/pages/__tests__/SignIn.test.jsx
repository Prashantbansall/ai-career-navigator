import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen, waitFor } from "../../test/test-utils";
import userEvent from "@testing-library/user-event";
import SignIn from "../SignIn";

vi.mock("../../services/api", () => ({
  loginUserAPI: vi.fn(),
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

describe("Sign In Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders a polished SaaS sign-in experience", () => {
    renderWithProviders(<SignIn />, { route: "/signin" });

    expect(
      screen.getByRole("heading", {
        name: /Sign in and continue building your role-ready roadmap/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Welcome back/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Private saved analyses/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress history/i)).toBeInTheDocument();
    expect(screen.getByText(/Role-focused planning/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Sign in to dashboard/i }),
    ).toBeInTheDocument();
  });

  it("shows beginner-friendly validation when fields are empty", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SignIn />, { route: "/signin" });

    await user.click(
      screen.getByRole("button", { name: /Sign in to dashboard/i }),
    );

    expect(
      await screen.findByText(
        /Please enter your email and password to continue/i,
      ),
    ).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    renderWithProviders(<SignIn />, { route: "/signin" });

    const passwordInput = screen.getByLabelText(/^Password$/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /Show password/i }));

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("signs in and redirects to dashboard", async () => {
    const user = userEvent.setup();
    const { loginUserAPI } = await import("../../services/api");

    loginUserAPI.mockResolvedValueOnce({
      user: {
        _id: "665f123456789abcdef12345",
        name: "Prashant Bansal",
        email: "prashant@example.com",
      },
      token: "test-token",
    });

    renderWithProviders(<SignIn />, { route: "/signin" });

    await user.type(
      screen.getByLabelText(/Email address/i),
      "prashant@example.com",
    );
    await user.type(screen.getByLabelText(/^Password$/i), "password123");
    await user.click(
      screen.getByRole("button", { name: /Sign in to dashboard/i }),
    );

    await waitFor(() => {
      expect(loginUserAPI).toHaveBeenCalledWith({
        email: "prashant@example.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders an inline error message when sign in fails", async () => {
    const user = userEvent.setup();
    const { loginUserAPI } = await import("../../services/api");

    loginUserAPI.mockRejectedValueOnce(new Error("Invalid credentials"));

    renderWithProviders(<SignIn />, { route: "/signin" });

    await user.type(
      screen.getByLabelText(/Email address/i),
      "wrong@example.com",
    );
    await user.type(screen.getByLabelText(/^Password$/i), "wrongpassword");
    await user.click(
      screen.getByRole("button", { name: /Sign in to dashboard/i }),
    );

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});
