//
//  Initialize card data
//
export function initCardData(c) {
    c.logoBG = [];
    c.logo = [];
    c.name = [];
    c.initials = [];
    c.rank = [];
    c.record = [];
    c.score = [];
    c.scoreOp = [];
    c.scoreSize = "3em";
    c.barLabel = [];
    c.barLength = [];
    c.color = [];
    c.timeouts = [];
    c.possessionOp = [];
    c.winner = [];
}

//
//  Set default values for variable components
//
export function setDefaults(t, lang, stateObj, c, o, sport, team, oppo) {

    // Set default sections to display / hide

    c.initialsDisplay = 'none';
    c.outsDisplay = 'none';
    c.basesDisplay = 'none';
    c.barDisplay = 'inherit';
    c.barWrapDisplay = "flex";
    c.timeoutsDisplay = 'inline';
    c.rankDisplay = 'inline';

    if (o.show_timeouts == false) {
        c.timeoutsDisplay = 'none';
    }
    if (o.show_rank == false) {
        c.rankDisplay = 'none';
    }
    c.onFirstOp = 0.2;
    c.onSecondOp = 0.2;
    c.onThirdOp = 0.2;
    if (stateObj.attributes.on_first) {
        c.onFirstOp = 1;
    }
    if (stateObj.attributes.on_second) {
        c.onSecondOp = 1;
    }
    if (stateObj.attributes.on_third) {
        c.onThirdOp = 1;
    }

    // Set Title data

    c.title = o.cardTitle;
    if (o.showLeague) {
        c.title = c.title || stateObj.attributes.league
    }

    // Set Scoreboard data

    c.logo[team] = stateObj.attributes.team_logo;
    c.logoBG[team] = stateObj.attributes.team_logo;
    c.name[team] = stateObj.attributes.team_name;
    c.rank[team] = stateObj.attributes.team_rank;
    c.record[team] = stateObj.attributes.team_record;
    c.winner[team] = stateObj.attributes.team_winner || false;
    c.logo[oppo] = stateObj.attributes.opponent_logo;
    c.logoBG[oppo] = stateObj.attributes.opponent_logo;
    c.name[oppo] = stateObj.attributes.opponent_name;
    c.rank[oppo] = stateObj.attributes.opponent_rank;
    c.record[oppo] = stateObj.attributes.opponent_record;
    c.winner[oppo] = stateObj.attributes.opponent_winner || false;
    c.playClock = stateObj.attributes.clock;
    if (o.showLeague) {
        c.logoBG[team] = stateObj.attributes.league_logo
        c.logoBG[oppo] = stateObj.attributes.league_logo
    }

    c.score[team] = stateObj.attributes.team_score;
    c.score[oppo] = stateObj.attributes.opponent_score;

    c.scoreOp[1] = .6;
    c.scoreOp[2] = .6;
    if (c.winner[team]) {
        c.scoreOp[team] = 1;
    }
    if (c.winner[oppo]) {
        c.scoreOp[oppo] = 1;
    }

    if (stateObj.attributes.team_homeaway == 'home') {
        c.color[team] = stateObj.attributes.team_colors[0];
        c.color[oppo] = stateObj.attributes.opponent_colors[1];
    }
    else if (stateObj.attributes.team_homeaway == 'away') {
        c.color[team] = stateObj.attributes.team_colors[1];
        c.color[oppo] = stateObj.attributes.opponent_colors[0];
    }
    else {
        c.color[team] = '#ffffff';
        c.color[oppo] = '#000000';
    }

    c.possessionOp[team] = 0;
    c.possessionOp[oppo] = 0;
    if (stateObj.attributes.possession == stateObj.attributes.team_id) {
        c.possessionOp[team] = 1;
    }
    if (stateObj.attributes.possession == stateObj.attributes.opponent_id) {
        c.possessionOp[oppo] = 1;
    }
    c.timeouts[team] = stateObj.attributes.team_timeouts;
    c.timeouts[oppo] = stateObj.attributes.opponent_timeouts;

    // Set Location / Context data

    c.startTerm = t.translate(sport + ".startTerm");
    c.startTime = stateObj.attributes.kickoff_in;
    c.venue = stateObj.attributes.venue;
    c.location = stateObj.attributes.location;

    c.pre1 = stateObj.attributes.odds;
    c.pre2 = '';
    if (stateObj.attributes.overunder) {
        c.pre2 = t.translate(sport + ".overUnder", "%s", String(stateObj.attributes.overunder));
    }
    c.pre3 = stateObj.attributes.tv_network;

    c.in0 = '';
    c.in1 = '';
    if (stateObj.attributes.down_distance_text) {
        c.in1 = t.translate(sport + ".gameStat1", "%s", stateObj.attributes.down_distance_text);
    }
    c.in2 = '';
    if (stateObj.attributes.tv_network) {
        c.in2 = t.translate(sport + ".gameStat2", "%s", stateObj.attributes.tv_network);
    }
    c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST;

    // Set Play data

    c.lastPlay = stateObj.attributes.last_play;
    c.lastPlaySpeed = 18;
    if (c.lastPlay) {
        c.lastPlaySpeed = 18 + Math.floor(c.lastPlay.length / 40) * 5;
    }

    // Set Game Bar data

    c.gameBar = t.translate(sport + ".gameBar");
    c.barLength[team] = 0;
    if (stateObj.attributes.team_win_probability) {
        c.barLength[team] = (stateObj.attributes.team_win_probability * 100).toFixed(0);
    }
    c.barLength[oppo] = 0;
    if (stateObj.attributes.opponent_win_probability) {
        c.barLength[oppo] = (stateObj.attributes.opponent_win_probability * 100).toFixed(0);
    }
    c.barLabel[team] = t.translate(sport + ".teamBarLabel", "%s", String(c.barLength[team]));
    c.barLabel[oppo] = t.translate(sport + ".oppoBarLabel", "%s", String(c.barLength[oppo]));

    // Situation specific data

    c.notFoundLogo = stateObj.attributes.league_logo;
    c.notFoundLogoBG = c.notFoundLogo;
    c.notFoundLeague = null;

    if (stateObj.attributes.league != "XXX") {
        c.notFoundLeague = stateObj.attributes.league;
    }

    c.notFoundTerm1 = stateObj.attributes.team_abbr;
    c.notFoundTerm2 = "NOT_FOUND"
    if (stateObj.attributes.api_message) {
        c.notFoundTerm2 = t.translate("common.api_error")
        var apiTail = stateObj.attributes.api_message.substring(stateObj.attributes.api_message.length - 17)
        if (apiTail.slice(-1) == "Z") {
            var lastDateForm = new Date(apiTail)
            c.notFoundTerm2 = t.translate("common.no_upcoming_games", "%s", lastDateForm.toLocaleDateString(lang))
        }
    }

    c.byeTerm = t.translate("common.byeTerm");

}

export function setCardFormat(o, c) {

    c.clrOut = 0;
    c.outColor = o.outlineColor;

    if (o.outline == true) {
        c.clrOut = 1;
    }
}


export function setStartInfo(c, stateObj, t, lang, time_format) {

    var gameDate = new Date(stateObj.attributes.date);
    var gameDateStr = gameDate.toLocaleDateString(lang, { month: 'short', day: '2-digit' });

    var todayDate = new Date();
    var todayDateStr = todayDate.toLocaleDateString(lang, { month: 'short', day: '2-digit' });

    var tomorrowDate = new Date();
    tomorrowDate.setDate(todayDate.getDate() + 1);
    var tomorrowDateStr = tomorrowDate.toLocaleDateString(lang, { month: 'short', day: '2-digit' });

    var nextweekDate = new Date();
    nextweekDate.setDate(todayDate.getDate() + 6);

    c.gameWeekday = gameDate.toLocaleDateString(lang, { weekday: 'long' });
    if (gameDateStr === todayDateStr) {
        c.gameWeekday = t.translate("common.today");
    }
    else if (gameDateStr === tomorrowDateStr) {
        c.gameWeekday = t.translate("common.tomorrow");
    }
    c.gameDatePOST = gameDateStr;
    c.gameDatePRE = null;
    if (gameDate > nextweekDate) {
        c.gameDatePRE = gameDateStr;
    }

    c.gameTime = gameDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    if (time_format == "24") {
        c.gameTime = gameDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    if (time_format == "12") {
        c.gameTime = gameDate.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (time_format == "system") {
        var sys_lang = navigator.language || "en"
        c.gameTime = gameDate.toLocaleTimeString(sys_lang, { hour: '2-digit', minute: '2-digit' });
    }
}