import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cvofvffeabstndbuzwjc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2b2Z2ZmZlYWJzdG5kYnV6d2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTA0NDgsImV4cCI6MjA4NzA4NjQ0OH0.aEeyaSMDKWuUeNTPRHguPhwrlXbB6yj5T2FdPwcdbSM'
);

async function main() {
  const { data, error } = await supabase.from('tasks').select('*');
  console.log('Current tasks:', JSON.stringify(data, null, 2));
}

main();
