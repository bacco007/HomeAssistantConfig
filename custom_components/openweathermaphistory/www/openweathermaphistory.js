class OpenWeathMapHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  _getAttributes(hass, p_entity) {

	  function _getAttribute(p_attribute) {
		if(hass.states[p_entity].attributes[p_attribute]) {
		  return hass.states[p_entity].attributes[p_attribute];
		} else {
		  return '-';
		}
	  }

    const attributes = new Map();
	attributes.set (`rain`,{
		name: `Rain`,
		value0: _getAttribute('day0rain'),
		value1: _getAttribute('day1rain'),
		value2: _getAttribute('day2rain'),
		value3: _getAttribute('day3rain'),
		value4: _getAttribute('day4rain'),
	})
	attributes.set (`min`,{
		name: `Min Temp`,
		value0: _getAttribute('day0min'),
		value1: _getAttribute('day1min'),
		value2: _getAttribute('day2min'),
		value3: _getAttribute('day3min'),
		value4: _getAttribute('day4min'),
	})
	attributes.set (`max`,{
		name: `Max Temp`,
		value0: _getAttribute('day0max'),
		value1: _getAttribute('day1max'),
		value2: _getAttribute('day2max'),
		value3: _getAttribute('day3max'),
		value4: _getAttribute('day4max'),
	})
    return Array.from(attributes.values());
  }

  setConfig(config) {
    if (!config.entity_id ) {
      throw new Error('Please define entity_id');
    }

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    const card = document.createElement('ha-card');
	this.card = card
    card.header = config.title;
    const content = document.createElement('div');
    const style = document.createElement('style');
    style.textContent = `
      table {
        width: 100%;
        padding: 16px;
      }
      thead th {
        text-align: left;
      }
      tbody tr:nth-child(odd) {
        background-color: var(--paper-card-background-color);
      }
      tbody tr:nth-child(even) {
        background-color: var(--secondary-background-color);
      }
    `;
    content.innerHTML = `
      <ha-card>
		<table>
			<thead>
				<tr>
				<th>${'Day '}</th>
				<th>${'last 24hr'}</th>
				<th>${'2'}</th>
				<th>${'3'}</th>
				<th>${'4'}</th>
				<th>${'5'}</th>
				</tr>
			</thead>
			<tbody id='attributes'>
			</tbody>
		</table>
	  </ha-card>
      `;
    card.appendChild(style);
    card.appendChild(content);
    root.appendChild(card);
    this._config = cardConfig;
  }

  _updateContent(element, attributes) {
    element.innerHTML = `
      <tr>
        ${attributes.map((attribute) => `
          <tr>
            <td>${attribute.name}</td>
            <td>${attribute.value0}</td>
            <td>${attribute.value1}</td>
            <td>${attribute.value2}</td>
            <td>${attribute.value3}</td>
            <td>${attribute.value4}</td>
          </tr>
        `).join('')}
      `;
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;

    let attributes = this._getAttributes(hass, config.entity_id);
    this._updateContent(root.getElementById('attributes'), attributes);
	const state = hass.states[config.entity_id].state
	this.card.header = "Adjustment Factor: " + state;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('open-weather-map-history-card', OpenWeathMapHistoryCard);

window.customCards = window.customCards || [];
window.customCards.push({
	type: "open-weather-map-history-card",
	name: "open-weather-map-history-card",
	preview: true, // Optional - defaults to false
	description: "Custom card companion to Open Weather Map History Custom Component" // Optional
});
