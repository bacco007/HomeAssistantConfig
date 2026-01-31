python3 - <<'PY'
import os, json, re

CC_DIR = "/config/custom_components"
CFG_YAML = "/config/configuration.yaml"
CFG_DIR = "/config"
CONFIG_ENTRIES = "/config/.storage/core.config_entries"

def disk_custom_components():
    out = set()
    if not os.path.isdir(CC_DIR):
        return out
    for name in os.listdir(CC_DIR):
        m = os.path.join(CC_DIR, name, "manifest.json")
        if os.path.isfile(m):
            out.add(name)
    return out

def configured_via_ui():
    domains = set()
    try:
        with open(CONFIG_ENTRIES, "r", encoding="utf-8") as f:
            data = json.load(f)
        for entry in data.get("data", {}).get("entries", []):
            d = entry.get("domain")
            if d:
                domains.add(d)
    except Exception:
        pass
    return domains

def referenced_in_yaml(domains_to_check):
    """
    Lightweight YAML scan:
    - looks for top-level keys like: domain:
    - and also common patterns like platform: domain
    This avoids needing PyYAML.
    """
    if not os.path.isfile(CFG_YAML):
        return set()

    text = open(CFG_YAML, "r", encoding="utf-8", errors="ignore").read()

    found = set()

    # Top-level keys: ^domain:
    for d in domains_to_check:
        if re.search(rf"(?m)^\s*{re.escape(d)}\s*:", text):
            found.add(d)

    # platform: domain (common in sensor, binary_sensor, etc.)
    for m in re.finditer(r"(?m)^\s*platform\s*:\s*([a-zA-Z0-9_]+)\s*$", text):
        plat = m.group(1)
        if plat in domains_to_check:
            found.add(plat)

    # include files referenced from configuration.yaml (packages, includes)
    # We’ll try a simple scan for included YAMLs and search them too.
    include_paths = set()
    for m in re.finditer(r"(?m)^\s*!\s*include(?:_dir_named|_dir_merge_named|_dir_list|_dir_merge_list|_dir_merge_named)?\s+(.+?)\s*$", text):
        p = m.group(1).strip().strip("'\"")
        include_paths.add(p)

    # Also handle "packages: !include_dir_named packages" pattern
    for m in re.finditer(r"(?m)^\s*packages\s*:\s*!include_dir_named\s+(.+?)\s*$", text):
        include_paths.add(m.group(1).strip().strip("'\""))

    def expand_paths(p):
        p = p.lstrip("/")
        abs_p = os.path.join(CFG_DIR, p)
        if os.path.isfile(abs_p):
            return [abs_p]
        if os.path.isdir(abs_p):
            out = []
            for root, _, files in os.walk(abs_p):
                for fn in files:
                    if fn.lower().endswith((".yaml", ".yml")):
                        out.append(os.path.join(root, fn))
            return out
        return []

    files_to_scan = []
    for p in include_paths:
        files_to_scan.extend(expand_paths(p))

    for fp in files_to_scan:
        try:
            t = open(fp, "r", encoding="utf-8", errors="ignore").read()
        except Exception:
            continue

        for d in domains_to_check:
            if re.search(rf"(?m)^\s*{re.escape(d)}\s*:", t):
                found.add(d)
        for m in re.finditer(r"(?m)^\s*platform\s*:\s*([a-zA-Z0-9_]+)\s*$", t):
            plat = m.group(1)
            if plat in domains_to_check:
                found.add(plat)

    return found

disk = disk_custom_components()
ui = configured_via_ui()
yaml = referenced_in_yaml(disk)

configured = (disk & ui) | yaml
disk_only = sorted(disk - configured)
ui_only = sorted((disk & ui) - yaml)
yaml_only = sorted(yaml - (disk & ui))
both = sorted((disk & ui) & yaml)

print(f"Custom components on disk: {len(disk)}")

print("\nConfigured via UI (config entries):")
for d in ui_only + both:
    if d in disk:
        print(" -", d)

print("\nReferenced in YAML (configuration/includes):")
for d in yaml_only + both:
    print(" -", d)

print("\nOn disk but NOT referenced (likely unused / leftovers):")
for d in disk_only:
    print(" -", d)

print("\nNote: 'On disk but NOT referenced' are the prime candidates for cleanup.")
PY