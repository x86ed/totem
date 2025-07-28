import React, { createContext, useState, useEffect } from 'react';

export type StatusItem = {
  key: string;
  description: string;
};

export type StatusContextType = {
  statuses: StatusItem[];
  loading: boolean;
  addStatus: (item: StatusItem) => Promise<void>;
  updateStatus: (key: string, item: StatusItem) => Promise<void>;
  deleteStatus: (key: string) => Promise<void>;
  refreshStatuses: () => Promise<void>;
};

const StatusContext = createContext<StatusContextType | undefined>(undefined);

const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatuses = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/status');
      if (!res.ok) throw new Error('Failed to fetch statuses');
      const data = await res.json();
      setStatuses(data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatuses();
  }, []);

  const addStatus = async (item: StatusItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add status');
      await refreshStatuses();
    } catch (err) {
      console.error('Error adding status:', err);
      setLoading(false);
    }
  };

  const updateStatus = async (key: string, item: StatusItem) => {
    setLoading(true);
    try {
      // If the key is being changed, send newKey in the body
      const body = item.key !== key
        ? { ...item, newKey: item.key }
        : item;
      const res = await fetch(`http://localhost:8080/api/status/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to update status');
      await refreshStatuses();
    } catch (err) {
      console.error('Error updating status:', err);
      setLoading(false);
    }
  };

  const deleteStatus = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/status/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete status');
      await refreshStatuses();
    } catch (err) {
      console.error('Error deleting status:', err);
      setLoading(false);
    }
  };

  return (
    <StatusContext.Provider value={{ statuses, loading, addStatus, updateStatus, deleteStatus, refreshStatuses }}>
      {children}
    </StatusContext.Provider>
  );
};

export { StatusContext, StatusProvider };
