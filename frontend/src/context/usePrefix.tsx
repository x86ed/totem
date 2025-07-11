import { useContext } from 'react';
import { PrefixContext } from './PrefixContext';

const usePrefix = () => {
  const ctx = useContext(PrefixContext);
  if (!ctx) throw new Error('usePrefix must be used within a PrefixProvider');
  return ctx;
};

export default usePrefix;
