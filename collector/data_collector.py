import logging
import json
import praw
import praw.models
import os
import time
from dotenv import load_dotenv
from newsapi import NewsApiClient
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import datetime
import finnhub

"""
    TODO:
        - have the logger make an output file for the daily cron to keep track of its daily usage

    info needed for data collection 
        - list of snacks with parent companies and snack aliases
        - 


"""

load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
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

SNACK_CONFIG = {
    "coca-cola": {
        "search_terms": ["Coca-Cola", "Coca Cola", "Coke"],
        "reddit_query": '"Coca-Cola" OR "Coca Cola" OR "Coke"',
        "news_query": '("Coca-Cola" OR "Coke") AND (drink OR beverage OR soda) NOT NASCAR NOT stock',
        "stock_ticker": "KO",
    },
    "sprite": {
        "search_terms": ["Sprite"],
        "reddit_query": '"Sprite"',
        "news_query": '"Sprite" AND (soda OR drink OR beverage) NOT game',
        "stock_ticker": "KO",
    },
    "cheetos": {
        "search_terms": ["Cheetos"],
        "reddit_query": '"Cheetos"',
        "news_query": '"Cheetos" AND (snack OR chips)',
        "stock_ticker": "PEP",
    },
}

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


def get_reddit_data(
    search_query, search_limit, search_terms, subreddits_to_search, time_filter_unix
):
    # Fetches and analyzes mentions from Reddit within a given time window.
    reddit_mentions = []
    logging.info(f"--- Searching Reddit for query: '{search_query}' ---")

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

    logging.info(f"--- Searching NewsAPI for query: '{search_query}' ---")

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
    logging.info("--- Starting Stock Price Lookup ---")
    stock_price = finnhub_client.quote(stock_ticker)["c"]
    logging.debug(f"current stock price: {stock_price}")
    return stock_price


def main():
    logging.info("Starting the Snack Index data collector.")

    for snack_name, config in SNACK_CONFIG.items():
        logging.info(f"-- Processing: {snack_name}")

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

        # display raw data
        logging.debug(f"\n--- Reddit Mentions for {snack_name} ---")
        logging.debug(json.dumps(reddit_data, indent=2))

        logging.debug(f"\n--- News Articles for {snack_name} ---")
        logging.debug(json.dumps(news_data, indent=2))

        # get stock price
        get_stock_price(config["stock_ticker"])

        # TODO: save to db

        # log summary
        logging.info(f"Finished processing for {snack_name}.")
        logging.info(
            f"Reddit Mentions: {reddit_mention_count}, Avg Sentiment: {avg_reddit_sentiment:.4f}"
        )
        logging.info(
            f"News Articles: {news_article_count}, Avg Sentiment: {avg_news_sentiment:.4f}"
        )
        print("-" * 40)


if __name__ == "__main__":
    main()
