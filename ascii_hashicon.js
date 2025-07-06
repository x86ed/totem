#!/usr/bin/env node

// ASCII Terminal Hashicon Generator
// Usage: node ascii-hashicon.js [seed] [--width=12] [--height=32] [--char=██]

const fs = require('fs');
const path = require('path');

class ASCIIHashicon {
  constructor(options = {}) {
    this.config = {
      cols: options.width || 12,
      rows: options.height || 32,
      sections: options.sections || 5,
      char: options.char || '██',
      showBorders: options.borders !== false,
      showSections: options.showSections !== false
    };

    // Default harmonic color palettes
    this.defaultPalettes = {
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

    this.palettes = options.palettes || this.defaultPalettes;
    this.cells = [];
  }

  // Simple deterministic hash function
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Seeded random number generator
  createSeededRandom(seed) {
    let seedValue = seed;
    return () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
  }

  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Convert RGB to ANSI 256 color code
  rgbToAnsi256(r, g, b) {
    // Convert to 6x6x6 color cube
    const rLevel = Math.round(r / 255 * 5);
    const gLevel = Math.round(g / 255 * 5);
    const bLevel = Math.round(b / 255 * 5);
    
    return 16 + (36 * rLevel) + (6 * gLevel) + bLevel;
  }

  // Get ANSI color code for hex color
  getAnsiColor(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return 15; // Default to white
    return this.rgbToAnsi256(rgb.r, rgb.g, rgb.b);
  }

  // Create colored text with ANSI codes
  colorize(text, hexColor, bgHexColor = null) {
    const fgColor = this.getAnsiColor(hexColor);
    const bgColor = bgHexColor ? this.getAnsiColor(bgHexColor) : null;
    
    let ansiCode = `\x1b[38;5;${fgColor}m`;
    if (bgColor !== null) {
      ansiCode += `\x1b[48;5;${bgColor}m`;
    }
    
    return `${ansiCode}${text}\x1b[0m`;
  }

  // Flood fill algorithm
  floodfill(c, cells) {
    let q = [];
    if (!c.m) {
      c.m = true;
      q.push(c);
    }
    let group = [];

    while (q.length > 0) {
      let current = q.pop();
      group.push(current);
      let neighbors = this.getNeighbors(current.x, current.y, current.section, cells);

      neighbors.forEach(_c => {
        if (!_c.m) {
          _c.m = true;
          q.push(_c);
        }
      });
    }
    return group;
  }

  // Get neighboring cells
  getNeighbors(x, y, section, cells) {
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

  // Group cells and assign colors
  getGroups(cells, rng) {
    cells.forEach(c => c.m = false);

    let groups = [];
    cells.forEach(c => {
      if (!c.m) {
        let group = this.floodfill(c, cells);
        if (group.length > 0) {
          groups.push(group);

          let section = group[0].section;
          let palette = this.palettes[`section${section}`]?.colors || this.defaultPalettes[`section${section}`].colors;
          let selectedColor = palette[Math.floor(rng() * palette.length)];

          group.forEach(cell => {
            cell.c = selectedColor;
          });
        }
      }
    });

    return groups;
  }

  // Generate cell pattern - match React version exactly
  generateCells(seed = null) {
    this.cells = [];
    const rng = seed ? this.createSeededRandom(this.simpleHash(seed)) : Math.random;
    
    let n = Math.floor(this.config.cols / 2); // Only generate left half
    let sectionHeight = this.config.rows / this.config.sections;

    for (let section = 0; section < this.config.sections; section++) {
      let startY = Math.floor(section * sectionHeight);
      let endY = Math.floor((section + 1) * sectionHeight);

      for (let y = startY; y < endY; y++) {
        // Use the EXACT same method as React version
        let randomValue = rng();
        let binaryString = '';
        
        // Convert random to binary string with exactly n bits
        for (let i = 0; i < n; i++) {
          randomValue = randomValue * 2;
          if (randomValue >= 1) {
            binaryString += '1';
            randomValue -= 1;
          } else {
            binaryString += '0';
          }
        }
        
        // Create cells for each '1' in the binary string
        for (let x = 0; x < n; x++) {
          if (binaryString[x] === '1') {
            this.cells.push({
              x: x,
              y: y,
              c: '#000000',
              m: false,
              section: section
            });
          }
        }
      }
    }

    this.getGroups(this.cells, rng);
    return this.cells;
  }

  // Create a grid representation with consistent row widths and borders
  createGrid() {
    const grid = [];
    const sectionHeightPixels = Math.floor(this.config.rows / this.config.sections);

    // Initialize grid - every position gets a character
    for (let y = 0; y < this.config.rows; y++) {
      grid[y] = [];
      const section = Math.floor(y / sectionHeightPixels);
      const sectionKey = `section${Math.min(section, this.config.sections - 1)}`;
      const bgColor = this.palettes[sectionKey]?.background || this.defaultPalettes[sectionKey].background;
      
      for (let x = 0; x < this.config.cols; x++) {
        grid[y][x] = {
          char: '█',
          color: bgColor,
          type: 'background'
        };
      }
    }

    // Add section borders exactly like React version (pixel-perfect)
    if (this.config.showBorders) {
      for (let i = 0; i < this.config.sections; i++) {
        const startY = i * sectionHeightPixels;
        const sectionHeight = sectionHeightPixels;
        const sectionKey = `section${i}`;
        const borderColor = this.palettes[sectionKey]?.border || this.defaultPalettes[sectionKey].border;

        if (i === 0) {
          // Top section - rounded top corners (skip corner pixels)
          // Top border (skip corners)
          for (let x = 1; x < this.config.cols - 1; x++) {
            if (startY >= 0 && startY < this.config.rows) {
              grid[startY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
          // Left border
          for (let y = startY + 1; y < startY + sectionHeight && y < this.config.rows; y++) {
            grid[y][0] = { char: '█', color: borderColor, type: 'border' };
          }
          // Right border
          for (let y = startY + 1; y < startY + sectionHeight && y < this.config.rows; y++) {
            grid[y][this.config.cols - 1] = { char: '█', color: borderColor, type: 'border' };
          }
          // Bottom border (full width)
          const bottomY = startY + sectionHeight - 1;
          if (bottomY >= 0 && bottomY < this.config.rows) {
            for (let x = 0; x < this.config.cols; x++) {
              grid[bottomY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
        } else if (i === this.config.sections - 1) {
          // Bottom section - rounded bottom corners
          // Top border (full width)
          if (startY >= 0 && startY < this.config.rows) {
            for (let x = 0; x < this.config.cols; x++) {
              grid[startY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
          // Left border
          for (let y = startY + 1; y < startY + sectionHeight - 1 && y < this.config.rows; y++) {
            grid[y][0] = { char: '█', color: borderColor, type: 'border' };
          }
          // Right border
          for (let y = startY + 1; y < startY + sectionHeight - 1 && y < this.config.rows; y++) {
            grid[y][this.config.cols - 1] = { char: '█', color: borderColor, type: 'border' };
          }
          // Bottom border (skip corners)
          const bottomY = startY + sectionHeight - 1;
          if (bottomY >= 0 && bottomY < this.config.rows) {
            for (let x = 1; x < this.config.cols - 1; x++) {
              grid[bottomY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
        } else {
          // Middle sections - full borders
          // Top border
          if (startY >= 0 && startY < this.config.rows) {
            for (let x = 0; x < this.config.cols; x++) {
              grid[startY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
          // Left border
          for (let y = startY + 1; y < startY + sectionHeight - 1 && y < this.config.rows; y++) {
            grid[y][0] = { char: '█', color: borderColor, type: 'border' };
          }
          // Right border
          for (let y = startY + 1; y < startY + sectionHeight - 1 && y < this.config.rows; y++) {
            grid[y][this.config.cols - 1] = { char: '█', color: borderColor, type: 'border' };
          }
          // Bottom border
          const bottomY = startY + sectionHeight - 1;
          if (bottomY >= 0 && bottomY < this.config.rows) {
            for (let x = 0; x < this.config.cols; x++) {
              grid[bottomY][x] = { char: '█', color: borderColor, type: 'border' };
            }
          }
        }
      }
    }

    // Place cells and their mirrors (exact same logic as React)
    this.cells.forEach(cell => {
      // Original cell (left half)
      if (cell.y >= 0 && cell.y < this.config.rows && cell.x >= 0 && cell.x < this.config.cols) {
        grid[cell.y][cell.x] = {
          char: '█',
          color: cell.c,
          type: 'cell'
        };
      }

      // Mirror cell (right half) - exact same formula as React version
      const mirroredX = this.config.cols - cell.x - 1;
      if (cell.y >= 0 && cell.y < this.config.rows && mirroredX >= 0 && mirroredX < this.config.cols) {
        grid[cell.y][mirroredX] = {
          char: '█',
          color: cell.c,
          type: 'cell'
        };
      }
    });

    return grid;
  }

  // Render the grid to ASCII with consistent formatting
  render(seed = null) {
    this.generateCells(seed);
    const grid = this.createGrid();
    
    let output = '';
    
    // Calculate proper box width
    const titleText = seed ? `Hashicon: ${seed}` : 'Random Hashicon';
    const debugText = `Cells: ${this.cells.length}, Grid: ${this.config.cols}x${this.config.rows}`;
    const sectionText = 'Sections: Sunset Ocean Dreams Forest Coral';
    const maxWidth = Math.max(titleText.length, debugText.length, sectionText.length) + 4;
    
    // Add title with proper width
    output += this.colorize(`┌${'─'.repeat(maxWidth - 2)}┐\n`, '#888888');
    output += this.colorize(`│ ${titleText.padEnd(maxWidth - 4)} │\n`, '#888888');
    output += this.colorize(`│ ${debugText.padEnd(maxWidth - 4)} │\n`, '#888888');

    // Add debug output for mirroring verification
    const halfWidth = Math.floor(this.config.cols / 2);
    const debugLine1 = `Half width = ${halfWidth}`;
    output += this.colorize(`│ ${debugLine1.padEnd(maxWidth - 4)} │\n`, '#888888');
    
    // Show mirroring examples
    if (this.cells.length > 0) {
      const sampleCells = this.cells.slice(0, 2);
      sampleCells.forEach(cell => {
        const mirroredX = this.config.cols - cell.x - 1;
        const mirrorLine = `(${cell.x},${cell.y}) → (${mirroredX},${cell.y})`;
        output += this.colorize(`│ ${mirrorLine.padEnd(maxWidth - 4)} │\n`, '#888888');
      });
    }

    // Add section labels if enabled
    if (this.config.showSections) {
      const sectionNames = ['Sunset', 'Ocean', 'Dreams', 'Forest', 'Coral'];
      let sectionLine = 'Sections: ';
      for (let i = 0; i < this.config.sections; i++) {
        sectionLine += sectionNames[i] + ' ';
      }
      output += this.colorize(`│ ${sectionLine.padEnd(maxWidth - 4)} │\n`, '#888888');
    }

    output += this.colorize(`└${'─'.repeat(maxWidth - 2)}┘\n\n`, '#888888');

    // Render grid - every row gets exactly config.cols characters
    for (let y = 0; y < this.config.rows; y++) {
      let line = '';
      for (let x = 0; x < this.config.cols; x++) {
        const pixel = grid[y][x];
        line += this.colorize(pixel.char, pixel.color);
      }
      output += line + '\n';
    }

    return output;
  }

  // Save to file
  saveToFile(filename, content) {
    fs.writeFileSync(filename, content);
    console.log(`Saved to ${filename}`);
  }

  // Load custom palettes from JSON file
  loadPalettes(filename) {
    try {
      const data = fs.readFileSync(filename, 'utf8');
      this.palettes = JSON.parse(data);
      console.log('Custom palettes loaded successfully');
    } catch (error) {
      console.error('Error loading palettes:', error.message);
      console.log('Using default palettes');
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const options = {};
  let seed = null;

  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--width=')) {
      options.width = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--height=')) {
      options.height = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--char=')) {
      options.char = arg.split('=')[1];
    } else if (arg.startsWith('--sections=')) {
      options.sections = parseInt(arg.split('=')[1]);
    } else if (arg === '--no-borders') {
      options.borders = false;
    } else if (arg === '--no-sections') {
      options.showSections = false;
    } else if (arg.startsWith('--palettes=')) {
      options.palettesFile = arg.split('=')[1];
    } else if (arg.startsWith('--save=')) {
      options.saveFile = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
ASCII Hashicon Generator

Usage: node ascii-hashicon.js [seed] [options]

Options:
  --width=N          Set width in characters (default: 12)
  --height=N         Set height in characters (default: 32)
  --char=STR         Set character for cells (default: ██)
  --sections=N       Set number of sections (default: 5)
  --no-borders       Hide section borders
  --no-sections      Hide section labels
  --palettes=FILE    Load custom palettes from JSON file
  --save=FILE        Save output to file
  --help, -h         Show this help

Examples:
  node ascii-hashicon.js
  node ascii-hashicon.js "john@example.com"
  node ascii-hashicon.js "user123" --width=16 --height=40
  node ascii-hashicon.js "test" --char=▓▓ --no-borders
  node ascii-hashicon.js "demo" --palettes=custom.json --save=output.txt
      `);
      return;
    } else if (!arg.startsWith('--')) {
      seed = arg;
    }
  });

  // Create hashicon generator
  const hashicon = new ASCIIHashicon(options);

  // Load custom palettes if specified
  if (options.palettesFile) {
    hashicon.loadPalettes(options.palettesFile);
  }

  // Generate and render
  const output = hashicon.render(seed);
  
  // Output to console
  console.log(output);

  // Save to file if specified
  if (options.saveFile) {
    // Remove ANSI codes for file output
    const plainOutput = output.replace(/\x1b\[[0-9;]*m/g, '');
    hashicon.saveToFile(options.saveFile, plainOutput);
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ASCIIHashicon;
}

// Run CLI if called directly
if (require.main === module) {
  main();
}