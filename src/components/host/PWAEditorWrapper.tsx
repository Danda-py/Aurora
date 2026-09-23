import React, { useEffect, useRef } from 'react';

interface PWAEditorWrapperProps {
  iframeRef: React.MutableRefObject<HTMLIFrameElement | null>;
  isEditMode: boolean;
  initialData: Record<string, any>;
  language: string;
  section: string;
  className?: string;
}

export const PWAEditorWrapper = ({
  iframeRef,
  isEditMode,
  initialData,
  language,
  section,
  className = ''
}: PWAEditorWrapperProps) => {
  useEffect(() => {
    if (!iframeRef.current) return;

    // Initialize the PWA app in edit mode via postMessage once iframe loads
    const initializeEditor = () => {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'PWA_INIT_EDITOR',
          payload: {
            isEditMode,
            language,
            section,
            initialData,
            // Enable WYSIWYG features
            features: {
              inlineTextEditing: true,
              contextualPickers: true,
              blockManipulation: true,
              livePreview: true
            }
          }
        },
        '*'
      );
    };

    // Wait for iframe to load
    if (iframeRef.current.contentDocument?.readyState === 'complete') {
      initializeEditor();
    } else {
      const handleLoad = () => {
        initializeEditor();
        iframeRef.current.removeEventListener('load', handleLoad);
      };
      iframeRef.current.addEventListener('load', handleLoad);
    }

    // Cleanup
    return () => {
      iframeRef.current.removeEventListener('load', initializeEditor as any);
    };
  }, [iframeRef, isEditMode, initialData, language, section]);

  // Load the actual PWA app with edit mode flag
  return (
    <iframe
      ref={iframeRef}
      src={`/index.html?cmsEditMode=true&lang=${language}&section=${section}&t=${Date.now()}`}
      title="PWA Editor - Aurora in Valtellina"
      className={`w-full h-full border-0 rounded-[36px] ${className}`}
      allow="camera *; microphone *; clipboard-write *"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      style={{
        backgroundColor: 'black' // Default background while loading
      }}
    />
  );
};
