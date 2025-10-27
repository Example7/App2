import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const payload = await req.json();

  await supabase.from("logs").insert({
    event: "New order created",
    payload,
  });

  console.log("New order:", payload);

  setTimeout(async () => {
    await supabase
      .from("orders")
      .update({
        status: "completed",
      })
      .eq("id", payload.id);

    await supabase.from("logs").insert({
      event: "Order status updated to 'completed'",
      payload,
    });
  }, 10000);

  return new Response("Edge Function executed successfully!", {
    status: 200,
  });
});
