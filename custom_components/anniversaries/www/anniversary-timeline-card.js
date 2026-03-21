/**
 * Anniversary Timeline Card v1.3.3
 * Shows upcoming anniversaries in chronological order with all attributes
 * Now uses universal color scheme (red → orange → green → blue) for urgency
 * Emoji selection expanded and matches latest const.py
 * Category icons fixed for corrupted emojis
 */

class AnniversaryTimelineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._renderTimeout = null; // For debouncing renders
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    console.log('🔧 [Timeline Card] setConfig called with:', config);
    console.log('🔧 [Timeline Card] Raw config.category:', config.category);
    console.log('🔧 [Timeline Card] Raw config.date_format:', config.date_format);
    
    this.config = {
      title: config.title || this.getDefaultTitle(config.category || config.categories),
      max_items: config.max_items || 5,
      show_attributes: config.show_attributes || this.getDefaultAttributes(config.category || config.categories),
      entity_filter: config.entity_filter || 'sensor.anniversary_*',
      show_icons: config.show_icons !== false,
      color_coding: config.color_coding !== false,
      category: config.category || null, // Single category filter
      categories: config.categories || null, // Multi-category filter (Phase 3)
      show_category_badges: config.show_category_badges !== false,
      category_color_scheme: config.category_color_scheme !== false,
      enhanced_attributes: config.enhanced_attributes !== false,
      // Phase 3 Advanced Options
      show_category_headers: config.show_category_headers || false,
      group_by_category: config.group_by_category || false,
      show_category_stats: config.show_category_stats || false,
      show_category_filter: config.show_category_filter || false,
      priority_categories: config.priority_categories || null,
      expandable_categories: config.expandable_categories || false,
      // Date Formatting Options
      date_format: config.date_format || 'long', // 'long', 'short', 'numeric', 'full', 'custom'
      show_day_of_week: config.show_day_of_week !== false, // Default: true
      custom_date_format: config.custom_date_format || null, // For advanced customization
      locale: config.locale || null, // Force specific locale, null = auto-detect
      // Debug Options
      debug_filtering: config.debug_filtering || false // Show filtering debug info
    };
    
    console.log('🔧 [Timeline Card] Final config:', this.config);
    
    // Render if hass is already available
    if (this._hass) {
      this.scheduleRender();
    }
  }

  scheduleRender() {
    // Debounce renders to prevent race conditions
    if (this._renderTimeout) {
      clearTimeout(this._renderTimeout);
    }
    this._renderTimeout = setTimeout(() => {
      this.render();
      this._renderTimeout = null;
    }, 0);
  }

  getDefaultTitle(categoryOrCategories) {
    // Handle single category
    if (typeof categoryOrCategories === 'string') {
      const categoryTitles = {
        'birthday': '🎂 Upcoming Birthdays',
        'anniversary': '💍 Upcoming Anniversaries',
        'memorial': '🌸 Memorial Dates',
        'holiday': '🎉 Upcoming Holidays',
        'work': '💼 Work Anniversaries',
        'achievement': '🏆 Achievement Anniversaries',
        'event': '📅 Upcoming Events',
        'other': '📋 Other Anniversaries'
      };
      return categoryTitles[categoryOrCategories] || 'Upcoming Anniversaries';
    }
    
    // Handle multiple categories (Phase 3)
    if (Array.isArray(categoryOrCategories) && categoryOrCategories.length > 0) {
      if (categoryOrCategories.length === 1) {
        return this.getDefaultTitle(categoryOrCategories[0]);
      } else {
        const categoryEmojis = {
          'birthday': '🎂', 'anniversary': '💍', 'memorial': '🌸', 'holiday': '🎉',
          'work': '💼', 'achievement': '🏆', 'event': '📅', 'other': '📋'
        };
        const emojis = categoryOrCategories.map(cat => categoryEmojis[cat] || '📅').join('');
        return `${emojis} Multiple Anniversary Types`;
      }
    }
    
    return 'Upcoming Anniversaries';
  }

  getDefaultAttributes(categoryOrCategories) {
    const categoryAttributes = {
      'birthday': ['zodiac_sign', 'birthstone', 'generation'], // Keep the awesome original
      'anniversary': ['current_years', 'named_anniversary'], // Removed zodiac_sign
      'memorial': ['current_years', 'birth_flower', 'generation'], // Enhanced with meaningful attributes
      'holiday': ['current_years', 'generation', 'named_anniversary'], // Enhanced
      'work': ['current_years', 'named_anniversary', 'generation'], // Enhanced
      'achievement': ['current_years', 'named_anniversary', 'generation'], // Enhanced
      'event': ['current_years', 'named_anniversary', 'generation'], // Enhanced
      'other': ['current_years', 'zodiac_sign', 'birthstone'] // Enhanced to match birthday quality
    };
    
    // Handle single category
    if (typeof categoryOrCategories === 'string') {
      return categoryAttributes[categoryOrCategories] || ['zodiac_sign', 'birthstone', 'generation'];
    }
    
    // Handle multiple categories (Phase 3) - merge unique attributes
    if (Array.isArray(categoryOrCategories) && categoryOrCategories.length > 0) {
      const allAttributes = new Set();
      categoryOrCategories.forEach(cat => {
        const attrs = categoryAttributes[cat] || ['current_years'];
        attrs.forEach(attr => allAttributes.add(attr));
      });
      return Array.from(allAttributes);
    }
    
    return ['zodiac_sign', 'birthstone', 'generation'];
  }

  getCategoryConfig(category) {
    return {
      'birthday': { 
        color: '#FF69B4', 
        emoji: '🎂', 
        label: 'Birthday',
        theme: 'warm'
      },
      'anniversary': { 
        color: '#E91E63', 
        emoji: '💍', 
        label: 'Anniversary',
        theme: 'romantic'
      },
      'memorial': { 
        color: '#9C27B0', 
        emoji: '🌸', 
        label: 'Memorial',
        theme: 'respectful'
      },
      'holiday': { 
        color: '#FF9800', 
        emoji: '🎉', 
        label: 'Holiday',
        theme: 'festive'
      },
      'work': { 
        color: '#2196F3', 
        emoji: '💼', 
        label: 'Work',
        theme: 'professional'
      },
      'achievement': { 
        color: '#4CAF50', 
        emoji: '🏆', 
        label: 'Achievement',
        theme: 'success'
      },
      'event': { 
        color: '#607D8B', 
        emoji: '📅', 
        label: 'Event',
        theme: 'neutral'
      },
      'other': { 
        color: '#795548', 
        emoji: '📋', 
        label: 'Other',
        theme: 'neutral'
      }
    }[category] || { color: '#795548', emoji: '📋', label: 'Other', theme: 'neutral' };
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) { // Only render if config exists
      this.scheduleRender();
    }
  }

  getAnniversaryEntities() {
    if (!this._hass || !this.config) return [];
    
    console.log('🔧 [Timeline Card] getAnniversaryEntities called, this.config:', this.config);
    
    const entities = Object.keys(this._hass.states)
      .filter(entityId => {
        // Custom entity list takes priority
        if (this.config.entities) {
          return this.config.entities.includes(entityId);
        }
        
        // Get the entity object
        const entity = this._hass.states[entityId];
        if (!entity) return false;
        
        // Check if it's a sensor entity
        if (!entityId.startsWith('sensor.')) return false;
        
        // Exclude known non-anniversary sensors
        if (entityId.includes('upcoming_anniversaries')) return false;
        
        // Verify it's an anniversary entity by checking for anniversary-specific attributes
        return this.isAnniversaryEntity(entity);
      })
      .map(entityId => this._hass.states[entityId])
      .filter(entity => {
        if (!entity || entity.state === 'unavailable') return false;
        
        // Debug logging for configuration
        if (this.config.debug_filtering) {
          console.log(`🔧 [Timeline Card] Config:`, this.config);
          console.log(`🔧 [Timeline Card] Config category:`, this.config.category);
          console.log(`🔧 [Timeline Card] Config categories:`, this.config.categories);
        }
        
        // Filter by category/categories if specified (Phase 3 enhancement)
        const entityCategory = entity.attributes.category || 'other';
        
        // Debug logging
        if (this.config.debug_filtering) {
          console.log(`🔍 [Timeline Card] Entity: ${entity.entity_id}, Category: ${entityCategory}, Config Category: ${this.config.category}, Config Categories: [${(this.config.categories || []).join(', ')}]`);
        }
        
        // Single category filter (Phase 1/2)
        if (this.config.category) {
          console.log(`🔍 [Timeline Card] Testing single category filter: "${entityCategory}" === "${this.config.category}"`);
          const matches = entityCategory === this.config.category;
          if (this.config.debug_filtering) {
            console.log(`🔍 [Timeline Card] Single category filter: ${entityCategory} === ${this.config.category} = ${matches}`);
          }
          if (!matches) {
            console.log(`❌ [Timeline Card] Filtered out ${entity.entity_id} (category: ${entityCategory})`);
            return false;
          } else {
            console.log(`✅ [Timeline Card] Passed filter ${entity.entity_id} (category: ${entityCategory})`);
          }
        }
        
        // Multi-category filter (Phase 3)
        if (this.config.categories && Array.isArray(this.config.categories)) {
          const matches = this.config.categories.includes(entityCategory);
          if (this.config.debug_filtering) {
            console.log(`🔍 [Timeline Card] Multi-category filter: [${this.config.categories.join(', ')}].includes(${entityCategory}) = ${matches}`);
          }
          if (!matches) return false;
        }
        
        if (this.config.debug_filtering) {
          console.log(`✅ [Timeline Card] Entity ${entity.entity_id} passed all filters`);
        }
        
        return true;
      })
      .sort((a, b) => {
        // Priority categories sorting (Phase 3)
        if (this.config.priority_categories && Array.isArray(this.config.priority_categories)) {
          const aCat = a.attributes.category || 'other';
          const bCat = b.attributes.category || 'other';
          const aPriority = this.config.priority_categories.indexOf(aCat);
          const bPriority = this.config.priority_categories.indexOf(bCat);
          
          // If one has priority and other doesn't
          if (aPriority !== -1 && bPriority === -1) return -1;
          if (bPriority !== -1 && aPriority === -1) return 1;
          
          // If both have priority, sort by priority order
          if (aPriority !== -1 && bPriority !== -1 && aPriority !== bPriority) {
            return aPriority - bPriority;
          }
        }
        
        // Default sort by days (chronological)
        return parseInt(a.state) - parseInt(b.state);
      })
      .slice(0, this.config.max_items);
    
    return entities;
  }

  isAnniversaryEntity(entity) {
    /**
     * Determine if an entity is an anniversary entity by checking for 
     * anniversary-specific attributes instead of relying on entity ID patterns.
     * This is more reliable and matches how the integration actually works.
     */
    if (!entity || !entity.attributes) return false;
    
    const attrs = entity.attributes;
    
    // Anniversary entities have these specific attributes
    const hasAnniversaryAttributes = (
      attrs.next_date !== undefined &&           // All anniversaries have next_date
      attrs.current_years !== undefined &&       // All anniversaries track years
      attrs.category !== undefined &&            // All anniversaries have categories
      (attrs.zodiac_sign !== undefined ||        // Most have zodiac signs
       attrs.named_anniversary !== undefined ||   // Or named anniversaries
       attrs.birth_flower !== undefined)         // Or birth flowers
    );
    
    // Additional validation: check if it behaves like an anniversary entity
    const hasValidState = (
      entity.state !== 'unavailable' &&
      !isNaN(parseInt(entity.state)) &&          // State should be days (number)
      parseInt(entity.state) >= 0                // Days should be non-negative
    );
    
    return hasAnniversaryAttributes && hasValidState;
  }

  getIcon(entity) {
    const days = parseInt(entity.state);
    const category = entity.attributes.category || 'other';
    
    // Check for custom emoji first
    if (entity.attributes.custom_emoji) {
      return entity.attributes.custom_emoji;
    }
    
    // Category-specific icons (matching const.py CATEGORY_EMOJIS)
    const categoryIcons = {
      'birthday': '🎂',
      'anniversary': '💕',
      'memorial': '🌹',
      'holiday': '🎉',
      'work': '💼',
      'achievement': '🏆',
      'event': '📅',
      'other': '⭐'
    };
    
    // Special day indicators override category icons (only if no custom emoji)
    if (days === 0) return '🌟'; // Today
    if (days <= 7) return '🔥';  // This week
    
    // Milestone icons for special anniversaries
    if (entity.attributes.is_milestone) return '💎';
    
    // Return category-specific icon or fallback
    return categoryIcons[category] || '📅';
  }

  getZodiacEmoji(sign) {
    const zodiacEmojis = {
      'Aquarius': '♒', 'Pisces': '♓', 'Aries': '♈', 'Taurus': '♉',
      'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍',
      'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑'
    };
    return zodiacEmojis[sign] || '⭐';
  }

  getBirthstoneEmoji(stone) {
    const stoneEmojis = {
      'Garnet': '🔴', 'Amethyst': '🟣', 'Aquamarine': '🔵', 'Diamond': '💎',
      'Emerald': '🟢', 'Pearl': '⚪', 'Ruby': '♦️', 'Peridot': '🟡',
      'Sapphire': '🔷', 'Opal': '🌈', 'Topaz': '🟠', 'Turquoise': '🟦'
    };
    return stoneEmojis[stone] || '💍';
  }

  getColorForDays(days, category = null) {
    if (!this.config.color_coding) return '#FF9800';
    
    // Use category-aware colors if category provided and color scheme enabled
    if (category && this.config.category_color_scheme) {
      return this.getCategoryThemeColors(category, days);
    }
    
    // Universal time-based color scheme: Red (urgent) → Orange (soon) → Green (safe) → Blue (distant)
    if (days === 0) return '#F44336';      // Red - today (urgent!)
    if (days <= 7) return '#FF9800';       // Orange - this week (attention needed)
    if (days <= 30) return '#4CAF50';      // Green - this month (comfortable distance)
    return '#2196F3';                      // Blue - future (distant, calm)
  }

  render() {
    // Prevent race conditions by ensuring both config and hass exist
    if (!this.config || !this._hass) return;
    
    const entities = this.getAnniversaryEntities();
    
    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          padding: 16px;
          margin: 4px;
        }
        .card-header {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 16px;
          color: var(--primary-text-color);
        }
        .timeline-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        .timeline-item:last-child {
          border-bottom: none;
        }
        .timeline-icon {
          font-size: 24px;
          margin-right: 12px;
          min-width: 32px;
        }
        .timeline-content {
          flex: 1;
        }
        .timeline-name {
          font-weight: bold;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .timeline-date {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .timeline-attributes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .attribute-badge {
          background: var(--secondary-background-color);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.8em;
          color: var(--primary-text-color);
        }
        .days-counter {
          text-align: center;
          min-width: 60px;
          font-weight: bold;
          font-size: 1.1em;
          padding: 8px;
          border-radius: 8px;
          color: white;
        }
        .milestone-indicator {
          animation: sparkle 2s infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .no-anniversaries {
          text-align: center;
          color: var(--secondary-text-color);
          padding: 20px;
        }
        /* Phase 3 Advanced Styles */
        .category-stats {
          margin-bottom: 16px;
          padding: 12px;
          background: var(--secondary-background-color);
          border-radius: 8px;
        }
        .stats-header {
          font-weight: bold;
          margin-bottom: 8px;
          color: var(--primary-text-color);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
          margin-bottom: 8px;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--card-background-color);
          border-radius: 4px;
          font-size: 0.9em;
        }
        .stat-emoji { font-size: 1.1em; }
        .stat-label { flex: 1; font-weight: 500; }
        .stat-count { font-weight: bold; color: var(--primary-color); }
        .stat-today { color: #f44336; font-size: 0.8em; }
        .stat-milestones { color: #9c27b0; font-size: 0.8em; }
        .stats-totals {
          font-size: 0.8em;
          color: var(--secondary-text-color);
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid var(--divider-color);
        }
        .category-section {
          margin-bottom: 16px;
        }
        .category-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          border-radius: 6px;
          font-weight: bold;
          color: var(--primary-text-color);
        }
        .category-header-icon { font-size: 1.2em; }
        .category-header-label { flex: 1; }
        .category-header-count { 
          font-size: 0.9em; 
          color: var(--secondary-text-color); 
        }
        .category-items {
          margin-left: 8px;
        }
      </style>
      
      <div class="card">
        <div class="card-header">${this.config.title}</div>
        ${this.config.debug_filtering ? this.renderDebugInfo(entities) : ''}
        ${this.renderCategoryStats(entities)}
        ${entities.length === 0 ? 
          '<div class="no-anniversaries">No upcoming anniversaries</div>' :
          this.config.group_by_category ? 
            this.renderCategoryHeaders(entities) :
            entities.map(entity => this.renderTimelineItem(entity)).join('')
        }
      </div>
    `;
  }

  getCategoryStatistics(entities) {
    const stats = {};
    const totalStats = { total: 0, today: 0, thisWeek: 0, thisMonth: 0, milestones: 0 };
    
    entities.forEach(entity => {
      const category = entity.attributes.category || 'other';
      const days = parseInt(entity.state);
      const isMilestone = entity.attributes.is_milestone;
      
      if (!stats[category]) {
        stats[category] = { count: 0, today: 0, thisWeek: 0, thisMonth: 0, milestones: 0 };
      }
      
      stats[category].count++;
      totalStats.total++;
      
      if (days === 0) {
        stats[category].today++;
        totalStats.today++;
      } else if (days <= 7) {
        stats[category].thisWeek++;
        totalStats.thisWeek++;
      } else if (days <= 30) {
        stats[category].thisMonth++;
        totalStats.thisMonth++;
      }
      
      if (isMilestone) {
        stats[category].milestones++;
        totalStats.milestones++;
      }
    });
    
    return { categories: stats, totals: totalStats };
  }

  renderDebugInfo(entities) {
    if (!this.config.debug_filtering) return '';
    
    const allEntities = Object.keys(this._hass.states)
      .filter(entityId => {
        if (this.config.entities) {
          return this.config.entities.includes(entityId);
        }
        return entityId.match(/^sensor\.anniversary_.*/) && 
               !entityId.includes('upcoming_anniversaries');
      })
      .map(entityId => this._hass.states[entityId])
      .filter(entity => entity && entity.state !== 'unavailable');
    
    const allCategories = allEntities.map(e => e.attributes.category || 'other');
    const filteredCategories = entities.map(e => e.attributes.category || 'other');
    
    return `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 8px; margin: 8px 0; font-size: 12px;">
        <strong>🔍 Debug Info:</strong><br>
        <strong>Config Category:</strong> ${this.config.category || 'none'}<br>
        <strong>Config Categories:</strong> [${(this.config.categories || []).join(', ')}]<br>
        <strong>All Entities Found:</strong> ${allEntities.length} (categories: ${[...new Set(allCategories)].join(', ')})<br>
        <strong>After Filtering:</strong> ${entities.length} (categories: ${[...new Set(filteredCategories)].join(', ')})<br>
        <strong>All Entity Details:</strong><br>
        ${allEntities.map(e => `&nbsp;&nbsp;• ${e.entity_id}: category="${e.attributes.category || 'other'}"`).join('<br>')}
      </div>
    `;
  }

  renderCategoryStats(entities) {
    if (!this.config.show_category_stats) return '';
    
    const stats = this.getCategoryStatistics(entities);
    const categoryConfigs = {};
    
    // Get category configs for display
    Object.keys(stats.categories).forEach(cat => {
      categoryConfigs[cat] = this.getCategoryConfig(cat);
    });
    
    return `
      <div class="category-stats">
        <div class="stats-header">📊 Category Overview</div>
        <div class="stats-grid">
          ${Object.entries(stats.categories).map(([category, stat]) => {
            const config = categoryConfigs[category];
            return `
              <div class="stat-item" style="border-left: 3px solid ${config.color}">
                <span class="stat-emoji">${config.emoji}</span>
                <span class="stat-label">${config.label}</span>
                <span class="stat-count">${stat.count}</span>
                ${stat.today > 0 ? `<span class="stat-today">🌟${stat.today}</span>` : ''}
                ${stat.milestones > 0 ? `<span class="stat-milestones">💎${stat.milestones}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div class="stats-totals">
          Total: ${stats.totals.total} | Today: ${stats.totals.today} | This Week: ${stats.totals.thisWeek} | Milestones: ${stats.totals.milestones}
        </div>
      </div>
    `;
  }

  renderCategoryHeaders(entities) {
    if (!this.config.show_category_headers || !this.config.group_by_category) return '';
    
    // Group entities by category
    const grouped = {};
    entities.forEach(entity => {
      const category = entity.attributes.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(entity);
    });
    
    return Object.entries(grouped).map(([category, categoryEntities]) => {
      const config = this.getCategoryConfig(category);
      const count = categoryEntities.length;
      
      return `
        <div class="category-section">
          <div class="category-header" style="background: linear-gradient(90deg, ${config.color}20, transparent)">
            <span class="category-header-icon">${config.emoji}</span>
            <span class="category-header-label">${config.label}</span>
            <span class="category-header-count">(${count})</span>
          </div>
          <div class="category-items">
            ${categoryEntities.map(entity => this.renderTimelineItem(entity)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderCategoryBadge(category) {
    if (!this.config.show_category_badges || !category || category === 'other') return '';
    
    const categoryConfig = this.getCategoryConfig(category);
    return `
      <span class="category-badge" style="
        background: ${categoryConfig.color}; 
        color: white; 
        padding: 2px 6px; 
        border-radius: 8px; 
        font-size: 0.7em; 
        font-weight: bold;
        margin-left: 8px;
        display: inline-block;
      ">
        ${categoryConfig.emoji} ${categoryConfig.label}
      </span>
    `;
  }

  getCategoryThemeColors(category, days) {
    const baseConfig = this.getCategoryConfig(category);
    const themes = {
      'warm': { // Birthday theme - keep it awesome!
        today: '#FF1493',
        week: '#FF69B4', 
        month: '#FFA500',
        future: '#90EE90'
      },
      'romantic': { // Anniversary theme
        today: '#E91E63',
        week: '#F06292',
        month: '#c086a3ff',
        future: '#90EE90'
      },
      'respectful': { // Memorial theme - gentle colors
        today: '#9C27B0',
        week: '#AB47BC',
        month: '#BA68C8',
        future: '#CE93D8'
      },
      'festive': { // Holiday theme
        today: '#FF5722',
        week: '#FF9800',
        month: '#FFB74D',
        future: '#90EE90'
      },
      'professional': { // Work theme
        today: '#1976D2',
        week: '#2196F3',
        month: '#42A5F5',
        future: '#90EE90'
      },
      'success': { // Achievement theme
        today: '#388E3C',
        week: '#4CAF50',
        month: '#66BB6A',
        future: '#90EE90'
      },
      'neutral': { // Event/Other theme
        today: '#FF1493',
        week: '#FF69B4', 
        month: '#FFA500',
        future: '#90EE90'
      }
    };

    const themeColors = themes[baseConfig.theme] || themes.neutral;
    
    if (days === 0) return themeColors.today;
    if (days <= 7) return themeColors.week;
    if (days <= 30) return themeColors.month;
    return themeColors.future;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    // Safety check: if config is not available, return basic formatting
    if (!this.config) {
      console.warn('Timeline Card: formatDate called before config is set, using fallback');
      try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return dateString; // Fallback to original string
      }
    }
    
    console.log(`🔧 [Timeline Card] formatDate called with: "${dateString}", config.date_format: "${this.config.date_format}"`);
    
    try {
      // Parse the date string (expected format: YYYY-MM-DD)
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Get locale (user-specified or auto-detect)
      const locale = this.config.locale || navigator.language || 'en-US';
      
      console.log(`🔧 [Timeline Card] Parsed date: ${date}, locale: ${locale}`);
      
      // Handle different date format options
      let formattedDate;
      
      switch (this.config.date_format) {
        case 'short':
          // Short format: Jan 1, 2025
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          break;
          
        case 'numeric':
          // Numeric format: 1/1/2025 (respects locale)
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
          break;
          
        case 'full':
          // Full format: Monday, January 1, 2025
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          });
          break;
          
        case 'custom':
          // Custom format using provided pattern
          if (this.config.custom_date_format) {
            formattedDate = this.applyCustomDateFormat(date, this.config.custom_date_format, locale);
          } else {
            // Fallback to long if custom format not provided
            formattedDate = date.toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }
          break;
          
        case 'long':
        default:
          // Long format: January 1, 2025 (default)
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          break;
      }
      
      // Add day of week if requested and not already included
      if (this.config.show_day_of_week && this.config.date_format !== 'full') {
        const dayOfWeek = date.toLocaleDateString(locale, { weekday: 'long' });
        formattedDate = `${dayOfWeek}, ${formattedDate}`;
      }
      
      console.log(`🔧 [Timeline Card] Final formatted date: "${formattedDate}"`);
      return formattedDate;
      
    } catch (error) {
      console.warn('Anniversary Timeline Card: Date formatting error:', error);
      console.warn('Anniversary Timeline Card: Falling back to basic date formatting');
      
      // Better fallback: try basic date formatting instead of returning raw string
      try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        });
      } catch (fallbackError) {
        console.error('Anniversary Timeline Card: Even fallback formatting failed:', fallbackError);
        return dateString; // Last resort: return original string
      }
    }
  }

  applyCustomDateFormat(date, format, locale) {
    // Custom date format patterns
    const patterns = {
      'YYYY': date.getFullYear(),
      'YY': String(date.getFullYear()).slice(-2),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'M': date.getMonth() + 1,
      'MMMM': date.toLocaleDateString(locale, { month: 'long' }),
      'MMM': date.toLocaleDateString(locale, { month: 'short' }),
      'DD': String(date.getDate()).padStart(2, '0'),
      'D': date.getDate(),
      'dddd': date.toLocaleDateString(locale, { weekday: 'long' }),
      'ddd': date.toLocaleDateString(locale, { weekday: 'short' }),
      'dd': date.toLocaleDateString(locale, { weekday: 'narrow' })
    };
    
    let result = format;
    Object.entries(patterns).forEach(([pattern, value]) => {
      result = result.replace(new RegExp(pattern, 'g'), value);
    });
    
    return result;
  }

  renderTimelineItem(entity) {
    const days = parseInt(entity.state);
    const attrs = entity.attributes;
    const icon = this.config.show_icons ? this.getIcon(entity) : '📅';
    const category = attrs.category || 'other';
    const color = this.getColorForDays(days, category);
    const isMilestone = attrs.is_milestone;
    
    return `
      <div class="timeline-item">
        <div class="timeline-icon ${isMilestone ? 'milestone-indicator' : ''}">${icon}</div>
        <div class="timeline-content">
          <div class="timeline-name">
            ${attrs.friendly_name || entity.entity_id}
            ${this.renderCategoryBadge(category)}
          </div>
          <div class="timeline-date">
            ${this.formatDate(attrs.next_date)} 
            ${attrs.years_at_anniversary ? `(${attrs.years_at_anniversary} years)` : ''}
          </div>
          <div class="timeline-attributes">
            ${this.renderAttributes(attrs)}
          </div>
        </div>
        <div class="days-counter" style="background-color: ${color}">
          ${days} day${days !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }

  renderAttributes(attrs) {
    return this.config.show_attributes.map(attr => {
      const value = attrs[attr];
      if (!value) return '';
      
      let emoji = '';
      let display = value;
      
      switch(attr) {
        case 'zodiac_sign':
          emoji = this.getZodiacEmoji(value);
          display = `${emoji} ${value}`;
          break;
        case 'birthstone':
          emoji = this.getBirthstoneEmoji(value);
          display = `${emoji} ${value}`;
          break;
        case 'birth_flower':
          display = `🌸 ${value}`;
          break;
        case 'generation':
          display = `👥 ${value}`;
          break;
        case 'named_anniversary':
          display = `💫 ${value}`;
          break;
        default:
          display = value;
      }
      
      return `<span class="attribute-badge">${display}</span>`;
    }).join('');
  }

  getCardSize() {
    return 3;
  }
}

customElements.define('anniversary-timeline-card', AnniversaryTimelineCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom:anniversary-timeline-card',
  name: 'Anniversary Timeline Card',
  description: 'Advanced anniversary timeline with multi-category support, statistics, and interactive features',
  preview: true
});

console.info(
  '%c  ANNIVERSARY-TIMELINE-CARD  %c  Version 1.3.2 - Config Debug Fix  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
