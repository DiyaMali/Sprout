"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, LoggedActivity, SavedWeeklyCard } from './types';

const STORAGE_KEY = 'sprout_app_state';

const defaultState: AppState = {
  activities: [],
  settings: {},
};

interface AppContextType {
  state: AppState;
  logActivity: (activity: Omit<LoggedActivity, 'id' | 'timestamp'>) => void;
  removeActivity: (id: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  clearData: () => void;
  loginUser: (user: { name: string; email: string; avatar: string }) => void;
  logoutUser: () => void;
  saveWeeklyCard: (card: Omit<SavedWeeklyCard, 'id' | 'timestamp'>) => void;
  deleteSavedCard: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isMounted, setIsMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setState(parsed);
        }, 0);
      }
    } catch (e) {
      console.error('Failed to load state from local storage', e);
    }
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
  }, []);

  // Save to local storage whenever state changes (if mounted)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isMounted]);

  const logActivity = (activityData: Omit<LoggedActivity, 'id' | 'timestamp'>) => {
    const newActivity: LoggedActivity = {
      ...activityData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    setState(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities], // prepend new activity
    }));
  };

  const removeActivity = (id: string) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id),
    }));
  };

  const loginUser = (user: { name: string; email: string; avatar: string }) => {
    setState(prev => ({
      ...prev,
      user,
    }));
  };

  const logoutUser = () => {
    setState(prev => ({
      ...prev,
      user: null,
    }));
  };

  const saveWeeklyCard = (cardData: Omit<SavedWeeklyCard, 'id' | 'timestamp'>) => {
    const newCard: SavedWeeklyCard = {
      ...cardData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setState(prev => ({
      ...prev,
      savedCards: [newCard, ...(prev.savedCards || [])],
    }));
  };

  const deleteSavedCard = (id: string) => {
    setState(prev => ({
      ...prev,
      savedCards: (prev.savedCards || []).filter(c => c.id !== id),
    }));
  };

  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  };

  const clearData = () => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!isMounted) {
    // Avoid hydration mismatch by rendering nothing or a loader until client state is loaded
    return null; 
  }

  return (
    <AppContext.Provider value={{ state, logActivity, removeActivity, updateSettings, clearData, loginUser, logoutUser, saveWeeklyCard, deleteSavedCard }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
