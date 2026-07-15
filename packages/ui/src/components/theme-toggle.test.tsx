import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { describe, expect, it } from "vitest";
import { ThemeToggle } from "./theme-toggle";

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" enableSystem>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe("ThemeToggle", () => {
  it("opens a menu with the three theme options", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "Trocar tema" }));

    expect(screen.getByRole("menuitem", { name: /light/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /dark/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /system/ })).toBeInTheDocument();
  });

  it("applies the dark class to the document root when dark is chosen", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "Trocar tema" }));
    await user.click(screen.getByRole("menuitem", { name: /dark/ }));

    expect(document.documentElement).toHaveClass("dark");
  });
});
