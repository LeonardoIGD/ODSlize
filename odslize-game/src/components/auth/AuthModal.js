import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

export const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const { signIn, signUp, confirmRegistration, resendConfirmationCode, error, clearError, isAvailable } = useAuth();

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmationCode('');
    setNeedsConfirmation(false);
    setPendingEmail('');
    clearError();
  };

  const handleClose = () => {
    resetForms();
    setActiveTab('login');
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await signIn(loginEmail, loginPassword);
      handleClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await signUp(signupEmail, signupPassword, signupUsername);
      setPendingEmail(signupEmail);
      setNeedsConfirmation(true);
      alert('Conta criada! Verifique seu email para o código de confirmação.');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await confirmRegistration(pendingEmail, confirmationCode);
      setNeedsConfirmation(false);
      setPendingEmail('');
      setActiveTab('login');
      alert('Conta confirmada! Faça login agora.');
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await resendConfirmationCode(pendingEmail);
      alert('Código reenviado! Verifique seu email.');
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-container"
            >
              <button
                onClick={handleClose}
                className="modal-close-btn"
              >
                <X className="close-icon" />
              </button>
              <div className="auth-unavailable">
                <h2 className="unavailable-title">Autenticação Indisponível</h2>
                <p className="unavailable-message">O serviço de autenticação não está configurado.</p>
                <p className="unavailable-message">Você pode continuar jogando sem fazer login.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="btn-primary full-width"
                >
                  Continuar sem Login
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="modal-container"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="modal-close-btn"
          >
            <X className="close-icon" />
          </button>

          {needsConfirmation ? (
            // Confirmation Screen
            <>
              {/* Header */}
              <div className="modal-header">
                <div className="header-content">
                  <div className="header-icon">
                    <KeyRound className="icon-large" />
                  </div>
                  <h2 className="modal-title">Confirmar Conta</h2>
                </div>
                <p className="header-subtitle">Digite o código enviado para seu email</p>
              </div>

              {/* Content */}
              <div className="modal-content">
                {error && <div className="error-message">{error}</div>}
                
                <div className="confirmation-info">
                  <p>Enviamos um código de confirmação para:</p>
                  <strong className="confirmation-email">{pendingEmail}</strong>
                </div>
                
                <form onSubmit={handleConfirmation} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="confirmationCode" className="form-label">
                      Código de Confirmação
                    </label>
                    <div className="input-container">
                      <KeyRound className="input-icon" />
                      <input
                        type="text"
                        id="confirmationCode"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        placeholder="Digite o código recebido"
                        required
                        maxLength={6}
                        className="form-input with-icon"
                      />
                    </div>
                  </div>

                  <div className="auth-actions">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || confirmationCode.length !== 6}
                      className="btn-primary full-width"
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <KeyRound className="btn-icon" />
                          Confirmar Conta
                        </>
                      )}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="btn-link full-width"
                    >
                      Reenviar Código
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Main Auth Screen
            <>
              {/* Header */}
              <div className="modal-header">
                <div className="header-content">
                  <div className="header-icon">
                    <LogIn className="icon-large" />
                  </div>
                  <h2 className="modal-title">
                    {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
                  </h2>
                </div>
                <p className="header-subtitle">
                  {activeTab === 'login' 
                    ? 'Entre para salvar seu progresso'
                    : 'Crie uma conta para competir'
                  }
                </p>
              </div>

              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`tab-button ${
                    activeTab === 'login' ? 'active' : ''
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`tab-button ${
                    activeTab === 'signup' ? 'active' : ''
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* Content */}
              <div className="modal-content">
                {error && <div className="error-message">{error}</div>}
                
                {/* Login Form */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="loginEmail" className="form-label">
                        Email
                      </label>
                      <div className="input-container">
                        <Mail className="input-icon" />
                        <input
                          type="email"
                          id="loginEmail"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                          className="form-input with-icon"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="loginPassword" className="form-label">
                        Senha
                      </label>
                      <div className="input-container">
                        <Lock className="input-icon" />
                        <input
                          type="password"
                          id="loginPassword"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="form-input with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="loading-spinner" />
                            Entrando...
                          </>
                        ) : (
                          <>
                            <LogIn className="btn-icon" />
                            Entrar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}

                {/* Signup Form */}
                {activeTab === 'signup' && (
                  <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                      <label htmlFor="signupUsername" className="form-label">
                        Nome de Usuário (opcional)
                      </label>
                      <div className="input-container">
                        <User className="input-icon" />
                        <input
                          type="text"
                          id="signupUsername"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="Como você gostaria de ser chamado"
                          maxLength={50}
                          className="form-input with-icon"
                        />
                      </div>
                      <small className="username-hint">Se não preenchido, usaremos seu email</small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupEmail" className="form-label">
                        Email
                      </label>
                      <div className="input-container">
                        <Mail className="input-icon" />
                        <input
                          type="email"
                          id="signupEmail"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                          className="form-input with-icon"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signupPassword" className="form-label">
                        Senha
                      </label>
                      <div className="input-container">
                        <Lock className="input-icon" />
                        <input
                          type="password"
                          id="signupPassword"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="form-input with-icon"
                        />
                      </div>
                      <small className="password-hint">Mínimo de 8 caracteres</small>
                    </div>

                    <div className="auth-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="btn-secondary full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="loading-spinner" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <UserPlus className="btn-icon" />
                            Criar Conta
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};