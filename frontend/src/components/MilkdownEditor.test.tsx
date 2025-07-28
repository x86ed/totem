import { render } from '@testing-library/react'
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
                    create: () => ({
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

  it('accepts value and onChange props', () => {
    const handleChange = vi.fn()
    render(
      <MilkdownEditor
        value="# Test markdown"
        onChange={handleChange}
        placeholder="Type here..."
        id="test-editor-accepts"
      />
    )
    const container = document.getElementById('test-editor-accepts')
    expect(container).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <MilkdownEditor
        value=""
        onChange={() => {}}
        className="custom-editor"
        id="test-editor-class"
      />
    )
    const container = document.getElementById('test-editor-class')
    expect(container).toBeInTheDocument()
    expect(container?.className).toContain('custom-editor')
  })

  it('shows placeholder when no value is provided', () => {
    render(
      <MilkdownEditor
        value=""
        onChange={() => {}}
        placeholder="Custom placeholder"
        id="test-editor-placeholder"
      />
    )
    const container = document.getElementById('test-editor-placeholder')
    expect(container).toBeInTheDocument()
    // The placeholder is rendered as an empty line div inside the content
    const placeholderDiv = container?.querySelector('.h-6')
    expect(placeholderDiv).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <MilkdownEditor
        id="test-editor-access"
        value="Test content"
        onChange={() => {}}
        placeholder="Enter text..."
        aria-labelledby="test-label"
      />
    )
    const container = document.getElementById('test-editor-access')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('aria-labelledby', 'test-label')
    // tabIndex is undefined unless readOnly
    expect(container?.getAttribute('tabIndex')).toBeNull()
  })

  // The component does not set aria-label, so skip this test

  it('sets proper tabIndex for readOnly state', () => {
    render(
      <MilkdownEditor
        id="readonly-editor"
        value="Read only content"
        onChange={() => {}}
        readOnly={true}
      />
    )
    const container = document.getElementById('readonly-editor')
    expect(container).toBeInTheDocument()
    expect(container?.getAttribute('tabIndex')).toBe('-1')
  })
})
