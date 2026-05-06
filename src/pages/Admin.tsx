import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ZODIAC, SPECIALTIES } from "@/lib/scrubsigns";

const ADMIN_PASSWORD = "scrubsigns2026"; // MVP only

type Sub = {
  id: string; first_name: string; email: string; zodiac_sign: string;
  specialty: string; word_selections: string[]; source: string; created_at: string;
};
type Reading = {
  id: string; date: string; zodiac_sign: string; specialty: string;
  long_reading: string; specialty_line: string; affirmation: string; email_subject: string;
};

const Admin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ss_admin") === "1");
  const [pw, setPw] = useState("");
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <form
          onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) { sessionStorage.setItem("ss_admin","1"); setAuthed(true); } }}
          className="bg-surface-elevated border border-border p-7 w-full max-w-xs">
          <h2 className="font-display text-2xl mb-4">Admin</h2>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password"
            className="w-full bg-surface border border-border px-3 py-2.5 mb-4 text-sm focus:outline-none focus:border-gold" />
          <button className="w-full py-2.5 text-sm text-primary-foreground" style={{ background: "hsl(var(--gold))" }}>Enter</button>
        </form>
      </main>
    );
  }
  return <Dashboard />;
};

function Dashboard() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [tab, setTab] = useState<"stats"|"subs"|"content">("stats");
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(5000);
      setSubs((s as Sub[]) || []);
      const { data: r } = await supabase.from("daily_readings").select("*").eq("date", today);
      setReadings((r as Reading[]) || []);
    })();
  }, [today]);

  const total = subs.length;
  const dayCount = (days: number) => {
    const cutoff = Date.now() - days * 86400000;
    return subs.filter(s => new Date(s.created_at).getTime() > cutoff).length;
  };

  const groupBy = (key: keyof Sub) => {
    const map = new Map<string, number>();
    subs.forEach(s => {
      const v = String(s[key] ?? "—");
      map.set(v, (map.get(v) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a,b)=>b[1]-a[1]);
  };

  const wordCounts = (() => {
    const m = new Map<string, number>();
    subs.forEach(s => s.word_selections?.forEach(w => m.set(w, (m.get(w)||0)+1)));
    return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
  })();

  const exportCsv = () => {
    const header = ["first_name","email","zodiac_sign","specialty","word_selections","source","created_at"];
    const rows = subs.map(s => header.map(h => {
      const v = (s as any)[h];
      const cell = Array.isArray(v) ? v.join("|") : String(v ?? "");
      return `"${cell.replace(/"/g,'""')}"`;
    }).join(","));
    const blob = new Blob([header.join(",") + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `scrubsigns-${today}.csv`; a.click();
  };

  return (
    <main className="min-h-screen p-5 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Scrub Signs · Admin</h1>
        <div className="flex gap-2 text-xs">
          {(["stats","subs","content"] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 border ${tab===t?"border-gold text-gold":"border-border text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "stats" && (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total" value={total} />
            <Stat label="Today" value={dayCount(1)} />
            <Stat label="7 days" value={dayCount(7)} />
            <Stat label="30 days" value={dayCount(30)} />
          </div>
          <Bars title="By zodiac" data={ZODIAC.map(z => [z.name, subs.filter(s=>s.zodiac_sign===z.name).length] as [string,number])} />
          <Bars title="By specialty" data={SPECIALTIES.map(s => [s, subs.filter(x=>x.specialty===s).length] as [string,number])} />
          <Bars title="By word" data={wordCounts} />
          <div className="bg-surface border border-border p-5">
            <h3 className="font-display text-xl mb-3">By source</h3>
            <table className="w-full text-sm">
              <tbody>{groupBy("source").map(([k,v])=>(
                <tr key={k} className="border-b border-border/40"><td className="py-1.5">{k}</td><td className="text-right text-gold">{v}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "subs" && (
        <div>
          <div className="flex justify-between mb-3">
            <p className="text-sm text-muted-foreground">{subs.length} subscribers</p>
            <button onClick={exportCsv} className="text-xs px-3 py-1.5 border border-gold text-gold">Export CSV</button>
          </div>
          <div className="overflow-x-auto bg-surface border border-border">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-surface-elevated">
                <tr>{["Name","Email","Sign","Unit","Words","Source","Date"].map(h=><th key={h} className="text-left p-2 font-normal">{h}</th>)}</tr>
              </thead>
              <tbody>{subs.map(s => (
                <tr key={s.id} className="border-t border-border/30">
                  <td className="p-2">{s.first_name}</td>
                  <td className="p-2 text-muted-foreground">{s.email}</td>
                  <td className="p-2">{s.zodiac_sign}</td>
                  <td className="p-2">{s.specialty}</td>
                  <td className="p-2 text-xs text-muted-foreground">{s.word_selections?.join(", ")}</td>
                  <td className="p-2 text-xs">{s.source}</td>
                  <td className="p-2 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "content" && <ContentEditor readings={readings} setReadings={setReadings} today={today} />}
    </main>
  );
}

function Stat({label, value}:{label:string; value:number}) {
  return (
    <div className="bg-surface border border-border p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-display text-3xl text-gold mt-1">{value}</div>
    </div>
  );
}

function Bars({title, data}: {title:string; data:[string,number][]}) {
  const max = Math.max(1, ...data.map(d=>d[1]));
  return (
    <div className="bg-surface border border-border p-5">
      <h3 className="font-display text-xl mb-3">{title}</h3>
      <div className="space-y-1.5">{data.map(([k,v])=>(
        <div key={k} className="flex items-center gap-3 text-sm">
          <div className="w-24 text-muted-foreground text-xs">{k}</div>
          <div className="flex-1 h-2 bg-background relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gold/70" style={{width: `${(v/max)*100}%`}} />
          </div>
          <div className="w-8 text-right text-xs text-gold">{v}</div>
        </div>
      ))}</div>
    </div>
  );
}

function ContentEditor({readings, setReadings, today}:{readings:Reading[]; setReadings:(r:Reading[])=>void; today:string}) {
  const [editing, setEditing] = useState<Reading | null>(null);
  const [newRow, setNewRow] = useState<Partial<Reading>>({ date: today, zodiac_sign: "Aries", specialty: "ICU" });

  const save = async (r: Reading) => {
    await supabase.from("daily_readings").update({
      long_reading: r.long_reading, specialty_line: r.specialty_line,
      affirmation: r.affirmation, email_subject: r.email_subject,
    }).eq("id", r.id);
    setEditing(null);
  };
  const create = async () => {
    const { data } = await supabase.from("daily_readings").insert({
      date: newRow.date, zodiac_sign: newRow.zodiac_sign, specialty: newRow.specialty,
      long_reading: newRow.long_reading || "", specialty_line: newRow.specialty_line || "",
      affirmation: newRow.affirmation || "", email_subject: newRow.email_subject || "",
    } as any).select().single();
    if (data) setReadings([...(readings||[]), data as Reading]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border p-5">
        <h3 className="font-display text-xl mb-3">Today's readings ({today})</h3>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground"><tr><th className="text-left p-2 font-normal">Sign</th><th className="text-left p-2 font-normal">Unit</th><th className="text-left p-2 font-normal">Subject</th><th /></tr></thead>
          <tbody>{readings.map(r=>(
            <tr key={r.id} className="border-t border-border/30">
              <td className="p-2">{r.zodiac_sign}</td>
              <td className="p-2">{r.specialty}</td>
              <td className="p-2 text-muted-foreground text-xs">{r.email_subject || "—"}</td>
              <td className="p-2 text-right"><button onClick={()=>setEditing(r)} className="text-gold text-xs">Edit</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="bg-surface border border-border p-5">
        <h3 className="font-display text-xl mb-3">Add reading</h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <select value={newRow.zodiac_sign} onChange={e=>setNewRow({...newRow, zodiac_sign:e.target.value})} className="bg-background border border-border px-2 py-1.5 text-sm">
            {ZODIAC.map(z=><option key={z.name}>{z.name}</option>)}
          </select>
          <select value={newRow.specialty} onChange={e=>setNewRow({...newRow, specialty:e.target.value})} className="bg-background border border-border px-2 py-1.5 text-sm">
            {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
          </select>
          <input type="date" value={newRow.date} onChange={e=>setNewRow({...newRow, date:e.target.value})} className="bg-background border border-border px-2 py-1.5 text-sm" />
        </div>
        <input placeholder="Email subject" value={newRow.email_subject||""} onChange={e=>setNewRow({...newRow, email_subject:e.target.value})} className="w-full bg-background border border-border px-2 py-1.5 text-sm mb-2" />
        <input placeholder="Affirmation" value={newRow.affirmation||""} onChange={e=>setNewRow({...newRow, affirmation:e.target.value})} className="w-full bg-background border border-border px-2 py-1.5 text-sm mb-2" />
        <textarea placeholder="Long reading" value={newRow.long_reading||""} onChange={e=>setNewRow({...newRow, long_reading:e.target.value})} className="w-full bg-background border border-border px-2 py-2 text-sm mb-2 h-28" />
        <textarea placeholder="Specialty line" value={newRow.specialty_line||""} onChange={e=>setNewRow({...newRow, specialty_line:e.target.value})} className="w-full bg-background border border-border px-2 py-2 text-sm mb-2 h-16" />
        <button onClick={create} className="px-4 py-2 text-sm text-primary-foreground" style={{ background: "hsl(var(--gold))" }}>Save reading</button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-5" onClick={()=>setEditing(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-surface-elevated border border-border max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl mb-4">{editing.zodiac_sign} · {editing.specialty}</h3>
            <label className="text-xs text-muted-foreground">Email subject</label>
            <input value={editing.email_subject} onChange={e=>setEditing({...editing, email_subject:e.target.value})} className="w-full bg-background border border-border px-2 py-1.5 text-sm mb-3 mt-1" />
            <label className="text-xs text-muted-foreground">Affirmation</label>
            <input value={editing.affirmation} onChange={e=>setEditing({...editing, affirmation:e.target.value})} className="w-full bg-background border border-border px-2 py-1.5 text-sm mb-3 mt-1" />
            <label className="text-xs text-muted-foreground">Long reading</label>
            <textarea value={editing.long_reading} onChange={e=>setEditing({...editing, long_reading:e.target.value})} className="w-full bg-background border border-border px-2 py-2 text-sm mb-3 mt-1 h-40" />
            <label className="text-xs text-muted-foreground">Specialty line</label>
            <textarea value={editing.specialty_line} onChange={e=>setEditing({...editing, specialty_line:e.target.value})} className="w-full bg-background border border-border px-2 py-2 text-sm mb-4 mt-1 h-20" />
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="px-4 py-2 text-sm border border-border">Cancel</button>
              <button onClick={()=>save(editing)} className="px-4 py-2 text-sm text-primary-foreground" style={{ background: "hsl(var(--gold))" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
