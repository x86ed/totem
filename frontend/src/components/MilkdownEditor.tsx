import React, { useEffect, useRef, useState } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { history } from '@milkdown/plugin-history'
import { clipboard } from '@milkdown/plugin-clipboard'
import { listener, listenerCtx } from '@milkdown/plugin-listener'

interface MilkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  minHeight?: string
  id?: string
  'aria-labelledby'?: string
}

const MilkdownEditor: React.FC<MilkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  readOnly = false,
  minHeight = '120px',
  id,
  'aria-labelledby': ariaLabelledby
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<Editor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!editorRef.current) return

    const initEditor = async () => {
      try {
        setIsLoading(true)

        // Clear any existing editor
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy()
        }

        // Create new editor instance
        const editor = Editor.make()
          .config((ctx) => {
            ctx.set(rootCtx, editorRef.current)
            ctx.set(defaultValueCtx, value || '')
            
            // Set up listener for content changes
            ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
              if (markdown !== value) {
                onChange(markdown)
              }
            })
          })
          .use(commonmark)
          .use(gfm)
          .use(history)
          .use(clipboard)
          .use(listener)

        // Create and store the editor
        editorInstanceRef.current = await editor.create()
        
        // Apply custom styles and readonly state
        if (editorRef.current) {
          const editorElement = editorRef.current.querySelector('.milkdown') as HTMLElement
          if (editorElement) {
            editorElement.style.minHeight = minHeight
            editorElement.style.border = '1px solid #d1d5db'
            editorElement.style.borderRadius = '6px'
            editorElement.style.padding = '12px'
            editorElement.style.fontSize = '14px'
            editorElement.style.lineHeight = '1.5'
            editorElement.style.backgroundColor = readOnly ? '#f9fafb' : '#ffffff'
            editorElement.style.outline = 'none'
            
            // Handle readonly state
            if (readOnly) {
              editorElement.style.pointerEvents = 'none'
              editorElement.style.cursor = 'not-allowed'
              editorElement.style.opacity = '0.7'
            } else {
              editorElement.style.pointerEvents = 'auto'
              editorElement.style.cursor = 'text'
              editorElement.style.opacity = '1'
            }
            
            // Add focus styles only if not readonly
            if (!readOnly) {
              editorElement.addEventListener('focus', () => {
                editorElement.style.borderColor = '#10b981'
                editorElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
              })
              
              editorElement.addEventListener('blur', () => {
                editorElement.style.borderColor = '#d1d5db'
                editorElement.style.boxShadow = 'none'
              })
            }
          }
        }

        // Ensure loading state is visible for at least one tick (fixes test flakiness)
        Promise.resolve().then(() => setIsLoading(false))
      } catch (error) {
        console.error('Failed to initialize Milkdown editor:', error)
        setIsLoading(false)
      }
    }

    initEditor()

    // Cleanup on unmount
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [readOnly]) // Re-create editor when readOnly changes

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorInstanceRef.current && value !== undefined) {
      try {
        editorInstanceRef.current.action((ctx) => {
          const currentValue = ctx.get(defaultValueCtx)
          if (currentValue !== value) {
            ctx.set(defaultValueCtx, value)
          }
        })
      } catch (error) {
        console.error('Failed to update editor content:', error)
      }
    }
  }, [value])

  return (
    <div 
      className={`milkdown-container ${className}`} 
      id={id}
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabelledby ? undefined : placeholder}
      aria-labelledby={ariaLabelledby}
      tabIndex={readOnly ? -1 : 0}
    >
      {isLoading && (
        <div 
          className="flex items-center justify-center text-gray-500 text-sm"
          style={{ minHeight }}
        >
          Loading editor...
        </div>
      )}
      <div 
        ref={editorRef}
        className={isLoading ? 'hidden' : 'block'}
        style={{ minHeight: isLoading ? '0' : minHeight }}
      />
      {!value && !isLoading && (
        <div className="absolute inset-0 flex items-start justify-start pt-3 pl-3 pointer-events-none text-gray-400 text-sm">
          {placeholder}
        </div>
      )}
    </div>
  )
}

export default MilkdownEditor
