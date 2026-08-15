# Licendi Autonomous SEO Content Pipeline

This directory is the working state for the `seo-content` agent. One article per day, authored in English and published to the Sanity `production` dataset. The other six locales (`fr/de/es/it/fi/sv`) are translated automatically by the runtime (`lib/translate.ts`).

## Files

| File | Purpose |
| --- | --- |
| `clusters.json` | Topic cluster registry. Pillars + owned keywords + `published` posts. Source of truth for avoiding keyword cannibalization. |
| `calendar.json` | One-post-per-day schedule. The agent reads this to pick today's topic and updates it after publishing. |
| `drafts/<slug>.json` | Unpublished or in-progress article drafts (Portable Text JSON). |

## Pipeline

1. **Pick topic** — read `calendar.json` + `clusters.json`; never repeat a claimed keyword or title.
2. **Research** — `content-strategy` skill: keyword, intent, SERP, competitor angles.
3. **Fact-check** — verify Microsoft licensing/activation facts against authoritative sources.
4. **Write** — `copywriting` skill; 1200–2000 words English draft → `drafts/<slug>.json`.
5. **Link** — pull real slugs via `node --env-file=.env scripts/seo/list-catalog.mjs`; ≥ 3 internal links, ≥ 1 to a product/category.
6. **Audit** — `seo-audit` skill against the quality gate.
7. **Publish** — `node --env-file=.env scripts/seo/publish-post.mjs drafts/<slug>.json` (script re-validates everything and refuses duplicates/broken links).
8. **Update state** — append to `clusters.json`, mark `calendar.json` done.

## Quality gate (must ALL pass)

- ≥ 1200 words, valid Portable Text, unique `_key`s, resolved link marks.
- `seoTitle` ≤ 60, `seoDescription` ≤ 160, slug ≤ 96 kebab-case.
- Unique slug + unique title (checked against Sanity).
- ≥ 3 internal links; every `/product|/category|/blog/<slug>` href resolves to a real Sanity doc.
- Microsoft facts verified this run; no fabricated prices, URLs, or policy.

The publish script enforces all of these automatically — the agent cannot bypass it.

## Invocation

- Interactive: switch to the `seo-content` agent in opencode.
- Daily run: `/seo-post` command.