// Clockwork Card
// https://github.com/robmarkoski/ha-clockwork-card

class ClockWorkCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
    }

    /* This is called every time sensor is updated */
    set hass(hass) {

        const config = this.config;
        const locale = config.locale;
        const _showYear = config.showYear;
        const showYear = _showYear ? _showYear : false;
        const _locale = locale ? locale : undefined;
        var _other_timezones = config.other_time;
        
        const entityId = config.entity;

        // Need to check for safari as safari dates are parsed as being UTC when not specified.
        // Therefore all dates are adjusted
        //var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (entityId) {
            const state = hass.states[entityId];
            const stateStr = state ? state.state : "Unavailable";
            if (stateStr == "Unavailable") {
                throw new Error("Sensor State Unavailable");
            }
            // if (isSafari) {
            //     var _stateStr_utc = new Date(stateStr).toLocaleString(locale, {timeZone: "Etc/UTC"});
            //     var _date_time = new Date(_stateStr_utc);
            // } else {
            //     var _date_time = new Date(stateStr);
            // }
            var _date_time = new Date(stateStr);
        } else {
            var _date_time = new Date();
        }



        
        if (_date_time == "Invalid Date") {
            throw new Error("Invalid date. Ensure its a ISO Date")
        }
        
        //Format the Time
        var _time = _date_time.toLocaleTimeString(_locale, {
            hour: 'numeric',
            minute: 'numeric'
        });

        //Format the Date
        var dateParts = {
          weekday : 'long',
          day : 'numeric',
          month : 'long',
        };

        if (showYear) {
          dateParts.year = 'numeric';
        }

        var _date = _date_time.toLocaleDateString(_locale, dateParts);

        //Build List of Other Timezones
        //
        var otherclocks = `
            <div class = "other_clocks">
            `;
        var i;
        var j = _other_timezones.length; //TODO: Recommend max 3.
        for (i= 0; i < j; i++) {
            //Format other timezones.
            var _tztime = _date_time.toLocaleTimeString(_locale, {
                hour: 'numeric',
                minute: 'numeric',
                timeZone: _other_timezones[i],
                weekday: 'short'
            }); 
            
            // List other Timezones.
            otherclocks = otherclocks + `
                <div class="tz_locale">${_other_timezones[i]} </div> 
                <div class="otime"> ${_tztime} </div>
            `;
            //console.log(_tztime);
        };
        otherclocks = otherclocks + `
            </div>
            `;
        /*console.log(otherclocks);*/

        // Build Current Local Time
        var local_time = `
            <div class="clock">
                <div class="time" id="time">${_time}</div>
                <div class="date" id="date">${_date}</div>
            </div>
        `;
        
        var clock_contents = local_time + otherclocks;
       /* console.log("Clock Contents: " + clock_contents);*/
        
       this.shadowRoot.getElementById('container').innerHTML = clock_contents;
    }

    /* This is called only when config is updated */
    setConfig(config) {
        // TODO: Add some more error checking.
        // if (!config.entity) {
        //     throw new Error('You must define an entity')
        // }
        
        /*console.log(_other_timezones);*/
        const root = this.shadowRoot;
        if (root.lastChild) root.removeChild(root.lastChild);

        this.config = config;

        const card = document.createElement('ha-card');
        const content = document.createElement('div');
        const style = document.createElement('style')
  
        style.textContent = `
            .container {
                padding: 5px 5px 5px;
                display:flex;
                flex-flow: row wrap;
                justify-content: space-around;
                align-items: flex-start;
            }
            .clock {
                padding: 5px 5px 5px 0px;
                margin: auto;
            }
            .other_clocks {
                float: right;
                margin: auto;
            }
            .otime {
                padding: 0px 5px 2px;
                font-size: 11px;
                font-family: var(--paper-font-headline_-_font-family);
                letter-spacing: var(--paper-font-headline_-_letter-spacing);
                text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
            }
            .tz_locale {
                padding: 0px 5px 1px;
                color: var(--secondary-text-color);
                font-size: 12px;
                font-weight: bold;
                font-family: var(--paper-font-headline_-_font-family);
                letter-spacing: var(--paper-font-headline_-_letter-spacing);
                text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
            }     
            .time {
                font-family: var(--paper-font-headline_-_font-family);
                -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
                font-size: 56px;
                font-weight: var(--paper-font-headline_-_font-weight);
                letter-spacing: var(--paper-font-headline_-_letter-spacing);
                line-height: 1em;
                text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
                text-align: center;
            }
            .date {
                font-family: var(--paper-font-headline_-_font-family);
                -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing);
                font-size: 24px;
                font-weight: var(--paper-font-headline_-_font-weight);
                letter-spacing: var(--paper-font-headline_-_letter-spacing);
                line-height: var(--paper-font-headline_-_line-height);
                text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);
                text-align: center;
            }          
        `;
     
        content.id = "container";
        content.className = "container";
        card.header = config.title;
        card.appendChild(style);
        card.appendChild(content);
        
        root.appendChild(card);
      }
  
    // The height of the card.
    getCardSize() {
      return 3;
    }
}
  
customElements.define('clockwork-card', ClockWorkCard);