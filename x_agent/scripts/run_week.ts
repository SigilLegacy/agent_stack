import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const dateArg = process.argv[2] || new Date().toISOString().slice(0, 10);
const base = path.resolve("agent_stack/x_agent");

const inputFile = path.join(base, "inputs", `week_${dateArg}.json`);
const captureFile = path.join(base, "runs", `capture_${dateArg}.json`);

if (!fs.existsSync(inputFile)) {
  console.error(`Missing input file: ${inputFile}`);
  console.error(`Create it first, or pass the correct date: npx tsx agent_stack/x_agent/scripts/run_week.ts 2026-03-01`);
  process.exit(1);
}

console.log(`\n=== X Agent Weekly Run: ${dateArg} ===\n`);

console.log("[1/2] Ingesting...");
execSync(`npx tsx ${path.join(base, "scripts", "ingest_weekly.ts")} ${inputFile}`, { stdio: "inherit" });

console.log("[2/2] Rendering digest...");
execSync(`npx tsx ${path.join(base, "scripts", "render_digest.ts")} ${captureFile}`, { stdio: "inherit" });

console.log(`\n=== Done. Check outputs/ for digest_${dateArg}.json ===\n`);
