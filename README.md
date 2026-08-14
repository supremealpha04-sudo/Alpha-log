# SupremeAlpha OS

The complete digital twin of SupremeAlpha — founder, builder, and digital architect. Built with Vite, vanilla JavaScript, and Supabase.

## Features

- **20+ Sections**: Hero, About, Skills, Work, Timeline, Graveyard, Writings, Digital Garden, TIL, Principles, Reading List, Link Garden, Media Gallery, Now, Travel Map, Goals, Predictions, AMA, Guestbook, Sponsors, Contact, Colophon
- **Admin Panel**: Full CRUD for all content types, protected by `is_admin` flag
- **PWA**: Offline-capable with install prompt and service worker
- **Auth**: Supabase Auth with email/password
- **Security**: `.env` for API keys, RLS-ready schema, XSS protection
- **Theming**: Dark/light mode toggle

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

## Supabase Schema

Run the SQL in `supabase-schema.sql` to create all tables and RLS policies.

### Required Tables
- `profiles` (extends auth.users with `is_admin`, `full_name`)
- `projects`, `sponsor_tiers`, `messages`, `page_views`
- `milestones`, `graveyard`, `skills`, `posts`, `notes`, `til`
- `principles`, `reading_list`, `bookmarks`, `media`, `travel_map`
- `goals`, `predictions`, `ama_questions`, `guestbook`, `subscribers`

### RLS Policies
- Public read on most tables
- Authenticated users can insert `messages`, `guestbook`, `ama_questions`, `subscribers`
- Only admins can update/delete all content

## File Structure

```
supremealpha-os/
├── .env                    # Supabase credentials (gitignored)
├── .env.example            # Template
├── index.html              # SPA shell
├── vite.config.js          # Vite config
├── package.json
├── public/
│   ├── manifest.json       # PWA manifest
│   └── icons/
└── src/
    ├── main.js             # Entry point, router, auth, admin
    ├── supabase.js         # Client init with env vars
    ├── sections.js         # All public page sections
    ├── components.js       # Toast, Modal, TagInput, PWA
    ├── utils.js            # Helpers, theme, scroll
    └── styles.css          # Complete design system
```

## Admin Access

1. Sign up via the site
2. In Supabase Dashboard, set `profiles.is_admin = true` for your user
3. Refresh the site — the Admin Panel option will appear in the user dropdown

## Deployment

Recommended: **Vercel**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

Personal use only.
