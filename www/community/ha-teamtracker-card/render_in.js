import { html, styleMap } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";


// Define the rendering function
export function renderIn(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = html`
    <ha-card>
        <div class="card">
            <div class="title">${c.title}</div>
            <img class="team-bg" src="${c.logoBG[1]}" />
            <img class="opponent-bg" src="${c.logoBG[2]}" />
            <div class="card-content">
                <div class="team">
                    <a class="left-clickable ${!c.url[1] ? 'disabled' : ''}" href="${c.url[1] ? c.url[1] : '#'}" target="_blank">
                        <img class="logo" src="${c.logo[1]}" onerror="this.onerror=null; this.src='${c.logoError[1]}';" />
                        <div class="name"><span class="rank" style=${styleMap({"--rank-display": `${c.rankDisplay}`})}>${c.rank[1]}</span> ${c.name[1]}</div>
                        <div class="record">${c.record[1]}</div>
                        <div class="timeouts-wrapper" style=${styleMap({"--timeouts-display": `${c.timeoutsDisplay}`})}>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[1][1]}`, "--timeout-color": `${c.color[1]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[1][2]}`, "--timeout-color": `${c.color[1]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[1][3]}`, "--timeout-color": `${c.color[1]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                        </div>
                    </a>
                </div>
                <div class="possession" style=${styleMap({"--possession-opacity": `${c.possessionOp[1]}`})}>&bull;</div>
                <div class="score" style=${styleMap({ "--score_size": `${c.scoreSize}`})}>${c.score[1]}</div>
                <div class="divider">&nbsp&nbsp&nbsp</div>
                <div class="score" style=${styleMap({ "--score_size": `${c.scoreSize}`})}>${c.score[2]}</div>
                <div class="possession" style=${styleMap({"--possession-opacity": `${c.possessionOp[2]}`})}>&bull;</div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? 'disabled' : ''}" href="${c.url[2] ? c.url[2] : '#'}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" onerror="this.onerror=null; this.src='${c.logoError[2]}';" />
                        <div class="name"><span class="rank" style=${styleMap({"--rank-display": `${c.rankDisplay}`})}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                        <div class="timeouts-wrapper" style=${styleMap({"--timeouts-display": `${c.timeoutsDisplay}`})}>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[2][1]}`, "--timeout-color": `${c.color[2]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[2][2]}`, "--timeout-color": `${c.color[2]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                            <div class="timeout" style=${styleMap({"--timeout-opacity": `${c.timeoutsOp[2][3]}`, "--timeout-color": `${c.color[2]}`, "--timeout-border": `${c.outlineWidth}px`, "--timeout-border-color": `${c.outlineColor}`})}></div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="play-clock">${c.playClock}</div>
            <div class="bases" style=${styleMap({"--bases-display": `${c.basesDisplay}`})}>
                <div class="on-base" style=${styleMap({"--on-base-opacity": `${c.onSecondOp}`})}>&bull;</div>
            </div>
            <div class="bases" style=${styleMap({"--bases-display": `${c.basesDisplay}`})}>
                <div class="on-base" style=${styleMap({"--on-base-opacity": `${c.onThirdOp}`})}>&bull;</div>
                <div class="pitcher"></div>
                <div class="on-base" style=${styleMap({"--on-base-opacity": `${c.onFirstOp}`})}>&bull;</div>
            </div>
            <div class="outs" style=${styleMap({"--outs-display": `${c.outsDisplay}`})}>${c.in0}</div>
            <div class="in-series-info" style=${styleMap({"--series_summary-display": `${c.seriesSummaryDisplay}`})}>${c.seriesSummary}</div>
            <div class="line"></div>
            <a class="bottom-clickable ${!c.bottomURL ? 'disabled' : ''}" href="${c.bottomURL ? c.bottomURL : '#'}" target="_blank">
                <div class="in-row1">
                    <div class="venue">${c.venue}</div>
                    <div class="down-distance">${c.in1}</div>
                </div>
                <div class="in-row2">
                    <div class="location">${c.location}</div>
                    <div class="network">${c.in2}</div>
                </div>
                <div class="line"></div>
                <div class="last-play" style=${styleMap({"--last-play-speed": `${c.lastPlaySpeed}s`})}>
                    <p>${c.lastPlay}</p>
                </div>
                <div class="bar-wrapper" style=${styleMap({"--bar-display": `${c.barDisplay}`})}>
                    <div class="bar-text">${c.gameBar}</div>
                    <div class="bar">
                        <div class="bar1-label">${c.barLabel[1]}</div>
                        <div class="bar-flex">
                            <div class="bar-left"  style=${styleMap({"--bar-length": `${c.barLength[1]}%`, "--bar-color": `${c.color[1]}`, "--bar-border": `${c.outlineWidth}px`, "--bar-border-color": `${c.outlineColor}`})}></div>
                            <div class="bar-right" style=${styleMap({"--bar-length": `${c.barLength[2]}%`, "--bar-color": `${c.color[2]}`, "--bar-border": `${c.outlineWidth}px`, "--bar-border-color": `${c.outlineColor}`})}></div>
                        </div>
                        <div class="bar2-label">${c.barLabel[2]}</div>
                    </div>
                </div>
            </a>
        </div>
    </ha-card>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('a.disabled').forEach(function(link) {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                });
            });
        });
    </script>
    `;    // Return the HTML template
    return htmlTemplate;
}