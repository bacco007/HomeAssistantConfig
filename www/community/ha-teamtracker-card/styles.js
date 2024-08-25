import { css } from "https://cdn.jsdelivr.net/gh/lit/dist@3/all/lit-all.min.js";

export const cardStyles = css`
.card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
.title { text-align: center; font-size: 1.2em; font-weight: 500; }
.team-bg { opacity: 0.08; position: absolute; top: -20%; left: -20%; width: 58%; z-index: 0; }
.opponent-bg { opacity: 0.08; position: absolute; top: -20%; right: -20%; width: 58%; z-index: 0; }
.card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; }
.team { text-align: center; width: 35%; }
.team img { max-width: 90px; }
.logo { max-height: 6.5em; }
.score { font-size: var(--score_size, 3em); opacity: var(--score_opacity, 1); text-align: center; line-height: 1; }
.line { height: 1px; background-color: var(--primary-text-color); margin:10px 0; }
.left-clickable { text-decoration: none; color: inherit; }
.right-clickable { text-decoration: none; color: inherit; }
.bottom-clickable { text-decoration: none; color: inherit; }
.disabled { pointer-events: none; cursor: default; }

.possession { opacity: var(--possession-opacity, 1); font-size: 2.5em; text-align: center; font-weight:900; }
.divider { font-size: 2.5em; text-align: center; margin: 0 4px; }
.name { font-size: 1.4em; margin-bottom: 4px; }
.rank { display: var(--rank-display, inline); font-size:0.8em; }
.record { font-size:1.0em; height 1.0em; }
.timeouts-wrapper { margin: 0.4em auto; width: 70%; display: var(--timeouts-display, inline); }
.timeout { height: 0.6em; border-radius: 0.3em; background-color: var(--timeout-color, #000000); border: var(--timeout-border, 1px) solid var(--timeout-border-color, #ffffff); width: 20%; display: inline-block; margin: 0.4em auto; position: relative; opacity: var(--timeout-opacity, 0.2); }
.bases { display: var(--bases-display, inherit); font-size: 2.5em; text-align: center; font-weight:900; }
.on-base { opacity: var(--on-base-opacity, 1); display: inline-block; }
.pitcher { opacity: 0.0; display: inline-block; }
.in-row1 { font-size: 1em; height: 1em; margin: 6px 0 2px; }
.in-row2 { ; font-size: 1em; height: 1em; margin: 6px 0 2px; }
.in-row1, .in-row2 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
.last-play { font-size: 1.2em; width: 100%; white-space: nowrap; overflow: hidden; box-sizing: border-box; }
.last-play p { animation : slide var(--last-play-speed, 18s) linear infinite; display: inline-block; padding-left: 100%; margin: 2px 0 12px; }
@keyframes slide { 0%   { transform: translate(0, 0); } 100% { transform: translate(-100%, 0); } }
.down-distance { text-align: right; }
.play-clock { font-size: 1.4em; height: 1.4em; text-align: center; }
.outs { display: var(--outs-display, inherit); text-align: center; }

.bar-wrapper { display: var(--bar-display, inherit) }
.bar-text { text-align: center; }
.bar-flex { width: 100%; display: flex; justify-content: center; margin-top: 4px; }
.bar-right { width: var(--bar-length, 0); background-color: var(--bar-color, red); height: 0.8em; border-radius: 0 0.4em 0.4em 0; border: var(--bar-border, 1px) solid var(--bar-border-color, lightgrey); border-left: 0; transition: all 1s ease-out; }
.bar-left { width: var(--bar-length, 0); background-color: var(--bar-color, blue); height: 0.8em; border-radius: 0.4em 0 0 0.4em; border: var(--bar-border, 1px) solid var(--bar-border-color, lightgrey); border-right: 0; transition: all 1s ease-out; }
.bar { display: flex; align-items: center; }
.bar1-label { flex: 0 0 10px; padding: 0 10px 0 0; margin-top: 4px; }
.bar2-label { flex: 0 0 10px; padding: 0 0 0 10px; text-align: right; margin-top: 4px; }
.in-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.gameday { font-size: 1.4em; height: 1.4em; }
.gamedate { font-size: 1.1em; height: 1.1em; }
.gametime { font-size: 1.1em; height: 1.1em; }
.pre-row1 { font-weight: 500; font-size: 1.2em; height: 1.2em; margin: 6px 0 2px; }
.pre-row1, .pre-row2, .pre-row3 { display: flex; justify-content: space-between; align-items: center; margin: 2px 0; }
.pre-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.post-row1 { font-size: 1.2em; text-align: center; }
.post-series-info { display: var(--series-summary-display, none); font-size: 1.2em; text-align: center; margin: 4px; }

.notFound1 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }
.notFound2 { font-size: 1.4em; line-height: 1.2em; text-align: center; width: 100%; margin-bottom: 4px; }

.bye { font-size: 1.8em; text-align: center; width: 50%; }

`;