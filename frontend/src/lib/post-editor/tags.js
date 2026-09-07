const BODY_TAG_PATTERN = /(^|[^\p{L}\p{N}_-])#([\p{L}\p{N}_-]+)/gu;

function normalizeTag(tag) {
  return tag.trim().replace(/^#+/, "").replace(/\s+/g, " ");
}

function uniqueTags(tags) {
  const seen = new Set();

  return tags.filter((tag) => {
    const normalizedTag = normalizeTag(tag);

    if (!normalizedTag) {
      return false;
    }

    const key = normalizedTag.toLocaleLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

export function parseTagInput(value) {
  return uniqueTags(value.split(/,|\n/).map(normalizeTag));
}

export function extractBodyTags(value) {
  const tags = [];

  for (const match of value.matchAll(BODY_TAG_PATTERN)) {
    tags.push(match[2]);
  }

  return uniqueTags(tags);
}

export function mergeTags(...collections) {
  return uniqueTags(collections.flat());
}
