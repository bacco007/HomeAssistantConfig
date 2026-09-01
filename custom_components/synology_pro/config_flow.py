"""Config flow for Synology Pro integration."""
from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_PASSWORD, CONF_PORT, CONF_USERNAME
from homeassistant.data_entry_flow import FlowResult

from synology_api.exceptions import LoginError

from .const import (
    CONF_DEVICE_ID,
    CONF_DSM_VERSION,
    CONF_OTP_CODE,
    CONF_SCAN_INTERVAL,
    CONF_SSL,
    CONF_VERIFY_SSL,
    DEFAULT_DSM_VERSION,
    DEFAULT_PORT,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_SSL,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


class SynologyProConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Synology Pro."""

    VERSION = 1

    def __init__(self) -> None:
        """Store credentials collected in the user step, pending a 2FA OTP."""
        self._pending_data: dict | None = None

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        """Handle the initial step (user provides NAS credentials)."""
        errors = {}

        if user_input is not None:
            device_id = None
            try:
                device_id = await self._test_connection(user_input)
            except LoginError as exc:
                if exc.error_code == 404:
                    # DSM: "Failed to authenticate 2-factor authentication code"
                    errors["base"] = "invalid_otp"
                elif exc.error_code in (403, 406):
                    # 2FA enforced. Route to the dedicated OTP step only when the
                    # user did not supply a code here; if they did and it still
                    # failed, surface the 2FA requirement directly.
                    if not user_input.get(CONF_OTP_CODE):
                        self._pending_data = user_input
                        return await self.async_step_otp()
                    errors["base"] = "two_factor_required"
                else:
                    _LOGGER.warning("Login failed (code %s): %s", exc.error_code, exc)
                    errors["base"] = "invalid_auth"
            except ConnectionError:
                errors["base"] = "cannot_connect"
            except PermissionError:
                errors["base"] = "invalid_auth"
            except Exception:
                _LOGGER.exception("Connection test failed")
                errors["base"] = "unknown"

            if not errors:
                if device_id:
                    user_input[CONF_DEVICE_ID] = device_id
                # The OTP is single-use; never persist it on the entry.
                user_input.pop(CONF_OTP_CODE, None)
                return self.async_create_entry(
                    title=f"Synology NAS ({user_input[CONF_HOST]})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_HOST): str,
                    vol.Required(CONF_PORT, default=DEFAULT_PORT): int,
                    vol.Required(CONF_USERNAME): str,
                    vol.Required(CONF_PASSWORD): str,
                    vol.Optional(CONF_OTP_CODE): str,
                    vol.Optional(CONF_SSL, default=DEFAULT_SSL): bool,
                    vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): bool,
                    vol.Optional(CONF_DSM_VERSION, default=DEFAULT_DSM_VERSION): vol.In(
                        {6: "DSM 6", 7: "DSM 7"}
                    ),
                    vol.Optional(CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL): int,
                }
            ),
            errors=errors,
        )

    async def async_step_otp(self, user_input: dict | None = None) -> FlowResult:
        """Ask for the one-time password and capture the device token.

        Reached only after the user step detected that the account enforces 2FA
        (DSM auth codes 403/406). On success the returned device token is stored
        on the entry so subsequent polls re-authenticate without a new OTP.
        """
        errors = {}

        if user_input is not None:
            data = dict(self._pending_data or {})
            data[CONF_OTP_CODE] = user_input[CONF_OTP_CODE]

            device_id = None
            try:
                device_id = await self._test_connection(data)
            except LoginError as exc:
                if exc.error_code == 404:
                    # DSM: "Failed to authenticate 2-factor authentication code"
                    errors["base"] = "invalid_otp"
                elif exc.error_code in (403, 406):
                    errors["base"] = "two_factor_required"
                else:
                    _LOGGER.warning("Login failed (code %s): %s", exc.error_code, exc)
                    errors["base"] = "invalid_auth"
            except ConnectionError:
                errors["base"] = "cannot_connect"
            except PermissionError:
                errors["base"] = "invalid_auth"
            except Exception:
                _LOGGER.exception("Connection test failed")
                errors["base"] = "unknown"

            if not errors:
                if device_id:
                    data[CONF_DEVICE_ID] = device_id
                # The OTP is single-use; never persist it on the entry.
                data.pop(CONF_OTP_CODE, None)
                return self.async_create_entry(
                    title=f"Synology NAS ({data[CONF_HOST]})",
                    data=data,
                )

        return self.async_show_form(
            step_id="otp",
            data_schema=vol.Schema({vol.Required(CONF_OTP_CODE): str}),
            errors=errors,
        )

    async def async_step_reconfigure(self, user_input: dict | None = None) -> FlowResult:
        """Handle reconfiguration of an existing entry.

        Pre-fills every field with the current values (except the password,
        which is never echoed back). Leaving the password blank keeps the
        existing one.
        """
        entry = self._get_reconfigure_entry()
        errors = {}

        if user_input is not None:
            # Never echo the stored password. A blank field keeps the old one.
            if not user_input.get(CONF_PASSWORD):
                user_input[CONF_PASSWORD] = entry.data.get(CONF_PASSWORD, "")
            errors = await self._validate_credentials(user_input)
            if not errors:
                return self.async_update_reload_and_abort(
                    entry,
                    data_updates=user_input,
                )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_HOST,
                        description={"suggested_value": entry.data.get(CONF_HOST)},
                    ): str,
                    vol.Required(
                        CONF_PORT,
                        description={
                            "suggested_value": entry.data.get(CONF_PORT, DEFAULT_PORT)
                        },
                    ): int,
                    vol.Required(
                        CONF_USERNAME,
                        description={"suggested_value": entry.data.get(CONF_USERNAME)},
                    ): str,
                    vol.Optional(CONF_PASSWORD): str,
                    vol.Optional(
                        CONF_SSL,
                        description={
                            "suggested_value": entry.data.get(CONF_SSL, DEFAULT_SSL)
                        },
                    ): bool,
                    vol.Optional(
                        CONF_VERIFY_SSL,
                        description={
                            "suggested_value": entry.data.get(
                                CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL
                            )
                        },
                    ): bool,
                    vol.Optional(
                        CONF_DSM_VERSION,
                        description={
                            "suggested_value": entry.data.get(
                                CONF_DSM_VERSION, DEFAULT_DSM_VERSION
                            )
                        },
                    ): vol.In({6: "DSM 6", 7: "DSM 7"}),
                    vol.Optional(
                        CONF_SCAN_INTERVAL,
                        description={
                            "suggested_value": entry.data.get(
                                CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                            )
                        },
                    ): int,
                }
            ),
            errors=errors,
        )

    async def _validate_credentials(self, data: dict) -> dict[str, str]:
        """Test the connection and map failures to config-flow error keys."""
        errors: dict[str, str] = {}

        try:
            await self._test_connection(data)
        except ConnectionError:
            errors["base"] = "cannot_connect"
        except PermissionError:
            errors["base"] = "invalid_auth"
        except LoginError as exc:
            # 403 = 2FA code required, 406 = enforced 2FA on the account
            if exc.error_code in (403, 406):
                errors["base"] = "two_factor_required"
            else:
                _LOGGER.warning("Login failed (code %s): %s", exc.error_code, exc)
                errors["base"] = "invalid_auth"
        except Exception:
            _LOGGER.exception("Connection test failed")
            errors["base"] = "unknown"

        return errors

    async def _test_connection(self, data: dict) -> str | None:
        """Test the connection and return the captured device token, if any.

        Runs the blocking login+probe in the executor. Returns the DSM device
        token (2FA) when the account has 2FA enabled and the login supplied a
        valid OTP; otherwise None.
        """

        def _connect():
            from synology_api.filestation import FileStation

            fl = FileStation(
                data[CONF_HOST],
                data[CONF_PORT],
                data[CONF_USERNAME],
                data[CONF_PASSWORD],
                secure=data.get(CONF_SSL, True),
                cert_verify=data.get(CONF_VERIFY_SSL, False),
                dsm_version=data.get(CONF_DSM_VERSION, 7),
                otp_code=data.get(CONF_OTP_CODE),
            )
            if not fl._sid:
                raise ConnectionError("Authentication failed — no session ID")
            # `device_id` property exists on synology-api >= next release with the
            # 2FA device-token fix; getattr keeps this compatible with older ones.
            return getattr(fl.session, "device_id", None)

        return await self.hass.async_add_executor_job(_connect)
