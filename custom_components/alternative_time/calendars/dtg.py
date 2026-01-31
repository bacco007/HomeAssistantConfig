"""NATO Date Time Group (DTG) implementation - Version 1.0.0
Complete NATO DTG format with configurable timezone support.

Displays time in NATO DTG format: DDHHMMZMONYY
Example: 241530Z DEC 25 (24th day, 15:30 Zulu time, December 2025)
"""
from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

try:
    import pytz
    HAS_PYTZ = True
except ImportError:
    HAS_PYTZ = False
    _LOGGER.warning("pytz not installed, DTG timezone support will be limited")

# ============================================
# CALENDAR METADATA
# ============================================

# Update interval in seconds (1 second for real-time display)
UPDATE_INTERVAL = 1

# Complete calendar information for auto-discovery
CALENDAR_INFO = {
    "id": "dtg",
    "version": "1.0.0",
    "icon": "mdi:clock-digital",
    "category": "military",
    "accuracy": "precise",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "NATO Date Time Group",
        "de": "NATO Datum-Zeit-Gruppe",
        "es": "Grupo de Fecha y Hora OTAN",
        "fr": "Groupe Date-Heure OTAN",
        "it": "Gruppo Data-Ora NATO",
        "nl": "NAVO Datum-Tijd Groep",
        "pl": "Grupa Data-Czas NATO",
        "pt": "Grupo Data-Hora NATO",
        "ru": "Группа даты и времени НАТО",
        "ja": "NATO日時グループ",
        "zh": "北约日期时间组",
        "ko": "NATO 날짜 시간 그룹"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Military Date Time Group format with timezone designation",
        "de": "Militärisches Datum-Zeit-Gruppen-Format mit Zeitzonenbezeichnung",
        "es": "Formato militar de grupo de fecha y hora con designación de zona horaria",
        "fr": "Format militaire de groupe date-heure avec désignation de fuseau horaire",
        "it": "Formato militare del gruppo data-ora con designazione del fuso orario",
        "nl": "Militair datum-tijd groepsformaat met tijdzone-aanduiding",
        "pl": "Wojskowy format grupy data-czas z oznaczeniem strefy czasowej",
        "pt": "Formato militar de grupo data-hora com designação de fuso horário",
        "ru": "Военный формат группы даты и времени с обозначением часового пояса",
        "ja": "タイムゾーン指定付き軍事日時グループ形式",
        "zh": "带时区标识的军事日期时间组格式",
        "ko": "시간대 지정이 있는 군사 날짜 시간 그룹 형식"
    },
    
    # DTG-specific data
    "dtg_data": {
        # NATO timezone codes with their offsets and descriptions
        "timezones": {
            "Z": {
                "offset": 0,
                "name": "Zulu",
                "dropdown_label": {
                    "en": "Z - Zulu (UTC/GMT)",
                    "de": "Z - Zulu (UTC/GMT)",
                    "es": "Z - Zulu (UTC/GMT)",
                    "fr": "Z - Zulu (UTC/GMT)",
                    "it": "Z - Zulu (UTC/GMT)",
                    "nl": "Z - Zulu (UTC/GMT)",
                    "pl": "Z - Zulu (UTC/GMT)",
                    "pt": "Z - Zulu (UTC/GMT)",
                    "ru": "Z - Зулу (UTC/GMT)",
                    "ja": "Z - ズールー (UTC/GMT)",
                    "zh": "Z - 祖鲁 (UTC/GMT)",
                    "ko": "Z - 줄루 (UTC/GMT)"
                },
                "iana_zones": ["UTC", "GMT", "Etc/UTC", "Etc/GMT"]
            },
            "A": {
                "offset": 1,
                "name": "Alpha",
                "dropdown_label": {
                    "en": "A - Alpha (UTC+1, Central European)",
                    "de": "A - Alpha (UTC+1, Mitteleuropäisch)",
                    "es": "A - Alfa (UTC+1, Europa Central)",
                    "fr": "A - Alpha (UTC+1, Europe Centrale)",
                    "it": "A - Alfa (UTC+1, Europa Centrale)",
                    "nl": "A - Alpha (UTC+1, Centraal-Europees)",
                    "pl": "A - Alfa (UTC+1, Europa Środkowa)",
                    "pt": "A - Alfa (UTC+1, Europa Central)",
                    "ru": "A - Альфа (UTC+1, Центральная Европа)",
                    "ja": "A - アルファ (UTC+1, 中央ヨーロッパ)",
                    "zh": "A - 阿尔法 (UTC+1, 中欧)",
                    "ko": "A - 알파 (UTC+1, 중앙 유럽)"
                },
                "iana_zones": ["Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Madrid"]
            },
            "B": {
                "offset": 2,
                "name": "Bravo",
                "dropdown_label": {
                    "en": "B - Bravo (UTC+2, Eastern European)",
                    "de": "B - Bravo (UTC+2, Osteuropäisch)",
                    "es": "B - Bravo (UTC+2, Europa Oriental)",
                    "fr": "B - Bravo (UTC+2, Europe de l'Est)",
                    "it": "B - Bravo (UTC+2, Europa Orientale)",
                    "nl": "B - Bravo (UTC+2, Oost-Europees)",
                    "pl": "B - Bravo (UTC+2, Europa Wschodnia)",
                    "pt": "B - Bravo (UTC+2, Europa Oriental)",
                    "ru": "B - Браво (UTC+2, Восточная Европа)",
                    "ja": "B - ブラボー (UTC+2, 東ヨーロッパ)",
                    "zh": "B - 布拉沃 (UTC+2, 东欧)",
                    "ko": "B - 브라보 (UTC+2, 동유럽)"
                },
                "iana_zones": ["Europe/Athens", "Europe/Helsinki", "Europe/Kiev", "Africa/Cairo"]
            },
            "C": {
                "offset": 3,
                "name": "Charlie",
                "dropdown_label": {
                    "en": "C - Charlie (UTC+3, Moscow/Baghdad)",
                    "de": "C - Charlie (UTC+3, Moskau/Bagdad)",
                    "es": "C - Charlie (UTC+3, Moscú/Bagdad)",
                    "fr": "C - Charlie (UTC+3, Moscou/Bagdad)",
                    "it": "C - Charlie (UTC+3, Mosca/Baghdad)",
                    "nl": "C - Charlie (UTC+3, Moskou/Bagdad)",
                    "pl": "C - Charlie (UTC+3, Moskwa/Bagdad)",
                    "pt": "C - Charlie (UTC+3, Moscou/Bagdá)",
                    "ru": "C - Чарли (UTC+3, Москва/Багдад)",
                    "ja": "C - チャーリー (UTC+3, モスクワ/バグダッド)",
                    "zh": "C - 查理 (UTC+3, 莫斯科/巴格达)",
                    "ko": "C - 찰리 (UTC+3, 모스크바/바그다드)"
                },
                "iana_zones": ["Europe/Moscow", "Asia/Baghdad", "Africa/Nairobi", "Asia/Kuwait"]
            },
            "D": {
                "offset": 4,
                "name": "Delta",
                "dropdown_label": {
                    "en": "D - Delta (UTC+4, Dubai/Baku)",
                    "de": "D - Delta (UTC+4, Dubai/Baku)",
                    "es": "D - Delta (UTC+4, Dubái/Bakú)",
                    "fr": "D - Delta (UTC+4, Dubaï/Bakou)",
                    "it": "D - Delta (UTC+4, Dubai/Baku)",
                    "nl": "D - Delta (UTC+4, Dubai/Bakoe)",
                    "pl": "D - Delta (UTC+4, Dubaj/Baku)",
                    "pt": "D - Delta (UTC+4, Dubai/Baku)",
                    "ru": "D - Дельта (UTC+4, Дубай/Баку)",
                    "ja": "D - デルタ (UTC+4, ドバイ/バクー)",
                    "zh": "D - 德尔塔 (UTC+4, 迪拜/巴库)",
                    "ko": "D - 델타 (UTC+4, 두바이/바쿠)"
                },
                "iana_zones": ["Asia/Dubai", "Asia/Baku", "Asia/Tbilisi", "Indian/Mauritius"]
            },
            "E": {
                "offset": 5,
                "name": "Echo",
                "dropdown_label": {
                    "en": "E - Echo (UTC+5, Pakistan/Maldives)",
                    "de": "E - Echo (UTC+5, Pakistan/Malediven)",
                    "es": "E - Echo (UTC+5, Pakistán/Maldivas)",
                    "fr": "E - Echo (UTC+5, Pakistan/Maldives)",
                    "it": "E - Echo (UTC+5, Pakistan/Maldive)",
                    "nl": "E - Echo (UTC+5, Pakistan/Maldiven)",
                    "pl": "E - Echo (UTC+5, Pakistan/Malediwy)",
                    "pt": "E - Echo (UTC+5, Paquistão/Maldivas)",
                    "ru": "E - Эхо (UTC+5, Пакистан/Мальдивы)",
                    "ja": "E - エコー (UTC+5, パキスタン/モルディブ)",
                    "zh": "E - 回声 (UTC+5, 巴基斯坦/马尔代夫)",
                    "ko": "E - 에코 (UTC+5, 파키스탄/몰디브)"
                },
                "iana_zones": ["Asia/Karachi", "Asia/Tashkent", "Indian/Maldives", "Asia/Yekaterinburg"]
            },
            "F": {
                "offset": 6,
                "name": "Foxtrot",
                "dropdown_label": {
                    "en": "F - Foxtrot (UTC+6, Bangladesh/Kazakhstan)",
                    "de": "F - Foxtrot (UTC+6, Bangladesch/Kasachstan)",
                    "es": "F - Foxtrot (UTC+6, Bangladesh/Kazajistán)",
                    "fr": "F - Foxtrot (UTC+6, Bangladesh/Kazakhstan)",
                    "it": "F - Foxtrot (UTC+6, Bangladesh/Kazakistan)",
                    "nl": "F - Foxtrot (UTC+6, Bangladesh/Kazachstan)",
                    "pl": "F - Foxtrot (UTC+6, Bangladesz/Kazachstan)",
                    "pt": "F - Foxtrot (UTC+6, Bangladesh/Cazaquistão)",
                    "ru": "F - Фокстрот (UTC+6, Бангладеш/Казахстан)",
                    "ja": "F - フォックストロット (UTC+6, バングラデシュ/カザフスタン)",
                    "zh": "F - 狐步 (UTC+6, 孟加拉国/哈萨克斯坦)",
                    "ko": "F - 폭스트롯 (UTC+6, 방글라데시/카자흐스탄)"
                },
                "iana_zones": ["Asia/Dhaka", "Asia/Almaty", "Asia/Omsk", "Indian/Chagos"]
            },
            "G": {
                "offset": 7,
                "name": "Golf",
                "dropdown_label": {
                    "en": "G - Golf (UTC+7, Thailand/Vietnam)",
                    "de": "G - Golf (UTC+7, Thailand/Vietnam)",
                    "es": "G - Golf (UTC+7, Tailandia/Vietnam)",
                    "fr": "G - Golf (UTC+7, Thaïlande/Vietnam)",
                    "it": "G - Golf (UTC+7, Tailandia/Vietnam)",
                    "nl": "G - Golf (UTC+7, Thailand/Vietnam)",
                    "pl": "G - Golf (UTC+7, Tajlandia/Wietnam)",
                    "pt": "G - Golf (UTC+7, Tailândia/Vietnã)",
                    "ru": "G - Гольф (UTC+7, Таиланд/Вьетнам)",
                    "ja": "G - ゴルフ (UTC+7, タイ/ベトナム)",
                    "zh": "G - 高尔夫 (UTC+7, 泰国/越南)",
                    "ko": "G - 골프 (UTC+7, 태국/베트남)"
                },
                "iana_zones": ["Asia/Bangkok", "Asia/Ho_Chi_Minh", "Asia/Jakarta", "Asia/Krasnoyarsk"]
            },
            "H": {
                "offset": 8,
                "name": "Hotel",
                "dropdown_label": {
                    "en": "H - Hotel (UTC+8, China/Singapore)",
                    "de": "H - Hotel (UTC+8, China/Singapur)",
                    "es": "H - Hotel (UTC+8, China/Singapur)",
                    "fr": "H - Hotel (UTC+8, Chine/Singapour)",
                    "it": "H - Hotel (UTC+8, Cina/Singapore)",
                    "nl": "H - Hotel (UTC+8, China/Singapore)",
                    "pl": "H - Hotel (UTC+8, Chiny/Singapur)",
                    "pt": "H - Hotel (UTC+8, China/Singapura)",
                    "ru": "H - Отель (UTC+8, Китай/Сингапур)",
                    "ja": "H - ホテル (UTC+8, 中国/シンガポール)",
                    "zh": "H - 旅馆 (UTC+8, 中国/新加坡)",
                    "ko": "H - 호텔 (UTC+8, 중국/싱가포르)"
                },
                "iana_zones": ["Asia/Shanghai", "Asia/Singapore", "Asia/Hong_Kong", "Australia/Perth"]
            },
            "I": {
                "offset": 9,
                "name": "India",
                "dropdown_label": {
                    "en": "I - India (UTC+9, Japan/Korea)",
                    "de": "I - India (UTC+9, Japan/Korea)",
                    "es": "I - India (UTC+9, Japón/Corea)",
                    "fr": "I - India (UTC+9, Japon/Corée)",
                    "it": "I - India (UTC+9, Giappone/Corea)",
                    "nl": "I - India (UTC+9, Japan/Korea)",
                    "pl": "I - India (UTC+9, Japonia/Korea)",
                    "pt": "I - India (UTC+9, Japão/Coreia)",
                    "ru": "I - Индия (UTC+9, Япония/Корея)",
                    "ja": "I - インディア (UTC+9, 日本/韓国)",
                    "zh": "I - 印度 (UTC+9, 日本/韩国)",
                    "ko": "I - 인디아 (UTC+9, 일본/한국)"
                },
                "iana_zones": ["Asia/Tokyo", "Asia/Seoul", "Asia/Yakutsk", "Pacific/Palau"]
            },
            "K": {
                "offset": 10,
                "name": "Kilo",
                "dropdown_label": {
                    "en": "K - Kilo (UTC+10, Eastern Australia)",
                    "de": "K - Kilo (UTC+10, Ostaustralien)",
                    "es": "K - Kilo (UTC+10, Australia Oriental)",
                    "fr": "K - Kilo (UTC+10, Australie de l'Est)",
                    "it": "K - Kilo (UTC+10, Australia Orientale)",
                    "nl": "K - Kilo (UTC+10, Oost-Australië)",
                    "pl": "K - Kilo (UTC+10, Australia Wschodnia)",
                    "pt": "K - Kilo (UTC+10, Austrália Oriental)",
                    "ru": "K - Кило (UTC+10, Восточная Австралия)",
                    "ja": "K - キロ (UTC+10, オーストラリア東部)",
                    "zh": "K - 千克 (UTC+10, 澳大利亚东部)",
                    "ko": "K - 킬로 (UTC+10, 동부 호주)"
                },
                "iana_zones": ["Australia/Sydney", "Australia/Brisbane", "Pacific/Guam", "Asia/Vladivostok"]
            },
            "L": {
                "offset": 11,
                "name": "Lima",
                "dropdown_label": {
                    "en": "L - Lima (UTC+11, Solomon Islands)",
                    "de": "L - Lima (UTC+11, Salomonen)",
                    "es": "L - Lima (UTC+11, Islas Salomón)",
                    "fr": "L - Lima (UTC+11, Îles Salomon)",
                    "it": "L - Lima (UTC+11, Isole Salomone)",
                    "nl": "L - Lima (UTC+11, Salomonseilanden)",
                    "pl": "L - Lima (UTC+11, Wyspy Salomona)",
                    "pt": "L - Lima (UTC+11, Ilhas Salomão)",
                    "ru": "L - Лима (UTC+11, Соломоновы Острова)",
                    "ja": "L - リマ (UTC+11, ソロモン諸島)",
                    "zh": "L - 利马 (UTC+11, 所罗门群岛)",
                    "ko": "L - 리마 (UTC+11, 솔로몬 제도)"
                },
                "iana_zones": ["Pacific/Guadalcanal", "Asia/Magadan", "Pacific/Noumea", "Pacific/Norfolk"]
            },
            "M": {
                "offset": 12,
                "name": "Mike",
                "dropdown_label": {
                    "en": "M - Mike (UTC+12, New Zealand)",
                    "de": "M - Mike (UTC+12, Neuseeland)",
                    "es": "M - Mike (UTC+12, Nueva Zelanda)",
                    "fr": "M - Mike (UTC+12, Nouvelle-Zélande)",
                    "it": "M - Mike (UTC+12, Nuova Zelanda)",
                    "nl": "M - Mike (UTC+12, Nieuw-Zeeland)",
                    "pl": "M - Mike (UTC+12, Nowa Zelandia)",
                    "pt": "M - Mike (UTC+12, Nova Zelândia)",
                    "ru": "M - Майк (UTC+12, Новая Зеландия)",
                    "ja": "M - マイク (UTC+12, ニュージーランド)",
                    "zh": "M - 麦克 (UTC+12, 新西兰)",
                    "ko": "M - 마이크 (UTC+12, 뉴질랜드)"
                },
                "iana_zones": ["Pacific/Auckland", "Pacific/Fiji", "Asia/Kamchatka", "Pacific/Marshall"]
            },
            "N": {
                "offset": -1,
                "name": "November",
                "dropdown_label": {
                    "en": "N - November (UTC-1, Azores)",
                    "de": "N - November (UTC-1, Azoren)",
                    "es": "N - November (UTC-1, Azores)",
                    "fr": "N - November (UTC-1, Açores)",
                    "it": "N - November (UTC-1, Azzorre)",
                    "nl": "N - November (UTC-1, Azoren)",
                    "pl": "N - November (UTC-1, Azory)",
                    "pt": "N - November (UTC-1, Açores)",
                    "ru": "N - Ноябрь (UTC-1, Азорские острова)",
                    "ja": "N - ノベンバー (UTC-1, アゾレス諸島)",
                    "zh": "N - 十一月 (UTC-1, 亚速尔群岛)",
                    "ko": "N - 노벰버 (UTC-1, 아조레스)"
                },
                "iana_zones": ["Atlantic/Azores", "Atlantic/Cape_Verde"]
            },
            "O": {
                "offset": -2,
                "name": "Oscar",
                "dropdown_label": {
                    "en": "O - Oscar (UTC-2, Mid-Atlantic)",
                    "de": "O - Oscar (UTC-2, Mittelatlantik)",
                    "es": "O - Oscar (UTC-2, Atlántico Medio)",
                    "fr": "O - Oscar (UTC-2, Atlantique Central)",
                    "it": "O - Oscar (UTC-2, Atlantico Centrale)",
                    "nl": "O - Oscar (UTC-2, Midden-Atlantisch)",
                    "pl": "O - Oscar (UTC-2, Środkowy Atlantyk)",
                    "pt": "O - Oscar (UTC-2, Atlântico Central)",
                    "ru": "O - Оскар (UTC-2, Средняя Атлантика)",
                    "ja": "O - オスカー (UTC-2, 中部大西洋)",
                    "zh": "O - 奥斯卡 (UTC-2, 中大西洋)",
                    "ko": "O - 오스카 (UTC-2, 중부 대서양)"
                },
                "iana_zones": ["Atlantic/South_Georgia", "America/Noronha"]
            },
            "P": {
                "offset": -3,
                "name": "Papa",
                "dropdown_label": {
                    "en": "P - Papa (UTC-3, Buenos Aires/Brasilia)",
                    "de": "P - Papa (UTC-3, Buenos Aires/Brasília)",
                    "es": "P - Papa (UTC-3, Buenos Aires/Brasilia)",
                    "fr": "P - Papa (UTC-3, Buenos Aires/Brasilia)",
                    "it": "P - Papa (UTC-3, Buenos Aires/Brasilia)",
                    "nl": "P - Papa (UTC-3, Buenos Aires/Brasília)",
                    "pl": "P - Papa (UTC-3, Buenos Aires/Brasilia)",
                    "pt": "P - Papa (UTC-3, Buenos Aires/Brasília)",
                    "ru": "P - Папа (UTC-3, Буэнос-Айрес/Бразилиа)",
                    "ja": "P - パパ (UTC-3, ブエノスアイレス/ブラジリア)",
                    "zh": "P - 爸爸 (UTC-3, 布宜诺斯艾利斯/巴西利亚)",
                    "ko": "P - 파파 (UTC-3, 부에노스아이레스/브라질리아)"
                },
                "iana_zones": ["America/Buenos_Aires", "America/Sao_Paulo", "America/Montevideo", "America/Godthab"]
            },
            "Q": {
                "offset": -4,
                "name": "Quebec",
                "dropdown_label": {
                    "en": "Q - Quebec (UTC-4, Atlantic/Halifax)",
                    "de": "Q - Quebec (UTC-4, Atlantik/Halifax)",
                    "es": "Q - Quebec (UTC-4, Atlántico/Halifax)",
                    "fr": "Q - Quebec (UTC-4, Atlantique/Halifax)",
                    "it": "Q - Quebec (UTC-4, Atlantico/Halifax)",
                    "nl": "Q - Quebec (UTC-4, Atlantisch/Halifax)",
                    "pl": "Q - Quebec (UTC-4, Atlantyk/Halifax)",
                    "pt": "Q - Quebec (UTC-4, Atlântico/Halifax)",
                    "ru": "Q - Квебек (UTC-4, Атлантический/Галифакс)",
                    "ja": "Q - ケベック (UTC-4, 大西洋/ハリファックス)",
                    "zh": "Q - 魁北克 (UTC-4, 大西洋/哈利法克斯)",
                    "ko": "Q - 퀘벡 (UTC-4, 대서양/핼리팩스)"
                },
                "iana_zones": ["America/Halifax", "America/La_Paz", "America/Santiago", "America/Caracas"]
            },
            "R": {
                "offset": -5,
                "name": "Romeo",
                "dropdown_label": {
                    "en": "R - Romeo (UTC-5, Eastern US/Canada)",
                    "de": "R - Romeo (UTC-5, Östliche USA/Kanada)",
                    "es": "R - Romeo (UTC-5, Este de EE.UU./Canadá)",
                    "fr": "R - Romeo (UTC-5, Est des États-Unis/Canada)",
                    "it": "R - Romeo (UTC-5, Stati Uniti Orientali/Canada)",
                    "nl": "R - Romeo (UTC-5, Oostelijke VS/Canada)",
                    "pl": "R - Romeo (UTC-5, Wschodnie USA/Kanada)",
                    "pt": "R - Romeo (UTC-5, Leste dos EUA/Canadá)",
                    "ru": "R - Ромео (UTC-5, Восточные США/Канада)",
                    "ja": "R - ロメオ (UTC-5, 米国東部/カナダ)",
                    "zh": "R - 罗密欧 (UTC-5, 美国东部/加拿大)",
                    "ko": "R - 로미오 (UTC-5, 미국 동부/캐나다)"
                },
                "iana_zones": ["America/New_York", "America/Toronto", "America/Lima", "America/Bogota"]
            },
            "S": {
                "offset": -6,
                "name": "Sierra",
                "dropdown_label": {
                    "en": "S - Sierra (UTC-6, Central US/Canada)",
                    "de": "S - Sierra (UTC-6, Zentrale USA/Kanada)",
                    "es": "S - Sierra (UTC-6, Centro de EE.UU./Canadá)",
                    "fr": "S - Sierra (UTC-6, Centre des États-Unis/Canada)",
                    "it": "S - Sierra (UTC-6, Stati Uniti Centrali/Canada)",
                    "nl": "S - Sierra (UTC-6, Centrale VS/Canada)",
                    "pl": "S - Sierra (UTC-6, Centralne USA/Kanada)",
                    "pt": "S - Sierra (UTC-6, Centro dos EUA/Canadá)",
                    "ru": "S - Сьерра (UTC-6, Центральные США/Канада)",
                    "ja": "S - シエラ (UTC-6, 米国中部/カナダ)",
                    "zh": "S - 塞拉 (UTC-6, 美国中部/加拿大)",
                    "ko": "S - 시에라 (UTC-6, 미국 중부/캐나다)"
                },
                "iana_zones": ["America/Chicago", "America/Mexico_City", "America/Winnipeg", "America/Guatemala"]
            },
            "T": {
                "offset": -7,
                "name": "Tango",
                "dropdown_label": {
                    "en": "T - Tango (UTC-7, Mountain US/Canada)",
                    "de": "T - Tango (UTC-7, Gebirgsregion USA/Kanada)",
                    "es": "T - Tango (UTC-7, Montaña EE.UU./Canadá)",
                    "fr": "T - Tango (UTC-7, Montagnes États-Unis/Canada)",
                    "it": "T - Tango (UTC-7, Stati Uniti Montagne/Canada)",
                    "nl": "T - Tango (UTC-7, Mountain VS/Canada)",
                    "pl": "T - Tango (UTC-7, Górskie USA/Kanada)",
                    "pt": "T - Tango (UTC-7, Montanha EUA/Canadá)",
                    "ru": "T - Танго (UTC-7, Горные США/Канада)",
                    "ja": "T - タンゴ (UTC-7, 米国山岳部/カナダ)",
                    "zh": "T - 探戈 (UTC-7, 美国山地/加拿大)",
                    "ko": "T - 탱고 (UTC-7, 미국 산악/캐나다)"
                },
                "iana_zones": ["America/Denver", "America/Phoenix", "America/Edmonton", "America/Chihuahua"]
            },
            "U": {
                "offset": -8,
                "name": "Uniform",
                "dropdown_label": {
                    "en": "U - Uniform (UTC-8, Pacific US/Canada)",
                    "de": "U - Uniform (UTC-8, Pazifik USA/Kanada)",
                    "es": "U - Uniform (UTC-8, Pacífico EE.UU./Canadá)",
                    "fr": "U - Uniform (UTC-8, Pacifique États-Unis/Canada)",
                    "it": "U - Uniform (UTC-8, Stati Uniti Pacifico/Canada)",
                    "nl": "U - Uniform (UTC-8, Pacific VS/Canada)",
                    "pl": "U - Uniform (UTC-8, Pacyficzne USA/Kanada)",
                    "pt": "U - Uniform (UTC-8, Pacífico EUA/Canadá)",
                    "ru": "U - Униформа (UTC-8, Тихоокеанские США/Канада)",
                    "ja": "U - ユニフォーム (UTC-8, 米国太平洋岸/カナダ)",
                    "zh": "U - 制服 (UTC-8, 美国太平洋/加拿大)",
                    "ko": "U - 유니폼 (UTC-8, 미국 태평양/캐나다)"
                },
                "iana_zones": ["America/Los_Angeles", "America/Vancouver", "America/Tijuana", "America/Seattle"]
            },
            "V": {
                "offset": -9,
                "name": "Victor",
                "dropdown_label": {
                    "en": "V - Victor (UTC-9, Alaska)",
                    "de": "V - Victor (UTC-9, Alaska)",
                    "es": "V - Victor (UTC-9, Alaska)",
                    "fr": "V - Victor (UTC-9, Alaska)",
                    "it": "V - Victor (UTC-9, Alaska)",
                    "nl": "V - Victor (UTC-9, Alaska)",
                    "pl": "V - Victor (UTC-9, Alaska)",
                    "pt": "V - Victor (UTC-9, Alasca)",
                    "ru": "V - Виктор (UTC-9, Аляска)",
                    "ja": "V - ビクター (UTC-9, アラスカ)",
                    "zh": "V - 维克多 (UTC-9, 阿拉斯加)",
                    "ko": "V - 빅터 (UTC-9, 알래스카)"
                },
                "iana_zones": ["America/Anchorage", "America/Juneau", "America/Nome", "Pacific/Gambier"]
            },
            "W": {
                "offset": -10,
                "name": "Whiskey",
                "dropdown_label": {
                    "en": "W - Whiskey (UTC-10, Hawaii)",
                    "de": "W - Whiskey (UTC-10, Hawaii)",
                    "es": "W - Whiskey (UTC-10, Hawái)",
                    "fr": "W - Whiskey (UTC-10, Hawaï)",
                    "it": "W - Whiskey (UTC-10, Hawaii)",
                    "nl": "W - Whiskey (UTC-10, Hawaï)",
                    "pl": "W - Whiskey (UTC-10, Hawaje)",
                    "pt": "W - Whiskey (UTC-10, Havaí)",
                    "ru": "W - Виски (UTC-10, Гавайи)",
                    "ja": "W - ウイスキー (UTC-10, ハワイ)",
                    "zh": "W - 威士忌 (UTC-10, 夏威夷)",
                    "ko": "W - 위스키 (UTC-10, 하와이)"
                },
                "iana_zones": ["Pacific/Honolulu", "Pacific/Tahiti", "Pacific/Rarotonga"]
            },
            "X": {
                "offset": -11,
                "name": "X-ray",
                "dropdown_label": {
                    "en": "X - X-ray (UTC-11, Samoa)",
                    "de": "X - X-ray (UTC-11, Samoa)",
                    "es": "X - X-ray (UTC-11, Samoa)",
                    "fr": "X - X-ray (UTC-11, Samoa)",
                    "it": "X - X-ray (UTC-11, Samoa)",
                    "nl": "X - X-ray (UTC-11, Samoa)",
                    "pl": "X - X-ray (UTC-11, Samoa)",
                    "pt": "X - X-ray (UTC-11, Samoa)",
                    "ru": "X - Рентген (UTC-11, Самоа)",
                    "ja": "X - エックスレイ (UTC-11, サモア)",
                    "zh": "X - X射线 (UTC-11, 萨摩亚)",
                    "ko": "X - 엑스레이 (UTC-11, 사모아)"
                },
                "iana_zones": ["Pacific/Pago_Pago", "Pacific/Niue", "Pacific/Midway"]
            },
            "Y": {
                "offset": -12,
                "name": "Yankee",
                "dropdown_label": {
                    "en": "Y - Yankee (UTC-12, International Date Line West)",
                    "de": "Y - Yankee (UTC-12, Internationale Datumsgrenze West)",
                    "es": "Y - Yankee (UTC-12, Línea Internacional de Fecha Oeste)",
                    "fr": "Y - Yankee (UTC-12, Ligne de Date Internationale Ouest)",
                    "it": "Y - Yankee (UTC-12, Linea Internazionale del Cambio Data Ovest)",
                    "nl": "Y - Yankee (UTC-12, Internationale Datumgrens West)",
                    "pl": "Y - Yankee (UTC-12, Międzynarodowa Linia Zmiany Daty Zachód)",
                    "pt": "Y - Yankee (UTC-12, Linha Internacional de Data Oeste)",
                    "ru": "Y - Янки (UTC-12, Международная линия перемены даты Запад)",
                    "ja": "Y - ヤンキー (UTC-12, 国際日付変更線西)",
                    "zh": "Y - 扬基 (UTC-12, 国际日期变更线西)",
                    "ko": "Y - 양키 (UTC-12, 국제 날짜 변경선 서쪽)"
                },
                "iana_zones": ["Etc/GMT+12"]
            }
        },
        
        # Month abbreviations for DTG format
        "months": {
            "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
            "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
            "09": "SEP", "10": "OCT", "11": "NOV", "12": "DEC"
        }
    },
    
    # Reference URL
    "reference_url": "https://en.wikipedia.org/wiki/Date-time_group",
    
    # Plugin configuration options
    "plugin_options": {
        "timezone": {
            "type": "select",
            "default": "Z",
            "label": {
                "en": "NATO Time Zone",
                "de": "NATO-Zeitzone",
                "es": "Zona Horaria OTAN",
                "fr": "Fuseau Horaire OTAN",
                "it": "Fuso Orario NATO",
                "nl": "NAVO Tijdzone",
                "pl": "Strefa Czasowa NATO",
                "pt": "Fuso Horário NATO",
                "ru": "Часовой пояс НАТО",
                "ja": "NATO タイムゾーン",
                "zh": "北约时区",
                "ko": "NATO 시간대"
            },
            "description": {
                "en": "Select the NATO timezone code for DTG display",
                "de": "NATO-Zeitzonencode für DTG-Anzeige auswählen",
                "es": "Seleccione el código de zona horaria de la OTAN para la visualización DTG",
                "fr": "Sélectionnez le code de fuseau horaire OTAN pour l'affichage DTG",
                "it": "Seleziona il codice del fuso orario NATO per la visualizzazione DTG",
                "nl": "Selecteer de NAVO tijdzonecode voor DTG-weergave",
                "pl": "Wybierz kod strefy czasowej NATO dla wyświetlania DTG",
                "pt": "Selecione o código de fuso horário da NATO para exibição DTG",
                "ru": "Выберите код часового пояса НАТО для отображения DTG",
                "ja": "DTG表示用のNATOタイムゾーンコードを選択",
                "zh": "选择用于DTG显示的北约时区代码",
                "ko": "DTG 표시를 위한 NATO 시간대 코드 선택"
            },
            "options": [
                {"value": "Z", "label": {"en": "Z - Zulu (UTC/GMT)", "de": "Z - Zulu (UTC/GMT)"}},
                {"value": "A", "label": {"en": "A - Alpha (UTC+1)", "de": "A - Alpha (UTC+1)"}},
                {"value": "B", "label": {"en": "B - Bravo (UTC+2)", "de": "B - Bravo (UTC+2)"}},
                {"value": "C", "label": {"en": "C - Charlie (UTC+3)", "de": "C - Charlie (UTC+3)"}},
                {"value": "D", "label": {"en": "D - Delta (UTC+4)", "de": "D - Delta (UTC+4)"}},
                {"value": "E", "label": {"en": "E - Echo (UTC+5)", "de": "E - Echo (UTC+5)"}},
                {"value": "F", "label": {"en": "F - Foxtrot (UTC+6)", "de": "F - Foxtrot (UTC+6)"}},
                {"value": "G", "label": {"en": "G - Golf (UTC+7)", "de": "G - Golf (UTC+7)"}},
                {"value": "H", "label": {"en": "H - Hotel (UTC+8)", "de": "H - Hotel (UTC+8)"}},
                {"value": "I", "label": {"en": "I - India (UTC+9)", "de": "I - India (UTC+9)"}},
                {"value": "K", "label": {"en": "K - Kilo (UTC+10)", "de": "K - Kilo (UTC+10)"}},
                {"value": "L", "label": {"en": "L - Lima (UTC+11)", "de": "L - Lima (UTC+11)"}},
                {"value": "M", "label": {"en": "M - Mike (UTC+12)", "de": "M - Mike (UTC+12)"}},
                {"value": "N", "label": {"en": "N - November (UTC-1)", "de": "N - November (UTC-1)"}},
                {"value": "O", "label": {"en": "O - Oscar (UTC-2)", "de": "O - Oscar (UTC-2)"}},
                {"value": "P", "label": {"en": "P - Papa (UTC-3)", "de": "P - Papa (UTC-3)"}},
                {"value": "Q", "label": {"en": "Q - Quebec (UTC-4)", "de": "Q - Quebec (UTC-4)"}},
                {"value": "R", "label": {"en": "R - Romeo (UTC-5)", "de": "R - Romeo (UTC-5)"}},
                {"value": "S", "label": {"en": "S - Sierra (UTC-6)", "de": "S - Sierra (UTC-6)"}},
                {"value": "T", "label": {"en": "T - Tango (UTC-7)", "de": "T - Tango (UTC-7)"}},
                {"value": "U", "label": {"en": "U - Uniform (UTC-8)", "de": "U - Uniform (UTC-8)"}},
                {"value": "V", "label": {"en": "V - Victor (UTC-9)", "de": "V - Victor (UTC-9)"}},
                {"value": "W", "label": {"en": "W - Whiskey (UTC-10)", "de": "W - Whiskey (UTC-10)"}},
                {"value": "X", "label": {"en": "X - X-ray (UTC-11)", "de": "X - X-ray (UTC-11)"}},
                {"value": "Y", "label": {"en": "Y - Yankee (UTC-12)", "de": "Y - Yankee (UTC-12)"}}
            ]
        },
        "use_iana_timezone": {
            "type": "boolean",
            "default": False,
            "label": {
                "en": "Use IANA Timezone",
                "de": "IANA-Zeitzone verwenden",
                "es": "Usar Zona Horaria IANA",
                "fr": "Utiliser le Fuseau Horaire IANA",
                "it": "Usa Fuso Orario IANA",
                "nl": "Gebruik IANA Tijdzone",
                "pl": "Użyj Strefy Czasowej IANA",
                "pt": "Usar Fuso Horário IANA",
                "ru": "Использовать часовой пояс IANA",
                "ja": "IANAタイムゾーンを使用",
                "zh": "使用IANA时区",
                "ko": "IANA 시간대 사용"
            },
            "description": {
                "en": "Use specific IANA timezone for accurate DST handling",
                "de": "Spezifische IANA-Zeitzone für genaue Sommerzeitbehandlung verwenden",
                "es": "Usar zona horaria IANA específica para manejo preciso del horario de verano",
                "fr": "Utiliser un fuseau horaire IANA spécifique pour une gestion précise de l'heure d'été",
                "it": "Usa fuso orario IANA specifico per gestione precisa dell'ora legale",
                "nl": "Gebruik specifieke IANA tijdzone voor nauwkeurige zomertijd afhandeling",
                "pl": "Użyj konkretnej strefy czasowej IANA dla dokładnej obsługi czasu letniego",
                "pt": "Usar fuso horário IANA específico para tratamento preciso do horário de verão",
                "ru": "Использовать конкретный часовой пояс IANA для точной обработки летнего времени",
                "ja": "夏時間の正確な処理のために特定のIANAタイムゾーンを使用",
                "zh": "使用特定的IANA时区以准确处理夏令时",
                "ko": "정확한 서머타임 처리를 위해 특정 IANA 시간대 사용"
            }
        },
        "iana_timezone": {
            "type": "select",
            "default": "UTC",
            "label": {
                "en": "IANA Timezone",
                "de": "IANA-Zeitzone",
                "es": "Zona Horaria IANA",
                "fr": "Fuseau Horaire IANA",
                "it": "Fuso Orario IANA",
                "nl": "IANA Tijdzone",
                "pl": "Strefa Czasowa IANA",
                "pt": "Fuso Horário IANA",
                "ru": "Часовой пояс IANA",
                "ja": "IANAタイムゾーン",
                "zh": "IANA时区",
                "ko": "IANA 시간대"
            },
            "description": {
                "en": "Select specific IANA timezone (only used if enabled above)",
                "de": "Spezifische IANA-Zeitzone auswählen (nur wenn oben aktiviert)",
                "es": "Seleccionar zona horaria IANA específica (solo si está habilitado arriba)",
                "fr": "Sélectionner un fuseau horaire IANA spécifique (uniquement si activé ci-dessus)",
                "it": "Seleziona fuso orario IANA specifico (solo se abilitato sopra)",
                "nl": "Selecteer specifieke IANA tijdzone (alleen indien hierboven ingeschakeld)",
                "pl": "Wybierz konkretną strefę czasową IANA (tylko jeśli włączone powyżej)",
                "pt": "Selecionar fuso horário IANA específico (apenas se ativado acima)",
                "ru": "Выберите конкретный часовой пояс IANA (только если включено выше)",
                "ja": "特定のIANAタイムゾーンを選択（上記で有効にした場合のみ）",
                "zh": "选择特定的IANA时区（仅在上面启用时）",
                "ko": "특정 IANA 시간대 선택 (위에서 활성화한 경우에만)"
            },
            "options": "iana_timezone_options"  # Will be populated dynamically
        },
        "uppercase": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Use Uppercase",
                "de": "Großbuchstaben verwenden",
                "es": "Usar Mayúsculas",
                "fr": "Utiliser les Majuscules",
                "it": "Usa Maiuscole",
                "nl": "Gebruik Hoofdletters",
                "pl": "Użyj Wielkich Liter",
                "pt": "Usar Maiúsculas",
                "ru": "Использовать заглавные буквы",
                "ja": "大文字を使用",
                "zh": "使用大写",
                "ko": "대문자 사용"
            },
            "description": {
                "en": "Display DTG in uppercase format",
                "de": "DTG in Großbuchstaben anzeigen",
                "es": "Mostrar DTG en formato de mayúsculas",
                "fr": "Afficher DTG en format majuscules",
                "it": "Visualizza DTG in formato maiuscolo",
                "nl": "DTG in hoofdletters weergeven",
                "pl": "Wyświetl DTG wielkimi literami",
                "pt": "Exibir DTG em formato maiúsculo",
                "ru": "Отображать DTG заглавными буквами",
                "ja": "DTGを大文字形式で表示",
                "zh": "以大写格式显示DTG",
                "ko": "DTG를 대문자 형식으로 표시"
            }
        }
    }
}


class DTGSensor(AlternativeTimeSensorBase):
    """Sensor for displaying NATO Date Time Group format."""
    
    # Class-level update interval
    UPDATE_INTERVAL = 1  # Update every second
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the DTG sensor with standard 2-parameter signature."""
        super().__init__(base_name, hass)
        
        # Get calendar info
        calendar_name = self._translate('name', 'NATO Date Time Group')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"dtg_{base_name.lower().replace(' ', '_')}"
        
        # Set update interval
        self._update_interval = timedelta(seconds=UPDATE_INTERVAL)
        
        # DTG-specific data
        self._dtg_data = CALENDAR_INFO.get("dtg_data", {})
        self._timezones = self._dtg_data.get("timezones", {})
        self._months = self._dtg_data.get("months", {})
        
        # Initialize with defaults
        self._nato_zone = "Z"  # Default to Zulu time
        self._use_iana = False
        self._iana_zone_str = "UTC"
        self._uppercase = True
        self._timezone = None
        self._timezone_initialized = False
        
        # Try to initialize pytz timezone
        if HAS_PYTZ:
            try:
                self._timezone = pytz.timezone("UTC")
                self._timezone_initialized = True
            except Exception as e:
                _LOGGER.error(f"Failed to initialize default timezone: {e}")
        
        # DTG data storage
        self._dtg_info = {}
        self._state = "Initializing..."
        
        # Debug flag
        self._first_update = True
    
    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add DTG-specific attributes
        if self._dtg_info:
            attrs.update(self._dtg_info)
            
            # Add description
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add NATO zone info
            if self._nato_zone in self._timezones:
                zone_info = self._timezones[self._nato_zone]
                attrs["nato_zone"] = self._nato_zone
                attrs["nato_zone_name"] = zone_info.get("name", self._nato_zone)
                attrs["utc_offset"] = zone_info.get("offset", 0)
            
            # Add config info
            attrs["config"] = {
                "nato_zone": self._nato_zone,
                "use_iana": self._use_iana,
                "iana_zone": self._iana_zone_str if self._use_iana else None,
                "uppercase": self._uppercase
            }
        
        return attrs
    
    def _format_dtg(self, dt: datetime) -> str:
        """Format datetime as NATO DTG."""
        # Format: DDHHMM[Z]MONYY
        day = f"{dt.day:02d}"
        hour = f"{dt.hour:02d}"
        minute = f"{dt.minute:02d}"
        zone = self._nato_zone
        month = self._months.get(f"{dt.month:02d}", "UNK")
        year = f"{dt.year % 100:02d}"
        
        # Build DTG string
        dtg = f"{day}{hour}{minute}{zone} {month} {year}"
        
        # Apply uppercase setting
        if self._uppercase:
            dtg = dtg.upper()
        else:
            dtg = dtg.lower()
        
        return dtg
    
    def _calculate_dtg_info(self, dt: datetime) -> Dict[str, Any]:
        """Calculate DTG information."""
        # Get components
        day = dt.day
        hour = dt.hour
        minute = dt.minute
        second = dt.second
        month_num = dt.month
        year = dt.year
        
        # Get month abbreviation
        month_abbr = self._months.get(f"{month_num:02d}", "UNK")
        
        # Get zone info
        zone_info = self._timezones.get(self._nato_zone, {})
        zone_name = zone_info.get("name", self._nato_zone)
        utc_offset = zone_info.get("offset", 0)
        
        # Format full DTG
        dtg_display = self._format_dtg(dt)
        
        # Calculate Julian day
        julian_day = dt.timetuple().tm_yday
        
        # Determine if DST is active (if using IANA timezone)
        is_dst = False
        if self._use_iana and HAS_PYTZ and self._timezone and self._timezone_initialized:
            try:
                is_dst = bool(dt.dst())
            except:
                is_dst = False
        
        result = {
            "dtg": dtg_display,
            "components": {
                "day": day,
                "hour": hour,
                "minute": minute,
                "second": second,
                "zone": self._nato_zone,
                "zone_name": zone_name,
                "month": month_abbr,
                "year": year % 100,
                "full_year": year
            },
            "julian_day": julian_day,
            "utc_offset_hours": utc_offset,
            "is_dst": is_dst,
            "iso_format": dt.isoformat(),
            "unix_timestamp": int(dt.timestamp()),
            "timezone_info": {
                "nato": self._nato_zone,
                "name": zone_name,
                "offset": utc_offset,
                "iana": self._iana_zone_str if self._use_iana else None
            }
        }
        
        return result
    
    def update(self) -> None:
        """Update the sensor."""
        # Load options on every update
        options = self.get_plugin_options()
        
        # Debug on first update
        if self._first_update:
            if options:
                _LOGGER.info(f"DTG sensor options in first update: {options}")
            else:
                _LOGGER.debug("DTG sensor using defaults (no options configured)")
            self._first_update = False
        
        # Update configuration
        if options:
            new_nato_zone = options.get("timezone", "Z")
            self._use_iana = bool(options.get("use_iana_timezone", False))
            new_iana_zone = options.get("iana_timezone", "UTC")
            self._uppercase = bool(options.get("uppercase", True))
            
            # Check if NATO zone changed
            if new_nato_zone != self._nato_zone:
                _LOGGER.info(f"NATO zone changed from {self._nato_zone} to {new_nato_zone}")
                self._nato_zone = new_nato_zone
                
                # Update name
                calendar_name = self._translate('name', 'NATO Date Time Group')
                self._attr_name = f"{self._base_name} {calendar_name} ({self._nato_zone})"
            
            # Check if IANA zone changed (if enabled)
            if self._use_iana and new_iana_zone != self._iana_zone_str and HAS_PYTZ:
                _LOGGER.info(f"IANA timezone changed from {self._iana_zone_str} to {new_iana_zone}")
                self._iana_zone_str = new_iana_zone
                try:
                    self._timezone = pytz.timezone(self._iana_zone_str)
                    self._timezone_initialized = True
                except Exception as e:
                    _LOGGER.error(f"Failed to load IANA timezone {self._iana_zone_str}: {e}")
                    # Fallback to UTC
                    self._timezone = pytz.timezone("UTC")
                    self._iana_zone_str = "UTC"
        
        # Calculate time based on configuration
        try:
            if self._use_iana and HAS_PYTZ and self._timezone and self._timezone_initialized:
                # Use specific IANA timezone for accurate DST handling
                now = datetime.now(self._timezone)
            else:
                # Use NATO zone offset
                zone_info = self._timezones.get(self._nato_zone, {})
                offset_hours = zone_info.get("offset", 0)
                
                if HAS_PYTZ:
                    # Create fixed offset timezone
                    from datetime import timezone as dt_timezone
                    tz = dt_timezone(timedelta(hours=offset_hours))
                    now = datetime.now(tz)
                else:
                    # Fallback to UTC with manual offset
                    from datetime import timezone as dt_timezone
                    now = datetime.now(dt_timezone.utc)
                    now = now + timedelta(hours=offset_hours)
            
            # Calculate DTG info
            self._dtg_info = self._calculate_dtg_info(now)
            self._state = self._dtg_info["dtg"]
            
        except Exception as e:
            _LOGGER.error(f"Error calculating DTG: {e}")
            self._state = f"Error: {self._nato_zone}"
            self._dtg_info = {"error": str(e)}
        
        _LOGGER.debug(f"Updated DTG to {self._state}")


# Required for Home Assistant to discover this calendar
__all__ = ['DTGSensor', 'CALENDAR_INFO']