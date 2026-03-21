# Changelog

All notable changes to Entity Manager will be documented in this file.

## [2.10.0] - 2026-03-03

### Added
- **Device grouping in integration view**: entities grouped by device with collapsible dropdowns; 2-column entity grid; devices and entities sorted alphabetically
- **Device selection indicator**: green ✓ (all) / orange ✓ (partial) on device header, updates live
- **Area/room assignment**: 📍 button on device headers, context menu on entities, bulk assign on Unassigned smart group; inline area creation
- **Floor smart group mode**: groups entities by Floor → Area hierarchy; "No Floor / No Area" fallback
- **Unassigned sub-groups**: integration → device nesting inside Unassigned smart group
- **Select Open Device** sidebar action: selects entities from expanded device dropdowns
- **Config entry health stat card**: shows broken integrations with per-entry Reload button
- **Dry-run rename preview**: shows affected YAML files before committing rename
- **Last-seen timestamps** for unavailable entities (90-day history scan)
- **Stale entity cleanup workflow**: Keep / Disable / Remove per stale entity with dismissal storage
- **Bulk label operations**: add/remove labels across selected entities from multi-select toolbar
- **Custom entity presets**: save named selections, enable/disable from sidebar
- `watch-and-sync.ps1`: auto-syncs to HA on file save during development

### Changed
- Lovelace stat card shows unique card type count instead of total card count
- Device Enable All / Disable All button styles moved to CSS classes

## [2.9.2] - 2026-02-23

### Added
- **Entity detail dialog**: click any entity card body to open a full info dialog — Overview, State + all attributes, Registry, Device, Integration, Area, Labels, State History (last 30 days). New backend WS command `entity_manager/get_entity_details`
- **Entity card redesign**: dark header band (device / state chip / time), prominent entity ID, enabled badge, checkbox+star+actions in bottom row
- **HA auto-backup toggle**: banner in Updates section shows and toggles HA's global `core_backup_before_update` / `add_on_backup_before_update` via hassio API; green/red tinted with descriptive subtitle; hidden on plain HA Core
- **Per-entity backup checkbox**: shown only when `UpdateEntityFeature.BACKUP` flag is set; "Backup All (N)" header checkbox for bulk selection
- **Sequential update queue**: bulk updates always run one at a time; rows show Queued → Active (spinner + sweeping progress bar) → Done ✓ / Failed ✕ states
- **Live update progress ring**: `set hass()` watches entity state; SVG progress ring appears when HA reports `update_percentage`; auto-marks done when entity transitions to `state: off`
- **Browser mod dialog**: active browser detection, Deregister per-row, Clean up stale, Deregister all but active, browser ID chip with navigate/copy actions
- **Sidebar Domains section**: domain filter moved from toolbar dropdown into sidebar section below Quick Filters
- **Sidebar Actions**: Enable Selected, Disable Selected, Deselect All, Refresh moved from toolbar into sidebar Actions section
- **"Update Selected" pill button**: expands from the right side of the Select All pill via `max-width` CSS animation; zero-width and invisible when nothing is selected
- **Updates search bar**: repositioned below the action bar for a cleaner layout
- **Total Entities stat card clickable**: opens grouped entity list (Integration → Device → entities) with status dots and disable badges; hash UUID platform names bucketed under "Other"

### Fixed
- Toast z-index raised to `99999` (was invisible behind dialogs due to `backdrop-filter` compositing); default duration 10 s
- Backup label styled with green border/text matching Update button
- Device names now shown in entity list dialogs — backend fetches `name_by_user`/`name` from device registry (was showing raw device UUIDs)
- Hash/UUID integration group names no longer shown for raw config entry IDs in entity list dialogs
- Null guards added for `this.data` accesses in entity list dialog
- Refresh while on Updates page now reloads updates instead of navigating to entity list
- All update row state colours use CSS variables for full theme compatibility

### Backend
- New `entity_manager/get_entity_details` WS command; added `device_registry`, `area_registry`, `label_registry` imports
- `get_disabled_entities` now includes device `name` field (fetched from device registry)

---

## [2.8.1] - 2026-02-18

### Added
- **Integration select-all checkbox**: Each integration header has a "Select all" checkbox; supports indeterminate state; works when collapsed
- **Updates filter counter**: Updates button shows real count of pending HA updates (`update.*` with `state = on`)
- **Bulk rename — entity list**: Collapsible selected entity list so you can verify before renaming
- **Bulk rename — regex help**: `?` button toggles inline reference panel with common patterns and capture group examples
- **Bulk label — entity list**: Collapsible selected entity list in Add Labels dialog
- **Bulk rename placeholders**: Realistic HA entity name examples in Find/Replace inputs

### Fixed
- Label chip text contrast: canvas luminance picks dark/light text for any CSS color including HA named colors
- Label dialog Done button incorrectly targeted Create button; now scoped to `.confirm-dialog-actions`
- Sidebar active item uses left border accent instead of filled background (fixes white-on-yellow unreadability)

---

## [2.8.0] - 2026-02-18

### Added
- **Lovelace Dashboard Inspector**: New dialog showing dashboards overview, card type bar chart (built-in/custom/unknown badges), and entity reference map across all dashboards
- **Template entity editing**: Edit dialog to rename entity_id and display name; renames propagate through HA entity registry (updates UI automations/scripts automatically)
- **YAML config updater**: `entity_manager/update_yaml_references` backend command — scans all config YAML files and safely replaces renamed entity IDs using word-boundary matching
- **Template entity removal**: Removes UI-created templates via config entry deletion (prevents restart recreation); YAML templates removed from registry with warning
- **Collapsible sidebar sections**: All 6 nav sections collapse/expand with animated arrow; default closed; state persisted in localStorage per section

### Changed
- Lovelace card count is now recursive (includes nested cards in stacks, grids, conditionals, etc.)
- Lovelace WS API corrected to use `url_path` instead of `dashboard_id`
- Removed Updates stat card (redundant with HA built-in update notifications)

### Fixed
- Last entity row cut off at bottom of page — `min-height: 100vh` conflicted with flex layout; resolved with `min-height: 0` override and `padding-bottom: 32px`
- Null access errors in Lovelace dialog for `card.conditions` and `view.sections` array entries
- `entities.map()` and `entities.sort()` crash when array contains null entries

## [2.9.0] - 2026-02-17

### Added
- Complete changelog entries for v2.8.0 and v2.8.1 in root repository
- Aligned version references across all project files (manifest, README, package.json, docs)
- **Template Sensors Configuration**: Support for entity statistics tracking
  - Disabled/enabled entities count sensors
  - Total entities sensor
  - Integration statistics sensor
  - JSON export sensor for automation integration
  - Examples for using in automations and conditions

### Changed
- Updated README version badge to 2.9.0
- Updated manifest.json version to 2.9.0
- Updated package.json version to 2.9.0
- Updated PROJECT_SUMMARY.md version references to 2.9.0
- Enhanced Table of Contents with new Lovelace and Template Sensors sections

### Documentation
- Ensured consistency between Git tags, releases, and version references
- All documentation now reflects accurate release history
- Added comprehensive integration examples for dashboard cards and template sensors

---

## [2.8.1] - 2026-02-17

### Added
- **UI Dialog Improvements**: Replaced browser alert/confirm/prompt dialogs with custom in-app dialogs for theme management and filter presets
- **Clickable Statistics**: Automation, Script, and Helper stats in toolbar now clickable to open filtered lists
- **Entity Action Buttons**: Added info and edit action buttons in entity list dialogs for quick navigation to HA UI
- **Input Sanitization**: Added `_escapeHtml()` and `_escapeAttr()` methods for safe theme/preset name rendering

### Fixed
- **XSS Vulnerability**: Escaped theme names and preset names in DOM rendering to prevent HTML injection
- **Admin Permission Logic**: Improved voice intent authorization checks to explicitly deny non-admin/no-user contexts

### Changed
- **Code Quality**: Consolidated enable/disable entity logic into shared helpers in `websocket_api.py`
- **Voice Assistant**: Refactored permission checks for clarity and consistency between enable/disable intents
- **Services Configuration**: Removed obsolete service definitions (bulk_enable, bulk_disable, rename_entity, export_states) from services.yaml as they're not exposed via service calls

### Technical
- Moved `VALID_ENTITY_ID` regex to `const.py` for consistency with voice assistant and websocket API
- Moved `MAX_BULK_ENTITIES` constant to `const.py` for centralized configuration

---

## [2.8.0] - 2026-02-16

### Added
- ✅ **CI/CD Automation**: Full GitHub Actions workflow for linting, type checking, testing, and security scanning
  - JavaScript linting with ESLint
  - Python linting & formatting with Ruff
  - Type checking with MyPy
  - Python tests on 3.11 and 3.12
  - Security scanning with Bandit
- 📚 **Comprehensive Documentation Overhaul**
  - Rewrote README with detailed feature descriptions, architecture, and troubleshooting
  - Added installation corrections and usage walkthroughs
  - Documented all WebSocket API endpoints and local storage keys
  - Added use cases, requirements, and disclaimer sections
- ⚙️ **ESLint Configuration**: Added `.eslintrc.js` for consistent frontend code standards

### Fixed
- **Installation Docs**: Corrected repository URL from placeholder to `https://github.com/TheIcelandicguy/entity-manager`
- **Component Path**: Updated install instructions to reference `custom_components/entity_manager` correctly

### Changed
- **Code Formatting**: Applied consistent formatting across Python backend (spacing, imports)
- **README Version**: Updated badge from 2.6.0 to 2.8.0

### Technical Details
- Service schema formatting for consistency
- Config flow type hints and formatting improvements
- WebSocket handler formatting and documentation improvements

---

## [2.7.0] - 2026-02-09

### Fixed
- **CSS Loading**: Fixed critical issue where CSS styles were not being applied due to Home Assistant's panel isolation. CSS is now injected directly into the component as a `<style>` element instead of relying on external `<link>` tags in `document.head`.
- **Theme Dropdown**: Fixed theme dropdown menu appearing behind page content by using `position: fixed` with proper `z-index: 10000`.
- **Mobile Sidebar Scrolling**: Fixed navigation sidebar not scrolling on mobile devices:
  - Changed `overflow: hidden` to `overflow-y: auto` for scrollable content
  - Used `100vh - 64px` viewport height calculation
  - Added smooth touch scrolling (`-webkit-overflow-scrolling: touch`)
  - Added `overscroll-behavior: contain` to prevent scroll chaining
  - Added `max-width: 85vw` for very small screens
- **Desktop Sidebar Scrolling**: Fixed sidebar scrolling on desktop by adding `height: 100%` and making the header sticky.
- **Header Overflow**: Changed `overflow: hidden` to `overflow: visible` on app header to prevent dropdown clipping.

### Removed
- **Keyboard Shortcuts**: Removed all keyboard shortcut functionality including:
  - Keyboard event handlers and bindings
  - `_handleKeyboard()` method
  - `_showKeyboardShortcutsHelp()` method
  - Sidebar "Keyboard Shortcuts" menu item
  - "Keyboard Shortcuts" button in Help Guide dialog
  - Associated CSS styles for shortcuts dialog
- **Debug Logging**: Removed console.log debug statements (kept console.error for actual errors)

### Changed
- **CSS Cache Busting**: Added `Date.now()` timestamp to CSS URLs to ensure fresh styles on each load.
- **Base URL Fallback**: Changed fallback base URL from `/local/community/entity_manager/` to `/api/entity_manager/frontend/` for correct path resolution.

### Technical Details
- Panel registration uses `embed_iframe: False` for proper integration with Home Assistant
- CSS is fetched via `fetch()` and injected as inline `<style>` element to work within HA's panel isolation
- Service schema uses `vol.Schema` with `cv.entity_id` validation
- WebSocket API endpoints are protected with `@websocket_api.require_admin` decorator

## [2.6.0] - Previous Release

### Features
- Mobile UI improvements
- Theme customization (predefined + custom themes)
- Theme import/export functionality
- Sidebar navigation with integrations list
- Entity filtering (all/enabled/disabled/updates)
- Domain filtering
- Search functionality
- Bulk enable/disable operations
- Entity renaming
- Favorites system
- Label filtering
- Activity log
- Entity comparison
- Smart grouping
- Help guide

---

For more information, visit the [GitHub repository](https://github.com/TheIcelandicguy/entity-manager).
