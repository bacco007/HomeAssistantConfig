attributes = {}
components = hass.states.get('sensor.hass_main_config').attributes['components']
cnt = len(components)
components.sort()

# Make a dictionary of all main domains, add each sub domain to the main domain list.
compdict = {}
subdict = {}
for component in components:
    if component.count('.') == 0 and component not in compdict:
        compdict[component] = []
    if component.count('.') == 1:
        domain, subdomain = component.split('.')
#        compdict[domain].append(subdomain)
        compdict.setdefault(domain, []).append(subdomain)
        if len(subdomain) > 1:
            subdict.setdefault(subdomain, []).append(domain)
# Make the dictionary into a flat list of strings.

complist = []
for key, value in compdict.items():
    if value:
        value.sort()
        complist.append(
            {
                "domain": key,
                "uses": ', '.join(value),
            }
        )

sublist = []
for key, value in subdict.items():
    if value:
        value.sort()
        sublist.append(
            {
                "subdomain": key,
                "uses": ', '.join(value),
            }
        )

attributes['friendly_name'] = 'Components'
attributes['icon'] = 'mdi:format-list-bulleted-type'
attributes['components'] = complist #text
attributes['subdomains'] = sublist
hass.states.set('sensor.ha_overview', cnt, attributes)