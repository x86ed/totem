import React, { useState, useEffect, useRef } from 'react'
import { Crepe } from '@milkdown/crepe'
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
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
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState<string | null>(null)
  const lastSavedContent = useRef<string | null>(null)
  const crepeRef = useRef<Crepe | null>(null);

  useEffect(() => {
    if (selectedPath) {
      setFileLoading(true)
      setFileError(null)
      getFile(normalizeArtifactPath(selectedPath))
        .then(f => {
          setFile(f)
          setEditedContent(null)
          if (f) {
            lastSavedContent.current = f.content
          } else {
            lastSavedContent.current = null
          }
        })
        .catch(e => setFileError(e.message || 'Failed to load file'))
        .finally(() => setFileLoading(false))
    } else {
      setFile(null)
      setEditedContent(null)
      lastSavedContent.current = null
    }
  }, [selectedPath, getFile])

  return (
    <div className="artifacts-view" style={{ display: 'flex', gap: 32 }}>
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
      <div className="artifact-file-view mt-2">
        {fileLoading && <div className="text-gray-500">Loading file...</div>}
        {fileError && <div className="text-red-500">{fileError}</div>}
        {!file && <div className="text-gray-400">Select a file to view its contents.</div>}
        {file && (
          file.mime?.startsWith('image/') || file.encoding === 'base64' ? (
            <img
              src={`data:${file.mime || 'image/*'};base64,${file.content}`}
              alt={selectedPath}
              className="artifact-image"
            />
          ) : (
            <div className="milkdown-editor-outer site-font">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                {!editMode ? (
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                    onClick={() => {
                      setEditMode(true);
                      setEditedContent(file.content);
                    }}
                    style={{ fontWeight: 600 }}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white"
                      onClick={() => {
                        setEditMode(false);
                        setEditedContent(null);
                      }}
                      style={{ fontWeight: 600 }}
                    >
                      View
                    </button>
                <button
                  className="px-3 py-1 rounded bg-green-600 text-white font-semibold"
                  onClick={async () => {
                    if (!selectedPath) return;
                    // Use crepeRef to get the latest markdown from the active editor
                    let contentToSave = editedContent ?? '';
                    if (crepeRef.current && typeof crepeRef.current.getMarkdown === 'function') {
                      contentToSave = crepeRef.current.getMarkdown();
                    }
                    try {
                      const res = await fetch('http://localhost:8080/api/artifacts/file', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: selectedPath.replace(/^\/+/,'') , content: contentToSave, encoding: 'utf-8' })
                      });
                      if (!res.ok) throw new Error('Failed to save');
                      const updated = await getFile(normalizeArtifactPath(selectedPath));
                      setFile(updated);
                      setEditMode(false);
                    } catch (e) {
                      alert('Failed to save: ' + (e instanceof Error ? e.message : e));
                    }
                  }}
                >
                  Save
                </button>
                    <button
                      className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                      onClick={() => {
                        // Force reload by clearing and resetting selectedPath
                        setSelectedPath("");
                        setTimeout(() => setSelectedPath(selectedPath), 0);
                      }}
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
              <MilkdownEditorWrapper
                key={selectedPath + (editMode ? '-edit' : '-view')}
                content={editMode && editedContent !== null ? editedContent : file.content}
                editable={editMode}
                onChange={value => {
                  if (editMode) setEditedContent(value);
                }}
                crepeRef={crepeRef}
              />
            </div>
          )
        )}
      </div>
    </div>
  )
}

// Crepe + Milkdown React integration for artifact markdown
type CrepeEditorProps = {
  content: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  crepeRef?: React.MutableRefObject<Crepe | null>;
};

// Custom hook to sync readonly state with editMode
const useCrepeReadonly = (readonly: boolean, crepeRef?: React.MutableRefObject<Crepe | null>) => {
  useEffect(() => {
    if (crepeRef && crepeRef.current) {
      crepeRef.current.setReadonly(readonly);
    }
  }, [readonly, crepeRef]);
};

const CrepeEditor: React.FC<CrepeEditorProps> = ({ content, editable = false, crepeRef }) => {
  useCrepeReadonly(!editable, crepeRef);
  useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue: content,
      });
      crepe.setReadonly(!editable);
      if (crepeRef) crepeRef.current = crepe;
      return crepe;
    },
    [content, editable]
  );
  return <Milkdown />;
};

type MilkdownEditorWrapperProps = {
  content: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  crepeRef?: React.MutableRefObject<Crepe | null>;
};

const MilkdownEditorWrapper: React.FC<MilkdownEditorWrapperProps> = ({ content, editable = false, onChange, crepeRef }) => {
  return (
    <MilkdownProvider>
      <CrepeEditor content={content} editable={editable} onChange={onChange} crepeRef={crepeRef} />
    </MilkdownProvider>
  );
};

export default ArtifactsView
