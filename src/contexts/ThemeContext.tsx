import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "light",
  storageKey = "clinicpro-theme",
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
        return storedTheme;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove("light", "dark");
    
    // Add current theme class
    root.classList.add(theme);
    
    // Store theme in localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};

