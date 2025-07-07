
import { useState, useEffect} from 'react'
import { useArtifacts, ArtifactNode, ArtifactFile } from '../context/ArtifactsContext'

function TreeNode({ node, onSelect, selectedPath }: { node: ArtifactNode, onSelect: (path: string) => void, selectedPath: string }) {
  const [expanded, setExpanded] = useState(false)
  const isFolder = node.type === 'folder' || node.type === 'directory'
  return (
    <div style={{ marginLeft: 16 }}>
      <div
        style={{ cursor: isFolder ? 'pointer' : 'default', fontWeight: node.path === selectedPath ? 'bold' : 'normal', color: node.path === selectedPath ? '#2563eb' : undefined }}
        onClick={() => {
          if (isFolder) setExpanded(e => !e)
          else onSelect(node.path)
        }}
      >
        {isFolder ? (
          <span style={{ marginRight: 4 }}>{expanded ? '📂' : '📁'}</span>
        ) : (
          <span style={{ marginRight: 4 }}>📄</span>
        )}
        <span onClick={() => !isFolder && onSelect(node.path)}>{node.name}</span>
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} onSelect={onSelect} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  )
}


function normalizeArtifactPath(path: string): string {
  // Remove any leading slashes to avoid backend 403
  return path.replace(/^\/+/, '')
}

function ArtifactsView() {
  const { tree, loading, error, getFile, refreshTree } = useArtifacts()
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [file, setFile] = useState<ArtifactFile | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedPath) {
      setFileLoading(true)
      setFileError(null)
      getFile(normalizeArtifactPath(selectedPath))
        .then(f => setFile(f))
        .catch(e => setFileError(e.message || 'Failed to load file'))
        .finally(() => setFileLoading(false))
    } else {
      setFile(null)
    }
  }, [selectedPath, getFile])

  return (
    <div className="artifacts-view" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 260, maxWidth: 320 }}>
        <h2 className="text-2xl font-bold mb-4">Artifacts</h2>
        <button className="mb-2 px-2 py-1 bg-blue-100 rounded text-blue-700" onClick={refreshTree} disabled={loading}>
          Refresh
        </button>
        {loading && <div className="text-gray-500">Loading tree...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {tree && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, background: '#fafbfc', maxHeight: 600, overflow: 'auto' }}>
            <TreeNode node={tree} onSelect={setSelectedPath} selectedPath={selectedPath} />
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 400 }}>
        {fileLoading && <div className="text-gray-500">Loading file...</div>}
        {fileError && <div className="text-red-500">{fileError}</div>}
        {!file && <div className="text-gray-400">Select a file to view its contents.</div>}
        {file && (
          <div className="artifact-file-view mt-2">
            {file.mime?.startsWith('image/') || file.encoding === 'base64' ? (
              <img
                src={`data:${file.mime || 'image/*'};base64,${file.content}`}
                alt={selectedPath}
                style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8, boxShadow: '0 2px 8px #0001' }}
              />
            ) : (
              <pre style={{ background: '#f3f4f6', padding: 16, borderRadius: 6, overflowX: 'auto' }}>{file.content}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtifactsView
