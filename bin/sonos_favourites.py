from soco import SoCo
from soco import discover
import re

def make_safe_filename(s):
    def safe_char(c):
        if c.isalnum():
            return c
        else:
            return "_"

    return re.sub('_{2,}', '_', "".join(safe_char(c) for c in s).rstrip("_"))

zone_list = list(discover())
soco = zone_list[0]

favorites = soco.music_library.get_sonos_favorites()

### INPUT_SELECT ###
f = open("sonos_playlist.yaml", "w")
f.write("---")
f.write("\n")
for fav in favorites:
    title = fav.title
    titleClean = make_safe_filename(title)
    f.write(title + ": ../local/radioicons/" + titleClean + ".png" + "\n")
# f.write("sonosplaylist:" + "\n")
# f.write("  name: Playlist Selection" + "\n")
# f.write("  options:" + "\n")
# f.write('    - "-- Select --"' + "\n")
# for fav in favorites["favorites"]:
#     title = fav["title"]
#     # uri = fav["uri"]
#     f.write('    - "' + title + '"\n')

# f.write('  initial: "-- Select --"' + "\n")

# f.write('  icon: "mdi:music-box-outline"' + "\n")
f.close()

### GRID ###
# f = open("dwains-dashboard/configs/more_pages/sonos/partial_station_grid.yaml", "w")
# f.write("---" + "\n")
# f.write("type: custom:dwains-flexbox-card" + "\n")
# f.write("items_classes: 'col-xs-2 col-sm-1'" + "\n")
# f.write("cards:" + "\n")
# for fav in favorites:
#     title = fav.title
#     titleClean = make_safe_filename(title)
#     f.write("  - type: custom:button-card" + "\n")
#     f.write("    entity: media_player.office_sonos" + "\n")
#     f.write("    show_state: false" + "\n")
#     f.write("    name: " + title + "\n")
#     f.write("    show_name: false" + "\n")
#     f.write("    show_entity_picture: true" + "\n")
#     f.write("    entity_picture: ../local/radioicons/" + titleClean + ".png" + "\n")
#     f.write("    aspect_ratio: 1/1" + "\n")
#     f.write("    triggers_update: all" + "\n")
#     f.write("    styles:" + "\n")
#     f.write("      entity_picture:" + "\n")
#     f.write("        - width: 80%" + "\n")
#     # f.write("        - height: 150px" + "\n")
#     f.write("        - filter: >" + "\n")
#     f.write("            [[[" + "\n")
#     f.write(
#         "              if (states['input_text.sonos_playlist_playing'].state == '"
#         + title.replace("'", "\\'")
#         + "')"
#         + "\n"
#     )
#     f.write("                return 'null';" + "\n")
#     f.write("              return 'grayscale(100%)';" + "\n")
#     f.write("            ]]]" + "\n")
#     f.write("      card:" + "\n")
#     f.write("        - filter: >" + "\n")
#     f.write("            [[[" + "\n")
#     f.write(
#         "              if (states['input_text.sonos_playlist_playing'].state == '"
#         + title.replace("'", "\\'")
#         + "')"
#         + "\n"
#     )
#     f.write("                return 'null';" + "\n")
#     f.write("              return 'opacity(50%)';" + "\n")
#     f.write("            ]]]" + "\n")
#     f.write("    tap_action:" + "\n")
#     f.write("      action: call-service" + "\n")
#     f.write("      service: automation.trigger" + "\n")
#     f.write("      service_data:" + "\n")
#     f.write("        entity_id: automation.sonos_playlist_" + titleClean + "\n")
# f.close()

### AUTOMATION ###
for fav in favorites:
    title = fav.title
    # uri = fav["uri"]
    titleClean = make_safe_filename(title)
    f = open("automations/sonos_playlists/" + titleClean + ".yaml", "w")
    f.write("---")
    f.write("\n")
    f.write("alias: Sonos - Playlist - " + title + "\n")
    f.write("description: Play " + title + " on Sonos" + "\n")
    f.write("id: " + titleClean + "\n")
    f.write("trigger:" + "\n")
    f.write("  - platform: webhook" + "\n")
    f.write("    webhook_id: sonos_" + titleClean + "\n")
    f.write("    allowed_methods:" + "\n")
    f.write("      - POST" + "\n")
    f.write("      - PUT" + "\n")
    f.write("    local_only: true" + "\n")
    f.write("action:" + "\n")
    f.write("  - service: media_player.select_source" + "\n")
    f.write("    data:" + "\n")
    f.write("      entity_id: media_player.office_sonos" + "\n")
    f.write('      source: "' + title + '"\n')
    f.write("  - service: input_text.set_value" + "\n")
    f.write("    target:" + "\n")
    f.write("      entity_id: input_text.sonos_playlist_playing" + "\n")
    f.write("    data:" + "\n")
    f.write('      value: "' + title + '"\n')
    f.close()
