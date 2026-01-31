"""Ge'ez (Ethiopian) Calendar implementation - Version 1.0."""
from __future__ import annotations

from datetime import datetime
import logging
import math
from typing import Dict, Any

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
    "id": "geez",
    "version": "1.0.0",
    "icon": "mdi:cross-outline",
    "category": "religious",
    "accuracy": "day",
    "update_interval": UPDATE_INTERVAL,
    
    # Multi-language names
    "name": {
        "en": "Ge'ez (Ethiopian) Calendar",
        "de": "Ge'ez (Äthiopischer) Kalender",
        "es": "Calendario Ge'ez (Etíope)",
        "fr": "Calendrier Guèze (Éthiopien)",
        "it": "Calendario Ge'ez (Etiope)",
        "nl": "Ge'ez (Ethiopische) Kalender",
        "pl": "Kalendarz Ge'ez (Etiopski)",
        "pt": "Calendário Ge'ez (Etíope)",
        "ru": "Календарь Геэз (Эфиопский)",
        "ja": "ゲエズ暦（エチオピア暦）",
        "zh": "吉兹历（埃塞俄比亚历）",
        "ko": "그으즈력 (에티오피아력)",
        "am": "የኢትዮጵያ ቀን መቁጠሪያ",
        "ti": "ናይ ኢትዮጵያ መቑጸሪ ዕለት"
    },
    
    # Short descriptions for UI
    "description": {
        "en": "Traditional Ethiopian calendar with 13 months, used in Ethiopia and Eritrea",
        "de": "Traditioneller äthiopischer Kalender mit 13 Monaten, in Äthiopien und Eritrea verwendet",
        "es": "Calendario tradicional etíope con 13 meses, usado en Etiopía y Eritrea",
        "fr": "Calendrier traditionnel éthiopien avec 13 mois, utilisé en Éthiopie et en Érythrée",
        "it": "Calendario tradizionale etiope con 13 mesi, usato in Etiopia ed Eritrea",
        "nl": "Traditionele Ethiopische kalender met 13 maanden, gebruikt in Ethiopië en Eritrea",
        "pl": "Tradycyjny kalendarz etiopski z 13 miesiącami, używany w Etiopii i Erytrei",
        "pt": "Calendário tradicional etíope com 13 meses, usado na Etiópia e Eritreia",
        "ru": "Традиционный эфиопский календарь с 13 месяцами, используемый в Эфиопии и Эритрее",
        "ja": "エチオピアとエリトリアで使用される13ヶ月の伝統的なエチオピア暦",
        "zh": "埃塞俄比亚和厄立特里亚使用的传统埃塞俄比亚历法，有13个月",
        "ko": "에티오피아와 에리트레아에서 사용되는 13개월의 전통적인 에티오피아 달력",
        "am": "በኢትዮጵያ እና በኤርትራ የሚጠቀሙት 13 ወሮች ያሉት ባህላዊ የኢትዮጵያ ቀን መቁጠሪያ",
        "ti": "ኣብ ኢትዮጵያን ኤርትራን ዝጥቀሙሉ 13 ኣዋርሕ ዘለዎ ባህላዊ መቑጸሪ ዕለት"
    },
    
    # Detailed information for documentation
    "detailed_info": {
        "en": {
            "overview": "The Ge'ez (Ethiopian) calendar is a solar calendar used as the principal calendar in Ethiopia and Eritrea. It is based on the older Coptic calendar.",
            "epoch": "Epoch = 1 Maskaram, Year 1 (August 29, 8 CE Julian / September 11, 8 CE Gregorian proleptic).",
            "structure": "The calendar has 12 months of 30 days each, plus a 13th month (Pagume) with 5 days (6 in leap years).",
            "leap_years": "Leap years occur every 4 years without exception, preceding the Julian leap year by about 6 months.",
            "new_year": "The Ethiopian New Year (Enkutatash) falls on September 11 (or September 12 in a Gregorian leap year).",
            "offset": "The Ethiopian calendar is approximately 7-8 years behind the Gregorian calendar.",
            "note": "This calendar is used for religious and civil purposes in Ethiopia and by the Ethiopian Orthodox Tewahedo Church."
        },
        "de": {
            "overview": "Der Ge'ez (äthiopische) Kalender ist ein Sonnenkalender, der als Hauptkalender in Äthiopien und Eritrea verwendet wird. Er basiert auf dem älteren koptischen Kalender.",
            "epoch": "Epoche = 1. Maskaram, Jahr 1 (29. August 8 n. Chr. julianisch / 11. September 8 n. Chr. gregorianisch proleptisch).",
            "structure": "Der Kalender hat 12 Monate mit je 30 Tagen plus einen 13. Monat (Pagume) mit 5 Tagen (6 in Schaltjahren).",
            "leap_years": "Schaltjahre treten alle 4 Jahre ohne Ausnahme auf, etwa 6 Monate vor dem julianischen Schaltjahr.",
            "new_year": "Das äthiopische Neujahr (Enkutatash) fällt auf den 11. September (oder 12. September in einem gregorianischen Schaltjahr).",
            "offset": "Der äthiopische Kalender liegt etwa 7-8 Jahre hinter dem gregorianischen Kalender.",
            "note": "Dieser Kalender wird für religiöse und zivile Zwecke in Äthiopien und von der Äthiopisch-Orthodoxen Tewahedo-Kirche verwendet."
        },
        "es": {
            "overview": "El calendario Ge'ez (etíope) es un calendario solar utilizado como calendario principal en Etiopía y Eritrea. Se basa en el antiguo calendario copto.",
            "epoch": "Época = 1 Maskaram, Año 1 (29 de agosto de 8 d.C. juliano / 11 de septiembre de 8 d.C. gregoriano proléptico).",
            "structure": "El calendario tiene 12 meses de 30 días cada uno, más un 13º mes (Pagume) con 5 días (6 en años bisiestos).",
            "leap_years": "Los años bisiestos ocurren cada 4 años sin excepción, precediendo al año bisiesto juliano por unos 6 meses.",
            "new_year": "El Año Nuevo etíope (Enkutatash) cae el 11 de septiembre (o el 12 de septiembre en un año bisiesto gregoriano).",
            "offset": "El calendario etíope está aproximadamente 7-8 años detrás del calendario gregoriano.",
            "note": "Este calendario se usa para fines religiosos y civiles en Etiopía y por la Iglesia Ortodoxa Etíope Tewahedo."
        },
        "fr": {
            "overview": "Le calendrier Guèze (éthiopien) est un calendrier solaire utilisé comme calendrier principal en Éthiopie et en Érythrée. Il est basé sur l'ancien calendrier copte.",
            "epoch": "Époque = 1er Maskaram, An 1 (29 août 8 apr. J.-C. julien / 11 septembre 8 apr. J.-C. grégorien proleptique).",
            "structure": "Le calendrier compte 12 mois de 30 jours chacun, plus un 13e mois (Pagume) de 5 jours (6 les années bissextiles).",
            "leap_years": "Les années bissextiles surviennent tous les 4 ans sans exception, précédant l'année bissextile julienne d'environ 6 mois.",
            "new_year": "Le Nouvel An éthiopien (Enkutatash) tombe le 11 septembre (ou le 12 septembre lors d'une année bissextile grégorienne).",
            "offset": "Le calendrier éthiopien est environ 7-8 ans en retard sur le calendrier grégorien.",
            "note": "Ce calendrier est utilisé à des fins religieuses et civiles en Éthiopie et par l'Église orthodoxe éthiopienne Tewahedo."
        },
        "it": {
            "overview": "Il calendario Ge'ez (etiope) è un calendario solare utilizzato come calendario principale in Etiopia ed Eritrea. Si basa sull'antico calendario copto.",
            "epoch": "Epoca = 1° Maskaram, Anno 1 (29 agosto 8 d.C. giuliano / 11 settembre 8 d.C. gregoriano prolettico).",
            "structure": "Il calendario ha 12 mesi di 30 giorni ciascuno, più un 13° mese (Pagume) di 5 giorni (6 negli anni bisestili).",
            "leap_years": "Gli anni bisestili si verificano ogni 4 anni senza eccezione, precedendo l'anno bisestile giuliano di circa 6 mesi.",
            "new_year": "Il Capodanno etiope (Enkutatash) cade l'11 settembre (o il 12 settembre in un anno bisestile gregoriano).",
            "offset": "Il calendario etiope è circa 7-8 anni indietro rispetto al calendario gregoriano.",
            "note": "Questo calendario è usato per scopi religiosi e civili in Etiopia e dalla Chiesa Ortodossa Etiope Tewahedo."
        },
        "nl": {
            "overview": "De Ge'ez (Ethiopische) kalender is een zonnekalender die als hoofdkalender wordt gebruikt in Ethiopië en Eritrea. Hij is gebaseerd op de oudere Koptische kalender.",
            "epoch": "Tijdperk = 1 Maskaram, Jaar 1 (29 augustus 8 n.Chr. Juliaans / 11 september 8 n.Chr. Gregoriaans proleptisch).",
            "structure": "De kalender heeft 12 maanden van elk 30 dagen, plus een 13e maand (Pagume) met 5 dagen (6 in schrikkeljaren).",
            "leap_years": "Schrikkeljaren vinden elke 4 jaar plaats zonder uitzondering, ongeveer 6 maanden vóór het Juliaanse schrikkeljaar.",
            "new_year": "Het Ethiopische Nieuwjaar (Enkutatash) valt op 11 september (of 12 september in een Gregoriaans schrikkeljaar).",
            "offset": "De Ethiopische kalender loopt ongeveer 7-8 jaar achter op de Gregoriaanse kalender.",
            "note": "Deze kalender wordt gebruikt voor religieuze en civiele doeleinden in Ethiopië en door de Ethiopisch-Orthodoxe Tewahedo Kerk."
        },
        "pl": {
            "overview": "Kalendarz Ge'ez (etiopski) to kalendarz słoneczny używany jako główny kalendarz w Etiopii i Erytrei. Opiera się na starszym kalendarzu koptyjskim.",
            "epoch": "Epoka = 1 Maskaram, Rok 1 (29 sierpnia 8 r. n.e. juliański / 11 września 8 r. n.e. gregoriański proleptyczny).",
            "structure": "Kalendarz ma 12 miesięcy po 30 dni każdy, plus 13. miesiąc (Pagume) z 5 dniami (6 w latach przestępnych).",
            "leap_years": "Lata przestępne występują co 4 lata bez wyjątku, wyprzedzając juliański rok przestępny o około 6 miesięcy.",
            "new_year": "Etiopski Nowy Rok (Enkutatash) przypada 11 września (lub 12 września w gregoriańskim roku przestępnym).",
            "offset": "Kalendarz etiopski jest około 7-8 lat za kalendarzem gregoriańskim.",
            "note": "Ten kalendarz jest używany do celów religijnych i cywilnych w Etiopii oraz przez Etiopski Kościół Ortodoksyjny Tewahedo."
        },
        "pt": {
            "overview": "O calendário Ge'ez (etíope) é um calendário solar usado como calendário principal na Etiópia e Eritreia. É baseado no antigo calendário copta.",
            "epoch": "Época = 1 Maskaram, Ano 1 (29 de agosto de 8 d.C. juliano / 11 de setembro de 8 d.C. gregoriano proléptico).",
            "structure": "O calendário tem 12 meses de 30 dias cada, mais um 13º mês (Pagume) com 5 dias (6 em anos bissextos).",
            "leap_years": "Anos bissextos ocorrem a cada 4 anos sem exceção, precedendo o ano bissexto juliano em cerca de 6 meses.",
            "new_year": "O Ano Novo etíope (Enkutatash) cai em 11 de setembro (ou 12 de setembro em um ano bissexto gregoriano).",
            "offset": "O calendário etíope está aproximadamente 7-8 anos atrás do calendário gregoriano.",
            "note": "Este calendário é usado para fins religiosos e civis na Etiópia e pela Igreja Ortodoxa Etíope Tewahedo."
        },
        "ru": {
            "overview": "Календарь геэз (эфиопский) — это солнечный календарь, используемый в качестве основного календаря в Эфиопии и Эритрее. Он основан на древнем коптском календаре.",
            "epoch": "Эпоха = 1 Маскарама, Год 1 (29 августа 8 г. н.э. по юлианскому / 11 сентября 8 г. н.э. по пролептическому григорианскому календарю).",
            "structure": "Календарь имеет 12 месяцев по 30 дней каждый, плюс 13-й месяц (Пагуме) с 5 днями (6 в високосные годы).",
            "leap_years": "Високосные годы наступают каждые 4 года без исключения, опережая юлианский високосный год примерно на 6 месяцев.",
            "new_year": "Эфиопский Новый год (Энкутаташ) приходится на 11 сентября (или 12 сентября в григорианский високосный год).",
            "offset": "Эфиопский календарь отстаёт от григорианского примерно на 7-8 лет.",
            "note": "Этот календарь используется в религиозных и гражданских целях в Эфиопии и Эфиопской православной церковью Тевахедо."
        },
        "ja": {
            "overview": "ゲエズ暦（エチオピア暦）は、エチオピアとエリトリアで主要暦として使用される太陽暦です。古いコプト暦に基づいています。",
            "epoch": "紀元 = マスカラム1日、1年（ユリウス暦紀元8年8月29日 / 先発グレゴリオ暦紀元8年9月11日）。",
            "structure": "この暦には各30日の12ヶ月と、5日（閏年は6日）の13番目の月（パグメ）があります。",
            "leap_years": "閏年は例外なく4年ごとに発生し、ユリウス暦の閏年より約6ヶ月早くなります。",
            "new_year": "エチオピアの新年（エンクタタシュ）は9月11日（グレゴリオ暦の閏年は9月12日）に当たります。",
            "offset": "エチオピア暦はグレゴリオ暦より約7〜8年遅れています。",
            "note": "この暦はエチオピアで宗教的・市民的目的で使用され、エチオピア正教会テワヒド教会でも使用されています。"
        },
        "zh": {
            "overview": "吉兹历（埃塞俄比亚历）是一种太阳历，是埃塞俄比亚和厄立特里亚的主要历法。它基于更古老的科普特历。",
            "epoch": "纪元 = 马斯卡拉姆1日，第1年（儒略历公元8年8月29日 / 前推格里高利历公元8年9月11日）。",
            "structure": "该历法有12个月，每月30天，外加第13个月（帕古梅），有5天（闰年6天）。",
            "leap_years": "闰年每4年发生一次，没有例外，比儒略历闰年早约6个月。",
            "new_year": "埃塞俄比亚新年（恩库塔塔什）在9月11日（格里高利历闰年为9月12日）。",
            "offset": "埃塞俄比亚历比格里高利历晚约7-8年。",
            "note": "这个历法在埃塞俄比亚用于宗教和民事目的，也被埃塞俄比亚正教会特瓦希多教会使用。"
        },
        "ko": {
            "overview": "그으즈력(에티오피아력)은 에티오피아와 에리트레아에서 주요 달력으로 사용되는 태양력입니다. 오래된 콥트력에 기반합니다.",
            "epoch": "기원 = 마스카람 1일, 1년 (율리우스력 기원 8년 8월 29일 / 선행 그레고리력 기원 8년 9월 11일).",
            "structure": "이 달력은 각 30일의 12개월과 5일(윤년에는 6일)의 13번째 달(파구메)이 있습니다.",
            "leap_years": "윤년은 예외 없이 4년마다 발생하며, 율리우스력 윤년보다 약 6개월 앞섭니다.",
            "new_year": "에티오피아 새해(엔쿠타타쉬)는 9월 11일(그레고리력 윤년에는 9월 12일)에 해당합니다.",
            "offset": "에티오피아력은 그레고리력보다 약 7-8년 뒤처집니다.",
            "note": "이 달력은 에티오피아에서 종교적, 시민적 목적으로 사용되며, 에티오피아 정교회 테와히도 교회에서도 사용됩니다."
        },
        "am": {
            "overview": "የኢትዮጵያ ቀን መቁጠሪያ (ግዕዝ) በኢትዮጵያ እና በኤርትራ ዋና ቀን መቁጠሪያ ሆኖ የሚጠቀም የፀሐይ ቀን መቁጠሪያ ነው። በቀድሞው የቅብጥ ቀን መቁጠሪያ ላይ የተመሠረተ ነው።",
            "epoch": "ዘመን = መስከረም 1፣ ዓመት 1 (ጁሊያን 8 ዓ.ም. ነሐሴ 29 / ግሪጎሪያን 8 ዓ.ም. መስከረም 1)።",
            "structure": "ቀን መቁጠሪያው 12 ወሮች እያንዳንዳቸው 30 ቀናት ያሉት፣ እና 13ኛው ወር (ጳጉሜ) 5 ቀናት (በዘመነ ሉቃስ 6 ቀናት) አለው።",
            "leap_years": "ዘመነ ሉቃስ በየ4 ዓመቱ ያለ ምንም ልዩነት ይከሰታል።",
            "new_year": "የኢትዮጵያ አዲስ ዓመት (እንቁጣጣሽ) መስከረም 1 (ግሪጎሪያን ሴፕቴምበር 11 ወይም 12) ይውላል።",
            "offset": "የኢትዮጵያ ቀን መቁጠሪያ ከግሪጎሪያን ቀን መቁጠሪያ በ7-8 ዓመታት ገደማ ወደኋላ ነው።",
            "note": "ይህ ቀን መቁጠሪያ በኢትዮጵያ ለሃይማኖታዊ እና ለሲቪል ዓላማዎች ይጠቅማል እንዲሁም በኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተ ክርስቲያን ይጠቀማል።"
        },
        "ti": {
            "overview": "ናይ ኢትዮጵያ መቑጸሪ ዕለት (ግእዝ) ኣብ ኢትዮጵያን ኤርትራን ከም ቀንዲ መቑጸሪ ዕለት ዝጥቀሙሉ ናይ ጸሓይ መቑጸሪ ዕለት እዩ። ኣብ ናይ ቀደም ቅብጢ መቑጸሪ ዕለት ዝተመስረተ እዩ።",
            "epoch": "ዘመን = መስከረም 1፣ ዓመት 1 (ጁልያን 8 ዓ.ም. ነሓሰ 29 / ግሪጎርያን 8 ዓ.ም. መስከረም 1)።",
            "structure": "እቲ መቑጸሪ ዕለት 12 ኣዋርሕ ነፍሲ ወከፎም 30 መዓልትታት ዘለዎም፣ ከምኡ'ውን 13ይ ወርሒ (ጳጉሜ) 5 መዓልትታት (ኣብ ዘመነ ሉቃስ 6 መዓልትታት) ኣለዎ።",
            "leap_years": "ዘመነ ሉቃስ ብዘይ ፍሉይ ኵነት ኣብ ነፍሲ ወከፍ 4 ዓመት ይኸውን።",
            "new_year": "ናይ ኢትዮጵያ ሓድሽ ዓመት (እንቁጣጣሽ) መስከረም 1 (ግሪጎርያን ሴፕተምበር 11 ወይ 12) ይወድቕ።",
            "offset": "ናይ ኢትዮጵያ መቑጸሪ ዕለት ካብ ግሪጎርያን መቑጸሪ ዕለት ብኣስታት 7-8 ዓመታት ድሕሪት እዩ።",
            "note": "እዚ መቑጸሪ ዕለት ኣብ ኢትዮጵያ ንሃይማኖታውን ሲቪላውን ዕላማታት ይጥቀሙሉ ከምኡ'ውን ብናይ ኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተ ክርስትያን ይጥቀሙሉ።"
        }
    },
    
    # Ethiopian-specific data
    "ethiopian_data": {
        # Months with Ge'ez, Amharic, English names and typical days
        "months": [
            {"num": 1,  "geez": "መስከረም", "am": "መስከረም", "en": "Mäskäräm", "days": 30},
            {"num": 2,  "geez": "ጥቅምት", "am": "ጥቅምት", "en": "Ṭəqəmt", "days": 30},
            {"num": 3,  "geez": "ኅዳር", "am": "ኅዳር", "en": "Ḫədar", "days": 30},
            {"num": 4,  "geez": "ታኅሣሥ", "am": "ታኅሣሥ", "en": "Taḫśaś", "days": 30},
            {"num": 5,  "geez": "ጥር", "am": "ጥር", "en": "Ṭərr", "days": 30},
            {"num": 6,  "geez": "የካቲት", "am": "የካቲት", "en": "Yäkatit", "days": 30},
            {"num": 7,  "geez": "መጋቢት", "am": "መጋቢት", "en": "Mägabit", "days": 30},
            {"num": 8,  "geez": "ሚያዝያ", "am": "ሚያዝያ", "en": "Miyazya", "days": 30},
            {"num": 9,  "geez": "ግንቦት", "am": "ግንቦት", "en": "Gənbot", "days": 30},
            {"num": 10, "geez": "ሰኔ", "am": "ሰኔ", "en": "Säne", "days": 30},
            {"num": 11, "geez": "ሐምሌ", "am": "ሐምሌ", "en": "Ḥamle", "days": 30},
            {"num": 12, "geez": "ነሐሴ", "am": "ነሐሴ", "en": "Nähase", "days": 30},
            {"num": 13, "geez": "ጳጉሜ", "am": "ጳጉሜ", "en": "Ṗagume", "days": 5}  # 6 in leap years
        ],
        
        # Weekdays (Sunday first to align with HA)
        "weekdays": [
            {"en": "Sunday", "am": "እሑድ", "geez": "እሑድ"},
            {"en": "Monday", "am": "ሰኞ", "geez": "ሰኑይ"},
            {"en": "Tuesday", "am": "ማክሰኞ", "geez": "ሠሉስ"},
            {"en": "Wednesday", "am": "ረቡዕ", "geez": "ረቡዕ"},
            {"en": "Thursday", "am": "ሐሙስ", "geez": "ሐሙስ"},
            {"en": "Friday", "am": "ዓርብ", "geez": "ዓርብ"},
            {"en": "Saturday", "am": "ቅዳሜ", "geez": "ቀዳሚት"}
        ],
        
        # Major Ethiopian holidays and observances
        "events": {
            "(1,1)": {
                "en": "Enkutatash (Ethiopian New Year)",
                "de": "Enkutatash (Äthiopisches Neujahr)",
                "am": "እንቁጣጣሽ"
            },
            "(1,17)": {
                "en": "Meskel (Finding of the True Cross)",
                "de": "Meskel (Kreuzerhöhung)",
                "am": "መስቀል"
            },
            "(4,29)": {
                "en": "Genna (Ethiopian Christmas)",
                "de": "Genna (Äthiopische Weihnachten)",
                "am": "ገና"
            },
            "(5,11)": {
                "en": "Timkat (Epiphany)",
                "de": "Timkat (Epiphanie)",
                "am": "ጥምቀት"
            },
            "(8,23)": {
                "en": "Siklet (Good Friday) - approximate",
                "de": "Siklet (Karfreitag) - ungefähr",
                "am": "ስቅለት"
            },
            "(8,25)": {
                "en": "Fasika (Ethiopian Easter) - approximate",
                "de": "Fasika (Äthiopisches Ostern) - ungefähr",
                "am": "ፋሲካ"
            },
            "(11,1)": {
                "en": "Buhe (Transfiguration)",
                "de": "Buhe (Verklärung)",
                "am": "ቡሄ"
            },
            "(12,16)": {
                "en": "Filseta (Assumption of Mary) - approximate",
                "de": "Filseta (Mariä Himmelfahrt) - ungefähr",
                "am": "ፍልሰታ"
            }
        },
        
        # Julian Day Number of Ethiopian epoch (1 Mäskäräm, Year 1)
        # = August 29, 8 CE Julian = JDN 1724221
        "epoch_jdn": 1724221
    },
    
    # Additional metadata
    "reference_url": "https://en.wikipedia.org/wiki/Ethiopian_calendar",
    "documentation_url": "https://www.ethiocal.com/",
    "origin": "Ancient Ethiopia, derived from Coptic calendar",
    "created_by": "Ethiopian Orthodox Tewahedo Church and Ethiopian civilization",
    
    # Example format
    "example": "15 Mäskäräm 2017 (Ehud)",
    "example_meaning": "15th of Mäskäräm, year 2017, Sunday",
    
    # Related calendars
    "related": ["coptic", "julian", "gregorian"],
    
    # Tags for searching and filtering
    "tags": [
        "religion", "ethiopian", "geez", "orthodox", "christian", "coptic", 
        "africa", "calendar", "solar", "enkutatash", "cultural"
    ],
    
    # Special features
    "features": {
        "solar": True,
        "thirteen_months": True,
        "offset_from_gregorian": True,
        "precision": "day"
    },
    
    # Configuration options for this calendar
    "config_options": {
        "show_geez_names": {
            "type": "boolean",
            "default": True,
            "label": {
                "en": "Show Ge'ez/Amharic names",
                "de": "Ge'ez/Amharische Namen anzeigen",
                "es": "Mostrar nombres en Ge'ez/Amárico",
                "fr": "Afficher les noms Guèze/Amharique",
                "it": "Mostra nomi Ge'ez/Amarico",
                "nl": "Ge'ez/Amhaarse namen tonen",
                "pl": "Pokaż nazwy Ge'ez/Amharskie",
                "pt": "Mostrar nomes Ge'ez/Amárico",
                "ru": "Показывать названия Геэз/Амхарский",
                "ja": "ゲエズ語/アムハラ語名を表示",
                "zh": "显示吉兹语/阿姆哈拉语名称",
                "ko": "그으즈어/암하라어 이름 표시"
            },
            "description": {
                "en": "Show month/weekday names in Ge'ez/Amharic script",
                "de": "Monats-/Wochentagsnamen in Ge'ez/Amharisch anzeigen",
                "es": "Mostrar nombres de meses/días en escritura Ge'ez/Amárico",
                "fr": "Afficher les noms des mois/jours en écriture Guèze/Amharique",
                "it": "Mostra nomi dei mesi/giorni in scrittura Ge'ez/Amarico",
                "nl": "Maand-/weekdagnamen in Ge'ez/Amhaars schrift tonen",
                "pl": "Pokaż nazwy miesięcy/dni tygodnia w piśmie Ge'ez/Amharskim",
                "pt": "Mostrar nomes dos meses/dias em escrita Ge'ez/Amárico",
                "ru": "Показывать названия месяцев/дней недели на письме Геэз/Амхарский",
                "ja": "月/曜日名をゲエズ語/アムハラ語で表示",
                "zh": "用吉兹语/阿姆哈拉语文字显示月份/星期名称",
                "ko": "그으즈어/암하라어 문자로 월/요일 이름 표시"
            }
        },
        "date_format": {
            "type": "select",
            "default": "full",
            "options": [
                {
                    "value": "full",
                    "label": {
                        "en": "Full (15 Mäskäräm 2017)",
                        "de": "Vollständig (15 Mäskäräm 2017)",
                        "es": "Completo (15 Mäskäräm 2017)",
                        "fr": "Complet (15 Mäskäräm 2017)",
                        "it": "Completo (15 Mäskäräm 2017)",
                        "nl": "Volledig (15 Mäskäräm 2017)",
                        "pl": "Pełny (15 Mäskäräm 2017)",
                        "pt": "Completo (15 Mäskäräm 2017)",
                        "ru": "Полный (15 Маскарам 2017)",
                        "ja": "完全 (15 マスカラム 2017)",
                        "zh": "完整 (15 马斯卡拉姆 2017)",
                        "ko": "전체 (15 마스카람 2017)"
                    }
                },
                {
                    "value": "short",
                    "label": {
                        "en": "Short (15/01/2017)",
                        "de": "Kurz (15/01/2017)",
                        "es": "Corto (15/01/2017)",
                        "fr": "Court (15/01/2017)",
                        "it": "Breve (15/01/2017)",
                        "nl": "Kort (15/01/2017)",
                        "pl": "Krótki (15/01/2017)",
                        "pt": "Curto (15/01/2017)",
                        "ru": "Краткий (15/01/2017)",
                        "ja": "短縮 (15/01/2017)",
                        "zh": "简短 (15/01/2017)",
                        "ko": "간략 (15/01/2017)"
                    }
                },
                {
                    "value": "geez_full",
                    "label": {
                        "en": "Ge'ez Full (፲፭ መስከረም ፳፻፲፯)",
                        "de": "Ge'ez Vollständig (፲፭ መስከረም ፳፻፲፯)",
                        "es": "Ge'ez Completo (፲፭ መስከረም ፳፻፲፯)",
                        "fr": "Guèze Complet (፲፭ መስከረም ፳፻፲፯)",
                        "it": "Ge'ez Completo (፲፭ መስከረም ፳፻፲፯)",
                        "nl": "Ge'ez Volledig (፲፭ መስከረም ፳፻፲፯)",
                        "pl": "Ge'ez Pełny (፲፭ መስከረም ፳፻፲፯)",
                        "pt": "Ge'ez Completo (፲፭ መስከረም ፳፻፲፯)",
                        "ru": "Геэз Полный (፲፭ መስከረም ፳፻፲፯)",
                        "ja": "ゲエズ完全 (፲፭ መስከረም ፳፻፲፯)",
                        "zh": "吉兹完整 (፲፭ መስከረም ፳፻፲፯)",
                        "ko": "그으즈 전체 (፲፭ መስከረም ፳፻፲፯)"
                    }
                }
            ],
            "label": {
                "en": "Date format",
                "de": "Datumsformat",
                "es": "Formato de fecha",
                "fr": "Format de date",
                "it": "Formato data",
                "nl": "Datumformaat",
                "pl": "Format daty",
                "pt": "Formato de data",
                "ru": "Формат даты",
                "ja": "日付形式",
                "zh": "日期格式",
                "ko": "날짜 형식"
            },
            "description": {
                "en": "Choose the display format for the Ethiopian date",
                "de": "Wählen Sie das Anzeigeformat für das äthiopische Datum",
                "es": "Elija el formato de visualización para la fecha etíope",
                "fr": "Choisissez le format d'affichage pour la date éthiopienne",
                "it": "Scegli il formato di visualizzazione per la data etiope",
                "nl": "Kies het weergaveformaat voor de Ethiopische datum",
                "pl": "Wybierz format wyświetlania daty etiopskiej",
                "pt": "Escolha o formato de exibição para a data etíope",
                "ru": "Выберите формат отображения эфиопской даты",
                "ja": "エチオピア日付の表示形式を選択",
                "zh": "选择埃塞俄比亚日期的显示格式",
                "ko": "에티오피아 날짜 표시 형식 선택"
            }
        }
    }
}


class GeezCalendarSensor(AlternativeTimeSensorBase):
    """Sensor for displaying the Ge'ez (Ethiopian) calendar."""
    
    # Class-level update interval
    UPDATE_INTERVAL = UPDATE_INTERVAL
    
    def __init__(self, base_name: str, hass: HomeAssistant) -> None:
        """Initialize the Ge'ez calendar sensor."""
        super().__init__(base_name, hass)
        
        # Get translated name from metadata
        calendar_name = self._translate('name', "Ge'ez (Ethiopian) Calendar")
        
        # Set sensor attributes
        self._attr_name = f"{base_name} {calendar_name}"
        self._attr_unique_id = f"{base_name}_geez_calendar"
        self._attr_icon = CALENDAR_INFO.get("icon", "mdi:cross-outline")
        
        # Configuration options (defaults)
        self._show_geez_names = True
        self._date_format = "full"
        
        # Ethiopian data
        self._ethiopian_data = CALENDAR_INFO["ethiopian_data"]
        
        _LOGGER.debug(f"Initialized Ge'ez Calendar sensor: {self._attr_name}")
    
    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state
    
    @property
    def extra_state_attributes(self) -> Dict[str, Any]:
        """Return the state attributes."""
        attrs = super().extra_state_attributes
        
        # Add Ethiopian-specific attributes
        if hasattr(self, '_ethiopian_date'):
            attrs.update(self._ethiopian_date)
            
            # Add description in user's language
            attrs["description"] = self._translate('description')
            
            # Add reference
            attrs["reference"] = CALENDAR_INFO.get('reference_url', '')
            
            # Add epoch info
            attrs["epoch_jdn"] = self._ethiopian_data["epoch_jdn"]
        
        return attrs
    
    # ===============================
    # Helpers: Ethiopian calculations
    # ===============================
    
    @staticmethod
    def _gregorian_to_jdn(y: int, m: int, d: int) -> int:
        """Convert Gregorian date to Julian Day Number (at 00:00)."""
        a = (14 - m) // 12
        y2 = y + 4800 - a
        m2 = m + 12 * a - 3
        jdn = d + ((153 * m2 + 2) // 5) + 365 * y2 + y2 // 4 - y2 // 100 + y2 // 400 - 32045
        return jdn
    
    @staticmethod
    def _is_ethiopian_leap_year(year: int) -> bool:
        """Return True if Ethiopian year is a leap year.
        
        Ethiopian leap years follow a simple 4-year cycle:
        Years 3, 7, 11, 15... (i.e., year % 4 == 3) are leap years.
        """
        return (year % 4) == 3
    
    def _days_in_ethiopian_month(self, year: int, month: int) -> int:
        """Return number of days in the given Ethiopian month."""
        if month < 13:
            return 30
        # Month 13 (Pagume): 5 days normally, 6 in leap years
        return 6 if self._is_ethiopian_leap_year(year) else 5
    
    def _ethiopian_to_jdn(self, year: int, month: int, day: int) -> int:
        """Convert Ethiopian date to Julian Day Number."""
        # Days before this year
        days_in_year = 365
        leap_days = (year - 1) // 4  # One extra day every 4 years
        days_before_year = (year - 1) * 365 + leap_days
        
        # Days before this month (each month has 30 days except Pagume)
        days_before_month = (month - 1) * 30
        
        # Add the day
        return self._ethiopian_data["epoch_jdn"] + days_before_year + days_before_month + day - 1
    
    def _jdn_to_ethiopian(self, jdn: int) -> Dict[str, int]:
        """Convert Julian Day Number to Ethiopian date."""
        # Days since epoch
        days = jdn - self._ethiopian_data["epoch_jdn"]
        
        # Ethiopian year calculation
        # Every 4 years there are 1461 days (3*365 + 366)
        four_year_cycles = days // 1461
        remaining_days = days % 1461
        
        # Years within the 4-year cycle
        if remaining_days < 365:
            year_in_cycle = 0
        elif remaining_days < 730:
            year_in_cycle = 1
            remaining_days -= 365
        elif remaining_days < 1095:
            year_in_cycle = 2
            remaining_days -= 730
        else:
            year_in_cycle = 3
            remaining_days -= 1095
        
        year = four_year_cycles * 4 + year_in_cycle + 1
        
        # Month and day calculation
        if remaining_days < 360:
            # In months 1-12 (30 days each)
            month = remaining_days // 30 + 1
            day = remaining_days % 30 + 1
        else:
            # In Pagume (month 13)
            month = 13
            day = remaining_days - 360 + 1
        
        return {"year": int(year), "month": int(month), "day": int(day)}
    
    def _weekday_from_jdn(self, jdn: int) -> int:
        """Get weekday index from JDN (0 = Sunday, 6 = Saturday)."""
        # JDN 0 was Monday
        # We need 0 = Sunday
        return (jdn + 1) % 7
    
    def _to_geez_numerals(self, num: int) -> str:
        """Convert a number to Ge'ez (Ethiopian) numerals."""
        if num <= 0:
            return str(num)
        
        # Ge'ez numerals
        ones = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱']
        tens = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺']
        
        result = ''
        
        # Handle thousands (simplified for typical year ranges)
        if num >= 10000:
            result += ones[num // 10000] + '፼'  # ፼ = 10000
            num %= 10000
        
        if num >= 1000:
            result += ones[num // 1000] + '፻'  # ፻ = 100, combined for thousands
            num %= 1000
        
        if num >= 100:
            hundreds = num // 100
            if hundreds > 1:
                result += ones[hundreds]
            result += '፻'
            num %= 100
        
        if num >= 10:
            result += tens[num // 10]
            num %= 10
        
        if num > 0:
            result += ones[num]
        
        return result if result else '፩'
    
    # ===============================
    # Core calculation
    # ===============================
    
    def _calculate_ethiopian_date(self, earth_date: datetime) -> Dict[str, Any]:
        """Calculate Ethiopian date from Gregorian date."""
        # Load plugin options
        options = self.get_plugin_options()
        self._show_geez_names = options.get("show_geez_names", True)
        self._date_format = options.get("date_format", "full")
        
        # Convert to JDN
        jdn = self._gregorian_to_jdn(earth_date.year, earth_date.month, earth_date.day)
        
        # Convert to Ethiopian
        ethiopian = self._jdn_to_ethiopian(jdn)
        year, month, day = ethiopian["year"], ethiopian["month"], ethiopian["day"]
        
        # Get month info
        months = self._ethiopian_data["months"]
        month_info = months[month - 1]
        month_name_en = month_info["en"]
        month_name_geez = month_info["geez"]
        month_name_am = month_info["am"]
        
        # Get weekday info
        weekday_index = self._weekday_from_jdn(jdn)
        weekday_info = self._ethiopian_data["weekdays"][weekday_index]
        weekday_en = weekday_info["en"]
        weekday_am = weekday_info["am"]
        weekday_geez = weekday_info["geez"]
        
        # Check for leap year and days in month
        is_leap = self._is_ethiopian_leap_year(year)
        dim = self._days_in_ethiopian_month(year, month)
        
        # Check for events/holidays
        events = self._ethiopian_data["events"]
        event_key = f"({month},{day})"
        event_data = events.get(event_key, {})
        
        # Get event name in user's language
        lang = getattr(self._hass.config, "language", "en")
        if isinstance(event_data, dict):
            event_name = event_data.get(lang, event_data.get("en", ""))
        else:
            event_name = str(event_data) if event_data else ""
        
        # Build state text based on format
        if self._date_format == "short":
            state_text = f"{day:02d}/{month:02d}/{year}"
        elif self._date_format == "geez_full":
            geez_day = self._to_geez_numerals(day)
            geez_year = self._to_geez_numerals(year)
            state_text = f"{geez_day} {month_name_geez} {geez_year}"
        else:  # full format
            if self._show_geez_names:
                state_text = f"{day} {month_name_geez} {year}"
            else:
                state_text = f"{day} {month_name_en} {year}"
        
        # Return attributes
        return {
            "ethiopian_year": year,
            "ethiopian_month": month,
            "ethiopian_day": day,
            "month_name_en": month_name_en,
            "month_name_geez": month_name_geez,
            "month_name_am": month_name_am,
            "weekday_en": weekday_en,
            "weekday_am": weekday_am,
            "weekday_geez": weekday_geez,
            "weekday_index": weekday_index,
            "is_leap_year": is_leap,
            "days_in_month": dim,
            "days_in_year": 366 if is_leap else 365,
            "event": event_name,
            "state_text": state_text,
            "gregorian_date": earth_date.strftime("%Y-%m-%d"),
            "date_format": self._date_format,
            "geez_day": self._to_geez_numerals(day),
            "geez_month": self._to_geez_numerals(month),
            "geez_year": self._to_geez_numerals(year),
            "era": "ዓ.ም.",  # Amharic era marker (Amate Mihret = Year of Mercy)
            "era_en": "E.C."  # Ethiopian Calendar
        }
    
    # ===============================
    # Update loop hook
    # ===============================
    
    def update(self) -> None:
        """Update the sensor state and attributes."""
        try:
            now = datetime.now()
            self._ethiopian_date = self._calculate_ethiopian_date(now)
            # State shown on the badge
            self._state = self._ethiopian_date.get("state_text")
        except Exception as exc:
            _LOGGER.exception("Failed to calculate Ethiopian date: %s", exc)
            self._state = "error"
    
    # ===============================
    # Config handling (optional hooks)
    # ===============================
    
    def set_options(self, *, show_geez_names: bool | None = None,
                    date_format: str | None = None) -> None:
        """Allow runtime configuration from integration options."""
        if show_geez_names is not None:
            self._show_geez_names = bool(show_geez_names)
        if date_format is not None:
            if date_format in ("full", "short", "geez_full"):
                self._date_format = date_format
            else:
                _LOGGER.warning("Unknown date format '%s', using 'full'", date_format)
                self._date_format = "full"
