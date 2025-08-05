import { describe, it, expect } from 'vitest';
import { defaultPalettes, MutedPalettes, blockedPalettes } from './palettes';

// Helper to extract groupMeta, cell positions, and cell colors from TotemIcon internals
function getGroupMetaCellsAndColors(seed: string, palettes: any) {
  // Deterministic hash
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  // Seeded RNG
  const createSeededRandom = (seed: number) => {
    let seedValue = seed;
    return () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
  };

  // Config matches TotemIcon
  const sections = 5;
  const cols = 12;
  const rows = 30;
  const config = { cols, rows, sections };
  const rng = createSeededRandom(simpleHash(seed));

  // Generate cells
  type Cell = { dx: number; dy: number; x: number; y: number; c: string; m: boolean; section: number };
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

  // Floodfill and group assignment
  function getNeighbors(x: number, y: number, section: number, cells: Cell[]): Cell[] {
    return cells.filter(_c => {
      if (_c.section !== section) return false;
      return (
        (x + 1 === _c.x && y === _c.y) ||
        (x - 1 === _c.x && y === _c.y) ||
        (x === _c.x && y + 1 === _c.y) ||
        (x === _c.x && y - 1 === _c.y)
      );
    });
  }
  function floodfill(c: Cell, cells: Cell[]): Cell[] {
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
  }
  function getGroups(cells: Cell[]) {
    cells.forEach(c => c.m = false);
    let groups: Cell[][] = [];
    let groupMeta: { section: number; groupIndex: number; }[] = [];
    let groupCounter = [0, 0, 0, 0, 0];
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
  }
  const { groups, groupMeta } = getGroups(newCells);

  // Assign colors using the palette, deterministically by group index
  // Always enforce palette length of 5 for each section for stability
  const enforcePaletteLength = (arr: string[], len = 5, fill = '#000000') => {
    if (arr.length === len) return arr.slice();
    if (arr.length > len) return arr.slice(0, len);
    return arr.concat(Array(len - arr.length).fill(fill));
  };
  const harmonicPalettes = [
    enforcePaletteLength(palettes.section0.colors),
    enforcePaletteLength(palettes.section1.colors),
    enforcePaletteLength(palettes.section2.colors),
    enforcePaletteLength(palettes.section3.colors),
    enforcePaletteLength(palettes.section4.colors)
  ];
  groupMeta.forEach(({ section, groupIndex }, i) => {
    const colorCount = harmonicPalettes[section].length;
    const colorIndex = groupIndex % colorCount;
    groups[i].forEach(cell => {
      cell.c = harmonicPalettes[section][colorIndex];
    });
  });

  // Return groupMeta, all cell positions, and all cell colors (in order)
  const cellPositions = newCells.map(c => ({ dx: c.dx, dy: c.dy, section: c.section }));
  const cellColors = newCells.map(c => c.c);
  return { groupMeta, cellPositions, cellColors };
}

describe('TotemIcon palette invariance', () => {
  it('only colors change with palette; group structure and positions are invariant', () => {
    const seed = 'john@example.com';
    const palettesList = [defaultPalettes, MutedPalettes, blockedPalettes];
    let reference: { groupMeta: string; cellPositions: string; cellColors: string[] } | null = null;
    palettesList.forEach((pal, i) => {
      const { groupMeta, cellPositions, cellColors } = getGroupMetaCellsAndColors(seed, pal);
      if (i === 0) {
        reference = {
          groupMeta: JSON.stringify(groupMeta),
          cellPositions: JSON.stringify(cellPositions),
          cellColors
        };
      } else {
        expect(JSON.stringify(groupMeta)).toBe(reference!.groupMeta);
        expect(JSON.stringify(cellPositions)).toBe(reference!.cellPositions);
        // Colors must differ for at least one palette
        if (JSON.stringify(cellColors) === JSON.stringify(reference!.cellColors)) {
          throw new Error('Cell colors did not change for a different palette');
        }
      }
    });
  });
});
