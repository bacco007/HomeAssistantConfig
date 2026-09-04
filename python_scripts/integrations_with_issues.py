#!/usr/bin/env python3

import json
import re
import urllib.request

BAD_STATES = {"unavailable", "offline"}
ENTITY_DOMAINS = {"sensor", "binary_sensor"}

ENTITY_REGISTRY = "/config/.storage/core.entity_registry"
LABEL_REGISTRY = "/config/.storage/label_registry"

SECRETS_FILE = "/config/secrets.yaml"
SECRET_NAME = "ha_llat"
HA_URL = "http://127.0.0.1:8123/api"

# Label names/slugs to exclude
EXCLUDED_LABELS = {"monitor_exclude"}


def output(count=0, items=None, error=""):
    print(json.dumps({
        "count": count,
        "items": items or [],
        "error": error,
    }))


def load_secret(name):
    try:
        with open(SECRETS_FILE, "r", encoding="utf-8") as f:
            text = f.read()

        match = re.search(
            rf"(?m)^\s*{re.escape(name)}\s*:\s*['\"]?(.+?)['\"]?\s*$",
            text,
        )

        if not match:
            return None

        return match.group(1).strip()

    except Exception:
        return None


def load_excluded_label_ids():
    try:
        with open(LABEL_REGISTRY, "r", encoding="utf-8") as f:
            data = json.load(f)

        excluded = set()

        for label in data.get("data", {}).get("labels", []):
            label_id = label.get("label_id")
            name = label.get("name")
            slug = label.get("slug")

            if name in EXCLUDED_LABELS or slug in EXCLUDED_LABELS:
                excluded.add(label_id)

        return excluded

    except FileNotFoundError:
        return set()


def load_entity_info():
    with open(ENTITY_REGISTRY, "r", encoding="utf-8") as f:
        data = json.load(f)

    entities = {}

    for entity in data.get("data", {}).get("entities", []):
        entity_id = entity.get("entity_id")

        if not entity_id:
            continue

        entities[entity_id] = {
            "platform": entity.get("platform", "unknown"),
            "labels": set(entity.get("labels", [])),
        }

    return entities


def get_states(token):
    req = urllib.request.Request(
        f"{HA_URL}/states",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    try:
        token = load_secret(SECRET_NAME)

        if not token:
            output(error=f"Could not load secret '{SECRET_NAME}' from {SECRETS_FILE}")
            return

        excluded_label_ids = load_excluded_label_ids()
        entities = load_entity_info()
        integrations = set()

        for state_obj in get_states(token):
            entity_id = state_obj.get("entity_id", "")
            state = state_obj.get("state")

            domain = entity_id.split(".", 1)[0]

            if domain not in ENTITY_DOMAINS:
                continue

            if state not in BAD_STATES:
                continue

            info = entities.get(entity_id)

            if not info:
                continue

            if info["labels"] & excluded_label_ids:
                continue

            integration = info.get("platform")

            if integration:
                integrations.add(integration)

        items = sorted(integrations)
        output(count=len(items), items=items)

    except Exception as e:
        output(error=str(e))


if __name__ == "__main__":
    main()