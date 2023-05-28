import { html } from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";


// Define the rendering function
export function renderNotFound(c) {
    // Render the HTML template using the provided object `c`
    const htmlTemplate = html`
        <style>
            .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
            .title { text-align: center; font-size: 1.2em; font-weight: 500; }
            .team-bg { opacity: 0.08; position:absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
            .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; }
            .team { text-align: center; width: 35%; }
            .team img { max-width: 90px; }
            .logo { max-height: 6.5em; }
            .notFound1 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }
            .notFound2 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }
        </style>
        <ha-card>
            <div class="card">
                <div class="title">${c.title}</div>
                <img class="team-bg" src="${c.notFoundLogoBG}" />
                <div class="card-content">
                    <div class="team">
                        <img class="logo" src="${c.notFoundLogoBG}" />
                        <div class="notFoundLeague">${c.notFoundLeague}</div>
                    </div>
                    <div class="notFoundWrapper">
                        <div class="notFound1">${c.notFoundTerm1}</div>
                        <div class="notFound2">${c.notFoundTerm2}</div>
                    </div>
                </div>
            </div>
        </ha-card>
    `;
    // Return the HTML template
    return htmlTemplate;
}