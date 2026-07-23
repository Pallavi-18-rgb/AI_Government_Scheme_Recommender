# 🌐 Free 24/7 Cloud Deployment Guide (For LinkedIn & Resume)

This guide walks you through deploying your **AI Government Scheme Recommender** to free cloud services so anyone can access it **anytime, anywhere** from LinkedIn or your resume.

---

## 🛠️ Stack Overview (100% Free Tier)

| Component | Recommended Cloud Provider | Free Tier Benefits |
| :--- | :--- | :--- |
| **Frontend** (React + Vite) | **Vercel** or **Netlify** | Fast CDN, 24/7 online, custom domain support |
| **Backend API** (Node.js) | **Render** or **Koyeb** | Free Docker/Web Service hosting |
| **AI Module** (Python / Flask) | **Render** or **Koyeb** | Free Docker/Python Web Service hosting |
| **Database** (MySQL) | **TiDB Cloud** or **Aiven** | Free MySQL Cloud Database |

---

## Step 1: Push Code to GitHub

1. Create a repository on GitHub (e.g. `AI_Government_Scheme_Recommender`).
2. Run the following commands in your terminal:

```bash
git init
git add .
git commit -m "Deploy: Cloud ready AI Scheme Recommender"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/AI_Government_Scheme_Recommender.git
git push -u origin main
```

---

## Step 2: Create a Free Cloud MySQL Database (TiDB Cloud / Aiven)

1. Sign up at **[TiDB Cloud](https://tidbcloud.com/)** or **[Aiven](https://aiven.io/)** (Free Serverless Tier).
2. Create a new **MySQL** database cluster named `welfare_assistant`.
3. Note your connection details:
   - `DB_HOST`: (e.g. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`)
   - `DB_PORT`: `4000` (or `3306`)
   - `DB_USER`: Your username
   - `DB_PASSWORD`: Your password
   - `DB_NAME`: `welfare_assistant`
   - `DB_SSL`: `true`
4. Open the SQL editor on TiDB / Aiven or connect via MySQL Workbench, and run the SQL contents of `dataset/init.sql` to populate all tables and sample schemes.

---

## Step 3: Deploy Backend API on Render

1. Go to **[Render.com](https://render.com/)** and log in with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your `AI_Government_Scheme_Recommender` repository.
4. Set the root directory to `backend`.
5. Configuration:
   - **Name**: `govscheme-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add **Environment Variables**:
   - `DB_HOST` = Your cloud DB host
   - `DB_PORT` = Your cloud DB port
   - `DB_USER` = Your cloud DB user
   - `DB_PASSWORD` = Your cloud DB password
   - `DB_NAME` = `welfare_assistant`
   - `DB_SSL` = `true`
   - `JWT_SECRET` = `super_secret_jwt_key_govscheme_2026`
   - `AI_SERVICE_URL` = (Set after Step 4, e.g. `https://govscheme-ai.onrender.com/api/recommend`)
7. Click **Create Web Service**. Copy the generated URL (e.g. `https://govscheme-backend.onrender.com`).

---

## Step 4: Deploy AI Module on Render

1. On Render, click **New +** -> **Web Service**.
2. Connect the same repository, set root directory to `ai_module`.
3. Configuration:
   - **Name**: `govscheme-ai`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Add **Environment Variables**:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
5. Click **Create Web Service**. Copy the generated URL (e.g. `https://govscheme-ai.onrender.com`).
6. Update `AI_SERVICE_URL` in your **govscheme-backend** environment variables on Render to `https://govscheme-ai.onrender.com/api/recommend`.

---

## Step 5: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com/)** and log in with GitHub.
2. Click **Add New** -> **Project**, import your repository.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Expand **Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://govscheme-backend.onrender.com/api`
6. Click **Deploy**.
7. Vercel will build and give you a permanent live URL (e.g. `https://govscheme-recommender.vercel.app`).

---

## 🎯 Final Verification & Resume / LinkedIn Copy

Once deployed, your application is live 24/7!

### Demo Credentials to post on LinkedIn:
- **Live URL**: `https://your-app-name.vercel.app`
- **Email**: `newtest@gmail.com`
- **Password**: `password`
- *(Users can also register a new account instantly)*
