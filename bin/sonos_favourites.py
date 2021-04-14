import uuid

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

### GRID ###
f = open("../dwains-dashboard/addons/rooms/office/sonos/partial_station_grid.yaml", "w")
f.write("---" + "\n")
f.write("type: custom:dwains-flexbox-card" + "\n")
f.write("items_classes: 'col-xs-4 col-sm-2'" + "\n")
f.write("cards:" + "\n")
for fav in favorites["favorites"]:
    title = fav["title"]
    titleClean = make_safe_filename(title)
    f.write("  - type: custom:button-card" + "\n")
    f.write("    entity: media_player.office_sonos" + "\n")
    f.write("    show_state: false" + "\n")
    f.write("    name: " + title + "\n")
    f.write("    show_name: false" + "\n")
    f.write("    show_entity_picture: true" + "\n")
    f.write("    entity_picture: ../local/radioicons/" + titleClean + ".png" + "\n")
    f.write("    aspect_ratio: 1/1" + "\n")
    f.write("    styles:" + "\n")
    f.write("      entity_picture:" + "\n")
    f.write("        - width: 80%" + "\n")
    # f.write("        - height: 150px" + "\n")
    f.write("        - filter: >" + "\n")
    f.write("            [[[" + "\n")
    f.write(
        "              if (states['sensor.office_sonos_source'].state == '" + title + "')" + "\n"
    )
    f.write("                return 'null';" + "\n")
    f.write("              return 'grayscale(100%)';" + "\n")
    f.write("            ]]]" + "\n")
    f.write("      card:" + "\n")
    f.write("        - filter: >" + "\n")
    f.write("            [[[" + "\n")
    f.write(
        "              if (states['sensor.office_sonos_source'].state == '" + title + "')" + "\n"
    )
    f.write("                return 'null';" + "\n")
    f.write("              return 'opacity(50%)';" + "\n")
    f.write("            ]]]" + "\n")
    f.write("    tap_action:" + "\n")
    f.write("      action: call-service" + "\n")
    f.write("      service: automation.trigger" + "\n")
    f.write("      service_data:" + "\n")
    f.write("        entity_id: automation.sonos_playlist_" + titleClean + "\n")
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
    f.write("id: " + titleClean + "\n")
    f.write("trigger:" + "\n")
    f.write("  - platform: state" + "\n")
    f.write("    entity_id: input_select.sonosplaylist" + "\n")
    f.write('    to: "' + title + '"\n')
    f.write("  - platform: webhook" + "\n")
    f.write("    webhook_id: sonos_" + titleClean + "\n")
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
