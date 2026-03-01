# X Agent Stack

Preserve judgment over time from X posts + replies. Enforce negative scope and voice invariants. Produce weekly digest artifacts. **Never post, schedule, or auto-reply.**

---

## Initialize (one-time setup)

From your Desktop (or wherever `agent_stack/` lives):

```powershell
# 1. Install dependencies
npm install

# 2. Verify tsx works
npx tsx --version
```

That's it. The folder structure, schemas, locks, and scripts are all in place.

---

## Weekly Workflow

### Step 1 — Create your input file

Copy the template and fill it with this week's posts/replies:

```powershell
copy agent_stack\x_agent\inputs\week_TEMPLATE.json agent_stack\x_agent\inputs\week_2026-03-01.json
```

Edit `week_2026-03-01.json`:
- Set `window.start_date` and `window.end_date`
- Add your posts to the `posts` array
- Add your replies to the `replies` array
- For any missing metric, use `null` (it gets labeled "Unavailable")

### Step 2 — Run the pipeline

```powershell
npm run x:week -- 2026-03-01
```

This chains: **ingest** (input → capture) → **digest** (capture → weekly digest)

### Step 3 — Check output

Your digest lands in:
```
agent_stack/x_agent/outputs/digest_2026-03-01.json
```

---

## Run scripts individually

```powershell
# Ingest only
npm run x:ingest -- agent_stack/x_agent/inputs/week_2026-03-01.json

# Digest only (requires capture to exist first)
npm run x:digest -- agent_stack/x_agent/runs/capture_2026-03-01.json
```

---

## Folder Structure

```
agent_stack/
├── package.json
└── x_agent/
    ├── schemas/          # JSON schemas (capture + digest)
    ├── inputs/           # Weekly input files (you create these)
    ├── runs/             # Capture outputs (auto-generated)
    ├── outputs/          # Digest outputs (auto-generated)
    ├── locks/            # Non-negotiable constraints
    ├── scripts/          # TypeScript pipeline scripts
    └── README.md         # This file
```

---

## Locks (non-negotiable)

All operations respect `locks/X_AGENT_LOCKS_v1.json`:
- No generating posts, scheduling, auto-replying, trend chasing
- No tone smoothing, growth hacks, advice injection
- Voice: declarative, variable sentence length, no CTAs, no motivational phrasing
- Never store: DMs, drafts, off-platform context, raw screenshots, emotion inference
- Export readiness requires: 12+ replies, 5+ posts, 3+ judgment frames, 2+ deliberate omissions, drift check passed
