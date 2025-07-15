# GitHub Actions + Railway Auto-Deployment Setup

## Overview
This setup enables automatic deployment to Railway whenever you push to the `main` or `2.0.0` branch.

## 🚀 What Gets Deployed Automatically
- **Push to 2.0.0 branch** → Backend deploys to Railway **Development**
- **Push to main branch** → Backend deploys to Railway **Production**
- **Pull Request** → Runs tests only (no deployment)
- **Database migrations** run automatically after deployment

## 📋 Setup Steps

### Step 1: Get Railway Token
1. Go to [Railway Dashboard](https://railway.com/dashboard)
2. Click your profile → **Account Settings**
3. Go to **Tokens** tab
4. Click **Create Token**
5. Name it: `GitHub Actions - Silver Edge`
6. Copy the token (starts with `railway_`)

### Step 2: Add GitHub Secrets
1. Go to your GitHub repo: https://github.com/MrGoldWatch/silver-edge
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `RAILWAY_TOKEN` | `railway_xxxxx` | Token from Step 1 |
| `RAILWAY_PROJECT_ID` | `4b38ca53-...` | Your Railway project ID |
| `DEV_DATABASE_URL` | `postgresql://...` | Development PostgreSQL URL |
| `PROD_DATABASE_URL` | `postgresql://...` | Production PostgreSQL URL (for main branch) |

### Step 3: Get Railway Project Info
1. Go to [Railway Dashboard](https://railway.com/dashboard)
2. Open your Silver Edge project
3. **Get Project ID**: Copy from URL (e.g., `4b38ca53-0032-446a-93bb-1d8eb303d9b`)
4. Click **PostgreSQL** service
5. Go to **Variables** tab
6. Copy the `DATABASE_URL` value
7. Add both as secrets in GitHub

### Step 4: Create Railway Services
1. In Railway dashboard, click **+ New Service**
2. Choose **GitHub Repo**
3. Connect your `silver-edge` repository
4. Set **Root Directory** to `backend`
5. Create two services:
   - `backend-dev` (for 2.0.0 branch)
   - `backend-prod` (for main branch)
6. Railway will auto-detect Node.js and deploy

### Step 5: Configure Railway Services
1. For each service (`backend-dev` and `backend-prod`):
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`
   - **Health Check**: `/api/health`

### Step 6: Set Environment Variables
In each Railway service → **Variables** tab, add:

**For backend-dev:**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
JWT_SECRET=your-dev-jwt-secret-key
```

**For backend-prod:**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=${{PostgreSQL.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-here
```

## 🔄 How It Works

### Automatic Deployment Flow:
1. **Push code** to main/2.0.0 branch
2. **GitHub Actions** triggers
3. **Installs** dependencies
4. **Builds** the backend
5. **Runs tests**
6. **Deploys** to Railway
7. **Runs** database migrations
8. **Backend is live!**

### Manual Deployment (if needed):
```bash
# Deploy manually from local machine
cd backend
railway login
railway link [your-project-id]
railway up
```

## 📱 Update Frontend API URL

After deployment, update the frontend to use your Railway URL:

1. **Get your Railway URL**:
   - Go to Railway dashboard
   - Click your backend service
   - Copy the **Public URL** (e.g., `https://silver-edge-backend-production.up.railway.app`)

2. **Update frontend API URL**:
   ```typescript
   // In src/services/api.ts, line 23:
   return 'https://your-railway-url.railway.app/api';
   ```

3. **Rebuild and resubmit** to TestFlight:
   ```bash
   eas build --platform ios --profile preview
   eas submit --platform ios
   ```

## 🔍 Monitoring Deployments

### GitHub Actions:
- Go to **Actions** tab in your GitHub repo
- See deployment status and logs
- Green ✅ = successful deployment
- Red ❌ = deployment failed

### Railway Logs:
- Go to Railway dashboard
- Click your service
- **Deployments** tab shows deployment history
- **Logs** tab shows runtime logs

## 🚨 Troubleshooting

### Common Issues:

**❌ "Unable to resolve action railway-app/railway-deploy@v1"**
- This action no longer exists
- Use Railway CLI instead (already fixed in workflow)
- Make sure you're using the updated workflow file

**❌ "Railway token invalid"**
- Regenerate token in Railway dashboard
- Update `RAILWAY_TOKEN` secret in GitHub

**❌ "Database connection failed"**
- Check `DATABASE_URL` secret in GitHub
- Verify PostgreSQL service is running in Railway

**❌ "Build failed"**
- Check GitHub Actions logs
- Usually missing dependencies or TypeScript errors

**❌ "Health check failed"**
- Ensure `/api/health` endpoint exists
- Check Railway service logs

## 🎯 Benefits of This Setup

✅ **Automatic deployments** - No manual work  
✅ **Consistent builds** - Same environment every time  
✅ **Easy rollbacks** - Deploy previous commits easily  
✅ **Testing integration** - Tests run before deployment  
✅ **Zero downtime** - Railway handles deployment gracefully  
✅ **Environment isolation** - Production vs development  

## 🔄 Workflow Summary

```
Code Change → Push to GitHub → GitHub Actions → Railway Deployment → Live Backend
```

Once this is set up, you just need to:
1. **Write code**
2. **Push to main**
3. **Wait 2-3 minutes**
4. **Backend is updated!**

No more manual deployments! 🎉
