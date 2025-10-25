import './styles/global.css';
import Button from './components/common/Button';
import Modal from './components/common/Modal';
import Header from './components/ui/Header'; // ✅ novo import
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <h1>Bem-vindo ao ODSlize!</h1>

      <Button onClick={() => alert('Clicou!')}>Botão Primário</Button>
      <Button variant="secondary">Botão Secundário</Button>
      <Button disabled>Desabilitado</Button>

      <div style={{ marginTop: '20px' }}>
        <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vitória!"
      >
        <p>Parabéns! Você completou o desafio ODS.</p>
        <p>🌱 Agora você conhece mais sobre o Objetivo de Desenvolvimento Sustentável!</p>
      </Modal>
    </div>
  );
}

function Game() {
  return (
    <div>
      <h1>Página do Jogo</h1>
      <p>Em breve...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Header /> {/* ✅ substitui o <nav> antigo */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
