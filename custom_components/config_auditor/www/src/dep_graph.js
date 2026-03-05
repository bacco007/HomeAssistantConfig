  // ═══════════════════════════════════════════════════════════════════════
  //  DEPENDENCY GRAPH — D3.js force-directed
  // ═══════════════════════════════════════════════════════════════════════

  _graphNodeColor(node) {
    if (node.has_issues) {
      return node.max_severity === 'high' ? '#ef5350' :
             node.max_severity === 'medium' ? '#ffa726' : '#ffd54f';
    }
    return {
      automation: '#7b68ee',
      script:     '#20b2aa',
      scene:      '#ffa500',
      entity:     '#6dbf6d',
      blueprint:  '#e8a838',
      device:     '#a0a0b0',
    }[node.type] || '#888';
  }

  _graphNodeRadius(node) {
    const base = { automation: 10, script: 9, scene: 9, blueprint: 10, device: 8, entity: 6 };
    return (base[node.type] || 6) + Math.min(node.degree * 1.2, 12);
  }

  async _loadD3() {
    if (window.d3) return window.d3;
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
      s.onload = () => resolve(window.d3);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async _renderDepGraph(graphData) {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    const empty = this.shadowRoot.querySelector('#graph-empty');
    if (!svg) return;

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
      svg.style.display = 'none';
      if (empty) empty.style.display = 'flex';
      return;
    }

    svg.style.display = 'block';
    if (empty) empty.style.display = 'none';

    // Load D3 lazily
    let d3;
    try { d3 = await this._loadD3(); }
    catch(e) { console.error('HACA: D3 load failed', e); return; }

    // Store raw data for filter reuse
    this._graphRawData = graphData;
    this._graphIssuesOnly = this._graphIssuesOnly || false;

    this._drawD3Graph(d3, graphData);
  }

  _drawD3Graph(d3, graphData) {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    // ── Stopper l'ancienne simulation AVANT d'en créer une nouvelle ──────────
    // Sans ce stop(), chaque refresh (toutes les 60s sur l'onglet Carte) laisse
    // une simulation D3 zombie tourner en requestAnimationFrame : memory/CPU leak
    // critique qui provoque la page blanche après quelques heures.
    if (this._graphSimulation) {
      this._graphSimulation.stop();
      this._graphSimulation = null;
    }

    // Get dimensions — si le SVG est dans un onglet caché (display:none),
    // clientWidth = 0. On reporte le rendu via requestAnimationFrame pour
    // éviter que la simulation tourne avec W=0 → translate(NaN,NaN) en boucle.
    let W = svg.clientWidth  || svg.parentElement?.clientWidth  || 0;
    let H = svg.clientHeight || svg.parentElement?.clientHeight || 0;

    if (W < 10 || H < 10) {
      // SVG pas encore layouté ou dans onglet caché — on retente dans le prochain frame
      requestAnimationFrame(() => {
        if (this._graphData) this._drawD3Graph(d3, graphData);
      });
      return;
    }

    // Clear previous render
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const svgSel = d3.select(svg);

    // Defs — arrowhead marker
    const defs = svgSel.append('defs');
    const mkArrow = (id, color) => defs.append('marker')
      .attr('id', id)
      .attr('viewBox', '0 -5 10 10').attr('refX', 22).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color);
    mkArrow('arrow-normal', 'var(--divider-color, #aaa)');
    mkArrow('arrow-issue', '#ef5350');
    mkArrow('arrow-blueprint', '#e8a838');

    // Apply active filter
    const typeFilter = this.shadowRoot.querySelector('#graph-type-filter')?.value || 'all';
    const issuesOnly = this._graphIssuesOnly;

    let nodes = graphData.nodes.filter(n =>
      (typeFilter === 'all' || n.type === typeFilter) &&
      (!issuesOnly || n.has_issues)
    );
    const nodeIds = new Set(nodes.map(n => n.id));
    // Include neighbors of filtered nodes so edges make sense
    if (typeFilter !== 'all' || issuesOnly) {
      graphData.edges.forEach(e => {
        if (nodeIds.has(e.source) || nodeIds.has(e.target)) {
          if (!nodeIds.has(e.source)) {
            const nb = graphData.nodes.find(n => n.id === e.source);
            if (nb) { nodes.push(nb); nodeIds.add(nb.id); }
          }
          if (!nodeIds.has(e.target)) {
            const nb = graphData.nodes.find(n => n.id === e.target);
            if (nb) { nodes.push(nb); nodeIds.add(nb.id); }
          }
        }
      });
    }
    const edges = graphData.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    // Deep-clone for simulation (D3 mutates objects)
    const simNodes = nodes.map(n => ({ ...n }));
    const nodeById = Object.fromEntries(simNodes.map(n => [n.id, n]));
    const simEdges = edges.map(e => ({
      ...e,
      source: nodeById[e.source] || e.source,
      target: nodeById[e.target] || e.target,
    })).filter(e => e.source && e.target);

    // Zoom behaviour
    const zoomG = svgSel.append('g').attr('class', 'zoom-root');
    const zoom = d3.zoom().scaleExtent([0.05, 4]).on('zoom', ev => {
      zoomG.attr('transform', ev.transform);
    });
    svgSel.call(zoom);
    this._d3Zoom   = zoom;
    this._d3SvgSel = svgSel;

    // Force simulation
    const simulation = d3.forceSimulation(simNodes)
      .force('link',   d3.forceLink(simEdges).id(d => d.id).distance(d => {
        const types = d.source.type + '-' + d.target.type;
        if (types.includes('blueprint')) return 50;
        if (types.includes('device'))    return 40;
        if (types.includes('entity'))    return 30;
        return 45;
      }).strength(0.8))
      .force('charge', d3.forceManyBody().strength(d => -60 - d.degree * 5))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.08))
      .force('collide', d3.forceCollide(d => this._graphNodeRadius(d) + 3))
      .alphaDecay(0.03);

    this._graphSimulation = simulation;

    // ── Edges ──────────────────────────────────────────────────────────
    const edgeColor = e => e.rel === 'uses_blueprint' ? '#e8a838' :
                            e.rel === 'calls_script'   ? '#20b2aa' :
                            (e.source.has_issues || e.target.has_issues) ? '#ef535066' :
                            'var(--divider-color, #aaa)';
    const arrowId = e => e.rel === 'uses_blueprint' ? 'arrow-blueprint' :
                          (e.source.has_issues || e.target.has_issues) ? 'arrow-issue' :
                          'arrow-normal';

    const link = zoomG.append('g').attr('class', 'links')
      .selectAll('line').data(simEdges).join('line')
      .attr('stroke', edgeColor)
      .attr('stroke-width', e => e.rel === 'calls_script' ? 2 : 1)
      .attr('stroke-dasharray', e => e.rel === 'belongs_to_device' ? '4 3' : null)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', e => 'url(#' + arrowId(e) + ')');

    // ── Nodes ───────────────────────────────────────────────────────────
    const node = zoomG.append('g').attr('class', 'nodes')
      .selectAll('g').data(simNodes).join('g')
      .attr('class', 'node-g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      .on('click', (ev, d) => {
        ev.stopPropagation();
        this._graphShowSidebar(d);
      });

    // Circle
    node.append('circle')
      .attr('r', d => this._graphNodeRadius(d))
      .attr('fill', d => this._graphNodeColor(d))
      .attr('stroke', d => d.has_issues ? '#b71c1c' : 'rgba(0,0,0,0.15)')
      .attr('stroke-width', d => d.has_issues ? 2.5 : 1)
      .attr('filter', d => d.has_issues ? 'drop-shadow(0 0 4px rgba(239,83,80,0.6))' : null);

    // Issue badge ring (pulsing)
    node.filter(d => d.has_issues && d.max_severity === 'high')
      .append('circle')
      .attr('r', d => this._graphNodeRadius(d) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#ef5350')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5);

    // Label — only show for non-entity or high-degree nodes
    node.filter(d => d.type !== 'entity' || d.degree > 3 || d.has_issues)
      .append('text')
      .text(d => d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label)
      .attr('dy', d => -this._graphNodeRadius(d) - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'var(--primary-text-color)')
      .attr('pointer-events', 'none');

    // Issue count badge
    node.filter(d => d.issue_count > 0)
      .append('text')
      .text(d => d.issue_count)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', '700')
      .attr('fill', 'white')
      .attr('pointer-events', 'none');

    // Click on SVG background → close sidebar
    svgSel.on('click', () => {
      const sb = this.shadowRoot.querySelector('#graph-sidebar');
      if (sb) sb.style.display = 'none';
      node.select('circle').attr('stroke-width', d => d.has_issues ? 2.5 : 1);
    });

    // Tick — guard NaN : si les positions ne sont pas encore calculées (debut simulation)
    // ou si le SVG a été masqué entre-temps, on saute ce frame pour éviter le spam
    // "Expected number, translate(NaN,NaN)" dans la console
    simulation.on('tick', () => {
      link.attr('x1', d => isNaN(d.source.x) ? 0 : d.source.x)
          .attr('y1', d => isNaN(d.source.y) ? 0 : d.source.y)
          .attr('x2', d => isNaN(d.target.x) ? 0 : d.target.x)
          .attr('y2', d => isNaN(d.target.y) ? 0 : d.target.y);
      node.attr('transform', d => {
        if (isNaN(d.x) || isNaN(d.y)) return `translate(${W/2},${H/2})`;
        return `translate(${d.x},${d.y})`;
      });
    });

    // Auto-fit after stabilisation
    simulation.on('end', () => this._graphResetZoom());
  }

  // ── Nettoyage complet D3 (appelé depuis disconnectedCallback) ───────────────
  _graphStopAll() {
    if (this._graphSimulation) {
      this._graphSimulation.stop();
      this._graphSimulation = null;
    }
    this._d3Zoom   = null;
    this._d3SvgSel = null;
    this._graphRawData = null;
  }

  _graphResetZoom() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg || !this._d3Zoom || !this._d3SvgSel || !window.d3) return;
    const d3 = window.d3;
    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;
    this._d3SvgSel.transition().duration(500)
      .call(this._d3Zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(0.9).translate(-W / 2, -H / 2));
  }

  _graphApplyFilters() {
    if (!this._graphRawData || !window.d3) return;
    this._drawD3Graph(window.d3, this._graphRawData);
  }

  _graphSearch(query) {
    if (!this._d3SvgSel || !window.d3) return;
    const q = query.toLowerCase().trim();
    this._d3SvgSel.selectAll('.node-g circle').attr('opacity', d => {
      if (!q) return 1;
      const match = d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q);
      return match ? 1 : 0.15;
    });
    this._d3SvgSel.selectAll('.node-g text').attr('opacity', d => {
      if (!q) return 1;
      return (d.id.toLowerCase().includes(q) || d.label.toLowerCase().includes(q)) ? 1 : 0.1;
    });
  }

  _graphShowSidebar(node) {
    const sb   = this.shadowRoot.querySelector('#graph-sidebar');
    const title = this.shadowRoot.querySelector('#sidebar-title');
    const body  = this.shadowRoot.querySelector('#sidebar-body');
    if (!sb || !title || !body) return;

    // Highlight selected node
    if (this._d3SvgSel) {
      this._d3SvgSel.selectAll('.node-g circle')
        .attr('stroke-width', d => d.id === node.id ? 4 : (d.has_issues ? 2.5 : 1))
        .attr('stroke', d => d.id === node.id ? 'var(--primary-color)' : (d.has_issues ? '#b71c1c' : 'rgba(0,0,0,0.15)'));
    }

    const typeLabels = { automation:'Automation', script:'Script', scene: this.t('graph.legend_scene'),
                         entity: this.t('graph.legend_entity'), blueprint:'Blueprint', device: this.t('graph.legend_device') };
    title.textContent = node.label;

    const editUrl = this.getHAEditUrl(node.id);
    const haStateUrl = `/developer-tools/state`;

    const issueRows = (node.issue_summary || []).map(iss => {
      const sCol = iss.severity === 'high' ? '#ef5350' : iss.severity === 'medium' ? '#ffa726' : '#ffd54f';
      return `<div style="padding:8px;border-radius:8px;background:var(--secondary-background-color);margin-bottom:6px;border-left:3px solid ${sCol};">
        <div style="font-size:11px;font-weight:700;color:${sCol};text-transform:uppercase;">${iss.severity}</div>
        <div style="font-size:12px;margin-top:2px;line-height:1.4;">${this.escapeHtml(iss.message)}</div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <div style="margin-bottom:12px;">
        <span style="background:${this._graphNodeColor(node)};color:white;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;">
          ${typeLabels[node.type] || node.type}
        </span>
        <span style="margin-left:8px;font-size:12px;color:var(--secondary-text-color);">${node.degree} connexion${node.degree !== 1 ? 's' : ''}</span>
      </div>
      <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:12px;word-break:break-all;">${this.escapeHtml(node.id)}</div>

      ${node.issue_count > 0 ? `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;">
          ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}
        </div>
        ${issueRows}
      ` : `<div style="font-size:13px;color:#66bb6a;margin-bottom:12px;">${this.t('graph.no_issues')}</div>`}

      <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
        ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--primary-color);color:white;border-radius:8px;padding:8px;">
            <ha-icon icon="mdi:pencil" style="--mdc-icon-size:14px;"></ha-icon> Modifier dans HA
          </button>
        </a>` : ''}
        ${node.type === 'entity' ? `<a href="${haStateUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;">
            <ha-icon icon="mdi:eye" style="--mdc-icon-size:14px;"></ha-icon> ${this.t('graph.view_state')}
          </button>
        </a>` : ''}
      </div>`;

    sb.style.display = 'block';
  }

  // ── Export SVG ────────────────────────────────────────────────────────────
  _graphExportSVG() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    // Clone so we can embed styles without touching the live DOM
    const clone = svg.cloneNode(true);
    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;
    clone.setAttribute('width',  W);
    clone.setAttribute('height', H);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Embed minimal inline styles so the SVG renders stand-alone
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [
      'text { font-family: sans-serif; font-size: 10px; fill: #333; }',
      'line { stroke-opacity: 0.6; }',
      'circle { stroke-width: 1; }',
    ].join(' ');
    clone.insertBefore(style, clone.firstChild);

    const serial  = new XMLSerializer();
    const svgStr  = serial.serializeToString(clone);
    const blob    = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `haca-graph-${new Date().toISOString().slice(0,10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Export PNG ────────────────────────────────────────────────────────────
  _graphExportPNG() {
    const svg = this.shadowRoot.querySelector('#dep-graph-svg');
    if (!svg) return;

    const W = svg.clientWidth  || 800;
    const H = svg.clientHeight || 600;

    // Serialise to SVG data-URI
    const clone = svg.cloneNode(true);
    clone.setAttribute('width',  W);
    clone.setAttribute('height', H);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = [
      'text { font-family: sans-serif; font-size: 10px; fill: #333; }',
      'line { stroke-opacity: 0.6; }',
      'circle { stroke-width: 1; }',
    ].join(' ');
    clone.insertBefore(style, clone.firstChild);

    const serial = new XMLSerializer();
    const svgStr = serial.serializeToString(clone);
    const svgB64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));

    // Draw on canvas → PNG blob
    const canvas  = document.createElement('canvas');
    canvas.width  = W * 2;   // 2x for retina
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      canvas.toBlob(blob => {
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `haca-graph-${new Date().toISOString().slice(0,10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.onerror = () => {
      // Fallback: download as SVG if PNG rendering fails
      console.warn('[HACA] PNG export failed, falling back to SVG');
      this._graphExportSVG();
    };
    img.src = svgB64;
  }
