# Flask Churn Prediction API

A simple Flask API for predicting customer churn based on user events using rule-based logic.

## Features

- **POST /predict-churn**: Predict churn score for a user based on event data
- **GET /health**: Health check endpoint
- **CORS enabled**: Cross-origin requests supported
- **Environment configuration**: Loads settings from .env file
- **Console logging**: Prints each prediction to console

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file (optional):
```bash
FLASK_PORT=5000
FLASK_DEBUG=True
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

## Usage

### Start the API Server

```bash
python app.py
```

The server will start on `http://localhost:5000` by default.

### API Endpoints

#### POST /predict-churn

Predict churn score for a user based on event data.

**Input JSON:**
```json
{
    "user_id": "string",
    "event_type": "string", 
    "timestamp": "string",
    "metadata": {}
}
```

**Output JSON:**
```json
{
    "churn_score": 0.9
}
```

**Rule-based Logic:**
- `bounce` events → churn_score = 0.9
- All other events → churn_score = 0.2

**Example Request:**
```bash
curl -X POST http://localhost:5000/predict-churn \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "event_type": "bounce",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {"page": "/checkout"}
  }'
```

**Example Response:**
```json
{
    "churn_score": 0.9
}
```

#### GET /health

Health check endpoint.

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.123456",
    "service": "churn-prediction-api"
}
```

## Testing

Run the test script to verify the API:

```bash
python test_api.py
```

This will test various event types and show the console output for each prediction.

## Configuration

The API loads configuration from environment variables with the following defaults:

- `FLASK_PORT`: 5000
- `FLASK_DEBUG`: False
- `FLASK_ENV`: development
- `SECRET_KEY`: dev-secret-key

## Console Output

Each prediction is logged to the console with the following format:
```
[2024-01-15T10:30:00.123456] Prediction - User: user_001, Event: bounce, Churn Score: 0.9
```
