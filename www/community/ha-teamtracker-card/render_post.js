import { html, styleMap } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";


// Define the rendering function
export function renderPost(c) {
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
                        <div class="name"><span class="rank" style=${styleMap({ '--rank-display': c.rankDisplay })}>${c.rank[1]}</span> ${c.name[1]}</div>
                        <div class="record">${c.record[1]}</div>
                    </a>
                </div>
                <div class="score" style=${styleMap({ '--score_opacity': c.scoreOp[1], "--score_size": c.scoreSize })}>${c.score[1]}</div>
                <div class="divider">&nbsp&nbsp&nbsp</div>
                <div class="score" style=${styleMap({ '--score_opacity': c.scoreOp[2], "--score_size": c.scoreSize })}>${c.score[2]}</div>
                <div class="team">
                    <a class="right-clickable ${!c.url[2] ? 'disabled' : ''}" href="${c.url[2] ? c.url[2] : '#'}" target="_blank">
                        <img class="logo" src="${c.logo[2]}" onerror="this.onerror=null; this.src='${c.logoError[2]}';" />
                        <div class="name"><span class="rank" style=${styleMap({ '--rank-display': c.rankDisplay })}>${c.rank[2]}</span> ${c.name[2]}</div>
                        <div class="record">${c.record[2]}</div>
                    </a>
                </div>
            </div>
            <a class="bottom-clickable ${!c.bottomURL ? 'disabled' : ''}" href="${c.bottomURL ? c.bottomURL : '#'}" target="_blank">
                <div class="post-row1">${c.finalTerm}</div>
                <div class="post-series-info" style=${styleMap({ '--series-summary-display': c.seriesSummaryDisplay })}>${c.seriesSummary}</div>
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