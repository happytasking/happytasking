# Company logos

Filenames match the company slug (`outlier.svg`, `mercor.png`, …). Thirteen files are real brand
assets; `appen.svg`, `toloka.svg` and `telus-international-ai.svg` are still placeholder monogram
marks.

## Adding or replacing a logo

1. Drop the file in this folder named after the company slug. SVG is preferred, PNG with
   transparency is fine.
2. Trim it first — see "Preparing an asset" below. Assets with baked-in padding render visibly
   smaller than their neighbours.
3. If the extension differs from the one in the database, update the row:

```sql
UPDATE "Company" SET "logoUrl" = '/logos/outlier.png' WHERE slug = 'outlier';
```

`logoUrl` may also be an absolute URL (a CDN, say); the frontend renders whatever the field holds.
`server/prisma/seed.ts` keeps a `rasterLogos` set listing the slugs whose asset is a `.png`.

## Preparing an asset

Brand downloads need three fixes before they sit well next to each other:

- **Crop to the ink.** Padding inside the viewBox (or transparent/white margins in a PNG) makes a
  logo look shrunken. Prolific's download was 33% vertical padding.
- **Make the root usable standalone.** An SVG without `xmlns` will not load in an `<img>` tag, and
  `currentColor` fills render black outside the DOM — pin them to a real colour. Set `width`/`height`
  on the root so the file carries an intrinsic aspect ratio.
- **Keep rasters small.** Nothing renders above ~110px, so cap the long edge around 224px. Outlier's
  SVG wraps a bitmap; that bitmap needs downscaling too (342 KB → 40 KB).

## How they render

`CompanyLogo` (`web/src/components/CompanyLogo.tsx`) takes a `fit`:

| `fit`  | Used for                        | Behaviour                                                        |
| ------ | ------------------------------- | ---------------------------------------------------------------- |
| `slot` | table rows                      | fixed-width box, so company names stay aligned down the column   |
| `auto` | page headers, cards             | width follows the aspect ratio, capped at the slot width         |
| `mark` | logos inline with running text  | square; wordmarks fall back to the monogram since they'd be a sliver |

A coloured monogram derived from the company name covers an empty `logoUrl`, a failed request, and
wordmark assets in `mark` fit, so no placement is ever blank.
