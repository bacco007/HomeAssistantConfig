"""Handle retries decorator for functions and async functions.

This decorator allows you to specify the number of retries and the delay between retries.
It can be used with both synchronous and asynchronous functions.

External imports: None
"""

# ruff: noqa: C901

from asyncio import sleep as asyncio_sleep
from collections.abc import Callable
from functools import partial, wraps
from inspect import iscoroutinefunction
from time import sleep
from types import FunctionType


# ------------------------------------------------------
# ------------------------------------------------------
class RetryStopException(Exception):
    """Exception to stop retrying.

    Args:
        Exception (_type_): _description_

    """


# ------------------------------------------------------
# ------------------------------------------------------
class HandleRetriesException(Exception):
    """handle retries Exception.

    Args:
        Exception (_type_): _description_

    """


# ------------------------------------------------------
# ------------------------------------------------------
class HandleRetries:
    """Decorator to handle retries.

    It will retry the method/function if it raises an exception up to a specified number of times, with a specified delay.
    It can be used with both synchronous and asynchronous method/functions.
    It will raise the last exception if the number of retries is reached and raise_last_exception is True.
    """

    def __init__(
        self,
        retries: int = 1,
        retry_delay: float = 0.0,
        raise_last_exception: bool = True,
        raise_original_exception: bool = True,
        retry_on_exceptions: list | None = None,
        stop_on_exceptions: list | None = None,
    ):
        """Init.

        Args:
            retries (int, optional): _description_. Defaults to 0.
            retry_delay (float, optional): _description_. Defaults to 0.0.
            raise_last_exception (bool, optional): _description_. Defaults to True.
            raise_original_exception (bool, optional): _description_. Defaults to True.
            retry_on_exceptions (list | Exception | None, optional): _description_. Defaults to None.
            stop_on_exceptions (list | Exception | None, optional): _description_. Defaults to None.

        """
        self.retries: int = retries if retries > 0 else 1
        self.retry_delay: float = retry_delay if retry_delay > 0 else 0.0
        self.raise_last_exception: bool = raise_last_exception
        self.raise_original_exception: bool = raise_original_exception
        self.retry_on_exceptions: list | None = retry_on_exceptions
        self.stop_on_exceptions: list | None = stop_on_exceptions

        self.func_self = None

    # ------------------------------------------------------
    def __call__(self, func):
        """__call__.

        Args:
            func (_type_): _description_

        Raises:
            e: _description_
            e: _description_

        Returns:
            _type_: _description_

        """

        # -------------------------
        def decorator_wrap(func):
            # -------------------------
            def check_retry_on_exceptions(exp: Exception) -> bool:
                """Check if the exception is in the retry_on_exceptions list."""
                if self.retry_on_exceptions is None:
                    return True

                if exp.__class__ in self.retry_on_exceptions:
                    return True

                return False

            # -------------------------
            def check_stop_on_exceptions(exp: Exception) -> bool:
                """Check if the exception is in the stop_on_exceptions list."""
                if self.stop_on_exceptions is None:
                    return False

                if exp.__class__ in self.stop_on_exceptions:
                    return True

                return False

            # -------------------------
            def check_exceptions(exp: Exception, attempt: int) -> None:
                """Check exceptions."""

                if exp.__class__ == RetryStopException:
                    raise exp
                if (
                    not check_retry_on_exceptions(exp)
                    or check_stop_on_exceptions(exp)
                    or attempt == self.retries - 1
                ):
                    if self.raise_last_exception:
                        if self.raise_original_exception:
                            raise exp
                        raise HandleRetriesException(
                            f"Retry {attempt} failed for {func.__name__}"
                        ) from exp

            # -------------------------
            def set_parms_dyn(parm_dict: dict) -> None:
                """Set parameters dynamic."""

                if "retries" in parm_dict:
                    self.retries = parm_dict["retries"]
                if "retry_delay" in parm_dict:
                    self.retry_delay = parm_dict["retry_delay"]
                if "raise_last_exception" in parm_dict:
                    self.raise_last_exception = parm_dict["raise_last_exception"]
                if "raise_original_exception" in parm_dict:
                    self.raise_original_exception = parm_dict[
                        "raise_original_exception"
                    ]
                if "retry_on_exceptions" in parm_dict:
                    self.retry_on_exceptions = parm_dict["retry_on_exceptions"]
                if "stop_on_exceptions" in parm_dict:
                    self.stop_on_exceptions = parm_dict["stop_on_exceptions"]

            # -------------------------
            def check_for_dyn_parms(func) -> None:
                """Check dynamic parameters."""

                if func is None:
                    return

                if hasattr(func, "set_parms_dyn"):
                    tmp_func = func.set_parms_dyn
                    # tmp_func = getattr(func, "set_parms_dyn")
                    tmp_return = tmp_func()

                    if (
                        tmp_return is not None
                        and isinstance(tmp_return, dict)
                        and len(tmp_return) > 0
                    ):
                        set_parms_dyn(tmp_return)

            # -------------------------
            async def async_check_for_dyn_parms(func) -> None:
                """Check dynamic parameters."""

                if func is None:
                    return

                if hasattr(func, "async_set_parms_dyn"):
                    # tmp_func = getattr(func, "async_set_parms_dyn")
                    tmp_func = func.async_set_parms_dyn

                    if iscoroutinefunction(tmp_func):
                        tmp_return = await tmp_func()

                        if (
                            tmp_return is not None
                            and isinstance(tmp_return, dict)
                            and len(tmp_return) > 0
                        ):
                            set_parms_dyn(tmp_return)
                            return

                check_for_dyn_parms(func)

            # -------------------------
            @wraps(func)
            def wrapper(*args, **kwargs):
                check_for_dyn_parms(self.func_self)

                for attempt in range(self.retries):
                    try:
                        if self.func_self is None:
                            return func(*args, **kwargs)
                        return func(self.func_self, *args, **kwargs)
                    except Exception as err:  # noqa: BLE001
                        check_exceptions(err, attempt)

                    sleep(self.retry_delay)
                return None

            # -------------------------
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                await async_check_for_dyn_parms(self.func_self)

                for attempt in range(self.retries):
                    try:
                        if self.func_self is None:
                            return await func(*args, **kwargs)
                        return await func(self.func_self, *args, **kwargs)

                    except Exception as err:  # noqa: BLE001
                        check_exceptions(err, attempt)
                    await asyncio_sleep(self.retry_delay)
                return None

            # Check if the function is a coroutine function
            if iscoroutinefunction(func):
                return async_wrapper

            return wrapper

        return decorator_wrap(func)

    # ------------------------------------------------------
    def execute(
        self,
        func_self=None,
        func: Callable | None = None,
        *args,
        **kwargs,
    ):
        """Execute.

        How to call: HandleRetries(retries=3, retry_delay=1).execute(func_self ,(test_func),"Hello world")
        """
        self.func_self = func_self
        return self.__call__(func)(*args, **kwargs)

    # ------------------------------------------------------
    async def async_execute(
        self,
        func_self=None,
        func: Callable | None = None,
        *args,
        **kwargs,
    ):
        """Async execute.

        How to call: await HandleRetries(retries=3, retry_delay=1).async_execute(func_self, (async_test_func),"Hello world")
        """
        self.func_self = func_self
        return await self.__call__(func)(*args, **kwargs)


# ------------------------------------------------------
def handle_retries(
    func=None,
    *,
    retries: int = 5,
    retry_delay: float = 5.0,
    raise_last_exception: bool = True,
    raise_original_exception: bool = True,
    retry_on_exceptions: list | None = None,
    stop_on_exceptions: list | None = None,
):
    """Decorator to handle retries.

    It will retry the method/function if it raises an exception up to a specified number of times, with a specified delay.
    It can be used with both synchronous and asynchronous method/functions.
    It will raise the last exception if the number of retries is reached and raise_last_exception is True.
    """  # noqa: D401

    if func is None:
        return partial(
            handle_retries,
            retries=retries,
            retry_delay=retry_delay,
            raise_last_exception=raise_last_exception,
            raise_original_exception=raise_original_exception,
            retry_on_exceptions=retry_on_exceptions,
            stop_on_exceptions=stop_on_exceptions,
        )

    # -------------------------
    def decorator_wrap(func):
        # -------------------------
        @wraps(func)
        def wrapper_method(func_self, *args, **kwargs):
            return HandleRetries(
                retries=retries,
                retry_delay=retry_delay,
                raise_last_exception=raise_last_exception,
                raise_original_exception=raise_original_exception,
                retry_on_exceptions=retry_on_exceptions,
                stop_on_exceptions=stop_on_exceptions,
            ).execute(func_self, func, *args, **kwargs)

        # -------------------------
        @wraps(func)
        async def async_wrapper_method(func_self, *args, **kwargs):
            return await HandleRetries(
                retries=retries,
                retry_delay=retry_delay,
                raise_last_exception=raise_last_exception,
                raise_original_exception=raise_original_exception,
                retry_on_exceptions=retry_on_exceptions,
                stop_on_exceptions=stop_on_exceptions,
            ).async_execute(func_self, func, *args, **kwargs)

        # -------------------------
        @wraps(func)
        def wrapper_funktion(*args, **kwargs):
            return HandleRetries(
                retries=retries,
                retry_delay=retry_delay,
                raise_last_exception=raise_last_exception,
                raise_original_exception=raise_original_exception,
                retry_on_exceptions=retry_on_exceptions,
                stop_on_exceptions=stop_on_exceptions,
            ).execute(None, func, *args, **kwargs)

        # -------------------------
        @wraps(func)
        async def async_wrapper_function(*args, **kwargs):
            return await HandleRetries(
                retries=retries,
                retry_delay=retry_delay,
                raise_last_exception=raise_last_exception,
                raise_original_exception=raise_original_exception,
                retry_on_exceptions=retry_on_exceptions,
                stop_on_exceptions=stop_on_exceptions,
            ).async_execute(None, func, *args, **kwargs)

        if "<locals>" in func.__qualname__ or isinstance(func, FunctionType):
            if iscoroutinefunction(func):
                return async_wrapper_function
            return wrapper_funktion

        if iscoroutinefunction(func):
            return async_wrapper_method
        return wrapper_method

    return decorator_wrap(func)
