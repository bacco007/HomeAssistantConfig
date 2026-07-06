"""Shared helpers for the Whodunnit integration."""


def slug_to_title(entity_id: str) -> str:
    """Return a title-cased display name derived from an entity_id's object id."""
    return entity_id.split(".")[-1].replace("_", " ").title()


def entry_unique_id(target_entity: str) -> str:
    """Return the config entry unique_id for a tracked entity."""
    return f"whodunnit_{target_entity.replace('.', '_')}"


def sensor_unique_id(target_entity: str) -> str:
    """Return the sensor entity unique_id for a tracked entity."""
    return f"{target_entity}_whodunnit"
