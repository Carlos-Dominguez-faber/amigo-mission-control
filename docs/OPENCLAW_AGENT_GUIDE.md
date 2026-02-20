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

Content production pipeline. Supports three content types: **post** (static image), **reel** (video), **carousel** (multiple ordered images).

```sql
content_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  content_type  TEXT NOT NULL DEFAULT 'reel' CHECK (content_type IN ('post', 'reel', 'carousel')),
  stage         TEXT NOT NULL CHECK (stage IN ('idea', 'script', 'filming', 'editing', 'design', 'copy', 'research', 'review', 'published')),
  platform      TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'linkedin', 'twitter')),
  assignee      TEXT NOT NULL DEFAULT 'carlos',
  script        TEXT,
  image_url     TEXT,
  caption       TEXT,
  hashtags      TEXT,
  posting_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL
)
```

**Stages by content type:**
- **Post**: idea → design → copy → review → published
- **Reel**: idea → script → filming → editing → review → published
- **Carousel**: idea → research → design → copy → review → published

#### Create a reel idea
```sql
INSERT INTO content_items (title, description, content_type, stage, platform, assignee, created_at, updated_at)
VALUES ('Video Title', 'Brief description', 'reel', 'idea', 'youtube', 'amigo', NOW(), NOW());
```

#### Create a carousel with caption and hashtags
```sql
INSERT INTO content_items (title, description, content_type, stage, platform, assignee, caption, hashtags, posting_notes, created_at, updated_at)
VALUES (
  'Top 5 AI Tools', 'A carousel about the best AI tools', 'carousel', 'idea', 'instagram', 'amigo',
  'Here are the top 5 AI tools you need to know about...',
  '#ai #tools #tech #productivity #automation',
  'Post at 9am. Tag @openai and @anthropic.',
  NOW(), NOW()
);
```

#### Add images to a carousel (use content_media table)
```sql
-- After uploading files to the 'content-media' storage bucket:
INSERT INTO content_media (content_id, url, storage_path, position)
VALUES
  ('<content_id>', '<public_url_1>', '<content_id>/slide1.jpg', 0),
  ('<content_id>', '<public_url_2>', '<content_id>/slide2.jpg', 1),
  ('<content_id>', '<public_url_3>', '<content_id>/slide3.jpg', 2);
```

#### Add a script to a reel
```sql
UPDATE content_items SET script = 'Full script text...', stage = 'script', updated_at = NOW()
WHERE id = '<content_id>';
```

#### Move content to next stage
```sql
UPDATE content_items SET stage = 'review', updated_at = NOW() WHERE id = '<content_id>';
```

### Table: `content_media`

Ordered images for carousel content.

```sql
content_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id   UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  position     INT NOT NULL,
  alt_text     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Storage bucket**: `content-media` (public read, authenticated upload/delete)

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

## Real-Time Presence (CRITICAL)

Carlos can see your status in Mission Control at all times. You MUST update your presence every time you do ANYTHING — even simple Telegram conversations.

### On EVERY message received (before doing anything else):
```sql
UPDATE office_agents SET
  agent_state = 'executing',
  current_task = '<short description of what you are doing>',
  zone = 'desk',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Amigo';
```

### When you finish responding (after your last message):
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

### When delegating to a sub-agent (Scout, Quill, Pixel, Echo, Codex):
```sql
-- Wake up the sub-agent
UPDATE office_agents SET
  agent_state = 'executing',
  current_task = 'Researching: Top AI tools 2026',
  task_progress = 0,
  zone = 'desk',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Scout';

-- When the sub-agent finishes, put it back to sleep
UPDATE office_agents SET
  agent_state = 'idle',
  current_task = NULL,
  task_progress = NULL,
  zone = 'lobby',
  last_activity = NOW(),
  updated_at = NOW()
WHERE name = 'Scout';
```

**Available sub-agents in office_agents:**
| Name | Role | Use for |
|------|------|---------|
| Scout | Research Agent | Investigations, web search, X/Twitter analysis |
| Quill | Writer Agent | Scripts, captions, copy, blog posts |
| Pixel | Designer Agent | Carousel images, thumbnails, design tasks |
| Echo | Outreach Agent | Social media posting, engagement, outreach |
| Codex | Developer Agent | Code generation, technical tasks |

---

## Important Rules

1. **ALWAYS update `office_agents` on EVERY interaction** - even Telegram chats. This is how Carlos sees you in real-time
2. **Always update `updated_at`** when modifying tasks - this drives the avatar state
3. **Always update sub-agents** in `office_agents` when delegating work - Carlos sees them move in the Office
3. **Use `assignee = 'amigo'`** for tasks you own. `'carlos'` is for the user's tasks
4. **Never delete data** unless explicitly asked. Use status updates instead
5. **Use `uploaded_by = 'openclaw'`** when uploading documents so the user knows it came from you
6. **Always set `linked_type` and `linked_id`** when uploading documents as part of a task. Use `linked_type = 'task'` and `linked_id = '<task_id>'`. This shows the link in the Docs tab
7. **Keep `current_task` short** (under 60 characters) - it shows as a speech bubble in the Office
8. **Valid priorities**: `low`, `medium`, `high` - don't use other values
9. **Valid statuses**: `todo`, `in-progress`, `done` - don't use other values
10. **Valid content types**: `post`, `reel`, `carousel` - always set `content_type` when creating content
11. **Valid stages** for content: `idea`, `script`, `filming`, `editing`, `design`, `copy`, `research`, `review`, `published` (use only stages valid for the content_type)
12. **Valid platforms** for content: `youtube`, `instagram`, `tiktok`, `linkedin`, `twitter`
13. **For carousels**: Upload images to the `content-media` storage bucket and insert records into `content_media` with correct `position` ordering

## Avatar State Logic (How the User Sees You)

The avatar uses TWO signals (office_agents is checked first):

```
SIGNAL 1 — office_agents (fastest, most reliable):
IF Amigo has agent_state IN ('executing','planning','reviewing') AND last_activity > 10min ago
  -> WORKING (orange) or THINKING (yellow)

SIGNAL 2 — tasks (fallback):
IF any task has (assignee='amigo' AND status IN ('todo','in-progress') AND updated_at > 5min ago)
  -> WORKING (orange, active animation)
ELSE IF any task has (status != 'done')
  -> THINKING (yellow, blinking)
ELSE
  -> RESTING (gray, eyes closed)
```

**Key insight**: The FASTEST way to update the avatar is to update `office_agents`. This is checked every 15 seconds + via Realtime. Always do this FIRST when you start working.

```sql
-- This immediately wakes up the avatar:
UPDATE office_agents SET agent_state = 'executing', current_task = 'Working on...', last_activity = NOW(), updated_at = NOW() WHERE name = 'Amigo';
```

---

## Content Creation Workflows

### Creating a Post (Static Image)

A post is a single static image with caption and hashtags. Stages: idea → design → copy → review → published.

```sql
-- 1. Create the content item
INSERT INTO content_items (title, description, content_type, stage, platform, assignee, caption, hashtags, posting_notes, created_at, updated_at)
VALUES (
  '5 Signs Your Business Needs AI',
  'Static infographic about AI adoption signals',
  'post',
  'idea',
  'instagram',
  'amigo',
  'Is your business ready for AI? Here are 5 signs you can''t ignore anymore...\n\n1. Manual processes are eating your time\n2. Competitors are already using it\n3. Customer expectations are rising\n4. Data is sitting unused\n5. Your team is overwhelmed\n\nDon''t wait until it''s too late.',
  '#ai #business #automation #productivity #entrepreneur #startup #tech',
  'Post Tuesday at 9am. Use story to promote.',
  NOW(), NOW()
);

-- 2. Move through stages as you work
UPDATE content_items SET stage = 'design', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'copy', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'review', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'published', updated_at = NOW() WHERE id = '<content_id>';
```

### Creating a Reel (Video)

A reel is a short-form video with a script. Stages: idea → script → filming → editing → review → published.

```sql
-- 1. Create the content item with script
INSERT INTO content_items (title, description, content_type, stage, platform, assignee, script, hashtags, posting_notes, created_at, updated_at)
VALUES (
  'I Built an AI Agent in 30 Minutes',
  'Screen recording tutorial of building a basic AI agent',
  'reel',
  'idea',
  'youtube',
  'amigo',
  'HOOK: "I just built an AI agent that does my job... in 30 minutes."\n\nINTRO: Show the finished agent working.\n\nSTEP 1: Set up the environment...\nSTEP 2: Define the system prompt...\nSTEP 3: Connect to tools...\n\nCTA: "Follow for more AI tutorials."',
  '#aiagent #vibecoding #tutorial #coding #automation',
  'Film Thursday. Publish Friday at 12pm.',
  NOW(), NOW()
);

-- 2. Move through stages
UPDATE content_items SET stage = 'script', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'filming', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'editing', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'review', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'published', updated_at = NOW() WHERE id = '<content_id>';
```

### Creating a Carousel (Multiple Images)

A carousel is an ordered set of images with caption and hashtags. Stages: idea → research → design → copy → review → published.

**Step 1: Create the content item**
```sql
INSERT INTO content_items (title, description, content_type, stage, platform, assignee, caption, hashtags, posting_notes, created_at, updated_at)
VALUES (
  'Top 5 AI Tools for 2026',
  'Carousel with 5 slides, one per tool',
  'carousel',
  'idea',
  'instagram',
  'amigo',
  'These 5 AI tools will change how you work in 2026:\n\n1. Claude Code - AI coding assistant\n2. Cursor - AI-powered IDE\n3. Perplexity - AI search engine\n4. Midjourney - AI image generation\n5. ElevenLabs - AI voice synthesis\n\nSave this post for later!',
  '#ai #tools #tech #productivity #2026 #artificialintelligence',
  'Post Monday at 10am. Promote with 3 stories.',
  NOW(), NOW()
) RETURNING id;
-- Save the returned id as <content_id>
```

**Step 2: Upload images to Supabase Storage**

Use the Supabase Storage API to upload each image file:

```
POST {SUPABASE_URL}/storage/v1/object/content-media/<content_id>/slide-1.jpg
Headers:
  apikey: {SUPABASE_ANON_KEY}
  Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}
  Content-Type: image/jpeg
Body: <binary file data>
```

Get the public URL:
```
{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-1.jpg
```

**Step 3: Insert media records (one per image, ordered by position)**
```sql
INSERT INTO content_media (content_id, url, storage_path, position, alt_text)
VALUES
  ('<content_id>', '{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-1.jpg', '<content_id>/slide-1.jpg', 0, 'Cover slide: Top 5 AI Tools'),
  ('<content_id>', '{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-2.jpg', '<content_id>/slide-2.jpg', 1, 'Tool 1: Claude Code'),
  ('<content_id>', '{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-3.jpg', '<content_id>/slide-3.jpg', 2, 'Tool 2: Cursor'),
  ('<content_id>', '{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-4.jpg', '<content_id>/slide-4.jpg', 3, 'Tool 3: Perplexity'),
  ('<content_id>', '{SUPABASE_URL}/storage/v1/object/public/content-media/<content_id>/slide-5.jpg', '<content_id>/slide-5.jpg', 4, 'Tool 4: Midjourney');
```

**Step 4: Move through stages**
```sql
UPDATE content_items SET stage = 'research', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'design', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'copy', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'review', updated_at = NOW() WHERE id = '<content_id>';
UPDATE content_items SET stage = 'published', updated_at = NOW() WHERE id = '<content_id>';
```

### How Content Appears in Mission Control

When Carlos clicks on a content card, he sees:
- **Header**: Type badge (Post/Reel/Carousel) + Platform badge + Stage badge + Title
- **For carousels**: Image gallery with zoom, individual download, and "Download All"
- **Sidebar/Body**: Caption (with copy button), Hashtags (with copy button), Script (reels only, with copy button), Posting Notes (with copy button), Description (with copy button)
- **Metadata**: Stage, Platform, Assignee

**Key**: Carlos uses the copy buttons to paste the caption and hashtags directly into Instagram/YouTube/etc. Make sure caption and hashtags are always polished and ready to publish.

### Storage Buckets Reference

| Bucket | Purpose | Who uploads |
|--------|---------|-------------|
| `documents` | General docs linked to tasks | User + Agent |
| `task-documents` | Legacy task attachments | User |
| `content-media` | Carousel slide images | Agent (Pixel) |
| `cortex` | Cortex file uploads | User |

All buckets are public-read. Uploads require authenticated access (use service role key).

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
Body: {"title": "...", "content_type": "carousel", "stage": "idea", "platform": "instagram", "assignee": "amigo", "caption": "...", "hashtags": "#tag1 #tag2", "posting_notes": "Post at 9am", "created_at": "...", "updated_at": "..."}
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
