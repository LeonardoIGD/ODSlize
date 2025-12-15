
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import GamePage from './pages/GamePage';

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
