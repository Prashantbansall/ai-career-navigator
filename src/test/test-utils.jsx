import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthContext } from "../context/AuthContext";

export const mockUser = {
  _id: "665f123456789abcdef12345",
  name: "Prashant Bansal",
  email: "prashant@example.com",
};

export function createMockAuthValue({
  user = mockUser,
  token = "test-token",
  isAuthenticated = true,
} = {}) {
  return {
    user,
    token,
    isAuthenticated,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

export function renderWithAuth(
  ui,
  {
    user = mockUser,
    token = "test-token",
    isAuthenticated = true,
    route = "/",
  } = {},
) {
  const authValue = createMockAuthValue({
    user,
    token,
    isAuthenticated,
  });

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
}

export function renderWithoutAuth(ui, { route = "/" } = {}) {
  return renderWithAuth(ui, {
    user: null,
    token: "",
    isAuthenticated: false,
    route,
  });
}

export function renderWithProviders(ui, { route = "/" } = {}) {
  const storedUser = localStorage.getItem("authUser");
  const storedToken = localStorage.getItem("authToken") || "";

  if (storedUser && storedToken) {
    try {
      return renderWithAuth(ui, {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        route,
      });
    } catch {
      return renderWithAuth(ui, { route });
    }
  }

  return renderWithAuth(ui, {
    user: null,
    token: "",
    isAuthenticated: false,
    route,
  });
}

export * from "@testing-library/react";
