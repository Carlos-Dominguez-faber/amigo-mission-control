# Amigo Mission Control - User Guide

## Overview

Mission Control is your personal command center with 8 tabs. Your AI assistant **Amigo** (OpenClaw agent) can interact with the platform via Telegram and direct database access.

The avatar in the header shows Amigo's real-time state:
- **Working** (orange, active eyes): Amigo has active tasks updated in the last 5 minutes
- **Thinking** (yellow, blinking): There are pending tasks in the system
- **Resting** (gray, eyes closed): All tasks are done

---

## Tab 1: Tasks

Your task management board with three columns: **Todo**, **In Progress**, **Done**.

**How to use:**
- Click **"+ Add Task"** to create a new task
- Set title, description, assignee (Carlos or Amigo), and priority (low/medium/high)
- Drag or click to move tasks between columns
- Click a task card to edit details, add notes, or attach documents
- Tasks assigned to "Amigo" will make the header avatar show as working

**Ask Amigo via Telegram:**
> "Amigo, crea una tarea: Investigar competidores de NanoBanana, prioridad alta"
> "Amigo, marca la tarea de 'Deploy staging' como completada"
> "Amigo, asignate la tarea de revisar el codigo del nuevo feature"

---

## Tab 2: Content

Kanban board for managing content production across platforms.

**Stages:** Idea -> Script -> Thumbnail -> Filming -> Editing -> Published

**How to use:**
- Click **"+ Add Content"** to create a new content item
- Set title, description, platform (YouTube/Instagram/TikTok/LinkedIn/Twitter), stage, and assignee
- Toggle assignee between Carlos and Amigo
- Write scripts directly in the Script field
- Attach reference documents (images, PDFs) in edit mode
- Move items through stages as production progresses

**Ask Amigo via Telegram:**
> "Amigo, crea una idea de video para YouTube: 'Como usar AI para automatizar tu negocio'"
> "Amigo, escribe un script para el video de NanoBanana en TikTok"
> "Amigo, mueve el contenido 'AI Tools Review' a la etapa de editing"

---

## Tab 3: Calendar

Weekly calendar showing recurring and one-time events.

**How to use:**
- Click **"+ New Event"** to create an event
- Set title, time, day of the week, and color
- Toggle "Recurring" for repeating events (daily/weekly/monthly)
- Select "Every day" for events that happen daily
- Attach resources (documents, links) to events in edit mode
- Click an event to edit or delete it

**Ask Amigo via Telegram:**
> "Amigo, agrega un evento al calendario: Standup diario a las 9:00 AM, recurrente"
> "Amigo, crea un evento el Lunes a las 2 PM: Revision de contenido, color verde"

---

## Tab 4: Memory

A log of important information, decisions, preferences, and context that Amigo should remember.

**Types:** General, Preference, Decision, Context

**How to use:**
- Click **"+ New Memory"** to add a memory entry
- Set title, content, and type
- Filter memories by type using the pill buttons
- Click a memory to edit or delete it
- Use this to train Amigo on your preferences and decisions

**Ask Amigo via Telegram:**
> "Amigo, recuerda esto: Siempre usar Tailwind CSS en vez de styled-components"
> "Amigo, guarda como decision: El stack principal es Next.js + Supabase"
> "Amigo, agrega a memoria: Mi horario de trabajo es de 8 AM a 6 PM"

---

## Tab 5: Team

Directory of all team members and AI agents.

**How to use:**
- View team members with their roles, skills, and layer (Core/Extended/AI)
- Click **"+ Add Member"** to add a new team member
- Each member has a color-coded avatar
- Use the search or filter by layer

---

## Tab 6: Office

2D pixel-art virtual office showing all agents and their real-time status.

**Zones:**
- **Desk** (workspace): Agents actively working
- **Meeting** (war room): Agents in collaboration/planning
- **Lobby** (lounge): Agents idle or on break

**Agent States:**
- **Executing** (green, pulsing): Actively working on a task
- **Planning** (blue): Thinking about approach
- **Reviewing** (yellow): Reviewing work
- **Idle** (gray): Not doing anything

**How to use:**
- View agents in their current zone with status indicators
- Click an agent to see their current task and progress
- Right-click/long-press to update zone, state, task, and progress
- Speech bubbles show what each agent is currently working on

**Ask Amigo via Telegram:**
> "Amigo, actualiza tu estado en la oficina: trabajando en el deploy, zona desk, progreso 50%"

---

## Tab 7: Docs

File manager with hierarchical folders for storing documents and reports.

**How to use:**
- Click **"+ New Folder"** to create a folder
- Click **"Upload"** or drag-and-drop files to upload (max 10 MB)
- Navigate into folders by clicking them
- Use the breadcrumb trail to navigate back
- Click a file to preview it (images, PDFs) or download
- Use the kebab menu (three dots) to rename or delete items
- Documents can be linked to tasks, content, and calendar events

**Ask Amigo via Telegram:**
> "Amigo, sube el reporte semanal a la carpeta Reports"
> "Amigo, crea una carpeta llamada 'Q1 2026 Reports'"

---

## Tab 8: Cortex

AI-powered knowledge inbox. Capture anything and AI automatically analyzes and categorizes it.

**Source types:** Text, Link, Image, Voice Note, File

**Categories (auto-assigned by AI):**
- Vibe Coding (blue) - Coding techniques, dev tools
- OpenClaw (green) - AI agents, automation
- Prompts (purple) - Prompt engineering, system prompts
- NanoBanana (yellow) - NanoBanana project
- Resources (cyan) - Tutorials, courses, references
- Ideas (orange) - Business/project ideas

**Status workflow:** Unread -> Read -> Implemented

**How to use:**
- Click **"+ Capture"** to add a new item
- Choose a tab: Text (notes/prompts), Link (URLs), Image, Voice (record), File
- AI will auto-analyze and categorize within seconds
- Filter by status (Unread/Read/Implemented) and category
- Click a card to see full details and AI analysis
- Click **"Send to Agent"** to create a task for Amigo from any item
- Change status as you process items

**Ask Amigo via Telegram:**
> "Amigo, agrega esto al Cortex: https://github.com/some/cool-project"
> "Amigo, guarda este prompt en Cortex: 'Eres un experto en...'"
> "Amigo, agrega al Cortex como idea: App de tracking de habitos con AI"

---

## How Amigo Connects to Mission Control

Amigo (OpenClaw) interacts with Mission Control through **direct Supabase database access**. Everything Amigo does in the database is immediately reflected in the UI.

### The Avatar Connection
The header avatar updates automatically based on task activity:
1. When Amigo creates or updates a task assigned to himself -> Avatar shows **Working**
2. When there are pending tasks but none recently active -> Avatar shows **Thinking**
3. When all tasks are done -> Avatar shows **Resting**

### What Amigo Can Do
| Action | How |
|--------|-----|
| Create tasks | INSERT into `tasks` table |
| Update task status | UPDATE `tasks` SET status, updated_at |
| Create content | INSERT into `content_items` table |
| Add memories | INSERT into `memories` table |
| Create calendar events | INSERT into `calendar_events` table |
| Upload documents | Upload to Supabase Storage + INSERT into `documents` |
| Add Cortex items | INSERT into `cortex_items` table |
| Update office status | UPDATE `office_agents` table |

### Tips
- Always check the avatar to know if Amigo is active
- Use Cortex's "Send to Agent" to quickly delegate items to Amigo
- Attach documents to any feature item for context
- Use Memory to store persistent context that Amigo should always know
