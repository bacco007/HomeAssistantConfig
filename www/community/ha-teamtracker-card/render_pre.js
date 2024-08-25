import { html, styleMap } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";


// Define the rendering function
export function renderPre(c) {
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
                    </a>
                </div>
                <div class="gamewrapper">
                    <div class="gameday">${c.gameWeekday}</div>
                    <div class="gamedate">${c.gameDatePRE}</div>
                    <div class="gametime">${c.gameTime}</div>
                </div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? 'disabled' : ''}" href="${c.url[2] ? c.url[2] : '#'}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" onerror="this.onerror=null; this.src='${c.logoError[2]}';" />
                        <div class="name"><span class="rank" style=${styleMap({"--rank-display": `${c.rankDisplay}`})}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                    </a>
                </div>
            </div>
            <div class="pre-series-info" style=${styleMap({"--series_summary-display": `${c.seriesSummaryDisplay}`})}>${c.seriesSummary}</div>
            <div class="line"></div>
            <a class="bottom-clickable ${!c.bottomURL ? 'disabled' : ''}" href="${c.bottomURL ? c.bottomURL : '#'}" target="_blank">
                <div class="pre-row1">
                    <div class="date">${c.startTerm} ${c.startTime}</div>
                    <div class="odds">${c.pre1}</div>
                </div>
                <div class="pre-row2">
                    <div class="venue">${c.venue}</div>
                    <div class="overunder"> ${c.pre2}</div>
                </div>
                <div class="pre-row3">
                    <div class="location">${c.location}</div>
                    <div class="network">${c.pre3}</div>
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