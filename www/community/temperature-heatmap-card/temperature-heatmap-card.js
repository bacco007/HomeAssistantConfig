const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const style = css`
  .ha-icon-big {
    --mdc-icon-size: 40px;
  }`

export default style;

class TemperatureHeatmapCard extends LitElement {
  hass_inited = false;
  // Whenever the state changes, a new `hass` object is set. Use this to
  // update your content.
  set hass(hass) {
    if (this.hass_inited === true) { return }
    this.myhass = hass;
    this.min = -9999;
    this.max = -9999;
    this.mean = -9999;
    this.dayDizio = {};
    this.dayDizioPartial = {};
    this.responseComplete = 0;
    this.id = Math.random()
      .toString(36)
      .substr(2, 9);

    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : "unavailable";
    if (!this.shiftDay) this.shiftDay = 0;
    var that = this;
    setTimeout(function(){that.get_recorder([entityId], 7);}, 50);
    setTimeout(function(){that.get_recorder([entityId], 7);}, 500);
    setTimeout(function(){that.get_recorder([entityId], 7);}, 1500);
    setTimeout(function(){that.get_recorder([entityId], 7);}, 2000);

    var day_forecast;
    if (this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
    if (day_forecast) this.getTomorrowHourlyTemperatures();
    //this.get_recorder([entityId], 7);
    this.hass_inited = true;
  }

  static getConfigElement() {
    return document.createElement("temperature-heatmap-card-editor");
  }

  static get styles() {
    return style;
  }

  onClickLeft(ev, shiftDay) {
    var TD60 = this.shadowRoot.getElementById(this.id+"td60")
    var TD61 = this.shadowRoot.getElementById(this.id+"td61")
    var TD62 = this.shadowRoot.getElementById(this.id+"td62")
    var TD63 = this.shadowRoot.getElementById(this.id+"td63")
    var TD64 = this.shadowRoot.getElementById(this.id+"td64")
    var TD65 = this.shadowRoot.getElementById(this.id+"td65")
    var TD66 = this.shadowRoot.getElementById(this.id+"td66")
    var TD67 = this.shadowRoot.getElementById(this.id+"td67")
    var TD68 = this.shadowRoot.getElementById(this.id+"td68")
    var TD69 = this.shadowRoot.getElementById(this.id+"td69")
    var TD6a = this.shadowRoot.getElementById(this.id+"td6a")
    var TD6b = this.shadowRoot.getElementById(this.id+"td6b")
    if (TD60) TD68.style.border = '0px dotted #000000';
    if (TD61) TD68.style.border = '0px dotted #000000';
    if (TD62) TD68.style.border = '0px dotted #000000';
    if (TD63) TD68.style.border = '0px dotted #000000';
    if (TD64) TD68.style.border = '0px dotted #000000';
    if (TD65) TD68.style.border = '0px dotted #000000';
    if (TD66) TD68.style.border = '0px dotted #000000';
    if (TD67) TD68.style.border = '0px dotted #000000';
    if (TD68) TD68.style.border = '0px dotted #000000';
    if (TD69) TD68.style.border = '0px dotted #000000';
    if (TD6a) TD68.style.border = '0px dotted #000000';
    if (TD6b) TD68.style.border = '0px dotted #000000';
    this.dayDizio = {};
    this.dayDizioPartial = {};
    var leftButton = this.shadowRoot.getElementById(this.id+"leftButton");
    var rightButton = this.shadowRoot.getElementById(this.id+"rightButton");
    if (leftButton) {
      leftButton.style.display = "hidden";
      rightButton.style.display = "hidden";
    }

    this.grid = [];
    this.initForecast();
    this.responseComplete = 0;
    ev.stopPropagation();
    this.shiftDay = this.shiftDay + shiftDay;
    const entityId = this.config.entity;
    this.get_recorder([entityId], 7);
  }

  onClickRight(ev, shiftDay) {
    this.dayDizio = {};
    this.dayDizioPartial = {};
    var leftButton = this.shadowRoot.getElementById(this.id+"leftButton");
    var rightButton = this.shadowRoot.getElementById(this.id+"rightButton");
    if (rightButton) {
      leftButton.style.display = "hidden";
      rightButton.style.display = "hidden";
    }

    this.grid = [];
    this.initForecast();
    this.responseComplete = 0;
    this.shiftDay = this.shiftDay - shiftDay;
    const entityId = this.config.entity;
    this.get_recorder([entityId], 7);
    ev.stopPropagation();
  }

  onClickNumber(ev) {
    ev.stopPropagation();
    var e;
    e = new Event('hass-more-info', { composed: true });
    const entityId = this.config.entity;
    if (this.config.entity) e.detail = { entityId };
    this.dispatchEvent(e);
  }

  replaceText(posxy, text) {
    var theDiv = this.shadowRoot.getElementById(this.id+posxy);
    var theTD = this.shadowRoot.getElementById(this.id+"td"+posxy);
    if (theDiv) {
      theDiv.innerHTML = this.tempToLabel(Math.round(text));
      var decimal_point = false;
      if (this.config.decimal_point !== undefined) decimal_point = this.config.decimal_point;
      if (decimal_point && text != -999 && !isNaN(text)) {
        var text_dec = (Math.round(text * 10) / 10).toFixed(1);
        var text_int = parseInt(text_dec);
        var text_flo = parseInt(((Math.round(text * 10) / 10) - text_int) * 10);
        if (text_flo < 0) text_flo = text_flo * -1;
        var text_html = text_int + ".<small>" + text_flo + "</small>";
        theDiv.innerHTML = text_html;
      }
      theTD.style.backgroundColor = "#"+this.tempToRGB(text);
    }
  }

  replaceFooter() {
    var theMin = this.shadowRoot.getElementById(this.id+"Min");
    var theMax = this.shadowRoot.getElementById(this.id+"Max");
    var theMean = this.shadowRoot.getElementById(this.id+"Mean");
    if (theMin) {
      theMin.innerHTML = this.min;
      theMax.innerHTML = this.max;
      theMean.innerHTML = this.mean;
    }
  }

  replaceDay(pos, text, letter) {
    var theDiv = this.shadowRoot.getElementById(this.id+"DAY"+pos);
    if (theDiv) {
      var day_label = false;
      var day_trend = false;
      var day_forecast = false;
      var prevDay = 0;
      var prevDayX = 0;
      var nowDay = 0;

      if (pos == "0") {
        prevDay = this.dayDizio[this.DayX];
        prevDayX = this.dayDizio[this.DayY];
        nowDay = this.dayDizio[this.Day0];
      }
      if (pos == "1") {
        prevDay = this.dayDizio[this.Day0];
        prevDayX = this.dayDizio[this.DayX];
        nowDay = this.dayDizio[this.Day1];
      }
      if (pos == "2") {
        prevDay = this.dayDizio[this.Day1];
        prevDayX = this.dayDizio[this.Day0];
        nowDay = this.dayDizio[this.Day2];
      }
      if (pos == "3") {
        prevDay = this.dayDizio[this.Day2];
        prevDayX = this.dayDizio[this.Day1];
        nowDay = this.dayDizio[this.Day3];
      }
      if (pos == "4") {
        prevDay = this.dayDizio[this.Day3];
        prevDayX = this.dayDizio[this.Day2];
        nowDay = this.dayDizio[this.Day4];
      }
      if (pos == "5") {
        prevDay = this.dayDizio[this.Day4];
        prevDayX = this.dayDizio[this.Day3];
        nowDay = this.dayDizio[this.Day5];
      }
      if (pos == "6" && this.DayNOW == this.Day6) {
        prevDay = this.dayDizioPartial[this.Day5];
        prevDayX = this.dayDizioPartial[this.Day5];
        nowDay = this.dayDizio[this.Day6];
      }
      if (pos == "6" && this.DayNOW != this.Day6) {
        prevDay = this.dayDizio[this.Day5];
        prevDayX = this.dayDizio[this.Day4];
        nowDay = this.dayDizio[this.Day6];
      }

      var delta0 = Math.abs(prevDay - nowDay);
      var delta1 = Math.abs(prevDayX - nowDay);
      var prio = 0;
      if (delta1 > delta0) prio = 1;

      var icona = "";
      var icona_color = "";
      if (delta0 <= 1.5 && delta1 <= 1.5) {
         icona = "approximately-equal-box";
         icona_color = "#828282";
      } else if (prio == 0 && prevDay > nowDay) {
         icona = "arrow-down-bold-box";
         icona_color = "#106111";
      } else if (prio == 0 && prevDay < nowDay) {
         icona = "arrow-up-bold-box";
         icona_color = "#ff0000";
      } else if (prio == 1 && prevDayX > nowDay) {
         icona = "arrow-down-bold-box";
         icona_color = "#106111";
      } else {
         icona = "arrow-up-bold-box";
         icona_color = "#ff0000";
      }
      //text = nowDay.toFixed(2);

      if (pos == "7") {
         icona = "weather-cloudy-clock";
         icona_color = "#26768c";
      }
      
      var trend = "";
      var forecast = "";
      var force_fahrenheit = false;
      if (this.responseComplete >= 3) trend = "<ha-icon style='color:"+icona_color+"' icon='mdi:"+icona+"'></ha-icon>";
      if (this.config.day_label !== undefined) day_label = this.config.day_label;
      if (this.config.day_trend !== undefined) day_trend = this.config.day_trend;
      if (this.config.force_fahrenheit !== undefined) force_fahrenheit = this.config.force_fahrenheit;
      if (this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
      if (!day_trend) trend = "";
      if (!day_forecast) forecast = "";
      if (!day_label) theDiv.innerHTML = text + "<br/>" + trend;
      else theDiv.innerHTML  = text + "<br/>" + trend + letter;
    }
  }

  initForecast() {
      if (this.gridForecast === undefined) 
        this.gridForecast = [[-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999]];
  }

  formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var month;
    var _day;
    //var ampm = hours >= 12 ? 'pm' : 'am';
    //hours = hours % 12;
    //hours = hours ? hours : 12; // the hour '0' should be '12'
    if (hours < 10)
       hours = "0" + hours;


    month = date.getMonth() + 1;
    if (month < 10)
      month = "0" + month;

    _day = date.getDate();
    if (_day < 10)
      _day = "0" + _day;
   
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours;// + ':' + minutes;
    return date.getFullYear() + '-' + month + '-' + _day + " " + strTime;
  }

  lastDay() {
      var dataToday = this.formatDate(new Date()).substr(0,10);
      const now = new Date();
      var day6full = this.formatDate(new Date(now - ((this.shiftDay) * 86400000))).substr(0,10);
      if (day6full == dataToday) return true;
      return false;
  }

  subscribeForecastEvents() {
    this.initForecast();
    var temp_adj = 0;
    if (this.config.temp_adj !== undefined) temp_adj = parseFloat(this.config.temp_adj);
    if (isNaN(temp_adj)) temp_adj = 0;
    const callback = (event) => {
      var dataToday = this.formatDate(new Date());
      var forecastItems = event.forecast;
      const now = new Date();
      var day6full = this.formatDate(new Date(now - ((this.shiftDay) * 86400000))).substr(0,10);
      var i;
      for (i = 0; i < forecastItems.length; i++) {
        var d = forecastItems[i];
        var dateForecast = this.formatDate(new Date(d.datetime));
        var tempForecast = d.temperature;
        if (dateForecast.substr(0,10) == dataToday.substr(0,10)) {
           if (dateForecast.substr(0,10) == day6full) {
             var ora = dateForecast.substr(11,2);
             if (ora == "00") this.gridForecast[6][0] = d.temperature + temp_adj;
             if (ora == "02") this.gridForecast[6][1] = d.temperature + temp_adj;
             if (ora == "04") this.gridForecast[6][2] = d.temperature + temp_adj;
             if (ora == "06") this.gridForecast[6][3] = d.temperature + temp_adj;
             if (ora == "08") this.gridForecast[6][4] = d.temperature + temp_adj;
             if (ora == "10") this.gridForecast[6][5] = d.temperature + temp_adj;
             if (ora == "12") this.gridForecast[6][6] = d.temperature + temp_adj;
             if (ora == "14") this.gridForecast[6][7] = d.temperature + temp_adj;
             if (ora == "16") this.gridForecast[6][8] = d.temperature + temp_adj;
             if (ora == "18") this.gridForecast[6][9] = d.temperature + temp_adj;
             if (ora == "20") this.gridForecast[6][10] = d.temperature + temp_adj;
             if (ora == "22") this.gridForecast[6][11] = d.temperature + temp_adj;
           }
        }
        if (dateForecast.substr(0,10) > dataToday.substr(0,10)) {
          var ora = dateForecast.substr(11,2);
             if (ora == "00") this.gridForecast[7][0] = d.temperature + temp_adj;
             if (ora == "02") this.gridForecast[7][1] = d.temperature + temp_adj;
             if (ora == "04") this.gridForecast[7][2] = d.temperature + temp_adj;
             if (ora == "06") this.gridForecast[7][3] = d.temperature + temp_adj;
             if (ora == "08") this.gridForecast[7][4] = d.temperature + temp_adj;
             if (ora == "10") this.gridForecast[7][5] = d.temperature + temp_adj;
             if (ora == "12") this.gridForecast[7][6] = d.temperature + temp_adj;
             if (ora == "14") this.gridForecast[7][7] = d.temperature + temp_adj;
             if (ora == "16") this.gridForecast[7][8] = d.temperature + temp_adj;
             if (ora == "18") this.gridForecast[7][9] = d.temperature + temp_adj;
             if (ora == "20") this.gridForecast[7][10] = d.temperature + temp_adj;
             if (ora == "22") this.gridForecast[7][11] = d.temperature + temp_adj;
        }
      }


      //this.forecasts = event.forecast;
      //this.requestUpdate();
      //this.drawChart();
    };
  
    this.forecastSubscriber = this.myhass.connection.subscribeMessage(callback, {
      type: "weather/subscribe_forecast",
      forecast_type: 'hourly',
      entity_id: this.config.forecast_entity
    });
  }

  getTomorrowHourlyTemperatures() {
    if (!this.forecastSubscriber) this.subscribeForecastEvents();
  }

  // The user supplied configuration. Throw an exception and Home Assistant
  // will render an error card.
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
    this.hass_inited = false;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }

  getWidthTable() {
      var day_forecast = "";
      if (this.lastDay() && this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
      if (day_forecast)
        return '10';
      else
        return '12';
  }

  getBorderCell(_id) {
      var nowHour = parseInt(new Date().getHours() / 2);
      var DayNOW1 = new Date(new Date()).getDate();
      var TD60 = this.shadowRoot.getElementById(this.id+"td60")
      var TD61 = this.shadowRoot.getElementById(this.id+"td61")
      var TD62 = this.shadowRoot.getElementById(this.id+"td62")
      var TD63 = this.shadowRoot.getElementById(this.id+"td63")
      var TD64 = this.shadowRoot.getElementById(this.id+"td64")
      var TD65 = this.shadowRoot.getElementById(this.id+"td65")
      var TD66 = this.shadowRoot.getElementById(this.id+"td66")
      var TD67 = this.shadowRoot.getElementById(this.id+"td67")
      var TD68 = this.shadowRoot.getElementById(this.id+"td68")
      var TD69 = this.shadowRoot.getElementById(this.id+"td69")
      var TD6a = this.shadowRoot.getElementById(this.id+"td6a")
      var TD6b = this.shadowRoot.getElementById(this.id+"td6b")
      if (DayNOW1 == this.Day6) {
        if (_id == "td60" && nowHour == 0 && TD60) TD60.style.border = '4px dotted #000000';
        if (_id == "td61" && nowHour == 1 && TD61) TD61.style.border = '4px dotted #000000';
        if (_id == "td62" && nowHour == 2 && TD62) TD62.style.border = '4px dotted #000000';
        if (_id == "td63" && nowHour == 3 && TD63) TD63.style.border = '4px dotted #000000';
        if (_id == "td64" && nowHour == 4 && TD64) TD64.style.border = '4px dotted #000000';
        if (_id == "td65" && nowHour == 5 && TD65) TD65.style.border = '4px dotted #000000';
        if (_id == "td66" && nowHour == 6 && TD66) TD66.style.border = '4px dotted #000000';
        if (_id == "td67" && nowHour == 7 && TD67) TD67.style.border = '4px dotted #000000';
        if (_id == "td68" && nowHour == 8 && TD68) TD68.style.border = '4px dotted #000000';
        if (_id == "td69" && nowHour == 9 && TD69) TD69.style.border = '4px dotted #000000';
        if (_id == "td6a" && nowHour == 10 && TD6a) TD6a.style.border = '4px dotted #000000';
        if (_id == "td6b" && nowHour == 11 && TD6b) TD6b.style.border = '4px dotted #000000';
      } else {
        if (TD60) TD60.style.border = '0px dotted #000000';
        if (TD61) TD61.style.border = '0px dotted #000000';
        if (TD62) TD62.style.border = '0px dotted #000000';
        if (TD63) TD63.style.border = '0px dotted #000000';
        if (TD64) TD64.style.border = '0px dotted #000000';
        if (TD65) TD65.style.border = '0px dotted #000000';
        if (TD66) TD66.style.border = '0px dotted #000000';
        if (TD67) TD67.style.border = '0px dotted #000000';
        if (TD68) TD68.style.border = '0px dotted #000000';
        if (TD69) TD69.style.border = '0px dotted #000000';
        if (TD6a) TD6a.style.border = '0px dotted #000000';
        if (TD6b) TD6b.style.border = '0px dotted #000000';
      }
  }

  getWidthCell() {
      var day_forecast = "";
      if (this.lastDay() && this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
      if (day_forecast)
        return 'min-width:13px';
      else
        return 'min-width:0px';
  }

  getHeadTable() {
    var month_label = false;
    var day_forecast = "";
    if (this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
    if (this.config.month_label !== undefined) month_label = this.config.month_label;

    var border_top = "";
    var border_right = "";
    var border_left = "";
    this.thead = "";
    if (month_label) {
      border_top = "border-top:solid rgb(128, 128, 128);";
      border_right = "border-right:solid rgb(128, 128, 128);";
      border_left = "border-left:solid rgb(128, 128, 128);";
    }

    var colspan0 = "0";
    var colspan1 = "7";
    var TR00 = this.shadowRoot.getElementById(this.id+"TR00")
    var TR01 = this.shadowRoot.getElementById(this.id+"TR01")
    var TR02 = this.shadowRoot.getElementById(this.id+"TR02")
    var TR03 = this.shadowRoot.getElementById(this.id+"TR03")
    var TR04 = this.shadowRoot.getElementById(this.id+"TR04")
    var TR05 = this.shadowRoot.getElementById(this.id+"TR05")
    var TR06 = this.shadowRoot.getElementById(this.id+"TR06")
    var TR07 = this.shadowRoot.getElementById(this.id+"TR07")
    var TD00 = this.shadowRoot.getElementById(this.id+"TD00")
    var TD10 = this.shadowRoot.getElementById(this.id+"TD10")
    var TD11 = this.shadowRoot.getElementById(this.id+"TD11")
    var TD011 = this.shadowRoot.getElementById(this.id+"TD011")
    var TD111 = this.shadowRoot.getElementById(this.id+"TD111")
    var TD211 = this.shadowRoot.getElementById(this.id+"TD211")
    var TD311 = this.shadowRoot.getElementById(this.id+"TD311")
    var TD411 = this.shadowRoot.getElementById(this.id+"TD411")
    var TD511 = this.shadowRoot.getElementById(this.id+"TD511")
    var TD611 = this.shadowRoot.getElementById(this.id+"TD611")
    var TD20 = this.shadowRoot.getElementById(this.id+"TD20")
    var TD21 = this.shadowRoot.getElementById(this.id+"TD21")
    var TD30 = this.shadowRoot.getElementById(this.id+"TD30")
    var TD31 = this.shadowRoot.getElementById(this.id+"TD31")
    var TD40 = this.shadowRoot.getElementById(this.id+"TD40")
    var TD41 = this.shadowRoot.getElementById(this.id+"TD41")
    var TD50 = this.shadowRoot.getElementById(this.id+"TD50")
    var TD51 = this.shadowRoot.getElementById(this.id+"TD51")
    var TD60 = this.shadowRoot.getElementById(this.id+"TD60")
    var TD61 = this.shadowRoot.getElementById(this.id+"TD61")
    var TD70 = this.shadowRoot.getElementById(this.id+"TD70")
    var DAY0 = this.shadowRoot.getElementById(this.id+"DAY0");
    var DAY1 = this.shadowRoot.getElementById(this.id+"DAY1");
    var DAY2 = this.shadowRoot.getElementById(this.id+"DAY2");
    var DAY3 = this.shadowRoot.getElementById(this.id+"DAY3");
    var DAY4 = this.shadowRoot.getElementById(this.id+"DAY4");
    var DAY5 = this.shadowRoot.getElementById(this.id+"DAY5");
    var DAY6 = this.shadowRoot.getElementById(this.id+"DAY6");
    var DAY7 = this.shadowRoot.getElementById(this.id+"DAY7");

    var posMonth = 0;
    if (month_label) {
      if (TR00) { 
        if (this.Month0 != this.Month1) {
          posMonth = 1;
          TR00.style.display = "none";
          TR01.style.removeProperty('display');
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.display = "none";
          TD10.innerHTML = this.Month0;
          TD11.innerHTML = this.Month1;
          if (this.Month6 != this.Month7) {
            if (TD111) TD111.innerHTML = this.Month7;
            if (TD111) TD111.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD111) TD111.innerHTML = "";
            if (TD111) TD111.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.borderRight = "solid rgb(128, 128, 128)";
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        } else if (this.Month1 != this.Month2) {
          posMonth = 2;
          TR00.style.display = "none";
          TR01.style.display = "none";
          TR02.style.removeProperty('display');
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.display = "none";
          TD20.innerHTML = this.Month1;
          TD21.innerHTML = this.Month2;
          if (this.Month2 != this.Month7) {
            if (TD211) TD211.innerHTML = this.Month7;
            if (TD211) TD211.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD211) TD211.innerHTML = "";
            if (TD211) TD211.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.removeProperty("border-right");
          DAY1.style.borderRight = "solid rgb(128, 128, 128)";
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        } else if (this.Month2 != this.Month3) {
          posMonth = 3;
          TR00.style.display = "none";
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.removeProperty('display');
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.display = "none";
          TD30.innerHTML = this.Month2;
          TD31.innerHTML = this.Month3;
          if (this.Month3 != this.Month7) {
            if (TD311) TD311.innerHTML = this.Month7;
            if (TD311) TD311.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD311) TD311.innerHTML = "";
            if (TD311) TD311.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.borderRight = "solid rgb(128, 128, 128)";
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        } else if (this.Month3 != this.Month4) {
          posMonth = 4;
          TR00.style.display = "none";
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.removeProperty('display');
          TR05.style.display = "none";
          TR06.style.display = "none";
          TD40.innerHTML = this.Month3;
          TD41.innerHTML = this.Month4;
          if (this.Month4 != this.Month7) {
            if (TD411) TD411.innerHTML = this.Month7;
            if (TD411) TD411.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD411) TD411.innerHTML = "";
            if (TD411) TD411.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.borderRight = "solid rgb(128, 128, 128)";
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        } else if (this.Month4 != this.Month5) {
          posMonth = 5;
          TR00.style.display = "none";
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.removeProperty('display');
          TR06.style.display = "none";
          TD50.innerHTML = this.Month4;
          TD51.innerHTML = this.Month5;
          if (this.Month5 != this.Month7) {
            if (TD511) TD511.innerHTML = this.Month7;
            if (TD511) TD511.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD511) TD511.innerHTML = "";
            if (TD511) TD511.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.borderRight = "solid rgb(128, 128, 128)";
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        } else if (this.Month5 != this.Month6) {
          posMonth = 6;
          TR00.style.display = "none";
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.removeProperty('display');
          TD60.innerHTML = this.Month5;
          TD61.innerHTML = this.Month6;
          if (this.Month6 != this.Month7) {
            if (TD611) TD611.innerHTML = this.Month7;
            if (TD611) TD611.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else { 
            if (TD611) TD611.innerHTML = "";
            if (TD611) TD611.style.removeProperty("border-left");
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          //else TD611.style.removeProperty("border-left");
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.borderRight = "solid rgb(128, 128, 128)";
          DAY6.style.removeProperty("border-right");
        } else if (this.Month6 != this.MonthNOW) {
          posMonth = 0;
          TR00.style.removeProperty('display');
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.display = "none";
          TD00.innerHTML = this.Month6;
          if (this.Month6 != this.Month7) if (TD011) TD011.innerHTML = this.Month7;
          //else TD011.style.removeProperty("border-left");
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
          if (TD011) TD011.style.borderLeft = "solid rgb(128, 128, 128)";
          if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
        } else if (this.MonthNOW == this.Month0) {
          posMonth = 0;
          TR00.style.removeProperty('display');
          TR01.style.display = "none";
          TR02.style.display = "none";
          TR03.style.display = "none";
          TR04.style.display = "none";
          TR05.style.display = "none";
          TR06.style.display = "none";
          //TR07.style.removeProperty('display');
          TD00.innerHTML = this.Month0;
          if (this.Month7 != this.MonthNOW) {
            if (TD011) TD011.innerHTML = this.Month7;
            if (TD011) TD011.style.borderLeft = "solid rgb(128, 128, 128)";
            if (DAY7) DAY7.style.borderLeft = "solid rgb(128, 128, 128)";
          } else {
            if (TD011) TD011.style.removeProperty("border-left");
            if (TD011) TD011.innerHTML = "";
            if (DAY7) DAY7.style.removeProperty("border-left");
          }
          DAY0.style.removeProperty("border-right");
          DAY1.style.removeProperty("border-right");
          DAY2.style.removeProperty("border-right");
          DAY3.style.removeProperty("border-right");
          DAY4.style.removeProperty("border-right");
          DAY5.style.removeProperty("border-right");
          DAY6.style.removeProperty("border-right");
        }
      }
    }


    if (day_forecast)
      return html`<tr id="${this.id}TR00" style="display:none"><td></td><td colspan="7" id="${this.id}TD00" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug1</td><td colspan="1" id="${this.id}TD011" style="white-space: nowrap;text-align:center;vertical-align:middle;border-left:solid rgb(128, 128, 128);${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR01" style="display:none"><td></td><td colspan="1" id="${this.id}TD10" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="6" id="${this.id}TD11" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD111" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR02" style="display:none"><td></td><td colspan="2" id="${this.id}TD20" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="5" id="${this.id}TD21" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD211" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR03" style="display:none"><td></td><td colspan="3" id="${this.id}TD30" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="4" id="${this.id}TD31" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD311" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR04" style="display:none"><td></td><td colspan="4" id="${this.id}TD40" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="3" id="${this.id}TD41" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD411" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR05" style="display:none"><td></td><td colspan="5" id="${this.id}TD50" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="2" id="${this.id}TD51" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD511" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>
    <tr id="${this.id}TR06" style="display:none"><td></td><td colspan="6" id="${this.id}TD60" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="1" id="${this.id}TD61" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td><td colspan="1" id="${this.id}TD611" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_left}${border_top}"></td></tr>`;
    return html`<tr id="${this.id}TR00" style="display:none"><td></td><td colspan="7" id="${this.id}TD00" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug1</td></tr>
    <tr id="${this.id}TR01" style="display:none"><td></td><td colspan="1" id="${this.id}TD10" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="6" id="${this.id}TD11" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>
    <tr id="${this.id}TR02" style="display:none"><td></td><td colspan="2" id="${this.id}TD20" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="5" id="${this.id}TD21" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>
    <tr id="${this.id}TR03" style="display:none"><td></td><td colspan="3" id="${this.id}TD30" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="4" id="${this.id}TD31" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>
    <tr id="${this.id}TR04" style="display:none"><td></td><td colspan="4" id="${this.id}TD40" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="3" id="${this.id}TD41" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>
    <tr id="${this.id}TR05" style="display:none"><td></td><td colspan="5" id="${this.id}TD50" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="2" id="${this.id}TD51" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>
    <tr id="${this.id}TR06" style="display:none"><td></td><td colspan="6" id="${this.id}TD60" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu</td><td colspan="1" id="${this.id}TD61" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_top}">Lug</td></tr>`;
    //<tr id="${this.id}TR07" style="display:none"><td></td><td colspan="7" id="${this.id}TD70" style="white-space: nowrap;text-align:center;vertical-align:middle;${border_right}${border_top}">Giu2</td></tr>`;
  }

  getFootTable() {
    var footer = false;
    if (this.config.footer !== undefined) footer = this.config.footer;
    var FootTable = this.shadowRoot.getElementById(this.id+"FootTable")
    var BR = this.shadowRoot.getElementById(this.id+"BR")
    if (FootTable && footer) {
      FootTable.style.removeProperty('display');
    } else {
      if (BR) BR.style.display = "none";
    }

    return html`<span id="${this.id}FootTable" style="display:none;white-space:nowrap;text-align:right;float:right">
  	        Min: <span id="${this.id}Min"></span>, Max:<span id="${this.id}Max"></span>, Avg:<span id="${this.id}Mean">
    </span>`;
  }

  tempToRGB(temp) {
    if (isNaN(Math.round(temp))) return "808080";
    if (temp == -999) return "808080";
    var minimum = -5;
    var maximum = 35;
    var humidity = false;
    var fahrenheit = false;

    if (this.config.force_fahrenheit !== undefined) fahrenheit = this.config.force_fahrenheit;
    //if (this.config.humidity !== undefined) humidity = this.config.humidity;
    const entityId = this.config.entity;
    const consumerAttributes = this.myhass.states[this.config.entity].attributes;
    if (consumerAttributes.device_class == "humidity") humidity = true;
    if (consumerAttributes.unit_of_measurement == "F") fahrenheit = true;
    if (fahrenheit) {
       temp = (temp - 32) * 5 / 9;
    }
    if (humidity) {
       if (temp <= 58) return "009f60";
       temp = 100 - temp;
       minimum = 20;
       maximum = 90;
    }
    if (!humidity && Math.round(temp) >= 37) return "ff006a";
    if (!humidity && Math.round(temp) < -5) {
       var temp_rgb = parseInt(parseInt(Math.abs(Math.round(temp) - 4)) * 7.5);
       if (temp_rgb > 255) temp_rgb = 255;
       return temp_rgb.toString(16).padStart(2, '0') + "00ff";
    }
    var valTemp = temp;
    if (valTemp < minimum) valTemp = minimum;
    if (valTemp > maximum) valTemp = maximum;
    var _ratio = 2 * (valTemp-minimum) / (maximum - minimum);
    var b = parseInt(Math.max(0, 255*(1-_ratio)));
    var r = parseInt(Math.max(0, 255*(_ratio-1)));
    var g = 255 - b - r;
    return r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }

  tempToLabel(temp) {
    if (temp == -999) return "";
    else if (isNaN(temp)) return ""
    else return temp;
  }

  refreshRender() {
      if (this.responseComplete < 3) return;
      this.render();
  }

  render() {
      var day_forecast = "";
      if (this.config.day_forecast !== undefined) day_forecast = this.config.day_forecast;
        // We may be trying to render before we've received the recorder data.
      var gridHTML = "";
      var grid7 = [[-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999],
                   [-999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999, -999]]
    if (this.grid === undefined) gridHTML = "";
    else {
      var i;
      for (i=0; i<this.grid.length; i++) {
        var j = 0;
        if (this.grid[i].date == this.Day0) j = 0;
        if (this.grid[i].date == this.Day1) j = 1;
        if (this.grid[i].date == this.Day2) j = 2;
        if (this.grid[i].date == this.Day3) j = 3;
        if (this.grid[i].date == this.Day4) j = 4;
        if (this.grid[i].date == this.Day5) j = 5;
        if (this.grid[i].date == this.Day6) j = 6;
        var arrTemp = String(this.grid[i].vals).split(",");
        if (arrTemp[0] == "") arrTemp[0] = 0;
        if (arrTemp[1] == "") arrTemp[1] = 0;
        if (arrTemp[2] == "") arrTemp[2] = 0;
        if (arrTemp[3] == "") arrTemp[3] = 0;
        if (arrTemp[4] == "") arrTemp[4] = 0;
        if (arrTemp[5] == "") arrTemp[5] = 0;
        if (arrTemp[6] == "") arrTemp[6] = 0;
        if (arrTemp[7] == "") arrTemp[7] = 0;
        if (arrTemp[8] == "") arrTemp[8] = 0;
        if (arrTemp[9] == "") arrTemp[9] = 0;
        if (arrTemp[10] == "") arrTemp[10] = 0;
        if (arrTemp[11] == "") arrTemp[11] = 0;
        if (arrTemp[12] == "") arrTemp[12] = 0;
        if (arrTemp[13] == "") arrTemp[13] = 0;
        if (arrTemp[14] == "") arrTemp[14] = 0;
        if (arrTemp[15] == "") arrTemp[15] = 0;
        if (arrTemp[16] == "") arrTemp[16] = 0;
        if (arrTemp[17] == "") arrTemp[17] = 0;
        if (arrTemp[18] == "") arrTemp[18] = 0;
        if (arrTemp[19] == "") arrTemp[19] = 0;
        if (arrTemp[20] == "") arrTemp[20] = 0;
        if (arrTemp[21] == "") arrTemp[21] = 0;
        if (arrTemp[22] == "") arrTemp[22] = 0;
        if (arrTemp[23] == "") arrTemp[23] = 0;
        var hour00 = ((parseFloat(arrTemp[0]) + parseFloat(arrTemp[1]))/2);
        var hour02 = ((parseFloat(arrTemp[2]) + parseFloat(arrTemp[3]))/2);
        var hour04 = ((parseFloat(arrTemp[4]) + parseFloat(arrTemp[5]))/2);
        var hour06 = ((parseFloat(arrTemp[6]) + parseFloat(arrTemp[7]))/2);
        var hour08 = ((parseFloat(arrTemp[8]) + parseFloat(arrTemp[9]))/2);
        var hour10 = ((parseFloat(arrTemp[10]) + parseFloat(arrTemp[11]))/2);
        var hour12 = ((parseFloat(arrTemp[12]) + parseFloat(arrTemp[13]))/2);
        var hour14 = ((parseFloat(arrTemp[14]) + parseFloat(arrTemp[15]))/2);
        var hour16 = ((parseFloat(arrTemp[16]) + parseFloat(arrTemp[17]))/2);
        var hour18 = ((parseFloat(arrTemp[18]) + parseFloat(arrTemp[19]))/2);
        var hour20 = ((parseFloat(arrTemp[20]) + parseFloat(arrTemp[21]))/2);
        var hour22 = ((parseFloat(arrTemp[22]) + parseFloat(arrTemp[23]))/2);
        grid7[j][0] = hour00;
        grid7[j][1] = hour02;
        grid7[j][2] = hour04;
        grid7[j][3] = hour06;
        grid7[j][4] = hour08;
        grid7[j][5] = hour10;
        grid7[j][6] = hour12;
        grid7[j][7] = hour14;
        grid7[j][8] = hour16;
        grid7[j][9] = hour18;
        grid7[j][10] = hour20;
        grid7[j][11] = hour22;
      }

      if (this.gridForecast) {
        var jj;
        for (jj=0; jj<12; jj++) 
          if (this.gridForecast && this.gridForecast[6][jj] != -999 && isNaN(grid7[6][jj])) grid7[6][jj] = this.gridForecast[6][jj];
        for (jj=0; jj<12; jj++) 
          if (this.gridForecast && this.gridForecast[7][jj] != -999 && grid7[7][jj] == -999) grid7[7][jj] = this.gridForecast[7][jj];
      }
      if (this.lastHour !== undefined) {
           if (this.lastTime == "00") i = 0;
           if (this.lastTime == "01") i = 0;
           if (this.lastTime == "02") i = 1;
           if (this.lastTime == "03") i = 1;
           if (this.lastTime == "04") i = 2;
           if (this.lastTime == "05") i = 2;
           if (this.lastTime == "06") i = 3;
           if (this.lastTime == "07") i = 3;
           if (this.lastTime == "08") i = 4;
           if (this.lastTime == "09") i = 4;
           if (this.lastTime == "10") i = 5;
           if (this.lastTime == "11") i = 5;
           if (this.lastTime == "12") i = 6;
           if (this.lastTime == "13") i = 6;
           if (this.lastTime == "14") i = 7;
           if (this.lastTime == "15") i = 7;
           if (this.lastTime == "16") i = 8;
           if (this.lastTime == "17") i = 8;
           if (this.lastTime == "18") i = 9;
           if (this.lastTime == "19") i = 9;
           if (this.lastTime == "20") i = 10;
           if (this.lastTime == "21") i = 10;
           if (this.lastTime == "22") i = 11;
           if (this.lastTime == "23") i = 11;
           if (this.DayNOW == this.Day6) grid7[6][this.hourIndex] = this.lastHour;
      }
    }
    
    this.replaceFooter();
    this.replaceText("00", grid7[0][0]);
    this.replaceText("10", grid7[1][0]);
    this.replaceText("20", grid7[2][0]);
    this.replaceText("30", grid7[3][0]);
    this.replaceText("40", grid7[4][0]);
    this.replaceText("50", grid7[5][0]);
    this.replaceText("60", grid7[6][0]);
    this.replaceText("01", grid7[0][0]);
    this.replaceText("11", grid7[1][1]);
    this.replaceText("21", grid7[2][1]);
    this.replaceText("31", grid7[3][1]);
    this.replaceText("41", grid7[4][1]);
    this.replaceText("51", grid7[5][1]);
    this.replaceText("61", grid7[6][1]);
    this.replaceText("02", grid7[0][2]);
    this.replaceText("12", grid7[1][2]);
    this.replaceText("22", grid7[2][2]);
    this.replaceText("32", grid7[3][2]);
    this.replaceText("42", grid7[4][2]);
    this.replaceText("52", grid7[5][2]);
    this.replaceText("62", grid7[6][2]);
    this.replaceText("03", grid7[0][3]);
    this.replaceText("13", grid7[1][3]);
    this.replaceText("23", grid7[2][3]);
    this.replaceText("33", grid7[3][3]);
    this.replaceText("43", grid7[4][3]);
    this.replaceText("53", grid7[5][3]);
    this.replaceText("63", grid7[6][3]);
    this.replaceText("04", grid7[0][4]);
    this.replaceText("14", grid7[1][4]);
    this.replaceText("24", grid7[2][4]);
    this.replaceText("34", grid7[3][4]);
    this.replaceText("44", grid7[4][4]);
    this.replaceText("54", grid7[5][4]);
    this.replaceText("64", grid7[6][4]);
    this.replaceText("05", grid7[0][5]);
    this.replaceText("15", grid7[1][5]);
    this.replaceText("25", grid7[2][5]);
    this.replaceText("35", grid7[3][5]);
    this.replaceText("45", grid7[4][5]);
    this.replaceText("55", grid7[5][5]);
    this.replaceText("65", grid7[6][5]);
    this.replaceText("06", grid7[0][6]);
    this.replaceText("16", grid7[1][6]);
    this.replaceText("26", grid7[2][6]);
    this.replaceText("36", grid7[3][6]);
    this.replaceText("46", grid7[4][6]);
    this.replaceText("56", grid7[5][6]);
    this.replaceText("66", grid7[6][6]);
    this.replaceText("07", grid7[0][7]);
    this.replaceText("17", grid7[1][7]);
    this.replaceText("27", grid7[2][7]);
    this.replaceText("37", grid7[3][7]);
    this.replaceText("47", grid7[4][7]);
    this.replaceText("57", grid7[5][7]);
    this.replaceText("67", grid7[6][7]);
    this.replaceText("08", grid7[0][8]);
    this.replaceText("18", grid7[1][8]);
    this.replaceText("28", grid7[2][8]);
    this.replaceText("38", grid7[3][8]);
    this.replaceText("48", grid7[4][8]);
    this.replaceText("58", grid7[5][8]);
    this.replaceText("68", grid7[6][8]);
    this.replaceText("09", grid7[0][9]);
    this.replaceText("19", grid7[1][9]);
    this.replaceText("29", grid7[2][9]);
    this.replaceText("39", grid7[3][9]);
    this.replaceText("49", grid7[4][9]);
    this.replaceText("59", grid7[5][9]);
    this.replaceText("69", grid7[6][9]);
    this.replaceText("0a", grid7[0][10]);
    this.replaceText("1a", grid7[1][10]);
    this.replaceText("2a", grid7[2][10]);
    this.replaceText("3a", grid7[3][10]);
    this.replaceText("4a", grid7[4][10]);
    this.replaceText("5a", grid7[5][10]);
    this.replaceText("6a", grid7[6][10]);
    this.replaceText("0b", grid7[0][11]);
    this.replaceText("1b", grid7[1][11]);
    this.replaceText("2b", grid7[2][11]);
    this.replaceText("3b", grid7[3][11]);
    this.replaceText("4b", grid7[4][11]);
    this.replaceText("5b", grid7[5][11]);
    this.replaceText("6b", grid7[6][11]);
    if (day_forecast && this.lastDay()) {
      this.replaceText("70", grid7[7][0]); //trick
      this.replaceText("71", grid7[7][1]); //trick
      this.replaceText("72", grid7[7][2]); //trick
      this.replaceText("73", grid7[7][3]); //trick
      this.replaceText("74", grid7[7][4]); //trick
      this.replaceText("75", grid7[7][5]); //trick
      this.replaceText("76", grid7[7][6]); //trick
      this.replaceText("77", grid7[7][7]); //trick
      this.replaceText("78", grid7[7][8]); //trick
      this.replaceText("79", grid7[7][9]); //trick
      this.replaceText("7a", grid7[7][10]); //trick
      this.replaceText("7b", grid7[7][11]); //trick
    }
    this.replaceDay(0, this.Day0, this.Day0L);
    this.replaceDay(1, this.Day1, this.Day1L);
    this.replaceDay(2, this.Day2, this.Day2L);
    this.replaceDay(3, this.Day3, this.Day3L);
    this.replaceDay(4, this.Day4, this.Day4L);
    this.replaceDay(5, this.Day5, this.Day5L);
    this.replaceDay(6, this.Day6, this.Day6L);
    if (this.lastDay() && day_forecast) {
      this.replaceDay(7, this.Day7, this.Day7L); //trick
    }
    var rightButton = this.shadowRoot.getElementById(this.id+"rightButton");
    var leftButton = this.shadowRoot.getElementById(this.id+"leftButton");
    var TDDAY0 = this.shadowRoot.getElementById(this.id+"TDDAY0");
    var TDDAY1 = this.shadowRoot.getElementById(this.id+"TDDAY1");
    var TDDAY2 = this.shadowRoot.getElementById(this.id+"TDDAY2");
    var TDDAY3 = this.shadowRoot.getElementById(this.id+"TDDAY3");
    var TDDAY4 = this.shadowRoot.getElementById(this.id+"TDDAY4");
    var TDDAY5 = this.shadowRoot.getElementById(this.id+"TDDAY5");
    var TDDAY6 = this.shadowRoot.getElementById(this.id+"TDDAY6");
    var TDDAY7 = this.shadowRoot.getElementById(this.id+"TDDAY7");
    
    if (rightButton) {
      if ((this.DayNOW == this.Day6) && (this.MonthNOW == this.Month6)) { rightButton.style.display = "none"; }
      else { rightButton.style.removeProperty('display'); }

    }
    if (leftButton) {
      if ((grid7[0][0] == -999 && grid7[0][11] == -999) || (this.dayDizio[this.DayY] === undefined)) { leftButton.style.display = "none"; }
      else { leftButton.style.removeProperty('display'); }
    }

    if (TDDAY0 && day_forecast) {
      if (this.lastDay()) {
        TDDAY0.style.setProperty("min-width", "13px");
        TDDAY1.style.setProperty("min-width", "13px");
        TDDAY2.style.setProperty("min-width", "13px");
        TDDAY3.style.setProperty("min-width", "13px");
        TDDAY4.style.setProperty("min-width", "13px");
        TDDAY5.style.setProperty("min-width", "13px");
        TDDAY6.style.setProperty("min-width", "13px");
        TDDAY7.style.setProperty("min-width", "13px");
      }
    }
  
    this.getBorderCell('td60');
    this.getBorderCell('td61');
    this.getBorderCell('td62');
    this.getBorderCell('td63');
    this.getBorderCell('td64');
    this.getBorderCell('td65');
    this.getBorderCell('td66');
    this.getBorderCell('td67');
    this.getBorderCell('td68');
    this.getBorderCell('td69');
    this.getBorderCell('td6a');
    this.getBorderCell('td6b');

    const stateAttributes = this.myhass.states[this.config.entity].attributes;
    if (stateAttributes.state_class === undefined || stateAttributes.state_class != "measurement") {
      return html`
        <ha-card header="${this.config.title}" id="card">
            <div class="card-content">
                            <p>This entity has a <code>state_class</code> attribute different then measurement.
                            <p>This means that data won't be saved to Long Term Statistics, which
                            we use to drive the heatmap; no results will be shown.</p>
            </div>
        </hd-card>`;
    }

    return html`
        <ha-card header="${this.config.title}" id="card">
            <div class="card-content">
                              <table @click=${e => this.onClickNumber(e)} cellspacing="0" border="0" bordercolor="#f1f1f1" cellpadding="0" style="margin: 0 auto;width:98%" >
      <thead>${this.getHeadTable()}</thead>
      <tbody>
          <tr>                    
              <td width="16%" ></td>
                  <td id="${this.id}TDDAY0" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY0">${this.Day0}</div></td>
                  <td id="${this.id}TDDAY1" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY1">${this.Day1}</div></td>
                  <td id="${this.id}TDDAY2" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY2">${this.Day2}</div></td>
                  <td id="${this.id}TDDAY3" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY3">${this.Day3}</div></td>
                  <td id="${this.id}TDDAY4" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY4">${this.Day4}</div></td>
                  <td id="${this.id}TDDAY5" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY5">${this.Day5}</div></td>
                  <td id="${this.id}TDDAY6" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY6">${this.Day6}</div></td>
                  <td id="${this.id}TDDAY7" width="${this.getWidthTable()}%" style="white-space: nowrap;text-align:center;vertical-align:middle;${this.getWidthCell}"><div id="${this.id}DAY7"></div></td>
          </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>00:00</td>
                          <td id="${this.id}td00" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}00"></div>
                          </td>
                          <td id="${this.id}td10" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}10"></div>
                          </td>
                          <td id="${this.id}td20" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}20"></div>
                          </td>
                          <td id="${this.id}td30" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}30"></div>
                          </td>
                          <td id="${this.id}td40" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}40"></div>
                          </td>
                          <td id="${this.id}td50" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}50"></div>
                          </td>
                          <td id="${this.id}td60" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}60"></div>
                          </td>
                          <td id="${this.id}td70" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}70"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>02:00</td>
                          <td id="${this.id}td01" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}01"></div>
                          </td>
                          <td id="${this.id}td11" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}11"></div>
                          </td>
                          <td id="${this.id}td21" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}21"></div>
                          </td>
                          <td id="${this.id}td31" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}31"></div>
                          </td>
                          <td id="${this.id}td41" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}41"></div>
                          </td>
                          <td id="${this.id}td51" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}51"></div>
                          </td>
                          <td id="${this.id}td61" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}61"></div>
                          </td>
                          <td id="${this.id}td71" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}71"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>04:00</td>
                          <td id="${this.id}td02" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}02"></div>
                          </td>
                          <td id="${this.id}td12" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}12"></div>
                          </td>
                          <td id="${this.id}td22" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}22"></div>
                          </td>
                          <td id="${this.id}td32" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}32"></div>
                          </td>
                          <td id="${this.id}td42" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}42"></div>
                          </td>
                          <td id="${this.id}td52" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}52"></div>
                          </td>
                          <td id="${this.id}td62" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}62"></div>
                          </td>
                          <td id="${this.id}td72" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}72"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>06:00</td>
                          <td id="${this.id}td03" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}03"></div>
                          </td>
                          <td id="${this.id}td13" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}13"></div>
                          </td>
                          <td id="${this.id}td23" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}23"></div>
                          </td>
                          <td id="${this.id}td33" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}33"></div>
                          </td>
                          <td id="${this.id}td43" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}43"></div>
                          </td>
                          <td id="${this.id}td53" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}53"></div>
                          </td>
                          <td id="${this.id}td63" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}63"></div>
                          </td>
                          <td id="${this.id}td73" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}73"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>08:00</td>
                          <td id="${this.id}td04" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}04"></div>
                          </td>
                          <td id="${this.id}td14" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}14"></div>
                          </td>
                          <td id="${this.id}td24" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}24"></div>
                          </td>
                          <td id="${this.id}td34" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}34"></div>
                          </td>
                          <td id="${this.id}td44" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}44"></div>
                          </td>
                          <td id="${this.id}td54" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}54"></div>
                          </td>
                          <td id="${this.id}td64" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}64"></div>
                          </td>
                          <td id="${this.id}td74" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}74"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>10:00</td>
                          <td id="${this.id}td05" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}05"></div>
                          </td>
                          <td id="${this.id}td15" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}15"></div>
                          </td>
                          <td id="${this.id}td25" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}25"></div>
                          </td>
                          <td id="${this.id}td35" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}35"></div>
                          </td>
                          <td id="${this.id}td45" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}45"></div>
                          </td>
                          <td id="${this.id}td55" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}55"></div>
                          </td>
                          <td id="${this.id}td65" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}65"></div>
                          </td>
                          <td id="${this.id}td75" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}75"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>12:00</td>
                          <td id="${this.id}td06" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}06"></div>
                          </td>
                          <td id="${this.id}td16" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}16"></div>
                          </td>
                          <td id="${this.id}td26" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}26"></div>
                          </td>
                          <td id="${this.id}td36" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}36"></div>
                          </td>
                          <td id="${this.id}td46" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}46"></div>
                          </td>
                          <td id="${this.id}td56" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}56"></div>
                          </td>
                          <td id="${this.id}td66" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}66"></div>
                          </td>
                          <td id="${this.id}td76" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}76"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>14:00</td>
                          <td id="${this.id}td07" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}07"></div>
                          </td>
                          <td id="${this.id}td17" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}17"></div>
                          </td>
                          <td id="${this.id}td27" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}27"></div>
                          </td>
                          <td id="${this.id}td37" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}37"></div>
                          </td>
                          <td id="${this.id}td47" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}47"></div>
                          </td>
                          <td id="${this.id}td57" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}57"></div>
                          </td>
                          <td id="${this.id}td67" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}67"></div>
                          </td>
                          <td id="${this.id}td77" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}77"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>16:00</td>
                          <td id="${this.id}td08" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}08"></div>
                          </td>
                          <td id="${this.id}td18" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}18"></div>
                          </td>
                          <td id="${this.id}td28" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}28"></div>
                          </td>
                          <td id="${this.id}td38" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}38"></div>
                          </td>
                          <td id="${this.id}td48" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}48"></div>
                          </td>
                          <td id="${this.id}td58" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}58"></div>
                          </td>
                          <td id="${this.id}td68" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}68"></div>
                          </td>
                          <td id="${this.id}td78" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}78"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>18:00</td>
                          <td id="${this.id}td09" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}09"></div>
                          </td>
                          <td id="${this.id}td19" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}19"></div>
                          </td>
                          <td id="${this.id}td29" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}29"></div>
                          </td>
                          <td id="${this.id}td39" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}39"></div>
                          </td>
                          <td id="${this.id}td49" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}49"></div>
                          </td>
                          <td id="${this.id}td59" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}59"></div>
                          </td>
                          <td id="${this.id}td69" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}69"></div>
                          </td>
                          <td id="${this.id}td79" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}79"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>20:00</td>
                          <td id="${this.id}td0a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}0a"></div>
                          </td>
                          <td id="${this.id}td1a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}1a"></div>
                          </td>
                          <td id="${this.id}td2a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}2a"></div>
                          </td>
                          <td id="${this.id}td3a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}3a"></div>
                          </td>
                          <td id="${this.id}td4a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}4a"></div>
                          </td>
                          <td id="${this.id}td5a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}5a"></div>
                          </td>
                          <td id="${this.id}td6a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}6a"></div>
                          </td>
                          <td id="${this.id}td7a" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}7a"></div>
                          </td>
              </tr>
              <tr><td style='white-space: nowrap;text-align:center;vertical-align:middle;'>22:00</td>
                          <td id="${this.id}td0b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}0b"></div>
                          </td>
                          <td id="${this.id}td1b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}1b"></div>
                          </td>
                          <td id="${this.id}td2b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}2b"></div>
                          </td>
                          <td id="${this.id}td3b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}3b"></div>
                          </td>
                          <td id="${this.id}td4b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}4b"></div>
                          </td>
                          <td id="${this.id}td5b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}5b"></div>
                          </td>
                          <td id="${this.id}td6b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}6b"></div>
                          </td>
                          <td id="${this.id}td7b" style="background-color:#808080;color:#ffffff;white-space: nowrap;text-align:center;vertical-align:middle;">
                              <div id="${this.id}7b"></div>
                          </td>
              </tr>
           </tbody>
        </table>
         <table cellspacing="0" cellpadding="0" style="margin: 0 auto;width:98%" >
           </tbody>
              <tr>
                   <td width="16%"></td>
                   <td width="10%" style="white-space:nowrap;">
		      <ha-icon style="display:none;color:#7d8db8" class="ha-icon-big" id="${this.id}leftButton" icon='mdi:chevron-left-box-outline' @click=${e => this.onClickLeft(e, 1)}></ha-icon>
                   </td>
                   <td width="58%"></td>
                   <td width="10%" style="white-space:nowrap;">
		      <ha-icon style="display:none;color:#7d8db8" class="ha-icon-big" id="${this.id}rightButton" icon='mdi:chevron-right-box-outline' @click=${e => this.onClickRight(e, 1)}></ha-icon>
                   </td>
                   <td width="6%"></td>
              </tr>
         </tbody>
       </table>
        ${this.getFootTable()}
       <br id="${this.id}BR">
  </div>
  </ha-card>`;
    //<div style="height:50px;float:right;padding-right:30px;">
  }

  loaderFailed(error) {
        console.log("In Errore!!!!!");
        console.log(error);
  }

  loaderResponse(recorderResponse) {
        var customtable = JSON.stringify(recorderResponse);
        //this.grid = customtable;
        var consumers = [this.config.entity];
        var grid = [];
        for (const consumer of consumers) {
            const consumerData = recorderResponse[consumer];
            var gridTemp = [];
            var prevDate = null;
            var hour;
            for (const entry of consumerData) {
                const start = new Date(entry.start);
                hour = start.getHours();
                const dateRep = start.toLocaleDateString("en-EN", {day: '2-digit'});

                if (dateRep !== prevDate && prevDate !== null) {
                    gridTemp = Array(24).fill(null);
                    grid.push({'date': dateRep, 'nativeDate': start, 'vals': gridTemp});
                }
                if (entry.mean) gridTemp[hour] = entry.mean;
                prevDate = dateRep;
            }
            gridTemp.splice(hour + 1);
            this.grid = grid;
        }
        this.refreshRender();
  }

  loaderResponseMin(recorderResponse) {
        var customtable = JSON.stringify(recorderResponse);
        //this.grid = customtable;
        var consumers = [this.config.entity];
        var grid = [];
        var min = 9999;
        var max = -9999;
        var mean = 0;
        var entryCount = 0;
        for (const consumer of consumers) {
            const consumerData = recorderResponse[consumer];
            for (const entry of consumerData) {
                const start = new Date(entry.start);
                const dateRep = start.toLocaleDateString("en-EN", {day: '2-digit'});
                this.dayDizio[parseInt(dateRep)] = entry.mean;
                if (entry.min < min) min = entry.min;
                if (entry.max > max) max = entry.max;
                mean = mean + entry.mean
                entryCount = entryCount + 1;
            }
        }
        if (entryCount > 0) {
            mean = mean / entryCount;
            this.min = parseFloat(min).toFixed(2);;
            this.max = parseFloat(max).toFixed(2);
            this.mean = parseFloat(mean).toFixed(2);
        }
        this.responseComplete = this.responseComplete + 1;
        this.refreshRender();
  }

  loaderResponsePartial(recorderResponse) {
        var customtable = JSON.stringify(recorderResponse);
        var consumers = [this.config.entity];
        var mean = 0;
        var entryCount = 0;
        var dateRepOld = 0;
        for (const consumer of consumers) {
            const consumerData = recorderResponse[consumer];
            for (const entry of consumerData) {
                const start = new Date(entry.start);
                const dateRep = start.toLocaleDateString("en-EN", {day: '2-digit'});
                //this.dayDizioPartial[parseInt(dateRep)] = entry.mean;
                mean = mean + entry.mean
                entryCount = entryCount + 1;
                if (parseInt(dateRep) != dateRepOld) {
                    dateRepOld = parseInt(dateRep)
                    mean = entry.mean;
                    entryCount = 1;
                }
                this.dayDizioPartial[parseInt(dateRep)] = mean / entryCount;
            }
        }
        this.responseComplete = this.responseComplete + 1;
        this.refreshRender();
  }

  getMonthShortName(monthNo) {
    const date = new Date();
    date.setMonth(parseInt(monthNo), 1);
    var mese = date.toLocaleString([], { month: 'short' });
    return mese[0].toUpperCase() + mese.substring(1);
  }

  getDayShortName(date) {
    var mese = date.toLocaleString([], { weekday: 'short' });
    return mese[0].toUpperCase();
  }

  loaderResponse5(recorderResponse) {
        var customtable = JSON.stringify(recorderResponse);
        //this.grid = customtable;
        var consumers = [this.config.entity];
        var grid = [];
        var lastHour = 0;
        var countHour = 0;
        var lastTime = 0;
        for (const consumer of consumers) {
            const consumerData = recorderResponse[consumer];
            if (consumerData) {
                var gridTemp = [];
                var prevDate = null;
                var hour;
                for (const entry of consumerData) {
                    const start = new Date(entry.start);
                    hour = start.getHours();
                    lastTime = start.toLocaleDateString("en-EN", {day: '2-digit'});
                    lastHour = lastHour + entry.mean;
                    countHour = countHour + 1;
                }
            }
        }
        if (countHour > 0) {
            this.lastHour = lastHour / countHour;
            this.lastTime = lastTime;
        }
        this.responseComplete = this.responseComplete + 1;
        this.refreshRender();
    }

  get_recorder(consumers, days) {
        var shiftDay = this.shiftDay;
        const now = new Date();
        this.grid_status = undefined;
        var startTime = new Date(now - ((days+shiftDay+1) * 86400000))
        startTime.setHours(0, 0, 0);
        var endTime = new Date(now - (shiftDay * 86400000))
        endTime.setHours(23, 59, 0);
        var endTimeYesterday = new Date(now - (1 * 86400000))
        var startTimeYesterday = new Date(now - (1 * 86400000))
        startTimeYesterday.setHours(0, 0, 0);
        endTime.setHours(23, 59, 0);
        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': [this.config.entity],
            "period": "hour",
            "start_time": startTime,
            "end_time": endTime
        }).then(this.loaderResponse.bind(this),
                this.loaderFailed.bind(this));
        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': [this.config.entity],
            "types": [
                "mean",
                "min",
                "max"
            ],
            "period": "day",
            "start_time": startTime,
            "end_time": endTime
        }).then(this.loaderResponseMin.bind(this),
                this.loaderFailed.bind(this));
        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': [this.config.entity],
            "types": [
                "mean"
            ],
            "period": "hour",
            "start_time": startTimeYesterday,
            "end_time": endTimeYesterday
        }).then(this.loaderResponsePartial.bind(this),
                this.loaderFailed.bind(this));
        
        startTime = new Date(now - ((days+shiftDay) * 86400000))
        var hour = startTime.getHours();
        this.DayNOW = new Date(now).getDate();
        this.Day7 = (new Date(now - ((-1) * 86400000))).getDate();
        this.Day6 = (new Date(now - ((0+shiftDay) * 86400000))).getDate();
        this.Day5 = (new Date(now - ((1+shiftDay) * 86400000))).getDate();
        this.Day4 = (new Date(now - ((2+shiftDay) * 86400000))).getDate();
        this.Day3 = (new Date(now - ((3+shiftDay) * 86400000))).getDate();
        this.Day2 = (new Date(now - ((4+shiftDay) * 86400000))).getDate();
        this.Day1 = (new Date(now - ((5+shiftDay) * 86400000))).getDate();
        this.Day0 = (new Date(now - ((6+shiftDay) * 86400000))).getDate();
        this.DayX = (new Date(now - ((7+shiftDay) * 86400000))).getDate();
        this.DayY = (new Date(now - ((8+shiftDay) * 86400000))).getDate();
        this.Day7L = this.getDayShortName((new Date(now - ((-1) * 86400000))));
        this.Day6L = this.getDayShortName((new Date(now - ((0+shiftDay) * 86400000))));
        this.Day5L = this.getDayShortName((new Date(now - ((1+shiftDay) * 86400000))));
        this.Day4L = this.getDayShortName((new Date(now - ((2+shiftDay) * 86400000))));
        this.Day3L = this.getDayShortName((new Date(now - ((3+shiftDay) * 86400000))));
        this.Day2L = this.getDayShortName((new Date(now - ((4+shiftDay) * 86400000))));
        this.Day1L = this.getDayShortName((new Date(now - ((5+shiftDay) * 86400000))));
        this.Day0L = this.getDayShortName((new Date(now - ((6+shiftDay) * 86400000))));
        this.MonthNOW = this.getMonthShortName((new Date(now)).getMonth());
        this.Month7 = this.getMonthShortName(new Date(now - ((-1) * 86400000)).getMonth());
        this.Month6 = this.getMonthShortName(new Date(now - ((0+shiftDay) * 86400000)).getMonth());
        this.Month5 = this.getMonthShortName(new Date(now - ((1+shiftDay) * 86400000)).getMonth());
        this.Month4 = this.getMonthShortName(new Date(now - ((2+shiftDay) * 86400000)).getMonth());
        this.Month3 = this.getMonthShortName(new Date(now - ((3+shiftDay) * 86400000)).getMonth());
        this.Month2 = this.getMonthShortName(new Date(now - ((4+shiftDay) * 86400000)).getMonth());
        this.Month1 = this.getMonthShortName(new Date(now - ((5+shiftDay) * 86400000)).getMonth());
        this.Month0 = this.getMonthShortName(new Date(now - ((6+shiftDay) * 86400000)).getMonth());
        if (hour == 1) hour = 0;
        if (hour == 3) hour = 2;
        if (hour == 5) hour = 4;
        if (hour == 7) hour = 6;
        if (hour == 9) hour = 8;
        if (hour == 11) hour = 10;
        if (hour == 13) hour = 12;
        if (hour == 15) hour = 14;
        if (hour == 17) hour = 16;
        if (hour == 19) hour = 18;
        if (hour == 21) hour = 20;
        if (hour == 23) hour = 22;
        this.hourIndex = parseInt(hour / 2);
        var startTime5 = new Date(now);
        var endTime5 = new Date(now);
        startTime5.setHours(hour, 0, 0);
        endTime5.setHours(23, 55, 0);
        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': [this.config.entity],
            "period": "5minute",
            "start_time": startTime5,
            "end_time": endTime5
        }).then(this.loaderResponse5.bind(this),
                this.loaderFailed.bind(this));
    }

}

customElements.define("temperature-heatmap-card", TemperatureHeatmapCard);


export class TemperatureHeatmapCardEditor extends LitElement {
    static get properties() {
        return {
            _config: {},
            entity: undefined,
            title: undefined,
            temp_adj: undefined,
            month_label: undefined,
            day_label: undefined,
            day_trend: undefined,
            force_fahrenheit: undefined,
            day_forecast: undefined,
            decimal_point: undefined,
            footer: undefined
        };
    }

    set hass(hass) {
        this.myhass = hass;
    }

    async setConfig(config) {
        this._config = config;
        // Ensure that the entity picker element is available to us before we render.
        // https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
        var helpers = await loadCardHelpers();
        if (!customElements.get("ha-entity-picker")) {
            const entities_card = await helpers.createCardElement({type: "entities", entities: []});
            await entities_card.constructor.getConfigElement();
        }

        this.entity = this.myhass.states[this._config.entity];
        this.title = this.myhass.states[this._config.title];
        this.temp_adj = this.myhass.states[this._config.temp_adj];
        this.month_label = this.myhass.states[this._config.month_label];
        this.day_label = this.myhass.states[this._config.day_label];
        this.day_trend = this.myhass.states[this._config.day_trend];
        this.decimal_point = this.myhass.states[this._config.decimal_point];
        this.force_fahrenheit = this.myhass.states[this._config.force_fahrenheit];
        this.day_forecast = this.myhass.states[this._config.day_forecast];
        this.footer = this.myhass.states[this._config.footer];
    }


    render_entity_warning() {
        if (this.entity === undefined) { return; }
        if (this.entity.attributes?.state_class === undefined ||
            ['measurement', 'total', 'total_increasing'].includes(this.entity.attributes?.state_class) === false
            ) {
                return html`
                    <ha-alert
                        .title=${"Warning"}
                        .type=${"warning"}
                        own-margin
                    >
                        <div>
                            <p>This entity has a <code>state_class</code> attribute set to
                            <i>${this.entity.attributes?.state_class ?? 'undefined'}</i>.</p>
                            <p>This means that data won't be saved to Long Term Statistics, which
                            we use to drive the heatmap; no results will be shown.</p>
                        </div>
                    </ha-alert>
                `
        }
    }

    render() {
        if (this.myhass === undefined || this._config === undefined) { return; }

        return html`
        <div class="root card-config">
            <ha-entity-picker
                .required=${true}
                .hass=${this.myhass}
                .value=${this._config.entity}
                .configValue=${"entity"}
                .includeDomains=${"sensor"}
            ></ha-entity-picker>
            ${this.render_entity_warning()}
            <h3>Card elements</h3>
            <ha-textfield
                .label=${"Card title"}
                .placeholder=${(this.entity && this.entity.attributes.friendly_name) || ''}
                .value=${this._config.title || ""}
                .configValue=${"title"}
                @input=${this.update_field}></ha-textfield>
            <h3>Show Month Label</h3>
            <ha-switch
              .checked=${this._config.month_label !== undefined && this._config.month_label !== false} .configValue=${"month_label"} .value=${this._config.month_label}></ha-switch>
            <h3>Show Day Label</h3>
            <ha-switch
              .checked=${this._config.day_label !== undefined && this._config.day_label !== false} .configValue=${"day_label"} .value=${this._config.day_label}></ha-switch>
            <h3>Show Day Trend</h3>
            <ha-switch
              .checked=${this._config.day_trend !== undefined && this._config.day_trend !== false} .configValue=${"day_trend"} .value=${this._config.day_trend}></ha-switch>
            <h3>Show Decimal</h3>
            <ha-switch
              .checked=${this._config.decimal_point !== undefined && this._config.decimal_point !== false} .configValue=${"decimal_point"} .value=${this._config.decimal_point}></ha-switch>
            <h3>Force Fahrenheit</h3>
            <ha-switch
              .checked=${this._config.force_fahrenheit !== undefined && this._config.force_fahrenheit !== false} .configValue=${"force_fahrenheit"} .value=${this._config.force_fahrenheit}></ha-switch>
            <h3>Day Forecast</h3>
            <ha-switch
              .checked=${this._config.day_forecast !== undefined && this._config.day_forecast !== false} .configValue=${"day_forecast"} .value=${this._config.day_forecast}></ha-switch>
            <h3>Weather Forecast</h3>
            <ha-entity-picker
                .required=${false}
                .hass=${this.myhass}
                .value=${this._config.forecast_entity}
                .configValue=${"forecast_entity"}
                .includeDomains=${"weather"}
            ></ha-entity-picker>
            <h3>Forecast Temp Adj</h3>
            <ha-textfield
                .label=${"Forecast Temp Adj"}
                type="number"
                inputmode="numeric"
                step="0.1"
                .value=${this._config.temp_adj || ""}
                .configValue=${"temp_adj"}
                @input=${this.update_field}></ha-textfield>
            <h3>Stat Footer</h3>
            <ha-switch
              .checked=${this._config.footer !== undefined && this._config.footer !== false} .configValue=${"footer"} .value=${this._config.footer}></ha-switch>
         </div>`
                
    }

    /*
        Cribbing the general idea from ha-selector-select.ts here, just
        doing some more manual event work.

        Not very generic and a bit fugly. Works for this particular scenario.

    */
    update_field(ev) {
        ev.stopPropagation();
        const value = ev.target.value;
        if (this.disabled || value === undefined || value === this.value) {
            return;
        }
        const event = new Event('value-changed', { bubbles: true });
        if ('checked' in ev.target) {
            // Is this a checkbox?
            event.detail = {'value': (ev.target.checked === true ? value : 0)};
        } else if (isNaN(parseFloat(value))) {
            // Can't parse as a number? Use verbatim
            event.detail = {'value': value};
        } else {
            event.detail = {'value': parseFloat(value)};
        }
        ev.target.dispatchEvent(event);
    }

    createRenderRoot() {
        const root = super.createRenderRoot();
        root.addEventListener("change", (ev) => {
            ev.stopPropagation();
            const key = ev.target.configValue;
            if (key != "month_label" && key != 'day_label' && key != 'day_trend' && key != 'decimal_point' && key != 'force_fahrenheit' && key != 'day_forecast' && key != 'footer') return;
            const val = ev.target.checked;
            var config = JSON.parse(JSON.stringify(this._config));

            /*
                Figure out what object to update; we're making things a bit hard
                on ourselves by supporting dot notation in the configValue
            */
            var root = config;
            var target = key;
            if (key.indexOf('.')) {
                for (const segment of key.split('.').slice(0, -1)) {
                    if (root[segment] === undefined) {
                        root[segment] = {};
                    }
                    root = root[segment];
                }
                target = key.split('.').slice(-1);
            }
            root[target] = val;

            const event = new Event('config-changed');
            event.detail = {'config': config};
            this.dispatchEvent(event);
        });
        root.addEventListener("value-changed", (ev) => {
            ev.stopPropagation();
            const key = ev.target.configValue;
            const val = ev.detail.value;
            var config = JSON.parse(JSON.stringify(this._config));

            /*
                When updating the entity, set the scale to the class default
                of this entity if it has a class. If so, also zap the device_class
                value from the config if it's set.
            */
            if (key === 'entity') {
                const new_entity = this.myhass.states[val];
            }

            /*
                Figure out what object to update; we're making things a bit hard
                on ourselves by supporting dot notation in the configValue
            */
            var root = config;
            var target = key;
            if (key.indexOf('.')) {
                for (const segment of key.split('.').slice(0, -1)) {
                    if (root[segment] === undefined) {
                        root[segment] = {};
                    }
                    root = root[segment];
                }
                target = key.split('.').slice(-1);
            }
            root[target] = val;

            const event = new Event('config-changed');
            event.detail = {'config': config};
            this.dispatchEvent(event);
        });
        return root;
    }

    /* Copied from ha-form css; used for spacing between combo boxes */
    static styles = css`
        .root > * {
            display: block;
        }
        .root > *:not([own-margin]):not(:last-child) {
            margin-bottom: 24px;
        }
        ha-alert[own-margin] {
            margin-bottom: 4px;
        }


        a:link, a:visited {
            color: var(--primary-color);
        }


        /* Don't mess with the line spacing */
        sup, sub {
            line-height: 0;
        }
    `;
}

customElements.define("temperature-heatmap-card-editor", TemperatureHeatmapCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "temperature-heatmap-card",
  name: "Temperature Heatmap Card",
  preview: false, // Optional - defaults to false
  description: "A cool temperature heatmap card!",
});
