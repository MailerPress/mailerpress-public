import React, {createContext, useContext, useEffect, useState} from 'react';
import {ApiService} from "../core/apiService.ts";

// Créez le contexte du thème
const ThemeContext = createContext();

// Créez un hook personnalisé pour accéder au contexte
export const useTheme = () => useContext(ThemeContext);

// Créez un fournisseur de thème
export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState(window.jsVars.activeTheme);

    const toggleTheme = theme => {
        setTheme(theme);
    };

    useEffect(() => {
        ApiService.saveTheme(theme)
    }, [theme]);

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};
