// Avisos push de Notas de Cursos: clave VAPID, suscripción, aviso de prueba y aviso diario (cron 6:00 a. m. Lima)
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-secret", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

// Secretos en caché 60 s (así una rotación se aplica sola). Las claves VAPID se generan aquí
// la primera vez, para que nunca salgan del servidor; se vuelve a leer por si dos arranques compiten.
let sec: Record<string, string> | null = null, secAt = 0;
async function loadSecrets() {
  const { data, error } = await sb.from("app_secrets").select("name,value");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.name, r.value]));
}
async function secrets() {
  if (!sec || Date.now() - secAt > 60e3) {
    let s = await loadSecrets();
    if (!s.vapid_public || !s.vapid_private) {
      const k = webpush.generateVAPIDKeys();
      await sb.from("app_secrets").upsert([{ name: "vapid_public", value: k.publicKey }, { name: "vapid_private", value: k.privateKey }], { onConflict: "name", ignoreDuplicates: true });
      s = await loadSecrets();
    }
    webpush.setVapidDetails("https://alexmaster113.github.io/notas-cursos", s.vapid_public, s.vapid_private);
    sec = s; secAt = Date.now();
  }
  return sec;
}
const enc = new TextEncoder();
function sameSecret(a: string, b: string) {
  const x = enc.encode(a), y = enc.encode(b);
  if (y.length < 32 || x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
// Solo servicios de push reales (evita usar la función para llamar a cualquier URL)
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/, /^web\.push\.apple\.com$/];
const okEndpoint = (e: unknown) => { try { const u = new URL(String(e)); return u.protocol === "https:" && PUSH_HOSTS.some((r) => r.test(u.hostname)); } catch { return false; } };

const limaToday = () => new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
const days = (a: string, b: string) => Math.round((Date.parse(a + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / 864e5);
const EM = ["🟢", "🟡", "🔴", "⚫"];

// Mismos colores y textos que la pestaña Tareas; atrasadas solo el primer día o si se pospuso
function msg(t: any, abbr: string, today: string) {
  const dd = days(t.due_date, today), over = dd < 0;
  if (over && !(dd == -1 || (t.snooze_until && t.snooze_until >= today))) return null;
  const lv = over ? 3 : dd >= 4 ? 0 : dd >= 2 ? 1 : 2;
  const [, m, d] = t.due_date.split("-");
  const txt = over ? `atrasada ${-dd} ${-dd == 1 ? "día" : "días"}` : dd == 0 ? "vence hoy" : dd == 1 ? "vence mañana" : `faltan ${dd} días`;
  return { title: `${EM[lv]} ${abbr} · ${t.title}`, body: `Entrega ${d}/${m} · ${txt}`, tag: t.id, url: "./#tareas" };
}

async function sendTo(uid: string, payloads: unknown[]) {
  const { data: subs } = await sb.from("push_subs").select("id,sub").eq("user_id", uid);
  let sent = 0;
  for (const s of subs ?? []) {
    for (const p of payloads) {
      try { await webpush.sendNotification(s.sub, JSON.stringify(p), { TTL: 6 * 3600 }); sent++; }
      catch (e: any) {
        if (e?.statusCode == 404 || e?.statusCode == 410) { await sb.from("push_subs").delete().eq("id", s.id); break; }
        console.error("push", e?.statusCode, e?.body ?? e);
      }
    }
  }
  return sent;
}

// Avisos de tareas de todos (cron) o de un solo usuario (botón "Enviar avisos ahora")
async function daily(onlyUser?: string) {
  const today = limaToday();
  let tq = sb.from("tasks").select("id,user_id,course_id,title,due_date,snooze_until").eq("done", false).eq("deleted", false).order("due_date");
  let cq = sb.from("courses").select("id,abbr,cycle_id,deleted");
  if (onlyUser) { tq = tq.eq("user_id", onlyUser); cq = cq.eq("user_id", onlyUser); }
  const { data: tasks, error } = await tq;
  if (error) throw error;
  const { data: courses } = await cq;
  const cm = new Map((courses ?? []).map((c) => [c.id, c]));
  const by = new Map<string, unknown[]>();
  for (const t of tasks ?? []) {
    const c: any = cm.get(t.course_id);
    if (c && (c.cycle_id || c.deleted)) continue;
    const m = msg(t, c ? c.abbr : "—", today);
    if (!m) continue;
    if (!by.has(t.user_id)) by.set(t.user_id, []);
    by.get(t.user_id)!.push(m);
  }
  let sent = 0, tasksN = 0;
  for (const [u, ps] of by) { tasksN += ps.length; sent += await sendTo(u, ps); }
  return { sent, tasks: tasksN };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const cron = req.headers.get("x-cron-secret");
    if (cron !== null) {
      if (!sameSecret(cron, (await loadSecrets()).cron_secret ?? "")) return json({ error: "forbidden" }, 403);
      await secrets();
      return json(await daily());
    }
    const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
    const { data: { user }, error } = await sb.auth.getUser(jwt);
    if (error || !user) return json({ error: "unauthorized" }, 401);
    const s = await secrets();
    const body = await req.json().catch(() => ({}));
    switch (body.action) {
      case "key": return json({ key: s.vapid_public });
      case "subscribe": {
        const b = body.sub;
        if (!okEndpoint(b?.endpoint) || typeof b?.keys?.p256dh != "string" || typeof b?.keys?.auth != "string" || b.endpoint.length > 1000) return json({ error: "bad sub" }, 400);
        const sub = { endpoint: b.endpoint, keys: { p256dh: b.keys.p256dh.slice(0, 200), auth: b.keys.auth.slice(0, 100) } };
        const { data: old } = await sb.from("push_subs").select("user_id").eq("endpoint", sub.endpoint).maybeSingle();
        if (old && old.user_id !== user.id) return json({ error: "conflict" }, 409);
        if (!old) {
          const { count } = await sb.from("push_subs").select("id", { count: "exact", head: true }).eq("user_id", user.id);
          if ((count ?? 0) >= 5) return json({ error: "too many devices" }, 429);
        }
        const { error: e } = await sb.from("push_subs").upsert({ user_id: user.id, endpoint: sub.endpoint, sub }, { onConflict: "endpoint" });
        if (e) throw e;
        return json({ ok: true });
      }
      case "test": return json({ sent: await sendTo(user.id, [{ title: "🟢 Notas · Aviso de prueba", body: "Los avisos funcionan ✓", tag: "test", url: "./#tareas" }]) });
      case "now": return json(await daily(user.id));
      default: return json({ error: "unknown action" }, 400);
    }
  } catch (e: any) {
    console.error(e);
    return json({ error: "internal" }, 500);
  }
});
