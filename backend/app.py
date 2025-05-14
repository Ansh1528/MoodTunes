import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
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
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Invalid request format'}), 422
        if 'content' not in data:
            return jsonify({'success': False, 'error': 'Content is required'}), 400
        content = data['content'].strip()        
        if not content:
            return jsonify({'success': False, 'error': 'Content cannot be empty'}), 400
        try:
            entry = JournalEntry(
                content=content,
                user_id=current_user_id
            )
            db.session.add(entry)            
            db.session.commit()
            response_entry = {
                'id': entry.id,
                'content': entry.content,
                'created_at': entry.created_at.isoformat()
            }
            return jsonify({
                'success': True,
                'entry': response_entry
            }), 201
        except Exception as inner_e:
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': 'Failed to save journal entry: ' + str(inner_e)
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/journal', methods=['GET'])
@jwt_required()
def get_journal_entries():
    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401
        entries = JournalEntry.query.filter_by(user_id=current_user_id).order_by(JournalEntry.created_at.desc()).all()
        response_entries = [{
            'id': entry.id,
            'content': entry.content,
            'created_at': entry.created_at.isoformat()
        } for entry in entries]
        return jsonify(response_entries), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
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

@app.route('/api/mood-history/<int:user_id>', methods=['GET'])
@jwt_required()
def get_mood_history(user_id):
    try:
        # Verify the requesting user is getting their own history
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.created_at.desc()).all()
        history = [{'created_at': entry.created_at.isoformat()} for entry in entries]
        return jsonify(history)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
