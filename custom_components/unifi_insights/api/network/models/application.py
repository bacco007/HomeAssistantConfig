"""Application info models for UniFi Network API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ApplicationInfo(BaseModel):
    """
    UniFi Network application information.

    Returned by the GET /v1/info endpoint.
    """

    application_version: str = Field(alias="applicationVersion")

    model_config = {"populate_by_name": True, "extra": "allow"}
