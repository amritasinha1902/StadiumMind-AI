import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  sidebarOpen: true,
  activeMatch: null,
  notifications: [],
  globalLoading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_ACTIVE_MATCH':
      return { ...state, activeMatch: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_GLOBAL_LOADING':
      return { ...state, globalLoading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar     = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const setSidebar        = useCallback((open) => dispatch({ type: 'SET_SIDEBAR', payload: open }), []);
  const setActiveMatch    = useCallback((match) => dispatch({ type: 'SET_ACTIVE_MATCH', payload: match }), []);
  const addNotification   = useCallback((n) => dispatch({ type: 'ADD_NOTIFICATION', payload: { ...n, read: false, id: Date.now() } }), []);
  const markAllRead       = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), []);
  const clearNotifications = useCallback(() => dispatch({ type: 'CLEAR_NOTIFICATIONS' }), []);
  const setGlobalLoading  = useCallback((v) => dispatch({ type: 'SET_GLOBAL_LOADING', payload: v }), []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setSidebar,
        setActiveMatch,
        addNotification,
        markAllRead,
        clearNotifications,
        setGlobalLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
