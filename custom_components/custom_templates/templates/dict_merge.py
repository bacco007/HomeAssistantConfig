from homeassistant.core import HomeAssistant


class DictMerge:

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    def __call__(self, *args) -> dict:
        result = {k: v for d in args for k, v in d.items()}
        return result

    def __repr__(self) -> str:
        return f"<template CT_DictMerge>"
