import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    // Marca que o jogo deve iniciar automaticamente
    localStorage.setItem('autoStartGame', 'true');
    localStorage.setItem('autoStartLevel', '1');
    
    // Navega para a página do jogo
    navigate('/game');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">ODSlize</h1>
        <p className="home-subtitle">
          Aprenda sobre os Objetivos de Desenvolvimento Sustentável através de puzzles divertidos!
        </p>
      </header>

      <main className="home-main">
        <section className="home-intro">
          <h2>O que são os ODS?</h2>
          <p>
            Os Objetivos de Desenvolvimento Sustentável (ODS) são uma agenda mundial adotada durante a 
            Cúpula das Nações Unidas sobre o Desenvolvimento Sustentável em setembro de 2015. 
            São 17 objetivos interconectados para acabar com a pobreza, proteger o meio ambiente e o clima 
            e garantir que as pessoas, em todos os lugares, possam desfrutar de paz e de prosperidade.
          </p>
        </section>

        <section className="home-game-info">
          <h2>Como Jogar?</h2>
          <div className="game-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Escolha um Nível</h3>
                <p>Cada nível representa um ODS diferente</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Resolva o Puzzle</h3>
                <p>Organize as peças para formar a imagem completa</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Aprenda sobre o ODS</h3>
                <p>Descubra informações importantes sobre cada objetivo</p>
              </div>
            </div>
          </div>
        </section>

        <section className="home-actions">
          <Button size="large" onClick={handleStartGame}>
            🎮 Começar a Jogar
          </Button>
          
          <div className="external-links">
            <a 
              href="https://brasil.un.org/pt-br/sdgs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
            >
              📚 Saiba mais sobre os ODS
            </a>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>
          Desenvolvido para promover o conhecimento sobre os 
          <a 
            href="https://brasil.un.org/pt-br/sdgs" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {' '}Objetivos de Desenvolvimento Sustentável
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;