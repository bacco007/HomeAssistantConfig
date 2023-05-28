import { html } from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";


// Define the rendering function
export function renderBye(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = html`
    <style>
        .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
        .team-bg { opacity: 0.08; position: absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
        .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; }
        .team { text-align: center; width: 35%; 
        .team img { max-width: 90px; }
        .name { font-size: 1.6em; margin-bottom: 4px; }
        .line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
        .bye { font-size: 1.8em; text-align: center; width: 50%; }
    </style>
    <ha-card>
        <div class="card">
            <img class="team-bg" src="${c.logoBG[team]}" />
            <div class="card-content">
                <div class="team">
                    <img src="${c.logo[team]}" />
                    <div class="name">${c.name[team]}</div>
                </div>
                <div class="bye">${c.byeTerm}</div>
            </div>
        </div>
    </ha-card>
`;
    // Return the HTML template
    return htmlTemplate;
}