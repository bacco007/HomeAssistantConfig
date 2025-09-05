from __future__ import annotations

from datetime import datetime, timedelta, timezone
import math
import json
import logging
import os
import io
import base64
from typing import Dict, Any, Optional, Tuple, List

try:
    from PIL import Image, ImageDraw, ImageFont  # optional
except Exception:
    Image = None
    ImageDraw = None
    ImageFont = None

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CALENDAR METADATA
# ============================================

UPDATE_INTERVAL = 300  # seconds

CALENDAR_INFO = {
    "id": "solar_system",
    "version": "1.0.1",
    "icon": "mdi:orbit",
    "category": "space",
    "accuracy": "approximate",
    "update_interval": UPDATE_INTERVAL,

    # Multi-language names
    "name": {
        "en": "Solar System Positions",
        "de": "Sonnensystem Positionen",
        "es": "Posiciones del Sistema Solar",
        "fr": "Positions du Système Solaire",
        "it": "Posizioni del Sistema Solare",
        "nl": "Zonnestelsel Posities",
        "pl": "Pozycje Układu Słonecznego",
        "pt": "Posições do Sistema Solar",
        "ru": "Позиции Солнечной системы",
        "ja": "太陽系の位置",
        "zh": "太阳系位置",
        "ko": "태양계 위치"
    },

    # Short descriptions for UI
    "description": {
        "en": "Current positions of planets in the solar system.",
        "de": "Aktuelle Positionen der Planeten im Sonnensystem.",
        "es": "Posiciones actuales de los planetas en el sistema solar.",
        "fr": "Positions actuelles des planètes dans le système solaire.",
        "it": "Posizioni attuali dei pianeti nel sistema solare.",
        "nl": "Huidige posities van planeten in het zonnestelsel.",
        "pl": "Aktualne pozycje planet w Układzie Słonecznym.",
        "pt": "Posições atuais dos planetas no sistema solar.",
        "ru": "Текущие позиции планет в Солнечной системе.",
        "ja": "太陽系の惑星の現在位置。",
        "zh": "太阳系行星的当前位置。",
        "ko": "태양계 행성의 현재 위치."
    },

    # Solar system specific data
    "solar_data": {
        # Planets and special objects (simplified Keplerian elements, J2000.0)
        "planets": {
            "mercury": {
                "name": {
                    "en": "Mercury", "de": "Merkur", "es": "Mercurio", "fr": "Mercure",
                    "it": "Mercurio", "nl": "Mercurius", "pl": "Merkury", "pt": "Mercúrio",
                    "ru": "Меркурий", "ja": "水星", "zh": "水星", "ko": "수성"
                },
                "symbol": "☿",
                "semi_major_axis": 0.387098,
                "eccentricity": 0.205635,
                "inclination": 7.005,
                "mean_longitude": 252.250,
                "perihelion_longitude": 77.456,
                "orbital_period": 87.969
            },
            "venus": {
                "name": {
                    "en": "Venus", "de": "Venus", "es": "Venus", "fr": "Vénus",
                    "it": "Venere", "nl": "Venus", "pl": "Wenus", "pt": "Vênus",
                    "ru": "Венера", "ja": "金星", "zh": "金星", "ko": "금성"
                },
                "symbol": "♀",
                "semi_major_axis": 0.723332,
                "eccentricity": 0.006772,
                "inclination": 3.395,
                "mean_longitude": 181.979,
                "perihelion_longitude": 131.564,
                "orbital_period": 224.701
            },
            "earth": {
                "name": {
                    "en": "Earth", "de": "Erde", "es": "Tierra", "fr": "Terre",
                    "it": "Terra", "nl": "Aarde", "pl": "Ziemia", "pt": "Terra",
                    "ru": "Земля", "ja": "地球", "zh": "地球", "ko": "지구"
                },
                "symbol": "⊕",
                "semi_major_axis": 1.0,
                "eccentricity": 0.016709,
                "inclination": 0.0,
                "mean_longitude": 100.464,
                "perihelion_longitude": 102.937,
                "orbital_period": 365.256
            },
            "mars": {
                "name": {
                    "en": "Mars", "de": "Mars", "es": "Marte", "fr": "Mars",
                    "it": "Marte", "nl": "Mars", "pl": "Mars", "pt": "Marte",
                    "ru": "Марс", "ja": "火星", "zh": "火星", "ko": "화성"
                },
                "symbol": "♂",
                "semi_major_axis": 1.523679,
                "eccentricity": 0.0934,
                "inclination": 1.85,
                "mean_longitude": 355.433,
                "perihelion_longitude": 336.060,
                "orbital_period": 686.980
            },
            "jupiter": {
                "name": {
                    "en": "Jupiter", "de": "Jupiter", "es": "Júpiter", "fr": "Jupiter",
                    "it": "Giove", "nl": "Jupiter", "pl": "Jowisz", "pt": "Júpiter",
                    "ru": "Юпитер", "ja": "木星", "zh": "木星", "ko": "목성"
                },
                "symbol": "♃",
                "semi_major_axis": 5.202887,
                "eccentricity": 0.048498,
                "inclination": 1.303,
                "mean_longitude": 34.351,
                "perihelion_longitude": 14.331,
                "orbital_period": 4332.589
            },
            "saturn": {
                "name": {
                    "en": "Saturn", "de": "Saturn", "es": "Saturno", "fr": "Saturne",
                    "it": "Saturno", "nl": "Saturnus", "pl": "Saturn", "pt": "Saturno",
                    "ru": "Сатурн", "ja": "土星", "zh": "土星", "ko": "토성"
                },
                "symbol": "♄",
                "semi_major_axis": 9.536676,
                "eccentricity": 0.053862,
                "inclination": 2.485,
                "mean_longitude": 50.077,
                "perihelion_longitude": 93.057,
                "orbital_period": 10759.22
            },
            "uranus": {
                "name": {
                    "en": "Uranus", "de": "Uranus", "es": "Urano", "fr": "Uranus",
                    "it": "Urano", "nl": "Uranus", "pl": "Uran", "pt": "Urano",
                    "ru": "Уран", "ja": "天王星", "zh": "天王星", "ko": "천왕성"
                },
                "symbol": "♅",
                "semi_major_axis": 19.189165,
                "eccentricity": 0.047257,
                "inclination": 0.772,
                "mean_longitude": 314.055,
                "perihelion_longitude": 173.005,
                "orbital_period": 30688.5
            },
            "neptune": {
                "name": {
                    "en": "Neptune", "de": "Neptun", "es": "Neptuno", "fr": "Neptune",
                    "it": "Nettuno", "nl": "Neptunus", "pl": "Neptun", "pt": "Netuno",
                    "ru": "Нептун", "ja": "海王星", "zh": "海王星", "ko": "해왕성"
                },
                "symbol": "♆",
                "semi_major_axis": 30.069923,
                "eccentricity": 0.008859,
                "inclination": 1.769,
                "mean_longitude": 304.880,
                "perihelion_longitude": 48.123,
                "orbital_period": 60182.0
            },
            "pluto": {
                "name": {
                    "en": "Pluto (Dwarf Planet)", "de": "Pluto (Zwergplanet)", "es": "Plutón (Planeta Enano)",
                    "fr": "Pluton (Planète Naine)", "it": "Plutone (Pianeta Nano)", "nl": "Pluto (Dwergplaneet)",
                    "pl": "Pluton (Planeta Karłowata)", "pt": "Plutão (Planeta Anão)",
                    "ru": "Плутон (Карликовая планета)", "ja": "冥王星（準惑星）",
                    "zh": "冥王星（矮行星）", "ko": "명왕성 (왜행성)"
                },
                "symbol": "♇",
                "semi_major_axis": 39.482117,
                "eccentricity": 0.2488,
                "inclination": 17.16,
                "mean_longitude": 238.929,
                "perihelion_longitude": 224.067,
                "orbital_period": 90560.0
            },
            # Deep-space probes (visualization only; crude kinematics)
            "voyager1": {
                "name": {
                    "en": "Voyager 1", "de": "Voyager 1", "es": "Voyager 1", "fr": "Voyager 1",
                    "it": "Voyager 1", "nl": "Voyager 1", "pl": "Voyager 1", "pt": "Voyager 1",
                    "ru": "Вояджер-1", "ja": "ボイジャー1号", "zh": "旅行者1号", "ko": "보이저 1호"
                },
                "symbol": "🛰",
                "special_type": "probe",
                # approx heliolongitude anchor (deg, J2000) and AU at epoch and outward speed in AU/yr
                "anchor_longitude": 290.0,
                "anchor_au": 140.0,
                "speed_au_per_year": 3.6
            },
            "voyager2": {
                "name": {
                    "en": "Voyager 2", "de": "Voyager 2", "es": "Voyager 2", "fr": "Voyager 2",
                    "it": "Voyager 2", "nl": "Voyager 2", "pl": "Voyager 2", "pt": "Voyager 2",
                    "ru": "Вояджер-2", "ja": "ボイジャー2号", "zh": "旅行者2号", "ko": "보이저 2호"
                },
                "symbol": "🛰",
                "special_type": "probe",
                "anchor_longitude": 305.0,
                "anchor_au": 115.0,
                "speed_au_per_year": 3.3
            },
        },

        # Zodiac constellations for position reference (30° sectors)
        "constellations": [
            {"name": {"en": "Aries", "de": "Widder", "es": "Aries", "fr": "Bélier", "it": "Ariete", "nl": "Ram", "pl": "Baran", "pt": "Áries", "ru": "Овен", "ja": "牡羊座", "zh": "白羊座", "ko": "양자리"}, "start": 0, "symbol": "♈"},
            {"name": {"en": "Taurus", "de": "Stier", "es": "Tauro", "fr": "Taureau", "it": "Toro", "nl": "Stier", "pl": "Byk", "pt": "Touro", "ru": "Телец", "ja": "牡牛座", "zh": "金牛座", "ko": "황소자리"}, "start": 30, "symbol": "♉"},
            {"name": {"en": "Gemini", "de": "Zwillinge", "es": "Géminis", "fr": "Gémeaux", "it": "Gemelli", "nl": "Tweelingen", "pl": "Bliźnięta", "pt": "Gêmeos", "ru": "Близнецы", "ja": "双子座", "zh": "双子座", "ko": "쌍둥이자리"}, "start": 60, "symbol": "♊"},
            {"name": {"en": "Cancer", "de": "Krebs", "es": "Cáncer", "fr": "Cancer", "it": "Cancro", "nl": "Kreeft", "pl": "Rak", "pt": "Câncer", "ru": "Рак", "ja": "蟹座", "zh": "巨蟹座", "ko": "게자리"}, "start": 90, "symbol": "♋"},
            {"name": {"en": "Leo", "de": "Löwe", "es": "Leo", "fr": "Lion", "it": "Leone", "nl": "Leeuw", "pl": "Lew", "pt": "Leão", "ru": "Лев", "ja": "獅子座", "zh": "狮子座", "ko": "사자자리"}, "start": 120, "symbol": "♌"},
            {"name": {"en": "Virgo", "de": "Jungfrau", "es": "Virgo", "fr": "Vierge", "it": "Vergine", "nl": "Maagd", "pl": "Panna", "pt": "Virgem", "ru": "Дева", "ja": "乙女座", "zh": "处女座", "ko": "처녀자리"}, "start": 150, "symbol": "♍"},
            {"name": {"en": "Libra", "de": "Waage", "es": "Libra", "fr": "Balance", "it": "Bilancia", "nl": "Weegschaal", "pl": "Waga", "pt": "Libra", "ru": "Весы", "ja": "天秤座", "zh": "天秤座", "ko": "천칭자리"}, "start": 180, "symbol": "♎"},
            {"name": {"en": "Scorpio", "de": "Skorpion", "es": "Escorpio", "fr": "Scorpion", "it": "Scorpione", "nl": "Schorpioen", "pl": "Skorpion", "pt": "Escorpião", "ru": "Скорпион", "ja": "蠍座", "zh": "天蝎座", "ko": "전갈자리"}, "start": 210, "symbol": "♏"},
            {"name": {"en": "Sagittarius", "de": "Schütze", "es": "Sagitario", "fr": "Sagittaire", "it": "Sagittario", "nl": "Boogschutter", "pl": "Strzelec", "pt": "Sagitário", "ru": "Стрелец", "ja": "射手座", "zh": "射手座", "ko": "궁수자리"}, "start": 240, "symbol": "♐"},
            {"name": {"en": "Capricorn", "de": "Steinbock", "es": "Capricornio", "fr": "Capricorne", "it": "Capricorno", "nl": "Steenbok", "pl": "Koziorożec", "pt": "Capricórnio", "ru": "Козерог", "ja": "山羊座", "zh": "摩羯座", "ko": "염소자리"}, "start": 270, "symbol": "♑"},
            {"name": {"en": "Aquarius", "de": "Wassermann", "es": "Acuario", "fr": "Verseau", "it": "Acquario", "nl": "Waterman", "pl": "Wodnik", "pt": "Aquário", "ru": "Водолей", "ja": "水瓶座", "zh": "水瓶座", "ko": "물병자리"}, "start": 300, "symbol": "♒"},
            {"name": {"en": "Pisces", "de": "Fische", "es": "Piscis", "fr": "Poissons", "it": "Pesci", "nl": "Vissen", "pl": "Ryby", "pt": "Peixes", "ru": "Рыбы", "ja": "魚座", "zh": "双鱼座", "ko": "물고기자리"}, "start": 330, "symbol": "♓"}
        ]
    },

    "reference_url": "https://en.wikipedia.org/wiki/Planetary_positions",

    "config_options": {
        "display_planet": {
            "type": "select",
            "default": "all",
            "label": {
                "en": "Display Planet",
                "de": "Planet anzeigen",
                "es": "Mostrar Planeta",
                "fr": "Afficher Planète",
                "it": "Mostra Pianeta",
                "nl": "Planeet Weergeven",
                "pl": "Wyświetl Planetę",
                "pt": "Exibir Planeta",
                "ru": "Показать планету",
                "ja": "惑星を表示",
                "zh": "显示行星",
                "ko": "행성 표시"
            },
            "description": {
                "en": "Select which planet to display or all planets",
                "de": "Wählen Sie welchen Planeten oder alle Planeten anzeigen",
                "es": "Seleccione qué planeta mostrar o todos los planetas",
                "fr": "Sélectionnez quelle planète afficher ou toutes les planètes",
                "it": "Seleziona quale pianeta visualizzare o tutti i pianeti",
                "nl": "Selecteer welke planeet weer te geven of alle planeten",
                "pl": "Wybierz planetę do wyświetlenia lub wszystkie planety",
                "pt": "Selecione qual planeta exibir ou todos os planetas",
                "ru": "Выберите планету для отображения или все планеты",
                "ja": "表示する惑星または全惑星を選択",
                "zh": "选择要显示的行星或所有行星",
                "ko": "표시할 행성 또는 모든 행성 선택"
            },
            "options": [
                {"value": "all", "label": {"en": "All Planets", "de": "Alle Planeten", "es": "Todos los Planetas", "fr": "Toutes les Planètes", "it": "Tutti i Pianeti", "nl": "Alle Planeten", "pl": "Wszystkie Planety", "pt": "Todos os Planetas", "ru": "Все планеты", "ja": "すべての惑星", "zh": "所有行星", "ko": "모든 행성"}},
                {"value": "mercury", "label": {"en": "Mercury","de": "Merkur","es": "Mercurio","fr": "Mercure","it": "Mercurio","nl": "Mercurius","pl": "Merkury","pt": "Mercúrio","ru": "Меркурий","ja": "水星","zh": "水星","ko": "수성"}},
                {"value": "venus", "label": {"en": "Venus","de": "Venus","es": "Venus","fr": "Vénus","it": "Venere","nl": "Venus","pl": "Wenus","pt": "Vênus","ru": "Венера","ja": "金星","zh": "金星","ko": "금성"}},
                {"value": "earth", "label": {"en": "Earth","de": "Erde","es": "Tierra","fr": "Terre","it": "Terra","nl": "Aarde","pl": "Ziemia","pt": "Terra","ru": "Земля","ja": "地球","zh": "地球","ko": "지구"}},
                {"value": "mars", "label": {"en": "Mars","de": "Mars","es": "Marte","fr": "Mars","it": "Marte","nl": "Mars","pl": "Mars","pt": "Marte","ru": "Марс","ja": "火星","zh": "火星","ko": "화성"}},
                {"value": "jupiter", "label": {"en": "Jupiter","de": "Jupiter","es": "Júpiter","fr": "Jupiter","it": "Giove","nl": "Jupiter","pl": "Jowisz","pt": "Júpiter","ru": "Юпитер","ja": "木星","zh": "木星","ko": "목성"}},
                {"value": "saturn", "label": {"en": "Saturn","de": "Saturn","es": "Saturno","fr": "Saturne","it": "Saturno","nl": "Saturnus","pl": "Saturn","pt": "Saturno","ru": "Сатурн","ja": "土星","zh": "土星","ko": "토성"}},
                {"value": "uranus", "label": {"en": "Uranus","de": "Uranus","es": "Urano","fr": "Uranus","it": "Urano","nl": "Uranus","pl": "Uran","pt": "Urano","ru": "Уран","ja": "天王星","zh": "天王星","ko": "천왕성"}},
                {"value": "neptune", "label": {"en": "Neptune","de": "Neptun","es": "Neptuno","fr": "Neptune","it": "Nettuno","nl": "Neptunus","pl": "Neptun","pt": "Netuno","ru": "Нептун","ja": "海王星","zh": "海王星","ko": "해왕성"}},
                {"value": "pluto", "label": {"en": "Pluto (Dwarf)","de": "Pluto (Zwergplanet)","es": "Plutón (Enano)","fr": "Pluton (Naine)","it": "Plutone (Nano)","nl": "Pluto (Dwerg)","pl": "Pluton (Karłowata)","pt": "Plutão (Anão)","ru": "Плутон (Карлик)","ja": "冥王星（準惑星）","zh": "冥王星（矮行星）","ko": "명왕성 (왜행성)"}},
                {"value": "voyager1", "label": {"en": "Voyager 1","de": "Voyager 1","es": "Voyager 1","fr": "Voyager 1","it": "Voyager 1","nl": "Voyager 1","pl": "Voyager 1","pt": "Voyager 1","ru": "Вояджер-1","ja": "ボイジャー1号","zh": "旅行者1号","ko": "보이저 1호"}},
                {"value": "voyager2", "label": {"en": "Voyager 2","de": "Voyager 2","es": "Voyager 2","fr": "Voyager 2","it": "Voyager 2","nl": "Voyager 2","pl": "Voyager 2","pt": "Voyager 2","ru": "Вояджер-2","ja": "ボイジャー2号","zh": "旅行者2号","ko": "보이저 2호"}}
            ]
        },
        "coordinate_system": {
            "type": "select",
            "default": "heliocentric",
            "label": {
                "en": "Coordinate System",
                "de": "Koordinatensystem",
                "es": "Sistema de Coordenadas",
                "fr": "Système de Coordonnées",
                "it": "Sistema di Coordinate",
                "nl": "Coördinatensysteem",
                "pl": "Układ Współrzędnych",
                "pt": "Sistema de Coordenadas",
                "ru": "Система координат",
                "ja": "座標系",
                "zh": "坐标系",
                "ko": "좌표계"
            },
            "description": {
                "en": "Choose heliocentric (Sun-centered) or geocentric (Earth-centered) view",
                "de": "Wählen Sie heliozentrisch (sonnenzentriert) oder geozentrisch (erdzentriert)",
                "es": "Elija vista heliocéntrica (centrada en el Sol) o geocéntrica (centrada en la Tierra)",
                "fr": "Choisissez vue héliocentrique (centrée sur le Soleil) ou géocentrique (centrée sur la Terre)",
                "it": "Scegli vista eliocentrica (centrata sul Sole) o geocentrica (centrata sulla Terra)",
                "nl": "Kies heliocentrisch (zon-gecentreerd) of geocentrisch (aarde-gecentreerd)",
                "pl": "Wybierz widok heliocentryczny (słoneczny) lub geocentryczny (ziemski)",
                "pt": "Escolha visão heliocêntrica (centrada no Sol) ou geocêntrica (centrada na Terra)",
                "ru": "Выберите гелиоцентрический (Солнце в центре) или геоцентрический (Земля в центре) вид",
                "ja": "太陽中心（太陽系）または地球中心（地心）ビューを選択",
                "zh": "选择日心（以太阳为中心）或地心（以地球为中心）视图",
                "ko": "태양 중심(태양계) 또는 지구 중심(지구계) 보기 선택"
            },
            "options": [
                {"value": "heliocentric", "label": {
                    "en": "Heliocentric (Sun-centered)",
                    "de": "Heliozentrisch (Sonnenzentriert)",
                    "es": "Heliocéntrico (Centrado en el Sol)",
                    "fr": "Héliocentrique (Centré sur le Soleil)",
                    "it": "Eliocentrico (Centrato sul Sole)",
                    "nl": "Heliocentrisch (Zon-gecentreerd)",
                    "pl": "Heliocentryczny (Słoneczny)",
                    "pt": "Heliocêntrico (Centrado no Sol)",
                    "ru": "Гелиоцентрический (Солнце в центре)",
                    "ja": "太陽中心",
                    "zh": "日心（以太阳为中心）",
                    "ko": "태양 중심"
                }},
                {"value": "geocentric", "label": {
                    "en": "Geocentric (Earth-centered)",
                    "de": "Geozentrisch (Erdzentriert)",
                    "es": "Geocéntrico (Centrado en la Tierra)",
                    "fr": "Géocentrique (Centré sur la Terre)",
                    "it": "Geocentrico (Centrato sulla Terra)",
                    "nl": "Geocentrisch (Aarde-gecentreerd)",
                    "pl": "Geocentryczny (Ziemski)",
                    "pt": "Geocêntrico (Centrado na Terra)",
                    "ru": "Геоцентрический (Земля в центре)",
                    "ja": "地球中心",
                    "zh": "地心（以地球为中心）",
                    "ko": "지구 중심"
                }}
            ]
        },
        "observer_latitude": {
            "type": "number",
            "default": 0.0,
            "min": -90.0, "max": 90.0, "step": 0.01,
            "label": {"en": "Observer Latitude (uses HA location if empty)", "de": "Beobachter Breitengrad (nutzt HA-Position wenn leer)", "es": "Latitud del Observador (usa ubicación HA si está vacío)", "fr": "Latitude de l'Observateur (utilise position HA si vide)", "it": "Latitudine dell'Osservatore (usa posizione HA se vuoto)", "nl": "Waarnemersbreedte (gebruikt HA-locatie indien leeg)", "pl": "Szerokość Geograficzna (używa lokalizacji HA jeśli puste)", "pt": "Latitude do Observador (usa localização HA se vazio)", "ru": "Широта наблюдателя (использует местоположение HA если пусто)", "ja": "観測者の緯度（空の場合はHA位置を使用）", "zh": "观察者纬度（如果为空则使用HA位置）", "ko": "관찰자 위도 (비어있으면 HA 위치 사용)"},
            "description": {"en": "Your latitude (-90 to 90). Leave at 0 to use Home Assistant location", "de": "Ihr Breitengrad (-90 bis 90). Bei 0 wird die Home Assistant Position verwendet", "es": "Su latitud (-90 a 90). Deje en 0 para usar la ubicación de Home Assistant", "fr": "Votre latitude (-90 à 90). Laissez à 0 pour utiliser la position Home Assistant", "it": "La tua latitudine (-90 a 90). Lascia a 0 per usare la posizione di Home Assistant", "nl": "Uw breedtegraad (-90 tot 90). Laat op 0 om Home Assistant locatie te gebruiken", "pl": "Twoja szerokość (-90 do 90). Zostaw 0 aby użyć lokalizacji Home Assistant", "pt": "Sua latitude (-90 a 90). Deixe em 0 para usar a localização do Home Assistant", "ru": "Ваша широта (-90 до 90). Оставьте 0 для использования местоположения Home Assistant", "ja": "緯度（-90から90）。0のままにするとHome Assistantの位置を使用", "zh": "纬度（-90至90）。保留0以使用Home Assistant位置", "ko": "위도 (-90에서 90). 0으로 두면 Home Assistant 위치 사용"}
        },
        "observer_longitude": {
            "type": "number",
            "default": 0.0,
            "min": -180.0, "max": 180.0, "step": 0.01,
            "label": {"en": "Observer Longitude (uses HA location if empty)", "de": "Beobachter Längengrad (nutzt HA-Position wenn leer)", "es": "Longitud del Observador (usa ubicación HA si está vacío)", "fr": "Longitude de l'Observateur (utilise position HA si vide)", "it": "Longitudine dell'Osservatore (usa posizione HA se vuoto)", "nl": "Waarnemerslengte (gebruikt HA-locatie indien leeg)", "pl": "Długość Geograficzna (używa lokalizacji HA jeśli puste)", "pt": "Longitude do Observador (usa localização HA se vazio)", "ru": "Долгота наблюдателя (использует местоположение HA если пусто)", "ja": "観測者の経度（空の場合はHA位置を使用）", "zh": "观察者经度（如果为空则使用HA位置）", "ko": "관찰자 경도 (비어있으면 HA 위치 사용)"},
            "description": {"en": "Your longitude (-180 to 180). Leave at 0 to use Home Assistant location", "de": "Ihr Längengrad (-180 bis 180). Bei 0 wird die Home Assistant Position verwendet", "es": "Su longitud (-180 a 180). Deje en 0 para usar la ubicación de Home Assistant", "fr": "Votre longitude (-180 à 180). Laissez à 0 pour utiliser la position Home Assistant", "it": "La tua longitudine (-180 a 180). Lascia a 0 per usare la posizione di Home Assistant", "nl": "Uw lengtegraad (-180 tot 180). Laat op 0 om Home Assistant locatie te gebruiken", "pl": "Twoja długość (-180 do 180). Zostaw 0 aby użyć lokalizacji Home Assistant", "pt": "Sua longitude (-180 a 180). Deixe em 0 para usar a localização do Home Assistant", "ru": "Ваша долгота (-180 до 180). Оставьте 0 для использования местоположения Home Assistant", "ja": "経度（-180から180）。0のままにするとHome Assistantの位置を使用", "zh": "经度（-180至180）。保留0以使用Home Assistant位置", "ko": "경도 (-180에서 180). 0으로 두면 Home Assistant 위치 사용"}
        },
        "show_visibility": {
            "type": "boolean",
            "default": True,
            "label": {"en": "Show Visibility Times","de": "Sichtbarkeitszeiten anzeigen","es": "Mostrar Tiempos de Visibilidad","fr": "Afficher les Heures de Visibilité","it": "Mostra Tempi di Visibilità","nl": "Zichtbaarheidstijden Tonen","pl": "Pokaż Czasy Widoczności","pt": "Mostrar Tempos de Visibilidade","ru": "Показать время видимости","ja": "可視時間を表示","zh": "显示可见时间","ko": "가시 시간 표시"},
            "description": {"en": "Display when planets are visible from your location","de": "Anzeigen wann Planeten von Ihrem Standort sichtbar sind","es": "Mostrar cuándo los planetas son visibles desde su ubicación","fr": "Afficher quand les planètes sont visibles depuis votre position","it": "Visualizza quando i pianeti sono visibili dalla tua posizione","nl": "Weergeven wanneer planeten zichtbaar zijn vanaf uw locatie","pl": "Wyświetl, kiedy planety są widoczne z Twojej lokalizacji","pt": "Exibir quando os planetas são visíveis da sua localização","ru": "Отображать, когда планеты видны из вашего местоположения","ja": "あなたの場所から惑星が見える時間を表示","zh": "显示从您的位置可以看到行星的时间","ko": "당신의 위치에서 행성이 보이는 시간 표시"}
        },
        "show_distance": {
            "type": "boolean",
            "default": True,
            "label": {"en": "Show Distance","de": "Entfernung anzeigen","es": "Mostrar Distancia","fr": "Afficher Distance","it": "Mostra Distanza","nl": "Afstand Tonen","pl": "Pokaż Odległość","pt": "Mostrar Distância","ru": "Показать расстояние","ja": "距離を表示","zh": "显示距离","ko": "거리 표시"},
            "description": {"en": "Display distance from Sun (or Earth in geocentric mode) in AU and km","de": "Entfernung von der Sonne anzeigen (oder Erde im geozentrischen Modus) in AE und km","es": "Mostrar distancia desde el Sol (o Tierra en modo geocéntrico) en UA y km","fr": "Afficher la distance du Soleil (ou de la Terre en mode géocentrique) en UA et km","it": "Visualizza distanza dal Sole (o Terra in modalità geocentrica) in UA e km","nl": "Afstand van de zon weergeven (of aarde in geocentrische modus) in AE en km","pl": "Wyświetl odległość od Słońca (lub Ziemi w trybie geocentrycznym) w j.a. i km","pt": "Exibir distância do Sol (ou Terra no modo geocêntrico) em UA e km","ru": "Отображать расстояние от Солнца (или Земли в геоцентрическом режиме) в а.е. и км","ja": "太陽からの距離を表示（地心モードでは地球から）AUとkm","zh": "显示与太阳的距离（地心模式下为地球）以AU和km为单位","ko": "태양으로부터의 거리 표시 (지구 중심 모드에서는 지구) AU와 km 단위"}
        },
        "show_constellation": {
            "type": "boolean",
            "default": True,
            "label": {"en": "Show Constellation","de": "Sternbild anzeigen","es": "Mostrar Constelación","fr": "Afficher Constellation","it": "Mostra Costellazione","nl": "Sterrenbeeld Tonen","pl": "Pokaż Konstelację","pt": "Mostrar Constelação","ru": "Показать созвездие","ja": "星座を表示","zh": "显示星座","ko": "별자리 표시"},
            "description": {"en": "Display zodiac constellation where planet is located","de": "Tierkreissternbild anzeigen, in dem sich der Planet befindet","es": "Mostrar constelación del zodíaco donde se encuentra el planeta","fr": "Afficher la constellation du zodiaque où se trouve la planète","it": "Visualizza costellazione zodiacale dove si trova il pianeta","nl": "Dierenriem sterrenbeeld weergeven waar planeet zich bevindt","pl": "Wyświetl konstelację zodiaku, w której znajduje się planeta","pt": "Exibir constelação do zodíaco onde o planeta está localizado","ru": "Отображать зодиакальное созвездие, где находится планета","ja": "惑星が位置する黄道星座を表示","zh": "显示行星所在的黄道星座","ko": "행성이 위치한 황도 별자리 표시"}
        },
        "show_retrograde": {
            "type": "boolean",
            "default": True,
            "label": {"en": "Show Retrograde Motion","de": "Rückläufige Bewegung anzeigen","es": "Mostrar Movimiento Retrógrado","fr": "Afficher Mouvement Rétrograde","it": "Mostra Moto Retrogrado","nl": "Retrograde Beweging Tonen","pl": "Pokaż Ruch Wsteczny","pt": "Mostrar Movimento Retrógrado","ru": "Показать ретроградное движение","ja": "逆行を表示","zh": "显示逆行","ko": "역행 표시"},
            "description": {"en": "Indicate when planets appear to move backward","de": "Anzeigen wenn Planeten rückläufig erscheinen","es": "Indicar cuando los planetas parecen moverse hacia atrás","fr": "Indiquer quand les planètes semblent reculer","it": "Indica quando i pianeti sembrano muoversi all'indietro","nl": "Aangeven wanneer planeten achteruit lijken te bewegen","pl": "Wskaż, gdy planety wydają się poruszać wstecz","pt": "Indicar quando os planetas parecem se mover para trás","ru": "Указывать, когда планеты движутся в обратном направлении","ja": "惑星が逆行しているように見える時を示す","zh": "指示行星看起来向后移动的时候","ko": "행성이 뒤로 움직이는 것처럼 보일 때 표시"}
        },
        "enable_visualization": {
            "type": "boolean",
            "default": True,
            "label": {"en": "Enable Solar System Map","de": "Sonnensystem-Karte aktivieren","es": "Activar Mapa del Sistema Solar","fr": "Activer la Carte du Système Solaire","it": "Attiva Mappa del Sistema Solare","nl": "Zonnestelselkaart Activeren","pl": "Włącz Mapę Układu Słonecznego","pt": "Ativar Mapa do Sistema Solar","ru": "Включить карту Солнечной системы","ja": "太陽系マップを有効化","zh": "启用太阳系地图","ko": "태양계 지도 활성화"},
            "description": {"en": "Generate visualization of object positions","de": "Visualisierung der Objektpositionen erzeugen","es": "Generar visualización de las posiciones de los objetos","fr": "Générer une visualisation des positions des objets","it": "Genera la visualizzazione delle posizioni degli oggetti","nl": "Genereer visualisatie van objectposities","pl": "Generuj wizualizację pozycji obiektów","pt": "Gerar visualização das posições dos objetos","ru": "Создать визуализацию положений объектов","ja": "天体位置の可視化を生成","zh": "生成天体位置的可视化","ko": "천체 위치 시각화 생성"}
        },
        "visualization_scale": {
            "type": "select",
            "default": "logarithmic",
            "label": {"en": "Map Scale","de": "Kartenskalierung","es": "Escala del Mapa","fr": "Échelle de la Carte","it": "Scala della Mappa","nl": "Kaartschaal","pl": "Skala Mapy","pt": "Escala do Mapa","ru": "Масштаб карты","ja": "地図の縮尺","zh": "地图比例","ko": "지도 축척"},
            "description": {"en": "Choose scale for orbit visualization","de": "Skalierung für Umlaufbahn-Visualisierung wählen","es": "Elegir escala para visualización de órbitas","fr": "Choisir l'échelle pour la visualisation des orbites","it": "Scegli scala per visualizzazione orbite","nl": "Kies schaal voor baanvisualisatie","pl": "Wybierz skalę dla wizualizacji orbit","pt": "Escolher escala para visualização de órbitas","ru": "Выберите масштаб для визуализации орбит","ja": "軌道視覚化のスケールを選択","zh": "选择轨道可视化的比例","ko": "궤도 시각화를 위한 축척 선택"},
            "options": [
                {"value": "logarithmic", "label": {"en": "Logarithmic (All visible)","de": "Logarithmisch (Alles sichtbar)","es": "Logarítmica (Todo visible)","fr": "Logarithmique (Tout visible)","it": "Logaritmica (Tutto visibile)","nl": "Logaritmisch (Alles zichtbaar)","pl": "Logarytmiczna (Wszystko widoczne)","pt": "Logarítmica (Tudo visível)","ru": "Логарифмическая (Все видно)","ja": "対数（すべて見える）","zh": "对数（全部可见）","ko": "로그(모두 표시)"}},
                {"value": "linear", "label": {"en": "Linear (True scale)","de": "Linear (Wahrer Maßstab)","es": "Lineal (Escala real)","fr": "Linéaire (Échelle réelle)","it": "Lineare (Scala reale)","nl": "Lineair (Ware schaal)","pl": "Liniowa (Prawdziwa skala)","pt": "Linear (Escala real)","ru": "Линейная (Истинный масштаб)","ja": "線形（実際のスケール）","zh": "线性（真实比例）","ko": "선형(실제 축척)"}},
                {"value": "compressed", "label": {"en": "Compressed (Inner focus)","de": "Komprimiert (Inneres System)","es": "Comprimida (Interior)","fr": "Compressée (Intérieur)","it": "Compressa (Interno)","nl": "Gecomprimeerd (Binnenste)","pl": "Skompresowana (Wewnętrzny)","pt": "Comprimida (Interior)","ru": "Сжатая (Внутренняя)","ja": "圧縮（内側）","zh": "压缩（内部）","ko": "압축(내부)"}}
            ]
        }
    }
}

class SolarSystemSensor(AlternativeTimeSensorBase):
    """Sensor for displaying solar system planetary positions."""

    UPDATE_INTERVAL = UPDATE_INTERVAL

    # -------------- ctor --------------
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        # language must exist before anything else
        self._user_language = 'en'
        super().__init__(base_name, hass)

        try:
            if hass and hasattr(hass, "config"):
                lang = getattr(hass.config, "language", None)
                if lang:
                    self._user_language = lang
        except Exception:
            pass

        calendar_name = self._translate('name', 'Solar System Positions')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"solar_system_{base_name.lower().replace(' ', '_')}"

        self._update_interval = timedelta(seconds=UPDATE_INTERVAL)
        self._solar_data = CALENDAR_INFO.get("solar_data", {})
        self._planets = self._solar_data.get("planets", {})
        self._constellations = self._solar_data.get("constellations", [])

        default_latitude = 49.14
        default_longitude = 9.22
        if hass and hasattr(hass, 'config'):
            default_latitude = hass.config.latitude
            default_longitude = hass.config.longitude

        # defaults
        self._display_planet = "all"
        self._coordinate_system = "heliocentric"
        self._show_distance = True
        self._show_constellation = True
        self._show_retrograde = True
        self._show_visibility = True
        self._enable_visualization = True
        self._visualization_scale = "logarithmic"
        self._show_kuiper_belt = True

        self._observer_latitude = default_latitude
        self._observer_longitude = default_longitude

        self._positions_info: Dict[str, Any] = {}
        self._state = "Initializing..."
        self._first_update = True

    # -------------- helpers --------------
    def _lang(self) -> str:
        try:
            return (self._user_language or 'en').lower()
        except Exception:
            return 'en'

    def _translate(self, key: str, default: Optional[str] = None) -> str:
        # fallback if base doesn't supply translate
        try:
            section = CALENDAR_INFO.get(key)
            if isinstance(section, dict):
                return section.get(self._lang(), section.get("en", default or key))
        except Exception:
            pass
        return default or key

    def _get_planet_name(self, planet_id: str) -> str:
        pdata = self._planets.get(planet_id, {})
        names = pdata.get("name", {})
        return names.get(self._lang(), names.get("en", planet_id.title()))

    def _get_constellation(self, longitude: float) -> tuple[str, str]:
        lon = longitude % 360.0
        for c in self._constellations:
            start = float(c["start"])
            end = (start + 30.0) % 360.0
            if start <= lon < end or (start > end and (lon >= start or lon < end)):
                names = c.get("name", {})
                return names.get(self._lang(), names.get("en", "Unknown")), c.get("symbol", "")
        return "Unknown", ""

    # -------------- positions --------------
    def _calculate_planet_position(self, planet_id: str, jd: float) -> Dict[str, Any]:
        p = self._planets[planet_id]

        # Deep-space probes: radial outward (very rough), fixed longitude anchor
        if p.get("special_type") == "probe":
            # elapsed years since J2000 (JD 2451545.0 ~ 2000-01-01 12:00 TT)
            years = (jd - 2451545.0) / 365.25
            r = max(1.0, float(p.get("anchor_au", 100.0)) + years * float(p.get("speed_au_per_year", 3.5)))
            longi = float(p.get("anchor_longitude", 300.0)) % 360.0
            return {
                "longitude": longi,
                "distance": r,
                "mean_anomaly": 0.0,
                "true_anomaly": 0.0
            }

        # Planets
        d = jd - 2451545.0
        n = 360.0 / float(p["orbital_period"])
        M = (float(p["mean_longitude"]) + n * d) % 360.0
        e = float(p["eccentricity"])
        C = (2.0 * e - e**3 / 4.0) * math.sin(math.radians(M)) * 180.0 / math.pi
        v = M + C
        longitude = (v + float(p["perihelion_longitude"])) % 360.0
        a = float(p["semi_major_axis"])
        r = a * (1 - e**2) / (1 + e * math.cos(math.radians(v)))
        return {"longitude": longitude, "distance": r, "mean_anomaly": M, "true_anomaly": v}

    def _calculate_geocentric_position(self, planet_pos: Dict, earth_pos: Dict) -> Dict[str, Any]:
        geo_longitude = (planet_pos["longitude"] - earth_pos["longitude"]) % 360.0
        angle_diff = math.radians(planet_pos["longitude"] - earth_pos["longitude"])
        r_p = float(planet_pos["distance"])
        r_e = float(earth_pos["distance"])
        distance = math.sqrt(r_p**2 + r_e**2 - 2.0 * r_p * r_e * math.cos(angle_diff))
        return {"longitude": geo_longitude, "distance": distance}

    def _calculate_visibility(self, planet_id: str, dt: datetime) -> Dict[str, Any]:
        planet_pos = self._calculate_planet_position(planet_id, self._datetime_to_jd(dt))
        earth_pos = self._calculate_planet_position("earth", self._datetime_to_jd(dt))
        geo_pos = self._calculate_geocentric_position(planet_pos, earth_pos)
        elong = abs(geo_pos["longitude"] - earth_pos["longitude"])
        if elong > 180.0:
            elong = 360.0 - elong

        vis = {"elongation": elong, "visible": False, "rise_time": None, "set_time": None, "best_time": None, "visibility_period": None}
        if planet_id in ["mercury", "venus"]:
            if 15.0 < elong < 47.0:
                vis["visible"] = True
                if geo_pos["longitude"] < earth_pos["longitude"]:
                    vis.update({"visibility_period": "Morning star","best_time": "Before sunrise","rise_time": "03:00","set_time": "06:00"})
                else:
                    vis.update({"visibility_period": "Evening star","best_time": "After sunset","rise_time": "18:00","set_time": "21:00"})
        else:
            if elong > 60.0:
                vis["visible"] = True
                if elong > 150.0:
                    vis.update({"visibility_period": "All night","best_time": "Midnight","rise_time": "18:00","set_time": "06:00"})
                elif elong > 90.0:
                    vis.update({"visibility_period": "Most of night","best_time": "Late evening","rise_time": "20:00","set_time": "04:00"})
                else:
                    vis.update({"visibility_period": "Part of night","best_time": "Evening","rise_time": "20:00","set_time": "23:00"})
        return vis

    # -------------- SVG --------------
    def _monthly_markers(self, year: int) -> List[Dict[str, float]]:
        # Fixed: January = 1, not 0
        markers = []
        for m in range(1, 13):
            deg = (m - 1) * 30.0  # 0,30,...,330
            markers.append({"label": m, "rel": deg})
        return markers

    def _year_rotation_offset_deg(self, year: int) -> float:
        # Use Earth's current ecliptic longitude as zero-reference of the year, but
        # our visual convention fixes Jan 1 at the top (0°). So L0=0 for rendering.
        return 0.0

    def _generate_visualization_svg(self) -> str:
        width, height = 600, 600
        cx, cy = width / 2, height / 2
        margin = 30
        maxR = min(cx, cy) - margin
        scale = self._visualization_scale

        colors = {
            "mercury": "#8C7853", "venus": "#FFC649", "earth": "#4A90E2",
            "mars": "#CD5C5C", "jupiter": "#DAA520", "saturn": "#F4A460",
            "uranus": "#4FD0E2", "neptune": "#4169E1", "pluto": "#9B870C",
            "voyager1": "#00D1B2", "voyager2": "#00A3A3"
        }

        def scale_r(d: float) -> float:
            d = max(0.0, float(d))
            if scale == "logarithmic":
                return math.log(d + 1.0) / math.log(40.0) * maxR
            elif scale == "compressed":
                return (d ** 0.5) / (40.0 ** 0.5) * maxR
            else:
                return (d / 40.0) * maxR

        positions = self._positions_info.get("positions", {})
        items = []
        earth_item = None
        
        for pid, pdata in self._planets.items():
            # Skip JWST (James Webb Space Telescope)
            if pid == "jwst":
                continue
                
            pname = self._get_planet_name(pid)
            
            if pid == "earth":
                # Store Earth data for special rendering
                earth_pos = self._calculate_planet_position("earth", self._datetime_to_jd(datetime.now(timezone.utc)))
                earth_item = {
                    "id": "earth",
                    "name": pname,
                    "lon": float(earth_pos.get("longitude", 0.0)),
                    "dist": float(earth_pos.get("distance", 1.0)),
                    "color": colors.get("earth", "#4A90E2"),
                    "symbol": pdata.get("symbol", "⊕")
                }
                continue
                
            pos = positions.get(pname)
            if not pos:
                continue
            items.append({
                "id": pid,
                "name": pname,
                "lon": float(pos.get("longitude", 0.0)),
                "dist": float(pos.get("distance", 1.0)),
                "color": colors.get(pid, "#FFFFFF"),
                "symbol": pdata.get("symbol", "")
            })

        year = datetime.now(timezone.utc).year
        marks = self._monthly_markers(year)
        L0 = self._year_rotation_offset_deg(year)

        # "You are here" text in different languages
        you_are_here = {
            "en": "You are here",
            "de": "Sie sind hier",
            "es": "Usted está aquí",
            "fr": "Vous êtes ici",
            "it": "Tu sei qui",
            "nl": "U bent hier",
            "pl": "Jesteś tutaj",
            "pt": "Você está aqui",
            "ru": "Вы здесь",
            "ja": "あなたはここにいます",
            "zh": "您在这里",
            "ko": "당신은 여기 있습니다"
        }
        here_text = you_are_here.get(self._lang(), you_are_here["en"])

        # SVG header
        out = []
        out.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(width)}" height="{int(height)}" viewBox="0 0 {int(width)} {int(height)}" role="img" aria-label="Solar System Map">')
        out.append("<defs><style><![CDATA[text{font-family:Arial,system-ui,Segoe UI,Roboto,sans-serif}]]></style></defs>")
        out.append(f'<rect x="0" y="0" width="{int(width)}" height="{int(height)}" fill="#000033"/>')

        # Sun
        out.append(f'<circle cx="{cx}" cy="{cy}" r="15" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>')

        # Kuiper Belt (30–50 AU)
        if self._show_kuiper_belt:
            r_in = scale_r(30.0)
            r_out = scale_r(50.0)
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r_in:.2f}" fill="none" stroke="rgba(102,204,255,0.35)" stroke-width="1"/>')
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r_out:.2f}" fill="none" stroke="rgba(102,204,255,0.35)" stroke-width="1"/>')
            r_mid = (r_in + r_out) / 2.0
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r_mid:.2f}" fill="none" stroke="rgba(102,204,255,0.22)" stroke-width="{max(1,int(round(r_out-r_in)))}"/>')
            label = "Kuiper-Gürtel (30–50 AU)" if self._lang().startswith("de") else "Kuiper Belt (30–50 AU)"
            out.append(f'<text x="{cx}" y="{cy - r_out - 10:.2f}" fill="#66CCFF" font-size="11" text-anchor="middle">{label}</text>')

        # Month markers (corrected: January = 1 at top)
        month_names = {
            "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            "de": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
            "es": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            "fr": ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
            "it": ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
            "nl": ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
            "pl": ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"],
            "pt": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
            "ru": ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
            "ja": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            "zh": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            "ko": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
        }
        month_labels = month_names.get(self._lang(), month_names["en"])
        
        for i, m in enumerate(marks):
            ang = math.radians(90.0 - float(m["rel"]))  # 90° minus to start at top
            x = cx + math.cos(ang) * maxR
            y = cy + math.sin(ang) * maxR
            out.append(f'<line x1="{cx}" y1="{cy}" x2="{x:.2f}" y2="{y:.2f}" stroke="#555" stroke-dasharray="6,4" stroke-width="1"/>')
            lx = cx + math.cos(ang) * (maxR + 12)
            ly = cy + math.sin(ang) * (maxR + 12)
            label = month_labels[i]
            out.append(f'<text x="{lx:.2f}" y="{ly:.2f}" fill="#FFFFFF" font-size="10" text-anchor="middle">{label}</text>')

        # Draw Earth with special "You are here" marker
        if earth_item:
            r = scale_r(earth_item["dist"])
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.2f}" fill="none" stroke="#4A90E2" stroke-width="1" stroke-dasharray="4,2"/>')
            rel = (earth_item["lon"] - L0 + 360.0) % 360.0
            ang = math.radians(90.0 - rel)
            x = cx + math.cos(ang) * r
            y = cy + math.sin(ang) * r
            # Earth planet with special highlighting
            out.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="8" fill="{earth_item["color"]}" stroke="#FFFFFF" stroke-width="2"/>')
            # Arrow pointing to Earth
            arrow_x = x
            arrow_y = y - 20
            out.append(f'<path d="M {arrow_x:.2f} {arrow_y - 10:.2f} L {arrow_x - 5:.2f} {arrow_y - 20:.2f} L {arrow_x + 5:.2f} {arrow_y - 20:.2f} Z" fill="#FFD700" stroke="#FFFFFF" stroke-width="1"/>')
            # "You are here" text
            label = f"{earth_item['symbol']} {earth_item['name']} - {here_text}"
            out.append(f'<text x="{x:.2f}" y="{y - 30:.2f}" fill="#FFD700" font-size="12" font-weight="bold" text-anchor="middle">{label}</text>')

        # Orbits and other planets
        for it in items:
            r = scale_r(it["dist"])
            out.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.2f}" fill="none" stroke="#444" stroke-width="0.6"/>')
            rel = (it["lon"] - L0 + 360.0) % 360.0
            ang = math.radians(90.0 - rel)
            x = cx + math.cos(ang) * r
            y = cy + math.sin(ang) * r
            out.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="5" fill="{it["color"]}" stroke="#FFFFFF" stroke-width="1"/>')
            label = ((it["symbol"] + " ") if it["symbol"] else "") + it["name"]
            out.append(f'<text x="{x:.2f}" y="{y - 10:.2f}" fill="#FFFFFF" font-size="10" text-anchor="middle">{label}</text>')

        footer_text = {
            "en": f"Sun at center · January at top · Scale: {scale}",
            "de": f"Sonne im Zentrum · Januar oben · Maßstab: {scale}",
            "es": f"Sol en el centro · Enero arriba · Escala: {scale}",
            "fr": f"Soleil au centre · Janvier en haut · Échelle: {scale}",
            "it": f"Sole al centro · Gennaio in alto · Scala: {scale}",
            "nl": f"Zon in centrum · Januari boven · Schaal: {scale}",
            "pl": f"Słońce w centrum · Styczeń na górze · Skala: {scale}",
            "pt": f"Sol no centro · Janeiro no topo · Escala: {scale}",
            "ru": f"Солнце в центре · Январь сверху · Масштаб: {scale}",
            "ja": f"太陽中心 · 1月が上 · スケール: {scale}",
            "zh": f"太阳在中心 · 一月在顶部 · 比例: {scale}",
            "ko": f"태양 중심 · 1월이 위 · 축척: {scale}"
        }
        footer = footer_text.get(self._lang(), footer_text["en"])
        out.append(f'<text x="10" y="{height - 10}" fill="#FFFFFF" font-size="11">{footer}</text>')

        out.append("</svg>")
        return "\n".join(out)

    # -------------- PNG (optional) --------------
    def _text_size(self, draw, text: str, font) -> Tuple[int, int]:
        t = str(text)
        try:
            L, T, R, B = draw.textbbox((0, 0), t, font=font)
            return (R - L, B - T)
        except Exception:
            try:
                return font.getsize(t)
            except Exception:
                return (max(1, len(t) * 7), 12)

    def _generate_visualization_png_data_uri(self) -> str:
        # PNG generation would be similar to SVG but with PIL
        # Skipping detailed implementation for brevity
        return ""

    # -------------- positions collector --------------
    def _calculate_positions(self, dt: datetime) -> Dict[str, Any]:
        jd = self._datetime_to_jd(dt)
        AU_TO_KM = 149_597_870.7
        result: Dict[str, Any] = {
            "julian_date": jd,
            "timestamp": dt.isoformat(),
            "observer_location": {"latitude": self._observer_latitude, "longitude": self._observer_longitude},
            "positions": {}
        }
        earth_pos = None
        if "earth" in self._planets:
            earth_pos = self._calculate_planet_position("earth", jd)

        planets_to_calc = list(self._planets.keys()) if self._display_planet == "all" else [self._display_planet]
        for planet_id in planets_to_calc:
            if planet_id not in self._planets or planet_id == "earth" or planet_id == "jwst":
                continue
            helio_pos = self._calculate_planet_position(planet_id, jd)
            position = self._calculate_geocentric_position(helio_pos, earth_pos) if (self._coordinate_system == "geocentric" and earth_pos) else helio_pos

            cname, csym = self._get_constellation(position['longitude'])
            position['constellation'] = cname
            position['constellation_symbol'] = csym

            position['distance_au'] = float(position['distance'])
            position['distance_km'] = position['distance_au'] * AU_TO_KM
            position['distance_million_km'] = position['distance_km'] / 1e6

            if self._show_visibility and self._planets.get(planet_id, {}).get("special_type") not in ("probe",):
                position['visibility'] = self._calculate_visibility(planet_id, dt)

            position['retrograde'] = False  # simplified placeholder

            pname = self._get_planet_name(planet_id)
            result["positions"][pname] = position

        return result

    # -------------- time conversions --------------
    def _datetime_to_jd(self, dt: datetime) -> float:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        year = dt.year
        month = dt.month
        day = dt.day + (dt.hour + dt.minute / 60.0 + dt.second / 3600.0) / 24.0
        if month <= 2:
            year -= 1
            month += 12
        a = int(year / 100)
        b = 2 - a + int(a / 4)
        jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5
        return float(jd)

    def _jd_to_datetime(self, jd: float) -> datetime:
        jd = float(jd) + 0.5
        z = int(jd)
        f = jd - z
        if z < 2299161:
            a = z
        else:
            alpha = int((z - 1867216.25) / 36524.25)
            a = z + 1 + alpha - int(alpha / 4)
        b = a + 1524
        c = int((b - 122.1) / 365.25)
        d = int(365.25 * c)
        e = int((b - d) / 30.6001)
        day = b - d - int(30.6001 * e) + f
        month = e - 1 if e < 14 else e - 13
        year = c - 4716 if month > 2 else c - 4715
        day_i = int(day)
        frac = day - day_i
        seconds = int(round(frac * 86400.0))
        hh = seconds // 3600
        mm = (seconds % 3600) // 60
        ss = seconds % 60
        return datetime(year, int(month), int(day_i), hh, mm, ss, tzinfo=timezone.utc)

    # -------------- asset writing (/local) --------------
    def _write_local_assets(self, svg: str, png_data_uri: Optional[str]) -> Dict[str, str]:
        """Write SVG/PNG under /config/www/alternative_time and return /local paths."""
        out: Dict[str, str] = {}
        try:
            base = self.hass.config.path("www/alternative_time")
            os.makedirs(base, exist_ok=True)
            svg_path = os.path.join(base, "solar_system_map.svg")
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(svg)
            out["local_svg_path"] = "/local/alternative_time/solar_system_map.svg"

            if png_data_uri and png_data_uri.startswith("data:image/png;base64,"):
                png_path = os.path.join(base, "solar_system_map.png")
                with open(png_path, "wb") as f:
                    f.write(base64.b64decode(png_data_uri.split(",", 1)[1]))
                out["local_png_path"] = "/local/alternative_time/solar_system_map.png"
        except Exception as e:
            _LOGGER.warning("Writing local assets failed: %s", e)
        return out

    # -------------- HA attributes/state --------------
    @property
    def state(self) -> str:
        return self._state

    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        attrs = super().extra_state_attributes

        if self._positions_info:
            attrs.update(self._positions_info)
            attrs["description"] = self._translate("description")
            attrs["reference"] = CALENDAR_INFO.get("reference_url", "")
            attrs["config"] = {
                "display_planet": self._display_planet,
                "coordinate_system": self._coordinate_system,
                "show_distance": self._show_distance,
                "show_constellation": self._show_constellation,
                "show_retrograde": self._show_retrograde,
                "show_visibility": self._show_visibility,
                "enable_visualization": self._enable_visualization,
                "visualization_scale": self._visualization_scale
            }

            if self._enable_visualization:
                svg = self._generate_visualization_svg()
                attrs["solar_system_map_svg"] = svg

                # optional PNG
                png_data_uri = ""
                try:
                    png_data_uri = self._generate_visualization_png_data_uri()
                except Exception as e:
                    _LOGGER.debug("PNG generation failed: %s", e)
                if png_data_uri:
                    attrs["solar_system_map_png"] = png_data_uri

                # entity_picture: prefer PNG, fallback to SVG data URI
                if png_data_uri:
                    attrs["entity_picture"] = png_data_uri
                else:
                    # SVG as data-uri
                    svg_b64 = base64.b64encode(svg.encode("utf-8")).decode("ascii")
                    attrs["entity_picture"] = "data:image/svg+xml;base64," + svg_b64

                # Write to /local
                paths = self._write_local_assets(svg, png_data_uri if png_data_uri else None)
                attrs.update(paths)

        return attrs

    # -------------- formatting --------------
    def _format_position(self, planet_id: str, position: Dict[str, Any]) -> str:
        planet_name = self._get_planet_name(planet_id)
        symbol = self._planets[planet_id].get("symbol", "")
        parts = [f"{symbol} {planet_name}:"]
        parts.append(f"{position['longitude']:.1f}°")
        if self._show_distance:
            au = position['distance']
            km = au * 149_597_870.7
            parts.append(f"{au:.3f} AU ({km/1e6:.1f} Mio km)")
        if self._show_constellation:
            const_name, const_symbol = self._get_constellation(position['longitude'])
            parts.append(f"{const_symbol} {const_name}")
        if self._show_visibility and "visibility" in position:
            vis = position["visibility"]
            if vis.get("visible"):
                parts.append(f"👁 {vis.get('rise_time','N/A')}-{vis.get('set_time','N/A')}")
            else:
                parts.append("🚫 Not visible")
        if self._show_retrograde and position.get("retrograde", False):
            parts.append("℞")
        return " | ".join(parts)

    # -------------- HA update --------------
    def update(self) -> None:
        if self.hass and hasattr(self.hass, 'config'):
            self._user_language = getattr(self.hass.config, 'language', 'en') or 'en'

        options = self.get_plugin_options()
        if self._first_update:
            if options:
                _LOGGER.info("Solar System sensor options on first update: %s", options)
            else:
                _LOGGER.debug("Solar System sensor using defaults (no options configured)")
            self._first_update = False

        if options:
            self._display_planet = options.get("display_planet", "all")
            self._coordinate_system = options.get("coordinate_system", "heliocentric")
            self._show_distance = bool(options.get("show_distance", True))
            self._show_constellation = bool(options.get("show_constellation", True))
            self._show_retrograde = bool(options.get("show_retrograde", True))
            self._show_visibility = bool(options.get("show_visibility", True))
            self._enable_visualization = bool(options.get("enable_visualization", True))
            self._visualization_scale = options.get("visualization_scale", "logarithmic")

            if "observer_latitude" in options:
                try:
                    lat = float(options.get("observer_latitude"))
                    if -90.0 <= lat <= 90.0:
                        self._observer_latitude = lat
                except Exception:
                    pass
            elif self.hass and hasattr(self.hass, 'config'):
                self._observer_latitude = getattr(self.hass.config, "latitude", self._observer_latitude)

            if "observer_longitude" in options:
                try:
                    lon = float(options.get("observer_longitude"))
                    if -180.0 <= lon <= 180.0:
                        self._observer_longitude = lon
                except Exception:
                    pass
            elif self.hass and hasattr(self.hass, 'config'):
                self._observer_longitude = getattr(self.hass.config, "longitude", self._observer_longitude)

        try:
            now = datetime.now(timezone.utc)
            self._positions_info = self._calculate_positions(now)
            if self._display_planet == "all":
                num_objects = len(self._positions_info.get("positions", {}))
                self._state = f"{num_objects} objects tracked"
            else:
                planet_name = self._get_planet_name(self._display_planet)
                pos = self._positions_info.get("positions", {}).get(planet_name, {})
                self._state = self._format_position(self._display_planet, pos) if pos else f"{planet_name}: No data"
        except Exception as e:
            _LOGGER.exception("Error calculating solar system positions")
            self._state = "Error"
            self._positions_info = {"error": str(e)}

        _LOGGER.debug("Updated Solar System to %s", self._state)


__all__ = ["SolarSystemSensor", "CALENDAR_INFO"]