---
name: HagiTask Community
description: A focused bilingual catalog for discovering reusable HagiCode workflows across dark and light themes.
colors:
  bg: "#000000"
  fg: "#FFFFFF"
  muted: "#A0A0A0"
  accent: "#FAFF69"
  accent-secondary: "#166534"
  accent-surface: "#FAFF69"
  light-accent-surface: "#BBF7D0"
  card: "#141414"
  border: "#414141"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.12em"
rounded:
  control: "4px"
  card: "8px"
  pill: "4px"
spacing:
  compact: "0.5rem"
  control: "0.7rem"
  card: "1.5rem"
  section: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#151515"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.25rem"
  button-ghost:
    textColor: "{colors.fg}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.25rem"
  task-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.fg}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  filter-chip-active:
    backgroundColor: "{colors.accent-surface}"
    textColor: "#151515"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.9rem"
---

# Design System: HagiTask Community

## Overview

**Creative North Star: "The Quiet Operations Console"**

HagiTask Community is a dark, high-signal catalog for reusable HagiCode workflows. It keeps the page centered and calm so task metadata, compatibility requirements, and discovery controls remain the focus rather than becoming dashboard decoration.

The interface uses a nearly black foundation in dark mode and a quiet white foundation in light mode, with yellow and green reserved for active and actionable UI. The catalog should feel technical and dependable, not like a neon AI landing page or an overloaded analytics console. English and Simplified Chinese content occupy the same structural slots; locale switching must not alter layout hierarchy.

**Key Characteristics:**
- A wide catalog constrained to `1440px`, using four task columns on large desktop screens.
- Yellow and green accents reserved for active states and primary actions.
- Low-contrast translucent cards with border-led separation.
- Compact metadata and tag treatment for fast scanning.
- Client-side search and category filtering with an explicit empty state.

## Colors

The palette is an intentionally restrained dual-theme system: neutral surfaces establish reading comfort while yellow and green identify active and actionable UI.

### Primary
- **Signal Yellow** (`#FAFF69`): Dark-theme primary action surface, focus accent, and active-state emphasis.
- **Operations Green** (`#166534`): Light-theme interactive accent, dark-theme secondary gradient stop, and metadata emphasis.
- **Light Green Surface** (`#BBF7D0`): Light-theme backgrounds for primary actions and active controls, paired with dark text.

### Neutral
- **Console Black** (`#0B0D12`): Global page background.
- **Cloud White** (`#E6E8EE`): Primary text and high-emphasis controls.
- **Steel Gray** (`#9AA3B2`): Supporting copy, versions, filters, and secondary metadata.
- **Frosted Card** (`#FFFFFF05`): Task-card surface.
- **Soft Divider** (`#FFFFFF14`): Card, input, and ghost-control borders.

### Named Rules

**The Accent-Is-Action Rule.** Use yellow or green for actionable, active, or focused states; accent without a state or action is visual noise.

**The Theme-Contrast Rule.** Light-theme green surfaces use dark text; dark-theme accent surfaces use the established dark foreground.

**The Surface-Stays-Quiet Rule.** Cards use subtle white transparency and borders rather than opaque gray panels, gradients, or stacked shadows.

## Typography

**Display Font:** System sans-serif stack (`-apple-system`, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, PingFang SC, Microsoft YaHei)

**Body Font:** Same system sans-serif stack

**Character:** The system stack keeps Latin and Simplified Chinese text equally legible while preserving a clean, native-feeling product interface. Weight and color, rather than decorative typefaces, establish hierarchy.

### Hierarchy
- **Display** (800, `clamp(2rem, 5vw, 3.25rem)`, `1.2`): Community page hero title; rendered with the foreground-to-accent gradient.
- **Card Title** (700, `1.15rem`, `1.25`): Task name at the start of each result card.
- **Body** (400, `1rem`, `1.6`): General copy and localized task summaries.
- **Metadata** (400, `0.85rem`, `1.6`): Category, agent, skills, and CLI labels in compact card rows.
- **Label** (600, `0.875rem`, uppercase with `0.12em` spacing): Hero eyebrow only.

### Named Rules

**The Locale-Parity Rule.** Every visible English label that participates in content hierarchy must have an equivalent Chinese label in the same component structure.

## Elevation

The system is flat by default. Separation comes from translucent fills, thin white borders, and small positional movement on interactive cards; it does not use persistent drop shadows.

### Named Rules

**The Hover-Moves-a-Little Rule.** Interactive task cards may lift by `2px` over `150ms`; controls should communicate state through color, border, or underline before introducing motion.

**The Focus-Is-Visible Rule.** Search fields use a `2px` theme accent outline with `1px` offset. New interactive components must provide an equally visible keyboard focus treatment.

## Components

### Buttons
- **Shape:** Rounded rectangle (`0.75rem`) with `0.7rem 1.25rem` padding.
- **Primary:** Yellow/green treatment with dark text; light mode uses the lighter green surface (`#BBF7D0`) so the existing dark label remains readable.
- **Ghost:** Transparent with a Soft Divider border and Cloud White text, used for secondary source navigation.
- **Locale Controls:** Grouped bordered buttons with muted text at rest and foreground text on hover.

### Filters
- **Search Field:** Flexible input with a transparent frosted surface, Soft Divider border, and visible accent focus outline.
- **Category Chips:** Pill controls (`999px` radius) with muted text by default; the active chip uses the theme-aware accent surface and dark text.
- **Empty State:** Centered muted copy spanning the entire task grid when no results match.

### Task Cards
- **Corner Style:** `1rem` radius with `1.5rem` internal padding.
- **Background:** Frosted Card (`#FFFFFF05`) with a Soft Divider border.
- **Content Order:** Localized task name, version, localized summary, compatibility metadata, tags, then detail link.
- **Hover / Focus:** Border shifts toward `rgba(109, 139, 255, 0.5)` and the card moves up `2px`; the detail link remains a text action with an underline on hover.

### Navigation
- **Primary Scan Path:** Hero actions, then discovery toolbar, then responsive task grid.
- **Responsive Grid:** Use four columns above `1180px`, three columns above `900px`, two columns above `620px`, and one column on narrow screens.

## Do's and Don'ts

### Do:
- **Do** keep content inside the `1080px` page width and preserve the current hero-to-toolbar-to-grid reading order.
- **Do** use the theme-aware accent tokens for focus, active filters, primary actions, and interactive text.
- **Do** preserve bilingual content pairs using the existing locale visibility classes.
- **Do** provide a visible focus style and an explicit empty state for every new filterable collection.
- **Do** use compact metadata and pill tags to support scanning without competing with task titles.

### Don't:
- **Don't** replace Console Black (`#0B0D12`) with bright white or mid-gray page surfaces.
- **Don't** spread accent gradients across cards, metadata, or large body-copy areas.
- **Don't** add large persistent shadows, glassmorphism blur, glowing particles, or neon AI-tool styling.
- **Don't** rely on color alone to communicate a selected filter, focus state, or locale.
- **Don't** introduce new components that break English and Simplified Chinese structural parity.
