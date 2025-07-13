import React, { useContext, useState } from 'react';
import { FeatureContext } from '../context/FeatureContext';

const FeatureTypesSection: React.FC = () => {
  const featureCtx = useContext(FeatureContext);
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const items = featureCtx?.features?.map(f => ({ key: f.key, desc: f.description })) ?? [];
  const loading = featureCtx?.loading ?? false;

  const handleAdd = async () => {
    if (!featureCtx || !input.trim() || items.some(i => i.key === input.trim())) return;
    await featureCtx.addFeature({ key: input.trim(), description: desc.trim() });
    setInput('');
    setDesc('');
  };
  const handleUpdate = async (idx: number) => {
    if (!featureCtx) return;
    const oldKey = items[idx]?.key;
    if (oldKey) {
      await featureCtx.updateFeature(oldKey, { key: editKey, description: editDesc });
      setEditIdx(null);
    }
  };
  const handleDelete = async (idx: number) => {
    if (!featureCtx) return;
    const key = items[idx]?.key;
    if (key) await featureCtx.deleteFeature(key);
  };

  return (
    <>
      <div className="text-lg font-semibold text-blue-800 mb-3">Feature Types</div>
      <div className="text-sm text-blue-600 mb-4">Major features or capabilities (e.g. auth, payment, analytics).</div>
      {loading && <div className="text-blue-500 mb-2">Loading...</div>}
      <ul className="mb-3 divide-y divide-blue-100 bg-blue-50 rounded-lg border border-blue-100">
        {items.map((item, idx) => (
          <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-blue-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                {editIdx === idx ? (
                  <>
                    <input
                      className="border border-blue-300 px-2 py-1 rounded text-sm font-semibold"
                      value={editKey}
                      onChange={e => setEditKey(e.target.value)}
                    />
                    <button
                      className="ml-2 text-blue-600 hover:text-blue-900 px-2 rounded"
                      type="button"
                      onClick={() => handleUpdate(idx)}
                    >Save</button>
                    <button
                      className="ml-1 text-gray-400 hover:text-gray-700 px-2 rounded"
                      type="button"
                      onClick={() => setEditIdx(null)}
                    >Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="text-blue-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                    <button
                      className="ml-2 text-blue-400 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                      onClick={() => {
                        setEditIdx(idx);
                        setEditKey(item.key);
                        setEditDesc(item.desc);
                      }}
                      title="Edit"
                      type="button"
                      aria-label={`Edit ${item.key}`}
                    >✎</button>
                    <button
                      className="ml-2 text-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                      onClick={() => handleDelete(idx)}
                      title="Remove"
                      type="button"
                      aria-label={`Remove ${item.key}`}
                    >×</button>
                  </>
                )}
              </div>
              {editIdx === idx ? (
                <input
                  className="border border-blue-200 px-2 py-1 rounded text-xs mt-1 w-full"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description..."
                />
              ) : (
                item.desc && (
                  <div className="text-blue-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center mb-1">
        <input
          className="border border-blue-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 placeholder-blue-300"
          value={input}
          placeholder="Add key..."
          onChange={e => setInput(e.target.value)}
        />
        <input
          className="border border-blue-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-50 placeholder-blue-200"
          value={desc}
          placeholder="Description..."
          onChange={e => setDesc(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-700 transition-all duration-150"
          type="button"
          onClick={handleAdd}
        >Add</button>
      </div>
    </>
  );
};

export default FeatureTypesSection;
