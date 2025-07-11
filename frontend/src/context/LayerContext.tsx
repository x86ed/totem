import React, { createContext, useState, useEffect } from 'react';

export type LayerItem = {
  key: string;
  description: string;
};

export type LayerContextType = {
  layers: LayerItem[];
  loading: boolean;
  addLayer: (item: LayerItem) => Promise<void>;
  updateLayer: (key: string, item: LayerItem) => Promise<void>;
  deleteLayer: (key: string) => Promise<void>;
  refreshLayers: () => Promise<void>;
};

const LayerContext = createContext<LayerContextType | undefined>(undefined);

const LayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLayers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/layer');
      if (!res.ok) throw new Error('Failed to fetch layers');
      const data = await res.json();
      setLayers(data);
    } catch (err) {
      console.error('Error fetching layers:', err);
      setLayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLayers();
  }, []);

  const addLayer = async (item: LayerItem) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add layer');
      await refreshLayers();
    } catch (err) {
      console.error('Error adding layer:', err);
      setLoading(false);
    }
  };

  const updateLayer = async (key: string, item: LayerItem) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/layer/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to update layer');
      await refreshLayers();
    } catch (err) {
      console.error('Error updating layer:', err);
      setLoading(false);
    }
  };

  const deleteLayer = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/layer/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete layer');
      await refreshLayers();
    } catch (err) {
      console.error('Error deleting layer:', err);
      setLoading(false);
    }
  };

  return (
    <LayerContext.Provider value={{ layers, loading, addLayer, updateLayer, deleteLayer, refreshLayers }}>
      {children}
    </LayerContext.Provider>
  );
};

export { LayerContext, LayerProvider };
