import { render, screen } from "@testing-library/react";
import { WizardProgress } from "@/components/wizard/WizardProgress";

const steps = [
  { label: "Frequency", description: "How often?" },
  { label: "Details", description: "Name" },
  { label: "Schedule", description: "When?" },
  { label: "Consequence", description: "Stakes" },
];

describe("WizardProgress", () => {
  it("renders all step labels", () => {
    render(<WizardProgress steps={steps} currentStep={0} />);
    expect(screen.getByText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Consequence")).toBeInTheDocument();
  });

  it("highlights the current step", () => {
    render(<WizardProgress steps={steps} currentStep={1} />);
    const activeLabel = screen.getByText("Details");
    expect(activeLabel).toHaveClass("text-indigo-700");
  });

  it("shows step numbers for pending steps", () => {
    render(<WizardProgress steps={steps} currentStep={0} />);
    // Steps 2, 3, 4 should show numbers (not checkmarks)
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows a checkmark SVG for completed steps", () => {
    const { container } = render(<WizardProgress steps={steps} currentStep={2} />);
    // Steps 0 and 1 are completed, so 2 checkmark SVGs should appear
    const paths = container.querySelectorAll("path[d='M5 13l4 4L19 7']");
    expect(paths).toHaveLength(2);
  });
});
