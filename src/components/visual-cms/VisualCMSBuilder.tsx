import React, { useRef } from 'react';
import { CMSProvider, useCMS } from './CMSContext';
import { iPhone18Frame } from './iPhone18Frame';
import { BuilderTopToolbar } from './BuilderTopToolbar';
import { FloatingTextToolbar } from './FloatingTextToolbar';
import { EditableGuidePage } from './EditableGuidePage';

/**
 * Visual CMS Builder - entry point.
 * Compose: Top Toolbar > iPhone 18 canvas (con pagina guida editabile)
 * > FloatingTextToolbar in overlay sullo schermo del telefono.
 */
export const VisualCMSBuilder: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <CMSProvider>
      <BuilderShell className={className} />
    </CMSProvider>
  );
};

const BuilderShell: React.FC<{ className: string }> = ({ className }) => {
  const { state, selectBlock } = useCMS();
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className}`}>
      <BuilderTopToolbar className="w-full max-w-2xl" />

      <div className="relative">
        <iPhone18Frame scale={0.72}>
          <div
            ref={screenRef}
            className="relative w-full h-full bg-[#0b0f14] text-white overflow-y-auto overflow-x-hidden select-none"
            onClick={() => state.isEditMode && selectBlock(null)}
          >
            <EditableGuidePage />
          </div>
        </iPhone18Frame>

        {/* Toolbar fluttuante in overlay: posizionata relativamente allo schermo */}
        <div className="absolute pointer-events-none" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="pointer-events-auto">
            <FloatingTextToolbar containerRef={screenRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
