from abc import abstractmethod
from datetime import datetime
from datetime import timedelta

import logging

from homeassistant.util import Throttle

_LOGGER = logging.getLogger(__name__)

ATTR_SERVICE_COUNTER = "service_counter"


class DataProviderBase:

    def __init__(self, name, interval, exceptions=None, inc_counter=1):
        self.__name = name
        self.__update_timestamp = datetime.today()
        self.__service_counter = 0
        self.__inc_counter = inc_counter

        self.__interval = interval
        self.__exceptions = exceptions

        self.__throttle_user_update = Throttle(interval)(self._user_update)
        self.__throttle_update = Throttle(timedelta(seconds=300))(self.__update_controller)

    @staticmethod
    def __is_between(time, time_range):
        if time_range[1] < time_range[0]:
            return time >= time_range[0] or time <= time_range[1]
        return time_range[0] <= time <= time_range[1]

    def __reset_service_counter(self):
        self.__update_timestamp = datetime.today()
        self.__service_counter = 0

    def __inc_service_counter(self, inc_counter=None):
        if self.__update_timestamp.date() == datetime.today().date():
            incr = (self.__inc_counter if inc_counter is None else inc_counter)
            self.__service_counter = self.__service_counter + incr
            _LOGGER.debug("Service '%s' usage: %s with incr: %s (def. %s)",
                          self.__name, self.__service_counter, incr, self.__inc_counter)
        else:
            self.__reset_service_counter()
            _LOGGER.debug("Service '%s' usage resetted: %s", self.__name, self.__service_counter)

    @property
    def service_counter(self):
        return self.__service_counter

    def _set_service_counter(self, val):
        self.__service_counter = val

    @property
    def service_counter_update_timestamp(self):
        return self.__update_timestamp

    def _set_service_counter_update_timestamp(self, val):
        self.__update_timestamp = val

    def retrieve_update(self):
        self.__throttle_update()

    def __update_controller(self):
        """
        """
        now = datetime.now()
        hourminute = "" + str(now.hour) + ":" + str(now.minute)

        update = True

        # _LOGGER.debug("Update '%s' now: %s? %s", self.__name, hourminute, update)
        if self.__exceptions is not None:
            for key, value in self.__exceptions[0].items():
                # _LOGGER.debug("'%s' - hour %s is in %s: %s",
                #               self.__name, hourminute, value, self.__is_between(hourminute, value))
                if self.__is_between(hourminute, value):
                    update = False

        if update:
            updt_state = self.__throttle_user_update()
            # _LOGGER.debug("Update '%s' now, auto increment: %s", self.__name, updt_state)
            if updt_state:
                self.__inc_service_counter()

    @abstractmethod
    def _user_update(self):
        """

        :rtype: bool
        """
        ...
