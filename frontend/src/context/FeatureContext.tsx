import React, { createContext, useState, useEffect } from 'react';

export type FeatureItem = {
  key: string;
  description: string;
};

export type FeatureContextType = {
  features: FeatureItem[];
  loading: boolean;
  addFeature: (item: FeatureItem) => Promise<void>;
  updateFeature: (key: string, item: FeatureItem) => Promise<void>;
  deleteFeature: (key: string) => Promise<void>;
  refreshFeatures: () => Promise<void>;
};

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/feature');
      if (!res.ok) throw new Error('Failed to fetch features');
      const data = await res.json();
      setFeatures(data);
    } catch (err) {
      console.error('Error fetching features:', err);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeatures();
  }, []);

  const addFeature = async (item: FeatureItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add feature');
      await refreshFeatures();
    } catch (err) {
      console.error('Error adding feature:', err);
      setLoading(false);
    }
  };

  const updateFeature = async (key: string, item: FeatureItem) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/feature/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to update feature');
      await refreshFeatures();
    } catch (err) {
      console.error('Error updating feature:', err);
      setLoading(false);
    }
  };

  const deleteFeature = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/feature/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete feature');
      await refreshFeatures();
    } catch (err) {
      console.error('Error deleting feature:', err);
      setLoading(false);
    }
  };

  return (
    <FeatureContext.Provider value={{ features, loading, addFeature, updateFeature, deleteFeature, refreshFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
};

export { FeatureContext, FeatureProvider };
