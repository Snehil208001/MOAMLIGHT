'use client';

import React, { createContext, useContext } from 'react';

interface DayNightContextType {
  isNightMode: boolean;
  scrollProgress: number;
}

const DayNightContext = createContext<DayNightContextType>({
  isNightMode: false,
  scrollProgress: 0,
});

export const useDayNight = () => useContext(DayNightContext);

interface DayNightScrollControllerProps {
  children: React.ReactNode;
}

/**
 * Unified Warm Cream Light Mode Controller
 *
 * Provides a clean, consistent luxury artisanal aesthetic across the entire storefront
 * with zero jarring scroll color shifts.
 */
export const DayNightScrollController: React.FC<DayNightScrollControllerProps> = ({ children }) => {
  return (
    <DayNightContext.Provider value={{ isNightMode: false, scrollProgress: 0 }}>
      <div
        className="daynight-smooth-container relative min-h-screen bg-warm-linen text-charcoal"
        style={{
          backgroundColor: '#FAF7F2',
          color: '#1A1A1A',
        }}
      >
        {children}
      </div>
    </DayNightContext.Provider>
  );
};
