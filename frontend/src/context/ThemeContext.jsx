import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themePresets = {
  sapphire: {
    id: 'sapphire',
    name: 'Royal Sapphire',
    primaryColor: '#2563eb',
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    accentBg: '#eff6ff',
    accentText: '#1d4ed8',
    cardBorder: '#dbeafe',
    badgeBg: 'bg-blue-600',
    previewHex: '#2563eb'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Growth',
    primaryColor: '#059669',
    headerBg: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    buttonGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    accentBg: '#ecfdf5',
    accentText: '#047857',
    cardBorder: '#a7f3d0',
    badgeBg: 'bg-emerald-600',
    previewHex: '#10b981'
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    primaryColor: '#ea580c',
    headerBg: 'linear-gradient(135deg, #451a03 0%, #9a3412 50%, #ea580c 100%)',
    buttonGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    accentBg: '#fff7ed',
    accentText: '#c2410c',
    cardBorder: '#fed7aa',
    badgeBg: 'bg-amber-600',
    previewHex: '#ea580c'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    primaryColor: '#0891b2',
    headerBg: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
    buttonGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    accentBg: '#ecfeff',
    accentText: '#0e7490',
    cardBorder: '#cff4fc',
    badgeBg: 'bg-cyan-600',
    previewHex: '#0891b2'
  },
  iris: {
    id: 'iris',
    name: 'Velvet Iris',
    primaryColor: '#7c3aed',
    headerBg: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7c3aed 100%)',
    buttonGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    accentBg: '#f5f3ff',
    accentText: '#6d28d9',
    cardBorder: '#ddd6fe',
    badgeBg: 'bg-purple-600',
    previewHex: '#7c3aed'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('userTheme') || 'sapphire');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('userDarkMode') === 'true');

  const changeTheme = (newTheme) => {
    if (themePresets[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('userTheme', newTheme);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('userDarkMode', next);
      return next;
    });
  };

  useEffect(() => {
    const activePreset = themePresets[theme] || themePresets.sapphire;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', activePreset.primaryColor);
    root.style.setProperty('--header-bg', activePreset.headerBg);
    root.style.setProperty('--button-gradient', activePreset.buttonGradient);
    root.style.setProperty('--accent-bg', activePreset.accentBg);
    root.style.setProperty('--accent-text', activePreset.accentText);
    root.style.setProperty('--card-border', activePreset.cardBorder);

    root.classList.toggle('dark', isDarkMode);
  }, [theme, isDarkMode]);

  const activePreset = themePresets[theme] || themePresets.sapphire;

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isDarkMode, toggleDarkMode, activePreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
