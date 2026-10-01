# Deployment Guide

This guide details how to deploy the Fish Business Management System to production (recommended: **Vercel** with **Supabase PostgreSQL** and **Cloudinary**).

---

## 1. Environment Variables Checklist

Add the following environment variables in your deployment dashboard (e.g., **Vercel Project Settings > Environment Variables**):

| Variable | Description | Example / Notes |
|---|---|---|
| `DATABASE_URL` | Supabase Transaction Pooler URL (Port 6543) | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Session URL (Port 5432) | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public / Anon Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | `eyJhbGciOi...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary Upload Preset | `fish_business_preset` |
| `NEXT_PUBLIC_APP_URL` | Production URL of your deployed application | `https://your-domain.vercel.app` |

---

## 2. Deploying to Vercel (Recommended)

### Step A: Push Code to GitHub / GitLab / Bitbucket
1. Open terminal in the project directory:
   ```bash
   git init
   git add .
   git commit -m "feat: initial production build setup"
   ```
2. Create a repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step B: Import Project in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** > **"Project"**.
2. Select your Git repository.
3. Keep the default Next.js settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build` (or `npm run build`)
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and paste all values from Section 1.
5. Click **Deploy**.

---

## 3. Database Sync & Migrations

To apply Prisma migrations against your production Supabase database:

```bash
# Run migrations on the production database
npx prisma migrate deploy
```

*(Optional)* If you need to seed initial test data into the database:
```bash
npm run db:seed
```

---

## 4. Supabase Auth Configuration

After deploying, update your Supabase settings to allow logins from your production domain:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** > **URL Configuration**.
3. Set **Site URL** to your production URL:
   ```
   https://your-domain.vercel.app
   ```
4. In **Redirect URLs**, add:
   ```
   https://your-domain.vercel.app/**
   ```

---

## 5. Verification Checklist

- [x] TypeScript compilation passes (`npm run type-check`)
- [x] Production build succeeds (`npm run build`)
- [x] Prisma Client generation configured via `postinstall` and `build` scripts
- [x] Security headers configured in `vercel.json`
- [x] Remote image patterns for Cloudinary configured in `next.config.mjs`
- [x] Prisma connection pooling and direct URL setup for serverless scaling
