import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RuledPage, RuledSection, SectionHeading } from "./ruled";

describe("Ruled layout", () => {
  it("hides the decorative section number from assistive tech", () => {
    const { container } = render(
      <RuledPage>
        <RuledSection>conteúdo</RuledSection>
      </RuledPage>,
    );
    const number = container.querySelector(".ruled-num");
    expect(number).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps section content inside a semantic section element", () => {
    render(
      <RuledSection aria-label="escritos">
        <p>lista</p>
      </RuledSection>,
    );
    expect(screen.getByRole("region", { name: "escritos" })).toBeInTheDocument();
  });

  it("renders SectionHeading as a level 2 heading", () => {
    render(<SectionHeading>trabalhos</SectionHeading>);
    expect(
      screen.getByRole("heading", { level: 2, name: "trabalhos" }),
    ).toBeInTheDocument();
  });
});
