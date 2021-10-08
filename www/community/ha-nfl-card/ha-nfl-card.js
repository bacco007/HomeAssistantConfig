import { html, LitElement } from "https://unpkg.com/lit?module";

class NFLCard extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];
    const teamProb = (stateObj.attributes.team_win_probability * 100).toFixed(0);
    const oppoProb = (stateObj.attributes.opponent_win_probability * 100).toFixed(0);
    var dateForm = new Date (stateObj.attributes.date);
    var gameDate = dateForm.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' });
    if (stateObj.attributes.possession == stateObj.attributes.team_id) {
      var teamPoss = 1;
    }
    if (stateObj.attributes.possession == stateObj.attributes.opponent_id) {
      var oppoPoss = 1;
    }

    if (!stateObj) {
      return html` <ha-card>Unknown entity: ${this._config.entity}</ha-card> `;
    }

    if (stateObj.state == 'POST') {
      return html`
        <style>
          .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; }
          .team-bg { opacity: 0.08; position: absolute; top: -30%; left: -20%; width: 58%; z-index: 0; }
          .opponent-bg { opacity: 0.08; position: absolute; top: -30%; right: -20%; width: 58%; z-index: 0; }
          .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 99; }
          .team { text-align: center; }
          .team img { max-width: 90px; }
          .possession, .teamposs, .oppoposs { font-size: 2.5em; text-align: center; opacity: 0; font-weight:900; }
          .teamposs {opacity: ${teamPoss} !important; }
          .oppoposs {opacity: ${oppoPoss} !important; }
          .score { font-size: 3em; text-align: center; }
          .divider { font-size: 2.5em; text-align: center; }
          .name { font-size: 1.6em; margin-bottom: 4px; }
          .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
          .timeouts { margin: 0 auto; width: 70%; }
          .timeouts div.opponent-to:nth-child(-n + 0)  { opacity: 1; }
          .timeouts div.team-to:nth-child(-n + 0)  { opacity: 1; }
          .team-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.team_colors[0]}; display: inline-block; position: relative; opacity: 0.2; }
          .opponent-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.opponent_colors[0]}; display: inline-block; position: relative; opacity: 0.2; }
          .play-clock { font-size: 1.4em; text-align: center; margin-top: -24px; }
        </style>
        <ha-card>
          <div class="card">
            <img class="team-bg" src="${stateObj.attributes.team_logo}" />
            <img class="opponent-bg" src="${stateObj.attributes.opponent_logo}" />
            <div class="card-content">
              <div class="team">
                <img src="${stateObj.attributes.team_logo}" />
                <div class="name">${stateObj.attributes.team_name}</div>
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
                <div class="name">${stateObj.attributes.opponent_name}</div>
                <div class="record">${stateObj.attributes.opponent_record}</div>
                <div class="timeouts">
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                </div>
              </div>
            </div>
            <div class="play-clock">FINAL</div>
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
            .team { text-align: center;  }
            .team img { max-width: 90px; }
            .possession, .teamposs, .oppoposs { font-size: 2.5em; text-align: center; opacity: 0; font-weight:900; }
            .teamposs {opacity: ${teamPoss} !important; }
            .oppoposs {opacity: ${oppoPoss} !important; }
            .score { font-size: 3em; text-align: center; }
            .divider { font-size: 2.5em; text-align: center; }
            .name { font-size: 1.6em; margin-bottom: 4px; }
            .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
            .timeouts { margin: 0 auto; width: 70%; }
            .timeouts div.opponent-to:nth-child(-n + ${stateObj.attributes.opponent_timeouts})  { opacity: 1; }
            .timeouts div.team-to:nth-child(-n + ${stateObj.attributes.team_timeouts})  { opacity: 1; }
            .team-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.team_colors[0]}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .opponent-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.opponent_colors[0]}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .status { text-align:center; font-size:1.6em; font-weight: 700; }
            .sub1 { font-weight: 700; font-size: 1.2em; margin: 6px 0 2px; }
            .sub1, .sub2, .sub3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
            .last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
            .last-play p { display: inline-block; padding-left: 100%; margin: 2px 0 12px; animation : slide 18s linear infinite; }
            @keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            .clock { text-align: center; font-size: 1.4em; }
            .down-distance { text-align: right; }
            .play-clock { font-size: 1.4em; text-align: center; margin-top: -24px; }
            .probability-text { text-align: center; }
            .prob-flex { flex: 1; }
            .opponent-probability { width: ${oppoProb}%; background-color: ${stateObj.attributes.opponent_colors[0]}; height: 14px; border-radius: 0 7px 7px 0; transition: all 1s ease-out; }
            .team-probability { width: ${teamProb}%; background-color: ${stateObj.attributes.team_colors[0]}; height: 14px; border-radius: 7px 0 0 7px; float: right; position: relative; transition: all 1s ease-out; }
            .probability-wrapper { display: flex; }
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
                <div class="name">${stateObj.attributes.team_name}</div>
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
                <div class="name">${stateObj.attributes.opponent_name}</div>
                <div class="record">${stateObj.attributes.opponent_record}</div>
                <div class="timeouts">
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                  <div class="opponent-to"></div>
                </div>
              </div>
            </div>
            <div class="play-clock">Q${stateObj.attributes.quarter} - ${stateObj.attributes.clock}</div>
            <div class="line"></div>
            <div class="sub2">
              <div class="venue">${stateObj.attributes.venue}</div>
             <div class="down-distance">${stateObj.attributes.down_distance_text}</div>
            </div>
            <div class="sub3">
              <div class="location">${stateObj.attributes.location}</div>
              <div class="network">${stateObj.attributes.tv_network}</div>
            </div>
            <div class="line"></div>
            <div class="last-play">
              <p>${stateObj.attributes.last_play}</p>
            </div>
            <div class="probability-text">Win Probability</div>
            <div class="probability-wrapper">
              <div class="percent">${teamProb}%</div>
              <div class="prob-flex"><div class="team-probability"></div></div>
              <div class="prob-flex"><div class="opponent-probability"></div></div>
              <div class="oppo-percent">${oppoProb}%</div>
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
            .team { text-align: center; }
            .team img { max-width: 90px; }
            .possession, .teamposs, .oppoposs { font-size: 2.5em; text-align: center; opacity: 0; font-weight:900; }
            .teamposs {opacity: ${teamPoss} !important; }
            .oppoposs {opacity: ${oppoPoss} !important; }
            .score { font-size: 3em; text-align: center; }
            .divider { font-size: 2.5em; text-align: center; }
            .name { font-size: 1.6em; margin-bottom: 4px; }
            .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
            .timeouts { margin: 0 auto; width: 70%; }
            .timeouts div.opponent-to:nth-child(-n + ${stateObj.attributes.opponent_timeouts})  { opacity: 1; }
            .timeouts div.team-to:nth-child(-n + ${stateObj.attributes.team_timeouts})  { opacity: 1; }
            .team-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.team_colors[0]}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .opponent-to { height: 6px; border-radius: 3px; width: 20%; background-color: ${stateObj.attributes.opponent_colors[0]}; display: inline-block; margin: 0 auto; position: relative; opacity: 0.2; }
            .status { text-align:center; font-size:1.6em; font-weight: 700; }
            .sub1 { font-weight: 500; font-size: 1.2em; margin: 6px 0 2px; }
            .sub1, .sub2, .sub3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
            .last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
            .last-play p { display: inline-block; padding-left: 100%; margin: 2px 0 12px; animation : slide 10s linear infinite; }
            @keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
            .clock { text-align: center; font-size: 1.4em; }
            .down-distance { text-align: right; font-weight: 700; }
            .play-clock { text-align: center; margin-top: -24px; }
            .probability-text { text-align: center; }
            .prob-flex { flex: 1; }
            .opponent-probability { width: ${oppoProb}%; background-color: ${stateObj.attributes.opponent_colors[0]}; height: 14px; border-radius: 0 7px 7px 0; }
            .team-probability { width: ${teamProb}%; background-color: ${stateObj.attributes.team_colors[0]}; height: 14px; border-radius: 7px 0 0 7px; float: right; position: relative; }
            .probability-wrapper { display: flex; }
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
                  <div class="name">${stateObj.attributes.team_name}</div>
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
                  <div class="name">${stateObj.attributes.opponent_name}</div>
                  <div class="record">${stateObj.attributes.opponent_record}</div>
                  <div class="timeouts">
                    <div class="opponent-to"></div>
                    <div class="opponent-to"></div>
                    <div class="opponent-to"></div>
                  </div>
                </div>
              </div>
              <div class="play-clock">Kickoff ${stateObj.attributes.kickoff_in}</div>
              <div class="line"></div>
              <div class="sub1">
                <div class="date">${gameDate}</div>
                <div class="odds">${stateObj.attributes.odds}</div>
              </div>
              <div class="sub2">
                <div class="venue">${stateObj.attributes.venue}</div>
                <div class="overunder"> O/U: ${stateObj.attributes.overunder}</div>
              </div>
              <div class="sub3">
                <div class="location">${stateObj.attributes.location}</div>
                <div class="network">${stateObj.attributes.tv_network}</div>
              </div>
            </div>
            </ha-card>
        `;
    }
  }
}

customElements.define("nfl-card", NFLCard);
