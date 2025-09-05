"""ESA Lunar Time (LTC) implementation - Version 3.0.
Improved config options with descriptive timezone dropdowns and better structure.

ESA's proposed Lunar Time Coordinated (LTC) system for future lunar missions.
Includes support for lunar timezones and notable landing sites.
"""
from __future__ import annotations

from datetime import datetime, timezone
import math
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (60 seconds = 1 minute)
UPDATE_INTERVAL = 60

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "lunar_time",
    "version": "3.0.0",
    "icon": "mdi:moon-waxing-crescent",
    "category": "space",
    "accuracy": "scientific",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "ESA Lunar Time",
        "de": "ESA Mondzeit",
        "es": "Hora Lunar ESA",
        "fr": "Temps Lunaire ESA",
        "it": "Tempo Lunare ESA",
        "nl": "ESA Maantijd",
        "pt": "Tempo Lunar ESA",
        "ru": "Лунное время ESA",
        "ja": "ESA月面時間",
        "zh": "ESA月球时间",
        "ko": "ESA 달 시간"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Lunar Time Coordinated (LTC) for future Moon missions",
        "de": "Lunar Time Coordinated (LTC) für zukünftige Mondmissionen",
        "es": "Tiempo Lunar Coordinado (LTC) para futuras misiones lunares",
        "fr": "Temps Lunaire Coordonné (LTC) pour les futures missions lunaires",
        "it": "Tempo Lunare Coordinato (LTC) per future missioni lunari",
        "nl": "Lunar Time Coordinated (LTC) voor toekomstige maanmissies",
        "pt": "Tempo Lunar Coordenado (LTC) para futuras missões lunares",
        "ru": "Координированное лунное время (LTC) для будущих лунных миссий",
        "ja": "将来の月面ミッションのための月面協定時（LTC）",
        "zh": "未来月球任务的协调月球时间（LTC）",
        "ko": "미래 달 임무를 위한 달 협정시(LTC)"
    },
    
    # Lunar-specific data
    "lunar_data": {
        # Time dilation effect (Moon clocks run faster than Earth)
        "time_dilation_us_per_day": 56,  # microseconds per day
        
        # Lunar timezones with descriptive information
        "timezones": {
            # Standard zones
            "LTC": {
                "offset": 0,
                "name": "Lunar Time Coordinated",
                "dropdown_label": {
                    "en": "LTC - Lunar Time Coordinated (Prime Meridian 0°)",
                    "de": "LTC - Lunar Time Coordinated (Nullmeridian 0°)",
                    "es": "LTC - Tiempo Lunar Coordinado (Meridiano Principal 0°)",
                    "fr": "LTC - Temps Lunaire Coordonné (Méridien Principal 0°)",
                    "it": "LTC - Tempo Lunare Coordinato (Meridiano Primo 0°)",
                    "nl": "LTC - Lunar Time Coordinated (Nulmeridiaan 0°)",
                    "pt": "LTC - Tempo Lunar Coordenado (Meridiano Principal 0°)",
                    "ru": "LTC - Координированное лунное время (Нулевой меридиан 0°)",
                    "ja": "LTC - 月面協定時（本初子午線 0°）",
                    "zh": "LTC - 月球协调时间（本初子午线 0°）",
                    "ko": "LTC - 달 협정시 (본초 자오선 0°)"
                }
            },
            
            # Apollo landing sites
            "LTC+2": {
                "offset": 2,
                "name": "Mare Tranquillitatis Time",
                "site": "Apollo 11",
                "dropdown_label": {
                    "en": "LTC+2 - Apollo 11 Site (Sea of Tranquility ~31°E)",
                    "de": "LTC+2 - Apollo 11 Landeplatz (Meer der Ruhe ~31°O)",
                    "es": "LTC+2 - Sitio Apollo 11 (Mar de la Tranquilidad ~31°E)",
                    "fr": "LTC+2 - Site Apollo 11 (Mer de la Tranquillité ~31°E)",
                    "it": "LTC+2 - Sito Apollo 11 (Mare della Tranquillità ~31°E)",
                    "nl": "LTC+2 - Apollo 11 Locatie (Zee van de Rust ~31°O)",
                    "pt": "LTC+2 - Local Apollo 11 (Mar da Tranquilidade ~31°L)",
                    "ru": "LTC+2 - Место посадки Аполлон-11 (Море Спокойствия ~31°В)",
                    "ja": "LTC+2 - アポロ11号着陸地点（静かの海 ~東経31°）",
                    "zh": "LTC+2 - 阿波罗11号着陆点（静海 ~东经31°）",
                    "ko": "LTC+2 - 아폴로 11호 착륙지 (고요의 바다 ~동경 31°)"
                }
            },
            "LTC-2": {
                "offset": -2,
                "name": "Oceanus Procellarum Time",
                "site": "Apollo 12",
                "dropdown_label": {
                    "en": "LTC-2 - Apollo 12 Site (Ocean of Storms ~23°W)",
                    "de": "LTC-2 - Apollo 12 Landeplatz (Ozean der Stürme ~23°W)",
                    "es": "LTC-2 - Sitio Apollo 12 (Océano de las Tormentas ~23°O)",
                    "fr": "LTC-2 - Site Apollo 12 (Océan des Tempêtes ~23°O)",
                    "it": "LTC-2 - Sito Apollo 12 (Oceano delle Tempeste ~23°O)",
                    "nl": "LTC-2 - Apollo 12 Locatie (Oceaan der Stormen ~23°W)",
                    "pt": "LTC-2 - Local Apollo 12 (Oceano das Tempestades ~23°O)",
                    "ru": "LTC-2 - Место посадки Аполлон-12 (Океан Бурь ~23°З)",
                    "ja": "LTC-2 - アポロ12号着陸地点（嵐の大洋 ~西経23°）",
                    "zh": "LTC-2 - 阿波罗12号着陆点（风暴洋 ~西经23°）",
                    "ko": "LTC-2 - 아폴로 12호 착륙지 (폭풍의 바다 ~서경 23°)"
                }
            },
            "LTC-1": {
                "offset": -1,
                "name": "Fra Mauro Time",
                "site": "Apollo 14",
                "dropdown_label": {
                    "en": "LTC-1 - Apollo 14 Site (Fra Mauro ~17°W)",
                    "de": "LTC-1 - Apollo 14 Landeplatz (Fra Mauro ~17°W)",
                    "es": "LTC-1 - Sitio Apollo 14 (Fra Mauro ~17°O)",
                    "fr": "LTC-1 - Site Apollo 14 (Fra Mauro ~17°O)",
                    "it": "LTC-1 - Sito Apollo 14 (Fra Mauro ~17°O)",
                    "nl": "LTC-1 - Apollo 14 Locatie (Fra Mauro ~17°W)",
                    "pt": "LTC-1 - Local Apollo 14 (Fra Mauro ~17°O)",
                    "ru": "LTC-1 - Место посадки Аполлон-14 (Фра Мауро ~17°З)",
                    "ja": "LTC-1 - アポロ14号着陸地点（フラ・マウロ ~西経17°）",
                    "zh": "LTC-1 - 阿波罗14号着陆点（弗拉·毛罗 ~西经17°）",
                    "ko": "LTC-1 - 아폴로 14호 착륙지 (프라 마우로 ~서경 17°)"
                }
            },
            "LTC+1": {
                "offset": 1,
                "name": "Hadley Rille Time",
                "site": "Apollo 15",
                "dropdown_label": {
                    "en": "LTC+1 - Apollo 15 Site (Hadley Rille ~26°E)",
                    "de": "LTC+1 - Apollo 15 Landeplatz (Hadley-Rille ~26°O)",
                    "es": "LTC+1 - Sitio Apollo 15 (Hadley Rille ~26°E)",
                    "fr": "LTC+1 - Site Apollo 15 (Hadley Rille ~26°E)",
                    "it": "LTC+1 - Sito Apollo 15 (Hadley Rille ~26°E)",
                    "nl": "LTC+1 - Apollo 15 Locatie (Hadley Rille ~26°O)",
                    "pt": "LTC+1 - Local Apollo 15 (Hadley Rille ~26°L)",
                    "ru": "LTC+1 - Место посадки Аполлон-15 (Борозда Хэдли ~26°В)",
                    "ja": "LTC+1 - アポロ15号着陸地点（ハドリー谷 ~東経26°）",
                    "zh": "LTC+1 - 阿波罗15号着陆点（哈德利谷 ~东经26°）",
                    "ko": "LTC+1 - 아폴로 15호 착륙지 (해들리 릴 ~동경 26°)"
                }
            },
            "LTC+3": {
                "offset": 3,
                "name": "Taurus-Littrow Time",
                "site": "Apollo 17",
                "dropdown_label": {
                    "en": "LTC+3 - Apollo 17 Site (Taurus-Littrow Valley ~31°E)",
                    "de": "LTC+3 - Apollo 17 Landeplatz (Taurus-Littrow-Tal ~31°O)",
                    "es": "LTC+3 - Sitio Apollo 17 (Valle Taurus-Littrow ~31°E)",
                    "fr": "LTC+3 - Site Apollo 17 (Vallée Taurus-Littrow ~31°E)",
                    "it": "LTC+3 - Sito Apollo 17 (Valle Taurus-Littrow ~31°E)",
                    "nl": "LTC+3 - Apollo 17 Locatie (Taurus-Littrow Vallei ~31°O)",
                    "pt": "LTC+3 - Local Apollo 17 (Vale Taurus-Littrow ~31°L)",
                    "ru": "LTC+3 - Место посадки Аполлон-17 (Долина Таурус-Литтров ~31°В)",
                    "ja": "LTC+3 - アポロ17号着陸地点（タウルス・リトロー谷 ~東経31°）",
                    "zh": "LTC+3 - 阿波罗17号着陆点（陶拉斯-利特罗山谷 ~东经31°）",
                    "ko": "LTC+3 - 아폴로 17호 착륙지 (타우루스-리트로 계곡 ~동경 31°)"
                }
            },
            
            # Chinese missions
            "LTC+12": {
                "offset": 12,
                "name": "Von Kármán Crater Time",
                "site": "Chang'e 4",
                "dropdown_label": {
                    "en": "LTC+12 - Chang'e 4 Site (Von Kármán Crater, Far Side ~177°E)",
                    "de": "LTC+12 - Chang'e 4 Landeplatz (Von-Kármán-Krater, Rückseite ~177°O)",
                    "es": "LTC+12 - Sitio Chang'e 4 (Cráter Von Kármán, Cara Oculta ~177°E)",
                    "fr": "LTC+12 - Site Chang'e 4 (Cratère Von Kármán, Face Cachée ~177°E)",
                    "it": "LTC+12 - Sito Chang'e 4 (Cratere Von Kármán, Faccia Nascosta ~177°E)",
                    "nl": "LTC+12 - Chang'e 4 Locatie (Von Kármán Krater, Achterkant ~177°O)",
                    "pt": "LTC+12 - Local Chang'e 4 (Cratera Von Kármán, Lado Oculto ~177°L)",
                    "ru": "LTC+12 - Место посадки Чанъэ-4 (Кратер фон Кармана, Обратная сторона ~177°В)",
                    "ja": "LTC+12 - 嫦娥4号着陸地点（フォン・カルマン・クレーター、裏側 ~東経177°）",
                    "zh": "LTC+12 - 嫦娥四号着陆点（冯·卡门撞击坑，月球背面 ~东经177°）",
                    "ko": "LTC+12 - 창어 4호 착륙지 (폰 카르만 분화구, 뒷면 ~동경 177°)"
                }
            },
            "LTC+4": {
                "offset": 4,
                "name": "Oceanus Procellarum North",
                "site": "Chang'e 5",
                "dropdown_label": {
                    "en": "LTC+4 - Chang'e 5 Site (Oceanus Procellarum North ~51°W)",
                    "de": "LTC+4 - Chang'e 5 Landeplatz (Ozean der Stürme Nord ~51°W)",
                    "es": "LTC+4 - Sitio Chang'e 5 (Océano de las Tormentas Norte ~51°O)",
                    "fr": "LTC+4 - Site Chang'e 5 (Océan des Tempêtes Nord ~51°O)",
                    "it": "LTC+4 - Sito Chang'e 5 (Oceano delle Tempeste Nord ~51°O)",
                    "nl": "LTC+4 - Chang'e 5 Locatie (Oceaan der Stormen Noord ~51°W)",
                    "pt": "LTC+4 - Local Chang'e 5 (Oceano das Tempestades Norte ~51°O)",
                    "ru": "LTC+4 - Место посадки Чанъэ-5 (Океан Бурь Север ~51°З)",
                    "ja": "LTC+4 - 嫦娥5号着陸地点（嵐の大洋北部 ~西経51°）",
                    "zh": "LTC+4 - 嫦娥五号着陆点（风暴洋北部 ~西经51°）",
                    "ko": "LTC+4 - 창어 5호 착륙지 (폭풍의 바다 북부 ~서경 51°)"
                }
            },
            
            # Soviet missions
            "LTC-4": {
                "offset": -4,
                "name": "Mare Imbrium Time",
                "site": "Luna 17/Lunokhod 1",
                "dropdown_label": {
                    "en": "LTC-4 - Luna 17 Site (Mare Imbrium ~35°W)",
                    "de": "LTC-4 - Luna 17 Landeplatz (Regenmeer ~35°W)",
                    "es": "LTC-4 - Sitio Luna 17 (Mare Imbrium ~35°O)",
                    "fr": "LTC-4 - Site Luna 17 (Mer des Pluies ~35°O)",
                    "it": "LTC-4 - Sito Luna 17 (Mare Imbrium ~35°O)",
                    "nl": "LTC-4 - Luna 17 Locatie (Regenzee ~35°W)",
                    "pt": "LTC-4 - Local Luna 17 (Mar das Chuvas ~35°O)",
                    "ru": "LTC-4 - Место посадки Луна-17 (Море Дождей ~35°З)",
                    "ja": "LTC-4 - ルナ17号着陸地点（雨の海 ~西経35°）",
                    "zh": "LTC-4 - 月球17号着陆点（雨海 ~西经35°）",
                    "ko": "LTC-4 - 루나 17호 착륙지 (비의 바다 ~서경 35°)"
                }
            },
            
            # Future mission sites
            "LTC_SOUTH": {
                "offset": 0,
                "name": "Lunar South Pole Time",
                "site": "Artemis Base",
                "dropdown_label": {
                    "en": "LTC South - Lunar South Pole (Artemis Base Camp)",
                    "de": "LTC Süd - Mond-Südpol (Artemis-Basislager)",
                    "es": "LTC Sur - Polo Sur Lunar (Base Artemis)",
                    "fr": "LTC Sud - Pôle Sud Lunaire (Camp de Base Artemis)",
                    "it": "LTC Sud - Polo Sud Lunare (Campo Base Artemis)",
                    "nl": "LTC Zuid - Maan Zuidpool (Artemis Basiskamp)",
                    "pt": "LTC Sul - Polo Sul Lunar (Base Artemis)",
                    "ru": "LTC Юг - Лунный южный полюс (База Артемида)",
                    "ja": "LTC南極 - 月面南極（アルテミス基地）",
                    "zh": "LTC南极 - 月球南极（阿尔忒弥斯基地）",
                    "ko": "LTC 남극 - 달 남극 (아르테미스 기지)"
                }
            }
        },
        
        # Lunar phases for reference
        "phases": [
            {"name": "New Moon", "emoji": "🌑", "illumination": 0},
            {"name": "Waxing Crescent", "emoji": "🌒", "illumination": 0.25},
            {"name": "First Quarter", "emoji": "🌓", "illumination": 0.5},
            {"name": "Waxing Gibbous", "emoji": "🌔", "illumination": 0.75},
            {"name": "Full Moon", "emoji": "🌕", "illumination": 1.0},
            {"name": "Waning Gibbous", "emoji": "🌖", "illumination": 0.75},
            {"name": "Last Quarter", "emoji": "🌗", "illumination": 0.5},
            {"name": "Waning Crescent", "emoji": "🌘", "illumination": 0.25}
        ],
        
        # ESA Lunar Time epoch (proposed start date)
        "epoch": {
            "earth_date": "2025-01-01T00:00:00Z",
            "description": "Proposed LTC epoch start"
        },
        
        # Lunar calendar months (for reference)
        "lunar_months": [
            "Lunarius", "Cynthius", "Selenius", "Artemius",
            "Dianius", "Phoebius", "Hecatius", "Mensius",
            "Noctius", "Crescentius", "Gibbosius", "Plenius"
        ]
    },
    
    # Configuration options for config_flow
    "config_options": {
        "timezone": {
            "type": "select",
            "default": "LTC",
            "options": ["LTC", "LTC+1", "LTC+2", "LTC+3", "LTC+4", "LTC+12", "LTC-1", "LTC-2", "LTC-4", "LTC_SOUTH"],
            "label": {
                "en": "Lunar Timezone",
                "de": "Mond-Zeitzone",
                "es": "Zona horaria lunar",
                "fr": "Fuseau horaire lunaire",
                "it": "Fuso orario lunare",
                "nl": "Maan tijdzone",
                "pt": "Fuso horário lunar",
                "ru": "Лунный часовой пояс",
                "ja": "月面タイムゾーン",
                "zh": "月球时区",
                "ko": "달 시간대"
            },
            "description": {
                "en": "Select lunar timezone or historic landing site",
                "de": "Wähle Mond-Zeitzone oder historischen Landeplatz",
                "es": "Selecciona zona horaria lunar o sitio de alunizaje histórico",
                "fr": "Sélectionnez le fuseau horaire lunaire ou le site d'alunissage historique",
                "it": "Seleziona fuso orario lunare o sito di allunaggio storico",
                "nl": "Selecteer maan tijdzone of historische landingsplaats",
                "pt": "Selecione fuso horário lunar ou local de pouso histórico",
                "ru": "Выберите лунный часовой пояс или историческое место посадки",
                "ja": "月面タイムゾーンまたは歴史的着陸地点を選択",
                "zh": "选择月球时区或历史着陆点",
                "ko": "달 시간대 또는 역사적 착륙 지점 선택"
            }
        },
        "show_phase": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Lunar Phase",
                "de": "Mondphase anzeigen",
                "es": "Mostrar fase lunar",
                "fr": "Afficher la phase lunaire",
                "it": "Mostra fase lunare",
                "nl": "Toon maanfase",
                "pt": "Mostrar fase lunar",
                "ru": "Показать фазу Луны",
                "ja": "月相を表示",
                "zh": "显示月相",
                "ko": "달의 위상 표시"
            },
            "description": {
                "en": "Display current lunar phase with emoji",
                "de": "Zeige aktuelle Mondphase mit Emoji",
                "es": "Mostrar fase lunar actual con emoji",
                "fr": "Afficher la phase lunaire actuelle avec emoji",
                "it": "Mostra la fase lunare attuale con emoji",
                "nl": "Toon huidige maanfase met emoji",
                "pt": "Mostrar fase lunar atual com emoji",
                "ru": "Показывать текущую фазу Луны с эмодзи",
                "ja": "現在の月相を絵文字で表示",
                "zh": "用表情符号显示当前月相",
                "ko": "이모지로 현재 달의 위상 표시"
            }
        },
        "show_lunar_day": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Lunar Day",
                "de": "Mondtag anzeigen",
                "es": "Mostrar día lunar",
                "fr": "Afficher le jour lunaire",
                "it": "Mostra giorno lunare",
                "nl": "Toon maandag",
                "pt": "Mostrar dia lunar",
                "ru": "Показать лунный день",
                "ja": "太陰日を表示",
                "zh": "显示阴历日",
                "ko": "음력일 표시"
            },
            "description": {
                "en": "Show lunar day number (1-30)",
                "de": "Zeige Mondtag-Nummer (1-30)",
                "es": "Mostrar número de día lunar (1-30)",
                "fr": "Afficher le numéro du jour lunaire (1-30)",
                "it": "Mostra numero del giorno lunare (1-30)",
                "nl": "Toon maandag nummer (1-30)",
                "pt": "Mostrar número do dia lunar (1-30)",
                "ru": "Показывать номер лунного дня (1-30)",
                "ja": "太陰日番号を表示（1-30）",
                "zh": "显示阴历日数（1-30）",
                "ko": "음력일 번호 표시 (1-30)"
            }
        },
        "show_earth_time": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Earth Time",
                "de": "Erdzeit anzeigen",
                "es": "Mostrar hora terrestre",
                "fr": "Afficher l'heure terrestre",
                "it": "Mostra ora terrestre",
                "nl": "Toon Aardse tijd",
                "pt": "Mostrar hora terrestre",
                "ru": "Показать земное время",
                "ja": "地球時間を表示",
                "zh": "显示地球时间",
                "ko": "지구 시간 표시"
            },
            "description": {
                "en": "Display corresponding Earth UTC time",
                "de": "Zeige entsprechende Erd-UTC-Zeit",
                "es": "Mostrar hora UTC terrestre correspondiente",
                "fr": "Afficher l'heure UTC terrestre correspondante",
                "it": "Mostra l'ora UTC terrestre corrispondente",
                "nl": "Toon overeenkomstige Aardse UTC tijd",
                "pt": "Mostrar hora UTC terrestre correspondente",
                "ru": "Показывать соответствующее земное время UTC",
                "ja": "対応する地球のUTC時間を表示",
                "zh": "显示对应的地球UTC时间",
                "ko": "해당하는 지구 UTC 시간 표시"
            }
        },
        "show_time_dilation": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Show Time Dilation",
                "de": "Zeitdilatation anzeigen",
                "es": "Mostrar dilatación temporal",
                "fr": "Afficher la dilatation temporelle",
                "it": "Mostra dilatazione temporale",
                "nl": "Toon tijddilatatie",
                "pt": "Mostrar dilatação temporal",
                "ru": "Показать замедление времени",
                "ja": "時間の遅れを表示",
                "zh": "显示时间膨胀",
                "ko": "시간 팽창 표시"
            },
            "description": {
                "en": "Show time dilation effect (56 μs/day)",
                "de": "Zeige Zeitdilatationseffekt (56 μs/Tag)",
                "es": "Mostrar efecto de dilatación temporal (56 μs/día)",
                "fr": "Afficher l'effet de dilatation temporelle (56 μs/jour)",
                "it": "Mostra effetto di dilatazione temporale (56 μs/giorno)",
                "nl": "Toon tijddilatatie effect (56 μs/dag)",
                "pt": "Mostrar efeito de dilatação temporal (56 μs/dia)",
                "ru": "Показывать эффект замедления времени (56 мкс/день)",
                "ja": "時間の遅れ効果を表示（56μs/日）",
                "zh": "显示时间膨胀效应（56微秒/天）",
                "ko": "시간 팽창 효과 표시 (56 μs/일)"
            }
        }
    },
    
    # Additional metadata
    "reference_url": "https://www.esa.int/Applications/Navigation/Telling_time_on_the_Moon",
    "documentation_url": "https://www.esa.int/",
    "origin": "European Space Agency (ESA)",
    "created_by": "ESA Navigation Support Office",
    "introduced": "2023 (Proposed)",
    
    # Related calendars
    "related": ["mars", "darian", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "space", "lunar", "moon", "esa", "scientific",
        "artemis", "apollo", "change", "luna", "future", 
        "coordinated", "ltc"
    ],
    
    # Extended notes
    "notes": {
        "en": (
            "ESA's proposed Lunar Time Coordinated (LTC) system for future Moon missions. "
            "Moon clocks run 56 microseconds per day faster than Earth due to gravitational time dilation. "
            "Timezones include historic Apollo, Chang'e, and Luna landing sites."
        ),
        "de": (
            "ESAs vorgeschlagenes Lunar Time Coordinated (LTC) System für zukünftige Mondmissionen. "
            "Monduhren laufen aufgrund der gravitativen Zeitdilatation 56 Mikrosekunden pro Tag schneller als auf der Erde. "
            "Zeitzonen umfassen historische Apollo-, Chang'e- und Luna-Landeplätze."
        ),
        "zh": (
            "欧空局提出的月球协调时间（LTC）系统，用于未来的月球任务。"
            "由于引力时间膨胀，月球时钟每天比地球快56微秒。"
            "时区包括历史性的阿波罗、嫦娥和月球号着陆点。"
        )
    }
}


# ============================================
# SENSOR CLASS
# ============================================

class LunarTimeSensor(AlternativeTimeSensorBase):
    """Sensor for displaying ESA Lunar Time."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Lunar Time sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'ESA Lunar Time')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_lunar_time"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:moon-waxing-crescent")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._timezone = config_defaults.get("timezone", {}).get("default", "LTC")
        self._show_phase = config_defaults.get("show_phase", {}).get("default", True)
        self._show_lunar_day = config_defaults.get("show_lunar_day", {}).get("default", True)
        self._show_earth_time = config_defaults.get("show_earth_time", {}).get("default", True)
        self._show_time_dilation = config_defaults.get("show_time_dilation", {}).get("default", False)
        
        # Lunar data
        self._lunar_data = CALENDAR_INFO["lunar_data"]
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        # Initialize state
        self._state = None
        self._lunar_time = {}
        
        _LOGGER.debug(f"Initialized Lunar Time sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self._get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Lunar Time options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                timezone=plugin_options.get("timezone"),
                show_phase=plugin_options.get("show_phase"),
                show_lunar_day=plugin_options.get("show_lunar_day"),
                show_earth_time=plugin_options.get("show_earth_time"),
                show_time_dilation=plugin_options.get("show_time_dilation")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Lunar Time sensor added to hass with options: "
                     f"timezone={self._timezone}, phase={self._show_phase}, "
                     f"lunar_day={self._show_lunar_day}, earth_time={self._show_earth_time}")
    
    def set_options(
        self,
        *,
        timezone: Optional[str] = None,
        show_phase: Optional[bool] = None,
        show_lunar_day: Optional[bool] = None,
        show_earth_time: Optional[bool] = None,
        show_time_dilation: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if timezone is not None:
            if timezone in self._lunar_data.get("timezones", {}):
                self._timezone = timezone
                _LOGGER.debug(f"Set timezone to: {timezone}")
            else:
                _LOGGER.warning(f"Invalid timezone: {timezone}, keeping {self._timezone}")
        
        if show_phase is not None:
            self._show_phase = bool(show_phase)
            _LOGGER.debug(f"Set show_phase to: {show_phase}")
        
        if show_lunar_day is not None:
            self._show_lunar_day = bool(show_lunar_day)
            _LOGGER.debug(f"Set show_lunar_day to: {show_lunar_day}")
        
        if show_earth_time is not None:
            self._show_earth_time = bool(show_earth_time)
            _LOGGER.debug(f"Set show_earth_time to: {show_earth_time}")
        
        if show_time_dilation is not None:
            self._show_time_dilation = bool(show_time_dilation)
            _LOGGER.debug(f"Set show_time_dilation to: {show_time_dilation}")
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Lunar-specific attributes
        if self._lunar_time:
            attrs.update(self._lunar_time)
            
            # Add metadata
            attrs["calendar_type"] = "ESA Lunar Time"
            attrs["accuracy"] = CALENDAR_INFO.get("accuracy", "scientific")
            attrs["reference"] = CALENDAR_INFO.get("reference_url")
            attrs["notes"] = self._translate("notes")
            
            # Add timezone info
            if self._timezone in self._lunar_data["timezones"]:
                tz_info = self._lunar_data["timezones"][self._timezone]
                attrs["timezone_name"] = tz_info.get("name", self._timezone)
                if "site" in tz_info:
                    attrs["landing_site"] = tz_info["site"]
            
            # Add configuration state
            attrs["config_timezone"] = self._timezone
            attrs["config_show_phase"] = self._show_phase
            attrs["config_show_lunar_day"] = self._show_lunar_day
            attrs["config_show_earth_time"] = self._show_earth_time
            attrs["config_show_time_dilation"] = self._show_time_dilation
        
        return attrs
    
    def _calculate_lunar_phase(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate current lunar phase."""
        # Lunar phase calculation (simplified)
        # Using synodic month = 29.530588853 days
        
        # Reference: New Moon on Jan 6, 2000, 18:14 UTC
        reference = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)
        
        # Calculate days since reference
        if earth_date.tzinfo is None:
            earth_date = earth_date.replace(tzinfo=timezone.utc)
        
        diff = (earth_date - reference).total_seconds() / 86400
        
        # Calculate phase (0 = new moon, 0.5 = full moon)
        synodic_month = 29.530588853
        phase = (diff % synodic_month) / synodic_month
        
        # Determine phase name and emoji
        phases = self._lunar_data["phases"]
        if phase < 0.0625:
            phase_data = phases[0]  # New Moon
        elif phase < 0.1875:
            phase_data = phases[1]  # Waxing Crescent
        elif phase < 0.3125:
            phase_data = phases[2]  # First Quarter
        elif phase < 0.4375:
            phase_data = phases[3]  # Waxing Gibbous
        elif phase < 0.5625:
            phase_data = phases[4]  # Full Moon
        elif phase < 0.6875:
            phase_data = phases[5]  # Waning Gibbous
        elif phase < 0.8125:
            phase_data = phases[6]  # Last Quarter
        elif phase < 0.9375:
            phase_data = phases[7]  # Waning Crescent
        else:
            phase_data = phases[0]  # New Moon
        
        # Calculate lunar day (1-30)
        lunar_day = int(phase * 29.53) + 1
        
        # Calculate illumination percentage
        illumination = abs(math.cos(phase * 2 * math.pi))
        
        return {
            "phase": phase,
            "phase_name": phase_data["name"],
            "phase_emoji": phase_data["emoji"],
            "lunar_day": lunar_day,
            "illumination": round(illumination * 100, 1)
        }
    
    def _calculate_lunar_time(self, earth_utc: datetime) -> Dict[str, Any]:
        """Calculate ESA Lunar Time from Earth UTC."""
        # Get epoch
        epoch_str = self._lunar_data["epoch"]["earth_date"]
        epoch = datetime.fromisoformat(epoch_str.replace('Z', '+00:00'))
        
        if earth_utc.tzinfo is None:
            earth_utc = earth_utc.replace(tzinfo=timezone.utc)
        
        # Calculate seconds since epoch
        seconds_since_epoch = (earth_utc - epoch).total_seconds()
        
        # Apply time dilation (Moon clocks run faster)
        # 56 microseconds per day = 56/86400000000 per second
        dilation_factor = 1 + (self._lunar_data["time_dilation_us_per_day"] / 86400000000)
        lunar_seconds = seconds_since_epoch * dilation_factor
        
        # Calculate lunar time components
        lunar_days = int(lunar_seconds // 86400)
        remaining_seconds = lunar_seconds % 86400
        
        # Get timezone offset
        tz_data = self._lunar_data["timezones"].get(self._timezone, {"offset": 0})
        offset_seconds = tz_data["offset"] * 3600
        
        # Apply timezone offset
        adjusted_seconds = remaining_seconds + offset_seconds
        
        # Handle day boundary crossing
        if adjusted_seconds >= 86400:
            adjusted_seconds -= 86400
            lunar_days += 1
        elif adjusted_seconds < 0:
            adjusted_seconds += 86400
            lunar_days -= 1
        
        # Calculate time components
        hours = int(adjusted_seconds // 3600)
        minutes = int((adjusted_seconds % 3600) // 60)
        seconds = int(adjusted_seconds % 60)
        
        # Format time
        ltc_time = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
        # Calculate lunar phase
        phase_info = self._calculate_lunar_phase(earth_utc)
        
        # Calculate which lunar month we're in
        lunar_month_index = (lunar_days // 30) % 12
        lunar_month_day = (lunar_days % 30) + 1
        lunar_month = self._lunar_data["lunar_months"][lunar_month_index]
        
        # Build result
        result = {
            "ltc_time": ltc_time,
            "lunar_days_since_epoch": lunar_days,
            "lunar_month": lunar_month,
            "lunar_month_day": lunar_month_day,
            "timezone": self._timezone,
            "timezone_offset": tz_data["offset"],
            "full_display": f"{ltc_time} {self._timezone}"
        }
        
        # Add lunar day if enabled
        if self._show_lunar_day:
            result["lunar_day"] = phase_info["lunar_day"]
            result["full_display"] += f" | LD {phase_info['lunar_day']}"
        
        # Add phase if enabled
        if self._show_phase:
            result["phase_name"] = phase_info["phase_name"]
            result["phase_emoji"] = phase_info["phase_emoji"]
            result["illumination"] = phase_info["illumination"]
            result["full_display"] += f" | {phase_info['phase_emoji']}"
        
        # Add Earth time if enabled
        if self._show_earth_time:
            result["earth_utc"] = earth_utc.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        # Add time dilation if enabled
        if self._show_time_dilation:
            microseconds_gained = (lunar_seconds - seconds_since_epoch) * 1000000
            result["time_dilation_us"] = round(microseconds_gained, 2)
            result["time_dilation_days"] = round(microseconds_gained / (self._lunar_data["time_dilation_us_per_day"] * lunar_days) if lunar_days > 0 else 0, 2)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now(timezone.utc)
        self._lunar_time = self._calculate_lunar_time(now)
        
        # Set state to formatted lunar time
        self._state = self._lunar_time.get("full_display", "Unknown")
        
        _LOGGER.debug(f"Updated Lunar Time to {self._state}")


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["LunarTimeSensor"]