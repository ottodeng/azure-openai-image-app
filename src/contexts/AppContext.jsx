import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_CONFIG, DEFAULT_GENERATION_PARAMS, DEFAULT_EDIT_PARAMS } from '../types/api.js';

// Action types
const ActionTypes = {
  SET_CONFIG: 'SET_CONFIG',
  SET_GENERATION_PARAMS: 'SET_GENERATION_PARAMS',
  SET_EDIT_PARAMS: 'SET_EDIT_PARAMS',
  SET_GENERATION_LOADING: 'SET_GENERATION_LOADING',
  SET_EDIT_LOADING: 'SET_EDIT_LOADING',
  SET_GENERATION_RESULTS: 'SET_GENERATION_RESULTS',
  SET_EDIT_RESULTS: 'SET_EDIT_RESULTS',
  SET_GENERATION_ERROR: 'SET_GENERATION_ERROR',
  SET_EDIT_ERROR: 'SET_EDIT_ERROR',
  ADD_TO_GALLERY: 'ADD_TO_GALLERY',
  CLEAR_GALLERY: 'CLEAR_GALLERY',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB'
};

// Initial state
const initialState = {
  config: DEFAULT_CONFIG,
  activeTab: 'generate', // 'generate' or 'edit'
  generation: {
    params: DEFAULT_GENERATION_PARAMS,
    prompt: '',
    results: [],
    loading: false,
    error: null
  },
  editing: {
    params: DEFAULT_EDIT_PARAMS,
    prompt: '',
    images: [],
    mask: null,
    results: [],
    loading: false,
    error: null
  },
  gallery: []
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };

    case ActionTypes.SET_GENERATION_PARAMS:
      return {
        ...state,
        generation: {
          ...state.generation,
          params: { ...state.generation.params, ...action.payload }
        }
      };

    case ActionTypes.SET_EDIT_PARAMS:
      return {
        ...state,
        editing: {
          ...state.editing,
          params: { ...state.editing.params, ...action.payload }
        }
      };

    case ActionTypes.SET_GENERATION_LOADING:
      return {
        ...state,
        generation: {
          ...state.generation,
          loading: action.payload,
          error: action.payload ? null : state.generation.error
        }
      };

    case ActionTypes.SET_EDIT_LOADING:
      return {
        ...state,
        editing: {
          ...state.editing,
          loading: action.payload,
          error: action.payload ? null : state.editing.error
        }
      };

    case ActionTypes.SET_GENERATION_RESULTS:
      return {
        ...state,
        generation: {
          ...state.generation,
          results: action.payload,
          loading: false,
          error: null
        }
      };

    case ActionTypes.SET_EDIT_RESULTS:
      return {
        ...state,
        editing: {
          ...state.editing,
          results: action.payload,
          loading: false,
          error: null
        }
      };

    case ActionTypes.SET_GENERATION_ERROR:
      return {
        ...state,
        generation: {
          ...state.generation,
          error: action.payload,
          loading: false
        }
      };

    case ActionTypes.SET_EDIT_ERROR:
      return {
        ...state,
        editing: {
          ...state.editing,
          error: action.payload,
          loading: false
        }
      };

    case ActionTypes.ADD_TO_GALLERY:
      return {
        ...state,
        gallery: [...state.gallery, ...action.payload]
      };

    case ActionTypes.CLEAR_GALLERY:
      return {
        ...state,
        gallery: []
      };

    case ActionTypes.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('azureOpenAIConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        dispatch({ type: ActionTypes.SET_CONFIG, payload: config });
      } catch (error) {
        console.error('Failed to load saved config:', error);
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    if (state.config.apiKey || state.config.endpoint) {
      localStorage.setItem('azureOpenAIConfig', JSON.stringify(state.config));
    }
  }, [state.config]);

  // Action creators
  const actions = {
    setConfig: (config) => dispatch({ type: ActionTypes.SET_CONFIG, payload: config }),
    setGenerationParams: (params) => dispatch({ type: ActionTypes.SET_GENERATION_PARAMS, payload: params }),
    setEditParams: (params) => dispatch({ type: ActionTypes.SET_EDIT_PARAMS, payload: params }),
    setGenerationLoading: (loading) => dispatch({ type: ActionTypes.SET_GENERATION_LOADING, payload: loading }),
    setEditLoading: (loading) => dispatch({ type: ActionTypes.SET_EDIT_LOADING, payload: loading }),
    setGenerationResults: (results) => dispatch({ type: ActionTypes.SET_GENERATION_RESULTS, payload: results }),
    setEditResults: (results) => dispatch({ type: ActionTypes.SET_EDIT_RESULTS, payload: results }),
    setGenerationError: (error) => dispatch({ type: ActionTypes.SET_GENERATION_ERROR, payload: error }),
    setEditError: (error) => dispatch({ type: ActionTypes.SET_EDIT_ERROR, payload: error }),
    addToGallery: (images) => dispatch({ type: ActionTypes.ADD_TO_GALLERY, payload: images }),
    clearGallery: () => dispatch({ type: ActionTypes.CLEAR_GALLERY }),
    setActiveTab: (tab) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab })
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

