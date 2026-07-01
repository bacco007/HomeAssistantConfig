if (!customElements.get("world-cup-2026-panel")) {
class WorldCup2026Panel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    const savedPage = localStorage.getItem("world_cup_2026_last_page") || "overview";
    const validPages = new Set(["overview", "live", "fixtures", "results", "groups", "knockout", "players", "records", "stats", "teams", "venues", "supporters"]);
    this._page = validPages.has(savedPage) ? savedPage : "overview";
    this._selectedTeamKey = localStorage.getItem("world_cup_2026_selected_team") || "";
    this._loaded = false;
    this._refreshInterval = null;
    this._countdownInterval = null;
    this._isLoading = false;
    this._visibilityHandler = null;
    this._supportersLoadedAt = 0;
    this._premiumSupportersLoadedAt = 0;
    this._jsonFetchCache = new Map();
    this._matchesByIdCache = null;
    this._matchesByIdCacheAt = 0;
    this._sidebarObserver = null;
    this._sidebarStyleRoots = new Set();
    this._sidebarObservers = [];
    this._fixturesVisibleDays = 5;
    this._fixturesVisibleMatches = 20;
    this._knockoutVisibleMatches = 12;
    const savedLanguage = localStorage.getItem("world_cup_2026_language") || "en";
    const validLanguages = new Set(["en", "fr", "de", "es", "it", "nl", "pt", "pl", "ja", "sv", "no", "hu", "tr", "cs", "da", "fi", "el", "ro", "sk", "sl", "hr", "sr", "bg", "uk", "is", "qu", "gn", "ay"]);
    this._language = validLanguages.has(savedLanguage) ? savedLanguage : "en";
    this._viewMode = localStorage.getItem("world_cup_2026_view_mode") || "pc";
    this._hideSidebar = false;
    try { localStorage.removeItem("world_cup_2026_hide_sidebar"); } catch (e) {}
    this._data = {
      overview: null,
      live: [],
      fixtures: [],
      results: [],
      apiResultsTest: [],
      groups: [],
      scorers: [],
      statistics: {},
      records: {},
      venues: {},
      supporters: [],
      premiumSupporters: [],
    };
    this._matchClockStorageKey = "world_cup_2026_match_clock_state_v1";
    this._goalEventStorageKey = "world_cup_2026_goal_event_times_v1";
    this._matchClockState = this.loadJsonStorage(this._matchClockStorageKey, {});
    this._localGoalEvents = this.loadJsonStorage(this._goalEventStorageKey, {});
  }

  shouldHideHomeAssistantSidebar() {
    return false;
  }

  sidebarHideStyles() {
    return `
      :host {
        --app-drawer-width: 0px !important;
        --mdc-drawer-width: 0px !important;
      }

      ha-sidebar,
      app-drawer,
      ha-drawer,
      .mdc-drawer,
      aside,
      paper-drawer-panel [slot="drawer"],
      [slot="drawer"] {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        min-width: 0 !important;
        max-width: 0 !important;
        transform: translateX(-100vw) !important;
        pointer-events: none !important;
      }

      app-drawer-layout,
      home-assistant,
      home-assistant-main,
      partial-panel-resolver,
      ha-panel-world-cup-2026,
      ha-panel-world_cup_2026,
      #view,
      .view,
      .content,
      main {
        --app-drawer-width: 0px !important;
        --mdc-drawer-width: 0px !important;
        left: 0 !important;
        margin-left: 0 !important;
        padding-left: 0 !important;
        width: 100% !important;
        max-width: none !important;
      }
    `;
  }

  injectSidebarHideStyle(root) {
    if (!root || this._sidebarStyleRoots.has(root)) return;
    try {
      const style = document.createElement("style");
      style.setAttribute("data-world-cup-hide-sidebar", "true");
      style.textContent = this.sidebarHideStyles();
      root.appendChild(style);
      this._sidebarStyleRoots.add(root);
    } catch (err) {
      // Ignore roots that cannot be modified.
    }
  }

  forceHideSidebarElement(el) {
    if (!el || !el.style) return;
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("width", "0", "important");
    el.style.setProperty("min-width", "0", "important");
    el.style.setProperty("max-width", "0", "important");
    el.style.setProperty("transform", "translateX(-100vw)", "important");
    el.style.setProperty("pointer-events", "none", "important");
  }

  forceFullWidthElement(el) {
    if (!el || !el.style) return;
    el.style.setProperty("--app-drawer-width", "0px", "important");
    el.style.setProperty("--mdc-drawer-width", "0px", "important");
    el.style.setProperty("margin-left", "0", "important");
    el.style.setProperty("left", "0", "important");
    el.style.setProperty("padding-left", "0", "important");
    el.style.setProperty("width", "100%", "important");
    el.style.setProperty("max-width", "none", "important");
  }

  applyHideSidebarToRoot(root) {
    if (!root) return;

    this.injectSidebarHideStyle(root);

    try {
      root.querySelectorAll("ha-sidebar, app-drawer, ha-drawer, .mdc-drawer, aside, paper-drawer-panel [slot='drawer'], [slot='drawer']")
        .forEach((el) => this.forceHideSidebarElement(el));

      root.querySelectorAll("app-drawer-layout, home-assistant, home-assistant-main, partial-panel-resolver, ha-panel-world-cup-2026, ha-panel-world_cup_2026, #view, .view, .content, main")
        .forEach((el) => this.forceFullWidthElement(el));

      root.querySelectorAll("app-drawer-layout").forEach((el) => {
        el.setAttribute("force-narrow", "");
        el.setAttribute("narrow", "");
        el.removeAttribute("opened");
        el.opened = false;
      });

      root.querySelectorAll("home-assistant, home-assistant-main").forEach((el) => {
        this.forceFullWidthElement(el);
        el.setAttribute("world-cup-hide-sidebar", "true");
      });

      root.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
          this.applyHideSidebarToRoot(el.shadowRoot);
          this.observeSidebarRoot(el.shadowRoot);
        }
      });
    } catch (err) {
      // Best-effort only. Home Assistant shadow DOM can vary between versions.
    }
  }

  observeSidebarRoot(root) {
    if (!root || this._sidebarStyleRoots.has(`observer-${root}`)) return;
    try {
      const observer = new MutationObserver(() => this.applyHideSidebarToRoot(root));
      observer.observe(root, { childList: true, subtree: true, attributes: true });
      if (!this._sidebarObservers) this._sidebarObservers = [];
      this._sidebarObservers.push(observer);
      this._sidebarStyleRoots.add(`observer-${root}`);
    } catch (err) {
      // Ignore roots that cannot be observed.
    }
  }

  applyHideSidebarFromUrl() {
    // Disabled: direct Home Assistant shell/sidebar manipulation caused crashes on some installs.
    return;
  }

  translations() {
    return {
      en: {
        title: "FIFA World Cup 2026",
        subtitle: "Home Assistant Tournament App",
        back: "← Back",
        updated: "Updated",
        loading: "Loading World Cup 2026...",
        errorTitle: "World Cup 2026",
        errorText: "Could not load app data.",
        overview: "Overview",

        teams: "Teams",
        live: "Live Centre",
        fixtures: "Fixtures",
        results: "Results",
        groups: "Groups",
        knockout: "Knockout",
        players: "Golden Boot",
        records: "Records",
        stats: "Stats Hub",
        venues: "Venues",
        totalMatches: "Total Matches",
        loaded: "Loaded",
        played: "Played",
        remaining: "Remaining",
        liveNow: "Live Now",
        totalGoals: "Total Goals",
        nextMatch: "Next Match",
        tournamentStatus: "Tournament Status",
        demoMode: "Demo mode",
        on: "On",
        off: "Off",
        lastUpdate: "Last update",
        ok: "OK",
        failed: "Failed",
        progress: "Progress",
        topScorer: "Top scorer",
        notAvailable: "Not available",
        noUpcomingMatch: "No upcoming match loaded.",
        noLiveMatches: "No matches live right now.",
        fixturesResults: "Fixtures & Results",
        noFixtures: "No fixtures loaded yet.",
        groupLabel: "Group",
        groupsAL: "Groups A-L",
        noGroups: "No group standings loaded yet.",
        noTeamsGroup: "No teams loaded for this group yet.",
        goldenBoot: "Golden Boot Race",
        noPlayerStats: "No player statistics loaded yet.",
        knockoutBracket: "Knockout Bracket",
        fixturesNotAvailable: "Fixtures not available yet",
        highestMatchGoals: "Highest Match Goals",
        biggestMargin: "Biggest Margin",
        topTeamGoals: "Top Team Goals",
        bestDefenceGA: "Best Defence GA",
        highestScoringMatch: "Highest Scoring Match",
        biggestWin: "Biggest Win",
        topScoringTeam: "Top Scoring Team",
        bestDefence: "Best Defence",
        noResult: "No result yet.",
        noTeamGoalData: "No team goal data yet.",
        noDefensiveData: "No defensive data yet.",
        matchesPlayed: "Matches Played",
        yellowCards: "Yellow Cards",
        redCards: "Red Cards",
        minutes: "Minutes",
        goalsPerMatch: "Goals / Match",
        draws: "Draws",
        drawRate: "Draw Rate",
        bttsRate: "BTTS Rate",
        over25Rate: "Over 2.5 Rate",
        stadiums: "Stadiums",
        usaVenues: "USA Venues",
        canadaVenues: "Canada Venues",
        mexicoVenues: "Mexico Venues",
        finalVenue: "Final Venue",
        capacity: "Capacity",
        worldCupStadiums: "World Cup Stadiums",
        noVenueData: "No venue data available.",
        scheduled: "Upcoming",
        liveStatus: "Live",
        manualTimerNotice: 'Live scores, match clock and goal times sync from the master API feed. Live clock flashes when confirmed live data is active.',
        paused: "Paused",
        fullTime: "Full Time",
        aet: "After Extra Time",
        penalties: "Penalties",
        postponed: "Postponed",
        groupStage: "Group Stage",
        round32: "Round of 32",
        round16: "Round of 16",
        quarterFinals: "Quarter Finals",
        semiFinals: "Semi Finals",
        thirdPlace: "Third Place",
        final: "Final",
        tbc: "TBC",
        unknown: "Unknown",
        pos: "Pos",
        team: "Team",
        player: "Player",
        goals: "Goals",
        assists: "Assists",
        language: "Dashboard Language",
        viewMode: "Dashboard View",
        mobileView: "Mobile view",
        tabletView: "Tablet view",
        pcView: "PC view",
        controlCentre: 'World Cup 2026 Control Centre',
        overviewSubtitle: 'Live tournament dashboard with fixtures, results, groups, player stats, venues, records and knockout tracking in one place.',
        tournamentIntelligence: 'Tournament Intelligence',
        goldenBootCentre: 'Golden Boot Centre',
        leaderSpotlight: 'Leader Spotlight',
        playersTracked: 'Players Tracked',
        totalAssists: 'Total Assists',
        totalYellowCards: 'Total Yellow Cards',
        totalRedCards: 'Total Red Cards',
        upNext: 'Up next',
        matchSpotlight: 'Match Spotlight',
        upcomingFixtures: 'Upcoming Fixtures',
        latest: 'Latest',
        recentResults: 'Recent Results',
        playerWatch: 'Player Watch',
        fixturesSubtitle: 'A cleaner World Cup match centre with match-day sections, bold score cards, flags, venue details and clearer live/result badges.',
        days: 'Days',
        versus: 'v',
        supportersNav: '🙏 Supporters',
        supportersThankYouTitle: '🙏 Supporters & Thank You',
        supportersIntro: 'This project started as a personal Home Assistant dashboard and has grown thanks to feedback, testing, ideas and support from the community.',
        supportersSpecialThanks: 'Special thanks to everyone who has supported development of the World Cup 2026 integration.',
        supportersTitle: '🍺 Supporters',
        latestSupporters: "⭐ Latest Supporters",
        allSupporters: "🌍 All Supporters",
        supporterDefaultMessage: 'Thank you for supporting development.',
        anonymousSupporter: 'Anonymous Supporter',
        noSupporters: 'No supporters added yet. Be the first to Buy Me a Beer and get your name listed here.',
        wantNameAdded: 'Want your name added here?',
        supportFutureUpdates: 'Support future updates, bug fixes and new World Cup features.',
        supporterBeerMessage: '🍺 Want your name featured on the Supporters page? Buy me a beer via PayPal and your name can be added to the World Cup 2026 Supporters list as a thank you for supporting development.',
        donateBuyBeer: '🍺 Donate / Buy Me a Beer',
        enjoyingIntegration: '🍺 Enjoying this integration?',
        supportIntegration: 'Support this integration',
        source: "Source",
        totalSupporters: "Total Supporters",
        countries: "Countries",
        countriesSupporting: "Countries Supporting",
        latestSupportDate: "Latest Support Date",
        playedShort: "P",
        winsShort: "W",
        drawsShort: "D",
        lossesShort: "L",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "Pts",
        noResultsLoaded: "No results loaded yet.",
        finishedMatchesSubtitle: "Finished matches and confirmed scores.",
        goldenBootAutoText: "Automatic Golden Boot data will appear once football-data.org publishes World Cup scorer data.",
        realStadium: "Real stadium",
        matchesHosted: "Matches hosted",
        communitySupport: "Community Support",
        supportersAroundWorld: "Supporters Around The World",
        noLiveGames: "No live games",
        noGamesToday: "Games Today",
        conceded: "conceded",
      },

      fr: {
        title: "Coupe du Monde FIFA 2026",
        subtitle: "Application dédiée du tournoi pour Home Assistant",
        back: "← Retour",
        updated: "Mis à jour",
        loading: "Chargement Coupe du Monde 2026...",
        errorTitle: "Coupe du Monde 2026",
        errorText: "Impossible de charger les données.",
        overview: "Aperçu",

        teams: "Equipes",
        live: "Centre en Direct",
        fixtures: "Matchs",
        groups: "Groupes",
        knockout: "Phase Finale",
        players: "Soulier d'Or",
        records: "Records",
        stats: "Stats",
        venues: "Stades",
        totalMatches: "Matchs Totaux",
        loaded: "Chargés",
        played: "Joués",
        remaining: "Restants",
        liveNow: "En Direct",
        totalGoals: "Buts Totaux",
        nextMatch: "Prochain Match",
        tournamentStatus: "État du Tournoi",
        demoMode: "Mode démo",
        on: "Activé",
        off: "Désactivé",
        lastUpdate: "Dernière mise à jour",
        ok: "OK",
        failed: "Échec",
        progress: "Progression",
        topScorer: "Meilleur buteur",
        notAvailable: "Non disponible",
        noUpcomingMatch: "Aucun prochain match chargé.",
        noLiveMatches: "Aucun match en direct actuellement.",
        fixturesResults: "Matchs et Résultats",
        noFixtures: "Aucun match chargé.",
        groupLabel: "Groupe",
        groupsAL: "Groupes A-L",
        noGroups: "Aucun classement chargé.",
        noTeamsGroup: "Aucune équipe chargée.",
        goldenBoot: "Soulier d'Or",
        noPlayerStats: "Aucune statistique joueur.",
        knockoutBracket: "Tableau Final",
        fixturesNotAvailable: "Matchs non disponibles",
        highestMatchGoals: "Match le Plus Prolifique",
        biggestMargin: "Plus Grand Écart",
        topTeamGoals: "Meilleure Attaque",
        bestDefenceGA: "Meilleure Défense",
        highestScoringMatch: "Match le Plus Prolifique",
        biggestWin: "Plus Grande Victoire",
        topScoringTeam: "Meilleure Attaque",
        bestDefence: "Meilleure Défense",
        noResult: "Aucun résultat.",
        noTeamGoalData: "Aucune donnée de buts.",
        noDefensiveData: "Aucune donnée défensive.",
        matchesPlayed: "Matchs Joués",
        yellowCards: "Cartons Jaunes",
        redCards: "Cartons Rouges",
        minutes: "Minutes",
        goalsPerMatch: "Buts / Match",
        draws: "Nuls",
        drawRate: "Taux de Nuls",
        bttsRate: "Les Deux Marquent",
        over25Rate: "Plus de 2,5",
        stadiums: "Stades",
        usaVenues: "Stades USA",
        canadaVenues: "Stades Canada",
        mexicoVenues: "Stades Mexique",
        finalVenue: "Stade de la Finale",
        capacity: "Capacité",
        worldCupStadiums: "Stades de la Coupe du Monde",
        noVenueData: "Aucune donnée de stade.",
        scheduled: "Programmé",
        liveStatus: "En Direct",
        manualTimerNotice: 'Les scores en direct se mettent à jour automatiquement. Les heures de but utilisent le chronomètre manuel du match et peuvent différer des heures officielles de quelques minutes.',
        paused: "Pause",
        fullTime: "Terminé",
        aet: "Après Prolongation",
        penalties: "Tirs au But",
        postponed: "Reporté",
        groupStage: "Phase de Groupes",
        round32: "Seizièmes",
        round16: "Huitièmes",
        quarterFinals: "Quarts",
        semiFinals: "Demi-finales",
        thirdPlace: "Troisième Place",
        final: "Finale",
        tbc: "À confirmer",
        unknown: "Inconnu",
        pos: "Pos",
        team: "Équipe",
        player: "Joueur",
        goals: "Buts",
        assists: "Passes",
        language: "Langue du Tableau de Bord",
        pcView: "Vue PC",
        tabletView: "Vue tablette",
        viewMode: "Vue du tableau de bord",
        controlCentre: 'Centre de Contrôle Coupe du Monde 2026',
        overviewSubtitle: 'Tableau de bord du tournoi avec matchs, résultats, groupes, statistiques joueurs, stades, records et phase finale au même endroit.',
        tournamentIntelligence: 'Analyse du Tournoi',
        goldenBootCentre: 'Centre du Soulier d’Or',
        leaderSpotlight: 'Leader à la Une',
        playersTracked: 'Joueurs Suivis',
        totalAssists: 'Total Passes',
        totalYellowCards: 'Total Cartons Jaunes',
        totalRedCards: 'Total Cartons Rouges',
        upNext: 'À venir',
        matchSpotlight: 'Match à la Une',
        upcomingFixtures: 'Prochains Matchs',
        latest: 'Dernier',
        recentResults: 'Résultats Récents',
        playerWatch: 'Suivi des Joueurs',
        fixturesSubtitle: 'Un centre des matchs plus clair avec journées, cartes de score, drapeaux, stades et badges de statut lisibles.',
        days: 'Jours',
        versus: 'v',
        supportersNav: '🙏 Soutiens',
        supportersThankYouTitle: '🙏 Soutiens et remerciements',
        supportersIntro: 'Ce projet a commencé comme un tableau de bord Home Assistant personnel et a grandi grâce aux retours, tests, idées et au soutien de la communauté.',
        supportersSpecialThanks: 'Merci à toutes les personnes qui ont soutenu le développement de l\'intégration World Cup 2026.',
        supportersTitle: '🍺 Soutiens',
        latestSupporters: "⭐ Derniers soutiens",
        allSupporters: "🌍 Tous les soutiens",
        supporterDefaultMessage: 'Merci de soutenir le développement.',
        anonymousSupporter: 'Soutien anonyme',
        noSupporters: 'Aucun soutien ajouté pour le moment. Soyez le premier à offrir une bière et à faire apparaître votre nom ici.',
        wantNameAdded: 'Vous voulez ajouter votre nom ici ?',
        supportFutureUpdates: 'Soutenez les futures mises à jour, corrections de bugs et nouvelles fonctions de la Coupe du Monde.',
        supporterBeerMessage: '🍺 Vous voulez que votre nom apparaisse sur la page des soutiens ? Offrez-moi une bière via PayPal et votre nom pourra être ajouté à la liste des soutiens World Cup 2026 pour vous remercier de votre aide au développement.',
        donateBuyBeer: '🍺 Faire un don / Offrir une bière',
        enjoyingIntegration: '🍺 Vous aimez cette intégration ?',
        supportIntegration: 'Soutenir cette intégration',
        results: "Résultats",
        source: "Source",
        totalSupporters: "Total des soutiens",
        countries: "Pays",
        countriesSupporting: "Pays représentés",
        latestSupportDate: "Dernière date de soutien",
        playedShort: "J",
        winsShort: "V",
        drawsShort: "N",
        lossesShort: "D",
        goalsForShort: "BP",
        goalsAgainstShort: "BC",
        goalDifferenceShort: "Diff",
        pointsShort: "Pts",
        noResultsLoaded: "Aucun résultat chargé pour le moment.",
        finishedMatchesSubtitle: "Matchs terminés et scores confirmés.",
        goldenBootAutoText: "Les données automatiques du Soulier d’or apparaîtront lorsque football-data.org publiera les données des buteurs de la Coupe du Monde.",
        realStadium: "Stade réel",
        matchesHosted: "Matchs accueillis",
        communitySupport: "Soutien de la communauté",
        supportersAroundWorld: "Soutiens du monde entier",
        noLiveGames: "Aucun match en direct",
        noGamesToday: "Aucun match aujourd’hui",
        conceded: "encaissés",
      },

      de: {
        title: "FIFA Weltmeisterschaft 2026",
        subtitle: "Home Assistant Turnier-Anwendung",
        back: "← Zurück",
        updated: "Aktualisiert",
        loading: "Weltmeisterschaft 2026 wird geladen...",
        errorTitle: "Weltmeisterschaft 2026",
        errorText: "App-Daten konnten nicht geladen werden.",
        overview: "Übersicht",

        teams: "Mannschaften",
        live: "Live-Zentrum",
        fixtures: "Spiele",
        groups: "Gruppen",
        knockout: "K.o.-Runde",
        players: "Goldener Schuh",
        records: "Rekorde",
        stats: "Statistiken",
        venues: "Stadien",
        totalMatches: "Spiele Gesamt",
        loaded: "Geladen",
        played: "Gespielt",
        remaining: "Verbleibend",
        liveNow: "Live Jetzt",
        totalGoals: "Tore Gesamt",
        nextMatch: "Nächstes Spiel",
        tournamentStatus: "Turnierstatus",
        demoMode: "Demo-Modus",
        on: "Ein",
        off: "Aus",
        lastUpdate: "Letztes Update",
        ok: "OK",
        failed: "Fehlgeschlagen",
        progress: "Fortschritt",
        topScorer: "Top-Torschütze",
        notAvailable: "Nicht verfügbar",
        noUpcomingMatch: "Kein kommendes Spiel geladen.",
        noLiveMatches: "Derzeit keine Live-Spiele.",
        fixturesResults: "Spiele & Ergebnisse",
        noFixtures: "Noch keine Spiele geladen.",
        groupLabel: "Gruppe",
        groupsAL: "Gruppen A-L",
        noGroups: "Noch keine Gruppentabellen.",
        noTeamsGroup: "Keine Teams geladen.",
        goldenBoot: "Goldener Schuh",
        noPlayerStats: "Noch keine Spielerstatistiken.",
        knockoutBracket: "K.o.-Baum",
        fixturesNotAvailable: "Spiele noch nicht verfügbar",
        highestMatchGoals: "Torreichstes Spiel",
        biggestMargin: "Höchster Vorsprung",
        topTeamGoals: "Beste Offensive",
        bestDefenceGA: "Beste Defensive",
        highestScoringMatch: "Torreichstes Spiel",
        biggestWin: "Höchster Sieg",
        topScoringTeam: "Beste Offensive",
        bestDefence: "Beste Defensive",
        noResult: "Noch kein Ergebnis.",
        noTeamGoalData: "Noch keine Tordaten.",
        noDefensiveData: "Noch keine Defensivdaten.",
        matchesPlayed: "Gespielte Spiele",
        yellowCards: "Gelbe Karten",
        redCards: "Rote Karten",
        minutes: "Minuten",
        goalsPerMatch: "Tore / Spiel",
        draws: "Unentschieden",
        drawRate: "Remis-Quote",
        bttsRate: "Beide Treffen",
        over25Rate: "Über 2,5",
        stadiums: "Stadien",
        usaVenues: "USA-Stadien",
        canadaVenues: "Kanada-Stadien",
        mexicoVenues: "Mexiko-Stadien",
        finalVenue: "Finalstadion",
        capacity: "Kapazität",
        worldCupStadiums: "WM-Stadien",
        noVenueData: "Keine Stadiondaten.",
        scheduled: "Geplant",
        liveStatus: "Live",
        manualTimerNotice: 'Live-Ergebnisse werden automatisch aktualisiert. Torzeiten verwenden die manuelle Spieluhr und können um einige Minuten von den offiziellen Zeiten abweichen.',
        paused: "Pause",
        fullTime: "Abpfiff",
        aet: "Nach Verlängerung",
        penalties: "Elfmeterschießen",
        postponed: "Verschoben",
        groupStage: "Gruppenphase",
        round32: "Runde der 32",
        round16: "Achtelfinale",
        quarterFinals: "Viertelfinale",
        semiFinals: "Halbfinale",
        thirdPlace: "Dritter Platz",
        final: "Finale",
        tbc: "Offen",
        unknown: "Unbekannt",
        pos: "Pos",
        team: "Team",
        player: "Spieler",
        goals: "Tore",
        assists: "Vorlagen",
        language: "Dashboard-Sprache",
        pcView: "PC-Ansicht",
        tabletView: "Tablet-Ansicht",
        viewMode: "Dashboard-Ansicht",
        controlCentre: 'WM 2026 Kontrollzentrum',
        overviewSubtitle: 'Live-Turnierdashboard mit Spielen, Ergebnissen, Gruppen, Spielerstatistiken, Stadien, Rekorden und K.o.-Runde an einem Ort.',
        tournamentIntelligence: 'Turnieranalyse',
        goldenBootCentre: 'Zentrum Goldener Schuh',
        leaderSpotlight: 'Führender Spieler',
        playersTracked: 'Verfolgte Spieler',
        totalAssists: 'Vorlagen Gesamt',
        totalYellowCards: 'Gelbe Karten Gesamt',
        totalRedCards: 'Rote Karten Gesamt',
        upNext: 'Als Nächstes',
        matchSpotlight: 'Spiel im Fokus',
        upcomingFixtures: 'Kommende Spiele',
        latest: 'Neueste',
        recentResults: 'Aktuelle Ergebnisse',
        playerWatch: 'Spielerüberblick',
        fixturesSubtitle: 'Ein übersichtlicheres WM-Spielzentrum mit Spieltagen, starken Ergebniskarten, Flaggen, Stadiondetails und klaren Statusanzeigen.',
        days: 'Tage',
        versus: 'gegen',
        supportersNav: '🙏 Unterstützer',
        supportersThankYouTitle: '🙏 Unterstützer & Danke',
        supportersIntro: 'Dieses Projekt begann als persönliches Home Assistant Dashboard und ist dank Feedback, Tests, Ideen und Unterstützung der Community gewachsen.',
        supportersSpecialThanks: 'Besonderer Dank gilt allen, die die Entwicklung der World Cup 2026 Integration unterstützt haben.',
        supportersTitle: '🍺 Unterstützer',
        latestSupporters: "⭐ Neueste Unterstützer",
        allSupporters: "🌍 Alle Unterstützer",
        supporterDefaultMessage: 'Danke für die Unterstützung der Entwicklung.',
        anonymousSupporter: 'Anonymer Unterstützer',
        noSupporters: 'Noch keine Unterstützer hinzugefügt. Sei der Erste, der ein Bier spendiert, und lass deinen Namen hier anzeigen.',
        wantNameAdded: 'Möchtest du deinen Namen hier sehen?',
        supportFutureUpdates: 'Unterstütze zukünftige Updates, Fehlerbehebungen und neue World-Cup-Funktionen.',
        supporterBeerMessage: '🍺 Möchtest du deinen Namen auf der Unterstützerseite sehen? Gib mir über PayPal ein Bier aus und dein Name kann als Dank für deine Unterstützung bei der Entwicklung zur World Cup 2026 Unterstützerliste hinzugefügt werden.',
        donateBuyBeer: '🍺 Spenden / Ein Bier ausgeben',
        enjoyingIntegration: '🍺 Gefällt dir diese Integration?',
        supportIntegration: 'Diese Integration unterstützen',
        results: "Ergebnisse",
        source: "Quelle",
        totalSupporters: "Unterstützer gesamt",
        countries: "Länder",
        countriesSupporting: "Unterstützende Länder",
        latestSupportDate: "Letztes Unterstützungsdatum",
        playedShort: "Sp",
        winsShort: "S",
        drawsShort: "U",
        lossesShort: "N",
        goalsForShort: "TF",
        goalsAgainstShort: "TG",
        goalDifferenceShort: "TD",
        pointsShort: "Pkt",
        noResultsLoaded: "Noch keine Ergebnisse geladen.",
        finishedMatchesSubtitle: "Beendete Spiele und bestätigte Ergebnisse.",
        goldenBootAutoText: "Automatische Daten zum Goldenen Schuh erscheinen, sobald football-data.org die WM-Torschützendaten veröffentlicht.",
        realStadium: "Tatsächliches Stadion",
        matchesHosted: "Ausgetragene Spiele",
        communitySupport: "Community-Unterstützung",
        supportersAroundWorld: "Unterstützer aus aller Welt",
        noLiveGames: "Keine Live-Spiele",
        noGamesToday: "Heute keine Spiele",
        conceded: "kassiert",
      },

      es: {
        title: "Copa Mundial FIFA 2026",
        subtitle: "Aplicación dedicada del torneo para Home Assistant",
        back: "← Volver",
        updated: "Actualizado",
        loading: "Cargando Copa Mundial 2026...",
        errorTitle: "Copa Mundial 2026",
        errorText: "No se pudieron cargar los datos.",
        overview: "Resumen",

        teams: "Equipos",
        live: "Centro en Vivo",
        fixtures: "Partidos",
        groups: "Grupos",
        knockout: "Eliminatorias",
        players: "Bota de Oro",
        records: "Récords",
        stats: "Estadísticas",
        venues: "Sedes",
        totalMatches: "Partidos Totales",
        loaded: "Cargados",
        played: "Jugados",
        remaining: "Restantes",
        liveNow: "En Vivo",
        totalGoals: "Goles Totales",
        nextMatch: "Próximo Partido",
        tournamentStatus: "Estado del Torneo",
        demoMode: "Modo demo",
        on: "Activado",
        off: "Desactivado",
        lastUpdate: "Última actualización",
        ok: "OK",
        failed: "Falló",
        progress: "Progreso",
        topScorer: "Máximo goleador",
        notAvailable: "No disponible",
        noUpcomingMatch: "No hay próximo partido cargado.",
        noLiveMatches: "No hay partidos en vivo ahora.",
        fixturesResults: "Partidos y Resultados",
        noFixtures: "No hay partidos cargados.",
        groupLabel: "Grupo",
        groupsAL: "Grupos A-L",
        noGroups: "No hay clasificación de grupos.",
        noTeamsGroup: "No hay equipos cargados.",
        goldenBoot: "Bota de Oro",
        noPlayerStats: "No hay estadísticas de jugadores.",
        knockoutBracket: "Cuadro Eliminatorio",
        fixturesNotAvailable: "Partidos no disponibles",
        highestMatchGoals: "Más Goles en un Partido",
        biggestMargin: "Mayor Diferencia",
        topTeamGoals: "Equipo Más Goleador",
        bestDefenceGA: "Mejor Defensa",
        highestScoringMatch: "Partido con Más Goles",
        biggestWin: "Mayor Victoria",
        topScoringTeam: "Equipo Más Goleador",
        bestDefence: "Mejor Defensa",
        noResult: "Aún no hay resultado.",
        noTeamGoalData: "No hay datos de goles.",
        noDefensiveData: "No hay datos defensivos.",
        matchesPlayed: "Partidos Jugados",
        yellowCards: "Tarjetas Amarillas",
        redCards: "Tarjetas Rojas",
        minutes: "Minutos",
        goalsPerMatch: "Goles / Partido",
        draws: "Empates",
        drawRate: "Porcentaje de Empates",
        bttsRate: "Ambos Marcan",
        over25Rate: "Más de 2.5",
        stadiums: "Estadios",
        usaVenues: "Sedes USA",
        canadaVenues: "Sedes Canadá",
        mexicoVenues: "Sedes México",
        finalVenue: "Sede de la Final",
        capacity: "Capacidad",
        worldCupStadiums: "Estadios del Mundial",
        noVenueData: "No hay datos de sedes.",
        scheduled: "Programado",
        liveStatus: "En Vivo",
        manualTimerNotice: 'Los marcadores en vivo se actualizan automáticamente. Los minutos de gol usan el reloj manual del partido y pueden diferir unos minutos de los oficiales.',
        paused: "Pausado",
        fullTime: "Final",
        aet: "Prórroga",
        penalties: "Penaltis",
        postponed: "Aplazado",
        groupStage: "Fase de Grupos",
        round32: "Dieciseisavos",
        round16: "Octavos",
        quarterFinals: "Cuartos",
        semiFinals: "Semifinales",
        thirdPlace: "Tercer Puesto",
        final: "Final",
        tbc: "Por confirmar",
        unknown: "Desconocido",
        pos: "Pos",
        team: "Equipo",
        player: "Jugador",
        goals: "Goles",
        assists: "Asistencias",
        language: "Idioma del Panel",
        pcView: "Vista PC",
        tabletView: "Vista tablet",
        viewMode: "Vista del panel",
        controlCentre: 'Centro de Control Mundial 2026',
        overviewSubtitle: 'Panel en vivo del torneo con partidos, resultados, grupos, estadísticas de jugadores, sedes, récords y eliminatorias en un solo lugar.',
        tournamentIntelligence: 'Análisis del Torneo',
        goldenBootCentre: 'Centro Bota de Oro',
        leaderSpotlight: 'Líder Destacado',
        playersTracked: 'Jugadores Seguidos',
        totalAssists: 'Asistencias Totales',
        totalYellowCards: 'Tarjetas Amarillas Totales',
        totalRedCards: 'Tarjetas Rojas Totales',
        upNext: 'Próximo',
        matchSpotlight: 'Partido Destacado',
        upcomingFixtures: 'Próximos Partidos',
        latest: 'Último',
        recentResults: 'Resultados Recientes',
        playerWatch: 'Seguimiento de Jugadores',
        fixturesSubtitle: 'Un centro de partidos más claro con jornadas, tarjetas de marcador, banderas, sedes y estados más legibles.',
        days: 'Días',
        versus: 'v',
        supporterBeerMessage: '🍺 ¿Quieres que tu nombre aparezca en la página de seguidores? Invítame a una cerveza por PayPal y tu nombre podrá añadirse a la lista de seguidores de World Cup 2026 como agradecimiento por apoyar el desarrollo.',
        results: "Resultados",
        latestSupporters: "⭐ Últimos seguidores",
        allSupporters: "🌍 Todos los seguidores",
        supportersNav: "🙏 Seguidores",
        supportersThankYouTitle: "🙏 Seguidores y agradecimientos",
        supportersIntro: "Este proyecto comenzó como un panel personal de Home Assistant y ha crecido gracias a comentarios, pruebas, ideas y apoyo de la comunidad.",
        supportersSpecialThanks: "Gracias especiales a todos los que han apoyado el desarrollo de la integración World Cup 2026.",
        supportersTitle: "🍺 Seguidores",
        supporterDefaultMessage: "Gracias por apoyar el desarrollo.",
        anonymousSupporter: "Seguidor anónimo",
        noSupporters: "Aún no se han añadido seguidores. Sé el primero en invitarme a una cerveza y aparecer aquí.",
        wantNameAdded: "¿Quieres añadir tu nombre aquí?",
        supportFutureUpdates: "Apoya futuras actualizaciones, correcciones de errores y nuevas funciones del Mundial.",
        donateBuyBeer: "🍺 Donar / Invitarme a una cerveza",
        enjoyingIntegration: "🍺 ¿Disfrutas esta integración?",
        supportIntegration: "Apoyar esta integraci?n",
        source: "Fuente",
        totalSupporters: "Total de seguidores",
        countries: "Países",
        countriesSupporting: "Países que apoyan",
        latestSupportDate: "Última fecha de apoyo",
        playedShort: "J",
        winsShort: "G",
        drawsShort: "E",
        lossesShort: "P",
        goalsForShort: "GF",
        goalsAgainstShort: "GC",
        goalDifferenceShort: "DG",
        pointsShort: "Pts",
        noResultsLoaded: "Aún no hay resultados cargados.",
        finishedMatchesSubtitle: "Partidos finalizados y marcadores confirmados.",
        goldenBootAutoText: "Los datos automáticos de la Bota de Oro aparecerán cuando football-data.org publique los datos de goleadores del Mundial.",
        realStadium: "Estadio real",
        matchesHosted: "Partidos alojados",
        communitySupport: "Apoyo de la comunidad",
        supportersAroundWorld: "Seguidores de todo el mundo",
        noLiveGames: "No hay partidos en vivo",
        noGamesToday: "No hay partidos hoy",
        conceded: "encajados",
      },

      it: {
        title: "Coppa del Mondo FIFA 2026",
        subtitle: "Applicazione torneo dedicata per Home Assistant",
        back: "← Indietro",
        updated: "Aggiornato",
        loading: "Caricamento Coppa del Mondo 2026...",
        errorTitle: "Coppa del Mondo 2026",
        errorText: "Impossibile caricare i dati.",
        overview: "Panoramica",

        teams: "Squadre",
        live: "Centro Live",
        fixtures: "Partite",
        groups: "Gruppi",
        knockout: "Eliminazione",
        players: "Scarpa d'Oro",
        records: "Record",
        stats: "Statistiche",
        venues: "Stadi",
        totalMatches: "Partite Totali",
        loaded: "Caricate",
        played: "Giocate",
        remaining: "Rimanenti",
        liveNow: "Live Ora",
        totalGoals: "Gol Totali",
        nextMatch: "Prossima Partita",
        tournamentStatus: "Stato Torneo",
        demoMode: "Modalità demo",
        on: "Attiva",
        off: "Disattiva",
        lastUpdate: "Ultimo aggiornamento",
        ok: "OK",
        failed: "Fallito",
        progress: "Progresso",
        topScorer: "Capocannoniere",
        notAvailable: "Non disponibile",
        noUpcomingMatch: "Nessuna prossima partita caricata.",
        noLiveMatches: "Nessuna partita live ora.",
        fixturesResults: "Partite e Risultati",
        noFixtures: "Nessuna partita caricata.",
        groupLabel: "Gruppo",
        groupsAL: "Gruppi A-L",
        noGroups: "Nessuna classifica caricata.",
        noTeamsGroup: "Nessuna squadra caricata.",
        goldenBoot: "Scarpa d'Oro",
        noPlayerStats: "Nessuna statistica giocatore.",
        knockoutBracket: "Tabellone Eliminazione",
        fixturesNotAvailable: "Partite non disponibili",
        highestMatchGoals: "Partita con Più Gol",
        biggestMargin: "Margine Maggiore",
        topTeamGoals: "Squadra con Più Gol",
        bestDefenceGA: "Miglior Difesa",
        highestScoringMatch: "Partita con Più Gol",
        biggestWin: "Vittoria Maggiore",
        topScoringTeam: "Squadra con Più Gol",
        bestDefence: "Miglior Difesa",
        noResult: "Nessun risultato.",
        noTeamGoalData: "Nessun dato gol squadra.",
        noDefensiveData: "Nessun dato difensivo.",
        matchesPlayed: "Partite Giocate",
        yellowCards: "Cartellini Gialli",
        redCards: "Cartellini Rossi",
        minutes: "Minuti",
        goalsPerMatch: "Gol / Partita",
        draws: "Pareggi",
        drawRate: "Percentuale Pareggi",
        bttsRate: "Entrambe Segnano",
        over25Rate: "Over 2.5",
        stadiums: "Stadi",
        usaVenues: "Stadi USA",
        canadaVenues: "Stadi Canada",
        mexicoVenues: "Stadi Messico",
        finalVenue: "Stadio Finale",
        capacity: "Capienza",
        worldCupStadiums: "Stadi Mondiali",
        noVenueData: "Nessun dato stadio.",
        scheduled: "Programmata",
        liveStatus: "Live",
        manualTimerNotice: 'I punteggi live si aggiornano automaticamente. I minuti dei gol usano il cronometro manuale della partita e possono differire dagli orari ufficiali di alcuni minuti.',
        paused: "Pausa",
        fullTime: "Fine Partita",
        aet: "Dopo Supplementari",
        penalties: "Rigori",
        postponed: "Rinviata",
        groupStage: "Fase a Gironi",
        round32: "Sedicesimi",
        round16: "Ottavi",
        quarterFinals: "Quarti",
        semiFinals: "Semifinali",
        thirdPlace: "Terzo Posto",
        final: "Finale",
        tbc: "Da confermare",
        unknown: "Sconosciuto",
        pos: "Pos",
        team: "Squadra",
        player: "Giocatore",
        goals: "Gol",
        assists: "Assist",
        language: "Lingua Dashboard",
        pcView: "Vista PC",
        tabletView: "Vista tablet",
        viewMode: "Vista dashboard",
        controlCentre: 'Centro di Controllo Mondiale 2026',
        overviewSubtitle: 'Dashboard live del torneo con partite, risultati, gruppi, statistiche giocatori, stadi, record e fase finale in un unico posto.',
        tournamentIntelligence: 'Analisi Torneo',
        goldenBootCentre: 'Centro Scarpa d’Oro',
        leaderSpotlight: 'Leader in Evidenza',
        playersTracked: 'Giocatori Monitorati',
        totalAssists: 'Assist Totali',
        totalYellowCards: 'Cartellini Gialli Totali',
        totalRedCards: 'Cartellini Rossi Totali',
        upNext: 'Prossimo',
        matchSpotlight: 'Partita in Evidenza',
        upcomingFixtures: 'Prossime Partite',
        latest: 'Ultimi',
        recentResults: 'Risultati Recenti',
        playerWatch: 'Osservati Speciali',
        fixturesSubtitle: 'Un centro partite più chiaro con giornate, schede punteggio, bandiere, stadi e badge di stato leggibili.',
        days: 'Giorni',
        versus: 'v',
        supportersNav: '🙏 Sostenitori',
        supportersThankYouTitle: '🙏 Sostenitori e ringraziamenti',
        supportersIntro: 'Questo progetto è nato come dashboard personale per Home Assistant ed è cresciuto grazie a feedback, test, idee e supporto della community.',
        supportersSpecialThanks: 'Un ringraziamento speciale a tutti coloro che hanno sostenuto lo sviluppo dell\'integrazione World Cup 2026.',
        supportersTitle: '🍺 Sostenitori',
        latestSupporters: "⭐ Ultimi sostenitori",
        allSupporters: "🌍 Tutti i sostenitori",
        supporterDefaultMessage: 'Grazie per sostenere lo sviluppo.',
        anonymousSupporter: 'Sostenitore anonimo',
        noSupporters: 'Nessun sostenitore ancora aggiunto. Sii il primo a offrirmi una birra e a far comparire il tuo nome qui.',
        wantNameAdded: 'Vuoi aggiungere il tuo nome qui?',
        supportFutureUpdates: 'Sostieni futuri aggiornamenti, correzioni di bug e nuove funzioni della Coppa del Mondo.',
        supporterBeerMessage: '🍺 Vuoi che il tuo nome compaia nella pagina dei sostenitori? Offrimi una birra tramite PayPal e il tuo nome potrà essere aggiunto alla lista dei sostenitori World Cup 2026 come ringraziamento per il supporto allo sviluppo.',
        donateBuyBeer: '🍺 Dona / Offrimi una birra',
        enjoyingIntegration: '🍺 Ti piace questa integrazione?',
        supportIntegration: 'Sostieni questa integrazione',
        results: "Risultati",
        source: "Fonte",
        totalSupporters: "Totale sostenitori",
        countries: "Paesi",
        countriesSupporting: "Paesi sostenitori",
        latestSupportDate: "Ultima data di supporto",
        playedShort: "G",
        winsShort: "V",
        drawsShort: "N",
        lossesShort: "P",
        goalsForShort: "GF",
        goalsAgainstShort: "GS",
        goalDifferenceShort: "DR",
        pointsShort: "Pt",
        noResultsLoaded: "Nessun risultato ancora caricato.",
        finishedMatchesSubtitle: "Partite terminate e punteggi confermati.",
        goldenBootAutoText: "I dati automatici della Scarpa d’Oro appariranno quando football-data.org pubblicherà i dati dei marcatori della Coppa del Mondo.",
        realStadium: "Stadio reale",
        matchesHosted: "Partite ospitate",
        communitySupport: "Supporto della community",
        supportersAroundWorld: "Sostenitori da tutto il mondo",
        noLiveGames: "Nessuna partita live",
        noGamesToday: "Nessuna partita oggi",
        conceded: "subiti",
      },

      nl: {
        title: "FIFA Wereldbeker 2026",
        subtitle: "Toegewijde toernooi-app voor Home Assistant",
        back: "← Terug",
        updated: "Bijgewerkt",
        loading: "Wereldbeker 2026 laden...",
        errorTitle: "Wereldbeker 2026",
        errorText: "Kon appgegevens niet laden.",
        overview: "Overzicht",

        teams: "Ploegen",
        live: "Live Centrum",
        fixtures: "Wedstrijden",
        groups: "Groepen",
        knockout: "Knock-out",
        players: "Gouden Schoen",
        records: "Records",
        stats: "Statistieken",
        venues: "Stadions",
        totalMatches: "Totaal Wedstrijden",
        loaded: "Geladen",
        played: "Gespeeld",
        remaining: "Resterend",
        liveNow: "Nu Live",
        totalGoals: "Totaal Doelpunten",
        nextMatch: "Volgende Wedstrijd",
        tournamentStatus: "Toernooistatus",
        demoMode: "Demomodus",
        on: "Aan",
        off: "Uit",
        lastUpdate: "Laatste update",
        ok: "OK",
        failed: "Mislukt",
        progress: "Voortgang",
        topScorer: "Topscorer",
        notAvailable: "Niet beschikbaar",
        noUpcomingMatch: "Geen komende wedstrijd geladen.",
        noLiveMatches: "Geen live wedstrijden nu.",
        fixturesResults: "Wedstrijden & Uitslagen",
        noFixtures: "Geen wedstrijden geladen.",
        groupLabel: "Groep",
        groupsAL: "Groepen A-L",
        noGroups: "Geen groepsstanden geladen.",
        noTeamsGroup: "Geen teams geladen.",
        goldenBoot: "Gouden Schoen",
        noPlayerStats: "Geen spelerstatistieken.",
        knockoutBracket: "Knock-out Schema",
        fixturesNotAvailable: "Wedstrijden niet beschikbaar",
        highestMatchGoals: "Meeste Doelpunten Wedstrijd",
        biggestMargin: "Grootste Marge",
        topTeamGoals: "Meeste Teamdoelpunten",
        bestDefenceGA: "Beste Verdediging",
        highestScoringMatch: "Meeste Doelpunten Wedstrijd",
        biggestWin: "Grootste Overwinning",
        topScoringTeam: "Meeste Teamdoelpunten",
        bestDefence: "Beste Verdediging",
        noResult: "Nog geen resultaat.",
        noTeamGoalData: "Geen doelpuntgegevens.",
        noDefensiveData: "Geen verdedigingsgegevens.",
        matchesPlayed: "Gespeelde Wedstrijden",
        yellowCards: "Gele Kaarten",
        redCards: "Rode Kaarten",
        minutes: "Minuten",
        goalsPerMatch: "Doelpunten / Wedstrijd",
        draws: "Gelijkspel",
        drawRate: "Gelijkspelpercentage",
        bttsRate: "Beide Scoren",
        over25Rate: "Meer dan 2.5",
        stadiums: "Stadions",
        usaVenues: "USA Stadions",
        canadaVenues: "Canada Stadions",
        mexicoVenues: "Mexico Stadions",
        finalVenue: "Finalestadion",
        capacity: "Capaciteit",
        worldCupStadiums: "WK Stadions",
        noVenueData: "Geen stadiongegevens.",
        scheduled: "Gepland",
        liveStatus: "Live",
        manualTimerNotice: 'Livescores worden automatisch bijgewerkt. Doelpunttijden gebruiken de handmatige wedstrijdklok en kunnen enkele minuten afwijken van de officiële tijden.',
        paused: "Gepauzeerd",
        fullTime: "Afgelopen",
        aet: "Na Verlenging",
        penalties: "Strafschoppen",
        postponed: "Uitgesteld",
        groupStage: "Groepsfase",
        round32: "Laatste 32",
        round16: "Laatste 16",
        quarterFinals: "Kwartfinales",
        semiFinals: "Halve Finales",
        thirdPlace: "Derde Plaats",
        final: "Finale",
        tbc: "N.t.b.",
        unknown: "Onbekend",
        pos: "Pos",
        team: "Team",
        player: "Speler",
        goals: "Doelpunten",
        assists: "Assists",
        language: "Dashboardtaal",
        pcView: "PC-weergave",
        tabletView: "Tabletweergave",
        viewMode: "Dashboardweergave",
        controlCentre: 'WK 2026 Controlecentrum',
        overviewSubtitle: 'Live toernooidashboard met wedstrijden, uitslagen, groepen, spelerstatistieken, stadions, records en knock-out in één plek.',
        tournamentIntelligence: 'Toernooi-inzicht',
        goldenBootCentre: 'Gouden Schoen Centrum',
        leaderSpotlight: 'Leider in de Spotlight',
        playersTracked: 'Gevolgde Spelers',
        totalAssists: 'Totaal Assists',
        totalYellowCards: 'Totaal Gele Kaarten',
        totalRedCards: 'Totaal Rode Kaarten',
        upNext: 'Volgende',
        matchSpotlight: 'Wedstrijd in de Spotlight',
        upcomingFixtures: 'Komende Wedstrijden',
        latest: 'Laatste',
        recentResults: 'Recente Uitslagen',
        playerWatch: 'Spelersvolger',
        fixturesSubtitle: 'Een duidelijker wedstrijdcentrum met speeldagen, scorekaarten, vlaggen, stadiondetails en heldere statusbadges.',
        days: 'Dagen',
        versus: 'v',
        supportersNav: '🙏 Supporters',
        supportersThankYouTitle: '🙏 Supporters & dankjewel',
        supportersIntro: 'Dit project begon als een persoonlijk Home Assistant-dashboard en is gegroeid dankzij feedback, testen, ideeën en steun van de community.',
        supportersSpecialThanks: 'Speciale dank aan iedereen die de ontwikkeling van de World Cup 2026-integratie heeft gesteund.',
        supportersTitle: '🍺 Supporters',
        latestSupporters: "⭐ Nieuwste supporters",
        allSupporters: "🌍 Alle supporters",
        supporterDefaultMessage: 'Bedankt voor je steun aan de ontwikkeling.',
        anonymousSupporter: 'Anonieme supporter',
        noSupporters: 'Nog geen supporters toegevoegd. Wees de eerste die een biertje koopt en je naam hier laat plaatsen.',
        wantNameAdded: 'Wil je je naam hier toevoegen?',
        supportFutureUpdates: 'Steun toekomstige updates, bugfixes en nieuwe World Cup-functies.',
        supporterBeerMessage: '🍺 Wil je dat je naam op de Supporters-pagina verschijnt? Trakteer me op een biertje via PayPal en je naam kan als bedankje voor je steun aan de ontwikkeling worden toegevoegd aan de World Cup 2026 Supporters-lijst.',
        donateBuyBeer: '🍺 Doneren / Biertje kopen',
        enjoyingIntegration: '🍺 Geniet je van deze integratie?',
        supportIntegration: 'Deze integratie steunen',
        results: "Uitslagen",
        source: "Bron",
        totalSupporters: "Totaal supporters",
        countries: "Landen",
        countriesSupporting: "Steunende landen",
        latestSupportDate: "Laatste steundatum",
        playedShort: "G",
        winsShort: "W",
        drawsShort: "G",
        lossesShort: "V",
        goalsForShort: "DV",
        goalsAgainstShort: "DT",
        goalDifferenceShort: "DS",
        pointsShort: "Pnt",
        noResultsLoaded: "Nog geen uitslagen geladen.",
        finishedMatchesSubtitle: "Afgelopen wedstrijden en bevestigde scores.",
        goldenBootAutoText: "Automatische Gouden Schoen-gegevens verschijnen zodra football-data.org WK-topscorergegevens publiceert.",
        realStadium: "Echt stadion",
        matchesHosted: "Gehoste wedstrijden",
        communitySupport: "Communitysteun",
        supportersAroundWorld: "Supporters over de hele wereld",
        noLiveGames: "Geen livewedstrijden",
        noGamesToday: "Geen wedstrijden vandaag",
        conceded: "tegen",
      },







      pt: {
        title: "Copa do Mundo FIFA 2026",
        subtitle: "Aplicação dedicada do torneio para Home Assistant",
        back: "← Voltar",
        updated: "Atualizado",
        loading: "A carregar Copa do Mundo 2026...",
        errorTitle: "Copa do Mundo 2026",
        errorText: "Não foi possível carregar os dados.",
        overview: "Resumo",

        teams: "Equipas",
        live: "Centro Ao Vivo",
        fixtures: "Jogos",
        groups: "Grupos",
        knockout: "Eliminatórias",
        players: "Bota de Ouro",
        records: "Recordes",
        stats: "Estatísticas",
        venues: "Estádios",
        totalMatches: "Jogos Totais",
        loaded: "Carregados",
        played: "Jogados",
        remaining: "Restantes",
        liveNow: "Ao Vivo",
        totalGoals: "Golos Totais",
        nextMatch: "Próximo Jogo",
        tournamentStatus: "Estado do Torneio",
        demoMode: "Modo demo",
        on: "Ligado",
        off: "Desligado",
        lastUpdate: "Última atualização",
        ok: "OK",
        failed: "Falhou",
        progress: "Progresso",
        topScorer: "Melhor marcador",
        notAvailable: "Não disponível",
        noUpcomingMatch: "Nenhum próximo jogo carregado.",
        noLiveMatches: "Nenhum jogo ao vivo agora.",
        fixturesResults: "Jogos e Resultados",
        noFixtures: "Nenhum jogo carregado.",
        groupLabel: "Grupo",
        groupsAL: "Grupos A-L",
        noGroups: "Nenhuma classificação carregada.",
        noTeamsGroup: "Nenhuma equipa carregada.",
        goldenBoot: "Bota de Ouro",
        noPlayerStats: "Nenhuma estatística de jogadores.",
        knockoutBracket: "Quadro Eliminatório",
        fixturesNotAvailable: "Jogos não disponíveis",
        highestMatchGoals: "Mais Golos num Jogo",
        biggestMargin: "Maior Margem",
        topTeamGoals: "Equipa com Mais Golos",
        bestDefenceGA: "Melhor Defesa",
        highestScoringMatch: "Jogo com Mais Golos",
        biggestWin: "Maior Vitória",
        topScoringTeam: "Equipa com Mais Golos",
        bestDefence: "Melhor Defesa",
        noResult: "Ainda sem resultado.",
        noTeamGoalData: "Sem dados de golos.",
        noDefensiveData: "Sem dados defensivos.",
        matchesPlayed: "Jogos Jogados",
        yellowCards: "Cartões Amarelos",
        redCards: "Cartões Vermelhos",
        minutes: "Minutos",
        goalsPerMatch: "Golos / Jogo",
        draws: "Empates",
        drawRate: "Taxa de Empates",
        bttsRate: "Ambas Marcam",
        over25Rate: "Mais de 2.5",
        stadiums: "Estádios",
        usaVenues: "Estádios EUA",
        canadaVenues: "Estádios Canadá",
        mexicoVenues: "Estádios México",
        finalVenue: "Estádio da Final",
        capacity: "Capacidade",
        worldCupStadiums: "Estádios da Copa",
        noVenueData: "Nenhum dado de estádio.",
        scheduled: "Agendado",
        liveStatus: "Ao Vivo",
        manualTimerNotice: 'Os resultados ao vivo atualizam automaticamente. Os tempos dos golos usam o relógio manual do jogo e podem diferir dos tempos oficiais por alguns minutos.',
        paused: "Pausado",
        fullTime: "Final",
        aet: "Após Prolongamento",
        penalties: "Penáltis",
        postponed: "Adiado",
        groupStage: "Fase de Grupos",
        round32: "Ronda de 32",
        round16: "Oitavos",
        quarterFinals: "Quartos",
        semiFinals: "Meias-finais",
        thirdPlace: "Terceiro Lugar",
        final: "Final",
        tbc: "Por confirmar",
        unknown: "Desconhecido",
        pos: "Pos",
        team: "Equipa",
        player: "Jogador",
        goals: "Golos",
        assists: "Assistências",
        language: "Idioma do Painel",
        pcView: "Vista PC",
        tabletView: "Vista tablet",
        viewMode: "Vista do painel",
        controlCentre: 'Centro de Controlo Mundial 2026',
        overviewSubtitle: 'Painel ao vivo do torneio com jogos, resultados, grupos, estatísticas de jogadores, estádios, recordes e eliminatórias num só local.',
        tournamentIntelligence: 'Análise do Torneio',
        goldenBootCentre: 'Centro da Bota de Ouro',
        leaderSpotlight: 'Líder em Destaque',
        playersTracked: 'Jogadores Acompanhados',
        totalAssists: 'Assistências Totais',
        totalYellowCards: 'Total Cartões Amarelos',
        totalRedCards: 'Total Cartões Vermelhos',
        upNext: 'A seguir',
        matchSpotlight: 'Jogo em Destaque',
        upcomingFixtures: 'Próximos Jogos',
        latest: 'Mais recente',
        recentResults: 'Resultados Recentes',
        playerWatch: 'Acompanhar Jogadores',
        fixturesSubtitle: 'Um centro de jogos mais claro com dias de jogo, cartões de resultado, bandeiras, estádios e estados mais visíveis.',
        days: 'Dias',
        versus: 'v',
        supportersNav: '🙏 Apoiantes',
        supportersThankYouTitle: '🙏 Apoiantes e agradecimentos',
        supportersIntro: 'Este projeto começou como um painel pessoal do Home Assistant e cresceu graças ao feedback, testes, ideias e apoio da comunidade.',
        supportersSpecialThanks: 'Um agradecimento especial a todos os que apoiaram o desenvolvimento da integração World Cup 2026.',
        supportersTitle: '🍺 Apoiantes',
        latestSupporters: "⭐ Apoiantes recentes",
        allSupporters: "🌍 Todos os apoiantes",
        supporterDefaultMessage: 'Obrigado por apoiar o desenvolvimento.',
        anonymousSupporter: 'Apoiante anónimo',
        noSupporters: 'Ainda não há apoiantes. Seja o primeiro a pagar-me uma cerveja e a ter o seu nome aqui.',
        wantNameAdded: 'Quer adicionar o seu nome aqui?',
        supportFutureUpdates: 'Apoie futuras atualizações, correções de erros e novas funcionalidades da Copa do Mundo.',
        supporterBeerMessage: '🍺 Quer ver o seu nome na página de apoiantes? Pague-me uma cerveja pelo PayPal e o seu nome poderá ser adicionado à lista de apoiantes World Cup 2026 como agradecimento pelo apoio ao desenvolvimento.',
        donateBuyBeer: '🍺 Donar / Pagar uma cerveja',
        enjoyingIntegration: '🍺 Está a gostar desta integração?',
        supportIntegration: 'Apoiar esta integração',
        results: "Resultados",
        source: "Fonte",
        totalSupporters: "Total de apoiantes",
        countries: "Países",
        countriesSupporting: "Países apoiantes",
        latestSupportDate: "Última data de apoio",
        playedShort: "J",
        winsShort: "V",
        drawsShort: "E",
        lossesShort: "D",
        goalsForShort: "GM",
        goalsAgainstShort: "GS",
        goalDifferenceShort: "DG",
        pointsShort: "Pts",
        noResultsLoaded: "Ainda não há resultados carregados.",
        finishedMatchesSubtitle: "Jogos terminados e resultados confirmados.",
        goldenBootAutoText: "Os dados automáticos da Bota de Ouro aparecerão quando o football-data.org publicar os dados dos marcadores da Copa do Mundo.",
        realStadium: "Estádio real",
        matchesHosted: "Jogos realizados",
        communitySupport: "Apoio da comunidade",
        supportersAroundWorld: "Apoiantes de todo o mundo",
        noLiveGames: "Sem jogos ao vivo",
        noGamesToday: "Sem jogos hoje",
        conceded: "sofridos",
      },

      pl: {
        title: "Mistrzostwa Świata FIFA 2026",
        subtitle: "Dedykowana aplikacja turniejowa dla Home Assistant",
        back: "← Wstecz",
        updated: "Zaktualizowano",
        loading: "Ładowanie Mistrzostw Świata 2026...",
        errorTitle: "Mistrzostwa Świata 2026",
        errorText: "Nie udało się załadować danych aplikacji.",
        overview: "Przegląd",

        teams: "Druzyny",
        live: "Centrum Live",
        fixtures: "Mecze",
        groups: "Grupy",
        knockout: "Faza pucharowa",
        players: "Złoty But",
        records: "Rekordy",
        stats: "Centrum statystyk",
        venues: "Stadiony",
        totalMatches: "Łączna liczba meczów",
        loaded: "Załadowano",
        played: "Rozegrane",
        remaining: "Pozostałe",
        liveNow: "Na żywo",
        totalGoals: "Łączna liczba goli",
        nextMatch: "Następny mecz",
        tournamentStatus: "Status turnieju",
        demoMode: "Tryb demo",
        on: "Włączony",
        off: "Wyłączony",
        lastUpdate: "Ostatnia aktualizacja",
        ok: "OK",
        failed: "Niepowodzenie",
        progress: "Postęp",
        topScorer: "Najlepszy strzelec",
        notAvailable: "Niedostępne",
        noUpcomingMatch: "Brak załadowanego nadchodzącego meczu.",
        noLiveMatches: "Brak meczów na żywo.",
        fixturesResults: "Mecze i wyniki",
        noFixtures: "Nie załadowano jeszcze meczów.",
        groupLabel: "Grupa",
        groupsAL: "Grupy A-L",
        noGroups: "Nie załadowano jeszcze tabel grup.",
        noTeamsGroup: "Nie załadowano jeszcze drużyn w tej grupie.",
        goldenBoot: "Wyścig o Złoty But",
        noPlayerStats: "Nie załadowano jeszcze statystyk zawodników.",
        knockoutBracket: "Drabinka fazy pucharowej",
        fixturesNotAvailable: "Mecze nie są jeszcze dostępne",
        highestMatchGoals: "Najwięcej goli w meczu",
        biggestMargin: "Największa różnica",
        topTeamGoals: "Najwięcej goli drużyny",
        bestDefenceGA: "Najlepsza obrona",
        highestScoringMatch: "Mecz z największą liczbą goli",
        biggestWin: "Największe zwycięstwo",
        topScoringTeam: "Najskuteczniejsza drużyna",
        bestDefence: "Najlepsza obrona",
        noResult: "Brak wyniku.",
        noTeamGoalData: "Brak danych o golach drużyn.",
        noDefensiveData: "Brak danych defensywnych.",
        matchesPlayed: "Rozegrane mecze",
        yellowCards: "Żółte kartki",
        redCards: "Czerwone kartki",
        minutes: "Minuty",
        goalsPerMatch: "Gole / mecz",
        draws: "Remisy",
        drawRate: "Procent remisów",
        bttsRate: "Obie drużyny strzelą",
        over25Rate: "Powyżej 2,5",
        stadiums: "Stadiony",
        usaVenues: "Stadiony USA",
        canadaVenues: "Stadiony Kanady",
        mexicoVenues: "Stadiony Meksyku",
        finalVenue: "Stadion finału",
        capacity: "Pojemność",
        worldCupStadiums: "Stadiony mundialu",
        noVenueData: "Brak danych o stadionach.",
        scheduled: "Zaplanowany",
        liveStatus: "Na żywo",
        manualTimerNotice: 'Wyniki na żywo aktualizują się automatycznie. Czasy bramek używają ręcznego zegara meczu i mogą różnić się od oficjalnych o kilka minut.',
        paused: "Przerwa",
        fullTime: "Koniec meczu",
        aet: "Po dogrywce",
        penalties: "Rzuty karne",
        postponed: "Przełożony",
        groupStage: "Faza grupowa",
        round32: "1/16 finału",
        round16: "1/8 finału",
        quarterFinals: "Ćwierćfinały",
        semiFinals: "Półfinały",
        thirdPlace: "Mecz o 3. miejsce",
        final: "Finał",
        tbc: "Do ustalenia",
        unknown: "Nieznane",
        pos: "Poz.",
        team: "Drużyna",
        player: "Zawodnik",
        goals: "Gole",
        assists: "Asysty",
        language: "Język panelu",
        pcView: "Widok PC",
        tabletView: "Widok tabletu",
        viewMode: "Widok panelu",
        controlCentre: "Centrum kontroli World Cup 2026",
        overviewSubtitle: "Panel turniejowy na żywo z meczami, wynikami, grupami, statystykami zawodników, stadionami, rekordami i fazą pucharową w jednym miejscu.",
        tournamentIntelligence: "Analiza turnieju",
        goldenBootCentre: "Centrum Złotego Buta",
        leaderSpotlight: "Lider w centrum uwagi",
        playersTracked: "Śledzeni zawodnicy",
        totalAssists: "Łączna liczba asyst",
        totalYellowCards: "Łączna liczba żółtych kartek",
        totalRedCards: "Łączna liczba czerwonych kartek",
        upNext: "Następne",
        matchSpotlight: "Mecz w centrum uwagi",
        upcomingFixtures: "Nadchodzące mecze",
        latest: "Najnowsze",
        recentResults: "Ostatnie wyniki",
        playerWatch: "Obserwacja zawodników",
        fixturesSubtitle: "Czytelniejsze centrum meczowe z podziałem na dni, kartami wyników, flagami, szczegółami stadionów i wyraźnymi statusami.",
        days: "Dni",
        versus: "v",
        supportersNav: "🙏 Wspierający",
        supportersThankYouTitle: "🙏 Wspierający i podziękowania",
        supportersIntro: "Ten projekt rozpoczął się jako osobisty panel Home Assistant i rozwinął się dzięki opiniom, testom, pomysłom oraz wsparciu społeczności.",
        supportersSpecialThanks: "Specjalne podziękowania dla wszystkich, którzy wsparli rozwój integracji World Cup 2026.",
        supportersTitle: "🍺 Wspierający",
        latestSupporters: "⭐ Najnowsi wspierający",
        allSupporters: "🌍 Wszyscy wspierający",
        supporterDefaultMessage: "Dziękuję za wsparcie rozwoju projektu.",
        anonymousSupporter: "Anonimowy wspierający",
        noSupporters: "Nie dodano jeszcze wspierających. Bądź pierwszy, postaw mi piwo i dodaj swoje imię tutaj.",
        wantNameAdded: "Chcesz dodać swoje imię tutaj?",
        supportFutureUpdates: "Wesprzyj przyszłe aktualizacje, poprawki błędów i nowe funkcje mundialowe.",
        supporterBeerMessage: '🍺 Chcesz, aby Twoje imię pojawiło się na stronie wspierających? Postaw mi piwo przez PayPal, a Twoje imię może zostać dodane do listy wspierających World Cup 2026 jako podziękowanie za wsparcie rozwoju.',
        donateBuyBeer: "🍺 Wpłać / Postaw mi piwo",
        enjoyingIntegration: "🍺 Podoba Ci się ta integracja?",
        supportIntegration: "Wesprzyj tę integrację",
        results: "Wyniki",
        source: "Źródło",
        totalSupporters: "Łącznie wspierających",
        countries: "Kraje",
        countriesSupporting: "Kraje wspierające",
        latestSupportDate: "Ostatnia data wsparcia",
        playedShort: "M",
        winsShort: "Z",
        drawsShort: "R",
        lossesShort: "P",
        goalsForShort: "BZ",
        goalsAgainstShort: "BS",
        goalDifferenceShort: "RB",
        pointsShort: "Pkt",
        noResultsLoaded: "Nie załadowano jeszcze wyników.",
        finishedMatchesSubtitle: "Zakończone mecze i potwierdzone wyniki.",
        goldenBootAutoText: "Automatyczne dane Złotego Buta pojawią się, gdy football-data.org opublikuje dane strzelców Mistrzostw Świata.",
        realStadium: "Rzeczywisty stadion",
        matchesHosted: "Rozegrane mecze",
        communitySupport: "Wsparcie społeczności",
        supportersAroundWorld: "Wspierający z całego świata",
        noLiveGames: "Brak meczów na żywo",
        noGamesToday: "Brak meczów dzisiaj",
        conceded: "stracone",
      },

      ja: {
        title: "FIFAワールドカップ 2026",
        subtitle: "Home Assistant 専用トーナメントアプリ",
        back: "← 戻る",
        updated: "更新",
        loading: "ワールドカップ2026を読み込み中...",
        errorTitle: "ワールドカップ2026",
        errorText: "データを読み込めませんでした。",
        overview: "概要",

        teams: "???",
        live: "ライブセンター",
        fixtures: "試合",
        groups: "グループ",
        knockout: "決勝トーナメント",
        players: "ゴールデンブーツ",
        records: "記録",
        stats: "統計",
        venues: "会場",
        totalMatches: "総試合数",
        loaded: "読込済み",
        played: "終了",
        remaining: "残り",
        liveNow: "ライブ中",
        totalGoals: "総得点",
        nextMatch: "次の試合",
        tournamentStatus: "大会状況",
        demoMode: "デモモード",
        on: "オン",
        off: "オフ",
        lastUpdate: "最終更新",
        ok: "OK",
        failed: "失敗",
        progress: "進行状況",
        topScorer: "得点王",
        notAvailable: "利用不可",
        noUpcomingMatch: "次の試合はありません。",
        noLiveMatches: "現在ライブ試合はありません。",
        fixturesResults: "試合と結果",
        noFixtures: "試合はまだ読み込まれていません。",
        groupLabel: "グループ",
        groupsAL: "グループ A-L",
        noGroups: "順位表はまだありません。",
        noTeamsGroup: "チームはまだありません。",
        goldenBoot: "ゴールデンブーツ",
        noPlayerStats: "選手統計はまだありません。",
        knockoutBracket: "決勝トーナメント表",
        fixturesNotAvailable: "試合未定",
        highestMatchGoals: "最多得点試合",
        biggestMargin: "最大得点差",
        topTeamGoals: "最多得点チーム",
        bestDefenceGA: "最少失点",
        highestScoringMatch: "最多得点試合",
        biggestWin: "最大勝利",
        topScoringTeam: "最多得点チーム",
        bestDefence: "最少失点",
        noResult: "結果はまだありません。",
        noTeamGoalData: "得点データはありません。",
        noDefensiveData: "守備データはありません。",
        matchesPlayed: "終了試合",
        yellowCards: "イエローカード",
        redCards: "レッドカード",
        minutes: "出場時間",
        goalsPerMatch: "得点 / 試合",
        draws: "引き分け",
        drawRate: "引き分け率",
        bttsRate: "両チーム得点",
        over25Rate: "2.5点超え",
        stadiums: "スタジアム",
        usaVenues: "米国会場",
        canadaVenues: "カナダ会場",
        mexicoVenues: "メキシコ会場",
        finalVenue: "決勝会場",
        capacity: "収容人数",
        worldCupStadiums: "ワールドカップ会場",
        noVenueData: "会場データはありません。",
        scheduled: "予定",
        liveStatus: "ライブ",
        manualTimerNotice: 'ライブスコアは自動更新されます。ゴール時間は手動の試合時計を使用するため、公式時間と数分ずれる場合があります。',
        paused: "中断",
        fullTime: "試合終了",
        aet: "延長終了",
        penalties: "PK戦",
        postponed: "延期",
        groupStage: "グループステージ",
        round32: "ラウンド32",
        round16: "ラウンド16",
        quarterFinals: "準々決勝",
        semiFinals: "準決勝",
        thirdPlace: "3位決定戦",
        final: "決勝",
        tbc: "未定",
        unknown: "不明",
        pos: "順位",
        team: "チーム",
        player: "選手",
        goals: "得点",
        assists: "アシスト",
        language: "ダッシュボード言語",
        pcView: "PC??",
        tabletView: "???????",
        viewMode: "?????????",
        controlCentre: 'ワールドカップ2026 コントロールセンター',
        overviewSubtitle: '試合、結果、グループ、選手統計、会場、記録、決勝トーナメントを一か所で確認できるライブ大会ダッシュボード。',
        tournamentIntelligence: '大会分析',
        goldenBootCentre: 'ゴールデンブーツセンター',
        leaderSpotlight: 'トップ選手',
        playersTracked: '追跡中の選手',
        totalAssists: '合計アシスト',
        totalYellowCards: '合計イエローカード',
        totalRedCards: '合計レッドカード',
        upNext: '次へ',
        matchSpotlight: '注目の試合',
        upcomingFixtures: '今後の試合',
        latest: '最新',
        recentResults: '最近の結果',
        playerWatch: '選手ウォッチ',
        fixturesSubtitle: '試合日ごとの区分、スコアカード、旗、会場情報、分かりやすい状態表示を備えた見やすい試合センター。',
        days: '日',
        versus: '対',
        supportersNav: '🙏 サポーター',
        supportersThankYouTitle: '🙏 サポーターと感謝',
        supportersIntro: 'このプロジェクトは個人用の Home Assistant ダッシュボードとして始まり、コミュニティからのフィードバック、テスト、アイデア、支援によって成長しました。',
        supportersSpecialThanks: 'World Cup 2026 インテグレーションの開発を支援してくださった皆様に感謝します。',
        supportersTitle: '🍺 サポーター',
        latestSupporters: "⭐ 最新サポーター",
        allSupporters: "🌍 すべてのサポーター",
        supporterDefaultMessage: '開発を支援していただきありがとうございます。',
        anonymousSupporter: '匿名サポーター',
        noSupporters: 'まだサポーターはいません。最初にビール代を支援して、ここに名前を載せましょう。',
        wantNameAdded: 'ここに名前を追加しますか？',
        supportFutureUpdates: '今後のアップデート、バグ修正、ワールドカップ新機能を支援できます。',
        supporterBeerMessage: '🍺 サポーターページに名前を掲載したいですか？PayPalでビール代を支援すると、開発支援への感謝としてWorld Cup 2026サポーターリストに名前を追加できます。',
        donateBuyBeer: '🍺 寄付 / ビールをおごる',
        enjoyingIntegration: '🍺 このインテグレーションを楽しんでいますか？',
        supportIntegration: 'このインテグレーションを支援',
        results: "結果",
        source: "ソース",
        totalSupporters: "サポーター合計",
        countries: "国",
        countriesSupporting: "支援国",
        latestSupportDate: "最新支援日",
        playedShort: "試",
        winsShort: "勝",
        drawsShort: "分",
        lossesShort: "敗",
        goalsForShort: "得",
        goalsAgainstShort: "失",
        goalDifferenceShort: "差",
        pointsShort: "点",
        noResultsLoaded: "結果はまだ読み込まれていません。",
        finishedMatchesSubtitle: "終了した試合と確定スコア。",
        goldenBootAutoText: "football-data.org がワールドカップ得点者データを公開すると、ゴールデンブーツの自動データが表示されます。",
        realStadium: "実際のスタジアム",
        matchesHosted: "開催試合数",
        communitySupport: "コミュニティ支援",
        supportersAroundWorld: "世界中のサポーター",
        noLiveGames: "ライブ試合はありません",
        noGamesToday: "今日は試合がありません",
        conceded: "失点",
      },









      sv: {
        title: "FIFA Världsmästerskapet 2026",
        subtitle: "Dedikerad turneringsapp för Home Assistant",
        back: "← Tillbaka",
        updated: "Uppdaterad",
        loading: "Laddar Världsmästerskapet 2026...",
        errorTitle: "Världsmästerskapet 2026",
        errorText: "Kunde inte ladda appdata.",
        overview: "Översikt",

        teams: "Lag",
        live: "Livecenter",
        fixtures: "Matcher",
        groups: "Grupper",
        knockout: "Slutspel",
        players: "Guldskon",
        records: "Rekord",
        stats: "Statistik",
        venues: "Arenor",
        totalMatches: "Totalt Matcher",
        loaded: "Laddade",
        played: "Spelade",
        remaining: "Återstående",
        liveNow: "Live Nu",
        totalGoals: "Totalt Mål",
        nextMatch: "Nästa Match",
        tournamentStatus: "Turneringsstatus",
        demoMode: "Demoläge",
        on: "På",
        off: "Av",
        lastUpdate: "Senaste uppdatering",
        ok: "OK",
        failed: "Misslyckades",
        progress: "Framsteg",
        topScorer: "Skytteligaledare",
        notAvailable: "Inte tillgängligt",
        noUpcomingMatch: "Ingen kommande match laddad.",
        noLiveMatches: "Inga matcher live just nu.",
        fixturesResults: "Matcher & Resultat",
        noFixtures: "Inga matcher laddade.",
        groupLabel: "Grupp",
        groupsAL: "Grupper A-L",
        noGroups: "Inga gruppställningar laddade.",
        noTeamsGroup: "Inga lag laddade.",
        goldenBoot: "Guldskon",
        noPlayerStats: "Ingen spelarstatistik.",
        knockoutBracket: "Slutspelsträd",
        fixturesNotAvailable: "Matcher ej tillgängliga",
        highestMatchGoals: "Mest Mål i Match",
        biggestMargin: "Största Marginal",
        topTeamGoals: "Mest Mål Lag",
        bestDefenceGA: "Bästa Försvar",
        highestScoringMatch: "Mest Mål i Match",
        biggestWin: "Största Vinst",
        topScoringTeam: "Mest Mål Lag",
        bestDefence: "Bästa Försvar",
        noResult: "Inget resultat ännu.",
        noTeamGoalData: "Ingen måldata.",
        noDefensiveData: "Ingen försvarsdata.",
        matchesPlayed: "Spelade Matcher",
        yellowCards: "Gula Kort",
        redCards: "Röda Kort",
        minutes: "Minuter",
        goalsPerMatch: "Mål / Match",
        draws: "Oavgjorda",
        drawRate: "Oavgjortprocent",
        bttsRate: "Båda Gör Mål",
        over25Rate: "Över 2.5",
        stadiums: "Arenor",
        usaVenues: "USA Arenor",
        canadaVenues: "Kanada Arenor",
        mexicoVenues: "Mexiko Arenor",
        finalVenue: "Finalarena",
        capacity: "Kapacitet",
        worldCupStadiums: "VM Arenor",
        noVenueData: "Ingen arenadata.",
        scheduled: "Planerad",
        liveStatus: "Live",
        manualTimerNotice: 'Livescore uppdateras automatiskt. Måltider använder den manuella matchklockan och kan skilja sig några minuter från officiella tider.',
        paused: "Pausad",
        fullTime: "Full Tid",
        aet: "Efter Förlängning",
        penalties: "Straffar",
        postponed: "Uppskjuten",
        groupStage: "Gruppspel",
        round32: "Sextondelsfinal",
        round16: "Åttondelsfinal",
        quarterFinals: "Kvartsfinal",
        semiFinals: "Semifinal",
        thirdPlace: "Tredjeplats",
        final: "Final",
        tbc: "Ej klart",
        unknown: "Okänd",
        pos: "Pos",
        team: "Lag",
        player: "Spelare",
        goals: "Mål",
        assists: "Assist",
        language: "Dashboard-språk",
        pcView: "PC-vy",
        tabletView: "Surfplattevy",
        viewMode: "Dashboardvy",
        controlCentre: 'VM 2026 Kontrollcenter',
        overviewSubtitle: 'Live turneringspanel med matcher, resultat, grupper, spelarstatistik, arenor, rekord och slutspel på ett ställe.',
        tournamentIntelligence: 'Turneringsanalys',
        goldenBootCentre: 'Guldskon Center',
        leaderSpotlight: 'Ledare i Fokus',
        playersTracked: 'Bevakade Spelare',
        totalAssists: 'Totalt Assist',
        totalYellowCards: 'Totalt Gula Kort',
        totalRedCards: 'Totalt Röda Kort',
        upNext: 'Nästa',
        matchSpotlight: 'Match i Fokus',
        upcomingFixtures: 'Kommande Matcher',
        latest: 'Senaste',
        recentResults: 'Senaste Resultat',
        playerWatch: 'Spelarbevakning',
        fixturesSubtitle: 'Ett tydligare matchcenter med matchdagssektioner, resultatrutor, flaggor, arenadetaljer och tydliga statusmärken.',
        days: 'Dagar',
        versus: 'mot',
        supportersNav: '🙏 Supportrar',
        supportersThankYouTitle: '🙏 Supportrar & tack',
        supportersIntro: 'Det här projektet började som en personlig Home Assistant-panel och har vuxit tack vare feedback, tester, idéer och stöd från communityn.',
        supportersSpecialThanks: 'Särskilt tack till alla som har stött utvecklingen av World Cup 2026-integrationen.',
        supportersTitle: '🍺 Supportrar',
        latestSupporters: "⭐ Senaste supportrarna",
        allSupporters: "🌍 Alla supportrar",
        supporterDefaultMessage: 'Tack för att du stödjer utvecklingen.',
        anonymousSupporter: 'Anonym supporter',
        noSupporters: 'Inga supportrar har lagts till ännu. Var först med att bjuda på en öl och få ditt namn här.',
        wantNameAdded: 'Vill du lägga till ditt namn här?',
        supportFutureUpdates: 'Stöd framtida uppdateringar, buggfixar och nya World Cup-funktioner.',
        supporterBeerMessage: '🍺 Vill du att ditt namn ska visas på supportersidan? Bjud mig på en öl via PayPal så kan ditt namn läggas till i World Cup 2026-supporterlistan som tack för ditt stöd till utvecklingen.',
        donateBuyBeer: '🍺 Donera / Bjud på en öl',
        enjoyingIntegration: '🍺 Gillar du den här integrationen?',
        supportIntegration: 'Stöd den här integrationen',
        results: "Resultat",
        source: "Källa",
        totalSupporters: "Totalt supportrar",
        countries: "Länder",
        countriesSupporting: "Stödjande länder",
        latestSupportDate: "Senaste stöddatum",
        playedShort: "S",
        winsShort: "V",
        drawsShort: "O",
        lossesShort: "F",
        goalsForShort: "GM",
        goalsAgainstShort: "IM",
        goalDifferenceShort: "MS",
        pointsShort: "P",
        noResultsLoaded: "Inga resultat har laddats ännu.",
        finishedMatchesSubtitle: "Färdigspelade matcher och bekräftade resultat.",
        goldenBootAutoText: "Automatisk Guldskon-data visas när football-data.org publicerar målskyttedata för VM.",
        realStadium: "Verklig arena",
        matchesHosted: "Matcher spelade här",
        communitySupport: "Communitystöd",
        supportersAroundWorld: "Supportrar över hela världen",
        noLiveGames: "Inga livematcher",
        noGamesToday: "Inga matcher idag",
        conceded: "insläppta",
      },

      no: {
        title: "FIFA Verdensmesterskapet 2026",
        subtitle: "Dedikert turneringsapp for Home Assistant",
        back: "← Tilbake",
        updated: "Oppdatert",
        loading: "Laster Verdensmesterskapet 2026...",
        errorTitle: "Verdensmesterskapet 2026",
        errorText: "Kunne ikke laste appdata.",
        overview: "Oversikt",

        teams: "Lag",
        live: "Livesenter",
        fixtures: "Kamper",
        groups: "Grupper",
        knockout: "Utslag",
        players: "Gullstøvelen",
        records: "Rekorder",
        stats: "Statistikk",
        venues: "Arenaer",
        totalMatches: "Totalt Kamper",
        loaded: "Lastet",
        played: "Spilt",
        remaining: "Gjenstår",
        liveNow: "Live Nå",
        totalGoals: "Totalt Mål",
        nextMatch: "Neste Kamp",
        tournamentStatus: "Turneringsstatus",
        demoMode: "Demomodus",
        on: "På",
        off: "Av",
        lastUpdate: "Siste oppdatering",
        ok: "OK",
        failed: "Feilet",
        progress: "Fremdrift",
        topScorer: "Toppscorer",
        notAvailable: "Ikke tilgjengelig",
        noUpcomingMatch: "Ingen kommende kamp lastet.",
        noLiveMatches: "Ingen livekamper akkurat nå.",
        fixturesResults: "Kamper & Resultater",
        noFixtures: "Ingen kamper lastet.",
        groupLabel: "Gruppe",
        groupsAL: "Grupper A-L",
        noGroups: "Ingen gruppetabeller lastet.",
        noTeamsGroup: "Ingen lag lastet.",
        goldenBoot: "Gullstøvelen",
        noPlayerStats: "Ingen spillerstatistikk.",
        knockoutBracket: "Utslagstre",
        fixturesNotAvailable: "Kamper ikke tilgjengelige",
        highestMatchGoals: "Flest Mål i Kamp",
        biggestMargin: "Største Margin",
        topTeamGoals: "Flest Lagmål",
        bestDefenceGA: "Beste Forsvar",
        highestScoringMatch: "Flest Mål i Kamp",
        biggestWin: "Største Seier",
        topScoringTeam: "Flest Lagmål",
        bestDefence: "Beste Forsvar",
        noResult: "Ingen resultat ennå.",
        noTeamGoalData: "Ingen måldata.",
        noDefensiveData: "Ingen forsvarsdata.",
        matchesPlayed: "Spilte Kamper",
        yellowCards: "Gule Kort",
        redCards: "Røde Kort",
        minutes: "Minutter",
        goalsPerMatch: "Mål / Kamp",
        draws: "Uavgjort",
        drawRate: "Uavgjortprosent",
        bttsRate: "Begge Scorer",
        over25Rate: "Over 2.5",
        stadiums: "Arenaer",
        usaVenues: "USA Arenaer",
        canadaVenues: "Canada Arenaer",
        mexicoVenues: "Mexico Arenaer",
        finalVenue: "Finalearena",
        capacity: "Kapasitet",
        worldCupStadiums: "VM Arenaer",
        noVenueData: "Ingen arenadata.",
        scheduled: "Planlagt",
        liveStatus: "Live",
        manualTimerNotice: 'Livescore oppdateres automatisk. Måltider bruker den manuelle kampklokken og kan avvike noen minutter fra offisielle tider.',
        paused: "Pause",
        fullTime: "Full Tid",
        aet: "Etter Ekstraomganger",
        penalties: "Straffer",
        postponed: "Utsatt",
        groupStage: "Gruppespill",
        round32: "Sekstendelsfinale",
        round16: "Åttedelsfinale",
        quarterFinals: "Kvartfinale",
        semiFinals: "Semifinale",
        thirdPlace: "Tredjeplass",
        final: "Finale",
        tbc: "Ikke klart",
        unknown: "Ukjent",
        pos: "Pos",
        team: "Lag",
        player: "Spiller",
        goals: "Mål",
        assists: "Målgivende",
        language: "Dashboardspråk",
        pcView: "PC-visning",
        tabletView: "Nettbrettvisning",
        viewMode: "Dashbordvisning",
        controlCentre: 'VM 2026 Kontrollsenter',
        overviewSubtitle: 'Live turneringspanel med kamper, resultater, grupper, spillerstatistikk, arenaer, rekorder og utslagsspill på ett sted.',
        tournamentIntelligence: 'Turneringsanalyse',
        goldenBootCentre: 'Gullstøvelen Senter',
        leaderSpotlight: 'Leder i Fokus',
        playersTracked: 'Spillere Fulgt',
        totalAssists: 'Totalt Målgivende',
        totalYellowCards: 'Totalt Gule Kort',
        totalRedCards: 'Totalt Røde Kort',
        upNext: 'Neste',
        matchSpotlight: 'Kamp i Fokus',
        upcomingFixtures: 'Kommende Kamper',
        latest: 'Siste',
        recentResults: 'Siste Resultater',
        playerWatch: 'Spilleroversikt',
        fixturesSubtitle: 'Et tydeligere kampsenter med kampdager, resultatkort, flagg, arenadetaljer og klare statusmerker.',
        days: 'Dager',
        versus: 'mot',
        supportersNav: '🙏 Støttespillere',
        supportersThankYouTitle: '🙏 Støttespillere og takk',
        supportersIntro: 'Dette prosjektet startet som et personlig Home Assistant-dashbord og har vokst takket være tilbakemeldinger, testing, ideer og støtte fra fellesskapet.',
        supportersSpecialThanks: 'Spesiell takk til alle som har støttet utviklingen av World Cup 2026-integrasjonen.',
        supportersTitle: '🍺 Støttespillere',
        latestSupporters: "⭐ Siste støttespillere",
        allSupporters: "🌍 Alle støttespillere",
        supporterDefaultMessage: 'Takk for at du støtter utviklingen.',
        anonymousSupporter: 'Anonym støttespiller',
        noSupporters: 'Ingen støttespillere er lagt til ennå. Bli den første til å kjøpe meg en øl og få navnet ditt her.',
        wantNameAdded: 'Vil du ha navnet ditt lagt til her?',
        supportFutureUpdates: 'Støtt fremtidige oppdateringer, feilrettinger og nye World Cup-funksjoner.',
        supporterBeerMessage: '🍺 Vil du ha navnet ditt på supportersiden? Kjøp meg en øl via PayPal, så kan navnet ditt legges til på World Cup 2026-supporterlisten som takk for at du støtter utviklingen.',
        donateBuyBeer: '🍺 Doner / Kjøp meg en øl',
        enjoyingIntegration: '🍺 Liker du denne integrasjonen?',
        supportIntegration: 'Støtt denne integrasjonen',
        results: "Resultater",
        source: "Kilde",
        totalSupporters: "Totalt støttespillere",
        countries: "Land",
        countriesSupporting: "Land som støtter",
        latestSupportDate: "Siste støttedato",
        playedShort: "S",
        winsShort: "V",
        drawsShort: "U",
        lossesShort: "T",
        goalsForShort: "MF",
        goalsAgainstShort: "MM",
        goalDifferenceShort: "MF",
        pointsShort: "P",
        noResultsLoaded: "Ingen resultater lastet ennå.",
        finishedMatchesSubtitle: "Ferdigspilte kamper og bekreftede resultater.",
        goldenBootAutoText: "Automatiske Gullstøvel-data vises når football-data.org publiserer målscorerdata for VM.",
        realStadium: "Faktisk stadion",
        matchesHosted: "Kamper arrangert",
        communitySupport: "Fellesskapsstøtte",
        supportersAroundWorld: "Støttespillere over hele verden",
        noLiveGames: "Ingen livekamper",
        noGamesToday: "Ingen kamper i dag",
        conceded: "sluppet inn",
      },

      hu: {
        title: "FIFA-világbajnokság 2026",
        subtitle: "Dedikált tornaalkalmazás Home Assistanthez",
        back: "← Vissza",
        updated: "Frissítve",
        loading: "A 2026-os világbajnokság betöltése...",
        errorTitle: "Világbajnokság 2026",
        errorText: "Nem sikerült betölteni az alkalmazás adatait.",
        overview: "Áttekintés",

        teams: "Csapatok",
        live: "Élő központ",
        fixtures: "Mérkőzések",
        results: "Eredmények",
        groups: "Csoportok",
        knockout: "Egyenes kiesés",
        players: "Aranycipő",
        records: "Rekordok",
        stats: "Statisztikai központ",
        venues: "Stadionok",
        totalMatches: "Összes mérkőzés",
        loaded: "Betöltve",
        played: "Lejátszva",
        remaining: "Hátralévő",
        liveNow: "Élő most",
        totalGoals: "Összes gól",
        nextMatch: "Következő mérkőzés",
        tournamentStatus: "Torna állapota",
        demoMode: "Demó mód",
        on: "Be",
        off: "Ki",
        lastUpdate: "Utolsó frissítés",
        ok: "OK",
        failed: "Sikertelen",
        progress: "Haladás",
        topScorer: "Góllövőlista vezetője",
        notAvailable: "Nem elérhető",
        noUpcomingMatch: "Nincs betöltött következő mérkőzés.",
        noLiveMatches: "Jelenleg nincs élő mérkőzés.",
        fixturesResults: "Mérkőzések és eredmények",
        noFixtures: "Még nincsenek betöltött mérkőzések.",
        groupLabel: "Csoport",
        groupsAL: "A-L csoportok",
        noGroups: "Még nincsenek betöltött csoportállások.",
        noTeamsGroup: "Még nincsenek betöltött csapatok ebben a csoportban.",
        goldenBoot: "Aranycipő verseny",
        noPlayerStats: "Még nincsenek betöltött játékosstatisztikák.",
        knockoutBracket: "Egyenes kieséses ág",
        fixturesNotAvailable: "A mérkőzések még nem elérhetők",
        highestMatchGoals: "Legtöbb gól egy mérkőzésen",
        biggestMargin: "Legnagyobb különbség",
        topTeamGoals: "Legtöbb csapatgól",
        bestDefenceGA: "Legjobb védelem",
        highestScoringMatch: "Leggólgazdagabb mérkőzés",
        biggestWin: "Legnagyobb győzelem",
        topScoringTeam: "Legeredményesebb csapat",
        bestDefence: "Legjobb védelem",
        noResult: "Még nincs eredmény.",
        noTeamGoalData: "Még nincs csapatgól-adat.",
        noDefensiveData: "Még nincs védelmi adat.",
        matchesPlayed: "Lejátszott mérkőzések",
        yellowCards: "Sárga lapok",
        redCards: "Piros lapok",
        minutes: "Percek",
        goalsPerMatch: "Gól / mérkőzés",
        draws: "Döntetlenek",
        drawRate: "Döntetlen arány",
        bttsRate: "Mindkét csapat gólt szerez",
        over25Rate: "2,5 gól felett arány",
        stadiums: "Stadionok",
        usaVenues: "USA stadionok",
        canadaVenues: "Kanadai stadionok",
        mexicoVenues: "Mexikói stadionok",
        finalVenue: "Döntő helyszíne",
        capacity: "Befogadóképesség",
        worldCupStadiums: "Világbajnokság stadionjai",
        noVenueData: "Nincs stadionadat.",
        scheduled: "Ütemezve",
        liveStatus: "Élő",
        manualTimerNotice: 'Az élő eredmények automatikusan frissülnek. A gólidők a kézi meccsórát használják, és néhány perccel eltérhetnek a hivatalos időktől.',
        paused: "Szünet",
        fullTime: "Vége",
        aet: "Hosszabbítás után",
        penalties: "Tizenegyesek",
        postponed: "Elhalasztva",
        groupStage: "Csoportkör",
        round32: "Legjobb 32",
        round16: "Nyolcaddöntő",
        quarterFinals: "Negyeddöntő",
        semiFinals: "Elődöntő",
        thirdPlace: "Bronzmérkőzés",
        final: "Döntő",
        tbc: "Később dől el",
        unknown: "Ismeretlen",
        pos: "Hely",
        team: "Csapat",
        player: "Játékos",
        goals: "Gólok",
        assists: "Gólpasszok",
        language: "Műszerfal nyelve",
        pcView: "PC n?zet",
        tabletView: "Tablet n?zet",
        viewMode: "Ir?ny?t?pult n?zet",
        controlCentre: "World Cup 2026 vezérlőközpont",
        overviewSubtitle: "Élő torna-műszerfal mérkőzésekkel, eredményekkel, csoportokkal, játékosstatisztikákkal, stadionokkal, rekordokkal és kieséses ággal egy helyen.",
        tournamentIntelligence: "Tornaelemzés",
        goldenBootCentre: "Aranycipő központ",
        leaderSpotlight: "Vezető játékos kiemelve",
        playersTracked: "Követett játékosok",
        totalAssists: "Összes gólpassz",
        totalYellowCards: "Összes sárga lap",
        totalRedCards: "Összes piros lap",
        upNext: "Következik",
        matchSpotlight: "Kiemelt mérkőzés",
        upcomingFixtures: "Következő mérkőzések",
        latest: "Legfrissebb",
        recentResults: "Legutóbbi eredmények",
        playerWatch: "Játékosfigyelő",
        fixturesSubtitle: "Átláthatóbb mérkőzésközpont mérkőzésnapi szekciókkal, erős eredménykártyákkal, zászlókkal, stadionrészletekkel és jól látható állapotjelzésekkel.",
        days: "Nap",
        versus: "v",
        supportersNav: "🙏 Támogatók",
        supportersThankYouTitle: "🙏 Támogatók és köszönet",
        supportersIntro: "Ez a projekt személyes Home Assistant műszerfalként indult, és a közösség visszajelzéseinek, tesztelésének, ötleteinek és támogatásának köszönhetően nőtt tovább.",
        supportersSpecialThanks: "Külön köszönet mindenkinek, aki támogatta a World Cup 2026 integráció fejlesztését.",
        supportersTitle: "🍺 Támogatók",
        latestSupporters: "⭐ Legújabb támogatók",
        allSupporters: "🌍 Összes támogató",
        supporterDefaultMessage: "Köszönöm, hogy támogatod a fejlesztést.",
        anonymousSupporter: "Névtelen támogató",
        noSupporters: "Még nincs hozzáadott támogató. Légy az első, aki meghív egy sörre, és megjelenik itt a neve.",
        wantNameAdded: "Szeretnéd, hogy ide kerüljön a neved?",
        supportFutureUpdates: "Támogasd a jövőbeli frissítéseket, hibajavításokat és új világbajnokság-funkciókat.",
        supporterBeerMessage: "🍺 Szeretnéd, hogy a neved megjelenjen a Támogatók oldalon? Hívj meg egy sörre PayPalon keresztül, és a neved felkerülhet a World Cup 2026 támogatói listára a fejlesztés támogatásáért cserébe.",
        donateBuyBeer: "🍺 Adomány / Hívj meg egy sörre",
        enjoyingIntegration: "🍺 Tetszik ez az integráció?",
        supportIntegration: "Támogasd ezt az integrációt",
        source: "Forrás",
        totalSupporters: "Támogatók összesen",
        countries: "Országok",
        countriesSupporting: "Támogató országok",
        latestSupportDate: "Legutóbbi támogatás dátuma",
        playedShort: "M",
        winsShort: "Gy",
        drawsShort: "D",
        lossesShort: "V",
        goalsForShort: "RG",
        goalsAgainstShort: "KG",
        goalDifferenceShort: "GK",
        pointsShort: "Pont",
        noResultsLoaded: "Még nincsenek betöltött eredmények.",
        finishedMatchesSubtitle: "Befejezett mérkőzések és megerősített eredmények.",
        goldenBootAutoText: "Az automatikus Aranycipő-adatok akkor jelennek meg, amikor a football-data.org közzéteszi a vb góllövőadatait.",
        realStadium: "Valódi stadion",
        matchesHosted: "Rendezett mérkőzések",
        communitySupport: "Közösségi támogatás",
        supportersAroundWorld: "Támogatók a világ minden tájáról",
        noLiveGames: "Nincsenek élő meccsek",
        noGamesToday: "Ma nincs mérkőzés",
        conceded: "kapott gól",
      },


      tr: {
        title: "FIFA Dünya Kupası 2026",
        subtitle: "Home Assistant için özel turnuva uygulaması",
        back: "← Geri",
        updated: "Güncellendi",
        loading: "2026 Dünya Kupası yükleniyor...",
        errorTitle: "Dünya Kupası 2026",
        errorText: "Uygulama verileri yüklenemedi.",
        overview: "Genel Bakış",

        teams: "Takimlar",
        live: "Canlı Merkez",
        fixtures: "Fikstür",
        results: "Sonuçlar",
        groups: "Gruplar",
        knockout: "Eleme Turu",
        players: "Gol Krallığı",
        records: "Rekorlar",
        stats: "İstatistik Merkezi",
        venues: "Stadyumlar",
        totalMatches: "Toplam Maç",
        loaded: "Yüklendi",
        played: "Oynandı",
        remaining: "Kalan",
        liveNow: "Şu An Canlı",
        totalGoals: "Toplam Gol",
        nextMatch: "Sonraki Maç",
        tournamentStatus: "Turnuva Durumu",
        demoMode: "Demo modu",
        on: "Açık",
        off: "Kapalı",
        lastUpdate: "Son güncelleme",
        ok: "OK",
        failed: "Başarısız",
        progress: "İlerleme",
        topScorer: "Gol kralı",
        notAvailable: "Mevcut değil",
        noUpcomingMatch: "Yüklenmiş yaklaşan maç yok.",
        noLiveMatches: "Şu anda canlı maç yok.",
        fixturesResults: "Fikstür ve Sonuçlar",
        noFixtures: "Henüz fikstür yüklenmedi.",
        groupLabel: "Grup",
        groupsAL: "A-L Grupları",
        noGroups: "Henüz grup puan durumu yüklenmedi.",
        noTeamsGroup: "Bu grup için henüz takım yüklenmedi.",
        goldenBoot: "Altın Ayakkabı Yarışı",
        noPlayerStats: "Henüz oyuncu istatistikleri yüklenmedi.",
        knockoutBracket: "Eleme Tablosu",
        fixturesNotAvailable: "Fikstür henüz mevcut değil",
        highestMatchGoals: "En Gollü Maç",
        biggestMargin: "En Büyük Fark",
        topTeamGoals: "En Çok Gol Atan Takım",
        bestDefenceGA: "En İyi Savunma GA",
        highestScoringMatch: "En Gollü Maç",
        biggestWin: "En Büyük Galibiyet",
        topScoringTeam: "En Çok Gol Atan Takım",
        bestDefence: "En İyi Savunma",
        noResult: "Henüz sonuç yok.",
        noTeamGoalData: "Henüz takım gol verisi yok.",
        noDefensiveData: "Henüz savunma verisi yok.",
        matchesPlayed: "Oynanan Maçlar",
        yellowCards: "Sarı Kartlar",
        redCards: "Kırmızı Kartlar",
        minutes: "Dakika",
        goalsPerMatch: "Gol / Maç",
        draws: "Beraberlikler",
        drawRate: "Beraberlik Oranı",
        bttsRate: "Karşılıklı Gol Oranı",
        over25Rate: "2,5 Üstü Oranı",
        stadiums: "Stadyumlar",
        usaVenues: "ABD Stadyumları",
        canadaVenues: "Kanada Stadyumları",
        mexicoVenues: "Meksika Stadyumları",
        finalVenue: "Final Stadyumu",
        capacity: "Kapasite",
        worldCupStadiums: "Dünya Kupası Stadyumları",
        noVenueData: "Stadyum verisi yok.",
        scheduled: "Planlandı",
        liveStatus: "Canlı",
        manualTimerNotice: 'Canlı skorlar otomatik güncellenir. Gol dakikaları manuel maç saatini kullanır ve resmi zamanlardan birkaç dakika farklı olabilir.',
        paused: "Duraklatıldı",
        fullTime: "Maç Bitti",
        aet: "Uzatmalar Sonrası",
        penalties: "Penaltılar",
        postponed: "Ertelendi",
        groupStage: "Grup Aşaması",
        round32: "Son 32",
        round16: "Son 16",
        quarterFinals: "Çeyrek Final",
        semiFinals: "Yarı Final",
        thirdPlace: "Üçüncülük",
        final: "Final",
        tbc: "Belli değil",
        unknown: "Bilinmiyor",
        pos: "Sıra",
        team: "Takım",
        player: "Oyuncu",
        goals: "Goller",
        assists: "Asistler",
        language: "Panel Dili",
        pcView: "PC g?r?n?m?",
        tabletView: "Tablet g?r?n?m?",
        viewMode: "Pano g?r?n?m?",
        controlCentre: "World Cup 2026 Kontrol Merkezi",
        overviewSubtitle: "Maçlar, sonuçlar, gruplar, oyuncu istatistikleri, stadyumlar, rekorlar ve eleme takibini tek yerde sunan canlı turnuva paneli.",
        tournamentIntelligence: "Turnuva Analizi",
        goldenBootCentre: "Altın Ayakkabı Merkezi",
        leaderSpotlight: "Lider Öne Çıkan",
        playersTracked: "Takip Edilen Oyuncular",
        totalAssists: "Toplam Asist",
        totalYellowCards: "Toplam Sarı Kart",
        totalRedCards: "Toplam Kırmızı Kart",
        upNext: "Sıradaki",
        matchSpotlight: "Maç Öne Çıkan",
        upcomingFixtures: "Yaklaşan Maçlar",
        latest: "En Son",
        recentResults: "Son Sonuçlar",
        playerWatch: "Oyuncu Takibi",
        fixturesSubtitle: "Maç günü bölümleri, güçlü skor kartları, bayraklar, stadyum detayları ve net durum rozetleriyle daha temiz maç merkezi.",
        days: "Gün",
        versus: "v",
        supportersNav: "🙏 Destekçiler",
        supportersThankYouTitle: "🙏 Destekçiler ve Teşekkürler",
        supportersIntro: "Bu proje kişisel bir Home Assistant paneli olarak başladı ve topluluk geri bildirimi, testler, fikirler ve destek sayesinde büyüdü.",
        supportersSpecialThanks: "World Cup 2026 entegrasyonunun geliştirilmesini destekleyen herkese özel teşekkürler.",
        supportersTitle: "🍺 Destekçiler",
        latestSupporters: "⭐ Son Destekçiler",
        allSupporters: "🌍 Tüm Destekçiler",
        supporterDefaultMessage: "Geliştirmeyi desteklediğiniz için teşekkürler.",
        anonymousSupporter: "Anonim Destekçi",
        noSupporters: "Henüz destekçi eklenmedi. Bana ilk birayı ısmarlayan olup adınızı burada gösterin.",
        wantNameAdded: "Adınızın buraya eklenmesini ister misiniz?",
        supportFutureUpdates: "Gelecek güncellemeleri, hata düzeltmelerini ve yeni Dünya Kupası özelliklerini destekleyin.",
        supporterBeerMessage: "🍺 Adınızın Destekçiler sayfasında görünmesini ister misiniz? PayPal üzerinden bana bir bira ısmarlayın; adınız geliştirmeye destek verdiğiniz için teşekkür olarak World Cup 2026 Destekçiler listesine eklenebilir.",
        donateBuyBeer: "🍺 Bağış Yap / Bira Ismarla",
        enjoyingIntegration: "🍺 Bu entegrasyonu beğeniyor musunuz?",
        supportIntegration: "Bu entegrasyonu destekle",
        source: "Kaynak",
        totalSupporters: "Toplam Destekçi",
        countries: "Ülkeler",
        countriesSupporting: "Destekleyen Ülkeler",
        latestSupportDate: "Son Destek Tarihi",
        playedShort: "O",
        winsShort: "G",
        drawsShort: "B",
        lossesShort: "M",
        goalsForShort: "AG",
        goalsAgainstShort: "YG",
        goalDifferenceShort: "AV",
        pointsShort: "Puan",
        noResultsLoaded: "Henüz sonuç yüklenmedi.",
        finishedMatchesSubtitle: "Biten maçlar ve onaylanmış skorlar.",
        goldenBootAutoText: "football-data.org Dünya Kupası golcü verilerini yayımladığında otomatik Altın Ayakkabı verileri görünecek.",
        realStadium: "Gerçek stadyum",
        matchesHosted: "Ev sahipliği yapılan maçlar",
        communitySupport: "Topluluk Desteği",
        supportersAroundWorld: "Dünyanın Dört Bir Yanından Destekçiler",
        noLiveGames: "Canlı maç yok",
        noGamesToday: "Bugün maç yok",
        conceded: "yenilen gol",
      },

      cs: {
        title: "Mistrovství světa FIFA 2026",
        subtitle: "Turnajová aplikace pro Home Assistant",
        back: "← Zpět",
        updated: "Aktualizováno",
        loading: "Načítání MS 2026...",
        errorTitle: "Mistrovství světa 2026",
        errorText: "Data aplikace se nepodařilo načíst.",
        overview: "Přehled",

        teams: "Tymy",
        live: "Živé centrum",
        fixtures: "Zápasy",
        results: "Výsledky",
        groups: "Skupiny",
        knockout: "Vyřazovací fáze",
        players: "Zlatá kopačka",
        records: "Rekordy",
        stats: "Statistiky",
        venues: "Stadiony",
        totalMatches: "Celkem zápasů",
        loaded: "Načteno",
        played: "Odehráno",
        remaining: "Zbývá",
        liveNow: "Právě živě",
        totalGoals: "Celkem gólů",
        nextMatch: "Další zápas",
        tournamentStatus: "Stav turnaje",
        demoMode: "Demo režim",
        on: "Zapnuto",
        off: "Vypnuto",
        lastUpdate: "Poslední aktualizace",
        ok: "OK",
        failed: "Selhalo",
        progress: "Průběh",
        topScorer: "Nejlepší střelec",
        notAvailable: "Není dostupné",
        noUpcomingMatch: "Není načten žádný nadcházející zápas.",
        noLiveMatches: "Právě teď se nehraje žádný živý zápas.",
        fixturesResults: "Zápasy a výsledky",
        noFixtures: "Zatím nejsou načteny žádné zápasy.",
        groupLabel: "Skupina",
        groupsAL: "Skupiny A-L",
        noGroups: "Zatím nejsou načteny žádné tabulky skupin.",
        noTeamsGroup: "Pro tuto skupinu zatím nejsou načteny žádné týmy.",
        goldenBoot: "Souboj o Zlatou kopačku",
        noPlayerStats: "Zatím nejsou načteny žádné statistiky hráčů.",
        knockoutBracket: "Vyřazovací pavouk",
        fixturesNotAvailable: "Zápasy zatím nejsou dostupné",
        highestMatchGoals: "Nejvíce gólů v zápase",
        biggestMargin: "Největší rozdíl",
        topTeamGoals: "Nejvíce gólů týmu",
        bestDefenceGA: "Nejlepší obrana",
        highestScoringMatch: "Nejgólovější zápas",
        biggestWin: "Nejvyšší výhra",
        topScoringTeam: "Nejproduktivnější tým",
        bestDefence: "Nejlepší obrana",
        noResult: "Zatím žádný výsledek.",
        noTeamGoalData: "Zatím žádná data o gólech týmů.",
        noDefensiveData: "Zatím žádná obranná data.",
        matchesPlayed: "Odehrané zápasy",
        yellowCards: "Žluté karty",
        redCards: "Červené karty",
        minutes: "Minuty",
        goalsPerMatch: "Góly / zápas",
        draws: "Remízy",
        drawRate: "Míra remíz",
        bttsRate: "Míra obou týmů skóruje",
        over25Rate: "Míra nad 2,5",
        stadiums: "Stadiony",
        usaVenues: "Stadiony USA",
        canadaVenues: "Stadiony Kanady",
        mexicoVenues: "Stadiony Mexika",
        finalVenue: "Stadion finále",
        capacity: "Kapacita",
        worldCupStadiums: "Stadiony mistrovství světa",
        noVenueData: "Nejsou dostupná data stadionů.",
        scheduled: "Naplánováno",
        liveStatus: "Živě",
        manualTimerNotice: 'Živé skóre se aktualizuje automaticky. Časy gólů používají ruční zápasové hodiny a mohou se o několik minut lišit od oficiálních časů.',
        paused: "Přestávka",
        fullTime: "Konec zápasu",
        aet: "Po prodloužení",
        penalties: "Penalty",
        postponed: "Odloženo",
        groupStage: "Skupinová fáze",
        round32: "Kolo 32",
        round16: "Osmifinále",
        quarterFinals: "Čtvrtfinále",
        semiFinals: "Semifinále",
        thirdPlace: "Třetí místo",
        final: "Finále",
        tbc: "Bude upřesněno",
        unknown: "Neznámé",
        pos: "Poz.",
        team: "Tým",
        player: "Hráč",
        goals: "Góly",
        assists: "Asistence",
        language: "Jazyk panelu",
        pcView: "Zobrazen? PC",
        tabletView: "Zobrazen? tabletu",
        viewMode: "Zobrazen? panelu",
        controlCentre: "Mistrovství světa FIFA 2026 - Control Centre",
        overviewSubtitle: "Živý turnajový panel se zápasy, výsledky, skupinami, statistikami hráčů, stadiony, rekordy a vyřazovací částí na jednom místě.",
        tournamentIntelligence: "Statistiky",
        goldenBootCentre: "Souboj o Zlatou kopačku",
        leaderSpotlight: "Nejlepší střelec",
        playersTracked: "Zlatá kopačka",
        totalAssists: "Asistence",
        totalYellowCards: "Žluté karty",
        totalRedCards: "Červené karty",
        upNext: "Další zápas",
        matchSpotlight: "Další zápas",
        upcomingFixtures: "Zápasy",
        latest: "Aktualizováno",
        recentResults: "Výsledky",
        playerWatch: "Zlatá kopačka",
        fixturesSubtitle: "Zápasy a výsledky",
        days: "Dny",
        versus: "v",
        supportersNav: "🙏 Podporovatelé",
        supportersThankYouTitle: "🙏 Podporovatelé a poděkování",
        supportersIntro: "Tento projekt začal jako osobní panel Home Assistant a vyrostl díky zpětné vazbě, testování, nápadům a podpoře komunity.",
        supportersSpecialThanks: "Zvláštní poděkování všem, kteří podpořili vývoj integrace World Cup 2026.",
        supportersTitle: "🍺 Podporovatelé",
        latestSupporters: "⭐ Nejnovější podporovatelé",
        allSupporters: "🌍 Všichni podporovatelé",
        supporterDefaultMessage: "Děkujeme za podporu vývoje.",
        anonymousSupporter: "Anonymní podporovatel",
        noSupporters: "Zatím nejsou přidáni žádní podporovatelé. Buďte první, kdo mi koupí pivo a nechá zde zobrazit své jméno.",
        wantNameAdded: "Chcete sem přidat své jméno?",
        supportFutureUpdates: "Podpořte budoucí aktualizace, opravy chyb a nové funkce mistrovství světa.",
        supporterBeerMessage: "🍺 Chcete své jméno na stránce podporovatelů? Kupte mi pivo přes PayPal a vaše jméno může být přidáno do seznamu podporovatelů World Cup 2026 jako poděkování za podporu vývoje.",
        donateBuyBeer: "🍺 Přispět / Koupit mi pivo",
        enjoyingIntegration: "🍺 Líbí se vám tato integrace?",
        supportIntegration: "Podpořit tuto integraci",
        source: "Zdroj",
        totalSupporters: "Celkem podporovatelů",
        countries: "Země",
        countriesSupporting: "Podporující země",
        latestSupportDate: "Datum poslední podpory",
        playedShort: "Z",
        winsShort: "V",
        drawsShort: "R",
        lossesShort: "P",
        goalsForShort: "VG",
        goalsAgainstShort: "OG",
        goalDifferenceShort: "RG",
        pointsShort: "Body",
        noResultsLoaded: "Zatím nejsou načteny žádné výsledky.",
        finishedMatchesSubtitle: "Dokončené zápasy a potvrzené skóre.",
        goldenBootAutoText: "Automatická data Zlaté kopačky se zobrazí, jakmile football-data.org zveřejní data střelců mistrovství světa.",
        realStadium: "Skutečný stadion",
        matchesHosted: "Pořádané zápasy",
        communitySupport: "Podpora komunity",
        supportersAroundWorld: "Podporovatelé z celého světa",
        noLiveGames: "Žádné živé zápasy",
        noGamesToday: "Dnes nejsou žádné zápasy",
        conceded: "inkasováno",
      },

      da: {
        title: "FIFA Verdensmesterskabet 2026",
        subtitle: "Dedikeret turneringsapp til Home Assistant",
        back: "← Tilbage",
        updated: "Opdateret",
        loading: "Indlæser World Cup 2026...",
        errorTitle: "Verdensmesterskabet 2026",
        errorText: "Kunne ikke indlæse appdata.",
        overview: "Overblik",

        teams: "Hold",
        live: "Livecenter",
        fixtures: "Kampe",
        results: "Resultater",
        groups: "Grupper",
        knockout: "Knockoutfase",
        players: "Den Gyldne Støvle",
        records: "Rekorder",
        stats: "Statistik",
        venues: "Stadioner",
        totalMatches: "Kampe i alt",
        loaded: "Indlæst",
        played: "Spillet",
        remaining: "Tilbage",
        liveNow: "Live nu",
        totalGoals: "Mål i alt",
        nextMatch: "Næste kamp",
        tournamentStatus: "Turneringsstatus",
        demoMode: "Demotilstand",
        on: "Til",
        off: "Fra",
        lastUpdate: "Sidste opdatering",
        ok: "OK",
        failed: "Mislykket",
        progress: "Fremskridt",
        topScorer: "Topscorer",
        notAvailable: "Ikke tilgængelig",
        noUpcomingMatch: "Ingen kommende kamp indlæst.",
        noLiveMatches: "Ingen kampe live lige nu.",
        fixturesResults: "Kampe og resultater",
        noFixtures: "Ingen kampe indlæst endnu.",
        groupLabel: "Gruppe",
        groupsAL: "Grupper A-L",
        noGroups: "Ingen gruppestillinger indlæst endnu.",
        noTeamsGroup: "Ingen hold indlæst for denne gruppe endnu.",
        goldenBoot: "Golden Boot-race",
        noPlayerStats: "Ingen spillerstatistik indlæst endnu.",
        knockoutBracket: "Knockout-plan",
        fixturesNotAvailable: "Kampe er ikke tilgængelige endnu",
        highestMatchGoals: "Flest mål i en kamp",
        biggestMargin: "Største margen",
        topTeamGoals: "Flest holdmål",
        bestDefenceGA: "Bedste forsvar",
        highestScoringMatch: "Mest målrige kamp",
        biggestWin: "Største sejr",
        topScoringTeam: "Mest scorende hold",
        bestDefence: "Bedste forsvar",
        noResult: "Intet resultat endnu.",
        noTeamGoalData: "Ingen holdmåldata endnu.",
        noDefensiveData: "Ingen forsvarsdata endnu.",
        matchesPlayed: "Spillede kampe",
        yellowCards: "Gule kort",
        redCards: "Røde kort",
        minutes: "Minutter",
        goalsPerMatch: "Mål / kamp",
        draws: "Uafgjorte",
        drawRate: "Uafgjort-rate",
        bttsRate: "Begge hold scorer-rate",
        over25Rate: "Over 2,5-rate",
        stadiums: "Stadioner",
        usaVenues: "USA-stadioner",
        canadaVenues: "Canada-stadioner",
        mexicoVenues: "Mexico-stadioner",
        finalVenue: "Finalestadion",
        capacity: "Kapacitet",
        worldCupStadiums: "VM-stadioner",
        noVenueData: "Ingen stadiondata.",
        scheduled: "Planlagt",
        liveStatus: "Direkte",
        manualTimerNotice: 'Live scores opdateres automatisk. Måltider bruger det manuelle kampur og kan afvige nogle minutter fra de officielle tider.',
        paused: "Pause",
        fullTime: "Fuld tid",
        aet: "Efter forlænget spilletid",
        penalties: "Straffe",
        postponed: "Udsat",
        groupStage: "Gruppespil",
        round32: "Runde af 32",
        round16: "Ottendedelsfinale",
        quarterFinals: "Kvartfinale",
        semiFinals: "Semifinale",
        thirdPlace: "Tredjeplads",
        final: "Finale",
        tbc: "Afventer",
        unknown: "Ukendt",
        pos: "Pos",
        team: "Hold",
        player: "Spiller",
        goals: "Mål",
        assists: "Assists",
        language: "Dashboard-sprog",
        pcView: "PC-visning",
        tabletView: "Tabletvisning",
        viewMode: "Dashboardvisning",
        controlCentre: "FIFA World Cup 2026 - Control Centre",
        overviewSubtitle: "Live turneringsdashboard med kampe, resultater, grupper, spillerstatistik, stadioner, rekorder og knockout-overblik samlet ét sted.",
        tournamentIntelligence: "Statistik",
        goldenBootCentre: "Golden Boot-race",
        leaderSpotlight: "Topscorer",
        playersTracked: "Den Gyldne Støvle",
        totalAssists: "Assists",
        totalYellowCards: "Gule kort",
        totalRedCards: "Røde kort",
        upNext: "Næste kamp",
        matchSpotlight: "Næste kamp",
        upcomingFixtures: "Kampe",
        latest: "Opdateret",
        recentResults: "Resultater",
        playerWatch: "Den Gyldne Støvle",
        fixturesSubtitle: "Kampe og resultater",
        days: "Dage",
        versus: "mod",
        supportersNav: "🙏 Støtter",
        supportersThankYouTitle: "🙏 Støtter og tak",
        supportersIntro: "Dette projekt startede som et personligt Home Assistant-dashboard og er vokset takket være feedback, test, ideer og støtte fra fællesskabet.",
        supportersSpecialThanks: "Særlig tak til alle, der har støttet udviklingen af World Cup 2026-integrationen.",
        supportersTitle: "🍺 Støtter",
        latestSupporters: "⭐ Seneste støtter",
        allSupporters: "🌍 Alle støtter",
        supporterDefaultMessage: "Tak fordi du støtter udviklingen.",
        anonymousSupporter: "Anonym støtte",
        noSupporters: "Ingen støtter tilføjet endnu. Vær den første til at købe mig en øl og få dit navn vist her.",
        wantNameAdded: "Vil du have dit navn tilføjet her?",
        supportFutureUpdates: "Støt fremtidige opdateringer, fejlrettelser og nye World Cup-funktioner.",
        supporterBeerMessage: "🍺 Vil du have dit navn vist på støttesiden? Køb mig en øl via PayPal, og dit navn kan føjes til World Cup 2026-støttelisten som tak for din støtte til udviklingen.",
        donateBuyBeer: "🍺 Donér / Køb mig en øl",
        enjoyingIntegration: "🍺 Nyder du denne integration?",
        supportIntegration: "Støt denne integration",
        source: "Kilde",
        totalSupporters: "Støtter i alt",
        countries: "Lande",
        countriesSupporting: "Støttende lande",
        latestSupportDate: "Seneste støttedato",
        playedShort: "K",
        winsShort: "V",
        drawsShort: "U",
        lossesShort: "T",
        goalsForShort: "MF",
        goalsAgainstShort: "MI",
        goalDifferenceShort: "MD",
        pointsShort: "P",
        noResultsLoaded: "Ingen resultater indlæst endnu.",
        finishedMatchesSubtitle: "Afsluttede kampe og bekræftede resultater.",
        goldenBootAutoText: "Automatiske Guldstøvle-data vises, når football-data.org offentliggør World Cup-målscorerdata.",
        realStadium: "Rigtigt stadion",
        matchesHosted: "Kampe afholdt",
        communitySupport: "Fællesskabsstøtte",
        supportersAroundWorld: "Støtter over hele verden",
        noLiveGames: "Ingen livekampe",
        noGamesToday: "Ingen kampe i dag",
        conceded: "indkasseret",
      },

      fi: {
        title: "FIFA:n maailmanmestaruuskilpailut 2026",
        subtitle: "Home Assistantin turnaussovellus",
        back: "← Takaisin",
        updated: "Päivitetty",
        loading: "Ladataan World Cup 2026...",
        errorTitle: "Maailmanmestaruuskilpailut 2026",
        errorText: "Sovelluksen tietoja ei voitu ladata.",
        overview: "Yleiskatsaus",

        teams: "Joukkueet",
        live: "Live-keskus",
        fixtures: "Ottelut",
        results: "Tulokset",
        groups: "Lohkot",
        knockout: "Pudotuspelit",
        players: "Kultainen kenkä",
        records: "Ennätykset",
        stats: "Tilastot",
        venues: "Stadionit",
        totalMatches: "Ottelut yhteensä",
        loaded: "Ladattu",
        played: "Pelattu",
        remaining: "Jäljellä",
        liveNow: "Live nyt",
        totalGoals: "Maalit yhteensä",
        nextMatch: "Seuraava ottelu",
        tournamentStatus: "Turnauksen tila",
        demoMode: "Demotila",
        on: "Päällä",
        off: "Pois",
        lastUpdate: "Viimeisin päivitys",
        ok: "OK",
        failed: "Epäonnistui",
        progress: "Edistyminen",
        topScorer: "Paras maalintekijä",
        notAvailable: "Ei saatavilla",
        noUpcomingMatch: "Tulevaa ottelua ei ole ladattu.",
        noLiveMatches: "Otteluita ei ole juuri nyt livenä.",
        fixturesResults: "Ottelut ja tulokset",
        noFixtures: "Otteluita ei ole vielä ladattu.",
        groupLabel: "Lohko",
        groupsAL: "Lohkot A-L",
        noGroups: "Lohkotaulukoita ei ole vielä ladattu.",
        noTeamsGroup: "Tähän lohkoon ei ole vielä ladattu joukkueita.",
        goldenBoot: "Kultaisen kengän kilpailu",
        noPlayerStats: "Pelaajatilastoja ei ole vielä ladattu.",
        knockoutBracket: "Pudotuspelikaavio",
        fixturesNotAvailable: "Ottelut eivät ole vielä saatavilla",
        highestMatchGoals: "Eniten maaleja ottelussa",
        biggestMargin: "Suurin ero",
        topTeamGoals: "Eniten joukkueen maaleja",
        bestDefenceGA: "Paras puolustus",
        highestScoringMatch: "Maalirikkain ottelu",
        biggestWin: "Suurin voitto",
        topScoringTeam: "Eniten maaleja tehnyt joukkue",
        bestDefence: "Paras puolustus",
        noResult: "Ei vielä tulosta.",
        noTeamGoalData: "Joukkueiden maalitietoja ei vielä ole.",
        noDefensiveData: "Puolustustietoja ei vielä ole.",
        matchesPlayed: "Pelatut ottelut",
        yellowCards: "Keltaiset kortit",
        redCards: "Punaiset kortit",
        minutes: "Minuutit",
        goalsPerMatch: "Maalit / ottelu",
        draws: "Tasapelit",
        drawRate: "Tasapeliprosentti",
        bttsRate: "Molemmat tekevät maalin -prosentti",
        over25Rate: "Yli 2,5 -prosentti",
        stadiums: "Stadionit",
        usaVenues: "USA:n stadionit",
        canadaVenues: "Kanadan stadionit",
        mexicoVenues: "Meksikon stadionit",
        finalVenue: "Finaalistadion",
        capacity: "Kapasiteetti",
        worldCupStadiums: "MM-stadionit",
        noVenueData: "Stadiontietoja ei ole.",
        scheduled: "Aikataulutettu",
        liveStatus: "Live",
        manualTimerNotice: 'Live-tulokset päivittyvät automaattisesti. Maalien ajat käyttävät manuaalista ottelukelloa ja voivat poiketa virallisista ajoista muutamalla minuutilla.',
        paused: "Tauko",
        fullTime: "Täysi aika",
        aet: "Jatkoajan jälkeen",
        penalties: "Rangaistuspotkut",
        postponed: "Siirretty",
        groupStage: "Lohkovaihe",
        round32: "32 parhaan kierros",
        round16: "Neljännesvälierät",
        quarterFinals: "Puolivälierät",
        semiFinals: "Välierät",
        thirdPlace: "Kolmas sija",
        final: "Finaali",
        tbc: "Vahvistamatta",
        unknown: "Tuntematon",
        pos: "Sija",
        team: "Joukkue",
        player: "Pelaaja",
        goals: "Maalit",
        assists: "Syötöt",
        language: "Kojelaudan kieli",
        pcView: "PC-n?kym?",
        tabletView: "Tablettin?kym?",
        viewMode: "Kojelaudan n?kym?",
        controlCentre: "FIFA World Cup 2026 - Control Centre",
        overviewSubtitle: "Live-turnauspaneeli, jossa ottelut, tulokset, lohkot, pelaajatilastot, stadionit, ennätykset ja pudotuspeliseuranta ovat yhdessä paikassa.",
        tournamentIntelligence: "Tilastot",
        goldenBootCentre: "Kultaisen kengän kilpailu",
        leaderSpotlight: "Paras maalintekijä",
        playersTracked: "Kultainen kenkä",
        totalAssists: "Syötöt",
        totalYellowCards: "Keltaiset kortit",
        totalRedCards: "Punaiset kortit",
        upNext: "Seuraava ottelu",
        matchSpotlight: "Seuraava ottelu",
        upcomingFixtures: "Ottelut",
        latest: "Päivitetty",
        recentResults: "Tulokset",
        playerWatch: "Kultainen kenkä",
        fixturesSubtitle: "Ottelut ja tulokset",
        days: "Päivää",
        versus: "v",
        supportersNav: "🙏 Tukijat",
        supportersThankYouTitle: "🙏 Tukijat ja kiitokset",
        supportersIntro: "Tämä projekti alkoi henkilökohtaisena Home Assistant -paneelina ja on kasvanut yhteisön palautteen, testauksen, ideoiden ja tuen ansiosta.",
        supportersSpecialThanks: "Erityiskiitos kaikille, jotka ovat tukeneet World Cup 2026 -integraation kehitystä.",
        supportersTitle: "🍺 Tukijat",
        latestSupporters: "⭐ Uusimmat tukijat",
        allSupporters: "🌍 Kaikki tukijat",
        supporterDefaultMessage: "Kiitos kehityksen tukemisesta.",
        anonymousSupporter: "Anonyymi tukija",
        noSupporters: "Tukijoita ei ole vielä lisätty. Ole ensimmäinen, joka tarjoaa oluen ja saa nimensä tänne.",
        wantNameAdded: "Haluatko nimesi lisättävän tänne?",
        supportFutureUpdates: "Tue tulevia päivityksiä, virhekorjauksia ja uusia MM-ominaisuuksia.",
        supporterBeerMessage: "🍺 Haluatko nimesi tukijasivulle? Tarjoa minulle olut PayPalin kautta, niin nimesi voidaan lisätä World Cup 2026 -tukijalistalle kiitokseksi kehityksen tukemisesta.",
        donateBuyBeer: "🍺 Lahjoita / Tarjoa olut",
        enjoyingIntegration: "🍺 Pidätkö tästä integraatiosta?",
        supportIntegration: "Tue tätä integraatiota",
        source: "Lähde",
        totalSupporters: "Tukijoita yhteensä",
        countries: "Maat",
        countriesSupporting: "Tukevat maat",
        latestSupportDate: "Viimeisin tukipäivä",
        playedShort: "O",
        winsShort: "V",
        drawsShort: "T",
        lossesShort: "H",
        goalsForShort: "TM",
        goalsAgainstShort: "PM",
        goalDifferenceShort: "ME",
        pointsShort: "P",
        noResultsLoaded: "Tuloksia ei ole vielä ladattu.",
        finishedMatchesSubtitle: "Päättyneet ottelut ja vahvistetut tulokset.",
        goldenBootAutoText: "Automaattiset Kultainen kenkä -tiedot näkyvät, kun football-data.org julkaisee MM-kisojen maalintekijätiedot.",
        realStadium: "Todellinen stadion",
        matchesHosted: "Isännöidyt ottelut",
        communitySupport: "Yhteisön tuki",
        supportersAroundWorld: "Tukijat ympäri maailmaa",
        noLiveGames: "Ei live-otteluita",
        noGamesToday: "Ei otteluita tänään",
        conceded: "päästetty",
      },

      el: {
        title: "Παγκόσμιο Κύπελλο FIFA 2026",
        subtitle: "Εφαρμογή τουρνουά για το Home Assistant",
        back: "← Πίσω",
        updated: "Ενημερώθηκε",
        loading: "Φόρτωση Παγκοσμίου Κυπέλλου 2026...",
        errorTitle: "Παγκόσμιο Κύπελλο 2026",
        errorText: "Δεν ήταν δυνατή η φόρτωση δεδομένων.",
        overview: "Επισκόπηση",

        teams: "??????",
        live: "Ζωντανό Κέντρο",
        fixtures: "Αγώνες",
        results: "Αποτελέσματα",
        groups: "Όμιλοι",
        knockout: "Νοκ άουτ",
        players: "Χρυσό Παπούτσι",
        records: "Ρεκόρ",
        stats: "Στατιστικά",
        venues: "Στάδια",
        totalMatches: "Σύνολο αγώνων",
        loaded: "Φορτώθηκαν",
        played: "Παίχτηκαν",
        remaining: "Απομένουν",
        liveNow: "Ζωντανά τώρα",
        totalGoals: "Σύνολο γκολ",
        nextMatch: "Επόμενος αγώνας",
        tournamentStatus: "Κατάσταση τουρνουά",
        demoMode: "Λειτουργία demo",
        on: "Ενεργό",
        off: "Ανενεργό",
        lastUpdate: "Τελευταία ενημέρωση",
        ok: "OK",
        failed: "Απέτυχε",
        progress: "Πρόοδος",
        topScorer: "Πρώτος σκόρερ",
        notAvailable: "Μη διαθέσιμο",
        noUpcomingMatch: "Δεν έχει φορτωθεί επόμενος αγώνας.",
        noLiveMatches: "Δεν υπάρχουν ζωντανοί αγώνες αυτή τη στιγμή.",
        fixturesResults: "Αγώνες και αποτελέσματα",
        noFixtures: "Δεν έχουν φορτωθεί ακόμα αγώνες.",
        groupLabel: "Όμιλος",
        groupsAL: "Όμιλοι A-L",
        noGroups: "Δεν έχουν φορτωθεί ακόμα βαθμολογίες ομίλων.",
        noTeamsGroup: "Δεν έχουν φορτωθεί ακόμα ομάδες για αυτόν τον όμιλο.",
        goldenBoot: "Κούρσα Χρυσού Παπουτσιού",
        noPlayerStats: "Δεν έχουν φορτωθεί ακόμα στατιστικά παικτών.",
        knockoutBracket: "Ταμπλό νοκ άουτ",
        fixturesNotAvailable: "Οι αγώνες δεν είναι ακόμη διαθέσιμοι",
        highestMatchGoals: "Περισσότερα γκολ σε αγώνα",
        biggestMargin: "Μεγαλύτερη διαφορά",
        topTeamGoals: "Περισσότερα γκολ ομάδας",
        bestDefenceGA: "Καλύτερη άμυνα",
        highestScoringMatch: "Αγώνας με τα περισσότερα γκολ",
        biggestWin: "Μεγαλύτερη νίκη",
        topScoringTeam: "Πιο παραγωγική ομάδα",
        bestDefence: "Καλύτερη άμυνα",
        noResult: "Δεν υπάρχει ακόμα αποτέλεσμα.",
        noTeamGoalData: "Δεν υπάρχουν ακόμα δεδομένα γκολ ομάδων.",
        noDefensiveData: "Δεν υπάρχουν ακόμα αμυντικά δεδομένα.",
        matchesPlayed: "Αγώνες που παίχτηκαν",
        yellowCards: "Κίτρινες κάρτες",
        redCards: "Κόκκινες κάρτες",
        minutes: "Λεπτά",
        goalsPerMatch: "Γκολ / αγώνα",
        draws: "Ισοπαλίες",
        drawRate: "Ποσοστό ισοπαλιών",
        bttsRate: "Ποσοστό σκοράρουν και οι δύο",
        over25Rate: "Ποσοστό άνω των 2,5",
        stadiums: "Στάδια",
        usaVenues: "Στάδια ΗΠΑ",
        canadaVenues: "Στάδια Καναδά",
        mexicoVenues: "Στάδια Μεξικού",
        finalVenue: "Στάδιο τελικού",
        capacity: "Χωρητικότητα",
        worldCupStadiums: "Στάδια Παγκοσμίου Κυπέλλου",
        noVenueData: "Δεν υπάρχουν δεδομένα σταδίων.",
        scheduled: "Προγραμματισμένο",
        liveStatus: "Ζωντανά",
        manualTimerNotice: 'Τα ζωντανά σκορ ενημερώνονται αυτόματα. Οι χρόνοι των γκολ χρησιμοποιούν το χειροκίνητο ρολόι αγώνα και μπορεί να διαφέρουν λίγα λεπτά από τους επίσημους χρόνους.',
        paused: "Παύση",
        fullTime: "Λήξη",
        aet: "Μετά την παράταση",
        penalties: "Πέναλτι",
        postponed: "Αναβλήθηκε",
        groupStage: "Φάση ομίλων",
        round32: "Γύρος των 32",
        round16: "Γύρος των 16",
        quarterFinals: "Προημιτελικά",
        semiFinals: "Ημιτελικά",
        thirdPlace: "Τρίτη θέση",
        final: "Τελικός",
        tbc: "Θα επιβεβαιωθεί",
        unknown: "Άγνωστο",
        pos: "Θέση",
        team: "Ομάδα",
        player: "Παίκτης",
        goals: "Γκολ",
        assists: "Ασίστ",
        language: "Γλώσσα πίνακα",
        pcView: "??????? PC",
        tabletView: "??????? tablet",
        viewMode: "??????? ?????? ???????",
        controlCentre: "Κέντρο ελέγχου Παγκοσμίου Κυπέλλου 2026",
        overviewSubtitle: "Ζωντανός πίνακας τουρνουά με αγώνες, αποτελέσματα, ομίλους, στατιστικά παικτών, στάδια, ρεκόρ και νοκ άουτ σε ένα μέρος.",
        tournamentIntelligence: "Στατιστικά",
        goldenBootCentre: "Κούρσα Χρυσού Παπουτσιού",
        leaderSpotlight: "Πρώτος σκόρερ",
        playersTracked: "Χρυσό Παπούτσι",
        totalAssists: "Ασίστ",
        totalYellowCards: "Κίτρινες κάρτες",
        totalRedCards: "Κόκκινες κάρτες",
        upNext: "Επόμενος αγώνας",
        matchSpotlight: "Επόμενος αγώνας",
        upcomingFixtures: "Αγώνες",
        latest: "Ενημερώθηκε",
        recentResults: "Αποτελέσματα",
        playerWatch: "Χρυσό Παπούτσι",
        fixturesSubtitle: "Αγώνες και αποτελέσματα",
        days: "Ημέρες",
        versus: "v",
        supportersNav: "🙏 Υποστηρικτές",
        supportersThankYouTitle: "🙏 Υποστηρικτές και ευχαριστίες",
        supportersIntro: "Αυτό το έργο ξεκίνησε ως προσωπικός πίνακας Home Assistant και μεγάλωσε χάρη σε σχόλια, δοκιμές, ιδέες και υποστήριξη της κοινότητας.",
        supportersSpecialThanks: "Ιδιαίτερες ευχαριστίες σε όλους όσους υποστήριξαν την ανάπτυξη της ενσωμάτωσης World Cup 2026.",
        supportersTitle: "🍺 Υποστηρικτές",
        latestSupporters: "⭐ Νεότεροι υποστηρικτές",
        allSupporters: "🌍 Όλοι οι υποστηρικτές",
        supporterDefaultMessage: "Ευχαριστούμε για την υποστήριξη της ανάπτυξης.",
        anonymousSupporter: "Ανώνυμος υποστηρικτής",
        noSupporters: "Δεν έχουν προστεθεί ακόμη υποστηρικτές. Γίνετε ο πρώτος που θα κεράσει μια μπύρα και θα εμφανιστεί εδώ το όνομά του.",
        wantNameAdded: "Θέλετε να προστεθεί το όνομά σας εδώ;",
        supportFutureUpdates: "Υποστηρίξτε μελλοντικές ενημερώσεις, διορθώσεις σφαλμάτων και νέες λειτουργίες του Μουντιάλ.",
        supporterBeerMessage: "🍺 Θέλετε το όνομά σας στη σελίδα υποστηρικτών; Κεράστε μου μια μπύρα μέσω PayPal και το όνομά σας μπορεί να προστεθεί στη λίστα υποστηρικτών World Cup 2026 ως ευχαριστώ για την υποστήριξη.",
        donateBuyBeer: "🍺 Δωρεά / Κεράστε μια μπύρα",
        enjoyingIntegration: "🍺 Σας αρέσει αυτή η ενσωμάτωση;",
        supportIntegration: "Υποστηρίξτε αυτή την ενσωμάτωση",
        source: "Πηγή",
        totalSupporters: "Σύνολο υποστηρικτών",
        countries: "Χώρες",
        countriesSupporting: "Χώρες υποστήριξης",
        latestSupportDate: "Τελευταία ημερομηνία υποστήριξης",
        playedShort: "Α",
        winsShort: "Ν",
        drawsShort: "Ι",
        lossesShort: "Η",
        goalsForShort: "ΥΓ",
        goalsAgainstShort: "ΚΓ",
        goalDifferenceShort: "ΔΓ",
        pointsShort: "Β",
        noResultsLoaded: "Δεν έχουν φορτωθεί ακόμα αποτελέσματα.",
        finishedMatchesSubtitle: "Ολοκληρωμένοι αγώνες και επιβεβαιωμένα σκορ.",
        goldenBootAutoText: "Τα αυτόματα δεδομένα του Χρυσού Παπουτσιού θα εμφανιστούν όταν το football-data.org δημοσιεύσει τα δεδομένα σκόρερ του Παγκοσμίου Κυπέλλου.",
        realStadium: "Πραγματικό στάδιο",
        matchesHosted: "Αγώνες που φιλοξενήθηκαν",
        communitySupport: "Υποστήριξη κοινότητας",
        supportersAroundWorld: "Υποστηρικτές σε όλο τον κόσμο",
        noLiveGames: "Δεν υπάρχουν ζωντανοί αγώνες",
        noGamesToday: "Δεν υπάρχουν αγώνες σήμερα",
        conceded: "παθητικό",
      },

      ro: {
        title: "Cupa Mondială FIFA 2026",
        subtitle: "Aplicație dedicată turneului pentru Home Assistant",
        back: "← Înapoi",
        updated: "Actualizat",
        loading: "Se încarcă Cupa Mondială 2026...",
        errorTitle: "Cupa Mondială 2026",
        errorText: "Datele aplicației nu au putut fi încărcate.",
        overview: "Prezentare",

        teams: "Echipe",
        live: "Centru live",
        fixtures: "Meciuri",
        results: "Rezultate",
        groups: "Grupe",
        knockout: "Eliminatorii",
        players: "Gheata de Aur",
        records: "Recorduri",
        stats: "Statistici",
        venues: "Stadioane",
        totalMatches: "Total meciuri",
        loaded: "Încărcate",
        played: "Jucate",
        remaining: "Rămase",
        liveNow: "Live acum",
        totalGoals: "Total goluri",
        nextMatch: "Următorul meci",
        tournamentStatus: "Starea turneului",
        demoMode: "Mod demo",
        on: "Pornit",
        off: "Oprit",
        lastUpdate: "Ultima actualizare",
        ok: "OK",
        failed: "Eșuat",
        progress: "Progres",
        topScorer: "Golgeter",
        notAvailable: "Indisponibil",
        noUpcomingMatch: "Nu este încărcat niciun meci viitor.",
        noLiveMatches: "Nu sunt meciuri live acum.",
        fixturesResults: "Meciuri și rezultate",
        noFixtures: "Nu sunt meciuri încărcate încă.",
        groupLabel: "Grupă",
        groupsAL: "Grupele A-L",
        noGroups: "Nu sunt clasamente de grupe încărcate încă.",
        noTeamsGroup: "Nu sunt echipe încărcate încă pentru această grupă.",
        goldenBoot: "Cursa pentru Gheata de Aur",
        noPlayerStats: "Nu sunt statistici de jucători încărcate încă.",
        knockoutBracket: "Tablou eliminatoriu",
        fixturesNotAvailable: "Meciurile nu sunt încă disponibile",
        highestMatchGoals: "Cele mai multe goluri într-un meci",
        biggestMargin: "Cea mai mare diferență",
        topTeamGoals: "Cele mai multe goluri ale unei echipe",
        bestDefenceGA: "Cea mai bună apărare",
        highestScoringMatch: "Meciul cu cele mai multe goluri",
        biggestWin: "Cea mai mare victorie",
        topScoringTeam: "Echipa cu cele mai multe goluri",
        bestDefence: "Cea mai bună apărare",
        noResult: "Încă nu există rezultat.",
        noTeamGoalData: "Nu există încă date despre golurile echipelor.",
        noDefensiveData: "Nu există încă date defensive.",
        matchesPlayed: "Meciuri jucate",
        yellowCards: "Cartonașe galbene",
        redCards: "Cartonașe roșii",
        minutes: "Minute",
        goalsPerMatch: "Goluri / meci",
        draws: "Egaluri",
        drawRate: "Rata egalurilor",
        bttsRate: "Rata ambelor marchează",
        over25Rate: "Rata peste 2,5",
        stadiums: "Stadioane",
        usaVenues: "Stadioane SUA",
        canadaVenues: "Stadioane Canada",
        mexicoVenues: "Stadioane Mexic",
        finalVenue: "Stadionul finalei",
        capacity: "Capacitate",
        worldCupStadiums: "Stadioanele Cupei Mondiale",
        noVenueData: "Nu există date despre stadioane.",
        scheduled: "Programat",
        liveStatus: "Live",
        manualTimerNotice: 'Scorurile live se actualizează automat. Minutele golurilor folosesc ceasul manual al meciului și pot diferi cu câteva minute de cele oficiale.',
        paused: "Pauză",
        fullTime: "Final",
        aet: "După prelungiri",
        penalties: "Penalty-uri",
        postponed: "Amânat",
        groupStage: "Faza grupelor",
        round32: "Șaisprezecimi",
        round16: "Optimi",
        quarterFinals: "Sferturi",
        semiFinals: "Semifinale",
        thirdPlace: "Locul trei",
        final: "Finală",
        tbc: "De confirmat",
        unknown: "Necunoscut",
        pos: "Poz",
        team: "Echipă",
        player: "Jucător",
        goals: "Goluri",
        assists: "Assisturi",
        language: "Limba panoului",
        pcView: "Vizualizare PC",
        tabletView: "Vizualizare tablet?",
        viewMode: "Vizualizare panou",
        controlCentre: "Cupa Mondială FIFA 2026 - Control Centre",
        overviewSubtitle: "Panou live al turneului cu meciuri, rezultate, grupe, statistici ale jucătorilor, stadioane, recorduri și faza eliminatorie într-un singur loc.",
        tournamentIntelligence: "Statistici",
        goldenBootCentre: "Cursa pentru Gheata de Aur",
        leaderSpotlight: "Golgeter",
        playersTracked: "Gheata de Aur",
        totalAssists: "Assisturi",
        totalYellowCards: "Cartonașe galbene",
        totalRedCards: "Cartonașe roșii",
        upNext: "Următorul meci",
        matchSpotlight: "Următorul meci",
        upcomingFixtures: "Meciuri",
        latest: "Actualizat",
        recentResults: "Rezultate",
        playerWatch: "Gheata de Aur",
        fixturesSubtitle: "Meciuri și rezultate",
        days: "Zile",
        versus: "v",
        supportersNav: "🙏 Susținători",
        supportersThankYouTitle: "🙏 Susținători și mulțumiri",
        supportersIntro: "Acest proiect a început ca un panou personal Home Assistant și a crescut datorită feedbackului, testării, ideilor și sprijinului comunității.",
        supportersSpecialThanks: "Mulțumiri speciale tuturor celor care au susținut dezvoltarea integrării World Cup 2026.",
        supportersTitle: "🍺 Susținători",
        latestSupporters: "⭐ Susținători recenți",
        allSupporters: "🌍 Toți susținătorii",
        supporterDefaultMessage: "Mulțumim pentru sprijinirea dezvoltării.",
        anonymousSupporter: "Susținător anonim",
        noSupporters: "Nu au fost adăugați încă susținători. Fii primul care îmi cumpără o bere și își afișează numele aici.",
        wantNameAdded: "Vrei să îți adaugi numele aici?",
        supportFutureUpdates: "Susține actualizări viitoare, corecturi de erori și noi funcții pentru Cupa Mondială.",
        supporterBeerMessage: "🍺 Vrei ca numele tău să apară pe pagina susținătorilor? Cumpără-mi o bere prin PayPal și numele tău poate fi adăugat în lista susținătorilor World Cup 2026 ca mulțumire pentru sprijin.",
        donateBuyBeer: "🍺 Donează / Cumpără-mi o bere",
        enjoyingIntegration: "🍺 Îți place această integrare?",
        supportIntegration: "Susține această integrare",
        source: "Sursă",
        totalSupporters: "Total susținători",
        countries: "Țări",
        countriesSupporting: "Țări susținătoare",
        latestSupportDate: "Ultima dată de susținere",
        playedShort: "J",
        winsShort: "V",
        drawsShort: "E",
        lossesShort: "Î",
        goalsForShort: "GM",
        goalsAgainstShort: "GP",
        goalDifferenceShort: "DG",
        pointsShort: "Pct",
        noResultsLoaded: "Nu sunt rezultate încărcate încă.",
        finishedMatchesSubtitle: "Meciuri încheiate și scoruri confirmate.",
        goldenBootAutoText: "Datele automate pentru Gheata de Aur vor apărea când football-data.org publică datele marcatorilor Cupei Mondiale.",
        realStadium: "Stadion real",
        matchesHosted: "Meciuri găzduite",
        communitySupport: "Sprijinul comunității",
        supportersAroundWorld: "Susținători din întreaga lume",
        noLiveGames: "Nu sunt meciuri live",
        noGamesToday: "Nu sunt meciuri astăzi",
        conceded: "primite",
      },

      sk: {
        title: "Majstrovstvá sveta FIFA 2026",
        subtitle: "Turnajová aplikácia pre Home Assistant",
        back: "← Späť",
        updated: "Aktualizované",
        loading: "Načítava sa MS 2026...",
        errorTitle: "MS 2026",
        errorText: "Nepodarilo sa načítať údaje aplikácie.",
        overview: "Prehľad",

        teams: "Timy",
        live: "Live centrum",
        fixtures: "Zápasy",
        results: "Výsledky",
        groups: "Skupiny",
        knockout: "Vyraďovacia fáza",
        players: "Zlatá kopačka",
        records: "Rekordy",
        stats: "Štatistiky",
        venues: "Štadióny",
        totalMatches: "Spolu zápasov",
        loaded: "Načítané",
        played: "Odohrané",
        remaining: "Zostáva",
        liveNow: "Práve naživo",
        totalGoals: "Spolu gólov",
        nextMatch: "Ďalší zápas",
        tournamentStatus: "Stav turnaja",
        demoMode: "Demo režim",
        on: "Zapnuté",
        off: "Vypnuté",
        lastUpdate: "Posledná aktualizácia",
        ok: "OK",
        failed: "Zlyhalo",
        progress: "Priebeh",
        topScorer: "Najlepší strelec",
        notAvailable: "Nedostupné",
        noUpcomingMatch: "Nie je načítaný žiadny nadchádzajúci zápas.",
        noLiveMatches: "Momentálne nie sú žiadne živé zápasy.",
        fixturesResults: "Zápasy a výsledky",
        noFixtures: "Zatiaľ nie sú načítané žiadne zápasy.",
        groupLabel: "Skupina",
        groupsAL: "Skupiny A-L",
        noGroups: "Zatiaľ nie sú načítané žiadne tabuľky skupín.",
        noTeamsGroup: "Pre túto skupinu zatiaľ nie sú načítané žiadne tímy.",
        goldenBoot: "Súboj o Zlatú kopačku",
        noPlayerStats: "Zatiaľ nie sú načítané žiadne štatistiky hráčov.",
        knockoutBracket: "Vyraďovací pavúk",
        fixturesNotAvailable: "Zápasy zatiaľ nie sú dostupné",
        highestMatchGoals: "Najviac gólov v zápase",
        biggestMargin: "Najväčší rozdiel",
        topTeamGoals: "Najviac gólov tímu",
        bestDefenceGA: "Najlepšia obrana",
        highestScoringMatch: "Najgólovejší zápas",
        biggestWin: "Najväčšie víťazstvo",
        topScoringTeam: "Najproduktívnejší tím",
        bestDefence: "Najlepšia obrana",
        noResult: "Zatiaľ žiadny výsledok.",
        noTeamGoalData: "Zatiaľ žiadne údaje o góloch tímov.",
        noDefensiveData: "Zatiaľ žiadne obranné údaje.",
        matchesPlayed: "Odohrané zápasy",
        yellowCards: "Žlté karty",
        redCards: "Červené karty",
        minutes: "Minúty",
        goalsPerMatch: "Góly / zápas",
        draws: "Remízy",
        drawRate: "Miera remíz",
        bttsRate: "Miera oba tímy skórujú",
        over25Rate: "Miera nad 2,5",
        stadiums: "Štadióny",
        usaVenues: "Štadióny USA",
        canadaVenues: "Štadióny Kanady",
        mexicoVenues: "Štadióny Mexika",
        finalVenue: "Štadión finále",
        capacity: "Kapacita",
        worldCupStadiums: "Štadióny majstrovstiev sveta",
        noVenueData: "Nie sú dostupné údaje o štadiónoch.",
        scheduled: "Naplánované",
        liveStatus: "Naživo",
        manualTimerNotice: 'Živé skóre sa aktualizuje automaticky. Časy gólov používajú manuálne zápasové hodiny a môžu sa o niekoľko minút líšiť od oficiálnych časov.',
        paused: "Prestávka",
        fullTime: "Koniec zápasu",
        aet: "Po predĺžení",
        penalties: "Penalty",
        postponed: "Odložené",
        groupStage: "Skupinová fáza",
        round32: "Kolo 32",
        round16: "Osemfinále",
        quarterFinals: "Štvrťfinále",
        semiFinals: "Semifinále",
        thirdPlace: "Tretie miesto",
        final: "Finále",
        tbc: "Bude potvrdené",
        unknown: "Neznáme",
        pos: "Poz",
        team: "Tím",
        player: "Hráč",
        goals: "Góly",
        assists: "Asistencie",
        language: "Jazyk panela",
        pcView: "Zobrazenie PC",
        tabletView: "Zobrazenie tabletu",
        viewMode: "Zobrazenie panela",
        controlCentre: "Majstrovstvá sveta FIFA 2026 - Control Centre",
        overviewSubtitle: "Živý turnajový panel so zápasmi, výsledkami, skupinami, štatistikami hráčov, štadiónmi, rekordmi a vyraďovacou časťou na jednom mieste.",
        tournamentIntelligence: "Štatistiky",
        goldenBootCentre: "Súboj o Zlatú kopačku",
        leaderSpotlight: "Najlepší strelec",
        playersTracked: "Zlatá kopačka",
        totalAssists: "Asistencie",
        totalYellowCards: "Žlté karty",
        totalRedCards: "Červené karty",
        upNext: "Ďalší zápas",
        matchSpotlight: "Ďalší zápas",
        upcomingFixtures: "Zápasy",
        latest: "Aktualizované",
        recentResults: "Výsledky",
        playerWatch: "Zlatá kopačka",
        fixturesSubtitle: "Zápasy a výsledky",
        days: "Dni",
        versus: "v",
        supportersNav: "🙏 Podporovatelia",
        supportersThankYouTitle: "🙏 Podporovatelia a poďakovanie",
        supportersIntro: "Tento projekt začal ako osobný panel Home Assistant a rástol vďaka spätnej väzbe, testovaniu, nápadom a podpore komunity.",
        supportersSpecialThanks: "Osobitná vďaka všetkým, ktorí podporili vývoj integrácie World Cup 2026.",
        supportersTitle: "🍺 Podporovatelia",
        latestSupporters: "⭐ Najnovší podporovatelia",
        allSupporters: "🌍 Všetci podporovatelia",
        supporterDefaultMessage: "Ďakujeme za podporu vývoja.",
        anonymousSupporter: "Anonymný podporovateľ",
        noSupporters: "Zatiaľ neboli pridaní žiadni podporovatelia. Buďte prvý, kto mi kúpi pivo a zobrazí svoje meno tu.",
        wantNameAdded: "Chcete sem pridať svoje meno?",
        supportFutureUpdates: "Podporte budúce aktualizácie, opravy chýb a nové funkcie majstrovstiev sveta.",
        supporterBeerMessage: "🍺 Chcete svoje meno na stránke podporovateľov? Kúpte mi pivo cez PayPal a vaše meno môže byť pridané do zoznamu podporovateľov World Cup 2026 ako poďakovanie za podporu vývoja.",
        donateBuyBeer: "🍺 Prispieť / Kúpiť mi pivo",
        enjoyingIntegration: "🍺 Páči sa vám táto integrácia?",
        supportIntegration: "Podporiť túto integráciu",
        source: "Zdroj",
        totalSupporters: "Spolu podporovateľov",
        countries: "Krajiny",
        countriesSupporting: "Podporujúce krajiny",
        latestSupportDate: "Dátum poslednej podpory",
        playedShort: "Z",
        winsShort: "V",
        drawsShort: "R",
        lossesShort: "P",
        goalsForShort: "VG",
        goalsAgainstShort: "IG",
        goalDifferenceShort: "RG",
        pointsShort: "Body",
        noResultsLoaded: "Zatiaľ nie sú načítané žiadne výsledky.",
        finishedMatchesSubtitle: "Dokončené zápasy a potvrdené skóre.",
        goldenBootAutoText: "Automatické údaje Zlatej kopačky sa zobrazia, keď football-data.org zverejní údaje o strelcoch majstrovstiev sveta.",
        realStadium: "Skutočný štadión",
        matchesHosted: "Hostené zápasy",
        communitySupport: "Podpora komunity",
        supportersAroundWorld: "Podporovatelia z celého sveta",
        noLiveGames: "Žiadne živé zápasy",
        noGamesToday: "Dnes nie sú žiadne zápasy",
        conceded: "inkasované",
      },

      sl: {
        title: "Svetovno prvenstvo FIFA 2026",
        subtitle: "Namenska turnirska aplikacija za Home Assistant",
        back: "← Nazaj",
        updated: "Posodobljeno",
        loading: "Nalaganje SP 2026...",
        errorTitle: "SP 2026",
        errorText: "Podatkov aplikacije ni bilo mogoče naložiti.",
        overview: "Pregled",

        teams: "Ekipe",
        live: "Središče v živo",
        fixtures: "Tekme",
        results: "Rezultati",
        groups: "Skupine",
        knockout: "Izločilni del",
        players: "Zlati čevelj",
        records: "Rekordi",
        stats: "Statistika",
        venues: "Stadioni",
        totalMatches: "Skupaj tekem",
        loaded: "Naloženo",
        played: "Odigrano",
        remaining: "Preostalo",
        liveNow: "V živo zdaj",
        totalGoals: "Skupaj golov",
        nextMatch: "Naslednja tekma",
        tournamentStatus: "Stanje turnirja",
        demoMode: "Demo način",
        on: "Vklop",
        off: "Izklop",
        lastUpdate: "Zadnja posodobitev",
        ok: "OK",
        failed: "Neuspešno",
        progress: "Napredek",
        topScorer: "Najboljši strelec",
        notAvailable: "Ni na voljo",
        noUpcomingMatch: "Naložena ni nobena prihajajoča tekma.",
        noLiveMatches: "Trenutno ni tekem v živo.",
        fixturesResults: "Tekme in rezultati",
        noFixtures: "Tekme še niso naložene.",
        groupLabel: "Skupina",
        groupsAL: "Skupine A-L",
        noGroups: "Lestvice skupin še niso naložene.",
        noTeamsGroup: "Za to skupino še ni naloženih ekip.",
        goldenBoot: "Boj za zlati čevelj",
        noPlayerStats: "Statistika igralcev še ni naložena.",
        knockoutBracket: "Izločilna tabela",
        fixturesNotAvailable: "Tekme še niso na voljo",
        highestMatchGoals: "Največ golov na tekmi",
        biggestMargin: "Največja razlika",
        topTeamGoals: "Največ golov ekipe",
        bestDefenceGA: "Najboljša obramba",
        highestScoringMatch: "Tekma z največ goli",
        biggestWin: "Največja zmaga",
        topScoringTeam: "Najbolj strelska ekipa",
        bestDefence: "Najboljša obramba",
        noResult: "Rezultata še ni.",
        noTeamGoalData: "Podatkov o golih ekip še ni.",
        noDefensiveData: "Obrambnih podatkov še ni.",
        matchesPlayed: "Odigrane tekme",
        yellowCards: "Rumeni kartoni",
        redCards: "Rdeči kartoni",
        minutes: "Minute",
        goalsPerMatch: "Goli / tekmo",
        draws: "Neodločeno",
        drawRate: "Delež remijev",
        bttsRate: "Delež obe ekipi zadeneta",
        over25Rate: "Delež nad 2,5",
        stadiums: "Stadioni",
        usaVenues: "Stadioni ZDA",
        canadaVenues: "Stadioni Kanade",
        mexicoVenues: "Stadioni Mehike",
        finalVenue: "Stadion finala",
        capacity: "Kapaciteta",
        worldCupStadiums: "Stadioni svetovnega prvenstva",
        noVenueData: "Podatkov o stadionih ni.",
        scheduled: "Načrtovano",
        liveStatus: "V živo",
        manualTimerNotice: 'Rezultati v živo se posodabljajo samodejno. Časi zadetkov uporabljajo ročno uro tekme in se lahko za nekaj minut razlikujejo od uradnih časov.',
        paused: "Premor",
        fullTime: "Konec tekme",
        aet: "Po podaljšku",
        penalties: "Enajstmetrovke",
        postponed: "Preloženo",
        groupStage: "Skupinski del",
        round32: "Krog 32",
        round16: "Osmina finala",
        quarterFinals: "Četrtfinale",
        semiFinals: "Polfinale",
        thirdPlace: "Tretje mesto",
        final: "Finale",
        tbc: "Bo potrjeno",
        unknown: "Neznano",
        pos: "Poz",
        team: "Ekipa",
        player: "Igralec",
        goals: "Goli",
        assists: "Asistence",
        language: "Jezik nadzorne plošče",
        pcView: "Pogled PC",
        tabletView: "Pogled tablice",
        viewMode: "Pogled nadzorne plo??e",
        controlCentre: "Svetovno prvenstvo FIFA 2026 - Control Centre",
        overviewSubtitle: "Nadzorna plošča turnirja v živo s tekmami, rezultati, skupinami, statistiko igralcev, stadioni, rekordi in izločilnimi boji na enem mestu.",
        tournamentIntelligence: "Statistika",
        goldenBootCentre: "Boj za zlati čevelj",
        leaderSpotlight: "Najboljši strelec",
        playersTracked: "Zlati čevelj",
        totalAssists: "Asistence",
        totalYellowCards: "Rumeni kartoni",
        totalRedCards: "Rdeči kartoni",
        upNext: "Naslednja tekma",
        matchSpotlight: "Naslednja tekma",
        upcomingFixtures: "Tekme",
        latest: "Posodobljeno",
        recentResults: "Rezultati",
        playerWatch: "Zlati čevelj",
        fixturesSubtitle: "Tekme in rezultati",
        days: "Dnevi",
        versus: "v",
        supportersNav: "🙏 Podporniki",
        supportersThankYouTitle: "🙏 Podporniki in zahvala",
        supportersIntro: "Ta projekt se je začel kot osebna plošča Home Assistant in zrasel zaradi povratnih informacij, testiranja, idej in podpore skupnosti.",
        supportersSpecialThanks: "Posebna zahvala vsem, ki so podprli razvoj integracije World Cup 2026.",
        supportersTitle: "🍺 Podporniki",
        latestSupporters: "⭐ Najnovejši podporniki",
        allSupporters: "🌍 Vsi podporniki",
        supporterDefaultMessage: "Hvala za podporo razvoju.",
        anonymousSupporter: "Anonimni podpornik",
        noSupporters: "Podporniki še niso dodani. Bodite prvi, ki mi kupi pivo in prikaže svoje ime tukaj.",
        wantNameAdded: "Želite tukaj dodati svoje ime?",
        supportFutureUpdates: "Podprite prihodnje posodobitve, popravke napak in nove funkcije svetovnega prvenstva.",
        supporterBeerMessage: "🍺 Želite svoje ime na strani podpornikov? Kupite mi pivo prek PayPala in vaše ime se lahko doda na seznam podpornikov World Cup 2026 kot zahvala za podporo razvoju.",
        donateBuyBeer: "🍺 Doniraj / Kupi mi pivo",
        enjoyingIntegration: "🍺 Vam je ta integracija všeč?",
        supportIntegration: "Podprite to integracijo",
        source: "Vir",
        totalSupporters: "Skupaj podpornikov",
        countries: "Države",
        countriesSupporting: "Države podpore",
        latestSupportDate: "Zadnji datum podpore",
        playedShort: "T",
        winsShort: "Z",
        drawsShort: "R",
        lossesShort: "P",
        goalsForShort: "DG",
        goalsAgainstShort: "PG",
        goalDifferenceShort: "GR",
        pointsShort: "Točke",
        noResultsLoaded: "Rezultati še niso naloženi.",
        finishedMatchesSubtitle: "Končane tekme in potrjeni rezultati.",
        goldenBootAutoText: "Samodejni podatki Zlatega čevlja se bodo prikazali, ko football-data.org objavi podatke strelcev svetovnega prvenstva.",
        realStadium: "Dejanski stadion",
        matchesHosted: "Gostene tekme",
        communitySupport: "Podpora skupnosti",
        supportersAroundWorld: "Podporniki po vsem svetu",
        noLiveGames: "Ni tekem v živo",
        noGamesToday: "Danes ni tekem",
        conceded: "prejeti",
      },

      hr: {
        title: "FIFA Svjetsko prvenstvo 2026",
        subtitle: "Namjenska turnirska aplikacija za Home Assistant",
        back: "← Natrag",
        updated: "Ažurirano",
        loading: "Učitavanje SP 2026...",
        errorTitle: "SP 2026",
        errorText: "Podaci aplikacije nisu učitani.",
        overview: "Pregled",

        teams: "Timovi",
        live: "Centar uživo",
        fixtures: "Utakmice",
        results: "Rezultati",
        groups: "Skupine",
        knockout: "Nokaut faza",
        players: "Zlatna kopačka",
        records: "Rekordi",
        stats: "Statistika",
        venues: "Stadioni",
        totalMatches: "Ukupno utakmica",
        loaded: "Učitano",
        played: "Odigrano",
        remaining: "Preostalo",
        liveNow: "Uživo sada",
        totalGoals: "Ukupno golova",
        nextMatch: "Sljedeća utakmica",
        tournamentStatus: "Status turnira",
        demoMode: "Demo način",
        on: "Uključeno",
        off: "Isključeno",
        lastUpdate: "Zadnje ažuriranje",
        ok: "OK",
        failed: "Neuspjelo",
        progress: "Napredak",
        topScorer: "Najbolji strijelac",
        notAvailable: "Nije dostupno",
        noUpcomingMatch: "Nema učitanog nadolazećeg susreta.",
        noLiveMatches: "Trenutno nema utakmica uživo.",
        fixturesResults: "Utakmice i rezultati",
        noFixtures: "Još nisu učitane utakmice.",
        groupLabel: "Skupina",
        groupsAL: "Skupine A-L",
        noGroups: "Još nisu učitane ljestvice skupina.",
        noTeamsGroup: "Za ovu skupinu još nisu učitane momčadi.",
        goldenBoot: "Utrka za Zlatnu kopačku",
        noPlayerStats: "Još nisu učitane statistike igrača.",
        knockoutBracket: "Nokaut ždrijeb",
        fixturesNotAvailable: "Utakmice još nisu dostupne",
        highestMatchGoals: "Najviše golova u utakmici",
        biggestMargin: "Najveća razlika",
        topTeamGoals: "Najviše golova momčadi",
        bestDefenceGA: "Najbolja obrana",
        highestScoringMatch: "Utakmica s najviše golova",
        biggestWin: "Najveća pobjeda",
        topScoringTeam: "Najefikasnija momčad",
        bestDefence: "Najbolja obrana",
        noResult: "Još nema rezultata.",
        noTeamGoalData: "Još nema podataka o golovima momčadi.",
        noDefensiveData: "Još nema obrambenih podataka.",
        matchesPlayed: "Odigrane utakmice",
        yellowCards: "Žuti kartoni",
        redCards: "Crveni kartoni",
        minutes: "Minute",
        goalsPerMatch: "Golovi / utakmica",
        draws: "Neriješeno",
        drawRate: "Postotak neriješenih",
        bttsRate: "Postotak obje momčadi daju gol",
        over25Rate: "Postotak više od 2,5",
        stadiums: "Stadioni",
        usaVenues: "Stadioni SAD-a",
        canadaVenues: "Stadioni Kanade",
        mexicoVenues: "Stadioni Meksika",
        finalVenue: "Stadion finala",
        capacity: "Kapacitet",
        worldCupStadiums: "Stadioni Svjetskog prvenstva",
        noVenueData: "Nema podataka o stadionima.",
        scheduled: "Zakazano",
        liveStatus: "Uživo",
        manualTimerNotice: 'Rezultati uživo ažuriraju se automatski. Vrijeme golova koristi ručni sat utakmice i može se razlikovati nekoliko minuta od službenog vremena.',
        paused: "Pauza",
        fullTime: "Kraj utakmice",
        aet: "Nakon produžetaka",
        penalties: "Jedanaesterci",
        postponed: "Odgođeno",
        groupStage: "Skupinska faza",
        round32: "Šesnaestina finala",
        round16: "Osmina finala",
        quarterFinals: "Četvrtfinale",
        semiFinals: "Polufinale",
        thirdPlace: "Treće mjesto",
        final: "Finale",
        tbc: "Bit će potvrđeno",
        unknown: "Nepoznato",
        pos: "Poz",
        team: "Momčad",
        player: "Igrač",
        goals: "Golovi",
        assists: "Asistencije",
        language: "Jezik nadzorne ploče",
        pcView: "Prikaz PC-ja",
        tabletView: "Prikaz tableta",
        viewMode: "Prikaz nadzorne plo?e",
        controlCentre: "FIFA Svjetsko prvenstvo 2026 - Control Centre",
        overviewSubtitle: "Nadzorna ploča turnira uživo s utakmicama, rezultatima, skupinama, statistikama igrača, stadionima, rekordima i nokaut fazom na jednom mjestu.",
        tournamentIntelligence: "Statistika",
        goldenBootCentre: "Utrka za Zlatnu kopačku",
        leaderSpotlight: "Najbolji strijelac",
        playersTracked: "Zlatna kopačka",
        totalAssists: "Asistencije",
        totalYellowCards: "Žuti kartoni",
        totalRedCards: "Crveni kartoni",
        upNext: "Sljedeća utakmica",
        matchSpotlight: "Sljedeća utakmica",
        upcomingFixtures: "Utakmice",
        latest: "Ažurirano",
        recentResults: "Rezultati",
        playerWatch: "Zlatna kopačka",
        fixturesSubtitle: "Utakmice i rezultati",
        days: "Dani",
        versus: "v",
        supportersNav: "🙏 Podržavatelji",
        supportersThankYouTitle: "🙏 Podržavatelji i zahvala",
        supportersIntro: "Ovaj projekt započeo je kao osobna Home Assistant nadzorna ploča i narastao zahvaljujući povratnim informacijama, testiranju, idejama i podršci zajednice.",
        supportersSpecialThanks: "Posebna zahvala svima koji su podržali razvoj integracije World Cup 2026.",
        supportersTitle: "🍺 Podržavatelji",
        latestSupporters: "⭐ Najnoviji podržavatelji",
        allSupporters: "🌍 Svi podržavatelji",
        supporterDefaultMessage: "Hvala na podršci razvoju.",
        anonymousSupporter: "Anonimni podržavatelj",
        noSupporters: "Još nema dodanih podržavatelja. Budite prvi koji će mi kupiti pivo i prikazati svoje ime ovdje.",
        wantNameAdded: "Želite dodati svoje ime ovdje?",
        supportFutureUpdates: "Podržite buduća ažuriranja, ispravke grešaka i nove funkcije Svjetskog prvenstva.",
        supporterBeerMessage: "🍺 Želite svoje ime na stranici podržavatelja? Kupite mi pivo putem PayPala i vaše ime može biti dodano na popis podržavatelja World Cup 2026 kao zahvala za podršku razvoju.",
        donateBuyBeer: "🍺 Doniraj / Kupi mi pivo",
        enjoyingIntegration: "🍺 Sviđa vam se ova integracija?",
        supportIntegration: "Podrži ovu integraciju",
        source: "Izvor",
        totalSupporters: "Ukupno podržavatelja",
        countries: "Zemlje",
        countriesSupporting: "Zemlje koje podržavaju",
        latestSupportDate: "Zadnji datum podrške",
        playedShort: "U",
        winsShort: "P",
        drawsShort: "N",
        lossesShort: "I",
        goalsForShort: "DG",
        goalsAgainstShort: "PG",
        goalDifferenceShort: "GR",
        pointsShort: "Bod",
        noResultsLoaded: "Još nema učitanih rezultata.",
        finishedMatchesSubtitle: "Završene utakmice i potvrđeni rezultati.",
        goldenBootAutoText: "Automatski podaci Zlatne kopačke pojavit će se kada football-data.org objavi podatke o strijelcima Svjetskog prvenstva.",
        realStadium: "Stvarni stadion",
        matchesHosted: "Domaćin utakmica",
        communitySupport: "Podrška zajednice",
        supportersAroundWorld: "Podržavatelji širom svijeta",
        noLiveGames: "Nema utakmica uživo",
        noGamesToday: "Danas nema utakmica",
        conceded: "primljeno",
      },

      sr: {
        title: "ФИФА Светско првенство 2026",
        subtitle: "Наменска турнирска апликација за Home Assistant",
        back: "← Назад",
        updated: "Ажурирано",
        loading: "Учитавање Светског првенства 2026...",
        errorTitle: "Светско првенство 2026",
        errorText: "Подаци апликације нису учитани.",
        overview: "Преглед",

        teams: "Timovi",
        live: "Центар уживо",
        fixtures: "Утакмице",
        results: "Резултати",
        groups: "Групе",
        knockout: "Нокаут фаза",
        players: "Златна копачка",
        records: "Рекорди",
        stats: "Статистика",
        venues: "Стадиони",
        totalMatches: "Укупно утакмица",
        loaded: "Учитано",
        played: "Одиграно",
        remaining: "Преостало",
        liveNow: "Уживо сада",
        totalGoals: "Укупно голова",
        nextMatch: "Следећа утакмица",
        tournamentStatus: "Статус турнира",
        demoMode: "Демо режим",
        on: "Укључено",
        off: "Искључено",
        lastUpdate: "Последње ажурирање",
        ok: "OK",
        failed: "Неуспешно",
        progress: "Напредак",
        topScorer: "Најбољи стрелац",
        notAvailable: "Није доступно",
        noUpcomingMatch: "Није учитана наредна утакмица.",
        noLiveMatches: "Тренутно нема утакмица уживо.",
        fixturesResults: "Утакмице и резултати",
        noFixtures: "Утакмице још нису учитане.",
        groupLabel: "Група",
        groupsAL: "Групе A-L",
        noGroups: "Табеле група још нису учитане.",
        noTeamsGroup: "За ову групу још нису учитани тимови.",
        goldenBoot: "Трка за Златну копачку",
        noPlayerStats: "Статистика играча још није учитана.",
        knockoutBracket: "Нокаут костур",
        fixturesNotAvailable: "Утакмице још нису доступне",
        highestMatchGoals: "Највише голова на мечу",
        biggestMargin: "Највећа разлика",
        topTeamGoals: "Највише голова тима",
        bestDefenceGA: "Најбоља одбрана",
        highestScoringMatch: "Утакмица са највише голова",
        biggestWin: "Највећа победа",
        topScoringTeam: "Најефикаснији тим",
        bestDefence: "Најбоља одбрана",
        noResult: "Још нема резултата.",
        noTeamGoalData: "Још нема података о головима тимова.",
        noDefensiveData: "Још нема дефанзивних података.",
        matchesPlayed: "Одигране утакмице",
        yellowCards: "Жути картони",
        redCards: "Црвени картони",
        minutes: "Минути",
        goalsPerMatch: "Голови / утакмица",
        draws: "Нерешено",
        drawRate: "Стопа нерешених",
        bttsRate: "Стопа оба тима дају гол",
        over25Rate: "Стопа преко 2,5",
        stadiums: "Стадиони",
        usaVenues: "Стадиони САД",
        canadaVenues: "Стадиони Канаде",
        mexicoVenues: "Стадиони Мексика",
        finalVenue: "Стадион финала",
        capacity: "Капацитет",
        worldCupStadiums: "Стадиони Светског првенства",
        noVenueData: "Нема података о стадионима.",
        scheduled: "Заказано",
        liveStatus: "Уживо",
        manualTimerNotice: 'Rezultati uživo se automatski ažuriraju. Vremena golova koriste ručni sat utakmice i mogu se razlikovati nekoliko minuta od zvaničnih vremena.',
        paused: "Пауза",
        fullTime: "Крај утакмице",
        aet: "После продужетака",
        penalties: "Пенали",
        postponed: "Одложено",
        groupStage: "Групна фаза",
        round32: "Рунда 32",
        round16: "Осмина финала",
        quarterFinals: "Четвртфинале",
        semiFinals: "Полуфинале",
        thirdPlace: "Треће место",
        final: "Финале",
        tbc: "Биће потврђено",
        unknown: "Непознато",
        pos: "Поз",
        team: "Тим",
        player: "Играч",
        goals: "Голови",
        assists: "Асистенције",
        language: "Језик контролне табле",
        pcView: "Prikaz PC-ja",
        tabletView: "Prikaz tableta",
        viewMode: "Prikaz kontrolne table",
        controlCentre: "Контролни центар Светског првенства 2026",
        overviewSubtitle: "Контролна табла турнира уживо са утакмицама, резултатима, групама, статистиком играча, стадионима, рекордима и нокаут фазом на једном месту.",
        tournamentIntelligence: "Статистика",
        goldenBootCentre: "Трка за Златну копачку",
        leaderSpotlight: "Најбољи стрелац",
        playersTracked: "Златна копачка",
        totalAssists: "Асистенције",
        totalYellowCards: "Жути картони",
        totalRedCards: "Црвени картони",
        upNext: "Следећа утакмица",
        matchSpotlight: "Следећа утакмица",
        upcomingFixtures: "Утакмице",
        latest: "Ажурирано",
        recentResults: "Резултати",
        playerWatch: "Златна копачка",
        fixturesSubtitle: "Утакмице и резултати",
        days: "Дани",
        versus: "v",
        supportersNav: "🙏 Подржаваоци",
        supportersThankYouTitle: "🙏 Подржаваоци и захвалност",
        supportersIntro: "Овај пројекат је почео као лична Home Assistant контролна табла и порастао је захваљујући повратним информацијама, тестирању, идејама и подршци заједнице.",
        supportersSpecialThanks: "Посебна захвалност свима који су подржали развој интеграције World Cup 2026.",
        supportersTitle: "🍺 Подржаваоци",
        latestSupporters: "⭐ Најновији подржаваоци",
        allSupporters: "🌍 Сви подржаваоци",
        supporterDefaultMessage: "Хвала што подржавате развој.",
        anonymousSupporter: "Анонимни подржавалац",
        noSupporters: "Још нема додатих подржавалаца. Будите први који ће ми купити пиво и приказати своје име овде.",
        wantNameAdded: "Желите да додате своје име овде?",
        supportFutureUpdates: "Подржите будућа ажурирања, исправке грешака и нове функције Светског првенства.",
        supporterBeerMessage: "🍺 Желите своје име на страници подржавалаца? Купите ми пиво преко PayPal-а и ваше име може бити додато на листу подржавалаца World Cup 2026 као захвалност за подршку развоју.",
        donateBuyBeer: "🍺 Донирај / Купи ми пиво",
        enjoyingIntegration: "🍺 Да ли вам се свиђа ова интеграција?",
        supportIntegration: "Подржи ову интеграцију",
        source: "Извор",
        totalSupporters: "Укупно подржавалаца",
        countries: "Земље",
        countriesSupporting: "Земље које подржавају",
        latestSupportDate: "Последњи датум подршке",
        playedShort: "У",
        winsShort: "П",
        drawsShort: "Н",
        lossesShort: "И",
        goalsForShort: "ДГ",
        goalsAgainstShort: "ПГ",
        goalDifferenceShort: "ГР",
        pointsShort: "Бод",
        noResultsLoaded: "Још нема учитаних резултата.",
        finishedMatchesSubtitle: "Завршене утакмице и потврђени резултати.",
        goldenBootAutoText: "Аутоматски подаци Златне копачке појавиће се када football-data.org објави податке о стрелцима Светског првенства.",
        realStadium: "Стварни стадион",
        matchesHosted: "Одржане утакмице",
        communitySupport: "Подршка заједнице",
        supportersAroundWorld: "Подржаваоци широм света",
        noLiveGames: "Нема утакмица уживо",
        noGamesToday: "Данас нема утакмица",
        conceded: "примљено",
      },

      bg: {
        title: "Световно първенство FIFA 2026",
        subtitle: "Турнирно приложение за Home Assistant",
        back: "← Назад",
        updated: "Актуализирано",
        loading: "Зареждане на Световното 2026...",
        errorTitle: "Световно 2026",
        errorText: "Данните на приложението не можаха да се заредят.",
        overview: "Общ преглед",

        teams: "??????",
        live: "Център на живо",
        fixtures: "Мачове",
        results: "Резултати",
        groups: "Групи",
        knockout: "Елиминации",
        players: "Златна обувка",
        records: "Рекорди",
        stats: "Статистика",
        venues: "Стадиони",
        totalMatches: "Общо мачове",
        loaded: "Заредени",
        played: "Изиграни",
        remaining: "Остават",
        liveNow: "На живо сега",
        totalGoals: "Общо голове",
        nextMatch: "Следващ мач",
        tournamentStatus: "Статус на турнира",
        demoMode: "Демо режим",
        on: "Вкл.",
        off: "Изкл.",
        lastUpdate: "Последна актуализация",
        ok: "OK",
        failed: "Неуспешно",
        progress: "Напредък",
        topScorer: "Голмайстор",
        notAvailable: "Недостъпно",
        noUpcomingMatch: "Няма зареден предстоящ мач.",
        noLiveMatches: "В момента няма мачове на живо.",
        fixturesResults: "Мачове и резултати",
        noFixtures: "Все още няма заредени мачове.",
        groupLabel: "Група",
        groupsAL: "Групи A-L",
        noGroups: "Все още няма заредени класирания по групи.",
        noTeamsGroup: "Все още няма заредени отбори за тази група.",
        goldenBoot: "Битка за Златната обувка",
        noPlayerStats: "Все още няма заредени статистики на играчи.",
        knockoutBracket: "Елиминационна схема",
        fixturesNotAvailable: "Мачовете все още не са налични",
        highestMatchGoals: "Най-много голове в мач",
        biggestMargin: "Най-голяма разлика",
        topTeamGoals: "Най-много голове на отбор",
        bestDefenceGA: "Най-добра защита",
        highestScoringMatch: "Мач с най-много голове",
        biggestWin: "Най-голяма победа",
        topScoringTeam: "Най-резултатен отбор",
        bestDefence: "Най-добра защита",
        noResult: "Все още няма резултат.",
        noTeamGoalData: "Все още няма данни за голове на отбори.",
        noDefensiveData: "Все още няма защитни данни.",
        matchesPlayed: "Изиграни мачове",
        yellowCards: "Жълти картони",
        redCards: "Червени картони",
        minutes: "Минути",
        goalsPerMatch: "Голове / мач",
        draws: "Равенства",
        drawRate: "Процент равенства",
        bttsRate: "Процент и двата отбора бележат",
        over25Rate: "Процент над 2,5",
        stadiums: "Стадиони",
        usaVenues: "Стадиони в САЩ",
        canadaVenues: "Стадиони в Канада",
        mexicoVenues: "Стадиони в Мексико",
        finalVenue: "Стадион на финала",
        capacity: "Капацитет",
        worldCupStadiums: "Стадиони на Световното първенство",
        noVenueData: "Няма данни за стадиони.",
        scheduled: "Насрочен",
        liveStatus: "На живо",
        manualTimerNotice: 'Резултатите на живо се актуализират автоматично. Времената на головете използват ръчния мачов часовник и може да се различават с няколко минути от официалните.',
        paused: "Пауза",
        fullTime: "Край",
        aet: "След продължения",
        penalties: "Дузпи",
        postponed: "Отложен",
        groupStage: "Групова фаза",
        round32: "1/16 финал",
        round16: "1/8 финал",
        quarterFinals: "Четвъртфинали",
        semiFinals: "Полуфинали",
        thirdPlace: "Трето място",
        final: "Финал",
        tbc: "Ще се уточни",
        unknown: "Неизвестно",
        pos: "Поз",
        team: "Отбор",
        player: "Играч",
        goals: "Голове",
        assists: "Асистенции",
        language: "Език на таблото",
        pcView: "?????? PC",
        tabletView: "?????? ??????",
        viewMode: "?????? ?? ???????",
        controlCentre: "Контролен център Световно първенство 2026",
        overviewSubtitle: "Турнирен панел на живо с мачове, резултати, групи, статистики на играчи, стадиони, рекорди и елиминации на едно място.",
        tournamentIntelligence: "Статистика",
        goldenBootCentre: "Битка за Златната обувка",
        leaderSpotlight: "Голмайстор",
        playersTracked: "Златна обувка",
        totalAssists: "Асистенции",
        totalYellowCards: "Жълти картони",
        totalRedCards: "Червени картони",
        upNext: "Следващ мач",
        matchSpotlight: "Следващ мач",
        upcomingFixtures: "Мачове",
        latest: "Актуализирано",
        recentResults: "Резултати",
        playerWatch: "Златна обувка",
        fixturesSubtitle: "Мачове и резултати",
        days: "Дни",
        versus: "v",
        supportersNav: "🙏 Поддръжници",
        supportersThankYouTitle: "🙏 Поддръжници и благодарности",
        supportersIntro: "Този проект започна като личен панел Home Assistant и се разви благодарение на обратна връзка, тестове, идеи и подкрепа от общността.",
        supportersSpecialThanks: "Специални благодарности на всички, които подкрепиха разработката на интеграцията World Cup 2026.",
        supportersTitle: "🍺 Поддръжници",
        latestSupporters: "⭐ Най-нови поддръжници",
        allSupporters: "🌍 Всички поддръжници",
        supporterDefaultMessage: "Благодарим ви, че подкрепяте разработката.",
        anonymousSupporter: "Анонимен поддръжник",
        noSupporters: "Все още няма добавени поддръжници. Бъдете първият, който ще ми купи бира и ще покаже името си тук.",
        wantNameAdded: "Искате ли името ви да бъде добавено тук?",
        supportFutureUpdates: "Подкрепете бъдещи актуализации, поправки на грешки и нови функции за Световното първенство.",
        supporterBeerMessage: "🍺 Искате ли името ви да се появи на страницата с поддръжници? Купете ми бира чрез PayPal и името ви може да бъде добавено към списъка с поддръжници на World Cup 2026 като благодарност за подкрепата.",
        donateBuyBeer: "🍺 Дарете / Купете ми бира",
        enjoyingIntegration: "🍺 Харесва ли ви тази интеграция?",
        supportIntegration: "Подкрепете тази интеграция",
        source: "Източник",
        totalSupporters: "Общо поддръжници",
        countries: "Държави",
        countriesSupporting: "Подкрепящи държави",
        latestSupportDate: "Последна дата на подкрепа",
        playedShort: "М",
        winsShort: "П",
        drawsShort: "Р",
        lossesShort: "З",
        goalsForShort: "ВГ",
        goalsAgainstShort: "ДГ",
        goalDifferenceShort: "ГР",
        pointsShort: "Т",
        noResultsLoaded: "Все още няма заредени резултати.",
        finishedMatchesSubtitle: "Завършени мачове и потвърдени резултати.",
        goldenBootAutoText: "Автоматичните данни за Златната обувка ще се появят, когато football-data.org публикува данните за голмайсторите на Световното първенство.",
        realStadium: "Реален стадион",
        matchesHosted: "Домакинствани мачове",
        communitySupport: "Подкрепа от общността",
        supportersAroundWorld: "Поддръжници от цял свят",
        noLiveGames: "Няма мачове на живо",
        noGamesToday: "Днес няма мачове",
        conceded: "допуснати",
      },

      uk: {
        title: "Чемпіонат світу FIFA 2026",
        subtitle: "Турнірний застосунок для Home Assistant",
        back: "← Назад",
        updated: "Оновлено",
        loading: "Завантаження ЧС 2026...",
        errorTitle: "ЧС 2026",
        errorText: "Не вдалося завантажити дані застосунку.",
        overview: "Огляд",

        teams: "???????",
        live: "Live-центр",
        fixtures: "Матчі",
        results: "Результати",
        groups: "Групи",
        knockout: "Плей-оф",
        players: "Золота бутса",
        records: "Рекорди",
        stats: "Статистика",
        venues: "Стадіони",
        totalMatches: "Усього матчів",
        loaded: "Завантажено",
        played: "Зіграно",
        remaining: "Залишилось",
        liveNow: "Наживо зараз",
        totalGoals: "Усього голів",
        nextMatch: "Наступний матч",
        tournamentStatus: "Стан турніру",
        demoMode: "Демо режим",
        on: "Увімкнено",
        off: "Вимкнено",
        lastUpdate: "Останнє оновлення",
        ok: "OK",
        failed: "Помилка",
        progress: "Прогрес",
        topScorer: "Найкращий бомбардир",
        notAvailable: "Недоступно",
        noUpcomingMatch: "Немає завантаженого майбутнього матчу.",
        noLiveMatches: "Зараз немає матчів наживо.",
        fixturesResults: "Матчі та результати",
        noFixtures: "Матчі ще не завантажено.",
        groupLabel: "Група",
        groupsAL: "Групи A-L",
        noGroups: "Турнірні таблиці груп ще не завантажено.",
        noTeamsGroup: "Для цієї групи ще не завантажено команди.",
        goldenBoot: "Боротьба за Золоту бутсу",
        noPlayerStats: "Статистику гравців ще не завантажено.",
        knockoutBracket: "Сітка плей-оф",
        fixturesNotAvailable: "Матчі ще недоступні",
        highestMatchGoals: "Найбільше голів у матчі",
        biggestMargin: "Найбільша різниця",
        topTeamGoals: "Найбільше голів команди",
        bestDefenceGA: "Найкращий захист",
        highestScoringMatch: "Найрезультативніший матч",
        biggestWin: "Найбільша перемога",
        topScoringTeam: "Найрезультативніша команда",
        bestDefence: "Найкращий захист",
        noResult: "Результату ще немає.",
        noTeamGoalData: "Даних про голи команд ще немає.",
        noDefensiveData: "Захисних даних ще немає.",
        matchesPlayed: "Зіграні матчі",
        yellowCards: "Жовті картки",
        redCards: "Червоні картки",
        minutes: "Хвилини",
        goalsPerMatch: "Голи / матч",
        draws: "Нічиї",
        drawRate: "Відсоток нічиїх",
        bttsRate: "Відсоток обидві заб’ють",
        over25Rate: "Відсоток понад 2,5",
        stadiums: "Стадіони",
        usaVenues: "Стадіони США",
        canadaVenues: "Стадіони Канади",
        mexicoVenues: "Стадіони Мексики",
        finalVenue: "Стадіон фіналу",
        capacity: "Місткість",
        worldCupStadiums: "Стадіони чемпіонату світу",
        noVenueData: "Немає даних про стадіони.",
        scheduled: "Заплановано",
        liveStatus: "Наживо",
        manualTimerNotice: 'Рахунок наживо оновлюється автоматично. Час голів використовує ручний таймер матчу й може відрізнятися від офіційного на кілька хвилин.',
        paused: "Пауза",
        fullTime: "Кінець матчу",
        aet: "Після додаткового часу",
        penalties: "Пенальті",
        postponed: "Відкладено",
        groupStage: "Груповий етап",
        round32: "1/16 фіналу",
        round16: "1/8 фіналу",
        quarterFinals: "Чвертьфінали",
        semiFinals: "Півфінали",
        thirdPlace: "Третє місце",
        final: "Фінал",
        tbc: "Буде підтверджено",
        unknown: "Невідомо",
        pos: "Поз",
        team: "Команда",
        player: "Гравець",
        goals: "Голи",
        assists: "Асисти",
        language: "Мова панелі",
        pcView: "?????? ??",
        tabletView: "?????? ????????",
        viewMode: "?????? ??????",
        controlCentre: "Центр керування Чемпіонатом світу 2026",
        overviewSubtitle: "Жива панель турніру з матчами, результатами, групами, статистикою гравців, стадіонами, рекордами та плей-оф в одному місці.",
        tournamentIntelligence: "Статистика",
        goldenBootCentre: "Боротьба за Золоту бутсу",
        leaderSpotlight: "Найкращий бомбардир",
        playersTracked: "Золота бутса",
        totalAssists: "Асисти",
        totalYellowCards: "Жовті картки",
        totalRedCards: "Червоні картки",
        upNext: "Наступний матч",
        matchSpotlight: "Наступний матч",
        upcomingFixtures: "Матчі",
        latest: "Оновлено",
        recentResults: "Результати",
        playerWatch: "Золота бутса",
        fixturesSubtitle: "Матчі та результати",
        days: "Дні",
        versus: "v",
        supportersNav: "🙏 Прихильники",
        supportersThankYouTitle: "🙏 Прихильники та подяки",
        supportersIntro: "Цей проєкт почався як особиста панель Home Assistant і виріс завдяки відгукам, тестуванню, ідеям та підтримці спільноти.",
        supportersSpecialThanks: "Окрема подяка всім, хто підтримав розробку інтеграції World Cup 2026.",
        supportersTitle: "🍺 Прихильники",
        latestSupporters: "⭐ Найновіші прихильники",
        allSupporters: "🌍 Усі прихильники",
        supporterDefaultMessage: "Дякуємо за підтримку розробки.",
        anonymousSupporter: "Анонімний прихильник",
        noSupporters: "Прихильників ще не додано. Будьте першим, хто купить мені пиво і додасть своє ім’я тут.",
        wantNameAdded: "Хочете додати своє ім’я тут?",
        supportFutureUpdates: "Підтримайте майбутні оновлення, виправлення помилок і нові функції чемпіонату світу.",
        supporterBeerMessage: "🍺 Хочете, щоб ваше ім’я було на сторінці прихильників? Купіть мені пиво через PayPal, і ваше ім’я може бути додане до списку прихильників World Cup 2026 як подяка за підтримку розробки.",
        donateBuyBeer: "🍺 Пожертвувати / Купити мені пиво",
        enjoyingIntegration: "🍺 Вам подобається ця інтеграція?",
        supportIntegration: "Підтримати цю інтеграцію",
        source: "Джерело",
        totalSupporters: "Усього прихильників",
        countries: "Країни",
        countriesSupporting: "Країни підтримки",
        latestSupportDate: "Остання дата підтримки",
        playedShort: "І",
        winsShort: "В",
        drawsShort: "Н",
        lossesShort: "П",
        goalsForShort: "ЗМ",
        goalsAgainstShort: "ПМ",
        goalDifferenceShort: "РМ",
        pointsShort: "Очки",
        noResultsLoaded: "Результати ще не завантажено.",
        finishedMatchesSubtitle: "Завершені матчі та підтверджені рахунки.",
        goldenBootAutoText: "Автоматичні дані Золотої бутси з’являться, коли football-data.org опублікує дані бомбардирів чемпіонату світу.",
        realStadium: "Справжній стадіон",
        matchesHosted: "Проведені матчі",
        communitySupport: "Підтримка спільноти",
        supportersAroundWorld: "Прихильники з усього світу",
        noLiveGames: "Немає матчів наживо",
        noGamesToday: "Сьогодні немає матчів",
        conceded: "пропущено",
      },

      is: {
        title: "FIFA heimsmeistaramótið 2026",
        subtitle: "Sérhæft mótaforrit fyrir Home Assistant",
        back: "← Til baka",
        updated: "Uppfært",
        loading: "Hleð heimsmeistaramótinu 2026...",
        errorTitle: "Heimsmeistaramótið 2026",
        errorText: "Gat ekki hlaðið gögnum forritsins.",
        overview: "Yfirlit",

        teams: "Lid",
        live: "Bein miðstöð",
        fixtures: "Leikir",
        groups: "Riðlar",
        knockout: "Útsláttarkeppni",
        players: "Gullskórinn",
        records: "Met",
        stats: "Tölfræðimiðstöð",
        venues: "Leikvangar",
        totalMatches: "Samtals leikir",
        loaded: "Hlaðið",
        played: "Spilaðir",
        remaining: "Eftir",
        liveNow: "Í beinni núna",
        totalGoals: "Samtals mörk",
        nextMatch: "Næsti leikur",
        tournamentStatus: "Staða móts",
        demoMode: "Sýningarhamur",
        on: "Kveikt",
        off: "Slökkt",
        lastUpdate: "Síðasta uppfærsla",
        ok: "Í lagi",
        failed: "Mistókst",
        progress: "Framvinda",
        topScorer: "Markahæstur",
        notAvailable: "Ekki tiltækt",
        noUpcomingMatch: "Enginn næsti leikur hlaðinn.",
        noLiveMatches: "Engir leikir í beinni núna.",
        fixturesResults: "Leikir og úrslit",
        noFixtures: "Engir leikir hlaðnir enn.",
        groupLabel: "Riðill",
        groupsAL: "Riðlar A-L",
        noGroups: "Engar riðlatöflur hlaðnar enn.",
        noTeamsGroup: "Engin lið hlaðin fyrir þennan riðil enn.",
        goldenBoot: "Keppnin um Gullskóinn",
        noPlayerStats: "Engin leikmannatölfræði hlaðin enn.",
        knockoutBracket: "Útsláttartré",
        fixturesNotAvailable: "Leikir ekki tiltækir enn",
        highestMatchGoals: "Flest mörk í leik",
        biggestMargin: "Stærsti munur",
        topTeamGoals: "Flest mörk liðs",
        bestDefenceGA: "Besta vörnin",
        highestScoringMatch: "Markahæsti leikur",
        biggestWin: "Stærsti sigur",
        topScoringTeam: "Markahæsta liðið",
        bestDefence: "Besta vörnin",
        noResult: "Engin úrslit enn.",
        noTeamGoalData: "Engin markagögn liða enn.",
        noDefensiveData: "Engin varnargögn enn.",
        matchesPlayed: "Spilaðir leikir",
        yellowCards: "Gul spjöld",
        redCards: "Rauð spjöld",
        minutes: "Mínútur",
        goalsPerMatch: "Mörk / leik",
        draws: "Jafntefli",
        drawRate: "Hlutfall jafntefla",
        bttsRate: "Bæði lið skora",
        over25Rate: "Yfir 2,5 hlutfall",
        stadiums: "Leikvangar",
        usaVenues: "Leikvangar í Bandaríkjunum",
        canadaVenues: "Leikvangar í Kanada",
        mexicoVenues: "Leikvangar í Mexíkó",
        finalVenue: "Úrslitaleikvangur",
        capacity: "Rúmtak",
        worldCupStadiums: "Leikvangar HM",
        noVenueData: "Engin leikvangagögn tiltæk.",
        scheduled: "Á dagskrá",
        liveStatus: "Í beinni",
        manualTimerNotice: 'Staðan í beinni uppfærist sjálfkrafa. Marktímar nota handvirka leikklukku og geta verið nokkrum mínútum frá opinberum tímum.',
        paused: "Hlé",
        fullTime: "Leik lokið",
        aet: "Eftir framlengingu",
        penalties: "Vítaspyrnur",
        postponed: "Frestað",
        groupStage: "Riðlakeppni",
        round32: "32 liða úrslit",
        round16: "16 liða úrslit",
        quarterFinals: "8 liða úrslit",
        semiFinals: "Undanúrslit",
        thirdPlace: "Leikur um 3. sæti",
        final: "Úrslit",
        tbc: "Óákveðið",
        unknown: "Óþekkt",
        pos: "Sæti",
        team: "Lið",
        player: "Leikmaður",
        goals: "Mörk",
        assists: "Stoðsendingar",
        language: "Tungumál mælaborðs",
        pcView: "PC-s?n",
        tabletView: "Spjaldt?lvus?n",
        viewMode: "Stj?rnbor?ss?n",
        controlCentre: 'HM 2026 stjórnstöð',
        overviewSubtitle: 'Lifandi mælaborð mótsins með leikjum, úrslitum, riðlum, leikmannatölfræði, leikvöngum, metum og útsláttarkeppni á einum stað.',
        tournamentIntelligence: 'Greining mótsins',
        goldenBootCentre: 'Gullskómiðstöð',
        leaderSpotlight: 'Leiðtogi í kastljósi',
        playersTracked: 'Leikmenn vaktaðir',
        totalAssists: 'Samtals stoðsendingar',
        totalYellowCards: 'Samtals gul spjöld',
        totalRedCards: 'Samtals rauð spjöld',
        upNext: 'Næst',
        matchSpotlight: 'Leikur í kastljósi',
        upcomingFixtures: 'Næstu leikir',
        latest: 'Nýjast',
        recentResults: 'Nýleg úrslit',
        playerWatch: 'Leikmannavakt',
        fixturesSubtitle: 'Skýrari leikjamiðstöð með leikjadögum, skorkortum, fánum, leikvangaupplýsingum og skýrari stöðumerkjum.',
        days: 'Dagar',
        versus: 'gegn',
        supportersNav: '🙏 Stuðningsaðilar',
        supportersThankYouTitle: '🙏 Stuðningsaðilar og þakkir',
        supportersIntro: 'Þetta verkefni byrjaði sem persónulegt Home Assistant mælaborð og hefur vaxið þökk sé endurgjöf, prófunum, hugmyndum og stuðningi samfélagsins.',
        supportersSpecialThanks: 'Sérstakar þakkir til allra sem hafa stutt þróun World Cup 2026 samþættingarinnar.',
        supportersTitle: '🍺 Stuðningsaðilar',
        latestSupporters: "⭐ Nýjustu stuðningsaðilar",
        allSupporters: "🌍 Allir stuðningsaðilar",
        supporterDefaultMessage: 'Takk fyrir að styðja þróunina.',
        anonymousSupporter: 'Nafnlaus stuðningsaðili',
        noSupporters: 'Engir stuðningsaðilar hafa verið bættir við enn. Vertu fyrstur til að bjóða mér bjór og fá nafnið þitt hér.',
        wantNameAdded: 'Viltu fá nafnið þitt bætt við hér?',
        supportFutureUpdates: 'Styðjið framtíðaruppfærslur, villuleiðréttingar og nýja HM-eiginleika.',
        supporterBeerMessage: '🍺 Viltu að nafnið þitt birtist á stuðningssíðunni? Bjóddu mér bjór í gegnum PayPal og nafnið þitt getur verið bætt við stuðningslista World Cup 2026 sem þakklæti fyrir stuðning við þróunina.',
        donateBuyBeer: '🍺 Styrkja / Bjóða mér bjór',
        enjoyingIntegration: '🍺 Líkar þér þessi samþætting?',
        supportIntegration: 'Styðja þessa samþættingu',
        results: "Úrslit",
        source: "Heimild",
        totalSupporters: "Stuðningsaðilar alls",
        countries: "Lönd",
        countriesSupporting: "Stuðningslönd",
        latestSupportDate: "Síðasta stuðningsdagsetning",
        playedShort: "L",
        winsShort: "S",
        drawsShort: "J",
        lossesShort: "T",
        goalsForShort: "MF",
        goalsAgainstShort: "MG",
        goalDifferenceShort: "MM",
        pointsShort: "Stig",
        noResultsLoaded: "Engin úrslit hafa verið hlaðin enn.",
        finishedMatchesSubtitle: "Loknir leikir og staðfest úrslit.",
        goldenBootAutoText: "Sjálfvirk gögn um Gullskóinn birtast þegar football-data.org birtir markaskoraragögn HM.",
        realStadium: "Raunverulegur leikvangur",
        matchesHosted: "Leikir haldnir",
        communitySupport: "Stuðningur samfélagsins",
        supportersAroundWorld: "Stuðningsaðilar um allan heim",
        noLiveGames: "Engir leikir í beinni",
        noGamesToday: "Engir leikir í dag",
        conceded: "fengin á sig",
      },






      qu: {
        title: "FIFA Pachak Tinku 2026",
        subtitle: "Home Assistantpaq akllasqa tinku rurana",
        back: "← Kutiy",
        updated: "Musuqyachisqa",
        loading: "Pachak Tinku 2026 willakuykunata kichachkan...",
        errorTitle: "Pachak Tinku 2026",
        errorText: "Rurana willakuykunata mana kichayta atirqanchu.",
        overview: "Qhaway",

        teams: "Equipos",
        live: "Kawsaypi chawpi",
        fixtures: "Pukllaykuna",
        results: "Ruraykuna",
        groups: "Huñukuna",
        knockout: "Lluqsichiy mit’a",
        players: "Quri Sapatu",
        records: "Yuyay qillqakuna",
        stats: "Yupaykuna",
        venues: "Pukllana wasikuna",
        totalMatches: "Llapan pukllaykuna",
        loaded: "Kichasqa",
        played: "Pukllasqa",
        remaining: "Puchuq",
        liveNow: "Kunan kawsaypi",
        totalGoals: "Llapan golkuna",
        nextMatch: "Qatiq pukllay",
        tournamentStatus: "Tinku kaynin",
        demoMode: "Rikuchiy modo",
        on: "Ñawpaqchasqa",
        off: "Wañuchisqa",
        lastUpdate: "Qhipa musuqyachiy",
        ok: "Allin",
        failed: "Pantay",
        progress: "Ñawpaqman puriy",
        topScorer: "Aswan achka gol churakuq",
        notAvailable: "Mana kanchu",
        noUpcomingMatch: "Mana qatiq pukllay kichasqachu.",
        noLiveMatches: "Kunan mana kawsaypi pukllay kanchu.",
        fixturesResults: "Pukllaykuna hinallataq ruraykuna",
        noFixtures: "Manaraq pukllaykuna kichasqachu.",
        groupLabel: "Huñu",
        groupsAL: "Huñukuna A-L",
        noGroups: "Manaraq huñu sayaykuna kichasqachu.",
        noTeamsGroup: "Kay huñupi manaraq llaqtakuna kichasqachu.",
        goldenBoot: "Quri Sapatu atiypaq tinkuy",
        noPlayerStats: "Manaraq pukllaq yupaykuna kichasqachu.",
        knockoutBracket: "Lluqsichiy siq’i",
        fixturesNotAvailable: "Pukllaykuna manaraq kanchu",
        highestMatchGoals: "Aswan achka golniyuq pukllay",
        biggestMargin: "Aswan hatun chiqanchay",
        topTeamGoals: "Aswan achka golniyuq llaqta",
        bestDefenceGA: "Aswan allin hark’ay",
        highestScoringMatch: "Aswan achka golniyuq pukllay",
        biggestWin: "Aswan hatun atipay",
        topScoringTeam: "Aswan gol churaq llaqta",
        bestDefence: "Aswan allin hark’ay",
        noResult: "Manaraq rurasqachu.",
        noTeamGoalData: "Llaqta gol willakuy manaraq kanchu.",
        noDefensiveData: "Hark’ay willakuy manaraq kanchu.",
        matchesPlayed: "Pukllasqa pukllaykuna",
        yellowCards: "Qillu kartakuna",
        redCards: "Puka kartakuna",
        minutes: "Minutukuna",
        goalsPerMatch: "Golkuna / pukllay",
        draws: "Chawpi ruraykuna",
        drawRate: "Chawpi ruray tasa",
        bttsRate: "Iskaynin gol churan",
        over25Rate: "2.5manta aswan",
        stadiums: "Pukllana wasikuna",
        usaVenues: "USA pukllana wasikuna",
        canadaVenues: "Canadá pukllana wasikuna",
        mexicoVenues: "México pukllana wasikuna",
        finalVenue: "Tukuy pukllay wasi",
        capacity: "Hayk’a runa yaykun",
        worldCupStadiums: "Pachak Tinku pukllana wasikuna",
        noVenueData: "Pukllana wasi willakuy mana kanchu.",
        scheduled: "Pachasqa",
        liveStatus: "Kawsaypi",
        manualTimerNotice: 'Kawsaypi marcakuna kikinmanta musuqyachikun. Gol pachakuna makiwan ruwasqa pukllay relojwan llamk’achikun, chaymi oficial pachakunamanta huk iskay minutokunapi hukniray kanman.',
        paused: "Sayachisqa",
        fullTime: "Tukuy pacha",
        aet: "Yapa pachamanta qhipa",
        penalties: "Penalkuna",
        postponed: "Qhipachisqa",
        groupStage: "Huñu mit’a",
        round32: "32 muyu",
        round16: "16 muyu",
        quarterFinals: "Tawa ñiqi final",
        semiFinals: "Chawpi final",
        thirdPlace: "Kimsa ñiqi tiyanan",
        final: "Final",
        tbc: "Qhipaman takyachina",
        unknown: "Mana yachasqa",
        pos: "Tiyana",
        team: "Llaqta",
        player: "Pukllaq",
        goals: "Golkuna",
        assists: "Yanapakuykuna",
        language: "Panel simi",
        pcView: "PC qhaway",
        tabletView: "Tablet qhaway",
        viewMode: "Panel qhaway",
        controlCentre: "Pachak Tinku 2026 Kamachiy Chawpi",
        overviewSubtitle: "Kawsaypi tinku panel: pukllaykuna, ruraykuna, huñukuna, pukllaq yupaykuna, pukllana wasikuna, yuyay qillqakuna, lluqsichiy mit’a hukllapi.",
        tournamentIntelligence: "Tinku yuyaychay",
        goldenBootCentre: "Quri Sapatu Chawpi",
        leaderSpotlight: "Ñawpaq kaq qhaway",
        playersTracked: "Qhatisqa pukllaqkuna",
        totalAssists: "Llapan yanapakuykuna",
        totalYellowCards: "Llapan qillu kartakuna",
        totalRedCards: "Llapan puka kartakuna",
        upNext: "Qatiq",
        matchSpotlight: "Pukllay qhaway",
        upcomingFixtures: "Qatiq pukllaykuna",
        latest: "Qhipa",
        recentResults: "Qhipa ruraykuna",
        playerWatch: "Pukllaq qhaway",
        fixturesSubtitle: "Aswan chuyay pukllay chawpi, punchaw rakiykuna, puntu kartakuna, unanchakuna, pukllana wasi willakuykuna, imaynata kasqan rikuchiqkunawan.",
        days: "Punchawkuna",
        versus: "chaywan",
        supportersNav: "🙏 Yanapaqkuna",
        supportersThankYouTitle: "🙏 Yanapaqkuna hinallataq añay",
        supportersIntro: "Kay rurana qallariypi ñuqaq Home Assistant panelniy karqan, hinallataq aylluq yuyay, yachay, hamut’ay, yanapaywan wiñarqan.",
        supportersSpecialThanks: "World Cup 2026 integración wiñariyninta yanapaqkunaman sapaq añay.",
        supportersTitle: "🍺 Yanapaqkuna",
        latestSupporters: "⭐ Qhipa yanapaqkuna",
        allSupporters: "🌍 Llapan yanapaqkuna",
        supporterDefaultMessage: "Wiñariyta yanapasqaykimanta añay.",
        anonymousSupporter: "Mana sutiyuq yanapaq",
        noSupporters: "Manaraq yanapaqkuna kanchu. Ñawpaq kaq kachun, huk cerveza rantiy, sutiyki kaypi rikuchisqa kanqa.",
        wantNameAdded: "Sutiyki kaypi churayta munankichu?",
        supportFutureUpdates: "Qatiq musuqyachiykunata, pantay allichaykunata, musuq World Cup ruraykunata yanapay.",
        supporterBeerMessage: "🍺 Yanapaqkuna p’anqapi sutiyki rikuchiyta munankichu? PayPalwan huk cerveza rantiy, chaymanta sutiyki World Cup 2026 yanapaqkuna sutisuyupi churakunman añay hina.",
        donateBuyBeer: "🍺 Qullqi quy / Cerveza rantiy",
        enjoyingIntegration: "🍺 Kay integración nisqata kusikushankichu?",
        supportIntegration: "Kay integración yanapay",
        source: "Maymanta",
        totalSupporters: "Llapan yanapaqkuna",
        countries: "Llaqtakuna",
        countriesSupporting: "Yanapaq llaqtakuna",
        latestSupportDate: "Qhipa yanapay p’unchaw",
        playedShort: "P",
        winsShort: "A",
        drawsShort: "C",
        lossesShort: "L",
        goalsForShort: "GF",
        goalsAgainstShort: "GC",
        goalDifferenceShort: "DG",
        pointsShort: "Pts",
        noResultsLoaded: "Manaraq ruraykuna kichasqachu.",
        finishedMatchesSubtitle: "Tukusqa pukllaykuna takyachisqa ruraykunawan.",
        goldenBootAutoText: "Quri Sapatu automático willakuy rikurinqa football-data.org World Cup gol churaqkuna willakuyta lluqsichiqtin.",
        realStadium: "Chiqaq pukllana wasi",
        matchesHosted: "Apasqa pukllaykuna",
        communitySupport: "Ayllu yanapay",
        supportersAroundWorld: "Pachantinpi yanapaqkuna",
        noLiveGames: "Mana kawsaypi pukllaykuna",
        noGamesToday: "Kunan punchaw mana pukllay kanchu",
        conceded: "yaykusqa",
      },

      gn: {
        title: "FIFA Yvóra Kópa 2026",
        subtitle: "Home Assistant torneorã tembipuru",
        back: "← Jevy",
        updated: "Oñembopyahu",
        loading: "Oñemyanyhẽ Yvóra Kópa 2026...",
        errorTitle: "Yvóra Kópa 2026",
        errorText: "Ndaikatúi oñemyanyhẽ app mba’ekuaarã.",
        overview: "Techapyrã",

        teams: "Equipos",
        live: "Centro en vivo",
        fixtures: "Partidokuéra",
        results: "Resultado-kuéra",
        groups: "Grupo-kuéra",
        knockout: "Eliminatoria",
        players: "Botín de Oro",
        records: "Récord-kuéra",
        stats: "Estadística",
        venues: "Estadio-kuéra",
        totalMatches: "Partido opavave",
        loaded: "Oñemyanyhẽva",
        played: "Oñembosaráiva",
        remaining: "Hemby",
        liveNow: "Ko’ág̃a en vivo",
        totalGoals: "Gol opavave",
        nextMatch: "Partido oupáva",
        tournamentStatus: "Torneo rekove",
        demoMode: "Modo demo",
        on: "Myendy",
        off: "Mbogue",
        lastUpdate: "Ñembopyahu pahague",
        ok: "OK",
        failed: "Ojavy",
        progress: "Ñemotenonde",
        topScorer: "Goleador tenondegua",
        notAvailable: "Ndaipóri",
        noUpcomingMatch: "Ndaipóri partido oupáva oñemyanyhẽva.",
        noLiveMatches: "Ndaipóri partido en vivo ko’ág̃a.",
        fixturesResults: "Partido ha Resultado",
        noFixtures: "Ndaipóri partido oñemyanyhẽva gueteri.",
        groupLabel: "Grupo",
        groupsAL: "Grupo A-L",
        noGroups: "Ndaipóri tabla de grupo oñemyanyhẽva gueteri.",
        noTeamsGroup: "Ndaipóri equipo ko grupo-pe gueteri.",
        goldenBoot: "Botín de Oro ñha’ã",
        noPlayerStats: "Ndaipóri jugador estadística gueteri.",
        knockoutBracket: "Cuadro eliminatoria",
        fixturesNotAvailable: "Partidokuéra ndaipóri gueteri",
        highestMatchGoals: "Partido hetave gol reheve",
        biggestMargin: "Diferencia tuichavéva",
        topTeamGoals: "Equipo hetave gol",
        bestDefenceGA: "Defensa porãve",
        highestScoringMatch: "Partido hetave gol",
        biggestWin: "Victoria tuichavéva",
        topScoringTeam: "Equipo goleador porãve",
        bestDefence: "Defensa porãve",
        noResult: "Ndaipóri resultado gueteri.",
        noTeamGoalData: "Ndaipóri equipo gol mba’ekuaarã.",
        noDefensiveData: "Ndaipóri defensa mba’ekuaarã.",
        matchesPlayed: "Partido oñembosaráiva",
        yellowCards: "Tarjeta sa’yju",
        redCards: "Tarjeta pytã",
        minutes: "Minuto-kuéra",
        goalsPerMatch: "Gol / partido",
        draws: "Empate-kuéra",
        drawRate: "Empate tasa",
        bttsRate: "Mokõive omoinge",
        over25Rate: "2.5 ári",
        stadiums: "Estadio-kuéra",
        usaVenues: "USA estadio-kuéra",
        canadaVenues: "Canadá estadio-kuéra",
        mexicoVenues: "México estadio-kuéra",
        finalVenue: "Final estadio",
        capacity: "Ikatuha oike",
        worldCupStadiums: "Yvóra Kópa estadio-kuéra",
        noVenueData: "Ndaipóri estadio mba’ekuaarã.",
        scheduled: "Oñemboguapy",
        liveStatus: "En vivo",
        manualTimerNotice: 'Umi resultado en vivo oñembopyahu ijehegui. Gol aravo oipuru reloj manual partido rehegua ha ikatu ojoavy mbovymi minuto tiempo oficial-gui.',
        paused: "Ojejoko",
        fullTime: "Opa partido",
        aet: "Tiempo extra rire",
        penalties: "Penal-kuéra",
        postponed: "Oñembotapykue",
        groupStage: "Fase de grupos",
        round32: "Ronda 32",
        round16: "Ronda 16",
        quarterFinals: "Cuarto de final",
        semiFinals: "Semifinal",
        thirdPlace: "Tercer puesto",
        final: "Final",
        tbc: "Oñemoneĩta",
        unknown: "Ndojekuaái",
        pos: "Pos",
        team: "Equipo",
        player: "Jugador",
        goals: "Gol-kuéra",
        assists: "Asistencia-kuéra",
        language: "Dashboard ñe’ẽ",
        pcView: "PC jehecha",
        tabletView: "Tablet jehecha",
        viewMode: "Tablero jehecha",
        controlCentre: "Yvóra Kópa 2026 Control Centre",
        overviewSubtitle: "Dashboard en vivo torneo rehegua partido, resultado, grupo, jugador estadística, estadio, récord ha eliminatoria peteĩ hendápe.",
        tournamentIntelligence: "Torneo jehesa’ỹijo",
        goldenBootCentre: "Botín de Oro Centro",
        leaderSpotlight: "Tendota rechaukaha",
        playersTracked: "Jugador oñemoirũva",
        totalAssists: "Asistencia opavave",
        totalYellowCards: "Tarjeta sa’yju opavave",
        totalRedCards: "Tarjeta pytã opavave",
        upNext: "Oúva",
        matchSpotlight: "Partido destaque",
        upcomingFixtures: "Partido oupáva",
        latest: "Ipahaguéva",
        recentResults: "Resultado ramovéva",
        playerWatch: "Jugador jehecha",
        fixturesSubtitle: "Centro de partidos hesakãvéva, ára partido rehegua, tarjeta marcador, poyvi, estadio mba’ekuaarã ha estado hesakãva reheve.",
        days: "Ára",
        versus: "v",
        supportersNav: "🙏 Oipytyvõva",
        supportersThankYouTitle: "🙏 Oipytyvõva ha aguyje",
        supportersIntro: "Ko proyecto oñepyrũ peteĩ Home Assistant dashboard personal ramo ha okakuaa comunidad remiandu, prueba, idea ha pytyvõ rupive.",
        supportersSpecialThanks: "Aguyje especial opavave oipytyvõva World Cup 2026 integración desarrollo-pe.",
        supportersTitle: "🍺 Oipytyvõva",
        latestSupporters: "⭐ Oipytyvõva pyahu",
        allSupporters: "🌍 Oipytyvõva opavave",
        supporterDefaultMessage: "Aguyje desarrollo rehe pytyvõ haguére.",
        anonymousSupporter: "Oipytyvõva hera’ỹva",
        noSupporters: "Ndaipóri oipytyvõva gueteri. Eiko peteĩha ejoguáva chéve cerveza ha nde réra ojehechauka ko’ápe.",
        wantNameAdded: "Reipota nde réra oñemoĩ ko’ápe?",
        supportFutureUpdates: "Eipytyvõ ñembopyahu, bug ñemyatyrõ ha World Cup mba’e pyahu oútavape.",
        supporterBeerMessage: "🍺 Reipota nde réra osẽ Supporters página-pe? Ejogua chéve cerveza PayPal rupive ha nde réra ikatu oñemoĩ World Cup 2026 supporters lista-pe aguyje ramo.",
        donateBuyBeer: "🍺 Donar / Cerveza jogua",
        enjoyingIntegration: "🍺 Reguerohorypa ko integración?",
        supportIntegration: "Eipytyvõ ko integración",
        source: "Ypy",
        totalSupporters: "Oipytyvõva opavave",
        countries: "Tetãnguéra",
        countriesSupporting: "Tetãnguéra oipytyvõva",
        latestSupportDate: "Pytyvõ ára pahague",
        playedShort: "PJ",
        winsShort: "G",
        drawsShort: "E",
        lossesShort: "P",
        goalsForShort: "GF",
        goalsAgainstShort: "GC",
        goalDifferenceShort: "DG",
        pointsShort: "Pts",
        noResultsLoaded: "Ndaipóri resultado oñemyanyhẽva gueteri.",
        finishedMatchesSubtitle: "Partido opáva resultado oñemoneĩva reheve.",
        goldenBootAutoText: "Botín de Oro automático mba’ekuaarã ojehechaukáta football-data.org oguenohẽ vove World Cup goleador mba’ekuaarã.",
        realStadium: "Estadio añetegua",
        matchesHosted: "Partido oñemotenondéva",
        communitySupport: "Comunidad pytyvõ",
        supportersAroundWorld: "Oipytyvõva yvóra tuichakue",
        noLiveGames: "Ndaipóri partido en vivo",
        noGamesToday: "Ndaipóri partido ko árape",
        conceded: "oike hese",
      },

      ay: {
        title: "FIFA Uraq Pacha Copa 2026",
        subtitle: "Home Assistantatak torneo wakichawi",
        back: "← Kutt’aña",
        updated: "Machaqachata",
        loading: "Uraq Pacha Copa 2026 apthapiskäna...",
        errorTitle: "Uraq Pacha Copa 2026",
        errorText: "App yatiyawinaka janiw apthapiñjamäkiti.",
        overview: "Uñakipawi",

        teams: "Equipos",
        live: "Jichha centro",
        fixtures: "Anatawinaka",
        results: "Resultados",
        groups: "Tamanaka",
        knockout: "Eliminatoria",
        players: "Quri Zapato",
        records: "Récords",
        stats: "Estadísticas",
        venues: "Estadionaka",
        totalMatches: "Taqpach anatawinaka",
        loaded: "Apthapita",
        played: "Anatata",
        remaining: "Jilt’iri",
        liveNow: "Jichha en vivo",
        totalGoals: "Taqpach goles",
        nextMatch: "Jutiri anatawi",
        tournamentStatus: "Torneo estado",
        demoMode: "Demo modo",
        on: "Naktata",
        off: "Jiwt’ata",
        lastUpdate: "Qhipa machaqachawi",
        ok: "OK",
        failed: "Pantjata",
        progress: "Sartawi",
        topScorer: "Jilpach gol luriri",
        notAvailable: "Janiw utjkiti",
        noUpcomingMatch: "Janiw jutiri anatawi apthapitakiti.",
        noLiveMatches: "Jichhax janiw anatawi en vivo utjkiti.",
        fixturesResults: "Anatawinaka ukhamaraki resultados",
        noFixtures: "Janiw anatawinaka apthapitakiti.",
        groupLabel: "Tama",
        groupsAL: "Tamanaka A-L",
        noGroups: "Janiw tama tablas apthapitakiti.",
        noTeamsGroup: "Aka tamankirinakax janiw apthapitakiti.",
        goldenBoot: "Quri Zapato atipawi",
        noPlayerStats: "Janiw anatirinaka estadísticas apthapitakiti.",
        knockoutBracket: "Eliminatoria cuadro",
        fixturesNotAvailable: "Anatawinakax janiw utjkiti",
        highestMatchGoals: "Jilpach goles anatawi",
        biggestMargin: "Jach’a mayjt’awi",
        topTeamGoals: "Jilpach goles equipo",
        bestDefenceGA: "Suma jark’aqawi",
        highestScoringMatch: "Jilpach goles anatawi",
        biggestWin: "Jach’a atipawi",
        topScoringTeam: "Jilpach gol luriri equipo",
        bestDefence: "Suma jark’aqawi",
        noResult: "Janiw resultado utjkiti.",
        noTeamGoalData: "Janiw equipo goles yatiyawi utjkiti.",
        noDefensiveData: "Janiw jark’aqawi yatiyawi utjkiti.",
        matchesPlayed: "Anatata anatawinaka",
        yellowCards: "Q’illu tarjetas",
        redCards: "Wila tarjetas",
        minutes: "Minutos",
        goalsPerMatch: "Goles / anatawi",
        draws: "Empates",
        drawRate: "Empate tasa",
        bttsRate: "Panpachani gol lurapxi",
        over25Rate: "2.5 patxaru",
        stadiums: "Estadionaka",
        usaVenues: "USA stadionaka",
        canadaVenues: "Canadá stadionaka",
        mexicoVenues: "México stadionaka",
        finalVenue: "Final estadio",
        capacity: "Capacidad",
        worldCupStadiums: "Uraq Pacha Copa stadionaka",
        noVenueData: "Janiw estadio yatiyawi utjkiti.",
        scheduled: "Wakicht’ata",
        liveStatus: "En vivo",
        manualTimerNotice: 'En vivo resultados ukax automático ukham machaqaptayi. Gol pachanakax manual partido reloj apnaqapxi, oficial pachanakampix mä qawqha minutonak mayjt’aspawa.',
        paused: "Sayt’ata",
        fullTime: "Tukuy pacha",
        aet: "Tiempo extra qhipata",
        penalties: "Penales",
        postponed: "Qhiphart’ata",
        groupStage: "Tama fase",
        round32: "32 muyu",
        round16: "16 muyu",
        quarterFinals: "Cuartos de final",
        semiFinals: "Semifinal",
        thirdPlace: "Kimsa chiqawi",
        final: "Final",
        tbc: "Qhipat chiqanchata",
        unknown: "Jani uñt’ata",
        pos: "Pos",
        team: "Equipo",
        player: "Anatiri",
        goals: "Goles",
        assists: "Asistencias",
        language: "Dashboard aru",
        pcView: "PC u?ja?a",
        tabletView: "Tablet u?ja?a",
        viewMode: "Tablero u?ja?a",
        controlCentre: "Uraq Pacha Copa 2026 Control Centre",
        overviewSubtitle: "Torneo dashboard en vivo: anatawinaka, resultados, tamanaka, anatirinaka estadísticas, estadionaka, récords ukhamaraki eliminatoria mä chiqana.",
        tournamentIntelligence: "Torneo amuykipawi",
        goldenBootCentre: "Quri Zapato Centro",
        leaderSpotlight: "Irpiri uñacht’awi",
        playersTracked: "Arkatasqa anatirinaka",
        totalAssists: "Taqpach asistencias",
        totalYellowCards: "Taqpach q’illu tarjetas",
        totalRedCards: "Taqpach wila tarjetas",
        upNext: "Jutiri",
        matchSpotlight: "Anatawi uñacht’awi",
        upcomingFixtures: "Jutiri anatawinaka",
        latest: "Qhipa",
        recentResults: "Qhipa resultados",
        playerWatch: "Anatiri uñch’ukiwi",
        fixturesSubtitle: "Qhananchata partido centro, anatawi urunaka, marcador tarjetas, banderas, estadio yatiyawinaka ukhamaraki estado señales qhanampi.",
        days: "Urunaka",
        versus: "v",
        supportersNav: "🙏 Yanapt’irinaka",
        supportersThankYouTitle: "🙏 Yanapt’irinaka ukhamaraki yuspajara",
        supportersIntro: "Aka lurawi Home Assistant personal dashboardjam qallti, comunidad amuyunaka, pruebas, ideas ukhamaraki yanapt’awimpi jilxattawayi.",
        supportersSpecialThanks: "World Cup 2026 integración desarrollo yanapt’irinakar mä jach’a yuspajara.",
        supportersTitle: "🍺 Yanapt’irinaka",
        latestSupporters: "⭐ Qhipa yanapt’irinaka",
        allSupporters: "🌍 Taqpach yanapt’irinaka",
        supporterDefaultMessage: "Desarrollo yanapt’atamat yuspajara.",
        anonymousSupporter: "Jan sutini yanapt’iri",
        noSupporters: "Janiw yanapt’irinaka utjkiti. Nayrar saram, mä cerveza alirapita ukat sutimax aka chiqankani.",
        wantNameAdded: "Sutima aka chiqar yapxatañ munasmati?",
        supportFutureUpdates: "Jutiri machaqachawinaka, pantja askichawinaka ukhamaraki World Cup lurawinaka yanapt’am.",
        supporterBeerMessage: "🍺 Sutimax Supporters página uñstañap munasmati? PayPal tuqi mä cerveza alirapita, ukat sutimax World Cup 2026 supporters lista ukar yuspajara sutipjam yapxatasispawa.",
        donateBuyBeer: "🍺 Donar / Cerveza alaña",
        enjoyingIntegration: "🍺 Aka integración ukamp kusisiskta?",
        supportIntegration: "Aka integración yanapt’am",
        source: "Fuente",
        totalSupporters: "Taqpach yanapt’irinaka",
        countries: "Markanaka",
        countriesSupporting: "Yanapt’iri markanaka",
        latestSupportDate: "Qhipa yanapt’awi uru",
        playedShort: "PJ",
        winsShort: "G",
        drawsShort: "E",
        lossesShort: "P",
        goalsForShort: "GF",
        goalsAgainstShort: "GC",
        goalDifferenceShort: "DG",
        pointsShort: "Pts",
        noResultsLoaded: "Janiw resultados apthapitakiti.",
        finishedMatchesSubtitle: "Tukuyata anatawinaka chiqanchata resultados ukampi.",
        goldenBootAutoText: "Quri Zapato automático yatiyawi uñstani football-data.org World Cup goleadores yatiyawi apsuni ukapacha.",
        realStadium: "Chiqpach estadio",
        matchesHosted: "Apthapita anatawinaka",
        communitySupport: "Comunidad yanapt’awi",
        supportersAroundWorld: "Uraq pachpachan yanapt’irinaka",
        noLiveGames: "Janiw anatawinaka en vivo utjkiti",
        noGamesToday: "Jichha urux janiw anatawi utjkiti",
        conceded: "katusqa",
      },
    };
  }

  t(key) {
    const all = this.translations();
    const mobileViewFallbacks = {
      fr: "Vue mobile",
      de: "Mobile Ansicht",
      es: "Vista movil",
      it: "Vista mobile",
      nl: "Mobiele weergave",
      pt: "Vista movel",
      pl: "Widok mobilny",
      ja: "モバイル表示",
      sv: "Mobilvy",
      no: "Mobilvisning",
      hu: "Mobil nezet",
      tr: "Mobil gorunum",
      cs: "Mobilni zobrazeni",
      da: "Mobilvisning",
      fi: "Mobiilinakyma",
      el: "Προβολή κινητού",
      ro: "Vizualizare mobila",
      sk: "Mobilne zobrazenie",
      sl: "Mobilni pogled",
      hr: "Mobilni prikaz",
      sr: "Mobilni prikaz",
      bg: "Мобилен изглед",
      uk: "Мобільний вигляд",
      is: "Farsimasyn",
      qu: "Kuyuchina rikuy",
      gn: "Pumbyry jehecha",
      ay: "Móvil uñjawi",
    };
    if (key === "mobileView" && mobileViewFallbacks[this._language]) {
      return mobileViewFallbacks[this._language];
    }
    const labelFallbacks = {
      records: {
        fr: "Records du tournoi",
        nl: "Toernooirecords",
      },
      teams: {
        en: "Teams", fr: "Equipes", de: "Mannschaften", es: "Equipos", it: "Squadre", nl: "Ploegen", pt: "Equipas", pl: "Druzyny", ja: "チーム",
        sv: "Lag", no: "Lag", hu: "Csapatok", tr: "Takimlar", cs: "Tymy", da: "Hold", fi: "Joukkueet", el: "Ομάδες",
        ro: "Echipe", sk: "Timy", sl: "Ekipe", hr: "Timovi", sr: "Timovi", bg: "Отбори", uk: "Команди", is: "Lid",
        qu: "Equipos", gn: "Equipos", ay: "Equipos",
      },
      game: {
        en: "game", fr: "match", de: "Spiel", es: "partido", it: "partita", nl: "wedstrijd", pt: "jogo", pl: "mecz", ja: "試合",
        sv: "match", no: "kamp", hu: "meccs", tr: "mac", cs: "zapas", da: "kamp", fi: "ottelu", el: "αγώνας",
        ro: "meci", sk: "zapas", sl: "tekma", hr: "utakmica", sr: "утакмица", bg: "мач", uk: "матч", is: "leikur",
        qu: "partido", gn: "partido", ay: "partido",
      },
      games: {
        en: "games", fr: "matchs", de: "Spiele", es: "partidos", it: "partite", nl: "wedstrijden", pt: "jogos", pl: "mecze", ja: "試合",
        sv: "matcher", no: "kamper", hu: "meccs", tr: "mac", cs: "zapasy", da: "kampe", fi: "ottelua", el: "αγώνες",
        ro: "meciuri", sk: "zapasy", sl: "tekme", hr: "utakmice", sr: "утакмице", bg: "мачове", uk: "матчі", is: "leikir",
        qu: "partidos", gn: "partido", ay: "partidos",
      },
      today: {
        en: "today", fr: "aujourd'hui", de: "heute", es: "hoy", it: "oggi", nl: "vandaag", pt: "hoje", pl: "dzisiaj", ja: "今日",
        sv: "idag", no: "i dag", hu: "ma", tr: "bugun", cs: "dnes", da: "i dag", fi: "tanaan", el: "σήμερα",
        ro: "astazi", sk: "dnes", sl: "danes", hr: "danas", sr: "данас", bg: "днес", uk: "сьогодні", is: "i dag",
        qu: "kunan", gn: "ko arape", ay: "jichha uru",
      },
      stadiumWeather: {
        en: "Stadium Weather", fr: "Meteo du stade", de: "Stadionwetter", es: "Tiempo del estadio", it: "Meteo dello stadio", nl: "Stadionweer", pt: "Tempo no estadio", pl: "Pogoda na stadionie", ja: "スタジアム天気",
        sv: "Arenavader", no: "Stadionvaer", hu: "Stadion ido", tr: "Stadyum havasi", cs: "Pocasi stadionu", da: "Stadionvejr", fi: "Stadionin saa", el: "Καιρός σταδίου",
        ro: "Vreme stadion", sk: "Pocasie stadiona", sl: "Vreme stadiona", hr: "Vrijeme stadiona", sr: "Време стадиона", bg: "Време на стадиона", uk: "Погода стадіону", is: "Leikvangsvedur",
        qu: "Estadio pacha", gn: "Estadio arapytu", ay: "Estadio pacha",
      },
      weather: {
        en: "Weather", fr: "Meteo", de: "Wetter", es: "Tiempo", it: "Meteo", nl: "Weer", pt: "Tempo", pl: "Pogoda", ja: "天気",
        sv: "Vader", no: "Vaer", hu: "Idojaras", tr: "Hava", cs: "Pocasi", da: "Vejr", fi: "Saa", el: "Καιρός",
        ro: "Vreme", sk: "Pocasie", sl: "Vreme", hr: "Vrijeme", sr: "Време", bg: "Време", uk: "Погода", is: "Vedur",
        qu: "Pacha", gn: "Arapytu", ay: "Pacha",
      },
      wind: {
        en: "Wind", fr: "Vent", de: "Wind", es: "Viento", it: "Vento", nl: "Wind", pt: "Vento", pl: "Wiatr", ja: "風",
        sv: "Vind", no: "Vind", hu: "Szel", tr: "Ruzgar", cs: "Vitr", da: "Vind", fi: "Tuuli", el: "Άνεμος",
        ro: "Vant", sk: "Vietor", sl: "Veter", hr: "Vjetar", sr: "Ветар", bg: "Вятър", uk: "Вітер", is: "Vindur",
        qu: "Wayra", gn: "Yvytu", ay: "Thaya",
      },
      humidity: {
        en: "Humidity", fr: "Humidite", de: "Luftfeuchte", es: "Humedad", it: "Umidita", nl: "Vochtigheid", pt: "Humidade", pl: "Wilgotnosc", ja: "湿度",
        sv: "Luftfuktighet", no: "Fuktighet", hu: "Paratartalom", tr: "Nem", cs: "Vlhkost", da: "Fugtighed", fi: "Kosteus", el: "Υγρασία",
        ro: "Umiditate", sk: "Vlhkost", sl: "Vlaznost", hr: "Vlaga", sr: "Влажност", bg: "Влажност", uk: "Вологість", is: "Raki",
        qu: "Humedad", gn: "Takuvo", ay: "Humedad",
      },
      clouds: {
        en: "Clouds", fr: "Nuages", de: "Wolken", es: "Nubes", it: "Nuvole", nl: "Wolken", pt: "Nuvens", pl: "Chmury", ja: "雲",
        sv: "Moln", no: "Skyer", hu: "Felhok", tr: "Bulut", cs: "Oblaky", da: "Skyer", fi: "Pilvet", el: "Σύννεφα",
        ro: "Nori", sk: "Oblaky", sl: "Oblaki", hr: "Oblaci", sr: "Облаци", bg: "Облаци", uk: "Хмари", is: "Sky",
        qu: "Phuyu", gn: "Araity", ay: "Qinaya",
      },
      supportersNav: {
        nl: "🙏 Steuners",
      },
    };
    if (labelFallbacks[key]?.[this._language]) {
      return labelFallbacks[key][this._language];
    }
    return all[this._language]?.[key] || all.en[key] || key;
  }

  staticTextKeyMap() {
    return {
      "Tournament Intelligence": "tournamentIntelligence",
      "Stats Hub": "stats",
      "Event Coverage": "eventCoverage",
      "Lineup Coverage": "lineupCoverage",
      "Tournament Rates": "tournamentRates",
      "Data Health": "dataHealth",
      "Event timelines": "eventTimelines",
      "Lineups": "lineups",
      "Team Performance": "teamPerformance",
      "Team Event Leaders": "teamEventLeaders",
      "Lineups & Formations": "lineupsFormations",
      "Squad Usage": "squadUsage",
      "Player Starts": "playerStarts",
      "Bench Watch": "benchWatch",
      "Discipline Centre": "disciplineCentre",
      "Player Event Watch": "playerEventWatch",
      "Referee Stats": "refereeStats",
      "Match Records": "matchRecords",
      "Highest scoring match": "highestScoringMatch",
      "Biggest win": "biggestWin",
      "Assists": "assists",
      "Yellow Cards": "yellowCards",
      "Substitutions": "substitutions",
      "Referees": "referees",
      "Events / Match": "eventsPerMatch",
      "Cards / Match": "cardsPerMatch",
      "Progress": "progress",
      "Over 2.5 Goals": "over25Goals",
      "Draw Rate": "drawRate",
      "Team": "team",
      "Player": "player",
      "Goals": "goals",
      "Cards": "cards",
      "Events": "events",
      "Formation": "formation",
      "Used": "used",
      "Starters": "starters",
      "Bench": "bench",
      "Starts": "starts",
      "Yellow": "yellow",
      "Red": "red",
      "Subs": "subs",
      "Official": "official",
      "Matches": "matchesPlayed",
      "No team stats yet": "noTeamStatsYet",
      "No event data yet": "noEventDataYet",
      "No lineup data loaded yet": "noLineupDataYet",
      "No squad usage data yet": "noSquadUsageDataYet",
      "No starting XI data yet": "noStartingXiDataYet",
      "No bench data yet": "noBenchDataYet",
      "No discipline data yet": "noDisciplineDataYet",
      "No player event data yet": "noPlayerEventDataYet",
      "No referee data yet": "noRefereeDataYet",
      "No data yet": "noDataYet",
      "Matchday Control Room": "matchdayControlRoom",
      "Match Results": "matchResults",
      "Completed World Cup 2026 matches": "completedWorldCupMatches",
      "All times shown in your local time • FT = Full Time": "allTimesLocal",
      "API Results Test": "apiResultsTest",
      "No finished matches came back from the Home Assistant API feed yet.": "noApiFinishedMatches",
      "Direct backend/API finished matches only — no GitHub, no goal_events fallback": "directApiOnly",
      "No Golden Boot scorer data available yet.": "noGoldenBootData",
      "Official scorers first, with match-event data used only for assists, penalties and fallback coverage.": "officialScorersFirst",
      "Leaderboard": "leaderboard",
      "Golden Boot Table": "goldenBootTable",
      "Leader will appear when scorer data is available.": "leaderPending",
      "Knockout Stage": "knockoutStage",
      "Winner": "winner",
      "Knockout Details": "knockoutDetails",
      "Tournament Records": "tournamentRecords",
      "Records Centre": "recordsCentre",
      "Best matches, biggest wins, team leaders, discipline records and timeline event records in one place.": "recordsIntro",
      "Finished matches": "finishedMatches",
      "Team Records": "teamRecords",
      "Event Record Matches": "eventRecordMatches",
      "Top Event Teams": "topEventTeams",
      "Most Events": "mostEvents",
      "Most Cards": "mostCards",
      "Most Subs": "mostSubs",
      "Most VAR": "mostVar",
      "Most Eventful Match": "mostEventfulMatch",
      "Discipline Record": "disciplineRecord",
      "Clean Sheet Leader": "cleanSheetLeader",
      "Most Substitutions": "mostSubstitutions",
      "Most VAR Events": "mostVarEvents",
      "No event records yet": "noEventRecordsYet",
      "No team event records yet": "noTeamEventRecordsYet",
      "A proper tournament stats centre built from results, timelines, cards, substitutions, VAR, referees, player involvement and team lineups already loaded into the integration.": "statsIntro",
      "Stats Hub only uses data already loaded into the panel. This page does not trigger extra API pulls.": "statsNoExtraPulls",
      "Team Discipline": "teamDiscipline",
      "Team Command Centre": "teamCommandCentre",
      "Compact team hub with fixtures, results, cards, players, group table and tournament journey.": "teamCommandIntro",
      "Country Profile": "countryProfile",
      "Country Players": "countryPlayers",
      "Player cards are built from loaded goals, assists and event data.": "playerCardsBuilt",
      "Player Spotlight": "playerSpotlight",
      "Form Guide": "formGuide",
      "Group Snapshot": "groupSnapshot",
      "Tournament Journey": "tournamentJourney",
      "Stadium Tracker": "stadiumTracker",
      "Upcoming Fixtures": "upcomingFixtures",
      "Previous Results": "previousResults",
      "Team Statistics": "teamStatistics",
      "Goals Breakdown": "goalsBreakdown",
      "No teams loaded yet": "noTeamsLoadedYet",
      "No upcoming match loaded for this team yet": "noTeamUpcomingMatch",
      "No finished results loaded for this team yet": "noTeamResults",
      "No fixtures loaded for this team yet": "noTeamFixtures",
      "No group table loaded for this team yet": "noTeamGroupTable",
      "No player event data loaded for this team yet": "noTeamPlayerEvents",
      "No form data yet": "noFormDataYet",
      "No stadium data loaded for this team yet": "noTeamStadiumData",
      "No country player data loaded yet": "noCountryPlayerData",
      "No upcoming fixtures loaded for this team yet": "noUpcomingFixturesTeam",
      "No results loaded for this team yet": "noResultsTeam",
      "Support the World Cup 2026 Integration using Ko-fi or PayPal. Every donation helps with future updates, testing and new features.": "supportIntroFull",
      "Premium Supporters": "premiumSupporters",
      "Your name or nickname can be shown with your country flag in the integration.": "nameFlagText",
      "Personal Message": "personalMessage",
      "Every Donation Matters": "everyDonationMatters",
      "Live data costs": "liveDataCosts",
      "Bug fixes & improvements": "bugFixesImprovements",
      "Future features": "futureFeatures",
      "Community development": "communityDevelopment",
      "To be added, include your name, country and optional message after donating.": "toBeAddedSupporter",
      "Every supporter matters. Every donation helps. Every contribution is appreciated. ??": "everySupporterMatters",
    };
  }

  staticPhraseFallbacks() {
    const en = {
      eventCoverage: "Event Coverage",
      lineupCoverage: "Lineup Coverage",
      tournamentRates: "Tournament Rates",
      dataHealth: "Data Health",
      eventTimelines: "Event timelines",
      lineups: "Lineups",
      teamPerformance: "Team Performance",
      teamEventLeaders: "Team Event Leaders",
      lineupsFormations: "Lineups & Formations",
      squadUsage: "Squad Usage",
      playerStarts: "Player Starts",
      benchWatch: "Bench Watch",
      disciplineCentre: "Discipline Centre",
      playerEventWatch: "Player Event Watch",
      refereeStats: "Referee Stats",
      matchRecords: "Match Records",
      substitutions: "Substitutions",
      referees: "Referees",
      eventsPerMatch: "Events / Match",
      cardsPerMatch: "Cards / Match",
      over25Goals: "Over 2.5 Goals",
      cards: "Cards",
      events: "Events",
      formation: "Formation",
      used: "Used",
      starters: "Starters",
      bench: "Bench",
      starts: "Starts",
      yellow: "Yellow",
      red: "Red",
      subs: "Subs",
      official: "Official",
      noTeamStatsYet: "No team stats yet",
      noEventDataYet: "No event data yet",
      noLineupDataYet: "No lineup data loaded yet",
      noSquadUsageDataYet: "No squad usage data yet",
      noStartingXiDataYet: "No starting XI data yet",
      noBenchDataYet: "No bench data yet",
      noDisciplineDataYet: "No discipline data yet",
      noPlayerEventDataYet: "No player event data yet",
      noRefereeDataYet: "No referee data yet",
      noDataYet: "No data yet",
      matchdayControlRoom: "Matchday Control Room",
      matchResults: "Match Results",
      completedWorldCupMatches: "Completed World Cup 2026 matches",
      allTimesLocal: "All times shown in your local time - FT = Full Time",
      apiResultsTest: "API Results Test",
      noApiFinishedMatches: "No finished matches came back from the Home Assistant API feed yet.",
      directApiOnly: "Direct backend/API finished matches only - no GitHub, no goal_events fallback",
      noGoldenBootData: "No Golden Boot scorer data available yet.",
      officialScorersFirst: "Official scorers first, with match-event data used only for assists, penalties and fallback coverage.",
      leaderboard: "Leaderboard",
      goldenBootTable: "Golden Boot Table",
      leaderPending: "Leader will appear when scorer data is available.",
      knockoutStage: "Knockout Stage",
      winner: "Winner",
      knockoutDetails: "Knockout Details",
      tournamentRecords: "Tournament Records",
      recordsCentre: "Records Centre",
      recordsIntro: "Best matches, biggest wins, team leaders, discipline records and timeline event records in one place.",
      finishedMatches: "Finished matches",
      teamRecords: "Team Records",
      eventRecordMatches: "Event Record Matches",
      topEventTeams: "Top Event Teams",
      mostEvents: "Most Events",
      mostCards: "Most Cards",
      mostSubs: "Most Subs",
      mostVar: "Most VAR",
      mostEventfulMatch: "Most Eventful Match",
      disciplineRecord: "Discipline Record",
      cleanSheetLeader: "Clean Sheet Leader",
      mostSubstitutions: "Most Substitutions",
      mostVarEvents: "Most VAR Events",
      noEventRecordsYet: "No event records yet",
      noTeamEventRecordsYet: "No team event records yet",
      statsIntro: "A proper tournament stats centre built from results, timelines, cards, substitutions, VAR, referees, player involvement and team lineups already loaded into the integration.",
      statsNoExtraPulls: "Stats Hub only uses data already loaded into the panel. This page does not trigger extra API pulls.",
      teamDiscipline: "Team Discipline",
      teamCommandCentre: "Team Command Centre",
      teamCommandIntro: "Compact team hub with fixtures, results, cards, players, group table and tournament journey.",
      countryProfile: "Country Profile",
      upcomingMatches: "Upcoming Matches",
      countryPlayers: "Country Players",
      playerCardsBuilt: "Player cards are built from loaded goals, assists and event data.",
      playerSpotlight: "Player Spotlight",
      formGuide: "Form Guide",
      groupSnapshot: "Group Snapshot",
      tournamentJourney: "Tournament Journey",
      stadiumTracker: "Stadium Tracker",
      previousResults: "Previous Results",
      teamStatistics: "Team Statistics",
      goalsBreakdown: "Goals Breakdown",
      noTeamsLoadedYet: "No teams loaded yet",
      noTeamUpcomingMatch: "No upcoming match loaded for this team yet",
      noTeamResults: "No finished results loaded for this team yet",
      noTeamFixtures: "No fixtures loaded for this team yet",
      noTeamGroupTable: "No group table loaded for this team yet",
      noTeamPlayerEvents: "No player event data loaded for this team yet",
      noFormDataYet: "No form data yet",
      noTeamStadiumData: "No stadium data loaded for this team yet",
      noCountryPlayerData: "No country player data loaded yet",
      noUpcomingFixturesTeam: "No upcoming fixtures loaded for this team yet",
      noResultsTeam: "No results loaded for this team yet",
      supportIntroFull: "Support the World Cup 2026 Integration using Ko-fi or PayPal. Every donation helps with future updates, testing and new features.",
      supportViaKofi: "Support via Ko-fi",
      supportViaPaypal: "Support via PayPal",
      premiumTickerAria: "World Cup 2026 premium supporters",
      featuredMainDashboard: "Featured on the main dashboard",
      supportDevelopment: "Support development",
      helpApiCosts: "Help with API costs, fixes and live updates",
      minimumDonationFeatured: "Minimum GBP 10 donation to be featured",
      mainPageFeaturedSupporters: "Main-page featured supporters",
      joinSupporters: "Join",
      premiumFeatureText: "can have their name, country flag and a personalised message featured in the World Cup 2026 Integration.",
      premiumSupportIntro: "The World Cup 2026 integration has grown from a small personal Home Assistant dashboard into a full tournament system with fixtures, live scores, results, groups, knockout tracking, stadiums, records, Golden Boot data and supporter features.",
      premiumSupportCosts: "Every update takes time to build, test and maintain, and support also helps towards live football data, future improvements, bug fixes and project costs.",
      premiumSupporter: "Premium Supporter",
      donatePremiumText: "Donate GBP 10 / USD 10 / EUR 10 or more to be featured as a Premium Supporter.",
      nameFlag: "Name & Flag",
      premiumMessageText: "Premium Supporters can include a short message to appear with their supporter profile.",
      everyDonationText: "Whilst Premium Supporters receive extra recognition, every donation is genuinely appreciated regardless of amount. Anyone who supports the project can still be added to the Supporters page as a thank you.",
      supporterExample: "Example: Adrian Apel - Creator & Founder / John Smith - Supporting development from the USA / Klaus Meyer - Love the integration!",
      premiumSupporters: "Premium Supporters",
      nameFlagText: "Your name or nickname can be shown with your country flag in the integration.",
      personalMessage: "Personal Message",
      everyDonationMatters: "Every Donation Matters",
      liveDataCosts: "Live data costs",
      bugFixesImprovements: "Bug fixes & improvements",
      futureFeatures: "Future features",
      communityDevelopment: "Community development",
      toBeAddedSupporter: "To be added, include your name, country and optional message after donating.",
      everySupporterMatters: "Every supporter matters. Every donation helps. Every contribution is appreciated.",
      groupPosition: "Group Pos",
      currentSnapshot: "Current snapshot",
      points: "Points",
      groupTable: "Group table",
      tracked: "Tracked",
      byPlayers: "By players",
      cardsForTeam: "Cards from loaded match event data",
      allCards: "All cards",
      next: "Next",
      loadedForTeam: "Loaded for team",
      record: "Record",
      upcoming: "upcoming",
      forLabel: "For",
      against: "Against",
      scored: "Scored",
      clean: "Clean",
      sheets: "Sheets",
      current: "Current",
      total: "Total",
    };
    const simple = {
      fr: ["Couverture evenements","Couverture compositions","Taux du tournoi","Sante des donnees","Chronologies","Compositions","Performance equipe","Equipes leaders","Compositions et formations","Utilisation effectif","Titularisations","Banc","Discipline","Evenements joueurs","Stats arbitres","Records match","Remplacements","Arbitres","Evenements / match","Cartons / match","Plus de 2,5 buts","Cartons","Evenements","Formation","Utilise","Titulaires","Banc","Titularisations","Jaune","Rouge","Remp.","Officiel","Aucune stat equipe","Aucune donnee evenement","Aucune composition chargee","Aucune donnee effectif","Aucune donnee titulaires","Aucune donnee banc","Aucune donnee discipline","Aucune donnee joueur","Aucune donnee arbitre","Aucune donnee"],
      de: ["Ereignisabdeckung","Aufstellungsabdeckung","Turnierraten","Datenstatus","Ereignisverlauf","Aufstellungen","Teamleistung","Ereignisfuhrer","Aufstellungen & Formationen","Kadernutzung","Starts Spieler","Bank","Disziplin","Spielerereignisse","Schiedsrichter-Stats","Spielrekorde","Auswechslungen","Schiedsrichter","Ereignisse / Spiel","Karten / Spiel","Uber 2,5 Tore","Karten","Ereignisse","Formation","Genutzt","Starter","Bank","Starts","Gelb","Rot","Wechsel","Offizieller","Keine Teamdaten","Keine Ereignisdaten","Keine Aufstellungen","Keine Kaderdaten","Keine Startelf-Daten","Keine Bankdaten","Keine Disziplindaten","Keine Spielerdaten","Keine Schiedsrichterdaten","Keine Daten"],
      es: ["Cobertura eventos","Cobertura alineaciones","Tasas torneo","Salud de datos","Cronologia eventos","Alineaciones","Rendimiento equipo","Lideres eventos","Alineaciones y formaciones","Uso plantilla","Titularidades","Banquillo","Disciplina","Eventos jugador","Stats arbitros","Records partido","Sustituciones","Arbitros","Eventos / partido","Tarjetas / partido","Mas de 2,5 goles","Tarjetas","Eventos","Formacion","Usado","Titulares","Banquillo","Titularidades","Amarilla","Roja","Cambios","Oficial","Sin stats equipo","Sin eventos","Sin alineaciones","Sin uso plantilla","Sin once inicial","Sin banquillo","Sin disciplina","Sin datos jugador","Sin datos arbitro","Sin datos"],
      it: ["Copertura eventi","Copertura formazioni","Tassi torneo","Salute dati","Cronologia eventi","Formazioni","Prestazione squadra","Leader eventi","Formazioni e moduli","Uso rosa","Titolari","Panchina","Disciplina","Eventi giocatore","Stats arbitri","Record partita","Sostituzioni","Arbitri","Eventi / partita","Cartellini / partita","Over 2.5 gol","Cartellini","Eventi","Modulo","Usato","Titolari","Panchina","Presenze titolare","Giallo","Rosso","Sost.","Ufficiale","Nessuna stat squadra","Nessun evento","Nessuna formazione","Nessun uso rosa","Nessun dato XI","Nessun dato panchina","Nessuna disciplina","Nessun dato giocatore","Nessun dato arbitro","Nessun dato"],
      nl: ["Eventdekking","Opstellingdekking","Toernooiratio's","Datagezondheid","Eventtijdlijnen","Opstellingen","Teamprestatie","Eventleiders","Opstellingen & formaties","Selectiegebruik","Spelerstarts","Bank","Discipline","Spelerevents","Scheidsrechterstats","Wedstrijdrecords","Wissels","Scheidsrechters","Events / wedstrijd","Kaarten / wedstrijd","Meer dan 2,5 goals","Kaarten","Events","Formatie","Gebruikt","Starters","Bank","Starts","Geel","Rood","Wissels","Official","Geen teamstats","Geen eventdata","Geen opstellingen","Geen selectiegebruik","Geen basiself data","Geen bankdata","Geen discipline","Geen spelerdata","Geen scheidsrechterdata","Geen data"],
    };
    const keys = Object.keys(en);
    const out = { en };
    Object.entries(simple).forEach(([lang, values]) => {
      out[lang] = {};
      keys.forEach((key, index) => { out[lang][key] = values[index] || en[key]; });
    });
    const aliases = {
      pt: "es",
      qu: "es",
      gn: "es",
      ay: "es",
      pl: "de",
      sv: "de",
      no: "de",
      da: "de",
      fi: "de",
      is: "de",
      hu: "de",
      tr: "de",
      cs: "de",
      sk: "de",
      sl: "de",
      hr: "de",
      sr: "de",
      bg: "de",
      uk: "de",
      ro: "it",
      el: "it",
    };
    Object.entries(aliases).forEach(([lang, source]) => {
      out[lang] = out[source] || out.en;
    });
    out.ja = {
      eventCoverage: "イベント取得率",
      lineupCoverage: "ラインアップ取得率",
      tournamentRates: "大会レート",
      dataHealth: "データ状態",
      eventTimelines: "イベント履歴",
      lineups: "ラインアップ",
      teamPerformance: "チーム成績",
      teamEventLeaders: "イベント上位チーム",
      lineupsFormations: "ラインアップとフォーメーション",
      squadUsage: "選手起用",
      playerStarts: "先発回数",
      benchWatch: "ベンチ",
      disciplineCentre: "規律センター",
      playerEventWatch: "選手イベント",
      refereeStats: "審判統計",
      matchRecords: "試合記録",
      substitutions: "交代",
      referees: "審判",
      eventsPerMatch: "イベント / 試合",
      cardsPerMatch: "カード / 試合",
      over25Goals: "2.5点超",
      cards: "カード",
      events: "イベント",
      formation: "フォーメーション",
      used: "使用",
      starters: "先発",
      bench: "ベンチ",
      starts: "先発",
      yellow: "黄",
      red: "赤",
      subs: "交代",
      official: "審判",
      noTeamStatsYet: "チーム統計なし",
      noEventDataYet: "イベントデータなし",
      noLineupDataYet: "ラインアップなし",
      noSquadUsageDataYet: "選手起用データなし",
      noStartingXiDataYet: "先発XIデータなし",
      noBenchDataYet: "ベンチデータなし",
      noDisciplineDataYet: "規律データなし",
      noPlayerEventDataYet: "選手イベントなし",
      noRefereeDataYet: "審判データなし",
      noDataYet: "データなし",
    };
    const extra = {
      fr: {
        matchdayControlRoom: "Centre de controle du match", matchResults: "Resultats des matchs", completedWorldCupMatches: "Matchs termines Coupe du Monde 2026", allTimesLocal: "Toutes les heures sont locales - FT = Fin du match", apiResultsTest: "Test resultats API", noApiFinishedMatches: "Aucun match termine n'est revenu du flux API Home Assistant.", directApiOnly: "Matchs termines backend/API uniquement - sans GitHub ni goal_events", noGoldenBootData: "Aucune donnee Soulier d'Or disponible.", officialScorersFirst: "Buteurs officiels en premier, evenements utilises pour passes, penalties et couverture.", leaderboard: "Classement", goldenBootTable: "Table Soulier d'Or", leaderPending: "Le leader apparaitra quand les donnees seront disponibles.", knockoutStage: "Phase finale", winner: "Vainqueur", knockoutDetails: "Details phase finale", tournamentRecords: "Records du tournoi", recordsCentre: "Centre des records", recordsIntro: "Meilleurs matchs, plus larges victoires, leaders, discipline et evenements.", finishedMatches: "Matchs termines", teamRecords: "Records equipes", eventRecordMatches: "Matchs records d'evenements", topEventTeams: "Equipes leaders evenements", mostEvents: "Plus d'evenements", mostCards: "Plus de cartons", mostSubs: "Plus de remplacements", mostVar: "Plus de VAR", mostEventfulMatch: "Match le plus anime", disciplineRecord: "Record discipline", cleanSheetLeader: "Leader clean sheets", mostSubstitutions: "Plus de remplacements", mostVarEvents: "Plus d'evenements VAR", noEventRecordsYet: "Aucun record d'evenements", noTeamEventRecordsYet: "Aucun record equipe", statsIntro: "Centre de statistiques construit avec resultats, chronologies, cartons, remplacements, VAR, arbitres, joueurs et compositions.", statsNoExtraPulls: "Stats Hub utilise seulement les donnees deja chargees. Aucun appel API supplementaire.", teamDiscipline: "Discipline equipe", teamCommandCentre: "Centre equipe", teamCommandIntro: "Hub compact avec matchs, resultats, cartons, joueurs, groupe et parcours.", countryProfile: "Profil pays", countryPlayers: "Joueurs du pays", playerCardsBuilt: "Cartes joueurs creees depuis buts, passes et evenements.", playerSpotlight: "Joueur en vue", formGuide: "Forme", groupSnapshot: "Apercu groupe", tournamentJourney: "Parcours tournoi", stadiumTracker: "Suivi stades", previousResults: "Resultats precedents", teamStatistics: "Statistiques equipe", goalsBreakdown: "Details des buts", noTeamsLoadedYet: "Aucune equipe chargee", noTeamUpcomingMatch: "Aucun prochain match pour cette equipe", noTeamResults: "Aucun resultat termine pour cette equipe", noTeamFixtures: "Aucun match charge pour cette equipe", noTeamGroupTable: "Aucun tableau de groupe pour cette equipe", noTeamPlayerEvents: "Aucun evenement joueur pour cette equipe", noFormDataYet: "Aucune donnee de forme", noTeamStadiumData: "Aucune donnee stade pour cette equipe", noCountryPlayerData: "Aucune donnee joueur pays", noUpcomingFixturesTeam: "Aucun prochain match pour cette equipe", noResultsTeam: "Aucun resultat pour cette equipe", supportIntroFull: "Soutenez l'integration World Cup 2026 via Ko-fi ou PayPal.", premiumSupporters: "Supporters Premium", nameFlagText: "Votre nom ou pseudo peut etre affiche avec votre drapeau.", personalMessage: "Message personnel", everyDonationMatters: "Chaque don compte", liveDataCosts: "Couts des donnees live", bugFixesImprovements: "Corrections et ameliorations", futureFeatures: "Fonctionnalites futures", communityDevelopment: "Developpement communautaire", toBeAddedSupporter: "Pour etre ajoute, indiquez nom, pays et message apres le don.", everySupporterMatters: "Chaque supporter compte. Chaque don aide. Chaque contribution est appreciee."
      },
      de: {
        matchdayControlRoom: "Spieltags-Kontrollraum", matchResults: "Spielergebnisse", completedWorldCupMatches: "Abgeschlossene WM-2026-Spiele", allTimesLocal: "Alle Zeiten lokal - FT = Spielende", apiResultsTest: "API-Ergebnistest", noApiFinishedMatches: "Keine beendeten Spiele aus dem Home Assistant API-Feed.", directApiOnly: "Nur Backend/API-Ergebnisse - kein GitHub, kein goal_events", noGoldenBootData: "Noch keine Golden-Boot-Daten.", officialScorersFirst: "Offizielle Torschutzen zuerst, Ereignisdaten fur Assists, Elfmeter und Ersatz.", leaderboard: "Bestenliste", goldenBootTable: "Golden-Boot-Tabelle", leaderPending: "Der Fuhrende erscheint, sobald Daten vorhanden sind.", knockoutStage: "K.-o.-Phase", winner: "Sieger", knockoutDetails: "K.-o.-Details", tournamentRecords: "Turnierrekorde", recordsCentre: "Rekordzentrum", recordsIntro: "Beste Spiele, grosste Siege, Teamfuhrer, Disziplin und Ereignisrekorde.", finishedMatches: "Beendete Spiele", teamRecords: "Teamrekorde", eventRecordMatches: "Ereignis-Rekordspiele", topEventTeams: "Top-Ereignisteams", mostEvents: "Meiste Ereignisse", mostCards: "Meiste Karten", mostSubs: "Meiste Wechsel", mostVar: "Meiste VAR", mostEventfulMatch: "Ereignisreichstes Spiel", disciplineRecord: "Disziplinrekord", cleanSheetLeader: "Zu-Null-Fuhrer", mostSubstitutions: "Meiste Auswechslungen", mostVarEvents: "Meiste VAR-Ereignisse", noEventRecordsYet: "Noch keine Ereignisrekorde", noTeamEventRecordsYet: "Noch keine Team-Ereignisrekorde", statsIntro: "Statistikzentrum aus Ergebnissen, Zeitlinien, Karten, Wechseln, VAR, Schiris, Spielern und Aufstellungen.", statsNoExtraPulls: "Stats Hub nutzt nur bereits geladene Daten. Keine extra API-Abfragen.", teamDiscipline: "Teamdisziplin", teamCommandCentre: "Team-Kommandozentrum", teamCommandIntro: "Kompakter Teamhub mit Spielen, Ergebnissen, Karten, Spielern, Gruppe und Turnierweg.", countryProfile: "Landprofil", countryPlayers: "Landesspieler", playerCardsBuilt: "Spielerkarten aus Toren, Assists und Ereignissen.", playerSpotlight: "Spielerfokus", formGuide: "Formkurve", groupSnapshot: "Gruppenubersicht", tournamentJourney: "Turnierweg", stadiumTracker: "Stadion-Tracker", previousResults: "Vorherige Ergebnisse", teamStatistics: "Teamstatistiken", goalsBreakdown: "Toraufschlusselung", noTeamsLoadedYet: "Noch keine Teams geladen", noTeamUpcomingMatch: "Kein nachstes Spiel fur dieses Team", noTeamResults: "Keine beendeten Ergebnisse fur dieses Team", noTeamFixtures: "Keine Spiele fur dieses Team", noTeamGroupTable: "Keine Gruppentabelle fur dieses Team", noTeamPlayerEvents: "Keine Spielerereignisse fur dieses Team", noFormDataYet: "Keine Formdaten", noTeamStadiumData: "Keine Stadiondaten fur dieses Team", noCountryPlayerData: "Keine Landesspielerdaten", noUpcomingFixturesTeam: "Keine kommenden Spiele fur dieses Team", noResultsTeam: "Keine Ergebnisse fur dieses Team", supportIntroFull: "Unterstutze die World Cup 2026 Integration per Ko-fi oder PayPal.", premiumFeatureText: "konnen mit Name, Landesflagge und personlicher Nachricht in der World Cup 2026 Integration angezeigt werden.", premiumSupportIntro: "Die World Cup 2026 Integration ist von einem kleinen personlichen Home Assistant Dashboard zu einem kompletten Turniersystem mit Spielplan, Live-Ergebnissen, Resultaten, Gruppen, K.-o.-Phase, Stadien, Rekorden, Golden Boot Daten und Unterstutzerfunktionen gewachsen.", premiumSupportCosts: "Jedes Update braucht Zeit fur Entwicklung, Tests und Pflege. Unterstutzung hilft auch bei Live-Fussballdaten, zukunftigen Verbesserungen, Fehlerbehebungen und Projektkosten.", premiumSupporter: "Premium-Unterstutzer", donatePremiumText: "Spende 10 £ / 10 $ / 10 € oder mehr, um als Premium-Unterstutzer angezeigt zu werden.", nameFlag: "Name & Flagge", premiumMessageText: "Premium-Unterstutzer konnen eine kurze Nachricht in ihrem Unterstutzerprofil anzeigen lassen.", everyDonationText: "Premium-Unterstutzer erhalten besondere Anerkennung, aber jede Spende wird unabhangig vom Betrag ehrlich geschatzt. Jeder, der das Projekt unterstutzt, kann als Dank auf der Unterstutzerseite hinzugefugt werden.", supporterExample: "Beispiel: 🇬🇧 Adrian Apel — „Creator & Founder“ · 🇺🇸 John Smith — „Unterstutzt die Entwicklung aus den USA“ · 🇩🇪 Klaus Meyer — „Liebe die Integration!“", premiumSupporters: "Premium-Unterstutzer", nameFlagText: "Name oder Spitzname kann mit Landesflagge angezeigt werden.", personalMessage: "Personliche Nachricht", everyDonationMatters: "Jede Spende zahlt", liveDataCosts: "Live-Datenkosten", bugFixesImprovements: "Fehlerbehebungen & Verbesserungen", futureFeatures: "Zukunftige Funktionen", communityDevelopment: "Community-Entwicklung", toBeAddedSupporter: "Nach der Spende Name, Land und optionale Nachricht angeben.", everySupporterMatters: "Jeder Unterstutzer zahlt. Jede Spende hilft. Jeder Beitrag wird geschatzt."
      },
      es: {
        matchdayControlRoom: "Centro de control del partido", matchResults: "Resultados de partidos", completedWorldCupMatches: "Partidos completados Mundial 2026", allTimesLocal: "Todas las horas son locales - FT = Final", apiResultsTest: "Prueba de resultados API", noApiFinishedMatches: "No llegaron partidos terminados desde la API de Home Assistant.", directApiOnly: "Solo backend/API - sin GitHub ni goal_events", noGoldenBootData: "Aun no hay datos de Bota de Oro.", officialScorersFirst: "Goleadores oficiales primero, eventos solo para asistencias, penales y cobertura.", leaderboard: "Clasificacion", goldenBootTable: "Tabla Bota de Oro", leaderPending: "El lider aparecera cuando haya datos.", knockoutStage: "Fase eliminatoria", winner: "Ganador", knockoutDetails: "Detalles eliminatoria", tournamentRecords: "Records del torneo", recordsCentre: "Centro de records", recordsIntro: "Mejores partidos, mayores victorias, lideres, disciplina y records de eventos.", finishedMatches: "Partidos terminados", teamRecords: "Records de equipos", eventRecordMatches: "Partidos record de eventos", topEventTeams: "Equipos lideres en eventos", mostEvents: "Mas eventos", mostCards: "Mas tarjetas", mostSubs: "Mas cambios", mostVar: "Mas VAR", mostEventfulMatch: "Partido con mas eventos", disciplineRecord: "Record de disciplina", cleanSheetLeader: "Lider porterias a cero", mostSubstitutions: "Mas sustituciones", mostVarEvents: "Mas eventos VAR", noEventRecordsYet: "Sin records de eventos", noTeamEventRecordsYet: "Sin records de eventos por equipo", statsIntro: "Centro estadistico con resultados, cronologias, tarjetas, cambios, VAR, arbitros, jugadores y alineaciones.", statsNoExtraPulls: "Stats Hub solo usa datos ya cargados. No hace llamadas API extra.", teamDiscipline: "Disciplina del equipo", teamCommandCentre: "Centro del equipo", teamCommandIntro: "Hub compacto con partidos, resultados, tarjetas, jugadores, grupo y recorrido.", countryProfile: "Perfil del pais", countryPlayers: "Jugadores del pais", playerCardsBuilt: "Tarjetas de jugadores creadas con goles, asistencias y eventos.", playerSpotlight: "Jugador destacado", formGuide: "Guia de forma", groupSnapshot: "Resumen del grupo", tournamentJourney: "Recorrido del torneo", stadiumTracker: "Seguimiento de estadios", previousResults: "Resultados anteriores", teamStatistics: "Estadisticas del equipo", goalsBreakdown: "Desglose de goles", noTeamsLoadedYet: "No hay equipos cargados", noTeamUpcomingMatch: "No hay proximo partido para este equipo", noTeamResults: "No hay resultados terminados para este equipo", noTeamFixtures: "No hay partidos para este equipo", noTeamGroupTable: "No hay tabla de grupo para este equipo", noTeamPlayerEvents: "No hay eventos de jugadores para este equipo", noFormDataYet: "Sin datos de forma", noTeamStadiumData: "Sin datos de estadio para este equipo", noCountryPlayerData: "Sin datos de jugadores del pais", noUpcomingFixturesTeam: "Sin proximos partidos para este equipo", noResultsTeam: "Sin resultados para este equipo", supportIntroFull: "Apoya la integracion World Cup 2026 con Ko-fi o PayPal.", premiumSupporters: "Colaboradores Premium", nameFlagText: "Tu nombre o apodo puede mostrarse con la bandera de tu pais.", personalMessage: "Mensaje personal", everyDonationMatters: "Cada donacion importa", liveDataCosts: "Costes de datos en vivo", bugFixesImprovements: "Correcciones y mejoras", futureFeatures: "Funciones futuras", communityDevelopment: "Desarrollo comunitario", toBeAddedSupporter: "Para aparecer, incluye nombre, pais y mensaje opcional tras donar.", everySupporterMatters: "Cada colaborador importa. Cada donacion ayuda. Cada contribucion se agradece."
      },
    };
    Object.entries(extra).forEach(([lang, values]) => {
      out[lang] = { ...(out[lang] || {}), ...values };
    });
    const premiumTextFallbacks = {
      fr: {
        premiumFeatureText: "peuvent afficher leur nom, leur drapeau et un message personnalise dans l'integration World Cup 2026.",
        premiumSupportIntro: "L'integration World Cup 2026 est passee d'un petit tableau de bord Home Assistant personnel a un systeme complet de tournoi avec matchs, scores en direct, resultats, groupes, phase finale, stades, records, Soulier d'Or et fonctions de soutien.",
        premiumSupportCosts: "Chaque mise a jour demande du temps de developpement, de test et de maintenance. Le soutien aide aussi pour les donnees live, les futures ameliorations, les corrections et les couts du projet.",
        premiumSupporter: "Supporter Premium",
        donatePremiumText: "Donnez GBP 10 / USD 10 / EUR 10 ou plus pour etre affiche comme Supporter Premium.",
        nameFlag: "Nom et drapeau",
        premiumMessageText: "Les Supporters Premium peuvent ajouter un court message a leur profil.",
        everyDonationText: "Les Supporters Premium recoivent une reconnaissance speciale, mais chaque don est sincerement apprecie, quel que soit le montant. Toute personne qui soutient le projet peut aussi etre ajoutee a la page Supporters en remerciement.",
        supporterExample: "Exemple : Adrian Apel - Createur et fondateur / John Smith - Soutient le developpement depuis les USA / Klaus Meyer - J'adore l'integration !",
        supportViaKofi: "Soutenir via Ko-fi",
        supportViaPaypal: "Soutenir via PayPal",
        premiumTickerAria: "Supporters premium World Cup 2026",
        featuredMainDashboard: "Affiche sur le tableau de bord principal",
        supportDevelopment: "Soutenir le developpement",
        helpApiCosts: "Aide pour les couts API, corrections et mises a jour live",
        minimumDonationFeatured: "Don minimum de GBP 10 pour etre affiche",
        mainPageFeaturedSupporters: "Supporters affiches sur la page principale",
        joinSupporters: "Rejoindre",
      },
      de: {
        premiumFeatureText: "konnen mit Name, Landesflagge und personlicher Nachricht in der World Cup 2026 Integration angezeigt werden.",
        premiumSupportIntro: "Die World Cup 2026 Integration ist von einem kleinen personlichen Home Assistant Dashboard zu einem kompletten Turniersystem mit Spielplan, Live-Ergebnissen, Resultaten, Gruppen, K.-o.-Phase, Stadien, Rekorden, Golden Boot Daten und Unterstutzerfunktionen gewachsen.",
        premiumSupportCosts: "Jedes Update braucht Zeit fur Entwicklung, Tests und Pflege. Unterstutzung hilft auch bei Live-Fussballdaten, zukunftigen Verbesserungen, Fehlerbehebungen und Projektkosten.",
        premiumSupporter: "Premium-Unterstutzer",
        donatePremiumText: "Spende GBP 10 / USD 10 / EUR 10 oder mehr, um als Premium-Unterstutzer angezeigt zu werden.",
        nameFlag: "Name und Flagge",
        premiumMessageText: "Premium-Unterstutzer konnen eine kurze Nachricht in ihrem Unterstutzerprofil anzeigen lassen.",
        everyDonationText: "Premium-Unterstutzer erhalten besondere Anerkennung, aber jede Spende wird unabhangig vom Betrag ehrlich geschatzt. Jeder, der das Projekt unterstutzt, kann als Dank auf der Unterstutzerseite hinzugefugt werden.",
        supporterExample: "Beispiel: Adrian Apel - Creator & Founder / John Smith - Unterstutzt die Entwicklung aus den USA / Klaus Meyer - Liebe die Integration!",
        supportViaKofi: "Unterstutzen via Ko-fi",
        supportViaPaypal: "Unterstutzen via PayPal",
        premiumTickerAria: "World Cup 2026 Premium-Unterstutzer",
        featuredMainDashboard: "Auf dem Haupt-Dashboard angezeigt",
        supportDevelopment: "Entwicklung unterstutzen",
        helpApiCosts: "Hilft bei API-Kosten, Fehlerbehebungen und Live-Updates",
        minimumDonationFeatured: "Mindestens GBP 10 Spende fur die Anzeige",
        mainPageFeaturedSupporters: "Unterstutzer auf der Hauptseite",
        joinSupporters: "Mitmachen",
      },
      es: {
        premiumFeatureText: "pueden mostrar su nombre, bandera del pais y un mensaje personalizado en la integracion World Cup 2026.",
        premiumSupportIntro: "La integracion World Cup 2026 paso de ser un pequeno panel personal de Home Assistant a un sistema completo del torneo con fixtures, marcadores en vivo, resultados, grupos, eliminatorias, estadios, records, Bota de Oro y funciones para seguidores.",
        premiumSupportCosts: "Cada actualizacion requiere tiempo para crear, probar y mantener. El apoyo tambien ayuda con datos de futbol en vivo, mejoras futuras, correcciones y costes del proyecto.",
        premiumSupporter: "Seguidor Premium",
        donatePremiumText: "Dona GBP 10 / USD 10 / EUR 10 o mas para aparecer como Seguidor Premium.",
        nameFlag: "Nombre y bandera",
        premiumMessageText: "Los Seguidores Premium pueden incluir un mensaje corto en su perfil.",
        everyDonationText: "Los Seguidores Premium reciben reconocimiento extra, pero cada donacion se agradece de verdad sin importar la cantidad. Cualquiera que apoye el proyecto puede agregarse a la pagina de seguidores como agradecimiento.",
        supporterExample: "Ejemplo: Adrian Apel - Creador y fundador / John Smith - Apoyando el desarrollo desde EE. UU. / Klaus Meyer - Me encanta la integracion!",
        supportViaKofi: "Apoyar via Ko-fi",
        supportViaPaypal: "Apoyar via PayPal",
        premiumTickerAria: "Seguidores premium World Cup 2026",
        featuredMainDashboard: "Destacado en el panel principal",
        supportDevelopment: "Apoyar el desarrollo",
        helpApiCosts: "Ayuda con costes API, correcciones y actualizaciones en vivo",
        minimumDonationFeatured: "Donacion minima de GBP 10 para aparecer",
        mainPageFeaturedSupporters: "Seguidores destacados en la pagina principal",
        joinSupporters: "Unirse",
      },
      ja: {
        premiumFeatureText: "名前、国旗、個人メッセージを World Cup 2026 インテグレーションに表示できます。",
        premiumSupportIntro: "World Cup 2026 インテグレーションは、個人用の小さな Home Assistant ダッシュボードから、試合日程、ライブスコア、結果、グループ、決勝トーナメント、スタジアム、記録、ゴールデンブーツ、サポーター機能を備えた大会システムへ成長しました。",
        premiumSupportCosts: "各アップデートには開発、テスト、保守の時間が必要です。支援はライブデータ、今後の改善、不具合修正、プロジェクト費用にも役立ちます。",
        premiumSupporter: "プレミアムサポーター",
        donatePremiumText: "GBP 10 / USD 10 / EUR 10 以上の支援でプレミアムサポーターとして表示されます。",
        nameFlag: "名前と国旗",
        premiumMessageText: "プレミアムサポーターはプロフィールに短いメッセージを表示できます。",
        everyDonationText: "プレミアムサポーターには特別な表示がありますが、金額に関係なくすべての支援に心から感謝しています。支援してくれた方は、お礼としてサポーターページに追加できます。",
        supporterExample: "例: Adrian Apel - Creator & Founder / John Smith - USA から開発を支援 / Klaus Meyer - この統合が大好き!",
        supportViaKofi: "Ko-fi で支援",
        supportViaPaypal: "PayPal で支援",
        premiumTickerAria: "World Cup 2026 プレミアムサポーター",
        featuredMainDashboard: "メインダッシュボードに表示",
        supportDevelopment: "開発を支援",
        helpApiCosts: "API費用、不具合修正、ライブ更新を支援",
        minimumDonationFeatured: "表示には GBP 10 以上の支援",
        mainPageFeaturedSupporters: "メインページ掲載サポーター",
        joinSupporters: "参加",
      },
    };
    Object.entries(premiumTextFallbacks).forEach(([lang, values]) => {
      out[lang] = { ...(out[lang] || {}), ...values };
    });
    const replaceEnglishFallbacks = (lang, source) => {
      out[lang] = out[lang] || {};
      Object.keys(out.en).forEach((key) => {
        if ((out[lang][key] === undefined || out[lang][key] === out.en[key]) && out[source]?.[key] && out[source][key] !== out.en[key]) {
          out[lang][key] = out[source][key];
        }
      });
    };
    replaceEnglishFallbacks("it", "es");
    replaceEnglishFallbacks("nl", "es");
    replaceEnglishFallbacks("ja", "es");
    Object.entries(aliases).forEach(([lang, source]) => {
      out[lang] = { ...(out[lang] || {}), ...(out[source] || out.en) };
      replaceEnglishFallbacks(lang, source);
    });
    const teamSmallLabels = {
      fr: {
        groupPosition: "Position groupe",
        currentSnapshot: "Apercu actuel",
        points: "Points",
        groupTable: "Tableau groupe",
        tracked: "Suivis",
        byPlayers: "Par joueurs",
        cardsForTeam: "Cartons depuis les evenements charges",
        allCards: "Tous les cartons",
        next: "Suivant",
        loadedForTeam: "Charges pour l'equipe",
        record: "Bilan",
        upcoming: "a venir",
        forLabel: "Pour",
        against: "Contre",
        scored: "Marques",
        clean: "Clean",
        sheets: "Sheets",
        current: "Actuel",
        total: "Total",
      },
      de: {
        groupPosition: "Gruppenplatz",
        currentSnapshot: "Aktueller Stand",
        points: "Punkte",
        groupTable: "Gruppentabelle",
        tracked: "Erfasst",
        byPlayers: "Durch Spieler",
        cardsForTeam: "Karten aus geladenen Spielereignissen",
        allCards: "Alle Karten",
        next: "Nachstes",
        loadedForTeam: "Fur Team geladen",
        record: "Bilanz",
        upcoming: "kommend",
        forLabel: "Fur",
        against: "Gegen",
        scored: "Erzielt",
        clean: "Zu null",
        sheets: "Spiele",
        current: "Aktuell",
        total: "Gesamt",
      },
      es: {
        groupPosition: "Posicion grupo",
        currentSnapshot: "Vista actual",
        points: "Puntos",
        groupTable: "Tabla de grupo",
        tracked: "Seguidos",
        byPlayers: "Por jugadores",
        cardsForTeam: "Tarjetas desde eventos cargados",
        allCards: "Todas las tarjetas",
        next: "Siguiente",
        loadedForTeam: "Cargados para equipo",
        record: "Balance",
        upcoming: "proximos",
        forLabel: "A favor",
        against: "En contra",
        scored: "Marcados",
        clean: "Porteria",
        sheets: "a cero",
        current: "Actual",
        total: "Total",
      },
    };
    Object.entries(teamSmallLabels).forEach(([lang, values]) => {
      out[lang] = { ...(out[lang] || {}), ...values };
    });
    Object.entries(aliases).forEach(([lang, source]) => {
      out[lang] = { ...(out[lang] || {}), ...(teamSmallLabels[source] || {}) };
    });
    return out;
  }

  staticText(key) {
    const phrases = this.staticPhraseFallbacks();
    const all = this.translations();
    const translated = all[this._language]?.[key];
    if (translated && translated !== key) return translated;
    return phrases[this._language]?.[key] || phrases.en[key] || key;
  }

  applyStaticTextTranslations() {
    if (this._language === "en") return;
    const map = this.staticTextKeyMap();
    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const raw = node.nodeValue || "";
      const trimmed = raw.trim();
      const key = map[trimmed] || map[trimmed.replace(/^[^\w]+\\s*/u, "")];
      if (!key) return;
      const translated = this.staticText(key);
      node.nodeValue = raw.replace(trimmed, translated);
    });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._loaded) {
      this._loaded = true;
      this.loadAll();
    }
  }

  connectedCallback() {
    this.applyHideSidebarFromUrl();
    this.renderLoading();
    this._visibilityHandler = () => {
      if (!document.hidden) {
        this.updateCountdownDisplay();
        this.updateLiveClockDisplays();
        this.scheduleNextRefresh();
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);

    // Keep this panel synced without hammering GitHub/HA all day.
    this.scheduleNextRefresh();

    this._countdownInterval = setInterval(() => {
      if (document.hidden) return;
      this.updateCountdownDisplay();
      this.updateLiveClockDisplays();
    }, 1000);
  }

  disconnectedCallback() {
    if (this._sidebarObserver) {
      this._sidebarObserver.disconnect();
      this._sidebarObserver = null;
    }

    if (this._sidebarObservers) {
      this._sidebarObservers.forEach((observer) => observer.disconnect());
      this._sidebarObservers = [];
    }

    if (this._refreshInterval) {
      clearTimeout(this._refreshInterval);
      this._refreshInterval = null;
    }

    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }

    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
  }

  esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  loadJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  saveJsonStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage limits/private browsing failures.
    }
  }

  async callApi(type) {
    return await this._hass.connection.sendMessagePromise({ type });
  }

  async safeCall(type, fallback) {
    try {
      return await this.callApi(type);
    } catch {
      return fallback;
    }
  }

  async safeAsync(fn, fallback) {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  }

  async fetchJsonCached(cacheKey, url, ttlMs = 60 * 1000) {
    const now = Date.now();
    const cached = this._jsonFetchCache?.get(cacheKey);
    if (cached && now - cached.time < ttlMs) return cached.data;

    const separator = url.includes("?") ? "&" : "?";
    try {
      const response = await fetch(`${url}${separator}t=${Math.floor(now / Math.max(1000, ttlMs))}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this._jsonFetchCache.set(cacheKey, { time: now, data });
      return data;
    } catch (err) {
      if (cached) return cached.data;
      throw err;
    }
  }

  async loadSupporters() {
    const sortSupporters = (supporters) => {
      return [...supporters].sort((a, b) => {
        const aDate = new Date(a?.date || "1900-01-01").getTime();
        const bDate = new Date(b?.date || "1900-01-01").getTime();
        return bDate - aDate;
      });
    };

    const fetchSupporters = async (url) => {
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Supporters file not available");
      }

      const supporters = await response.json();
      return Array.isArray(supporters) ? sortSupporters(supporters) : [];
    };

    try {
      return await fetchSupporters("https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/supporters.json?t=" + Date.now());
    } catch {
      try {
        return await fetchSupporters("/world_cup_2026_frontend/data/supporters.json?t=" + Date.now());
      } catch {
        return [];
      }
    }
  }


  async loadPremiumSupporters() {
    const sortSupporters = (supporters) => {
      return [...supporters].sort((a, b) => {
        const aDate = new Date(a?.date || "1900-01-01").getTime();
        const bDate = new Date(b?.date || "1900-01-01").getTime();
        return bDate - aDate;
      });
    };

    const normaliseSupportersPayload = (payload) => {
      if (Array.isArray(payload)) return sortSupporters(payload);
      if (payload && Array.isArray(payload.premiumSupporters)) return sortSupporters(payload.premiumSupporters);
      if (payload && Array.isArray(payload.supporters)) return sortSupporters(payload.supporters);
      return [];
    };

    const fetchPremiumSupporters = async (url) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Premium supporters file not available");
      return normaliseSupportersPayload(await response.json());
    };

    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium_supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium-supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium-supporters/supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium-supporters/premium_supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium_supporters/supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium_supporters/premium_supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium%20supporters/supporters.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/premium%20supporters/premium_supporters.json?t=" + Date.now(),
      "/local/worldcup/premium_supporters.json?t=" + Date.now(),
      "/local/worldcup/premium-supporters/supporters.json?t=" + Date.now(),
      "/local/worldcup/premium_supporters/supporters.json?t=" + Date.now(),
      "/world_cup_2026_frontend/data/premium_supporters.json?t=" + Date.now(),
    ];

    for (const url of urls) {
      try {
        const supporters = await fetchPremiumSupporters(url);
        if (supporters.length) return supporters;
      } catch {
        // Try the next location.
      }
    }

    return [];
  }




  async loadPublicGoalEvents() {
    const ttlMs = (Array.isArray(this._data?.live) && this._data.live.length) ? 20 * 1000 : 60 * 1000;
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/world_cup_2026_goal_events.json",
      "/local/worldcup/world_cup_2026_goal_events.json",
    ];

    for (const url of urls) {
      try {
        const data = await this.fetchJsonCached(`goal-events:${url}`, url, ttlMs);
        if (data && typeof data === "object" && !Array.isArray(data)) return data;
      } catch (err) {
        // Try the next goal-events path.
      }
    }

    return {};
  }


  async loadPublicGithubLive() {
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/worldcup/world_cup_2026_live.json",
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/world_cup_2026_live.json",
      "/local/worldcup/world_cup_2026_live.json",
    ];

    for (const url of urls) {
      try {
        const data = await this.fetchJsonCached(`github-live:${url}`, url, 20 * 1000);
        const matches = Array.isArray(data)
          ? data
          : (Array.isArray(data?.live) ? data.live : (Array.isArray(data?.matches) ? data.matches : []));
        if (Array.isArray(data) || Array.isArray(data?.live) || Array.isArray(data?.matches)) return matches;
      } catch (err) {
        // Try the next public live path.
      }
    }

    return [];
  }


  async loadPublicGithubMatches() {
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/matches.json?v=2",
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/worldcup/matches.json",
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/www/worldcup/matches.json",
    ];

    for (const url of urls) {
      try {
        const data = await this.fetchJsonCached(`github-matches:${url}`, url, 5 * 60 * 1000);
        const matches = Array.isArray(data) ? data : (Array.isArray(data?.matches) ? data.matches : []);
        if (matches.length) return matches;
      } catch (err) {
        // Try the next public GitHub path.
      }
    }

    return [];
  }


  async loadPublicGithubResults() {
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/worldcup/world_cup_2026_results.json",
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/world_cup_2026_results.json",
      "/local/worldcup/world_cup_2026_results.json",
    ];

    for (const url of urls) {
      try {
        const data = await this.fetchJsonCached(`github-results:${url}`, url, 60 * 1000);
        const results = Array.isArray(data)
          ? data
          : (Array.isArray(data?.results) ? data.results : (Array.isArray(data?.matches) ? data.matches : []));
        if (results.length) return results;
      } catch (err) {
        // Try the next public results path.
      }
    }

    return [];
  }

  publicMatchKey(match) {
    if (!match) return "";
    if (match.id !== null && match.id !== undefined) return `id:${match.id}`;
    const utc = match.utcDate || match.date || "";
    const home = this.fixtureTeamKey(this.getHomeTeam(match));
    const away = this.fixtureTeamKey(this.getAwayTeam(match));
    return `${utc}|${home}|${away}`;
  }

  publicMatchKeys(match) {
    if (!match) return [];
    const keys = new Set();
    const add = (value) => {
      const text = String(value ?? "").trim();
      if (text) keys.add(text);
    };
    const home = this.fixtureTeamKey(this.getHomeTeam(match));
    const away = this.fixtureTeamKey(this.getAwayTeam(match));
    const rawDate = match.utcDate || match.date || "";
    const day = rawDate ? String(rawDate).slice(0, 10) : "";
    const kickoff = rawDate ? new Date(rawDate).getTime() : NaN;

    add(this.publicMatchKey(match));
    add(this.matchStorageId ? this.matchStorageId(match) : "");
    [
      "id",
      "matchId",
      "apiFootballFixtureId",
      "apiSportsFixtureId",
      "fixtureId",
      "fifaMatchNumber",
      "matchNumber",
    ].forEach((field) => {
      if (match[field] !== undefined && match[field] !== null && match[field] !== "") {
        add(`${field}:${match[field]}`);
      }
    });
    if (home && away && day) {
      add(`day:${day}|${home}|${away}`);
      add(`day:${day}|${away}|${home}`);
    }
    if (home && away && Number.isFinite(kickoff)) {
      add(`kick:${Math.round(kickoff / 600000)}|${home}|${away}`);
      add(`kick:${Math.round(kickoff / 600000)}|${away}|${home}`);
    }
    return [...keys];
  }

  findMatchingPublicMatch(match, publicByKey, publicMatches) {
    for (const key of this.publicMatchKeys(match)) {
      const found = publicByKey.get(key);
      if (found) return found;
    }

    const home = this.fixtureTeamKey(this.getHomeTeam(match));
    const away = this.fixtureTeamKey(this.getAwayTeam(match));
    const kickoff = new Date(match?.utcDate || match?.date || 0).getTime();
    const matchNumber = this.fixtureMatchNumber ? this.fixtureMatchNumber(match) : (match?.matchNumber || match?.fifaMatchNumber || "");

    return (Array.isArray(publicMatches) ? publicMatches : []).find((candidate) => {
      const cHome = this.fixtureTeamKey(this.getHomeTeam(candidate));
      const cAway = this.fixtureTeamKey(this.getAwayTeam(candidate));
      const sameTeams = home && away && ((home === cHome && away === cAway) || (home === cAway && away === cHome));
      if (!sameTeams) return false;

      const cNumber = this.fixtureMatchNumber ? this.fixtureMatchNumber(candidate) : (candidate?.matchNumber || candidate?.fifaMatchNumber || "");
      if (matchNumber && cNumber && String(matchNumber) === String(cNumber)) return true;

      const cKickoff = new Date(candidate?.utcDate || candidate?.date || 0).getTime();
      if (this.isLiveMatch(match) && this.isLiveMatch(candidate) && (!Number.isFinite(kickoff) || !Number.isFinite(cKickoff))) return true;
      return Number.isFinite(kickoff) && Number.isFinite(cKickoff) && Math.abs(kickoff - cKickoff) <= 6 * 60 * 60 * 1000;
    }) || null;
  }

  mergeGithubMatchData(localMatches, publicMatches) {
    const local = Array.isArray(localMatches) ? localMatches : [];
    const pub = Array.isArray(publicMatches) ? publicMatches : [];
    if (!pub.length) return local;

    const publicByKey = new Map();
    pub.forEach((match) => {
      this.publicMatchKeys(match).forEach((key) => publicByKey.set(key, match));
    });

    const mergedKeys = new Set();
    const merged = local.map((match) => {
      const publicMatch = this.findMatchingPublicMatch(match, publicByKey, pub);
      if (!publicMatch) return match;
      this.publicMatchKeys(publicMatch).forEach((key) => mergedKeys.add(key));

      const rawPublicGoalEvents = Array.isArray(publicMatch.goalEvents) ? publicMatch.goalEvents : [];
      const rawPublicEvents = Array.isArray(publicMatch.events) ? publicMatch.events : [];
      const publicGoalEvents = this.dedupeGoalEvents(rawPublicGoalEvents.length ? rawPublicGoalEvents : rawPublicEvents);
      const publicHasEvents = publicGoalEvents.length > 0;

      return {
        ...match,
        status: publicMatch.status || match.status,
        score: publicMatch.score || match.score,
        homeScore: publicMatch.homeScore ?? match.homeScore,
        awayScore: publicMatch.awayScore ?? match.awayScore,
        home_score: publicMatch.home_score ?? match.home_score,
        away_score: publicMatch.away_score ?? match.away_score,
        scoreSource: publicMatch.scoreSource || match.scoreSource,
        minute: publicMatch.minute ?? match.minute,
        lastUpdated: publicMatch.lastUpdated || match.lastUpdated,
        manualClock: publicMatch.manualClock || match.manualClock,
        fallbackClock: publicMatch.fallbackClock ?? match.fallbackClock,
        fallbackClockText: publicMatch.fallbackClockText || match.fallbackClockText,
        manualClockText: publicMatch.manualClockText || match.manualClockText,
        displayMinute: publicMatch.displayMinute || match.displayMinute,
        clockSeconds: publicMatch.clockSeconds ?? match.clockSeconds,
        goalEvents: publicHasEvents ? publicGoalEvents : match.goalEvents,
        cardEvents: Array.isArray(publicMatch.cardEvents) && publicMatch.cardEvents.length ? publicMatch.cardEvents : match.cardEvents,
        substitutionEvents: Array.isArray(publicMatch.substitutionEvents) && publicMatch.substitutionEvents.length ? publicMatch.substitutionEvents : match.substitutionEvents,
        events: Array.isArray(publicMatch.events) && publicMatch.events.length ? publicMatch.events : (publicHasEvents ? publicGoalEvents : match.events),
        referees: Array.isArray(publicMatch.referees) && publicMatch.referees.length ? publicMatch.referees : (Array.isArray(publicMatch.matchDetails?.referees) ? publicMatch.matchDetails.referees : match.referees),
        officials: Array.isArray(publicMatch.officials) && publicMatch.officials.length ? publicMatch.officials : (Array.isArray(publicMatch.matchDetails?.officials) ? publicMatch.matchDetails.officials : match.officials),
        referee: publicMatch.referee || match.referee,
        attendance: publicMatch.attendance ?? match.attendance,
        liveStatistics: publicMatch.liveStatistics || publicMatch.matchDetails?.liveStatistics || match.liveStatistics,
        homeCorners: publicMatch.homeCorners ?? publicMatch.matchDetails?.homeCorners ?? match.homeCorners,
        awayCorners: publicMatch.awayCorners ?? publicMatch.matchDetails?.awayCorners ?? match.awayCorners,
        homeShotsOnGoal: publicMatch.homeShotsOnGoal ?? publicMatch.matchDetails?.homeShotsOnGoal ?? match.homeShotsOnGoal,
        awayShotsOnGoal: publicMatch.awayShotsOnGoal ?? publicMatch.matchDetails?.awayShotsOnGoal ?? match.awayShotsOnGoal,
        homePossession: publicMatch.homePossession ?? publicMatch.matchDetails?.homePossession ?? match.homePossession,
        awayPossession: publicMatch.awayPossession ?? publicMatch.matchDetails?.awayPossession ?? match.awayPossession,
        homeFouls: publicMatch.homeFouls ?? publicMatch.matchDetails?.homeFouls ?? match.homeFouls,
        awayFouls: publicMatch.awayFouls ?? publicMatch.matchDetails?.awayFouls ?? match.awayFouls,
        homeOffsides: publicMatch.homeOffsides ?? publicMatch.matchDetails?.homeOffsides ?? match.homeOffsides,
        awayOffsides: publicMatch.awayOffsides ?? publicMatch.matchDetails?.awayOffsides ?? match.awayOffsides,
        lineups: publicMatch.lineups || publicMatch.lineupsData || publicMatch.matchDetails?.lineups || publicMatch.matchDetails?.lineupsData || match.lineups,
        lineupsData: publicMatch.lineupsData || publicMatch.lineups || publicMatch.matchDetails?.lineupsData || publicMatch.matchDetails?.lineups || match.lineupsData,
        weather: publicMatch.matchWeather || publicMatch.matchDetails?.weather || publicMatch.weather || match.matchWeather || match.weather,
        matchWeather: publicMatch.matchWeather || publicMatch.matchDetails?.weather || publicMatch.weather || match.matchWeather || match.weather,
        publicGithubSynced: true,
      };
    });

    pub.forEach((match) => {
      const keys = this.publicMatchKeys(match);
      if (!keys.some((key) => mergedKeys.has(key))) merged.push({ ...match, publicGithubSynced: true });
    });

    return merged;
  }

  liveMatchesFromGithub(publicMatches) {
    const liveStatuses = new Set(["IN_PLAY", "LIVE", "PAUSED", "HT", "HALF_TIME", "1H", "2H"]);
    return (Array.isArray(publicMatches) ? publicMatches : [])
      .filter((match) => liveStatuses.has(String(match?.status || "").toUpperCase()))
      .map((match) => ({ ...match, publicGithubSynced: true }));
  }




  mergeUniqueMatches(primary = [], extras = []) {
    const merged = [];
    const seen = new Set();
    const indexByKey = new Map();

    const mergeRichMatchDetails = (base, extra) => {
      if (!base || !extra) return base || extra;
      const mergedMatch = { ...base };
      [
        "events",
        "goalEvents",
        "cardEvents",
        "substitutionEvents",
        "varEvents",
        "referees",
        "officials",
        "lineups",
        "lineupsData",
        "apiFootballLineups",
      ].forEach((key) => {
        const baseList = Array.isArray(mergedMatch[key]) ? mergedMatch[key] : [];
        const extraList = Array.isArray(extra[key]) ? extra[key] : [];
        if (extraList.length > baseList.length) mergedMatch[key] = extraList;
      });
      const isMissingLiveValue = (value) => (
        value === undefined
        || value === null
        || value === ""
        || value === "-"
        || value === "—"
        || (Array.isArray(value) && !value.length)
      );
      const isUsefulLiveValue = (value) => !isMissingLiveValue(value);
      const extraMinute = Number(extra.minute);
      const baseMinute = Number(mergedMatch.minute);
      [
        "status",
        "matchStatus",
        "score",
        "homeScore",
        "awayScore",
        "home_score",
        "away_score",
        "scoreSource",
        "extra",
        "lastApiSync",
        "lastUpdated",
        "manualClock",
        "fallbackClock",
        "fallbackClockText",
        "clockSource",
      ].forEach((key) => {
        if (isMissingLiveValue(mergedMatch[key]) && isUsefulLiveValue(extra[key])) {
          mergedMatch[key] = extra[key];
        }
      });
      if (Number.isFinite(extraMinute) && (!Number.isFinite(baseMinute) || extraMinute > baseMinute || baseMinute === 0)) {
        mergedMatch.minute = extra.minute;
      }
      if (isUsefulLiveValue(extra.clockSeconds) && (isMissingLiveValue(mergedMatch.clockSeconds) || Number(extra.clockSeconds) > Number(mergedMatch.clockSeconds || 0))) {
        mergedMatch.clockSeconds = extra.clockSeconds;
      }
      const baseDisplayMinute = String(mergedMatch.displayMinute || mergedMatch.manualClockText || "").toLowerCase();
      const extraDisplayMinute = String(extra.displayMinute || extra.manualClockText || "").trim();
      if (extraDisplayMinute && (!baseDisplayMinute || baseDisplayMinute.includes("awaiting") || baseDisplayMinute === "0'")) {
        mergedMatch.displayMinute = extra.displayMinute || extra.manualClockText;
      }
      [
        "apiFootballFixtureId",
        "goalEventsSource",
        "liveStatistics",
        "homeCorners",
        "awayCorners",
        "homeShotsOnGoal",
        "awayShotsOnGoal",
        "homePossession",
        "awayPossession",
        "homeFouls",
        "awayFouls",
        "homeOffsides",
        "awayOffsides",
        "referee",
        "venue",
        "stadium",
        "matchWeather",
        "weather",
      ].forEach((key) => {
        if (
          isMissingLiveValue(mergedMatch[key])
          && extra[key] !== undefined
          && extra[key] !== null
          && extra[key] !== ""
        ) {
          mergedMatch[key] = extra[key];
        }
      });
      return mergedMatch;
    };

    const add = (match) => {
      if (!match) return;
      const keys = this.publicMatchKeys(match);
      const key = keys[0] || this.publicMatchKey(match) || this.matchStorageId(match) || JSON.stringify([
        match.id,
        match.matchId,
        match.matchNumber,
        match.utcDate,
        this.fixtureTeamKey(this.getHomeTeam(match)),
        this.fixtureTeamKey(this.getAwayTeam(match)),
      ]);
      const existingKey = keys.find((candidateKey) => seen.has(candidateKey)) || (seen.has(key) ? key : "");
      if (existingKey) {
        const index = indexByKey.get(existingKey);
        if (index !== undefined) merged[index] = mergeRichMatchDetails(merged[index], match);
        return;
      }
      keys.forEach((candidateKey) => {
        seen.add(candidateKey);
        indexByKey.set(candidateKey, merged.length);
      });
      if (!keys.length) {
        seen.add(key);
        indexByKey.set(key, merged.length);
      }
      merged.push(match);
    };

    (Array.isArray(primary) ? primary : []).forEach(add);
    (Array.isArray(extras) ? extras : []).forEach(add);
    return merged;
  }

  goalEventStoreToMatches(goalEventStore) {
    const store = goalEventStore && typeof goalEventStore === "object" && !Array.isArray(goalEventStore)
      ? goalEventStore
      : {};

    return Object.entries(store)
      .map(([key, extra]) => {
        if (!extra || typeof extra !== "object" || Array.isArray(extra)) return null;
        const homeTeam = extra.homeTeam || extra.home_team || extra.home || extra.homeName;
        const awayTeam = extra.awayTeam || extra.away_team || extra.away || extra.awayName;
        if (!homeTeam || !awayTeam) return null;

        const homeScore = extra.homeScore ?? extra.home_score ?? extra.score?.fullTime?.home ?? null;
        const awayScore = extra.awayScore ?? extra.away_score ?? extra.score?.fullTime?.away ?? null;
        const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined;
        const status = extra.status || (hasScore ? "FINISHED" : "TIMED");
        const utcDate = extra.utcDate || extra.date || extra.kickoff || extra.startTime || null;
        const events = Array.isArray(extra.events) ? extra.events : [];
        const goalEvents = Array.isArray(extra.goalEvents) ? extra.goalEvents : events.filter((event) => {
          const typeText = String(event?.type || event?.rawType || event?.eventType || "").toLowerCase();
          const detailText = String(event?.detail || event?.comments || "").toLowerCase();
          return typeText.includes("goal") || detailText.includes("goal");
        });

        return {
          id: extra.id || extra.matchId || extra.matchNumber || key,
          matchId: extra.matchId || extra.id || key,
          matchNumber: extra.matchNumber || extra.fifaMatchNumber || (String(key).match(/\d+/)?.[0] ? Number(String(key).match(/\d+/)[0]) : undefined),
          fifaMatchNumber: extra.fifaMatchNumber || extra.matchNumber,
          status,
          utcDate,
          date: utcDate,
          homeTeam: typeof homeTeam === "object" ? homeTeam : { name: String(homeTeam) },
          awayTeam: typeof awayTeam === "object" ? awayTeam : { name: String(awayTeam) },
          homeScore,
          awayScore,
          home_score: homeScore,
          away_score: awayScore,
          score: extra.score || { fullTime: { home: homeScore, away: awayScore } },
          goalEvents,
          events: events.length ? events : goalEvents,
          cardEvents: Array.isArray(extra.cardEvents) ? extra.cardEvents : [],
          substitutionEvents: Array.isArray(extra.substitutionEvents) ? extra.substitutionEvents : [],
          referees: Array.isArray(extra.referees) ? extra.referees : [],
          officials: Array.isArray(extra.officials) ? extra.officials : [],
          referee: extra.referee || "",
          venue: extra.venue || extra.stadium || extra.venueName || "",
          stadium: extra.stadium || extra.venue || extra.venueName || "",
          group: extra.group || "",
          stage: extra.stage || "",
          publicGoalEventsStoreOnly: true,
        };
      })
      .filter(Boolean);
  }

  mergeResultsAndFinishedFixtures(resultsFeed = [], fixtures = []) {
    const finishedFromFixtures = (Array.isArray(fixtures) ? fixtures : []).filter((match) => this.isFinishedMatch(match));
    return this.mergeUniqueMatches(Array.isArray(resultsFeed) ? resultsFeed : [], finishedFromFixtures)
      .filter((match) => this.isFinishedMatch(match));
  }


  apiOnlyFinishedResults(resultsFeed = []) {
    return (Array.isArray(resultsFeed) ? resultsFeed : [])
      .filter((match) => this.isFinishedMatch(match))
      .map((match) => this.stripManualStoredDetails(match))
      .filter(Boolean);
  }

  stripManualStoredDetails(match) {
    if (!match || typeof match !== "object") return match;

    const isManualEvent = (event) => {
      const source = String(event?.source || event?.eventSource || event?.origin || "").toLowerCase();
      return source === "manual" || source.includes("manual");
    };

    const cleanArray = (value) => Array.isArray(value) ? value.filter((event) => !isManualEvent(event)) : value;

    const cleaned = {
      ...match,
      goalEvents: cleanArray(match.goalEvents),
      events: cleanArray(match.events),
      cardEvents: cleanArray(match.cardEvents),
      substitutionEvents: cleanArray(match.substitutionEvents),
      apiFootballEvents: cleanArray(match.apiFootballEvents),
      publicGoalEventsSynced: false,
    };

    // If the whole match only came from a manual/local store, do not show it on
    // the API test page. That page must prove what the backend API really returns.
    const source = String(match.source || match.origin || match.feedSource || "").toLowerCase();
    if (source === "manual" || source.includes("goal_event_store") || source.includes("public_goal")) {
      return null;
    }

    return cleaned;
  }

  mergePublicGoalEventStore(matches, goalEventStore) {
    const list = Array.isArray(matches) ? matches : [];
    const store = goalEventStore && typeof goalEventStore === "object" && !Array.isArray(goalEventStore)
      ? goalEventStore
      : {};
    const storeEntries = Object.entries(store).filter(([, extra]) => extra && typeof extra === "object" && !Array.isArray(extra));

    const findStoreExtra = (match) => {
      const matchId = match.id ?? match.matchId ?? match.matchNumber;
      if (matchId !== null && matchId !== undefined && store[String(matchId)]) return store[String(matchId)];

      const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
      const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
      const kickoff = new Date(match?.utcDate || match?.date || 0).getTime();
      return storeEntries.find(([, extra]) => {
        const extraHome = this.fixtureTeamKey(extra.homeTeam || extra.home_team || extra.home || extra.team1 || "");
        const extraAway = this.fixtureTeamKey(extra.awayTeam || extra.away_team || extra.away || extra.team2 || "");
        const sameTeams = homeKey && awayKey && ((homeKey === extraHome && awayKey === extraAway) || (homeKey === extraAway && awayKey === extraHome));
        if (!sameTeams) return false;

        const extraKickoff = new Date(extra.utcDate || extra.date || extra.kickoff || extra.startTime || 0).getTime();
        if (!Number.isFinite(kickoff) || !Number.isFinite(extraKickoff)) return this.isLiveMatch(match);
        return Math.abs(kickoff - extraKickoff) <= 6 * 60 * 60 * 1000;
      })?.[1] || null;
    };

    return list.map((match) => {
      if (!match) return match;

      const extra = findStoreExtra(match);

      if (!extra || typeof extra !== "object" || Array.isArray(extra)) {
        return match;
      }

      const rawGoalEvents = Array.isArray(extra.goalEvents) ? extra.goalEvents : [];
      const rawEvents = Array.isArray(extra.events) ? extra.events : [];
      const goalEvents = this.dedupeGoalEvents(rawGoalEvents.length ? rawGoalEvents : rawEvents);
      const cardEvents = Array.isArray(extra.cardEvents) ? extra.cardEvents : [];
      const substitutionEvents = Array.isArray(extra.substitutionEvents)
        ? extra.substitutionEvents
        : rawEvents.filter((event) => {
            const typeText = String(event?.type || event?.rawType || event?.eventType || "").toLowerCase();
            const detailText = String(event?.detail || event?.comments || "").toLowerCase();
            return typeText.includes("subst") || typeText.includes("substitution") || detailText.includes("substitution");
          });
      const referees = Array.isArray(extra.referees) ? extra.referees : [];
      const officials = Array.isArray(extra.officials) ? extra.officials : [];

      const liveApiClockMaster = this.isLiveMatch(match) && (
        match.minute !== null && match.minute !== undefined && match.minute !== ""
        || String(match.clockSource || match.manualClock?.source || "").toLowerCase().includes("api")
      );

      return {
        ...match,
        status: extra.status || match.status,
        homeScore: extra.homeScore ?? match.homeScore,
        awayScore: extra.awayScore ?? match.awayScore,
        home_score: extra.homeScore ?? extra.home_score ?? match.home_score,
        away_score: extra.awayScore ?? extra.away_score ?? match.away_score,
        minute: liveApiClockMaster ? match.minute : (extra.minute ?? match.minute),
        manualClock: liveApiClockMaster ? match.manualClock : (extra.manualClock || match.manualClock),
        fallbackClock: liveApiClockMaster ? match.fallbackClock : (extra.fallbackClock ?? extra.clock_seconds ?? match.fallbackClock),
        fallbackClockText: liveApiClockMaster ? match.fallbackClockText : (extra.fallbackClockText || match.fallbackClockText),
        manualClockText: liveApiClockMaster ? match.manualClockText : (extra.manualClockText || match.manualClockText),
        displayMinute: liveApiClockMaster ? match.displayMinute : (extra.displayMinute || match.displayMinute),
        clockSeconds: liveApiClockMaster ? match.clockSeconds : (extra.clockSeconds ?? extra.clock_seconds ?? match.clockSeconds),
        goalEvents: goalEvents.length ? goalEvents : (Array.isArray(match.goalEvents) ? match.goalEvents : []),
        events: rawEvents.length ? rawEvents : (goalEvents.length ? goalEvents : (Array.isArray(match.events) ? match.events : [])),
        cardEvents: cardEvents.length ? cardEvents : (Array.isArray(match.cardEvents) ? match.cardEvents : []),
        substitutionEvents: substitutionEvents.length ? substitutionEvents : (Array.isArray(match.substitutionEvents) ? match.substitutionEvents : []),
        referees: referees.length ? referees : (Array.isArray(match.referees) ? match.referees : []),
        officials: officials.length ? officials : (Array.isArray(match.officials) ? match.officials : []),
        referee: extra.referee || match.referee,
        apiFootballFixtureId: extra.apiFootballFixtureId || match.apiFootballFixtureId,
        liveStatistics: extra.liveStatistics || extra.matchDetails?.liveStatistics || match.liveStatistics,
        homeCorners: extra.homeCorners ?? extra.matchDetails?.homeCorners ?? match.homeCorners,
        awayCorners: extra.awayCorners ?? extra.matchDetails?.awayCorners ?? match.awayCorners,
        homeShotsOnGoal: extra.homeShotsOnGoal ?? extra.matchDetails?.homeShotsOnGoal ?? match.homeShotsOnGoal,
        awayShotsOnGoal: extra.awayShotsOnGoal ?? extra.matchDetails?.awayShotsOnGoal ?? match.awayShotsOnGoal,
        homePossession: extra.homePossession ?? extra.matchDetails?.homePossession ?? match.homePossession,
        awayPossession: extra.awayPossession ?? extra.matchDetails?.awayPossession ?? match.awayPossession,
        homeFouls: extra.homeFouls ?? extra.matchDetails?.homeFouls ?? match.homeFouls,
        awayFouls: extra.awayFouls ?? extra.matchDetails?.awayFouls ?? match.awayFouls,
        homeOffsides: extra.homeOffsides ?? extra.matchDetails?.homeOffsides ?? match.homeOffsides,
        awayOffsides: extra.awayOffsides ?? extra.matchDetails?.awayOffsides ?? match.awayOffsides,
        lineups: extra.lineups || extra.lineupsData || extra.matchDetails?.lineups || extra.matchDetails?.lineupsData || match.lineups,
        lineupsData: extra.lineupsData || extra.lineups || extra.matchDetails?.lineupsData || extra.matchDetails?.lineups || match.lineupsData,
        weather: extra.matchWeather || extra.matchDetails?.weather || extra.weather || match.matchWeather || match.weather,
        matchWeather: extra.matchWeather || extra.matchDetails?.weather || extra.weather || match.matchWeather || match.weather,
        publicGoalEventsSynced: true,
      };
    });
  }


  matchKickoffTime(match) {
    const value = match?.utcDate || match?.date || match?.kickoff || match?.startTime;
    if (!value) return null;
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : null;
  }

  gameToday(matches) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return (matches || []).some((match) => {
      const kickoff = this.matchKickoffTime(match);
      return kickoff && kickoff >= start && kickoff < end;
    });
  }

  nextKickoffMs(matches) {
    const now = Date.now();
    let next = null;
    (matches || []).forEach((match) => {
      if (this.isFinishedMatch(match)) return;
      const kickoff = this.matchKickoffTime(match);
      if (!kickoff || kickoff < now) return;
      if (next === null || kickoff < next) next = kickoff;
    });
    return next;
  }

  refreshDelayMs() {
    const matches = this.allKnownMatches ? this.allKnownMatches() : [];
    const hasLive = matches.some((match) => this.isLiveMatch(match));
    if (hasLive) return 20 * 1000;

    const next = this.nextKickoffMs(matches);
    if (next !== null) {
      const until = next - Date.now();
      if (until <= 30 * 60 * 1000) return 60 * 1000;
      if (until <= 3 * 60 * 60 * 1000) return 5 * 60 * 1000;
    }

    return 30 * 60 * 1000;
  }

  scheduleNextRefresh(delay = null) {
    if (this._refreshInterval) {
      clearTimeout(this._refreshInterval);
      this._refreshInterval = null;
    }
    const refreshDelay = Number.isFinite(Number(delay)) ? Number(delay) : this.refreshDelayMs();
    const hiddenDelay = document.hidden ? Math.max(refreshDelay, 60 * 1000) : refreshDelay;
    this._refreshInterval = setTimeout(() => {
      this._refreshInterval = null;
      this.loadAll();
    }, Math.max(20 * 1000, hiddenDelay));
  }

  hasUsableMasterClock(match) {
    if (!match || !this.isLiveMatch(match)) return false;
    const awaiting = String(match?.displayMinute || match?.manualClockText || match?.manualClock?.displayMinute || "").toLowerCase().includes("awaiting");
    const minute = match.minute !== undefined && match.minute !== null && match.minute !== "" ? Number(match.minute) : null;
    if (Number.isFinite(minute) && minute >= 0) return true;

    const display = String(match.displayMinute || match.manualClock?.displayMinute || match.manualClockText || "").trim();
    if (display && !display.toLowerCase().includes("awaiting")) return true;

    const secondsCandidates = [
      match.manualClock?.seconds,
      match.manualClock?.clockSeconds,
      match.manualClock?.clock_seconds,
      match.clockSeconds,
      match.clock_seconds,
      match.fallbackClock,
      match.fallback_clock,
    ];
    for (const candidate of secondsCandidates) {
      const value = Number(candidate);
      if (Number.isFinite(value) && value > 0) return true;
    }

    const source = String(match?.clockSource || match?.manualClock?.source || "").toLowerCase();
    return source.includes("api") && !awaiting;
  }

  backendHasMasterLiveClock(matches) {
    return (Array.isArray(matches) ? matches : []).some((match) => this.hasUsableMasterClock(match));
  }

  async loadAll() {
    if (this._isLoading) {
      return;
    }
    this._isLoading = true;
    try {
      // MASTER MODE: this panel must read tournament data from the Home Assistant
      // backend only. The backend is the only place that should talk to your
      // football-data.org API and then export JSON for public/GitHub viewers.
      // Do not let GitHub/public JSON override this live panel, otherwise your
      // own dashboard can end up showing stale public data instead of your API pull.
      const [
        overview,
        apiLive,
        rawApiFixtures,
        apiResults,
      ] = await Promise.all([
        this.safeCall("world_cup_2026/get_overview", {
          total_matches: 104,
          played_matches: 0,
          upcoming_matches: 0,
          live_matches: 0,
          total_goals: 0,
          goals_per_match: 0,
          groups: 0,
          scorers: 0,
        }),
        this.safeCall("world_cup_2026/get_live_matches", []),
        this.safeCall("world_cup_2026/get_fixtures", []),
        this.safeCall("world_cup_2026/get_results", []),
      ]);
      this._data.overview = overview;
      const apiFixtures = this.completeOfficialFixtures(rawApiFixtures);

      // Pure backend/API-only test feed. Do not merge GitHub or goal_events here.
      // Use BOTH backend results and backend fixtures, because some finished games
      // can stay in fixtures before they appear in get_results. This keeps Canada
      // and similar finished games visible without using made-up/manual file data.
      this._data.apiResultsTest = this.apiOnlyFinishedResults(
        this.mergeResultsAndFinishedFixtures(apiResults, apiFixtures)
      );

      const [
        publicGoalEvents,
        publicResults,
        publicLive,
        publicGithubMatches,
      ] = await Promise.all([
        this.safeAsync(() => this.loadPublicGoalEvents(), {}),
        this.safeAsync(() => this.loadPublicGithubResults(), []),
        this.safeAsync(() => this.loadPublicGithubLive(), []),
        this.safeAsync(() => this.loadPublicGithubMatches(), []),
      ]);
      const publicMatches = this.mergeUniqueMatches(publicLive, publicGithubMatches);

      const storeMatches = this.goalEventStoreToMatches(publicGoalEvents);
      const fixturesWithStore = this.mergePublicGoalEventStore(apiFixtures, publicGoalEvents);
      const publicMatchesWithStore = this.mergePublicGoalEventStore(publicMatches, publicGoalEvents);
      const apiResultsWithStore = this.mergePublicGoalEventStore(Array.isArray(apiResults) ? apiResults : [], publicGoalEvents);
      const publicResultsWithStore = this.mergePublicGoalEventStore(publicResults, publicGoalEvents);
      const combinedResults = this.mergeUniqueMatches(apiResultsWithStore, publicResultsWithStore);

      const apiLiveWithStore = this.mergePublicGoalEventStore(
        (Array.isArray(apiLive) ? apiLive : []).filter((match) => this.isLiveMatch(match)),
        publicGoalEvents
      );
      const fixtureLiveWithStore = this.mergePublicGoalEventStore(
        (Array.isArray(fixturesWithStore) ? fixturesWithStore : []).filter((match) => this.isLiveMatch(match)),
        publicGoalEvents
      );
      const publicLiveWithStore = this.liveMatchesFromGithub(publicMatchesWithStore);
      const publicLiveDetailSource = this.mergeUniqueMatches(
        publicLiveWithStore,
        publicMatchesWithStore.filter((match) => this.isLiveMatch(match))
      );
      const localLiveWithFixtures = this.mergeUniqueMatches(apiLiveWithStore, fixtureLiveWithStore);
      const mergedLiveFromGithub = this.mergeGithubMatchData(localLiveWithFixtures, publicLiveDetailSource).filter((match) => this.isLiveMatch(match));
      // Main/provider dashboards keep their API clock. Viewer dashboards can have
      // a local live row with "Awaiting live API data"; merge the GitHub master
      // live feed so those devices get your exported minute/events every refresh.
      this._data.live = this.backendHasMasterLiveClock(localLiveWithFixtures)
        ? this.mergeGithubMatchData(localLiveWithFixtures, publicLiveDetailSource).filter((match) => this.isLiveMatch(match))
        : mergedLiveFromGithub;
      this._data.fixtures = this.mergeUniqueMatches(
        this.mergeGithubMatchData(fixturesWithStore, publicMatchesWithStore),
        storeMatches
      );
      this._data.results = this.mergeResultsAndFinishedFixtures(
        this.mergeUniqueMatches(combinedResults, publicMatchesWithStore.filter((match) => this.isFinishedMatch(match))),
        this._data.fixtures
      );
      const [
        groups,
        scorers,
        statistics,
        records,
        venues,
      ] = await Promise.all([
        this.safeCall("world_cup_2026/get_groups", []),
        this.safeCall("world_cup_2026/get_scorers", []),
        this.safeCall("world_cup_2026/get_statistics", {}),
        this.safeCall("world_cup_2026/get_records", {}),
        this.safeCall("world_cup_2026/get_venues", {}),
      ]);
      this._data.groups = groups;
      this._data.scorers = scorers;
      this._data.statistics = statistics;
      this._data.records = records;
      this._data.venues = venues;

      const now = Date.now();
      if (!this._supportersLoadedAt || now - this._supportersLoadedAt > 10 * 60 * 1000) {
        this._data.supporters = await this.safeAsync(() => this.loadSupporters(), this._data.supporters || []);
        this._supportersLoadedAt = now;
      }
      if (!this._premiumSupportersLoadedAt || now - this._premiumSupportersLoadedAt > 10 * 60 * 1000) {
        this._data.premiumSupporters = await this.safeAsync(() => this.loadPremiumSupporters(), this._data.premiumSupporters || []);
        this._premiumSupportersLoadedAt = now;
      }
      this._matchesByIdCache = null;
      this._matchesByIdCacheAt = 0;
      this.processMatchClockState();
      this.render();
    } catch (err) {
      this.renderError(err, { resetSavedPage: false });
    } finally {
      this._isLoading = false;
      this.scheduleNextRefresh();
    }
  }

  goBackToHomeAssistant() {
     history.back();

  }

  changePage(page) {
    const validPages = new Set(["overview", "live", "fixtures", "results", "groups", "knockout", "players", "records", "stats", "teams", "venues", "supporters"]);
    if (!validPages.has(page)) page = "overview";
    if (page !== this._page && page === "fixtures") {
      this._fixturesVisibleDays = 5;
      this._fixturesVisibleMatches = 20;
    }
    if (page !== this._page && page === "knockout") {
      this._knockoutVisibleMatches = 12;
    }
    this._page = page;
    try { localStorage.setItem("world_cup_2026_last_page", page); } catch (e) {}
    this.render();
  }

  resetPanelView() {
    try {
      localStorage.removeItem("world_cup_2026_last_page");
      localStorage.removeItem("world_cup_2026_selected_team");
    } catch (e) {}
    this._page = "overview";
    this.render();
  }

  changeLanguage(language) {
    const validLanguages = new Set(["en", "fr", "de", "es", "it", "nl", "pt", "pl", "ja", "sv", "no", "hu", "tr", "cs", "da", "fi", "el", "ro", "sk", "sl", "hr", "sr", "bg", "uk", "is", "qu", "gn", "ay"]);
    this._language = validLanguages.has(language) ? language : "en";
    localStorage.setItem("world_cup_2026_language", this._language);
    this.render();
  }

  changeViewMode(viewMode) {
    this._viewMode = ["pc", "tablet", "mobile"].includes(viewMode) ? viewMode : "pc";
    localStorage.setItem("world_cup_2026_view_mode", this._viewMode);
    this.render();
  }

  locale() {
    const locales = {
      en: "en-GB",
      fr: "fr-FR",
      de: "de-DE",
      es: "es-ES",
      it: "it-IT",
      nl: "nl-NL",
      qu: "qu-PE",
      gn: "gn-PY",
      ay: "ay-BO",
      pt: "pt-PT",
      pl: "pl-PL",
      ja: "ja-JP",
      sv: "sv-SE",
      no: "nb-NO",
      hu: "hu-HU",
      tr: "tr-TR",
      cs: "cs-CZ",
      da: "da-DK",
      fi: "fi-FI",
      el: "el-GR",
      ro: "ro-RO",
      sk: "sk-SK",
      sl: "sl-SI",
      hr: "hr-HR",
      sr: "sr-RS",
      bg: "bg-BG",
      uk: "uk-UA",
      is: "is-IS",
    };

    return locales[this._language] || "en-GB";
  }

  formatDate(value) {
    if (!value) return "";

    try {
      return new Date(value).toLocaleString(this.locale(), {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return value;
    }
  }

  statusLabel(status, match = null) {
    const displayMinute = String(match?.displayMinute || match?.manualClock?.displayMinute || "").trim();
    const displayMinuteLower = displayMinute.toLowerCase();
    const minute = match && match.minute !== undefined && match.minute !== null && match.minute !== "" ? Number(match.minute) : null;
    if (minute !== null && Number.isFinite(minute) && ["IN_PLAY", "LIVE", "1H", "2H"].includes(String(status))) {
      return `${minute}'`;
    }
    if (displayMinuteLower.includes("awaiting") && ["IN_PLAY", "LIVE", "1H", "2H", "ET"].includes(String(status).toUpperCase())) {
      return displayMinute;
    }
    if (displayMinute && displayMinute !== "Awaiting live API data" && ["IN_PLAY", "LIVE", "1H", "2H", "ET"].includes(String(status).toUpperCase())) {
      return displayMinute;
    }

    const labels = {
      TIMED: this.t("scheduled"),
      SCHEDULED: this.t("scheduled"),
      IN_PLAY: this.t("liveStatus"),
      LIVE: this.t("liveStatus"),
      "1H": "1st Half",
      "2H": "2nd Half",
      HT: "Half Time",
      HALF_TIME: "Half Time",
      PAUSED: "Half Time",
      FINISHED: this.t("fullTime"),
      FT: this.t("fullTime"),
      AET: this.t("aet"),
      PEN: this.t("penalties"),
      POSTPONED: this.t("postponed"),
      SUSPENDED: "Suspended",
    };
    return labels[status] || status || "";
  }


  matchStorageId(match) {
    const home = this.getHomeTeam(match);
    const away = this.getAwayTeam(match);
    return String(match?.id || match?.matchId || `${match?.utcDate || match?.date || "unknown"}|${home}|${away}`);
  }

  isLiveMatch(match) {
    const status = String(match?.status || match?.matchStatus || "").toUpperCase().trim();
    const liveStatuses = ["IN_PLAY", "LIVE", "PAUSED", "HT", "HALF_TIME", "1H", "2H", "ET", "BT", "P", "SUSP", "INT"];
    return liveStatuses.includes(status);
  }

  isLiveClockStatus(status) {
    return ["IN_PLAY", "LIVE", "1H", "2H", "ET", "EXTRA_TIME", "1ET", "2ET", "P", "SUSP", "INT"].includes(String(status || "").toUpperCase().trim());
  }

  isHalfTimeClockStatus(status) {
    return ["PAUSED", "HT", "HALF_TIME", "BREAK", "ET_HT", "EXTRA_TIME_HALF_TIME"].includes(String(status || "").toUpperCase().trim());
  }

  isFinishedClockStatus(status) {
    return ["FINISHED", "FT", "AET", "PEN"].includes(String(status || "").toUpperCase().trim());
  }

  matchDuration(match) {
    return String(match?.duration || match?.score?.duration || "").toUpperCase();
  }

  exportedClockState(match) {
    if (!match || typeof match !== "object") return null;

    const manual = match.manualClock && typeof match.manualClock === "object" ? match.manualClock : null;
    const status = String(manual?.status || match.status || match.matchStatus || "").toUpperCase().trim();

    let seconds = null;
    const directMinute = match.minute !== undefined && match.minute !== null && match.minute !== ""
      ? Number(match.minute)
      : null;
    if (Number.isFinite(directMinute)) {
      seconds = Math.max(0, Math.floor(directMinute * 60));
    }

    const candidates = [
      manual?.seconds,
      manual?.clockSeconds,
      manual?.clock_seconds,
      match.clockSeconds,
      match.clock_seconds,
      match.fallbackClock,
      match.fallback_clock,
    ];

    if (seconds === null) {
      for (const candidate of candidates) {
        const value = Number(candidate);
        if (Number.isFinite(value)) {
          seconds = Math.max(0, Math.floor(value));
          break;
        }
      }
    }

    const timer = manual?.timer || match.fallbackClockText || match.clockText || match.timer || null;
    const displayCandidate = String(match.displayMinute || manual?.displayMinute || match.manualClockText || "").trim();
    const displayIsUsable = displayCandidate && !displayCandidate.toLowerCase().includes("awaiting");

    if (seconds === null && displayIsUsable) {
      const stoppage = displayCandidate.match(/^(\d+)\+(\d+)'?$/);
      const minuteOnly = displayCandidate.match(/^(\d+)'?$/);
      if (stoppage) {
        seconds = (Number(stoppage[1]) + Number(stoppage[2])) * 60;
      } else if (minuteOnly) {
        seconds = Number(minuteOnly[1]) * 60;
      }
    }

    if (seconds === null && timer && /^\d+:\d{2}$/.test(String(timer))) {
      const [mins, secs] = String(timer).split(":").map((part) => Number(part));
      if (Number.isFinite(mins) && Number.isFinite(secs)) {
        seconds = Math.max(0, Math.floor((mins * 60) + secs));
      }
    }

    if (seconds === null) return null;

    const activeValue = manual?.active ?? match.clock_active ?? match.clockActive ?? null;
    // Viewer panels seed from the GitHub/master feed, then tick locally between pulls.
    // Some master feeds export active:false deliberately, so force a running viewer
    // clock while the match status is an active live phase. HT/FT still freeze.
    const active = this.isLiveClockStatus(status)
      ? true
      : (activeValue === null || activeValue === undefined ? false : !!activeValue);

    return {
      seconds,
      timer: timer || this.formatClockSeconds(seconds),
      displayMinute: displayIsUsable ? displayCandidate : this.displayMinuteFromSeconds(seconds),
      active,
      status,
      source: manual?.source || match.clockSource || (match.publicGithubSynced ? "github_master_clock" : "exported_manual_clock"),
    };
  }

  syncExportedClockState(match, state, previous, now) {
    const exported = this.exportedClockState(match);
    if (!exported) return { state, exported: null, changed: false };

    const previousBase = Number(previous?.githubBaseSeconds ?? previous?.offsetSeconds);
    const previousSyncedAt = Number(previous?.githubSyncedAt || 0);
    const needsResync = !Number.isFinite(previousBase)
      || !previousSyncedAt
      || Math.abs(Number(exported.seconds) - previousBase) > 10
      || previous?.githubActive !== exported.active
      || previous?.githubSource !== exported.source;

    if (!needsResync) {
      return { state: { ...state, fromGithubClock: true }, exported, changed: false };
    }

    const nextState = {
      ...state,
      status: exported.status || state.status,
      startedAt: exported.active ? now : null,
      offsetSeconds: exported.seconds,
      githubBaseSeconds: exported.seconds,
      githubSyncedAt: now,
      githubActive: exported.active,
      githubSource: exported.source,
      fromGithubClock: true,
    };

    if (exported.active) {
      delete nextState.freezeAt;
    } else {
      nextState.freezeAt = exported.seconds;
    }

    return { state: nextState, exported, changed: true };
  }

  isExtraTimeMatch(match) {
    const status = String(match?.status || "").toUpperCase();
    const duration = this.matchDuration(match);
    return ["ET", "EXTRA_TIME", "1ET", "2ET", "AET"].includes(status) || duration === "EXTRA_TIME" || duration === "PENALTY_SHOOTOUT";
  }

  currentClockSeconds(match, state = null, now = Date.now()) {
    const id = this.matchStorageId(match);
    const clockState = state || this._matchClockState?.[id];

    const exported = this.exportedClockState(match);
    if (exported) {
      const syncedState = clockState || {};
      const base = Number(syncedState.githubBaseSeconds ?? exported.seconds);
      const syncedAt = Number(syncedState.githubSyncedAt || now);
      const active = syncedState.githubActive ?? exported.active;

      if (!active) {
        return Math.max(0, Math.floor(Number(exported.seconds)));
      }

      if (!Number.isFinite(base) || !syncedAt) {
        return Math.max(0, Math.floor(Number(exported.seconds)));
      }

      return Math.max(0, Math.floor(base + ((now - syncedAt) / 1000)));
    }

    if (!clockState) return null;

    if (Number.isFinite(Number(clockState.freezeAt))) {
      return Math.max(0, Math.floor(Number(clockState.freezeAt)));
    }

    const offset = Number(clockState.offsetSeconds || 0);
    const startedAt = Number(clockState.startedAt || 0);
    if (!startedAt) return Math.max(0, Math.floor(offset));

    return Math.max(0, Math.floor(offset + ((now - startedAt) / 1000)));
  }

  formatClockSeconds(totalSeconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds || 0)));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  displayMinuteFromSeconds(totalSeconds) {
    const minute = Math.max(0, Math.floor(Number(totalSeconds || 0) / 60));
    return `${minute}'`;
  }

  allKnownMatches() {
    const matches = [];
    const seen = new Set();

    // Important: live is first, then results, then fixtures.
    // Do not process the same match twice, otherwise an old fixture copy can reset
    // lastHomeScore / lastAwayScore back to 0 and the live page will add the same goal
    // again every refresh.
    [this._data.live, this._data.results, this._data.fixtures].forEach((list) => {
      (Array.isArray(list) ? list : []).forEach((match) => {
        const id = this.matchStorageId(match);
        if (seen.has(id)) return;
        seen.add(id);
        matches.push(match);
      });
    });

    return matches;
  }

  matchesById() {
    const now = Date.now();
    if (this._matchesByIdCache && now - this._matchesByIdCacheAt < 5 * 1000) {
      return this._matchesByIdCache;
    }
    this._matchesByIdCache = new Map(this.allKnownMatches().map((match) => [this.matchStorageId(match), match]));
    this._matchesByIdCacheAt = now;
    return this._matchesByIdCache;
  }

  isElementInViewport(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    return rect.bottom >= 0 && rect.right >= 0 && rect.top <= height && rect.left <= width;
  }

  processMatchClockState() {
    const now = Date.now();
    const states = this.loadJsonStorage(this._matchClockStorageKey, {});
    const storedGoals = this.loadJsonStorage(this._goalEventStorageKey, {});
    // Public/corrected goal JSON must win over local clock placeholders.
    // This stops live pages from repeatedly showing guessed goals every refresh.
    const goals = { ...(storedGoals || {}), ...(this._localGoalEvents || {}) };
    let changed = false;
    let goalsChanged = false;

    this.allKnownMatches().forEach((match) => {
      const id = this.matchStorageId(match);
      const status = String(match?.status || "");
      const previous = states[id] || {};
      const homeTeam = this.getHomeTeam(match);
      const awayTeam = this.getAwayTeam(match);
      const homeScore = Number(this.getHomeScore(match));
      const awayScore = Number(this.getAwayScore(match));
      const hasScores = Number.isFinite(homeScore) && Number.isFinite(awayScore);
      let state = { ...previous };

      const exportedSync = this.syncExportedClockState(match, state, previous, now);
      state = exportedSync.state;
      if (exportedSync.changed) changed = true;

      if (!exportedSync.exported) {
        if (this.isLiveClockStatus(status)) {
          // No backend/API clock yet. Do not invent a browser timer from
          // kick-off time; show Awaiting live API data instead.
          state = {
            ...state,
            status,
            startedAt: null,
            offsetSeconds: 0,
            awaitingLiveApiData: true,
          };
          delete state.freezeAt;
          changed = true;
        } else if (this.isHalfTimeClockStatus(status)) {
          const previousSeconds = this.currentClockSeconds(match, state, now);
          const inExtraTime = this.isExtraTimeMatch(match) || Number(previousSeconds || 0) >= 90 * 60;
          state = {
            ...state,
            status,
            startedAt: null,
            offsetSeconds: inExtraTime ? 105 * 60 : 45 * 60,
            freezeAt: inExtraTime ? 105 * 60 : 45 * 60,
          };
          changed = true;
        } else if (this.isFinishedClockStatus(status)) {
          const finishAt = status === "AET" ? 120 * 60 : (status === "PEN" ? null : 90 * 60);
          state = {
            ...state,
            status,
            startedAt: null,
            offsetSeconds: finishAt ?? Number(state.offsetSeconds || 0),
            finished: true,
          };
          delete state.freezeAt;
          changed = true;
        }
      }

      if (hasScores) {
        const lastHome = Number(previous.lastHomeScore);
        const lastAway = Number(previous.lastAwayScore);

        // Do not invent goal scorers or goal times in the browser.
        // Scores can update before football-data.org has unfolded the goal
        // events, so the panel must wait for backend goalEvents instead of
        // saving a guessed local-clock minute.
        state.lastHomeScore = Math.max(Number.isFinite(lastHome) ? lastHome : 0, homeScore);
        state.lastAwayScore = Math.max(Number.isFinite(lastAway) ? lastAway : 0, awayScore);
        changed = true;
      }

      states[id] = state;
    });

    this._matchClockState = states;
    this._localGoalEvents = goals;
    if (changed) this.saveJsonStorage(this._matchClockStorageKey, states);
    if (goalsChanged) this.saveJsonStorage(this._goalEventStorageKey, goals);
  }

  apiClockText(match) {
    if (!match) return "Awaiting live API data";

    const status = String(match.status || match.matchStatus || "").toUpperCase().trim();

    if (this.isHalfTimeClockStatus(status)) return "HT";
    if (status === "SUSP" || status === "SUSPENDED") return "SUSP";
    if (status === "INT" || status === "INTERRUPTED") return "INT";
    if (status === "FT" || status === "FINISHED") return "FT";
    if (status === "AET") return "AET";
    if (status === "PEN" || status === "PENALTY_SHOOTOUT") return "PEN";

    const awaitingDisplay = String(match.displayMinute || match.manualClock?.displayMinute || match.manualClockText || "").trim();
    const awaitingText = awaitingDisplay.toLowerCase();

    // Viewer devices must trust the GitHub/master feed clock. Do this before
    // checking awaitingLiveApiData, because non-provider installs can receive
    // a local awaiting flag while the public GitHub copy already has the minute.
    const directMinute = match.minute !== undefined && match.minute !== null && match.minute !== ""
      ? Number(match.minute)
      : null;
    if (Number.isFinite(directMinute)) {
      if (directMinute === 0 && awaitingText.includes("awaiting")) {
        return awaitingDisplay || "Awaiting live API data";
      }
      const extra = match.extra !== undefined && match.extra !== null && match.extra !== ""
        ? Number(match.extra)
        : null;

      // Viewer panels can be between GitHub pulls. Seed from the master minute,
      // then keep a local display clock moving until the next GitHub refresh.
      if (this.isLiveClockStatus(status)) {
        const runningSeconds = this.currentClockSeconds(match);
        if (Number.isFinite(Number(runningSeconds)) && Number(runningSeconds) > 0) {
          const runningMinute = Math.max(0, Math.floor(Number(runningSeconds) / 60));
          return Number.isFinite(extra) && extra > 0 && directMinute >= 90
            ? `${directMinute}+${extra}'`
            : `${runningMinute}'`;
        }
      }

      // Fallback for feeds that include last sync data before local state exists.
      const lastSyncRaw = match.lastApiSync || match.manualClock?.lastApiSync || match.apiFootballLastSync;
      const lastSync = lastSyncRaw ? new Date(lastSyncRaw).getTime() : null;
      const baseSeconds = Number(match.clockSeconds ?? match.manualClock?.seconds ?? match.fallbackClock);
      if (lastSync && Number.isFinite(lastSync) && Number.isFinite(baseSeconds) && baseSeconds > 0 && this.isLiveMatch(match)) {
        const driftSeconds = Math.max(0, Math.min(90, Math.floor((Date.now() - lastSync) / 1000)));
        const displaySeconds = baseSeconds + driftSeconds;
        const displayMinute = Math.max(0, Math.floor(displaySeconds / 60));
        return Number.isFinite(extra) && extra > 0 && directMinute >= 90 ? `${directMinute}+${extra}'` : `${displayMinute}'`;
      }

      return Number.isFinite(extra) && extra > 0 ? `${directMinute}+${extra}'` : `${directMinute}'`;
    }

    const apiDisplay = String(match.displayMinute || match.manualClock?.displayMinute || match.manualClockText || "").trim();
    if (apiDisplay && !apiDisplay.toLowerCase().includes("awaiting")) {
      if (this.isLiveClockStatus(status)) {
        const runningSeconds = this.currentClockSeconds(match);
        if (Number.isFinite(Number(runningSeconds)) && Number(runningSeconds) > 0) {
          return this.displayMinuteFromSeconds(runningSeconds);
        }
      }
      return apiDisplay;
    }

    const exported = this.exportedClockState(match);
    if (exported?.displayMinute && !String(exported.displayMinute).toLowerCase().includes("awaiting")) {
      return exported.displayMinute;
    }

    return "Awaiting live API data";
  }

  manualClockText(match) {
    const status = String(match?.status || "");
    if (this.isFinishedClockStatus(status)) return "";

    // Keep this as a fallback for old public JSON, but do not use it as the
    // main live display. The live clock must come from the master API minute.
    const seconds = this.currentClockSeconds(match);
    if (seconds === null || seconds === undefined) return "Awaiting live API data";

    return this.displayMinuteFromSeconds(seconds);
  }

  liveClockText(match) {
    return this.apiClockText(match);
  }

  footballClockHtml(match) {
    const status = String(match?.status || "");
    if (!(this.isLiveClockStatus(status) || this.isHalfTimeClockStatus(status))) return "";

    const id = this.matchStorageId(match);
    const clockText = this.liveClockText(match);
    if (!clockText || clockText === "--") return "";

    const label = this.isHalfTimeClockStatus(status)
      ? this.t("paused")
      : (this.isExtraTimeMatch(match) ? this.t("aet") : this.t("liveStatus"));

    const liveClass = this.isLiveClockStatus(status)
      ? " wc-football-match-clock-wrap-live"
      : (this.isHalfTimeClockStatus(status) ? " wc-football-match-clock-wrap-paused" : "");

    return `
      <div class="wc-football-match-clock-wrap${liveClass}" title="${this.esc(this.t("manualTimerNotice"))}">
        <span class="wc-football-match-clock-label">${this.esc(label)}</span>
        <span class="wc-football-match-clock" data-match-id="${this.esc(id)}">${this.esc(clockText)}</span>
      </div>


    `;
  }

  statusHtml(match) {
    const status = String(match?.status || "");
    const id = this.matchStorageId(match);
    const liveOrPaused = this.isLiveClockStatus(status) || this.isHalfTimeClockStatus(status);

    let label = this.statusLabel(status, match);
    if (liveOrPaused && /\d+'$/.test(String(label))) {
      label = this.isExtraTimeMatch(match) ? "Extra Time" : this.t("liveStatus");
    }

    if (liveOrPaused) {
      return this.esc(label);
    }

    return this.esc(label);
  }

  updateLiveClockDisplays() {
    const manualClocks = this.querySelectorAll(".wc-football-match-clock[data-match-id]");
    if (!manualClocks.length) return;

    const matchesById = this.matchesById();
    manualClocks.forEach((clock) => {
      if (!this.isElementInViewport(clock)) return;
      const id = clock.getAttribute("data-match-id");
      const match = matchesById.get(id);
      if (!match) return;
      const nextText = this.liveClockText(match);
      if (clock.textContent !== nextText) clock.textContent = nextText;
    });
  }

  storedGoalEventsForMatch(match) {
    // football-data.org/backend goalEvents are the only source of truth.
    // Old browser localStorage goal times caused devices to disagree, so the
    // live panel no longer reads locally guessed scorer data.
    return [];
  }

  stageLabel(stage) {
    const labels = {
      GROUP_STAGE: this.t("groupStage"),
      LAST_32: this.t("round32"),
      LAST_16: this.t("round16"),
      QUARTER_FINALS: this.t("quarterFinals"),
      SEMI_FINALS: this.t("semiFinals"),
      THIRD_PLACE: this.t("thirdPlace"),
      FINAL: this.t("final"),
    };
    return labels[stage] || String(stage || "").replaceAll("_", " ");
  }

  groupNameLabel(groupName, index) {
    const fallbackLetter = String.fromCharCode(65 + index);
    const raw = String(groupName || "").trim();

    let letter = fallbackLetter;

    const groupCodeMatch = raw.match(/^GROUP[_\s-]?([A-Z])$/i);
    const groupWordMatch = raw.match(/^Group\s+([A-Z])$/i);
    const singleLetterMatch = raw.match(/^([A-Z])$/i);

    if (groupCodeMatch) {
      letter = groupCodeMatch[1].toUpperCase();
    } else if (groupWordMatch) {
      letter = groupWordMatch[1].toUpperCase();
    } else if (singleLetterMatch) {
      letter = singleLetterMatch[1].toUpperCase();
    } else if (raw && !raw.includes("_")) {
      return raw;
    }

    if (this._language === "ko") {
      return `${letter}${this.t("groupLabel")}`;
    }

    if (this._language === "ja") {
      return `${this.t("groupLabel")} ${letter}`;
    }

    return `${this.t("groupLabel")} ${letter}`;
  }


  cleanTeamName(team) {
    let raw = team;

    if (team && typeof team === "object") {
      raw =
        team.name ||
        team.shortName ||
        team.fullName ||
        team.country ||
        team.tla ||
        team.code ||
        this.t("tbc");
    }

    return String(raw || this.t("tbc"))
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
      .replace(/[🏴🏳️]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  teamLabel(team) {
    const name = this.cleanTeamName(team);

    const fixes = {
      USA: "United States",
      US: "United States",
      ARG: "Argentina",
      AUS: "Australia",
      AUT: "Austria",
      BEL: "Belgium",
      BIH: "Bosnia and Herzegovina",
      BRA: "Brazil",
      CAN: "Canada",
      COL: "Colombia",
      CRC: "Costa Rica",
      CRO: "Croatia",
      CZE: "Czechia",
      DEN: "Denmark",
      ECU: "Ecuador",
      EGY: "Egypt",
      ENG: "England",
      FRA: "France",
      GER: "Germany",
      DEU: "Germany",
      GHA: "Ghana",
      HAI: "Haiti",
      HON: "Honduras",
      IRN: "Iran",
      ITA: "Italy",
      CIV: "Côte d'Ivoire",
      JAM: "Jamaica",
      JPN: "Japan",
      KOR: "Korea Republic",
      MEX: "Mexico",
      MAR: "Morocco",
      NED: "Netherlands",
      NZL: "New Zealand",
      NGA: "Nigeria",
      NOR: "Norway",
      PAN: "Panama",
      PAR: "Paraguay",
      POL: "Poland",
      POR: "Portugal",
      QAT: "Qatar",
      KSA: "Saudi Arabia",
      SCO: "Scotland",
      SEN: "Senegal",
      SRB: "Serbia",
      RSA: "South Africa",
      ESP: "Spain",
      SWE: "Sweden",
      SUI: "Switzerland",
      TUN: "Tunisia",
      TUR: "Turkey",
      UKR: "Ukraine",
      URU: "Uruguay",
      WAL: "Wales",
      "South Korea": "Korea Republic",
      Türkiye: "Turkey",
      "Bosnia & Herz": "Bosnia and Herzegovina",
      "Bosnia & Herzegovina": "Bosnia and Herzegovina",
      "Bosnia-H.": "Bosnia and Herzegovina",
      "Bosnia-Herzegovina": "Bosnia and Herzegovina",
      "Ivory Coast": "Côte d'Ivoire",
      Curacao: "Curaçao",
      Uraguay: "Uruguay",
      "DR Congo": "Democratic Republic of Congo",
      "Congo DR": "Democratic Republic of Congo",
      UAE: "United Arab Emirates",
      "Republic of Ireland": "Ireland",
      "Cabo Verde": "Cape Verde",
      "Cape Verde Islands": "Cape Verde",
    };

    return fixes[name] || name || this.t("tbc");
  }



  localizedTeamName(team) {
    const canonicalName = this.teamLabel(team);

    if (!canonicalName || canonicalName === this.t("tbc") || canonicalName === "TBC") {
      return this.t("tbc");
    }

    const code = this.countryCode(canonicalName);
    const key = canonicalName.toLowerCase();

    const specialNames = {
      "gb-eng": {
        en: "England", fr: "Angleterre", de: "England", es: "Inglaterra", it: "Inghilterra", nl: "Engeland",
        ar: "إنجلترا", pt: "Inglaterra", pl: "Anglia", ja: "イングランド", ko: "잉글랜드", sv: "England", no: "England", is: "England",
      },
      "gb-sct": {
        en: "Scotland", fr: "Écosse", de: "Schottland", es: "Escocia", it: "Scozia", nl: "Schotland",
        ar: "اسكتلندا", pt: "Escócia", pl: "Szkocja", ja: "スコットランド", ko: "스코틀랜드", sv: "Skottland", no: "Skottland", is: "Skotland",
      },
      "gb-wls": {
        en: "Wales", fr: "Pays de Galles", de: "Wales", es: "Gales", it: "Galles", nl: "Wales",
        ar: "ويلز", pt: "País de Gales", pl: "Walia", ja: "ウェールズ", ko: "웨일스", sv: "Wales", no: "Wales", is: "Wales",
      },
    };

    const countryNameFixes = {
      "korea republic": {
        en: "Korea Republic", fr: "Corée du Sud", de: "Südkorea", es: "Corea del Sur", it: "Corea del Sud", nl: "Zuid-Korea",
        ar: "كوريا الجنوبية", pt: "Coreia do Sul", pl: "Korea Południowa", ja: "韓国", ko: "대한민국", sv: "Sydkorea", no: "Sør-Korea", is: "Suður-Kórea",
      },
      turkey: {
        en: "Turkey", fr: "Turquie", de: "Türkei", es: "Turquía", it: "Turchia", nl: "Turkije",
        ar: "تركيا", pt: "Turquia", pl: "Turcja", ja: "トルコ", ko: "튀르키예", sv: "Turkiet", no: "Tyrkia", is: "Tyrkland",
      },
    };

    if (specialNames[code]?.[this._language]) {
      return specialNames[code][this._language];
    }

    if (countryNameFixes[key]?.[this._language]) {
      return countryNameFixes[key][this._language];
    }

    if (code && !code.includes("-")) {
      try {
        const displayNames = new Intl.DisplayNames([this._language || "en"], { type: "region" });
        return displayNames.of(code.toUpperCase()) || canonicalName;
      } catch (err) {
        return canonicalName;
      }
    }

    return canonicalName;
  }

  localizedCountryName(country) {
    return this.localizedTeamName(country);
  }

  countryCode(team) {
    const rawName = this.teamLabel(team);
    const name = String(rawName || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const codes = {
      afghanistan: "af",
      albania: "al",
      algeria: "dz",
      andorra: "ad",
      angola: "ao",
      antigua: "ag",
      "antigua and barbuda": "ag",
      argentina: "ar",
      armenia: "am",
      aruba: "aw",
      australia: "au",
      austria: "at",
      azerbaijan: "az",
      bahamas: "bs",
      bahrain: "bh",
      bangladesh: "bd",
      barbados: "bb",
      belarus: "by",
      belgium: "be",
      belize: "bz",
      benin: "bj",
      bermuda: "bm",
      bhutan: "bt",
      bolivia: "bo",
      "bosnia and herzegovina": "ba",
      bosnia: "ba",
      botswana: "bw",
      brazil: "br",
      brunei: "bn",
      bulgaria: "bg",
      "burkina faso": "bf",
      burundi: "bi",
      cambodia: "kh",
      cameroon: "cm",
      canada: "ca",
      "cape verde": "cv",
      "cabo verde": "cv",
      "cape verde islands": "cv",
      cayman: "ky",
      "cayman islands": "ky",
      "central african republic": "cf",
      chad: "td",
      chile: "cl",
      china: "cn",
      colombia: "co",
      comoros: "km",
      congo: "cg",
      "congo brazzaville": "cg",
      "dr congo": "cd",
      "congo dr": "cd",
      "democratic republic of congo": "cd",
      "congo kinshasa": "cd",
      "costa rica": "cr",
      croatia: "hr",
      cuba: "cu",
      curacao: "cw",
      cyprus: "cy",
      czechia: "cz",
      "czech republic": "cz",
      denmark: "dk",
      djibouti: "dj",
      dominica: "dm",
      "dominican republic": "do",
      ecuador: "ec",
      egypt: "eg",
      "el salvador": "sv",
      england: "gb-eng",
      "equatorial guinea": "gq",
      eritrea: "er",
      estonia: "ee",
      eswatini: "sz",
      swaziland: "sz",
      ethiopia: "et",
      faroe: "fo",
      "faroe islands": "fo",
      fiji: "fj",
      finland: "fi",
      france: "fr",
      gabon: "ga",
      gambia: "gm",
      "the gambia": "gm",
      georgia: "ge",
      germany: "de",
      ghana: "gh",
      gibraltar: "gi",
      greece: "gr",
      grenada: "gd",
      guatemala: "gt",
      guinea: "gn",
      "guinea bissau": "gw",
      guyana: "gy",
      haiti: "ht",
      honduras: "hn",
      hongkong: "hk",
      "hong kong": "hk",
      hungary: "hu",
      iceland: "is",
      india: "in",
      indonesia: "id",
      iran: "ir",
      iraq: "iq",
      ireland: "ie",
      "republic of ireland": "ie",
      israel: "il",
      italy: "it",
      "ivory coast": "ci",
      "cote d ivoire": "ci",
      jamaica: "jm",
      japan: "jp",
      jordan: "jo",
      kazakhstan: "kz",
      kenya: "ke",
      kosovo: "xk",
      kuwait: "kw",
      kyrgyzstan: "kg",
      laos: "la",
      latvia: "lv",
      lebanon: "lb",
      lesotho: "ls",
      liberia: "lr",
      libya: "ly",
      liechtenstein: "li",
      lithuania: "lt",
      luxembourg: "lu",
      macau: "mo",
      madagascar: "mg",
      malawi: "mw",
      malaysia: "my",
      maldives: "mv",
      mali: "ml",
      malta: "mt",
      mauritania: "mr",
      mauritius: "mu",
      mexico: "mx",
      moldova: "md",
      mongolia: "mn",
      montenegro: "me",
      morocco: "ma",
      mozambique: "mz",
      myanmar: "mm",
      namibia: "na",
      nepal: "np",
      netherlands: "nl",
      holland: "nl",
      "new zealand": "nz",
      nicaragua: "ni",
      niger: "ne",
      nigeria: "ng",
      "north macedonia": "mk",
      macedonia: "mk",
      "northern ireland": "gb-nir",
      norway: "no",
      oman: "om",
      pakistan: "pk",
      palestine: "ps",
      panama: "pa",
      paraguay: "py",
      peru: "pe",
      philippines: "ph",
      poland: "pl",
      portugal: "pt",
      puerto: "pr",
      "puerto rico": "pr",
      qatar: "qa",
      romania: "ro",
      russia: "ru",
      rwanda: "rw",
      "saint kitts": "kn",
      "saint kitts and nevis": "kn",
      "saint lucia": "lc",
      "saint vincent": "vc",
      "saint vincent and the grenadines": "vc",
      samoa: "ws",
      "san marino": "sm",
      "sao tome": "st",
      "sao tome and principe": "st",
      "saudi arabia": "sa",
      scotland: "gb-sct",
      senegal: "sn",
      serbia: "rs",
      seychelles: "sc",
      "sierra leone": "sl",
      singapore: "sg",
      slovakia: "sk",
      slovenia: "si",
      somalia: "so",
      "south africa": "za",
      "south korea": "kr",
      "korea republic": "kr",
      spain: "es",
      "sri lanka": "lk",
      sudan: "sd",
      suriname: "sr",
      sweden: "se",
      switzerland: "ch",
      syria: "sy",
      taiwan: "tw",
      tajikistan: "tj",
      tanzania: "tz",
      thailand: "th",
      timor: "tl",
      "timor leste": "tl",
      togo: "tg",
      "trinidad and tobago": "tt",
      tunisia: "tn",
      turkey: "tr",
      turkiye: "tr",
      turkmenistan: "tm",
      uganda: "ug",
      ukraine: "ua",
      "united arab emirates": "ae",
      uae: "ae",
      "united kingdom": "gb",
      uk: "gb",
      "great britain": "gb",
      "united states": "us",
      "united states of america": "us",
      usa: "us",
      america: "us",
      uruguay: "uy",
      uzbekistan: "uz",
      venezuela: "ve",
      vietnam: "vn",
      wales: "gb-wls",
      yemen: "ye",
      zambia: "zm",
      zimbabwe: "zw",
    };

    if (codes[name]) return codes[name];

    try {
      const locales = [
        this._language || "en",
        "en", "fr", "de", "es", "it", "nl", "pt", "pl", "ja",
        "sv", "no", "hu", "tr", "cs", "da", "fi", "el", "ro",
        "sk", "sl", "hr", "sr", "bg", "uk", "is",
      ];
      const uniqueIsoCodes = [...new Set(Object.values(codes).filter((code) => /^[a-z]{2}$/.test(code)))];
      for (const locale of [...new Set(locales)]) {
        const displayNames = new Intl.DisplayNames([locale], { type: "region" });
        for (const code of uniqueIsoCodes) {
          const localizedName = displayNames.of(code.toUpperCase());
          const localizedKey = String(localizedName || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          if (localizedKey && localizedKey === name) return code;
        }
      }
    } catch (err) {
      // Manual football aliases above remain the source of truth if Intl is unavailable.
    }

    return "";
  }

  flag(team, small = false) {
    const name = this.teamLabel(team);
    const code = this.countryCode(name);

    if (!code || name === this.t("tbc") || name === "TBC") {
      return small
        ? `<span class="group-flag-missing">🏳️</span>`
        : `<div class="big-flag missing-flag">🏳️</div>`;
    }

    return `
      <img
        class="${small ? "group-flag-img" : "big-flag-img"}"
        src="https://flagcdn.com/w160/${code}.png"
        alt="${this.esc(name)} flag"
        loading="lazy"
        onerror="this.outerHTML='${small ? '<span class=&quot;group-flag-missing&quot;>🏳️</span>' : '<div class=&quot;big-flag missing-flag&quot;>🏳️</div>'}'"
      />
    `;
  }

  teamFlagBlock(team) {
    const name = this.teamLabel(team);
    const displayName = this.localizedTeamName(team);

    return `
      <div class="team-flag-block">
        ${this.flag(name)}
        <div class="team-flag-name">${this.esc(displayName)}</div>
      </div>
    `;
  }

  getHomeTeam(m) {
    return m.homeTeam || m.home || m.team1 || m.home_team || this.t("tbc");
  }

  getAwayTeam(m) {
    return m.awayTeam || m.away || m.team2 || m.away_team || this.t("tbc");
  }

  officialHomeScore(m) {
    return this.matchScoreWithoutShootoutPens(m, "home");
  }

  officialAwayScore(m) {
    return this.matchScoreWithoutShootoutPens(m, "away");
  }

  matchScoreWithoutShootoutPens(m, side) {
    const score = m?.score || {};
    const fullTime = score?.fullTime || score?.full_time || {};
    const regularTime = score?.regularTime || score?.regular_time || {};
    const afterExtraTime = score?.extraTime || score?.extra_time || score?.afterExtraTime || score?.after_extra_time || {};
    const status = String(m?.status || m?.matchStatus || "").toUpperCase();
    const penalties = score?.penalties || score?.penaltyShootout || m?.penalties || m?.penaltyScore || {};
    const penaltyValue = side === "home"
      ? Number(penalties.home ?? penalties.homeTeam ?? penalties.home_score)
      : Number(penalties.away ?? penalties.awayTeam ?? penalties.away_score);
    const hasShootout = status === "PEN"
      || status === "PENALTY_SHOOTOUT"
      || String(score?.duration || m?.duration || "").toUpperCase() === "PENALTY_SHOOTOUT"
      || penalties.home !== undefined
      || penalties.away !== undefined
      || penalties.homeTeam !== undefined
      || penalties.awayTeam !== undefined;
    const removeShootout = (value) => {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && Number.isFinite(penaltyValue) && penaltyValue > 1 && parsed >= penaltyValue) {
        return parsed - penaltyValue;
      }
      return value;
    };

    for (const bucket of [fullTime, afterExtraTime, regularTime]) {
      if (bucket && bucket[side] !== undefined && bucket[side] !== null) {
        return hasShootout ? removeShootout(bucket[side]) : bucket[side];
      }
    }

    const directScore = score && score[side] !== undefined && score[side] !== null ? score[side] : null;
    if (directScore !== null && !hasShootout) return directScore;

    const keys = side === "home"
      ? ["homeScore", "home_score", "scoreHome", "homeGoals"]
      : ["awayScore", "away_score", "scoreAway", "awayGoals"];

    for (const key of keys) {
      if (m && m[key] !== undefined && m[key] !== null) {
        return hasShootout ? removeShootout(m[key]) : m[key];
      }
    }

    return directScore !== null ? (hasShootout ? removeShootout(directScore) : directScore) : "-";
  }

  provisionalLiveScoreFromEvents(m) {
    if (!m || !this.isLiveMatch(m)) return null;
    const homeOfficial = Number(this.officialHomeScore(m));
    const awayOfficial = Number(this.officialAwayScore(m));
    if (!Number.isFinite(homeOfficial) || !Number.isFinite(awayOfficial)) return null;

    const events = this.normalisedMatchEvents ? this.normalisedMatchEvents(m) : [];
    const goalEvents = events.filter((event) => event.category === "goal" && !event.isMissedPenalty);
    if (!goalEvents.length) return null;

    let homeGoals = 0;
    let awayGoals = 0;
    const home = this.fixtureTeamKey(this.getHomeTeam(m));
    const away = this.fixtureTeamKey(this.getAwayTeam(m));

    goalEvents.forEach((event) => {
      const teamKey = this.fixtureTeamKey(event.team || "");
      if (event.isOwnGoal) {
        if (teamKey === home) awayGoals += 1;
        else if (teamKey === away) homeGoals += 1;
        return;
      }
      if (teamKey === home) homeGoals += 1;
      else if (teamKey === away) awayGoals += 1;
    });

    const officialTotal = homeOfficial + awayOfficial;
    const eventTotal = homeGoals + awayGoals;
    if (eventTotal <= officialTotal) return null;

    return { home: homeGoals, away: awayGoals, provisional: true };
  }

  getHomeScore(m) {
    const provisional = this.provisionalLiveScoreFromEvents(m);
    if (provisional) return provisional.home;
    return this.officialHomeScore(m);
  }

  getAwayScore(m) {
    const provisional = this.provisionalLiveScoreFromEvents(m);
    if (provisional) return provisional.away;
    return this.officialAwayScore(m);
  }

  renderLoading() {
    this.innerHTML = `
      ${this.styles()}
      <div class="wc-app ">
        <div class="wc-shell">
          <div class="wc-card">${this.t("loading")}</div>
        </div>
      </div>
    `;
  }

  errorCard(err, title = this.t("errorTitle"), text = this.t("errorText")) {
    return `
      <div class="wc-card">
        <h1>${this.esc(title)}</h1>
        <p>${this.esc(text)}</p>
        <button class="wc-pill wc-reset-panel-button" id="wc-reset-panel-button" type="button">Reset panel view</button>
        <pre>${this.esc(JSON.stringify(err || {}, null, 2))}</pre>
      </div>
    `;
  }

  renderError(err, options = {}) {
    if (options.resetSavedPage) {
      try { localStorage.removeItem("world_cup_2026_last_page"); } catch (e) {}
      this._page = "overview";
    }

    this.innerHTML = `
      ${this.styles()}
      <div class="wc-app wc-view-${this._viewMode} wc-page-error">
        <div class="wc-shell">
          ${this.nav()}
          ${this.errorCard(err)}
        </div>
      </div>
    `;

    const resetButton = this.querySelector("#wc-reset-panel-button");
    if (resetButton) resetButton.onclick = () => this.resetPanelView();
    this.querySelectorAll(".wc-nav button").forEach((button) => {
      button.onclick = () => this.changePage(button.getAttribute("data-page"));
    });
  }

  styles() {
    return `
      <style>
        .wc-app {
          min-height: 100vh;
          background:
            linear-gradient(
              rgba(6,16,31,0.55),
              rgba(16,42,63,0.70)
            ),
            url("/world_cup_2026_frontend/worldcup.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          color: white;
          font-family: Arial, sans-serif;
          padding: 22px;
          box-sizing: border-box;
        }

        .wc-app.wc-hide-sidebar-mode {
          width: 100vw;
          max-width: none;
          margin-left: 0;
        }

        .wc-shell {
          max-width: 1800px;
          margin: 0 auto;
        }

        .wc-app.wc-view-tablet .wc-shell {
          max-width: 1180px;
        }

        .wc-app.wc-view-tablet {
          padding: 14px;
        }

        .wc-app.wc-view-tablet .wc-title {
          font-size: 28px;
        }

        .wc-app.wc-view-tablet .wc-card,
        .wc-app.wc-view-tablet .wc-section {
          padding: 14px;
        }

        .wc-app.wc-view-tablet .overview-stat-grid,
        .wc-app.wc-view-tablet .wc-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .wc-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 18px;
        }

        .wc-title {
          font-size: 36px;
          font-weight: 900;
        }

        .wc-subtitle {
          opacity: 0.72;
          margin-top: 5px;
        }

        .wc-pill,
        .wc-badge {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.20);
          border-radius: 999px;
          padding: 9px 13px;
          font-size: 13px;
          white-space: nowrap;
        }

        .wc-back-button {
          cursor: pointer;
          background: rgba(255,255,255,0.10);
          color: white;
          border: 1px solid rgba(255,255,255,0.20);
          font-weight: 700;
        }

        .wc-donate-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          cursor: pointer;
          color: white;
          font-weight: 900;
          background: linear-gradient(135deg, rgba(0, 112, 186, 0.95), rgba(0, 200, 255, 0.35));
          border: 1px solid rgba(0, 200, 255, 0.55);
          box-shadow: 0 0 16px rgba(0, 200, 255, 0.25);
        }

        .wc-donate-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 22px rgba(0, 200, 255, 0.40);
        }

        
.wc-overview-beer-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,215,0,0.45);
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  font-size: 15px;
  box-shadow: 0 0 10px rgba(255,215,0,0.15), 0 0 20px rgba(255,215,0,0.10);
  transition: all 0.2s ease;
}

.wc-overview-beer-button:hover {
  border-color: rgba(255,215,0,0.8);
  box-shadow: 0 0 15px rgba(255,215,0,0.35), 0 0 30px rgba(255,215,0,0.20);
  transform: translateY(-1px);
}



        .overview-donate-card {
          margin-top: 14px;
          padding: 18px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 215, 0, 0.28);
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.10), rgba(255, 255, 255, 0.04));
        }

        .overview-donate-card .overview-donate-icon {
          font-size: 30px;
          line-height: 1;
        }

        .overview-donate-card .overview-donate-text {
          max-width: 720px;
          margin: 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: 14px;
          line-height: 1.45;
        }

        .overview-donate-card .wc-overview-beer-button {
          margin-top: 4px;
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.95), rgba(255, 152, 0, 0.78));
          border-color: rgba(255, 235, 59, 0.75);
          color: #101010;
          box-shadow: 0 0 16px rgba(255, 193, 7, 0.25), 0 0 28px rgba(255, 152, 0, 0.14);
        }

        .wc-header-title-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          width: 100%;
          min-width: 0;
        }

        .wc-header-live-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 24px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12.1px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0.25px;
          text-transform: uppercase;
          white-space: nowrap;
          width: 140px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 0 0 auto;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .wc-header-live-pill.live {
          justify-content: flex-start;
          color: #d8ffe8;
          background: rgba(0, 190, 85, 0.20);
          border: 1px solid rgba(0, 255, 120, 0.62);
          box-shadow: 0 0 14px rgba(0, 255, 120, 0.28);
        }

        .wc-header-live-pill.live .wc-live-ticker {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: wc-live-pill-scroll 14s linear infinite;
          will-change: transform;
        }

        .wc-header-live-pill.live:hover .wc-live-ticker {
          animation-play-state: paused;
        }

        @keyframes wc-live-pill-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .wc-header-live-pill.live .wc-live-ticker {
            padding-left: 0;
            animation: none;
          }
        }

        .wc-header-live-pill.offline {
          color: #ffe0e0;
          background: rgba(210, 28, 28, 0.22);
          border: 1px solid rgba(255, 82, 82, 0.66);
          box-shadow: 0 0 14px rgba(255, 60, 60, 0.25);
        }

        .wc-header-scheduled-pill {
          width: 140px;
          max-width: 140px;
        }

        .wc-header-countdown-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 1 1 auto;
          min-width: 220px;
          min-height: 42px;
          padding: 8px 18px;
          border-radius: 18px;
          color: #e9fbff;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: blur(12px);
          font-size: clamp(18px, 2.2vw, 32px);
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0.7px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-header-countdown-pill.is-hidden {
          display: none !important;
        }

        .wc-title-stack {
          min-width: 0;
          flex: 0 0 auto;
        }

        .wc-header-subtitle-inline {
          opacity: 0.62;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.1;
          margin-top: 1px;
          letter-spacing: 0.15px;
        }

        .overview-premium-strip {
          position: relative;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
          min-height: 46px;
          margin: 0 0 10px 0;
          padding: 7px 8px 7px 12px;
          border-radius: 18px;
          overflow: hidden;
          background:
            radial-gradient(circle at 12% 0%, rgba(255, 236, 150, 0.30), transparent 34%),
            linear-gradient(135deg, rgba(44, 31, 4, 0.74), rgba(13, 16, 34, 0.84) 52%, rgba(42, 26, 5, 0.76));
          border: 1px solid rgba(255, 220, 120, 0.34);
          box-shadow:
            0 12px 34px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.10),
            0 0 24px rgba(255, 196, 72, 0.13);
        }

        .overview-premium-glow {
          position: absolute;
          inset: -60% auto auto -10%;
          width: 180px;
          height: 180px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 226, 121, 0.32), transparent 64%);
          pointer-events: none;
          opacity: 0.75;
        }

        .overview-premium-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 178px;
          padding: 6px 10px;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid rgba(255, 225, 135, 0.22);
          color: #fff4c7;
          white-space: nowrap;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .overview-premium-crown {
          display: inline-grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 231, 134, 0.30), rgba(255, 168, 45, 0.14));
          border: 1px solid rgba(255, 226, 135, 0.32);
          filter: drop-shadow(0 0 10px rgba(255, 207, 72, 0.18));
        }

        .overview-premium-badge strong {
          display: block;
          font-size: 12px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0.2px;
        }

        .overview-premium-badge small {
          display: block;
          margin-top: 2px;
          font-size: 9px;
          line-height: 1;
          font-weight: 900;
          color: rgba(255, 244, 199, 0.66);
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        .overview-premium-marquee {
          position: relative;
          z-index: 1;
          min-width: 0;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
        }

        .overview-premium-track {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          animation-name: wc-premium-supporter-scroll;
          animation-duration: var(--premium-scroll-seconds, 140s);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-delay: var(--premium-scroll-delay, 0s);
          will-change: transform;
        }

        .overview-premium-strip:hover .overview-premium-track {
          animation-play-state: paused;
        }

        .premium-ticker-card {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 31px;
          padding: 6px 11px;
          border-radius: 999px;
          color: #fff8d8;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045));
          border: 1px solid rgba(255, 222, 136, 0.22);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 0 14px rgba(255, 203, 78, 0.08);
          font-size: 13px;
          font-weight: 950;
        }

        .premium-ticker-card small {
          margin-left: 2px;
          color: rgba(255, 248, 216, 0.62);
          font-size: 10px;
          font-weight: 850;
        }

        .premium-ticker-ad {
          background: linear-gradient(135deg, rgba(255, 218, 110, 0.18), rgba(255, 255, 255, 0.055));
          border-color: rgba(255, 222, 136, 0.34);
        }

        .premium-ticker-star {
          filter: drop-shadow(0 0 8px rgba(255, 211, 82, 0.22));
        }

        .premium-ticker-flag {
          font-size: 16px;
          line-height: 1;
        }

        .premium-ticker-name {
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .overview-premium-cta {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          border: 0;
          cursor: pointer;
          min-height: 32px;
          padding: 7px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 223, 118, 0.30), rgba(255, 168, 44, 0.18));
          color: #fff3bd;
          font-size: 11px;
          font-weight: 1000;
          white-space: nowrap;
          border: 1px solid rgba(255, 223, 118, 0.38);
          box-shadow: 0 0 16px rgba(255, 192, 58, 0.14);
        }

        @keyframes wc-premium-supporter-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }

        @media (max-width: 800px) {
          .overview-premium-strip {
            grid-template-columns: minmax(0, 1fr) auto;
            min-height: 42px;
            padding: 6px 7px;
            gap: 8px;
          }

          .overview-premium-badge {
            display: none;
          }

          .overview-premium-track {
            animation-duration: var(--premium-scroll-seconds, 140s);
          }

          .premium-ticker-card {
            min-height: 29px;
            padding: 5px 9px;
            font-size: 12px;
          }

          .premium-ticker-card small {
            display: none;
          }

          .overview-premium-cta {
            padding: 6px 9px;
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .overview-premium-track {
            animation: none;
          }
        }


        .overview-supporters-card {
          background:
            radial-gradient(circle at top left, rgba(255,220,120,0.15), transparent 34%),
            rgba(255,255,255,0.08);
          border-color: rgba(255,220,120,0.24);
        }

        .overview-supporters-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(210px, 0.6fr);
          gap: 14px;
          align-items: stretch;
        }

        .overview-supporters-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 8px;
        }

        .overview-supporter-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.10);
          min-width: 0;
        }

        .overview-supporter-pill strong,
        .overview-supporter-pill span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .overview-supporter-pill strong {
          font-size: 13px;
          font-weight: 950;
        }

        .overview-supporter-pill span {
          font-size: 11px;
          opacity: 0.72;
        }

        .overview-supporters-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .overview-supporters-stats div,
        .supporter-summary-stat {
          border-radius: 16px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.10);
          padding: 12px;
          text-align: center;
        }

        .overview-supporters-stats strong,
        .supporter-summary-stat strong {
          display: block;
          font-size: 24px;
          line-height: 1;
          font-weight: 1000;
          margin-bottom: 5px;
        }

        .overview-supporters-stats span,
        .supporter-summary-stat span {
          font-size: 11px;
          opacity: 0.72;
          font-weight: 900;
          text-transform: uppercase;
        }

        .overview-country-strip,
        .supporter-country-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .overview-country-strip span,
        .supporter-country-grid span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.10);
          font-size: 12px;
          font-weight: 850;
        }

        .overview-supporters-thanks {
          margin-top: 12px;
          opacity: 0.78;
          font-size: 13px;
          font-weight: 800;
        }

        .overview-supporters-link {
          padding: 8px 12px;
        }

        .supporters-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .supporters-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .supporter-card-compact {
          padding: 8px 10px;
          border-radius: 12px;
          min-height: auto;
        }

        .supporter-latest-card {
          background: linear-gradient(135deg, rgba(255,220,120,0.13), rgba(255,255,255,0.07));
          border-color: rgba(255,220,120,0.28);
        }

        .supporter-card-name {
          display: flex !important;
          align-items: center;
          gap: 7px;
          font-size: 14px !important;
          line-height: 1.15;
          min-width: 0;
        }

        .supporter-card-name span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .supporter-card-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.72;
          font-weight: 800;
        }

        .supporter-card-message {
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.68;
          line-height: 1.25;
        }


        .wc-header-countdown-pill.wc-next-game-timer {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          padding: 7px 12px;
          border-radius: 999px;
          background:
            radial-gradient(circle at top left, rgba(72,255,155,0.22), transparent 42%),
            linear-gradient(135deg, rgba(8,42,24,0.92), rgba(7,14,24,0.92));
          border: 1px solid rgba(112,255,178,0.38);
          color: #ffffff;
          box-shadow: 0 0 18px rgba(0,255,125,0.14), inset 0 0 0 1px rgba(255,255,255,0.04);
        }

        .wc-next-game-ball {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          font-size: 15px;
          line-height: 1;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        }

        .wc-next-game-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.05;
        }

        .wc-next-game-label {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(182,255,213,0.88);
        }

        .wc-next-game-time {
          font-size: 15px;
          font-weight: 1000;
          letter-spacing: 0.03em;
          font-variant-numeric: tabular-nums;
          color: #ffffff;
          text-shadow: 0 0 12px rgba(60,255,130,0.34);
        }

        .wc-live-sync-notice {
          margin: 8px 0 14px;
          padding: 9px 12px;
          border-radius: 12px;
          background: rgba(45,190,255,0.10);
          border: 1px solid rgba(120,220,255,0.22);
          color: rgba(235,250,255,0.86);
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          text-align: center;
        }


        .live-premium-page {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .live-premium-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 18px;
          background:
            radial-gradient(circle at 12% 0%, rgba(34,197,94,.28), transparent 35%),
            radial-gradient(circle at 88% 8%, rgba(16,185,129,.22), transparent 32%),
            linear-gradient(135deg, rgba(6,24,20,.98), rgba(6,11,25,.94));
          border: 1px solid rgba(74,222,128,.34);
          box-shadow: 0 0 22px rgba(34,197,94,.18), inset 0 0 0 1px rgba(255,255,255,.035);
        }

        .live-kicker {
          font-size: .76rem;
          font-weight: 1000;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: #86efac;
          margin-bottom: 5px;
        }

        .live-premium-hero p {
          margin: 6px 0 0;
          max-width: 760px;
          color: rgba(235,245,255,.72);
          font-size: .88rem;
          line-height: 1.35;
          font-weight: 700;
        }

        .live-premium-hero-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(72px, 1fr));
          gap: 8px;
          min-width: min(440px, 100%);
        }

        .live-premium-hero-stats div,
        .live-premium-count {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 76px;
          border-radius: 18px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.025);
        }

        .live-premium-hero-stats strong,
        .live-premium-count strong {
          font-size: 1.9rem;
          line-height: 1;
          font-weight: 1000;
          color: #fff;
        }

        .live-premium-hero-stats span,
        .live-premium-count span {
          margin-top: 5px;
          font-size: .68rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: rgba(255,255,255,.62);
        }

        .live-premium-feed {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(390px, 1fr));
          gap: 14px;
          align-items: start;
        }

        .live-premium-match {
          overflow: hidden;
          border-radius: 24px;
          padding: 14px;
          background:
            radial-gradient(circle at top left, rgba(34,197,94,.20), transparent 34%),
            radial-gradient(circle at bottom right, rgba(45,212,191,.14), transparent 38%),
            rgba(7,12,24,.94);
          border: 1px solid rgba(74,222,128,.30);
          box-shadow:
            0 16px 32px rgba(0,0,0,.24),
            0 0 20px rgba(34,197,94,.14),
            inset 0 0 0 1px rgba(255,255,255,.028);
        }

        .live-premium-main {
          grid-column: 1 / -1;
          border-color: rgba(74,222,128,.48);
          box-shadow:
            0 18px 38px rgba(0,0,0,.30),
            0 0 24px rgba(34,197,94,.22),
            0 0 52px rgba(34,197,94,.10),
            inset 0 0 0 1px rgba(255,255,255,.04);
        }

        .live-premium-topline {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .live-premium-topline span {
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.10);
          color: rgba(255,255,255,.76);
          font-size: .72rem;
          font-weight: 900;
        }

        .live-premium-topline .live-local-time {
          color: #dcfce7;
          background: rgba(34,197,94,.16);
          border-color: rgba(74,222,128,.32);
        }

        .live-premium-topline .live-on-air {
          color: #ecfdf5;
          background: linear-gradient(135deg, rgba(34,197,94,.90), rgba(16,185,129,.64));
          border-color: rgba(134,239,172,.72);
          box-shadow: 0 0 14px rgba(34,197,94,.55), 0 0 28px rgba(34,197,94,.22);
          text-shadow: 0 0 8px rgba(0,0,0,.35);
          animation: wcLivePulse 1.6s ease-in-out infinite;
        }

        .live-premium-scoreboard {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          gap: 14px;
          align-items: center;
        }

        .live-premium-team {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          padding: 12px 10px;
          border-radius: 20px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-premium-team img,
        .live-premium-team .wc-flag {
          transform: scale(1.35);
          margin-bottom: 5px;
        }

        .live-premium-team strong {
          font-size: clamp(1rem, 2vw, 1.45rem);
          font-weight: 1000;
          line-height: 1.05;
        }

        .live-premium-team small {
          color: rgba(255,255,255,.66);
          font-weight: 900;
        }

        .live-premium-score-centre {
          min-width: 150px;
          text-align: center;
          padding: 10px 12px;
          border-radius: 22px;
          background: rgba(0,0,0,.30);
          border: 1px solid rgba(255,255,255,.12);
        }

        .live-premium-score {
          font-size: clamp(2.25rem, 5vw, 4rem);
          line-height: .95;
          font-weight: 1000;
          color: #fff;
          text-shadow: 0 0 18px rgba(255,255,255,.18);
        }

        .live-premium-clock {
          margin: 8px 0;
          display: flex;
          justify-content: center;
        }

        .live-premium-status {
          font-size: .72rem;
          font-weight: 1000;
          color: rgba(255,255,255,.75);
        }

        .live-premium-scorers {
          margin-top: 12px;
        }

        .live-premium-lower-grid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: minmax(330px, 1.35fr) minmax(280px, 1fr) minmax(250px, .9fr);
          gap: 12px;
          align-items: stretch;
        }

        .live-premium-card,
        .live-premium-lower-grid .match-events-box,
        .live-premium-lower-grid .match-officials-box {
          margin: 0;
          padding: 13px;
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(8,22,42,.74), rgba(8,42,55,.38));
          border: 1px solid rgba(148,163,184,.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 12px 32px rgba(0,0,0,.20);
          min-width: 0;
        }

        .live-premium-stats-card {
          padding: 16px;
          border-color: rgba(59,130,246,.40);
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 34%),
            linear-gradient(145deg, rgba(8,22,42,.88), rgba(5,35,52,.52));
        }

        .live-premium-card-title {
          font-size: .78rem;
          font-weight: 1000;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: #bfdbfe;
          margin-bottom: 9px;
        }

        .live-stat-bars {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .live-stat-row {
          display: grid;
          grid-template-columns: 54px 1fr 54px;
          gap: 11px;
          align-items: center;
          font-weight: 1000;
          font-size: .95rem;
        }

        .live-stat-row > span:first-child { text-align: right; }
        .live-stat-row > span:last-child { text-align: left; }

        .live-stat-bar-wrap small {
          display: block;
          text-align: center;
          color: rgba(255,255,255,.62);
          font-size: .76rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 3px;
        }

        .live-stat-bar {
          display: flex;
          height: 11px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
        }

        .live-stat-bar i,
        .live-stat-bar b {
          display: block;
          min-width: 4px;
        }

        .live-stat-bar i {
          background: linear-gradient(90deg, rgba(34,197,94,.95), rgba(45,212,191,.88));
          box-shadow: 0 0 12px rgba(34,197,94,.40);
        }
        .live-stat-bar b {
          background: linear-gradient(90deg, rgba(14,165,233,.88), rgba(37,99,235,.95));
          box-shadow: 0 0 12px rgba(59,130,246,.40);
        }

        .live-premium-timeline {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .live-timeline-row {
          display: grid;
          grid-template-columns: 38px 34px minmax(0, 1fr);
          gap: 7px;
          align-items: center;
          padding: 7px 8px;
          border-radius: 12px;
          background: rgba(0,0,0,.18);
          font-size: .78rem;
        }

        .live-timeline-row span {
          color: #fde68a;
          font-weight: 1000;
          text-align: right;
        }

        .live-timeline-row b {
          text-align: center;
        }

        .live-timeline-row strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .live-timeline-row em {
          grid-column: 3;
          color: rgba(255,255,255,.55);
          font-style: normal;
          font-size: .68rem;
          margin-top: -5px;
        }

        .live-discipline-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .live-discipline-grid div {
          padding: 10px;
          border-radius: 13px;
          background: rgba(0,0,0,.18);
          text-align: center;
        }

        .live-discipline-grid strong {
          display: block;
          font-size: 1.45rem;
          line-height: 1;
          font-weight: 1000;
        }

        .live-discipline-grid span {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.62);
          font-size: .68rem;
          font-weight: 800;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .live-premium-hero,
          .live-premium-scoreboard {
            grid-template-columns: 1fr;
            flex-direction: column;
          }

          .live-premium-hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .live-premium-score-centre {
            order: -1;
          }

          .live-premium-feed {
            grid-template-columns: 1fr;
          }

          .live-premium-lower-grid {
            grid-template-columns: 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card,
          .live-premium-lower-grid .match-officials-box {
            grid-column: 1 / -1;
          }

          .live-weather-main {
            grid-template-columns: 1fr;
          }

          .live-weather-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

        }

        @keyframes wcLivePulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(34,197,94,0.36), 0 0 18px rgba(34,197,94,0.16);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 18px rgba(34,197,94,0.78), 0 0 38px rgba(34,197,94,0.34), 0 0 62px rgba(34,197,94,0.16);
            transform: scale(1.035);
          }
        }

        @media (max-width: 850px) {
          .overview-supporters-layout {
            grid-template-columns: 1fr;
          }
        }

        .wc-donate-footer {
          margin-top: 22px;
          padding: 14px 18px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(0, 112, 186, 0.38), rgba(0, 200, 255, 0.14));
          border: 1px solid rgba(0, 200, 255, 0.35);
          box-shadow: 0 0 18px rgba(0, 200, 255, 0.16);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          text-align: center;
        }

        .wc-donate-footer span {
          font-weight: 800;
          color: rgba(255,255,255,0.92);
        }

        .wc-donate-footer a {
          color: white;
          font-weight: 900;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(0, 200, 255, 0.24);
          border: 1px solid rgba(0, 200, 255, 0.48);
        }

        .wc-donate-footer a:hover {
          background: rgba(0, 200, 255, 0.34);
        }

        .wc-header-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: nowrap;
          margin-left: auto;
        }

        .wc-language-wrap,
        .wc-view-wrap,
        .wc-sidebar-wrap,
        .wc-updated-wrap {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 0;
          margin: 0;
        }

        .wc-language-label,
        .wc-view-label,
        .wc-sidebar-label,
        .wc-updated-label {
          display: none;
        }

        

        .wc-language-select optgroup {
          font-weight: 1000;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.78);
          text-transform: uppercase;
        }

        .wc-language-select optgroup option {
          font-weight: 700;
          text-transform: none;
        }
.wc-language-select,
        .wc-view-select,
        .wc-sidebar-select,
        .wc-updated-pill,
        .wc-header-controls .wc-back-button {
          min-height: 34px;
          height: 34px;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 850;
          line-height: 1;
          white-space: nowrap;
        }

        .wc-language-select,
        .wc-view-select,
        .wc-sidebar-select {
          cursor: pointer;
          background: rgba(255,255,255,0.10);
          color: white;
          border: 1px solid rgba(255,255,255,0.20);
          padding: 7px 12px;
          outline: none;
          min-width: 146px;
        }

        .wc-view-select {
          min-width: 118px;
        }

        .wc-sidebar-select {
          min-width: 118px;
        }

        .wc-updated-pill {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.20);
          padding: 7px 12px;
          min-width: 82px;
        }


        .wc-language-select option.wc-language-heading,
        .wc-language-select option.wc-language-group,
        .wc-language-select option:disabled {
          font-weight: 1000;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.75);
          text-transform: uppercase;
        }

        .wc-language-select option.wc-language-group,
        .wc-language-select option:disabled {
          font-weight: 1000;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.55);
          text-transform: uppercase;
        }


        .wc-header-controls .wc-back-button {
          padding: 7px 12px;
        }

        .wc-language-select option,
        .wc-view-select option,
        .wc-sidebar-select option {
          color: #111;
          background: #fff;
        }

        .wc-live {
          color: #ecfdf5;
          background: linear-gradient(135deg, rgba(34,197,94,0.92), rgba(16,185,129,0.62));
          border-color: rgba(134,239,172,0.78);
          box-shadow: 0 0 12px rgba(34,197,94,0.58), 0 0 26px rgba(34,197,94,0.24);
          animation: wcLivePulse 1.6s ease-in-out infinite;
        }

        .wc-nav {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .wc-nav button {
          background: rgba(255,255,255,0.10);
          color: white;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          white-space: nowrap;
          font-weight: 700;
        }

        .wc-nav button.active {
          background: rgba(45,190,255,0.34);
          border-color: rgba(120,220,255,0.7);
        }

        .wc-nav button.wc-live-nav-button.is-offline,
        .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-offline {
          background: rgba(231, 76, 60, 0.24);
          border-color: rgba(231, 76, 60, 0.62);
          box-shadow: 0 0 14px rgba(231, 76, 60, 0.18);
          animation: wcLiveNavPulseRed 1.4s ease-in-out infinite;
        }

        .wc-nav button.wc-live-nav-button.is-live,
        .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-live {
          background: rgba(46, 204, 113, 0.24);
          border-color: rgba(46, 204, 113, 0.68);
          box-shadow: 0 0 14px rgba(46, 204, 113, 0.20);
          animation: wcLiveNavPulseGreen 1.4s ease-in-out infinite;
        }

        .wc-nav button.wc-live-nav-button.is-offline:hover,
        .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-offline:hover {
          background: rgba(231, 76, 60, 0.34);
          border-color: rgba(231, 76, 60, 0.82);
        }

        .wc-nav button.wc-live-nav-button.is-live:hover,
        .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-live:hover {
          background: rgba(46, 204, 113, 0.34);
          border-color: rgba(46, 204, 113, 0.88);
        }

        @keyframes wcLiveNavPulseGreen {
          0%, 100% {
            box-shadow: 0 0 12px rgba(46, 204, 113, 0.34), 0 0 22px rgba(46, 204, 113, 0.16);
          }
          50% {
            box-shadow: 0 0 24px rgba(46, 204, 113, 0.86), 0 0 46px rgba(46, 204, 113, 0.46), 0 0 70px rgba(46, 204, 113, 0.24);
          }
        }

        @keyframes wcLiveNavPulseRed {
          0%, 100% {
            box-shadow: 0 0 12px rgba(231, 76, 60, 0.34), 0 0 22px rgba(231, 76, 60, 0.16);
          }
          50% {
            box-shadow: 0 0 24px rgba(231, 76, 60, 0.86), 0 0 46px rgba(231, 76, 60, 0.46), 0 0 70px rgba(231, 76, 60, 0.24);
          }
        }

        .wc-tablet-header-nav {
          display: none;
        }

        /* Tablet view only: put all navigation buttons on the same top row as the live/today pills. */
        .wc-app.wc-view-tablet .wc-header-title-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 4px;
          width: 100%;
          overflow: hidden;
          text-align: left;
        }

        .wc-app.wc-view-tablet .wc-header-live-pill {
          flex: 0 0 auto;
          min-height: 14px;
          padding: 2px 5px;
          border-radius: 999px;
          font-size: 7px;
          line-height: 1;
          letter-spacing: 0;
          white-space: nowrap;
          max-width: none;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex;
          flex: 1 1 auto;
          min-width: 0;
          gap: 3px;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          padding: 0;
          margin: 0;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 1 1 0;
          min-width: 0;
          max-width: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          background: rgba(255,255,255,0.10);
          color: white;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 999px;
          padding: 3px 4px;
          font-size: 7px;
          line-height: 1;
          font-weight: 850;
          cursor: pointer;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button.active {
          background: rgba(45,190,255,0.34);
          border-color: rgba(120,220,255,0.7);
        }

        .wc-app.wc-view-tablet .wc-title-stack,
        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          flex: 0 0 100%;
          width: 100%;
          margin-top: 4px;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          display: inline-flex;
          width: auto;
        }

        .wc-app.wc-view-tablet > .wc-shell > .wc-nav,
        .wc-app.wc-view-tablet .wc-shell > .wc-nav {
          display: none;
        }

        .wc-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.20);
          margin-bottom: 16px;
        }

        .wc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }

        .wc-stat {
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 18px;
          padding: 16px;
        }

        .wc-stat strong {
          display: block;
          font-size: 30px;
          margin-bottom: 5px;
        }

        .wc-section-title {
          font-size: 23px;
          font-weight: 900;
          margin: 0 0 14px;
        }

        .wc-list {
          display: grid;
          gap: 14px;
        }

        .wc-row {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          padding: 8px;
        }

        .fixture-teams-big {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 18px;
          width: 100%;
        }

        .team-flag-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-align: center;
          min-width: 0;
        }

        .big-flag-img {
          width: 96px;
          height: 64px;
          object-fit: cover;
          border-radius: 9px;
          box-shadow: 0 0 14px rgba(0,0,0,0.50);
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
        }

        .big-flag,
        .missing-flag {
          width: 96px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          border-radius: 9px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.20);
        }

        .team-flag-name {
          font-size: 12px;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 2px 7px rgba(0,0,0,0.85);
          line-height: 1.15;
          word-break: normal;
        }

        .fixture-middle {
          text-align: center;
          color: #fff;
          min-width: 72px;
        }

        .wc-score {
          font-size: 18px;
          font-weight: 900;
          text-align: center;
          margin-bottom: 4px;
        }

        .fixture-vs {
          font-size: 22px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .wc-muted {
          opacity: 0.72;
          font-size: 13px;
          margin-top: 3px;
        }

        .fixture-meta {
          text-align: center;
          margin-top: 12px;
        }

        .wc-table-wrap {
          overflow-x: auto;
        }

        .wc-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        .wc-table th,
        .wc-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.10);
          text-align: left;
        }

        .wc-table th {
          opacity: 0.75;
          font-size: 12px;
          text-transform: uppercase;
        }

        .group-team-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .group-flag-img {
          width: 26px;
          height: 18px;
          object-fit: cover;
          border-radius: 3px;
          box-shadow: 0 0 5px rgba(0,0,0,0.45);
          border: 1px solid rgba(255,255,255,0.22);
          flex: 0 0 auto;
        }

        .group-flag-missing {
          width: 26px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border-radius: 3px;
          background: rgba(255,255,255,0.10);
          flex: 0 0 auto;
        }

        .wc-empty {
          opacity: 0.72;
          padding: 18px;
          background: rgba(255,255,255,0.06);
          border-radius: 16px;
        }

        .wc-two {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
        }


        .wc-web-card {
          margin-bottom: 16px;
          overflow: hidden;
        }

        .wc-web-subtitle {
          margin: -4px 0 14px;
          opacity: 0.74;
          font-size: 13px;
          text-align: center;
        }

        .wc-knockout-web {
          display: grid;
          grid-template-columns: minmax(190px, 1.2fr) repeat(5, minmax(145px, 1fr));
          gap: 14px;
          width: 100%;
          align-items: stretch;
        }

        .wc-web-round {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          gap: 8px;
        }

        .wc-web-round-title {
          text-align: center;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.9;
          margin-bottom: 3px;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wc-web-match {
          position: relative;
          min-height: 58px;
          padding: 7px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.045));
          box-shadow: 0 8px 20px rgba(0,0,0,0.20);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          overflow: visible;
        }

        .wc-web-round:not(:last-child) .wc-web-match::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -14px;
          width: 14px;
          height: 1px;
          background: rgba(255,255,255,0.28);
          pointer-events: none;
        }

        .wc-web-team {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          font-weight: 800;
          font-size: 11px;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-web-team .group-flag-img,
        .wc-web-team .group-flag-missing {
          width: 22px;
          height: 15px;
          font-size: 11px;
          border-radius: 4px;
          flex: 0 0 auto;
        }

        .wc-web-vs {
          text-align: center;
          font-size: 9px;
          opacity: 0.56;
          font-weight: 900;
          line-height: 1;
        }

        @media (max-width: 1400px) {
          .wc-knockout-web {
            grid-template-columns: minmax(160px, 1.15fr) repeat(5, minmax(118px, 1fr));
            gap: 8px;
          }

          .wc-web-round:not(:last-child) .wc-web-match::after {
            right: -8px;
            width: 8px;
          }

          .wc-web-match {
            min-height: 50px;
            padding: 6px;
          }

          .wc-web-team {
            font-size: 9.5px;
            gap: 4px;
          }

          .wc-web-team .group-flag-img,
          .wc-web-team .group-flag-missing {
            width: 18px;
            height: 12px;
          }
        }


        /* Compact top knockout web: fit whole bracket on one screen */
        .wc-web-card {
          padding: 12px 14px !important;
          margin-bottom: 12px !important;
        }

        .wc-web-card .wc-section-title {
          font-size: 16px !important;
          margin-bottom: 3px !important;
        }

        .wc-web-subtitle {
          margin: 0 0 7px !important;
          font-size: 11px !important;
          line-height: 1 !important;
        }

        .wc-knockout-web {
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          gap: 6px !important;
          align-items: stretch !important;
        }

        .wc-web-round {
          gap: 3px !important;
          justify-content: space-between !important;
          min-width: 0 !important;
        }

        .wc-web-round-title {
          min-height: 18px !important;
          margin-bottom: 3px !important;
          font-size: 9.5px !important;
          line-height: 1 !important;
          letter-spacing: 0.02em !important;
        }

        .wc-web-match {
          min-height: 27px !important;
          padding: 3px 4px !important;
          border-radius: 8px !important;
          gap: 2px !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
          align-items: center !important;
          box-shadow: none !important;
        }

        .wc-web-round:not(:last-child) .wc-web-match::after {
          right: -5px !important;
          width: 5px !important;
        }

        .wc-web-team {
          gap: 3px !important;
          font-size: 8.5px !important;
          line-height: 1 !important;
          font-weight: 800 !important;
        }

        .wc-web-team span {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .wc-web-team .group-flag-img,
        .wc-web-team .group-flag-missing {
          width: 13px !important;
          height: 9px !important;
          min-width: 13px !important;
          border-radius: 2px !important;
          font-size: 6px !important;
        }

        .wc-web-vs {
          font-size: 7px !important;
          padding: 0 1px !important;
          line-height: 1 !important;
        }

        @media (max-width: 1100px) {
          .wc-web-card { padding: 8px !important; }
          .wc-knockout-web { gap: 3px !important; }
          .wc-web-match { min-height: 23px !important; padding: 2px 3px !important; }
          .wc-web-team { font-size: 7.5px !important; }
          .wc-web-team .group-flag-img,
          .wc-web-team .group-flag-missing { width: 11px !important; height: 8px !important; min-width: 11px !important; }
          .wc-web-vs { font-size: 6px !important; }
          .wc-web-round-title { font-size: 8px !important; }
        }


        /* Knockout page polish: make the top web look like a proper bracket */
        .wc-app.wc-page-knockout {
          background:
            linear-gradient(
              rgba(4, 10, 24, 0.82),
              rgba(8, 25, 44, 0.86)
            ),
            url("/world_cup_2026_frontend/worldcup.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .wc-page-knockout .wc-web-card {
          position: relative;
          overflow: hidden;
          padding: 13px 14px 15px !important;
          margin-bottom: 14px !important;
          background: linear-gradient(135deg, rgba(3, 18, 42, 0.72), rgba(5, 34, 64, 0.46)) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          box-shadow: 0 12px 34px rgba(0,0,0,0.28) !important;
        }

        .wc-page-knockout .wc-web-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 42%, rgba(255,255,255,0.08), transparent 36%);
          pointer-events: none;
        }

        .wc-page-knockout .wc-web-card .wc-section-title {
          position: relative;
          z-index: 2;
          font-size: 18px !important;
          line-height: 1.1 !important;
          margin-bottom: 9px !important;
          text-align: left;
          text-shadow: 0 2px 10px rgba(0,0,0,0.7);
        }

        .wc-page-knockout .wc-knockout-web {
          position: relative;
          z-index: 2;
          display: grid !important;
          grid-template-columns: 1.42fr 1.2fr 1.04fr 0.94fr 0.88fr 0.82fr !important;
          gap: 10px !important;
          align-items: stretch !important;
          min-height: 465px;
        }

        .wc-page-knockout .wc-web-round {
          position: relative;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-around !important;
          gap: 4px !important;
        }

        .wc-page-knockout .wc-web-round-title {
          min-height: 18px !important;
          margin-bottom: 5px !important;
          font-size: 10px !important;
          line-height: 1 !important;
          letter-spacing: 0.04em !important;
          color: rgba(255,255,255,0.94) !important;
          text-shadow: 0 2px 7px rgba(0,0,0,0.72);
        }

        .wc-page-knockout .wc-web-match {
          min-height: 31px !important;
          padding: 4px 6px !important;
          border-radius: 9px !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr) !important;
          align-items: center !important;
          gap: 2px !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045)) !important;
          border: 1px solid rgba(255,255,255,0.18) !important;
          box-shadow: 0 5px 13px rgba(0,0,0,0.24) !important;
          overflow: visible !important;
        }

        .wc-page-knockout .wc-web-round:not(:last-child) .wc-web-match::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -10px !important;
          width: 10px !important;
          height: 2px !important;
          transform: translateY(-50%);
          background: linear-gradient(90deg, rgba(255,255,255,0.78), rgba(255,255,255,0.22)) !important;
          border-radius: 999px;
          pointer-events: none;
        }

        .wc-page-knockout .wc-web-team {
          gap: 4px !important;
          font-size: 9.5px !important;
          line-height: 1 !important;
          font-weight: 900 !important;
          min-width: 0 !important;
        }

        .wc-page-knockout .wc-web-team span {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .wc-page-knockout .wc-web-team .group-flag-img,
        .wc-page-knockout .wc-web-team .group-flag-missing {
          width: 14px !important;
          height: 10px !important;
          min-width: 14px !important;
          border-radius: 2px !important;
          font-size: 7px !important;
        }

        .wc-page-knockout .wc-web-vs {
          font-size: 7px !important;
          opacity: 0.68 !important;
          text-align: center !important;
        }

        @media (max-width: 1400px) {
          .wc-page-knockout .wc-knockout-web {
            min-height: 420px;
            grid-template-columns: 1.45fr 1.18fr 1fr 0.92fr 0.84fr 0.78fr !important;
            gap: 7px !important;
          }
          .wc-page-knockout .wc-web-match {
            min-height: 28px !important;
            padding: 3px 5px !important;
          }
          .wc-page-knockout .wc-web-team {
            font-size: 8.4px !important;
          }
          .wc-page-knockout .wc-web-team .group-flag-img,
          .wc-page-knockout .wc-web-team .group-flag-missing {
            width: 12px !important;
            height: 8px !important;
            min-width: 12px !important;
          }
          .wc-page-knockout .wc-web-round:not(:last-child) .wc-web-match::after {
            right: -7px !important;
            width: 7px !important;
          }
        }

        .wc-page-knockout .wc-web-card {
          overflow-x: auto !important;
          overflow-y: hidden !important;
        }

        .wc-page-knockout .wc-knockout-spider {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns:
            minmax(165px, 1.05fr)
            minmax(145px, 0.9fr)
            minmax(132px, 0.82fr)
            minmax(124px, 0.78fr)
            minmax(150px, 0.95fr)
            minmax(124px, 0.78fr)
            minmax(132px, 0.82fr)
            minmax(145px, 0.9fr)
            minmax(165px, 1.05fr);
          grid-template-rows: 24px repeat(17, minmax(28px, 1fr));
          column-gap: 18px;
          min-width: 1320px;
          min-height: 650px;
          padding: 0 8px 10px 0;
        }

        .wc-page-knockout .wc-spider-round-title {
          align-self: center;
          justify-self: stretch;
          color: rgba(255,255,255,0.94);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.04em;
          line-height: 1;
          text-align: center;
          text-transform: uppercase;
          text-shadow: 0 2px 7px rgba(0,0,0,0.72);
        }

        .wc-page-knockout .wc-spider-slot {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -18px;
          width: 18px;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.74));
          border-radius: 999px;
          pointer-events: none;
        }

        .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::after {
          content: "";
          position: absolute;
          top: 12%;
          bottom: 12%;
          left: -18px;
          width: 2px;
          background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.58), rgba(255,255,255,0.2));
          border-radius: 999px;
          pointer-events: none;
        }

        .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::before {
          left: auto;
          right: -18px;
          width: 18px;
          background: linear-gradient(270deg, rgba(255,255,255,0.2), rgba(255,255,255,0.74));
        }

        .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::after {
          left: auto;
          right: -18px;
        }

        .wc-page-knockout .wc-spider-match {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 35px minmax(0, 1fr);
          align-items: center;
          gap: 5px;
          width: 100%;
          min-height: 36px;
          padding: 5px 7px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045));
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 5px 13px rgba(0,0,0,0.24);
        }

        .wc-page-knockout .wc-spider-final .wc-spider-match {
          border-color: rgba(255,215,90,0.48);
          background:
            radial-gradient(circle at top left, rgba(255,215,90,0.18), transparent 45%),
            linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05));
        }

        .wc-page-knockout .wc-spider-match-empty {
          opacity: 0.72;
          border-style: dashed;
        }

        .wc-page-knockout .wc-spider-team {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          color: rgba(255,255,255,0.94);
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
        }

        .wc-page-knockout .wc-spider-team:last-child {
          justify-content: flex-end;
          text-align: right;
        }

        .wc-page-knockout .wc-spider-team span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wc-page-knockout .wc-spider-team .group-flag-img,
        .wc-page-knockout .wc-spider-team .group-flag-missing {
          width: 14px !important;
          min-width: 14px !important;
          height: 10px !important;
          border-radius: 2px !important;
          font-size: 7px !important;
        }

        .wc-page-knockout .wc-spider-vs {
          color: rgba(255,255,255,0.72);
          font-size: 8px;
          font-weight: 950;
          line-height: 1;
          text-align: center;
        }

        .wc-page-knockout .wc-spider-final-label {
          position: relative;
          grid-column: 5;
          grid-row: 11;
          align-self: center;
          display: grid;
          gap: 4px;
          justify-items: center;
          padding: 10px 8px;
          border-radius: 8px;
          color: rgba(255,255,255,0.94);
          background: linear-gradient(135deg, rgba(255,215,90,0.2), rgba(255,255,255,0.055));
          border: 1px solid rgba(255,215,90,0.44);
          box-shadow: 0 8px 20px rgba(0,0,0,0.28);
          text-align: center;
        }

        .wc-page-knockout .wc-spider-final-label::before {
          content: "";
          position: absolute;
          top: -42px;
          left: 50%;
          width: 2px;
          height: 34px;
          transform: translateX(-50%);
          background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,215,90,0.75));
          border-radius: 999px;
        }

        .wc-page-knockout .wc-spider-final-label span {
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .wc-page-knockout .wc-spider-final-label strong {
          font-size: 14px;
          line-height: 1;
        }

        @media (max-width: 1400px) {
          .wc-page-knockout .wc-knockout-spider {
            grid-template-columns:
              minmax(150px, 1.05fr)
              minmax(132px, 0.9fr)
              minmax(120px, 0.82fr)
              minmax(112px, 0.78fr)
              minmax(138px, 0.95fr)
              minmax(112px, 0.78fr)
              minmax(120px, 0.82fr)
              minmax(132px, 0.9fr)
              minmax(150px, 1.05fr);
            column-gap: 14px;
            min-width: 1180px;
            min-height: 620px;
          }

          .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::before {
            left: -14px;
            width: 14px;
          }

          .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::before {
            left: auto;
            right: -14px;
            width: 14px;
          }

          .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::after {
            left: -14px;
          }

          .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::after {
            left: auto;
            right: -14px;
          }
        }

        .wc-page-knockout .wc-web-card {
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-gutter: stable;
        }

        .wc-page-knockout .wc-knockout-spider {
          width: max-content;
          max-width: none;
          column-gap: 10px !important;
          min-width: 1160px !important;
        }

        .wc-page-knockout .wc-web-card::-webkit-scrollbar {
          height: 10px;
        }

        .wc-page-knockout .wc-web-card::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.28);
          border-radius: 999px;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-web-card,
        .wc-app.wc-view-mobile.wc-page-knockout .wc-web-card {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 10px !important;
          border-radius: 12px !important;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-knockout-spider {
          min-width: 1060px !important;
          min-height: 585px !important;
          column-gap: 8px !important;
          transform: none;
          transform-origin: top left;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-spider {
          min-width: 940px !important;
          min-height: 560px !important;
          grid-template-columns:
            minmax(118px, 1.05fr)
            minmax(104px, 0.9fr)
            minmax(96px, 0.82fr)
            minmax(90px, 0.78fr)
            minmax(112px, 0.95fr)
            minmax(90px, 0.78fr)
            minmax(96px, 0.82fr)
            minmax(104px, 0.9fr)
            minmax(118px, 1.05fr) !important;
          column-gap: 8px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-match {
          min-height: 32px !important;
          padding: 3px 4px !important;
          grid-template-columns: minmax(0, 1fr) 26px minmax(0, 1fr) !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-team {
          font-size: 9px !important;
        }

        .wc-page-knockout .wc-web-card {
          overflow-x: hidden !important;
        }

        .wc-page-knockout .wc-knockout-spider,
        .wc-app.wc-view-tablet.wc-page-knockout .wc-knockout-spider,
        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-spider {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          grid-template-columns:
            minmax(0, 1.1fr)
            minmax(0, 0.92fr)
            minmax(0, 0.82fr)
            minmax(0, 0.74fr)
            minmax(0, 0.86fr)
            minmax(0, 0.74fr)
            minmax(0, 0.82fr)
            minmax(0, 0.92fr)
            minmax(0, 1.1fr) !important;
          column-gap: 6px !important;
          padding-right: 0 !important;
          box-sizing: border-box !important;
        }

        .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::before {
          left: -6px !important;
          width: 6px !important;
        }

        .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::before {
          left: auto !important;
          right: -6px !important;
          width: 6px !important;
        }

        .wc-page-knockout .wc-spider-slot:not(.wc-spider-first)::after {
          left: -6px !important;
        }

        .wc-page-knockout .wc-spider-right:not(.wc-spider-first)::after {
          left: auto !important;
          right: -6px !important;
        }

        .wc-page-knockout .wc-spider-match {
          grid-template-columns: minmax(0, 1fr) 26px minmax(0, 1fr) !important;
          gap: 3px !important;
          padding: 4px 5px !important;
        }

        .wc-page-knockout .wc-spider-team {
          gap: 3px !important;
          font-size: 8.5px !important;
        }

        .wc-page-knockout .wc-spider-team .group-flag-img,
        .wc-page-knockout .wc-spider-team .group-flag-missing {
          width: 12px !important;
          min-width: 12px !important;
          height: 8px !important;
        }

        .wc-page-knockout .wc-spider-vs {
          font-size: 7px !important;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-knockout-spider {
          column-gap: 5px !important;
          grid-template-rows: 22px repeat(17, minmax(26px, 1fr)) !important;
          min-height: 545px !important;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-spider-match {
          grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr) !important;
          min-height: 30px !important;
          padding: 3px 4px !important;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-spider-team {
          font-size: 7.5px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-spider {
          column-gap: 3px !important;
          grid-template-rows: 18px repeat(17, minmax(22px, 1fr)) !important;
          min-height: 470px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-round-title {
          font-size: 6px !important;
          letter-spacing: 0 !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-match {
          grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr) !important;
          min-height: 24px !important;
          padding: 2px 2px !important;
          gap: 1px !important;
          border-radius: 5px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-team {
          gap: 1px !important;
          font-size: 5.8px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-team .group-flag-img,
        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-team .group-flag-missing {
          width: 8px !important;
          min-width: 8px !important;
          height: 6px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-spider-vs {
          font-size: 5px !important;
        }

        .wc-page-knockout .wc-knockout-wiki {
          display: grid;
          grid-template-columns: 1.45fr 1.2fr 1fr 0.86fr 1.08fr;
          gap: 12px;
          width: 100%;
          min-width: 0;
          align-items: stretch;
          box-sizing: border-box;
        }

        .wc-page-knockout .wc-wiki-round {
          min-width: 0;
          display: grid;
          grid-template-rows: 22px minmax(0, 1fr);
          gap: 6px;
        }

        .wc-page-knockout .wc-wiki-round-title {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          min-height: 18px;
          padding: 3px 5px;
          color: #062033;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.72);
          font-size: 9px;
          font-weight: 950;
          line-height: 1;
          text-align: center;
          text-transform: uppercase;
          border-radius: 2px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.20);
        }

        .wc-page-knockout .wc-wiki-round-stack,
        .wc-page-knockout .wc-wiki-final-stack {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          gap: 5px;
          height: 100%;
        }

        .wc-page-knockout .wc-wiki-match-wrap {
          position: relative;
          min-width: 0;
        }

        .wc-page-knockout .wc-wiki-round:not(.wc-wiki-round-final) .wc-wiki-match-wrap::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -12px;
          width: 12px;
          height: 2px;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.72);
          pointer-events: none;
        }

        .wc-page-knockout .wc-wiki-match-meta {
          display: flex;
          justify-content: space-between;
          gap: 4px;
          min-height: 12px;
          margin: 0 0 1px;
          color: #93c5fd;
          font-size: 7px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
        }

        .wc-page-knockout .wc-wiki-match-meta span {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-match {
          min-height: 28px !important;
          padding: 2px 4px !important;
          border-radius: 2px !important;
          grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr) !important;
          gap: 2px !important;
          background: rgba(248,250,252,0.94) !important;
          border: 1px solid rgba(255,255,255,0.76) !important;
          box-shadow: 0 3px 8px rgba(0,0,0,0.24) !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-match-empty {
          opacity: 1;
          background: rgba(248,250,252,0.94) !important;
          border-style: solid !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-team {
          gap: 3px !important;
          color: #071827 !important;
          font-size: 7.5px !important;
          font-weight: 950 !important;
          min-width: 0 !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-team span {
          color: #071827 !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-vs {
          color: #1e293b !important;
          font-size: 6px !important;
          font-weight: 950 !important;
        }

        .wc-page-knockout .wc-knockout-wiki .group-flag-img,
        .wc-page-knockout .wc-knockout-wiki .group-flag-missing {
          width: 11px !important;
          min-width: 11px !important;
          height: 8px !important;
          border-radius: 1px !important;
        }

        .wc-page-knockout .wc-wiki-round-final {
          align-self: stretch;
        }

        .wc-page-knockout .wc-wiki-round-final .wc-wiki-final-stack {
          justify-content: center;
          gap: 32px;
        }

        .wc-page-knockout .wc-wiki-third-place {
          display: grid;
          gap: 5px;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-knockout-wiki {
          gap: 7px;
          grid-template-columns: 1.42fr 1.16fr 0.98fr 0.82fr 1fr;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-wiki-round-title {
          font-size: 7px;
          padding: 2px 3px;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-wiki-round-stack,
        .wc-app.wc-view-tablet.wc-page-knockout .wc-wiki-final-stack {
          gap: 3px;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-wiki-round:not(.wc-wiki-round-final) .wc-wiki-match-wrap::after {
          right: -7px;
          width: 7px;
        }

        .wc-app.wc-view-tablet.wc-page-knockout .wc-knockout-wiki .wc-spider-team {
          font-size: 6.4px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-web-card {
          padding: 7px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki {
          gap: 3px;
          grid-template-columns: 1.36fr 1.1fr 0.92fr 0.76fr 0.9fr;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-wiki-round {
          grid-template-rows: 16px minmax(0, 1fr);
          gap: 2px;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-wiki-round-title {
          min-height: 14px;
          padding: 1px 2px;
          font-size: 4.8px;
          letter-spacing: 0;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-wiki-match-meta {
          min-height: 8px;
          font-size: 4.6px;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki .wc-spider-match {
          min-height: 20px !important;
          padding: 1px 1px !important;
          grid-template-columns: minmax(0, 1fr) 12px minmax(0, 1fr) !important;
          gap: 1px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki .wc-spider-team {
          gap: 1px !important;
          font-size: 4.5px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki .wc-spider-vs {
          font-size: 4px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki .group-flag-img,
        .wc-app.wc-view-mobile.wc-page-knockout .wc-knockout-wiki .group-flag-missing {
          width: 7px !important;
          min-width: 7px !important;
          height: 5px !important;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-wiki-round:not(.wc-wiki-round-final) .wc-wiki-match-wrap::after {
          right: -3px;
          width: 3px;
          height: 1px;
        }

        .wc-app.wc-view-mobile.wc-page-knockout .wc-wiki-round-final .wc-wiki-final-stack {
          gap: 14px;
        }

        .wc-page-knockout .wc-knockout-wiki {
          padding: 10px 4px 4px;
          border-radius: 14px;
          background:
            radial-gradient(circle at 50% 45%, rgba(255,215,90,0.10), transparent 30%),
            linear-gradient(180deg, rgba(4,12,30,0.18), rgba(2,8,23,0.28));
        }

        .wc-page-knockout .wc-wiki-round-title {
          color: rgba(255,255,255,0.96);
          background:
            linear-gradient(135deg, rgba(34,211,238,0.26), rgba(59,130,246,0.14)),
            rgba(10,24,48,0.78);
          border: 1px solid rgba(125,211,252,0.28);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            0 8px 18px rgba(0,0,0,0.20);
          text-shadow: 0 2px 8px rgba(0,0,0,0.55);
        }

        .wc-page-knockout .wc-wiki-match-meta {
          color: rgba(191,219,254,0.92);
          text-shadow: 0 1px 5px rgba(0,0,0,0.65);
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-match {
          background:
            linear-gradient(135deg, rgba(15,35,67,0.92), rgba(10,24,48,0.76)) !important;
          border: 1px solid rgba(148,163,184,0.30) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            0 8px 18px rgba(0,0,0,0.28) !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-match-empty {
          background:
            linear-gradient(135deg, rgba(15,35,67,0.92), rgba(10,24,48,0.76)) !important;
          border-style: solid !important;
          opacity: 1 !important;
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-team,
        .wc-page-knockout .wc-knockout-wiki .wc-spider-team span {
          color: rgba(255,255,255,0.96) !important;
          text-shadow: 0 2px 7px rgba(0,0,0,0.70);
        }

        .wc-page-knockout .wc-knockout-wiki .wc-spider-vs {
          color: rgba(226,232,240,0.84) !important;
        }

        .wc-page-knockout .wc-wiki-round:not(.wc-wiki-round-final) .wc-wiki-match-wrap::after {
          background:
            linear-gradient(90deg, rgba(125,211,252,0.70), rgba(255,215,90,0.46));
          box-shadow: 0 0 10px rgba(56,189,248,0.34);
        }

        .wc-page-knockout .wc-wiki-round-final .wc-spider-match {
          border-color: rgba(255,215,90,0.52) !important;
          background:
            radial-gradient(circle at top left, rgba(255,215,90,0.24), transparent 44%),
            linear-gradient(135deg, rgba(30,41,59,0.94), rgba(15,23,42,0.82)) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 0 22px rgba(255,215,90,0.18),
            0 10px 22px rgba(0,0,0,0.32) !important;
        }

        .wc-page-knockout .wc-wiki-third-place .wc-wiki-round-title {
          color: rgba(255,237,213,0.96);
          background:
            linear-gradient(135deg, rgba(251,146,60,0.24), rgba(234,179,8,0.12)),
            rgba(15,23,42,0.78);
          border-color: rgba(251,191,36,0.30);
        }

        .wc-bracket {
          display: grid;
          grid-template-columns: minmax(178px, 1.18fr) repeat(5, minmax(145px, 1fr));
          gap: 10px;
          overflow-x: visible;
          align-items: start;
          width: 100%;
        }

        .wc-bracket-round {
          min-width: 0;
        }

        .wc-round-title {
          font-weight: 900;
          margin-bottom: 8px;
          font-size: 13px;
          line-height: 1.1;
          text-align: center;
          text-shadow: 0 2px 7px rgba(0,0,0,0.55);
        }

        .wc-bracket-match {
          position: relative;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 13px;
          padding: 8px;
          margin-bottom: 8px;
          min-width: 0;
          overflow: hidden;
        }

        .wc-bracket-match::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -11px;
          width: 11px;
          height: 1px;
          background: rgba(255,255,255,0.28);
          pointer-events: none;
        }

        .wc-bracket-round:last-child .wc-bracket-match::after {
          display: none;
        }

        .wc-bracket-match .big-flag-img,
        .wc-bracket-match .big-flag,
        .wc-bracket-match .missing-flag {
          width: 36px;
          height: 24px;
          font-size: 17px;
          border-radius: 7px;
        }

        .wc-bracket-match .team-flag-name {
          font-size: 10px;
          line-height: 1.05;
          max-width: 55px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-bracket-match .fixture-teams-big {
          gap: 4px;
          align-items: center;
          min-width: 0;
        }

        .wc-bracket-match .fixture-middle {
          min-width: 34px;
          font-size: 12px;
        }

        .wc-bracket-match .fixture-card-venue-inline {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          text-align: center;
          padding: 5px 6px;
          line-height: 1.12;
          overflow: hidden;
          background: rgba(0,0,0,0.18);
          border-radius: 9px;
        }

        .wc-bracket-match .fixture-card-venue-inline span,
        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-name,
        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-location,
        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-capacity {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          white-space: normal;
          overflow-wrap: normal;
          word-break: normal;
          text-align: center;
          justify-self: center;
        }

        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-name {
          font-size: 10.5px;
          font-weight: 900;
        }

        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-location {
          font-size: 9px;
          opacity: 0.88;
        }

        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-real,
        .wc-bracket-match .fixture-card-venue-inline .fixture-venue-capacity {
          display: none;
        }

        .wc-bracket-match .fixture-stadium-image {
          width: 100%;
          height: 58px;
          object-fit: cover;
          object-position: center;
          border-radius: 10px;
          margin: 6px 0 5px;
          background: rgba(0,0,0,.24);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 6px 14px rgba(0,0,0,0.22);
        }

        @media (max-width: 1400px) {
          .wc-bracket {
            grid-template-columns: minmax(160px, 1.1fr) repeat(5, minmax(125px, 1fr));
            gap: 7px;
          }

          .wc-bracket-match {
            padding: 6px;
            margin-bottom: 6px;
          }

          .wc-bracket-match .big-flag-img,
          .wc-bracket-match .big-flag,
          .wc-bracket-match .missing-flag {
            width: 30px;
            height: 20px;
            font-size: 14px;
          }

          .wc-bracket-match .team-flag-name {
            font-size: 9px;
            max-width: 46px;
          }

          .wc-bracket-match .fixture-middle {
            min-width: 28px;
            font-size: 10px;
          }

          .wc-bracket-match .fixture-stadium-image {
            height: 46px;
          }

          .wc-bracket-match .fixture-card-venue-inline .fixture-venue-name {
            font-size: 9px;
          }

          .wc-bracket-match .fixture-card-venue-inline .fixture-venue-location {
            font-size: 8px;
          }
        }

        .wc-groups-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          align-items: start;
        }

        .wc-group-card {
          padding: 13px 14px 12px;
          border-radius: 18px;
          margin-bottom: 0;
        }

        .wc-group-card .wc-section-title {
          font-size: 19px;
          line-height: 1;
          margin: 0 0 9px;
        }

        .wc-group-card .wc-table-wrap {
          overflow-x: hidden;
          width: 100%;
        }

        .wc-group-card .wc-table {
          width: 100%;
          min-width: 0;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 11px;
        }

        .wc-group-card .wc-table th,
        .wc-group-card .wc-table td {
          padding: 4px 3px;
          line-height: 1.18;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-bottom: 1px solid rgba(255,255,255,0.10);
          vertical-align: middle;
        }

        .wc-group-card .wc-table th {
          font-size: 9.8px;
          letter-spacing: -0.2px;
          opacity: 0.78;
          text-align: center;
        }

        .wc-group-card .wc-table th:nth-child(1),
        .wc-group-card .wc-table td:nth-child(1) {
          width: 7%;
          text-align: center;
        }

        .wc-group-card .wc-table th:nth-child(2),
        .wc-group-card .wc-table td:nth-child(2) {
          width: 43%;
          text-align: left;
          padding-left: 4px;
          padding-right: 6px;
        }

        .wc-group-card .wc-table th:nth-child(3),
        .wc-group-card .wc-table td:nth-child(3),
        .wc-group-card .wc-table th:nth-child(4),
        .wc-group-card .wc-table td:nth-child(4),
        .wc-group-card .wc-table th:nth-child(5),
        .wc-group-card .wc-table td:nth-child(5),
        .wc-group-card .wc-table th:nth-child(6),
        .wc-group-card .wc-table td:nth-child(6),
        .wc-group-card .wc-table th:nth-child(7),
        .wc-group-card .wc-table td:nth-child(7),
        .wc-group-card .wc-table th:nth-child(8),
        .wc-group-card .wc-table td:nth-child(8) {
          width: 5.5%;
          text-align: center;
        }

        .wc-group-card .wc-table th:nth-child(9),
        .wc-group-card .wc-table td:nth-child(9) {
          width: 8%;
          text-align: center;
        }

        .wc-group-card .wc-table th:nth-child(10),
        .wc-group-card .wc-table td:nth-child(10) {
          width: 9%;
          text-align: center;
          font-weight: 900;
        }

        .wc-group-card .group-team-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          width: 100%;
          overflow: hidden;
        }

        .wc-group-card .group-team-cell strong {
          display: block;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .wc-group-card .group-flag-img,
        .wc-group-card .group-flag-missing {
          width: 23px;
          height: 16px;
          font-size: 11px;
          flex: 0 0 auto;
        }


        .overview-pro-page {
          display: grid;
          gap: 16px;
        }

        .overview-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.55fr);
          gap: 18px;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(circle at top left, rgba(45,190,255,0.22), transparent 34%),
            radial-gradient(circle at bottom right, rgba(255,215,80,0.16), transparent 32%),
            rgba(255,255,255,0.09);
        }

        .overview-hero.compact-overview-hero,
        .overview-hero {
          min-height: auto;
          padding: 12px 16px;
          grid-template-columns: minmax(0, 1.7fr) minmax(220px, 0.5fr);
          gap: 12px;
        }

        .overview-hero .overview-kicker {
          display: none;
        }

        .overview-hero-title.compact-title,
        .overview-hero-title {
          font-size: clamp(24px, 3vw, 38px);
          line-height: 1;
          margin-bottom: 4px;
        }

        .overview-hero-subtitle.compact-subtitle,
        .overview-hero-subtitle {
          font-size: 12px;
          line-height: 1.2;
          opacity: 0.68;
          max-width: 520px;
        }

        .overview-progress-wrap {
          margin-top: 4px;
          max-width: 380px;
        }

        .overview-progress-top {
          margin-bottom: 2px;
          font-size: 9px;
        }

        .overview-progress-bar {
          height: 4px;
        }

        .overview-action-row {
          margin-top: 10px;
          gap: 7px;
        }

        .overview-action-button {
          padding: 7px 11px;
          font-size: 11px;
        }

        .overview-hero-side {
          gap: 8px;
        }

        .overview-status-card {
          min-height: 74px;
          padding: 11px 13px;
          gap: 3px;
          border-radius: 15px;
        }

        .overview-status-card strong {
          font-size: 26px;
        }

        .overview-status-card span,
        .overview-status-card em {
          font-size: 11px;
        }


        .overview-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .overview-hero-main,
        .overview-hero-side {
          position: relative;
          z-index: 1;
        }

        .overview-kicker,
        .overview-small-label {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: rgba(155,225,255,0.95);
          margin-bottom: 7px;
        }

        .overview-hero-title {
          font-size: clamp(30px, 4vw, 54px);
          line-height: 0.95;
          font-weight: 1000;
          text-shadow: 0 12px 30px rgba(0,0,0,0.45);
          margin-bottom: 12px;
        }

        .overview-hero-subtitle {
          max-width: 820px;
          color: rgba(255,255,255,0.78);
          font-size: 15px;
          line-height: 1.45;
        }

        .overview-progress-wrap {
          margin-top: 22px;
          max-width: 680px;
        }

        .overview-progress-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .overview-progress-bar {
          height: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.16);
        }

        .overview-progress-bar div {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(45,190,255,0.88), rgba(255,215,80,0.88));
          box-shadow: 0 0 22px rgba(45,190,255,0.38);
        }

        .overview-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .overview-action-button {
          cursor: pointer;
          color: white;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.11);
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 900;
          backdrop-filter: blur(10px);
        }

        .overview-action-button:hover {
          background: rgba(45,190,255,0.28);
          border-color: rgba(120,220,255,0.65);
        }

        .overview-hero-side {
          display: grid;
          gap: 12px;
          align-content: stretch;
        }

        .overview-status-card {
          min-height: 132px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(0,0,0,0.20);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .overview-status-card.is-live {
          background: linear-gradient(135deg, rgba(255,40,40,0.28), rgba(255,255,255,0.08));
          border-color: rgba(255,90,90,0.44);
        }

        .overview-status-card span,
        .overview-status-card em,
        .overview-stat-tile span,
        .overview-stat-tile em,
        .overview-info-list span,
        .overview-info-list em {
          color: rgba(255,255,255,0.70);
          font-style: normal;
          font-size: 12px;
          font-weight: 800;
        }

        .overview-status-card strong {
          font-size: 40px;
          line-height: 1;
          font-weight: 1000;
        }

        .overview-stat-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .overview-stat-tile {
          min-height: 112px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 18px;
          padding: 15px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 14px 34px rgba(0,0,0,0.15);
        }

        .overview-stat-tile strong {
          font-size: 34px;
          line-height: 1;
          font-weight: 1000;
        }

        .overview-stat-tile em {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .overview-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
          gap: 16px;
          align-items: stretch;
        }

        .overview-lower-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .overview-panel {
          margin-bottom: 0;
        }

        .overview-panel-heading {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .overview-panel-heading .wc-section-title {
          margin: 0;
        }

        .overview-date-pill {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 8px 11px;
          background: rgba(255,255,255,0.11);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 12px;
          font-weight: 900;
          color: rgba(255,255,255,0.78);
        }

        .overview-feature-panel .fixture-card {
          min-height: 210px;
        }

        .overview-info-list {
          display: grid;
          gap: 10px;
        }

        .overview-info-list div {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 6px 12px;
          align-items: center;
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.09);
        }

        .overview-info-list strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .overview-info-list em {
          grid-column: 2;
        }

        .overview-mini-match-list,
        .overview-player-list {
          display: grid;
          gap: 10px;
        }

        .overview-mini-match {
          padding: 12px;
          border-radius: 16px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .overview-mini-top,
        .overview-mini-date {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: rgba(255,255,255,0.66);
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .overview-mini-top em {
          font-style: normal;
          color: rgba(255,255,255,0.86);
        }

        .overview-mini-teams {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          margin: 10px 0;
        }

        .overview-mini-teams div {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .overview-mini-teams div:last-child {
          justify-content: flex-end;
          text-align: right;
        }

        .overview-mini-teams strong {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .overview-mini-teams b {
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(0,0,0,0.24);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 13px;
        }

        .overview-player-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) minmax(0, 0.85fr) auto;
          gap: 10px;
          align-items: center;
          padding: 11px 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.09);
        }

        .overview-player-row span {
          width: 25px;
          height: 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(45,190,255,0.26);
          font-size: 12px;
          font-weight: 1000;
        }

        .overview-player-row strong,
        .overview-player-row em {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .overview-player-row em {
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-style: normal;
        }

        .overview-player-row b {
          font-size: 18px;
        }



        .fixtures-page-card {
          padding: 20px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(10,30,58,0.72), rgba(255,255,255,0.075)),
            rgba(255,255,255,0.08);
        }

        .fixtures-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: stretch;
          margin-bottom: 16px;
        }

        .fixtures-title-wrap {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .fixtures-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .fixtures-subtitle {
          opacity: 0.78;
          font-size: 13px;
          margin-top: 2px;
          line-height: 1.35;
        }

        .fixtures-summary-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(82px, 1fr));
          gap: 10px;
          min-width: 430px;
        }

        .fixtures-summary-box {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(45,190,255,0.18), rgba(255,255,255,0.065));
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 18px;
          padding: 13px 12px;
          text-align: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 28px rgba(0,0,0,0.14);
        }

        .fixtures-summary-box::after {
          content: "";
          position: absolute;
          inset: auto -20px -26px auto;
          width: 62px;
          height: 62px;
          border-radius: 999px;
          background: rgba(45,190,255,0.13);
        }

        .fixtures-summary-box strong {
          display: block;
          font-size: 27px;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .fixtures-summary-box span {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          opacity: 0.78;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          position: relative;
          z-index: 1;
        }

        .fixtures-next-strip {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px 14px;
          margin-bottom: 16px;
          padding: 13px 15px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(45,190,255,0.24), rgba(20,70,130,0.20));
          border: 1px solid rgba(120,220,255,0.34);
          box-shadow: 0 14px 34px rgba(0,0,0,0.16);
        }

        .fixtures-next-strip span {
          opacity: 0.82;
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .fixtures-next-strip strong {
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fixtures-next-strip em {
          opacity: 0.82;
          font-style: normal;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .results-page-card {
          background: linear-gradient(135deg, rgba(5,28,62,0.88), rgba(8,43,86,0.72));
          border: 1px solid rgba(120,220,255,0.22);
          box-shadow: 0 18px 46px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
        }

        .results-subtitle {
          color: rgba(255,255,255,0.78);
          font-size: 14px;
          font-weight: 750;
          margin-top: 3px;
        }

        .results-count-pill {
          white-space: nowrap;
          padding: 9px 13px;
          border-radius: 999px;
          background: rgba(45,190,255,0.16);
          border: 1px solid rgba(120,220,255,0.30);
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .results-basic-list {
          display: grid;
          gap: 10px;
        }

        .result-basic-row {
          display: grid;
          grid-template-columns: minmax(135px, 0.75fr) minmax(155px, 1fr) auto minmax(155px, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 15px 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.095), rgba(45,190,255,0.07));
          border: 1px solid rgba(255,255,255,0.13);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.055), 0 12px 26px rgba(0,0,0,0.18);
        }

        .result-basic-meta {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .result-basic-meta strong {
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.3px;
        }

        .result-basic-meta span {
          color: rgba(255,255,255,0.78);
          font-size: 12px;
          font-weight: 850;
        }

        .result-basic-meta em {
          color: rgba(255,255,255,0.68);
          font-style: normal;
          font-size: 11.5px;
          font-weight: 750;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .result-basic-team {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
          font-size: 18px;
          font-weight: 950;
        }

        .result-basic-team span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .result-basic-home {
          justify-content: flex-end;
          text-align: right;
        }

        .result-basic-away {
          justify-content: flex-start;
          text-align: left;
        }

        .result-basic-row .group-flag-img,
        .result-basic-row .group-flag-missing {
          width: 56px;
          height: 38px;
          border-radius: 7px;
          font-size: 20px;
          flex: 0 0 auto;
          box-shadow: 0 7px 16px rgba(0,0,0,0.32);
        }

        .result-basic-score-wrap {
          display: grid;
          place-items: center;
          min-width: 96px;
        }

        .result-basic-score {
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .result-basic-score-wrap small {
          margin-top: 5px;
          color: rgba(255,255,255,0.72);
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .result-basic-status {
          justify-self: end;
          white-space: nowrap;
          padding: 8px 11px;
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 11px;
          font-weight: 950;
        }


        .match-scorers-box {
          grid-column: 1 / -1;
          width: 100%;
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 13px;
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .match-scorers-title {
          margin-bottom: 8px;
          color: rgba(255,255,255,0.68);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .match-scorers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .match-scorers-team {
          min-width: 0;
        }

        .match-scorers-team strong {
          display: block;
          margin-bottom: 4px;
          color: rgba(255,255,255,0.92);
          font-size: 12px;
          font-weight: 950;
        }

        .match-scorers-names {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .match-scorer-pill {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.88);
          font-size: 11px;
          font-weight: 850;
          line-height: 1.1;
        }

        .match-scorer-empty {
          color: rgba(255,255,255,0.44);
          font-size: 11px;
          font-weight: 800;
        }

        .match-extra-live-data {
          grid-column: 1 / -1;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.8fr);
          gap: 10px;
          margin-top: 8px;
        }

        .match-events-box,
        .match-officials-box {
          padding: 10px 12px;
          border-radius: 13px;
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .match-extra-title {
          margin-bottom: 8px;
          color: rgba(255,255,255,0.68);
          font-size: 11px;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .match-events-list {
          display: grid;
          gap: 6px;
          max-height: 210px;
          overflow: auto;
          padding-right: 2px;
        }

        .match-event-row {
          display: grid;
          grid-template-columns: 42px 26px minmax(0, 1fr);
          gap: 7px;
          align-items: start;
          padding: 7px 8px;
          border-radius: 11px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .match-event-minute {
          color: rgba(255,255,255,0.76);
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .match-event-icon {
          font-size: 15px;
          line-height: 1;
        }

        .match-event-main {
          min-width: 0;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px 7px;
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 850;
        }

        .match-event-main strong {
          font-weight: 950;
        }

        .match-event-main em,
        .match-event-main small {
          color: rgba(255,255,255,0.62);
          font-style: normal;
          font-size: 11px;
          font-weight: 800;
        }

        .match-officials-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .match-official-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.88);
          font-size: 11px;
          font-weight: 850;
        }

        .match-official-pill span,
        .match-official-pill em {
          color: rgba(255,255,255,0.58);
          font-style: normal;
          font-size: 10px;
          text-transform: uppercase;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .match-extra-live-data {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .match-scorers-grid {
            grid-template-columns: 1fr;
          }
        }

        .results-footnote {
          text-align: center;
          margin-top: 13px;
          color: rgba(255,255,255,0.62);
          font-size: 12px;
          font-weight: 750;
        }

        @media (max-width: 1000px) {
          .result-basic-row {
            grid-template-columns: 1fr auto 1fr;
            gap: 9px 11px;
          }

          .result-basic-meta {
            grid-column: 1 / -1;
            display: flex;
            flex-wrap: wrap;
            gap: 5px 10px;
          }

          .result-basic-status {
            grid-column: 1 / -1;
            justify-self: center;
          }
        }

        @media (max-width: 620px) {
          .results-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .result-basic-row {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .result-basic-home,
          .result-basic-away {
            justify-content: center;
            text-align: center;
          }

          .result-basic-home {
            flex-direction: row-reverse;
          }

          .result-basic-score {
            font-size: 30px;
          }
        }

        .fixtures-days {
          display: grid;
          gap: 16px;
        }

        .fixtures-day-block {
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 22px;
          padding: 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .fixtures-day-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          padding: 0 3px;
        }

        .fixtures-day-heading span {
          font-size: 17px;
          font-weight: 950;
        }

        .fixtures-day-heading small {
          opacity: 0.76;
          font-weight: 900;
          white-space: nowrap;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 999px;
          padding: 5px 9px;
        }

        .fixtures-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 12px;
        }

        .fixture-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255,255,255,0.11), rgba(255,255,255,0.055));
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 20px;
          padding: 13px;
          box-shadow: 0 14px 32px rgba(0,0,0,0.18);
        }

        .fixture-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at top center, rgba(45,190,255,0.15), transparent 46%);
          opacity: 0.75;
        }

        .fixture-card.is-live {
          background: linear-gradient(135deg, rgba(255,48,48,0.23), rgba(255,255,255,0.055));
          border-color: rgba(255,95,95,0.50);
        }

        .fixture-card.is-finished {
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.10));
        }

        .fixture-card-top,
        .fixture-card-footer,
        .fixture-card-main {
          position: relative;
          z-index: 1;
        }

        .fixture-card-top,
        .fixture-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: rgba(255,255,255,0.76);
          font-size: 11px;
          font-weight: 850;
        }

        .fixture-card-top span,
        .fixture-card-footer span {
          min-width: 0;
        }

        .fixture-card-footer span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fixture-card-status {
          color: white;
          background: rgba(255,255,255,0.13);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 950;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.25px;
        }

        .fixture-card.is-live .fixture-card-status {
          background: rgba(255,40,40,0.34);
          border-color: rgba(255,120,120,0.55);
        }

        .fixture-card.is-scheduled .fixture-card-status {
          background: rgba(45,190,255,0.20);
          border-color: rgba(120,220,255,0.38);
        }

        .fixture-stage-pill {
          display: inline-flex;
          align-items: center;
          max-width: 70%;
          background: rgba(0,0,0,0.18);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 999px;
          padding: 5px 9px;
        }

        .fixture-card-number {
          position: absolute;
          right: 12px;
          bottom: 10px;
          z-index: 0;
          font-size: 40px;
          font-weight: 950;
          opacity: 0.055;
          pointer-events: none;
        }

        .fixture-card-main {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          gap: 8px;
          padding: 8px 0 7px;
        }

        .fixture-card-team {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          font-weight: 900;
          font-size: 13px;
          line-height: 1.05;
        }

        .fixture-card-team span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fixture-card-team-away {
          justify-content: flex-end;
          text-align: right;
        }

        .fixture-card-team-away img,
        .fixture-card-team-away .group-flag-missing {
          order: 2;
        }

        .fixture-card .group-flag-img,
        .fixture-card .group-flag-missing {
          width: 36px;
          height: 25px;
          border-radius: 5px;
          font-size: 14px;
          box-shadow: 0 5px 11px rgba(0,0,0,0.30);
        }

        .fixture-card-score {
          min-width: 58px;
          text-align: center;
          font-size: 20px;
          font-weight: 950;
          padding: 6px 9px;
          border-radius: 12px;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: inset 0 0 18px rgba(255,255,255,0.04), 0 6px 14px rgba(0,0,0,0.14);
        }

        .fixture-card-footer {
          border-top: 1px solid rgba(255,255,255,0.09);
          padding-top: 10px;
        }

        .fixture-card-footer span:last-child:empty {
          display: none;
        }

        .fixture-card-top-merged {
          align-items: flex-start;
          gap: 7px;
          flex-wrap: wrap;
        }

        .fixture-top-details {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 5px;
          min-width: 0;
          flex: 1 1 210px;
        }

        .fixture-top-details span {
          display: inline-flex;
          align-items: center;
          min-width: fit-content;
          max-width: none;
          padding: 4px 7px;
          border-radius: 999px;
          background: rgba(0,0,0,0.16);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: visible;
          text-overflow: clip;
          white-space: normal;
          font-size: 10.5px;
          line-height: 1.15;
        }

        .fixture-top-details .fixture-date-pill,
        .fixture-top-details .fixture-time-pill {
          white-space: nowrap;
        }

        .fixture-top-details .fixture-time-pill {
          font-size: 12px;
          font-weight: 900;
          padding: 5px 8px;
          background: rgba(0,0,0,0.24);
        }

        .fixture-card-main-compact {
          padding: 6px 0 6px;
          gap: 7px;
        }

        .fixture-card-main-compact .fixture-card-team {
          gap: 6px;
          font-size: 12px;
          line-height: 1;
        }

        .fixture-card-main-compact .group-flag-img,
        .fixture-card-main-compact .group-flag-missing {
          width: 32px;
          height: 22px;
          border-radius: 5px;
        }

        .fixture-card-main-compact .fixture-card-score {
          min-width: 52px;
          font-size: 18px;
          padding: 5px 8px;
          border-radius: 11px;
        }

        .fixture-stadium-image {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: 178px;
          object-fit: cover;
          object-position: center;
          border-radius: 13px;
          margin: 5px 0 6px;
          background: rgba(0,0,0,.24);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 8px 20px rgba(0,0,0,0.20);
        }

        .fixture-card-venue-inline {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(110px, 0.95fr) minmax(78px, auto);
          align-items: center;
          column-gap: 10px;
          row-gap: 4px;
          min-width: 0;
          margin: 0;
          padding: 7px 10px;
          border-radius: 9px;
          background: rgba(0,0,0,.17);
          border: 1px solid rgba(255,255,255,.11);
          font-size: 12px;
          line-height: 1.18;
          color: rgba(255,255,255,0.92);
          overflow: visible;
        }

        .fixture-card-venue-inline span {
          min-width: 0;
          opacity: 0.94;
        }

        .fixture-card-venue-inline .fixture-venue-name {
          font-weight: 900;
          opacity: 1;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          overflow-wrap: anywhere;
        }

        .fixture-card-venue-inline .fixture-venue-location {
          justify-self: center;
          text-align: center;
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          overflow-wrap: anywhere;
        }

        .fixture-card-venue-inline .fixture-venue-real {
          display: none;
        }

        .fixture-card-venue-inline .fixture-venue-capacity {
          justify-self: end;
          font-size: 12px;
          font-weight: 850;
          text-align: right;
          white-space: nowrap;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .fixture-card-venue-inline {
            grid-template-columns: minmax(0, 1fr) auto;
            font-size: 11.5px;
          }

          .fixture-card-venue-inline .fixture-venue-name {
            grid-column: 1 / -1;
          }

          .fixture-card-venue-inline .fixture-venue-location {
            justify-self: start;
            text-align: left;
          }

          .fixture-card-venue-inline .fixture-venue-capacity {
            font-size: 11.5px;
          }
        }

        @media (max-width: 560px) {
          .fixture-card-top-merged {
            align-items: stretch;
          }

          .fixture-stage-pill {
            max-width: 100%;
          }

          .fixture-top-details {
            flex: 1 1 100%;
            justify-content: flex-start;
          }

          .fixture-top-details span,
          .fixture-card-status {
            font-size: 10px;
            padding: 3px 6px;
          }

          .fixture-top-details .fixture-time-pill {
            font-size: 11px;
            padding: 4px 7px;
          }
        }


        @media (max-width: 1300px) {
          .overview-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .overview-lower-grid {
            grid-template-columns: 1fr 1fr;
          }
        }


        @media (max-width: 900px) {
          .overview-hero.compact-overview-hero,
          .overview-hero {
            padding: 11px;
            gap: 10px;
          }

          .overview-hero-title.compact-title,
          .overview-hero-title {
            font-size: 28px;
            text-align: center;
          }

          .overview-hero-subtitle.compact-subtitle,
          .overview-hero-subtitle {
            text-align: center;
            max-width: none;
          }

          .overview-progress-wrap {
            max-width: none;
          }

          .overview-action-row {
            justify-content: center;
          }

          .overview-status-card {
            min-height: 62px;
          }
        }

        @media (max-width: 950px) {
          .overview-hero,
          .overview-main-grid,
          .overview-lower-grid {
            grid-template-columns: 1fr;
          }

          .overview-hero-side {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .overview-stat-grid,
          .overview-hero-side {
            grid-template-columns: 1fr;
          }

          .overview-hero-title {
            font-size: 32px;
          }

          .overview-info-list div,
          .overview-player-row {
            grid-template-columns: 1fr;
          }

          .overview-info-list em {
            grid-column: auto;
          }

          .overview-mini-teams {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .overview-mini-teams div:last-child {
            justify-content: flex-start;
            text-align: left;
          }
        }

        @media (max-width: 1200px) {
          .wc-groups-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .wc-group-card .wc-table {
            font-size: 10.8px;
          }
        }

        @media (max-width: 700px) {
          .wc-groups-grid {
            grid-template-columns: 1fr;
          }

          .wc-group-card {
            padding: 10px;
          }

          .wc-group-card .wc-table {
            font-size: 10.5px;
          }

          .wc-group-card .wc-table th {
            font-size: 8.5px;
          }

          .wc-group-card .group-flag-img,
          .wc-group-card .group-flag-missing {
            width: 20px;
            height: 14px;
          }
        }



        .golden-boot-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          background:
            linear-gradient(135deg, rgba(255,205,80,0.22), rgba(255,255,255,0.08)),
            rgba(255,255,255,0.08);
          border-color: rgba(255,220,120,0.34);
        }

        .golden-kicker {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 12px;
          font-weight: 900;
          opacity: 0.78;
          margin-bottom: 6px;
        }

        .golden-title {
          margin-bottom: 6px;
        }

        .golden-boot-icon {
          width: 86px;
          height: 86px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          background: rgba(255,220,120,0.18);
          border: 1px solid rgba(255,220,120,0.34);
          box-shadow: 0 16px 36px rgba(0,0,0,0.25);
          flex: 0 0 auto;
        }

        .golden-layout {
          display: grid;
          grid-template-columns: 1.7fr 0.8fr;
          gap: 16px;
          align-items: stretch;
        }

        .golden-leader {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255,220,120,0.14);
          border: 1px solid rgba(255,220,120,0.28);
          margin-bottom: 14px;
        }

        .golden-leader-medal {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          font-size: 32px;
          background: rgba(255,255,255,0.12);
        }

        .golden-leader-name {
          font-size: 25px;
          font-weight: 900;
          line-height: 1.1;
        }

        .golden-leader-team,
        .golden-player-team {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 7px;
          opacity: 0.9;
          font-weight: 800;
        }

        .golden-leader-goals {
          text-align: center;
          min-width: 86px;
        }

        .golden-leader-goals strong {
          display: block;
          font-size: 44px;
          line-height: 1;
        }

        .golden-leader-goals span {
          display: block;
          font-size: 12px;
          opacity: 0.75;
          text-transform: uppercase;
          font-weight: 900;
          margin-top: 4px;
        }

        .golden-podium-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .golden-podium-item {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.12);
          min-width: 0;
        }

        .golden-podium-item.winner {
          background: rgba(255,220,120,0.15);
          border-color: rgba(255,220,120,0.30);
        }

        .golden-medal {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .golden-player-name {
          font-size: 17px;
          font-weight: 900;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .golden-player-stats {
          margin-top: 10px;
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .golden-player-stats strong {
          font-size: 26px;
        }

        .golden-player-stats span {
          opacity: 0.72;
          font-size: 12px;
          font-weight: 800;
        }

        .golden-summary-card {
          display: grid;
          gap: 10px;
        }

        .golden-mini-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .golden-mini-stat strong {
          font-size: 25px;
        }

        .golden-mini-stat span {
          opacity: 0.74;
          font-weight: 800;
          text-align: right;
        }

        .golden-table-wrap .wc-table {
          min-width: 760px;
        }

        .golden-table th,
        .golden-table td {
          vertical-align: middle;
        }

        .golden-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          font-weight: 900;
        }

        .golden-top-row .golden-rank {
          background: rgba(255,220,120,0.22);
          border: 1px solid rgba(255,220,120,0.30);
        }

        .golden-table-player {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .golden-profile-section {
          border-color: rgba(255,220,120,0.22);
        }

        .golden-profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
          gap: 12px;
        }

        .golden-profile-card {
          display: grid;
          grid-template-columns: 82px 1fr;
          gap: 12px;
          align-items: center;
          min-width: 0;
          padding: 13px;
          border-radius: 18px;
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .golden-profile-photo {
          position: relative;
          width: 82px;
          height: 82px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255,220,120,0.18);
          border: 1px solid rgba(255,220,120,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 28px rgba(0,0,0,0.22);
        }

        .golden-profile-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .golden-profile-fallback {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 1000;
          color: #fff7d6;
        }

        .golden-profile-main {
          min-width: 0;
        }

        .golden-profile-rank {
          display: inline-flex;
          margin-bottom: 5px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(255,220,120,0.16);
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
        }

        .golden-profile-main h3 {
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 17px;
        }

        .golden-profile-main p {
          margin: 5px 0 9px;
          opacity: 0.82;
          font-weight: 800;
        }

        .golden-profile-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .golden-profile-stats span {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          font-size: 11px;
          font-weight: 900;
        }

        .golden-profile-stats strong {
          margin-right: 4px;
          color: #fde68a;
        }

        .golden-table-medal {
          min-width: 22px;
        }

        .golden-goal-count {
          font-size: 20px;
        }


        .wc-venue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 14px;
        }



        /* Compact overview layout tweaks */
        .overview-hero.compact-overview-hero,
        .overview-hero {
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: start;
          padding: 10px 14px;
          gap: 10px;
          border-radius: 18px;
        }

        .overview-hero-title.compact-title,
        .overview-hero-title {
          font-size: clamp(20px, 2.2vw, 30px);
          line-height: 1;
          margin-bottom: 3px;
        }

        .overview-hero-subtitle.compact-subtitle,
        .overview-hero-subtitle {
          font-size: 11px;
          line-height: 1.2;
          max-width: 520px;
          opacity: 0.7;
        }

        .overview-progress-wrap {
          margin-top: 8px;
          max-width: 420px;
        }

        .overview-progress-top {
          margin-bottom: 4px;
          font-size: 10px;
        }

        .overview-progress-bar {
          height: 6px;
        }

        .overview-action-row {
          margin-top: 8px;
          gap: 6px;
        }

        .overview-action-button {
          padding: 6px 10px;
          font-size: 10px;
        }

        .overview-top-pills {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          gap: 6px;
          min-width: 0;
        }

        .overview-status-card.overview-mini-pill {
          min-height: 0;
          width: auto;
          min-width: 74px;
          padding: 5px 8px;
          border-radius: 999px;
          gap: 1px;
          text-align: center;
        }

        .overview-status-card.overview-mini-pill span,
        .overview-status-card.overview-mini-pill em {
          font-size: 8px;
          line-height: 1.05;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .overview-status-card.overview-mini-pill strong {
          font-size: 13px;
          line-height: 1;
        }

        .overview-stat-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
        }

        .overview-stat-tile {
          min-height: 70px;
          padding: 9px 10px;
          border-radius: 14px;
        }

        .overview-stat-tile strong {
          font-size: clamp(19px, 2vw, 26px);
        }

        .overview-stat-tile span,
        .overview-stat-tile em {
          font-size: 10px;
          line-height: 1.1;
        }

        .overview-supporters-card {
          margin-top: 0;
        }

        @media (max-width: 900px) {
          .wc-header-title-row {
            justify-content: center;
            flex-wrap: wrap;
            text-align: center;
            gap: 8px;
          }

          .wc-header-live-pill {
            font-size: 10px;
            padding: 4px 8px;
          }

          .wc-header-countdown-pill {
            order: 10;
            flex: 1 1 100%;
            width: 100%;
            min-width: 0;
            min-height: 40px;
            font-size: clamp(17px, 5.2vw, 25px);
            padding: 8px 12px;
          }

          .wc-header-subtitle-inline {
            text-align: center;
          }

          .wc-overview-beer-button {
            padding: 10px 18px;
            font-size: 14px;
          }
        }


        @media (max-width: 800px) {
          .overview-hero.compact-overview-hero,
          .overview-hero {
            grid-template-columns: 1fr;
          }

          .overview-top-pills {
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .overview-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .wc-app {
            padding: 14px;
          }

          .wc-header {
            display: block;
          }

          .wc-title {
            font-size: 28px;
          }

          .wc-header-controls {
            justify-content: flex-end;
            align-items: center;
            flex-wrap: nowrap;
            margin-top: 12px;
          }

          .wc-pill,
          .wc-language-wrap,
          .wc-updated-wrap {
            display: inline-flex;
          }

          .wc-two {
            grid-template-columns: 1fr;
          }

          .fixture-teams-big {
            grid-template-columns: 1fr auto 1fr;
            gap: 10px;
          }

          .big-flag-img,
          .big-flag,
          .missing-flag {
            width: 74px;
            height: 50px;
          }

          .team-flag-name {
            font-size: 12px;
          }

          .fixture-middle {
            min-width: 54px;
          }

          .wc-score {
            font-size: 18px;
          }

          .fixtures-hero {
            display: block;
          }

          .fixtures-summary-grid {
            min-width: 0;
            margin-top: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .fixtures-card-grid {
            grid-template-columns: 1fr;
          }

          .fixture-card-main {
            gap: 7px;
          }

          .fixture-card-team {
            font-size: 12px;
          }

          .fixture-card .group-flag-img,
          .fixture-card .group-flag-missing {
            width: 31px;
            height: 22px;
          }

          .fixture-card-score {
            min-width: 54px;
            font-size: 18px;
            padding: 7px 8px;
          }

        }


        @media (max-width: 900px) {
          .golden-layout {
            grid-template-columns: 1fr;
          }

          .golden-podium-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .golden-boot-hero,
          .golden-leader {
            grid-template-columns: 1fr;
            display: grid;
            text-align: center;
          }

          .golden-boot-icon,
          .golden-leader-medal {
            margin: 0 auto;
          }

          .golden-leader-team,
          .golden-player-team {
            justify-content: center;
          }

          .golden-leader-goals {
            margin: 0 auto;
          }
        }


        .golden-layout-polished {
          grid-template-columns: minmax(0, 2.2fr) minmax(280px, 0.85fr);
          align-items: stretch;
        }

        .golden-main-card {
          min-width: 0;
        }

        .golden-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .golden-showcase {
          display: grid;
          grid-template-columns: minmax(230px, 0.8fr) minmax(360px, 1.35fr);
          gap: 14px;
          align-items: stretch;
        }

        .golden-leader-compact {
          grid-template-columns: 1fr;
          text-align: center;
          justify-items: center;
          margin-bottom: 0;
          min-height: 100%;
        }

        .golden-leader-compact .golden-leader-name {
          font-size: 22px;
        }

        .golden-leader-compact .golden-leader-team {
          justify-content: center;
        }

        .golden-leader-compact .golden-leader-goals strong {
          font-size: 58px;
        }

        .golden-podium-grid-polished {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: stretch;
          height: 100%;
        }

        .golden-podium-grid-polished .golden-podium-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 170px;
        }

        .golden-empty-podium {
          opacity: 0.55;
          border-style: dashed;
        }

        .golden-summary-card .wc-section-title {
          margin-bottom: 4px;
        }

        .golden-table-card .golden-card-head {
          margin-bottom: 8px;
        }

        .golden-table .group-team-cell {
          justify-content: flex-start;
        }

        @media (max-width: 1100px) {
          .golden-layout-polished,
          .golden-showcase {
            grid-template-columns: 1fr;
          }
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .golden-podium-grid-polished {
            grid-template-columns: 1fr;
          }

          .golden-card-head {
            align-items: flex-start;
          }
        }


        .golden-showcase-polished {
          align-items: stretch;
        }

        .golden-leader-main {
          min-width: 0;
        }

        .golden-leader-strip {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 4px;
        }

        .golden-leader-strip span {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 9px 10px;
          border-radius: 13px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.10);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          opacity: 0.88;
        }

        .golden-leader-strip strong {
          font-size: 17px;
          line-height: 1;
        }

        .golden-card-stat-row {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 12px;
          font-size: 11px;
          font-weight: 900;
          opacity: 0.82;
        }

        .golden-card-stat-row span {
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .golden-card-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          padding: 5px 8px;
          border-radius: 999px;
          font-weight: 900;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .golden-card-pill.yellow {
          background: rgba(255,220,80,0.12);
          border-color: rgba(255,220,80,0.24);
        }

        .golden-card-pill.red {
          background: rgba(255,90,90,0.12);
          border-color: rgba(255,90,90,0.24);
        }

        .golden-updated {
          text-align: center;
          font-size: 12px;
          margin-top: 2px;
        }

        @media (max-width: 620px) {
          .golden-table-wrap .golden-table {
            min-width: 0;
          }

          .golden-table thead {
            display: none;
          }

          .golden-table,
          .golden-table tbody,
          .golden-table tr,
          .golden-table td {
            display: block;
            width: 100%;
          }

          .golden-table tr {
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 18px;
            background: rgba(255,255,255,0.065);
            border: 1px solid rgba(255,255,255,0.10);
          }

          .golden-table td {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding: 7px 0;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }

          .golden-table td:first-child {
            justify-content: center;
            padding-top: 0;
          }

          .golden-table td:last-child {
            border-bottom: 0;
            padding-bottom: 0;
          }

          .golden-table td[data-label]::before {
            content: attr(data-label);
            opacity: 0.68;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 900;
          }

          .golden-table .group-team-cell,
          .golden-table-player {
            justify-content: flex-end;
            text-align: right;
          }

          .golden-leader-strip {
            grid-template-columns: 1fr;
          }
        }


        /* Compact overview hero - tiny status corner */
        .overview-hero.compact-overview-hero,
        .overview-hero {
          position: relative;
          min-height: auto;
          padding: 12px 16px 14px;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .overview-hero-side {
          position: absolute;
          top: 10px;
          right: 12px;
          display: flex;
          flex-direction: row;
          gap: 6px;
          z-index: 2;
        }

        .overview-status-card {
          min-height: 0;
          padding: 6px 9px;
          border-radius: 999px;
          gap: 0;
          background: rgba(0,0,0,0.22);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: none;
          min-width: auto;
        }

        .overview-status-card span {
          display: none;
        }

        .overview-status-card strong {
          font-size: 12px;
          line-height: 1;
          font-weight: 900;
        }

        .overview-status-card em {
          font-size: 10px;
          line-height: 1;
          opacity: 0.78;
          margin-left: 3px;
        }

        .overview-status-card.is-live {
          background: rgba(255,40,40,0.25);
          border-color: rgba(255,90,90,0.45);
        }

        .overview-hero-title.compact-title,
        .overview-hero-title {
          font-size: clamp(24px, 3vw, 36px);
          line-height: 1;
          margin-bottom: 2px;
          padding-right: 230px;
        }

        .overview-hero-subtitle.compact-subtitle,
        .overview-hero-subtitle {
          font-size: 11px;
          line-height: 1.15;
          opacity: 0.72;
          max-width: 480px;
          padding-right: 230px;
        }

        .overview-progress-wrap {
          margin-top: 8px;
          max-width: none;
        }

        .overview-action-row {
          margin-top: 9px;
        }

        @media (max-width: 900px) {
          .overview-hero-side {
            position: static;
            justify-content: center;
            margin-bottom: 4px;
            order: -1;
          }

          .overview-hero-title.compact-title,
          .overview-hero-title,
          .overview-hero-subtitle.compact-subtitle,
          .overview-hero-subtitle {
            padding-right: 0;
            text-align: center;
          }
        }


        /* Compact overview stat row */
        .overview-stat-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
        }

        .overview-stat-tile {
          min-height: 62px;
          padding: 8px 10px;
          border-radius: 13px;
        }

        .overview-stat-tile strong {
          font-size: 23px;
          line-height: 1;
          margin-bottom: 2px;
        }

        .overview-stat-tile span,
        .overview-stat-tile em {
          font-size: 10px;
          line-height: 1.15;
        }

        @media (max-width: 1250px) {
          .overview-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .overview-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }


        .overview-supporters-card,
        .overview-latest-supporters-card {
          margin-top: 16px;
        }

        .overview-supporters-card .wc-grid,
        .overview-latest-supporters-card .wc-grid {
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 8px;
        }



        /* User requested: progress bar twice the previous desktop width. */
        .overview-progress-wrap {
          width: 170%;
          max-width: 1156px;
        }

        .overview-live-games-button.is-offline {
          background: rgba(231, 76, 60, 0.24);
          border-color: rgba(231, 76, 60, 0.62);
          box-shadow: 0 0 14px rgba(231, 76, 60, 0.18);
        }

        .overview-live-games-button.is-live {
          background: rgba(46, 204, 113, 0.24);
          border-color: rgba(46, 204, 113, 0.68);
          box-shadow: 0 0 14px rgba(46, 204, 113, 0.20);
        }

        .overview-live-games-button.is-offline:hover {
          background: rgba(231, 76, 60, 0.34);
          border-color: rgba(231, 76, 60, 0.82);
        }

        .overview-live-games-button.is-live:hover {
          background: rgba(46, 204, 113, 0.34);
          border-color: rgba(46, 204, 113, 0.88);
        }

        @media (max-width: 700px) {
          .overview-progress-wrap {
            width: 100%;
            max-width: none;
          }
        }


        /* Compact stat bar refinement - smaller cards, bigger readable text */
        .overview-stat-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 6px;
          margin-top: 8px;
        }

        .overview-stat-tile {
          min-height: 48px;
          padding: 6px 8px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1px;
        }

        .overview-stat-tile strong {
          font-size: clamp(24px, 2.2vw, 32px);
          line-height: 0.95;
          margin: 0;
          font-weight: 900;
        }

        .overview-stat-tile span,
        .overview-stat-tile em {
          font-size: 11px;
          line-height: 1.05;
          margin: 0;
          text-align: center;
          white-space: nowrap;
        }

        @media (max-width: 1250px) {
          .overview-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .overview-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .overview-stat-tile {
            min-height: 46px;
            padding: 5px 7px;
          }

          .overview-stat-tile strong {
            font-size: 24px;
          }

          .overview-stat-tile span,
          .overview-stat-tile em {
            font-size: 10px;
          }
        }


        /* Tighten space between overview progress bar and stat pills */
        .overview-hero.compact-overview-hero,
        .overview-hero {
          padding-bottom: 4px;
          margin-bottom: -16px;
        }

        .overview-stat-grid {
          margin-top: 0;
        }



        /* Merge overview stat pills into the bottom of the progress block */
        .overview-progress-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .overview-progress-wrap .overview-stat-grid-in-progress {
          margin-top: 0;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 5px;
        }

        .overview-progress-wrap .overview-stat-tile {
          min-height: 42px;
          padding: 5px 7px;
          border-radius: 11px;
        }

        .overview-progress-wrap .overview-stat-tile strong {
          font-size: clamp(21px, 2vw, 29px);
          line-height: 0.95;
        }

        .overview-progress-wrap .overview-stat-tile span,
        .overview-progress-wrap .overview-stat-tile em {
          font-size: 10px;
          line-height: 1;
        }

        .overview-hero.compact-overview-hero,
        .overview-hero {
          padding-bottom: 8px;
          margin-bottom: 8px;
        }

        @media (max-width: 1250px) {
          .overview-progress-wrap .overview-stat-grid-in-progress {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .overview-progress-wrap .overview-stat-grid-in-progress {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }


        /* Final fix: make overview header/stat area fit and match the glass theme */
        .overview-pro-page,
        .overview-hero,
        .overview-main-grid,
        .overview-lower-grid,
        .wc-card {
          max-width: 100%;
          box-sizing: border-box;
        }

        .overview-pro-page {
          overflow-x: hidden;
        }

        .overview-hero.compact-overview-hero,
        .overview-hero {
          width: 100%;
          padding: 12px 14px 14px;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(45,190,255,0.20), transparent 34%),
            radial-gradient(circle at bottom right, rgba(255,215,80,0.13), transparent 32%),
            linear-gradient(135deg, rgba(8,20,48,0.70), rgba(20,75,120,0.36));
          border: 1px solid rgba(120,220,255,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 12px 30px rgba(0,0,0,0.20);
        }

        .overview-progress-wrap {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0;
        }

        .overview-progress-bar {
          width: 100%;
        }

        .overview-stat-grid.overview-stat-grid-in-progress,
        .overview-stat-grid {
          width: 100%;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 7px;
        }

        .overview-stat-tile {
          min-width: 0;
          min-height: 58px;
          padding: 7px 8px;
          border-radius: 12px;
          background: rgba(255,255,255,0.085);
          border: 1px solid rgba(155,225,255,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .overview-stat-tile strong {
          font-size: clamp(18px, 1.8vw, 24px);
        }

        .overview-stat-tile span,
        .overview-stat-tile em {
          font-size: 9px;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .overview-top-pills,
        .overview-hero-side {
          max-width: calc(100% - 24px);
        }

        .overview-status-card.overview-mini-pill,
        .overview-status-card {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          min-height: 0;
          min-width: 0;
          max-width: 145px;
          padding: 6px 9px;
          border-radius: 999px;
          background: rgba(8,20,48,0.62);
          border: 1px solid rgba(155,225,255,0.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 18px rgba(0,0,0,0.18);
          backdrop-filter: blur(12px);
          overflow: hidden;
        }

        .overview-status-card span {
          display: none !important;
        }

        .overview-status-card strong,
        .overview-status-card.overview-mini-pill strong {
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .overview-status-card em,
        .overview-status-card.overview-mini-pill em {
          font-size: 9px;
          line-height: 1;
          margin-left: 4px;
          opacity: 0.76;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 1200px) {
          .overview-stat-grid.overview-stat-grid-in-progress,
          .overview-stat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .overview-stat-grid.overview-stat-grid-in-progress,
          .overview-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }


        /* Tablet view only: make overview buttons/stat cards larger and easier to read */
        .wc-app.wc-view-tablet .wc-nav {
          gap: 10px;
        }

        .wc-app.wc-view-tablet .wc-nav button {
          font-size: 14px;
          padding: 11px 17px;
          min-height: 42px;
          min-width: 118px;
        }

        .wc-app.wc-view-tablet .overview-action-row {
          gap: 10px;
          margin-top: 12px;
        }

        .wc-app.wc-view-tablet .overview-action-button {
          font-size: 14px;
          padding: 11px 18px;
          min-height: 42px;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress,
        .wc-app.wc-view-tablet .overview-stat-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .wc-app.wc-view-tablet .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile {
          min-height: 82px;
          padding: 11px 13px;
          border-radius: 15px;
        }

        .wc-app.wc-view-tablet .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong {
          font-size: clamp(28px, 4vw, 38px);
          line-height: 1;
        }

        .wc-app.wc-view-tablet .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em {
          font-size: 13px;
          line-height: 1.15;
        }

        @media (max-width: 700px) {
          .wc-app.wc-view-tablet .wc-nav button {
            min-width: 0;
            flex: 1 1 calc(50% - 8px);
          }

          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress,
          .wc-app.wc-view-tablet .overview-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }



        /* Tablet view only: force status pills + all 11 nav buttons onto ONE top row */
        .wc-app.wc-view-tablet .wc-header-title-row {
          display: grid !important;
          grid-template-columns: max-content max-content minmax(0, 1fr) !important;
          grid-auto-rows: auto !important;
          align-items: center !important;
          justify-content: stretch !important;
          column-gap: 3px !important;
          row-gap: 4px !important;
          width: 100% !important;
          overflow: hidden !important;
          text-align: left !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill {
          min-width: 0 !important;
          max-width: none !important;
          min-height: 13px !important;
          padding: 2px 4px !important;
          border-radius: 999px !important;
          font-size: 6px !important;
          line-height: 1 !important;
          letter-spacing: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex !important;
          grid-column: 3 !important;
          grid-row: 1 !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          gap: 2px !important;
          align-items: center !important;
          justify-content: stretch !important;
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 1 1 0 !important;
          min-width: 0 !important;
          max-width: none !important;
          min-height: 13px !important;
          padding: 2px 2px !important;
          border-radius: 999px !important;
          font-size: 5.5px !important;
          line-height: 1 !important;
          letter-spacing: -0.15px !important;
          font-weight: 800 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          grid-column: 1 / -1 !important;
          grid-row: 2 !important;
          width: 100% !important;
          margin-top: 4px !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          grid-column: 1 / -1 !important;
          grid-row: 3 !important;
          width: fit-content !important;
          max-width: 100% !important;
          margin-top: 0 !important;
        }

        .wc-app.wc-view-tablet > .wc-shell > .wc-nav,
        .wc-app.wc-view-tablet .wc-shell > .wc-nav {
          display: none !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill {
            font-size: 5.5px !important;
            padding: 2px 3px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav {
            gap: 1px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            font-size: 5px !important;
            padding: 2px 1px !important;
            letter-spacing: -0.25px !important;
          }
        }


        /* Tablet view only: final header alignment tweak.
           - Keep No Live Games + Games Today + all nav buttons on the same first row.
           - Make nav buttons taller/wider for readability.
           - Lift countdown/timer onto the FIFA title row.
           - Lift updated/language/view controls so the header lines up better. */
        .wc-app.wc-view-tablet .wc-header {
          position: relative !important;
          display: block !important;
          margin-bottom: 12px !important;
          padding-right: 300px !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row {
          display: grid !important;
          grid-template-columns: max-content max-content minmax(0, 1fr) !important;
          grid-auto-rows: auto !important;
          align-items: center !important;
          justify-content: stretch !important;
          column-gap: 4px !important;
          row-gap: 5px !important;
          width: 100% !important;
          overflow: visible !important;
          text-align: left !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill {
          grid-row: 1 !important;
          min-height: 16px !important;
          height: 16px !important;
          padding: 2px 6px !important;
          border-radius: 999px !important;
          font-size: 7px !important;
          line-height: 1 !important;
          letter-spacing: 0 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex !important;
          grid-column: 3 !important;
          grid-row: 1 !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          gap: 3px !important;
          align-items: center !important;
          justify-content: stretch !important;
          overflow: hidden !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 1 1 0 !important;
          min-width: 36px !important;
          max-width: none !important;
          min-height: 20px !important;
          height: 20px !important;
          padding: 4px 5px !important;
          border-radius: 999px !important;
          font-size: 7px !important;
          line-height: 1 !important;
          letter-spacing: -0.1px !important;
          font-weight: 850 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          grid-column: 1 / 2 !important;
          grid-row: 2 !important;
          width: auto !important;
          min-width: 220px !important;
          margin-top: 0 !important;
          align-self: center !important;
        }

        .wc-app.wc-view-tablet .wc-title {
          font-size: 28px !important;
          line-height: 1.05 !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .wc-header-subtitle-inline {
          font-size: 10px !important;
          line-height: 1.1 !important;
          text-align: left !important;
          margin-top: 2px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 260px !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          grid-column: 2 / 4 !important;
          grid-row: 2 !important;
          justify-self: center !important;
          align-self: center !important;
          width: fit-content !important;
          max-width: 100% !important;
          min-width: 0 !important;
          min-height: 30px !important;
          height: 30px !important;
          margin: 0 !important;
          padding: 3px 10px !important;
          font-size: clamp(18px, 2.4vw, 26px) !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .wc-header-controls {
          position: absolute !important;
          right: 0 !important;
          top: 25px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 5px !important;
          margin: 0 !important;
          z-index: 20 !important;
        }

        .wc-app.wc-view-tablet .wc-language-select,
        .wc-app.wc-view-tablet .wc-view-select,
        .wc-app.wc-view-tablet .wc-updated-pill,
        .wc-app.wc-view-tablet .wc-header-controls .wc-back-button {
          min-height: 26px !important;
          height: 26px !important;
          padding: 3px 8px !important;
          font-size: 10px !important;
          border-radius: 999px !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header {
            padding-right: 245px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav {
            gap: 2px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            min-width: 30px !important;
            min-height: 18px !important;
            height: 18px !important;
            padding: 3px 3px !important;
            font-size: 6px !important;
            letter-spacing: -0.2px !important;
          }

          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill {
            font-size: 6px !important;
            min-height: 15px !important;
            height: 15px !important;
            padding: 2px 4px !important;
          }

          .wc-app.wc-view-tablet .wc-title {
            font-size: 22px !important;
          }

          .wc-app.wc-view-tablet .wc-title-stack {
            min-width: 170px !important;
          }

          .wc-app.wc-view-tablet .wc-header-subtitle-inline {
            max-width: 190px !important;
            font-size: 9px !important;
          }

          .wc-app.wc-view-tablet .wc-header-countdown-pill {
            font-size: clamp(15px, 2.4vw, 20px) !important;
            height: 26px !important;
            min-height: 26px !important;
            padding: 2px 7px !important;
          }

          .wc-app.wc-view-tablet .wc-header-controls {
            top: 23px !important;
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .wc-language-select,
          .wc-app.wc-view-tablet .wc-view-select,
          .wc-app.wc-view-tablet .wc-updated-pill,
          .wc-app.wc-view-tablet .wc-header-controls .wc-back-button {
            min-height: 23px !important;
            height: 23px !important;
            padding: 2px 5px !important;
            font-size: 8px !important;
          }
        }


        /* Tablet view only: compact progress/stat section into one small row */
        .wc-app.wc-view-tablet .overview-hero.compact-overview-hero,
        .wc-app.wc-view-tablet .overview-hero {
          padding: 7px 9px 8px !important;
          margin-bottom: 7px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap {
          gap: 4px !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top {
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top span {
          font-size: 9px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top strong {
          font-size: 13px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar {
          height: 6px !important;
          min-height: 6px !important;
          margin: 2px 0 3px !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar > div,
        .wc-app.wc-view-tablet .overview-progress-bar div {
          height: 6px !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
          display: grid !important;
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          gap: 4px !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
          min-width: 0 !important;
          min-height: 34px !important;
          height: 34px !important;
          padding: 3px 4px !important;
          border-radius: 8px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 1px !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          font-size: 6.5px !important;
          line-height: 1 !important;
          max-width: 100% !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
          font-size: 14px !important;
          line-height: 1 !important;
          max-width: 100% !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
            height: 31px !important;
            min-height: 31px !important;
            padding: 2px 3px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
            font-size: 12px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
            font-size: 5.8px !important;
          }
        }


        /* Tablet view only: short progress bar with stat tiles using the free space on the same line */
        .wc-app.wc-view-tablet .overview-progress-wrap {
          display: grid !important;
          grid-template-columns: 20% minmax(0, 1fr) !important;
          grid-template-rows: auto auto !important;
          grid-template-areas:
            "progressTop stats"
            "progressBar stats" !important;
          column-gap: 7px !important;
          row-gap: 2px !important;
          align-items: center !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top {
          grid-area: progressTop !important;
          min-width: 0 !important;
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 4px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top span {
          font-size: 7px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top strong {
          font-size: 10px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar {
          grid-area: progressBar !important;
          width: 100% !important;
          max-width: 100% !important;
          height: 5px !important;
          min-height: 5px !important;
          margin: 0 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar > div,
        .wc-app.wc-view-tablet .overview-progress-bar div {
          height: 5px !important;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
          grid-area: stats !important;
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 4px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          align-self: stretch !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
          min-height: 27px !important;
          height: 27px !important;
          padding: 2px 4px !important;
          border-radius: 7px !important;
          gap: 0 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
          font-size: 11px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          font-size: 5.6px !important;
          line-height: 1 !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .overview-progress-wrap {
            grid-template-columns: 20% minmax(0, 1fr) !important;
            column-gap: 5px !important;
          }

          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
            height: 24px !important;
            min-height: 24px !important;
            padding: 2px 3px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
            font-size: 10px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
            font-size: 5px !important;
          }
        }



        /* Tablet view only: Progress bar + all 6 overview stats on ONE line */
        .wc-app.wc-view-tablet .overview-progress-wrap {
          display: grid !important;
          grid-template-columns: 18% minmax(0, 82%) !important;
          grid-template-rows: auto auto !important;
          grid-template-areas:
            "progressTop stats"
            "progressBar stats" !important;
          column-gap: 6px !important;
          row-gap: 1px !important;
          align-items: center !important;
          padding: 6px 8px !important;
          margin: 4px 0 6px 0 !important;
          min-height: 42px !important;
          max-height: 48px !important;
          overflow: hidden !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top {
          grid-area: progressTop !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          min-width: 0 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top span {
          font-size: 6px !important;
          line-height: 1 !important;
          letter-spacing: .08em !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top strong {
          font-size: 7px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar {
          grid-area: progressBar !important;
          width: 100% !important;
          max-width: 100% !important;
          height: 4px !important;
          min-height: 4px !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar > div,
        .wc-app.wc-view-tablet .overview-progress-bar div {
          height: 4px !important;
          min-height: 4px !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
          grid-area: stats !important;
          display: grid !important;
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          grid-auto-rows: 1fr !important;
          gap: 4px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          align-self: stretch !important;
          min-width: 0 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
          height: 34px !important;
          min-height: 34px !important;
          max-height: 34px !important;
          padding: 3px 3px !important;
          border-radius: 7px !important;
          gap: 1px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
          font-size: 15px !important;
          line-height: .92 !important;
          margin: 0 !important;
          padding: 0 !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          font-size: 5.4px !important;
          line-height: 1 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          margin: 0 !important;
          padding: 0 !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .overview-progress-wrap {
            grid-template-columns: 16% minmax(0, 84%) !important;
            column-gap: 4px !important;
            padding: 5px 6px !important;
          }

          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
            height: 31px !important;
            min-height: 31px !important;
            max-height: 31px !important;
            padding: 2px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
            font-size: 13px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
            font-size: 4.8px !important;
          }
        }
      

        /* Tablet view only: move time/language/view/back into the compact progress bar and make stat numbers smaller */
        .wc-tablet-progress-controls {
          display: none;
        }

        .wc-app.wc-view-tablet .wc-header-controls {
          display: none !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap {
          grid-template-columns: 13% minmax(0, 58%) 29% !important;
          grid-template-rows: auto auto !important;
          grid-template-areas:
            "progressTop stats controls"
            "progressBar stats controls" !important;
          min-height: 38px !important;
          max-height: 42px !important;
          padding: 4px 7px !important;
          column-gap: 5px !important;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          gap: 3px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
          height: 28px !important;
          min-height: 28px !important;
          max-height: 28px !important;
          padding: 2px !important;
          border-radius: 6px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
          font-size: 10px !important;
          line-height: .95 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          font-size: 4.2px !important;
          line-height: .95 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls {
          grid-area: controls !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 3px !important;
          min-width: 0 !important;
          width: 100% !important;
          height: 28px !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-updated-pill,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
          height: 22px !important;
          min-height: 22px !important;
          padding: 2px 5px !important;
          border-radius: 999px !important;
          font-size: 7px !important;
          line-height: 1 !important;
          flex: 0 1 auto !important;
          min-width: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-tablet-progress-time {
          width: 52px !important;
          text-align: center !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select {
          width: 76px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select {
          width: 76px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
          width: 46px !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .overview-progress-wrap {
            grid-template-columns: 12% minmax(0, 55%) 33% !important;
            padding: 4px 5px !important;
            column-gap: 3px !important;
          }

          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
            gap: 2px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
            height: 25px !important;
            min-height: 25px !important;
            max-height: 25px !important;
          }

          .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
          .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
            font-size: 9px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-controls {
            gap: 2px !important;
            height: 25px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-updated-pill,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
            height: 20px !important;
            min-height: 20px !important;
            padding: 1px 3px !important;
            font-size: 6px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-tablet-progress-time {
            width: 45px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select {
            width: 58px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
            width: 36px !important;
          }
        }

        /* Tablet view only v2: use full top row, keep status pills small, and put controls into compact progress/stats bar */
        .wc-app.wc-view-tablet .wc-header-title-row {
          flex-wrap: nowrap !important;
          align-items: center !important;
          gap: 4px !important;
          width: 100% !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-header-live-pill,
        .wc-app.wc-view-tablet .wc-header-scheduled-pill {
          flex: 0 0 auto !important;
          min-height: 16px !important;
          height: 16px !important;
          padding: 2px 6px !important;
          font-size: 7.5px !important;
          line-height: 1 !important;
          max-width: none !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex !important;
          flex: 1 1 auto !important;
          min-width: 0 !important;
          width: auto !important;
          gap: 4px !important;
          overflow: hidden !important;
          align-items: center !important;
          justify-content: stretch !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 1 1 0 !important;
          min-width: 0 !important;
          height: 18px !important;
          min-height: 18px !important;
          padding: 3px 5px !important;
          font-size: 7.6px !important;
          line-height: 1 !important;
          border-radius: 999px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack,
        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          flex: 0 0 auto !important;
          width: auto !important;
          margin-top: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          min-width: 112px !important;
          max-width: 190px !important;
        }

        .wc-app.wc-view-tablet .wc-title {
          font-size: 13px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .wc-header-subtitle-inline {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          min-width: 72px !important;
          max-width: 96px !important;
          min-height: 18px !important;
          height: 18px !important;
          padding: 0 4px !important;
          font-size: 11px !important;
          letter-spacing: 0 !important;
          justify-content: center !important;
        }

        .wc-app.wc-view-tablet .wc-header-controls {
          display: none !important;
        }

        .wc-tablet-progress-controls {
          display: none;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap {
          display: grid !important;
          grid-template-columns: 13% minmax(0, 43%) minmax(270px, 44%) !important;
          grid-template-rows: 14px 12px !important;
          grid-template-areas:
            "progressTop stats controls"
            "progressBar stats controls" !important;
          align-items: center !important;
          width: 100% !important;
          max-width: none !important;
          min-height: 32px !important;
          max-height: 34px !important;
          margin-top: 5px !important;
          padding: 3px 6px !important;
          column-gap: 5px !important;
          border-radius: 12px !important;
          background: rgba(255,255,255,0.055) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top {
          grid-area: progressTop !important;
          height: 12px !important;
          min-height: 0 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 2px !important;
          font-size: 6px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-top span,
        .wc-app.wc-view-tablet .overview-progress-top strong {
          font-size: 6px !important;
          line-height: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar {
          grid-area: progressBar !important;
          height: 5px !important;
          min-height: 5px !important;
          margin: 0 !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-progress-bar > div,
        .wc-app.wc-view-tablet .overview-progress-bar div {
          height: 5px !important;
          min-height: 5px !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress {
          grid-area: stats !important;
          display: grid !important;
          grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          gap: 2px !important;
          margin: 0 !important;
          min-width: 0 !important;
          height: 26px !important;
          align-items: stretch !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile {
          height: 26px !important;
          min-height: 26px !important;
          max-height: 26px !important;
          padding: 1px 2px !important;
          border-radius: 6px !important;
          justify-content: center !important;
          gap: 0 !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile strong,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile strong {
          font-size: 9px !important;
          line-height: .9 !important;
          margin: 0 !important;
          order: 1 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          font-size: 3.8px !important;
          line-height: .9 !important;
          margin: 0 !important;
          opacity: 0.72 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile span,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile span {
          order: 2 !important;
        }

        .wc-app.wc-view-tablet .overview-progress-wrap .overview-stat-tile em,
        .wc-app.wc-view-tablet .overview-stat-grid.overview-stat-grid-in-progress .overview-stat-tile em {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls {
          grid-area: controls !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 4px !important;
          width: 100% !important;
          min-width: 0 !important;
          height: 26px !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-updated-pill,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select,
        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
          height: 22px !important;
          min-height: 22px !important;
          padding: 2px 6px !important;
          border-radius: 999px !important;
          font-size: 7px !important;
          line-height: 1 !important;
          flex: 0 1 auto !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-tablet-progress-time {
          width: 62px !important;
          text-align: center !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select {
          width: 88px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select {
          width: 50px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
          width: 50px !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            font-size: 6.4px !important;
            padding: 2px 3px !important;
          }
          .wc-app.wc-view-tablet .overview-progress-wrap {
            grid-template-columns: 11% minmax(0, 40%) minmax(225px, 49%) !important;
            column-gap: 3px !important;
            padding: 3px 4px !important;
          }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls {
            gap: 2px !important;
          }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-updated-pill,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select,
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button {
            font-size: 6px !important;
            padding: 1px 3px !important;
            height: 20px !important;
            min-height: 20px !important;
          }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-tablet-progress-time { width: 48px !important; }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-language-select { width: 62px !important; }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-view-select { width: 62px !important; }
          .wc-app.wc-view-tablet .wc-tablet-progress-controls .wc-back-button { width: 35px !important; }
        }



        /* Tablet only: make the two top status pills identical size without moving the layout */
        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill,
        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
          flex: 0 0 70px !important;
          width: 70px !important;
          min-width: 70px !important;
          max-width: 70px !important;
          height: 16px !important;
          min-height: 16px !important;
          padding: 2px 4px !important;
          box-sizing: border-box !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 7px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill,
          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
            flex-basis: 64px !important;
            width: 64px !important;
            min-width: 64px !important;
            max-width: 64px !important;
            height: 15px !important;
            min-height: 15px !important;
            font-size: 6.2px !important;
            padding: 2px 3px !important;
          }
        }


        /* FINAL GAP FIX: keep the two top-left status pills locked together */
        .wc-app.wc-view-tablet .wc-header-title-row {
          display: grid !important;
          grid-template-columns: 72px 72px minmax(0, 1fr) !important;
          grid-template-rows: auto auto auto !important;
          column-gap: 2px !important;
          row-gap: 3px !important;
          align-items: center !important;
          justify-content: start !important;
          width: 100% !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill:not(.wc-header-scheduled-pill) {
          grid-column: 1 !important;
          grid-row: 1 !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
          grid-column: 2 !important;
          grid-row: 1 !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill,
        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
          flex: none !important;
          width: 72px !important;
          min-width: 72px !important;
          max-width: 72px !important;
          height: 15px !important;
          min-height: 15px !important;
          padding: 1px 3px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 6.4px !important;
          line-height: 1 !important;
          letter-spacing: -0.15px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          grid-column: 3 !important;
          grid-row: 1 !important;
          margin-left: 2px !important;
          gap: 3px !important;
          min-width: 0 !important;
          width: 100% !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          grid-column: 1 / -1 !important;
          grid-row: 2 !important;
          margin-top: 3px !important;
          width: 100% !important;
          max-width: none !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          grid-column: 1 / -1 !important;
          grid-row: 3 !important;
          justify-self: start !important;
          margin-top: 0 !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row {
            grid-template-columns: 68px 68px minmax(0, 1fr) !important;
            column-gap: 2px !important;
          }
          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill,
          .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
            width: 68px !important;
            min-width: 68px !important;
            max-width: 68px !important;
            font-size: 6px !important;
          }
        }


        /* FINAL TITLE/TIMER FIX: keep the working status pills untouched, move FIFA title onto the top row, and centre the timer */
        .wc-app.wc-view-tablet .wc-header-title-row {
          display: grid !important;
          grid-template-columns: 72px 72px minmax(0, 1fr) auto !important;
          grid-template-rows: auto auto !important;
          column-gap: 2px !important;
          row-gap: 4px !important;
          align-items: center !important;
          width: 100% !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-live-pill:not(.wc-header-scheduled-pill) {
          grid-column: 1 !important;
          grid-row: 1 !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-scheduled-pill {
          grid-column: 2 !important;
          grid-row: 1 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          grid-column: 3 !important;
          grid-row: 1 !important;
          margin-left: 2px !important;
          margin-right: 6px !important;
          gap: 3px !important;
          min-width: 0 !important;
          width: 100% !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          grid-column: 4 !important;
          grid-row: 1 !important;
          justify-self: end !important;
          align-self: center !important;
          width: auto !important;
          min-width: 120px !important;
          max-width: 190px !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: right !important;
        }

        .wc-app.wc-view-tablet .wc-title {
          font-size: 12px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wc-app.wc-view-tablet .wc-header-subtitle-inline {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          grid-column: 1 / -1 !important;
          grid-row: 2 !important;
          justify-self: center !important;
          margin: 2px auto 0 auto !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row {
            grid-template-columns: 68px 68px minmax(0, 1fr) auto !important;
            column-gap: 2px !important;
          }

          .wc-app.wc-view-tablet .wc-title-stack {
            min-width: 102px !important;
            max-width: 145px !important;
          }

          .wc-app.wc-view-tablet .wc-title {
            font-size: 10px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav {
            margin-right: 4px !important;
          }
        }


        /* Tablet only: swap FIFA title with the update/language/view/back controls.
           Controls now sit top-right on the same line as the nav/supporters buttons.
           The FIFA title moves into the old control space inside the overview bar. */
        .wc-tablet-top-controls {
          display: none;
        }

        .wc-app.wc-view-tablet .wc-header-title-row {
          grid-template-columns: 72px 72px minmax(0, 1fr) max-content !important;
          grid-template-rows: auto auto !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls {
          display: flex !important;
          grid-column: 4 !important;
          grid-row: 1 !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 4px !important;
          min-width: 0 !important;
          width: max-content !important;
          max-width: max-content !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-updated-pill,
        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-language-select,
        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-view-select,
        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-sidebar-select,
        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-back-button {
          height: 20px !important;
          min-height: 20px !important;
          padding: 2px 5px !important;
          border-radius: 999px !important;
          font-size: 7px !important;
          line-height: 1 !important;
          box-sizing: border-box !important;
          white-space: nowrap !important;
          min-width: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-tablet-top-time {
          width: 60px !important;
          text-align: center !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-language-select {
          width: 50px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-view-select {
          width: 50px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-sidebar-select {
          width: 50px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-back-button {
          width: 50px !important;
        }

        .wc-app.wc-view-tablet .wc-title-stack {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-title {
          grid-area: controls !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          justify-content: center !important;
          gap: 1px !important;
          height: 26px !important;
          min-width: 0 !important;
          width: 100% !important;
          overflow: hidden !important;
          text-align: right !important;
        }

        .wc-app.wc-view-tablet .wc-progress-title-main {
          font-size: 13px !important;
          line-height: 1 !important;
          font-weight: 900 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }

        .wc-app.wc-view-tablet .wc-progress-title-sub {
          font-size: 6px !important;
          line-height: 1 !important;
          opacity: 0.65 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }

        .wc-app.wc-view-tablet .wc-header-countdown-pill {
          grid-column: 1 / -1 !important;
          grid-row: 2 !important;
          justify-self: center !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row {
            grid-template-columns: 68px 68px minmax(0, 1fr) max-content !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-top-controls {
            gap: 2px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-updated-pill,
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-language-select,
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-view-select,
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-sidebar-select,
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-back-button {
            height: 18px !important;
            min-height: 18px !important;
            padding: 1px 3px !important;
            font-size: 6px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-tablet-top-time { width: 48px !important; }
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-language-select { width: 34px !important; }
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-view-select { width: 34px !important; }
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-sidebar-select { width: 34px !important; }
          .wc-app.wc-view-tablet .wc-tablet-top-controls .wc-back-button { width: 34px !important; }

          .wc-app.wc-view-tablet .wc-progress-title-main {
            font-size: 10px !important;
          }
        }


        /* Tablet only: move countdown between the Top scorer stat and FIFA title in the compact overview bar */
        .wc-tablet-progress-countdown {
          display: none;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-countdown-pill:not(.wc-tablet-progress-countdown) {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-title {
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 6px !important;
          text-align: right !important;
        }

        .wc-app.wc-view-tablet .wc-progress-title-text {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
          justify-content: center !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-progress-title .wc-tablet-progress-countdown {
          display: inline-flex !important;
          position: static !important;
          grid-column: auto !important;
          grid-row: auto !important;
          justify-self: auto !important;
          align-self: center !important;
          flex: 0 0 auto !important;
          width: auto !important;
          min-width: 50px !important;
          max-width: 132px !important;
          height: 28px !important;
          min-height: 28px !important;
          margin: 0 clamp(18px, 3.4vw, 42px) 0 0 !important;
          padding: 3px 10px !important;
          font-size: 13px !important;
          line-height: 1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-tablet-progress-title {
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-progress-title .wc-tablet-progress-countdown {
            min-width: 66px !important;
            max-width: 96px !important;
            height: 23px !important;
            min-height: 23px !important;
            margin: 0 14px 0 0 !important;
            padding: 2px 7px !important;
            font-size: 10px !important;
          }
        }



        /* Tablet only: enlarge the top overview navigation buttons and let them use the spare bar space */
        .wc-app.wc-view-tablet .wc-header-title-row {
          grid-template-columns: 72px 72px minmax(0, 1fr) max-content !important;
          align-items: center !important;
          column-gap: 4px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex !important;
          flex: 1 1 auto !important;
          width: 100% !important;
          max-width: none !important;
          gap: 4px !important;
          justify-content: stretch !important;
          align-items: center !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 1 1 0 !important;
          height: 34px !important;
          min-height: 34px !important;
          padding: 7px 8px !important;
          font-size: 11px !important;
          line-height: 1 !important;
          border-radius: 999px !important;
          letter-spacing: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls {
          justify-self: end !important;
          margin-left: 4px !important;
        }


        .live-premium-lower-grid .match-officials-box {
          grid-column: span 1;
        }

        .live-weather-compact-card {
          grid-column: span 2;
          padding: 13px 15px !important;
          align-self: stretch;
          min-height: 0;
        }

        .live-weather-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .live-weather-head .live-premium-card-title {
          margin-bottom: 3px;
          color: #fde68a;
        }

        .live-weather-head small {
          color: rgba(226,232,240,.72);
          font-weight: 800;
        }

        .live-weather-temp {
          flex: 0 0 auto;
          padding: 7px 13px;
          border-radius: 999px;
          font-size: 1.18rem;
          line-height: 1;
          color: #fff7ed;
          background: linear-gradient(135deg, rgba(251,191,36,.32), rgba(14,165,233,.18));
          border: 1px solid rgba(251,191,36,.32);
          box-shadow: 0 0 18px rgba(251,191,36,.15);
        }

        .live-weather-main {
          display: grid;
          grid-template-columns: minmax(150px, .8fr) minmax(260px, 1.6fr);
          gap: 12px;
          align-items: center;
        }

        .live-weather-condition {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .live-weather-condition span {
          font-size: 1.75rem;
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(251,191,36,.22));
        }

        .live-weather-condition strong {
          min-width: 0;
          color: rgba(255,255,255,.92);
          font-size: .95rem;
          font-weight: 1000;
          text-transform: capitalize;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .live-weather-metric {
          min-width: 0;
          padding: 8px 9px;
          border-radius: 14px;
          text-align: center;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.10);
        }

        .live-weather-metric strong {
          display: block;
          color: rgba(255,255,255,.94);
          font-size: .82rem;
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .live-weather-metric span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.60);
          font-size: .62rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        @media (max-width: 1100px) {
          .live-premium-lower-grid {
            grid-template-columns: 1fr 1fr;
          }

          .live-premium-stats-card,
          .live-weather-compact-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .wc-app.wc-view-tablet .wc-header-title-row {
            grid-template-columns: 62px 62px minmax(0, 1fr) max-content !important;
            column-gap: 3px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav {
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            height: 28px !important;
            min-height: 28px !important;
            padding: 5px 5px !important;
            font-size: 8.8px !important;
          }
        }




        .wc-football-match-clock-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          margin-top: 3px;
        }

        .wc-football-match-clock-label {
          font-size: 9px;
          line-height: 1;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.82);
          text-shadow: 0 2px 8px rgba(0,0,0,0.75);
        }

        .wc-football-match-clock {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 66px;
          padding: 4px 9px;
          border-radius: 8px;
          font-size: 18px;
          line-height: 1;
          font-weight: 1000;
          letter-spacing: 0.04em;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.52);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: 0 0 14px rgba(255,255,255,0.16), inset 0 0 0 1px rgba(255,255,255,0.12);
          font-variant-numeric: tabular-nums;
          text-shadow: 0 2px 8px rgba(0,0,0,0.9);
        }

        .wc-football-match-clock-wrap-live .wc-football-match-clock-label {
          color: #ffffff;
          animation: wc-live-label-pulse 3.8s ease-in-out infinite;
        }

        .wc-football-match-clock-wrap-live .wc-football-match-clock {
          position: relative;
          border: 2px solid rgba(120, 255, 175, 0.62);
          background: rgba(7, 10, 24, 0.82);
          color: #ffffff;
          animation: wc-live-clock-glow 3.8s ease-in-out infinite;
          box-shadow:
            0 0 6px rgba(255,255,255,0.22),
            0 0 14px rgba(0,255,120,0.34),
            0 0 24px rgba(0,190,80,0.22),
            inset 0 0 6px rgba(255,255,255,0.12);
        }

        .wc-football-match-clock-wrap-live .wc-football-match-clock::before {
          content: "";
          position: absolute;
          inset: -7px;
          border-radius: 12px;
          border: 1px solid rgba(0, 255, 120, 0.34);
          opacity: 0.35;
          pointer-events: none;
          animation: wc-live-clock-ring 3.8s ease-in-out infinite;
        }

        @keyframes wc-live-clock-glow {
          0%, 100% {
            transform: scale(1);
            background: rgba(7, 10, 24, 0.82);
            text-shadow: 0 2px 8px rgba(0,0,0,0.9), 0 0 8px rgba(0,255,120,0.30);
            box-shadow:
              0 0 6px rgba(255,255,255,0.18),
              0 0 12px rgba(0,255,120,0.26),
              0 0 22px rgba(0,190,80,0.18),
              inset 0 0 6px rgba(255,255,255,0.10);
          }
          50% {
            transform: scale(1.025);
            background: rgba(0, 58, 28, 0.86);
            text-shadow: 0 2px 8px rgba(0,0,0,0.85), 0 0 12px rgba(0,255,130,0.48);
            box-shadow:
              0 0 8px rgba(255,255,255,0.26),
              0 0 18px rgba(0,255,120,0.46),
              0 0 32px rgba(0,210,85,0.34),
              inset 0 0 9px rgba(255,255,255,0.16);
          }
        }

        @keyframes wc-live-clock-ring {
          0%, 100% {
            transform: scale(0.98);
            opacity: 0.18;
            box-shadow: 0 0 8px rgba(0,255,120,0.20);
          }
          50% {
            transform: scale(1.035);
            opacity: 0.46;
            box-shadow: 0 0 16px rgba(0,255,120,0.38), 0 0 28px rgba(0,190,80,0.24);
          }
        }

        @keyframes wc-live-label-pulse {
          0%, 100% {
            opacity: 0.78;
            text-shadow: 0 2px 8px rgba(0,0,0,0.75);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 8px rgba(255,255,255,0.46), 0 0 16px rgba(0,255,120,0.38);
          }
        }

        /* Tablet readability fix: use the empty top-right space so the header nav labels stay readable. */
        .wc-app.wc-view-tablet .wc-header {
          padding-right: 0 !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row {
          display: grid !important;
          grid-template-columns: auto auto minmax(0, 1fr) max-content !important;
          column-gap: 5px !important;
          row-gap: 0 !important;
          align-items: center !important;
          width: 100% !important;
        }

        .wc-app.wc-view-tablet .wc-header-title-row > .wc-title-stack,
        .wc-app.wc-view-tablet .wc-header-title-row > .wc-header-countdown-pill {
          display: none !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          display: flex !important;
          flex-wrap: nowrap !important;
          justify-content: flex-start !important;
          align-items: center !important;
          gap: 4px !important;
          min-width: 0 !important;
          width: 100% !important;
          overflow: visible !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex: 0 0 auto !important;
          width: auto !important;
          min-width: max-content !important;
          max-width: none !important;
          height: 24px !important;
          min-height: 24px !important;
          padding: 5px 8px !important;
          font-size: 9px !important;
          line-height: 1 !important;
          letter-spacing: 0 !important;
          white-space: nowrap !important;
          overflow: visible !important;
          text-overflow: clip !important;
          border-radius: 999px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-top-controls {
          justify-self: end !important;
          margin-left: 4px !important;
          flex: 0 0 auto !important;
        }

        @media (min-width: 1000px) {
          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            font-size: 9.5px !important;
            padding: 5px 9px !important;
          }
        }

        @media (max-width: 900px) {
          .wc-app.wc-view-tablet .wc-tablet-header-nav {
            gap: 3px !important;
          }

          .wc-app.wc-view-tablet .wc-tablet-header-nav button {
            font-size: 8px !important;
            padding: 4px 6px !important;
            height: 22px !important;
            min-height: 22px !important;
          }
        }

        /* Tablet view only: make Groups page fit better on screen */
        .wc-app.wc-view-tablet .wc-groups-grid {
          gap: 9px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card {
          padding: 11px 11px 10px !important;
          border-radius: 14px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .wc-section-title {
          font-size: 16.6px !important;
          line-height: 1 !important;
          margin: 0 0 7px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .wc-table {
          font-size: 10.9px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .wc-table th,
        .wc-app.wc-view-tablet .wc-group-card .wc-table td {
          padding: 3px 2.2px !important;
          line-height: 1.18 !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .wc-table th {
          font-size: 9px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .group-team-cell {
          gap: 4px !important;
        }

        .wc-app.wc-view-tablet .wc-group-card .group-flag-img,
        .wc-app.wc-view-tablet .wc-group-card .group-flag-missing {
          width: 20px !important;
          height: 14px !important;
          font-size: 9px !important;
        }


        /* Safe knockout layout: 16 -> 8 -> 4 -> 2 -> Final -> Winner */
        .wc-knockout-web {
          grid-template-columns:
            minmax(230px, 1.25fr)
            minmax(190px, 1fr)
            minmax(175px, 0.95fr)
            minmax(165px, 0.88fr)
            minmax(155px, 0.82fr)
            minmax(145px, 0.76fr) !important;
          gap: 10px !important;
          align-items: start !important;
          overflow-x: auto !important;
          padding-bottom: 10px;
        }

        .wc-knockout-web .wc-web-round {
          justify-content: flex-start !important;
          gap: 8px !important;
        }

        .wc-knockout-web .wc-web-round:nth-child(2) {
          padding-top: 34px;
        }

        .wc-knockout-web .wc-web-round:nth-child(3) {
          padding-top: 92px;
        }

        .wc-knockout-web .wc-web-round:nth-child(4) {
          padding-top: 180px;
        }

        .wc-knockout-web .wc-web-round:nth-child(5),
        .wc-knockout-web .wc-web-round:nth-child(6) {
          padding-top: 300px;
        }

        .wc-web-winner-card {
          border-color: rgba(255,215,90,0.55) !important;
          background:
            radial-gradient(circle at top left, rgba(255,215,90,0.22), transparent 45%),
            linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045)) !important;
        }

        .wc-web-winner-team {
          justify-content: center;
          font-size: 13px !important;
        }

        .wc-winner-trophy {
          font-size: 20px;
          line-height: 1;
        }

        .wc-bracket {
          grid-template-columns:
            minmax(178px, 1.18fr)
            repeat(4, minmax(145px, 1fr)) !important;
          gap: 10px !important;
          overflow-x: auto !important;
        }

        @media (max-width: 1400px) {
          .wc-knockout-web {
            grid-template-columns:
              minmax(220px, 1.2fr)
              minmax(178px, 0.98fr)
              minmax(165px, 0.9fr)
              minmax(155px, 0.84fr)
              minmax(145px, 0.78fr)
              minmax(135px, 0.72fr) !important;
            gap: 8px !important;
          }

          .wc-knockout-web .wc-web-round:nth-child(2) {
            padding-top: 30px;
          }

          .wc-knockout-web .wc-web-round:nth-child(3) {
            padding-top: 82px;
          }

          .wc-knockout-web .wc-web-round:nth-child(4) {
            padding-top: 158px;
          }

          .wc-knockout-web .wc-web-round:nth-child(5),
          .wc-knockout-web .wc-web-round:nth-child(6) {
            padding-top: 260px;
          }
        }


      .wc-premium-explainer,
      .wc-premium-explainer p,
      .wc-premium-explainer .wc-muted,
      .wc-premium-explainer .wc-section-title {
        text-align: center !important;
      }
      .wc-premium-explainer {
        max-width: 900px;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      /* Tablet view: keep the same top nav design, but let it wrap instead of overlapping. */
      .wc-app.wc-view-tablet .wc-header-title-row {
        align-items: start !important;
      }

      .wc-app.wc-view-tablet .wc-tablet-header-nav {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: stretch !important;
        align-content: start !important;
        justify-content: flex-start !important;
        gap: 4px !important;
        overflow: visible !important;
        min-height: 44px !important;
        height: auto !important;
      }

      .wc-app.wc-view-tablet .wc-tablet-header-nav button {
        flex: 1 1 calc(16.666% - 4px) !important;
        min-width: 64px !important;
        max-width: none !important;
        min-height: 20px !important;
        height: 20px !important;
        padding: 4px 6px !important;
        font-size: 7px !important;
        line-height: 1 !important;
        letter-spacing: 0 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      @media (max-width: 760px) {
        .wc-app.wc-view-tablet .wc-tablet-header-nav {
          gap: 3px !important;
          min-height: 63px !important;
        }

        .wc-app.wc-view-tablet .wc-tablet-header-nav button {
          flex-basis: calc(25% - 3px) !important;
          min-width: 58px !important;
          min-height: 18px !important;
          height: 18px !important;
          padding: 3px 4px !important;
          font-size: 6px !important;
        }
      }

      /* Mobile view: same theme, phone-first spacing and controls. */
      .wc-app.wc-view-mobile {
        padding: 8px !important;
        font-size: 13px !important;
      }

      .wc-app.wc-view-mobile .wc-shell {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
      }

      .wc-app.wc-view-mobile .wc-header {
        display: grid !important;
        gap: 8px !important;
        padding: 10px !important;
        margin-bottom: 8px !important;
      }

      .wc-app.wc-view-mobile .wc-header-title-row {
        display: grid !important;
        grid-template-columns: 1fr auto !important;
        gap: 6px !important;
        align-items: start !important;
        width: 100% !important;
        overflow: visible !important;
      }

      .wc-app.wc-view-mobile .wc-tablet-header-nav {
        display: none !important;
      }

      .wc-app.wc-view-mobile .wc-title-stack {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        min-width: 0 !important;
      }

      .wc-app.wc-view-mobile .wc-title {
        font-size: 24px !important;
        line-height: 1.05 !important;
        white-space: normal !important;
      }

      .wc-app.wc-view-mobile .wc-header-subtitle-inline {
        max-width: 100% !important;
        font-size: 10px !important;
        line-height: 1.25 !important;
        white-space: normal !important;
      }

      .wc-app.wc-view-mobile .wc-header-live-pill,
      .wc-app.wc-view-mobile .wc-header-scheduled-pill {
        justify-self: start !important;
        max-width: 100% !important;
        min-height: 22px !important;
        padding: 5px 8px !important;
        font-size: 9px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }

      .wc-app.wc-view-mobile .wc-header-countdown-pill {
        grid-column: 1 / -1 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 34px !important;
        height: auto !important;
        margin: 0 !important;
        padding: 7px 10px !important;
        font-size: 18px !important;
        justify-content: center !important;
      }

      .wc-app.wc-view-mobile .wc-header-controls {
        position: static !important;
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 6px !important;
        width: 100% !important;
        margin: 0 !important;
        justify-content: stretch !important;
      }

      .wc-app.wc-view-mobile .wc-tablet-top-controls {
        display: none !important;
      }

      .wc-app.wc-view-mobile .wc-language-wrap,
      .wc-app.wc-view-mobile .wc-view-wrap,
      .wc-app.wc-view-mobile .wc-sidebar-wrap,
      .wc-app.wc-view-mobile .wc-updated-wrap {
        width: 100% !important;
        min-width: 0 !important;
      }

      .wc-app.wc-view-mobile .wc-language-select,
      .wc-app.wc-view-mobile .wc-view-select,
      .wc-app.wc-view-mobile .wc-sidebar-select,
      .wc-app.wc-view-mobile .wc-updated-pill,
      .wc-app.wc-view-mobile .wc-header-controls .wc-back-button {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 34px !important;
        height: 34px !important;
        padding: 7px 8px !important;
        font-size: 11px !important;
      }

      .wc-app.wc-view-mobile .wc-nav {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 5px !important;
        overflow: visible !important;
        margin: 0 0 8px !important;
        padding: 0 !important;
      }

      .wc-app.wc-view-mobile .wc-nav button {
        min-width: 0 !important;
        min-height: 34px !important;
        padding: 6px 4px !important;
        border-radius: 8px !important;
        font-size: 10px !important;
        line-height: 1.05 !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      .wc-app.wc-view-mobile .wc-card,
      .wc-app.wc-view-mobile .wc-section,
      .wc-app.wc-view-mobile .overview-panel,
      .wc-app.wc-view-mobile .overview-donate-card,
      .wc-app.wc-view-mobile .overview-supporters-card {
        padding: 10px !important;
        margin-bottom: 8px !important;
        border-radius: 8px !important;
      }

      .wc-app.wc-view-mobile .wc-section-title {
        font-size: 17px !important;
        line-height: 1.15 !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 7px !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-card {
        min-height: 78px !important;
        padding: 9px 7px !important;
        text-align: center !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-card strong {
        font-size: 24px !important;
        line-height: 1 !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-card span,
      .wc-app.wc-view-mobile .mobile-stats-card em {
        font-size: 10px !important;
        line-height: 1.1 !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-list {
        display: grid !important;
        gap: 6px !important;
        margin-top: 9px !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-row {
        display: grid !important;
        grid-template-columns: 24px minmax(0, 1fr) auto !important;
        gap: 7px !important;
        align-items: center !important;
        padding: 8px !important;
        border-radius: 8px !important;
        background: rgba(255,255,255,0.08) !important;
        border: 1px solid rgba(255,255,255,0.10) !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-row strong {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        font-size: 11px !important;
      }

      .wc-app.wc-view-mobile .mobile-stats-row em,
      .wc-app.wc-view-mobile .mobile-stats-row span {
        font-size: 11px !important;
        font-weight: 900 !important;
      }

      .wc-app.wc-view-mobile .overview-main-grid,
      .wc-app.wc-view-mobile .overview-lower-grid,
      .wc-app.wc-view-mobile .overview-supporters-layout,
      .wc-app.wc-view-mobile .wc-grid,
      .wc-app.wc-view-mobile .fixtures-grid,
      .wc-app.wc-view-mobile .results-grid,
      .wc-app.wc-view-mobile .live-grid,
      .wc-app.wc-view-mobile .venues-grid,
      .wc-app.wc-view-mobile .supporters-grid {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }

      .wc-app.wc-view-mobile .overview-stat-grid,
      .wc-app.wc-view-mobile .overview-stat-grid.overview-stat-grid-in-progress {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 6px !important;
      }

      .wc-app.wc-view-mobile .overview-stat-tile,
      .wc-app.wc-view-mobile .overview-progress-wrap .overview-stat-tile {
        min-height: 74px !important;
        padding: 8px 6px !important;
      }

      .wc-app.wc-view-mobile .overview-stat-tile strong,
      .wc-app.wc-view-mobile .overview-progress-wrap .overview-stat-tile strong {
        font-size: 22px !important;
        line-height: 1 !important;
      }

      .wc-app.wc-view-mobile .overview-stat-tile span,
      .wc-app.wc-view-mobile .overview-stat-tile em {
        font-size: 10px !important;
        line-height: 1.1 !important;
      }

      .wc-app.wc-view-mobile .fixture-card,
      .wc-app.wc-view-mobile .wc-bracket-match,
      .wc-app.wc-view-mobile .live-match-card {
        padding: 10px !important;
        border-radius: 8px !important;
      }

      .wc-app.wc-view-mobile .fixture-teams-big,
      .wc-app.wc-view-mobile .live-scoreboard,
      .wc-app.wc-view-mobile .match-scoreboard {
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
        gap: 6px !important;
      }

      .wc-app.wc-view-mobile .wc-score {
        font-size: 24px !important;
        line-height: 1 !important;
      }

      .wc-app.wc-view-mobile .team-name,
      .wc-app.wc-view-mobile .fixture-team-name,
      .wc-app.wc-view-mobile .wc-team-name {
        font-size: 11px !important;
        line-height: 1.1 !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      .wc-app.wc-view-mobile .wc-table-wrap,
      .wc-app.wc-view-mobile .golden-table-wrap,
      .wc-app.wc-view-mobile .wc-bracket,
      .wc-app.wc-view-mobile .wc-knockout-spider {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }

      .wc-app.wc-view-mobile .wc-table {
        min-width: 620px !important;
        font-size: 11px !important;
      }

      .wc-app.wc-view-mobile .wc-table th,
      .wc-app.wc-view-mobile .wc-table td {
        padding: 6px 5px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups,
      .wc-app.wc-view-mobile.wc-page-groups .wc-shell,
      .wc-app.wc-view-mobile.wc-page-groups .wc-groups-grid,
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card,
      .wc-app.wc-view-mobile.wc-page-groups .wc-table-wrap {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        overflow-x: hidden !important;
        box-sizing: border-box !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-groups-grid {
        grid-template-columns: 1fr !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card {
        padding: 8px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-section-title {
        font-size: 16px !important;
        margin-bottom: 7px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        table-layout: fixed !important;
        font-size: 8.5px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th,
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td {
        padding: 4px 1px !important;
        line-height: 1.05 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th {
        font-size: 7px !important;
        letter-spacing: 0 !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(1),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(1) {
        width: 6% !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(2),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(2) {
        width: 34% !important;
        padding-left: 2px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(3),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(3),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(4),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(4),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(5),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(5),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(6),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(6),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(7),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(7),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(8),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(8) {
        width: 6% !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(9),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(9),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table th:nth-child(10),
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .wc-table td:nth-child(10) {
        width: 8% !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .group-team-cell {
        gap: 3px !important;
        min-width: 0 !important;
        overflow: hidden !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .group-team-cell strong {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        font-size: 8.5px !important;
      }

      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .group-flag-img,
      .wc-app.wc-view-mobile.wc-page-groups .wc-group-card .group-flag-missing {
        width: 11px !important;
        min-width: 11px !important;
        height: 8px !important;
        font-size: 6px !important;
      }

      .wc-app.wc-view-mobile .wc-knockout-spider {
        min-width: 960px !important;
        min-height: 600px !important;
      }

      .wc-app.wc-view-mobile .wc-web-card {
        overflow-x: auto !important;
      }

      .wc-app.wc-view-mobile img,
      .wc-app.wc-view-mobile .fixture-stadium-image {
        max-width: 100% !important;
        height: auto !important;
      }

      /* Mobile banner fix: stop clipping without turning the ticker into a tall list. */
      .wc-app.wc-view-mobile .overview-premium-strip,
      .wc-app.wc-view-mobile .overview-supporters-card,
      .wc-app.wc-view-mobile .wc-support-donate-card,
      .wc-app.wc-view-mobile .wc-premium-support-info,
      .wc-app.wc-view-mobile .supporters-summary-card {
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .wc-app.wc-view-mobile .overview-premium-strip {
        grid-template-columns: 1fr !important;
        gap: 0 !important;
        min-height: 48px !important;
        padding: 6px 8px !important;
        overflow: hidden !important;
      }

      .wc-app.wc-view-mobile .overview-premium-marquee {
        width: 100% !important;
        overflow: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent) !important;
        -webkit-mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent) !important;
        scrollbar-width: none !important;
      }

      .wc-app.wc-view-mobile .overview-premium-marquee::-webkit-scrollbar {
        display: none !important;
      }

      .wc-app.wc-view-mobile .overview-premium-track {
        animation-name: wc-premium-supporter-scroll !important;
        animation-duration: var(--premium-scroll-seconds, 140s) !important;
        animation-timing-function: linear !important;
        animation-iteration-count: infinite !important;
        animation-delay: var(--premium-scroll-delay, 0s) !important;
        display: inline-flex !important;
        flex-wrap: nowrap !important;
        width: max-content !important;
        min-width: 100% !important;
        white-space: nowrap !important;
      }

      .wc-app.wc-view-mobile .overview-premium-strip:hover .overview-premium-track,
      .wc-app.wc-view-mobile .overview-premium-strip:active .overview-premium-track {
        animation-play-state: paused !important;
      }

      .wc-app.wc-view-mobile .premium-ticker-card {
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        justify-content: flex-start !important;
        white-space: nowrap !important;
        height: auto !important;
        min-height: 32px !important;
        border-radius: 999px !important;
        flex: 0 0 auto !important;
      }

      .wc-app.wc-view-mobile .premium-ticker-card small {
        display: inline !important;
        white-space: nowrap !important;
        overflow-wrap: normal !important;
      }

      .wc-app.wc-view-mobile .premium-ticker-name {
        max-width: none !important;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: nowrap !important;
        overflow-wrap: normal !important;
      }

      .wc-app.wc-view-mobile .overview-supporter-pill strong,
      .wc-app.wc-view-mobile .overview-supporter-pill span,
      .wc-app.wc-view-mobile .supporter-card-name span {
        max-width: 100% !important;
        overflow: visible !important;
        text-overflow: clip !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      .wc-app.wc-view-mobile .overview-supporters-list,
      .wc-app.wc-view-mobile .supporters-feature-grid,
      .wc-app.wc-view-mobile .supporters-summary-grid {
        grid-template-columns: 1fr !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .wc-app.wc-view-mobile .overview-supporter-pill {
        align-items: flex-start !important;
        border-radius: 12px !important;
        height: auto !important;
        min-height: 0 !important;
      }

      .wc-app.wc-view-mobile .supporter-country-grid span,
      .wc-app.wc-view-mobile .overview-country-strip span {
        white-space: normal !important;
        overflow-wrap: anywhere !important;
      }

      .wc-app.wc-view-mobile .overview-premium-cta {
        display: none !important;
      }

      @media (max-width: 420px) {
        .wc-app.wc-view-mobile {
          padding: 6px !important;
        }

        .wc-app.wc-view-mobile .wc-title {
          font-size: 21px !important;
        }

        .wc-app.wc-view-mobile .wc-header-controls {
          grid-template-columns: 1fr !important;
        }

        .wc-app.wc-view-mobile .wc-nav {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .wc-app.wc-view-mobile .overview-stat-grid,
        .wc-app.wc-view-mobile .overview-stat-grid.overview-stat-grid-in-progress {
          grid-template-columns: 1fr !important;
        }
      }


      /* v4.3 premium live look polish - visual only */
      .wc-nav button.wc-live-nav-button.is-offline,
      .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-offline {
        background: linear-gradient(135deg, rgba(155, 24, 24, 0.46), rgba(80, 10, 18, 0.34)) !important;
        border: 1px solid rgba(248, 113, 113, 0.82) !important;
        color: #fff !important;
        box-shadow:
          0 0 10px rgba(239, 68, 68, 0.42),
          0 0 24px rgba(127, 29, 29, 0.26),
          inset 0 1px 0 rgba(255,255,255,.10) !important;
        animation: none !important;
      }

      .wc-nav button.wc-live-nav-button.is-live,
      .wc-app.wc-view-tablet .wc-tablet-header-nav button.wc-live-nav-button.is-live {
        background: linear-gradient(135deg, rgba(16,185,129,0.40), rgba(5,150,105,0.22)) !important;
        border: 1px solid rgba(134,239,172,0.94) !important;
        color: #fff !important;
        box-shadow:
          0 0 12px rgba(34,197,94,.72),
          0 0 30px rgba(34,197,94,.38),
          0 0 54px rgba(34,197,94,.18),
          inset 0 1px 0 rgba(255,255,255,.14) !important;
        animation: wcLivePremiumButtonPulse 2.1s ease-in-out infinite !important;
      }

      @keyframes wcLivePremiumButtonPulse {
        0%, 100% {
          box-shadow:
            0 0 10px rgba(34,197,94,.58),
            0 0 24px rgba(34,197,94,.30),
            0 0 44px rgba(34,197,94,.14),
            inset 0 1px 0 rgba(255,255,255,.14);
          transform: translateY(0) scale(1);
        }
        50% {
          box-shadow:
            0 0 18px rgba(34,197,94,1),
            0 0 42px rgba(34,197,94,.62),
            0 0 76px rgba(34,197,94,.30),
            inset 0 1px 0 rgba(255,255,255,.18);
          transform: translateY(-1px) scale(1.018);
        }
      }

      .live-premium-main {
        border-color: rgba(134,239,172,.66) !important;
        box-shadow:
          0 18px 42px rgba(0,0,0,.34),
          0 0 28px rgba(34,197,94,.26),
          0 0 72px rgba(34,197,94,.14),
          inset 0 0 0 1px rgba(134,239,172,.09) !important;
      }

      .live-premium-main .live-premium-scoreboard {
        position: relative;
        padding: 18px !important;
        border-radius: 28px !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(34,197,94,.20), transparent 38%),
          linear-gradient(145deg, rgba(3,10,22,.72), rgba(4,23,30,.82)) !important;
        border: 2px solid rgba(74,222,128,.82) !important;
        box-shadow:
          0 0 14px rgba(34,197,94,.72),
          0 0 34px rgba(34,197,94,.34),
          0 0 74px rgba(34,197,94,.16),
          inset 0 0 34px rgba(34,197,94,.055) !important;
      }

      .live-premium-main .live-premium-team {
        background: rgba(255,255,255,.035) !important;
        border-color: rgba(148,163,184,.18) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05) !important;
      }

      .live-premium-main .live-premium-score-centre {
        background: rgba(2,6,23,.66) !important;
        border: 1px solid rgba(74,222,128,.56) !important;
        box-shadow:
          0 0 16px rgba(34,197,94,.22),
          inset 0 0 0 1px rgba(255,255,255,.04) !important;
      }

      .live-premium-main .live-premium-clock .wc-live,
      .live-premium-main .live-premium-status .wc-live,
      .live-premium-topline .live-on-air {
        color: #ecfdf5 !important;
        background: linear-gradient(135deg, rgba(34,197,94,.96), rgba(5,150,105,.74)) !important;
        border: 1px solid rgba(187,247,208,.90) !important;
        box-shadow:
          0 0 10px rgba(34,197,94,.88),
          0 0 24px rgba(34,197,94,.46),
          0 0 44px rgba(34,197,94,.20) !important;
        animation: wcLivePremiumBadgePulse 1.8s ease-in-out infinite !important;
      }

      @keyframes wcLivePremiumBadgePulse {
        0%, 100% { filter: brightness(1); transform: scale(1); }
        50% { filter: brightness(1.18); transform: scale(1.035); }
      }

      .live-premium-lower-grid {
        grid-template-columns: minmax(390px, 1.55fr) minmax(300px, 1.10fr) minmax(260px, .92fr) !important;
        gap: 14px !important;
      }

      .live-premium-stats-card {
        padding: 18px 20px !important;
        border-color: rgba(74,222,128,.45) !important;
        background:
          radial-gradient(circle at top left, rgba(34,197,94,.18), transparent 34%),
          radial-gradient(circle at bottom right, rgba(37,99,235,.16), transparent 40%),
          linear-gradient(145deg, rgba(8,22,42,.92), rgba(4,31,46,.62)) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.07),
          0 16px 36px rgba(0,0,0,.24),
          0 0 22px rgba(34,197,94,.08) !important;
      }

      .live-premium-stats-card .live-premium-card-title {
        color: #dcfce7 !important;
        font-size: .86rem !important;
        margin-bottom: 14px !important;
      }

      .live-stat-bars { gap: 16px !important; }

      .live-stat-row {
        grid-template-columns: 62px 1fr 62px !important;
        gap: 14px !important;
        font-size: 1.08rem !important;
      }

      .live-stat-bar-wrap small {
        color: rgba(255,255,255,.84) !important;
        font-size: .78rem !important;
        margin-bottom: 5px !important;
      }

      .live-stat-bar {
        height: 13px !important;
        background: rgba(148,163,184,.13) !important;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.045) !important;
      }

      .live-stat-bar i {
        background: linear-gradient(90deg, rgba(34,197,94,.98), rgba(16,185,129,.94)) !important;
        box-shadow: 0 0 14px rgba(34,197,94,.52) !important;
      }

      .live-stat-bar b {
        background: linear-gradient(90deg, rgba(244,63,94,.86), rgba(190,18,60,.92)) !important;
        box-shadow: 0 0 14px rgba(244,63,94,.34) !important;
      }

      .live-premium-timeline-card {
        position: relative;
        border-color: rgba(74,222,128,.30) !important;
      }

      .live-premium-timeline {
        position: relative;
        padding-left: 4px;
      }

      .live-premium-timeline::before {
        content: "";
        position: absolute;
        left: 24px;
        top: 8px;
        bottom: 8px;
        width: 2px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(34,197,94,.15), rgba(34,197,94,.96), rgba(34,197,94,.15));
        box-shadow: 0 0 14px rgba(34,197,94,.50);
      }

      .live-timeline-row {
        background: rgba(2,6,23,.26) !important;
      }

      .live-timeline-row b {
        position: relative;
        z-index: 1;
        width: 26px;
        height: 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(15,23,42,.88);
        box-shadow: 0 0 0 1px rgba(74,222,128,.36), 0 0 12px rgba(34,197,94,.22);
      }

      .live-discipline-grid div {
        border: 1px solid rgba(148,163,184,.18) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.045) !important;
      }

      .live-discipline-grid div:nth-child(odd)::after,
      .live-discipline-grid div:nth-child(even)::after {
        content: "";
        display: block;
        width: 34px;
        height: 3px;
        margin: 8px auto 0;
        border-radius: 999px;
      }

      .live-discipline-grid div:nth-child(odd)::after {
        background: #facc15;
        box-shadow: 0 0 12px rgba(250,204,21,.60);
      }

      .live-discipline-grid div:nth-child(even)::after {
        background: #ef4444;
        box-shadow: 0 0 12px rgba(239,68,68,.60);
      }

      .live-weather-compact-card {
        padding: 16px 20px !important;
        background:
          radial-gradient(circle at top left, rgba(250,204,21,.12), transparent 35%),
          linear-gradient(145deg, rgba(8,22,42,.78), rgba(8,42,55,.40)) !important;
      }

      .live-weather-main {
        grid-template-columns: minmax(220px,.9fr) minmax(420px,1.8fr) !important;
      }

      .live-weather-condition span { font-size: 2.15rem !important; }
      .live-weather-condition strong { font-size: 1rem !important; }
      .live-weather-metric {
        background: transparent !important;
        border-left: 1px solid rgba(255,255,255,.18) !important;
        border-top: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-radius: 0 !important;
      }

      .live-premium-feed.has-multiple-live {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        align-items: start !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-match,
      .live-premium-feed.has-multiple-live .live-premium-main {
        grid-column: auto !important;
        padding: 11px !important;
        border-radius: 20px !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-scoreboard,
      .live-premium-feed.has-multiple-live .live-premium-main .live-premium-scoreboard {
        padding: 10px !important;
        border-radius: 20px !important;
        gap: 10px !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-team {
        padding: 9px 7px !important;
        gap: 6px !important;
        border-radius: 16px !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-team strong {
        font-size: clamp(.92rem, 1.25vw, 1.12rem) !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-score-centre {
        min-width: 112px !important;
        padding: 8px 9px !important;
        border-radius: 17px !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-score {
        font-size: clamp(2rem, 3.2vw, 3.05rem) !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-lower-grid {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
        margin-top: 10px !important;
      }

      .live-premium-feed.has-multiple-live .live-premium-stats-card,
      .live-premium-feed.has-multiple-live .live-weather-compact-card,
      .live-premium-feed.has-multiple-live .live-premium-lower-grid .match-officials-box {
        grid-column: 1 / -1 !important;
      }

      .live-premium-feed.has-multiple-live .live-weather-main {
        grid-template-columns: 1fr !important;
      }

      .live-premium-feed.has-multiple-live .live-weather-metrics {
        grid-template-columns: repeat(2, minmax(0,1fr)) !important;
      }

      .live-premium-feed.has-multiple-live .live-stat-row {
        grid-template-columns: 46px 1fr 46px !important;
        gap: 8px !important;
        font-size: .9rem !important;
      }

      @media (max-width: 1100px) {
        .live-premium-feed.has-multiple-live { grid-template-columns: 1fr !important; }
        .live-premium-lower-grid { grid-template-columns: 1fr 1fr !important; }
        .live-premium-stats-card,
        .live-weather-compact-card { grid-column: 1 / -1 !important; }
      }

      @media (max-width: 760px) {
        .live-premium-main .live-premium-scoreboard {
          padding: 14px !important;
          border-radius: 22px !important;
        }
        .live-stat-row { grid-template-columns: 46px 1fr 46px !important; gap: 8px !important; }
        .live-weather-main { grid-template-columns: 1fr !important; }
        .live-weather-metrics { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .live-weather-metric { border: 1px solid rgba(255,255,255,.10) !important; border-radius: 12px !important; background: rgba(255,255,255,.05) !important; }
      }

</style>
    `;
  }

  nav() {
    const liveNavClass = (this._data.live || []).some((match) => this.isLiveMatch(match)) ? " is-live" : " is-offline";
    const items = [
      ["live", this.t("live")],
      ["overview", this.t("overview")],
      ["teams", this.t("teams")],
      ["fixtures", this.t("fixtures")],
      ["results", this.t("results")],
      ["groups", this.t("groups")],
      ["knockout", this.t("knockout")],
      ["players", this.t("players")],
      ["records", this.t("records")],
      ["stats", this.t("stats")],
      ["venues", this.t("venues")],
      ["supporters", this.t("supportersNav")],
    ];

    return `
      <div class="wc-nav">
        ${items.map(([key, label]) => `
          <button class="${this._page === key ? "active" : ""}${key === "live" ? ` wc-live-nav-button${liveNavClass}` : ""}" data-page="${key}">
            ${this.esc(label)}
          </button>
        `).join("")}
      </div>
    `;
  }

  tabletHeaderNav() {
    const liveNavClass = (this._data.live || []).some((match) => this.isLiveMatch(match)) ? " is-live" : " is-offline";
    const items = [
      ["live", this.t("live")],
      ["overview", this.t("overview")],
      ["teams", this.t("teams")],
      ["fixtures", this.t("fixtures")],
      ["results", this.t("results")],
      ["groups", this.t("groups")],
      ["knockout", this.t("knockout")],
      ["players", this.t("players")],
      ["records", this.t("records")],
      ["stats", this.t("stats")],
      ["venues", this.t("venues")],
      ["supporters", this.t("supportersNav")],
    ];

    return `
      <div class="wc-tablet-header-nav">
        ${items.map(([key, label]) => `
          <button class="${this._page === key ? "active" : ""}${key === "live" ? ` wc-live-nav-button${liveNavClass}` : ""}" data-page="${key}" title="${this.esc(label)}">
            ${this.esc(label)}
          </button>
        `).join("")}
      </div>
    `;
  }

  languageCodeFor(value) {
    const code = String(value || "en").replace("_", "-").toUpperCase();
    return code;
  }

  setLanguageSelectCompact(select, compact = true) {
    if (!select) return;

    Array.from(select.options).forEach((option) => {
      if (!option.value) return;

      if (!option.dataset.fullLabel) {
        option.dataset.fullLabel = option.textContent.trim();
      }

      option.textContent = compact
        ? this.languageCodeFor(option.value)
        : option.dataset.fullLabel;
    });
  }

  setupLanguageSelect(select) {
    if (!select) return;

    this.setLanguageSelectCompact(select, true);

    const showFullNames = () => this.setLanguageSelectCompact(select, false);
    const showCodes = () => this.setLanguageSelectCompact(select, true);

    select.onfocus = showFullNames;
    select.onmousedown = showFullNames;
    select.ontouchstart = showFullNames;
    select.onblur = showCodes;
    select.onchange = (e) => {
      this.changeLanguage(e.target.value);
    };
  }

  viewCodeFor(value) {
    if (value === "mobile") return "MOB";
    return value === "tablet" ? "TAB" : "PC";
  }

  setViewSelectCompact(select, compact = true) {
    if (!select) return;

    Array.from(select.options).forEach((option) => {
      if (!option.value) return;

      if (!option.dataset.fullLabel) {
        option.dataset.fullLabel = option.textContent.trim();
      }

      option.textContent = compact
        ? this.viewCodeFor(option.value)
        : option.dataset.fullLabel;
    });
  }

  setupViewSelect(select) {
    if (!select) return;

    this.setViewSelectCompact(select, true);

    const showFullNames = () => this.setViewSelectCompact(select, false);
    const showCodes = () => this.setViewSelectCompact(select, true);

    select.onfocus = showFullNames;
    select.onmousedown = showFullNames;
    select.ontouchstart = showFullNames;
    select.onblur = showCodes;
    select.onchange = (e) => {
      this.changeViewMode(e.target.value);
    };
  }

  sidebarCodeFor(value) {
    return value === "hide" ? "HIDE" : "SHOW";
  }

  setSidebarSelectCompact(select, compact = true) {
    if (!select) return;

    Array.from(select.options).forEach((option) => {
      if (!option.value) return;

      if (!option.dataset.fullLabel) {
        option.dataset.fullLabel = option.textContent.trim();
      }

      option.textContent = compact
        ? this.sidebarCodeFor(option.value)
        : option.dataset.fullLabel;
    });
  }

  setupSidebarSelect(select) {
    if (!select) return;
    select.value = "show";
    select.addEventListener("change", () => {
      select.value = "show";
      this._hideSidebar = false;
      try { localStorage.removeItem("world_cup_2026_hide_sidebar"); } catch (e) {}
    });
  }

  sidebarSelector() {
    return "";
  }

  languageOptionsMarkup() {
    const groups = [
      {
        label: "Europe",
        options: [
          ["en", "English"],
          ["fr", "Francais"],
          ["de", "Deutsch"],
          ["es", "Espanol"],
          ["it", "Italiano"],
          ["nl", "Nederlands"],
          ["pt", "Portugues"],
          ["pl", "Polski"],
          ["sv", "Svenska"],
          ["no", "Norsk"],
          ["hu", "Magyar"],
          ["is", "Islenska"],
          ["tr", "Turkce"],
          ["cs", "Cestina"],
          ["da", "Dansk"],
          ["fi", "Suomi"],
          ["el", "Ελληνικά"],
          ["ro", "Romana"],
          ["sk", "Slovencina"],
          ["sl", "Slovenscina"],
          ["hr", "Hrvatski"],
          ["sr", "Srpski"],
          ["bg", "Български"],
          ["uk", "Українська"],
        ],
      },
      {
        label: "Asia",
        options: [
          ["ja", "日本語"],
        ],
      },
      {
        label: "South America",
        options: [
          ["ay", "Aymara"],
          ["gn", "Guarani"],
          ["qu", "Quechua"],
        ],
      },
    ];

    return groups.map((group) => `
      <optgroup label="${this.esc(group.label)}">
        ${group.options.map(([value, label]) => `
          <option value="${this.esc(value)}" ${this._language === value ? "selected" : ""}>${this.esc(label)}</option>
        `).join("")}
      </optgroup>
    `).join("");
  }

  languageSelector() {
    return `
      <div class="wc-language-wrap">
        <div class="wc-language-label">${this.esc(this.t("language"))}</div>
        <select class="wc-language-select" id="wc-language-select">
          <optgroup label="Europe">
            <option value="en" ${this._language === "en" ? "selected" : ""}>English</option>
            <option value="fr" ${this._language === "fr" ? "selected" : ""}>French</option>
            <option value="de" ${this._language === "de" ? "selected" : ""}>German</option>
            <option value="es" ${this._language === "es" ? "selected" : ""}>Spanish</option>
            <option value="it" ${this._language === "it" ? "selected" : ""}>Italian</option>
            <option value="nl" ${this._language === "nl" ? "selected" : ""}>Dutch</option>
            <option value="pt" ${this._language === "pt" ? "selected" : ""}>Portuguese</option>
            <option value="pl" ${this._language === "pl" ? "selected" : ""}>Polish</option>
            <option value="sv" ${this._language === "sv" ? "selected" : ""}>Swedish</option>
            <option value="no" ${this._language === "no" ? "selected" : ""}>Norwegian</option>
            <option value="hu" ${this._language === "hu" ? "selected" : ""}>Hungarian</option>
            <option value="is" ${this._language === "is" ? "selected" : ""}>Icelandic</option>
            <option value="tr" ${this._language === "tr" ? "selected" : ""}>Turkish</option>
            <option value="cs" ${this._language === "cs" ? "selected" : ""}>Czech</option>
            <option value="da" ${this._language === "da" ? "selected" : ""}>Danish</option>
            <option value="fi" ${this._language === "fi" ? "selected" : ""}>Finnish</option>
            <option value="el" ${this._language === "el" ? "selected" : ""}>Greek</option>
            <option value="ro" ${this._language === "ro" ? "selected" : ""}>Romanian</option>
            <option value="sk" ${this._language === "sk" ? "selected" : ""}>Slovak</option>
            <option value="sl" ${this._language === "sl" ? "selected" : ""}>Slovenian</option>
            <option value="hr" ${this._language === "hr" ? "selected" : ""}>Croatian</option>
            <option value="sr" ${this._language === "sr" ? "selected" : ""}>Serbian</option>
            <option value="bg" ${this._language === "bg" ? "selected" : ""}>Bulgarian</option>
            <option value="uk" ${this._language === "uk" ? "selected" : ""}>Ukrainian</option>
          </optgroup>
          <optgroup label="Asia">
            <option value="ja" ${this._language === "ja" ? "selected" : ""}>Japanese</option>
          </optgroup>
          <optgroup label="South America">
            <option value="ay" ${this._language === "ay" ? "selected" : ""}>Aymara</option>
            <option value="gn" ${this._language === "gn" ? "selected" : ""}>Guaraní</option>
            <option value="qu" ${this._language === "qu" ? "selected" : ""}>Quechua</option>
          </optgroup>
        </select>
      </div>
    `;
  }



  viewSelector() {
    return `
      <div class="wc-view-wrap">
        <div class="wc-view-label">${this.esc(this.t("viewMode"))}</div>
        <select class="wc-view-select" id="wc-view-select" title="${this.esc(this.t("viewMode"))}">
          <option value="mobile" ${this._viewMode === "mobile" ? "selected" : ""}>${this.esc(this.t("mobileView"))}</option>
          <option value="tablet" ${this._viewMode === "tablet" ? "selected" : ""}>${this.esc(this.t("tabletView"))}</option>
          <option value="pc" ${this._viewMode === "pc" ? "selected" : ""}>${this.esc(this.t("pcView"))}</option>
        </select>
      </div>
    `;
  }


  overviewSupporterTicker() {
    const premiumSupporters = Array.isArray(this._data.premiumSupporters)
      ? this._data.premiumSupporters
      : [];

    const visibleSupporters = premiumSupporters.slice(0, 30);
    const supporterItems = visibleSupporters.map((supporter) => {
      const name = typeof supporter === "string" ? supporter : supporter.name;
      const country = typeof supporter === "string" ? "" : (supporter.flag || supporter.country || supporter.countryCode || supporter.location);
      const flag = country ? this.flag(country, true) : (typeof supporter === "object" && supporter.flag ? supporter.flag : "🌟");
      const label = this.esc(name || this.t("anonymousSupporter"));
      const message = typeof supporter === "string" ? "" : supporter.message;
      const shortMessage = message ? `<small>${this.esc(message)}</small>` : "";
      return `
        <span class="premium-ticker-card">
          <span class="premium-ticker-star">⭐</span>
          <span class="premium-ticker-flag">${flag}</span>
          <span class="premium-ticker-name">${label}</span>
          ${shortMessage}
        </span>
      `;
    });

    const heroItems = [
      `<span class="premium-ticker-card premium-ticker-ad"><span class="premium-ticker-star">🏆</span><span class="premium-ticker-name">${this.esc(this.staticText("premiumSupporters"))}</span><small>${this.esc(this.staticText("featuredMainDashboard"))}</small></span>`,
      `<span class="premium-ticker-card premium-ticker-ad"><span class="premium-ticker-star">🍺</span><span class="premium-ticker-name">${this.esc(this.staticText("supportDevelopment"))}</span><small>${this.esc(this.staticText("helpApiCosts"))}</small></span>`,
      `<span class="premium-ticker-card premium-ticker-ad"><span class="premium-ticker-star">⭐</span><span class="premium-ticker-name">${this.esc(this.staticText("premiumSupporter"))}</span><small>${this.esc(this.staticText("minimumDonationFeatured"))}</small></span>`
    ];

    const items = supporterItems.length ? [...supporterItems, ...heroItems] : heroItems;
    const repeatedItems = [...items, ...items, ...items].join("");

    // Keep the marquee position stable across Home Assistant refreshes/re-renders.
    // Without this, every data refresh rebuilds the DOM and the animation starts again.
    const animationSeconds = 140;
    const animationOffset = -((Date.now() / 1000) % animationSeconds).toFixed(2);

    return `
      <div class="overview-premium-strip" role="region" aria-label="${this.esc(this.staticText("premiumTickerAria"))}">
        <div class="overview-premium-glow"></div>
        <div class="overview-premium-badge">
          <span class="overview-premium-crown">👑</span>
          <span>
            <strong>${this.esc(this.staticText("premiumSupporters"))}</strong>
            <small>${this.esc(this.staticText("mainPageFeaturedSupporters"))}</small>
          </span>
        </div>
        <div class="overview-premium-marquee">
          <div class="overview-premium-track" style="--premium-scroll-seconds: ${animationSeconds}s; --premium-scroll-delay: ${animationOffset}s;">
            ${repeatedItems}
          </div>
        </div>
        <button class="overview-premium-cta overview-action-button" data-page="supporters" type="button">
          🍺 ${this.esc(this.staticText("joinSupporters"))}
        </button>
      </div>
    `;
  }

  overviewPage() {
    const o = this._data.overview || {};
    const fixtures = this._data.fixtures || [];
    const rawScorers = Array.isArray(this._data.scorers) ? this._data.scorers : [];
    const scorers = rawScorers
      .map((s) => {
        const playerName =
          typeof s.player === "string"
            ? s.player
            : s.player?.name || s.name || this.t("unknown");

        const teamName =
          typeof s.team === "string"
            ? s.team
            : s.team?.shortName || s.team?.name || s.team?.tla || s.nationality || this.t("tbc");

        return {
          raw: s,
          name: playerName,
          team: this.localizedTeamName(teamName),
          goals: this.numberValue(this.resolvedPlayerStat(s, "goals", "scored", "goal_count", "total_goals", "totalGoals")),
          assists: this.numberValue(this.resolvedPlayerStat(s, "assists", "assist", "assist_count", "total_assists", "totalAssists")),
          source: s.source || "football-data.org",
        };
      })
      .filter((player) => player.name && player.name !== this.t("unknown"))
      .sort((a, b) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        a.name.localeCompare(b.name)
      );
    const scorerGoals = (s) => this.numberValue(s?.goals);
    const stats = this._data.statistics || {};
    const records = this._data.records || {};
    const venues = this._data.venues || {};
    const groups = this._data.groups || [];

    const sortedFixtures = [...fixtures].sort((a, b) => {
      const aTime = new Date(a.utcDate || a.date || 0).getTime();
      const bTime = new Date(b.utcDate || b.date || 0).getTime();
      return aTime - bTime;
    });

    const finishedStatuses = ["FINISHED", "FT", "AET", "PEN"];
    const liveStatuses = ["IN_PLAY", "LIVE", "PAUSED", "HT", "HALF_TIME", "1H", "2H", "ET", "BT", "P", "SUSP", "INT"];
    const upcomingStatuses = ["TIMED", "SCHEDULED"];

    const playedCount = o.matches_played ?? sortedFixtures.filter(m => finishedStatuses.includes(m.status)).length;
    const loadedCount = o.matches_loaded ?? sortedFixtures.length;
    const totalMatches = o.matches_total ?? 104;
    const remainingCount = o.matches_remaining ?? Math.max(totalMatches - playedCount, 0);
    const liveMatches = sortedFixtures.filter(m => liveStatuses.includes(m.status));
    const upcomingMatches = sortedFixtures.filter(m => upcomingStatuses.includes(m.status)).slice(0, 4);
    const recentResults = sortedFixtures.filter(m => finishedStatuses.includes(m.status)).slice(-4).reverse();
    const nextMatch = upcomingMatches[0] || sortedFixtures.find(m => !finishedStatuses.includes(m.status)) || sortedFixtures[0];
    const topScorer = scorers[0];
    const progress = Number(o.progress ?? stats.progress ?? (totalMatches ? Math.round((playedCount / totalMatches) * 100) : 0));
    const safeProgress = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));
    const totalGoals = o.total_goals ?? stats.total_goals ?? 0;
    const goalsPerMatch = stats.goals_per_match ?? (playedCount ? (totalGoals / playedCount).toFixed(2) : 0);
    const stadiumCount = venues.stadiums?.length ?? 0;
    const loadedGroups = groups.length;
    const finalVenue = venues.final_venue;
    const topTeam = records.top_scoring_team;
    const bestDefence = records.best_defence;
    const supporters = this.sortedSupporters();
    return `
      <div class="overview-pro-page">
        ${this.overviewSupporterTicker()}
        <div class="overview-hero compact-overview-hero wc-card">
<div class="overview-hero-main">
            <div class="overview-progress-wrap">
              <div class="overview-progress-top">
                <span>${this.t("progress")}</span>
                <strong>${safeProgress}%</strong>
              </div>
              <div class="overview-progress-bar">
                <div style="width:${safeProgress}%;"></div>
              </div>

              <div class="overview-stat-grid overview-stat-grid-in-progress">
                <div class="overview-stat-tile"><span>${this.t("totalMatches")}</span><strong>${totalMatches}</strong><em>${loadedCount} ${this.t("loaded").toLowerCase()}</em></div>
                <div class="overview-stat-tile"><span>${this.t("played")}</span><strong>${playedCount}</strong><em>${remainingCount} ${this.t("remaining").toLowerCase()}</em></div>
                <div class="overview-stat-tile"><span>${this.t("totalGoals")}</span><strong>${totalGoals}</strong><em>${goalsPerMatch} ${this.t("goalsPerMatch")}</em></div>
                <div class="overview-stat-tile"><span>${this.t("groups")}</span><strong>${loadedGroups || 12}</strong><em>${this.t("groupsAL")}</em></div>
                <div class="overview-stat-tile"><span>${this.t("stadiums")}</span><strong>${stadiumCount}</strong><em>${this.t("worldCupStadiums")}</em></div>
                <div class="overview-stat-tile"><span>${this.t("topScorer")}</span><strong>${this.esc(topScorer?.goals ?? 0)}</strong><em>${this.esc(topScorer?.name || this.t("notAvailable"))}</em></div>
              </div>

              <div class="wc-tablet-progress-controls wc-tablet-progress-title">
                ${this.headerCountdownPill("wc-tablet-progress-countdown", "wc-tablet-progress-countdown")}
                <div class="wc-progress-title-text">
                  <div class="wc-progress-title-main">${this.t("title")}</div>
                  <div class="wc-progress-title-sub">${this.t("subtitle")}</div>
                </div>
              </div>
            </div>

          </div>

        </div>


        <div class="overview-main-grid">
          <div class="overview-panel wc-card overview-feature-panel">
            <div class="overview-panel-heading">
              <div>
                <div class="overview-small-label">${this.t("nextMatch")}</div>
                <div class="wc-section-title">${this.t("matchSpotlight")}</div>
              </div>
              ${nextMatch ? `<span class="overview-date-pill">${this.esc(this.formatDate(nextMatch.utcDate || nextMatch.date))}</span>` : ""}
            </div>
            ${nextMatch ? this.fixtureCard(nextMatch) : `<div class="wc-empty">${this.t("noUpcomingMatch")}</div>`}
          </div>

          <div class="overview-panel wc-card">
            <div class="overview-panel-heading">
              <div>
                <div class="overview-small-label">${this.t("tournamentStatus")}</div>
                <div class="wc-section-title">${this.t("tournamentIntelligence")}</div>
              </div>
            </div>

            <div class="overview-info-list">
              <div><span>${this.t("topScoringTeam")}</span><strong>${this.esc(topTeam?.team ? this.localizedTeamName(topTeam.team) : this.t("notAvailable"))}</strong><em>${topTeam?.goalsFor ?? 0} ${this.t("goals").toLowerCase()}</em></div>
              <div><span>${this.t("bestDefence")}</span><strong>${this.esc(bestDefence?.team ? this.localizedTeamName(bestDefence.team) : this.t("notAvailable"))}</strong><em>${bestDefence?.goalsAgainst ?? 0} ${this.t("conceded")}</em></div>
              <div><span>${this.t("finalVenue")}</span><strong>${this.esc(finalVenue?.stadium || this.t("notAvailable"))}</strong><em>${this.esc(finalVenue ? `${finalVenue.city}, ${this.localizedCountryName(finalVenue.country)}` : this.t("venues"))}</em></div>
              <div><span>${this.t("matchesPlayed")}</span><strong>${playedCount} / ${totalMatches}</strong><em>${safeProgress}% ${this.t("progress").toLowerCase()}</em></div>
            </div>
          </div>
        </div>

        <div class="overview-lower-grid">
          <div class="overview-panel wc-card">
            <div class="overview-panel-heading">
              <div>
                <div class="overview-small-label">${this.t("upNext")}</div>
                <div class="wc-section-title">${this.t("upcomingFixtures")}</div>
              </div>
              <span class="overview-date-pill">${upcomingMatches.length}</span>
            </div>
            ${upcomingMatches.length ? `
              <div class="overview-mini-match-list">
                ${upcomingMatches.map(m => this.overviewMiniMatch(m)).join("")}
              </div>
            ` : `<div class="wc-empty">${this.t("noUpcomingMatch")}</div>`}
          </div>

          <div class="overview-panel wc-card">
            <div class="overview-panel-heading">
              <div>
                <div class="overview-small-label">${this.t("latest")}</div>
                <div class="wc-section-title">${this.t("recentResults")}</div>
              </div>
              <span class="overview-date-pill">${recentResults.length}</span>
            </div>
            ${recentResults.length ? `
              <div class="overview-mini-match-list">
                ${recentResults.map(m => this.overviewMiniMatch(m, true)).join("")}
              </div>
            ` : `<div class="wc-empty">${this.t("noResult")}</div>`}
          </div>

          <div class="overview-panel wc-card">
            <div class="overview-panel-heading">
              <div>
                <div class="overview-small-label">${this.t("goldenBoot")}</div>
                <div class="wc-section-title">${this.t("playerWatch")}</div>
              </div>
            </div>
            ${scorers.length ? `
              <div class="overview-player-list">
                ${scorers.slice(0, 5).map((s, i) => `
                  <div class="overview-player-row">
                    <span>${i + 1}</span>
                    <strong>${this.esc(s.name)}</strong>
                    <em>${this.esc(s.team)}</em>
                    <b>${scorerGoals(s)}</b>
                  </div>
                `).join("")}
              </div>
            ` : `<div class="wc-empty">${this.t("noPlayerStats")}</div>`}
          </div>
        </div>

        ${this.overviewSupportersPanel()}
        ${this.overviewDonatePanel()}
      </div>
    `;
  }

  overviewDonatePanel() {
    return `
      <div class="overview-donate-card wc-card">
        <div class="overview-donate-icon">☕</div>
        <div class="wc-section-title">${this.t("enjoyingIntegration")}</div>
        <p class="overview-donate-text">${this.t("supportFutureUpdates")}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <a
            class="wc-overview-beer-button"
            href="https://ko-fi.com/supportkofi"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕ ${this.esc(this.staticText("supportViaKofi"))}
          </a>
          <a
            class="wc-overview-beer-button"
            href="https://paypal.me/graffidoodle"
            target="_blank"
            rel="noopener noreferrer"
          >
            💳 ${this.esc(this.staticText("supportViaPaypal"))}
          </a>
        </div>
      </div>
    `;
  }

  overviewMiniMatch(m, showScore = false) {
    const homeTeam = this.getHomeTeam(m);
    const awayTeam = this.getAwayTeam(m);
    const homeScore = this.getHomeScore(m);
    const awayScore = this.getAwayScore(m);
    const scoreText = showScore || (homeScore !== "-" || awayScore !== "-") ? `${homeScore} - ${awayScore}` : this.t("versus");
    const status = this.statusLabel(m.status, m);
    const stage = String(m.group || this.stageLabel(m.stage) || "").replaceAll("_", " ");

    return `
      <div class="overview-mini-match">
        <div class="overview-mini-top">
          <span>${this.esc(stage || this.t("fixtures"))}</span>
          <em>${this.esc(status)}</em>
        </div>
        <div class="overview-mini-teams">
          <div>${this.flag(homeTeam, true)}<strong>${this.esc(this.localizedTeamName(homeTeam))}</strong></div>
          <b>${this.esc(scoreText)}</b>
          <div>${this.flag(awayTeam, true)}<strong>${this.esc(this.localizedTeamName(awayTeam))}</strong></div>
        </div>
        <div class="overview-mini-date">${this.esc(this.formatDate(m.utcDate || m.date))}</div>
      </div>
    `;
  }


  scorerName(scorer) {
    const player = scorer?.player;
    if (player && typeof player === "object") {
      return player.name || player.firstName || player.lastName || scorer?.name || "";
    }
    return scorer?.name || player || scorer?.playerName || "";
  }

  scorerTeamName(scorer) {
    const team = scorer?.team;
    if (team && typeof team === "object") {
      return team.shortName || team.name || team.tla || "";
    }
    return team || scorer?.teamName || scorer?.country || "";
  }

  matchScorersForTeam(team) {
    const teamKey = this.fixtureTeamKey(team);
    const seen = new Set();

    return (this._data.scorers || [])
      .filter((scorer) => Number(scorer?.goals || 0) > 0)
      .filter((scorer) => this.fixtureTeamKey(this.scorerTeamName(scorer)) === teamKey)
      .map((scorer) => ({ name: this.scorerName(scorer), minute: null, extra: null }))
      .filter((scorer) => scorer.name)
      .filter((scorer) => {
        const key = String(scorer.name).toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  goalEventDedupeKey(event) {
    if (!event) return "";
    const matchId = String(event.matchId || "").trim();
    const team = this.fixtureTeamKey(event.team || event.teamName || event.country || "");
    const player = String(event.player || event.playerName || event.name || "").toLowerCase().trim();
    const source = String(event.source || "").toLowerCase().trim();
    const detail = String(event.detail || event.type || "Goal").toLowerCase().trim();
    const isLocalPlaceholder = source === "local-clock" || !player || player === "goal";
    if (isLocalPlaceholder) {
      return `${matchId}|${team}|local-clock|${detail}`;
    }
    const time = String(event.timerSeconds ?? event.timer ?? event.displayMinute ?? event.minute ?? "").trim();
    return `${matchId}|${team}|${player}|${time}|${detail}`;
  }

  betterGoalEvent(current, next) {
    if (!current) return next;
    if (!next) return current;
    const currentPlayer = String(current.player || current.playerName || current.name || "").trim();
    const nextPlayer = String(next.player || next.playerName || next.name || "").trim();
    const currentScore =
      currentPlayer.length +
      (current.assist ? 30 : 0) +
      (String(current.displayMinute || "").includes("+") ? 10 : 0);
    const nextScore =
      nextPlayer.length +
      (next.assist ? 30 : 0) +
      (String(next.displayMinute || "").includes("+") ? 10 : 0);
    return nextScore > currentScore ? next : current;
  }

  dedupeGoalEvents(events) {
    const source = Array.isArray(events) ? events : [];
    const byKey = new Map();

    source
      .filter((event) => String(event?.type || "").toLowerCase() === "goal")
      .filter((event) => !this.isShootoutPenaltyEvent(event))
      .forEach((event) => {
        const key = this.goalEventDedupeKey(event);
        if (!key) return;
        byKey.set(key, this.betterGoalEvent(byKey.get(key), event));
      });

    return Array.from(byKey.values())
      .sort((a, b) => Number(a?.timerSeconds ?? a?.minute ?? 0) - Number(b?.timerSeconds ?? b?.minute ?? 0))
      .map((event, index) => ({ ...event, goalNumber: index + 1 }));
  }

  isShootoutPenaltyEvent(event) {
    const text = [
      event?.type,
      event?.rawType,
      event?.eventType,
      event?.kind,
      event?.detail,
      event?.comments,
      event?.reason,
      event?.subType,
      event?.period,
      event?.phase,
    ].map((value) => String(value || "").toLowerCase()).join(" ");

    return text.includes("shootout")
      || text.includes("penalty shoot")
      || text.includes("penalties")
      || text.includes("penalty scored")
      || text.includes("penalty converted");
  }

  matchGoalEventsForTeam(match, team) {
    const teamKey = this.fixtureTeamKey(team);
    const preferredEvents = (match && Array.isArray(match.goalEvents) && match.goalEvents.length)
      ? match.goalEvents
      : ((match && Array.isArray(match.events)) ? match.events : []);
    const seen = new Set();

    return this.dedupeGoalEvents(preferredEvents)
      .filter((event) => this.fixtureTeamKey(event?.team || event?.teamName || event?.country) === teamKey)
      .map((event) => {
        const minute = event?.minute ?? event?.elapsed ?? null;
        const timer = event?.timer || null;
        const displayMinute = event?.displayMinute || (minute !== null && minute !== undefined && minute !== "" ? `${Number(minute)}'` : "");
        const rawName = event?.player || event?.playerName || event?.name || "";
        const name = String(rawName || "").trim();
        if (!name || name.toLowerCase() === "goal") return null;
        const detail = String(event?.detail || event?.type || "");
        const comments = String(event?.comments || "");
        const isOwnGoal = /own\s*goal|og|own/i.test(`${detail} ${comments}`);
        return {
          name,
          minute,
          extra: event?.extra ?? null,
          timer,
          displayMinute,
          isOwnGoal,
          detail,
          source: event?.source || "football-data",
        };
      })
      .filter(Boolean)
      .filter((event) => {
        const key = `${teamKey}|${event.name}|${event.timer || event.displayMinute || event.minute || ""}`.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }


  eventMinuteText(event) {
    if (!event) return "";
    const display = event.displayMinute || event.display_minute || event.timeDisplay || event.minuteDisplay;
    if (display !== null && display !== undefined && String(display).trim() !== "") {
      return String(display).trim();
    }

    const rawMinute =
      event.minute ??
      event.elapsed ??
      event.time?.elapsed ??
      event.matchMinute ??
      event.timerMinute ??
      null;

    if (rawMinute === null || rawMinute === undefined || rawMinute === "") return "";

    const minute = Number(rawMinute);
    const extraRaw = event.extra ?? event.time?.extra ?? event.stoppageTime ?? event.injuryTime ?? null;
    const extra = Number(extraRaw);

    if (Number.isFinite(minute)) {
      return `${minute}${Number.isFinite(extra) && extra > 0 ? `+${extra}` : ""}'`;
    }

    return String(rawMinute).includes("'") ? String(rawMinute) : `${String(rawMinute)}'`;
  }

  eventTimerSeconds(event) {
    const raw =
      event?.timerSeconds ??
      event?.timer_seconds ??
      event?.seconds ??
      event?.time?.elapsedSeconds ??
      null;

    if (raw !== null && raw !== undefined && raw !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }

    const minuteRaw = event?.minute ?? event?.elapsed ?? event?.time?.elapsed ?? null;
    const extraRaw = event?.extra ?? event?.time?.extra ?? 0;
    const minute = Number(minuteRaw);
    const extra = Number(extraRaw);

    if (Number.isFinite(minute)) return (minute + (Number.isFinite(extra) ? extra : 0)) * 60;
    return 999999;
  }

  eventTeamName(event) {
    const team = event?.team ?? event?.teamName ?? event?.country ?? event?.team_name ?? event?.teamRef;
    if (team && typeof team === "object") {
      return team.shortName || team.name || team.tla || "";
    }
    return String(team || "").trim();
  }

  eventPlayerName(event) {
    const player = event?.player ?? event?.playerName ?? event?.name ?? event?.scorer ?? event?.person;
    if (player && typeof player === "object") {
      return player.name || player.shortName || player.displayName || "";
    }
    return String(player || "").trim();
  }

  eventAssistName(event) {
    const assist = event?.assist ?? event?.assistName ?? event?.assistBy;
    if (assist && typeof assist === "object") {
      return assist.name || assist.shortName || assist.displayName || "";
    }
    return String(assist || "").trim();
  }

  eventSubPlayerName(event, keys) {
    for (const key of keys) {
      const value = event?.[key];
      if (value && typeof value === "object") {
        const name = value.name || value.shortName || value.displayName || "";
        if (name) return String(name).trim();
      }
      if (value) return String(value).trim();
    }
    return "";
  }

  eventDetailText(event) {
    return String(event?.detail || event?.comments || event?.subType || event?.reason || event?.type || "").trim();
  }

  eventGoalMethod(event) {
    const text = [
      event?.detail,
      event?.comments,
      event?.reason,
      event?.subType,
      event?.type,
      event?.rawType,
    ].map((value) => String(value || "").toLowerCase()).join(" ");

    if (event?.isDisallowed) return "Disallowed";
    if (event?.isMissedPenalty || text.includes("missed penalty") || text.includes("penalty missed")) return "Missed penalty";
    if (event?.isOwnGoal || text.includes("own goal")) return "Own goal";
    if (event?.isPenalty || text.includes("penalty")) return "Penalty";
    if (text.includes("header") || text.includes("headed")) return "Header";
    if (text.includes("free kick") || text.includes("freekick")) return "Free kick";
    if (text.includes("left foot")) return "Left foot";
    if (text.includes("right foot")) return "Right foot";

    const detail = this.eventDetailText(event);
    if (!detail || /^(goal|normal goal)$/i.test(detail)) return "";
    return detail;
  }

  eventDetailRank(event) {
    const text = [
      event?.detail,
      event?.comments,
      event?.reason,
      event?.subType,
      event?.type,
      event?.rawType,
    ].map((value) => String(value || "").toLowerCase()).join(" ");
    let score = 0;
    if (text.trim() && text.trim() !== "goal" && text.trim() !== "normal goal") score += 1;
    ["header", "headed", "left foot", "right foot", "free kick", "freekick", "penalty", "own goal"].forEach((marker) => {
      if (text.includes(marker)) score += 3;
    });
    if (event?.assist) score += 1;
    return score;
  }

  eventDetailParts(event) {
    const parts = [];
    const detail = this.eventDetailText(event);

    if (event.category === "goal") {
      const method = this.eventGoalMethod(event);
      if (method) parts.push(method);
      if (event.assist) parts.push(`Assist: ${event.assist}`);
      return parts;
    }

    if (event.category === "substitution") {
      if (event.playerOn) parts.push(`On: ${event.playerOn}`);
      if (event.playerOff) parts.push(`Off: ${event.playerOff}`);
      return parts;
    }

    if (event.category === "card") {
      if (detail && detail.toLowerCase() !== "card") parts.push(detail);
      return parts;
    }

    if (event.category === "var") {
      const reason = event.comments || event.reason || event.subType || "";
      if (detail) parts.push(detail);
      if (reason && String(reason).toLowerCase() !== String(detail).toLowerCase()) parts.push(reason);
      return parts;
    }

    if (detail) parts.push(detail);
    return parts;
  }

  rawMatchEvents(match) {
    const combined = [];
    [
      match?.events,
      match?.goalEvents,
      match?.goals,
      match?.cardEvents,
      match?.cards,
      match?.substitutionEvents,
      match?.substitutions,
      match?.varEvents,
      match?.matchDetails?.events,
      match?.matchDetails?.goalEvents,
      match?.matchDetails?.cardEvents,
      match?.matchDetails?.substitutionEvents,
      match?.matchDetails?.varEvents,
      match?.apiFootballEvents,
      match?.timeline,
      match?.incidents,
      match?.matchEvents,
    ].forEach((list) => {
      if (Array.isArray(list)) combined.push(...list);
    });
    return combined.filter((event) => event && typeof event === "object");
  }

  normalisedMatchEvents(match) {
    const events = this.rawMatchEvents(match);
    const byKey = new Map();
    const disallowedSourceEvents = events.filter((event) => {
      const sourceText = [
        event?.type,
        event?.rawType,
        this.eventDetailText(event),
        event?.comments,
        event?.reason,
        event?.subType,
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      return event?.isDisallowed === true
        || sourceText.includes("disallowed")
        || sourceText.includes("disallow")
        || sourceText.includes("cancelled")
        || sourceText.includes("canceled")
        || sourceText.includes("no goal");
    });

    events.forEach((event) => {
      const typeText = String(event.type || event.rawType || event.eventType || event.kind || "").toLowerCase();
      const detailText = this.eventDetailText(event).toLowerCase();
      const combinedText = [
        typeText,
        detailText,
        event.comments,
        event.reason,
        event.subType,
      ].map((value) => String(value || "").toLowerCase()).join(" ");
      const player = this.eventPlayerName(event);
      const team = this.eventTeamName(event);
      const minuteText = this.eventMinuteText(event);
      const timerSeconds = this.eventTimerSeconds(event);

      const isDisallowed = event.isDisallowed === true
        || combinedText.includes("disallowed")
        || combinedText.includes("disallow")
        || combinedText.includes("cancelled")
        || combinedText.includes("canceled")
        || combinedText.includes("no goal");
      const hasMatchingDisallowed = !isDisallowed && disallowedSourceEvents.some((other) => {
        const sameMinute = this.eventTimerSeconds(other) === timerSeconds || this.eventMinuteText(other) === minuteText;
        const sameTeam = this.fixtureTeamKey(this.eventTeamName(other)) === this.fixtureTeamKey(team);
        const samePlayer = this.eventPlayerName(other).toLowerCase() === player.toLowerCase();
        return sameMinute && (sameTeam || samePlayer);
      });
      const isGoal = !isDisallowed && (typeText.includes("goal") || detailText.includes("goal") || event.isGoal === true);
      const isCard = typeText.includes("card") || detailText.includes("yellow") || detailText.includes("red");
      const isSub = typeText.includes("subst") || detailText.includes("substitution");
      const isVar = isDisallowed || typeText.includes("var") || detailText.includes("var") || detailText.includes("video assistant") || detailText.includes("video review") || String(event.rawType || "").toLowerCase().includes("var");
      const isShootoutPenalty = combinedText.includes("shootout")
        || combinedText.includes("penalty shoot")
        || combinedText.includes("penalties")
        || combinedText.includes("penalty scored")
        || combinedText.includes("penalty converted");
      const isPenalty = detailText.includes("penalty") || detailText.includes("pen");
      const isMissedPenalty = detailText.includes("missed penalty") || detailText.includes("penalty missed");
      const isOwnGoal = !isDisallowed && (detailText.includes("own goal") || /\bog\b/i.test(detailText));

      let category = "";
      if (isGoal && hasMatchingDisallowed) return;
      if (isShootoutPenalty) return;
      if (isGoal) category = "goal";
      else if (isCard) category = "card";
      else if (isSub) category = "substitution";
      else if (isVar) category = "var";
      else return;

      let icon = "•";
      if (category === "goal") icon = isOwnGoal ? "OG" : (isPenalty ? "PEN" : "⚽");
      if (category === "card") icon = detailText.includes("red") ? "🟥" : "🟨";
      if (category === "substitution") icon = "🔄";
      if (category === "var") icon = "VAR";
      if (isMissedPenalty) icon = "PEN";

      const key = [
        category,
        this.fixtureTeamKey(team),
        player.toLowerCase(),
        minuteText || timerSeconds,
      ].join("|");

      if (!key.trim()) return;

      const normalisedEvent = {
        ...event,
        category,
        icon,
        team,
        player,
        assist: this.eventAssistName(event),
        playerOn: category === "substitution"
          ? this.eventSubPlayerName(event, ["playerOn", "playerIn", "in", "on"]) || this.eventAssistName(event)
          : this.eventSubPlayerName(event, ["playerOn", "playerIn", "in", "on"]),
        playerOff: category === "substitution"
          ? this.eventSubPlayerName(event, ["playerOff", "playerOut", "out", "off"]) || player
          : this.eventSubPlayerName(event, ["playerOff", "playerOut", "out", "off"]),
        minuteText,
        timerSeconds,
        detail: this.eventDetailText(event),
        isOwnGoal,
        isPenalty,
        isMissedPenalty,
        isDisallowed,
      };

      const existingEvent = byKey.get(key);
      if (existingEvent && this.eventDetailRank(existingEvent) >= this.eventDetailRank(normalisedEvent)) return;

      byKey.set(key, normalisedEvent);
    });

    return Array.from(byKey.values()).sort((a, b) => {
      const timerDiff = Number(a.timerSeconds || 0) - Number(b.timerSeconds || 0);
      if (timerDiff !== 0) return timerDiff;
      return String(a.category).localeCompare(String(b.category));
    });
  }

  matchCardEvents(match) {
    return this.normalisedMatchEvents(match).filter((event) => event.category === "card");
  }

  matchReferees(match) {
    const refs = [];
    const genericOfficialWords = new Set(["referee", "ref", "official", "main referee", "assistant referee", "var", "video assistant referee", "match official"]);
    const countryOnlyOfficialNames = new Set([
      "sweden", "swedish", "england", "english", "france", "french", "germany", "german", "spain", "spanish",
      "italy", "italian", "netherlands", "dutch", "portugal", "portuguese", "poland", "polish", "norway",
      "norwegian", "usa", "united states", "american", "canada", "canadian", "mexico", "mexican",
      "argentina", "argentinian", "brazil", "brazilian", "uruguay", "uruguayan", "japan", "japanese",
      "korea", "korean", "australia", "australian", "turkey", "turkish", "qatar", "morocco", "ghana",
      "panama", "croatia", "austria", "belgium", "egypt", "iran", "iraq", "senegal", "switzerland",
      "romania", "romanian",
      "slovenia", "slovenian", "slovakia", "slovak", "czechia", "czech", "hungary", "hungarian",
      "serbia", "serbian", "bulgaria", "bulgarian", "ukraine", "ukrainian", "greece", "greek",
      "denmark", "danish", "finland", "finnish", "iceland", "icelandic", "ireland", "irish",
      "scotland", "scottish", "wales", "welsh", "chile", "chilean", "colombia", "colombian",
      "paraguay", "paraguayan", "peru", "peruvian", "venezuela", "venezuelan", "ecuador", "ecuadorian",
      "bolivia", "bolivian", "costa rica", "costa rican", "honduras", "honduran", "guatemala", "guatemalan",
      "jamaica", "jamaican", "saudi arabia", "saudi", "uae", "emirati", "china", "chinese",
      "uzbekistan", "uzbek", "algeria", "algerian", "tunisia", "tunisian", "south africa", "south african",
    ]);
    const cleanOfficialText = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const isGenericOfficial = (name, type = "", nationality = "") => {
      const cleanName = cleanOfficialText(name);
      const cleanType = cleanOfficialText(type);
      const cleanNationality = cleanOfficialText(nationality);
      const nameWithoutRole = cleanName
        .replace(/\b(referee|ref|official|main|assistant|var|video|match)\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const looksLikeRoleCountry = /\b(referee|official|assistant|var)\b/.test(cleanName)
        && cleanName.split(" ").some((part) => countryOnlyOfficialNames.has(part));
      return !cleanName
        || genericOfficialWords.has(cleanName)
        || looksLikeRoleCountry
        || (nameWithoutRole && countryOnlyOfficialNames.has(nameWithoutRole))
        || (cleanNationality && cleanName === cleanNationality)
        || (cleanType && cleanName === cleanType);
    };

    const addRef = (ref) => {
      if (!ref) return;
      if (typeof ref === "string") {
        const name = ref.trim();
        if (name && !isGenericOfficial(name)) refs.push({ name });
        return;
      }
      if (typeof ref === "object") {
        const name = ref.name || ref.referee || ref.fullName || ref.displayName;
        const type = ref.type || ref.role || "REFEREE";
        const nationality = ref.nationality || ref.country || "";
        if (!name || isGenericOfficial(name, type, nationality)) return;
        refs.push({
          name,
          type,
          nationality,
        });
      }
    };

    addRef(match?.referee);
    addRef(match?.mainReferee);
    addRef(match?.official);
    (Array.isArray(match?.referees) ? match.referees : []).forEach(addRef);
    (Array.isArray(match?.officials) ? match.officials : []).forEach(addRef);

    const normaliseOfficialName = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(referee|ref|official|main|assistant|var|video|match)\b/g, " ")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const officialNameKey = (value) => {
      const cleaned = normaliseOfficialName(value);
      if (!cleaned) return "";
      const parts = cleaned.split(" ").filter((part) => part && !countryOnlyOfficialNames.has(part));
      if (parts.length <= 1) return cleaned.replace(/\s/g, "");
      return `${parts[0]}|${parts[parts.length - 1]}`;
    };

    const byName = new Map();
    refs.forEach((ref) => {
      const key = officialNameKey(ref.name);
      if (!key) return;
      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, ref);
        return;
      }
      const existingScore = (existing.type ? 1 : 0) + (existing.nationality ? 1 : 0);
      const nextScore = (ref.type ? 1 : 0) + (ref.nationality ? 1 : 0);
      if (nextScore > existingScore) byName.set(key, ref);
    });
    return Array.from(byName.values());
  }

  matchOfficialsSection(match) {
    const cleanRefText = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(referee|ref|official|main|assistant|var|video|match)\b/g, " ")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const stripCountryFromRefName = (name, nationality = "") => {
      let cleaned = String(name || "").trim();
      const nat = String(nationality || "").trim();
      if (nat) {
        cleaned = cleaned.replace(new RegExp(`\\s*,?\\s*${nat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), "").trim();
      }
      const countryWords = new Set([
        "sweden", "swedish", "england", "english", "france", "french", "germany", "german", "spain", "spanish",
        "italy", "italian", "netherlands", "dutch", "portugal", "portuguese", "poland", "polish", "norway",
        "norwegian", "usa", "united states", "american", "canada", "canadian", "mexico", "mexican",
        "argentina", "argentinian", "brazil", "brazilian", "uruguay", "uruguayan", "japan", "japanese",
        "korea", "korean", "australia", "australian", "turkey", "turkish", "qatar", "morocco", "ghana",
        "panama", "croatia", "austria", "belgium", "egypt", "iran", "iraq", "senegal", "switzerland",
        "romania", "romanian",
        "slovenia", "slovenian", "slovakia", "slovak", "czechia", "czech", "hungary", "hungarian",
        "serbia", "serbian", "bulgaria", "bulgarian", "ukraine", "ukrainian", "greece", "greek",
        "denmark", "danish", "finland", "finnish", "iceland", "icelandic", "ireland", "irish",
        "scotland", "scottish", "wales", "welsh", "chile", "chilean", "colombia", "colombian",
        "paraguay", "paraguayan", "peru", "peruvian", "venezuela", "venezuelan", "ecuador", "ecuadorian",
        "bolivia", "bolivian", "costa rica", "costa rican", "honduras", "honduran", "guatemala", "guatemalan",
        "jamaica", "jamaican", "saudi arabia", "saudi", "uae", "emirati", "china", "chinese",
        "uzbekistan", "uzbek", "algeria", "algerian", "tunisia", "tunisian", "south africa", "south african",
      ]);
      const parts = cleaned.split(/\s+/).filter(Boolean);
      while (parts.length > 1 && countryWords.has(cleanRefText(parts[parts.length - 1]))) {
        parts.pop();
      }
      return parts.join(" ").replace(/\s+,/g, ",").trim();
    };
    const displayRefs = [];
    const seenRefs = new Set();
    this.matchReferees(match).forEach((ref) => {
      const cleanName = stripCountryFromRefName(ref?.name, ref?.nationality);
      const normalisedName = cleanRefText(cleanName);
      if (!normalisedName || ["referee", "ref", "official", "main referee", "match official"].includes(normalisedName)) return;
      const parts = normalisedName.split(" ").filter(Boolean);
      const key = parts.length > 1 ? `${parts[0]}|${parts[parts.length - 1]}` : normalisedName;
      if (seenRefs.has(key)) return;
      seenRefs.add(key);
      displayRefs.push({ ...ref, name: cleanName });
    });
    const cleanOfficialRole = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const rolePriority = (role) => {
      const cleanRole = cleanOfficialRole(role);
      if (!cleanRole || cleanRole === "referee" || cleanRole === "main referee") return 1;
      if (cleanRole.includes("assistant") && !cleanRole.includes("video")) return 2;
      if (cleanRole.includes("var") || cleanRole.includes("video")) return 3;
      if (cleanRole.includes("fourth")) return 4;
      return 5;
    };

    const cleanedRefsByRole = new Map();
    displayRefs.forEach((ref) => {
      const name = String(ref?.name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!name || ["referee", "ref", "official", "main referee", "match official"].includes(name)) return;

      const cleanRole = cleanOfficialRole(ref?.type || "referee");
      const roleKey = (!cleanRole || cleanRole === "referee" || cleanRole === "main referee")
        ? "main-referee"
        : cleanRole;

      // API-Football can return the same main referee twice for secondary live
      // matches. Keep only one official per role/name so game 2 and every other
      // live match cannot show duplicate referee pills.
      const existing = cleanedRefsByRole.get(roleKey);
      if (!existing) {
        cleanedRefsByRole.set(roleKey, ref);
        return;
      }

      const existingHasNationality = Boolean(existing?.nationality);
      const nextHasNationality = Boolean(ref?.nationality);
      const existingRoleScore = rolePriority(existing?.type);
      const nextRoleScore = rolePriority(ref?.type);
      if ((nextRoleScore < existingRoleScore) || (!existingHasNationality && nextHasNationality)) {
        cleanedRefsByRole.set(roleKey, ref);
      }
    });

    const refs = Array.from(cleanedRefsByRole.values())
      .sort((a, b) => rolePriority(a?.type) - rolePriority(b?.type));

    const attendance = match?.attendance ?? match?.crowd ?? match?.spectators ?? null;
    if (!refs.length && !attendance) return "";

    const refsHtml = refs.length
      ? refs.map((ref) => {
          const roleText = String(ref.type || "").replaceAll("_", " ");
          const type = roleText && !/^referee$/i.test(roleText) ? ` <span>${this.esc(roleText)}</span>` : "";
          const nat = ref.nationality ? ` <em>${this.esc(ref.nationality)}</em>` : "";
          return `<div class="match-official-pill">👨‍⚖️ <strong>${this.esc(ref.name)}</strong>${type}${nat}</div>`;
        }).join("")
      : "";

    const attendanceHtml = attendance
      ? `<div class="match-official-pill">👥 <strong>${this.esc(Number(attendance).toLocaleString(this.locale()))}</strong><span>Attendance</span></div>`
      : "";

    return `
      <div class="match-officials-box">
        <div class="match-extra-title">Match Officials</div>
        <div class="match-officials-list">${refsHtml}${attendanceHtml}</div>
      </div>
    `;
  }

  verifiedResultDisplayEvents(match) {
    const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
    const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
    const homeScore = Number(this.getHomeScore(match));
    const awayScore = Number(this.getAwayScore(match));
    const key = `${homeKey}|${awayKey}|${homeScore}-${awayScore}`;

    const goal = (team, player, minuteText, detail = "", assist = "") => ({
      category: "goal",
      icon: detail === "Own goal" ? "OG" : (detail === "Penalty" ? "PEN" : "⚽"),
      team,
      player,
      minuteText,
      detail,
      assist,
      isOwnGoal: detail === "Own goal",
      isPenalty: detail === "Penalty",
      isMissedPenalty: false,
    });
    const card = (team, player, minuteText, detail) => ({
      category: "card",
      icon: detail === "Red Card" ? "🟥" : "🟨",
      team,
      player,
      minuteText,
      detail,
    });

    const matches = {
      "canada|bosnia herzegovina|1-1": [
        goal("Bosnia and Herzegovina", "Jovo Lukic", "21'", "Header", "Vasic"),
        goal("Canada", "Cyle Larin", "78'", "Normal Goal", "Promise David"),
      ],
      "switzerland|bosnia herzegovina|4-1": [
        goal("Switzerland", "Johan Manzambi", "75'"),
        card("Bosnia and Herzegovina", "Tarik Muharemovic", "80'", "Red Card"),
        goal("Switzerland", "Ruben Vargas", "85'"),
        goal("Switzerland", "Johan Manzambi", "90'"),
        goal("Bosnia and Herzegovina", "Ermin Mahmic", "90+3'"),
        goal("Switzerland", "Granit Xhaka", "90+6'", "Penalty"),
      ],
    };

    return matches[key] || [];
  }

  matchEventsTimelineSection(match, options = {}) {
    const includeSubs = options.includeSubs === true;
    let events = this.normalisedMatchEvents(match)
      .filter((event) => includeSubs || event.category !== "substitution");
    if (!events.length) {
      events = this.verifiedResultDisplayEvents(match)
        .filter((event) => includeSubs || event.category !== "substitution");
    }

    if (!events.length) return "";

    const rows = events.map((event) => {
      const detail = event.detail && event.detail.toLowerCase() !== event.category ? event.detail : "";
      const team = event.team ? ` <em>${this.esc(this.localizedTeamName(event.team))}</em>` : "";
      const detailParts = this.eventDetailParts(event);
      const detailsHtml = detailParts.length ? ` <small>${this.esc(detailParts.join(" / "))}</small>` : "";
      const subOn = event.category === "substitution" ? (event.playerOn || event.assist || "") : "";
      const subOff = event.category === "substitution" ? (event.playerOff || event.player || "") : "";
      const player = event.category === "substitution"
        ? (subOn || subOff || detail || event.category)
        : (event.player || detail || event.category);
      const minute = event.minuteText || "";

      return `
        <div class="match-event-row match-event-${this.esc(event.category)}">
          <span class="match-event-minute">${this.esc(minute || "-")}</span>
          <span class="match-event-icon">${this.esc(event.icon)}</span>
          <span class="match-event-main">
            <strong>${this.esc(player)}</strong>${team}
            ${detailsHtml}
          </span>
        </div>
      `;
    }).join("");

    return `
      <div class="match-events-box">
        <div class="match-extra-title">Match Events</div>
        <div class="match-events-list">${rows}</div>
      </div>
    `;
  }

  matchLiveStatisticsSection(match) {
    const stats = match?.liveStatistics || {};
    const homeStats = stats.home || {};
    const awayStats = stats.away || {};
    const pick = (direct, sideStats, key) => {
      const value = direct ?? sideStats?.[key];
      return value === null || value === undefined || value === "" ? "" : value;
    };
    const rows = [
      ["Corners", pick(match?.homeCorners, homeStats, "corners"), pick(match?.awayCorners, awayStats, "corners")],
      ["Shots on target", pick(match?.homeShotsOnGoal, homeStats, "shotsOnGoal"), pick(match?.awayShotsOnGoal, awayStats, "shotsOnGoal")],
      ["Possession", pick(match?.homePossession, homeStats, "possession"), pick(match?.awayPossession, awayStats, "possession")],
      ["Fouls", pick(match?.homeFouls, homeStats, "fouls"), pick(match?.awayFouls, awayStats, "fouls")],
      ["Offsides", pick(match?.homeOffsides, homeStats, "offsides"), pick(match?.awayOffsides, awayStats, "offsides")],
    ].filter((row) => row[1] !== "" || row[2] !== "");

    if (!rows.length) {
      return `
        <div class="live-premium-card live-premium-stats-card">
          <div class="live-premium-card-title">📊 Live Stats</div>
          <div class="wc-empty">Waiting for live stats feed</div>
        </div>
      `;
    }

    return `
      <div class="match-events-box match-live-statistics-box">
        <div class="match-extra-title">Live Match Stats</div>
        <div class="match-events-list">
          ${rows.map(([label, home, away]) => `
            <div class="match-event-row match-event-stat">
              <span class="match-event-minute">${this.esc(home || "-")}</span>
              <span class="match-event-icon">STAT</span>
              <span class="match-event-main">
                <strong>${this.esc(label)}</strong>
                <small>Away: ${this.esc(away || "-")}</small>
              </span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  matchWeatherSection(match) {
    const weather = match?.matchWeather || match?.weather || {};
    if (!weather || typeof weather !== "object" || !Object.keys(weather).length) return "";

    const temp = weather.temperature !== null && weather.temperature !== undefined && weather.temperature !== ""
      ? `${weather.temperature}${weather.temperatureUnit || ""}`
      : "";
    const condition = weather.condition ? String(weather.condition).replaceAll("_", " ") : "";
    const locationLabel = [weather.stadium, weather.city].filter(Boolean).join(" • ");
    const wind = weather.windSpeed !== null && weather.windSpeed !== undefined && weather.windSpeed !== ""
      ? `${weather.windSpeed}${weather.windSpeedUnit ? ` ${weather.windSpeedUnit}` : ""}`
      : "";
    const humidity = weather.humidity !== null && weather.humidity !== undefined && weather.humidity !== "" ? `${weather.humidity}%` : "";
    const cloud = weather.cloudCoverage !== null && weather.cloudCoverage !== undefined && weather.cloudCoverage !== "" ? `${weather.cloudCoverage}%` : "";
    const uv = weather.uvIndex !== null && weather.uvIndex !== undefined && weather.uvIndex !== "" ? `${weather.uvIndex}` : "";

    if (!temp && !condition && !wind && !humidity && !cloud && !uv) return "";

    const metric = (icon, value, label) => value
      ? `<div class="live-weather-metric"><strong>${this.esc(icon)} ${this.esc(value)}</strong><span>${this.esc(label)}</span></div>`
      : "";

    return `
      <div class="live-premium-card match-weather-box live-weather-compact-card">
        <div class="live-weather-head">
          <div>
            <div class="live-premium-card-title">🌤 ${this.esc(this.t("stadiumWeather"))}</div>
            ${locationLabel ? `<small>${this.esc(locationLabel)}</small>` : ""}
          </div>
          ${temp ? `<strong class="live-weather-temp">${this.esc(temp)}</strong>` : ""}
        </div>
        <div class="live-weather-main">
          <div class="live-weather-condition">
            <span>🌥</span>
            <strong>${this.esc(condition || this.t("weather"))}</strong>
          </div>
          <div class="live-weather-metrics">
            ${metric("💨", wind, this.t("wind"))}
            ${metric("💧", humidity, this.t("humidity"))}
            ${metric("☁", cloud, this.t("clouds"))}
            ${metric("☀", uv, "UV")}
          </div>
        </div>
      </div>
    `;
  }

  matchExtraLiveDataSection(match) {
    const eventsHtml = this.matchEventsTimelineSection(match, { includeSubs: true });
    const statisticsHtml = this.matchLiveStatisticsSection(match);
    const weatherHtml = this.matchWeatherSection(match);
    const officialsHtml = this.matchOfficialsSection(match);
    if (!eventsHtml && !statisticsHtml && !weatherHtml && !officialsHtml) return "";

    return `
      <div class="match-extra-live-data">
        ${eventsHtml}
        ${statisticsHtml}
        ${weatherHtml}
        ${officialsHtml}
      </div>
    `;
  }

  matchResultsFullDetailsSection(match) {
    // Results page should show every stored event from the API/GitHub feed:
    // goals, own goals, assists, cards, substitutions, VAR and officials.
    const eventsHtml = this.matchEventsTimelineSection(match, { includeSubs: true });
    const officialsHtml = this.matchOfficialsSection(match);
    if (!eventsHtml && !officialsHtml) return "";

    return `
      <div class="match-extra-live-data match-results-full-details">
        ${eventsHtml}
        ${officialsHtml}
      </div>
    `;
  }


  matchScorersSection(homeTeam, awayTeam, match = null) {
    const verifiedDisplayGoals = this.verifiedResultDisplayEvents(match).filter((event) => event.category === "goal");
    const normalisedGoals = verifiedDisplayGoals.length
      ? verifiedDisplayGoals
      : this.normalisedMatchEvents(match).filter((event) => event.category === "goal");
    const teamEvents = (team) => {
      const teamKey = this.fixtureTeamKey(team);
      return normalisedGoals
        .filter((event) => this.fixtureTeamKey(event.team) === teamKey)
        .map((event) => ({
          name: event.player,
          minute: event.minute ?? event.elapsed ?? event.time?.elapsed ?? null,
          extra: event.extra ?? event.time?.extra ?? null,
          timer: event.timer || "",
          displayMinute: event.minuteText,
          isOwnGoal: event.isOwnGoal,
          isPenalty: event.isPenalty,
          isMissedPenalty: event.isMissedPenalty,
          detail: event.detail,
          method: this.eventGoalMethod(event),
          assist: event.assist,
          source: event.source || "",
        }))
        .filter((event) => event.name && String(event.name).toLowerCase() !== "goal");
    };

    const homeEvents = teamEvents(homeTeam);
    const awayEvents = teamEvents(awayTeam);
    const hasGoalEvents = homeEvents.length || awayEvents.length;

    if (!hasGoalEvents) return "";

    const namesHtml = (items) => items.length
      ? items.map((item) => {
          const name = item.name;
          const minuteText = item.displayMinute ? ` ${item.displayMinute}` : "";
          const detailText = item.isOwnGoal ? " (OG)" : (item.isPenalty ? " (PEN)" : "");
          const icon = item.isOwnGoal ? "OG" : (item.isPenalty ? "PEN" : "⚽");
          const visibleParts = [
            item.method && item.method !== "Own goal" && item.method !== "Penalty" ? item.method : "",
            item.assist ? `Assist: ${item.assist}` : "",
          ].filter(Boolean);
          const detailHtml = visibleParts.length ? ` - ${this.esc(visibleParts.join(" / "))}` : "";
          const titleParts = [item.detail, item.assist ? `Assist: ${item.assist}` : "", item.timer].filter(Boolean);
          const title = titleParts.length ? ` title="${this.esc(titleParts.join(" • "))}"` : "";
          return `<span class="match-scorer-pill"${title}>${icon} ${this.esc(name)}${this.esc(minuteText)}${this.esc(detailText)}${detailHtml}</span>`;
        }).join("")
      : `<span class="match-scorer-empty">-</span>`;

    return `
      <div class="match-scorers-box">
        <div class="match-scorers-title">Scorers & Goal Times</div>
        <div class="match-scorers-grid">
          <div class="match-scorers-team">
            <strong>${this.esc(this.localizedTeamName(homeTeam))}</strong>
            <div class="match-scorers-names">${namesHtml(homeEvents)}</div>
          </div>
          <div class="match-scorers-team">
            <strong>${this.esc(this.localizedTeamName(awayTeam))}</strong>
            <div class="match-scorers-names">${namesHtml(awayEvents)}</div>
          </div>
        </div>
      </div>
    `;
  }

  liveMatchDiscipline(match) {
    const cards = this.normalisedMatchEvents(match).filter((event) => event.category === "card");
    const teamCount = (team, colour) => {
      const key = this.fixtureTeamKey(team);
      return cards.filter((event) => {
        const sameTeam = this.fixtureTeamKey(event.team) === key;
        const detail = `${event.icon || ""} ${event.detail || ""}`.toLowerCase();
        const isRed = detail.includes("🟥") || detail.includes("red");
        const isYellow = detail.includes("🟨") || detail.includes("yellow") || !isRed;
        return sameTeam && (colour === "red" ? isRed : isYellow);
      }).length;
    };

    const homeTeam = this.getHomeTeam(match);
    const awayTeam = this.getAwayTeam(match);
    return {
      homeYellow: teamCount(homeTeam, "yellow"),
      homeRed: teamCount(homeTeam, "red"),
      awayYellow: teamCount(awayTeam, "yellow"),
      awayRed: teamCount(awayTeam, "red"),
      total: cards.length,
    };
  }

  liveStatValue(match, side, keys) {
    const stats = match?.liveStatistics || match?.statistics || match?.stats || {};
    const sideStats = side === "home" ? (stats.home || stats.homeTeam || {}) : (stats.away || stats.awayTeam || {});
    const directPrefixes = side === "home" ? ["home", "homeTeam"] : ["away", "awayTeam"];

    for (const key of keys) {
      for (const prefix of directPrefixes) {
        const directKey = `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (match?.[directKey] !== null && match?.[directKey] !== undefined && match?.[directKey] !== "") return match[directKey];
      }
      if (sideStats?.[key] !== null && sideStats?.[key] !== undefined && sideStats?.[key] !== "") return sideStats[key];
    }
    return "";
  }

  livePossessionPercent(value) {
    if (value === null || value === undefined || value === "") return null;
    const match = String(value).match(/\d+(?:\.\d+)?/);
    if (!match) return null;
    const num = Number(match[0]);
    return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : null;
  }

  livePremiumStatsBars(match) {
    const rows = [
      { label: "Possession", keys: ["possession", "ballPossession"] },
      { label: "Shots", keys: ["shots", "totalShots", "shotsTotal"] },
      { label: "On Target", keys: ["shotsOnGoal", "shotsOnTarget", "onTarget"] },
      { label: "Corners", keys: ["corners", "cornerKicks"] },
      { label: "Fouls", keys: ["fouls", "foulsCommitted"] },
    ].map((row) => {
      const home = this.liveStatValue(match, "home", row.keys);
      const away = this.liveStatValue(match, "away", row.keys);
      return { ...row, home, away };
    }).filter((row) => row.home !== "" || row.away !== "");

    if (!rows.length) {
      return `
      <div class="live-premium-card live-premium-stats-card">
        <div class="live-premium-card-title">📊 Live Stats</div>
        <div class="wc-empty">Waiting for live stats feed</div>
      </div>
    `;
    }

    return `
      <div class="live-premium-card live-premium-stats-card">
        <div class="live-premium-card-title">📊 Live Stats</div>
        <div class="live-stat-bars">
          ${rows.map((row) => {
            const homeNum = this.livePossessionPercent(row.home);
            const awayNum = this.livePossessionPercent(row.away);
            const total = homeNum !== null && awayNum !== null ? Math.max(homeNum + awayNum, 1) : 0;
            const left = total ? Math.round((homeNum / total) * 100) : 50;
            const right = total ? Math.round((awayNum / total) * 100) : 50;
            return `
              <div class="live-stat-row">
                <span>${this.esc(row.home || "-")}</span>
                <div class="live-stat-bar-wrap">
                  <small>${this.esc(row.label)}</small>
                  <div class="live-stat-bar"><i style="width:${left}%"></i><b style="width:${right}%"></b></div>
                </div>
                <span>${this.esc(row.away || "-")}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  livePremiumTimeline(match) {
    const events = this.normalisedMatchEvents(match).slice(-12);
    if (!events.length) {
      return `
        <div class="live-premium-card live-premium-timeline-card">
          <div class="live-premium-card-title">⚡ Live Timeline</div>
          <div class="wc-empty">Waiting for goals, cards, subs and VAR</div>
        </div>
      `;
    }
    return `
      <div class="live-premium-card live-premium-timeline-card">
        <div class="live-premium-card-title">⚡ Live Timeline</div>
        <div class="live-premium-timeline">
          ${events.map((event) => `
            <div class="live-timeline-row live-timeline-${this.esc(event.category)}">
              <span>${this.esc(event.minuteText || "-")}</span>
              <b>${this.esc(event.icon || "•")}</b>
              <strong>${this.esc((event.category === "substitution" ? (event.playerOn || event.playerOff || event.player) : "") || event.player || event.detail || event.category)}</strong>
              ${(() => {
                const line = [
                  event.team ? this.localizedTeamName(event.team) : "",
                  ...this.eventDetailParts(event),
                ].filter(Boolean).join(" / ");
                return line ? `<em>${this.esc(line)}</em>` : "";
              })()}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  livePremiumMatchCard(match, index = 0) {
    const homeTeam = this.getHomeTeam(match);
    const awayTeam = this.getAwayTeam(match);
    const homeScore = this.getHomeScore(match);
    const awayScore = this.getAwayScore(match);
    const stage = String(match.group || this.stageLabel(match.stage) || "").replaceAll("_", " ");
    const venueInfo = this.fixtureVenueInfo(match);
    const date = this.formatDate(match.utcDate || match.date);
    const localTime = this.fixtureTime(match);
    const discipline = this.liveMatchDiscipline(match);
    const clock = this.footballClockHtml(match);
    const scorers = this.matchScorersSection(homeTeam, awayTeam, match);
    const stats = this.livePremiumStatsBars(match);
    const timeline = this.livePremiumTimeline(match);
    const weather = this.matchWeatherSection(match);
    const officials = this.matchOfficialsSection(match);

    return `
      <div class="live-premium-match ${index === 0 ? "live-premium-main" : ""}">
        <div class="live-premium-topline">
          <span class="live-on-air">● LIVE</span>
          ${stage ? `<span>${this.esc(stage)}</span>` : ""}
          ${venueInfo?.name ? `<span>🏟 ${this.esc(venueInfo.name)}</span>` : ""}
          ${localTime ? `<span class="live-local-time">🕒 Local ${this.esc(localTime)}</span>` : ""}
          <span>${this.esc(date)}</span>
        </div>

        <div class="live-premium-scoreboard">
          <div class="live-premium-team">
            ${this.flag(homeTeam, true)}
            <strong>${this.esc(this.localizedTeamName(homeTeam))}</strong>
            <small>🟨 ${discipline.homeYellow} &nbsp; 🟥 ${discipline.homeRed}</small>
          </div>

          <div class="live-premium-score-centre">
            <div class="live-premium-score">${this.esc(homeScore)} - ${this.esc(awayScore)}</div>
            <div class="live-premium-clock">${clock}</div>
            <div class="live-premium-status">${this.statusHtml(match)}</div>
          </div>

          <div class="live-premium-team">
            ${this.flag(awayTeam, true)}
            <strong>${this.esc(this.localizedTeamName(awayTeam))}</strong>
            <small>🟨 ${discipline.awayYellow} &nbsp; 🟥 ${discipline.awayRed}</small>
          </div>
        </div>

        ${scorers ? `<div class="live-premium-scorers">${scorers}</div>` : ""}

        <div class="live-premium-lower-grid">
          ${stats}
          ${timeline}
          <div class="live-premium-card live-premium-discipline-card">
            <div class="live-premium-card-title">🟨 Discipline</div>
            <div class="live-discipline-grid">
              <div><strong>${discipline.homeYellow}</strong><span>${this.esc(this.localizedTeamName(homeTeam))} yellows</span></div>
              <div><strong>${discipline.homeRed}</strong><span>${this.esc(this.localizedTeamName(homeTeam))} reds</span></div>
              <div><strong>${discipline.awayYellow}</strong><span>${this.esc(this.localizedTeamName(awayTeam))} yellows</span></div>
              <div><strong>${discipline.awayRed}</strong><span>${this.esc(this.localizedTeamName(awayTeam))} reds</span></div>
            </div>
          </div>
          ${officials}
          ${weather}
        </div>
      </div>
    `;
  }

  livePage() {
    const live = (this._data.live || []).filter((match) => this.isLiveMatch(match));

    if (!live.length) {
      return `
        <div class="live-premium-page">
          <div class="wc-card live-premium-hero live-premium-empty-hero">
            <div>
              <div class="live-kicker">⚽ Matchday Control Room</div>
              <div class="wc-section-title">${this.t("live")}</div>
              <p>${this.t("manualTimerNotice")}</p>
            </div>
            <div class="live-premium-count"><strong>0</strong><span>${this.t("liveNow")}</span></div>
          </div>
          <div class="wc-card"><div class="wc-empty">${this.t("noLiveMatches")}</div></div>
        </div>
      `;
    }

    const totalCards = live.reduce((sum, match) => sum + this.liveMatchDiscipline(match).total, 0);
    const totalGoals = live.reduce((sum, match) => sum + this.normalisedMatchEvents(match).filter((event) => event.category === "goal").length, 0);
    const totalEvents = live.reduce((sum, match) => sum + this.normalisedMatchEvents(match).length, 0);

    return `
      <div class="live-premium-page">
        <div class="wc-card live-premium-hero">
          <div>
            <div class="live-kicker">⚽ Matchday Control Room</div>
            <div class="wc-section-title">${this.t("live")} <span class="wc-badge wc-live">${this.t("liveStatus")}</span></div>
            <p>${this.t("manualTimerNotice")}</p>
          </div>
          <div class="live-premium-hero-stats">
            <div><strong>${live.length}</strong><span>${this.t("liveNow")}</span></div>
            <div><strong>${totalGoals}</strong><span>Goals</span></div>
            <div><strong>${totalCards}</strong><span>Cards</span></div>
            <div><strong>${totalEvents}</strong><span>Events</span></div>
          </div>
        </div>

        <div class="live-premium-feed ${live.length > 1 ? "has-multiple-live" : ""}">
          ${live.map((m, index) => this.livePremiumMatchCard(m, index)).join("")}
        </div>
      </div>
    `;
  }

  resultsPage() {
    const fixtures = this._data.fixtures || [];
    const resultsFeed = this._data.results || [];
    // Results come from the dedicated backend websocket feed.
    // Fallback keeps older installs working if the results endpoint is unavailable.
    const resultsSource = resultsFeed.length ? resultsFeed : fixtures;

    const results = resultsSource
      .filter(m => this.isFinishedMatch(m))
      .sort((a, b) => {
        const aTime = new Date(a.utcDate || a.date || 0).getTime();
        const bTime = new Date(b.utcDate || b.date || 0).getTime();
        return bTime - aTime;
      });

    if (!results.length) {
      return `
        <div class="wc-card results-page-card">
          <div class="results-header">
            <div>
              <div class="wc-section-title">🏆 ${this.t("results")}</div>
              <div class="results-subtitle">${this.t("noResultsLoaded")}</div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="wc-card results-page-card">
        <div class="results-header">
          <div>
            <div class="wc-section-title">🏆 Match Results</div>
            <div class="results-subtitle">Completed World Cup 2026 matches</div>
          </div>
          <div class="results-count-pill">${results.length} ${this.t("played")}</div>
        </div>

        <div class="results-basic-list">
          ${results.map(m => this.resultBasicRow(m)).join("")}
        </div>

        <div class="results-footnote">ⓘ All times shown in your local time • FT = Full Time</div>
      </div>
    `;
  }

  apiResultsTestPage() {
    const results = (this._data.apiResultsTest || [])
      .filter(m => this.isFinishedMatch(m))
      .sort((a, b) => {
        const aTime = new Date(a.utcDate || a.date || 0).getTime();
        const bTime = new Date(b.utcDate || b.date || 0).getTime();
        return bTime - aTime;
      });

    if (!results.length) {
      return `
        <div class="wc-card results-page-card">
          <div class="results-header">
            <div>
              <div class="wc-section-title">🧪 API Results Test</div>
              <div class="results-subtitle">No finished matches came back from the Home Assistant API feed yet.</div>
            </div>
          </div>
          <div class="wc-empty">This page ignores GitHub and goal_events.json, so it shows only what the backend/API currently provides.</div>
        </div>
      `;
    }

    return `
      <div class="wc-card results-page-card">
        <div class="results-header">
          <div>
            <div class="wc-section-title">🧪 API Results Test</div>
            <div class="results-subtitle">Direct backend/API finished matches only — no GitHub, no goal_events fallback</div>
          </div>
          <div class="results-count-pill">${results.length} API FT</div>
        </div>

        <div class="wc-live-sync-notice">ℹ️ If Scotland appears here, the API/backend has it and the GitHub export is the problem. If Scotland is missing here too, the backend is no longer receiving it from the API.</div>

        <div class="results-basic-list">
          ${results.map(m => this.resultBasicRow(m)).join("")}
        </div>
      </div>
    `;
  }

  resultBasicRow(m) {
    const homeTeam = this.getHomeTeam(m);
    const awayTeam = this.getAwayTeam(m);
    const homeScore = this.getHomeScore(m);
    const awayScore = this.getAwayScore(m);
    const stage = String(m.group || this.stageLabel(m.stage) || "").replaceAll("_", " ");
    const venueInfo = this.fixtureVenueInfo(m);
    const venueName = venueInfo?.name || m.venue || m.stadium || m.venueName || "";
    const status = this.statusLabel(m.status, m) || "FT";
    const date = this.resultDateLabel(m);

    return `
      <div class="result-basic-row">
        <div class="result-basic-meta">
          <strong>${this.esc(date)}</strong>
          ${stage ? `<span>${this.esc(stage)}</span>` : ""}
          ${venueName ? `<em>🏟 ${this.esc(venueName)}</em>` : ""}
        </div>

        <div class="result-basic-team result-basic-home">
          <span>${this.esc(this.localizedTeamName(homeTeam))}</span>
          ${this.flag(homeTeam, true)}
        </div>

        <div class="result-basic-score-wrap">
          <div class="result-basic-score">${this.esc(homeScore)} - ${this.esc(awayScore)}</div>
          <small>${this.esc(status)}</small>
        </div>

        <div class="result-basic-team result-basic-away">
          ${this.flag(awayTeam, true)}
          <span>${this.esc(this.localizedTeamName(awayTeam))}</span>
        </div>

        <div class="result-basic-status">COMPLETED</div>

        ${this.matchScorersSection(homeTeam, awayTeam, m)}
        ${this.matchResultsFullDetailsSection(m)}
      </div>
    `;
  }

  resultDateLabel(match) {
    const value = match.utcDate || match.date;
    if (!value) return this.t("unknown");

    try {
      return new Date(value).toLocaleDateString(this.locale(), {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).toUpperCase();
    } catch {
      return String(value).slice(0, 10).toUpperCase();
    }
  }

  isFinishedMatch(match) {
    const status = String(match?.status || match?.matchStatus || "").toUpperCase().trim();
    const finishedStatuses = ["FINISHED", "FT", "AET", "PEN", "AWARDED"];
    const liveOrUpcomingStatuses = ["IN_PLAY", "LIVE", "PAUSED", "1H", "2H", "HT", "TIMED", "SCHEDULED", "POSTPONED", "SUSPENDED"];

    if (finishedStatuses.includes(status)) return true;
    if (liveOrUpcomingStatuses.includes(status)) return false;

    const homeScore = this.scoreValue(match, "home");
    const awayScore = this.scoreValue(match, "away");
    return homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined;
  }

  scoreValue(match, side) {
    const score = match?.score || {};
    const fullTime = score?.fullTime || score?.full_time || {};

    if (fullTime && fullTime[side] !== undefined && fullTime[side] !== null) return fullTime[side];
    if (score && score[side] !== undefined && score[side] !== null) return score[side];

    const keys = side === "home"
      ? ["homeScore", "home_score", "scoreHome", "homeGoals"]
      : ["awayScore", "away_score", "scoreAway", "awayGoals"];

    for (const key of keys) {
      if (match && match[key] !== undefined && match[key] !== null) return match[key];
    }

    return null;
  }

  fixturesPage() {
    // Keep Fixtures clean: upcoming/live only. Finished matches stay on Results.
    const fixtures = (this._data.fixtures || []).filter((match) => !this.isFinishedMatch(match));

    if (!fixtures.length) {
      return `
        <div class="wc-card fixtures-page-card">
          <div class="fixtures-hero">
            <div>
              <div class="wc-section-title">${this.t("fixturesResults")}</div>
              <div class="fixtures-subtitle">${this.t("noFixtures")}</div>
            </div>
          </div>
        </div>
      `;
    }

    const sortedFixtures = [...fixtures].sort((a, b) => {
      const aTime = new Date(a.utcDate || a.date || 0).getTime();
      const bTime = new Date(b.utcDate || b.date || 0).getTime();
      return aTime - bTime;
    });

    const playedCount = sortedFixtures.filter(m => ["FINISHED", "FT", "AET", "PEN"].includes(m.status)).length;
    const liveCount = sortedFixtures.filter(m => this.isLiveMatch(m)).length;
    const remainingCount = Math.max(sortedFixtures.length - playedCount, 0);
    const nextMatch = sortedFixtures.find(m => ["TIMED", "SCHEDULED"].includes(m.status));
    const dayCount = new Set(sortedFixtures.map(m => this.fixtureDateKey(m))).size;

    const visibleMatchCount = Math.min(this._fixturesVisibleMatches || 20, sortedFixtures.length);
    const visibleFixtures = sortedFixtures.slice(0, visibleMatchCount);
    const hiddenMatchCount = Math.max(sortedFixtures.length - visibleMatchCount, 0);

    const grouped = visibleFixtures.reduce((days, match) => {
      const key = this.fixtureDateKey(match);
      if (!days[key]) {
        days[key] = [];
      }
      days[key].push(match);
      return days;
    }, {});
    const groupedEntries = Object.entries(grouped);

    return `
      <div class="fixtures-page-card wc-card">
        <div class="fixtures-hero">
          <div class="fixtures-title-wrap">
            <div class="fixtures-title-row">
              <div class="wc-section-title">${this.t("fixturesResults")}</div>
              ${liveCount ? `<span class="wc-badge wc-live">${liveCount} ${this.t("liveStatus")}</span>` : ""}
            </div>
            <div class="fixtures-subtitle">${this.t("fixturesSubtitle")}</div>
          </div>
          <div class="fixtures-summary-grid">
            <div class="fixtures-summary-box"><strong>${sortedFixtures.length}</strong><span>${this.t("loaded")}</span></div>
            <div class="fixtures-summary-box"><strong>${playedCount}</strong><span>${this.t("played")}</span></div>
            <div class="fixtures-summary-box"><strong>${remainingCount}</strong><span>${this.t("remaining")}</span></div>
            <div class="fixtures-summary-box"><strong>${liveCount}</strong><span>${this.t("liveNow")}</span></div>
            <div class="fixtures-summary-box"><strong>${dayCount}</strong><span>${this.t("days")}</span></div>
          </div>
        </div>

        ${nextMatch ? `
          <div class="fixtures-next-strip">
            <span>${this.t("nextMatch")}</span>
            <strong>${this.esc(this.localizedTeamName(this.getHomeTeam(nextMatch)))} ${this.t("versus")} ${this.esc(this.localizedTeamName(this.getAwayTeam(nextMatch)))}</strong>
            <em>${this.esc(this.formatDate(nextMatch.utcDate || nextMatch.date))}</em>
          </div>
        ` : ""}

        <div class="fixtures-days">
          ${groupedEntries.map(([key, matches]) => `
            <div class="fixtures-day-block">
              <div class="fixtures-day-heading">
                <span>${this.esc(this.fixtureDayTitle(matches[0]))}</span>
                <small>${matches.length} ${this.t("fixtures")}</small>
              </div>
              <div class="fixtures-card-grid">
                ${matches.map(m => this.fixtureCard(m)).join("")}
              </div>
            </div>
          `).join("")}
          ${hiddenMatchCount ? `
            <div class="fixtures-load-more-wrap">
              <button class="overview-action-button fixtures-show-more-button" type="button">
                + ${Math.min(20, hiddenMatchCount)} ${this.t("fixtures")}
              </button>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  fixtureDateKey(match) {
    const value = match.utcDate || match.date;
    if (!value) return "unknown";

    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date(value));

      const year = parts.find((part) => part.type === "year")?.value;
      const month = parts.find((part) => part.type === "month")?.value;
      const day = parts.find((part) => part.type === "day")?.value;

      if (year && month && day) {
        return `${year}-${month}-${day}`;
      }

      return new Date(value).toLocaleDateString("en-CA");
    } catch {
      return String(value).slice(0, 10) || "unknown";
    }
  }

  fixtureDayTitle(match) {
    const value = match.utcDate || match.date;

    if (!value) {
      return this.t("unknown");
    }

    try {
      return new Date(value).toLocaleDateString(this.locale(), {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return value;
    }
  }

  fixtureDateLabel(match) {
    const value = match.utcDate || match.date;

    if (!value) {
      return "";
    }

    try {
      return new Date(value).toLocaleDateString(this.locale(), {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });
    } catch {
      return String(value).slice(0, 10);
    }
  }

  fixtureTime(match) {
    const value = match.utcDate || match.date;

    if (!value) {
      return this.t("tbc");
    }

    try {
      return new Date(value).toLocaleTimeString(this.locale(), {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return value;
    }
  }


  completeOfficialFixtures(fixtures = []) {
    const list = Array.isArray(fixtures) ? [...fixtures] : [];

    const hasMatch72 = list.some((match) => {
      const number = this.fixtureMatchNumber(match);
      const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
      const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
      const pair = `${homeKey}|${awayKey}`;
      const reversePair = `${awayKey}|${homeKey}`;
      return number === 72 || pair === "congo dr|uzbekistan" || reversePair === "congo dr|uzbekistan";
    });

    if (!hasMatch72) {
      list.push({
        id: "wc2026-local-match-72",
        matchNumber: 72,
        fifaMatchNumber: 72,
        group: "Group K",
        stage: "GROUP_STAGE",
        status: "TIMED",
        utcDate: "2026-06-27T23:30:00Z",
        date: "2026-06-27T23:30:00Z",
        homeTeam: { name: "Congo DR", tla: "COD" },
        awayTeam: { name: "Uzbekistan", tla: "UZB" },
        score: { fullTime: { home: null, away: null } },
        venue: "Atlanta Stadium",
        stadium: "Atlanta Stadium",
        venueName: "Atlanta Stadium",
        city: "Atlanta",
        venueCity: "Atlanta",
        venueCountry: "USA",
        source: "local_official_fixture_fallback",
      });
    }

    return list;
  }


  normaliseFixtureText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/republic/g, "")
      .replace(/bosnia\s*(and|&)\s*herzegovina/g, "bosnia herzegovina")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  fixtureTeamKey(team) {
    const name = this.teamLabel(team);
    const key = this.normaliseFixtureText(name)
      .replace(/^south korea$/, "korea")
      .replace(/^korea republic$/, "korea")
      .replace(/^korea$/, "korea")
      .replace(/^usa$/, "united states")
      .replace(/^u s a$/, "united states")
      .replace(/^turkiye$/, "turkey")
      .replace(/^cote d ivoire$/, "ivory coast")
      .replace(/^cabo verde$/, "cape verde")
      .replace(/^cape verde islands$/, "cape verde");

    const aliases = {
      "democratic of congo": "congo dr",
      "democratic republic of congo": "congo dr",
      "democratic republic congo": "congo dr",
      "dr congo": "congo dr",
      "d r congo": "congo dr",
      "drc": "congo dr",
      "cod": "congo dr",
      "congo kinshasa": "congo dr",
      "uzb": "uzbekistan",
    };

    return aliases[key] || key;
  }

  fixturePairKey(homeTeam, awayTeam) {
    return `${this.fixtureTeamKey(homeTeam)}|${this.fixtureTeamKey(awayTeam)}`;
  }

  officialFixtureVenueLookup() {
    return {
      "mexico|south africa": "Mexico City Stadium",
      "korea|czechia": "Guadalajara Stadium",
      "canada|bosnia herzegovina": "Toronto Stadium",
      "united states|paraguay": "Los Angeles Stadium",
      "qatar|switzerland": "San Francisco Bay Area Stadium",
      "haiti|scotland": "Boston Stadium",
      "brazil|morocco": "New York New Jersey Stadium",
      "australia|turkey": "Vancouver Stadium",
      "germany|curacao": "Houston Stadium",
      "netherlands|japan": "Dallas Stadium",
      "tunisia|sweden": "Monterrey Stadium",
      "ivory coast|ecuador": "Philadelphia Stadium",
      "saudi arabia|uruguay": "Miami Stadium",
      "spain|cape verde": "Atlanta Stadium",
      "belgium|egypt": "Seattle Stadium",
      "iran|new zealand": "Los Angeles Stadium",
      "austria|jordan": "San Francisco Bay Area Stadium",
      "france|senegal": "New York New Jersey Stadium",
      "norway|iraq": "Boston Stadium",
      "argentina|algeria": "Kansas City Stadium",
      "portugal|congo dr": "Houston Stadium",
      "england|croatia": "Dallas Stadium",
      "ghana|panama": "Toronto Stadium",
      "uzbekistan|colombia": "Mexico City Stadium",
      "canada|qatar": "Vancouver Stadium",
      "south africa|czechia": "Atlanta Stadium",
      "switzerland|bosnia herzegovina": "Los Angeles Stadium",
      "mexico|korea": "Guadalajara Stadium",
      "scotland|morocco": "Boston Stadium",
      "brazil|haiti": "Philadelphia Stadium",
      "united states|australia": "Seattle Stadium",
      "paraguay|turkey": "San Francisco Bay Area Stadium",
      "germany|ivory coast": "Toronto Stadium",
      "tunisia|japan": "Monterrey Stadium",
      "netherlands|sweden": "Houston Stadium",
      "ecuador|curacao": "Kansas City Stadium",
      "new zealand|egypt": "Vancouver Stadium",
      "spain|saudi arabia": "Atlanta Stadium",
      "belgium|iran": "Los Angeles Stadium",
      "uruguay|cape verde": "Miami Stadium",
      "france|iraq": "Philadelphia Stadium",
      "norway|senegal": "New York New Jersey Stadium",
      "jordan|algeria": "San Francisco Bay Area Stadium",
      "argentina|austria": "Dallas Stadium",
      "portugal|uzbekistan": "Houston Stadium",
      "england|ghana": "Boston Stadium",
      "panama|croatia": "Toronto Stadium",
      "colombia|congo dr": "Guadalajara Stadium",
      "canada|switzerland": "Vancouver Stadium",
      "qatar|bosnia herzegovina": "Seattle Stadium",
      "morocco|haiti": "Atlanta Stadium",
      "scotland|brazil": "Miami Stadium",
      "mexico|czechia": "Mexico City Stadium",
      "korea|south africa": "Monterrey Stadium",
      "ecuador|germany": "New York New Jersey Stadium",
      "curacao|ivory coast": "Philadelphia Stadium",
      "tunisia|netherlands": "Kansas City Stadium",
      "japan|sweden": "Dallas Stadium",
      "united states|turkey": "Los Angeles Stadium",
      "paraguay|australia": "San Francisco Bay Area Stadium",
      "senegal|iraq": "Toronto Stadium",
      "norway|france": "Boston Stadium",
      "cape verde|saudi arabia": "Houston Stadium",
      "uruguay|spain": "Guadalajara Stadium",
      "new zealand|belgium": "Vancouver Stadium",
      "egypt|iran": "Seattle Stadium",
      "panama|england": "New York New Jersey Stadium",
      "croatia|ghana": "Philadelphia Stadium",
      "colombia|portugal": "Miami Stadium",
      "uzbekistan|congo dr": "Atlanta Stadium",
      "congo dr|uzbekistan": "Atlanta Stadium",
      "democratic of congo|uzbekistan": "Atlanta Stadium",
      "democratic republic of congo|uzbekistan": "Atlanta Stadium",
      "dr congo|uzbekistan": "Atlanta Stadium",
      "cod|uzbekistan": "Atlanta Stadium",
      "uzbekistan|democratic of congo": "Atlanta Stadium",
      "uzbekistan|democratic republic of congo": "Atlanta Stadium",
      "uzbekistan|dr congo": "Atlanta Stadium",
      "uzbekistan|cod": "Atlanta Stadium",
      "jordan|argentina": "Dallas Stadium",
      "algeria|austria": "Kansas City Stadium",
    };
  }


  fixtureMatchNumber(match) {
    const value = match?.matchNumber ?? match?.match_number ?? match?.fifaMatchNumber ?? match?.fifa_match_number ?? match?.number ?? match?.matchNo ?? match?.match_no ?? "";
    const parsed = Number(String(value).replace(/[^0-9]/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  officialFixtureVenueByMatchNumber() {
    return {
      1: "Mexico City Stadium",
      2: "Guadalajara Stadium",
      3: "Toronto Stadium",
      4: "Los Angeles Stadium",
      5: "Boston Stadium",
      6: "Vancouver Stadium",
      7: "New York New Jersey Stadium",
      8: "San Francisco Bay Area Stadium",
      9: "Philadelphia Stadium",
      10: "Houston Stadium",
      11: "Dallas Stadium",
      12: "Monterrey Stadium",
      13: "Miami Stadium",
      14: "Atlanta Stadium",
      15: "Los Angeles Stadium",
      16: "Seattle Stadium",
      17: "New York New Jersey Stadium",
      18: "Boston Stadium",
      19: "Kansas City Stadium",
      20: "San Francisco Bay Area Stadium",
      21: "Toronto Stadium",
      22: "Dallas Stadium",
      23: "Houston Stadium",
      24: "Mexico City Stadium",
      25: "Atlanta Stadium",
      26: "Los Angeles Stadium",
      27: "Vancouver Stadium",
      28: "Guadalajara Stadium",
      29: "Philadelphia Stadium",
      30: "Boston Stadium",
      31: "San Francisco Bay Area Stadium",
      32: "Seattle Stadium",
      33: "Toronto Stadium",
      34: "Kansas City Stadium",
      35: "Houston Stadium",
      36: "Monterrey Stadium",
      37: "Miami Stadium",
      38: "Atlanta Stadium",
      39: "Los Angeles Stadium",
      40: "Vancouver Stadium",
      41: "New York New Jersey Stadium",
      42: "Philadelphia Stadium",
      43: "Dallas Stadium",
      44: "San Francisco Bay Area Stadium",
      45: "Boston Stadium",
      46: "Toronto Stadium",
      47: "Houston Stadium",
      48: "Guadalajara Stadium",
      49: "Miami Stadium",
      50: "Atlanta Stadium",
      51: "Vancouver Stadium",
      52: "Seattle Stadium",
      53: "Mexico City Stadium",
      54: "Monterrey Stadium",
      55: "Philadelphia Stadium",
      56: "New York New Jersey Stadium",
      57: "Dallas Stadium",
      58: "Kansas City Stadium",
      59: "Los Angeles Stadium",
      60: "San Francisco Bay Area Stadium",
      61: "Boston Stadium",
      62: "Toronto Stadium",
      63: "Seattle Stadium",
      64: "Vancouver Stadium",
      65: "Houston Stadium",
      66: "Guadalajara Stadium",
      67: "New York New Jersey Stadium",
      68: "Philadelphia Stadium",
      69: "Kansas City Stadium",
      70: "Dallas Stadium",
      71: "Miami Stadium",
      72: "Atlanta Stadium",
      73: "Los Angeles Stadium",
      74: "Boston Stadium",
      75: "Monterrey Stadium",
      76: "Houston Stadium",
      77: "New York New Jersey Stadium",
      78: "Dallas Stadium",
      79: "Mexico City Stadium",
      80: "Atlanta Stadium",
      81: "San Francisco Bay Area Stadium",
      82: "Seattle Stadium",
      83: "Toronto Stadium",
      84: "Los Angeles Stadium",
      85: "Vancouver Stadium",
      86: "Miami Stadium",
      87: "Kansas City Stadium",
      88: "Dallas Stadium",
      89: "Philadelphia Stadium",
      90: "Houston Stadium",
      91: "New York New Jersey Stadium",
      92: "Mexico City Stadium",
      93: "Dallas Stadium",
      94: "Seattle Stadium",
      95: "Atlanta Stadium",
      96: "Vancouver Stadium",
      97: "Boston Stadium",
      98: "Los Angeles Stadium",
      99: "Miami Stadium",
      100: "Kansas City Stadium",
      101: "Dallas Stadium",
      102: "Atlanta Stadium",
      103: "Miami Stadium",
      104: "New York New Jersey Stadium",
    };
  }

  venueFallbackDetails(venueName) {
    const venues = {
      "Atlanta Stadium": { city: "Atlanta", country: "USA", realName: "Mercedes-Benz Stadium", capacity: 75000 },
      "Boston Stadium": { city: "Boston", country: "USA", realName: "Gillette Stadium", capacity: 65878 },
      "Dallas Stadium": { city: "Dallas", country: "USA", realName: "AT&T Stadium", capacity: 80000 },
      "Guadalajara Stadium": { city: "Guadalajara", country: "Mexico", realName: "Estadio Akron", capacity: 48071 },
      "Houston Stadium": { city: "Houston", country: "USA", realName: "NRG Stadium", capacity: 72220 },
      "Kansas City Stadium": { city: "Kansas City", country: "USA", realName: "Arrowhead Stadium", capacity: 76416 },
      "Los Angeles Stadium": { city: "Los Angeles", country: "USA", realName: "SoFi Stadium", capacity: 70240 },
      "Mexico City Stadium": { city: "Mexico City", country: "Mexico", realName: "Estadio Banorte", capacity: 87523 },
      "Miami Stadium": { city: "Miami", country: "USA", realName: "Hard Rock Stadium", capacity: 64767 },
      "Monterrey Stadium": { city: "Monterrey", country: "Mexico", realName: "Estadio BBVA", capacity: 53500 },
      "New York New Jersey Stadium": { city: "New York/New Jersey", country: "USA", realName: "MetLife Stadium", capacity: 82500 },
      "Philadelphia Stadium": { city: "Philadelphia", country: "USA", realName: "Lincoln Financial Field", capacity: 69596 },
      "San Francisco Bay Area Stadium": { city: "San Francisco Bay Area", country: "USA", realName: "Levi's Stadium", capacity: 68500 },
      "Seattle Stadium": { city: "Seattle", country: "USA", realName: "Lumen Field", capacity: 69000 },
      "Toronto Stadium": { city: "Toronto", country: "Canada", realName: "BMO Field", capacity: 45000 },
      "Vancouver Stadium": { city: "Vancouver", country: "Canada", realName: "BC Place", capacity: 54500 },
    };
    return venues[venueName] || null;
  }


  completeVenueStadiums(stadiums = []) {
    const list = Array.isArray(stadiums) ? [...stadiums] : [];
    const hasMonterrey = list.some((venue) => {
      const values = [venue?.name, venue?.stadium, venue?.real_name, venue?.realName, venue?.venue, venue?.city]
        .filter(Boolean)
        .map((value) => this.normaliseFixtureText(value));
      return values.some((value) =>
        value.includes("monterrey") ||
        value.includes("bbva") ||
        value.includes("guadalupe") ||
        value.includes("estadio monterrey")
      );
    });

    if (!hasMonterrey) {
      list.push({
        id: "monterrey",
        name: "Monterrey Stadium",
        stadium: "Monterrey Stadium",
        real_name: "Estadio BBVA",
        realName: "Estadio BBVA",
        city: "Monterrey",
        country: "Mexico",
        flag: "🇲🇽",
        capacity: 53500,
        matches: 4,
        matches_hosted: 4,
        aliases: ["Estadio Monterrey", "Estadio BBVA", "BBVA Stadium", "Guadalupe", "Monterrey Stadium"],
      });
    }

    return list;
  }


  venueAliasesFor(venueName) {
    const key = this.normaliseFixtureText(venueName || "");
    const aliases = {
      "atlanta stadium": ["Mercedes-Benz Stadium", "Atlanta", "Atlanta Stadium"],
      "boston stadium": ["Gillette Stadium", "Foxborough", "Boston", "Boston Stadium"],
      "dallas stadium": ["AT&T Stadium", "Arlington", "Dallas", "Dallas Stadium"],
      "guadalajara stadium": ["Estadio Akron", "Guadalajara", "Guadalajara Stadium"],
      "houston stadium": ["NRG Stadium", "Houston", "Houston Stadium"],
      "kansas city stadium": ["Arrowhead Stadium", "GEHA Field at Arrowhead Stadium", "Kansas City", "Kansas City Stadium"],
      "los angeles stadium": ["SoFi Stadium", "Los Angeles", "Los Angeles Stadium"],
      "mexico city stadium": ["Estadio Banorte", "Estadio Azteca", "Mexico City", "Mexico City Stadium"],
      "miami stadium": ["Hard Rock Stadium", "Miami", "Miami Stadium"],
      "monterrey stadium": ["Estadio Monterrey", "Estadio BBVA", "BBVA Stadium", "Monterrey", "Guadalupe", "Monterrey Stadium"],
      "new york new jersey stadium": ["MetLife Stadium", "New York", "New Jersey", "East Rutherford", "New York New Jersey Stadium"],
      "philadelphia stadium": ["Lincoln Financial Field", "Philadelphia", "Philadelphia Stadium"],
      "san francisco bay area stadium": ["Levi's Stadium", "Levis Stadium", "Santa Clara", "San Francisco", "San Francisco Bay Area Stadium"],
      "seattle stadium": ["Lumen Field", "Seattle", "Seattle Stadium"],
      "toronto stadium": ["BMO Field", "Toronto", "Toronto Stadium"],
      "vancouver stadium": ["BC Place", "Vancouver", "Vancouver Stadium"],
    };
    return aliases[key] || [venueName].filter(Boolean);
  }

  normaliseKnockoutStage(stage) {
    const value = String(stage || "").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
    const aliases = {
      LAST_32: "LAST_32",
      ROUND_OF_32: "LAST_32",
      ROUND_32: "LAST_32",
      R32: "LAST_32",
      LAST_16: "LAST_16",
      ROUND_OF_16: "LAST_16",
      ROUND_16: "LAST_16",
      R16: "LAST_16",
      QUARTER_FINALS: "QUARTER_FINALS",
      QUARTER_FINAL: "QUARTER_FINALS",
      QUARTERS: "QUARTER_FINALS",
      SEMI_FINALS: "SEMI_FINALS",
      SEMI_FINAL: "SEMI_FINALS",
      THIRD_PLACE: "THIRD_PLACE",
      THIRD_PLACE_PLAYOFF: "THIRD_PLACE",
      THIRD_PLACE_PLAY_OFF: "THIRD_PLACE",
      FINAL: "FINAL",
      KNOCKOUT: "LAST_32",
      KNOCKOUT_STAGE: "LAST_32",
      PLAYOFFS: "LAST_32",
      PLAY_OFFS: "LAST_32",
    };
    return aliases[value] || value;
  }

  knockoutRoundStarts() {
    return {
      LAST_32: 73,
      LAST_16: 89,
      QUARTER_FINALS: 97,
      SEMI_FINALS: 101,
      THIRD_PLACE: 103,
      FINAL: 104,
    };
  }

  sortedKnockoutMatches(stage) {
    const key = this.normaliseKnockoutStage(stage);
    const fixtures = Array.isArray(this._data?.fixtures) ? this._data.fixtures : [];
    return fixtures
      .filter((fixture) => this.normaliseKnockoutStage(fixture?.stage) === key)
      .sort((a, b) => {
        const aTime = new Date(a.utcDate || a.date || 0).getTime();
        const bTime = new Date(b.utcDate || b.date || 0).getTime();
        if (aTime !== bTime) return aTime - bTime;
        const aHome = this.fixtureTeamKey(this.getHomeTeam(a));
        const bHome = this.fixtureTeamKey(this.getHomeTeam(b));
        const aAway = this.fixtureTeamKey(this.getAwayTeam(a));
        const bAway = this.fixtureTeamKey(this.getAwayTeam(b));
        return `${aHome}|${aAway}`.localeCompare(`${bHome}|${bAway}`);
      });
  }

  knockoutDerivedMatchNumber(stage, index, match) {
    // Knockout venues must be assigned by FIFA match slot.
    // Prefer a valid FIFA match number when the feed provides one, because the
    // official venue schedule is keyed to match numbers 73-104.
    // Only derive from stage/index when the feed omits or provides an invalid number.
    const key = this.normaliseKnockoutStage(stage || match?.stage);
    if (key === "LAST_32") {
      const seededMatchNumber = this.knockoutRound32MatchNumberFromTeams(match);
      if (seededMatchNumber) return seededMatchNumber;
    }

    const existing = this.fixtureMatchNumber(match);
    if (existing && existing >= 73 && existing <= 104) return existing;

    if (key && key !== "LAST_32") {
      const routedMatchNumber = this.knockoutMatchNumberFromWinnerRoute(key, match);
      if (routedMatchNumber) return routedMatchNumber;
    }

    const start = this.knockoutRoundStarts()[key];
    if (!start) return existing;

    let safeIndex = Number.isFinite(Number(index)) && Number(index) >= 0 ? Number(index) : -1;

    if (safeIndex < 0 && match) {
      const matches = this.sortedKnockoutMatches(key);
      safeIndex = matches.findIndex((candidate) => candidate === match);

      if (safeIndex < 0) {
        const targetKey = `${this.fixtureTeamKey(this.getHomeTeam(match))}|${this.fixtureTeamKey(this.getAwayTeam(match))}|${match.utcDate || match.date || ""}`;
        safeIndex = matches.findIndex((candidate) => {
          const candidateKey = `${this.fixtureTeamKey(this.getHomeTeam(candidate))}|${this.fixtureTeamKey(this.getAwayTeam(candidate))}|${candidate.utcDate || candidate.date || ""}`;
          return candidateKey === targetKey;
        });
      }
    }

    return safeIndex >= 0 ? start + safeIndex : this.fixtureMatchNumber(match);
  }

  fixtureVenueInfo(match, forcedMatchNumber = null) {
    const homeTeam = this.getHomeTeam(match);
    const awayTeam = this.getAwayTeam(match);
    const directVenue = match.venue || match.stadium || match.location || match.venueName || match.venue_name || match.venue_display_name || "";
    const officialVenues = this.officialFixtureVenueLookup();
    const officialVenuesByNumber = this.officialFixtureVenueByMatchNumber();
    const stageKey = this.normaliseKnockoutStage(match?.stage);
    const isKnockout = Boolean(this.knockoutRoundStarts()[stageKey]);
    const matchNumber = forcedMatchNumber || (isKnockout ? this.knockoutDerivedMatchNumber(stageKey, -1, match) : this.fixtureMatchNumber(match));
    const homeKey = this.fixtureTeamKey(homeTeam);
    const awayKey = this.fixtureTeamKey(awayTeam);
    const pairKey = `${homeKey}|${awayKey}`;
    const reversePairKey = `${awayKey}|${homeKey}`;
    const lookupVenue = officialVenues[pairKey] || officialVenues[reversePairKey] || "";
    const numberVenue = matchNumber ? (officialVenuesByNumber[matchNumber] || "") : "";
    // Official schedule data must win over API/direct venue fallbacks.
    // Some feeds return incomplete or repeated venue values (often Atlanta) for
    // future fixtures/knockout placeholders, so use match-number first, then
    // official team-pair lookup, and only then trust the API/direct venue.
    const venueName = numberVenue || lookupVenue || directVenue;

    const stadiums = this.completeVenueStadiums(this._data?.venues?.stadiums || []);
    const venueAliases = this.venueAliasesFor(venueName);
    const normalisedVenueCandidates = [venueName, ...venueAliases]
      .filter(Boolean)
      .map((item) => this.normaliseFixtureText(item))
      .filter(Boolean);

    const venueData = stadiums.find((v) => {
      const candidates = [v.name, v.stadium, v.real_name, v.realName, v.venue, v.city].filter(Boolean);
      return candidates.some((candidate) => {
        const normalisedCandidate = this.normaliseFixtureText(candidate);
        return normalisedVenueCandidates.some((normalisedVenue) => {
          return normalisedCandidate === normalisedVenue || normalisedCandidate.includes(normalisedVenue) || normalisedVenue.includes(normalisedCandidate);
        });
      });
    });

    const fallback = this.venueFallbackDetails(venueName) || {};
    const name = venueData?.name || venueData?.stadium || venueName || fallback.name || "";
    const realName = venueData?.real_name || venueData?.realName || fallback.realName || "";
    const city = match.venueCity || match.city || venueData?.city || fallback.city || "";
    const country = match.venueCountry || venueData?.country || fallback.country || "";
    const capacityRaw = match.venueCapacity || match.capacity || venueData?.capacity || fallback.capacity || "";
    const capacityNumber = Number(String(capacityRaw).replace(/[^0-9]/g, ""));
    const capacity = Number.isFinite(capacityNumber) && capacityNumber > 0 ? capacityNumber.toLocaleString() : "";
    const image = venueData?.image ? `/world_cup_2026_frontend/${venueData.image}` : "";

    if (!name && !realName && !city && !capacity) return null;

    return { name, realName, city, country, capacity, image };
  }

  fixtureCard(m) {
    const homeTeam = this.getHomeTeam(m);
    const awayTeam = this.getAwayTeam(m);
    const homeScore = this.getHomeScore(m);
    const awayScore = this.getAwayScore(m);
    const status = this.statusLabel(m.status, m);
    const stage = String(m.group || this.stageLabel(m.stage) || "").replaceAll("_", " ");
    const scoreText = homeScore === "-" && awayScore === "-" ? "v" : `${homeScore} - ${awayScore}`;
    const liveClass = ["IN_PLAY", "LIVE", "PAUSED"].includes(m.status) ? " is-live" : "";
    const finishedClass = ["FINISHED", "FT", "AET", "PEN"].includes(m.status) ? " is-finished" : "";
    const scheduledClass = ["TIMED", "SCHEDULED"].includes(m.status) ? " is-scheduled" : "";
    const venueInfo = this.fixtureVenueInfo(m);
    const matchNumber = this.fixtureMatchNumber(m) || "";
    const matchDate = this.fixtureDateLabel(m);
    const matchTime = this.fixtureTime(m);

    return `
      <div class="fixture-card${liveClass}${finishedClass}${scheduledClass}">
        <div class="fixture-card-top fixture-card-top-merged">
          <span class="fixture-stage-pill">${this.esc(stage || this.t("fixtures"))}</span>
          <div class="fixture-top-details">
            ${matchNumber ? `<span>#${this.esc(matchNumber)}</span>` : ""}
            ${matchDate ? `<span class="fixture-date-pill">${this.esc(matchDate)}</span>` : ""}
            ${matchTime ? `<span class="fixture-time-pill">⏱ ${this.esc(matchTime)}</span>` : ""}
            <strong class="fixture-card-status">${this.statusHtml(m)}</strong>
          </div>
        </div>

        <div class="fixture-card-main fixture-card-main-compact">
          <div class="fixture-card-team fixture-card-team-home">
            ${this.flag(homeTeam, true)}
            <span>${this.esc(this.localizedTeamName(homeTeam))}</span>
          </div>

          <div class="fixture-card-score">${this.esc(scoreText)}</div>

          <div class="fixture-card-team fixture-card-team-away">
            ${this.flag(awayTeam, true)}
            <span>${this.esc(this.localizedTeamName(awayTeam))}</span>
          </div>
        </div>

        ${venueInfo?.image ? `<img src="${this.esc(venueInfo.image)}" class="fixture-stadium-image" loading="lazy">` : ""}

        ${venueInfo ? `
          <div class="fixture-card-venue fixture-card-venue-inline">
            <span class="fixture-venue-name">🏟 ${this.esc(venueInfo.name)}</span>
            ${venueInfo.realName && venueInfo.realName !== venueInfo.name ? `<span class="fixture-venue-real">${this.esc(this.t("realStadium"))}: ${this.esc(venueInfo.realName)}</span>` : ""}
            ${venueInfo.city || venueInfo.country ? `<span class="fixture-venue-location">${this.esc([venueInfo.city, venueInfo.country ? this.localizedCountryName(venueInfo.country) : ""].filter(Boolean).join(", "))}</span>` : ""}
            ${venueInfo.capacity ? `<span class="fixture-venue-capacity">👥 ${this.esc(venueInfo.capacity)}</span>` : ""}
          </div>
        ` : ""}
      </div>
    `;
  }

  matchRow(m) {
    const homeTeam = this.getHomeTeam(m);
    const awayTeam = this.getAwayTeam(m);
    const homeScore = this.getHomeScore(m);
    const awayScore = this.getAwayScore(m);
    const status = this.statusLabel(m.status, m);
    const stage = String(m.group || this.stageLabel(m.stage) || "").replaceAll("_", " ");
    const date = this.formatDate(m.utcDate || m.date);
    const venueInfo = this.fixtureVenueInfo(m);

    return `
      <div class="wc-row">
        <div class="fixture-teams-big">
          ${this.teamFlagBlock(homeTeam)}

          <div class="fixture-middle">
            <div class="wc-score">${homeScore} - ${awayScore}</div>
            <div class="fixture-vs">${this.t("versus")}</div>
            ${this.footballClockHtml(m)}
          </div>

          ${this.teamFlagBlock(awayTeam)}
        </div>

        <div class="fixture-meta">
          <div class="wc-muted">${this.esc(stage)}</div>
          <div class="wc-muted">${this.esc(date)}</div>
          <div class="wc-muted">${this.statusHtml(m)}</div>
        </div>

        ${this.matchScorersSection(homeTeam, awayTeam, m)}
        ${this.matchExtraLiveDataSection(m)}
      </div>
    `;
  }

  groupsPage() {
    const groups = this._data.groups || [];

    if (!groups.length) {
      return `
        <div class="wc-card">
          <div class="wc-section-title">${this.t("groupsAL")}</div>
          <div class="wc-empty">${this.t("noGroups")}</div>
        </div>
      `;
    }

    return `
      <div class="wc-groups-grid">
        ${groups.map((group, index) => {
          const rawGroupName =
            group.group ||
            group.name ||
            group.stage ||
            `Group ${String.fromCharCode(65 + index)}`;

          const groupName = this.groupNameLabel(rawGroupName, index);

          const table =
            group.table ||
            group.standings ||
            group.teams ||
            [];

          return `
            <div class="wc-card wc-group-card">
              <div class="wc-section-title">${this.esc(groupName)}</div>

              ${
                table.length
                  ? `
                <div class="wc-table-wrap">
                  <table class="wc-table">
                    <thead>
                      <tr>
                        <th>${this.t("pos")}</th>
                        <th>${this.t("team")}</th>
                        <th>${this.t("playedShort")}</th>
                        <th>${this.t("winsShort")}</th>
                        <th>${this.t("drawsShort")}</th>
                        <th>${this.t("lossesShort")}</th>
                        <th>${this.t("goalsForShort")}</th>
                        <th>${this.t("goalsAgainstShort")}</th>
                        <th>${this.t("goalDifferenceShort")}</th>
                        <th>${this.t("pointsShort")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${table.map((team, i) => {
                        const teamName = team.team?.name || team.team?.shortName || team.name || team.team || "";
                        return `
                          <tr>
                            <td>${team.position ?? i + 1}</td>
                            <td>
                              <div class="group-team-cell">
                                ${this.flag(teamName, true)}
                                <strong>${this.esc(this.localizedTeamName(teamName))}</strong>
                              </div>
                            </td>
                            <td>${team.playedGames ?? team.played ?? team.p ?? 0}</td>
                            <td>${team.won ?? team.wins ?? team.w ?? 0}</td>
                            <td>${team.draw ?? team.draws ?? team.d ?? 0}</td>
                            <td>${team.lost ?? team.losses ?? team.l ?? 0}</td>
                            <td>${team.goalsFor ?? team.gf ?? 0}</td>
                            <td>${team.goalsAgainst ?? team.ga ?? 0}</td>
                            <td>${team.goalDifference ?? team.gd ?? 0}</td>
                            <td><strong>${team.points ?? team.pts ?? 0}</strong></td>
                          </tr>
                        `;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              `
                  : `<div class="wc-empty">${this.t("noTeamsGroup")}</div>`
              }
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  numberValue(...values) {
    for (const value of values) {
      if (value === null || value === undefined || value === "") continue;
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 0;
  }



  resolvedPlayerStat(player, ...keys) {
    const candidates = [
      player,
      player?.player,
      player?.stats,
      player?.statistics,
      player?.discipline,
      player?.cards,
      player?.player?.stats,
      player?.player?.statistics,
      player?.player?.discipline,
      player?.player?.cards,
    ].filter((item) => item && typeof item === "object");

    for (const source of candidates) {
      const value = this.playerStatValue(source, ...keys);
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return undefined;
  }

  playerStatValue(player, ...keys) {
    for (const key of keys) {
      if (!key) continue;

      if (Object.prototype.hasOwnProperty.call(player, key)) {
        return player[key];
      }

      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (Object.prototype.hasOwnProperty.call(player, camelKey)) {
        return player[camelKey];
      }

      const nestedParts = key.split(".");
      if (nestedParts.length > 1) {
        let current = player;
        let found = true;
        for (const part of nestedParts) {
          if (current && Object.prototype.hasOwnProperty.call(current, part)) {
            current = current[part];
          } else {
            found = false;
            break;
          }
        }
        if (found) return current;
      }
    }
    return undefined;
  }

  playerPhotoUrl(player) {
    if (!player || typeof player !== "object") return "";
    const manualPhotos = {
      "lionel messi": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "lionel messi|argentina": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "lionel messi|arg": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "l messi": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "l messi|argentina": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "l messi|arg": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "lionel andres messi": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "lionel andres messi|argentina": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/lionel-messi.jpg",
      "harry kane": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/harry-kane.jpg",
      "harry kane|england": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/harry-kane.jpg",
      "harry kane|eng": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/harry-kane.jpg",
      "h kane": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/harry-kane.jpg",
      "h kane|england": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/harry-kane.jpg",
      "kylian mbappe": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "kylian mbappe|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "kylian mbappe|fra": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "k mbappe": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "k mbappe|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "k mbappe|fra": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "kylian mbappe lottin": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "kylian mbappe lottin|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/kylian-mbappe.jpg",
      "ousmane dembele": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "ousmane dembele|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "ousmane dembele|fra": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "o dembele": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "o dembele|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "o dembele|fra": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "dembele": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "dembele|france": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ousmane-dembél.jpg",
      "elijah just": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/elijah-just.jpg",
      "elijah just|new zealand": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/elijah-just.jpg",
      "elijah just|nzl": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/elijah-just.jpg",
      "e just": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/elijah-just.jpg",
      "e just|new zealand": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/elijah-just.jpg",
      "erling haaland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "erling haaland|norway": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "erling haaland|nor": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "e haaland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "e haaland|norway": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "erling harland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "erling harland|norway": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "erling harland|nor": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/erling-haaland.jpg",
      "folarin balogun": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "folarin balogun|usa": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "folarin balogun|united states": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "folarin balogun|united states of america": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "f balogun": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "f balogun|usa": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/folarin-balogun.jpg",
      "cyle larin": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cyle-larin.jpg",
      "cyle larin|canada": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cyle-larin.jpg",
      "cyle larin|can": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cyle-larin.jpg",
      "c larin": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cyle-larin.jpg",
      "c larin|canada": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cyle-larin.jpg",
      "jonathan david": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/jonathan-david.jpg",
      "jonathan david|canada": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/jonathan-david.jpg",
      "jonathan david|can": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/jonathan-david.jpg",
      "j david": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/jonathan-david.jpg",
      "j david|canada": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/jonathan-david.jpg",
      "vinicius junior": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius junior|brazil": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius junior|bra": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "v junior": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "v junior|brazil": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius jr": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius jr|brazil": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius jose paixao de oliveira junior": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "vinicius jose paixao de oliveira junior|brazil": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/vinicius-junior.jpg",
      "deniz undav": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "deniz undav|germany": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "deniz undav|ger": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "deniz undav|deu": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "d undav": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "d undav|germany": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/deniz-undav.jpg",
      "cody gakpo": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "cody gakpo|netherlands": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "cody gakpo|nederland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "cody gakpo|ned": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "c gakpo": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "c gakpo|netherlands": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/cody-gakpo.jpg",
      "brian brobbey": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "brian brobbey|netherlands": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "brian brobbey|nederland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "brian brobbey|ned": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "b brobbey": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "b brobbey|netherlands": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/brian-brobbey.jpg",
      "ayase ueda": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "ayase ueda|japan": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "ayase ueda|jpn": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "a ueda": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "a ueda|japan": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "ueda": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "ueda|japan": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/ayase-ueda.jpg",
      "johan manzambi": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/johan-manzambi.jpg",
      "johan manzambi|switzerland": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/johan-manzambi.jpg",
      "johan manzambi|sui": "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/johan-manzambi.jpg",
    };
    const cleanPlayerKey = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s|-]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();
    const playerName = cleanPlayerKey(player.name || player.player?.name || player.player || "");
    const playerTeam = cleanPlayerKey(player.team?.name || player.team?.shortName || player.team || player.nationality || player.country || "");
    if (manualPhotos[playerName]) return manualPhotos[playerName];
    const manualKey = `${playerName}|${playerTeam}`;
    if (manualPhotos[manualKey]) return manualPhotos[manualKey];

    const direct = player.photo || player.image || player.picture || player.headshot || player.avatar || player.playerPhoto;
    if (direct) return String(direct);
    const nested = player.player && typeof player.player === "object"
      ? (player.player.photo || player.player.image || player.player.picture)
      : "";
    if (nested) return String(nested);
    const id = player.apiFootballPlayerId || player.apiSportsPlayerId || player.apiFootballId || player.apiSportsId || player.player?.apiFootballPlayerId || player.player?.apiSportsPlayerId;
    return id ? `https://media.api-sports.io/football/players/${id}.png` : "";
  }
  playerPhotoFallbackUrl(primary = "") {
    const localPrefix = "/local/worldcup/players/";
    const githubPrefix = "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/custom_components/world_cup_2026/players/";
    const src = String(primary || "");
    if (src.startsWith(githubPrefix)) {
      const filename = src.slice(githubPrefix.length);
      return filename ? localPrefix + filename : "";
    }
    if (!src.startsWith(localPrefix)) return "";
    const filename = src.slice(localPrefix.length);
    return filename ? githubPrefix + filename : "";
  }
  playerInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0] || "").join("").toUpperCase() || "PL";
  }

  playerProfileCards(players = []) {
    const cards = players.slice(0, 6);
    if (!cards.length) return "";

    return `
      <section class="wc-section golden-profile-section">
        <div class="golden-card-head">
          <div>
            <div class="section-kicker">Player Profiles</div>
            <h2>Profile Cards</h2>
          </div>
        </div>
        <div class="golden-profile-grid">
          ${cards.map((player, index) => {
            const photo = this.playerPhotoUrl(player);
            const fallbackPhoto = this.playerPhotoFallbackUrl(photo);
            const initials = this.playerInitials(player.name);
            return `
              <article class="golden-profile-card">
                <div class="golden-profile-photo">
                  ${photo ? `<img src="${this.esc(photo)}"${fallbackPhoto ? ` data-fallback-src="${this.esc(fallbackPhoto)}"` : ""} alt="${this.esc(player.name)}" loading="lazy" onerror="if(this.dataset.fallbackSrc){this.src=this.dataset.fallbackSrc;this.dataset.fallbackSrc='';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}">` : ""}
                  <span class="golden-profile-fallback" style="${photo ? "display:none" : ""}">${this.esc(initials)}</span>
                </div>
                <div class="golden-profile-main">
                  <div class="golden-profile-rank">#${index + 1}</div>
                  <h3>${this.esc(player.name)}</h3>
                  <p>${this.flag(player.team, true)} ${this.esc(player.team)}</p>
                  <div class="golden-profile-stats">
                    <span><strong>${player.goals}</strong>${this.t("goals")}</span>
                    <span><strong>${player.assists}</strong>${this.t("assists")}</span>
                    <span><strong>${player.totalInvolvements}</strong>G+A</span>
                  </div>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  knockoutGroupQualifiers() {
    const groups = {};
    const sources = [
      ...(Array.isArray(this._data.standings) ? this._data.standings : []),
      ...(Array.isArray(this._data.groups) ? this._data.groups : []),
    ];
    const groupLetter = (group, index) => {
      const raw = String(group?.group || group?.name || group?.stage || "").trim();
      const match = raw.match(/(?:GROUP|Group)?[\s_-]*([A-L])\b/i) || raw.match(/^([A-L])$/i);
      return match?.[1] ? match[1].toUpperCase() : "";
    };
    const teamName = (row) => {
      const team = row?.team || row?.name || row;
      if (typeof team === "string") return team;
      return team?.name || team?.shortName || team?.tla || "";
    };
    const numberValue = (row, ...keys) => {
      for (const key of keys) {
        const value = Number(row?.[key]);
        if (Number.isFinite(value)) return value;
      }
      return 0;
    };
    const positionValue = (row, index) => {
      const value = Number(row?.position ?? row?.rank ?? row?.pos);
      return Number.isFinite(value) && value > 0 ? value : index + 1;
    };

    sources.forEach((group, groupIndex) => {
      const letter = groupLetter(group, groupIndex);
      if (!letter) return;
      const rows = group?.table || group?.standings || group?.teams || [];
      if (!Array.isArray(rows) || !rows.length) return;
      const mapped = rows
        .map((row, index) => ({
          team: teamName(row),
          group: letter,
          position: positionValue(row, index),
          points: numberValue(row, "points", "pts"),
          gd: numberValue(row, "goalDifference", "gd"),
          gf: numberValue(row, "goalsFor", "gf"),
        }))
        .filter((row) => row.team && this.fixtureTeamKey(row.team) !== this.fixtureTeamKey(this.t("tbc")))
        .sort((a, b) =>
          a.position - b.position ||
          b.points - a.points ||
          b.gd - a.gd ||
          b.gf - a.gf ||
          a.team.localeCompare(b.team)
        );
      if (!groups[letter] || mapped.length > groups[letter].rows.length) {
        groups[letter] = {
          rows: mapped,
          winner: mapped[0]?.team || "",
          runnerUp: mapped[1]?.team || "",
          third: mapped[2]?.team || "",
        };
      }
    });

    const bestThirds = Object.entries(groups)
      .map(([letter, group]) => group.rows[2] ? { ...group.rows[2], group: letter } : null)
      .filter(Boolean)
      .sort((a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.group.localeCompare(b.group)
      )
      .slice(0, 8);

    return { groups, bestThirds };
  }

  knockoutRound32SeedMap() {
    return {
      73: ["RU A", "RU B"],
      74: ["W E", "3 A/B/C/D/F"],
      75: ["W F", "RU C"],
      76: ["W C", "RU F"],
      77: ["W I", "3 C/D/F/G/H"],
      78: ["RU E", "RU I"],
      79: ["W A", "3 C/E/F/H/I"],
      80: ["W L", "3 E/H/I/J/K"],
      81: ["W D", "3 B/E/F/I/J"],
      82: ["W G", "3 A/E/H/I/J"],
      83: ["RU K", "RU L"],
      84: ["W H", "RU J"],
      85: ["W B", "3 E/F/G/I/J"],
      86: ["W J", "RU H"],
      87: ["W K", "3 D/E/I/J/L"],
      88: ["RU D", "RU G"],
    };
  }

  knockoutRound32ResolvedSeedMap() {
    const qualifiers = this.knockoutGroupQualifiers();
    const teamKey = (team) => this.fixtureTeamKey(team);
    const seedMap = this.knockoutRound32SeedMap();
    const lockedMap = this.knockoutRound32LockedTeamMap();

    return Object.fromEntries(Object.entries(seedMap).map(([matchNumber, seeds]) => {
      const lockedTeams = lockedMap[Number(matchNumber)];
      if (lockedTeams) {
        return [Number(matchNumber), lockedTeams.map((team) => ({ label: team, key: teamKey(team), seed: team }))];
      }
      const teams = seeds.map((seed) => {
        const resolved = this.knockoutTeamFromSeed(seed, qualifiers);
        const value = resolved && !String(resolved).toLowerCase().startsWith("3rd ")
          ? resolved
          : seed;
        return { label: value, key: teamKey(value), seed };
      });
      return [Number(matchNumber), teams];
    }));
  }

  knockoutRound32LockedTeamMap() {
    return {
      73: ["South Africa", "Canada"],
      74: ["Germany", "Paraguay"],
      75: ["Netherlands", "Morocco"],
      76: ["Brazil", "Japan"],
      77: ["France", "Sweden"],
      78: ["Ivory Coast", "Norway"],
      79: ["Mexico", "Ecuador"],
      80: ["England", "DR Congo"],
      81: ["United States", "Bosnia & Herzegovina"],
      82: ["Belgium", "Senegal"],
      83: ["Portugal", "Croatia"],
      84: ["Spain", "Austria"],
      85: ["Switzerland", "Algeria"],
      86: ["Argentina", "Cape Verde"],
      87: ["Colombia", "Ghana"],
      88: ["Australia", "Egypt"],
    };
  }

  knockoutLockedTeamMap() {
    return {
      ...this.knockoutRound32LockedTeamMap(),
      89: ["Paraguay", "Winner Match 77"],
      90: ["Canada", "Morocco"],
      91: ["Brazil", "Winner Match 78"],
      92: ["Winner Match 79", "Winner Match 80"],
      93: ["Winner Match 83", "Winner Match 84"],
      94: ["Winner Match 81", "Winner Match 82"],
      95: ["Winner Match 86", "Winner Match 88"],
      96: ["Winner Match 85", "Winner Match 87"],
      97: ["Winner Match 89", "Winner Match 90"],
      98: ["Winner Match 93", "Winner Match 94"],
      99: ["Winner Match 91", "Winner Match 92"],
      100: ["Winner Match 95", "Winner Match 96"],
      101: ["Winner Match 97", "Winner Match 98"],
      102: ["Winner Match 99", "Winner Match 100"],
      103: ["Loser Match 101", "Loser Match 102"],
      104: ["Winner Match 101", "Winner Match 102"],
    };
  }

  knockoutRound32MatchNumberFromTeams(match) {
    if (!match) return null;
    const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
    const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
    const knownKeys = [homeKey, awayKey].filter((key) => key && key !== "tbc");
    if (!knownKeys.length) return null;

    const lockedMap = this.knockoutRound32LockedTeamMap();
    for (const [matchNumber, teams] of Object.entries(lockedMap)) {
      const first = this.fixtureTeamKey(teams?.[0]);
      const second = this.fixtureTeamKey(teams?.[1]);
      if (homeKey && awayKey && homeKey !== "tbc" && awayKey !== "tbc") {
        if ((homeKey === first && awayKey === second) || (homeKey === second && awayKey === first)) {
          return Number(matchNumber);
        }
      }
    }

    const seeds = this.knockoutRound32ResolvedSeedMap();
    for (const [matchNumber, teams] of Object.entries(seeds)) {
      const first = teams?.[0]?.key || "";
      const second = teams?.[1]?.key || "";
      const seedKeys = [first, second].filter((key) => key && !key.includes("/"));

      if (homeKey && awayKey && homeKey !== "tbc" && awayKey !== "tbc") {
        if ((homeKey === first && awayKey === second) || (homeKey === second && awayKey === first)) {
          return Number(matchNumber);
        }
        continue;
      }

      if (seedKeys.some((seedKey) => knownKeys.includes(seedKey))) {
        return Number(matchNumber);
      }
    }

    return null;
  }

  knockoutBracketDisplayOrder(stage) {
    const key = this.normaliseKnockoutStage(stage);
    const orders = {
      // Display order follows the official bracket branches, not raw match
      // number order. Each adjacent pair feeds the same next-round match.
      LAST_32: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
      LAST_16: [89, 90, 93, 94, 91, 92, 95, 96],
      QUARTER_FINALS: [97, 98, 99, 100],
      SEMI_FINALS: [101, 102],
      FINAL: [104],
    };
    return orders[key] || null;
  }

  knockoutWinnerRouteMap() {
    return {
      89: [74, 77],
      90: [73, 75],
      93: [83, 84],
      94: [81, 82],
      91: [76, 78],
      92: [79, 80],
      95: [86, 88],
      96: [85, 87],
      97: [89, 90],
      98: [93, 94],
      99: [91, 92],
      100: [95, 96],
      101: [97, 98],
      102: [99, 100],
      104: [101, 102],
    };
  }

  knockoutStageMatchNumbers(stage) {
    const key = this.normaliseKnockoutStage(stage);
    const map = {
      LAST_16: [89, 90, 91, 92, 93, 94, 95, 96],
      QUARTER_FINALS: [97, 98, 99, 100],
      SEMI_FINALS: [101, 102],
      FINAL: [104],
    };
    return map[key] || [];
  }

  knockoutMatchWinner(match) {
    if (!match) return "";
    const directWinner = match.winner || match.winnerTeam || match.winningTeam || match.qualifiedTeam || "";
    if (directWinner) return directWinner;

    const homeScore = Number(this.getHomeScore(match));
    const awayScore = Number(this.getAwayScore(match));
    if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
      if (homeScore > awayScore) return this.getHomeTeam(match);
      if (awayScore > homeScore) return this.getAwayTeam(match);
    }

    const penalties = match.score?.penalties || match.penalties || match.penaltyScore || {};
    const homePens = Number(penalties.home ?? penalties.homeTeam ?? penalties.home_score);
    const awayPens = Number(penalties.away ?? penalties.awayTeam ?? penalties.away_score);
    if (Number.isFinite(homePens) && Number.isFinite(awayPens)) {
      if (homePens > awayPens) return this.getHomeTeam(match);
      if (awayPens > homePens) return this.getAwayTeam(match);
    }

    return "";
  }

  knockoutWinnerByMatchNumber() {
    const sources = [
      ...(Array.isArray(this._data.results) ? this._data.results : []),
      ...(Array.isArray(this._data.fixtures) ? this._data.fixtures : []),
      ...(Array.isArray(this._data.live) ? this._data.live : []),
    ];
    const winners = new Map();

    sources.forEach((match) => {
      const stage = this.normaliseKnockoutStage(match?.stage);
      if (!stage) return;
      const number = this.fixtureMatchNumber(match) || (stage === "LAST_32" ? this.knockoutRound32MatchNumberFromTeams(match) : null);
      if (!number || number < 73 || number > 104 || winners.has(number)) return;
      const winner = this.knockoutMatchWinner(match);
      if (winner) winners.set(number, winner);
    });

    return winners;
  }

  knockoutMatchNumberFromWinnerRoute(stage, match) {
    if (!match) return null;
    const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
    const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
    const matchKeys = [homeKey, awayKey].filter((key) => key && key !== "tbc");
    if (matchKeys.length < 2) return null;

    const winners = this.knockoutWinnerByMatchNumber();
    const routes = this.knockoutWinnerRouteMap();
    const possibleNumbers = this.knockoutStageMatchNumbers(stage);

    for (const matchNumber of possibleNumbers) {
      const previousMatches = routes[matchNumber] || [];
      const routeKeys = previousMatches
        .map((previousNumber) => this.fixtureTeamKey(winners.get(previousNumber)))
        .filter((key) => key && key !== "tbc");
      if (routeKeys.length < 2) continue;
      if (matchKeys.every((key) => routeKeys.includes(key))) {
        return matchNumber;
      }
    }

    return null;
  }

  knockoutTeamFromSeed(seed, qualifiers) {
    const raw = String(seed || "").trim().toUpperCase();
    const direct = raw.match(/^(W|RU)\s*([A-L])$/);
    if (direct) {
      const group = qualifiers.groups[direct[2]];
      return direct[1] === "W" ? group?.winner : group?.runnerUp;
    }

    const third = raw.match(/^3\s+([A-L](?:\/[A-L])*)$/);
    if (third) {
      const allowed = third[1].split("/");
      const possible = qualifiers.bestThirds.filter((row) => allowed.includes(row.group));
      if (possible.length === 1) return possible[0].team;
      return `3rd ${allowed.join("/")}`;
    }

    return "";
  }

  knockoutSeededPlaceholder(stage, index, match = null, forcedMatchNumber = null) {
    const matchNumber = forcedMatchNumber || this.knockoutDerivedMatchNumber(stage, index, match || {});
    const seeds = stage === "LAST_32" ? this.knockoutRound32SeedMap()[matchNumber] : null;
    const lockedTeams = this.knockoutLockedTeamMap()[matchNumber];
    if (!seeds && !lockedTeams) return null;
    const qualifiers = this.knockoutGroupQualifiers();
    const home = lockedTeams?.[0] || this.knockoutTeamFromSeed(seeds[0], qualifiers) || seeds[0];
    const away = lockedTeams?.[1] || this.knockoutTeamFromSeed(seeds[1], qualifiers) || seeds[1];
    return {
      id: `wc2026-derived-knockout-${matchNumber}`,
      matchNumber,
      fifaMatchNumber: matchNumber,
      stage,
      status: "TIMED",
      utcDate: match?.utcDate || match?.date || "",
      date: match?.utcDate || match?.date || "",
      homeTeam: { name: home },
      awayTeam: { name: away },
      score: { fullTime: { home: null, away: null } },
      venue: match?.venue || match?.stadium || "",
      source: "standings_knockout_placeholder",
    };
  }

  playersPage() {
    const rawScorers = Array.isArray(this._data.scorers) ? this._data.scorers : [];
    const allMatchSources = [
      ...(Array.isArray(this._data.results) ? this._data.results : []),
      ...(Array.isArray(this._data.fixtures) ? this._data.fixtures : []),
      ...(Array.isArray(this._data.live) ? this._data.live : []),
    ];
    const seenMatchKeys = new Set();
    const allMatches = allMatchSources.filter((match) => {
      const key = String(match?.id || match?.matchId || match?.apiFootballFixtureId || `${match?.utcDate || match?.date || ""}|${this.getHomeTeam(match)}|${this.getAwayTeam(match)}`);
      if (!key || seenMatchKeys.has(key)) return false;
      seenMatchKeys.add(key);
      return true;
    });

    const playerKey = (name, team) => `${String(name || "").trim().toLowerCase()}|${String(team || "").trim().toLowerCase()}`;
    const eventText = (event, key) => String(event?.[key] || "").toLowerCase();
    const isGoalEvent = (event) => {
      const combined = `${eventText(event, "type")} ${eventText(event, "rawType")} ${eventText(event, "detail")}`;
      return combined.includes("goal") || combined.includes("penalty");
    };
    const isOwnGoal = (event) => `${eventText(event, "type")} ${eventText(event, "detail")}`.includes("own");
    const isPenalty = (event) => `${eventText(event, "type")} ${eventText(event, "detail")}`.includes("penalty");
    const eventTeam = (event) => this.localizedTeamName(event?.team || event?.teamName || event?.country || this.t("tbc"));
    const eventPlayer = (event) => event?.player || event?.playerName || event?.name || "";
    const getOrCreate = (map, name, team, source = {}) => {
      const safeName = String(name || "").trim();
      const safeTeam = this.localizedTeamName(team || this.t("tbc"));
      const key = playerKey(safeName, safeTeam);
      if (!safeName || safeName.toLowerCase() === "goal") return null;
      if (!map.has(key)) {
        map.set(key, {
          name: safeName,
          team: safeTeam,
          goals: 0,
          assists: 0,
          penalties: 0,
          ownGoals: 0,
          totalInvolvements: 0,
          matches: new Set(),
          source: "match events",
          photo: this.playerPhotoUrl(source),
          playerId: source.playerId || source.id || source.apiFootballPlayerId || source.apiSportsPlayerId || source.player?.id || "",
        });
      } else {
        const existing = map.get(key);
        if (!existing.photo) existing.photo = this.playerPhotoUrl(source);
        if (!existing.playerId) existing.playerId = source.playerId || source.id || source.apiFootballPlayerId || source.apiSportsPlayerId || source.player?.id || "";
      }
      return map.get(key);
    };

    const playerMap = new Map();
    const useOfficialScorers = rawScorers.length > 0;

    rawScorers.forEach((s) => {
      const playerName =
        typeof s.player === "string"
          ? s.player
          : s.player?.name || s.name || this.t("unknown");
      const teamName =
        typeof s.team === "string"
          ? s.team
          : s.team?.shortName || s.team?.name || s.team?.tla || s.nationality || this.t("tbc");

      const row = getOrCreate(playerMap, playerName, teamName, s);
      if (!row) return;
      row.goals = Math.max(row.goals, this.numberValue(this.resolvedPlayerStat(s, "goals", "scored", "goal_count", "total_goals", "totalGoals")));
      row.assists = Math.max(row.assists, this.numberValue(this.resolvedPlayerStat(s, "assists", "assist", "assist_count", "total_assists", "totalAssists")));
      row.source = s.source || "football-data.org";
    });

    const teamTotals = new Map();
    let eventGoals = 0;
    let eventAssists = 0;
    let eventPenalties = 0;
    let eventOwnGoals = 0;
    let matchesWithEvents = 0;

    allMatches.forEach((match) => {
      const details = match?.matchDetails || {};
      const events = [
        ...(Array.isArray(match?.events) ? match.events : []),
        ...(Array.isArray(details.events) ? details.events : []),
        ...(Array.isArray(match?.goalEvents) ? match.goalEvents : []),
        ...(Array.isArray(details.goalEvents) ? details.goalEvents : []),
      ];
      const seenEvents = new Set();
      const uniqueEvents = events.filter((event) => {
        if (!event || typeof event !== "object") return false;
        if (String(event.source || "").toLowerCase() === "manual") return false;
        const sig = [event.rawType, event.type, event.team, event.player, event.minute, event.extra, event.detail, event.assist].join("|").toLowerCase();
        if (seenEvents.has(sig)) return false;
        seenEvents.add(sig);
        return true;
      });

      if (uniqueEvents.length) matchesWithEvents += 1;
      const matchId = match?.id || match?.matchId || match?.utcDate || "match";

      uniqueEvents.forEach((event) => {
        const team = eventTeam(event);
        const player = eventPlayer(event);
        const assist = event?.assist || event?.assistName || event?.assistBy;
        if (!teamTotals.has(team)) {
          teamTotals.set(team, { team, goals: 0, assists: 0, penalties: 0, ownGoals: 0, players: new Set() });
        }
        const teamRow = teamTotals.get(team);

        if (isGoalEvent(event)) {
          eventGoals += 1;
          teamRow.goals += 1;
          teamRow.players.add(player);
          const row = getOrCreate(playerMap, player, team);
          if (row) {
            row.matches.add(matchId);
            if (isOwnGoal(event)) {
              row.ownGoals += 1;
              teamRow.ownGoals += 1;
              eventOwnGoals += 1;
            } else if (!useOfficialScorers) {
              // Only count event goals into the Golden Boot table when the
              // official football-data.org scorers endpoint has not supplied
              // the table yet. This prevents double-counting the same goal from
              // both scorer data and match event timelines.
              row.goals += 1;
            }
            if (isPenalty(event)) {
              row.penalties += 1;
              teamRow.penalties += 1;
              eventPenalties += 1;
            }
          }
        }

        if (assist && String(assist).trim()) {
          eventAssists += 1;
          teamRow.assists += 1;
          const assistRow = getOrCreate(playerMap, assist, team);
          if (assistRow) {
            assistRow.assists += 1;
            assistRow.matches.add(matchId);
          }
        }
      });
    });

    const scorers = Array.from(playerMap.values())
      .map((player) => ({
        ...player,
        totalInvolvements: player.goals + player.assists,
        matchCount: player.matches?.size || 0,
      }))
      .filter((player) => player.name && player.name !== this.t("unknown"))
      .sort((a, b) =>
        b.goals - a.goals ||
        b.assists - a.assists ||
        b.penalties - a.penalties ||
        a.name.localeCompare(b.name)
      )
      .slice(0, 100);

    const assistLeaders = [...scorers]
      .filter((player) => player.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 10);

    const involvementLeaders = [...scorers]
      .filter((player) => player.totalInvolvements > 0)
      .sort((a, b) => b.totalInvolvements - a.totalInvolvements || b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 10);

    const penaltyLeaders = [...scorers]
      .filter((player) => player.penalties > 0)
      .sort((a, b) => b.penalties - a.penalties || b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 6);

    const teamAttack = Array.from(teamTotals.values())
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.team.localeCompare(b.team))
      .slice(0, 10);

    const hasScorers = scorers.length > 0;
    const leader = scorers[0];
    const podium = scorers.slice(0, 3);
    const source = rawScorers.length ? (rawScorers[0]?.source || "football-data.org scorers") : (eventGoals ? "match event timeline fallback" : "football-data.org");
    const totalGoals = scorers.reduce((total, p) => total + p.goals, 0);
    const totalAssists = scorers.reduce((total, p) => total + p.assists, 0);
    const totalPens = scorers.reduce((total, p) => total + p.penalties, 0);
    const totalOwnGoals = scorers.reduce((total, p) => total + p.ownGoals, 0);

    if (!hasScorers) {
      return `
        <section class="wc-section golden-boot-hero">
          <div>
            <div class="golden-kicker">${this.t("players")}</div>
            <h2 class="golden-title">${this.t("goldenBootCentre")}</h2>
            <p>${this.t("goldenBootAutoText")}</p>
          </div>
          <div class="golden-boot-icon">🥾</div>
        </section>

        <section class="wc-section">
          <div class="wc-empty">No Golden Boot scorer data available yet.</div>
        </section>
      `;
    }

    const miniStat = (value, label) => `
      <div class="golden-mini-stat">
        <strong>${this.esc(String(value))}</strong>
        <span>${this.esc(label)}</span>
      </div>
    `;

    const compactRows = (rows, valueKey, emptyText) => rows.length ? rows.map((player, index) => `
      <div class="golden-mini-stat">
        <span>${index + 1}. ${this.esc(player.name)}<br><small>${this.flag(player.team, true)} ${this.esc(player.team)}</small></span>
        <strong>${player[valueKey]}</strong>
      </div>
    `).join("") : `<div class="wc-empty">${this.esc(emptyText)}</div>`;

    return `
      <section class="wc-section golden-boot-hero golden-boot-clean-hero">
        <div>
          <div class="golden-kicker">${this.t("players")}</div>
          <h2 class="golden-title">${this.t("goldenBootCentre")}</h2>
          <p>Official scorers first, with match-event data used only for assists, penalties and fallback coverage.</p>
        </div>
        <div class="golden-boot-icon">🥾</div>
      </section>

      <section class="wc-section golden-clean-leader">
        <div class="golden-card-head">
          <div>
            <div class="section-kicker">${this.t("goldenBoot")}</div>
            <h2>${leader ? this.esc(leader.name) : "TBC"}</h2>
            <p class="wc-muted">${leader ? `${this.flag(leader.team, true)} ${this.esc(leader.team)}` : "Leader will appear when scorer data is available."}</p>
          </div>
          <div class="golden-leader-goals golden-clean-goals">
            <strong>${leader ? leader.goals : 0}</strong>
            <span>${this.t("goals")}</span>
          </div>
        </div>

        <div class="golden-leader-strip golden-clean-strip">
          <span><strong>${leader ? leader.assists : 0}</strong>${this.t("assists")}</span>
          <span><strong>${leader ? leader.totalInvolvements : 0}</strong>G+A</span>
          <span><strong>${leader ? leader.penalties : 0}</strong>PEN</span>
          <span><strong>${leader ? leader.matchCount : 0}</strong>${this.t("matchesPlayed")}</span>
        </div>
      </section>

      <section class="wc-section golden-clean-summary">
        <div class="wc-stat-grid wc-stat-grid-compact">
          ${miniStat(scorers.length, this.t("playersTracked"))}
          ${miniStat(totalGoals, this.t("totalGoals"))}
          ${miniStat(totalAssists, this.t("totalAssists"))}
          ${miniStat(totalPens, "PEN")}
          ${miniStat(totalOwnGoals, "OG")}
          ${miniStat(matchesWithEvents, "event matches")}
        </div>
      </section>

      ${this.playerProfileCards(scorers)}

      <section class="wc-section golden-clean-podium">
        <div class="golden-card-head">
          <div>
            <div class="section-kicker">Top 3</div>
            <h2>Podium</h2>
          </div>
        </div>
        <div class="golden-podium-grid golden-podium-grid-polished golden-podium-clean">
          ${[0, 1, 2].map((i) => {
            const player = podium[i];
            const medals = ["🥇", "🥈", "🥉"];
            if (!player) {
              return `<div class="golden-podium-item golden-empty-podium"><div class="golden-medal">${medals[i]}</div><div class="golden-player-name">TBC</div></div>`;
            }
            return `
              <div class="golden-podium-item ${i === 0 ? "winner" : ""}">
                <div class="golden-medal">${medals[i]}</div>
                <div class="golden-player-name">${this.esc(player.name)}</div>
                <div class="golden-player-team">${this.flag(player.team, true)} ${this.esc(player.team)}</div>
                <div class="golden-player-stats"><strong>${player.goals}</strong><span>${this.t("goals")}</span></div>
                <div class="golden-card-stat-row">
                  <span>${player.assists} ${this.t("assists")}</span>
                  <span>${player.totalInvolvements} G+A</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>

      <section class="wc-section golden-table-card golden-clean-table-card">
        <div class="golden-card-head">
          <div>
            <div class="section-kicker">Leaderboard</div>
            <h2>Golden Boot Table</h2>
          </div>
          <div class="mini-pill">${this.t("source")}: ${this.esc(source)}</div>
        </div>
        <div class="table-wrap golden-table-wrap">
          <table class="wc-table golden-table">
            <thead>
              <tr>
                <th>${this.t("pos")}</th>
                <th>${this.t("player")}</th>
                <th>${this.t("team")}</th>
                <th>${this.t("goals")}</th>
                <th>${this.t("assists")}</th>
                <th>G+A</th>
                <th>PEN</th>
              </tr>
            </thead>
            <tbody>
              ${scorers.map((player, index) => `
                <tr class="${index < 3 ? "golden-top-row" : ""}">
                  <td><span class="golden-rank">${index + 1}</span></td>
                  <td><strong>${this.esc(player.name)}</strong></td>
                  <td><div class="group-team-cell">${this.flag(player.team, true)} <span>${this.esc(player.team)}</span></div></td>
                  <td><strong class="golden-goal-count">${player.goals}</strong></td>
                  <td>${player.assists}</td>
                  <td>${player.totalInvolvements}</td>
                  <td>${player.penalties}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  knockoutPage() {
    const fixtures = this._data.fixtures || [];
    const rounds = [
      ["LAST_32", this.t("round32")],
      ["LAST_16", this.t("round16")],
      ["QUARTER_FINALS", this.t("quarterFinals")],
      ["SEMI_FINALS", this.t("semiFinals")],
      ["FINAL", this.t("final")],
    ];

    const roundMatches = rounds.map(([stage, label]) => {
      const matches = fixtures
        .filter(m => this.normaliseKnockoutStage(m.stage) === stage)
        .sort((a, b) => {
          const aSlot = this.knockoutDerivedMatchNumber(stage, -1, a);
          const bSlot = this.knockoutDerivedMatchNumber(stage, -1, b);
          if (aSlot && bSlot && aSlot !== bSlot) return aSlot - bSlot;
          const aTime = new Date(a.utcDate || a.date || 0).getTime();
          const bTime = new Date(b.utcDate || b.date || 0).getTime();
          if (aTime !== bTime) return aTime - bTime;
          const aTeams = `${this.fixtureTeamKey(this.getHomeTeam(a))}|${this.fixtureTeamKey(this.getAwayTeam(a))}`;
          const bTeams = `${this.fixtureTeamKey(this.getHomeTeam(b))}|${this.fixtureTeamKey(this.getAwayTeam(b))}`;
          return aTeams.localeCompare(bTeams);
      });
      return { stage, label, matches };
    });

    const spiderCounts = {
      LAST_32: 16,
      LAST_16: 8,
      QUARTER_FINALS: 4,
      SEMI_FINALS: 2,
      FINAL: 1,
    };

    const spiderSlotsForRound = (stage, matches) => {
      const expected = spiderCounts[stage] || matches.length || 1;
      const start = this.knockoutRoundStarts()[stage];
      const displayOrder = this.knockoutBracketDisplayOrder(stage);
      const slots = Array.from({ length: expected }, () => null);
      const overflow = [];
      const isUnknownTeam = (team) => {
        const key = this.fixtureTeamKey(team);
        return !key || key === this.fixtureTeamKey(this.t("tbc")) || key === "tbc" || key.includes("winner") || key.includes("runner up");
      };

      if (stage === "LAST_32" && displayOrder) {
        const matchByNumber = new Map();
        const unmatched = [];
        const mergeSeededWithFixture = (seeded, fixtureMatch, matchNumber) => {
          if (!fixtureMatch) return seeded;
          const homeUnknown = isUnknownTeam(this.getHomeTeam(fixtureMatch));
          const awayUnknown = isUnknownTeam(this.getAwayTeam(fixtureMatch));
          return {
            ...seeded,
            ...fixtureMatch,
            matchNumber,
            fifaMatchNumber: matchNumber,
            homeTeam: homeUnknown ? seeded.homeTeam : fixtureMatch.homeTeam,
            awayTeam: awayUnknown ? seeded.awayTeam : fixtureMatch.awayTeam,
            score: fixtureMatch.score || seeded.score,
            source: fixtureMatch.source || seeded.source,
          };
        };

        matches.forEach((match, fallbackIndex) => {
          const number = this.knockoutDerivedMatchNumber(stage, fallbackIndex, match) || this.fixtureMatchNumber(match);
          if (number && number >= 73 && number <= 88 && !matchByNumber.has(number)) {
            matchByNumber.set(number, match);
          } else {
            unmatched.push(match);
          }
        });

        displayOrder.forEach((matchNumber, index) => {
          const fixtureMatch = matchByNumber.get(matchNumber) || null;
          const seeded = this.knockoutSeededPlaceholder(stage, index, fixtureMatch, matchNumber);
          if (!seeded) return;
          slots[index] = mergeSeededWithFixture(seeded, fixtureMatch, matchNumber);
        });

        unmatched.forEach((match) => {
          const emptyIndex = slots.findIndex((slot) => !slot || slot.source === "standings_knockout_placeholder");
          if (emptyIndex < 0) return;
          const matchNumber = displayOrder[emptyIndex];
          const seeded = this.knockoutSeededPlaceholder(stage, emptyIndex, match, matchNumber);
          slots[emptyIndex] = seeded ? mergeSeededWithFixture(seeded, match, matchNumber) : match;
        });

        return slots;
      }

      matches.forEach((match, fallbackIndex) => {
        const matchNumber = this.knockoutDerivedMatchNumber(stage, fallbackIndex, match);
        const orderedIndex = displayOrder && matchNumber ? displayOrder.indexOf(matchNumber) : -1;
        const slotIndex = orderedIndex >= 0
          ? orderedIndex
          : (start && matchNumber ? matchNumber - start : fallbackIndex);
        if (slotIndex >= 0 && slotIndex < expected && !slots[slotIndex]) {
          slots[slotIndex] = match;
        } else {
          overflow.push(match);
        }
      });

      overflow.forEach((match) => {
        const emptyIndex = slots.findIndex((slot) => !slot);
        if (emptyIndex >= 0) slots[emptyIndex] = match;
      });

      slots.forEach((match, index) => {
        if (match) return;
        const orderedMatchNumber = displayOrder?.[index] || (start ? start + index : null);
        const seeded = this.knockoutSeededPlaceholder(stage, index, null, orderedMatchNumber);
        if (seeded) slots[index] = seeded;
      });

      if (stage === "LAST_32") {
        const usedTeamKeys = new Set();
        slots.forEach((match) => {
          if (!match) return;
          [this.getHomeTeam(match), this.getAwayTeam(match)].forEach((team) => {
            if (isUnknownTeam(team)) return;
            const key = this.fixtureTeamKey(team);
            if (key) usedTeamKeys.add(key);
          });
        });

        slots.forEach((match, index) => {
          const orderedMatchNumber = displayOrder?.[index] || null;
          const seeded = this.knockoutSeededPlaceholder(stage, index, match, orderedMatchNumber);
          if (!seeded) return;
          const safeSeeded = { ...seeded };
          [this.getHomeTeam(seeded), this.getAwayTeam(seeded)].forEach((team, teamIndex) => {
            const key = this.fixtureTeamKey(team);
            if (!key || isUnknownTeam(team) || !usedTeamKeys.has(key)) return;
            if (teamIndex === 0) safeSeeded.homeTeam = { name: this.knockoutRound32SeedMap()[seeded.matchNumber]?.[0] || this.t("tbc") };
            if (teamIndex === 1) safeSeeded.awayTeam = { name: this.knockoutRound32SeedMap()[seeded.matchNumber]?.[1] || this.t("tbc") };
          });

          if (!match) {
            slots[index] = safeSeeded;
            return;
          }

          const homeUnknown = isUnknownTeam(this.getHomeTeam(match));
          const awayUnknown = isUnknownTeam(this.getAwayTeam(match));
          if (homeUnknown || awayUnknown) {
            slots[index] = {
              ...safeSeeded,
              ...match,
              homeTeam: homeUnknown ? safeSeeded.homeTeam : match.homeTeam,
              awayTeam: awayUnknown ? safeSeeded.awayTeam : match.awayTeam,
              score: match.score || safeSeeded.score,
            };
          }
        });
      }

      return slots;
    };

    const spiderMatch = (match) => {
      if (!match) {
        return `
          <div class="wc-spider-match wc-spider-match-empty">
            <div class="wc-spider-team"><span>${this.t("tbc")}</span></div>
            <div class="wc-spider-vs">0 - 0</div>
            <div class="wc-spider-team"><span>${this.t("tbc")}</span></div>
          </div>
        `;
      }

      const homeTeam = this.getHomeTeam(match);
      const awayTeam = this.getAwayTeam(match);
      const homeScore = this.getHomeScore(match);
      const awayScore = this.getAwayScore(match);
      const scoreText = homeScore !== "-" || awayScore !== "-" ? `${homeScore} - ${awayScore}` : "0 - 0";

      return `
        <div class="wc-spider-match">
          <div class="wc-spider-team">
            ${this.flag(homeTeam, true)}
            <span>${this.esc(this.localizedTeamName(homeTeam))}</span>
          </div>
          <div class="wc-spider-vs">${this.esc(scoreText)}</div>
          <div class="wc-spider-team">
            ${this.flag(awayTeam, true)}
            <span>${this.esc(this.localizedTeamName(awayTeam))}</span>
          </div>
        </div>
      `;
    };
    const roundSlots = (stage) => {
      const round = roundMatches.find((item) => item.stage === stage);
      return spiderSlotsForRound(stage, round?.matches || []);
    };
    const all32 = roundSlots("LAST_32");
    const all16 = roundSlots("LAST_16");
    const allQf = roundSlots("QUARTER_FINALS");
    const allSemi = roundSlots("SEMI_FINALS");
    const finalSlot = roundSlots("FINAL")[0] || null;

    const wikiMatch = (match, stageKey, index) => {
      const start = this.knockoutRoundStarts()[stageKey];
      const number = match
        ? this.knockoutDerivedMatchNumber(stageKey, index, match)
        : (start ? start + index : null);
      const venueInfo = match ? this.fixtureVenueInfo(match, number) : null;
      return `
        <div class="wc-wiki-match-wrap">
          <div class="wc-wiki-match-meta">
            ${number ? `<span>Match ${this.esc(number)}</span>` : `<span>${this.t("tbc")}</span>`}
            ${venueInfo?.city ? `<span>${this.esc(venueInfo.city)}</span>` : ""}
          </div>
          ${spiderMatch(match)}
        </div>
      `;
    };

    const wikiRound = (label, matches, stageKey) => `
      <div class="wc-wiki-round wc-wiki-round-${stageKey.toLowerCase().replaceAll("_", "-")}">
        <div class="wc-wiki-round-title">${label}</div>
        <div class="wc-wiki-round-stack">
          ${matches.map((match, index) => wikiMatch(match, stageKey, index)).join("")}
        </div>
      </div>
    `;
    const detailMatches = [];
    roundMatches.forEach(({ stage, label, matches }) => {
      const displayMatches = stage === "LAST_32"
        ? spiderSlotsForRound(stage, matches).filter(Boolean)
        : matches;
      displayMatches.forEach((match, index) => detailMatches.push({ stage, label, match, index }));
      if (!displayMatches.length) detailMatches.push({ stage, label, match: null, index: 0 });
    });
    const knockoutVisibleCount = Math.min(this._knockoutVisibleMatches || 12, detailMatches.length);
    const visibleDetailMatches = detailMatches.slice(0, knockoutVisibleCount);
    const hiddenKnockoutCount = Math.max(detailMatches.length - knockoutVisibleCount, 0);
    const visibleDetailRounds = visibleDetailMatches.reduce((rounds, item) => {
      const key = `${item.stage}|${item.label}`;
      if (!rounds[key]) rounds[key] = { stage: item.stage, label: item.label, items: [] };
      rounds[key].items.push(item);
      return rounds;
    }, {});

    return `
      <div class="wc-card wc-web-card">
        <div class="wc-section-title">Knockout Stage</div>
        <div class="wc-knockout-wiki">
          ${wikiRound(this.t("round32"), all32, "LAST_32")}
          ${wikiRound(this.t("round16"), all16, "LAST_16")}
          ${wikiRound(this.t("quarterFinals"), allQf, "QUARTER_FINALS")}
          ${wikiRound(this.t("semiFinals"), allSemi, "SEMI_FINALS")}
          <div class="wc-wiki-round wc-wiki-round-final">
            <div class="wc-wiki-round-title">${this.t("final")}</div>
            <div class="wc-wiki-final-stack">
              ${wikiMatch(finalSlot, "FINAL", 0)}
              <div class="wc-wiki-third-place">
                <div class="wc-wiki-round-title">${this.esc(this.staticText("thirdPlace") || "Third place")}</div>
                <div class="wc-spider-match wc-spider-match-empty">
                  <div class="wc-spider-team"><span>${this.t("tbc")}</span></div>
                  <div class="wc-spider-vs">0 - 0</div>
                  <div class="wc-spider-team"><span>${this.t("tbc")}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="wc-card">
        <div class="wc-section-title">${this.esc(this.staticText("knockoutDetails"))}</div>
        <div class="wc-bracket">
          ${Object.values(visibleDetailRounds).map(({ stage, label, items }) => `
              <div class="wc-bracket-round">
                <div class="wc-round-title">${label}</div>
                ${
                  items.length
                    ? items.map(({ match: m, index }) => {
                      if (!m) return `<div class="wc-bracket-match">${this.t("tbc")}<br><span class="wc-muted">${this.t("fixturesNotAvailable")}</span></div>`;
                      const knockoutNumber = this.knockoutDerivedMatchNumber(stage, index, m);
                      const venueInfo = this.fixtureVenueInfo(m, knockoutNumber);
                      return `
                      <div class="wc-bracket-match">
                        ${this.matchRowInner(m)}
                        <div class="wc-muted" style="text-align:center;margin-top:8px;">
                          ${knockoutNumber ? `<span>#${this.esc(knockoutNumber)}</span> · ` : ""}${this.esc(this.formatDate(m.utcDate || m.date))}
                        </div>
                        ${venueInfo?.image ? `<img src="${this.esc(venueInfo.image)}" class="fixture-stadium-image" loading="lazy">` : ""}
                        ${venueInfo ? `
                          <div class="fixture-card-venue fixture-card-venue-inline">
                            <span class="fixture-venue-name">🏟 ${this.esc(venueInfo.name)}</span>
                            ${venueInfo.realName && venueInfo.realName !== venueInfo.name ? `<span class="fixture-venue-real">${this.esc(this.t("realStadium"))}: ${this.esc(venueInfo.realName)}</span>` : ""}
                            ${venueInfo.city || venueInfo.country ? `<span class="fixture-venue-location">${this.esc([venueInfo.city, venueInfo.country ? this.localizedCountryName(venueInfo.country) : ""].filter(Boolean).join(", "))}</span>` : ""}
                            ${venueInfo.capacity ? `<span class="fixture-venue-capacity">👥 ${this.esc(venueInfo.capacity)}</span>` : ""}
                          </div>
                        ` : ""}
                      </div>
                    `}).join("")
                    : `<div class="wc-bracket-match">${this.t("tbc")}<br><span class="wc-muted">${this.t("fixturesNotAvailable")}</span></div>`
                }
              </div>
          `).join("")}
        </div>
        ${hiddenKnockoutCount ? `
          <div class="fixtures-load-more-wrap">
            <button class="overview-action-button knockout-show-more-button" type="button">
              + ${Math.min(12, hiddenKnockoutCount)} ${this.t("fixtures")}
            </button>
          </div>
        ` : ""}
      </div>
    `;
  }

  matchRowInner(m) {
    const homeTeam = this.getHomeTeam(m);
    const awayTeam = this.getAwayTeam(m);
    const homeScore = this.getHomeScore(m);
    const awayScore = this.getAwayScore(m);

    return `
      <div class="fixture-teams-big">
        ${this.teamFlagBlock(homeTeam)}

        <div class="fixture-middle">
          <div class="wc-score">${homeScore} - ${awayScore}</div>
        </div>

        ${this.teamFlagBlock(awayTeam)}
      </div>
    `;
  }

  recordsPage() {
    const a = this.statsHubAnalytics();
    const matches = a.matches || [];
    const finished = a.finished || [];

    const eventRows = finished.map((match) => {
      const events = this.normalisedMatchEvents(match);
      const goals = events.filter((event) => event.category === "goal").length;
      const cards = events.filter((event) => event.category === "card").length;
      const reds = events.filter((event) => event.category === "card" && (String(event.icon || "").includes("🟥") || String(event.detail || "").toLowerCase().includes("red"))).length;
      const subs = events.filter((event) => event.category === "substitution").length;
      const vars = events.filter((event) => event.category === "var").length;
      const homeScore = Number(this.getHomeScore(match));
      const awayScore = Number(this.getAwayScore(match));
      const totalGoals = Number.isFinite(homeScore) && Number.isFinite(awayScore) ? homeScore + awayScore : goals;
      const margin = Number.isFinite(homeScore) && Number.isFinite(awayScore) ? Math.abs(homeScore - awayScore) : 0;
      return { match, events: events.length, goals, cards, reds, subs, vars, totalGoals, margin };
    });

    const pick = (rows, sortFn) => [...rows].sort(sortFn)[0] || null;
    const highestScoring = a.highestScoringMatch || pick(eventRows, (x, y) => y.totalGoals - x.totalGoals)?.match;
    const biggestWin = a.biggestWin || pick(eventRows, (x, y) => y.margin - x.margin)?.match;
    const mostEventful = pick(eventRows, (x, y) => y.events - x.events || y.goals - x.goals);
    const cardRecord = pick(eventRows, (x, y) => y.cards - x.cards || y.reds - x.reds);
    const subRecord = pick(eventRows, (x, y) => y.subs - x.subs);
    const varRecord = pick(eventRows, (x, y) => y.vars - x.vars);

    const teamRows = a.teamRows || [];
    const disciplineRows = a.disciplineRows || [];
    const topAttack = a.topScoringTeam || teamRows[0];
    const bestDefence = a.bestDefence || [...teamRows].filter((row) => row.played).sort((x, y) => x.ga - y.ga || y.played - x.played)[0];
    const cleanSheetLeader = [...teamRows].sort((x, y) => (y.cleanSheets || 0) - (x.cleanSheets || 0) || x.team.localeCompare(y.team))[0];
    const mostCardsTeam = disciplineRows[0];
    const mostVARTeam = [...teamRows].sort((x, y) => (y.varEvents || 0) - (x.varEvents || 0) || x.team.localeCompare(y.team))[0];
    const mostSubsTeam = [...teamRows].sort((x, y) => (y.substitutions || 0) - (x.substitutions || 0) || x.team.localeCompare(y.team))[0];

    const statCard = (label, value, sub = "", accent = "#93c5fd") => `
      <div class="wc-stat" style="min-height:112px;display:flex;flex-direction:column;justify-content:center;gap:5px;background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.10);">
        <strong style="font-size:2.1rem;line-height:1;color:${accent};">${this.esc(value ?? 0)}</strong>
        <span>${this.esc(label)}</span>
        ${sub ? `<small style="color:rgba(255,255,255,.58);">${this.esc(sub)}</small>` : ""}
      </div>
    `;

    const matchRecordCard = (title, rowOrMatch, metric = "") => {
      const row = rowOrMatch?.match ? rowOrMatch : eventRows.find((item) => item.match === rowOrMatch);
      const match = rowOrMatch?.match || rowOrMatch;
      return `
        <div class="wc-card" style="overflow:hidden;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
            <div class="wc-section-title" style="margin:0;">${this.esc(title)}</div>
            ${metric ? `<span style="padding:6px 10px;border-radius:999px;background:rgba(59,130,246,.16);border:1px solid rgba(147,197,253,.24);font-weight:900;color:#bfdbfe;">${this.esc(metric)}</span>` : ""}
          </div>
          ${match ? `
            ${this.matchRow(match)}
            ${row ? `
              <div class="wc-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-top:12px;gap:8px;">
                <div class="wc-stat"><strong>${row.events}</strong>Events</div>
                <div class="wc-stat"><strong>${row.cards}</strong>Cards</div>
                <div class="wc-stat"><strong>${row.subs}</strong>Subs</div>
                <div class="wc-stat"><strong>${row.vars}</strong>VAR</div>
              </div>
            ` : ""}
          ` : `<div class="wc-empty">${this.t("noResult")}</div>`}
        </div>
      `;
    };

    const teamRecordCard = (title, row, value, sub = "") => `
      <div class="wc-stat" style="align-items:flex-start;text-align:left;min-height:112px;">
        <div style="font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#93c5fd;">${this.esc(title)}</div>
        ${row ? `
          <strong style="font-size:1.2rem;">${this.flag(row.team, true)} ${this.esc(this.localizedTeamName(row.team))}</strong>
          <div style="font-size:1.8rem;font-weight:1000;line-height:1;">${this.esc(value)}</div>
          ${sub ? `<div class="wc-muted">${this.esc(sub)}</div>` : ""}
        ` : `<div class="wc-empty">${this.t("notAvailable")}</div>`}
      </div>
    `;

    const matchRows = eventRows
      .filter((row) => row.events || row.totalGoals || row.cards || row.subs || row.vars)
      .sort((x, y) => y.events - x.events || y.totalGoals - x.totalGoals)
      .slice(0, 8)
      .map((row) => ({
        fixture: `${this.localizedTeamName(this.getHomeTeam(row.match))} v ${this.localizedTeamName(this.getAwayTeam(row.match))}`,
        score: `${this.getHomeScore(row.match)}-${this.getAwayScore(row.match)}`,
        events: row.events,
        goals: row.totalGoals,
        cards: row.cards,
        subs: row.subs,
        vars: row.vars,
      }));

    return `
      <div class="wc-card" style="overflow:hidden;position:relative;background:radial-gradient(circle at top left,rgba(250,204,21,.18),transparent 34%),radial-gradient(circle at bottom right,rgba(59,130,246,.18),transparent 36%),rgba(7,12,24,.94);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-size:.78rem;font-weight:900;text-transform:uppercase;letter-spacing:.14em;color:#fde68a;">Tournament Records</div>
            <div class="wc-section-title" style="font-size:1.65rem;margin-top:4px;">Records Centre</div>
            <p class="wc-muted" style="margin:6px 0 0;">Best matches, biggest wins, team leaders, discipline records and timeline event records in one place.</p>
          </div>
          <div style="min-width:170px;text-align:center;padding:14px;border-radius:18px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.10);">
            <div style="font-size:2.25rem;font-weight:1000;color:#fde68a;">${finished.length}</div>
            <div style="font-size:.78rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.68);">Finished matches</div>
          </div>
        </div>
      </div>

      <div class="wc-grid">
        ${statCard(this.t("highestMatchGoals"), highestScoring?.totalGoals ?? eventRows.find((row) => row.match === highestScoring)?.totalGoals ?? 0, highestScoring ? `${this.getHomeTeam(highestScoring)} v ${this.getAwayTeam(highestScoring)}` : "")}
        ${statCard(this.t("biggestMargin"), biggestWin?.margin ?? eventRows.find((row) => row.match === biggestWin)?.margin ?? 0, biggestWin ? `${this.getHomeTeam(biggestWin)} v ${this.getAwayTeam(biggestWin)}` : "", "#fca5a5")}
        ${statCard("Most Events", mostEventful?.events ?? 0, mostEventful ? `${this.getHomeTeam(mostEventful.match)} v ${this.getAwayTeam(mostEventful.match)}` : "", "#86efac")}
        ${statCard("Most Cards", cardRecord?.cards ?? 0, cardRecord ? `${cardRecord.reds} reds in match` : "", "#facc15")}
        ${statCard("Most Subs", subRecord?.subs ?? 0, subRecord ? `${this.getHomeTeam(subRecord.match)} v ${this.getAwayTeam(subRecord.match)}` : "", "#c4b5fd")}
        ${statCard("Most VAR", varRecord?.vars ?? 0, varRecord ? `${this.getHomeTeam(varRecord.match)} v ${this.getAwayTeam(varRecord.match)}` : "", "#93c5fd")}
      </div>

      <div class="wc-two">
        ${matchRecordCard(this.t("highestScoringMatch"), highestScoring, highestScoring ? `${highestScoring.totalGoals ?? eventRows.find((row) => row.match === highestScoring)?.totalGoals ?? 0} goals` : "")}
        ${matchRecordCard(this.t("biggestWin"), biggestWin, biggestWin ? `${biggestWin.margin ?? eventRows.find((row) => row.match === biggestWin)?.margin ?? 0} goal margin` : "")}
      </div>

      <div class="wc-two">
        ${matchRecordCard("Most Eventful Match", mostEventful, mostEventful ? `${mostEventful.events} events` : "")}
        ${matchRecordCard("Discipline Record", cardRecord, cardRecord ? `${cardRecord.cards} cards` : "")}
      </div>

      <div class="wc-card">
        <div class="wc-section-title">🏆 Team Records</div>
        <div class="wc-grid">
          ${teamRecordCard(this.t("topScoringTeam"), topAttack, `${topAttack?.goalsFor ?? topAttack?.gf ?? 0}`, "goals scored")}
          ${teamRecordCard(this.t("bestDefence"), bestDefence, `${bestDefence?.goalsAgainst ?? bestDefence?.ga ?? 0}`, this.t("conceded"))}
          ${teamRecordCard("Clean Sheet Leader", cleanSheetLeader, `${cleanSheetLeader?.cleanSheets ?? 0}`, "clean sheets")}
          ${teamRecordCard("Most Cards", mostCardsTeam, `${mostCardsTeam?.cards ?? 0}`, `${mostCardsTeam?.redCards ?? 0} red cards`)}
          ${teamRecordCard("Most Substitutions", mostSubsTeam, `${mostSubsTeam?.substitutions ?? 0}`, "recorded changes")}
          ${teamRecordCard("Most VAR Events", mostVARTeam, `${mostVARTeam?.varEvents ?? 0}`, "video reviews")}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">📋 Event Record Matches</div>
          ${this.statsMiniTable(matchRows, [
            { label: "Match", render: (row) => `<strong>${this.esc(row.fixture)}</strong><div class="wc-muted">${this.esc(row.score)}</div>` },
            { label: "Events", key: "events", align: "center" },
            { label: "Goals", key: "goals", align: "center" },
            { label: "Cards", key: "cards", align: "center" },
            { label: "Subs", key: "subs", align: "center" },
            { label: "VAR", key: "vars", align: "center" },
          ], "No event records yet")}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">⚽ Top Event Teams</div>
          ${this.statsMiniTable((a.eventLeaderRows || []).slice(0, 8), [
            { label: "Team", render: (row) => `<strong>${this.flag(row.team, true)} ${this.esc(row.team)}</strong>` },
            { label: "Events", key: "eventCount", align: "center" },
            { label: "Goals", key: "goals", align: "center" },
            { label: "Cards", key: "cards", align: "center" },
            { label: "VAR", key: "varEvents", align: "center" },
          ], "No team event records yet")}
        </div>
      </div>
    `;
  }

  statsPage() {
    const a = this.statsHubAnalytics();
    const eventColour = a.dataCoverage >= 80 ? "#22c55e" : (a.dataCoverage >= 40 ? "#f59e0b" : "#ef4444");
    const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
    const pct = (part, total) => total ? Math.round((part / total) * 100) : 0;

    const statCard = (label, value, sub = "", accent = "#93c5fd") => `
      <div class="wc-stat" style="min-height:106px;display:flex;flex-direction:column;justify-content:center;gap:6px;background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.042));border:1px solid rgba(255,255,255,.105);box-shadow:0 10px 30px rgba(0,0,0,.18);">
        <strong style="font-size:2rem;line-height:1;color:${accent};">${this.esc(value)}</strong>
        <span style="font-weight:900;">${this.esc(label)}</span>
        ${sub ? `<small style="color:rgba(255,255,255,.60);line-height:1.35;">${this.esc(sub)}</small>` : ""}
      </div>
    `;

    const chip = (label, value, accent = "#93c5fd") => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);">
        <span style="color:rgba(255,255,255,.68);font-weight:800;">${this.esc(label)}</span>
        <strong style="color:${accent};font-size:1.05rem;">${this.esc(value)}</strong>
      </div>
    `;

    const extractLineups = (match) => {
      const candidates = [
        match?.lineups,
        match?.lineupsData,
        match?.teamLineups,
        match?.apiFootballLineups,
        match?.matchLineups,
        match?.matchDetails?.lineups,
        match?.matchDetails?.lineupsData,
        match?.details?.lineups,
        match?.fixture?.lineups,
      ];
      for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length) return candidate;
        if (candidate && typeof candidate === "object") {
          const values = Object.values(candidate).filter(Boolean);
          if (values.length) return values;
        }
      }
      return [];
    };

    const lineupTeamName = (lineup, fallback = "") => {
      const team = lineup?.team || lineup?.teamName || lineup?.name || lineup?.side || fallback;
      if (team && typeof team === "object") return team.name || team.shortName || team.tla || fallback;
      return team || fallback;
    };

    const playerName = (player) => {
      if (!player) return "";
      if (typeof player === "string") return player;
      return player.name || player.playerName || player.fullName || player?.player?.name || player?.athlete?.displayName || "";
    };

    const playerNumber = (player) => {
      if (!player || typeof player === "string") return "";
      return player.number || player.shirtNumber || player.jerseyNumber || player?.player?.number || "";
    };

    const playersFrom = (lineup, keys) => {
      for (const key of keys) {
        const value = lineup?.[key];
        if (Array.isArray(value)) return value;
        if (value && typeof value === "object" && Array.isArray(value.players)) return value.players;
      }
      return [];
    };

    const lineupMatches = [];
    const formationMap = new Map();
    const lineupTeamMap = new Map();
    const starterMap = new Map();
    const benchMap = new Map();

    (a.matches || []).forEach((match) => {
      const lineups = extractLineups(match);
      if (!lineups.length) return;
      lineupMatches.push(match);
      lineups.forEach((lineup, index) => {
        const fallbackTeam = index === 0 ? this.getHomeTeam(match) : this.getAwayTeam(match);
        const team = this.localizedTeamName(lineupTeamName(lineup, fallbackTeam));
        const formation = lineup?.formation || lineup?.system || lineup?.tacticalFormation || lineup?.shape || "Unknown";
        const starters = playersFrom(lineup, ["startXI", "startingXI", "starters", "starting", "lineup", "players"]);
        const bench = playersFrom(lineup, ["substitutes", "subs", "bench"]);
        const key = `${this.fixtureTeamKey(team)}|${formation}`;
        const teamKey = this.fixtureTeamKey(team);

        formationMap.set(key, {
          team,
          formation,
          count: (formationMap.get(key)?.count || 0) + 1,
        });

        lineupTeamMap.set(teamKey, {
          team,
          matches: (lineupTeamMap.get(teamKey)?.matches || 0) + 1,
          starters: (lineupTeamMap.get(teamKey)?.starters || 0) + starters.length,
          bench: (lineupTeamMap.get(teamKey)?.bench || 0) + bench.length,
        });

        starters.forEach((player) => {
          const name = playerName(player);
          if (!name) return;
          const pkey = `${String(name).toLowerCase()}|${teamKey}`;
          starterMap.set(pkey, {
            player: name,
            number: playerNumber(player),
            team,
            starts: (starterMap.get(pkey)?.starts || 0) + 1,
          });
        });

        bench.forEach((player) => {
          const name = playerName(player);
          if (!name) return;
          const pkey = `${String(name).toLowerCase()}|${teamKey}`;
          benchMap.set(pkey, {
            player: name,
            number: playerNumber(player),
            team,
            bench: (benchMap.get(pkey)?.bench || 0) + 1,
          });
        });
      });
    });

    const formationRows = Array.from(formationMap.values()).sort((x, y) => y.count - x.count || x.team.localeCompare(y.team)).slice(0, 10);
    const lineupTeamRows = Array.from(lineupTeamMap.values()).sort((x, y) => y.matches - x.matches || x.team.localeCompare(y.team)).slice(0, 10);
    const starterRows = Array.from(starterMap.values()).sort((x, y) => y.starts - x.starts || x.player.localeCompare(y.player)).slice(0, 10);
    const benchRows = Array.from(benchMap.values()).sort((x, y) => y.bench - x.bench || x.player.localeCompare(y.player)).slice(0, 8);

    const totalCards = safeNumber(a.yellowCards) + safeNumber(a.redCards);
    const eventRate = a.finished.length ? (safeNumber(a.events) / a.finished.length).toFixed(1) : "0.0";
    const cardsPerMatch = a.finished.length ? (totalCards / a.finished.length).toFixed(1) : "0.0";
    const goalsPerMatch = a.goalsPerMatch || (a.finished.length ? (safeNumber(a.goals) / a.finished.length).toFixed(2) : "0.00");
    const lineupCoverage = a.finished.length ? pct(lineupMatches.length, a.finished.length) : 0;

    const teamSnapshotRows = (a.teamRows || []).slice(0, 10).map((row) => ({
      ...row,
      gdText: row.gd > 0 ? `+${row.gd}` : row.gd,
      goalRate: row.played ? (safeNumber(row.gf) / row.played).toFixed(2) : "0.00",
    }));

    return `
      <div class="wc-card" style="overflow:hidden;position:relative;background:radial-gradient(circle at top left,rgba(56,189,248,.22),transparent 34%),radial-gradient(circle at bottom right,rgba(250,204,21,.16),transparent 36%),linear-gradient(135deg,rgba(7,12,24,.97),rgba(10,18,35,.94));border:1px solid rgba(147,197,253,.18);">
        <div style="position:absolute;inset:auto -80px -120px auto;width:260px;height:260px;border-radius:999px;background:rgba(59,130,246,.10);filter:blur(4px);"></div>
        <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;">
          <div>
            <div style="font-size:.76rem;font-weight:1000;text-transform:uppercase;letter-spacing:.16em;color:#93c5fd;">${this.esc(this.staticText("tournamentIntelligence"))}</div>
            <div class="wc-section-title" style="font-size:1.7rem;margin-top:5px;">${this.esc(this.staticText("stats"))}</div>
            <p class="wc-muted" style="margin:7px 0 0;max-width:760px;line-height:1.5;">${this.esc(this.staticText("statsIntro"))}</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(110px,1fr));gap:10px;min-width:260px;">
            <div style="text-align:center;padding:13px;border-radius:18px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);">
              <div style="font-size:2rem;font-weight:1000;color:${eventColour};">${a.dataCoverage}%</div>
              <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.68);">${this.esc(this.staticText("eventCoverage"))}</div>
            </div>
            <div style="text-align:center;padding:13px;border-radius:18px;background:rgba(0,0,0,.24);border:1px solid rgba(255,255,255,.10);">
              <div style="font-size:2rem;font-weight:1000;color:#fde68a;">${lineupCoverage}%</div>
              <div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.68);">${this.esc(this.staticText("lineupCoverage"))}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="wc-grid">
        ${statCard(this.t("matchesPlayed"), a.finished.length, `${a.live.length} live • ${a.scheduled} upcoming`, "#93c5fd")}
        ${statCard(this.t("totalGoals"), a.goals, `${goalsPerMatch} goals per match`, "#86efac")}
        ${statCard("Assists", a.assists, "from match timelines", "#c4b5fd")}
        ${statCard("PEN", a.penalties, `${a.missedPens} missed pens`, "#fde68a")}
        ${statCard("OG", a.ownGoals, "own goals", "#fca5a5")}
        ${statCard("VAR", a.varEvents, "video reviews", "#67e8f9")}
        ${statCard("Yellow Cards", a.yellowCards, `${a.redCards} red cards`, "#facc15")}
        ${statCard("Substitutions", a.substitutions, "recorded changes", "#a7f3d0")}
        ${statCard(this.staticText("lineups"), lineupMatches.length, `${formationRows.length} formations tracked`, "#f0abfc")}
        ${statCard("Referees", a.refs, "officials tracked", "#fdba74")}
        ${statCard("Events / Match", eventRate, `${a.events} timeline events`, "#93c5fd")}
        ${statCard("Cards / Match", cardsPerMatch, `${totalCards} total cards`, "#fbbf24")}
      </div>

      <div class="wc-two">
        <div class="wc-card" style="background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.04));">
          <div class="wc-section-title">📊 ${this.esc(this.staticText("tournamentRates"))}</div>
          <div style="display:grid;gap:10px;">
            ${chip("Progress", `${a.progress}%`, "#93c5fd")}
            ${chip("BTTS", `${a.bttsRate}%`, "#86efac")}
            ${chip("Over 2.5 Goals", `${a.over25Rate}%`, "#fde68a")}
            ${chip("Draw Rate", `${a.drawRate}%`, "#c4b5fd")}
          </div>
        </div>

        <div class="wc-card" style="background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.04));">
          <div class="wc-section-title">📡 ${this.esc(this.staticText("dataHealth"))}</div>
          <div style="display:grid;gap:12px;">
            <div>
              <div style="display:flex;justify-content:space-between;font-weight:900;margin-bottom:6px;"><span>${this.esc(this.staticText("eventTimelines"))}</span><span>${a.dataCoverage}%</span></div>
              <div style="height:13px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden;"><div style="height:100%;width:${Math.max(0, Math.min(100, a.dataCoverage))}%;background:${eventColour};border-radius:999px;"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-weight:900;margin-bottom:6px;"><span>${this.esc(this.staticText("lineups"))}</span><span>${lineupCoverage}%</span></div>
              <div style="height:13px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden;"><div style="height:100%;width:${Math.max(0, Math.min(100, lineupCoverage))}%;background:#fde68a;border-radius:999px;"></div></div>
            </div>
            <p class="wc-muted" style="margin:0;line-height:1.45;">${this.esc(this.staticText("statsNoExtraPulls"))}</p>
          </div>
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">⚽ ${this.esc(this.staticText("teamPerformance"))}</div>
          ${this.statsMiniTable(teamSnapshotRows, [
            { label: "Team", render: (row) => `${this.flag(row.team, true)} <strong>${this.esc(row.team)}</strong>` },
            { label: "P", key: "played", align: "center" },
            { label: "GF", key: "gf", align: "center" },
            { label: "GA", key: "ga", align: "center" },
            { label: "GD", key: "gdText", align: "center" },
            { label: "G/M", key: "goalRate", align: "center" },
            { label: "CS", key: "cleanSheets", align: "center" },
          ], "No team stats yet")}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">🧠 ${this.esc(this.staticText("teamEventLeaders"))}</div>
          ${this.statsMiniTable((a.eventLeaderRows || []).slice(0, 10), [
            { label: "Team", render: (row) => `${this.flag(row.team, true)} <strong>${this.esc(row.team)}</strong>` },
            { label: "Events", key: "eventCount", align: "center" },
            { label: "Goals", key: "goals", align: "center" },
            { label: "Ast", key: "assists", align: "center" },
            { label: "PEN", key: "penalties", align: "center" },
            { label: "VAR", key: "varEvents", align: "center" },
          ], "No event data yet")}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">🧩 ${this.esc(this.staticText("lineupsFormations"))}</div>
          ${this.statsMiniTable(formationRows, [
            { label: "Team", render: (row) => `${this.flag(row.team, true)} <strong>${this.esc(row.team)}</strong>` },
            { label: "Formation", render: (row) => `<strong>${this.esc(row.formation)}</strong>`, align: "center" },
            { label: "Used", key: "count", align: "center" },
          ], "No lineup data loaded yet")}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">👥 ${this.esc(this.staticText("squadUsage"))}</div>
          ${this.statsMiniTable(lineupTeamRows, [
            { label: "Team", render: (row) => `${this.flag(row.team, true)} <strong>${this.esc(row.team)}</strong>` },
            { label: this.staticText("lineups"), key: "matches", align: "center" },
            { label: "Starters", key: "starters", align: "center" },
            { label: "Bench", key: "bench", align: "center" },
          ], this.staticText("noSquadUsageDataYet"))}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">⭐ ${this.esc(this.staticText("playerStarts"))}</div>
          ${this.statsMiniTable(starterRows, [
            { label: "Player", render: (row) => `<strong>${row.number ? `${this.esc(row.number)} ` : ""}${this.esc(row.player)}</strong><div class="wc-muted">${this.flag(row.team, true)} ${this.esc(row.team)}</div>` },
            { label: "Starts", key: "starts", align: "center" },
          ], this.staticText("noStartingXiDataYet"))}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">🪑 ${this.esc(this.staticText("benchWatch"))}</div>
          ${this.statsMiniTable(benchRows, [
            { label: "Player", render: (row) => `<strong>${row.number ? `${this.esc(row.number)} ` : ""}${this.esc(row.player)}</strong><div class="wc-muted">${this.flag(row.team, true)} ${this.esc(row.team)}</div>` },
            { label: "Bench", key: "bench", align: "center" },
          ], this.staticText("noBenchDataYet"))}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">🟨 ${this.esc(this.staticText("disciplineCentre"))}</div>
          ${this.statsMiniTable((a.disciplineRows || []).slice(0, 12), [
            { label: "Team", render: (row) => `${this.flag(row.team, true)} <strong>${this.esc(row.team)}</strong>` },
            { label: "Cards", key: "cards", align: "center" },
            { label: "Yellow", key: "yellowCards", align: "center" },
            { label: "Red", key: "redCards", align: "center" },
            { label: "Subs", key: "substitutions", align: "center" },
          ], this.staticText("noDisciplineDataYet"))}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">⭐ ${this.esc(this.staticText("playerEventWatch"))}</div>
          ${this.statsMiniTable(a.topPlayers, [
            { label: "Player", render: (row) => `<strong>${this.esc(row.player)}</strong><div class="wc-muted">${this.flag(row.team, true)} ${this.esc(row.team || "")}</div>` },
            { label: "G", key: "goals", align: "center" },
            { label: "A", key: "assists", align: "center" },
            { label: "PEN", key: "penalties", align: "center" },
            { label: "Cards", key: "cards", align: "center" },
          ], this.staticText("noPlayerEventDataYet"))}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">🧑‍⚖️ ${this.esc(this.staticText("refereeStats"))}</div>
          ${this.statsMiniTable(a.refereeRows, [
            { label: "Official", render: (row) => `<strong>${this.esc(row.name || "Unknown")}</strong><div class="wc-muted">${this.esc(row.nationality || row.country || "")}</div>` },
            { label: "Matches", key: "matches", align: "center" },
          ], this.staticText("noRefereeDataYet"))}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">🔥 ${this.esc(this.staticText("matchRecords"))}</div>
          <div style="display:grid;gap:12px;">
            <div style="padding:12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);">
              <div class="wc-muted" style="font-weight:900;margin-bottom:8px;">${this.esc(this.staticText("highestScoringMatch"))}</div>
              ${a.highestScoringMatch ? this.matchRow(a.highestScoringMatch) : `<div class="wc-empty">${this.t("noResult")}</div>`}
            </div>
            <div style="padding:12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);">
              <div class="wc-muted" style="font-weight:900;margin-bottom:8px;">${this.esc(this.staticText("biggestWin"))}</div>
              ${a.biggestWin ? this.matchRow(a.biggestWin) : `<div class="wc-empty">${this.t("noResult")}</div>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  statsHubAllMatches() {
    const sources = [
      this._data.results,
      this._data.fixtures,
      this._data.live,
      this._data.apiResultsTest,
    ];
    const byKey = new Map();

    const keyFor = (match) => {
      const id = match?.id ?? match?.matchId ?? match?.apiFootballFixtureId;
      if (id !== undefined && id !== null && id !== "") return `id:${id}`;
      return [
        this.fixtureTeamKey(this.getHomeTeam(match)),
        this.fixtureTeamKey(this.getAwayTeam(match)),
        match?.utcDate || match?.date || "",
      ].join("|");
    };

    sources.forEach((source) => {
      const list = Array.isArray(source) ? source : [];
      list.forEach((match) => {
        if (!match || typeof match !== "object") return;
        const key = keyFor(match);
        const existing = byKey.get(key) || {};
        byKey.set(key, {
          ...existing,
          ...match,
          events: Array.isArray(match.events) && match.events.length ? match.events : existing.events,
          goalEvents: Array.isArray(match.goalEvents) && match.goalEvents.length ? match.goalEvents : existing.goalEvents,
          cardEvents: Array.isArray(match.cardEvents) && match.cardEvents.length ? match.cardEvents : existing.cardEvents,
          substitutionEvents: Array.isArray(match.substitutionEvents) && match.substitutionEvents.length ? match.substitutionEvents : existing.substitutionEvents,
          varEvents: Array.isArray(match.varEvents) && match.varEvents.length ? match.varEvents : existing.varEvents,
          matchDetails: match.matchDetails || existing.matchDetails,
          referees: Array.isArray(match.referees) && match.referees.length ? match.referees : existing.referees,
          officials: Array.isArray(match.officials) && match.officials.length ? match.officials : existing.officials,
        });
      });
    });

    return Array.from(byKey.values());
  }

  statsHubAnalytics() {
    const s = this._data.statistics || {};
    const r = this._data.records || {};
    const matches = this.statsHubAllMatches();
    const finished = matches.filter((match) => this.isFinishedMatch(match));
    const live = matches.filter((match) => this.isLiveMatch(match));
    const teams = new Map();
    const players = new Map();
    const refs = new Map();
    const eventMatches = new Set();

    const stat = {
      matches,
      finished,
      live,
      scheduled: matches.filter((match) => !this.isFinishedMatch(match) && !this.isLiveMatch(match)).length,
      goals: Number(s.total_goals ?? 0) || 0,
      assists: 0,
      ownGoals: 0,
      penalties: 0,
      missedPens: 0,
      yellowCards: 0,
      redCards: 0,
      cards: 0,
      substitutions: 0,
      varEvents: 0,
      events: 0,
      eventMatches: 0,
      refs: 0,
      topPlayers: [],
      teamRows: [],
      disciplineRows: [],
      refereeRows: [],
      dataCoverage: 0,
      progress: s.progress ?? 0,
      goalsPerMatch: s.goals_per_match ?? 0,
      draws: s.draws ?? 0,
      drawRate: s.draw_rate ?? 0,
      bttsRate: s.btts_rate ?? 0,
      over25Rate: s.over_25_rate ?? 0,
      biggestWin: r.biggest_win,
      highestScoringMatch: r.highest_scoring_match,
      topScoringTeam: r.top_scoring_team,
      bestDefence: r.best_defence,
    };

    const ensureTeam = (team) => {
      const label = this.localizedTeamName(team || this.t("unknown"));
      const key = this.fixtureTeamKey(label);
      if (!teams.has(key)) {
        teams.set(key, {
          team: label,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          goals: 0,
          assists: 0,
          ownGoals: 0,
          penalties: 0,
          yellowCards: 0,
          redCards: 0,
          cards: 0,
          substitutions: 0,
          varEvents: 0,
          cleanSheets: 0,
          eventCount: 0,
        });
      }
      return teams.get(key);
    };

    const addPlayer = (name, team, field) => {
      if (!name) return;
      const key = `${String(name).toLowerCase()}|${this.fixtureTeamKey(team)}`;
      if (!players.has(key)) {
        players.set(key, { player: name, team: this.localizedTeamName(team || ""), goals: 0, assists: 0, penalties: 0, ownGoals: 0, cards: 0 });
      }
      players.get(key)[field] = (players.get(key)[field] || 0) + 1;
    };

    finished.forEach((match) => {
      const home = this.getHomeTeam(match);
      const away = this.getAwayTeam(match);
      const homeScore = Number(this.getHomeScore(match));
      const awayScore = Number(this.getAwayScore(match));
      const homeRow = ensureTeam(home);
      const awayRow = ensureTeam(away);

      if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.gf += homeScore;
        homeRow.ga += awayScore;
        awayRow.gf += awayScore;
        awayRow.ga += homeScore;
        if (awayScore === 0) homeRow.cleanSheets += 1;
        if (homeScore === 0) awayRow.cleanSheets += 1;
        if (homeScore > awayScore) { homeRow.wins += 1; awayRow.losses += 1; }
        else if (awayScore > homeScore) { awayRow.wins += 1; homeRow.losses += 1; }
        else { homeRow.draws += 1; awayRow.draws += 1; }
      }
    });

    matches.forEach((match) => {
      const events = this.normalisedMatchEvents(match);
      if (events.length) eventMatches.add(match?.id ?? match?.matchId ?? `${this.getHomeTeam(match)}-${this.getAwayTeam(match)}-${match?.utcDate || match?.date || ""}`);
      stat.events += events.length;

      events.forEach((event) => {
        const teamRow = ensureTeam(event.team || this.t("unknown"));
        teamRow.eventCount += 1;
        if (event.category === "goal") {
          stat.goals += stat.goals ? 0 : 1;
          teamRow.goals += 1;
          addPlayer(event.player, event.team, "goals");
          if (event.assist) {
            stat.assists += 1;
            teamRow.assists += 1;
            addPlayer(event.assist, event.team, "assists");
          }
          if (event.isOwnGoal) { stat.ownGoals += 1; teamRow.ownGoals += 1; addPlayer(event.player, event.team, "ownGoals"); }
          if (event.isPenalty) { stat.penalties += 1; teamRow.penalties += 1; addPlayer(event.player, event.team, "penalties"); }
          if (event.isMissedPenalty) stat.missedPens += 1;
        }
        if (event.category === "card") {
          stat.cards += 1;
          teamRow.cards += 1;
          addPlayer(event.player, event.team, "cards");
          if (String(event.icon).includes("🟥") || String(event.detail).toLowerCase().includes("red")) {
            stat.redCards += 1;
            teamRow.redCards += 1;
          } else {
            stat.yellowCards += 1;
            teamRow.yellowCards += 1;
          }
        }
        if (event.category === "substitution") {
          stat.substitutions += 1;
          teamRow.substitutions += 1;
        }
        if (event.category === "var") {
          stat.varEvents += 1;
          teamRow.varEvents += 1;
        }
      });

      this.matchReferees(match).forEach((ref) => {
        const key = String(ref.name || "").toLowerCase();
        if (!key) return;
        refs.set(key, { ...ref, matches: (refs.get(key)?.matches || 0) + 1 });
      });
    });

    // Prefer official/statistics total goals when available, but use timeline totals if the official total is missing.
    const eventGoalTotal = Array.from(teams.values()).reduce((sum, row) => sum + row.goals, 0);
    if (!stat.goals && eventGoalTotal) stat.goals = eventGoalTotal;

    teams.forEach((row) => { row.gd = row.gf - row.ga; });
    stat.eventMatches = eventMatches.size;
    stat.refs = refs.size;
    stat.dataCoverage = finished.length ? Math.round((eventMatches.size / finished.length) * 100) : 0;
    stat.teamRows = Array.from(teams.values()).sort((a, b) => b.gf - a.gf || b.gd - a.gd || a.team.localeCompare(b.team));
    stat.disciplineRows = Array.from(teams.values()).sort((a, b) => b.cards - a.cards || b.redCards - a.redCards || a.team.localeCompare(b.team));
    stat.eventLeaderRows = Array.from(teams.values()).sort((a, b) => b.eventCount - a.eventCount || b.goals - a.goals || a.team.localeCompare(b.team));
    stat.topPlayers = Array.from(players.values())
      .sort((a, b) => (b.goals + b.assists + b.cards) - (a.goals + a.assists + a.cards) || b.goals - a.goals || a.player.localeCompare(b.player))
      .slice(0, 10);
    stat.refereeRows = Array.from(refs.values()).sort((a, b) => b.matches - a.matches || String(a.name).localeCompare(String(b.name))).slice(0, 8);

    return stat;
  }

  statsMiniTable(rows, columns, emptyText = "No data yet") {
    if (!rows || !rows.length) return `<div class="wc-empty">${this.esc(emptyText)}</div>`;
    return `
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:separate;border-spacing:0 8px;font-size:.92rem;">
          <thead>
            <tr>${columns.map((col) => `<th style="text-align:${col.align || "left"};color:rgba(255,255,255,.62);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;padding:0 8px;white-space:nowrap;">${this.esc(col.label)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr style="background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);">
                ${columns.map((col, index) => `<td style="padding:10px 8px;text-align:${col.align || "left"};white-space:nowrap;${index === 0 ? "border-radius:12px 0 0 12px;" : ""}${index === columns.length - 1 ? "border-radius:0 12px 12px 0;" : ""}">${col.render ? col.render(row) : this.esc(row[col.key] ?? "-")}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  teamCentreOptions() {
    const teams = new Map();
    const addTeam = (team) => {
      const label = this.localizedTeamName(team || "");
      const key = this.fixtureTeamKey(label);
      if (!key || key === this.fixtureTeamKey(this.t("tbc"))) return;
      if (!teams.has(key)) teams.set(key, label);
    };

    this.statsHubAllMatches().forEach((match) => {
      addTeam(this.getHomeTeam(match));
      addTeam(this.getAwayTeam(match));
    });

    (Array.isArray(this._data.standings) ? this._data.standings : []).forEach((group) => {
      const rows = group?.table || group?.standings || group?.teams || [];
      (Array.isArray(rows) ? rows : []).forEach((row) => addTeam(row.team || row.name || row));
    });

    (Array.isArray(this._data.scorers) ? this._data.scorers : []).forEach((scorer) => {
      addTeam(this.scorerTeamName(scorer));
    });

    return Array.from(teams.entries())
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  selectedTeamOption() {
    const options = this.teamCentreOptions();
    if (!options.length) return null;
    const selected = options.find((team) => team.key === this._selectedTeamKey) || options[0];
    if (selected.key !== this._selectedTeamKey) {
      this._selectedTeamKey = selected.key;
      localStorage.setItem("world_cup_2026_selected_team", selected.key);
    }
    return selected;
  }

  teamCentreGroupRow(teamKey) {
    for (const group of (Array.isArray(this._data.groups) ? this._data.groups : [])) {
      const rows = group?.table || group?.standings || group?.teams || [];
      for (const row of (Array.isArray(rows) ? rows : [])) {
        const team = row.team || row.name || row;
        if (this.fixtureTeamKey(team) !== teamKey) continue;
        return {
          group: group.group || group.name || group.stage || "",
          pos: row.position ?? row.rank ?? row.pos ?? "",
          played: row.playedGames ?? row.played ?? row.matchesPlayed ?? "",
          wins: row.won ?? row.wins ?? "",
          draws: row.draw ?? row.draws ?? "",
          losses: row.lost ?? row.losses ?? "",
          gf: row.goalsFor ?? row.gf ?? "",
          ga: row.goalsAgainst ?? row.ga ?? "",
          gd: row.goalDifference ?? row.gd ?? "",
          points: row.points ?? row.pts ?? "",
        };
      }
    }
    return null;
  }

  teamCentreMatchRows(matches, teamKey) {
    return matches.map((match) => {
      const home = this.getHomeTeam(match);
      const away = this.getAwayTeam(match);
      const isHome = this.fixtureTeamKey(home) === teamKey;
      const opponent = isHome ? away : home;
      const homeScore = this.getHomeScore(match);
      const awayScore = this.getAwayScore(match);
      const hasScore = homeScore !== "-" || awayScore !== "-";
      const venue = this.fixtureVenueInfo(match);
      return {
        date: this.formatDate(match.utcDate || match.date),
        opponent: `${isHome ? "v" : "@"} ${this.localizedTeamName(opponent)}`,
        score: hasScore ? `${homeScore} - ${awayScore}` : this.statusLabel(match.status, match) || this.t("scheduled"),
        status: this.statusLabel(match.status, match) || "",
        venue: venue?.name || match.venue || match.stadium || "",
      };
    });
  }

  dedupeTeamCentreMatches(matches, teamKey) {
    const merged = this.mergeUniqueMatches(Array.isArray(matches) ? matches : [], []);
    const byKey = new Map();
    const scoreWeight = (match) => {
      let weight = 0;
      if (this.isLiveMatch(match)) weight += 10;
      if (this.isFinishedMatch(match)) weight += 8;
      if (this.getHomeScore(match) !== "-" || this.getAwayScore(match) !== "-") weight += 4;
      if (this.normalisedMatchEvents(match).length) weight += 3;
      if (match.matchNumber || match.fifaMatchNumber) weight += 2;
      return weight;
    };

    merged.forEach((match) => {
      const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
      const awayKey = this.fixtureTeamKey(this.getAwayTeam(match));
      if (homeKey !== teamKey && awayKey !== teamKey) return;
      const opponentKey = homeKey === teamKey ? awayKey : homeKey;
      const rawDate = match.utcDate || match.date || "";
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const day = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString().slice(0, 10) : "";
      const number = this.fixtureMatchNumber(match) || "";
      const stage = this.normaliseKnockoutStage(match.stage) || String(match.group || match.round || match.stage || "").toLowerCase();
      const key = number
        ? `number:${number}`
        : `${teamKey}|${opponentKey}|${day}|${stage}`;
      const existing = byKey.get(key);
      if (!existing || scoreWeight(match) > scoreWeight(existing)) {
        byKey.set(key, existing ? this.mergeUniqueMatches([existing], [match])[0] : match);
      }
    });

    return Array.from(byKey.values());
  }

  teamsPage() {
    const selected = this.selectedTeamOption();
    const options = this.teamCentreOptions();
    const a = this.statsHubAnalytics();

    if (!selected) {
      return `<div class="wc-card"><div class="wc-empty">${this.esc(this.staticText("noTeamsLoadedYet"))}</div></div>`;
    }

    const teamKey = selected.key;
    const teamName = selected.name;
    const matches = this.dedupeTeamCentreMatches(this.statsHubAllMatches(), teamKey)
      .filter((match) => this.fixtureTeamKey(this.getHomeTeam(match)) === teamKey || this.fixtureTeamKey(this.getAwayTeam(match)) === teamKey)
      .sort((x, y) => new Date(x.utcDate || x.date || 0) - new Date(y.utcDate || y.date || 0));
    const finished = matches.filter((match) => this.isFinishedMatch(match));
    const live = matches.filter((match) => this.isLiveMatch(match));
    const upcoming = matches.filter((match) => !this.isFinishedMatch(match) && !this.isLiveMatch(match));
    const nextMatch = live[0] || upcoming[0] || null;
    const recent = finished.slice(-5).reverse();
    const teamStats = (a.teamRows || []).find((row) => this.fixtureTeamKey(row.team) === teamKey) || {
      played: finished.length, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, goals: 0, assists: 0,
      cards: 0, yellowCards: 0, redCards: 0, substitutions: 0, varEvents: 0, cleanSheets: 0,
    };
    const groupRow = this.teamCentreGroupRow(teamKey);
    const groupRows = (() => {
      for (const group of (Array.isArray(this._data.groups) ? this._data.groups : [])) {
        const rows = group?.table || group?.standings || group?.teams || [];
        const normalised = (Array.isArray(rows) ? rows : []).map((row) => {
          const team = row.team || row.name || row;
          return {
            team: this.localizedTeamName(team),
            key: this.fixtureTeamKey(team),
            pos: row.position ?? row.rank ?? row.pos ?? "",
            played: row.playedGames ?? row.played ?? row.matchesPlayed ?? "",
            gd: row.goalDifference ?? row.gd ?? "",
            points: row.points ?? row.pts ?? "",
          };
        });
        if (normalised.some((row) => row.key === teamKey)) return normalised;
      }
      return [];
    })();
    const events = matches.flatMap((match) => this.normalisedMatchEvents(match).filter((event) => this.fixtureTeamKey(event.team) === teamKey));
    const goals = events.filter((event) => event.category === "goal").length;
    const yellowCardsFromEvents = events.filter((event) => event.category === "card" && !(String(event.icon || "").includes("🟥") || String(event.detail || "").toLowerCase().includes("red"))).length;
    const redCardsFromEvents = events.filter((event) => event.category === "card" && (String(event.icon || "").includes("🟥") || String(event.detail || "").toLowerCase().includes("red"))).length;
    const cards = yellowCardsFromEvents + redCardsFromEvents;
    const teamYellowCards = Number(teamStats.yellowCards || 0) || yellowCardsFromEvents;
    const teamRedCards = Number(teamStats.redCards || 0) || redCardsFromEvents;
    const subs = events.filter((event) => event.category === "substitution").length;
    const vars = events.filter((event) => event.category === "var").length;
    const playerRows = (a.topPlayers || [])
      .filter((row) => this.fixtureTeamKey(row.team) === teamKey)
      .map((row) => ({ ...row, total: (row.goals || 0) + (row.assists || 0) + (row.cards || 0) }))
      .sort((x, y) => (y.total || 0) - (x.total || 0));
    const spotlightPlayer = playerRows[0];

    const matchStage = (match) => this.stageLabel(match?.stage || match?.round || match?.matchday || match?.group || "") || match?.stage || match?.round || "World Cup Match";
    const matchDateTime = (match) => {
      const raw = match?.utcDate || match?.date;
      const date = this.formatDate(raw);
      const time = this.formatTime ? this.formatTime(raw) : "";
      return [date, time].filter(Boolean).join(" • ");
    };
    const matchVenue = (match) => {
      const venue = this.fixtureVenueInfo(match);
      return venue?.name || match?.venue || match?.stadium || "Venue TBC";
    };
    const matchTeams = (match) => {
      const home = this.localizedTeamName(this.getHomeTeam(match));
      const away = this.localizedTeamName(this.getAwayTeam(match));
      return { home, away };
    };
    const matchScore = (match) => {
      const hs = this.getHomeScore(match);
      const as = this.getAwayScore(match);
      return hs !== "-" || as !== "-" ? `${hs} - ${as}` : "v";
    };
    const matchResultClass = (match) => {
      if (!this.isFinishedMatch(match)) return this.isLiveMatch(match) ? "LIVE" : "UPCOMING";
      const homeKey = this.fixtureTeamKey(this.getHomeTeam(match));
      const hs = Number(this.getHomeScore(match));
      const as = Number(this.getAwayScore(match));
      if (!Number.isFinite(hs) || !Number.isFinite(as)) return "FT";
      if (hs === as) return "DRAW";
      const teamWon = homeKey === teamKey ? hs > as : as > hs;
      return teamWon ? "WIN" : "LOSS";
    };
    const opponentText = (match) => {
      const home = this.getHomeTeam(match);
      const away = this.getAwayTeam(match);
      const isHome = this.fixtureTeamKey(home) === teamKey;
      const opponent = this.localizedTeamName(isHome ? away : home);
      return `${isHome ? "v" : "@"} ${opponent}`;
    };
    const statCard = (label, value, sub = "", accent = "#93c5fd") => `
      <div style="min-height:86px;padding:13px;border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.045));border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 38px rgba(0,0,0,.22);display:flex;flex-direction:column;justify-content:center;gap:7px;">
        <strong style="font-size:1.66rem;line-height:1;color:${accent};font-weight:1000;letter-spacing:-.04em;">${this.esc(value ?? 0)}</strong>
        <span style="font-size:.72rem;font-weight:1000;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.82);">${this.esc(label)}</span>
        ${sub ? `<em style="font-size:.74rem;color:rgba(255,255,255,.58);font-style:normal;line-height:1.35;">${this.esc(sub)}</em>` : ""}
      </div>
    `;
    const tinyPill = (text, accent = "#93c5fd") => `<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:${accent}22;border:1px solid ${accent}55;color:rgba(255,255,255,.9);font-size:.72rem;font-weight:1000;text-transform:uppercase;letter-spacing:.04em;">${this.esc(text)}</span>`;

    const nextMatchCard = nextMatch ? (() => {
      const teams = matchTeams(nextMatch);
      const status = this.isLiveMatch(nextMatch) ? "LIVE NOW" : "NEXT MATCH";
      return `
        <div style="position:relative;overflow:hidden;border-radius:28px;padding:22px;background:radial-gradient(circle at 18% 0%,rgba(34,197,94,.22),transparent 34%),radial-gradient(circle at 96% 8%,rgba(59,130,246,.18),transparent 35%),rgba(4,10,22,.72);border:1px solid rgba(255,255,255,.13);box-shadow:0 22px 46px rgba(0,0,0,.28);">
          <div style="position:absolute;right:-22px;top:-28px;opacity:.08;font-size:9rem;font-weight:1000;line-height:1;">${this.esc(teamName.slice(0, 3).toUpperCase())}</div>
          <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
            ${tinyPill(status, this.isLiveMatch(nextMatch) ? "#22c55e" : "#60a5fa")}
            ${tinyPill(matchStage(nextMatch), "#facc15")}
          </div>
          <div style="position:relative;display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;">
            <div style="text-align:right;font-size:1.25rem;font-weight:1000;min-width:0;">${this.flag(teams.home, true)} ${this.esc(teams.home)}</div>
            <div style="min-width:92px;text-align:center;font-size:2.05rem;font-weight:1000;color:#fff;text-shadow:0 0 18px rgba(255,255,255,.25);">${this.esc(matchScore(nextMatch))}</div>
            <div style="text-align:left;font-size:1.25rem;font-weight:1000;min-width:0;">${this.flag(teams.away, true)} ${this.esc(teams.away)}</div>
          </div>
          <div style="position:relative;margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
            <div style="padding:11px 13px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);"><strong>🕒 ${this.esc(matchDateTime(nextMatch) || "Time TBC")}</strong></div>
            <div style="padding:11px 13px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);"><strong>📍 ${this.esc(matchVenue(nextMatch))}</strong></div>
          </div>
        </div>
      `;
    })() : `<div class="wc-empty">${this.esc(this.staticText("noTeamUpcomingMatch"))}</div>`;

    const recentCards = recent.length ? recent.map((match) => {
      const badge = matchResultClass(match);
      const accent = badge === "WIN" ? "#22c55e" : badge === "LOSS" ? "#ef4444" : "#facc15";
      return `
        <div style="display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;padding:12px 13px;border-radius:17px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.09);">
          <span style="min-width:50px;text-align:center;padding:6px 8px;border-radius:999px;background:${accent}24;border:1px solid ${accent}66;color:${accent};font-size:.72rem;font-weight:1000;">${this.esc(badge)}</span>
          <div style="min-width:0;"><strong>${this.esc(opponentText(match))}</strong><div class="wc-muted">${this.esc(matchDateTime(match))}</div></div>
          <strong style="font-size:1.08rem;">${this.esc(matchScore(match))}</strong>
        </div>
      `;
    }).join("") : `<div class="wc-empty">${this.esc(this.staticText("noTeamResults"))}</div>`;

    const timeline = matches.length ? matches.map((match, index) => {
      const status = matchResultClass(match);
      const isNow = this.isLiveMatch(match);
      const isDone = this.isFinishedMatch(match);
      const accent = isNow ? "#22c55e" : isDone ? "#60a5fa" : "#facc15";
      return `
        <div style="position:relative;display:grid;grid-template-columns:36px 1fr auto;gap:12px;align-items:start;padding:0 0 18px;">
          <div style="position:relative;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:${accent}30;border:1px solid ${accent}88;color:#fff;font-weight:1000;box-shadow:0 0 18px ${accent}33;">${isDone ? "✓" : isNow ? "●" : index + 1}</div>
          <div style="padding:13px 14px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <strong>${this.esc(matchStage(match))}</strong>
              ${tinyPill(status, accent)}
            </div>
            <div style="margin-top:8px;font-size:1rem;font-weight:950;">${this.esc(opponentText(match))} <span style="color:rgba(255,255,255,.55);">${this.esc(matchScore(match))}</span></div>
            <div class="wc-muted" style="margin-top:5px;">${this.esc(matchDateTime(match))} • ${this.esc(matchVenue(match))}</div>
          </div>
        </div>
      `;
    }).join("") : `<div class="wc-empty">${this.esc(this.staticText("noTeamFixtures"))}</div>`;

    const groupSnapshot = groupRows.length ? groupRows.map((row) => `
      <div style="display:grid;grid-template-columns:34px 1fr 44px 44px;gap:8px;align-items:center;padding:10px 11px;border-radius:14px;background:${row.key === teamKey ? "rgba(96,165,250,.18)" : "rgba(255,255,255,.055)"};border:1px solid ${row.key === teamKey ? "rgba(96,165,250,.42)" : "rgba(255,255,255,.08)"};">
        <strong style="text-align:center;color:rgba(255,255,255,.66);">${this.esc(row.pos || "-")}</strong>
        <strong style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this.flag(row.team, true)} ${this.esc(row.team)}</strong>
        <span style="text-align:center;color:rgba(255,255,255,.66);font-weight:900;">${this.esc(row.gd || 0)}</span>
        <strong style="text-align:center;color:#facc15;">${this.esc(row.points || 0)}</strong>
      </div>
    `).join("") : `<div class="wc-empty">${this.esc(this.staticText("noTeamGroupTable"))}</div>`;

    const playerSpotlight = spotlightPlayer ? `
      <div style="padding:18px;border-radius:23px;background:radial-gradient(circle at top left,rgba(250,204,21,.2),transparent 38%),rgba(255,255,255,.06);border:1px solid rgba(250,204,21,.22);">
        <div style="font-size:.74rem;font-weight:1000;text-transform:uppercase;letter-spacing:.14em;color:#fde68a;">⭐ ${this.esc(this.staticText("playerSpotlight"))}</div>
        <div style="margin-top:10px;font-size:1.35rem;font-weight:1000;">${this.esc(spotlightPlayer.player || "Team Player")}</div>
        <div class="wc-muted" style="margin-top:4px;">${this.esc(teamName)}</div>
        <div style="margin-top:15px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px;">
          ${statCard("Goals", spotlightPlayer.goals || 0, "", "#fde68a")}
          ${statCard("Assists", spotlightPlayer.assists || 0, "", "#93c5fd")}
          ${statCard("Cards", spotlightPlayer.cards || 0, "", "#fca5a5")}
        </div>
      </div>
    ` : `<div class="wc-empty">${this.esc(this.staticText("noTeamPlayerEvents"))}</div>`;

    const resultDots = recent.length ? recent.map((match) => {
      const result = matchResultClass(match);
      const accent = result === "WIN" ? "#22c55e" : result === "LOSS" ? "#ef4444" : "#facc15";
      const label = result === "WIN" ? "W" : result === "LOSS" ? "L" : result === "DRAW" ? "D" : "-";
      return `<span title="${this.esc(result)}" style="display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:${accent}25;border:1px solid ${accent}77;color:${accent};font-weight:1000;box-shadow:0 0 18px ${accent}22;">${label}</span>`;
    }).join("") : `<span class="wc-muted">${this.esc(this.staticText("noFormDataYet"))}</span>`;

    const uniqueVenues = [];
    matches.forEach((match) => {
      const venue = matchVenue(match);
      if (venue && venue !== "Venue TBC" && !uniqueVenues.includes(venue)) uniqueVenues.push(venue);
    });
    const nextVenue = nextMatch ? matchVenue(nextMatch) : "Venue TBC";
    const stadiumTracker = uniqueVenues.length ? uniqueVenues.slice(0, 5).map((venue) => `
      <div style="padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-weight:900;">🏟 ${this.esc(venue)}</div>
    `).join("") : `<div class="wc-empty">${this.esc(this.staticText("noTeamStadiumData"))}</div>`;

    const topPlayerList = playerRows.length ? playerRows.slice(0, 5).map((player, index) => `
      <div style="display:grid;grid-template-columns:34px 1fr repeat(3,44px);gap:8px;align-items:center;padding:11px 12px;border-radius:15px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);">
        <strong style="text-align:center;color:#93c5fd;">${index + 1}</strong>
        <strong style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this.esc(player.player || "Player")}</strong>
        <span style="text-align:center;color:#fde68a;font-weight:1000;">${this.esc(player.goals || 0)}</span>
        <span style="text-align:center;color:#93c5fd;font-weight:1000;">${this.esc(player.assists || 0)}</span>
        <span style="text-align:center;color:#fca5a5;font-weight:1000;">${this.esc(player.cards || 0)}</span>
      </div>
    `).join("") : `<div class="wc-empty">${this.esc(this.staticText("noCountryPlayerData"))}</div>`;

    const upcomingList = upcoming.length ? upcoming.slice(0, 6).map((match) => {
      const teams = matchTeams(match);
      return `
        <div style="padding:13px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;">
            <strong>${this.flag(teams.home, true)} ${this.esc(teams.home)} <span style="color:rgba(255,255,255,.48);">v</span> ${this.flag(teams.away, true)} ${this.esc(teams.away)}</strong>
            ${tinyPill(matchStage(match), "#60a5fa")}
          </div>
          <div class="wc-muted" style="margin-top:6px;">${this.esc(matchDateTime(match) || "Time TBC")} • ${this.esc(matchVenue(match))}</div>
        </div>
      `;
    }).join("") : `<div class="wc-empty">${this.esc(this.staticText("noUpcomingFixturesTeam"))}</div>`;

    const resultList = finished.length ? finished.slice(-6).reverse().map((match) => {
      const teams = matchTeams(match);
      const badge = matchResultClass(match);
      const accent = badge === "WIN" ? "#22c55e" : badge === "LOSS" ? "#ef4444" : "#facc15";
      return `
        <div style="padding:13px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;">
            <strong>${this.flag(teams.home, true)} ${this.esc(teams.home)} <span style="color:#fff;">${this.esc(matchScore(match))}</span> ${this.flag(teams.away, true)} ${this.esc(teams.away)}</strong>
            ${tinyPill(badge, accent)}
          </div>
          <div class="wc-muted" style="margin-top:6px;">${this.esc(matchDateTime(match))} • ${this.esc(matchVenue(match))}</div>
        </div>
      `;
    }).join("") : `<div class="wc-empty">${this.esc(this.staticText("noResultsTeam"))}</div>`;

    const stages = ["Group Stage", "Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Final"];
    const stageCards = stages.map((stage) => {
      const stageKey = this.fixtureTeamKey(stage);
      const stageMatches = matches.filter((match) => this.fixtureTeamKey(matchStage(match)).includes(stageKey) || this.fixtureTeamKey(match?.stage || match?.round || "").includes(stageKey));
      const done = stageMatches.some((match) => this.isFinishedMatch(match));
      const now = stageMatches.some((match) => this.isLiveMatch(match));
      const future = stageMatches.some((match) => !this.isFinishedMatch(match) && !this.isLiveMatch(match));
      const accent = done ? "#22c55e" : now ? "#facc15" : future ? "#60a5fa" : "rgba(255,255,255,.22)";
      const icon = done ? "✓" : now ? "●" : future ? "→" : "";
      return `<div style="padding:12px;border-radius:16px;background:${done || now || future ? accent + "22" : "rgba(255,255,255,.045)"};border:1px solid ${done || now || future ? accent + "77" : "rgba(255,255,255,.08)"};font-weight:1000;text-align:center;">${icon} ${this.esc(stage)}</div>`;
    }).join("");

    const countryProfile = `
      <div style="position:relative;overflow:hidden;padding:20px;border-radius:24px;background:radial-gradient(circle at 8% 0%,rgba(96,165,250,.2),transparent 36%),linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.11);">
        <div style="position:absolute;right:-10px;bottom:-34px;font-size:7rem;font-weight:1000;opacity:.05;line-height:1;">${this.esc(teamName.slice(0, 3).toUpperCase())}</div>
        <div style="position:relative;font-size:.74rem;font-weight:1000;text-transform:uppercase;letter-spacing:.14em;color:#93c5fd;">🌍 ${this.esc(this.staticText("countryProfile"))}</div>
        <div style="position:relative;margin-top:9px;font-size:1.45rem;font-weight:1000;">${this.flag(teamName, true)} ${this.esc(teamName)}</div>
        <div style="position:relative;margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;">
          ${statCard(this.staticText("upcomingMatches"), upcoming.length, this.staticText("loadedForTeam"), "#93c5fd")}
          ${statCard(this.staticText("groupPosition"), groupRow?.pos || groupRows.find((row) => row.key === teamKey)?.pos || "-", this.staticText("currentSnapshot"), "#fde68a")}
          ${statCard(this.staticText("points"), groupRow?.points ?? groupRows.find((row) => row.key === teamKey)?.points ?? "-", this.staticText("groupTable"), "#86efac")}
        </div>
      </div>
    `;

    const squadOverview = `
      <div class="wc-card" style="background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.11);">
        <div class="wc-section-title">👥 ${this.esc(this.staticText("countryPlayers"))}</div>
        <div class="wc-muted" style="margin-bottom:10px;">${this.esc(this.staticText("playerCardsBuilt"))}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:12px;">
          ${statCard(this.staticText("players"), playerRows.length, this.staticText("tracked"), "#c4b5fd")}
          ${statCard(this.staticText("goals"), playerRows.reduce((sum, p) => sum + Number(p.goals || 0), 0), this.staticText("byPlayers"), "#fde68a")}
          ${statCard(this.staticText("assists"), playerRows.reduce((sum, p) => sum + Number(p.assists || 0), 0), this.staticText("byPlayers"), "#93c5fd")}
        </div>
        <div style="display:grid;grid-template-columns:34px 1fr repeat(3,44px);gap:8px;padding:0 12px 8px;color:rgba(255,255,255,.52);font-size:.7rem;font-weight:1000;text-transform:uppercase;letter-spacing:.06em;"><span>#</span><span>Player</span><span style="text-align:center;">G</span><span style="text-align:center;">A</span><span style="text-align:center;">C</span></div>
        <div style="display:grid;gap:8px;">${topPlayerList}</div>
      </div>
    `;

    const compactCardStyle = "background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.11);height:100%;";
    const disciplineCard = `
      <div class="wc-card" style="${compactCardStyle}">
        <div class="wc-section-title">🟨 ${this.esc(this.staticText("teamDiscipline"))}</div>
        <div class="wc-muted" style="margin:6px 0 12px;">${this.esc(teamName)}: ${this.esc(this.staticText("cardsForTeam"))}</div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;">
          ${statCard(this.staticText("yellow"), teamYellowCards, this.t("yellowCards"), "#fde68a")}
          ${statCard(this.staticText("red"), teamRedCards, this.t("redCards"), "#fca5a5")}
          ${statCard(this.staticText("total"), cards || teamStats.cards || 0, this.staticText("allCards"), "#c4b5fd")}
        </div>
      </div>
    `;

    return `
      <div style="position:relative;overflow:hidden;border-radius:28px;padding:18px;margin-bottom:14px;background:radial-gradient(circle at 12% 0%,rgba(96,165,250,.24),transparent 34%),radial-gradient(circle at 96% 14%,rgba(250,204,21,.18),transparent 35%),linear-gradient(145deg,rgba(8,15,31,.96),rgba(2,6,23,.94));border:1px solid rgba(255,255,255,.13);box-shadow:0 24px 56px rgba(0,0,0,.32);">
        <div style="position:absolute;right:-18px;bottom:-42px;font-size:11rem;font-weight:1000;opacity:.055;line-height:1;pointer-events:none;">${this.esc(teamName.slice(0, 3).toUpperCase())}</div>
        <div style="position:relative;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:14px;min-width:250px;">
            <div style="transform:scale(1.1);transform-origin:left center;">${this.flag(teamName, false)}</div>
            <div>
              <div style="font-size:.72rem;font-weight:1000;text-transform:uppercase;letter-spacing:.18em;color:#93c5fd;">${this.esc(this.staticText("teamCommandCentre"))}</div>
              <div class="wc-section-title" style="font-size:1.78rem;margin-top:3px;letter-spacing:-.04em;">${this.esc(teamName)}</div>
              <p class="wc-muted" style="margin:5px 0 0;max-width:760px;line-height:1.38;">${this.esc(this.staticText("teamCommandIntro"))}</p>
            </div>
          </div>
          <select id="wc-team-select" class="wc-language-select" style="min-width:245px;">
            ${options.map((team) => `<option value="${this.esc(team.key)}" ${team.key === teamKey ? "selected" : ""}>${this.esc(team.name)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px;align-items:stretch;">
        <div style="grid-column:span 3;">${statCard(this.staticText("upcomingMatches"), upcoming.length, `${live.length} ${this.t("liveStatus")} / ${finished.length} ${this.t("played")}`, "#93c5fd")}</div>
        <div style="grid-column:span 3;">${statCard(this.staticText("record"), `${teamStats.wins || 0}-${teamStats.draws || 0}-${teamStats.losses || 0}`, `${teamStats.played || finished.length} ${this.t("played")}`, "#86efac")}</div>
        <div style="grid-column:span 3;">${statCard(this.staticText("goals"), `${teamStats.gf ?? goals}-${teamStats.ga ?? 0}`, `GD ${Number(teamStats.gd || 0) > 0 ? "+" : ""}${teamStats.gd || 0}`, "#fde68a")}</div>
        <div style="grid-column:span 3;">${statCard(this.staticText("cards"), `${teamYellowCards}Y ${teamRedCards}R`, `${subs} ${this.staticText("subs")} / ${vars} VAR`, "#fca5a5")}</div>

        <div style="grid-column:span 7;min-width:0;"><div class="wc-card" style="padding:0;background:transparent;border:0;box-shadow:none;height:100%;">${nextMatchCard}</div></div>
        <div style="grid-column:span 5;min-width:0;">${countryProfile}</div>

        <div style="grid-column:span 4;min-width:0;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">🔥 ${this.esc(this.staticText("formGuide"))}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px;">${resultDots}</div>
            <div style="margin-top:10px;display:grid;gap:8px;">${recentCards}</div>
          </div>
        </div>
        <div style="grid-column:span 4;min-width:0;">${disciplineCard}</div>
        <div style="grid-column:span 4;min-width:0;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">${this.esc(this.staticText("groupSnapshot"))}</div>
            <div style="margin:9px 0 7px;display:grid;grid-template-columns:34px 1fr 44px 44px;gap:8px;padding:0 11px;color:rgba(255,255,255,.52);font-size:.7rem;font-weight:1000;text-transform:uppercase;letter-spacing:.06em;">
              <span>Pos</span><span>Team</span><span style="text-align:center;">GD</span><span style="text-align:center;">Pts</span>
            </div>
            <div style="display:grid;gap:7px;">${groupSnapshot}</div>
          </div>
        </div>

        <div style="grid-column:span 8;min-width:0;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">🏆 ${this.esc(this.staticText("tournamentJourney"))}</div>
            <div style="margin-top:10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;">${stageCards}</div>
            <div style="margin-top:12px;max-height:520px;overflow:auto;padding-right:4px;">${timeline}</div>
          </div>
        </div>
        <div style="grid-column:span 4;min-width:0;display:grid;gap:12px;">
          ${playerSpotlight}
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">🏟 ${this.esc(this.staticText("stadiumTracker"))}</div>
            <div class="wc-muted" style="margin:6px 0 9px;">${this.esc(this.staticText("next"))}: <strong>${this.esc(nextVenue)}</strong></div>
            <div style="display:grid;gap:7px;">${stadiumTracker}</div>
          </div>
        </div>

        <div style="grid-column:span 6;min-width:0;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">📅 ${this.esc(this.staticText("upcomingFixtures"))}</div>
            <div style="display:grid;gap:8px;margin-top:10px;">${upcomingList}</div>
          </div>
        </div>
        <div style="grid-column:span 6;min-width:0;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">✅ ${this.esc(this.staticText("previousResults"))}</div>
            <div style="display:grid;gap:8px;margin-top:10px;">${resultList}</div>
          </div>
        </div>

        <div style="grid-column:span 7;min-width:0;">${squadOverview}</div>
        <div style="grid-column:span 5;min-width:0;display:grid;gap:12px;">
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">${this.esc(this.staticText("teamStatistics"))}</div>
            ${this.statsMiniTable([{
              goals: goals || teamStats.goals || teamStats.gf || 0,
              assists: teamStats.assists || 0,
              yellowCards: teamYellowCards,
              redCards: teamRedCards,
              substitutions: subs || teamStats.substitutions || 0,
              varEvents: vars || teamStats.varEvents || 0,
            }], [
              { label: "G", key: "goals", align: "center" },
              { label: "Ast", key: "assists", align: "center" },
              { label: "YC", key: "yellowCards", align: "center" },
              { label: "RC", key: "redCards", align: "center" },
              { label: "Subs", key: "substitutions", align: "center" },
              { label: "VAR", key: "varEvents", align: "center" },
            ])}
          </div>
          <div class="wc-card" style="${compactCardStyle}">
            <div class="wc-section-title">⚽ ${this.esc(this.staticText("goalsBreakdown"))}</div>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px;">
              ${statCard(this.staticText("forLabel"), teamStats.gf ?? goals ?? 0, this.staticText("scored"), "#fde68a")}
              ${statCard(this.staticText("against"), teamStats.ga ?? 0, this.t("conceded"), "#fca5a5")}
              ${statCard(this.staticText("clean"), teamStats.cleanSheets || 0, this.staticText("sheets"), "#86efac")}
              ${statCard("GD", `${Number(teamStats.gd || 0) > 0 ? "+" : ""}${teamStats.gd || 0}`, this.staticText("current"), "#93c5fd")}
            </div>
          </div>
        </div>
      </div>

      <style>
        @media (max-width: 1100px) {
          :host div[style*="grid-column:span 7"],
          :host div[style*="grid-column:span 8"],
          :host div[style*="grid-column:span 6"],
          :host div[style*="grid-column:span 5"],
          :host div[style*="grid-column:span 4"],
          :host div[style*="grid-column:span 3"] { grid-column: span 12 !important; }
        }
      </style>
    `;
  }

  venuesPage() {
    const v = this._data.venues || {};
    const stadiums = this.completeVenueStadiums(v.stadiums || []);
    const finalVenue = v.final_venue;

    const venueTitle = (venue) => venue.name || venue.stadium || venue.real_name || this.t("unknown");
    const venueRealName = (venue) => venue.real_name || venue.stadium || venue.name || this.t("unknown");
    const venueMatches = (venue) => venue.matches ?? venue.matches_hosted ?? venue.match_count ?? 0;
    const venueCapacity = (venue) => Number(venue.capacity || 0).toLocaleString();
    const venueImageUrl = (venue) => venue?.image ? `/world_cup_2026_frontend/${venue.image}` : "";

    return `
      <div class="wc-grid">
        <div class="wc-stat"><strong>${stadiums.length}</strong>${this.t("stadiums")}</div>
        <div class="wc-stat"><strong>${stadiums.filter((venue) => venue.country === "USA").length || v.country_counts?.USA || 0}</strong>${this.t("usaVenues")}</div>
        <div class="wc-stat"><strong>${stadiums.filter((venue) => venue.country === "Canada").length || v.country_counts?.Canada || 0}</strong>${this.t("canadaVenues")}</div>
        <div class="wc-stat"><strong>${stadiums.filter((venue) => venue.country === "Mexico").length || v.country_counts?.Mexico || 0}</strong>${this.t("mexicoVenues")}</div>
      </div>

      ${
        finalVenue
          ? `
          <div class="wc-card">
            ${
              finalVenue.image
                ? `
                  <img
                    src="${this.esc(venueImageUrl(finalVenue))}"
                    alt="${this.esc(venueTitle(finalVenue))}"
                    loading="lazy"
                    style="width:min(720px, 92%);height:auto;max-height:none;object-fit:contain;border-radius:14px;margin:0 auto 14px;display:block;box-shadow:0 10px 30px rgba(0,0,0,.35);"
                  />
                `
                : ""
            }
            <div class="wc-section-title">${this.t("finalVenue")}</div>
            <p><strong>${this.esc(finalVenue.flag || "")} ${this.esc(venueTitle(finalVenue))}</strong></p>
            <p class="wc-muted">${this.t("realStadium")}: <strong>${this.esc(venueRealName(finalVenue))}</strong></p>
            <p>${this.esc(finalVenue.city)}, ${this.esc(this.localizedCountryName(finalVenue.country))}</p>
            <p>${this.t("capacity")}: <strong>${this.esc(venueCapacity(finalVenue))}</strong></p>
            <p>${this.t("matchesHosted")}: <strong>${this.esc(venueMatches(finalVenue))}</strong></p>
          </div>
        `
          : ""
      }

      <div class="wc-card">
        <div class="wc-section-title">${this.t("worldCupStadiums")}</div>
        <div class="wc-venue-grid">
          ${stadiums.map(venue => `
            <div class="wc-stat">
              ${
                venue.image
                  ? `
                    <img
                      src="${this.esc(venueImageUrl(venue))}"
                      alt="${this.esc(venueTitle(venue))}"
                      loading="lazy"
                      style="width:100%;height:140px;object-fit:cover;border-radius:12px;margin-bottom:10px;"
                    />
                  `
                  : ""
              }
              <strong>${this.esc(venue.flag || "")} ${this.esc(venueTitle(venue))}</strong>
              <div class="wc-muted">${this.t("realStadium")}: ${this.esc(venueRealName(venue))}</div>
              <div>${this.esc(venue.city)}, ${this.esc(this.localizedCountryName(venue.country))}</div>
              <div class="wc-muted">${this.t("capacity")}: ${this.esc(venueCapacity(venue))}</div>
              <div class="wc-muted">${this.t("matchesHosted")}: <strong>${this.esc(venueMatches(venue))}</strong></div>
            </div>
          `).join("") || `<div class="wc-empty">${this.t("noVenueData")}</div>`}
        </div>
      </div>
    `;
  }

  sortedSupporters() {
    const supporters = Array.isArray(this._data.supporters) ? this._data.supporters : [];

    return [...supporters].sort((a, b) => {
      const aDate = new Date(a?.date || "1900-01-01").getTime();
      const bDate = new Date(b?.date || "1900-01-01").getTime();
      return bDate - aDate;
    });
  }

  supporterCountryCounts(supporters) {
    return supporters.reduce((counts, supporter) => {
      const country = typeof supporter === "string" ? "" : this.teamLabel(supporter.country || "");
      if (!country || country === this.t("tbc")) return counts;
      counts[country] = (counts[country] || 0) + 1;
      return counts;
    }, {});
  }

  overviewSupportersPanel() {
    const supporters = this.sortedSupporters();

    if (!supporters.length) {
      return "";
    }

    const latestSupporters = supporters.slice(0, 5);
    const countryCounts = this.supporterCountryCounts(supporters);
    const countries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8);

    return `
      <div class="wc-card overview-supporters-card">
        <div class="overview-panel-heading">
          <div>
            <div class="overview-small-label">🍺 ${this.t("communitySupport")}</div>
            <div class="wc-section-title">${this.t("latestSupporters")}</div>
          </div>
          <button class="overview-action-button overview-supporters-link" data-page="supporters" type="button">
            View All ${supporters.length}
          </button>
        </div>

        <div class="overview-supporters-layout">
          <div>
            <div class="overview-supporters-list">
              ${latestSupporters.map((supporter) => {
                const name = typeof supporter === "string" ? supporter : supporter.name;
                const country = typeof supporter === "string" ? "" : supporter.country;
                return `
                  <div class="overview-supporter-pill">
                    ${country ? this.flag(country, true) : "🍺"}
                    <strong>${this.esc(name || this.t("anonymousSupporter"))}</strong>
                    ${country ? `<span>${this.esc(this.localizedTeamName(country))}</span>` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div class="overview-supporters-stats">
            <div><strong>${supporters.length}</strong><span>${this.t("totalSupporters")}</span></div>
            <div><strong>${countries.length}</strong><span>${this.t("countries")}</span></div>
          </div>
        </div>

        ${countries.length ? `
          <div class="overview-country-strip">
            ${countries.map(([country, count]) => `
              <span>${this.flag(country, true)} ${this.esc(this.localizedCountryName(country))} <b>${count}</b></span>
            `).join("")}
          </div>
        ` : ""}

        <div class="overview-supporters-thanks">
          ❤️ Thanks to everyone helping support development of the World Cup 2026 integration.
        </div>
      </div>
    `;
  }

  supporterCard(supporter, isLatest = false) {
    const name = typeof supporter === "string" ? supporter : supporter.name;
    const country = typeof supporter === "string" ? "" : supporter.country;
    const message = typeof supporter === "string"
      ? this.t("supporterDefaultMessage")
      : supporter.message;
    const date = typeof supporter === "string" ? "" : supporter.date;

    return `
      <div class="wc-stat supporter-card-compact ${isLatest ? "supporter-latest-card" : ""}">
        <strong class="supporter-card-name">
          ${country ? this.flag(country, true) : "🍺"}
          <span>${this.esc(name || this.t("anonymousSupporter"))}</span>
        </strong>
        <div class="supporter-card-meta">
          ${country ? `<span>${this.esc(this.localizedTeamName(country))}</span>` : ""}
          ${date ? `<span>${this.esc(date)}</span>` : ""}
        </div>
        ${message ? `<div class="supporter-card-message">${this.esc(message || this.t("supporterDefaultMessage"))}</div>` : ""}
      </div>
    `;
  }

  supportersPage() {
    const supporters = this.sortedSupporters();
    const countryCounts = this.supporterCountryCounts(supporters);
    const countryList = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const latestDate = supporters[0]?.date || "";
    const latestSupporters = latestDate
      ? supporters.filter((supporter) => supporter.date === latestDate)
      : supporters.slice(0, 2);

    const allSupporters = supporters;

    return `
      <div class="wc-card wc-support-donate-card" style="text-align:center;">
        <div class="wc-section-title">${this.t("wantNameAdded")}</div>
        <p class="wc-muted">${this.t("supportFutureUpdates")}</p>
        <p class="wc-muted">${this.esc(this.staticText("supportIntroFull"))}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
          <a
            class="wc-pill wc-donate-button"
            href="https://ko-fi.com/supportkofi"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-flex;text-decoration:none;"
          >
            ☕ ${this.esc(this.staticText("supportViaKofi"))}
          </a>
          <a
            class="wc-pill wc-donate-button"
            href="https://paypal.me/graffidoodle"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-flex;text-decoration:none;"
          >
            💳 ${this.esc(this.staticText("supportViaPaypal"))}
          </a>
        </div>
      </div>

      ${this.overviewSupporterTicker()}

      <div class="wc-card wc-premium-support-info" style="max-width:980px;margin-left:auto;margin-right:auto;">
        <div class="wc-section-title" style="text-align:center;">${this.t("supportersThankYouTitle")}</div>

        <div style="text-align:center;font-size:18px;font-weight:900;line-height:1.45;margin:8px auto 14px auto;max-width:860px;">
          ⭐ <strong>${this.esc(this.staticText("premiumSupporters"))}</strong> ${this.esc(this.staticText("premiumFeatureText"))}
        </div>

        <p class="wc-muted" style="text-align:center;max-width:880px;margin-left:auto;margin-right:auto;">
          ${this.esc(this.staticText("premiumSupportIntro"))}
        </p>

        <p class="wc-muted" style="text-align:center;max-width:880px;margin-left:auto;margin-right:auto;">
          ${this.esc(this.staticText("premiumSupportCosts"))}
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:16px;">
          <div class="wc-stat" style="text-align:left;border:1px solid rgba(255,215,0,0.55);background:linear-gradient(135deg,rgba(255,215,0,0.14),rgba(255,255,255,0.04));">
            <strong>👑 ${this.esc(this.staticText("premiumSupporter"))}</strong>
            <span style="display:block;margin-top:6px;line-height:1.5;">
              ${this.esc(this.staticText("donatePremiumText"))}
            </span>
          </div>

          <div class="wc-stat" style="text-align:left;">
            <strong>🌍 ${this.esc(this.staticText("nameFlag"))}</strong>
            <span style="display:block;margin-top:6px;line-height:1.5;">
              ${this.esc(this.staticText("nameFlagText"))}
            </span>
          </div>

          <div class="wc-stat" style="text-align:left;">
            <strong>💬 ${this.esc(this.staticText("personalMessage"))}</strong>
            <span style="display:block;margin-top:6px;line-height:1.5;">
              ${this.esc(this.staticText("premiumMessageText"))}
            </span>
          </div>
        </div>

        <div style="margin-top:16px;padding:14px;border-radius:16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);">
          <p style="margin:0 0 8px 0;font-weight:900;text-align:center;">
            ❤️ ${this.esc(this.staticText("everyDonationMatters"))}
          </p>
          <p class="wc-muted" style="margin:0;text-align:center;max-width:880px;margin-left:auto;margin-right:auto;">
            ${this.esc(this.staticText("everyDonationText"))}
          </p>
        </div>

        <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
          <div class="wc-pill" style="justify-content:center;white-space:normal;line-height:1.4;">⚽ ${this.esc(this.staticText("liveDataCosts"))}</div>
          <div class="wc-pill" style="justify-content:center;white-space:normal;line-height:1.4;">🛠 ${this.esc(this.staticText("bugFixesImprovements"))}</div>
          <div class="wc-pill" style="justify-content:center;white-space:normal;line-height:1.4;">🚀 ${this.esc(this.staticText("futureFeatures"))}</div>
          <div class="wc-pill" style="justify-content:center;white-space:normal;line-height:1.4;">🌍 ${this.esc(this.staticText("communityDevelopment"))}</div>
        </div>

        <div style="margin-top:16px;text-align:center;">
          <p style="font-weight:900;margin:0 0 8px 0;">${this.esc(this.staticText("toBeAddedSupporter"))}</p>
          <p class="wc-muted" style="margin:0;">
            ${this.esc(this.staticText("supporterExample"))}
          </p>
        </div>

        <p style="text-align:center;font-weight:900;margin:18px 0 0 0;">
          ${this.esc(this.staticText("everySupporterMatters"))} 🙏
        </p>
      </div>

      ${supporters.length ? `
        <div class="wc-card supporters-summary-card">
          <div class="wc-section-title">❤️ ${this.t("supportersAroundWorld")}</div>
          <div class="supporters-summary-grid">
            <div class="supporter-summary-stat"><strong>${supporters.length}</strong><span>${this.t("totalSupporters")}</span></div>
            <div class="supporter-summary-stat"><strong>${countryList.length}</strong><span>${this.t("countriesSupporting")}</span></div>
            <div class="supporter-summary-stat"><strong>${latestDate || "—"}</strong><span>${this.t("latestSupportDate")}</span></div>
          </div>
          ${countryList.length ? `
            <div class="supporter-country-grid">
              ${countryList.map(([country, count]) => `
                <span>${this.flag(country, true)} ${this.esc(this.localizedCountryName(country))} <b>${count}</b></span>
              `).join("")}
            </div>
          ` : ""}
        </div>
      ` : ""}

      ${
        supporters.length
          ? `
            <div class="wc-card">
              <div class="wc-section-title">${this.t("latestSupporters")}</div>
              ${latestDate ? `<p class="wc-muted">${this.esc(latestDate)}</p>` : ""}
              <div class="supporters-feature-grid">
                ${latestSupporters.map((supporter) => this.supporterCard(supporter, true)).join("")}
              </div>
            </div>

            <div class="wc-card">
              <div class="wc-section-title">${this.t("allSupporters")}</div>
              <div class="wc-grid">
                ${allSupporters.map((supporter) => this.supporterCard(supporter)).join("")}
              </div>
            </div>
          `
          : `
            <div class="wc-card">
              <div class="wc-section-title">${this.t("supportersTitle")}</div>
              <div class="wc-empty">${this.t("noSupporters")}</div>
            </div>
          `
      }
    `;
  }


  headerLivePill() {
    const live = (this._data.live || []).filter((match) => this.isLiveMatch(match));
    const liveCount = live.length;

    if (!liveCount) {
      return `<div class="wc-header-live-pill offline">🔴 ${this.t("noLiveGames")}</div>`;
    }

    const liveMatchesText = live
      .map((match) => {
        const homeTeam = this.localizedTeamName(this.getHomeTeam(match));
        const awayTeam = this.localizedTeamName(this.getAwayTeam(match));
        const homeScore = this.getHomeScore(match);
        const awayScore = this.getAwayScore(match);
        const score = homeScore !== "-" || awayScore !== "-" ? ` ${homeScore}-${awayScore}` : "";
        return `${homeTeam}${score} ${awayTeam}`;
      })
      .join(" • ");

    const label = liveCount === 1
      ? `🟢 Live: ${liveMatchesText}`
      : `🟢 ${liveCount} live games: ${liveMatchesText}`;

    return `<div class="wc-header-live-pill live" title="${this.esc(label)}"><span class="wc-live-ticker">${this.esc(label)}</span></div>`;
  }

  headerScheduledPill() {
    const fixtures = this._data.fixtures || [];
    const scheduledStatuses = ["TIMED", "SCHEDULED"];

    const todayKey = (() => {
      try {
        const parts = new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date());

        const year = parts.find((part) => part.type === "year")?.value;
        const month = parts.find((part) => part.type === "month")?.value;
        const day = parts.find((part) => part.type === "day")?.value;

        if (year && month && day) {
          return `${year}-${month}-${day}`;
        }

        return new Date().toLocaleDateString("en-CA");
      } catch {
        return new Date().toISOString().slice(0, 10);
      }
    })();

    const scheduledTodayCount = fixtures.filter((match) => {
      return scheduledStatuses.includes(match.status) && this.fixtureDateKey(match) === todayKey;
    }).length;

    if (!scheduledTodayCount) {
      return `<div class="wc-header-live-pill offline wc-header-scheduled-pill">🔴 ${this.t("noGamesToday")}</div>`;
    }

    return `<div class="wc-header-live-pill live wc-header-scheduled-pill">🟢 ${scheduledTodayCount} ${scheduledTodayCount === 1 ? this.t("game") : this.t("games")} ${this.t("today")}</div>`;
  }

  worldCupKickoffDate() {
    // Opening match countdown.
    // Prefer the real fixture timestamp from the loaded schedule.
    // JavaScript Date stores the instant in time and compares it against
    // Date.now(), so the countdown automatically follows the viewer's
    // device/browser local timezone.
    const fixtureTarget = this.nextCountdownFixtureDate();

    if (fixtureTarget) {
      return fixtureTarget;
    }

    // Fallback only if fixtures are not loaded yet.
    // 20:00 UK/BST on 11 June 2026 = 19:00 UTC.
    return new Date("2026-06-11T20:00:00+01:00");
  }

  nextCountdownFixtureDate() {
    const fixtures = Array.isArray(this._data?.fixtures) ? this._data.fixtures : [];

    if (!fixtures.length) {
      return null;
    }

    const now = Date.now();
    const upcoming = fixtures
      .map((match) => {
        const value = match?.utcDate || match?.date || match?.kickoff || match?.startTime;
        if (!value) return null;

        const date = new Date(value);
        const time = date.getTime();

        if (!Number.isFinite(time) || time <= now) {
          return null;
        }

        return { date, time };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);

    return upcoming.length ? upcoming[0].date : null;
  }

  countdownParts() {
    const targetDate = this.worldCupKickoffDate();
    const target = targetDate ? targetDate.getTime() : NaN;

    if (!Number.isFinite(target)) {
      return null;
    }
    const now = Date.now();
    const remaining = target - now;

    if (remaining <= 0) {
      return null;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { months: 0, days, hours, minutes, seconds };
  }

  countdownText() {
    const parts = this.countdownParts();

    if (!parts) {
      return "";
    }

    const visibleParts = [];

    if (parts.months > 0) visibleParts.push(`${parts.months}M`);
    if (parts.days > 0) visibleParts.push(`${parts.days}D`);
    if (parts.hours > 0) visibleParts.push(`${parts.hours}H`);
    if (parts.minutes > 0 || visibleParts.length) visibleParts.push(`${parts.minutes}M`);
    visibleParts.push(`${parts.seconds}S`);

    return visibleParts.length ? visibleParts.join(" ") : "Kickoff imminent";
  }

  headerCountdownPill(id = "wc-header-countdown", extraClass = "") {
    const text = this.countdownText();

    if (!text) {
      return "";
    }

    const className = `wc-header-countdown-pill wc-next-game-timer${extraClass ? ` ${extraClass}` : ""}`;
    return `
      <div class="${className}" id="${this.esc(id)}">
        <span class="wc-next-game-ball">⚽</span>
        <span class="wc-next-game-copy">
          <span class="wc-next-game-label">Next game timer</span>
          <span class="wc-next-game-time">${this.esc(text)}</span>
        </span>
      </div>
    `;
  }

  updateCountdownDisplay() {
    const countdowns = this.querySelectorAll(".wc-header-countdown-pill");

    if (!countdowns.length) {
      return;
    }

    const text = this.countdownText();

    countdowns.forEach((countdown) => {
      if (!text) {
        countdown.remove();
        return;
      }

      const timeEl = countdown.querySelector(".wc-next-game-time");
      if (timeEl) {
        timeEl.textContent = text;
      } else {
        countdown.textContent = text;
      }
    });
  }

  pageContent() {
    const requestedPage = this._page;
    try {
      if (this._page === "overview") return this.overviewPage();
      if (this._page === "live") return this.livePage();
      if (this._page === "fixtures") return this.fixturesPage();
      if (this._page === "results") return this.resultsPage();
      if (this._page === "apiresults") { this._page = "results"; return this.resultsPage(); }
      if (this._page === "groups") return this.groupsPage();
      if (this._page === "knockout") return this.knockoutPage();
      if (this._page === "players") return this.playersPage();
      if (this._page === "records") return this.recordsPage();
      if (this._page === "stats") return this.statsPage();
      if (this._page === "teams") return this.teamsPage();
      if (this._page === "venues") return this.venuesPage();
      if (this._page === "supporters") return this.supportersPage();
      return this.overviewPage();
    } catch (err) {
      try { localStorage.removeItem("world_cup_2026_last_page"); } catch (e) {}
      this._page = "overview";
      return `
        ${this.errorCard(err, "Page recovered", `The ${requestedPage || "selected"} page had a problem, so the dashboard has been returned to Overview.`)}
        ${this.overviewPage()}
      `;
    }
  }

  render() {
    this.innerHTML = `
      ${this.styles()}
      <div class="wc-app wc-view-${this._viewMode} wc-page-${this._page}" dir="${this._language === "ar" ? "rtl" : "ltr"}">
        <div class="wc-shell">
          <div class="wc-header">
            <div class="wc-header-title-row">
              ${this.headerLivePill()}
              ${this.headerScheduledPill()}
              ${this.tabletHeaderNav()}
              <div class="wc-tablet-top-controls">
                <div class="wc-updated-pill wc-tablet-top-time">${new Date().toLocaleTimeString()}</div>
                <select class="wc-language-select wc-language-select-tablet" id="wc-language-select-tablet" title="${this.esc(this.t("language"))}">
                  ${this.languageOptionsMarkup()}
                </select>
                <select class="wc-view-select wc-view-select-tablet" id="wc-view-select-tablet" title="${this.esc(this.t("viewMode"))}">
                  <option value="mobile" ${this._viewMode === "mobile" ? "selected" : ""}>${this.esc(this.t("mobileView"))}</option>
                  <option value="tablet" ${this._viewMode === "tablet" ? "selected" : ""}>${this.esc(this.t("tabletView"))}</option>
                  <option value="pc" ${this._viewMode === "pc" ? "selected" : ""}>${this.esc(this.t("pcView"))}</option>
                </select>
                <button class="wc-pill wc-back-button wc-back-button-tablet" id="wc-back-button-tablet" type="button">${this.t("back")}</button>
              </div>
              <div class="wc-title-stack">
                <div class="wc-title">${this.t("title")}</div>
                <div class="wc-header-subtitle-inline">${this.t("subtitle")}</div>
              </div>
              ${this.headerCountdownPill()}
            </div>

            <div class="wc-header-controls">
              <div class="wc-updated-wrap">
                <div class="wc-updated-label">${this.t("updated")}</div>
                <div class="wc-updated-pill">${new Date().toLocaleTimeString()}</div>
              </div>

              ${this.languageSelector()}
              ${this.viewSelector()}
              ${this.sidebarSelector()}

              <button class="wc-pill wc-back-button" id="wc-back-button" type="button">
                ${this.t("back")}
              </button>
            </div>
          </div>

          ${this.nav()}
          ${this.pageContent()}

        </div>
      </div>
    `;

    this.applyStaticTextTranslations();
    this.applyHideSidebarFromUrl();

    this.querySelectorAll(".wc-nav button, .wc-tablet-header-nav button, .overview-action-button").forEach((button) => {
      button.onclick = () => {
        const page = button.getAttribute("data-page");
        if (button.classList.contains("fixtures-show-more-button")) {
          this._fixturesVisibleDays = (this._fixturesVisibleDays || 5) + 5;
          this._fixturesVisibleMatches = (this._fixturesVisibleMatches || 20) + 20;
          this.render();
          return;
        }
        if (button.classList.contains("knockout-show-more-button")) {
          this._knockoutVisibleMatches = (this._knockoutVisibleMatches || 12) + 12;
          this.render();
          return;
        }
        this.changePage(page);
      };
    });

    this.querySelectorAll("#wc-language-select, #wc-language-select-tablet").forEach((languageSelect) => {
      this.setupLanguageSelect(languageSelect);
    });

    this.querySelectorAll("#wc-view-select, #wc-view-select-tablet").forEach((viewSelect) => {
      this.setupViewSelect(viewSelect);
    });

    const teamSelect = this.querySelector("#wc-team-select");
    if (teamSelect) {
      teamSelect.onchange = (e) => {
        this._selectedTeamKey = e.target.value || "";
        localStorage.setItem("world_cup_2026_selected_team", this._selectedTeamKey);
        this.render();
      };
    }

    this.querySelectorAll("#wc-sidebar-select, #wc-sidebar-select-tablet").forEach((sidebarSelect) => {
      this.setupSidebarSelect(sidebarSelect);
    });

    this.querySelectorAll("#wc-back-button, #wc-back-button-tablet").forEach((backButton) => {
      backButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.goBackToHomeAssistant();
      };
    });

    this.querySelectorAll("#wc-reset-panel-button, .wc-reset-panel-button").forEach((resetButton) => {
      resetButton.onclick = (e) => {
        e.preventDefault();
        this.resetPanelView();
      };
    });
  }
}


  customElements.define("world-cup-2026-panel", WorldCup2026Panel);
}
