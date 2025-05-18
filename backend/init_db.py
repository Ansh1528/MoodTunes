from app import app
from models import db

def init_database():
    """Initialize MongoDB database and collections."""
    try:
        # Initialize MongoDB connection
        db.init_app(app)
        print("Successfully connected to MongoDB!")
        
        # Create indexes
        with app.app_context():
            # Create unique indexes for User collection
            db.User.ensure_index('username', unique=True)
            db.User.ensure_index('email', unique=True)
            print("Database indexes created successfully!")
            
    except Exception as e:
        print(f"Error initializing database: {str(e)}")

if __name__ == "__main__":
    init_database() 