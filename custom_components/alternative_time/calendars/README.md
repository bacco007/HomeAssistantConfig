# Alternative Time Systems for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub Release](https://img.shields.io/github/release/Lexorius/alternative_time.svg)](https://github.com/Lexorius/alternative_time/releases)
[![GitHub Activity](https://img.shields.io/github/commit-activity/y/Lexorius/alternative_time.svg)](https://github.com/Lexorius/alternative_time/commits/main)
[![License](https://img.shields.io/github/license/Lexorius/alternative_time.svg)](LICENSE)

A comprehensive Home Assistant integration providing 30+ alternative time systems from science, science fiction, fantasy, history, religion, and various cultures. From Stardate to Maya Calendar, from Middle-earth to Discworld, from ancient Egypt to modern Mars missions - this integration transforms your Home Assistant into a universal time machine.

## 🎯 Overview

Transform your Home Assistant into a multiversal clock supporting:
- 🚀 **Science Fiction** (Star Trek, Star Wars, EVE Online, Warhammer 40K)
- 🧙 **Fantasy Worlds** (Tolkien, Elder Scrolls, Discworld, Warcraft)
- 🏛️ **Historical Calendars** (Maya, Egyptian, Attic, Roman, French Revolutionary)
- 🔴 **Mars Colonization** (Darian Calendar, Mars Time Zones)
- 🌍 **Cultural Calendars** (Islamic, Thai, Taiwanese, Chinese)
- 💻 **Technical Formats** (Unix, Hexadecimal, Julian Date, Swatch Internet Time)
- 🎖️ **Military Systems** (NATO DTG in multiple formats)

## 📦 Installation

### Via HACS (Recommended)

1. Open HACS in your Home Assistant installation
2. Click the three dots in the top right corner
3. Select "Custom repositories"
4. Add URL: `https://github.com/Lexorius/alternative_time`
5. Select "Integration" as category
6. Click "Add"
7. Search for "Alternative Time Systems" and install
8. Restart Home Assistant

### Manual Installation

1. Download the `alternative_time` folder from the repository
2. Copy it to your `/config/custom_components/` directory
3. Restart Home Assistant

## ⚙️ Configuration

### Via User Interface (Config Flow 2.5)

1. Go to **Settings** → **Devices & Services**
2. Click **Add Integration**
3. Search for **Alternative Time Systems**
4. Follow the enhanced configuration wizard:
   - **Step 1**: Name your instance
   - **Step 2**: Select categories (Technical, Historical, Cultural, etc.)
   - **Step 3**: Choose calendars from each category
   - **Step 4**: Configure calendar-specific options
5. Click **Submit**

### 🎨 New Features in Version 2.5

- **Category-based Selection**: Calendars organized by type for easier navigation
- **Detailed Previews**: See description, update interval, and accuracy for each calendar
- **Plugin Options**: Configure individual calendars with specific settings
- **Device Grouping**: Calendars automatically grouped by category in the UI
- **Multi-language Support**: Full translations for 11+ languages
- **Smart Defaults**: System timezone auto-detected for timezone-based calendars

### 💡 Multiple Instances

Create themed time displays:
- **Sci-Fi Command Center**: Star Trek, Star Wars, EVE Online
- **Fantasy Realm**: Middle-earth, Tamriel, Discworld
- **Historical Museum**: Egyptian, Maya, Roman, Attic
- **Mars Mission Control**: All Mars time systems
- **World Clock**: Different Earth timezones
- **Military Operations**: All NATO formats

## 🌟 Available Time Systems (30+)

### 🚀 Science Fiction

#### **Stardate (Star Trek TNG)**
- **Format**: `[41]XXX.X` (e.g., `[41]986.0`)
- **Features**: TNG-style calculation, configurable year offset
- **Update**: Every 10 seconds

#### **Star Wars Galactic Calendar** 🆕
- **Format**: `35:3:21 GrS | Taungsday | Expansion Week`
- **Features**: 
  - Galactic Standard Calendar
  - 10 months, 7 weeks, 5 days per week
  - 368-day year with holidays
- **Update**: Hourly

#### **EVE Online Time**
- **Format**: `YC 127.03.15 14:30:45`
- **Features**: New Eden Standard Time, YC dating
- **Update**: Every second

#### **Warhammer 40K Imperial Dating** 🆕
- **Format**: `0.523.025.M42`
- **Features**:
  - Check number (accuracy indicator)
  - Year fraction (1000 parts)
  - Millennium designation
  - Configurable year offset for grimdark future
- **Update**: Every 5 minutes

### 🧙 Fantasy Calendars

#### **Middle-earth Collection**
- **Shire Calendar**: Hobbit time with 7 meals
- **Calendar of Imladris**: Elvish 6-season year
- **Calendar of Gondor**: Númenórean system 🆕
- **All with**: Special days, moon phases, events

#### **Elder Scrolls (Tamriel)**
- **Format**: `4E 201, 17 Last Seed (Fredas)`
- **Features**: 8-day weeks, Divine blessings, Daedric influence
- **Update**: Hourly

#### **Discworld Calendar**
- **Format**: `Century of the Anchovy, UC 25, 32 Offle`
- **Features**: 
  - Impossible dates (32nd of months)
  - Death quotes at midnight
  - Guild influences
  - L-Space anomalies
- **Update**: Hourly

#### **World of Warcraft Calendar** 🆕
- **Format**: `Year 35, Day of the Wisp, 4th of Deepwood`
- **Features**: Azeroth dates, seasonal events, moon phases
- **Update**: Hourly

### 🏛️ Historical Calendars

#### **Ancient Egyptian**
- **Format**: `Dynasty 1 Year 25, 𓊖 15 Thoth`
- **Features**: Hieroglyphic numbers, 3 seasons, Nile status
- **Update**: Hourly

#### **Maya Long Count**
- **Format**: `13.0.12.1.15 | 8 Ahau | 3 Pop`
- **Features**: Long Count, Tzolk'in, Haab calendars
- **Update**: Hourly

#### **Roman Calendar** 🆕
- **Format**: `a.d. XVII Kal. Ian. MMDCCLXXVIII A.U.C.`
- **Features**: 
  - Kalends, Nones, Ides system
  - Roman numerals
  - Consular dating
  - A.U.C. (from founding of Rome)
- **Update**: Hourly

#### **Attic Calendar**
- **Format**: `5 histamenou Hekatombaion | Ol.700.2`
- **Features**: Archon years, Olympiad counting
- **Update**: Hourly

#### **French Revolutionary Calendar**
- **Decimal Time**: 10 hours/day, 100 minutes/hour
- **Republican Calendar**: Revolutionary months 🆕
- **Update**: Every second

### ☪️ Religious Calendars

#### **Islamic (Hijri) Calendar** 🆕
- **Format**: `15 Ramadan 1447 AH`
- **Features**:
  - Tabular calculation method
  - Arabic month names
  - Islamic holidays
  - Configurable offset for local sighting
- **Update**: Hourly

#### **Hebrew Calendar** 🆕
- **Format**: `15 Tishrei 5785`
- **Features**: Jewish holidays, Sabbath indication
- **Update**: Hourly

#### **Chinese Calendar** 🆕
- **Format**: `甲辰年 十月 十五 | Wood Dragon`
- **Features**: 
  - Lunar calendar
  - Zodiac animals
  - Heavenly stems & Earthly branches
- **Update**: Hourly

### 🌍 Cultural Calendars

#### **Suriyakati (Thai Buddhist)**
- **Format**: `๒๕ ธันวาคม ๒๕๖๘`
- **Features**: Buddhist Era (BE = CE + 543), Thai numerals
- **Update**: Hourly

#### **Minguo (Taiwan/ROC)**
- **Format**: `民國114年 十二月 二十五日`
- **Features**: Republic Era (Year 1 = 1912 CE)
- **Update**: Hourly

### 🔴 Mars Time Systems

#### **Darian Calendar**
- **Format**: `Sol 15 Gemini 217`
- **Features**: 24 months, 668 sols per year
- **Update**: Hourly

#### **Mars Time with Zones**
- **Format**: `14:25:30 Olympus Mons | Sol 234/MY36`
- **Features**: 24 Mars timezones, sol tracking
- **Update**: Every 30 seconds

### 💻 Technical Formats

#### **Unix Timestamp**
- **Format**: `1735689600`
- **Update**: Every second

#### **Swatch Internet Time**
- **Format**: `@750.00`
- **Features**: 1000 beats per day, no timezones
- **Update**: Every second

#### **Hexadecimal Time**
- **Format**: `.8000`
- **Features**: Day in 65536 parts
- **Update**: Every 5 seconds

#### **Julian Date**
- **Format**: `2460000.50000`
- **Update**: Every minute

### 🎖️ Military Time

- **NATO Basic**: `151430`
- **NATO DTG**: `151430Z JAN 25`
- **NATO Rescue**: `15 1430 JANUAR 25`
- **Update**: Every second

## 📊 Dashboard Examples

### Sci-Fi Command Center
```yaml
type: vertical-stack
cards:
  - type: markdown
    content: |
      # 🚀 Sci-Fi Command Center
      **Stardate:** {{ states('sensor.scifi_stardate') }}
      **Star Wars:** {{ states('sensor.scifi_star_wars') }}
      **EVE Online:** {{ states('sensor.scifi_eve_online') }}
      **Warhammer 40K:** {{ states('sensor.scifi_warhammer40k_imperial') }}
      
  - type: entities
    title: Multiversal Time Systems
    entities:
      - entity: sensor.scifi_stardate
        name: USS Enterprise
      - entity: sensor.scifi_star_wars
        name: Coruscant Time
      - entity: sensor.scifi_eve_online
        name: New Eden
      - entity: sensor.scifi_warhammer40k_imperial
        name: Terra (M42)
```

### Fantasy Realms Dashboard
```yaml
type: vertical-stack
cards:
  - type: entities
    title: 🧙 Fantasy Worlds
    entities:
      - entity: sensor.fantasy_shire
        name: The Shire
      - entity: sensor.fantasy_rivendell
        name: Rivendell
      - entity: sensor.fantasy_gondor
        name: Minas Tirith
      - entity: sensor.fantasy_tamriel
        name: Tamriel
      - entity: sensor.fantasy_discworld
        name: Ankh-Morpork
      - entity: sensor.fantasy_warcraft
        name: Azeroth
```

### Historical Museum
```yaml
type: vertical-stack
cards:
  - type: markdown
    content: |
      # 🏛️ Historical Time Systems
      **Ancient Egypt:** {{ states('sensor.history_egyptian') }}
      **Maya Long Count:** {{ states('sensor.history_maya_calendar') }}
      **Roman Date:** {{ states('sensor.history_roman') }}
      **Athens:** {{ states('sensor.history_attic_calendar') }}
```

## 🤖 Enhanced Automations

### Multi-Calendar Holiday Notification
```yaml
automation:
  - alias: "Universal Holiday Detector"
    trigger:
      - platform: state
        entity_id:
          - sensor.fantasy_shire
          - sensor.fantasy_tamriel
          - sensor.cultural_suriyakati
          - sensor.religious_islamic
    condition:
      - condition: template
        value_template: >
          {{ 'Festival' in trigger.to_state.state or
             'Holiday' in trigger.to_state.state or
             'Birthday' in trigger.to_state.state }}
    action:
      - service: notify.mobile_app
        data:
          title: "🎉 Holiday Alert"
          message: "{{ trigger.to_state.attributes.friendly_name }}: {{ trigger.to_state.state }}"
```

### Warhammer 40K Daily Thought
```yaml
automation:
  - alias: "Imperial Thought for the Day"
    trigger:
      - platform: time
        at: "06:00:00"
    action:
      - service: notify.mobile_app
        data:
          title: "⚔️ Imperial Date {{ states('sensor.scifi_warhammer40k_imperial') }}"
          message: "The Emperor protects. Thought for the day: {{ ['Faith is your shield', 'Vigilance is your sword', 'Knowledge is power, guard it well'] | random }}"
```

## 🎨 Version 2.5 Architecture

### Standardized Calendar Format
Each calendar follows the unified `CALENDAR_INFO` structure:
- **Metadata**: ID, version, icon, category, accuracy
- **Multi-language**: Names and descriptions in 11+ languages
- **Calendar Data**: Months, weeks, special dates, events
- **Configuration Options**: Customizable per calendar
- **Update Intervals**: Optimized for each calendar type

### Categories
- **technical**: Unix, Swatch, Hexadecimal, Decimal
- **historical**: Egyptian, Maya, Roman, Attic
- **cultural**: Thai, Taiwan, Chinese
- **religious**: Islamic, Hebrew
- **space**: Mars calendars
- **fantasy**: Middle-earth, Tamriel, Discworld
- **scifi**: Star Trek, Star Wars, EVE, Warhammer
- **military**: NATO formats

## 🚀 Performance Optimization

| Category | Update Interval | Calendars |
|----------|-----------------|-----------|
| Real-time | 1 second | Unix, Swatch, Timezones |
| Near real-time | 5-10 seconds | Hexadecimal, Stardate |
| Time-based | 30-60 seconds | Mars Time, Julian Date |
| Date-based | 1 hour | All calendar systems |
| Event-based | 5 minutes | Warhammer 40K |

## 📈 Version History

### v2.5.0 (Current) 🆕
- ⚡ **Complete Architecture Rewrite**
- 🎨 **Standardized Calendar Format**
- 🌍 **Multi-language Support** (11+ languages)
- 📁 **Category-based Organization**
- ⚙️ **Enhanced Config Flow** with plugin options
- 🔧 **Per-calendar Configuration**
- 📱 **Device Grouping** by category
- ⏱️ **Async Performance** improvements
- 🆕 **New Calendars**:
  - Islamic (Hijri) Calendar
  - Star Wars Galactic Calendar
  - Warhammer 40K Imperial Dating
  - Roman Calendar
  - World of Warcraft Calendar

### Previous Versions
- **v1.6.0**: Tamriel, Egyptian, Discworld calendars
- **v1.5.0**: EVE Online, Shire, Imladris calendars
- **v1.4.0**: Mars time systems
- **v1.3.0**: Asian calendars, Attic calendar
- **v1.2.0**: NATO time formats
- **v1.1.0**: Maya calendar, async improvements
- **v1.0.0**: Initial release

## 🔮 Planned Features


### Future Calendars
- [ ] **More Sci-Fi**: Doctor Who, The Expanse, Dune, Battlestar Galactica
- [ ] **More Fantasy**: Game of Thrones, Wheel of Time, D&D Forgotten Realms
- [ ] **More Historical**: Aztec, Babylonian, Celtic, Norse
- [ ] **More Religious**: Hindu, Zoroastrian, Bahá'í
- [ ] **Fictional**: Hitchhiker's Guide, Foundation, Culture series

## 🛠️ Development

### Adding a New Calendar

1. Create `calendars/your_calendar.py`
2. Follow the standardized format (see [Calendar Format Documentation](docs/CALENDAR_FORMAT.md))
3. Include `CALENDAR_INFO` dictionary with all metadata
4. Implement sensor class extending `AlternativeTimeSensorBase`
5. Test thoroughly
6. Submit PR

### Development Setup
```bash
# Clone repository
git clone https://github.com/Lexorius/alternative_time.git
cd alternative_time

# Link to Home Assistant
ln -s $(pwd)/custom_components/alternative_time /config/custom_components/

# Enable debug logging
echo "logger:
  default: info
  logs:
    custom_components.alternative_time: debug" >> /config/configuration.yaml

# Restart and watch logs
ha core restart && tail -f /config/home-assistant.log | grep alternative_time
```



### How to Contribute
1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewCalendar`)
3. Follow the calendar format specification
4. Add tests and documentation
5. Submit Pull Request

### Code Quality
- Follow Python PEP 8
- Use type hints
- Add docstrings
- Include unit tests
- Update README

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

### Special Thanks
- **Home Assistant Community** for the amazing platform
- **All Contributors** who've added calendars and features
- **Beta Testers** for finding bugs and suggesting improvements

### Calendar Inspirations
- **Fiction Authors**: Tolkien, Pratchett, Lucas, Roddenberry
- **Game Studios**: Bethesda, Blizzard, CCP Games, Games Workshop
- **Ancient Civilizations**: Egypt, Maya, Greece, Rome
- **Modern Cultures**: Thailand, Taiwan, Islamic nations
- **Space Agencies**: NASA, ESA for Mars missions
- **Standards Organizations**: NATO, Unicode Consortium

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/Lexorius/alternative_time/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Lexorius/alternative_time/discussions)
- **Wiki**: [Documentation Wiki](https://github.com/Lexorius/alternative_time/wiki)
- **Discord**: [Community Server](https://discord.gg/alternative-time)

## 🌐 Resources

- [Star Trek Stardate](http://trekguide.com/Stardates.htm)
- [Swatch Internet Time](https://www.swatch.com/en-us/internet-time.html)
- [Maya Calendar Converter](https://maya.nmai.si.edu/calendar/maya-calendar-converter)
- [Islamic Calendar](https://www.islamicfinder.org/islamic-calendar/)
- [Mars Time](https://mars.nasa.gov/mars24/)
- [Tolkien Gateway](http://tolkiengateway.net/wiki/Calendar)
- [UESP Elder Scrolls](https://en.uesp.net/wiki/Lore:Calendar)
- [Discworld Wiki](https://wiki.lspace.org/Calendar)
- [Warhammer 40K Lexicanum](https://wh40k.lexicanum.com/wiki/Imperial_Dating_System)

---

**Made with ❤️ by [Lexorius](https://github.com/Lexorius) and the Community**

*"Time is an illusion. Lunchtime doubly so. But in the grim darkness of the far future, there is only lunch." - The Multiversal Time Traveler's Guide*