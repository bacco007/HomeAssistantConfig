python3 - <<'PY'
import os, json, re, glob
from urllib.parse import urlparse

WWW = "/config/www"
RES_FILE = "/config/.storage/lovelace.resources"

def list_js_on_disk():
    out = set()
    if not os.path.isdir(WWW):
        return out
    # common: /config/www/community/<name>/<file>.js
    for p in glob.glob(os.path.join(WWW, "**", "*.js"), recursive=True):
        out.add(os.path.normpath(p))
    return out

def load_lovelace_resources():
    """
    Returns set of resource URLs as stored (e.g. /hacsfiles/xyz/xyz.js, /local/abc.js)
    """
    try:
        with open(RES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        resources = data.get("data", {}).get("resources", [])
        return {r.get("url") for r in resources if r.get("url")}
    except Exception as e:
        return set()

def url_to_disk_path(url):
    """
    Map /local/... -> /config/www/...
    Map /hacsfiles/... -> usually /config/www/community/...
    """
    # strip any querystring cache-busters
    u = url.split("?", 1)[0].strip()

    if u.startswith("/local/"):
        return os.path.normpath(os.path.join(WWW, u[len("/local/"):]))
    if u.startswith("/hacsfiles/"):
        return os.path.normpath(os.path.join(WWW, "community", u[len("/hacsfiles/"):]))
    # sometimes people use full URLs or other paths; ignore
    return None

disk = list_js_on_disk()
resources = load_lovelace_resources()

mapped = {}
unmappable = set()
for r in resources:
    p = url_to_disk_path(r)
    if p:
        mapped[r] = p
    else:
        unmappable.add(r)

# Which resources are broken (resource registered, file missing)
broken = sorted([r for r,p in mapped.items() if not os.path.isfile(p)])

# Which disk files are referenced by registered resources
referenced_disk = {p for p in mapped.values() if os.path.isfile(p)}

# Candidates: disk JS that aren't referenced as resources
# (This is "likely unused" but not perfect; some JS might not be a card resource.)
unused_candidates = sorted(disk - referenced_disk)

print(f"JS files under /config/www: {len(disk)}")
print(f"Lovelace resources registered: {len(resources)}")
print(f"Resources that map to disk paths: {len(mapped)}")
if unmappable:
    print("\nResources that couldn't be mapped to /local or /hacsfiles (left as-is):")
    for r in sorted(unmappable):
        print(" -", r)

print("\nBroken resources (registered but file missing):")
if broken:
    for r in broken:
        print(" -", r)
else:
    print(" (none)")

print("\nJS files on disk but NOT referenced by a Lovelace resource (candidates):")
# keep output sane
for p in unused_candidates[:200]:
    print(" -", p)
if len(unused_candidates) > 200:
    print(f" ... and {len(unused_candidates)-200} more")

PY