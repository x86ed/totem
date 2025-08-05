
// Palette constants and types for TotemIcon
//
// This file only defines color palette data and types.
// It does not contain any logic or code that affects icon generation or rendering.
// The palette objects here are pure data and do not influence the deterministic output
// of the TotemIcon component unless explicitly passed as a prop.

export interface PaletteSection {
  colors: string[];
  background: string;
  border: string;
}

export interface Palettes {
  section0: PaletteSection;
  section1: PaletteSection;
  section2: PaletteSection;
  section3: PaletteSection;
  section4: PaletteSection;
}

export const defaultPalettes: Palettes = {
  section0: {
    colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF8C42', '#C73E1D'],
    background: '#FFF3E0',
    border: '#C73E1D'
  },
  section1: {
    colors: ['#0D7377', '#14A085', '#A4F1D1', '#7FDBDA', '#41B3A3'],
    background: '#E0F7FA',
    border: '#0D7377'
  },
  section2: {
    colors: ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055'],
    background: '#F3E5F5',
    border: '#6C5CE7'
  },
  section3: {
    colors: ['#00B894', '#00CEC9', '#55A3FF', '#74B9FF', '#81ECEC'],
    background: '#E8F5E8',
    border: '#00B894'
  },
  section4: {
    colors: ['#FF7675', '#FD79A8', '#FDCB6E', '#E17055', '#F39C12'],
    background: '#FFF3E0',
    border: '#E17055'
  }
};

export const MutedPalettes: Palettes = {
  section0: {
    colors: [
      '#66533d', '#b9b4ac', '#835c54', '#66533e', '#835c53'
    ],
    background: '#b9b4ac',
    border: '#835c54'
  },
  section1: {
    colors: [
      '#3a5550', '#aab1b1', '#647c7d', '#3a5551', '#647c7e'
    ],
    background: '#aab1b1',
    border: '#647c7d'
  },
  section2: {
    colors: [
      '#4a4681', '#9f9ca0', '#716c93', '#4a4682', '#716c92'
    ],
    background: '#9f9ca0',
    border: '#716c93'
  },
  section3: {
    colors: [
      '#496e67', '#979b97', '#284d46', '#496e68', '#284d47'
    ],
    background: '#979b97',
    border: '#284d46'
  },
  section4: {
    colors: [
      '#74493e', '#a89f9f', '#a68982', '#74493d', '#a68983'
    ],
    background: '#a89f9f',
    border: '#a68982'
  }
};

export const blockedPalettes: Palettes = {
  section0: {
    colors: [
      '#e00000', '#b80000', '#9e0000', '#570000', '#000000'
    ],
    background: '#ff0000',
    border: '#940000'
  },
  section1: {
    colors: [
      '#e00000', '#b80000', '#9e0000', '#570000', '#000000'
    ],
    background: '#ff0000',
    border: '#940000'
  },
  section2: {
    colors: [
      '#e00000', '#b80000', '#930000', '#570000', '#000000'
    ],
    background: '#ff0000',
    border: '#940000'
  },
  section3: {
    colors: [
      '#e00000', '#b80000', '#9e0000', '#570000', '#000000'
    ],
    background: '#ff0000',
    border: '#940000'
  },
  section4: {
    colors: [
      '#e00000', '#b80000', '#9e0000', '#570000', '#000000'
    ],
    background: '#FF0000',
    border: '#940000'
  }
};
