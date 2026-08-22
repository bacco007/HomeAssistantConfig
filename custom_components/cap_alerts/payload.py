"""Bound the attribute payload the recorder stores (issue #150).

The recorder refuses to store a state's attributes once the serialized set
exceeds 16,384 bytes — it writes ``{}`` and logs, so the row keeps the state and
loses every attribute on it. One live ECCC air-quality warning serializes to
19,080 bytes today, which is that failure happening in production rather than
waiting to.

**The unit is the payload, not the field.** Per-field caps were measured against
425 real alerts (``scripts/text_size_sweep.py``) and fail in both directions at
once: an NWS Tropical Cyclone Local Statement carries 8,871 bytes of long-form
text and still serializes to 14,290, so a 6 KB ``description`` cap would shred
2,639 bytes of a hurricane statement that was never a problem — while the alert
that *does* overflow is only 9,535 bytes of text out of 19,080, so capping text
never rescues it at all.

So: serialize, measure, and trim only when it doesn't fit. Priority decides who
pays, strictly — the whole of one field's expendable text is spent before the
next field gives up a byte. Proportional shaving would damage the field the user
needs in order to spare the one nobody reads.

Measurement mirrors ``recorder.db_schema.shared_attrs_bytes_from_event``: the
ceiling applies to ``state.attributes`` minus ``ALL_DOMAIN_EXCLUDE_ATTRS`` and
minus the entity's own ``_unrecorded_attributes``, which is a smaller set than
``to_attributes()`` returns. Declaring ``parameters`` unrecorded therefore takes
the one unbounded provider-controlled term out of the bound for free.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.const import (
    ATTR_ATTRIBUTION,
    ATTR_RESTORED,
    ATTR_SUPPORTED_FEATURES,
)
from homeassistant.helpers.json import json_bytes

_LOGGER = logging.getLogger(__name__)

# ``recorder.db_schema.MAX_STATE_ATTRS_BYTES``. Not imported: the recorder is a
# separate integration and this one does not depend on it.
RECORDER_CEILING = 16384

# Headroom for what Home Assistant appends after ``extra_state_attributes``
# returns — ``friendly_name`` (device name plus the event, which normalization
# has already clipped to 255 characters) and ``icon``.
PAYLOAD_RESERVE = 584

PAYLOAD_BUDGET = RECORDER_CEILING - PAYLOAD_RESERVE

# ``recorder.const.ALL_DOMAIN_EXCLUDE_ATTRS``, spelled out for the same reason
# as the ceiling above.
_RECORDER_EXCLUDED = frozenset(
    {ATTR_ATTRIBUTION, ATTR_RESTORED, ATTR_SUPPORTED_FEATURES}
)

# Attributes the alert entity declares unrecorded, so they neither count toward
# the bound nor land in history. ``parameters`` is the providers' verbatim
# ``<parameter>`` catch-all: unbounded, source-controlled, and already excluded
# from ``store.CHANGED_FIELDS_ALLOWLIST``, so nothing downstream diffs it.
UNRECORDED_ATTRIBUTES = frozenset({"parameters"})

# Long-form text, in the order it is spent. Both alternates go before either
# primary — the primary is the language the user asked for. Within a language
# the instruction outlives the description: it is the protective-action text,
# and at a median 1,835 bytes across 6,158 sampled values protecting it outright
# is nearly free.
TRIM_PRIORITY: tuple[str, ...] = (
    "description_alt",
    "instruction_alt",
    "description",
    "instruction",
)

# Structural redundancy, dropped whole once the text is spent: a fixed prefix
# plus the codes already in ``affected_zones``.
#
# The geocode surface used to belong here too — the ``geocode_*`` aliases
# republished codes ``geocodes`` already carried, 5,510 bytes of them on the
# alert that overflowed. That is now de-duplicated at the source
# (``model.to_attributes``) rather than under pressure, so there is nothing left
# to drop: paying it back only on oversized alerts would have left every other
# alert carrying the same waste.
DROP_PRIORITY: tuple[str, ...] = ("affected_zone_uris",)

# Below this many bytes a survivor is a stub rather than text, so the key is
# dropped instead. An attribute holding two words and an ellipsis tells a
# consumer less than its absence does.
_MIN_TEXT_KEEP = 160


def truncate_bytes(text: str, limit_bytes: int) -> str:
    """Trim ``text`` to ``limit_bytes`` UTF-8 bytes, appending ``…``.

    Truncates at a UTF-8 character boundary to avoid mojibake. Under-limit
    input is returned unchanged.
    """
    if not text:
        return text
    encoded = text.encode("utf-8")
    if len(encoded) <= limit_bytes:
        return text
    # Reserve 3 bytes for the trailing ellipsis (U+2026 is 3 bytes in UTF-8).
    # A limit with no room for it yields the ellipsis alone rather than a
    # negative slice that would keep the text and drop its tail.
    if limit_bytes <= 3:
        return "\u2026"
    truncated = encoded[: limit_bytes - 3]
    # Back off to a character boundary by decoding with 'ignore'.
    return truncated.decode("utf-8", errors="ignore") + "\u2026"


def measure(
    attrs: dict[str, Any],
    unrecorded: frozenset[str] = UNRECORDED_ATTRIBUTES,
) -> int | None:
    """Serialized size of the subset the recorder measures, or None if unmeasurable.

    ``None`` means the attributes did not survive JSON encoding, which is the
    recorder's problem to report — there is nothing useful to trim toward, so
    callers leave the payload alone rather than shredding text on a guess.
    """
    excluded = _RECORDER_EXCLUDED | unrecorded
    try:
        return len(json_bytes({k: v for k, v in attrs.items() if k not in excluded}))
    except TypeError:
        return None


def fit_to_budget(
    attrs: dict[str, Any],
    *,
    budget: int = PAYLOAD_BUDGET,
    unrecorded: frozenset[str] = UNRECORDED_ATTRIBUTES,
) -> dict[str, Any]:
    """Return ``attrs`` trimmed to fit ``budget``, or unchanged if it already does.

    Never mutates the input: an over-budget payload is copied first, so the
    ``CAPAlert`` behind it keeps the full text the source sent and
    ``store.process()`` goes on diffing that rather than a platform artifact.
    """
    size = measure(attrs, unrecorded)
    if size is None or size <= budget:
        return attrs

    trimmed = dict(attrs)
    for key in TRIM_PRIORITY:
        text = trimmed.get(key)
        if not isinstance(text, str) or not text:
            continue
        # Everything this field can give up, minus what is actually needed:
        # removing a character never saves less than a byte (JSON escapes save
        # more), so the cut always clears the excess.
        room = len(text.encode("utf-8")) - (size - budget)
        if room < _MIN_TEXT_KEEP:
            del trimmed[key]
        else:
            trimmed[key] = truncate_bytes(text, room)
        size = measure(trimmed, unrecorded)
        if size is None or size <= budget:
            return trimmed

    for key in DROP_PRIORITY:
        if key not in trimmed:
            continue
        del trimmed[key]
        size = measure(trimmed, unrecorded)
        if size is None or size <= budget:
            return trimmed

    _LOGGER.debug(
        "Alert %s still exceeds the %d-byte attribute budget at %s bytes after "
        "trimming; the recorder will drop its attributes",
        trimmed.get("id", "?"),
        budget,
        size,
    )
    return trimmed
