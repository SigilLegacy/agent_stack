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

type Locks = {
  lock_version: string;
  export_readiness: {
    min_reply_captures: number;
    min_post_captures: number;
    min_judgment_frames: number;
    min_deliberate_omissions: number;
    drift_check_required: boolean;
    output_shape_bullets_only: boolean;
  };
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

  const ROOT = process.cwd();
  const absCap = path.resolve(ROOT, capturePathArg);
  if (!fs.existsSync(absCap)) {
    console.error(`Capture file not found: ${absCap}`);
    process.exit(1);
  }

  const locksPath = path.join(ROOT, "x_agent", "locks", "X_AGENT_LOCKS_v1.json");
  if (!fs.existsSync(locksPath)) {
    console.error(`Locks file not found: ${locksPath}`);
    process.exit(1);
  }

  const locks = loadJson(locksPath) as Locks;
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

  const derived = capture.derived || {};
  const judgmentFrames = Array.isArray(derived.judgment_frames) ? derived.judgment_frames : [];
  const deliberateOmissions = Array.isArray(derived.deliberate_omissions) ? derived.deliberate_omissions : [];
  const driftFlags = Array.isArray(derived.drift_flags) ? derived.drift_flags : [];

  const er = locks.export_readiness;

  const replyMinMet = replies.length >= er.min_reply_captures;
  const postMinMet = posts.length >= er.min_post_captures;
  const judgmentMinMet = judgmentFrames.length >= er.min_judgment_frames;
  const omissionMinMet = deliberateOmissions.length >= er.min_deliberate_omissions;

  const driftPassed = er.drift_check_required ? driftFlags.length === 0 : true;
  const bulletsOnly = er.output_shape_bullets_only === true;

  const missing: string[] = [];
  if (!replyMinMet) missing.push(`replies: need ${er.min_reply_captures}, have ${replies.length}`);
  if (!postMinMet) missing.push(`posts: need ${er.min_post_captures}, have ${posts.length}`);
  if (!judgmentMinMet) missing.push(`judgment_frames: need ${er.min_judgment_frames}, have ${judgmentFrames.length}`);
  if (!omissionMinMet) missing.push(`deliberate_omissions: need ${er.min_deliberate_omissions}, have ${deliberateOmissions.length}`);
  if (!driftPassed) missing.push("drift_check: drift flags present");
  if (!bulletsOnly) missing.push("output_shape_bullets_only: required by locks");

  const allRequiredPass =
    replyMinMet &&
    postMinMet &&
    judgmentMinMet &&
    omissionMinMet &&
    driftPassed &&
    bulletsOnly;

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
    judgment_frames: judgmentFrames,
    deliberate_omissions: deliberateOmissions,
    drift_report: driftFlags,
    export_readiness: {
      ready: allRequiredPass,
      checks: {
        reply_captures_min_met: replyMinMet,
        post_captures_min_met: postMinMet,
        judgment_frames_min_met: judgmentMinMet,
        deliberate_omissions_min_met: omissionMinMet,
        drift_check_passed: driftPassed,
        output_shape_bullets_only: bulletsOnly
      },
      missing_requirements: missing
    }
  };

  const runsDir = path.join(ROOT, "x_agent", "runs");
  fs.mkdirSync(runsDir, { recursive: true });

  const outFile = path.join(runsDir, `digest_${endDate}.json`);
  fs.writeFileSync(outFile, JSON.stringify(digest, null, 2), "utf8");

  console.log(`Wrote: ${outFile}`);
}

main();