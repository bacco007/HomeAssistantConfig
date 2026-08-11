"""The AST matching engine.

A *rule* says "this piece of Python stops working in Home Assistant release X".
A *matcher* is the machine-checkable half of a rule.  :func:`match_source` runs
every matcher over one parsed file and yields findings.

Eight matcher types cover every deprecation Breakage Radar currently ships:

``moduledef``          a module-level ``def``/``async def`` with one of ``names``
``classbase``          a ``class`` whose base list mentions one of ``bases``
``attr``               a property or ``_attr_`` assignment named in ``names``
``attr_access``        reading ``something.<name>`` for a name in ``names``
``call``               a call to one of ``names`` (bare or attribute access)
``call_kwarg``         a call to one of ``names`` passing any keyword in ``kwargs``
``call_missing_kwarg`` a call to one of ``names`` *not* passing keyword ``kwarg``
``call_hass_argument`` a call to one of ``names`` that passes ``hass`` (first
                       positional or keyword) -- for ``@deprecated_hass_argument``,
                       where the *argument* is deprecated, not the function

Every matcher may additionally be constrained with ``files`` (a list of exact
basenames, e.g. ``["device_tracker.py"]``) and ``attr`` matchers with
``in_class_base`` (the enclosing class must derive from one of these names).
Those constraints are what keep the false-positive rate at zero on lookalike
code -- see ``tests/test_scanner.py``.

Standard library only: this module is imported by the crawler and vendored
byte-for-byte at ``custom_components/breakage_radar/rules_engine.py``, where the
Home Assistant integration runs the exact same matchers over the user's own
installed code. ``tests/test_local_scan.py`` asserts the two copies never drift.
"""

from __future__ import annotations

import ast
import re
from dataclasses import dataclass, field
from pathlib import PurePosixPath
from typing import Any, Iterable, Iterator

MATCHER_TYPES = frozenset(
    {
        "moduledef",
        "classbase",
        "attr",
        "attr_access",
        "call",
        "call_kwarg",
        "call_missing_kwarg",
        "call_hass_argument",
    }
)

#: Bumped whenever matching semantics change. It is folded into the crawl's
#: rules hash, so an engine change forces a rescan instead of leaving stale
#: findings that the current engine would no longer produce.
ENGINE_VERSION = 3

VERSION_RE = re.compile(r"^\d{4}\.\d+(?:\.\d+)?$")


@dataclass(frozen=True)
class Rule:
    """One "X breaks in release Y" statement."""

    id: str
    kind: str
    symbol: str
    message: str
    breaks_in: str
    source: str
    origin: str = "core-ast"
    confidence: str = "medium"
    match: dict[str, Any] | None = None
    replacement: str | None = None

    @property
    def matchable(self) -> bool:
        return bool(self.match) and self.match.get("type") in MATCHER_TYPES

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "id": self.id,
            "kind": self.kind,
            "symbol": self.symbol,
            "message": self.message,
            "breaks_in": self.breaks_in,
            "source": self.source,
            "origin": self.origin,
            "confidence": self.confidence,
            "matchable": self.matchable,
        }
        if self.replacement:
            payload["replacement"] = self.replacement
        if self.match:
            payload["match"] = self.match
        return payload

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "Rule":
        return cls(
            id=payload["id"],
            kind=payload.get("kind", "call"),
            symbol=payload.get("symbol", ""),
            message=payload.get("message", ""),
            breaks_in=payload["breaks_in"],
            source=payload.get("source", ""),
            origin=payload.get("origin", "core-ast"),
            confidence=payload.get("confidence", "medium"),
            match=payload.get("match"),
            replacement=payload.get("replacement"),
        )


@dataclass(frozen=True)
class Finding:
    rule_id: str
    breaks_in: str
    file: str
    line: int
    confidence: str
    symbol: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "breaks_in": self.breaks_in,
            "file": self.file,
            "line": self.line,
            "confidence": self.confidence,
        }


@dataclass
class ScanStats:
    """Counters a caller can surface instead of silently swallowing problems."""

    files_scanned: int = 0
    syntax_errors: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------- #
# version helpers
# --------------------------------------------------------------------------- #


def parse_version(version: str) -> tuple[int, ...]:
    """``"2027.5.0"`` -> ``(2027, 5, 0)``. Unparseable input sorts last."""
    parts: list[int] = []
    for chunk in version.split("."):
        digits = re.match(r"\d+", chunk)
        parts.append(int(digits.group()) if digits else 0)
    if not parts:
        return (9999,)
    return tuple(parts)


def normalise_version(version: str) -> str:
    """Collapse ``2027.8.0`` to the release label ``2027.8``."""
    parts = version.split(".")
    if len(parts) >= 2:
        return f"{parts[0]}.{parts[1]}"
    return version


def is_future(breaks_in: str, current: str) -> bool:
    """True when ``breaks_in`` is a release strictly after ``current``."""
    return parse_version(normalise_version(breaks_in)) > parse_version(
        normalise_version(current)
    )


# --------------------------------------------------------------------------- #
# matching
# --------------------------------------------------------------------------- #


def _basename(path: str) -> str:
    return PurePosixPath(path).name


def _base_names(node: ast.ClassDef) -> set[str]:
    """Names in a class's base list, both ``Foo`` and ``mod.Foo`` forms."""
    names: set[str] = set()
    for base in node.bases:
        if isinstance(base, ast.Name):
            names.add(base.id)
        elif isinstance(base, ast.Attribute):
            names.add(base.attr)
        elif isinstance(base, ast.Subscript):  # Generic[...] style bases
            inner = base.value
            if isinstance(inner, ast.Name):
                names.add(inner.id)
            elif isinstance(inner, ast.Attribute):
                names.add(inner.attr)
    return names


def _called_name(node: ast.Call) -> str | None:
    func = node.func
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        return func.attr
    return None


def _dotted(node: ast.expr) -> str | None:
    """``a.b.c`` -> ``"a.b.c"``; anything dynamic -> ``None``."""
    parts: list[str] = []
    current: ast.expr = node
    while isinstance(current, ast.Attribute):
        parts.append(current.attr)
        current = current.value
    if not isinstance(current, ast.Name):
        return None
    parts.append(current.id)
    return ".".join(reversed(parts))


def build_import_map(tree: ast.Module) -> dict[str, str]:
    """Map every locally bound name to the dotted path it refers to.

    ``from homeassistant.helpers.entity import async_generate_entity_id``
        -> ``{"async_generate_entity_id": "homeassistant.helpers.entity.async_generate_entity_id"}``
    ``from homeassistant.helpers import entity_registry as er``
        -> ``{"er": "homeassistant.helpers.entity_registry"}``

    This is what lets a rule distinguish ``entity_registry.async_generate_entity_id``
    (deprecated in 2027.2) from ``entity.async_generate_entity_id`` (not
    deprecated) -- two different functions that share a name.
    """
    bindings: dict[str, str] = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.asname:
                    bindings[alias.asname] = alias.name
                else:
                    bindings.setdefault(alias.name.split(".")[0], alias.name.split(".")[0])
                bindings.setdefault(alias.name, alias.name)
        elif isinstance(node, ast.ImportFrom):
            # A relative import is recorded with its leading dots so it resolves
            # to something that can never equal a Home Assistant module -- that
            # is what makes ``from .my_registry import async_get_device`` a
            # non-match instead of an unresolved guess.
            module = ("." * node.level) + (node.module or "")
            for alias in node.names:
                bindings[alias.asname or alias.name] = (
                    f"{module}.{alias.name}" if module else alias.name
                )
    return bindings


def _resolve_call_module(
    node: ast.Call, symbol: str, imports: dict[str, str]
) -> str | None:
    """Fully-qualified path of the thing being called, or ``None`` if dynamic."""
    func = node.func
    if isinstance(func, ast.Name):
        return imports.get(func.id)
    if isinstance(func, ast.Attribute):
        dotted = _dotted(func.value)
        if dotted is None:
            return None
        head, _, tail = dotted.partition(".")
        base = imports.get(head)
        if base is None:
            return None
        prefix = f"{base}.{tail}" if tail else base
        return f"{prefix}.{symbol}"
    return None


def _module_allowed(
    matcher: dict[str, Any], node: ast.Call, symbol: str, imports: dict[str, str]
) -> bool:
    """Enforce a matcher's optional ``modules`` constraint."""
    modules = matcher.get("modules")
    if not modules:
        return True
    resolved = _resolve_call_module(node, symbol, imports)
    if resolved is None:
        if isinstance(node.func, ast.Name):
            # A bare ``foo(...)`` that is not imported from the deprecated
            # module is a local definition or a relative import: not our symbol.
            return False
        # e.g. ``registry.async_get_device(...)`` -- the receiver is a runtime
        # object, so the import graph cannot prove anything either way.
        return bool(matcher.get("allow_unresolved_attribute"))
    return any(
        resolved == f"{module}.{symbol}" or resolved == module for module in modules
    )


def _iter_classes(tree: ast.Module) -> Iterator[ast.ClassDef]:
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            yield node


def _file_allowed(matcher: dict[str, Any], path: str) -> bool:
    allowed = matcher.get("files")
    if not allowed:
        return True
    return _basename(path) in set(allowed)


def _decorated_as_property(node: ast.FunctionDef | ast.AsyncFunctionDef) -> bool:
    for decorator in node.decorator_list:
        target = decorator.func if isinstance(decorator, ast.Call) else decorator
        if isinstance(target, ast.Name) and target.id in (
            "property",
            "cached_property",
        ):
            return True
        if isinstance(target, ast.Attribute) and target.attr in (
            "property",
            "cached_property",
            "setter",
        ):
            return True
    return False


def _match_moduledef(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    for node in tree.body:  # direct children only -> never a method
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.name in names:
                yield node.lineno, node.name


def _match_classbase(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    wanted = set(matcher.get("bases", ()))
    for node in _iter_classes(tree):
        hit = _base_names(node) & wanted
        if hit:
            yield node.lineno, sorted(hit)[0]


def _match_attr(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    attr_names = {f"_attr_{name}" for name in names}
    required_bases = set(matcher.get("in_class_base", ()))

    for node in _iter_classes(tree):
        if required_bases and not (_base_names(node) & required_bases):
            continue
        for child in ast.walk(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if child.name in names and _decorated_as_property(child):
                    yield child.lineno, child.name
            elif isinstance(child, ast.Assign):
                for target in child.targets:
                    name = _assign_target_name(target)
                    if name and name in attr_names:
                        yield child.lineno, name
            elif isinstance(child, ast.AnnAssign):
                name = _assign_target_name(child.target)
                if name and name in attr_names:
                    yield child.lineno, name


def _assign_target_name(target: ast.expr) -> str | None:
    if isinstance(target, ast.Name):
        return target.id
    if isinstance(target, ast.Attribute):
        return target.attr
    return None


def _match_call(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            name = _called_name(node)
            if name in names and _module_allowed(matcher, node, name, imports):
                yield node.lineno, name


def _match_attr_access(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Attribute)
            and node.attr in names
            and isinstance(node.ctx, ast.Load)
        ):
            yield node.lineno, node.attr


def _matcher_kwargs(matcher: dict[str, Any]) -> set[str]:
    wanted = set(matcher.get("kwargs", ()))
    if matcher.get("kwarg"):
        wanted.add(matcher["kwarg"])
    return wanted


def _match_call_kwarg(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    wanted = _matcher_kwargs(matcher)
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and _called_name(node) in names:
            if not _module_allowed(matcher, node, _called_name(node), imports):
                continue
            hit = sorted({k.arg for k in node.keywords if k.arg in wanted})
            if hit:
                yield node.lineno, f"{_called_name(node)}({hit[0]}=...)"


def _match_call_missing_kwarg(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    kwarg = matcher.get("kwarg")
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and _called_name(node) in names:
            if not _module_allowed(matcher, node, _called_name(node), imports):
                continue
            # ``**kwargs`` (arg is None) could supply it -- do not guess.
            if any(keyword.arg is None for keyword in node.keywords):
                continue
            if not any(keyword.arg == kwarg for keyword in node.keywords):
                yield node.lineno, f"{_called_name(node)}(no {kwarg})"


def _looks_like_hass(node: ast.expr) -> bool:
    """``hass``, ``self.hass``, ``self._hass`` -- the usual spellings."""
    if isinstance(node, ast.Name):
        return node.id in ("hass", "_hass")
    if isinstance(node, ast.Attribute):
        return node.attr in ("hass", "_hass")
    return False


def _match_call_hass_argument(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    """Only fire when ``hass`` is actually passed.

    ``@deprecated_hass_argument`` marks the *first argument* as ignored, so
    ``async_extract_entity_ids(call)`` is healthy while
    ``async_extract_entity_ids(hass, call)`` is not. Flagging both was a real
    false positive measured on AlexxIT/YandexStation, which does both on
    consecutive lines.
    """
    names = set(matcher.get("names", ()))
    for node in ast.walk(tree):
        if not (isinstance(node, ast.Call) and _called_name(node) in names):
            continue
        if not _module_allowed(matcher, node, _called_name(node), imports):
            continue
        passes_hass = any(k.arg == "hass" for k in node.keywords) or (
            bool(node.args) and _looks_like_hass(node.args[0])
        )
        if passes_hass:
            yield node.lineno, f"{_called_name(node)}(hass, ...)"


_DISPATCH = {
    "moduledef": _match_moduledef,
    "classbase": _match_classbase,
    "attr": _match_attr,
    "attr_access": _match_attr_access,
    "call": _match_call,
    "call_kwarg": _match_call_kwarg,
    "call_missing_kwarg": _match_call_missing_kwarg,
    "call_hass_argument": _match_call_hass_argument,
}


def match_source(
    path: str, source: str | bytes, rules: Iterable[Rule], stats: ScanStats | None = None
) -> list[Finding]:
    """Parse ``source`` and return every finding for ``rules``.

    A :class:`SyntaxError` in third-party code is recorded and swallowed --
    never allowed to abort a crawl.  ``path`` is the repo-relative path used in
    the finding and in ``files`` matcher constraints.
    """
    if isinstance(source, bytes):
        try:
            source = source.decode("utf-8")
        except UnicodeDecodeError:
            try:
                source = source.decode("latin-1")
            except Exception:  # pragma: no cover - latin-1 never fails in practice
                if stats:
                    stats.syntax_errors.append(f"{path}: undecodable")
                return []

    try:
        tree = ast.parse(source, filename=path)
    except (SyntaxError, ValueError, RecursionError, MemoryError) as err:
        if stats:
            stats.syntax_errors.append(f"{path}: {type(err).__name__}: {err}")
        return []

    if stats:
        stats.files_scanned += 1

    imports = build_import_map(tree)
    seen: set[tuple[str, str, int]] = set()
    findings: list[Finding] = []

    for rule in rules:
        matcher = rule.match
        if not matcher:
            continue
        handler = _DISPATCH.get(matcher.get("type", ""))
        if handler is None or not _file_allowed(matcher, path):
            continue
        for line, symbol in handler(matcher, tree, imports):
            key = (rule.id, path, line)
            if key in seen:
                continue
            seen.add(key)
            findings.append(
                Finding(
                    rule_id=rule.id,
                    breaks_in=normalise_version(rule.breaks_in),
                    file=path,
                    line=line,
                    confidence=rule.confidence,
                    symbol=symbol,
                )
            )

    findings.sort(key=lambda f: (f.file, f.line, f.rule_id))
    return findings


def load_rules(payload: Iterable[dict[str, Any]]) -> list[Rule]:
    """Build :class:`Rule` objects from a ``rules.json`` ``rules`` array."""
    return [Rule.from_dict(item) for item in payload]


def matchable_rules(rules: Iterable[Rule], *, current_version: str) -> list[Rule]:
    """Rules that can actually be matched *and* break in a future release."""
    return [
        rule
        for rule in rules
        if rule.matchable and is_future(rule.breaks_in, current_version)
    ]
