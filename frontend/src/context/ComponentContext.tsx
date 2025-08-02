import React, { createContext, useState, useEffect } from 'react';

export type ComponentItem = {
  key: string;
  description: string;
};

export type ComponentContextType = {
  components: ComponentItem[];
  loading: boolean;
  addComponent: (item: ComponentItem) => Promise<void>;
  updateComponent: (key: string, item: ComponentItem) => Promise<void>;
  deleteComponent: (key: string) => Promise<void>;
  refreshComponents: () => Promise<void>;
};

const ComponentContext = createContext<ComponentContextType | undefined>(undefined);



const ComponentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshComponents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/component');
      if (!res.ok) throw new Error('Failed to fetch components');
      const data = await res.json();
      setComponents(data);
    } catch (err) {
      console.error('Error fetching components:', err);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComponents();
  }, []);

  const addComponent = async (item: ComponentItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add component');
      await refreshComponents();
    } catch (err) {
      console.error('Error adding component:', err);
      setLoading(false);
    }
  };

  const updateComponent = async (key: string, item: ComponentItem & { newKey?: string }) => {
    setLoading(true);
    try {
      // If the key is being changed, send newKey
      const body = item.key !== key ? { ...item, newKey: item.key } : item;
      const res = await fetch(`http://localhost:8080/api/component/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to update component');
      await refreshComponents();
    } catch (err) {
      console.error('Error updating component:', err);
      setLoading(false);
    }
  };

  const deleteComponent = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/component/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete component');
      await refreshComponents();
    } catch (err) {
      console.error('Error deleting component:', err);
      setLoading(false);
    }
  };

  return (
    <ComponentContext.Provider value={{ components, loading, addComponent, updateComponent, deleteComponent, refreshComponents }}>
      {children}
    </ComponentContext.Provider>
  );
};

export { ComponentContext, ComponentProvider };
