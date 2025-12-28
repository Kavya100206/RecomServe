# Render Deployment Guide

## Prerequisites

1. GitHub account
2. Render account (sign up at render.com - free)
3. Push your code to GitHub

---

## Step 1: Push to GitHub

```bash
cd e:\SCALER\Projects\RecomServe\recommendation-system

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit: RecomServe ML Recommendation System"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/RecomServe.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

---

## Step 3: Deploy PostgreSQL Database

1. From Render Dashboard, click **New +**
2. Select **PostgreSQL**
3. Configure:
   - **Name**: `recomserve-db`
   - **Database**: `recomserve`
   - **User**: `recomserve_user`
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Click **Create Database**
5. **Copy Internal Database URL** (starts with `postgresql://`)

---

## Step 4: Deploy ML Service

1. Click **New +** > **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `recomserve-ml`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `ml-service`
   - **Runtime**: `Docker` ⚠️ **CRITICAL: Must be Docker, not Python!**
   - **Dockerfile Path**: `Dockerfile` (should auto-detect)
   - **Plan**: **Free**

4. **Environment Variables**:
   - Click **Add Environment Variable**
   - Key: `DATABASE_URL`
   - Value: Paste Internal Database URL from Step 3

5. Click **Create Web Service**

6. **Important**: After deployment, run commands to setup data:
   - Go to service page > **Shell** tab
   - Run:
     ```bash
     python import_movielens.py
     python app/train.py
     ```

> **Note**: If you accidentally selected Python runtime, go to Settings > Build & Deploy > Change Runtime to `Docker` > Save > Manual Deploy

---

## Step 5: Deploy Backend API

1. Click **New +** > **Web Service**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `recomserve-backend`
   - **Region**: Same as others
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: **Free**

4. **Environment Variables**:
   - `DATABASE_URL`: Same as ML service
   - `ML_SERVICE_URL`: `https://recomserve-ml.onrender.com`
   - `NODE_ENV`: `production`

5. Click **Create Web Service**

---

## Step 6: Deploy Frontend

1. Click **New +** > **Static Site**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `recomserve-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend/my-react-app`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   - `VITE_API_URL`: `https://recomserve-backend.onrender.com`

5. Click **Create Static Site**

---

## Step 7: Update Frontend API Configuration

Update `frontend/my-react-app/src/services/api.js`:

```javascript
const ML_API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Commit and push:
```bash
git add .
git commit -m "Update API URL for production"
git push
```

Render will auto-deploy the changes.

---

## Your Live URLs

After deployment completes:

- **Frontend**: `https://recomserve-frontend.onrender.com`
- **Backend API**: `https://recomserve-backend.onrender.com`
- **ML Service**: `https://recomserve-ml.onrender.com`

---

## Important Notes

### Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month free (enough for demo)

### Cold Start Workaround

Add to README:
> "Note: First load may take 30 seconds as services wake up from sleep (free tier limitation)"

### Keeping Services Awake (Optional)

Use a service like UptimeRobot to ping your services every 14 minutes.

---

## Troubleshooting

### Build Failed

Check build logs in Render dashboard. Common issues:
- Missing dependencies in requirements.txt or package.json
- Incorrect Root Directory path
- Environment variables not set

### Database Connection Error

- Verify DATABASE_URL is correct
- Check database is in same region as services
- Use Internal URL (not External URL)

### ML Service: Model Not Found

Run setup commands in Shell:
```bash
python import_movielens.py
python app/train.py
```

### Python Version Error (scikit-surprise)

**Error**: `error: subprocess-exited-with-error` with Cython compilation errors

**Cause**: Render is using Python runtime instead of Docker runtime

**Solution**:
1. Go to your ML service in Render
2. Click **Settings** > **Build & Deploy**
3. Change **Runtime** to `Docker`
4. Click **Manual Deploy** > **Deploy latest commit**

**Alternative**: If the issue persists, the codebase has been updated to remove `scikit-surprise` dependency (it wasn't being used)

---

## Monitoring

1. Go to each service in Render
2. Click **Metrics** tab
3. Monitor:
   - Request count
   - Response time
   - Error rate

---

## Updating Deployment

Any push to `main` branch will auto-deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

Render detects changes and redeploys automatically.

---

**Deployment Time**: ~20-30 minutes total

**Status**: Your ML recommendation system is now live and shareable!
