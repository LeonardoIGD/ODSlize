
import './styles/global.css';
import Button from './components/common/Button';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Bem-vindo ao ODSlize!</h1>
      <Button onClick={() => alert('Clicou!')}>Botão Primário</Button>
      <Button variant="secondary">Botão Secundário</Button>
      <Button disabled>Desabilitado</Button>
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
      <nav style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>Home</Link>
        <Link to="/game">Game</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
