import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfileModal.css';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, signOut, deleteUserAccount } = useAuth();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'Apagar conta') {
      setDeleteError('Digite exatamente "Apagar conta" para confirmar');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteUserAccount();
      onClose();
      // O usuário será automaticamente deslogado após deletar a conta
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      setDeleteError('Erro ao deletar conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationText('');
    setDeleteError('');
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="user-profile-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="user-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="user-profile-close"
              aria-label="Fechar"
            >
              <X className="close-icon" />
            </button>

            <div className="user-profile-content">
              {showDeleteConfirmation === false ? (
                <>
                  <div className="user-profile-header">
                    <div className="user-avatar-large">
                      <User className="avatar-icon" />
                    </div>
                    <h2 className="user-profile-title">Meu Perfil</h2>
                  </div>

                  <div className="user-profile-info">
                    <div className="user-info-row">
                      <div className="user-info-label">Nome de usuário:</div>
                      <span className="user-info-value">{user.displayName || user.username}</span>
                    </div>
                    <div className="user-info-row">
                      <div className="user-info-label">E-mail:</div>
                      <span className="user-info-value">{user.email}</span>
                    </div>
                  </div>

                  <div className="user-profile-actions">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="profile-action-button logout-button"
                    >
                      <LogOut className="button-icon" />
                      <span>Sair da Conta</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="profile-action-button delete-button"
                    >
                      <Trash2 className="button-icon" />
                      <span>Apagar Conta</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="delete-confirmation-header">
                    <div className="warning-icon-container">
                      <AlertTriangle className="warning-icon" />
                    </div>
                    <h2 className="delete-confirmation-title">Confirmar Exclusão</h2>
                    <p className="delete-confirmation-subtitle">
                      Esta ação é irreversível e todos os seus dados serão permanentemente perdidos.
                    </p>
                  </div>

                  <div className="delete-confirmation-content">
                    <p className="delete-instruction">
                      Para confirmar a exclusão da sua conta, digite exatamente:
                    </p>
                    <div className="delete-text-highlight">
                      <strong>Apagar conta</strong>
                    </div>

                    <div className="delete-input-container">
                      <input
                        type="text"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="Digite aqui..."
                        className="delete-confirmation-input"
                        autoFocus
                      />
                      {deleteError && (
                        <span className="delete-error">{deleteError}</span>
                      )}
                    </div>
                  </div>

                  <div className="delete-confirmation-actions">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetDeleteConfirmation}
                      className="profile-action-button cancel-button"
                      disabled={isDeleting}
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteAccount}
                      className="profile-action-button confirm-delete-button"
                      disabled={isDeleting || deleteConfirmationText !== 'Apagar conta'}
                    >
                      {isDeleting ? 'Apagando...' : 'Confirmar Exclusão'}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};