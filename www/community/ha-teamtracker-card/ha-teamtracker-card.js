import { html, LitElement } from "https://unpkg.com/lit?module";
import { Translator } from "./localize/translator.js";

class TeamTrackerCard extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    this._config = config;
  }
  getCardSize() {
    return 5;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];
    const outline = this._config.outline;
    const outlineColor = this._config.outline_color;
    var teamProb = (stateObj.attributes.team_win_probability * 100).toFixed(0);
    var oppoProb = (stateObj.attributes.opponent_win_probability * 100).toFixed(0);
    var tScr = stateObj.attributes.team_score;
    var oScr = stateObj.attributes.opponent_score;

    var lang = this.hass.selectedLanguage || this.hass.language  || navigator.language || "en"
    var t = new Translator(lang);

    var dateForm = new Date (stateObj.attributes.date);
    var gameDay = dateForm.toLocaleDateString(lang, { weekday: 'long' });
    var gameTime = dateForm.toLocaleTimeString(lang, { hour: '2-digit', minute:'2-digit' });
    var gameMonth = dateForm.toLocaleDateString(lang, { month: 'short' });
    var gameDate = dateForm.toLocaleDateString(lang, { day: '2-digit' });
    var outColor = outlineColor;
    
    var sport = stateObj.attributes.sport;
    if (!(["baseball", "basketball","football","hockey", "soccer","volleyball"].includes(sport))) {
      sport = "default"
    }

    if (outline == true) {
      var clrOut = 1;
      var toRadius = 4;
      var probRadius = 7;
    }
    if (!this._config.outline || outline == false){
      var clrOut = 0;
      var toRadius = 3;
      var probRadius = 6;
    }
    if (!this._config.outline_color) {
      var outColor = '#ffffff';
    }

    if (Boolean(stateObj.state == 'POST') && Number(tScr) > Number(oScr)) {
        var oppoScore = 0.6;
        var teamScore = 1;
    }
    if (Boolean(stateObj.state == 'POST') && Number(tScr) < Number(oScr)) {
        var oppoScore = 1;
        var teamScore = 0.6;
    }
    if (Boolean(stateObj.state == 'POST') && Number(tScr) == Number(oScr)) {
        var oppoScore = 1;
        var teamScore = 1;
    }

    if (stateObj.attributes.team_homeaway == 'home') {
      var teamColor = stateObj.attributes.team_colors[0];
      var oppoColor = stateObj.attributes.opponent_colors[1];
    }
    if (stateObj.attributes.team_homeaway == 'away') {
      var teamColor = stateObj.attributes.team_colors[1];
      var oppoColor = stateObj.attributes.opponent_colors[0];
    }

    if (stateObj.attributes.possession == stateObj.attributes.team_id) {
      var teamPoss = 1;
      var basesColor = teamColor;
    }
    if (stateObj.attributes.possession == stateObj.attributes.opponent_id) {
      var oppoPoss = 1;
      var basesColor = oppoColor
    }

    if (!stateObj) {
      return html` <ha-card>Unknown entity: ${this._config.entity}</ha-card> `;
    }
    if (stateObj.state == 'unavailable') {
      return html`
        <style>
          ha-card {padding: 10px 16px;}
        </style>
        <ha-card>
          Sensor unavailable: ${this._config.entity}
        </ha-card> 
      `;
    }
//
//  Set default values for variable components
//

    var byeTerm = t.translate("common.byeTerm");
    var finalTerm = t.translate("common.finalTerm", "%s", gameMonth + " " + gameDate);
    var startTerm = t.translate(sport + ".startTerm");

    var overUnder = '';
    if (stateObj.attributes.overunder) {
      overUnder = t.translate(sport + ".overUnder", "%s", stateObj.attributes.overunder);
    }
    var gameStat1 = '';
    if (stateObj.attributes.down_distance_text) {
        gameStat1 = t.translate(sport + ".gameStat1", "%s", stateObj.attributes.down_distance_text);
    }
    var gameStat2 = '';
    if (stateObj.attributes.tv_network) {
        gameStat2 = t.translate(sport + ".gameStat2", "%s", stateObj.attributes.tv_network);
    }
    var gameStat3 = '';

    var gameBar = t.translate(sport + ".gameBar");
    var teamBarLabel = t.translate(sport + ".teamBarLabel", "%s", teamProb);
    var oppoBarLabel = t.translate(sport + ".oppoBarLabel", "%s", oppoProb);

    var lastPlay = stateObj.attributes.last_play;
    var lastPlaySpeed = 18;
    if (lastPlay) {
      lastPlaySpeed = 18 + Math.floor(lastPlay.length/40) * 5;
    }
    var notFoundTeamBG = stateObj.attributes.league_logo;
    var notFoundTeam = stateObj.attributes.league_logo;
    var playClock = stateObj.attributes.clock;
    var outsDisplay = 'none';
    var basesDisplay = 'none';
    var teamTimeouts = stateObj.attributes.team_timeouts;
    var oppoTimeouts = stateObj.attributes.opponent_timeouts;

    var timeoutsDisplay = 'inline';
    if (this._config.show_timeouts == false) {
      timeoutsDisplay = 'none';
    }

    var rankDisplay = 'inline';
    if (this._config.show_rank == false) {
      rankDisplay = 'none';
    }

    var notFoundTerm1 = stateObj.attributes.league + ": " + stateObj.attributes.team_abbr;
    var notFoundTerm2 = ""
    if (stateObj.attributes.api_message) {
        notFoundTerm2 = t.translate("common.api_error")
        var apiTail = stateObj.attributes.api_message.substring(stateObj.attributes.api_message.length - 17)
        if (apiTail.slice(-1) == "Z") {
          var lastDateForm = new Date (apiTail)
          notFoundTerm2 = t.translate("common.no_upcoming_games", "%s", lastDateForm.toLocaleDateString(lang))
        }
    }

//
//  MLB Specific Changes
//
    if (stateObj.attributes.on_first) {
      var onFirstOp = 1;
    }
    else {
      var onFirstOp = 0.2;
    }
    if (stateObj.attributes.on_second) {
      var onSecondOp = 1;
    }
    else {
      var onSecondOp = 0.2;
    }
    if (stateObj.attributes.on_third) {
      var onThirdOp = 1;
    }
    else {
      var onThirdOp = 0.2;
    }
    if (sport.includes("baseball")) {
      gameStat1 = t.translate("baseball.gameStat1", "%s", stateObj.attributes.balls);
      gameStat2 = t.translate("baseball.gameStat2", "%s", stateObj.attributes.strikes);
      gameStat3 = t.translate("baseball.gameStat3", "%s", stateObj.attributes.outs);
      outsDisplay = 'inherit';
      timeoutsDisplay = 'none';
      basesDisplay = 'inherit';
    }

//
//  Soccer Specific Changes
//
    if (sport.includes("soccer")) {
      teamProb = stateObj.attributes.team_total_shots;
      oppoProb = stateObj.attributes.opponent_total_shots;
      teamBarLabel = stateObj.attributes.team_total_shots +'(' + stateObj.attributes.team_shots_on_target + ')';
      teamBarLabel = t.translate("soccer.teamBarLabel", "%s", stateObj.attributes.team_total_shots +'(' + stateObj.attributes.team_shots_on_target + ')');
      oppoBarLabel = t.translate("soccer.oppoBarLabel", "%s", stateObj.attributes.opponent_total_shots +'(' + stateObj.attributes.opponent_shots_on_target + ')');
      timeoutsDisplay = 'none';
    }

//
//  Volleyball Specific Changes
//
    if (sport.includes("volleyball")) {
      gameBar = t.translate("volleyball.gameBar", "%s", stateObj.attributes.clock);
      teamProb = stateObj.attributes.team_score;
      oppoProb = stateObj.attributes.opponent_score;
      teamBarLabel = t.translate("volleyball.teamBarLabel", "%s", stateObj.attributes.team_score);
      oppoBarLabel = t.translate("volleyball.oppoBarLabel", "%s", stateObj.attributes.opponent_score);
      teamTimeouts = stateObj.attributes.team_sets_won;
      oppoTimeouts = stateObj.attributes.opponent_sets_won;
      timeoutsDisplay = 'inline';
    }

//
//  Basketball Specific Changes
//
    if (sport.includes("basketball")) {
//      insert basketball specific changes here
    }

//
//  Hockey Specific Changes
//
    if (sport.includes("hockey")) {
      teamProb = stateObj.attributes.team_shots_on_target;
      oppoProb = stateObj.attributes.opponent_shots_on_target;
      teamBarLabel = t.translate("hockey.teamBarLabel", "%s", stateObj.attributes.team_shots_on_target);
      oppoBarLabel = t.translate("hockey.oppoBarLabel", "%s", stateObj.attributes.opponent_shots_on_target);

      timeoutsDisplay = 'none';
    }

//
//  NCAA Specific Changes
//
    if (stateObj.attributes.league.includes("NCAA")) {
      notFoundTeam = 'https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png'
    }
    
    if (stateObj.state == 'POST') {
      return html`
        <style>
          .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; }
          .team-bg { opacity: 0.08; position: absolute; top: -30%; left: -20%; width: 58%; z-index: 0; }
          .opponent-bg { opacity: 0.08; position: absolute; top: -30%; right: -20%; width: 58%; z-index: 0; }
          .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
          .team { text-align: center; width: 35%;}
          .team img { max-width: 90px; }
          .score { font-size: 3em; text-align: center; }
          .teamscr { opacity: ${teamScore}; }
          .opposcr { opacity: ${oppoScore}; }
          .divider { font-size: 2.5em; text-align: center; opacity: 0; }
          .name { font-size: 1.4em; margin-bottom: 4px; }
          .rank { font-size:0.8em; display: ${rankDisplay}; }
          .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
          .status { font-size: 1.2em; text-align: center; margin-top: -21px; }
        </style>
        <ha-card>
          <div class="card">
            <img class="team-bg" src="${stateObj.attributes.team_logo}" />
            <img class="opponent-bg" src="${stateObj.attributes.opponent_logo}" />
            <div class="card-content">
              <div class="team">
                <img src="${stateObj.attributes.team_logo}" />
                <div class="name"><span class="rank">${stateObj.attributes.team_rank}</span> ${stateObj.attributes.team_name}</div>
                <div class="record">${stateObj.attributes.team_record}</div>
              </div>
              <div class="score teamscr">${tScr}</div>
              <div class="divider">-</div>
              <div class="score opposcr">${oScr}</div>
              <div class="team">
                <img src="${stateObj.attributes.opponent_logo}" />
                <div class="name"><span class="rank">${stateObj.attributes.opponent_rank}</span> ${stateObj.attributes.opponent_name}</div>
                <div class="record">${stateObj.attributes.opponent_record}</div>
              </div>
            </div>
            <div class="status">${finalTerm}</div>
          </div>
        </ha-card>
      `;
    }

    if (stateObj.state == 'IN') {
        return html`
          <style>
            .card { position: relative; overflow: hidden; padding: 0 16px 20px; font-weight: 400; }
            .team-bg { opacity: 0.08; position:absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
            .opponent-bg { opacity: 0.08; position:absolute; top: -20%; right: -20%; width: 58%; z-index: 0; }
            .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
            .team { text-align: center; width:35%; }
            .team img { max-width: 90px; }
            .possession, .teamposs, .oppoposs { font-size: 2.5em; text-align: center; opacity: 0; font-weight:900; }
            .teamposs {opacity: ${teamPoss} !important; }
            .oppoposs {opacity: ${oppoPoss} !important; }
            .score { font-size: 3em; text-align: center; }
            .divider { font-size: 2.5em; text-align: center; margin: 0 4px; }
            .name { font-size: 1.4em; margin-bottom: 4px; }
            .rank { font-size:0.8em; display: ${rankDisplay}; }
            .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
            .timeouts { margin: 0 auto; width: 70%; display: ${timeoutsDisplay}; }
            .timeouts div.opponent-to:nth-child(-n + ${oppoTimeouts})  { opacity: 1; }
            .timeouts div.team-to:nth-child(-n + ${teamTimeouts})  { opacity: 1; }
            .team-to { height: 6px; border-radius: ${toRadius}px; border: ${clrOut}px solid ${outColor}; width: 20%; background-color: ${teamColor}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .bases { font-size: 2.5em; text-align: center; font-weight:900; display: ${basesDisplay};}
            .on-first { opacity: ${onFirstOp}; display: inline-block; }
            .on-second { opacity: ${onSecondOp}; display: inline-block; }
            .on-third { opacity: ${onThirdOp}; display: inline-block; }
            .pitcher { opacity: 0.0; display: inline-block; }
            .opponent-to { height: 6px; border-radius: ${toRadius}px; border: ${clrOut}px solid ${outColor}; width: 20%; background-color: ${oppoColor}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .status { text-align:center; font-size:1.6em; font-weight: 700; }
            .sub1 { font-weight: 700; font-size: 1.2em; margin: 6px 0 2px; }
            .sub1, .sub2, .sub3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
            .last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
            .last-play p { display: inline-block; padding-left: 100%; margin: 2px 0 12px; animation : slide ${lastPlaySpeed}s linear infinite; }
            @keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            .clock { text-align: center; font-size: 1.4em; }
            .down-distance { text-align: right; }
            .play-clock { font-size: 1.4em; text-align: center; margin-top: -24px; }
            .outs { text-align: center; display: ${outsDisplay}; }
            .probability-text { text-align: center; }
            .prob-flex { width: 100%; display: flex; justify-content: center; margin-top: 4px; }
            .opponent-probability { width: ${oppoProb}%; background-color: ${oppoColor}; height: 12px; border-radius: 0 ${probRadius}px ${probRadius}px 0; border: ${clrOut}px solid ${outColor}; border-left: 0; transition: all 1s ease-out; }
            .team-probability { width: ${teamProb}%; background-color: ${teamColor}; height: 12px; border-radius: ${probRadius}px 0 0 ${probRadius}px; border: ${clrOut}px solid ${outColor}; border-right: 0; transition: all 1s ease-out; }
            .probability-wrapper { display: flex; }
            .team-percent { flex: 0 0 10px; padding: 0 10px 0 0; }
            .oppo-percent { flex: 0 0 10px; padding: 0 0 0 10px; text-align: right; }
            .percent { padding: 0 6px; }
            .post-game { margin: 0 auto; }
          </style>
          <ha-card>
            <div class="card">
            <img class="team-bg" src="${stateObj.attributes.team_logo}" />
            <img class="opponent-bg" src="${stateObj.attributes.opponent_logo}" />
            <div class="card-content">
              <div class="team">
                <img src="${stateObj.attributes.team_logo}" />
                <div class="name"><span class="rank">${stateObj.attributes.team_rank}</span> ${stateObj.attributes.team_name}</div>
                <div class="record">${stateObj.attributes.team_record}</div>
                <div class="timeouts">
                  <div class="team-to"></div>
                  <div class="team-to"></div>
                  <div class="team-to"></div>
                </div>
              </div>
              <div class="teamposs">&bull;</div>
              <div class="score">${stateObj.attributes.team_score}</div>
              <div class="divider">-</div>
              <div class="score">${stateObj.attributes.opponent_score}</div>
              <div class="oppoposs">&bull;</div>
              <div class="team">
                <img src="${stateObj.attributes.opponent_logo}" />
                <div class="name"><span class="rank">${stateObj.attributes.opponent_rank}</span> ${stateObj.attributes.opponent_name}</div>
                <div class="record">${stateObj.attributes.opponent_record}</div>
                <div class="timeouts">
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                </div>
              </div>
            </div>
            <div class="play-clock">${playClock}</div>
            <div class="bases">
              <div class="on-second">&bull;</div>
            </div>
            <div class="bases">
              <div class="on-third">&bull;</div>
              <div class="pitcher"></div>
              <div class="on-first">&bull;</div>
            </div>
            <div class="outs">${gameStat3}</div>
            <div class="line"></div>
            <div class="sub2">
              <div class="venue">${stateObj.attributes.venue}</div>
              <div class="down-distance">${gameStat1}</div>
            </div>
            <div class="sub3">
              <div class="location">${stateObj.attributes.location}</div>
              <div class="network">${gameStat2}</div>
            </div>
            <div class="line"></div>
            <div class="last-play">
              <p>${lastPlay}</p>
            </div>
            <div class="probability-text">${gameBar}</div>
            <div class="probability-wrapper">
              <div class="team-percent">${teamBarLabel}</div>
              <div class="prob-flex">
                <div class="team-probability"></div>
                <div class="opponent-probability"></div>
              </div>
              <div class="oppo-percent">${oppoBarLabel}</div>
            </div>
          </div>
          </ha-card>
        `;
    }

    if (stateObj.state == 'PRE') {
        return html`
          <style>
            .card { position: relative; overflow: hidden; padding: 0 16px 20px; font-weight: 400; }
            .team-bg { opacity: 0.08; position:absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
            .opponent-bg { opacity: 0.08; position:absolute; top: -20%; right: -20%; width: 58%; z-index: 0; }
            .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
            .team { text-align: center; width: 35%; }
            .team img { max-width: 90px; }
            .name { font-size: 1.4em; margin-bottom: 4px; }
            .rank { font-size:0.8em; display:${rankDisplay}; }
            .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
            .gameday { font-size: 1.4em; margin-bottom: 4px; }
            .gametime { font-size: 1.1em; }
            .sub1 { font-weight: 500; font-size: 1.2em; margin: 6px 0 2px; }
            .sub1, .sub2, .sub3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
            .last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
            .last-play p { display: inline-block; padding-left: 100%; margin: 2px 0 12px; animation : slide 10s linear infinite; }
            @keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            .clock { text-align: center; font-size: 1.4em; }
            .down-distance { text-align: right; font-weight: 700; }
            .kickoff { text-align: center; margin-top: -24px; }
          </style>
          <ha-card>
              <div class="card">
              <img class="team-bg" src="${stateObj.attributes.team_logo}" />
              <img class="opponent-bg" src="${stateObj.attributes.opponent_logo}" />
              <div class="card-content">
                <div class="team">
                  <img src="${stateObj.attributes.team_logo}" />
                  <div class="name"><span class="rank">${stateObj.attributes.team_rank}</span> ${stateObj.attributes.team_name}</div>
                  <div class="record">${stateObj.attributes.team_record}</div>
                </div>
                <div class="gamewrapper">
                  <div class="gameday">${gameDay}</div>
                  <div class="gametime">${gameTime}</div>
                </div>
                <div class="team">
                  <img src="${stateObj.attributes.opponent_logo}" />
                  <div class="name"><span class="rank">${stateObj.attributes.opponent_rank}</span> ${stateObj.attributes.opponent_name}</div>
                  <div class="record">${stateObj.attributes.opponent_record}</div>
                </div>
              </div>
              <div class="line"></div>
              <div class="sub1">
                <div class="date">${startTerm} ${stateObj.attributes.kickoff_in}</div>
                <div class="odds">${stateObj.attributes.odds}</div>
              </div>
              <div class="sub2">
                <div class="venue">${stateObj.attributes.venue}</div>
                <div class="overunder"> ${overUnder}</div>
              </div>
              <div class="sub3">
                <div class="location">${stateObj.attributes.location}</div>
                <div class="network">${stateObj.attributes.tv_network}</div>
              </div>
            </div>
            </ha-card>
        `;
    }

    if (stateObj.state == 'BYE') {
      return html`
        <style>
          .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; }
          .team-bg { opacity: 0.08; position: absolute; top: -20%; left: -30%; width: 75%; z-index: 0; }
          .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
          .team { text-align: center; width: 50%; }
          .team img { max-width: 90px; }
          .name { font-size: 1.6em; margin-bottom: 4px; }
          .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
          .bye { font-size: 1.8em; text-align: center; width: 50%; }
        </style>
        <ha-card>
          <div class="card">
            <img class="team-bg" src="${stateObj.attributes.team_logo}" />
            <div class="card-content">
              <div class="team">
                <img src="${stateObj.attributes.team_logo}" />
                <div class="name">${stateObj.attributes.team_name}</div>
              </div>
              <div class="bye">${byeTerm}</div>
            </div>
          </div>
        </ha-card>
      `;
    }

    if (stateObj.state == 'NOT_FOUND') {
      return html`
        <style>
          .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; }
          .team-bg { opacity: 0.08; position: absolute; top: -50%; left: -30%; width: 75%; z-index: 0; }
          .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
          .team { text-align: center; width: 50%; }
          .team img { max-width: 90px; }
          .name { font-size: 1.6em; margin-bottom: 4px; }
          .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
          .eos { font-size: 1.8em; line-height: 1.2em; text-align: center; width: 50%; }
          .eos2 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 50%; display: inline; }
        </style>
        <ha-card>
          <div class="card">
            <img class="team-bg" src="${notFoundTeamBG}" />
            <div class="card-content">
              <div class="team">
                <img src="${notFoundTeam}" />
              </div>
              <div><span class="eos">${notFoundTerm1}</span><span class="eos2"><br /><br />${notFoundTerm2}</span></div>
          </div>
        </ha-card>
      `;
    }
  }
}

customElements.define("teamtracker-card", TeamTrackerCard);
