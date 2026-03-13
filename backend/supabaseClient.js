const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wgxftgumriwhhaoreeae.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneGZ0Z3Vtcml3aGhhb3JlZWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDA2MzUsImV4cCI6MjA4ODYxNjYzNX0.cahE4G_6ITPxuY17ORdjNT5Eq6qBj78_3uGVbfEL_kA";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;




