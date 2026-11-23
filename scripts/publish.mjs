// Körs automatiskt efter `npm run build` (se "postbuild" i package.json).
// Sparar alla ändringar i git och pushar till main. Netlify bygger sedan om
// sajten från main och uppdaterar länken.
//
// Hoppa över publiceringen:  NO_PUBLISH=1 npm run build
import { execFileSync } from "node:child_process";

const SITE = "https://whiteboard-reading.netlify.app";

// Netlify kör själv `npm run build`. Där ska ingenting pushas.
if (process.env.NETLIFY || process.env.CI || process.env.NO_PUBLISH) process.exit(0);

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const run = (...args) => execFileSync("git", args, { stdio: "inherit" });

run("add", "-A");
if (git("status", "--porcelain")) {
  const stamp = new Date().toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
  run("commit", "-m", `update ${stamp}`);
}

git("fetch", "origin", "main");
if (git("rev-parse", "HEAD") === git("rev-parse", "origin/main")) {
  console.log(`\nInget nytt att publicera. ${SITE} är redan uppdaterad.`);
} else {
  run("push", "origin", "HEAD:main");
  console.log(`\nPublicerat. Netlify bygger nu om sajten, ${SITE} uppdateras om någon minut.`);
}
