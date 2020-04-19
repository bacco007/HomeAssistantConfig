import "https://unpkg.com/chart.js@v2.9.3/dist/Chart.bundle.min.js?module";
import "https://cdn.jsdelivr.net/npm/chartjs-plugin-colorschemes";

console.info(
  `%cPIE-CHART-CARD\n%cVersion: 0.0.1`,
  "color: white; background: olive; font-weight: bold;",
  "color: olive; background: white; font-weight: bold;",
  ""
);

class PieChartCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define an entity');
    }
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const style = document.createElement('style');

    card.id ='ha-card';
    content.id = 'content';
    canvas.id = 'cnv';
    content.style.height = '480px';
    canvas.height=480;
    card.appendChild(content);
    card.appendChild(style);
    content.appendChild(canvas);
    root.appendChild(card);
    this._config = config;
  }

  set hass(hass) {
    const root = this.shadowRoot;
    const config = this._config;
    const card = root.getElementById("ha-card");
    const content = root.getElementById("content");
    const canvas = root.getElementById("cnv");
    const ctx = canvas.getContext('2d');
    const hassEntities = config.entities.map(x => hass.states[x.entity]);
    
    // If a name is not provided, use the friendly_name for the entity. If the friendly_name
    // does not exist, use the actual entity.
    var entityNames = config.entities.map(x => x.name !== undefined ? x.name : hass.states[x.entity]["attributes"]["friendly_name"] !== undefined ? hass.states[x.entity]["attributes"]["friendly_name"] : x.entity);
    
    // If the entity does not exist, default to 0
    var entityData = hassEntities.map(x => x === undefined ? 0 : x.state);
    card.header = config.title ? config.title : 'Pie Chart';

    if (config.total_amount){
        const totalEntity =  hass.states[config.total_amount]
        var total = 0;
        if (totalEntity !== undefined) {
          total = totalEntity.state;
        } else if (typeof(Number(config.total_amount)) === 'number') {
          total = Number(config.total_amount);
        } else {
          console.log("ERROR: config.total_amount must be either an entity or number.")
        }
        const measured = hassEntities.map(x => Number(x.state)).reduce(( accumulator, currentValue ) => accumulator + currentValue,  0);
        entityData.push(total - measured)
        entityNames.push(config.unknownText ? config.unknownText : 'Unknown');
    }

    const emptyIndexes = entityData.reduce((arr, e, i) => ((e == 0) && arr.push(i), arr), [])
    entityData = entityData.filter((element, index, array) => !emptyIndexes.includes(index));
    entityNames = entityNames.filter((element, index, array) => !emptyIndexes.includes(index));

    const doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            borderWidth: 1,
            borderColor:'#00c0ef',
            label: 'liveCount',
    }]
  },
       options: {
            responsive: true,
            maintainAspectRatio: false, // https://stackoverflow.com/a/53233861,
            animation: { duration: 0 },
            legend: {
                position: 'bottom',
                display: true
             },
            hover: { mode: 'index' },
            plugins: {colorschemes: { scheme: 'brewer.DarkTwo8' } },
            // https://stackoverflow.com/a/49717859
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  var dataset = data.datasets[tooltipItem.datasetIndex];
                  var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                  var total = meta.total;
                  var currentValue = dataset.data[tooltipItem.index];
                  var percentage = parseFloat((currentValue/total*100).toFixed(1));
                  return currentValue + ' (' + percentage + '%)';
                },
                title: function(tooltipItem, data) {
                  return data.labels[tooltipItem[0].index];
                }
              }
            },
        }
    });

  var getData = function() {
    doughnutChart.data =  { datasets: [{ data: entityData }], labels: entityNames };
    doughnutChart.update();
  };
  getData();
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('pie-chart-card', PieChartCard);
