-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/markdown']);

-- Create policies for public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'documents');
