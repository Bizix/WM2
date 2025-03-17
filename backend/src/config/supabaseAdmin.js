const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Load environment variables

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabaseAdmin };
