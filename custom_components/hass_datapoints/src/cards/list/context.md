# List card — context

## Purpose

Activity-style datagrid card showing recorded events with search, pagination, inline edit, and delete. The main entrypoint is [`list.ts`](list.ts).

## State & data flow

- `_allEvents` holds the full unfiltered `EventRecordFull[]` loaded from `fetchEvents()`.
- Filtering by `_searchQuery` and slicing by `_page` are computed inline in the template from `_allEvents`.
- `_editingId` and `_editColor` track the in-progress inline edit row; only one row can be edited at a time.
- After delete or save, `_allEvents` is updated in place (splice/replace) rather than re-fetching the full list.

## External dependencies

- `fetchEvents`, `updateEvent`, `deleteEvent` from `src/lib/data/events-api`.
- `search-bar` and `pagination` atoms for filtering and paging controls.
- `list-event-item` molecule for individual row rendering and inline editing.
- `confirmDestructiveAction` for the delete confirmation dialog.
- `navigateToDataPointsHistory` to open history panel from a row.

## Non-obvious behaviors

- Inline editing is done optimistically — the row switches to edit mode immediately and the API call happens on save. On failure the old value should be restored (not currently implemented; a future improvement).
- Search is client-side over the full `_allEvents` array; pagination resets to page 0 on each search query change.
- The `resolveEntityIdsFromTarget` utility converts the config target (which may contain area/device IDs) into entity IDs before fetching events.

## Conventions

- The editor (`editor.ts`) extends `EditorBase`.
- Do not add server-side search or paging — the full event list for a given entity/range is expected to fit in memory.
