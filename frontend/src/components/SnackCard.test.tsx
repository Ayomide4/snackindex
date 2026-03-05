import { render, fireEvent } from "@testing-library/react"
import { SnackCard } from "./SnackCard";
import { TrendingSnack } from "@/types";

const baseSnack: TrendingSnack = {
  id: 1,
  name: "Classic Chips",
  brand: "SnackCo",
  score: 85,
  change: 10.5,
  trending: "up"
};

describe("SnackCard Component", () => {

  it("calls onSelect with the snack data when the card is clicked", () => {
    const mockOnSelect = jest.fn();
    const { getByTestId } = render(<SnackCard snack={baseSnack} onSelect={mockOnSelect} />);

    const card = getByTestId("snack-card");
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(baseSnack);
  });

  it("displays green text and trending up icon for positive change", () => {
    const mockOnSelect = jest.fn()
    const { getByText, getByTestId } = render(<SnackCard snack={baseSnack} onSelect={mockOnSelect} />);

    const percentage = getByText(/10.5%/)
    expect(percentage).toHaveClass("text-green-600")

    const trendingUp = getByTestId("trending-up")
    expect(trendingUp).toBeInTheDocument()

  })

  it("displays red text and trending down icon for negative change", () => {
    const mockOnSelect = jest.fn()
    const { getByText, getByTestId } = render(<SnackCard snack={{ ...baseSnack, change: -5.5 }} onSelect={mockOnSelect} />);

    const percentage = getByText(/5.5%/)
    expect(percentage).toHaveClass("text-red-500")

    const trendingDown = getByTestId("trending-down")
    expect(trendingDown).toBeInTheDocument()

  })

  it("displays gray text and neutral icon for no change", () => {
    const mockOnSelect = jest.fn()
    const { getByText, getByTestId } = render(<SnackCard snack={{ ...baseSnack, change: 0 }} onSelect={mockOnSelect} />);

    const percentage = getByText(/0%/)
    expect(percentage).toHaveClass("text-gray-500")

    const neutral = getByTestId("neutral")
    expect(neutral).toBeInTheDocument()

  })


})
