// =============================================================================
// UtsavOps AI — Global Event Plan Context
// Eliminates multi-layer prop drilling across tabs and headers.
// =============================================================================

import React, { createContext, useContext, type ReactNode } from 'react';
import type { EventProfile } from '../types/event';

export interface EventPlanContextType {
  profile: EventProfile;
  setProfile: React.Dispatch<React.SetStateAction<EventProfile>>;
  hasApiKey: boolean;
  onOpenApiModal: () => void;
  isGenerating: boolean;
}

const EventPlanContext = createContext<EventPlanContextType | undefined>(undefined);

interface EventPlanProviderProps {
  children: ReactNode;
  value: EventPlanContextType;
}

export const EventPlanProvider: React.FC<EventPlanProviderProps> = ({ children, value }) => {
  return <EventPlanContext.Provider value={value}>{children}</EventPlanContext.Provider>;
};

/**
 * Custom hook to consume the EventPlanContext with built-in null checking.
 *
 * @throws Error if used outside an EventPlanProvider.
 */
export function useEventPlan(): EventPlanContextType {
  const context = useContext(EventPlanContext);
  if (!context) {
    throw new Error('useEventPlan must be used within an EventPlanProvider');
  }
  return context;
}
