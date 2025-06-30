import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StrictMode } from 'react'

// Mock the CSS import
vi.mock('./index.css', () => ({}))

// Mock the App component
vi.mock('./App', () => ({
  default: () => <div data-testid="app">Mocked App Component</div>
}))

// Mock react-dom/client
const mockRender = vi.fn()
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
  unmount: vi.fn()
}))

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}))

describe('main.tsx', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
    
    // Create a fresh DOM for each test
    document.body.innerHTML = ''
    
    // Mock console.error to prevent error logs in tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error
    vi.restoreAllMocks()
  })

  describe('Root element detection', () => {
    it('should successfully find root element when it exists', async () => {
      // Arrange: Create root element
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)

      // Act: Import main.tsx (this executes the module)
      await import('./main')

      // Assert: Verify createRoot was called with the correct element
      expect(mockCreateRoot).toHaveBeenCalledWith(rootDiv)
      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
    })

    it('should throw error when root element is not found', async () => {
      // Arrange: Ensure no root element exists
      const rootElement = document.getElementById('root')
      expect(rootElement).toBeNull()

      // Act & Assert: Import should throw error
      await expect(async () => {
        // We need to clear the module cache to re-execute the module
        vi.resetModules()
        await import('./main')
      }).rejects.toThrow('Root element not found')
    })

    it('should handle case when root element is null', async () => {
      // Arrange: Mock getElementById to return null explicitly
      const originalGetElementById = document.getElementById
      vi.spyOn(document, 'getElementById').mockReturnValue(null)

      try {
        // Act & Assert
        await expect(async () => {
          vi.resetModules()
          await import('./main')
        }).rejects.toThrow('Root element not found')
        
        expect(document.getElementById).toHaveBeenCalledWith('root')
      } finally {
        // Restore original function
        document.getElementById = originalGetElementById
      }
    })
  })

  describe('React app rendering', () => {
    beforeEach(() => {
      // Create root element for rendering tests
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)
    })

    it('should render App component wrapped in StrictMode', async () => {
      // Act: Import main.tsx
      vi.resetModules()
      await import('./main')

      // Assert: Verify render was called
      expect(mockRender).toHaveBeenCalledTimes(1)
      
      // Get the rendered JSX
      const renderedComponent = mockRender.mock.calls[0][0]
      
      // Verify it's wrapped in StrictMode
      expect(renderedComponent.type).toBe(StrictMode)
      expect(renderedComponent.props.children.type.name).toBe('default') // Mocked App component
    })

    it('should call createRoot with correct root element', async () => {
      // Arrange
      const rootDiv = document.getElementById('root')

      // Act
      vi.resetModules()
      await import('./main')

      // Assert
      expect(mockCreateRoot).toHaveBeenCalledWith(rootDiv)
      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
    })

    it('should import and use App component', async () => {
      // Act
      vi.resetModules()
      await import('./main')

      // Assert: Verify App component is imported and used
      const renderedComponent = mockRender.mock.calls[0][0]
      const appComponent = renderedComponent.props.children
      
      expect(appComponent).toBeDefined()
      expect(appComponent.type.name).toBe('default') // Our mocked App component
    })

    it('should import CSS styles', async () => {
      // This test verifies that the CSS import doesn't cause errors
      // and that our mock is working correctly
      
      // Act
      vi.resetModules()
      await import('./main')

      // Assert: Verify the module loads without errors
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })
  })

  describe('Module structure and imports', () => {
    it('should import all required dependencies', async () => {
      // This test ensures all imports are valid and don't throw errors
      vi.resetModules()
      
      // Create root element to prevent error
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)

      // Act & Assert: Should not throw during import
      await expect(import('./main')).resolves.toBeDefined()
    })

    it('should execute main logic immediately on import', async () => {
      // Arrange
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)

      // Act
      vi.resetModules()
      await import('./main')

      // Assert: Main logic should execute immediately
      expect(mockCreateRoot).toHaveBeenCalled()
      expect(mockRender).toHaveBeenCalled()
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle createRoot throwing an error', async () => {
      // Arrange
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)
      
      // Mock createRoot to throw an error
      mockCreateRoot.mockImplementationOnce(() => {
        throw new Error('createRoot failed')
      })

      // Act & Assert
      await expect(async () => {
        vi.resetModules()
        await import('./main')
      }).rejects.toThrow('createRoot failed')
    })

    it('should handle render method throwing an error', async () => {
      // Arrange
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)
      
      // Mock render to throw an error
      mockRender.mockImplementationOnce(() => {
        throw new Error('render failed')
      })

      // Act & Assert
      await expect(async () => {
        vi.resetModules()
        await import('./main')
      }).rejects.toThrow('render failed')
    })

    it('should handle document.getElementById throwing an error', async () => {
      // Arrange
      vi.spyOn(document, 'getElementById').mockImplementationOnce(() => {
        throw new Error('getElementById failed')
      })

      // Act & Assert
      await expect(async () => {
        vi.resetModules()
        await import('./main')
      }).rejects.toThrow('getElementById failed')
    })
  })

  describe('StrictMode integration', () => {
    beforeEach(() => {
      const rootDiv = document.createElement('div')
      rootDiv.id = 'root'
      document.body.appendChild(rootDiv)
    })

    it('should wrap App component in StrictMode', async () => {
      // Act
      vi.resetModules()
      await import('./main')

      // Assert
      const renderedComponent = mockRender.mock.calls[0][0]
      expect(renderedComponent.type).toBe(StrictMode)
      
      // Verify StrictMode has App as child
      const appComponent = renderedComponent.props.children
      expect(appComponent.type.name).toBe('default')
    })

    it('should pass no additional props to StrictMode', async () => {
      // Act
      vi.resetModules()
      await import('./main')

      // Assert
      const renderedComponent = mockRender.mock.calls[0][0]
      const strictModeProps = Object.keys(renderedComponent.props)
      
      // StrictMode should only have 'children' prop
      expect(strictModeProps).toEqual(['children'])
    })
  })
})
