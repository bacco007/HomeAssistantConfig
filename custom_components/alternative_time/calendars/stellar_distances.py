"""Stellar Distances Calculator - Precise astronomical distances to notable stars and pulsars.

This plugin calculates real-time distances in AU to:

STARS:
- Scholz's Star (passed through Oort Cloud ~70,000 years ago)
- Proxima Centauri (nearest star system)
- Gliese 710 (star on collision course, closest approach in ~1.3 million years)
- Barnard's Star (fastest proper motion in the sky)
- Ross 248 (will become nearest star in ~36,000 years)
- Polaris (North Star / Pole Star)
- Betelgeuse (red supergiant, potential supernova candidate)

PULSARS (6 nearest):
- PSR J0437-4715 (nearest millisecond pulsar, ~512 ly)
- PSR J0108-1431 (oldest nearby pulsar, ~424 ly)
- Vela Pulsar (brightest radio pulsar, ~287 pc)
- Geminga (gamma-ray pulsar, ~250 pc)
- PSR B0656+14 (Three Musketeers pulsar, ~288 pc)
- PSR B0950+08 (old pulsar in Leo, ~280 pc)

Uses J2000.0 coordinates, proper motions, parallaxes and radial velocities for high precision.
Data sources: Gaia DR3, VLBI parallax measurements, pulsar timing.
"""
from __future__ import annotations

from datetime import datetime
import logging
import math
from typing import Dict, Any, Optional, Tuple, List

from homeassistant.core import HomeAssistant
from ..sensor import AlternativeTimeSensorBase

_LOGGER = logging.getLogger(__name__)

# ============================================
# CONSTANTS
# ============================================

SPEED_OF_LIGHT_KM_S = 299792.458
AU_IN_KM = 149597870.7
PARSEC_IN_AU = 206264.806247
LIGHT_YEAR_IN_AU = 63241.077
PARSEC_IN_LY = 3.26156
SECONDS_PER_YEAR = 31557600
SECONDS_PER_DAY = 86400
KM_PER_AU = AU_IN_KM
AU_PER_KM = 1.0 / AU_IN_KM

J2000_EPOCH = datetime(2000, 1, 1, 12, 0, 0)
MAS_TO_RAD_PER_YEAR = math.pi / (180 * 3600 * 1000)

# ============================================
# STELLAR DATA (J2000.0 Epoch)
# ============================================

STELLAR_DATA = {
    # ==========================================
    # STARS
    # ==========================================
    "proxima_centauri": {
        "name": "Proxima Centauri",
        "category": "star",
        "names_i18n": {
            "en": "Proxima Centauri", "de": "Proxima Centauri", "es": "Próxima Centauri",
            "fr": "Proxima du Centaure", "it": "Proxima Centauri", "nl": "Proxima Centauri",
            "pl": "Proxima Centauri", "pt": "Proxima Centauri", "ru": "Проксима Центавра",
            "ja": "プロキシマ・ケンタウリ", "zh": "比邻星", "ko": "프록시마 센타우리"
        },
        "ra_deg": 217.42893583, "dec_deg": -62.67948889,
        "parallax_mas": 768.0665, "parallax_error_mas": 0.0499,
        "pm_ra_mas_yr": -3781.741, "pm_dec_mas_yr": 769.465,
        "rv_km_s": -22.204, "rv_error_km_s": 0.032,
        "spectral_type": "M5.5Ve",
        "note_key": "nearest_star", "icon": "mdi:star"
    },
    "barnards_star": {
        "name": "Barnard's Star",
        "category": "star",
        "names_i18n": {
            "en": "Barnard's Star", "de": "Barnards Stern", "es": "Estrella de Barnard",
            "fr": "Étoile de Barnard", "it": "Stella di Barnard", "nl": "Barnards ster",
            "pl": "Gwiazda Barnarda", "pt": "Estrela de Barnard", "ru": "Звезда Барнарда",
            "ja": "バーナード星", "zh": "巴纳德星", "ko": "버나드별"
        },
        "ra_deg": 269.45402305, "dec_deg": 4.69339088,
        "parallax_mas": 546.9759, "parallax_error_mas": 0.0408,
        "pm_ra_mas_yr": -798.71, "pm_dec_mas_yr": 10337.59,
        "rv_km_s": -110.6, "rv_error_km_s": 0.5,
        "spectral_type": "M4Ve",
        "note_key": "fastest_star", "icon": "mdi:star-shooting"
    },
    "scholz_star": {
        "name": "Scholz's Star",
        "category": "star",
        "names_i18n": {
            "en": "Scholz's Star", "de": "Scholz-Stern", "es": "Estrella de Scholz",
            "fr": "Étoile de Scholz", "it": "Stella di Scholz", "nl": "Scholz' ster",
            "pl": "Gwiazda Scholza", "pt": "Estrela de Scholz", "ru": "Звезда Шольца",
            "ja": "ショルツ星", "zh": "舒尔茨星", "ko": "숄츠의 별"
        },
        "ra_deg": 110.01355833, "dec_deg": -8.78053056,
        "parallax_mas": 147.1827, "parallax_error_mas": 0.2549,
        "pm_ra_mas_yr": -3875.641, "pm_dec_mas_yr": -5730.284,
        "rv_km_s": 82.4, "rv_error_km_s": 0.5,
        "spectral_type": "M9 + T5.5",
        "note_key": "oort_passage", "icon": "mdi:star-circle"
    },
    "ross_248": {
        "name": "Ross 248",
        "category": "star",
        "names_i18n": {
            "en": "Ross 248", "de": "Ross 248", "es": "Ross 248",
            "fr": "Ross 248", "it": "Ross 248", "nl": "Ross 248",
            "pl": "Ross 248", "pt": "Ross 248", "ru": "Росс 248",
            "ja": "ロス248", "zh": "罗斯248", "ko": "로스 248"
        },
        "ra_deg": 355.47576, "dec_deg": 44.16661,
        "parallax_mas": 316.69, "parallax_error_mas": 0.85,
        "pm_ra_mas_yr": 106.41, "pm_dec_mas_yr": -1585.64,
        "rv_km_s": -75.2, "rv_error_km_s": 1.0,
        "spectral_type": "M6V",
        "note_key": "future_nearest", "icon": "mdi:star-four-points"
    },
    "gliese_710": {
        "name": "Gliese 710",
        "category": "star",
        "names_i18n": {
            "en": "Gliese 710", "de": "Gliese 710", "es": "Gliese 710",
            "fr": "Gliese 710", "it": "Gliese 710", "nl": "Gliese 710",
            "pl": "Gliese 710", "pt": "Gliese 710", "ru": "Глизе 710",
            "ja": "グリーゼ710", "zh": "格利泽710", "ko": "글리제 710"
        },
        "ra_deg": 274.96190417, "dec_deg": -1.93653056,
        "parallax_mas": 52.1755, "parallax_error_mas": 0.0265,
        "pm_ra_mas_yr": -0.467, "pm_dec_mas_yr": -0.170,
        "rv_km_s": -13.806, "rv_error_km_s": 0.097,
        "spectral_type": "K7V",
        "note_key": "collision_course",
        "closest_approach_au": 10635, "closest_approach_years": 1350000,
        "icon": "mdi:star-crescent"
    },
    "polaris": {
        "name": "Polaris",
        "category": "star",
        "names_i18n": {
            "en": "Polaris (North Star)", "de": "Polaris (Polarstern)", "es": "Polaris (Estrella Polar)",
            "fr": "Polaris (Étoile Polaire)", "it": "Polaris (Stella Polare)", "nl": "Polaris (Poolster)",
            "pl": "Polaris (Gwiazda Polarna)", "pt": "Polaris (Estrela Polar)", "ru": "Полярная звезда",
            "ja": "ポラリス（北極星）", "zh": "北极星", "ko": "폴라리스 (북극성)"
        },
        "ra_deg": 37.95456067, "dec_deg": 89.26410897,
        "parallax_mas": 7.54, "parallax_error_mas": 0.11,
        "pm_ra_mas_yr": 44.48, "pm_dec_mas_yr": -11.85,
        "rv_km_s": -17.4, "rv_error_km_s": 0.3,
        "spectral_type": "F7Ib (Cepheid)",
        "note_key": "north_star", "icon": "mdi:compass-rose"
    },
    "betelgeuse": {
        "name": "Betelgeuse",
        "category": "star",
        "names_i18n": {
            "en": "Betelgeuse", "de": "Beteigeuze", "es": "Betelgeuse",
            "fr": "Bételgeuse", "it": "Betelgeuse", "nl": "Betelgeuze",
            "pl": "Betelgeza", "pt": "Betelgeuse", "ru": "Бетельгейзе",
            "ja": "ベテルギウス", "zh": "参宿四", "ko": "베텔게우스"
        },
        "ra_deg": 88.79293899, "dec_deg": 7.40706389,
        "parallax_mas": 4.51, "parallax_error_mas": 0.80,
        "pm_ra_mas_yr": 24.95, "pm_dec_mas_yr": 9.56,
        "rv_km_s": 21.91, "rv_error_km_s": 0.51,
        "spectral_type": "M1-M2 Ia-ab",
        "note_key": "supernova_candidate", "icon": "mdi:star-face"
    },
    
    # ==========================================
    # PULSARS (6 nearest)
    # ==========================================
    "psr_j0437_4715": {
        "name": "PSR J0437-4715",
        "category": "pulsar",
        "names_i18n": {
            "en": "PSR J0437-4715", "de": "PSR J0437-4715", "es": "PSR J0437-4715",
            "fr": "PSR J0437-4715", "it": "PSR J0437-4715", "nl": "PSR J0437-4715",
            "pl": "PSR J0437-4715", "pt": "PSR J0437-4715", "ru": "PSR J0437-4715",
            "ja": "PSR J0437-4715", "zh": "PSR J0437-4715", "ko": "PSR J0437-4715"
        },
        "ra_deg": 69.31654167, "dec_deg": -47.25264722,
        "parallax_mas": 6.378, "parallax_error_mas": 0.004,
        "pm_ra_mas_yr": 121.679, "pm_dec_mas_yr": -71.476,
        "rv_km_s": 0.0, "rv_error_km_s": 50.0,
        "spectral_type": "MSP (1.4 M☉)",
        "period_ms": 5.757,
        "note_key": "nearest_msp", "icon": "mdi:pulse"
    },
    "psr_j0108_1431": {
        "name": "PSR J0108-1431",
        "category": "pulsar",
        "names_i18n": {
            "en": "PSR J0108-1431", "de": "PSR J0108-1431", "es": "PSR J0108-1431",
            "fr": "PSR J0108-1431", "it": "PSR J0108-1431", "nl": "PSR J0108-1431",
            "pl": "PSR J0108-1431", "pt": "PSR J0108-1431", "ru": "PSR J0108-1431",
            "ja": "PSR J0108-1431", "zh": "PSR J0108-1431", "ko": "PSR J0108-1431"
        },
        "ra_deg": 17.13483333, "dec_deg": -14.51869444,
        "parallax_mas": 7.692, "parallax_error_mas": 1.0,
        "pm_ra_mas_yr": 75.0, "pm_dec_mas_yr": -105.0,
        "rv_km_s": 0.0, "rv_error_km_s": 50.0,
        "spectral_type": "Old Pulsar (166 Myr)",
        "period_ms": 807.6,
        "note_key": "oldest_nearby", "icon": "mdi:pulse"
    },
    "vela_pulsar": {
        "name": "Vela Pulsar",
        "category": "pulsar",
        "names_i18n": {
            "en": "Vela Pulsar (PSR B0833-45)", "de": "Vela-Pulsar (PSR B0833-45)",
            "es": "Púlsar de Vela (PSR B0833-45)", "fr": "Pulsar de Vela (PSR B0833-45)",
            "it": "Pulsar della Vela (PSR B0833-45)", "nl": "Vela-pulsar (PSR B0833-45)",
            "pl": "Pulsar Vela (PSR B0833-45)", "pt": "Pulsar de Vela (PSR B0833-45)",
            "ru": "Пульсар Паруса (PSR B0833-45)", "ja": "ベラパルサー (PSR B0833-45)",
            "zh": "船帆座脉冲星 (PSR B0833-45)", "ko": "벨라 펄서 (PSR B0833-45)"
        },
        "ra_deg": 128.83604167, "dec_deg": -45.17635556,
        "parallax_mas": 3.5, "parallax_error_mas": 0.2,
        "pm_ra_mas_yr": -49.68, "pm_dec_mas_yr": 29.9,
        "rv_km_s": 0.0, "rv_error_km_s": 50.0,
        "spectral_type": "Young Pulsar (11 kyr)",
        "period_ms": 89.328,
        "note_key": "brightest_radio", "icon": "mdi:pulse"
    },
    "geminga": {
        "name": "Geminga",
        "category": "pulsar",
        "names_i18n": {
            "en": "Geminga (PSR J0633+1746)", "de": "Geminga (PSR J0633+1746)",
            "es": "Geminga (PSR J0633+1746)", "fr": "Geminga (PSR J0633+1746)",
            "it": "Geminga (PSR J0633+1746)", "nl": "Geminga (PSR J0633+1746)",
            "pl": "Geminga (PSR J0633+1746)", "pt": "Geminga (PSR J0633+1746)",
            "ru": "Геминга (PSR J0633+1746)", "ja": "ゲミンガ (PSR J0633+1746)",
            "zh": "盖明加 (PSR J0633+1746)", "ko": "게밍가 (PSR J0633+1746)"
        },
        "ra_deg": 98.47563333, "dec_deg": 17.77025,
        "parallax_mas": 4.0, "parallax_error_mas": 1.3,
        "pm_ra_mas_yr": 138.0, "pm_dec_mas_yr": 97.0,
        "rv_km_s": 0.0, "rv_error_km_s": 50.0,
        "spectral_type": "Gamma-ray Pulsar (342 kyr)",
        "period_ms": 237.0,
        "note_key": "gamma_pulsar", "icon": "mdi:radioactive"
    },
    "psr_b0656_14": {
        "name": "PSR B0656+14",
        "category": "pulsar",
        "names_i18n": {
            "en": "PSR B0656+14", "de": "PSR B0656+14", "es": "PSR B0656+14",
            "fr": "PSR B0656+14", "it": "PSR B0656+14", "nl": "PSR B0656+14",
            "pl": "PSR B0656+14", "pt": "PSR B0656+14", "ru": "PSR B0656+14",
            "ja": "PSR B0656+14", "zh": "PSR B0656+14", "ko": "PSR B0656+14"
        },
        "ra_deg": 104.95091667, "dec_deg": 14.23938889,
        "parallax_mas": 3.47, "parallax_error_mas": 0.36,
        "pm_ra_mas_yr": 43.0, "pm_dec_mas_yr": -2.0,
        "rv_km_s": 0.0, "rv_error_km_s": 50.0,
        "spectral_type": "Middle-aged Pulsar (111 kyr)",
        "period_ms": 384.87,
        "note_key": "three_musketeers", "icon": "mdi:pulse"
    },
    "psr_b0950_08": {
        "name": "PSR B0950+08",
        "category": "pulsar",
        "names_i18n": {
            "en": "PSR B0950+08", "de": "PSR B0950+08", "es": "PSR B0950+08",
            "fr": "PSR B0950+08", "it": "PSR B0950+08", "nl": "PSR B0950+08",
            "pl": "PSR B0950+08", "pt": "PSR B0950+08", "ru": "PSR B0950+08",
            "ja": "PSR B0950+08", "zh": "PSR B0950+08", "ko": "PSR B0950+08"
        },
        "ra_deg": 148.28873750, "dec_deg": 7.92678889,
        "parallax_mas": 3.6, "parallax_error_mas": 0.3,
        "pm_ra_mas_yr": -2.09, "pm_dec_mas_yr": 29.46,
        "rv_km_s": 36.6, "rv_error_km_s": 5.0,
        "spectral_type": "Old Pulsar (17.5 Myr)",
        "period_ms": 253.06,
        "note_key": "old_leo_pulsar", "icon": "mdi:pulse"
    }
}

UPDATE_INTERVAL = 3600

CALENDAR_INFO = {
    "id": "stellar_distances",
    "version": "2.0.0",
    "icon": "mdi:star-shooting",
    "category": "space",
    "accuracy": "high",
    "update_interval": UPDATE_INTERVAL,
    
    "name": {
        "en": "Stellar Distances", "de": "Sternentfernungen", "es": "Distancias Estelares",
        "fr": "Distances Stellaires", "it": "Distanze Stellari", "nl": "Sterrenafstanden",
        "pl": "Odległości Gwiezdne", "pt": "Distâncias Estelares", "ru": "Звёздные расстояния",
        "ja": "恒星距離", "zh": "恒星距离", "ko": "항성 거리"
    },
    
    "description": {
        "en": "Real-time distances with measurement accuracy (±%) to notable stars and the 6 nearest pulsars. Data: Gaia DR3, VLBI",
        "de": "Echtzeit-Entfernungen mit Messgenauigkeit (±%) zu bemerkenswerten Sternen und den 6 nächsten Pulsaren. Daten: Gaia DR3, VLBI",
        "es": "Distancias en tiempo real con precisión de medición (±%) a estrellas notables y los 6 púlsares más cercanos. Datos: Gaia DR3, VLBI",
        "fr": "Distances en temps réel avec précision de mesure (±%) vers des étoiles notables et les 6 pulsars les plus proches. Données: Gaia DR3, VLBI",
        "it": "Distanze in tempo reale con accuratezza di misura (±%) verso stelle notevoli e i 6 pulsar più vicini. Dati: Gaia DR3, VLBI",
        "nl": "Realtime afstanden met meetnauwkeurigheid (±%) naar opmerkelijke sterren en de 6 dichtstbijzijnde pulsars. Data: Gaia DR3, VLBI",
        "pl": "Odległości w czasie rzeczywistym z dokładnością pomiaru (±%) do godnych uwagi gwiazd i 6 najbliższych pulsarów. Dane: Gaia DR3, VLBI",
        "pt": "Distâncias em tempo real com precisão de medição (±%) para estrelas notáveis e os 6 pulsares mais próximos. Dados: Gaia DR3, VLBI",
        "ru": "Расстояния в реальном времени с точностью измерения (±%) до известных звёзд и 6 ближайших пульсаров. Данные: Gaia DR3, VLBI",
        "ja": "注目すべき恒星と最も近い6つのパルサーまでの測定精度(±%)付きリアルタイム距離。データ: Gaia DR3, VLBI",
        "zh": "实时计算到著名恒星和6颗最近脉冲星的距离，含测量精度(±%)。数据来源: Gaia DR3, VLBI",
        "ko": "주목할 만한 별과 가장 가까운 6개 펄서까지의 측정 정확도(±%) 포함 실시간 거리. 데이터: Gaia DR3, VLBI"
    },
    
    "detailed_info": {
        "en": "Calculates distances to 7 notable stars and 6 nearest pulsars using Gaia DR3 and VLBI data.",
        "de": "Berechnet Entfernungen zu 7 bemerkenswerten Sternen und 6 nächsten Pulsaren mit Gaia DR3 und VLBI-Daten."
    },
    
    "star_notes": {
        "nearest_star": {"en": "Nearest known star to the Sun (4.24 ly)", "de": "Nächster bekannter Stern zur Sonne (4,24 Lj)", "es": "Estrella conocida más cercana al Sol (4,24 al)", "fr": "Étoile connue la plus proche du Soleil (4,24 al)", "it": "Stella conosciuta più vicina al Sole (4,24 al)", "nl": "Dichtstbijzijnde bekende ster bij de Zon (4,24 lj)", "pl": "Najbliższa znana gwiazda od Słońca (4,24 ls)", "pt": "Estrela conhecida mais próxima do Sol (4,24 al)", "ru": "Ближайшая известная звезда к Солнцу (4,24 св.г.)", "ja": "太陽に最も近い既知の恒星（4.24光年）", "zh": "已知距离太阳最近的恒星（4.24光年）", "ko": "태양에서 가장 가까운 알려진 별 (4.24광년)"},
        "fastest_star": {"en": "Fastest proper motion: 10.3 arcsec/year", "de": "Schnellste Eigenbewegung: 10,3 Bogensek./Jahr", "es": "Movimiento propio más rápido: 10,3\"/año", "fr": "Mouvement propre le plus rapide: 10,3\"/an", "it": "Moto proprio più veloce: 10,3\"/anno", "nl": "Snelste eigenbeweging: 10,3\"/jaar", "pl": "Najszybszy ruch własny: 10,3\"/rok", "pt": "Movimento próprio mais rápido: 10,3\"/ano", "ru": "Самое быстрое собственное движение: 10,3\"/год", "ja": "最速の固有運動: 10.3秒角/年", "zh": "最快的自行运动: 10.3角秒/年", "ko": "가장 빠른 고유 운동: 10.3초각/년"},
        "oort_passage": {"en": "Passed through Oort Cloud ~70,000 years ago at 0.82 ly", "de": "Durchquerte die Oortsche Wolke vor ~70.000 Jahren bei 0,82 Lj", "es": "Pasó por la Nube de Oort hace ~70.000 años a 0,82 al", "fr": "A traversé le nuage d'Oort il y a ~70 000 ans à 0,82 al", "it": "Passato attraverso la Nube di Oort ~70.000 anni fa a 0,82 al", "nl": "Passeerde de Oortwolk ~70.000 jaar geleden op 0,82 lj", "pl": "Przeszedł przez Obłok Oorta ~70 000 lat temu w odległości 0,82 ls", "pt": "Passou pela Nuvem de Oort há ~70.000 anos a 0,82 al", "ru": "Прошла через облако Оорта ~70 000 лет назад на 0,82 св.г.", "ja": "約7万年前に0.82光年でオールトの雲を通過", "zh": "约7万年前以0.82光年距离穿过奥尔特云", "ko": "약 7만 년 전 0.82광년 거리에서 오르트 구름 통과"},
        "future_nearest": {"en": "Will become nearest star in ~36,000 years (3.0 ly)", "de": "Wird in ~36.000 Jahren nächster Stern (3,0 Lj)", "es": "Será la estrella más cercana en ~36.000 años (3,0 al)", "fr": "Deviendra l'étoile la plus proche dans ~36 000 ans (3,0 al)", "it": "Diventerà la stella più vicina tra ~36.000 anni (3,0 al)", "nl": "Wordt dichtstbijzijnde ster over ~36.000 jaar (3,0 lj)", "pl": "Stanie się najbliższą gwiazdą za ~36 000 lat (3,0 ls)", "pt": "Será a estrela mais próxima em ~36.000 anos (3,0 al)", "ru": "Станет ближайшей звездой через ~36 000 лет (3,0 св.г.)", "ja": "約3.6万年後に最も近い恒星になる（3.0光年）", "zh": "约3.6万年后将成为最近的恒星（3.0光年）", "ko": "약 3.6만 년 후 가장 가까운 별이 됨 (3.0광년)"},
        "collision_course": {"en": "Closest approach: ~10,600 AU in 1.35 million years", "de": "Nächste Annäherung: ~10.600 AE in 1,35 Mio. Jahren", "es": "Aproximación más cercana: ~10.600 UA en 1,35 millones de años", "fr": "Approche la plus proche: ~10 600 UA dans 1,35 million d'années", "it": "Avvicinamento massimo: ~10.600 UA tra 1,35 milioni di anni", "nl": "Dichtstbijzijnde nadering: ~10.600 AE over 1,35 miljoen jaar", "pl": "Najbliższe zbliżenie: ~10 600 AU za 1,35 mln lat", "pt": "Aproximação mais próxima: ~10.600 UA em 1,35 milhões de anos", "ru": "Ближайшее сближение: ~10 600 а.е. через 1,35 млн лет", "ja": "最接近: 135万年後に約10,600 AU", "zh": "最近距离: 135万年后约10,600 AU", "ko": "최근접: 135만 년 후 약 10,600 AU"},
        "north_star": {"en": "Current North Star - navigation beacon for millennia", "de": "Aktueller Polarstern - Navigationsstern seit Jahrtausenden", "es": "Estrella Polar actual - faro de navegación por milenios", "fr": "Étoile Polaire actuelle - balise de navigation depuis des millénaires", "it": "Attuale Stella Polare - faro di navigazione da millenni", "nl": "Huidige Poolster - navigatiebaken al millennia", "pl": "Obecna Gwiazda Polarna - latarnia nawigacyjna od tysiącleci", "pt": "Atual Estrela Polar - farol de navegação há milênios", "ru": "Нынешняя Полярная звезда - навигационный маяк тысячелетиями", "ja": "現在の北極星 - 数千年にわたる航海の指標", "zh": "现在的北极星 - 数千年来的导航灯塔", "ko": "현재 북극성 - 수천 년간의 항해 표지"},
        "supernova_candidate": {"en": "Red supergiant - may explode as supernova within 100,000 years", "de": "Roter Überriese - könnte innerhalb von 100.000 Jahren als Supernova explodieren", "es": "Supergigante roja - puede explotar como supernova en 100.000 años", "fr": "Supergéante rouge - pourrait exploser en supernova dans 100 000 ans", "it": "Supergigante rossa - potrebbe esplodere come supernova entro 100.000 anni", "nl": "Rode superreus - kan binnen 100.000 jaar als supernova exploderen", "pl": "Czerwony nadolbrzym - może wybuchnąć jako supernowa w ciągu 100 000 lat", "pt": "Supergigante vermelha - pode explodir como supernova em 100.000 anos", "ru": "Красный сверхгигант - может взорваться как сверхновая в течение 100 000 лет", "ja": "赤色超巨星 - 10万年以内に超新星爆発の可能性", "zh": "红超巨星 - 可能在10万年内爆发为超新星", "ko": "적색 초거성 - 10만 년 내에 초신성으로 폭발할 수 있음"},
        "nearest_msp": {"en": "Nearest millisecond pulsar - rotates 173 times/sec", "de": "Nächster Millisekunden-Pulsar - rotiert 173 mal/Sek.", "es": "Púlsar de milisegundos más cercano - rota 173 veces/seg", "fr": "Pulsar milliseconde le plus proche - tourne 173 fois/sec", "it": "Pulsar millisecondo più vicino - ruota 173 volte/sec", "nl": "Dichtstbijzijnde milliseconde-pulsar - draait 173 keer/sec", "pl": "Najbliższy pulsar milisekundowy - obraca się 173 razy/s", "pt": "Pulsar de milissegundos mais próximo - gira 173 vezes/seg", "ru": "Ближайший миллисекундный пульсар - вращается 173 раза/сек", "ja": "最も近いミリ秒パルサー - 毎秒173回転", "zh": "最近的毫秒脉冲星 - 每秒旋转173次", "ko": "가장 가까운 밀리초 펄서 - 초당 173회 회전"},
        "oldest_nearby": {"en": "One of the oldest nearby pulsars - 166 million years old", "de": "Einer der ältesten nahen Pulsare - 166 Millionen Jahre alt", "es": "Uno de los púlsares cercanos más antiguos - 166 millones de años", "fr": "L'un des pulsars proches les plus anciens - 166 millions d'années", "it": "Uno dei pulsar vicini più antichi - 166 milioni di anni", "nl": "Een van de oudste nabije pulsars - 166 miljoen jaar oud", "pl": "Jeden z najstarszych pobliskich pulsarów - 166 mln lat", "pt": "Um dos pulsares próximos mais antigos - 166 milhões de anos", "ru": "Один из старейших ближайших пульсаров - 166 миллионов лет", "ja": "最も古い近傍パルサーの一つ - 1億6600万歳", "zh": "最古老的近距离脉冲星之一 - 1.66亿年", "ko": "가장 오래된 근처 펄서 중 하나 - 1억 6600만 년"},
        "brightest_radio": {"en": "Brightest radio pulsar in the sky - 11 rotations/sec", "de": "Hellster Radio-Pulsar am Himmel - 11 Rotationen/Sek.", "es": "Púlsar de radio más brillante del cielo - 11 rotaciones/seg", "fr": "Pulsar radio le plus brillant du ciel - 11 rotations/sec", "it": "Pulsar radio più brillante del cielo - 11 rotazioni/sec", "nl": "Helderste radiopulsar aan de hemel - 11 rotaties/sec", "pl": "Najjaśniejszy pulsar radiowy na niebie - 11 obrotów/s", "pt": "Pulsar de rádio mais brilhante do céu - 11 rotações/seg", "ru": "Самый яркий радиопульсар на небе - 11 оборотов/сек", "ja": "空で最も明るい電波パルサー - 毎秒11回転", "zh": "天空中最亮的射电脉冲星 - 每秒11转", "ko": "하늘에서 가장 밝은 전파 펄서 - 초당 11회전"},
        "gamma_pulsar": {"en": "First gamma-ray pulsar discovered - radio quiet", "de": "Erster entdeckter Gamma-Pulsar - radioleise", "es": "Primer púlsar gamma descubierto - silencioso en radio", "fr": "Premier pulsar gamma découvert - silencieux en radio", "it": "Primo pulsar gamma scoperto - silenzioso in radio", "nl": "Eerste ontdekte gammapulsar - radiostil", "pl": "Pierwszy odkryty pulsar gamma - cichy radiowo", "pt": "Primeiro pulsar gama descoberto - silencioso em rádio", "ru": "Первый обнаруженный гамма-пульсар - радиотихий", "ja": "最初に発見されたガンマ線パルサー - 電波静穏", "zh": "首个发现的伽马射线脉冲星 - 射电静默", "ko": "최초로 발견된 감마선 펄서 - 전파 무음"},
        "three_musketeers": {"en": "One of the 'Three Musketeers' middle-aged pulsars", "de": "Einer der 'Drei Musketiere' - mittelaltrige Pulsare", "es": "Uno de los pulsares de mediana edad 'Tres Mosqueteros'", "fr": "L'un des pulsars d'age moyen 'Trois Mousquetaires'", "it": "Uno dei pulsar di mezza eta 'Tre Moschettieri'", "nl": "Een van de 'Drie Musketiers' middelbare pulsars", "pl": "Jeden z pulsarow w srednim wieku 'Trzej Muszkieterowie'", "pt": "Um dos pulsares de meia-idade 'Tres Mosqueteiros'", "ru": "Один из пульсаров среднего возраста 'Три мушкетёра'", "ja": "三銃士の中年パルサーの一つ", "zh": "三剑客中年脉冲星之一", "ko": "삼총사 중년 펄서 중 하나"},
        "old_leo_pulsar": {"en": "Old pulsar in Leo constellation - 17.5 million years", "de": "Alter Pulsar im Sternbild Löwe - 17,5 Millionen Jahre", "es": "Púlsar antiguo en la constelación de Leo - 17,5 millones de años", "fr": "Ancien pulsar dans la constellation du Lion - 17,5 millions d'années", "it": "Vecchio pulsar nella costellazione del Leone - 17,5 milioni di anni", "nl": "Oude pulsar in sterrenbeeld Leeuw - 17,5 miljoen jaar", "pl": "Stary pulsar w gwiazdozbiorze Lwa - 17,5 mln lat", "pt": "Pulsar antigo na constelação de Leão - 17,5 milhões de anos", "ru": "Старый пульсар в созвездии Льва - 17,5 миллионов лет", "ja": "しし座の古いパルサー - 1750万歳", "zh": "狮子座的古老脉冲星 - 1750万年", "ko": "사자자리의 오래된 펄서 - 1750만 년"}
    },
    
    "labels": {
        "approaching": {"en": "Approaching", "de": "Nähert sich", "es": "Acercándose", "fr": "S'approche", "it": "In avvicinamento", "nl": "Nadert", "pl": "Zbliża się", "pt": "Aproximando-se", "ru": "Приближается", "ja": "接近中", "zh": "接近中", "ko": "접근 중"},
        "receding": {"en": "Receding", "de": "Entfernt sich", "es": "Alejándose", "fr": "S'éloigne", "it": "In allontanamento", "nl": "Wijkt terug", "pl": "Oddala się", "pt": "Afastando-se", "ru": "Удаляется", "ja": "後退中", "zh": "远离中", "ko": "멀어지는 중"}
    },
    
    "config_options": {
        "primary_object": {
            "type": "select", "default": "proxima_centauri",
            "options": list(STELLAR_DATA.keys()),
            "label": {"en": "Primary Object Display", "de": "Primäres Objekt", "es": "Objeto Principal", "fr": "Objet Principal", "it": "Oggetto Principale", "nl": "Primair Object", "pl": "Główny Obiekt", "pt": "Objeto Principal", "ru": "Основной объект", "ja": "主要オブジェクト", "zh": "主要天体", "ko": "주요 천체"},
            "description": {"en": "Which star or pulsar to show in the main state", "de": "Welcher Stern oder Pulsar im Hauptstatus angezeigt werden soll"}
        },
        "distance_unit": {
            "type": "select", "default": "ly", "options": ["au", "ly", "pc", "both"],
            "label": {"en": "Distance Unit", "de": "Entfernungseinheit", "es": "Unidad de Distancia", "fr": "Unité de Distance", "it": "Unità di Distanza", "nl": "Afstandseenheid", "pl": "Jednostka Odległości", "pt": "Unidade de Distância", "ru": "Единица расстояния", "ja": "距離単位", "zh": "距离单位", "ko": "거리 단위"},
            "description": {"en": "AU, light years, parsecs, or both AU and ly", "de": "AE, Lichtjahre, Parsec oder beide"}
        },
        "precision": {
            "type": "select", "default": "high", "options": ["standard", "high", "scientific"],
            "label": {"en": "Precision Level", "de": "Genauigkeitsstufe", "es": "Nivel de Precisión", "fr": "Niveau de Précision", "it": "Livello di Precisione", "nl": "Precisieniveau", "pl": "Poziom Precyzji", "pt": "Nível de Precisão", "ru": "Уровень точности", "ja": "精度レベル", "zh": "精度级别", "ko": "정밀도 수준"},
            "description": {"en": "Decimal places (standard: 2, high: 4, scientific: 6)", "de": "Dezimalstellen (standard: 2, hoch: 4, wissenschaftlich: 6)"}
        },
        "show_stars": {"type": "boolean", "default": True, "label": {"en": "Show Stars", "de": "Sterne anzeigen", "es": "Mostrar Estrellas", "fr": "Afficher Étoiles", "it": "Mostra Stelle", "nl": "Sterren Tonen", "pl": "Pokaż Gwiazdy", "pt": "Mostrar Estrelas", "ru": "Показать звёзды", "ja": "恒星を表示", "zh": "显示恒星", "ko": "별 표시"}, "description": {"en": "Include stars in attributes", "de": "Sterne in Attributen einschließen"}},
        "show_pulsars": {"type": "boolean", "default": True, "label": {"en": "Show Pulsars", "de": "Pulsare anzeigen", "es": "Mostrar Púlsares", "fr": "Afficher Pulsars", "it": "Mostra Pulsar", "nl": "Pulsars Tonen", "pl": "Pokaż Pulsary", "pt": "Mostrar Pulsares", "ru": "Показать пульсары", "ja": "パルサーを表示", "zh": "显示脉冲星", "ko": "펄서 표시"}, "description": {"en": "Include pulsars in attributes", "de": "Pulsare in Attributen einschließen"}},
        "show_motion": {"type": "boolean", "default": True, "label": {"en": "Show Motion Direction", "de": "Bewegungsrichtung anzeigen", "es": "Mostrar Dirección", "fr": "Afficher Direction", "it": "Mostra Direzione", "nl": "Richting Tonen", "pl": "Pokaż Kierunek", "pt": "Mostrar Direção", "ru": "Показать направление", "ja": "移動方向を表示", "zh": "显示方向", "ko": "방향 표시"}, "description": {"en": "Show if object is approaching or receding", "de": "Zeigt an, ob sich das Objekt nähert oder entfernt"}}
    },
    
    "stellar_data": STELLAR_DATA
}

# ============================================
# CALCULATION FUNCTIONS
# ============================================

def julian_date(dt: datetime) -> float:
    year, month = dt.year, dt.month
    day = dt.day + (dt.hour + dt.minute / 60 + dt.second / 3600) / 24
    if month <= 2: year -= 1; month += 12
    A = int(year / 100); B = 2 - A + int(A / 4)
    return int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + B - 1524.5

def years_since_j2000(dt: datetime) -> float:
    return (julian_date(dt) - 2451545.0) / 365.25

def parallax_to_distance_au(parallax_mas: float) -> float:
    if parallax_mas <= 0: return float('inf')
    return (1000.0 / parallax_mas) * PARSEC_IN_AU

def calculate_current_distance(star_data: dict, dt: datetime) -> Tuple[float, float, float, float, float, float, float]:
    """Calculate current distance with uncertainty.
    
    Returns:
        Tuple of (distance_au, distance_ly, distance_pc, radial_change_au, 
                  uncertainty_percent, distance_min_au, distance_max_au)
    """
    parallax = star_data["parallax_mas"]
    parallax_error = star_data.get("parallax_error_mas", 0.0)
    
    base_distance_au = parallax_to_distance_au(parallax)
    
    # Calculate uncertainty from parallax error
    # For parallax: d = 1/π, so δd/d ≈ δπ/π (for small errors)
    # This gives the relative uncertainty
    if parallax > 0 and parallax_error > 0:
        relative_uncertainty = parallax_error / parallax
        uncertainty_percent = relative_uncertainty * 100
        
        # Calculate min/max distances (parallax ± error)
        parallax_min = max(parallax - parallax_error, 0.001)  # Avoid division by zero
        parallax_max = parallax + parallax_error
        distance_max_au = parallax_to_distance_au(parallax_min)  # Smaller parallax = larger distance
        distance_min_au = parallax_to_distance_au(parallax_max)  # Larger parallax = smaller distance
    else:
        uncertainty_percent = 0.0
        distance_min_au = base_distance_au
        distance_max_au = base_distance_au
    
    # Add radial velocity contribution
    years = years_since_j2000(dt)
    rv_km_s = star_data.get("rv_km_s", 0.0)
    rv_error = star_data.get("rv_error_km_s", 0.0)
    rv_au_per_year = rv_km_s * SECONDS_PER_YEAR / KM_PER_AU
    radial_change_au = rv_au_per_year * years
    
    # Add RV uncertainty contribution (for long time spans)
    if abs(years) > 1 and rv_error > 0:
        rv_uncertainty_au = (rv_error * SECONDS_PER_YEAR / KM_PER_AU) * abs(years)
        # Combine uncertainties (add in quadrature would be more correct, but this is simpler)
        distance_min_au = distance_min_au + radial_change_au - rv_uncertainty_au
        distance_max_au = distance_max_au + radial_change_au + rv_uncertainty_au
    else:
        distance_min_au += radial_change_au
        distance_max_au += radial_change_au
    
    current_distance_au = base_distance_au + radial_change_au
    
    return (current_distance_au, current_distance_au / LIGHT_YEAR_IN_AU, 
            current_distance_au / PARSEC_IN_AU, radial_change_au,
            uncertainty_percent, distance_min_au, distance_max_au)

def format_distance(distance_au: float, unit: str, precision: str) -> str:
    dp = {"standard": 2, "high": 4, "scientific": 6}.get(precision, 2)
    ly = distance_au / LIGHT_YEAR_IN_AU
    pc = distance_au / PARSEC_IN_AU
    if unit == "au": return f"{distance_au:,.{dp}f} AU"
    elif unit == "ly": return f"{ly:.{dp}f} ly"
    elif unit == "pc": return f"{pc:.{dp}f} pc"
    else: return f"{ly:.{dp}f} ly ({distance_au:,.0f} AU)"

# ============================================
# SENSOR CLASS
# ============================================

class StellarDistancesSensor(AlternativeTimeSensorBase):
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        super().__init__(base_name, hass)
        self._calendar_info = CALENDAR_INFO
        calendar_name = self._translate('name', 'Stellar Distances')
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_stellar_distances"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:star-shooting")
        
        cfg = CALENDAR_INFO.get("config_options", {})
        self._primary_object = cfg.get("primary_object", {}).get("default", "proxima_centauri")
        self._distance_unit = cfg.get("distance_unit", {}).get("default", "ly")
        self._precision = cfg.get("precision", {}).get("default", "high")
        self._show_stars = cfg.get("show_stars", {}).get("default", True)
        self._show_pulsars = cfg.get("show_pulsars", {}).get("default", True)
        self._show_motion = cfg.get("show_motion", {}).get("default", True)
        
        self._stellar_data = STELLAR_DATA
        self._options_loaded = False
        self._state = None
        self._object_distances = {}
    
    def _load_options(self) -> None:
        if self._options_loaded: return
        try:
            opts = self.get_plugin_options()
            if opts:
                self._primary_object = opts.get("primary_object", self._primary_object)
                self._distance_unit = opts.get("distance_unit", self._distance_unit)
                self._precision = opts.get("precision", self._precision)
                self._show_stars = opts.get("show_stars", self._show_stars)
                self._show_pulsars = opts.get("show_pulsars", self._show_pulsars)
                self._show_motion = opts.get("show_motion", self._show_motion)
            self._options_loaded = True
        except: pass
    
    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._load_options()
        self.update()
    
    def _get_label(self, key: str, default: str = "") -> str:
        labels = CALENDAR_INFO.get("labels", {}).get(key, {})
        if not labels: return default
        lang = getattr(self._hass.config, "language", "en")
        return labels.get(lang, labels.get(lang.split("-")[0], labels.get("en", default)))
    
    def _get_name(self, obj_id: str) -> str:
        obj = self._stellar_data.get(obj_id, {})
        names = obj.get("names_i18n", {})
        lang = getattr(self._hass.config, "language", "en")
        return names.get(lang, names.get(lang.split("-")[0], names.get("en", obj.get("name", obj_id))))
    
    def _get_note(self, note_key: str) -> str:
        notes = CALENDAR_INFO.get("star_notes", {}).get(note_key, {})
        if not notes: return ""
        lang = getattr(self._hass.config, "language", "en")
        return notes.get(lang, notes.get(lang.split("-")[0], notes.get("en", "")))
    
    def _calc_object(self, obj_id: str, now: datetime) -> Dict[str, Any]:
        obj = self._stellar_data.get(obj_id, {})
        if not obj: return {}
        
        dist_au, dist_ly, dist_pc, radial, uncertainty_pct, dist_min_au, dist_max_au = calculate_current_distance(obj, now)
        dp = {"standard": 2, "high": 4, "scientific": 6}.get(self._precision, 4)
        rv = obj.get("rv_km_s", 0.0)
        approaching = rv < 0
        
        # Calculate uncertainty in different units
        dist_min_ly = dist_min_au / LIGHT_YEAR_IN_AU
        dist_max_ly = dist_max_au / LIGHT_YEAR_IN_AU
        uncertainty_ly = (dist_max_ly - dist_min_ly) / 2
        uncertainty_au = (dist_max_au - dist_min_au) / 2
        
        # Format uncertainty string
        if uncertainty_pct < 0.1:
            accuracy_str = f"±{uncertainty_pct:.3f}% (excellent)"
            accuracy_rating = "excellent"
        elif uncertainty_pct < 1.0:
            accuracy_str = f"±{uncertainty_pct:.2f}% (very good)"
            accuracy_rating = "very_good"
        elif uncertainty_pct < 5.0:
            accuracy_str = f"±{uncertainty_pct:.1f}% (good)"
            accuracy_rating = "good"
        elif uncertainty_pct < 20.0:
            accuracy_str = f"±{uncertainty_pct:.0f}% (moderate)"
            accuracy_rating = "moderate"
        else:
            accuracy_str = f"±{uncertainty_pct:.0f}% (uncertain)"
            accuracy_rating = "uncertain"
        
        result = {
            "name": self._get_name(obj_id), 
            "object_id": obj_id, 
            "category": obj.get("category", "unknown"),
            "distance_au": round(dist_au, dp), 
            "distance_ly": round(dist_ly, dp), 
            "distance_pc": round(dist_pc, dp),
            "distance_formatted": format_distance(dist_au, self._distance_unit, self._precision),
            "is_approaching": approaching, 
            "motion": self._get_label("approaching" if approaching else "receding"),
            "radial_velocity_km_s": rv, 
            "spectral_type": obj.get("spectral_type", "Unknown"),
            # Uncertainty data
            "uncertainty_percent": round(uncertainty_pct, 3),
            "uncertainty_au": round(uncertainty_au, dp),
            "uncertainty_ly": round(uncertainty_ly, dp),
            "distance_min_ly": round(dist_min_ly, dp),
            "distance_max_ly": round(dist_max_ly, dp),
            "distance_range_ly": f"{dist_min_ly:.2f} - {dist_max_ly:.2f} ly",
            "accuracy_rating": accuracy_rating,
            "accuracy_str": accuracy_str,
            "parallax_mas": obj.get("parallax_mas", 0),
            "parallax_error_mas": obj.get("parallax_error_mas", 0),
            "data_quality": f"Parallax: {obj.get('parallax_mas', 0):.4f} ± {obj.get('parallax_error_mas', 0):.4f} mas"
        }
        
        if obj.get("note_key"): result["note"] = self._get_note(obj["note_key"])
        if "period_ms" in obj: result["period_ms"] = obj["period_ms"]
        if obj_id == "gliese_710":
            result["closest_approach_au"] = obj.get("closest_approach_au", 10635)
            result["closest_approach_years"] = obj.get("closest_approach_years", 1350000)
        return result
    
    def update(self) -> None:
        if not self._options_loaded: self._load_options()
        try:
            now = datetime.utcnow()
            all_data = {}
            for obj_id in self._stellar_data.keys():
                data = self._calc_object(obj_id, now)
                cat = data.get("category", "unknown")
                if cat == "star" and not self._show_stars: continue
                if cat == "pulsar" and not self._show_pulsars: continue
                all_data[obj_id] = data
            self._object_distances = all_data
            primary = all_data.get(self._primary_object, {})
            if primary:
                parts = [f"{primary['name']}: {primary['distance_formatted']}"]
                if self._show_motion and primary.get("radial_velocity_km_s", 0) != 0:
                    parts.append(f"({primary['motion']})")
                self._state = " ".join(parts)
            else: self._state = "Error: Unknown object"
        except Exception as e:
            self._state = f"Error: {e}"
    
    @property
    def state(self) -> Optional[str]: return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        attrs = super().extra_state_attributes
        attrs["last_calculated"] = datetime.utcnow().isoformat() + "Z"
        attrs["data_sources"] = "Gaia DR3, VLBI, Pulsar Timing"
        attrs["measurement_epoch"] = "J2000.0 (2000-01-01T12:00:00Z)"
        
        primary = self._object_distances.get(self._primary_object, {})
        if primary:
            attrs["primary_object"] = primary["name"]
            attrs["primary_distance_ly"] = primary["distance_ly"]
            attrs["primary_distance_au"] = primary["distance_au"]
            attrs["primary_category"] = primary["category"]
            # Uncertainty for primary object
            attrs["primary_uncertainty_percent"] = primary["uncertainty_percent"]
            attrs["primary_uncertainty_ly"] = primary["uncertainty_ly"]
            attrs["primary_distance_range_ly"] = primary["distance_range_ly"]
            attrs["primary_accuracy"] = primary["accuracy_str"]
            attrs["primary_data_quality"] = primary["data_quality"]
            if self._show_motion:
                attrs["primary_motion"] = primary["motion"]
                attrs["primary_rv_km_s"] = primary["radial_velocity_km_s"]
        
        stars, pulsars = {}, {}
        for oid, data in self._object_distances.items():
            entry = {
                "name": data["name"], 
                "distance_ly": data["distance_ly"], 
                "distance_au": data["distance_au"],
                "motion": data["motion"], 
                "rv_km_s": data["radial_velocity_km_s"], 
                "note": data.get("note", ""),
                # Uncertainty data
                "uncertainty_percent": data["uncertainty_percent"],
                "uncertainty_ly": data["uncertainty_ly"],
                "distance_range_ly": data["distance_range_ly"],
                "accuracy": data["accuracy_str"],
                "parallax_mas": data["parallax_mas"],
                "parallax_error_mas": data["parallax_error_mas"]
            }
            if data["category"] == "star": 
                stars[oid] = entry
            elif data["category"] == "pulsar":
                entry["period_ms"] = data.get("period_ms", 0)
                pulsars[oid] = entry
        
        if self._show_stars and stars: 
            attrs["stars"] = stars
            attrs["star_count"] = len(stars)
        if self._show_pulsars and pulsars: 
            attrs["pulsars"] = pulsars
            attrs["pulsar_count"] = len(pulsars)
        attrs["total_objects"] = len(self._object_distances)
        
        # Summary of measurement quality
        all_uncertainties = [d["uncertainty_percent"] for d in self._object_distances.values()]
        if all_uncertainties:
            attrs["best_measured"] = min(all_uncertainties)
            attrs["worst_measured"] = max(all_uncertainties)
            attrs["average_uncertainty"] = round(sum(all_uncertainties) / len(all_uncertainties), 2)
        
        return attrs
