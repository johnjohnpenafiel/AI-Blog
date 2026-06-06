import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TaxonomyMeta } from "../taxonomy-meta";

describe("TaxonomyMeta", () => {
  it("joins section · format · story_type", () => {
    render(
      <TaxonomyMeta
        post={{
          section: "Customer Experience",
          format: "Deep Dive",
          story_type: "Vendor Launch",
        }}
      />,
    );
    expect(screen.getByTestId("taxonomy-meta").textContent).toBe(
      "Customer Experience · Deep Dive · Vendor Launch",
    );
  });

  it("skips null parts (e.g. a roundup with no story_type)", () => {
    render(
      <TaxonomyMeta
        post={{ section: null, format: "Roundup", story_type: null }}
      />,
    );
    expect(screen.getByTestId("taxonomy-meta").textContent).toBe("Roundup");
  });

  it("renders nothing when all parts are null", () => {
    render(
      <TaxonomyMeta post={{ section: null, format: null, story_type: null }} />,
    );
    expect(screen.queryByTestId("taxonomy-meta")).toBeNull();
  });
});
