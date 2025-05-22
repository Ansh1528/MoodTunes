import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from config import Config
from models import db, User, JournalEntry, MusicFeedback
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import os
from dotenv import load_dotenv
import json
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Updated Emotion categories mapping with emojis
EMOTION_CATEGORIES = {
    'Happy 😊': ['joy', 'happiness', 'delight', 'pleasure', 'cheerfulness'],
    'Sad 😢': ['sadness', 'grief', 'sorrow', 'disappointment', 'loneliness'],
    'Angry 😠': ['anger', 'annoyance', 'irritation', 'frustration', 'rage'],
    'Fearful 😰': ['fear', 'anxiety', 'worry', 'nervousness', 'stress'],
    'Surprised 😲': ['surprise', 'amazement', 'awe', 'wonder', 'shock'],
    'Disgusted 🤢': ['disgust', 'revulsion', 'aversion', 'contempt'],
    'Calm 😌': ['calm', 'relaxed', 'peaceful', 'serene', 'tranquil'],
    'Excited ⚡': ['excitement', 'enthusiasm', 'eager', 'thrill', 'anticipation'],
    'Loving 💝': ['love', 'affection', 'caring', 'tenderness', 'fondness', 'adoration'],
    'Heartbroken 💔': ['heartbreak', 'heartbroken', 'broken heart', 'heart ache', 'emotional pain'],
    'Motivated 💪': [
        'determination', 'motivation', 'drive', 'ambition', 'passion', 'inspiration',
        'purpose', 'focus', 'dedication', 'commitment', 'perseverance', 'resilience',
        'achievement', 'success', 'progress', 'growth', 'improvement', 'development',
        'goals', 'aspirations', 'dreams', 'vision', 'mission', 'purpose',
        'empowerment', 'strength', 'courage', 'confidence', 'belief', 'hope',
        'optimism', 'positivity', 'enthusiasm', 'energy', 'vitality', 'vigor',
        'determined', 'motivated', 'driven', 'ambitious', 'passionate', 'inspired',
        'focused', 'dedicated', 'committed', 'persevering', 'resilient',
        'achieving', 'succeeding', 'progressing', 'growing', 'improving', 'developing',
        'empowered', 'strong', 'courageous', 'confident', 'hopeful',
        'optimistic', 'positive', 'energetic', 'vital', 'vigorous'
    ],
    'Neutral 😐': ['neutral', 'indifferent', 'unemotional'],
    'Nostalgic 🎭': [
        'nostalgia', 'reminiscence', 'memories', 'recollection', 'remembrance',
        'sentimental', 'yearning', 'longing', 'homesick', 'melancholy',
        'wistful', 'reflective', 'contemplative', 'reminiscent', 'retrospective',
        'old times', 'good old days', 'childhood memories', 'past times',
        'throwback', 'blast from the past', 'memory lane', 'flashback',
        'vintage', 'classic', 'traditional', 'old school', 'retro'
    ]
}

# Emotion emoji mapping for individual emotions
EMOTION_EMOJIS = {
    'joy': '😊',
    'happiness': '😄',
    'delight': '🥰',
    'pleasure': '😋',
    'cheerfulness': '😃',
    'sadness': '😢',
    'grief': '😭',
    'sorrow': '💔',
    'disappointment': '😔',
    'loneliness': '😞',
    'anger': '😠',
    'annoyance': '😤',
    'irritation': '😒',
    'frustration': '😫',
    'rage': '😡',
    'fear': '😰',
    'anxiety': '😨',
    'worry': '😟',
    'nervousness': '😬',
    'stress': '😓',
    'surprise': '😲',
    'amazement': '😮',
    'awe': '🤩',
    'wonder': '✨',
    'shock': '😱',
    'disgust': '🤢',
    'revulsion': '🤮',
    'aversion': '😖',
    'contempt': '😏',
    'calm': '😌',
    'relaxed': '😌',
    'peaceful': '🕊️',
    'serene': '🌊',
    'tranquil': '🌿',
    'excitement': '⚡',
    'enthusiasm': '🎉',
    'eager': '✨',
    'thrill': '🎢',
    'anticipation': '🎯',
    'love': '💝',
    'affection': '💖',
    'caring': '💗',
    'tenderness': '💓',
    'fondness': '💕',
    'adoration': '💘',
    'determination': '💪',
    'motivation': '🔥',
    'drive': '🚀',
    'ambition': '⭐',
    'passion': '❤️',
    'inspiration': '💫',
    'purpose': '🎯',
    'focus': '🎯',
    'dedication': '🎯',
    'commitment': '🎯',
    'perseverance': '💪',
    'resilience': '💪',
    'achievement': '🏆',
    'success': '🏆',
    'progress': '📈',
    'growth': '🌱',
    'improvement': '📈',
    'development': '🌱',
    'goals': '🎯',
    'aspirations': '✨',
    'dreams': '✨',
    'vision': '👁️',
    'mission': '🎯',
    'empowerment': '💪',
    'strength': '🦁',
    'courage': '🦁',
    'confidence': '💪',
    'belief': '🙏',
    'hope': '✨',
    'optimism': '😊',
    'positivity': '😊',
    'energy': '⚡',
    'vitality': '💫',
    'vigor': '💪',
    'neutral': '😐',
    'indifferent': '😶',
    'unemotional': '😑',
    'heartbreak': '💔',
    'heartbroken': '💔',
    'broken heart': '💔',
    'heart ache': '💔',
    'emotional pain': '💔',
    'nostalgia': '🎭',
    'reminiscence': '🎭',
    'memories': '🎭',
    'recollection': '🎭',
    'remembrance': '🎭',
    'sentimental': '🎭',
    'yearning': '🎭',
    'longing': '🎭',
    'homesick': '🎭',
    'melancholy': '🎭',
    'wistful': '🎭',
    'reflective': '🎭',
    'contemplative': '🎭',
    'reminiscent': '🎭',
    'retrospective': '🎭',
    'old times': '🎭',
    'good old days': '🎭',
    'childhood memories': '🎭',
    'past times': '🎭',
    'throwback': '🎭',
    'blast from the past': '🎭',
    'memory lane': '🎭',
    'flashback': '🎭',
    'vintage': '🎭',
    'classic': '🎭',
    'traditional': '🎭',
    'old school': '🎭',
    'retro': '🎭'
}

# Initialize the sentiment analysis pipeline with SamLowe model
logger.info("Initializing emotion analyzer...")
model_name = "SamLowe/roberta-base-go_emotions"

try:
    # Initialize tokenizer and model separately for better error handling
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    emotion_analyzer = pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        return_all_scores=True,
        device=-1  # Use CPU by default
    )
    logger.info("Emotion analyzer initialized successfully")
except Exception as e:
    logger.error(f"Error initializing emotion analyzer: {str(e)}")
    raise

def map_emotion_to_category(emotion):
    """Map the model's output emotions to our desired categories"""
    emotion_mapping = {
        'joy': 'Happy 😊',
        'happiness': 'Happy 😊',
        'delight': 'Happy 😊',
        'pleasure': 'Happy 😊',
        'cheerfulness': 'Happy 😊',
        'sadness': 'Sad 😢',
        'grief': 'Sad 😢',
        'sorrow': 'Sad 😢',
        'disappointment': 'Sad 😢',
        'loneliness': 'Sad 😢',
        'heartbreak': 'Heartbroken 💔',
        'heartbroken': 'Heartbroken 💔',
        'broken heart': 'Heartbroken 💔',
        'heart ache': 'Heartbroken 💔',
        'emotional pain': 'Heartbroken 💔',
        'anger': 'Angry 😠',
        'annoyance': 'Angry 😠',
        'irritation': 'Angry 😠',
        'frustration': 'Angry 😠',
        'rage': 'Angry 😠',
        'fear': 'Fearful 😰',
        'anxiety': 'Fearful 😰',
        'worry': 'Fearful 😰',
        'nervousness': 'Fearful 😰',
        'stress': 'Fearful 😰',
        'surprise': 'Surprised 😲',
        'amazement': 'Surprised 😲',
        'awe': 'Surprised 😲',
        'wonder': 'Surprised 😲',
        'shock': 'Surprised 😲',
        'disgust': 'Disgusted 🤢',
        'revulsion': 'Disgusted 🤢',
        'aversion': 'Disgusted 🤢',
        'contempt': 'Disgusted 🤢',
        'calm': 'Calm 😌',
        'relaxed': 'Calm 😌',
        'peaceful': 'Calm 😌',
        'serene': 'Calm 😌',
        'tranquil': 'Calm 😌',
        'excitement': 'Excited ⚡',
        'enthusiasm': 'Excited ⚡',
        'eager': 'Excited ⚡',
        'thrill': 'Excited ⚡',
        'anticipation': 'Excited ⚡',
        'love': 'Loving 💝',
        'affection': 'Loving 💝',
        'caring': 'Loving 💝',
        'tenderness': 'Loving 💝',
        'fondness': 'Loving 💝',
        'adoration': 'Loving 💝',
        'determination': 'Motivated 💪',
        'motivation': 'Motivated 💪',
        'drive': 'Motivated 💪',
        'ambition': 'Motivated 💪',
        'passion': 'Motivated 💪',
        'inspiration': 'Motivated 💪',
        'purpose': 'Motivated 💪',
        'focus': 'Motivated 💪',
        'dedication': 'Motivated 💪',
        'commitment': 'Motivated 💪',
        'perseverance': 'Motivated 💪',
        'resilience': 'Motivated 💪',
        'achievement': 'Motivated 💪',
        'success': 'Motivated 💪',
        'progress': 'Motivated 💪',
        'growth': 'Motivated 💪',
        'improvement': 'Motivated 💪',
        'development': 'Motivated 💪',
        'goals': 'Motivated 💪',
        'aspirations': 'Motivated 💪',
        'dreams': 'Motivated 💪',
        'vision': 'Motivated 💪',
        'mission': 'Motivated 💪',
        'empowerment': 'Motivated 💪',
        'strength': 'Motivated 💪',
        'courage': 'Motivated 💪',
        'confidence': 'Motivated 💪',
        'belief': 'Motivated 💪',
        'hope': 'Motivated 💪',
        'optimism': 'Motivated 💪',
        'positivity': 'Motivated 💪',
        'energy': 'Motivated 💪',
        'vitality': 'Motivated 💪',
        'vigor': 'Motivated 💪',
        'neutral': 'Neutral 😐',
        'indifferent': 'Neutral 😐',
        'unemotional': 'Neutral 😐',
        'nostalgia': 'Nostalgic 🎭',
        'reminiscence': 'Nostalgic 🎭',
        'memories': 'Nostalgic 🎭',
        'recollection': 'Nostalgic 🎭',
        'remembrance': 'Nostalgic 🎭',
        'sentimental': 'Nostalgic 🎭',
        'yearning': 'Nostalgic 🎭',
        'longing': 'Nostalgic 🎭',
        'homesick': 'Nostalgic 🎭',
        'melancholy': 'Nostalgic 🎭',
        'wistful': 'Nostalgic 🎭',
        'reflective': 'Nostalgic 🎭',
        'contemplative': 'Nostalgic 🎭',
        'reminiscent': 'Nostalgic 🎭',
        'retrospective': 'Nostalgic 🎭'
    }
    return emotion_mapping.get(emotion, 'Neutral 😐')

def preprocess_text(text):
    """Preprocess text to better detect motivation-related phrases"""
    motivation_phrases = {
        'determined to': 'determination',
        'motivated to': 'motivation',
        'driven to': 'drive',
        'committed to': 'commitment',
        'focused on': 'focus',
        'passionate about': 'passion',
        'dedicated to': 'dedication',
        'inspired to': 'inspiration',
        'eager to': 'eagerness',
        'excited to': 'excitement',
        'looking forward to': 'anticipation',
        'can\'t wait to': 'anticipation',
        'ready to': 'determination',
        'willing to': 'determination',
        'going to': 'determination',
        'plan to': 'determination',
        'aim to': 'determination',
        'striving to': 'determination',
        'working to': 'determination',
        'trying to': 'determination'
    }
    
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Check for motivation phrases
    for phrase, emotion in motivation_phrases.items():
        if phrase in text_lower:
            # Add the emotion explicitly to the text
            text = f"{text} {emotion}"
    
    return text

def group_emotions(emotions_with_scores):
    """Group emotions into categories and calculate category scores"""
    category_scores = {category: 0.0 for category in EMOTION_CATEGORIES.keys()}
    category_emotions = {category: [] for category in EMOTION_CATEGORIES.keys()}
    
    # First pass: collect all emotions and their scores
    for emotion in emotions_with_scores:
        label = emotion['label']
        score = emotion['score']
        
        # Map the emotion to our category
        category = map_emotion_to_category(label)
        
        # Boost motivation-related emotions
        if category == 'Motivated 💪':
            score *= 1.5  # Increase the weight of motivation-related emotions
        
        # Add to category scores and emotions
        category_scores[category] += score
        category_emotions[category].append({
            'emotion': label,
            'emoji': EMOTION_EMOJIS.get(label, ''),
            'score': round(score * 100, 2)
        })
    
    # Second pass: normalize scores and filter low confidence emotions
    min_confidence = 0.1  # Minimum confidence threshold
    filtered_categories = {}
    
    for category, score in category_scores.items():
        if score > min_confidence:
            # Normalize the score
            normalized_score = score / len(category_emotions[category]) if category_emotions[category] else score
            filtered_categories[category] = normalized_score
    
    # Sort categories by score
    sorted_categories = sorted(
        [(category, score) for category, score in filtered_categories.items()],
        key=lambda x: x[1],
        reverse=True
    )
    
    # Format the response
    grouped_emotions = {
        'primary_category': sorted_categories[0][0] if sorted_categories else 'Neutral 😐',
        'categories': [
            {
                'name': category,
                'score': round(score * 100, 2),
                'emotions': sorted(category_emotions[category], key=lambda x: x['score'], reverse=True)
            }
            for category, score in sorted_categories
        ]
    }
    
    return grouped_emotions

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

def detect_motivation(text):
    """Directly detect motivation using pattern matching"""
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Define motivation patterns with weighted scores
    motivation_patterns = [
        # Direct motivation words (weight: 0.4)
        (r'\b(motivated|motivation|inspire|inspired|inspiration|determined|determination)\b', 0.4),
        (r'\b(driven|ambitious|passionate|focused|dedicated|committed)\b', 0.4),
        
        # Action-oriented phrases (weight: 0.3)
        (r'\b(going to|plan to|aim to|striving to|working to|trying to)\b', 0.3),
        (r'\b(achieve|accomplish|reach|attain|succeed|succeeding)\b', 0.3),
        
        # Goal-related terms (weight: 0.3)
        (r'\b(goal|target|objective|mission|purpose|vision)\b', 0.3),
        (r'\b(dream|aspiration|ambition|drive|push|progress)\b', 0.3),
        
        # Growth and improvement (weight: 0.2)
        (r'\b(improve|grow|develop|progress|advance|better)\b', 0.2),
        (r'\b(learning|growing|developing|improving|advancing)\b', 0.2),
        
        # Positive mindset (weight: 0.2)
        (r'\b(never give up|keep going|push through|stay strong)\b', 0.2),
        (r'\b(believe|confidence|strength|courage|power)\b', 0.2)
    ]
    
    import re
    
    # Check each pattern and calculate motivation score with weighted matches
    motivation_score = 0
    for pattern, weight in motivation_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            motivation_score += len(matches) * weight
    
    # Boost the score if multiple motivation indicators are present
    if motivation_score > 0:
        motivation_score *= 1.5
    
    return motivation_score

def detect_love(text):
    """Directly detect love and relationship-related emotions"""
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Define love and relationship patterns
    love_patterns = [
        # Relationship words
        r'\b(relationship|love|romance|dating|partner|boyfriend|girlfriend|spouse|husband|wife)\b',
        r'\b(couple|marriage|wedding|engagement|proposal|anniversary)\b',
        r'\b(crush|infatuation|attraction|chemistry|connection|bond)\b',
        
        # Love feelings
        r'\b(love|adore|cherish|care|date|affection|fondness|tenderness)\b',
        r'\b(passion|desire|longing|yearning|devotion|commitment)\b',
        r'\b(heart|soul|feelings|emotions|sentiment|attachment)\b',
        
        # Relationship actions
        r'\b(together|dating|seeing|meeting|talking|chatting|connecting)\b',
        r'\b(share|care|support|trust|understand|respect|appreciate)\b',
        r'\b(kiss|hug|hold|touch|embrace|caress|comfort)\b',
        
        # Relationship states
        r'\b(single|taken|committed|exclusive|serious|casual|complicated)\b',
        r'\b(breakup|divorce|separation|reconciliation|reunion)\b',
        
        # Love expressions
        r'\b(miss you|love you|care about|think about|dream about)\b',
        r'\b(special|important|meaningful|precious|valuable)\b',
        r'\b(forever|always|never|forever|eternal|endless)\b'
    ]
    
    import re
    
    # Check each pattern and calculate love score
    love_score = 0
    for pattern in love_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            love_score += len(matches) * 0.2
    
    return love_score

def detect_heartbreak(text):
    """Directly detect heartbreak and emotional pain related emotions"""
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Define heartbreak patterns with increased weight for direct heartbreak terms
    heartbreak_patterns = [
        # Direct heartbreak words (weight: 0.4)
        (r'\b(heartbreak|heartbroken|heartbreaking|broken heart|heart ache|emotional pain)\b', 0.4),
        (r'\b(heart hurts|heart aching|heart pain|heart sore)\b', 0.4),
        
        # Breakup related (weight: 0.3)
        (r'\b(breakup|break up|broke up|breaking up|broken up)\b', 0.3),
        (r'\b(separated|divorced|split|parted|ended)\b', 0.3),
        
        # Emotional pain (weight: 0.2)
        (r'\b(hurt|pain|ache|suffer|cry|tears|weep)\b', 0.2),
        (r'\b(miss|longing|yearning|empty|void|alone)\b', 0.2),
        
        # Rejection (weight: 0.3)
        (r'\b(rejected|dumped|left|abandoned|betrayed)\b', 0.3),
        (r'\b(unwanted|unloved|unappreciated|taken for granted)\b', 0.3),
        
        # Healing (weight: 0.2)
        (r'\b(moving on|getting over|healing|recovering|letting go)\b', 0.2),
        (r'\b(accept|forgive|forget|move forward|start over)\b', 0.2)
    ]
    
    import re
    
    # Check each pattern and calculate heartbreak score with weighted matches
    heartbreak_score = 0
    for pattern, weight in heartbreak_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            heartbreak_score += len(matches) * weight
    
    # Boost the score if multiple heartbreak indicators are present
    if heartbreak_score > 0:
        heartbreak_score *= 1.5
    
    return heartbreak_score

def detect_calm(text):
    """Directly detect calm and relaxed states"""
    # Convert to lowercase for matching
    text_lower = text.lower()
    
    # Define calm patterns with weighted scores
    calm_patterns = [
        # Direct calm words (weight: 0.4)
        (r'\b(calm|relaxed|peaceful|serene|tranquil|zen)\b', 0.4),
        (r'\b(peace|quiet|still|gentle|soft|mellow)\b', 0.4),
        
        # Relaxation activities (weight: 0.3)
        (r'\b(meditate|meditation|yoga|breathing|breath|mindful)\b', 0.3),
        (r'\b(rest|resting|relax|relaxing|unwind|unwinding)\b', 0.3),
        
        # Nature-related calm (weight: 0.3)
        (r'\b(nature|forest|ocean|waves|breeze|wind)\b', 0.3),
        (r'\b(sunset|sunrise|stars|moon|night|dawn)\b', 0.3),
        
        # Physical relaxation (weight: 0.2)
        (r'\b(sleep|sleeping|nap|napping|rest|resting)\b', 0.2),
        (r'\b(comfort|comfortable|cozy|warm|soft|gentle)\b', 0.2),
        
        # Mental state (weight: 0.3)
        (r'\b(clear|clear mind|focused|centered|balanced)\b', 0.3),
        (r'\b(relief|relieved|ease|eased|soothe|soothed)\b', 0.3),
        
        # Time-related calm (weight: 0.2)
        (r'\b(morning|evening|night|dawn|dusk|twilight)\b', 0.2),
        (r'\b(weekend|holiday|vacation|break|pause|moment)\b', 0.2)
    ]
    
    import re
    
    # Check each pattern and calculate calm score with weighted matches
    calm_score = 0
    for pattern, weight in calm_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            calm_score += len(matches) * weight
    
    # Boost the score if multiple calm indicators are present
    if calm_score > 0:
        calm_score *= 1.5
    
    return calm_score

@app.route('/api/analyze-mood', methods=['POST'])
def analyze_mood():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400

        text = data.get('text')
        logger.info(f"Analyzing text: {text}")
        
        try:
            # Check for motivation using pattern matching
            motivation_score = detect_motivation(text)
            logger.info(f"Motivation score: {motivation_score}")
            
            # Check for love using pattern matching
            love_score = detect_love(text)
            logger.info(f"Love score: {love_score}")
            
            # Check for heartbreak using pattern matching
            heartbreak_score = detect_heartbreak(text)
            logger.info(f"Heartbreak score: {heartbreak_score}")
            
            # Check for calm using pattern matching
            calm_score = detect_calm(text)
            logger.info(f"Calm score: {calm_score}")
            
            # Get emotion analysis from the model
            results = emotion_analyzer(text)[0]
            logger.info(f"Model emotion results: {results}")
            
            # Group emotions into categories
            grouped_emotions = group_emotions(results)
            
            # If calm score is high enough, override the primary emotion
            if calm_score > 0.2:  # Threshold for calm detection
                grouped_emotions['primary_category'] = 'Calm 😌'
                # Add calm to the categories if not present
                if not any(cat['name'] == 'Calm 😌' for cat in grouped_emotions['categories']):
                    grouped_emotions['categories'].append({
                        'name': 'Calm 😌',
                        'score': round(calm_score * 100, 2),
                        'emotions': [{
                            'emotion': 'calm',
                            'emoji': '😌',
                            'score': round(calm_score * 100, 2)
                        }]
                    })
            
            # If motivation score is high enough, override the primary emotion
            if motivation_score > 0.2:
                grouped_emotions['primary_category'] = 'Motivated 💪'
                # Add motivation to the categories if not present
                if not any(cat['name'] == 'Motivated 💪' for cat in grouped_emotions['categories']):
                    grouped_emotions['categories'].append({
                        'name': 'Motivated 💪',
                        'score': round(motivation_score * 100, 2),
                        'emotions': [{
                            'emotion': 'motivation',
                            'emoji': '💪',
                            'score': round(motivation_score * 100, 2)
                        }]
                    })
            
            # If heartbreak score is high enough, override the primary emotion
            if heartbreak_score > 0.2:
                grouped_emotions['primary_category'] = 'Heartbroken 💔'
                # Add heartbreak to the categories if not present
                if not any(cat['name'] == 'Heartbroken 💔' for cat in grouped_emotions['categories']):
                    grouped_emotions['categories'].append({
                        'name': 'Heartbroken 💔',
                        'score': round(heartbreak_score * 100, 2),
                        'emotions': [{
                            'emotion': 'heartbreak',
                            'emoji': '💔',
                            'score': round(heartbreak_score * 100, 2)
                        }]
                    })
            
            # If love score is high enough, override the primary emotion
            if love_score > 0.3:
                grouped_emotions['primary_category'] = 'Loving 💝'
                # Add love to the categories if not present
                if not any(cat['name'] == 'Loving 💝' for cat in grouped_emotions['categories']):
                    grouped_emotions['categories'].append({
                        'name': 'Loving 💝',
                        'score': round(love_score * 100, 2),
                        'emotions': [{
                            'emotion': 'love',
                            'emoji': '💝',
                            'score': round(love_score * 100, 2)
                        }]
                    })
            
            # Get the primary emotion (highest score)
            primary_emotion = max(results, key=lambda x: x['score'])
            
            # Format the response with emojis
            response = {
                'primary_mood': grouped_emotions['primary_category'],
                'confidence': round(primary_emotion['score'] * 100, 2),
                'emotions': [
                    f"{map_emotion_to_category(emotion['label']).split(' ')[0]} {EMOTION_EMOJIS.get(emotion['label'], '')}"
                    for emotion in results
                    if emotion['score'] > 0.1
                ],
                'emotion_groups': grouped_emotions
            }
            
            # If calm was detected, add it to the emotions list
            if calm_score > 0.2:
                response['emotions'].append(f"calm 😌")
            
            # If motivation was detected, add it to the emotions list
            if motivation_score > 0.2:
                response['emotions'].append(f"motivation 💪")
            
            # If love was detected, add it to the emotions list
            if love_score > 0.3:
                response['emotions'].append(f"love 💝")
            
            # If heartbreak was detected, add it to the emotions list
            if heartbreak_score > 0.2:
                response['emotions'].append(f"heartbreak 💔")
            
            logger.info(f"Analysis response: {json.dumps(response, indent=2)}")
            return jsonify(response)

        except Exception as analysis_error:
            logger.error(f"Error during analysis: {str(analysis_error)}")
            return jsonify({
                'error': 'Failed to analyze text',
                'details': str(analysis_error)
            }), 500

    except Exception as e:
        logger.error(f"Error in analyze_mood endpoint: {str(e)}")
        return jsonify({
            'error': 'Failed to process request',
            'details': str(e)
        }), 500

@app.route('/api/music-feedback', methods=['POST'])
@jwt_required()
def submit_music_feedback():
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400

        # Validate required fields
        required_fields = ['playlist_id', 'mood_score']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Validate mood score
        mood_score = data.get('mood_score')
        if not isinstance(mood_score, int) or mood_score < 1 or mood_score > 10:
            return jsonify({
                'success': False,
                'error': 'Mood score must be an integer between 1 and 10'
            }), 400

        # Create feedback entry
        feedback = MusicFeedback(
            user_id=current_user_id,
            playlist_id=data['playlist_id'],
            mood_score=mood_score,
            feedback_text=data.get('feedback_text', '')
        )
        feedback.save()

        return jsonify({
            'success': True,
            'feedback': {
                'id': str(feedback.id),
                'playlist_id': feedback.playlist_id,
                'mood_score': feedback.mood_score,
                'feedback_text': feedback.feedback_text,
                'created_at': feedback.created_at.isoformat()
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/music-feedback', methods=['GET'])
@jwt_required()
def get_music_feedback():
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({
                'success': False,
                'error': 'Invalid or expired token'
            }), 401

        # Get all feedback entries for the user, ordered by creation date
        feedback_entries = MusicFeedback.objects(user_id=current_user_id).order_by('-created_at')
        
        # Format the response
        feedback_list = [{
            'id': str(feedback.id),
            'playlist_id': feedback.playlist_id,
            'mood_score': feedback.mood_score,
            'feedback_text': feedback.feedback_text,
            'created_at': feedback.created_at.isoformat()
        } for feedback in feedback_entries]

        return jsonify({
            'success': True,
            'feedback': feedback_list
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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
