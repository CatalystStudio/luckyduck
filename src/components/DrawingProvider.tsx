'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Tenant, Drawing } from '@/lib/types';

interface DrawingContextValue {
  tenant: Tenant;
  drawing: Drawing;
}

const DrawingContext = createContext<DrawingContextValue | null>(null);

export function DrawingProvider({
  tenant,
  drawing,
  children,
}: {
  tenant: Tenant;
  drawing: Drawing;
  children: ReactNode;
}) {
  const primaryColor = tenant.primary_color || '#005596';
  const secondaryColor = tenant.secondary_color || '#E47225';

  return (
    <DrawingContext.Provider value={{ tenant, drawing }}>
      <style>{`
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
        }
      `}</style>
      {children}
    </DrawingContext.Provider>
  );
}

export function useTenant(): Tenant {
  const ctx = useContext(DrawingContext);
  if (!ctx) throw new Error('useTenant must be used within DrawingProvider');
  return ctx.tenant;
}

export function useDrawing(): Drawing {
  const ctx = useContext(DrawingContext);
  if (!ctx) throw new Error('useDrawing must be used within DrawingProvider');
  return ctx.drawing;
}
