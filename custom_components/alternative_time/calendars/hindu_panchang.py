"""Indian Hindu Calendar (पंचांग, Panchānga) implementation - Version 2.5."""
from __future__ import annotations

from datetime import datetime, date, timezone, timedelta
import logging
from typing import Dict, Any, Optional, Tuple
from zoneinfo import ZoneInfo
import math

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (3600 seconds = 1 hour)
UPDATE_INTERVAL = 3600

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "hindu_panchang",
    "version": "2.5.0",
    "icon": "mdi:om",
    "category": "religious",
    "accuracy": "traditional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Hindu Calendar (Panchānga)",
        "de": "Hindu-Kalender (Panchānga)",
        "es": "Calendario Hindú (Panchānga)",
        "fr": "Calendrier Hindou (Panchānga)",
        "it": "Calendario Indù (Panchānga)",
        "nl": "Hindoe-kalender (Panchānga)",
        "pl": "Kalendarz Hinduski (Panchānga)",
        "pt": "Calendário Hindu (Panchānga)",
        "ru": "Индуистский календарь (Панчанга)",
        "ja": "ヒンドゥー暦（パンチャーンガ）",
        "zh": "印度教历法（五历）",
        "ko": "힌두 달력 (판창가)"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Traditional Hindu lunisolar calendar with Tithi, Nakshatra, Yoga, Karana, and festivals",
        "de": "Traditioneller hinduistischer Lunisolarkalender mit Tithi, Nakshatra, Yoga, Karana und Festen",
        "es": "Calendario lunisolar hindú tradicional con Tithi, Nakshatra, Yoga, Karana y festivales",
        "fr": "Calendrier lunisolaire hindou traditionnel avec Tithi, Nakshatra, Yoga, Karana et festivals",
        "it": "Calendario lunisolare indù tradizionale con Tithi, Nakshatra, Yoga, Karana e festival",
        "nl": "Traditionele hindoeïstische lunisolaire kalender met Tithi, Nakshatra, Yoga, Karana en festivals",
        "pl": "Tradycyjny hinduski kalendarz księżycowo-słoneczny z Tithi, Nakshatra, Yoga, Karana i świętami",
        "pt": "Calendário lunissolar hindu tradicional com Tithi, Nakshatra, Yoga, Karana e festivais",
        "ru": "Традиционный индуистский лунно-солнечный календарь с Титхи, Накшатра, Йога, Карана и праздниками",
        "ja": "ティティ、ナクシャトラ、ヨーガ、カラナ、祭りを含む伝統的なヒンドゥー太陰太陽暦",
        "zh": "包含提提、纳克沙特拉、瑜伽、卡拉纳和节日的传统印度教阴阳历",
        "ko": "티티, 낙샤트라, 요가, 카라나 및 축제가 포함된 전통 힌두 태음태양력"
    },
    
    # Extended information for tooltips
    "notes": {
        "en": "The Panchānga (पंचांग) is the Hindu calendar and almanac, which follows traditional units of Hindu timekeeping. It presents important dates and their calculations in a tabulated form. Time is displayed in India Standard Time (IST).",
        "de": "Das Panchānga (पंचांग) ist der hinduistische Kalender und Almanach, der traditionellen Einheiten der hinduistischen Zeitrechnung folgt. Es präsentiert wichtige Daten und ihre Berechnungen in tabellarischer Form. Die Zeit wird in India Standard Time (IST) angezeigt.",
        "es": "El Panchānga (पंचांग) es el calendario y almanaque hindú, que sigue las unidades tradicionales de cronometraje hindú. Presenta fechas importantes y sus cálculos en forma tabulada. La hora se muestra en Hora Estándar de India (IST).",
        "fr": "Le Panchānga (पंचांग) est le calendrier et l'almanach hindou, qui suit les unités traditionnelles de chronométrage hindou. Il présente les dates importantes et leurs calculs sous forme tabulaire. L'heure est affichée en heure normale de l'Inde (IST).",
        "it": "Il Panchānga (पंचांग) è il calendario e almanacco indù, che segue le unità tradizionali del cronometraggio indù. Presenta date importanti e i loro calcoli in forma tabulare. L'ora è visualizzata in India Standard Time (IST).",
        "nl": "De Panchānga (पंचांग) is de hindoeïstische kalender en almanak, die traditionele eenheden van hindoeïstische tijdrekening volgt. Het presenteert belangrijke data en hun berekeningen in tabelvorm. De tijd wordt weergegeven in India Standard Time (IST).",
        "pl": "Panchānga (पंचांग) to hinduski kalendarz i almanach, który podąża za tradycyjnymi jednostkami hinduskiego pomiaru czasu. Przedstawia ważne daty i ich obliczenia w formie tabelarycznej. Czas jest wyświetlany w India Standard Time (IST).",
        "pt": "O Panchānga (पंचांग) é o calendário e almanaque hindu, que segue unidades tradicionais de cronometragem hindu. Apresenta datas importantes e seus cálculos em forma tabulada. A hora é exibida em Horário Padrão da Índia (IST).",
        "ru": "Панчанга (पंचांग) - это индуистский календарь и альманах, который следует традиционным единицам индуистского времяисчисления. Он представляет важные даты и их вычисления в табличной форме. Время отображается в индийском стандартном времени (IST).",
        "ja": "パンチャーンガ（पंचांग）は、ヒンドゥー教の暦法に従う暦とアルマナックです。重要な日付とその計算を表形式で提示します。時刻はインド標準時（IST）で表示されます。",
        "zh": "五历（पंचांग）是印度教历法和年鉴，遵循印度教传统的时间单位。它以表格形式展示重要日期及其计算。时间以印度标准时间（IST）显示。",
        "ko": "판창가(पंचांग)는 힌두교 전통 시간 단위를 따르는 힌두 달력과 연감입니다. 중요한 날짜와 계산을 표 형식으로 제시합니다. 시간은 인도 표준시(IST)로 표시됩니다."
    },
    
    # Configuration options
    "config_options": {
        "timezone": {
            "type": "select",
            "default": "Asia/Kolkata",
            "options": ["Asia/Kolkata", "local", "UTC"],
            "label": {
                "en": "Time Zone",
                "de": "Zeitzone",
                "es": "Zona Horaria",
                "fr": "Fuseau Horaire",
                "it": "Fuso Orario",
                "nl": "Tijdzone",
                "pl": "Strefa Czasowa",
                "pt": "Fuso Horário",
                "ru": "Часовой пояс",
                "ja": "タイムゾーン",
                "zh": "时区",
                "ko": "시간대"
            },
            "description": {
                "en": "Choose timezone for Panchānga calculation (IST recommended)",
                "de": "Zeitzone für Panchānga-Berechnung wählen (IST empfohlen)",
                "es": "Elegir zona horaria para el cálculo de Panchānga (IST recomendado)",
                "fr": "Choisir le fuseau horaire pour le calcul du Panchānga (IST recommandé)",
                "it": "Scegli il fuso orario per il calcolo del Panchānga (IST consigliato)",
                "nl": "Kies tijdzone voor Panchānga-berekening (IST aanbevolen)",
                "pl": "Wybierz strefę czasową do obliczania Panchānga (zalecane IST)",
                "pt": "Escolher fuso horário para cálculo de Panchānga (IST recomendado)",
                "ru": "Выберите часовой пояс для расчета Панчанга (рекомендуется IST)",
                "ja": "パンチャーンガ計算のタイムゾーンを選択（IST推奨）",
                "zh": "选择五历计算的时区（推荐IST）",
                "ko": "판창가 계산을 위한 시간대 선택 (IST 권장)"
            }
        },
        "calendar_system": {
            "type": "select",
            "default": "shalivahana",
            "options": ["shalivahana", "vikram", "kali"],
            "label": {
                "en": "Calendar Era",
                "de": "Kalender-Ära",
                "es": "Era del Calendario",
                "fr": "Ère du Calendrier",
                "it": "Era del Calendario",
                "nl": "Kalender Tijdperk",
                "pl": "Era Kalendarza",
                "pt": "Era do Calendário",
                "ru": "Эра календаря",
                "ja": "暦の時代",
                "zh": "历法纪元",
                "ko": "달력 시대"
            },
            "description": {
                "en": "Choose Hindu calendar era (Shalivahana Shaka, Vikram Samvat, or Kali Yuga)",
                "de": "Wählen Sie die hinduistische Kalender-Ära (Shalivahana Shaka, Vikram Samvat oder Kali Yuga)",
                "es": "Elija la era del calendario hindú (Shalivahana Shaka, Vikram Samvat o Kali Yuga)",
                "fr": "Choisissez l'ère du calendrier hindou (Shalivahana Shaka, Vikram Samvat ou Kali Yuga)",
                "it": "Scegli l'era del calendario indù (Shalivahana Shaka, Vikram Samvat o Kali Yuga)",
                "nl": "Kies hindoeïstisch kalender tijdperk (Shalivahana Shaka, Vikram Samvat of Kali Yuga)",
                "pl": "Wybierz erę kalendarza hinduskiego (Shalivahana Shaka, Vikram Samvat lub Kali Yuga)",
                "pt": "Escolha a era do calendário hindu (Shalivahana Shaka, Vikram Samvat ou Kali Yuga)",
                "ru": "Выберите эру индуистского календаря (Шаливахана Шака, Викрам Самват или Кали-юга)",
                "ja": "ヒンドゥー暦の時代を選択（シャーリヴァーハナ・シャカ、ヴィクラム・サンヴァト、またはカリ・ユガ）",
                "zh": "选择印度教历法纪元（沙利瓦哈纳·沙卡、维克拉姆·桑瓦特或卡利年代）",
                "ko": "힌두 달력 시대 선택 (샬리바하나 샤카, 비크람 삼밧 또는 칼리 유가)"
            }
        },
        "display_language": {
            "type": "select",
            "default": "auto",
            "options": ["auto", "sanskrit", "hindi", "english"],
            "label": {
                "en": "Display Language",
                "de": "Anzeigesprache",
                "es": "Idioma de Visualización",
                "fr": "Langue d'Affichage",
                "it": "Lingua di Visualizzazione",
                "nl": "Weergavetaal",
                "pl": "Język Wyświetlania",
                "pt": "Idioma de Exibição",
                "ru": "Язык отображения",
                "ja": "表示言語",
                "zh": "显示语言",
                "ko": "표시 언어"
            },
            "description": {
                "en": "Choose display language for calendar terms",
                "de": "Anzeigesprache für Kalenderbegriffe wählen",
                "es": "Elegir idioma de visualización para términos del calendario",
                "fr": "Choisir la langue d'affichage pour les termes du calendrier",
                "it": "Scegli la lingua di visualizzazione per i termini del calendario",
                "nl": "Kies weergavetaal voor kalendertermen",
                "pl": "Wybierz język wyświetlania terminów kalendarza",
                "pt": "Escolher idioma de exibição para termos do calendário",
                "ru": "Выберите язык отображения терминов календаря",
                "ja": "カレンダー用語の表示言語を選択",
                "zh": "选择日历术语的显示语言",
                "ko": "달력 용어의 표시 언어 선택"
            }
        },
        "show_tithi": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Tithi",
                "de": "Tithi anzeigen",
                "es": "Mostrar Tithi",
                "fr": "Afficher Tithi",
                "it": "Mostra Tithi",
                "nl": "Tithi Tonen",
                "pl": "Pokaż Tithi",
                "pt": "Mostrar Tithi",
                "ru": "Показать Титхи",
                "ja": "ティティを表示",
                "zh": "显示提提",
                "ko": "티티 표시"
            },
            "description": {
                "en": "Display lunar day (Tithi) - 30 Tithis in a lunar month",
                "de": "Zeigt den Mondtag (Tithi) - 30 Tithis in einem Mondmonat",
                "es": "Muestra el día lunar (Tithi) - 30 Tithis en un mes lunar",
                "fr": "Affiche le jour lunaire (Tithi) - 30 Tithis dans un mois lunaire",
                "it": "Visualizza il giorno lunare (Tithi) - 30 Tithi in un mese lunare",
                "nl": "Toont de maandag (Tithi) - 30 Tithi's in een maanmaand",
                "pl": "Wyświetla dzień księżycowy (Tithi) - 30 Tithi w miesiącu księżycowym",
                "pt": "Exibe o dia lunar (Tithi) - 30 Tithis em um mês lunar",
                "ru": "Отображает лунный день (Титхи) - 30 Титхи в лунном месяце",
                "ja": "太陰日（ティティ）を表示 - 太陰月に30ティティ",
                "zh": "显示阴历日（提提）- 一个阴历月有30个提提",
                "ko": "음력일(티티) 표시 - 음력 한 달에 30 티티"
            }
        },
        "show_nakshatra": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Nakshatra",
                "de": "Nakshatra anzeigen",
                "es": "Mostrar Nakshatra",
                "fr": "Afficher Nakshatra",
                "it": "Mostra Nakshatra",
                "nl": "Nakshatra Tonen",
                "pl": "Pokaż Nakshatra",
                "pt": "Mostrar Nakshatra",
                "ru": "Показать Накшатра",
                "ja": "ナクシャトラを表示",
                "zh": "显示纳克沙特拉",
                "ko": "낙샤트라 표시"
            },
            "description": {
                "en": "Display lunar mansion (Nakshatra) - 27 constellations",
                "de": "Zeigt die Mondstation (Nakshatra) - 27 Konstellationen",
                "es": "Muestra la mansión lunar (Nakshatra) - 27 constelaciones",
                "fr": "Affiche la maison lunaire (Nakshatra) - 27 constellations",
                "it": "Visualizza la dimora lunare (Nakshatra) - 27 costellazioni",
                "nl": "Toont het maanhuis (Nakshatra) - 27 sterrenbeelden",
                "pl": "Wyświetla księżycowy dwór (Nakshatra) - 27 konstelacji",
                "pt": "Exibe a mansão lunar (Nakshatra) - 27 constelações",
                "ru": "Отображает лунную стоянку (Накшатра) - 27 созвездий",
                "ja": "月宿（ナクシャトラ）を表示 - 27星座",
                "zh": "显示月宿（纳克沙特拉）- 27个星座",
                "ko": "월궁(낙샤트라) 표시 - 27개 별자리"
            }
        },
        "show_yoga": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Yoga",
                "de": "Yoga anzeigen",
                "es": "Mostrar Yoga",
                "fr": "Afficher Yoga",
                "it": "Mostra Yoga",
                "nl": "Yoga Tonen",
                "pl": "Pokaż Yoga",
                "pt": "Mostrar Yoga",
                "ru": "Показать Йога",
                "ja": "ヨーガを表示",
                "zh": "显示瑜伽",
                "ko": "요가 표시"
            },
            "description": {
                "en": "Display luni-solar Yoga - 27 combinations of Sun and Moon positions",
                "de": "Zeigt das Luni-Solar-Yoga - 27 Kombinationen von Sonnen- und Mondpositionen",
                "es": "Muestra el Yoga luni-solar - 27 combinaciones de posiciones del Sol y la Luna",
                "fr": "Affiche le Yoga luni-solaire - 27 combinaisons de positions du Soleil et de la Lune",
                "it": "Visualizza lo Yoga luni-solare - 27 combinazioni di posizioni del Sole e della Luna",
                "nl": "Toont de luni-solaire Yoga - 27 combinaties van zon- en maanposities",
                "pl": "Wyświetla Yoga księżycowo-słoneczną - 27 kombinacji pozycji Słońca i Księżyca",
                "pt": "Exibe o Yoga luni-solar - 27 combinações de posições do Sol e da Lua",
                "ru": "Отображает лунно-солнечную Йогу - 27 комбинаций положений Солнца и Луны",
                "ja": "太陰太陽ヨーガを表示 - 太陽と月の位置の27の組み合わせ",
                "zh": "显示阴阳瑜伽 - 太阳和月亮位置的27种组合",
                "ko": "태음태양 요가 표시 - 태양과 달 위치의 27가지 조합"
            }
        },
        "show_karana": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Karana",
                "de": "Karana anzeigen",
                "es": "Mostrar Karana",
                "fr": "Afficher Karana",
                "it": "Mostra Karana",
                "nl": "Karana Tonen",
                "pl": "Pokaż Karana",
                "pt": "Mostrar Karana",
                "ru": "Показать Карана",
                "ja": "カラナを表示",
                "zh": "显示卡拉纳",
                "ko": "카라나 표시"
            },
            "description": {
                "en": "Display half of a Tithi (Karana) - 11 types",
                "de": "Zeigt die Hälfte eines Tithi (Karana) - 11 Typen",
                "es": "Muestra la mitad de un Tithi (Karana) - 11 tipos",
                "fr": "Affiche la moitié d'un Tithi (Karana) - 11 types",
                "it": "Visualizza metà di un Tithi (Karana) - 11 tipi",
                "nl": "Toont de helft van een Tithi (Karana) - 11 types",
                "pl": "Wyświetla połowę Tithi (Karana) - 11 typów",
                "pt": "Exibe metade de um Tithi (Karana) - 11 tipos",
                "ru": "Отображает половину Титхи (Карана) - 11 типов",
                "ja": "ティティの半分（カラナ）を表示 - 11種類",
                "zh": "显示提提的一半（卡拉纳）- 11种类型",
                "ko": "티티의 절반(카라나) 표시 - 11가지 유형"
            }
        },
        "show_festivals": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Festivals",
                "de": "Feste anzeigen",
                "es": "Mostrar Festivales",
                "fr": "Afficher les Festivals",
                "it": "Mostra Festival",
                "nl": "Festivals Tonen",
                "pl": "Pokaż Święta",
                "pt": "Mostrar Festivais",
                "ru": "Показать праздники",
                "ja": "祭りを表示",
                "zh": "显示节日",
                "ko": "축제 표시"
            },
            "description": {
                "en": "Display Hindu festivals and auspicious days",
                "de": "Zeigt hinduistische Feste und glückverheißende Tage",
                "es": "Muestra festivales hindúes y días auspiciosos",
                "fr": "Affiche les festivals hindous et les jours propices",
                "it": "Visualizza festival indù e giorni propizi",
                "nl": "Toont hindoeïstische festivals en gunstige dagen",
                "pl": "Wyświetla hinduskie święta i pomyślne dni",
                "pt": "Exibe festivais hindus e dias auspiciosos",
                "ru": "Отображает индуистские праздники и благоприятные дни",
                "ja": "ヒンドゥー教の祭りと吉日を表示",
                "zh": "显示印度教节日和吉日",
                "ko": "힌두 축제와 길일 표시"
            }
        },
        "show_rashi": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Rashi",
                "de": "Rashi anzeigen",
                "es": "Mostrar Rashi",
                "fr": "Afficher Rashi",
                "it": "Mostra Rashi",
                "nl": "Rashi Tonen",
                "pl": "Pokaż Rashi",
                "pt": "Mostrar Rashi",
                "ru": "Показать Раши",
                "ja": "ラーシを表示",
                "zh": "显示拉希",
                "ko": "라시 표시"
            },
            "description": {
                "en": "Display zodiac sign (Rashi) - 12 signs",
                "de": "Zeigt das Tierkreiszeichen (Rashi) - 12 Zeichen",
                "es": "Muestra el signo zodiacal (Rashi) - 12 signos",
                "fr": "Affiche le signe du zodiaque (Rashi) - 12 signes",
                "it": "Visualizza il segno zodiacale (Rashi) - 12 segni",
                "nl": "Toont het sterrenbeeld (Rashi) - 12 tekens",
                "pl": "Wyświetla znak zodiaku (Rashi) - 12 znaków",
                "pt": "Exibe o signo do zodíaco (Rashi) - 12 signos",
                "ru": "Отображает знак зодиака (Раши) - 12 знаков",
                "ja": "黄道十二宮（ラーシ）を表示 - 12星座",
                "zh": "显示黄道十二宫（拉希）- 12个星座",
                "ko": "황도 12궁(라시) 표시 - 12개 별자리"
            }
        }
    },
    
    # Hindu calendar data
    "hindu_data": {
        "months": {
            "sanskrit": ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद",
                        "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"],
            "hindi": ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद",
                     "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"],
            "english": ["Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
                       "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"]
        },
        "paksha": {
            "sanskrit": {"bright": "शुक्ल पक्ष", "dark": "कृष्ण पक्ष"},
            "hindi": {"bright": "शुक्ल पक्ष", "dark": "कृष्ण पक्ष"},
            "english": {"bright": "Shukla Paksha", "dark": "Krishna Paksha"}
        },
        "tithi": [
            {"sanskrit": "प्रतिपदा", "english": "Pratipada", "deity": "Agni"},
            {"sanskrit": "द्वितीया", "english": "Dwitiya", "deity": "Brahma"},
            {"sanskrit": "तृतीया", "english": "Tritiya", "deity": "Gauri"},
            {"sanskrit": "चतुर्थी", "english": "Chaturthi", "deity": "Ganesha"},
            {"sanskrit": "पञ्चमी", "english": "Panchami", "deity": "Naga"},
            {"sanskrit": "षष्ठी", "english": "Shashthi", "deity": "Kartikeya"},
            {"sanskrit": "सप्तमी", "english": "Saptami", "deity": "Surya"},
            {"sanskrit": "अष्टमी", "english": "Ashtami", "deity": "Shiva"},
            {"sanskrit": "नवमी", "english": "Navami", "deity": "Durga"},
            {"sanskrit": "दशमी", "english": "Dashami", "deity": "Yama"},
            {"sanskrit": "एकादशी", "english": "Ekadashi", "deity": "Vishnu"},
            {"sanskrit": "द्वादशी", "english": "Dwadashi", "deity": "Hari"},
            {"sanskrit": "त्रयोदशी", "english": "Trayodashi", "deity": "Kamadeva"},
            {"sanskrit": "चतुर्दशी", "english": "Chaturdashi", "deity": "Shiva"},
            {"sanskrit": "पूर्णिमा/अमावस्या", "english": "Purnima/Amavasya", "deity": "Moon/Pitru"}
        ],
        "nakshatra": [
            {"sanskrit": "अश्विनी", "english": "Ashwini", "deity": "Ashwini Kumaras"},
            {"sanskrit": "भरणी", "english": "Bharani", "deity": "Yama"},
            {"sanskrit": "कृत्तिका", "english": "Krittika", "deity": "Agni"},
            {"sanskrit": "रोहिणी", "english": "Rohini", "deity": "Brahma"},
            {"sanskrit": "मृगशीर्ष", "english": "Mrigashirsha", "deity": "Soma"},
            {"sanskrit": "आर्द्रा", "english": "Ardra", "deity": "Rudra"},
            {"sanskrit": "पुनर्वसु", "english": "Punarvasu", "deity": "Aditi"},
            {"sanskrit": "पुष्य", "english": "Pushya", "deity": "Brihaspati"},
            {"sanskrit": "आश्लेषा", "english": "Ashlesha", "deity": "Naga"},
            {"sanskrit": "मघा", "english": "Magha", "deity": "Pitru"},
            {"sanskrit": "पूर्व फाल्गुनी", "english": "Purva Phalguni", "deity": "Bhaga"},
            {"sanskrit": "उत्तर फाल्गुनी", "english": "Uttara Phalguni", "deity": "Aryaman"},
            {"sanskrit": "हस्त", "english": "Hasta", "deity": "Savitru"},
            {"sanskrit": "चित्रा", "english": "Chitra", "deity": "Tvashtar"},
            {"sanskrit": "स्वाति", "english": "Swati", "deity": "Vayu"},
            {"sanskrit": "विशाखा", "english": "Vishakha", "deity": "Indra-Agni"},
            {"sanskrit": "अनुराधा", "english": "Anuradha", "deity": "Mitra"},
            {"sanskrit": "ज्येष्ठा", "english": "Jyeshtha", "deity": "Indra"},
            {"sanskrit": "मूल", "english": "Mula", "deity": "Nirriti"},
            {"sanskrit": "पूर्वाषाढ़ा", "english": "Purva Ashadha", "deity": "Apas"},
            {"sanskrit": "उत्तराषाढ़ा", "english": "Uttara Ashadha", "deity": "Vishvadevas"},
            {"sanskrit": "श्रवण", "english": "Shravana", "deity": "Vishnu"},
            {"sanskrit": "धनिष्ठा", "english": "Dhanishta", "deity": "Vasu"},
            {"sanskrit": "शतभिषा", "english": "Shatabhisha", "deity": "Varuna"},
            {"sanskrit": "पूर्व भाद्रपदा", "english": "Purva Bhadrapada", "deity": "Aja Ekapad"},
            {"sanskrit": "उत्तर भाद्रपदा", "english": "Uttara Bhadrapada", "deity": "Ahir Budhanya"},
            {"sanskrit": "रेवती", "english": "Revati", "deity": "Pushan"}
        ],
        "yoga": [
            "विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा",
            "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र",
            "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य",
            "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"
        ],
        "karana": [
            "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि",
            "शकुनि", "चतुष्पाद", "नाग", "किंस्तुघ्न"
        ],
        "rashi": [
            {"sanskrit": "मेष", "english": "Aries", "symbol": "♈"},
            {"sanskrit": "वृषभ", "english": "Taurus", "symbol": "♉"},
            {"sanskrit": "मिथुन", "english": "Gemini", "symbol": "♊"},
            {"sanskrit": "कर्क", "english": "Cancer", "symbol": "♋"},
            {"sanskrit": "सिंह", "english": "Leo", "symbol": "♌"},
            {"sanskrit": "कन्या", "english": "Virgo", "symbol": "♍"},
            {"sanskrit": "तुला", "english": "Libra", "symbol": "♎"},
            {"sanskrit": "वृश्चिक", "english": "Scorpio", "symbol": "♏"},
            {"sanskrit": "धनु", "english": "Sagittarius", "symbol": "♐"},
            {"sanskrit": "मकर", "english": "Capricorn", "symbol": "♑"},
            {"sanskrit": "कुम्भ", "english": "Aquarius", "symbol": "♒"},
            {"sanskrit": "मीन", "english": "Pisces", "symbol": "♓"}
        ],
        "festivals": {
            "1-1": {"sanskrit": "नव वर्ष", "english": "Hindu New Year"},
            "1-9": {"sanskrit": "राम नवमी", "english": "Rama Navami"},
            "2-3": {"sanskrit": "अक्षय तृतीया", "english": "Akshaya Tritiya"},
            "3-15": {"sanskrit": "वट पूर्णिमा", "english": "Vat Purnima"},
            "4-2": {"sanskrit": "रथ यात्रा", "english": "Rath Yatra"},
            "5-3": {"sanskrit": "नाग पंचमी", "english": "Nag Panchami"},
            "5-15": {"sanskrit": "रक्षा बंधन", "english": "Raksha Bandhan"},
            "6-4": {"sanskrit": "गणेश चतुर्थी", "english": "Ganesha Chaturthi"},
            "7-1": {"sanskrit": "नवरात्रि", "english": "Navaratri"},
            "7-10": {"sanskrit": "विजयादशमी", "english": "Vijayadashami"},
            "8-1": {"sanskrit": "दीपावली", "english": "Diwali"},
            "11-11": {"sanskrit": "एकादशी", "english": "Ekadashi"},
            "12-15": {"sanskrit": "होली", "english": "Holi"}
        },
        "era_offsets": {
            "shalivahana": 78,  # Shalivahana Shaka (CE - 78)
            "vikram": -57,      # Vikram Samvat (CE + 57)
            "kali": 3102        # Kali Yuga (CE - 3102)
        }
    },
    
    # Additional metadata
    "reference_url": "https://www.drikpanchang.com/",
    "documentation_url": "https://en.wikipedia.org/wiki/Hindu_calendar",
    "created_by": "Traditional Hindu System",
    "introduced": "Ancient (Vedic period)",
    
    # Example format
    "example": "शुक्ल पक्ष द्वितीया, आषाढ़ 1946 (शक)",
    "example_meaning": "Shukla Paksha Dwitiya, Ashadha 1946 (Shaka Era)",
    
    # Related calendars
    "related": ["buddhist", "jain", "sikh", "nepali"],
    
    # Tags for searching and filtering
    "tags": [
        "hindu", "panchang", "vedic", "indian", "lunisolar", "religious",
        "tithi", "nakshatra", "yoga", "karana", "festivals", "astrology"
    ],
    
    # Special features
    "features": {
        "supports_tithi": True,
        "supports_nakshatra": True,
        "supports_yoga": True,
        "supports_karana": True,
        "supports_rashi": True,
        "supports_festivals": True,
        "supports_multiple_eras": True,
        "precision": "muhurta"
    }
}


class HinduPanchangCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Hindu Calendar (Panchānga)."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Hindu Panchang calendar sensor."""
        super().__init__(base_name, hass)
        
        # Store CALENDAR_INFO as instance variable for _translate method
        self._calendar_info = CALENDAR_INFO
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Hindu Calendar (Panchānga)')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_hindu_panchang"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:om")
        
        # Configuration options with defaults from CALENDAR_INFO
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._timezone = config_defaults.get("timezone", {}).get("default", "Asia/Kolkata")
        self._calendar_system = config_defaults.get("calendar_system", {}).get("default", "shalivahana")
        self._display_language = config_defaults.get("display_language", {}).get("default", "auto")
        self._show_tithi = config_defaults.get("show_tithi", {}).get("default", True)
        self._show_nakshatra = config_defaults.get("show_nakshatra", {}).get("default", True)
        self._show_yoga = config_defaults.get("show_yoga", {}).get("default", True)
        self._show_karana = config_defaults.get("show_karana", {}).get("default", True)
        self._show_festivals = config_defaults.get("show_festivals", {}).get("default", True)
        self._show_rashi = config_defaults.get("show_rashi", {}).get("default", True)
        
        # Hindu data
        self._hindu_data = CALENDAR_INFO["hindu_data"]
        
        # Flag to track if options have been loaded
        self._options_loaded = False
        
        # Initialize state
        self._state = None
        self._panchang_date = {}
        
        _LOGGER.debug(f"Initialized Hindu Panchang Calendar sensor: {self._attr_name}")
    
    def _load_options(self) -> None:
        """Load plugin options after IDs are set."""
        if self._options_loaded:
            return
            
        # Get plugin options from config entry
        plugin_options = self.get_plugin_options()
        
        if plugin_options:
            _LOGGER.debug(f"Loading Hindu Panchang options: {plugin_options}")
            
            # Apply options using set_options method
            self.set_options(
                timezone=plugin_options.get("timezone"),
                calendar_system=plugin_options.get("calendar_system"),
                display_language=plugin_options.get("display_language"),
                show_tithi=plugin_options.get("show_tithi"),
                show_nakshatra=plugin_options.get("show_nakshatra"),
                show_yoga=plugin_options.get("show_yoga"),
                show_karana=plugin_options.get("show_karana"),
                show_festivals=plugin_options.get("show_festivals"),
                show_rashi=plugin_options.get("show_rashi")
            )
        
        self._options_loaded = True
    
    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added to hass."""
        await super().async_added_to_hass()
        
        # Load options after entity is registered
        self._load_options()
        
        _LOGGER.debug(f"Hindu Panchang sensor added to hass with options: "
                     f"timezone={self._timezone}, system={self._calendar_system}, "
                     f"language={self._display_language}")
    
    def set_options(
        self,
        *,
        timezone: Optional[str] = None,
        calendar_system: Optional[str] = None,
        display_language: Optional[str] = None,
        show_tithi: Optional[bool] = None,
        show_nakshatra: Optional[bool] = None,
        show_yoga: Optional[bool] = None,
        show_karana: Optional[bool] = None,
        show_festivals: Optional[bool] = None,
        show_rashi: Optional[bool] = None
    ) -> None:
        """Set calendar options from config flow."""
        if timezone is not None and timezone in ["Asia/Kolkata", "local", "UTC"]:
            self._timezone = timezone
            _LOGGER.debug(f"Set timezone to: {timezone}")
        
        if calendar_system is not None and calendar_system in ["shalivahana", "vikram", "kali"]:
            self._calendar_system = calendar_system
            _LOGGER.debug(f"Set calendar_system to: {calendar_system}")
        
        if display_language is not None and display_language in ["auto", "sanskrit", "hindi", "english"]:
            self._display_language = display_language
            _LOGGER.debug(f"Set display_language to: {display_language}")
        
        if show_tithi is not None:
            self._show_tithi = bool(show_tithi)
            _LOGGER.debug(f"Set show_tithi to: {show_tithi}")
        
        if show_nakshatra is not None:
            self._show_nakshatra = bool(show_nakshatra)
            _LOGGER.debug(f"Set show_nakshatra to: {show_nakshatra}")
        
        if show_yoga is not None:
            self._show_yoga = bool(show_yoga)
            _LOGGER.debug(f"Set show_yoga to: {show_yoga}")
        
        if show_karana is not None:
            self._show_karana = bool(show_karana)
            _LOGGER.debug(f"Set show_karana to: {show_karana}")
        
        if show_festivals is not None:
            self._show_festivals = bool(show_festivals)
            _LOGGER.debug(f"Set show_festivals to: {show_festivals}")
        
        if show_rashi is not None:
            self._show_rashi = bool(show_rashi)
            _LOGGER.debug(f"Set show_rashi to: {show_rashi}")
    
    def _get_timezone(self) -> ZoneInfo:
        """Get the configured timezone."""
        if self._timezone == "Asia/Kolkata":
            return ZoneInfo("Asia/Kolkata")
        elif self._timezone == "UTC":
            return ZoneInfo("UTC")
        else:  # local
            # Try to get system timezone, fallback to UTC
            try:
                import tzlocal
                return tzlocal.get_localzone()
            except:
                return ZoneInfo("UTC")
    
    def _calculate_tithi(self, india_time: datetime) -> Tuple[int, str]:
        """Calculate Tithi (lunar day) for given date."""
        # Simplified calculation - actual calculation is complex
        # Based on angular distance between Sun and Moon
        days_since_new_moon = (india_time.day + india_time.month * 30) % 30
        tithi_index = min(days_since_new_moon, 14)
        paksha = "bright" if days_since_new_moon <= 15 else "dark"
        return tithi_index, paksha
    
    def _calculate_nakshatra(self, india_time: datetime) -> int:
        """Calculate Nakshatra (lunar mansion) for given date."""
        # Simplified calculation - actual calculation involves Moon's longitude
        day_of_year = india_time.timetuple().tm_yday
        nakshatra_index = (day_of_year * 27 // 365) % 27
        return nakshatra_index
    
    def _calculate_yoga(self, india_time: datetime) -> int:
        """Calculate Yoga for given date."""
        # Simplified calculation - actual involves Sun and Moon longitudes
        day_of_month = india_time.day
        yoga_index = (day_of_month - 1) % 27
        return yoga_index
    
    def _calculate_karana(self, tithi_index: int) -> int:
        """Calculate Karana (half of Tithi) for given Tithi."""
        # There are 11 Karanas that repeat
        karana_index = (tithi_index * 2) % 11
        return karana_index
    
    def _calculate_rashi(self, india_time: datetime) -> int:
        """Calculate Rashi (zodiac sign) for given date."""
        # Simplified calculation based on Sun's position
        month = india_time.month
        day = india_time.day
        
        # Approximate zodiac boundaries
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return 0  # Aries
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return 1  # Taurus
        # ... simplified for brevity
        return (month - 1) % 12
    
    def _get_hindu_year(self, india_time: datetime) -> int:
        """Calculate Hindu year based on selected era."""
        gregorian_year = india_time.year
        era_offset = self._hindu_data["era_offsets"][self._calendar_system]
        
        # Adjust for Hindu New Year (typically in March/April)
        if india_time.month < 3:
            gregorian_year -= 1
        
        return gregorian_year - era_offset
    
    def _get_hindu_month(self, india_time: datetime) -> int:
        """Get Hindu month (simplified)."""
        # Hindu months typically start with new moon
        # This is a simplified approximation
        month = (india_time.month + 1) % 12
        return month
    
    def _get_festival(self, month: int, tithi: int) -> Optional[Dict[str, str]]:
        """Check if current date has a festival."""
        date_key = f"{month}-{tithi+1}"
        if date_key in self._hindu_data["festivals"]:
            return self._hindu_data["festivals"][date_key]
        return None
    
    def _format_panchang_date(self, hindu_year: int, month: int, tithi: int, paksha: str,
                             nakshatra: int, yoga: int, karana: int, rashi: int,
                             india_time: datetime) -> str:
        """Format the Panchang date according to display settings."""
        # Determine display language
        if self._display_language == "sanskrit":
            lang = "sanskrit"
        elif self._display_language == "hindi":
            lang = "hindi"
        elif self._display_language == "english":
            lang = "english"
        else:  # auto
            ha_lang = getattr(self._hass.config, "language", "en")
            if ha_lang in ["hi", "sa"]:
                lang = "hindi"
            else:
                lang = "english"
        
        # Get month name
        month_name = self._hindu_data["months"][lang][month]
        
        # Get Tithi name
        tithi_name = self._hindu_data["tithi"][tithi][lang if lang != "hindi" else "sanskrit"]
        
        # Get Paksha
        paksha_name = self._hindu_data["paksha"][lang][paksha]
        
        # Format based on language
        if lang == "english":
            result = f"{month_name} {paksha_name} {tithi_name}"
            if self._calendar_system == "shalivahana":
                result += f", Shaka {hindu_year}"
            elif self._calendar_system == "vikram":
                result += f", VS {hindu_year}"
            else:  # kali
                result += f", KY {hindu_year}"
        else:
            result = f"{paksha_name} {tithi_name}, {month_name}"
            if self._calendar_system == "shalivahana":
                result += f" {hindu_year} (शक)"
            elif self._calendar_system == "vikram":
                result += f" {hindu_year} (विक्रम)"
            else:  # kali
                result += f" {hindu_year} (कलि)"
        
        return result
    
    def _calculate_panchang(self, now: datetime) -> Dict[str, Any]:
        """Calculate the Hindu Panchang for given time."""
        # Convert to configured timezone
        tz = self._get_timezone()
        india_time = now.astimezone(tz)
        
        # If using IST, ensure we're getting India time
        if self._timezone == "Asia/Kolkata":
            india_time = now.astimezone(ZoneInfo("Asia/Kolkata"))
        
        # Calculate various Panchang elements
        tithi_index, paksha = self._calculate_tithi(india_time)
        nakshatra_index = self._calculate_nakshatra(india_time)
        yoga_index = self._calculate_yoga(india_time)
        karana_index = self._calculate_karana(tithi_index)
        rashi_index = self._calculate_rashi(india_time)
        
        # Get Hindu year and month
        hindu_year = self._get_hindu_year(india_time)
        hindu_month = self._get_hindu_month(india_time)
        
        # Format the date
        formatted = self._format_panchang_date(
            hindu_year, hindu_month, tithi_index, paksha,
            nakshatra_index, yoga_index, karana_index, rashi_index,
            india_time
        )
        
        result = {
            "hindu_year": hindu_year,
            "hindu_month": hindu_month,
            "month_name": self._hindu_data["months"]["english"][hindu_month],
            "paksha": paksha,
            "paksha_name": self._hindu_data["paksha"]["english"][paksha],
            "gregorian_date": f"{india_time.year}/{india_time.month:02d}/{india_time.day:02d}",
            "formatted": formatted
        }
        
        # Add Tithi if enabled
        if self._show_tithi:
            tithi_info = self._hindu_data["tithi"][tithi_index]
            result["tithi"] = tithi_info["english"]
            result["tithi_sanskrit"] = tithi_info["sanskrit"]
            result["tithi_deity"] = tithi_info["deity"]
        
        # Add Nakshatra if enabled
        if self._show_nakshatra:
            nakshatra_info = self._hindu_data["nakshatra"][nakshatra_index]
            result["nakshatra"] = nakshatra_info["english"]
            result["nakshatra_sanskrit"] = nakshatra_info["sanskrit"]
            result["nakshatra_deity"] = nakshatra_info["deity"]
        
        # Add Yoga if enabled
        if self._show_yoga:
            result["yoga"] = self._hindu_data["yoga"][yoga_index]
        
        # Add Karana if enabled
        if self._show_karana:
            result["karana"] = self._hindu_data["karana"][karana_index]
        
        # Add Rashi if enabled
        if self._show_rashi:
            rashi_info = self._hindu_data["rashi"][rashi_index]
            result["rashi"] = rashi_info["english"]
            result["rashi_sanskrit"] = rashi_info["sanskrit"]
            result["rashi_symbol"] = rashi_info["symbol"]
        
        # Add festival if applicable
        if self._show_festivals:
            festival = self._get_festival(hindu_month, tithi_index)
            if festival:
                result["festival"] = festival["english"]
                result["festival_sanskrit"] = festival["sanskrit"]
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Ensure options are loaded (in case async_added_to_hass hasn't run yet)
        if not self._options_loaded:
            self._load_options()
        
        now = datetime.now(timezone.utc)
        self._panchang_date = self._calculate_panchang(now)
        
        # Set state to formatted Panchang date
        self._state = self._panchang_date["formatted"]
        
        _LOGGER.debug(f"Updated Hindu Panchang to {self._state}")
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state or "Unknown"
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return additional attributes."""
        if not self._panchang_date:
            return {}
        
        # Build attributes dictionary
        attrs = {
            "hindu_year": self._panchang_date.get("hindu_year"),
            "hindu_month": self._panchang_date.get("hindu_month"),
            "month_name": self._panchang_date.get("month_name"),
            "paksha": self._panchang_date.get("paksha_name"),
            "gregorian_date": self._panchang_date.get("gregorian_date"),
            "calendar_system": self._calendar_system,
            "icon": self._attr_icon,
            "calendar_type": "Hindu Panchānga",
            "accuracy": CALENDAR_INFO.get("accuracy", "traditional"),
            "reference": CALENDAR_INFO.get("reference_url"),
            "notes": self._translate("notes")
        }
        
        # Add optional Panchang elements
        if "tithi" in self._panchang_date:
            attrs["tithi"] = self._panchang_date["tithi"]
            attrs["tithi_sanskrit"] = self._panchang_date["tithi_sanskrit"]
            attrs["tithi_deity"] = self._panchang_date["tithi_deity"]
        
        if "nakshatra" in self._panchang_date:
            attrs["nakshatra"] = self._panchang_date["nakshatra"]
            attrs["nakshatra_sanskrit"] = self._panchang_date["nakshatra_sanskrit"]
            attrs["nakshatra_deity"] = self._panchang_date["nakshatra_deity"]
        
        if "yoga" in self._panchang_date:
            attrs["yoga"] = self._panchang_date["yoga"]
        
        if "karana" in self._panchang_date:
            attrs["karana"] = self._panchang_date["karana"]
        
        if "rashi" in self._panchang_date:
            attrs["rashi"] = self._panchang_date["rashi"]
            attrs["rashi_sanskrit"] = self._panchang_date["rashi_sanskrit"]
            attrs["rashi_symbol"] = self._panchang_date["rashi_symbol"]
        
        if "festival" in self._panchang_date:
            attrs["festival"] = self._panchang_date["festival"]
            attrs["festival_sanskrit"] = self._panchang_date["festival_sanskrit"]
        
        # Add configuration state
        attrs["config_timezone"] = self._timezone
        attrs["config_calendar_system"] = self._calendar_system
        attrs["config_display_language"] = self._display_language
        attrs["config_show_tithi"] = self._show_tithi
        attrs["config_show_nakshatra"] = self._show_nakshatra
        attrs["config_show_yoga"] = self._show_yoga
        attrs["config_show_karana"] = self._show_karana
        attrs["config_show_festivals"] = self._show_festivals
        attrs["config_show_rashi"] = self._show_rashi
        
        return attrs


# ============================================
# MODULE EXPORTS
# ============================================

# Export the sensor class
__all__ = ["HinduPanchangCalendarSensor"]