from flask_mongoengine import MongoEngine
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json

db = MongoEngine()

class User(db.Document):
    username = db.StringField(max_length=80, unique=True, required=True)
    email = db.StringField(max_length=120, unique=True, required=True)
    password_hash = db.StringField(max_length=256, required=True)
    created_at = db.DateTimeField(default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class JournalEntry(db.Document):
    content = db.StringField(required=True)
    created_at = db.DateTimeField(default=datetime.now)
    user_id = db.ReferenceField('User', required=True)
    mood_data = db.DictField()
    meta = {
        'collection': 'journal_entries',
        'indexes': [
            'user_id',
            'created_at'
        ]
    }
    
    def set_mood(self, mood_data):
        """Set mood data with validation"""
        if not isinstance(mood_data, dict):
            raise ValueError('Mood data must be an object')
            
        # Validate required fields
        required_fields = ['primary_mood', 'confidence']
        missing_fields = [field for field in required_fields if field not in mood_data]
        if missing_fields:
            raise ValueError(f'Missing required fields in mood data: {", ".join(missing_fields)}')
        
        # Validate primary_mood
        primary_mood = mood_data.get('primary_mood')
        if not primary_mood or not isinstance(primary_mood, str):
            raise ValueError('Primary mood must be a non-empty string')
        
        # Validate confidence
        confidence = mood_data.get('confidence')
        if confidence is None:
            raise ValueError('Confidence value is required')
        try:
            confidence_float = float(confidence)
            if confidence_float <= 0 or confidence_float > 100:
                raise ValueError(f'Confidence must be between 0 and 100, got {confidence_float}')
        except (TypeError, ValueError):
            raise ValueError(f'Invalid confidence value: {confidence}')
        
        # Validate emotions
        emotions = mood_data.get('emotions', [])
        if not isinstance(emotions, list):
            raise ValueError('Emotions must be an array')
        
        # Clean and validate each emotion
        cleaned_emotions = []
        for emotion in emotions:
            if not isinstance(emotion, str):
                raise ValueError('Each emotion must be a string')
            cleaned_emotion = str(emotion).strip()
            if cleaned_emotion:
                cleaned_emotions.append(cleaned_emotion)
        
        # Store validated mood data
        self.mood_data = {
            'primary_mood': primary_mood.strip(),
            'confidence': round(confidence_float, 2),
            'emotions': cleaned_emotions
        }
    
    def get_mood(self):
        """Get mood data"""
        return self.mood_data if self.mood_data else None

class MusicFeedback(db.Document):
    user_id = db.ReferenceField('User', required=True)
    playlist_id = db.StringField(required=True)
    mood_score = db.IntField(required=True, min_value=1, max_value=10)
    feedback_text = db.StringField()
    created_at = db.DateTimeField(default=datetime.now)
    meta = {
        'collection': 'music_feedback',
        'indexes': [
            'user_id',
            'created_at'
        ]
    }