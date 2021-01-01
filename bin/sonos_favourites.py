from soco import SoCo


def make_safe_filename(s):
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"

    return "".join(safe_char(c) for c in s).rstrip("_")


soco = SoCo("192.168.1.99")

favorites = soco.get_sonos_favorites()

### INPUT_SELECT ###
f = open("../entities/input_selects/sonos_playlist.yaml", "w")
f.write("---")
f.write("\n")
f.write("sonosplaylist:" + "\n")
f.write("  name: Playlist Selection" + "\n")
f.write("  options:" + "\n")
f.write('    - "-- Select --"' + "\n")
for fav in favorites["favorites"]:
    title = fav["title"]
    # uri = fav["uri"]
    f.write('    - "' + title + '"\n')

f.write('  initial: "-- Select --"' + "\n")

f.write('  icon: "mdi:music-box-outline"' + "\n")
f.close()

### AUTOMATION ###
for fav in favorites["favorites"]:
    title = fav["title"]
    uri = fav["uri"]
    titleClean = make_safe_filename(title)
    f = open("../automations/sonos_playlists/" + titleClean + ".yaml", "w")
    f.write("---")
    f.write("\n")
    f.write("alias: Sonos - Playlist - " + title + "\n")
    f.write("trigger:" + "\n")
    f.write("  - platform: state" + "\n")
    f.write("    entity_id: input_select.sonosplaylist" + "\n")
    f.write('    to: "' + title + '"\n')
    f.write("action:" + "\n")
    f.write("  - service: media_player.select_source" + "\n")
    f.write("    data:" + "\n")
    f.write("      entity_id: media_player.office_sonos" + "\n")
    f.write('      source: "' + title + '"\n')
    f.write("  - service: input_select.select_option" + "\n")
    f.write("    data:" + "\n")
    f.write("      entity_id: input_select.sonosplaylist" + "\n")
    f.write('      option: "-- Select --"\n')
    f.close()
