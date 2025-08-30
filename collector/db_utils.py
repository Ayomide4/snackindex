import logging
import os
import psycopg2

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

GET_SNACKS_QUERY = """
SELECT s.id as snack_id, s.name as snack_name, c.name as company_name, c.stock_ticker, a.alias_name as alias
FROM snacks s
LEFT JOIN companies c ON s.company_id = c.id
LEFT JOIN snack_aliases a ON s.id = a.snack_id;"""


def connect_db():
    try:
        connection = psycopg2.connect(
            host="aws-0-us-east-2.pooler.supabase.com",
            port="6543",
            user="postgres.eeqtlwcodbhcwatozewk",
            password="k0XpyjZYZOEUJgbw",
            dbname="postgres",
        )
        logger.info("Connection to supabase db sucessful")
        return connection
    except psycopg2.Error as e:
        logger.error(f"Error connecting to supabase db: {e}", exc_info=True)
        return None


def close_db_connection(connection):
    if connection:
        connection.close()
        logging.info("Database connection closed.")


def fetch_data(connection):
    if not connection:
        logging.info("No database connection available.")
        return []

    try:
        cursor = connection.cursor()
        cursor.execute(GET_SNACKS_QUERY)
        rows = cursor.fetchall()
        # column_names = [desc[0] for desc in cursor.description]
        cursor.close()
        return rows

    except psycopg2.Error as e:
        logging.error(f"Error fetching data: {e}")
        return []


def create_snack_config(db_results):
    snack_config = {}

    for row in db_results:
        snack_id, snack_name, company_name, stock_ticker, alias = row

        config_key = snack_name.lower().replace(" ", "-")

        # If this is the first time we're seeing this snack, create its entry
        if config_key not in snack_config:
            snack_config[config_key] = {
                "snack_id": snack_id,
                "search_terms": [snack_name],
                "stock_ticker": stock_ticker,
            }

        if alias:
            snack_config[config_key]["search_terms"].append(alias)

    for key, config in snack_config.items():
        # Build reddit query
        config["reddit_query"] = " OR ".join(
            f'"{term}"' for term in config["search_terms"]
        )

        # build news query
        positive_query = f"({config['reddit_query']})"
        negative_query = "NOT stock NOT shares NOT earnings NOT nasdaq NOT nyse"
        config["news_query"] = f"{positive_query} {negative_query}"

    return snack_config


def save_metrics_to_db(connection, metrics):
    UPSERT_METRICS_QUERY = """
        INSERT INTO daily_metrics (
            snack_id, date, google_trends_score, reddit_mention_count, avg_reddit_sentiment,
            news_article_count, avg_news_sentiment, stock_close_price
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (snack_id, date) DO UPDATE SET
            google_trends_score = EXCLUDED.google_trends_score,
            reddit_mention_count = EXCLUDED.reddit_mention_count,
            avg_reddit_sentiment = EXCLUDED.avg_reddit_sentiment,
            news_article_count = EXCLUDED.news_article_count,
            avg_news_sentiment = EXCLUDED.avg_news_sentiment,
            stock_close_price = EXCLUDED.stock_close_price;
        """
    try:
        cursor = connection.cursor()

        data_to_insert = (
            metrics["snack_id"],
            metrics["date"],
            metrics.get("google_trends_score"),
            metrics.get("reddit_mention_count"),
            metrics.get("avg_reddit_sentiment"),
            metrics.get("news_article_count"),
            metrics.get("avg_news_sentiment"),
            metrics.get("stock_close_price"),
        )
        cursor.execute(UPSERT_METRICS_QUERY, data_to_insert)
        connection.commit()
        cursor.close()
        logger.info(f"Successfully saved metrics for snack_id: {metrics['snack_id']}")
    except psycopg2.Error as e:
        logger.error(f"Database error: {e}")
        connection.rollback()
