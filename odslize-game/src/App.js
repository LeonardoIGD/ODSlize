
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import GamePage from './pages/GamePage';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
