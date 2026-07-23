import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockUseAuth = useAuth as unknown as vi.Mock;

describe("Sidebar", () => {
  it("renders navigation items and guest label when no user", () => {
    mockUseAuth.mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn() });

    render(<Sidebar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it("renders dashboard when user has admin role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", username: "admin", displayName: "Admin", email: "admin@test.com", role: "ADMIN", subscription: "GOLD", followersCount: 0, followingCount: 0 },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
