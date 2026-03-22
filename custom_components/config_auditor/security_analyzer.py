import asyncio
import logging
import re
from typing import Any

from homeassistant.core import HomeAssistant
from .translation_utils import TranslationHelper

_LOGGER = logging.getLogger(__name__)

# Regular expressions for sensitive data detection
# Applied only to raw string VALUES (not keys, not entity_ids)
SECRET_PATTERNS = [
    r"^[a-zA-Z0-9_\-]{16,}$",   # Long alphanumeric-only strings (likely a raw token/key)
]

# Suspicious key names that should not hold raw string values
SENSITIVE_KEY_NAMES = {"api_key", "password", "token", "secret", "api_token",
                       "access_token", "client_secret", "client_id", "bearer", "auth_key"}

# Regex to exclude values that are clearly NOT secrets
ENTITY_ID_PATTERN = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")         # entity_id
URL_PATTERN       = re.compile(r"^https?://")                      # URLs
TEMPLATE_PATTERN  = re.compile(r"\{[%{]")                          # Jinja2 templates
SECRET_REF_PATTERN = re.compile(r"!secret\s+\w+")                  # already using !secret

SENSITIVE_DATA_REGEX = re.compile("|".join(SECRET_PATTERNS), re.IGNORECASE)

class SecurityAnalyzer:
    """Analyze configurations for security vulnerabilities."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the security analyzer."""
        self.hass = hass
        self.issues: list[dict[str, Any]] = []
        self._translator = TranslationHelper(hass)

    async def analyze_all(self, automation_configs: dict[str, dict[str, Any]] | None = None) -> list[dict[str, Any]]:
        """Run all security checks."""
        self.issues = []
        
        # Load language for translations
        language = self.hass.data.get("config_auditor", {}).get("user_language") or self.hass.config.language or "en"
        await self._translator.async_load_language(language)

        # Load haca_ignore label (entity + device level)
        from .translation_utils import async_get_haca_ignored_entity_ids
        _ignored = await async_get_haca_ignored_entity_ids(self.hass)
        
        # Filter out ignored automations from configs
        automation_configs = {
            eid: cfg for eid, cfg in (automation_configs or {}).items()
            if eid not in _ignored
        }
        
        # 1. Scan for hardcoded secrets in automation configs
        await self._scan_for_hardcoded_secrets(automation_configs)
        
        # 2. Scan for sensitive data exposure in services (notifications, etc)
        await self._scan_for_data_exposure(automation_configs)
        
        _LOGGER.info("Security analysis complete: %d issues found", len(self.issues))
        return self.issues

    def _is_likely_secret(self, value: str) -> bool:
        """Return True if a string value looks like a hardcoded secret.
        
        Excludes:
        - Entity IDs  (domain.name)
        - URLs        (http://...)
        - Jinja2 templates  ({{ ... }} / {% ... %})
        - Values that are too short (< 16 chars)
        - Values that contain spaces (likely a human-readable string)
        """
        if not isinstance(value, str):
            return False
        v = value.strip()
        if len(v) < 16:
            return False
        if ' ' in v:
            return False
        if ENTITY_ID_PATTERN.match(v):
            return False
        if URL_PATTERN.match(v):
            return False
        if TEMPLATE_PATTERN.search(v):
            return False
        if SECRET_REF_PATTERN.search(v):
            return False
        # Must be long alphanumeric (possible raw key/token)
        return bool(SENSITIVE_DATA_REGEX.match(v))

    def _find_secrets_in_dict(self, obj: Any, path: str = "") -> list[str]:
        """Recursively walk a dict and return paths where a secret might be hardcoded."""
        found = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                child_path = f"{path}.{k}" if path else k
                # If the key name is suspicious AND the value looks like a secret
                if isinstance(k, str) and k.lower() in SENSITIVE_KEY_NAMES:
                    if self._is_likely_secret(v):
                        found.append(child_path)
                # Recurse into nested dicts/lists regardless
                found.extend(self._find_secrets_in_dict(v, child_path))
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                found.extend(self._find_secrets_in_dict(item, f"{path}[{i}]"))
        return found

    async def _scan_for_hardcoded_secrets(self, configs: dict[str, dict[str, Any]]) -> None:
        """Find strings that look like keys/passwords but aren't using !secret.
        
        Uses recursive value inspection instead of str(config) to avoid false
        positives on key names, entity_ids, URLs and Jinja2 templates.
        """
        t = self._translator.t

        for idx, (entity_id, config) in enumerate(configs.items()):
            secret_paths = self._find_secrets_in_dict(config)
            if secret_paths:
                self.issues.append({
                    "entity_id": entity_id,
                    "alias": config.get("alias", entity_id),
                    "type": "hardcoded_secret",
                    "severity": "high",
                    "message": t("hardcoded_secret"),
                    "location": ", ".join(secret_paths[:3]),  # Show up to 3 paths
                    "recommendation": t("use_secret_yaml"),
                    "fix_available": False,
                })

            if idx % 10 == 0:
                await asyncio.sleep(0)

    async def _scan_for_data_exposure(self, configs: dict[str, dict[str, Any]]) -> None:
        """Check if sensitive info is being sent to external notification services."""
        t = self._translator.t
        
        for idx_config, (entity_id, config) in enumerate(configs.items()):
            actions = config.get("actions") or config.get("action", [])
            if not isinstance(actions, list):
                actions = [actions] if actions else []
                
            for idx, action in enumerate(actions):
                service = action.get("service") or action.get("action", "")
                
                # Check for notification services
                if "notify" in service or "persistent_notification" in service:
                    data = action.get("data", {})
                    message = str(data.get("message", ""))
                    
                    if SENSITIVE_DATA_REGEX.search(message):
                        self.issues.append({
                            "entity_id": entity_id,
                            "alias": config.get("alias", entity_id),
                            "type": "sensitive_data_exposure",
                            "severity": "high",
                            "message": t("sensitive_data_exposure", idx=idx),
                            "location": f"action[{idx}]",
                            "recommendation": t("avoid_secrets_notifications"),
                            "fix_available": False,
                        })
            
            if idx_config % 10 == 0: await asyncio.sleep(0)

    def get_issue_summary(self) -> dict[str, Any]:
        """Get summary of security issues."""
        return {
            "total": len(self.issues),
            "high_severity": len([i for i in self.issues if i["severity"] == "high"]),
            "types": list(set(i["type"] for i in self.issues))
        }
