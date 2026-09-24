import React from 'react';
import { iPhone18Frame } from './iPhone18Frame';

interface iPhone18LiveCanvasProps {
  className?: string;
}

export const iPhone18LiveCanvas = ({ className = '' }: iPhone18LiveCanvasProps) => {
  return (
    <div className={`min-h-[80vh] px-4 ${className}`}>
      <div className="flex-1 mt-4 relative">
        <iPhone18Frame>
          {/* Static content placeholder - in a real app, this would be your actual content */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-center p-4">
            <div>
              <h2 className="text-2xl font-bold mb-4">Aurora in Valtellina</h2>
              <p className="mb-2">Benvenuti nel nostro splendido appartamento</p>
              <p className="mb-4">Situato nel cuore della Valtellina, vicino alle piste da sci e ai sentieri escursionistici</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>WiFi gratuito disponibile</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Parcheggio privato incluso</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span>Check-in autonomo 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </iPhone18Frame>
      </div>

      {/* Status indicator */}
      <div className="px-4 py-2 text-xs flex items-center justify-between text-white/50">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Modalità visualizzazione</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Connesso</span>
        </span>
      </div>
    </div>
  );
};