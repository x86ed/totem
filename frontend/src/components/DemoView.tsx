import React, { useState } from 'react'
import { TotemIcon, PaletteEditor, type Palettes } from './TotemIcon'

/**
 * DemoView Component
 * 
 * A component for demonstrating the TotemIcon component with interactive features including:
 * - Custom seed input for deterministic icon generation
 * - Live palette editor for color customization
 * - Real-time icon preview
 * - Icon export functionality
 * 
 * Features:
 * - Interactive seed input field
 * - Toggle-able palette editor
 * - Deterministic icon generation
 * - PNG export capability
 * - Responsive design
 * 
 * @component
 * @returns {JSX.Element} The DemoView component with TotemIcon demonstration
 * 
 * @example
 * ```tsx
 * import DemoView from './components/DemoView'
 * 
 * function App() {
 *   return (
 *     <div>
 *       <DemoView />
 *     </div>
 *   )
 * }
 * ```
 */
const DemoView: React.FC = () => {
  const [userSeed, setUserSeed] = useState<string>('user@example.com')
  const [customPalettes, setCustomPalettes] = useState<Palettes | null>(null)
  const [showPaletteEditor, setShowPaletteEditor] = useState<boolean>(false)
  const [iconSize, setIconSize] = useState<number>(4)
  const [_, setGeneratedPngUrl] = useState<string>('')

  /**
   * Handles changes to the seed input field
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setUserSeed(event.target.value)
  }

  /**
   * Handles changes to the icon size
   * @param {React.ChangeEvent<HTMLInputElement>} event - Input change event
   */
  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIconSize(Number(event.target.value))
  }

  /**
   * Handles PNG generation callback from TotemIcon
   * @param {string} dataUrl - The generated PNG data URL
   */
  const handlePngGenerated = (dataUrl: string): void => {
    setGeneratedPngUrl(dataUrl)
    console.log('PNG generated:', dataUrl) // For debugging/development
  }

  /**
   * Toggles the palette editor visibility
   */
  const togglePaletteEditor = (): void => {
    setShowPaletteEditor(!showPaletteEditor)
  }

  /**
   * Resets all settings to default values
   */
  const resetToDefaults = (): void => {
    setUserSeed('user@example.com')
    setCustomPalettes(null)
    setIconSize(4)
    setShowPaletteEditor(false)
  }

  /**
   * Generates a random seed for demonstration
   */
  const generateRandomSeed = (): void => {
    const randomSeeds = [
      'alice@company.com',
      'bob.smith@example.org',
      'charlie.dev@startup.io',
      'diana.jones@corp.net',
      'eve.wilson@tech.com',
      'frank.brown@agency.co',
      'ProjectAlpha-v1.0',
      'MyApp-2024',
      'TeamBravo-Sprint3',
      'Feature-UserAuth',
      Math.random().toString(36).substring(7)
    ]
    const randomSeed = randomSeeds[Math.floor(Math.random() * randomSeeds.length)]
    setUserSeed(randomSeed)
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="content-wrapper">
          <h2 className="section-title">
            <span className="icon-spacing">🎨</span>
            TotemIcon Demo
          </h2>
          <p className="section-subtitle">
            Generate unique, deterministic icons based on input seeds. Perfect for user avatars, application branding, or project identifiers.
          </p>

          <div className="form-section">
            <label className="form-label">
              <span className="icon-spacing">🔑</span>
              Seed Input
            </label>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userSeed}
                  onChange={handleSeedChange}
                  placeholder="Enter any text to generate a unique icon..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
                <button
                  onClick={generateRandomSeed}
                  className="btn-secondary-green whitespace-nowrap"
                >
                  <span className="icon-spacing">🎲</span>
                  Random
                </button>
              </div>
              <p className="text-sm" style={{ color: '#5a6e5a' }}>
                The same seed will always generate the same icon. Try email addresses, usernames, or project names!
              </p>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              <span className="icon-spacing">📏</span>
              Icon Size
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="8"
                value={iconSize}
                onChange={handleSizeChange}
                className="flex-1"
              />
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {iconSize}px
              </span>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={togglePaletteEditor}
              className={showPaletteEditor ? "btn-primary-green" : "btn-secondary-green"}
            >
              <span className="icon-spacing">🎨</span>
              {showPaletteEditor ? 'Hide' : 'Show'} Palette Editor
            </button>
            <button
              onClick={resetToDefaults}
              className="btn-secondary-green"
            >
              <span className="icon-spacing">🔄</span>
              Reset to Defaults
            </button>
          </div>

          {showPaletteEditor && (
            <div className="export-section-green">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#2d3e2e' }}>
                <span className="icon-spacing">🎨</span>
                Color Palette Editor
              </h3>
              <PaletteEditor
                onPaletteChange={setCustomPalettes}
                initialPalettes={customPalettes}
              />
            </div>
          )}

          <div className="export-section-green">
            <h3 className="text-lg font-medium mb-4" style={{ color: '#2d3e2e' }}>
              <span className="icon-spacing">🖼️</span>
              Generated Icons
            </h3>
            <div className="space-y-8">
              {/* Standard Resolution */}
              <div className="text-center">
                <h4 className="text-md font-medium mb-3" style={{ color: '#4a5d4a' }}>
                  Standard Resolution (12×32)
                </h4>
                <div className="flex justify-center">
                  <TotemIcon
                    seed={userSeed || null}
                    size={iconSize}
                    palettes={customPalettes}
                    onPngGenerated={handlePngGenerated}
                    showControls={true}
                    highRes={false}
                  />
                </div>
              </div>

              {/* High Resolution */}
              <div className="text-center">
                <h4 className="text-md font-medium mb-3" style={{ color: '#4a5d4a' }}>
                  High Resolution (24×64) - 2x Detail
                </h4>
                <div className="flex justify-center">
                  <TotemIcon
                    seed={userSeed || null}
                    size={iconSize}
                    palettes={customPalettes}
                    onPngGenerated={handlePngGenerated}
                    showControls={true}
                    highRes={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="export-section-green">
            <h3 className="text-lg font-medium mb-4" style={{ color: '#2d3e2e' }}>
              <span className="icon-spacing">📖</span>
              Usage Examples
            </h3>
            <div className="space-y-4">
              <div className="code-preview-green">
{`// User Avatar
<TotemIcon 
  seed="user@example.com" 
  showControls={false} 
  size={3} 
/>

// Project Branding
<TotemIcon 
  seed="MyApp-v1.0" 
  palettes={customPalettes}
  showControls={false} 
  size={6} 
/>

// Dynamic Generation
<TotemIcon 
  seed={null} 
  showControls={true} 
  onPngGenerated={(dataUrl) => console.log('Generated:', dataUrl)}
/>`}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  <span className="icon-spacing">💡</span>
                  Pro Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use email addresses for consistent user avatars</li>
                  <li>• Try project names with version numbers for app branding</li>
                  <li>• Empty seed generates random icons each time</li>
                  <li>• Icons are symmetrical and use harmonic color palettes</li>
                  <li>• Export as PNG for use in other applications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Default export of the DemoView component
 * @default DemoView
 */
export default DemoView
