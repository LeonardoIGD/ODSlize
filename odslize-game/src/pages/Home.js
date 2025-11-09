import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

const HelpCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9,9a3,3 0 1,1 6,0c0,2 -3,3 -3,3"/>
    <path d="m12,17h.01"/>
  </svg>
);

const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m18,6-12,12"/>
    <path d="m6,6 12,12"/>
  </svg>
);

const Globe = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12,2a15.3,15.3 0 0 1 4,10 15.3,15.3 0 0 1 -4,10 15.3,15.3 0 0 1 -4,-10 15.3,15.3 0 0 1 4,-10z"/>
  </svg>
);

const Leaf = ({ className, fill }) => (
  <svg className={className} fill={fill || "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17,8C8,10 5.9,16.17 3.82,21.34l1.06,.82L12,14l6.18,7.16c0,0 1.12-.74 3.18,-2.51C18,14.5 17,10.5 17,8z"/>
    <path d="M2.27,21.7l9.73-9.73"/>
  </svg>
);

const Recycle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M7 19H6.5a2.5 2.5 0 0 1 0-5H14"/>
    <path d="m14 19-3-3 3-3"/>
    <path d="M9 12h7.5a2.5 2.5 0 0 1 0 5H11"/>
    <path d="m11 17 3 3-3 3"/>
  </svg>
);

const Home = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  const handleStartGame = () => {
    localStorage.setItem('autoStartGame', 'true');
    localStorage.setItem('autoStartLevel', '1');
    
    navigate('/game');
  };

  return (
    <div className="modern-home-container">
      <div className="background-elements">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="floating-element floating-teal"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="floating-element floating-orange"
        />
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowTutorial(true)}
        className="help-button"
        aria-label="Ajuda"
      >
        <HelpCircle className="help-icon" />
      </motion.button>

      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="tutorial-overlay"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="tutorial-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTutorial(false)}
                className="tutorial-close"
              >
                <X className="close-icon" />
              </button>

            <div className="tutorial-content">
              <div className="tutorial-header">
                <div className="tutorial-icon">
                  <HelpCircle className="header-icon" />
                </div>
                <h2 className="tutorial-title">Como Jogar</h2>
                <p className="tutorial-subtitle">
                  Aprenda a resolver os puzzles dos ODS
                </p>
              </div>

              <div className="tutorial-steps">
                <div className="tutorial-step">
                  <div className="step-circle step-teal">1</div>
                  <div className="step-text">
                    <h3 className="step-title">Objetivo do Jogo</h3>
                    <p>Organize as peças deslizantes para montar a imagem completa do ODS. Use a imagem de referência como guia!</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-circle step-orange">2</div>
                  <div className="step-text">
                    <h3 className="step-title">Como Mover</h3>
                    <p>Clique nas peças destacadas (com borda laranja) para movê-las para o espaço vazio. Apenas peças adjacentes ao espaço vazio podem ser movidas.</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-circle step-teal">3</div>
                  <div className="step-text">
                    <h3 className="step-title">Controles</h3>
                    <p>Use os botões no topo da tela:</p>
                    <ul className="controls-list">
                      <li><strong>Iniciar:</strong> embaralha e começa o jogo</li>
                      <li><strong>Reiniciar:</strong> volta ao estado inicial</li>
                    </ul>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-circle step-orange">4</div>
                  <div className="step-text">
                    <h3 className="step-title">Dica Importante</h3>
                    <p>Observe a <strong>imagem de referência</strong> ao lado do tabuleiro. Ela mostra como a imagem deve ficar quando montada corretamente!</p>
                  </div>
                </div>

                <div className="tutorial-step">
                  <div className="step-circle step-teal">5</div>
                  <div className="step-text">
                    <h3 className="step-title">Desempenho e Progressão</h3>
                    <p>Acompanhe seu tempo e movimentos. Complete níveis para desbloquear novos desafios: 2x2, 3x3, 4x4 e Especial!</p>
                  </div>
                </div>
              </div>

              <div className="tutorial-footer">
                <div className="tutorial-footer-text">
                  <Leaf className="footer-icon" />
                  <p>Divirta-se aprendendo sobre sustentabilidade!</p>
                  <Globe className="footer-icon" />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTutorial(false)}
                className="tutorial-play-button"
              >
                Entendi! Vamos Jogar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="main-content">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-section"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="title-section"
          >
            <motion.h1 className="hero-title">
              <span className="title-text">ODSlize</span>
            </motion.h1>
            <p className="hero-subtitle">
              Descubra os <strong>17 ODS da ONU</strong> através de puzzles interativos!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="feature-pills"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="feature-pill"
            >
              <Recycle className="pill-icon" />
              <span>Desafios Educativos</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="feature-pill"
            >
              <Globe className="pill-icon" />
              <span>17 Objetivos</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="feature-pill"
            >
              <Leaf className="pill-icon" />
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
            className="giant-start-button"
          >
            <Globe className="start-icon" />
            <span>Jogar Agora!</span>
          </motion.button>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="modern-footer"
      >
        <div className="footer-content">
          <p className="footer-copyright">
            © 2025 ODSlize - Baseado nos Objetivos de Desenvolvimento Sustentável da ONU
          </p>
          <p className="footer-info">
            Projeto de Gerência de Configuração e Mudanças
          </p>
          <a
            href="https://brasil.un.org/pt-br/sdgs"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <span>Saiba mais sobre os ODS</span>
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
