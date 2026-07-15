import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders a real button by default", () => {
    render(<Button>salvar</Button>);
    expect(screen.getByRole("button", { name: "salvar" })).toBeInTheDocument();
  });

  it("applies the solid variant accent styling", () => {
    render(<Button variant="solid">publicar</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-accent");
  });

  it("renders the child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/blog">escritos</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "escritos" });
    expect(link).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
