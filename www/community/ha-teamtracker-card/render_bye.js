import { html } from "https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js";


// Define the rendering function
export function renderBye(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = html`
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