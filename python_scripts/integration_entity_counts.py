#!/usr/bin/env python3

import json
from collections import Counter

ENTITY_REGISTRY = "/config/.storage/core.entity_registry"
DEVICE_REGISTRY = "/config/.storage/core.device_registry"
AREA_REGISTRY = "/config/.storage/core.area_registry"
LABEL_REGISTRY = "/config/.storage/core.label_registry"

BAD_STATES = {"unavailable", "unknown"}

SECRETS_FILE = "/config/secrets.yaml"
SECRET_NAME = "ha_llat"
HA_URL = "http://127.0.0.1:8123/api"

import re
import urllib.request


def output(state=0, **kwargs):
    result = {
        "state": state,
        "error": "",
    }

    result.update(kwargs)

    print(json.dumps(result))


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


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


def sorted_counter(counter):
    return dict(
        sorted(
            counter.items(),
            key=lambda item: (-item[1], item[0])
        )
    )


def main():
    try:
        # ---------------------------------------------------------
        # Load registries
        # ---------------------------------------------------------

        entity_registry = load_json(ENTITY_REGISTRY)

        entities = entity_registry.get("data", {}).get("entities", [])

        # ---------------------------------------------------------
        # Load live HA states
        # ---------------------------------------------------------

        token = load_secret(SECRET_NAME)

        live_states = {}

        if token:
            try:
                live_states = {
                    item.get("entity_id"): item.get("state")
                    for item in get_states(token)
                    if item.get("entity_id")
                }
            except Exception:
                # Registry statistics can still be generated
                live_states = {}

        # ---------------------------------------------------------
        # Counters
        # ---------------------------------------------------------

        integration_counts = Counter()
        enabled_counts = Counter()
        disabled_counts = Counter()
        hidden_counts = Counter()

        unavailable_counts = Counter()
        unknown_counts = Counter()

        domain_counts = Counter()

        total_entities = 0
        enabled_entities = 0
        disabled_entities = 0
        hidden_entities = 0

        unavailable_entities = 0
        unknown_entities = 0

        entities_without_device = 0
        entities_without_unique_id = 0
        entities_without_area = 0

        labelled_entities = 0

        # ---------------------------------------------------------
        # Process entities
        # ---------------------------------------------------------

        for entity in entities:
            entity_id = entity.get("entity_id")

            if not entity_id:
                continue

            total_entities += 1

            platform = entity.get("platform") or "unknown"
            domain = entity_id.split(".", 1)[0]

            integration_counts[platform] += 1
            domain_counts[domain] += 1

            # Disabled
            if entity.get("disabled_by") is not None:
                disabled_entities += 1
                disabled_counts[platform] += 1
            else:
                enabled_entities += 1
                enabled_counts[platform] += 1

            # Hidden
            if entity.get("hidden_by") is not None:
                hidden_entities += 1
                hidden_counts[platform] += 1

            # Device association
            if not entity.get("device_id"):
                entities_without_device += 1

            # Unique ID
            if not entity.get("unique_id"):
                entities_without_unique_id += 1

            # Area
            #
            # An entity may inherit an area through its device, so this
            # specifically represents entities with no direct area_id.
            if not entity.get("area_id"):
                entities_without_area += 1

            # Labels
            if entity.get("labels"):
                labelled_entities += 1

            # Live state
            state = live_states.get(entity_id)

            if state == "unavailable":
                unavailable_entities += 1
                unavailable_counts[platform] += 1

            elif state == "unknown":
                unknown_entities += 1
                unknown_counts[platform] += 1

        # ---------------------------------------------------------
        # Device registry
        # ---------------------------------------------------------

        total_devices = 0
        disabled_devices = 0

        try:
            device_registry = load_json(DEVICE_REGISTRY)

            devices = (
                device_registry
                .get("data", {})
                .get("devices", [])
            )

            total_devices = len(devices)

            disabled_devices = sum(
                1
                for device in devices
                if device.get("disabled_by") is not None
            )

        except Exception:
            pass

        # ---------------------------------------------------------
        # Areas
        # ---------------------------------------------------------

        total_areas = 0

        try:
            area_registry = load_json(AREA_REGISTRY)

            areas = (
                area_registry
                .get("data", {})
                .get("areas", [])
            )

            total_areas = len(areas)

        except Exception:
            pass

        # ---------------------------------------------------------
        # Labels
        # ---------------------------------------------------------

        total_labels = 0

        try:
            label_registry = load_json(LABEL_REGISTRY)

            labels = (
                label_registry
                .get("data", {})
                .get("labels", [])
            )

            total_labels = len(labels)

        except Exception:
            pass

        # ---------------------------------------------------------
        # Sort dictionaries
        # ---------------------------------------------------------

        integration_counts = sorted_counter(integration_counts)
        enabled_counts = sorted_counter(enabled_counts)
        disabled_counts = sorted_counter(disabled_counts)
        hidden_counts = sorted_counter(hidden_counts)

        unavailable_counts = sorted_counter(unavailable_counts)
        unknown_counts = sorted_counter(unknown_counts)

        domain_counts = sorted_counter(domain_counts)

        # ---------------------------------------------------------
        # Output
        # ---------------------------------------------------------

        output(
            state=len(integration_counts),

            total_integrations=len(integration_counts),

            total_entities=total_entities,
            enabled_entities=enabled_entities,
            disabled_entities=disabled_entities,
            hidden_entities=hidden_entities,

            unavailable_entities=unavailable_entities,
            unknown_entities=unknown_entities,

            total_devices=total_devices,
            disabled_devices=disabled_devices,

            total_areas=total_areas,
            total_labels=total_labels,
            labelled_entities=labelled_entities,

            entities_without_device=entities_without_device,
            entities_without_unique_id=entities_without_unique_id,
            entities_without_area=entities_without_area,

            integration_counts=integration_counts,
            enabled_counts=enabled_counts,
            disabled_counts=disabled_counts,
            hidden_counts=hidden_counts,

            unavailable_counts=unavailable_counts,
            unknown_counts=unknown_counts,

            domain_counts=domain_counts,
        )

    except Exception as e:
        output(
            state=0,
            error=str(e),
        )


if __name__ == "__main__":
    main()