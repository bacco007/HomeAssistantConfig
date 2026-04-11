# Atomic Component Targets — Extended Extraction Plan

This document identifies additional atoms and molecules to extract, following the same
red/green/refactor TDD workflow established in the main `AGENTS.md` plan.
It supplements that plan and does **not** amend it.

---

## Design Principles Applied

1. **Every function that returns HTML must become a component.**  
   Functions like `renderAnalysisSelectOptions()`, `renderTargetChips()`, and
   every `innerHTML = \`…\`` block are the primary extraction targets.

2. **A `<form-group>` atom wraps any form field that needs an optional label + slot.**  
   This is the canonical replacement for raw `<div class="context-form-field">`,
   `<label class="history-target-analysis-field">`, and similar containers.

3. **All new components follow the TypeScript-first rule** — `.ts` files only.

---

## New Atoms

### Display

| Component                  | Props                                                   | Extracted from                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<form-group>`             | `label?: string`, `description?: string` + default slot | `<div class="context-form-field">` in `annotation-dialog.js`; `<label class="history-target-analysis-field">` in `datapoints.js`; editor `<div class="ed">` sub-sections |
| `<sidebar-section-header>` | `title: string`, `subtitle?: string`                    | `.sidebar-section-header` + `.sidebar-section-title` + `.sidebar-section-subtitle` repeated throughout `datapoints.js`                                                   |
| `<empty-state>`            | `message: string`                                       | `.history-target-empty` in `_renderTargetRows()`; the `<ha-card class="empty">` block in `_renderContent()`                                                              |

```
src/atoms/display/form-group/
├── form-group.ts
├── form-group.stories.ts
└── __tests__/
    └── form-group.spec.ts

src/atoms/display/sidebar-section-header/
├── sidebar-section-header.ts
├── sidebar-section-header.stories.ts
└── __tests__/
    └── sidebar-section-header.spec.ts

src/atoms/display/empty-state/
├── empty-state.ts
├── empty-state.stories.ts
└── __tests__/
    └── empty-state.spec.ts
```

---

### Interactive

| Component          | Props                                                    | Events                         | Extracted from                                                                                                   |
| ------------------ | -------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `<toggle-switch>`  | `checked: boolean`, `label: string`, `entityId?: string` | `dp-toggle-change`             | `.history-target-visible-toggle` (checkbox + CSS track) in `_renderTargetRows()`; collapsed summary item toggles |
| `<drag-handle>`    | `label?: string`                                         | `dp-drag-start`, `dp-drag-end` | `.history-target-drag-handle` button with `mdi:drag-vertical` in `_renderTargetRows()`                           |
| `<page-menu-item>` | `icon: string`, `label: string`, `disabled?: boolean`    | `dp-menu-action`               | `.page-menu-item` in the page header action menu in `datapoints.js`                                              |

```
src/atoms/interactive/toggle-switch/
├── toggle-switch.ts
├── toggle-switch.stories.ts
└── __tests__/
    └── toggle-switch.spec.ts

src/atoms/interactive/drag-handle/
├── drag-handle.ts
├── drag-handle.stories.ts
└── __tests__/
    └── drag-handle.spec.ts

src/atoms/interactive/page-menu-item/
├── page-menu-item.ts
├── page-menu-item.stories.ts
└── __tests__/
    └── page-menu-item.spec.ts
```

---

### Form

| Component              | Props                                                                                             | Events                                       | Extracted from                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<inline-select>`      | `value: string`, `options: Array<{value, label}>`, `disabled?: boolean`                           | `dp-select-change`                           | `<select class="history-target-analysis-select">` + the `renderAnalysisSelectOptions()` helper function in `datapoints.js`. **`renderAnalysisSelectOptions` must be deleted once this exists.** |
| `<number-input>`       | `value: string`, `placeholder?: string`, `suffix?: string`, `step?: string`                       | `dp-number-change`                           | `<input class="history-target-analysis-input" type="number">` in threshold analysis rows of `datapoints.js`                                                                                     |
| `<analysis-checkbox>`  | `checked: boolean`, `label: string`, `disabled?: boolean`, `helpText?: string`, `helpId?: string` | `dp-check-change`                            | `<label class="history-target-analysis-option">` rows (with optional `ha-tooltip` for help) throughout `_renderTargetRows()`                                                                    |
| `<radio-group>`        | `name: string`, `value: string`, `options: Array<{value, label}>`                                 | `dp-radio-change`                            | `.sidebar-radio-group` + `.sidebar-radio-option` pattern in `_renderSidebarOptions()`                                                                                                           |
| `<checkbox-list>`      | `items: Array<{name, label, checked}>`                                                            | `dp-item-change` (detail: `{name, checked}`) | `.sidebar-toggle-group` + `.sidebar-toggle-option` pattern in `_renderSidebarOptions()`                                                                                                         |
| `<color-picker-field>` | `color: string`, `entityId?: string`, `hass?: HomeAssistant`                                      | `dp-color-change`                            | `.history-target-color-field` (native color input + ha-state-icon overlay) in `_renderTargetRows()`                                                                                             |

```
src/atoms/form/inline-select/
├── inline-select.ts
├── inline-select.stories.ts
└── __tests__/
    └── inline-select.spec.ts

src/atoms/form/number-input/
├── number-input.ts
├── number-input.stories.ts
└── __tests__/
    └── number-input.spec.ts

src/atoms/form/analysis-checkbox/
├── analysis-checkbox.ts
├── analysis-checkbox.stories.ts
└── __tests__/
    └── analysis-checkbox.spec.ts

src/atoms/form/radio-group/
├── radio-group.ts
├── radio-group.stories.ts
└── __tests__/
    └── radio-group.spec.ts

src/atoms/form/checkbox-list/
├── checkbox-list.ts
├── checkbox-list.stories.ts
└── __tests__/
    └── checkbox-list.spec.ts

src/atoms/form/color-picker-field/
├── color-picker-field.ts
├── color-picker-field.stories.ts
└── __tests__/
    └── color-picker-field.spec.ts
```

---

## New Molecules

### `<analysis-group>` — Collapsible analysis section

**Extracted from:** the repeated pattern inside `_renderTargetRows()` in `datapoints.js`
where each analysis feature (trend lines, rate of change, threshold, anomalies, delta)
renders as a collapsible group: a primary checkbox that acts as the toggle, and a
`<div class="history-target-analysis-group-body">` that appears when checked.

| Props                                                                                              | Events                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `entityId: string`, `optionKey: string`, `label: string`, `checked: boolean`, `alignTop?: boolean` | `analysis-group-change` (detail: `{entityId, key, checked}`) |
| default slot for sub-options shown only when `checked`                                             | —                                                            |

```
src/molecules/analysis-group/
├── analysis-group.ts
├── analysis-group.stories.ts
└── __tests__/
    └── analysis-group.spec.ts
```

---

### `<dp-analysis-panel>` — Per-series analysis configuration panel

**Extracted from:** the `history-target-analysis` + `history-target-analysis-grid` block
inside `_renderTargetRows()`. Composes multiple `<analysis-group>`,
`<analysis-checkbox>`, `<dp-analysis-select-field>`, and `<number-input>` atoms.

| Props                                                                                                                                                      | Events                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `entityId: string`, `analysis: NormalizedHistorySeriesAnalysis`, `canShowDeltaAnalysis: boolean`, `comparisonWindows: ComparisonWindow[]`, `unit?: string` | `dp-analysis-change` (detail: `{entityId, key, value}`) |

```
src/molecules/dp-analysis-panel/
├── dp-analysis-panel.ts
├── dp-analysis-panel.stories.ts
└── __tests__/
    └── dp-analysis-panel.spec.ts
```

---

### `<target-row>` — Single history target row

**Extracted from:** `.history-target-row` inside `_renderTargetRows()`.
Composes `<drag-handle>`, `<color-picker-field>`, `<toggle-switch>`,
`<dp-analysis-panel>`, and a remove icon button.

| Props                                                                                                                                           | Events                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `row: HistorySeriesRow`, `index: number`, `hass: HomeAssistant`, `selectedComparisonWindowId?: string`, `comparisonWindows: ComparisonWindow[]` | `dp-row-color-change`, `dp-row-visibility-change`, `dp-row-analysis-change`, `dp-row-remove`, `dp-row-reorder` |

```
src/molecules/target-row/
├── target-row.ts
├── target-row.stories.ts
└── __tests__/
    └── target-row.spec.ts
```

---

### `<target-row-list>` — List of target rows

**Extracted from:** `_renderTargetRows()` in `datapoints.js`.
Composes `<target-row>` items with drag-to-reorder logic and an
empty state via `<empty-state>`.

| Props                                                                                                                             | Events                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `rows: HistorySeriesRow[]`, `hass: HomeAssistant`, `selectedComparisonWindowId?: string`, `comparisonWindows: ComparisonWindow[]` | `dp-rows-change` (detail: `{rows: HistorySeriesRow[]}`) |

```
src/molecules/target-row-list/
├── target-row-list.ts
├── target-row-list.stories.ts
└── __tests__/
    └── target-row-list.spec.ts
```

---

### `<sidebar-options>` — Chart display options sidebar card

**Extracted from:** `_renderSidebarOptions()` in `datapoints.js`.
Composes three `<sidebar-section-header>` + `<radio-group>` / `<checkbox-list>` blocks.

| Props                                                                                                                                                                                                                                                            | Events                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `datapointScope: string`, `showIcons: boolean`, `showLines: boolean`, `showTooltips: boolean`, `showHoverGuides: boolean`, `showCorrelatedAnomalies: boolean`, `showDataGaps: boolean`, `dataGapThreshold: string`, `delinkYAxis: boolean`, `splitView: boolean` | `dp-scope-change`, `dp-display-change` (detail: `{kind, value}`) |

```
src/molecules/sidebar-options/
├── sidebar-options.ts
├── sidebar-options.stories.ts
└── __tests__/
    └── sidebar-options.spec.ts
```

---

### `<comparison-tab>` — Single comparison window tab

**Extracted from:** the `.chart-tab` template inside `_renderComparisonTabs()`.

| Props                                                                                                                                      | Events                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `tabId: string`, `label: string`, `detail?: string`, `active?: boolean`, `previewing?: boolean`, `loading?: boolean`, `editable?: boolean` | `dp-tab-activate`, `dp-tab-hover`, `dp-tab-leave`, `dp-tab-edit`, `dp-tab-delete` |

```
src/molecules/comparison-tab/
├── comparison-tab.ts
├── comparison-tab.stories.ts
└── __tests__/
    └── comparison-tab.spec.ts
```

---

### `<comparison-tab-rail>` — Scrollable comparison tab strip

**Extracted from:** `_renderComparisonTabs()` (`chart-tabs-shell` + `chart-tabs-rail`

- add button). Composes `<comparison-tab>` items.

| Props                                                                     | Events                                                                                          |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `tabs: ComparisonTabItem[]`, `loadingIds: string[]`, `hoveredId?: string` | `dp-tab-activate`, `dp-tab-hover`, `dp-tab-leave`, `dp-tab-edit`, `dp-tab-delete`, `dp-tab-add` |

```
src/molecules/comparison-tab-rail/
├── comparison-tab-rail.ts
├── comparison-tab-rail.stories.ts
└── __tests__/
    └── comparison-tab-rail.spec.ts
```

---

### `<date-window-dialog>` — Create / edit date window dialog

**Extracted from:** `_ensureDateWindowDialog()` + the open/close/submit logic
in `datapoints.js`. The `innerHTML` block for the dialog content becomes
the `render()` method of a LitElement.

| Props                                                                                                                                                    | Events                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `open: boolean`, `editingWindow?: ComparisonWindow`, `draftRange?: DateRange`, `comparisonWindows: ComparisonWindow[]` (for shortcut navigation context) | `dp-window-submit` (detail: `{label, start, end, id?}`), `dp-window-delete` (detail: `{id}`), `dp-window-close` |

```
src/molecules/date-window-dialog/
├── date-window-dialog.ts
├── date-window-dialog.stories.ts
└── __tests__/
    └── date-window-dialog.spec.ts
```

---

### `<annotation-chip>` — Single removable annotation target chip

**Extracted from:** `renderTargetChips()` in `annotation-dialog.js`.
The `.context-chip` pattern: ha-icon + label text + remove button.
**`renderTargetChips()` must be deleted once this exists.**

| Props                                                            | Events                                      |
| ---------------------------------------------------------------- | ------------------------------------------- |
| `type: string`, `itemId: string`, `icon: string`, `name: string` | `dp-chip-remove` (detail: `{type, itemId}`) |

Note: this is distinct from `<entity-chip>` (which is HA-aware and looks up
entity state). `<annotation-chip>` is stateless — it receives pre-resolved
icon and name.

```
src/atoms/interactive/annotation-chip/
├── annotation-chip.ts
├── annotation-chip.stories.ts
└── __tests__/
    └── annotation-chip.spec.ts
```

---

### `<annotation-chip-row>` — Group of annotation target chips

**Extracted from:** `renderTargetChips()` + the `<div id="chart-context-linked-targets">`
container in `annotation-dialog.js`. Composes `<annotation-chip>` items plus an
empty-state message when the target has no entries.

| Props                                                                                   | Events                                    |
| --------------------------------------------------------------------------------------- | ----------------------------------------- |
| `target: TargetSelection`, `hass: HomeAssistant`, `label?: string`, `helpText?: string` | `dp-target-remove` (detail: `{type, id}`) |

```
src/molecules/annotation-chip-row/
├── annotation-chip-row.ts
├── annotation-chip-row.stories.ts
└── __tests__/
    └── annotation-chip-row.spec.ts
```

---

### `<floating-menu>` — Positioned floating overlay panel

**Extracted from:** `.page-menu` and the range `.range-picker-menu` / `.range-options-menu`
pattern. A host button slot + a positioned floating `<slot name="content">` that
appears/disappears with focus-trap and outside-click dismissal.

| Props                                             | Events          |
| ------------------------------------------------- | --------------- |
| `open: boolean`, `anchorSelector?: string`        | `dp-menu-close` |
| `slot="trigger"` — the button that opens the menu | —               |
| `slot="content"` — the menu body                  | —               |

```
src/molecules/floating-menu/
├── floating-menu.ts
├── floating-menu.stories.ts
└── __tests__/
    └── floating-menu.spec.ts
```

---

## Implementation Order

Extract in dependency order (atoms before molecules that compose them):

| Step | Component                  | Depends on                                                                        |
| ---- | -------------------------- | --------------------------------------------------------------------------------- |
| 1    | `<form-group>`             | —                                                                                 |
| 2    | `<sidebar-section-header>` | —                                                                                 |
| 3    | `<empty-state>`            | —                                                                                 |
| 4    | `<toggle-switch>`          | —                                                                                 |
| 5    | `<drag-handle>`            | —                                                                                 |
| 6    | `<page-menu-item>`         | —                                                                                 |
| 7    | `<inline-select>`          | — (replaces `renderAnalysisSelectOptions`)                                        |
| 8    | `<number-input>`           | —                                                                                 |
| 9    | `<analysis-checkbox>`      | —                                                                                 |
| 10   | `<radio-group>`            | —                                                                                 |
| 11   | `<checkbox-list>`          | —                                                                                 |
| 12   | `<color-picker-field>`     | —                                                                                 |
| 13   | `<annotation-chip>`        | — (replaces `renderTargetChips` partially)                                        |
| 14   | `<analysis-group>`         | `<analysis-checkbox>`, `<inline-select>`                                          |
| 15   | `<dp-analysis-panel>`      | `<analysis-group>`, `<number-input>`, `<analysis-checkbox>`, `<inline-select>`    |
| 16   | `<target-row>`             | `<drag-handle>`, `<color-picker-field>`, `<toggle-switch>`, `<dp-analysis-panel>` |
| 17   | `<target-row-list>`        | `<target-row>`, `<empty-state>`                                                   |
| 18   | `<sidebar-options>`        | `<sidebar-section-header>`, `<radio-group>`, `<checkbox-list>`, `<inline-select>` |
| 19   | `<comparison-tab>`         | —                                                                                 |
| 20   | `<comparison-tab-rail>`    | `<comparison-tab>`                                                                |
| 21   | `<annotation-chip-row>`    | `<annotation-chip>`, `<form-group>`                                               |
| 22   | `<date-window-dialog>`     | `<form-group>`, `<date-time-input>` (existing)                                    |
| 23   | `<floating-menu>`          | —                                                                                 |

---

## Functions to Delete After Migration

| Function                         | Location               | Replaced by             |
| -------------------------------- | ---------------------- | ----------------------- |
| `renderAnalysisSelectOptions()`  | `datapoints.js`        | `<inline-select>`       |
| `renderTargetChips()`            | `annotation-dialog.js` | `<annotation-chip-row>` |
| `_renderSidebarOptions()`        | `datapoints.js`        | `<sidebar-options>`     |
| `_renderTargetRows()`            | `datapoints.js`        | `<target-row-list>`     |
| `_renderComparisonTabs()`        | `datapoints.js`        | `<comparison-tab-rail>` |
| `_ensureDateWindowDialog()` body | `datapoints.js`        | `<date-window-dialog>`  |

---

## Verification

After each extracted component:

- `pnpm test` — all GIVEN/WHEN/THEN tests pass
- `pnpm build` — IIFE bundle builds successfully
- `pnpm lint` — no lint errors
