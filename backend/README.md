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
    "mood": "primary emotion",
    "confidence": 95.5,
    "emotions": ["emotion1", "emotion2", ...],
    "detailed_emotions": [
        {
            "emotion": "emotion1",
            "score": 95.5
        },
        ...
    ]
}
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
```

## Notes

- The first time you run the application, it will download the AI model which might take a few minutes depending on your internet connection.
- The model used is "j-hartmann/emotion-english-distilroberta-base" which is specifically trained for emotion analysis.
- The API returns both the primary emotion and a list of all detected emotions with their confidence scores. 