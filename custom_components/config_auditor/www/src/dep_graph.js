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
    catch(e) { return; }

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

    const editUrl    = this.getHAEditUrl(node.id);
    const haStateUrl = `/developer-tools/state`;

    // ── Build relationship maps from raw graph data ───────────────────────
    // IMPORTANT: D3 mute les edges pendant la simulation — source/target
    // deviennent des objets nœuds, pas des strings. On normalise avec ?.id ?? e.source.
    const edges     = (this._graphRawData?.edges  || []);
    const nodeIndex = Object.fromEntries((this._graphRawData?.nodes || []).map(n => [n.id, n]));

    const _edgeSrc = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _edgeTgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    // "Uses" = edges where this node is the source
    const uses = edges
      .filter(e => _edgeSrc(e) === node.id)
      .map(e => ({ node: nodeIndex[_edgeTgt(e)], rel: e.rel, id: _edgeTgt(e) }))
      .filter(e => e.node);

    // "Used by" = edges where this node is the target
    const usedBy = edges
      .filter(e => _edgeTgt(e) === node.id)
      .map(e => ({ node: nodeIndex[_edgeSrc(e)], rel: e.rel, id: _edgeSrc(e) }))
      .filter(e => e.node);

    const relColor = { automation:'#7b68ee', script:'#20b2aa', scene:'#ffa500',
                       entity:'#6dbf6d', blueprint:'#e8a838', device:'#a0a0b0' };

    const _relItem = (entry) => {
      const n   = entry.node;
      const col = relColor[n.type] || '#888';
      const lbl = this.escapeHtml(n.label || n.id);
      const eid = this.escapeHtml(n.id);
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:var(--secondary-background-color);margin-bottom:4px;cursor:pointer;"
                   data-node-id="${eid}" class="graph-rel-item">
        <span style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0;"></span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${eid}">${lbl}</div>
          <div style="font-size:10px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${eid}</div>
        </div>
        <span style="font-size:10px;background:${col}22;color:${col};border-radius:4px;padding:1px 5px;flex-shrink:0;">${n.type}</span>
      </div>`;
    };

    const _relSection = (label, items, icon) => {
      if (!items.length) return '';
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;display:flex;align-items:center;gap:4px;">
            ${_icon(icon, 12)} ${label} <span style="margin-left:4px;background:var(--secondary-background-color);border-radius:10px;padding:1px 7px;font-size:10px;color:var(--primary-text-color);">${items.length}</span>
          </div>
          ${items.map(_relItem).join('')}
        </div>`;
    };

    // ── Issues ────────────────────────────────────────────────────────────
    const issueRows = (node.issue_summary || []).map(iss => {
      const sCol = iss.severity === 'high' ? '#ef5350' : iss.severity === 'medium' ? '#ffa726' : '#ffd54f';
      return `<div style="padding:8px;border-radius:8px;background:var(--secondary-background-color);margin-bottom:6px;border-left:3px solid ${sCol};">
        <div style="font-size:11px;font-weight:700;color:${sCol};text-transform:uppercase;">${iss.severity}</div>
        <div style="font-size:12px;margin-top:2px;line-height:1.4;">${this.escapeHtml(iss.message)}</div>
      </div>`;
    }).join('');

    body.innerHTML = `
      <!-- Type badge + degree -->
      <div style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <span style="background:${this._graphNodeColor(node)};color:white;border-radius:6px;padding:2px 10px;font-size:11px;font-weight:700;">
          ${typeLabels[node.type] || node.type}
        </span>
        <span style="font-size:12px;color:var(--secondary-text-color);">${node.degree} connexion${node.degree !== 1 ? 's' : ''}</span>
      </div>
      <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:14px;word-break:break-all;">${this.escapeHtml(node.id)}</div>

      <!-- Issues -->
      ${node.issue_count > 0 ? `
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--secondary-text-color);margin-bottom:6px;">
          ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}
        </div>
        ${issueRows}
      ` : `<div style="font-size:13px;color:#66bb6a;margin-bottom:14px;">${this.t('graph.no_issues')}</div>`}

      <!-- Relationships -->
      ${_relSection(this.t('graph.used_by'), usedBy, 'arrow-left-circle-outline')}
      ${_relSection(this.t('graph.uses'), uses, 'arrow-right-circle-outline')}

      ${!usedBy.length && !uses.length ? `
        <div style="padding:12px;background:var(--secondary-background-color);border-radius:8px;font-size:12px;color:var(--secondary-text-color);text-align:center;margin-bottom:14px;">
          ${_icon('link-off', 14)} ${this.t('graph.orphan')}
        </div>` : ''}

      <!-- Actions -->
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
        ${editUrl ? `<a href="${editUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--primary-color);color:white;border-radius:8px;padding:8px;border:none;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${_icon("pencil", 14)} Modifier dans HA
          </button>
        </a>` : ''}
        ${node.type === 'entity' ? `<a href="${haStateUrl}" target="_blank" style="text-decoration:none;">
          <button style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${_icon("eye", 14)} ${this.t('graph.view_state')}
          </button>
        </a>` : ''}
        <button id="sidebar-export-csv"
          style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
          ${_icon("file-delimited-outline", 14)} ${this.t('graph.export_node_csv')}
        </button>
        <button id="sidebar-export-md"
          style="width:100%;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:8px;padding:8px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;">
          ${_icon("language-markdown-outline", 14)} ${this.t('graph.export_node_md')}
        </button>
      </div>`;

    sb.style.display = 'block';

    // Sauvegarder les données du nœud courant dans le sidebar lui-même.
    // Si _graphStopAll() est appelé (disconnect, refresh), _graphRawData devient null
    // mais les données déjà capturées restent disponibles via sb._hacaNodeData.
    sb._hacaNodeData = { node, usedBy, uses,
      allNodes: (this._graphRawData?.nodes || []) };

    // Click on a relation item → navigate to that node in the sidebar
    body.querySelectorAll('.graph-rel-item').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.nodeId;
        // Prefer live data, fallback to saved snapshot
        const nodeList = this._graphRawData?.nodes || sb._hacaNodeData?.allNodes || [];
        const targetNode = nodeList.find(n => n.id === targetId);
        if (targetNode) this._graphShowSidebar(targetNode);
      });
    });

    // Export CSV — données capturées en closure, indépendantes de _graphRawData
    body.querySelector('#sidebar-export-csv')?.addEventListener('click', () => {
      this._graphExportNodeCSV(node, usedBy, uses);
    });
    // Export MD — idem
    body.querySelector('#sidebar-export-md')?.addEventListener('click', () => {
      this._graphExportNodeMD(node, usedBy, uses);
    });
  }

  // ── Export CSV: relations for one node ───────────────────────────────────
  _graphExportNodeCSV(node, usedBy, uses) {
    const rows = [['entity_id', 'label', 'type', 'relationship', 'direction']];
    usedBy.forEach(e => rows.push([e.id, e.node.label || e.id, e.node.type, e.rel, 'used_by']));
    uses.forEach(e   => rows.push([e.id, e.node.label || e.id, e.node.type, e.rel, 'uses']));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const slug = (node.label || node.id).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    this._downloadText(csv, `haca-relations-${slug}.csv`, 'text/csv');
  }

  // ── Export MD: relations for one node ────────────────────────────────────
  _graphExportNodeMD(node, usedBy, uses) {
    const typeLabel = this.t(`graph.legend_${node.type}`) || node.type;
    const slug = (node.label || node.id).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');

    let md = `# ${node.label || node.id}\n`;
    md += `\`${node.id}\` · ${typeLabel} · ${node.degree} ${this.t('graph.connections') || 'connections'}\n`;
    if (node.issue_count > 0) md += `⚠️ ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}\n`;
    md += '\n';

    if (usedBy.length) {
      md += `## ← ${this.t('graph.used_by')} (${usedBy.length})\n\n`;
      usedBy.forEach(e => {
        const tl = this.t(`graph.legend_${e.node.type}`) || e.node.type;
        md += `- ${e.node.label || e.id}  \`${e.id}\`  *(${tl})*\n`;
      });
      md += '\n';
    }

    if (uses.length) {
      md += `## → ${this.t('graph.uses')} (${uses.length})\n\n`;
      uses.forEach(e => {
        const tl = this.t(`graph.legend_${e.node.type}`) || e.node.type;
        md += `- ${e.node.label || e.id}  \`${e.id}\`  *(${tl})*\n`;
      });
      md += '\n';
    }

    if (!usedBy.length && !uses.length) {
      md += `> ${this.t('graph.orphan')}\n\n`;
    }

    md += `---\n*HACA — ${date}*\n`;
    this._downloadText(md, `haca-${slug}.md`, 'text/markdown');
  }

  // ── Export CSV: ALL relationships in the graph ────────────────────────────
  _graphExportRelationshipsCSV() {
    if (!this._graphRawData) return;
    const { nodes, edges } = this._graphRawData;
    const nodeIndex = Object.fromEntries(nodes.map(n => [n.id, n]));
    const _src = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _tgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    const rows = [['source_id', 'source_label', 'source_type', 'relationship', 'target_id', 'target_label', 'target_type']];
    edges.forEach(e => {
      const sid = _src(e); const tid = _tgt(e);
      const s = nodeIndex[sid] || { label: sid, type: '' };
      const t = nodeIndex[tid] || { label: tid, type: '' };
      rows.push([sid, s.label || sid, s.type, e.rel, tid, t.label || tid, t.type]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    this._downloadText(csv, `haca-relations-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  }

  // ── Export MD: ALL relationships in the graph ─────────────────────────────
  _graphExportRelationshipsMD() {
    if (!this._graphRawData) return;
    const { nodes, edges } = this._graphRawData;
    const nodeIndex = Object.fromEntries(nodes.map(n => [n.id, n]));
    const _src = e => (typeof e.source === 'object' ? e.source?.id : e.source) ?? '';
    const _tgt = e => (typeof e.target === 'object' ? e.target?.id : e.target) ?? '';

    // Index: node → qui l'utilise / ce qu'il utilise
    const byTarget = {};
    const bySource = {};
    edges.forEach(e => {
      const sid = _src(e); const tid = _tgt(e);
      if (!byTarget[tid]) byTarget[tid] = [];
      byTarget[tid].push(sid);
      if (!bySource[sid]) bySource[sid] = [];
      bySource[sid].push(tid);
    });

    const date = new Date().toISOString().slice(0, 10);
    const order = { automation:0, script:1, scene:2, blueprint:3, entity:4, device:5 };
    const sorted = [...nodes].sort((a, b) =>
      (order[a.type] ?? 9) - (order[b.type] ?? 9) || (a.label || a.id).localeCompare(b.label || b.id)
    );

    let md = `# ${this.t('graph.title') || 'Dependency Graph'}\n`;
    md += `${date} · ${nodes.length} ${this.t('graph.md_nodes') || 'nodes'} · ${edges.length} ${this.t('graph.md_edges') || 'connections'}\n\n`;

    // Group by type for readability
    const typeOrder = ['automation', 'script', 'scene', 'blueprint', 'entity', 'device'];
    for (const type of typeOrder) {
      const group = sorted.filter(n => n.type === type);
      if (!group.length) continue;

      const typeLabel = this.t(`graph.legend_${type}`) || type;
      md += `---\n\n## ${typeLabel} (${group.length})\n\n`;

      for (const node of group) {
        const usedByIds = byTarget[node.id] || [];
        const usesIds   = bySource[node.id] || [];

        md += `### ${node.label || node.id}\n`;
        md += `\`${node.id}\``;
        if (node.issue_count > 0) md += ` · ⚠️ ${node.issue_count} issue${node.issue_count > 1 ? 's' : ''}`;
        md += '\n\n';

        if (usedByIds.length) {
          md += `**← ${this.t('graph.used_by')}**\n`;
          usedByIds.forEach(sid => {
            const s = nodeIndex[sid];
            md += `- ${s?.label || sid}  \`${sid}\`\n`;
          });
          md += '\n';
        }
        if (usesIds.length) {
          md += `**→ ${this.t('graph.uses')}**\n`;
          usesIds.forEach(tid => {
            const t = nodeIndex[tid];
            md += `- ${t?.label || tid}  \`${tid}\`\n`;
          });
          md += '\n';
        }
        if (!usedByIds.length && !usesIds.length) {
          md += `*${this.t('graph.orphan')}*\n\n`;
        }
      }
    }

    md += `---\n*HACA*\n`;
    this._downloadText(md, `haca-report-${date}.md`, 'text/markdown');
  }

  _downloadText(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      this._graphExportSVG();
    };
    img.src = svgB64;
  }
