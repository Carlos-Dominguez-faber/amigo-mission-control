// Supabase hooks for all tables

import { supabase } from "@/lib/supabase";

export const db = {
  // Generic helpers
  async getAll(table: string) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return data;
  },

  async insert(table: string, rows: any[]) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw error;
  },

  async delete(table: string) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
  },

  // Tasks
  async getTasks() {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data?.map((t: any) => ({ ...t, created_at: new Date(t.created_at).getTime(), updated_at: new Date(t.updated_at).getTime() })) || [];
  },

  async syncTasks(tasks: any[]) {
    await this.delete("tasks");
    if (tasks.length > 0) {
      await this.insert("tasks", tasks.map(t => ({
        title: t.title,
        description: t.description,
        status: t.status,
        assignee: t.assignee,
        priority: t.priority || "medium",
        notes: t.notes,
        created_at: new Date(t.created_at),
        updated_at: new Date(),
      })));
    }
  },

  // Documents
  async getDocuments() {
    const { data, error } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data?.map((d: any) => ({ ...d, uploaded_at: new Date(d.uploaded_at).getTime() })) || [];
  },

  async addDocument(doc: any) {
    const { error } = await supabase.from("documents").insert([{
      name: doc.name,
      type: doc.type,
      content: doc.content,
      url: doc.url,
      uploaded_at: new Date(),
    }]);
    if (error) throw error;
  },

  // Content Items
  async getContentItems() {
    const { data, error } = await supabase.from("content_items").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data?.map((c: any) => ({ ...c, created_at: new Date(c.created_at).getTime(), updated_at: new Date(c.updated_at).getTime() })) || [];
  },

  async syncContentItems(items: any[]) {
    await supabase.from("content_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (items.length > 0) {
      await this.insert("content_items", items.map(i => ({
        title: i.title,
        description: i.description,
        stage: i.stage,
        platform: i.platform,
        assignee: i.assignee,
        script: i.script,
        image_url: i.imageUrl,
        created_at: new Date(i.created_at),
        updated_at: new Date(),
      })));
    }
  },

  // Calendar Events
  async getCalendarEvents() {
    const { data, error } = await supabase.from("calendar_events").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async syncCalendarEvents(events: any[]) {
    await supabase.from("calendar_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (events.length > 0) {
      await this.insert("calendar_events", events.map(e => ({
        title: e.title,
        time: e.time,
        day_of_week: e.dayOfWeek,
        color: e.color,
        is_recurring: e.isRecurring,
        interval_type: e.interval,
        created_at: new Date(),
      })));
    }
  },

  // Memories
  async getMemories() {
    const { data, error } = await supabase.from("memories").select("*").order("timestamp", { ascending: false });
    if (error) throw error;
    return data?.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp).getTime() })) || [];
  },

  async addMemory(memory: any) {
    const { error } = await supabase.from("memories").insert([{
      title: memory.title,
      content: memory.content,
      memory_type: memory.type,
      timestamp: new Date(),
    }]);
    if (error) throw error;
  },

  // Team Members
  async getTeamMembers() {
    const { data, error } = await supabase.from("team_members").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async syncTeamMembers(members: any[]) {
    await supabase.from("team_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (members.length > 0) {
      await this.insert("team_members", members.map(m => ({
        name: m.name,
        role: m.role,
        description: m.description,
        skills: m.skills,
        color: m.color,
        color_hex: m.colorHex,
        layer: m.layer,
        avatar: m.avatar,
        created_at: new Date(),
      })));
    }
  },

  // Office Agents
  async getOfficeAgents() {
    const { data, error } = await supabase.from("office_agents").select("*");
    if (error) throw error;
    return data?.map((a: any) => ({ ...a, last_activity: a.last_activity ? new Date(a.last_activity).getTime() : null, updated_at: new Date(a.updated_at).getTime() })) || [];
  },

  async syncOfficeAgents(agents: any[]) {
    for (const agent of agents) {
      await supabase.from("office_agents").upsert({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        avatar: agent.avatar,
        color: agent.color,
        color_hex: agent.colorHex,
        agent_state: agent.state,
        current_task: agent.currentTask,
        task_progress: agent.taskProgress,
        zone: agent.zone,
        last_activity: agent.lastActivity ? new Date(agent.lastActivity) : null,
        channel: agent.channel,
        updated_at: new Date(),
      });
    }
  },
};
