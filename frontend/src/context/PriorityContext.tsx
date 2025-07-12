import React, { createContext, useState, useEffect } from 'react';

export type PriorityItem = {
  key: string;
  description: string;
};

export type PriorityContextType = {
  priorities: PriorityItem[];
  loading: boolean;
  addPriority: (item: PriorityItem) => Promise<void>;
  updatePriority: (key: string, item: PriorityItem) => Promise<void>;
  deletePriority: (key: string) => Promise<void>;
  refreshPriorities: () => Promise<void>;
};

const PriorityContext = createContext<PriorityContextType | undefined>(undefined);

const PriorityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPriorities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/priority');
      if (!res.ok) throw new Error('Failed to fetch priorities');
      const data = await res.json();
      setPriorities(data);
    } catch (err) {
      console.error('Error fetching priorities:', err);
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPriorities();
  }, []);

  const addPriority = async (item: PriorityItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/priority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add priority');
      await refreshPriorities();
    } catch (err) {
      console.error('Error adding priority:', err);
      setLoading(false);
    }
  };

  const updatePriority = async (key: string, item: PriorityItem) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/priority/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to update priority');
      await refreshPriorities();
    } catch (err) {
      console.error('Error updating priority:', err);
      setLoading(false);
    }
  };

  const deletePriority = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/priority/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete priority');
      await refreshPriorities();
    } catch (err) {
      console.error('Error deleting priority:', err);
      setLoading(false);
    }
  };

  return (
    <PriorityContext.Provider value={{ priorities, loading, addPriority, updatePriority, deletePriority, refreshPriorities }}>
      {children}
    </PriorityContext.Provider>
  );
};

export { PriorityContext, PriorityProvider };
