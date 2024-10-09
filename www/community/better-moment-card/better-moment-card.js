import dayjs from "./dayjs.min.js";
import utc from "./timezone.js";
import timezone from "./utc.js";
var __global_minterval = {};

class BetterMomentCard extends HTMLElement {
	set hass(hass) {
		this.createTime()
	}
	createTime() {
		if (!this.content) {
			this.innerHTML = `<ha-card><div class="card-content" ${this.config.parentStyle ? 'style="' + this.config.parentStyle + ';"' : ""}></div></ha-card>`;
			this.content = this.querySelector("div");
			dayjs.extend(utc)
			dayjs.extend(timezone)
			var config = this.config, elm = [];
			if (config.moment !== null && config.moment[0]) {
				Object.keys(config.moment).forEach(k => {
					elm[k] = document.createElement('div');
					elm[k].setAttribute("id", "moment-" + k);
					config.moment[k].parentStyle ? elm[k].style.cssText = config.moment[k].parentStyle : null;
					this.content.appendChild(elm[k]);
				});
				let updateDom = () => {
					Object.keys(config.moment).forEach(k => {
						if (config.moment[k].templateRaw) {
							var html = config.moment[k].templateRaw.replace(/{{moment\s+format=(.*?)\s*(?:timezone=(.*?))?}}/g, (m, f, tz) => (tz ? dayjs().tz(tz.trim()).format(f) : dayjs().format(f) ));
						} else {
							var format = config.moment[k].format ? config.moment[k].format : "HH:mm:ss";
							var time = config.moment[k].timezone ? dayjs().tz(config.moment[k].timezone).format(format) : dayjs().format(format);
							var html = config.moment[k].template ? (config.moment[k].template).replace(/{{moment}}/g, time) : time
						}
						elm[k].innerHTML = html
					})
				};
				updateDom();
				clearInterval(__global_minterval);
				__global_minterval = setInterval(updateDom, (config.interval ? config.interval : 1000));
			}
		}
	}
	setConfig(config) {
		this.config = config;
		if (this.content) {
			delete this.content;
			this.createTime()
		}
	}
	getCardSize() {
		return 2;
	}
}
customElements.define('better-moment-card', BetterMomentCard);