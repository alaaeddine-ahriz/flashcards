# Flashcards CSV

A modern spaced repetition flashcard app with **Anki-style SM-2 algorithm** for optimal memorization. Import flashcards from CSV files and practice with scientifically-proven learning intervals.

## Features

- 📚 **CSV Import** - Upload flashcards from CSV files (front, back columns)
- 🧠 **SM-2 Algorithm** - Anki-style spaced repetition for efficient learning
- 📊 **Progress Tracking** - Track mastery with New/Learning/Mastered states
- 🏷️ **Deck Organization** - Organize cards into decks with tags
- 🔥 **Streak System** - Build daily practice streaks
- 🔐 **User Accounts** - Supabase authentication with per-user data
- ⚡ **Offline-First** - Local caching for instant, lag-free practice

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) |
| **Caching** | localStorage (offline-first) |
| **Language** | TypeScript |

## How the SM-2 Algorithm Works

The app uses **SuperMemo 2 (SM-2)**, the same algorithm that powers Anki:

### Card States

| State | Criteria | Description |
|-------|----------|-------------|
| 🟡 **New** | `repetitions = 0` | Never reviewed |
| 🔵 **Learning** | `interval < 7 days` | Being learned |
| 🟢 **Mastered** | `interval ≥ 7 days` | Long-term memory |

### Difficulty Ratings

After viewing a card, rate your recall:

| Rating | Effect |
|--------|--------|
| **Hard** | Reset interval, lower ease factor |
| **Good** | Standard interval increase |
| **Easy** | Maximum interval boost |

### Interval Calculation

```
EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))

Interval:
  • 1st review: 1 day
  • 2nd review: 6 days  
  • Subsequent: interval × EF
```

Where `EF` = Ease Factor (default 2.5, min 1.3) and `q` = quality rating (0-5).

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

Create a Supabase project and add environment variables:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Schema

Execute the SQL in `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning!

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── auth/             # Sign in/up page
│   ├── decks/            # Deck list, upload, edit
│   ├── practice/[id]/    # Practice session
│   └── profile/          # User stats & progress
├── components/           # Reusable UI components
├── services/             # Business logic (cache-first)
├── lib/                  # Supabase client, cache, sync
├── contexts/             # React contexts (Auth)
└── types/                # TypeScript type definitions
```

## CSV Format

Upload CSV files with two columns:

```csv
front,back
What is 2+2?,4
Capital of France?,Paris
```

## License

MIT
