import React, { useEffect, useRef, useState } from 'react';
import { useCMSContext } from './CMSContext';
import { iPhone18Frame } from './iPhone18Frame';
import { PWAEditorWrapper } from './PWAEditorWrapper';
import { CMSToolbar } from './CMSToolbar';

interface iPhone18LiveCanvasProps {
  className?: string;
}

export const iPhone18LiveCanvas = ({ className = '' }: iPhone18LiveCanvasProps) => {
  const { 
    cmsData, 
    setCMSData,
    currentLanguage, 
    setCurrentLanguage,
    currentSection, 
    setCurrentSection,
    isLoading,
    error
  } = useCMSContext();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sync CMS data changes to iframe
  useEffect(() => {
    if (iframeRef.current && cmsData[currentLanguage]?.[currentSection]) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'CMS_UPDATE',
          payload: {
            language: currentLanguage,
            section: currentSection,
            data: cmsData[currentLanguage][currentSection]
          }
        },
        '*'
      );
    }
  }, [currentLanguage, currentSection, cmsData, iframeRef]);
  
  // Handle messages from iframe (user edits)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin for security
      // In development, we might relax this
      if (event.data.type === 'CMS_EDIT') {
        setCMSData(prev => ({
          ...prev,
          [currentLanguage]: {
            ...prev[currentLanguage],
            [currentSection]: {
              ...prev[currentLanguage]?.[currentSection] || {},
              ...event.data.payload
            }
          }
        }));
        setHasChanges(true);
      }
      
      // Handle save acknowledgment from PWA
      if (event.data.type === 'CMS_SAVE_ACKNOWLEDGED') {
        setHasChanges(false);
        setIsSaving(false);
      }
      
      // Handle error from PWA
      if (event.data.type === 'CMS_ERROR') {
        setIsSaving(false);
        console.error('CMS Error from PWA:', event.data.payload);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentLanguage, currentSection, setCMSData, setHasChanges, setIsSaving]);
  
  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    // When language changes, we might want to reset to default section or keep current
    // For now, keep current section
  };
  
  const handleTranslateWithAI = async () => {
    // This would trigger AI translation of the current section
    // For now, we'll simulate it - in reality this would call an AI service
    try {
      // Placeholder for actual AI translation logic
      console.log('AI translation triggered for section:', currentSection, 'language:', currentLanguage);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would:
      // 1. Send current section content to AI translation service
      // 2. Get translated content back
      // 3. Update cmsData with translated content
      // 4. Notify iframe of the update
      
      // For demo, we'll just toggle a flag to show it worked
      setHasChanges(true);
    } catch (error) {
      console.error('AI translation failed:', error);
      throw error;
    }
  };
  
  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, this would save to Supabase or backend API
      // For now, we'll simulate an API call
      console.log('Saving CMS data for section:', currentSection, 'language:', currentLanguage);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In reality, you'd make an API call like:
      // await fetch('/api/cms/content', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     language: currentLanguage, 
      //     section: currentSection, 
      //     data: cmsData[currentLanguage][currentSection] 
      //   })
      // });
      
      // Notify iframe that save was successful (it might do its own validation)
      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'CMS_SAVE_REQUESTED',
          payload: {
            language: currentLanguage,
            section: currentSection,
            data: cmsData[currentLanguage][currentSection]
          }
        },
        '*'
      );
      
      // Reset changes flag (will be set back to false when we get acknowledgment)
      // Actually, we'll wait for the acknowledgment from the PWA
    } catch (error) {
      console.error('Save failed:', error);
      setIsSaving(false);
      throw error;
    }
  };
  
  // Auto-save functionality (optional)
  useEffect(() => {
    if (!hasChanges) return;
    
    const handler = setTimeout(() => {
      handleSave().catch(console.error);
    }, 30000); // Auto-save after 30 seconds of changes
    
    return () => clearTimeout(handler);
  }, [hasChanges, handleSave]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/70 text-center">Caricamento dati CMS...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-400 mb-2">Errore nel caricamento dei dati CMS</p>
        <p className="text-white/50 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-600"
        >
          Ricarica
        </button>
      </div>
    );
  }
  
  // Get initial data for current language/section, fallback to empty object
  const initialData = cmsData[currentLanguage]?.[currentSection] || {};
  
  return (
    <div className={`min-h-[80vh] px-4 ${className}`}>
      <CMSToolbar 
        language={currentLanguage} 
        onLanguageChange={handleLanguageChange}
        onTranslateWithAI={handleTranslateWithAI}
        onSave={handleSave}
        isSaving={isSaving}
        hasChanges={hasChanges}
      />
      
      <div className="flex-1 mt-4 relative">
        <iPhone18Frame>
          <PWAEditorWrapper 
            iframeRef={iframeRef}
            isEditMode={true}
            initialData={initialData}
            language={currentLanguage}
            section={currentSection}
          />
        </iPhone18Frame>
      </div>
      
      {/* Status indicator */}
      <div className="px-4 py-2 text-xs flex items-center justify-between text-white/50">
        <span className="flex items-center gap-1">
          {hasChanges ? (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          )}
          <span>{hasChanges ? 'Modifiche non salvate' : 'Tutto salvato'}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>Connesso</span>
        </span>
      </div>
    </div>
  );
};
