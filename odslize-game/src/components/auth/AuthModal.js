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

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const { signIn, signUp, confirmRegistration, resendConfirmationCode, forgotPassword, confirmPassword, error, clearError, isAvailable } = useAuth();

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmationCode('');
    setNeedsConfirmation(false);
    setPendingEmail('');
    setForgotEmail('');
    setNeedsPasswordReset(false);
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    clearError();
  };

  const handleClose = () => {
    resetForms();
    setActiveTab('login');
    setNeedsPasswordReset(false);
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
      const username = signupUsername.trim() || signupEmail.split('@')[0];
      await signUp(signupEmail, signupPassword, username);
      // Salvar username para confirmação (agora Cognito usa username como identificador)
      setPendingEmail(username);
      setNeedsConfirmation(true);
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
      // Usar username para confirmação (agora Cognito usa username como identificador)
      await confirmRegistration(pendingEmail, confirmationCode);
      setNeedsConfirmation(false);
      setPendingEmail('');
      setActiveTab('login');
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
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await forgotPassword(forgotEmail);
      setPendingEmail(forgotEmail);
      setNeedsPasswordReset(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    if (newPassword !== confirmNewPassword) {
      setIsLoading(false);
      return;
    }

    try {
      await confirmPassword(pendingEmail, resetCode, newPassword);
      setNeedsPasswordReset(false);
      setPendingEmail('');
      setActiveTab('login');
    } catch (error) {
      console.error('Reset password error:', error);
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
            className="auth-modal-overlay"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="auth-modal-container"
            >
              <button
                onClick={handleClose}
                className="auth-modal-close-btn"
              >
                <X className="auth-modal-close-icon" />
              </button>
              <div className="auth-modal-unavailable">
                <h2 className="auth-modal-unavailable-title">Autenticação Indisponível</h2>
                <p className="auth-modal-unavailable-message">O serviço de autenticação não está configurado.</p>
                <p className="auth-modal-unavailable-message">Você pode continuar jogando sem fazer login.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="auth-modal-btn-primary auth-modal-full-width"
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
        className="auth-modal-overlay"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="auth-modal-container"
        >
          <button
            onClick={handleClose}
            className="auth-modal-close-btn"
          >
            <X className="auth-modal-close-icon" />
          </button>

          {needsConfirmation ? (
            <>
              <div className="auth-modal-header">
                <div className="auth-modal-header-content">
                  <div className="auth-modal-header-icon">
                    <KeyRound className="auth-modal-icon-large" />
                  </div>
                  <h2 className="auth-modal-title">Confirmar Conta</h2>
                </div>
                <p className="auth-modal-header-subtitle">Digite o código enviado para seu email</p>
              </div>

              <div className="auth-modal-content">
                {error && <div className="auth-modal-error-message">{error}</div>}
                
                <div className="auth-modal-confirmation-info">
                  <p>Enviamos um código de confirmação para:</p>
                  <strong className="auth-modal-confirmation-email">{pendingEmail}</strong>
                </div>
                
                <form onSubmit={handleConfirmation} className="auth-modal-form">
                  <div className="auth-modal-form-group">
                    <label htmlFor="confirmationCode" className="auth-modal-form-label">
                      Código de Confirmação
                    </label>
                    <div className="auth-modal-input-container">
                      <KeyRound className="auth-modal-input-icon" />
                      <input
                        type="text"
                        id="confirmationCode"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        placeholder="Digite o código recebido"
                        required
                        maxLength={6}
                        className="auth-modal-form-input auth-modal-with-icon"
                      />
                    </div>
                  </div>

                  <div className="auth-modal-actions">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || confirmationCode.length !== 6}
                      className="auth-modal-btn-primary auth-modal-full-width"
                    >
                      {isLoading ? (
                        <>
                          <div className="auth-modal-loading-spinner" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <KeyRound className="auth-modal-btn-icon" />
                          Confirmar Conta
                        </>
                      )}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="auth-modal-btn-link auth-modal-full-width"
                    >
                      Reenviar Código
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="auth-modal-header">
                <div className="auth-modal-header-content">
                  <div className="auth-modal-header-icon">
                    {activeTab === 'forgot' ? (
                      <KeyRound className="auth-modal-icon-large" />
                    ) : (
                      <LogIn className="auth-modal-icon-large" />
                    )}
                  </div>
                  <h2 className="auth-modal-title">
                    {activeTab === 'login' ? 'Entrar' : 
                     activeTab === 'forgot' ? 'Recuperar Senha' : 'Criar Conta'}
                  </h2>
                </div>
                <p className="auth-modal-header-subtitle">
                  {activeTab === 'login' 
                    ? 'Entre com seu email ou nome de usuário'
                    : activeTab === 'forgot'
                    ? needsPasswordReset 
                      ? 'Digite o código e sua nova senha'
                      : 'Informe seu email para recuperar o acesso'
                    : 'Crie uma conta para competir'
                  }
                </p>
              </div>

              <div className="auth-modal-tabs">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`auth-modal-tab-button ${
                    activeTab === 'login' ? 'auth-modal-active' : ''
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`auth-modal-tab-button ${
                    activeTab === 'signup' ? 'auth-modal-active' : ''
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              <div className="auth-modal-content">
                {error && <div className="auth-modal-error-message">{error}</div>}

                {activeTab === 'login' && (
                  <form onSubmit={handleLogin} className="auth-modal-form">
                    <div className="auth-modal-form-group">
                      <label htmlFor="loginEmail" className="auth-modal-form-label">
                        Email ou Nome de Usuário
                      </label>
                      <div className="auth-modal-input-container">
                        <User className="auth-modal-input-icon" />
                        <input
                          type="text"
                          id="loginEmail"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          placeholder="seu@email.com ou username"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="loginPassword" className="auth-modal-form-label">
                        Senha
                      </label>
                      <div className="auth-modal-input-container">
                        <Lock className="auth-modal-input-icon" />
                        <input
                          type="password"
                          id="loginPassword"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="auth-modal-btn-primary auth-modal-full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="auth-modal-loading-spinner" />
                            Entrando...
                          </>
                        ) : (
                          <>
                            <LogIn className="auth-modal-btn-icon" />
                            Entrar
                          </>
                        )}
                      </motion.button>
                      
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="auth-modal-btn-link"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'forgot' && !needsPasswordReset && (
                  <form onSubmit={handleForgotPassword} className="auth-modal-form">
                    <p className="auth-modal-forgot-description">
                      Digite seu email e enviaremos instruções para recuperar sua senha.
                    </p>

                    <div className="auth-modal-form-group">
                      <label htmlFor="forgotEmail" className="auth-modal-form-label">
                        Email
                      </label>
                      <div className="auth-modal-input-container">
                        <Mail className="auth-modal-input-icon" />
                        <input
                          type="email"
                          id="forgotEmail"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="auth-modal-btn-primary auth-modal-full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="auth-modal-loading-spinner" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <KeyRound className="auth-modal-btn-icon" />
                            Enviar Instruções
                          </>
                        )}
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="auth-modal-btn-link auth-modal-full-width"
                      >
                        Voltar para o login
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'forgot' && needsPasswordReset && (
                  <form onSubmit={handleResetPassword} className="auth-modal-form">
                    <div className="auth-modal-confirmation-info">
                      <p>Enviamos um código de recuperação para:</p>
                      <strong className="auth-modal-confirmation-email">{pendingEmail}</strong>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="resetCode" className="auth-modal-form-label">
                        Código de Recuperação
                      </label>
                      <div className="auth-modal-input-container">
                        <KeyRound className="auth-modal-input-icon" />
                        <input
                          type="text"
                          id="resetCode"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          placeholder="Digite o código recebido"
                          required
                          maxLength={6}
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="newPassword" className="auth-modal-form-label">
                        Nova Senha
                      </label>
                      <div className="auth-modal-input-container">
                        <Lock className="auth-modal-input-icon" />
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="confirmNewPassword" className="auth-modal-form-label">
                        Confirmar Nova Senha
                      </label>
                      <div className="auth-modal-input-container">
                        <Lock className="auth-modal-input-icon" />
                        <input
                          type="password"
                          id="confirmNewPassword"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                      <small className="auth-modal-password-hint">Mínimo de 8 caracteres, uma letra maiúscula e um número</small>
                    </div>

                    <div className="auth-modal-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading || resetCode.length !== 6 || newPassword !== confirmNewPassword}
                        className="auth-modal-btn-primary auth-modal-full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="auth-modal-loading-spinner" />
                            Alterando senha...
                          </>
                        ) : (
                          <>
                            <KeyRound className="auth-modal-btn-icon" />
                            Alterar Senha
                          </>
                        )}
                      </motion.button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setNeedsPasswordReset(false);
                          setActiveTab('login');
                        }}
                        className="auth-modal-btn-link auth-modal-full-width"
                      >
                        Voltar para o login
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'signup' && (
                  <form onSubmit={handleSignup} className="auth-modal-form">
                    <div className="auth-modal-form-group">
                      <label htmlFor="signupUsername" className="auth-modal-form-label">
                        Nome de Usuário
                      </label>
                      <div className="auth-modal-input-container">
                        <User className="auth-modal-input-icon" />
                        <input
                          type="text"
                          id="signupUsername"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          placeholder="Como você gostaria de ser chamado"
                          maxLength={50}
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="signupEmail" className="auth-modal-form-label">
                        Email
                      </label>
                      <div className="auth-modal-input-container">
                        <Mail className="auth-modal-input-icon" />
                        <input
                          type="email"
                          id="signupEmail"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          placeholder="seu@email.com"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                    </div>

                    <div className="auth-modal-form-group">
                      <label htmlFor="signupPassword" className="auth-modal-form-label">
                        Senha
                      </label>
                      <div className="auth-modal-input-container">
                        <Lock className="auth-modal-input-icon" />
                        <input
                          type="password"
                          id="signupPassword"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="••••••••"
                          className="auth-modal-form-input auth-modal-with-icon"
                        />
                      </div>
                      <small className="auth-modal-password-hint">Mínimo de 6 caracteres, uma letra maiúscula e um número</small>
                    </div>

                    <div className="auth-modal-actions">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="auth-modal-btn-secondary auth-modal-full-width"
                      >
                        {isLoading ? (
                          <>
                            <div className="auth-modal-loading-spinner" />
                            Criando conta...
                          </>
                        ) : (
                          <>
                            <UserPlus className="auth-modal-btn-icon" />
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