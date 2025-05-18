# Mood Analysis Backend

This is the backend service for the journal application that provides AI-powered mood analysis using transformers and PyTorch.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

- Windows:

```bash
venv\Scripts\activate
```

- Unix/MacOS:

```bash
source venv/bin/activate

```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

1. Make sure your virtual environment is activated
2. Run the Flask application:

```bash
python app.py
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### POST /api/analyze-mood
Analyzes the mood of the provided text using AI.

Request body:
```json
{
    "text": "Your journal entry text here"
}
```

Response:
```json
{
    "primary_mood": "joy",
    "confidence": 95.5,
    "emotions": ["joy", "optimism", "excitement"]
}
```

### POST /api/journal
Save a journal entry with optional mood analysis.

Request body:
```json
{
    "content": "Your journal entry text",
    "mood": {
        "primary_mood": "joy",
        "confidence": 95.5,
        "emotions": ["joy", "optimism", "excitement"]
    }
}
```

Response:
```json
{
    "success": true,
    "entry": {
        "id": 1,
        "content": "Your journal entry text",
        "created_at": "2024-03-21T10:30:00Z",
        "mood": {
            "primary_mood": "joy",
            "confidence": 95.5,
            "emotions": ["joy", "optimism", "excitement"]
        }
    }
}
```

### GET /api/journal
Retrieve all journal entries for the authenticated user.

Response:
```json
[
    {
        "id": 1,
        "content": "Your journal entry text",
        "created_at": "2024-03-21T10:30:00Z",
        "mood": {
            "primary_mood": "joy",
            "confidence": 95.5,
            "emotions": ["joy", "optimism", "excitement"]
        }
    }
]
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=moodtunes_db
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
```

## Notes

- The first time you run the application, it will download the AI model which might take a few minutes depending on your internet connection.
- The model used is "j-hartmann/emotion-english-distilroberta-base" which is specifically trained for emotion analysis.
- All API endpoints except `/api/analyze-mood` require JWT authentication via the `Authorization: Bearer <token>` header.
- The mood analysis returns confidence scores as percentages (0-100).
- Emotions with confidence scores below 10% are filtered out from the results. 