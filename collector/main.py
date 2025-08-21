# orchestration / entry point
import logging
import os
import psycopg2
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()

# TODO:
# - call trend collector
# - read doc for reddit/twitter
# - write code for reddit/twitter
# - updated db


def connect_db():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            dbname=os.getenv("DB_NAME"),
        )
        # print("Connection to supabase db successful")
        logger.info("Connection to supabase db sucessful")
        return connection
    except psycopg2.Error as e:
        logger.error(f"Error connecting to supabase db: {e}", exc_info=True)
        return None


def close_db_connection(connection):
    if connection:
        connection.close()
        print("Database connection closed.")


def fetch_data(connection, table_name):
    if not connection:
        print("No database connection available.")
        return []

    try:
        cursor = connection.cursor()
        cursor.execute(f"SELECT name FROM {table_name} WHERE status = 'approved'")
        rows = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        cursor.close()
        return column_names, rows

    except psycopg2.Error as e:
        print(f"Error fetching data: {e}")
        return [], []


if __name__ == "__main__":
    conn = connect_db()

    if conn:
        logger.info("Fectching Data:")
        column_names, rows = fetch_data(conn, "snacks")
        snack_list = [item[0] for item in rows]
        print(snack_list)
        close_db_connection(conn)
