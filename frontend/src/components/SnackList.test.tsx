import { render, screen, fireEvent } from "@testing-library/react";
import { SnackList } from "./SnackList";
import { TrendingSnack } from "@/types";

jest.mock("@/lib/utils", () => ({
  formatPercentage: (val: number) => (val > 0 ? `+${val}%` : `${val}%`),
}));

const mockSnacks: TrendingSnack[] = [
  { id: 101, name: "Doritos", brand: "Frito-Lay", score: 95, change: 5.2, trending: "up" },
  { id: 102, name: "Lays", brand: "Frito-Lay", score: 88, change: -1.5, trending: "down" },
  { id: 103, name: "Pretzels", brand: "Snyders", score: 70, change: 0, trending: "up" },
];

describe("SnackList", () => {
  const mockOnSelect = jest.fn();

  it("renders the correct number of snack items", () => {
    render(<SnackList snacks={mockSnacks} onSelect={mockOnSelect} />);

    const items = screen.getAllByText(/Doritos|Lays|Pretzels/);
    expect(items).toHaveLength(3);
  });


  it("displays the correct rank based on the array index", () => {
    render(<SnackList snacks={mockSnacks} onSelect={mockOnSelect} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });


  it("calls onSelect with the specific snack data when an item is clicked", () => {
    render(<SnackList snacks={mockSnacks} onSelect={mockOnSelect} />);

    const secondSnack = screen.getByText("Lays");
    fireEvent.click(secondSnack);

    expect(mockOnSelect).toHaveBeenCalledWith(mockSnacks[1]);
  });


  it("applies correct styling for positive, negative, and neutral changes", () => {
    render(<SnackList snacks={mockSnacks} onSelect={mockOnSelect} />);

    const positiveText = screen.getByText("+5.2%");
    const negativeText = screen.getByText("-1.5%");
    const neutralText = screen.getByText("0%");

    expect(positiveText).toHaveClass("text-green-600");
    expect(negativeText).toHaveClass("text-red-500");
    expect(neutralText).toHaveClass("text-gray-500");
  });

  // Empty State Handling
  it("renders nothing when the snacks array is empty", () => {
    const { container } = render(<SnackList snacks={[]} onSelect={mockOnSelect} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
