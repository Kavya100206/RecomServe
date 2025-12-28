# RecomServe - ML-Powered Recommendation System

A production-ready recommendation system leveraging collaborative filtering with Non-negative Matrix Factorization (NMF) to deliver personalized content recommendations. Built with a microservices architecture separating the ML inference layer from the web API layer.

## Overview

RecomServe implements a scalable recommendation engine trained on real-world MovieLens data. The system handles cold-start scenarios, provides personalized recommendations, and includes comprehensive testing coverage.

### Key Features

- **Collaborative Filtering**: NMF-based matrix factorization for personalized recommendations
- **Cold Start Handling**: Fallback to popularity-based recommendations for new users
- **Microservices Architecture**: Separate ML service and web API for independent scaling
- **Real Dataset**: Trained on MovieLens 100k dataset (100 users, 200 movies, 1,177 ratings)
- **Production-Ready**: Input validation, error handling, unit tests, and proper logging

### Performance Metrics

- **RMSE**: 0.818 (excellent for collaborative filtering)
- **MAE**: 0.404
- **Training Data**: 1,177 user-item interactions
- **Model**: NMF with 20 latent factors

---

## Architecture

### System Components

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Backend API    │ (Node.js/Express)
│  Port: 3000     │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  ML Service     │ (FastAPI/Python)
│  Port: 8000     │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  Port: 5432     │
└─────────────────┘
```

### Technology Stack

**ML Service** (Primary Focus)
- **Language**: Python 3.8+
- **Framework**: FastAPI
- **ML Library**: scikit-learn (NMF)
- **Data Processing**: pandas, NumPy
- **Database Driver**: psycopg2

**Backend API**
- **Language**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL 13+
- **ORM**: Native pg driver

**Frontend**
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

---

## Database Schema

### Tables

**users**
```sql
id            UUID PRIMARY KEY
created_at    TIMESTAMP DEFAULT NOW()
metadata      JSONB (age, gender, occupation, etc.)
```

**content**
```sql
id            UUID PRIMARY KEY
title         VARCHAR(255)
category      VARCHAR(100)
tags          TEXT[]
created_at    TIMESTAMP DEFAULT NOW()
metadata      JSONB
```

**interactions**
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
content_id    UUID REFERENCES content(id)
event_type    VARCHAR(50) ('rating', 'view', 'click')
value         FLOAT (rating value 1-5)
created_at    TIMESTAMP DEFAULT NOW()
```

**models**
```sql
id            UUID PRIMARY KEY
version       VARCHAR(50) UNIQUE
algorithm     VARCHAR(100)
trained_at    TIMESTAMP DEFAULT NOW()
is_active     BOOLEAN DEFAULT FALSE
metrics       JSONB (RMSE, MAE, etc.)
parameters    JSONB (n_components, max_iter, etc.)
```

---

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- PostgreSQL 13 or higher
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/RecomServe.git
cd RecomServe/recommendation-system
```

### 2. Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE recomserve;
```

Apply schema:

```bash
psql -U postgres -d recomserve -f database/schema.sql
```

### 3. Environment Configuration

Copy environment template:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/recomserve
```

### 4. ML Service Setup

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Import MovieLens Dataset

```bash
python import_movielens.py
```

This script will:
- Download MovieLens 100k dataset (5MB)
- Extract and parse data files
- Sample 100 users and 200 movies
- Filter to 1,177 relevant ratings
- Insert data into PostgreSQL

Expected output:
```
Users: 100
Movies: 200
Ratings: 1,177
```

### 6. Train ML Model

```bash
python app/train.py
```

Training process:
- Loads interaction data from database
- Converts to user-item matrix
- Trains NMF model (20 components, 200 iterations)
- Evaluates on test set
- Saves model to `models/nmf_model_v1.0.pkl`
- Stores metadata in database

Expected metrics:
```
RMSE: ~0.82
MAE: ~0.40
```

### 7. Start ML Service

```bash
python app/main.py
```

Service will start on `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 8. Backend API Setup

```bash
cd ../backend

# Install dependencies
npm install

# Start server
npm start
```

Backend will start on `http://localhost:3000`

### 9. Frontend Setup

```bash
cd ../frontend/my-react-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## ML Service API Endpoints

### Get Recommendations

**Endpoint**: `GET /recommendations/{user_id}`

**Parameters**:
- `user_id` (path): User UUID (required)
- `n` (query): Number of recommendations (default: 10)

**Request Example**:
```bash
curl http://localhost:8000/recommendations/004deb95-9cc2-43e6-8445-14faae27a12f?n=5
```

**Response**:
```json
{
  "user_id": "004deb95-9cc2-43e6-8445-14faae27a12f",
  "recommendations": [
    {
      "content_id": "09082582-...",
      "title": "Toy Story (1995)",
      "category": "Animation",
      "tags": ["Animation", "Children's", "Comedy"],
      "score": 4.25
    }
  ],
  "model_version": "v1.0",
  "count": 5,
  "is_personalized": true
}
```

**Error Handling**:
- Invalid UUID: `400 Bad Request`
- User not found: Returns popular content with `is_personalized: false`
- Negative count: `400 Bad Request`

### Get Model Information

**Endpoint**: `GET /recommendations/model/info`

**Response**:
```json
{
  "loaded": true,
  "version": "v1.0",
  "users_count": 100,
  "content_count": 200
}
```

---

## ML Model Details

### Algorithm: Non-negative Matrix Factorization (NMF)

NMF decomposes the user-item interaction matrix into two lower-rank matrices:

```
R ≈ W × H

Where:
R = User-Item Matrix (m users × n items)
W = User Feature Matrix (m × k)
H = Item Feature Matrix (k × n)
k = Number of latent factors (20)
```

### Training Pipeline

1. **Data Loading**: Fetch interactions from PostgreSQL
2. **Preprocessing**: Convert to sparse user-item matrix (100 × 200)
3. **Train-Test Split**: 80% training, 20% testing
4. **Model Training**: NMF with 200 iterations
5. **Evaluation**: Calculate RMSE and MAE on test set
6. **Persistence**: Save model using pickle, store metadata in database

### Hyperparameters

```python
{
  "n_components": 20,        # Latent factors
  "init": "random",          # Initialization method
  "random_state": 42,        # Reproducibility
  "max_iter": 200,           # Maximum iterations
  "alpha": 0.0,              # Regularization parameter
  "l1_ratio": 0.0            # L1/L2 ratio
}
```

### Cold Start Strategy

When user is not in training data:
1. Query most popular items (highest avg rating)
2. Filter items with minimum 3 interactions
3. Return top N items by popularity
4. Set `is_personalized: false` in response

---

## Testing

### Run Unit Tests

```bash
cd ml-service
pytest tests/ -v
```

### Test Coverage

**Current Coverage**: 8 tests (100% pass rate)

Tests include:
- Valid user recommendations
- Invalid UUID handling
- Cold start user scenarios
- Edge cases (zero/negative counts)
- Large count requests
- Response format validation
- Model information retrieval

### Test Files

- `tests/test_recommendation_service.py`: Core service tests
- `tests/conftest.py`: Pytest configuration

---

## Project Structure

```
recommendation-system/
├── .env.example            # Environment template
├── .gitignore             # Git exclusions
├── README.md              # This file
│
├── database/
│   └── schema.sql         # PostgreSQL schema
│
├── backend/               # Node.js API
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── models/       # Data models
│   │   └── routes/       # API routes
│   └── package.json
│
├── ml-service/            # Python ML service
│   ├── app/
│   │   ├── main.py                    # FastAPI application
│   │   ├── train.py                   # Model training script
│   │   ├── model_manager.py           # Model loading/versioning
│   │   ├── data_loader.py             # Database data loading
│   │   ├── preprocessor.py            # Data preprocessing
│   │   ├── routes/
│   │   │   └── recommendations.py     # API routes
│   │   └── services/
│   │       └── recommendation_service.py  # Core logic
│   ├── tests/
│   │   └── test_recommendation_service.py
│   ├── models/                        # Trained models (gitignored)
│   ├── datasets/                      # MovieLens data (gitignored)
│   ├── import_movielens.py           # Dataset import script
│   ├── get_movielens_user.py         # Get sample user IDs
│   └── requirements.txt               # Python dependencies
│
└── frontend/
    └── my-react-app/      # React application
        ├── src/
        │   ├── pages/     # React pages
        │   └── services/  # API client
        └── package.json
```

---

## Development Workflow

### Adding New Features

1. **Update Database Schema** (if needed)
   ```bash
   psql -d recomserve -f database/migrations/add_feature.sql
   ```

2. **Modify ML Service**
   - Update `recommendation_service.py` for new logic
   - Add tests in `tests/`
   - Run `pytest tests/ -v`

3. **Update Backend API**
   - Add routes in `backend/src/routes/`
   - Update controllers and models

4. **Update Frontend**
   - Add React components in `frontend/src/`
   - Update API client in `services/api.js`

### Retraining Model

```bash
cd ml-service
python app/train.py
```

The training script automatically:
- Loads latest data from database
- Trains new model
- Evaluates performance
- Saves versioned model file
- Updates database with new model metadata
- Marks new model as active

### Debugging

**Enable verbose logging**:

In `ml-service/app/main.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Check model loading**:
```bash
python -c "from app.model_manager import ModelManager; mm = ModelManager(); mm.load_model(); print(mm.loaded_version)"
```

---

## Deployment Considerations

### Environment Variables

Production `.env` should include:
```env
DATABASE_URL=postgresql://user:password@prod-host:5432/recomserve
ML_SERVICE_URL=http://ml-service:8000
NODE_ENV=production
```

### Docker Deployment

Build images:
```bash
docker build -t recomserve-ml ./ml-service
docker build -t recomserve-backend ./backend
docker build -t recomserve-frontend ./frontend/my-react-app
```

### Scaling

- **ML Service**: Stateless, can scale horizontally
- **Backend API**: Stateless, load balance with Nginx
- **Database**: Use connection pooling (recommended: 20 connections)
- **Model Loading**: Models loaded into memory on startup (warmup time: ~2s)

### Security

- All UUIDs validated before database queries
- Input sanitization for SQL injection prevention
- CORS configured for production domains
- Environment variables for sensitive data
- Rate limiting recommended for production

---

## Performance Optimization

### Implemented Optimizations

1. **Model Caching**: Model loaded once at startup, kept in memory
2. **Database Indexing**: Indexes on user_id, content_id, created_at
3. **Batch Processing**: Content details fetched in single query
4. **Connection Pooling**: PostgreSQL connection reuse

### Benchmarks

- Average recommendation latency: ~200ms
- Cold start latency: ~150ms (popularity-based)
- Database query time: ~50ms
- Model inference: ~100ms

---

## Troubleshooting

### Issue: "psycopg2 not found"

```bash
pip install psycopg2-binary
```

### Issue: "Model file not found"

Ensure model is trained:
```bash
python app/train.py
```

### Issue: "Database connection failed"

Check `.env` and verify PostgreSQL is running:
```bash
psql -U postgres -d recomserve -c "SELECT 1;"
```

### Issue: "No recommendations returned"

Check if user exists:
```bash
python get_movielens_user.py
```

Use returned UUID in API call.

---

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/name`)
3. Implement changes with tests
4. Run test suite (`pytest tests/ -v`)
5. Commit changes (`git commit -m 'Add feature'`)
6. Push branch (`git push origin feature/name`)
7. Open Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- MovieLens dataset provided by GroupLens Research
- NMF implementation from scikit-learn
- FastAPI framework for ML service architecture

---

## Contact

For questions or issues, please open a GitHub issue or contact the maintainers.
