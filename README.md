# RecomServe - ML-Powered Recommendation System

A production-ready recommendation system using Non-negative Matrix Factorization (NMF) for collaborative filtering, trained on real MovieLens movie data.

## Overview

Scalable recommendation engine with microservices architecture, handling cold-start scenarios and providing personalized content recommendations with comprehensive testing coverage.

### Key Features

- **Collaborative Filtering**: NMF-based matrix factorization for personalized recommendations
- **Cold Start Handling**: Popularity-based fallback for new users
- **Microservices Architecture**: Separate ML service and web API for independent scaling
- **Production-Ready**: Input validation, error handling, and unit tests

### Performance Metrics

- **RMSE**: 0.818
- **MAE**: 0.404
- **Model**: NMF with 20 latent factors, trained on 1,177 user-item interactions

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
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  ML Service     │ (FastAPI/Python)
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│  PostgreSQL     │
└─────────────────┘
```

### Technology Stack

**ML Service**
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

## Run Locally (Quick Start)

```bash
# 1. Clone and setup
git clone https://github.com/yourusername/RecomServe.git
cd RecomServe/recommendation-system

# 2. Database
createdb recomserve
psql -d recomserve -f database/schema.sql

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. ML Service
cd ml-service
pip install -r requirements.txt
python import_movielens.py  # Import dataset
python app/train.py          # Train model
python app/main.py           # Start service (port 8000)

# 5. Backend (new terminal)
cd backend
npm install && npm start     # Port 3000

# 6. Frontend (new terminal)
cd frontend/my-react-app
npm install && npm run dev   # Port 5173
```

Visit `http://localhost:5173`

---

## ML Service API

### Get Recommendations

**Endpoint**: `GET /recommendations/{user_id}?n=10`

**Request**:
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

**Cold Start**: Returns popular content with `is_personalized: false` for unknown users.

---

## Project Structure

```
recommendation-system/
├── database/              # PostgreSQL schema
├── backend/               # Node.js API (Express)
├── ml-service/            # Python ML service (FastAPI)
│   ├── app/              # Core application
│   ├── tests/            # Unit tests
│   └── import_movielens.py
└── frontend/             # React application
```

---

## Deployment

### Docker

Test locally with Docker Compose:

```bash
docker-compose up --build
```

Visit `http://localhost`

### Render (Free Hosting)

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step Render deployment guide.

**Quick**: Push to GitHub, connect to Render, deploy database + 3 services (~30 min)

---

## Testing

```bash
cd ml-service
pytest tests/ -v
```

8 tests covering validation, cold start, edge cases (100% pass rate)

---

## Contact

For questions or issues, open a GitHub issue.
