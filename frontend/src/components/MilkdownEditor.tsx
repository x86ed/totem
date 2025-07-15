import React, { useEffect, useRef, useState } from 'react'
import { Edit3, Eye, Bold, Italic, Link, List, ListOrdered, Quote, Code, Save, } from 'lucide-react'

export interface MilkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  isEditMode?: boolean
  minHeight?: string
  id?: string
  'aria-labelledby'?: string
}


export const MilkdownEditor: React.FC<MilkdownEditorProps> = ({
  value,
  onChange,
  className = '',
  readOnly = false,
  isEditMode: isEditModeProp = false,
  minHeight = '300px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(isEditModeProp)
  const [currentLine, setCurrentLine] = useState<number>(0)
  const [showControls, setShowControls] = useState(false)
  const [controlsPosition, setControlsPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setIsEditMode(isEditModeProp)
  }, [isEditModeProp])

  const lines = value.split('\n')

  const toggleMode = () => {
    setIsEditMode((prev) => !prev)
    setShowControls(false)
  }

  const handleLineHover = (lineIndex: number, event: React.MouseEvent) => {
    if (!isEditMode || readOnly) return
    const rect = event.currentTarget.getBoundingClientRect()
    setCurrentLine(lineIndex)
    setControlsPosition({
      top: rect.top + window.scrollY,
      left: rect.left - 180
    })
    setShowControls(true)
  }

  const handleLineLeave = () => {
    setTimeout(() => setShowControls(false), 100)
  }

  const handleControlsMouseEnter = () => setShowControls(true)
  const handleControlsMouseLeave = () => setShowControls(false)

  const applyFormatting = (format: string) => {
    if (!isEditMode || readOnly) return
    const currentLineText = lines[currentLine]
    let newText = currentLineText
    switch (format) {
      case 'bold':
        newText = `**${currentLineText}**`
        break
      case 'italic':
        newText = `*${currentLineText}*`
        break
      case 'code':
        newText = `\`${currentLineText}\``
        break
      case 'quote':
        newText = `> ${currentLineText}`
        break
      case 'list':
        newText = `- ${currentLineText}`
        break
      case 'ordered-list':
        newText = `1. ${currentLineText}`
        break
      case 'link':
        newText = `[${currentLineText}](url)`
        break
    }
    const newLines = [...lines]
    newLines[currentLine] = newText
    const newValue = newLines.join('\n')
    onChange(newValue)
  }

  const parseMarkdownLine = (line: string) => {
    // Handle headings
    if (line.startsWith('# ')) {
      return { type: 'h1', content: line.slice(2), className: 'text-3xl font-bold mb-4 mt-6' }
    }
    if (line.startsWith('## ')) {
      return { type: 'h2', content: line.slice(3), className: 'text-2xl font-bold mb-3 mt-5' }
    }
    if (line.startsWith('### ')) {
      return { type: 'h3', content: line.slice(4), className: 'text-xl font-bold mb-2 mt-4' }
    }
    if (line.startsWith('#### ')) {
      return { type: 'h4', content: line.slice(5), className: 'text-lg font-bold mb-2 mt-3' }
    }
    
    // Handle code blocks
    if (line.startsWith('```')) {
      return { type: 'code-fence', content: line, className: 'bg-gray-100 border rounded px-3 py-2 font-mono text-sm' }
    }
    
    // Handle quotes
    if (line.startsWith('> ')) {
      return { type: 'quote', content: line.slice(2), className: 'border-l-4 border-blue-400 pl-4 italic text-gray-700 bg-blue-50 py-2' }
    }
    
    // Handle lists
    if (line.match(/^\d+\.\s/)) {
      return { type: 'ordered-list', content: line.replace(/^\d+\.\s/, ''), className: 'ml-6' }
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return { type: 'unordered-list', content: line.slice(2), className: 'ml-6' }
    }
    
    // Handle inline formatting
    let content = line
    // Bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    content = content.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
    
    return { type: 'paragraph', content, className: 'mb-2' }
  }

  const renderContent = () => {
    if (isEditMode && !readOnly) {
      return (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Start typing..."
            className="w-full h-full resize-none border-none outline-none bg-transparent font-mono text-sm leading-6 p-4"
            style={{ minHeight }}
          />
        </div>
      )
    }

    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLanguage = ''

    return (
      <div className="prose prose-sm max-w-none p-4">
        {lines.map((line, index) => {
          // Handle code blocks
          if (line.startsWith('```')) {
            if (!inCodeBlock) {
              inCodeBlock = true
              codeBlockLanguage = line.slice(3).trim()
              codeBlockContent = []
              return null
            } else {
              inCodeBlock = false
              const codeContent = codeBlockContent.join('\n')
              const element = (
                <div
                  key={index}
                  className="relative group hover:bg-gray-50 rounded transition-colors -mx-2 px-2"
                  onMouseEnter={(e) => handleLineHover(index, e)}
                  onMouseLeave={handleLineLeave}
                >
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                    <code className={`language-${codeBlockLanguage}`}>
                      {codeContent}
                    </code>
                  </pre>
                </div>
              )
              codeBlockContent = []
              return element
            }
          }

          if (inCodeBlock) {
            codeBlockContent.push(line)
            return null
          }

          const parsed = parseMarkdownLine(line)
          const isEmpty = !line.trim()

          return (
            <div
              key={index}
              className="relative group hover:bg-gray-50 rounded transition-colors -mx-2 px-2"
              onMouseEnter={(e) => handleLineHover(index, e)}
              onMouseLeave={handleLineLeave}
            >
              {parsed.type === 'h1' && (
                <h1 className={parsed.className}>{parsed.content}</h1>
              )}
              {parsed.type === 'h2' && (
                <h2 className={parsed.className}>{parsed.content}</h2>
              )}
              {parsed.type === 'h3' && (
                <h3 className={parsed.className}>{parsed.content}</h3>
              )}
              {parsed.type === 'h4' && (
                <h4 className={parsed.className}>{parsed.content}</h4>
              )}
              {parsed.type === 'quote' && (
                <blockquote className={parsed.className}>
                  <span dangerouslySetInnerHTML={{ __html: parsed.content }} />
                </blockquote>
              )}
              {parsed.type === 'unordered-list' && (
                <ul className={parsed.className}>
                  <li dangerouslySetInnerHTML={{ __html: parsed.content }} />
                </ul>
              )}
              {parsed.type === 'ordered-list' && (
                <ol className={parsed.className}>
                  <li dangerouslySetInnerHTML={{ __html: parsed.content }} />
                </ol>
              )}
              {parsed.type === 'paragraph' && !isEmpty && (
                <p className={parsed.className}>
                  <span dangerouslySetInnerHTML={{ __html: parsed.content }} />
                </p>
              )}
              {isEmpty && <div className="h-6">&nbsp;</div>}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`relative border rounded-lg bg-white ${className}`}>
      {/* Mode Toggle Button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
          type="button"
        >
          {isEditMode ? (
            <>
              <Eye size={16} />
              Preview
            </>
          ) : (
            <>
              <Edit3 size={16} />
              Edit
            </>
          )}
        </button>
      </div>

      {/* Floating Controls */}
      {showControls && isEditMode && !readOnly && (
        <div
          className="fixed z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
          style={{
            top: controlsPosition.top,
            left: controlsPosition.left,
          }}
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        >
          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-500 px-2 py-1 border-b">
              Line {currentLine + 1}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => applyFormatting('bold')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Bold"
                type="button"
              >
                <Bold size={14} />
                Bold
              </button>
              <button
                onClick={() => applyFormatting('italic')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Italic"
                type="button"
              >
                <Italic size={14} />
                Italic
              </button>
              <button
                onClick={() => applyFormatting('code')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Code"
                type="button"
              >
                <Code size={14} />
                Code
              </button>
              <button
                onClick={() => applyFormatting('quote')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Quote"
                type="button"
              >
                <Quote size={14} />
                Quote
              </button>
              <button
                onClick={() => applyFormatting('list')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Bullet List"
                type="button"
              >
                <List size={14} />
                List
              </button>
              <button
                onClick={() => applyFormatting('ordered-list')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs"
                title="Numbered List"
                type="button"
              >
                <ListOrdered size={14} />
                Ordered
              </button>
              <button
                onClick={() => applyFormatting('link')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-xs col-span-2"
                title="Link"
                type="button"
              >
                <Link size={14} />
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="relative overflow-hidden"
        style={{ minHeight }}
      >
        {renderContent()}
      </div>

      {/* Status Bar */}
      <div className="border-t bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between items-center">
        <div>
          {isEditMode ? 'Edit Mode' : 'Preview Mode'} • {lines.length} lines • {value.length} characters
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && !readOnly && (
            <button
              onClick={() => setIsEditMode(false)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              type="button"
            >
              <Save size={12} />
              Save & Preview
            </button>
          )}
        </div>
      </div>
    </div>
  )
}