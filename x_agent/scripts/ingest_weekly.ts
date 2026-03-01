import fs from "node:fs";
import path from "node:path";

type MetricLabel = "Exact" | "Unavailable" | "Pattern-based";

type RawItem = {
  item_id?: string;
  post_type: "post" | "reply";
  timestamp_et: string;
  text: string;
  parent_url?: string | null;
  account_handle?: string | null;
  media_type?: "none" | "image" | "video" | "mixed";
  impressions?: number | null;
  replies?: number | null;
  likes?: number | null;
  reposts?: number | null;
  bookmarks?: number | null;
};

function labeled(v: number | null | undefined): { value: number; label: MetricLabel } {
  if (v === null || v === undefined) return { value: 0, label: "Unavailable" };
  return { value: v, label: "Exact" };
}

function makeId(prefix: string, ts: string, i: number) {
  const safe = ts.replace(/[:T]/g, "").replace(/-/g, "");
  return `${prefix}_${safe}_${i}`;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: npx tsx agent_stack/x_agent/scripts/ingest_weekly.ts <inputs/week_YYYY-MM-DD.json>");
    process.exit(1);
  }

  const absIn = path.resolve(inputPath);
  const raw = JSON.parse(fs.readFileSync(absIn, "utf8"));

  const all: RawItem[] = [
    ...(raw.posts || []).map((x: any) => ({ ...x, post_type: "post" })),
    ...(raw.replies || []).map((x: any) => ({ ...x, post_type: "reply" }))
  ];

  const items = all.map((x, i) => {
    const itemId = x.item_id || makeId(x.post_type, x.timestamp_et, i);
    return {
      item_id: itemId,
      post_type: x.post_type,
      timestamp_et: x.timestamp_et,
      text: x.text,
      context: {
        parent_url: x.parent_url ?? null,
        account_handle: x.account_handle ?? null
      },
      media_type: x.media_type ?? "none",
      metrics: {
        impressions: labeled(x.impressions),
        replies: labeled(x.replies),
        likes: labeled(x.likes),
        reposts: labeled(x.reposts),
        bookmarks: labeled(x.bookmarks)
      },
      classification: {
        archetype: "unclassified",
        topic: "unclassified"
      },
      outlier: {
        is_outlier: false,
        reason: "none",
        note: null
      },
      notes: null
    };
  });

  const capture = {
    schema_version: "X_AGENT_CAPTURE_v1",
    owner: { handle: "unknown", timezone: "America/New_York" },
    locks_ref: "../locks/X_AGENT_LOCKS_v1.json",
    time_window: { rolling_days: 14 },
    items,
    derived: { judgment_frames: [], deliberate_omissions: [], drift_flags: [] }
  };

  const outDir = path.resolve("agent_stack/x_agent/runs");
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `capture_${raw.window?.end_date || "unknown"}.json`);
  fs.writeFileSync(outFile, JSON.stringify(capture, null, 2), "utf8");

  console.log(`Wrote: ${outFile}`);
}

main();
