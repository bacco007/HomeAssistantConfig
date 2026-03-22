"""Voucher models for UniFi Network API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class Voucher(BaseModel):
    """UniFi Hotspot Voucher model."""

    id: str = Field(..., description="Unique voucher identifier")
    created_at: datetime | None = Field(None, alias="createdAt")
    name: str | None = Field(None, description="Voucher note/label")
    code: str = Field(..., description="Secret activation code for hotspot portal")
    authorized_guest_limit: int | None = Field(
        None, alias="authorizedGuestLimit", description="Maximum guests allowed"
    )
    authorized_guest_count: int = Field(
        0, alias="authorizedGuestCount", description="Current guest usage count"
    )
    activated_at: datetime | None = Field(
        None, alias="activatedAt", description="First guest authorization timestamp"
    )
    expires_at: datetime | None = Field(
        None, alias="expiresAt", description="Voucher expiration time"
    )
    expired: bool = Field(False, description="Whether voucher is expired")
    time_limit_minutes: int | None = Field(
        None, alias="timeLimitMinutes", description="Access duration in minutes"
    )
    data_usage_limit_mbytes: int | None = Field(
        None, alias="dataUsageLimitMBytes", description="Download limit in megabytes"
    )
    rx_rate_limit_kbps: int | None = Field(
        None, alias="rxRateLimitKbps", description="Download speed limit"
    )
    tx_rate_limit_kbps: int | None = Field(
        None, alias="txRateLimitKbps", description="Upload speed limit"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def is_active(self) -> bool:
        """Check if voucher is active (not expired and has uses remaining)."""
        if self.expired:
            return False
        if self.authorized_guest_limit is not None:
            return self.authorized_guest_count < self.authorized_guest_limit
        return True


class VoucherCreateRequest(BaseModel):
    """Request model for creating vouchers."""

    name: str | None = Field(None, description="Voucher note/label")
    count: int = Field(1, ge=1, le=10000, description="Number of vouchers to create")
    authorized_guest_limit: int | None = Field(
        None,
        alias="authorizedGuestLimit",
        ge=1,
        description="Maximum guests per voucher",
    )
    time_limit_minutes: int | None = Field(
        None, alias="timeLimitMinutes", ge=1, description="Access duration in minutes"
    )
    data_usage_limit_mbytes: int | None = Field(
        None,
        alias="dataUsageLimitMBytes",
        ge=1,
        description="Download limit in megabytes",
    )
    rx_rate_limit_kbps: int | None = Field(
        None, alias="rxRateLimitKbps", ge=1, description="Download speed limit"
    )
    tx_rate_limit_kbps: int | None = Field(
        None, alias="txRateLimitKbps", ge=1, description="Upload speed limit"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}
