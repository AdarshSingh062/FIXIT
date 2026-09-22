# 🚀 Deploy FixIt Server to Render (Step-by-Step Guide)

This guide walks you through deploying the **FixIt Backend API** (and optionally the React frontend) to [Render](https://render.com) in minutes.

---

## 📋 Quick Deployment Summary

| Setting | Value |
| :--- | :--- |
| **Service Type** | Web Service |
| **Environment** | Node |
| **Region** | Oregon (US West) or Frankfurt (EU) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

---

## 🛠️ Step 1: Push Code to GitHub

Make sure all your latest changes and the new `render.yaml` configuration are pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: configure render deployment and blueprint"
git push origin main
```

---

## 🗄️ Step 2: Set Up Free MongoDB Atlas Database

Render web services are stateless, so you need a cloud MongoDB database (Free 512MB M0 cluster):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and log in or sign up.
2. Create a **Free Shared Cluster (M0)**.
3. Under **Database Access**, create a user (e.g. username: `fixit_admin`, password: `<strong-password>`).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. In your Database dashboard, click **Connect** → **Drivers (Node.js)** → Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fixit_db?retryWrites=true&w=majority
   ```
   *(Replace `<username>`, `<password>`, and set database name to `fixit_db`)*.

---

## 🚀 Step 3: Deploy to Render (2 Methods)

### Method A: 1-Click Render Blueprint (Recommended)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** (top right) → select **Blueprint**.
3. Connect your GitHub account and select your repository (`AdarshSingh062/FIXIT`).
4. Render will automatically detect `render.yaml`.
5. Enter your `MONGO_URI` connection string when prompted.
6. Click **Apply**. Render will automatically build and deploy `fixit-server` and `fixit-client`!

---

### Method B: Manual Web Service Creation

If you prefer setting up only the backend server manually:

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** → Select `FIXIT`.
3. Configure the following fields:
   - **Name**: `fixit-server` (or your preferred name)
   - **Region**: Oregon (or nearest to you)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** and set **Health Check Path** to `/api/health`.
5. Under **Environment Variables**, click **Add Environment Variable** and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | *(Random 32+ char secret)* | Secret for signing JWT authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |
| `CLIENT_URL` | `*` (or your frontend URL) | Allowed CORS origins (comma-separated if multiple) |
| `CLOUDINARY_CLOUD_NAME` | *(Optional)* | For cloud image uploads |
| `CLOUDINARY_API_KEY` | *(Optional)* | For cloud image uploads |
| `CLOUDINARY_API_SECRET` | *(Optional)* | For cloud image uploads |
| `EMAIL_HOST` | `smtp.ethereal.email` | Or your SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | *(Optional)* | SMTP username |
| `EMAIL_PASSWORD` | *(Optional)* | SMTP app password |
| `EMAIL_FROM` | `FixIt Platform <support@fixit.org>` | Sender email header |

6. Click **Create Web Service**.

---

## 🧪 Step 4: Verify Deployment

1. Once deployment succeeds (status shows `Live`), copy your Render service URL (e.g. `https://fixit-server.onrender.com`).
2. Test the health check endpoint in your browser or curl:
   ```bash
   curl https://fixit-server.onrender.com/api/health
   ```
   **Expected Response**:
   ```json
   {
     "status": "OK",
     "message": "FixIt API server is healthy and running",
     "timestamp": "2026-09-22T...",
     "env": "production"
   }
   ```
3. Test the category API endpoint:
   ```bash
   curl https://fixit-server.onrender.com/api/categories
   ```

---

## 🔗 Step 5: Connect Frontend to Render Server

If your React frontend is hosted on Vercel, Netlify, or Render:

1. Update the frontend environment variables:
   - `VITE_API_URL=https://fixit-server.onrender.com/api`
   - `VITE_SOCKET_URL=https://fixit-server.onrender.com`
2. Update `CLIENT_URL` in your Render backend environment variables to match your frontend domain (e.g. `https://fixit-app.vercel.app`).

---

## 💡 Troubleshooting & Notes

- **Spin-down on Free Tier**: Render's free tier spins down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to wake up.
- **Persistent Data**: Make sure to provide a valid `MONGO_URI` from MongoDB Atlas so database records persist across server restarts.
- **CORS Issues**: If your client receives CORS errors, verify `CLIENT_URL` in the Render environment variables matches your exact frontend URL or set `CLIENT_URL=*` for testing.
