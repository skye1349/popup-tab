import { accessSync, readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const requiredFiles = [
  "background.js",
  "options.html",
  "options.css",
  "options.js",
  "icons/icon-16.png",
  "icons/icon-32.png",
  "icons/icon-48.png",
  "icons/icon-128.png",
  "store-assets/small-promo-440x280.png"
];

for (const file of requiredFiles) {
  accessSync(file);
}

if (manifest.manifest_version !== 3) {
  throw new Error("manifest_version must be 3");
}

if (!manifest.commands?.["pop-current-tab"]) {
  throw new Error("Missing pop-current-tab command");
}

if (!manifest.options_ui?.page) {
  throw new Error("Missing options page");
}

console.log(`Popup Tab ${manifest.version} is ready to package.`);
