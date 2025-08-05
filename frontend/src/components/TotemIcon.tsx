// Extend the Window interface for debug groupMeta and cellPositions tracking (per-seed)
declare global {
  interface Window {
    __groupMetaBySeed?: Record<string, string>;
    __cellPositionsBySeed?: Record<string, string>;
  }
}
// Generate a palette object based on status string
export function GenPallete(status: string): Palettes {
  const s = status.toLowerCase();
  if (s === 'blocked') {
    return blockedPalettes;
  }
  if (s === 'planned') {
    return {
      section0: MutedPalettes.section0,
      section1: MutedPalettes.section1,
      section2: MutedPalettes.section2,
      section3: MutedPalettes.section3,
      section4: defaultPalettes.section4,
    };
  }
  if (s === 'open') {
    return {
      section0: MutedPalettes.section0,
      section1: MutedPalettes.section1,
      section2: MutedPalettes.section2,
      section3: defaultPalettes.section3,
      section4: defaultPalettes.section4,
    };
  }
  if (s === 'in-progress') {
    return {
      section0: MutedPalettes.section0,
      section1: MutedPalettes.section1,
      section2: defaultPalettes.section2,
      section3: defaultPalettes.section3,
      section4: defaultPalettes.section4,
    };
  }
  if (s === 'review') {
    return {
      section0: MutedPalettes.section0,
      section1: defaultPalettes.section1,
      section2: defaultPalettes.section2,
      section3: defaultPalettes.section3,
      section4: defaultPalettes.section4,
    };
  }
  return defaultPalettes;
}
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { defaultPalettes, MutedPalettes, blockedPalettes, type Palettes } from './palettes';



interface PaletteEditorProps {
  onPaletteChange: (palettes: Palettes) => void;
  initialPalettes?: Palettes | null;
}

function PaletteEditor({ onPaletteChange, initialPalettes = null }: PaletteEditorProps) {

  const [palettes, setPalettes] = useState<Palettes>(initialPalettes || defaultPalettes);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sectionNames = ['Sunset', 'Ocean', 'Dreams', 'Forest', 'Coral'];


  // Deep copy utility for palettes
  const deepCopyPalettes = (src: Palettes): Palettes => {
    return {
      section0: { ...src.section0, colors: [...src.section0.colors] },
      section1: { ...src.section1, colors: [...src.section1.colors] },
      section2: { ...src.section2, colors: [...src.section2.colors] },
      section3: { ...src.section3, colors: [...src.section3.colors] },
      section4: { ...src.section4, colors: [...src.section4.colors] },
    };
  };

  const updateColor = (sectionKey: keyof Palettes, type: 'colors' | 'background' | 'border', index: number | null, newColor: string) => {
    const updatedPalettes = deepCopyPalettes(palettes);
    if (type === 'colors' && index !== null) {
      updatedPalettes[sectionKey].colors[index] = newColor;
    } else if (type === 'background') {
      updatedPalettes[sectionKey].background = newColor;
    } else if (type === 'border') {
      updatedPalettes[sectionKey].border = newColor;
    }
    setPalettes(updatedPalettes);
    onPaletteChange(updatedPalettes);
  };

  const addColor = (sectionKey: keyof Palettes) => {
    const updatedPalettes = deepCopyPalettes(palettes);
    updatedPalettes[sectionKey].colors.push('#FFFFFF');
    setPalettes(updatedPalettes);
    onPaletteChange(updatedPalettes);
  };

  const removeColor = (sectionKey: keyof Palettes, index: number) => {
    if (palettes[sectionKey].colors.length <= 1) return;
    const updatedPalettes = deepCopyPalettes(palettes);
    updatedPalettes[sectionKey].colors.splice(index, 1);
    setPalettes(updatedPalettes);
    onPaletteChange(updatedPalettes);
  };

  const resetToDefaults = () => {
    setPalettes(defaultPalettes);
    onPaletteChange(defaultPalettes);
  };

  const exportPalettes = () => {
    const dataStr = JSON.stringify(palettes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'totem-icon-palettes.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Palette Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Reset
          </button>
          <button
            onClick={exportPalettes}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Export
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(palettes).map(([sectionKey, section], sectionIndex) => (
          <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === sectionKey ? null : sectionKey)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">Section {sectionIndex}: {sectionNames[sectionIndex]}</span>
                <div className="flex gap-1">
                  {section.colors.slice(0, 3).map((color: string, i: number) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {section.colors.length > 3 && (
                    <span className="text-xs text-gray-500">+{section.colors.length - 3}</span>
                  )}
                </div>
              </div>
              <span className="text-gray-400">
                {expandedSection === sectionKey ? '▼' : '▶'}
              </span>
            </button>

            {expandedSection === sectionKey && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-20">Background:</label>
                  <input
                    type="color"
                    value={section.background}
                    onChange={(e) => updateColor(sectionKey as keyof Palettes, 'background', null, e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={section.background}
                    onChange={(e) => updateColor(sectionKey as keyof Palettes, 'background', null, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-20">Border:</label>
                  <input
                    type="color"
                    value={section.border}
                    onChange={(e) => updateColor(sectionKey as keyof Palettes, 'border', null, e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={section.border}
                    onChange={(e) => updateColor(sectionKey as keyof Palettes, 'border', null, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Palette Colors:</label>
                    <button
                      onClick={() => addColor(sectionKey as keyof Palettes)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {section.colors.map((color: string, colorIndex: number) => (
                      <div key={colorIndex} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(sectionKey as keyof Palettes, 'colors', colorIndex, e.target.value)}
                          className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => updateColor(sectionKey as keyof Palettes, 'colors', colorIndex, e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                        />
                        {section.colors.length > 1 && (
                          <button
                            onClick={() => removeColor(sectionKey as keyof Palettes, colorIndex)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Cell {
  dx: number;
  dy: number;
  x: number;
  y: number;
  c: string;
  m: boolean;
  section: number;
}

interface TotemIconProps {
  seed?: string | null;
  onPngGenerated?: ((dataUrl: string) => void) | null;
  palettes?: Palettes | null;
  size?: number;
  showControls?: boolean;
  highRes?: boolean;
}

function deepFreeze<T>(obj: T): T {
  Object.getOwnPropertyNames(obj).forEach(function(name) {
    const prop = (obj as any)[name];
    if (typeof prop === 'object' && prop !== null) deepFreeze(prop);
  });
  return Object.freeze(obj);
}

function deepCopyPalettes(src: Palettes): Palettes {
  return {
    section0: { ...src.section0, colors: [...src.section0.colors] },
    section1: { ...src.section1, colors: [...src.section1.colors] },
    section2: { ...src.section2, colors: [...src.section2.colors] },
    section3: { ...src.section3, colors: [...src.section3.colors] },
    section4: { ...src.section4, colors: [...src.section4.colors] },
  };
}

function TotemIcon({ 
  seed = null, 
  onPngGenerated = null, 
  palettes = null,
  size = 5,
  showControls = true,
  highRes = false
}: TotemIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pngUrl, setPngUrl] = useState<string>('');
  const [cells, setCells] = useState<Cell[]>([]);

  // Simple deterministic hash function
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // Seeded random number generator
  const createSeededRandom = (seed: number) => {
    let seedValue = seed;
    return () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
  };



  // Use a lazy initializer so randomSeed is only generated once per mount if seed is not provided

  // Only generate a random seed once per mount if seed is not provided
  const [randomSeed] = useState<string>(() => {
    if (seed == null) {
      return Math.random().toString(36).slice(2);
    }
    return '';
  });

  // Always use the provided seed if present, otherwise use the randomSeed
  const getRng = useCallback(() => {
    const useSeed = seed != null ? seed : (randomSeed || 'fallback');
    return createSeededRandom(simpleHash(useSeed));
  }, [seed, randomSeed]);

  // Use provided palettes or default ones, always deep copy and freeze to prevent mutation/reference bugs
  const activePalettes = useMemo(() => deepFreeze(deepCopyPalettes(palettes || defaultPalettes)), [palettes]);

  // Memoize harmonicPalettes so it doesn't break memoization in hooks
  // Always enforce palette length of 5 for each section for stability
  const enforcePaletteLength = (arr: string[], len = 5, fill = '#000000') => {
    if (arr.length === len) return arr.slice();
    if (arr.length > len) return arr.slice(0, len);
    return arr.concat(Array(len - arr.length).fill(fill));
  };

  // Palette colors are only used for color assignment, never for pattern/group generation
  // Always enforce palette length of 5 for each section for stability
  const harmonicPalettes = useMemo(() => [
    enforcePaletteLength(activePalettes.section0.colors),
    enforcePaletteLength(activePalettes.section1.colors),
    enforcePaletteLength(activePalettes.section2.colors),
    enforcePaletteLength(activePalettes.section3.colors),
    enforcePaletteLength(activePalettes.section4.colors)
  ], [activePalettes]);

  const sectionBackgrounds = useMemo(() => [
    activePalettes.section0?.background || defaultPalettes.section0.background,
    activePalettes.section1?.background || defaultPalettes.section1.background,
    activePalettes.section2?.background || defaultPalettes.section2.background,
    activePalettes.section3?.background || defaultPalettes.section3.background,
    activePalettes.section4?.background || defaultPalettes.section4.background
  ], [activePalettes]);

  const sectionBorderColors = useMemo(() => [
    activePalettes.section0?.border || defaultPalettes.section0.border,
    activePalettes.section1?.border || defaultPalettes.section1.border,
    activePalettes.section2?.border || defaultPalettes.section2.border,
    activePalettes.section3?.border || defaultPalettes.section3.border,
    activePalettes.section4?.border || defaultPalettes.section4.border
  ], [activePalettes]);

  // Ensure rows is always divisible by sections for a perfect grid
  const sections = 5;
  const cols = highRes ? 24 : 12;
  // Pick a row count divisible by sections (e.g., 30 or 35 for 5 sections)
  const rows = highRes ? 60 : 30; // 60/5=12, 30/5=6
  const config = useMemo(() => ({
    cols,
    rows,
    cellSize: size, // This affects canvas display size only
    logicalCellSize: 1, // This keeps the design pattern consistent
    sections
  }), [cols, rows, size, sections]);

  const floodfill = useCallback((c: Cell, cells: Cell[]): Cell[] => {
    let q: Cell[] = [];
    if (!c.m) {
      c.m = true;
      q.push(c);
    }
    let group: Cell[] = [];

    while (q.length > 0) {
      let current = q.pop()!;
      group.push(current);
      let neighbors = getNeighbors(current.x, current.y, current.section, cells);

      neighbors.forEach(_c => {
        if (!_c.m) {
          _c.m = true;
          q.push(_c);
        }
      });
    }
    return group;
  }, []);

  const getNeighbors = (x: number, y: number, section: number, cells: Cell[]): Cell[] => {
    return cells.filter(_c => {
      if (_c.section !== section) return false;
      return (
        (x + 1 === _c.x && y === _c.y) ||
        (x - 1 === _c.x && y === _c.y) ||
        (x === _c.x && y + 1 === _c.y) ||
        (x === _c.x && y - 1 === _c.y)
      );
    });
  };

  // Assign groups deterministically based only on the seed and grid, not the palette
  // This function does NOT use the palette for group assignment or as a dependency
  const getGroups = useCallback((cells: Cell[]): { groups: Cell[][], groupMeta: { section: number; groupIndex: number; }[] } => {
    cells.forEach(c => c.m = false);
    let groups: Cell[][] = [];
    let groupMeta: { section: number; groupIndex: number; }[] = [];
    let groupCounter = [0, 0, 0, 0, 0]; // One counter per section
    cells.forEach(c => {
      if (!c.m) {
        let group = floodfill(c, cells);
        if (group.length > 0) {
          groups.push(group);
          let section = group[0].section;
          let groupIndex = groupCounter[section];
          groupCounter[section]++;
          groupMeta.push({ section, groupIndex });
        }
      }
    });
    return { groups, groupMeta };
  }, [floodfill]);

  // Pure pattern/cell/group generation: depends ONLY on seed/config
  interface PatternConfig {
    cols: number;
    rows: number;
    cellSize: number;
    logicalCellSize: number;
    sections: number;
  }

  function generatePattern(
    seed: string | null,
    config: PatternConfig,
    rng: () => number,
    getGroups: (cells: Cell[]) => { groups: Cell[][]; groupMeta: { section: number; groupIndex: number }[] }
  ) {
    let newCells: Cell[] = [];
    let n = config.cols / 2;
    let sectionHeight = config.rows / config.sections;
    for (let section = 0; section < config.sections; section++) {
      let startY = section * sectionHeight;
      let endY = (section + 1) * sectionHeight;
      for (let y = startY; y < endY; y++) {
        let randomValue = rng();
        let binaryString = '';
        for (let i = 0; i < n; i++) {
          randomValue = randomValue * 2;
          if (randomValue >= 1) {
            binaryString += '1';
            randomValue -= 1;
          } else {
            binaryString += '0';
          }
        }
        let points = binaryString.split("");
        points.forEach((p, i) => {
          if (p === "1") {
            newCells.push({
              dx: i,
              dy: y,
              x: i,
              y: y,
              c: '#000000',
              m: false,
              section: section
            });
          }
        });
      }
    }
    const { groups, groupMeta } = getGroups(newCells);
    return { newCells, groups, groupMeta };
  }

  // Color assignment: assign colors to cells after pattern is generated
  const generateCells = useCallback((): Cell[] => {
    // Always use the seed prop for deterministic pattern
    const rng = getRng();
    const { newCells, groups, groupMeta } = generatePattern(seed ?? randomSeed, config, rng, getGroups);

    // Assign colors using the current palette, but deterministically by group index
    groupMeta.forEach(({ section, groupIndex }: { section: number; groupIndex: number }, i: number) => {
      const colorCount = harmonicPalettes[section].length;
      const colorIndex = groupIndex % colorCount;
      groups[i].forEach((cell: Cell) => {
        cell.c = harmonicPalettes[section][colorIndex];
      });
    });
    return newCells;
  }, [getRng, config, getGroups, harmonicPalettes]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawTotemIcon = useCallback((cells: Cell[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.cols * config.cellSize;
    const height = config.rows * config.cellSize;

    let sectionHeightPixels = config.rows / config.sections; // always integer
    let pixelSize = config.cellSize;

    for (let i = 0; i < config.sections; i++) {
      let startY = i * sectionHeightPixels * pixelSize;
      let sectionHeight = sectionHeightPixels * pixelSize;

      ctx.fillStyle = sectionBackgrounds[i];
      ctx.fillRect(0, startY, width, sectionHeight);

      ctx.fillStyle = sectionBorderColors[i];

      if (i === 0) {
        ctx.fillRect(pixelSize, startY, width - 2 * pixelSize, pixelSize);
        ctx.fillRect(0, startY + pixelSize, pixelSize, sectionHeight - pixelSize);
        ctx.fillRect(width - pixelSize, startY + pixelSize, pixelSize, sectionHeight - pixelSize);
        ctx.fillRect(0, startY + sectionHeight - pixelSize, width, pixelSize);
      } else if (i === config.sections - 1) {
        ctx.fillRect(0, startY, width, pixelSize);
        ctx.fillRect(0, startY + pixelSize, pixelSize, sectionHeight - 2 * pixelSize);
        ctx.fillRect(width - pixelSize, startY + pixelSize, pixelSize, sectionHeight - 2 * pixelSize);
        ctx.fillRect(pixelSize, startY + sectionHeight - pixelSize, width - 2 * pixelSize, pixelSize);
      } else {
        ctx.fillRect(0, startY, width, pixelSize);
        ctx.fillRect(0, startY + pixelSize, pixelSize, sectionHeight - 2 * pixelSize);
        ctx.fillRect(width - pixelSize, startY + pixelSize, pixelSize, sectionHeight - 2 * pixelSize);
        ctx.fillRect(0, startY + sectionHeight - pixelSize, width, pixelSize);
      }
    }

    ctx.fillStyle = '#646464';
    let borderSize = config.cellSize;
    ctx.fillRect(-borderSize, -borderSize, width + 2 * borderSize, borderSize);
    ctx.fillRect(-borderSize, height, width + 2 * borderSize, borderSize);
    ctx.fillRect(-borderSize, -borderSize, borderSize, height + 2 * borderSize);
    ctx.fillRect(width, -borderSize, borderSize, height + 2 * borderSize);

    // Draw each cell and its mirrored counterpart, pixel-perfect
    cells.forEach(c => {
      ctx.fillStyle = c.c;
      // Always use Math.round to avoid subpixel rendering
      const displayX = Math.round(c.dx * config.cellSize);
      const displayY = Math.round(c.dy * config.cellSize);
      const cellSize = Math.round(config.cellSize);
      // Draw left half
      ctx.fillRect(displayX, displayY, cellSize, cellSize);
      // Draw mirrored right half
      const mirrorX = Math.round(config.cellSize * config.cols - displayX - cellSize);
      if (mirrorX !== displayX) {
        ctx.fillRect(mirrorX, displayY, cellSize, cellSize);
      }
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const dataURL = canvas.toDataURL('image/png');
      setPngUrl(dataURL);
      if (onPngGenerated) {
        onPngGenerated(dataURL);
      }
    }, 10);
  }, [config.cols, config.rows, config.sections, config.cellSize, sectionBackgrounds, sectionBorderColors, onPngGenerated]);

  // No-op for handleGenerate, as randomSeed is now fixed per mount
  const handleGenerate = () => {};

  const handleSave = () => {
    if (pngUrl) {
      const link = document.createElement('a');
      link.download = `totem-icon-${Date.now()}.png`;
      link.href = pngUrl;
      link.click();
    }
  };

  // Generate cells when seed, palette, or config changes
  useEffect(() => {
    // Only update cells if the dependencies change
    const newCells = generateCells();
    setCells(newCells);
  }, [generateCells]);


  // Draw when cells or palettes change
  useEffect(() => {
    if (cells.length > 0) {
      drawTotemIcon(cells);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [cells, drawTotemIcon]);

  return (
    <div className="flex flex-col items-center">
      {showControls && (
        <>
          <div className="text-center text-gray-600 mb-6 max-w-md">
            <p>Each vertical section uses a different harmonic color palette.</p>
            {seed ? (
              <p className="text-sm mt-2 font-mono bg-gray-200 px-2 py-1 rounded">
                Seed: {seed}
              </p>
            ) : (
              <p className="text-sm mt-2">Click "Generate New" to create a unique pattern!</p>
            )}
            {palettes && (
              <p className="text-xs mt-1 text-gray-500">Using custom palettes</p>
            )}
            {highRes && (
              <p className="text-xs mt-1 text-blue-600 font-semibold">High Resolution Mode (2x detail)</p>
            )}
          </div>
          
          <div className="flex gap-4 mb-6">
            {!seed && (
              <button 
                onClick={handleGenerate}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Generate New
              </button>
            )}
            <button 
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Save PNG
            </button>
          </div>
        </>
      )}
      
      <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-gray-300">
        <canvas
          ref={canvasRef}
          width={config.cols * config.cellSize}
          height={config.rows * config.cellSize}
          className="block cursor-pointer"
          onClick={!seed && showControls ? handleGenerate : undefined}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
      
      {showControls && pngUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Generated PNG:</h3>
          <img 
            src={pngUrl} 
            alt="Generated Totem Icon"
            className="border-2 border-gray-300 rounded-lg shadow-md"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}
    </div>
  );
}

interface TotemIconGeneratorProps {
  showPaletteEditor?: boolean;
}

export default function TotemIconGenerator({ showPaletteEditor = true }: TotemIconGeneratorProps) {
  const [currentPalettes, setCurrentPalettes] = useState<Palettes | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [testSeed, setTestSeed] = useState('john@example.com');
  const [highRes, setHighRes] = useState(false);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Totem Icon Generator</h1>
      
      {showPaletteEditor && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showEditor 
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            {showEditor ? 'Hide' : 'Show'} Palette Editor
          </button>
          
          <button
            onClick={() => setHighRes(!highRes)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              highRes 
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {highRes ? 'Standard' : 'High-Res'} Mode
          </button>
        </div>
      )}

      {showEditor && (
        <div className="mb-6 w-full max-w-4xl">
          <PaletteEditor 
            onPaletteChange={setCurrentPalettes}
            initialPalettes={currentPalettes}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Seed (leave empty for random):
        </label>
        <input
          type="text"
          value={testSeed}
          onChange={(e) => setTestSeed(e.target.value)}
          placeholder="Enter a string to generate deterministic totem icon"
          className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm w-80"
        />
      </div>

      <TotemIcon 
        seed={testSeed || null}
        palettes={currentPalettes}
        highRes={highRes}
        onPngGenerated={(dataUrl) => console.log('PNG Generated:', dataUrl)}
      />
    </div>
  );
}

export { TotemIcon, PaletteEditor };
export type { TotemIconProps };
// Palettes and PaletteSection types, and palette constants, are exported from palettes.ts
