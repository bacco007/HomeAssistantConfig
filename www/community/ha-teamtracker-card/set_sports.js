//
//  Call function to set the data for the sport
//
export function setSportData(sport, t, stateObj, c, team, oppo) {

    switch (sport) {
        case "baseball":
            return setBaseball(t, stateObj, c, team, oppo);
        case "basketball":
            return setBasketball(t, stateObj, c, team, oppo);
        case "cricket":
            return setCricket(t, stateObj, c, team, oppo);
        case "golf":
            return setGolf(t, stateObj, c, team, oppo);
        case "hockey":
            return setHockey(t, stateObj, c, team, oppo);
        case "mma":
            return setMMA(t, stateObj, c, team, oppo);
        case "racing":
            return setRacing(t, stateObj, c, team, oppo);
        case "soccer":
            return setSoccer(t, stateObj, c, team, oppo);
        case "tennis":
            return setTennis(t, stateObj, c, team, oppo);
        case "volleyball":
            return setVolleyball(t, stateObj, c, team, oppo);
        default:
            return;
    }
}

//
//  setBaseball()
//    in1 = balls
//    in2 = strikes
//    in0 = outs
//    outsDisplay = 'inherit';
//    timeoutsDisplay = 'none';
//    basesDisplay = 'inherit';
//
export function setBaseball(t, stateObj, c, team, oppo) {
    c.in1 = t.translate("baseball.gameStat1", "%s", String(stateObj.attributes.balls));
    c.in2 = t.translate("baseball.gameStat2", "%s", String(stateObj.attributes.strikes));
    c.in0 = t.translate("baseball.gameStat3", "%s", String(stateObj.attributes.outs));
    c.outsDisplay = 'inherit';
    c.timeoutsDisplay = 'none';
    c.basesDisplay = 'inherit';
}


//
//  setBasketball()
//    timeoutsDisplay = 'none';
//    barDisplay = "none";
//    barWrapDisplay = "none";
//
export function setBasketball(t, stateObj, c, team, oppo) {
    c.timeoutsDisplay = 'none';
    c.barDisplay = 'none';
    c.barWrapDisplay = "none";
}


//
//  SetCricket()
//    timeoutsDisplay = 'none';
//    barDisplay = "none";
//    barWrapDisplay = "none";
//    in1 = odds;
//    in2 = quarter;
//    score = split score into 2 parts
//    record = set to second part of split score

export function setCricket(t, stateObj, c, team, oppo) {
    var subscores = [];

    c.timeoutsDisplay = 'none';
    c.barDisplay = "none";
    c.barWrapDisplay = "none";  

    c.in1 = stateObj.attributes.odds;
    c.in2 = stateObj.attributes.quarter;

    if (c.score != []) {
        if (c.score[1] || c.score[2]) {
            subscores[1] = c.score[1].split("(");
            subscores[2] = c.score[2].split("(");

            c.score[1] = subscores[1][0];
            c.score[2] = subscores[2][0];

            if (subscores[1].length > 1) {
                c.record[1] = "(" + subscores[1][1];
            }
            if (subscores[2].length > 1) {
                c.record[2] = "(" + subscores[2][1];
            }
        }
    }
}


//
//  setGolf()
//   title = use event_name if title is not set
//   venue = event_name
//   barLength = team_shots_on_target, opponent_shots_on_target
//   barLabel = team_total_shots, opponent_total_shots
//   finalTerm = clock
//   timeoutsDisplay = 'none';
//
export function setGolf(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    c.venue = stateObj.attributes.event_name;
    c.barLength[team] = stateObj.attributes.team_shots_on_target;
    c.barLength[oppo] = stateObj.attributes.opponent_shots_on_target;
    c.barLabel[team] = t.translate("golf.teamBarLabel", "%s", stateObj.attributes.team_total_shots +'(' + stateObj.attributes.team_shots_on_target + ')');
    c.barLabel[oppo] = t.translate("golf.oppoBarLabel", "%s", stateObj.attributes.opponent_total_shots +'(' + stateObj.attributes.opponent_shots_on_target + ')');
    c.finalTerm = stateObj.attributes.clock;
    c.timeoutsDisplay = 'none';

}

//
//  setHockey()
//    barLength = team_shots_on_target, opponent_shots_on_target
//    barLabel = "Shots on Target"
//    timeoutsDisplay = 'none';
//
export function setHockey(t, stateObj, c, team, oppo) {
    c.barLength[team] = stateObj.attributes.team_shots_on_target;
    c.barLength[oppo] = stateObj.attributes.opponent_shots_on_target;
    c.barLabel[team] = t.translate("hockey.teamBarLabel", "%s", String(stateObj.attributes.team_shots_on_target));
    c.barLabel[oppo] = t.translate("hockey.oppoBarLabel", "%s", String(stateObj.attributes.opponent_shots_on_target));

    c.timeoutsDisplay = 'none';
}


//
//  setMMA()
//    title = use event_name if title is not set
//    timeoutsDisplay = 'none';
//    barDisplay = "none";
//    barWrapDisplay = "none";
//
export function setMMA(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    c.timeoutsDisplay = 'none';
    c.barDisplay = "none";
    c.barWrapDisplay = "none";
}


//
//  setRacing()
//    title = use event_name if title is not set
//    pre1 = quarter (race type)
//    in1 = quarter (race type)
//    finalTerm = adjust for type of race (race, qualifying, etc.)
//    timeoutsDisplay = 'none';
//    barLength = team_total_shots, opponent_total_shots (laps)
//    barLabel = (laps)
//    If NASCAR, remove logos and use initials
//
export function setRacing(t, stateObj, c, team, oppo) {
    c.title = c.title || stateObj.attributes.event_name;
    if (stateObj.attributes.quarter) {
        c.pre1 = stateObj.attributes.quarter;
        c.in1 = stateObj.attributes.quarter;
        c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST  + " (" + stateObj.attributes.quarter + ")";
    }
    c.timeoutsDisplay = 'none';

    c.barLength[team] = stateObj.attributes.team_total_shots;
    c.barLength[oppo] = stateObj.attributes.team_total_shots;
    c.barLabel[team] = t.translate("racing.teamBarLabel", "%s", String(stateObj.attributes.team_total_shots));
    c.barLabel[oppo] = t.translate("racing.teamBarLabel", "%s", String(stateObj.attributes.team_total_shots));

    if (stateObj.attributes.league.includes("NASCAR")) {
        c.logo[team] = null;
        c.logo[oppo] = null;
        c.initials[team] = "";
        c.initials[oppo] = "";
        if (c.name[team] && c.name[oppo]) {
            c.initials[team] = c.name[team].split(" ").map((n)=>n[0]).join("");
            c.initials[oppo] = c.name[oppo].split(" ").map((n)=>n[0]).join("");
            c.initialsDisplay = 'inline';
        }
    }
}

//
//  setSoccer()
//    barLength = team_total_shots, opponent_total_shots
//    barLabel = "Shots on Target"
//    timeoutsDisplay = 'none';
//
export function setSoccer(t, stateObj, c, team, oppo) {
    c.barLength[team] = stateObj.attributes.team_total_shots;
    c.barLength[oppo] = stateObj.attributes.opponent_total_shots;
    c.barLabel[team] = t.translate("soccer.teamBarLabel", "%s", stateObj.attributes.team_total_shots +'(' + stateObj.attributes.team_shots_on_target + ')');
    c.barLabel[oppo] = t.translate("soccer.oppoBarLabel", "%s", stateObj.attributes.opponent_total_shots +'(' + stateObj.attributes.opponent_shots_on_target + ')');
    c.timeoutsDisplay = 'none';
}

//
//  setTennis()
//    venue = event_name
//    pre1 = odds
//    in1 = odds
//    finalTerm = adjust for round (odds)
//    gameBar = clock
//    barLength = team_score, opponent_score
//    barLabel = "score"
//    timeouts = sets won
//    title = use event_name if title is not set
//    timeoutsDisplay = 'inline';
//
export function setTennis(t, stateObj, c, team, oppo) {
    c.venue = stateObj.attributes.event_name;
    c.pre1 = t.translate("common.tourney" + stateObj.attributes.odds)
    c.in1 = c.pre1;
    c.finalTerm = stateObj.attributes.clock + " - " + c.gameDatePOST  + " (" + c.pre1 + ")";

    c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock);
    c.barLength[team] = stateObj.attributes.team_score;
    c.barLength[oppo] = stateObj.attributes.opponent_score;
    if (stateObj.attributes.team_shots_on_target) {
        c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock + "(tiebreak)");
        c.barLabel[team] = t.translate("tennis.teamBarLabel", "%s", stateObj.attributes.team_score +'(' + stateObj.attributes.team_shots_on_target + ')');
    }
    else {
        c.barLabel[team] = t.translate("tennis.teamBarLabel", "%s", String(stateObj.attributes.team_score));
    }
    if (stateObj.attributes.team_shots_on_target) {
        c.gameBar = t.translate("tennis.gameBar", "%s", stateObj.attributes.clock + "(tiebreak)");
        c.barLabel[oppo] = t.translate("tennis.oppoBarLabel", "%s", stateObj.attributes.opponent_score +'(' + stateObj.attributes.opponent_shots_on_target + ')');
    }
    else {
        c.barLabel[oppo] = t.translate("tennis.oppoBarLabel", "%s", String(stateObj.attributes.opponent_score ));
    }
    c.timeouts[team] = stateObj.attributes.team_sets_won;
    c.timeouts[oppo] = stateObj.attributes.opponent_sets_won;
    c.title = c.title || stateObj.attributes.event_name

    c.timeoutsDisplay = 'inline';
}

//
//  setVolleyball()
//    gameBar = clock
//    barLength = team_score, opponent_score
//    barLabel = "score"
//    timeouts = sets won
//    timeoutsDisplay = 'inline';
//
export function setVolleyball(t, stateObj, c, team, oppo) {
    c.gameBar = t.translate("volleyball.gameBar", "%s", stateObj.attributes.clock);
    c.barLength[team] = stateObj.attributes.team_score;
    c.barLength[oppo] = stateObj.attributes.opponent_score;
    c.barLabel[team] = t.translate("volleyball.teamBarLabel", "%s", String(stateObj.attributes.team_score));
    c.barLabel[oppo] = t.translate("volleyball.oppoBarLabel", "%s", String(stateObj.attributes.opponent_score));
    c.timeouts[team] = stateObj.attributes.team_sets_won;
    c.timeouts[team] = stateObj.attributes.opponent_sets_won;
    c.timeoutsDisplay = 'inline';
}
