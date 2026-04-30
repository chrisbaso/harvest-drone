# SOURCE Acre Review Design System

## Visual Thesis
- Calm agricultural authority: premium, practical, and trustworthy.
- SaaS-grade clarity: strong hierarchy, disciplined spacing, and conversion-focused scanning.
- Earth-toned palette: deep green CTA, warm neutral canvas, restrained bronze accent.

## Typography
- Display: `DM Serif Display`
- Sans: `Instrument Sans`
- Hero headline: `clamp(2.75rem, 7vw, 5rem)` with tight line height
- Section title: `clamp(2rem, 4vw, 3.3rem)`
- Body copy: `1rem` to `1.0625rem`, `line-height: 1.7`
- Labels: `0.84rem`, bold, dense spacing for scanability

## Color System
- Canvas: `#f5f1e8`
- Canvas alt: `#efe8db`
- Surface: `#fffdf8`
- Surface soft: `#f8f4ec`
- Primary ink: `#223025`
- Secondary text: `#5c6a62`
- Border: `rgba(34, 48, 37, 0.12)`
- Primary CTA: `#2f6a45`
- Primary CTA hover: `#255238`
- Accent: `#9d7a3c`

## Layout System
- Max content width: `1160px`
- Shell width: `min(1160px, calc(100% - 2rem))`
- Section spacing:
  - mobile: `56px`
  - desktop: `80px`
- Grid behavior:
  - mobile-first single column
  - desktop shifts to 2-column or 3-column only where scanning improves

## Components
- `SourceSection`: reusable section wrapper with consistent vertical rhythm
- `SourceShell`: centered max-width layout container
- `SourceSectionHeader`: eyebrow, title, and description pattern
- `SourceCard`: reusable surface for panels, support blocks, and disclaimers
- `SourceButton`: primary/secondary actions with shared spacing and hover behavior
- `SourceField`: standardized labels, required markers, and helper text

## Interaction Rules
- One dominant CTA per section
- Subtle hover lift on buttons and cards
- Strong focus rings for form fields and buttons
- No decorative motion beyond micro-interactions and smooth scroll

## Page Structure
1. Hero
2. Problem
3. Solution
4. How it works
5. Form / CTA
6. Trust / credibility
7. Disclaimer

## Conversion Rules
- Keep SOURCE as the main offer
- Keep the ask low-friction: acre review first, sales conversation second
- Preserve compliance language and avoid fake precision
- Maintain mobile-first readability and fast scanning
