## Anomaly Monitors Panel

This directory owns the standalone anomaly monitor management surface rendered inside the datapoints panel overlay. The main entrypoint is [`anomaly-monitors-panel.ts`](/Users/ollie/Repos/HASS-Data-Points/custom_components/hass_datapoints/src/molecules/anomaly-monitors-panel/anomaly-monitors-panel.ts).

### Responsibilities

- Load persisted monitor records from the backend via `fetchMonitors()`.
- Render monitor cards, toggle/edit/delete actions, dismissal windows, and lazily fetched anomaly clusters.
- Open the anomaly monitor wizard for create/edit flows.
- Keep the list fresh from both local CRUD actions and external Home Assistant changes by subscribing to the backend `hass_datapoints_monitors_updated` event.

### Refresh behavior

- The panel still polls every 30 seconds as a safety net.
- Immediate consistency should come from the websocket event subscription, which reloads the list when a monitor is toggled or otherwise changed from outside this panel, such as from the Devices & Integrations view.

### Testing focus

- Subscribes to `hass_datapoints_monitors_updated` once `hass.connection` is available.
- Tears down the subscription on disconnect.
- Reloads monitor records when the backend pushes a monitor-updated event.
