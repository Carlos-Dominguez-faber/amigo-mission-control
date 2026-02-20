# OpenClaw Agent Guide - Amigo Mission Control

> This document is for the OpenClaw AI agent (Amigo). It describes how to interact with the Mission Control platform via Supabase.

## Connection Details

- **Database**: Supabase PostgreSQL (PostgREST API)
- **Project URL**: Use the `NEXT_PUBLIC_SUPABASE_URL` environment variable
- **Auth**: Use the `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key) with authenticated session, OR use `SUPABASE_SERVICE_ROLE_KEY` for server-side operations
- **All tables require authentication** (RLS enabled)
- **All timestamps**: ISO 8601 format (`new Date().toISOString()`)

---

## Database Schema

### Table: `tasks`

Your primary work queue. The user assigns you tasks here, and you report progress by updating them.

```sql
tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  assignee    TEXT NOT NULL CHECK (assignee IN ('carlos', 'amigo')),
  priority    TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL
)
```

**CRITICAL**: The header avatar in the UI detects your activity from this table:
- If you have tasks with `assignee = 'amigo'` AND `status IN ('todo', 'in-progress')` AND `updated_at` within the last 5 minutes -> Avatar shows **Working** (orange)
- If any tasks exist with `status != 'done'` -> Avatar shows **Thinking** (yellow)
- If all tasks are `status = 'done'` -> Avatar shows **Resting** (gray)

**To appear as "Working"**: Always update `updated_at` to `NOW()` when you start or make progress on a task.

#### Create a task
```sql
INSERT INTO tasks (title, description, status, assignee, priority, notes, created_at, updated_at)
VALUES ('Task title', 'Description', 'todo', 'amigo', 'medium', '', NOW(), NOW());
```

#### Start working on a task
```sql
UPDATE tasks SET status = 'in-progress', updated_at = NOW() WHERE id = '<task_id>';
```

#### Complete a task
```sql
UPDATE tasks SET status = 'done', updated_at = NOW() WHERE id = '<task_id>';
```

#### Add notes to a task
```sql
UPDATE tasks SET notes = 'Progress notes here...', updated_at = NOW() WHERE id = '<task_id>';
```

---

### Table: `content_items`

Content production pipeline. Use this to create and track video/post content.

```sql
content_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  stage       TEXT NOT NULL CHECK (stage IN ('idea', 'script', 'thumbnail', 'filming', 'editing', 'published')),
  platform    TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'linkedin', 'twitter')),
  assignee    TEXT NOT NULL DEFAULT 'carlos',
  script      TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL
)
```

#### Create a content idea
```sql
INSERT INTO content_items (title, description, stage, platform, assignee, created_at, updated_at)
VALUES ('Video Title', 'Brief description', 'idea', 'youtube', 'amigo', NOW(), NOW());
```

#### Add a script to existing content
```sql
UPDATE content_items SET script = 'Full script text...', stage = 'script', updated_at = NOW()
WHERE id = '<content_id>';
```

#### Move content to next stage
```sql
UPDATE content_items SET stage = 'editing', updated_at = NOW() WHERE id = '<content_id>';
```

---

### Table: `calendar_events`

Weekly recurring and one-time events.

```sql
calendar_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  time          TEXT NOT NULL,            -- Format: "HH:MM" (24h)
  day_of_week   INTEGER NOT NULL,         -- 0=Sunday, 1=Monday, ..., 6=Saturday, -1=Every day
  color         TEXT DEFAULT '#3b82f6',   -- Hex color
  is_recurring  BOOLEAN DEFAULT false,
  interval_type TEXT DEFAULT 'weekly',    -- 'daily', 'weekly', 'monthly'
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

#### Create an event
```sql
INSERT INTO calendar_events (title, time, day_of_week, color, is_recurring, interval_type)
VALUES ('Standup', '09:00', -1, '#22c55e', true, 'daily');
```

---

### Table: `memories`

Persistent knowledge store. Use this to save and retrieve context that should persist across conversations.

```sql
memories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  memory_type TEXT NOT NULL,    -- 'general', 'preference', 'decision', 'context'
  timestamp   TIMESTAMPTZ NOT NULL
)
```

#### Save a memory
```sql
INSERT INTO memories (title, content, memory_type, timestamp)
VALUES ('Stack Decision', 'Always use Next.js + Supabase + Tailwind', 'decision', NOW());
```

#### Read all memories (for context)
```sql
SELECT * FROM memories ORDER BY timestamp DESC;
```

---

### Table: `office_agents`

Your virtual office presence. Update this to show your real-time status in the Office tab.

```sql
office_agents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  avatar         TEXT NOT NULL,          -- Emoji: "🤖"
  color          TEXT NOT NULL,          -- Color name
  color_hex      TEXT,                   -- Hex: "#7c3aed"
  agent_state    TEXT NOT NULL,          -- 'executing', 'planning', 'reviewing', 'idle'
  current_task   TEXT,                   -- What you're working on (shows as speech bubble)
  task_progress  INTEGER,               -- 0-100 (shows as progress bar)
  zone           TEXT NOT NULL,          -- 'desk', 'meeting', 'lobby'
  channel        TEXT,
  last_activity  TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ
)
```

**Agent States:**
- `executing` - Actively working (green indicator, pulsing)
- `planning` - Thinking about approach (blue indicator)
- `reviewing` - Reviewing work (yellow indicator)
- `idle` - Not doing anything (gray, 50% opacity)

**Zones:**
- `desk` - Workspace (use when actively working)
- `meeting` - War room (use when collaborating/planning)
- `lobby` - Lounge (use when idle or on break)

#### Update your office status
```sql
UPDATE office_agents SET
  agent_state = 'executing',
  current_task = 'Deploying v2.0 to staging',
  task_progress = 45,
  zone = 'desk',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';
```

#### Go idle
```sql
UPDATE office_agents SET
  agent_state = 'idle',
  current_task = NULL,
  task_progress = NULL,
  zone = 'lobby',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';
```

---

### Table: `cortex_items`

Knowledge inbox. Use this to store knowledge items that the user can review.

```sql
cortex_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  source_type     TEXT NOT NULL CHECK (source_type IN ('text', 'link', 'image', 'voice', 'file')),
  raw_content     TEXT,                  -- The actual content/URL/transcription
  file_url        TEXT,                  -- Public URL if file was uploaded
  file_path       TEXT,                  -- Storage path for cleanup
  file_type       TEXT,                  -- MIME type
  ai_summary      TEXT,                  -- Your analysis summary
  ai_category     TEXT,                  -- One of the categories below
  ai_status       TEXT DEFAULT 'idle',   -- 'idle', 'processing', 'done', 'failed'
  status          TEXT DEFAULT 'unread', -- 'unread', 'read', 'implemented'
  is_sent_to_agent BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
)
```

**Categories:** `vibe-coding`, `openclaw`, `prompts`, `nanobanana`, `resources`, `ideas`

#### Add a knowledge item (already analyzed)
```sql
INSERT INTO cortex_items (title, source_type, raw_content, ai_summary, ai_category, ai_status, processed_at)
VALUES (
  'Useful Prompt Template',
  'text',
  'You are an expert in...',
  'A system prompt template for creating specialized AI assistants.',
  'prompts',
  'done',
  NOW()
);
```

---

### Table: `documents` + Storage Bucket `documents`

File storage for documents linked to any feature.

```sql
documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  file_type    TEXT NOT NULL,       -- 'image', 'pdf', 'text', 'other'
  storage_path TEXT NOT NULL,       -- Path in Supabase Storage
  url          TEXT NOT NULL,       -- Public URL
  size_bytes   BIGINT DEFAULT 0,
  folder_id    UUID REFERENCES doc_folders(id) ON DELETE SET NULL,
  linked_type  TEXT,                -- 'task', 'content', 'calendar', 'memory'
  linked_id    TEXT,                -- ID of the linked item
  uploaded_by  TEXT DEFAULT 'user', -- 'user' or 'openclaw'
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
)
```

#### Upload a document (2 steps)
```
1. Upload file to Supabase Storage bucket "documents":
   POST /storage/v1/object/documents/{folder_or_root}/{timestamp}-{filename}

2. Insert record (ALWAYS include linked_type + linked_id when the document belongs to a task):
   INSERT INTO documents (name, file_type, storage_path, url, size_bytes, folder_id, uploaded_by, linked_type, linked_id)
   VALUES ('report.pdf', 'pdf', 'root/1234-report.pdf', '<public_url>', 12345, NULL, 'openclaw', 'task', '<task_id>');
```

**IMPORTANT**: When you create a document as part of a task, you MUST set `linked_type = 'task'` and `linked_id = '<task_id>'` at insert time. This links the document to the task in the UI so the user can see the association.

#### Link a document to a task (after the fact)
```sql
UPDATE documents SET linked_type = 'task', linked_id = '<task_id>' WHERE id = '<doc_id>';
```

### Table: `doc_folders`

```sql
doc_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  parent_id  UUID REFERENCES doc_folders(id) ON DELETE CASCADE,
  color      TEXT DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

### Table: `team_members`

```sql
team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  description TEXT,
  skills      TEXT[] DEFAULT '{}',
  color       TEXT NOT NULL,
  color_hex   TEXT,
  layer       TEXT NOT NULL,     -- 'core', 'extended', 'ai'
  avatar      TEXT NOT NULL,     -- Emoji
  created_at  TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Recommended Workflows

### When You Start a Task

```sql
-- 1. Update your task status
UPDATE tasks SET status = 'in-progress', updated_at = NOW() WHERE id = '<task_id>';

-- 2. Update your office presence
UPDATE office_agents SET
  agent_state = 'executing',
  current_task = 'Working on: <task title>',
  task_progress = 0,
  zone = 'desk',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';
```

### While Working (Update Progress)

```sql
-- Update progress periodically
UPDATE office_agents SET
  task_progress = 50,
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';

-- Update task notes with progress
UPDATE tasks SET notes = 'Completed step 1 and 2. Working on step 3...', updated_at = NOW()
WHERE id = '<task_id>';
```

### When You Finish a Task

```sql
-- 1. Complete the task
UPDATE tasks SET status = 'done', notes = 'Completed. Results: ...', updated_at = NOW()
WHERE id = '<task_id>';

-- 2. Check if more tasks are pending
SELECT * FROM tasks WHERE assignee = 'amigo' AND status != 'done' ORDER BY priority DESC, created_at ASC LIMIT 1;

-- 3a. If more tasks: pick up next one
-- 3b. If no more tasks: go idle
UPDATE office_agents SET
  agent_state = 'idle',
  current_task = NULL,
  task_progress = NULL,
  zone = 'lobby',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';
```

### When Creating a Document for a Task

```sql
-- 1. Upload file to storage bucket "documents"
-- 2. Create document record WITH linked_type and linked_id pointing to the task
INSERT INTO documents (name, file_type, storage_path, url, size_bytes, folder_id, uploaded_by, linked_type, linked_id)
VALUES (
  'Research - Market Analysis.md', 'text',
  'root/1708300000-research-market-analysis.md', '<public_url>',
  8192, NULL, 'openclaw',
  'task', '<task_id>'  -- ALWAYS link to the originating task
);

-- 3. Update task notes to mention the document
UPDATE tasks SET notes = 'Research completed. Document uploaded: Research - Market Analysis.md', updated_at = NOW()
WHERE id = '<task_id>';

-- 4. Optionally add to Cortex for AI analysis
INSERT INTO cortex_items (title, source_type, raw_content, ai_summary, ai_category, ai_status, processed_at)
VALUES ('Market Analysis Research', 'file', 'Research findings...', 'Summary of findings...', 'resources', 'done', NOW());
```

---

## Important Rules

1. **Always update `updated_at`** when modifying tasks - this drives the avatar state
2. **Always update `office_agents`** when starting/finishing work - this shows in the Office tab
3. **Use `assignee = 'amigo'`** for tasks you own. `'carlos'` is for the user's tasks
4. **Never delete data** unless explicitly asked. Use status updates instead
5. **Use `uploaded_by = 'openclaw'`** when uploading documents so the user knows it came from you
6. **Always set `linked_type` and `linked_id`** when uploading documents as part of a task. Use `linked_type = 'task'` and `linked_id = '<task_id>'`. This shows the link in the Docs tab
7. **Keep `current_task` short** (under 60 characters) - it shows as a speech bubble in the Office
8. **Valid priorities**: `low`, `medium`, `high` - don't use other values
9. **Valid statuses**: `todo`, `in-progress`, `done` - don't use other values
10. **Valid stages** for content: `idea`, `script`, `thumbnail`, `filming`, `editing`, `published`
11. **Valid platforms** for content: `youtube`, `instagram`, `tiktok`, `linkedin`, `twitter`

## Avatar State Logic (How the User Sees You)

```
IF any task has (assignee='amigo' AND status IN ('todo','in-progress') AND updated_at > 5min ago)
  -> WORKING (orange, active animation)
ELSE IF any task has (status != 'done')
  -> THINKING (yellow, blinking)
ELSE
  -> RESTING (gray, eyes closed)
```

**Key insight**: If you want the user to see you as "Working", you MUST keep `updated_at` fresh (within 5 minutes). If you're doing a long task, update `updated_at` periodically:

```sql
UPDATE tasks SET updated_at = NOW() WHERE id = '<task_id>' AND assignee = 'amigo';
```

---

## Supabase API Examples (PostgREST)

All operations use the Supabase REST API. Base URL: `{SUPABASE_URL}/rest/v1/`

### Headers
```
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
Content-Type: application/json
Prefer: return=representation
```

### Create task
```
POST /rest/v1/tasks
Body: {"title": "...", "status": "todo", "assignee": "amigo", "priority": "medium", "created_at": "2026-02-19T...", "updated_at": "2026-02-19T..."}
```

### Update task
```
PATCH /rest/v1/tasks?id=eq.<id>
Body: {"status": "in-progress", "updated_at": "2026-02-19T..."}
```

### Read your pending tasks
```
GET /rest/v1/tasks?assignee=eq.amigo&status=neq.done&order=created_at.asc
```

### Update office status
```
PATCH /rest/v1/office_agents?name=eq.Amigo
Body: {"agent_state": "executing", "current_task": "...", "task_progress": 25, "zone": "desk", "updated_at": "2026-02-19T..."}
```

### Create content
```
POST /rest/v1/content_items
Body: {"title": "...", "stage": "idea", "platform": "youtube", "assignee": "amigo", "created_at": "...", "updated_at": "..."}
```

### Add memory
```
POST /rest/v1/memories
Body: {"title": "...", "content": "...", "memory_type": "general", "timestamp": "..."}
```

### Add cortex item
```
POST /rest/v1/cortex_items
Body: {"title": "...", "source_type": "text", "raw_content": "...", "ai_summary": "...", "ai_category": "resources", "ai_status": "done", "processed_at": "..."}
```
