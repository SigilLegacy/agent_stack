import fs from "node:fs";
import path from "node:path";

type MetricLabel = "Exact" | "Unavailable" | "Pattern-based";
type LabeledMetric = { value: number; label: MetricLabel };

type Item = {
  item_id: string;
  post_type: "post" | "reply";
  timestamp_et: string;
  text: string;
  media_type: string;
  metrics: {
    impressions: LabeledMetric;
    replies: LabeledMetric;
    likes: LabeledMetric;
    reposts: LabeledMetric;
    bookmarks: LabeledMetric;
  };
  classification: { archetype: string; topic: string };
};

function loadJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function quote(s: string, max = 180) {
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > max ? oneLine.slice(0, max - 1) + "\u2026" : oneLine;
}

function byMetricDesc(get: (i: Item) => number) {
  return (a: Item, b: Item) => get(b) - get(a);
}

function isAvail(m: LabeledMetric) {
  return m.label !== "Unavailable";
}

function safeNum(m: LabeledMetric) {
  return m.label === "Unavailable" ? -1 : m.value;
}

function main() {
  const capturePathArg = process.argv[2];
  if (!capturePathArg) {
    console.error("Usage: npx tsx x_agent/scripts/render_digest.ts <x_agent/runs/capture_YYYY-MM-DD.json>");
    process.exit(1);
  }

  const absCap = path.resolve(process.cwd(), capturePathArg);
  if (!fs.existsSync(absCap)) {
    console.error(`Capture file not found: ${absCap}`);
    process.exit(1);
  }

  const capture = loadJson(absCap);
  const items: Item[] = (capture.items || []) as Item[];

  const posts = items.filter(i => i.post_type === "post");
  const replies = items.filter(i => i.post_type === "reply");

  const topPostsByImpr = [...posts]
    .filter(i => isAvail(i.metrics.impressions))
    .sort(byMetricDesc(i => safeNum(i.metrics.impressions)))
    .slice(0, 5);

  const topRepliesByImpr = [...replies]
    .filter(i => isAvail(i.metrics.impressions))
    .sort(byMetricDesc(i => safeNum(i.metrics.impressions)))
    .slice(0, 5);

  const topPostsByBm = [...posts]
    .filter(i => isAvail(i.metrics.bookmarks))
    .sort(byMetricDesc(i => safeNum(i.metrics.bookmarks)))
    .slice(0, 5);

  const topRepliesByBm = [...replies]
    .filter(i => isAvail(i.metrics.bookmarks))
    .sort(byMetricDesc(i => safeNum(i.metrics.bookmarks)))
    .slice(0, 5);

  const endDate = path.basename(absCap).replace("capture_", "").replace(".json", "");

  const digest = {
    schema_version: "X_AGENT_WEEKLY_DIGEST_v1",
    locks_ref: "../locks/X_AGENT_LOCKS_v1.json",
    window: {
      start_date: "Unknown",
      end_date: endDate,
      rolling_days_reference: 14
    },
    inputs_summary: {
      items_ingested: { value: items.length, label: "Exact" as MetricLabel },
      replies_ingested: { value: replies.length, label: "Exact" as MetricLabel },
      posts_ingested: { value: posts.length, label: "Exact" as MetricLabel }
    },
    top_items: {
      replies_by_impressions: topRepliesByImpr.map(i => ({
        item_id: i.item_id,
        timestamp_et: i.timestamp_et,
        impressions: i.metrics.impressions,
        bookmarks: i.metrics.bookmarks,
        replies: i.metrics.replies,
        text_quote: quote(i.text),
        archetype: i.classification?.archetype || "unclassified",
        topic: i.classification?.topic || "unclassified"
      })),
      posts_by_impressions: topPostsByImpr.map(i => ({
        item_id: i.item_id,
        timestamp_et: i.timestamp_et,
        impressions: i.metrics.impressions,
        bookmarks: i.metrics.bookmarks,
        replies: i.metrics.replies,
        text_quote: quote(i.text),
        archetype: i.classification?.archetype || "unclassified",
        topic: i.classification?.topic || "unclassified"
      })),
      replies_by_bookmarks: topRepliesByBm.map(i => ({
        item_id: i.item_id,
        timestamp_et: i.timestamp_et,
        impressions: i.metrics.impressions,
        bookmarks: i.metrics.bookmarks,
        replies: i.metrics.replies,
        text_quote: quote(i.text),
        archetype: i.classification?.archetype || "unclassified",
        topic: i.classification?.topic || "unclassified"
      })),
      posts_by_bookmarks: topPostsByBm.map(i => ({
        item_id: i.item_id,
        timestamp_et: i.timestamp_et,
        impressions: i.metrics.impressions,
        bookmarks: i.metrics.bookmarks,
        replies: i.metrics.replies,
        text_quote: quote(i.text),
        archetype: i.classification?.archetype || "unclassified",
        topic: i.classification?.topic || "unclassified"
      }))
    },
    pattern_notes: [],
    judgment_frames: [],
    deliberate_omissions: [],
    drift_report: [],
    export_readiness: {
      ready: false,
      checks: {
        reply_captures_min_met: false,
        post_captures_min_met: false,
        judgment_frames_min_met: false,
        deliberate_omissions_min_met: false,
        drift_check_passed: false,
        output_shape_bullets_only: true
      }
    }
  };

  const runsDir = path.join(process.cwd(), "x_agent", "runs");
  fs.mkdirSync(runsDir, { recursive: true });

  const outFile = path.join(runsDir, `digest_${endDate}.json`);
  fs.writeFileSync(outFile, JSON.stringify(digest, null, 2), "utf8");

  console.log(`Wrote: ${outFile}`);
}

main();