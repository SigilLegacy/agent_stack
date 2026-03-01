import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

function main() {
  const dateArg = process.argv[2] || new Date().toISOString().slice(0, 10);

  const ROOT = process.cwd();
  const base = path.join(ROOT, "x_agent");

  const inputFile = path.join(base, "inputs", `week_${dateArg}.json`);
  const captureFile = path.join(base, "runs", `capture_${dateArg}.json`);

  if (!fs.existsSync(inputFile)) {
    console.error(`Missing input file: ${inputFile}`);
    console.error(`Create it first, or pass the correct date: npm run x:week -- ${dateArg}`);
    process.exit(1);
  }

  console.log(`\n=== X Agent Weekly Run: ${dateArg} ===\n`);

  console.log("[1/2] Ingesting...");
  execSync(`npx tsx x_agent/scripts/ingest_weekly.ts "${inputFile}"`, { stdio: "inherit" });

  if (!fs.existsSync(captureFile)) {
    console.error(`Expected capture file not found after ingest: ${captureFile}`);
    console.error("Ingest may be writing to a different location. Check the prior Wrote: line.");
    process.exit(1);
  }

  console.log("[2/2] Rendering digest...");
  execSync(`npx tsx x_agent/scripts/render_digest.ts "${captureFile}"`, { stdio: "inherit" });

  console.log(`\n=== Done. Check x_agent/runs for digest_${dateArg}.json ===\n`);
}

main();