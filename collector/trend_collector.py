from pytrends.request import TrendReq


def get_trends():
    pytrends = TrendReq(hl="en-US", tz=360)

    # Should make lists of 5 keywords when pulling from the db
    kw_list = ["Coca-cola", "Takis", "Oreo Cookies"]

    if pytrends:
        try:
            pytrends.build_payload(
                kw_list, cat=71, timeframe="now 1-d", geo="", gprop=""
            )

            data = pytrends.interest_over_time()
            if not data.empty:
                print("\n--- Interest Over Time Data ---")
                print(data)  # Print first few rows of the DataFrame
                # print(data.info())  # Get a summary of the DataFrame
            else:
                print("No data")

        except Exception as e:
            print(f"An error occured while fetching data: {e}")

    else:
        print("Failed to initialize pytrends object.")


if __name__ == "__main__":
    get_trends()
