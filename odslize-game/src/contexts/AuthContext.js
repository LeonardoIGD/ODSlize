import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false, 
        loading: false 
      };
    case 'SET_AVAILABLE':
      return { ...state, isAvailable: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isAvailable: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    try {
      const isAvailable = authService.isAvailable();
      dispatch({ type: 'SET_AVAILABLE', payload: isAvailable });

      if (!isAvailable) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      await checkAuthState();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkAuthState = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        const userInfo = await authService.getUserInfo();
        dispatch({ type: 'SET_USER', payload: userInfo });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const signUp = async (email, password, username = '') => {
    if (!authService.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await authService.signUp(email, password, username);
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const confirmRegistration = async (email, confirmationCode) => {
    if (!authService.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.confirmRegistration(email, confirmationCode);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signIn = async (email, password) => {
    if (!authService.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await authService.signIn(email, password);
      const userInfo = await authService.getUserInfo();
      
      // Migrar scores locais para o usuário autenticado
      const { scoreService } = await import('../services/scoreService');
      await scoreService.migrateLocalScoresToUser(userInfo.userId);
      
      dispatch({ type: 'SET_USER', payload: userInfo });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const signOut = () => {
    if (authService.isAvailable()) {
      authService.signOut();
    }
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const resendConfirmationCode = async (email) => {
    if (!authService.isAvailable()) {
      throw new Error('Authentication service not available');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await authService.resendConfirmationCode(email);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    signUp,
    confirmRegistration,
    signIn,
    signOut,
    clearError,
    resendConfirmationCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};