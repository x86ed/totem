import React, { useState, useRef, useEffect } from 'react';
import Avatar from "boring-avatars";
import { usePersonas } from '../context/PersonaContext';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

// Milkdown/Crepe wrapper for persona markdown
const MilkdownEditorWrapper: React.FC<{
  content: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  crepeRef?: React.MutableRefObject<Crepe | null>;
}> = ({ content, editable = false, crepeRef }) => {
  useEditor(
    (root) => {
      const crepe = new Crepe({ root, defaultValue: content });
      crepe.setReadonly(!editable);
      if (crepeRef) crepeRef.current = crepe;
      return crepe;
    },
    [content, editable]
  );
  return <Milkdown />;
};

function PersonasDirectoryView() {
  const { personas, loading, error, updatePersona, refreshPersonas } = usePersonas();
  const [selected, setSelected] = useState<string | null>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState<string | null>(null);
  const lastSavedContent = useRef<string | null>(null);

  // Deep link: parse hash for selected persona
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      const segments = hash.split('/');
      if (segments[0] === 'project' && segments[1] === 'personas' && segments[2]) {
        setSelected(decodeURIComponent(segments[2]));
      } else {
        setSelected(null);
      }
    };
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Sort personas alphabetically by name
  const sorted = [...personas].sort((a, b) => a.name.localeCompare(b.name));
  const selectedPersona = sorted.find(p => p.name === selected) || sorted[0];

  // When a persona is clicked, update state and hash
  const handleSelect = (name: string) => {
    setSelected(name);
    window.location.hash = `#project/personas/${encodeURIComponent(name)}`;
  };

  // Fetch raw markdown for selected persona
  useEffect(() => {
    async function fetchMarkdown() {
      if (!selectedPersona) {
        setRawMarkdown(null);
        return;
      }
      try {
        const apiUrl = import.meta.env?.DEV
          ? `http://localhost:8080/api/persona/${selectedPersona.name}`
          : `/api/persona/${selectedPersona.name}`;
        const res = await fetch(apiUrl, { headers: { Accept: 'text/markdown,application/json' } });
        if (res.ok) {
          const text = await res.text();
          if (text.trim().startsWith('{')) {
            const obj = JSON.parse(text);
            setRawMarkdown(obj.content);
          } else {
            setRawMarkdown(text);
          }
        } else {
          setRawMarkdown(null);
        }
      } catch {
        setRawMarkdown(null);
      }
    }
    fetchMarkdown();
  }, [selectedPersona]);

  // When persona or markdown changes, reset edit state
  useEffect(() => {
    setEditMode(false);
    setEditedContent(null);
    setSaveError(null);
    lastSavedContent.current = rawMarkdown;
  }, [rawMarkdown, selectedPersona]);

  // Save handler
  const handleSave = async () => {
    if (!selectedPersona) return;
    let markdownToSave = editedContent ?? '';
    if (crepeRef.current && typeof crepeRef.current.getMarkdown === 'function') {
      markdownToSave = crepeRef.current.getMarkdown();
    }
    try {
      // Send as { markdown: ... } to match backend controller
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updatePersona(selectedPersona.name, { markdown: markdownToSave } as any);
      setEditMode(false);
      setEditedContent(null);
      setSaveError(null);
      await refreshPersonas();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  // Reset handler: use provider to refresh personas, then reload markdown for selected persona from context
  const handleReset = async () => {
    if (!selectedPersona) return;
    setSaveError(null);
    await refreshPersonas();
    // After refresh, get the latest persona from context
    const persona = personas.find(p => p.name === selectedPersona.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (persona && 'markdown' in persona && typeof (persona as any).markdown === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setEditedContent((persona as any).markdown);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lastSavedContent.current = (persona as any).markdown;
    } else {
      // fallback: just clear edits
      setEditedContent('');
      lastSavedContent.current = '';
    }
  };

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Personas</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(persona => (
            <li
              key={persona.name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: persona.name === selectedPersona?.name ? '#e0e7ff' : undefined,
                color: persona.name === selectedPersona?.name ? '#1d4ed8' : undefined,
                fontWeight: persona.name === selectedPersona?.name ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => handleSelect(persona.name)}
            >
              <Avatar name={persona.name}   colors={["#0a0310","#49007e","#ff005b","#ff7d10","#ffb238"]} variant="pixel" style={{ width: "2em", verticalAlign: "middle", margin: ".25em"}} square/>
              {persona.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedPersona ? (
          <div className="milkdown-editor-outer site-font">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              {!editMode ? (
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  onClick={() => {
                    setEditMode(true);
                    setEditedContent(lastSavedContent.current ?? rawMarkdown ?? '');
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
                      setSaveError(null);
                    }}
                    style={{ fontWeight: 600 }}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white font-semibold"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </>
              )}
              {saveError && <span className="text-red-500 ml-2">{saveError}</span>}
            </div>
            <MilkdownProvider>
              <MilkdownEditorWrapper
                key={selectedPersona.name + (editMode ? '-edit' : '-view')}
                content={editMode && editedContent !== null ? editedContent : rawMarkdown ?? ''}
                editable={editMode}
                onChange={value => {
                  if (editMode) setEditedContent(value);
                }}
                crepeRef={crepeRef}
              />
            </MilkdownProvider>
          </div>
        ) : (
          <div className="text-gray-400">Select a persona to view details.</div>
        )}
      </div>
    </div>
  );
}

export default PersonasDirectoryView;
