"""Constants for Entity Manager."""

import re

DOMAIN = "entity_manager"
MAX_BULK_ENTITIES = 500
VALID_ENTITY_ID = re.compile(r"^[a-z][a-z0-9_]*\.[a-z0-9_]+$")
