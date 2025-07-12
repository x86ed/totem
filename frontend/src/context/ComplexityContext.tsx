import React, { createContext, useState, useEffect } from 'react';

export type ComplexityItem = {
  key: string;
  description: string;
};

export type ComplexityContextType = {
  complexities: ComplexityItem[];
  loading: boolean;
  addComplexity: (item: ComplexityItem) => Promise<void>;
  updateComplexity: (key: string, item: ComplexityItem) => Promise<void>;
  deleteComplexity: (key: string) => Promise<void>;
  refreshComplexities: () => Promise<void>;
};

const ComplexityContext = createContext<ComplexityContextType | undefined>(undefined);

const ComplexityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complexities, setComplexities] = useState<ComplexityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshComplexities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/complexity');
      if (!res.ok) throw new Error('Failed to fetch complexities');
      const data = await res.json();
      setComplexities(data);
    } catch (err) {
      console.error('Error fetching complexities:', err);
      setComplexities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshComplexities();
  }, []);

  const addComplexity = async (item: ComplexityItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add complexity');
      await refreshComplexities();
    } catch (err) {
      console.error('Error adding complexity:', err);
      setLoading(false);
    }
  };

  const updateComplexity = async (key: string, item: ComplexityItem) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/complexity/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to update complexity');
      await refreshComplexities();
    } catch (err) {
      console.error('Error updating complexity:', err);
      setLoading(false);
    }
  };

  const deleteComplexity = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/complexity/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete complexity');
      await refreshComplexities();
    } catch (err) {
      console.error('Error deleting complexity:', err);
      setLoading(false);
    }
  };

  return (
    <ComplexityContext.Provider value={{ complexities, loading, addComplexity, updateComplexity, deleteComplexity, refreshComplexities }}>
      {children}
    </ComplexityContext.Provider>
  );
};

export { ComplexityContext, ComplexityProvider };
