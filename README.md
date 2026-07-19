# 🚀 How to Run – AI Government Scheme Recommender

## ✅ Prerequisites (Install These First)
Before running the project, make sure you have these installed:

| Tool | Download Link |
|------|--------------|
| **Docker Desktop** | https://www.docker.com/products/docker-desktop |

> ⚠️ Make sure **Docker Desktop is running** before you start!

---

## 📁 Step 1: Get the Project
Copy the project folder shared by Pallavi. The folder name is:
```
AI_Government_Scheme_Recommender/
```

---

## ▶️ Step 2: Start the Project
1. Open **Command Prompt** or **PowerShell**
2. Navigate into the project folder:
```bash
cd path\to\AI_Government_Scheme_Recommender
```
3. Run this single command:
```bash
docker-compose up -d
```

This will automatically start:
- ✅ Frontend (React UI)
- ✅ Backend (Node.js API)
- ✅ AI Module (Python ML)
- ✅ Database (MySQL)

> ⏳ **First time only:** May take 3–5 minutes to download. Be patient!

---

## 🌐 Step 3: Open the App
Once started, open your browser and go to:

| Service | URL |
|---------|-----|
| 🌐 **Main App** | http://localhost |
| 🔧 **Backend API** | http://localhost:5000 |
| 📊 **Power BI Export** | http://localhost:5000/api/powerbi/export |

---

## 🔑 Step 4: Login
Use these ready-made credentials:

| Field | Value |
|-------|-------|
| **Email** | `newtest@gmail.com` |
| **Password** | `password` |

> Or click **Register** on the login page to create your own account!

---

## 🛑 Step 5: Stop the Project When Done
Run this to cleanly shut everything down:
```bash
docker-compose down
```

---

## ❓ Troubleshooting

| Problem | Fix |
|---------|-----|
| Docker not found | Install Docker Desktop and make sure it is **running** (check system tray) |
| Port 80 already in use | Restart your PC or stop any other web server |
| Page not loading | Wait 2 more minutes, then refresh the browser |
| Login not working | Use `newtest@gmail.com` / `password` or register a new account |
| Database error | Run `docker-compose down` then `docker-compose up -d` again |
