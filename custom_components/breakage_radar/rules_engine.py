"""The AST matching engine.

A *rule* says "this piece of Python stops working in Home Assistant release X".
A *matcher* is the machine-checkable half of a rule.  :func:`match_source` runs
every matcher over one parsed file and yields findings.

Nine matcher types cover every deprecation Breakage Radar currently ships:

``moduledef``          a module-level ``def``/``async def`` with one of ``names``
``classbase``          a ``class`` whose base list mentions one of ``bases``
``attr``               a property or ``_attr_`` assignment named in ``names``
``attr_access``        reading ``something.<name>`` for a name in ``names``
``attr_access_typed``  ``attr_access`` restricted to receivers proved, by
                       single-file inference, to hold an object from the
                       helper module the matcher names
``call``               a call to one of ``names`` (bare or attribute access)
``call_kwarg``         a call to one of ``names`` passing any keyword in ``kwargs``
``call_missing_kwarg`` a call to one of ``names`` *not* passing keyword ``kwarg``
``call_hass_argument`` a call to one of ``names`` that passes ``hass`` (first
                       positional or keyword) -- for ``@deprecated_hass_argument``,
                       where the *argument* is deprecated, not the function

Every matcher may additionally be constrained with ``files`` (a list of exact
basenames, e.g. ``["device_tracker.py"]``), ``attr`` matchers with
``in_class_base`` (the enclosing class must derive from one of these names),
and ``call`` matchers with ``not_awaited`` (skip awaited calls, for symbols
Home Assistant defines with a plain ``def``). Those constraints are what keep
the false-positive rate at zero on lookalike code -- see
``tests/test_scanner.py``.

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
        "attr_access_typed",
        "call",
        "call_kwarg",
        "call_missing_kwarg",
        "call_hass_argument",
    }
)

#: Bumped whenever matching semantics change. It is folded into the crawl's
#: rules hash, so an engine change forces a rescan instead of leaving stale
#: findings that the current engine would no longer produce.
ENGINE_VERSION = 5

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


def _awaited_calls(tree: ast.Module) -> set[int]:
    """Calls that are directly awaited.

    ``async_`` in Home Assistant means callback-safe, not coroutine, so several
    deprecated helpers are plain ``def``. Awaiting one is proof it is somebody
    else's method that merely shares the name.
    """
    return {
        id(node.value)
        for node in ast.walk(tree)
        if isinstance(node, ast.Await) and isinstance(node.value, ast.Call)
    }


def _match_call(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    names = set(matcher.get("names", ()))
    awaited = _awaited_calls(tree) if matcher.get("not_awaited") else frozenset()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and id(node) not in awaited:
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


def _annotation_resolves(
    annotation: ast.expr | None, imports: dict[str, str], wanted: set[str]
) -> bool:
    """True when an annotation names one of ``wanted`` fully-qualified types.

    Handles ``DeviceEntry`` (through the import map, so a bare name that was
    never imported from the right module does not count), ``dr.DeviceEntry``,
    ``DeviceEntry | None``, ``Optional[DeviceEntry]`` and string annotations.
    """
    if annotation is None:
        return False
    if isinstance(annotation, ast.Constant) and isinstance(annotation.value, str):
        # Same guard as the top-level parse: third-party code decides what is
        # in here, and no annotation is worth aborting a crawl over.
        try:
            annotation = ast.parse(annotation.value.strip(), mode="eval").body
        except (SyntaxError, ValueError, RecursionError, MemoryError):
            return False
    if isinstance(annotation, ast.BinOp) and isinstance(annotation.op, ast.BitOr):
        return _annotation_resolves(
            annotation.left, imports, wanted
        ) or _annotation_resolves(annotation.right, imports, wanted)
    if isinstance(annotation, ast.Subscript):
        base = _dotted(annotation.value)
        if base and base.rsplit(".", 1)[-1] == "Optional":
            return _annotation_resolves(annotation.slice, imports, wanted)
        return False
    if isinstance(annotation, ast.Name):
        return imports.get(annotation.id) in wanted
    if isinstance(annotation, ast.Attribute):
        dotted = _dotted(annotation)
        if dotted is None:
            return False
        head, _, tail = dotted.partition(".")
        base = imports.get(head)
        return bool(base and tail) and f"{base}.{tail}" in wanted
    return False


def _all_args(node: ast.FunctionDef | ast.AsyncFunctionDef) -> list[ast.arg]:
    return [*node.args.posonlyargs, *node.args.args, *node.args.kwonlyargs]


def _bound_names(node: ast.Assign | ast.AnnAssign | ast.NamedExpr) -> list[str]:
    """Plain-``Name`` targets; attribute targets go through
    :func:`_factory_attributes`, which scopes them to the class."""
    targets = node.targets if isinstance(node, ast.Assign) else [node.target]
    return [target.id for target in targets if isinstance(target, ast.Name)]


def _is_factory_call(
    matcher: dict[str, Any], node: ast.Call, imports: dict[str, str]
) -> bool:
    name = _called_name(node)
    if name is None:
        return False
    factory = f"{matcher.get('module', '')}.{matcher.get('registry_factory', '')}"
    return _resolve_call_module(node, name, imports) == factory


def _factory_attributes(
    matcher: dict[str, Any], node: ast.ClassDef, imports: dict[str, str]
) -> set[str]:
    """Attributes a class assigns the registry to, e.g. ``self._registry``.

    Collected across the whole class because the assignment usually sits in
    ``__init__`` and the lookups sit in other methods. An attribute is safe to
    prove that widely where a bare local name is not: it belongs to the class
    rather than to whichever function happened to reuse the spelling.
    """
    found: set[str] = set()
    for child in ast.walk(node):
        if not isinstance(child, (ast.Assign, ast.AnnAssign)):
            continue
        if not (
            isinstance(child.value, ast.Call)
            and _is_factory_call(matcher, child.value, imports)
        ):
            continue
        targets = child.targets if isinstance(child, ast.Assign) else [child.target]
        for target in targets:
            dotted = _dotted(target) if isinstance(target, ast.Attribute) else None
            if dotted:
                found.add(dotted)
    return found


def _scope_nodes(body: list[ast.stmt]) -> tuple[list[ast.AST], list[ast.AST]]:
    """Split a scope's own nodes from the nested scopes inside it.

    ``device`` is one of the commonest local names in this ecosystem, so a
    binder that proved names file-wide would carry a proof out of the function
    that earned it and into an unrelated function that happens to reuse the
    name.
    """
    own: list[ast.AST] = []
    nested: list[ast.AST] = []
    stack = list(body)
    while stack:
        node = stack.pop()
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            nested.append(node)
            continue
        own.append(node)
        stack.extend(ast.iter_child_nodes(node))
    return own, nested


def _entry_call(
    matcher: dict[str, Any],
    node: ast.Call,
    imports: dict[str, str],
    receivers: set[str],
) -> bool:
    """True when ``node`` provably returns entry objects.

    Either a method from ``entry_methods`` on a proved receiver -- a local
    name, an attribute such as ``self._registry``, or the factory call
    chained directly -- or a module-level function from ``entry_functions``
    that the import map pins to the matcher module.
    """
    name = _called_name(node)
    if name is None:
        return False
    func = node.func
    if isinstance(func, ast.Attribute) and name in set(
        matcher.get("entry_methods", ())
    ):
        receiver = func.value
        if _dotted(receiver) in receivers:
            return True
        return isinstance(receiver, ast.Call) and _is_factory_call(
            matcher, receiver, imports
        )
    if isinstance(func, ast.Attribute) and name in ("get", "values"):
        return _is_entry_container(matcher, func.value, imports, receivers)
    if name in set(matcher.get("entry_functions", ())):
        module = matcher.get("module", "")
        return _resolve_call_module(node, name, imports) == f"{module}.{name}"
    return False


def _is_entry_container(
    matcher: dict[str, Any],
    node: ast.expr,
    imports: dict[str, str],
    receivers: set[str],
) -> bool:
    """``registry.devices`` and friends: a proved registry's own mapping."""
    if not (
        isinstance(node, ast.Attribute)
        and node.attr in set(matcher.get("entry_containers", ()))
    ):
        return False
    if _dotted(node.value) in receivers:
        return True
    return isinstance(node.value, ast.Call) and _is_factory_call(
        matcher, node.value, imports
    )


def _yields_entry(
    matcher: dict[str, Any],
    node: ast.expr,
    imports: dict[str, str],
    receivers: set[str],
) -> bool:
    """True when evaluating ``node`` gives an entry, or entries to iterate."""
    if isinstance(node, ast.Call):
        return _entry_call(matcher, node, imports, receivers)
    if isinstance(node, ast.Subscript):
        return _is_entry_container(matcher, node.value, imports, receivers)
    return False


def _scope_bindings(
    matcher: dict[str, Any],
    func: ast.AST | None,
    nodes: list[ast.AST],
    imports: dict[str, str],
    receivers: set[str],
    entries: set[str],
) -> tuple[set[str], set[str]]:
    """Names this scope proves, on top of the ones it inherits.

    Registry-typed names are settled first, because an entry lookup only
    counts when it happens on a receiver that is already proved.
    """
    module = matcher.get("module", "")
    registry_types = {f"{module}.{n}" for n in matcher.get("registry_types", ())}
    entry_types = {f"{module}.{n}" for n in matcher.get("entry_types", ())}
    receivers, entries = set(receivers), set(entries)

    if isinstance(func, (ast.FunctionDef, ast.AsyncFunctionDef)):
        args = _all_args(func)
        # A parameter shadows whatever the enclosing scope proved about the name.
        shadowed = {arg.arg for arg in args}
        receivers -= shadowed
        entries -= shadowed
        for arg in args:
            if _annotation_resolves(arg.annotation, imports, registry_types):
                receivers.add(arg.arg)
            elif _annotation_resolves(arg.annotation, imports, entry_types):
                entries.add(arg.arg)

    for node in nodes:
        if isinstance(node, (ast.Assign, ast.AnnAssign, ast.NamedExpr)):
            if isinstance(node.value, ast.Call) and _is_factory_call(
                matcher, node.value, imports
            ):
                receivers.update(_bound_names(node))
            if isinstance(node, ast.AnnAssign):
                if _annotation_resolves(node.annotation, imports, registry_types):
                    receivers.update(_bound_names(node))
                elif _annotation_resolves(node.annotation, imports, entry_types):
                    entries.update(_bound_names(node))

    for node in nodes:
        if isinstance(node, (ast.Assign, ast.AnnAssign, ast.NamedExpr)):
            # An awaited value is wrapped in ``ast.Await`` and never binds:
            # every entry method here is a plain ``def`` in core, so an await
            # is somebody else's method of the same name.
            if _yields_entry(matcher, node.value, imports, receivers):
                entries.update(_bound_names(node))
        elif isinstance(node, (ast.For, ast.comprehension)):
            # `for x in async_entries_for_area(...)` proves the same thing
            # whether it is a statement or the generator of a comprehension.
            if isinstance(node.target, ast.Name) and _yields_entry(
                matcher, node.iter, imports, receivers
            ):
                entries.add(node.target.id)
    return receivers, entries


def _contract_parameter(
    matcher: dict[str, Any], func: ast.AST, module_level: bool
) -> str | None:
    """The parameter a platform contract types for us, if this is one.

    Home Assistant calls ``async_remove_config_entry_device(hass, entry,
    device)`` itself, so its third parameter is an entry whether or not the
    author annotated it, and that function is where integrations most often
    read the deprecated attribute.
    """
    entry_params = matcher.get("entry_params") or {}
    if not (module_level and isinstance(func, ast.AsyncFunctionDef)):
        return None
    index = entry_params.get(func.name)
    if index is None:
        return None
    params = [*func.args.posonlyargs, *func.args.args]
    return params[index - 1].arg if 0 <= index - 1 < len(params) else None


def _match_attr_access_typed(
    matcher: dict[str, Any], tree: ast.Module, imports: dict[str, str]
) -> Iterator[tuple[int, str]]:
    """``attr_access`` gated on proving what the receiver is.

    Exists for ``DeviceEntry.config_entries``, whose name collides with the
    ubiquitous ``hass.config_entries``: a plain ``attr_access`` matcher would
    fire on nearly every integration ever written. This one is an allowlist of
    proven receivers -- an attribute read fires only off a name proved in the
    scope that reads it, or chained straight off a registry lookup. Everything
    else, ``hass.config_entries`` included, never matches.

    Inference is per scope and flow-insensitive: a name proved anywhere in a
    function counts everywhere in it, and nested scopes inherit what encloses
    them, the way a closure really does read those names. A registry assigned
    to an attribute is proved for its whole class, because that assignment
    lives in ``__init__`` and the lookups do not.
    """
    names = set(matcher.get("names", ()))

    def visit(
        func: ast.AST | None,
        body: list[ast.stmt],
        receivers: set[str],
        entries: set[str],
        contracted: str | None,
        module_level: bool,
    ) -> Iterator[tuple[int, str]]:
        own, nested = _scope_nodes(body)
        receivers, entries = _scope_bindings(
            matcher, func, own, imports, receivers, entries
        )
        if contracted:  # after shadowing: it is this function's own parameter
            entries.add(contracted)
        for node in own:
            if not (
                isinstance(node, ast.Attribute)
                and node.attr in names
                and isinstance(node.ctx, ast.Load)
            ):
                continue
            value = node.value
            if isinstance(value, ast.Name) and value.id in entries:
                yield node.lineno, node.attr
            elif _yields_entry(matcher, value, imports, receivers):
                yield node.lineno, node.attr
        for child in nested:
            inherited = receivers
            if isinstance(child, ast.ClassDef):
                inherited = receivers | _factory_attributes(matcher, child, imports)
            yield from visit(
                child,
                child.body,
                inherited,
                entries,
                _contract_parameter(matcher, child, module_level),
                False,
            )

    yield from visit(None, tree.body, set(), set(), None, True)


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
    "attr_access_typed": _match_attr_access_typed,
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
