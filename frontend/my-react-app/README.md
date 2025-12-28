# RecomServe Frontend

React + Vite + Tailwind frontend for the ML Recommendation System.

## 🚀 Quick Start

1. **Run the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: `http://localhost:5173/`

---

## 📱 How to Use

### Step 1: Sign In
- Enter a **User ID (UUID)** from your database
- Example: `004deb95-9cc2-43e6-8445-14faae27a12f`

**Get a User ID:**
```sql
SELECT id FROM users LIMIT 1;
```

### Step 2: View Recommendations
- See personalized recommendations
- View title, category, tags, and scores

---

## 🔌 Required Services

Make sure these are running:
- **ML Service**: `http://localhost:8000`

```bash
cd ../../ml-service
python app/main.py
```

---

Built with React + Vite + Tailwind ❤️
