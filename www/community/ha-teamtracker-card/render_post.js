import { html } from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";


// Define the rendering function
export function renderPost(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = html`
    <style>
        .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
        .title { text-align: center; font-size: 1.2em; font-weight: 500; }
        .team-bg { opacity: 0.08; position: absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
        .opponent-bg { opacity: 0.08; position: absolute; top: -20%; right: -20%; width: 58%; z-index: 0; }
        .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; }
        .team { text-align: center; width: 35%; }
        .logo { max-height: 6.5em; }
        .team img { max-width: 90px; }
        .circle { display:${c.initialsDisplay}; width: 1em; height: 1em; padding: 10px; line-height: 3em; border: 2px solid gray; border-radius: 50%; font-size: 2em; color: white; text-align: center; background: black }
        .score { font-size: ${c.scoreSize}; text-align: center; line-height: 1; }
        .score1op { opacity: ${c.scoreOp[1]}; }
        .score2op { opacity: ${c.scoreOp[2]}; }
        .divider { font-size: 2.5em; text-align: center; opacity: 0; }
        .name { font-size: 1.4em; margin-bottom: 4px; }
        .rank { font-size:0.8em; display: ${c.rankDisplay}; }
        .post-row1 { font-size: 1.2em; text-align: center; }
    </style>
    <ha-card>
        <div class="card">
            <div class="title">${c.title}</div>
            <img class="team-bg" src="${c.logoBG[1]}" />
            <img class="opponent-bg" src="${c.logoBG[2]}" />
            <div class="card-content">
                <div class="team">
                    <img class="logo" src="${c.logo[1]}" />
                    <div class="circle">${c.initials[1]}</div>
                    <div class="name"><span class="rank">${c.rank[1]}</span> ${c.name[1]}</div>
                    <div class="record">${c.record[1]}</div>
                </div>
                <div class="score score1op">${c.score[1]}</div>
                <div class="divider">&nbsp&nbsp&nbsp</div>
                <div class="score score2op">${c.score[2]}</div>
                <div class="team">
                    <img class="logo" src="${c.logo[2]}" />
                    <div class="circle">${c.initials[2]}</div>
                    <div class="name"><span class="rank">${c.rank[2]}</span> ${c.name[2]}</div>
                    <div class="record">${c.record[2]}</div>
                </div>
            </div>
            <div class="post-row1">${c.finalTerm}</div>
        </div>
    </ha-card>
    `;    // Return the HTML template
    return htmlTemplate;
}