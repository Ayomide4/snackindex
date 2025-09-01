import json
import logging
from logging.handlers import TimedRotatingFileHandler

from data_collector import run_collection_pipeline
from db_utils import connect_db, fetch_data, close_db_connection, create_snack_config
from dotenv import load_dotenv


load_dotenv()

log_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Console Handler
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)
logger.addHandler(console_handler)

# File Handler (to save logs to a file and keeps it for 7 days)
file_handler = TimedRotatingFileHandler(
    "collector.log", when="midnight", interval=1, backupCount=7
)
file_handler.setFormatter(log_formatter)
logger.addHandler(file_handler)

# logging.basicConfig(
#     level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
# )
# logger = logging.getLogger(__name__)

# TODO:
# - write code to bootstrap db (3 month pull data)


def main():
    conn = connect_db()

    if conn:
        logger.info("Fectching Data:")
        rows = fetch_data(conn)
        SNACK_CONFIG = create_snack_config(rows)
        logging.debug(json.dumps(SNACK_CONFIG, indent=2))
        run_collection_pipeline(SNACK_CONFIG, conn)

        # TESTING
        # first_snack_key = next(iter(SNACK_CONFIG))
        # test_config = {first_snack_key: SNACK_CONFIG[first_snack_key]}
        # run_collection_pipeline(test_config, conn)

        close_db_connection(conn)


if __name__ == "__main__":
    main()

# postgresql://postgres.eeqtlwcodbhcwatozewk:testpasswordforactions2025@aws-0-us-east-2.pooler.supabase.com:6543/postgres
