"""Rivendell Calendar (Elven/Imladris) implementation - Version 3.0."""
from __future__ import annotations

from datetime import datetime
import logging
import math
from typing import Dict, Any, Optional

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
    "id": "rivendell",
    "version": "3.0.0",
    "icon": "mdi:forest",
    "category": "fantasy",
    "accuracy": "fictional",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Rivendell Calendar (LOTR)",
        "de": "Bruchtal-Kalender (HdR)",
        "es": "Calendario de Rivendel (ESDLA)",
        "fr": "Calendrier de Fondcombe (SdA)",
        "it": "Calendario di Gran Burrone (SdA)",
        "nl": "Rivendel Kalender (LOTR)",
        "pl": "Kalendarz Rivendell (WP)",
        "pt": "Calendário de Valfenda (SdA)",
        "ru": "Календарь Ривенделла (ВК)",
        "ja": "裂け谷の暦 (ロード・オブ・ザ・リング)",
        "zh": "瑞文戴尔历 (指环王)",
        "ko": "리븐델 달력 (반지의 제왕)"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Elven calendar from Middle-earth with 6 seasons and yén cycles",
        "de": "Elbischer Kalender aus Mittelerde mit 6 Jahreszeiten und Yén-Zyklen",
        "es": "Calendario élfico de la Tierra Media con 6 estaciones y ciclos yén",
        "fr": "Calendrier elfique de la Terre du Milieu avec 6 saisons et cycles yén",
        "it": "Calendario elfico della Terra di Mezzo con 6 stagioni e cicli yén",
        "nl": "Elfenkalender uit Midden-aarde met 6 seizoenen en yén cycli",
        "pl": "Elficki kalendarz ze Śródziemia z 6 porami roku i cyklami yén",
        "pt": "Calendário élfico da Terra-média com 6 estações e ciclos yén",
        "ru": "Эльфийский календарь Средиземья с 6 сезонами и циклами йен",
        "ja": "6つの季節とイェーンサイクルを持つ中つ国のエルフ暦",
        "zh": "中土世界精灵历法，包含6个季节和长年周期",
        "ko": "6계절과 옌 주기가 있는 중간계 엘프 달력"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Calendar of Imladris (Rivendell) follows the Elven reckoning of time, as kept by Elrond Half-elven",
            "structure": "The Elven year (loa) has 6 seasons of varying length, totaling 365 days (366 in leap years)",
            "seasons": "Tuilë (Spring-54d), Lairë (Summer-72d), Yávië (Autumn-54d), Quellë (Fading-72d), Hrívë (Winter-72d), Coirë (Stirring-41d)",
            "yen": "A yén (long-year) equals 144 solar years, the preferred unit for Elven lifespan measurement",
            "days": "6-day week: Elenya (Stars), Anarya (Sun), Isilya (Moon), Aldúya (Two Trees), Menelya (Heavens), Valanya (Valar)",
            "special": "Special days include Yestarë (first day), Loëndë (mid-year), and Mettarë (last day)",
            "ages": "Currently in the Fourth Age, following the departure of the Ring-bearers",
            "note": "Time in Rivendell seems to flow differently, preserved by Vilya, Elrond's Ring of Power"
        },
        "de": {
            "overview": "Der Kalender von Imladris (Bruchtal) folgt der elbischen Zeitrechnung, wie sie von Elrond Halbelb geführt wird",
            "structure": "Das Elbenjahr (loa) hat 6 Jahreszeiten unterschiedlicher Länge, insgesamt 365 Tage (366 in Schaltjahren)",
            "seasons": "Tuilë (Frühling-54T), Lairë (Sommer-72T), Yávië (Herbst-54T), Quellë (Schwinden-72T), Hrívë (Winter-72T), Coirë (Erwachen-41T)",
            "yen": "Ein Yén (Langjahr) entspricht 144 Sonnenjahren, die bevorzugte Einheit zur Messung der Elbenlebensspanne",
            "days": "6-Tage-Woche: Elenya (Sterne), Anarya (Sonne), Isilya (Mond), Aldúya (Zwei Bäume), Menelya (Himmel), Valanya (Valar)",
            "special": "Besondere Tage sind Yestarë (erster Tag), Loëndë (Mittsommer) und Mettarë (letzter Tag)",
            "ages": "Derzeit im Vierten Zeitalter, nach der Abreise der Ringträger",
            "note": "Die Zeit in Bruchtal scheint anders zu fließen, bewahrt durch Vilya, Elronds Ring der Macht"
        }
    },
    
    # Configuration options
    "config_options": {
        "language_mode": {
            "type": "select",
            "default": "quenya",
            "options": ["quenya", "sindarin", "english", "mixed"],
            "label": {
                "en": "Language Mode",
                "de": "Sprachmodus",
                "es": "Modo de idioma",
                "fr": "Mode de langue",
                "it": "Modalità lingua",
                "nl": "Taalmodus",
                "pl": "Tryb językowy",
                "pt": "Modo de idioma",
                "ru": "Языковой режим",
                "ja": "言語モード",
                "zh": "语言模式",
                "ko": "언어 모드"
            },
            "description": {
                "en": "Choose the language for calendar terms (Quenya, Sindarin, or English)",
                "de": "Wähle die Sprache für Kalenderbegriffe (Quenya, Sindarin oder Englisch)",
                "es": "Elige el idioma para los términos del calendario (Quenya, Sindarin o Inglés)",
                "fr": "Choisissez la langue pour les termes du calendrier (Quenya, Sindarin ou Anglais)",
                "it": "Scegli la lingua per i termini del calendario (Quenya, Sindarin o Inglese)",
                "nl": "Kies de taal voor kalendertermen (Quenya, Sindarin of Engels)",
                "pl": "Wybierz język terminów kalendarza (Quenya, Sindarin lub Angielski)",
                "pt": "Escolha o idioma para os termos do calendário (Quenya, Sindarin ou Inglês)",
                "ru": "Выберите язык для календарных терминов (Квенья, Синдарин или Английский)",
                "ja": "カレンダー用語の言語を選択（クウェンヤ語、シンダール語、または英語）",
                "zh": "选择日历术语的语言（昆雅语、辛达语或英语）",
                "ko": "달력 용어 언어 선택 (퀘냐, 신다린 또는 영어)"
            },
            "options_label": {
                "quenya": {
                    "en": "Quenya (High Elvish)",
                    "de": "Quenya (Hochelbisch)",
                    "es": "Quenya (Alto Élfico)",
                    "fr": "Quenya (Haut-Elfique)",
                    "it": "Quenya (Alto Elfico)",
                    "nl": "Quenya (Hoog-Elfs)",
                    "pl": "Quenya (Wysokoelficki)",
                    "pt": "Quenya (Alto Élfico)",
                    "ru": "Квенья (Высокий эльфийский)",
                    "ja": "クウェンヤ語（上位エルフ語）",
                    "zh": "昆雅语（高等精灵语）",
                    "ko": "퀘냐 (고등 엘프어)"
                },
                "sindarin": {
                    "en": "Sindarin (Grey Elvish)",
                    "de": "Sindarin (Grauelbisch)",
                    "es": "Sindarin (Élfico Gris)",
                    "fr": "Sindarin (Elfique Gris)",
                    "it": "Sindarin (Elfico Grigio)",
                    "nl": "Sindarin (Grijs-Elfs)",
                    "pl": "Sindarin (Szaroelficki)",
                    "pt": "Sindarin (Élfico Cinzento)",
                    "ru": "Синдарин (Серый эльфийский)",
                    "ja": "シンダール語（灰色エルフ語）",
                    "zh": "辛达语（灰精灵语）",
                    "ko": "신다린 (회색 엘프어)"
                },
                "english": {
                    "en": "English (Common Speech)",
                    "de": "Englisch (Gemeinsprache)",
                    "es": "Inglés (Lengua Común)",
                    "fr": "Anglais (Langue Commune)",
                    "it": "Inglese (Lingua Comune)",
                    "nl": "Engels (Gemeenschappelijke Taal)",
                    "pl": "Angielski (Wspólna Mowa)",
                    "pt": "Inglês (Língua Comum)",
                    "ru": "Английский (Всеобщий язык)",
                    "ja": "英語（共通語）",
                    "zh": "英语（通用语）",
                    "ko": "영어 (공용어)"
                },
                "mixed": {
                    "en": "Mixed (Shows both)",
                    "de": "Gemischt (Zeigt beide)",
                    "es": "Mixto (Muestra ambos)",
                    "fr": "Mixte (Affiche les deux)",
                    "it": "Misto (Mostra entrambi)",
                    "nl": "Gemengd (Toont beide)",
                    "pl": "Mieszany (Pokazuje oba)",
                    "pt": "Misto (Mostra ambos)",
                    "ru": "Смешанный (Показывает оба)",
                    "ja": "混合（両方表示）",
                    "zh": "混合（显示两者）",
                    "ko": "혼합 (둘 다 표시)"
                }
            }
        },
        "show_yen": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Yén Cycle",
                "de": "Yén-Zyklus anzeigen",
                "es": "Mostrar ciclo Yén",
                "fr": "Afficher le cycle Yén",
                "it": "Mostra ciclo Yén",
                "nl": "Toon Yén cyclus",
                "pl": "Pokaż cykl Yén",
                "pt": "Mostrar ciclo Yén",
                "ru": "Показать цикл Йен",
                "ja": "イェーンサイクルを表示",
                "zh": "显示长年周期",
                "ko": "옌 주기 표시"
            },
            "description": {
                "en": "Display yén (144-year cycle) and loa (year within yén)",
                "de": "Zeige Yén (144-Jahre-Zyklus) und Loa (Jahr innerhalb Yén)",
                "es": "Mostrar yén (ciclo de 144 años) y loa (año dentro del yén)",
                "fr": "Afficher yén (cycle de 144 ans) et loa (année dans le yén)",
                "it": "Mostra yén (ciclo di 144 anni) e loa (anno nel yén)",
                "nl": "Toon yén (144-jarige cyclus) en loa (jaar binnen yén)",
                "pl": "Pokaż yén (cykl 144-letni) i loa (rok w yén)",
                "pt": "Mostrar yén (ciclo de 144 anos) e loa (ano dentro do yén)",
                "ru": "Показать йен (144-летний цикл) и лоа (год в йен)",
                "ja": "イェーン（144年周期）とロア（イェーン内の年）を表示",
                "zh": "显示长年（144年周期）和年（长年内的年份）",
                "ko": "옌 (144년 주기)과 로아 (옌 내의 연도) 표시"
            }
        },
        "show_star_signs": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Star Signs",
                "de": "Sternzeichen anzeigen",
                "es": "Mostrar signos estelares",
                "fr": "Afficher les signes stellaires",
                "it": "Mostra segni stellari",
                "nl": "Toon sterrenbeelden",
                "pl": "Pokaż znaki gwiezdne",
                "pt": "Mostrar signos estelares",
                "ru": "Показать звездные знаки",
                "ja": "星座を表示",
                "zh": "显示星座",
                "ko": "별자리 표시"
            },
            "description": {
                "en": "Display Elven star signs and constellations",
                "de": "Zeige elbische Sternzeichen und Konstellationen",
                "es": "Mostrar signos estelares y constelaciones élficas",
                "fr": "Afficher les signes stellaires et constellations elfiques",
                "it": "Mostra segni stellari e costellazioni elfiche",
                "nl": "Toon Elfse sterrenbeelden en constellaties",
                "pl": "Pokaż elfickie znaki gwiezdne i konstelacje",
                "pt": "Mostrar signos estelares e constelações élficas",
                "ru": "Показать эльфийские звездные знаки и созвездия",
                "ja": "エルフの星座と星団を表示",
                "zh": "显示精灵星座和星群",
                "ko": "엘프 별자리와 성좌 표시"
            }
        },
        "show_moon_phases": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Moon Phases",
                "de": "Mondphasen anzeigen",
                "es": "Mostrar fases lunares",
                "fr": "Afficher les phases lunaires",
                "it": "Mostra fasi lunari",
                "nl": "Toon maanfasen",
                "pl": "Pokaż fazy księżyca",
                "pt": "Mostrar fases da lua",
                "ru": "Показать фазы луны",
                "ja": "月相を表示",
                "zh": "显示月相",
                "ko": "달의 위상 표시"
            },
            "description": {
                "en": "Display moon phases in Sindarin terminology",
                "de": "Zeige Mondphasen in Sindarin-Terminologie",
                "es": "Mostrar fases lunares en terminología Sindarin",
                "fr": "Afficher les phases lunaires en terminologie Sindarin",
                "it": "Mostra fasi lunari in terminologia Sindarin",
                "nl": "Toon maanfasen in Sindarin terminologie",
                "pl": "Pokaż fazy księżyca w terminologii Sindarin",
                "pt": "Mostrar fases da lua em terminologia Sindarin",
                "ru": "Показать фазы луны в терминологии Синдарин",
                "ja": "シンダール語の月相を表示",
                "zh": "以辛达语术语显示月相",
                "ko": "신다린 용어로 달의 위상 표시"
            }
        },
        "age_reckoning": {
            "type": "select",
            "default": "fourth",
            "options": ["first", "second", "third", "fourth"],
            "label": {
                "en": "Age",
                "de": "Zeitalter",
                "es": "Edad",
                "fr": "Âge",
                "it": "Era",
                "nl": "Tijdperk",
                "pl": "Era",
                "pt": "Era",
                "ru": "Эпоха",
                "ja": "時代",
                "zh": "纪元",
                "ko": "시대"
            },
            "description": {
                "en": "Which Age of Middle-earth to use for reckoning",
                "de": "Welches Zeitalter Mittelerdes zur Berechnung verwenden",
                "es": "Qué Edad de la Tierra Media usar para el cálculo",
                "fr": "Quel Âge de la Terre du Milieu utiliser pour le calcul",
                "it": "Quale Era della Terra di Mezzo usare per il calcolo",
                "nl": "Welk Tijdperk van Midden-aarde gebruiken voor berekening",
                "pl": "Która Era Śródziemia do obliczeń",
                "pt": "Qual Era da Terra-média usar para cálculo",
                "ru": "Какую Эпоху Средиземья использовать для расчета",
                "ja": "計算に使用する中つ国の時代",
                "zh": "用于计算的中土世界纪元",
                "ko": "계산에 사용할 중간계 시대"
            },
            "options_label": {
                "first": {
                    "en": "First Age (Elder Days)",
                    "de": "Erstes Zeitalter (Ältere Tage)",
                    "es": "Primera Edad (Días Antiguos)",
                    "fr": "Premier Âge (Jours Anciens)",
                    "it": "Prima Era (Giorni Antichi)",
                    "nl": "Eerste Tijdperk (Oudere Dagen)",
                    "pl": "Pierwsza Era (Dawne Dni)",
                    "pt": "Primeira Era (Dias Antigos)",
                    "ru": "Первая Эпоха (Древние Дни)",
                    "ja": "第一紀（古の日々）",
                    "zh": "第一纪元（远古时代）",
                    "ko": "제1시대 (고대)"
                },
                "second": {
                    "en": "Second Age (Númenor)",
                    "de": "Zweites Zeitalter (Númenor)",
                    "es": "Segunda Edad (Númenor)",
                    "fr": "Deuxième Âge (Númenor)",
                    "it": "Seconda Era (Númenor)",
                    "nl": "Tweede Tijdperk (Númenor)",
                    "pl": "Druga Era (Númenor)",
                    "pt": "Segunda Era (Númenor)",
                    "ru": "Вторая Эпоха (Нуменор)",
                    "ja": "第二紀（ヌーメノール）",
                    "zh": "第二纪元（努门诺尔）",
                    "ko": "제2시대 (누메노르)"
                },
                "third": {
                    "en": "Third Age (Ring War)",
                    "de": "Drittes Zeitalter (Ringkrieg)",
                    "es": "Tercera Edad (Guerra del Anillo)",
                    "fr": "Troisième Âge (Guerre de l'Anneau)",
                    "it": "Terza Era (Guerra dell'Anello)",
                    "nl": "Derde Tijdperk (Ringoorlog)",
                    "pl": "Trzecia Era (Wojna o Pierścień)",
                    "pt": "Terceira Era (Guerra do Anel)",
                    "ru": "Третья Эпоха (Война Кольца)",
                    "ja": "第三紀（指輪戦争）",
                    "zh": "第三纪元（魔戒之战）",
                    "ko": "제3시대 (반지 전쟁)"
                },
                "fourth": {
                    "en": "Fourth Age (Age of Men)",
                    "de": "Viertes Zeitalter (Zeitalter der Menschen)",
                    "es": "Cuarta Edad (Edad de los Hombres)",
                    "fr": "Quatrième Âge (Âge des Hommes)",
                    "it": "Quarta Era (Era degli Uomini)",
                    "nl": "Vierde Tijdperk (Tijdperk der Mensen)",
                    "pl": "Czwarta Era (Era Ludzi)",
                    "pt": "Quarta Era (Era dos Homens)",
                    "ru": "Четвертая Эпоха (Эпоха Людей)",
                    "ja": "第四紀（人の時代）",
                    "zh": "第四纪元（人类时代）",
                    "ko": "제4시대 (인간의 시대)"
                }
            }
        }
    },
    
    # Elven calendar data
    "elven_data": {
        "seasons": [
            {"quenya": "Tuilë", "sindarin": "Ethuil", "english": "Spring", "days": 54, "emoji": "🌸"},
            {"quenya": "Lairë", "sindarin": "Laer", "english": "Summer", "days": 72, "emoji": "☀️"},
            {"quenya": "Yávië", "sindarin": "Iavas", "english": "Autumn", "days": 54, "emoji": "🍂"},
            {"quenya": "Quellë", "sindarin": "Firith", "english": "Fading", "days": 72, "emoji": "🍃"},
            {"quenya": "Hrívë", "sindarin": "Rhîw", "english": "Winter", "days": 72, "emoji": "❄️"},
            {"quenya": "Coirë", "sindarin": "Echuir", "english": "Stirring", "days": 41, "emoji": "🌱"}
        ],
        "weekdays": [
            {"quenya": "Elenya", "sindarin": "Orgilion", "english": "Stars-day"},
            {"quenya": "Anarya", "sindarin": "Oranor", "english": "Sun-day"},
            {"quenya": "Isilya", "sindarin": "Orithil", "english": "Moon-day"},
            {"quenya": "Aldúya", "sindarin": "Orgaladhad", "english": "Two Trees-day"},
            {"quenya": "Menelya", "sindarin": "Ormenel", "english": "Heavens-day"},
            {"quenya": "Valanya", "sindarin": "Orbelain", "english": "Valar-day"}
        ],
        "special_days": [
            {"name": "Yestarë", "meaning": "First Day", "date": "before Spring"},
            {"name": "Loëndë", "meaning": "Mid-year's Day", "date": "between Spring and Summer"},
            {"name": "Yáviérë", "meaning": "Harvest Festival", "date": "after Autumn"},
            {"name": "Mettarë", "meaning": "Last Day", "date": "after Winter"}
        ],
        "star_signs": [
            "Menelmacar (Orion)", "Valacirca (Great Bear)", "Wilwarin (Butterfly)",
            "Telumendil (Lover of Heavens)", "Soronúmë (Eagle)", "Anarríma (Sun-border)",
            "Gil-galad (Star of Radiance)", "Elemmírë (Star-jewel)", "Helluin (Sirius)",
            "Carnil (Red Star)", "Luinil (Blue Star)", "Nénar (Water Star)"
        ],
        "time_periods": {
            "dawn": {"quenya": "Tindómë", "sindarin": "Minuial", "english": "Dawn twilight"},
            "morning": {"quenya": "Ára", "sindarin": "Aur", "english": "Morning"},
            "midday": {"quenya": "Endë", "sindarin": "Enedh", "english": "Midday"},
            "afternoon": {"quenya": "Undómë", "sindarin": "Uial", "english": "Afternoon"},
            "evening": {"quenya": "Andúnë", "sindarin": "Aduial", "english": "Evening twilight"},
            "night": {"quenya": "Lómë", "sindarin": "Fuin", "english": "Night"}
        }
    },
    
    # Additional metadata
    "reference_url": "http://tolkiengateway.net/wiki/Calendar_of_Imladris",
    "documentation_url": "https://www.glyphweb.com/arda/c/calendarofimladris.html",
    "origin": "J.R.R. Tolkien's Middle-earth legendarium",
    "created_by": "J.R.R. Tolkien",
    "introduced": "The Lord of the Rings (1954-1955)",
    
    # Example format
    "example": "F.A. 24, Tuilë 35 (Elenya)",
    "example_meaning": "Fourth Age year 24, 35th day of Spring, Stars-day",
    
    # Related calendars
    "related": ["shire", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "fantasy", "tolkien", "lotr", "middle_earth", "elven", "elvish",
        "rivendell", "imladris", "elrond", "quenya", "sindarin",
        "first_age", "second_age", "third_age", "fourth_age"
    ],
    
    # Special features
    "features": {
        "supports_ages": True,
        "supports_yen": True,
        "supports_seasons": True,
        "supports_special_days": True,
        "supports_star_signs": True,
        "precision": "day",
        "languages": ["quenya", "sindarin", "westron"]
    }
}


class RivendellCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying Rivendell/Elven Calendar from Middle-earth."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Rivendell calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', 'Rivendell Calendar')
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_rivendell_calendar"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:forest")
        
        # Configuration options with defaults
        config_defaults = CALENDAR_INFO.get("config_options", {})
        self._language_mode = config_defaults.get("language_mode", {}).get("default", "quenya")
        self._show_yen = config_defaults.get("show_yen", {}).get("default", True)
        self._show_star_signs = config_defaults.get("show_star_signs", {}).get("default", True)
        self._show_moon_phases = config_defaults.get("show_moon_phases", {}).get("default", True)
        self._age_reckoning = config_defaults.get("age_reckoning", {}).get("default", "fourth")
        
        # Elven data
        self._elven_data = CALENDAR_INFO["elven_data"]
        
        # Initialize state
        self._state = None
        self._elven_date = {}
        
        _LOGGER.debug(f"Initialized Rivendell Calendar sensor: {self._attr_name}")
    
    def set_options(self, options: Dict[str, Any]) -> None:
        """Set options from config flow."""
        if options:
            self._language_mode = options.get("language_mode", self._language_mode)
            self._show_yen = options.get("show_yen", self._show_yen)
            self._show_star_signs = options.get("show_star_signs", self._show_star_signs)
            self._show_moon_phases = options.get("show_moon_phases", self._show_moon_phases)
            self._age_reckoning = options.get("age_reckoning", self._age_reckoning)
            
            _LOGGER.debug(f"Rivendell sensor options updated: language_mode={self._language_mode}, "
                         f"show_yen={self._show_yen}, show_star_signs={self._show_star_signs}, "
                         f"show_moon_phases={self._show_moon_phases}, age_reckoning={self._age_reckoning}")
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Rivendell-specific attributes
        if self._elven_date:
            attrs.update(self._elven_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add special lore
            attrs["lore"] = self._get_daily_lore()
            
            # Add configuration status
            attrs["config"] = {
                "language_mode": self._language_mode,
                "show_yen": self._show_yen,
                "show_star_signs": self._show_star_signs,
                "show_moon_phases": self._show_moon_phases,
                "age_reckoning": self._age_reckoning
            }
        
        return attrs
    
    def _get_season(self, day_of_year: int) -> Dict[str, Any]:
        """Determine Elven season from day of year."""
        seasons = self._elven_data["seasons"]
        days_counted = 0
        
        for season in seasons:
            days_counted += season["days"]
            if day_of_year <= days_counted:
                day_in_season = day_of_year - (days_counted - season["days"])
                return {
                    **season,
                    "day_in_season": day_in_season
                }
        
        # Default to last season
        return {
            **seasons[-1],
            "day_in_season": day_of_year - (365 - seasons[-1]["days"])
        }
    
    def _get_time_period(self, hour: int) -> Dict[str, Any]:
        """Get Elven time period for hour."""
        periods = self._elven_data["time_periods"]
        
        if 5 <= hour < 7:
            period = periods["dawn"]
            emoji = "🌅"
        elif 7 <= hour < 12:
            period = periods["morning"]
            emoji = "🌤️"
        elif 12 <= hour < 15:
            period = periods["midday"]
            emoji = "☀️"
        elif 15 <= hour < 18:
            period = periods["afternoon"]
            emoji = "🌇"
        elif 18 <= hour < 21:
            period = periods["evening"]
            emoji = "🌆"
        else:
            period = periods["night"]
            emoji = "🌙"
        
        return {**period, "emoji": emoji}
    
    def _get_special_day(self, date: datetime) -> str:
        """Check for special Elven days."""
        special_days = {
            (3, 20): "🌅 Yestarë - First Day of the Year",
            (3, 25): "🌟 Elven New Year (Lady Day)",
            (6, 21): "☀️ Loëndë - Mid-year's Day",
            (9, 22): "🍂 Yáviérë - Harvest Festival (Bilbo & Frodo's Birthday)",
            (9, 29): "🌙 Durin's Day" if self._is_durins_day(date) else "",
            (12, 21): "⭐ Mettarë - Last Day of the Year"
        }
        return special_days.get((date.month, date.day), "")
    
    def _is_durins_day(self, date: datetime) -> bool:
        """Check if it's Durin's Day (first day of last moon of autumn)."""
        if date.month == 10 and 20 <= date.day <= 31:
            day_in_lunar = date.day % 29.5
            return day_in_lunar < 2
        return False
    
    def _get_sindarin_moon_phase(self, date: datetime) -> str:
        """Get moon phase in Sindarin."""
        day_in_lunar = date.day % 29.5
        
        if day_in_lunar < 2:
            return "🌑 Ithil Dû (Dark Moon)"
        elif day_in_lunar < 7:
            return "🌒 Ithil Orthad (Rising Moon)"
        elif day_in_lunar < 9:
            return "🌓 Ithil Perian (Half Moon)"
        elif day_in_lunar < 14:
            return "🌔 Ithil Síla (Bright Moon)"
        elif day_in_lunar < 16:
            return "🌕 Ithil Pennas (Full Moon)"
        elif day_in_lunar < 21:
            return "🌖 Ithil Dant (Falling Moon)"
        elif day_in_lunar < 23:
            return "🌗 Ithil Harn (Wounded Moon)"
        else:
            return "🌘 Ithil Fuin (Shadow Moon)"
    
    def _get_elven_greeting(self, hour: int) -> str:
        """Get appropriate Elven greeting for time of day."""
        greetings = {
            (5, 9): "Mae govannen (Well met)",
            (9, 12): "Alae (Good day)",
            (12, 17): "Mae aur (Good day)",
            (17, 21): "Mae dû (Good evening)",
            (21, 5): "Mae fuin (Good night)"
        }
        
        for (start, end), greeting in greetings.items():
            if start <= hour < end or (start > end and (hour >= start or hour < end)):
                return greeting
        return "Mae govannen"
    
    def _get_daily_lore(self) -> str:
        """Get a piece of Elven lore for the day."""
        day = datetime.now().day
        lore_pieces = [
            "The light of Eärendil shines brightest tonight",
            "Vilya, mightiest of the Three, preserves this realm",
            "The Last Homely House welcomes all weary travelers",
            "In Imladris, time flows like the Bruinen - sometimes swift, sometimes still",
            "The Council of Elrond convened on October 25th, T.A. 3018",
            "Elrond Half-elven has dwelt here since S.A. 1697",
            "The shards of Narsil were kept here for 3000 years",
            "Songs of the Elder Days echo in these halls",
            "The memory of Elendil is preserved in these archives",
            "Gil-galad's star once shone above these valleys"
        ]
        
        # Use day as index (cycling through lore)
        return lore_pieces[day % len(lore_pieces)]
    
    def _calculate_elven_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Elven Calendar date from Earth date."""
        # Calculate years from reference point (year 2000 = start of Fourth Age)
        years_since_2000 = earth_date.year - 2000
        fourth_age_year = 1 + years_since_2000
        
        # Calculate yén (144-year cycle)
        yen = (fourth_age_year - 1) // 144 + 1
        loa = (fourth_age_year - 1) % 144 + 1
        
        # Calculate day of year
        day_of_year = earth_date.timetuple().tm_yday
        
        # Adjust for calendar starting on March 20 (Spring Equinox)
        if earth_date.month < 3 or (earth_date.month == 3 and earth_date.day < 20):
            # Still in previous Elven year
            day_of_year = day_of_year + 365 - 79
            fourth_age_year -= 1
            loa = (fourth_age_year - 1) % 144 + 1
        else:
            day_of_year = day_of_year - 79
        
        if day_of_year <= 0:
            day_of_year += 365
        
        # Determine season and day within season
        season_data = self._get_season(day_of_year)
        
        # Get weekday (6-day Elven week)
        day_index = earth_date.toordinal() % 6
        weekday_data = self._elven_data["weekdays"][day_index]
        
        # Get time of day
        time_period = self._get_time_period(earth_date.hour)
        
        # Check for special days
        special_day = self._get_special_day(earth_date)
        
        # Get star sign (monthly)
        star_sign = self._elven_data["star_signs"][earth_date.month - 1] if self._show_star_signs else ""
        
        # Moon phases in Sindarin
        moon_phase = self._get_sindarin_moon_phase(earth_date) if self._show_moon_phases else ""
        
        # Determine Age
        age_names = {
            "first": ("First Age", "F.A.", "Elain Einior"),
            "second": ("Second Age", "S.A.", "Elain Edin"),
            "third": ("Third Age", "T.A.", "Elain Nedein"),
            "fourth": ("Fourth Age", "F.A.", "Elain Canthui")
        }
        age_name, age_abbr, age_sindarin = age_names[self._age_reckoning]
        
        # Build display strings based on language mode
        if self._language_mode == "quenya":
            season_name = season_data["quenya"]
            weekday_name = weekday_data["quenya"]
            time_name = time_period["quenya"]
        elif self._language_mode == "sindarin":
            season_name = season_data["sindarin"]
            weekday_name = weekday_data["sindarin"]
            time_name = time_period["sindarin"]
        elif self._language_mode == "english":
            season_name = season_data["english"]
            weekday_name = weekday_data["english"]
            time_name = time_period["english"]
        else:  # mixed
            season_name = f"{season_data['quenya']} ({season_data['english']})"
            weekday_name = f"{weekday_data['quenya']} ({weekday_data['english']})"
            time_name = f"{time_period['quenya']} ({time_period['english']})"
        
        # Create result
        result = {
            "age": age_abbr,
            "age_name": age_name,
            "age_sindarin": age_sindarin,
            "year": fourth_age_year,
            "season": f"{season_data['emoji']} {season_name}",
            "season_quenya": season_data["quenya"],
            "season_sindarin": season_data["sindarin"],
            "day_in_season": season_data["day_in_season"],
            "weekday": weekday_name,
            "weekday_quenya": weekday_data["quenya"],
            "weekday_sindarin": weekday_data["sindarin"],
            "time_period": f"{time_period['emoji']} {time_name}",
            "full_date": f"{age_abbr} {fourth_age_year}, {season_name} {season_data['day_in_season']}"
        }
        
        # Add optional data
        if self._show_yen:
            result["yen"] = yen
            result["loa"] = loa
            result["yen_display"] = f"Yén {yen}, Loa {loa}"
        
        if star_sign:
            result["star_sign"] = f"✨ {star_sign}"
        
        if moon_phase:
            result["moon_phase"] = moon_phase
        
        if special_day:
            result["special_day"] = special_day
        
        # Add poetic elements
        result["elven_greeting"] = self._get_elven_greeting(earth_date.hour)
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        now = datetime.now()
        self._elven_date = self._calculate_elven_date(now)
        
        # Format state based on language mode
        if self._language_mode == "mixed":
            self._state = f"{self._elven_date['full_date']} ({self._elven_date['weekday']})"
        else:
            self._state = self._elven_date["full_date"]
        
        _LOGGER.debug(f"Updated Rivendell calendar to {self._state}")