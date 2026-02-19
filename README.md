# 🤝 Amigo Mission Control

A powerful AI-powered command center for managing tasks, content, calendar, memory, team, and office automation.

![Mission Control](https://img.shields.io/badge/Version-1.0.0-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000)

## 🚀 Live URL

**Production:** https://amigo-mission-control.vercel.app

## 📋 Features

### 1. Task Board (Kanban)
- Create, edit, delete tasks
- Priority levels (Low 🟢, Medium 🟡, High 🔴)
- Assign to Carlos or Amigo
- Add notes and descriptions
- Status: To Do, In Progress, Done

### 2. Content Pipeline
- 6 stages: Ideas → Script → Thumbnail → Filming → Editing → Published
- Platform support: YouTube, Instagram, TikTok, LinkedIn, Twitter
- Full script editor per item
- Assign to team members

### 3. Calendar
- Weekly view with scheduled tasks
- Always Running tasks (persistent)
- Color-coded events
- Quick add/remove

### 4. Memory
- Searchable memory bank
- Categories: Decision, Conversation, Learning, Daily
- Grouped by time: Today, Yesterday, This Week, This Month, Older

### 5. Team
- Leadership layer (Carlos, Amigo)
- Agent layer (Scout, Quill, Pixel, Echo)
- Meta layer (Codex)
- Each with skills and descriptions

### 6. Office (v1.0)
- 2D office layout with 3 zones:
  - Desks (6 workstations)
  - Meeting Room
  - Lobby
- Rich agent states: Planning, Executing, Waiting API, Waiting Human, Error, Review, Idle
- Real-time status indicators
- KPI bar: Active tasks, In Progress, Idle, Errors

### 7. Document Repository
- Upload MD, PDF, images
- Preview in modal
- Download capability
- (Storage integration pending Supabase Storage bucket)

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Backend/DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (pending) |
| **Storage** | Supabase Storage (pending bucket setup) |
| **Deployment** | Vercel |
| **State** | LocalStorage + Supabase sync |

## 📁 Project Structure

```
amigo-mission-control/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main app with all views
│   │   ├── layout.tsx       # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── login/
│   │       └── page.tsx     # Login page with avatar
│   ├── components/
│   │   └── AnimatedAvatar.tsx # Interactive avatar
│   └── lib/
│       ├── supabase.ts      # Supabase client
│       └── db.ts           # Database helpers
├── supabase-schema.sql      # SQL for tables
├── supabase-storage.sql     # SQL for storage bucket
└── .env.local.example      # Environment variables
```

## 🔧 Supabase Setup

### Database Tables

```sql
-- Run supabase-schema.sql in Supabase SQL Editor

tasks
documents
content_items
calendar_events
memories
team_members
office_agents
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎨 Design System

- **Background:** #0b0c0e (near black)
- **Surface:** #16181a, #0f1113
- **Primary:** #7c3aed (purple)
- **Accent:** #ff6b00 (orange)
- **Text:** #ffffff, #9aa0a6
- **Border:** #272829
- **Radius:** 16px (rounded-2xl)

## 🔄 Data Sync

Currently using hybrid approach:
- Supabase as primary data store
- LocalStorage as fallback
- Sync on load and on save

## 📱 Responsive

- Mobile: Bottom nav (icons only)
- Desktop: Sidebar + top tabs

## 🚦 Agent States (Office View)

| State | Color | Icon |
|-------|-------|------|
| Planning | Blue | 📝 |
| Executing | Green | ⚡ |
| Waiting API | Yellow | ⏳ |
| Waiting Human | Purple | 💬 |
| Error | Red | ⚠️ |
| Review | Cyan | 👀 |
| Idle | Zinc | 💤 |

## 🤖 Team Structure

### Leadership
- **Carlos** - Founder & CEO
- **Amigo** - Chief of Staff

### Agents
- **Scout** - Research
- **Quill** - Writer
- **Pixel** - Designer
- **Echo** - Outreach
- **Codex** - Developer

## 📝 API Reference

### Supabase Tables

```typescript
// Tasks
{
  id: uuid,
  title: string,
  description: text,
  status: 'todo' | 'in-progress' | 'done',
  assignee: 'carlos' | 'amigo',
  priority: 'low' | 'medium' | 'high',
  notes: text,
  created_at: timestamp,
  updated_at: timestamp
}

// Content Items
{
  id: uuid,
  title: string,
  description: text,
  stage: 'idea' | 'script' | 'thumbnail' | 'filming' | 'editing' | 'published',
  platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'twitter',
  script: text,
  assignee: 'carlos' | 'amigo',
  created_at: timestamp
}

// Calendar Events
{
  id: uuid,
  title: string,
  time: string,
  day_of_week: number (-1 = always),
  color: string,
  is_recurring: boolean,
  interval_type: 'daily' | 'weekly' | 'monthly'
}

// Memories
{
  id: uuid,
  title: string,
  content: text,
  memory_type: 'decision' | 'conversation' | 'learning' | 'daily',
  timestamp: timestamp
}

// Office Agents
{
  id: string,
  name: string,
  role: string,
  avatar: string,
  agent_state: string,
  current_task: text,
  task_progress: number,
  zone: 'desk' | 'meeting' | 'lobby',
  channel: string,
  last_activity: timestamp
}
```

## 🔜 Roadmap

- [ ] Supabase Auth integration
- [ ] Supabase Storage for documents
- [ ] Real-time subscriptions
- [ ] Office time-travel
- [ ] Agent replay
- [ ] Global command panel

## 📄 License

MIT - Carlos Domínguez 2026
