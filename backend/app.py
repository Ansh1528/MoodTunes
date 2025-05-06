from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import random
import pymysql
from config import Config
from models import db, User, JournalEntry

# Configure PyMySQL to be used with SQLAlchemy
pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token, 'user': {'username': user.username, 'email': user.email}}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token, 'user': {'username': user.username, 'email': user.email}}), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/journal', methods=['POST'])
@jwt_required()
def create_journal_entry():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400
    
    # Perform mood analysis
    mood_analysis = analyze_mood(data['content'])
    
    entry = JournalEntry(
        content=data['content'],
        mood_score=mood_analysis['score'],
        mood_tags=','.join(mood_analysis['tags']),
        user_id=current_user_id
    )
    
    db.session.add(entry)
    db.session.commit()
    
    return jsonify({
        'id': entry.id,
        'content': entry.content,
        'mood_analysis': mood_analysis,
        'created_at': entry.created_at.isoformat()
    }), 201

@app.route('/api/journal', methods=['GET'])
@jwt_required()
def get_journal_entries():
    current_user_id = get_jwt_identity()
    entries = JournalEntry.query.filter_by(user_id=current_user_id).order_by(JournalEntry.created_at.desc()).all()
    
    return jsonify([{
        'id': entry.id,
        'content': entry.content,
        'mood_score': entry.mood_score,
        'mood_tags': entry.mood_tags.split(',') if entry.mood_tags else [],
        'created_at': entry.created_at.isoformat()
    } for entry in entries]), 200

@app.route('/api/mood-analysis', methods=['POST'])
@jwt_required()
def mood_analysis():
    data = request.get_json()
    text = data.get('text', '')
    analysis = analyze_mood(text)
    return jsonify(analysis)

def analyze_mood(text):
    # Enhanced keyword-based mood analysis logic
    text = text.lower()
    mood_keywords = {
        'joy': ['happy', 'joy', 'excited', 'delighted', 'wonderful'],
        'sadness': ['sad', 'down', 'blue', 'depressed', 'unhappy'],
        'anger': ['angry', 'frustrated', 'annoyed', 'mad', 'irritated'],
        'fear': ['scared', 'anxious', 'worried', 'nervous', 'afraid'],
        'calm': ['peaceful', 'calm', 'relaxed', 'serene', 'tranquil']
    }
    
    # Calculate mood scores
    scores = {}
    for mood, keywords in mood_keywords.items():
        score = sum(1 for word in keywords if word in text)
        if score > 0:
            scores[mood] = score
    
    # Determine primary mood and intensity
    if scores:
        primary_mood = max(scores.items(), key=lambda x: x[1])[0]
        total_matches = sum(scores.values())
        intensity = min(total_matches / 5, 1.0)  # Normalize intensity to max 1.0
    else:
        primary_mood = 'neutral'
        intensity = 0.5
    
    # Get mood tags
    mood_tags = list(scores.keys()) if scores else ['neutral']
    
    return {
        'profile': {
            'primary': primary_mood,
            'secondary': mood_tags[1] if len(mood_tags) > 1 else primary_mood,
            'intensity': intensity
        },
        'tags': mood_tags,
        'score': intensity,
        'description': generate_mood_description(primary_mood, intensity),
        'emotionalBalance': 'Your emotional state shows good balance with room for growth.',
        'recentTrends': 'Analysis shows stable emotional patterns.'
    }

def generate_mood_description(mood, intensity):
    descriptions = {
        'joy': 'Your entry reflects positive emotions and optimism.',
        'sadness': 'Your entry suggests feelings of melancholy or reflection.',
        'anger': 'Your words indicate frustration or displeasure.',
        'fear': 'Your entry reveals concerns or anticipation.',
        'calm': 'Your writing shows a peaceful and balanced state of mind.',
        'neutral': 'Your entry maintains a balanced and moderate tone.'
    }
    
    intensity_desc = 'strongly ' if intensity > 0.7 else 'moderately ' if intensity > 0.4 else 'slightly '
    return f"You are {intensity_desc}expressing {descriptions.get(mood, 'neutral emotions')}"

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "Welcome to the Flask API!"})

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
