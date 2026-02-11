/**
 * AUTO TRANSLATION EXTRACTOR FOR ANGULAR PROJECTS
 * ------------------------------------------------
 * This script:
 * 1. Reads all HTML files in src/app
 * 2. Extracts English text
 * 3. Generates translation keys automatically
 * 4. Saves to en.json
 * 5. Replaces text in HTML with {{ 'KEY' | translate }}
 */

const fs = require("fs");
const path = require("path");

// Directory to scan
const ROOT_DIR = path.join(__dirname, "../src/app");

// Output translation file
const OUTPUT_FILE = path.join(__dirname, "../src/assets/i18n/en.json");

// Final JSON object
let translations = {};

// Regex to find visible text in HTML tags
const textRegex = />\s*([^<>{}]+?)\s*</g;

// Generate translation keys
function generateKey(text) {
  return text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .substring(0, 40);
}

// Scan all files recursively
function scanDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith(".html")) {
      processHTML(fullPath);
    }
  });
}

// Process HTML templates
function processHTML(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let original = content;

  let match;
  while ((match = textRegex.exec(original)) !== null) {
    let text = match[1].trim();

    // Skip invalid items
    if (!text || text.startsWith("{{") || /\d/.test(text)) continue;
    if (text.length < 2) continue;
    if (["i", "bi"].includes(text.toLowerCase())) continue;

    let key = generateKey(text);
    translations[key] = text;

    const replaceString = `{{ '${key}' | translate }}`;
    content = content.replace(match[0], `>${replaceString}<`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated:", filePath);
}

// Start
console.log("\n🚀 Extracting and replacing text...\n");
scanDir(ROOT_DIR);

// Save JSON output
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translations, null, 2));

console.log("\n✔ DONE! Translation file saved at:");
console.log(OUTPUT_FILE);
