
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const COLLABORATORS_API = import.meta.env?.DEV ? 'http://localhost:8080/api/collaborator' : '/api/collaborator';
const MARKDOWN_BASE = '/.totem/collaborators/';

function CollaboratorsDirectoryView() {
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState<string | null>(null);

  // Fetch collaborator names
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(COLLABORATORS_API)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch collaborators');
        return res.json();
      })
      .then(data => {
        // Accepts array of collaborator names or objects with .name
        const names = Array.isArray(data)
          ? (typeof data[0] === 'string' ? data : data.map((c: any) => c.name))
          : [];
        setCollaborators(names);
        setLoading(false);
        // Auto-select first if none selected
        if (!selected && names.length > 0) setSelected(names[0]);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, []);

  // Fetch markdown for selected collaborator
  useEffect(() => {
    if (!selected) return;
    setMdLoading(true);
    setMdError(null);
    fetch(`${MARKDOWN_BASE}${selected.toLowerCase()}.md`)
      .then(res => {
        if (!res.ok) throw new Error('Markdown not found');
        return res.text();
      })
      .then(md => {
        setMarkdown(md);
        setMdLoading(false);
      })
      .catch(e => {
        setMarkdown('');
        setMdError(e.message);
        setMdLoading(false);
      });
  }, [selected]);

  const sorted = [...collaborators].sort((a, b) => a.localeCompare(b));

  const handleSelect = (name: string) => {
    setSelected(name);
  };

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Collaborators</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(name => (
            <li
              key={name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: name === selected ? '#e0e7ff' : undefined,
                color: name === selected ? '#1d4ed8' : undefined,
                fontWeight: name === selected ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => handleSelect(name)}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {mdLoading && <div className="text-gray-500">Loading profile...</div>}
        {mdError && <div className="text-red-500">{mdError}</div>}
        {!mdLoading && !mdError && markdown && (
          <div className="site-font prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          </div>
        )}
        {!mdLoading && !mdError && !markdown && (
          <div className="text-gray-400">No profile found for this collaborator.</div>
        )}
      </div>
    </div>
  );
}

export default CollaboratorsDirectoryView;
