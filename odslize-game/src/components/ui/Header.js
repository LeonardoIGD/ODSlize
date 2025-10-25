import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <h1 className="header-title">ODSlize</h1>
      <nav className="header-nav">
        <Link to="/" className="header-link">Home</Link>
        <Link to="/game" className="header-link">Game</Link>
      </nav>
    </header>
  );
}
