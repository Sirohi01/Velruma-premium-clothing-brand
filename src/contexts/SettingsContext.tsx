'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SettingItem = {
  key: string;
  value: unknown;
};

type SettingsContextType = {
  settings: Record<string, unknown>;
  getSetting: (key: string, fallback?: string) => string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function toMap(items: SettingItem[]) {
  return items.reduce<Record<string, unknown>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

export function WebsiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings?public=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setSettings(toMap(data.data));
    } catch {
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo<SettingsContextType>(() => ({
    settings,
    loading,
    refreshSettings,
    getSetting: (key: string, fallback = '') => {
      const value = settings[key];
      if (value === undefined || value === null || value === '') return fallback;
      return String(value);
    },
  }), [settings, loading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useWebsiteSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useWebsiteSettings must be used inside WebsiteSettingsProvider');
  }
  return context;
}
