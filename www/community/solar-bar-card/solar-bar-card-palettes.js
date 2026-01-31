// solar-bar-card-palettes.js
// Color palette definitions for Solar Bar Card
// Version 2.0.0 - Added battery colors

export const COLOR_PALETTES = {
  'classic-solar': {
    name: 'Classic Solar',
    icon: '🌞',
    description: 'Bright, traditional solar colors',
    colors: {
      solar: '#FFE082',
      export: '#A5D6A7',
      import: '#FFAB91',
      self_usage: '#B39DDB',
      ev_charge: '#81D4FA',
      battery_bar: '#90CAF9',
      battery_charge: '#80DEEA',
      battery_discharge: '#64B5F6'
    }
  },
  'soft-meadow': {
    name: 'Soft Meadow',
    icon: '🌸',
    description: 'Gentle pastels with spring vibes',
    colors: {
      solar: '#FFF59D',
      export: '#C5E1A5',
      import: '#FFCCBC',
      self_usage: '#D1C4E9',
      ev_charge: '#B2EBF2',
      battery_bar: '#B2EBF2',
      battery_charge: '#B2DFDB',
      battery_discharge: '#90CAF9'
    }
  },
  'ocean-sunset': {
    name: 'Ocean Sunset',
    icon: '🌊',
    description: 'Warm sunset meets cool ocean',
    colors: {
      solar: '#FFECB3',
      export: '#A8E6CF',
      import: '#FFD4BA',
      self_usage: '#E6D5F0',
      ev_charge: '#B3E5FC',
      battery_bar: '#B3E5FC',
      battery_charge: '#A5D6E8',
      battery_discharge: '#81C7E8'
    }
  },
  'garden-fresh': {
    name: 'Garden Fresh',
    icon: '🌿',
    description: 'Natural greens and soft tones',
    colors: {
      solar: '#FFF9C4',
      export: '#C8E6C9',
      import: '#FFCCBC',
      self_usage: '#C5CAE9',
      ev_charge: '#B2DFDB',
      battery_bar: '#B2DFDB',
      battery_charge: '#9ED4CC',
      battery_discharge: '#80CBC4'
    }
  },
  'peachy-keen': {
    name: 'Peachy Keen',
    icon: '🍑',
    description: 'Warm peach and lavender blend',
    colors: {
      solar: '#FFF4C4',
      export: '#B8E6B8',
      import: '#FFC4B3',
      self_usage: '#D4C5E8',
      ev_charge: '#B3D9E6',
      battery_bar: '#B3D9E6',
      battery_charge: '#A0DBE6',
      battery_discharge: '#7EC8DB'
    }
  },
  'cloudy-day': {
    name: 'Cloudy Day',
    icon: '☁️',
    description: 'Soft, cloudy sky palette',
    colors: {
      solar: '#FFFACD',
      export: '#B4E6C3',
      import: '#FFDAC1',
      self_usage: '#D4DAEC',
      ev_charge: '#C4E4F5',
      battery_bar: '#C4E4F5',
      battery_charge: '#B0D9E8',
      battery_discharge: '#9CCFDF'
    }
  },
  'floral-charm': {
    name: 'Floral Charm',
    icon: '🌸',
    description: 'Lush, floral-inspired colours — soft petals to leafy accents',
    colors: {
      solar: '#FFD6E0',         // pale blossom
      export: '#C8E6C9',        // mint leaf
      import: '#FFB4A2',        // coral petal
      self_usage: '#E7C6FF',    // lavender bloom
      ev_charge: '#A7E9F7',     // morning dew
      battery_bar: '#A7E9F7',
      battery_charge: '#9EE3C8',// soft sage
      battery_discharge: '#FF8DAA'// punchy rose
    }
  },

  'bold-block': {
    name: 'Bold Block',
    icon: '🟥',
    description: 'High-contrast colour-blocking for maximum readability',
    colors: {
      solar: '#FF6B35',         // tangerine
      export: '#FFD400',        // vivid yellow
      import: '#FF3B6F',        // punch pink
      self_usage: '#2D9CDB',    // vivid blue
      ev_charge: '#0DBA7A',     // teal green
      battery_bar: '#0DBA7A',
      battery_charge: '#333333',// dark neutral
      battery_discharge: '#111111'// near-black accent
    }
  },

  'pastel-skies': {
    name: 'Pastel Skies',
    icon: '☁️',
    description: 'Soft pastels for a calm, airy dashboard look',
    colors: {
      solar: '#FFF1C9',         // warm cream
      export: '#CFEAF9',        // sky blue
      import: '#FFD9E2',        // soft pink
      self_usage: '#EAD7FF',    // pale lilac
      ev_charge: '#D7F7E2',     // seafoam
      battery_bar: '#D7F7E2',
      battery_charge: '#FBE6C6',// peachy highlight
      battery_discharge: '#C2D9FF'// soft blue discharge
    }
  },

  'neon-daze': {
    name: 'Neon Daze',
    icon: '⚡',
    description: 'Bright neon brights for a punchy, modern look',
    colors: {
      solar: '#FFFA3C',         // neon yellow
      export: '#00FFC6',        // electric mint
      import: '#FF2D95',        // magenta neon
      self_usage: '#7C4DFF',    // electric purple
      ev_charge: '#00B0FF',     // electric blue
      battery_bar: '#00B0FF',
      battery_charge: '#00FF7F',// neon green
      battery_discharge: '#FF6F00'// hot orange
    }
  },

  'retro-vibes': {
    name: 'Retro Vibes',
    icon: '📻',
    description: 'Warm ’70s-inspired hues — nostalgic and cosy',
    colors: {
      solar: '#FFD166',         // mustard
      export: '#F4A261',        // warm terracotta
      import: '#E76F51',        // burnt coral
      self_usage: '#2A9D8F',    // teal retro
      ev_charge: '#264653',     // deep slate
      battery_bar: '#264653',
      battery_charge: '#F7B267',// soft gold
      battery_discharge: '#B07A5A'// brown accent
    }
  },

  'camouflage': {
    name: 'Camouflage',
    icon: '🪖',
    description: 'Muted military greens and earth tones for a rugged look',
    colors: {
      solar: '#C4B29A',         // sand
      export: '#9AA67A',        // sage
      import: '#7A8B58',        // olive
      self_usage: '#5A6B45',    // dark olive
      ev_charge: '#3D4F3A',     // forest
      battery_bar: '#3D4F3A',
      battery_charge: '#6D5A46',// brown earth
      battery_discharge: '#2E2B26'// deep charcoal
    }
  },

  'psychedelic-pop': {
    name: 'Psychedelic Pop',
    icon: '🌀',
    description: 'Bold, trippy colours for a playful, loud dashboard',
    colors: {
      solar: '#FF4D6D',         // electric rose
      export: '#FFB84D',        // pop orange
      import: '#7FFF6C',        // lime pop
      self_usage: '#5CC5FF',    // bright cyan
      ev_charge: '#B06AFF',     // neon purple
      battery_bar: '#B06AFF',
      battery_charge: '#FF6FFF',// hot pink charge
      battery_discharge: '#2D2DFF'// electric indigo
    }
  },

  'muted-earth': {
    name: 'Muted Earth',
    icon: '🌾',
    description: 'Low-saturation earth tones for a subtle, classy UI',
    colors: {
      solar: '#FAE8D6',         // soft sand
      export: '#D7E7D0',        // pale moss
      import: '#EAC9B7',        // clay
      self_usage: '#D6CFE5',    // dusty mauve
      ev_charge: '#BFD7D5',     // muted aqua
      battery_bar: '#BFD7D5',
      battery_charge: '#CFC2A9',// stone
      battery_discharge: '#8C8476'// taupe
    }
  },
  'custom': {
    name: 'Custom',
    icon: '🎨',
    description: 'Define your own colors',
    colors: {
      solar: '#FFD700',
      export: '#90EE90',
      import: '#FF6B6B',
      self_usage: '#9370DB',
      ev_charge: '#87CEEB',
      battery_bar: '#87CEEB',
      battery_charge: '#4DD0E1',
      battery_discharge: '#42A5F5'
    }
  }
};

// Helper function to get colors from config
export function getCardColors(config) {
  const palette = config.color_palette || 'classic-solar';

  // Start with palette colors
  let colors = COLOR_PALETTES[palette]?.colors || COLOR_PALETTES['classic-solar'].colors;

  // Override with any custom colors provided
  if (config.custom_colors) {
    colors = {
      ...colors,
      ...config.custom_colors
    };
  }

  return colors;
}

// Get palette options for selector
export function getPaletteOptions() {
  return Object.keys(COLOR_PALETTES).map(key => ({
    value: key,
    label: `${COLOR_PALETTES[key].icon} ${COLOR_PALETTES[key].name}`
  }));
}

// Apply selected palette colors as CSS variables
export function applyPaletteColors(config) {
  const colors = getCardColors(config);

  // Set each palette color as a CSS variable
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
}
