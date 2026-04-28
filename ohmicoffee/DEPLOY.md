# OHMI Coffee Co. — Deployment Guide

## Step 1 — Supabase
1. supabase.com → New project: ohmicoffee
2. SQL Editor → paste supabase-schema.sql → Run
3. Settings → API → copy 3 keys into .env.local

## Step 2 — Install & Push
npm install
git init && git add .
git commit -m "OHMI launch"
git remote add origin https://github.com/OHMICOFFEE/OHMICOFFEE.git
git push -u origin main

## Step 3 — Vercel
vercel.com → Import OHMICOFFEE repo → add env vars → Deploy

## Step 4 — Custom Domain
Vercel → Settings → Domains → ohmicoffee.co.za

## Routes
/ → Homepage
/coffees → Collection
/shop → Store
/network → Comp plan + join
/foundation → Foundation
/rep/register → 5-step signup
/rep/login → Rep login
/rep/[slug] → Replicated site
/dashboard → Rep portal
/earnings → Rep earnings
/downline → Downline tree
/admin/dashboard → CRM
/admin/products → Products CRUD
/admin/orders → Orders
/admin/network → Binary network
/admin/commissions → Commissions
/admin/payouts → Friday payouts
/admin/kyc → KYC verification
/admin/foundation → Meals counter
/admin/settings → Site settings
/admin/media → Image library
