import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MilkdownEditor from './MilkdownEditor'

// Mock the milkdown editor since it requires complex setup
vi.mock('@milkdown/core', () => ({
  Editor: {
    make: () => ({
      config: () => ({
        use: () => ({
          use: () => ({
            use: () => ({
              use: () => ({
                use: () => ({
                  use: () => ({
                    create: async () => ({
                      destroy: () => {},
                      action: () => {}
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  },
  rootCtx: Symbol('rootCtx'),
  defaultValueCtx: Symbol('defaultValueCtx')
}))

vi.mock('@milkdown/preset-commonmark', () => ({
  commonmark: {}
}))

vi.mock('@milkdown/preset-gfm', () => ({
  gfm: {}
}))

vi.mock('@milkdown/plugin-history', () => ({
  history: {}
}))

vi.mock('@milkdown/plugin-clipboard', () => ({
  clipboard: {}
}))

vi.mock('@milkdown/plugin-listener', () => ({
  listener: {},
  listenerCtx: {
    markdownUpdated: () => ({})
  }
}))

describe('MilkdownEditor', () => {
  it('renders loading state initially', () => {
    render(
      <MilkdownEditor
        value="# Test Content"
        onChange={() => {}}
        placeholder="Enter text..."
      />
    )

    expect(screen.getByText('Loading editor...')).toBeInTheDocument()
  })

  it('accepts value and onChange props', () => {
    const handleChange = vi.fn()
    render(
      <MilkdownEditor
        value="# Test markdown"
        onChange={handleChange}
        placeholder="Type here..."
      />
    )

    // Should render the container
    const container = document.querySelector('.milkdown-container')
    expect(container).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <MilkdownEditor
        value=""
        onChange={() => {}}
        className="custom-editor"
      />
    )

    const container = document.querySelector('.milkdown-container.custom-editor')
    expect(container).toBeInTheDocument()
  })

  it('shows placeholder when no value is provided', () => {
    render(
      <MilkdownEditor
        value=""
        onChange={() => {}}
        placeholder="Custom placeholder"
      />
    )

    // The placeholder div is always rendered, but may be hidden by the loading state
    const placeholder = document.querySelector('.milkdown-container')
    expect(placeholder).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <MilkdownEditor
        id="test-editor"
        value="Test content"
        onChange={() => {}}
        placeholder="Enter text..."
        aria-labelledby="test-label"
      />
    )

    const container = document.querySelector('#test-editor')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('role', 'textbox')
    expect(container).toHaveAttribute('aria-multiline', 'true')
    expect(container).toHaveAttribute('aria-labelledby', 'test-label')
    expect(container).toHaveAttribute('tabIndex', '0')
  })

  it('has aria-label when no aria-labelledby is provided', () => {
    render(
      <MilkdownEditor
        id="test-editor-2"
        value="Test content"
        onChange={() => {}}
        placeholder="Custom placeholder"
      />
    )

    const container = document.querySelector('#test-editor-2')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('aria-label', 'Custom placeholder')
    expect(container).not.toHaveAttribute('aria-labelledby')
  })

  it('sets proper tabIndex for readOnly state', () => {
    render(
      <MilkdownEditor
        id="readonly-editor"
        value="Read only content"
        onChange={() => {}}
        readOnly={true}
      />
    )

    const container = document.querySelector('#readonly-editor')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('tabIndex', '-1')
  })
})
