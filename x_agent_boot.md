# X Agent Stack — Full Boot

## Purpose

Preserve judgment over time from X posts + replies. Enforce negative scope and voice invariants. Produce weekly digest artifacts. **Never post, schedule, or auto-reply.**

---

## Folder Structure

```
agent_stack/
└── x_agent/
    ├── schemas/
    │   ├── X_AGENT_CAPTURE_v1.json
    │   └── X_AGENT_WEEKLY_DIGEST_v1.json
    ├── inputs/
    │   └── week_YYYY-MM-DD.json
    ├── runs/
    │   └── capture_YYYY-MM-DD.json
    ├── outputs/
    │   └── digest_YYYY-MM-DD.json
    ├── locks/
    │   └── X_AGENT_LOCKS_v1.json
    ├── scripts/
    │   ├── ingest_weekly.ts
    │   ├── render_digest.ts
    │   └── run_week.ts
    ├── README.md
    └── package.json (at Desktop root)
```

Working directory: `C:\Users\dfrat\OneDrive\Desktop\`

---

## Locks (Non-Negotiable)

**File:** `agent_stack/x_agent/locks/X_AGENT_LOCKS_v1.json`

```json
{
  "lock_version": "X_AGENT_LOCKS_v1",
  "objective_contract": "Maximize high-signal inbound relevance on X by compounding judgment-dense replies that attract builders, operators, and system thinkers, without increasing posting volume or sacrificing voice integrity.",
  "negative_scope": {
    "no_generate_posts": true,
    "no_scheduling": true,
    "no_auto_replying": true,
    "no_trend_chasing": true,
    "no_tone_smoothing": true,
    "no_growth_hacks": true,
    "no_advice_injection": true
  },
  "voice_invariants": {
    "preserve_sentence_variability": true,
    "prefer_declarative_unfinished": true,
    "no_instructional_framing": true,
    "no_cta_language": true,
    "no_motivational_phrasing": true,
    "no_explanation_in_summary": true
  },
  "time_window_days": 14,
  "source_hierarchy": ["replies", "posts"],
  "never_store": [
    "dms",
    "drafts",
    "off_platform_context",
    "other_peoples_content_fulltext",
    "raw_screenshots",
    "emotion_inference",
    "audience_profiling"
  ],
  "export_readiness": {
    "min_reply_captures": 12,
    "min_post_captures": 5,
    "min_judgment_frames": 3,
    "min_deliberate_omissions": 2,
    "drift_check_required": true,
    "output_shape_bullets_only": true
  }
}
```

---

## Schema: Capture

**File:** `agent_stack/x_agent/schemas/X_AGENT_CAPTURE_v1.json`

```json
{
  "schema_version": "X_AGENT_CAPTURE_v1",
  "owner": {
    "handle": "string",
    "timezone": "America/New_York"
  },
  "locks_ref": "../locks/X_AGENT_LOCKS_v1.json",
  "time_window": {
    "rolling_days": 14
  },
  "allow_list": {
    "store_only_allow_list": true,
    "allowed_fields": [
      "item_id", "post_type", "timestamp_et", "text",
      "context_parent_url", "context_account_handle",
      "media_type", "metrics_impressions", "metrics_replies",
      "metrics_likes", "metrics_reposts", "metrics_bookmarks",
      "classification_archetype", "classification_topic",
      "outlier_is_outlier", "outlier_reason", "notes"
    ]
  },
  "items": [
    {
      "item_id": "string",
      "post_type": "post",
      "timestamp_et": "YYYY-MM-DDTHH:MM:SS",
      "text": "string",
      "context": {
        "parent_url": "string|null",
        "account_handle": "string|null"
      },
      "media_type": "none|image|video|mixed",
      "metrics": {
        "impressions": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
        "replies": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
        "likes": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
        "reposts": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
        "bookmarks": { "value": 0, "label": "Exact|Unavailable|Pattern-based" }
      },
      "classification": {
        "archetype": "string",
        "topic": "string"
      },
      "outlier": {
        "is_outlier": false,
        "reason": "none",
        "note": "string|null"
      },
      "notes": "string|null"
    }
  ],
  "derived": {
    "judgment_frames": [
      {
        "frame_id": "string",
        "name": "string",
        "definition": "string",
        "evidence_item_ids": ["string"],
        "first_seen": "YYYY-MM-DD",
        "last_seen": "YYYY-MM-DD"
      }
    ],
    "deliberate_omissions": [
      {
        "omission_id": "string",
        "name": "string",
        "description": "string",
        "evidence": "string"
      }
    ],
    "drift_flags": [
      {
        "flag_id": "string",
        "timestamp_et": "YYYY-MM-DDTHH:MM:SS",
        "reason": "string",
        "blocked": true
      }
    ]
  }
}
```

---

## Schema: Weekly Digest

**File:** `agent_stack/x_agent/schemas/X_AGENT_WEEKLY_DIGEST_v1.json`

```json
{
  "schema_version": "X_AGENT_WEEKLY_DIGEST_v1",
  "locks_ref": "../locks/X_AGENT_LOCKS_v1.json",
  "window": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "rolling_days_reference": 14
  },
  "inputs_summary": {
    "items_ingested": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
    "replies_ingested": { "value": 0, "label": "Exact|Unavailable|Pattern-based" },
    "posts_ingested": { "value": 0, "label": "Exact|Unavailable|Pattern-based" }
  },
  "top_items": {
    "replies_by_impressions": [],
    "posts_by_impressions": [],
    "replies_by_bookmarks": [],
    "posts_by_bookmarks": []
  },
  "pattern_notes": [],
  "judgment_frames": [],
  "deliberate_omissions": [],
  "drift_report": [],
  "export_readiness": {
    "ready": false,
    "checks": {
      "reply_captures_min_met": false,
      "post_captures_min_met": false,
      "judgment_frames_min_met": false,
      "deliberate_omissions_min_met": false,
      "drift_check_passed": false,
      "output_shape_bullets_only": true
    }
  }
}
```

---

## Input Template

**File:** `agent_stack/x_agent/inputs/week_YYYY-MM-DD.json`

```json
{
  "window": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  },
  "posts": [],
  "replies": []
}
```

Each post/reply object:

```json
{
  "item_id": "optional_unique_id",
  "timestamp_et": "2026-03-01T14:30:00",
  "text": "The actual post or reply text",
  "parent_url": "https://x.com/someone/status/123 (replies only, null for posts)",
  "account_handle": "@someone (replies only)",
  "media_type": "none|image|video|mixed",
  "impressions": 1200,
  "replies": 5,
  "likes": 42,
  "reposts": 3,
  "bookmarks": 8
}
```

If a metric is missing, pass `null`. The system labels it `"Unavailable"`.

---

## Scripts

### ingest_weekly.ts (Step 4 — confirmed working)

**File:** `agent_stack/x_agent/scripts/ingest_weekly.ts`

```typescript
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
```

---

### render_digest.ts (Step 5)

**File:** `agent_stack/x_agent/scripts/render_digest.ts`

```typescript
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
  return oneLine.length > max ? oneLine.slice(0, max - 1) + "…" : oneLine;
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
  const capturePath = process.argv[2];
  if (!capturePath) {
    console.error("Usage: npx tsx agent_stack/x_agent/scripts/render_digest.ts <runs/capture_*.json>");
    process.exit(1);
  }

  const absCap = path.resolve(capturePath);
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

  const digest = {
    schema_version: "X_AGENT_WEEKLY_DIGEST_v1",
    locks_ref: "../locks/X_AGENT_LOCKS_v1.json",
    window: {
      start_date: "Unknown",
      end_date: path.basename(absCap).replace("capture_", "").replace(".json", ""),
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

  const outDir = path.resolve("agent_stack/x_agent/outputs");
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `digest_${digest.window.end_date}.json`);
  fs.writeFileSync(outFile, JSON.stringify(digest, null, 2), "utf8");

  console.log(`Wrote: ${outFile}`);
}

main();
```

---

### run_week.ts (Step 7 — auto date, chains ingest → digest)

**File:** `agent_stack/x_agent/scripts/run_week.ts`

```typescript
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
```

---

## package.json Scripts (Step 8)

Add to `package.json` at Desktop root:

```json
{
  "scripts": {
    "x:ingest": "npx tsx agent_stack/x_agent/scripts/ingest_weekly.ts",
    "x:digest": "npx tsx agent_stack/x_agent/scripts/render_digest.ts",
    "x:week": "npx tsx agent_stack/x_agent/scripts/run_week.ts"
  }
}
```

---

## Weekly Workflow (PowerShell)

```powershell
# 1. Fill the input file for the week
#    Edit: agent_stack/x_agent/inputs/week_2026-03-01.json

# 2. Run the full pipeline (ingest + digest)
npm run x:week -- 2026-03-01

# Or run individually:
npm run x:ingest -- agent_stack/x_agent/inputs/week_2026-03-01.json
npm run x:digest -- agent_stack/x_agent/runs/capture_2026-03-01.json
```

---

## Metric Rules

- If a metric is missing, it **must** be labeled `"Unavailable"` (pass `null` in input)
- Never store: DMs, drafts, off-platform context, raw screenshots, emotion inference
- Export readiness stays `false` until all gates in locks are met

---

## Cowork Instructions

When connecting this to Claude Cowork, use this as your **folder instruction** for `agent_stack/`:

> This is an X Agent stack. Read-only, drift-resistant. Locks are in locks/X_AGENT_LOCKS_v1.json — all operations must respect negative scope and voice invariants. Never post, schedule, or auto-reply. Weekly workflow: ingest → digest → export. Scripts are TypeScript, run with npx tsx. Metrics missing from input must be labeled Unavailable. Export readiness stays false until lock gates are met.

---

## Build Status

| Step | Description | Status |
|------|-------------|--------|
| 1 | Folder skeleton | ✅ Done |
| 2 | Locks file | ✅ Done |
| 3 | Capture schema | ✅ Done |
| 4 | Ingest script + input template | ✅ Confirmed working |
| 5 | Digest renderer | Ready to create |
| 6 | README / Codex runbook | Ready to create |
| 7 | run_week.ts (auto date wrapper) | Ready to create |
| 8 | package.json npm scripts | Ready to add |

**Next after boot:** Create `render_digest.ts`, `run_week.ts`, and add npm scripts. Then first real weekly run.
