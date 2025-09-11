import datetime
import random
import logging
import os
import time

import finnhub
import pandas as pd
import praw
import praw.models
from db_utils import get_last_known_prices_from_db, save_metrics_to_db
from dotenv import load_dotenv
from newsapi import NewsApiClient
from pytrends.exceptions import ResponseError
from pytrends.request import TrendReq
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

load_dotenv()

logger = logging.getLogger(__name__)
logging.getLogger("praw").setLevel(logging.INFO)


def get_environment_variable(key):
    # Gets an environment variable and strips whitespace.
    value = os.getenv(key)
    if value:
        return value.strip()
    logger.warning(f"Environment variable {key} not found.")
    return None


CLIENT_ID = get_environment_variable("REDDIT_CLIENT_ID")
CLIENT_SECRET = get_environment_variable("REDDIT_CLIENT_SECRET")
USER_AGENT = "SnackIndexCollector/0.1 by Taffe"
NEWS_API_KEY = get_environment_variable("NEWS_API_KEY")
FINNHUB_API_KEY = get_environment_variable("FINNHUB_API_KEY")
SUBREDDITS_TO_SEARCH = "snacks+fastfood+food+soda"
SEARCH_LIMIT = 20

processed_stocks = set()
cached_prices = {}


pytrends = TrendReq(hl="en-US", tz=360)
analyzer = SentimentIntensityAnalyzer()


reddit = None
if CLIENT_ID and CLIENT_SECRET:  # initialize reddit IF api keys exist
    reddit = praw.Reddit(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        user_agent=USER_AGENT,
    )
else:
    logger.error("Reddit credentials not found. Reddit functions will fail.")

newsapi = None
if NEWS_API_KEY:
    newsapi = NewsApiClient(api_key=NEWS_API_KEY)
else:
    logger.error("NewsAPI credentials not found. News api functions will fail.")

finnhub_client = None
if FINNHUB_API_KEY:
    finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)
else:
    logger.error("Finnhub credentials not found. Finnhub functions will fail.")

# time filter
current_time_unix = int(time.time())
twenty_four_hours_ago_unix = current_time_unix - (24 * 60 * 60)
yesterday_iso = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime(
    "%Y-%m-%d"
)


def get_google_trends_data(search_terms):
    if not search_terms:
        logging.warning("Received an empty list for Google Trends search. Skipping.")
        return 0

    max_retries = 3
    retry_delay = 15

    # retry api request
    for attempt in range(max_retries):
        try:
            logging.debug(
                f"Requesting Google Trends data for: {search_terms[:5]} (Attempt {attempt + 1})"
            )

            pytrends.build_payload(
                kw_list=search_terms[:5], cat=71, timeframe="now 1-d"
            )
            data = pytrends.interest_over_time()

            if not data.empty and "isPartial" in data.columns:
                data = data.drop(columns=["isPartial"])
                last_row_mean = data.iloc[-1].mean()
                return int(last_row_mean) if not pd.isna(last_row_mean) else 0

            return 0

        except ResponseError as e:
            if "response with code 429" in str(e):
                logging.warning(
                    f"Rate limit hit. Waiting for {retry_delay} seconds before retrying."
                )
                time.sleep(retry_delay)
                retry_delay *= 2  # Double the delay for the next attempt
            else:
                logging.error(f"An API error occurred for terms '{search_terms}': {e}")
                return 0
        except Exception as e:
            logging.error(
                f"An unexpected error occurred for terms '{search_terms}': {e}"
            )
            return 0

    logging.error(
        f"Failed to fetch Google Trends data for '{search_terms}' after {max_retries} attempts."
    )
    return 0


def get_reddit_data(
    search_query, search_limit, search_terms, subreddits_to_search, time_filter_unix
):
    if not reddit:
        logging.warning(
            "Reddit client not initialized. Skipping Reddit data collection."
        )
        return []

    # Fetches and analyzes mentions from Reddit within a given time window.
    reddit_mentions = []
    logging.info(f"Searching Reddit for query: '{search_query}'")

    try:
        search_results = reddit.subreddit(subreddits_to_search).search(
            search_query, limit=search_limit, sort="new"
        )

        for submission in search_results:
            if submission.created_utc > time_filter_unix:
                post_text = f"{submission.title} {submission.selftext}"
                sentiment_score = analyzer.polarity_scores(post_text)["compound"]

                reddit_mentions.append(
                    {
                        "content": post_text,
                        "sentiment_score": sentiment_score,
                        "source": "Reddit Submission",
                        "source_name": submission.subreddit.display_name,
                        "url": f"https://www.reddit.com{submission.permalink}",
                        "published_at": datetime.datetime.fromtimestamp(
                            submission.created_utc, tz=datetime.timezone.utc
                        ).isoformat(),
                    }
                )

                submission.comments.replace_more(limit=0)  # Load all top-level comments
                for comment in submission.comments.list():
                    # ignores the load more comments button
                    if isinstance(comment, praw.models.MoreComments):
                        continue
                    # Check if any of our search terms are in the comment
                    if any(
                        term.lower() in comment.body.lower() for term in search_terms
                    ):
                        comment_score = analyzer.polarity_scores(comment.body)[
                            "compound"
                        ]
                        reddit_mentions.append(
                            {
                                "content": comment.body,
                                "sentiment_score": comment_score,
                                "source": "Reddit Comment",
                                "source_name": comment.subreddit.display_name,
                                "url": f"https://www.reddit.com{comment.permalink}",
                                "published_at": datetime.datetime.fromtimestamp(
                                    comment.created_utc, tz=datetime.timezone.utc
                                ).isoformat(),
                            }
                        )
    except Exception as e:
        logging.error(f"An error occured while fetching from Reddit {e}")
        return []

    return reddit_mentions


def get_news_data(search_query, time_filter_iso):
    if not newsapi:
        logging.warning(
            "NewsAPI client not initialized. Skipping NewsAPI data collection."
        )
        return []

    processed_urls = set()  # MODIFIED: Using URL to prevent duplicate articles
    news_articles = []
    logging.info(f"Searching NewsAPI for query: '{search_query}'")

    try:
        all_articles = newsapi.get_everything(
            q=search_query,
            from_param=time_filter_iso,
            language="en",
            sort_by="relevancy",
        )

        for article in all_articles["articles"]:
            url = article["url"]
            if url in processed_urls:
                continue

            processed_urls.add(url)

            article_text = f"{article['title']} {article['description']}"
            sentiment_score = analyzer.polarity_scores(article_text)["compound"]

            # MODIFIED: Appending a detailed dictionary for each news article
            news_articles.append(
                {
                    "content": article_text,
                    "sentiment_score": sentiment_score,
                    "source": "NewsAPI",
                    "source_name": article["source"]["name"],
                    "url": url,
                    "published_at": article["publishedAt"],
                }
            )

    except Exception as e:
        logging.error(f"An error occurred while fetching news data: {e}")
        return []

    return news_articles


def get_avg_sentiment(mentions):
    if not mentions:
        return 0.0

    total = 0

    for mention in mentions:
        total += mention["score"]

    avg = total / len(mentions)

    return avg


def get_stock_price(stock_ticker):
    if not finnhub_client:
        logging.warning(
            "Finnhub client not initialized. Skipping Finnhub data collection."
        )
        return None
    logging.info(f"Starting Stock Price Lookup for {stock_ticker}")

    # stops multi fetching of same data
    if stock_ticker in processed_stocks:
        return cached_prices.get(stock_ticker)

    try:
        stock_price_data = finnhub_client.quote(stock_ticker)
        closing_price = stock_price_data.get("c")

        if closing_price is not None and closing_price != 0:
            processed_stocks.add(stock_ticker)
            cached_prices[stock_ticker] = closing_price

            return closing_price
        else:
            logging.warning(f"No valid closing price data found for {stock_ticker}.")
            return None

    except Exception as e:
        logging.error(
            f"An error occurred while fetching stock data for {stock_ticker}: {e}"
        )
        return None


# runs data collection pipeline for each snack in config then updates db
def run_collection_pipeline(snack_config, db_connection):
    logging.info("Starting the Snack Index data collection pipeline.")

    #  fallback map of prices
    logging.info("Fetching last known stock prices for fallback...")
    last_prices_map = get_last_known_prices_from_db(db_connection)
    logging.info(
        f"Successfully created fallback map for {len(last_prices_map)} snacks."
    )

    stock_price_cache = {}

    twenty_four_hours_ago_unix = int(time.time()) - (24 * 60 * 60)
    yesterday_iso = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime(
        "%Y-%m-%d"
    )

    for snack_name, config in snack_config.items():
        logging.info(f"Processing: {snack_name}")

        sleep_time = random.uniform(2, 5)
        logging.info(
            f"Waiting for {sleep_time:.2f} seconds before Google Trends request..."
        )
        time.sleep(sleep_time)

        # start fetch data
        google_trends_score = get_google_trends_data(config["search_terms"])

        reddit_data = get_reddit_data(
            search_query=config["reddit_query"],
            search_limit=SEARCH_LIMIT,
            search_terms=config["search_terms"],
            subreddits_to_search=SUBREDDITS_TO_SEARCH,
            time_filter_unix=twenty_four_hours_ago_unix,
        )
        avg_reddit_sentiment = get_avg_sentiment(reddit_data)
        reddit_mention_count = len(reddit_data)

        news_data = get_news_data(
            search_query=config["news_query"], time_filter_iso=yesterday_iso
        )
        avg_news_sentiment = get_avg_sentiment(news_data)
        news_article_count = len(news_data)

        stock_ticker = config.get("stock_ticker")
        stock_price = None
        if stock_ticker:
            if stock_ticker in stock_price_cache:
                stock_price = stock_price_cache[stock_ticker]
                logging.info(
                    f"Using cached stock price for {stock_ticker}: ${stock_price}"
                )
            else:
                stock_price = get_stock_price(stock_ticker)
                # Still cache the result, even if it's None, to avoid re-fetching
                stock_price_cache[stock_ticker] = stock_price

            if stock_price is None:
                snack_id = config["snack_id"]
                fallback_price = last_prices_map.get(snack_id)

                if fallback_price is not None:
                    stock_price = fallback_price
                    logging.warning(
                        f"API returned null for {stock_ticker}. Using last known price from DB: ${stock_price}"
                    )
                else:
                    logging.error(
                        f"API returned null for {stock_ticker} and NO fallback price was found in DB for snack_id {snack_id}."
                    )
        # create metrics obj
        daily_metrics = {
            "snack_id": config["snack_id"],
            "date": yesterday_iso,
            "google_trends_score": google_trends_score,
            "reddit_mention_count": reddit_mention_count,
            "avg_reddit_sentiment": avg_reddit_sentiment,
            "news_article_count": news_article_count,
            "avg_news_sentiment": avg_news_sentiment,
            "stock_close_price": stock_price,
        }

        save_metrics_to_db(db_connection, daily_metrics)

        # Logs
        logging.info(f"Finished processing for {snack_name}. Log summary:")
        logging.info(f"Google Trends Score: {google_trends_score}")
        logging.info(
            f"Reddit Mentions: {reddit_mention_count}, Avg Sentiment: {avg_reddit_sentiment:.4f}"
        )
        logging.info(
            f"News Articles: {news_article_count}, Avg Sentiment: {avg_news_sentiment:.4f}"
        )
        if stock_price is not None:
            logging.info(f"Stock Price for {stock_ticker}: ${stock_price}")

        print("-" * 40)
