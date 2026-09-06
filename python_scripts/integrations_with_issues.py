#!/usr/bin/env python3

import json
import os
import re
import urllib.request

BAD_STATES = {"unavailable", "offline"}
ENTITY_DOMAINS = {"sensor", "binary_sensor"}

# Home Assistant label IDs to ignore
EXCLUDED_LABELS = {"monitor_exclude"}

ENTITY_REGISTRY = "/config/.storage/core.entity_registry"
SECRETS_FILE = "/config/secrets.yaml"
SECRET_NAME = "ha_llat"
HA_URL = "http://127.0.0.1:8123/api"


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


def load_entity_info():
    with open(ENTITY_REGISTRY, "r", encoding="utf-8") as f:
        data = json.load(f)

    return {
        e["entity_id"]: {
            "platform": e.get("platform", "unknown"),
            "labels": set(e.get("labels") or []),
        }
        for e in data.get("data", {}).get("entities", [])
        if e.get("entity_id")
    }


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

        entity_info = load_entity_info()
        integrations = set()

        for entity in get_states(token):
            entity_id = entity.get("entity_id", "")
            state = entity.get("state")

            domain = entity_id.split(".", 1)[0]

            if domain not in ENTITY_DOMAINS:
                continue

            if state not in BAD_STATES:
                continue

            info = entity_info.get(entity_id)

            if not info:
                continue

            # Ignore unavailable/offline entities carrying an excluded label
            if info["labels"] & EXCLUDED_LABELS:
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