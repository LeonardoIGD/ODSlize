import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';
import { UserStats } from '../components/auth/UserStats';
import { useGameState } from '../hooks/game/useGameState';
import { UserProfileModal } from '../components/auth/UserProfileModal';
import { HelpCircle, X, Globe, Leaf, Recycle, User, LogIn } from 'lucide-react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isAuthenticated, user, isAvailable } = useAuth();
  const { startLevel } = useGameState();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setShowProfileModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleStartGame = () => {
    startLevel();
    navigate('/game');
  };

  return (
    <div className="home-modern-container">
      <div className="home-background-elements">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="home-floating-element home-floating-teal"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="home-floating-element home-floating-orange"
        />
      </div>

      <div className="home-top-right-buttons">
        {isAvailable && (
          isAuthenticated && user ? (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="home-login-button"
              aria-label="Perfil do Usuário"
            >
              <div className="home-user-info-inner">
                <div className="home-user-avatar">
                  <User className="home-user-icon" />
                </div>
                <span className="home-user-name">
                  {user.displayName || user.username || user.email || 'Usuário'}
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAuthClick}
              className="home-login-button"
              aria-label="Fazer Login"
            >
              <LogIn className="home-login-icon" />
              <span className="home-login-text">Entrar</span>
            </motion.button>
          )
        )}

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTutorial(true)}
          className="home-help-button-top"
          aria-label="Ajuda"
        >
          <HelpCircle className="home-help-icon-top" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="home-tutorial-overlay"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="home-tutorial-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTutorial(false)}
                className="home-tutorial-close"
              >
                <X className="home-close-icon" />
              </button>

            <div className="home-tutorial-content">
              <div className="home-tutorial-header">
                <div className="home-tutorial-icon">
                  <HelpCircle className="home-header-icon" />
                </div>
                <h2 className="home-tutorial-title">Como Jogar</h2>
                <p className="home-tutorial-subtitle">
                  Aprenda a resolver os puzzles dos ODS
                </p>
              </div>

              <div className="home-tutorial-steps">
                <div className="home-tutorial-step">
                  <div className="home-step-circle home-step-teal">1</div>
                  <div className="home-step-text">
                    <h3 className="home-step-title">Objetivo do Jogo</h3>
                    <p>Organize as peças deslizantes para montar a imagem completa do ODS. Use a imagem de referência como guia!</p>
                  </div>
                </div>

                <div className="home-tutorial-step">
                  <div className="home-step-circle home-step-orange">2</div>
                  <div className="home-step-text">
                    <h3 className="home-step-title">Como Mover</h3>
                    <p>Clique nas peças destacadas (com borda laranja) para movê-las para o espaço vazio. Apenas peças adjacentes ao espaço vazio podem ser movidas.</p>
                  </div>
                </div>

                <div className="home-tutorial-step">
                  <div className="home-step-circle home-step-teal">3</div>
                  <div className="home-step-text">
                    <h3 className="home-step-title">Controles</h3>
                    <p>Use os botões no topo da tela:</p>
                    <ul className="home-controls-list">
                      <li><strong>Iniciar:</strong> embaralha e começa o jogo</li>
                      <li><strong>Reiniciar:</strong> volta ao estado inicial</li>
                    </ul>
                  </div>
                </div>

                <div className="home-tutorial-step">
                  <div className="home-step-circle home-step-orange">4</div>
                  <div className="home-step-text">
                    <h3 className="home-step-title">Dica Importante</h3>
                    <p>Observe a <strong>imagem de referência</strong> ao lado do tabuleiro. Ela mostra como a imagem deve ficar quando montada corretamente!</p>
                  </div>
                </div>

                <div className="home-tutorial-step">
                  <div className="home-step-circle home-step-teal">5</div>
                  <div className="home-step-text">
                    <h3 className="home-step-title">Desempenho e Progressão</h3>
                    <p>Acompanhe seu tempo e movimentos. Complete níveis para desbloquear novos desafios: 2x2, 3x3, 4x4 e Especial!</p>
                  </div>
                </div>
              </div>

              <div className="home-tutorial-footer">
                <div className="home-tutorial-footer-text">
                  <Leaf className="home-footer-icon" />
                  <p>Divirta-se aprendendo sobre sustentabilidade!</p>
                  <Globe className="home-footer-icon" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTutorial(false)}
                className="home-tutorial-play-button"
              >
                Entendi! Vamos Jogar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="home-main-content">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="home-hero-section"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="home-title-section"
          >
            <motion.h1 className="home-hero-title">
              <span className="home-title-text">ODSlize</span>
            </motion.h1>
            <p className="home-hero-subtitle">
              Descubra os <strong>17 ODS da ONU</strong> através de puzzles interativos!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="home-feature-pills"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="home-feature-pill"
            >
              <Recycle className="home-pill-icon" />
              <span>Desafios Educativos</span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="home-feature-pill"
            >
              <Globe className="home-pill-icon" />
              <span>17 Objetivos</span>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="home-feature-pill"
            >
              <Leaf className="home-pill-icon" />
              <span>Sustentabilidade</span>
            </motion.div>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleStartGame}
            className="home-giant-start-button"
          >
            <span>Jogar Agora!</span>
          </motion.button>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="home-modern-footer"
      >
        <div className="home-footer-content">
          <p className="home-footer-copyright">
            © 2025 ODSlize - Baseado nos Objetivos de Desenvolvimento Sustentável da ONU
          </p>
          <p className="home-footer-info">
            Projeto de Gerência de Configuração e Mudanças
          </p>
          <a
            href="https://brasil.un.org/pt-br/sdgs"
            target="_blank"
            rel="noopener noreferrer"
            className="home-footer-link"
          >
            <span>Saiba mais sobre os ODS</span>
          </a>
        </div>
      </motion.footer>

      {/* Modais */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <UserStats 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

      <UserProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Home;
