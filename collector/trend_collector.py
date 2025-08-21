from pytrends.request import TrendReq
import time
import random

test_snack_list = [
    "Takis",
    "Oreo Cookies",
    "Coca-Cola",
    "Pepsi",
    "Hot Cheetos",
    "Sprite",
    "Fanta",
    "Cheez-it",
    "Pringles",
    "Twix",
]


def get_trends(kw_list):
    try:
        pytrends.build_payload(kw_list, cat=71, timeframe="now 1-d", geo="", gprop="")

        data = pytrends.interest_over_time()
        time.sleep(random.uniform(1, 2))  # avoid initial rate limit

        if not data.empty:
            print("\n--- Interest Over Time Data ---")
            print(data)  # Print first few rows of the DataFrame
            # print(data.info())  # Get a summary of the DataFrame
        else:
            print("No data")

    except Exception as e:
        print(f"An error occured while fetching data: {e}")


if __name__ == "__main__":
    pytrends = TrendReq(hl="en-US", tz=360)
    batch_size = 5

    if pytrends:
        for i in range(0, len(test_snack_list), batch_size):
            current_batch_kw = test_snack_list[i : i + batch_size]
            get_trends(current_batch_kw)

    else:
        print("Failed to initialize pytrends object.")
