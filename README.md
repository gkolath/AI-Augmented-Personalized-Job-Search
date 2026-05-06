# 🚀 AI Global Job Hunter

AI-powered global job search platform with auto-apply, interview prep, visa sponsorship finder, and career intelligence.

## Live Features

- 🌍 **Global Job Aggregation** — JSearch (LinkedIn/Indeed/Glassdoor), Adzuna, RemoteOK, WeWorkRemotely
- 🤖 **AI Job Matching** — GPT-4o-mini matches your profile to jobs (0-100 score)
- ✈️ **Visa Sponsorship Detection** — Automatic detection + filter
- 📧 **One-Click Email Outreach** — Gmail & Outlook compose links
- 🤖 **CareerBot** — AI chatbot that searches jobs and prepares applications
- 🎤 **Interview Copilot** — Personalized questions, answers, resources per job
- 📝 **AI Cover Letter** — Auto-generated, personalized cover letters
- 💼 **Freelance Hub** — Upwork, Toptal, Contra, PeoplePerHour
- 📊 **Dashboard** — Applications tracker, profile strength, AI tips
- 🔐 **Auth** — Email/password + Google OAuth via Supabase

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| UI | ShadCN UI, Framer Motion, Lucide Icons |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| AI | OpenAI GPT-4o-mini |
| Job APIs | JSearch (RapidAPI), Adzuna, RemoteOK, WWR RSS |
| Hosting | Vercel |

## Setup

### 1. Clone & Install

```bash
cd "AI enabled personalized Job Search"
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in your keys:

```bash
# Supabase (free at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (openai.com)
OPENAI_API_KEY=sk-...

# JSearch via RapidAPI (rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
# Free tier: 200 requests/month
RAPIDAPI_KEY=your_key

# Adzuna (developer.adzuna.com)
# Free: 250 calls/month
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_key
```

### 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/migrations/001_init.sql`
3. In Storage: create bucket named `resumes` (public)
4. In Auth > Providers: enable Google OAuth (optional)

### 4. Run Locally

```bash
npm run dev
# Opens at http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# or use: vercel env add
```

## Folder Structure

```
app/
├── (auth)/
│   ├── login/          # Sign in page
│   └── signup/         # Sign up page
├── (dashboard)/
│   ├── dashboard/      # User dashboard
│   ├── jobs/           # Job search page
│   ├── freelance/      # Freelance gigs
│   └── profile/        # Profile editor
├── admin/              # Admin panel
├── api/
│   ├── jobs/search/    # Job aggregation API
│   ├── ai/interview/   # Interview prep AI
│   ├── ai/chat/        # CareerBot AI
│   ├── ai/cover-letter/ # Cover letter AI
│   ├── profile/        # Profile CRUD
│   └── applications/   # Applications tracker
└── page.tsx            # Landing page

components/
├── home/               # Landing page sections
├── jobs/               # Job card, filters, modal
├── chatbot/            # CareerBot
├── layout/             # Navbar, footer, theme
└── ui/                 # ShadCN components

lib/
├── jobs/aggregator.ts  # Multi-source job fetching
├── jobs/matcher.ts     # AI compatibility scoring
├── openai/client.ts    # OpenAI helpers
└── supabase/           # Client & server helpers

supabase/
└── migrations/001_init.sql  # DB schema
```

## API Keys — Where to Get Them (All Free Tiers Available)

| Service | URL | Free Tier |
|---------|-----|-----------|
| Supabase | supabase.com | 500MB DB, 5GB storage |
| OpenAI | platform.openai.com | Pay per use (~$0.002/query) |
| JSearch | rapidapi.com | 200 requests/month free |
| Adzuna | developer.adzuna.com | 250 calls/month free |

## Job Sources

- **JSearch** (via RapidAPI): LinkedIn, Indeed, Glassdoor, ZipRecruiter, CareerJet
- **Adzuna**: UK, US, Canada, Australia, Germany, France, India, Singapore
- **RemoteOK**: Remote-only tech jobs (public free API)
- **WeWorkRemotely**: Remote jobs RSS feed (free)

## Future Roadmap

- [ ] LinkedIn Easy Apply automation
- [ ] Resume ATS scorer
- [ ] WhatsApp job alerts
- [ ] Salary benchmarking tool
- [ ] Premium subscriptions (Stripe)
- [ ] Mobile app (React Native)
- [ ] Browser extension for auto-fill
