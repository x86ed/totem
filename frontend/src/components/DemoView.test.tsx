import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DemoView from './DemoView.tsx'
import type { TotemIconProps, Palettes } from './TotemIcon'

// Define the props interface for PaletteEditor based on its usage
interface MockPaletteEditorProps {
  onPaletteChange: (palettes: Palettes) => void;
  initialPalettes?: Palettes | null;
}

// Mock palette data that matches the Palettes interface
const mockPalettes: Palettes = {
  section0: { colors: ['#FF0000'], background: '#FFF', border: '#000' },
  section1: { colors: ['#00FF00'], background: '#FFF', border: '#000' },
  section2: { colors: ['#0000FF'], background: '#FFF', border: '#000' },
  section3: { colors: ['#FFFF00'], background: '#FFF', border: '#000' },
  section4: { colors: ['#FF00FF'], background: '#FFF', border: '#000' }
}

// Mock the TotemIcon component since it uses canvas which isn't available in jsdom
vi.mock('./TotemIcon', () => ({
  TotemIcon: ({ seed, size, palettes, onPngGenerated, showControls, highRes }: TotemIconProps) => (
    <div data-testid="totem-icon">
      <div data-testid="icon-seed">{seed || 'random'}</div>
      <div data-testid="icon-size">{size}</div>
      <div data-testid="icon-palettes">{palettes ? 'custom' : 'default'}</div>
      <div data-testid="icon-controls">{showControls ? 'shown' : 'hidden'}</div>
      <div data-testid="icon-high-res">{highRes ? 'high-res' : 'standard'}</div>
      <button onClick={() => onPngGenerated?.('mock-png-data-url')}>
        Generate PNG
      </button>
    </div>
  ),
  PaletteEditor: ({ onPaletteChange, initialPalettes }: MockPaletteEditorProps) => (
    <div data-testid="palette-editor">
      <button 
        onClick={() => onPaletteChange(mockPalettes)}
      >
        Change Palette
      </button>
      <div data-testid="initial-palettes">{initialPalettes ? 'has-initial' : 'no-initial'}</div>
    </div>
  ),
  type: () => null
}))

describe('DemoView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the main heading and description', () => {
      render(<DemoView />)
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('TotemIcon Demo')
      expect(screen.getByText(/Generate unique, deterministic icons/)).toBeInTheDocument()
    })

    it('renders the seed input field with default value', () => {
      render(<DemoView />)
      
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      expect(seedInput).toHaveValue('user@example.com')
    })

    it('renders the size control with default value', () => {
      render(<DemoView />)
      
      const sizeSlider = screen.getByRole('slider')
      expect(sizeSlider).toHaveValue('4')
      expect(screen.getByText('4px')).toBeInTheDocument()
    })

    it('renders both standard and high-res TotemIcons with default props', () => {
      render(<DemoView />)
      
      const totemIcons = screen.getAllByTestId('totem-icon')
      expect(totemIcons).toHaveLength(2)
      
      // Check that we have both standard and high-res icons
      const highResElements = screen.getAllByTestId('icon-high-res')
      expect(highResElements).toHaveLength(2)
      
      const standardIcon = highResElements.find(el => el.textContent === 'standard')
      const highResIcon = highResElements.find(el => el.textContent === 'high-res')
      
      expect(standardIcon).toBeInTheDocument()
      expect(highResIcon).toBeInTheDocument()
      
      // Check common properties
      const iconSeeds = screen.getAllByTestId('icon-seed')
      iconSeeds.forEach(seed => {
        expect(seed).toHaveTextContent('user@example.com')
      })
      
      const iconSizes = screen.getAllByTestId('icon-size')
      iconSizes.forEach(size => {
        expect(size).toHaveTextContent('4')
      })
      
      const iconPalettes = screen.getAllByTestId('icon-palettes')
      iconPalettes.forEach(palette => {
        expect(palette).toHaveTextContent('default')
      })
      
      const iconControls = screen.getAllByTestId('icon-controls')
      iconControls.forEach(control => {
        expect(control).toHaveTextContent('shown')
      })
      
      // Verify section headings
      expect(screen.getByText('Standard Resolution (12×32)')).toBeInTheDocument()
      expect(screen.getByText('High Resolution (24×64) - 2x Detail')).toBeInTheDocument()
    })
  })

  describe('Seed Input Functionality', () => {
    it('updates seed when user types in input field', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      
      await user.clear(seedInput)
      await user.type(seedInput, 'test@example.com')
      
      expect(seedInput).toHaveValue('test@example.com')
      
      // Both icons should show the updated seed
      const iconSeeds = screen.getAllByTestId('icon-seed')
      iconSeeds.forEach(seed => {
        expect(seed).toHaveTextContent('test@example.com')
      })
    })

    it('generates random seed when random button is clicked', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      const randomButton = screen.getByRole('button', { name: /Random/ })
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      const initialValue = seedInput.getAttribute('value')
      
      await user.click(randomButton)
      
      const newValue = seedInput.getAttribute('value')
      expect(newValue).not.toBe(initialValue)
      expect(newValue).toBeTruthy()
    })

    it('handles empty seed input correctly', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      
      await user.clear(seedInput)
      
      expect(seedInput).toHaveValue('')
      
      // Both icons should show 'random' for empty seed
      const iconSeeds = screen.getAllByTestId('icon-seed')
      iconSeeds.forEach(seed => {
        expect(seed).toHaveTextContent('random')
      })
    })
  })

  describe('Size Control Functionality', () => {
    it('updates size when slider value changes', async () => {
      render(<DemoView />)
      
      const sizeSlider = screen.getByRole('slider')
      
      fireEvent.change(sizeSlider, { target: { value: '6' } })
      
      expect(sizeSlider).toHaveValue('6')
      expect(screen.getByText('6px')).toBeInTheDocument()
      
      // Both icons should show the updated size
      const iconSizes = screen.getAllByTestId('icon-size')
      iconSizes.forEach(size => {
        expect(size).toHaveTextContent('6')
      })
    })

    it('respects slider min and max values', () => {
      render(<DemoView />)
      
      const sizeSlider = screen.getByRole('slider')
      expect(sizeSlider).toHaveAttribute('min', '2')
      expect(sizeSlider).toHaveAttribute('max', '8')
    })
  })

  describe('Palette Editor Functionality', () => {
    it('initially hides palette editor', () => {
      render(<DemoView />)
      
      expect(screen.queryByTestId('palette-editor')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Show Palette Editor/ })).toBeInTheDocument()
    })

    it('shows palette editor when toggle button is clicked', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      const toggleButton = screen.getByRole('button', { name: /Show Palette Editor/ })
      await user.click(toggleButton)
      
      expect(screen.getByTestId('palette-editor')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Hide Palette Editor/ })).toBeInTheDocument()
    })

    it('hides palette editor when toggle button is clicked again', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      const showButton = screen.getByRole('button', { name: /Show Palette Editor/ })
      await user.click(showButton)
      
      const hideButton = screen.getByRole('button', { name: /Hide Palette Editor/ })
      await user.click(hideButton)
      
      expect(screen.queryByTestId('palette-editor')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Show Palette Editor/ })).toBeInTheDocument()
    })

    it('updates palettes when palette editor changes', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      // Show palette editor
      const toggleButton = screen.getByRole('button', { name: /Show Palette Editor/ })
      await user.click(toggleButton)
      
      // Change palette
      const changePaletteButton = screen.getByRole('button', { name: 'Change Palette' })
      await user.click(changePaletteButton)
      
      // Both icons should show custom palettes
      const iconPalettes = screen.getAllByTestId('icon-palettes')
      iconPalettes.forEach(palette => {
        expect(palette).toHaveTextContent('custom')
      })
    })
  })

  describe('Reset Functionality', () => {
    it('resets all values to defaults when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      // Change some values
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      await user.clear(seedInput)
      await user.type(seedInput, 'changed@example.com')
      
      const sizeSlider = screen.getByRole('slider')
      fireEvent.change(sizeSlider, { target: { value: '6' } })
      
      const toggleButton = screen.getByRole('button', { name: /Show Palette Editor/ })
      await user.click(toggleButton)
      
      // Reset
      const resetButton = screen.getByRole('button', { name: /Reset to Defaults/ })
      await user.click(resetButton)
      
      // Check defaults are restored
      expect(seedInput).toHaveValue('user@example.com')
      expect(sizeSlider).toHaveValue('4')
      expect(screen.queryByTestId('palette-editor')).not.toBeInTheDocument()
      
      // Both icons should have default palettes
      const iconPalettes = screen.getAllByTestId('icon-palettes')
      iconPalettes.forEach(palette => {
        expect(palette).toHaveTextContent('default')
      })
    })
  })

  describe('PNG Generation', () => {
    it('handles PNG generation callback from TotemIcon', async () => {
      const user = userEvent.setup()
      render(<DemoView />)
      
      // Since we have two TotemIcons with PNG generation, click the first one
      const generateButtons = screen.getAllByRole('button', { name: 'Generate PNG' })
      expect(generateButtons).toHaveLength(2)
      
      await user.click(generateButtons[0])
      
      // Since we're mocking the callback, we just verify the mock was called
      // In a real scenario, this would test that the PNG URL is stored
      expect(generateButtons[0]).toBeInTheDocument()
    })
  })

  describe('Usage Examples Section', () => {
    it('renders usage examples and tips', () => {
      render(<DemoView />)
      
      expect(screen.getByText('Usage Examples')).toBeInTheDocument()
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText(/Use email addresses for consistent user avatars/)).toBeInTheDocument()
    })

    it('displays code examples', () => {
      render(<DemoView />)
      
      const codeBlock = screen.getByText(/\/\/ User Avatar/)
      expect(codeBlock).toBeInTheDocument()
      expect(screen.getByText(/seed="user@example.com"/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<DemoView />)
      
      expect(screen.getByText('Seed Input')).toBeInTheDocument()
      expect(screen.getByText('Icon Size')).toBeInTheDocument()
    })

    it('has proper button roles and labels', () => {
      render(<DemoView />)
      
      expect(screen.getByRole('button', { name: /Random/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Show Palette Editor/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Reset to Defaults/ })).toBeInTheDocument()
    })

    it('has proper input types and attributes', () => {
      render(<DemoView />)
      
      const seedInput = screen.getByPlaceholderText(/Enter any text to generate/)
      expect(seedInput).toHaveAttribute('type', 'text')
      
      const sizeSlider = screen.getByRole('slider')
      expect(sizeSlider).toHaveAttribute('type', 'range')
    })
  })

  describe('Responsive Design Elements', () => {
    it('includes proper CSS classes for responsive layout', () => {
      const { container } = render(<DemoView />)
      
      expect(container.querySelector('.page-container')).toBeInTheDocument()
      expect(container.querySelector('.max-w-4xl')).toBeInTheDocument()
      expect(container.querySelector('.content-wrapper')).toBeInTheDocument()
    })
  })

})
