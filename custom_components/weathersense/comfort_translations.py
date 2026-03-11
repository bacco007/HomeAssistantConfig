"""
Localized comfort descriptions and explanations for HA WeatherSense.

@license: CC BY-NC-SA 4.0 International
@author: SMKRV
@github: https://github.com/smkrv/ha-weathersense
@source: https://github.com/smkrv/ha-weathersense
"""
from .const import (
    COMFORT_EXTREME_COLD, COMFORT_VERY_COLD, COMFORT_COLD,
    COMFORT_COOL, COMFORT_SLIGHTLY_COOL, COMFORT_COMFORTABLE,
    COMFORT_SLIGHTLY_WARM, COMFORT_WARM, COMFORT_HOT,
    COMFORT_VERY_HOT, COMFORT_EXTREME_HOT,
)

COMFORT_DESCRIPTIONS_I18N = {
    "en": {
        COMFORT_EXTREME_COLD: "Extreme Cold Stress",
        COMFORT_VERY_COLD: "Very Strong Cold Stress",
        COMFORT_COLD: "Strong Cold Stress",
        COMFORT_COOL: "Moderate Cold Stress",
        COMFORT_SLIGHTLY_COOL: "Slight Cold Stress",
        COMFORT_COMFORTABLE: "No Thermal Stress (Comfort)",
        COMFORT_SLIGHTLY_WARM: "Slight Heat Stress",
        COMFORT_WARM: "Moderate Heat Stress",
        COMFORT_HOT: "Strong Heat Stress",
        COMFORT_VERY_HOT: "Very Strong Heat Stress",
        COMFORT_EXTREME_HOT: "Extreme Heat Stress",
    },
    "ru": {
        COMFORT_EXTREME_COLD: "Экстремальный холодовой стресс",
        COMFORT_VERY_COLD: "Очень сильный холодовой стресс",
        COMFORT_COLD: "Сильный холодовой стресс",
        COMFORT_COOL: "Умеренный холодовой стресс",
        COMFORT_SLIGHTLY_COOL: "Лёгкий холодовой стресс",
        COMFORT_COMFORTABLE: "Термический комфорт",
        COMFORT_SLIGHTLY_WARM: "Лёгкий тепловой стресс",
        COMFORT_WARM: "Умеренный тепловой стресс",
        COMFORT_HOT: "Сильный тепловой стресс",
        COMFORT_VERY_HOT: "Очень сильный тепловой стресс",
        COMFORT_EXTREME_HOT: "Экстремальный тепловой стресс",
    },
    "de": {
        COMFORT_EXTREME_COLD: "Extremer Kältestress",
        COMFORT_VERY_COLD: "Sehr starker Kältestress",
        COMFORT_COLD: "Starker Kältestress",
        COMFORT_COOL: "Mäßiger Kältestress",
        COMFORT_SLIGHTLY_COOL: "Leichter Kältestress",
        COMFORT_COMFORTABLE: "Kein thermischer Stress (Komfort)",
        COMFORT_SLIGHTLY_WARM: "Leichter Hitzestress",
        COMFORT_WARM: "Mäßiger Hitzestress",
        COMFORT_HOT: "Starker Hitzestress",
        COMFORT_VERY_HOT: "Sehr starker Hitzestress",
        COMFORT_EXTREME_HOT: "Extremer Hitzestress",
    },
    "es": {
        COMFORT_EXTREME_COLD: "Estrés por frío extremo",
        COMFORT_VERY_COLD: "Estrés por frío muy fuerte",
        COMFORT_COLD: "Estrés por frío fuerte",
        COMFORT_COOL: "Estrés por frío moderado",
        COMFORT_SLIGHTLY_COOL: "Estrés por frío leve",
        COMFORT_COMFORTABLE: "Sin estrés térmico (confort)",
        COMFORT_SLIGHTLY_WARM: "Estrés por calor leve",
        COMFORT_WARM: "Estrés por calor moderado",
        COMFORT_HOT: "Estrés por calor fuerte",
        COMFORT_VERY_HOT: "Estrés por calor muy fuerte",
        COMFORT_EXTREME_HOT: "Estrés por calor extremo",
    },
    "hi": {
        COMFORT_EXTREME_COLD: "अत्यधिक शीत तनाव",
        COMFORT_VERY_COLD: "बहुत तीव्र शीत तनाव",
        COMFORT_COLD: "तीव्र शीत तनाव",
        COMFORT_COOL: "मध्यम शीत तनाव",
        COMFORT_SLIGHTLY_COOL: "हल्का शीत तनाव",
        COMFORT_COMFORTABLE: "कोई तापीय तनाव नहीं (आराम)",
        COMFORT_SLIGHTLY_WARM: "हल्का ऊष्मा तनाव",
        COMFORT_WARM: "मध्यम ऊष्मा तनाव",
        COMFORT_HOT: "तीव्र ऊष्मा तनाव",
        COMFORT_VERY_HOT: "बहुत तीव्र ऊष्मा तनाव",
        COMFORT_EXTREME_HOT: "अत्यधिक ऊष्मा तनाव",
    },
    "zh-CN": {
        COMFORT_EXTREME_COLD: "极端寒冷压力",
        COMFORT_VERY_COLD: "非常强烈的寒冷压力",
        COMFORT_COLD: "强烈寒冷压力",
        COMFORT_COOL: "中等寒冷压力",
        COMFORT_SLIGHTLY_COOL: "轻微寒冷压力",
        COMFORT_COMFORTABLE: "无热应力（舒适）",
        COMFORT_SLIGHTLY_WARM: "轻微热应力",
        COMFORT_WARM: "中等热应力",
        COMFORT_HOT: "强烈热应力",
        COMFORT_VERY_HOT: "非常强烈的热应力",
        COMFORT_EXTREME_HOT: "极端热应力",
    },
    "cs": {
        COMFORT_EXTREME_COLD: "Extrémní chladový stres",
        COMFORT_VERY_COLD: "Velmi silný chladový stres",
        COMFORT_COLD: "Silný chladový stres",
        COMFORT_COOL: "Mírný chladový stres",
        COMFORT_SLIGHTLY_COOL: "Lehký chladový stres",
        COMFORT_COMFORTABLE: "Žádný tepelný stres (komfort)",
        COMFORT_SLIGHTLY_WARM: "Lehký tepelný stres",
        COMFORT_WARM: "Mírný tepelný stres",
        COMFORT_HOT: "Silný tepelný stres",
        COMFORT_VERY_HOT: "Velmi silný tepelný stres",
        COMFORT_EXTREME_HOT: "Extrémní tepelný stres",
    },
}

COMFORT_EXPLANATIONS_I18N = {
    "en": {
        COMFORT_EXTREME_COLD: "Extreme risk: frostbite possible in less than 5 minutes",
        COMFORT_VERY_COLD: "High risk: frostbite possible in 5-10 minutes",
        COMFORT_COLD: "Warning: frostbite possible in 10-30 minutes",
        COMFORT_COOL: "Caution: prolonged exposure may cause discomfort",
        COMFORT_SLIGHTLY_COOL: "Slightly cool: light discomfort for sensitive individuals",
        COMFORT_COMFORTABLE: "Optimal thermal conditions: most people feel comfortable",
        COMFORT_SLIGHTLY_WARM: "Slightly warm: light discomfort for sensitive individuals",
        COMFORT_WARM: "Caution: fatigue possible with prolonged exposure",
        COMFORT_HOT: "Extreme caution: heat exhaustion possible",
        COMFORT_VERY_HOT: "Danger: heat cramps and exhaustion likely",
        COMFORT_EXTREME_HOT: "Extreme danger: heat stroke imminent",
    },
    "ru": {
        COMFORT_EXTREME_COLD: "Крайняя опасность: обморожение возможно менее чем за 5 минут",
        COMFORT_VERY_COLD: "Высокий риск: обморожение возможно за 5–10 минут",
        COMFORT_COLD: "Предупреждение: обморожение возможно за 10–30 минут",
        COMFORT_COOL: "Осторожность: длительное пребывание может вызвать дискомфорт",
        COMFORT_SLIGHTLY_COOL: "Слегка прохладно: лёгкий дискомфорт для чувствительных людей",
        COMFORT_COMFORTABLE: "Оптимальные условия: большинство людей чувствуют себя комфортно",
        COMFORT_SLIGHTLY_WARM: "Слегка тепло: лёгкий дискомфорт для чувствительных людей",
        COMFORT_WARM: "Осторожность: возможна усталость при длительном пребывании",
        COMFORT_HOT: "Повышенная осторожность: возможен тепловой удар",
        COMFORT_VERY_HOT: "Опасность: вероятны тепловые судороги и истощение",
        COMFORT_EXTREME_HOT: "Крайняя опасность: тепловой удар неизбежен",
    },
    "de": {
        COMFORT_EXTREME_COLD: "Extremes Risiko: Erfrierungen in weniger als 5 Minuten möglich",
        COMFORT_VERY_COLD: "Hohes Risiko: Erfrierungen in 5–10 Minuten möglich",
        COMFORT_COLD: "Warnung: Erfrierungen in 10–30 Minuten möglich",
        COMFORT_COOL: "Vorsicht: Längerer Aufenthalt kann Unbehagen verursachen",
        COMFORT_SLIGHTLY_COOL: "Leicht kühl: leichtes Unbehagen für empfindliche Personen",
        COMFORT_COMFORTABLE: "Optimale Bedingungen: die meisten Menschen fühlen sich wohl",
        COMFORT_SLIGHTLY_WARM: "Leicht warm: leichtes Unbehagen für empfindliche Personen",
        COMFORT_WARM: "Vorsicht: Ermüdung bei längerem Aufenthalt möglich",
        COMFORT_HOT: "Erhöhte Vorsicht: Hitzeerschöpfung möglich",
        COMFORT_VERY_HOT: "Gefahr: Hitzekrämpfe und Erschöpfung wahrscheinlich",
        COMFORT_EXTREME_HOT: "Extreme Gefahr: Hitzschlag droht",
    },
    "es": {
        COMFORT_EXTREME_COLD: "Riesgo extremo: congelación posible en menos de 5 minutos",
        COMFORT_VERY_COLD: "Riesgo alto: congelación posible en 5–10 minutos",
        COMFORT_COLD: "Advertencia: congelación posible en 10–30 minutos",
        COMFORT_COOL: "Precaución: la exposición prolongada puede causar malestar",
        COMFORT_SLIGHTLY_COOL: "Ligeramente fresco: malestar leve para personas sensibles",
        COMFORT_COMFORTABLE: "Condiciones óptimas: la mayoría se siente cómoda",
        COMFORT_SLIGHTLY_WARM: "Ligeramente cálido: malestar leve para personas sensibles",
        COMFORT_WARM: "Precaución: fatiga posible con exposición prolongada",
        COMFORT_HOT: "Precaución extrema: posible agotamiento por calor",
        COMFORT_VERY_HOT: "Peligro: calambres y agotamiento por calor probables",
        COMFORT_EXTREME_HOT: "Peligro extremo: golpe de calor inminente",
    },
    "hi": {
        COMFORT_EXTREME_COLD: "अत्यधिक जोखिम: 5 मिनट से कम में शीतदंश संभव",
        COMFORT_VERY_COLD: "उच्च जोखिम: 5–10 मिनट में शीतदंश संभव",
        COMFORT_COLD: "चेतावनी: 10–30 मिनट में शीतदंश संभव",
        COMFORT_COOL: "सावधानी: लंबे समय तक रहने से असुविधा हो सकती है",
        COMFORT_SLIGHTLY_COOL: "थोड़ा ठंडा: संवेदनशील व्यक्तियों के लिए हल्की असुविधा",
        COMFORT_COMFORTABLE: "इष्टतम स्थिति: अधिकांश लोग सहज महसूस करते हैं",
        COMFORT_SLIGHTLY_WARM: "थोड़ा गर्म: संवेदनशील व्यक्तियों के लिए हल्की असुविधा",
        COMFORT_WARM: "सावधानी: लंबे समय तक रहने से थकान संभव",
        COMFORT_HOT: "अत्यधिक सावधानी: गर्मी से थकावट संभव",
        COMFORT_VERY_HOT: "खतरा: गर्मी से ऐंठन और थकावट की संभावना",
        COMFORT_EXTREME_HOT: "अत्यधिक खतरा: लू लगना अवश्यंभावी",
    },
    "zh-CN": {
        COMFORT_EXTREME_COLD: "极端风险：5分钟内可能冻伤",
        COMFORT_VERY_COLD: "高风险：5–10分钟内可能冻伤",
        COMFORT_COLD: "警告：10–30分钟内可能冻伤",
        COMFORT_COOL: "注意：长时间暴露可能引起不适",
        COMFORT_SLIGHTLY_COOL: "稍凉：敏感人群可能轻微不适",
        COMFORT_COMFORTABLE: "最佳热舒适条件：大多数人感觉舒适",
        COMFORT_SLIGHTLY_WARM: "稍暖：敏感人群可能轻微不适",
        COMFORT_WARM: "注意：长时间暴露可能导致疲劳",
        COMFORT_HOT: "高度注意：可能中暑",
        COMFORT_VERY_HOT: "危险：很可能出现热痉挛和热衰竭",
        COMFORT_EXTREME_HOT: "极端危险：热射病即将发生",
    },
    "cs": {
        COMFORT_EXTREME_COLD: "Extrémní riziko: omrzliny možné za méně než 5 minut",
        COMFORT_VERY_COLD: "Vysoké riziko: omrzliny možné za 5–10 minut",
        COMFORT_COLD: "Varování: omrzliny možné za 10–30 minut",
        COMFORT_COOL: "Opatrnost: delší pobyt může způsobit nepohodlí",
        COMFORT_SLIGHTLY_COOL: "Mírně chladné: lehké nepohodlí pro citlivé osoby",
        COMFORT_COMFORTABLE: "Optimální podmínky: většina lidí se cítí příjemně",
        COMFORT_SLIGHTLY_WARM: "Mírně teplé: lehké nepohodlí pro citlivé osoby",
        COMFORT_WARM: "Opatrnost: únava možná při delším pobytu",
        COMFORT_HOT: "Zvýšená opatrnost: možné vyčerpání z horka",
        COMFORT_VERY_HOT: "Nebezpečí: pravděpodobné křeče a vyčerpání z horka",
        COMFORT_EXTREME_HOT: "Extrémní nebezpečí: hrozí úpal",
    },
}


COMFORT_LEVEL_I18N = {
    "en": {
        COMFORT_EXTREME_COLD: "Extreme Cold",
        COMFORT_VERY_COLD: "Very Cold",
        COMFORT_COLD: "Cold",
        COMFORT_COOL: "Cool",
        COMFORT_SLIGHTLY_COOL: "Slightly Cool",
        COMFORT_COMFORTABLE: "Comfortable",
        COMFORT_SLIGHTLY_WARM: "Slightly Warm",
        COMFORT_WARM: "Warm",
        COMFORT_HOT: "Hot",
        COMFORT_VERY_HOT: "Very Hot",
        COMFORT_EXTREME_HOT: "Extreme Hot",
    },
    "ru": {
        COMFORT_EXTREME_COLD: "Экстремальный холод",
        COMFORT_VERY_COLD: "Очень холодно",
        COMFORT_COLD: "Холодно",
        COMFORT_COOL: "Прохладно",
        COMFORT_SLIGHTLY_COOL: "Слегка прохладно",
        COMFORT_COMFORTABLE: "Комфортно",
        COMFORT_SLIGHTLY_WARM: "Слегка тепло",
        COMFORT_WARM: "Тепло",
        COMFORT_HOT: "Жарко",
        COMFORT_VERY_HOT: "Очень жарко",
        COMFORT_EXTREME_HOT: "Экстремальная жара",
    },
    "de": {
        COMFORT_EXTREME_COLD: "Extrem kalt",
        COMFORT_VERY_COLD: "Sehr kalt",
        COMFORT_COLD: "Kalt",
        COMFORT_COOL: "Kühl",
        COMFORT_SLIGHTLY_COOL: "Leicht kühl",
        COMFORT_COMFORTABLE: "Komfortabel",
        COMFORT_SLIGHTLY_WARM: "Leicht warm",
        COMFORT_WARM: "Warm",
        COMFORT_HOT: "Heiß",
        COMFORT_VERY_HOT: "Sehr heiß",
        COMFORT_EXTREME_HOT: "Extrem heiß",
    },
    "es": {
        COMFORT_EXTREME_COLD: "Frío extremo",
        COMFORT_VERY_COLD: "Mucho frío",
        COMFORT_COLD: "Frío",
        COMFORT_COOL: "Fresco",
        COMFORT_SLIGHTLY_COOL: "Ligeramente fresco",
        COMFORT_COMFORTABLE: "Confortable",
        COMFORT_SLIGHTLY_WARM: "Ligeramente cálido",
        COMFORT_WARM: "Cálido",
        COMFORT_HOT: "Caluroso",
        COMFORT_VERY_HOT: "Muy caluroso",
        COMFORT_EXTREME_HOT: "Calor extremo",
    },
    "hi": {
        COMFORT_EXTREME_COLD: "अत्यधिक ठंड",
        COMFORT_VERY_COLD: "बहुत ठंड",
        COMFORT_COLD: "ठंड",
        COMFORT_COOL: "शीतल",
        COMFORT_SLIGHTLY_COOL: "थोड़ा ठंडा",
        COMFORT_COMFORTABLE: "आरामदायक",
        COMFORT_SLIGHTLY_WARM: "थोड़ा गर्म",
        COMFORT_WARM: "गर्म",
        COMFORT_HOT: "तपन",
        COMFORT_VERY_HOT: "बहुत गर्म",
        COMFORT_EXTREME_HOT: "अत्यधिक गर्मी",
    },
    "zh-CN": {
        COMFORT_EXTREME_COLD: "极端寒冷",
        COMFORT_VERY_COLD: "非常寒冷",
        COMFORT_COLD: "寒冷",
        COMFORT_COOL: "凉爽",
        COMFORT_SLIGHTLY_COOL: "微凉",
        COMFORT_COMFORTABLE: "舒适",
        COMFORT_SLIGHTLY_WARM: "微暖",
        COMFORT_WARM: "温暖",
        COMFORT_HOT: "炎热",
        COMFORT_VERY_HOT: "非常炎热",
        COMFORT_EXTREME_HOT: "极端炎热",
    },
    "cs": {
        COMFORT_EXTREME_COLD: "Extrémní zima",
        COMFORT_VERY_COLD: "Velmi chladno",
        COMFORT_COLD: "Chladno",
        COMFORT_COOL: "Svěže",
        COMFORT_SLIGHTLY_COOL: "Mírně chladné",
        COMFORT_COMFORTABLE: "Příjemně",
        COMFORT_SLIGHTLY_WARM: "Mírně teplo",
        COMFORT_WARM: "Teplo",
        COMFORT_HOT: "Horko",
        COMFORT_VERY_HOT: "Velmi horko",
        COMFORT_EXTREME_HOT: "Extrémní horko",
    },
}

CALCULATION_METHOD_I18N = {
    "en": {
        "Heat Index": "Heat Index",
        "Wind Chill": "Wind Chill",
        "Steadman Apparent Temperature": "Steadman Apparent Temperature",
        "Indoor Comfort Model": "Indoor Comfort Model",
    },
    "ru": {
        "Heat Index": "Индекс жары",
        "Wind Chill": "Охлаждение ветром",
        "Steadman Apparent Temperature": "Кажущаяся температура по Стедману",
        "Indoor Comfort Model": "Модель комфорта в помещении",
    },
    "de": {
        "Heat Index": "Hitzeindex",
        "Wind Chill": "Windkühle",
        "Steadman Apparent Temperature": "Gefühlte Temperatur nach Steadman",
        "Indoor Comfort Model": "Innenraum-Komfortmodell",
    },
    "es": {
        "Heat Index": "Índice de calor",
        "Wind Chill": "Sensación térmica por viento",
        "Steadman Apparent Temperature": "Temperatura aparente de Steadman",
        "Indoor Comfort Model": "Modelo de confort interior",
    },
    "hi": {
        "Heat Index": "ताप सूचकांक",
        "Wind Chill": "पवन शीतलता",
        "Steadman Apparent Temperature": "स्टेडमैन अनुभूत तापमान",
        "Indoor Comfort Model": "इनडोर आराम मॉडल",
    },
    "zh-CN": {
        "Heat Index": "酷热指数",
        "Wind Chill": "风寒指数",
        "Steadman Apparent Temperature": "斯特德曼体感温度",
        "Indoor Comfort Model": "室内舒适模型",
    },
    "cs": {
        "Heat Index": "Index horka",
        "Wind Chill": "Pocitový chlad",
        "Steadman Apparent Temperature": "Zdánlivá teplota dle Steadmana",
        "Indoor Comfort Model": "Model vnitřního komfortu",
    },
}


def _normalize_lang(language: str) -> str:
    """Normalize language code: zh_Hans → zh-CN, en_US → en, cs → cs."""
    lang = language.replace("_", "-")
    # Try exact match first, then base language
    for source in (COMFORT_DESCRIPTIONS_I18N,):
        if lang in source:
            return lang
        base = lang.split("-")[0]
        if base in source:
            return base
        # Case-insensitive fallback
        for key in source:
            if key.lower() == lang.lower():
                return key
    return lang


def get_comfort_level(comfort_level: str, language: str) -> str:
    """Get localized comfort level name, falling back to English."""
    lang = _normalize_lang(language)
    levels = COMFORT_LEVEL_I18N.get(lang, COMFORT_LEVEL_I18N["en"])
    return levels.get(comfort_level, comfort_level)


def get_comfort_description(comfort_level: str, language: str) -> str:
    """Get localized comfort description, falling back to English."""
    lang = _normalize_lang(language)
    descriptions = COMFORT_DESCRIPTIONS_I18N.get(lang, COMFORT_DESCRIPTIONS_I18N["en"])
    return descriptions.get(comfort_level, "")


def get_comfort_explanation(comfort_level: str, language: str) -> str:
    """Get localized comfort explanation, falling back to English."""
    lang = _normalize_lang(language)
    explanations = COMFORT_EXPLANATIONS_I18N.get(lang, COMFORT_EXPLANATIONS_I18N["en"])
    return explanations.get(comfort_level, "")


def get_calculation_method(method: str, language: str) -> str:
    """Get localized calculation method name, falling back to English."""
    lang = _normalize_lang(language)
    methods = CALCULATION_METHOD_I18N.get(lang, CALCULATION_METHOD_I18N["en"])
    return methods.get(method, method)
