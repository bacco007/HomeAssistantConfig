if (!customElements.get("world-cup-2026-panel")) {
class WorldCup2026Panel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    const savedPage = localStorage.getItem("world_cup_2026_last_page") || "overview";
    const validPages = new Set(["overview", "live", "fixtures", "results", "groups", "knockout", "players", "records", "stats", "venues", "supporters"]);
    this._page = validPages.has(savedPage) ? savedPage : "overview";
    this._loaded = false;
    this._refreshInterval = null;
    this._countdownInterval = null;
    this._sidebarObserver = null;
    this._sidebarStyleRoots = new Set();
    this._sidebarObservers = [];
    this._language = localStorage.getItem("world_cup_2026_language") || "en";
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
        manualTimerNotice: 'Live scores, match clock and goal times update from the live API. The clock counts locally between refreshes and re-syncs on each pull.',
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


      hi: {
        title: "फीफा विश्व कप 2026",
        subtitle: "Home Assistant टूर्नामेंट ऐप",
        back: "← वापस",
        updated: "अपडेट किया गया",
        loading: "विश्व कप 2026 लोड हो रहा है...",
        errorTitle: "विश्व कप 2026",
        errorText: "ऐप डेटा लोड नहीं हो सका।",
        overview: "अवलोकन",
        live: "लाइव केंद्र",
        fixtures: "फिक्स्चर",
        results: "परिणाम",
        groups: "ग्रुप",
        knockout: "नॉकआउट",
        players: "गोल्डन बूट",
        records: "रिकॉर्ड",
        stats: "स्टैट्स हब",
        venues: "वेन्यू",
        totalMatches: "कुल मैच",
        loaded: "लोड हुए",
        played: "खेले गए",
        remaining: "बाकी",
        liveNow: "अभी लाइव",
        totalGoals: "कुल गोल",
        nextMatch: "अगला मैच",
        tournamentStatus: "टूर्नामेंट स्थिति",
        demoMode: "डेमो मोड",
        on: "चालू",
        off: "बंद",
        lastUpdate: "अंतिम अपडेट",
        ok: "ठीक",
        failed: "विफल",
        progress: "प्रगति",
        topScorer: "शीर्ष स्कोरर",
        notAvailable: "उपलब्ध नहीं",
        noUpcomingMatch: "कोई आगामी मैच लोड नहीं है।",
        noLiveMatches: "अभी कोई मैच लाइव नहीं है।",
        fixturesResults: "फिक्स्चर और परिणाम",
        noFixtures: "अभी कोई फिक्स्चर लोड नहीं है।",
        groupLabel: "ग्रुप",
        groupsAL: "ग्रुप A-L",
        noGroups: "अभी कोई ग्रुप तालिका लोड नहीं है।",
        noTeamsGroup: "इस ग्रुप में अभी कोई टीम लोड नहीं है।",
        goldenBoot: "गोल्डन बूट रेस",
        noPlayerStats: "अभी कोई खिलाड़ी आँकड़े लोड नहीं हैं।",
        knockoutBracket: "नॉकआउट ब्रैकेट",
        fixturesNotAvailable: "फिक्स्चर अभी उपलब्ध नहीं हैं",
        highestMatchGoals: "एक मैच में सबसे अधिक गोल",
        biggestMargin: "सबसे बड़ा अंतर",
        topTeamGoals: "सबसे अधिक टीम गोल",
        bestDefenceGA: "सर्वश्रेष्ठ डिफेंस GA",
        highestScoringMatch: "सबसे अधिक गोल वाला मैच",
        biggestWin: "सबसे बड़ी जीत",
        topScoringTeam: "सबसे अधिक गोल करने वाली टीम",
        bestDefence: "सर्वश्रेष्ठ डिफेंस",
        noResult: "अभी कोई परिणाम नहीं।",
        noTeamGoalData: "अभी टीम गोल डेटा नहीं है।",
        noDefensiveData: "अभी डिफेंस डेटा नहीं है।",
        matchesPlayed: "खेले गए मैच",
        yellowCards: "पीले कार्ड",
        redCards: "लाल कार्ड",
        minutes: "मिनट",
        goalsPerMatch: "गोल / मैच",
        draws: "ड्रॉ",
        drawRate: "ड्रॉ दर",
        bttsRate: "दोनों टीम स्कोर दर",
        over25Rate: "2.5 से अधिक दर",
        stadiums: "स्टेडियम",
        usaVenues: "यूएसए वेन्यू",
        canadaVenues: "कनाडा वेन्यू",
        mexicoVenues: "मेक्सिको वेन्यू",
        finalVenue: "फाइनल वेन्यू",
        capacity: "क्षमता",
        worldCupStadiums: "विश्व कप स्टेडियम",
        noVenueData: "कोई वेन्यू डेटा उपलब्ध नहीं।",
        scheduled: "आगामी",
        liveStatus: "लाइव",
        manualTimerNotice: 'लाइव स्कोर अपने आप अपडेट होते हैं। गोल समय मैनुअल मैच घड़ी से लिए जाते हैं और आधिकारिक समय से कुछ मिनट अलग हो सकते हैं।',
        paused: "रुका हुआ",
        fullTime: "फुल टाइम",
        aet: "अतिरिक्त समय के बाद",
        penalties: "पेनल्टी",
        postponed: "स्थगित",
        groupStage: "ग्रुप चरण",
        round32: "राउंड ऑफ 32",
        round16: "राउंड ऑफ 16",
        quarterFinals: "क्वार्टर फाइनल",
        semiFinals: "सेमी फाइनल",
        thirdPlace: "तीसरा स्थान",
        final: "फाइनल",
        tbc: "TBC",
        unknown: "अज्ञात",
        pos: "स्थान",
        team: "टीम",
        player: "खिलाड़ी",
        goals: "गोल",
        assists: "असिस्ट",
        language: "डैशबोर्ड भाषा",
        controlCentre: "विश्व कप 2026 कंट्रोल सेंटर",
        overviewSubtitle: "फिक्स्चर, परिणाम, ग्रुप, खिलाड़ी आँकड़े, वेन्यू, रिकॉर्ड और नॉकआउट ट्रैकिंग के साथ लाइव टूर्नामेंट डैशबोर्ड।",
        tournamentIntelligence: "टूर्नामेंट विश्लेषण",
        goldenBootCentre: "गोल्डन बूट सेंटर",
        leaderSpotlight: "लीडर स्पॉटलाइट",
        playersTracked: "ट्रैक किए गए खिलाड़ी",
        totalAssists: "कुल असिस्ट",
        totalYellowCards: "कुल पीले कार्ड",
        totalRedCards: "कुल लाल कार्ड",
        upNext: "अगला",
        matchSpotlight: "मैच स्पॉटलाइट",
        upcomingFixtures: "आगामी फिक्स्चर",
        latest: "नवीनतम",
        recentResults: "हाल के परिणाम",
        playerWatch: "खिलाड़ी वॉच",
        fixturesSubtitle: "मैच-दिन सेक्शन, बोल्ड स्कोर कार्ड, झंडे, वेन्यू विवरण और साफ लाइव/परिणाम बैज वाला बेहतर मैच सेंटर।",
        days: "दिन",
        versus: "बनाम",
        supportersNav: "🙏 समर्थक",
        supportersThankYouTitle: "🙏 समर्थक और धन्यवाद",
        supportersIntro: "यह प्रोजेक्ट एक निजी Home Assistant डैशबोर्ड के रूप में शुरू हुआ और समुदाय की प्रतिक्रिया, टेस्टिंग, विचारों और समर्थन से बढ़ा।",
        supportersSpecialThanks: "World Cup 2026 इंटीग्रेशन के विकास का समर्थन करने वाले सभी लोगों को विशेष धन्यवाद।",
        supportersTitle: "🍺 समर्थक",
        latestSupporters: "⭐ नवीनतम समर्थक",
        allSupporters: "🌍 सभी समर्थक",
        supporterDefaultMessage: "विकास का समर्थन करने के लिए धन्यवाद।",
        anonymousSupporter: "गुमनाम समर्थक",
        noSupporters: "अभी कोई समर्थक नहीं जोड़ा गया। सबसे पहले Buy Me a Beer करें और अपना नाम यहाँ दिखाएँ।",
        wantNameAdded: "अपना नाम यहाँ जोड़ना चाहते हैं?",
        supportFutureUpdates: "भविष्य के अपडेट, बग फिक्स और नई विश्व कप सुविधाओं का समर्थन करें।",
        supporterBeerMessage: "🍺 क्या आप अपना नाम समर्थक पेज पर दिखाना चाहते हैं? PayPal के जरिए मुझे एक बीयर खरीदें और विकास समर्थन के धन्यवाद के रूप में आपका नाम World Cup 2026 समर्थक सूची में जोड़ा जा सकता है।",
        donateBuyBeer: "🍺 दान / मुझे बीयर खरीदें",
        enjoyingIntegration: "🍺 क्या आपको यह इंटीग्रेशन पसंद आ रहा है?",
        supportIntegration: "इस इंटीग्रेशन का समर्थन करें",
        source: "स्रोत",
        totalSupporters: "कुल समर्थक",
        countries: "देश",
        countriesSupporting: "समर्थन करने वाले देश",
        latestSupportDate: "नवीनतम समर्थन तारीख",
        playedShort: "खे",
        winsShort: "जी",
        drawsShort: "ड्रॉ",
        lossesShort: "हा",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "अंक",
        noResultsLoaded: "अभी कोई परिणाम लोड नहीं है।",
        finishedMatchesSubtitle: "समाप्त मैच और पुष्टि किए गए स्कोर।",
        goldenBootAutoText: "football-data.org द्वारा विश्व कप स्कोरर डेटा प्रकाशित होने पर गोल्डन बूट डेटा अपने-आप दिखाई देगा।",
        realStadium: "वास्तविक स्टेडियम",
        matchesHosted: "होस्ट किए गए मैच",
        communitySupport: "समुदाय समर्थन",
        supportersAroundWorld: "दुनिया भर के समर्थक",
        noLiveGames: "कोई लाइव गेम नहीं",
        noGamesToday: "आज कोई गेम नहीं",
        conceded: "खाए गए",
      },

      bn: {
        title: "ফিফা বিশ্বকাপ ২০২৬",
        subtitle: "Home Assistant টুর্নামেন্ট অ্যাপ",
        back: "← ফিরে যান",
        updated: "আপডেট হয়েছে",
        loading: "বিশ্বকাপ ২০২৬ লোড হচ্ছে...",
        errorTitle: "বিশ্বকাপ ২০২৬",
        errorText: "অ্যাপ ডেটা লোড করা যায়নি।",
        overview: "সংক্ষিপ্ত বিবরণ",
        live: "লাইভ সেন্টার",
        fixtures: "ফিক্সচার",
        results: "ফলাফল",
        groups: "গ্রুপ",
        knockout: "নকআউট",
        players: "গোল্ডেন বুট",
        records: "রেকর্ড",
        stats: "স্ট্যাটস হাব",
        venues: "ভেন্যু",
        totalMatches: "মোট ম্যাচ",
        loaded: "লোড হয়েছে",
        played: "খেলা হয়েছে",
        remaining: "বাকি",
        liveNow: "এখন লাইভ",
        totalGoals: "মোট গোল",
        nextMatch: "পরের ম্যাচ",
        tournamentStatus: "টুর্নামেন্ট অবস্থা",
        demoMode: "ডেমো মোড",
        on: "চালু",
        off: "বন্ধ",
        lastUpdate: "শেষ আপডেট",
        ok: "OK",
        failed: "ব্যর্থ",
        progress: "অগ্রগতি",
        topScorer: "সর্বোচ্চ গোলদাতা",
        notAvailable: "উপলব্ধ নয়",
        noUpcomingMatch: "কোনো আসন্ন ম্যাচ লোড নেই।",
        noLiveMatches: "এখন কোনো ম্যাচ লাইভ নেই।",
        fixturesResults: "ফিক্সচার ও ফলাফল",
        noFixtures: "এখনও কোনো ফিক্সচার লোড হয়নি।",
        groupLabel: "গ্রুপ",
        groupsAL: "গ্রুপ A-L",
        noGroups: "এখনও কোনো গ্রুপ স্ট্যান্ডিং লোড হয়নি।",
        noTeamsGroup: "এই গ্রুপে এখনও কোনো দল লোড হয়নি।",
        goldenBoot: "গোল্ডেন বুট রেস",
        noPlayerStats: "এখনও কোনো খেলোয়াড়ের পরিসংখ্যান লোড হয়নি।",
        knockoutBracket: "নকআউট ব্র্যাকেট",
        fixturesNotAvailable: "ফিক্সচার এখনও উপলব্ধ নয়",
        highestMatchGoals: "এক ম্যাচে সর্বাধিক গোল",
        biggestMargin: "সবচেয়ে বড় ব্যবধান",
        topTeamGoals: "সর্বাধিক দলীয় গোল",
        bestDefenceGA: "সেরা রক্ষণ GA",
        highestScoringMatch: "সর্বাধিক গোলের ম্যাচ",
        biggestWin: "সবচেয়ে বড় জয়",
        topScoringTeam: "সর্বাধিক গোল করা দল",
        bestDefence: "সেরা রক্ষণ",
        noResult: "এখনও কোনো ফলাফল নেই।",
        noTeamGoalData: "এখনও দলীয় গোল ডেটা নেই।",
        noDefensiveData: "এখনও রক্ষণ ডেটা নেই।",
        matchesPlayed: "খেলা ম্যাচ",
        yellowCards: "হলুদ কার্ড",
        redCards: "লাল কার্ড",
        minutes: "মিনিট",
        goalsPerMatch: "গোল / ম্যাচ",
        draws: "ড্র",
        drawRate: "ড্র হার",
        bttsRate: "দুই দলই গোল হার",
        over25Rate: "২.৫ এর বেশি হার",
        stadiums: "স্টেডিয়াম",
        usaVenues: "যুক্তরাষ্ট্র ভেন্যু",
        canadaVenues: "কানাডা ভেন্যু",
        mexicoVenues: "মেক্সিকো ভেন্যু",
        finalVenue: "ফাইনাল ভেন্যু",
        capacity: "ধারণক্ষমতা",
        worldCupStadiums: "বিশ্বকাপ স্টেডিয়াম",
        noVenueData: "কোনো ভেন্যু ডেটা উপলব্ধ নেই।",
        scheduled: "আসন্ন",
        liveStatus: "লাইভ",
        manualTimerNotice: 'লাইভ স্কোর স্বয়ংক্রিয়ভাবে আপডেট হয়। গোলের সময় ম্যানুয়াল ম্যাচ ঘড়ি ব্যবহার করে এবং অফিসিয়াল সময়ের থেকে কয়েক মিনিট ভিন্ন হতে পারে।',
        paused: "বিরতি",
        fullTime: "পূর্ণ সময়",
        aet: "অতিরিক্ত সময়ের পর",
        penalties: "পেনাল্টি",
        postponed: "স্থগিত",
        groupStage: "গ্রুপ পর্ব",
        round32: "রাউন্ড অব ৩২",
        round16: "রাউন্ড অব ১৬",
        quarterFinals: "কোয়ার্টার ফাইনাল",
        semiFinals: "সেমি ফাইনাল",
        thirdPlace: "তৃতীয় স্থান",
        final: "ফাইনাল",
        tbc: "TBC",
        unknown: "অজানা",
        pos: "স্থান",
        team: "দল",
        player: "খেলোয়াড়",
        goals: "গোল",
        assists: "অ্যাসিস্ট",
        language: "ড্যাশবোর্ড ভাষা",
        controlCentre: "বিশ্বকাপ ২০২৬ কন্ট্রোল সেন্টার",
        overviewSubtitle: "ফিক্সচার, ফলাফল, গ্রুপ, খেলোয়াড় পরিসংখ্যান, ভেন্যু, রেকর্ড ও নকআউট ট্র্যাকিংসহ লাইভ টুর্নামেন্ট ড্যাশবোর্ড।",
        tournamentIntelligence: "টুর্নামেন্ট বিশ্লেষণ",
        goldenBootCentre: "গোল্ডেন বুট সেন্টার",
        leaderSpotlight: "শীর্ষ খেলোয়াড় স্পটলাইট",
        playersTracked: "ট্র্যাক করা খেলোয়াড়",
        totalAssists: "মোট অ্যাসিস্ট",
        totalYellowCards: "মোট হলুদ কার্ড",
        totalRedCards: "মোট লাল কার্ড",
        upNext: "পরবর্তী",
        matchSpotlight: "ম্যাচ স্পটলাইট",
        upcomingFixtures: "আসন্ন ফিক্সচার",
        latest: "সর্বশেষ",
        recentResults: "সাম্প্রতিক ফলাফল",
        playerWatch: "খেলোয়াড় পর্যবেক্ষণ",
        fixturesSubtitle: "ম্যাচ-ডে সেকশন, স্পষ্ট স্কোর কার্ড, পতাকা, ভেন্যু বিবরণ ও পরিষ্কার লাইভ/ফলাফল ব্যাজসহ উন্নত ম্যাচ সেন্টার।",
        days: "দিন",
        versus: "বনাম",
        supportersNav: "🙏 সমর্থক",
        supportersThankYouTitle: "🙏 সমর্থক ও ধন্যবাদ",
        supportersIntro: "এই প্রজেক্টটি একটি ব্যক্তিগত Home Assistant ড্যাশবোর্ড হিসেবে শুরু হয়েছিল এবং কমিউনিটির মতামত, টেস্টিং, আইডিয়া ও সমর্থনে বড় হয়েছে।",
        supportersSpecialThanks: "World Cup 2026 ইন্টিগ্রেশনের উন্নয়নে সহায়তা করা সবাইকে বিশেষ ধন্যবাদ।",
        supportersTitle: "🍺 সমর্থক",
        latestSupporters: "⭐ সর্বশেষ সমর্থক",
        allSupporters: "🌍 সব সমর্থক",
        supporterDefaultMessage: "উন্নয়নে সহায়তার জন্য ধন্যবাদ।",
        anonymousSupporter: "নামহীন সমর্থক",
        noSupporters: "এখনও কোনো সমর্থক যোগ করা হয়নি। প্রথম Buy Me a Beer করুন এবং আপনার নাম এখানে দেখান।",
        wantNameAdded: "আপনার নাম এখানে যোগ করতে চান?",
        supportFutureUpdates: "ভবিষ্যৎ আপডেট, বাগ ফিক্স এবং নতুন বিশ্বকাপ ফিচার সমর্থন করুন।",
        supporterBeerMessage: "🍺 আপনার নাম কি সমর্থক পেজে দেখাতে চান? PayPal দিয়ে আমাকে একটি বিয়ার কিনে দিন, উন্নয়নে সমর্থনের ধন্যবাদ হিসেবে আপনার নাম World Cup 2026 সমর্থক তালিকায় যোগ করা যেতে পারে।",
        donateBuyBeer: "🍺 দান / আমাকে বিয়ার কিনুন",
        enjoyingIntegration: "🍺 এই ইন্টিগ্রেশন উপভোগ করছেন?",
        supportIntegration: "এই ইন্টিগ্রেশন সমর্থন করুন",
        source: "উৎস",
        totalSupporters: "মোট সমর্থক",
        countries: "দেশ",
        countriesSupporting: "সমর্থনকারী দেশ",
        latestSupportDate: "সর্বশেষ সমর্থন তারিখ",
        playedShort: "খে",
        winsShort: "জ",
        drawsShort: "ড্র",
        lossesShort: "হা",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "পয়েন্ট",
        noResultsLoaded: "এখনও কোনো ফলাফল লোড হয়নি।",
        finishedMatchesSubtitle: "শেষ হওয়া ম্যাচ এবং নিশ্চিত স্কোর।",
        goldenBootAutoText: "football-data.org বিশ্বকাপ গোলদাতা ডেটা প্রকাশ করলে স্বয়ংক্রিয় গোল্ডেন বুট ডেটা দেখা যাবে।",
        realStadium: "বাস্তব স্টেডিয়াম",
        matchesHosted: "আয়োজিত ম্যাচ",
        communitySupport: "কমিউনিটি সমর্থন",
        supportersAroundWorld: "বিশ্বজুড়ে সমর্থক",
        noLiveGames: "কোনো লাইভ গেম নেই",
        noGamesToday: "আজ কোনো গেম নেই",
        conceded: "হজম করা",
      },

      ta: {
        title: "FIFA உலகக் கோப்பை 2026",
        subtitle: "Home Assistant போட்டி செயலி",
        back: "← திரும்பு",
        updated: "புதுப்பிக்கப்பட்டது",
        loading: "உலகக் கோப்பை 2026 ஏற்றப்படுகிறது...",
        errorTitle: "உலகக் கோப்பை 2026",
        errorText: "செயலி தரவை ஏற்ற முடியவில்லை.",
        overview: "மேலோட்டம்",
        live: "நேரலை மையம்",
        fixtures: "போட்டிகள்",
        results: "முடிவுகள்",
        groups: "குழுக்கள்",
        knockout: "நாக்அவுட்",
        players: "கோல்டன் பூட்",
        records: "சாதனைகள்",
        stats: "புள்ளிவிவர மையம்",
        venues: "மைதானங்கள்",
        totalMatches: "மொத்த போட்டிகள்",
        loaded: "ஏற்றப்பட்டது",
        played: "விளையாடியது",
        remaining: "மீதமுள்ளது",
        liveNow: "இப்போது நேரலை",
        totalGoals: "மொத்த கோல்கள்",
        nextMatch: "அடுத்த போட்டி",
        tournamentStatus: "போட்டி நிலை",
        demoMode: "டெமோ முறை",
        on: "ஆன்",
        off: "ஆஃப்",
        lastUpdate: "கடைசி புதுப்பிப்பு",
        ok: "OK",
        failed: "தோல்வி",
        progress: "முன்னேற்றம்",
        topScorer: "அதிக கோல் அடித்தவர்",
        notAvailable: "கிடைக்கவில்லை",
        noUpcomingMatch: "வரவிருக்கும் போட்டி ஏற்றப்படவில்லை.",
        noLiveMatches: "இப்போது நேரலை போட்டிகள் இல்லை.",
        fixturesResults: "போட்டிகள் & முடிவுகள்",
        noFixtures: "இன்னும் போட்டிகள் ஏற்றப்படவில்லை.",
        groupLabel: "குழு",
        groupsAL: "குழுக்கள் A-L",
        noGroups: "இன்னும் குழு நிலைகள் ஏற்றப்படவில்லை.",
        noTeamsGroup: "இந்த குழுவில் இன்னும் அணிகள் ஏற்றப்படவில்லை.",
        goldenBoot: "கோல்டன் பூட் போட்டி",
        noPlayerStats: "இன்னும் வீரர் புள்ளிவிவரங்கள் ஏற்றப்படவில்லை.",
        knockoutBracket: "நாக்அவுட் அட்டவணை",
        fixturesNotAvailable: "போட்டிகள் இன்னும் கிடைக்கவில்லை",
        highestMatchGoals: "ஒரு போட்டியில் அதிக கோல்கள்",
        biggestMargin: "பெரிய வித்தியாசம்",
        topTeamGoals: "அதிக அணி கோல்கள்",
        bestDefenceGA: "சிறந்த பாதுகாப்பு GA",
        highestScoringMatch: "அதிக கோல் போட்டி",
        biggestWin: "பெரிய வெற்றி",
        topScoringTeam: "அதிக கோல் அடித்த அணி",
        bestDefence: "சிறந்த பாதுகாப்பு",
        noResult: "இன்னும் முடிவு இல்லை.",
        noTeamGoalData: "இன்னும் அணி கோல் தரவு இல்லை.",
        noDefensiveData: "இன்னும் பாதுகாப்பு தரவு இல்லை.",
        matchesPlayed: "விளையாடிய போட்டிகள்",
        yellowCards: "மஞ்சள் அட்டைகள்",
        redCards: "சிவப்பு அட்டைகள்",
        minutes: "நிமிடங்கள்",
        goalsPerMatch: "கோல்கள் / போட்டி",
        draws: "சமநிலைகள்",
        drawRate: "சமநிலை விகிதம்",
        bttsRate: "இரு அணிகளும் கோல் விகிதம்",
        over25Rate: "2.5 மேல் விகிதம்",
        stadiums: "ஸ்டேடியங்கள்",
        usaVenues: "அமெரிக்க மைதானங்கள்",
        canadaVenues: "கனடா மைதானங்கள்",
        mexicoVenues: "மெக்சிகோ மைதானங்கள்",
        finalVenue: "இறுதி மைதானம்",
        capacity: "கொள்ளளவு",
        worldCupStadiums: "உலகக் கோப்பை ஸ்டேடியங்கள்",
        noVenueData: "மைதான தரவு இல்லை.",
        scheduled: "வரவிருக்கும்",
        liveStatus: "நேரலை",
        manualTimerNotice: 'நேரலை ஸ்கோர் தானாக புதுப்பிக்கப்படும். கோல் நேரங்கள் கைமுறை போட்டிக் கடிகாரத்தை பயன்படுத்தும்; அதிகாரப்பூர்வ நேரத்திலிருந்து சில நிமிடங்கள் மாறலாம்.',
        paused: "இடைநிறுத்தம்",
        fullTime: "முழு நேரம்",
        aet: "கூடுதல் நேரத்திற்கு பின்",
        penalties: "பெனால்டிகள்",
        postponed: "ஒத்திவைக்கப்பட்டது",
        groupStage: "குழு நிலை",
        round32: "32 சுற்று",
        round16: "16 சுற்று",
        quarterFinals: "கால் இறுதிகள்",
        semiFinals: "அரை இறுதிகள்",
        thirdPlace: "மூன்றாம் இடம்",
        final: "இறுதி",
        tbc: "TBC",
        unknown: "தெரியவில்லை",
        pos: "இடம்",
        team: "அணி",
        player: "வீரர்",
        goals: "கோல்கள்",
        assists: "உதவிகள்",
        language: "டாஷ்போர்டு மொழி",
        controlCentre: "உலகக் கோப்பை 2026 கட்டுப்பாட்டு மையம்",
        overviewSubtitle: "போட்டிகள், முடிவுகள், குழுக்கள், வீரர் புள்ளிவிவரங்கள், மைதானங்கள், சாதனைகள் மற்றும் நாக்அவுட் கண்காணிப்புடன் நேரலை போட்டி டாஷ்போர்டு.",
        tournamentIntelligence: "போட்டி பகுப்பாய்வு",
        goldenBootCentre: "கோல்டன் பூட் மையம்",
        leaderSpotlight: "முன்னணி வீரர் கவனம்",
        playersTracked: "கண்காணிக்கப்படும் வீரர்கள்",
        totalAssists: "மொத்த உதவிகள்",
        totalYellowCards: "மொத்த மஞ்சள் அட்டைகள்",
        totalRedCards: "மொத்த சிவப்பு அட்டைகள்",
        upNext: "அடுத்தது",
        matchSpotlight: "போட்டி கவனம்",
        upcomingFixtures: "வரவிருக்கும் போட்டிகள்",
        latest: "சமீபத்திய",
        recentResults: "சமீபத்திய முடிவுகள்",
        playerWatch: "வீரர் கண்காணிப்பு",
        fixturesSubtitle: "போட்டி நாள் பிரிவுகள், தெளிவான ஸ்கோர் கார்டுகள், கொடிகள், மைதான விவரங்கள் மற்றும் தெளிவான நிலை பேட்ஜ்களுடன் மேம்பட்ட போட்டி மையம்.",
        days: "நாட்கள்",
        versus: "எதிராக",
        supportersNav: "🙏 ஆதரவாளர்கள்",
        supportersThankYouTitle: "🙏 ஆதரவாளர்கள் & நன்றி",
        supportersIntro: "இந்த திட்டம் தனிப்பட்ட Home Assistant டாஷ்போர்டாக தொடங்கி, சமூக கருத்து, சோதனை, யோசனைகள் மற்றும் ஆதரவால் வளர்ந்தது.",
        supportersSpecialThanks: "World Cup 2026 இணைப்பின் வளர்ச்சிக்கு ஆதரவு அளித்த அனைவருக்கும் சிறப்பு நன்றி.",
        supportersTitle: "🍺 ஆதரவாளர்கள்",
        latestSupporters: "⭐ சமீபத்திய ஆதரவாளர்கள்",
        allSupporters: "🌍 அனைத்து ஆதரவாளர்கள்",
        supporterDefaultMessage: "வளர்ச்சிக்கு ஆதரவு அளித்ததற்கு நன்றி.",
        anonymousSupporter: "பெயரில்லா ஆதரவாளர்",
        noSupporters: "இன்னும் ஆதரவாளர்கள் சேர்க்கப்படவில்லை. முதலில் Buy Me a Beer செய்து உங்கள் பெயரை இங்கே காட்டுங்கள்.",
        wantNameAdded: "உங்கள் பெயரை இங்கே சேர்க்க வேண்டுமா?",
        supportFutureUpdates: "எதிர்கால புதுப்பிப்புகள், பிழை திருத்தங்கள் மற்றும் புதிய உலகக் கோப்பை அம்சங்களுக்கு ஆதரவு அளிக்கவும்.",
        supporterBeerMessage: "🍺 உங்கள் பெயர் ஆதரவாளர்கள் பக்கத்தில் வர வேண்டுமா? PayPal மூலம் எனக்கு ஒரு பீர் வாங்கித் தருங்கள்; வளர்ச்சிக்கு ஆதரவு அளித்த நன்றியாக உங்கள் பெயர் World Cup 2026 ஆதரவாளர் பட்டியலில் சேர்க்கப்படும்.",
        donateBuyBeer: "🍺 நன்கொடை / எனக்கு பீர் வாங்குங்கள்",
        enjoyingIntegration: "🍺 இந்த இணைப்பை ரசிக்கிறீர்களா?",
        supportIntegration: "இந்த இணைப்பை ஆதரிக்கவும்",
        source: "மூலம்",
        totalSupporters: "மொத்த ஆதரவாளர்கள்",
        countries: "நாடுகள்",
        countriesSupporting: "ஆதரிக்கும் நாடுகள்",
        latestSupportDate: "சமீபத்திய ஆதரவு தேதி",
        playedShort: "வி",
        winsShort: "வெ",
        drawsShort: "ச",
        lossesShort: "தோ",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "புள்ளி",
        noResultsLoaded: "இன்னும் முடிவுகள் ஏற்றப்படவில்லை.",
        finishedMatchesSubtitle: "முடிந்த போட்டிகள் மற்றும் உறுதிப்படுத்தப்பட்ட ஸ்கோர்.",
        goldenBootAutoText: "football-data.org உலகக் கோப்பை கோல் தரவை வெளியிட்டதும் தானியங்கி கோல்டன் பூட் தரவு தோன்றும்.",
        realStadium: "உண்மையான ஸ்டேடியம்",
        matchesHosted: "நடத்திய போட்டிகள்",
        communitySupport: "சமூக ஆதரவு",
        supportersAroundWorld: "உலகம் முழுவதும் ஆதரவாளர்கள்",
        noLiveGames: "நேரலை விளையாட்டுகள் இல்லை",
        noGamesToday: "இன்று விளையாட்டுகள் இல்லை",
        conceded: "விட்டுக் கொடுத்த",
      },

      te: {
        title: "FIFA ప్రపంచ కప్ 2026",
        subtitle: "Home Assistant టోర్నమెంట్ యాప్",
        back: "← వెనక్కి",
        updated: "నవీకరించబడింది",
        loading: "ప్రపంచ కప్ 2026 లోడ్ అవుతోంది...",
        errorTitle: "विश्व कप 2026",
        errorText: "ऐप डेटा लोड नहीं हो सका।",
        overview: "అవలోకనం",
        live: "లైవ్ సెంటర్",
        fixtures: "ఫిక్చర్లు",
        results: "ఫలితాలు",
        groups: "గ్రూపులు",
        knockout: "నాకౌట్",
        players: "గోల్డెన్ బూట్",
        records: "రికార్డులు",
        stats: "గణాంకాల కేంద్రం",
        venues: "వేదికలు",
        totalMatches: "మొత్తం మ్యాచ్‌లు",
        loaded: "लोड हुए",
        played: "ఆడినవి",
        remaining: "మిగిలినవి",
        liveNow: "ఇప్పుడు లైవ్",
        totalGoals: "మొత్తం గోల్స్",
        nextMatch: "తదుపరి మ్యాచ్",
        tournamentStatus: "టోర్నమెంట్ స్థితి",
        demoMode: "डेमो मोड",
        on: "चालू",
        off: "बंद",
        lastUpdate: "చివరి నవీకరణ",
        ok: "ठीक",
        failed: "विफल",
        progress: "పురోగతి",
        topScorer: "టాప్ స్కోరర్",
        notAvailable: "అందుబాటులో లేదు",
        noUpcomingMatch: "రాబోయే మ్యాచ్ లోడ్ కాలేదు.",
        noLiveMatches: "ప్రస్తుతం లైవ్ మ్యాచ్‌లు లేవు.",
        fixturesResults: "ఫిక్చర్లు & ఫలితాలు",
        noFixtures: "ఇంకా ఫిక్చర్లు లోడ్ కాలేదు.",
        groupLabel: "గ్రూప్",
        groupsAL: "గ్రూపులు A-L",
        noGroups: "अभी कोई ग्रुप तालिका लोड नहीं है।",
        noTeamsGroup: "इस ग्रुप में अभी कोई टीम लोड नहीं है।",
        goldenBoot: "గోల్డెన్ బూట్ రేస్",
        noPlayerStats: "अभी कोई खिलाड़ी आँकड़े लोड नहीं हैं।",
        knockoutBracket: "నాకౌట్ బ్రాకెట్",
        fixturesNotAvailable: "फिक्स्चर अभी उपलब्ध नहीं हैं",
        highestMatchGoals: "एक मैच में सबसे अधिक गोल",
        biggestMargin: "सबसे बड़ा अंतर",
        topTeamGoals: "सबसे अधिक टीम गोल",
        bestDefenceGA: "सर्वश्रेष्ठ डिफेंस GA",
        highestScoringMatch: "सबसे अधिक गोल वाला मैच",
        biggestWin: "सबसे बड़ी जीत",
        topScoringTeam: "सबसे अधिक गोल करने वाली टीम",
        bestDefence: "सर्वश्रेष्ठ डिफेंस",
        noResult: "अभी कोई परिणाम नहीं।",
        noTeamGoalData: "अभी टीम गोल डेटा नहीं है।",
        noDefensiveData: "अभी डिफेंस डेटा नहीं है।",
        matchesPlayed: "ఆడిన మ్యాచ్‌లు",
        yellowCards: "పసుపు కార్డులు",
        redCards: "ఎరుపు కార్డులు",
        minutes: "मिनट",
        goalsPerMatch: "గోల్స్ / మ్యాచ్",
        draws: "ड्रॉ",
        drawRate: "ड्रॉ दर",
        bttsRate: "दोनों टीम स्कोर दर",
        over25Rate: "2.5 से अधिक दर",
        stadiums: "స్టేడియంలు",
        usaVenues: "यूएसए वेन्यू",
        canadaVenues: "कनाडा वेन्यू",
        mexicoVenues: "मेक्सिको वेन्यू",
        finalVenue: "फाइनल वेन्यू",
        capacity: "సామర్థ్యం",
        worldCupStadiums: "ప్రపంచ కప్ స్టేడియంలు",
        noVenueData: "कोई वेन्यू डेटा उपलब्ध नहीं।",
        scheduled: "రాబోయేవి",
        liveStatus: "లైవ్",
        manualTimerNotice: 'లైవ్ స్కోర్లు ఆటోమేటిక్\u200cగా నవీకరించబడతాయి. గోల్ సమయాలు మాన్యువల్ మ్యాచ్ గడియారాన్ని ఉపయోగిస్తాయి మరియు అధికారిక సమయాలకంటే కొన్ని నిమిషాలు మారవచ్చు.',
        paused: "रुका हुआ",
        fullTime: "పూర్తి సమయం",
        aet: "अतिरिक्त समय के बाद",
        penalties: "पेनल्टी",
        postponed: "स्थगित",
        groupStage: "గ్రూప్ దశ",
        round32: "రౌండ్ ఆఫ్ 32",
        round16: "రౌండ్ ఆఫ్ 16",
        quarterFinals: "క్వార్టర్ ఫైనల్స్",
        semiFinals: "సెమీ ఫైనల్స్",
        thirdPlace: "మూడో స్థానం",
        final: "ఫైనల్",
        tbc: "TBC",
        unknown: "తెలియదు",
        pos: "స్థానం",
        team: "జట్టు",
        player: "ఆటగాడు",
        goals: "గోల్స్",
        assists: "అసిస్ట్లు",
        language: "డ్యాష్‌బోర్డ్ భాష",
        controlCentre: "ప్రపంచ కప్ 2026 కంట్రోల్ సెంటర్",
        overviewSubtitle: "फिक्स्चर, परिणाम, ग्रुप, खिलाड़ी आँकड़े, वेन्यू, रिकॉर्ड और नॉकआउट ट्रैकिंग के साथ लाइव टूर्नामेंट डैशबोर्ड।",
        tournamentIntelligence: "టోర్నమెంట్ విశ్లేషణ",
        goldenBootCentre: "गोल्डन बूट सेंटर",
        leaderSpotlight: "लीडर स्पॉटलाइट",
        playersTracked: "ट्रैक किए गए खिलाड़ी",
        totalAssists: "कुल असिस्ट",
        totalYellowCards: "कुल पीले कार्ड",
        totalRedCards: "कुल लाल कार्ड",
        upNext: "తదుపరి",
        matchSpotlight: "మ్యాచ్ స్పాట్‌లైట్",
        upcomingFixtures: "రాబోయే ఫిక్చర్లు",
        latest: "తాజా",
        recentResults: "ఇటీవలి ఫలితాలు",
        playerWatch: "ఆటగాళ్ల వీక్షణ",
        fixturesSubtitle: "मैच-दिन सेक्शन, बोल्ड स्कोर कार्ड, झंडे, वेन्यू विवरण और साफ लाइव/परिणाम बैज वाला बेहतर मैच सेंटर।",
        days: "రోజులు",
        versus: "వర్సెస్",
        supportersNav: "🙏 మద్దతుదారులు",
        supportersThankYouTitle: "🙏 మద్దతుదారులు & ధన్యవాదాలు",
        supportersIntro: "यह प्रोजेक्ट एक निजी Home Assistant डैशबोर्ड के रूप में शुरू हुआ और समुदाय की प्रतिक्रिया, टेस्टिंग, विचारों और समर्थन से बढ़ा।",
        supportersSpecialThanks: "World Cup 2026 इंटीग्रेशन के विकास का समर्थन करने वाले सभी लोगों को विशेष धन्यवाद।",
        supportersTitle: "🍺 మద్దతుదారులు",
        latestSupporters: "⭐ తాజా మద్దతుదారులు",
        allSupporters: "🌍 అన్ని మద్దతుదారులు",
        supporterDefaultMessage: "विकास का समर्थन करने के लिए धन्यवाद।",
        anonymousSupporter: "गुमनाम समर्थक",
        noSupporters: "अभी कोई समर्थक नहीं जोड़ा गया। सबसे पहले Buy Me a Beer करें और अपना नाम यहाँ दिखाएँ।",
        wantNameAdded: "अपना नाम यहाँ जोड़ना चाहते हैं?",
        supportFutureUpdates: "भविष्य के अपडेट, बग फिक्स और नई विश्व कप सुविधाओं का समर्थन करें।",
        supporterBeerMessage: "🍺 क्या आप अपना नाम समर्थक पेज पर दिखाना चाहते हैं? PayPal के जरिए मुझे एक बीयर खरीदें और विकास समर्थन के धन्यवाद के रूप में आपका नाम World Cup 2026 समर्थक सूची में जोड़ा जा सकता है।",
        donateBuyBeer: "🍺 విరాళం / నాకు బీర్ కొనండి",
        enjoyingIntegration: "🍺 क्या आपको यह इंटीग्रेशन पसंद आ रहा है?",
        supportIntegration: "ఈ ఇంటిగ్రేషన్‌కు మద్దతు ఇవ్వండి",
        source: "మూలం",
        totalSupporters: "మొత్తం మద్దతుదారులు",
        countries: "దేశాలు",
        countriesSupporting: "మద్దతు ఇస్తున్న దేశాలు",
        latestSupportDate: "नवीनतम समर्थन तारीख",
        playedShort: "खे",
        winsShort: "जी",
        drawsShort: "ड्रॉ",
        lossesShort: "हा",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "अंक",
        noResultsLoaded: "अभी कोई परिणाम लोड नहीं है।",
        finishedMatchesSubtitle: "समाप्त मैच और पुष्टि किए गए स्कोर।",
        goldenBootAutoText: "football-data.org द्वारा विश्व कप स्कोरर डेटा प्रकाशित होने पर गोल्डन बूट डेटा अपने-आप दिखाई देगा।",
        realStadium: "वास्तविक स्टेडियम",
        matchesHosted: "होस्ट किए गए मैच",
        communitySupport: "కమ్యూనిటీ మద్దతు",
        supportersAroundWorld: "ప్రపంచవ్యాప్తంగా మద్దతుదారులు",
        noLiveGames: "లైవ్ గేమ్స్ లేవు",
        noGamesToday: "ఈ రోజు గేమ్స్ లేవు",
        conceded: "అనుమతించిన",
      },

      pa: {
        title: "FIFA ਵਰਲਡ ਕੱਪ 2026",
        subtitle: "Home Assistant ਟੂਰਨਾਮੈਂਟ ਐਪ",
        back: "← ਵਾਪਸ",
        updated: "ਅੱਪਡੇਟ ਕੀਤਾ",
        loading: "ਵਰਲਡ ਕੱਪ 2026 ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        errorTitle: "ਵਰਲਡ ਕੱਪ 2026",
        errorText: "ਐਪ ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ।",
        overview: "ਝਲਕ",
        live: "ਲਾਈਵ ਸੈਂਟਰ",
        fixtures: "ਫਿਕਸਚਰ",
        results: "ਨਤੀਜੇ",
        groups: "ਗਰੁੱਪ",
        knockout: "ਨਾਕਆਉਟ",
        players: "ਗੋਲਡਨ ਬੂਟ",
        records: "ਰਿਕਾਰਡ",
        stats: "ਸਟੈਟਸ ਹੱਬ",
        venues: "ਵੇਨਿਊ",
        totalMatches: "ਕੁੱਲ ਮੈਚ",
        loaded: "ਲੋਡ ਹੋਏ",
        played: "ਖੇਡੇ ਗਏ",
        remaining: "ਬਾਕੀ",
        liveNow: "ਹੁਣ ਲਾਈਵ",
        totalGoals: "ਕੁੱਲ ਗੋਲ",
        nextMatch: "ਅਗਲਾ ਮੈਚ",
        tournamentStatus: "ਟੂਰਨਾਮੈਂਟ ਸਥਿਤੀ",
        demoMode: "ਡੈਮੋ ਮੋਡ",
        on: "ਚਾਲੂ",
        off: "ਬੰਦ",
        lastUpdate: "ਆਖਰੀ ਅੱਪਡੇਟ",
        ok: "ठीक",
        failed: "ਅਸਫਲ",
        progress: "ਤਰੱਕੀ",
        topScorer: "ਟਾਪ ਸਕੋਰਰ",
        notAvailable: "ਉਪਲਬਧ ਨਹੀਂ",
        noUpcomingMatch: "ਕੋਈ ਆਉਣ ਵਾਲਾ ਮੈਚ ਲੋਡ ਨਹੀਂ।",
        noLiveMatches: "ਇਸ ਵੇਲੇ ਕੋਈ ਮੈਚ ਲਾਈਵ ਨਹੀਂ।",
        fixturesResults: "ਫਿਕਸਚਰ ਅਤੇ ਨਤੀਜੇ",
        noFixtures: "ਹਾਲੇ ਕੋਈ ਫਿਕਸਚਰ ਲੋਡ ਨਹੀਂ।",
        groupLabel: "ਗਰੁੱਪ",
        groupsAL: "ਗਰੁੱਪ A-L",
        noGroups: "ਹਾਲੇ ਕੋਈ ਗਰੁੱਪ ਸਟੈਂਡਿੰਗ ਲੋਡ ਨਹੀਂ।",
        noTeamsGroup: "ਇਸ ਗਰੁੱਪ ਵਿੱਚ ਹਾਲੇ ਕੋਈ ਟੀਮ ਲੋਡ ਨਹੀਂ।",
        goldenBoot: "ਗੋਲਡਨ ਬੂਟ ਰੇਸ",
        noPlayerStats: "ਹਾਲੇ ਕੋਈ ਖਿਡਾਰੀ ਅੰਕੜੇ ਲੋਡ ਨਹੀਂ।",
        knockoutBracket: "ਨਾਕਆਉਟ ਬ੍ਰੈਕਟ",
        fixturesNotAvailable: "ਫਿਕਸਚਰ ਹਾਲੇ ਉਪਲਬਧ ਨਹੀਂ",
        highestMatchGoals: "ਇੱਕ ਮੈਚ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ਗੋਲ",
        biggestMargin: "ਸਭ ਤੋਂ ਵੱਡਾ ਫਰਕ",
        topTeamGoals: "ਸਭ ਤੋਂ ਵੱਧ ਟੀਮ ਗੋਲ",
        bestDefenceGA: "ਸਭ ਤੋਂ ਵਧੀਆ ਡਿਫੈਂਸ GA",
        highestScoringMatch: "ਸਭ ਤੋਂ ਵੱਧ ਗੋਲਾਂ ਵਾਲਾ ਮੈਚ",
        biggestWin: "ਸਭ ਤੋਂ ਵੱਡੀ ਜਿੱਤ",
        topScoringTeam: "ਸਭ ਤੋਂ ਵੱਧ ਗੋਲ ਕਰਨ ਵਾਲੀ ਟੀਮ",
        bestDefence: "ਸਭ ਤੋਂ ਵਧੀਆ ਡਿਫੈਂਸ",
        noResult: "ਹਾਲੇ ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ।",
        noTeamGoalData: "अभी टीम गोल डेटा नहीं है।",
        noDefensiveData: "अभी डिफेंस डेटा नहीं है।",
        matchesPlayed: "ਖੇਡੇ ਗਏ ਮੈਚ",
        yellowCards: "ਪੀਲੇ ਕਾਰਡ",
        redCards: "ਲਾਲ ਕਾਰਡ",
        minutes: "ਮਿੰਟ",
        goalsPerMatch: "ਗੋਲ / ਮੈਚ",
        draws: "ਡਰਾਅ",
        drawRate: "ਡਰਾਅ ਦਰ",
        bttsRate: "दोनों टीम स्कोर दर",
        over25Rate: "2.5 से अधिक दर",
        stadiums: "ਸਟੇਡੀਅਮ",
        usaVenues: "यूएसए वेन्यू",
        canadaVenues: "कनाडा वेन्यू",
        mexicoVenues: "मेक्सिको वेन्यू",
        finalVenue: "ਫਾਈਨਲ ਵੇਨਿਊ",
        capacity: "ਸਮਰੱਥਾ",
        worldCupStadiums: "ਵਰਲਡ ਕੱਪ ਸਟੇਡੀਅਮ",
        noVenueData: "कोई वेन्यू डेटा उपलब्ध नहीं।",
        scheduled: "ਆਉਣ ਵਾਲੇ",
        liveStatus: "ਲਾਈਵ",
        manualTimerNotice: 'ਲਾਈਵ ਸਕੋਰ ਆਪਣੇ ਆਪ ਅੱਪਡੇਟ ਹੁੰਦੇ ਹਨ। ਗੋਲ ਸਮੇਂ ਮੈਨੂਅਲ ਮੈਚ ਘੜੀ ਤੋਂ ਲਏ ਜਾਂਦੇ ਹਨ ਅਤੇ ਅਧਿਕਾਰਕ ਸਮੇਂ ਤੋਂ ਕੁਝ ਮਿੰਟ ਵੱਖ ਹੋ ਸਕਦੇ ਹਨ।',
        paused: "ਰੁਕਿਆ",
        fullTime: "ਫੁੱਲ ਟਾਈਮ",
        aet: "ਵਾਧੂ ਸਮੇਂ ਤੋਂ ਬਾਅਦ",
        penalties: "ਪੈਨਲਟੀ",
        postponed: "ਮੁਲਤਵੀ",
        groupStage: "ਗਰੁੱਪ ਸਟੇਜ",
        round32: "ਰਾਊਂਡ ਆਫ 32",
        round16: "ਰਾਊਂਡ ਆਫ 16",
        quarterFinals: "ਕੁਆਰਟਰ ਫਾਈਨਲ",
        semiFinals: "ਸੈਮੀ ਫਾਈਨਲ",
        thirdPlace: "ਤੀਜਾ ਸਥਾਨ",
        final: "ਫਾਈਨਲ",
        tbc: "TBC",
        unknown: "ਅਣਜਾਣ",
        pos: "ਸਥਾਨ",
        team: "ਟੀਮ",
        player: "ਖਿਡਾਰੀ",
        goals: "ਗੋਲ",
        assists: "ਅਸਿਸਟ",
        language: "ਡੈਸ਼ਬੋਰਡ ਭਾਸ਼ਾ",
        controlCentre: "ਵਰਲਡ ਕੱਪ 2026 ਕੰਟਰੋਲ ਸੈਂਟਰ",
        overviewSubtitle: "फिक्स्चर, परिणाम, ग्रुप, खिलाड़ी आँकड़े, वेन्यू, रिकॉर्ड और नॉकआउट ट्रैकिंग के साथ लाइव टूर्नामेंट डैशबोर्ड।",
        tournamentIntelligence: "ਟੂਰਨਾਮੈਂਟ ਵਿਸ਼ਲੇਸ਼ਣ",
        goldenBootCentre: "ਗੋਲਡਨ ਬੂਟ ਸੈਂਟਰ",
        leaderSpotlight: "लीडर स्पॉटलाइट",
        playersTracked: "ट्रैक किए गए खिलाड़ी",
        totalAssists: "कुल असिस्ट",
        totalYellowCards: "कुल पीले कार्ड",
        totalRedCards: "कुल लाल कार्ड",
        upNext: "ਅਗਲਾ",
        matchSpotlight: "ਮੈਚ ਸਪੌਟਲਾਈਟ",
        upcomingFixtures: "ਆਉਣ ਵਾਲੇ ਫਿਕਸਚਰ",
        latest: "ਤਾਜ਼ਾ",
        recentResults: "ਤਾਜ਼ਾ ਨਤੀਜੇ",
        playerWatch: "ਖਿਡਾਰੀ ਵਾਚ",
        fixturesSubtitle: "मैच-दिन सेक्शन, बोल्ड स्कोर कार्ड, झंडे, वेन्यू विवरण और साफ लाइव/परिणाम बैज वाला बेहतर मैच सेंटर।",
        days: "ਦਿਨ",
        versus: "ਵਿਰੁੱਧ",
        supportersNav: "🙏 ਸਮਰਥਕ",
        supportersThankYouTitle: "🙏 ਸਮਰਥਕ ਅਤੇ ਧੰਨਵਾਦ",
        supportersIntro: "यह प्रोजेक्ट एक निजी Home Assistant डैशबोर्ड के रूप में शुरू हुआ और समुदाय की प्रतिक्रिया, टेस्टिंग, विचारों और समर्थन से बढ़ा।",
        supportersSpecialThanks: "World Cup 2026 इंटीग्रेशन के विकास का समर्थन करने वाले सभी लोगों को विशेष धन्यवाद।",
        supportersTitle: "🍺 ਸਮਰਥਕ",
        latestSupporters: "⭐ ਤਾਜ਼ਾ ਸਮਰਥਕ",
        allSupporters: "🌍 ਸਾਰੇ ਸਮਰਥਕ",
        supporterDefaultMessage: "ਵਿਕਾਸ ਦਾ ਸਮਰਥਨ ਕਰਨ ਲਈ ਧੰਨਵਾਦ।",
        anonymousSupporter: "ਗੁਮਨਾਮ ਸਮਰਥਕ",
        noSupporters: "अभी कोई समर्थक नहीं जोड़ा गया। सबसे पहले Buy Me a Beer करें और अपना नाम यहाँ दिखाएँ।",
        wantNameAdded: "अपना नाम यहाँ जोड़ना चाहते हैं?",
        supportFutureUpdates: "भविष्य के अपडेट, बग फिक्स और नई विश्व कप सुविधाओं का समर्थन करें।",
        supporterBeerMessage: "🍺 क्या आप अपना नाम समर्थक पेज पर दिखाना चाहते हैं? PayPal के जरिए मुझे एक बीयर खरीदें और विकास समर्थन के धन्यवाद के रूप में आपका नाम World Cup 2026 समर्थक सूची में जोड़ा जा सकता है।",
        donateBuyBeer: "🍺 ਦਾਨ / ਮੈਨੂੰ ਬੀਅਰ ਖਰੀਦੋ",
        enjoyingIntegration: "🍺 क्या आपको यह इंटीग्रेशन पसंद आ रहा है?",
        supportIntegration: "ਇਸ ਇੰਟੀਗ੍ਰੇਸ਼ਨ ਦਾ ਸਮਰਥਨ ਕਰੋ",
        source: "ਸਰੋਤ",
        totalSupporters: "ਕੁੱਲ ਸਮਰਥਕ",
        countries: "ਦੇਸ਼",
        countriesSupporting: "ਸਮਰਥਨ ਕਰਨ ਵਾਲੇ ਦੇਸ਼",
        latestSupportDate: "नवीनतम समर्थन तारीख",
        playedShort: "खे",
        winsShort: "जी",
        drawsShort: "ड्रॉ",
        lossesShort: "हा",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "अंक",
        noResultsLoaded: "अभी कोई परिणाम लोड नहीं है।",
        finishedMatchesSubtitle: "समाप्त मैच और पुष्टि किए गए स्कोर।",
        goldenBootAutoText: "football-data.org द्वारा विश्व कप स्कोरर डेटा प्रकाशित होने पर गोल्डन बूट डेटा अपने-आप दिखाई देगा।",
        realStadium: "वास्तविक स्टेडियम",
        matchesHosted: "होस्ट किए गए मैच",
        communitySupport: "ਕਮਿਊਨਿਟੀ ਸਮਰਥਨ",
        supportersAroundWorld: "ਦੁਨੀਆ ਭਰ ਦੇ ਸਮਰਥਕ",
        noLiveGames: "ਕੋਈ ਲਾਈਵ ਗੇਮ ਨਹੀਂ",
        noGamesToday: "ਅੱਜ ਕੋਈ ਗੇਮ ਨਹੀਂ",
        conceded: "ਖਾਧੇ ਗਏ",
      },
      ar: {
        title: "كأس العالم FIFA 2026",
        subtitle: "تطبيق بطولة مخصص لـ Home Assistant",
        back: "← رجوع",
        updated: "آخر تحديث",
        loading: "جاري تحميل كأس العالم 2026...",
        errorTitle: "كأس العالم 2026",
        errorText: "تعذر تحميل بيانات التطبيق.",
        overview: "نظرة عامة",
        live: "المركز المباشر",
        fixtures: "المباريات",
        groups: "المجموعات",
        knockout: "الأدوار الإقصائية",
        players: "الحذاء الذهبي",
        records: "الأرقام القياسية",
        stats: "الإحصائيات",
        venues: "الملاعب",
        totalMatches: "إجمالي المباريات",
        loaded: "تم التحميل",
        played: "لُعبت",
        remaining: "المتبقية",
        liveNow: "مباشر الآن",
        totalGoals: "إجمالي الأهداف",
        nextMatch: "المباراة القادمة",
        tournamentStatus: "حالة البطولة",
        demoMode: "وضع العرض",
        on: "تشغيل",
        off: "إيقاف",
        lastUpdate: "آخر تحديث",
        ok: "جيد",
        failed: "فشل",
        progress: "التقدم",
        topScorer: "الهداف",
        notAvailable: "غير متاح",
        noUpcomingMatch: "لا توجد مباراة قادمة.",
        noLiveMatches: "لا توجد مباريات مباشرة الآن.",
        fixturesResults: "المباريات والنتائج",
        noFixtures: "لا توجد مباريات محملة.",
        groupLabel: "المجموعة",
        groupsAL: "المجموعات A-L",
        noGroups: "لا توجد جداول مجموعات.",
        noTeamsGroup: "لا توجد فرق محملة.",
        goldenBoot: "سباق الحذاء الذهبي",
        noPlayerStats: "لا توجد إحصائيات لاعبين.",
        knockoutBracket: "جدول الإقصائيات",
        fixturesNotAvailable: "المباريات غير متاحة",
        highestMatchGoals: "أكثر مباراة أهدافاً",
        biggestMargin: "أكبر فارق",
        topTeamGoals: "أكثر فريق تسجيلاً",
        bestDefenceGA: "أفضل دفاع",
        highestScoringMatch: "أكثر مباراة أهدافاً",
        biggestWin: "أكبر فوز",
        topScoringTeam: "أكثر فريق تسجيلاً",
        bestDefence: "أفضل دفاع",
        noResult: "لا توجد نتيجة بعد.",
        noTeamGoalData: "لا توجد بيانات أهداف.",
        noDefensiveData: "لا توجد بيانات دفاعية.",
        matchesPlayed: "المباريات الملعوبة",
        yellowCards: "البطاقات الصفراء",
        redCards: "البطاقات الحمراء",
        minutes: "الدقائق",
        goalsPerMatch: "أهداف / مباراة",
        draws: "تعادلات",
        drawRate: "نسبة التعادل",
        bttsRate: "كلا الفريقين يسجل",
        over25Rate: "أكثر من 2.5",
        stadiums: "الملاعب",
        usaVenues: "ملاعب أمريكا",
        canadaVenues: "ملاعب كندا",
        mexicoVenues: "ملاعب المكسيك",
        finalVenue: "ملعب النهائي",
        capacity: "السعة",
        worldCupStadiums: "ملاعب كأس العالم",
        noVenueData: "لا توجد بيانات ملاعب.",
        scheduled: "مجدولة",
        liveStatus: "مباشر",
        manualTimerNotice: 'يتم تحديث النتائج المباشرة تلقائيًا. تعتمد أوقات الأهداف على ساعة المباراة اليدوية وقد تختلف عن الأوقات الرسمية ببضع دقائق.',
        paused: "استراحة",
        fullTime: "نهاية المباراة",
        aet: "بعد وقت إضافي",
        penalties: "ركلات ترجيح",
        postponed: "مؤجلة",
        groupStage: "دور المجموعات",
        round32: "دور 32",
        round16: "دور 16",
        quarterFinals: "ربع النهائي",
        semiFinals: "نصف النهائي",
        thirdPlace: "المركز الثالث",
        final: "النهائي",
        tbc: "يحدد لاحقاً",
        unknown: "غير معروف",
        pos: "المركز",
        team: "الفريق",
        player: "اللاعب",
        goals: "الأهداف",
        assists: "التمريرات",
        language: "لغة اللوحة",
        controlCentre: 'مركز تحكم كأس العالم 2026',
        overviewSubtitle: 'لوحة بطولة مباشرة تشمل المباريات والنتائج والمجموعات وإحصائيات اللاعبين والملاعب والأرقام والأدوار الإقصائية في مكان واحد.',
        tournamentIntelligence: 'تحليل البطولة',
        goldenBootCentre: 'مركز الحذاء الذهبي',
        leaderSpotlight: 'تسليط الضوء على المتصدر',
        playersTracked: 'اللاعبون المتابعون',
        totalAssists: 'إجمالي التمريرات',
        totalYellowCards: 'إجمالي البطاقات الصفراء',
        totalRedCards: 'إجمالي البطاقات الحمراء',
        upNext: 'التالي',
        matchSpotlight: 'تسليط الضوء على المباراة',
        upcomingFixtures: 'المباريات القادمة',
        latest: 'الأحدث',
        recentResults: 'النتائج الأخيرة',
        playerWatch: 'متابعة اللاعبين',
        fixturesSubtitle: 'مركز مباريات أوضح مع أقسام أيام المباريات وبطاقات نتائج وأعلام وتفاصيل ملاعب وحالات مباشرة أوضح.',
        days: 'أيام',
        versus: 'ضد',
        supportersNav: '🙏 الداعمون',
        supportersThankYouTitle: '🙏 الداعمون والشكر',
        supportersIntro: 'بدأ هذا المشروع كلوحة Home Assistant شخصية، ونما بفضل الملاحظات والاختبارات والأفكار والدعم من المجتمع.',
        supportersSpecialThanks: 'شكر خاص لكل من دعم تطوير تكامل كأس العالم 2026.',
        supportersTitle: '🍺 الداعمون',
        latestSupporters: "⭐ أحدث الداعمين",
        allSupporters: "🌍 جميع الداعمين",
        supporterDefaultMessage: 'شكراً لدعمك التطوير.',
        anonymousSupporter: 'داعم مجهول',
        noSupporters: 'لا يوجد داعمون بعد. كن أول من يشتري لي بيرة ويظهر اسمه هنا.',
        wantNameAdded: 'هل تريد إضافة اسمك هنا؟',
        supportFutureUpdates: 'ادعم التحديثات المستقبلية وإصلاح الأخطاء وميزات كأس العالم الجديدة.',
        supporterBeerMessage: '🍺 هل تريد ظهور اسمك في صفحة الداعمين؟ اشترِ لي بيرة عبر PayPal ويمكن إضافة اسمك إلى قائمة داعمي World Cup 2026 كشكر على دعمك للتطوير.',
        donateBuyBeer: '🍺 تبرع / اشترِ لي بيرة',
        enjoyingIntegration: '🍺 هل تستمتع بهذا التكامل؟',
        supportIntegration: 'ادعم هذا التكامل',
        results: "النتائج",
        source: "المصدر",
        totalSupporters: "إجمالي الداعمين",
        countries: "الدول",
        countriesSupporting: "الدول الداعمة",
        latestSupportDate: "آخر تاريخ دعم",
        playedShort: "لعب",
        winsShort: "فوز",
        drawsShort: "تعادل",
        lossesShort: "خسارة",
        goalsForShort: "له",
        goalsAgainstShort: "عليه",
        goalDifferenceShort: "فارق",
        pointsShort: "نقاط",
        noResultsLoaded: "لم يتم تحميل أي نتائج بعد.",
        finishedMatchesSubtitle: "المباريات المنتهية والنتائج المؤكدة.",
        goldenBootAutoText: "ستظهر بيانات الحذاء الذهبي تلقائياً عندما ينشر football-data.org بيانات هدافي كأس العالم.",
        realStadium: "الملعب الحقيقي",
        matchesHosted: "المباريات المستضافة",
        communitySupport: "دعم المجتمع",
        supportersAroundWorld: "الداعمون حول العالم",
        noLiveGames: "لا توجد مباريات مباشرة",
        noGamesToday: "لا توجد مباريات اليوم",
        conceded: "استقبل",
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



      zh: {
        title: '2026 FIFA世界杯',
        subtitle: 'Home Assistant 专用赛事应用',
        back: '← 返回',
        updated: '已更新',
        loading: '正在加载2026世界杯...',
        errorTitle: '2026世界杯',
        errorText: '无法加载应用数据。',
        overview: '概览',
        live: '直播中心',
        fixtures: '赛程',
        results: "结果",
        groups: '小组',
        knockout: '淘汰赛',
        players: '金靴榜',
        records: '纪录',
        stats: '统计中心',
        venues: '场馆',
        totalMatches: '总场次',
        loaded: '已加载',
        played: '已赛',
        remaining: '剩余',
        liveNow: '正在直播',
        totalGoals: '总进球',
        nextMatch: '下一场比赛',
        tournamentStatus: '赛事状态',
        demoMode: '演示模式',
        on: '开',
        off: '关',
        lastUpdate: '最后更新',
        ok: '正常',
        failed: '失败',
        progress: '进度',
        topScorer: '最佳射手',
        notAvailable: '不可用',
        noUpcomingMatch: '未加载即将进行的比赛。',
        noLiveMatches: '当前没有直播比赛。',
        fixturesResults: '赛程与结果',
        noFixtures: '尚未加载赛程。',
        groupLabel: '小组',
        groupsAL: 'A-L组',
        noGroups: '尚未加载小组积分榜。',
        noTeamsGroup: '该小组尚未加载球队。',
        goldenBoot: '金靴之争',
        noPlayerStats: '尚未加载球员统计。',
        knockoutBracket: '淘汰赛对阵图',
        fixturesNotAvailable: '赛程暂不可用',
        highestMatchGoals: '单场最多进球',
        biggestMargin: '最大分差',
        topTeamGoals: '球队进球最多',
        bestDefenceGA: '最佳防守',
        highestScoringMatch: '进球最多比赛',
        biggestWin: '最大胜利',
        topScoringTeam: '进球最多球队',
        bestDefence: '最佳防守',
        noResult: '暂无结果。',
        noTeamGoalData: '暂无球队进球数据。',
        noDefensiveData: '暂无防守数据。',
        matchesPlayed: '已赛场次',
        yellowCards: '黄牌',
        redCards: '红牌',
        minutes: '分钟',
        goalsPerMatch: '进球 / 场',
        draws: '平局',
        drawRate: '平局率',
        bttsRate: '双方进球率',
        over25Rate: '超过2.5球率',
        stadiums: '球场',
        usaVenues: '美国场馆',
        canadaVenues: '加拿大场馆',
        mexicoVenues: '墨西哥场馆',
        finalVenue: '决赛场馆',
        capacity: '容量',
        worldCupStadiums: '世界杯球场',
        noVenueData: '暂无场馆数据。',
        scheduled: '即将开始',
        liveStatus: "直播",
        manualTimerNotice: '实时比分会自动更新。进球时间使用手动比赛计时器，可能与官方时间相差几分钟。',
        paused: '暂停',
        fullTime: '全场结束',
        aet: '加时后',
        penalties: '点球',
        postponed: '延期',
        groupStage: '小组赛',
        round32: '32强',
        round16: '16强',
        quarterFinals: '四分之一决赛',
        semiFinals: '半决赛',
        thirdPlace: '季军赛',
        final: '决赛',
        tbc: '待定',
        unknown: '未知',
        pos: '排名',
        team: '球队',
        player: '球员',
        goals: '进球',
        assists: '助攻',
        language: '仪表盘语言',
        controlCentre: '2026世界杯控制中心',
        overviewSubtitle: '一个集赛程、结果、小组、球员统计、场馆、纪录和淘汰赛追踪于一体的实时赛事仪表盘。',
        tournamentIntelligence: '赛事分析',
        goldenBootCentre: '金靴中心',
        leaderSpotlight: '领跑者聚焦',
        playersTracked: '追踪球员',
        totalAssists: '总助攻',
        totalYellowCards: '总黄牌',
        totalRedCards: '总红牌',
        upNext: '下一场',
        matchSpotlight: '焦点比赛',
        upcomingFixtures: '即将进行的比赛',
        latest: '最新',
        recentResults: '近期结果',
        playerWatch: '球员观察',
        fixturesSubtitle: '更清晰的世界杯比赛中心，包含比赛日分区、醒目的比分卡、旗帜、场馆详情和清楚的状态标签。',
        days: '天',
        versus: '对',
        supportersNav: '🙏 支持者',
        supportersThankYouTitle: '🙏 支持者与感谢',
        supportersIntro: '这个项目最初是个人的 Home Assistant 仪表盘，并因社区反馈、测试、想法和支持而不断成长。',
        supportersSpecialThanks: '特别感谢所有支持 World Cup 2026 集成开发的人。',
        supportersTitle: '🍺 支持者',
        latestSupporters: "⭐ 最新支持者",
        allSupporters: "🌍 所有支持者",
        supporterDefaultMessage: '感谢你支持开发。',
        anonymousSupporter: '匿名支持者',
        noSupporters: '还没有支持者。成为第一个请我喝啤酒并把名字列在这里的人。',
        wantNameAdded: '想把你的名字加到这里吗？',
        supportFutureUpdates: '支持未来更新、错误修复和新的世界杯功能。',
        supporterBeerMessage: '🍺 想让你的名字出现在支持者页面吗？通过 PayPal 请我喝杯啤酒，你的名字就可以加入 World Cup 2026 支持者名单，作为对开发支持的感谢。',
        donateBuyBeer: '🍺 捐赠 / 请我喝啤酒',
        enjoyingIntegration: '🍺 喜欢这个集成吗？',
        supportIntegration: '支持这个集成',
        source: "来源",
        totalSupporters: "支持者总数",
        countries: "国家",
        countriesSupporting: "支持国家",
        latestSupportDate: "最新支持日期",
        playedShort: "赛",
        winsShort: "胜",
        drawsShort: "平",
        lossesShort: "负",
        goalsForShort: "进",
        goalsAgainstShort: "失",
        goalDifferenceShort: "净",
        pointsShort: "分",
        noResultsLoaded: "尚未加载结果。",
        finishedMatchesSubtitle: "已结束比赛和确认比分。",
        goldenBootAutoText: "当 football-data.org 发布世界杯射手数据后，自动金靴数据将会显示。",
        realStadium: "实际球场",
        matchesHosted: "承办比赛",
        communitySupport: "社区支持",
        supportersAroundWorld: "全球支持者",
        noLiveGames: "没有直播比赛",
        noGamesToday: "今天没有比赛",
        conceded: '失球',
      },

      zh_tw: {
        title: '2026 FIFA 世界盃',
        subtitle: 'Home Assistant 專用賽事應用',
        back: '← 返回',
        updated: '已更新',
        loading: '正在載入 2026 世界盃...',
        errorTitle: '2026世界杯',
        errorText: '无法加载应用数据。',
        overview: '總覽',
        live: '直播中心',
        fixtures: '賽程',
        results: "結果",
        groups: '分組',
        knockout: '淘汰赛',
        players: '金靴榜',
        records: '纪录',
        stats: '统计中心',
        venues: '場館',
        totalMatches: '总场次',
        loaded: '已載入',
        played: '已賽',
        remaining: '剩餘',
        liveNow: '現正直播',
        totalGoals: '總入球',
        nextMatch: '下一場比賽',
        tournamentStatus: '赛事状态',
        demoMode: '演示模式',
        on: '开',
        off: '关',
        lastUpdate: '最后更新',
        ok: '正常',
        failed: '失败',
        progress: '进度',
        topScorer: '最佳射手',
        notAvailable: '不可用',
        noUpcomingMatch: '未加载即将进行的比赛。',
        noLiveMatches: '当前没有直播比赛。',
        fixturesResults: '赛程与结果',
        noFixtures: '尚未加载赛程。',
        groupLabel: '小组',
        groupsAL: 'A-L组',
        noGroups: '尚未加载小组积分榜。',
        noTeamsGroup: '该小组尚未加载球队。',
        goldenBoot: '金靴之争',
        noPlayerStats: '尚未加载球员统计。',
        knockoutBracket: '淘汰赛对阵图',
        fixturesNotAvailable: '赛程暂不可用',
        highestMatchGoals: '单场最多进球',
        biggestMargin: '最大分差',
        topTeamGoals: '球队进球最多',
        bestDefenceGA: '最佳防守',
        highestScoringMatch: '进球最多比赛',
        biggestWin: '最大胜利',
        topScoringTeam: '进球最多球队',
        bestDefence: '最佳防守',
        noResult: '暂无结果。',
        noTeamGoalData: '暂无球队进球数据。',
        noDefensiveData: '暂无防守数据。',
        matchesPlayed: '已赛场次',
        yellowCards: '黄牌',
        redCards: '红牌',
        minutes: '分钟',
        goalsPerMatch: '进球 / 场',
        draws: '平局',
        drawRate: '平局率',
        bttsRate: '双方进球率',
        over25Rate: '超过2.5球率',
        stadiums: '球场',
        usaVenues: '美国场馆',
        canadaVenues: '加拿大场馆',
        mexicoVenues: '墨西哥场馆',
        finalVenue: '决赛场馆',
        capacity: '容量',
        worldCupStadiums: '世界杯球场',
        noVenueData: '暂无场馆数据。',
        scheduled: '即将开始',
        liveStatus: "直播",
        paused: '暂停',
        fullTime: '全场结束',
        aet: '加时后',
        penalties: '点球',
        postponed: '延期',
        groupStage: '小组赛',
        round32: '32强',
        round16: '16强',
        quarterFinals: '四分之一决赛',
        semiFinals: '半决赛',
        thirdPlace: '季军赛',
        final: '决赛',
        tbc: '待定',
        unknown: '未知',
        pos: '排名',
        team: '球队',
        player: '球员',
        goals: '进球',
        assists: '助攻',
        language: '儀表板語言',
        controlCentre: '2026世界杯控制中心',
        overviewSubtitle: '一个集赛程、结果、小组、球员统计、场馆、纪录和淘汰赛追踪于一体的实时赛事仪表盘。',
        tournamentIntelligence: '赛事分析',
        goldenBootCentre: '金靴中心',
        leaderSpotlight: '领跑者聚焦',
        playersTracked: '追踪球员',
        totalAssists: '总助攻',
        totalYellowCards: '总黄牌',
        totalRedCards: '总红牌',
        upNext: '下一场',
        matchSpotlight: '焦点比赛',
        upcomingFixtures: '即将进行的比赛',
        latest: '最新',
        recentResults: '近期结果',
        playerWatch: '球员观察',
        fixturesSubtitle: '更清晰的世界杯比赛中心，包含比赛日分区、醒目的比分卡、旗帜、场馆详情和清楚的状态标签。',
        days: '天',
        versus: '对',
        supportersNav: '🙏 支持者',
        supportersThankYouTitle: '🙏 支持者与感谢',
        supportersIntro: '这个项目最初是个人的 Home Assistant 仪表盘，并因社区反馈、测试、想法和支持而不断成长。',
        supportersSpecialThanks: '特别感谢所有支持 World Cup 2026 集成开发的人。',
        supportersTitle: '🍺 支持者',
        latestSupporters: "⭐ 最新支持者",
        allSupporters: "🌍 所有支持者",
        supporterDefaultMessage: '感谢你支持开发。',
        anonymousSupporter: '匿名支持者',
        noSupporters: '还没有支持者。成为第一个请我喝啤酒并把名字列在这里的人。',
        wantNameAdded: '想把你的名字加到这里吗？',
        supportFutureUpdates: '支持未来更新、错误修复和新的世界杯功能。',
        supporterBeerMessage: '🍺 想让你的名字出现在支持者页面吗？通过 PayPal 请我喝杯啤酒，你的名字就可以加入 World Cup 2026 支持者名单，作为对开发支持的感谢。',
        donateBuyBeer: '🍺 捐赠 / 请我喝啤酒',
        enjoyingIntegration: '🍺 喜欢这个集成吗？',
        supportIntegration: '支持这个集成',
        source: "來源",
        totalSupporters: "支持者總數",
        countries: "國家",
        countriesSupporting: "支持國家",
        latestSupportDate: "最新支持日期",
        playedShort: "賽",
        winsShort: "勝",
        drawsShort: "和",
        lossesShort: "負",
        goalsForShort: "進",
        goalsAgainstShort: "失",
        goalDifferenceShort: "淨",
        pointsShort: "分",
        noResultsLoaded: "尚未載入結果。",
        finishedMatchesSubtitle: "已結束賽事與確認比分。",
        goldenBootAutoText: "當 football-data.org 發布世界盃射手資料後，自動金靴資料將會顯示。",
        realStadium: "實際球場",
        matchesHosted: "承辦賽事",
        communitySupport: "社群支持",
        supportersAroundWorld: "全球支持者",
        noLiveGames: "沒有直播賽事",
        noGamesToday: "今天沒有賽事",
        conceded: '失球',
      },

      th: {
        title: 'ฟุตบอลโลก FIFA 2026',
        subtitle: 'แอปทัวร์นาเมนต์สำหรับ Home Assistant',
        back: '← กลับ',
        updated: 'อัปเดตแล้ว',
        loading: 'กำลังโหลดฟุตบอลโลก 2026...',
        errorTitle: 'ฟุตบอลโลก 2026',
        errorText: 'ไม่สามารถโหลดข้อมูลแอปได้',
        overview: 'ภาพรวม',
        live: 'ศูนย์ถ่ายทอดสด',
        fixtures: 'โปรแกรมแข่ง',
        results: "ผลการแข่งขัน",
        groups: 'กลุ่ม',
        knockout: 'รอบน็อกเอาต์',
        players: 'รองเท้าทองคำ',
        records: 'สถิติ',
        stats: 'ศูนย์สถิติ',
        venues: 'สนาม',
        totalMatches: 'จำนวนแมตช์ทั้งหมด',
        loaded: 'โหลดแล้ว',
        played: 'แข่งแล้ว',
        remaining: 'คงเหลือ',
        liveNow: 'ถ่ายทอดสดตอนนี้',
        totalGoals: 'ประตูรวม',
        nextMatch: 'นัดถัดไป',
        tournamentStatus: 'สถานะทัวร์นาเมนต์',
        demoMode: 'โหมดสาธิต',
        on: 'เปิด',
        off: 'ปิด',
        lastUpdate: 'อัปเดตล่าสุด',
        ok: 'OK',
        failed: 'ล้มเหลว',
        progress: 'ความคืบหน้า',
        topScorer: 'ดาวซัลโว',
        notAvailable: 'ไม่พร้อมใช้งาน',
        noUpcomingMatch: 'ยังไม่มีแมตช์ถัดไป',
        noLiveMatches: 'ไม่มีแมตช์ถ่ายทอดสดตอนนี้',
        fixturesResults: "โปรแกรมและผลการแข่งขัน",
        noFixtures: 'ยังไม่มีโปรแกรมแข่ง',
        groupLabel: 'กลุ่ม',
        groupsAL: 'กลุ่ม A-L',
        noGroups: "ยังไม่มีตารางกลุ่มที่โหลด",
        noTeamsGroup: "ยังไม่มีทีมที่โหลดสำหรับกลุ่มนี้",
        goldenBoot: "การแข่งขันรองเท้าทองคำ",
        noPlayerStats: "ยังไม่มีสถิติผู้เล่นที่โหลด",
        knockoutBracket: 'สายรอบน็อกเอาต์',
        fixturesNotAvailable: "โปรแกรมแข่งยังไม่พร้อมใช้งาน",
        highestMatchGoals: "ประตูมากที่สุดในนัดเดียว",
        biggestMargin: "ส่วนต่างมากที่สุด",
        topTeamGoals: "ทีมที่ยิงประตูมากที่สุด",
        bestDefenceGA: "เกมรับดีที่สุด",
        highestScoringMatch: "นัดที่มีประตูมากที่สุด",
        biggestWin: "ชัยชนะขาดลอยที่สุด",
        topScoringTeam: "ทีมที่ทำประตูสูงสุด",
        bestDefence: "เกมรับดีที่สุด",
        noResult: "ยังไม่มีผลการแข่งขัน",
        noTeamGoalData: "ยังไม่มีข้อมูลประตูของทีม",
        noDefensiveData: "ยังไม่มีข้อมูลเกมรับ",
        matchesPlayed: 'แมตช์ที่แข่งแล้ว',
        yellowCards: 'ใบเหลือง',
        redCards: 'ใบแดง',
        minutes: 'นาที',
        goalsPerMatch: 'ประตู / นัด',
        draws: 'เสมอ',
        drawRate: "อัตราเสมอ",
        bttsRate: "อัตราทั้งสองทีมยิง",
        over25Rate: "อัตรามากกว่า 2.5",
        stadiums: 'สนาม',
        usaVenues: "สนามในสหรัฐฯ",
        canadaVenues: "สนามในแคนาดา",
        mexicoVenues: "สนามในเม็กซิโก",
        finalVenue: "สนามรอบชิงชนะเลิศ",
        capacity: 'ความจุ',
        worldCupStadiums: "สนามฟุตบอลโลก",
        noVenueData: "ไม่มีข้อมูลสนาม",
        scheduled: 'กำลังจะมาถึง',
        liveStatus: "สด",
        manualTimerNotice: 'คะแนนสดอัปเดตอัตโนมัติ เวลาประตูใช้ตัวจับเวลาการแข่งขันแบบแมนนวล และอาจต่างจากเวลาอย่างเป็นทางการไม่กี่นาที',
        paused: 'พัก',
        fullTime: 'จบเกม',
        aet: "หลังต่อเวลาพิเศษ",
        penalties: 'จุดโทษ',
        postponed: "เลื่อนการแข่งขัน",
        groupStage: 'รอบแบ่งกลุ่ม',
        round32: 'รอบ 32 ทีม',
        round16: 'รอบ 16 ทีม',
        quarterFinals: 'รอบก่อนรองชนะเลิศ',
        semiFinals: 'รอบรองชนะเลิศ',
        thirdPlace: 'ชิงอันดับสาม',
        final: 'รอบชิงชนะเลิศ',
        tbc: 'รอยืนยัน',
        unknown: 'ไม่ทราบ',
        pos: 'อันดับ',
        team: 'ทีม',
        player: 'ผู้เล่น',
        goals: 'ประตู',
        assists: 'แอสซิสต์',
        language: "ภาษาแดชบอร์ด",
        controlCentre: 'ศูนย์ควบคุมฟุตบอลโลก 2026',
        overviewSubtitle: "แดชบอร์ดการแข่งขันสดพร้อมโปรแกรม ผลการแข่งขัน กลุ่ม สถิติผู้เล่น สนาม สถิติสูงสุด และรอบน็อกเอาต์ในที่เดียว",
        tournamentIntelligence: "การวิเคราะห์ทัวร์นาเมนต์",
        goldenBootCentre: "ศูนย์รองเท้าทองคำ",
        leaderSpotlight: "ผู้นำเด่น",
        playersTracked: "ผู้เล่นที่ติดตาม",
        totalAssists: "แอสซิสต์ทั้งหมด",
        totalYellowCards: "ใบเหลืองทั้งหมด",
        totalRedCards: "ใบแดงทั้งหมด",
        upNext: "ถัดไป",
        matchSpotlight: "แมตช์เด่น",
        upcomingFixtures: "โปรแกรมถัดไป",
        latest: "ล่าสุด",
        recentResults: "ผลล่าสุด",
        playerWatch: "ติดตามผู้เล่น",
        fixturesSubtitle: "ศูนย์การแข่งขันที่ชัดเจนขึ้น พร้อมวันแข่ง การ์ดสกอร์ ธง รายละเอียดสนาม และป้ายสถานะที่อ่านง่าย",
        days: 'วัน',
        versus: 'พบ',
        supportersNav: "🙏 ผู้สนับสนุน",
        supportersThankYouTitle: "🙏 ผู้สนับสนุนและคำขอบคุณ",
        supportersIntro: "โปรเจกต์นี้เริ่มจากแดชบอร์ด Home Assistant ส่วนตัว และเติบโตด้วยคำแนะนำ การทดสอบ ไอเดีย และการสนับสนุนจากชุมชน",
        supportersSpecialThanks: "ขอขอบคุณเป็นพิเศษทุกคนที่สนับสนุนการพัฒนาอินทิเกรชัน World Cup 2026",
        supportersTitle: "🍺 ผู้สนับสนุน",
        latestSupporters: "⭐ ผู้สนับสนุนล่าสุด",
        allSupporters: "🌍 ผู้สนับสนุนทั้งหมด",
        supporterDefaultMessage: "ขอบคุณที่สนับสนุนการพัฒนา",
        anonymousSupporter: 'ผู้สนับสนุนนิรนาม',
        noSupporters: "ยังไม่มีผู้สนับสนุน มาเป็นคนแรกที่เลี้ยงเบียร์ฉันและให้ชื่อของคุณแสดงที่นี่",
        wantNameAdded: "ต้องการเพิ่มชื่อของคุณที่นี่ไหม?",
        supportFutureUpdates: "สนับสนุนการอัปเดต การแก้บั๊ก และฟีเจอร์ฟุตบอลโลกใหม่ ๆ ในอนาคต",
        supporterBeerMessage: "🍺 ต้องการให้ชื่อของคุณแสดงในหน้าผู้สนับสนุนไหม? เลี้ยงเบียร์ฉันผ่าน PayPal แล้วชื่อของคุณสามารถถูกเพิ่มในรายชื่อผู้สนับสนุน World Cup 2026 เพื่อขอบคุณสำหรับการสนับสนุนการพัฒนา",
        donateBuyBeer: "🍺 บริจาค / เลี้ยงเบียร์ฉัน",
        enjoyingIntegration: "🍺 ชอบอินทิเกรชันนี้ไหม?",
        supportIntegration: "สนับสนุนอินทิเกรชันนี้",
        source: "แหล่งข้อมูล",
        totalSupporters: "ผู้สนับสนุนทั้งหมด",
        countries: "ประเทศ",
        countriesSupporting: "ประเทศที่สนับสนุน",
        latestSupportDate: "วันที่สนับสนุนล่าสุด",
        playedShort: "แข่ง",
        winsShort: "ชนะ",
        drawsShort: "เสมอ",
        lossesShort: "แพ้",
        goalsForShort: "ได้",
        goalsAgainstShort: "เสีย",
        goalDifferenceShort: "ต่าง",
        pointsShort: "แต้ม",
        noResultsLoaded: "ยังไม่มีผลการแข่งขันที่โหลด",
        finishedMatchesSubtitle: "การแข่งขันที่จบแล้วและสกอร์ที่ยืนยันแล้ว",
        goldenBootAutoText: "ข้อมูลรองเท้าทองคำอัตโนมัติจะแสดงเมื่อ football-data.org เผยแพร่ข้อมูลผู้ทำประตูฟุตบอลโลก",
        realStadium: "สนามจริง",
        matchesHosted: "แมตช์ที่จัด",
        communitySupport: "การสนับสนุนจากชุมชน",
        supportersAroundWorld: "ผู้สนับสนุนทั่วโลก",
        noLiveGames: "ไม่มีการแข่งขันสด",
        noGamesToday: "วันนี้ไม่มีการแข่งขัน",
        conceded: 'เสียประตู',
      },

      vi: {
        title: "Giải vô địch bóng đá thế giới FIFA 2026",
        subtitle: 'Ứng dụng giải đấu cho Home Assistant',
        back: '← Quay lại',
        updated: 'Đã cập nhật',
        loading: 'Đang tải World Cup 2026...',
        errorTitle: "World Cup 2026",
        errorText: 'Không thể tải dữ liệu ứng dụng.',
        overview: 'Tổng quan',
        live: 'Trung tâm trực tiếp',
        fixtures: 'Lịch thi đấu',
        results: "Kết quả",
        groups: 'Bảng đấu',
        knockout: 'Vòng loại trực tiếp',
        players: 'Chiếc giày vàng',
        records: 'Kỷ lục',
        stats: 'Trung tâm thống kê',
        venues: 'Sân vận động',
        totalMatches: 'Tổng số trận',
        loaded: 'Đã tải',
        played: 'Đã đá',
        remaining: 'Còn lại',
        liveNow: 'Đang trực tiếp',
        totalGoals: 'Tổng bàn thắng',
        nextMatch: 'Trận tiếp theo',
        tournamentStatus: 'Trạng thái giải đấu',
        demoMode: 'Chế độ demo',
        on: 'Bật',
        off: 'Tắt',
        lastUpdate: 'Cập nhật cuối',
        ok: 'OK',
        failed: 'Thất bại',
        progress: 'Tiến độ',
        topScorer: 'Vua phá lưới',
        notAvailable: 'Không có sẵn',
        noUpcomingMatch: 'Chưa tải trận sắp tới.',
        noLiveMatches: 'Hiện không có trận trực tiếp.',
        fixturesResults: 'Lịch thi đấu & Kết quả',
        noFixtures: 'Chưa tải lịch thi đấu.',
        groupLabel: 'Bảng',
        groupsAL: 'Bảng A-L',
        noGroups: "Chưa tải bảng xếp hạng bảng đấu.",
        noTeamsGroup: "Chưa tải đội nào cho bảng này.",
        goldenBoot: 'Cuộc đua Chiếc giày vàng',
        noPlayerStats: "Chưa tải thống kê cầu thủ.",
        knockoutBracket: 'Nhánh loại trực tiếp',
        fixturesNotAvailable: "Lịch thi đấu chưa có sẵn",
        highestMatchGoals: "Trận có nhiều bàn nhất",
        biggestMargin: "Cách biệt lớn nhất",
        topTeamGoals: "Đội ghi nhiều bàn nhất",
        bestDefenceGA: "Hàng thủ tốt nhất",
        highestScoringMatch: "Trận có nhiều bàn nhất",
        biggestWin: "Chiến thắng lớn nhất",
        topScoringTeam: "Đội ghi bàn nhiều nhất",
        bestDefence: "Hàng thủ tốt nhất",
        noResult: "Chưa có kết quả.",
        noTeamGoalData: "Chưa có dữ liệu bàn thắng đội.",
        noDefensiveData: "Chưa có dữ liệu phòng ngự.",
        matchesPlayed: 'Số trận đã đá',
        yellowCards: 'Thẻ vàng',
        redCards: 'Thẻ đỏ',
        minutes: 'Phút',
        goalsPerMatch: 'Bàn / trận',
        draws: 'Hòa',
        drawRate: 'Tỷ lệ hòa',
        bttsRate: "Tỷ lệ hai đội cùng ghi bàn",
        over25Rate: "Tỷ lệ trên 2,5",
        stadiums: 'Sân vận động',
        usaVenues: "Sân vận động Hoa Kỳ",
        canadaVenues: "Sân vận động Canada",
        mexicoVenues: "Sân vận động Mexico",
        finalVenue: "Sân vận động chung kết",
        capacity: 'Sức chứa',
        worldCupStadiums: "Sân vận động World Cup",
        noVenueData: "Không có dữ liệu sân vận động.",
        scheduled: 'Sắp diễn ra',
        liveStatus: "Trực tiếp",
        manualTimerNotice: 'Tỉ số trực tiếp tự động cập nhật. Thời điểm ghi bàn dùng đồng hồ trận đấu thủ công và có thể lệch vài phút so với thời gian chính thức.',
        paused: 'Tạm dừng',
        fullTime: 'Hết giờ',
        aet: 'Sau hiệp phụ',
        penalties: 'Luân lưu',
        postponed: 'Hoãn',
        groupStage: 'Vòng bảng',
        round32: 'Vòng 32 đội',
        round16: 'Vòng 16 đội',
        quarterFinals: 'Tứ kết',
        semiFinals: 'Bán kết',
        thirdPlace: 'Tranh hạng ba',
        final: 'Chung kết',
        tbc: 'Chưa xác định',
        unknown: 'Không rõ',
        pos: 'Hạng',
        team: 'Đội',
        player: 'Cầu thủ',
        goals: 'Bàn thắng',
        assists: 'Kiến tạo',
        language: 'Ngôn ngữ bảng điều khiển',
        controlCentre: 'Trung tâm điều khiển World Cup 2026',
        overviewSubtitle: "Bảng điều khiển giải đấu trực tiếp với lịch thi đấu, kết quả, bảng đấu, thống kê cầu thủ, sân vận động, kỷ lục và vòng loại trực tiếp ở một nơi.",
        tournamentIntelligence: "Phân tích giải đấu",
        goldenBootCentre: "Trung tâm Chiếc giày vàng",
        leaderSpotlight: "Người dẫn đầu nổi bật",
        playersTracked: "Cầu thủ được theo dõi",
        totalAssists: "Tổng kiến tạo",
        totalYellowCards: "Tổng thẻ vàng",
        totalRedCards: "Tổng thẻ đỏ",
        upNext: "Tiếp theo",
        matchSpotlight: "Trận đấu nổi bật",
        upcomingFixtures: "Trận sắp tới",
        latest: "Mới nhất",
        recentResults: "Kết quả gần đây",
        playerWatch: "Theo dõi cầu thủ",
        fixturesSubtitle: "Trung tâm trận đấu rõ ràng hơn với ngày thi đấu, thẻ tỷ số, cờ, chi tiết sân vận động và trạng thái dễ đọc.",
        days: 'Ngày',
        versus: 'v',
        supportersNav: "🙏 Người ủng hộ",
        supportersThankYouTitle: "🙏 Người ủng hộ và lời cảm ơn",
        supportersIntro: "Dự án này bắt đầu như một bảng điều khiển Home Assistant cá nhân và phát triển nhờ phản hồi, thử nghiệm, ý tưởng và sự ủng hộ từ cộng đồng.",
        supportersSpecialThanks: "Xin cảm ơn đặc biệt tới mọi người đã ủng hộ phát triển tích hợp World Cup 2026.",
        supportersTitle: "🍺 Người ủng hộ",
        latestSupporters: "⭐ Người ủng hộ mới nhất",
        allSupporters: "🌍 Tất cả người ủng hộ",
        supporterDefaultMessage: "Cảm ơn bạn đã ủng hộ phát triển.",
        anonymousSupporter: 'Người ủng hộ ẩn danh',
        noSupporters: "Chưa có người ủng hộ nào. Hãy là người đầu tiên mời tôi một cốc bia và để tên bạn xuất hiện ở đây.",
        wantNameAdded: "Bạn muốn thêm tên của mình ở đây?",
        supportFutureUpdates: "Ủng hộ các bản cập nhật, sửa lỗi và tính năng World Cup mới trong tương lai.",
        supporterBeerMessage: "🍺 Muốn tên bạn xuất hiện trên trang Người ủng hộ? Mời tôi một cốc bia qua PayPal và tên bạn có thể được thêm vào danh sách người ủng hộ World Cup 2026 như lời cảm ơn.",
        donateBuyBeer: "🍺 Quyên góp / Mời tôi một cốc bia",
        enjoyingIntegration: "🍺 Bạn thích tích hợp này chứ?",
        supportIntegration: "Ủng hộ tích hợp này",
        source: "Nguồn",
        totalSupporters: "Tổng người ủng hộ",
        countries: "Quốc gia",
        countriesSupporting: "Quốc gia ủng hộ",
        latestSupportDate: "Ngày ủng hộ gần nhất",
        playedShort: "Tr",
        winsShort: "T",
        drawsShort: "H",
        lossesShort: "B",
        goalsForShort: "BT",
        goalsAgainstShort: "BB",
        goalDifferenceShort: "HS",
        pointsShort: "Đ",
        noResultsLoaded: "Chưa tải kết quả nào.",
        finishedMatchesSubtitle: "Các trận đã kết thúc và tỷ số đã xác nhận.",
        goldenBootAutoText: "Dữ liệu Chiếc giày vàng tự động sẽ xuất hiện khi football-data.org công bố dữ liệu ghi bàn World Cup.",
        realStadium: "Sân vận động thực tế",
        matchesHosted: "Trận đã tổ chức",
        communitySupport: "Ủng hộ cộng đồng",
        supportersAroundWorld: "Người ủng hộ trên toàn thế giới",
        noLiveGames: "Không có trận trực tiếp",
        noGamesToday: "Hôm nay không có trận đấu",
        conceded: 'thủng lưới',
      },

      id: {
        title: 'Piala Dunia FIFA 2026',
        subtitle: 'Aplikasi turnamen untuk Home Assistant',
        back: '← Kembali',
        updated: 'Diperbarui',
        loading: 'Memuat Piala Dunia 2026...',
        errorTitle: 'Piala Dunia 2026',
        errorText: 'Tidak dapat memuat data aplikasi.',
        overview: 'Ringkasan',
        live: 'Pusat Live',
        fixtures: 'Jadwal',
        results: "Hasil",
        groups: 'Grup',
        knockout: 'Babak Gugur',
        players: 'Sepatu Emas',
        records: 'Rekor',
        stats: 'Pusat Statistik',
        venues: 'Venue',
        totalMatches: 'Total Pertandingan',
        loaded: 'Dimuat',
        played: 'Dimainkan',
        remaining: 'Tersisa',
        liveNow: 'Live Sekarang',
        totalGoals: 'Total Gol',
        nextMatch: 'Pertandingan Berikutnya',
        tournamentStatus: 'Status Turnamen',
        demoMode: 'Mode demo',
        on: 'Aktif',
        off: 'Nonaktif',
        lastUpdate: 'Pembaruan terakhir',
        ok: 'OK',
        failed: 'Gagal',
        progress: 'Progres',
        topScorer: 'Pencetak gol terbanyak',
        notAvailable: 'Tidak tersedia',
        noUpcomingMatch: 'Belum ada pertandingan berikutnya.',
        noLiveMatches: 'Tidak ada pertandingan live saat ini.',
        fixturesResults: 'Jadwal & Hasil',
        noFixtures: 'Belum ada jadwal dimuat.',
        groupLabel: 'Grup',
        groupsAL: 'Grup A-L',
        noGroups: "Klasemen grup belum dimuat.",
        noTeamsGroup: "Belum ada tim yang dimuat untuk grup ini.",
        goldenBoot: 'Perburuan Sepatu Emas',
        noPlayerStats: "Statistik pemain belum dimuat.",
        knockoutBracket: 'Bagan Babak Gugur',
        fixturesNotAvailable: "Jadwal belum tersedia",
        highestMatchGoals: "Gol Terbanyak dalam Satu Laga",
        biggestMargin: "Selisih Terbesar",
        topTeamGoals: "Gol Tim Terbanyak",
        bestDefenceGA: "Pertahanan Terbaik",
        highestScoringMatch: "Laga dengan Gol Terbanyak",
        biggestWin: "Kemenangan Terbesar",
        topScoringTeam: "Tim Tersubur",
        bestDefence: "Pertahanan Terbaik",
        noResult: "Belum ada hasil.",
        noTeamGoalData: "Belum ada data gol tim.",
        noDefensiveData: "Belum ada data pertahanan.",
        matchesPlayed: 'Pertandingan Dimainkan',
        yellowCards: 'Kartu Kuning',
        redCards: 'Kartu Merah',
        minutes: 'Menit',
        goalsPerMatch: 'Gol / Pertandingan',
        draws: 'Seri',
        drawRate: 'Persentase Seri',
        bttsRate: "Tingkat Kedua Tim Mencetak Gol",
        over25Rate: "Tingkat Lebih dari 2,5",
        stadiums: 'Stadion',
        usaVenues: "Stadion AS",
        canadaVenues: "Stadion Kanada",
        mexicoVenues: "Stadion Meksiko",
        finalVenue: "Stadion Final",
        capacity: 'Kapasitas',
        worldCupStadiums: "Stadion Piala Dunia",
        noVenueData: "Tidak ada data stadion.",
        scheduled: 'Akan Datang',
        liveStatus: "Live",
        manualTimerNotice: 'Skor langsung diperbarui otomatis. Waktu gol memakai jam pertandingan manual dan dapat berbeda beberapa menit dari waktu resmi.',
        paused: 'Jeda',
        fullTime: 'Purna Waktu',
        aet: 'Setelah Perpanjangan Waktu',
        penalties: 'Adu Penalti',
        postponed: 'Ditunda',
        groupStage: 'Fase Grup',
        round32: 'Babak 32 Besar',
        round16: 'Babak 16 Besar',
        quarterFinals: 'Perempat Final',
        semiFinals: 'Semi Final',
        thirdPlace: 'Perebutan Tempat Ketiga',
        final: 'Final',
        tbc: 'TBD',
        unknown: 'Tidak diketahui',
        pos: 'Pos',
        team: 'Tim',
        player: 'Pemain',
        goals: 'Gol',
        assists: 'Assist',
        language: 'Bahasa Dashboard',
        controlCentre: 'Pusat Kontrol Piala Dunia 2026',
        overviewSubtitle: "Dasbor turnamen langsung dengan jadwal, hasil, grup, statistik pemain, stadion, rekor, dan fase gugur dalam satu tempat.",
        tournamentIntelligence: "Analisis Turnamen",
        goldenBootCentre: "Pusat Sepatu Emas",
        leaderSpotlight: "Sorotan Pemimpin",
        playersTracked: "Pemain Dipantau",
        totalAssists: "Total Assist",
        totalYellowCards: "Total Kartu Kuning",
        totalRedCards: "Total Kartu Merah",
        upNext: "Berikutnya",
        matchSpotlight: "Sorotan Pertandingan",
        upcomingFixtures: "Jadwal Mendatang",
        latest: "Terbaru",
        recentResults: "Hasil Terbaru",
        playerWatch: "Pantauan Pemain",
        fixturesSubtitle: "Pusat pertandingan yang lebih jelas dengan bagian hari pertandingan, kartu skor, bendera, detail stadion, dan lencana status yang mudah dibaca.",
        days: 'Hari',
        versus: 'v',
        supportersNav: '🙏 Pendukung',
        supportersThankYouTitle: "🙏 Pendukung dan Terima Kasih",
        supportersIntro: "Proyek ini dimulai sebagai dasbor Home Assistant pribadi dan berkembang berkat masukan, pengujian, ide, dan dukungan komunitas.",
        supportersSpecialThanks: "Terima kasih khusus kepada semua yang telah mendukung pengembangan integrasi World Cup 2026.",
        supportersTitle: '🍺 Pendukung',
        latestSupporters: "⭐ Pendukung Terbaru",
        allSupporters: "🌍 Semua Pendukung",
        supporterDefaultMessage: "Terima kasih telah mendukung pengembangan.",
        anonymousSupporter: 'Pendukung anonim',
        noSupporters: "Belum ada pendukung yang ditambahkan. Jadilah yang pertama membelikan saya bir dan tampilkan nama Anda di sini.",
        wantNameAdded: "Ingin nama Anda ditambahkan di sini?",
        supportFutureUpdates: "Dukung pembaruan mendatang, perbaikan bug, dan fitur Piala Dunia baru.",
        supporterBeerMessage: "🍺 Ingin nama Anda tampil di halaman Pendukung? Belikan saya bir melalui PayPal dan nama Anda dapat ditambahkan ke daftar Pendukung World Cup 2026 sebagai ucapan terima kasih atas dukungan pengembangan.",
        donateBuyBeer: "🍺 Donasi / Belikan Saya Bir",
        enjoyingIntegration: "🍺 Menikmati integrasi ini?",
        supportIntegration: "Dukung integrasi ini",
        source: "Sumber",
        totalSupporters: "Total Pendukung",
        countries: "Negara",
        countriesSupporting: "Negara Pendukung",
        latestSupportDate: "Tanggal Dukungan Terbaru",
        playedShort: "M",
        winsShort: "M",
        drawsShort: "S",
        lossesShort: "K",
        goalsForShort: "GM",
        goalsAgainstShort: "GK",
        goalDifferenceShort: "SG",
        pointsShort: "Poin",
        noResultsLoaded: "Belum ada hasil yang dimuat.",
        finishedMatchesSubtitle: "Pertandingan selesai dan skor terkonfirmasi.",
        goldenBootAutoText: "Data Sepatu Emas otomatis akan muncul setelah football-data.org menerbitkan data pencetak gol Piala Dunia.",
        realStadium: "Stadion sebenarnya",
        matchesHosted: "Pertandingan yang digelar",
        communitySupport: "Dukungan Komunitas",
        supportersAroundWorld: "Pendukung di Seluruh Dunia",
        noLiveGames: "Tidak ada laga live",
        noGamesToday: "Tidak ada pertandingan hari ini",
        conceded: 'kebobolan',
      },

      ko: {
        title: "FIFA 월드컵 2026",
        subtitle: "Home Assistant 전용 대회 앱",
        back: "← 뒤로",
        updated: "업데이트",
        loading: "월드컵 2026 로딩 중...",
        errorTitle: "월드컵 2026",
        errorText: "앱 데이터를 불러올 수 없습니다.",
        overview: "개요",
        live: "라이브 센터",
        fixtures: "경기",
        groups: "조별 순위",
        knockout: "토너먼트",
        players: "골든 부트",
        records: "기록",
        stats: "통계",
        venues: "경기장",
        totalMatches: "총 경기",
        loaded: "로드됨",
        played: "진행 완료",
        remaining: "남은 경기",
        liveNow: "현재 라이브",
        totalGoals: "총 득점",
        nextMatch: "다음 경기",
        tournamentStatus: "대회 상태",
        demoMode: "데모 모드",
        on: "켜짐",
        off: "꺼짐",
        lastUpdate: "마지막 업데이트",
        ok: "OK",
        failed: "실패",
        progress: "진행률",
        topScorer: "득점 선두",
        notAvailable: "사용 불가",
        noUpcomingMatch: "예정된 경기가 없습니다.",
        noLiveMatches: "현재 라이브 경기가 없습니다.",
        fixturesResults: "경기 및 결과",
        noFixtures: "경기가 아직 로드되지 않았습니다.",
        groupLabel: "조",
        groupsAL: "A-L 조",
        noGroups: "조별 순위가 없습니다.",
        noTeamsGroup: "팀이 로드되지 않았습니다.",
        goldenBoot: "골든 부트 경쟁",
        noPlayerStats: "선수 통계가 없습니다.",
        knockoutBracket: "토너먼트 대진표",
        fixturesNotAvailable: "경기 미정",
        highestMatchGoals: "최다 득점 경기",
        biggestMargin: "최대 점수 차",
        topTeamGoals: "최다 득점 팀",
        bestDefenceGA: "최고 수비",
        highestScoringMatch: "최다 득점 경기",
        biggestWin: "최대 승리",
        topScoringTeam: "최다 득점 팀",
        bestDefence: "최고 수비",
        noResult: "결과가 없습니다.",
        noTeamGoalData: "득점 데이터가 없습니다.",
        noDefensiveData: "수비 데이터가 없습니다.",
        matchesPlayed: "진행된 경기",
        yellowCards: "옐로카드",
        redCards: "레드카드",
        minutes: "출전 시간",
        goalsPerMatch: "득점 / 경기",
        draws: "무승부",
        drawRate: "무승부 비율",
        bttsRate: "양팀 득점",
        over25Rate: "2.5 이상",
        stadiums: "경기장",
        usaVenues: "미국 경기장",
        canadaVenues: "캐나다 경기장",
        mexicoVenues: "멕시코 경기장",
        finalVenue: "결승 경기장",
        capacity: "수용 인원",
        worldCupStadiums: "월드컵 경기장",
        noVenueData: "경기장 데이터가 없습니다.",
        scheduled: "예정",
        liveStatus: "라이브",
        manualTimerNotice: '라이브 점수는 자동으로 업데이트됩니다. 득점 시간은 수동 경기 시계를 사용하므로 공식 시간과 몇 분 차이 날 수 있습니다.',
        paused: "일시 중지",
        fullTime: "경기 종료",
        aet: "연장 종료",
        penalties: "승부차기",
        postponed: "연기",
        groupStage: "조별리그",
        round32: "32강",
        round16: "16강",
        quarterFinals: "8강",
        semiFinals: "4강",
        thirdPlace: "3위 결정전",
        final: "결승",
        tbc: "미정",
        unknown: "알 수 없음",
        pos: "순위",
        team: "팀",
        player: "선수",
        goals: "골",
        assists: "도움",
        language: "대시보드 언어",
        controlCentre: '월드컵 2026 컨트롤 센터',
        overviewSubtitle: '경기, 결과, 조별 순위, 선수 통계, 경기장, 기록, 토너먼트를 한곳에서 보는 라이브 대회 대시보드입니다.',
        tournamentIntelligence: '대회 분석',
        goldenBootCentre: '골든 부트 센터',
        leaderSpotlight: '선두 선수',
        playersTracked: '추적 선수',
        totalAssists: '총 도움',
        totalYellowCards: '총 옐로카드',
        totalRedCards: '총 레드카드',
        upNext: '다음',
        matchSpotlight: '주목 경기',
        upcomingFixtures: '예정 경기',
        latest: '최신',
        recentResults: '최근 결과',
        playerWatch: '선수 확인',
        fixturesSubtitle: '경기일 섹션, 점수 카드, 국기, 경기장 정보, 명확한 상태 배지를 갖춘 더 깔끔한 경기 센터입니다.',
        days: '일',
        versus: '대',
        supportersNav: '🙏 후원자',
        supportersThankYouTitle: '🙏 후원자 및 감사',
        supportersIntro: '이 프로젝트는 개인 Home Assistant 대시보드로 시작했으며 커뮤니티의 피드백, 테스트, 아이디어와 지원 덕분에 성장했습니다.',
        supportersSpecialThanks: 'World Cup 2026 통합 개발을 지원해 주신 모든 분들께 특별히 감사드립니다.',
        supportersTitle: '🍺 후원자',
        latestSupporters: "⭐ 최신 후원자",
        allSupporters: "🌍 모든 후원자",
        supporterDefaultMessage: '개발을 지원해 주셔서 감사합니다.',
        anonymousSupporter: '익명 후원자',
        noSupporters: '아직 후원자가 없습니다. 첫 번째로 맥주 한 잔을 후원하고 여기에 이름을 올려보세요.',
        wantNameAdded: '여기에 이름을 추가하고 싶으신가요?',
        supportFutureUpdates: '향후 업데이트, 버그 수정 및 새로운 월드컵 기능을 지원해 주세요.',
        supporterBeerMessage: '🍺 후원자 페이지에 이름을 올리고 싶으신가요? PayPal로 맥주 한 잔을 후원하면 개발 지원에 대한 감사의 의미로 World Cup 2026 후원자 목록에 이름을 추가할 수 있습니다.',
        donateBuyBeer: '🍺 기부 / 맥주 사주기',
        enjoyingIntegration: '🍺 이 통합을 즐기고 계신가요?',
        supportIntegration: '이 통합 지원',
        results: "결과",
        source: "출처",
        totalSupporters: "총 후원자",
        countries: "국가",
        countriesSupporting: "후원 국가",
        latestSupportDate: "최근 후원일",
        playedShort: "경기",
        winsShort: "승",
        drawsShort: "무",
        lossesShort: "패",
        goalsForShort: "득",
        goalsAgainstShort: "실",
        goalDifferenceShort: "차",
        pointsShort: "승점",
        noResultsLoaded: "아직 결과가 로드되지 않았습니다.",
        finishedMatchesSubtitle: "종료된 경기와 확정된 점수입니다.",
        goldenBootAutoText: "football-data.org에서 월드컵 득점자 데이터를 공개하면 자동 골든 부트 데이터가 표시됩니다.",
        realStadium: "실제 경기장",
        matchesHosted: "개최 경기",
        communitySupport: "커뮤니티 지원",
        supportersAroundWorld: "전 세계 후원자",
        noLiveGames: "라이브 경기 없음",
        noGamesToday: "오늘 경기 없음",
        conceded: "실점",
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

      sw: {
        title: "Kombe la Dunia FIFA 2026",
        subtitle: "Programu maalum ya mashindano kwa Home Assistant",
        back: "← Rudi",
        updated: "Imesasishwa",
        loading: "Inapakia Kombe la Dunia 2026...",
        errorTitle: "Kombe la Dunia 2026",
        errorText: "Haikuweza kupakia data ya programu.",
        overview: "Muhtasari",
        live: "Kituo cha Moja kwa Moja",
        fixtures: "Ratiba",
        results: "Matokeo",
        groups: "Makundi",
        knockout: "Mtoano",
        players: "Kiatu cha Dhahabu",
        records: "Rekodi",
        stats: "Kituo cha Takwimu",
        venues: "Viwanja",
        totalMatches: "Jumla ya Mechi",
        loaded: "Zilizopakiwa",
        played: "Zilizochezwa",
        remaining: "Zilizosalia",
        liveNow: "Moja kwa Moja Sasa",
        totalGoals: "Jumla ya Mabao",
        nextMatch: "Mechi Inayofuata",
        tournamentStatus: "Hali ya Mashindano",
        demoMode: "Hali ya onyesho",
        on: "Imewashwa",
        off: "Imezimwa",
        lastUpdate: "Sasisho la mwisho",
        ok: "Sawa",
        failed: "Imeshindikana",
        progress: "Maendeleo",
        topScorer: "Mfungaji bora",
        notAvailable: "Haipatikani",
        noUpcomingMatch: "Hakuna mechi ijayo iliyopakiwa.",
        noLiveMatches: "Hakuna mechi za moja kwa moja sasa.",
        fixturesResults: "Ratiba na Matokeo",
        noFixtures: "Hakuna ratiba iliyopakiwa bado.",
        groupLabel: "Kundi",
        groupsAL: "Makundi A-L",
        noGroups: "Hakuna msimamo wa makundi uliopakiwa bado.",
        noTeamsGroup: "Hakuna timu zilizopakiwa kwa kundi hili bado.",
        goldenBoot: "Mbio za Kiatu cha Dhahabu",
        noPlayerStats: "Hakuna takwimu za wachezaji zilizopakiwa bado.",
        knockoutBracket: "Jedwali la Mtoano",
        fixturesNotAvailable: "Ratiba haipatikani bado",
        highestMatchGoals: "Mabao Mengi Zaidi Katika Mechi",
        biggestMargin: "Tofauti Kubwa Zaidi",
        topTeamGoals: "Timu Yenye Mabao Mengi",
        bestDefenceGA: "Ulinzi Bora GA",
        highestScoringMatch: "Mechi Yenye Mabao Mengi",
        biggestWin: "Ushindi Mkubwa Zaidi",
        topScoringTeam: "Timu Yenye Kufunga Zaidi",
        bestDefence: "Ulinzi Bora",
        noResult: "Hakuna matokeo bado.",
        noTeamGoalData: "Hakuna data ya mabao ya timu bado.",
        noDefensiveData: "Hakuna data ya ulinzi bado.",
        matchesPlayed: "Mechi Zilizochezwa",
        yellowCards: "Kadi za Njano",
        redCards: "Kadi Nyekundu",
        minutes: "Dakika",
        goalsPerMatch: "Mabao / Mechi",
        draws: "Sare",
        drawRate: "Kiwango cha Sare",
        bttsRate: "Kiwango cha Timu Zote Kufunga",
        over25Rate: "Zaidi ya 2.5",
        stadiums: "Viwanja",
        usaVenues: "Viwanja vya Marekani",
        canadaVenues: "Viwanja vya Kanada",
        mexicoVenues: "Viwanja vya Meksiko",
        finalVenue: "Uwanja wa Fainali",
        capacity: "Uwezo",
        worldCupStadiums: "Viwanja vya Kombe la Dunia",
        noVenueData: "Hakuna data ya viwanja.",
        scheduled: "Imepangwa",
        liveStatus: "Moja kwa moja",
        manualTimerNotice: 'Matokeo ya moja kwa moja husasishwa kiotomatiki. Muda wa mabao hutumia saa ya mechi ya mwongozo na unaweza kutofautiana na muda rasmi kwa dakika chache.',
        paused: "Imesitishwa",
        fullTime: "Muda Kamili",
        aet: "Baada ya Muda wa Ziada",
        penalties: "Penalti",
        postponed: "Imeahirishwa",
        groupStage: "Hatua ya Makundi",
        round32: "Raundi ya 32",
        round16: "Raundi ya 16",
        quarterFinals: "Robo Fainali",
        semiFinals: "Nusu Fainali",
        thirdPlace: "Nafasi ya Tatu",
        final: "Fainali",
        tbc: "Itathibitishwa",
        unknown: "Haijulikani",
        pos: "Nafasi",
        team: "Timu",
        player: "Mchezaji",
        goals: "Mabao",
        assists: "Asisti",
        language: "Lugha ya Dashibodi",
        controlCentre: "Kituo cha Udhibiti Kombe la Dunia 2026",
        overviewSubtitle: "Dashibodi ya moja kwa moja ya mashindano yenye ratiba, matokeo, makundi, takwimu za wachezaji, viwanja, rekodi na mtoano sehemu moja.",
        tournamentIntelligence: "Uchambuzi wa Mashindano",
        goldenBootCentre: "Kituo cha Kiatu cha Dhahabu",
        leaderSpotlight: "Kiongozi Aliyeangaziwa",
        playersTracked: "Wachezaji Wanaofuatiliwa",
        totalAssists: "Jumla ya Asisti",
        totalYellowCards: "Jumla ya Kadi za Njano",
        totalRedCards: "Jumla ya Kadi Nyekundu",
        upNext: "Inayofuata",
        matchSpotlight: "Mechi Iliyoangaziwa",
        upcomingFixtures: "Mechi Zijazo",
        latest: "Ya hivi karibuni",
        recentResults: "Matokeo ya Karibuni",
        playerWatch: "Ufuatiliaji wa Wachezaji",
        fixturesSubtitle: "Kituo safi cha mechi chenye sehemu za siku za mechi, kadi za alama, bendera, maelezo ya viwanja na alama wazi za hali.",
        days: "Siku",
        versus: "dhidi ya",
        supportersNav: "🙏 Wasaidizi",
        supportersThankYouTitle: "🙏 Wasaidizi na Shukrani",
        supportersIntro: "Mradi huu ulianza kama dashibodi binafsi ya Home Assistant na umekua kutokana na maoni, majaribio, mawazo na msaada wa jamii.",
        supportersSpecialThanks: "Shukrani maalum kwa wote waliounga mkono maendeleo ya ujumuishaji wa World Cup 2026.",
        supportersTitle: "🍺 Wasaidizi",
        latestSupporters: "⭐ Wasaidizi wa Hivi Karibuni",
        allSupporters: "🌍 Wasaidizi Wote",
        supporterDefaultMessage: "Asante kwa kusaidia maendeleo.",
        anonymousSupporter: "Msaidizi Asiyejulikana",
        noSupporters: "Hakuna wasaidizi walioongezwa bado. Kuwa wa kwanza kuninunulia bia na jina lako lionekane hapa.",
        wantNameAdded: "Unataka jina lako liongezwe hapa?",
        supportFutureUpdates: "Saidia masasisho yajayo, marekebisho ya hitilafu na vipengele vipya vya Kombe la Dunia.",
        supporterBeerMessage: "🍺 Unataka jina lako lionekane kwenye ukurasa wa Wasaidizi? Ninunulie bia kupitia PayPal na jina lako linaweza kuongezwa kwenye orodha ya Wasaidizi wa World Cup 2026 kama shukrani kwa kusaidia maendeleo.",
        donateBuyBeer: "🍺 Changia / Ninunulie Bia",
        enjoyingIntegration: "🍺 Unafurahia ujumuishaji huu?",
        supportIntegration: "Saidia ujumuishaji huu",
        source: "Chanzo",
        totalSupporters: "Jumla ya Wasaidizi",
        countries: "Nchi",
        countriesSupporting: "Nchi Zinazounga Mkono",
        latestSupportDate: "Tarehe ya Hivi Karibuni ya Msaada",
        playedShort: "MC",
        winsShort: "SH",
        drawsShort: "SR",
        lossesShort: "P",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "Pts",
        noResultsLoaded: "Hakuna matokeo yaliyopakiwa bado.",
        finishedMatchesSubtitle: "Mechi zilizomalizika na matokeo yaliyothibitishwa.",
        goldenBootAutoText: "Data ya moja kwa moja ya Kiatu cha Dhahabu itaonekana football-data.org itakapochapisha data ya wafungaji wa Kombe la Dunia.",
        realStadium: "Uwanja Halisi",
        matchesHosted: "Mechi Zilizochezeshwa",
        communitySupport: "Msaada wa Jamii",
        supportersAroundWorld: "Wasaidizi Duniani Kote",
        noLiveGames: "Hakuna mechi za moja kwa moja",
        noGamesToday: "Hakuna mechi leo",
        conceded: "yaliyofungwa dhidi",
      },

      am: {
        title: "የFIFA ዓለም ዋንጫ 2026",
        subtitle: "ለHome Assistant የተዘጋጀ የውድድር መተግበሪያ",
        back: "← ተመለስ",
        updated: "ተዘምኗል",
        loading: "የዓለም ዋንጫ 2026 በመጫን ላይ...",
        errorTitle: "የዓለም ዋንጫ 2026",
        errorText: "የመተግበሪያ ውሂብ መጫን አልተቻለም።",
        overview: "አጠቃላይ እይታ",
        live: "ቀጥታ ማዕከል",
        fixtures: "ጨዋታዎች",
        results: "ውጤቶች",
        groups: "ቡድኖች",
        knockout: "የማስወገድ ዙር",
        players: "ወርቃማ ጫማ",
        records: "መዝገቦች",
        stats: "የስታቲስቲክስ ማዕከል",
        venues: "ስታዲየሞች",
        totalMatches: "ጠቅላላ ጨዋታዎች",
        loaded: "ተጭኗል",
        played: "ተጫውቷል",
        remaining: "የቀሩ",
        liveNow: "አሁን ቀጥታ",
        totalGoals: "ጠቅላላ ጎሎች",
        nextMatch: "ቀጣይ ጨዋታ",
        tournamentStatus: "የውድድር ሁኔታ",
        demoMode: "የማሳያ ሁነታ",
        on: "በርቷል",
        off: "ጠፍቷል",
        lastUpdate: "የመጨረሻ ዝመና",
        ok: "እሺ",
        failed: "አልተሳካም",
        progress: "እድገት",
        topScorer: "ከፍተኛ ጎል አስቆጣሪ",
        notAvailable: "አይገኝም",
        noUpcomingMatch: "ቀጣይ ጨዋታ አልተጫነም።",
        noLiveMatches: "አሁን ቀጥታ ጨዋታዎች የሉም።",
        fixturesResults: "ጨዋታዎች እና ውጤቶች",
        noFixtures: "ጨዋታዎች ገና አልተጫኑም።",
        groupLabel: "ቡድን",
        groupsAL: "ቡድኖች A-L",
        noGroups: "የቡድን ሰንጠረዦች ገና አልተጫኑም።",
        noTeamsGroup: "በዚህ ቡድን ምንም ቡድኖች ገና አልተጫኑም።",
        goldenBoot: "የወርቃማ ጫማ ውድድር",
        noPlayerStats: "የተጫዋቾች ስታቲስቲክስ ገና አልተጫነም።",
        knockoutBracket: "የማስወገድ ሰንጠረዥ",
        fixturesNotAvailable: "ጨዋታዎች ገና አይገኙም",
        highestMatchGoals: "በጨዋታ ብዙ ጎሎች",
        biggestMargin: "ትልቁ ልዩነት",
        topTeamGoals: "ብዙ ጎል ያስቆጠረ ቡድን",
        bestDefenceGA: "ምርጥ መከላከያ GA",
        highestScoringMatch: "ብዙ ጎል የተቆጠረበት ጨዋታ",
        biggestWin: "ትልቁ ድል",
        topScoringTeam: "ከፍተኛ ጎል ያስቆጠረ ቡድን",
        bestDefence: "ምርጥ መከላከያ",
        noResult: "ገና ውጤት የለም።",
        noTeamGoalData: "የቡድን ጎል ውሂብ ገና የለም።",
        noDefensiveData: "የመከላከያ ውሂብ ገና የለም።",
        matchesPlayed: "የተጫወቱ ጨዋታዎች",
        yellowCards: "ቢጫ ካርዶች",
        redCards: "ቀይ ካርዶች",
        minutes: "ደቂቃዎች",
        goalsPerMatch: "ጎሎች / ጨዋታ",
        draws: "አቻ",
        drawRate: "የአቻ መጠን",
        bttsRate: "ሁለቱም ቡድኖች ያስቆጥራሉ",
        over25Rate: "ከ2.5 በላይ",
        stadiums: "ስታዲየሞች",
        usaVenues: "የአሜሪካ ስታዲየሞች",
        canadaVenues: "የካናዳ ስታዲየሞች",
        mexicoVenues: "የሜክሲኮ ስታዲየሞች",
        finalVenue: "የፍጻሜ ስታዲየም",
        capacity: "አቅም",
        worldCupStadiums: "የዓለም ዋንጫ ስታዲየሞች",
        noVenueData: "የስታዲየም ውሂብ የለም።",
        scheduled: "ተይዟል",
        liveStatus: "ቀጥታ",
        manualTimerNotice: 'የቀጥታ ውጤቶች በራስ-ሰር ይዘምናሉ። የጎል ጊዜዎች የእጅ ሰዓት ይጠቀማሉ እና ከኦፊሴላዊ ጊዜዎች በጥቂት ደቂቃዎች ሊለዩ ይችላሉ።',
        paused: "ቆሟል",
        fullTime: "ሙሉ ሰዓት",
        aet: "ከተጨማሪ ሰዓት በኋላ",
        penalties: "ፔናልቲዎች",
        postponed: "ተራዝሟል",
        groupStage: "የቡድን ደረጃ",
        round32: "የ32 ዙር",
        round16: "የ16 ዙር",
        quarterFinals: "ሩብ ፍጻሜ",
        semiFinals: "ግማሽ ፍጻሜ",
        thirdPlace: "ሶስተኛ ደረጃ",
        final: "ፍጻሜ",
        tbc: "ይረጋገጣል",
        unknown: "ያልታወቀ",
        pos: "ደረጃ",
        team: "ቡድን",
        player: "ተጫዋች",
        goals: "ጎሎች",
        assists: "አሲስቶች",
        language: "የዳሽቦርድ ቋንቋ",
        controlCentre: "የዓለም ዋንጫ 2026 መቆጣጠሪያ ማዕከል",
        overviewSubtitle: "ጨዋታዎች፣ ውጤቶች፣ ቡድኖች፣ የተጫዋቾች ስታቲስቲክስ፣ ስታዲየሞች፣ መዝገቦች እና የማስወገድ ዙር በአንድ ቦታ ያለው ቀጥታ የውድድር ዳሽቦርድ።",
        tournamentIntelligence: "የውድድር ትንተና",
        goldenBootCentre: "የወርቃማ ጫማ ማዕከል",
        leaderSpotlight: "መሪ በትኩረት",
        playersTracked: "የሚከታተሉ ተጫዋቾች",
        totalAssists: "ጠቅላላ አሲስቶች",
        totalYellowCards: "ጠቅላላ ቢጫ ካርዶች",
        totalRedCards: "ጠቅላላ ቀይ ካርዶች",
        upNext: "ቀጣይ",
        matchSpotlight: "ጨዋታ በትኩረት",
        upcomingFixtures: "መጪ ጨዋታዎች",
        latest: "የቅርብ ጊዜ",
        recentResults: "የቅርብ ውጤቶች",
        playerWatch: "የተጫዋቾች ክትትል",
        fixturesSubtitle: "የጨዋታ ቀን ክፍሎች፣ የውጤት ካርዶች፣ ባንዲራዎች፣ የስታዲየም ዝርዝሮች እና ግልጽ የሁኔታ ምልክቶች ያሉት የተሻለ የጨዋታ ማዕከል።",
        days: "ቀናት",
        versus: "በተቃራኒ",
        supportersNav: "🙏 ደጋፊዎች",
        supportersThankYouTitle: "🙏 ደጋፊዎች እና ምስጋና",
        supportersIntro: "ይህ ፕሮጀክት እንደ የግል Home Assistant ዳሽቦርድ ጀመረ እና በማህበረሰቡ አስተያየት፣ ሙከራ፣ ሀሳቦች እና ድጋፍ አደገ።",
        supportersSpecialThanks: "የWorld Cup 2026 ኢንተግሬሽን ልማትን የደገፉ ሁሉ ልዩ ምስጋና።",
        supportersTitle: "🍺 ደጋፊዎች",
        latestSupporters: "⭐ የቅርብ ጊዜ ደጋፊዎች",
        allSupporters: "🌍 ሁሉም ደጋፊዎች",
        supporterDefaultMessage: "ልማቱን ስለደገፉ እናመሰግናለን።",
        anonymousSupporter: "ስም የሌለው ደጋፊ",
        noSupporters: "ገና ደጋፊዎች አልተጨመሩም። መጀመሪያ ቢራ ግዙልኝ እና ስምዎ እዚህ ይታያል።",
        wantNameAdded: "ስምዎ እዚህ እንዲጨመር ይፈልጋሉ?",
        supportFutureUpdates: "የወደፊት ዝመናዎችን፣ የስህተት ማስተካከያዎችን እና አዲስ የዓለም ዋንጫ ባህሪያትን ይደግፉ።",
        supporterBeerMessage: "🍺 ስምዎ በደጋፊዎች ገጽ ላይ እንዲታይ ይፈልጋሉ? በPayPal ቢራ ግዙልኝ እና ስምዎ ለልማት ድጋፍ እንደ ምስጋና በWorld Cup 2026 ደጋፊዎች ዝርዝር ላይ ሊጨመር ይችላል።",
        donateBuyBeer: "🍺 ይለግሱ / ቢራ ግዙልኝ",
        enjoyingIntegration: "🍺 ይህን ኢንተግሬሽን እየተደሰቱ ነው?",
        supportIntegration: "ይህን ኢንተግሬሽን ይደግፉ",
        source: "ምንጭ",
        totalSupporters: "ጠቅላላ ደጋፊዎች",
        countries: "አገሮች",
        countriesSupporting: "የሚደግፉ አገሮች",
        latestSupportDate: "የቅርብ ጊዜ የድጋፍ ቀን",
        playedShort: "ተጫ",
        winsShort: "አሸ",
        drawsShort: "አቻ",
        lossesShort: "ተሸ",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "ነጥብ",
        noResultsLoaded: "ገና ምንም ውጤቶች አልተጫኑም።",
        finishedMatchesSubtitle: "የተጠናቀቁ ጨዋታዎች እና የተረጋገጡ ውጤቶች።",
        goldenBootAutoText: "football-data.org የዓለም ዋንጫ የጎል አስቆጣሪዎች ውሂብ ሲያትም የወርቃማ ጫማ ራስ-ሰር ውሂብ ይታያል።",
        realStadium: "እውነተኛ ስታዲየም",
        matchesHosted: "የተካሄዱ ጨዋታዎች",
        communitySupport: "የማህበረሰብ ድጋፍ",
        supportersAroundWorld: "በዓለም ዙሪያ ደጋፊዎች",
        noLiveGames: "ቀጥታ ጨዋታዎች የሉም",
        noGamesToday: "ዛሬ ጨዋታዎች የሉም",
        conceded: "የተቀበለ",
      },

      af: {
        title: "FIFA Wêreldbeker 2026",
        subtitle: "Toegewyde toernooi-app vir Home Assistant",
        back: "← Terug",
        updated: "Opgedateer",
        loading: "Laai Wêreldbeker 2026...",
        errorTitle: "Wêreldbeker 2026",
        errorText: "Kon nie appdata laai nie.",
        overview: "Oorsig",
        live: "Regstreekse Sentrum",
        fixtures: "Wedstryde",
        results: "Uitslae",
        groups: "Groepe",
        knockout: "Uitklop",
        players: "Goue Skoen",
        records: "Rekords",
        stats: "Statistieksentrum",
        venues: "Stadions",
        totalMatches: "Totale Wedstryde",
        loaded: "Gelaai",
        played: "Gespeel",
        remaining: "Oorblywend",
        liveNow: "Nou Regstreeks",
        totalGoals: "Totale Doele",
        nextMatch: "Volgende Wedstryd",
        tournamentStatus: "Toernooistatus",
        demoMode: "Demomodus",
        on: "Aan",
        off: "Af",
        lastUpdate: "Laaste opdatering",
        ok: "OK",
        failed: "Misluk",
        progress: "Vordering",
        topScorer: "Topdoelskieter",
        notAvailable: "Nie beskikbaar nie",
        noUpcomingMatch: "Geen komende wedstryd gelaai nie.",
        noLiveMatches: "Geen regstreekse wedstryde nou nie.",
        fixturesResults: "Wedstryde en Uitslae",
        noFixtures: "Geen wedstryde nog gelaai nie.",
        groupLabel: "Groep",
        groupsAL: "Groepe A-L",
        noGroups: "Geen groepstande nog gelaai nie.",
        noTeamsGroup: "Geen spanne nog vir hierdie groep gelaai nie.",
        goldenBoot: "Goue Skoen Wedloop",
        noPlayerStats: "Geen spelerstatistieke nog gelaai nie.",
        knockoutBracket: "Uitklopskema",
        fixturesNotAvailable: "Wedstryde nog nie beskikbaar nie",
        highestMatchGoals: "Meeste Doele in Wedstryd",
        biggestMargin: "Grootste Marge",
        topTeamGoals: "Meeste Spandoele",
        bestDefenceGA: "Beste Verdediging GA",
        highestScoringMatch: "Wedstryd met Meeste Doele",
        biggestWin: "Grootste Oorwinning",
        topScoringTeam: "Span met Meeste Doele",
        bestDefence: "Beste Verdediging",
        noResult: "Nog geen uitslag nie.",
        noTeamGoalData: "Nog geen spandoeldata nie.",
        noDefensiveData: "Nog geen verdedigingsdata nie.",
        matchesPlayed: "Wedstryde Gespeel",
        yellowCards: "Geel Kaarte",
        redCards: "Rooi Kaarte",
        minutes: "Minute",
        goalsPerMatch: "Doele / Wedstryd",
        draws: "Gelykop",
        drawRate: "Gelykopkoers",
        bttsRate: "Albei Span Teken Aan",
        over25Rate: "Meer as 2.5",
        stadiums: "Stadions",
        usaVenues: "VSA Stadions",
        canadaVenues: "Kanada Stadions",
        mexicoVenues: "Meksiko Stadions",
        finalVenue: "Finale Stadion",
        capacity: "Kapasiteit",
        worldCupStadiums: "Wêreldbekerstadions",
        noVenueData: "Geen stadiondata beskikbaar nie.",
        scheduled: "Geskeduleer",
        liveStatus: "Regstreeks",
        manualTimerNotice: 'Regstreekse tellings werk outomaties by. Doeltye gebruik die handmatige wedstrydklok en kan met ’n paar minute van amptelike tye verskil.',
        paused: "Onderbreek",
        fullTime: "Voltyd",
        aet: "Na Ekstra Tyd",
        penalties: "Strafskoppe",
        postponed: "Uitgestel",
        groupStage: "Groepfase",
        round32: "Ronde van 32",
        round16: "Ronde van 16",
        quarterFinals: "Kwarteindronde",
        semiFinals: "Halfeindronde",
        thirdPlace: "Derde Plek",
        final: "Finale",
        tbc: "Nog te bevestig",
        unknown: "Onbekend",
        pos: "Pos",
        team: "Span",
        player: "Speler",
        goals: "Doele",
        assists: "Hulpdoele",
        language: "Dashboardtaal",
        controlCentre: "Wêreldbeker 2026 Beheersentrum",
        overviewSubtitle: "Regstreekse toernooidashboard met wedstryde, uitslae, groepe, spelerstatistieke, stadions, rekords en uitklopspoor op een plek.",
        tournamentIntelligence: "Toernooi-insig",
        goldenBootCentre: "Goue Skoen Sentrum",
        leaderSpotlight: "Leier in Fokus",
        playersTracked: "Spelers Gevolg",
        totalAssists: "Totale Hulpdoele",
        totalYellowCards: "Totale Geel Kaarte",
        totalRedCards: "Totale Rooi Kaarte",
        upNext: "Volgende",
        matchSpotlight: "Wedstryd in Fokus",
        upcomingFixtures: "Komende Wedstryde",
        latest: "Nuutste",
        recentResults: "Onlangse Uitslae",
        playerWatch: "Spelerwag",
        fixturesSubtitle: "n Duideliker wedstrydsentrum met wedstryddagafdelings, tellingkaarte, vlae, stadionbesonderhede en duideliker statuskentekens.",
        days: "Dae",
        versus: "teen",
        supportersNav: "🙏 Ondersteuners",
        supportersThankYouTitle: "🙏 Ondersteuners en Dankie",
        supportersIntro: "Hierdie projek het as ’n persoonlike Home Assistant-dashboard begin en het gegroei danksy terugvoer, toetsing, idees en ondersteuning van die gemeenskap.",
        supportersSpecialThanks: "Spesiale dank aan almal wat die ontwikkeling van die World Cup 2026-integrasie ondersteun het.",
        supportersTitle: "🍺 Ondersteuners",
        latestSupporters: "⭐ Nuutste Ondersteuners",
        allSupporters: "🌍 Alle Ondersteuners",
        supporterDefaultMessage: "Dankie dat jy ontwikkeling ondersteun.",
        anonymousSupporter: "Anonieme Ondersteuner",
        noSupporters: "Geen ondersteuners nog bygevoeg nie. Wees die eerste om vir my ’n bier te koop en jou naam hier te kry.",
        wantNameAdded: "Wil jy jou naam hier byvoeg?",
        supportFutureUpdates: "Ondersteun toekomstige opdaterings, foutregstellings en nuwe Wêreldbekerfunksies.",
        supporterBeerMessage: "🍺 Wil jy hê jou naam moet op die Ondersteunersblad verskyn? Koop vir my ’n bier via PayPal en jou naam kan by die World Cup 2026-ondersteunerslys gevoeg word as dankie vir jou ondersteuning.",
        donateBuyBeer: "🍺 Skenk / Koop vir my ’n Bier",
        enjoyingIntegration: "🍺 Geniet jy hierdie integrasie?",
        supportIntegration: "Ondersteun hierdie integrasie",
        source: "Bron",
        totalSupporters: "Totale Ondersteuners",
        countries: "Lande",
        countriesSupporting: "Lande wat Ondersteun",
        latestSupportDate: "Nuutste Ondersteuningsdatum",
        playedShort: "G",
        winsShort: "W",
        drawsShort: "D",
        lossesShort: "V",
        goalsForShort: "DV",
        goalsAgainstShort: "DT",
        goalDifferenceShort: "DS",
        pointsShort: "Pte",
        noResultsLoaded: "Geen uitslae nog gelaai nie.",
        finishedMatchesSubtitle: "Voltooide wedstryde en bevestigde uitslae.",
        goldenBootAutoText: "Outomatiese Goue Skoen-data sal verskyn wanneer football-data.org Wêreldbeker-doelskieterdata publiseer.",
        realStadium: "Regte Stadion",
        matchesHosted: "Wedstryde Aangebied",
        communitySupport: "Gemeenskapsondersteuning",
        supportersAroundWorld: "Ondersteuners Regoor die Wêreld",
        noLiveGames: "Geen regstreekse wedstryde",
        noGamesToday: "Geen wedstryde vandag",
        conceded: "afgestaan",
      },

      zu: {
        title: "Indebe Yomhlaba ye-FIFA 2026",
        subtitle: "Uhlelo lomqhudelwano lwe-Home Assistant",
        back: "← Emuva",
        updated: "Kubuyekeziwe",
        loading: "Kulayishwa iNdebe Yomhlaba 2026...",
        errorTitle: "Indebe Yomhlaba 2026",
        errorText: "Ayikwazanga ukulayisha idatha yohlelo.",
        overview: "Ukubuka konke",
        live: "Isikhungo Esibukhoma",
        fixtures: "Imidlalo",
        results: "Imiphumela",
        groups: "Amaqembu",
        knockout: "Ukukhiphana",
        players: "Isicathulo Segolide",
        records: "Amarekhodi",
        stats: "Isikhungo Sezibalo",
        venues: "Izinkundla",
        totalMatches: "Inani Lemidlalo",
        loaded: "Kulayishiwe",
        played: "Kudlaliwe",
        remaining: "Okusele",
        liveNow: "Bukhoma Manje",
        totalGoals: "Inani Lamagoli",
        nextMatch: "Umdlalo Olandelayo",
        tournamentStatus: "Isimo Somqhudelwano",
        demoMode: "Imodi yokubonisa",
        on: "Kuvuliwe",
        off: "Kuvaliwe",
        lastUpdate: "Ukubuyekezwa kokugcina",
        ok: "OK",
        failed: "Kwehlulekile",
        progress: "Inqubekelaphambili",
        topScorer: "Oshaye amagoli amaningi",
        notAvailable: "Akutholakali",
        noUpcomingMatch: "Awukho umdlalo ozayo olayishiwe.",
        noLiveMatches: "Ayikho imidlalo ebukhoma manje.",
        fixturesResults: "Imidlalo Nemiphumela",
        noFixtures: "Ayikho imidlalo elayishiwe okwamanje.",
        groupLabel: "Iqembu",
        groupsAL: "Amaqembu A-L",
        noGroups: "Azikho izilinganiso zamaqembu ezilayishiwe okwamanje.",
        noTeamsGroup: "Awekho amaqembu alayishiwe kuleli qembu okwamanje.",
        goldenBoot: "Umjaho Wesicathulo Segolide",
        noPlayerStats: "Azikho izibalo zabadlali ezilayishiwe okwamanje.",
        knockoutBracket: "Ithebula Lokukhiphana",
        fixturesNotAvailable: "Imidlalo ayikatholakali",
        highestMatchGoals: "Amagoli Amaningi Emdlalweni",
        biggestMargin: "Umehluko Omkhulu",
        topTeamGoals: "Iqembu Elinamagoli Amaningi",
        bestDefenceGA: "Ukuvikela Okuhle GA",
        highestScoringMatch: "Umdlalo Onamagoli Amaningi",
        biggestWin: "Ukunqoba Okukhulu",
        topScoringTeam: "Iqembu Elishaya Kakhulu",
        bestDefence: "Ukuvikela Okuhle",
        noResult: "Awukho umphumela okwamanje.",
        noTeamGoalData: "Ayikho idatha yamagoli eqembu okwamanje.",
        noDefensiveData: "Ayikho idatha yokuvikela okwamanje.",
        matchesPlayed: "Imidlalo Edlaliwe",
        yellowCards: "Amakhadi Aphuzi",
        redCards: "Amakhadi Abomvu",
        minutes: "Imizuzu",
        goalsPerMatch: "Amagoli / Umdlalo",
        draws: "Imidlalo Elingene",
        drawRate: "Izinga Lokulingana",
        bttsRate: "Womabili Amaqembu Ayashaya",
        over25Rate: "Ngaphezu kuka-2.5",
        stadiums: "Izinkundla",
        usaVenues: "Izinkundla zase-USA",
        canadaVenues: "Izinkundla zaseCanada",
        mexicoVenues: "Izinkundla zaseMexico",
        finalVenue: "Inkundla Yamanqamu",
        capacity: "Umthamo",
        worldCupStadiums: "Izinkundla zeNdebe Yomhlaba",
        noVenueData: "Ayikho idatha yenkundla.",
        scheduled: "Kuhleliwe",
        liveStatus: "Bukhoma",
        manualTimerNotice: 'Amasikolo abukhoma avuselelwa ngokuzenzakalela. Izikhathi zamagoli zisebenzisa iwashi lomdlalo elenziwa ngesandla futhi zingahluka ngemizuzu embalwa ezikhathini ezisemthethweni.',
        paused: "Kumiswe isikhashana",
        fullTime: "Isikhathi Siphelile",
        aet: "Ngemuva Kwesikhathi Esengeziwe",
        penalties: "Amaphenalthi",
        postponed: "Kuhlehlisiwe",
        groupStage: "Isigaba Samaqembu",
        round32: "Umjikelezo wama-32",
        round16: "Umjikelezo wama-16",
        quarterFinals: "Ama-Quarter Final",
        semiFinals: "Ama-Semi Final",
        thirdPlace: "Indawo Yesithathu",
        final: "Amanqamu",
        tbc: "Kuzoqinisekiswa",
        unknown: "Akwaziwa",
        pos: "Indawo",
        team: "Iqembu",
        player: "Umdlali",
        goals: "Amagoli",
        assists: "Ama-assist",
        language: "Ulimi Lwedashibhodi",
        controlCentre: "Isikhungo Sokulawula iNdebe Yomhlaba 2026",
        overviewSubtitle: "Idashibhodi ebukhoma yomqhudelwano enemidlalo, imiphumela, amaqembu, izibalo zabadlali, izinkundla, amarekhodi nokukhiphana endaweni eyodwa.",
        tournamentIntelligence: "Ukuhlaziywa Komqhudelwano",
        goldenBootCentre: "Isikhungo Sesicathulo Segolide",
        leaderSpotlight: "Umholi Obonakalayo",
        playersTracked: "Abadlali Abalandelwayo",
        totalAssists: "Inani Lama-assist",
        totalYellowCards: "Inani Lamakhadi Aphuzi",
        totalRedCards: "Inani Lamakhadi Abomvu",
        upNext: "Okulandelayo",
        matchSpotlight: "Umdlalo Ovelele",
        upcomingFixtures: "Imidlalo Ezayo",
        latest: "Okwakamuva",
        recentResults: "Imiphumela Yakamuva",
        playerWatch: "Ukubuka Abadlali",
        fixturesSubtitle: "Isikhungo semidlalo esicacile esinezigaba zosuku lomdlalo, amakhadi esikolo, amafulegi, imininingwane yezinkundla nezimpawu zesimo ezicacile.",
        days: "Izinsuku",
        versus: "vs",
        supportersNav: "🙏 Abasekeli",
        supportersThankYouTitle: "🙏 Abasekeli Nokubonga",
        supportersIntro: "Le phrojekthi yaqala njengedashibhodi yomuntu siqu ye-Home Assistant futhi ikhule ngenxa yemibono, ukuhlolwa, amacebo nokwesekwa komphakathi.",
        supportersSpecialThanks: "Sibonga kakhulu wonke umuntu osekele ukuthuthukiswa kwe-World Cup 2026 integration.",
        supportersTitle: "🍺 Abasekeli",
        latestSupporters: "⭐ Abasekeli Bakamuva",
        allSupporters: "🌍 Bonke Abasekeli",
        supporterDefaultMessage: "Siyabonga ngokweseka ukuthuthukiswa.",
        anonymousSupporter: "Umsekeli Ongaziwa",
        noSupporters: "Akekho umsekeli ongeziwe okwamanje. Yiba ngowokuqala ukungithengela ubhiya futhi igama lakho livele lapha.",
        wantNameAdded: "Ufuna igama lakho lengezwe lapha?",
        supportFutureUpdates: "Sekela izibuyekezo zesikhathi esizayo, ukulungiswa kwamaphutha nezici ezintsha zeNdebe Yomhlaba.",
        supporterBeerMessage: "🍺 Ufuna igama lakho livele ekhasini Labasekeli? Ngithengele ubhiya nge-PayPal futhi igama lakho lingangezwa ohlwini Labasekeli be-World Cup 2026 njengokubonga.",
        donateBuyBeer: "🍺 Nikela / Ngithengele Ubhiya",
        enjoyingIntegration: "🍺 Uyayijabulela le integration?",
        supportIntegration: "Sekela le integration",
        source: "Umthombo",
        totalSupporters: "Inani Labasekeli",
        countries: "Amazwe",
        countriesSupporting: "Amazwe Asekelayo",
        latestSupportDate: "Usuku Lokweseka Lwakamuva",
        playedShort: "D",
        winsShort: "W",
        drawsShort: "L",
        lossesShort: "H",
        goalsForShort: "GF",
        goalsAgainstShort: "GA",
        goalDifferenceShort: "GD",
        pointsShort: "Amaph",
        noResultsLoaded: "Ayikho imiphumela elayishiwe okwamanje.",
        finishedMatchesSubtitle: "Imidlalo ephelile nemiphumela eqinisekisiwe.",
        goldenBootAutoText: "Idatha ezenzakalelayo yeSicathulo Segolide izovela lapho football-data.org ishicilela idatha yabashayimagoli beNdebe Yomhlaba.",
        realStadium: "Inkundla Yangempela",
        matchesHosted: "Imidlalo Ebisingathiwe",
        communitySupport: "Ukwesekwa Komphakathi",
        supportersAroundWorld: "Abasekeli Emhlabeni Wonke",
        noLiveGames: "Ayikho imidlalo ebukhoma",
        noGamesToday: "Ayikho imidlalo namuhla",
        conceded: "avunyelwe",
      },

      ha: {
        title: "Kofin Duniya na FIFA 2026",
        subtitle: "Manhajar gasa ta musamman don Home Assistant",
        back: "← Koma",
        updated: "An sabunta",
        loading: "Ana loda Kofin Duniya 2026...",
        errorTitle: "Kofin Duniya 2026",
        errorText: "Ba a iya loda bayanan manhaja ba.",
        overview: "Takaitawa",
        live: "Cibiyar Kai Tsaye",
        fixtures: "Jadawalin Wasanni",
        results: "Sakamako",
        groups: "Rukuni",
        knockout: "Fitarwa",
        players: "Takalmin Zinariya",
        records: "Rikodi",
        stats: "Cibiyar Kididdiga",
        venues: "Filayen Wasa",
        totalMatches: "Jimillar Wasanni",
        loaded: "An Loda",
        played: "An Buga",
        remaining: "Sauran",
        liveNow: "Kai Tsaye Yanzu",
        totalGoals: "Jimillar Kwallaye",
        nextMatch: "Wasa na Gaba",
        tournamentStatus: "Matsayin Gasa",
        demoMode: "Yanayin gwaji",
        on: "A kunne",
        off: "A kashe",
        lastUpdate: "Sabuntawa ta ƙarshe",
        ok: "OK",
        failed: "Ya gaza",
        progress: "Ci gaba",
        topScorer: "Mafi yawan zura kwallo",
        notAvailable: "Babu",
        noUpcomingMatch: "Babu wasa mai zuwa da aka loda.",
        noLiveMatches: "Babu wasanni kai tsaye yanzu.",
        fixturesResults: "Jadawali da Sakamako",
        noFixtures: "Babu jadawali da aka loda tukuna.",
        groupLabel: "Rukuni",
        groupsAL: "Rukuni A-L",
        noGroups: "Babu matsayi na rukuni da aka loda tukuna.",
        noTeamsGroup: "Babu ƙungiyoyi da aka loda a wannan rukuni tukuna.",
        goldenBoot: "Gasar Takalmin Zinariya",
        noPlayerStats: "Babu kididdigar ‘yan wasa da aka loda tukuna.",
        knockoutBracket: "Tsarin Fitarwa",
        fixturesNotAvailable: "Jadawali bai samu ba tukuna",
        highestMatchGoals: "Mafi Yawan Kwallaye a Wasa",
        biggestMargin: "Babban Bambanci",
        topTeamGoals: "Ƙungiya Mai Kwallaye Mafi Yawa",
        bestDefenceGA: "Mafi Kyawun Tsaro GA",
        highestScoringMatch: "Wasa Mafi Kwallaye",
        biggestWin: "Babbar Nasara",
        topScoringTeam: "Ƙungiya Mafi Zura Kwallo",
        bestDefence: "Mafi Kyawun Tsaro",
        noResult: "Babu sakamako tukuna.",
        noTeamGoalData: "Babu bayanan kwallayen ƙungiya tukuna.",
        noDefensiveData: "Babu bayanan tsaro tukuna.",
        matchesPlayed: "Wasannin da Aka Buga",
        yellowCards: "Katunan Rawaya",
        redCards: "Katunan Ja",
        minutes: "Mintuna",
        goalsPerMatch: "Kwallaye / Wasa",
        draws: "Canjaras",
        drawRate: "Kason Canjaras",
        bttsRate: "Duka Ƙungiyoyi Sun Zura",
        over25Rate: "Sama da 2.5",
        stadiums: "Filayen Wasa",
        usaVenues: "Filayen Amurka",
        canadaVenues: "Filayen Kanada",
        mexicoVenues: "Filayen Meksiko",
        finalVenue: "Filin Karshe",
        capacity: "Iyawa",
        worldCupStadiums: "Filayen Kofin Duniya",
        noVenueData: "Babu bayanan filin wasa.",
        scheduled: "An tsara",
        liveStatus: "Kai tsaye",
        manualTimerNotice: 'Sakamakon kai tsaye suna sabuntawa ta atomatik. Lokutan kwallaye suna amfani da agogon wasa na hannu kuma na iya bambanta da lokacin hukuma da ’yan mintuna.',
        paused: "An dakata",
        fullTime: "Lokaci ya cika",
        aet: "Bayan karin lokaci",
        penalties: "Fenareti",
        postponed: "An dage",
        groupStage: "Matakin Rukuni",
        round32: "Zagaye na 32",
        round16: "Zagaye na 16",
        quarterFinals: "Kwata Fainal",
        semiFinals: "Semi Fainal",
        thirdPlace: "Matsayi na Uku",
        final: "Fainal",
        tbc: "Za a tabbatar",
        unknown: "Ba a sani ba",
        pos: "Matsayi",
        team: "Ƙungiya",
        player: "Dan wasa",
        goals: "Kwallaye",
        assists: "Taimako",
        language: "Harshen Dashibodi",
        controlCentre: "Cibiyar Gudanarwa Kofin Duniya 2026",
        overviewSubtitle: "Dashibodi kai tsaye na gasa tare da jadawali, sakamako, rukuni, kididdigar ‘yan wasa, filaye, rikodi da fitarwa a wuri guda.",
        tournamentIntelligence: "Binciken Gasa",
        goldenBootCentre: "Cibiyar Takalmin Zinariya",
        leaderSpotlight: "Jagora a Haske",
        playersTracked: "‘Yan Wasa da ake Bi",
        totalAssists: "Jimillar Taimako",
        totalYellowCards: "Jimillar Katunan Rawaya",
        totalRedCards: "Jimillar Katunan Ja",
        upNext: "Na gaba",
        matchSpotlight: "Wasa a Haske",
        upcomingFixtures: "Wasanni Masu Zuwa",
        latest: "Na baya-bayan nan",
        recentResults: "Sakamakon Kwanan Nan",
        playerWatch: "Sa Ido kan ‘Yan Wasa",
        fixturesSubtitle: "Cibiyar wasa mai tsabta tare da sassan ranakun wasa, katunan maki, tutoci, bayanan filin wasa da alamomin matsayi masu bayyana.",
        days: "Kwanaki",
        versus: "da",
        supportersNav: "🙏 Masu Tallafi",
        supportersThankYouTitle: "🙏 Masu Tallafi da Godiya",
        supportersIntro: "Wannan aikin ya fara ne a matsayin dashibodi na Home Assistant na kaina kuma ya girma saboda ra’ayoyi, gwaji, shawarwari da tallafin al’umma.",
        supportersSpecialThanks: "Godiya ta musamman ga duk waɗanda suka tallafi ci gaban haɗin World Cup 2026.",
        supportersTitle: "🍺 Masu Tallafi",
        latestSupporters: "⭐ Sabbin Masu Tallafi",
        allSupporters: "🌍 Duk Masu Tallafi",
        supporterDefaultMessage: "Na gode da tallafawa ci gaba.",
        anonymousSupporter: "Mai Tallafi Ba a Sani ba",
        noSupporters: "Babu masu tallafi tukuna. Ka zama na farko da zai saya mini giya kuma a nuna sunanka a nan.",
        wantNameAdded: "Kana son a ƙara sunanka a nan?",
        supportFutureUpdates: "Tallafa sabuntawa na gaba, gyaran kurakurai da sabbin fasalolin Kofin Duniya.",
        supporterBeerMessage: "🍺 Kana son sunanka ya bayyana a shafin Masu Tallafi? Saya mini giya ta PayPal kuma za a iya ƙara sunanka cikin jerin Masu Tallafin World Cup 2026 a matsayin godiya.",
        donateBuyBeer: "🍺 Ba da Gudummawa / Saya Mini Giya",
        enjoyingIntegration: "🍺 Kana jin daɗin wannan haɗin?",
        supportIntegration: "Tallafi wannan haɗin",
        source: "Tushe",
        totalSupporters: "Jimillar Masu Tallafi",
        countries: "Kasashe",
        countriesSupporting: "Kasashen da ke Tallafi",
        latestSupportDate: "Ranar Tallafi ta Karshe",
        playedShort: "W",
        winsShort: "N",
        drawsShort: "C",
        lossesShort: "R",
        goalsForShort: "KF",
        goalsAgainstShort: "KA",
        goalDifferenceShort: "BB",
        pointsShort: "Mak",
        noResultsLoaded: "Babu sakamako da aka loda tukuna.",
        finishedMatchesSubtitle: "Wasannin da aka kammala da sakamakon da aka tabbatar.",
        goldenBootAutoText: "Bayanan Takalmin Zinariya na atomatik za su bayyana idan football-data.org ya wallafa bayanan masu zura kwallo na Kofin Duniya.",
        realStadium: "Filin Wasa na Gaskiya",
        matchesHosted: "Wasannin da Aka Dauki Nauyi",
        communitySupport: "Tallafin Al’umma",
        supportersAroundWorld: "Masu Tallafi a Duniya",
        noLiveGames: "Babu wasanni kai tsaye",
        noGamesToday: "Babu wasa yau",
        conceded: "an ci su",
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
    return all[this._language]?.[key] || all.en[key] || key;
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

    // Refresh all dashboard data once per minute.
    this._refreshInterval = setInterval(() => {
      this.loadAll();
    }, 60 * 1000);

    this._countdownInterval = setInterval(() => {
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
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }

    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
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



  async loadPublicGoalEvents() {
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/world_cup_2026_goal_events.json?t=" + Date.now(),
      "/local/worldcup/world_cup_2026_goal_events.json?t=" + Date.now(),
      "/local/world_cup_2026_goal_events.json?t=" + Date.now(),
      "/world_cup_2026_frontend/data/world_cup_2026_goal_events.json?t=" + Date.now(),
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
        if (data && typeof data === "object" && !Array.isArray(data)) return data;
      } catch (err) {
        // Try the next goal-events path.
      }
    }

    return {};
  }


  async loadPublicGithubMatches() {
    const urls = [
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/matches.json?v=2?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/worldcup/matches.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/www/worldcup/matches.json?t=" + Date.now(),
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
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
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/worldcup/world_cup_2026_results.json?t=" + Date.now(),
      "https://raw.githubusercontent.com/Adya84/ha-world-cup-2026/main/world_cup_2026_results.json?t=" + Date.now(),
      "/local/worldcup/world_cup_2026_results.json?t=" + Date.now(),
      "/local/world_cup_2026_results.json?t=" + Date.now(),
      "/world_cup_2026_frontend/data/world_cup_2026_results.json?t=" + Date.now(),
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
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

  mergeGithubMatchData(localMatches, publicMatches) {
    const local = Array.isArray(localMatches) ? localMatches : [];
    const pub = Array.isArray(publicMatches) ? publicMatches : [];
    if (!pub.length) return local;

    const publicByKey = new Map();
    pub.forEach((match) => {
      const key = this.publicMatchKey(match);
      if (key) publicByKey.set(key, match);
    });

    const mergedKeys = new Set();
    const merged = local.map((match) => {
      const publicMatch = publicByKey.get(this.publicMatchKey(match));
      if (!publicMatch) return match;
      mergedKeys.add(this.publicMatchKey(publicMatch));

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
        referees: Array.isArray(publicMatch.referees) && publicMatch.referees.length ? publicMatch.referees : match.referees,
        referee: publicMatch.referee || match.referee,
        attendance: publicMatch.attendance ?? match.attendance,
        publicGithubSynced: true,
      };
    });

    pub.forEach((match) => {
      const key = this.publicMatchKey(match);
      if (key && !mergedKeys.has(key)) merged.push({ ...match, publicGithubSynced: true });
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

    const add = (match) => {
      if (!match) return;
      const key = this.publicMatchKey(match) || this.matchStorageId(match) || JSON.stringify([
        match.id,
        match.matchId,
        match.matchNumber,
        match.utcDate,
        this.fixtureTeamKey(this.getHomeTeam(match)),
        this.fixtureTeamKey(this.getAwayTeam(match)),
      ]);
      if (seen.has(key)) return;
      seen.add(key);
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

    return list.map((match) => {
      if (!match) return match;

      const matchId = match.id ?? match.matchId ?? match.matchNumber;
      const extra = matchId !== null && matchId !== undefined ? store[String(matchId)] : null;

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

      return {
        ...match,
        status: extra.status || match.status,
        homeScore: extra.homeScore ?? match.homeScore,
        awayScore: extra.awayScore ?? match.awayScore,
        home_score: extra.homeScore ?? extra.home_score ?? match.home_score,
        away_score: extra.awayScore ?? extra.away_score ?? match.away_score,
        minute: extra.minute ?? match.minute,
        manualClock: extra.manualClock || match.manualClock,
        fallbackClock: extra.fallbackClock ?? extra.clock_seconds ?? match.fallbackClock,
        fallbackClockText: extra.fallbackClockText || match.fallbackClockText,
        manualClockText: extra.manualClockText || match.manualClockText,
        displayMinute: extra.displayMinute || match.displayMinute,
        clockSeconds: extra.clockSeconds ?? extra.clock_seconds ?? match.clockSeconds,
        goalEvents: goalEvents.length ? goalEvents : (Array.isArray(match.goalEvents) ? match.goalEvents : []),
        events: rawEvents.length ? rawEvents : (goalEvents.length ? goalEvents : (Array.isArray(match.events) ? match.events : [])),
        cardEvents: cardEvents.length ? cardEvents : (Array.isArray(match.cardEvents) ? match.cardEvents : []),
        substitutionEvents: substitutionEvents.length ? substitutionEvents : (Array.isArray(match.substitutionEvents) ? match.substitutionEvents : []),
        referees: referees.length ? referees : (Array.isArray(match.referees) ? match.referees : []),
        referee: extra.referee || match.referee,
        apiFootballFixtureId: extra.apiFootballFixtureId || match.apiFootballFixtureId,
        publicGoalEventsSynced: true,
      };
    });
  }

  async loadAll() {
    try {
      // MASTER MODE: this panel must read tournament data from the Home Assistant
      // backend only. The backend is the only place that should talk to your
      // football-data.org API and then export JSON for public/GitHub viewers.
      // Do not let GitHub/public JSON override this live panel, otherwise your
      // own dashboard can end up showing stale public data instead of your API pull.
      this._data.overview = await this.callApi("world_cup_2026/get_overview");

      const apiLive = await this.callApi("world_cup_2026/get_live_matches");
      const apiFixtures = this.completeOfficialFixtures(await this.callApi("world_cup_2026/get_fixtures"));
      const apiResults = await this.safeCall("world_cup_2026/get_results", []);

      // Pure backend/API-only test feed. Do not merge GitHub or goal_events here.
      // Use BOTH backend results and backend fixtures, because some finished games
      // can stay in fixtures before they appear in get_results. This keeps Canada
      // and similar finished games visible without using made-up/manual file data.
      this._data.apiResultsTest = this.apiOnlyFinishedResults(
        this.mergeResultsAndFinishedFixtures(apiResults, apiFixtures)
      );

      const publicGoalEvents = await this.loadPublicGoalEvents();
      const publicResults = await this.loadPublicGithubResults();

      const storeMatches = this.goalEventStoreToMatches(publicGoalEvents);
      const fixturesWithStore = this.mergePublicGoalEventStore(apiFixtures, publicGoalEvents);
      const apiResultsWithStore = this.mergePublicGoalEventStore(Array.isArray(apiResults) ? apiResults : [], publicGoalEvents);
      const publicResultsWithStore = this.mergePublicGoalEventStore(publicResults, publicGoalEvents);
      const combinedResults = this.mergeUniqueMatches(apiResultsWithStore, publicResultsWithStore);

      this._data.live = this.mergePublicGoalEventStore(
        (Array.isArray(apiLive) ? apiLive : []).filter((match) => this.isLiveMatch(match)),
        publicGoalEvents
      );
      this._data.fixtures = this.mergeUniqueMatches(fixturesWithStore, storeMatches);
      this._data.results = this.mergeResultsAndFinishedFixtures(combinedResults, this._data.fixtures);
      this._data.groups = await this.callApi("world_cup_2026/get_groups");
      this._data.scorers = await this.safeCall("world_cup_2026/get_scorers", []);
      this._data.statistics = await this.safeCall("world_cup_2026/get_statistics", {});
      this._data.records = await this.safeCall("world_cup_2026/get_records", {});
      this._data.venues = await this.safeCall("world_cup_2026/get_venues", {});
      this._data.supporters = await this.loadSupporters();
      this.processMatchClockState();
      this.render();
    } catch (err) {
      this.renderError(err);
    }
  }

  goBackToHomeAssistant() {
     history.back();

  }

  changePage(page) {
    const validPages = new Set(["overview", "live", "fixtures", "results", "groups", "knockout", "players", "records", "stats", "venues", "supporters"]);
    if (!validPages.has(page)) page = "overview";
    this._page = page;
    try { localStorage.setItem("world_cup_2026_last_page", page); } catch (e) {}
    this.render();
  }

  changeLanguage(language) {
    this._language = language;
    localStorage.setItem("world_cup_2026_language", language);
    this.render();
  }

  changeViewMode(viewMode) {
    this._viewMode = viewMode === "tablet" ? "tablet" : "pc";
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
      hi: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      pa: "pa-IN",
      ar: "ar-SA",
      sw: "sw-KE",
      am: "am-ET",
      af: "af-ZA",
      zu: "zu-ZA",
      ha: "ha-NG",
      qu: "qu-PE",
      gn: "gn-PY",
      ay: "ay-BO",
      pt: "pt-PT",
      pl: "pl-PL",
      ja: "ja-JP",
      zh: "zh-CN",
      zh_tw: "zh-TW",
      th: "th-TH",
      vi: "vi-VN",
      id: "id-ID",
      ko: "ko-KR",
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
    const minute = match && match.minute !== undefined && match.minute !== null && match.minute !== "" ? Number(match.minute) : null;
    if (minute !== null && Number.isFinite(minute) && ["IN_PLAY", "LIVE", "1H", "2H"].includes(String(status))) {
      return `${minute}'`;
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
    const liveStatuses = ["IN_PLAY", "LIVE", "PAUSED", "HT", "HALF_TIME", "1H", "2H"];
    return liveStatuses.includes(status);
  }

  isLiveClockStatus(status) {
    return ["IN_PLAY", "LIVE", "1H", "2H", "ET", "EXTRA_TIME", "1ET", "2ET"].includes(String(status || "").toUpperCase().trim());
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
    const candidates = [
      manual?.seconds,
      manual?.clockSeconds,
      manual?.clock_seconds,
      match.clockSeconds,
      match.clock_seconds,
      match.fallbackClock,
      match.fallback_clock,
    ];

    let seconds = null;
    for (const candidate of candidates) {
      const value = Number(candidate);
      if (Number.isFinite(value)) {
        seconds = Math.max(0, Math.floor(value));
        break;
      }
    }

    const timer = manual?.timer || match.fallbackClockText || match.clockText || match.timer || null;
    if (seconds === null && timer && /^\d+:\d{2}$/.test(String(timer))) {
      const [mins, secs] = String(timer).split(":").map((part) => Number(part));
      if (Number.isFinite(mins) && Number.isFinite(secs)) {
        seconds = Math.max(0, Math.floor((mins * 60) + secs));
      }
    }

    if (seconds === null) return null;

    const status = String(manual?.status || match.status || "").toUpperCase();
    const activeValue = manual?.active ?? match.clock_active ?? match.clockActive ?? null;
    const active = activeValue === null || activeValue === undefined
      ? this.isLiveClockStatus(status)
      : !!activeValue;

    return {
      seconds,
      timer: timer || this.formatClockSeconds(seconds),
      displayMinute: manual?.displayMinute || match.displayMinute || this.displayMinuteFromSeconds(seconds),
      active,
      status,
      source: manual?.source || match.clockSource || "exported_manual_clock",
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
          const existingSeconds = this.currentClockSeconds(match, state, now);
          // Manual testing clock: keep this independent from API-Football minutes so both timers can be compared side-by-side.
          const wasPaused = Number.isFinite(Number(previous.freezeAt));
          const previousOffset = Number(previous.offsetSeconds || 0);
          const previousSeconds = Number.isFinite(Number(existingSeconds)) ? Number(existingSeconds) : previousOffset;

          let offsetSeconds;
          if (wasPaused) {
            // Restart from the frozen point: 45:00 after HT, 105:00 after ET HT.
            offsetSeconds = Number(previous.freezeAt || 0);
          } else if (!previous.startedAt) {
            // Fresh live start. Extra-time statuses start from 90:00, normal live starts from 00:00.
            offsetSeconds = this.isExtraTimeMatch(match) ? 90 * 60 : 0;
          } else {
            offsetSeconds = previousSeconds;
          }

          if (this.isExtraTimeMatch(match) && offsetSeconds < 90 * 60) {
            offsetSeconds = 90 * 60;
          }

          state = {
            ...state,
            status,
            startedAt: now,
            offsetSeconds: Math.max(0, Math.floor(offsetSeconds)),
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
    const minute = match && match.minute !== undefined && match.minute !== null && match.minute !== "" ? Number(match.minute) : null;
    return Number.isFinite(minute) ? `${minute}'` : "--";
  }

  manualClockText(match) {
    const status = String(match?.status || "");
    if (this.isFinishedClockStatus(status)) return "";

    const seconds = this.currentClockSeconds(match);
    if (seconds === null || seconds === undefined) return "--";

    return this.formatClockSeconds(seconds);
  }

  liveClockText(match) {
    return this.manualClockText(match);
  }

  footballClockHtml(match) {
    const status = String(match?.status || "");
    if (!(this.isLiveClockStatus(status) || this.isHalfTimeClockStatus(status))) return "";

    const id = this.matchStorageId(match);
    const clockText = this.manualClockText(match);
    if (!clockText || clockText === "--") return "";

    const label = this.isHalfTimeClockStatus(status)
      ? this.t("paused")
      : (this.isExtraTimeMatch(match) ? this.t("aet") : this.t("liveStatus"));

    return `
      <div class="wc-football-match-clock-wrap" title="${this.esc(this.t("manualTimerNotice"))}">
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

    const matchesById = new Map(this.allKnownMatches().map((match) => [this.matchStorageId(match), match]));
    manualClocks.forEach((clock) => {
      const id = clock.getAttribute("data-match-id");
      const match = matchesById.get(id);
      if (!match) return;
      clock.textContent = this.manualClockText(match);
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

    return codes[name] || "";
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

  getHomeScore(m) {
    return m.homeScore ?? m.home_score ?? m.score?.fullTime?.home ?? m.score?.home ?? "-";
  }

  getAwayScore(m) {
    return m.awayScore ?? m.away_score ?? m.score?.fullTime?.away ?? m.score?.away ?? "-";
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

  renderError(err) {
    this.innerHTML = `
      ${this.styles()}
      <div class="wc-app ">
        <div class="wc-shell">
          <div class="wc-card">
            <h1>${this.t("errorTitle")}</h1>
            <p>${this.t("errorText")}</p>
            <pre>${this.esc(JSON.stringify(err, null, 2))}</pre>
          </div>
        </div>
      </div>
    `;
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

        @keyframes wcLivePulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(255,60,60,0);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 16px rgba(255,60,60,0.55);
            transform: scale(1.04);
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
          background: rgba(255,40,40,0.25);
          border-color: rgba(255,80,80,0.55);
          animation: wcLivePulse 1.4s ease-in-out infinite;
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

</style>
    `;
  }

  nav() {
    const items = [
      ["overview", this.t("overview")],
      ["live", this.t("live")],
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
          <button class="${this._page === key ? "active" : ""}" data-page="${key}">
            ${this.esc(label)}
          </button>
        `).join("")}
      </div>
    `;
  }

  tabletHeaderNav() {
    const items = [
      ["overview", this.t("overview")],
      ["live", this.t("live")],
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
          <button class="${this._page === key ? "active" : ""}" data-page="${key}" title="${this.esc(label)}">
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
            <option value="ko" ${this._language === "ko" ? "selected" : ""}>Korean</option>
            <option value="zh" ${this._language === "zh" ? "selected" : ""}>Chinese (Simplified)</option>
            <option value="zh_tw" ${this._language === "zh_tw" ? "selected" : ""}>Chinese (Traditional)</option>
            <option value="th" ${this._language === "th" ? "selected" : ""}>Thai</option>
            <option value="vi" ${this._language === "vi" ? "selected" : ""}>Vietnamese</option>
            <option value="id" ${this._language === "id" ? "selected" : ""}>Indonesian</option>
          </optgroup>
          <optgroup label="India">
            <option value="hi" ${this._language === "hi" ? "selected" : ""}>Hindi</option>
            <option value="bn" ${this._language === "bn" ? "selected" : ""}>Bengali</option>
            <option value="ta" ${this._language === "ta" ? "selected" : ""}>Tamil</option>
            <option value="te" ${this._language === "te" ? "selected" : ""}>Telugu</option>
            <option value="pa" ${this._language === "pa" ? "selected" : ""}>Punjabi</option>
          </optgroup>
          <optgroup label="Middle East & North Africa">
            <option value="ar" ${this._language === "ar" ? "selected" : ""}>Arabic</option>
          </optgroup>
          <optgroup label="Africa">
            <option value="af" ${this._language === "af" ? "selected" : ""}>Afrikaans</option>
            <option value="am" ${this._language === "am" ? "selected" : ""}>Amharic</option>
            <option value="ha" ${this._language === "ha" ? "selected" : ""}>Hausa</option>
            <option value="sw" ${this._language === "sw" ? "selected" : ""}>Swahili</option>
            <option value="zu" ${this._language === "zu" ? "selected" : ""}>Zulu</option>
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
          <option value="tablet" ${this._viewMode === "tablet" ? "selected" : ""}>${this.esc(this.t("tabletView"))}</option>
          <option value="pc" ${this._viewMode === "pc" ? "selected" : ""}>${this.esc(this.t("pcView"))}</option>
        </select>
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
    const liveStatuses = ["IN_PLAY", "LIVE", "PAUSED", "HT", "HALF_TIME", "1H", "2H"];
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
            ☕ Support via Ko-fi
          </a>
          <a
            class="wc-overview-beer-button"
            href="https://paypal.me/graffidoodle"
            target="_blank"
            rel="noopener noreferrer"
          >
            💳 Support via PayPal
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
      .forEach((event) => {
        const key = this.goalEventDedupeKey(event);
        if (!key) return;
        byKey.set(key, this.betterGoalEvent(byKey.get(key), event));
      });

    return Array.from(byKey.values())
      .sort((a, b) => Number(a?.timerSeconds ?? a?.minute ?? 0) - Number(b?.timerSeconds ?? b?.minute ?? 0))
      .map((event, index) => ({ ...event, goalNumber: index + 1 }));
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

  eventDetailText(event) {
    return String(event?.detail || event?.comments || event?.subType || event?.reason || event?.type || "").trim();
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

    events.forEach((event) => {
      const typeText = String(event.type || event.eventType || event.kind || "").toLowerCase();
      const detailText = this.eventDetailText(event).toLowerCase();
      const player = this.eventPlayerName(event);
      const team = this.eventTeamName(event);
      const minuteText = this.eventMinuteText(event);
      const timerSeconds = this.eventTimerSeconds(event);

      const isGoal = typeText.includes("goal") || detailText.includes("goal") || event.isGoal === true;
      const isCard = typeText.includes("card") || detailText.includes("yellow") || detailText.includes("red");
      const isSub = typeText.includes("subst") || detailText.includes("substitution");
      const isVar = typeText.includes("var") || detailText.includes("var");
      const isPenalty = detailText.includes("penalty") || detailText.includes("pen");
      const isMissedPenalty = detailText.includes("missed penalty") || detailText.includes("penalty missed");
      const isOwnGoal = detailText.includes("own goal") || /\bog\b/i.test(detailText);

      let category = "";
      if (isGoal) category = "goal";
      else if (isCard) category = "card";
      else if (isSub) category = "substitution";
      else if (isVar) category = "var";
      else return;

      let icon = "•";
      if (category === "goal") icon = isOwnGoal ? "🥅" : (isPenalty ? "🎯" : "⚽");
      if (category === "card") icon = detailText.includes("red") ? "🟥" : "🟨";
      if (category === "substitution") icon = "🔄";
      if (category === "var") icon = "📺";
      if (isMissedPenalty) icon = "❌";

      const key = [
        category,
        this.fixtureTeamKey(team),
        player.toLowerCase(),
        minuteText || timerSeconds,
        detailText,
      ].join("|");

      if (!key.trim() || byKey.has(key)) return;

      byKey.set(key, {
        ...event,
        category,
        icon,
        team,
        player,
        assist: this.eventAssistName(event),
        minuteText,
        timerSeconds,
        detail: this.eventDetailText(event),
        isOwnGoal,
        isPenalty,
        isMissedPenalty,
      });
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

    const addRef = (ref) => {
      if (!ref) return;
      if (typeof ref === "string") {
        const name = ref.trim();
        if (name) refs.push({ name });
        return;
      }
      if (typeof ref === "object") {
        const name = ref.name || ref.referee || ref.fullName || ref.displayName;
        if (!name) return;
        refs.push({
          name,
          type: ref.type || ref.role || "REFEREE",
          nationality: ref.nationality || ref.country || "",
        });
      }
    };

    addRef(match?.referee);
    addRef(match?.mainReferee);
    addRef(match?.official);
    (Array.isArray(match?.referees) ? match.referees : []).forEach(addRef);
    (Array.isArray(match?.officials) ? match.officials : []).forEach(addRef);

    const seen = new Set();
    return refs.filter((ref) => {
      const key = `${String(ref.name).toLowerCase()}|${String(ref.type || "").toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  matchOfficialsSection(match) {
    const refs = this.matchReferees(match);
    const attendance = match?.attendance ?? match?.crowd ?? match?.spectators ?? null;
    if (!refs.length && !attendance) return "";

    const refsHtml = refs.length
      ? refs.map((ref) => {
          const type = ref.type ? ` <span>${this.esc(String(ref.type).replaceAll("_", " "))}</span>` : "";
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

  matchEventsTimelineSection(match, options = {}) {
    const includeSubs = options.includeSubs === true;
    const events = this.normalisedMatchEvents(match)
      .filter((event) => includeSubs || event.category !== "substitution");

    if (!events.length) return "";

    const rows = events.map((event) => {
      const detail = event.detail && event.detail.toLowerCase() !== event.category ? event.detail : "";
      const team = event.team ? ` <em>${this.esc(this.localizedTeamName(event.team))}</em>` : "";
      const assist = event.assist ? ` <small>Assist: ${this.esc(event.assist)}</small>` : "";
      const player = event.player || detail || event.category;
      const minute = event.minuteText || "";
      const detailHtml = detail && String(detail).toLowerCase() !== String(player).toLowerCase()
        ? `<small>${this.esc(detail)}</small>`
        : "";

      return `
        <div class="match-event-row match-event-${this.esc(event.category)}">
          <span class="match-event-minute">${this.esc(minute || "-")}</span>
          <span class="match-event-icon">${this.esc(event.icon)}</span>
          <span class="match-event-main">
            <strong>${this.esc(player)}</strong>${team}
            ${detailHtml}
            ${assist}
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

  matchExtraLiveDataSection(match) {
    const eventsHtml = this.matchEventsTimelineSection(match);
    const officialsHtml = this.matchOfficialsSection(match);
    if (!eventsHtml && !officialsHtml) return "";

    return `
      <div class="match-extra-live-data">
        ${eventsHtml}
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
    const normalisedGoals = this.normalisedMatchEvents(match).filter((event) => event.category === "goal");
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
          const detailText = item.isOwnGoal ? " (OG)" : (item.isPenalty ? " (P)" : "");
          const icon = item.isOwnGoal ? "🥅" : (item.isPenalty ? "🎯" : "⚽");
          const titleParts = [item.detail, item.timer].filter(Boolean);
          const title = titleParts.length ? ` title="${this.esc(titleParts.join(" • "))}"` : "";
          return `<span class="match-scorer-pill"${title}>${icon} ${this.esc(name)}${this.esc(minuteText)}${this.esc(detailText)}</span>`;
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

  livePage() {
    const live = (this._data.live || []).filter((match) => this.isLiveMatch(match));

    if (!live.length) {
      return `
        <div class="wc-card">
          <div class="wc-section-title">${this.t("live")}</div>
          <div class="wc-live-sync-notice">ℹ️ ${this.t("manualTimerNotice")}</div>
          <div class="wc-empty">${this.t("noLiveMatches")}</div>
        </div>
      `;
    }

    return `
      <div class="wc-card">
        <div class="wc-section-title">${this.t("live")} <span class="wc-badge wc-live">${this.t("liveStatus")}</span></div>
        <div class="wc-live-sync-notice">ℹ️ ${this.t("manualTimerNotice")}</div>
        <div class="wc-list">
          ${live.map(m => this.matchRow(m)).join("")}
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
    const liveCount = sortedFixtures.filter(m => ["IN_PLAY", "LIVE", "PAUSED"].includes(m.status)).length;
    const remainingCount = Math.max(sortedFixtures.length - playedCount, 0);
    const nextMatch = sortedFixtures.find(m => ["TIMED", "SCHEDULED"].includes(m.status));
    const dayCount = new Set(sortedFixtures.map(m => this.fixtureDateKey(m))).size;

    const grouped = sortedFixtures.reduce((days, match) => {
      const key = this.fixtureDateKey(match);
      if (!days[key]) {
        days[key] = [];
      }
      days[key].push(match);
      return days;
    }, {});

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
          ${Object.entries(grouped).map(([key, matches]) => `
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
    const existing = this.fixtureMatchNumber(match);
    if (existing && existing >= 73 && existing <= 104) return existing;

    const key = this.normaliseKnockoutStage(stage || match?.stage);
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
            ${venueInfo.realName && venueInfo.realName !== venueInfo.name ? `<span class="fixture-venue-real">Real: ${this.esc(venueInfo.realName)}</span>` : ""}
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

  playersPage() {
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
      )
      .slice(0, 100);

    const hasScorers = scorers.length > 0;
    const source = hasScorers ? scorers[0].source : "football-data.org";
    const isFallback = String(source).toLowerCase().includes("fallback") || String(source).toLowerCase().includes("local");

    const totalGoals = scorers.reduce((total, p) => total + p.goals, 0);
    const totalAssists = scorers.reduce((total, p) => total + p.assists, 0);
    const leader = scorers[0];

    if (!hasScorers) {
      return `
        <section class="wc-section hero-section players-hero">
          <div class="section-kicker">${this.t("players")}</div>
          <h2>${this.t("goldenBootCentre")}</h2>
          <p>${this.t("goldenBootAutoText")}</p>
        </section>

        <section class="wc-section">
          <div class="wc-empty">
            No Golden Boot scorer data available yet.
          </div>
        </section>
      `;
    }

    return `
      <section class="wc-section hero-section players-hero">
        <div class="section-kicker">${this.t("players")}</div>
        <h2>${this.t("goldenBootCentre")}</h2>
        <p>
          ${isFallback
            ? "Preview fallback data shown until football-data.org publishes live World Cup scorer data."
            : "Live Golden Boot data from football-data.org."}
        </p>
        <div class="source-pill">
          ${this.t("source")}: ${this.esc(source)}
        </div>
      </section>

      <div class="stats-layout">
        <section class="wc-section">
          <div class="section-header-row">
            <div>
              <div class="section-kicker">${this.t("goldenBoot")}</div>
              <h2>${this.t("playerWatch")}</h2>
            </div>
            <div class="mini-pill">${scorers.length} ${this.t("playersTracked")}</div>
          </div>

          ${leader ? `
            <div class="leader-strip">
              <div>
                <div class="section-kicker">${this.t("leaderSpotlight")}</div>
                <h3>${this.esc(leader.name)}</h3>
                <p>${this.flag(leader.team, true)} ${this.esc(leader.team)}</p>
              </div>
              <div class="leader-score">
                <strong>${leader.goals}</strong>
                <span>${this.t("goals")}</span>
              </div>
              <div class="leader-score">
                <strong>${leader.assists}</strong>
                <span>${this.t("assists")}</span>
              </div>
            </div>
          ` : ""}

          <div class="table-wrap">
            <table class="wc-table">
              <thead>
                <tr>
                  <th>${this.t("pos")}</th>
                  <th>${this.t("player")}</th>
                  <th>${this.t("team")}</th>
                  <th>${this.t("goals")}</th>
                  <th>${this.t("assists")}</th>
                </tr>
              </thead>
              <tbody>
                ${scorers.map((player, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${this.esc(player.name)}</strong></td>
                    <td>
                      <div class="group-team-cell">
                        ${this.flag(player.team, true)}
                        <span>${this.esc(player.team)}</span>
                      </div>
                    </td>
                    <td><strong>${player.goals}</strong></td>
                    <td>${player.assists}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="wc-section side-panel">
          <div class="section-kicker">${this.t("stats")}</div>
          <h2>${this.t("tournamentIntelligence")}</h2>
          <div class="stat-list">
            <div><strong>${scorers.length}</strong><span>${this.t("playersTracked")}</span></div>
            <div><strong>${totalGoals}</strong><span>${this.t("totalGoals")}</span></div>
            <div><strong>${totalAssists}</strong><span>${this.t("totalAssists")}</span></div>
            <div><strong>${this.esc(source)}</strong><span>${this.t("source")}</span></div>
          </div>
        </aside>
      </div>
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
          const aTime = new Date(a.utcDate || a.date || 0).getTime();
          const bTime = new Date(b.utcDate || b.date || 0).getTime();
          return aTime - bTime;
        });
      return { stage, label, matches };
    });

    return `
      <div class="wc-card wc-web-card">
        <div class="wc-section-title">Knockout Stage</div>
        <div class="wc-knockout-web">
          ${roundMatches.map(({ stage, label, matches }) => `
            <div class="wc-web-round">
              <div class="wc-web-round-title">${label}</div>
              ${matches.length ? matches.map((m) => `
                <div class="wc-web-match">
                  <div class="wc-web-team">
                    ${this.flag(this.getHomeTeam(m), true)}
                    <span>${this.esc(this.localizedTeamName(this.getHomeTeam(m)))}</span>
                  </div>
                  <div class="wc-web-vs">${this.t("versus")}</div>
                  <div class="wc-web-team">
                    ${this.flag(this.getAwayTeam(m), true)}
                    <span>${this.esc(this.localizedTeamName(this.getAwayTeam(m)))}</span>
                  </div>
                </div>
              `).join("") : `<div class="wc-web-match"><div class="wc-web-team"><span>${this.t("tbc")}</span></div><div class="wc-web-vs">${this.t("fixturesNotAvailable")}</div></div>`}
            </div>
          `).join("")}
          <div class="wc-web-round wc-web-round-winner">
            <div class="wc-web-round-title">Winner</div>
            <div class="wc-web-match wc-web-winner-card">
              <div class="wc-web-team wc-web-winner-team">
                <span class="wc-winner-trophy">🏆</span>
                <span>${this.t("tbc")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="wc-card">
        <div class="wc-section-title">Knockout Details</div>
        <div class="wc-bracket">
          ${roundMatches.map(({ stage, label, matches }) => `
              <div class="wc-bracket-round">
                <div class="wc-round-title">${label}</div>
                ${
                  matches.length
                    ? matches.map((m, index) => {
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
                            ${venueInfo.realName && venueInfo.realName !== venueInfo.name ? `<span class="fixture-venue-real">Real: ${this.esc(venueInfo.realName)}</span>` : ""}
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
    const r = this._data.records || {};

    return `
      <div class="wc-grid">
        <div class="wc-stat"><strong>${r.highest_scoring_match?.totalGoals ?? 0}</strong>${this.t("highestMatchGoals")}</div>
        <div class="wc-stat"><strong>${r.biggest_win?.margin ?? 0}</strong>${this.t("biggestMargin")}</div>
        <div class="wc-stat"><strong>${r.top_scoring_team?.goalsFor ?? 0}</strong>${this.t("topTeamGoals")}</div>
        <div class="wc-stat"><strong>${r.best_defence?.goalsAgainst ?? 0}</strong>${this.t("bestDefenceGA")}</div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">${this.t("highestScoringMatch")}</div>
          ${r.highest_scoring_match ? this.matchRow(r.highest_scoring_match) : `<div class="wc-empty">${this.t("noResult")}</div>`}
        </div>

        <div class="wc-card">
          <div class="wc-section-title">${this.t("biggestWin")}</div>
          ${r.biggest_win ? this.matchRow(r.biggest_win) : `<div class="wc-empty">${this.t("noResult")}</div>`}
        </div>
      </div>

      <div class="wc-two">
        <div class="wc-card">
          <div class="wc-section-title">${this.t("topScoringTeam")}</div>
          ${
            r.top_scoring_team
              ? `<p><strong>${this.esc(this.localizedTeamName(r.top_scoring_team.team))}</strong></p><p>${r.top_scoring_team.goalsFor} ${this.t("goals").toLowerCase()}</p>`
              : `<div class="wc-empty">${this.t("noTeamGoalData")}</div>`
          }
        </div>

        <div class="wc-card">
          <div class="wc-section-title">${this.t("bestDefence")}</div>
          ${
            r.best_defence
              ? `<p><strong>${this.esc(this.localizedTeamName(r.best_defence.team))}</strong></p><p>${r.best_defence.goalsAgainst} ${this.t("conceded")}</p>`
              : `<div class="wc-empty">${this.t("noDefensiveData")}</div>`
          }
        </div>
      </div>
    `;
  }

  statsPage() {
    const s = this._data.statistics || {};

    return `
      <div class="wc-grid">
        <div class="wc-stat"><strong>${s.matches_played ?? 0}</strong>${this.t("matchesPlayed")}</div>
        <div class="wc-stat"><strong>${s.total_goals ?? 0}</strong>${this.t("totalGoals")}</div>
        <div class="wc-stat"><strong>${s.goals_per_match ?? 0}</strong>${this.t("goalsPerMatch")}</div>
        <div class="wc-stat"><strong>${s.progress ?? 0}%</strong>${this.t("progress")}</div>
        <div class="wc-stat"><strong>${s.draws ?? 0}</strong>${this.t("draws")}</div>
        <div class="wc-stat"><strong>${s.draw_rate ?? 0}%</strong>${this.t("drawRate")}</div>
        <div class="wc-stat"><strong>${s.btts_rate ?? 0}%</strong>${this.t("bttsRate")}</div>
        <div class="wc-stat"><strong>${s.over_25_rate ?? 0}%</strong>${this.t("over25Rate")}</div>
      </div>
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
      <div class="wc-card">
        <div class="wc-section-title">${this.t("supportersThankYouTitle")}</div>
        <p>
          ${this.t("supportersIntro")}
        </p>
        <p class="wc-muted">
          ${this.t("supportersSpecialThanks")}
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

      <div class="wc-card" style="text-align:center;">
        <div class="wc-section-title">${this.t("wantNameAdded")}</div>
        <p class="wc-muted">${this.t("supportFutureUpdates")}</p>
        <p class="wc-muted">Support the World Cup 2026 Integration using Ko-fi or PayPal. Every donation helps with future updates, testing and new features.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
          <a
            class="wc-pill wc-donate-button"
            href="https://ko-fi.com/supportkofi"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-flex;text-decoration:none;"
          >
            ☕ Support via Ko-fi
          </a>
          <a
            class="wc-pill wc-donate-button"
            href="https://paypal.me/graffidoodle"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-flex;text-decoration:none;"
          >
            💳 Support via PayPal
          </a>
        </div>
      </div>
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

    return `<div class="wc-header-live-pill live wc-header-scheduled-pill">🟢 ${scheduledTodayCount} ${scheduledTodayCount === 1 ? "game" : "games"} today</div>`;
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
    if (this._page === "venues") return this.venuesPage();
    if (this._page === "supporters") return this.supportersPage();
    return this.overviewPage();
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
                  <option value="en" ${this._language === "en" ? "selected" : ""}>English</option>
                  <option value="fr" ${this._language === "fr" ? "selected" : ""}>French</option>
                  <option value="de" ${this._language === "de" ? "selected" : ""}>German</option>
                  <option value="es" ${this._language === "es" ? "selected" : ""}>Spanish</option>
                  <option value="it" ${this._language === "it" ? "selected" : ""}>Italian</option>
                  <option value="nl" ${this._language === "nl" ? "selected" : ""}>Dutch</option>
                  <option value="pt" ${this._language === "pt" ? "selected" : ""}>Portuguese</option>
                  <option value="pl" ${this._language === "pl" ? "selected" : ""}>Polish</option>
                  <option value="ja" ${this._language === "ja" ? "selected" : ""}>Japanese</option>
                  <option value="ko" ${this._language === "ko" ? "selected" : ""}>Korean</option>
                  <option value="zh" ${this._language === "zh" ? "selected" : ""}>Chinese</option>
                  <option value="ar" ${this._language === "ar" ? "selected" : ""}>Arabic</option>
                </select>
                <select class="wc-view-select wc-view-select-tablet" id="wc-view-select-tablet" title="${this.esc(this.t("viewMode"))}">
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

    this.applyHideSidebarFromUrl();

    this.querySelectorAll(".wc-nav button, .wc-tablet-header-nav button, .overview-action-button").forEach((button) => {
      button.onclick = () => {
        const page = button.getAttribute("data-page");
        this.changePage(page);
      };
    });

    this.querySelectorAll("#wc-language-select, #wc-language-select-tablet").forEach((languageSelect) => {
      this.setupLanguageSelect(languageSelect);
    });

    this.querySelectorAll("#wc-view-select, #wc-view-select-tablet").forEach((viewSelect) => {
      this.setupViewSelect(viewSelect);
    });

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
  }
}


  customElements.define("world-cup-2026-panel", WorldCup2026Panel);
}
