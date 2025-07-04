# TotemIcon Component

A React component that generates unique, deterministic icons based on input seeds. Each icon features 5 vertical sections with harmonic color palettes and symmetrical patterns.

## Features

- **Deterministic Generation**: Same seed always produces the same icon
- **Customizable Palettes**: 5 distinct color sections with editable palettes
- **Configurable Size**: Adjustable pixel size for different use cases
- **PNG Export**: Built-in functionality to save icons as PNG files
- **TypeScript Support**: Full type definitions included

## Installation

Copy the `TotemIcon.tsx` file to your React project's components directory.

## Basic Usage

```tsx
import { TotemIcon } from './components/TotemIcon';

// Generate a deterministic icon for a user
<TotemIcon 
  seed="user@example.com" 
  showControls={false} 
  size={3} 
/>

// Random generation with controls
<TotemIcon 
  seed={null} 
  showControls={true} 
  size={4} 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `seed` | `string \| null` | `null` | Input string for deterministic generation. Use `null` for random generation |
| `size` | `number` | `5` | Pixel size of each cell in the icon |
| `showControls` | `boolean` | `true` | Whether to show generation and save buttons |
| `palettes` | `Palettes \| null` | `null` | Custom color palettes (see Palette Customization) |
| `onPngGenerated` | `function \| null` | `null` | Callback function when PNG is generated |

## Palette Customization

Use the `PaletteEditor` component to customize colors:

```tsx
import { TotemIcon, PaletteEditor, type Palettes } from './components/TotemIcon';
import { useState } from 'react';

function MyComponent() {
  const [customPalettes, setCustomPalettes] = useState<Palettes | null>(null);

  return (
    <div>
      <PaletteEditor 
        onPaletteChange={setCustomPalettes}
        initialPalettes={customPalettes}
      />
      
      <TotemIcon 
        seed="my-app" 
        palettes={customPalettes}
        showControls={true}
      />
    </div>
  );
}
```

### Palette Structure

```tsx
type PaletteSection = {
  colors: string[];     // Array of hex color codes
  background: string;   // Section background color
  border: string;       // Section border color
};

type Palettes = {
  section0: PaletteSection;  // Sunset theme
  section1: PaletteSection;  // Ocean theme
  section2: PaletteSection;  // Dreams theme
  section3: PaletteSection;  // Forest theme
  section4: PaletteSection;  // Coral theme
};
```

## Use Cases

### User Avatars
```tsx
<TotemIcon 
  seed={user.email} 
  showControls={false} 
  size={2}
/>
```

### Application Icons
```tsx
<TotemIcon 
  seed="MyApp-v1.0" 
  showControls={false} 
  size={6}
  onPngGenerated={(dataUrl) => {
    // Save or use the generated PNG
    console.log('Icon generated:', dataUrl);
  }}
/>
```

### Dynamic Branding
```tsx
<TotemIcon 
  seed={`${company.name}-${theme.name}`} 
  palettes={brandPalettes}
  showControls={false} 
  size={4}
/>
```

## Icon Structure

Each TotemIcon consists of:
- **5 Vertical Sections**: Each with distinct color themes
- **Symmetrical Pattern**: Left and right sides mirror each other
- **32x12 Grid**: Total dimensions with configurable cell size
- **Flood-fill Algorithm**: Groups connected cells and assigns colors

## Default Color Themes

1. **Section 0 (Sunset)**: Warm oranges and reds
2. **Section 1 (Ocean)**: Cool blues and teals
3. **Section 2 (Dreams)**: Purples and pinks
4. **Section 3 (Forest)**: Greens and blues
5. **Section 4 (Coral)**: Warm coral and orange tones

## Browser Compatibility

- Requires modern browsers with Canvas API support
- Works with React 16.8+ (hooks support)
- TypeScript 4.0+ for type definitions

## License

This component is based on the harmonic hashicon concept and adapted for the Totem project.
