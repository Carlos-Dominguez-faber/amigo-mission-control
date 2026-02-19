# 🤝 Amigo Mission Control

Personal productivity dashboard for Carlos Domínguez.

## Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard - ALL views here
│   │   - Tasks (Kanban with expand, docs)
│   │   - Content Pipeline (6 stages)
│   │   - Calendar (weekly)
│   │   - Memory
│   │   - Team
│   │   - Office (agents in zones)
│   │   - Documents (file list)
│   ├── login/page.tsx   # Login with Supabase Auth
│   └── globals.css
├── components/
│   └── AnimatedAvatar.tsx
├── hooks/
│   └── useData.ts       # useContent, useCalendar, useMemories, useTeam, useOffice
└── lib/
    └── supabase.ts      # createClient + getAccessToken
```

## Supabase Setup

### Tables (already created)
- `tasks` - id, title, description, status, assignee, priority, notes, created_at, updated_at
- `content_items` - id, title, description, stage, platform, script, assignee, created_at
- `calendar_events` - id, title, time, day_of_week, color, is_recurring, interval_type
- `memories` - id, title, content, memory_type, timestamp
- `team_members` - id, name, role, description, skills[], color, layer, avatar
- `office_agents` - id, name, role, avatar, color, agent_state, current_task, task_progress, zone, channel, last_activity
- `documents` - (table for metadata, actual files in Storage)

### Storage Bucket
- Bucket: `documents`
- Needs policies for public read/write

## Auth Flow
1. Login at `/login` - email/password → Supabase Auth
2. Token stored in localStorage as `sb-access-token`
3. All requests use Bearer token in headers

## Known Issues
- Storage upload returns 400 - bucket policies may not be set correctly
- Need to run SQL to create bucket policies:
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
```

## Adding New Features

### To add a new view:
1. Add to `view` state type: `"tasks" | "docs" | "content" | "calendar" | "memory" | "team" | "office" | "newfeature"`
2. Add tab to navigation
3. Add case: `{view === "newfeature" && <NewFeature />}` 

### To add new data table:
1. Create table in Supabase
2. Add hook in `src/hooks/useData.ts`
3. Import and use in page.tsx

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://cvofvffeabstndbuzwjc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Running Locally
```bash
npm run dev
```

## Deploy
```bash
npx vercel --prod
```
