// theme-context.tsx
'use client';

import React from 'react';

export const ThemeContext = React.createContext({
    darkMode: false,
    setDarkMode: (v: boolean) => { },
});