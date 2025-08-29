import logging
import psycopg2
from pytrends.request import TrendReq
import pandas as pd
import praw
import praw.models
import os
import time
from dotenv import load_dotenv
from newsapi import NewsApiClient
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import datetime
import finnhub
from db_utils import save_metrics_to_db


"""
    TODO :
        - have the logger make an output file for the daily cron to keep track of its daily usage
"""

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    # level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
logging.getLogger("praw").setLevel(logging.INFO)

CLIENT_ID = os.getenv("REDDIT_CLIENT_ID")
CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET")
USER_AGENT = "SnackIndexCollector/0.1 by Taffe"
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
SUBREDDITS_TO_SEARCH = "snacks+fastfood+food+soda"
SEARCH_LIMIT = 20

processed_stocks = set()
cached_prices = {}


pytrends = TrendReq(hl="en-US", tz=360)
reddit = praw.Reddit(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    user_agent=USER_AGENT,
)
analyzer = SentimentIntensityAnalyzer()
newsapi = NewsApiClient(api_key=NEWS_API_KEY)
finnhub_client = finnhub.Client(api_key=FINNHUB_API_KEY)

# time filter
current_time_unix = int(time.time())
twenty_four_hours_ago_unix = current_time_unix - (24 * 60 * 60)
yesterday_iso = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime(
    "%Y-%m-%d"
)


def get_google_trends_data(search_terms):
    try:
        # Pytrends can only handle up to 5 keywords at a time
        pytrends.build_payload(kw_list=search_terms[:5], cat=71, timeframe="now 1-d")
        data = pytrends.interest_over_time()

        # avoid hitting rate limits
        time.sleep(1)

        if not data.empty and "isPartial" in data.columns:
            data = data.drop(columns=["isPartial"])

            # Get most recent data and calculate the mean
            last_row_mean = data.iloc[-1].mean()
            return int(last_row_mean) if not pd.isna(last_row_mean) else 0

    except Exception as e:
        logging.error(f"An error occurred while fetching Google Trends data: {e}")

    return 0


def get_reddit_data(
    search_query, search_limit, search_terms, subreddits_to_search, time_filter_unix
):
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
                        "text": post_text,
                        "score": sentiment_score,
                        "source": "submission",
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
                                "text": comment.body,
                                "score": comment_score,
                                "source": "comment",
                            }
                        )
    except Exception as e:
        logging.error(f"An error occured while fetching from Reddit {e}")
        return []

    return reddit_mentions


def get_news_data(search_query, time_filter_iso):
    processed_titles = set()  # prevent duplicate news articles
    news_articles = []

    logging.info(f"Searching NewsAPI for query: '{search_query}'")

    # news collection
    try:
        all_articles = newsapi.get_everything(
            q=search_query,
            from_param=time_filter_iso,
            language="en",
            sort_by="relevancy",
        )

        for article in all_articles["articles"]:
            title = article["title"]

            if title in processed_titles:
                continue

            processed_titles.add(title)

            article_text = f"{title} {article['description']}"
            sentiment_score = analyzer.polarity_scores(article_text)["compound"]
            news_articles.append(
                {
                    "text": article_text,
                    "score": sentiment_score,
                    "source_name": article["source"]["name"],
                }
            )
    except Exception as e:
        logging.error(f"An error occured while fetching news data {e}")
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

    stock_price_cache = {}

    twenty_four_hours_ago_unix = int(time.time()) - (24 * 60 * 60)
    yesterday_iso = (datetime.datetime.now() - datetime.timedelta(days=1)).strftime(
        "%Y-%m-%d"
    )

    for snack_name, config in snack_config.items():
        logging.info(f"Processing: {snack_name}")

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
                stock_price_cache[stock_ticker] = stock_price

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
