const PANEL_VERSION = "0.20.21-lms-settlement-email-fix";
const LMS_SHARE_SERVICE = "https://football-hub-lms.zesty-flame-5295.chatgpt.site";
const FULL_COMPETITION_CATALOGUE = {
  England: ["Premier League", "Championship", "League One", "League Two", "National League", "FA Cup", "EFL Cup", "Community Shield"],
  Scotland: ["Scottish Premiership", "Scottish Championship", "Scottish League One", "Scottish League Two", "Highland / Lowland Leagues", "Scottish Cup", "Scottish League Cup"],
  Wales: ["Cymru Premier", "Cymru North", "Cymru South", "Welsh Cup"],
  "Northern Ireland": ["Premiership", "Irish Cup"],
  Ireland: ["Premier Division", "FAI Cup"],
  Spain: ["La Liga", "Copa del Rey", "Spanish Super Cup"],
  Germany: ["Bundesliga", "DFB-Pokal", "German Super Cup"],
  Italy: ["Serie A", "Coppa Italia", "Supercoppa Italiana"],
  France: ["Ligue 1", "Coupe de France", "Trophée des Champions"],
  Netherlands: ["Eredivisie", "KNVB Cup", "Johan Cruyff Shield"],
  Portugal: ["Primeira Liga", "Taça de Portugal", "Portuguese League Cup", "Portuguese Super Cup"],
  Belgium: ["Jupiler Pro League", "Belgian Cup", "Belgian Super Cup"],
  Türkiye: ["Süper Lig", "Turkish Cup", "Turkish Super Cup"],
  "United States": ["MLS", "USL Championship", "USL League One", "MLS Next Pro", "NISA", "NWSL", "US Open Cup", "USL Cup", "NWSL Challenge Cup"],
  Europe: ["UEFA Champions League", "UEFA Europa League", "UEFA Conference League"],
};

class FootballHubPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._formDraft = {};
    this._hass = null;
    this._selectInteracting = false;
    this._pendingHassRender = false;
    this._selectSafetyTimer = null;
    this.shadowRoot.addEventListener("pointerdown", (event) => {
      if (["SELECT", "INPUT", "TEXTAREA"].includes(event.target?.tagName)) this._beginSelectInteraction();
    }, true);
    this.shadowRoot.addEventListener("focusin", (event) => {
      if (["SELECT", "INPUT", "TEXTAREA"].includes(event.target?.tagName)) this._beginSelectInteraction();
    }, true);
    this.shadowRoot.addEventListener("input", (event) => {
      if (["INPUT", "TEXTAREA"].includes(event.target?.tagName)) {
        this._beginSelectInteraction();
        if (event.target.id) this._formDraft[event.target.id] = { value: event.target.value };
      }
    }, true);
    this.shadowRoot.addEventListener("change", (event) => {
      if (event.target?.id) this._formDraft[event.target.id] = event.target.type === "checkbox" || event.target.type === "radio"
        ? { checked: event.target.checked }
        : { value: event.target.value };
      if (event.target?.tagName === "SELECT") queueMicrotask(() => this._endSelectInteraction());
    }, true);
    this.shadowRoot.addEventListener("focusout", (event) => {
      if (!["SELECT", "INPUT", "TEXTAREA"].includes(event.target?.tagName)) return;
      setTimeout(() => {
        if (!["SELECT", "INPUT", "TEXTAREA"].includes(this.shadowRoot.activeElement?.tagName)) this._endSelectInteraction();
      }, 0);
    }, true);
    const savedTab = localStorage.getItem("football_hub_active_page") || "overview";
    this._activeTab = ["overview", "live", "fixtures", "results", "table", "players", "my-club", "cups", "last-man-standing", "double-pick-league", "news", "tv-guide", "transfers", "supporters", "settings"].includes(savedTab)
      ? savedTab
      : "overview";
    this._selectedFixtureTeam = localStorage.getItem("football_hub_fixture_team") || "__all__";
    this._fixturePage = 0;
    this._selectedLiveMatch = "";
    this._selectedLiveTeam = localStorage.getItem("football_hub_live_team") || "";
    try {
      this._hiddenLiveCompetitions = new Set(JSON.parse(localStorage.getItem("football_hub_hidden_live_competitions") || "[]"));
    } catch (_error) {
      this._hiddenLiveCompetitions = new Set();
    }
    try {
      this._hiddenLiveCountries = new Set(JSON.parse(localStorage.getItem("football_hub_hidden_live_countries") || "[]"));
    } catch (_error) {
      this._hiddenLiveCountries = new Set();
    }
    try {
      this._hiddenLiveGenders = new Set(JSON.parse(localStorage.getItem("football_hub_hidden_live_genders") || "[]"));
    } catch (_error) {
      this._hiddenLiveGenders = new Set();
    }
    this._liveFilterSearch = "";
    this._liveDisplayMode = localStorage.getItem("football_hub_live_display_mode") || "cards";
    this._liveStatusFilter = localStorage.getItem("football_hub_live_status_filter") || "all";
    this._liveTimezone = localStorage.getItem("football_hub_live_timezone") || "local";
    this._liveFiltersOpen = localStorage.getItem("football_hub_live_filters_open") !== "false";
    try { this._favouriteLiveCompetitions = new Set(JSON.parse(localStorage.getItem("football_hub_favourite_live_competitions") || "[]")); }
    catch (_error) { this._favouriteLiveCompetitions = new Set(); }
    try { this._liveNotifications = { kickoff: false, goals: false, halftime: false, fulltime: false, selectedClubOnly: false, ...JSON.parse(localStorage.getItem("football_hub_live_notifications") || "{}") }; }
    catch (_error) { this._liveNotifications = { kickoff: false, goals: false, halftime: false, fulltime: false, selectedClubOnly: false }; }
    this._prefsHydrated = false;
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
    this._lmsMode = localStorage.getItem("football_hub_lms_mode") || "private";
    this._lmsActiveLeague = localStorage.getItem("football_hub_lms_active_league") || "";
    this._lmsPageView = localStorage.getItem("football_hub_lms_page_view") || "picks";
    this._lmsAdminPassword = "";
    this._globalDeveloperKey = (String(localStorage.getItem("football_hub_global_developer_key") || "").match(/\b[a-f0-9]{64}\b/i) || [""])[0];
    try {
      this._lmsCompetition = JSON.parse(localStorage.getItem(this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private") || "null");
    } catch (_error) {
      this._lmsCompetition = null;
    }
    try {
      this._lmsLeagueCache = JSON.parse(localStorage.getItem("football_hub_lms_league_cache") || "{}");
    } catch (_error) {
      this._lmsLeagueCache = {};
    }
    try { this._doublePickGame = JSON.parse(localStorage.getItem("football_hub_double_pick_game") || "null"); }
    catch (_error) { this._doublePickGame = null; }
    try { this._doublePickCache = JSON.parse(localStorage.getItem("football_hub_double_pick_cache") || "{}"); }
    catch (_error) { this._doublePickCache = {}; }
    if (localStorage.getItem("football_hub_double_pick_cache_version") !== "6") {
      this._doublePickCache = {};
      localStorage.setItem("football_hub_double_pick_cache", "{}");
      localStorage.setItem("football_hub_double_pick_cache_version", "6");
    }
    this._doublePickView = localStorage.getItem("football_hub_double_pick_view") || "picks";
    this._doublePickActiveCompetition = localStorage.getItem("football_hub_double_pick_active_competition") || "";
    this._doublePickLoadQueue = [];
    this._doublePickFinalizing = false;
    this._lastRenderSig = null;
    this._lmsCountdownTimer = null;
    this._lmsReminderTimer = null;
    this._lmsSharePullTimer = null;
    this._lmsShareSyncTimer = null;
    this._lmsShareBusy = false;
    this._lmsShareLastPull = 0;
    this._lmsAdminUnlocked = false;
    this._lmsAutoCheckBusy = false;
    this._lmsReminderBusy = false;
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
    this._processLiveNotifications();
    if (this._pendingCompetition && this._statusInfo().competition_key === this._pendingCompetition) {
      const loadedKey = this._pendingCompetition;
      this._pendingCompetition = "";
      this._scheduleDoublePickCapture(loadedKey, "league");
    }
    if (this._pendingCup && this._attrs("cup_centre").competition_key === this._pendingCup) {
      const loadedKey = this._pendingCup;
      this._pendingCup = "";
      this._scheduleDoublePickCapture(loadedKey, "cup");
    }
    if (this._selectInteracting || ["SELECT", "INPUT", "TEXTAREA"].includes(this.shadowRoot.activeElement?.tagName)) {
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
    this._selectSafetyTimer = setTimeout(() => this._endSelectInteraction(), 300000);
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
    clearInterval(this._lmsCountdownTimer);
    this._lmsCountdownTimer = setInterval(() => this._updateLmsCountdown(), 1000);
    clearInterval(this._lmsReminderTimer);
    this._lmsReminderTimer = setInterval(() => this._checkLmsEmailReminders(), 60000);
    queueMicrotask(() => this._checkLmsEmailReminders());
    clearInterval(this._lmsSharePullTimer);
    this._lmsSharePullTimer = setInterval(() => this._pullLmsSharePicks(), 2000);
    queueMicrotask(() => this._pullLmsSharePicks());
    clearInterval(this._lmsSettleTimer);
    this._lmsSettleTimer = setInterval(() => this._maybeAutoSettleLmsRound(), 60000);
    queueMicrotask(() => this._maybeAutoSettleLmsRound());
  }

  disconnectedCallback() {
    clearInterval(this._lmsCountdownTimer);
    this._lmsCountdownTimer = null;
    clearInterval(this._lmsReminderTimer);
    this._lmsReminderTimer = null;
    clearInterval(this._lmsSharePullTimer);
    this._lmsSharePullTimer = null;
    clearInterval(this._lmsSettleTimer);
    this._lmsSettleTimer = null;
    clearTimeout(this._lmsShareSyncTimer);
    this._lmsShareSyncTimer = null;
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

  _saveLms(sync = true) {
    const storageKey = this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private";
    if (this._lmsCompetition) {
      localStorage.setItem(storageKey, JSON.stringify(this._lmsCompetition));
      if (sync) this._queueLmsShareSync();
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  _lmsSharePayload() {
    const competition = this._lmsCompetition;
    if (!competition) return null;
    const teamGroups = this._lmsTeamGroups().map((group) => ({
      key: group.key,
      name: group.name,
      country: group.country,
      teams: [...(group.teams || [])],
    }));
    const roundFixtures = this._lmsRoundFixtureGroups().map((group) => ({
      key: group.key,
      name: group.name,
      country: group.country,
      fixtures: [...(group.roundFixtures || [])],
    }));
    const payload = JSON.parse(JSON.stringify(competition));
    delete payload.adminPasswordHash;
    delete payload.shareEditToken;
    delete payload.shareUrl;
    delete payload.shareId;
    payload.teamGroups = teamGroups;
    payload.roundFixtures = roundFixtures;
    return payload;
  }

  _applyLmsPlayerLinks(playerLinks = []) {
    const competition = this._lmsCompetition;
    if (!competition) return;
    const byId = new Map(playerLinks.map((item) => [String(item.playerId), item]));
    for (const player of competition.players || []) {
      const link = byId.get(String(player.id));
      if (link?.url) player.pickUrl = link.url;
      if (link?.email && !player.email) player.email = link.email;
    }
  }

  async _copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_error) {
      // Home Assistant may be opened over HTTP, where Clipboard API access is blocked.
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.focus();
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_error) {
      copied = false;
    }
    field.remove();
    return copied;
  }

  _lmsEmailServices() {
    const services = this._hass?.services?.notify || {};
    const entities = Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("notify."))
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state?.attributes?.friendly_name || entityId.slice(7).replaceAll("_", " ")} · notify entity`,
        modern: true,
      }));
    const legacy = Object.entries(services)
      .filter(([service]) => service !== "send_message")
      .map(([service, details]) => ({
        value: `notify.${service}`,
        label: `${details?.name || details?.description || service.replaceAll("_", " ")} · legacy`,
        modern: false,
      }));
    return [{ value: "__auto__", label: "Automatically match each player email · recommended", modern: true }, ...entities, ...legacy.filter((item) => !entities.some((entity) => entity.value === item.value))]
      .sort((a, b) => String(a.label).localeCompare(String(b.label)));
  }

  _lmsNotifyEntityForEmail(email) {
    const normalise = (value) => String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
    const wanted = normalise(email);
    if (!wanted) return "";
    return Object.entries(this._hass?.states || {}).find(([entityId, state]) => {
      if (!entityId.startsWith("notify.")) return false;
      const entityName = normalise(entityId.slice(7));
      const friendlyName = normalise(state?.attributes?.friendly_name);
      return entityName.includes(wanted) || friendlyName.includes(wanted);
    })?.[0] || "";
  }

  _lmsConfiguredEmailService() {
    const games = [this._lmsCompetition];
    for (const key of ["football_hub_lms_private", "football_hub_lms_global"]) {
      try { games.push(JSON.parse(localStorage.getItem(key) || "null")); } catch (_error) { /* ignore damaged saved data */ }
    }
    return String(games.find((game) => game?.emailNotifyService && game.emailNotifyService !== "__auto__")?.emailNotifyService || "__auto__");
  }

  _lmsEmailDeadline() {
    const deadline = this._lmsDeadlineState();
    return deadline.timestamp
      ? new Date(deadline.timestamp * 1000).toLocaleString([], { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
      : "the first match of the round";
  }

  _lmsEmailFixtureList() {
    const groups = this._lmsRoundFixtureGroups();
    const sections = groups.map((group) => {
      const fixtures = group.roundFixtures || [];
      if (!fixtures.length) return "";
      const heading = [group.country, group.name].filter(Boolean).join(" - ");
      const matches = fixtures.map((fixture) => {
        const timestamp = this._lmsFixtureTimestamp(fixture);
        const kickoff = timestamp
          ? new Date(timestamp * 1000).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          : "Time TBC";
        return `${fixture.home_team || "Home team"} vs ${fixture.away_team || "Away team"} - ${kickoff}`;
      });
      return `${heading}\n${matches.join("\n")}`;
    }).filter(Boolean);
    return sections.length ? sections.join("\n\n") : "Round fixtures are not available yet.";
  }

  async _sendLmsPlayerEmail(player, quiet = false, reminderKind = "") {
    const competition = this._lmsCompetition;
    const action = String(competition?.emailNotifyService || "__auto__");
    if (!player?.email || !player?.pickUrl || !action || !this._hass?.callService) {
      if (!quiet) window.alert(!player?.email ? "Add an email address for this player first." : !player?.pickUrl ? "Generate the public competition link first." : "Choose a Home Assistant email service first.");
      return false;
    }
    const matchedEntity = this._lmsNotifyEntityForEmail(player.email);
    const [domain, ...serviceParts] = action.split(".");
    const service = serviceParts.join(".");
    if (!matchedEntity && action === "__auto__") {
      if (!quiet) window.alert(`No Home Assistant SMTP recipient entity matches ${player.email}. Add this recipient to the SMTP integration first.`);
      return false;
    }
    if (!matchedEntity && (domain !== "notify" || !service)) {
      if (!quiet) window.alert("The selected email service is not valid.");
      return false;
    }
    try {
      const fixtures = this._lmsEmailFixtureList();
      const reminderIntro = reminderKind === "day"
        ? "This is your 24-hour reminder"
        : reminderKind === "hours"
          ? "FINAL REMINDER: only a few hours remain. If you do not make a pick before the deadline, you will be eliminated"
          : reminderKind === "new-round"
            ? `Round ${competition.round} is now open. Please choose your team`
            : "Choose your Last Man Standing team";
      const messageData = {
        title: `${reminderKind && reminderKind !== "new-round" ? "Reminder: " : ""}${competition.name} - Round ${competition.round} team selection`,
        message: `Hi ${player.name},\n\n${reminderIntro} for Round ${competition.round}:\n${player.pickUrl}\n\nYour deadline is ${this._lmsEmailDeadline()} local time. Teams already used cannot be selected again.\n\nROUND ${competition.round} FIXTURES\n\n${fixtures}\n\nUse your private link above to make your selection.\n\nFootball Hub`,
      };
      if (matchedEntity || this._hass.states?.[action]) {
        await this._hass.callService("notify", "send_message", messageData, { entity_id: matchedEntity || action });
      } else {
        await this._hass.callService(domain, service, { ...messageData, target: [player.email] });
      }
      player.lastEmailSent = Math.floor(Date.now() / 1000);
      this._saveLms();
      if (!quiet) window.alert(`Pick link emailed to ${player.name}.`);
      return true;
    } catch (error) {
      console.warn("Football Hub LMS email failed", error);
      if (!quiet) window.alert(`Email could not be sent to ${player.name}. Check the selected Home Assistant email service.`);
      return false;
    }
  }

  async _sendLmsOutstandingEmails(includeSelected = false, paidOnly = true) {
    const competition = this._lmsCompetition;
    if (!competition) return 0;
    const roundKey = String(competition.round || 1);
    const players = (competition.players || []).filter((player) =>
      player.alive &&
      player.email &&
      player.pickUrl &&
      (!paidOnly || competition.mode === "global" || player.paid === true) &&
      (includeSelected || !player.picks?.[roundKey])
    );
    let sent = 0;
    for (const player of players) if (await this._sendLmsPlayerEmail(player, true)) sent += 1;
    return sent;
  }

  async _createLmsShare() {
    if (!this._isLmsAdmin() || !this._lmsCompetition || !LMS_SHARE_SERVICE || this._lmsShareBusy) return;
    if (this._lmsMode === "global" && !/^[a-f0-9]{64}$/i.test(this._globalDeveloperKey)) {
      window.alert("The private developer key is invalid. Copy only the 64-character key from the key file.");
      return false;
    }
    this._lmsShareBusy = true;
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this._lmsMode === "global" ? { "x-football-hub-owner": this._globalDeveloperKey } : {}),
        },
        body: JSON.stringify({ competition: this._lmsSharePayload(), ...(this._lmsMode === "private" ? { adminPassword: this._lmsAdminPassword } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to generate share link");
      this._lmsCompetition.shareId = result.shareId;
      this._lmsCompetition.shareEditToken = result.editToken;
      this._lmsCompetition.shareUrl = result.shareUrl;
      this._applyLmsPlayerLinks(result.playerLinks);
      localStorage.setItem(this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private", JSON.stringify(this._lmsCompetition));
      this._render();
      const emailed = this._lmsCompetition.emailNotifyService ? await this._sendLmsOutstandingEmails(true, false) : 0;
      const copied = await this._copyText(result.shareUrl);
      if (copied) window.alert(`Competition link generated and copied.${emailed ? ` Pick links emailed to ${emailed} player${emailed === 1 ? "" : "s"}.` : ""}`);
      else window.prompt("Competition link generated. Copy this link:", result.shareUrl);
      return true;
    } catch (error) {
      window.alert(error?.message || "Unable to generate the competition link.");
      return false;
    } finally {
      this._lmsShareBusy = false;
    }
  }

  _queueLmsShareSync() {
    if (!this._lmsCompetition?.shareId || (!this._lmsCompetition?.shareEditToken && !this._lmsAdminPassword) || !LMS_SHARE_SERVICE) return;
    this._lmsShareSyncPending = true;
    clearTimeout(this._lmsShareSyncTimer);
    this._lmsShareSyncTimer = setTimeout(() => this._syncLmsShare(), 250);
  }

  async _syncLmsShare() {
    const competition = this._lmsCompetition;
    if (!competition?.shareId || (!competition?.shareEditToken && !this._lmsAdminPassword) || !LMS_SHARE_SERVICE) return;
    if (this._lmsShareBusy) {
      clearTimeout(this._lmsShareSyncTimer);
      this._lmsShareSyncTimer = setTimeout(() => this._syncLmsShare(), 1500);
      return;
    }
    this._lmsShareBusy = true;
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions/${encodeURIComponent(competition.shareId)}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          ...(competition.shareEditToken ? { "authorization": `Bearer ${competition.shareEditToken}` } : {}),
          ...(this._lmsAdminPassword ? { "x-admin-password": this._lmsAdminPassword } : {}),
          ...(competition.mode === "global" ? { "x-football-hub-owner": this._globalDeveloperKey } : {}),
        },
        body: JSON.stringify({ competition: this._lmsSharePayload(), ...(competition.mode === "private" && this._lmsAdminPassword ? { adminPassword: this._lmsAdminPassword } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Share update failed");
      this._applyLmsPlayerLinks(result.playerLinks);
      localStorage.setItem(this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private", JSON.stringify(competition));
      this._lmsShareSyncPending = false;
    } catch (error) {
      console.warn("Football Hub LMS share update failed", error);
    } finally {
      this._lmsShareBusy = false;
      if (this._lmsShareSyncPending) {
        clearTimeout(this._lmsShareSyncTimer);
        this._lmsShareSyncTimer = setTimeout(() => this._syncLmsShare(), 1500);
      }
    }
  }

  async _pullLmsSharePicks(force = false) {
    const competition = this._lmsCompetition;
    if (this._activeTab !== "last-man-standing" || !competition?.shareId || !LMS_SHARE_SERVICE || this._lmsShareBusy || this._lmsShareSyncPending) return;
    if (!force && Date.now() - this._lmsShareLastPull < 1500) return;
    this._lmsShareLastPull = Date.now();
    this._lmsShareBusy = true;
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions/${encodeURIComponent(competition.shareId)}`, {
        cache: "no-store",
        headers: {
          ...(competition.shareEditToken ? { "authorization": `Bearer ${competition.shareEditToken}` } : {}),
          ...(this._lmsAdminPassword ? { "x-admin-password": this._lmsAdminPassword } : {}),
          ...(competition.mode === "global" && this._globalDeveloperKey ? { "x-football-hub-owner": this._globalDeveloperKey } : {}),
        },
      });
      if (!response.ok) return;
      const result = await response.json();
      const remote = result.competition;
      if (competition.mode === "private" && Object.prototype.hasOwnProperty.call(result, "playerLinks")) {
        const localAccess = {
          shareId: competition.shareId,
          shareUrl: competition.shareUrl,
          shareEditToken: competition.shareEditToken,
          adminPasswordHash: competition.adminPasswordHash,
        };
        Object.assign(competition, remote, localAccess);
        this._applyLmsPlayerLinks(result.playerLinks || []);
        if (!(competition.leagues || []).some((league) => league.key === this._lmsActiveLeague)) {
          this._lmsActiveLeague = competition.leagues?.[0]?.key || "";
          localStorage.setItem("football_hub_lms_active_league", this._lmsActiveLeague);
        }
        localStorage.setItem("football_hub_lms_private", JSON.stringify(competition));
        this._render();
        return;
      }
      const remotePlayers = new Map((remote?.players || []).map((player) => [String(player.id), player]));
      let changed = false;
      if (competition.mode === "global") {
        for (const remotePlayer of remote?.players || []) {
          if (!(competition.players || []).some((player) => String(player.id) === String(remotePlayer.id))) {
            competition.players.push({ ...remotePlayer, alive: true, points: Number(remotePlayer.points || 0) });
            changed = true;
          }
        }
      }
      for (const player of competition.players || []) {
        const remotePlayer = remotePlayers.get(String(player.id));
        if (!remotePlayer?.picks) continue;
        const localPicks = JSON.stringify(player.picks || {});
        const remotePicks = JSON.stringify(remotePlayer.picks || {});
        if (localPicks !== remotePicks) {
          player.picks = { ...(remotePlayer.picks || {}) };
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private", JSON.stringify(competition));
        this._render();
      }
    } catch (error) {
      console.warn("Football Hub LMS player picks refresh failed", error);
    } finally {
      this._lmsShareBusy = false;
    }
  }

  async _lmsPasswordHash(password) {
    const value = String(password || "");
    if (globalThis.crypto?.subtle) {
      const bytes = new TextEncoder().encode(`football-hub-lms:${value}`);
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
      return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
    let hash = 2166136261;
    for (const character of `football-hub-lms:${value}`) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `fallback-${(hash >>> 0).toString(16)}`;
  }

  _isLmsAdmin() {
    return Boolean(this._lmsCompetition?.adminPasswordHash && this._lmsAdminUnlocked);
  }

  async _setLmsAdminPassword(password, confirmation) {
    const competition = this._lmsCompetition;
    if (!competition || competition.adminPasswordHash) return;
    if (String(password || "").length < 4) {
      window.alert("Choose an administrator password with at least 4 characters.");
      return;
    }
    if (password !== confirmation) {
      window.alert("The administrator passwords do not match.");
      return;
    }
    competition.adminPasswordHash = await this._lmsPasswordHash(password);
    this._lmsAdminUnlocked = true;
    this._saveLms();
    this._render();
  }

  async _unlockLmsAdmin(password) {
    const competition = this._lmsCompetition;
    if (!competition?.adminPasswordHash) return;
    const valid = (await this._lmsPasswordHash(password)) === competition.adminPasswordHash;
    if (!valid) {
      window.alert("Incorrect administrator password.");
      return;
    }
    this._lmsAdminUnlocked = true;
    this._lmsAdminPassword = String(password || "");
    this._render();
  }

  async _openRemoteLmsGame(value, password) {
    const entered = String(value || "").trim();
    const adminPassword = String(password || "");
    if (!entered || adminPassword.length < 4 || !LMS_SHARE_SERVICE) {
      window.alert("Enter the competition link or ID and its administrator password.");
      return;
    }
    let shareId = entered;
    try {
      const url = new URL(entered);
      shareId = url.searchParams.get("competition") || url.pathname.match(/\/lms\/([^/?#]+)/)?.[1] || entered;
    } catch (_error) {
      shareId = entered;
    }
    shareId = decodeURIComponent(String(shareId).trim());
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions/${encodeURIComponent(shareId)}`, {
        cache: "no-store",
        headers: { "x-admin-password": adminPassword },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Competition could not be opened");
      const competition = result.competition || {};
      if (competition.mode && competition.mode !== "private") throw new Error("This is not a private LMS competition.");
      competition.shareId = shareId;
      competition.shareUrl = `${LMS_SHARE_SERVICE}/lms/${encodeURIComponent(shareId)}`;
      competition.adminPasswordHash = await this._lmsPasswordHash(adminPassword);
      this._lmsCompetition = competition;
      this._lmsMode = "private";
      this._lmsAdminPassword = adminPassword;
      this._lmsAdminUnlocked = true;
      this._lmsActiveLeague = competition.leagues?.[0]?.key || "";
      this._applyLmsPlayerLinks(result.playerLinks || []);
      localStorage.setItem("football_hub_lms_mode", "private");
      localStorage.setItem("football_hub_lms_private", JSON.stringify(competition));
      if (this._lmsActiveLeague) localStorage.setItem("football_hub_lms_active_league", this._lmsActiveLeague);
      this._render();
      window.alert(`Opened ${competition.name || "the competition"}. Changes will stay synced across devices.`);
    } catch (error) {
      window.alert(error?.message || "Competition could not be opened. Check the link and password.");
    }
  }

  _lmsFixtureTimestamp(fixture) {
    const raw = fixture?.timestamp ?? fixture?.kickoff ?? fixture?.utc_time ?? fixture?.date;
    if (raw === null || raw === undefined || raw === "") return 0;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return numeric > 100000000000 ? Math.floor(numeric / 1000) : Math.floor(numeric);
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
  }

  _ensureLmsDeadline() {
    const competition = this._lmsCompetition;
    if (!competition) return 0;
    const roundKey = String(competition.round || 1);
    competition.deadlines = competition.deadlines || {};
    if (Number(competition.deadlines[roundKey]) > 0) return Number(competition.deadlines[roundKey]);
    const roundStarted = Number(competition.roundStarted || 0);
    const fixtures = this._lmsTeamGroups().flatMap((league) => league.fixtures || []);
    const timestamps = fixtures
      .map((fixture) => this._lmsFixtureTimestamp(fixture))
      .filter((timestamp) => timestamp >= roundStarted - 300)
      .sort((a, b) => a - b);
    if (!timestamps.length) return 0;
    competition.deadlines[roundKey] = timestamps[0];
    this._saveLms();
    return timestamps[0];
  }

  _lmsDeadlineState() {
    const timestamp = this._ensureLmsDeadline();
    const remaining = timestamp ? (timestamp * 1000) - Date.now() : 0;
    return { timestamp, remaining, locked: Boolean(timestamp && remaining <= 0) };
  }

  _formatLmsCountdown(milliseconds) {
    if (milliseconds <= 0) return "PICKS LOCKED";
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days ? `${days}d ` : ""}${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }

  _updateLmsCountdown() {
    const countdown = this.shadowRoot?.querySelector("#lms-countdown");
    if (!countdown) return;
    const state = this._lmsDeadlineState();
    countdown.textContent = state.timestamp ? this._formatLmsCountdown(state.remaining) : "Waiting for fixture times";
    const warning = countdown.closest(".lms-deadline");
    warning?.classList.toggle("locked", state.locked);
    this.shadowRoot.querySelectorAll(".lms-pick").forEach((select) => {
      if (state.locked) select.disabled = true;
    });
  }

  async _checkLmsEmailReminders() {
    const competition = this._lmsCompetition;
    if (!competition || this._lmsReminderBusy || !competition.emailNotifyService) return;
    const roundKey = String(competition.round || 1);
    const now = Math.floor(Date.now() / 1000);
    const nextRoundSchedule = competition.nextRoundEmailSchedules?.[roundKey];
    if (nextRoundSchedule && !nextRoundSchedule.sent && now >= Number(nextRoundSchedule.sendAt || 0)) {
      const eligiblePlayers = (competition.players || []).filter((player) =>
        player.alive && player.email && player.pickUrl && !player.picks?.[roundKey] &&
        (competition.mode === "global" || player.paid === true) &&
        !player.emailReminders?.[roundKey]?.newRound
      );
      this._lmsReminderBusy = true;
      try {
        let allSent = true;
        for (const player of eligiblePlayers) {
          if (await this._sendLmsPlayerEmail(player, true, "new-round")) {
            player.emailReminders = player.emailReminders || {};
            player.emailReminders[roundKey] = player.emailReminders[roundKey] || {};
            player.emailReminders[roundKey].newRound = now;
          } else allSent = false;
        }
        nextRoundSchedule.sent = allSent;
        if (allSent) nextRoundSchedule.sentAt = now;
        this._saveLms();
      } finally {
        this._lmsReminderBusy = false;
      }
      return;
    }
    const deadline = this._lmsDeadlineState();
    if (!deadline.timestamp || deadline.remaining <= 0 || deadline.remaining > 86400000) return;
    const reminderKind = deadline.remaining <= 10800000 ? "hours" : "day";
    const eligiblePlayers = (competition.players || []).filter((player) =>
      player.alive &&
      player.email &&
      player.pickUrl &&
      !player.picks?.[roundKey] &&
      (competition.mode === "global" || player.paid === true) &&
      !player.emailReminders?.[roundKey]?.[reminderKind]
    );
    if (!eligiblePlayers.length) return;
    this._lmsReminderBusy = true;
    try {
      for (const player of eligiblePlayers) {
        if (await this._sendLmsPlayerEmail(player, true, reminderKind)) {
          player.emailReminders = player.emailReminders || {};
          player.emailReminders[roundKey] = player.emailReminders[roundKey] || {};
          player.emailReminders[roundKey][reminderKind] = Math.floor(Date.now() / 1000);
        }
      }
      this._saveLms();
    } finally {
      this._lmsReminderBusy = false;
    }
  }

  _lmsTeams() {
    const status = this._statusInfo();
    const wantedLeague = this._lmsActiveLeague || this._lmsCompetition?.leagues?.[0]?.key || "";
    if (wantedLeague && status.competition_key !== wantedLeague) return [];
    const tableTeams = (this._attrs("standings").table || []).map((row) => row.team || row.team_name);
    const fixtureTeams = (this._attrs("fixtures").fixtures || []).flatMap((match) => [match.home_team, match.away_team]);
    return [...new Set([...tableTeams, ...fixtureTeams].filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  _captureLmsLeagueData() {
    const competition = this._lmsCompetition;
    const status = this._statusInfo();
    if (!competition?.leagues?.some((league) => league.key === status.competition_key)) return;
    const teams = this._lmsTeams();
    const fixtures = this._attrs("fixtures").fixtures || [];
    if (!teams.length) return;
    this._lmsLeagueCache[status.competition_key] = { teams, fixtures, updated: Date.now() };
    localStorage.setItem("football_hub_lms_league_cache", JSON.stringify(this._lmsLeagueCache));
    this._ensureLmsDeadline();
    queueMicrotask(() => this._maybeAutoSettleLmsRound());
  }

  _lmsTeamGroups() {
    const competition = this._lmsCompetition;
    if (!competition) return [];
    return (competition.leagues || []).map((league) => ({
      ...league,
      teams: this._lmsLeagueCache?.[league.key]?.teams || [],
      fixtures: this._lmsLeagueCache?.[league.key]?.fixtures || [],
    }));
  }

  _lmsRoundFixtureGroups() {
    const competition = this._lmsCompetition;
    if (!competition) return [];
    const roundStarted = Number(competition.roundStarted || 0);
    return this._lmsTeamGroups().map((league) => {
      const candidates = (league.fixtures || [])
        .filter((fixture) => {
          const timestamp = this._lmsFixtureTimestamp(fixture);
          return timestamp >= roundStarted - 300;
        })
        .sort((a, b) => this._lmsFixtureTimestamp(a) - this._lmsFixtureTimestamp(b));
      const first = candidates[0];
      if (!first) return { ...league, roundFixtures: [] };
      const roundValue = first.round ?? first.round_name ?? first.roundName ?? first.matchday ?? first.round_number;
      const firstTimestamp = this._lmsFixtureTimestamp(first);
      const roundFixtures = candidates.filter((fixture) => {
        const fixtureRound = fixture.round ?? fixture.round_name ?? fixture.roundName ?? fixture.matchday ?? fixture.round_number;
        if (roundValue !== undefined && roundValue !== null && roundValue !== "") return String(fixtureRound) === String(roundValue);
        return this._lmsFixtureTimestamp(fixture) <= firstTimestamp + (4 * 86400);
      });
      return { ...league, roundFixtures };
    });
  }

  async _createLmsCompetition(name, leagueKeys = [], password = "", confirmation = "", entryFee = 5) {
    const status = this._statusInfo();
    const catalogue = Array.isArray(status.available_competitions) ? status.available_competitions : [];
    const selectedLeagues = catalogue
      .filter((item) => leagueKeys.includes(item.key) && (item.type || "league") === "league")
      .map((item) => ({ key: item.key, name: item.name, country: item.country }));
    if (!selectedLeagues.length) return;
    if (this._lmsMode === "global" && !this._globalDeveloperKey) {
      window.alert("Enter the private Football Hub developer key.");
      return;
    }
    if (String(password).length < 6) {
      window.alert("Choose an administrator password with at least 6 characters.");
      return;
    }
    if (password !== confirmation) {
      window.alert("The administrator passwords do not match.");
      return;
    }
    this._lmsCompetition = {
      id: `lms-${Date.now()}`,
      name: String(name || "Private Competition").trim() || "Private Competition",
      competitionKey: status.competition_key || "",
      competitionName: status.competition || "Selected league",
      leagues: selectedLeagues,
      round: 1,
      roundStarted: Math.floor(Date.now() / 1000),
      deadlines: {},
      entryFee: this._lmsMode === "global" ? 0 : Math.max(0, Number(entryFee) || 0),
      carriedPrize: 0,
      edition: 1,
      completed: false,
      adminPasswordHash: await this._lmsPasswordHash(password),
      created: new Date().toISOString(),
      players: [],
      mode: this._lmsMode,
      joiningOpen: false,
      scoring: this._lmsMode === "global" ? { win: 3, draw: 1, loss: 0, missed: 0 } : undefined,
    };
    this._lmsActiveLeague = selectedLeagues[0].key;
    this._lmsAdminUnlocked = true;
    this._lmsAdminPassword = String(password);
    localStorage.setItem("football_hub_lms_active_league", this._lmsActiveLeague);
    this._saveLms();
    if (status.competition_key !== this._lmsActiveLeague) this._setLeague(this._lmsActiveLeague);
    this._render();
    if (this._lmsMode === "global" || this._lmsMode === "private") {
      const published = await this._createLmsShare();
      if (!published && this._lmsMode === "global") {
        this._lmsCompetition = null;
        this._saveLms();
        this._render();
      }
    }
  }

  _addLmsPlayer(name, email = "") {
    if (!this._isLmsAdmin()) return;
    const clean = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    if (!clean || !this._lmsCompetition) return;
    if (this._lmsCompetition.players.some((player) => player.name.toLowerCase() === clean.toLowerCase())) return;
    this._lmsCompetition.players.push({ id: `player-${Date.now()}`, name: clean, email: cleanEmail, alive: true, paid: false, picks: {}, results: {} });
    this._saveLms();
    this._render();
  }

  _setLmsPick(playerId, team) {
    const competition = this._lmsCompetition;
    if (!this._isLmsAdmin()) return;
    if (this._lmsDeadlineState().locked) return;
    const player = competition?.players?.find((item) => item.id === playerId);
    if (!player || !player.alive) return;
    const roundKey = String(competition.round);
    const used = Object.entries(player.picks || {}).some(([round, picked]) => round !== roundKey && picked === team);
    if (used) return;
    player.picks[roundKey] = team;
    this._saveLms();
    this._render();
  }

  _setLmsEarlyPick(playerId, team) {
    const competition = this._lmsCompetition;
    if (!competition || competition.completed || !this._isLmsAdmin()) return;
    const player = competition.players?.find((item) => item.id === playerId);
    const currentRound = String(competition.round);
    const nextRound = String(Number(competition.round) + 1);
    if (!player?.alive || player.results?.[currentRound] !== "survived") return;
    const used = Object.entries(player.picks || {}).some(([round, picked]) => round !== nextRound && picked === team);
    if (used) return;
    player.picks = player.picks || {};
    if (team) player.picks[nextRound] = team;
    else delete player.picks[nextRound];
    this._saveLms();
    this._render();
  }

  async _toggleLmsPaid(playerId) {
    if (!this._isLmsAdmin()) return;
    const player = this._lmsCompetition?.players?.find((item) => item.id === playerId);
    if (!player) return;
    const previous = Boolean(player.paid);
    player.paid = !previous;
    this._saveLms(false);
    this._render();
    const competition = this._lmsCompetition;
    if (!competition?.shareId || (!competition.shareEditToken && !this._lmsAdminPassword)) {
      player.paid = previous;
      this._saveLms(false);
      this._render();
      window.alert("This payment was not saved. Reopen the shared game with its link and administrator password.");
      return;
    }
    this._lmsShareBusy = true;
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions/${encodeURIComponent(competition.shareId)}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...(competition.shareEditToken ? { "authorization": `Bearer ${competition.shareEditToken}` } : {}),
          ...(this._lmsAdminPassword ? { "x-admin-password": this._lmsAdminPassword } : {}),
        },
        body: JSON.stringify({ action: "set-player-paid", playerId, paid: player.paid }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Payment status could not be shared");
    } catch (error) {
      player.paid = previous;
      this._saveLms(false);
      this._render();
      window.alert(error?.message || "Payment status could not be shared.");
    } finally {
      this._lmsShareBusy = false;
    }
  }

  _editLmsPlayerEmail(playerId) {
    if (!this._isLmsAdmin()) return;
    const player = this._lmsCompetition?.players?.find((item) => item.id === playerId);
    if (!player) return;
    const entered = window.prompt(`Email address for ${player.name}:`, player.email || "");
    if (entered === null) return;
    const email = String(entered).trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.alert("Enter a valid email address.");
      return;
    }
    player.email = email;
    this._saveLms();
    this._render();
  }

  _removeLmsPlayer(playerId) {
    if (!this._isLmsAdmin()) return;
    const competition = this._lmsCompetition;
    const player = competition?.players?.find((item) => item.id === playerId);
    if (!competition || !player) return;
    if (!window.confirm(`Remove ${player.name} from this competition? Their picks, results and payment record will also be removed.`)) return;
    competition.players = competition.players.filter((item) => item.id !== playerId);
    this._saveLms();
    this._render();
  }

  _canLmsBuyBack(player) {
    const competition = this._lmsCompetition;
    if (!competition || !player || player.alive || player.buyBackRounds?.["1"]) return false;
    if (!String(player.results?.["1"] || "").startsWith("eliminated")) return false;
    if (competition.completed && Number(competition.round) === 1) return true;
    if (Number(competition.round) === 1) return true;
    return Number(competition.round) === 2 && !this._lmsDeadlineState().locked;
  }

  _buyBackLmsPlayer(playerId) {
    const competition = this._lmsCompetition;
    if (!competition || !this._isLmsAdmin()) return;
    const player = competition.players?.find((item) => item.id === playerId);
    if (!this._canLmsBuyBack(player)) return;
    const fee = Number(competition.entryFee ?? 5);
    if (!window.confirm(`Buy ${player.name} back into the competition for £${fee.toFixed(2)}? Their first team will remain used.`)) return;
    player.buyBacks = Number(player.buyBacks || 0) + 1;
    player.buyBackRounds = { ...(player.buyBackRounds || {}), "1": true };
    player.paid = true;
    player.alive = true;
    player.results = player.results || {};
    player.results["1"] = "bought-back";
    if (competition.completed && Number(competition.round) === 1) {
      competition.completed = false;
      competition.winnerId = "";
      competition.round = 2;
      competition.roundStarted = Math.floor(Date.now() / 1000);
    }
    this._saveLms();
    this._render();
  }

  _setLmsEntryFee(value) {
    if (!this._isLmsAdmin() || !this._lmsCompetition) return;
    this._lmsCompetition.entryFee = Math.max(0, Number(value) || 0);
    this._saveLms();
    this._render();
  }

  _rolloverLmsCompetition() {
    const competition = this._lmsCompetition;
    if (!competition || !this._isLmsAdmin()) return;
    const paidCount = competition.players.filter((player) => player.paid).length;
    const buyBackCount = competition.players.reduce((total, player) => total + Number(player.buyBacks || 0), 0);
    const currentPrize = Number(competition.carriedPrize || 0) + ((paidCount + buyBackCount) * Number(competition.entryFee ?? 5));
    if (!window.confirm(`Rollover £${currentPrize.toFixed(2)} into a new competition? Every player will need to pay and choose again.`)) return;
    competition.archives = competition.archives || [];
    competition.archives.push({
      edition: Number(competition.edition || 1),
      completed: new Date().toISOString(),
      prizeFund: currentPrize,
      players: competition.players.map((player) => ({ ...player })),
    });
    competition.carriedPrize = currentPrize;
    competition.edition = Number(competition.edition || 1) + 1;
    competition.round = 1;
    competition.roundStarted = Math.floor(Date.now() / 1000);
    competition.deadlines = {};
    competition.completed = false;
    competition.winnerId = "";
    competition.players = competition.players.map((player) => ({ ...player, alive: true, paid: false, buyBacks: 0, buyBackRounds: {}, picks: {}, results: {} }));
    this._lmsPageView = "picks";
    localStorage.setItem("football_hub_lms_page_view", this._lmsPageView);
    this._saveLms();
    this._render();
  }

  async _refreshLmsRoundFixtures() {
    const competition = this._lmsCompetition;
    if (!competition || !LMS_SHARE_SERVICE) return;
    await Promise.all((competition.leagues || []).map(async (league) => {
      try {
        const response = await fetch(`${LMS_SHARE_SERVICE}/api/football-data?league=${encodeURIComponent(league.key)}&fresh=1`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!Array.isArray(data.fixtures) || !data.fixtures.length) return;
        this._lmsLeagueCache[league.key] = {
          teams: Array.isArray(data.teams) ? data.teams : [],
          fixtures: data.fixtures,
          updated: Date.now(),
        };
      } catch (error) {
        console.warn(`Football Hub LMS fixture refresh failed for ${league.key}`, error);
      }
    }));
    localStorage.setItem("football_hub_lms_league_cache", JSON.stringify(this._lmsLeagueCache));
  }

  async _maybeAutoSettleLmsRound() {
    const competition = this._lmsCompetition;
    if (!competition || competition.completed || this._lmsAutoCheckBusy || !this._lmsDeadlineState().locked) return;
    this._lmsAutoCheckBusy = true;
    try {
      await this._refreshLmsRoundFixtures();
      const fixtures = this._lmsRoundFixtureGroups().flatMap((league) => league.roundFixtures || []);
      const finished = new Set(["FT", "AET", "PEN"]);
      if (!fixtures.length) return;
      const roundKey = String(competition.round);
      const hasNewResult = competition.players.some((player) => {
        if (!player.alive || player.results?.[roundKey]) return false;
        const pick = player.picks?.[roundKey];
        if (!pick) return true;
        const match = fixtures.find((fixture) => fixture.home_team === pick || fixture.away_team === pick);
        return Boolean(match && finished.has(String(match.status_short || match.status || "").toUpperCase()));
      });
      if (!hasNewResult) return;
      this._settleLmsRound(true);
    } finally {
      this._lmsAutoCheckBusy = false;
    }
  }

  async _settleLmsRound(automatic = false) {
    const competition = this._lmsCompetition;
    if (!competition || competition.completed || (!automatic && !this._isLmsAdmin())) return;
    if (competition.mode === "global") {
      this._settleGlobalLmsRound();
      return;
    }
    if (!automatic) await this._refreshLmsRoundFixtures();
    const roundKey = String(competition.round);
    const fixtures = this._lmsRoundFixtureGroups().flatMap((league) => league.roundFixtures || []);
    let waiting = false;
    for (const player of competition.players) {
      if (!player.alive) continue;
      const pick = player.picks?.[roundKey];
      if (!pick) {
        if (this._lmsDeadlineState().locked) {
          player.results = player.results || {};
          player.results[roundKey] = "eliminated-no-pick";
          player.alive = false;
        } else {
          waiting = true;
        }
        continue;
      }
      const roundStarted = Number(competition.roundStarted || 0);
      const candidates = fixtures
        .filter((item) => (item.home_team === pick || item.away_team === pick) && this._lmsFixtureTimestamp(item) >= roundStarted - 86400)
        .sort((a, b) => this._lmsFixtureTimestamp(a) - this._lmsFixtureTimestamp(b));
      const match = candidates[0];
      const finished = ["FT", "AET", "PEN"].includes(String(match?.status_short || match?.status || "").toUpperCase());
      if (!match || !finished) {
        waiting = true;
        continue;
      }
      const home = Number(match.home_goals);
      const away = Number(match.away_goals);
      const won = (match.home_team === pick && home > away) || (match.away_team === pick && away > home);
      player.results = player.results || {};
      player.results[roundKey] = won ? "survived" : "eliminated";
      if (!won) player.alive = false;
      const emailKey = `${roundKey}:${player.id}`;
      if (player.email && !competition.matchResultEmails?.[emailKey]) {
        competition.matchResultEmails = competition.matchResultEmails || {};
        competition.matchResultEmails[emailKey] = "sending";
        void this._sendLmsPlayerMatchResultEmail(player, roundKey, match, won).then((sent) => {
          if (sent) competition.matchResultEmails[emailKey] = Math.floor(Date.now() / 1000);
          else delete competition.matchResultEmails[emailKey];
          this._saveLms();
        });
      }
    }
    const unresolved = competition.players.some((player) => player.alive && player.picks?.[roundKey] && !player.results?.[roundKey]);
    const pickedTeams = new Set(competition.players.map((player) => player.picks?.[roundKey]).filter(Boolean));
    const pickedFixtures = fixtures.filter((fixture) => pickedTeams.has(fixture.home_team) || pickedTeams.has(fixture.away_team));
    const pickedMatchesFinished = pickedFixtures.length > 0 && pickedFixtures.every((fixture) => ["FT", "AET", "PEN"].includes(String(fixture.status_short || fixture.status || "").toUpperCase()));
    if (pickedMatchesFinished && !waiting && !unresolved) {
      const survivors = competition.players.filter((player) => player.alive);
      const completedRoundEnds = fixtures.map((fixture) => this._lmsFixtureTimestamp(fixture)).filter(Boolean);
      const nextRoundStartsAfter = completedRoundEnds.length ? Math.max(...completedRoundEnds) + 300 : Math.floor(Date.now() / 1000);
      if (!competition.resultsEmailSent?.[roundKey]) {
        competition.resultsEmailSent = competition.resultsEmailSent || {};
        competition.resultsEmailSent[roundKey] = Math.floor(Date.now() / 1000);
        const summary = competition.players.map((player) => `${player.name}: ${player.picks?.[roundKey] || "No pick"} - ${player.results?.[roundKey] === "survived" ? "Through" : "Out"}`).join("\n");
        for (const player of competition.players.filter((item) => item.email)) void this._sendLmsRoundResultEmail(player, roundKey, summary);
      }
      if (survivors.length <= 1 && competition.players.length > 0) {
        competition.completed = true;
        competition.winnerId = survivors[0]?.id || "";
      } else {
        competition.round += 1;
        competition.roundStarted = nextRoundStartsAfter;
        const nextRoundKey = String(competition.round);
        competition.nextRoundEmailSchedules = competition.nextRoundEmailSchedules || {};
        competition.nextRoundEmailSchedules[nextRoundKey] = {
          sendAt: Math.floor(Date.now() / 1000) + (3 * 60 * 60),
          sent: false,
          previousRound: roundKey,
        };
      }
    }
    this._saveLms();
    this._render();
  }

  async _sendLmsRoundResultEmail(player, roundKey, summary) {
    const competition = this._lmsCompetition;
    const action = String(competition?.emailNotifyService || "__auto__");
    if (!competition || !player?.email || !this._hass?.callService) return false;
    const matchedEntity = this._lmsNotifyEntityForEmail(player.email);
    const [domain, ...serviceParts] = action.split(".");
    const service = serviceParts.join(".");
    if (!matchedEntity && action === "__auto__") return false;
    const data = { title: `${competition.name} - Round ${roundKey} results`, message: `Hi ${player.name},\n\nRound ${roundKey} is complete.\n\n${summary}\n\n${competition.shareUrl ? `View the competition: ${competition.shareUrl}\n\n` : ""}Football Hub` };
    try {
      if (matchedEntity || this._hass.states?.[action]) await this._hass.callService("notify", "send_message", data, { entity_id: matchedEntity || action });
      else await this._hass.callService(domain, service, { ...data, target: [player.email] });
      return true;
    } catch (error) { console.warn("Football Hub LMS result email failed", error); return false; }
  }

  async _sendLmsPlayerMatchResultEmail(player, roundKey, match, won) {
    const competition = this._lmsCompetition;
    const action = String(competition?.emailNotifyService || "__auto__");
    if (!competition || !player?.email || !match || !this._hass?.callService) return false;
    const matchedEntity = this._lmsNotifyEntityForEmail(player.email);
    const [domain, ...serviceParts] = action.split(".");
    const service = serviceParts.join(".");
    if (!matchedEntity && action === "__auto__") return false;
    const data = { title: `${competition.name} - ${won ? "You are through" : "You are out"}`, message: `Hi ${player.name},\n\nYour Round ${roundKey} result is in.\n\n${match.home_team} ${match.home_goals} - ${match.away_goals} ${match.away_team}\n\nYour pick: ${player.picks?.[roundKey] || "Not recorded"}\nResult: ${won ? "THROUGH" : "OUT"}\n\n${competition.shareUrl ? `View the competition: ${competition.shareUrl}\n\n` : ""}Football Hub` };
    try {
      if (matchedEntity || this._hass.states?.[action]) await this._hass.callService("notify", "send_message", data, { entity_id: matchedEntity || action });
      else await this._hass.callService(domain, service, { ...data, target: [player.email] });
      return true;
    } catch (error) { console.warn("Football Hub LMS player result email failed", error); return false; }
  }

  _settleGlobalLmsRound() {
    const competition = this._lmsCompetition;
    if (!competition) return;
    const roundKey = String(competition.round);
    this._captureLmsLeagueData();
    const fixtures = this._lmsRoundFixtureGroups().flatMap((league) => league.roundFixtures || []);
    let waiting = false;
    for (const player of competition.players || []) {
      player.results = player.results || {};
      if (player.results[roundKey] !== undefined) continue;
      const pick = player.picks?.[roundKey];
      if (!pick) {
        if (this._lmsDeadlineState().locked) player.results[roundKey] = "0";
        else waiting = true;
        continue;
      }
      const match = fixtures.find((fixture) => fixture.home_team === pick || fixture.away_team === pick);
      if (!match || !["FT", "AET", "PEN"].includes(String(match.status_short || match.status || "").toUpperCase())) {
        waiting = true;
        continue;
      }
      const home = Number(match.home_goals);
      const away = Number(match.away_goals);
      const won = (match.home_team === pick && home > away) || (match.away_team === pick && away > home);
      const drawn = home === away;
      const earned = won ? 3 : drawn ? 1 : 0;
      player.results[roundKey] = String(earned);
      player.points = Number(player.points || 0) + earned;
    }
    const roundFinished = fixtures.length > 0 && fixtures.every((fixture) => ["FT", "AET", "PEN"].includes(String(fixture.status_short || fixture.status || "").toUpperCase()));
    if (roundFinished && !waiting) {
      competition.round += 1;
      competition.roundStarted = Math.floor(Date.now() / 1000);
    }
    this._saveLms();
    this._render();
  }

  _saveDoublePickGame() {
    localStorage.setItem("football_hub_double_pick_game", JSON.stringify(this._doublePickGame));
    this._saveSharedPreferences();
    if (this._doublePickGame?.shareId && this._doublePickGame?.shareEditToken) {
      clearTimeout(this._doublePickShareTimer);
      this._doublePickShareTimer = setTimeout(() => this._syncDoublePickShare(), 800);
    }
  }

  _doublePickDefaultDates(startFrom = Date.now()) {
    const start = new Date(startFrom);
    const localStart = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    const end = new Date(start.getTime() + 6 * 86400000);
    const localEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000);
    return { startDate: localStart.toISOString().slice(0, 10), endDate: localEnd.toISOString().slice(0, 10) };
  }

  _createDoublePickGame(name, competitionKeys, playerText, pickCount = 2) {
    const catalogue = this._statusInfo().available_competitions || [];
    const competitions = catalogue.filter((item) => competitionKeys.includes(item.key)).map((item) => ({ key: item.key, name: item.name, country: item.country, type: item.type || "league" }));
    const playerLines = String(playerText || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const playerDetails = playerLines.map((line) => { const [playerName, ...emailParts] = line.split(","); return { name: playerName.trim(), email: emailParts.join(",").trim() }; }).filter((item) => item.name);
    if (!competitions.length || playerDetails.length < 2) {
      window.alert("Choose at least one competition and add at least two players.");
      return;
    }
    const players = playerDetails.map((item, index) => ({ id: `dp-${Date.now()}-${index}`, name: item.name, email: item.email, points: 0 }));
    const dates = this._doublePickDefaultDates();
    this._doublePickGame = {
      id: `double-pick-${Date.now()}`,
      name: String(name || "Acca League").trim() || "Acca League",
      created: new Date().toISOString(), round: 1, competitions, players, pickCount: Math.max(1, Math.min(20, Number(pickCount) || 2)), emailNotifyService: this._lmsConfiguredEmailService(), emailServiceInherited: true,
      rounds: { "1": { number: 1, ...dates, competitionKeys: competitions.map((item) => item.key), payerId: players[0].id, stake: 0, returnAmount: 0, picks: {}, results: {}, settled: false } },
    };
    this._doublePickActiveCompetition = competitions[0].key;
    localStorage.setItem("football_hub_double_pick_active_competition", this._doublePickActiveCompetition);
    this._saveDoublePickGame();
    this._loadDoublePickCompetition(this._doublePickActiveCompetition);
    this._render();
  }

  _doublePickRound() {
    const game = this._doublePickGame;
    if (!game) return null;
    const key = String(game.round || 1);
    if (!game.rounds?.[key]) {
      game.rounds = game.rounds || {};
      game.rounds[key] = { number: Number(game.round || 1), ...this._doublePickDefaultDates(), competitionKeys: (game.competitions || []).map((item) => item.key), payerId: game.players?.[0]?.id || "", stake: 0, returnAmount: 0, picks: {}, results: {}, settled: false };
    }
    return game.rounds[key];
  }

  _doublePickRoundCompetitions(round = this._doublePickRound()) {
    const keys = new Set(round?.competitionKeys?.length ? round.competitionKeys : (this._doublePickGame?.competitions || []).map((item) => item.key));
    const catalogue = this._statusInfo().available_competitions || [];
    return [...new Map(catalogue.filter((item) => keys.has(item.key)).map((item) => [item.key, { key:item.key, name:item.name, country:item.country, type:item.type || "league" }])).values()];
  }

  _captureDoublePickData() {
    const game = this._doublePickGame;
    if (!game || this._activeTab !== "double-pick-league") return;
    for (const competition of game.competitions || []) {
      let ready = false, fixtures = [], teams = [];
      if (competition.type === "cup") {
        const cup = this._attrs("cup_centre");
        ready = cup.competition_key === competition.key;
        if (ready) {
          fixtures = [...(cup.fixtures || []), ...(cup.live || []), ...(cup.results || [])];
          teams = [...(cup.table || [])].map((row) => row.team || row.team_name);
        }
      } else {
        const fixtureData = this._attrs("fixtures");
        const resultData = this._attrs("results");
        ready = this._statusInfo().competition_key === competition.key && fixtureData.competition_key === competition.key && resultData.competition_key === competition.key;
        if (ready) {
          // Fixtures and results are scoped to the competition currently loaded in
          // Football Hub. The live feed is global and must not populate this cache,
          // otherwise unrelated countries and clubs leak into the Acca picker.
          // The fixtures entity contains the selected competition's complete
          // schedule, including completed matches. Do not merge latest_5 here:
          // that feed may contain results from a different competition.
          fixtures = [...(fixtureData.fixtures || []), ...(resultData.results || [])];
          teams = [...(this._attrs("standings").table || [])].map((row) => row.team || row.team_name);
        }
      }
      if (!ready) continue;
      fixtures = fixtures.filter((fixture) => this._doublePickFixtureMatchesCompetition(fixture, competition));
      const uniqueFixtures = [...new Map(fixtures.map((fixture, index) => [String(fixture.fixture_id ?? fixture.id ?? `${fixture.home_team}-${fixture.away_team}-${fixture.timestamp || index}`), fixture])).values()];
      teams.push(...uniqueFixtures.flatMap((fixture) => [fixture.home_team, fixture.away_team]));
      this._doublePickCache[competition.key] = { competitionKey: competition.key, teams: [...new Set(teams.filter(Boolean))].sort((a, b) => a.localeCompare(b)), fixtures: uniqueFixtures, updated: Date.now() };
      localStorage.setItem("football_hub_double_pick_cache", JSON.stringify(this._doublePickCache));
    }
  }

  _doublePickFixtureMatchesCompetition(fixture, competition) {
    const rawLabel = fixture.competition || fixture.competition_name || fixture.league_name || fixture.league?.name || "";
    const clean = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const label = clean(rawLabel), target = clean(competition?.name);
    if (label.includes("friendly") || label.includes("friendlies")) return target.includes("friendly");
    if (!label || !target) return true;
    const aliases = {
      "premier league": ["premier league", "english premier league"],
      "championship": ["championship", "efl championship"],
      "league one": ["league one", "efl league one"],
      "league two": ["league two", "efl league two"],
    };
    return (aliases[target] || [target]).some((name) => label === name || label.includes(name));
  }

  _loadDoublePickCompetition(key) {
    const competition = this._doublePickGame?.competitions?.find((item) => item.key === key);
    if (!competition) return;
    this._doublePickActiveCompetition = key;
    localStorage.setItem("football_hub_double_pick_active_competition", key);
    if (competition.type === "cup") this._setCup(key);
    else this._setLeague(key);
  }

  _loadAllDoublePickCompetitions() {
    this._doublePickLoadQueue = [...new Set(this._doublePickRoundCompetitions().map((item) => item.key))];
    const next = this._doublePickLoadQueue.shift();
    if (next) this._loadDoublePickCompetition(next);
  }

  _scheduleDoublePickCapture(key, type) {
    if (this._doublePickFinalizing) return;
    this._doublePickFinalizing = true;
    let attempts = 0;
    const finish = () => {
      attempts += 1;
      const fixtures = this._attrs("fixtures"), results = this._attrs("results");
      const ready = type === "cup"
        ? this._attrs("cup_centre").competition_key === key
        : this._statusInfo().competition_key === key && fixtures.competition_key === key && results.competition_key === key;
      if (!ready && attempts < 12) { setTimeout(finish, 500); return; }
      if (ready && this._activeTab === "double-pick-league") this._captureDoublePickData();
      this._doublePickFinalizing = false;
      const next = this._doublePickLoadQueue?.shift();
      if (next) this._loadDoublePickCompetition(next); else this._render();
    };
    setTimeout(finish, 500);
  }

  _updateDoublePickCompetitions(keys) {
    const game = this._doublePickGame;
    if (!game || !keys.length) { window.alert("Keep at least one league or cup selected."); return; }
    const wanted = new Set(keys);
    const catalogue = this._statusInfo().available_competitions || [];
    const round = this._doublePickRound();
    round.competitionKeys = [...wanted];
    const chosen = catalogue.filter((item) => wanted.has(item.key)).map((item) => ({ key:item.key, name:item.name, country:item.country, type:item.type || "league" }));
    game.competitions = [...new Map([...(game.competitions || []), ...chosen].map((item) => [item.key, item])).values()];
    for (const [playerId, picks] of Object.entries(round.picks || {})) round.picks[playerId] = (picks || []).map((pick) => wanted.has(String(pick || "").split("|||")[0]) ? pick : "");
    localStorage.setItem("football_hub_double_pick_cache", JSON.stringify(this._doublePickCache));
    if (!wanted.has(this._doublePickActiveCompetition)) this._doublePickActiveCompetition = chosen[0]?.key || "";
    this._saveDoublePickGame();
    this._render();
  }

  _doublePickRoundFixtures(round = this._doublePickRound()) {
    if (!round) return [];
    const start = new Date(`${round.startDate}T00:00:00`).getTime() / 1000;
    const end = new Date(`${round.endDate}T23:59:59`).getTime() / 1000;
    return this._doublePickRoundCompetitions(round).flatMap((competition) => {
      const cache = this._doublePickCache?.[competition.key];
      if (!cache || cache.competitionKey !== competition.key) return [];
      return (cache.fixtures || [])
        .filter((fixture) => { const timestamp = this._lmsFixtureTimestamp(fixture); return timestamp >= start && timestamp <= end; })
        .map((fixture) => ({ ...fixture, competitionKey: competition.key, competitionName: competition.name, country: competition.country }));
    }
    ).sort((a, b) => this._lmsFixtureTimestamp(a) - this._lmsFixtureTimestamp(b));
  }

  _setDoublePick(playerId, slot, value) {
    const round = this._doublePickRound();
    if (!round || round.settled) return;
    round.picks[playerId] = round.picks[playerId] || Array(Number(this._doublePickGame?.pickCount || 2)).fill("");
    if (value && round.picks[playerId].some((picked, index) => index !== Number(slot) && picked === value)) {
      window.alert("Each selection must use a different team for this player.");
      return;
    }
    round.picks[playerId][Number(slot)] = value;
    this._saveDoublePickGame();
    this._render();
  }

  _settleDoublePickRound() {
    const game = this._doublePickGame;
    const round = this._doublePickRound();
    if (!game || !round) return;
    const fixtures = this._doublePickRoundFixtures(round);
    const finishedStatuses = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
    let waiting = false;
    for (const player of game.players || []) {
      const picks = round.picks?.[player.id] || [];
      const previousResults = round.results[player.id] || {};
      const refreshedResults = {};
      for (let slot = 0; slot < Number(game.pickCount || 2); slot += 1) {
        const value = picks[slot];
        if (!value) { waiting = true; continue; }
        const [competitionKey, ...teamParts] = value.split("|||");
        const team = teamParts.join("|||");
        const match = fixtures.find((fixture) => fixture.competitionKey === competitionKey && (fixture.home_team === team || fixture.away_team === team));
        const status = String(match?.status_short || match?.status || "").toUpperCase();
        if (!match || !finishedStatuses.has(status)) {
          waiting = true;
          if (previousResults[slot]) refreshedResults[slot] = previousResults[slot];
          continue;
        }
        const home = Number(match.home_goals), away = Number(match.away_goals);
        const won = (match.home_team === team && home > away) || (match.away_team === team && away > home);
        const drawn = home === away;
        const points = won ? 3 : drawn ? 1 : 0;
        const opponent = match.home_team === team ? match.away_team : match.home_team;
        refreshedResults[slot] = { team, competitionKey, competitionName: match.competitionName, kickoff: this._lmsFixtureTimestamp(match), points, outcome: won ? "Win" : drawn ? "Draw" : "Loss", score: `${home}-${away}`, opponent, fixtureId: match.fixture_id ?? match.id };
      }
      round.results[player.id] = refreshedResults;
    }
    for (const player of game.players || []) {
      player.points = Object.values(game.rounds || {}).reduce((total, savedRound) =>
        total + Object.values(savedRound.results?.[player.id] || {}).reduce((roundTotal, result) => roundTotal + Number(result?.points || 0), 0), 0);
    }
    round.settled = !waiting && (game.players || []).every((player) => Object.keys(round.results?.[player.id] || {}).length === Number(game.pickCount || 2));
    this._saveDoublePickGame();
    this._render();
  }

  _nextDoublePickRound() {
    const game = this._doublePickGame;
    const current = this._doublePickRound();
    if (!game || !current) return;
    const nextNumber = Number(game.round || 1) + 1;
    const currentPayerIndex = Math.max(0, (game.players || []).findIndex((player) => player.id === current.payerId));
    const nextPayer = game.players?.[(currentPayerIndex + 1) % game.players.length];
    const nextStart = new Date(`${current.endDate}T00:00:00`).getTime() + 86400000;
    game.round = nextNumber;
    game.rounds[String(nextNumber)] = { number: nextNumber, ...this._doublePickDefaultDates(nextStart), competitionKeys: [...(current.competitionKeys || (game.competitions || []).map((item) => item.key))], payerId: nextPayer?.id || "", stake: 0, returnAmount: 0, picks: {}, results: {}, settled: false };
    this._saveDoublePickGame();
    this._render();
  }

  async _sendDoublePickEmail(player, title, message, quiet = false) {
    const action = String(this._doublePickGame?.emailNotifyService || "__auto__");
    if (!player?.email || !this._hass?.callService) {
      if (!quiet) window.alert(`Add an email address for ${player?.name || "this player"} first.`);
      return false;
    }
    const matchedEntity = this._lmsNotifyEntityForEmail(player.email);
    const [domain, ...serviceParts] = action.split(".");
    const service = serviceParts.join(".");
    if (!matchedEntity && action === "__auto__") {
      if (!quiet) window.alert(`No Home Assistant SMTP recipient entity matches ${player.email}.`);
      return false;
    }
    try {
      const link = this._doublePickGame?.shareUrl ? `\n\nView the live table and results: ${this._doublePickGame.shareUrl}` : "";
      const data = { title, message: `Hi ${player.name},\n\n${message}${link}\n\nFootball Hub · Acca League` };
      if (matchedEntity || this._hass.states?.[action]) await this._hass.callService("notify", "send_message", data, { entity_id: matchedEntity || action });
      else await this._hass.callService(domain, service, { ...data, target: [player.email] });
      return true;
    } catch (error) {
      console.warn("Acca League email failed", error);
      if (!quiet) window.alert(`Email could not be sent to ${player.name}.`);
      return false;
    }
  }

  _doublePickEmailSummary(includeResults = false) {
    const game = this._doublePickGame, round = this._doublePickRound();
    if (!game || !round) return "";
    const lines = (game.players || []).map((player) => {
      const picks = round.picks?.[player.id] || [];
      const results = round.results?.[player.id] || {};
      const pickText = Array.from({ length: Number(game.pickCount || 2) }, (_, slot) => {
        const team = String(picks[slot] || "").split("|||").slice(1).join("|||") || "Not selected";
        const result = results[slot];
        return `${team}${includeResults && result ? ` — ${result.outcome}, ${result.score}, ${result.points} points` : ""}`;
      }).join(" + ");
      return `${player.name}: ${pickText}`;
    });
    const payer = game.players.find((player) => player.id === round.payerId)?.name || "Not recorded";
    const money = includeResults ? `\nStake: £${Number(round.stake || 0).toFixed(2)}\nReturn: £${Number(round.returnAmount || 0).toFixed(2)}\nProfit/loss: £${(Number(round.returnAmount || 0) - Number(round.stake || 0)).toFixed(2)}` : "";
    return `Round ${game.round} (${round.startDate} to ${round.endDate})\nPaid by: ${payer}\n\n${lines.join("\n")}${money}`;
  }

  async _emailDoublePickRound(kind) {
    const game = this._doublePickGame, round = this._doublePickRound();
    if (!game || !round) return;
    const payer = game.players.find((player) => player.id === round.payerId);
    let sent = 0;
    for (const player of game.players || []) {
      if (!player.email) continue;
      let title, message;
      if (kind === "reminder") {
        title = `${game.name} · Round ${game.round} picks`;
        message = `Please choose your ${game.pickCount || 2} teams for Round ${game.round}. The round covers ${round.startDate} to ${round.endDate}.${player.id === round.payerId ? "\n\nIt is your turn to place and pay for this round's bet." : `\n\n${payer?.name || "The selected player"} is paying this round.`}`;
      } else if (kind === "confirmation") {
        title = `${game.name} · Round ${game.round} selections`;
        message = `The selections are confirmed:\n\n${this._doublePickEmailSummary(false)}`;
      } else {
        title = `${game.name} · Round ${game.round} results`;
        message = `The round results are in:\n\n${this._doublePickEmailSummary(true)}`;
      }
      if (await this._sendDoublePickEmail(player, title, message, true)) sent += 1;
    }
    window.alert(sent ? `Email sent to ${sent} player${sent === 1 ? "" : "s"}.` : "No matching player email entities were available.");
  }

  async _emailDoublePickPlayer(playerId, kind) {
    const game = this._doublePickGame, round = this._doublePickRound();
    const player = game?.players?.find((item) => item.id === playerId);
    if (!game || !round || !player) return;
    const payer = game.players.find((item) => item.id === round.payerId);
    let title, message;
    if (kind === "reminder") {
      title = `${game.name} · Round ${game.round} picks`;
      message = `Please choose your ${game.pickCount || 2} teams for Round ${game.round}. The round covers ${round.startDate} to ${round.endDate}.${player.id === round.payerId ? "\n\nIt is your turn to place and pay for this round's bet." : `\n\n${payer?.name || "The selected player"} is paying this round.`}`;
    } else if (kind === "confirmation") {
      title = `${game.name} · Round ${game.round} selections`;
      message = `The selections are confirmed:\n\n${this._doublePickEmailSummary(false)}`;
    } else {
      title = `${game.name} · Round ${game.round} results`;
      message = `The round results are in:\n\n${this._doublePickEmailSummary(true)}`;
    }
    if (await this._sendDoublePickEmail(player, title, message)) window.alert(`${kind === "reminder" ? "Pick reminder" : kind === "confirmation" ? "Confirmed picks" : "Round results"} emailed to ${player.name}.`);
  }

  _doublePickSharePayload() {
    const game = structuredClone(this._doublePickGame || {});
    game.gameType = "acca";
    delete game.shareId; delete game.shareUrl; delete game.shareEditToken;
    game.players = (game.players || []).map((player) => { const clean = { ...player }; delete clean.email; return clean; });
    return game;
  }

  async _createDoublePickShare() {
    const game = this._doublePickGame;
    if (!game || game.shareId) return;
    const adminPassword = crypto.getRandomValues(new Uint32Array(4)).join("").slice(0, 18);
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ competition: this._doublePickSharePayload(), adminPassword }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create Acca League link");
      game.shareId = result.shareId; game.shareEditToken = result.editToken; game.shareUrl = result.shareUrl;
      this._saveDoublePickGame(); this._render();
      const copied = await this._copyText(result.shareUrl);
      if (copied) window.alert("Acca League link created and copied."); else window.prompt("Copy the Acca League link:", result.shareUrl);
    } catch (error) { window.alert(error?.message || "Unable to create Acca League link."); }
  }

  async _syncDoublePickShare() {
    const game = this._doublePickGame;
    if (!game?.shareId || !game?.shareEditToken) return;
    try {
      const response = await fetch(`${LMS_SHARE_SERVICE}/api/competitions/${encodeURIComponent(game.shareId)}`, { method: "PUT", headers: { "content-type": "application/json", authorization: `Bearer ${game.shareEditToken}` }, body: JSON.stringify({ competition: this._doublePickSharePayload() }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Acca League update failed");
      game.shareUrl = result.shareUrl || game.shareUrl;
      localStorage.setItem("football_hub_double_pick_game", JSON.stringify(game));
    } catch (error) { console.warn("Acca League public update failed", error); }
  }

  _doublePickLeaguePage() {
    const game = this._doublePickGame;
    const catalogue = (this._statusInfo().available_competitions || []).slice().sort((a, b) => String(a.country).localeCompare(String(b.country)) || String(a.name).localeCompare(String(b.name)));
    if (!game) {
      const countries = [...new Set(catalogue.map((item) => item.country).filter(Boolean))];
      const defaults = new Set();
      return `<section class="page-heading acca-heading"><div><span class="eyebrow">FOOTBALL HUB GAME</span><h1>Acca League</h1><p>Build a points competition around the fixtures you already follow.</p></div><div class="count-badge">3 · 1 · 0</div></section><section class="page-card acca-setup"><header class="acca-section-head"><ha-icon icon="mdi:trophy-variant-outline"></ha-icon><div><span class="eyebrow">GAME DETAILS</span><h2>Create your Acca League</h2><p>Choose the number of teams each player picks in every round.</p></div></header><div class="acca-form-grid"><label><span>Game name</span><input id="dp-game-name" value="Acca League" maxlength="60"></label><label><span>Teams per player</span><input id="dp-pick-count" type="number" min="1" max="20" value="2"></label></div><section class="acca-player-setup"><div class="acca-section-title"><div><span class="eyebrow">PLAYERS & EMAIL</span><h3>Add everyone taking part</h3></div><small>Add one player per line. Emails are optional and can be added or changed later.</small></div><textarea id="dp-player-names" rows="5" placeholder="Adrian,adrian@example.com\nDave,dave@example.com">Adrian\nFriend</textarea><div class="acca-format-help"><ha-icon icon="mdi:information-outline"></ha-icon><span>Use <b>Name,email</b> on each line. A name on its own is fine.</span></div></section><section class="acca-competitions"><div class="acca-section-title"><div><span class="eyebrow">FIXTURE SOURCES</span><h3>Choose leagues and cups</h3></div><small>Premier League through League Two are selected initially.</small></div><div class="dp-competition-groups">${countries.map((country) => `<fieldset><legend><ha-icon icon="mdi:flag-outline"></ha-icon>${this._escape(country)}</legend>${catalogue.filter((item) => item.country === country).map((item) => `<label><input type="checkbox" class="dp-competition-check" value="${this._escape(item.key)}" ${defaults.has(item.key) ? "checked" : ""}><span><b>${this._escape(item.name)}</b><small>${item.type === "cup" ? "Cup" : "League"}</small></span></label>`).join("")}</fieldset>`).join("")}</div></section><div class="acca-create-bar"><div><strong>Ready to begin?</strong><small>You can add player emails after setup.</small></div><button id="dp-create" class="lms-create-button"><ha-icon icon="mdi:plus-circle-outline"></ha-icon>Create Acca League</button></div></section>`;
    }
    this._captureDoublePickData();
    const round = this._doublePickRound();
    const fixtures = this._doublePickRoundFixtures(round);
    const alphabetical = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    const optionGroups = this._doublePickRoundCompetitions(round).sort((a, b) => alphabetical.compare(`${a.country} ${a.name}`, `${b.country} ${b.name}`)).map((competition) => {
      const cache = this._doublePickCache?.[competition.key];
      const roundTeams = [...new Set(fixtures.filter((fixture) => fixture.competitionKey === competition.key).flatMap((fixture) => [fixture.home_team, fixture.away_team]).filter(Boolean))].sort((a, b) => alphabetical.compare(a, b));
      return { ...competition, teams: roundTeams, loaded: Boolean(cache), fixtureCount: fixtures.filter((fixture) => fixture.competitionKey === competition.key).length };
    });
    const pickOptions = (selected = "") => `<option value="">Choose a team</option>${optionGroups.filter((group) => group.teams.length).map((group) => `<optgroup label="${this._escape(`── ${String(group.country || "").toUpperCase()} · ${String(group.name || "").toUpperCase()} · ${group.fixtureCount} FIXTURE${group.fixtureCount === 1 ? "" : "S"} ──`)}">${group.teams.map((team) => { const value = `${group.key}|||${team}`; return `<option value="${this._escape(value)}" ${value === selected ? "selected" : ""}>${this._escape(team)}</option>`; }).join("")}</optgroup>`).join("")}`;
    const payer = game.players.find((player) => player.id === round.payerId);
    const previousRounds = Object.values(game.rounds || {}).filter((item) => Number(item.number) < Number(game.round)).sort((a, b) => b.number - a.number);
    const lastPaid = previousRounds.map((item) => game.players.find((player) => player.id === item.payerId)?.name).find(Boolean) || "No previous round";
    const table = [...game.players].sort((a, b) => Number(b.points || 0) - Number(a.points || 0) || a.name.localeCompare(b.name));
    const playerRows = game.players.map((player) => { const picks = round.picks?.[player.id] || Array(Number(game.pickCount || 2)).fill(""); const results = round.results?.[player.id] || {}; return `<article class="page-card dp-player-card"><header><div class="dp-player-identity"><span class="dp-avatar">${this._escape(String(player.name || "P").slice(0,1).toUpperCase())}</span><div><span class="eyebrow">PLAYER</span><h3>${this._escape(player.name)}</h3><span class="dp-email-status ${player.email ? "ready" : "missing"}"><ha-icon icon="mdi:${player.email ? "email-check-outline" : "email-plus-outline"}"></ha-icon>${this._escape(player.email || "No email added")}</span></div></div><div class="dp-player-actions"><strong>${Number(player.points || 0)} pts</strong><button class="dp-edit-email" data-player-id="${this._escape(player.id)}"><ha-icon icon="mdi:email-edit-outline"></ha-icon>${player.email ? "Edit email" : "Add email"}</button></div></header><div class="dp-picks">${Array.from({ length: Number(game.pickCount || 2) }, (_, slot) => `<label><span>Pick ${slot + 1}</span><select class="dp-pick" data-player-id="${this._escape(player.id)}" data-slot="${slot}" ${round.settled ? "disabled" : ""}>${pickOptions(picks[slot])}</select>${results[slot] ? `<span class="dp-pick-result ${results[slot].outcome.toLowerCase()}">${this._escape(`${results[slot].outcome} · ${results[slot].score} vs ${results[slot].opponent} · ${results[slot].points} pts · ${results[slot].kickoff ? new Date(results[slot].kickoff * 1000).toLocaleString() : "Date unavailable"}`)}</span>` : picks[slot] ? `<span class="dp-pick-result waiting">Waiting for result</span>` : ""}</label>`).join("")}</div><div class="dp-player-email-actions"><span>Send only to ${this._escape(player.name)}</span><button class="dp-email-player" data-player-id="${this._escape(player.id)}" data-email-kind="reminder" ${player.email ? "" : "disabled"}>Pick reminder</button><button class="dp-email-player" data-player-id="${this._escape(player.id)}" data-email-kind="confirmation" ${player.email ? "" : "disabled"}>Team picks</button><button class="dp-email-player" data-player-id="${this._escape(player.id)}" data-email-kind="results" ${player.email ? "" : "disabled"}>Results</button></div></article>`; }).join("");
    const history = Object.values(game.rounds || {}).sort((a, b) => b.number - a.number).map((item) => { const paid = game.players.find((player) => player.id === item.payerId)?.name || "Not recorded"; return `<article class="page-card dp-history-card"><header><strong>Round ${item.number}</strong><span>${this._escape(item.startDate)} to ${this._escape(item.endDate)}</span><b>Paid by ${this._escape(paid)}</b></header>${game.players.map((player) => { const picks = item.picks?.[player.id] || []; const results = item.results?.[player.id] || {}; const earned = Object.values(results).reduce((total, result) => total + Number(result.points || 0), 0); return `<div><strong>${this._escape(player.name)}</strong><span>${picks.map((value, index) => { const team = String(value || "").split("|||").slice(1).join("|||") || "No pick"; const result = results[index]; return `${team}${result ? ` (${result.outcome}, ${result.points} pts)` : ""}`; }).join(" · ")}</span><b>${earned} pts</b></div>`; }).join("")}</article>`; }).join("");
    return `<section class="page-heading"><div><span class="eyebrow">TWO PICKS · 3/1/0 SCORING</span><h1>${this._escape(game.name)}</h1><p>Round ${game.round} · ${this._escape(round.startDate)} to ${this._escape(round.endDate)}</p></div><div class="count-badge">${game.players.length} players</div></section><section class="dp-summary-grid"><article class="page-card"><span>Paying this round</span><strong>${this._escape(payer?.name || "Choose payer")}</strong><small>Last paid: ${this._escape(lastPaid)}</small></article><article class="page-card"><span>Round fixtures</span><strong>${fixtures.length}</strong><small>${optionGroups.filter((group) => group.loaded).length}/${game.competitions.length} competitions loaded</small></article><article class="page-card"><span>Scoring</span><strong>3 · 1 · 0</strong><small>Win · Draw · Loss</small></article></section><nav class="lms-page-tabs"><button class="${this._doublePickView === "picks" ? "active" : ""}" data-dp-view="picks">Picks</button><button class="${this._doublePickView === "fixtures" ? "active" : ""}" data-dp-view="fixtures">Fixtures</button><button class="${this._doublePickView === "table" ? "active" : ""}" data-dp-view="table">Table</button><button class="${this._doublePickView === "history" ? "active" : ""}" data-dp-view="history">History</button></nav><section class="page-card dp-round-controls"><label>Round start<input id="dp-round-start" type="date" value="${this._escape(round.startDate)}"></label><label>Round end<input id="dp-round-end" type="date" value="${this._escape(round.endDate)}"></label><label>Who paid?<select id="dp-payer">${game.players.map((player) => `<option value="${this._escape(player.id)}" ${player.id === round.payerId ? "selected" : ""}>${this._escape(player.name)}</option>`).join("")}</select></label><button id="dp-check-results">Check results</button><button id="dp-next-round" ${round.settled ? "" : "disabled"}>Start next round</button></section><section class="page-card dp-load-data"><header><div><span class="eyebrow">SELECTED COMPETITIONS</span><h2>Load fixtures and teams</h2></div><button id="dp-delete" class="danger">Delete game</button></header><div>${optionGroups.map((group) => `<button class="dp-load-competition ${this._doublePickActiveCompetition === group.key ? "active" : ""}" data-competition="${this._escape(group.key)}"><span>${this._escape(group.country)} · ${this._escape(group.name)}</span><b>${group.loaded ? `${group.fixtureCount} round fixtures` : "Load data"}</b></button>`).join("")}</div></section>${this._doublePickView === "picks" ? `<section class="dp-player-grid">${playerRows}</section><section class="page-card dp-add-player"><input id="dp-new-player" placeholder="Add another player"><button id="dp-add-player">Add player</button></section>` : this._doublePickView === "fixtures" ? `<section class="page-card"><h2>Round ${game.round} fixtures</h2><div class="match-list">${fixtures.length ? fixtures.map((fixture) => this._matchCard(fixture, ["FT","AET","PEN"].includes(String(fixture.status_short || "").toUpperCase()) ? "result" : undefined)).join("") : `<div class="empty">Load the selected competitions or adjust the round dates.</div>`}</div></section>` : this._doublePickView === "table" ? `<section class="page-card lms-standings"><div class="lms-standings-table"><div class="lms-standings-row heading"><span>#</span><span>Player</span><span>Points</span><span>Current picks</span><span>Paid rounds</span><span>Status</span></div>${table.map((player, index) => `<div class="lms-standings-row"><span>${index + 1}</span><strong>${this._escape(player.name)}</strong><b>${Number(player.points || 0)}</b><span>${(round.picks?.[player.id] || []).map((value) => String(value).split("|||").slice(1).join("|||")).filter(Boolean).join(" · ") || "Not picked"}</span><span>${Object.values(game.rounds || {}).filter((item) => item.payerId === player.id).length}</span><span>${Object.keys(round.results?.[player.id] || {}).length}/2 results</span></div>`).join("")}</div></section>` : `<section class="dp-history">${history}</section>`}`;
  }

  _lastManStandingPage() {
    const competition = this._lmsCompetition;
    const status = this._statusInfo();
    const leagueCatalogue = (Array.isArray(status.available_competitions) ? status.available_competitions : [])
      .filter((item) => (item.type || "league") === "league")
      .sort((a, b) => String(a.country).localeCompare(String(b.country)) || String(a.name).localeCompare(String(b.name)));
    const leagueCountries = [...new Set(leagueCatalogue.map((item) => item.country).filter(Boolean))];
    this._captureLmsLeagueData();
    const teamGroups = this._lmsTeamGroups();
    const teams = [...new Set(teamGroups.flatMap((league) => league.teams || []))];
    const roundKey = String(competition?.round || 1);
    const alive = competition?.players?.filter((player) => player.alive).length || 0;
    const pickedThisRound = competition?.players?.filter((player) => player.alive && player.picks?.[roundKey]).length || 0;
    const paidCount = competition?.players?.filter((player) => player.paid).length || 0;
    const buyBackCount = competition?.players?.reduce((total, player) => total + Number(player.buyBacks || 0), 0) || 0;
    const entryFee = Number(competition?.entryFee ?? 5);
    const carriedPrize = Number(competition?.carriedPrize || 0);
    const prizeFund = carriedPrize + ((paidCount + buyBackCount) * entryFee);
    const winner = competition?.players?.find((player) => player.id === competition.winnerId);
    const selectedLmsLeague = this._lmsActiveLeague || competition?.leagues?.[0]?.key || "";
    const loadedLmsLeague = status.competition_key === selectedLmsLeague;
    const deadline = this._lmsDeadlineState();
    const adminUnlocked = this._isLmsAdmin();
    const needsAdminPassword = Boolean(competition && !competition.adminPasswordHash);
    const roundFixtureGroups = this._lmsRoundFixtureGroups();
    const roundFixtureCount = roundFixtureGroups.reduce((total, league) => total + league.roundFixtures.length, 0);
    const emailServices = this._lmsEmailServices();
    const selectedEmailService = String(competition?.emailNotifyService || "__auto__");
    const deadlineLocal = deadline.timestamp ? new Date(deadline.timestamp * 1000).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Waiting for fixture times";
    return `
      <section class="page-heading"><div><span class="eyebrow">SURVIVE EVERY ROUND</span><h2>Last Man Standing</h2></div>${competition ? `<div class="count-badge">${alive} remaining</div>` : ""}</section>
      <section class="lms-mode-grid">
        <button class="page-card lms-mode ${this._lmsMode === "private" ? "active" : ""}" data-lms-mode="private"><ha-icon icon="mdi:account-group-lock-outline"></ha-icon><strong>Private Competition</strong><span>Create a competition for friends and manage their weekly picks.</span></button>
        <button class="page-card lms-mode ${this._lmsMode === "global" ? "active" : ""}" data-lms-mode="global"><ha-icon icon="mdi:earth"></ha-icon><strong>Football Hub Global</strong><span>Free public points tournaments for Football Hub players worldwide.</span></button>
      </section>
      <section class="page-card lms-share lms-external-organiser"><ha-icon icon="mdi:open-in-new"></ha-icon><div><span class="eyebrow">EXTERNAL LMS ORGANISER</span><strong>Create a private competition outside Home Assistant</strong><small>Open the standalone Football Hub LMS, then copy its competition and player links to share with friends.</small><a href="${LMS_SHARE_SERVICE}/organise" target="_blank" rel="noopener noreferrer">Football_hub_External</a></div><a class="button-link" href="${LMS_SHARE_SERVICE}/organise" target="_blank" rel="noopener noreferrer">Open organiser</a><button id="lms-copy-external-organiser"><ha-icon icon="mdi:content-copy"></ha-icon> Copy link</button></section>
      ${this._lmsMode === "private" ? `<section class="page-card lms-remote-login"><ha-icon icon="mdi:devices"></ha-icon><div><span class="eyebrow">OPEN ON THIS DEVICE</span><strong>Open or switch to an existing private game</strong><small>Paste its competition or admin link and enter the administrator password. The game will sync between devices.</small></div><input id="lms-remote-game" autocomplete="off" placeholder="Paste competition link or ID here"><input id="lms-remote-password" type="password" autocomplete="current-password" placeholder="Administrator password"><button id="lms-remote-open">Open game</button></section>` : ""}
      ${this._lmsMode === "global" ? !competition ? `
        <section class="page-card lms-create"><div><span class="eyebrow">OFFICIAL FOOTBALL HUB GLOBAL</span><h2>Developer-controlled tournament</h2><p>Only the Football Hub developer can create and administer this official competition. Everyone else can join when entries are open.</p><a href="${LMS_SHARE_SERVICE}/lms/football-hub-global" target="_blank" rel="noopener noreferrer">Open official Global LMS page</a></div><div class="lms-form"><input id="lms-global-developer-key" type="password" autocomplete="off" placeholder="Private developer key" value="${this._escape(this._globalDeveloperKey)}"><input id="lms-name" maxlength="60" placeholder="Tournament name"></div><div class="lms-password-setup"><label><span>Administrator password</span><input id="lms-admin-password" type="password" minlength="4" autocomplete="new-password" placeholder="Create password"></label><label><span>Confirm password</span><input id="lms-admin-confirm" type="password" minlength="4" autocomplete="new-password" placeholder="Repeat password"></label></div><div class="lms-league-heading"><strong>Choose the leagues included</strong><span>Players can pick from every selected league</span></div><div class="lms-league-groups">${leagueCountries.map((country) => `<fieldset><legend>${this._escape(country)}</legend>${leagueCatalogue.filter((item) => item.country === country).map((item) => `<label><input type="checkbox" class="lms-league-check" value="${this._escape(item.key)}" ${item.key === status.competition_key ? "checked" : ""}><span>${this._escape(item.name)}</span></label>`).join("")}</fieldset>`).join("")}</div><button id="lms-create" class="lms-create-button">Create Official Global LMS</button></section>
      ` : `
        <section class="page-card lms-summary"><div><span class="eyebrow">GLOBAL POINTS TOURNAMENT</span><h2>${this._escape(competition.name)}</h2><p>${this._escape((competition.leagues || []).map((item) => item.name).join(" · "))} · Round ${competition.round}</p></div><div class="lms-summary-stats"><span><b>${competition.players.length}</b> players</span><span><b>${Math.max(0, ...competition.players.map((player) => Number(player.points || 0)))}</b> leading points</span>${adminUnlocked ? `<button id="lms-admin-lock">Lock admin</button><button id="lms-delete" class="danger">Delete</button>` : ""}</div></section>
        ${adminUnlocked ? "" : `<section class="page-card lms-admin-unlock"><ha-icon icon="mdi:shield-key-outline"></ha-icon><div><strong>Administrator access required</strong><span>Enter your setup password to manage this tournament.</span></div><input id="lms-admin-unlock-password" type="password" autocomplete="current-password" placeholder="Administrator password"><button id="lms-admin-unlock">Unlock</button></section>`}
        <section class="page-card lms-share"><ha-icon icon="mdi:earth"></ha-icon><div><span class="eyebrow">PUBLIC GLOBAL PAGE</span><strong>${competition.shareUrl ? "Tournament is live" : "Publish the tournament"}</strong><small>Only you can create and administer this tournament. Public visitors can join only while entries are open.</small>${competition.shareUrl ? `<a href="${this._escape(competition.shareUrl)}" target="_blank" rel="noopener noreferrer">${this._escape(competition.shareUrl)}</a>` : ""}</div>${adminUnlocked ? competition.shareUrl ? `<button id="lms-toggle-joining" class="${competition.joiningOpen ? "danger" : ""}">${competition.joiningOpen ? "Close entries" : "Open entries"}</button><button id="lms-copy-share">Copy link</button><button id="lms-share-sync">Update now</button>` : `<button id="lms-create-share">Publish Global LMS</button>` : ""}</section>
        <section class="page-card lms-deadline ${deadline.locked ? "locked" : ""}"><ha-icon icon="mdi:timer-alert-outline"></ha-icon><div><span class="eyebrow">ROUND ${competition.round} DEADLINE</span><strong>${this._escape(deadlineLocal)} local time</strong><small>All picks lock before the first selected match.</small></div><b id="lms-countdown">${deadline.timestamp ? this._formatLmsCountdown(deadline.remaining) : "Waiting for fixture times"}</b></section>
        <section class="page-card lms-rules"><strong>Points rules</strong><span>Win = 3 points</span><span>Draw = 1 point</span><span>Loss or missed pick = 0 points</span><span>No team can be used twice</span><span>Picks stay hidden until the deadline</span></section>
        <section class="page-card lms-league-switch"><label><span>Load league data</span><select id="lms-active-league">${(competition.leagues || []).map((league) => `<option value="${this._escape(league.key)}" ${league.key === selectedLmsLeague ? "selected" : ""}>${this._escape(league.country)} · ${this._escape(league.name)}</option>`).join("")}</select></label><button id="lms-settle">Check scores & award points</button></section>
        <section class="page-card lms-standings"><header><div><span class="eyebrow">GLOBAL LEADERBOARD</span><h2>Points table</h2></div><b>${competition.players.length} players</b></header><div class="lms-standings-table"><div class="lms-standings-row heading"><span>#</span><span>Player</span><span>Points</span><span>Current pick</span><span>Teams used</span><span>Round</span></div>${[...competition.players].sort((a,b) => Number(b.points || 0) - Number(a.points || 0) || String(a.name).localeCompare(String(b.name))).map((player,index) => `<div class="lms-standings-row through"><span>${index+1}</span><strong>${this._escape(player.name)}</strong><span><b>${Number(player.points || 0)} pts</b></span><span>${this._escape(player.picks?.[roundKey] || "Awaiting pick")}</span><span>${this._escape(Object.entries(player.picks || {}).map(([round,team]) => `R${round}: ${team}`).join(" · ") || "None")}</span><span>${competition.round}</span></div>`).join("") || `<div class="empty">Publish the tournament and share its link so players can join.</div>`}</div></section>
      ` : !competition ? `
        <section class="page-card lms-create"><div><span class="eyebrow">NEW PRIVATE GAME</span><h2>Create your competition</h2><p>Win to survive. A draw or defeat eliminates the player, and a team cannot be selected twice.</p></div><div class="lms-form"><input id="lms-name" maxlength="60" placeholder="Competition name"><label class="lms-fee-input"><span>Entry fee</span><b>£</b><input id="lms-entry-fee" type="number" min="0" step="0.50" value="5"></label></div><div class="lms-password-setup"><label><span>Administrator password</span><input id="lms-admin-password" type="password" minlength="6" autocomplete="new-password" placeholder="Create password"></label><label><span>Confirm password</span><input id="lms-admin-confirm" type="password" minlength="6" autocomplete="new-password" placeholder="Repeat password"></label><small>Use this password with the competition link to manage the same game on another device.</small></div><div class="lms-league-heading"><strong>Choose the leagues included</strong><span>Tick one or more leagues</span></div><div class="lms-league-groups">${leagueCountries.map((country) => `<fieldset><legend>${this._escape(country)}</legend>${leagueCatalogue.filter((item) => item.country === country).map((item) => `<label><input type="checkbox" class="lms-league-check" value="${this._escape(item.key)}" ${item.key === status.competition_key ? "checked" : ""}><span>${this._escape(item.name)}</span></label>`).join("")}</fieldset>`).join("")}</div><button id="lms-create" class="lms-create-button">Create competition</button><small>Football Hub will use the selected leagues for team picks and results.</small></section>
      ` : `
        <section class="page-card lms-summary"><div><span class="eyebrow">PRIVATE COMPETITION · EDITION ${Number(competition.edition || 1)}</span><h2>${this._escape(competition.name)}</h2><p>${this._escape((competition.leagues || []).map((item) => item.name).join(" · ") || competition.competitionName)} · Round ${competition.round}</p></div><div class="lms-summary-stats"><span><b>${(competition.leagues || []).length || 1}</b> leagues</span><span><b>${competition.players.length}</b> players</span><span><b>${alive}</b> remaining</span><span class="lms-picked-total"><b>${pickedThisRound}/${alive}</b> selected</span>${adminUnlocked ? `<button id="lms-admin-lock"><ha-icon icon="mdi:lock-outline"></ha-icon> Lock admin</button><button id="lms-delete" class="danger">Delete</button>` : `<span class="lms-admin-status"><ha-icon icon="mdi:shield-lock-outline"></ha-icon> ${needsAdminPassword ? "Password setup required" : "Admin locked"}</span>`}</div></section>
        <section class="page-card lms-prize"><div><span class="eyebrow">PRIZE FUND</span><strong>£${prizeFund.toFixed(2)}</strong><small>${paidCount} entries${buyBackCount ? ` + ${buyBackCount} buy-back${buyBackCount === 1 ? "" : "s"}` : ""} × £${entryFee.toFixed(2)}${carriedPrize ? ` + £${carriedPrize.toFixed(2)} rollover` : ""}</small></div>${adminUnlocked ? `<label><span>Entry fee</span><b>£</b><input id="lms-edit-entry-fee" type="number" min="0" step="0.50" value="${entryFee.toFixed(2)}"></label><button id="lms-rollover"><ha-icon icon="mdi:cash-sync"></ha-icon> Rollover competition</button>` : `<span>${paidCount}/${competition.players.length} players paid</span>`}</section>
        <section class="page-card lms-share"><ha-icon icon="mdi:share-variant-outline"></ha-icon><div><span class="eyebrow">SHARE THIS COMPETITION</span><strong>${competition.shareUrl ? "Public competition page is live" : "Create a read-only public page"}</strong><small>Players can view standings, picks, round fixtures, results, countdown and prize fund without Home Assistant.</small>${competition.shareUrl ? `<a href="${this._escape(competition.shareUrl)}" target="_blank" rel="noopener noreferrer">${this._escape(competition.shareUrl)}</a>` : ""}</div>${adminUnlocked ? competition.shareUrl ? `<button id="lms-copy-share"><ha-icon icon="mdi:content-copy"></ha-icon> Copy link</button><button id="lms-share-sync"><ha-icon icon="mdi:sync"></ha-icon> Update now</button>` : `<button id="lms-create-share" ${LMS_SHARE_SERVICE ? "" : "disabled"}><ha-icon icon="mdi:link-plus"></ha-icon> Generate link</button>` : ""}</section>
        <section class="page-card lms-email"><ha-icon icon="mdi:email-fast-outline"></ha-icon><div><span class="eyebrow">PLAYER EMAILS</span><strong>Send private pick links through Home Assistant</strong><small>${emailServices.length ? "Choose the email notification service configured on this Home Assistant installation." : "No compatible Home Assistant email notification service was found. Add the SMTP integration first."}</small></div>${adminUnlocked ? `<label><span>Email service</span><select id="lms-email-service"><option value="">Choose email service</option>${emailServices.map((item) => `<option value="${this._escape(item.value)}" ${item.value === selectedEmailService ? "selected" : ""}>${this._escape(item.label)} (${this._escape(item.value)})</option>`).join("")}</select></label><button id="lms-email-outstanding" ${selectedEmailService && competition.shareUrl ? "" : "disabled"}><ha-icon icon="mdi:email-sync-outline"></ha-icon> Email outstanding picks</button>` : ""}</section>
        ${competition.completed ? `<section class="page-card lms-winner"><ha-icon icon="mdi:trophy-award"></ha-icon><div><span class="eyebrow">COMPETITION COMPLETE</span><h2>${winner ? `${this._escape(winner.name)} wins!` : "No surviving player"}</h2><p>Final prize fund: £${prizeFund.toFixed(2)}</p></div></section>` : ""}
        ${needsAdminPassword ? `<section class="page-card lms-admin-unlock"><ha-icon icon="mdi:shield-key-outline"></ha-icon><div><strong>Protect this competition</strong><span>Create the administrator password before making further changes.</span></div><input id="lms-existing-admin-password" type="password" minlength="4" autocomplete="new-password" placeholder="Create password"><input id="lms-existing-admin-confirm" type="password" minlength="4" autocomplete="new-password" placeholder="Repeat password"><button id="lms-existing-admin-save">Save password</button></section>` : adminUnlocked ? "" : `<section class="page-card lms-admin-unlock"><ha-icon icon="mdi:shield-key-outline"></ha-icon><div><strong>Administrator access required</strong><span>Enter the setup password to make changes.</span></div><input id="lms-admin-unlock-password" type="password" autocomplete="current-password" placeholder="Administrator password"><button id="lms-admin-unlock">Unlock</button></section>`}
        <section class="page-card lms-deadline ${deadline.locked ? "locked" : ""}"><ha-icon icon="${deadline.locked ? "mdi:lock" : "mdi:timer-alert-outline"}"></ha-icon><div><span class="eyebrow">ROUND ${competition.round} PICK DEADLINE</span><strong>${this._escape(deadlineLocal)} local time</strong><small>All players must choose before the first match kicks off.</small></div><b id="lms-countdown">${deadline.timestamp ? this._formatLmsCountdown(deadline.remaining) : "Waiting for fixture times"}</b></section>
        <section class="page-card lms-rules"><strong>Rules</strong><span>Win = survive</span><span>Draw or loss = eliminated</span><span>No team can be used twice</span><span>All picks remain private until the round deadline</span><span>Players may change a submitted pick once</span><span>Further changes require administrator approval</span><span>Round 1 elimination = one buy-back at the same entry fee</span><span>A buy-back does not restore the losing team</span><span>Buy-back closes at the Round 2 deadline</span><span>Unfinished/postponed picks remain pending</span></section>
        <nav class="lms-page-tabs"><button class="${this._lmsPageView === "picks" ? "active" : ""}" data-lms-view="picks"><ha-icon icon="mdi:account-check-outline"></ha-icon> Players & picks</button><button class="${this._lmsPageView === "fixtures" ? "active" : ""}" data-lms-view="fixtures"><ha-icon icon="mdi:calendar-month-outline"></ha-icon> Round ${competition.round} fixtures <b>${roundFixtureCount}</b></button><button class="${this._lmsPageView === "standings" ? "active" : ""}" data-lms-view="standings"><ha-icon icon="mdi:format-list-numbered"></ha-icon> Standings</button></nav>
        ${this._lmsPageView === "fixtures" ? `<section class="lms-round-fixtures">${roundFixtureGroups.map((league) => `<article class="page-card lms-round-league"><header><div><span class="eyebrow">${this._escape(league.country || "")}</span><h3>${this._escape(league.name)}</h3></div><b>${league.roundFixtures.length} matches</b></header>${league.roundFixtures.length ? `<div class="lms-round-match-list">${league.roundFixtures.map((fixture) => { const kickoff = this._lmsFixtureTimestamp(fixture); const localKickoff = kickoff ? new Date(kickoff * 1000).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Time TBC"; const status = String(fixture.status_short || fixture.status || "NS").toUpperCase(); const hasScore = fixture.home_goals !== null && fixture.home_goals !== undefined && fixture.away_goals !== null && fixture.away_goals !== undefined && !["NS", "TBD", "PST"].includes(status); const score = hasScore ? `${fixture.home_goals} - ${fixture.away_goals}` : "vs"; const matchState = ["FT", "AET", "PEN"].includes(status) ? `Full time · ${status}` : hasScore ? `${status}${fixture.elapsed ? ` · ${fixture.elapsed}'` : ""}` : localKickoff; return `<div class="lms-round-match ${hasScore ? "has-score" : ""}"><span class="home">${this._escape(fixture.home_team)}${this._logo(fixture.home_logo, fixture.home_team, "30")}</span><strong>${this._escape(score)}</strong><span class="away">${this._logo(fixture.away_logo, fixture.away_team, "30")}${this._escape(fixture.away_team)}</span><time>${this._escape(matchState)}</time></div>`; }).join("")}</div>` : `<div class="empty">Load this league to collect its next round of fixtures.</div>`}</article>`).join("") || `<div class="page-card empty">No round fixtures are available yet.</div>`}</section>` : this._lmsPageView === "standings" ? `<section class="page-card lms-standings"><header><div><span class="eyebrow">COMPETITION STATUS</span><h2>Players through and out</h2></div><b>${alive} still standing</b></header><div class="lms-standings-table"><div class="lms-standings-row heading"><span>#</span><span>Player</span><span>Status</span><span>Current pick</span><span>Teams used</span><span>Entry</span></div>${[...competition.players].sort((a, b) => Number(b.alive) - Number(a.alive) || a.name.localeCompare(b.name)).map((player, index) => { const currentPick = player.picks?.[roundKey] || "Not selected"; const usedTeams = Object.entries(player.picks || {}).sort(([a], [b]) => Number(a) - Number(b)).map(([round, team]) => `R${round}: ${team}`).join(" · ") || "None"; const playerResult = player.results?.[roundKey] || ""; const throughText = !player.alive ? (playerResult === "eliminated-no-pick" ? "Out · No pick" : "Out") : playerResult === "bought-back" ? "Bought back · Through" : playerResult === "survived" ? "Through" : currentPick !== "Not selected" ? (deadline.locked ? "Waiting for result" : "Pick made") : "Awaiting pick"; return `<div class="lms-standings-row ${player.alive ? "through" : "eliminated"}"><span>${index + 1}</span><strong>${this._escape(player.name)}</strong><span><b>${this._escape(throughText)}</b></span><span>${this._escape(currentPick)}</span><span>${this._escape(usedTeams)}</span><span>${player.paid ? (player.buyBacks ? "Paid + buy-back" : "Paid") : "Due"}</span></div>`; }).join("") || `<div class="empty">No players added yet.</div>`}</div></section>` : `
        <section class="page-card lms-league-switch"><label><span>Choose teams from</span><select id="lms-active-league">${(competition.leagues || []).map((league) => `<option value="${this._escape(league.key)}" ${league.key === selectedLmsLeague ? "selected" : ""}>${this._escape(league.country)} · ${this._escape(league.name)}</option>`).join("")}</select></label>${loadedLmsLeague ? `<strong>${this._escape(teams.length)} teams loaded</strong>` : `<strong class="lms-loading">Loading selected league teams…</strong>`}</section>
        ${adminUnlocked ? `<section class="page-card lms-add-player"><input id="lms-player-name" maxlength="50" placeholder="Player name"><input id="lms-player-email" type="email" maxlength="120" placeholder="Email (for pick link)"><button id="lms-add-player">Add player</button><button id="lms-settle">Check round results</button></section>` : ""}
        <section class="lms-player-list">${competition.players.length ? [...competition.players].sort((a, b) => Number(a.paid) - Number(b.paid) || String(a.name).localeCompare(String(b.name))).map((player, playerIndex, sortedPlayers) => {
          const used = new Set(Object.entries(player.picks || {}).filter(([round]) => round !== roundKey).map(([, team]) => team));
          const pick = player.picks?.[roundKey] || "";
          const result = player.results?.[roundKey] || "";
          const groupedOptions = teamGroups.map((league) => `<optgroup label="${this._escape(league.name)} · ${this._escape(league.teams.length)} teams">${league.teams.map((team) => `<option value="${this._escape(team)}" ${pick === team ? "selected" : ""} ${used.has(team) ? "disabled" : ""}>${this._escape(team)}${used.has(team) ? " · used" : ""}</option>`).join("")}</optgroup>`).join("");
          const pickLocked = deadline.locked || !adminUnlocked;
          const nextRoundKey = String(Number(competition.round) + 1);
          const earlyPick = player.picks?.[nextRoundKey] || "";
          const allUsedTeams = new Set(Object.entries(player.picks || {}).filter(([round]) => round !== nextRoundKey).map(([, team]) => team));
          const earlyOptions = teamGroups.map((league) => `<optgroup label="${this._escape(league.name)} · ${this._escape(league.teams.length)} teams">${league.teams.map((team) => `<option value="${this._escape(team)}" ${earlyPick === team ? "selected" : ""} ${allUsedTeams.has(team) ? "disabled" : ""}>${this._escape(team)}${allUsedTeams.has(team) ? " · used" : ""}</option>`).join("")}</optgroup>`).join("");
          const boughtBack = result === "bought-back";
          const statusClass = !player.alive ? "eliminated" : ["survived", "bought-back"].includes(result) ? "survived" : pick ? (deadline.locked ? "waiting" : "selected") : "awaiting";
          const statusIcon = statusClass === "eliminated" ? "mdi:close-circle" : ["awaiting", "waiting"].includes(statusClass) ? "mdi:clock-alert-outline" : "mdi:check-circle";
          const statusText = statusClass === "eliminated" ? "Out" : boughtBack ? "Bought back · Through" : statusClass === "survived" ? "Through" : statusClass === "waiting" ? "Waiting for result · Still in" : statusClass === "selected" ? "Team selected · Still in" : "No team selected · Still in";
          const canPickEarly = player.alive && ["survived", "bought-back"].includes(result) && !competition.completed;
          const canBuyBack = this._canLmsBuyBack(player);
          const email = String(player.email || "");
          const maskedEmail = email ? email.replace(/^(.{1,2}).*(@.*)$/, "$1*****$2") : "No email added";
          const startsPaymentGroup = playerIndex === 0 || Boolean(sortedPlayers[playerIndex - 1]?.paid) !== Boolean(player.paid);
          const paymentHeading = startsPaymentGroup ? `<div class="lms-payment-group-title ${player.paid ? "paid" : "unpaid"}"><ha-icon icon="${player.paid ? "mdi:cash-check" : "mdi:cash-clock"}"></ha-icon><div><strong>${player.paid ? "Paid players" : "Payment due"}</strong><span>${sortedPlayers.filter((item) => Boolean(item.paid) === Boolean(player.paid)).length} player${sortedPlayers.filter((item) => Boolean(item.paid) === Boolean(player.paid)).length === 1 ? "" : "s"}</span></div></div>` : "";
          return `${paymentHeading}<article class="page-card lms-player ${player.alive ? "alive" : "out"} ${statusClass}"><div class="lms-player-name"><ha-icon icon="${player.alive ? "mdi:shield-check-outline" : "mdi:close-octagon-outline"}"></ha-icon><div><strong>${this._escape(player.name)}</strong><span>Round ${competition.round}</span></div><span class="lms-payment-status ${player.paid ? "paid" : "unpaid"}">${player.paid ? `£ Paid${player.buyBacks ? " + buy-back" : ""}` : "Payment due"}</span>${adminUnlocked ? `<button class="lms-toggle-paid" data-player-id="${this._escape(player.id)}">${player.paid ? "Mark unpaid" : "Mark paid"}</button>` : ""}${adminUnlocked && player.pickUrl ? `<button class="lms-copy-player-link" data-player-id="${this._escape(player.id)}"><ha-icon icon="mdi:email-fast-outline"></ha-icon> Copy pick link</button>` : ""}${adminUnlocked && canBuyBack ? `<button class="lms-buy-back" data-player-id="${this._escape(player.id)}"><ha-icon icon="mdi:account-reactivate-outline"></ha-icon> Buy back £${entryFee.toFixed(2)}</button>` : ""}<span class="lms-pick-status ${statusClass}"><ha-icon icon="${statusIcon}"></ha-icon>${statusText}</span></div>${player.alive ? `<label><span>Round ${competition.round} pick</span><select class="lms-pick" data-player-id="${this._escape(player.id)}" ${pickLocked ? "disabled" : ""}><option value="">${deadline.locked ? "Picks locked" : !adminUnlocked ? "Administrator locked" : "Choose a team"}</option>${groupedOptions}</select></label>` : ""}${canPickEarly ? `<label class="lms-early-pick"><span><ha-icon icon="mdi:fast-forward-outline"></ha-icon> Through — choose Round ${Number(competition.round) + 1} early</span><select class="lms-next-pick" data-player-id="${this._escape(player.id)}" ${!adminUnlocked ? "disabled" : ""}><option value="">${!adminUnlocked ? "Administrator locked" : "Choose next-round team"}</option>${earlyOptions}</select></label>` : ""}<div class="lms-history">${Object.entries(player.picks || {}).map(([round, team]) => `<span>R${this._escape(round)} · ${this._escape(team)} · ${this._escape(player.results?.[round] || (round === nextRoundKey ? "early pick" : "pending"))}</span>`).join("") || `<span>No picks yet</span>`}</div><div class="lms-player-email"><ha-icon icon="mdi:email-lock-outline"></ha-icon><span>${this._escape(adminUnlocked ? (email || "No email added") : maskedEmail)}</span>${adminUnlocked ? `<div class="lms-player-admin-actions"><button class="lms-edit-player-email" data-player-id="${this._escape(player.id)}"><ha-icon icon="mdi:email-edit-outline"></ha-icon>${email ? "Edit email" : "Add email"}</button><button class="lms-remove-player" data-player-id="${this._escape(player.id)}"><ha-icon icon="mdi:account-remove-outline"></ha-icon>Remove player</button></div>` : `<small>Hidden until administrator unlocks</small>`}</div></article>`;
        }).join("") : `<div class="page-card empty">Add the players taking part in this competition.</div>`}</section>`}
      `}
    `;
  }

  _accaLeaguePage() {
    const game = this._doublePickGame;
    let html = this._doublePickLeaguePage();
    if (!game) return html;
    if (!game.emailServiceInherited) {
      game.emailNotifyService = this._lmsConfiguredEmailService();
      game.emailServiceInherited = true;
      this._saveDoublePickGame();
    }
    const services = this._lmsEmailServices();
    const selectedService = String(game.emailNotifyService || "__auto__");
    const catalogue = (this._statusInfo().available_competitions || []).slice().sort((a, b) => String(a.country).localeCompare(String(b.country)) || String(a.name).localeCompare(String(b.name)));
    const countries = [...new Set(catalogue.map((item) => item.country).filter(Boolean))];
    const selectedKeys = new Set(this._doublePickRoundCompetitions().map((item) => item.key));
    const roundFixtures = this._doublePickRoundFixtures();
    const fixtureGroups = this._doublePickRoundCompetitions().map((competition) => ({ competition, fixtures: roundFixtures.filter((fixture) => fixture.competitionKey === competition.key) })).filter((group) => group.fixtures.length);
    const fixtureBoard = `<section class="page-card acca-fixture-board"><header class="acca-section-head"><ha-icon icon="mdi:calendar-month-outline"></ha-icon><div><span class="eyebrow">FIXTURES AVAILABLE TO PICK</span><h2>${this._escape(this._doublePickRound()?.startDate || "")} to ${this._escape(this._doublePickRound()?.endDate || "")}</h2><p>Only the teams shown below appear in the player pick lists.</p></div><strong>${roundFixtures.length} matches</strong></header>${fixtureGroups.length ? `<div class="acca-fixture-groups">${fixtureGroups.map(({ competition, fixtures }) => `<section><div class="acca-fixture-group-title"><strong>${this._escape(competition.country)} · ${this._escape(competition.name)}</strong><span>${fixtures.length} match${fixtures.length === 1 ? "" : "es"}</span></div>${fixtures.map((fixture) => { const status = String(fixture.status_short || fixture.status || "").toUpperCase(); const finished = ["FT","AET","PEN","AWD","WO"].includes(status); const kickoff = this._lmsFixtureTimestamp(fixture); return `<article class="acca-fixture-row ${finished ? "finished" : "upcoming"}"><time>${kickoff ? new Date(kickoff * 1000).toLocaleString([], { weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "Time TBC"}</time><span class="home">${this._escape(fixture.home_team || "Home TBC")}</span><b>${finished ? `${fixture.home_goals ?? 0} - ${fixture.away_goals ?? 0}` : "v"}</b><span>${this._escape(fixture.away_team || "Away TBC")}</span><em>${finished ? "Finished" : status || "Scheduled"}</em></article>`; }).join("")}</section>`).join("")}</div>` : `<div class="empty"><strong>No fixtures loaded for these dates.</strong><span>Use Load fixtures and teams below for each selected competition.</span></div>`}</section>`;
    const competitionEditor = `<details class="page-card acca-league-editor"><summary><span><span class="eyebrow">ROUND ${game.round} LEAGUES & CUPS</span><strong>${selectedKeys.size} selected</strong><small>Add or remove competitions for this round only. Finished-round history is unchanged.</small></span><ha-icon icon="mdi:chevron-down"></ha-icon></summary><div class="dp-competition-groups">${countries.map((country) => `<fieldset><legend>${this._escape(country)}</legend>${catalogue.filter((item) => item.country === country).map((item) => `<label><input type="checkbox" class="dp-game-competition-check" value="${this._escape(item.key)}" ${selectedKeys.has(item.key) ? "checked" : ""}><span><b>${this._escape(item.name)}</b><small>${item.type === "cup" ? "Cup" : "League"}</small></span></label>`).join("")}</fieldset>`).join("")}</div><button id="dp-save-competitions"><ha-icon icon="mdi:content-save-check-outline"></ha-icon>Save Round ${game.round} competitions</button></details>`;
    const sharePanel = `<section class="page-card lms-share acca-share"><ha-icon icon="mdi:share-variant-outline"></ha-icon><div><span class="eyebrow">EXTERNAL ACCA LEAGUE</span><strong>${game.shareUrl ? "Public results page is live" : "Create a link for players"}</strong><small>Share picks, fixture dates, results and the points table. Player emails remain private in Home Assistant.</small>${game.shareUrl ? `<a href="${this._escape(game.shareUrl)}" target="_blank" rel="noopener noreferrer">${this._escape(game.shareUrl)}</a>` : ""}</div>${game.shareUrl ? `<button id="dp-copy-share"><ha-icon icon="mdi:content-copy"></ha-icon>Copy link</button><button id="dp-sync-share"><ha-icon icon="mdi:sync"></ha-icon>Update now</button>` : `<button id="dp-create-share"><ha-icon icon="mdi:link-plus"></ha-icon>Create external link</button>`}</section>`;
    html = html.replace("</section><section class=\"dp-summary-grid\">", `</section>${sharePanel}${competitionEditor}<section class="dp-summary-grid">`);
    html = html.replace("TWO PICKS · 3/1/0 SCORING", `${game.pickCount || 2} PICKS · 3/1/0 SCORING`).replaceAll("/2 results", `/${game.pickCount || 2} results`);
    html = html.replace("<button id=\"dp-check-results\">", `<label>Stake £<input id="dp-stake" type="number" min="0" step="0.01" value="${Number(this._doublePickRound()?.stake || 0)}"></label><label>Return £<input id="dp-return" type="number" min="0" step="0.01" value="${Number(this._doublePickRound()?.returnAmount || 0)}"></label><button id="dp-email-reminders">Email pick reminder</button><button id="dp-email-confirmation">Email confirmed picks</button><button id="dp-email-results">Email results</button><button id="dp-check-results">`);
    html = html.replace("<input id=\"dp-new-player\" placeholder=\"Add another player\">", `<input id="dp-new-player" placeholder="Player name"><input id="dp-new-email" type="email" placeholder="Player email">`);
    html = html.replace('<section class="page-card dp-round-controls">', `<section class="page-card acca-control-panel"><header class="acca-section-head"><ha-icon icon="mdi:calendar-clock-outline"></ha-icon><div><span class="eyebrow">ROUND CONTROL</span><h2>Manage Round ${game.round}</h2><p>Set the fixture window, payer and bet totals, then check Football Hub results.</p></div></header><div class="dp-round-controls">`);
    html = html.replace('<button id="dp-email-reminders">Email pick reminder</button><button id="dp-email-confirmation">Email confirmed picks</button><button id="dp-email-results">Email results</button>', '');
    html = html.replace('</section><section class="page-card dp-load-data">', `</div><div class="acca-email-panel"><div><span class="eyebrow">PLAYER EMAILS</span><strong>Send picks and results</strong><small>Uses the same Home Assistant email service configured for LMS.</small></div><label><span>Email service</span><select id="dp-email-service">${services.map((item) => `<option value="${this._escape(item.value)}" ${selectedService === item.value ? "selected" : ""}>${this._escape(item.label)}</option>`).join("")}</select></label><div class="acca-email-actions"><button id="dp-email-reminders"><ha-icon icon="mdi:email-fast-outline"></ha-icon>Pick reminder</button><button id="dp-email-confirmation"><ha-icon icon="mdi:email-check-outline"></ha-icon>Confirmed picks</button><button id="dp-email-results"><ha-icon icon="mdi:email-newsletter"></ha-icon>Round results</button></div></div></section><section class="page-card dp-load-data">`);
    html = html.replace('<section class="dp-player-grid">', `${fixtureBoard}<section class="dp-player-grid">`);
    html = html.replace('<button id="dp-delete" class="danger">', '<button id="dp-load-all"><ha-icon icon="mdi:database-sync-outline"></ha-icon>Load all selected</button><button id="dp-delete" class="danger">');
    if (this._doublePickView === "fixtures") {
      const roundSections = Object.values(game.rounds || {}).sort((a, b) => Number(b.number) - Number(a.number)).map((item) => {
        const available = this._doublePickRoundFixtures(item);
        const selections = (game.players || []).flatMap((player) => (item.picks?.[player.id] || []).map((value, slot) => ({ player, value, slot }))).filter((entry) => entry.value).map((entry) => {
          const [competitionKey, ...parts] = String(entry.value).split("|||");
          const team = parts.join("|||");
          const fixture = available.find((match) => match.competitionKey === competitionKey && (match.home_team === team || match.away_team === team));
          return { ...entry, team, fixture };
        });
        return `<section class="page-card acca-picked-round"><header><div><span class="eyebrow">ROUND ${item.number}</span><h2>${this._escape(item.startDate)} to ${this._escape(item.endDate)}</h2></div><strong>${selections.length} selection${selections.length === 1 ? "" : "s"}</strong></header>${selections.length ? `<div>${selections.map(({ player, team, fixture, slot }) => { const status = String(fixture?.status_short || fixture?.status || "").toUpperCase(); const finished = ["FT","AET","PEN","AWD","WO"].includes(status); const home = fixture?.home_team === team; const opponent = fixture ? (home ? fixture.away_team : fixture.home_team) : "Fixture unavailable"; const kickoff = fixture ? this._lmsFixtureTimestamp(fixture) : 0; return `<article class="acca-picked-fixture"><span class="dp-avatar">${this._escape(String(player.name || "P").slice(0,1).toUpperCase())}</span><div><small>${this._escape(player.name)} · Pick ${slot + 1}</small><strong>${this._escape(team)}</strong><span>vs ${this._escape(opponent)}</span></div><div><small>${this._escape(fixture?.competitionName || "")}</small><time>${kickoff ? new Date(kickoff * 1000).toLocaleString([], { weekday:"short", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "Date unavailable"}</time></div><b>${finished ? `${fixture.home_goals ?? 0} - ${fixture.away_goals ?? 0}` : status || "Scheduled"}</b></article>`; }).join("")}</div>` : `<div class="empty">No teams were selected in this round.</div>`}</section>`;
      }).join("");
      html = html.replace(/<section class="page-card"><h2>Round \d+ fixtures<\/h2>[\s\S]*<\/section>$/, `<section class="acca-picked-fixtures">${roundSections}</section>`);
    }
    return html;
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

  _hydrateSharedPreferences() {
    if (this._prefsHydrated) return;
    const prefs = this._statusInfo().ui_preferences;
    if (!prefs || typeof prefs !== "object" || !Object.keys(prefs).length) return;
    this._hiddenLiveCountries = new Set(prefs.hiddenCountries || []);
    this._hiddenLiveCompetitions = new Set(prefs.hiddenCompetitions || []);
    this._hiddenLiveGenders = new Set(prefs.hiddenGenders || []);
    this._favouriteLiveCompetitions = new Set(prefs.favouriteCompetitions || []);
    this._liveDisplayMode = prefs.displayMode || this._liveDisplayMode;
    this._liveStatusFilter = prefs.statusFilter || this._liveStatusFilter;
    this._liveTimezone = prefs.timezone || this._liveTimezone;
    if (typeof prefs.filtersOpen === "boolean") this._liveFiltersOpen = prefs.filtersOpen;
    this._liveNotifications = { ...this._liveNotifications, ...(prefs.notifications || {}) };
    if (prefs.doublePickGame && typeof prefs.doublePickGame === "object") this._doublePickGame = prefs.doublePickGame;
    this._prefsHydrated = true;
  }

  _saveSharedPreferences() {
    const preferences = {
      hiddenCountries: [...this._hiddenLiveCountries], hiddenCompetitions: [...this._hiddenLiveCompetitions],
      hiddenGenders: [...this._hiddenLiveGenders], favouriteCompetitions: [...this._favouriteLiveCompetitions],
      displayMode: this._liveDisplayMode, statusFilter: this._liveStatusFilter,
      timezone: this._liveTimezone, filtersOpen: this._liveFiltersOpen, notifications: this._liveNotifications,
      doublePickGame: this._doublePickGame,
    };
    this._hass?.callService("football_hub", "save_ui_preferences", {
      entry_id: this._statusInfo().config_entry_id || "", preferences: JSON.stringify(preferences),
    }).catch(() => {});
  }

  _processLiveNotifications() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const enabled = this._liveNotifications || {};
    if (!enabled.kickoff && !enabled.goals && !enabled.halftime && !enabled.fulltime) return;
    const matches = this._attrs("matches_today").matches || [];
    let previous = {};
    try { previous = JSON.parse(localStorage.getItem("football_hub_notification_match_states") || "{}"); } catch (_error) {}
    const next = {};
    matches.forEach((match) => {
      const id = String(match.fixture_id || `${match.home_team}-${match.away_team}`);
      const state = { status: match.status_short, home: match.home_goals, away: match.away_goals };
      next[id] = state;
      const old = previous[id];
      if (!old) return;
      if (enabled.selectedClubOnly && this._selectedClub && ![match.home_team, match.away_team].includes(this._selectedClub)) return;
      let title = "", body = `${match.home_team} ${this._score(match.home_goals)}–${this._score(match.away_goals)} ${match.away_team}`;
      if (enabled.goals && (old.home !== state.home || old.away !== state.away)) title = "Goal update";
      else if (enabled.halftime && old.status !== "HT" && state.status === "HT") title = "Half-time";
      else if (enabled.fulltime && !["FT", "AET", "PEN"].includes(old.status) && ["FT", "AET", "PEN"].includes(state.status)) title = "Full-time";
      else if (enabled.kickoff && ["NS", "TBD"].includes(old.status) && !["NS", "TBD"].includes(state.status)) title = "Kickoff";
      if (title) new Notification(title, { body });
    });
    localStorage.setItem("football_hub_notification_match_states", JSON.stringify(next));
  }

  _setCompetition(prefix) {
    this._selectedPrefix = prefix;
    localStorage.setItem("football_hub_selected_prefix", prefix);
    this._render();
  }

  _setTab(tab) {
    if (tab === "live" && this._activeTab !== "live") {
      this._selectedLiveMatch = "";
      localStorage.removeItem("football_hub_live_match");
    }
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
    const languageOrder = ["es", "de", "fr", "it", "nl", "pt", "tr"];
    const completePagePhrases = {
      "Cups":["Copas","Pokale","Coupes","Coppe","Bekers","Taças","Kupalar"],
      "News":["Noticias","Nachrichten","Actualités","Notizie","Nieuws","Notícias","Haberler"],
      "TV Guide":["Guía TV","TV-Programm","Programme TV","Guida TV","TV-gids","Guia TV","TV Rehberi"],
      "Transfers":["Fichajes","Transfers","Transferts","Trasferimenti","Transfers","Transferências","Transferler"],
      "Football News":["Noticias de fútbol","Fußballnachrichten","Actualités football","Notizie di calcio","Voetbalnieuws","Notícias de futebol","Futbol Haberleri"],
      "Transfer Market":["Mercado de fichajes","Transfermarkt","Marché des transferts","Calciomercato","Transfermarkt","Mercado de transferências","Transfer Pazarı"],
      "Latest stories":["Últimas noticias","Neueste Meldungen","Dernières actualités","Ultime notizie","Laatste verhalen","Últimas notícias","Son haberler"],
      "Latest transfers":["Últimos fichajes","Neueste Transfers","Derniers transferts","Ultimi trasferimenti","Laatste transfers","Transferências recentes","Son transferler"],
      "Top transfers":["Principales fichajes","Top-Transfers","Principaux transferts","Trasferimenti principali","Toptransfers","Principais transferências","En büyük transferler"],
      "Transfer centre":["Mercado de fichajes","Transferzentrale","Centre des transferts","Centro trasferimenti","Transfercentrum","Centro de transferências","Transfer merkezi"],
      "LIVE AROUND THE WORLD":["DIRECTO EN TODO EL MUNDO","LIVE WELTWEIT","DIRECT DANS LE MONDE","LIVE NEL MONDO","LIVE WERELDWIJD","DIRETO EM TODO O MUNDO","DÜNYADAN CANLI"],
      "All live scores":["Todos los marcadores en vivo","Alle Live-Ergebnisse","Tous les scores en direct","Tutti i risultati live","Alle live-scores","Todos os resultados em direto","Tüm canlı skorlar"],
      "Live now":["En directo","Jetzt live","En direct","In diretta","Nu live","Em direto","Canlı"],
      "Goals":["Goles","Tore","Buts","Gol","Doelpunten","Golos","Goller"],
      "Selected events":["Eventos seleccionados","Ausgewählte Ereignisse","Événements sélectionnés","Eventi selezionati","Geselecteerde gebeurtenissen","Eventos selecionados","Seçili olaylar"],
      "MATCHDAY CONTROL ROOM":["CENTRO DE CONTROL DEL PARTIDO","SPIELTAG-KONTROLLZENTRALE","CENTRE DE CONTRÔLE DU MATCH","SALA DI CONTROLLO PARTITA","WEDSTRIJDCENTRALE","CENTRO DE CONTROLO DO JOGO","MAÇ KONTROL MERKEZİ"],
      "Scores, incidents, statistics and team sheets update automatically.":["Los marcadores, incidentes, estadísticas y alineaciones se actualizan automáticamente.","Ergebnisse, Ereignisse, Statistiken und Aufstellungen werden automatisch aktualisiert.","Les scores, incidents, statistiques et compositions sont actualisés automatiquement.","Risultati, eventi, statistiche e formazioni si aggiornano automaticamente.","Scores, gebeurtenissen, statistieken en opstellingen worden automatisch bijgewerkt.","Resultados, incidentes, estatísticas e equipas atualizam automaticamente.","Skorlar, olaylar, istatistikler ve kadrolar otomatik güncellenir."],
      "Match timeline":["Cronología del partido","Spielverlauf","Chronologie du match","Cronologia partita","Wedstrijdverloop","Cronologia do jogo","Maç zaman çizelgesi"],
      "Statistics":["Estadísticas","Statistiken","Statistiques","Statistiche","Statistieken","Estatísticas","İstatistikler"],
      "Match statistics":["Estadísticas del partido","Spielstatistiken","Statistiques du match","Statistiche partita","Wedstrijdstatistieken","Estatísticas do jogo","Maç istatistikleri"],
      "Starting line-ups":["Alineaciones iniciales","Startaufstellungen","Compositions de départ","Formazioni iniziali","Basisopstellingen","Equipas iniciais","İlk 11'ler"],
      "Statistics not available yet.":["Las estadísticas aún no están disponibles.","Statistiken sind noch nicht verfügbar.","Les statistiques ne sont pas encore disponibles.","Le statistiche non sono ancora disponibili.","Statistieken zijn nog niet beschikbaar.","As estatísticas ainda não estão disponíveis.","İstatistikler henüz mevcut değil."],
      "Line-ups not available yet.":["Las alineaciones aún no están disponibles.","Aufstellungen sind noch nicht verfügbar.","Les compositions ne sont pas encore disponibles.","Le formazioni non sono ancora disponibili.","Opstellingen zijn nog niet beschikbaar.","As equipas ainda não estão disponíveis.","Kadrolar henüz mevcut değil."],
      "No match events yet.":["Aún no hay eventos del partido.","Noch keine Spielereignisse.","Aucun événement de match pour le moment.","Nessun evento partita.","Nog geen wedstrijdgebeurtenissen.","Ainda não há eventos do jogo.","Henüz maç olayı yok."],
      "Most appearances":["Más partidos","Meiste Einsätze","Plus d'apparitions","Più presenze","Meeste wedstrijden","Mais jogos","En çok forma giyenler"],
      "Most minutes played":["Más minutos jugados","Meiste Spielminuten","Plus de minutes jouées","Più minuti giocati","Meeste speelminuten","Mais minutos jogados","En çok dakika"],
      "Top yellow cards":["Más tarjetas amarillas","Meiste gelbe Karten","Plus de cartons jaunes","Più cartellini gialli","Meeste gele kaarten","Mais cartões amarelos","En çok sarı kart"],
      "Top red cards":["Más tarjetas rojas","Meiste rote Karten","Plus de cartons rouges","Più cartellini rossi","Meeste rode kaarten","Mais cartões vermelhos","En çok kırmızı kart"],
      "Top ratings":["Mejores valoraciones","Beste Bewertungen","Meilleures notes","Migliori valutazioni","Beste beoordelingen","Melhores avaliações","En yüksek puanlar"],
      "CUP COMPETITIONS":["COMPETICIONES DE COPA","POKALWETTBEWERBE","COMPÉTITIONS DE COUPE","COMPETIZIONI DI COPPA","BEKERCOMPETITIES","COMPETIÇÕES DE TAÇA","KUPA ORGANİZASYONLARI"],
      "Choose a country, then select the cup you want Football Hub to follow.":["Elige un país y después la copa que quieres seguir.","Wähle ein Land und anschließend den gewünschten Pokal.","Choisissez un pays, puis la coupe à suivre.","Scegli un paese, poi la coppa da seguire.","Kies een land en daarna de beker die je wilt volgen.","Escolha um país e depois a taça que pretende seguir.","Bir ülke ve ardından takip edilecek kupayı seçin."],
      "Country / region":["País / región","Land / Region","Pays / région","Paese / regione","Land / regio","País / região","Ülke / bölge"],
      "Choose a competition":["Elige una competición","Wettbewerb auswählen","Choisir une compétition","Scegli una competizione","Kies een competitie","Escolha uma competição","Organizasyon seç"],
      "SELECTED COMPETITION":["COMPETICIÓN SELECCIONADA","AUSGEWÄHLTER WETTBEWERB","COMPÉTITION SÉLECTIONNÉE","COMPETIZIONE SELEZIONATA","GESELECTEERDE COMPETITIE","COMPETIÇÃO SELECIONADA","SEÇİLİ ORGANİZASYON"],
      "Table / phase standings":["Tabla / clasificación de fase","Tabelle / Phasenstand","Classement / phase","Classifica / fase","Stand / fase","Tabela / classificação da fase","Tablo / aşama sıralaması"],
      "Knockout competition":["Competición eliminatoria","K.-o.-Wettbewerb","Compétition à élimination directe","Competizione a eliminazione","Knock-outcompetitie","Competição a eliminar","Eleme organizasyonu"],
      "Open":["Abrir","Öffnen","Ouvrir","Apri","Openen","Abrir","Aç"],
      "View all":["Ver todo","Alle anzeigen","Tout afficher","Vedi tutto","Alles bekijken","Ver tudo","Tümünü gör"],
      "View full table":["Ver tabla completa","Ganze Tabelle","Voir le classement complet","Classifica completa","Volledige stand","Ver tabela completa","Tam tablo"],
      "View full fixtures":["Ver todos los partidos","Alle Spiele","Voir tous les matchs","Tutte le partite","Alle wedstrijden","Ver todos os jogos","Tüm fikstür"],
      "View all results":["Ver todos los resultados","Alle Ergebnisse","Voir tous les résultats","Tutti i risultati","Alle uitslagen","Ver todos os resultados","Tüm sonuçlar"],
      "View all players":["Ver todos los jugadores","Alle Spieler","Voir tous les joueurs","Tutti i giocatori","Alle spelers","Ver todos os jogadores","Tüm oyuncular"],
      "View all news":["Ver todas las noticias","Alle Nachrichten","Voir toutes les actualités","Tutte le notizie","Al het nieuws","Ver todas as notícias","Tüm haberler"],
      "Channel to be confirmed":["Canal por confirmar","Sender noch offen","Chaîne à confirmer","Canale da confermare","Zender nog niet bevestigd","Canal por confirmar","Kanal henüz belli değil"],
      "To be confirmed":["Por confirmar","Noch offen","À confirmer","Da confermare","Nog te bevestigen","Por confirmar","Henüz belli değil"],
      "Venue TBC":["Estadio por confirmar","Spielort noch offen","Stade à confirmer","Stadio da confermare","Stadion nog te bevestigen","Estádio por confirmar","Stadyum belli değil"],
      "Referee TBC":["Árbitro por confirmar","Schiedsrichter noch offen","Arbitre à confirmer","Arbitro da confermare","Scheidsrechter nog te bevestigen","Árbitro por confirmar","Hakem belli değil"],
      "Online":["En línea","Online","En ligne","Online","Online","Online","Çevrimiçi"],
      "Substitution":["Sustitución","Auswechslung","Remplacement","Sostituzione","Wissel","Substituição","Oyuncu değişikliği"],
      "Half-time":["Descanso","Halbzeit","Mi-temps","Intervallo","Rust","Intervalo","İlk yarı"],
      "Full-time":["Final","Abpfiff","Fin du match","Fine partita","Afgelopen","Fim do jogo","Maç sonu"],
      "Grass":["Césped","Rasen","Pelouse","Erba","Gras","Relva","Çim"],
      "Mostly Cloudy":["Mayormente nublado","Überwiegend bewölkt","Généralement nuageux","Prevalentemente nuvoloso","Overwegend bewolkt","Maioritariamente nublado","Çoğunlukla bulutlu"],
      "Clear":["Despejado","Klar","Dégagé","Sereno","Helder","Céu limpo","Açık"],
      "Rain":["Lluvia","Regen","Pluie","Pioggia","Regen","Chuva","Yağmur"],
      "Ball possession":["Posesión","Ballbesitz","Possession","Possesso palla","Balbezit","Posse de bola","Topa sahip olma"],
      "Total shots":["Tiros totales","Schüsse gesamt","Tirs totaux","Tiri totali","Totaal schoten","Remates totais","Toplam şut"],
      "Shots on target":["Tiros a puerta","Schüsse aufs Tor","Tirs cadrés","Tiri in porta","Schoten op doel","Remates à baliza","İsabetli şut"],
      "Shots off target":["Tiros fuera","Schüsse daneben","Tirs non cadrés","Tiri fuori","Schoten naast","Remates para fora","İsabetsiz şut"],
      "Blocked shots":["Tiros bloqueados","Geblockte Schüsse","Tirs bloqués","Tiri respinti","Geblokkeerde schoten","Remates bloqueados","Engellenen şut"],
      "Shots inside box":["Tiros dentro del área","Schüsse im Strafraum","Tirs dans la surface","Tiri in area","Schoten in het strafschopgebied","Remates na área","Ceza sahası içinden şut"],
      "Shots outside box":["Tiros fuera del área","Schüsse außerhalb","Tirs hors surface","Tiri fuori area","Schoten buiten het strafschopgebied","Remates fora da área","Ceza sahası dışından şut"],
      "Corners":["Córners","Ecken","Corners","Calci d'angolo","Corners","Cantos","Kornerler"],
      "Fouls":["Faltas","Fouls","Fautes","Falli","Overtredingen","Faltas","Fauller"],
      "Yellow cards":["Tarjetas amarillas","Gelbe Karten","Cartons jaunes","Cartellini gialli","Gele kaarten","Cartões amarelos","Sarı kartlar"],
      "Red cards":["Tarjetas rojas","Rote Karten","Cartons rouges","Cartellini rossi","Rode kaarten","Cartões vermelhos","Kırmızı kartlar"],
      "Passes":["Pases","Pässe","Passes","Passaggi","Passes","Passes","Paslar"],
      "Accurate passes":["Pases precisos","Erfolgreiche Pässe","Passes réussies","Passaggi riusciti","Nauwkeurige passes","Passes certos","İsabetli paslar"],
      "No TV listings are available right now.":["No hay programación de TV disponible.","Derzeit ist kein TV-Programm verfügbar.","Aucun programme TV n'est disponible actuellement.","Nessuna programmazione TV disponibile.","Er zijn momenteel geen tv-uitzendingen beschikbaar.","Não há programação televisiva disponível.","Şu anda TV yayını yok."],
      "News is loading.":["Cargando noticias.","Nachrichten werden geladen.","Chargement des actualités.","Caricamento notizie.","Nieuws wordt geladen.","A carregar notícias.","Haberler yükleniyor."],
      "Transfer data is loading.":["Cargando fichajes.","Transferdaten werden geladen.","Chargement des transferts.","Caricamento trasferimenti.","Transfergegevens worden geladen.","A carregar transferências.","Transfer verileri yükleniyor."],
      "Fee undisclosed":["Importe no revelado","Ablöse unbekannt","Montant non communiqué","Costo non comunicato","Bedrag niet bekendgemaakt","Valor não divulgado","Ücret açıklanmadı"],
      "On loan":["Cedido","Ausgeliehen","En prêt","In prestito","Gehuurd","Por empréstimo","Kiralık"],
      "Your fixtures, results, league position and players will appear here.":["Tus partidos, resultados, posición y jugadores aparecerán aquí.","Deine Spiele, Ergebnisse, Tabellenposition und Spieler erscheinen hier.","Vos matchs, résultats, classement et joueurs apparaîtront ici.","Partite, risultati, posizione e giocatori appariranno qui.","Je wedstrijden, resultaten, positie en spelers verschijnen hier.","Os seus jogos, resultados, posição e jogadores aparecerão aqui.","Fikstür, sonuçlar, lig sırası ve oyuncular burada görünecek."],
      "Stadium information":["Información del estadio","Stadioninformationen","Informations sur le stade","Informazioni stadio","Stadioninformatie","Informações do estádio","Stadyum bilgileri"],
      "Opened":["Inaugurado","Eröffnet","Ouvert","Inaugurato","Geopend","Inaugurado","Açılış"],
      "Seasons recorded":["Temporadas registradas","Erfasste Saisons","Saisons enregistrées","Stagioni registrate","Geregistreerde seizoenen","Épocas registadas","Kayıtlı sezonlar"],
      "Losses":["Derrotas","Niederlagen","Défaites","Sconfitte","Nederlagen","Derrotas","Mağlubiyetler"],
      "Points per game":["Puntos por partido","Punkte pro Spiel","Points par match","Punti per partita","Punten per wedstrijd","Pontos por jogo","Maç başına puan"],
      "Total trophies":["Trofeos totales","Titel gesamt","Total des trophées","Trofei totali","Totaal prijzen","Total de troféus","Toplam kupa"],
      "Competitions won":["Competiciones ganadas","Gewonnene Wettbewerbe","Compétitions remportées","Competizioni vinte","Gewonnen competities","Competições ganhas","Kazanılan organizasyonlar"],
      "League seasons recorded":["Temporadas de liga registradas","Erfasste Ligasaisons","Saisons de championnat enregistrées","Stagioni di campionato registrate","Geregistreerde competitieseizoenen","Épocas de liga registadas","Kayıtlı lig sezonları"],
      "Buy me a beer":["Invítame a una cerveza","Spendiere mir ein Bier","Offrez-moi une bière","Offrimi una birra","Trakteer me op een biertje","Pague-me uma cerveja","Bana bir bira ısmarla"],
      "Enjoying Football Hub?":["¿Te gusta Football Hub?","Gefällt dir Football Hub?","Vous aimez Football Hub ?","Ti piace Football Hub?","Bevalt Football Hub?","Gosta do Football Hub?","Football Hub'ı beğendiniz mi?"],
      "Help support its development and buy me a beer.":["Ayuda a su desarrollo e invítame a una cerveza.","Unterstütze die Entwicklung und spendiere mir ein Bier.","Soutenez son développement et offrez-moi une bière.","Sostieni lo sviluppo e offrimi una birra.","Steun de ontwikkeling en trakteer me op een biertje.","Apoie o desenvolvimento e pague-me uma cerveja.","Gelişimi destekleyin ve bana bir bira ısmarlayın."],
      "Football Hub · Built for Home Assistant":["Football Hub · Creado para Home Assistant","Football Hub · Für Home Assistant entwickelt","Football Hub · Conçu pour Home Assistant","Football Hub · Creato per Home Assistant","Football Hub · Gebouwd voor Home Assistant","Football Hub · Criado para Home Assistant","Football Hub · Home Assistant için geliştirildi"]
    };
    const languageIndex = languageOrder.indexOf(this._language);
    if (languageIndex >= 0) {
      for (const [english, values] of Object.entries(completePagePhrases)) {
        phrases[this._language][english] = values[languageIndex];
      }
    }
    const active = phrases[this._language];
    if (!active) return;
    for (const country of ["England","Scotland","Wales","Northern Ireland","Republic of Ireland","France","Germany","Spain","Italy","Netherlands","Portugal","Belgium","Turkey","USA","Europe"]) {
      active[country] = this._displayCountry(country);
    }
    const insensitive = new Map(Object.entries(active).map(([key, value]) => [key.toLocaleLowerCase("en"), value]));
    const walker = document.createTreeWalker(this.shadowRoot, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue || "";
      const trimmed = raw.trim();
      const direct = active[trimmed] || insensitive.get(trimmed.toLocaleLowerCase("en"));
      if (direct) {
        node.nodeValue = raw.replace(trimmed, direct);
        continue;
      }
      const decorated = trimmed.match(/^([^A-Za-zÀ-ž]*)(.+)$/);
      const decoratedTranslation = decorated && insensitive.get(decorated[2].toLocaleLowerCase("en"));
      if (decoratedTranslation) {
        node.nodeValue = raw.replace(trimmed, `${decorated[1]}${decoratedTranslation}`);
        continue;
      }
      const countMatch = trimmed.match(/^(\d+)\s+(matches|moves|stories|players|live)$/i);
      if (countMatch) {
        const countWords = {
          es:{matches:"partidos",moves:"movimientos",stories:"noticias",players:"jugadores",live:"en directo"},
          de:{matches:"Spiele",moves:"Transfers",stories:"Meldungen",players:"Spieler",live:"live"},
          fr:{matches:"matchs",moves:"transferts",stories:"actualités",players:"joueurs",live:"en direct"},
          it:{matches:"partite",moves:"trasferimenti",stories:"notizie",players:"giocatori",live:"live"},
          nl:{matches:"wedstrijden",moves:"transfers",stories:"berichten",players:"spelers",live:"live"},
          pt:{matches:"jogos",moves:"transferências",stories:"notícias",players:"jogadores",live:"em direto"},
          tr:{matches:"maç",moves:"transfer",stories:"haber",players:"oyuncu",live:"canlı"}
        };
        const word = countWords[this._language]?.[countMatch[2].toLowerCase()];
        if (word) node.nodeValue = raw.replace(trimmed, `${countMatch[1]} ${word}`);
        continue;
      }
      const capacityMatch = trimmed.match(/^([\d,.]+)\s+capacity$/i);
      if (capacityMatch) {
        const word = {es:"capacidad",de:"Kapazität",fr:"places",it:"posti",nl:"capaciteit",pt:"capacidade",tr:"kapasite"}[this._language];
        if (word) node.nodeValue = raw.replace(trimmed, `${capacityMatch[1]} ${word}`);
        continue;
      }
      for (const weather of ["Mostly Cloudy", "Clear", "Rain"]) {
        if (trimmed.toLocaleLowerCase("en").startsWith(weather.toLocaleLowerCase("en"))) {
          node.nodeValue = raw.replace(weather, active[weather] || weather);
          break;
        }
      }
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

  _removeFavouriteClub(team, competition) {
    const status = this._statusInfo();
    this._hass?.callService("football_hub", "remove_favourite_club", {
      team,
      competition,
      entry_id: status.config_entry_id || "",
    }).catch(() => {});
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

    const locales = {
      en: "en-GB", es: "es-ES", de: "de-DE", fr: "fr-FR",
      it: "it-IT", nl: "nl-NL", pt: "pt-PT", tr: "tr-TR",
    };
    return new Intl.DateTimeFormat(locales[this._language] || "en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      ...(this._liveTimezone !== "local" ? { timeZone: this._liveTimezone } : {}),
    }).format(date);
  }

  _displayCountry(country) {
    const name = String(country || "");
    if (this._language === "en") return name;
    const special = {
      England:{es:"Inglaterra",de:"England",fr:"Angleterre",it:"Inghilterra",nl:"Engeland",pt:"Inglaterra",tr:"İngiltere"},
      Scotland:{es:"Escocia",de:"Schottland",fr:"Écosse",it:"Scozia",nl:"Schotland",pt:"Escócia",tr:"İskoçya"},
      Wales:{es:"Gales",de:"Wales",fr:"Pays de Galles",it:"Galles",nl:"Wales",pt:"País de Gales",tr:"Galler"},
      "Northern Ireland":{es:"Irlanda del Norte",de:"Nordirland",fr:"Irlande du Nord",it:"Irlanda del Nord",nl:"Noord-Ierland",pt:"Irlanda do Norte",tr:"Kuzey İrlanda"},
      "Republic of Ireland":{es:"Irlanda",de:"Irland",fr:"Irlande",it:"Irlanda",nl:"Ierland",pt:"Irlanda",tr:"İrlanda"},
      USA:{es:"Estados Unidos",de:"USA",fr:"États-Unis",it:"Stati Uniti",nl:"Verenigde Staten",pt:"Estados Unidos",tr:"ABD"},
      Europe:{es:"Europa",de:"Europa",fr:"Europe",it:"Europa",nl:"Europa",pt:"Europa",tr:"Avrupa"},
    };
    if (special[name]?.[this._language]) return special[name][this._language];
    const regions = {France:"FR",Germany:"DE",Spain:"ES",Italy:"IT",Netherlands:"NL",Portugal:"PT",Belgium:"BE",Turkey:"TR"};
    const locales = {es:"es-ES",de:"de-DE",fr:"fr-FR",it:"it-IT",nl:"nl-NL",pt:"pt-PT",tr:"tr-TR"};
    try {
      return regions[name] ? new Intl.DisplayNames([locales[this._language]], {type:"region"}).of(regions[name]) : name;
    } catch (_) {
      return name;
    }
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

  _matchText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return String(value);
    for (const key of ["long", "short", "name", "label", "text", "description", "value", "reason", "status"]) {
      if (value[key] !== null && value[key] !== undefined) {
        const text = this._matchText(value[key]);
        if (text) return text;
      }
    }
    return "";
  }

  _matchCard(match, mode = "fixture") {
    if (!match) return `<div class="empty">No match data available.</div>`;

    const isResult = mode === "result";
    const competitionText = this._matchText(match.league || match.competition) || "Football";
    const roundText = this._matchText(match.round) || "Fixture";
    const statusLabels = { NS: "Upcoming", TBD: "Time TBC", "1H": "Live · First half", HT: "Half-time", "2H": "Live · Second half", ET: "Extra-time", BT: "Extra-time break", P: "Penalties", FT: "Full-time", AET: "After extra-time", PEN: "After penalties", PST: "Postponed", CANC: "Cancelled", ABD: "Abandoned", SUSP: "Suspended", AWD: "Awarded", WO: "Walkover" };
    const statusText = statusLabels[match.status_short] || this._matchText(match.status) || this._matchText(match.status_short);
    const score = isResult || match.status_short !== "NS"
      ? `<div class="match-score">${this._score(match.home_goals)} <span>–</span> ${this._score(match.away_goals)}</div>`
      : `<div class="match-time">${this._formatDate(match.kickoff)}</div>`;
    const venueText = match.stadium || (!isResult ? "Venue TBC" : "");

    return `
      <article class="match-card">
        <div class="match-competition"><ha-icon icon="mdi:trophy-outline"></ha-icon><strong>${this._escape(competitionText)}</strong></div>
        <div class="match-meta">
          <span>${this._escape(roundText)}</span>
          <span>${this._escape(statusText)}</span>
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
        ${isResult && match.qualification?.text ? `<div class="match-qualification"><ha-icon icon="mdi:check-decagram"></ha-icon><strong>${this._escape(match.qualification.text)}</strong></div>` : ""}
        ${venueText || match.city ? `<div class="match-footer">
          <span>${this._escape(venueText)}</span>
          <span>${this._escape(match.city || "")}</span>
        </div>` : ""}
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
                ${countries.map((country) => `<option value="${this._escape(country)}" ${country === this._selectedCountry ? "selected" : ""}>${this._escape(this._displayCountry(country))}</option>`).join("")}
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
      ["last-man-standing", "mdi:account-multiple-check-outline", "LMS"],
      ["double-pick-league", "mdi:counter", "Acca League"],
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
    this._hydrateSharedPreferences();
    const primary = this._attrs("live_match");
    const allLiveMatches = this._attrs("live_matches").matches || [];
    const allTodayMatches = this._attrs("matches_today").matches || [];
    const builtInCatalogue = Object.entries(FULL_COMPETITION_CATALOGUE).flatMap(([country, names]) => names.map((name) => ({ country, name })));
    const providerCatalogue = this._attrs("competition_catalogue").competitions || [];
    const catalogue = [...builtInCatalogue, ...(this._statusInfo().available_competitions || []), ...providerCatalogue].filter((item) => item?.name && item?.country);
    const competitionName = (match) => this._matchText(match.league || match.competition) || "Other matches";
    const catalogueCountries = new Map();
    catalogue.forEach((item) => { if (!catalogueCountries.has(item.name)) catalogueCountries.set(item.name, new Set()); catalogueCountries.get(item.name).add(item.country); });
    const countryCodes = { ENG:"England", SCO:"Scotland", WAL:"Wales", NIR:"Northern Ireland", IRL:"Ireland", GBR:"United Kingdom", USA:"United States", BRA:"Brazil", ARG:"Argentina", ESP:"Spain", GER:"Germany", ITA:"Italy", FRA:"France", NED:"Netherlands", POR:"Portugal", BEL:"Belgium", TUR:"Türkiye", MEX:"Mexico", CAN:"Canada", AUS:"Australia", JPN:"Japan", KOR:"South Korea", CHN:"China", IND:"India", AUT:"Austria", SUI:"Switzerland", DEN:"Denmark", SWE:"Sweden", NOR:"Norway", FIN:"Finland", POL:"Poland", CZE:"Czech Republic", GRE:"Greece", CRO:"Croatia", SRB:"Serbia", UKR:"Ukraine", RUS:"Russia", ROU:"Romania", BUL:"Bulgaria", HUN:"Hungary", ISR:"Israel", KSA:"Saudi Arabia", UAE:"United Arab Emirates", QAT:"Qatar", EGY:"Egypt", MAR:"Morocco", RSA:"South Africa", NGA:"Nigeria", COL:"Colombia", CHI:"Chile", URU:"Uruguay", PAR:"Paraguay", ECU:"Ecuador", PER:"Peru", VEN:"Venezuela", INT:"International", FIFA:"International", UEFA:"Europe" };
    [...this._hiddenLiveCountries].forEach((savedCountry) => {
      const migratedCountry = countryCodes[String(savedCountry).toUpperCase()];
      if (migratedCountry && migratedCountry !== savedCountry) {
        this._hiddenLiveCountries.delete(savedCountry);
        this._hiddenLiveCountries.add(migratedCountry);
      }
    });
    const countryName = (match) => {
      const raw = this._matchText(match.country || match.country_code).trim();
      if (!raw) return "International";
      const code = raw.toUpperCase();
      if (/^[A-Z]{3,4}$/.test(code)) {
        const inferred = [...(catalogueCountries.get(competitionName(match)) || [])];
        if (inferred.length === 1) return inferred[0];
        return countryCodes[code] || "International";
      }
      return raw;
    };
    const genderName = (match) => /\b(women|women's|womens|female|feminine|femenina|frauen|dames)\b/i.test(`${competitionName(match)} ${match.home_team || ""} ${match.away_team || ""}`) ? "Women's" : "Men's";
    const competitionCountries = new Map();
    catalogue.forEach((item) => {
      if (!competitionCountries.has(item.name)) competitionCountries.set(item.name, new Set());
      competitionCountries.get(item.name).add(item.country);
    });
    [...allTodayMatches, ...allLiveMatches].forEach((match) => {
      const competition = competitionName(match);
      if (!competitionCountries.has(competition)) competitionCountries.set(competition, new Set());
      competitionCountries.get(competition).add(countryName(match));
    });
    const competitionNames = [...competitionCountries.keys()].sort((a, b) => {
      const favouriteDiff = Number(this._favouriteLiveCompetitions.has(b)) - Number(this._favouriteLiveCompetitions.has(a));
      return favouriteDiff || a.localeCompare(b);
    });
    const countryNames = [...new Set([...catalogue.map((item) => item.country), ...allTodayMatches.map(countryName), ...allLiveMatches.map(countryName)])].sort((a, b) => a.localeCompare(b));
    const statusGroup = (match) => ["FT", "AET", "PEN", "CANC", "PST", "ABD", "AWD", "WO"].includes(match.status_short) ? "completed" : ["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"].includes(match.status_short) ? "live" : "upcoming";
    const competitionFilterKey = (match) => `${countryName(match)}|||${competitionName(match)}`;
    const isVisible = (match) => !this._hiddenLiveCompetitions.has(competitionFilterKey(match)) && !this._hiddenLiveCompetitions.has(competitionName(match)) && !this._hiddenLiveCountries.has(countryName(match)) && !this._hiddenLiveGenders.has(genderName(match)) && (this._liveStatusFilter === "all" || statusGroup(match) === this._liveStatusFilter);
    const matches = allLiveMatches.filter(isVisible);
    const todayMatches = allTodayMatches.filter(isVisible);
    const search = this._liveFilterSearch.trim().toLowerCase();
    const filterChecks = (items, kind, hidden) => items.filter((name) => !search || name.toLowerCase().includes(search)).map((name) => `<label class="${kind === "competition" && this._favouriteLiveCompetitions.has(name) ? "favourite" : ""}"><input type="checkbox" data-live-filter-kind="${kind}" data-live-filter-value="${this._escape(name)}" ${kind === "competition" ? `data-live-filter-countries="${this._escape([...(competitionCountries.get(name) || [])].join("|"))}"` : ""} ${hidden.has(name) ? "" : "checked"}><span>${this._escape(name)}</span>${kind === "competition" ? `<button type="button" data-live-favourite="${this._escape(name)}" title="Pin competition">${this._favouriteLiveCompetitions.has(name) ? "★" : "☆"}</button>` : ""}</label>`).join("");
    const filterActions = (kind) => `<span class="live-filter-actions"><button type="button" data-live-filter-action="all" data-live-filter-target="${kind}">Select all</button><button type="button" data-live-filter-action="none" data-live-filter-target="${kind}">Clear all</button></span>`;
    const toolbar = `<section class="page-card live-toolbar"><label>Search filters<input id="live-filter-search" type="search" value="${this._escape(this._liveFilterSearch)}" placeholder="Country, league, cup or club"></label><label>Matches<select id="live-status-filter"><option value="all" ${this._liveStatusFilter === "all" ? "selected" : ""}>All today</option><option value="upcoming" ${this._liveStatusFilter === "upcoming" ? "selected" : ""}>Upcoming only</option><option value="live" ${this._liveStatusFilter === "live" ? "selected" : ""}>Live only</option><option value="completed" ${this._liveStatusFilter === "completed" ? "selected" : ""}>Completed only</option></select></label><label>Display<select id="live-display-mode"><option value="cards" ${this._liveDisplayMode === "cards" ? "selected" : ""}>Cards</option><option value="compact" ${this._liveDisplayMode === "compact" ? "selected" : ""}>Compact list</option></select></label><label>Timezone<select id="live-timezone"><option value="local" ${this._liveTimezone === "local" ? "selected" : ""}>Home Assistant / device</option><option value="Europe/London" ${this._liveTimezone === "Europe/London" ? "selected" : ""}>UK</option><option value="UTC" ${this._liveTimezone === "UTC" ? "selected" : ""}>UTC</option><option value="Europe/Paris" ${this._liveTimezone === "Europe/Paris" ? "selected" : ""}>Central Europe</option><option value="America/New_York" ${this._liveTimezone === "America/New_York" ? "selected" : ""}>US Eastern</option></select></label><button type="button" id="football-hub-refresh"><ha-icon icon="mdi:refresh"></ha-icon> Refresh</button></section>`;
    const countryCompetitionFilters = countryNames.filter((country) => !search || country.toLowerCase().includes(search) || competitionNames.some((competition) => competitionCountries.get(competition)?.has(country) && competition.toLowerCase().includes(search))).map((country) => {
      const competitions = competitionNames.filter((competition) => competitionCountries.get(competition)?.has(country) && (!search || country.toLowerCase().includes(search) || competition.toLowerCase().includes(search)));
      const countryChecked = !this._hiddenLiveCountries.has(country);
      return `<details class="country-filter-tree"><summary><label><input type="checkbox" data-live-filter-kind="country" data-live-filter-value="${this._escape(country)}" ${countryChecked ? "checked" : ""}><strong>${this._escape(this._displayCountry(country))}</strong></label><span>${competitions.length} competitions</span></summary><div class="live-filter-options">${competitions.map((competition) => { const key = `${country}|||${competition}`; return `<label class="${this._favouriteLiveCompetitions.has(competition) ? "favourite" : ""}"><input type="checkbox" data-live-filter-kind="competition" data-live-filter-value="${this._escape(key)}" data-live-filter-countries="${this._escape(country)}" ${this._hiddenLiveCompetitions.has(key) || this._hiddenLiveCompetitions.has(competition) || !countryChecked ? "" : "checked"}><span>${this._escape(competition)}</span><button type="button" data-live-favourite="${this._escape(competition)}" title="Pin competition">${this._favouriteLiveCompetitions.has(competition) ? "★" : "☆"}</button></label>`; }).join("")}</div></details>`;
    }).join("");
    const selectedCompetitionCount = [...competitionCountries.entries()].reduce((total, [competition, countries]) => total + [...countries].filter((country) => !this._hiddenLiveCountries.has(country) && !this._hiddenLiveCompetitions.has(`${country}|||${competition}`) && !this._hiddenLiveCompetitions.has(competition)).length, 0);
    const liveFilters = `${toolbar}<details id="live-filter-panel" class="page-card live-competition-filter live-filter-panel" ${this._liveFiltersOpen ? "open" : ""}><summary><div><span class="eyebrow">MATCH FILTERS</span><h2>Countries and competitions</h2></div><span class="live-filter-summary-count">${selectedCompetitionCount} selected <ha-icon icon="mdi:chevron-down"></ha-icon></span></summary><div class="live-filter-panel-body"><p>Expand a country to choose its leagues and cups. Favourites are pinned first and settings synchronise through Home Assistant.</p><div class="live-filter-groups"><details open><summary>Men's and women's football ${filterActions("gender")}</summary><div class="live-filter-options">${filterChecks(["Men's", "Women's"], "gender", this._hiddenLiveGenders)}</div></details>${countryCompetitionFilters}</div></div></details>`;
    const statusInfo = this._statusInfo();
    const notifyChecks = [["kickoff", "Kickoff"], ["goals", "Goals"], ["halftime", "Half-time"], ["fulltime", "Full-time"], ["selectedClubOnly", "Selected club only"]].map(([key, label]) => `<label><input type="checkbox" data-live-notification="${key}" ${this._liveNotifications[key] ? "checked" : ""}><span>${label}</span></label>`).join("");
    const liveExtras = `<section class="live-utility-grid compact"><article class="page-card live-alerts-compact"><header><span class="eyebrow">BROWSER ALERTS</span><strong>Match notifications</strong></header><div class="live-alert-options">${notifyChecks}</div></article><article class="page-card live-diagnostics compact"><header><span class="eyebrow">DATA STATUS</span><strong>${this._escape(statusInfo.state)}</strong></header><div><span>Matches</span><strong>${allTodayMatches.length}</strong></div><div><span>Live</span><strong>${allLiveMatches.length}</strong></div><div><span>Competitions</span><strong>${competitionNames.length}</strong></div><div><span>Updated</span><strong>${this._escape(statusInfo.last_updated ? this._formatDate(statusInfo.last_updated) : "Waiting")}</strong></div></article></section>`;
    const grouped = new Map();
    todayMatches.forEach((match) => { const key = `${countryName(match)}|||${competitionName(match)}`; if (!grouped.has(key)) grouped.set(key, []); grouped.get(key).push(match); });
    const groupedMatches = [...grouped.entries()].sort(([a], [b]) => { const ac = a.split("|||")[1], bc = b.split("|||")[1]; return Number(this._favouriteLiveCompetitions.has(bc)) - Number(this._favouriteLiveCompetitions.has(ac)) || a.localeCompare(b); }).map(([key, games]) => { const [country, competition] = key.split("|||"); return `<article class="live-schedule-group"><header><div><span>${this._escape(this._displayCountry(country))}</span><strong>${this._escape(competition)}</strong></div><span>${games.length} match${games.length === 1 ? "" : "es"}</span></header><div class="match-list ${this._liveDisplayMode === "compact" ? "compact" : ""}">${games.map((match) => this._matchCard(match, statusGroup(match) === "completed" ? "result" : undefined)).join("")}</div></article>`; }).join("");
    const todaySection = `<section class="section"><div class="section-title-row"><div><span class="eyebrow">TODAY'S WORLDWIDE SCHEDULE</span><h2>Today's fixtures and results</h2></div><span class="pill">${todayMatches.length} of ${allTodayMatches.length} shown</span></div>${groupedMatches || `<div class="empty">No matches are shown. Change the filters above to add them.</div>`}</section>`;
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
        ${liveFilters}${liveExtras}
        <section class="page-card live-control-empty">
          <div><span class="live-kicker">⚽ MATCHDAY CONTROL ROOM</span><h2>Live Centre</h2><p>The feed updates automatically when a match begins.</p></div>
          ${teamOptions()}
          <div class="live-count"><strong>0</strong><span>Live now</span></div>
        </section>
        <section class="section">
          <h2>Current live feed</h2>
          <div class="match-list">${matches.length ? matches.map((m) => this._matchCard(m, "result")).join("") : ""}</div>
        </section>
        ${todaySection}
      `;
    }

    const liveMatches = matches.length ? matches : [primary];
    const matchId = (match, index = 0) => String(match.fixture_id ?? match.id ?? `${match.home_team}-${match.away_team}-${index}`);
    const availableIds = liveMatches.map((match, index) => matchId(match, index));
    if (!availableIds.includes(this._selectedLiveMatch)) this._selectedLiveMatch = "";
    const totalLiveGoals = liveMatches.reduce((total, match) => {
      const home = Number(match.home_goals);
      const away = Number(match.away_goals);
      return total + (Number.isFinite(home) ? home : 0) + (Number.isFinite(away) ? away : 0);
    }, 0);
    if (!this._selectedLiveMatch) {
      return `${liveFilters}${liveExtras}
        <section class="page-card live-control-hero"><div><span class="live-kicker">⚽ MATCHDAY CONTROL ROOM</span><h2>Live Centre <b>LIVE</b></h2><p>Select any match below to open its full live details.</p></div>${teamOptions(this._selectedLiveTeam)}<div class="live-control-stats"><div><strong>${liveMatches.length}</strong><span>Live now</span></div><div><strong>${totalLiveGoals}</strong><span>Goals</span></div><div><strong>0</strong><span>Selected</span></div></div></section>
        <section class="section country-live-section"><div class="page-heading"><div><span class="eyebrow">LIVE AROUND THE WORLD</span><h2>All live scores</h2></div><div class="count-badge">${liveMatches.length} live</div></div>${this._liveCompetitionGroups(liveMatches, "")}</section>${todaySection}`;
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
    return `
      ${liveFilters}${liveExtras}
      <section class="page-card live-control-hero">
        <div><span class="live-kicker">⚽ MATCHDAY CONTROL ROOM</span><h2>Live Centre <b>LIVE</b></h2><p>Scores, incidents, statistics and team sheets update automatically.</p></div>
        ${teamOptions(this._selectedLiveTeam || live.home_team)}
        <div class="live-control-stats"><div><strong>${liveMatches.length}</strong><span>Live now</span></div><div><strong>${totalLiveGoals}</strong><span>Goals</span></div><div><strong>${events.length}</strong><span>Selected events</span></div></div>
      </section>
      <section class="live-centre-card" id="selected-live-match"><button type="button" id="live-close-match" class="live-close-match"><ha-icon icon="mdi:arrow-left"></ha-icon> All live matches</button>
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
      ${todaySection}
    `;
  }

  _fixturesPage() {
    const fixtures = this._attrs("fixtures");
    const liveStatuses = new Set(["LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"]);
    const completedStatuses = new Set(["FT", "AET", "PEN", "AWD", "WO", "CANC", "ABD"]);
    const statusOf = (match) => String(match.status_short || match.status || "NS").toUpperCase();
    const todayFixtures = (this._attrs("matches_today").matches || []).filter((match) => !liveStatuses.has(statusOf(match)) && !completedStatuses.has(statusOf(match)));
    const allFixtures = (fixtures.fixtures || fixtures.next_5 || []).filter((match) => !liveStatuses.has(statusOf(match)) && !completedStatuses.has(statusOf(match)));
    const standingsTeams = (this._attrs("standings").table || [])
      .map((row) => row.team || row.team_name)
      .filter(Boolean);
    const clubsById = new Map();
    allFixtures.forEach((match) => [
      [match.home_team_id, match.home_team],
      [match.away_team_id, match.away_team],
    ].forEach(([id, name]) => {
      if (!name) return;
      const key = id == null ? `name:${String(name).toLowerCase()}` : `id:${id}`;
      if (!clubsById.has(key) || String(name).length > String(clubsById.get(key)).length) clubsById.set(key, name);
    }));
    const fixtureTeams = [...new Set(clubsById.values())];
    const teams = (fixtureTeams.length > 10 ? fixtureTeams : [...new Set([...fixtureTeams, ...standingsTeams])])
      .sort((a, b) => a.localeCompare(b));
    const normaliseTeam = (name) => String(name || "").trim().toLowerCase();
    const isSelectedClubMatch = (match) =>
      normaliseTeam(match.home_team) === normaliseTeam(this._selectedFixtureTeam) ||
      normaliseTeam(match.away_team) === normaliseTeam(this._selectedFixtureTeam);
    const filteredFixtures = this._selectedFixtureTeam === "__all__"
      ? allFixtures
      : this._selectedFixtureTeam
      ? allFixtures.filter(isSelectedClubMatch)
      : allFixtures.slice(0, 6);
    const filteredToday = this._selectedFixtureTeam === "__all__"
      ? todayFixtures
      : this._selectedFixtureTeam
      ? todayFixtures.filter(isSelectedClubMatch)
      : todayFixtures.slice(0, 6);
    const pageSize = 20;
    const totalPages = Math.max(1, Math.ceil(filteredFixtures.length / pageSize));
    const currentPage = Math.min(this._fixturePage, totalPages - 1);
    const visibleFixtures = filteredFixtures.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    return `
      <section class="page-heading">
        <div><span class="eyebrow">MATCH SCHEDULE</span><h2>Fixtures</h2></div>
        <div class="count-badge">${this._escape(filteredFixtures.length)} matches</div>
      </section>
      <div class="fixture-filter">
        <label for="fixture-team-select">Show fixtures for</label>
        <input id="fixture-team-select" type="search" list="fixture-team-options" value="${this._escape(["__all__", ""].includes(this._selectedFixtureTeam) ? "" : this._selectedFixtureTeam)}" placeholder="Search for a club" aria-label="Search for a team">
        <datalist id="fixture-team-options">${teams.map((team) => `<option value="${this._escape(team)}"></option>`).join("")}</datalist>
        <div><button type="button" data-fixture-team-quick="__all__">All fixtures (${this._escape(allFixtures.length)})</button><button type="button" data-fixture-team-quick="">Next 6</button></div>
      </div>
      ${
        filteredToday.length
          ? `<section class="section"><h3>Today</h3><div class="match-list">${filteredToday
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
    const completedStatuses = new Set(["FT", "AET", "PEN", "AWD", "WO", "CANC", "ABD"]);
    const results = (attrs.latest_5 || []).filter((match) => completedStatuses.has(String(match.status_short || match.status || "").toUpperCase()));
    const rawTotal = attrs.total_results;
    const totalResults = rawTotal && typeof rawTotal === "object"
      ? rawTotal.total ?? rawTotal.count ?? rawTotal.value ?? results.length
      : rawTotal ?? results.length;

    return `
      <section class="page-heading">
        <div><span class="eyebrow">COMPLETED MATCHES</span><h2>Results</h2></div>
        <div class="count-badge">${this._escape(totalResults)} played</div>
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
    let club = this._selectedClub;
    const favourites = Array.isArray(this._statusInfo().favourite_clubs)
      ? this._statusInfo().favourite_clubs
      : [];
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
    const selectorClubs = new Map();
    const addSelectorClub = (id, name) => {
      if (!name) return;
      const key = id == null ? `name:${String(name).toLowerCase()}` : `id:${id}`;
      if (!selectorClubs.has(key) || String(name).length > String(selectorClubs.get(key)).length) selectorClubs.set(key, name);
    };
    table.forEach((row) => addSelectorClub(row.team_id || row.id, row.team || row.team_name));
    fixtures.forEach((match) => {
      addSelectorClub(match.home_team_id, match.home_team);
      addSelectorClub(match.away_team_id, match.away_team);
    });
    const canonicalSelection = club && [...selectorClubs.values()].find((name) => {
      const selected = String(club).trim().toLowerCase();
      const candidate = String(name).trim().toLowerCase();
      return candidate === selected || candidate.startsWith(`${selected} `);
    });
    if (canonicalSelection) {
      club = canonicalSelection;
      this._selectedClub = canonicalSelection;
      localStorage.setItem("football_hub_my_club", canonicalSelection);
    } else if (club) addSelectorClub(null, club);
    const teams = [...new Set(selectorClubs.values())].sort((a, b) => a.localeCompare(b));

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
          <input id="my-club-select" type="search" list="my-club-options" value="${this._escape(club || "")}" placeholder="Search for a club" aria-label="Search for your club">
          <datalist id="my-club-options">${teams.map((team) => `<option value="${this._escape(team)}"></option>`).join("")}</datalist>
        </div>
        <div class="favourite-club-list">
          <strong>My Clubs (${favourites.length}/5)</strong>
          ${favourites.length ? favourites.map((item) => `
            <span class="favourite-club-chip">
              <button type="button" class="favourite-club-open" data-team="${this._escape(item.team)}" data-competition="${this._escape(item.competition)}">${this._escape(item.team)}</button>
              <small>${this._escape(item.country || "")} · ${this._escape(item.competition || "")}</small>
              <button type="button" class="favourite-club-remove" data-team="${this._escape(item.team)}" data-competition="${this._escape(item.competition)}" title="Remove favourite">×</button>
            </span>`).join("") : `<span class="empty">Choose a club to add your first favourite.</span>`}
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
    const liveStatuses = new Set(["LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"]);
    const completedStatuses = new Set(["FT", "AET", "PEN", "AWD", "WO", "CANC", "ABD"]);
    const cupStatus = (match) => String(match.status_short || match.status || "NS").toUpperCase();
    const fixtures = cupDataReady && Array.isArray(cupData.fixtures) ? cupData.fixtures.filter((match) => !liveStatuses.has(cupStatus(match)) && !completedStatuses.has(cupStatus(match))) : [];
    const live = cupDataReady && Array.isArray(cupData.live) ? cupData.live.filter((match) => liveStatuses.has(cupStatus(match))) : [];
    const cupMatchKey = (match) => String(match.fixture_id ?? match.id ?? `${match.home_team}-${match.away_team}-${match.timestamp || ""}`);
    const allCupFixtures = [...new Map(fixtures.map((match) => [cupMatchKey(match), match])).values()]
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const results = cupDataReady && Array.isArray(cupData.results) ? cupData.results.filter((match) => completedStatuses.has(cupStatus(match))) : [];
    const table = cupDataReady && Array.isArray(cupData.table) ? cupData.table : [];
    const scorers = cupDataReady && Array.isArray(cupData.top_scorers) ? cupData.top_scorers : [];
    let cupContent = `<article class="page-card"><div class="empty">Choose a cup competition to load its data.</div></article>`;
    if (activeCup && !cupDataReady) {
      cupContent = `<article class="page-card"><div class="empty">Loading ${this._escape(activeCup.name)} data…</div></article>`;
    } else if (activeCup && this._cupView === "fixtures") {
      cupContent = `<section class="section"><h2>${this._escape(activeCup.name)} fixtures</h2><p>Upcoming matches only. In-progress matches move to Live automatically.</p><div class="match-list">${allCupFixtures.length ? allCupFixtures.map((match) => this._matchCard(match)).join("") : `<div class="empty">No cup fixtures are available yet.</div>`}</div></section>`;
    } else if (activeCup && this._cupView === "live") {
      cupContent = `<section class="section"><h2>${this._escape(activeCup.name)} live matches</h2><div class="match-list">${live.length ? live.map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No matches from this cup are live right now.</div>`}</div></section>`;
    } else if (activeCup && this._cupView === "results") {
      cupContent = `<section class="section"><h2>${this._escape(activeCup.name)} results</h2><div class="match-list">${results.length ? results.map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No cup results are available yet.</div>`}</div></section>`;
    } else if (activeCup && this._cupView === "table") {
      cupContent = `<section class="page-card cup-table"><h2>${activeCup.has_table ? "Table / phase standings" : "Knockout competition"}</h2>${activeCup.has_table ? this._tableRows(table) : `<div class="empty">This competition uses knockout rounds, so follow it through Fixtures and Results.</div>`}</section>`;
    } else if (activeCup) {
      cupContent = `<section class="dashboard-grid cup-overview"><article class="stat-card"><div class="card-heading"><span>Competition</span></div><div class="big-stat cup-name">${this._escape(activeCup.name)}</div><div class="stat-label">${this._escape(activeCup.country)}</div></article><article class="stat-card"><div class="card-heading"><span>Matches</span></div><div class="big-stat">${fixtures.length + live.length + results.length}</div><div class="stat-label">${fixtures.length} upcoming · ${live.length} live · ${results.length} completed</div></article><article class="list-card cup-fixtures-card"><div class="card-heading"><span>Latest results</span><button class="text-button" data-cup-view="results">View all</button></div><div class="match-list">${results.length ? results.slice(0, 5).map((match) => this._matchCard(match, "result")).join("") : `<div class="empty">No completed matches yet.</div>`}</div></article><article class="list-card cup-scorers-card"><div class="card-heading"><span>Top scorers</span></div>${this._playerRows(scorers, "goals")}</article></section>`;
    }

    return `
      <section class="page-heading">
        <div><span class="eyebrow">CUP COMPETITIONS</span><h1>Cups</h1><p>Choose a country, then select the cup you want Football Hub to follow.</p></div>
        <span class="pill">${this._escape(catalogue.length)} competitions</span>
      </section>
      <section class="page-card cups-picker">
        <label><span>Country / region</span><select id="cup-country-select" aria-label="Cup country">
          ${countries.map((country) => `<option value="${this._escape(country)}" ${country === this._selectedCupCountry ? "selected" : ""}>${this._escape(this._displayCountry(country))}</option>`).join("")}
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
          <nav class="cup-tabs"><button data-cup-view="overview" class="${this._cupView === "overview" ? "active" : ""}">Overview</button><button data-cup-view="live" class="${this._cupView === "live" ? "active" : ""}">Live (${live.length})</button><button data-cup-view="fixtures" class="${this._cupView === "fixtures" ? "active" : ""}">Fixtures (${allCupFixtures.length})</button><button data-cup-view="results" class="${this._cupView === "results" ? "active" : ""}">Results (${results.length})</button><button data-cup-view="table" class="${this._cupView === "table" ? "active" : ""}">Table</button></nav>
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
    const guideCountry = this._displayCountry(guide.country || this._statusInfo().country || "England");
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
      case "last-man-standing":
        return this._lastManStandingPage();
      case "double-pick-league":
        return this._accaLeaguePage();
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

    for (const [id, draft] of Object.entries(this._formDraft)) {
      const control = this.shadowRoot.getElementById(id);
      if (!control) continue;
      if (Object.prototype.hasOwnProperty.call(draft, "checked")) control.checked = draft.checked;
      if (Object.prototype.hasOwnProperty.call(draft, "value")) control.value = draft.value;
    }

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
      this._setFixtureTeam(event.target.value || "__all__");
    });
    this.shadowRoot.querySelectorAll("[data-fixture-team-quick]").forEach((button) => button.addEventListener("click", () => this._setFixtureTeam(button.dataset.fixtureTeamQuick)));

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
    this.shadowRoot.querySelector("#live-close-match")?.addEventListener("click", () => {
      this._selectedLiveMatch = "";
      localStorage.removeItem("football_hub_live_match");
      this._render();
    });

    this.shadowRoot.querySelector("#my-club-select")?.addEventListener("change", (event) => {
      this._setMyClub(event.target.value);
    });
    this.shadowRoot.querySelectorAll(".favourite-club-remove").forEach((button) => {
      button.addEventListener("click", () => this._removeFavouriteClub(button.dataset.team, button.dataset.competition));
    });
    this.shadowRoot.querySelectorAll(".favourite-club-open").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.competition && button.dataset.competition !== this._statusInfo().competition_key) {
          this._setLeague(button.dataset.competition);
        }
        this._selectedClub = button.dataset.team;
        localStorage.setItem("football_hub_my_club", this._selectedClub);
        this._render();
      });
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

    this.shadowRoot.querySelectorAll("[data-live-filter-kind]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const kind = checkbox.dataset.liveFilterKind;
        const value = checkbox.dataset.liveFilterValue;
        const filters = kind === "country" ? this._hiddenLiveCountries : kind === "gender" ? this._hiddenLiveGenders : this._hiddenLiveCompetitions;
        if (checkbox.checked) filters.delete(value);
        else filters.add(value);
        if (kind === "competition" && checkbox.checked && value.includes("|||")) filters.delete(value.split("|||").slice(1).join("|||"));
        if (kind === "country") {
          this.shadowRoot.querySelectorAll('[data-live-filter-kind="competition"]').forEach((competitionCheckbox) => {
            const countries = String(competitionCheckbox.dataset.liveFilterCountries || "").split("|");
            // Only link competitions belonging exclusively to this country.
            // Worldwide labels such as "Friendlies" must remain independent.
            if (countries.length !== 1 || !countries.includes(value)) return;
            competitionCheckbox.checked = checkbox.checked;
            const competition = competitionCheckbox.dataset.liveFilterValue;
            if (checkbox.checked) this._hiddenLiveCompetitions.delete(competition);
            else this._hiddenLiveCompetitions.add(competition);
          });
          localStorage.setItem("football_hub_hidden_live_competitions", JSON.stringify([...this._hiddenLiveCompetitions]));
        }
        const storageKey = kind === "country" ? "football_hub_hidden_live_countries" : kind === "gender" ? "football_hub_hidden_live_genders" : "football_hub_hidden_live_competitions";
        localStorage.setItem(storageKey, JSON.stringify([...filters]));
        this._saveSharedPreferences();
        this._render();
      });
    });

    this.shadowRoot.querySelector("#live-filter-search")?.addEventListener("input", (event) => {
      this._liveFilterSearch = event.target.value;
      this._render();
      requestAnimationFrame(() => { const input = this.shadowRoot.querySelector("#live-filter-search"); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
    });
    this.shadowRoot.querySelector("#live-filter-panel")?.addEventListener("toggle", (event) => {
      this._liveFiltersOpen = event.currentTarget.open;
      localStorage.setItem("football_hub_live_filters_open", String(this._liveFiltersOpen));
      this._saveSharedPreferences();
    });
    this.shadowRoot.querySelector("#live-status-filter")?.addEventListener("change", (event) => { this._liveStatusFilter = event.target.value; localStorage.setItem("football_hub_live_status_filter", this._liveStatusFilter); this._saveSharedPreferences(); this._render(); });
    this.shadowRoot.querySelector("#live-display-mode")?.addEventListener("change", (event) => { this._liveDisplayMode = event.target.value; localStorage.setItem("football_hub_live_display_mode", this._liveDisplayMode); this._saveSharedPreferences(); this._render(); });
    this.shadowRoot.querySelector("#live-timezone")?.addEventListener("change", (event) => { this._liveTimezone = event.target.value; localStorage.setItem("football_hub_live_timezone", this._liveTimezone); this._saveSharedPreferences(); this._render(); });
    this.shadowRoot.querySelector("#football-hub-refresh")?.addEventListener("click", async (event) => { event.currentTarget.disabled = true; await this._hass?.callService("football_hub", "refresh", { entry_id: this._statusInfo().config_entry_id || "" }).catch(() => {}); setTimeout(() => this._render(), 800); });
    this.shadowRoot.querySelectorAll("[data-live-favourite]").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); const name = button.dataset.liveFavourite; if (this._favouriteLiveCompetitions.has(name)) this._favouriteLiveCompetitions.delete(name); else this._favouriteLiveCompetitions.add(name); localStorage.setItem("football_hub_favourite_live_competitions", JSON.stringify([...this._favouriteLiveCompetitions])); this._saveSharedPreferences(); this._render(); }));
    this.shadowRoot.querySelectorAll("[data-live-filter-action]").forEach((button) => button.addEventListener("click", (event) => { event.preventDefault(); const target = button.dataset.liveFilterTarget; const checked = button.dataset.liveFilterAction === "all"; this.shadowRoot.querySelectorAll(`[data-live-filter-kind="${target}"]`).forEach((input) => { input.checked = checked; const filters = target === "country" ? this._hiddenLiveCountries : target === "gender" ? this._hiddenLiveGenders : this._hiddenLiveCompetitions; if (checked) filters.delete(input.dataset.liveFilterValue); else filters.add(input.dataset.liveFilterValue); }); localStorage.setItem(target === "country" ? "football_hub_hidden_live_countries" : target === "gender" ? "football_hub_hidden_live_genders" : "football_hub_hidden_live_competitions", JSON.stringify([...(target === "country" ? this._hiddenLiveCountries : target === "gender" ? this._hiddenLiveGenders : this._hiddenLiveCompetitions)])); this._saveSharedPreferences(); this._render(); }));
    this.shadowRoot.querySelectorAll("[data-live-notification]").forEach((input) => input.addEventListener("change", async () => { this._liveNotifications[input.dataset.liveNotification] = input.checked; if (input.checked && "Notification" in window && Notification.permission === "default") await Notification.requestPermission(); localStorage.setItem("football_hub_live_notifications", JSON.stringify(this._liveNotifications)); this._saveSharedPreferences(); }));

    this.shadowRoot.querySelectorAll("[data-transfer-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this._transferView = button.dataset.transferView;
        localStorage.setItem("football_hub_transfer_view", this._transferView);
        this._render();
      });
    });

    this.shadowRoot.querySelector("#dp-create")?.addEventListener("click", () => this._createDoublePickGame(this.shadowRoot.querySelector("#dp-game-name")?.value, [...this.shadowRoot.querySelectorAll(".dp-competition-check:checked")].map((input) => input.value), this.shadowRoot.querySelector("#dp-player-names")?.value, this.shadowRoot.querySelector("#dp-pick-count")?.value));
    this.shadowRoot.querySelectorAll("[data-dp-view]").forEach((button) => button.addEventListener("click", () => { this._doublePickView = button.dataset.dpView; localStorage.setItem("football_hub_double_pick_view", this._doublePickView); this._render(); }));
    this.shadowRoot.querySelectorAll(".dp-load-competition").forEach((button) => button.addEventListener("click", () => this._loadDoublePickCompetition(button.dataset.competition)));
    this.shadowRoot.querySelector("#dp-load-all")?.addEventListener("click", () => this._loadAllDoublePickCompetitions());
    this.shadowRoot.querySelector("#dp-save-competitions")?.addEventListener("click", () => this._updateDoublePickCompetitions([...this.shadowRoot.querySelectorAll(".dp-game-competition-check:checked")].map((input) => input.value)));
    this.shadowRoot.querySelectorAll(".dp-pick").forEach((select) => select.addEventListener("change", () => this._setDoublePick(select.dataset.playerId, select.dataset.slot, select.value)));
    this.shadowRoot.querySelectorAll(".dp-edit-email").forEach((button) => button.addEventListener("click", () => {
      const player = this._doublePickGame?.players?.find((item) => item.id === button.dataset.playerId);
      if (!player) return;
      const email = window.prompt(`Email address for ${player.name}:`, player.email || "");
      if (email === null) return;
      const clean = String(email).trim();
      if (clean && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { window.alert("Enter a valid email address."); return; }
      player.email = clean;
      this._saveDoublePickGame();
      this._render();
    }));
    this.shadowRoot.querySelectorAll(".dp-email-player").forEach((button) => button.addEventListener("click", () => this._emailDoublePickPlayer(button.dataset.playerId, button.dataset.emailKind)));
    this.shadowRoot.querySelector("#dp-email-service")?.addEventListener("change", (event) => { this._doublePickGame.emailNotifyService = event.target.value; this._doublePickGame.emailServiceInherited = true; this._saveDoublePickGame(); });
    [["#dp-round-start", "startDate"], ["#dp-round-end", "endDate"], ["#dp-payer", "payerId"]].forEach(([selector, field]) => this.shadowRoot.querySelector(selector)?.addEventListener("change", (event) => { const round = this._doublePickRound(); round[field] = event.target.value; this._saveDoublePickGame(); this._render(); }));
    [["#dp-stake", "stake"], ["#dp-return", "returnAmount"]].forEach(([selector, field]) => this.shadowRoot.querySelector(selector)?.addEventListener("change", (event) => { this._doublePickRound()[field] = Math.max(0, Number(event.target.value) || 0); this._saveDoublePickGame(); this._render(); }));
    this.shadowRoot.querySelector("#dp-check-results")?.addEventListener("click", () => this._settleDoublePickRound());
    this.shadowRoot.querySelector("#dp-next-round")?.addEventListener("click", () => this._nextDoublePickRound());
    this.shadowRoot.querySelector("#dp-add-player")?.addEventListener("click", () => { const name = String(this.shadowRoot.querySelector("#dp-new-player")?.value || "").trim(); if (!name) return; this._doublePickGame.players.push({ id: `dp-${Date.now()}`, name, email: String(this.shadowRoot.querySelector("#dp-new-email")?.value || "").trim(), points: 0 }); this._saveDoublePickGame(); this._render(); });
    this.shadowRoot.querySelector("#dp-delete")?.addEventListener("click", () => { if (!confirm("Delete this Acca League game from Home Assistant?")) return; this._doublePickGame = null; this._saveDoublePickGame(); this._render(); });
    this.shadowRoot.querySelector("#dp-create-share")?.addEventListener("click", () => this._createDoublePickShare());
    this.shadowRoot.querySelector("#dp-sync-share")?.addEventListener("click", async () => { await this._syncDoublePickShare(); window.alert("External Acca League page updated."); });
    this.shadowRoot.querySelector("#dp-copy-share")?.addEventListener("click", async () => { const url = this._doublePickGame?.shareUrl; if (!url) return; if (await this._copyText(url)) window.alert("Acca League link copied."); else window.prompt("Copy the Acca League link:", url); });
    [["#dp-email-reminders", "reminder"], ["#dp-email-confirmation", "confirmation"], ["#dp-email-results", "results"]].forEach(([selector, kind]) => this.shadowRoot.querySelector(selector)?.addEventListener("click", () => this._emailDoublePickRound(kind)));

    this.shadowRoot.querySelectorAll("[data-lms-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this._saveLms();
        this._lmsMode = button.dataset.lmsMode;
        localStorage.setItem("football_hub_lms_mode", this._lmsMode);
        try {
          this._lmsCompetition = JSON.parse(localStorage.getItem(this._lmsMode === "global" ? "football_hub_lms_global" : "football_hub_lms_private") || "null");
        } catch (_error) {
          this._lmsCompetition = null;
        }
        this._lmsAdminUnlocked = false;
        this._render();
      });
    });
    this.shadowRoot.querySelector("#lms-create")?.addEventListener("click", async () => {
      if (this._lmsMode === "global") {
        const enteredKey = String(this.shadowRoot.querySelector("#lms-global-developer-key")?.value || "");
        this._globalDeveloperKey = (enteredKey.match(/\b[a-f0-9]{64}\b/i) || [""])[0];
        if (this._globalDeveloperKey) localStorage.setItem("football_hub_global_developer_key", this._globalDeveloperKey);
      }
      const leagues = [...this.shadowRoot.querySelectorAll(".lms-league-check:checked")].map((input) => input.value);
      await this._createLmsCompetition(
        this.shadowRoot.querySelector("#lms-name")?.value,
        leagues,
        this.shadowRoot.querySelector("#lms-admin-password")?.value,
        this.shadowRoot.querySelector("#lms-admin-confirm")?.value,
        this.shadowRoot.querySelector("#lms-entry-fee")?.value,
      );
    });
    this.shadowRoot.querySelector("#lms-remote-open")?.addEventListener("click", async () => {
      await this._openRemoteLmsGame(
        this.shadowRoot.querySelector("#lms-remote-game")?.value,
        this.shadowRoot.querySelector("#lms-remote-password")?.value,
      );
    });
    this.shadowRoot.querySelector("#lms-remote-password")?.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") await this._openRemoteLmsGame(this.shadowRoot.querySelector("#lms-remote-game")?.value, event.target.value);
    });
    this.shadowRoot.querySelectorAll("[data-lms-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this._lmsPageView = button.dataset.lmsView;
        localStorage.setItem("football_hub_lms_page_view", this._lmsPageView);
        this._render();
      });
    });
    this.shadowRoot.querySelectorAll(".lms-toggle-paid").forEach((button) => {
      button.addEventListener("click", () => this._toggleLmsPaid(button.dataset.playerId));
    });
    this.shadowRoot.querySelectorAll(".lms-buy-back").forEach((button) => {
      button.addEventListener("click", () => this._buyBackLmsPlayer(button.dataset.playerId));
    });
    this.shadowRoot.querySelector("#lms-edit-entry-fee")?.addEventListener("change", (event) => this._setLmsEntryFee(event.target.value));
    this.shadowRoot.querySelector("#lms-rollover")?.addEventListener("click", () => this._rolloverLmsCompetition());
    this.shadowRoot.querySelector("#lms-admin-unlock")?.addEventListener("click", async () => {
      await this._unlockLmsAdmin(this.shadowRoot.querySelector("#lms-admin-unlock-password")?.value);
    });
    this.shadowRoot.querySelector("#lms-existing-admin-save")?.addEventListener("click", async () => {
      await this._setLmsAdminPassword(
        this.shadowRoot.querySelector("#lms-existing-admin-password")?.value,
        this.shadowRoot.querySelector("#lms-existing-admin-confirm")?.value,
      );
    });
    this.shadowRoot.querySelector("#lms-admin-unlock-password")?.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") await this._unlockLmsAdmin(event.target.value);
    });
    this.shadowRoot.querySelector("#lms-admin-lock")?.addEventListener("click", () => {
      this._lmsAdminUnlocked = false;
      this._render();
    });
    this.shadowRoot.querySelector("#lms-add-player")?.addEventListener("click", () => {
      this._addLmsPlayer(
        this.shadowRoot.querySelector("#lms-player-name")?.value,
        this.shadowRoot.querySelector("#lms-player-email")?.value,
      );
    });
    this.shadowRoot.querySelector("#lms-create-share")?.addEventListener("click", () => this._createLmsShare());
    this.shadowRoot.querySelector("#lms-copy-external-organiser")?.addEventListener("click", async () => {
      const url = `${LMS_SHARE_SERVICE}/organise`;
      const copied = await this._copyText(url);
      if (copied) window.alert("External LMS organiser link copied.");
      else window.prompt("Copy the external LMS organiser link:", url);
    });
    this.shadowRoot.querySelector("#lms-toggle-joining")?.addEventListener("click", async () => {
      if (!this._isLmsAdmin() || !this._lmsCompetition || this._lmsMode !== "global") return;
      this._lmsCompetition.joiningOpen = !this._lmsCompetition.joiningOpen;
      this._saveLms();
      await this._syncLmsShare();
      this._render();
    });
    this.shadowRoot.querySelector("#lms-share-sync")?.addEventListener("click", async () => {
      await this._pullLmsSharePicks(true);
      await this._syncLmsShare();
      window.alert("Competition page updated.");
    });
    this.shadowRoot.querySelector("#lms-copy-share")?.addEventListener("click", async () => {
      if (!this._lmsCompetition?.shareUrl) return;
      const copied = await this._copyText(this._lmsCompetition.shareUrl);
      if (copied) window.alert("Competition link copied.");
      else window.prompt("Copy the competition link:", this._lmsCompetition.shareUrl);
    });
    this.shadowRoot.querySelector("#lms-email-service")?.addEventListener("change", (event) => {
      if (!this._isLmsAdmin() || !this._lmsCompetition) return;
      this._lmsCompetition.emailNotifyService = event.target.value;
      this._saveLms();
      this._render();
    });
    this.shadowRoot.querySelector("#lms-email-outstanding")?.addEventListener("click", async () => {
      if (!window.confirm("Email a private pick-link reminder to every active player who has not selected a team?")) return;
      const sent = await this._sendLmsOutstandingEmails(false);
      window.alert(sent ? `Reminder emailed to ${sent} player${sent === 1 ? "" : "s"}.` : "No outstanding players with an email address were found.");
    });
    this.shadowRoot.querySelectorAll(".lms-copy-player-link").forEach((button) => {
      button.addEventListener("click", async () => {
        const player = this._lmsCompetition?.players?.find((item) => item.id === button.dataset.playerId);
        if (!player?.pickUrl) return;
        const copied = await this._copyText(player.pickUrl);
        if (copied) window.alert(`${player.name}'s private pick link copied.`);
        else window.prompt(`Copy ${player.name}'s private pick link:`, player.pickUrl);
      });
      const player = this._lmsCompetition?.players?.find((item) => item.id === button.dataset.playerId);
      if (player?.email && player?.pickUrl) {
        const emailButton = document.createElement("button");
        emailButton.className = "lms-email-player-link";
        emailButton.dataset.playerId = player.id;
        emailButton.disabled = !this._lmsCompetition?.emailNotifyService;
        emailButton.innerHTML = '<ha-icon icon="mdi:email-send-outline"></ha-icon> Email pick link';
        emailButton.addEventListener("click", () => this._sendLmsPlayerEmail(player));
        button.after(emailButton);
      }
    });
    this.shadowRoot.querySelectorAll(".lms-edit-player-email").forEach((button) => {
      button.addEventListener("click", () => this._editLmsPlayerEmail(button.dataset.playerId));
    });
    this.shadowRoot.querySelectorAll(".lms-remove-player").forEach((button) => {
      button.addEventListener("click", () => this._removeLmsPlayer(button.dataset.playerId));
    });
    this.shadowRoot.querySelector("#lms-active-league")?.addEventListener("change", (event) => {
      this._lmsActiveLeague = event.target.value;
      localStorage.setItem("football_hub_lms_active_league", this._lmsActiveLeague);
      this._setLeague(this._lmsActiveLeague);
    });
    this.shadowRoot.querySelector("#lms-settle")?.addEventListener("click", () => this._settleLmsRound());
    this.shadowRoot.querySelector("#lms-delete")?.addEventListener("click", () => {
      if (!this._isLmsAdmin()) return;
      if (!window.confirm("Delete this Last Man Standing competition?")) return;
      this._lmsCompetition = null;
      this._saveLms();
      this._render();
    });
    this.shadowRoot.querySelectorAll(".lms-pick").forEach((select) => {
      select.addEventListener("change", () => this._setLmsPick(select.dataset.playerId, select.value));
    });
    this.shadowRoot.querySelectorAll(".lms-next-pick").forEach((select) => {
      select.addEventListener("change", () => this._setLmsEarlyPick(select.dataset.playerId, select.value));
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
      .lms-mode-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin-bottom:18px; }
      .lms-mode { color:inherit; text-align:left; cursor:pointer; display:grid; grid-template-columns:auto 1fr; gap:7px 14px; align-items:center; }
      .lms-mode ha-icon { grid-row:1/4; --mdc-icon-size:38px; color:var(--fh-cyan); }
      .lms-mode span { color:var(--secondary-text-color); }
      .lms-mode em { color:#6fffb0; font-style:normal; font-weight:900; text-transform:uppercase; font-size:.7rem; }
      .lms-mode.active { border-color:var(--fh-cyan); box-shadow:0 0 22px rgba(0,183,255,.16); }
      .lms-coming { min-height:340px; }
      .lms-create, .lms-summary { display:flex; justify-content:space-between; align-items:center; gap:20px; }
      .lms-create { display:grid; align-items:stretch; }
      .lms-form, .lms-add-player { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
      .lms-form input, .lms-add-player input { min-width:240px; flex:1; }
      .lms-fee-input { display:grid; grid-template-columns:auto auto minmax(90px,130px); align-items:center; gap:7px; color:var(--secondary-text-color); }
      .lms-fee-input input { min-width:90px; width:130px; }
      .lms-create input, .lms-add-player input, .lms-player select, .lms-admin-unlock input { min-height:44px; border:1px solid var(--fh-border); border-radius:10px; padding:0 13px; color:#fff; background:rgba(1,13,27,.9); }
      .lms-create button, .lms-add-player button, .lms-summary button { min-height:44px; border:1px solid rgba(0,183,255,.55); border-radius:10px; padding:0 16px; color:#fff; background:rgba(0,126,190,.3); cursor:pointer; font-weight:850; }
      .lms-summary-stats { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
      .lms-league-heading { display:flex; align-items:end; justify-content:space-between; gap:12px; }
      .lms-league-heading span { color:var(--secondary-text-color); font-size:.8rem; }
      .lms-league-groups { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
      .lms-league-groups fieldset { min-width:0; padding:12px; border:1px solid var(--fh-border); border-radius:10px; background:rgba(0,16,34,.46); }
      .lms-league-groups legend { padding:0 6px; color:var(--fh-cyan); font-weight:900; }
      .lms-league-groups label { display:flex; align-items:center; gap:9px; padding:7px 4px; color:var(--secondary-text-color); cursor:pointer; }
      .lms-league-groups input { width:18px; height:18px; accent-color:#22df7c; }
      .lms-create-button { justify-self:start; }
      .lms-password-setup { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
      .lms-password-setup label { display:flex; flex-direction:column; gap:6px; color:var(--secondary-text-color); }
      .lms-password-setup small { grid-column:1/-1; color:#ffc85c; }
      .lms-admin-unlock { display:grid; grid-template-columns:auto 1fr minmax(220px,360px) auto; align-items:center; gap:14px; margin:14px 0; border-color:rgba(255,196,72,.5); }
      .lms-admin-unlock > ha-icon { color:#ffc448; --mdc-icon-size:34px; }
      .lms-admin-unlock div { display:flex; flex-direction:column; gap:4px; }
      .lms-admin-unlock span { color:var(--secondary-text-color); }
      .lms-admin-unlock button { min-height:44px; border:1px solid rgba(255,196,72,.55); border-radius:10px; padding:0 18px; color:#fff; background:rgba(180,117,0,.25); font-weight:900; cursor:pointer; }
      .lms-remote-login { display:grid; grid-template-columns:auto minmax(260px,1fr) minmax(220px,1fr) minmax(190px,.7fr) auto; align-items:center; gap:14px; margin:14px 0; border-color:rgba(0,183,255,.5); }
      .lms-remote-login > ha-icon { color:#00b7ff; --mdc-icon-size:34px; }
      .lms-remote-login div { display:flex; flex-direction:column; gap:4px; }
      .lms-remote-login input, .lms-remote-login button { min-height:44px; border:1px solid var(--fh-border); border-radius:10px; padding:0 13px; color:#fff; background:rgba(1,13,27,.9); }
      .lms-remote-login button { border-color:rgba(0,183,255,.55); background:rgba(0,126,190,.3); cursor:pointer; font-weight:900; }
      .lms-summary button ha-icon, .lms-admin-status ha-icon { vertical-align:middle; --mdc-icon-size:18px; }
      .lms-summary-stats span { padding:10px 14px; border:1px solid var(--fh-border); border-radius:10px; }
      .lms-summary .danger { border-color:rgba(255,77,77,.6); background:rgba(255,77,77,.14); }
      .lms-prize { display:flex; align-items:center; justify-content:space-between; gap:18px; margin:14px 0; border-color:rgba(73,236,143,.48); background:linear-gradient(100deg,rgba(34,203,112,.14),rgba(2,17,34,.82)); }
      .lms-prize > div { display:flex; flex-direction:column; gap:3px; }
      .lms-prize > div > strong { color:#62ffa8; font-size:2rem; }
      .lms-prize small { color:var(--secondary-text-color); }
      .lms-prize label { display:grid; grid-template-columns:auto auto 100px; align-items:center; gap:7px; }
      .lms-prize input { min-height:42px; min-width:0; width:100px; border:1px solid var(--fh-border); border-radius:9px; padding:0 10px; color:#fff; background:rgba(1,13,27,.9); }
      .lms-prize button { min-height:44px; border:1px solid rgba(73,236,143,.5); border-radius:10px; padding:0 15px; color:#fff; background:rgba(34,203,112,.16); font-weight:900; cursor:pointer; }
      .lms-share { display:flex; align-items:center; gap:16px; margin:14px 0; border-color:rgba(0,183,255,.45); }
      .lms-share > ha-icon { --mdc-icon-size:38px; color:var(--fh-cyan); }
      .lms-share > div { display:grid; gap:4px; flex:1; min-width:0; }
      .lms-share small { color:var(--secondary-text-color); }
      .lms-share a { color:#62ffa8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .lms-share button, .lms-copy-player-link { min-height:42px; border:1px solid rgba(0,183,255,.52); border-radius:10px; padding:0 13px; color:#fff; background:rgba(0,126,190,.24); font-weight:900; cursor:pointer; }
      .lms-share button:disabled { opacity:.45; cursor:not-allowed; }
      .lms-email { display:flex; align-items:center; gap:16px; margin:14px 0; border-color:rgba(73,236,143,.42); }
      .lms-email > ha-icon { --mdc-icon-size:38px; color:#62ffa8; }
      .lms-email > div { display:grid; gap:4px; flex:1; min-width:220px; }
      .lms-email small { color:var(--secondary-text-color); }
      .lms-email label { display:grid; gap:5px; min-width:280px; }
      .lms-email select { min-height:42px; border:1px solid var(--fh-border); border-radius:10px; padding:0 10px; color:#fff; background:rgba(1,13,27,.9); }
      .lms-email button, .lms-email-player-link { min-height:42px; border:1px solid rgba(73,236,143,.52); border-radius:10px; padding:0 13px; color:#fff; background:rgba(34,203,112,.16); font-weight:900; cursor:pointer; }
      .lms-email button:disabled, .lms-email-player-link:disabled { opacity:.45; cursor:not-allowed; }
      .lms-winner { display:flex; align-items:center; gap:18px; margin:14px 0; border-color:rgba(255,207,56,.65); background:linear-gradient(100deg,rgba(255,191,26,.2),rgba(2,17,34,.82)); }
      .lms-winner > ha-icon { color:#ffd34e; --mdc-icon-size:52px; }
      .lms-winner h2, .lms-winner p { margin:4px 0; }
      .lms-rules { display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin:14px 0; }
      .lms-rules span { padding:7px 10px; border-radius:999px; background:rgba(49,233,129,.08); color:var(--secondary-text-color); }
      .lms-deadline { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; margin:14px 0; border-color:rgba(255,196,72,.55); background:linear-gradient(100deg,rgba(255,164,35,.15),rgba(2,17,34,.82)); }
      .lms-deadline ha-icon { color:#ffc448; --mdc-icon-size:34px; }
      .lms-deadline div { display:flex; flex-direction:column; gap:4px; }
      .lms-deadline strong { font-size:1rem; }
      .lms-deadline small { color:var(--secondary-text-color); }
      .lms-deadline > b { color:#ffc448; font-size:1.15rem; letter-spacing:.04em; text-align:right; }
      .lms-deadline.locked { border-color:rgba(255,77,77,.62); background:linear-gradient(100deg,rgba(255,55,65,.17),rgba(2,17,34,.86)); }
      .lms-deadline.locked ha-icon, .lms-deadline.locked > b { color:#ff626c; }
      .lms-league-switch { display:flex; align-items:end; justify-content:space-between; gap:16px; margin-bottom:14px; }
      .lms-league-switch label { display:flex; min-width:min(460px,100%); flex-direction:column; gap:6px; }
      .lms-league-switch select { min-height:44px; border:1px solid var(--fh-border); border-radius:10px; padding:0 13px; color:#fff; background:rgba(1,13,27,.9); }
      .lms-page-tabs { display:flex; gap:10px; margin:14px 0; }
      .lms-page-tabs button { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 16px; border:1px solid var(--fh-border); border-radius:10px; color:var(--secondary-text-color); background:rgba(1,13,27,.72); font-weight:900; cursor:pointer; }
      .lms-page-tabs button.active { color:#fff; border-color:var(--fh-cyan); background:rgba(0,126,190,.28); box-shadow:0 0 18px rgba(0,183,255,.12); }
      .lms-page-tabs b { min-width:24px; padding:3px 7px; border-radius:999px; background:rgba(255,255,255,.1); }
      .lms-round-fixtures { display:grid; gap:14px; }
      .lms-round-league { padding:0; overflow:hidden; }
      .lms-round-league > header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:15px 18px; border-bottom:1px solid var(--fh-border); background:rgba(0,93,158,.14); }
      .lms-round-league h3 { margin:3px 0 0; }
      .lms-round-league > header > b { color:#62ffa8; }
      .lms-round-match { display:grid; grid-template-columns:minmax(0,1fr) 35px minmax(0,1fr) minmax(150px,190px); align-items:center; gap:12px; min-height:58px; padding:8px 18px; border-bottom:1px solid rgba(255,255,255,.08); }
      .lms-round-match:last-child { border-bottom:0; }
      .lms-round-match > span { display:flex; align-items:center; gap:9px; font-weight:850; }
      .lms-round-match .home { justify-content:flex-end; text-align:right; }
      .lms-round-match .away { justify-content:flex-start; }
      .lms-round-match > strong { color:var(--fh-cyan); text-align:center; }
      .lms-round-match.has-score > strong { color:#62ffa8; font-size:1.05rem; }
      .lms-round-match time { color:var(--secondary-text-color); text-align:right; }
      .lms-standings { padding:0; overflow:hidden; }
      .lms-standings > header { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:18px; border-bottom:1px solid var(--fh-border); }
      .lms-standings h2 { margin:4px 0 0; }
      .lms-standings > header > b { color:#62ffa8; }
      .lms-standings-table { overflow-x:auto; }
      .lms-standings-row { display:grid; grid-template-columns:45px minmax(140px,1fr) minmax(120px,.8fr) minmax(150px,1fr) minmax(260px,2fr) 75px; align-items:center; gap:12px; min-width:900px; padding:13px 18px; border-bottom:1px solid rgba(255,255,255,.08); }
      .lms-standings-row.heading { color:var(--secondary-text-color); font-size:.72rem; font-weight:900; text-transform:uppercase; background:rgba(0,93,158,.12); }
      .lms-standings-row.through > span:nth-child(3) b { color:#62ffa8; }
      .lms-standings-row.eliminated { opacity:.68; background:rgba(255,55,65,.05); }
      .lms-standings-row.eliminated > span:nth-child(3) b { color:#ff7078; }
      .lms-loading { color:#ffc85c; }
      .lms-player-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:16px; }
      .lms-payment-group-title { grid-column:1/-1; display:flex; align-items:center; gap:10px; margin-top:8px; padding:13px 15px; border:1px solid; border-radius:10px; }
      .lms-payment-group-title:first-child { margin-top:0; }
      .lms-payment-group-title > div { display:flex; align-items:baseline; justify-content:space-between; gap:12px; width:100%; }
      .lms-payment-group-title.unpaid { color:#ffc85c; border-color:rgba(255,196,72,.45); background:rgba(255,164,35,.1); }
      .lms-payment-group-title.paid { color:#62ffa8; border-color:rgba(63,242,142,.45); background:rgba(31,203,108,.1); }
      .lms-player { display:grid; gap:14px; }
      .lms-player.out { opacity:.62; border-color:rgba(255,77,77,.35); }
      .lms-player-name { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
      .lms-player-name > div { flex:1; min-width:0; }
      .lms-player-name ha-icon { color:#54f5a0; --mdc-icon-size:32px; }
      .lms-player.out .lms-player-name ha-icon { color:#ff5b65; }
      .lms-player-name div, .lms-player label { display:flex; flex-direction:column; gap:5px; }
      .lms-player-name span, .lms-player label span, .lms-history { color:var(--secondary-text-color); font-size:.78rem; }
      .lms-pick-status { display:inline-flex !important; flex:0 0 auto; flex-direction:row !important; align-items:center; gap:6px; padding:7px 10px; border:1px solid; border-radius:999px; font-weight:900; white-space:nowrap; }
      .lms-pick-status ha-icon { --mdc-icon-size:17px; }
      .lms-pick-status.selected, .lms-pick-status.survived { color:#5dffa6; border-color:rgba(63,242,142,.5); background:rgba(31,203,108,.12); }
      .lms-pick-status.awaiting, .lms-pick-status.waiting { color:#ffc85c; border-color:rgba(255,196,72,.5); background:rgba(255,164,35,.12); }
      .lms-pick-status.eliminated { color:#ff7078; border-color:rgba(255,77,77,.5); background:rgba(255,55,65,.12); }
      .lms-payment-status { padding:6px 9px; border:1px solid; border-radius:999px; font-size:.72rem !important; font-weight:900; white-space:nowrap; }
      .lms-payment-status.paid { color:#62ffa8; border-color:rgba(63,242,142,.45); background:rgba(31,203,108,.1); }
      .lms-payment-status.unpaid { color:#ffc85c; border-color:rgba(255,196,72,.45); background:rgba(255,164,35,.1); }
      .lms-toggle-paid { min-height:32px; border:1px solid var(--fh-border); border-radius:8px; padding:0 9px; color:#fff; background:rgba(255,255,255,.06); cursor:pointer; }
      .lms-buy-back { display:inline-flex; align-items:center; gap:6px; min-height:34px; border:1px solid rgba(255,196,72,.58); border-radius:8px; padding:0 10px; color:#ffd06a; background:rgba(255,164,35,.13); font-weight:900; cursor:pointer; }
      .lms-buy-back ha-icon { --mdc-icon-size:18px; }
      .lms-early-pick { padding:12px; border:1px solid rgba(63,242,142,.48); border-radius:10px; background:rgba(31,203,108,.09); }
      .lms-early-pick > span { display:flex; align-items:center; gap:7px; color:#62ffa8 !important; font-weight:900; }
      .lms-early-pick ha-icon { --mdc-icon-size:18px; }
      .lms-picked-total { border-color:rgba(63,242,142,.45) !important; }
      .lms-history { display:flex; flex-wrap:wrap; gap:6px; }
      .lms-history span { padding:6px 8px; border:1px solid var(--fh-border); border-radius:8px; }
      .lms-player-email { display:flex; align-items:center; gap:8px; margin-top:auto; padding-top:12px; border-top:1px solid var(--fh-border); color:var(--secondary-text-color); font-size:.78rem; min-width:0; }
      .lms-player-email ha-icon { flex:0 0 auto; color:#2fdcff; --mdc-icon-size:18px; }
      .lms-player-email span { min-width:0; overflow-wrap:anywhere; }
      .lms-player-email small { margin-left:auto; color:#62ffa8; white-space:nowrap; }
      .lms-player-admin-actions { display:flex; align-items:center; gap:7px; margin-left:auto; }
      .lms-player-admin-actions button { display:inline-flex; align-items:center; gap:5px; min-height:32px; border:1px solid var(--fh-border); border-radius:8px; padding:0 9px; color:#fff; background:rgba(255,255,255,.06); font-weight:800; cursor:pointer; white-space:nowrap; }
      .lms-player-admin-actions button ha-icon { color:inherit; --mdc-icon-size:16px; }
      .lms-player-admin-actions .lms-remove-player { color:#ff858c; border-color:rgba(255,77,77,.45); background:rgba(255,55,65,.1); }

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
      .double-pick-setup, .dp-round-controls, .dp-add-player { display:flex; flex-wrap:wrap; gap:14px; align-items:end; }
      .double-pick-setup > label, .dp-round-controls label { display:grid; gap:6px; min-width:180px; }
      .double-pick-setup textarea { min-width:min(520px,90vw); }
      .dp-competition-groups { width:100%; display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
      .dp-competition-groups fieldset { border:1px solid var(--line); border-radius:12px; display:grid; gap:7px; }
      .dp-summary-grid, .dp-player-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; margin:14px 0; }
      .dp-summary-grid article, .dp-player-card header, .dp-load-data header, .dp-history-card header { display:flex; justify-content:space-between; gap:12px; }
      .dp-picks, .dp-history { display:grid; gap:12px; }
      .dp-picks label { display:grid; gap:7px; }
      .dp-pick-result { padding:7px 10px; border-radius:8px; font-weight:800; }
      .dp-pick-result.win { color:#8dffbd; background:rgba(31,190,98,.18); border:1px solid rgba(31,190,98,.45); }
      .dp-pick-result.draw { color:#d8dee8; background:rgba(145,155,170,.18); border:1px solid rgba(145,155,170,.45); }
      .dp-pick-result.loss { color:#ff9c9c; background:rgba(225,65,65,.18); border:1px solid rgba(225,65,65,.45); }
      .dp-pick-result.waiting { color:var(--secondary-text-color); background:rgba(255,255,255,.06); }
      .dp-load-data > div { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
      .dp-load-competition { display:grid; gap:3px; text-align:left; }
      .dp-history-card > div { display:grid; grid-template-columns:minmax(120px,.4fr) minmax(240px,1fr) auto; gap:12px; padding:10px 0; border-top:1px solid var(--line); }
      .acca-setup { display:grid; gap:22px; padding:24px; overflow:hidden; }
      .acca-section-head { display:flex; align-items:center; gap:15px; padding-bottom:18px; border-bottom:1px solid var(--line); }
      .acca-section-head > ha-icon { --mdc-icon-size:30px; display:grid; place-items:center; width:54px; height:54px; border-radius:15px; color:var(--fh-cyan); background:linear-gradient(145deg,rgba(0,183,255,.18),rgba(49,233,129,.12)); border:1px solid rgba(0,183,255,.3); }
      .acca-section-head h2, .acca-section-head p, .acca-section-title h3 { margin:3px 0 0; }
      .acca-section-head p, .acca-section-title > small { color:var(--secondary-text-color); }
      .acca-form-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(180px,.6fr); gap:14px; }
      .acca-form-grid label, .acca-player-setup, .acca-competitions, .dp-add-player label, .acca-email-panel label { display:grid; gap:8px; }
      .acca-form-grid label > span, .dp-add-player label > span, .acca-email-panel label > span { color:var(--secondary-text-color); font-size:.78rem; font-weight:850; letter-spacing:.05em; }
      .acca-setup input, .acca-setup textarea, .acca-control-panel input, .acca-control-panel select, .dp-add-player input, .dp-player-card select { width:100%; min-height:48px; border:1px solid var(--fh-border); border-radius:11px; padding:0 14px; color:#fff; background:linear-gradient(180deg,rgba(4,25,46,.96),rgba(1,14,29,.96)); outline:none; }
      .acca-setup textarea { min-height:132px; padding:14px; resize:vertical; font:inherit; }
      .acca-setup input:focus, .acca-setup textarea:focus, .acca-control-panel input:focus, .acca-control-panel select:focus, .dp-add-player input:focus, .dp-player-card select:focus { border-color:var(--fh-cyan); box-shadow:0 0 0 3px rgba(0,183,255,.12); }
      .acca-player-setup, .acca-competitions { padding:18px; border:1px solid var(--line); border-radius:14px; background:rgba(0,19,38,.54); }
      .acca-section-title { display:flex; justify-content:space-between; align-items:end; gap:18px; margin-bottom:12px; }
      .acca-format-help { display:flex; align-items:center; gap:8px; color:var(--secondary-text-color); font-size:.8rem; }
      .acca-format-help ha-icon { color:var(--fh-cyan); }
      .acca-create-bar { display:flex; justify-content:space-between; align-items:center; gap:18px; padding:18px; border-radius:14px; background:linear-gradient(100deg,rgba(0,183,255,.12),rgba(49,233,129,.1)); border:1px solid rgba(49,233,129,.28); }
      .acca-create-bar > div { display:grid; gap:4px; }
      .acca-create-bar small { color:var(--secondary-text-color); }
      .acca-create-bar button, .acca-share button, .acca-control-panel button, .dp-edit-email { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:44px; padding:0 15px; border:1px solid rgba(0,183,255,.48); border-radius:10px; color:#fff; background:rgba(0,126,190,.28); font-weight:850; cursor:pointer; }
      .dp-competition-groups fieldset { padding:13px; background:rgba(1,14,29,.72); }
      .dp-competition-groups legend { display:flex; align-items:center; gap:6px; padding:0 8px; color:#fff; font-weight:900; }
      .dp-competition-groups legend ha-icon { --mdc-icon-size:16px; color:var(--fh-cyan); }
      .dp-competition-groups fieldset label { display:flex; align-items:center; gap:9px; padding:8px; border-radius:8px; cursor:pointer; }
      .dp-competition-groups fieldset label:hover { background:rgba(0,183,255,.08); }
      .dp-competition-groups fieldset label span { display:flex; justify-content:space-between; align-items:center; gap:8px; width:100%; }
      .dp-competition-groups fieldset small { color:var(--secondary-text-color); }
      .acca-control-panel { display:grid; gap:18px; margin:14px 0; }
      .acca-league-editor { margin:14px 0; }
      .acca-league-editor summary { display:flex; justify-content:space-between; align-items:center; gap:14px; cursor:pointer; list-style:none; }
      .acca-league-editor summary::-webkit-details-marker { display:none; }
      .acca-league-editor summary > span { display:grid; gap:4px; }
      .acca-league-editor summary small { color:var(--secondary-text-color); }
      .acca-league-editor[open] summary { padding-bottom:16px; margin-bottom:16px; border-bottom:1px solid var(--line); }
      .acca-league-editor[open] summary > ha-icon { transform:rotate(180deg); }
      .acca-league-editor > button { display:inline-flex; align-items:center; gap:7px; min-height:44px; margin-top:14px; padding:0 16px; border:1px solid rgba(49,233,129,.45); border-radius:10px; color:#fff; background:rgba(49,233,129,.14); font-weight:900; cursor:pointer; }
      .acca-fixture-board { margin:14px 0; }
      .acca-fixture-board > .acca-section-head > strong { margin-left:auto; padding:8px 12px; border-radius:999px; color:var(--fh-cyan); background:rgba(0,183,255,.1); border:1px solid rgba(0,183,255,.25); white-space:nowrap; }
      .acca-fixture-groups { display:grid; gap:16px; margin-top:18px; }
      .acca-fixture-groups > section { overflow:hidden; border:1px solid var(--line); border-radius:13px; background:rgba(1,14,29,.64); }
      .acca-fixture-group-title { display:flex; justify-content:space-between; gap:12px; padding:12px 14px; background:rgba(0,126,190,.1); border-bottom:1px solid var(--line); }
      .acca-fixture-group-title span { color:var(--secondary-text-color); font-size:.78rem; }
      .acca-fixture-row { display:grid; grid-template-columns:150px minmax(130px,1fr) 54px minmax(130px,1fr) 85px; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.06); }
      .acca-fixture-row:last-child { border-bottom:0; }
      .acca-fixture-row time, .acca-fixture-row em { color:var(--secondary-text-color); font-size:.76rem; font-style:normal; }
      .acca-fixture-row .home { text-align:right; }
      .acca-fixture-row b { text-align:center; color:var(--fh-cyan); font-size:1.05rem; }
      .acca-fixture-row.finished { background:rgba(49,233,129,.035); }
      .acca-fixture-row.finished em { color:#7df2ae; }
      .acca-picked-fixtures { display:grid; gap:14px; }
      .acca-picked-round > header { display:flex; justify-content:space-between; align-items:center; gap:14px; padding-bottom:14px; border-bottom:1px solid var(--line); }
      .acca-picked-round > header h2 { margin:4px 0 0; }
      .acca-picked-round > div { display:grid; }
      .acca-picked-fixture { display:grid; grid-template-columns:46px minmax(210px,1fr) minmax(180px,.7fr) 90px; align-items:center; gap:13px; padding:14px 0; border-bottom:1px solid var(--line); }
      .acca-picked-fixture:last-child { border-bottom:0; }
      .acca-picked-fixture > div { display:grid; gap:4px; }
      .acca-picked-fixture small, .acca-picked-fixture span, .acca-picked-fixture time { color:var(--secondary-text-color); font-size:.78rem; }
      .acca-picked-fixture b { text-align:center; padding:8px; border-radius:9px; color:var(--fh-cyan); background:rgba(0,183,255,.1); }
      .acca-control-panel .dp-round-controls { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); align-items:end; gap:12px; }
      .acca-control-panel .dp-round-controls > button { min-height:48px; }
      .acca-email-panel { display:grid; grid-template-columns:minmax(210px,1fr) minmax(230px,1fr) auto; align-items:end; gap:14px; padding:18px; border:1px solid rgba(0,183,255,.24); border-radius:13px; background:rgba(0,126,190,.08); }
      .acca-email-panel > div:first-child { display:grid; gap:4px; }
      .acca-email-panel small { color:var(--secondary-text-color); }
      .acca-email-actions { display:flex; flex-wrap:wrap; gap:8px; }
      .dp-player-card { overflow:hidden; }
      .dp-player-card header { align-items:center; padding-bottom:14px; border-bottom:1px solid var(--line); }
      .dp-player-identity, .dp-player-actions { display:flex; align-items:center; gap:12px; }
      .dp-player-identity > div { display:grid; gap:3px; }
      .dp-avatar { display:grid; place-items:center; width:46px; height:46px; border-radius:50%; color:#001526; background:linear-gradient(135deg,var(--fh-cyan),var(--accent)); font-weight:950; font-size:1.15rem; }
      .dp-email-status { display:flex; align-items:center; gap:5px; color:var(--secondary-text-color); font-size:.78rem; }
      .dp-email-status.ready { color:#7df2ae; }
      .dp-email-status.missing { color:#ffc85c; }
      .dp-email-status ha-icon { --mdc-icon-size:16px; }
      .dp-player-actions { flex-direction:column; align-items:flex-end; }
      .dp-edit-email { min-height:34px; padding:0 10px; font-size:.76rem; }
      .dp-player-email-actions { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line); }
      .dp-player-email-actions > span { margin-right:auto; color:var(--secondary-text-color); font-size:.76rem; font-weight:850; }
      .dp-player-email-actions button { min-height:34px; padding:0 10px; border:1px solid rgba(0,183,255,.42); border-radius:9px; color:#fff; background:rgba(0,126,190,.2); font-weight:800; cursor:pointer; }
      .dp-player-email-actions button:disabled { opacity:.4; cursor:not-allowed; }
      .dp-picks { margin-top:15px; }
      .dp-picks label > span:first-child { color:var(--secondary-text-color); font-size:.76rem; font-weight:900; letter-spacing:.06em; }
      .dp-add-player { padding:18px; display:grid; grid-template-columns:minmax(170px,.7fr) repeat(2,minmax(190px,1fr)) auto; align-items:end; }
      .dp-add-player > div { display:grid; gap:4px; }
      @media (max-width:900px) { .acca-email-panel, .dp-add-player { grid-template-columns:1fr; } .acca-email-actions { justify-content:flex-start; } }
      @media (max-width:620px) { .acca-form-grid { grid-template-columns:1fr; } .acca-section-title, .acca-create-bar, .dp-player-card header { align-items:stretch; flex-direction:column; } .dp-player-actions { align-items:stretch; } .acca-fixture-row { grid-template-columns:1fr 36px 1fr; } .acca-fixture-row time, .acca-fixture-row em { grid-column:1/-1; text-align:center; } .acca-picked-fixture { grid-template-columns:40px 1fr; } .acca-picked-fixture > div:nth-of-type(2), .acca-picked-fixture > b { grid-column:2; text-align:left; } }
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
      .match-competition {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 10px;
        color: var(--primary-color);
        font-size: 0.78rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .match-competition ha-icon { width: 17px; height: 17px; }
      .match-qualification { display:flex; align-items:center; justify-content:center; gap:7px; margin:10px 0; padding:8px 10px; border-radius:10px; color:#7dff9b; background:rgba(31,190,85,.13); font-size:.82rem; text-align:center; }
      .match-qualification ha-icon { width:18px; height:18px; }
      .live-competition-filter { display: grid; grid-template-columns: minmax(220px, .65fr) 1.35fr; gap: 24px; margin: 20px 0; }
      .live-filter-panel { display:block; }
      .live-filter-panel > summary { display:flex; align-items:center; justify-content:space-between; gap:16px; cursor:pointer; list-style:none; }
      .live-filter-panel > summary::-webkit-details-marker { display:none; }
      .live-filter-panel > summary h2 { margin-bottom:0; }
      .live-filter-summary-count { display:flex; align-items:center; gap:7px; color:var(--secondary-text-color); font-weight:750; white-space:nowrap; }
      .live-filter-summary-count ha-icon { transition:transform .2s ease; }
      .live-filter-panel[open] .live-filter-summary-count ha-icon { transform:rotate(180deg); }
      .live-filter-panel-body { display:grid; grid-template-columns:minmax(220px,.65fr) 1.35fr; gap:24px; padding-top:18px; }
      .live-competition-filter h2 { margin: 5px 0 6px; }
      .live-competition-filter p { margin: 0; color: var(--secondary-text-color); }
      .live-filter-groups { display: grid; gap: 10px; }
      .live-filter-groups details { border: 1px solid rgba(255,255,255,.14); border-radius: 14px; padding: 11px 13px; background: rgba(255,255,255,.04); }
      .live-filter-groups summary { cursor: pointer; font-weight: 750; }
      .live-filter-options { display: flex; flex-wrap: wrap; gap: 9px; padding-top: 11px; max-height: 210px; overflow: auto; }
      .live-filter-options label { display: flex; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid rgba(255,255,255,.15); border-radius: 11px; cursor: pointer; background: rgba(255,255,255,.05); }
      .live-filter-options input { width: 18px; height: 18px; accent-color: var(--primary-color); }
      @media (max-width: 760px) { .live-competition-filter, .live-filter-panel-body { grid-template-columns: 1fr; } }
      .live-toolbar { display: grid; grid-template-columns: minmax(200px,1.5fr) repeat(3,minmax(140px,.8fr)) auto; gap: 12px; align-items: end; margin: 20px 0; }
      .live-toolbar label { display: grid; gap: 6px; color: var(--secondary-text-color); font-size: .78rem; }
      .live-toolbar input, .live-toolbar select, .fixture-filter input, .live-picker-control input { min-height: 42px; border-radius: 10px; padding: 8px 11px; border: 1px solid rgba(255,255,255,.18); background: var(--card-background-color); color: var(--primary-text-color); }
      .live-toolbar > button { min-height: 42px; display: flex; align-items: center; justify-content: center; gap: 7px; }
      .live-filter-actions { float: right; display: inline-flex; gap: 6px; }
      .live-filter-actions button { padding: 4px 7px; font-size: .7rem; }
      .live-filter-options label.favourite { border-color: #f6c344; background: rgba(246,195,68,.10); }
      .live-filter-options label button { border: 0; background: transparent; color: #f6c344; font-size: 1.15rem; padding: 0 2px; }
      .country-filter-tree > summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .country-filter-tree > summary label { display: flex; align-items: center; gap: 9px; }
      .live-schedule-group { margin: 15px 0 24px; }
      .live-schedule-group > header { display: flex; align-items: end; justify-content: space-between; padding: 11px 14px; border-left: 4px solid var(--primary-color); background: rgba(255,255,255,.055); border-radius: 8px; }
      .live-schedule-group > header div { display: grid; gap: 2px; }
      .live-schedule-group > header div span, .live-schedule-group > header > span { color: var(--secondary-text-color); font-size: .76rem; }
      .match-list.compact { display: grid; gap: 5px; }
      .match-list.compact .match-card { border-radius: 10px; padding: 8px 12px; }
      .match-list.compact .match-competition, .match-list.compact .match-footer { display: none; }
      .match-list.compact .match-teams img { width: 28px !important; height: 28px !important; }
      .match-list.compact .match-meta { margin-bottom: 4px; }
      .live-utility-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0 24px; }
      .live-utility-grid p { color: var(--secondary-text-color); }
      .live-diagnostics > div { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
      .live-utility-grid.compact { grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr); gap:10px; margin:8px 0 14px; }
      .live-utility-grid.compact .page-card { padding:11px 14px; border-radius:14px; }
      .live-utility-grid.compact header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
      .live-utility-grid.compact header .eyebrow { margin:0; }
      .live-alert-options { display:flex; flex-wrap:wrap; gap:6px 14px; }
      .live-alert-options label { display:flex; align-items:center; gap:5px; font-size:.76rem; }
      .live-diagnostics.compact { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px 12px; }
      .live-diagnostics.compact header { grid-column:1/-1; margin-bottom:0; }
      .live-diagnostics.compact > div { display:flex; flex-direction:column; gap:2px; padding:4px 0; border:0; font-size:.72rem; }
      .live-diagnostics.compact > div strong { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .fixture-filter > div { display: flex; gap: 8px; margin-top: 7px; }
      @media (max-width: 1050px) { .live-toolbar { grid-template-columns: 1fr 1fr; } }
      @media (max-width: 700px) { .live-toolbar, .live-utility-grid, .live-utility-grid.compact { grid-template-columns: 1fr; } .live-diagnostics.compact { grid-template-columns:repeat(2,minmax(0,1fr)); } }

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
      .live-close-match { display:inline-flex; align-items:center; gap:6px; margin:0 0 14px; padding:7px 11px; border:1px solid rgba(255,255,255,.18); border-radius:10px; background:rgba(255,255,255,.07); color:var(--primary-text-color); cursor:pointer; }
      .live-close-match ha-icon { width:18px; height:18px; }

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
      .favourite-club-list { display:flex; flex:1 1 100%; flex-wrap:wrap; align-items:center; gap:8px; margin-top:14px; }
      .favourite-club-chip { display:grid; grid-template-columns:auto auto 28px; align-items:center; gap:8px; padding:5px 6px 5px 10px; border:1px solid rgba(0,183,255,.35); border-radius:999px; background:rgba(0,42,82,.56); }
      .favourite-club-chip button { color:inherit; border:0; background:none; cursor:pointer; font-weight:800; }
      .favourite-club-chip small { color:var(--secondary-text-color); }
      .favourite-club-chip .favourite-club-remove { width:26px; height:26px; padding:0; border-radius:50%; color:#ff9aa6; font-size:1.15rem; }
      .favourite-club-chip .favourite-club-remove:hover { color:#fff; background:#a51f34; }

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
        .lms-mode-grid, .lms-player-list { grid-template-columns:1fr; }
        .lms-league-groups { grid-template-columns:1fr; }
        .lms-create, .lms-summary { align-items:stretch; flex-direction:column; }
        .lms-form, .lms-add-player { align-items:stretch; flex-direction:column; }
        .lms-prize, .lms-share, .lms-email { align-items:stretch; flex-direction:column; }
        .lms-page-tabs { flex-direction:column; }
        .lms-round-match { grid-template-columns:minmax(0,1fr) 28px minmax(0,1fr); padding:10px; }
        .lms-round-match time { grid-column:1/-1; text-align:center; }
        .lms-password-setup { grid-template-columns:1fr; }
        .lms-password-setup small { grid-column:auto; }
        .lms-admin-unlock, .lms-remote-login { grid-template-columns:1fr; align-items:stretch; }
        .lms-league-switch { align-items:stretch; flex-direction:column; }
        .lms-form input, .lms-add-player input { min-width:0; width:100%; }
      }
    `;
  }
}

if (!customElements.get("football-hub-panel")) {
  customElements.define("football-hub-panel", FootballHubPanel);
}
