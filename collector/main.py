import json
import logging
import os

from data_collector import run_collection_pipeline
from db_utils import connect_db, fetch_data, close_db_connection, create_snack_config
from dotenv import load_dotenv


load_dotenv()

print(f"--- DEBUG: Loaded DB_HOST is: {os.getenv('DB_HOST')} ---")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# TODO:
# - update db
# - write code to bootstrap db (3 month pull data)


def main():
    conn = connect_db()

    if conn:
        logger.info("Fectching Data:")
        rows = fetch_data(conn)
        SNACK_CONFIG = create_snack_config(rows)
        logging.debug(json.dumps(SNACK_CONFIG, indent=2))
        # run_collection_pipeline(SNACK_CONFIG, conn)

        # TESTING
        first_snack_key = next(iter(SNACK_CONFIG))
        test_config = {first_snack_key: SNACK_CONFIG[first_snack_key]}
        run_collection_pipeline(test_config, conn)

        close_db_connection(conn)


if __name__ == "__main__":
    main()
