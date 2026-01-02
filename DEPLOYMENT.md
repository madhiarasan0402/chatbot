# Deployment Guide for Selfie AI

## 🚀 Deployment Options

Your Selfie AI app is a **full-stack application** with separate frontend and backend. You have several deployment options:

---

## ✅ **Option 1: Vercel (Easiest - Monorepo)**

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy from Root Directory
```bash
cd d:/selfie
vercel
```

### Step 3: Configure in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your project
3. Go to **Settings → Environment Variables**
4. Add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
5. **Redeploy** the project

### What gets deployed:
- Frontend: Served as static files from `client/dist`
- Backend: Runs as serverless functions

---

## ✅ **Option 2: Split Deployment (Recommended for Production)**

Deploy frontend and backend separately for better scaling.

### Frontend on Vercel

1. **Go to Vercel Dashboard**
2. **Import Project** → Choose `client` folder only
3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variable:**
   - `VITE_API_URL`: `https://your-backend-url.com`

5. **Deploy**

### Backend on Render

1. **Go to Render Dashboard** (https://render.com)
2. **New → Web Service**
3. **Connect GitHub repo**
4. **Settings:**
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

5. **Add Environment Variable:**
   - `GEMINI_API_KEY`: Your key
   - `PORT`: 5000 (or leave empty, Render sets it)

6. **Deploy**

### Update Frontend API URL

After backend is deployed, update `client/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

Then add `.env` in `client/`:
```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

---

## ✅ **Option 3: Railway (Full Stack)**

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Create Two Services**

**Backend:**
```bash
cd server
railway init
railway add
# Select "Backend" as name
# Set root directory to "server"
railway up
```

**Frontend:**
```bash
cd ../client
railway init
railway add
# Select "Frontend" as name
# Set root directory to "client"
railway up
```

4. **Set Environment Variables** in Railway dashboard

---

## 🔧 **Fix CORS for Split Deployment**

If you deploy frontend and backend separately, update `server/index.js`:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend-url.vercel.app'  // Add your frontend URL
    ],
    credentials: true
}));
```

---

## 🐛 **Common Deployment Issues**

### Issue 1: "Module not found" errors
**Solution:** Ensure all dependencies are in `dependencies`, not `devDependencies`

### Issue 2: Image generation fails in production
**Solution:** The proxy endpoint needs CORS configured properly. Check server logs.

### Issue 3: API returns 404
**Solution:** 
- For Vercel: Check `vercel.json` routes are correct
- For split: Verify `VITE_API_URL` is set correctly

### Issue 4: Environment variables not working
**Solution:**
- Vercel: Redeploy after adding env vars
- Render: Click "Manual Deploy" after adding vars

---

## 📊 **Recommended Production Setup**

**Best Performance:**
- **Frontend**: Vercel (excellent for React/Vite)
- **Backend**: Render or Railway (better for persistent Node.js)

**Best Cost:**
- **Frontend**: Vercel (free tier is generous)
- **Backend**: Render (free tier available)

**Easiest:**
- **Both**: Vercel monorepo (all in one)

---

## ✅ **Post-Deployment Checklist**

- [ ] Frontend loads correctly
- [ ] Chat functionality works
- [ ] Image generation works
- [ ] File upload works
- [ ] CORS is configured for your domain
- [ ] Environment variables are set
- [ ] Logs show no errors

---

## 🔗 **Useful Links**

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Render Deployment Docs](https://render.com/docs)
- [Railway Deployment Docs](https://docs.railway.app)
- [Google AI Studio (API Keys)](https://aistudio.google.com/app/apikey)

---

Need help? Check the logs in your deployment platform's dashboard!
