import React, { createContext, useContext, useState, useEffect } from 'react';

interface CMSData {
  [language: string]: {
    [section: string]: Record<string, any>;
  };
}

interface CMSContextProps {
  cmsData: CMSData;
  setCMSData: React.Dispatch<React.SetStateAction<CMSData>>;
  currentLanguage: string;
  setCurrentLanguage: React.Dispatch<React.SetStateAction<string>>;
  currentSection: string;
  setCurrentSection: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string | null;
}

const CMSContext = createContext<CMSContextProps | null>(null);

export const useCMSContext = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
};

interface CMSProviderProps {
  children: React.ReactNode;
}

export const CMSProvider = ({ children }: CMSProviderProps) => {
  const [cmsData, setCMSData] = useState<CMSData>({});
  const [currentLanguage, setCurrentLanguage] = useState<string>('it');
  const [currentSection, setCurrentSection] = useState<string>('welcome');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCMSData = async () => {
      try {
        setIsLoading(true);
        // Fetch from the API endpoint
        const response = await fetch('/api/cms/content');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CMSData = await response.json();
        setCMSData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load CMS data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCMSData({}); // Reset to empty object on error
      } finally {
        setIsLoading(false);
      }
    };

    loadCMSData();
  }, []);

  const value: CMSContextProps = {
    cmsData,
    setCMSData,
    currentLanguage,
    setCurrentLanguage,
    currentSection,
    setCurrentSection,
    isLoading,
    error
  };

  return (
    <CMSContext.Provider value={value}>
      {children}
    </CMSContext.Provider>
  );
};
