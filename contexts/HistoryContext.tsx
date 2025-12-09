import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TTSItem } from '../types';

interface HistoryContextType {
  history: TTSItem[];
  addToHistory: (item: Omit<TTSItem, 'id' | 'date'>) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<TTSItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('speakify_tts_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('speakify_tts_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: Omit<TTSItem, 'id' | 'date'>) => {
    const newItem: TTSItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, deleteFromHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};