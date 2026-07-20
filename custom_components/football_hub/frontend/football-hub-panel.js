const PANEL_VERSION = "0.12.2-visual-match-statistics";

class FootballHubPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._selectInteracting = false;
    this._pendingHassRender = false;
    this._selectSafetyTimer = null;
    this.shadowRoot.addEventListener("pointerdown", (event) => {
      if (event.target?.tagName === "SELECT") this._beginSelectInteraction();
    }, true);
    this.shadowRoot.addEventListener("focusin", (event) => {
      if (event.target?.tagName === "SELECT") this._beginSelectInteraction();
    }, true);
    this.shadowRoot.addEventListener("change", (event) => {
      if (event.target?.tagName === "SELECT") queueMicrotask(() => this._endSelectInteraction());
    }, true);
    this.shadowRoot.addEventListener("focusout", (event) => {
      if (event.target?.tagName !== "SELECT") return;
      setTimeout(() => {
        if (this.shadowRoot.activeElement?.tagName !== "SELECT") this._endSelectInteraction();
      }, 0);
    }, true);
    const savedTab = localStorage.getItem("football_hub_active_page") || "overview";
    this._activeTab = ["overview", "live", "fixtures", "results", "table", "players", "my-club", "cups", "news", "tv-guide", "transfers", "supporters", "settings"].includes(savedTab)
      ? savedTab
      : "overview";
    this._selectedFixtureTeam = localStorage.getItem("football_hub_fixture_team") || "__all__";
    this._fixturePage = 0;
    this._selectedLiveMatch = localStorage.getItem("football_hub_live_match") || "";
    this._selectedLiveTeam = localStorage.getItem("football_hub_live_team") || "";
    this._selectedPrefix = localStorage.getItem("football_hub_selected_prefix") || "";
    this._selectedCountry = localStorage.getItem("football_hub_selected_country") || "";
    this._selectedCupCountry = localStorage.getItem("football_hub_cup_country") || "Europe";
    this._cupView = localStorage.getItem("football_hub_cup_view") || "overview";
    this._transferView = localStorage.getItem("football_hub_transfer_view") || "latest";
    this._pendingCup = "";
    const savedViewMode = localStorage.getItem("football_hub_view_mode") || "desktop";
    this._viewMode = ["desktop", "tablet", "mobile"].includes(savedViewMode) ? savedViewMode : "desktop";
    const savedLanguage = localStorage.getItem("football_hub_language") || "en";
    this._language = ["en", "es", "de", "it", "fr", "nl", "pt", "tr"].includes(savedLanguage) ? savedLanguage : "en";
    this._selectedClub = localStorage.getItem("football_hub_my_club") || "";
    this._pendingCompetition = "";
    this._supporters = [];
    this._supportersLoading = false;
    this._supportersLoaded = false;
    this._lastRenderSig = null;
  }

  _footballStateSignature() {
    const states = this._allStates();
    const parts = [];
    for (const entityId of Object.keys(states)) {
      if (!entityId.includes("football_hub")) continue;
      const state = states[entityId];
      parts.push(`${entityId}@${state?.last_updated ?? state?.last_changed ?? ""}`);
    }
    parts.sort();
    parts.push(`prefix=${this._selectedPrefix || ""}`);
    parts.push(`pc=${this._pendingCompetition || ""}`);
    parts.push(`pcup=${this._pendingCup || ""}`);
    return parts.join("|");
  }

  set hass(hass) {
    this._hass = hass;
    this._ensureCompetition();
    if (this._pendingCompetition && this._statusInfo().competition_key === this._pendingCompetition) {
      this._pendingCompetition = "";
    }
    if (this._pendingCup && this._attrs("cup_centre").competition_key === this._pendingCup) {
      this._pendingCup = "";
    }
    if (this._selectInteracting || this.shadowRoot.activeElement?.tagName === "SELECT") {
      this._pendingHassRender = true;
      return;
    }
    const renderSig = this._footballStateSignature();
    if (renderSig === this._lastRenderSig) return;
    this._lastRenderSig = renderSig;
    this._render();
  }

  _beginSelectInteraction() {
    this._selectInteracting = true;
    clearTimeout(this._selectSafetyTimer);
    this._selectSafetyTimer = setTimeout(() => this._endSelectInteraction(), 15000);
  }

  _endSelectInteraction() {
    this._selectInteracting = false;
    clearTimeout(this._selectSafetyTimer);
    this._selectSafetyTimer = null;
    if (this._pendingHassRender) {
      this._pendingHassRender = false;
      this._render();
    }
  }

  set panel(panel) {
    this._panel = panel;
  }

  set narrow(narrow) {
    this._narrow = narrow;
    this._render();
  }

  set route(route) {
    this._route = route;
  }

  connectedCallback() {
    this._render();
    this._loadSupporters();
  }

  async _loadSupporters() {
    if (this._supportersLoading || this._supportersLoaded) return;

    this._supportersLoading = true;
    const cacheBust = Date.now();

    const fetchList = async (url, payloadKeys = []) => {
      try {
        const response = await fetch(`${url}?t=${cacheBust}`, {
          cache: "no-store",
        });

        if (!response.ok) return [];

        const raw = (await response.text()).trim();
        if (!raw) return [];

        let payload;
        try {
          payload = JSON.parse(raw);
        } catch (_jsonError) {
          // Keep the community list working if a comma is accidentally
          // omitted between two supporter objects on GitHub.
          payload = JSON.parse(raw.replace(/}\s*{/g, "},{"));
        }

        if (Array.isArray(payload)) return payload;

        for (const key of payloadKeys) {
          if (Array.isArray(payload?.[key])) return payload[key];
        }
      } catch (_error) {
        return [];
      }

      return [];
    };

    const sortByDate = (items) =>
      [...items].sort((a, b) => {
        const aDate = new Date(a?.date || "1900-01-01").getTime();
        const bDate = new Date(b?.date || "1900-01-01").getTime();
        return bDate - aDate;
      });

    const [supporters, premiumSupporters] = await Promise.all([
      fetchList(
        "https://raw.githubusercontent.com/Adya84/ha-football-hub/main/supporters/supporters.json",
        ["supporters"]
      ),
      fetchList(
        "https://raw.githubusercontent.com/Adya84/ha-football-hub/main/supporters/premium_supporters.json",
        ["premiumSupporters", "supporters"]
      ),
    ]);

    const cachedSupporters = JSON.parse(localStorage.getItem("football_hub_supporters_cache") || "[]");
    const cachedPremium = JSON.parse(localStorage.getItem("football_hub_premium_supporters_cache") || "[]");
    this._supporters = sortByDate(supporters.length ? supporters : cachedSupporters);
    this._premiumSupporters = sortByDate(premiumSupporters.length ? premiumSupporters : cachedPremium);
    if (supporters.length) localStorage.setItem("football_hub_supporters_cache", JSON.stringify(supporters));
    if (premiumSupporters.length) localStorage.setItem("football_hub_premium_supporters_cache", JSON.stringify(premiumSupporters));
    this._supportersLoading = false;
    this._supportersLoaded = true;
    this._render();
  }

  _countryFlag(country, className = "supporter-flag-image") {
    const name = String(country || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const inlineFlags = {
      england: `
        <svg class="${className}" viewBox="0 0 60 36" role="img" aria-label="England flag">
          <rect width="60" height="36" fill="#ffffff"/>
          <rect x="25" width="10" height="36" fill="#ce1124"/>
          <rect y="13" width="60" height="10" fill="#ce1124"/>
        </svg>
      `,
      scotland: `
        <svg class="${className}" viewBox="0 0 60 36" role="img" aria-label="Scotland flag">
          <rect width="60" height="36" fill="#005eb8"/>
          <polygon points="0,0 7,0 60,29 60,36 53,36 0,7" fill="#ffffff"/>
          <polygon points="60,0 53,0 0,29 0,36 7,36 60,7" fill="#ffffff"/>
        </svg>
      `,
      wales: `
        <svg class="${className}" viewBox="0 0 60 36" role="img" aria-label="Wales flag">
          <rect width="60" height="18" fill="#ffffff"/>
          <rect y="18" width="60" height="18" fill="#00ab39"/>
          <path d="M14 24c5-7 8-11 15-11 4 0 7 1 10 3l4-4 1 6 6 1-5 4 2 7-7-3-4 5-3-6-8 2 2-6-6-3z" fill="#d30731"/>
        </svg>
      `,
      "northern ireland": `
        <svg class="${className}" viewBox="0 0 60 36" role="img" aria-label="Northern Ireland flag">
          <rect width="60" height="36" fill="#ffffff"/>
          <rect x="25" width="10" height="36" fill="#ce1124"/>
          <rect y="13" width="60" height="10" fill="#ce1124"/>
        </svg>
      `
    };

    if (inlineFlags[name]) return inlineFlags[name];

    const codes = {
      argentina:"ar", australia:"au", austria:"at", belgium:"be",
      brazil:"br", bulgaria:"bg", canada:"ca", chile:"cl",
      china:"cn", colombia:"co", croatia:"hr", cyprus:"cy",
      czechia:"cz", "czech republic":"cz", denmark:"dk",
      estonia:"ee", finland:"fi", france:"fr", germany:"de",
      greece:"gr", hungary:"hu", iceland:"is", india:"in",
      indonesia:"id", ireland:"ie", italy:"it", japan:"jp",
      latvia:"lv", lithuania:"lt", luxembourg:"lu", malaysia:"my",
      mexico:"mx", netherlands:"nl", holland:"nl", "new zealand":"nz",
      norway:"no", philippines:"ph", poland:"pl", portugal:"pt",
      romania:"ro", serbia:"rs", singapore:"sg", slovakia:"sk",
      slovenia:"si", "south africa":"za", "south korea":"kr",
      korea:"kr", spain:"es", sweden:"se", switzerland:"ch",
      thailand:"th", turkey:"tr", turkiye:"tr", ukraine:"ua",
      "united arab emirates":"ae", uae:"ae", "united kingdom":"gb",
      uk:"gb", "great britain":"gb", usa:"us", us:"us",
      "united states":"us", "united states of america":"us",
      vietnam:"vn"
    };

    const code = codes[name] || (/^[a-z]{2}$/.test(name) ? name : "");

    if (!code) return `<span class="supporter-flag-fallback">🏳️</span>`;

    return `<img class="${className}" src="https://flagcdn.com/w160/${code}.png" alt="${this._escape(country || code)} flag" loading="lazy">`;
  }

  _supporterCard(supporter) {
    const name = typeof supporter === "string" ? supporter : supporter?.name;
    const country = typeof supporter === "string" ? "" : supporter?.country;
    const date = typeof supporter === "string" ? "" : supporter?.date;
    const message = typeof supporter === "string" ? "" : supporter?.message;
    return `<article class="supporter-card"><div class="supporter-avatar">${this._countryFlag(country, "supporter-avatar-flag")}</div><div class="supporter-copy"><strong>${this._escape(name || "Anonymous Supporter")}</strong><div class="supporter-meta">${country ? `<span class="supporter-country">${this._escape(country)}</span>` : ""}${date ? `<span>${this._escape(date)}</span>` : ""}</div>${message ? `<p>${this._escape(message)}</p>` : ""}</div></article>`;
  }

  _supportersPage() {
    const supporters = this._supporters;
    const counts = supporters.reduce((out, item) => { const c = String(item?.country || "").trim(); if (c) out[c] = (out[c] || 0) + 1; return out; }, {});
    const countries = Object.entries(counts).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
    const latestDate = supporters[0]?.date || "";
    const latest = latestDate ? supporters.filter((s) => s?.date === latestDate) : supporters.slice(0,4);
    return `
      <section class="page-heading"><div><span class="eyebrow">COMMUNITY SUPPORT</span><h2>Supporters</h2></div><div class="count-badge">${supporters.length} supporters</div></section>
      <section class="support-hero page-card"><div><span class="support-kicker">🍺 HELP BUILD THE FUTURE</span><h2>Support Football Hub</h2><p>This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.</p><div class="support-actions"><a class="support-button primary" href="https://ko-fi.com/ady1984" target="_blank" rel="noopener noreferrer">☕ Support via Ko-fi</a><a class="support-button" href="https://paypal.me/graffidoodle" target="_blank" rel="noopener noreferrer">💳 Support via PayPal</a></div></div><div class="support-thanks"><strong>Thank you</strong><span>Every contribution helps</span></div></section>
      <section class="support-benefits"><article class="page-card"><ha-icon icon="mdi:database-clock-outline"></ha-icon><strong>Live data costs</strong><span>Helps cover reliable football data and matchday services.</span></article><article class="page-card"><ha-icon icon="mdi:tools"></ha-icon><strong>Fixes & improvements</strong><span>Supports testing, maintenance and regular updates.</span></article><article class="page-card"><ha-icon icon="mdi:rocket-launch-outline"></ha-icon><strong>Future features</strong><span>Helps build more competitions, statistics and dashboard tools.</span></article><article class="page-card"><ha-icon icon="mdi:account-group-outline"></ha-icon><strong>Community development</strong><span>Keeps the project community-led and available to Home Assistant users.</span></article></section>
      <section class="page-card premium-info"><div><span class="support-kicker">⭐ PREMIUM SUPPORTERS</span><h2>Extra recognition inside Football Hub</h2><p>Donate £10 / $10 / €10 or more to be featured with your name, country flag and an optional personal message.</p></div><div class="premium-features"><span>👑 Premium profile</span><span>🌍 Name & country flag</span><span>💬 Personal message</span></div></section>
      <section class="support-summary page-card"><div><strong>${supporters.length}</strong><span>Total supporters</span></div><div><strong>${countries.length}</strong><span>Countries supporting</span></div><div><strong>${this._escape(latestDate || "—")}</strong><span>Latest support date</span></div></section>
      ${countries.length ? `<section class="page-card country-support"><h2>Supporters around the world</h2><div class="country-support-grid">${countries.map(([country,count]) => `<span>${this._countryFlag(country)} ${this._escape(country)} <b>${count}</b></span>`).join("")}</div></section>` : ""}
      ${this._supportersLoading && !supporters.length ? `<section class="page-card centred"><div class="empty">Loading supporters…</div></section>` : supporters.length ? `<section class="section"><div class="section-title-row"><div><span class="eyebrow">LATEST THANK YOUS</span><h3>Latest supporters</h3></div><span>${this._escape(latestDate)}</span></div><div class="supporter-grid latest-grid">${latest.map((s) => this._supporterCard(s)).join("")}</div></section><section class="section"><div class="section-title-row"><div><span class="eyebrow">THE COMMUNITY</span><h3>All supporters</h3></div></div><div class="supporter-grid">${supporters.map((s) => this._supporterCard(s)).join("")}</div></section>` : `<section class="page-card centred"><ha-icon class="huge-icon" icon="mdi:heart-outline"></ha-icon><h2>No supporters loaded yet</h2><p>Support the project and have your name added here as a thank you.</p></section>`}
      <section class="page-card support-how"><strong>To be added as a supporter</strong><span>After donating, include your name, country and optional short message.</span></section>`;
  }

  _allStates() {
    return this._hass?.states || {};
  }

  _competitionPrefixes() {
    const prefixes = [];

    for (const entityId of Object.keys(this._allStates())) {
      if (!entityId.startsWith("sensor.") || !entityId.endsWith("_status")) continue;
      if (!entityId.includes("football_hub")) continue;
      prefixes.push(entityId.slice(0, -"_status".length));
    }

    return [...new Set(prefixes)].sort();
  }

  _ensureCompetition() {
    const prefixes = this._competitionPrefixes();

    if (!prefixes.includes(this._selectedPrefix)) {
      this._selectedPrefix = prefixes[0] || "";
    }
  }

  _entity(suffix) {
    if (!this._selectedPrefix) return null;
    return this._allStates()[`${this._selectedPrefix}_${suffix}`] || null;
  }

  _attrs(suffix) {
    return this._entity(suffix)?.attributes || {};
  }

  _statusInfo() {
    const status = this._entity("status");
    return {
      state: status?.state || "Unavailable",
      ...status?.attributes,
    };
  }

  _setCompetition(prefix) {
    this._selectedPrefix = prefix;
    localStorage.setItem("football_hub_selected_prefix", prefix);
    this._render();
  }

  _setTab(tab) {
    this._activeTab = tab;
    localStorage.setItem("football_hub_active_page", tab);
    this._render();
    if (tab === "supporters") {
      this._supportersLoaded = false;
      this._loadSupporters();
    }
  }

  _goBack() {
    localStorage.setItem("football_hub_active_page", this._activeTab);
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.assign("/");
  }

  _setViewMode(mode) {
    this._viewMode = ["desktop", "tablet", "mobile"].includes(mode) ? mode : "desktop";
    localStorage.setItem("football_hub_view_mode", this._viewMode);
    this._render();
  }

  _setLanguage(language) {
    this._language = ["en", "es", "de", "it", "fr", "nl", "pt", "tr"].includes(language) ? language : "en";
    localStorage.setItem("football_hub_language", this._language);
    this._render();
  }

  _t(key) {
    const translations = {
      en:{overview:"Overview",live:"Live",fixtures:"Fixtures",results:"Results",table:"Table",players:"Players",myClub:"My Club",supporters:"Supporters",settings:"Settings",country:"Country",league:"League",view:"View",desktop:"Desktop",tablet:"Tablet",mobile:"Mobile",language:"Language",chooseClub:"Choose your club"},
      es:{overview:"Resumen",live:"En vivo",fixtures:"Partidos",results:"Resultados",table:"Clasificación",players:"Jugadores",myClub:"Mi club",supporters:"Seguidores",settings:"Ajustes",country:"País",league:"Liga",view:"Vista",desktop:"Escritorio",tablet:"Tableta",mobile:"Móvil",language:"Idioma",chooseClub:"Elige tu club"},
      de:{overview:"Übersicht",live:"Live",fixtures:"Spielplan",results:"Ergebnisse",table:"Tabelle",players:"Spieler",myClub:"Mein Verein",supporters:"Unterstützer",settings:"Einstellungen",country:"Land",league:"Liga",view:"Ansicht",desktop:"Desktop",tablet:"Tablet",mobile:"Mobil",language:"Sprache",chooseClub:"Verein auswählen"},
      it:{overview:"Panoramica",live:"Live",fixtures:"Partite",results:"Risultati",table:"Classifica",players:"Giocatori",myClub:"Il mio club",supporters:"Sostenitori",settings:"Impostazioni",country:"Paese",league:"Campionato",view:"Vista",desktop:"Desktop",tablet:"Tablet",mobile:"Mobile",language:"Lingua",chooseClub:"Scegli il tuo club"},
      fr:{overview:"Aperçu",live:"Direct",fixtures:"Matchs",results:"Résultats",table:"Classement",players:"Joueurs",myClub:"Mon club",supporters:"Supporters",settings:"Réglages",country:"Pays",league:"Ligue",view:"Affichage",desktop:"Bureau",tablet:"Tablette",mobile:"Mobile",language:"Langue",chooseClub:"Choisissez votre club"},
      nl:{overview:"Overzicht",live:"Live",fixtures:"Wedstrijden",results:"Uitslagen",table:"Stand",players:"Spelers",myClub:"Mijn club",supporters:"Supporters",settings:"Instellingen",country:"Land",league:"Competitie",view:"Weergave",desktop:"Desktop",tablet:"Tablet",mobile:"Mobiel",language:"Taal",chooseClub:"Kies je club"},
      pt:{overview:"Visão geral",live:"Ao vivo",fixtures:"Jogos",results:"Resultados",table:"Classificação",players:"Jogadores",myClub:"Meu clube",supporters:"Apoiantes",settings:"Definições",country:"País",league:"Liga",view:"Vista",desktop:"Computador",tablet:"Tablet",mobile:"Telemóvel",language:"Idioma",chooseClub:"Escolha o seu clube"},
      tr:{overview:"Genel Bakış",live:"Canlı",fixtures:"Fikstür",results:"Sonuçlar",table:"Puan Durumu",players:"Oyuncular",myClub:"Kulübüm",supporters:"Destekçiler",settings:"Ayarlar",country:"Ülke",league:"Lig",view:"Görünüm",desktop:"Masaüstü",tablet:"Tablet",mobile:"Mobil",language:"Dil",chooseClub:"Kulübünü seç"},
    };
    return translations[this._language]?.[key] || translations.en[key] || key;
  }

  _translateRenderedPage() {
    if (this._language === "en" || !this.shadowRoot) return;
    const phrases = {
      es:{"YOUR MATCHDAY STARTS HERE":"TU JORNADA EMPIEZA AQUÍ","Next fixture":"Próximo partido","Live centre":"Centro en vivo","Latest result":"Último resultado","Season":"Temporada","Total fixtures":"Partidos totales","League table":"Clasificación","Top scorers":"Máximos goleadores","Top assists":"Máximos asistentes","CURRENT STANDINGS":"CLASIFICACIÓN ACTUAL","CURRENT LIVE FEED":"SEÑAL EN DIRECTO","Current live feed":"Señal en directo","The feed updates automatically when a match begins.":"La información se actualiza automáticamente cuando comienza un partido.","Supported team":"Equipo favorito","Choose a team":"Elige un equipo","No live matches right now.":"No hay partidos en directo ahora.","MATCH SCHEDULE":"CALENDARIO","Upcoming fixtures":"Próximos partidos","Show fixtures for":"Mostrar partidos de","Next 6 fixtures":"Próximos 6 partidos","COMPLETED MATCHES":"PARTIDOS FINALIZADOS","No results available yet.":"Todavía no hay resultados.","PLAYER LEADERBOARDS":"CLASIFICACIÓN DE JUGADORES","Player data is not available yet.":"Los datos de jugadores aún no están disponibles.","YOUR TEAM CENTRE":"CENTRO DE TU EQUIPO","CLUB PROFILE":"PERFIL DEL CLUB","HOME GROUND":"ESTADIO","Club code":"Código del club","Founded":"Fundado","City":"Ciudad","Capacity":"Capacidad","Surface":"Superficie","LEAGUE POSITION":"POSICIÓN EN LA LIGA","Played":"Jugados","Goal difference":"Diferencia de goles","Points":"Puntos","NEXT MATCH":"PRÓXIMO PARTIDO","SEASON RECORD":"REGISTRO DE TEMPORADA","Club statistics":"Estadísticas del club","Wins":"Victorias","Draws":"Empates","Defeats":"Derrotas","Goals scored":"Goles marcados","Clean sheets":"Porterías a cero","MANAGER":"ENTRENADOR","Age":"Edad","Career appointments":"Cargos anteriores","Recorded trophies":"Trofeos registrados","LATEST SCORES":"ÚLTIMOS RESULTADOS","Recent results":"Resultados recientes","Club top scorers":"Goleadores del club","Club top assists":"Asistentes del club","FIRST TEAM":"PRIMER EQUIPO","Current squad":"Plantilla actual","AVAILABILITY":"DISPONIBILIDAD","Injuries & suspensions":"Lesiones y sanciones","TRANSFER CENTRE":"MERCADO DE FICHAJES","Recent transfers":"Fichajes recientes","Prediction":"Predicción","Advice":"Consejo","Home chance":"Probabilidad local","Draw chance":"Probabilidad de empate","Away chance":"Probabilidad visitante","CLUB HISTORY":"HISTORIA DEL CLUB","Records":"Registros","Head-to-head matches":"Enfrentamientos directos","Player trophies":"Trofeos de jugadores","Manager trophies":"Trofeos del entrenador","COMMUNITY SUPPORT":"APOYO DE LA COMUNIDAD","Supporters around the world":"Seguidores de todo el mundo","Latest supporters":"Últimos seguidores","All supporters":"Todos los seguidores","Total supporters":"Seguidores totales","Countries supporting":"Países participantes","Latest support date":"Última fecha de apoyo","FOOTBALL HUB":"FOOTBALL HUB","Settings & diagnostics":"Ajustes y diagnóstico","Competition":"Competición","Provider mode":"Modo de proveedor","Diagnostics":"Diagnóstico","Integration":"Integración","Configured competitions":"Competiciones configuradas","Panel build":"Versión del panel","Entity prefix":"Prefijo de entidad","No fixtures available.":"No hay partidos disponibles.","No recent results available.":"No hay resultados recientes.","No transfer data available.":"No hay datos de fichajes.","No current injuries supplied.":"No hay lesiones actuales.","Squad information is not available yet.":"La plantilla aún no está disponible.","Football Hub is ready":"Football Hub está listo"},
      de:{"YOUR MATCHDAY STARTS HERE":"DEIN SPIELTAG BEGINNT HIER","Next fixture":"Nächstes Spiel","Live centre":"Live-Zentrale","Latest result":"Letztes Ergebnis","Season":"Saison","Total fixtures":"Spiele gesamt","League table":"Tabelle","Top scorers":"Torschützen","Top assists":"Meiste Vorlagen","CURRENT STANDINGS":"AKTUELLE TABELLE","Current live feed":"Aktueller Live-Feed","The feed updates automatically when a match begins.":"Die Daten werden bei Spielbeginn automatisch aktualisiert.","Supported team":"Lieblingsverein","Choose a team":"Team auswählen","No live matches right now.":"Derzeit keine Live-Spiele.","MATCH SCHEDULE":"SPIELPLAN","Upcoming fixtures":"Kommende Spiele","Show fixtures for":"Spiele anzeigen für","Next 6 fixtures":"Nächste 6 Spiele","COMPLETED MATCHES":"BEENDETE SPIELE","No results available yet.":"Noch keine Ergebnisse verfügbar.","PLAYER LEADERBOARDS":"SPIELER-RANGLISTEN","Player data is not available yet.":"Spielerdaten sind noch nicht verfügbar.","YOUR TEAM CENTRE":"DEIN VEREINSZENTRUM","CLUB PROFILE":"VEREINSPROFIL","HOME GROUND":"HEIMSTADION","Club code":"Vereinskürzel","Founded":"Gegründet","City":"Stadt","Capacity":"Kapazität","Surface":"Spielfläche","LEAGUE POSITION":"TABELLENPLATZ","Played":"Spiele","Goal difference":"Tordifferenz","Points":"Punkte","NEXT MATCH":"NÄCHSTES SPIEL","SEASON RECORD":"SAISONBILANZ","Club statistics":"Vereinsstatistik","Wins":"Siege","Draws":"Unentschieden","Defeats":"Niederlagen","Goals scored":"Erzielte Tore","Clean sheets":"Zu-null-Spiele","MANAGER":"TRAINER","Age":"Alter","Career appointments":"Karrierestationen","Recorded trophies":"Erfasste Titel","LATEST SCORES":"LETZTE ERGEBNISSE","Recent results":"Letzte Ergebnisse","Club top scorers":"Vereins-Torschützen","Club top assists":"Vereins-Vorlagen","FIRST TEAM":"ERSTE MANNSCHAFT","Current squad":"Aktueller Kader","AVAILABILITY":"VERFÜGBARKEIT","Injuries & suspensions":"Verletzungen und Sperren","TRANSFER CENTRE":"TRANSFERZENTRALE","Recent transfers":"Letzte Transfers","Prediction":"Prognose","Advice":"Empfehlung","Home chance":"Heimchance","Draw chance":"Remischance","Away chance":"Auswärtschance","CLUB HISTORY":"VEREINSHISTORIE","Records":"Rekorde","Head-to-head matches":"Direkte Duelle","Player trophies":"Spielertitel","Manager trophies":"Trainertitel","COMMUNITY SUPPORT":"COMMUNITY-UNTERSTÜTZUNG","Supporters around the world":"Unterstützer weltweit","Latest supporters":"Neueste Unterstützer","All supporters":"Alle Unterstützer","Total supporters":"Unterstützer gesamt","Countries supporting":"Unterstützende Länder","Latest support date":"Letztes Unterstützungsdatum","Settings & diagnostics":"Einstellungen und Diagnose","Competition":"Wettbewerb","Provider mode":"Anbietermodus","Diagnostics":"Diagnose","Integration":"Integration","Configured competitions":"Konfigurierte Wettbewerbe","Panel build":"Panel-Version","Entity prefix":"Entitätspräfix","No fixtures available.":"Keine Spiele verfügbar.","No recent results available.":"Keine aktuellen Ergebnisse.","No transfer data available.":"Keine Transferdaten verfügbar.","No current injuries supplied.":"Keine aktuellen Verletzungen gemeldet.","Squad information is not available yet.":"Kaderdaten sind noch nicht verfügbar.","Football Hub is ready":"Football Hub ist bereit"},
      fr:{"YOUR MATCHDAY STARTS HERE":"VOTRE JOURNÉE COMMENCE ICI","Next fixture":"Prochain match","Live centre":"Centre en direct","Latest result":"Dernier résultat","Season":"Saison","Total fixtures":"Total des matchs","League table":"Classement","Top scorers":"Meilleurs buteurs","Top assists":"Meilleurs passeurs","CURRENT STANDINGS":"CLASSEMENT ACTUEL","Current live feed":"Direct actuel","The feed updates automatically when a match begins.":"Les données se mettent à jour automatiquement au début du match.","Supported team":"Équipe favorite","Choose a team":"Choisir une équipe","No live matches right now.":"Aucun match en direct actuellement.","MATCH SCHEDULE":"CALENDRIER","Upcoming fixtures":"Prochains matchs","Show fixtures for":"Afficher les matchs de","Next 6 fixtures":"6 prochains matchs","COMPLETED MATCHES":"MATCHS TERMINÉS","No results available yet.":"Aucun résultat disponible.","PLAYER LEADERBOARDS":"CLASSEMENTS DES JOUEURS","Player data is not available yet.":"Les données des joueurs ne sont pas encore disponibles.","YOUR TEAM CENTRE":"CENTRE DE VOTRE ÉQUIPE","CLUB PROFILE":"PROFIL DU CLUB","HOME GROUND":"STADE","Club code":"Code du club","Founded":"Fondé","City":"Ville","Capacity":"Capacité","Surface":"Surface","LEAGUE POSITION":"POSITION EN CHAMPIONNAT","Played":"Joués","Goal difference":"Différence de buts","Points":"Points","NEXT MATCH":"PROCHAIN MATCH","SEASON RECORD":"BILAN DE SAISON","Club statistics":"Statistiques du club","Wins":"Victoires","Draws":"Nuls","Defeats":"Défaites","Goals scored":"Buts marqués","Clean sheets":"Matchs sans encaisser","MANAGER":"ENTRAÎNEUR","Age":"Âge","Career appointments":"Postes occupés","Recorded trophies":"Trophées enregistrés","LATEST SCORES":"DERNIERS RÉSULTATS","Recent results":"Résultats récents","Club top scorers":"Buteurs du club","Club top assists":"Passeurs du club","FIRST TEAM":"ÉQUIPE PREMIÈRE","Current squad":"Effectif actuel","AVAILABILITY":"DISPONIBILITÉ","Injuries & suspensions":"Blessures et suspensions","TRANSFER CENTRE":"MERCATO","Recent transfers":"Transferts récents","Prediction":"Pronostic","Advice":"Conseil","Home chance":"Chance domicile","Draw chance":"Chance de nul","Away chance":"Chance extérieur","CLUB HISTORY":"HISTOIRE DU CLUB","Records":"Records","Head-to-head matches":"Confrontations directes","Player trophies":"Trophées des joueurs","Manager trophies":"Trophées de l'entraîneur","COMMUNITY SUPPORT":"SOUTIEN DE LA COMMUNAUTÉ","Supporters around the world":"Supporters dans le monde","Latest supporters":"Derniers supporters","All supporters":"Tous les supporters","Total supporters":"Total des supporters","Countries supporting":"Pays représentés","Latest support date":"Dernière date de soutien","Settings & diagnostics":"Réglages et diagnostic","Competition":"Compétition","Provider mode":"Mode fournisseur","Diagnostics":"Diagnostic","Integration":"Intégration","Configured competitions":"Compétitions configurées","Panel build":"Version du panneau","Entity prefix":"Préfixe d'entité","No fixtures available.":"Aucun match disponible.","No recent results available.":"Aucun résultat récent.","No transfer data available.":"Aucune donnée de transfert.","No current injuries supplied.":"Aucune blessure actuelle signalée.","Squad information is not available yet.":"L'effectif n'est pas encore disponible.","Football Hub is ready":"Football Hub est prêt"},
      it:{"YOUR MATCHDAY STARTS HERE":"LA TUA GIORNATA INIZIA QUI","Next fixture":"Prossima partita","Live centre":"Centro live","Latest result":"Ultimo risultato","Season":"Stagione","Total fixtures":"Partite totali","League table":"Classifica","Top scorers":"Capocannonieri","Top assists":"Migliori assist","CURRENT STANDINGS":"CLASSIFICA ATTUALE","Current live feed":"Diretta attuale","Supported team":"Squadra preferita","Choose a team":"Scegli una squadra","No live matches right now.":"Nessuna partita in diretta.","MATCH SCHEDULE":"CALENDARIO","Upcoming fixtures":"Prossime partite","Show fixtures for":"Mostra partite di","Next 6 fixtures":"Prossime 6 partite","COMPLETED MATCHES":"PARTITE TERMINATE","No results available yet.":"Nessun risultato disponibile.","PLAYER LEADERBOARDS":"CLASSIFICHE GIOCATORI","Player data is not available yet.":"Dati giocatori non ancora disponibili.","YOUR TEAM CENTRE":"CENTRO DELLA TUA SQUADRA","CLUB PROFILE":"PROFILO CLUB","HOME GROUND":"STADIO","Club code":"Codice club","Founded":"Fondato","City":"Città","Capacity":"Capienza","Surface":"Superficie","LEAGUE POSITION":"POSIZIONE IN CLASSIFICA","Played":"Giocate","Goal difference":"Differenza reti","Points":"Punti","NEXT MATCH":"PROSSIMA PARTITA","SEASON RECORD":"RENDIMENTO STAGIONALE","Club statistics":"Statistiche club","Wins":"Vittorie","Draws":"Pareggi","Defeats":"Sconfitte","Goals scored":"Gol segnati","Clean sheets":"Porte inviolate","MANAGER":"ALLENATORE","Age":"Età","Career appointments":"Incarichi in carriera","Recorded trophies":"Trofei registrati","LATEST SCORES":"ULTIMI RISULTATI","Recent results":"Risultati recenti","Club top scorers":"Marcatori del club","Club top assists":"Assist del club","FIRST TEAM":"PRIMA SQUADRA","Current squad":"Rosa attuale","AVAILABILITY":"DISPONIBILITÀ","Injuries & suspensions":"Infortuni e squalifiche","TRANSFER CENTRE":"CALCIOMERCATO","Recent transfers":"Trasferimenti recenti","Prediction":"Pronostico","Advice":"Consiglio","Home chance":"Probabilità casa","Draw chance":"Probabilità pareggio","Away chance":"Probabilità trasferta","CLUB HISTORY":"STORIA DEL CLUB","Records":"Record","Head-to-head matches":"Scontri diretti","Player trophies":"Trofei giocatori","Manager trophies":"Trofei allenatore","Supporters around the world":"Sostenitori nel mondo","Latest supporters":"Ultimi sostenitori","All supporters":"Tutti i sostenitori","Total supporters":"Sostenitori totali","Countries supporting":"Paesi rappresentati","Settings & diagnostics":"Impostazioni e diagnostica","Competition":"Competizione","Diagnostics":"Diagnostica","Configured competitions":"Competizioni configurate","Panel build":"Versione pannello","No fixtures available.":"Nessuna partita disponibile.","No recent results available.":"Nessun risultato recente.","No transfer data available.":"Nessun dato sui trasferimenti.","No current injuries supplied.":"Nessun infortunio attuale.","Squad information is not available yet.":"La rosa non è ancora disponibile."},
      nl:{"YOUR MATCHDAY STARTS HERE":"JOUW WEDSTRIJDDAG BEGINT HIER","Next fixture":"Volgende wedstrijd","Live centre":"Livecentrum","Latest result":"Laatste uitslag","Season":"Seizoen","Total fixtures":"Totaal wedstrijden","League table":"Stand","Top scorers":"Topscorers","Top assists":"Meeste assists","CURRENT STANDINGS":"HUIDIGE STAND","Current live feed":"Huidige livefeed","Supported team":"Favoriete club","Choose a team":"Kies een team","No live matches right now.":"Momenteel geen livewedstrijden.","MATCH SCHEDULE":"WEDSTRIJDSCHEMA","Upcoming fixtures":"Komende wedstrijden","Show fixtures for":"Toon wedstrijden voor","Next 6 fixtures":"Volgende 6 wedstrijden","COMPLETED MATCHES":"GESPEELDE WEDSTRIJDEN","No results available yet.":"Nog geen uitslagen beschikbaar.","PLAYER LEADERBOARDS":"SPELERSRANGLIJSTEN","Player data is not available yet.":"Spelersgegevens zijn nog niet beschikbaar.","YOUR TEAM CENTRE":"JOUW CLUBCENTRUM","CLUB PROFILE":"CLUBPROFIEL","HOME GROUND":"THUISSTADION","Club code":"Clubcode","Founded":"Opgericht","City":"Stad","Capacity":"Capaciteit","Surface":"Ondergrond","LEAGUE POSITION":"COMPETITIEPOSITIE","Played":"Gespeeld","Goal difference":"Doelsaldo","Points":"Punten","NEXT MATCH":"VOLGENDE WEDSTRIJD","SEASON RECORD":"SEIZOENSRESULTAAT","Club statistics":"Clubstatistieken","Wins":"Gewonnen","Draws":"Gelijk","Defeats":"Verloren","Goals scored":"Doelpunten","Clean sheets":"Nul gehouden","MANAGER":"TRAINER","Age":"Leeftijd","Career appointments":"Loopbaanfuncties","Recorded trophies":"Geregistreerde prijzen","LATEST SCORES":"LAATSTE UITSLAGEN","Recent results":"Recente uitslagen","Club top scorers":"Clubtopscorers","Club top assists":"Clubassists","FIRST TEAM":"EERSTE ELFTAL","Current squad":"Huidige selectie","AVAILABILITY":"BESCHIKBAARHEID","Injuries & suspensions":"Blessures en schorsingen","TRANSFER CENTRE":"TRANSFER CENTRUM","Recent transfers":"Recente transfers","Prediction":"Voorspelling","Advice":"Advies","Home chance":"Kans thuis","Draw chance":"Kans gelijkspel","Away chance":"Kans uit","CLUB HISTORY":"CLUBGESCHIEDENIS","Records":"Records","Head-to-head matches":"Onderlinge duels","Player trophies":"Spelersprijzen","Manager trophies":"Trainersprijzen","Supporters around the world":"Supporters wereldwijd","Latest supporters":"Nieuwste supporters","All supporters":"Alle supporters","Total supporters":"Totaal supporters","Countries supporting":"Landen vertegenwoordigd","Settings & diagnostics":"Instellingen en diagnose","Competition":"Competitie","Diagnostics":"Diagnose","Configured competitions":"Ingestelde competities","Panel build":"Paneelversie","No fixtures available.":"Geen wedstrijden beschikbaar.","No recent results available.":"Geen recente uitslagen.","No transfer data available.":"Geen transfergegevens beschikbaar.","No current injuries supplied.":"Geen huidige blessures gemeld.","Squad information is not available yet.":"Selectiegegevens zijn nog niet beschikbaar."},
      pt:{"YOUR MATCHDAY STARTS HERE":"O TEU DIA DE JOGO COMEÇA AQUI","Next fixture":"Próximo jogo","Live centre":"Centro ao vivo","Latest result":"Último resultado","Season":"Época","Total fixtures":"Total de jogos","League table":"Classificação","Top scorers":"Melhores marcadores","Top assists":"Mais assistências","CURRENT STANDINGS":"CLASSIFICAÇÃO ATUAL","Current live feed":"Direto atual","Supported team":"Equipa favorita","Choose a team":"Escolha uma equipa","No live matches right now.":"Não há jogos em direto.","MATCH SCHEDULE":"CALENDÁRIO","Upcoming fixtures":"Próximos jogos","Show fixtures for":"Mostrar jogos de","Next 6 fixtures":"Próximos 6 jogos","COMPLETED MATCHES":"JOGOS TERMINADOS","No results available yet.":"Ainda não há resultados.","PLAYER LEADERBOARDS":"CLASSIFICAÇÕES DE JOGADORES","Player data is not available yet.":"Os dados dos jogadores ainda não estão disponíveis.","YOUR TEAM CENTRE":"CENTRO DA TUA EQUIPA","CLUB PROFILE":"PERFIL DO CLUBE","HOME GROUND":"ESTÁDIO","Club code":"Código do clube","Founded":"Fundado","City":"Cidade","Capacity":"Capacidade","Surface":"Superfície","LEAGUE POSITION":"POSIÇÃO NA LIGA","Played":"Jogos","Goal difference":"Diferença de golos","Points":"Pontos","NEXT MATCH":"PRÓXIMO JOGO","SEASON RECORD":"REGISTO DA ÉPOCA","Club statistics":"Estatísticas do clube","Wins":"Vitórias","Draws":"Empates","Defeats":"Derrotas","Goals scored":"Golos marcados","Clean sheets":"Jogos sem sofrer","MANAGER":"TREINADOR","Age":"Idade","Career appointments":"Cargos na carreira","Recorded trophies":"Troféus registados","LATEST SCORES":"ÚLTIMOS RESULTADOS","Recent results":"Resultados recentes","Club top scorers":"Marcadores do clube","Club top assists":"Assistências do clube","FIRST TEAM":"EQUIPA PRINCIPAL","Current squad":"Plantel atual","AVAILABILITY":"DISPONIBILIDADE","Injuries & suspensions":"Lesões e suspensões","TRANSFER CENTRE":"CENTRO DE TRANSFERÊNCIAS","Recent transfers":"Transferências recentes","Prediction":"Previsão","Advice":"Conselho","Home chance":"Hipótese da casa","Draw chance":"Hipótese de empate","Away chance":"Hipótese visitante","CLUB HISTORY":"HISTÓRIA DO CLUBE","Records":"Recordes","Head-to-head matches":"Confrontos diretos","Player trophies":"Troféus dos jogadores","Manager trophies":"Troféus do treinador","Supporters around the world":"Apoiantes em todo o mundo","Latest supporters":"Apoiantes recentes","All supporters":"Todos os apoiantes","Total supporters":"Total de apoiantes","Countries supporting":"Países representados","Settings & diagnostics":"Definições e diagnóstico","Competition":"Competição","Diagnostics":"Diagnóstico","Configured competitions":"Competições configuradas","Panel build":"Versão do painel","No fixtures available.":"Não há jogos disponíveis.","No recent results available.":"Não há resultados recentes.","No transfer data available.":"Não há dados de transferências.","No current injuries supplied.":"Não há lesões atuais.","Squad information is not available yet.":"O plantel ainda não está disponível."},
      tr:{"YOUR MATCHDAY STARTS HERE":"MAÇ GÜNÜN BURADA BAŞLIYOR","Next fixture":"Sıradaki maç","Live centre":"Canlı merkez","Latest result":"Son sonuç","Season":"Sezon","Total fixtures":"Toplam maç","League table":"Puan durumu","Top scorers":"Gol krallığı","Top assists":"Asist krallığı","CURRENT STANDINGS":"GÜNCEL PUAN DURUMU","Current live feed":"Güncel canlı yayın","Supported team":"Desteklenen takım","Choose a team":"Takım seç","No live matches right now.":"Şu anda canlı maç yok.","MATCH SCHEDULE":"MAÇ PROGRAMI","Upcoming fixtures":"Yaklaşan maçlar","Show fixtures for":"Maçları göster","Next 6 fixtures":"Sıradaki 6 maç","COMPLETED MATCHES":"TAMAMLANAN MAÇLAR","No results available yet.":"Henüz sonuç yok.","PLAYER LEADERBOARDS":"OYUNCU SIRALAMALARI","Player data is not available yet.":"Oyuncu verileri henüz mevcut değil.","YOUR TEAM CENTRE":"TAKIM MERKEZİN","CLUB PROFILE":"KULÜP PROFİLİ","HOME GROUND":"STADYUM","Club code":"Kulüp kodu","Founded":"Kuruluş","City":"Şehir","Capacity":"Kapasite","Surface":"Zemin","LEAGUE POSITION":"LİG SIRASI","Played":"Oynanan","Goal difference":"Averaj","Points":"Puan","NEXT MATCH":"SIRADAKİ MAÇ","SEASON RECORD":"SEZON KARNESİ","Club statistics":"Kulüp istatistikleri","Wins":"Galibiyet","Draws":"Beraberlik","Defeats":"Mağlubiyet","Goals scored":"Atılan gol","Clean sheets":"Gol yemeden","MANAGER":"TEKNİK DİREKTÖR","Age":"Yaş","Career appointments":"Kariyer görevleri","Recorded trophies":"Kayıtlı kupalar","LATEST SCORES":"SON SONUÇLAR","Recent results":"Son sonuçlar","Club top scorers":"Kulüp golcüleri","Club top assists":"Kulüp asistleri","FIRST TEAM":"A TAKIM","Current squad":"Güncel kadro","AVAILABILITY":"UYGUNLUK","Injuries & suspensions":"Sakatlıklar ve cezalar","TRANSFER CENTRE":"TRANSFER MERKEZİ","Recent transfers":"Son transferler","Prediction":"Tahmin","Advice":"Öneri","Home chance":"Ev sahibi şansı","Draw chance":"Beraberlik şansı","Away chance":"Deplasman şansı","CLUB HISTORY":"KULÜP TARİHİ","Records":"Rekorlar","Head-to-head matches":"İkili rekabet","Player trophies":"Oyuncu kupaları","Manager trophies":"Teknik direktör kupaları","Supporters around the world":"Dünyadaki destekçiler","Latest supporters":"Son destekçiler","All supporters":"Tüm destekçiler","Total supporters":"Toplam destekçi","Countries supporting":"Destek veren ülkeler","Settings & diagnostics":"Ayarlar ve tanılama","Competition":"Organizasyon","Diagnostics":"Tanılama","Configured competitions":"Yapılandırılan organizasyonlar","Panel build":"Panel sürümü","No fixtures available.":"Maç bulunmuyor.","No recent results available.":"Sonuç bulunmuyor.","No transfer data available.":"Transfer verisi yok.","No current injuries supplied.":"Güncel sakatlık bildirilmedi.","Squad information is not available yet.":"Kadro bilgisi henüz mevcut değil."},
    };
    const supporterTranslations = {
      es:{"COMMUNITY SUPPORT":"APOYO DE LA COMUNIDAD","Supporters":"Seguidores","HELP BUILD THE FUTURE":"AYUDA A CONSTRUIR EL FUTURO","Support Football Hub":"Apoya Football Hub","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Este proyecto comenzó como un panel personal de fútbol para Home Assistant y ha crecido gracias a los comentarios, las pruebas, las ideas y el apoyo de la comunidad.","Support via Ko-fi":"Apoyar mediante Ko-fi","Support via PayPal":"Apoyar mediante PayPal","Thank you":"Gracias","Every contribution helps":"Cada contribución ayuda","Live data costs":"Costes de datos en directo","Helps cover reliable football data and matchday services.":"Ayuda a cubrir datos de fútbol fiables y servicios de jornada.","Fixes & improvements":"Correcciones y mejoras","Supports testing, maintenance and regular updates.":"Apoya las pruebas, el mantenimiento y las actualizaciones periódicas.","Future features":"Funciones futuras","Helps build more competitions, statistics and dashboard tools.":"Ayuda a crear más competiciones, estadísticas y herramientas para el panel.","Community development":"Desarrollo comunitario","Keeps the project community-led and available to Home Assistant users.":"Mantiene el proyecto dirigido por la comunidad y disponible para los usuarios de Home Assistant.","PREMIUM SUPPORTERS":"SEGUIDORES PREMIUM","Extra recognition inside Football Hub":"Reconocimiento adicional dentro de Football Hub","Premium profile":"Perfil premium","Name & country flag":"Nombre y bandera del país","Personal message":"Mensaje personal","LATEST THANK YOUS":"ÚLTIMOS AGRADECIMIENTOS","THE COMMUNITY":"LA COMUNIDAD","To be added as a supporter":"Para aparecer como seguidor","After donating, include your name, country and optional short message.":"Después de donar, incluye tu nombre, país y un mensaje breve opcional.","Support the project and have your name added here as a thank you.":"Apoya el proyecto y añadiremos tu nombre aquí como agradecimiento.","No supporters loaded yet":"Todavía no hay seguidores cargados"},
      de:{"COMMUNITY SUPPORT":"COMMUNITY-UNTERSTÜTZUNG","Supporters":"Unterstützer","HELP BUILD THE FUTURE":"HILF, DIE ZUKUNFT ZU GESTALTEN","Support Football Hub":"Football Hub unterstützen","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Dieses Projekt begann als persönliches Home-Assistant-Fußball-Dashboard und ist dank Feedback, Tests, Ideen und Unterstützung der Community gewachsen.","Support via Ko-fi":"Über Ko-fi unterstützen","Support via PayPal":"Über PayPal unterstützen","Thank you":"Danke","Every contribution helps":"Jeder Beitrag hilft","Live data costs":"Kosten für Live-Daten","Helps cover reliable football data and matchday services.":"Hilft, zuverlässige Fußballdaten und Spieltagsdienste zu finanzieren.","Fixes & improvements":"Korrekturen und Verbesserungen","Supports testing, maintenance and regular updates.":"Unterstützt Tests, Wartung und regelmäßige Updates.","Future features":"Zukünftige Funktionen","Helps build more competitions, statistics and dashboard tools.":"Hilft beim Ausbau von Wettbewerben, Statistiken und Dashboard-Werkzeugen.","Community development":"Community-Entwicklung","Keeps the project community-led and available to Home Assistant users.":"Hält das Projekt communitygeführt und für Home-Assistant-Nutzer verfügbar.","PREMIUM SUPPORTERS":"PREMIUM-UNTERSTÜTZER","Extra recognition inside Football Hub":"Zusätzliche Anerkennung in Football Hub","Premium profile":"Premium-Profil","Name & country flag":"Name und Landesflagge","Personal message":"Persönliche Nachricht","LATEST THANK YOUS":"NEUESTE DANKSAGUNGEN","THE COMMUNITY":"DIE COMMUNITY","To be added as a supporter":"Als Unterstützer aufgenommen werden","After donating, include your name, country and optional short message.":"Gib nach der Spende deinen Namen, dein Land und optional eine kurze Nachricht an."},
      fr:{"COMMUNITY SUPPORT":"SOUTIEN DE LA COMMUNAUTÉ","Supporters":"Supporters","HELP BUILD THE FUTURE":"AIDEZ À CONSTRUIRE L’AVENIR","Support Football Hub":"Soutenir Football Hub","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Ce projet a commencé comme un tableau de bord de football personnel pour Home Assistant et a grandi grâce aux retours, tests, idées et soutien de la communauté.","Support via Ko-fi":"Soutenir via Ko-fi","Support via PayPal":"Soutenir via PayPal","Thank you":"Merci","Every contribution helps":"Chaque contribution compte","Live data costs":"Coûts des données en direct","Helps cover reliable football data and matchday services.":"Aide à financer des données fiables et les services de jour de match.","Fixes & improvements":"Corrections et améliorations","Supports testing, maintenance and regular updates.":"Soutient les tests, la maintenance et les mises à jour régulières.","Future features":"Fonctions futures","Helps build more competitions, statistics and dashboard tools.":"Aide à créer davantage de compétitions, statistiques et outils.","Community development":"Développement communautaire","Keeps the project community-led and available to Home Assistant users.":"Maintient le projet dirigé par la communauté et disponible pour les utilisateurs de Home Assistant.","PREMIUM SUPPORTERS":"SUPPORTERS PREMIUM","Extra recognition inside Football Hub":"Reconnaissance supplémentaire dans Football Hub","Premium profile":"Profil premium","Name & country flag":"Nom et drapeau du pays","Personal message":"Message personnel","LATEST THANK YOUS":"DERNIERS REMERCIEMENTS","THE COMMUNITY":"LA COMMUNAUTÉ","To be added as a supporter":"Pour être ajouté comme supporter","After donating, include your name, country and optional short message.":"Après votre don, indiquez votre nom, votre pays et un court message facultatif."},
      it:{"COMMUNITY SUPPORT":"SUPPORTO DELLA COMUNITÀ","Supporters":"Sostenitori","HELP BUILD THE FUTURE":"AIUTA A COSTRUIRE IL FUTURO","Support Football Hub":"Sostieni Football Hub","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Questo progetto è nato come dashboard personale di calcio per Home Assistant ed è cresciuto grazie a feedback, test, idee e supporto della comunità.","Support via Ko-fi":"Sostieni con Ko-fi","Support via PayPal":"Sostieni con PayPal","Thank you":"Grazie","Every contribution helps":"Ogni contributo aiuta","Live data costs":"Costi dei dati live","Helps cover reliable football data and matchday services.":"Aiuta a coprire dati calcistici affidabili e servizi partita.","Fixes & improvements":"Correzioni e miglioramenti","Supports testing, maintenance and regular updates.":"Supporta test, manutenzione e aggiornamenti regolari.","Future features":"Funzioni future","Helps build more competitions, statistics and dashboard tools.":"Aiuta a creare più competizioni, statistiche e strumenti.","Community development":"Sviluppo della comunità","Keeps the project community-led and available to Home Assistant users.":"Mantiene il progetto guidato dalla comunità e disponibile per gli utenti Home Assistant.","PREMIUM SUPPORTERS":"SOSTENITORI PREMIUM","Extra recognition inside Football Hub":"Riconoscimento extra in Football Hub","Premium profile":"Profilo premium","Name & country flag":"Nome e bandiera","Personal message":"Messaggio personale","LATEST THANK YOUS":"ULTIMI RINGRAZIAMENTI","THE COMMUNITY":"LA COMUNITÀ","To be added as a supporter":"Per essere aggiunto come sostenitore","After donating, include your name, country and optional short message.":"Dopo la donazione, indica nome, paese e un breve messaggio facoltativo."},
      nl:{"COMMUNITY SUPPORT":"COMMUNITYSTEUN","Supporters":"Supporters","HELP BUILD THE FUTURE":"HELP DE TOEKOMST BOUWEN","Support Football Hub":"Steun Football Hub","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Dit project begon als een persoonlijk Home Assistant-voetbaldashboard en groeide dankzij feedback, tests, ideeën en steun van de community.","Support via Ko-fi":"Steun via Ko-fi","Support via PayPal":"Steun via PayPal","Thank you":"Bedankt","Every contribution helps":"Elke bijdrage helpt","Live data costs":"Kosten voor livegegevens","Helps cover reliable football data and matchday services.":"Helpt betrouwbare voetbalgegevens en wedstrijddiensten te betalen.","Fixes & improvements":"Oplossingen en verbeteringen","Supports testing, maintenance and regular updates.":"Ondersteunt tests, onderhoud en regelmatige updates.","Future features":"Toekomstige functies","Helps build more competitions, statistics and dashboard tools.":"Helpt meer competities, statistieken en hulpmiddelen te bouwen.","Community development":"Communityontwikkeling","Keeps the project community-led and available to Home Assistant users.":"Houdt het project communitygestuurd en beschikbaar voor Home Assistant-gebruikers.","PREMIUM SUPPORTERS":"PREMIUM SUPPORTERS","Extra recognition inside Football Hub":"Extra erkenning in Football Hub","Premium profile":"Premiumprofiel","Name & country flag":"Naam en landenvlag","Personal message":"Persoonlijk bericht","LATEST THANK YOUS":"NIEUWSTE BEDANKJES","THE COMMUNITY":"DE COMMUNITY","To be added as a supporter":"Om als supporter toegevoegd te worden","After donating, include your name, country and optional short message.":"Vermeld na het doneren je naam, land en eventueel een kort bericht."},
      pt:{"COMMUNITY SUPPORT":"APOIO DA COMUNIDADE","Supporters":"Apoiantes","HELP BUILD THE FUTURE":"AJUDE A CONSTRUIR O FUTURO","Support Football Hub":"Apoiar Football Hub","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Este projeto começou como um painel pessoal de futebol para Home Assistant e cresceu graças ao feedback, testes, ideias e apoio da comunidade.","Support via Ko-fi":"Apoiar via Ko-fi","Support via PayPal":"Apoiar via PayPal","Thank you":"Obrigado","Every contribution helps":"Cada contribuição ajuda","Live data costs":"Custos de dados em direto","Helps cover reliable football data and matchday services.":"Ajuda a financiar dados fiáveis e serviços de jogo.","Fixes & improvements":"Correções e melhorias","Supports testing, maintenance and regular updates.":"Apoia testes, manutenção e atualizações regulares.","Future features":"Funcionalidades futuras","Helps build more competitions, statistics and dashboard tools.":"Ajuda a criar mais competições, estatísticas e ferramentas.","Community development":"Desenvolvimento comunitário","Keeps the project community-led and available to Home Assistant users.":"Mantém o projeto liderado pela comunidade e disponível para utilizadores Home Assistant.","PREMIUM SUPPORTERS":"APOIANTES PREMIUM","Extra recognition inside Football Hub":"Reconhecimento adicional no Football Hub","Premium profile":"Perfil premium","Name & country flag":"Nome e bandeira do país","Personal message":"Mensagem pessoal","LATEST THANK YOUS":"AGRADECIMENTOS RECENTES","THE COMMUNITY":"A COMUNIDADE","To be added as a supporter":"Para ser adicionado como apoiante","After donating, include your name, country and optional short message.":"Após doar, indique o seu nome, país e uma mensagem curta opcional."},
      tr:{"COMMUNITY SUPPORT":"TOPLULUK DESTEĞİ","Supporters":"Destekçiler","HELP BUILD THE FUTURE":"GELECEĞİ KURMAYA YARDIM ET","Support Football Hub":"Football Hub’ı destekle","This project started as a personal Home Assistant football dashboard and has grown thanks to community feedback, testing, ideas and support.":"Bu proje kişisel bir Home Assistant futbol paneli olarak başladı ve topluluk geri bildirimi, testleri, fikirleri ve desteğiyle büyüdü.","Support via Ko-fi":"Ko-fi ile destekle","Support via PayPal":"PayPal ile destekle","Thank you":"Teşekkürler","Every contribution helps":"Her katkı yardımcı olur","Live data costs":"Canlı veri maliyetleri","Helps cover reliable football data and matchday services.":"Güvenilir futbol verileri ve maç günü hizmetlerinin maliyetini karşılamaya yardımcı olur.","Fixes & improvements":"Düzeltmeler ve iyileştirmeler","Supports testing, maintenance and regular updates.":"Testleri, bakımı ve düzenli güncellemeleri destekler.","Future features":"Gelecek özellikler","Helps build more competitions, statistics and dashboard tools.":"Daha fazla lig, istatistik ve panel aracı oluşturmaya yardımcı olur.","Community development":"Topluluk geliştirmesi","Keeps the project community-led and available to Home Assistant users.":"Projeyi topluluk odaklı ve Home Assistant kullanıcılarına açık tutar.","PREMIUM SUPPORTERS":"PREMİUM DESTEKÇİLER","Extra recognition inside Football Hub":"Football Hub içinde ek görünürlük","Premium profile":"Premium profil","Name & country flag":"Ad ve ülke bayrağı","Personal message":"Kişisel mesaj","LATEST THANK YOUS":"SON TEŞEKKÜRLER","THE COMMUNITY":"TOPLULUK","To be added as a supporter":"Destekçi olarak eklenmek için","After donating, include your name, country and optional short message.":"Bağıştan sonra adınızı, ülkenizi ve isteğe bağlı kısa mesajınızı belirtin."},
    };
    Object.assign(phrases[this._language] || {}, supporterTranslations[this._language] || {});
    const active = phrases[this._language];
    if (!active) return;
    const walker = document.createTreeWalker(this.shadowRoot, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue || "";
      const trimmed = raw.trim();
      if (active[trimmed]) node.nodeValue = raw.replace(trimmed, active[trimmed]);
    }
  }

  _setCountry(country) {
    this._selectedCountry = country;
    localStorage.setItem("football_hub_selected_country", country);

    const status = this._statusInfo();
    const catalogue = Array.isArray(status.available_competitions)
      ? status.available_competitions
      : [];
    const firstLeague = catalogue
      .filter((item) => item.country === country && (item.type || "league") === "league")
      .sort((a, b) => a.name.localeCompare(b.name))[0];

    if (firstLeague?.key) {
      this._setLeague(firstLeague.key);
    }
    this._render();
  }

  _setLeague(competition) {
    const status = this._statusInfo();
    this._pendingCompetition = competition;
    this._hass?.callService("football_hub", "select_competition", {
      competition,
      entry_id: status.config_entry_id || "",
    }).catch(() => {});
    localStorage.setItem("football_hub_selected_league", competition);
    this._render();
  }

  _setCup(competition) {
    if (!competition) return;
    const status = this._statusInfo();
    this._pendingCup = competition;
    this._hass?.callService("football_hub", "select_cup", {
      competition,
      entry_id: status.config_entry_id || "",
    }).catch(() => { this._pendingCup = ""; this._render(); });
    localStorage.setItem("football_hub_selected_cup", competition);
    this._render();
  }

  _setFixtureTeam(team) {
    this._selectedFixtureTeam = String(team || "");
    localStorage.setItem("football_hub_fixture_team", this._selectedFixtureTeam);
    if (team && team !== "__all__") {
      this._selectedLiveTeam = team;
      localStorage.setItem("football_hub_live_team", team);
      this._hass?.callService("football_hub", "select_live_team", { team }).catch(() => {});
    }
    this._fixturePage = 0;
    this._render();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.shadowRoot.querySelector(".fixture-filter")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  _setFixturePage(page) {
    this._fixturePage = Math.max(0, page);
    this._render();
    this.shadowRoot.querySelector(".page-heading")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  _setLiveMatch(matchId) {
    this._selectedLiveMatch = matchId;
    localStorage.setItem("football_hub_live_match", matchId);
    this._render();
  }

  _setLiveTeam(team) {
    this._selectedLiveTeam = team;
    localStorage.setItem("football_hub_live_team", team);
    this._hass?.callService("football_hub", "select_live_team", { team }).catch(() => {});
    const matches = this._attrs("live_matches").matches || [];
    const index = matches.findIndex((match) => match.home_team === team || match.away_team === team);
    if (index >= 0) {
      const match = matches[index];
      this._selectedLiveMatch = String(match.fixture_id ?? match.id ?? `${match.home_team}-${match.away_team}-${index}`);
      localStorage.setItem("football_hub_live_match", this._selectedLiveMatch);
    }
    this._render();
  }

  _setMyClub(team) {
    this._selectedClub = team;
    localStorage.setItem("football_hub_my_club", team);
    const status = this._statusInfo();
    this._hass?.callService("football_hub", "select_my_club", {
      team,
      entry_id: status.config_entry_id || "",
    }).catch(() => {});
    this._setLiveTeam(team);
    this._render();
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _formatDate(value, includeTime = true) {
    if (!value) return "To be confirmed";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
  }

  _logo(url, name, size = "56") {
    const initials = this._escape((name || "?").slice(0, 2).toUpperCase());
    if (!url) {
      return `<div class="logo-placeholder" style="width:${size}px;height:${size}px">${initials}</div>`;
    }

    return `<div class="logo-placeholder image-fallback" style="width:${size}px;height:${size}px">${initials}<img class="team-logo" style="width:${size}px;height:${size}px" src="${this._escape(url)}" alt="${this._escape(name || "Team")}" loading="lazy" onerror="this.remove()"></div>`;
  }

  _score(value) {
    return value === null || value === undefined ? "–" : this._escape(value);
  }

  _matchCard(match, mode = "fixture") {
    if (!match) return `<div class="empty">No match data available.</div>`;

    const isResult = mode === "result";
    const score = isResult || match.status_short !== "NS"
      ? `<div class="match-score">${this._score(match.home_goals)} <span>–</span> ${this._score(match.away_goals)}</div>`
      : `<div class="match-time">${this._formatDate(match.kickoff)}</div>`;

    return `
      <article class="match-card">
        <div class="match-meta">
          <span>${this._escape(match.round || "Fixture")}</span>
          <span>${this._escape(match.status || match.status_short || "")}</span>
        </div>
        <div class="match-teams">
          <div class="team home">
            ${this._logo(match.home_logo, match.home_team, "46")}
            <strong>${this._escape(match.home_team || "Home")}</strong>
          </div>
          ${score}
          <div class="team away">
            ${this._logo(match.away_logo, match.away_team, "46")}
            <strong>${this._escape(match.away_team || "Away")}</strong>
          </div>
        </div>
        <div class="match-footer">
          <span>${this._escape(match.stadium || "Venue TBC")}</span>
          <span>${this._escape(match.city || "")}</span>
        </div>
      </article>
    `;
  }

  _hero() {
    const status = this._statusInfo();
    const prefixes = this._competitionPrefixes();
    const catalogue = Array.isArray(status.available_competitions)
      ? status.available_competitions
      : [];
    const countries = [...new Set(catalogue.map((item) => item.country).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    if (!countries.includes(this._selectedCountry)) {
      this._selectedCountry = countries.includes(status.country) ? status.country : (countries[0] || "");
    }
    const countryLeagues = catalogue
      .filter((item) => item.country === this._selectedCountry && (item.type || "league") === "league")
      .sort((a, b) => a.name.localeCompare(b.name));
    const pendingLeague = catalogue.find((item) => item.key === this._pendingCompetition);
    const activeCompetition = pendingLeague || {
      name: status.competition,
      country: status.country,
      key: status.competition_key,
    };

    const options = prefixes
      .map((prefix) => {
        const state = this._allStates()[`${prefix}_status`];
        const attrs = state?.attributes || {};
        const label = `${attrs.competition || "Football Hub"} ${attrs.season || ""}`.trim();
        return `<option value="${this._escape(prefix)}" ${
          prefix === this._selectedPrefix ? "selected" : ""
        }>${this._escape(label)}</option>`;
      })
      .join("");

    return `
      <header class="hero">
        <div>
          <button class="panel-back-button" id="panel-back-button" type="button" aria-label="Back" title="Back">
            <ha-icon icon="mdi:arrow-left"></ha-icon><span>Back</span>
          </button>
          <div class="hero-brand">
            <span class="brand-ball"><img src="/football_hub/football-hub-logo.png?v=0.4.0" alt="Football Hub logo"></span>
            <div><div class="eyebrow">YOUR MATCHDAY STARTS HERE</div>
          <h1>Football <span>Hub</span></h1>
          <p>${this._escape(activeCompetition.name || "Choose a competition")} · ${this._escape(
      status.season || ""
    )}</p></div></div>
        </div>
        <div class="hero-actions">
          <label class="view-mode-picker language-picker"><span>${this._t("language")}</span><select id="language-select" aria-label="Language">
            <option value="en" ${this._language === "en" ? "selected" : ""}>English</option><option value="es" ${this._language === "es" ? "selected" : ""}>Español</option><option value="de" ${this._language === "de" ? "selected" : ""}>Deutsch</option><option value="it" ${this._language === "it" ? "selected" : ""}>Italiano</option><option value="fr" ${this._language === "fr" ? "selected" : ""}>Français</option><option value="nl" ${this._language === "nl" ? "selected" : ""}>Nederlands</option><option value="pt" ${this._language === "pt" ? "selected" : ""}>Português</option><option value="tr" ${this._language === "tr" ? "selected" : ""}>Türkçe</option>
          </select></label>
          <label class="view-mode-picker"><span>${this._t("view")}</span><select id="view-mode-select" aria-label="Display mode">
            <option value="desktop" ${this._viewMode === "desktop" ? "selected" : ""}>${this._t("desktop")}</option>
            <option value="tablet" ${this._viewMode === "tablet" ? "selected" : ""}>${this._t("tablet")}</option>
            <option value="mobile" ${this._viewMode === "mobile" ? "selected" : ""}>${this._t("mobile")}</option>
          </select></label>
          ${catalogue.length ? `
            <div class="competition-picker">
              <label><span>${this._t("country")}</span><select id="country-select" aria-label="Country">
                ${countries.map((country) => `<option value="${this._escape(country)}" ${country === this._selectedCountry ? "selected" : ""}>${this._escape(country)}</option>`).join("")}
              </select></label>
              <label><span>${this._t("league")}</span><select id="league-select" aria-label="League">
                ${countryLeagues.map((league) => `<option value="${this._escape(league.key)}" ${league.key === status.competition_key ? "selected" : ""}>${this._escape(league.name)}</option>`).join("")}
              </select></label>
            </div>
          ` : ""}
          ${
            prefixes.length > 1
              ? `<select id="competition-select" aria-label="Competition">${options}</select>`
              : ""
          }
          <a class="header-beer-link" href="https://paypal.me/graffidoodle" target="_blank" rel="noopener noreferrer" title="Buy me a beer" aria-label="Buy me a beer">
            <span class="beer-icon">🍺</span>
          </a>
          <span class="connection ${String(status.state).toLowerCase() === "online" ? "online" : ""}">
            <span class="dot"></span>${this._escape(status.state)}
          </span>
        </div>
      </header>
    `;
  }

  _nav() {
    const liveMatches = this._attrs("live_matches").matches || [];
    const hasLiveMatches = liveMatches.length > 0 || Boolean(this._attrs("live_match").is_live);
    const tabs = [
      ["overview", "mdi:view-dashboard-outline", this._t("overview")],
      ["live", "mdi:access-point", this._t("live")],
      ["my-club", "mdi:shield-star-outline", this._t("myClub")],
      ["fixtures", "mdi:calendar-month-outline", this._t("fixtures")],
      ["results", "mdi:check-decagram-outline", this._t("results")],
      ["table", "mdi:table-large", this._t("table")],
      ["players", "mdi:account-star-outline", this._t("players")],
      ["cups", "mdi:trophy-variant-outline", "Cups"],
      ["news", "mdi:newspaper-variant-outline", "News"],
      ["tv-guide", "mdi:television-guide", "TV Guide"],
      ["transfers", "mdi:swap-horizontal-bold", "Transfers"],
      ["supporters", "mdi:heart-outline", this._t("supporters")],
      ["settings", "mdi:cog-outline", this._t("settings")],
    ];

    return `
      <nav class="tabs">
        ${tabs
          .map(
            ([id, icon, label]) => `
              <button data-tab="${id}" class="${this._activeTab === id ? "active" : ""}">
                <ha-icon icon="${icon}"></ha-icon>
                <span>${label}</span>
                ${id === "live" ? `<i class="nav-live-dot ${hasLiveMatches ? "has-live" : ""}" title="${hasLiveMatches ? "Live matches available" : "No live matches"}"></i>` : ""}
              </button>`
          )
          .join("")}
      </nav>
    `;
  }

  _overview() {
    const defaultNext = this._attrs("next_fixture");
    const last = this._attrs("last_result");
    const table = this._attrs("standings").table || [];
    const scorers = this._attrs("top_scorers").top_scorers || [];
    const fixtures = this._attrs("fixtures").fixtures || [];
    const selectedClub = this._selectedClub;
    const isClubFixture = (match) => Boolean(
      selectedClub && (match.home_team === selectedClub || match.away_team === selectedClub)
    );
    const kickoffTime = (match) => {
      const time = new Date(match?.kickoff || 0).getTime();
      return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
    };
    const orderedFixtures = [...fixtures].sort((left, right) => {
      const timeDifference = kickoffTime(left) - kickoffTime(right);
      if (timeDifference) return timeDifference;
      return Number(isClubFixture(right)) - Number(isClubFixture(left));
    });
    const sameKickoffClubFixture = orderedFixtures.find(
      (match) => isClubFixture(match) && kickoffTime(match) === kickoffTime(defaultNext)
    );
    const next = sameKickoffClubFixture || defaultNext;
    const results = this._attrs("results").latest_5 || [];
    const news = this._attrs("news").items || [];
    const topScorer = scorers[0] || {};
    const topScorerStats = topScorer.statistics?.[0] || {};
    const form = results.slice(0, 5).map((match) => {
      const club = this._selectedClub;
      if (!club) return "D";
      const home = match.home_team === club;
      const gf = Number(home ? match.home_goals : match.away_goals);
      const ga = Number(home ? match.away_goals : match.home_goals);
      return gf > ga ? "W" : gf < ga ? "L" : "D";
    });

    return `
      <section class="dashboard-grid mock-dashboard">
        <article class="feature-card next-card">
          <div class="card-heading">
            <span><ha-icon icon="mdi:calendar-clock"></ha-icon> Next fixture</span>
            <span class="pill">${this._escape(next.round || "Upcoming")}</span>
          </div>
          ${
            next.home_team
              ? `
            <div class="feature-match">
              <div class="feature-team">
                ${this._logo(next.home_logo, next.home_team, "76")}
                <strong>${this._escape(next.home_team)}</strong>
              </div>
              <div class="feature-centre">
                <span class="versus">VS</span>
                <strong>${this._formatDate(next.kickoff)}</strong>
                <small>${this._escape(next.stadium || "Venue TBC")}</small>
              </div>
              <div class="feature-team">
                ${this._logo(next.away_logo, next.away_team, "76")}
                <strong>${this._escape(next.away_team)}</strong>
              </div>
            </div>`
              : `<div class="empty large">No upcoming fixture found.</div>`
          }
        </article>

        <article class="list-card table-preview mock-table">
          <div class="card-heading">
            <span><ha-icon icon="mdi:table-large"></ha-icon> League table (top 4)</span>
            <button class="text-button" data-tab="table">View full table</button>
          </div>
          ${this._tableRows(table.slice(0, 4))}
        </article>

        <article class="stat-card mock-result">
          <div class="card-heading"><span><ha-icon icon="mdi:trophy-outline"></ha-icon> Latest result</span></div>
          ${
            last.home_team
              ? `<div class="latest-result">
                  <span>${this._escape(last.home_team)}</span>
                  <strong>${this._score(last.home_goals)} – ${this._score(last.away_goals)}</strong>
                  <span>${this._escape(last.away_team)}</span>
                </div>
                <small>${this._formatDate(last.kickoff)}</small>`
              : `<div class="empty">No results yet.</div>`
          }
        </article>

        <article class="stat-card mock-form">
          <div class="card-heading"><span><ha-icon icon="mdi:chart-timeline-variant"></ha-icon> Recent form</span></div>
          <div class="form-dots">${form.length ? form.map((value) => `<span class="form-${value.toLowerCase()}">${value}</span>`).join("") : `<small>No recent form</small>`}</div>
          <button class="text-button" data-tab="results">View all results</button>
        </article>

        <article class="stat-card mock-scorer">
          <div class="card-heading"><span><ha-icon icon="mdi:soccer"></ha-icon> Top scorer</span></div>
          <div class="top-scorer-compact">${this._logo(topScorer.player?.photo, topScorer.player?.name, "64")}<span><strong>${this._escape(topScorer.player?.name || "Not available")}</strong><small>${this._escape(topScorerStats.team?.name || "")}</small><b>${this._escape(topScorerStats.goals?.total ?? 0)} goals</b></span></div>
          <button class="text-button" data-tab="players">View all players</button>
        </article>

        <article class="list-card mock-fixtures">
          <div class="card-heading"><span><ha-icon icon="mdi:calendar-month-outline"></ha-icon> Next 3 fixtures</span><button class="text-button" data-tab="fixtures">View full fixtures</button></div>
          <div class="compact-fixtures">${orderedFixtures.slice(0, 3).map((match) => `<div class="${isClubFixture(match) ? "priority-club-fixture" : ""}"><span class="compact-fixture-side home">${this._logo(match.home_logo, match.home_team, "26")}<b>${this._escape(match.home_team)}</b></span><em class="compact-versus">vs</em><span class="compact-fixture-side away">${this._logo(match.away_logo, match.away_team, "26")}<b>${this._escape(match.away_team)}</b></span><time>${this._formatDate(match.kickoff)}</time></div>`).join("") || `<div class="empty">No fixtures available.</div>`}</div>
        </article>

        <article class="list-card mock-news">
          <div class="card-heading"><span><ha-icon icon="mdi:newspaper-variant-outline"></ha-icon> Latest news</span><button class="text-button" data-tab="news">View all news</button></div>
          <div class="compact-news">${news.slice(0, 2).map((item) => `<a href="${this._escape(item.url || "#")}" target="_blank" rel="noopener noreferrer">${item.image ? `<img src="${this._escape(item.image)}" alt="">` : ""}<span><strong>${this._escape(item.title)}</strong><small>${this._formatDate(item.published)}</small></span></a>`).join("") || `<div class="empty">News is loading.</div>`}</div>
        </article>
      </section>
      <section class="overview-beer page-card">
        <span class="overview-beer-icon">🍺</span>
        <div><strong>Enjoying Football Hub?</strong><span>Help support its development and buy me a beer.</span></div>
        <a href="https://paypal.me/graffidoodle" target="_blank" rel="noopener noreferrer">Buy me a beer</a>
      </section>
    `;
  }

  _eventRows(events) {
    if (!events.length) return `<div class="empty">No match events yet.</div>`;
    const eventText = (value) => {
      if (value == null) return "";
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (typeof value !== "object") return "";
      for (const key of ["name", "text", "label", "title", "description", "eventType", "type", "shortName"]) {
        const text = eventText(value[key]);
        if (text) return text;
      }
      return "";
    };
    const orderedEvents = [...events].sort((left, right) => {
      const minute = (event) => {
        const value = event.time?.elapsed ?? event.elapsed ?? event.time ?? 0;
        const match = String(value).match(/\d+/);
        return match ? Number(match[0]) : 0;
      };
      return minute(left) - minute(right);
    });
    return `<div class="event-timeline">${orderedEvents.map((event) => {
      const elapsed = event.time?.elapsed ?? event.elapsed ?? "";
      const extra = event.time?.extra ? `+${event.time.extra}` : "";
      const type = eventText(event.type) || eventText(event.detail) || "Event";
      const detail = eventText(event.detail);
      const player = eventText(event.player) || eventText(event.player_name);
      const team = eventText(event.team) || eventText(event.team_name);
      const minute = Number.parseInt(elapsed, 10);
      const periodLabel = !player && minute === 45 ? "Half-time" :
        !player && minute === 90 ? "Full-time" : "";
      const title = player || periodLabel || detail || type;
      const subtitle = team || (periodLabel ? "" : type);
      const icon = type.toLowerCase().includes("goal") ? "⚽" :
        type.toLowerCase().includes("card") ? (detail.toLowerCase().includes("red") ? "🟥" : "🟨") :
        type.toLowerCase().includes("subst") ? "🔄" : "●";
      return `<div class="event-row">
        <span class="event-minute">${this._escape(elapsed)}${this._escape(extra)}'</span>
        <span class="event-icon">${icon}</span>
        <span class="event-copy"><strong>${this._escape(title)}</strong><small>${this._escape(subtitle)}${eventText(event.assist) ? ` · Assist: ${this._escape(eventText(event.assist))}` : ""}</small></span>
      </div>`;
    }).join("")}</div>`;
  }

  _statRows(statistics, live) {
    if (!statistics.length) return `<div class="empty">Statistics not available yet.</div>`;
    const displayValue = (value) => {
      if (value == null || value === "") return "–";
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (Array.isArray(value)) return value.map(displayValue).filter((item) => item !== "–").join(" / ") || "–";
      if (typeof value === "object") {
        for (const key of ["value", "displayValue", "text", "label", "statValue", "formatted"]) {
          if (value[key] != null) return displayValue(value[key]);
        }
      }
      return "–";
    };
    const teamName = (item) => item.team?.name || item.team || "";
    const home = statistics.find((item) => teamName(item) === live.home_team) || statistics[0] || {};
    const away = statistics.find((item) => teamName(item) === live.away_team) || statistics[1] || {};
    const toRows = (value) => Array.isArray(value) ? value : Object.entries(value || {}).map(([type, statValue]) => ({ type, value: statValue }));
    const homeStats = toRows(home.statistics || home.stats);
    const awayStats = toRows(away.statistics || away.stats);
    if (!homeStats.length) return `<div class="empty">Statistics not available yet.</div>`;
    const numberValue = (value) => {
      const match = displayValue(value).replaceAll(",", "").match(/-?\d+(?:\.\d+)?/);
      return match ? Number(match[0]) : null;
    };
    const statRow = (stat, index) => {
      const awayStat = awayStats.find(
        (item) => item.type === stat.type && (item.group || "All stats") === (stat.group || "All stats")
      ) || awayStats[index] || {};
      const homeDisplay = displayValue(stat.value);
      const awayDisplay = displayValue(awayStat.value);
      const homeNumber = numberValue(stat.value);
      const awayNumber = numberValue(awayStat.value);
      const total = Math.max(0, homeNumber || 0) + Math.max(0, awayNumber || 0);
      const homeWidth = total ? Math.max(4, ((homeNumber || 0) / total) * 100) : 50;
      const awayWidth = total ? Math.max(4, ((awayNumber || 0) / total) * 100) : 50;
      const possession = String(stat.type || "").toLowerCase().includes("possession");
      return `<div class="stat-comparison ${possession ? "possession-comparison" : ""}">
        <div class="stat-values"><strong>${this._escape(homeDisplay)}</strong><span>${this._escape(stat.type || "Statistic")}</span><strong>${this._escape(awayDisplay)}</strong></div>
        ${homeNumber != null && awayNumber != null ? `<div class="stat-bars"><i class="home-bar" style="width:${homeWidth}%"></i><i class="away-bar" style="width:${awayWidth}%"></i></div>` : ""}
      </div>`;
    };
    const groups = [];
    for (const stat of homeStats) {
      const name = stat.group || "All stats";
      let group = groups.find((item) => item.name === name);
      if (!group) {
        group = { name, stats: [] };
        groups.push(group);
      }
      group.stats.push(stat);
    }
    return `<div class="live-stats">
      <div class="stats-team-head"><strong>${this._escape(live.home_team)}</strong><span>Match statistics</span><strong>${this._escape(live.away_team)}</strong></div>
      ${groups.map((group) => `<section class="stat-group"><h3>${this._escape(group.name)}</h3>${group.stats.map((stat) => statRow(stat, homeStats.indexOf(stat))).join("")}</section>`).join("")}
    </div>`;
  }

  _lineupCards(lineups) {
    if (!lineups.length) return `<div class="empty">Line-ups not available yet.</div>`;
    return `<div class="lineup-grid">${lineups.map((lineup) => {
      const starters = lineup.startXI || lineup.start_xi || lineup.starting_xi || [];
      const lineupTeam = lineup.team?.name || lineup.team || "Team";
      const lineupLogo = lineup.team?.logo || lineup.logo;
      return `<div class="team-sheet">
        <div class="team-sheet-head">${this._logo(lineupLogo, lineupTeam, "38")}<span><strong>${this._escape(lineupTeam)}</strong><small>${this._escape(lineup.formation || "Formation TBC")}</small></span></div>
        <div class="starting-xi">${starters.map((entry) => {
          const player = entry.player || entry;
          return `<div><span>${this._escape(player.number ?? "–")}</span><strong>${this._escape(player.name || "Player")}</strong><small>${this._escape(player.pos || player.position || "")}</small></div>`;
        }).join("")}</div>
      </div>`;
    }).join("")}</div>`;
  }

  _liveCompetitionGroups(matches, selectedId = "") {
    const matchId = (match, index = 0) => String(match.fixture_id ?? match.id ?? `${match.home_team}-${match.away_team}-${index}`);
    const groups = new Map();
    matches.forEach((match) => {
      const competition = match.competition || match.league_name || "Other live matches";
      if (!groups.has(competition)) groups.set(competition, []);
      groups.get(competition).push(match);
    });
    if (!groups.size) return `<div class="empty">No live matches right now.</div>`;
    return `<div class="country-live-groups">${[...groups.entries()].map(([competition, games]) => `
      <article class="country-live-group">
        <header><ha-icon icon="mdi:trophy-outline"></ha-icon><strong>${this._escape(competition)}</strong><span>${games.length} live</span></header>
        <div>${games.map((match, index) => {
          const id = matchId(match, index);
          const minuteValue = String(match.elapsed ?? "").replace(/'+$/, "");
          const minute = minuteValue ? `${minuteValue}'` : (match.status_short || "LIVE");
          return `<button class="country-live-row ${id === selectedId ? "active" : ""}" data-live-score="${this._escape(id)}">
            <span class="country-live-minute">${this._escape(minute)}</span>
            <span class="country-live-team home">${this._escape(match.home_team)}${this._logo(match.home_logo, match.home_team, "24")}</span>
            <strong>${this._score(match.home_goals)}<i>–</i>${this._score(match.away_goals)}</strong>
            <span class="country-live-team away">${this._logo(match.away_logo, match.away_team, "24")}${this._escape(match.away_team)}</span>
          </button>`;
        }).join("")}</div>
      </article>`).join("")}</div>`;
  }

  _livePage() {
    const primary = this._attrs("live_match");
    const matches = this._attrs("live_matches").matches || [];
    const leagueTeams = [...new Set((this._attrs("standings").table || [])
      .map((row) => row.team || row.team_name)
      .filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const teamOptions = (selectedTeam = this._selectedLiveTeam) => `
      <div class="live-picker-control">
        <label for="live-team-select">Supported team</label>
        <select id="live-team-select" aria-label="Choose your supported team">
          <option value="">Choose a team</option>
          ${leagueTeams.map((team) => `<option value="${this._escape(team)}" ${team === selectedTeam ? "selected" : ""}>${this._escape(team)}</option>`).join("")}
        </select>
      </div>`;

    if (!primary.is_live) {
      return `
        <section class="page-card live-control-empty">
          <div><span class="live-kicker">⚽ MATCHDAY CONTROL ROOM</span><h2>Live Centre</h2><p>The feed updates automatically when a match begins.</p></div>
          ${teamOptions()}
          <div class="live-count"><strong>0</strong><span>Live now</span></div>
        </section>
        <section class="section">
          <h2>Current live feed</h2>
          <div class="match-list">${matches.length ? matches.map((m) => this._matchCard(m, "result")).join("") : ""}</div>
        </section>
      `;
    }

    const liveMatches = matches.length ? matches : [primary];
    const matchId = (match, index = 0) => String(match.fixture_id ?? match.id ?? `${match.home_team}-${match.away_team}-${index}`);
    const availableIds = liveMatches.map((match, index) => matchId(match, index));
    const selectedTeamMatchIndex = liveMatches.findIndex((match) =>
      match.home_team === this._selectedLiveTeam || match.away_team === this._selectedLiveTeam
    );
    if (!availableIds.includes(this._selectedLiveMatch)) {
      this._selectedLiveMatch = selectedTeamMatchIndex >= 0
        ? availableIds[selectedTeamMatchIndex]
        : (availableIds[0] || "");
    }
    const selectedIndex = Math.max(0, availableIds.indexOf(this._selectedLiveMatch));
    const selectedBasic = liveMatches[selectedIndex] || primary;
    const primaryId = matchId(primary);
    const selectedIsPrimary = this._selectedLiveMatch === primaryId ||
      (selectedBasic.home_team === primary.home_team && selectedBasic.away_team === primary.away_team);
    const live = selectedIsPrimary ? { ...selectedBasic, ...primary } : selectedBasic;
    const events = selectedIsPrimary ? (primary.events || []) : (selectedBasic.events || []);
    const stats = selectedIsPrimary ? (primary.statistics || []) : (selectedBasic.statistics || []);
    const lineups = selectedIsPrimary ? (primary.lineups || []) : (selectedBasic.lineups || []);
    const totalLiveGoals = liveMatches.reduce((total, match) => {
      const home = Number(match.home_goals);
      const away = Number(match.away_goals);
      return total + (Number.isFinite(home) ? home : 0) + (Number.isFinite(away) ? away : 0);
    }, 0);

    return `
      <section class="page-card live-control-hero">
        <div><span class="live-kicker">⚽ MATCHDAY CONTROL ROOM</span><h2>Live Centre <b>LIVE</b></h2><p>Scores, incidents, statistics and team sheets update automatically.</p></div>
        ${teamOptions(this._selectedLiveTeam || live.home_team)}
        <div class="live-control-stats"><div><strong>${liveMatches.length}</strong><span>Live now</span></div><div><strong>${totalLiveGoals}</strong><span>Goals</span></div><div><strong>${events.length}</strong><span>Selected events</span></div></div>
      </section>
      <section class="live-centre-card" id="selected-live-match">
        <div class="live-banner"><span class="pulse"></span> LIVE · ${this._escape(
          live.elapsed ? `${String(live.elapsed).replace(/'+$/, "")}'` : (live.status_short || "")
        )}</div>
        <div class="live-matchup">
          <div class="live-team">
            ${this._logo(live.home_logo, live.home_team, "96")}
            <h2>${this._escape(live.home_team)}</h2>
          </div>
          <div class="score-board">
            <strong>${this._score(live.home_goals)} – ${this._score(live.away_goals)}</strong>
            <span>${this._escape(live.status || "")}</span>
          </div>
          <div class="live-team">
            ${this._logo(live.away_logo, live.away_team, "96")}
            <h2>${this._escape(live.away_team)}</h2>
          </div>
        </div>
        <div class="live-details">
          <span><ha-icon icon="mdi:stadium"></ha-icon>${this._escape(live.stadium || "Venue TBC")}</span>
          ${live.city ? `<span><ha-icon icon="mdi:map-marker-outline"></ha-icon>${this._escape(live.city)}</span>` : ""}
          ${live.capacity ? `<span><ha-icon icon="mdi:account-group-outline"></ha-icon>${this._escape(Number(live.capacity).toLocaleString())} capacity</span>` : ""}
          ${live.surface ? `<span><ha-icon icon="mdi:grass"></ha-icon>${this._escape(live.surface)}</span>` : ""}
          ${live.weather ? `<span><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon>${this._escape(live.weather)}${live.temperature != null ? ` · ${this._escape(live.temperature)}°C` : ""}</span>` : ""}
          <span><ha-icon icon="mdi:account-whistle"></ha-icon>${this._escape(live.referee || "Referee TBC")}</span>
          <span><ha-icon icon="mdi:trophy-outline"></ha-icon>${this._escape(live.round || "")}</span>
        </div>
      </section>

      <section class="live-detail-grid">
        <article class="page-card"><h2>Match timeline</h2>${this._eventRows(events)}</article>
        <article class="page-card"><h2>Statistics</h2>${this._statRows(stats, live)}</article>
        <article class="page-card lineup-panel"><h2>Starting line-ups</h2>${this._lineupCards(lineups)}</article>
      </section>
      <section class="section country-live-section"><div class="page-heading"><div><span class="eyebrow">LIVE AROUND THE WORLD</span><h2>All live scores</h2></div><div class="count-badge">${liveMatches.length} live</div></div>${this._liveCompetitionGroups(liveMatches, this._selectedLiveMatch)}</section>
    `;
  }

  _fixturesPage() {
    const fixtures = this._attrs("fixtures");
    const today = this._attrs("matches_today").matches || [];
    const allFixtures = fixtures.fixtures || fixtures.next_5 || [];
    const standingsTeams = (this._attrs("standings").table || [])
      .map((row) => row.team || row.team_name)
      .filter(Boolean);
    const fixtureTeams = [...new Set(
      allFixtures.flatMap((match) => [match.home_team, match.away_team]).filter(Boolean)
    )];
    const teams = (fixtureTeams.length > 10 ? fixtureTeams : [...new Set([...fixtureTeams, ...standingsTeams])])
      .sort((a, b) => a.localeCompare(b));
    const normaliseTeam = (name) => String(name || "").trim().toLowerCase();
    const filteredFixtures = this._selectedFixtureTeam === "__all__"
      ? allFixtures
      : this._selectedFixtureTeam
      ? allFixtures.filter((match) =>
          normaliseTeam(match.home_team) === normaliseTeam(this._selectedFixtureTeam) ||
          normaliseTeam(match.away_team) === normaliseTeam(this._selectedFixtureTeam)
        )
      : allFixtures.slice(0, 6);
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(filteredFixtures.length / pageSize));
    const currentPage = Math.min(this._fixturePage, totalPages - 1);
    const visibleFixtures = filteredFixtures.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return `
      <section class="page-heading">
        <div><span class="eyebrow">MATCH SCHEDULE</span><h2>Fixtures</h2></div>
        <div class="count-badge">${this._escape(fixtures.total_fixtures || 0)} matches</div>
      </section>
      <div class="fixture-filter">
        <label for="fixture-team-select">Show fixtures for</label>
        <select id="fixture-team-select" aria-label="Choose a team">
          <option value="__all__" ${this._selectedFixtureTeam === "__all__" ? "selected" : ""}>All fixtures (${this._escape(allFixtures.length)})</option>
          <option value="">Next 6 fixtures</option>
          ${teams.map((team) => {
            const gameCount = allFixtures.filter((match) =>
              normaliseTeam(match.home_team) === normaliseTeam(team) ||
              normaliseTeam(match.away_team) === normaliseTeam(team)
            ).length;
            return `<option value="${this._escape(team)}" ${team === this._selectedFixtureTeam ? "selected" : ""}>${this._escape(team)} (${gameCount} games)</option>`;
          }).join("")}
        </select>
      </div>
      ${
        today.length
          ? `<section class="section"><h3>Today</h3><div class="match-list">${today
              .map((m) => this._matchCard(m))
              .join("")}</div></section>`
          : ""
      }
      <section class="section">
        <h3>${this._selectedFixtureTeam === "__all__" ? "All fixtures" : this._selectedFixtureTeam ? `${this._escape(this._selectedFixtureTeam)} fixtures` : "Next fixtures"}</h3>
        <div class="match-list">${visibleFixtures.length ? visibleFixtures.map((m) => this._matchCard(m)).join("") : `<div class="empty">No fixtures available.</div>`}</div>
        ${filteredFixtures.length > pageSize ? `
          <div class="fixture-pagination">
            <button data-fixture-page="${currentPage - 1}" ${currentPage === 0 ? "disabled" : ""}>
              <ha-icon icon="mdi:chevron-left"></ha-icon> Previous
            </button>
            <span>Page ${currentPage + 1} of ${totalPages} · ${filteredFixtures.length} matches</span>
            <button data-fixture-page="${currentPage + 1}" ${currentPage >= totalPages - 1 ? "disabled" : ""}>
              Next <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        ` : ""}
      </section>
    `;
  }

  _resultsPage() {
    const attrs = this._attrs("results");
    const results = attrs.latest_5 || [];

    return `
      <section class="page-heading">
        <div><span class="eyebrow">COMPLETED MATCHES</span><h2>Results</h2></div>
        <div class="count-badge">${this._escape(attrs.total_results || 0)} played</div>
      </section>
      <div class="match-list">${results.length ? results.map((m) => this._matchCard(m, "result")).join("") : `<div class="empty">No results available yet.</div>`}</div>
    `;
  }

  _tableRows(table) {
    if (!table.length) return `<div class="empty">The league table is not available yet.</div>`;

    return `
      <div class="table">
        <div class="table-head"><span>#</span><span>Club</span><span>P</span><span>GD</span><span>Pts</span></div>
        ${table
          .map(
            (row, index) => `
          <div class="table-row ${String(row.team || row.team_name || "").trim().toLowerCase() === String(this._selectedClub || "").trim().toLowerCase() ? "selected-club" : ""}">
            <span>${this._escape(row.rank ?? index + 1)}</span>
            <span class="club">${this._logo(row.team_logo || row.logo, row.team || row.team_name, "28")} ${this._escape(
              row.team || row.team_name || "Team"
            )}</span>
            <span>${this._escape(row.played ?? row.all?.played ?? 0)}</span>
            <span>${this._escape(row.goals_diff ?? row.goal_difference ?? 0)}</span>
            <strong>${this._escape(row.points ?? 0)}</strong>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  _tablePage() {
    const attrs = this._attrs("standings");
    const table = attrs.table || [];

    return `
      <section class="page-heading">
        <div><span class="eyebrow">CURRENT STANDINGS</span><h2>League table</h2></div>
        <div class="count-badge">${this._escape(attrs.total_teams || 0)} teams</div>
      </section>
      <section class="page-card">${this._tableRows(table)}</section>
      ${
        Number(attrs.total_teams || 0) > table.length
          ? `<p class="notice">The sensor currently exposes the first ${table.length} teams. The full table will be connected in the next backend update.</p>`
          : ""
      }
    `;
  }

  _playerRows(players, statKey) {
    if (!players.length) return `<div class="empty">Player data is not available yet.</div>`;

    return `
      <div class="player-list">
        ${players
          .map((item, index) => {
            const player = item.player || {};
            const stats = item.statistics?.[0] || {};
            const goals = stats.goals || {};
            const values = {
              goals: goals.total,
              assists: goals.assists,
              yellow: stats.cards?.yellow,
              red: stats.cards?.red,
              rating: stats.rating,
              appearances: stats.games?.appearences ?? stats.games?.appearances,
              minutes: stats.minutes,
            };
            const value = values[statKey];
            return `
              <div class="player-row">
                <span class="rank">${index + 1}</span>
                ${this._logo(player.photo, player.name, "42")}
                <span class="player-name"><strong>${this._escape(player.name || "Player")}</strong><small>${this._escape(
              stats.team?.name || ""
            )}</small></span>
                <strong class="player-stat">${this._escape(value ?? 0)}</strong>
              </div>`;
          })
          .join("")}
      </div>
    `;
  }

  _playersPage() {
    const scorers = this._attrs("top_scorers").top_scorers || [];
    const assists = this._attrs("top_assists").top_assists || [];
    const leaderboard = (key) => {
      const attrs = this._attrs(key);
      return attrs[key] || attrs.players || [];
    };
    const yellow = leaderboard("top_yellow_cards");
    const red = leaderboard("top_red_cards");
    const ratings = leaderboard("top_ratings");
    const appearances = leaderboard("top_appearances");
    const minutes = leaderboard("top_minutes");

    return `
      <section class="page-heading">
        <div><span class="eyebrow">PLAYER LEADERBOARDS</span><h2>Players</h2></div>
      </section>
      <section class="two-column">
        <article class="page-card"><h2>Top scorers</h2>${this._playerRows(scorers, "goals")}</article>
        <article class="page-card"><h2>Top assists</h2>${this._playerRows(assists, "assists")}</article>
        <article class="page-card"><h2>Top yellow cards</h2>${this._playerRows(yellow, "yellow")}</article>
        <article class="page-card"><h2>Top red cards</h2>${this._playerRows(red, "red")}</article>
        <article class="page-card"><h2>Top ratings</h2>${this._playerRows(ratings, "rating")}</article>
        <article class="page-card"><h2>Most appearances</h2>${this._playerRows(appearances, "appearances")}</article>
        <article class="page-card"><h2>Most minutes played</h2>${this._playerRows(minutes, "minutes")}</article>
      </section>
    `;
  }

  _myClubPage() {
    const club = this._selectedClub;
    const fixtures = this._attrs("fixtures").fixtures || [];
    const resultsAttrs = this._attrs("results");
    const results = resultsAttrs.latest_5 || [];
    const table = this._attrs("standings").table || [];
    const scorers = this._attrs("top_scorers").top_scorers || [];
    const assists = this._attrs("top_assists").top_assists || [];
    const dataset = (key) => this._attrs(key).data ?? [];
    const profileRows = dataset("my_club_profile");
    const profileRecord = Array.isArray(profileRows) ? (profileRows[0] || {}) : profileRows;
    const clubProfile = profileRecord.team || {};
    const venue = profileRecord.venue || {};
    const clubStats = dataset("my_club_statistics") || {};
    const squadRows = dataset("my_club_squad");
    const squadRecord = Array.isArray(squadRows) ? (squadRows[0] || {}) : {};
    const squad = squadRecord.players || [];
    const clubPlayerStats = Array.isArray(dataset("my_club_player_statistics"))
      ? dataset("my_club_player_statistics")
      : [];
    const coaches = Array.isArray(dataset("my_club_coach")) ? dataset("my_club_coach") : [];
    const coach = coaches.find((item) => (item.career || []).some((job) =>
      job.team?.name === club && !job.end
    )) || coaches.sort((a, b) => {
      const latest = (item) => Math.max(0, ...(item.career || []).map((job) => Date.parse(job.start || 0) || 0));
      return latest(b) - latest(a);
    })[0] || {};
    const injuries = Array.isArray(dataset("my_club_injuries")) ? dataset("my_club_injuries") : [];
    const transferPlayers = Array.isArray(dataset("my_club_transfers")) ? dataset("my_club_transfers") : [];
    const transfers = transferPlayers.flatMap((record) => record.transfers
      ? record.transfers.map((movement) => ({
          ...movement,
          player: record.player || {},
          date: movement.date || record.update || "",
        }))
      : [record]
    ).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const predictions = Array.isArray(dataset("my_club_prediction")) ? dataset("my_club_prediction") : [];
    const prediction = predictions[0] || {};
    const headToHead = Array.isArray(dataset("my_club_head_to_head")) ? dataset("my_club_head_to_head") : [];
    const playerTrophies = Array.isArray(dataset("my_club_player_trophies")) ? dataset("my_club_player_trophies") : [];
    const coachTrophies = Array.isArray(dataset("my_club_coach_trophies")) ? dataset("my_club_coach_trophies") : [];
    const sidelined = Array.isArray(dataset("my_club_sidelined")) ? dataset("my_club_sidelined") : [];
    const clubHistory = dataset("my_club_history") || {};
    const clubTrophies = Array.isArray(clubHistory.trophies) ? clubHistory.trophies : [];
    const leagueHistory = Array.isArray(clubHistory.league_history) ? clubHistory.league_history : [];
    const totalTrophies = clubTrophies.reduce((total, item) => total + Number(Array.isArray(item.won) ? item.won[0] : item.won || 0), 0);
    const money = (value) => {
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount <= 0) return "";
      return new Intl.NumberFormat(this._language || "en", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 }).format(amount);
    };
    const teams = [...new Set([
      this._selectedClub,
      ...table.map((row) => row.team || row.team_name),
      ...fixtures.flatMap((match) => [match.home_team, match.away_team]),
    ].filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const clubFixtures = fixtures.filter((match) => match.home_team === club || match.away_team === club);
    const clubResults = results.filter((match) => match.home_team === club || match.away_team === club);
    const standing = table.find((row) => (row.team || row.team_name) === club);
    const clubPlayers = (items) => items.filter((item) =>
      item.statistics?.some((stats) => stats.team?.name === club)
    );
    const playerStatValue = (item, key) => {
      const stats = (item.statistics || []).find((entry) => entry.team?.name === club) || item.statistics?.[0] || {};
      return key === "assists" ? (stats.goals?.assists || 0) : (stats.goals?.total || 0);
    };
    const clubScorers = [...clubPlayerStats].sort((a, b) => playerStatValue(b, "goals") - playerStatValue(a, "goals"));
    const clubAssists = [...clubPlayerStats].sort((a, b) => playerStatValue(b, "assists") - playerStatValue(a, "assists"));

    return `
      <section class="page-heading">
        <div><span class="eyebrow">YOUR TEAM CENTRE</span><h2>${this._t("myClub")}</h2></div>
        ${club ? `<div class="count-badge">${this._escape(club)}</div>` : ""}
      </section>
      <section class="page-card live-picker">
        <div class="live-picker-control">
          <label for="my-club-select">${this._t("chooseClub")}</label>
          <select id="my-club-select" aria-label="Choose your club">
            <option value="">Select a team</option>
            ${teams.map((team) => `<option value="${this._escape(team)}" ${team === club ? "selected" : ""}>${this._escape(team)}</option>`).join("")}
          </select>
        </div>
      </section>
      ${!club ? `<section class="page-card centred"><ha-icon class="huge-icon" icon="mdi:shield-star-outline"></ha-icon><h2>Choose your club</h2><p>Your fixtures, results, league position and players will appear here.</p></section>` : `
        <section class="two-column">
          <article class="page-card club-profile-card">
            <div class="club-profile-head">${this._logo(clubProfile.logo || standing?.team_logo, club, "86")}<div><span class="eyebrow">CLUB PROFILE</span><h2>${this._escape(clubProfile.name || club)}</h2><p>${this._escape(clubProfile.country || this._statusInfo().country || "")} ${clubProfile.founded ? `· Founded ${this._escape(clubProfile.founded)}` : ""}</p></div></div>
            <div class="settings-list"><div><span>Club code</span><strong>${this._escape(clubProfile.code || "—")}</strong></div><div><span>Founded</span><strong>${this._escape(clubProfile.founded || "—")}</strong></div><div><span>Country</span><strong>${this._escape(clubProfile.country || "—")}</strong></div></div>
          </article>
          <article class="page-card venue-card">
            <span class="eyebrow">HOME GROUND</span><h2>${this._escape(venue.name || "Stadium information")}</h2>
            ${venue.image ? `<img class="venue-image" src="${this._escape(venue.image)}" alt="${this._escape(venue.name || "Stadium")}">` : ""}
            <div class="settings-list"><div><span>City</span><strong>${this._escape(venue.city || "—")}</strong></div><div><span>Country</span><strong>${this._escape(venue.country || clubProfile.country || "—")}</strong></div><div><span>Capacity</span><strong>${this._escape(venue.capacity ? Number(venue.capacity).toLocaleString() : "—")}</strong></div><div><span>Opened</span><strong>${this._escape(venue.opened || "—")}</strong></div><div><span>Surface</span><strong>${this._escape(venue.surface || "—")}</strong></div></div>
          </article>
        </section>
        <section class="two-column">
          <article class="page-card"><span class="eyebrow">LEAGUE POSITION</span><h2>${standing ? `${this._escape(standing.rank)} · ${this._escape(club)}` : this._escape(club)}</h2>${standing ? `<div class="settings-list"><div><span>Played</span><strong>${this._escape(standing.played ?? standing.all?.played ?? 0)}</strong></div><div><span>Goal difference</span><strong>${this._escape(standing.goals_diff ?? standing.goal_difference ?? 0)}</strong></div><div><span>Points</span><strong>${this._escape(standing.points ?? 0)}</strong></div></div>` : `<div class="empty">League position is not available yet.</div>`}</article>
          <article class="page-card"><span class="eyebrow">NEXT MATCH</span>${clubFixtures.length ? this._matchCard(clubFixtures[0]) : `<div class="empty">No upcoming fixture available.</div>`}</article>
        </section>
        <section class="two-column">
          <article class="page-card"><span class="eyebrow">SEASON RECORD</span><h2>Club statistics</h2><div class="settings-list"><div><span>Played</span><strong>${this._escape(clubStats.fixtures?.played?.total ?? standing?.played ?? 0)}</strong></div><div><span>Wins</span><strong>${this._escape(clubStats.fixtures?.wins?.total ?? 0)}</strong></div><div><span>Draws</span><strong>${this._escape(clubStats.fixtures?.draws?.total ?? 0)}</strong></div><div><span>Defeats</span><strong>${this._escape(clubStats.fixtures?.loses?.total ?? 0)}</strong></div><div><span>Goals scored</span><strong>${this._escape(clubStats.goals?.for?.total?.total ?? 0)}</strong></div><div><span>Clean sheets</span><strong>${this._escape(clubStats.clean_sheet?.total ?? 0)}</strong></div></div></article>
          <article class="page-card"><span class="eyebrow">MANAGER</span><div class="club-profile-head">${this._logo(coach.photo, coach.name, "72")}<div><h2>${this._escape(coach.name || "Manager unavailable")}</h2><p>${this._escape(coach.nationality || coach.current_season || "")}</p></div></div><div class="settings-list"><div><span>Age</span><strong>${this._escape(coach.age || "—")}</strong></div><div><span>Seasons recorded</span><strong>${this._escape(coach.career?.length || 0)}</strong></div><div><span>Wins</span><strong>${this._escape(coach.wins ?? "—")}</strong></div><div><span>Draws</span><strong>${this._escape(coach.draws ?? "—")}</strong></div><div><span>Losses</span><strong>${this._escape(coach.losses ?? "—")}</strong></div><div><span>Points per game</span><strong>${this._escape(coach.points_per_game ?? "—")}</strong></div></div></article>
        </section>
        <section class="section"><div class="section-title-row"><div><span class="eyebrow">MATCH SCHEDULE</span><h3>Upcoming fixtures</h3></div><span>${clubFixtures.length} matches</span></div><div class="match-list">${clubFixtures.length ? clubFixtures.map((match) => this._matchCard(match)).join("") : `<div class="empty">No fixtures available.</div>`}</div></section>
        <section class="section"><div class="section-title-row"><div><span class="eyebrow">LATEST SCORES</span><h3>Recent results</h3></div></div><div class="match-list">${clubResults.length ? clubResults.map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No recent results available.</div>`}</div></section>
        <section class="two-column">
          <article class="page-card"><h2>Club top scorers</h2>${this._playerRows(clubScorers.length ? clubScorers : clubPlayers(scorers), "goals")}</article>
          <article class="page-card"><h2>Club top assists</h2>${this._playerRows(clubAssists.length ? clubAssists : clubPlayers(assists), "assists")}</article>
        </section>
        <section class="section"><div class="section-title-row"><div><span class="eyebrow">FIRST TEAM</span><h3>Current squad</h3></div><span>${squad.length} players</span></div><div class="squad-grid">${squad.length ? squad.map((player) => `<article class="page-card squad-player">${this._logo(player.photo, player.name, "54")}<div><strong>${this._escape(player.name || "Player")}</strong><small>${this._escape([player.number ? `#${player.number}` : "", player.position, player.nationality].filter(Boolean).join(" · "))}</small><small>${this._escape([player.age ? `Age ${player.age}` : "", player.height ? `${player.height} cm` : "", money(player.transfer_value)].filter(Boolean).join(" · "))}</small>${player.injured ? `<em>Injured${player.expected_return ? ` · ${this._escape(player.expected_return)}` : ""}</em>` : ""}</div></article>`).join("") : `<div class="empty">Squad information is not available yet.</div>`}</div></section>
        <section class="two-column">
          <article class="page-card"><span class="eyebrow">AVAILABILITY</span><h2>Injuries & suspensions</h2><div class="player-list">${injuries.length ? injuries.map((item) => `<div class="player-row">${this._logo(item.player?.photo, item.player?.name, "40")}<span class="player-name"><strong>${this._escape(item.player?.name || "Player")}</strong><small>${this._escape(item.reason || item.type || "Unavailable")}</small></span><strong>${this._escape(item.date || item.fixture?.date?.slice?.(0, 10) || "")}</strong></div>`).join("") : `<div class="empty">No current injuries supplied.</div>`}${sidelined.length ? `<p class="notice">${sidelined.length} additional historical sidelined records available.</p>` : ""}</div></article>
          <article class="page-card"><span class="eyebrow">TRANSFER CENTRE</span><h2>Recent transfers</h2><div class="player-list">${transfers.length ? transfers.slice(0, 10).map((item) => { const fee = item.fee_display || money(item.fee_value) || item.fee || (item.on_loan ? "On loan" : item.type) || "Fee undisclosed"; return `<div class="transfer-row">${this._logo(item.player?.photo, item.player?.name, "40")}<span class="player-name"><strong>${this._escape(item.player?.name || "Player")}</strong><small>${this._escape(`${item.teams?.out?.name || "Unknown"} → ${item.teams?.in?.name || "Unknown"}`)}</small></span><span class="transfer-meta"><strong class="transfer-fee">${this._escape(fee)}</strong><time>${this._escape(String(item.date || "").slice(0, 10))}</time></span></div>`; }).join("") : `<div class="empty">No transfer data available.</div>`}</div></article>
        </section>
        <section class="two-column">
          <article class="page-card"><span class="eyebrow">NEXT MATCH</span><h2>Prediction</h2><div class="settings-list"><div><span>Advice</span><strong>${this._escape(prediction.predictions?.advice || "Not available")}</strong></div><div><span>Home chance</span><strong>${this._escape(prediction.predictions?.percent?.home || "—")}</strong></div><div><span>Draw chance</span><strong>${this._escape(prediction.predictions?.percent?.draw || "—")}</strong></div><div><span>Away chance</span><strong>${this._escape(prediction.predictions?.percent?.away || "—")}</strong></div></div></article>
          <article class="page-card"><span class="eyebrow">CLUB HISTORY</span><h2>Records</h2><div class="settings-list"><div><span>Total trophies</span><strong>${this._escape(totalTrophies)}</strong></div><div><span>Competitions won</span><strong>${this._escape(clubTrophies.filter((item) => Number(Array.isArray(item.won) ? item.won[0] : item.won || 0) > 0).length)}</strong></div><div><span>League seasons recorded</span><strong>${this._escape(leagueHistory.length)}</strong></div><div><span>Head-to-head matches</span><strong>${this._escape(headToHead.length)}</strong></div></div>${clubTrophies.length ? `<div class="trophy-list">${clubTrophies.slice(0, 6).map((item) => { const seasons = String(Array.isArray(item.season_won) ? item.season_won[0] : item.season_won || "").split(",").filter(Boolean); return `<div class="trophy-row"><span><strong>${this._escape(Array.isArray(item.name) ? item.name[0] : item.name || "Competition")}</strong><small>${this._escape(seasons.slice(0, 3).join(", "))}${seasons.length > 3 ? ` +${seasons.length - 3} more` : ""}</small></span><b>${this._escape(Array.isArray(item.won) ? item.won[0] : item.won || 0)}</b></div>`; }).join("")}</div>` : ""}</article>
        </section>
      `}
    `;
  }

  _cupsPage() {
    const status = this._statusInfo();
    const cupData = this._attrs("cup_centre");
    const catalogue = Array.isArray(status.available_competitions)
      ? status.available_competitions.filter((item) => item.type === "cup")
      : [];
    const countries = [...new Set(catalogue.map((item) => item.country).filter(Boolean))]
      .sort((a, b) => a === "Europe" ? -1 : b === "Europe" ? 1 : a.localeCompare(b));
    if (!countries.includes(this._selectedCupCountry)) {
      this._selectedCupCountry = countries.includes(status.country) ? status.country : (countries[0] || "Europe");
    }
    const cups = catalogue
      .filter((item) => item.country === this._selectedCupCountry)
      .sort((a, b) => a.name.localeCompare(b.name));
    const selectedCupKey = this._pendingCup || cupData.competition_key || "";
    const activeCup = catalogue.find((item) => item.key === selectedCupKey);
    const cupDataReady = Boolean(activeCup && cupData.competition_key === activeCup.key && !this._pendingCup);
    const fixtures = cupDataReady && Array.isArray(cupData.fixtures) ? cupData.fixtures : [];
    const results = cupDataReady && Array.isArray(cupData.results) ? cupData.results : [];
    const table = cupDataReady && Array.isArray(cupData.table) ? cupData.table : [];
    const scorers = cupDataReady && Array.isArray(cupData.top_scorers) ? cupData.top_scorers : [];
    let cupContent = `<article class="page-card"><div class="empty">Choose a cup competition to load its data.</div></article>`;
    if (activeCup && !cupDataReady) {
      cupContent = `<article class="page-card"><div class="empty">Loading ${this._escape(activeCup.name)} data…</div></article>`;
    } else if (activeCup && this._cupView === "fixtures") {
      cupContent = `<section class="section"><h2>${this._escape(activeCup.name)} fixtures</h2><div class="match-list">${fixtures.length ? fixtures.map((match) => this._matchCard(match)).join("") : `<div class="empty">No cup fixtures are available yet.</div>`}</div></section>`;
    } else if (activeCup && this._cupView === "results") {
      cupContent = `<section class="section"><h2>${this._escape(activeCup.name)} results</h2><div class="match-list">${results.length ? results.map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No cup results are available yet.</div>`}</div></section>`;
    } else if (activeCup && this._cupView === "table") {
      cupContent = `<section class="page-card cup-table"><h2>${activeCup.has_table ? "Table / phase standings" : "Knockout competition"}</h2>${activeCup.has_table ? this._tableRows(table) : `<div class="empty">This competition uses knockout rounds, so follow it through Fixtures and Results.</div>`}</section>`;
    } else if (activeCup) {
      cupContent = `<section class="dashboard-grid cup-overview"><article class="stat-card"><div class="card-heading"><span>Competition</span></div><div class="big-stat cup-name">${this._escape(activeCup.name)}</div><div class="stat-label">${this._escape(activeCup.country)}</div></article><article class="stat-card"><div class="card-heading"><span>Matches</span></div><div class="big-stat">${fixtures.length + results.length}</div><div class="stat-label">${fixtures.length} upcoming · ${results.length} completed</div></article><article class="list-card cup-fixtures-card"><div class="card-heading"><span>Next fixtures</span><button class="text-button" data-cup-view="fixtures">View all</button></div><div class="match-list">${fixtures.length ? fixtures.slice(0, 3).map((match) => this._matchCard(match)).join("") : `<div class="empty">No upcoming fixtures.</div>`}</div></article><article class="list-card cup-scorers-card"><div class="card-heading"><span>Top scorers</span></div>${this._playerRows(scorers, "goals")}</article></section>`;
    }

    return `
      <section class="page-heading">
        <div><span class="eyebrow">CUP COMPETITIONS</span><h1>Cups</h1><p>Choose a country, then select the cup you want Football Hub to follow.</p></div>
        <span class="pill">${this._escape(catalogue.length)} competitions</span>
      </section>
      <section class="page-card cups-picker">
        <label><span>Country / region</span><select id="cup-country-select" aria-label="Cup country">
          ${countries.map((country) => `<option value="${this._escape(country)}" ${country === this._selectedCupCountry ? "selected" : ""}>${this._escape(country)}</option>`).join("")}
        </select></label>
        <label><span>Competition</span><select id="cup-competition-select" aria-label="Cup competition">
          <option value="">Choose a competition</option>
          ${cups.map((cup) => `<option value="${this._escape(cup.key)}" ${cup.key === selectedCupKey ? "selected" : ""}>${this._escape(cup.name)}</option>`).join("")}
        </select></label>
      </section>
      <section class="cup-grid">
        ${cups.map((cup) => `<article class="page-card cup-card ${cup.key === selectedCupKey ? "active" : ""}">
          <ha-icon icon="mdi:trophy-variant-outline"></ha-icon>
          <div><strong>${this._escape(cup.name)}</strong><span>${cup.has_table ? "League-phase table, fixtures and results" : "Fixtures, results and knockout rounds"}</span></div>
          <button data-cup="${this._escape(cup.key)}">Open</button>
        </article>`).join("") || `<div class="empty">No cup competitions are configured for this country.</div>`}
      </section>
      ${activeCup ? `
        <section class="section cup-data">
          <div class="section-title-row"><div><span class="eyebrow">SELECTED COMPETITION</span><h2>${this._escape(activeCup.name)}</h2></div><span class="pill">${this._escape(activeCup.country)}</span></div>
          <nav class="cup-tabs"><button data-cup-view="overview" class="${this._cupView === "overview" ? "active" : ""}">Overview</button><button data-cup-view="fixtures" class="${this._cupView === "fixtures" ? "active" : ""}">Fixtures</button><button data-cup-view="results" class="${this._cupView === "results" ? "active" : ""}">Results</button><button data-cup-view="table" class="${this._cupView === "table" ? "active" : ""}">Table</button></nav>
          ${cupContent}
          ${false ? `
          ${!cupDataReady ? `<article class="page-card"><div class="empty">Loading ${this._escape(activeCup.name)} data…</div></article>` : ""}
          ${cupDataReady && activeCup.has_table ? `<article class="page-card cup-table"><h2>Table / phase standings</h2>${this._tableRows(table)}</article>` : ""}
          <h3>Upcoming fixtures</h3>
          <div class="match-list">${cupDataReady && fixtures.length ? fixtures.slice(0, 6).map((match) => this._matchCard(match)).join("") : `<div class="empty">Cup fixture data is loading.</div>`}</div>
          <h3>Latest results</h3>
          <div class="match-list">${cupDataReady && results.length ? results.map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No cup results are available yet.</div>`}</div>
          ` : ""}
        </section>
      ` : ""}
    `;
  }

  _newsPage() {
    const items = this._attrs("news").items || [];
    return `
      <section class="page-title"><div><span>Latest stories</span><h1>Football News</h1></div><strong>${items.length} stories</strong></section>
      <section class="news-grid">
        ${items.length ? items.map((item) => `
          <a class="page-card news-card" href="${this._escape(item.url || "#")}" target="_blank" rel="noopener noreferrer">
            ${item.image ? `<img src="${this._escape(item.image)}" alt="" loading="lazy">` : `<div class="news-placeholder"><ha-icon icon="mdi:newspaper-variant-outline"></ha-icon></div>`}
            <div class="news-body">
              <div class="news-source">${item.source_icon ? `<img src="${this._escape(item.source_icon)}" alt="">` : ""}<span>${this._escape(item.source || "Football news")}</span><time>${this._formatDate(item.published)}</time></div>
              <h2>${this._escape(item.title)}</h2>
            </div>
          </a>`).join("") : `<article class="page-card empty">News is loading. It will be stored after the first successful refresh.</article>`}
      </section>`;
  }

  _tvGuidePage() {
    const guide = this._attrs("tv_guide");
    const items = guide.items || [];
    const guideCountry = guide.country || this._statusInfo().country || "England";
    return `
      <section class="page-title"><div><span>${this._escape(guideCountry)} listings</span><h1>TV Guide</h1></div><strong>${items.length} matches</strong></section>
      <section class="portal-list">
        ${items.length ? items.map((item) => `
          <article class="page-card tv-row">
            <div class="tv-time"><strong>${this._formatDate(item.kickoff)}</strong><span>${this._escape(item.competition || "Football")}</span></div>
            <div class="tv-match"><strong>${this._escape(item.home)}</strong><span>vs</span><strong>${this._escape(item.away)}</strong></div>
            <div class="tv-channels">${(item.channels || []).length ? item.channels.map((channel) => `<span>${this._escape(channel)}</span>`).join("") : `<span>Channel to be confirmed</span>`}</div>
          </article>`).join("") : `<article class="page-card empty">No TV listings are available right now.</article>`}
      </section>`;
  }

  _transferMarketPage() {
    const market = this._attrs("transfer_market");
    const view = this._transferView === "top" ? "top" : "latest";
    const items = market[view] || [];
    return `
      <section class="page-title"><div><span>Transfer centre</span><h1>Transfer Market</h1></div><strong>${items.length} moves</strong></section>
      <nav class="cup-tabs transfer-tabs"><button data-transfer-view="latest" class="${view === "latest" ? "active" : ""}">Latest transfers</button><button data-transfer-view="top" class="${view === "top" ? "active" : ""}">Top transfers</button></nav>
      <section class="transfer-market-grid">
        ${items.length ? items.map((item) => `
          <article class="page-card market-transfer">
            ${item.player?.photo ? `<img src="${this._escape(item.player.photo)}" alt="" loading="lazy" onerror="this.style.display='none'">` : `<span class="player-fallback">${this._escape((item.player?.name || "?").slice(0, 2).toUpperCase())}</span>`}
            <div class="market-player"><strong>${this._escape(item.player?.name || "Unknown player")}</strong><span>${this._escape(item.date || item.type || "")}</span></div>
            <div class="market-route"><span>${this._escape(item.from?.name || "Free agent")}</span><ha-icon icon="mdi:arrow-right"></ha-icon><strong>${this._escape(item.to?.name || "Free agent")}</strong></div>
            <strong class="market-fee">${this._escape(item.fee_display || item.type || "Undisclosed")}</strong>
          </article>`).join("") : `<article class="page-card empty">Transfer data is loading.</article>`}
      </section>`;
  }

  _settingsPage() {
    const status = this._statusInfo();
    const prefixes = this._competitionPrefixes();
    const providerMode = String(status.provider_mode || "Unknown")
      .replace(/fotmob/gi, "FM")
      .replace(/espn/gi, "FM");

    return `
      <section class="page-heading">
        <div><span class="eyebrow">FOOTBALL HUB</span><h2>Settings & diagnostics</h2></div>
      </section>
      <section class="two-column">
        <article class="page-card settings-list">
          <h2>Competition</h2>
          <div><span>Name</span><strong>${this._escape(status.competition || "Unknown")}</strong></div>
          <div><span>Season</span><strong>${this._escape(status.season || "Unknown")}</strong></div>
          <div><span>Country</span><strong>${this._escape(status.country || "Unknown")}</strong></div>
          <div><span>Provider mode</span><strong>${this._escape(providerMode)}</strong></div>
        </article>
        <article class="page-card settings-list">
          <h2>Diagnostics</h2>
          <div><span>Integration</span><strong>${this._escape(status.state)}</strong></div>
          <div><span>Configured competitions</span><strong>${prefixes.length}</strong></div>
          <div><span>Panel build</span><strong>${PANEL_VERSION}</strong></div>
          <div><span>Entity prefix</span><strong class="mono">${this._escape(this._selectedPrefix || "None")}</strong></div>
        </article>
      </section>
    `;
  }

  _content() {
    if (!this._selectedPrefix) {
      return `
        <section class="page-card centred">
          <ha-icon class="huge-icon" icon="mdi:soccer"></ha-icon>
          <h2>Football Hub is ready</h2>
          <p>Add and configure the Football Hub integration to populate this panel.</p>
        </section>`;
    }

    switch (this._activeTab) {
      case "live":
        return this._livePage();
      case "fixtures":
        return this._fixturesPage();
      case "results":
        return this._resultsPage();
      case "table":
        return this._tablePage();
      case "players":
        return this._playersPage();
      case "my-club":
        return this._myClubPage();
      case "cups":
        return this._cupsPage();
      case "news":
        return this._newsPage();
      case "tv-guide":
        return this._tvGuidePage();
      case "transfers":
        return this._transferMarketPage();
      case "supporters":
        return this._supportersPage();
      case "settings":
        return this._settingsPage();
      default:
        return this._overview();
    }
  }

  _render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <div class="app-shell view-${this._viewMode}">
        ${this._hero()}
        ${this._nav()}
        <main>${this._content()}</main>
        <footer>Football Hub · Built for Home Assistant</footer>
      </div>
    `;

    this._translateRenderedPage();

    this.shadowRoot.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => this._setTab(button.dataset.tab));
    });

    this.shadowRoot.querySelector("#panel-back-button")?.addEventListener("click", () => {
      this._goBack();
    });

    this.shadowRoot.querySelector("#view-mode-select")?.addEventListener("change", (event) => {
      this._setViewMode(event.target.value);
    });

    this.shadowRoot.querySelector("#language-select")?.addEventListener("change", (event) => {
      this._setLanguage(event.target.value);
    });

    this.shadowRoot.querySelector("#fixture-team-select")?.addEventListener("change", (event) => {
      this._setFixtureTeam(event.target.value);
    });

    this.shadowRoot.querySelectorAll("[data-fixture-page]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!button.disabled) this._setFixturePage(Number(button.dataset.fixturePage));
      });
    });

    this.shadowRoot.querySelector("#live-team-select")?.addEventListener("change", (event) => {
      this._setLiveTeam(event.target.value);
    });

    this.shadowRoot.querySelectorAll("[data-live-score]").forEach((button) => {
      button.addEventListener("click", async () => {
        this._selectedLiveMatch = button.dataset.liveScore;
        localStorage.setItem("football_hub_live_match", this._selectedLiveMatch);
        this._render();
        requestAnimationFrame(() => {
          this.shadowRoot.querySelector("#selected-live-match")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        await this._hass?.callService("football_hub", "select_live_match", {
          fixture_id: this._selectedLiveMatch,
        }).catch(() => {});
      });
    });

    this.shadowRoot.querySelector("#my-club-select")?.addEventListener("change", (event) => {
      this._setMyClub(event.target.value);
    });

    this.shadowRoot.querySelector("#competition-select")?.addEventListener("change", (event) => {
      this._setCompetition(event.target.value);
    });

    this.shadowRoot.querySelector("#country-select")?.addEventListener("change", (event) => {
      this._setCountry(event.target.value);
    });

    this.shadowRoot.querySelector("#league-select")?.addEventListener("change", (event) => {
      this._setLeague(event.target.value);
    });

    this.shadowRoot.querySelector("#cup-country-select")?.addEventListener("change", (event) => {
      this._selectedCupCountry = event.target.value;
      localStorage.setItem("football_hub_cup_country", this._selectedCupCountry);
      this._render();
    });

    this.shadowRoot.querySelector("#cup-competition-select")?.addEventListener("change", (event) => {
      if (event.target.value) this._setCup(event.target.value);
    });

    this.shadowRoot.querySelectorAll("[data-cup]").forEach((button) => {
      button.addEventListener("click", () => this._setCup(button.dataset.cup));
    });

    this.shadowRoot.querySelectorAll("[data-cup-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this._cupView = button.dataset.cupView;
        localStorage.setItem("football_hub_cup_view", this._cupView);
        this._render();
      });
    });

    this.shadowRoot.querySelectorAll("[data-transfer-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this._transferView = button.dataset.transferView;
        localStorage.setItem("football_hub_transfer_view", this._transferView);
        this._render();
      });
    });
  }

  _styles() {
    return `
      :host {
        display: block;
        height: 100vh;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: #00b7ff rgba(2, 12, 23, .82);
        color: #ffffff;
        --primary-text-color: #ffffff;
        --secondary-text-color: rgba(226, 240, 255, .78);
        --fh-purple: #031225;
        --fh-purple-2: #063d66;
        --fh-cyan: #00b7ff;
        --fh-pink: #ff4d4d;
        --fh-surface: rgba(255,255,255,0.08);
        --fh-surface-strong: rgba(255,255,255,0.10);
        --fh-border: rgba(255,255,255,0.14);
        font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
      }
      .club-profile-head { display:flex; align-items:center; gap:18px; margin-bottom:18px; }
      .club-profile-head h2 { margin:4px 0; }

      .news-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
      .news-card { padding:0; overflow:hidden; color:inherit; text-decoration:none; min-width:0; }
      .news-card > img, .news-placeholder { width:100%; aspect-ratio:16/9; object-fit:cover; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.3); }
      .news-placeholder ha-icon { --mdc-icon-size:48px; opacity:.6; }
      .news-body { padding:18px; }
      .news-body h2 { margin:12px 0 2px; font-size:1.05rem; line-height:1.35; }
      .news-source { display:flex; align-items:center; gap:8px; min-width:0; font-size:.72rem; color:var(--secondary-text-color); }
      .news-source img { width:20px; height:20px; object-fit:contain; border-radius:4px; }
      .news-source time { margin-left:auto; text-align:right; }
      .portal-list { display:grid; gap:12px; }
      .tv-row { display:grid; grid-template-columns:220px minmax(260px,1fr) minmax(180px,auto); align-items:center; gap:20px; }
      .tv-time, .tv-match { display:flex; flex-direction:column; gap:5px; }
      .tv-time span, .tv-match span { color:var(--secondary-text-color); font-size:.78rem; }
      .tv-channels { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:7px; }
      .tv-channels span { padding:7px 10px; border:1px solid rgba(49,233,129,.35); border-radius:999px; background:rgba(49,233,129,.08); font-size:.76rem; }
      .transfer-tabs { margin-bottom:18px; }
      .transfer-market-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      .market-transfer { display:grid; grid-template-columns:54px minmax(130px,.8fr) minmax(180px,1.3fr) auto; align-items:center; gap:14px; min-width:0; }
      .market-transfer > img, .player-fallback { width:48px; height:48px; object-fit:contain; border-radius:50%; background:rgba(0,75,43,.8); display:flex; align-items:center; justify-content:center; font-weight:900; }
      .market-player, .market-route { min-width:0; display:flex; flex-direction:column; gap:4px; }
      .market-player span, .market-route span { color:var(--secondary-text-color); font-size:.76rem; overflow-wrap:anywhere; }
      .market-route { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; }
      .market-route ha-icon { --mdc-icon-size:18px; color:var(--fh-cyan); }
      .market-fee { color:var(--fh-cyan); white-space:nowrap; }
      .club-profile-head p { margin:0; color:var(--muted); }
      .venue-image { width:100%; height:170px; object-fit:cover; border-radius:14px; margin:12px 0 16px; border:1px solid var(--line); }
      .squad-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:12px; }
      .squad-player { display:flex; align-items:center; gap:12px; padding:14px; }
      .image-fallback { position:relative; overflow:hidden; flex:0 0 auto; }
      .image-fallback .team-logo { position:absolute; inset:0; background:var(--panel-solid); }
      .squad-player div { display:flex; flex-direction:column; gap:4px; }
      .squad-player small { color:var(--muted); }
      .transfer-row { display:grid; grid-template-columns:44px minmax(0,1fr) auto; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--line); }
      .transfer-row:last-child { border-bottom:0; }
      .transfer-row .player-name { min-width:0; display:flex; flex-direction:column; gap:4px; }
      .transfer-row .player-name strong, .transfer-row .player-name small { overflow-wrap:anywhere; }
      .transfer-row .player-name small { color:var(--muted); }
      .transfer-row .player-name em { color:var(--accent); font-size:12px; font-style:normal; font-weight:800; }
      .transfer-meta { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
      .transfer-fee { color:var(--fh-cyan); font-size:13px; white-space:nowrap; }
      .transfer-row time { white-space:nowrap; font-weight:800; color:var(--text); }
      .table-row.selected-club { border:2px solid var(--accent); border-radius:12px; background:rgba(42, 245, 152, .12); box-shadow:0 0 0 1px rgba(42, 245, 152, .18), 0 0 20px rgba(42, 245, 152, .10); }

      * { box-sizing: border-box; }

      :host::-webkit-scrollbar {
        width: 13px;
      }

      :host::-webkit-scrollbar-track {
        background: rgba(2, 12, 23, .88);
        border-left: 1px solid rgba(255,255,255,.08);
      }

      :host::-webkit-scrollbar-thumb {
        min-height: 54px;
        border: 3px solid rgba(2, 12, 23, .88);
        border-radius: 999px;
        background: linear-gradient(180deg, #46f596, #13bd68);
        box-shadow: 0 0 12px rgba(49,233,129,.28);
      }

      :host::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #72ffb3, #25df7d);
      }

      h1, h2, h3, strong, .big-stat, .match-score, .score-board {
        color: #ffffff;
      }

      h1, h2, h3, .big-stat, .match-score, .score-board strong {
        text-shadow: 0 2px 12px rgba(0,0,0,.55);
      }

      button, select { font: inherit; }

      .app-shell {
        min-height: 100vh;
        background:
          linear-gradient(180deg, rgba(2, 10, 20, .18) 0%, rgba(2, 10, 20, .38) 42%, rgba(2, 10, 20, .56) 100%),
          url("/football_hub/football-hub-background.png?v=0.2.3") center top / cover fixed no-repeat,
          #020b14;
      }

      .hero {
        min-height: 190px;
        padding: 34px clamp(18px, 4vw, 56px) 28px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        color: white;
        background:
          linear-gradient(105deg, rgba(2, 11, 22, .36), rgba(2, 11, 22, .7)),
          transparent;
        position: relative;
        overflow: hidden;
      }

      .hero::after {
        content: "";
        position: absolute;
        width: 390px;
        height: 390px;
        border: 2px solid rgba(255,255,255,.12);
        border-radius: 50%;
        box-shadow: inset 0 0 0 76px rgba(255,255,255,.025);
        right: -40px;
        top: -105px;
      }

      .hero > * { position: relative; z-index: 1; }

      .panel-back-button {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 38px;
        margin: 0 0 12px;
        padding: 7px 12px;
        border: 1px solid rgba(255,255,255,.24);
        border-radius: 999px;
        color: white;
        background: rgba(2,11,22,.58);
        cursor: pointer;
        font-weight: 750;
        transition: border-color .18s ease, background .18s ease, transform .18s ease;
      }

      .panel-back-button:hover {
        border-color: var(--fh-cyan);
        background: rgba(14,229,139,.14);
        transform: translateX(-2px);
      }

      .panel-back-button ha-icon { --mdc-icon-size: 20px; }

      .hero h1 {
        margin: 6px 0;
        font-size: clamp(2rem, 5vw, 4.2rem);
        line-height: .95;
        letter-spacing: -.055em;
        text-transform: uppercase;
      }

      .hero h1 span { color: var(--fh-cyan); }

      .hero p { margin: 10px 0 0; opacity: .78; }

      .eyebrow {
        font-size: .72rem;
        letter-spacing: .18em;
        font-weight: 800;
        opacity: .7;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .header-beer-link {
        display: inline-grid;
        width: 40px;
        height: 40px;
        place-items: center;
        border: 1px solid rgba(255, 214, 72, .45);
        border-radius: 50%;
        color: white;
        background: rgba(255, 193, 7, .12);
        text-decoration: none;
        transition: transform .18s ease, background .18s ease;
      }

      .header-beer-link:hover { transform: translateY(-2px); background: rgba(255, 193, 7, .24); }
      .beer-icon { font-size: 1.25rem; line-height: 1; }

      .competition-picker {
        display: flex;
        align-items: end;
        gap: 9px;
        padding: 7px;
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 15px;
        background: rgba(0,0,0,.2);
      }

      .competition-picker label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .competition-picker label > span {
        padding-left: 4px;
        color: rgba(235,245,255,.68);
        font-size: .58rem;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
      }

      .competition-picker select {
        min-width: 150px;
        max-width: 220px;
        padding-block: 8px;
        color-scheme: dark;
      }

      select {
        border: 1px solid rgba(255,255,255,.18);
        color: white;
        background: rgba(0,0,0,.22);
        border-radius: 12px;
        padding: 10px 34px 10px 12px;
      }

      select option {
        color: #f4f9ff;
        background: #0b1724;
      }

      select option:checked {
        color: #ffffff;
        background: #007bc7;
        font-weight: 900;
      }

      .connection {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(0,0,0,.18);
        border-radius: 999px;
        padding: 9px 13px;
        font-size: .82rem;
        font-weight: 700;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ff6b6b;
      }

      .connection.online .dot {
        background: var(--fh-cyan);
        box-shadow: 0 0 12px var(--fh-cyan);
      }

      .tabs {
        position: sticky;
        top: 0;
        z-index: 10;
        display: flex;
        overflow-x: auto;
        padding: 0 clamp(10px, 3vw, 44px);
        background: color-mix(in srgb, #071a14 94%, transparent);
        backdrop-filter: blur(18px);
        border-bottom: 1px solid var(--fh-border);
        scrollbar-width: none;
      }

      .tabs::-webkit-scrollbar { display: none; }

      .tabs button {
        appearance: none;
        border: 0;
        background: transparent;
        color: rgba(235,245,255,.82);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 17px 16px 14px;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        font-weight: 700;
      }

      .tabs button.active {
        color: white;
        border-bottom-color: var(--fh-cyan);
      }

      main {
        width: min(1500px, 100%);
        margin: 0 auto;
        padding: clamp(18px, 3vw, 40px);
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 18px;
      }

      .overview-beer {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 18px;
      }

      .overview-beer-icon { font-size: 2rem; }
      .overview-beer div { display: flex; flex: 1; flex-direction: column; gap: 4px; }
      .overview-beer div span { color: rgba(235,245,255,.75); }
      .overview-beer a {
        padding: 11px 17px;
        border: 1px solid rgba(255, 214, 72, .5);
        border-radius: 12px;
        color: #fff4b0;
        background: rgba(255, 193, 7, .13);
        font-weight: 800;
        text-decoration: none;
      }

      .feature-card, .stat-card, .list-card, .page-card, .live-centre-card {
        background: rgba(255,255,255,0.08) !important;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 22px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.20);
      }

      .feature-card {
        grid-column: span 8;
        padding: clamp(20px, 3vw, 32px);
      }

      .stat-card {
        grid-column: span 4;
        padding: 22px;
        min-height: 180px;
      }

      .list-card {
        grid-column: span 6;
        padding: 22px;
      }

      .card-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
        font-size: .82rem;
        text-transform: uppercase;
        letter-spacing: .08em;
        font-weight: 800;
        color: rgba(226, 240, 255, .86);
        text-shadow: 0 1px 5px rgba(0,0,0,.65);
      }

      .card-heading > span:first-child {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pill, .count-badge {
        border-radius: 999px;
        padding: 7px 11px;
        background: color-mix(in srgb, var(--fh-purple) 12%, transparent);
        color: color-mix(in srgb, var(--primary-text-color) 86%, var(--fh-purple));
        font-size: .72rem;
        font-weight: 800;
      }

      .live-pill {
        background: rgba(255,61,129,.14);
        color: var(--fh-pink);
      }

      .feature-match {
        display: grid;
        grid-template-columns: 1fr minmax(150px, .8fr) 1fr;
        align-items: center;
        gap: 20px;
      }

      .feature-team, .live-team {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
      }

      .feature-team strong { font-size: clamp(1rem, 2vw, 1.35rem); }

      .feature-centre {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
      }

      .feature-centre strong { font-size: 1.05rem; }

      .feature-centre small, .stat-card small { color: var(--secondary-text-color); }

      .versus {
        font-size: .72rem;
        font-weight: 900;
        color: var(--fh-cyan);
        letter-spacing: .14em;
      }

      .team-logo {
        object-fit: contain;
        filter: drop-shadow(0 8px 8px rgba(0,0,0,.12));
      }

      .logo-placeholder {
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 50%;
        color: white;
        background: linear-gradient(135deg, var(--fh-purple), var(--fh-purple-2));
        font-weight: 900;
      }

      .big-stat {
        font-size: clamp(2.5rem, 5vw, 4rem);
        line-height: 1;
        font-weight: 900;
        letter-spacing: -.06em;
      }

      .stat-label { color: var(--secondary-text-color); margin-top: 7px; }

      .mini-stats {
        display: flex;
        gap: 16px;
        margin-top: 22px;
        color: var(--secondary-text-color);
        font-size: .82rem;
      }

      .mini-stats b { color: var(--primary-text-color); }

      .live-summary.is-live {
        border-color: color-mix(in srgb, var(--fh-pink) 50%, var(--fh-border));
        box-shadow: 0 0 0 1px rgba(255,61,129,.08), 0 16px 38px rgba(255,61,129,.09);
      }

      .live-score, .latest-result {
        font-size: 1.18rem;
        font-weight: 800;
      }

      .live-minute {
        margin-top: 10px;
        color: var(--fh-pink);
        font-size: 1.8rem;
        font-weight: 900;
      }

      .latest-result {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }

      .latest-result span:last-child { text-align: right; }

      .table {
        display: flex;
        flex-direction: column;
      }

      .table-head, .table-row {
        display: grid;
        grid-template-columns: 38px minmax(150px, 1fr) 44px 50px 52px;
        align-items: center;
        gap: 8px;
        min-height: 48px;
      }

      .table-head {
        color: var(--secondary-text-color);
        font-size: .72rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      .table-row {
        border-top: 1px solid var(--fh-border);
      }

      .table-row .club {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        font-weight: 700;
      }

      .text-button {
        border: 0;
        background: transparent;
        color: #42f58d;
        cursor: pointer;
        font-weight: 800;
        text-shadow: 0 1px 6px rgba(0,0,0,.7);
      }

      .player-list { display: flex; flex-direction: column; }

      .player-row {
        display: grid;
        grid-template-columns: 28px 42px minmax(100px, 1fr) 44px;
        align-items: center;
        gap: 12px;
        min-height: 62px;
        border-top: 1px solid var(--fh-border);
      }

      .player-row:first-child { border-top: 0; }

      .rank { color: var(--secondary-text-color); font-weight: 800; }

      .player-name {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .player-name small { color: var(--secondary-text-color); }

      .trophy-list { display:flex; flex-direction:column; margin-top:12px; }
      .trophy-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:16px; padding:12px 0; border-top:1px solid var(--fh-border); }
      .trophy-row span { display:flex; flex-direction:column; min-width:0; gap:4px; }
      .trophy-row strong, .trophy-row small { overflow-wrap:anywhere; }
      .trophy-row small { color:var(--secondary-text-color); }
      .trophy-row b { color:var(--accent); font-size:1.15rem; }

      .player-stat {
        font-size: 1.2rem;
        text-align: right;
      }

      .page-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 22px;
      }

      .page-heading h2 { margin: 4px 0 0; font-size: clamp(2rem, 5vw, 3.4rem); letter-spacing: -.04em; }

      .page-card { padding: clamp(18px, 3vw, 28px); }

      .cups-picker {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 18px;
      }

      .cups-picker label { display: flex; flex-direction: column; gap: 7px; }
      .cups-picker label > span { font-size: .68rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; opacity: .72; }
      .cup-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
      .cup-card { display: flex; align-items: center; gap: 14px; }
      .cup-card.active { border-color: var(--fh-cyan); box-shadow: 0 0 22px rgba(49,233,129,.16); }
      .cup-card > ha-icon { color: #ffd84d; --mdc-icon-size: 30px; }
      .cup-card > div { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; }
      .cup-card > div span { font-size: .75rem; opacity: .7; }
      .cup-card button { border: 1px solid rgba(255,255,255,.2); border-radius: 10px; padding: 9px 12px; color: white; background: rgba(255,255,255,.08); font-weight: 800; cursor: pointer; }
      .cup-tabs { display: flex; gap: 8px; margin: 18px 0; overflow-x: auto; }
      .cup-tabs button { border: 1px solid rgba(255,255,255,.16); border-radius: 12px; padding: 10px 16px; color: rgba(255,255,255,.72); background: rgba(0,0,0,.2); font-weight: 800; cursor: pointer; }
      .cup-tabs button.active { border-color: var(--fh-cyan); color: white; background: rgba(49,233,129,.13); }
      .cup-name { font-size: clamp(1.15rem, 2vw, 1.8rem); line-height: 1.32; letter-spacing: .01em; overflow-wrap: anywhere; }
      .cup-overview > .stat-card { grid-column: span 6; min-height: 190px; }
      .cup-overview > .stat-card .card-heading { margin-bottom: 26px; letter-spacing: .12em; }
      .cup-overview .cup-fixtures-card, .cup-overview .cup-scorers-card { grid-column: span 12; }
      .cup-overview .cup-fixtures-card .match-list { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
      .cup-overview .match-card { min-width: 0; }
      .cup-overview .match-teams { grid-template-columns: minmax(0, 1fr) minmax(72px, auto) minmax(0, 1fr); }
      .cup-overview .team strong { min-width: 0; overflow-wrap: anywhere; line-height: 1.25; }

      .page-card h2 { margin: 0 0 18px; }

      .section { margin-bottom: 30px; }

      .section h3 { margin: 0 0 14px; font-size: 1.3rem; }

      .fixture-filter {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 7px 8px 7px 14px;
        margin: 0 0 24px;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 14px;
        background: rgba(1,10,20,.34);
      }

      .fixture-filter label {
        color: rgba(235,245,255,.78);
        font-size: .78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .fixture-filter select {
        min-width: 220px;
        border-color: rgba(255,255,255,.16);
        background: rgba(2,15,27,.82);
        color: #fff;
        font-weight: 800;
        color-scheme: dark;
        scrollbar-width: thin;
        scrollbar-color: #31e981 #0b1724;
      }

      .fixture-filter select::-webkit-scrollbar {
        width: 12px;
      }

      .fixture-filter select::-webkit-scrollbar-track {
        background: #0b1724;
      }

      .fixture-filter select::-webkit-scrollbar-thumb {
        border: 3px solid #0b1724;
        border-radius: 999px;
        background: #31e981;
      }

      .fixture-filter select::-webkit-scrollbar-thumb:hover {
        background: #72ffb3;
      }

      .fixture-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-top: 24px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 16px;
        background: rgba(1,10,20,.38);
      }

      .fixture-pagination button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 10px;
        padding: 9px 13px;
        color: #fff;
        background: rgba(255,255,255,.1);
        cursor: pointer;
        font-weight: 800;
      }

      .fixture-pagination button:disabled {
        opacity: .35;
        cursor: default;
      }

      .fixture-pagination span {
        color: rgba(235,245,255,.8);
        font-size: .82rem;
        font-weight: 700;
      }

      .match-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 15px;
      }

      .match-card {
        background: rgba(255,255,255,0.08) !important;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 22px;
        padding: 17px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.20);
      }

      .match-meta, .match-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        color: var(--secondary-text-color);
        font-size: .76rem;
      }

      .match-teams {
        display: grid;
        grid-template-columns: 1fr minmax(70px, auto) 1fr;
        align-items: center;
        gap: 12px;
        margin: 18px 0;
      }

      .team {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .team.away { flex-direction: row-reverse; text-align: right; }

      .match-score {
        font-size: 1.45rem;
        font-weight: 900;
        white-space: nowrap;
      }

      .match-score span { color: var(--secondary-text-color); padding: 0 4px; }

      .match-time {
        color: var(--secondary-text-color);
        font-size: .78rem;
        font-weight: 700;
        text-align: center;
      }

      .live-centre-card { padding: clamp(22px, 4vw, 42px); scroll-margin-top: 76px; }

      .live-picker { margin-bottom: 18px; }
      .live-picker-control { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
      .live-picker-control label { color: #86efac; font-size: .76rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
      .live-picker-control select { min-width: min(460px, 70vw); color-scheme: dark; background: rgba(2,15,27,.9); color: #fff; }
      .supported-team-note { margin: 4px 0 0; color: var(--secondary-text-color); }
      .live-score-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 9px; }
      .live-score-strip > div { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; border: 1px solid rgba(255,255,255,.14); border-radius: 12px; padding: 11px; color: #fff; background: rgba(255,255,255,.06); text-align: left; }
      .live-score-strip > div span { color: #86efac; font-size: .68rem; font-weight: 900; }
      .live-score-strip > div strong { font-size: .82rem; }
      .live-score-strip > div.active { border-color: rgba(74,222,128,.72); background: rgba(34,197,94,.16); box-shadow: 0 0 14px rgba(34,197,94,.2); }
      .country-live-section { margin-bottom:22px; }
      .country-live-groups { display:grid; gap:14px; }
      .country-live-group { overflow:hidden; border:1px solid rgba(255,255,255,.14); border-radius:16px; background:rgba(3,14,25,.68); }
      .country-live-group > header { display:flex; align-items:center; gap:9px; min-height:48px; padding:0 16px; background:rgba(255,255,255,.08); }
      .country-live-group > header ha-icon { --mdc-icon-size:20px; color:var(--fh-cyan); }
      .country-live-group > header span { margin-left:auto; color:#86efac; font-size:.7rem; font-weight:900; text-transform:uppercase; }
      .country-live-row { width:100%; display:grid; grid-template-columns:56px minmax(150px,1fr) 76px minmax(150px,1fr); align-items:center; gap:12px; min-height:58px; padding:8px 16px; border:0; border-bottom:1px solid rgba(255,255,255,.1); color:#fff; background:transparent; cursor:pointer; font:inherit; }
      .country-live-row:last-child { border-bottom:0; }
      .country-live-row:hover, .country-live-row.active { background:rgba(49,233,129,.1); }
      .country-live-row.active { box-shadow:inset 3px 0 0 var(--fh-cyan); }
      .country-live-minute { justify-self:start; min-width:38px; padding:5px 7px; border-radius:999px; color:#032117; background:var(--fh-cyan); font-size:.7rem; font-weight:950; text-align:center; }
      .country-live-team { display:flex; align-items:center; gap:9px; min-width:0; font-size:.84rem; font-weight:750; }
      .country-live-team.home { justify-content:flex-end; text-align:right; }
      .country-live-team.away { justify-content:flex-start; text-align:left; }
      .country-live-row > strong { display:flex; justify-content:center; gap:7px; font-size:1rem; }
      .country-live-row > strong i { opacity:.55; font-style:normal; }

      .live-control-hero, .live-control-empty {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 22px;
        margin-bottom: 18px;
        background:
          radial-gradient(circle at 12% 0%, rgba(34,197,94,.28), transparent 35%),
          radial-gradient(circle at 88% 8%, rgba(16,185,129,.22), transparent 32%),
          linear-gradient(135deg, rgba(6,24,20,.9), rgba(6,11,25,.82)) !important;
        border-color: rgba(74,222,128,.34);
        box-shadow: 0 0 22px rgba(34,197,94,.18), inset 0 0 0 1px rgba(255,255,255,.035);
      }

      .live-control-hero h2, .live-control-empty h2 { margin: 5px 0; }
      .live-control-hero p, .live-control-empty p { margin: 5px 0 0; color: var(--secondary-text-color); }
      .live-control-hero > .live-picker-control, .live-control-empty > .live-picker-control {
        flex: 1 1 360px;
        max-width: 520px;
        margin: 0;
      }
      .live-control-hero > .live-picker-control select, .live-control-empty > .live-picker-control select {
        width: 100%;
        min-width: 0;
      }

      .live-kicker {
        color: #86efac;
        font-size: .76rem;
        font-weight: 1000;
        letter-spacing: .14em;
      }

      .live-control-hero h2 b {
        display: inline-block;
        margin-left: 8px;
        padding: 6px 10px;
        border: 1px solid rgba(134,239,172,.78);
        border-radius: 999px;
        color: #ecfdf5;
        background: linear-gradient(135deg, rgba(34,197,94,.92), rgba(16,185,129,.62));
        box-shadow: 0 0 12px rgba(34,197,94,.58), 0 0 26px rgba(34,197,94,.24);
        font-size: .7rem;
        vertical-align: middle;
        animation: wcLivePulse 1.6s ease-in-out infinite;
      }

      @keyframes wcLivePulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(34,197,94,.48), 0 0 24px rgba(34,197,94,.2); }
        50% { transform: scale(1.04); box-shadow: 0 0 18px rgba(34,197,94,.72), 0 0 34px rgba(34,197,94,.32); }
      }

      .live-control-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(74px, 1fr));
        gap: 9px;
      }

      .live-control-stats > div, .live-count {
        min-width: 80px;
        padding: 12px;
        border: 1px solid rgba(134,239,172,.2);
        border-radius: 14px;
        background: rgba(255,255,255,.06);
        text-align: center;
      }

      .live-control-stats strong, .live-count strong { display: block; color: #86efac; font-size: 1.7rem; }
      .live-control-stats span, .live-count span { color: var(--secondary-text-color); font-size: .68rem; text-transform: uppercase; }

      .live-detail-grid {
        display: grid;
        grid-template-columns: .8fr 1.2fr;
        gap: 18px;
        margin-top: 18px;
      }

      .lineup-panel { grid-column: 1 / -1; }

      .event-timeline { display: flex; flex-direction: column; }
      .event-row { display: grid; grid-template-columns: 42px 30px 1fr; align-items: center; gap: 9px; padding: 12px 0; border-top: 1px solid var(--fh-border); }
      .event-row:first-child { border-top: 0; }
      .event-minute { color: #86efac; font-weight: 900; }
      .event-icon { font-size: 1.05rem; text-align: center; }
      .event-copy { display: flex; flex-direction: column; }
      .event-copy small { color: var(--secondary-text-color); }

      .stats-team-head, .stat-values { display: grid; grid-template-columns: 1fr 1.3fr 1fr; align-items: center; gap: 10px; text-align: center; }
      .stats-team-head { padding-bottom: 12px; color: var(--secondary-text-color); }
      .stat-group { margin-top:14px; padding-top:2px; border-top:1px solid rgba(0,183,255,.3); }
      .stat-group h3 { margin:12px 0 8px; color:#fff; font-size:.85rem; text-align:center; text-transform:uppercase; letter-spacing:.08em; }
      .stat-comparison { min-height:48px; padding:9px 0; border-top:1px solid var(--fh-border); }
      .stat-values strong:first-child { text-align:left; }
      .stat-values strong:last-child { text-align:right; }
      .stat-values span { color:var(--secondary-text-color); font-size:.78rem; }
      .stat-bars { display:flex; height:5px; margin-top:7px; overflow:hidden; border-radius:999px; background:rgba(255,255,255,.08); }
      .stat-bars i { display:block; min-width:0; transition:width .25s ease; }
      .stat-bars .home-bar { background:linear-gradient(90deg,#0077d9,#00b7ff); }
      .stat-bars .away-bar { background:linear-gradient(90deg,#806bea,#b79cff); }
      .possession-comparison { padding:14px 0; }
      .possession-comparison .stat-bars { height:12px; border-radius:999px; }

      .lineup-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
      .team-sheet { border: 1px solid var(--fh-border); border-radius: 16px; padding: 15px; background: rgba(255,255,255,.045); }
      .team-sheet-head { display: flex; align-items: center; gap: 11px; margin-bottom: 10px; }
      .team-sheet-head span { display: flex; flex-direction: column; }
      .team-sheet-head small { color: #86efac; }
      .starting-xi > div { display: grid; grid-template-columns: 30px 1fr 35px; gap: 8px; align-items: center; min-height: 38px; border-top: 1px solid var(--fh-border); }
      .starting-xi > div > span { color: #86efac; font-weight: 900; }
      .starting-xi > div > small { color: var(--secondary-text-color); text-align: right; }

      .live-banner {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 9px;
        color: var(--fh-pink);
        font-size: .78rem;
        font-weight: 900;
        letter-spacing: .14em;
      }

      .pulse {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--fh-pink);
        box-shadow: 0 0 0 0 rgba(255,61,129,.5);
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        70% { box-shadow: 0 0 0 10px rgba(255,61,129,0); }
        100% { box-shadow: 0 0 0 0 rgba(255,61,129,0); }
      }

      .live-matchup {
        display: grid;
        grid-template-columns: 1fr minmax(130px, .6fr) 1fr;
        align-items: center;
        gap: 20px;
        margin: 28px 0;
      }

      .live-team h2 { margin: 0; font-size: clamp(1.2rem, 3vw, 2rem); }

      .score-board { text-align: center; }

      .score-board strong {
        display: block;
        font-size: clamp(2.8rem, 8vw, 5.8rem);
        line-height: 1;
        letter-spacing: -.08em;
      }

      .score-board span { color: var(--secondary-text-color); }

      .live-details {
        display: flex;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
        color: var(--secondary-text-color);
        font-size: .82rem;
      }

      .live-details span { display: inline-flex; align-items: center; gap: 7px; }

      .two-column, .three-column {
        display: grid;
        gap: 18px;
        margin-top: 18px;
      }

      .two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .three-column { grid-template-columns: repeat(3, minmax(0, 1fr)); }

      pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        max-height: 480px;
        overflow: auto;
        font-size: .72rem;
        color: var(--secondary-text-color);
      }

      .centred {
        min-height: 330px;
        display: grid;
        place-items: center;
        align-content: center;
        text-align: center;
      }

      .centred h2 { margin: 14px 0 6px; }
      .centred p { color: var(--secondary-text-color); max-width: 500px; }

      .huge-icon { --mdc-icon-size: 74px; color: var(--fh-purple-2); }

      .empty {
        color: rgba(235, 245, 255, .84);
        padding: 18px 0;
        text-shadow: 0 1px 5px rgba(0,0,0,.7);
      }

      .empty.large { padding: 50px 0; text-align: center; }

      .settings-list > div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border-top: 1px solid var(--fh-border);
        padding: 15px 0;
      }

      .settings-list span { color: var(--secondary-text-color); }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .78rem; overflow-wrap: anywhere; }

      .notice {
        color: var(--secondary-text-color);
        text-align: center;
        font-size: .8rem;
      }

      .support-hero {display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:28px;margin-bottom:18px;background:radial-gradient(circle at 10% 0%,rgba(49,233,129,.24),transparent 34%),radial-gradient(circle at 95% 10%,rgba(255,215,0,.18),transparent 32%),linear-gradient(135deg,rgba(5,30,22,.92),rgba(4,12,24,.84)) !important;border-color:rgba(49,233,129,.34)}
      .support-hero h2{margin:7px 0 10px;font-size:clamp(2rem,4vw,3.4rem);letter-spacing:-.04em}.support-hero p,.premium-info p{max-width:760px;color:var(--secondary-text-color);line-height:1.65}.support-kicker{color:#86efac;font-size:.75rem;font-weight:1000;letter-spacing:.14em}.support-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:20px}.support-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:11px 16px;border:1px solid rgba(255,255,255,.2);border-radius:12px;color:#fff;background:rgba(255,255,255,.08);text-decoration:none;font-weight:900}.support-button.primary{color:#04130c;border-color:#31e981;background:linear-gradient(135deg,#52f59c,#24cf76);box-shadow:0 0 20px rgba(49,233,129,.22)}
      .support-thanks{width:190px;min-height:190px;display:grid;place-items:center;align-content:center;text-align:center;border:1px solid rgba(255,215,0,.4);border-radius:50%;background:radial-gradient(circle,rgba(255,215,0,.18),rgba(255,255,255,.045) 60%,transparent 62%);box-shadow:0 0 40px rgba(255,215,0,.12)}.support-thanks strong{color:#ffe27a;font-size:1.45rem}.support-thanks span{width:120px;margin-top:5px;color:var(--secondary-text-color);font-size:.72rem}
      .support-benefits{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:18px}.support-benefits article{display:flex;flex-direction:column;gap:9px}.support-benefits ha-icon{--mdc-icon-size:31px;color:var(--fh-cyan)}.support-benefits span{color:var(--secondary-text-color);font-size:.82rem;line-height:1.45}.premium-info{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:24px;border-color:rgba(255,215,0,.34);background:linear-gradient(135deg,rgba(255,215,0,.11),rgba(255,255,255,.06)) !important}.premium-info h2{margin:6px 0}.premium-features{display:grid;gap:9px;min-width:250px}.premium-features span{padding:10px 12px;border:1px solid rgba(255,215,0,.24);border-radius:11px;background:rgba(0,0,0,.14);font-weight:800}
      .support-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}.support-summary>div{padding:18px;border:1px solid var(--fh-border);border-radius:16px;background:rgba(255,255,255,.045);text-align:center}.support-summary strong{display:block;color:#86efac;font-size:clamp(1.45rem,3vw,2.35rem)}.support-summary span{color:var(--secondary-text-color);font-size:.72rem;text-transform:uppercase;letter-spacing:.07em}.country-support{margin-bottom:24px}.country-support-grid{display:flex;flex-wrap:wrap;gap:9px}.country-support-grid span{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--fh-border);border-radius:999px;background:rgba(255,255,255,.05);color:var(--secondary-text-color);font-size:.8rem}.country-support-grid b{color:#fff}.supporter-flag-image{display:inline-block;width:24px;height:16px;flex:0 0 24px;object-fit:cover;border-radius:2px;box-shadow:0 0 0 1px rgba(255,255,255,.18)}.supporter-avatar-flag{display:block;width:46px;height:28px;object-fit:cover;border-radius:4px}.supporter-country{display:inline-flex;align-items:center}
      .section-title-row{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.section-title-row h3{margin:3px 0 0}.section-title-row>span{color:var(--secondary-text-color);font-size:.8rem}.supporter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.latest-grid{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}.supporter-card{display:grid;grid-template-columns:48px minmax(0,1fr);gap:12px;min-height:112px;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:17px;background:rgba(255,255,255,.075);box-shadow:0 16px 36px rgba(0,0,0,.16)}.supporter-avatar{width:48px;height:48px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.15);border-radius:50%;background:rgba(0,0,0,.18);font-size:1.45rem}.supporter-copy{min-width:0}.supporter-copy>strong{display:block;overflow-wrap:anywhere;font-size:.98rem}.supporter-meta{display:flex;flex-wrap:wrap;gap:6px 11px;margin-top:5px;color:var(--secondary-text-color);font-size:.72rem}.supporter-copy p{margin:10px 0 0;color:rgba(235,245,255,.86);font-size:.78rem;line-height:1.45}.support-how{display:flex;align-items:center;justify-content:center;gap:10px 18px;margin-top:20px;text-align:center}.support-how span{color:var(--secondary-text-color)}
      footer {
        padding: 22px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: .72rem;
      }

      .view-mode-picker { display:flex; flex-direction:column; gap:4px; color:var(--secondary-text-color); font-size:.62rem; font-weight:900; text-transform:uppercase; letter-spacing:.08em; }
      .view-mode-picker select { min-width:104px; min-height:42px; padding:0 34px 0 12px; border:1px solid var(--fh-border); border-radius:12px; background:rgba(2,12,24,.78); color:#fff; font:inherit; font-size:.76rem; text-transform:none; letter-spacing:0; }

      /* World Cup-style remembered tablet mode. */
      .app-shell.view-tablet main { max-width:1180px; padding:18px; }
      .app-shell.view-tablet .hero { min-height:138px; padding:22px 28px; }
      .app-shell.view-tablet .hero h1 { font-size:clamp(2rem,5vw,3.2rem); }
      .app-shell.view-tablet .tabs { overflow-x:auto; justify-content:flex-start; scrollbar-width:thin; }
      .app-shell.view-tablet .tabs button { min-height:58px; padding:0 15px; flex:0 0 auto; }
      .app-shell.view-tablet .two-column { grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      .app-shell.view-tablet .match-list { grid-template-columns:1fr; }
      .app-shell.view-tablet .page-card { padding:18px; }
      .app-shell.view-tablet select, .app-shell.view-tablet button { min-height:44px; }
      .app-shell.view-tablet .squad-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }

      /* World Cup-style remembered mobile mode. */
      .app-shell.view-mobile { max-width:520px; margin:0 auto; }
      .app-shell.view-mobile .hero { min-height:auto; padding:20px 14px; align-items:stretch; flex-direction:column; }
      .app-shell.view-mobile .hero h1 { font-size:2.3rem; }
      .app-shell.view-mobile .hero-actions, .app-shell.view-mobile .competition-picker { width:100%; align-items:stretch; flex-direction:column; }
      .app-shell.view-mobile .hero-actions select, .app-shell.view-mobile .competition-picker select { width:100%; max-width:none; min-height:48px; }
      .app-shell.view-mobile .tabs { position:sticky; top:0; z-index:20; overflow-x:auto; justify-content:flex-start; padding:0 6px; scrollbar-width:none; }
      .app-shell.view-mobile .tabs::-webkit-scrollbar { display:none; }
      .app-shell.view-mobile .tabs button { min-width:58px; min-height:58px; padding:0 14px; flex:0 0 auto; }
      .app-shell.view-mobile .tabs button span { display:none; }
      .app-shell.view-mobile main { padding:12px; }
      .app-shell.view-mobile .dashboard-grid { display:block; }
      .app-shell.view-mobile .cup-overview > .stat-card { grid-column:span 12; }
      .app-shell.view-mobile .dashboard-grid > *, .app-shell.view-mobile .stat-card, .app-shell.view-mobile .feature-card, .app-shell.view-mobile .list-card { margin-bottom:12px; }
      .app-shell.view-mobile .two-column, .app-shell.view-mobile .three-column, .app-shell.view-mobile .match-list, .app-shell.view-mobile .lineup-grid, .app-shell.view-mobile .supporter-grid, .app-shell.view-mobile .support-summary, .app-shell.view-mobile .support-benefits { grid-template-columns:1fr; }
      .app-shell.view-mobile .cup-overview .cup-fixtures-card .match-list { grid-template-columns:1fr; }
      .app-shell.view-mobile .page-card { padding:15px; border-radius:16px; }
      .app-shell.view-mobile .page-heading { align-items:flex-start; flex-direction:column; gap:10px; }
      .app-shell.view-mobile .fixture-filter, .app-shell.view-mobile .live-picker-control, .app-shell.view-mobile .premium-info { align-items:stretch; flex-direction:column; }
      .app-shell.view-mobile .live-control-hero > .live-picker-control, .app-shell.view-mobile .live-control-empty > .live-picker-control { flex:none; width:100%; max-width:none; }
      .app-shell.view-mobile .fixture-filter select, .app-shell.view-mobile .live-picker-control select { width:100%; min-width:0; min-height:48px; }
      .app-shell.view-mobile .feature-match, .app-shell.view-mobile .live-matchup { grid-template-columns:1fr 76px 1fr; gap:6px; }
      .app-shell.view-mobile .score-board strong { font-size:2.25rem; }
      .app-shell.view-mobile .table { overflow-x:auto; }
      .app-shell.view-mobile .table-head, .app-shell.view-mobile .table-row { min-width:470px; }
      .app-shell.view-mobile .squad-grid { grid-template-columns:1fr; }
      .app-shell.view-mobile .club-profile-head { align-items:flex-start; }
      .app-shell.view-mobile .transfer-row { grid-template-columns:42px minmax(0,1fr); }
      .app-shell.view-mobile .transfer-meta { grid-column:2; align-items:flex-start; }
      .app-shell.view-mobile .fixture-pagination { flex-wrap:wrap; }

      @media (min-width:701px) and (max-width:1100px) {
        .app-shell.view-desktop main { padding:18px; }
        .app-shell.view-desktop .hero { padding:22px 26px; }
        .app-shell.view-desktop .tabs { overflow-x:auto; justify-content:flex-start; }
        .app-shell.view-desktop .tabs button { flex:0 0 auto; }
        .app-shell.view-desktop .two-column { gap:14px; }
        .app-shell.view-desktop .squad-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }

      @media (max-width: 980px) {
        .news-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .transfer-market-grid { grid-template-columns:1fr; }
        .tv-row { grid-template-columns:170px minmax(220px,1fr); }
        .tv-channels { grid-column:1 / -1; justify-content:flex-start; }
        .cup-overview > .stat-card { grid-column: span 12; }
        .feature-card { grid-column: span 12; }
        .stat-card { grid-column: span 6; }
        .list-card { grid-column: span 12; }
        .three-column { grid-template-columns: 1fr; }
        .support-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .supporter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .live-detail-grid { grid-template-columns: 1fr; }
        .lineup-panel { grid-column: auto; }
        .cup-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 700px) {
        .country-live-row { grid-template-columns:44px minmax(0,1fr) 54px; gap:7px; padding:9px 10px; }
        .country-live-team { font-size:.76rem; }
        .country-live-team.home { justify-content:flex-start; text-align:left; }
        .country-live-team.home .image-fallback { order:-1; }
        .country-live-team.away { grid-column:2; }
        .country-live-row > strong { grid-column:3; grid-row:1 / span 2; }
        .country-live-minute { grid-row:1 / span 2; }
        .news-grid { grid-template-columns:1fr; }
        .tv-row { grid-template-columns:1fr; gap:12px; }
        .tv-channels { grid-column:auto; }
        .market-transfer { grid-template-columns:48px minmax(0,1fr) auto; }
        .market-route { grid-column:2 / -1; }
        .hero {
          min-height: 160px;
          padding: 26px 18px 22px;
          align-items: flex-start;
          flex-direction: column;
        }

        .hero-actions { justify-content: flex-start; }
        .overview-beer { align-items: flex-start; flex-wrap: wrap; }
        .overview-beer a { width: 100%; text-align: center; }
        .competition-picker { width: 100%; align-items: stretch; flex-direction: column; }
        .competition-picker select { width: 100%; max-width: none; }
        .cups-picker, .cup-grid { grid-template-columns: 1fr; }

        .tabs button { padding-inline: 13px; }
        .tabs button span { display: none; }

        main { padding: 14px; }

        .fixture-filter {
          display: flex;
          align-items: stretch;
          flex-direction: column;
        }

        .fixture-filter select { min-width: 0; width: 100%; }

        .fixture-pagination { gap: 8px; }
        .fixture-pagination span { font-size: .7rem; text-align: center; }
        .fixture-pagination button { padding: 8px; font-size: .75rem; }

        .stat-card { grid-column: span 12; }
        .feature-match { grid-template-columns: 1fr 95px 1fr; gap: 8px; }
        .feature-team strong { font-size: .85rem; }
        .feature-centre strong { font-size: .78rem; }
        .feature-centre small { display: none; }

        .match-list { grid-template-columns: 1fr; }
        .cup-overview .cup-fixtures-card .match-list { grid-template-columns: 1fr; }
        .two-column { grid-template-columns: 1fr; }
        .support-hero { grid-template-columns: 1fr; }
        .support-thanks { width:150px;min-height:150px;margin:0 auto; }
        .support-benefits, .supporter-grid, .support-summary { grid-template-columns: 1fr; }
        .premium-info { align-items:stretch;flex-direction:column; }
        .premium-features { min-width:0; }
        .support-how { align-items:flex-start;flex-direction:column;text-align:left; }

        .live-matchup { grid-template-columns: 1fr 90px 1fr; gap: 8px; }
        .live-team h2 { font-size: .9rem; }
        .score-board strong { font-size: 2.65rem; }

        .live-control-hero, .live-control-empty { align-items: stretch; flex-direction: column; }
        .live-control-hero > .live-picker-control, .live-control-empty > .live-picker-control { flex:none; width:100%; max-width:none; }
        .live-control-stats { width: 100%; }
        .lineup-grid { grid-template-columns: 1fr; }
        .live-picker-control { align-items: stretch; flex-direction: column; }
        .live-picker-control select { min-width: 0; width: 100%; }

        .table-head, .table-row {
          grid-template-columns: 30px minmax(120px, 1fr) 34px 42px 42px;
          font-size: .78rem;
        }

        .match-teams {
          grid-template-columns: 1fr 74px 1fr;
        }

        .team {
          flex-direction: column;
          text-align: center;
          font-size: .8rem;
        }

        .team.away { flex-direction: column; text-align: center; }
        .match-footer { flex-direction: column; align-items: flex-start; }
        .view-mode-picker { width:100%; }
        .view-mode-picker select { width:100%; }
        .tabs { overflow-x:auto; justify-content:flex-start; scrollbar-width:none; }
        .tabs::-webkit-scrollbar { display:none; }
        .tabs button { min-width:56px; min-height:58px; flex:0 0 auto; }
        .squad-grid { grid-template-columns:1fr; }
        .transfer-row { grid-template-columns:42px minmax(0,1fr); }
        .transfer-meta { grid-column:2; align-items:flex-start; }
      }

      /* Football Hub blue dashboard shell */
      .app-shell.view-desktop {
        display:grid;
        grid-template-columns:174px minmax(0,1fr);
        grid-template-rows:auto 1fr auto;
        min-height:100vh;
        background:
          radial-gradient(circle at 70% 0%, rgba(0,132,255,.16), transparent 32%),
          repeating-linear-gradient(135deg,transparent 0 72px,rgba(0,183,255,.025) 73px 74px,transparent 75px 144px),
          linear-gradient(180deg, rgba(0,8,20,.82), rgba(0,5,14,.94)),
          url("/football_hub/football-hub-background.png?v=0.2.3") center / cover fixed no-repeat,
          #010815;
      }
      .app-shell::before {
        content:"";
        position:fixed;
        z-index:0;
        right:3.5%;
        bottom:4%;
        width:min(520px,42vw);
        aspect-ratio:1.65;
        pointer-events:none;
        opacity:.19;
        border:2px solid #00b7ff;
        border-radius:8px;
        background:
          linear-gradient(90deg,transparent calc(50% - 1px),#00b7ff 50%,transparent calc(50% + 1px)),
          radial-gradient(circle at center,transparent 0 57px,#00b7ff 58px 59px,transparent 60px),
          linear-gradient(90deg,#00b7ff,#00b7ff) left center/17% 48% no-repeat,
          linear-gradient(90deg,#00b7ff,#00b7ff) right center/17% 48% no-repeat,
          radial-gradient(circle at center,rgba(0,183,255,.11),transparent 68%);
        box-shadow:0 0 70px rgba(0,183,255,.16),inset 0 0 45px rgba(0,183,255,.09);
        transform:perspective(700px) rotateX(57deg) rotateZ(-7deg);
        transform-origin:center bottom;
      }
      .app-shell > .hero,
      .app-shell > .tabs,
      .app-shell > main,
      .app-shell > footer { position:relative; z-index:1; }
      .app-shell.view-desktop .hero {
        grid-column:1 / -1;
        min-height:142px;
        padding:16px 26px;
        align-items:center;
        border-bottom:1px solid rgba(0,183,255,.32);
        background:linear-gradient(90deg,rgba(0,8,20,.98),rgba(0,30,63,.72),rgba(0,8,20,.98));
      }
      .app-shell.view-desktop .hero::after { width:230px; height:230px; top:-76px; opacity:.45; }
      .app-shell.view-desktop .hero .eyebrow { display:none; }
      .app-shell.view-desktop .hero h1 { font-size:2.25rem; letter-spacing:-.04em; }
      .app-shell.view-desktop .hero p { margin-top:5px; font-size:.78rem; }
      .hero-brand { display:flex; align-items:center; gap:14px; }
      .app-shell.view-desktop .hero-brand { margin-left:clamp(60px,7vw,130px); }
      .brand-ball { display:grid; width:128px; height:128px; flex:0 0 auto; place-items:center; border:2px solid #00b7ff; border-radius:50%; background:radial-gradient(circle,#122b45,#020914 68%); box-shadow:0 0 28px rgba(0,183,255,.5),inset 0 0 18px rgba(0,183,255,.28); }
      .brand-ball img { width:100%; height:100%; display:block; object-fit:cover; border-radius:50%; }
      .app-shell.view-desktop .panel-back-button { min-width:auto; margin:0 12px 0 0; padding:8px; }
      .app-shell.view-desktop .panel-back-button span { display:none; }
      .app-shell.view-desktop .tabs {
        grid-column:1;
        grid-row:2;
        position:relative;
        top:auto;
        z-index:5;
        display:flex;
        flex-direction:column;
        gap:4px;
        padding:16px 10px;
        overflow:visible;
        border-right:1px solid rgba(0,183,255,.28);
        border-bottom:0;
        background:linear-gradient(180deg,rgba(1,16,34,.78),rgba(0,8,20,.72));
        backdrop-filter:blur(14px);
      }
      .app-shell.view-desktop .tabs button {
        width:100%;
        min-height:42px;
        padding:9px 12px;
        border:1px solid transparent;
        border-radius:7px;
        justify-content:flex-start;
        color:rgba(231,244,255,.84);
      }
      .app-shell.view-desktop .tabs button.active {
        border-color:#00aef3;
        color:#fff;
        background:linear-gradient(90deg,rgba(0,94,190,.76),rgba(0,183,255,.24));
        box-shadow:inset 0 0 18px rgba(0,183,255,.28),0 0 12px rgba(0,128,255,.24);
      }
      .nav-live-dot {
        width:8px;
        height:8px;
        flex:0 0 auto;
        margin-left:auto;
        border-radius:50%;
        background:#ff344b;
        box-shadow:0 0 8px rgba(255,52,75,.62);
      }
      .nav-live-dot.has-live {
        background:#20ee78;
        box-shadow:0 0 5px #20ee78,0 0 13px rgba(32,238,120,.95);
        animation:live-nav-pulse 1.5s ease-in-out infinite;
      }
      @keyframes live-nav-pulse {
        0%,100% { transform:scale(.9); opacity:.8; }
        50% { transform:scale(1.2); opacity:1; }
      }
      .app-shell.view-desktop main {
        grid-column:2;
        grid-row:2;
        width:100%;
        max-width:none;
        padding:14px 16px 20px;
      }
      .app-shell.view-desktop footer { grid-column:2; grid-row:3; }
      .app-shell.view-desktop .feature-card,
      .app-shell.view-desktop .stat-card,
      .app-shell.view-desktop .list-card,
      .app-shell.view-desktop .page-card,
      .app-shell.view-desktop .live-centre-card {
        border-color:rgba(0,126,224,.46);
        border-radius:7px;
        background:linear-gradient(145deg,rgba(2,25,52,.72),rgba(0,9,23,.78)) !important;
        backdrop-filter:blur(7px);
        box-shadow:inset 0 1px rgba(255,255,255,.035),0 10px 28px rgba(0,0,0,.24);
      }
      .app-shell.view-desktop .mock-dashboard { gap:12px; }
      .app-shell.view-desktop .mock-dashboard .feature-card { grid-column:span 7; }
      .app-shell.view-desktop .mock-table { grid-column:span 5; }
      .app-shell.view-desktop .mock-result,
      .app-shell.view-desktop .mock-form,
      .app-shell.view-desktop .mock-scorer { grid-column:span 4; min-height:155px; }
      .app-shell.view-desktop .mock-fixtures { grid-column:span 7; }
      .app-shell.view-desktop .mock-news { grid-column:span 5; }
      .app-shell.view-desktop .card-heading {
        margin:-22px -22px 14px;
        padding:10px 13px;
        border-bottom:1px solid rgba(0,126,224,.28);
        background:rgba(0,44,88,.28);
        text-transform:uppercase;
        font-size:.72rem;
      }
      .form-dots { display:flex; justify-content:center; gap:12px; margin:22px 0; }
      .form-dots span { display:grid; width:34px; height:34px; place-items:center; border-radius:50%; font-weight:900; }
      .form-w { color:#9effbe; border:1px solid #00a84f; background:#064522; }
      .form-d { color:#e3edff; border:1px solid #68798f; background:#344154; }
      .form-l { color:#ffb5bc; border:1px solid #a81f31; background:#50131d; }
      .top-scorer-compact { display:flex; align-items:center; justify-content:center; gap:14px; margin:8px 0 14px; }
      .top-scorer-compact > span { display:flex; flex-direction:column; gap:3px; }
      .top-scorer-compact b { color:var(--fh-cyan); font-size:1.15rem; }
      .compact-fixtures, .compact-news { display:grid; gap:0; }
      .compact-fixtures > div { position:relative; display:grid; grid-template-columns:minmax(0,1fr) 42px minmax(0,1fr); align-items:center; gap:8px; min-height:38px; padding:8px 142px 8px 4px; border-bottom:1px solid rgba(0,126,224,.2); }
      .compact-fixtures > .priority-club-fixture { margin-inline:-6px; padding-inline:10px; border-left:3px solid var(--fh-cyan); background:rgba(0,183,255,.08); }
      .compact-fixture-side { display:flex; align-items:center; gap:8px; min-width:0; }
      .compact-fixture-side.home { justify-content:flex-start; }
      .compact-fixture-side.away { justify-content:flex-start; }
      .compact-fixture-side b { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .compact-versus { color:var(--fh-cyan); font-style:normal; font-size:.7rem; font-weight:900; text-align:center; text-transform:uppercase; }
      .compact-fixtures time { position:absolute; right:4px; width:132px; color:var(--secondary-text-color); font-size:.76rem; text-align:right; white-space:nowrap; }
      .compact-news a { display:flex; gap:10px; padding:8px 2px; color:inherit; text-decoration:none; border-bottom:1px solid rgba(0,126,224,.2); }
      .compact-news img { width:88px; height:48px; object-fit:cover; border-radius:4px; }
      .compact-news a span { display:flex; min-width:0; flex-direction:column; gap:4px; }
      .compact-news small { color:var(--secondary-text-color); }

      @media (max-width:900px) {
        .app-shell.view-desktop { display:block; }
        .app-shell.view-desktop .hero { min-height:auto; }
        .app-shell.view-desktop .hero-brand { margin-left:0; }
        .brand-ball { width:74px; height:74px; }
        .app-shell.view-desktop .panel-back-button { position:static; }
        .app-shell.view-desktop .tabs { position:sticky; top:0; flex-direction:row; overflow-x:auto; border-right:0; border-bottom:1px solid rgba(0,183,255,.28); }
        .app-shell.view-desktop .tabs button { width:auto; min-width:max-content; }
        .app-shell.view-desktop .mock-dashboard > * { grid-column:span 12 !important; }
        .app-shell::before { width:76vw; right:-18vw; bottom:7%; opacity:.075; }
        .compact-fixtures > div { grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr); padding-right:4px; padding-bottom:30px; }
        .compact-fixtures time { right:auto; bottom:6px; left:4px; width:auto; text-align:left; }
        .nav-live-dot { margin-left:2px; }
      }
    `;
  }
}

if (!customElements.get("football-hub-panel")) {
  customElements.define("football-hub-panel", FootballHubPanel);
}
