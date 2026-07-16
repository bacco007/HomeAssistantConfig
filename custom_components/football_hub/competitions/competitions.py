"""Football Hub competition catalogue."""


def _competition(name, country, league_id, kind="league", has_table=True):
    return {
        "name": name,
        "country": country,
        "league_id": league_id,
        "type": kind,
        "has_table": has_table,
        "has_matchweeks": True,
    }


def _league(name, country, league_id):
    return _competition(name, country, league_id)


def _cup(name, country, league_id, has_table=False):
    return _competition(name, country, league_id, "cup", has_table)


COMPETITIONS = {
    "premier_league": _league("Premier League", "England", 39),
    "championship": _league("Championship", "England", 40),
    "league_one": _league("League One", "England", 41),
    "league_two": _league("League Two", "England", 42),
    "national_league": _league("National League", "England", 43),
    "scottish_premiership": _league("Scottish Premiership", "Scotland", 179),
    "cymru_premier": _league("Cymru Premier", "Wales", 110),
    "northern_ireland_premiership": _league("Premiership", "Northern Ireland", 408),
    "league_of_ireland": _league("Premier Division", "Ireland", 357),
    "la_liga": _league("La Liga", "Spain", 140),
    "bundesliga": _league("Bundesliga", "Germany", 78),
    "serie_a": _league("Serie A", "Italy", 135),
    "ligue_1": _league("Ligue 1", "France", 61),
    "eredivisie": _league("Eredivisie", "Netherlands", 88),
    "primeira_liga": _league("Primeira Liga", "Portugal", 94),
    "belgian_pro_league": _league("Jupiler Pro League", "Belgium", 144),
    "super_lig": _league("Süper Lig", "Türkiye", 203),

    # UEFA league-phase tables are available for all three competitions.
    "champions_league": _cup("UEFA Champions League", "Europe", 1001, True),
    "europa_league": _cup("UEFA Europa League", "Europe", 1002, True),
    "conference_league": _cup("UEFA Conference League", "Europe", 1003, True),

    "fa_cup": _cup("FA Cup", "England", 1101),
    "efl_cup": _cup("EFL Cup", "England", 1102),
    "community_shield": _cup("Community Shield", "England", 1103),
    "scottish_cup": _cup("Scottish Cup", "Scotland", 1201),
    "scottish_league_cup": _cup("Scottish League Cup", "Scotland", 1202),
    "welsh_cup": _cup("Welsh Cup", "Wales", 1301),
    "irish_cup": _cup("Irish Cup", "Northern Ireland", 1401),
    "fai_cup": _cup("FAI Cup", "Ireland", 1501),
    "copa_del_rey": _cup("Copa del Rey", "Spain", 1601),
    "spanish_super_cup": _cup("Spanish Super Cup", "Spain", 1602),
    "dfb_pokal": _cup("DFB-Pokal", "Germany", 1701),
    "german_super_cup": _cup("German Super Cup", "Germany", 1702),
    "coppa_italia": _cup("Coppa Italia", "Italy", 1801),
    "supercoppa_italiana": _cup("Supercoppa Italiana", "Italy", 1802),
    "coupe_de_france": _cup("Coupe de France", "France", 1901),
    "trophee_des_champions": _cup("Trophée des Champions", "France", 1902),
    "knvb_cup": _cup("KNVB Cup", "Netherlands", 2001),
    "johan_cruyff_shield": _cup("Johan Cruyff Shield", "Netherlands", 2002),
    "taca_de_portugal": _cup("Taça de Portugal", "Portugal", 2101),
    "portuguese_league_cup": _cup("Portuguese League Cup", "Portugal", 2102),
    "portuguese_super_cup": _cup("Portuguese Super Cup", "Portugal", 2103),
    "belgian_cup": _cup("Belgian Cup", "Belgium", 2201),
    "belgian_super_cup": _cup("Belgian Super Cup", "Belgium", 2202),
    "turkish_cup": _cup("Turkish Cup", "Türkiye", 2301),
    "turkish_super_cup": _cup("Turkish Super Cup", "Türkiye", 2302),
}
