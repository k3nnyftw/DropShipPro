import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeOptions } from '@/components/store/theme-editor';

// Default theme values
const defaultTheme: ThemeOptions = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f43f5e',
    background: '#ffffff',
    text: '#374151',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseSize: 16,
  },
  layout: {
    contentWidth: 1200,
    spacing: 16,
    borderRadius: 8,
  },
  header: {
    style: 'modern',
    showSearch: true,
  },
  footer: {
    columns: 3,
    showSocial: true,
  },
};

// Context type definition
type ThemeContextType = {
  theme: ThemeOptions;
  updateTheme: (newTheme: ThemeOptions) => void;
  resetTheme: () => void;
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  resetTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Provider component
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeOptions>(defaultTheme);

  const updateTheme = (newTheme: ThemeOptions) => {
    console.log('Theme updated:', newTheme);
    setTheme(newTheme);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;