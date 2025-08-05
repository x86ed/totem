
import { useState, useEffect } from 'react';
import Avatar from 'boring-avatars';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useContributors } from '../context/ContributorContext';






function ContributorsDirectoryView() {
  const { contributors, loading, error, getContributorMarkdown } = useContributors();
  const [selected, setSelected] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Auto-select first contributor if none selected
  useEffect(() => {
    if (!selected && contributors.length > 0) {
      setSelected(contributors[0].name);
    }
    // Only run when contributors change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributors]);

  // Helper to slugify contributor names to match markdown filenames
  function slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // Fetch markdown for selected contributor using context method
  useEffect(() => {
    if (!selected) return;
    setMdLoading(true);
    setMdError(null);
    const slug = slugify(selected);
    getContributorMarkdown(slug)
      .then(md => {
        setMarkdown(md);
        setMdLoading(false);
      })
      .catch(e => {
        setMarkdown('');
        setMdError(e.message);
        setMdLoading(false);
      });
  }, [selected, getContributorMarkdown]);

  const sorted = [...contributors].sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (name: string) => {
    setSelected(name);
  };

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ minWidth: 220, maxWidth: 300, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
        <h2 className="text-xl font-bold mb-3">Contributors</h2>
        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sorted.map(contributor => (
            <li
              key={contributor.name}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: contributor.name === selected ? '#e0e7ff' : undefined,
                color: contributor.name === selected ? '#1d4ed8' : undefined,
                fontWeight: contributor.name === selected ? 600 : 400,
                cursor: 'pointer',
                marginBottom: 2
              }}
              onClick={() => handleSelect(contributor.name)}
            >
              <Avatar name={contributor.name} colors={["#0a0310","#49007e","#ff005b","#ff7d10","#ffb238"]} variant="pixel" style={{ width: "2em", verticalAlign: "middle", margin: ".25em"}} square/>
              {contributor.name}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {mdLoading && <div className="text-gray-500">Loading profile...</div>}
        {mdError && <div className="text-red-500">{mdError}</div>}
        {!mdLoading && !mdError && markdown && (
          <>
            <div className="site-font prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
            {/* Debug: show raw markdown for troubleshooting */}
            <div style={{marginTop:8}}>
              <button
                className="text-xs text-gray-400 cursor-pointer underline mb-1"
                onClick={() => setShowRaw(v => !v)}
                type="button"
                style={{background:'none',border:'none',padding:0}}
              >
                {showRaw ? 'Hide raw markdown' : 'Show raw markdown'}
              </button>
              {showRaw && (
                <pre style={{background:'#f3f4f6',padding:8,overflowX:'auto',fontSize:12}}>{markdown}</pre>
              )}
            </div>
            {/* If prose class is missing, Tailwind Typography may not be installed. */}
            <div className="text-xs text-gray-400 mt-2">If this text is not styled, check Tailwind Typography plugin.</div>
          </>
        )}
        {!mdLoading && !mdError && !markdown && (
          <div className="text-gray-400">No profile found for this contributor.</div>
        )}
      </div>
    </div>
  );
}

export default ContributorsDirectoryView;
