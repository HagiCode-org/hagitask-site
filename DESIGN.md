---
name: HagiTask Community
description: A focused dark catalog for discovering reusable HagiCode workflows.
colors:
  bg: "#0B0D12"
  fg: "#E6E8EE"
  muted: "#9AA3B2"
  accent: "#6D8BFF"
  accent-secondary: "#8B5CF6"
  card: "#FFFFFF05"
  border: "#FFFFFF14"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, PingFang SC, Microsoft YaHei, sans-serif"
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
  control: "0.75rem"
  card: "1rem"
  pill: "999px"
spacing:
  compact: "0.5rem"
  control: "0.7rem"
  card: "1.5rem"
  section: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
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
    backgroundColor: "#6D8BFF29"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.9rem"
---

# Design System: HagiTask Community

## Overview

**Creative North Star: "The Quiet Operations Console"**

HagiTask Community is a dark, high-signal catalog for reusable HagiCode workflows. It keeps the page centered and calm so task metadata, compatibility requirements, and discovery controls remain the focus rather than becoming dashboard decoration.

The interface uses a nearly black foundation, cool white text, and a restrained blue-to-violet emphasis. The catalog should feel technical and dependable, not like a neon AI landing page or an overloaded analytics console. English and Simplified Chinese content occupy the same structural slots; locale switching must not alter layout hierarchy.

**Key Characteristics:**
- A centered single-column catalog constrained to `1080px`.
- Cool blue and violet gradients reserved for the hero and primary actions.
- Low-contrast translucent cards with border-led separation.
- Compact metadata and tag treatment for fast scanning.
- Client-side search and category filtering with an explicit empty state.

## Colors

The palette is an intentionally restrained dark system: neutral surfaces establish reading comfort while blue is reserved for active and actionable UI.

### Primary
- **Workflow Blue** (`#6D8BFF`): Interactive links, active chips, focus outlines, metadata keys, and the primary action gradient.
- **Workflow Violet** (`#8B5CF6`): The secondary stop in the primary action and ambient hero treatment; do not use as a general text color.

### Neutral
- **Console Black** (`#0B0D12`): Global page background.
- **Cloud White** (`#E6E8EE`): Primary text and high-emphasis controls.
- **Steel Gray** (`#9AA3B2`): Supporting copy, versions, filters, and secondary metadata.
- **Frosted Card** (`#FFFFFF05`): Task-card surface.
- **Soft Divider** (`#FFFFFF14`): Card, input, and ghost-control borders.

### Named Rules

**The Accent-Is-Action Rule.** Use blue for actionable, active, or focused states; a blue accent without a state or action is visual noise.

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

**The Focus-Is-Visible Rule.** Search fields use a `2px` Workflow Blue outline with `1px` offset. New interactive components must provide an equally visible keyboard focus treatment.

## Components

### Buttons
- **Shape:** Rounded rectangle (`0.75rem`) with `0.7rem 1.25rem` padding.
- **Primary:** Blue-to-violet gradient with white text, used for direct data or workflow entry points.
- **Ghost:** Transparent with a Soft Divider border and Cloud White text, used for secondary source navigation.
- **Locale Controls:** Grouped bordered buttons with muted text at rest and foreground text on hover.

### Filters
- **Search Field:** Flexible input with a transparent frosted surface, Soft Divider border, and visible blue focus outline.
- **Category Chips:** Pill controls (`999px` radius) with muted text by default; the active chip uses a blue translucent fill, blue text, and a stronger blue border.
- **Empty State:** Centered muted copy spanning the entire task grid when no results match.

### Task Cards
- **Corner Style:** `1rem` radius with `1.5rem` internal padding.
- **Background:** Frosted Card (`#FFFFFF05`) with a Soft Divider border.
- **Content Order:** Localized task name, version, localized summary, compatibility metadata, tags, then detail link.
- **Hover / Focus:** Border shifts toward `rgba(109, 139, 255, 0.5)` and the card moves up `2px`; the detail link remains a text action with an underline on hover.

### Navigation
- **Primary Scan Path:** Hero actions, then discovery toolbar, then responsive task grid.
- **Responsive Grid:** Use `repeat(auto-fill, minmax(280px, 1fr))` so cards remain readable without an additional mobile-specific layout.

## Do's and Don'ts

### Do:
- **Do** keep content inside the `1080px` page width and preserve the current hero-to-toolbar-to-grid reading order.
- **Do** use `#6D8BFF` for focus, active filters, primary actions, and interactive text.
- **Do** preserve bilingual content pairs using the existing locale visibility classes.
- **Do** provide a visible focus style and an explicit empty state for every new filterable collection.
- **Do** use compact metadata and pill tags to support scanning without competing with task titles.

### Don't:
- **Don't** replace Console Black (`#0B0D12`) with bright white or mid-gray page surfaces.
- **Don't** spread blue or violet gradients across cards, metadata, or large body-copy areas.
- **Don't** add large persistent shadows, glassmorphism blur, glowing particles, or neon AI-tool styling.
- **Don't** rely on color alone to communicate a selected filter, focus state, or locale.
- **Don't** introduce new components that break English and Simplified Chinese structural parity.
