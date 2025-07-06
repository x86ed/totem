import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface PaletteSection {
  colors: string[];
  background: string;
  border: string;
}

interface Palettes {
  section0: PaletteSection;
  section1: PaletteSection;
  section2: PaletteSection;
  section3: PaletteSection;
  section4: PaletteSection;
}

// Shared default palettes used throughout the component
const defaultPalettes: Palettes = {
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

interface PaletteEditorProps {
  onPaletteChange: (palettes: Palettes) => void;
  initialPalettes?: Palettes | null;
}

function PaletteEditor({ onPaletteChange, initialPalettes = null }: PaletteEditorProps) {

//   const neutralPalettes: Palettes = {
//     section0: {
//       colors: ['#8B7355', '#A0916B', '#B5A082', '#6B5B47', '#9B8A70'],
//       background: '#F5F3F0',
//       border: '#6B5B47'
//     },
//     section1: {
//       colors: ['#7A7A7A', '#949494', '#ADADAD', '#666666', '#8F8F8F'],
//       background: '#F0F0F0',
//       border: '#666666'
//     },
//     section2: {
//       colors: ['#6B5B73', '#8A7A8F', '#A399A8', '#5A4A5E', '#7D6D82'],
//       background: '#F2F0F3',
//       border: '#5A4A5E'
//     },
//     section3: {
//       colors: ['#6B7A6B', '#82938A', '#99A899', '#576057', '#7A8A7A'],
//       background: '#F0F3F0',
//       border: '#576057'
//     },
//     section4: {
//       colors: ['#8B7A6B', '#A39382', '#B8A899', '#736B5A', '#9B8A7A'],
//       background: '#F3F2F0',
//       border: '#736B5A'
//     }
//   };

  const [palettes, setPalettes] = useState<Palettes>(initialPalettes || defaultPalettes);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sectionNames = ['Sunset', 'Ocean', 'Dreams', 'Forest', 'Coral'];

  const updateColor = (sectionKey: keyof Palettes, type: 'colors' | 'background' | 'border', index: number | null, newColor: string) => {
    const updatedPalettes = { ...palettes };
    
    if (type === 'colors' && index !== null) {
      updatedPalettes[sectionKey] = {
        ...updatedPalettes[sectionKey],
        colors: [...updatedPalettes[sectionKey].colors]
      };
      updatedPalettes[sectionKey].colors[index] = newColor;
    } else {
      updatedPalettes[sectionKey] = {
        ...updatedPalettes[sectionKey],
        [type]: newColor
      };
    }
    
    setPalettes(updatedPalettes);
    onPaletteChange(updatedPalettes);
  };

  const addColor = (sectionKey: keyof Palettes) => {
    const updatedPalettes = { ...palettes };
    updatedPalettes[sectionKey] = {
      ...updatedPalettes[sectionKey],
      colors: [...updatedPalettes[sectionKey].colors, '#FFFFFF']
    };
    setPalettes(updatedPalettes);
    onPaletteChange(updatedPalettes);
  };

  const removeColor = (sectionKey: keyof Palettes, index: number) => {
    if (palettes[sectionKey].colors.length <= 1) return;
    
    const updatedPalettes = { ...palettes };
    updatedPalettes[sectionKey] = {
      ...updatedPalettes[sectionKey],
      colors: updatedPalettes[sectionKey].colors.filter((_: string, i: number) => i !== index)
    };
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

  const [currentSeed, setCurrentSeed] = useState<string | null>(seed);
  const [randomGenerator, setRandomGenerator] = useState<() => number>(() => 
    seed ? createSeededRandom(simpleHash(seed)) : Math.random
  );

  // Use provided palettes or default ones
  const activePalettes = palettes || defaultPalettes;

  // Extract arrays for backward compatibility
  const harmonicPalettes = useMemo(() => [
    activePalettes.section0?.colors || defaultPalettes.section0.colors,
    activePalettes.section1?.colors || defaultPalettes.section1.colors,
    activePalettes.section2?.colors || defaultPalettes.section2.colors,
    activePalettes.section3?.colors || defaultPalettes.section3.colors,
    activePalettes.section4?.colors || defaultPalettes.section4.colors
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

  const config = {
    cols: highRes ? 24 : 12,
    rows: highRes ? 64 : 32,
    cellSize: size, // This affects canvas display size only
    logicalCellSize: 1, // This keeps the design pattern consistent
    sections: 5
  };

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

  const getGroups = useCallback((cells: Cell[], rng: () => number): Cell[][] => {
    cells.forEach(c => c.m = false);

    let groups: Cell[][] = [];
    cells.forEach(c => {
      if (!c.m) {
        let group = floodfill(c, cells);
        if (group.length > 0) {
          groups.push(group);

          let section = group[0].section;
          let palette = harmonicPalettes[section];
          let selectedColor = palette[Math.floor(rng() * palette.length)];

          group.forEach(cell => {
            cell.c = selectedColor;
          });
        }
      }
    });

    return groups;
  }, [harmonicPalettes, floodfill]);

  const generateCells = useCallback((rng: () => number = randomGenerator): Cell[] => {
    let newCells: Cell[] = [];
    let n = config.cols / 2;
    let sectionHeight = config.rows / config.sections;

    for (let section = 0; section < config.sections; section++) {
      let startY = Math.floor(section * sectionHeight);
      let endY = Math.floor((section + 1) * sectionHeight);

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
              dx: i, // Store logical coordinates only
              dy: y, // Store logical coordinates only
              x: i, // Logical coordinates (for pattern)
              y: y, // Logical coordinates (for pattern)
              c: '#000000',
              m: false,
              section: section
            });
          }
        });
      }
    }

    getGroups(newCells, rng);
    return newCells;
  }, [config.cols, config.rows, config.sections, randomGenerator, getGroups]);

  const drawTotemIcon = useCallback((cells: Cell[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = config.cols * config.cellSize;
    const height = config.rows * config.cellSize;

    let sectionHeightPixels = Math.floor(config.rows / config.sections);
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

    cells.forEach(c => {
      ctx.fillStyle = c.c;
      // Calculate display coordinates from logical coordinates
      const displayX = c.dx * config.cellSize;
      const displayY = c.dy * config.cellSize;
      
      ctx.fillRect(displayX, displayY, config.cellSize, config.cellSize);
      ctx.fillRect(config.cellSize * config.cols - displayX - config.cellSize, displayY, config.cellSize, config.cellSize);
    });

    setTimeout(() => {
      const dataURL = canvas.toDataURL('image/png');
      setPngUrl(dataURL);
      if (onPngGenerated) {
        onPngGenerated(dataURL);
      }
    }, 10);
  }, [config.cols, config.rows, config.sections, config.cellSize, sectionBackgrounds, sectionBorderColors, onPngGenerated]);

  const handleGenerate = () => {
    if (!seed) {
      const newSeed = Date.now().toString();
      setCurrentSeed(newSeed);
      const newRng = createSeededRandom(simpleHash(newSeed));
      setRandomGenerator(() => newRng);
      const newCells = generateCells(newRng);
      setCells(newCells);
      drawTotemIcon(newCells);
    } else {
      const newCells = generateCells();
      setCells(newCells);
      drawTotemIcon(newCells);
    }
  };

  const handleSave = () => {
    if (pngUrl) {
      const link = document.createElement('a');
      link.download = `totem-icon-${Date.now()}.png`;
      link.href = pngUrl;
      link.click();
    }
  };

  // Initialize
  useEffect(() => {
    if (seed !== currentSeed) {
      setCurrentSeed(seed);
      const newRng = seed ? createSeededRandom(simpleHash(seed)) : Math.random;
      setRandomGenerator(() => newRng);
    }
  }, [seed, currentSeed]);

  // Generate cells when generator changes
  useEffect(() => {
    const newCells = generateCells();
    setCells(newCells);
  }, [randomGenerator, generateCells]);

  // Draw when cells or palettes change
  useEffect(() => {
    if (cells.length > 0) {
      drawTotemIcon(cells);
    }
  }, [cells, palettes, drawTotemIcon]);

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

export { TotemIcon, PaletteEditor, type Palettes, type PaletteSection, type TotemIconProps };
