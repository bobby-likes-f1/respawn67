import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameCard } from "@/components/game-card";

const defaults = {
  title: "Hades II",
  image: "https://example.com/hades.jpg",
  rating: 9.2,
  platform: ["PC", "PS5"],
};

describe("GameCard", () => {
  it("renders title, rating, and platform", () => {
    render(<GameCard {...defaults} />);
    expect(screen.getByText("Hades II")).toBeInTheDocument();
    expect(screen.getByText("9.2")).toBeInTheDocument();
    expect(screen.getByText("PC, PS5")).toBeInTheDocument();
  });

  it("renders timeToBeat badge when provided", () => {
    render(<GameCard {...defaults} timeToBeat={22} />);
    expect(screen.getByText("22h")).toBeInTheDocument();
  });

  it("does not render timeToBeat badge when omitted", () => {
    render(<GameCard {...defaults} />);
    expect(screen.queryByText(/h$/)).not.toBeInTheDocument();
  });

  it("renders the image with correct alt", () => {
    render(<GameCard {...defaults} />);
    const img = screen.getByAltText("Hades II");
    expect(img).toHaveAttribute("src", defaults.image);
  });

  it("joins multiple platforms with comma", () => {
    render(<GameCard {...defaults} platform={["PC", "Switch", "PS5"]} />);
    expect(screen.getByText("PC, Switch, PS5")).toBeInTheDocument();
  });
});
