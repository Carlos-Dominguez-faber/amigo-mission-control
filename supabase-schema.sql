-- Mission Control Database Schema

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  assignee TEXT DEFAULT 'carlos',
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  url TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Items
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stage TEXT DEFAULT 'idea',
  platform TEXT DEFAULT 'youtube',
  assignee TEXT DEFAULT 'carlos',
  script TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  day_of_week INTEGER DEFAULT -1,
  color TEXT DEFAULT 'blue',
  is_recurring BOOLEAN DEFAULT true,
  interval_type TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  memory_type TEXT DEFAULT 'daily',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  skills TEXT[],
  color TEXT DEFAULT 'blue',
  color_hex TEXT DEFAULT '#3b82f6',
  layer TEXT DEFAULT 'agent',
  avatar TEXT DEFAULT '📄',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Office Agents
CREATE TABLE IF NOT EXISTS office_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT DEFAULT '📄',
  color TEXT DEFAULT 'slate',
  color_hex TEXT DEFAULT '#64748b',
  agent_state TEXT DEFAULT 'idle',
  current_task TEXT,
  task_progress INTEGER,
  zone TEXT DEFAULT 'desk',
  last_activity TIMESTAMP WITH TIME ZONE,
  channel TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (optional - commented out for now)
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE office_agents ENABLE ROW LEVEL SECURITY;
