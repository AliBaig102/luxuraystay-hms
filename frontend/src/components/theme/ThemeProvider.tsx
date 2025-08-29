/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { setTheme, type ThemeMode } from '@/store/slices/uiSlice';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <>{children}</>;
}

// Custom hook to use theme
export function useTheme() {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dispatch = useDispatch();

  const setThemeMode = (newTheme: ThemeMode) => {
    dispatch(setTheme(newTheme));
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setThemeMode('dark');
    } else if (theme === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  return {
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    currentTheme: getCurrentTheme(),
  };
}