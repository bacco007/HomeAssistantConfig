"""Timer trigger.

External imports: None
"""

from datetime import datetime, timedelta
from enum import Enum
import inspect

from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import Event, State, callback
from homeassistant.helpers import start
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import Callable, dt as dt_util

# ------------------------------------------------------
# ------------------------------------------------------


class TimerTriggerErrorEnum(Enum):
    """Error to indicate unknown timer helper."""

    NONE = 0
    MISSING_TIMER_ENTITY = 1
    UNKNOWN_ERROR = 2

    # ------------------------------------------------------

    def __bool__(self):
        """Return if error."""
        return self != TimerTriggerErrorEnum.NONE


# ------------------------------------------------------
# ------------------------------------------------------
class TimerTrigger:
    """Timer trigger class.

    External imports: None

    """

    restarting_timer: bool = False

    def __init__(
        self,
        entity: Entity,
        timer_entity: str = "",
        duration: timedelta | None = None,
        callback_trigger: Callable[[TimerTriggerErrorEnum], None] = None,
        auto_restart: bool = True,
    ) -> None:
        """Init."""

        if (timer_entity == "" and duration is None) or (
            timer_entity == ""
            and duration is not None
            and duration.total_seconds() <= 0
        ):
            raise ValueError("timer_entity or duration must be provided")

        if callback_trigger is None:
            raise ValueError("callback_trigger must be provided")

        self.entity: Entity = entity
        self.timer_entity: str = timer_entity
        self.duration: timedelta | None = duration
        self.callback_trigger: Callable[[TimerTriggerErrorEnum], None] | None = (
            callback_trigger
        )
        self.auto_restart: bool = auto_restart

        self.error: TimerTriggerErrorEnum = TimerTriggerErrorEnum.NONE
        self.timer_state: State
        self.unsub_async_track_point_in_utc_time: Callable[[], None] | None = None

        self.entity.async_on_remove(
            start.async_at_started(self.entity.hass, self.async_hass_started)
        )

    # ------------------------------------------------------------------
    async def async_validate_timer(self) -> bool:
        """Validate timer."""

        state: State = self.entity.hass.states.get(self.timer_entity)

        if state is None:
            self.error = TimerTriggerErrorEnum.MISSING_TIMER_ENTITY

            if inspect.iscoroutinefunction(self.callback_trigger):
                await self.callback_trigger(self.error)
            else:
                self.callback_trigger(self.error)

            return False

        return True

    # ------------------------------------------------------------------
    async def async_restart_timer(self) -> bool:
        """Restart timer."""

        if self.error:
            return False

        state: State = self.entity.hass.states.get(self.timer_entity)

        if (
            state.state == "idle"
            and not TimerTrigger.restarting_timer
            and self.auto_restart
        ):
            TimerTrigger.restarting_timer = True

            await self.entity.hass.services.async_call(
                "timer",
                "start",
                service_data={ATTR_ENTITY_ID: self.timer_entity},
                blocking=True,
            )
            TimerTrigger.restarting_timer = False
        return True

    # ------------------------------------------------------------------
    async def async_point_in_time_listener(self, time_date: datetime) -> None:
        """Point in time listener."""

        if self.error:
            return

        if self.unsub_async_track_point_in_utc_time:
            self.unsub_async_track_point_in_utc_time()
            self.unsub_async_track_point_in_utc_time = None

        if inspect.iscoroutinefunction(self.callback_trigger):
            await self.callback_trigger(self.error)
        else:
            self.callback_trigger(self.error)

        self.point_in_time_listener_start()

    # ------------------------------------------------------------------
    def point_in_time_listener_start(self) -> None:
        """Point in time listener start."""

        if self.error:
            return
        self.unsub_async_track_point_in_utc_time = async_track_point_in_utc_time(
            self.entity.hass,
            self.async_point_in_time_listener,
            dt_util.utcnow() + self.duration,
        )

    # ------------------------------------------------------------------
    @callback
    async def async_handle_timer_finished(self, event: Event) -> None:
        """Handle timer finished."""

        if inspect.iscoroutinefunction(self.callback_trigger):
            await self.callback_trigger(self.error)
        else:
            self.callback_trigger(self.error)

        if not self.error and event.data[ATTR_ENTITY_ID] == self.timer_entity:
            if self.auto_restart:
                if await self.async_validate_timer():
                    await self.async_restart_timer()

    # ------------------------------------------------------
    async def async_hass_started(self, _event: Event) -> None:
        """Hass started."""

        if self.timer_entity != "":
            if await self.async_validate_timer():
                self.entity.async_on_remove(
                    self.entity.hass.bus.async_listen(
                        "timer.finished", self.async_handle_timer_finished
                    )
                )

                if self.auto_restart:
                    await self.async_restart_timer()

        else:
            self.entity.async_on_remove(self.async_remove_from_hass)

            self.unsub_async_track_point_in_utc_time = async_track_point_in_utc_time(
                self.entity.hass,
                self.async_point_in_time_listener,
                dt_util.utcnow() + self.duration,
            )

    # ------------------------------------------------------
    @callback
    def async_remove_from_hass(self) -> None:
        """Handle removal from Hass."""
        if self.unsub_async_track_point_in_utc_time:
            self.unsub_async_track_point_in_utc_time()
            self.unsub_async_track_point_in_utc_time = None
