import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  createMockAuthValue,
  renderWithoutAuth,
  screen,
  within,
} from "../../../test/test-utils";
import { AuthContext } from "../../../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import Navbar from "../Navbar";

const renderNavbarWithAuthValue = (authValue, route = "/") =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[route]}>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("Navbar", () => {
  it("highlights the active desktop route", () => {
    renderNavbarWithAuthValue(createMockAuthValue(), "/dashboard");

    expect(screen.getByRole("link", { name: /Dashboard/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps profile links inside the signed-in user menu", async () => {
    const user = userEvent.setup();

    renderNavbarWithAuthValue(createMockAuthValue(), "/dashboard");

    const desktopNavigation = screen.getByLabelText(/Desktop navigation/i);

    expect(
      within(desktopNavigation).queryByRole("link", { name: /View Profile/i }),
    ).not.toBeInTheDocument();
    expect(
      within(desktopNavigation).queryByRole("link", {
        name: /Resume Profiles/i,
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /Open user menu for Prashant Bansal/i,
      }),
    );

    expect(
      screen.getByRole("menuitem", { name: /View Profile/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Resume Profiles/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Signed in workspace/i)).toBeInTheDocument();
  });

  it("shows polished signed-out actions in the mobile menu", async () => {
    const user = userEvent.setup();

    renderWithoutAuth(<Navbar />);

    await user.click(
      screen.getByRole("button", { name: /Open navigation menu/i }),
    );

    expect(screen.getByText(/Career progress workspace/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Sign In/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /Sign Up/i }).length,
    ).toBeGreaterThan(0);
  });

  it("logs the user out from the account menu", async () => {
    const user = userEvent.setup();
    const authValue = createMockAuthValue({
      logout: vi.fn(),
    });

    authValue.logout = vi.fn();

    renderNavbarWithAuthValue(authValue, "/dashboard");

    await user.click(
      screen.getByRole("button", {
        name: /Open user menu for Prashant Bansal/i,
      }),
    );
    await user.click(screen.getByRole("menuitem", { name: /Logout/i }));

    expect(authValue.logout).toHaveBeenCalledTimes(1);
  });
});
