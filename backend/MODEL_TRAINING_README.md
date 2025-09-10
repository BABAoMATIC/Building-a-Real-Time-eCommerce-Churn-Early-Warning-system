# Churn Prediction Model Training

This directory contains scripts for training a machine learning model to predict customer churn based on user event data.

## Files Overview

- **`train_model.py`** - Main training script
- **`test_model.py`** - Test script for the trained model
- **`app_with_ml.py`** - Flask API that uses the trained ML model
- **`sample_user_events.csv`** - Sample data format
- **`models/model.pkl`** - Trained model (created after training)

## Features Used for Training

The model uses the following features to predict churn:

1. **`event_type_encoded`** - Encoded event type (page_view, bounce, purchase, etc.)
2. **`session_length`** - Duration of user session in minutes
3. **`cart_items`** - Number of items in user's cart
4. **`time_since_last_event`** - Time since last user event in hours

## Data Format

The training script expects a CSV file with the following columns:

```csv
user_id,event_type,timestamp,session_length,cart_items,time_since_last_event,churn
user_0001,page_view,2024-01-15T10:30:00,5.2,0,2.5,0
user_0001,add_to_cart,2024-01-15T10:35:00,8.7,1,1.2,0
user_0002,bounce,2024-01-15T11:00:00,1.1,0,24.0,1
```

Where:
- `churn` is the target variable (1 = churned, 0 = not churned)
- `event_type` can be: page_view, add_to_cart, purchase, bounce, login, logout, search, product_view

## Usage

### 1. Train the Model

```bash
python train_model.py
```

This will:
- Generate dummy data if no CSV file exists
- Train a LogisticRegression model
- Save the model to `models/model.pkl`
- Display evaluation metrics

### 2. Test the Model

```bash
python test_model.py
```

This will load the trained model and test it with sample data.

### 3. Use with Flask API

```bash
python app_with_ml.py
```

This starts a Flask API that uses the trained ML model for predictions.

## Model Details

### Algorithm
- **LogisticRegression** from scikit-learn
- **StandardScaler** for feature normalization
- **LabelEncoder** for categorical features
- **Class balancing** to handle imbalanced data

### Evaluation Metrics
- Accuracy
- Precision, Recall, F1-score
- Confusion Matrix
- Feature importance (coefficients)

### Model Performance
The model typically achieves:
- Accuracy: ~85-90%
- Good precision and recall for churn prediction
- Balanced performance across different event types

## API Usage with ML Model

### Request Format
```json
{
    "user_id": "user_001",
    "event_type": "bounce",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
        "session_length": 1.5,
        "cart_items": 0,
        "time_since_last_event": 24.0
    }
}
```

### Response Format
```json
{
    "churn_score": 0.8234
}
```

## Dummy Data Generation

If no CSV file is provided, the script generates realistic dummy data with:

- **1000 users** with varying activity levels
- **50 events per user** on average
- **20% churn rate**
- **Realistic event patterns**:
  - Churners: More bounce events, shorter sessions
  - Non-churners: More purchases, longer sessions

## Model Persistence

The trained model is saved as a pickle file containing:
- Trained LogisticRegression model
- StandardScaler for feature normalization
- LabelEncoders for categorical features
- Feature column names
- Training timestamp

## Fallback Behavior

The Flask API includes fallback logic:
1. **Primary**: Use trained ML model if available
2. **Fallback**: Use simple rule-based logic (bounce=0.9, others=0.2)

This ensures the API works even if the model file is missing.

## Customization

### Adding New Features
1. Modify the `feature_columns` list in `ChurnModelTrainer`
2. Update the feature preparation logic in `prepare_features()`
3. Retrain the model

### Changing the Algorithm
Replace `LogisticRegression` with other scikit-learn classifiers:
- `RandomForestClassifier`
- `GradientBoostingClassifier`
- `SVC`

### Adjusting Data Generation
Modify the `generate_dummy_data()` method to:
- Change the number of users/events
- Adjust churn rates
- Add new event types
- Modify feature distributions

## Requirements

Make sure you have the required packages installed:

```bash
pip install pandas numpy scikit-learn joblib
```

## Troubleshooting

### Common Issues

1. **Model file not found**: Run `train_model.py` first
2. **Feature mismatch**: Ensure CSV has all required columns
3. **Memory issues**: Reduce the number of users in dummy data generation
4. **Poor performance**: Check data quality and feature engineering

### Debug Mode

Enable debug output by modifying the logging level in the training script.
