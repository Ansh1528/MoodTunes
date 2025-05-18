import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from config import Config
from models import db, User, JournalEntry
from transformers import pipeline
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

# Initialize the sentiment analysis pipeline
emotion_analyzer = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.objects(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.objects(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    user.save()
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'user': {'username': user.username, 'email': user.email}}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.objects(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'user': {'username': user.username, 'email': user.email}}), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/journal', methods=['POST'])
@jwt_required()
def create_journal_entry():    
    print("\n=== Starting journal entry creation ===")
    print("\nRequest Details:")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    
    try:
        current_user_id = get_jwt_identity()
        print(f"\nUser ID from token: {current_user_id}")
        
        if not current_user_id:
            print("Error: Invalid or expired token")
            return jsonify({
                'success': False, 
                'error': 'Invalid or expired token',
                'validation_stage': 'authentication'
            }), 401
        
        # Verify user exists in database
        user = User.objects(id=current_user_id).first()
        if not user:
            print(f"Error: User {current_user_id} not found in database")
            return jsonify({
                'success': False,
                'error': 'User not found',
                'validation_stage': 'user_verification'
            }), 404
        
        try:
            data = request.get_json()
            print("\nReceived data:", data)
        except Exception as e:
            print(f"\nError parsing JSON: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Invalid JSON data',
                'validation_stage': 'json_parsing',
                'details': str(e)
            }), 400
        
        if not data:
            print("Error: Empty request data")
            return jsonify({
                'success': False,
                'error': 'Empty request data',
                'validation_stage': 'data_validation'
            }), 400
        
        if 'content' not in data:
            print("Error: Missing content field")
            return jsonify({
                'success': False, 
                'error': 'Content is required',
                'received_fields': list(data.keys()),
                'validation_stage': 'content_validation'
            }), 422
            
        content = str(data.get('content', '')).strip()
        print(f"\nContent length: {len(content)}")
        print(f"Content: {content}")
        
        if not content:
            print("Error: Empty content")
            return jsonify({
                'success': False, 
                'error': 'Content cannot be empty',
                'validation_stage': 'content_validation'
            }), 422
        
        try:
            # Create journal entry
            entry = JournalEntry(
                content=content,
                user_id=user
            )
            
            # Handle mood data if provided
            mood_data = data.get('mood')
            if mood_data:
                print("\nProcessing mood data:", mood_data)
                try:
                    entry.set_mood(mood_data)
                except ValueError as ve:
                    print(f"Mood validation error: {str(ve)}")
                    return jsonify({
                        'success': False,
                        'error': str(ve),
                        'validation_stage': 'mood_validation'
                    }), 422
            
            # Save the entry
            print("\nSaving entry to database...")
            entry.save()
            print("Entry saved successfully")
            
            # Verify the save was successful
            saved_entry = JournalEntry.objects(id=entry.id).first()
            if not saved_entry:
                raise Exception("Entry was not saved properly")
            
            saved_mood = saved_entry.get_mood()
            print("\nSaved entry details:")
            print(f"ID: {saved_entry.id}")
            print(f"Content: {saved_entry.content}")
            print(f"Mood: {saved_mood}")
            
            return jsonify({
                'success': True,
                'entry': {
                    'id': str(saved_entry.id),
                    'content': saved_entry.content,
                    'mood': saved_mood,
                    'created_at': saved_entry.created_at.isoformat()
                }
            }), 201
            
        except Exception as e:
            print("\nError saving entry:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            import traceback
            print("Traceback:")
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': 'Failed to save journal entry',
                'details': str(e),
                'error_type': type(e).__name__,
                'validation_stage': 'database_save'
            }), 500
            
    except Exception as e:
        print("\nUnexpected error:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        print("Traceback:")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred',
            'details': str(e),
            'error_type': type(e).__name__,
            'validation_stage': 'unexpected'
        }), 500

@app.route('/api/journal', methods=['GET'])
@jwt_required()
def get_journal_entries():
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token',
                'details': 'Authentication required'
            }), 401

        print(f"Fetching entries for user {current_user_id}")
        
        try:
            entries = JournalEntry.objects(user_id=current_user_id).order_by('-created_at')
            print(f"Found {len(entries)} entries")
            
            response_entries = []
            for entry in entries:
                try:
                    mood_data = entry.get_mood()
                    entry_data = {
                        'id': str(entry.id),
                        'content': entry.content,
                        'created_at': entry.created_at.isoformat(),
                        'mood': mood_data
                    }
                    response_entries.append(entry_data)
                except Exception as entry_error:
                    print(f"Error processing entry {entry.id}: {str(entry_error)}")
                    # Skip problematic entries but continue processing others
                    continue
            
            return jsonify({
                'success': True,
                'entries': response_entries
            }), 200
            
        except Exception as db_error:
            print(f"Database error: {str(db_error)}")
            return jsonify({
                'success': False,
                'error': 'Failed to fetch entries from database',
                'details': str(db_error)
            }), 500
            
    except Exception as e:
        print(f"Unexpected error in get_journal_entries: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "Welcome to the Flask API!"})

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/api/mood-history/<user_id>', methods=['GET'])
@jwt_required()
def get_mood_history(user_id):
    try:
        # Verify the requesting user is getting their own history
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        entries = JournalEntry.objects(user_id=user_id).order_by('-created_at')
        history = [{'created_at': entry.created_at.isoformat()} for entry in entries]
        return jsonify(history)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-mood', methods=['POST'])
def analyze_mood():
    try:
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Get emotion analysis
        results = emotion_analyzer(text)[0]
        
        # Sort emotions by score
        sorted_emotions = sorted(results, key=lambda x: x['score'], reverse=True)
        
        # Get primary emotion (highest score)
        primary_emotion = sorted_emotions[0]
        
        # Get all emotions with score > 0.1
        detected_emotions = [
            emotion['label']  # Just get the label string directly
            for emotion in sorted_emotions
            if emotion['score'] > 0.1
        ]

        # Format the response exactly as needed for journal entry
        response = {
            'primary_mood': primary_emotion['label'],
            'confidence': round(primary_emotion['score'] * 100, 2),
            'emotions': detected_emotions  # Array of strings
        }
        
        print("Mood analysis response:", response)
        return jsonify(response)

    except Exception as e:
        print(f"Error in mood analysis: {str(e)}")
        return jsonify({'error': 'Failed to analyze mood'}), 500

# Error handling middleware
@app.errorhandler(500)
def handle_500_error(e):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'details': str(e)
    }), 500

@app.errorhandler(404)
def handle_404_error(e):
    return jsonify({
        'success': False,
        'error': 'Not found',
        'details': str(e)
    }), 404

@app.errorhandler(401)
def handle_401_error(e):
    return jsonify({
        'success': False,
        'error': 'Unauthorized',
        'details': 'Authentication required'
    }), 401

@app.errorhandler(Exception)
def handle_generic_error(e):
    print(f"Unhandled error: {str(e)}")
    return jsonify({
        'success': False,
        'error': 'An unexpected error occurred',
        'details': str(e)
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
