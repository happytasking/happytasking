# Happy Tasking Guides

Editorial MDX for `/guides`. This is not a keyword mill.

## Add a guide

1. Copy `_template.mdx` to `{slug}.mdx` (no leading underscore).
2. Keep `status: draft` until a maintainer is ready to publish.
3. File a PR. Factual claims about companies or processes need sources.
4. Never include leaked screening questions, task prompts, client names, or other confidential work.

Update `dateModified` only when the guide receives a meaningful editorial change. Do not bump the date for formatting, metadata-only, or deployment changes. Builds and deploys must not rewrite it.

Published is necessary for a public URL. It is **not** sufficient for Google: `guideSEOEligibility()` still requires original body, metadata, and a valid slug.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) and [docs/seo/SPRINT-4-GUIDES.md](../../docs/seo/SPRINT-4-GUIDES.md).
