import React, { createContext, useReducer, useContext, ReactNode } from 'react';

// Define the types for our CMS state
export type BlockType =
  | 'text'
  | 'image'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'gallery';

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  [key: string]: any; // for extensibility
}

export interface Block {
  id: string;
  type: BlockType;
  content: any; // could be text, image URL, etc.
  style: BlockStyle;
  // For reordering, we might want to keep the order in the array index
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  // ... other theme properties
}

export interface CMSState {
  layout: Block[];
  theme: Theme;
  isEditMode: boolean;
  // We can add more global state as needed
}

// Action types for our reducer
export type CMSAction =
  | { type: 'SET_LAYOUT'; payload: Block[] }
  | { type: 'ADD_BLOCK'; payload: Omit<Block, 'id'> }
  | { type: 'UPDATE_BLOCK'; payload: { id: string; updates: Partial<Block> } }
  | { type: 'DELETE_BLOCK'; payload: { id: string } }
  | { type: 'REORDER_BLOCKS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_THEME'; payload: Partial<Theme> }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'RESET_CMS' };

// Default theme
const defaultTheme: Theme = {
  primaryColor: '#3b82f6', // blue-500
  secondaryColor: '#10b981', // emerald-500
  backgroundColor: '#ffffff',
  textColor: '#111827', // gray-900
  fontFamily: 'system-ui, sans-serif',
};

// Initial state
const initialState: CMSState = {
  layout: [],
  theme: defaultTheme,
  isEditMode: false,
};

// Reducer function
function cmsReducer(state: CMSState, action: CMSAction): CMSState {
  switch (action.type) {
    case 'SET_LAYOUT':
      return { ...state, layout: action.payload };
    case 'ADD_BLOCK':
      const newBlock = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9), // simple ID generation
      };
      return { ...state, layout: [...state.layout, newBlock] };
    case 'UPDATE_BLOCK':
      return {
        ...state,
        layout: state.layout.map(block =>
          block.id === action.payload.id ? { ...block, ...action.payload.updates } : block
        ),
      };
    case 'DELETE_BLOCK':
      return {
        ...state,
        layout: state.layout.filter(block => block.id !== action.payload.id),
      };
    case 'REORDER_BLOCKS':
      const { fromIndex, toIndex } = action.payload;
      const newLayout = Array.from(state.layout);
      const [movedBlock] = newLayout.splice(fromIndex, 1);
      newLayout.splice(toIndex, 0, movedBlock);
      return { ...state, layout: newLayout };
    case 'SET_THEME':
      return { ...state, theme: { ...state.theme, ...action.payload } };
    case 'SET_EDIT_MODE':
      return { ...state, isEditMode: action.payload };
    case 'RESET_CMS':
      return initialState;
    default:
      return state;
  }
}

// Create context
const CMSContext = createContext<{
  state: CMSState;
  dispatch: React.Dispatch<CMSAction>;
} | undefined>(undefined);

// Provider component
export const CMSProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cmsReducer, initialState);

  return (
    <CMSContext.Provider value={{ state, dispatch }}>
      {children}
    </CMSContext.Provider>
  );
};

// Custom hook to use the CMS context
export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};