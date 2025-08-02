import React, { useState, useContext } from 'react';
import { ComplexityContext } from '../context/ComplexityContext';
import { ComplexityProvider } from '../context/ComplexityContext';
import { StatusContext, StatusProvider } from '../context/StatusContext';
import { ComponentContext, ComponentProvider } from '../context/ComponentContext';
import { LayerContext, LayerProvider } from '../context/LayerContext';
import { FeatureProvider } from '../context/FeatureContext';
import FeatureTypesSection from './FeatureTypesSection';
import { PriorityContext, PriorityProvider } from '../context/PriorityContext';

// LayerTypesSection: Uses LayerContext for CRUD
// ComponentTypesSection: Uses ComponentContext for CRUD
const ComponentTypesSection: React.FC = () => {
  const componentCtx = useContext(ComponentContext);
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const items = componentCtx?.components?.map(c => ({ key: c.key, desc: c.description })) ?? [];
  const loading = componentCtx?.loading ?? false;
  const handleAdd = async () => {
    if (!componentCtx || !input.trim() || items.some(i => i.key === input.trim())) return;
    await componentCtx.addComponent({ key: input.trim(), description: desc.trim() });
    setInput('');
    setDesc('');
  };
  const handleUpdate = async (idx: number) => {
    if (!componentCtx) return;
    const oldKey = items[idx]?.key;
    if (oldKey) {
      // Pass newKey if key is changed
      await componentCtx.updateComponent(oldKey, { key: editKey, description: editDesc });
      setEditIdx(null);
    }
  };
  const handleDelete = async (idx: number) => {
    if (!componentCtx) return;
    const key = items[idx]?.key;
    if (key) await componentCtx.deleteComponent(key);
  };
  return (
    <div className="component-section">
      <div className="text-lg font-semibold text-yellow-800 mb-3">Component Types</div>
      <div className="text-sm text-yellow-600 mb-4">Major components or subsystems (e.g. api, ui, database).</div>
      {loading && <div className="text-yellow-500 mb-2">Loading...</div>}
      <ul className="mb-3 divide-y divide-yellow-100 bg-yellow-50 rounded-lg border border-yellow-100">
        {items.map((item, idx) => (
          <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-yellow-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                {editIdx === idx ? (
                  <>
                    <input
                      className="border border-yellow-300 px-2 py-1 rounded text-sm font-semibold"
                      value={editKey}
                      onChange={e => setEditKey(e.target.value)}
                    />
                    <button
                      className="ml-2 text-yellow-600 hover:text-yellow-900 px-2 rounded"
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
                    <span className="text-yellow-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                    <button
                      className="ml-2 text-yellow-400 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
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
                  className="border border-yellow-200 px-2 py-1 rounded text-xs mt-1 w-full"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description..."
                />
              ) : (
                item.desc && (
                  <div className="text-yellow-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center mb-1">
        <input
          className="border border-yellow-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-yellow-50 placeholder-yellow-300"
          value={input}
          placeholder="Add key..."
          onChange={e => setInput(e.target.value)}
        />
        <input
          className="border border-yellow-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-yellow-50 placeholder-yellow-200"
          value={desc}
          placeholder="Description..."
          onChange={e => setDesc(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-yellow-600 hover:to-yellow-700 transition-all duration-150"
          type="button"
          onClick={handleAdd}
        >Add</button>
      </div>
    </div>
  );
};
const LayerTypesSection: React.FC = () => {
  const layerCtx = useContext(LayerContext);
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const items = layerCtx?.layers?.map(l => ({ key: l.key, desc: l.description })) ?? [];
  const loading = layerCtx?.loading ?? false;
  const handleAdd = async () => {
    if (!layerCtx || !input.trim() || items.some(i => i.key === input.trim())) return;
    await layerCtx.addLayer({ key: input.trim(), description: desc.trim() });
    setInput('');
    setDesc('');
  };
  const handleUpdate = async (idx: number) => {
    if (!layerCtx) return;
    const oldKey = items[idx]?.key;
    if (oldKey) {
      // If the key is changed, pass newKey in the item
      const item = editKey !== oldKey
        ? { key: editKey, description: editDesc, newKey: editKey }
        : { key: editKey, description: editDesc };
      await layerCtx.updateLayer(oldKey, item);
      setEditIdx(null);
    }
  };
  const handleDelete = async (idx: number) => {
    if (!layerCtx) return;
    const key = items[idx]?.key;
    if (key) await layerCtx.deleteLayer(key);
  };
  return (
    <>
      <div className="text-lg font-semibold text-green-800 mb-3">Layer Types</div>
      <div className="text-sm text-green-600 mb-4">Project layer: Frontend, Backend, GraphQL, Mobile, Tests, Docs.</div>
      {loading && <div className="text-green-500 mb-2">Loading...</div>}
      <ul className="mb-3 divide-y divide-green-100 bg-green-50 rounded-lg border border-green-100">
        {items.map((item, idx) => (
          <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-green-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                {editIdx === idx ? (
                  <>
                    <input
                      className="border border-green-300 px-2 py-1 rounded text-sm font-semibold"
                      value={editKey}
                      onChange={e => setEditKey(e.target.value)}
                    />
                    <button
                      className="ml-2 text-green-600 hover:text-green-900 px-2 rounded"
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
                    <span className="text-green-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                    <button
                      className="ml-2 text-yellow-400 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
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
                  className="border border-green-200 px-2 py-1 rounded text-xs mt-1 w-full"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description..."
                />
              ) : (
                item.desc && (
                  <div className="text-green-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center mb-1">
        <input
          className="border border-green-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 placeholder-green-300"
          value={input}
          placeholder="Add key..."
          onChange={e => setInput(e.target.value)}
        />
        <input
          className="border border-green-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-green-200 bg-green-50 placeholder-green-200"
          value={desc}
          placeholder="Description..."
          onChange={e => setDesc(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-700 transition-all duration-150"
          type="button"
          onClick={handleAdd}
        >Add</button>
      </div>
    </>
  );
};
import { PrefixProvider } from '../context/PrefixContext';
import usePrefix from '../context/usePrefix';
import './SettingsView.css';

const SettingsViewInner: React.FC = () => {
  const { prefix, setPrefix, loading } = usePrefix();
  const [editPrefix, setEditPrefix] = useState(prefix);
  const [dirty, setDirty] = useState(false);

  // Sync editPrefix with context value when loaded
  React.useEffect(() => {
    if (!loading) {
      setEditPrefix(prefix);
      setDirty(false);
    }
  }, [prefix, loading]);
  const complexityCtx = React.useContext(ComplexityContext);
  const [inputComplexity, setInputComplexity] = useState('');
  const [descComplexity, setDescComplexity] = useState('');
  const [editComplexityIdx, setEditComplexityIdx] = useState<number | null>(null);
  const [editComplexityKey, setEditComplexityKey] = useState('');
  const [editComplexityDesc, setEditComplexityDesc] = useState('');
  const complexityItems = React.useMemo(
    () => complexityCtx?.complexities?.map((c: { key: string; description: string }) => ({ key: c.key, desc: c.description })) ?? [],
    [complexityCtx?.complexities]
  );
  const complexityLoading = complexityCtx?.loading ?? false;

  const handleAddComplexity = async () => {
    if (!complexityCtx || !inputComplexity.trim() || complexityItems.some((i: { key: string }) => i.key === inputComplexity.trim())) return;
    await complexityCtx.addComplexity({ key: inputComplexity.trim(), description: descComplexity.trim() });
    setInputComplexity('');
    setDescComplexity('');
  };
  const handleUpdateComplexity = async (idx: number) => {
    if (!complexityCtx) return;
    const oldKey = complexityItems[idx]?.key;
    if (oldKey) {
      await complexityCtx.updateComplexity(oldKey, { key: editComplexityKey, description: editComplexityDesc });
      setEditComplexityIdx(null);
    }
  };
  const handleDeleteComplexity = async (idx: number) => {
    if (!complexityCtx) return;
    const key = complexityItems[idx]?.key;
    if (key) await complexityCtx.deleteComplexity(key);
  };
  // Layer state is now managed by LayerContext
  // Component state is now managed by ComponentContext
const PriorityLevelsSection: React.FC = () => {
  const priorityCtx = useContext(PriorityContext);
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const items = priorityCtx?.priorities?.map((p: { key: string; description: string }) => ({ key: p.key, desc: p.description })) ?? [];
  const loading = priorityCtx?.loading ?? false;

  const handleAdd = async () => {
    if (!priorityCtx || !input.trim() || items.some((i: { key: string }) => i.key === input.trim())) return;
    await priorityCtx.addPriority({ key: input.trim(), description: desc.trim() });
    setInput('');
    setDesc('');
  };
  const handleUpdate = async (idx: number) => {
    if (!priorityCtx) return;
    const oldKey = items[idx]?.key;
    if (oldKey) {
      await priorityCtx.updatePriority(oldKey, { key: editKey, description: editDesc });
      setEditIdx(null);
    }
  };
  const handleDelete = async (idx: number) => {
    if (!priorityCtx) return;
    const key = items[idx]?.key;
    if (key) await priorityCtx.deletePriority(key);
  };
  return (
    <>
      <div className="text-lg font-semibold text-purple-800 mb-3">Priority Levels</div>
      <div className="text-sm text-purple-600 mb-4">Relative urgency or importance: Low, Medium, High, Critical.</div>
      {loading && <div className="text-purple-500 mb-2">Loading...</div>}
      <ul className="mb-3 divide-y divide-purple-100 bg-purple-50 rounded-lg border border-purple-100">
        {items.map((item: { key: string; desc: string }, idx: number) => (
          <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-purple-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                {editIdx === idx ? (
                  <>
                    <input
                      className="border border-purple-300 px-2 py-1 rounded text-sm font-semibold"
                      value={editKey}
                      onChange={e => setEditKey(e.target.value)}
                    />
                    <button
                      className="ml-2 bg-purple-500 hover:bg-purple-700 text-white px-2 py-1 rounded font-semibold"
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
                    <span className="text-purple-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                    <button
                      className="ml-2 text-purple-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-full px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                      type="button"
                      onClick={() => {
                        setEditIdx(idx);
                        setEditKey(item.key);
                        setEditDesc(item.desc);
                      }}
                      title="Edit"
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
                  className="border border-purple-200 px-2 py-1 rounded text-xs mt-1 w-full"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description..."
                />
              ) : (
                item.desc && (
                  <div className="text-purple-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center mb-1">
        <input
          className="border border-purple-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 placeholder-purple-300"
          value={input}
          placeholder="Add key..."
          onChange={e => setInput(e.target.value)}
        />
        <input
          className="border border-purple-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-purple-50 placeholder-purple-200"
          value={desc}
          placeholder="Description..."
          onChange={e => setDesc(e.target.value)}
        />
        <button
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-purple-600 hover:to-purple-700 transition-all duration-150"
          type="button"
          onClick={handleAdd}
        >Add</button>
      </div>
    </>
  );
};
  const statusCtx = React.useContext(StatusContext);
  const [inputStatus, setInputStatus] = useState('');
  const [descStatus, setDescStatus] = useState('');
  const [editStatusIdx, setEditStatusIdx] = useState<number | null>(null);
  const [editStatusKey, setEditStatusKey] = useState('');
  const [editStatusDesc, setEditStatusDesc] = useState('');
  const statusItems = statusCtx?.statuses?.map((s: { key: string; description: string }) => ({ key: s.key, desc: s.description })) ?? [];
  const statusLoading = statusCtx?.loading ?? false;

  const handleAddStatus = async () => {
    if (!statusCtx || !inputStatus.trim() || statusItems.some((i: { key: string }) => i.key === inputStatus.trim())) return;
    await statusCtx.addStatus({ key: inputStatus.trim(), description: descStatus.trim() });
    setInputStatus('');
    setDescStatus('');
  };
  const handleUpdateStatus = async (idx: number) => {
    if (!statusCtx) return;
    const oldKey = statusItems[idx]?.key;
    if (oldKey) {
      await statusCtx.updateStatus(oldKey, { key: editStatusKey, description: editStatusDesc });
      setEditStatusIdx(null);
    }
  };
  const handleDeleteStatus = async (idx: number) => {
    if (!statusCtx) return;
    const key = statusItems[idx]?.key;
    if (key) await statusCtx.deleteStatus(key);
  };

  return (
    <div className="settings-view max-w-6xl mx-auto p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border border-green-100">
      <h3 className="text-2xl font-bold mb-8 text-green-900 tracking-wide flex items-center gap-2">
        <span className="inline-block bg-green-200 text-green-700 rounded-full px-3 py-1 text-lg mr-2">⚙️</span>
        Project Settings
      </h3>
      <div className="idSettings" style={{padding: '1rem 1rem 1rem 1rem', borderRadius: '1rem'}}>
        <section className="settings-section prefix-section mb-10">
          <div className="p-6">
            <label className="section-title">Project Prefix</label>
            <div className="flex gap-2 items-center">
              <input
                className="border border-cyan-300 px-3 py-2 rounded-lg text-lg font-mono bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-cyan-300 w-48"
                value={editPrefix}
                onChange={e => {
                  setEditPrefix(e.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase().slice(0, 6));
                  setDirty(true);
                }}
                maxLength={6}
                placeholder="e.g. PROJ"
                disabled={loading}
              />
              <button
                className={`bg-cyan-500 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all duration-150 ${(!dirty || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
                disabled={!dirty || loading}
                onClick={() => { setPrefix(editPrefix); setDirty(false); }}
              >Save</button>
            </div>
            <div className="text-xs text-cyan-700 mt-1">Prefix used for ticket IDs, e.g. <span className="font-mono">{prefix}-123</span></div>
          </div>
        </section>

        {/* Two rows of 3 cards each, each with a unique color theme */}
        <div className="settings-grid-2x3">
          {/* Feature Types - Blue */}
          <div className="settings-section feature-section">
            <FeatureTypesSection />
          </div>
          {/* Layer Types - Green */}
          <div className="settings-section layer-section">
            <LayerTypesSection />
          </div>
          {/* Component Types - Yellow */}
          <div className="settings-section component-section">
            <ComponentTypesSection />
          </div>
        </div>
      </div> {/* <-- Properly close the red background div here */}
      <div className="settings-grid-2x3 bottom">
        {/* Priority Levels - Purple */}
        <div className="settings-section">
          <PriorityLevelsSection />
        </div>
        {/* Ticket Statuses - Pink */}
        <div className="settings-section">
          <div className="text-lg font-semibold text-pink-800 mb-3">Ticket Statuses</div>
          <div className="text-sm text-pink-600 mb-4">Workflow state: Open, In Progress, Blocked, Review, Done, Closed.</div>
          {statusLoading && <div className="text-pink-500 mb-2">Loading...</div>}
          <ul className="mb-3 divide-y divide-pink-100 bg-pink-50 rounded-lg border border-pink-100">
            {statusItems.map((item: { key: string; desc: string }, idx: number) => (
              <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-pink-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    {editStatusIdx === idx ? (
                      <>
                        <input
                          className="border border-pink-300 px-2 py-1 rounded text-sm font-semibold"
                          value={editStatusKey}
                          onChange={e => setEditStatusKey(e.target.value)}
                        />
                        <button
                          className="ml-2 bg-pink-500 hover:bg-pink-700 text-white px-2 py-1 rounded font-semibold"
                          type="button"
                          onClick={() => handleUpdateStatus(idx)}
                        >Save</button>
                        <button
                          className="ml-1 text-gray-400 hover:text-gray-700 px-2 rounded"
                          type="button"
                          onClick={() => setEditStatusIdx(null)}
                        >Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="text-pink-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                        <button
                          className="ml-2 text-pink-400 hover:text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-full px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          type="button"
                          onClick={() => {
                            setEditStatusIdx(idx);
                            setEditStatusKey(item.key);
                            setEditStatusDesc(item.desc);
                          }}
                          title="Edit"
                          aria-label={`Edit ${item.key}`}
                        >✎</button>
                        <button
                          className="ml-2 text-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          onClick={() => handleDeleteStatus(idx)}
                          title="Remove"
                          type="button"
                          aria-label={`Remove ${item.key}`}
                        >×</button>
                      </>
                    )}
                  </div>
                  {editStatusIdx === idx ? (
                    <input
                      className="border border-pink-200 px-2 py-1 rounded text-xs mt-1 w-full"
                      value={editStatusDesc}
                      onChange={e => setEditStatusDesc(e.target.value)}
                      placeholder="Description..."
                    />
                  ) : (
                    item.desc && (
                      <div className="text-pink-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 items-center mb-1">
            <input
              className="border border-pink-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50 placeholder-pink-300"
              value={inputStatus}
              placeholder="Add key..."
              onChange={e => setInputStatus(e.target.value)}
            />
            <input
              className="border border-pink-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-pink-50 placeholder-pink-200"
              value={descStatus}
              placeholder="Description..."
              onChange={e => setDescStatus(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-pink-600 hover:to-pink-700 transition-all duration-150"
              type="button"
              onClick={handleAddStatus}
            >Add</button>
          </div>
        </div>
        {/* Complexity - Orange */}
        <div className="settings-section">
          <div className="text-lg font-semibold text-orange-800 mb-3">Complexity (T-Shirt Sizes)</div>
          <div className="text-sm text-orange-600 mb-4">Relative effort or size: XS (tiny), S, M, L, XL, XXL (huge).</div>
          {complexityLoading && <div className="text-orange-500 mb-2">Loading...</div>}
          <ul className="mb-3 divide-y divide-orange-100 bg-orange-50 rounded-lg border border-orange-100">
            {complexityItems.map((item: { key: string; desc: string }, idx: number) => (
              <li key={item.key} className="flex items-center px-3 py-2 group hover:bg-orange-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    {editComplexityIdx === idx ? (
                      <>
                        <input
                          className="border border-orange-300 px-2 py-1 rounded text-sm font-semibold"
                          value={editComplexityKey}
                          onChange={e => setEditComplexityKey(e.target.value)}
                        />
                        <button
                          className="ml-2 bg-orange-500 hover:bg-orange-700 text-white px-2 py-1 rounded font-semibold"
                          type="button"
                          onClick={() => handleUpdateComplexity(idx)}
                        >Save</button>
                        <button
                          className="ml-1 text-gray-400 hover:text-gray-700 px-2 rounded"
                          type="button"
                          onClick={() => setEditComplexityIdx(null)}
                        >Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="text-orange-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                        <button
                          className="ml-2 text-orange-400 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-full px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          type="button"
                          onClick={() => {
                            setEditComplexityIdx(idx);
                            setEditComplexityKey(item.key);
                            setEditComplexityDesc(item.desc);
                          }}
                          title="Edit"
                          aria-label={`Edit ${item.key}`}
                        >✎</button>
                        <button
                          className="ml-2 text-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          onClick={() => handleDeleteComplexity(idx)}
                          title="Remove"
                          type="button"
                          aria-label={`Remove ${item.key}`}
                        >×</button>
                      </>
                    )}
                  </div>
                  {editComplexityIdx === idx ? (
                    <input
                      className="border border-orange-200 px-2 py-1 rounded text-xs mt-1 w-full"
                      value={editComplexityDesc}
                      onChange={e => setEditComplexityDesc(e.target.value)}
                      placeholder="Description..."
                    />
                  ) : (
                    item.desc && (
                      <div className="text-orange-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 items-center mb-1">
            <input
              className="border border-orange-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50 placeholder-orange-300"
              value={inputComplexity}
              placeholder="Add key..."
              onChange={e => setInputComplexity(e.target.value)}
            />
            <input
              className="border border-orange-200 px-3 py-1 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-orange-50 placeholder-orange-200"
              value={descComplexity}
              placeholder="Description..."
              onChange={e => setDescComplexity(e.target.value)}
            />
            <button
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow hover:from-orange-600 hover:to-orange-700 transition-all duration-150"
              type="button"
              onClick={handleAddComplexity}
            >Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC = () => (
  <PrefixProvider>
    <LayerProvider>
      <ComponentProvider>
        <FeatureProvider>
          <PriorityProvider>
            <StatusProvider>
              <ComplexityProvider>
                <SettingsViewInner />
              </ComplexityProvider>
            </StatusProvider>
          </PriorityProvider>
        </FeatureProvider>
      </ComponentProvider>
    </LayerProvider>
  </PrefixProvider>
);

export default SettingsView;