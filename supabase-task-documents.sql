-- Migration: Task Documents
-- Run this in Supabase SQL Editor for project: cvofvffeabstndbuzwjc

-- Tabla para documentos adjuntos a tasks
CREATE TABLE IF NOT EXISTS task_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_documents_task_id ON task_documents(task_id);

-- Storage bucket para documentos de tasks
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-documents', 'task-documents', true)
ON CONFLICT DO NOTHING;

-- Politicas de Storage
CREATE POLICY "Public read task documents"
  ON storage.objects FOR SELECT USING (bucket_id = 'task-documents');

CREATE POLICY "Auth users upload task documents"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users delete task documents"
  ON storage.objects FOR DELETE USING (bucket_id = 'task-documents' AND auth.role() = 'authenticated');
