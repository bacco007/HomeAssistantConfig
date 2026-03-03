"""
Whodunnit  -  Home Assistant Custom Integration
config_flow.py: UI-driven configuration flow

This file defines the setup wizard that appears when a user adds Whodunnit
via Settings → Integrations → Add Integration.

The flow is intentionally simple: one step, one field. The user picks a single
entity to monitor and submits. Whodunnit creates one config entry (and therefore
one sensor) per entity.

Key design decisions:
  - One entity per config entry. This keeps state management straightforward and
    gives each tracked entity its own card in the Integrations UI.
  - Already-tracked entities are hidden from the picker to prevent duplicates,
    which is enforced here in addition to the unique_id check below.
  - The entry title is set to a slug-based fallback at creation time. The real
    friendly name is applied immediately afterwards by update_entry_title() in
    async_setup_entry (__init__.py), so the placeholder is never visible to the
    user in practice.
"""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import selector
from .const import DOMAIN, SUPPORTED_DOMAINS


class WhodunnitConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the configuration flow for Whodunnit."""

    # Increment VERSION if the data schema changes in a way that requires
    # migrating existing config entries (see async_migrate_entry in HA docs).
    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial (and only) setup step.

        This method is called twice during setup:
          1. With user_input=None to render the empty form.
          2. With user_input populated after the user submits the form.
        """
        if user_input is not None:
            # The EntitySelector returns a single entity_id string because
            # multiple=False is set in the selector config below.
            target = user_input["targets"]

            # Generate a unique ID for this entry based on the entity being
            # tracked. This prevents the user from setting up two Whodunnit
            # instances for the same entity  -  HA will call _abort_if_unique_id_configured
            # and show the "already_configured" abort message from strings.json.
            await self.async_set_unique_id(f"whodunnit_{target.replace('.', '_')}")
            self._abort_if_unique_id_configured()

            # Wrap the single entity_id in a list. The data model uses a list
            # to keep the door open for multi-entity tracking in a future version
            # without requiring a data migration.
            user_input["targets"] = [target]

            # Use a slug-derived placeholder as the initial title. The real
            # friendly name is applied by update_entry_title() in __init__.py
            # as soon as the entry finishes loading, so this value is transient.
            return self.async_create_entry(
                title=target.split(".")[-1].replace("_", " ").title(),
                data=user_input
            )

        # --- Build and display the form ---

        # Collect all entity IDs already being tracked across all existing
        # Whodunnit entries. These are excluded from the picker so the user
        # cannot accidentally select an entity that is already monitored.
        existing_entities = []
        for entry in self._async_current_entries():
            existing_entities.extend(entry.data.get("targets", []))

        # Render the entity picker. SUPPORTED_DOMAINS (defined in const.py)
        # limits the picker to entity types that produce meaningful state-change
        # events. Read-only sensors are excluded because their state is driven
        # entirely by the device and cannot be triggered by a user or automation.
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required("targets"): selector.EntitySelector(
                    selector.EntitySelectorConfig(
                        domain=SUPPORTED_DOMAINS,
                        multiple=False,         # One entity per Whodunnit instance
                        exclude_entities=existing_entities,
                    ),
                ),
            }),
        )