import React from 'react';
import { PrimeReactProvider as PrimeProvider } from 'primereact/api';

interface PrimeReactProviderProps {
  children: React.ReactNode;
}

export const PrimeReactProvider: React.FC<PrimeReactProviderProps> = ({ children }) => {
  // PrimeReact configuration values
  const value = {
    ripple: true, // Enable ripple effect
    inputStyle: 'outlined' as const, // Use outlined style for inputs
    locale: 'en', // Set locale to English
    cssTransition: true, // Enable CSS transitions
    autoZIndex: true, // Automatically manage z-index for overlays
    hideOverlaysOnDocumentScrolling: false, // Keep overlays visible when scrolling
    nullSortOrder: 1, // How to handle null values in sorting
    zIndex: {
      modal: 1100, // Modal z-index
      overlay: 1000, // Overlay z-index
      menu: 1000, // Menu z-index
      tooltip: 1100, // Tooltip z-index
      toast: 1200, // Toast z-index
    },
    pt: {
      // Pass-through attributes for customization
      // Can be used to apply Tailwind classes to PrimeReact components
    },
    ptOptions: {
      mergeSections: true,
      mergeProps: false,
    },
  };

  return <PrimeProvider value={value}>{children}</PrimeProvider>;
};
