import React from 'react';

interface iPhone18FrameProps {
  children: React.ReactNode;
  className?: string;
  /** Scala del frame (1 = dimensioni reali 390x844). */
  scale?: number;
}

/**
 * Frame iPhone 18 con proporzioni autentiche, Dynamic Island e safe areas.
 * Lo schermo interno è un viewport 390x844 (logico) scalabile.
 */
export const iPhone18Frame: React.FC<iPhone18FrameProps> = ({ children, className = '', scale = 1 }) => {
  const W = 390;
  const H = 844;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: W * scale, height: H * scale }}
      role="img"
      aria-label="iPhone 18 frame"
    >
      <div
        className="absolute top-0 left-0"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Corpo del telefono: titanio + bordi arrotondati */}
        <div className="absolute -inset-[14px] rounded-[68px] bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]" />
        <div className="absolute -inset-[4px] rounded-[58px] bg-black" />

        {/* Pulsanti laterali */}
        <div className="absolute -left-[17px] top-[120px] w-[4px] h-[32px] rounded-l-md bg-zinc-600" />
        <div className="absolute -left-[17px] top-[170px] w-[4px] h-[62px] rounded-l-md bg-zinc-600" />
        <div className="absolute -left-[17px] top-[250px] w-[4px] h-[62px] rounded-l-md bg-zinc-600" />
        <div className="absolute -right-[17px] top-[190px] w-[4px] h-[96px] rounded-r-md bg-zinc-600" />

        {/* Schermo */}
        <div className="absolute inset-0 rounded-[54px] overflow-hidden bg-black">
          {/* Dynamic Island */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[126px] h-[36px] bg-black rounded-full z-40 pointer-events-none border border-white/5" />

          {/* Area sicura: contenuto sotto la Dynamic Island, sopra l'home indicator */}
          <div
            className="absolute overflow-hidden"
            style={{ top: 60, left: 0, right: 0, bottom: 34 }}
          >
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/90 rounded-full z-40 pointer-events-none" />
        </div>

        {/* Riflesso vetro */}
        <div className="absolute inset-0 rounded-[54px] pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.09]" />
      </div>
    </div>
  );
};
