# Happy Tasking brand assets

Everything here is generated from the master exports in `/brand-source` (kept outside
`public/` so the multi-megabyte originals are never served). Regenerate with
`python3 scripts/install-brand.py` after dropping new exports in.

## Files

| File                    | Source | Ratio  | Use                                                       |
| ----------------------- | ------ | ------ | --------------------------------------------------------- |
| `logo-mark.png`         | 1      | 1:1    | App mark, 512px master. Favicons, avatars, app icons.       |
| `logo-mark-{32,64,128,180,192}.png` | 1 | 1:1 | Favicon / touch-icon ladder wired up in `app/layout.tsx`. |
| `logo-lockup.png`       | 2      | 4.92:1 | Icon + wordmark. **The header lockup.**                    |
| `logo-full.png`         | 3      | 4.56:1 | Icon + wordmark + tagline. Footer, decks, anywhere ≥48px tall. |
| `logo-wordmark.png`     | 4      | 6.70:1 | Wordmark alone, when the mark already appears nearby.       |
| `logo-tagline.png`      | 5      | 35.3:1 | Rule-flanked "KNOW BEFORE YOU TASK". Wide slots only.       |
| `logo-mark-navy.png`    | 6a     | 1:1    | Single-colour navy mark for light/mono printing.            |
| `logo-mark-white.png`   | 6b     | 1:1    | Single-colour white mark for dark backgrounds.              |
| `og-image.jpg`          | 7b     | 1.91:1 | Default Open Graph / Twitter card (1200×630).               |
| `og-wide.jpg`           | 7a     | 1.91:1 | Alternate left-aligned social card.                         |

The `-40`, `-48`, `-64`, `-96`, `-128`, `-12`, `-16`, `-24` suffixed files are
fixed-height exports for contexts that can't run Next's image optimiser (email
signatures, README badges, third-party dashboards). The app itself always points at the
full-resolution master and lets `next/image` resize.

## Sizing rules

All exports are trimmed to their ink bounds, so **size by height and let width follow the
ratio above** — never set both. `components/Logo.tsx` encodes these ratios and does the
maths for you.

The tagline is drawn at roughly 8% of the full lockup's height. Below about 48px of lockup
height it renders under 4px tall and turns to mush, which is why the header uses
`logo-lockup` (no tagline) and the footer uses `logo-full`.

## Palette

Sampled from the logo gradient and exposed as CSS variables in `app/globals.css`:

| Token             | Hex       | Role                                       |
| ----------------- | --------- | ------------------------------------------ |
| `--brand-navy`    | `#0b1a2d` | "Happy", tagline text, body copy           |
| `--brand-blue`    | `#1888f4` | Gradient start                             |
| `--brand-cyan`    | `#0fbccc` | Gradient midpoint                          |
| `--brand-green`   | `#28c878` | Gradient end                               |
| `--brand-yellow`  | `#fbcb46` | The mark's face; accents only, never text  |
| `--accent`        | `#149e6c` | Darkened green for text/links that must pass contrast |

`--gradient-brand` (90°) and `--gradient-brand-br` (135°) reproduce the wordmark ramp;
`--gradient-ambient` is the page wash painted on `<body>`.

## Format guidance

PNG is correct for these assets: the mark is a rendered illustration with soft shading and
a transparent surround, so SVG would either bloat (embedded bitmap) or lose fidelity. If
you later want a true vector wordmark, only files 4 and 5 are worth redrawing — they're
pure type and rules. Social cards are JPEG because they're full-bleed with no transparency.
