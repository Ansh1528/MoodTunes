import pymysql
from config import Config

def test_connection():
    try:
        # Try to connect to MySQL server
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD
        )
        
        print("Successfully connected to MySQL!")
        
        # Create database if it doesn't exist
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
            print(f"Database '{Config.MYSQL_DB}' created or already exists!")
        
        connection.commit()
        connection.close()
        print("Connection closed.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("MySQL configuration:")
    print(f"Host: {Config.MYSQL_HOST}")
    print(f"User: {Config.MYSQL_USER}")
    print(f"Database: {Config.MYSQL_DB}")
    test_connection()