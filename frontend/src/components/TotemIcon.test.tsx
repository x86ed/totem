import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TotemIcon } from './TotemIcon';

// Mock canvas since it's not available in jsdom
beforeEach(() => {
  const mockCanvas = {
    getContext: vi.fn(() => ({
      fillStyle: '',
      fillRect: vi.fn(),
      canvas: { toDataURL: vi.fn(() => 'mock-data-url') }
    })),
    toDataURL: vi.fn(() => 'mock-data-url')
  }
  
  // Mock HTMLCanvasElement - use unknown to avoid complex type issues in tests
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    mockCanvas.getContext as unknown as typeof HTMLCanvasElement.prototype.getContext
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(
    mockCanvas.toDataURL as unknown as typeof HTMLCanvasElement.prototype.toDataURL
  )
})

describe('TotemIcon', () => {
  describe('Basic Rendering', () => {
    it('renders canvas element', () => {
      const { container } = render(<TotemIcon seed="test" showControls={false} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('renders with seed prop', () => {
      const { container } = render(<TotemIcon seed="custom-seed" showControls={false} />);
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  })

  describe('High Resolution Mode', () => {
    it('displays standard resolution by default', () => {
      render(<TotemIcon seed="test" />)
      
      // Should not show high-res indicator when not in high-res mode
      expect(screen.queryByText(/High Resolution Mode/)).not.toBeInTheDocument()
    })

    it('displays high resolution mode indicator when highRes is true', () => {
      render(<TotemIcon seed="test" highRes={true} />)
      
      // Should show high-res indicator
      expect(screen.getByText(/High Resolution Mode \(2x detail\)/)).toBeInTheDocument()
    })

    it('renders canvas with correct dimensions for standard resolution', () => {
      const { container } = render(<TotemIcon seed="test" size={4} showControls={false} />)
      
      const canvas = container.querySelector('canvas')
      expect(canvas).toHaveAttribute('width', '48') // 12 cols * 4 size
      expect(canvas).toHaveAttribute('height', '128') // 32 rows * 4 size
    })

    it('renders canvas with correct dimensions for high resolution', () => {
      const { container } = render(<TotemIcon seed="test" size={4} highRes={true} showControls={false} />)
      
      const canvas = container.querySelector('canvas')
      expect(canvas).toHaveAttribute('width', '96') // 24 cols * 4 size
      expect(canvas).toHaveAttribute('height', '256') // 64 rows * 4 size
    })
  })

  describe('Control Display', () => {
    it('renders with showControls=false', () => {
      render(<TotemIcon seed="test" showControls={false} />)
      
      // Should not show any control buttons
      expect(screen.queryByText('Generate New')).not.toBeInTheDocument()
      expect(screen.queryByText('Save PNG')).not.toBeInTheDocument()
    })

    it('renders with custom seed and shows seed info', () => {
      render(<TotemIcon seed="custom-seed-123" />)
      
      // Should show the seed in the description
      expect(screen.getByText('Seed: custom-seed-123')).toBeInTheDocument()
    })

    it('renders with custom palettes and shows indicator', () => {
      const customPalettes = {
        section0: { colors: ['#FF0000'], background: '#FFF', border: '#000' },
        section1: { colors: ['#00FF00'], background: '#FFF', border: '#000' },
        section2: { colors: ['#0000FF'], background: '#FFF', border: '#000' },
        section3: { colors: ['#FFFF00'], background: '#FFF', border: '#000' },
        section4: { colors: ['#FF00FF'], background: '#FFF', border: '#000' }
      }
      
      render(<TotemIcon seed="test" palettes={customPalettes} />)
      
      // Should show custom palettes indicator
      expect(screen.getByText('Using custom palettes')).toBeInTheDocument()
    })
  })
});
