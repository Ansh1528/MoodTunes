from app import app, db
from models import User, JournalEntry
import pymysql
from config import Config

def init_database():
    # Connect to MySQL server without selecting a database
    connection = pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD
    )
    
    try:
        with connection.cursor() as cursor:
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
        connection.commit()
    finally:
        connection.close()

    # Now create all tables using SQLAlchemy
    with app.app_context():
        db.create_all()
        print("Database and tables created successfully!")

if __name__ == "__main__":
    init_database()