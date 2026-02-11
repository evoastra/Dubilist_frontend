/**
 * AUTO TRANSLATE en.json → hi.json + ar.json
 */

const fs = require("fs");
const path = require("path");

// ✅ Correct import for Google Translate API v9+
const { default: translate } = require("@vitalets/google-translate-api");

// Input file
const EN_FILE = path.join(__dirname, "../src/assets/i18n/en.json");

// Output files
const HI_FILE = path.join(__dirname, "../src/assets/i18n/hi.json");
const AR_FILE = path.join(__dirname, "../src/assets/i18n/ar.json");

const enData = JSON.parse(fs.readFileSync(EN_FILE, "utf8"));

let hiData = {};
let arData = {};

console.log("⚙ Translating English → Hindi & Arabic...\n");

async function translateAll() {
  for (const key of Object.keys(enData)) {
    const english = enData[key];

    try {
      const hi = await translate(english, { to: "hi" });
      const ar = await translate(english, { to: "ar" });

      hiData[key] = hi.text;
      arData[key] = ar.text;

      console.log(`✔ ${key}`);
      await new Promise((res) => setTimeout(res, 150));
    } catch (err) {
      console.error(`❌ Failed: ${key} → ${err.message}`);
    }
  }

  fs.writeFileSync(HI_FILE, JSON.stringify(hiData, null, 2));
  fs.writeFileSync(AR_FILE, JSON.stringify(arData, null, 2));

  console.log("\n🎉 Translation completed!");
  console.log("✔ hi.json saved");
  console.log("✔ ar.json saved");
}

translateAll();
