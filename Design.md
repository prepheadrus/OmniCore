# Design System: The Silent Architect

## 1. Overview & Creative North Star: "Precision-Focused Calm"
This design system is built for the high-performance professional who demands efficiency without the cognitive load of traditional, cluttered B2B interfaces. We move beyond the "boxed" look of generic SaaS by adopting an **Editorial Balanced** approach. 

The Creative North Star is **The Silent Architect**. Like a bespoke gallery space, the UI exists only to frame the work. We achieve a "Calm Design" philosophy by prioritizing intentional whitespace as a structural element, utilizing balanced typography to respect the user's focus, and employing tonal layering to guide the eye. We don't use lines to separate ideas; we use light, shadow, and depth.

---

## 2. Colors: The Nordic Zinc Spectrum
The palette is anchored in **Nordic Gray and Zinc tones**, designed to feel like brushed aluminum and fine stationery.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning or layout containment. Structural boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section on a `surface` background.
2.  **Tonal Transitions:** Using the `surface-container` tiers to denote hierarchy.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers (stacked sheets of paper).
*   **Base (`surface` / `#f9f9f9`):** The primary canvas.
*   **Low Nesting (`surface-container-low` / `#f2f4f4`):** Use for sidebars or secondary navigation.
*   **High Priority (`surface-container-lowest` / `#ffffff`):** Use for the active workspace, data tables, or primary cards to create a "lifted" feel.

### The "Glass & Gradient" Rule
To elevate the experience, floating components (like the Floating Action Bar) must utilize **Glassmorphism**. Use `surface-container-lowest` at 80% opacity with a `backdrop-blur` of 12px. Main CTAs should feature a subtle linear gradient from `primary` (#5f5e61) to `primary-dim` (#535255) to provide a tactile, premium finish.

---

## 3. Typography: Editorial Clarity
We use a balanced, standard scale to maximize legibility. The primary typeface is **Inter**, utilized with neutral letter-spacing for a modern, tech-forward feel.

*   **Display/Headline:** Use `headline-sm` (1.5rem) for page titles. Bold, authoritative, yet sparse.
*   **The Workhorse:** `body-md` (1rem) is our standard for all UI text, labels, and inputs, providing a comfortable reading rhythm.
*   **The Metadata:** `body-sm` (0.875rem) is reserved for table headers, helper text, and secondary timestamps.
*   **Hierarchy via Weight:** Since our palette is monochromatic, use font-weight (`medium` 500 and `semibold` 600) to distinguish between a label and its value.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "noisy" for a Calm Design. Instead, we use **Ambient Elevation**.

### The Layering Principle
Depth is achieved by "stacking" container tiers. A `surface-container-lowest` (white) card sitting on a `surface-container-low` (light gray) background creates a natural, soft lift.

### Ambient Shadows
For floating elements (modals, popovers), shadows must be "Ambient":
*   **Values:** `0 8px 30px rgba(45, 52, 53, 0.06)`. 
*   **Color:** Tint the shadow with `on-surface` (#2d3435) rather than pure black to keep the light natural.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a data table), use the **Ghost Border**: The `outline-variant` (#adb3b4) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components: Precision & Utility

### Buttons (Butonlar)
*   **Primary:** Background `primary` (#5f5e61), text `on-primary` (#faf7fb). `rounded-md` (0.375rem). Use a subtle 1px top-inner-shadow for a "pressed" high-end feel.
*   **Secondary:** Background `surface-container-highest` (#dde4e5), text `on-surface`. No border.
*   **Tertiary:** No background. Text `primary`. Ghost border only on hover.

### Status Indicators (Durum Rozetleri)
Small, pastel, and high-contrast text.
*   **Tamamlandı (Success):** `bg-emerald-50`, `text-emerald-700`.
*   **İncelemede (Warning):** `bg-amber-50`, `text-amber-700`.
*   **Hata (Error):** `bg-error_container`, `text-on-error_container`.

### Fixed Floating Action Bar (Yüzen Eylem Çubuğu)
A hallmark of the clean layout. For bulk actions (toplu işlemler), a bar should slide in from the bottom.
*   **Style:** `surface-container-lowest` with 85% opacity, `backdrop-blur-md`, and an `ambient-shadow`.
*   **Placement:** Fixed at the bottom center, 24px from the edge.

### Input Fields (Giriş Alanları)
*   **Structure:** Standard comfortable padding, `body-md` text. 
*   **Focus State:** No thick blue rings. Use a 1px `primary` border and a subtle `primary-fixed` (light gray) outer glow.

### Lists & Cards (Listeler ve Kartlar)
**Forbid the use of divider lines.** Separate items using natural white space (Spacing: 2) or a very subtle background hover effect (`surface-container-low`).

---

## 6. Do's and Don'ts

### Do
*   **Do** use Turkish prompts and labels (e.g., "Kaydet" instead of "Save", "Vazgeç" instead of "Cancel").
*   **Do** prioritize "breathing room" (Normal Spacing) to maintain the "Calm" philosophy.
*   **Do** use `surface-container` shifts to define the sidebar vs. the main content.

### Don't
*   **Don't** use pure black (#000) for text. Use `on-surface` (#2d3435) for a softer, premium reading experience.
*   **Don't** use "Shadcn defaults" without adjusting the border-opacity to the "Ghost Border" standard.
*   **Don't** use heavy shadows on cards. Let the background color do the work of separation.
*   **Don't** use bright, saturated primary colors. Stick to the Zinc and Nordic Gray tones.