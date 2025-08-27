import logging
import os
import psycopg2
from dotenv import load_dotenv
import json
from data_collector import run_collection_pipeline

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()


GET_SNACKS_QUERY = """
SELECT s.name as snack_name, c.name as company_name, c.stock_ticker, a.alias_name as alias
FROM snacks s
LEFT JOIN companies c ON s.company_id = c.id
LEFT JOIN snack_aliases a ON s.id = a.snack_id;"""

# - call trend collector
# - update db
# - write code to bootstrap db (3 month pull data)


def create_snack_config(db_results):
    snack_config = {}

    for row in db_results:
        snack_name, company_name, stock_ticker, alias = row

        config_key = snack_name.lower().replace(" ", "-")

        # If this is the first time we're seeing this snack, create its entry
        if config_key not in snack_config:
            snack_config[config_key] = {
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


def connect_db():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dbname=os.getenv("DB_NAME"),
        )
        logger.info("Connection to supabase db sucessful")
        return connection
    except psycopg2.Error as e:
        logger.error(f"Error connecting to supabase db: {e}", exc_info=True)
        return None


def close_db_connection(connection):
    if connection:
        connection.close()
        print("Database connection closed.")


def fetch_data(connection):
    if not connection:
        print("No database connection available.")
        return []

    try:
        cursor = connection.cursor()
        cursor.execute(GET_SNACKS_QUERY)
        rows = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        cursor.close()
        return column_names, rows

    except psycopg2.Error as e:
        print(f"Error fetching data: {e}")
        return [], []


def main():
    conn = connect_db()

    if conn:
        logger.info("Fectching Data:")
        column_names, rows = fetch_data(conn)
        SNACK_CONFIG = create_snack_config(rows)
        logging.debug(json.dumps(SNACK_CONFIG, indent=2))
        run_collection_pipeline(SNACK_CONFIG)

        # TESTING
        # first_snack_key = next(iter(SNACK_CONFIG))
        # test_config = {first_snack_key: SNACK_CONFIG[first_snack_key]}
        # run_collection_pipeline(test_config)
        #
        close_db_connection(conn)


if __name__ == "__main__":
    main()
