import OpenAI from "openai";
import pg from "pg";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const langNames: Record<string, string> = {
  en: "English", ar: "Arabic", fr: "French", de: "German",
  es: "Spanish", ru: "Russian", pl: "Polish", cs: "Czech"
};
const allLangs = ["en", "ar", "fr", "de", "es", "ru", "pl", "cs"];

async function translateText(text: string, targetLang: string): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are a professional translator for PROTELS Hotels & Resorts, a luxury hospitality brand. Translate the following hotel description to ${langNames[targetLang]}. Maintain the luxury hospitality tone, marketing appeal, and all details from the original. For Arabic, use formal Modern Standard Arabic. Return ONLY the translated text, nothing else.` },
      { role: "user", content: text },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });
  return resp.choices[0]?.message?.content || "";
}

async function processHotel(slug: string) {
  console.log(`\n=== Processing: ${slug} ===`);
  
  const result = await client.query("SELECT id, name, description FROM hotels WHERE slug = $1", [slug]);
  const hotel = result.rows[0];
  if (!hotel) { console.log(`Hotel ${slug} not found!`); return; }
  
  const desc = (typeof hotel.description === "string" ? JSON.parse(hotel.description) : hotel.description) as Record<string, string> || {};
  const enText = desc.en;
  if (!enText) { console.log(`No English description for ${slug}!`); return; }
  
  console.log(`English (${enText.length} chars): ${enText.substring(0, 80)}...`);
  
  const needsTranslation = allLangs.filter(l => {
    if (l === "en") return false;
    const existing = desc[l];
    if (!existing || existing.trim().length < 50) return true;
    if (existing.trim().length < enText.length * 0.4) return true;
    return false;
  });
  
  if (needsTranslation.length === 0) {
    console.log(`✅ All translations already complete for ${hotel.name}`);
    return;
  }
  
  console.log(`Need to translate: ${needsTranslation.map(l => langNames[l]).join(", ")}`);
  
  const newDesc = { ...desc };
  
  for (const lang of needsTranslation) {
    process.stdout.write(`  → ${langNames[lang]}...`);
    const translated = await translateText(enText, lang);
    newDesc[lang] = translated;
    console.log(` ✅ (${translated.length} chars)`);
  }
  
  await client.query("UPDATE hotels SET description = $1 WHERE id = $2", [JSON.stringify(newDesc), hotel.id]);
  console.log(`✅ Saved ${hotel.name} with ${needsTranslation.length} new/updated translations`);
}

async function main() {
  await client.connect();
  const slugs = ["crystal-beach", "beach-club", "la-plage", "royal-bay"];
  for (const slug of slugs) {
    await processHotel(slug);
  }
  console.log("\n🎉 All hotels translated successfully!");
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
