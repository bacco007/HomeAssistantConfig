# Flightradar24 Integration Card

Custom card to use with [Flightradar24 integration](https://github.com/AlexandrErohin/home-assistant-flightradar24) for Home Assistant.

<img src="https://raw.githubusercontent.com/Springvar/home-assistant-flightradar24-card/master/card.png" width="35%">

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
    - [Basic Configuration](#basic-configuration)
    - [Advanced Configuration](#advanced-configuration)
        - [Sort](#sort-configuration)
        - [Filter](#filter-configuration)
        - [Radar](#radar-configuration)
            - [Radar filter](#radar-filter)
            - [Radar features](#radar-features)
            - [Radar map background](#radar-map-background)
        - [List](#list-configuration)
        - [Annotations](#annotation-configuration)
        - [Toggles](#toggles-configuration)
        - [Defines](#defines-configuration)
        - [Templates](#templates-configuration)
4. [Usage](#usage)
    - [Features](#features)
    - [Examples](#examples)
5. [Support](#support)

## Introduction

The Flightradar24 Integration Card allows you to display flight data from Flightradar24 in your Home Assistant dashboard. You can track flights near your location, view details about specific aircraft, and customize the display to fit your needs.

## Installation

### Prerequisites

This card is designed to work with sensor data provided by <a href="https://github.com/AlexandrErohin/home-assistant-flightradar24">Flightradar24 integration</a>.

### HACS (recommended)

Have [HACS](https://hacs.xyz/) installed, this will allow you to update easily.

[![Install quickly via a HACS link](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Springvar&repository=home-assistant-flightradar24-card&category=plugin)

1. Go to **HACS** -> **Integrations**.
2. Add this repository ([https://github.com/Springvar/home-assistant-flightradar24-card](https://github.com/Springvar/home-assistant-flightradar24-card)) as a [custom repository](https://hacs.xyz/docs/faq/custom_repositories/)
3. Click on `+ Explore & Download Repositories`, search for `Flightradar24 Card`.
4. Search for and select `Flightradar24 Card`.
5. Press `DOWNLOAD` and in the next window also press `DOWNLOAD`.
6. After download, restart Home Assistant.

### Manual

To install the card, follow these steps:

1. **Download the Card**:

    - Download the latest release from the [GitHub repository](https://github.com/your-repo/home-assistant-flightradar24-card/releases).

2. **Add to Home Assistant**:

    - Place the downloaded files in a `flightradar24` directory under your `www` directory inside your Home Assistant configuration directory.

3. **Add the Custom Card to Lovelace**:
    - Edit your Lovelace dashboard and add the custom card:
        ```yaml
        resources:
            - url: /local/flightradar24/flightradar24-card.js
              type: module
        ```

## Configuration

### Basic Configuration

To use the card, simply add the following configuration to your Lovelace dashboard:

```yaml
type: custom:flightradar24-card
```

| Name                  | Description                                                                                                                                                       | Default Value                                                                            | Constraints                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `flights_entity`      | Entity ID for the Flightradar24 sensor.                                                                                                                           | `sensor.flightradar24_current_in_area`                                                   | Must be a valid sensor entity ID                                                                                |
| `location_tracker`    | Entity ID for a location tracker device.<br><br>If provided, all distances and directions will be calculated with the tracker position as the reference position. | None                                                                                     | Must be a valid device_tracker entity ID                                                                        |
| `location`            | Latitude and longitude of a static reference position. Will be used as fallback if tracker is unavailable or not provided.                                        | Home Assistant home location                                                             | Must have both lat and lon                                                                                      |
| `projection_interval` | Interval in seconds for when to recalculate projected positions and altitude.                                                                                     | `5`                                                                                      | Number (seconds) - `0` disables projection. Radar and list will refresh when flights sensor or tracker updates. |
| `units`               | Unit object to customize units for altitude, speed and distance.                                                                                                  | units:<br>&nbsp;&nbsp;altitude: ft<br>&nbsp;&nbsp;speed: kts<br>&nbsp;&nbsp;distance: km | `altitude` must be `m` or `ft`<br>`speed` must be `kmh`, `mph` or `kts`<br>`distance` must be `km` or `miles`   |
| `no_flights_message`  | Message to display if no flights are visible.                                                                                                                     | `No flights are currently visible. Please check back later.`                             | String - Use empty string to disable the message                                                                |

_Note:_ If location is configured, this must be within the area fetched by the [Flightradar24 Integration]("https://github.com/AlexandrErohin/home-assistant-flightradar24").
The location would normally be the same given to the integration. If no location is configured, the home location for Home Assistant will be used.

### Advanced Configuration

#### Sort Configuration

To sort the displayed flights with a custom sort order, use the sort option.

```yaml
sort:
    - field: id
      comparator: oneOf
      value: ${selectedFlights}
      order: desc
    - field: altitude
      comparator: eq
      value: 0
      order: asc
    - field: distance_to_tracker
      order: asc
```

| Name         | Description                                                                                                                                   | Default Value | Constraints                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `field`      | Flight field to sort on                                                                                                                       | None          | Must be valid flight field                                       |
| `order`      | Sort in ascending or descending order                                                                                                         | ASC           | Must be `ASC` or `DESC`                                          |
| `comparator` | Optional comparator to evaluate field against a value. If no comparator is given, the fields of the flights are evaluated against each other. | None          | Must be `eq`, `lt`, `lte`, `gt`, `gte`, `oneOf`, `containsOneOf` |
| `value`      | Optional value to evaluate field against with comparator                                                                                      | None          | Must be a valid value or list of values                          |

#### Filter Configuration

To filter the displayed flights, use the filter option.

```yaml
filter:
    - type: OR
      conditions:
          - field: distance_to_tracker
            comparator: lte
            value: 15
          - type: AND
            conditions:
                - field: closest_passing_distance
                  comparator: lte
                  value: 15
                - field: is_approaching
                  comparator: eq
                  value: true
          - field: altitude
            comparator: lte
            value: 2500
```

##### Group conditions

| Name         | Description                                | Default Value | Constraints                         |
| ------------ | ------------------------------------------ | ------------- | ----------------------------------- |
| `type`       | Logical operator for the filter conditions | None          | Must be `OR` or `AND`               |
| `conditions` | List of filter conditions                  | None          | Must be a list of condition objects |

##### Negative condition

| Name        | Description                                | Default Value | Constraints               |
| ----------- | ------------------------------------------ | ------------- | ------------------------- |
| `type`      | Logical operator for the filter conditions | None          | Must be `NOT`             |
| `condition` | Condition to negate                        | None          | Must be a valid condition |

##### Field comparision condition

| Name                 | Description                                | Default Value | Constraints                                                      |
| -------------------- | ------------------------------------------ | ------------- | ---------------------------------------------------------------- |
| `field` or `defined` | Flight field or defined value to filter on | None          | Must be a valid field name or defined property                   |
| `comparator`         | Comparator for the filter condition        | None          | Must be `eq`, `lt`, `lte`, `gt`, `gte`, `oneOf`, `containsOneOf` |
| `value`              | Value to compare against                   | None          | Must be a valid value or list of values                          |

#### Radar Configuration

Configure radar settings with the radar option.

```yaml
radar:
    range: 35
    filter: false
    primary-color: rgb(0,200,100) // Default colors defined by theme
    feature-color: rgb(0,100,20)
```

To hide the radar:

```yaml
radar:
    hide: true
```

| Name                   | Description                                          | Default Value                     | Constraints                                           |
| ---------------------- | ---------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| `range`                | Range of the radar in selected distance unit         | 35 km or 20 miles                 | Must be a positive number                             |
| `min_range`            | Minimum range of the radar in selected distance unit | 1 km or 1 mile                    | Must be a positive number                             |
| `max_range`            | Maximum range of the radar in selected distance unit | 100 km or 100 miles               | Must be a positive number                             |
| `ring_distance`        | Distance between rings in selected distance unit     | 10 km or 10 miles                 | Must be a positive number                             |
| `filter`               | Filter the flights displayed on the radar            | false                             | `true`, `false` or a filter configuration (see below) |
| `primary-color`        | Primary color for the radar display                  | `var(--dark-primary-color)`       | Must be a valid CSS color                             |
| `accent-color`         | Accent Color for the radar display                   | `var(--accent-color)`             | Must be a valid CSS color                             |
| `feature-color`        | Color for radar features                             | `var(--primary-background-color)` | Must be a valid CSS color                             |
| `callsign-label-color` | Color for callsign labels                            | `var(--secondary-text-color)`     | Must be a valid CSS color                             |
| `hide`                 | Option to hide the radar                             | `false`                           | Must be `true` or `false`                             |
| `hide_range`           | Option to hide the radar range                       | `false`                           | Must be `true` or `false`                             |

##### Radar Filter

You can filter the flights displayed on the radar using a filter configuration similar to the main filter configuration.

```yaml
radar:
    filter:
        - field: altitude
          comparator: lte
          value: 5000
```

##### Radar Features

###### General settings for all feature types

| Name        | Description                          | Default Value | Constraints               |
| ----------- | ------------------------------------ | ------------- | ------------------------- |
| `max_range` | Maximum range to draw the feature at | None          | Must be a positive number |

###### Locations

Add locations to the radar.

```yaml
radar:
    local_features:
        - type: location
          label: Trondheim
          position:
              lat: 63.430472
              lon: 10.394964
```

| Name       | Description               | Default Value | Constraints                    |
| ---------- | ------------------------- | ------------- | ------------------------------ |
| `type`     | Type of the radar feature | None          | Must be `location`             |
| `label`    | Label for the location    | None          | Must be a string               |
| `position` | Position of the location  | None          | Must be a valid lat/lon object |

Position object:

| Name  | Description               | Default Value | Constraints               |
| ----- | ------------------------- | ------------- | ------------------------- |
| `lat` | Latitude of the position  | None          | Must be a valid latitude  |
| `lon` | Longitude of the position | None          | Must be a valid longitude |

###### Runways

Add runways to the radar.

```yaml
radar:
    local_features:
        - type: runway
          position:
              lat: 63.457647
              lon: 10.894486
          heading: 86.7
          length: 9052
```

| Name       | Description                                      | Default Value | Constraints                    |
| ---------- | ------------------------------------------------ | ------------- | ------------------------------ |
| `type`     | Type of the radar feature                        | None          | Must be `runway`               |
| `position` | Position of the runway (one end of the rwy)      | None          | Must be a valid lat/lon object |
| `heading`  | Heading of the runway in degrees (from position) | None          | Must be a valid number         |
| `length`   | Length of the runway in feet                     | None          | Must be a positive number      |

##### Outlines

Add geographic outlines to the radar.

```yaml
radar:
    local_features:
        - type: outline
          points:
              - lat: 63.642064
                lon: 9.713992
              - lat: 63.443223
                lon: 9.974975
              - lat: 63.353184
                lon: 9.912988
```

| Name     | Description                         | Default Value | Constraints                       |
| -------- | ----------------------------------- | ------------- | --------------------------------- |
| `type`   | Type of the radar feature           | None          | Must be `outline`                 |
| `points` | List of points defining the outline | None          | Must be a list of lat/lon objects |

**Tip:** You can use a LLM like ChatGPT to generate outlines for you, and you may get useful results.

Try a question like this one:

```ChatGPT
I need a series of coordinates to make out the rough shape of Manhattan.
I want them printed as a yaml list on the format:
- lat: MM.MMMMMM
  lon: MM.MMMMMM
  desc: [Placename]
- lat: NN.NNNNNN
  lon: NN.NNNNNN
  desc: [Placename]
```

The desc: fields will be ignored by the Card, but will be useful if you want to add or move coordinates.

##### Radar Map Background

```yaml
radar:
    background_map: bw # Options: bw, color, dark, outlines
    background_map_opacity: 0.7 # Opacity of the map (0=transparent, 1=opaque)
    background_map_api_key: YOUR_API_KEY # Optional, for some providers
```

| Option                   | Description                                                                                                                | Values                                      | Default |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------- |
| `background_map`         | Type of map background. <br> - `system`: Auto-selects 'dark' or 'color' style to match Home Assistant or system Dark Mode. | `system`, `bw`, `color`, `dark`, `outlines` | `none`  |
| `background_map_opacity` | Opacity for background map (0 [visible] to 1 [transparent]).                                                               | 0–1 (float)                                 | 0       |
| `background_map_api_key` | API key for selected tile provider (optional, for providers that require it).                                              | string (optional)                           | –       |

-   **`system`**: Automatically uses a dark map (`dark`) in dark mode and a standard colored map (`color`) in light mode, matching your Home Assistant or operating system theme.
-   **`bw`**: Black-and-white (Stamen Toner)
-   **`color`**: Standard OpenStreetMap (colored)
-   **`dark`**: Dark theme map (CartoDB)
-   **`outlines`**: Geographic outlines only

Example:

```yaml
radar:
    background_map: color
    background_map_opacity: 0.5
```

If `background_map` is configured, the selected map is rendered beneath the radar graphics. Use transparency to blend the map with the radar background color.

#### List Configuration

Configure flight list settings with the `list` option.

```yaml
list:
    hide: true
    showListStatus: true
```

| Name             | Description                                                                       | Default Value | Constraints               |
| ---------------- | --------------------------------------------------------------------------------- | ------------- | ------------------------- |
| `hide`           | Option to hide the flight list below the radar card                               | `false`       | Must be `true` or `false` |
| `showListStatus` | Show a summary/status line above the list showing flights listed and total count. | `false`       | Must be `true` or `false` |

**Note:** When `list.hide` is enabled, the detailed flight list will not be displayed.

#### Annotation Configuration

Control how single fields are rendered based on conditions. Add annotations to highlight certain flights based on custom criteria.

```yaml
annotate:
    - field: aircraft_registration
      render: <i>${aircraft_registration}</i>
      conditions:
          - field: aircraft_registration
            comparator: oneOf
            value: [LN-NIE, PH-EXV]
```

| Name         | Description                           | Default Value | Constraints                                |
| ------------ | ------------------------------------- | ------------- | ------------------------------------------ |
| `field`      | Flight field to be annotated          | None          | Must be a valid flight field name          |
| `render`     | Template for rendering the annotation | None          | Must be a valid javascript template string |
| `conditions` | List of conditions for annotation     | None          | Must be a list of condition objects        |

#### Toggles Configuration

Toggle buttons control flags which can be used by the filters. Add toggle buttons to dynamically control your filters.

```yaml
toggles:
    list_all:
        label: List all
        default: false
filter:
    - type: OR
      conditions:
          - defined: list_all
            defaultValue: false
            comparator: eq
            value: true
          - type: OR
            conditions:
                - field: distance_to_tracker
                  comparator: lte
                  value: 15
                - type: AND
                  conditions:
                      - field: closest_passing_distance
                        comparator: lte
                        value: 15
                      - field: is_approaching
                        comparator: eq
                        value: true
                - field: altitude
                  comparator: lte
                  value: 2500
```

| Name      | Description                                            | Default Value | Constraints               |
| --------- | ------------------------------------------------------ | ------------- | ------------------------- |
| `[key]:`  | key: Name of the property to be defined by this toggle | None          | Must be a string          |
| `label`   | Label for the toggle button                            | None          | Must be a string          |
| `default` | Default state of the toggle                            | `false`       | Must be `true` or `false` |

#### Defines Configuration

Use the defines option to create reusable condition values.

```yaml
defines:
    aircraftsOfDisinterest:
        - Helicopter
        - LocalPilot1
filter:
    - type: NOT
      condition:
          type: OR
          conditions:
              - field: aircraft_model
                comparator: containsOneOf
                value: ${aircraftsOfDisinterest}
              - field: callsign
                comparator: containsOneOf
                value: ${aircraftsOfDisinterest}
```

| Name             | Description                               | Default Value | Constraints      |
| ---------------- | ----------------------------------------- | ------------- | ---------------- |
| `[key]: [value]` | key: Name of the property to be defined   | None          | Must be a string |
|                  | value: The value for the defined property | None          | None             |

#### Templates Configuration

The `templates` configuration option allows you to customize the HTML templates used for rendering various parts of the flight information displayed on the card. You can define your own HTML templates for different elements such as icons, flight information, aircraft information, departure and arrival details, route information, flight status, position status, and proximity information.

By default, the card comes with predefined templates for each element. However, you can override these defaults or add new templates according to your preferences.

| Template Name           | Description                                                                                 | Default Value                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `img_element`           | HTML template for rendering the image element of the aircraft.                              | `${flight.aircraft_photo_small ? '<img style="float: right; width: 120px; height: auto; marginLeft: 8px; border: 1px solid black;" src="${flight.aircraft_photo_small}" />' : ""}`                                                                                                   |
| `icon`                  | Template for defining the icon to be displayed based on flight altitude and vertical speed. | `${flight.altitude > 0 ? (flight.vertical_speed > 100 ? "airplane-takeoff" : flight.vertical_speed < -100 ? "airplane-landing" : "airplane") : "airport"}`                                                                                                                           |
| `icon_element`          | HTML template for rendering the icon element.                                               | `<ha-icon style="float: left;" icon="mdi:${tpl.icon}"></ha-icon>`                                                                                                                                                                                                                    |
| `flight_info`           | Template for displaying basic flight information like airline, flight number, and callsign. | `${joinList(" - ")(flight.airline_short, flight.flight_number, flight.callsign !== flight.flight_number ? flight.callsign : "")}`                                                                                                                                                    |
| `flight_info_element`   | HTML template for rendering the flight information element.                                 | `<div style="font-weight: bold; padding-left: 5px; padding-top: 5px;">${tpl.flight_info}</div>`                                                                                                                                                                                      |
| `header`                | HTML template for rendering the header section of the flight card.                          | `<div>${tpl.img_element}${tpl.icon_element}${tpl.flight_info_element}</div>`                                                                                                                                                                                                         |
| `aircraft_info`         | Template for displaying aircraft registration and model information.                        | `${joinList(" - ")(flight.aircraft_registration, flight.aircraft_model)}`                                                                                                                                                                                                            |
| `aircraft_info_element` | HTML template for rendering the aircraft information element.                               | `` ${tpl.aircraft_info ? `<div>${tpl.aircraft_info}</div>` : ""}  ``                                                                                                                                                                                                                 |
| `departure_info`        | Template for displaying departure time information.                                         | `` ${flight.altitude === 0 && flight.time_scheduled_departure ? ` (${new Date(flight.time_scheduled_departure * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}  ``                                                                                    |
| `origin_info`           | Template for displaying origin airport information.                                         | `${joinList("")(flight.airport_origin_code_iata, tpl.departure_info, flight.origin_flag)}`                                                                                                                                                                                           |
| `arrival_info`          | Template for displaying arrival airport information.                                        |                                                                                                                                                                                                                                                                                      |
| `destination_info`      | Template for displaying destination airport information.                                    | `${joinList("")(flight.airport_destination_code_iata, tpl.arrival_info, flight.destination_flag)}`                                                                                                                                                                                   |
| `route_info`            | Template for displaying the flight route information.                                       | `${joinList(" -> ")(tpl.origin_info, tpl.destination_info)}`                                                                                                                                                                                                                         |
| `route_element`         | HTML template for rendering the route information element.                                  | `<div>${tpl.route_info}</div>`                                                                                                                                                                                                                                                       |
| `alt_info`              | Template for displaying altitude information.                                               | `${flight.alt_in_unit ? "Alt: " + flight.alt_in_unit + flight.climb_descend_indicator : undefined}`                                                                                                                                                                                  |
| `spd_info`              | Template for displaying altitude information.                                               | `${flight.spd_in_unit ? "Spd: " + flight.spd_in_unit : undefined}`                                                                                                                                                                                                                   |
| `hdg_info`              | Template for displaying heading information.                                                | `${flight.heading ? "Hdg: " + flight.heading + "°" : undefined}`                                                                                                                                                                                                                     |
| `dist_info`             | Template for displaying altitude information.                                               | `${flight.dist_in_unit ? "Dist: " + flight.dist_in_unit + flight.approach_indicator : undefined}`                                                                                                                                                                                    |
| `flight_status`         | Template for displaying flight status information like altitude, speed, and heading.        | `<div>${joinList(" - ")(tpl.alt_info, tpl.spd_info, tpl.hdg_info)}</div>`                                                                                                                                                                                                            |
| `position_status`       | Template for displaying flight position status information like distance and direction.     | `<div>${joinList(" - ")(tpl.dist_info, flight.direction_info)}</div>`                                                                                                                                                                                                                |
| `proximity_info`        | Template for displaying proximity information when the flight is approaching.               | `<div style="font-weight: bold; font-style: italic;">${flight.is_approaching && flight.ground_speed > 70 && flight.closest_passing_distance < 15 ? 'Closest Distance: ${flight.closest_passing_distance} ${units.distance}, ETA: ${flight.eta_to_closest_distance} min' : ""}</div>` |
| `flight_element`        | HTML template for rendering the complete flight element.                                    | `${tpl.header}${tpl.aircraft_info_element}${tpl.route_element}${tpl.flight_status}${tpl.position_status}${tpl.proximity_info}`                                                                                                                                                       |
| `radar_range`           | Template for displaying the current radar range in the radar view.                          | `Range: ${radar_range} ${units.distance}`                                                                                                                                                                                                                                            |

**Note:** The template used when rendering flights is the `flight_element` template. The default `flight_element` consist of the templates for `header`, `aircraft_info_element`, `route_element`, `flight_status`, `position_status` and `proximity_info`.

You can customize each template by providing your own javascript template string building HTML structure and using placeholders like `${flight.property}` to dynamically insert flight data into the template. For example, `${flight.aircraft_photo_small}` will be replaced with the URL of the small aircraft photo. Refer to the [Flightradar24 integration documentation](https://github.com/AlexandrErohin/home-assistant-flightradar24?tab=readme-ov-file#flight-fields) for a list of valid flight fields.

You can reference the result other templates as `tpl.[name of template]`.
You can reference configured units as `unit.[unit name]`.

In addition you will find these fields defined

| Field                                   | Description                                                                                                                                                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| origin_flag                             |                                                                                                                                                                                                                                                                                          |
| destination_flag                        |                                                                                                                                                                                                                                                                                          |
| climb_descend_indicator                 | Arrow pointing up or down to indicate vertical speed exceeding 100 ft/minute                                                                                                                                                                                                             |
| alt_in_unit                             | Altitude given in the configured altitude unit                                                                                                                                                                                                                                           |
| spd_in_unit                             | Speed given in the configured speed unit                                                                                                                                                                                                                                                 |
| dist_in_unit                            | Distance from observer given in the configured distance unit                                                                                                                                                                                                                             |
| heading_from_tracker                    | Heading from tracker to flight                                                                                                                                                                                                                                                           |
| cardinal_direction_from_tracker         | Cardinal direction (N, NW, W, SW, S, SE, E, NE) from tracker to flight                                                                                                                                                                                                                   |
| is_approaching                          | Boolean to indicate if the aircraft is approaching the tracker                                                                                                                                                                                                                           |
| approach_indicator                      | Arrow pointing up or down to indicate if the aircraft is approaching the tracker                                                                                                                                                                                                         |
| closest_passing_distance                | Distance from tracker to calculated closest point between tracker and flight (available if is_approaching is true) in configured distance unit                                                                                                                                           |
| eta_to_closest_distance                 | Time until flight reaches calculated closest point between tracker and flight in minutes                                                                                                                                                                                                 |
| heading_from_tracker_to_closest_passing | Heading from tracker to calculated closest point between tracker and flight                                                                                                                                                                                                              |
| is_landing                              | True if the flight is approaching and has a projected landing point before closest point between tracker and flight, in which case closest_passing_distance, eta_to_closest_distance and heading_from_tracker_to_closest_passing will be calculated based on the projected landing point |

## Usage

### Features

The Flightradar24 Integration Card offers the following features:

-   Display real-time flight data from Flightradar24.
-   Customizable radar view with range, projection interval, and colors.
-   Add custom locations, runways, and geographic outlines.
-   Filter flights based on various criteria.
-   Annotate specific flights with custom conditions.
-   Toggle options to control flight visibility.

### Examples

#### Example: Lists all aircraft in the air with a toggle button to also display aircraft on the ground (altitude <= 0)

Note: Radar will show all tracked flights

```yaml
type: custom:flightradar24-card
toggles:
    show_on_ground:
        label: Show aircraft on the ground
        default: false
filter:
    - type: OR
      conditions:
          - field: altitude
            comparator: gt
            value: 0
          - defined: show_on_ground
            comparator: eq
            value: true
```

#### Example: List aircraft currently visible on radar

```yaml
type: custom:flightradar24-card
filter:
    - field: distance_to_tracker
      comparator: lte
      value: ${radar_range}
```

Note: Depending on your layout and system, there may be unwanted flickering or repositioning of elements as you zoom flights in or out of the active range. To avoid this, set the flag `updateRangeFilterOnTouchEnd` to true to only update the filtered list after the pinch/zoom action stops.

```yaml
type: custom:flightradar24-card
updateRangeFilterOnTouchEnd: true
filter:
    - field: distance_to_tracker
      comparator: lte
      value: ${radar_range}
```

#### Example: List all aircraft from a given airline ("Delta" in this example), with no radar

```yaml
type: custom:flightradar24-card
filter:
    - field: airline_short
      comparator: eq
      value: Delta
radar:
    hide: true
```

#### Example: List all approaching and overhead B747 or A380s with toggles to show/hide either

![Template with toggles](resources/example_templates_747_a380_toggle.PNG 'Example')

Note: Radar will show all tracked flights

```yaml
type: custom:flightradar24-card
defines:
    boeing_747_icao_codes:
        - B741
        - B742
        - B743
        - BLCF
        - B74S
        - B74R
        - B748
        - B744
        - B748
toggles:
    show_b747s:
        label: 747s
        default: true
    show_a380s:
        label: A380s
        default: true
filter:
    - type: AND
      conditions:
          - type: OR
            conditions:
                - type: AND
                  conditions:
                      - field: aircraft_code
                        comparator: oneOf
                        value: ${boeing_747_icao_codes}
                      - defined: show_b747s
                        comparator: eq
                        value: true
                - type: AND
                  conditions:
                      - field: aircraft_code
                        comparator: eq
                        value: A388
                      - defined: show_a380s
                        comparator: eq
                        value: true
    - type: OR
      conditions:
          - field: is_approaching
            comparator: eq
            value: true
          - field: distance_to_tracker
            comparator: lt
            value: 10
```

#### Example: Change the flight template to display a tail image instead of airplane icon

![Template with tails](resources/example_templates_tails_dark.PNG 'Example')

```yaml
type: custom:flightradar24-card
templates:
    tail_image: >-
        <img style="float: left; margin-right: 5px;"
        src="https://content.airhex.com/content/logos/airlines_${flight.airline_icao}_90_90_f.png?proportions=keep"
        />
    header: ${tpl.tail_image}${tpl.flight_info_element}
```

Note: Here we add a new tail_image template, and update the header template (which previously referenced the icon template) to include our new tail_image template.

## Support

For support, you can:

-   Open an issue on the GitHub repository.
-   Join the Home Assistant community forums and ask for help in the relevant threads.
-   Check the documentation for more details and troubleshooting tips.

Feel free to reach out if you encounter any issues or have suggestions for improvements. Your feedback is highly appreciated!
