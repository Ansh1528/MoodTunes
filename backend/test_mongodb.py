from app import app
from models import db, User, JournalEntry
import traceback

def test_mongodb_connection():
    """Test MongoDB connection and basic operations."""
    try:
        print("\nStarting MongoDB connection test...")
        print(f"MongoDB Settings: {app.config.get('MONGODB_SETTINGS', 'Not configured')}")
        
        # Initialize the app context
        with app.app_context():
            # Test database connection
            print("\nTesting MongoDB connection...")
            try:
                info = db.connection.server_info()
                print("✓ Successfully connected to MongoDB!")
                print(f"Server Info: {info}")
            except Exception as conn_error:
                print(f"\n✗ Connection Error: {str(conn_error)}")
                print("Traceback:")
                traceback.print_exc()
                return

            # Test database operations
            print("\nTesting database operations...")
            
            try:
                # Create a test user
                test_user = User(
                    username="test_user",
                    email="test@example.com"
                )
                test_user.set_password("test_password")
                
                # Save the user
                test_user.save()
                print("✓ Successfully created test user")
                
                # Retrieve the user
                found_user = User.objects(username="test_user").first()
                if found_user:
                    print(f"✓ Successfully retrieved user: {found_user.username}")
                else:
                    print("✗ Failed to retrieve user")
                    return
                
                # Create a test journal entry
                test_entry = JournalEntry(
                    content="Test journal entry",
                    user_id=found_user.id
                )
                test_entry.save()
                print("✓ Successfully created test journal entry")
                
                # Clean up test data
                test_entry.delete()
                found_user.delete()
                print("\n✓ Successfully cleaned up test data")
                
                print("\nAll MongoDB connection tests passed!")
                
            except Exception as op_error:
                print(f"\n✗ Database Operation Error: {str(op_error)}")
                print("Traceback:")
                traceback.print_exc()
                
                # Attempt to clean up any test data that might have been created
                try:
                    cleanup_user = User.objects(username="test_user").first()
                    if cleanup_user:
                        cleanup_entries = JournalEntry.objects(user_id=cleanup_user.id)
                        for entry in cleanup_entries:
                            entry.delete()
                        cleanup_user.delete()
                        print("\nCleaned up test data after error")
                except Exception as cleanup_error:
                    print(f"\n✗ Error during cleanup: {str(cleanup_error)}")
            
    except Exception as e:
        print(f"\n✗ Unexpected Error: {str(e)}")
        print("Traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    test_mongodb_connection() 