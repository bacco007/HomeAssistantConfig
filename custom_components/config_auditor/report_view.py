"""H.A.C.A — authenticated HTTP endpoint for the generated reports.

Reports used to be served by a plain static path (`/haca_reports`). Home
Assistant serves static paths **without authentication**, exactly like
`/local/`, and report filenames are predictable (`report_<timestamp>.md`), so
anyone who could reach the HA URL could enumerate and read a full audit of the
installation — entity inventory, security findings and all.

The HACA panel is admin-only, so its reports are too. They now go through this
view, which requires an authenticated admin. A short-lived signed URL (see the
`haca/get_report_url` websocket command) also authenticates, which is what lets
the panel drop a PDF into an `<iframe>` or hand it to a download link.
"""
from __future__ import annotations

import logging
from pathlib import Path

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

try:
    # HA turned this into an AppKey at some point; importing it keeps the
    # lookup working either way (a bare "hass_user" string would miss).
    from homeassistant.components.http.const import KEY_HASS_USER
except ImportError:      # pragma: no cover — older layouts
    KEY_HASS_USER = "hass_user"

from .const import DOMAIN, REPORTS_DIR
from .report_generator import resolve_report_path

_LOGGER = logging.getLogger(__name__)

REPORT_URL_PREFIX = f"/api/{DOMAIN}/report"

CONTENT_TYPES = {
    ".pdf":  "application/pdf",
    ".md":   "text/markdown; charset=utf-8",
    ".json": "application/json",
    ".html": "text/html; charset=utf-8",
}


class HacaReportView(HomeAssistantView):
    """Serve one generated report to an authenticated admin."""

    url = REPORT_URL_PREFIX + "/{filename}"
    name = f"api:{DOMAIN}:report"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        """Keep a reference to hass — views are not passed one on call."""
        self.hass = hass

    async def get(self, request: web.Request, filename: str) -> web.StreamResponse:
        """Return the report file, or 404 for anything that is not one."""
        user = request.get(KEY_HASS_USER)
        if user is None or not user.is_admin:
            # The panel that produces these reports is admin-only.
            raise web.HTTPForbidden()

        reports_dir = Path(self.hass.config.path(REPORTS_DIR))
        path = await self.hass.async_add_executor_job(
            resolve_report_path, reports_dir, filename
        )
        if path is None:
            raise web.HTTPNotFound()

        return web.FileResponse(
            path,
            headers={
                "Content-Type": CONTENT_TYPES.get(
                    path.suffix.lower(), "application/octet-stream"
                ),
                # `inline` so the PDF renders in the panel's iframe; the
                # download button sets the filename with its own attribute.
                "Content-Disposition": f'inline; filename="{path.name}"',
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
            },
        )
