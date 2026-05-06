import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [status, setStatus] = useState<"working"|"done"|"error">("working");
  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (!email) { setStatus("error"); return; }
    supabase.functions.invoke("unsubscribe", { body: { email } })
      .then(({ error }) => setStatus(error ? "error" : "done"));
  }, []);
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl mb-3">Scrub Signs</h1>
        {status === "working" && <p className="text-muted-foreground italic">Pulling you off the list…</p>}
        {status === "done" && <p className="text-foreground/90">You're unsubscribed. Take care of yourself out there.</p>}
        {status === "error" && <p className="text-destructive">Something didn't work. Reply to any email and we'll handle it.</p>}
      </div>
    </main>
  );
};
export default Unsubscribe;
