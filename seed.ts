import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://cvofvffeabstndbuzwjc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2b2Z2ZmZlYWJzdG5kYnV6d2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTA0NDgsImV4cCI6MjA4NzA4NjQ0OH0.aEeyaSMDKWuUeNTPRHguPhwrlXbB6yj5T2FdPwcdbSM"
);

// Generate UUID
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seedData() {
  console.log("Seeding sample data...");

  const now = new Date().toISOString();

  // Tasks (use timestamps for created_at)
  const tasks = [
    { id: uuid(), title: "Revisar pipeline de Virtual Staging Pro", description: "Verificar que los leads fluyan correctamente al CRM", status: "in-progress", assignee: "carlos", priority: "high", notes: "Hacer test con lead real", created_at: now, updated_at: now },
    { id: uuid(), title: "Configurar automatizaciones de Make para UEPM", description: "Crear workflow de lease renewal notifications", status: "todo", assignee: "amigo", priority: "medium", notes: "参考 existing workflows en n8n", created_at: now, updated_at: now },
    { id: uuid(), title: "Grabar video tutorial de LandlordPal", description: "Tutorial de 5 min para onboarding", status: "todo", assignee: "carlos", priority: "medium", created_at: now, updated_at: now },
    { id: uuid(), title: "Review de métricas semanales", description: "Analizar KPIs de todas las propiedades", status: "done", assignee: "carlos", priority: "low", created_at: now, updated_at: now },
    { id: uuid(), title: "Investigar integraciones de WhatsApp API", description: "Comparar opciones para automatizaciones", status: "todo", assignee: "amigo", priority: "high", created_at: now, updated_at: now },
  ];

  // Content Pipeline
  const contentItems = [
    { id: uuid(), title: "Cómo automatizar tu property management", description: "Reel sobre automatización", stage: "editing", platform: "instagram", assignee: "carlos", created_at: now },
    { id: uuid(), title: "Tutorial LandlordPal - Demo completa", description: "Video tutorial para YouTube", stage: "filming", platform: "youtube", assignee: "carlos", created_at: now },
    { id: uuid(), title: "5 herramientas IA para real estate", description: "Carrusel educativo", stage: "script", platform: "instagram", assignee: "amigo", created_at: now },
    { id: uuid(), title: "Case study: 50% reducción de vacancy", description: "Historia de éxito Upper Edge", stage: "idea", platform: "linkedin", assignee: "carlos", created_at: now },
  ];

  // Calendar Events
  const calendarEvents = [
    { id: uuid(), title: "Daily standup", time: "09:00", day_of_week: -1, color: "#7c3aed", is_recurring: true, interval_type: "daily" },
    { id: uuid(), title: "Review propiedades", time: "14:00", day_of_week: 1, color: "#10b981", is_recurring: true, interval_type: "weekly" },
    { id: uuid(), title: "Team sync", time: "11:00", day_of_week: 3, color: "#f59e0b", is_recurring: true, interval_type: "weekly" },
    { id: uuid(), title: "Content planning", time: "10:00", day_of_week: 5, color: "#ef4444", is_recurring: true, interval_type: "weekly" },
  ];

  // Team Members
  const teamMembers = [
    { id: uuid(), name: "Carlos", role: "Founder & CEO", description: "Visionario y operador principal", skills: "Strategy, Sales, Operations", color: "#7c3aed", layer: "leadership", avatar: "👤", created_at: now },
    { id: uuid(), name: "Amigo", role: "Chief of Staff", description: "Tu AI partner técnico", skills: "Development, Automation, Research", color: "#ff6b00", layer: "leadership", avatar: "🤖", created_at: now },
    { id: uuid(), name: "Scout", role: "Research Agent", description: "Investiga oportunidades y tendencias", skills: "Web research, Analysis", color: "#10b981", layer: "agent", avatar: "🔍", created_at: now },
    { id: uuid(), name: "Quill", role: "Writer Agent", description: "Crea contenido y copy", skills: "Writing, Copywriting", color: "#3b82f6", layer: "agent", avatar: "✍️", created_at: now },
    { id: uuid(), name: "Pixel", role: "Designer Agent", description: "Diseño visual y branding", skills: "Design, UI/UX", color: "#ec4899", layer: "agent", avatar: "🎨", created_at: now },
    { id: uuid(), name: "Echo", role: "Outreach Agent", description: "Automatización de mensajes", skills: "Messaging, Sales", color: "#f59e0b", layer: "agent", avatar: "📢", created_at: now },
    { id: uuid(), name: "Codex", role: "Developer Agent", description: "Code reviews y arquitectura", skills: "Development, Architecture", color: "#06b6d4", layer: "meta", avatar: "💻", created_at: now },
  ];

  // Office Agents
  const officeAgents = [
    { id: "oa-1", name: "Carlos", role: "Founder", avatar: "👤", color: "#7c3aed", agent_state: "executing", current_task: "Revisar pipeline VSP", task_progress: 65, zone: "desk", channel: "telegram", last_activity: now, updated_at: now },
    { id: "oa-2", name: "Amigo", role: "Chief of Staff", avatar: "🤖", color: "#ff6b00", agent_state: "planning", current_task: "Research WhatsApp API", task_progress: 20, zone: "desk", channel: "telegram", last_activity: now, updated_at: now },
    { id: "oa-3", name: "Scout", role: "Research", avatar: "🔍", color: "#10b981", agent_state: "idle", current_task: "Waiting for task", task_progress: 0, zone: "desk", channel: "none", last_activity: now, updated_at: now },
    { id: "oa-4", name: "Quill", role: "Writer", avatar: "✍️", color: "#3b82f6", agent_state: "executing", current_task: "Writing script", task_progress: 80, zone: "desk", channel: "none", last_activity: now, updated_at: now },
    { id: "oa-5", name: "Pixel", role: "Designer", avatar: "🎨", color: "#ec4899", agent_state: "waiting_api", current_task: "Generating thumbnails", task_progress: 45, zone: "desk", channel: "none", last_activity: now, updated_at: now },
    { id: "oa-6", name: "Echo", role: "Outreach", avatar: "📢", color: "#f59e0b", agent_state: "idle", current_task: "Waiting for task", task_progress: 0, zone: "lobby", channel: "none", last_activity: now, updated_at: now },
    { id: "oa-7", name: "Codex", role: "Developer", avatar: "💻", color: "#06b6d4", agent_state: "review", current_task: "Code review MC", task_progress: 90, zone: "desk", channel: "none", last_activity: now, updated_at: now },
  ];

  // Disable RLS temporarily for seeding
  await supabase.rpc('pg_catalog.set_config', { setting_name: 'datestyle', setting_value: 'ISO, MDY' });

  const { error: tasksError } = await supabase.from("tasks").upsert(tasks);
  if (tasksError) console.error("Tasks error:", tasksError.message);
  else console.log("✅ Tasks seeded");

  const { error: contentError } = await supabase.from("content_items").upsert(contentItems);
  if (contentError) console.error("Content error:", contentError.message);
  else console.log("✅ Content seeded");

  const { error: calError } = await supabase.from("calendar_events").upsert(calendarEvents);
  if (calError) console.error("Calendar error:", calError.message);
  else console.log("✅ Calendar seeded");

  const { error: tmError } = await supabase.from("team_members").upsert(teamMembers);
  if (tmError) console.error("Team error:", tmError.message);
  else console.log("✅ Team seeded");

  console.log("🎉 Done!");
}

seedData();
