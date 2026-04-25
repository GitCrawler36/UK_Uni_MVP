# UKAdmit — UK University Admissions Platform

## Overview
UK university admissions platform for Sri Lankan students built for Rivil International Education Consultancy.

## Tech Stack
Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase

## Local Setup
1. Clone the repository
2. `npm install`
3. Copy `.env.local.example` to `.env.local`
4. Fill in your Supabase and WhatsApp credentials
5. Run the SQL migration in Supabase SQL Editor
6. `npm run dev`
7. Go to http://localhost:3000

## Environment Variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number without `+` (e.g. `94771234567`) |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` locally) |
| `RESEND_API_KEY` | Resend API key for email notifications |

## Adding a New University
1. Log in to `/admin`
2. Go to Universities
3. Click Add University
4. Fill in the details and save

## Adding a New Programme
1. Log in to `/admin`
2. Go to Programmes
3. Click Add Programme
4. Fill in all details including intakes
5. Toggle **Is Active** to make it visible on the site

## Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy
