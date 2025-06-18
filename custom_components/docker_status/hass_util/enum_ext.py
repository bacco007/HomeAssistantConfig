"""Enum extended."""

from enum import Enum
from functools import partial, total_ordering
from typing import overload


# ------------------------------------------------------
# ------------------------------------------------------
@total_ordering
class EnumExt(Enum):
    """Enum extended."""

    # ------------------------------------------------------
    def __lt__(self, other):
        """Lower than."""
        try:
            if type(self.value) is int and type(other.value) is int:
                return self.value < other.value

            members = list(self.__class__)
            self_index = members.index(self)
            other_index = members.index(other)

            return self_index < other_index  # noqa: TRY300

        except AttributeError:
            return self.value < other

    # ------------------------------------------------------
    def __eq__(self, other) -> bool:
        """Equal."""
        try:
            return self.value == other.value

        except AttributeError:
            return self.value == other

    # ------------------------------------------------------
    def __str__(self):
        """Str."""
        return str(self.value)

    # ------------------------------------------------------
    @overload
    @classmethod
    def range(cls) -> list[Enum]: ...

    # ------------------------------------------------------
    @overload
    @classmethod
    def range(cls, *, start: Enum) -> list[Enum]: ...

    # ------------------------------------------------------
    @overload
    @classmethod
    def range(cls, stop: Enum, incl_stop: bool = False) -> list[Enum]: ...

    # ------------------------------------------------------
    @overload
    @classmethod
    def range(cls, start: Enum, stop: Enum, incl_stop: bool = False) -> list[Enum]: ...

    # ------------------------------------------------------
    @classmethod
    def range(cls, *args, **kwargs) -> list[Enum]:
        """range().

        or

        range(start=start Enum).

        or

        range(stop Enum, incl_stop: bool = False).

        or

        range(start Enum, stop Enum, incl_stop: bool = False).

        Returns:
            list[Enum]

        """  # noqa: D402

        def range_func(
            start_stop=None, stop=None, incl_stop: bool = False, **kwargs
        ) -> list[Enum]:
            if start_stop is None and stop is None and len(kwargs) == 0:
                return list(cls)

            members = list(cls)

            if (
                len(kwargs) == 1
                and start_stop is None
                and stop is None
                and "start" in kwargs
            ):
                index_start = members.index(kwargs["start"])
                index_stop = len(members)
            else:
                if start_stop is None and len(kwargs) == 1 and "start" in kwargs:
                    start_stop = kwargs["start"]
                if start_stop is None:
                    start_stop = members[0]
                if stop is None:
                    stop = start_stop
                    start_stop = members[0]

                index_start = members.index(start_stop)
                index_stop = (
                    members.index(stop) if not incl_stop else members.index(stop) + 1
                )

            if index_start >= index_stop:
                raise IndexError("start_stop must be less than stop")

            return list(members[index_start:index_stop])

        return (partial(range_func, *args, **kwargs))()

    # ------------------------------------------------------
    def succ(self, cycle: bool = False):
        """Succ."""
        members = list(self.__class__)
        index = members.index(self) + 1

        if index >= len(members):
            if cycle:
                index = 0
            else:
                raise StopIteration("end of enumeration reached")

        return members[index]

    # ------------------------------------------------------
    @property
    def next(self):
        """Next."""
        return self.succ()

    # ------------------------------------------------------
    def pred(self, cycle: bool = False):
        """Pred."""
        members = list(self.__class__)
        index = members.index(self) - 1
        if index < 0:
            if cycle:
                index = len(members) - 1
            else:
                raise StopIteration("beginning of enumeration reached")

        return members[index]

    # ------------------------------------------------------
    @property
    def prev(self):
        """Prev."""
        return self.pred()
