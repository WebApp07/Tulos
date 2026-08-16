#!/usr/bin/env node
// Validates a draft blog post JSON and publishes it to the Licendi Sanity CMS.
//
// Usage: node --env-file=.env scripts/seo/publish-post.mjs <draft.json>
//
// Safety gates (refuses to publish on any failure):
//   - required fields, slug/seoTitle/seoDescription length limits
//   - valid Portable Text body structure (unique keys, resolved markDefs)
//   - no duplicate slug or title vs existing posts
//   - every internal /product|/category|/blog/<slug> href resolves to a real doc
//   - author is created once by slug (reused on later posts)
//   - word count >= 1200 and >= 3 internal links (agent quality gate)

import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

const args = process.argv.slice(2);
const updateMode = args.includes("--update");
const draftPath = args.find((a) => !a.startsWith("--"));
if (!draftPath) {
  console.error(
    "Usage: node --env-file=.env scripts/seo/publish-post.mjs <draft.json> [--update]",
  );
  process.exit(1);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const writeToken = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !writeToken) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-12-15",
  useCdn: false,
  token: writeToken,
});

const fail = (message) => {
  console.error(`PUBLISH BLOCKED: ${message}`);
  process.exit(1);
};

let draft;
try {
  draft = JSON.parse(readFileSync(draftPath, "utf8"));
} catch (error) {
  fail(`cannot read draft "${draftPath}": ${error.message}`);
}

// ---- Field validation -----------------------------------------------------

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

for (const [field, label] of [
  ["title", "title"],
  ["slug", "slug"],
  ["excerpt", "excerpt"],
  ["body", "body"],
  ["author", "author"],
]) {
  if (!draft[field]) fail(`missing required field: ${label}`);
}
if (draft.slug.length > 96) fail("slug exceeds 96 chars");
if (!slugRe.test(draft.slug)) fail(`invalid slug format: "${draft.slug}"`);
if (draft.seoTitle && draft.seoTitle.length > 60) fail("seoTitle exceeds 60 chars");
if (draft.seoDescription && draft.seoDescription.length > 160) fail("seoDescription exceeds 160 chars");
if (!draft.primaryKeyword) fail("missing primaryKeyword");
if (draft.tags && (!Array.isArray(draft.tags) || draft.tags.some((t) => typeof t !== "string"))) {
  fail("tags must be an array of strings");
}

// ---- Portable Text validation ---------------------------------------------

const allowedStyles = new Set(["normal", "h1", "h2", "h3", "h4", "blockquote"]);
const allowedListItems = new Set(["bullet", "number"]);
const keys = new Set();
const markDefKeys = new Set();

for (const block of draft.body) {
  if (!block || typeof block !== "object" || !block._type) fail("body contains an invalid block");
  if (block._key) {
    if (keys.has(block._key)) fail(`duplicate _key "${block._key}"`);
    keys.add(block._key);
  }
  if (block._type === "block") {
    if (block.style && !allowedStyles.has(block.style)) fail(`invalid block style "${block.style}"`);
    if (block.listItem && !allowedListItems.has(block.listItem)) fail(`invalid listItem "${block.listItem}"`);
    if (block.listItem && block.level == null) fail(`listItem "${block.listItem}" missing level`);
    if (!Array.isArray(block.children) || block.children.length === 0) fail("block has no children");
    for (const child of block.children) {
      if (!child || child._type !== "span" || typeof child.text !== "string") {
        fail("block children must be spans with text");
      }
      if (child._key && keys.has(child._key)) fail(`duplicate _key "${child._key}"`);
      if (child._key) keys.add(child._key);
      for (const mark of child.marks ?? []) {
        if (mark === "strong" || mark === "em") continue;
        markDefKeys.add(mark);
      }
    }
    for (const markDef of block.markDefs ?? []) {
      if (!markDef._key || !markDef._type) fail("markDef missing _key/_type");
      if (markDef._type === "link" && !markDef.href) fail("link markDef missing href");
      if (block.listItem && block.style && block.style !== "normal") fail(`listItem block must use normal style, got "${block.style}"`);
      if (!markDefKeys.has(markDef._key)) fail(`markDef "${markDef._key}" is never used by a span mark`);
    }
  } else if (block._type === "table") {
    if (!Array.isArray(block.headers) || block.headers.some((h) => typeof h !== "string") || block.headers.length === 0) {
      fail("table block requires headers: non-empty string[]");
    }
    if (!Array.isArray(block.rows)) fail("table block requires rows: array");
    for (const row of block.rows) {
      if (!row || typeof row !== "object" || row._type !== "tableRow") fail("table rows must be _type 'tableRow'");
      if (row._key) {
        if (keys.has(row._key)) fail(`duplicate _key "${row._key}"`);
        keys.add(row._key);
      }
      if (!Array.isArray(row.cells) || row.cells.some((c) => typeof c !== "string")) fail("tableRow requires cells: string[]");
      if (row.cells.length !== block.headers.length) fail("tableRow cell count must match headers count");
    }
  } else {
    fail(`unsupported block _type "${block._type}" (only "block" and "table" are supported by the publisher)`);
  }
}

const words = draft.body.reduce((sum, block) => {
  if (block._type === "table") {
    return (
      sum +
      (block.rows || []).reduce(
        (s, row) =>
          s + (row.cells || []).reduce((c, cell) => c + (cell ? cell.trim().split(/\s+/).filter(Boolean).length : 0), 0),
        0,
      )
    );
  }
  return (
    sum +
    (block.children || []).reduce(
      (s, child) => s + (child.text ? child.text.trim().split(/\s+/).filter(Boolean).length : 0),
      0,
    )
  );
}, 0);
if (words < 1200) fail(`article too short (${words} words); quality gate requires >= 1200`);

// ---- Internal link extraction ----------------------------------------------

const internalLinks = new Set();
for (const block of draft.body) {
  for (const markDef of block.markDefs ?? []) {
    if (markDef._type === "link" && markDef.href && !/^https?:/.test(markDef.href)) {
      const m = markDef.href.match(/^\/(product|category|blog|brand)\/([^/?#]+)/);
      if (!m) fail(`unsupported internal href format: "${markDef.href}"`);
      // The site exposes blog posts at /blog/<slug>, but Sanity stores them as _type "post".
      const type = m[1] === "blog" ? "post" : m[1];
      internalLinks.add(`${type}/${m[2]}`);
    }
  }
}
if (internalLinks.size < 3) fail(`quality gate requires >= 3 internal links (found ${internalLinks.size})`);

// ---- Brand validation ---------------------------------------------------------

let brandId = null;
if (draft.brand) {
  const brands = await client.fetch(
    `*[_type == "brand"]{ _id, "slug": slug.current, "productCount": count(*[_type == "product" && references(^._id)]) }`,
  );
  const brand = brands.find((b) => b.slug === draft.brand);
  if (!brand) {
    fail(`draft.brand "${draft.brand}" does not match any brand document in Sanity. Only real brands from the catalog are allowed.`);
  }
  if (brand.productCount < 1) {
    fail(`brand "${draft.brand}" has ${brand.productCount} products; content is only allowed for brands that actually sell products in the catalog.`);
  }
  brandId = brand._id;
  // Every branded article must link back to its brand hub.
  const hasBrandHubLink = [...internalLinks].some((href) => href === `brand/${draft.brand}`);
  if (!hasBrandHubLink) {
    fail(`branded post for "${draft.brand}" must include an internal link to its brand hub /brand/${draft.brand}`);
  }
}

// ---- Catalog checks ---------------------------------------------------------

const [existing, targets] = await Promise.all([
  client.fetch(`*[_type == "post"]{ _id, title, "slug": slug.current }`),
  client.fetch(`*[_type in ["product", "category", "post", "brand"]]{ _type, "slug": slug.current }`),
]);

const existingSlugs = new Set(existing.map((p) => p.slug));
const existingPost = existing.find((p) => p.slug === draft.slug);
if (updateMode) {
  if (!existingPost) fail(`--update requested but no post with slug "${draft.slug}" exists`);
} else {
  if (existingSlugs.has(draft.slug)) fail(`slug "${draft.slug}" already exists`);
}
const titleTaken = existing.some(
  (p) => p.title.trim().toLowerCase() === draft.title.trim().toLowerCase() && (!updateMode || p.slug !== draft.slug),
);
if (titleTaken) fail(`title "${draft.title}" already exists (duplicate content)`);

// ---- Brand-aware keyword cannibalization -------------------------------------
// Primary keyword ownership = brand + keyword. A keyword claimed by a published
// post in any brand cluster must not be claimed again (cross-brand or same-brand).

const clustersJsonPath = new URL("../../content/seo/clusters.json", import.meta.url);
let claimedKeywords = [];
try {
  const clusters = JSON.parse(readFileSync(clustersJsonPath, "utf8"));
  claimedKeywords = (clusters.clusters ?? []).flatMap((c) =>
    (c.published ?? []).map((p) => ({
      keyword: (p.keyword || "").trim().toLowerCase(),
      slug: p.slug,
      brand: c.brand || null,
    })),
  );
} catch (error) {
  fail(`cannot read clusters.json for keyword ownership: ${error.message}`);
}

const targetKeyword = (draft.primaryKeyword || "").trim().toLowerCase();
if (!targetKeyword) fail("primaryKeyword is empty");
const claim = claimedKeywords.find(
  (c) =>
    c.keyword === targetKeyword &&
    (!updateMode || c.slug !== draft.slug),
);
if (claim) {
  fail(
    `primaryKeyword "${draft.primaryKeyword}" is already owned by post "${claim.slug}" (brand: ${claim.brand ?? "none"}). ` +
      `Keywords are claimed per brand to avoid cannibalization.`,
  );
}

const validTargets = new Set(targets.map((t) => `${t._type}/${t.slug}`));
const broken = [...internalLinks].filter((href) => !validTargets.has(href));
if (broken.length > 0) fail(`internal links point to non-existent docs: ${broken.join(", ")}`);

// ---- Author -----------------------------------------------------------------

let authorId;
const existingAuthor = await client.fetch(
  `*[_type == "author" && slug.current == $slug][0]._id`,
  { slug: draft.author.slug },
);
if (existingAuthor) {
  authorId = existingAuthor;
  if (updateMode && draft.author) {
    await client
      .patch(authorId)
      .set({
        name: draft.author.name,
        role: draft.author.role ?? null,
        bio: draft.author.bio ?? null,
      })
      .commit();
  }
} else {
  if (!draft.author.name || !draft.author.slug) fail("author requires name and slug");
  const created = await client.create({
    _type: "author",
    name: draft.author.name,
    slug: { _type: "slug", current: draft.author.slug },
    role: draft.author.role ?? null,
    bio: draft.author.bio ?? null,
  });
  authorId = created._id;
}

// ---- Publish ----------------------------------------------------------------

const post = {
  _type: "post",
  title: draft.title,
  slug: { _type: "slug", current: draft.slug },
  excerpt: draft.excerpt,
  body: draft.body,
  author: { _type: "reference", _ref: authorId },
  tags: draft.tags ?? [],
  publishedAt: draft.publishedAt ?? new Date().toISOString(),
  featured: Boolean(draft.featured),
};

if (draft.coverImageRef) {
  post.coverImage = {
    _type: "image",
    asset: { _type: "reference", _ref: draft.coverImageRef },
  };
}
if (brandId) {
  post.brandRef = { _type: "reference", _ref: brandId };
}
if (draft.seoTitle) post.seoTitle = draft.seoTitle;
if (draft.seoDescription) post.seoDescription = draft.seoDescription;

const base = process.env.NEXT_PUBLIC_BASE_URL || "https://licendi.xyz";

if (updateMode) {
  const result = await client.patch(existingPost._id).set(post).commit();
  console.log(
    JSON.stringify(
      {
        status: "updated",
        _id: result._id,
        title: result.title,
        slug: result.slug.current,
        url: `${base}/en/blog/${result.slug.current}`,
        authorId,
        words,
        internalLinks: [...internalLinks],
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const result = await client.create(post);

console.log(
  JSON.stringify(
    {
      status: "published",
      _id: result._id,
      title: result.title,
      slug: result.slug.current,
      url: `${base}/en/blog/${result.slug.current}`,
      authorId,
      words,
      internalLinks: [...internalLinks],
    },
    null,
    2,
  ),
);