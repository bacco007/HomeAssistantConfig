class HaVisualiserPanel extends HTMLElement {
  constructor() {
    super();
    this.hass = null;
    this.narrow = false;
    this.route = null;
    this.panel = null;
  }

  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }
 
  connectedCallback() {
    console.log('HA Visualiser Panel v0.8.13: Config flow enabled - should install via Settings → Integrations');
    console.log('HA Visualiser Panel: Loading enhanced vis.js version');
    
    // Load vis.js if not already loaded
    this.loadVisJS().then(() => {
      this.initializePanel();
    });
  }
  
  async loadVisJS() {
    return new Promise((resolve) => {
      if (window.vis) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vis-network@latest/dist/vis-network.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  
  // Preference Management
  loadUserPreferences() {
    try {
      const savedShowAreas = localStorage.getItem('ha_visualiser_show_areas');
      const savedDepth = localStorage.getItem('ha_visualiser_depth');
      const savedLayout = localStorage.getItem('ha_visualiser_layout');
      
      return {
        showAreas: savedShowAreas !== null ? savedShowAreas === 'true' : true,
        depth: savedDepth !== null ? parseInt(savedDepth) : 3,
        layout: savedLayout !== null ? savedLayout : 'hierarchical'
      };
    } catch (error) {
      console.warn('HA Visualiser: Error loading user preferences, using defaults:', error);
      return {
        showAreas: true,
        depth: 3,
        layout: 'hierarchical'
      };
    }
  }
  
  saveUserPreferences() {
    try {
      const depthSelect = this.querySelector('#depthSelect');
      const showAreasCheckbox = this.querySelector('#showAreasCheckbox');
      const layoutSelect = this.querySelector('#layoutSelect');
      
      if (depthSelect) {
        localStorage.setItem('ha_visualiser_depth', depthSelect.value);
      }
      if (showAreasCheckbox) {
        localStorage.setItem('ha_visualiser_show_areas', showAreasCheckbox.checked.toString());
      }
      if (layoutSelect) {
        localStorage.setItem('ha_visualiser_layout', layoutSelect.value);
      }
      
      console.log('HA Visualiser: User preferences saved');
    } catch (error) {
      console.warn('HA Visualiser: Error saving user preferences:', error);
    }
  }
  
  applyUserPreferences(preferences) {
    try {
      const depthSelect = this.querySelector('#depthSelect');
      const showAreasCheckbox = this.querySelector('#showAreasCheckbox');
      const layoutSelect = this.querySelector('#layoutSelect');
      
      if (depthSelect && preferences.depth >= 1 && preferences.depth <= 5) {
        depthSelect.value = preferences.depth.toString();
      }
      if (showAreasCheckbox) {
        showAreasCheckbox.checked = preferences.showAreas;
      }
      if (layoutSelect && ['hierarchical', 'force-directed'].includes(preferences.layout)) {
        layoutSelect.value = preferences.layout;
      }
      
      console.log('HA Visualiser: User preferences applied:', preferences);
    } catch (error) {
      console.warn('HA Visualiser: Error applying user preferences:', error);
    }
  }
  
  initializePanel() {
    this.innerHTML = `
      <style>
        .container {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 32px);
        }
        
        .search-section {
          margin-bottom: 24px;
          padding: 16px;
          background: var(--card-background-color);
          border-radius: 8px;
          box-shadow: var(--ha-card-box-shadow);
          display: flex;
          align-items: flex-start;
          gap: 16px;
          min-height: 56px;
        }
        
        .search-container {
          flex: 0 1 70%;
          max-width: 400px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          z-index: 1;
        }
        
        .search-input {
          width: 90%;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          font-size: 16px;
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          height: 40px;
          box-sizing: border-box;
        }
        
        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          max-height: 200px;
          overflow-y: auto;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.15));
          z-index: 2;
        }
        
        .search-result {
          padding: 8px 12px;
          border-bottom: 1px solid var(--divider-color);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .search-result:hover {
          background: var(--secondary-background-color);
        }
        
        .result-info {
          flex: 1;
        }
        
        .result-name {
          font-weight: 500;
          color: var(--primary-text-color);
        }
        
        .result-id {
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        
        .result-state {
          font-size: 12px;
          color: var(--secondary-text-color);
          background: var(--secondary-background-color);
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        .graph-section {
          background: var(--card-background-color);
          border-radius: 8px;
          box-shadow: var(--ha-card-box-shadow);
          flex: 1;
          min-height: 600px;
          position: relative;
        }
        
        .graph-container {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          position: relative;
        }
        
        #visNetwork {
          width: 100%;
          height: 100%;
          border-radius: 8px;
        }
        
        .graph-controls {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 1;
          display: flex;
          gap: 8px;
        }
        
        
        .control-button {
          padding: 8px 12px;
          background: var(--primary-color, #0369a1);
          color: var(--text-primary-color, white);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .control-button:hover {
          background: var(--primary-color, #0369a1);
          opacity: 0.8;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .control-button:active {
          transform: translateY(0);
          opacity: 0.9;
        }
        
        .depth-control {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 140px;
          height: 40px;
        }
        
        .depth-control label {
          margin: 0;
          font-weight: 500;
          color: var(--primary-text-color);
          font-size: 14px;
        }
        
        .depth-control select {
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          min-width: 100px;
          height: 40px;
          box-sizing: border-box;
        }
        
        .filter-control {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 120px;
          height: 40px;
        }
        
        .filter-control label {
          margin: 0;
          font-weight: 500;
          color: var(--primary-text-color);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        
        .filter-control input[type="checkbox"] {
          margin: 0;
          cursor: pointer;
        }
        
        .layout-control {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 160px;
          height: 40px;
        }
        
        .layout-control label {
          margin: 0;
          font-weight: 500;
          color: var(--primary-text-color);
          font-size: 14px;
        }
        
        .layout-control select {
          padding: 8px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--primary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          min-width: 120px;
          height: 40px;
          box-sizing: border-box;
        }
        
        .graph-info {
          position: absolute;
          bottom: 16px;
          left: 16px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--secondary-text-color);
        }
        
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--error-color);
          text-align: center;
        }
      </style>
      
      <div class="container">
        <div class="search-section">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Search for entities..." 
              id="entitySearch"
            />
            <div class="search-results" id="searchResults" style="display: none;"></div>
          </div>
          <div class="depth-control">
            <label for="depthSelect">Depth:</label>
            <select id="depthSelect">
              <option value="1">1 Level</option>
              <option value="2">2 Levels</option>
              <option value="3">3 Levels</option>
              <option value="4">4 Levels</option>
              <option value="5">5 Levels</option>
            </select>
          </div>
          <div class="filter-control">
            <label>
              <input type="checkbox" id="showAreasCheckbox">
              Show Areas
            </label>
          </div>
          <div class="layout-control">
            <label for="layoutSelect">Layout:</label>
            <select id="layoutSelect">
              <option value="hierarchical">Hierarchical</option>
              <option value="force-directed">Force-Directed</option>
            </select>
          </div>
        </div>
        
        <div class="graph-section">
          <div class="graph-container" id="graphContainer">
            <div id="visNetwork"></div>
            <div class="graph-controls">
              <button class="control-button" id="fitBtn">Fit</button>
              <button class="control-button" id="resetBtn">Reset</button>
            </div>
            <div class="graph-info" id="graphInfo">
              Select an entity to see its relationships
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupSearchEventListeners();
    
    // Load and apply saved preferences before setting up controls
    const preferences = this.loadUserPreferences();
    this.applyUserPreferences(preferences);
    
    this.setupDepthControl();
  }

  setupSearchEventListeners() {
    const searchInput = this.querySelector('#entitySearch');
    const searchResults = this.querySelector('#searchResults');
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }
      
      searchTimeout = setTimeout(() => {
        this.searchEntities(query);
      }, 300);
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }

  setupDepthControl() {
    const depthSelect = this.querySelector('#depthSelect');
    const showAreasCheckbox = this.querySelector('#showAreasCheckbox');
    
    if (depthSelect) {
      depthSelect.addEventListener('change', () => {
        // Save preference immediately
        this.saveUserPreferences();
        // If we have a current entity selected, refresh the graph with new depth
        if (this.currentEntityId) {
          this.selectEntity(this.currentEntityId);
        }
      });
    }
    
    if (showAreasCheckbox) {
      showAreasCheckbox.addEventListener('change', () => {
        // Save preference immediately
        this.saveUserPreferences();
        // If we have a current entity selected, refresh the graph with new filter settings
        if (this.currentEntityId) {
          this.selectEntity(this.currentEntityId);
        }
      });
    }
    
    const layoutSelect = this.querySelector('#layoutSelect');
    if (layoutSelect) {
      layoutSelect.addEventListener('change', () => {
        // Save preference immediately
        this.saveUserPreferences();
        // If we have a current entity selected, refresh the graph with new layout
        if (this.currentEntityId) {
          this.selectEntity(this.currentEntityId);
        }
      });
    }
  }

  async searchEntities(query) {
    console.log('HA Visualiser: Searching for entities with query:', query);
    try {
      console.log('HA Visualiser: Calling WebSocket API...');
      const results = await this.hass.callWS({
        type: 'ha_visualiser/search_entities',
        query: query,
        limit: 10
      });
      
      console.log('HA Visualiser: Search successful, results:', results);
      this.displaySearchResults(results);
    } catch (error) {
      console.error('HA Visualiser: Search failed, using fallback:', error);
      // For now, fall back to simple client-side search
      this.fallbackSearch(query);
    }
  }
  
  fallbackSearch(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    Object.keys(this.hass.states).forEach(entityId => {
      const state = this.hass.states[entityId];
      const friendlyName = state.attributes.friendly_name || entityId;
      
      if (entityId.toLowerCase().includes(queryLower) || 
          friendlyName.toLowerCase().includes(queryLower)) {
        results.push({
          entity_id: entityId,
          friendly_name: friendlyName,
          domain: entityId.split('.')[0],
          state: state.state
        });
      }
      
      if (results.length >= 10) return;
    });
    
    this.displaySearchResults(results);
  }

  displaySearchResults(results) {
    const searchResults = this.querySelector('#searchResults');
    
    if (results.length === 0) {
      searchResults.style.display = 'none';
      return;
    }
    
    searchResults.innerHTML = results.map(result => `
      <div class="search-result" data-entity-id="${result.entity_id}">
        <div class="result-info">
          <div class="result-name">${result.friendly_name}</div>
          <div class="result-id">${result.entity_id}</div>
        </div>
        <div class="result-state">${result.state}</div>
      </div>
    `).join('');
    
    searchResults.style.display = 'block';
    
    // Add click handlers
    searchResults.querySelectorAll('.search-result').forEach(result => {
      result.addEventListener('click', () => {
        const entityId = result.dataset.entityId;
        this.selectEntity(entityId);
        searchResults.style.display = 'none';
      });
    });
  }

  async selectEntity(entityId) {
    // Store current entity for depth changes
    this.currentEntityId = entityId;
    
    const graphInfo = this.querySelector('#graphInfo');
    if (graphInfo) {
      graphInfo.textContent = 'Loading graph...';
    }
    
    // Clear the vis network but keep the container structure
    if (this.network) {
      this.network.setData({ nodes: new vis.DataSet(), edges: new vis.DataSet() });
    }
    
    // Get selected depth and filter settings
    const depthSelect = this.querySelector('#depthSelect');
    const showAreasCheckbox = this.querySelector('#showAreasCheckbox');
    const maxDepth = depthSelect ? parseInt(depthSelect.value) : 3;
    const showAreas = showAreasCheckbox ? showAreasCheckbox.checked : true;
    
    try {
      const graphData = await this.hass.callWS({
        type: 'ha_visualiser/get_neighborhood',
        entity_id: entityId,
        max_depth: maxDepth,
        show_areas: showAreas
      });
      
      this.renderGraph(graphData);
    } catch (error) {
      console.error('Failed to load graph:', error);
      
      // Show error in info panel instead of replacing entire container
      if (graphInfo) {
        graphInfo.innerHTML = `<span style="color: red;">Error: Failed to load entity relationships</span>`;
      }
      
      // Optionally show error overlay
      const networkContainer = this.querySelector('#visNetwork');
      if (networkContainer) {
        networkContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
            <div style="text-align: center;">
              <h3>Error Loading Graph</h3>
              <p>Failed to load entity relationships.<br/>Check the console for details.</p>
            </div>
          </div>
        `;
      }
    }
  }

  renderGraph(graphData) {
    console.log('HA Visualiser: Rendering graph with data:', graphData);
    
    // Store graph data for layout handling
    this.currentGraphData = graphData;
    
    if (!window.vis) {
      console.error('HA Visualiser: vis.js not loaded');
      this.showLoadingMessage();
      return;
    }
    
    // Detect if this is a complex graph that might benefit from force-directed layout
    const nodes = graphData.nodes || [];
    const edges = graphData.edges || [];
    const isComplexGraph = false; // Keep consistent with original logic
    
    console.log(`HA Visualiser: Graph analysis - ${nodes.length} nodes, ${edges.length} edges, ratio: ${(edges.length / nodes.length).toFixed(2)}, using ${isComplexGraph ? 'force-directed' : 'hierarchical'} layout`);
    
    const networkContainer = this.querySelector('#visNetwork');
    const graphInfo = this.querySelector('#graphInfo');
    
    if (!networkContainer) {
      console.error('HA Visualiser: Network container not found. Available containers:', 
        Array.from(this.querySelectorAll('div')).map(div => div.id || div.className));
      
      // Try to recreate the structure
      this.ensureGraphStructure();
      
      // Try again
      const retryContainer = this.querySelector('#visNetwork');
      if (!retryContainer) {
        console.error('HA Visualiser: Failed to create network container');
        return;
      }
    }
    
    // Prepare vis.js data (nodes and edges already declared above)
    const visNodes = new vis.DataSet(nodes.map(node => {
      const isFocusNode = node.id === graphData.center_node;
      const iconHtml = this.getMdiIconHtml(node.icon, node.domain);
      const backgroundColor = isFocusNode ? this.getFocusNodeColor(node.domain) : this.getNodeColor(node.domain);
      
      return {
        id: node.id,
        label: `${iconHtml} | ${node.label}`,
        title: this.createNodeTooltip(node),
        shape: this.getNodeShape(node.domain),
        color: {
          background: backgroundColor,
          border: isFocusNode ? '#999' : '#D0D0D0',
          highlight: {
            background: backgroundColor,
            border: '#999'
          }
        },
        font: { 
          size: isFocusNode ? 14 : 12, 
          color: '#333',
          bold: isFocusNode
        },
        borderWidth: isFocusNode ? 3 : 1,
        shadow: false,
        margin: 8
      };
    }));
    
    // Bundle multiple relationships between the same nodes
    const bundledEdges = this.bundleMultipleRelationships(edges);
    
    const visEdges = new vis.DataSet(bundledEdges.map(edge => ({
      from: edge.from_node,
      to: edge.to_node,
      label: edge.label,
      title: edge.title,
      arrows: 'to',
      color: this.getEdgeColor(edge.relationship_type),
      width: edge.width || 2
    })));
    
    const data = { nodes: visNodes, edges: visEdges };

    // Use layout selector to determine layout options
    const layoutSelector = this.querySelector('#layoutSelect');
    const selectedLayout = layoutSelector ? layoutSelector.value : 'hierarchical';
    
    const layoutOptions = this.currentLayoutOptions ? this.currentLayoutOptions : this.getLayoutOptions(selectedLayout);

    // Use appropriate physics for the layout type
    const effectiveLayoutType = this.currentLayoutOptions && this.currentLayoutOptions.hierarchical && this.currentLayoutOptions.hierarchical.enabled 
      ? 'hierarchical' 
      : selectedLayout;
    const physicsOptions = this.getPhysicsOptions(effectiveLayoutType);
    
    const options = {
      layout: layoutOptions,
      physics: physicsOptions,
      interaction: {
        hover: true,
        tooltipDelay: 200,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false
      },
      nodes: {
        borderWidth: 1,
        shadow: false,
        font: { 
          size: 12,
          color: '#333'
        },
        shape: 'box',
        margin: 8,
        color: {
          border: '#D0D0D0'
        },
        chosen: {
          node: function(values, id, selected, hovering) {
            values.borderColor = '#999';
            values.borderWidth = 2;
          }
        }
      },
      edges: {
        width: 1.5,
        shadow: false,
        smooth: {
          type: 'cubicBezier',           // Better curve algorithm
          roundness: 0.6,                // More pronounced curves
          forceDirection: 'vertical'     // Help with hierarchical layout
        },
        color: {
          color: '#D0D0D0',
          highlight: '#999',
          hover: '#999'
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8,
            type: 'arrow'
          }
        },
        length: 200                      // Preferred edge length
      }
    };
    
    // Create or update the network
    if (this.network) {
      this.network.destroy();
    }
    
    
    this.network = new vis.Network(networkContainer, data, options);
    
    // Optimize layout after stabilization
    this.network.on('stabilizationIterationsDone', () => {
      console.log('HA Visualiser: Layout stabilized, disabling physics for performance');
      this.network.setOptions({
        physics: { enabled: false }
      });
    });
    
    // Add event listeners with proper single/double-click handling
    let clickTimeout = null;
    let isDoubleClick = false;
    
    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        
        // Clear any existing timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        
        // If this is part of a double-click, don't process as single click
        if (isDoubleClick) {
          isDoubleClick = false;
          return;
        }
        
        // Set a timeout to handle single click after double-click delay
        clickTimeout = setTimeout(() => {
          // Single click - open entity dialog
          this.openEntityDialog(nodeId);
          clickTimeout = null;
        }, 300); // 300ms delay to detect double-clicks
      }
    });
    
    this.network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        
        // Mark as double-click to prevent single-click action
        isDoubleClick = true;
        
        // Clear the single-click timeout
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        
        // Double-click - navigate to entity's neighborhood
        this.onNodeClick(nodeId);
      }
    });
    
    this.network.on('hoverNode', (params) => {
      const node = nodes.find(n => n.id === params.node);
      if (node) {
        graphInfo.textContent = `${node.label} (${node.domain})${node.area ? ' - ' + node.area : ''}`;
      }
    });
    
    this.network.on('blurNode', () => {
      const depthSelect = this.querySelector('#depthSelect');
      const currentDepth = depthSelect ? depthSelect.value : '3';
      graphInfo.textContent = `${nodes.length} entities, ${edges.length} relationships (${currentDepth} levels)`;
    });
    
    // Setup control buttons
    this.setupGraphControls();
    
    // Update info
    const depthSelect = this.querySelector('#depthSelect');
    const currentDepth = depthSelect ? depthSelect.value : '3';
    graphInfo.textContent = `${nodes.length} entities, ${edges.length} relationships (${currentDepth} levels)`;
    
    console.log('HA Visualiser: Graph rendered successfully');
  }
  
  
  
  
  showLoadingMessage() {
    const graphContainer = this.querySelector('#graphContainer');
    if (graphContainer) {
      graphContainer.innerHTML = `
        <div class="loading">
          <div>Loading vis.js library...</div>
        </div>
      `;
    }
  }
  
  ensureGraphStructure() {
    console.log('HA Visualiser: Ensuring graph structure exists');
    const graphContainer = this.querySelector('#graphContainer');
    
    if (graphContainer && !this.querySelector('#visNetwork')) {
      console.log('HA Visualiser: Recreating graph structure');
      graphContainer.innerHTML = `
        <div id="visNetwork"></div>
        <div class="graph-controls">
          <button class="control-button" id="fitBtn">Fit</button>
          <button class="control-button" id="resetBtn">Reset</button>
        </div>
        <div class="graph-info" id="graphInfo">
          Select an entity to see its relationships
        </div>
      `;
      
      // Re-setup control buttons
      this.setupGraphControls();
    }
  }
  
  createNodeTooltip(node) {
    let tooltip = `<strong>${node.label}</strong><br/>`;
    
    if (node.domain === 'device') {
      tooltip += `Type: Device<br/>`;
      tooltip += `ID: ${node.device_id}<br/>`;
      if (node.area) tooltip += `Area: ${node.area}<br/>`;
      tooltip += `Status: ${node.state}<br/>`;
      tooltip += `<hr>Double-click to explore entities`;
    } else if (node.domain === 'label') {
      tooltip += `Type: Label<br/>`;
      tooltip += `ID: ${node.id}<br/>`;
      tooltip += `Usage: ${node.state}<br/>`;
      tooltip += `<hr>Double-click to see labelled items`;
    } else if (node.id && node.id.includes('.') && !node.id.startsWith('area:') && !node.id.startsWith('zone:')) {
      // This is an actual entity
      tooltip += `ID: ${node.id}<br/>`;
      tooltip += `Domain: ${node.domain}<br/>`;
      if (node.area) tooltip += `Area: ${node.area}<br/>`;
      if (node.state) tooltip += `State: ${node.state}<br/>`;
      if (node.device_id) tooltip += `Device: ${node.device_id}<br/>`;
      tooltip += `<hr>Click: Open entity dialog<br/>Double-click: Explore relationships`;
    } else {
      // This is area, zone, or other special node
      tooltip += `ID: ${node.id}<br/>`;
      tooltip += `Domain: ${node.domain}<br/>`;
      if (node.area) tooltip += `Area: ${node.area}<br/>`;
      if (node.state) tooltip += `State: ${node.state}<br/>`;
      if (node.device_id) tooltip += `Device: ${node.device_id}<br/>`;
      tooltip += `<hr>Double-click to explore relationships`;
    }
    
    return tooltip;
  }
  
  getNodeShape(domain) {
    // Use consistent rounded box shape for all nodes
    return 'box';
  }
  
  getNodeColor(domain) {
    // Light, subtle color palette
    const colors = {
      'light': '#F5F5F5',        // Light grey
      'switch': '#F0F4F8',       // Very light blue
      'sensor': '#F7F9FC',       // Very light blue-grey
      'automation': '#FDF4FF',   // Very light purple
      'script': '#FFF5F5',       // Very light red
      'scene': '#FFFDF0',        // Very light yellow
      'input_boolean': '#F0FDFF', // Very light cyan
      'input_number': '#F5F3FF',  // Very light indigo
      'binary_sensor': '#F8F9FA', // Light grey
      'device_tracker': '#FFF8F0', // Very light orange
      'device': '#F6F6F6',       // Light grey
      'area': '#F0F8F0',         // Very light green
      'zone': '#F0FDFD',         // Very light teal
      'label': '#FFF8DC',        // Very light yellow (cornsilk)
      'media_player': '#FFF0F8',  // Very light pink
      'number': '#F8F5FF',       // Very light violet
      'todo': '#F5FFF0',         // Very light lime
      'group': '#F8F8FF'         // Very light lavender
    };
    return colors[domain] || '#F8F9FA';
  }
  
  getFocusNodeColor(domain) {
    // Slightly more prominent but still subtle colors for the focus node
    const focusColors = {
      'light': '#E8E8E8',        // Slightly darker grey
      'switch': '#E1EBF0',       // Slightly darker light blue
      'sensor': '#EDF2F7',       // Slightly darker blue-grey
      'automation': '#F4E6FF',   // Slightly darker light purple
      'script': '#FFE8E8',       // Slightly darker light red
      'scene': '#FFF8E1',        // Slightly darker light yellow
      'input_boolean': '#E1F8FF', // Slightly darker light cyan
      'input_number': '#E8E1FF',  // Slightly darker light indigo
      'binary_sensor': '#F0F1F2', // Slightly darker grey
      'device_tracker': '#FFE8D6', // Slightly darker light orange
      'device': '#E8E8E8',       // Slightly darker grey
      'area': '#E1F0E1',         // Slightly darker light green
      'zone': '#E1F8F8',         // Slightly darker light teal
      'label': '#FFF0B8',        // Slightly darker light yellow
      'media_player': '#FFE1F0',  // Slightly darker light pink
      'number': '#F0E8FF',       // Slightly darker light violet
      'todo': '#E8FFE1',         // Slightly darker light lime
      'group': '#F0F0FF'         // Slightly darker light lavender
    };
    return focusColors[domain] || '#F0F1F2';
  }
  
  getMdiIconHtml(iconName, domain) {
    // Convert specific MDI icons to better emoji representations
    if (iconName && iconName.startsWith('mdi:')) {
      // Map specific MDI icons to emojis for better visual representation
      const mdiToEmoji = {
        // Light variations
        'mdi:lightbulb': '💡',
        'mdi:lightbulb-on': '💡',
        'mdi:lightbulb-off': '🔆',
        'mdi:lightbulb-outline': '💡',
        'mdi:ceiling-light': '💡',
        'mdi:floor-lamp': '🪔',
        'mdi:desk-lamp': '🪔',
        'mdi:led-strip': '💡',
        'mdi:track-light': '💡',
        
        // Switch variations  
        'mdi:toggle-switch': '🔌',
        'mdi:toggle-switch-off': '⚫',
        'mdi:power-plug': '🔌',
        'mdi:power-socket': '🔌',
        'mdi:power-socket-us': '🔌',
        'mdi:power-socket-eu': '🔌',
        'mdi:electric-switch': '🔌',
        'mdi:power': '⚡',
        
        // Sensor variations
        'mdi:thermometer': '🌡️',
        'mdi:thermometer-lines': '🌡️', 
        'mdi:gauge': '📊',
        'mdi:speedometer': '📊',
        'mdi:chart-line': '📈',
        'mdi:motion-sensor': '👁️',
        'mdi:eye': '👁️',
        'mdi:water-percent': '💧',
        'mdi:humidity': '💧',
        
        // Lock variations
        'mdi:lock': '🔒',
        'mdi:lock-open': '🔓',
        'mdi:key': '🔑',
        
        // Media variations
        'mdi:speaker': '🔊',
        'mdi:volume-high': '🔊',
        'mdi:volume-medium': '🔉',
        'mdi:volume-low': '🔈',
        'mdi:television': '📺',
        
        // Climate variations
        'mdi:thermostat': '🌡️',
        'mdi:air-conditioner': '❄️',
        'mdi:fan': '💨',
        'mdi:snowflake': '❄️',
        'mdi:fire': '🔥',
        
        // Common icons
        'mdi:home': '🏠',
        'mdi:car': '🚗',
        'mdi:phone': '📱',
        'mdi:camera': '📷',
        'mdi:bell': '🔔',
        'mdi:calendar': '📅',
        'mdi:clock': '🕐',
        'mdi:weather-sunny': '☀️',
        'mdi:weather-cloudy': '☁️',
        'mdi:umbrella': '☂️'
      };
      
      // Try specific MDI icon first
      if (mdiToEmoji[iconName]) {
        return mdiToEmoji[iconName];
      }
    }
    
    // Fall back to domain-based emoji
    return this.getEntityIcon(domain);
  }

  getEntityIcon(domain) {
    // Map Home Assistant domains to simple text icons
    const icons = {
      'light': '💡',
      'switch': '🔌',
      'sensor': '📊',
      'automation': '🤖',
      'script': '📝',
      'alert': '🚨',
      'scene': '🎬',
      'input_boolean': '☑️',
      'input_number': '🔢',
      'binary_sensor': '📡',
      'device_tracker': '📍',
      'device': '📱',
      'area': '🏠',
      'zone': '📍',
      'label': '🏷️',
      'media_player': '🔊',
      'number': '🔢',
      'todo': '✅',
      'climate': '🌡️',
      'cover': '🪟',
      'fan': '💨',
      'vacuum': '🧹',
      'camera': '📷',
      'lock': '🔒',
      'alarm_control_panel': '🚨',
      'weather': '🌤️',
      'sun': '☀️',
      'person': '👤',
      'button': '🔘',
      'select': '📋',
      'input_select': '📋',
      'input_text': '📝',
      'input_datetime': '📅',
      'timer': '⏲️',
      'counter': '🔢',
      'remote': '📱',
      'water_heater': '🚿',
      'humidifier': '💧',
      'siren': '🚨',
      'update': '🔄',
      'calendar': '📅',
      'group': '👥'
    };
    return icons[domain] || '⚫';
  }
  
  getEdgeColor(relationshipType) {
    // Simple, subtle edge colors
    if (relationshipType.includes('automation') || relationshipType.includes('trigger') || relationshipType.includes('control')) {
      return '#B0B0B0';  // Light grey for automation relationships
    }
    if (relationshipType.includes('area') || relationshipType.includes('contains') || relationshipType.includes('device')) {
      return '#C0C0C0';  // Slightly lighter grey for containment relationships
    }
    if (relationshipType.includes('group')) {
      return '#B8B8B8';  // Medium grey for group relationships
    }
    return '#D0D0D0';    // Very light grey for other relationships
  }
  
  getLayoutOptions(layoutType) {
    if (layoutType === 'force-directed') {
      return {
        "randomSeed": 42,
        "improvedLayout": false,
        "hierarchical": {
          "enabled": false
        }
      };
    } else {
      // Default hierarchical layout
      return {
        "improvedLayout": true,
        "hierarchical": {
          "enabled": true,
          "direction": "LR",
          "sortMethod": "directed",
          "shakeTowards": "leaves",
          "edgeMinimization": true,
          "blockShifting": true,
          "parentCentralization": true,
          "levelSeparation": 250,  
          "nodeSpacing": 20,
          "treeSpacing": 100   
        },
        "randomSeed": 42
      };
    }
  }
  
  getPhysicsOptions(layoutType) {
    if (layoutType === 'force-directed') {
      return {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0.8
        },
        stabilization: { 
          iterations: 2000,
          updateInterval: 50,
          onlyDynamicEdges: false,
          fit: true
        },
        maxVelocity: 20,
        minVelocity: 0.1
      };
    } else {
      // Hierarchical layout physics
      return {
        enabled: true,
        solver: 'barnesHut',
        stabilization: { 
          iterations: 1000,
          updateInterval: 100,
          onlyDynamicEdges: false,
          fit: true
        },
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.2,
          springLength: 150,
          springConstant: 0.05,
          damping: 0.15,
          avoidOverlap: 0.5
        },
        maxVelocity: 30,
        minVelocity: 0.75
      };
    }
  }
  
  bundleMultipleRelationships(edges) {
    // Group edges by their node pair (bidirectional)
    const edgeGroups = new Map();
    
    for (const edge of edges) {
      // Create a bidirectional key - sort nodes alphabetically for consistent grouping
      const nodeA = edge.from_node;
      const nodeB = edge.to_node;
      const key = nodeA < nodeB ? `${nodeA}:${nodeB}` : `${nodeB}:${nodeA}`;
      
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      edgeGroups.get(key).push(edge);
    }
    
    // Process each group of edges
    const bundledEdges = [];
    
    for (const [key, groupedEdges] of edgeGroups) {
      if (groupedEdges.length === 1) {
        // Single relationship - keep as is
        const edge = groupedEdges[0];
        bundledEdges.push({
          from_node: edge.from_node,
          to_node: edge.to_node,
          label: edge.label,
          title: `${edge.relationship_type}: ${edge.label}`,
          relationship_type: edge.relationship_type
        });
      } else {
        // Multiple relationships - bundle them
        const labels = groupedEdges.map(e => e.label);
        const relationshipTypes = groupedEdges.map(e => e.relationship_type);
        
        // Deduplicate labels - only show unique labels
        const uniqueLabels = [...new Set(labels)];
        
        // Create compound label and title
        const combinedLabel = uniqueLabels.join(', ');
        const combinedTitle = groupedEdges.map(e => `${e.relationship_type}: ${e.label}`).join('\n');
        
        // Use the first relationship type for coloring, or create a compound type
        const combinedRelationshipType = relationshipTypes.length > 1 ? 
          relationshipTypes.join('_') : relationshipTypes[0];
        
        // Determine the best direction for the bundled edge
        // Prefer automation->entity direction if there's a control relationship
        let bestEdge = groupedEdges[0];
        for (const edge of groupedEdges) {
          if (edge.relationship_type === 'automation_action' || 
              edge.from_node.startsWith('automation.')) {
            bestEdge = edge;
            break;
          }
        }
        
        bundledEdges.push({
          from_node: bestEdge.from_node,
          to_node: bestEdge.to_node,
          label: combinedLabel,
          title: combinedTitle,
          relationship_type: combinedRelationshipType,
          width: Math.min(2 + groupedEdges.length * 0.5, 4)  // Increase width for multiple relationships
        });
      }
    }
    
    return bundledEdges;
  }
  
  setupGraphControls() {
    const fitBtn = this.querySelector('#fitBtn');
    const resetBtn = this.querySelector('#resetBtn');
    
    if (fitBtn) {
      fitBtn.addEventListener('click', () => {
        if (this.network) {
          this.network.fit();
        }
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.network) {
          // Provide user feedback
          const graphInfo = this.querySelector('#graphInfo');
          const originalText = graphInfo ? graphInfo.textContent : '';
          if (graphInfo) {
            graphInfo.textContent = 'Resetting layout...';
          }
          
          // Reset the network layout/physics
          this.network.fit();
          
          // Re-enable physics temporarily to reset node positions
          this.network.setOptions({
            physics: { 
              enabled: true,
              stabilization: { 
                iterations: 200,
                updateInterval: 25
              }
            }
          });
          
          // Disable physics again after stabilization
          setTimeout(() => {
            this.network.setOptions({
              physics: { enabled: false }
            });
            if (graphInfo) {
              graphInfo.textContent = originalText || 'Layout reset complete';
            }
          }, 1500);
        }
      });
    }
  }
  
  onNodeClick(nodeId) {
    console.log('HA Visualiser: Node clicked:', nodeId);
    // Navigate to the clicked entity's neighborhood
    this.selectEntity(nodeId);
  }

  openEntityDialog(entityId) {
    // Only open dialogs for actual entities (not device/area/zone nodes)
    if (entityId && entityId.includes('.') && !entityId.startsWith('device:') && !entityId.startsWith('area:') && !entityId.startsWith('zone:') && !entityId.startsWith('label:')) {
      
      // Use Home Assistant's action event system (2023.7+ pattern)
      const actionEvent = new CustomEvent('hass-action', {
        bubbles: true,
        composed: true,
        detail: {
          config: {
            action: 'more-info',
            entity: entityId
          },
          source: 'ha-visualiser'
        }
      });
      this.dispatchEvent(actionEvent);
      
      
      // Fallback: Try HA's direct dialog system
      const homeAssistant = document.querySelector('home-assistant');
      if (homeAssistant && homeAssistant.hass) {
        if (homeAssistant.hass.moreInfoDialog) {
          homeAssistant.hass.moreInfoDialog.open(entityId);
        } else if (homeAssistant._showMoreInfoDialog) {
          homeAssistant._showMoreInfoDialog(entityId);
        }
      }
      
      // Fallback: Try document-level event dispatch
      document.dispatchEvent(actionEvent);
    }
  }

  set hass(hass) {
    this._hass = hass;
  }

  get hass() {
    return this._hass;
  }
}

customElements.define('ha-visualiser-panel', HaVisualiserPanel);