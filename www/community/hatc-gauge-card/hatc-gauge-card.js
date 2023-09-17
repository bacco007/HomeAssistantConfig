
var LitElement = LitElement || Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
var html = LitElement.prototype.html;
var css = LitElement.prototype.css;

function isObject(val) {
    return val instanceof Object; 
}

function calcPercent(sValue, sMax){
    var result = sValue / sMax * 100;
    result = Math.trunc(result);
    if(result >= 75) {
        return result - 1;
    }
    return result;
}

function calcStatePercent(sValue, sMax){
    if(isNaN(sValue)){
        return '';
    }
    var result = sValue / sMax * 100;
    result = Math.trunc(result);
    return result;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function handleClick(node, hass, config, entityId){
    let e;
    if (!config){
        return;
    }

    // eslint-disable-next-line default-case
    switch (config.action) {
        case 'more-info': {
            e = new Event('hass-more-info', { composed: true });
            e.detail = {
                entityId: config.entity || entityId,
            };
            node.dispatchEvent(e);
            break;
        }
        case 'navigate': {
            if (!config.navigation_path) return;
            window.history.pushState(null, '', config.navigation_path);
            e = new Event('location-changed', { composed: true });
            e.detail = { replace: false };
            window.dispatchEvent(e);
            break;
        }
        case 'call-service': {
            if (!config.service) return;
            const [domain, service] = config.service.split('.', 2);
            const serviceData = { ...config.service_data };
            hass.callService(domain, service, serviceData);
            break;
        }
        case 'url': {
            if (!config.url) return;
            window.location.href = config.url;
        }
        case 'toggle': {
            hass.callService(config.service, "toggle", {
                entity_id: config.entity || entityId
            });
        }
    }
}

class HatcGaugeCard extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {}
        };
    }

    static getConfigElement() {
        console.log('getConfigElement');
    }

    static getStubConfig() {
        return { entity: "sun.sun" }
    }

    // Whenever the state changes, a new `hass` object is set. Use this to
    // update your content.
    render() {
        const hassEntity = this.hass.states[this.config.entity];
        if(hassEntity){
            var showTitleEntity = true;
            var showStateEntity = true; 
            var showIconEntity = true; 
            var showUnitOfMeasurmentEntity = true;

            var icon;
            var textstateColor;

            if(typeof hassEntity.attributes.icon !== 'undefined'){
                icon = hassEntity.attributes.icon;
            }else{
                // icon par défaut selon device_class si l'attribut icon est vide
                if(typeof hassEntity.attributes.device_class !== 'undefined'){
                    switch(hassEntity.attributes.device_class){
                        case 'power':
                            icon = 'mdi:flash';
                            break;
                        case 'temperature':
                            icon = 'mdi:thermometer';
                            break;
                    }
                }else{
                    // icon par défaut selon le prefix si l'attribut et device_class est vide
                    if(hassEntity.entity_id.startsWith('light')){
                        icon = 'mdi:lightbulb';
                    }
                }
            }
            // Card config
            var c = {}; var cCard = (typeof this.config.card !== 'undefined') ? this.config.card : '';
            if(isObject(cCard)){
                c['height'] = (typeof cCard['height'] !== 'undefined') ? "height:" + cCard['height'] + "; " : '';
            }

            // Title config
            var h = {}; var hTitle = (typeof this.config.title !== 'undefined') ? this.config.title : hassEntity.attributes.friendly_name;
            if(isObject(hTitle)){
                h['fontsize'] = (typeof hTitle['font-size'] !== 'undefined') ? "--mdc-icon-size:" + hTitle['font-size'] + "; font-size:" + hTitle['font-size'] + "; " : '';

                if(typeof hTitle['text-align'] !== 'undefined'){
                    if(hTitle['text-align'] == 'left'){
                        h['textalign'] = "justify-content: flex-start";
                    }else if(hTitle['text-align'] == 'right'){
                        h['textalign'] = "justify-content: flex-end";
                    }else{
                        h['textalign'] = "justify-content: center";
                    }
                }

                h['color'] = (typeof hTitle['text-color'] !== 'undefined') ? hTitle['text-color'] : '';
                h['iconcolor'] = (typeof hTitle['icon-color'] !== 'undefined') ? hTitle['icon-color'] : '';

                h['name'] = (typeof hTitle.name !== 'undefined') ? hTitle.name : hassEntity.attributes.friendly_name;
                h['icon'] = (typeof hTitle.icon !== 'undefined') ? hTitle.icon : icon;
            }else{
                h['name'] = hTitle;
                if(hTitle === '' || hTitle === false || hTitle === 'hide'){
                    h['icon'] = hTitle;
                }
            }

            var heTitle = showTitleEntity ? hassEntity.attributes.friendly_name : '';
            var heUnitOfMeasurement = showUnitOfMeasurmentEntity ? hassEntity.entity_id.startsWith('light') && (typeof hassEntity.attributes.brightness == 'number') ? '%' : hassEntity.attributes.unit_of_measurement : '';
            var heState = showStateEntity ? hassEntity.entity_id.startsWith('light') ? calcStatePercent(hassEntity.attributes.brightness, 254) : hassEntity.state : '';
            var heIcon = showIconEntity ? (typeof h.icon !== 'undefined' ? h.icon : icon) : '';

            // Gauge config
            var g = {}; var hGauge = (typeof this.config.gauge !== 'undefined') ? this.config.gauge : '';
            if(isObject(hGauge)){
                g['textstatecolor'] = (typeof hGauge['text-color'] !== 'undefined') ? hGauge['text-color'] : '';
                g['iconcolor'] = (typeof hGauge['icon-color'] !== 'undefined') ? hGauge['icon-color'] : g.textstateColor;
                g['fontsize'] = (typeof hGauge['font-size'] !== 'undefined') ? hGauge['font-size'] : '22px';
                g['iconsize'] = (typeof hGauge['icon-size'] !== 'undefined') ? hGauge['icon-size'] : g.fontsize;
                g['friendlyname'] = (typeof hGauge['friendly_name'] !== 'undefined') ? hGauge['friendly_name'] : heTitle;
                g['unitofmeasurement'] = (typeof hGauge['unit_of_measurement'] !== 'undefined') ? hGauge['unit_of_measurement'] : heUnitOfMeasurement;
                g['maxvalue'] = (typeof hGauge['max_value'] !== 'undefined') ? hGauge['max_value'] : '100';

                g['state'] = (typeof hGauge['state'] !== 'undefined') ? hGauge['state'] : true;
                console.log("heIcon", heIcon);
                g['icon'] = (typeof hGauge['icon'] !== 'undefined') ? hGauge['icon'] : (heIcon !== '' && heIcon !== false && heIcon !== 'hide') ? heIcon : icon;

                // Severity config
                if(typeof this.config.gauge.severity !== 'undefined'){
                    this.config.gauge.severity.map(s => {
                        if(typeof s.form === 'undefined' && typeof s.to === 'undefined' && typeof s.color !== 'undefined'){
                            textstateColor = s.color;
                            if(typeof s.icon !== 'undefined'){
                                g.icon = s.icon;
                            }
                        }
                        if(parseFloat(heState) >= s.from && parseFloat(heState) <= s.to){
                            textstateColor = s.color;
                            if(typeof s.icon !== 'undefined'){
                                g.icon = s.icon;
                            }
                        }
                    });
                    if(g['textstatecolor'] == "severity" || g['textstatecolor'] == ""){
                        g['textstatecolor'] = textstateColor;
                    }
                    if(h.iconcolor == "severity"){
                        h.iconcolor = textstateColor;
                    }
                    if(h.color == "severity"){
                        h.color = textstateColor;
                    }
                    if(h.icon == "severity"){
                        heIcon = g.icon;
                    }
                }else{
                    textstateColor= 'white';
                }
            }else{
                g['textstatecolor'] = '';
                g['iconcolor'] = '';
                g['fontsize'] = '22px';
                g['iconsize'] = g.fontsize;
                g['friendlyname'] = heTitle;
                g['unitofmeasurement'] = heUnitOfMeasurement;
                g['maxvalue'] = '100';
                g['state'] = true;
                g['icon'] = (heIcon !== '' && heIcon !== false && heIcon !== 'hide') ? heIcon : icon;

                textstateColor= 'white';
            }

            var heTextStateColor = g['textstatecolor'];
            var hePathStrokeColor = textstateColor;

            if(hassEntity.entity_id.startsWith('light')){
                hePathStrokeColor = heTextStateColor = 'rgb('+hassEntity.attributes.rgb_color+')';
            }

            var uID = makeid(2);
            //hePathStrokeColor = 'url(#MyGradient'+uID+')';

            var hE = {
                "heTitle": (g.friendlyname !== '' && g.friendlyname !== false && g.friendlyname !== 'hide') ? g.friendlyname : '',
                "heState": heState,
                "heUnitOfMeasurement": (g.unitofmeasurement !== '' && g.unitofmeasurement !== false && g.unitofmeasurement !== 'hide') ? g.unitofmeasurement : '',
                "heIcon": heIcon,
                "hePathStrokeColor" : hePathStrokeColor,
                "heTextStateColor" : heTextStateColor,
            }



            var hIconHTML = (hE.heIcon !== '' && hE.heIcon !== false && hE.heIcon !== 'hide') ? html`<ha-icon style="${h.fontsize} color:${h.iconcolor};" .icon="${hE.heIcon}"></ha-icon>` : '';
            var hNameHTML = (h.name !== '' && h.name !== false && h.name !== 'hide') ? html`<div style="${h.fontsize} color:${h.color};" class="name">${h.name}</div>` : '';
            var hEntitiesHeight = (h.name !== '' && h.name !== false && h.name !== 'hide') ? 'calc(100% - 40px)' : '100%';
            var gStateHTML =  (g.state !== '' && g.state !== false && g.state !== 'hide') ? html`${hE.heState}${hE.heUnitOfMeasurement}` : '';
            var gIconHTML = (g.icon !== '' && g.icon !== false && g.icon !== 'hide') ? html`<ha-icon style="--mdc-icon-size: ${g.iconsize}; color:${g.iconcolor};" .icon="${g.icon}"></ha-icon>` : '';

            var percent = calcPercent(hE.heState, g.maxvalue);

            var gaugeHTML = html`
                <svg viewBox="0 0 36 36" style="max-width: 100%; max-height: 100%;">
                    <path style="fill: none; stroke: #343434; stroke-width: 2.0;"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path style="stroke: ${hE.hePathStrokeColor}; fill: none; stroke-width: 2.8; stroke-linecap: round; animation: progress 1s ease-out forwards;"
                          stroke-dasharray="${percent}, 100"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
            `;

            if(percent > 100){
                return html`
                    <div class="maxValueExceeded">Il semble il y avoir un problème, Veuillez ajouter un max_value !</div>
                `;
            }else{
                return html`
                    <ha-card class="HatcGaugeCard">
                        <div class="box" style="${c.height}" @click=${e => this._handlePopup(e)}>
                            <div class="header" style="${h.textalign}">
                                ${hIconHTML}
                                ${hNameHTML}
                            </div>

                            <div class="entities" style="height: ${hEntitiesHeight};">
                                <div class="outer">
                                    <div class="inner" style="color: ${hE.heTextStateColor}; font-size: ${g.fontsize};">
                                        ${gIconHTML}
                                        <div class="datas">
                                            ${gStateHTML}
                                        </div>
                                    </div>
                                </div>
                                ${gaugeHTML}
                            </div>
                        </div>
                    </ha-card>
                `;
            }
        }else{
            return html`
                <div class="not-found">l'entité "${this.config.entity}" n'à pas été trouvé.</div>
            `;
        }
    }

    // The user supplied configuration. Throw an exception and Home Assistant
    // will render an error card.
    setConfig(config) {
        if (!config.entity) {
            throw new Error('Veuillez ajouter un "Entity" dans votre configuration');
        }
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return this.config.entities.length + 1;
    }

    _toggle(state, service) {
        this.hass.callService(service, "toggle", {
            entity_id: state.entity_id
        });
    }

    _handlePopup(e) {
        var tap_action = this.config.tap_action || {};
        if (this.config.entity) {
            if (typeof this.config.tap_action === 'undefined') {
                tap_action = {
                    action: "more-info"  
                }
            }else{
                if(typeof this.config.tap_action.service === 'undefined'){
                    tap_action = {
                        service: "homeassistant",
                        ...tap_action
                    }
                }
            }
            e.stopPropagation();
            handleClick(this, this.hass, tap_action, this.config.entity);
        }
    }

    _handleEntities(e, entity) {
        var ent = entity || {};
        if (!ent['tap_action']) {
            ent = {
                tap_action: {
                    action: "more-info",
                    ...ent
                }
            }
        }
        e.stopPropagation();
        handleClick(this, this.hass, this.config.tap_action, false);
    }

    static get styles() {
        return css`
            :root, .HatcGaugeCard *{
                --mdc-icon-size: 16px;   
                --card-padding: 8px;
            }
            .HatcGaugeCard .box{
                padding: var(--card-padding);
            }
            .HatcGaugeCard .box div.name{
                color: var(--secondary-text-color);
                line-height: 40px;
                font-weight: 500;
                font-size: 16px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .HatcGaugeCard .box .header{
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                align-content: center;
                justify-content: flex-start;
                align-items: center;
            }
            .HatcGaugeCard .box .entities{
                position: relative;
            }
            .HatcGaugeCard .box .entities .outer .inner{
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                width: 100%;
                align-content: center;
                position: absolute;
                top: 0;
                left: 0;
                font-size: 22px;
            }
            .HatcGaugeCard .box .entities svg{
                display: block;
                margin-left: auto;
                margin-right: auto;
                left: 0;
                right: 0;
                text-align: center;
                position: relative;
                height: 100%;
            }
        `;
    }
}

customElements.define('hatc-gauge-card', HatcGaugeCard);