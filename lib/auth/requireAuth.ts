import { supabaseBrowser } from "@/lib/supabase/client";

export async function requireAuth() {
  const supabase = supabaseBrowser();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
