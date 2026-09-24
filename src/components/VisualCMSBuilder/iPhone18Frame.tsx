import React from 'react';

interface iPhone18FrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * iPhone 18 Frame component with authentic dimensions and Dynamic Island
 * Provides a realistic device frame for the PWA editor canvas
 */
export const iPhone18Frame = ({
  children,
  className = ''
}: iPhone18FrameProps) => {
  return (
    <div
      className={`relative w-[390px] h-[844px] mx-auto my-4 ${className}`}
      role="img"
      aria-label="iPhone 18 frame"
    >
      {/* iPhone 18 Frame - authentic dimensions based on Apple design language */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Frame background with cutouts for camera, sensors, etc. */}
        <div className="absolute inset-0 bg-[url('/images/iphone18-frame.png')] background-contain" />

        {/* Dynamic Island / pill-shaped cutout at top */}
        <div className="absolute inset-x-0 top-[26px] flex items-center justify-center pointer-events-none z-30">
          <div className="w-[128px] h-[5.5px] bg-black rounded-full" />
        </div>
      </div>

      {/* Actual screen area - matches iPhone 18 display dimensions */}
      <div
        className="absolute inset-[44px] _[44px] _[26px] _[44px] bg-white/10 backdrop-blur-sm rounded-[36px] overflow-hidden"
      >
        {children}
      </div>

      {/* Optional: subtle glare/reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};