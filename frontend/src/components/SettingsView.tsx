import React, { useState, useContext } from 'react';
import { ComponentContext, ComponentProvider } from '../context/ComponentContext';
import { LayerContext, LayerProvider } from '../context/LayerContext';
import { FeatureContext, FeatureProvider } from '../context/FeatureContext';
import FeatureTypesSection from './FeatureTypesSection';

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
    <div className="settings-section">
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
      await layerCtx.updateLayer(oldKey, { key: editKey, description: editDesc });
      setEditIdx(null);
    }
  };
  const handleDelete = async (idx: number) => {
    if (!layerCtx) return;
    const key = items[idx]?.key;
    if (key) await layerCtx.deleteLayer(key);
  };
  return (
    <div className="settings-section">
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
    </div>
  );
};
import { PrefixProvider } from '../context/PrefixContext';
import usePrefix from '../context/usePrefix';
import './SettingsView.css';

const DEFAULTS = {
  prefix: 'PROJ',
  complexity: [
    { key: 'XS', desc: 'Extra Small (trivial, <1h)' },
    { key: 'S', desc: 'Small (1-2h)' },
    { key: 'M', desc: 'Medium (half day)' },
    { key: 'L', desc: 'Large (1-2 days)' },
    { key: 'XL', desc: 'Extra Large (multi-day)' },
    { key: 'XXL', desc: 'Epic (week+)' }
  ],
  feature: [
    { key: 'auth', desc: 'Authentication & authorization' },
    { key: 'user', desc: 'User management, profiles' },
    { key: 'payment', desc: 'Payments, billing, transactions' },
    { key: 'notification', desc: 'Email, SMS, push notifications' },
    { key: 'analytics', desc: 'Tracking, reporting, metrics' },
    { key: 'search', desc: 'Search, filtering, indexing' },
    { key: 'admin', desc: 'Admin panels, management tools' },
    { key: 'api', desc: 'REST APIs, endpoints' },
    { key: 'database', desc: 'Data models, migrations' },
    { key: 'security', desc: 'Security, encryption, monitoring' },
    { key: 'ui', desc: 'UI components, design system' },
    { key: 'workflow', desc: 'Business process, automation' }
  ],
  layer: [
    { key: 'Frontend', desc: 'User interface, web apps' },
    { key: 'Backend', desc: 'Server logic, APIs, DB' },
    { key: 'GraphQL', desc: 'GraphQL schema, resolvers' },
    { key: 'Mobile', desc: 'iOS/Android, React Native' },
    { key: 'Tests', desc: 'Unit, integration, E2E' },
    { key: 'Docs', desc: 'Documentation, guides' }
  ],
  // component list is now managed by ComponentContext
  priority: [
    { key: 'Low', desc: 'Not urgent, nice to have' },
    { key: 'Medium', desc: 'Normal priority' },
    { key: 'High', desc: 'Important, time sensitive' },
    { key: 'Critical', desc: 'Urgent, blocks progress' }
  ],
  status: [
    { key: 'Open', desc: 'Not started' },
    { key: 'In Progress', desc: 'Work in progress' },
    { key: 'Blocked', desc: 'Blocked by something' },
    { key: 'Review', desc: 'Ready for review' },
    { key: 'Done', desc: 'Completed' },
    { key: 'Closed', desc: 'Closed, won\'t do' }
  ]
};

type ListItem = { key: string; desc: string };
type EditableListProps = {
  label: string;
  description?: string;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder?: string;
};

const EditableList: React.FC<EditableListProps> = ({ label, description, items, onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const [desc, setDesc] = useState('');
  return (
    <div className="h-full">
      <div className="text-lg font-semibold text-green-800 mb-3">{label}</div>
      {description && <div className="text-sm text-green-600 mb-4">{description}</div>}
      <ul className="mb-3 divide-y divide-green-100 bg-green-50 rounded-lg border border-green-100">
        {items.map((item, idx) => (
          <li
            key={item.key}
            className="flex items-center px-3 py-2 group hover:bg-green-100 transition-colors duration-100 first:rounded-t-lg last:rounded-b-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-green-900 text-sm font-semibold truncate" title={item.key}>{item.key}</span>
                <button
                  className="ml-2 text-red-400 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  title="Remove"
                  type="button"
                  aria-label={`Remove ${item.key}`}
                >
                  ×
                </button>
              </div>
              {item.desc && (
                <div className="text-green-700 text-xs mt-1 pl-1 break-words italic" style={{ wordBreak: 'break-word' }}>{item.desc}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center mb-1">
        <input
          className="border border-green-300 px-3 py-1 rounded-lg text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-400 bg-green-50 placeholder-green-300"
          value={input}
          placeholder={placeholder || `Add key...`}
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
          onClick={() => {
            if (input.trim() && !items.some(i => i.key === input.trim())) {
              onChange([...items, { key: input.trim(), desc: desc.trim() }]);
              setInput('');
              setDesc('');
            }
          }}
        >Add        </button>
      </div>
    </div>
  );
};

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
  const [complexity, setComplexity] = useState(DEFAULTS.complexity);
  // Layer state is now managed by LayerContext
  // Component state is now managed by ComponentContext
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [status, setStatus] = useState(DEFAULTS.status);

  return (
    <div className="settings-view max-w-6xl mx-auto p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border border-green-100">
      <h3 className="text-2xl font-bold mb-8 text-green-900 tracking-wide flex items-center gap-2">
        <span className="inline-block bg-green-200 text-green-700 rounded-full px-3 py-1 text-lg mr-2">⚙️</span>
        Project Settings
      </h3>
      <div style={{background: 'red',padding: '1rem 1rem 1rem 1rem', borderRadius: '1rem'}}>
        <section className="settings-section mb-10">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border border-cyan-200 shadow-sm rounded-2xl p-6">
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
          <div className="settings-section">
            <FeatureTypesSection />
          </div>
          {/* Layer Types - Green */}
          <div className="settings-section">
            <LayerTypesSection />
          </div>
          {/* Component Types - Yellow */}
          <div className="settings-section">
            <ComponentTypesSection />
          </div>
        </div>
      </div> {/* <-- Properly close the red background div here */}
      <div className="settings-grid-2x3">
        {/* Priority Levels - Purple */}
        <div className="settings-section">
          <EditableList
            label="Priority Levels"
            description="Relative urgency or importance: Low, Medium, High, Critical."
            items={priority}
            onChange={setPriority}
            placeholder="e.g. High"
          />
        </div>
        {/* Ticket Statuses - Pink */}
        <div className="settings-section">
          <EditableList
            label="Ticket Statuses"
            description="Workflow state: Open, In Progress, Blocked, Review, Done, Closed."
            items={status}
            onChange={setStatus}
            placeholder="e.g. In Progress"
          />
        </div>
        {/* Complexity - Orange */}
        <div className="settings-section">
          <EditableList
            label="Complexity (T-Shirt Sizes)"
            description="Relative effort or size: XS (tiny), S, M, L, XL, XXL (huge)."
            items={complexity}
            onChange={setComplexity}
            placeholder="e.g. XS"
          />
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
          <SettingsViewInner />
        </FeatureProvider>
      </ComponentProvider>
    </LayerProvider>
  </PrefixProvider>
);

export default SettingsView;