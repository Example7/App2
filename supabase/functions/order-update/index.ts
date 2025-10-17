import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const payload = await req.json();

  await supabase.from("logs").insert({
    event: "Nowe zamówienie",
    payload,
  });

  console.log("Nowe zamówienie:", payload);

  setTimeout(async () => {
    await supabase
      .from("orders")
      .update({ status: "Zakończone" })
      .eq("id", payload.id);

    await supabase.from("logs").insert({
      event: "Zmieniono status zamówienia na Zakończone",
      payload,
    });
  }, 10000);

  return new Response("Edge Function wykonana!", { status: 200 });
});
