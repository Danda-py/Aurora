import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const PUBLIC_BASE_URL = Deno.env.get("PUBLIC_BASE_URL") ?? "https://casa-aurora-in-valtellina.vercel.app";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");
const TWILIO_SMS_FROM = Deno.env.get("TWILIO_SMS_FROM");
function normalizePhone(raw) {
if (!raw) return null;
const digits = raw.replace(/\s+/g, "").replace(/[^\d+]/g, "");
if (!digits) return null;
if (digits.startsWith("+")) return digits;
if (digits.startsWith("39")) return `+${digits}`;
return `+39${digits.replace(/^0/, "")}`;
}
function buildGuestUrl(token) {
return `${PUBLIC_BASE_URL}/guest/${token}`;
}
async function sendTwilioMessage({ to, body, channel }) {
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
throw new Error("Twilio env missing");
}
const from = channel === "whatsapp" ? TWILIO_WHATSAPP_FROM : TWILIO_SMS_FROM;
const params = new URLSearchParams({ From: from, To: to, Body: body });
const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
method: "POST",
headers: {
Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
"Content-Type": "application/x-www-form-urlencoded",
},
body: params.toString(),
});
const text = await res.text();
if (!res.ok) throw new Error(`Twilio error: ${res.status} - ${text}`);
return text;
}
Deno.serve(async (req) => {
try {
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
return new Response(JSON.stringify({ ok: false, error: "Supabase env missing" }), {
status: 500,
headers: { "Content-Type": "application/json" },
});
}
const { token, guestName, phone, channel = "whatsapp" } = await req.json();
if (!token || !phone) {
return new Response(JSON.stringify({ ok: false, error: "token and phone are required" }), {
status: 400,
headers: { "Content-Type": "application/json" },
});
}
const normalizedPhone = normalizePhone(phone);
if (!normalizedPhone) {
return new Response(JSON.stringify({ ok: false, error: "phone not valid" }), {
status: 400,
headers: { "Content-Type": "application/json" },
});
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const { data: pass, error: passError } = await supabase
.from("guest_passes")
.select("*")
.eq("token", token)
.single();
if (passError || !pass) {
return new Response(JSON.stringify({ ok: false, error: "pass not found" }), {
status: 404,
headers: { "Content-Type": "application/json" },
});
}
const guestUrl = buildGuestUrl(token);
const name = guestName ? guestName.trim() : "ospite";
const msg = [
`Ciao ${name},`,
`il tuo link personale per Aurora in Valtellina è:`,
guestUrl,
"",
`Fino al giorno del tuo arrivo, il link mostrerà il sito base ${PUBLIC_BASE_URL}.`,
"Buon soggiorno.",
].join("\n");
const messageChannel = channel === "sms" ? "sms" : "whatsapp";
const to = messageChannel === "whatsapp" ? `whatsapp:${normalizedPhone}` : normalizedPhone;
await sendTwilioMessage({ to, body: msg, channel: messageChannel });
await supabase
.from("guest_passes")
.update({
guest_phone: normalizedPhone,
message_channel: messageChannel,
message_sent_at: new Date().toISOString(),
guest_link: guestUrl,
})
.eq("id", pass.id);
return new Response(
JSON.stringify({ ok: true, channel: messageChannel, guest_link: guestUrl, to: normalizedPhone }),
{ status: 200, headers: { "Content-Type": "application/json" } }
);
} catch (error) {
return new Response(
JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "unknown error" }),
{ status: 500, headers: { "Content-Type": "application/json" } }
);
}
});
