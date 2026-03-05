import { render } from "@testing-library/react"
import { SnackCard } from "./SnackCard";
import { TrendingSnack } from "@/types";

describe("SnackCard", () => {
  it("SnackCard shows correct name", () => {

    const mockOnSelect = jest.fn()

    const snackData: TrendingSnack = {
      "id": 19,
      "name": "Monster Energy",
      "brand": "Monster Beverage Corporation",
      "score": 82,
      "change": 34.4,
      "trending": "up"
    };

    const { getByTestId } = render(<SnackCard snack={snackData} onSelect={mockOnSelect} />)
    const name = getByTestId("name").textContent
    expect(name).toEqual("Monster Energy")
  })
})

