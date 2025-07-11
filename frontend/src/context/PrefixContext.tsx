import React, { createContext, useState, useEffect } from 'react';

export type PrefixContextType = {
  prefix: string;
  setPrefix: (prefix: string) => void;
  loading: boolean;
};

const PrefixContext = createContext<PrefixContextType | undefined>(undefined);

// usePrefix hook moved to usePrefix.tsx

const PrefixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefix, setPrefixState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/prefix')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch prefix');
        return res.json();
      })
      .then(data => {
        setPrefixState(data.prefix || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching prefix:', err);
        setPrefixState('');
        setLoading(false);
      });
  }, []);

  const setPrefix = (newPrefix: string) => {
    setLoading(true);
    fetch('http://localhost:8080/api/prefix', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: newPrefix })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update prefix');
        return res.json();
      })
      .then(data => {
        setPrefixState(data.prefix || newPrefix);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error updating prefix:', err);
        setLoading(false);
      });
  };

  return (
    <PrefixContext.Provider value={{ prefix, setPrefix, loading }}>
      {children}
    </PrefixContext.Provider>
  );
};

export { PrefixContext, PrefixProvider };
